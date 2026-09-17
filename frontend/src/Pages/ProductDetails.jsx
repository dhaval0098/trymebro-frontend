import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { 
  ShoppingBag, 
  Heart, 
  Star, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  Droplets, 
  Check, 
  Share2, 
  Send,
  RotateCcw,
  Lock,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import FragrancePyramid from '../components/FragrancePyramid';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import { toast } from 'react-toastify';

const ProductDetails = () => {
  const { identifier } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [selectedVolume, setSelectedVolume] = useState('100ml');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFullReturnPolicy, setShowFullReturnPolicy] = useState(false);
  const [returnSettings, setReturnSettings] = useState(null);

  // Helper to parse bottle sizes written by admin
  const getAvailableSizes = (prod) => {
    if (!prod) return ['100ml'];
    if (prod.size_variants) {
      try {
        const parsed = typeof prod.size_variants === 'string' ? JSON.parse(prod.size_variants) : prod.size_variants;
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sizes = parsed.map(v => (v.size || '').trim()).filter(Boolean);
          if (sizes.length > 0) return sizes;
        }
      } catch (e) {}
    }
    if (prod.bottle_sizes && typeof prod.bottle_sizes === 'string') {
      const parsed = prod.bottle_sizes
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      if (parsed.length > 0) return parsed;
    }
    if (prod.volume_ml) {
      return [`${prod.volume_ml}ml`];
    }
    return ['100ml'];
  };

  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${identifier}`);
        if (res.data.success) {
          const p = res.data.product;
          setProduct(p);
          setActiveImage(p.primary_image);
          const sizes = getAvailableSizes(p);
          setSelectedVolume(sizes[0] || '100ml');
          setReviews(res.data.reviews || []);
          setRelatedProducts(res.data.relatedProducts || []);
          if (res.data.returnSettings) {
            setReturnSettings(res.data.returnSettings);
          } else {
            api.get('/returns/settings').then(sRes => {
              if (sRes.data?.success) setReturnSettings(sRes.data.settings);
            }).catch(() => {});
          }
        }
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [identifier]);

  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37' }}>
        <div className="gold-shimmer" style={{ padding: '24px 48px', borderRadius: '16px' }}>
          Consulting the Master Perfumer...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ maxWidth: '800px', margin: '80px auto', textAlign: 'center', padding: '40px' }} className="glass-card">
        <h2 style={{ color: '#ffffff', marginBottom: '16px' }}>Fragrance Not Found</h2>
        <p style={{ color: '#94a3b8', marginBottom: '24px' }}>The requested perfume bottle does not exist or has been archived.</p>
        <Link to="/shop" className="btn-luxury-gold">Return to Fragrance Boutique</Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);

  // Variant size resolver
  const getSelectedVariant = () => {
    if (!product) return null;
    if (product.size_variants) {
      try {
        const variants = typeof product.size_variants === 'string' ? JSON.parse(product.size_variants) : product.size_variants;
        if (Array.isArray(variants) && variants.length > 0) {
          const cleanSelected = (selectedVolume || '').replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
          const matched = variants.find(v => (v.size || '').replace(/[^0-9a-zA-Z]/g, '').toLowerCase() === cleanSelected);
          if (matched) return matched;
          return variants[0];
        }
      } catch (e) {}
    }
    return null;
  };

  const selectedVariant = getSelectedVariant();

  // Robust Price and Discount Calculations
  const originalPrice = Number(selectedVariant?.price || product.price || 0);
  const rawDiscountPrice = (selectedVariant?.discount_price !== undefined && selectedVariant?.discount_price !== null && selectedVariant?.discount_price !== '' && !isNaN(Number(selectedVariant.discount_price)))
    ? Number(selectedVariant.discount_price)
    : (product.discount_price !== undefined && product.discount_price !== null && product.discount_price !== '' && !isNaN(Number(product.discount_price)) ? Number(product.discount_price) : null);

  const hasDiscount = Boolean(rawDiscountPrice !== null && rawDiscountPrice > 0 && rawDiscountPrice < originalPrice);
  const activePrice = hasDiscount ? rawDiscountPrice : originalPrice;
  const savingsAmount = hasDiscount ? Math.max(0, originalPrice - activePrice) : 0;
  const discountPercent = hasDiscount && originalPrice > 0
    ? Math.round((savingsAmount / originalPrice) * 100)
    : 0;


  // Additional images
  let allImages = [product.primary_image];
  if (product.additional_images) {
    try {
      const parsed = typeof product.additional_images === 'string' ? JSON.parse(product.additional_images) : product.additional_images;
      if (Array.isArray(parsed)) {
        allImages = [...allImages, ...parsed];
      }
    } catch {
      // Fallback
    }
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to write an olfactory review.');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await api.post(`/products/${product.id}/reviews`, {
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setReviewComment('');
        setReviewTitle('');
        // Refresh reviews
        const prodRes = await api.get(`/products/${identifier}`);
        if (prodRes.data.success) {
          setReviews(prodRes.data.reviews || []);
          setProduct(prodRes.data.product);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleBuyNow = () => {
    addToCart({
      ...product,
      price: originalPrice,
      discount_price: hasDiscount ? activePrice : null,
      volume_ml: parseInt(selectedVolume, 10) || product.volume_ml,
      selected_size: selectedVolume
    }, quantity);
    if (!user) {
      toast.info('Please sign in to proceed to checkout.');
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    navigate('/checkout');
  };

  return (
    <div style={{ maxWidth: '1360px', margin: 'clamp(20px, 4vw, 40px) auto', padding: '0 clamp(12px, 3vw, 20px)' }}>
      
      {/* Breadcrumbs */}
      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
        <Link to="/" style={{ color: '#cbd5e1' }}>Home</Link>
        <span>/</span>
        <Link to="/shop" style={{ color: '#cbd5e1' }}>Shop</Link>
        <span>/</span>
        <span style={{ color: '#d4af37', fontWeight: 600 }}>{product.name}</span>
      </div>

      {/* Main Product Showcase (2 Columns) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
        gap: 'clamp(24px, 4vw, 48px)',
        marginBottom: 'clamp(40px, 6vw, 70px)'
      }}>
        
        {/* LEFT: Multi-Image Gallery */}
        <div>
          <div 
            className="product-details-gallery"
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '1 / 1',
              maxHeight: '560px',
              backgroundColor: '#0a0d14',
              borderRadius: '20px',
              overflow: 'hidden',
              border: '1px solid var(--border-gold)',
              boxShadow: 'var(--shadow-luxury)',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(circle at center, #151b27 0%, #080b11 100%)'
            }}
          >
            {/* Ambient Blurred Backdrop so full frame looks seamless */}
            <img 
              src={activeImage} 
              alt=""
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'blur(28px) brightness(0.35)',
                transform: 'scale(1.15)',
                opacity: 0.65,
                pointerEvents: 'none'
              }}
            />

            {/* Main Full-View Unclipped Product Photo */}
            <img 
              src={activeImage} 
              alt={product.name} 
              style={{
                position: 'relative',
                zIndex: 2,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                padding: '16px',
                transition: 'transform 0.4s ease'
              }}
            />
            {hasDiscount && (
              <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 3 }}>
                <span className="badge-rose" style={{ fontSize: '0.8rem', padding: '6px 14px', fontWeight: 700, letterSpacing: '0.04em' }}>
                  SAVE {discountPercent}%
                </span>
                <span className="badge-gold" style={{ fontSize: '0.7rem', padding: '3px 10px' }}>
                  ₹{(originalPrice - activePrice).toLocaleString('en-IN')} OFF
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
              {allImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(imgUrl)}
                  style={{
                    width: 'clamp(64px, 15vw, 84px)',
                    height: 'clamp(64px, 15vw, 84px)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: activeImage === imgUrl ? '2px solid #d4af37' : '1px solid rgba(255,255,255,0.12)',
                    background: 'radial-gradient(circle at center, #151b27 0%, #080b11 100%)',
                    padding: '4px',
                    cursor: 'pointer',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    boxShadow: activeImage === imgUrl ? '0 0 12px rgba(212, 175, 55, 0.4)' : 'none'
                  }}
                >
                  <img src={imgUrl} alt={`Thumbnail ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Perfume Details & Purchase Actions */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          
          {/* Brand & Origin */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Link 
              to={`/shop?brand=${encodeURIComponent(product.brand_name || 'TRY ME BRO')}`}
              style={{
                fontSize: '0.84rem',
                color: '#d4af37',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontWeight: 700
              }}
            >
              {product.brand_name || 'TRY ME BRO'} ({product.brand_origin || 'France'})
            </Link>

            <span className="badge-gold">
              {product.concentration || 'Eau de Parfum'}
            </span>
          </div>

          {/* Product Title */}
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem, 3.8vw, 2.4rem)', color: '#ffffff', marginBottom: '10px', lineHeight: 1.2 }}>
            {product.name}
          </h1>

          {/* Rating Stars & Reviews */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', color: '#f59e0b' }}>
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={15} 
                  fill={i < Math.floor(Number(product.rating || 5)) ? '#f59e0b' : 'none'} 
                  color="#f59e0b" 
                />
              ))}
            </div>
            <span style={{ fontSize: '0.86rem', color: '#f8fafc', fontWeight: 600 }}>
              {product.rating || '4.9'}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              • {product.num_reviews || reviews.length || 0} Verified Reviews
            </span>
          </div>

          {/* Price Display Box */}
          <div 
            className="product-details-price-row"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              background: 'linear-gradient(145deg, rgba(20, 26, 38, 0.75) 0%, rgba(12, 16, 24, 0.85) 100%)',
              padding: '16px 20px',
              borderRadius: '16px',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              marginBottom: '20px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '12px' }}>
              <span style={{ fontSize: 'clamp(1.7rem, 4vw, 2.3rem)', fontWeight: 800, color: '#f5df93', letterSpacing: '-0.02em' }}>
                ₹{activePrice.toLocaleString('en-IN')}
              </span>

              {hasDiscount && (
                <>
                  <span style={{ fontSize: '1.1rem', color: '#64748b', textDecoration: 'line-through', fontWeight: 600 }}>
                    ₹{originalPrice.toLocaleString('en-IN')}
                  </span>
                  <span style={{
                    background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '6px',
                    letterSpacing: '0.04em',
                    boxShadow: '0 2px 10px rgba(225, 29, 72, 0.3)'
                  }}>
                    {discountPercent}% OFF
                  </span>
                </>
              )}

              <span style={{ fontSize: '0.74rem', color: '#94a3b8', marginLeft: 'auto' }}>
                Inclusive of taxes & duties
              </span>
            </div>

            {hasDiscount && (
              <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} color="#10b981" />
                <span>You Save ₹{savingsAmount.toLocaleString('en-IN')} ({discountPercent}% Off on {selectedVolume})</span>
              </div>
            )}
          </div>

          {/* Description */}
          <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.65', marginBottom: '20px' }}>
            {product.description}
          </p>

          {/* Bottle Volume Selector (Admin Configured Sizes Only) */}
          {(() => {
            const availableSizes = getAvailableSizes(product);
            let parsedVariants = [];
            if (product.size_variants) {
              try {
                parsedVariants = typeof product.size_variants === 'string' ? JSON.parse(product.size_variants) : product.size_variants;
              } catch (e) {}
            }

            return (
              <div style={{ marginBottom: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '0.78rem', color: '#f5df93', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Select Bottle Size & Volume
                  </label>
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                    Selected: <strong style={{ color: '#f5df93', fontSize: '0.82rem' }}>{selectedVolume}</strong>
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 115px), 1fr))', gap: '10px' }}>
                  {availableSizes.map(vol => {
                    const cleanVol = (vol || '').replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
                    const isSelected = (selectedVolume || '').replace(/[^0-9a-zA-Z]/g, '').toLowerCase() === cleanVol;
                    const variantData = Array.isArray(parsedVariants) 
                      ? parsedVariants.find(v => (v.size || '').replace(/[^0-9a-zA-Z]/g, '').toLowerCase() === cleanVol) 
                      : null;

                    const vOrigPrice = variantData && variantData.price ? Number(variantData.price) : Number(product.price || 0);
                    const vDiscPrice = variantData && variantData.discount_price !== undefined && variantData.discount_price !== null && variantData.discount_price !== ''
                      ? Number(variantData.discount_price)
                      : (variantData ? null : (product.discount_price ? Number(product.discount_price) : null));

                    const vHasDiscount = vDiscPrice !== null && !isNaN(vDiscPrice) && vDiscPrice > 0 && vDiscPrice < vOrigPrice;
                    const vActivePrice = vHasDiscount ? vDiscPrice : vOrigPrice;
                    const vDiscountPct = vHasDiscount && vOrigPrice > 0 ? Math.round(((vOrigPrice - vActivePrice) / vOrigPrice) * 100) : 0;

                    return (
                      <button
                        key={vol}
                        type="button"
                        onClick={() => setSelectedVolume(vol)}
                        style={{
                          background: isSelected ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.22) 0%, rgba(212, 175, 55, 0.08) 100%)' : 'rgba(255,255,255,0.03)',
                          border: isSelected ? '1.5px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                          boxShadow: isSelected ? '0 0 16px rgba(212, 175, 55, 0.28)' : 'none',
                          borderRadius: '12px',
                          padding: '10px 10px',
                          color: isSelected ? '#f5df93' : '#f8fafc',
                          cursor: 'pointer',
                          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '3px',
                          position: 'relative'
                        }}
                      >
                        {vHasDiscount && (
                          <span style={{
                            position: 'absolute',
                            top: '-7px',
                            right: '-4px',
                            background: '#e11d48',
                            color: '#ffffff',
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            padding: '1px 5px',
                            borderRadius: '4px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                            zIndex: 2
                          }}>
                            {vDiscountPct}% OFF
                          </span>
                        )}
                        <span style={{ fontWeight: isSelected ? 800 : 600, fontSize: '0.88rem' }}>
                          {vol.toLowerCase().includes('ml') ? vol : `${vol} ml`}
                        </span>
                        {vActivePrice > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <span style={{ fontSize: '0.78rem', color: isSelected ? '#ffffff' : '#f5df93', fontWeight: 800 }}>
                              ₹{vActivePrice.toLocaleString('en-IN')}
                            </span>
                            {vHasDiscount && (
                              <span style={{ fontSize: '0.66rem', color: '#64748b', textDecoration: 'line-through' }}>
                                ₹{vOrigPrice.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Quantity & CTA Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto' }}>
            <div 
              className="product-details-actions"
              style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}
            >
              
              {/* Quantity Counter */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '9999px',
                padding: '4px 14px',
                background: 'rgba(15, 19, 28, 0.8)',
                flexShrink: 0
              }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ background: 'transparent', border: 'none', color: '#f8fafc', cursor: 'pointer', fontSize: '1.2rem', padding: '0 6px' }}
                >
                  -
                </button>
                <span style={{ margin: '0 10px', fontWeight: 700, fontSize: '0.95rem' }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ background: 'transparent', border: 'none', color: '#f8fafc', cursor: 'pointer', fontSize: '1.2rem', padding: '0 6px' }}
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={() => addToCart({
                  ...product,
                  price: originalPrice,
                  discount_price: hasDiscount ? activePrice : null,
                  volume_ml: parseInt(selectedVolume, 10) || product.volume_ml,
                  selected_size: selectedVolume
                }, quantity)}
                className="btn-luxury-gold"
                style={{ flex: '1 1 180px', padding: '12px 20px', fontSize: '0.88rem' }}
              >
                <ShoppingBag size={16} /> Add to Fragrance Bag
              </button>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product)}
                className="btn-icon-round"
                style={{
                  width: '46px',
                  height: '46px',
                  border: isFavorited ? '1px solid #f43f5e' : '1px solid rgba(255, 255, 255, 0.15)',
                  flexShrink: 0
                }}
              >
                <Heart size={18} fill={isFavorited ? '#f43f5e' : 'none'} color={isFavorited ? '#f43f5e' : '#f8fafc'} />
              </button>
            </div>

            {/* Instant Buy Now Button */}
            <button
              onClick={handleBuyNow}
              className="btn-luxury-outline"
              style={{ width: '100%', padding: '12px', fontSize: '0.88rem' }}
            >
              Instant Express Checkout →
            </button>
          </div>

          {/* Reassurance Guarantees */}
          <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#94a3b8' }}>
              <ShieldCheck size={15} color="#d4af37" /> 100% Authentic Flacon
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#94a3b8' }}>
              <Truck size={15} color="#d4af37" /> Climate-Controlled Dispatch
            </div>
          </div>

          {/* DYNAMIC PRODUCT RETURN POLICY & GUARANTEE CARD */}
          {(() => {
            const isGloballyAllowed = returnSettings?.allow_returns_globally !== false;
            const isReturnable = isGloballyAllowed && (product.is_returnable !== 0 && product.is_returnable !== false && product.is_returnable !== '0');
            const hasCustomPolicy = Boolean(product.return_policy && product.return_policy.trim().length > 0);
            const returnDays = hasCustomPolicy
              ? (product.return_window_days || returnSettings?.default_return_window || 7)
              : (returnSettings?.default_return_window || product.return_window_days || 7);
            const policyText = hasCustomPolicy
              ? product.return_policy
              : (returnSettings?.global_policy_text || `Eligible for return or replacement within ${returnDays} days of delivery. Perfume flacon must be unopened, in its original box with cellophane seal and batch code intact for authenticity and hygiene standards.`);

            return (
              <div 
                style={{
                  marginTop: '16px',
                  background: isReturnable 
                    ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(15, 20, 30, 0.6) 100%)'
                    : 'linear-gradient(135deg, rgba(244, 63, 94, 0.06) 0%, rgba(15, 20, 30, 0.6) 100%)',
                  border: isReturnable 
                    ? '1px solid rgba(212, 175, 55, 0.35)' 
                    : '1px solid rgba(244, 63, 94, 0.3)',
                  borderRadius: '14px',
                  padding: '14px 16px',
                  boxShadow: isReturnable ? '0 4px 20px rgba(0,0,0,0.3)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div 
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: isReturnable ? 'rgba(212, 175, 55, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}
                    >
                      {isReturnable ? (
                        <RotateCcw size={16} color="#d4af37" />
                      ) : (
                        <Lock size={16} color="#f43f5e" />
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: isReturnable ? '#f5df93' : '#fda4af', letterSpacing: '0.02em' }}>
                        {isReturnable ? `${returnDays}-Day Hassle-Free Returns & Replacements` : 'Non-Returnable Fragrance'}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#cbd5e1', marginTop: '3px', lineHeight: 1.45 }}>
                        {isReturnable ? (
                          <>Easy return pickup from your doorstep if seal is unopened.</>
                        ) : (
                          <>Final sale item protected by luxury personal care & hygiene standards.</>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowFullReturnPolicy(!showFullReturnPolicy)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: isReturnable ? '#d4af37' : '#fda4af',
                      cursor: 'pointer',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 6px',
                      flexShrink: 0
                    }}
                    title="View return policy conditions"
                  >
                    {showFullReturnPolicy ? 'Hide Details' : 'Policy Details'}
                    {showFullReturnPolicy ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>

                {/* Collapsible Policy Details */}
                {showFullReturnPolicy && (
                  <div 
                    style={{
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                      fontSize: '0.78rem',
                      color: '#cbd5e1',
                      lineHeight: '1.55'
                    }}
                  >
                    <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Info size={13} color="#d4af37" /> Return & Hygiene Conditions:
                    </div>
                    <p style={{ margin: '0 0 8px 0', whiteSpace: 'pre-line' }}>{policyText}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.72rem', color: '#94a3b8' }}>
                      <div>• Apply online through your <strong>Member Profile → Returns & Refunds</strong> tab within {returnDays} days of receiving parcel.</div>
                      {returnSettings?.support_email && (
                        <div>• Concierge Support: <a href={`mailto:${returnSettings.support_email}`} style={{ color: '#d4af37', textDecoration: 'underline' }}>{returnSettings.support_email}</a> {returnSettings.support_phone ? `• ${returnSettings.support_phone}` : ''}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

        </div>

      </div>

      {/* Scent Architecture & Notes Pyramid */}
      <FragrancePyramid
        topNotes={product.top_notes}
        middleNotes={product.middle_notes}
        baseNotes={product.base_notes}
      />

      {/* CUSTOMER REVIEWS & ADD REVIEW SECTION */}
      <section style={{ maxWidth: '1000px', margin: '80px auto', padding: '0 10px' }}>
        <div style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.3)', paddingBottom: '16px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: '#f8fafc' }}>
              Client Accolades & Reviews
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#94a3b8' }}>
              Experiences from our fragrance society
            </p>
          </div>
          <span className="badge-gold">
            {reviews.length} Client Testimonials
          </span>
        </div>

        {/* Add Review Form */}
        <div className="glass-card" style={{ padding: '28px', borderRadius: '16px', marginBottom: '40px' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#f5df93', marginBottom: '14px' }}>
            Share Your Olfactory Impression
          </h3>

          <form onSubmit={handleReviewSubmit}>
            {/* Star Picker */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Your Rating:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setReviewRating(star)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px' }}
                  >
                    <Star 
                      size={20} 
                      fill={star <= reviewRating ? '#f59e0b' : 'none'} 
                      color="#f59e0b" 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <input
                type="text"
                placeholder="Review Headline (e.g. Masterpiece fragrance, long lasting scent trail)..."
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                className="form-input-luxury"
                style={{ padding: '10px 14px', fontSize: '0.88rem' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <textarea
                placeholder="Describe the note progression, projection, and occasion you wore this scent..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
                required
                className="form-input-luxury"
                style={{ padding: '12px 14px', fontSize: '0.88rem', resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="btn-luxury-gold"
              style={{ padding: '10px 24px', fontSize: '0.88rem' }}
            >
              <Send size={15} /> Submit Fragrance Review
            </button>
          </form>
        </div>

        {/* Existing Reviews List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reviews.length === 0 ? (
            <p style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
              Be the first to review this artisanal masterpiece.
            </p>
          ) : (
            reviews.map(rev => (
              <div key={rev.id} className="glass-panel" style={{ padding: '20px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'rgba(212, 175, 55, 0.15)',
                      border: '1px solid var(--border-gold)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      color: '#f5df93',
                      fontSize: '0.85rem'
                    }}>
                      {rev.user_name ? rev.user_name.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>{rev.user_name || 'Verified Client'}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{new Date(rev.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', color: '#f59e0b' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={13} fill={i < rev.rating ? '#f59e0b' : 'none'} color="#f59e0b" />
                    ))}
                  </div>
                </div>

                {rev.title && (
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#f5df93', marginBottom: '4px' }}>
                    {rev.title}
                  </div>
                )}
                <p style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                  {rev.comment}
                </p>
              </div>
            ))
          )}
        </div>

      </section>

      {/* YOU MIGHT ALSO LIKE / RECOMMENDED FRAGRANCES */}
      {relatedProducts.length > 0 && (
        <section style={{ marginTop: '80px', marginBottom: '40px' }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '0.74rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: '6px' }}>
              CURATED RECOMMENDATIONS
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', color: '#ffffff', margin: 0 }}>
              You Might Also Like
            </h2>
          </div>
          <div className="product-grid">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} onQuickView={setQuickViewProduct} />
            ))}
          </div>
        </section>
      )}

      {/* Quick View Modal Popup */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
      />

    </div>
  );
};

export default ProductDetails;
