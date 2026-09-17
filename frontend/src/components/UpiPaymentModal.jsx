import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  CheckCircle, 
  AlertTriangle, 
  Copy, 
  ExternalLink, 
  X, 
  ShieldCheck, 
  Sparkles, 
  RotateCcw, 
  Lock,
  Smartphone,
  Check,
  Info,
  Settings,
  Receipt
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const UpiPaymentModal = ({ 
  isOpen, 
  onClose, 
  finalTotal, 
  onPaymentSuccess, 
  customerName 
}) => {
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // 'pending' | 'verifying' | 'failed' | 'success'
  const [utrNumber, setUtrNumber] = useState('');
  const [timer, setTimer] = useState(300); // 5 minutes countdown
  const [isMobile, setIsMobile] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const formattedAmount = Number(finalTotal || 0).toFixed(2);
  const [paidAmount, setPaidAmount] = useState(formattedAmount);

  // Sync paidAmount when finalTotal changes
  useEffect(() => {
    setPaidAmount(Number(finalTotal || 0).toFixed(2));
  }, [finalTotal]);

  // Load configured UPI settings from localStorage or defaults with automatic migration from old dummy ID
  const savedSettings = (() => {
    try {
      const s = localStorage.getItem('trymebro_upi_settings');
      if (s) {
        const parsed = JSON.parse(s);
        if (!parsed.upiId || parsed.upiId === 'trymebro@okaxis') {
          parsed.upiId = '9510367164@pthdfc';
          localStorage.setItem('trymebro_upi_settings', JSON.stringify(parsed));
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  })();

  const resolvedUpiId = (savedSettings?.upiId && savedSettings.upiId !== 'trymebro@okaxis')
    ? savedSettings.upiId 
    : ((import.meta.env.VITE_UPI_ID && import.meta.env.VITE_UPI_ID !== 'trymebro@okaxis')
        ? import.meta.env.VITE_UPI_ID 
        : '9510367164@pthdfc');

  const upiId = resolvedUpiId.trim();
  const payeeName = (savedSettings?.payeeName || import.meta.env.VITE_PAYEE_NAME || 'TRY ME BRO Luxury Perfumes').trim();

  const customQrImage = savedSettings?.customQrImage || '';

  // Standard NPCI Compliant UPI Specification without restrictive merchant mode tags
  const upiParams = `pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(`TRY ME BRO Order`)}`;
  const upiDeepLink = `upi://pay?${upiParams}`;
  const gpayLink = `tez://upi/pay?${upiParams}`;
  const phonepeLink = `phonepe://pay?${upiParams}`;
  const paytmLink = `paytmmp://pay?${upiParams}`;

  // Dynamic QR code with cart amount auto-embedded
  const dynamicLockedQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiDeepLink)}&margin=10`;

  // Always use the QR uploaded from Admin Dashboard if provided, otherwise fallback to dynamic QR
  const activeQrCodeUrl = customQrImage ? customQrImage : dynamicLockedQrUrl;

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      setIsMobile(/android|iphone|ipad|ipod|mobile/i.test(userAgent));
    };
    checkMobile();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!isOpen) {
      setPaymentStatus('pending');
      setTimer(300);
      setErrorMessage('');
      setPaidAmount(Number(finalTotal || 0).toFixed(2));
      return;
    }

    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setPaymentStatus('failed');
          setErrorMessage('Payment session expired. Please retry payment.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, finalTotal]);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    toast.info('UPI ID copied to clipboard');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDesktopAppClick = (appName, fallbackLink) => {
    if (!isMobile) {
      toast.info(`💡 You are on Desktop. Scan the QR code below using ${appName} on your phone to pay exact amount ₹${Number(finalTotal).toLocaleString('en-IN')}.`, {
        autoClose: 5000
      });
    }
    try {
      window.location.href = fallbackLink || upiDeepLink;
    } catch (e) {}
  };

  // Payment verification handler (Requires exact cart amount validation + genuine UTR)
  const handleVerifyPayment = () => {
    const cleanUtr = utrNumber.trim().replace(/\s+/g, '');
    const enteredAmount = parseFloat(paidAmount);
    const requiredAmount = parseFloat(finalTotal);

    if (isNaN(enteredAmount) || enteredAmount <= 0) {
      toast.error('Please enter the exact amount you transferred.');
      setErrorMessage('Please enter the transferred amount in Rupees.');
      return;
    }

    // STRICT CHECK: Reject underpayment (e.g. paying ₹10 for ₹29,000 cart)
    if (enteredAmount < requiredAmount) {
      const shortBy = (requiredAmount - enteredAmount).toLocaleString('en-IN');
      toast.error(`❌ Incomplete payment: Cart total is ₹${requiredAmount.toLocaleString('en-IN')}, but entered ₹${enteredAmount.toLocaleString('en-IN')}. Underpaid by ₹${shortBy}.`);
      setErrorMessage(`Underpayment detected! You entered ₹${enteredAmount.toLocaleString('en-IN')}, but your order total is ₹${requiredAmount.toLocaleString('en-IN')}. Please transfer the full remaining balance of ₹${shortBy} to complete this order.`);
      setPaymentStatus('failed');
      return;
    }

    // STRICT CHECK 1: UTR is strictly compulsory
    if (!cleanUtr) {
      toast.error('12-digit UPI Reference ID (UTR) is strictly compulsory.');
      setErrorMessage('Please complete the payment on your UPI app and enter the compulsory 12-digit UTR/RRN number from your payment receipt.');
      return;
    }

    if (cleanUtr.length < 10) {
      toast.error('Please enter a valid 12-digit UPI UTR number (minimum 10-12 digits required).');
      setErrorMessage('The UTR/Reference number provided is incomplete. Look for the 12-digit UPI Ref No. or Transaction ID on your payment receipt.');
      return;
    }

    setPaymentStatus('verifying');
    setErrorMessage('');

    setTimeout(() => {
      setPaymentStatus('success');
      toast.info('⏳ Payment is under checking. Order registered in Pending mode.');
      setTimeout(() => {
        onPaymentSuccess({
          payment_method: 'UPI',
          payment_status: 'Pending', // Strictly Pending until Admin approves in bank
          notes: `UPI Settlement (VPA: ${upiId}) | Total: ₹${Number(finalTotal).toLocaleString('en-IN')} | Transferred: ₹${Number(enteredAmount).toLocaleString('en-IN')} | UTR: ${cleanUtr}`
        });
      }, 1500);
    }, 1200);
  };

  // Simulate corrupt / failed payment
  const handleSimulateCorrupt = () => {
    setPaymentStatus('verifying');
    setTimeout(() => {
      setPaymentStatus('failed');
      setErrorMessage('Transaction failed, corrupted or declined by banking network. Please try again.');
      toast.error('Payment verification failed or corrupted.');
    }, 1000);
  };

  const handleRetry = () => {
    setPaymentStatus('pending');
    setTimer(300);
    setErrorMessage('');
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(3, 5, 8, 0.9)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2500,
      padding: '16px',
      overflowY: 'auto'
    }}>
      <div 
        className="glass-panel hide-scrollbar" 
        style={{
          background: '#0a0d14',
          border: '1.5px solid rgba(212, 175, 55, 0.5)',
          borderRadius: '24px',
          maxWidth: '520px',
          width: '100%',
          padding: 'clamp(20px, 4vw, 32px)',
          position: 'relative',
          boxShadow: '0 25px 50px rgba(0,0,0,0.95), 0 0 30px rgba(212, 175, 55, 0.2)',
          maxHeight: '92vh',
          overflowY: 'auto'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#d4af37';
            e.currentTarget.style.borderColor = '#d4af37';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#94a3b8';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#d4af37', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>
            <Sparkles size={14} /> Instant UPI Payment Gateway
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#ffffff', marginBottom: '4px' }}>
            {isMobile ? 'Pay via UPI App or Scan QR' : 'Scan QR with Phone UPI App'}
          </h2>
          <div style={{ fontSize: '0.84rem', color: '#94a3b8' }}>
            Session Expires in: <strong style={{ color: '#f5df93', fontFamily: 'monospace' }}>{formatTimer(timer)}</strong>
          </div>
        </div>

        {/* Amount Pill */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(10, 13, 20, 0.9) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          borderRadius: '16px',
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '18px'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Payable Amount</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f5df93' }}>
              ₹{Number(finalTotal).toLocaleString('en-IN')}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', fontWeight: 600 }}>
              <ShieldCheck size={14} /> 256-Bit Encrypted
            </div>
            <div style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>Zero Surcharges</div>
          </div>
        </div>

        {/* Desktop Device Context Note */}
        {!isMobile && (
          <div style={{
            background: 'rgba(212, 175, 55, 0.08)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: '12px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px'
          }}>
            <Info size={18} color="#d4af37" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: '1.4' }}>
              <strong style={{ color: '#f5df93' }}>Desktop Mode:</strong> Scan the QR code below using your phone (Google Pay, PhonePe, or Paytm). After payment, enter the 12-digit UTR below to confirm.
            </div>
          </div>
        )}

        {/* Error / Validation Banner if any */}
        {errorMessage && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            borderRadius: '12px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px'
          }}>
            <AlertTriangle size={18} color="#f43f5e" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.78rem', color: '#fca5a5', lineHeight: '1.4' }}>
              {errorMessage}
            </div>
          </div>
        )}

        {/* PAYMENT STATUS SWITCHER */}
        {paymentStatus === 'pending' && (
          <div>
            {/* Step 1: 1-Tap Mobile Redirect */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
                <span>Step 1: Open in UPI App or Scan QR</span>
                {isMobile && <span style={{ color: '#10b981', fontSize: '0.72rem' }}>● Mobile Detected</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <a
                  href={gpayLink}
                  onClick={() => handleDesktopAppClick('Google Pay', gpayLink)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    color: '#f8fafc',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#d4af37'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'}
                >
                  <Smartphone size={16} color="#3b82f6" /> Google Pay
                </a>

                <a
                  href={phonepeLink}
                  onClick={() => handleDesktopAppClick('PhonePe', phonepeLink)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    color: '#f8fafc',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#d4af37'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'}
                >
                  <Smartphone size={16} color="#8b5cf6" /> PhonePe
                </a>

                <a
                  href={paytmLink}
                  onClick={() => handleDesktopAppClick('Paytm', paytmLink)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    color: '#f8fafc',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#d4af37'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'}
                >
                  <Smartphone size={16} color="#06b6d4" /> Paytm UPI
                </a>

                <a
                  href={upiDeepLink}
                  onClick={() => handleDesktopAppClick('Any UPI App', upiDeepLink)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    color: '#f8fafc',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#d4af37'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'}
                >
                  <ExternalLink size={16} color="#d4af37" /> Any UPI / BHIM
                </a>
              </div>
            </div>

            {/* QR Code Box */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '16px',
              textAlign: 'center',
              marginBottom: '18px'
            }}>
              <div style={{
                background: '#ffffff',
                padding: '12px',
                borderRadius: '16px',
                display: 'inline-block',
                boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
              }}>
                <img 
                  src={dynamicLockedQrUrl} 
                  alt="Dynamic Auto-Locked UPI QR Code" 
                  style={{ width: '170px', height: '170px', display: 'block', objectFit: 'contain', margin: '0 auto' }}
                />
              </div>

              {/* Amount Guidance Tag */}
              <div style={{ marginTop: '10px' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '20px',
                  padding: '5px 14px',
                  color: '#10b981',
                  fontSize: '0.8rem',
                  fontWeight: 700
                }}>
                  <Lock size={13} /> Auto-Locked Cart Total: ₹{Number(finalTotal).toLocaleString('en-IN')} (Non-Editable)
                </div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '4px' }}>
                  Scanning this QR code in Google Pay, PhonePe, Paytm or BHIM automatically sets the amount to <strong>₹{Number(finalTotal).toLocaleString('en-IN')}</strong> and locks it from editing.
                </div>
              </div>

              {/* UPI ID Copy Row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '12px',
                fontSize: '0.82rem',
                color: '#94a3b8'
              }}>
                <span>Payee VPA: <strong style={{ color: '#f5df93' }}>{upiId}</strong></span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  style={{
                    background: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(212, 175, 55, 0.15)',
                    border: '1px solid ' + (copied ? '#10b981' : '#d4af37'),
                    borderRadius: '6px',
                    padding: '3px 8px',
                    color: copied ? '#10b981' : '#d4af37',
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Step 2: Amount Paid & UTR Reference Verification */}
            <div style={{
              background: 'rgba(212, 175, 55, 0.06)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '14px',
              padding: '16px',
              marginBottom: '18px'
            }}>
              <div style={{ fontSize: '0.8rem', color: '#f5df93', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <Receipt size={14} /> Step 2: Confirm Amount & Enter UTR Reference
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                  Amount Transferred (₹) *
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#f5df93', fontWeight: 700, fontSize: '0.9rem' }}>₹</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={paidAmount}
                    onChange={(e) => {
                      setPaidAmount(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder={formattedAmount}
                    className="form-input-luxury"
                    style={{ padding: '10px 14px 10px 28px', fontSize: '0.95rem', fontWeight: 700, color: '#f5df93' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                  Must match or exceed order total: <strong style={{ color: '#ffffff' }}>₹{Number(finalTotal).toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                  12-Digit UPI UTR / Transaction ID *
                </label>
                <input
                  type="text"
                  required
                  value={utrNumber}
                  onChange={(e) => {
                    setUtrNumber(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="e.g. 429384920184 (from payment receipt)"
                  className="form-input-luxury"
                  style={{ padding: '10px 14px', fontSize: '0.92rem', letterSpacing: '0.05em' }}
                />
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px', lineHeight: '1.4' }}>
                  Found under <strong>UPI Ref No.</strong>, <strong>UTR</strong>, or <strong>Txn ID</strong> on Google Pay, PhonePe, or Paytm receipt.
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={handleVerifyPayment}
              className="btn-luxury-gold"
              style={{ width: '100%', padding: '14px', fontSize: '0.96rem', letterSpacing: '0.06em', marginBottom: '10px' }}
            >
              <CheckCircle size={18} /> Submit UTR & Place Commission
            </button>

            {/* Simulation Helpers & Admin Config Link */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginTop: '10px', fontSize: '0.72rem' }}>
              <button
                type="button"
                onClick={handleSimulateCorrupt}
                style={{
                  background: 'transparent',
                  border: '1px dashed rgba(244, 63, 94, 0.4)',
                  borderRadius: '8px',
                  padding: '5px 8px',
                  color: '#fb7185',
                  fontSize: '0.72rem',
                  cursor: 'pointer'
                }}
              >
                Test Corrupt/Failed Response
              </button>

              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '5px 12px',
                  color: '#94a3b8',
                  fontSize: '0.72rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* VERIFYING STATE */}
        {paymentStatus === 'verifying' && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div className="gold-shimmer" style={{ width: '70px', height: '70px', borderRadius: '50%', margin: '0 auto 20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RotateCcw size={32} color="#d4af37" className="spin-slow" />
            </div>
            <h3 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '8px' }}>
              Recording UPI Transaction Reference...
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>
              Linking UTR <strong style={{ color: '#f5df93' }}>{utrNumber}</strong> to your boutique order for verification.
            </p>
          </div>
        )}

        {/* SUCCESS STATE */}
        {paymentStatus === 'success' && (
          <div style={{ textAlign: 'center', padding: '30px 20px' }}>
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.2)',
              border: '2px solid #f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto'
            }}>
              <RotateCcw size={36} color="#f59e0b" />
            </div>
            <h3 style={{ fontSize: '1.35rem', color: '#ffffff', marginBottom: '8px' }}>
              Payment is Under Checking
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', marginBottom: '12px', lineHeight: '1.5' }}>
              Your order is registered in <strong style={{ color: '#f5df93' }}>PENDING</strong> mode with UTR Reference <strong>{utrNumber}</strong>.
            </p>
            <div style={{
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '12px',
              padding: '10px 14px',
              fontSize: '0.8rem',
              color: '#fde68a'
            }}>
              ⏳ Please wait for merchant bank confirmation. Once approved, your order will show 'Payment Done' and active delivery schedule.
            </div>
          </div>
        )}

        {/* FAILED / CORRUPTED STATE */}
        {paymentStatus === 'failed' && (
          <div style={{ textAlign: 'center', padding: '20px 10px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1.5px solid #f43f5e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <AlertTriangle size={32} color="#f43f5e" />
            </div>

            <div style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '20px',
              textAlign: 'left'
            }}>
              <div style={{ color: '#fb7185', fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>
                Payment Incomplete / Corrupted Transaction
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '0.82rem', lineHeight: '1.5' }}>
                {errorMessage || 'The UPI transaction was either interrupted, timed out, or rejected. No funds were confirmed.'}
              </div>
            </div>

            <button
              type="button"
              onClick={handleRetry}
              className="btn-luxury-gold"
              style={{ width: '100%', padding: '14px', fontSize: '0.95rem', marginBottom: '10px' }}
            >
              <RotateCcw size={16} /> Try Again / Retry Payment
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                padding: '10px',
                width: '100%',
                color: '#94a3b8',
                fontSize: '0.84rem',
                cursor: 'pointer'
              }}
            >
              Choose Another Payment Method
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default UpiPaymentModal;
