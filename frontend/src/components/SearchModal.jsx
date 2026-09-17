import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  X, 
  Sparkles, 
  ArrowRight, 
  ChevronRight, 
  Layers, 
  Crown, 
  Droplets, 
  Compass,
  Flame
} from 'lucide-react';
import api from '../services/api';

const POPULAR_ACCORDS = [
  { name: 'Oud & Agarwood', tag: 'Oud', family: 'Woody' },
  { name: 'Bourbon Vanilla', tag: 'Vanilla', family: 'Oriental' },
  { name: 'Damask Rose & Taif', tag: 'Rose', family: 'Floral' },
  { name: 'Ambergris & Amber', tag: 'Amber', family: 'Oriental' },
  { name: 'Calabrian Bergamot', tag: 'Bergamot', family: 'Fresh' },
  { name: 'Mysore Sandalwood', tag: 'Sandalwood', family: 'Woody' },
  { name: 'Smoky Leather & Tobacco', tag: 'Leather', family: 'Woody' },
  { name: 'French Lavender & Iris', tag: 'Lavender', family: 'Floral' },
  { name: 'Sea Salt & Aquatic', tag: 'Aquatic', family: 'Fresh' },
  { name: 'Pure Extrait 30%+', tag: 'Extrait', family: 'Niche' }
];

