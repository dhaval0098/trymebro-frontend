import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { 
  ShoppingBag, 
  Heart, 
  User, 
  Search, 
  Menu, 
  X, 
  Sparkles, 
  LogOut, 
  Package, 
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Flame,
  Crown,
  Compass,
  Layers,
  Award,
  Clock,
  ArrowRight,
  Droplets,
  ShieldCheck,
  Copy,
  Check,
  Gift,
  Tag,
  Headphones,
  MessageSquare,
  Star
} from 'lucide-react';
import api from '../services/api';
import SearchModal from './SearchModal';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { totalItemsCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const [categories, setCategories] = useState([]);
  const [fragrances, setFragrances] = useState([]);
  const [publishedCoupons, setPublishedCoupons] = useState([]);
  const [activeCouponIdx, setActiveCouponIdx] = useState(0);
  const [isCouponTransitioning, setIsCouponTransitioning] = useState(false);
  const [copiedNavCode, setCopiedNavCode] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Fetch live categories, fragrances, and published promo coupons
  useEffect(() => {
    let isMounted = true;
    const fetchNavData = async () => {
      try {
        const [catRes, prodRes, couponRes] = await Promise.all([
          api.get('/categories').catch(() => ({ data: { categories: [] } })),
          api.get('/products?limit=50').catch(() => ({ data: { products: [] } })),
          api.get('/coupons/public').catch(() => ({ data: { coupons: [] } }))
        ]);
        if (isMounted) {
          if (catRes.data?.categories) setCategories(catRes.data.categories);
          if (prodRes.data?.products) setFragrances(prodRes.data.products);
          if (couponRes.data?.coupons) {
            setPublishedCoupons(couponRes.data.coupons);
            setActiveCouponIdx(0);
          }
        }
      } catch (err) {
        console.error('Failed to load navbar data:', err);
      }
    };
    fetchNavData();
    return () => { isMounted = false; };
  }, [location.pathname]);

  // Derive ONLY truly active & published coupons (excluding inactive/expired ones)
  const activeCoupons = React.useMemo(() => {
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

  // Auto-rotate published active coupon codes every 3 seconds in continuous loop
  useEffect(() => {
    if (activeCoupons.length <= 1) return;

    const interval = setInterval(() => {
      setIsCouponTransitioning(true);
      setTimeout(() => {
        setActiveCouponIdx((prev) => (prev + 1) % activeCoupons.length);
        setIsCouponTransitioning(false);
      }, 200);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeCoupons.length]);

  const handleCopyNavCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedNavCode(true);
    toast.success(`✨ Coupon code "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedNavCode(false), 2500);
  };

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location]);

  const toggleMobileAccordion = (section) => {
    setMobileAccordion(mobileAccordion === section ? null : section);
  };

  const activePromo = activeCoupons.length > 0 ? activeCoupons[activeCouponIdx % activeCoupons.length] : null;

  return (
    <>
      {/* 1. Top Luxury Announcement Ticker (Dynamically auto-rotates active published coupons in a clean continuous loop) */}
      <div 
        className="announcement-bar"
        style={{
          background: 'linear-gradient(90deg, #06080d 0%, #1a1408 50%, #06080d 100%)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
          fontSize: 'clamp(0.68rem, 2vw, 0.74rem)',
          letterSpacing: '0.06em',
          padding: '6px clamp(8px, 2vw, 16px)',
          color: '#f5df93',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          width: '100%',
          zIndex: 1001,
          position: 'relative',
          textTransform: 'uppercase',
          textAlign: 'center',
          boxSizing: 'border-box',
          minHeight: '34px',
          userSelect: 'none'
        }}
      >
        {activePromo ? (
          <div 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '8px',
              opacity: isCouponTransitioning ? 0 : 1,
              transform: isCouponTransitioning ? 'translateY(-3px)' : 'translateY(0)',
              transition: 'opacity 0.2s ease, transform 0.2s ease'
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#ffffff', fontWeight: 500 }}>
              <Sparkles size={13} color="#d4af37" style={{ flexShrink: 0 }} />
              <span>{activePromo.description || `Special Privilege: ${activePromo.discount_type === 'percentage' ? `${activePromo.discount_value}% OFF` : `₹${activePromo.discount_value} OFF`}`}</span>
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'rgba(212, 175, 55, 0.5)' }}>•</span>
              <button
                type="button"
                onClick={() => handleCopyNavCoupon(activePromo.code)}
                style={{
                  background: 'rgba(212, 175, 55, 0.18)',
                  border: '1px solid rgba(212, 175, 55, 0.6)',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  color: '#fef08a',
                  fontFamily: 'monospace',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.08em'
                }}
                title="Click to copy coupon code"
              >
                <Tag size={11} color="#d4af37" />
                <span>{activePromo.code}</span>
                {copiedNavCode ? <Check size={11} color="#10b981" /> : <Copy size={11} color="#d4af37" />}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={12} color="#d4af37" style={{ flexShrink: 0 }} />
            <span>Complimentary Discovery Miniature Sample On Orders Over ₹5,000</span>
          </div>
        )}
      </div>

      {/* 2. Main Sticky Luxury Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%',
        background: isScrolled ? 'rgba(7, 9, 14, 0.98)' : 'rgba(8, 10, 15, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: isScrolled ? '1px solid rgba(212, 175, 55, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: isScrolled ? '0 10px 30px rgba(0, 0, 0, 0.8)' : 'none',
        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '8px clamp(8px, 2.5vw, 20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          width: '100%'
        }}>
          
          {/* Left: Mobile Menu Toggle & Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px, 1.5vw, 10px)', flexShrink: 0 }}>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="nav-action-btn d-lg-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={17} color="#d4af37" /> : <Menu size={17} />}
            </button>

            {/* Brand Logo with Gold Shimmer */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 12px)', textDecoration: 'none' }}>
              <img
                src="/logo.png"
                alt="TRY ME BRO Logo"
                style={{
                  width: 'clamp(38px, 8vw, 46px)',
                  height: 'clamp(38px, 8vw, 46px)',
                  borderRadius: '12px',
                  objectFit: 'cover',
                  background: '#04060a',
                  border: '1.5px solid rgba(212, 175, 55, 0.75)',
                  padding: '1px',
                  boxShadow: '0 0 18px rgba(212, 175, 55, 0.4)',
                  flexShrink: 0,
                  imageRendering: '-webkit-optimize-contrast'
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="brand-logo-text" style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(1rem, 4.2vw, 1.48rem)',
                  fontWeight: 900,
                  letterSpacing: '0.08em',
                  background: 'linear-gradient(135deg, #ffffff 0%, #fdf0cd 35%, #d4af37 75%, #aa8620 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textTransform: 'uppercase',
                  lineHeight: 1.05
                }}>
                  TRY ME BRO
                </span>
                <span style={{
                  fontSize: 'clamp(0.50rem, 1.6vw, 0.58rem)',
                  letterSpacing: '0.26em',
                  color: '#f5df93',
                  textTransform: 'uppercase',
                  fontWeight: 800,
                  marginTop: '1px'
                }}>
                  HAUTE PARFUMERIE
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation Bar with Rich Hover Effects & Dropdowns */}
          <nav className="d-none d-lg-flex" style={{
            alignItems: 'center',
            gap: '4px',
            height: '100%'
          }}>
            {/* 1. Home Direct Link */}
            <div className="nav-hover-item">
              <Link 
                to="/" 
                className={`nav-link-luxury ${location.pathname === '/' ? 'active' : ''}`}
                style={{ color: location.pathname === '/' ? '#f5df93' : '#e2e8f0' }}
              >
                Home
              </Link>
            </div>

            {/* 2. Collections (Mega Dropdown on Hover) */}
            <div className="nav-hover-item">
              <Link 
                to="/shop" 
                className={`nav-link-luxury ${location.pathname === '/shop' && !location.search ? 'active' : ''}`}
              >
                <span>Collections</span>
                <ChevronDown size={12} className="nav-chevron" />
              </Link>

              {/* Mega Dropdown Menu */}
              <div className="nav-dropdown-menu nav-dropdown-mega">
                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr 1.25fr', gap: '16px' }}>
                  
                  {/* Col 1: Concentrations */}
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--gold-primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Crown size={12} /> Concentrations
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <Link to="/shop?concentration=Extrait%20de%20Parfum" className="dropdown-link-item">
                        <span>Extrait de Parfum (30-40%)</span>
                        <ChevronRight size={12} className="item-arrow" />
                      </Link>
                      <Link to="/shop?concentration=Eau%20de%20Parfum" className="dropdown-link-item">
                        <span>Eau de Parfum (15-20%)</span>
                        <ChevronRight size={12} className="item-arrow" />
                      </Link>
                      <Link to="/shop?concentration=Eau%20de%20Toilette" className="dropdown-link-item">
                        <span>Eau de Toilette (5-15%)</span>
                        <ChevronRight size={12} className="item-arrow" />
                      </Link>
                      <Link to="/shop?concentration=Elixir%20Precieux" className="dropdown-link-item">
                        <span>Rare Elixir Précieux</span>
                        <ChevronRight size={12} className="item-arrow" />
                      </Link>
                    </div>
                  </div>

                  {/* Col 2: Olfactory Families / Categories */}
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--gold-primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Droplets size={12} /> Scent Families
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '220px', overflowY: 'auto' }}>
                      {categories.length > 0 ? (
                        categories.slice(0, 8).map(cat => (
                          <Link 
                            key={cat.id} 
                            to={`/shop?category=${encodeURIComponent(cat.slug || cat.name)}`} 
                            className="dropdown-link-item"
                          >
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</span>
                            <ChevronRight size={12} className="item-arrow" />
                          </Link>
                        ))
                      ) : (
                        <Link to="/shop" className="dropdown-link-item">
                          <span>All Fragrance Families</span>
                          <ChevronRight size={12} className="item-arrow" />
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Col 3: Gender & Distinction */}
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--gold-primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Flame size={12} /> Curation
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <Link to="/shop?gender=Men" className="dropdown-link-item">
                        <span>Pour Homme (Men)</span>
                        <ChevronRight size={12} className="item-arrow" />
                      </Link>
                      <Link to="/shop?gender=Women" className="dropdown-link-item">
                        <span>Pour Femme (Women)</span>
                        <ChevronRight size={12} className="item-arrow" />
                      </Link>
                      <Link to="/shop?gender=Unisex" className="dropdown-link-item">
                        <span>Unisex Fragrances</span>
                        <ChevronRight size={12} className="item-arrow" />
                      </Link>
                      <Link to="/shop?sort=discount" className="dropdown-link-item">
                        <span style={{ color: '#fda4af' }}>Private VIP Offers</span>
                        <ChevronRight size={12} className="item-arrow" />
                      </Link>
                    </div>
                  </div>

                  {/* Col 4: Featured Showcase Card */}
                  <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.08)', paddingLeft: '14px' }}>
                    <Link to="/shop?featured=true" className="mega-card-preview">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span className="badge-gold">Staff Pick</span>
                        <Sparkles size={12} color="#d4af37" />
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: '#ffffff',
                        marginBottom: '3px'
                      }}>
                        Oud Royal Perfume
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.35, marginBottom: '10px' }}>
                        Rare Cambodian agarwood infused with Taif rose and bourbon amber.
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        color: 'var(--gold-light)'
                      }}>
                        <span>Explore Catalog</span>
                        <ArrowRight size={12} />
                      </div>
                    </Link>
                  </div>

                </div>
              </div>
            </div>

            {/* 3. Fragrances (Hover Grid Dropdown of Current Perfumes) */}
            <div className="nav-hover-item">
              <Link 
                to="/shop" 
                className={`nav-link-luxury ${location.pathname.startsWith('/product') ? 'active' : ''}`}
              >
                <span>Fragrances</span>
                <ChevronDown size={12} className="nav-chevron" />
              </Link>

              {/* Current Fragrances Dropdown */}
              <div className="nav-dropdown-menu nav-dropdown-fragrances">
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--gold-primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Droplets size={13} /> Current Fragrances ({fragrances.length})
                  </div>
                  <Link to="/shop" style={{ fontSize: '0.72rem', color: '#f5df93', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Explore All Fragrances</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', maxHeight: '320px', overflowY: 'auto', paddingRight: '4px' }}>
                  {fragrances.length > 0 ? (
                    fragrances.slice(0, 8).map(f => (
                      <Link 
                        key={f.id} 
                        to={`/product/${f.slug || f.id}`} 
                        className="fragrance-nav-card"
                      >
                        {f.primary_image ? (
                          <img src={f.primary_image} alt={f.name} className="fragrance-nav-thumb" />
                        ) : (
                          <div className="fragrance-nav-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Crown size={16} color="#d4af37" />
                          </div>
                        )}
                        <div className="fragrance-nav-info">
                          <span className="fragrance-nav-name">{f.name}</span>
                          <span className="fragrance-nav-meta">
                            {f.scent_family || f.category_name || 'Haute Parfumerie'}
                          </span>
                          <span className="fragrance-nav-price">
                            ₹{Number(f.final_price || f.price || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <ChevronRight size={14} color="#d4af37" style={{ opacity: 0.7, flexShrink: 0 }} />
                      </Link>
                    ))
                  ) : (
                    <Link to="/shop" className="fragrance-nav-card" style={{ gridColumn: 'span 2' }}>
                      <Crown size={20} color="#d4af37" />
                      <div className="fragrance-nav-info">
                        <span className="fragrance-nav-name">Explore All Haute Fragrances</span>
                        <span className="fragrance-nav-meta">Discover our signature luxury collection</span>
                      </div>
                    </Link>
                  )}
                </div>

                {/* Quick Shortcuts Footer */}
                <div style={{
                  marginTop: '12px',
                  paddingTop: '10px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  <Link 
                    to="/shop?filter=best-seller" 
                    style={{ fontSize: '0.74rem', color: '#f5df93', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                  >
                    <Flame size={12} color="#f59e0b" /> Best Sellers
                  </Link>
                  <Link 
                    to="/shop?filter=new-arrival" 
                    style={{ fontSize: '0.74rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                  >
                    <Sparkles size={12} color="#38bdf8" /> New Arrivals
                  </Link>
                  <Link 
                    to="/shop?sort=discount" 
                    style={{ fontSize: '0.74rem', color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                  >
                    <Gift size={12} color="#f43f5e" /> VIP Privilege Deals
                  </Link>
                </div>
              </div>
            </div>

            {/* 4. About Us Direct Link */}
            <div className="nav-hover-item">
              <Link 
                to="/about" 
                className={`nav-link-luxury ${location.pathname === '/about' ? 'active' : ''}`}
                style={{ color: location.pathname === '/about' ? '#f5df93' : '#e2e8f0' }}
              >
                About Us
              </Link>
            </div>

            {/* 5. Contact Us Direct Link */}
            <div className="nav-hover-item">
              <Link 
                to="/contact" 
                className={`nav-link-luxury ${location.pathname === '/contact' ? 'active' : ''}`}
                style={{ color: location.pathname === '/contact' ? '#f5df93' : '#e2e8f0' }}
              >
                Contact Us
              </Link>
            </div>

            {/* 6. Customer Reviews Direct Link */}
            <div className="nav-hover-item">
              <Link 
                to="/reviews" 
                className={`nav-link-luxury ${location.pathname === '/reviews' ? 'active' : ''}`}
                style={{ color: location.pathname === '/reviews' ? '#f5df93' : '#e2e8f0', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <Star size={13} color="#d4af37" fill={location.pathname === '/reviews' ? '#d4af37' : 'transparent'} />
                <span>Reviews</span>
              </Link>
            </div>
          </nav>

          {/* Right: Action Buttons (Search Modal Trigger, Wishlist, Cart Bag, Account Profile) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            
            {/* Search Trigger Button */}
            <button 
              onClick={() => setSearchOpen(true)}
              className="nav-action-btn"
              title="Search Fragrances, Notes & Brands"
              aria-label="Open Search"
            >
              <Search size={17} />
            </button>

            {/* Wishlist Icon Button */}
            <Link 
              to="/wishlist" 
              className="nav-action-btn" 
              title="Your Wishlist"
              aria-label="Wishlist"
            >
              <Heart size={17} />
              {wishlistCount > 0 && (
                <span className="badge-count" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)', color: '#fff' }}>
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Bag Icon Button */}
            <Link 
              to="/cart" 
              className="nav-action-btn" 
              title="Your Fragrance Bag"
              aria-label="Shopping Bag"
            >
              <ShoppingBag size={17} />
              {totalItemsCount > 0 && (
                <span className="badge-count">
                  {totalItemsCount}
                </span>
              )}
            </Link>

            {/* VIP User Account (Hover & Click Dropdown) */}
            <div className="nav-hover-item">
              <Link 
                to={user ? "/profile" : "/login"} 
                className="nav-action-btn"
                title="Client Profile"
                style={{
                  border: user ? '1px solid var(--gold-primary)' : '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <User size={17} color={user ? '#d4af37' : '#f8fafc'} />
              </Link>

              {/* User Dropdown Menu on Hover */}
              <div className="nav-dropdown-menu nav-user-dropdown">
                {user ? (
                  <>
                    <div style={{ padding: '2px 6px 10px 6px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.email}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '5px' }}>
                        <span className="badge-gold">{user.role === 'admin' ? 'Administrator' : 'Member'}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '6px' }}>

                      <Link 
                        to="/profile" 
                        className="dropdown-link-item"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <User size={13} />
                          <span>My Account & Profile</span>
                        </div>
                        <ChevronRight size={12} className="item-arrow" />
                      </Link>

                      <Link 
                        to="/profile?tab=orders" 
                        className="dropdown-link-item"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <Package size={13} />
                          <span>My Orders & Tracking</span>
                        </div>
                        <ChevronRight size={12} className="item-arrow" />
                      </Link>

                      <Link 
                        to="/wishlist" 
                        className="dropdown-link-item"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <Heart size={13} />
                          <span>My Curated Wishlist</span>
                        </div>
                        <ChevronRight size={12} className="item-arrow" />
                      </Link>

                      <Link 
                        to="/support" 
                        className="dropdown-link-item"
                        style={{ color: '#f5df93' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <Headphones size={13} color="#d4af37" />
                          <span>Live Concierge Chat</span>
                        </div>
                        <ChevronRight size={12} className="item-arrow" />
                      </Link>

                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '5px 0' }} />

                      <button
                        onClick={logout}
                        className="dropdown-link-item"
                        style={{
                          width: '100%',
                          color: '#f43f5e',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <LogOut size={13} />
                          <span>Sign Out</span>
                        </div>
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '2px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc' }}>
                      Welcome to TRY ME BRO
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      Sign in to track orders, save favorites, and manage your account.
                    </div>
                    <Link 
                      to="/login" 
                      className="btn-luxury-gold" 
                      style={{ padding: '8px 14px', fontSize: '0.78rem', textAlign: 'center', width: '100%' }}
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/register" 
                      className="btn-luxury-outline" 
                      style={{ padding: '7px 14px', fontSize: '0.78rem', textAlign: 'center', width: '100%' }}
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* 3. Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div style={{
            background: '#070a10',
            borderBottom: '1px solid rgba(212, 175, 55, 0.35)',
            maxHeight: 'calc(100vh - 80px)',
            overflowY: 'auto',
            padding: '16px 20px 30px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.9)'
          }} className="d-lg-none">
            
            {/* Mobile Quick Search Bar Button */}
            <div 
              onClick={() => { setMobileMenuOpen(false); setSearchOpen(true); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(212, 175, 55, 0.45)',
                borderRadius: '12px',
                padding: '11px 14px',
                color: '#94a3b8',
                fontSize: '0.84rem',
                cursor: 'pointer',
                marginBottom: '4px'
              }}
            >
              <Search size={16} color="#d4af37" />
              <span>Search notes, oud, vanilla, brands...</span>
            </div>

            {/* Mobile Nav Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Link 
                to="/" 
                style={{ 
                  padding: '10px 12px', 
                  color: location.pathname === '/' ? '#f5df93' : '#f8fafc', 
                  fontSize: '0.92rem', 
                  fontWeight: 600, 
                  textDecoration: 'none', 
                  borderBottom: '1px solid rgba(255,255,255,0.06)' 
                }}
              >
                Home
              </Link>

              {/* Accordion: Fragrance Collections */}
              <div>
                <button
                  onClick={() => toggleMobileAccordion('collections')}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    color: '#f8fafc',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span>Fragrance Collections</span>
                  <ChevronDown size={16} style={{ transform: mobileAccordion === 'collections' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                </button>

                {mobileAccordion === 'collections' && (
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: '6px', borderRadius: '8px', marginTop: '4px' }}>
                    <Link to="/shop" style={{ color: '#f5df93', fontSize: '0.85rem', padding: '6px 0', fontWeight: 600 }}>Explore All Creations</Link>
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />
                    <div style={{ fontSize: '0.7rem', color: 'var(--gold-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Fragrance Families</div>
                    {categories.length > 0 ? (
                      categories.map(cat => (
                        <Link 
                          key={cat.id} 
                          to={`/shop?category=${encodeURIComponent(cat.slug || cat.name)}`} 
                          style={{ color: '#cbd5e1', fontSize: '0.82rem', padding: '4px 0' }}
                        >
                          {cat.name}
                        </Link>
                      ))
                    ) : (
                      <Link to="/shop" style={{ color: '#cbd5e1', fontSize: '0.82rem', padding: '4px 0' }}>All Families</Link>
                    )}
                  </div>
                )}
              </div>

              {/* Accordion: Fragrances */}
              <div>
                <button
                  onClick={() => toggleMobileAccordion('fragrances')}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    color: '#f8fafc',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span>Fragrances ({fragrances.length})</span>
                  <ChevronDown size={16} style={{ transform: mobileAccordion === 'fragrances' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                </button>

                {mobileAccordion === 'fragrances' && (
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '8px', borderRadius: '8px', marginTop: '4px', maxHeight: '300px', overflowY: 'auto' }}>
                    <Link 
                      to="/shop" 
                      onClick={() => setMobileMenuOpen(false)}
                      style={{ color: '#f5df93', fontSize: '0.85rem', padding: '4px 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <span>Explore All Fragrances</span>
                      <ArrowRight size={13} />
                    </Link>
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '2px 0' }} />
                    {fragrances.length > 0 ? (
                      fragrances.map(f => (
                        <Link 
                          key={f.id} 
                          to={`/product/${f.slug || f.id}`} 
                          onClick={() => setMobileMenuOpen(false)}
                          style={{ 
                            color: '#cbd5e1', 
                            fontSize: '0.82rem', 
                            padding: '6px 8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            borderRadius: '6px',
                            background: 'rgba(255,255,255,0.02)',
                            textDecoration: 'none'
                          }}
                        >
                          {f.primary_image ? (
                            <img src={f.primary_image} alt={f.name} style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover', border: '1px solid rgba(212, 175, 55, 0.4)' }} />
                          ) : (
                            <Droplets size={16} color="#d4af37" />
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                            <span style={{ color: '#f8fafc', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{f.scent_family || 'Haute Parfumerie'} • ₹{Number(f.final_price || f.price || 0).toLocaleString('en-IN')}</span>
                          </div>
                          <ChevronRight size={13} color="#94a3b8" />
                        </Link>
                      ))
                    ) : (
                      <Link to="/shop" onClick={() => setMobileMenuOpen(false)} style={{ color: '#cbd5e1', fontSize: '0.82rem', padding: '4px 0' }}>Explore All Fragrances</Link>
                    )}
                  </div>
                )}
              </div>

              {/* About Us */}
              <Link 
                to="/about" 
                style={{ 
                  padding: '10px 12px', 
                  color: location.pathname === '/about' ? '#f5df93' : '#cbd5e1', 
                  fontSize: '0.9rem', 
                  fontWeight: location.pathname === '/about' ? 600 : 500,
                  textDecoration: 'none', 
                  borderBottom: '1px solid rgba(255,255,255,0.06)' 
                }}
              >
                About Us
              </Link>

              {/* Contact Us */}
              <Link 
                to="/contact" 
                onClick={() => setMobileMenuOpen(false)}
                style={{ 
                  padding: '10px 12px', 
                  color: location.pathname === '/contact' ? '#f5df93' : '#cbd5e1', 
                  fontSize: '0.9rem', 
                  fontWeight: location.pathname === '/contact' ? 600 : 500,
                  textDecoration: 'none', 
                  borderBottom: '1px solid rgba(255,255,255,0.06)' 
                }}
              >
                Contact Us
              </Link>

              {/* Customer Reviews */}
              <Link 
                to="/reviews" 
                onClick={() => setMobileMenuOpen(false)}
                style={{ 
                  padding: '10px 12px', 
                  color: location.pathname === '/reviews' ? '#f5df93' : '#cbd5e1', 
                  fontSize: '0.9rem', 
                  fontWeight: location.pathname === '/reviews' ? 600 : 500,
                  textDecoration: 'none', 
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Star size={15} color="#d4af37" fill={location.pathname === '/reviews' ? '#d4af37' : 'transparent'} />
                <span>Customer Reviews & Unboxings</span>
              </Link>

              {/* Live Concierge Support */}
              <Link 
                to="/support" 
                style={{ 
                  padding: '10px 12px', 
                  color: '#f5df93', 
                  fontSize: '0.9rem', 
                  fontWeight: 600,
                  textDecoration: 'none', 
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Headphones size={15} color="#d4af37" />
                <span>Maison Live Concierge</span>
              </Link>
            </div>

            {/* Mobile User Actions */}
            <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '14px' }}>
              {user ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.82rem', color: '#f5df93' }}>Signed in as: <strong>{user.name}</strong></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <Link to="/profile" className="btn-luxury-outline" style={{ padding: '8px', fontSize: '0.78rem', textAlign: 'center' }}>
                      My Profile
                    </Link>
                    <Link to="/profile?tab=orders" className="btn-luxury-outline" style={{ padding: '8px', fontSize: '0.78rem', textAlign: 'center' }}>
                      Orders
                    </Link>
                  </div>
                  <button onClick={logout} style={{ background: 'transparent', border: 'none', color: '#f43f5e', padding: '8px', fontSize: '0.82rem', cursor: 'pointer', textAlign: 'center' }}>
                    Sign Out
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <Link to="/login" className="btn-luxury-gold" style={{ padding: '9px', fontSize: '0.8rem', textAlign: 'center' }}>
                    Sign In
                  </Link>
                  <Link to="/register" className="btn-luxury-outline" style={{ padding: '8px', fontSize: '0.8rem', textAlign: 'center' }}>
                    Register
                  </Link>
                </div>
              )}
            </div>

          </div>
        )}
      </header>

      {/* Modern Luxury Live Search Modal */}
      <SearchModal 
        isOpen={searchOpen} 
        onClose={() => setSearchOpen(false)} 
      />
    </>
  );
};

export default Navbar;
