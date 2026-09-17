import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  ArrowRight,
  QrCode,
  Banknote,
  Tag,
  Gift,
  Check,
  Percent,
  X,
  ChevronDown,
  ChevronUp,
  Copy,
  Wallet,
  Smartphone,
  Shield,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

// Helper to dynamically load Razorpay Checkout Script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const { cartItems, subtotal, discount, shippingFee, finalTotal, appliedCoupon, applyCoupon, removeCoupon, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    shipping_name: user?.name || '',
    shipping_phone: user?.phone || '',
    shipping_street: user?.address_street || '',
    shipping_city: user?.address_city || '',
    shipping_state: user?.address_state || '',
    shipping_postal_code: user?.address_postal_code || '',
    shipping_country: user?.address_country || 'India',
    notes: '',
    payment_method: 'Razorpay' // Will dynamically adapt if online payment is disabled
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishedCoupons, setPublishedCoupons] = useState([]);
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [isCouponDropdownOpen, setIsCouponDropdownOpen] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  // Dynamic Payment Gateway Configuration from Admin
  const [paymentConfig, setPaymentConfig] = useState({
    is_razorpay_enabled: true,
    is_cod_enabled: true,
    razorpay_key_id: 'rzp_test_TbWUGrGr4J0GGV',
    razorpay_mode: 'test',
    business_name: 'TRY ME BRO Luxury Perfumes'
  });

  // Dynamic PIN 382721 Distance & Shipping State
  const [shippingConfig, setShippingConfig] = useState(null);
  const [distanceDetails, setDistanceDetails] = useState(null);
  const [distanceLoading, setDistanceLoading] = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  // Preload Razorpay Script
  useEffect(() => {
    loadRazorpayScript();
  }, []);

  // Fetch live published promotional coupons, shipping config, and payment gateway config
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [couponRes, shippingRes, paymentRes] = await Promise.all([
          api.get('/coupons/public').catch(() => ({ data: { coupons: [] } })),
          api.get('/shipping/config').catch(() => ({ data: { config: null } })),
          api.get('/payment/public-config').catch(() => ({ data: { config: null } }))
        ]);

        if (couponRes.data?.coupons) {
          setPublishedCoupons(couponRes.data.coupons);
        }
        if (shippingRes.data?.config) {
          setShippingConfig(shippingRes.data.config);
        }
        if (paymentRes.data?.config) {
          const pConfig = paymentRes.data.config;
          setPaymentConfig(pConfig);
          // If online payment is disabled, auto-switch default method to COD
          if (!pConfig.is_razorpay_enabled && pConfig.is_cod_enabled) {
            setFormData(prev => ({ ...prev, payment_method: 'COD' }));
          }
        }
      } catch (e) {
        console.error('Failed to load initial checkout data:', e);
      }
    };
    fetchInitialData();
  }, []);

  // Recalculate distance and delivery fee when PIN code or subtotal changes
  const calculateDistanceRate = async (pincode, currentSubtotal) => {
    const cleanPin = String(pincode || '').trim().replace(/[^0-9]/g, '');
    if (cleanPin.length !== 6) {
      setDistanceDetails(null);
      return;
    }

    try {
      setDistanceLoading(true);
      const res = await api.post('/shipping/calculate', {
        destination_pincode: cleanPin,
        subtotal: currentSubtotal
      });
      if (res.data?.success) {
        setDistanceDetails(res.data);
      }
    } catch (err) {
      console.error('Distance calculation error:', err);
    } finally {
      setDistanceLoading(false);
    }
  };

  useEffect(() => {
    if (formData.shipping_postal_code && formData.shipping_postal_code.trim().replace(/[^0-9]/g, '').length === 6) {
      calculateDistanceRate(formData.shipping_postal_code, subtotal);
    }
  }, [formData.shipping_postal_code, subtotal]);

  // Derived fixed delivery fee based on Admin Settings
  const dynamicShippingFee = useMemo(() => {
    if (distanceDetails && distanceDetails.final_shipping_fee !== undefined) {
      return distanceDetails.final_shipping_fee;
    }
    const fixedCharge = Number(shippingConfig?.fixed_delivery_charge !== undefined ? shippingConfig.fixed_delivery_charge : (shippingConfig?.base_fee !== undefined ? shippingConfig.base_fee : 100));
    const threshold = Number(shippingConfig?.free_shipping_threshold !== undefined ? shippingConfig.free_shipping_threshold : 5000);
    return (threshold > 0 && subtotal >= threshold) || subtotal === 0 ? 0 : fixedCharge;
  }, [distanceDetails, shippingConfig, subtotal]);

  const dynamicPayableTotal = useMemo(() => {
    return Math.max(0, subtotal - discount + dynamicShippingFee);
  }, [subtotal, discount, dynamicShippingFee]);

  // Filter only active & published coupons
  const activeCoupons = useMemo(() => {
    const now = new Date();
    return (publishedCoupons || []).filter((c) => {
      const isActive = c.is_active === undefined ? true : Boolean(Number(c.is_active) === 1 || c.is_active === true || c.is_active === '1');
      const isPublished = c.is_published === undefined ? true : Boolean(Number(c.is_published) === 1 || c.is_published === true || c.is_published === '1');
      if (!isActive || !isPublished) return false;
      if (c.expiry_date && new Date(c.expiry_date) < now) return false;
      if (c.usage_limit !== null && c.usage_limit !== undefined && Number(c.used_count) >= Number(c.usage_limit)) return false;
      return true;
    });
  }, [publishedCoupons]);

  // Live calculate potential savings for any coupon (Standard & BOGO)
  const calculateCouponDiscount = (coupon) => {
    if (!coupon || !subtotal) return 0;
    const discountType = (coupon.discount_type || 'percentage').toLowerCase();

    if (discountType === 'bogo' || discountType === 'buy_x_get_y') {
      const buyQty = Math.max(1, parseInt(coupon.buy_qty || 1, 10));
      const getQty = Math.max(1, parseInt(coupon.get_qty || 1, 10));
      const discountPercentForGet = coupon.discount_percent_for_get !== undefined && coupon.discount_percent_for_get !== null
        ? Number(coupon.discount_percent_for_get)
        : 100;
      const bundleSize = buyQty + getQty;

      let applicableProdIds = [];
      if (coupon.applicable_product_ids) {
        try {
          applicableProdIds = typeof coupon.applicable_product_ids === 'string'
            ? JSON.parse(coupon.applicable_product_ids)
            : coupon.applicable_product_ids;
        } catch (e) {}
      }

      let applicableCatIds = [];
      if (coupon.applicable_category_ids) {
        try {
          applicableCatIds = typeof coupon.applicable_category_ids === 'string'
            ? JSON.parse(coupon.applicable_category_ids)
            : coupon.applicable_category_ids;
        } catch (e) {}
      }

      const applicableType = coupon.applicable_type || 'all';
      const qualifyingUnits = [];

      for (const item of cartItems) {
        const prodId = Number(item.product_id || item.id);
        const catId = Number(item.category_id);
        let isEligible = true;

        if (applicableType === 'specific') {
          isEligible = Array.isArray(applicableProdIds) && applicableProdIds.map(Number).includes(prodId);
        } else if (applicableType === 'category') {
          isEligible = Array.isArray(applicableCatIds) && applicableCatIds.map(Number).includes(catId);
        }

        if (isEligible) {
          const unitPrice = Number(item.active_price || item.discount_price || item.price || 0);
          const qty = Number(item.quantity || 1);
          for (let i = 0; i < qty; i++) {
            qualifyingUnits.push({
              productId: prodId,
              name: item.name,
              price: unitPrice
            });
          }
        }
      }

      const qualifyingCount = qualifyingUnits.length;
      const completedBundles = Math.floor(qualifyingCount / bundleSize);
      const freeItemsCount = completedBundles * getQty;

      if (freeItemsCount > 0) {
        qualifyingUnits.sort((a, b) => a.price - b.price);
        const freeUnits = qualifyingUnits.slice(0, freeItemsCount);
        const totalFreeVal = freeUnits.reduce((sum, u) => sum + u.price, 0);
        return Math.round((totalFreeVal * discountPercentForGet) / 100);
      }
      return 0;
    }

    let disc = 0;
    if (discountType === 'percentage') {
      disc = (subtotal * Number(coupon.discount_value)) / 100;
      if (coupon.max_discount_amount && disc > Number(coupon.max_discount_amount)) {
        disc = Number(coupon.max_discount_amount);
      }
    } else {
      disc = Number(coupon.discount_value);
    }
    disc = Math.min(disc, subtotal);
    return Math.round(disc);
  };

  const handleApplyCustomCoupon = async (e) => {
    if (e) e.preventDefault();
    if (!couponInput.trim()) {
      toast.info('Please enter a coupon code.');
      return;
    }
    setCouponLoading(true);
    await applyCoupon(couponInput.trim().toUpperCase());
    setCouponLoading(false);
    setCouponInput('');
  };

  const handleApplyPublishedCoupon = async (code) => {
    setCouponLoading(true);
    await applyCoupon(code);
    setCouponLoading(false);
  };

  const handleCopyCode = (e, code) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon "${code}" copied!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        shipping_name: prev.shipping_name || user.name || '',
        shipping_phone: prev.shipping_phone || user.phone || '',
        shipping_street: prev.shipping_street || user.address_street || '',
        shipping_city: prev.shipping_city || user.address_city || '',
        shipping_state: prev.shipping_state || user.address_state || '',
        shipping_postal_code: prev.shipping_postal_code || user.address_postal_code || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateDeliveryForm = () => {
    if (!formData.shipping_name.trim()) {
      toast.error('Please enter the recipient full name.');
      return false;
    }
    if (!formData.shipping_phone.trim() || formData.shipping_phone.trim().length < 8) {
      toast.error('Please enter a valid phone number for courier tracking.');
      return false;
    }
    if (!formData.shipping_street.trim()) {
      toast.error('Please enter complete street address & residence.');
      return false;
    }
    if (!formData.shipping_city.trim()) {
      toast.error('Please enter delivery city.');
      return false;
    }
    if (!formData.shipping_state.trim()) {
      toast.error('Please enter delivery state.');
      return false;
    }
    const cleanPin = formData.shipping_postal_code.trim().replace(/[^0-9]/g, '');
    if (cleanPin.length !== 6) {
      toast.error('Please enter a valid 6-digit Indian Postal PIN Code.');
      return false;
    }
    return true;
  };

  // Trigger Razorpay Modal and Handle Online Settlement
  const handleRazorpayCheckout = async () => {
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded || !window.Razorpay) {
      toast.error('Unable to initialize Razorpay SDK. Please check your internet connection and try again.');
      setIsSubmitting(false);
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Create Razorpay order on backend
      const orderPayload = {
        ...formData,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        items: cartItems.map(i => ({ product_id: i.product_id || i.id, quantity: i.quantity }))
      };

      const orderCreateRes = await api.post('/orders/razorpay/create-order', orderPayload);
      if (!orderCreateRes.data?.success) {
        toast.error(orderCreateRes.data?.message || 'Failed to initialize payment gateway.');
        setIsSubmitting(false);
        return;
      }

      const { order_id, amount, currency, key_id } = orderCreateRes.data;

      // 2. Configure Razorpay Popup Options
      const options = {
        key: key_id,
        amount: amount,
        currency: currency || 'INR',
        name: 'TRY ME BRO Luxury Perfumes',
        description: `Order Settlement (${cartItems.length} Fragrances)`,
        image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=150&q=80',
        order_id: order_id,
        prefill: {
          name: formData.shipping_name,
          email: user?.email || '',
          contact: formData.shipping_phone
        },
        notes: {
          shipping_address: `${formData.shipping_street}, ${formData.shipping_city}, ${formData.shipping_state} - ${formData.shipping_postal_code}`,
          special_instructions: formData.notes || 'None'
        },
        theme: {
          color: '#d4af37',
          backdrop_color: 'rgba(8, 10, 15, 0.92)'
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
            toast.info('Razorpay payment cancelled. You can retry whenever you are ready.');
          }
        },
        handler: async (paymentResponse) => {
          try {
            setIsSubmitting(true);
            const verificationPayload = {
              ...formData,
              coupon_code: appliedCoupon ? appliedCoupon.code : null,
              items: cartItems.map(i => ({ product_id: i.product_id || i.id, quantity: i.quantity })),
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature
            };

            const verifyRes = await api.post('/orders/razorpay/verify', verificationPayload);
            if (verifyRes.data?.success) {
              clearCart();
              toast.success('✨ Razorpay Payment Verified & Order Confirmed!');
              navigate(`/order-success/${verifyRes.data.orderNumber}`, { state: { orderData: verifyRes.data } });
            } else {
              toast.error(verifyRes.data?.message || 'Payment verification failed.');
            }
          } catch (verErr) {
            toast.error(verErr.response?.data?.message || 'Payment verification error. Please contact concierge support.');
          } finally {
            setIsSubmitting(false);
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      
      razorpayInstance.on('payment.failed', function (failRes) {
        setIsSubmitting(false);
        toast.error(failRes.error?.description || 'Payment transaction failed. Please try again.');
      });

      razorpayInstance.open();
    } catch (err) {
      console.error('Razorpay initialization error:', err);
      toast.error(err.response?.data?.message || 'Could not initiate Razorpay payment.');
      setIsSubmitting(false);
    }
  };

  // Cash on Delivery Settlement
  const handleCodCheckout = async () => {
    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        payment_method: 'COD',
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        items: cartItems.map(i => ({ product_id: i.product_id || i.id, quantity: i.quantity }))
      };

      const res = await api.post('/orders', payload);
      if (res.data.success) {
        clearCart();
        toast.success('✨ Cash on Delivery order placed successfully! Confirmation receipt sent to your email.');
        navigate(`/order-success/${res.data.orderNumber}`, { state: { orderData: res.data } });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Main Submit Handler
  const handleInitiateOrder = (e) => {
    e.preventDefault();

    if (!validateDeliveryForm()) return;

    if (formData.payment_method === 'Razorpay') {
      if (!paymentConfig.is_razorpay_enabled) {
        toast.error('Online payment is currently disabled. Please select Cash on Delivery.');
        return;
      }
      handleRazorpayCheckout();
    } else if (formData.payment_method === 'COD') {
      if (!paymentConfig.is_cod_enabled) {
        toast.error('Cash on Delivery is currently disabled by store management.');
        return;
      }
      handleCodCheckout();
    } else {
      toast.error('Please select an active payment method to proceed.');
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '40px auto 80px', padding: '0 clamp(16px, 3vw, 28px)' }}>
      
      {/* Header Title & Breadcrumb */}
      <div style={{ textAlign: 'center', marginBottom: 'clamp(28px, 5vw, 46px)' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          background: 'rgba(212, 175, 55, 0.08)', 
          border: '1px solid rgba(212, 175, 55, 0.25)', 
          borderRadius: '9999px', 
          padding: '4px 14px', 
          fontSize: '0.74rem', 
          color: '#f5df93', 
          textTransform: 'uppercase', 
          letterSpacing: '0.14em', 
          fontWeight: 700, 
          marginBottom: '12px' 
        }}>
          <Shield size={12} color="#d4af37" /> 256-Bit SSL Encrypted Concierge Checkout
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
          Artisanal Delivery & Settlement
        </h1>
        <p style={{ fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', color: '#94a3b8', marginTop: '8px', maxWidth: '560px', margin: '8px auto 0' }}>
          Secure your handcrafted olfactory masterworks with instant Razorpay checkout or Cash on Delivery.
        </p>
      </div>

      <form onSubmit={handleInitiateOrder}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
          gap: 'clamp(24px, 4vw, 44px)',
          alignItems: 'start'
        }}>
          
          {/* LEFT COLUMN: Shipping Destination & Payment Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* Step 1. Client Delivery Details */}
            <div className="glass-panel" style={{ borderRadius: '24px', padding: 'clamp(20px, 3.5vw, 36px)', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid #d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Truck size={17} color="#d4af37" />
                  </div>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.15rem, 2.5vw, 1.35rem)', color: '#ffffff', margin: 0 }}>
                      1. Delivery Destination
                    </h2>
                    <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Where should our courier dispatch your fragrances?</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '16px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', display: 'block', marginBottom: '6px' }}>Full Name *</label>
                  <input
                    type="text"
                    name="shipping_name"
                    value={formData.shipping_name}
                    onChange={handleChange}
                    required
                    placeholder="Recipient Full Name"
                    className="form-input-luxury"
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', display: 'block', marginBottom: '6px' }}>Contact Phone Number (For Courier OTP & Tracking) *</label>
                  <input
                    type="tel"
                    name="shipping_phone"
                    value={formData.shipping_phone}
                    onChange={handleChange}
                    required
                    placeholder="+91 98765 43210"
                    className="form-input-luxury"
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', display: 'block', marginBottom: '6px' }}>Street Address / Residence / Landmark *</label>
                  <input
                    type="text"
                    name="shipping_street"
                    value={formData.shipping_street}
                    onChange={handleChange}
                    required
                    placeholder="Penthouse / Apartment, Street, Landmark"
                    className="form-input-luxury"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', display: 'block', marginBottom: '6px' }}>City *</label>
                  <input
                    type="text"
                    name="shipping_city"
                    value={formData.shipping_city}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Mumbai, Ahmedabad, Delhi"
                    className="form-input-luxury"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', display: 'block', marginBottom: '6px' }}>State / Province *</label>
                  <input
                    type="text"
                    name="shipping_state"
                    value={formData.shipping_state}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Maharashtra, Gujarat"
                    className="form-input-luxury"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', display: 'block', marginBottom: '6px' }}>
                    Postal PIN Code * (Distance from Atelier 382721)
                  </label>
                  <input
                    type="text"
                    name="shipping_postal_code"
                    value={formData.shipping_postal_code}
                    onChange={handleChange}
                    required
                    maxLength={6}
                    placeholder="6-digit Indian PIN (e.g. 380001)"
                    className="form-input-luxury"
                  />

                  {/* Real-time Distance & Delivery Rate from Store PIN 382721 */}
                  {distanceLoading && (
                    <div style={{ fontSize: '0.74rem', color: '#d4af37', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <RefreshCw size={12} className="animate-spin" />
                      <span className="gold-shimmer">Checking PIN code & delivery destination...</span>
                    </div>
                  )}

                  {!distanceLoading && distanceDetails && (
                    <div style={{
                      marginTop: '10px',
                      padding: '10px 14px',
                      background: distanceDetails.is_free ? 'rgba(16, 185, 129, 0.12)' : 'rgba(212, 175, 55, 0.1)',
                      border: distanceDetails.is_free ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(212, 175, 55, 0.35)',
                      borderRadius: '10px',
                      fontSize: '0.76rem',
                      lineHeight: '1.45'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: distanceDetails.is_free ? '#34d399' : '#f5df93', fontWeight: 700 }}>
                        <Truck size={14} />
                        <span>
                          Delivery to: <strong>{distanceDetails.destination_city ? `${distanceDetails.destination_city} (${distanceDetails.destination_pincode})` : distanceDetails.destination_pincode}</strong>
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '4px' }}>
                        {distanceDetails.is_free ? (
                          <span style={{ color: '#10b981', fontWeight: 700 }}>
                            🎉 Free Delivery Applied (Orders above ₹{Number(distanceDetails.free_shipping_threshold).toLocaleString('en-IN')})
                          </span>
                        ) : (
                          <span>
                            Fixed Delivery Charge: <strong>₹{distanceDetails.final_shipping_fee}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', display: 'block', marginBottom: '6px' }}>Country</label>
                  <input
                    type="text"
                    name="shipping_country"
                    value={formData.shipping_country}
                    onChange={handleChange}
                    className="form-input-luxury"
                    readOnly
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', display: 'block', marginBottom: '6px' }}>Special Delivery Instructions (Optional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={2}
                    placeholder="e.g. Ring doorbell twice / Gift wrap requested / Call before dispatch..."
                    className="form-input-luxury"
                  />
                </div>
              </div>
            </div>

            {/* Step 2. Payment Method Selector */}
            <div className="glass-panel" style={{ borderRadius: '24px', padding: 'clamp(20px, 3.5vw, 36px)', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid #d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CreditCard size={17} color="#d4af37" />
                  </div>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.15rem, 2.5vw, 1.35rem)', color: '#ffffff', margin: 0 }}>
                      2. Settlement Method
                    </h2>
                    <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Select your preferred mode of authentication</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* 1. RAZORPAY ONLINE CHECKOUT */}
                {paymentConfig.is_razorpay_enabled ? (
                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    background: formData.payment_method === 'Razorpay' 
                      ? 'linear-gradient(145deg, rgba(212, 175, 55, 0.14) 0%, rgba(15, 23, 42, 0.7) 100%)' 
                      : 'rgba(255, 255, 255, 0.02)',
                    border: formData.payment_method === 'Razorpay' 
                      ? '1.8px solid #d4af37' 
                      : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    padding: '18px',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    boxShadow: formData.payment_method === 'Razorpay' ? '0 8px 30px rgba(212, 175, 55, 0.16)' : 'none'
                  }}>
                    <input
                      type="radio"
                      name="payment_method"
                      value="Razorpay"
                      checked={formData.payment_method === 'Razorpay'}
                      onChange={handleChange}
                      style={{ accentColor: '#d4af37', width: '20px', height: '20px', marginTop: '2px', cursor: 'pointer' }}
                    />
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, color: '#f8fafc', fontSize: '1rem', letterSpacing: '0.01em' }}>
                            Razorpay Secure Checkout
                          </span>
                          <span style={{ 
                            background: 'linear-gradient(135deg, #d4af37 0%, #aa8010 100%)', 
                            color: '#080a0f', 
                            fontSize: '0.68rem', 
                            padding: '2px 8px', 
                            borderRadius: '6px', 
                            fontWeight: 800,
                            letterSpacing: '0.04em'
                          }}>
                            RECOMMENDED
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.74rem', fontWeight: 600 }}>
                          <ShieldCheck size={14} /> Instant Confirmation
                        </div>
                      </div>

                      <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '6px 0 10px 0', lineHeight: '1.4' }}>
                        Pay effortlessly via <strong>UPI (GPay, PhonePe, Paytm), Credit / Debit Cards, Net Banking, or Wallets</strong> with 256-bit bank-grade encryption.
                      </p>

                      {/* Supported Providers Badges */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                        {['UPI (GPay / PhonePe / Paytm / QR)', 'Cards (Visa / Mastercard / Amex / RuPay)', 'Net Banking (50+ Banks)', 'Wallets & EMI'].map((pill) => (
                          <span 
                            key={pill}
                            style={{
                              background: 'rgba(212, 175, 55, 0.08)',
                              border: '1px solid rgba(212, 175, 55, 0.25)',
                              color: '#f5df93',
                              fontSize: '0.68rem',
                              fontWeight: 600,
                              padding: '3px 8px',
                              borderRadius: '6px'
                            }}
                          >
                            {pill}
                          </span>
                        ))}
                      </div>

                      {/* Razorpay Test Mode Helper Card if in test mode */}
                      {paymentConfig.razorpay_mode === 'test' && (
                        <div style={{
                          marginTop: '14px',
                          background: 'linear-gradient(145deg, rgba(245, 158, 11, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)',
                          border: '1px solid rgba(245, 158, 11, 0.35)',
                          borderRadius: '12px',
                          padding: '12px 14px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontSize: '0.78rem', fontWeight: 800 }}>
                              <span>🧪 RAZORPAY TEST MODE ACTIVE</span>
                            </div>
                            <span style={{ fontSize: '0.68rem', color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px' }}>
                              No Real Money Charged
                            </span>
                          </div>

                          <div style={{ fontSize: '0.74rem', color: '#cbd5e1', lineHeight: '1.4', marginBottom: '10px' }}>
                            Click <strong>"Pay with Razorpay"</strong> and use any test credential below. In the Razorpay simulation screen, click <strong>"Success"</strong> to authorize the order.
                          </div>

                          {/* Quick Copy Test Credentials */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '8px' }}>
                            {/* Test Card */}
                            <div style={{
                              background: 'rgba(0, 0, 0, 0.4)',
                              border: '1px dashed rgba(245, 158, 11, 0.4)',
                              borderRadius: '8px',
                              padding: '8px 10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}>
                              <div>
                                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Test Card (Visa/Mastercard)</div>
                                <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#fef08a', fontWeight: 700 }}>
                                  4111 1111 1111 1111
                                </div>
                                <div style={{ fontSize: '0.64rem', color: '#64748b' }}>Exp: 12/28 • CVV: 123 • OTP: 123456</div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  navigator.clipboard.writeText('4111111111111111');
                                  toast.success('Test Card "4111111111111111" copied!');
                                }}
                                style={{
                                  background: 'rgba(245, 158, 11, 0.2)',
                                  border: '1px solid #fbbf24',
                                  color: '#fbbf24',
                                  borderRadius: '4px',
                                  padding: '4px 8px',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                Copy
                              </button>
                            </div>

                            {/* Test UPI */}
                            <div style={{
                              background: 'rgba(0, 0, 0, 0.4)',
                              border: '1px dashed rgba(245, 158, 11, 0.4)',
                              borderRadius: '8px',
                              padding: '8px 10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}>
                              <div>
                                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Test UPI ID (GPay / PhonePe)</div>
                                <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#fef08a', fontWeight: 700 }}>
                                  success@razorpay
                                </div>
                                <div style={{ fontSize: '0.64rem', color: '#64748b' }}>Instant Simulated Approval</div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  navigator.clipboard.writeText('success@razorpay');
                                  toast.success('Test UPI "success@razorpay" copied!');
                                }}
                                style={{
                                  background: 'rgba(245, 158, 11, 0.2)',
                                  border: '1px solid #fbbf24',
                                  color: '#fbbf24',
                                  borderRadius: '4px',
                                  padding: '4px 8px',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px dashed rgba(255, 255, 255, 0.12)',
                    borderRadius: '16px',
                    padding: '16px 18px',
                    opacity: 0.75
                  }}>
                    <div style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px', color: '#94a3b8' }}>
                      <Lock size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: '#94a3b8', fontSize: '0.96rem' }}>
                          Razorpay Online Payment (UPI / Cards)
                        </span>
                        <span style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          color: '#f87171',
                          fontSize: '0.68rem',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontWeight: 800,
                          border: '1px solid rgba(239, 68, 68, 0.3)'
                        }}>
                          ONLINE PAYMENT DISABLED
                        </span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                        Online payment is currently paused by store administration. Please select <strong>Cash on Delivery (COD)</strong> below to place your order.
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. CASH ON DELIVERY */}
                {paymentConfig.is_cod_enabled ? (
                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    background: formData.payment_method === 'COD' 
                      ? 'rgba(212, 175, 55, 0.12)' 
                      : 'rgba(255, 255, 255, 0.02)',
                    border: formData.payment_method === 'COD' 
                      ? '1.5px solid #d4af37' 
                      : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    padding: '18px',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease'
                  }}>
                    <input
                      type="radio"
                      name="payment_method"
                      value="COD"
                      checked={formData.payment_method === 'COD'}
                      onChange={handleChange}
                      style={{ accentColor: '#d4af37', width: '20px', height: '20px', marginTop: '2px', cursor: 'pointer' }}
                    />

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.96rem' }}>
                            Cash on Delivery (COD)
                          </span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Pay upon arrival</span>
                      </div>

                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                        Pay in cash or through courier scanner upon safe delivery of your perfume parcel at your doorstep.
                      </p>
                    </div>
                  </label>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px dashed rgba(255, 255, 255, 0.12)',
                    borderRadius: '16px',
                    padding: '16px 18px',
                    opacity: 0.75
                  }}>
                    <div style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px', color: '#94a3b8' }}>
                      <Lock size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: '#94a3b8', fontSize: '0.96rem' }}>
                          Cash on Delivery (COD)
                        </span>
                        <span style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          color: '#f87171',
                          fontSize: '0.68rem',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontWeight: 800,
                          border: '1px solid rgba(239, 68, 68, 0.3)'
                        }}>
                          COD DISABLED
                        </span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                        Cash on Delivery is currently paused. Please use online payment methods to complete your order.
                      </p>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Sticky Bag Snapshot, Privilege Coupons & Settlement */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div className="glass-panel" style={{ borderRadius: '24px', padding: 'clamp(20px, 3vw, 32px)', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: '#ffffff', margin: 0 }}>
                  Order Snapshot
                </h2>
                <span style={{ fontSize: '0.78rem', color: '#d4af37', fontWeight: 600 }}>
                  {cartItems.reduce((acc, i) => acc + i.quantity, 0)} Fragrance Flacons
                </span>
              </div>

              {/* Items List Snapshot */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '220px', overflowY: 'auto', marginBottom: '20px', paddingRight: '4px' }}>
                {cartItems.map(item => {
                  const unitPrice = Number(item.active_price || item.discount_price || item.price);
                  const itemTotal = unitPrice * item.quantity;
                  return (
                    <div key={item.product_id || item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '8px 10px', borderRadius: '10px' }}>
                      <img 
                        src={item.primary_image} 
                        alt={item.name} 
                        style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', background: '#0a0d14', border: '1px solid rgba(255,255,255,0.06)' }} 
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                          Qty: {item.quantity} • {item.selected_size || (item.volume_ml ? `${item.volume_ml}ml` : '100ml')}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f5df93' }}>
                        ₹{itemTotal.toLocaleString('en-IN')}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Promo Code & Published Privileges Box */}
              <div style={{
                background: 'linear-gradient(145deg, rgba(20, 26, 38, 0.7) 0%, rgba(12, 16, 24, 0.8) 100%)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: '16px',
                padding: '14px',
                marginBottom: '20px'
              }}>
                {appliedCoupon ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: '#6ee7b7',
                    fontSize: '0.82rem',
                    marginBottom: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Check size={16} color="#10b981" />
                      <span>
                        Applied: <strong>{appliedCoupon.code}</strong> {appliedCoupon.discount_type === 'bogo' ? `(BUY ${appliedCoupon.buy_qty || 1} GET ${appliedCoupon.get_qty || 1} FREE)` : ''} (-₹{discount.toLocaleString('en-IN')})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      style={{
                        background: 'rgba(244, 63, 94, 0.15)',
                        border: '1px solid rgba(244, 63, 94, 0.3)',
                        borderRadius: '6px',
                        color: '#f43f5e',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                      title="Remove coupon"
                    >
                      <X size={13} /> Remove
                    </button>
                  </div>
                ) : null}

                {/* Active Coupons Accordion / Dropdown */}
                <div style={{
                  background: 'rgba(212, 175, 55, 0.04)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  marginBottom: '12px'
                }}>
                  <button
                    type="button"
                    onClick={() => setIsCouponDropdownOpen(!isCouponDropdownOpen)}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      color: '#f5df93',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Gift size={15} color="#d4af37" />
                      <span>Privilege Coupons</span>
                      {activeCoupons.length > 0 && (
                        <span style={{
                          background: 'rgba(212, 175, 55, 0.2)',
                          border: '1px solid rgba(212, 175, 55, 0.5)',
                          color: '#fef08a',
                          fontSize: '0.66rem',
                          padding: '1px 6px',
                          borderRadius: '9999px',
                          fontWeight: 700
                        }}>
                          {activeCoupons.length} Active
                        </span>
                      )}
                    </div>
                    {isCouponDropdownOpen ? <ChevronUp size={15} color="#d4af37" /> : <ChevronDown size={15} color="#d4af37" />}
                  </button>

                  {isCouponDropdownOpen && (
                    <div style={{ padding: '0 10px 12px 10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {activeCoupons.length === 0 ? (
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>
                          No published store coupons available right now.
                        </div>
                      ) : (
                        activeCoupons.map((c) => {
                          const isCurrent = appliedCoupon?.code?.toUpperCase() === c.code?.toUpperCase();
                          const meetsMin = subtotal >= Number(c.min_order_amount || 0);
                          const potentialDiscount = calculateCouponDiscount(c);
                          const amountNeeded = Math.max(0, Number(c.min_order_amount || 0) - subtotal);

                          return (
                            <div
                              key={c.id || c.code}
                              style={{
                                background: isCurrent ? 'rgba(16, 185, 129, 0.1)' : 'rgba(15, 23, 42, 0.65)',
                                border: isCurrent ? '1.5px solid #10b981' : meetsMin ? '1px solid rgba(212, 175, 55, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '8px',
                                padding: '10px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{
                                    background: 'rgba(212, 175, 55, 0.15)',
                                    border: '1px dashed #d4af37',
                                    borderRadius: '4px',
                                    padding: '2px 6px',
                                    color: '#fef08a',
                                    fontFamily: 'monospace',
                                    fontSize: '0.78rem',
                                    fontWeight: 800
                                  }}>
                                    {c.code}
                                  </span>
                                  <span style={{
                                    background: c.discount_type === 'bogo' ? 'linear-gradient(135deg, #ffd700 0%, #f59e0b 100%)' : '#d4af37',
                                    color: '#080a0f',
                                    fontSize: '0.66rem',
                                    fontWeight: 800,
                                    padding: '1px 6px',
                                    borderRadius: '3px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px'
                                  }}>
                                    {c.discount_type === 'bogo' 
                                      ? `BUY ${c.buy_qty || 1} GET ${c.get_qty || 1} ${Number(c.discount_percent_for_get || 100) === 100 ? 'FREE' : `${c.discount_percent_for_get}% OFF`}`
                                      : (c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`)}
                                  </span>
                                </div>

                                {isCurrent ? (
                                  <span style={{ color: '#10b981', fontSize: '0.74rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                    <Check size={13} /> Applied
                                  </span>
                                ) : meetsMin ? (
                                  <button
                                    type="button"
                                    disabled={couponLoading}
                                    onClick={() => handleApplyPublishedCoupon(c.code)}
                                    style={{
                                      background: 'linear-gradient(135deg, #d4af37 0%, #aa8010 100%)',
                                      border: 'none',
                                      borderRadius: '4px',
                                      padding: '4px 10px',
                                      color: '#080a0f',
                                      fontSize: '0.72rem',
                                      fontWeight: 700,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Apply
                                  </button>
                                ) : (
                                  <span style={{ color: '#94a3b8', fontSize: '0.68rem', fontWeight: 600 }}>
                                    <Lock size={10} style={{ display: 'inline', marginRight: '2px' }} /> Min ₹{Number(c.min_order_amount).toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>

                              <div style={{
                                fontSize: '0.72rem',
                                padding: '3px 6px',
                                borderRadius: '4px',
                                background: meetsMin ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                                color: meetsMin ? '#34d399' : '#94a3b8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}>
                                {meetsMin ? (
                                  <span>✨ Saves ₹{potentialDiscount.toLocaleString('en-IN')}</span>
                                ) : (
                                  <span>⚠️ Add ₹{amountNeeded.toLocaleString('en-IN')} more</span>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => handleCopyCode(e, c.code)}
                                  style={{ background: 'none', border: 'none', color: '#d4af37', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600, padding: 0 }}
                                >
                                  {copiedCode === c.code ? 'Copied' : 'Copy'}
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* Custom Promo Code Form */}
                {!appliedCoupon && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Enter Promo Code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#ffffff',
                        fontSize: '0.8rem',
                        fontFamily: 'monospace',
                        letterSpacing: '0.05em'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCustomCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      className="btn-luxury-gold"
                      style={{
                        padding: '8px 14px',
                        fontSize: '0.76rem',
                        borderRadius: '8px',
                        opacity: couponLoading || !couponInput.trim() ? 0.6 : 1,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {couponLoading ? 'Checking...' : 'Apply'}
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown with Distance Calculation */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', marginBottom: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>Subtotal</span>
                  <span style={{ color: '#f8fafc', fontWeight: 600 }}>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                    <span>Coupon Savings ({appliedCoupon?.code})</span>
                    <span style={{ fontWeight: 700 }}>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span>Delivery Charge</span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      (Fixed rate for all locations)
                    </span>
                  </div>
                  <span style={{ color: dynamicShippingFee === 0 ? '#10b981' : '#f8fafc', fontWeight: 600 }}>
                    {dynamicShippingFee === 0 ? 'FREE' : `₹${dynamicShippingFee.toLocaleString('en-IN')}`}
                  </span>
                </div>

                <div style={{ borderTop: '1px solid rgba(212, 175, 55, 0.3)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>Payable Total</span>
                  <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#d4af37' }}>
                    ₹{dynamicPayableTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Main Settlement Action Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-luxury-gold"
                style={{ 
                  width: '100%', 
                  padding: '16px', 
                  fontSize: '1rem', 
                  letterSpacing: '0.06em',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 8px 25px rgba(212, 175, 55, 0.25)',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1
                }}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Connecting Razorpay Gateway...</span>
                  </>
                ) : formData.payment_method === 'Razorpay' ? (
                  <>
                    <Lock size={18} />
                    <span>Pay with Razorpay (₹{dynamicPayableTotal.toLocaleString('en-IN')})</span>
                    <ArrowRight size={18} />
                  </>
                ) : (
                  <>
                    <span>Confirm Cash on Delivery (₹{dynamicPayableTotal.toLocaleString('en-IN')})</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {/* Trust & Authentication Seals */}
              <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} color="#d4af37" /> 100% Authentic Haute Parfumerie Guarantee
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Processed with PCI-DSS Level 1 Compliant 256-Bit Razorpay Infrastructure
                </div>
              </div>

            </div>
          </div>

        </div>
      </form>

    </div>
  );
};

export default Checkout;
