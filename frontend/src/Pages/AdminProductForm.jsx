import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Tag,
  Percent,
  Sparkles,
  Upload,
  X,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

const ImageUploadField = ({ label, value, onChange, id }) => {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPG, PNG, WebP)');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      try {
        const res = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data?.url || res.data?.path) {
          onChange(res.data.url || res.data.path);
          toast.success('📷 Photo uploaded from device!');
          setUploading(false);
          return;
        }
      } catch (uploadErr) {
        console.warn('Server upload failed, falling back to base64 data URL');
      }

      // Fallback to base64 Data URL
      const reader = new FileReader();
      reader.onload = () => {
        onChange(reader.result);
        toast.success('📷 Photo loaded from device!');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File processing error:', err);
      toast.error('Failed to load image from device');
      setUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '4px' }}>
        <label style={{ fontSize: '0.8rem', color: '#f5df93', fontWeight: 600, margin: 0 }}>
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {showUrlInput ? 'Switch to Device File Upload' : 'Paste URL instead'}
        </button>
      </div>

      {showUrlInput ? (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://images.unsplash.com/..."
          className="form-input-luxury"
          style={{ width: '100%', boxSizing: 'border-box' }}
        />
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {value && (
            <div style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '12px', overflow: 'hidden', border: '1.5px solid #d4af37', flexShrink: 0, background: '#0a0d14' }}>
              <img src={value} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                type="button"
                onClick={() => onChange('')}
                style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.7)', border: 'none', color: '#f43f5e', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
                title="Remove photo"
              >
                <X size={12} />
              </button>
            </div>
          )}

          <label
            htmlFor={`file-upload-${id}`}
            style={{
              flex: 1,
              minWidth: '180px',
              padding: '12px 16px',
              background: 'rgba(212, 175, 55, 0.08)',
              border: '1.5px dashed rgba(212, 175, 55, 0.4)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: '#f5df93',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: uploading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box',
              userSelect: 'none'
            }}
          >
            {uploading ? (
              <span>Uploading Photo...</span>
            ) : (
              <>
                <Upload size={16} color="#d4af37" />
                <span>{value ? 'Change Photo from Device' : 'Choose File from Device / Gallery'}</span>
              </>
            )}
            <input
              id={`file-upload-${id}`}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        </div>
      )}
    </div>
  );
};

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discountPercent, setDiscountPercent] = useState('');

  const [productForm, setProductForm] = useState({
    name: '',
    brand_id: '',
    category_id: '',
    description: '',
    concentration: 'Eau de Parfum',
    scent_family: 'Woody & Earthy',
    gender: 'Unisex',
    volume_ml: 100,
    bottle_sizes: '50ml, 100ml, 200ml',
    size_variants: [
      { size: '50ml', price: '4999', discount_price: '4499', stock: 25 },
      { size: '100ml', price: '8999', discount_price: '7999', stock: 40 },
      { size: '200ml', price: '14999', discount_price: '12999', stock: 15 }
    ],
    top_notes: '',
    middle_notes: '',
    base_notes: '',
    price: '8999',
    discount_price: '7999',
    stock_quantity: 40,
    primary_image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    additional_images: [
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 5.0,
    num_reviews: 140,
    is_featured: true,
    is_best_seller: false,
    is_new_arrival: true,
    is_returnable: true,
    return_window_days: 7,
    return_policy: ''
  });

  useEffect(() => {
    const fetchMetadataAndProduct = async () => {
      try {
        const [brandsRes, catsRes] = await Promise.all([
          api.get('/brands').catch(() => ({ data: { brands: [] } })),
          api.get('/categories').catch(() => ({ data: { categories: [] } }))
        ]);

        const loadedBrands = brandsRes.data?.brands || [];
        const loadedCats = catsRes.data?.categories || [];
        setBrands(loadedBrands);
        setCategories(loadedCats);

        if (isEditMode) {
          const res = await api.get(`/products/${id}`);
          if (res.data?.success && res.data?.product) {
            const prod = res.data.product;
            let variants = [];
            if (prod.size_variants) {
              try {
                const parsed = typeof prod.size_variants === 'string' ? JSON.parse(prod.size_variants) : prod.size_variants;
                if (Array.isArray(parsed) && parsed.length > 0) {
                  variants = parsed.map(v => ({
                    size: v.size || '',
                    price: v.price !== undefined ? String(v.price) : '',
                    discount_percent: v.discount_percent || '',
                    discount_price: v.discount_price !== undefined ? String(v.discount_price) : '',
                    stock: v.stock !== undefined ? v.stock : 30
                  }));
                }
              } catch (e) {}
            }

            let extraImages = [];
            if (prod.additional_images) {
              try {
                const parsedImgs = typeof prod.additional_images === 'string' ? JSON.parse(prod.additional_images) : prod.additional_images;
                if (Array.isArray(parsedImgs)) {
                  extraImages = parsedImgs.filter(Boolean);
                }
              } catch (e) {}
            }

            const p = Number(prod.price) || 0;
            const dp = Number(prod.discount_price) || 0;
            const calcPct = (p > 0 && dp > 0 && dp < p) ? Math.round(((p - dp) / p) * 100) : '';

            setProductForm({
              name: prod.name || '',
              brand_id: prod.brand_id || loadedBrands[0]?.id || '',
              category_id: prod.category_id || loadedCats[0]?.id || '',
              description: prod.description || '',
              concentration: prod.concentration || 'Eau de Parfum',
              scent_family: prod.scent_family || 'Woody & Earthy',
              gender: prod.gender || 'Unisex',
              volume_ml: prod.volume_ml || 100,
              bottle_sizes: prod.bottle_sizes || '50ml, 100ml, 200ml',
              size_variants: variants.length > 0 ? variants : [
                { size: '50ml', price: String(Math.round(p * 0.7)), discount_price: '', stock: 25 },
                { size: '100ml', price: String(p), discount_price: String(dp), stock: 40 }
              ],
              top_notes: prod.top_notes || '',
              middle_notes: prod.middle_notes || '',
              base_notes: prod.base_notes || '',
              price: prod.price !== undefined ? String(prod.price) : '',
              discount_price: prod.discount_price !== undefined ? String(prod.discount_price) : '',
              stock_quantity: prod.stock_quantity ?? 30,
              primary_image: prod.primary_image || '',
              additional_images: extraImages,
              rating: prod.rating !== undefined ? prod.rating : 5.0,
              num_reviews: prod.num_reviews !== undefined ? prod.num_reviews : 140,
              is_featured: Boolean(prod.is_featured),
              is_best_seller: Boolean(prod.is_best_seller),
              is_new_arrival: Boolean(prod.is_new_arrival),
              is_returnable: prod.is_returnable !== undefined ? Boolean(prod.is_returnable) : true,
              return_window_days: prod.return_window_days || 7,
              return_policy: prod.return_policy || ''
            });
            setDiscountPercent(calcPct ? String(calcPct) : '');
          } else {
            toast.error('Fragrance bottle not found.');
            navigate('/admin?tab=products');
          }
        } else {
          // Set initial defaults for Brand and Category
          setProductForm(prev => ({
            ...prev,
            brand_id: loadedBrands[0]?.id || '',
            category_id: loadedCats[0]?.id || ''
          }));
        }
      } catch (err) {
        console.error('Failed to load initial data for product form:', err);
        toast.error('Failed to load fragrance information');
      } finally {
        setLoadingInitial(false);
      }
    };

    fetchMetadataAndProduct();
  }, [id, isEditMode, navigate]);

  // Synchronized Pricing and Discount Percentage Handlers
  const handlePriceChange = (val) => {
    const newPrice = val;
    let newDiscPrice = productForm.discount_price;

    if (newPrice && discountPercent) {
      const p = Number(newPrice);
      const pct = Number(discountPercent);
      if (p > 0 && pct > 0 && pct < 100) {
        newDiscPrice = Math.round(p * (1 - pct / 100));
      }
    }
    setProductForm(prev => ({ ...prev, price: newPrice, discount_price: newDiscPrice }));
  };

  const handleDiscountPercentChange = (val) => {
    setDiscountPercent(val);
    const pct = Number(val);
    const p = Number(productForm.price);

    if (val === '' || isNaN(pct) || pct <= 0) {
      setProductForm(prev => ({ ...prev, discount_price: '' }));
      return;
    }

    if (pct >= 100) {
      toast.warn('Discount percentage must be less than 100%');
      return;
    }

    if (p > 0) {
      const calculatedDiscPrice = Math.round(p * (1 - pct / 100));
      setProductForm(prev => ({ ...prev, discount_price: calculatedDiscPrice }));
    }
  };

  const handleDiscountPriceChange = (val) => {
    const dp = Number(val);
    const p = Number(productForm.price);

    setProductForm(prev => ({ ...prev, discount_price: val }));

    if (val === '' || isNaN(dp) || dp <= 0) {
      setDiscountPercent('');
      return;
    }

    if (p > 0 && dp < p) {
      const calculatedPct = Math.round(((p - dp) / p) * 100);
      setDiscountPercent(calculatedPct);
    } else if (dp >= p && p > 0) {
      setDiscountPercent('');
    }
  };

  // Variant size helpers
  const handleAddSizeVariant = (presetSize) => {
    const current = productForm.size_variants || [];
    const newSize = presetSize || (current.length === 0 ? '50ml' : (current.length === 1 ? '100ml' : `${current.length * 50}ml`));

    if (presetSize && current.some(v => v.size?.toLowerCase() === presetSize.toLowerCase())) {
      toast.info(`Bottle size ${presetSize} is already added in the variant list.`);
      return;
    }

    const basePrice = Number(productForm.price) || 5000;
    const factor = newSize === '10ml' ? 0.2 : (newSize === '30ml' ? 0.45 : (newSize === '50ml' ? 0.65 : (newSize === '200ml' ? 1.6 : 1)));
    const estimatedPrice = Math.round(basePrice * factor);

    const updated = [
      ...current,
      {
        size: newSize,
        price: String(estimatedPrice),
        discount_percent: discountPercent || '',
        discount_price: discountPercent ? String(Math.round(estimatedPrice * (1 - Number(discountPercent) / 100))) : '',
        stock: 30
      }
    ];

    const newSizesStr = updated.map(v => v.size).filter(Boolean).join(', ');
    setProductForm(prev => ({
      ...prev,
      size_variants: updated,
      bottle_sizes: newSizesStr
    }));
  };

  const handleRemoveVariant = (idx) => {
    const current = productForm.size_variants || [];
    const updated = current.filter((_, i) => i !== idx);
    const newSizesStr = updated.map(v => v.size).filter(Boolean).join(', ');
    setProductForm(prev => ({
      ...prev,
      size_variants: updated,
      bottle_sizes: newSizesStr
    }));
  };

  const handleVariantChange = (idx, field, value) => {
    const current = [...(productForm.size_variants || [])];
    const item = { ...current[idx], [field]: value };

    if (field === 'price') {
      const p = Number(value);
      const pct = Number(item.discount_percent);
      if (p > 0 && pct > 0 && pct < 100) {
        item.discount_price = String(Math.round(p * (1 - pct / 100)));
      }
    } else if (field === 'discount_percent') {
      const pct = Number(value);
      const p = Number(item.price);
      if (p > 0 && pct > 0 && pct < 100) {
        item.discount_price = String(Math.round(p * (1 - pct / 100)));
      } else if (value === '' || pct <= 0) {
        item.discount_price = '';
      }
    } else if (field === 'discount_price') {
      const dp = Number(value);
      const p = Number(item.price);
      if (p > 0 && dp > 0 && dp < p) {
        item.discount_percent = String(Math.round(((p - dp) / p) * 100));
      } else if (value === '' || dp <= 0) {
        item.discount_percent = '';
      }
    }

    current[idx] = item;
    const newSizesStr = current.map(v => v.size).filter(Boolean).join(', ');
    setProductForm(prev => ({
      ...prev,
      size_variants: current,
      bottle_sizes: newSizesStr
    }));
  };

  const handleApplyBulkDiscountToVariants = (pct) => {
    const current = productForm.size_variants || [];
    if (current.length === 0) {
      toast.info('Please add bottle sizes first before applying bulk discount.');
      return;
    }
    const updated = current.map(v => {
      const p = Number(v.price || 0);
      const disc = p > 0 ? String(Math.round(p * (1 - pct / 100))) : '';
      return {
        ...v,
        discount_percent: String(pct),
        discount_price: disc
      };
    });
    setProductForm(prev => ({ ...prev, size_variants: updated }));
    toast.success(`✨ Set ${pct}% discount across all ${updated.length} bottle sizes!`);
  };

  const handleAddAdditionalImage = () => {
    const current = productForm.additional_images || [];
    setProductForm(prev => ({
      ...prev,
      additional_images: [...current, '']
    }));
  };

  const handleRemoveAdditionalImage = (idx) => {
    const current = productForm.additional_images || [];
    setProductForm(prev => ({
      ...prev,
      additional_images: current.filter((_, i) => i !== idx)
    }));
  };

  const handleSaveProduct = async (e) => {
    if (e) e.preventDefault();

    if (!productForm.name?.trim()) {
      toast.error('Please enter a fragrance title.');
      return;
    }

    // Determine primary price from variants or direct price
    let effectivePrice = productForm.price;
    let effectiveDiscountPrice = productForm.discount_price;
    if (productForm.size_variants && productForm.size_variants.length > 0) {
      const firstVar = productForm.size_variants[0];
      if (!effectivePrice && firstVar.price) {
        effectivePrice = firstVar.price;
        effectiveDiscountPrice = firstVar.discount_price || null;
      }
    }

    if (!effectivePrice) {
      toast.error('Base price or variant price is required.');
      return;
    }

    if (!productForm.primary_image) {
      toast.error('Primary bottle cover photo is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const cleanedAdditional = (productForm.additional_images || []).filter(Boolean);

      const payload = {
        ...productForm,
        price: Number(effectivePrice) || 0,
        discount_price: effectiveDiscountPrice ? Number(effectiveDiscountPrice) : null,
        stock_quantity: Number(productForm.stock_quantity) || 30,
        rating: Number(productForm.rating) || 5.0,
        num_reviews: Number(productForm.num_reviews) || 0,
        brand_id: productForm.brand_id ? Number(productForm.brand_id) : null,
        category_id: productForm.category_id ? Number(productForm.category_id) : null,
        additional_images: cleanedAdditional
      };

      if (isEditMode) {
        const res = await api.put(`/products/${id}`, payload);
        if (res.data?.success) {
          toast.success(`✨ Fragrance "${productForm.name}" updated successfully!`);
          navigate('/admin?tab=products');
        }
      } else {
        const res = await api.post('/products', payload);
        if (res.data?.success) {
          toast.success(`✨ New fragrance "${productForm.name}" curated successfully!`);
          navigate('/admin?tab=products');
        }
      }
    } catch (err) {
      console.error('Save product error:', err);
      toast.error(err.response?.data?.message || 'Failed to save fragrance bottle');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37' }}>
        <div className="gold-shimmer" style={{ padding: '24px 48px', borderRadius: '16px', textAlign: 'center' }}>
          <Clock size={24} className="spin" style={{ display: 'block', margin: '0 auto 12px auto' }} />
          Loading Perfume Bottle Details...
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: 'clamp(14px, 3vw, 28px) clamp(14px, 3vw, 32px) 80px' }}>
      
      {/* Top Header & Breadcrumb */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            to="/admin?tab=products"
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
            <span>Back to Fragrance Catalog</span>
          </Link>
          <span style={{ color: '#64748b' }}>/</span>
          <span style={{ color: '#f5df93', fontSize: '0.84rem', fontWeight: 600 }}>
            {isEditMode ? 'Edit Fragrance Bottle' : 'Curate New Flacon'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => navigate('/admin?tab=products')}
            className="btn-luxury-outline"
            style={{ padding: '9px 18px', fontSize: '0.84rem' }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSaveProduct}
            className="btn-luxury-gold"
            style={{ padding: '9px 22px', fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            {isSubmitting ? (
              <>
                <Clock size={15} className="spin" />
                <span>Saving Bottle...</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>{isEditMode ? 'Save Fragrance Changes' : 'Publish Bottle to Boutique'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Headline Banner */}
      <div className="glass-panel" style={{ borderRadius: '18px', padding: 'clamp(18px, 3vw, 24px)', marginBottom: '24px', border: '1px solid rgba(212, 175, 55, 0.35)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            <Sparkles size={24} />
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', color: '#ffffff', margin: '0 0 4px 0', lineHeight: 1.2 }}>
              {isEditMode ? `Edit "${productForm.name}"` : 'Curate New Fragrance Bottle'}
            </h1>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>
              Configure olfactory notes, variant pricing, volume sizes, inventory & imagery for the boutique.
            </p>
          </div>
        </div>
      </div>

      {/* Form Content 2-Column Responsive Layout */}
      <form onSubmit={handleSaveProduct}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
          gap: '24px',
          alignItems: 'start'
        }}>
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: Identity, Variants & Olfactory Notes         */}
          {/* ========================================================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', minWidth: 0, width: '100%', boxSizing: 'border-box' }}>
            
            {/* Card 1: Core Bottle Identity */}
            <div className="glass-card" style={{ padding: 'clamp(16px, 3vw, 24px)', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                <Layers size={18} color="#d4af37" />
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: '#f8fafc', margin: 0 }}>
                  Bottle Identity & Heritage
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.80rem', color: '#f5df93', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Fragrance Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g. Royal Oud Extrait de Parfum"
                    className="form-input-luxury"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Brand & Category */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.80rem', color: '#f5df93', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                      Brand / Designer House *
                    </label>
                    <select
                      value={productForm.brand_id}
                      onChange={(e) => setProductForm({ ...productForm, brand_id: e.target.value })}
                      className="form-input-luxury"
                      required
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    >
                      <option value="">Select Brand</option>
                      {brands.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.80rem', color: '#f5df93', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                      Category / Fragrance Family *
                    </label>
                    <select
                      value={productForm.category_id}
                      onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                      className="form-input-luxury"
                      required
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Concentration, Gender & Scent Family */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Concentration</label>
                    <select
                      value={productForm.concentration}
                      onChange={(e) => setProductForm({ ...productForm, concentration: e.target.value })}
                      className="form-input-luxury"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    >
                      <option value="Eau de Parfum">Eau de Parfum (15-20%)</option>
                      <option value="Extrait de Parfum">Extrait de Parfum (30-40%)</option>
                      <option value="Eau de Toilette">Eau de Toilette (5-15%)</option>
                      <option value="Elixir Precieux">Elixir Précieux (40%+)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Gender Accord</label>
                    <select
                      value={productForm.gender}
                      onChange={(e) => setProductForm({ ...productForm, gender: e.target.value })}
                      className="form-input-luxury"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    >
                      <option value="Unisex">Unisex</option>
                      <option value="Men">Men (Pour Homme)</option>
                      <option value="Women">Women (Pour Femme)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Scent Family Tag</label>
                    <input
                      type="text"
                      value={productForm.scent_family}
                      onChange={(e) => setProductForm({ ...productForm, scent_family: e.target.value })}
                      placeholder="e.g. Woody & Earthy"
                      className="form-input-luxury"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Bottle Sizes & Multi-Variant Pricing Manager */}
            <div className="glass-card" style={{ padding: 'clamp(16px, 3vw, 24px)', borderRadius: '16px', border: '1px solid rgba(212, 175, 55, 0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.90rem', color: '#f5df93', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tag size={16} color="#d4af37" /> Bottle Sizes & Individual Variant Pricing
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
                    Configure individual MRP, discount %, sale price, and stock for each bottle size.
                  </div>
                </div>
                <span className="badge-gold" style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                  {(productForm.size_variants || []).length} Sizes Configured
                </span>
              </div>

              {/* Preset buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 600 }}>+ Add Size:</span>
                  {['10ml', '30ml', '50ml', '75ml', '100ml', '150ml', '200ml'].map((sz) => (
                    <button
                      type="button"
                      key={sz}
                      onClick={() => handleAddSizeVariant(sz)}
                      className="btn-luxury-outline"
                      style={{ padding: '3px 8px', fontSize: '0.72rem', borderRadius: '6px' }}
                    >
                      + {sz}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddSizeVariant('')}
                    className="btn-luxury-gold"
                    style={{ padding: '3px 10px', fontSize: '0.72rem', borderRadius: '6px', marginLeft: 'auto' }}
                  >
                    <Plus size={12} /> Custom Size
                  </button>
                </div>

                {/* Bulk Discount Toolbar */}
                {(productForm.size_variants || []).length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(245, 223, 147, 0.03) 100%)',
                    border: '1px dashed rgba(212, 175, 55, 0.3)',
                    borderRadius: '10px',
                    padding: '8px 12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#f5df93', fontWeight: 600 }}>
                      <Percent size={13} color="#d4af37" />
                      <span>Apply Bulk Discount to All Sizes:</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' }}>
                      {[5, 10, 15, 20, 25, 30, 40, 50].map(pct => (
                        <button
                          type="button"
                          key={pct}
                          onClick={() => handleApplyBulkDiscountToVariants(pct)}
                          className="btn-luxury-outline"
                          style={{
                            padding: '2px 8px',
                            fontSize: '0.7rem',
                            borderRadius: '6px',
                            borderColor: 'rgba(212,175,55,0.4)',
                            background: 'rgba(0,0,0,0.3)'
                          }}
                        >
                          {pct}% OFF
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Variant Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(productForm.size_variants || []).map((variant, idx) => {
                  const vPrice = Number(variant.price || 0);
                  const vDiscPrice = Number(variant.discount_price || 0);
                  const vHasDisc = vPrice > 0 && vDiscPrice > 0 && vDiscPrice < vPrice;
                  const vPct = variant.discount_percent || (vHasDisc ? Math.round(((vPrice - vDiscPrice) / vPrice) * 100) : '');
                  const vSavings = vHasDisc ? vPrice - vDiscPrice : 0;

                  return (
                    <div
                      key={idx}
                      style={{
                        background: 'rgba(8, 10, 15, 0.85)',
                        border: vHasDisc ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#f5df93', fontWeight: 700 }}>
                          <span style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: 'rgba(212, 175, 55, 0.2)',
                            border: '1px solid rgba(212, 175, 55, 0.4)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.70rem',
                            color: '#ffd700'
                          }}>
                            {idx + 1}
                          </span>
                          <span>Size Flacon: {variant.size || 'Custom Size'}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          style={{
                            background: 'rgba(244, 63, 94, 0.15)',
                            border: '1px solid rgba(244, 63, 94, 0.4)',
                            color: '#fda4af',
                            borderRadius: '6px',
                            width: '26px',
                            height: '26px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                          title="Remove size variant"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 100px), 1fr))',
                        gap: '8px 10px',
                        alignItems: 'flex-end'
                      }}>
                        <div>
                          <label style={{ fontSize: '0.70rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Bottle Size</label>
                          <input
                            type="text"
                            value={variant.size}
                            onChange={(e) => handleVariantChange(idx, 'size', e.target.value)}
                            placeholder="e.g. 100ml"
                            className="form-input-luxury"
                            style={{ padding: '6px 8px', fontSize: '0.76rem', width: '100%', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.70rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>MRP Price (₹)</label>
                          <input
                            type="number"
                            min="0"
                            value={variant.price}
                            onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                            placeholder="8999"
                            className="form-input-luxury"
                            style={{ padding: '6px 8px', fontSize: '0.76rem', width: '100%', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.70rem', color: '#ffd700', display: 'block', marginBottom: '3px' }}>Discount %</label>
                          <input
                            type="number"
                            min="0"
                            max="99"
                            value={variant.discount_percent}
                            onChange={(e) => handleVariantChange(idx, 'discount_percent', e.target.value)}
                            placeholder="15%"
                            className="form-input-luxury"
                            style={{ padding: '6px 8px', fontSize: '0.76rem', width: '100%', boxSizing: 'border-box', borderColor: vPct ? 'rgba(212,175,55,0.6)' : undefined }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.70rem', color: '#f5df93', fontWeight: 600, display: 'block', marginBottom: '3px' }}>Sale Price (₹)</label>
                          <input
                            type="number"
                            min="0"
                            value={variant.discount_price}
                            onChange={(e) => handleVariantChange(idx, 'discount_price', e.target.value)}
                            placeholder="7999"
                            className="form-input-luxury"
                            style={{ padding: '6px 8px', fontSize: '0.76rem', width: '100%', boxSizing: 'border-box', fontWeight: 700, color: '#f5df93' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.70rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Stock Qty</label>
                          <input
                            type="number"
                            min="0"
                            value={variant.stock}
                            onChange={(e) => handleVariantChange(idx, 'stock', Number(e.target.value))}
                            placeholder="30"
                            className="form-input-luxury"
                            style={{ padding: '6px 8px', fontSize: '0.76rem', width: '100%', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>

                      {vHasDisc && (
                        <div style={{ fontSize: '0.70rem', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.1)', padding: '3px 8px', borderRadius: '6px' }}>
                          <CheckCircle2 size={12} color="#10b981" />
                          <span>Customer saves ₹{vSavings.toLocaleString()} ({vPct}% discount live)</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card 3: Olfactory Notes & Description */}
            <div className="glass-card" style={{ padding: 'clamp(16px, 3vw, 24px)', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                <Sparkles size={18} color="#d4af37" />
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: '#f8fafc', margin: 0 }}>
                  Olfactory Architecture & Story
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#ffd700', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Top Notes (First 15 Mins)
                  </label>
                  <input
                    type="text"
                    value={productForm.top_notes}
                    onChange={(e) => setProductForm({ ...productForm, top_notes: e.target.value })}
                    placeholder="e.g. Calabrian Bergamot, Cardamom, Pink Peppercorn"
                    className="form-input-luxury"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: '#ffd700', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Heart / Middle Notes (2 - 4 Hours)
                  </label>
                  <input
                    type="text"
                    value={productForm.middle_notes}
                    onChange={(e) => setProductForm({ ...productForm, middle_notes: e.target.value })}
                    placeholder="e.g. Grasse Rose de Mai, Jasmine Sambac, Precious Saffron"
                    className="form-input-luxury"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: '#ffd700', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Base Notes (6 - 12+ Hours)
                  </label>
                  <input
                    type="text"
                    value={productForm.base_notes}
                    onChange={(e) => setProductForm({ ...productForm, base_notes: e.target.value })}
                    placeholder="e.g. Mysore Sandalwood, Bourbon Vanilla, Ambergris, Oud Wood"
                    className="form-input-luxury"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Fragrance Narrative & Olfactory Description
                  </label>
                  <textarea
                    rows={4}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Describe the inspiration, rare natural ingredients, projection and trail of this perfume flacon..."
                    className="form-input-luxury"
                    style={{ width: '100%', boxSizing: 'border-box', lineHeight: '1.6' }}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Imagery, Badges & Return Settings           */}
          {/* ========================================================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', minWidth: 0, width: '100%', boxSizing: 'border-box' }}>
            
            {/* Card 4: Bottle Imagery & Multi-Angle Photos */}
            <div className="glass-card" style={{ padding: 'clamp(16px, 3vw, 24px)', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                <ImageIcon size={18} color="#d4af37" />
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: '#f8fafc', margin: 0 }}>
                  Bottle Photos & Gallery
                </h3>
              </div>

              {/* Primary Cover Image */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.74rem', color: '#ffd700', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                  ⭐ Primary Flacon Image *
                </div>
                <ImageUploadField
                  id="product-primary-page"
                  label="Main Catalog Display Image *"
                  value={productForm.primary_image}
                  onChange={(url) => setProductForm({ ...productForm, primary_image: url })}
                />
              </div>

              {/* Additional Gallery Photos */}
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#f8fafc', fontWeight: 600 }}>
                    Additional Gallery Photos ({productForm.additional_images?.length || 0})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddAdditionalImage}
                    className="btn-luxury-gold"
                    style={{ padding: '4px 12px', fontSize: '0.74rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Plus size={13} /> Add Photo
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(productForm.additional_images || []).map((imgUrl, imgIdx) => (
                    <div 
                      key={imgIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '10px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '10px'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <ImageUploadField
                          id={`product-page-extra-${imgIdx}`}
                          label={`Angle View #${imgIdx + 1}`}
                          value={imgUrl}
                          onChange={(url) => {
                            const updated = [...(productForm.additional_images || [])];
                            updated[imgIdx] = url;
                            setProductForm({ ...productForm, additional_images: updated });
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAdditionalImage(imgIdx)}
                        style={{ background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: '6px' }}
                        title="Remove photo"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Card 5: Prestige Badges & Merchandising */}
            <div className="glass-card" style={{ padding: 'clamp(16px, 3vw, 24px)', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                <Sparkles size={18} color="#d4af37" />
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: '#f8fafc', margin: 0 }}>
                  Curation Flags & Social Proof
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.84rem', color: '#cbd5e1' }}>
                  <input
                    type="checkbox"
                    checked={productForm.is_featured}
                    onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                    style={{ accentColor: '#d4af37', width: '18px', height: '18px' }}
                  />
                  <span>👑 Featured Fragrance (Display in hero highlights)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.84rem', color: '#cbd5e1' }}>
                  <input
                    type="checkbox"
                    checked={productForm.is_best_seller}
                    onChange={(e) => setProductForm({ ...productForm, is_best_seller: e.target.checked })}
                    style={{ accentColor: '#d4af37', width: '18px', height: '18px' }}
                  />
                  <span>🔥 Best Seller Flacon (Top-ranked bestseller badge)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.84rem', color: '#cbd5e1' }}>
                  <input
                    type="checkbox"
                    checked={productForm.is_new_arrival}
                    onChange={(e) => setProductForm({ ...productForm, is_new_arrival: e.target.checked })}
                    style={{ accentColor: '#d4af37', width: '18px', height: '18px' }}
                  />
                  <span>✨ New Arrival Flacon (Latest seasonal formulation)</span>
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '6px' }}>
                  <div>
                    <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Star Rating</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={productForm.rating}
                      onChange={(e) => setProductForm({ ...productForm, rating: Number(e.target.value) })}
                      className="form-input-luxury"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Review Count</label>
                    <input
                      type="number"
                      min="0"
                      value={productForm.num_reviews}
                      onChange={(e) => setProductForm({ ...productForm, num_reviews: Number(e.target.value) })}
                      className="form-input-luxury"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 6: Luxury Hygiene & Return Policy */}
            <div className="glass-card" style={{ padding: 'clamp(16px, 3vw, 22px)', borderRadius: '16px', boxSizing: 'border-box', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RotateCcw size={18} color="#d4af37" />
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.02rem', color: '#f8fafc', margin: 0, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      Return & Hygiene Policy Settings
                    </h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>
                      Configure buyer refund terms & hygiene seal criteria
                    </p>
                  </div>
                </div>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  background: productForm.is_returnable ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                  border: productForm.is_returnable ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(244, 63, 94, 0.4)',
                  color: productForm.is_returnable ? '#6ee7b7' : '#fda4af',
                  letterSpacing: '0.02em'
                }}>
                  {productForm.is_returnable ? `✓ ${productForm.return_window_days || 7}-Day Returns Active` : '✕ Non-Returnable Bottle'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Toggle Control Card */}
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  color: '#f8fafc',
                  background: productForm.is_returnable ? 'rgba(212, 175, 55, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: productForm.is_returnable ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                  transition: 'all 0.25s ease'
                }}>
                  <input
                    type="checkbox"
                    checked={productForm.is_returnable}
                    onChange={(e) => setProductForm({ ...productForm, is_returnable: e.target.checked })}
                    style={{ accentColor: '#d4af37', width: '20px', height: '20px', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <div>
                    <span style={{ fontWeight: 600, display: 'block', color: '#f8fafc' }}>
                      Allow Returns & Replacements for this Bottle
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginTop: '2px' }}>
                      Permit customer return requests when pristine hygiene seal guidelines are met
                    </span>
                  </div>
                </label>

                {productForm.is_returnable && (
                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                      <label style={{ fontSize: '0.78rem', color: '#f5df93', fontWeight: 600 }}>
                        Return Window (Days from Delivery)
                      </label>
                      <span style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>
                        Active: <strong style={{ color: '#ffd700', fontSize: '0.82rem' }}>{productForm.return_window_days} Days</strong>
                      </span>
                    </div>

                    {/* Quick Preset Buttons for Return Window */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                      {[5, 7, 10, 14, 30].map(days => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => setProductForm({ ...productForm, return_window_days: days })}
                          className={productForm.return_window_days === days ? 'btn-luxury-gold' : 'btn-luxury-outline'}
                          style={{
                            padding: '5px 12px',
                            fontSize: '0.74rem',
                            borderRadius: '8px',
                            fontWeight: productForm.return_window_days === days ? 700 : 500,
                            borderWidth: '1px'
                          }}
                        >
                          {days} Days {days === 7 ? '★ Store Default' : ''}
                        </button>
                      ))}
                    </div>

                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={productForm.return_window_days}
                        onChange={(e) => setProductForm({ ...productForm, return_window_days: Number(e.target.value) })}
                        className="form-input-luxury"
                        style={{ width: '100%', boxSizing: 'border-box', paddingRight: '60px' }}
                      />
                      <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.78rem', pointerEvents: 'none' }}>
                        Days
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '4px' }}>
                    <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600 }}>
                      Custom Bottle Return Policy Text (Optional)
                    </label>
                    <span style={{ fontSize: '0.70rem', color: '#94a3b8' }}>Leave blank to use storewide default</span>
                  </div>

                  {/* Preset Policy Templates */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setProductForm({
                        ...productForm,
                        return_policy: `Eligible for return or replacement within ${productForm.return_window_days || 7} days of delivery. Flacon must remain unopened with cellophane seal and batch code intact.`
                      })}
                      className="btn-luxury-outline"
                      style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '8px' }}
                    >
                      🛡️ Standard Seal Policy
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductForm({
                        ...productForm,
                        return_policy: 'We include a complimentary travel decant test vial with this bottle. Test the sample vial first; returns accepted only if the main full-size bottle cellophane seal remains intact.'
                      })}
                      className="btn-luxury-outline"
                      style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '8px' }}
                    >
                      🎁 Free Decant Test Policy
                    </button>
                    {productForm.return_policy && (
                      <button
                        type="button"
                        onClick={() => setProductForm({ ...productForm, return_policy: '' })}
                        style={{ background: 'transparent', border: 'none', color: '#f43f5e', fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline', padding: '4px 6px' }}
                      >
                        ✕ Clear Custom Text
                      </button>
                    )}
                  </div>

                  <textarea
                    rows={3}
                    value={productForm.return_policy}
                    onChange={(e) => setProductForm({ ...productForm, return_policy: e.target.value })}
                    placeholder="Leave empty to use storewide admin default return policy..."
                    className="form-input-luxury"
                    style={{ width: '100%', boxSizing: 'border-box', fontSize: '0.80rem', lineHeight: '1.5' }}
                  />

                  {/* Real-time Preview Pill */}
                  <div style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(212, 175, 55, 0.05)',
                    border: '1px dashed rgba(212, 175, 55, 0.25)',
                    fontSize: '0.72rem',
                    color: '#94a3b8',
                    lineHeight: '1.4'
                  }}>
                    <strong style={{ color: '#ffd700', marginRight: '6px' }}>Client Guarantee Preview:</strong>
                    {productForm.return_policy?.trim()
                      ? productForm.return_policy
                      : productForm.is_returnable
                        ? `Covered by TRY ME BRO Boutique ${productForm.return_window_days || 7}-Day Pristine Hygiene Guarantee (cellophane seal intact).`
                        : 'Final sale luxury bottle: excluded from standard returns once dispatched.'
                    }
                  </div>
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
            <span>Ready to publish directly to the live TRY ME BRO boutique catalog</span>
          </div>

          <div className="admin-form-actions-grid">
            <button
              type="button"
              onClick={() => navigate('/admin?tab=products')}
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
                  <span>Saving Fragrance...</span>
                </>
              ) : (
                <>
                  <Save size={16} style={{ flexShrink: 0 }} />
                  <span>{isEditMode ? 'Save Fragrance Changes' : 'Publish Fragrance Live'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>


    </div>
  );
};

export default AdminProductForm;
