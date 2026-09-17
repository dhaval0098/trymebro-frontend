import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Tag, 
  Sparkles, 
  Check, 
  X,
  ChevronDown,
  ChevronUp,
  Gift,
  Percent,
  Copy,
  Lock,
  Flame
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

const Cart = () => {
  const { 
    cartItems, 
    totalItemsCount, 
    subtotal, 
    discount, 
    shippingFee, 
    finalTotal, 
    freeShippingThreshold, 
    appliedCoupon, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    applyCoupon, 
    removeCoupon 
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [publishedCoupons, setPublishedCoupons] = useState([]);
  const [isCouponDropdownOpen, setIsCouponDropdownOpen] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Fetch live published coupons
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await api.get('/coupons/public');
        if (res.data?.coupons) {
          setPublishedCoupons(res.data.coupons);
        }
      } catch (e) {
        console.error('Failed to load active coupons:', e);
      }
    };
    fetchCoupons();
  }, []);

  // Filter only valid active and published coupons
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

  const handleApplyCouponFromDropdown = async (code) => {
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

  const handleProceedCheckout = () => {
    if (!user || !token) {
      toast.info('Please sign in or create an account to proceed to checkout.');
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    navigate('/checkout');
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    await applyCoupon(couponCode.trim());
    setCouponLoading(false);
    setCouponCode('');
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ maxWidth: '780px', margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '60px 30px', borderRadius: '24px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid var(--border-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto'
          }}>
            <ShoppingBag size={36} color="#d4af37" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#ffffff', marginBottom: '12px' }}>
            Your Fragrance Bag is Empty
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#94a3b8', maxWidth: '460px', margin: '0 auto 28px auto', lineHeight: '1.6' }}>
            Explore our curated catalog of rare extrait de parfums, oriental woods, and timeless bouquets.
          </p>
          <Link to="/shop" className="btn-luxury-gold" style={{ padding: '14px 36px', fontSize: '0.95rem' }}>
            Discover Perfume Collection <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div style={{ maxWidth: '1360px', margin: '40px auto', padding: '0 20px' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '0.8rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: '4px' }}>
          SHOPPING BAG SELECTION
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: '#ffffff' }}>
          Your Fragrance Bag ({totalItemsCount} {totalItemsCount === 1 ? 'Bottle' : 'Bottles'})
        </h1>
      </div>

      {/* Free Shipping Progress Bar */}
      <div className="glass-panel" style={{ borderRadius: '14px', padding: '16px 24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.88rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc', fontWeight: 600 }}>
            <Truck size={18} color="#d4af37" />
            {amountNeededForFreeShipping === 0 ? (
              <span style={{ color: '#6ee7b7' }}>✨ You have unlocked Complimentary Express White-Glove Delivery!</span>
            ) : (
              <span>Add <strong style={{ color: '#d4af37' }}>₹{amountNeededForFreeShipping.toLocaleString('en-IN')}</strong> more to unlock Free Express Shipping</span>
            )}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#d4af37', fontWeight: 700 }}>{freeShippingProgress}%</span>
        </div>
        <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
          <div style={{
            width: `${freeShippingProgress}%`,
            height: '100%',
            background: 'var(--gold-gradient)',
            transition: 'width 0.4s ease'
          }} />
        </div>
      </div>

      {/* Main Cart Grid (2 Columns) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
        gap: 'clamp(20px, 4vw, 36px)',
        alignItems: 'start'
      }}>
        
        {/* LEFT: Items List */}
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {cartItems.map(item => {
              const itemPrice = Number(item.active_price || item.discount_price || item.price);
              const originalPrice = Number(item.price);
              const hasDiscount = item.discount_price && Number(item.discount_price) < originalPrice;

              return (
                <div 
                  key={item.product_id} 
                  className="glass-card cart-item-card" 
                  style={{
                    padding: 'clamp(12px, 2.5vw, 20px)',
                    borderRadius: '16px',
                    display: 'flex',
                    gap: 'clamp(12px, 2.5vw, 20px)',
                    alignItems: 'center'
                  }}
                >
                  
                  {/* Thumbnail */}
                  <Link 
                    to={`/product/${item.slug || item.product_id}`} 
                    className="cart-item-thumbnail"
                    style={{
                      width: 'clamp(70px, 18vw, 90px)',
                      height: 'clamp(70px, 18vw, 90px)',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      backgroundColor: '#0a0d14',
                      flexShrink: 0
                    }}
                  >
                    <img src={item.primary_image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Link>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.72rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                      {item.brand_name || 'Luxury Perfumes'} • {item.concentration || 'Eau de Parfum'}
                    </div>
                    <Link to={`/product/${item.slug || item.product_id}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{ fontSize: 'clamp(0.92rem, 2.5vw, 1.05rem)', fontWeight: 600, color: '#f8fafc', margin: '2px 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.name}
                      </h3>
                    </Link>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginBottom: '6px' }}>
                      Size: {item.selected_size || (item.volume_ml ? `${item.volume_ml}ml` : '100ml')} Bottle
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                        ₹{itemPrice.toLocaleString('en-IN')}
                      </span>
                      {hasDiscount && (
                        <span style={{ fontSize: '0.76rem', color: '#64748b', textDecoration: 'line-through' }}>
                          ₹{originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity and Line Total */}
                  <div 
                    className="cart-item-controls"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '8px',
                      flexShrink: 0
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '9999px',
                      padding: '2px 8px',
                      background: 'rgba(15, 19, 28, 0.6)'
                    }}>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        style={{ background: 'transparent', border: 'none', color: '#f8fafc', cursor: 'pointer', padding: '2px 6px', fontSize: '1rem' }}
                      >
                        -
                      </button>
                      <span style={{ margin: '0 8px', fontWeight: 700, fontSize: '0.88rem' }}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        style={{ background: 'transparent', border: 'none', color: '#f8fafc', cursor: 'pointer', padding: '2px 6px', fontSize: '1rem' }}
                      >
                        +
                      </button>
                    </div>

                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#d4af37' }}>
                      ₹{(itemPrice * item.quantity).toLocaleString('en-IN')}
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      style={{ background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.76rem' }}
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '10px', marginTop: '16px' }}>
            <button
              onClick={clearCart}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Empty entire bag
            </button>
            <Link to="/shop" style={{ color: '#d4af37', fontSize: '0.84rem', fontWeight: 600 }}>
              ← Continue Discovering Fragrances
            </Link>
          </div>
        </div>

        {/* RIGHT: Order Summary & Coupon */}
        <div>
          <div className="glass-panel" style={{ borderRadius: '20px', padding: 'clamp(18px, 3vw, 28px)', position: 'sticky', top: '100px' }}>
            
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: '#ffffff', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
              Order Financials
            </h2>

            {/* Financial Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                <span>Artisanal Subtotal</span>
                <span style={{ color: '#f8fafc', fontWeight: 600 }}>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                  <span>VIP Privileged Discount</span>
                  <span style={{ fontWeight: 600 }}>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                <span>White-Glove Express Shipping</span>
                <span style={{ color: shippingFee === 0 ? '#10b981' : '#f8fafc', fontWeight: 600 }}>
                  {shippingFee === 0 ? 'COMPLIMENTARY' : `₹${shippingFee.toLocaleString('en-IN')}`}
                </span>
              </div>

              <div style={{ borderTop: '1px solid rgba(212, 175, 55, 0.3)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>Grand Total</span>
                <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#d4af37' }}>
                  ₹{finalTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Active Coupons & Promotional Privilege Section */}
            <div style={{ marginBottom: '24px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
              
              {/* Applied Coupon Status Banner */}
              {appliedCoupon && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 78, 59, 0.25) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.45)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#10b981'
                    }}>
                      <Check size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#6ee7b7', letterSpacing: '0.05em' }}>
                        CODE APPLIED: {appliedCoupon.code}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#e2e8f0' }}>
                        You save <strong style={{ color: '#34d399' }}>₹{discount.toLocaleString('en-IN')}</strong> on this order!
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={removeCoupon} 
                    style={{ 
                      background: 'rgba(244, 63, 94, 0.15)', 
                      border: '1px solid rgba(244, 63, 94, 0.3)', 
                      borderRadius: '8px',
                      color: '#f43f5e', 
                      cursor: 'pointer',
                      padding: '6px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s ease'
                    }}
                    title="Remove coupon"
                  >
                    <X size={14} /> Remove
                  </button>
                </div>
              )}

              {/* Active Coupons Accordion / Dropdown */}
              <div style={{
                background: 'rgba(212, 175, 55, 0.04)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '14px',
                overflow: 'hidden',
                marginBottom: '16px'
              }}>
                {/* Dropdown Header Trigger */}
                <button
                  type="button"
                  onClick={() => setIsCouponDropdownOpen(!isCouponDropdownOpen)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    color: '#f5df93',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Gift size={16} color="#d4af37" />
                    <span>Available Privilege Coupons</span>
                    {activeCoupons.length > 0 && (
                      <span style={{
                        background: 'rgba(212, 175, 55, 0.2)',
                        border: '1px solid rgba(212, 175, 55, 0.5)',
                        color: '#fef08a',
                        fontSize: '0.7rem',
                        padding: '2px 7px',
                        borderRadius: '9999px',
                        fontWeight: 700
                      }}>
                        {activeCoupons.length} Active
                      </span>
                    )}
                  </div>
                  {isCouponDropdownOpen ? <ChevronUp size={16} color="#d4af37" /> : <ChevronDown size={16} color="#d4af37" />}
                </button>

                {/* Dropdown Items */}
                {isCouponDropdownOpen && (
                  <div style={{ padding: '0 12px 14px 12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {activeCoupons.length === 0 ? (
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', padding: '12px 0' }}>
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
                              background: isCurrent 
                                ? 'rgba(16, 185, 129, 0.1)' 
                                : 'rgba(15, 23, 42, 0.65)',
                              border: isCurrent 
                                ? '1.5px solid #10b981' 
                                : meetsMin 
                                  ? '1px solid rgba(212, 175, 55, 0.35)' 
                                  : '1px solid rgba(255, 255, 255, 0.08)',
                              borderRadius: '10px',
                              padding: '12px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px',
                              transition: 'all 0.2s ease',
                              position: 'relative'
                            }}
                          >
                            {/* Top row: Code + Discount Pill + Action Button */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {/* Coupon Code Tag */}
                                <div style={{
                                  background: 'rgba(212, 175, 55, 0.15)',
                                  border: '1px dashed #d4af37',
                                  borderRadius: '6px',
                                  padding: '3px 8px',
                                  color: '#fef08a',
                                  fontFamily: 'monospace',
                                  fontSize: '0.84rem',
                                  fontWeight: 800,
                                  letterSpacing: '0.08em',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  <Tag size={12} color="#d4af37" />
                                  <span>{c.code}</span>
                                </div>

                                {/* Discount Value Badge */}
                                <span style={{
                                  background: c.discount_type === 'bogo' || c.discount_type === 'buy_x_get_y' 
                                    ? 'linear-gradient(135deg, #ffd700 0%, #f59e0b 100%)' 
                                    : 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
                                  color: '#080a0f',
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  padding: '2px 7px',
                                  borderRadius: '4px',
                                  letterSpacing: '0.04em',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}>
                                  {c.discount_type === 'bogo' || c.discount_type === 'buy_x_get_y'
                                    ? `BUY ${c.buy_qty || 1} GET ${c.get_qty || 1} ${Number(c.discount_percent_for_get || 100) === 100 ? 'FREE' : `${c.discount_percent_for_get}% OFF`}`
                                    : (c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`)}
                                </span>
                              </div>

                              {/* Action Button */}
                              {isCurrent ? (
                                <span style={{
                                  color: '#10b981',
                                  fontSize: '0.76rem',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  <Check size={14} /> Applied
                                </span>
                              ) : meetsMin ? (
                                <button
                                  type="button"
                                  disabled={couponLoading}
                                  onClick={() => handleApplyCouponFromDropdown(c.code)}
                                  style={{
                                    background: 'linear-gradient(135deg, #d4af37 0%, #aa8010 100%)',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '5px 12px',
                                    color: '#080a0f',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 2px 8px rgba(212, 175, 55, 0.25)'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.15)'}
                                  onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                                >
                                  Apply Code
                                </button>
                              ) : (
                                <span style={{
                                  color: '#94a3b8',
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}>
                                  <Lock size={11} /> Min ₹{Number(c.min_order_amount).toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>

                            {/* Description & Savings Calculation */}
                            <div style={{ fontSize: '0.76rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                              {c.description || (c.discount_type === 'percentage' ? `Enjoy ${c.discount_value}% privileged discount` : `Save flat ₹${c.discount_value}`)}
                              {c.max_discount_amount && (
                                <span style={{ color: '#94a3b8' }}> (Max cap ₹{Number(c.max_discount_amount).toLocaleString('en-IN')})</span>
                              )}
                            </div>

                            {/* Live Calculation Preview Banner */}
                            <div style={{
                              fontSize: '0.75rem',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              background: meetsMin ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                              color: meetsMin ? '#34d399' : '#94a3b8',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}>
                              {meetsMin ? (
                                <span>✨ <strong>Calculated Saving:</strong> Saves ₹{potentialDiscount.toLocaleString('en-IN')} on this order</span>
                              ) : (
                                <span>⚠️ Add <strong>₹{amountNeeded.toLocaleString('en-IN')}</strong> more to unlock this code</span>
                              )}

                              <button
                                type="button"
                                onClick={(e) => handleCopyCode(e, c.code)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#d4af37',
                                  cursor: 'pointer',
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  padding: 0
                                }}
                                title="Copy code"
                              >
                                {copiedCode === c.code ? <Check size={11} color="#10b981" /> : <Copy size={11} />}
                                <span>{copiedCode === c.code ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Manual Custom Code Input */}
              {!appliedCoupon && (
                <form onSubmit={handleApplyCoupon}>
                  <label style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Or Enter Custom Promo Code
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="e.g. WELCOME10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="form-input-luxury"
                      style={{ padding: '10px 14px', fontSize: '0.85rem' }}
                    />
                    <button
                      type="submit"
                      disabled={couponLoading || !couponCode.trim()}
                      className="btn-luxury-gold"
                      style={{ padding: '10px 18px', borderRadius: '10px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
                    >
                      {couponLoading ? 'Checking...' : 'Apply'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Account Requirement Notice for Guests */}
            {!user && (
              <div style={{
                background: 'rgba(212, 175, 55, 0.08)',
                border: '1px dashed rgba(212, 175, 55, 0.35)',
                borderRadius: '12px',
                padding: '12px 14px',
                marginBottom: '16px',
                fontSize: '0.8rem',
                color: '#f5df93',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px'
              }}>
                <span>🔒 Sign in required to complete order.</span>
                <Link to="/login" state={{ from: { pathname: '/checkout' } }} style={{ color: '#ffffff', textDecoration: 'underline', fontWeight: 600, fontSize: '0.78rem' }}>
                  Sign In →
                </Link>
              </div>
            )}

            {/* Checkout CTA */}
            <button
              onClick={handleProceedCheckout}
              className="btn-luxury-gold"
              style={{ width: '100%', padding: '16px', fontSize: '1rem', letterSpacing: '0.08em' }}
            >
              {user ? 'Proceed to Secure Checkout' : 'Sign In & Proceed to Checkout'} <ArrowRight size={18} />
            </button>

            {/* Guarantees */}
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.76rem', color: '#94a3b8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={14} color="#d4af37" /> 256-Bit Bank-Grade Encrypted Checkout
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={14} color="#d4af37" /> Includes 2 Free Artisanal Discovery Vials
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default Cart;