const TRENDING_TAGS = [
  'Royal Oud',
  'Vanilla Bourbon',
  'Creed Aventus',
  'Bleu de Chanel',
  'Extrait de Parfum',
  'Rose Taif',
  'Woody & Earthy',
  'Baccarat Rouge'
];

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Load categories & brands once
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          api.get('/categories').catch(() => ({ data: { categories: [] } })),
          api.get('/brands').catch(() => ({ data: { brands: [] } }))
        ]);
        if (catRes.data?.categories) setAllCategories(catRes.data.categories);
        if (brandRes.data?.brands) setAllBrands(brandRes.data.brands);
      } catch (e) {
        console.error('Error fetching search metadata:', e);
      }
    };
    fetchMeta();
  }, []);

  // Autofocus when modal opens & handle Escape key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 60);

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  // Live search debounced
  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      setProducts([]);
      setCategories([]);
      setBrands([]);
      setLoading(false);
      return;
    }

    // Match categories locally
    const matchedCats = allCategories.filter(c => 
      c.name?.toLowerCase().includes(trimmed) || 
      c.slug?.toLowerCase().includes(trimmed) ||
      c.description?.toLowerCase().includes(trimmed)
    );
    setCategories(matchedCats);

    // Match brands locally
    const matchedBrs = allBrands.filter(b => 
      b.name?.toLowerCase().includes(trimmed) || 
      b.slug?.toLowerCase().includes(trimmed)
    );
    setBrands(matchedBrs);

    // Fetch matching products from API
    setLoading(true);
    const debounceTimer = setTimeout(async () => {
      try {
        const res = await api.get(`/products?search=${encodeURIComponent(trimmed)}&limit=6`);
        if (res.data?.success) {
          setProducts(res.data.products || []);
        }
      } catch (err) {
        console.error('Search query error:', err);
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => clearTimeout(debounceTimer);
  }, [query, allCategories, allBrands]);

  if (!isOpen) return null;

  // Filter matched accords / notes
  const trimmed = query.trim().toLowerCase();
  const matchedAccords = trimmed 
    ? POPULAR_ACCORDS.filter(a => 
        a.name.toLowerCase().includes(trimmed) || 
        a.tag.toLowerCase().includes(trimmed) ||
        a.family.toLowerCase().includes(trimmed)
      )
    : [];

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const handleTagClick = (tag) => {
    setQuery(tag);
    navigate(`/shop?search=${encodeURIComponent(tag)}`);
    onClose();
  };

  const handleCategoryClick = (catSlug) => {
    navigate(`/shop?category=${encodeURIComponent(catSlug)}`);
    onClose();
  };

  const handleBrandClick = (brandSlug) => {
    navigate(`/shop?brand=${encodeURIComponent(brandSlug)}`);
    onClose();
  };

  const hasAnyResults = products.length > 0 || categories.length > 0 || brands.length > 0 || matchedAccords.length > 0;

  return (
    <div 
      className="luxury-search-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(3, 5, 8, 0.94)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        zIndex: 3000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'clamp(10px, 2.5vh, 28px) clamp(10px, 2.5vw, 20px)',
        overflowY: 'auto'
      }}
    >
      <div 
        className="luxury-search-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '820px',
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(10px, 2vw, 16px)'
        }}
      >
        {/* Top Control Bar with Close Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d4af37', fontSize: 'clamp(0.72rem, 2.2vw, 0.8rem)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            <Sparkles size={14} /> Fragrance Vault Search
          </div>
          <button
            onClick={onClose}
            aria-label="Close search"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              borderRadius: '20px',
              padding: 'clamp(5px, 1.2vw, 7px) clamp(10px, 2.2vw, 14px)',
              color: '#cbd5e1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: 'clamp(0.74rem, 2vw, 0.8rem)',
              transition: 'all 0.2s',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#d4af37';
              e.currentTarget.style.color = '#f5df93';
              e.currentTarget.style.background = 'rgba(212, 175, 55, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.35)';
              e.currentTarget.style.color = '#cbd5e1';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
            }}
          >
            <X size={15} />
            <span>Close</span>
          </button>
        </div>

        {/* Illuminated Luxury Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ width: '100%' }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            background: 'linear-gradient(135deg, rgba(16, 20, 30, 0.98) 0%, rgba(8, 10, 15, 0.99) 100%)',
            border: '1.5px solid rgba(212, 175, 55, 0.55)',
            borderRadius: '14px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.85), 0 0 25px rgba(212, 175, 55, 0.15)',
            padding: '4px 6px 4px clamp(10px, 2.5vw, 16px)',
            gap: '8px',
            width: '100%',
            transition: 'border-color 0.2s, box-shadow 0.2s'
          }}>
            <Search size={18} color="#d4af37" style={{ flexShrink: 0 }} />
            
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notes, oud, vanilla, creed..."
              style={{
                flex: '1 1 auto',
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#ffffff',
                fontSize: 'clamp(0.84rem, 2.4vw, 1rem)',
                padding: '10px 0',
                fontFamily: 'inherit',
                minWidth: 0
              }}
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '26px',
                  height: '26px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}

            <button
              type="submit"
              className="btn-luxury-gold"
              style={{
                flex: '0 0 auto',
                width: 'auto !important',
                maxWidth: 'max-content',
                padding: '7px 14px',
                fontSize: '0.78rem',
                borderRadius: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                whiteSpace: 'nowrap'
              }}
            >
              <span>Search</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </form>

        {/* Trending & Quick Scent Tags */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '6px',
          padding: '2px 2px'
        }}>
          <span style={{ fontSize: 'clamp(0.68rem, 2vw, 0.74rem)', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <Flame size={12} color="#f59e0b" /> Trending:
          </span>
          {TRENDING_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: 'clamp(3px, 1vw, 5px) clamp(8px, 1.8vw, 11px)',
                color: '#cbd5e1',
                fontSize: 'clamp(0.68rem, 2vw, 0.74rem)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#d4af37';
                e.currentTarget.style.color = '#f5df93';
                e.currentTarget.style.background = 'rgba(212, 175, 55, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = '#cbd5e1';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
              }}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* SEARCH RESULTS CONTAINER */}
        <div style={{
          background: 'rgba(10, 13, 20, 0.96)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          borderRadius: '16px',
          padding: 'clamp(12px, 2.5vw, 20px)',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.85)',
          maxHeight: '66vh',
          overflowY: 'auto'
        }}>
          
          {/* Loading Indicator */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '28px 0', color: '#d4af37' }}>
              <div className="gold-shimmer" style={{ display: 'inline-block', padding: '10px 20px', borderRadius: '10px', fontSize: '0.82rem' }}>
                Searching the royal perfume sanctuary...
              </div>
            </div>
          )}

          {/* Initial State when no query is typed */}
          {!loading && !query.trim() && (
            <div>
              <div style={{ fontSize: 'clamp(0.74rem, 2vw, 0.8rem)', color: '#f5df93', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Compass size={14} /> Explore Fragrance Sanctuary by Notes & Family
              </div>

              {/* Fragrance Families Quick Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '8px', marginBottom: '18px' }}>
                {[
                  { name: 'Woody & Earthy', slug: 'woody-earthy', desc: 'Cedar, Mysore Sandalwood & Rich Agarwood' },
                  { name: 'Oriental & Amber', slug: 'oriental-amber', desc: 'Saffron, Bourbon Vanilla & Warm Spices' },
                  { name: 'Floral Elegance', slug: 'floral-elegance', desc: 'Grasse Rose, Jasmine Sambac & Iris' },
                  { name: 'Fresh & Aquatic', slug: 'fresh-citrus', desc: 'Calabrian Bergamot & Ocean Salt' }
                ].map((f) => (
                  <button
                    key={f.slug}
                    onClick={() => handleCategoryClick(f.slug)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '10px',
                      padding: '10px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      color: '#f8fafc'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#d4af37';
                      e.currentTarget.style.background = 'rgba(212, 175, 55, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#f5df93', marginBottom: '2px' }}>{f.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.3 }}>{f.desc}</div>
                  </button>
                ))}
              </div>

              {/* Popular Scent Accords Chips */}
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginBottom: '8px' }}>
                Popular Fragrance Accords & Ingredients:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {POPULAR_ACCORDS.map((acc) => (
                  <button
                    key={acc.tag}
                    onClick={() => handleTagClick(acc.tag)}
                    style={{
                      background: 'rgba(212, 175, 55, 0.08)',
                      border: '1px solid rgba(212, 175, 55, 0.22)',
                      borderRadius: '8px',
                      padding: '4px 9px',
                      color: '#e2e8f0',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Droplets size={11} color="#d4af37" />
                    <span>{acc.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Result Matches */}
          {!loading && query.trim() && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* SECTION 1: MATCHING CATEGORIES & FRAGRANCE FAMILIES */}
              {categories.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Layers size={13} /> Matching Fragrance Families ({categories.length})
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '8px' }}>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.slug || cat.id)}
                        style={{
                          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                          border: '1px solid rgba(212, 175, 55, 0.3)',
                          borderRadius: '10px',
                          padding: '8px 12px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          color: '#f8fafc',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#d4af37';
                          e.currentTarget.style.background = 'rgba(212, 175, 55, 0.18)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)';
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#f5df93' }}>{cat.name}</div>
                          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Explore Category</div>
                        </div>
                        <ChevronRight size={14} color="#d4af37" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 2: MATCHING BRANDS & SIMILAR LOOKS/ACCORDS */}
              {(brands.length > 0 || matchedAccords.length > 0) && (
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Crown size={13} /> Matching Brands & Scent Accords
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {brands.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => handleBrandClick(b.slug || b.id)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(212, 175, 55, 0.35)',
                          borderRadius: '8px',
                          padding: '5px 11px',
                          color: '#f8fafc',
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <Crown size={12} color="#d4af37" />
                        <span>{b.name}</span>
                      </button>
                    ))}

                    {matchedAccords.map((acc) => (
                      <button
                        key={acc.tag}
                        onClick={() => handleTagClick(acc.tag)}
                        style={{
                          background: 'rgba(212, 175, 55, 0.1)',
                          border: '1px solid rgba(212, 175, 55, 0.25)',
                          borderRadius: '8px',
                          padding: '5px 11px',
                          color: '#e2e8f0',
                          fontSize: '0.76rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <Droplets size={12} color="#d4af37" />
                        <span>{acc.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 3: MATCHING FRAGRANCE PRODUCTS */}
              {products.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Droplets size={13} /> Fragrances Found ({products.length})
                    </span>
                    <button
                      onClick={handleSearchSubmit}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#f5df93',
                        fontSize: '0.74rem',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      View All →
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '8px' }}>
                    {products.map((prod) => {
                      const activePrice = Number(prod.discount_price || prod.price);
                      const originalPrice = Number(prod.price);
                      const hasDiscount = prod.discount_price && activePrice < originalPrice;

                      return (
                        <Link
                          key={prod.id}
                          to={`/product/${prod.slug || prod.id}`}
                          onClick={onClose}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '12px',
                            padding: '8px 10px',
                            textDecoration: 'none',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#d4af37';
                            e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                          }}
                        >
                          <img
                            src={prod.primary_image}
                            alt={prod.name}
                            style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              border: '1px solid rgba(212, 175, 55, 0.3)',
                              backgroundColor: '#0a0d14',
                              flexShrink: 0
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                              <span style={{ fontSize: '0.66rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                                {prod.brand_name || 'TRY ME BRO'}
                              </span>
                              {prod.scent_family && (
                                <span style={{ fontSize: '0.62rem', background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: '3px', color: '#94a3b8' }}>
                                  {prod.scent_family}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {prod.name}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', marginTop: '2px' }}>
                              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f5df93' }}>
                                ₹{activePrice.toLocaleString('en-IN')}
                              </span>
                              {hasDiscount && (
                                <span style={{ fontSize: '0.7rem', color: '#64748b', textDecoration: 'line-through' }}>
                                  ₹{originalPrice.toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight size={15} color="#d4af37" style={{ flexShrink: 0 }} />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* NO RESULTS STATE */}
              {!hasAnyResults && (
                <div style={{ textAlign: 'center', padding: '24px 12px' }}>
                  <div style={{ fontSize: '1rem', color: '#f8fafc', fontWeight: 600, marginBottom: '6px' }}>
                    No exact matches found for "{query}"
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', maxWidth: '440px', margin: '0 auto 16px auto', lineHeight: 1.5 }}>
                    Try searching by ingredient notes like <strong style={{ color: '#f5df93' }}>Oud, Vanilla, Amber, Rose</strong>.
                  </p>
                  <button
                    onClick={handleSearchSubmit}
                    className="btn-luxury-gold"
                    style={{ padding: '9px 20px', fontSize: '0.84rem', width: '100%', maxWidth: '280px' }}
                  >
                    Search Catalog for "{query}" <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {/* Bottom Sticky Action / View All Bar */}
              {hasAnyResults && (
                <div style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingTop: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                    Top curated results for <strong style={{ color: '#f5df93' }}>"{query}"</strong>
                  </div>
                  <button
                    onClick={handleSearchSubmit}
                    className="btn-luxury-gold"
                    style={{ padding: '8px 16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', width: '100%', maxWidth: '240px' }}
                  >
                    <span>View All Results</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SearchModal;
