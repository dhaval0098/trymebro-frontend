import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Star, Eye, ChevronLeft, ChevronRight, Plus, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const DEFAULT_PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80';

const ProductCard = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return null;

  // Extract size variants if available
  let parsedVariants = [];
  if (product.size_variants) {
    try {
      parsedVariants = typeof product.size_variants === 'string' ? JSON.parse(product.size_variants) : product.size_variants;
    } catch (e) {}
  }
  const displaySizes = Array.isArray(parsedVariants) && parsedVariants.length > 0
    ? parsedVariants.map(v => v.size).filter(Boolean).join(', ')
    : (product.bottle_sizes || (product.volume_ml ? `${product.volume_ml}ml` : ''));

  // Assemble ONLY images uploaded by the admin (primary_image + additional_images)
  const rawImages = [];
  if (product.primary_image && typeof product.primary_image === 'string' && product.primary_image.trim().length > 0) {
    rawImages.push(product.primary_image.trim());
  }
  if (product.additional_images) {
    try {
      const parsed = typeof product.additional_images === 'string' ? JSON.parse(product.additional_images) : product.additional_images;
      if (Array.isArray(parsed)) {
        parsed.forEach(img => {
          if (img && typeof img === 'string' && img.trim().length > 0) {
            rawImages.push(img.trim());
          }
        });
      }
    } catch (e) {}
  }

  // Deduplicate and filter valid images
  const uniqueImages = Array.from(new Set(rawImages));

  // If no photos uploaded at all, fallback to 1 single placeholder; otherwise only use admin photos
  const images = uniqueImages.length > 0 ? uniqueImages : [DEFAULT_PLACEHOLDER_IMAGE];
  const prodIdNum = Number(product.id) || 1;

  // Reset activeImageIndex if it is out of bounds
  useEffect(() => {
    if (activeImageIndex >= images.length) {
      setActiveImageIndex(0);
    }
  }, [images.length, activeImageIndex]);

  // Auto-advance looping slideshow ONLY when more than 1 image exists
  useEffect(() => {
    if (images.length <= 1) return;

    const staggerDelay = (prodIdNum * 550) % 2200;
    let intervalId;

    const startTimer = setTimeout(() => {
      intervalId = setInterval(() => {
        setActiveImageIndex((prev) => (prev + 1) % images.length);
      }, 3400);
    }, staggerDelay);

    return () => {
      clearTimeout(startTimer);
      if (intervalId) clearInterval(intervalId);
    };
  }, [images.length, prodIdNum]);

  const isFavorited = isInWishlist(product.id);
  const activePrice = Number(product.discount_price || product.price);
  const originalPrice = Number(product.price);
  const hasDiscount = product.discount_price && Number(product.discount_price) < originalPrice;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - activePrice) / originalPrice) * 100) : 0;

  return (
    <div 
      className="glass-card product-card" 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        padding: '16px',
        borderRadius: '16px'
      }}
    >
      {/* Badges Overlay */}
      <div 
        className="product-card-badges"
        style={{
          position: 'absolute',
          top: '14px',
          left: '14px',
          zIndex: 5,
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          pointerEvents: 'none'
        }}
      >
        {Boolean(hasDiscount && discountPercent > 0) && (
          <span className="badge-rose">
            SAVE {discountPercent}%
          </span>
        )}
        {Boolean(product.is_best_seller) && (
          <span className="badge-gold">
            BESTSELLER
          </span>
        )}
        {Boolean(product.is_new_arrival) && (
          <span style={{
            background: 'rgba(16, 185, 129, 0.2)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#6ee7b7',
            fontSize: '0.7rem',
            fontWeight: 600,
            padding: '3px 10px',
            borderRadius: '9999px',
            textTransform: 'uppercase'
          }}>
            NEW
          </span>
        )}
      </div>

      {/* Wishlist Button Overlay */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product);
        }}
        className="product-card-wishlist-btn"
        style={{
          position: 'absolute',
          top: '14px',
          right: '14px',
          zIndex: 6,
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          background: 'rgba(15, 19, 28, 0.75)',
          backdropFilter: 'blur(8px)',
          border: isFavorited ? '1px solid #f43f5e' : '1px solid rgba(255, 255, 255, 0.15)',
          color: isFavorited ? '#f43f5e' : '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        title="Add to Wishlist"
      >
        <Heart size={15} fill={isFavorited ? '#f43f5e' : 'none'} />
      </button>

      {/* Image Container with Looping Smooth Swiper & Link */}
      <div 
        className="product-card-img-box"
        style={{
          position: 'relative',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#0a0d14',
          marginBottom: '14px'
        }}
      >
        <Link 
          to={`/product/${product.slug || product.id}`}
          style={{
            display: 'block',
            position: 'relative',
            paddingTop: '100%',
            overflow: 'hidden'
          }}
        >
          {images.map((imgSrc, idx) => {
            const isActive = idx === activeImageIndex;
            return (
              <img 
                key={idx}
                src={imgSrc} 
                alt={`${product.name} - View ${idx + 1}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? 'scale(1)' : 'scale(1.04)',
                  transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  zIndex: isActive ? 2 : 1,
                  pointerEvents: isActive ? 'auto' : 'none'
                }}
                className="product-card-img"
              />
            );
          })}
        </Link>

        {/* Previous / Next Luxury Navigation Arrows & Indicators (Only when multiple photos exist) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
              }}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: isHovered ? 'translateY(-50%) translateX(0) scale(1)' : 'translateY(-50%) translateX(-8px) scale(0.85)',
                opacity: isHovered ? 1 : 0,
                pointerEvents: isHovered ? 'auto' : 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(16, 21, 31, 0.88) 0%, rgba(8, 10, 16, 0.96) 100%)',
                border: '1px solid rgba(212, 175, 55, 0.65)',
                color: '#f5df93',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 6,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.6), 0 0 10px rgba(212, 175, 55, 0.25)',
                transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              className="card-nav-arrow"
              title="Previous Photo"
            >
              <ChevronLeft size={16} strokeWidth={2.4} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveImageIndex((prev) => (prev + 1) % images.length);
              }}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: isHovered ? 'translateY(-50%) translateX(0) scale(1)' : 'translateY(-50%) translateX(8px) scale(0.85)',
                opacity: isHovered ? 1 : 0,
                pointerEvents: isHovered ? 'auto' : 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(16, 21, 31, 0.88) 0%, rgba(8, 10, 16, 0.96) 100%)',
                border: '1px solid rgba(212, 175, 55, 0.65)',
                color: '#f5df93',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 6,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.6), 0 0 10px rgba(212, 175, 55, 0.25)',
                transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              className="card-nav-arrow"
              title="Next Photo"
            >
              <ChevronRight size={16} strokeWidth={2.4} />
            </button>

            {/* Micro Pagination Dots */}
            <div
              style={{
                position: 'absolute',
                bottom: '8px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '4px',
                zIndex: 4,
                padding: '3px 8px',
                borderRadius: '10px',
                background: 'rgba(0, 0, 0, 0.45)',
                backdropFilter: 'blur(4px)',
                opacity: isHovered ? 0 : 0.85,
                transition: 'opacity 0.25s ease',
                pointerEvents: 'none'
              }}
            >
              {images.map((_, dotIdx) => (
                <span
                  key={dotIdx}
                  style={{
                    width: dotIdx === activeImageIndex ? '12px' : '5px',
                    height: '4px',
                    borderRadius: '2px',
                    backgroundColor: dotIdx === activeImageIndex ? '#d4af37' : 'rgba(255, 255, 255, 0.4)',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          </>
        )}

        {/* Quick View Button */}
        {onQuickView && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickView(product);
            }}
            className="quick-look-btn"
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(10, 13, 20, 0.92)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(212, 175, 55, 0.6)',
              borderRadius: '20px',
              padding: '6px 16px',
              color: '#f5df93',
              fontSize: '0.74rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              zIndex: 5,
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <Eye size={13} color="#d4af37" /> Quick Look
          </button>
        )}
      </div>

      {/* Product Information */}
      <div className="product-card-info" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Brand & Concentration */}
        <div className="product-card-brand-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.74rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            {product.brand_name || 'TRY ME BRO'}
          </span>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
            {product.concentration || 'Eau de Parfum'}
          </span>
        </div>

        {/* Product Title */}
        <Link to={`/product/${product.slug || product.id}`} style={{ textDecoration: 'none' }}>
          <h3 
            className="product-card-title"
            style={{
              fontSize: '0.98rem',
              fontWeight: 600,
              color: '#f8fafc',
              margin: '4px 0 8px 0',
              lineHeight: 1.3,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {product.name}
          </h3>
        </Link>

        {/* Scent Family / Key Notes Snippet */}
        <div className="product-card-notes" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
          {product.scent_family && (
            <span className="note-tag" style={{ color: '#f5df93', borderColor: 'rgba(212, 175, 55, 0.25)' }}>
              {product.scent_family}
            </span>
          )}
          {displaySizes && (
            <span className="note-tag">
              {displaySizes}
            </span>
          )}
        </div>

        {/* Rating Stars */}
        <div className="product-card-rating" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', color: '#f59e0b' }}>
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={13} 
                fill={i < Math.floor(Number(product.rating || 5)) ? '#f59e0b' : 'none'} 
                color="#f59e0b" 
              />
            ))}
          </div>
          <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
            ({product.num_reviews || 12})
          </span>
        </div>

        {/* Price & Add to Cart Button */}
        <div 
          className="product-card-footer"
          style={{
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            borderTop: '1px solid rgba(212, 175, 55, 0.15)',
            paddingTop: '10px'
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="product-card-price" style={{ fontSize: 'clamp(0.92rem, 3vw, 1.12rem)', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', lineHeight: 1.15 }}>
              ₹{Math.round(activePrice).toLocaleString('en-IN')}
            </div>
            {hasDiscount && (
              <div className="product-card-old-price" style={{ fontSize: '0.70rem', color: '#64748b', textDecoration: 'line-through', marginTop: '2px', whiteSpace: 'nowrap' }}>
                ₹{Math.round(originalPrice).toLocaleString('en-IN')}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product, 1);
              setIsAdded(true);
              setTimeout(() => setIsAdded(false), 1200);
            }}
            className={`card-add-to-cart-btn ${isAdded ? 'is-added' : ''}`}
            aria-label={`Add ${product.name} to cart`}
            title="Add to Cart"
          >
            {isAdded ? (
              <>
                <Check size={13} strokeWidth={3} />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus size={13} strokeWidth={2.8} />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
