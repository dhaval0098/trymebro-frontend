import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Sparkles, Package, ArrowRight, Home } from 'lucide-react';

const OrderSuccess = () => {
  const { orderNumber } = useParams();
  const location = useLocation();
  const orderData = location.state?.orderData;

  return (
    <div style={{ maxWidth: '800px', margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
      <div className="glass-card" style={{ padding: '60px 40px', borderRadius: '24px' }}>
        
        {/* Animated Badge */}
        <div style={{
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          background: 'rgba(212, 175, 55, 0.15)',
          border: '2px solid #d4af37',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px auto',
          boxShadow: 'var(--gold-glow)'
        }}>
          <CheckCircle2 size={48} color="#d4af37" />
        </div>

        <div style={{ fontSize: '0.8rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, marginBottom: '8px' }}>
          ORDER PLACED & REGISTERED
        </div>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: '#ffffff', marginBottom: '12px' }}>
          Thank You For Your Order
        </h1>

        <p style={{ fontSize: '0.95rem', color: '#cbd5e1', maxWidth: '540px', margin: '0 auto 28px auto', lineHeight: '1.6' }}>
          Your perfume order has been received and registered. A confirmation receipt has been sent to your email.
        </p>

        {/* Order Reference Box */}
        <div style={{
          background: 'rgba(15, 19, 28, 0.8)',
          border: '1px dashed var(--border-gold)',
          borderRadius: '14px',
          padding: '20px',
          maxWidth: '480px',
          margin: '0 auto 36px auto'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
            Unique Tracking & Order Reference
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '1.4rem', fontWeight: 700, color: '#f5df93', letterSpacing: '0.1em' }}>
            #{orderNumber}
          </div>
          {orderData?.finalAmount && (
            <div style={{ fontSize: '0.88rem', color: '#f8fafc', marginTop: '6px' }}>
              Order Total: <strong>₹{Number(orderData.finalAmount).toLocaleString('en-IN')}</strong>
            </div>
          )}
          {/* Payment & Delivery Status Info */}
          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.8rem', color: '#cbd5e1' }}>
            {orderData?.payment_method === 'Razorpay' || orderData?.payment_status === 'Paid' ? (
              <>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.78rem', letterSpacing: '0.04em' }}>
                  ● Payment Authenticated (Paid via Razorpay Secure)
                </div>
                {orderData?.razorpay_payment_id && (
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '3px', fontFamily: 'monospace' }}>
                    Payment ID: {orderData.razorpay_payment_id}
                  </div>
                )}
                <div style={{ fontSize: '0.78rem', color: '#6ee7b7', marginTop: '6px', lineHeight: '1.4' }}>
                  ✨ Your payment has been verified instantly! Your artisanal fragrance order is being prepared with priority dispatch. Estimated Delivery in <strong>3–5 Business Days</strong>.
                </div>
              </>
            ) : orderData?.payment_method === 'COD' ? (
              <>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.78rem', letterSpacing: '0.04em' }}>
                  ● Order Confirmed (Cash on Delivery)
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6ee7b7', marginTop: '5px', lineHeight: '1.4' }}>
                  ✨ Your order is confirmed! Estimated Delivery in <strong>3–5 Business Days</strong>. Please keep ₹{orderData?.finalAmount ? Number(orderData.finalAmount).toLocaleString('en-IN') : ''} ready upon delivery.
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.76rem', letterSpacing: '0.04em' }}>
                  ● Payment Under Checking (Pending Confirmation)
                </div>
                <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '4px', lineHeight: '1.4' }}>
                  Your online order is currently registered in <strong>PENDING</strong> mode. Once verified, delivery timings (3–5 days) will be activated in your profile.
                </div>
              </>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
          <Link to="/profile?tab=orders" className="btn-luxury-gold" style={{ padding: '14px 32px' }}>
            <Package size={18} /> Track Parcel in Profile
          </Link>
          <Link to="/" className="btn-luxury-outline" style={{ padding: '14px 30px' }}>
            <Home size={18} /> Return Home
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OrderSuccess;
