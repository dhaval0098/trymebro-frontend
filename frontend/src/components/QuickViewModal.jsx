import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ShoppingBag, Heart, Star, Sparkles, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const QuickViewModal = ({ product, isOpen, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedVolume, setSelectedVolume] = useState('100ml');
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Helper to extract available sizes
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

  // Reset selected size when product changes
  useEffect(() => {
    if (product) {
      const sizes = getAvailableSizes(product);
      setSelectedVolume(sizes[0] || '100ml');
      setQuantity(1);
    }
  }, [product]);

  // Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const isFavorited = isInWishlist(product.id);

  // Variant resolver
  let parsedVariants = [];
  if (product.size_variants) {
    try {
      parsedVariants = typeof product.size_variants === 'string' ? JSON.parse(product.size_variants) : product.size_variants;
    } catch (e) {}
  }
  const matchedVariant = Array.isArray(parsedVariants) ? parsedVariants.find(v => (v.size || '').trim().toLowerCase() === (selectedVolume || '').trim().toLowerCase()) : null;

  const activePrice = matchedVariant && (matchedVariant.price || matchedVariant.discount_price)
    ? Number(matchedVariant.discount_price || matchedVariant.price)
    : Number(product.discount_price || product.price);

  const originalPrice = matchedVariant && matchedVariant.price
    ? Number(matchedVariant.price)
    : Number(product.price || 0);

  const hasDiscount = Boolean(
    matchedVariant && matchedVariant.price
      ? (matchedVariant.discount_price && Number(matchedVariant.discount_price) < Number(matchedVariant.price))
      : (product.discount_price && Number(product.discount_price) < originalPrice)
  );

  const discountPercent = hasDiscount && originalPrice > 0
    ? Math.round(((originalPrice - activePrice) / originalPrice) * 100)
    : 0;

  const handleAdd = () => {
    addToCart({
      ...product,
      price: originalPrice,
      discount_price: hasDiscount ? activePrice : null,
      volume_ml: parseInt(selectedVolume, 10) || product.volume_ml,
      selected_size: selectedVolume
    }, quantity);
    onClose();
  };

  const modalContent = (
    <div className="quick-view-overlay" onClick={onClose}>
      <div className="quick-view-modal-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="quick-view-close-btn"
          aria-label="Close Quick View"
        >
          <X size={18} />
        </button>

        {/* Left: Product Image */}
        <div className="quick-view-img-wrapper" style={{ position: 'relative' }}>
          <img 
            src={product.primary_image} 
            alt={product.name} 
            loading="lazy"
          />
          {hasDiscount && discountPercent > 0 && (
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: 'linear-gradient(135deg, #e11d48, #be123c)',
              color: '#ffffff',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              padding: '4px 9px',
              borderRadius: '9999px',
              boxShadow: '0 4px 12px rgba(225, 29, 72, 0.45)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              zIndex: 3
            }}>
              <span>SAVE {discountPercent}%</span>
            </div>
          )}
        </div>

        {/* Right: Product Details */}
        <div className="quick-view-details">
          <div style={{ fontSize: '0.78rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '6px' }}>
            {product.brand_name || 'TRY ME BRO'} • {product.concentration || 'Eau de Parfum'}
          </div>

          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.2rem, 2.2vw, 1.55rem)', color: '#f8fafc', marginBottom: '8px', lineHeight: '1.25' }}>
            {product.name}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', color: '#f59e0b' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill={i < Math.floor(Number(product.rating || 5)) ? '#f59e0b' : 'none'} color="#f59e0b" />
              ))}
            </div>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              {product.rating || '4.9'} ({product.num_reviews || 48} reviews)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
            <span style={{ fontSize: '1.45rem', fontWeight: 700, color: '#f8fafc' }}>
              ₹{activePrice.toLocaleString('en-IN')}
            </span>
            {hasDiscount && (
              <>
                <span style={{ fontSize: '0.92rem', color: '#64748b', textDecoration: 'line-through' }}>
                  ₹{originalPrice.toLocaleString('en-IN')}
                </span>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#fb7185',
                  background: 'rgba(225, 29, 72, 0.12)',
                  border: '1px solid rgba(225, 29, 72, 0.25)',
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}>
                  {discountPercent}% OFF
                </span>
              </>
            )}
          </div>

          <p style={{
            fontSize: '0.84rem',
            color: '#94a3b8',
            lineHeight: '1.6',
            marginBottom: '16px',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {product.description}
          </p>

          {/* Fragrance Notes Snippet */}
          {product.top_notes && (
            <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '14px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div><strong style={{ color: '#f5df93' }}>Top:</strong> {product.top_notes}</div>
              {product.base_notes && <div style={{ marginTop: '4px' }}><strong style={{ color: '#f5df93' }}>Base:</strong> {product.base_notes}</div>}
            </div>
          )}

          {/* Bottle Size Selector */}
          {(() => {
            const availableSizes = getAvailableSizes(product);
            if (availableSizes.length <= 1) return null;

            return (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.72rem', color: '#f5df93', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
                  Bottle Size: <strong style={{ color: '#ffffff' }}>{selectedVolume}</strong>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {availableSizes.map(vol => {
                    const isSelected = (selectedVolume || '').trim().toLowerCase() === (vol || '').trim().toLowerCase();
                    const variantData = Array.isArray(parsedVariants) ? parsedVariants.find(v => (v.size || '').trim().toLowerCase() === (vol || '').trim().toLowerCase()) : null;
                    const vPrice = variantData ? Number(variantData.discount_price || variantData.price) : null;

                    return (
                      <button
                        key={vol}
                        type="button"
                        onClick={() => setSelectedVolume(vol)}
                        style={{
                          background: isSelected ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255,255,255,0.04)',
                          border: isSelected ? '1.5px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          padding: '6px 10px',
                          color: isSelected ? '#f5df93' : '#f8fafc',
                          fontSize: '0.78rem',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <span>{vol.toLowerCase().includes('ml') ? vol : `${vol} ml`}</span>
                        {vPrice && <span style={{ fontSize: '0.7rem', color: isSelected ? '#ffffff' : '#94a3b8' }}>• ₹{vPrice.toLocaleString('en-IN')}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Quantity & CTA */}
          <div className="quick-view-actions">
            <div className="quick-view-buttons-row">
              <div className="quick-view-stepper">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ background: 'transparent', border: 'none', color: '#f8fafc', cursor: 'pointer', padding: '4px 8px', fontSize: '1rem' }}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span style={{ margin: '0 8px', fontWeight: 600, fontSize: '0.9rem' }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ background: 'transparent', border: 'none', color: '#f8fafc', cursor: 'pointer', padding: '4px 8px', fontSize: '1rem' }}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAdd}
                className="btn-luxury-gold quick-view-add-btn"
              >
                <ShoppingBag size={16} /> Add to Bag
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className="quick-view-wish-btn"
                aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
                style={{
                  borderColor: isFavorited ? '#f43f5e' : 'rgba(255, 255, 255, 0.15)'
                }}
              >
                <Heart size={18} fill={isFavorited ? '#f43f5e' : 'none'} color={isFavorited ? '#f43f5e' : '#f8fafc'} />
              </button>
            </div>

            <Link
              to={`/product/${product.slug || product.id}`}
              onClick={onClose}
              style={{
                textAlign: 'center',
                fontSize: '0.8rem',
                color: '#d4af37',
                textDecoration: 'underline',
                marginTop: '4px'
              }}
            >
              View Full Fragrance Details & Reviews →
            </Link>
          </div>

        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default QuickViewModal;
