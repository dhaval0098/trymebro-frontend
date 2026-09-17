import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Tag,
  Sparkles,
  Gift,
  Clock,
  CheckCircle2,
  Calendar,
  Percent,
  DollarSign,
  Layers,
  Search,
  Check,
  ShieldCheck,
  HelpCircle,
  Eye,
  SlidersHorizontal,
  X
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

const initialCouponState = {
  code: '',
  description: '',
  discount_type: 'percentage',
  discount_value: '15',
  buy_qty: 1,
  get_qty: 1,
  discount_percent_for_get: 100,
  applicable_type: 'all',
  applicable_product_ids: [],
  applicable_category_ids: [],
  min_order_amount: '',
  max_discount_amount: '',
  expiry_date: '',
  usage_limit: '',
  is_active: true,
  is_published: true
};

const AdminCouponForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [couponForm, setCouponForm] = useState(initialCouponState);
  const [loadingInitial, setLoadingInitial] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // External reference data for BOGO scopes
  const [productsList, setProductsList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [couponProductSearch, setCouponProductSearch] = useState('');

  // Fetch initial coupon data if editing, plus products & categories for BOGO picker
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products?limit=100').catch(() => ({ data: { products: [] } })),
          api.get('/categories').catch(() => ({ data: { categories: [] } }))
        ]);

        if (isMounted) {
          if (prodRes.data?.products) setProductsList(prodRes.data.products);
          if (catRes.data?.categories) setCategories(catRes.data.categories);
        }

        if (isEditMode) {
          const res = await api.get(`/coupons/${id}`);
          if (res.data?.success && res.data?.coupon && isMounted) {
            const c = res.data.coupon;
            let parsedProdIds = [];
            if (c.applicable_product_ids) {
              try {
                parsedProdIds = typeof c.applicable_product_ids === 'string'
                  ? JSON.parse(c.applicable_product_ids)
                  : c.applicable_product_ids;
              } catch (e) {}
            }
            let parsedCatIds = [];
            if (c.applicable_category_ids) {
              try {
                parsedCatIds = typeof c.applicable_category_ids === 'string'
                  ? JSON.parse(c.applicable_category_ids)
                  : c.applicable_category_ids;
              } catch (e) {}
            }

            setCouponForm({
              code: c.code || '',
              description: c.description || '',
              discount_type: c.discount_type || 'percentage',
              discount_value: c.discount_value !== undefined ? String(c.discount_value) : '',
              buy_qty: c.buy_qty ? Number(c.buy_qty) : 1,
              get_qty: c.get_qty ? Number(c.get_qty) : 1,
              discount_percent_for_get: c.discount_percent_for_get !== undefined ? Number(c.discount_percent_for_get) : 100,
              applicable_type: c.applicable_type || 'all',
              applicable_product_ids: Array.isArray(parsedProdIds) ? parsedProdIds : [],
              applicable_category_ids: Array.isArray(parsedCatIds) ? parsedCatIds : [],
              min_order_amount: c.min_order_amount !== undefined ? String(c.min_order_amount) : '',
              max_discount_amount: c.max_discount_amount !== undefined && c.max_discount_amount !== null ? String(c.max_discount_amount) : '',
              expiry_date: c.expiry_date ? new Date(c.expiry_date).toISOString().slice(0, 10) : '',
              usage_limit: c.usage_limit !== undefined && c.usage_limit !== null ? String(c.usage_limit) : '',
              is_active: Boolean(c.is_active),
              is_published: Boolean(c.is_published)
            });
          }
        }
      } catch (err) {
        console.error('Failed to load coupon details:', err);
        toast.error('Failed to load coupon details.');
      } finally {
        if (isMounted) setLoadingInitial(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [id, isEditMode]);

  const handleSaveCoupon = async (e) => {
    if (e) e.preventDefault();

    if (!couponForm.code.trim()) {
      toast.error('Coupon code is required.');
      return;
    }

    const isBogo = couponForm.discount_type === 'bogo';
    if (!isBogo && (couponForm.discount_value === '' || isNaN(Number(couponForm.discount_value)) || Number(couponForm.discount_value) <= 0)) {
      toast.error('Please enter a valid positive discount value.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        code: couponForm.code.toUpperCase().trim(),
        description: couponForm.description.trim(),
        discount_type: couponForm.discount_type,
        discount_value: isBogo ? 100 : Number(couponForm.discount_value),
        buy_qty: parseInt(couponForm.buy_qty || 1, 10),
        get_qty: parseInt(couponForm.get_qty || 1, 10),
        discount_percent_for_get: parseInt(couponForm.discount_percent_for_get || 100, 10),
        applicable_type: couponForm.applicable_type || 'all',
        applicable_product_ids: couponForm.applicable_product_ids,
        applicable_category_ids: couponForm.applicable_category_ids,
        min_order_amount: couponForm.min_order_amount !== '' ? Number(couponForm.min_order_amount) : 0,
        max_discount_amount: couponForm.max_discount_amount !== '' && couponForm.max_discount_amount !== null ? Number(couponForm.max_discount_amount) : null,
        expiry_date: couponForm.expiry_date ? couponForm.expiry_date : null,
        usage_limit: couponForm.usage_limit !== '' && couponForm.usage_limit !== null ? parseInt(couponForm.usage_limit, 10) : null,
        is_active: Boolean(couponForm.is_active),
        is_published: Boolean(couponForm.is_published)
      };

      if (isEditMode) {
        const res = await api.put(`/coupons/${id}`, payload);
        if (res.data.success) {
          toast.success(`✨ Coupon "${payload.code}" updated successfully!`);
          navigate('/admin?tab=coupons');
        }
      } else {
        const res = await api.post('/coupons', payload);
        if (res.data.success) {
          toast.success(`🚀 Coupon "${payload.code}" created & broadcasted successfully!`);
          navigate('/admin?tab=coupons');
        }
      }
    } catch (err) {
      console.error('Save coupon error:', err);
      toast.error(err.response?.data?.message || 'Failed to save coupon code');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37' }}>
        <div className="gold-shimmer" style={{ padding: '24px 48px', borderRadius: '16px', textAlign: 'center' }}>
          <Clock size={24} className="spin" style={{ display: 'block', margin: '0 auto 12px auto' }} />
          Loading Coupon Configuration...
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(14px, 3vw, 28px) clamp(14px, 3vw, 32px) 80px', boxSizing: 'border-box' }}>
      
      {/* Top Header & Breadcrumb */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <Link
            to="/admin?tab=coupons"
            className="admin-back-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#d4af37',
              textDecoration: 'none',
              fontSize: '0.84rem',
              fontWeight: 700,
              background: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              padding: '8px 16px',
              borderRadius: '9999px',
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Coupons & Marketing</span>
          </Link>
          <span style={{ color: '#64748b' }}>/</span>
          <span style={{ color: '#f5df93', fontSize: '0.84rem', fontWeight: 600 }}>
            {isEditMode ? `Edit Coupon "${couponForm.code}"` : 'Create New Promotional Privilege'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => navigate('/admin?tab=coupons')}
            className="btn-luxury-outline"
            style={{ padding: '9px 18px', fontSize: '0.84rem' }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSaveCoupon}
            className="btn-luxury-gold"
            style={{ padding: '9px 22px', fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            {isSubmitting ? (
              <>
                <Clock size={15} className="spin" />
                <span>Saving Coupon...</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>{isEditMode ? 'Save Coupon Changes' : 'Publish Promo Code'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Headline Banner */}
      <div className="glass-panel" style={{ borderRadius: '18px', padding: 'clamp(18px, 3vw, 24px)', marginBottom: '24px', border: '1px solid rgba(212, 175, 55, 0.35)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(212, 175, 55, 0.15)',
            border: '1px solid var(--border-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#d4af37',
            flexShrink: 0
          }}>
            <Gift size={24} />
          </div>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ fontSize: '0.74rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, marginBottom: '2px' }}>
              PROMOTIONAL ARCHITECTURE & CLIENT PRIVILEGES
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.3rem, 3.2vw, 1.85rem)', color: '#ffffff', margin: '0 0 4px 0', lineHeight: 1.2 }}>
              {isEditMode ? `Edit Coupon Code: ${couponForm.code}` : 'Configure New Discount Privilege'}
            </h1>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>
              Set up percentage discounts, flat fee vouchers, or Buy X Get Y Free (BOGO) bundles broadcasted across the TRY ME BRO boutique.
            </p>
          </div>
        </div>
      </div>

      {/* Form Grid 2-Column Responsive Layout */}
      <form onSubmit={handleSaveCoupon}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
          gap: '24px',
          alignItems: 'start'
        }}>
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: Identity, Type & Discount Parameters         */}
          {/* ========================================================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', minWidth: 0, width: '100%', boxSizing: 'border-box' }}>
            
            {/* Card 1: Core Code & Headline */}
            <div className="glass-card" style={{ padding: 'clamp(16px, 3vw, 24px)', borderRadius: '16px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                <Tag size={18} color="#d4af37" />
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: '#f8fafc', margin: 0 }}>
                  Coupon Code & Description
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Coupon Code */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '4px' }}>
                    <label style={{ fontSize: '0.80rem', color: '#f5df93', fontWeight: 600 }}>
                      Coupon / Offer Code (Uppercase) *
                    </label>
                    <span style={{ fontSize: '0.70rem', color: '#94a3b8' }}>Customers enter this at checkout</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                    placeholder="e.g. BOGO2026, ROYALTY15, LUXE1000"
                    className="form-input-luxury"
                    style={{ fontFamily: 'monospace', letterSpacing: '0.08em', fontWeight: 700, fontSize: '1rem', width: '100%', boxSizing: 'border-box' }}
                  />

                  {/* Quick Code Ideas */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                    <span style={{ fontSize: '0.70rem', color: '#cbd5e1' }}>Quick Suggestions:</span>
                    {['BOGO2026', 'ROYALTY15', 'LUXE1000', 'WELCOME10', 'TRYMEVIP'].map(suggested => (
                      <button
                        key={suggested}
                        type="button"
                        onClick={() => setCouponForm({ ...couponForm, code: suggested })}
                        style={{
                          background: 'rgba(212, 175, 55, 0.08)',
                          border: '1px solid rgba(212, 175, 55, 0.25)',
                          borderRadius: '6px',
                          padding: '2px 8px',
                          fontSize: '0.68rem',
                          color: '#f5df93',
                          fontFamily: 'monospace',
                          cursor: 'pointer'
                        }}
                      >
                        {suggested}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Offer Headline & Description */}
                <div>
                  <label style={{ fontSize: '0.80rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Offer Headline & Description (Shown on Ticker & Checkout Drawer)
                  </label>
                  <input
                    type="text"
                    value={couponForm.description}
                    onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                    placeholder="e.g. 15% Off Orders Above ₹5,000 | Buy 1 Extrait, Get 1 Free!"
                    className="form-input-luxury"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Discount Mechanism & Values */}
            <div className="glass-card" style={{ padding: 'clamp(16px, 3vw, 24px)', borderRadius: '16px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                <Percent size={18} color="#d4af37" />
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: '#f8fafc', margin: 0 }}>
                  Promotional Discount Type
                </h3>
              </div>

              {/* 3-Way Type Selector Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '10px', marginBottom: '18px' }}>
                {[
                  { type: 'percentage', label: 'Percentage (%)', desc: 'e.g. 15% Off Total Cart', icon: Percent },
                  { type: 'fixed', label: 'Flat Amount (₹)', desc: 'e.g. Flat ₹1,000 Off Total', icon: DollarSign },
                  { type: 'bogo', label: '🎁 Buy X Get Y (BOGO)', desc: 'e.g. Buy 1 Get 1 Free', icon: Gift }
                ].map(t => {
                  const Icon = t.icon;
                  const isSelected = couponForm.discount_type === t.type;
                  return (
                    <button
                      type="button"
                      key={t.type}
                      onClick={() => setCouponForm({ ...couponForm, discount_type: t.type })}
                      style={{
                        background: isSelected ? 'rgba(212, 175, 55, 0.16)' : 'rgba(255,255,255,0.03)',
                        border: isSelected ? '1.5px solid #d4af37' : '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? '0 4px 15px rgba(212, 175, 55, 0.2)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Icon size={16} color={isSelected ? '#ffd700' : '#94a3b8'} />
                        {isSelected && <span style={{ fontSize: '0.66rem', color: '#10b981', fontWeight: 700 }}>ACTIVE</span>}
                      </div>
                      <span style={{ fontSize: '0.84rem', fontWeight: 700, color: isSelected ? '#f5df93' : '#ffffff', marginTop: '4px' }}>
                        {t.label}
                      </span>
                      <span style={{ fontSize: '0.70rem', color: '#94a3b8', lineHeight: 1.3 }}>
                        {t.desc}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Specific Mode Inputs */}
              {couponForm.discount_type === 'bogo' ? (
                /* BOGO Configuration Section */
                <div style={{
                  background: 'rgba(10, 14, 22, 0.95)',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  borderRadius: '14px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontSize: '0.84rem', color: '#f5df93', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Gift size={16} color="#d4af37" /> BOGO Bundle Mechanics
                    </span>
                  </div>

                  {/* Quick BOGO Presets */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 600 }}>1-Click Presets:</span>
                    {[
                      { label: 'Buy 1 Get 1 Free', buy: 1, get: 1, pct: 100 },
                      { label: 'Buy 2 Get 1 Free', buy: 2, get: 1, pct: 100 },
                      { label: 'Buy 3 Get 1 Free', buy: 3, get: 1, pct: 100 },
                      { label: 'Buy 2 Get 2 Free', buy: 2, get: 2, pct: 100 },
                      { label: 'Buy 1 Get 2nd at 50% Off', buy: 1, get: 1, pct: 50 }
                    ].map((preset, pIdx) => (
                      <button
                        type="button"
                        key={pIdx}
                        onClick={() => setCouponForm({
                          ...couponForm,
                          buy_qty: preset.buy,
                          get_qty: preset.get,
                          discount_percent_for_get: preset.pct,
                          description: couponForm.description || preset.label
                        })}
                        className="btn-luxury-outline"
                        style={{ padding: '3px 8px', fontSize: '0.70rem', borderRadius: '6px' }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* BOGO Quantity Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.76rem', color: '#f5df93', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Customer Buys (Qty) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={couponForm.buy_qty || 1}
                        onChange={(e) => setCouponForm({ ...couponForm, buy_qty: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                        className="form-input-luxury"
                        style={{ padding: '8px 12px', fontSize: '0.88rem', fontWeight: 700, width: '100%', boxSizing: 'border-box' }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.76rem', color: '#10b981', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Customer Gets (Qty) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={couponForm.get_qty || 1}
                        onChange={(e) => setCouponForm({ ...couponForm, get_qty: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                        className="form-input-luxury"
                        style={{ padding: '8px 12px', fontSize: '0.88rem', fontWeight: 700, width: '100%', boxSizing: 'border-box' }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.76rem', color: '#ffd700', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Free Item Discount (%)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={couponForm.discount_percent_for_get || 100}
                        onChange={(e) => setCouponForm({ ...couponForm, discount_percent_for_get: Math.min(100, Math.max(1, parseInt(e.target.value, 10) || 100)) })}
                        className="form-input-luxury"
                        style={{ padding: '8px 12px', fontSize: '0.88rem', width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  {/* Live Rule Summary Card */}
                  <div style={{
                    background: 'rgba(212, 175, 55, 0.08)',
                    border: '1px solid rgba(212, 175, 55, 0.25)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '0.78rem',
                    color: '#f5df93',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    lineHeight: 1.4
                  }}>
                    <Sparkles size={16} color="#d4af37" style={{ flexShrink: 0 }} />
                    <span>
                      Rule: Customer buys <strong>{couponForm.buy_qty || 1}</strong> bottle(s) and gets <strong>{couponForm.get_qty || 1}</strong> bottle(s) at <strong>{couponForm.discount_percent_for_get || 100}% off</strong>. Lowest-priced qualifying bottles in the cart are discounted automatically.
                    </span>
                  </div>

                  {/* Scope Selector */}
                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                      Applicable Perfumes Scope:
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                      {[
                        { val: 'all', label: 'All Perfumes in Store' },
                        { val: 'specific', label: `Target Specific Perfumes (${(couponForm.applicable_product_ids || []).length} Selected)` },
                        { val: 'category', label: 'Target Fragrance Family / Category' }
                      ].map(scope => (
                        <button
                          type="button"
                          key={scope.val}
                          onClick={() => setCouponForm({ ...couponForm, applicable_type: scope.val })}
                          className={couponForm.applicable_type === scope.val ? "btn-luxury-gold" : "btn-luxury-outline"}
                          style={{ padding: '5px 12px', fontSize: '0.74rem', borderRadius: '8px' }}
                        >
                          {scope.label}
                        </button>
                      ))}
                    </div>

                    {/* Specific Perfumes Multi-Select Picker */}
                    {couponForm.applicable_type === 'specific' && (
                      <div style={{
                        background: 'rgba(8, 10, 15, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <input
                            type="text"
                            placeholder="Search perfumes to include..."
                            value={couponProductSearch}
                            onChange={(e) => setCouponProductSearch(e.target.value)}
                            className="form-input-luxury"
                            style={{ padding: '6px 10px', fontSize: '0.78rem', flex: 1, minWidth: '160px' }}
                          />
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => setCouponForm({ ...couponForm, applicable_product_ids: productsList.map(p => p.id) })}
                              className="btn-luxury-outline"
                              style={{ padding: '4px 8px', fontSize: '0.70rem' }}
                            >
                              Select All ({productsList.length})
                            </button>
                            <button
                              type="button"
                              onClick={() => setCouponForm({ ...couponForm, applicable_product_ids: [] })}
                              className="btn-luxury-outline"
                              style={{ padding: '4px 8px', fontSize: '0.70rem' }}
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        {/* Product Checkboxes */}
                        <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: '4px' }}>
                          {productsList
                            .filter(p => !couponProductSearch || (p.name || '').toLowerCase().includes(couponProductSearch.toLowerCase()) || (p.brand_name || '').toLowerCase().includes(couponProductSearch.toLowerCase()))
                            .map(p => {
                              const isSelected = (couponForm.applicable_product_ids || []).includes(p.id);
                              return (
                                <label
                                  key={p.id}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '6px 8px',
                                    borderRadius: '6px',
                                    background: isSelected ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.02)',
                                    border: isSelected ? '1px solid rgba(212, 175, 55, 0.35)' : '1px solid transparent',
                                    cursor: 'pointer',
                                    fontSize: '0.78rem'
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      const current = couponForm.applicable_product_ids || [];
                                      if (e.target.checked) {
                                        setCouponForm({ ...couponForm, applicable_product_ids: [...current, p.id] });
                                      } else {
                                        setCouponForm({ ...couponForm, applicable_product_ids: current.filter(id => id !== p.id) });
                                      }
                                    }}
                                    style={{ accentColor: '#d4af37' }}
                                  />
                                  {p.primary_image && (
                                    <img src={p.primary_image} alt="" style={{ width: '26px', height: '26px', borderRadius: '4px', objectFit: 'cover' }} />
                                  )}
                                  <span style={{ fontWeight: 600, color: isSelected ? '#f5df93' : '#cbd5e1' }}>
                                    {p.name}
                                  </span>
                                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginLeft: 'auto' }}>
                                    ₹{Number(p.discount_price || p.price).toLocaleString('en-IN')}
                                  </span>
                                </label>
                              );
                            })}
                        </div>
                      </div>
                    )}

                    {/* Category Multi-Select Picker */}
                    {couponForm.applicable_type === 'category' && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', background: 'rgba(8, 10, 15, 0.9)', padding: '12px', borderRadius: '8px' }}>
                        {categories.map(cat => {
                          const isSelected = (couponForm.applicable_category_ids || []).includes(cat.id);
                          return (
                            <button
                              type="button"
                              key={cat.id}
                              onClick={() => {
                                const current = couponForm.applicable_category_ids || [];
                                if (isSelected) {
                                  setCouponForm({ ...couponForm, applicable_category_ids: current.filter(id => id !== cat.id) });
                                } else {
                                  setCouponForm({ ...couponForm, applicable_category_ids: [...current, cat.id] });
                                }
                              }}
                              className={isSelected ? "btn-luxury-gold" : "btn-luxury-outline"}
                              style={{ padding: '4px 10px', fontSize: '0.74rem', borderRadius: '6px' }}
                            >
                              {isSelected ? '✓ ' : '+ '}{cat.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Standard Percentage or Fixed Inputs */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.80rem', color: '#f5df93', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                      Discount Value ({couponForm.discount_type === 'percentage' ? '%' : '₹'}) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max={couponForm.discount_type === 'percentage' ? '99' : '100000'}
                      value={couponForm.discount_value}
                      onChange={(e) => setCouponForm({ ...couponForm, discount_value: e.target.value })}
                      placeholder={couponForm.discount_type === 'percentage' ? '15' : '1000'}
                      className="form-input-luxury"
                      style={{ width: '100%', boxSizing: 'border-box', fontSize: '1rem', fontWeight: 700 }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.80rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                      Max Discount Cap (₹ Optional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={couponForm.max_discount_amount}
                      onChange={(e) => setCouponForm({ ...couponForm, max_discount_amount: e.target.value })}
                      placeholder="e.g. 2500 (Leave empty for no limit)"
                      className="form-input-luxury"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Limits, Scheduling & Live Preview           */}
          {/* ========================================================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', minWidth: 0, width: '100%', boxSizing: 'border-box' }}>
            
            {/* Card 3: Minimum Order & Usage Limits */}
            <div className="glass-card" style={{ padding: 'clamp(16px, 3vw, 24px)', borderRadius: '16px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                <SlidersHorizontal size={18} color="#d4af37" />
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: '#f8fafc', margin: 0 }}>
                  Order Minimums & Redemption Limits
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Minimum Order Subtotal (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={couponForm.min_order_amount}
                    onChange={(e) => setCouponForm({ ...couponForm, min_order_amount: e.target.value })}
                    placeholder="0 (No minimum)"
                    className="form-input-luxury"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px', display: 'block' }}>
                    0 means no minimum required
                  </span>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Total Redemptions Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={couponForm.usage_limit}
                    onChange={(e) => setCouponForm({ ...couponForm, usage_limit: e.target.value })}
                    placeholder="e.g. 500 (Leave empty for unlimited)"
                    className="form-input-luxury"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px', display: 'block' }}>
                    Max times this code can be used storewide
                  </span>
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={couponForm.expiry_date}
                  onChange={(e) => setCouponForm({ ...couponForm, expiry_date: e.target.value })}
                  className="form-input-luxury"
                  style={{ width: '100%', boxSizing: 'border-box', colorScheme: 'dark' }}
                />
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px', display: 'block' }}>
                  Leave empty if this privilege never expires
                </span>
              </div>
            </div>

            {/* Card 4: Storefront Visibility & Activation Toggles */}
            <div className="glass-card" style={{ padding: 'clamp(16px, 3vw, 24px)', borderRadius: '16px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                <Eye size={18} color="#d4af37" />
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: '#f8fafc', margin: 0 }}>
                  Storefront Broadcast & Status
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                {/* Active Checkbox */}
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: couponForm.is_active ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.02)',
                  border: couponForm.is_active ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.06)',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={couponForm.is_active}
                    onChange={(e) => setCouponForm({ ...couponForm, is_active: e.target.checked })}
                    style={{ accentColor: '#10b981', width: '18px', height: '18px', flexShrink: 0 }}
                  />
                  <div>
                    <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#f8fafc', display: 'block' }}>
                      Active Status (Eligible for Checkout Redemption)
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      When unchecked, customers cannot apply this code even if they know it.
                    </span>
                  </div>
                </label>

                {/* Published Checkbox */}
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: couponForm.is_published ? 'rgba(212, 175, 55, 0.08)' : 'rgba(255,255,255,0.02)',
                  border: couponForm.is_published ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(255,255,255,0.06)',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={couponForm.is_published}
                    onChange={(e) => setCouponForm({ ...couponForm, is_published: e.target.checked })}
                    style={{ accentColor: '#d4af37', width: '18px', height: '18px', flexShrink: 0 }}
                  />
                  <div>
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f5df93', display: 'block' }}>
                      🚀 Publish to Storefront Announcements
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      Auto-broadcasts to top header announcement ticker and client checkout drawer so buyers can copy in 1-click.
                    </span>
                  </div>
                </label>
              </div>

              {/* Live Preview Ticket Box */}
              <div style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px dashed rgba(212, 175, 55, 0.4)',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                    STOREFRONT PREVIEW TICKET
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', letterSpacing: '0.06em', margin: '2px 0' }}>
                    {couponForm.code || 'COUPONCODE'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>
                    {couponForm.description || (couponForm.discount_type === 'bogo' ? `Buy ${couponForm.buy_qty}, Get ${couponForm.get_qty} Free!` : `${couponForm.discount_value}${couponForm.discount_type === 'percentage' ? '%' : '₹'} Discount`)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    background: couponForm.is_active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                    color: couponForm.is_active ? '#6ee7b7' : '#fda4af',
                    fontWeight: 700
                  }}>
                    {couponForm.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Sticky Action Footer Bar */}
        <div style={{
          marginTop: '32px',
          padding: 'clamp(14px, 3vw, 20px)',
          background: 'rgba(6, 9, 16, 0.98)',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.85)',
          boxSizing: 'border-box',
          width: '100%',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '0.82rem', flexWrap: 'wrap' }}>
            <ShieldCheck size={16} color="#d4af37" style={{ flexShrink: 0 }} />
            <span>Ready to activate across all client carts and boutique checkout channels</span>
          </div>

          <div className="admin-form-actions-grid">
            <button
              type="button"
              onClick={() => navigate('/admin?tab=coupons')}
              className="btn-luxury-outline"
              style={{
                fontSize: '0.84rem',
                fontWeight: 600
              }}
            >
              Cancel & Return
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-luxury-gold"
              style={{
                fontSize: '0.86rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isSubmitting ? (
                <>
                  <Clock size={16} className="spin" />
                  <span>Saving Privilege...</span>
                </>
              ) : (
                <>
                  <Save size={16} style={{ flexShrink: 0 }} />
                  <span>{isEditMode ? 'Save Coupon Changes' : 'Publish Promo Code'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

    </div>
  );
};

export default AdminCouponForm;
