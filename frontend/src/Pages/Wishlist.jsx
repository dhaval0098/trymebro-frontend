import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveAllToCart = () => {
    wishlistItems.forEach(item => {
      addToCart(item, 1);
    });
  };

  if (wishlistItems.length === 0) {
    return (
      <div style={{ maxWidth: '780px', margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '60px 30px', borderRadius: '24px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto'
          }}>
            <Heart size={36} color="#f43f5e" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#ffffff', marginBottom: '12px' }}>
            Your Wishlist is Untouched
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#94a3b8', maxWidth: '460px', margin: '0 auto 28px auto', lineHeight: '1.6' }}>
            Save your favorite perfumes, luxury scents, and iconic fragrance bottles.
          </p>
          <Link to="/shop" className="btn-luxury-gold" style={{ padding: '14px 36px', fontSize: '0.95rem' }}>
            Explore Luxury Fragrances <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1360px', margin: '40px auto', padding: '0 20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', marginBottom: '36px' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: '4px' }}>
            CURATED CLIENT VAULT
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: '#ffffff' }}>
            My Favored Fragrances ({wishlistItems.length})
          </h1>
        </div>

        <button
          onClick={handleMoveAllToCart}
          className="btn-luxury-gold"
          style={{ padding: '12px 24px', fontSize: '0.88rem' }}
        >
          <ShoppingBag size={16} /> Move All to Fragrance Bag
        </button>
      </div>

      {/* Grid of Wishlist Items */}
      <div className="product-grid">
        {wishlistItems.map(item => {
          const prodId = item.product_id || item.id;
          const activePrice = Number(item.discount_price || item.price);

          return (
            <div key={prodId} className="glass-card" style={{ padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
              
              {/* Image */}
              <Link to={`/product/${item.slug || prodId}`} style={{ position: 'relative', paddingTop: '100%', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#0a0d14', marginBottom: '14px', display: 'block' }}>
                <img src={item.primary_image} alt={item.name} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              </Link>

              {/* Info */}
              <div style={{ fontSize: '0.74rem', color: '#d4af37', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '2px' }}>
                {item.brand_name || 'TRY ME BRO'}
              </div>

              <Link to={`/product/${item.slug || prodId}`} style={{ textDecoration: 'none' }}>
                <h3 style={{ fontSize: '1.02rem', fontWeight: 600, color: '#f8fafc', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.name}
                </h3>
              </Link>

              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px' }}>
                ₹{activePrice.toLocaleString('en-IN')}
              </div>

              {/* Actions */}
              <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => addToCart(item, 1)}
                  className="btn-luxury-gold"
                  style={{ flex: 1, padding: '10px', fontSize: '0.82rem' }}
                >
                  <ShoppingBag size={14} /> Add to Bag
                </button>
                <button
                  onClick={() => removeFromWishlist(prodId)}
                  className="btn-icon-round"
                  style={{ width: '42px', height: '42px', color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                  title="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

export default Wishlist;
