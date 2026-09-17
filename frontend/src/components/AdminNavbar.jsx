import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Crown, 
  TrendingUp, 
  Package, 
  Layers, 
  RotateCcw, 
  Film, 
  Gift, 
  Globe, 
  Truck, 
  QrCode, 
  SlidersHorizontal, 
  MessageSquare, 
  ExternalLink, 
  LogOut, 
  Menu, 
  X, 
  CreditCard,
  ChevronDown, 
  ChevronRight, 
  Sparkles, 
  User, 
  ShieldCheck,
  Headphones,
  Plus,
  Star
} from 'lucide-react';
import api from '../services/api';

const AdminNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [catalogDropdownOpen, setCatalogDropdownOpen] = useState(false);
  const [bannersDropdownOpen, setBannersDropdownOpen] = useState(false);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);

  // Live metrics badges
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [pendingReturnsCount, setPendingReturnsCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Fetch summary badges
  useEffect(() => {
    let isMounted = true;
    const fetchBadges = async () => {
      try {
        const [dashRes, returnsRes, chatRes] = await Promise.all([
          api.get('/admin/dashboard').catch(() => null),
          api.get('/returns').catch(() => null),
          api.get('/chat/admin/conversations').catch(() => null)
        ]);

        if (isMounted) {
          if (dashRes?.data?.stats) {
            setPendingOrdersCount(dashRes.data.stats.pending_orders || 0);
          }
          if (returnsRes?.data?.returns) {
            const requested = returnsRes.data.returns.filter(r => r.status === 'Requested').length;
            setPendingReturnsCount(requested);
          }
          if (chatRes?.data?.conversations) {
            const unread = chatRes.data.conversations.filter(c => Number(c.unread_admin || 0) > 0).length;
            setUnreadChatCount(unread);
          }
        }
      } catch (err) {
        // silent
      }
    };

    fetchBadges();
    const interval = setInterval(fetchBadges, 7000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleTabSelect = (tabId) => {
    setSearchParams({ tab: tabId });
    setCatalogDropdownOpen(false);
    setBannersDropdownOpen(false);
    setSettingsDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const isCatalogActive = ['products', 'categories', 'brands', 'filters'].includes(currentTab);
  const isMarketingActive = ['banners', 'coupons', 'reviews'].includes(currentTab);
  const isSettingsActive = ['shipping', 'upi'].includes(currentTab);

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(6, 8, 14, 0.96)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1.5px solid rgba(212, 175, 55, 0.35)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.7)'
      }}>
        {/* Top Executive Operational Ticker */}
        <div style={{
          background: 'linear-gradient(90deg, #0a0d14 0%, #161c28 50%, #0a0d14 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          padding: '4px 16px',
          fontSize: '0.72rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#94a3b8'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 6px #10b981', flexShrink: 0 }}></span>
            <span style={{ color: '#cbd5e1', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              TRY ME BRO <span className="d-none d-md-inline">Haute Parfumerie</span>
            </span>
            <span style={{ color: '#d4af37' }} className="d-none d-sm-inline">• Executive Management Console</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
            <span style={{ color: '#94a3b8' }}>Origin: <strong style={{ color: '#f5df93' }}>Kalol (382721)</strong></span>
          </div>
        </div>

        {/* Main Admin Navigation Bar */}
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 clamp(10px, 3vw, 20px)',
          height: '62px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          
          {/* Left: Brand Logo & Executive Badge & Mobile 3-Bar Hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="d-lg-none admin-hamburger-btn"
              aria-label="Open Admin Menu"
              title="Open Navigation Menu"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(212, 175, 55, 0.12)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                color: '#f5df93',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                padding: 0,
                flexShrink: 0
              }}
            >
              <Menu size={20} strokeWidth={2.4} />
            </button>

            <Link to="/admin" onClick={() => handleTabSelect('overview')} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <img
                src="/logo.png"
                alt="TRY ME BRO Logo"
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '11px',
                  objectFit: 'cover',
                  background: '#04060a',
                  border: '1.5px solid rgba(212, 175, 55, 0.75)',
                  padding: '1px',
                  boxShadow: '0 0 16px rgba(212, 175, 55, 0.4)',
                  flexShrink: 0,
                  imageRendering: '-webkit-optimize-contrast'
                }}
              />

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(1rem, 3.5vw, 1.15rem)',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    lineHeight: 1.1
                  }}>
                    TRY ME BRO
                  </span>
                  <span style={{
                    fontSize: '0.60rem',
                    fontWeight: 800,
                    background: 'rgba(212, 175, 55, 0.2)',
                    border: '1px solid #d4af37',
                    color: '#f5df93',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    letterSpacing: '0.08em'
                  }}>
                    ADMIN
                  </span>
                </div>
                <span className="d-none d-sm-inline" style={{ fontSize: '0.66rem', color: '#d4af37', letterSpacing: '0.12em', fontWeight: 600 }}>
                  PERFUME • EXECUTIVE CONSOLE
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Admin Functional Navigation Bar */}
          <nav className="d-none d-lg-flex" style={{ alignItems: 'center', gap: '4px', height: '100%' }}>
            
            {/* 1. Overview & Orders */}
            <button
              type="button"
              onClick={() => handleTabSelect('overview')}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: currentTab === 'overview' ? '1px solid #d4af37' : '1px solid transparent',
                background: currentTab === 'overview' ? 'rgba(212, 175, 55, 0.18)' : 'transparent',
                color: currentTab === 'overview' ? '#f5df93' : '#cbd5e1',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <TrendingUp size={15} color={currentTab === 'overview' ? '#d4af37' : '#94a3b8'} />
              <span>Overview & Orders</span>
              {pendingOrdersCount > 0 && (
                <span style={{ background: '#f59e0b', color: '#000', fontSize: '0.64rem', fontWeight: 800, padding: '1px 6px', borderRadius: '9999px' }}>
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            {/* 2. Live Concierge Chat */}
            <button
              type="button"
              onClick={() => handleTabSelect('chat')}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: currentTab === 'chat' ? '1px solid #d4af37' : '1px solid transparent',
                background: currentTab === 'chat' ? 'rgba(212, 175, 55, 0.18)' : 'transparent',
                color: currentTab === 'chat' ? '#f5df93' : '#cbd5e1',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <MessageSquare size={15} color={currentTab === 'chat' ? '#d4af37' : '#94a3b8'} />
              <span>Live Chat</span>
              {unreadChatCount > 0 && (
                <span style={{ background: '#f43f5e', color: '#fff', fontSize: '0.64rem', fontWeight: 800, padding: '1px 6px', borderRadius: '9999px' }}>
                  {unreadChatCount} New
                </span>
              )}
            </button>

            {/* 3. Catalog & Products Dropdown */}
            <div 
              style={{ position: 'relative' }}
              onMouseEnter={() => setCatalogDropdownOpen(true)}
              onMouseLeave={() => setCatalogDropdownOpen(false)}
            >
              <button
                type="button"
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isCatalogActive ? '1px solid #d4af37' : '1px solid transparent',
                  background: isCatalogActive ? 'rgba(212, 175, 55, 0.18)' : 'transparent',
                  color: isCatalogActive ? '#f5df93' : '#cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Package size={15} color={isCatalogActive ? '#d4af37' : '#94a3b8'} />
                <span>Catalog</span>
                <ChevronDown size={13} style={{ transform: catalogDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {catalogDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  width: '240px',
                  background: 'rgba(10, 13, 20, 0.98)',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  borderRadius: '12px',
                  padding: '8px',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.8)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  zIndex: 100
                }}>
                  <button
                    type="button"
                    onClick={() => handleTabSelect('products')}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: currentTab === 'products' ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                      border: 'none',
                      color: currentTab === 'products' ? '#f5df93' : '#e2e8f0',
                      fontSize: '0.8rem',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <Package size={14} color="#d4af37" />
                    <span>Fragrance Collections</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCatalogDropdownOpen(false);
                      navigate('/admin/products/new');
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'rgba(212, 175, 55, 0.08)',
                      border: '1px dashed rgba(212, 175, 55, 0.4)',
                      color: '#f5df93',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      margin: '2px 0'
                    }}
                  >
                    <Plus size={14} color="#ffd700" />
                    <span>+ Add New Bottle</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabSelect('categories')}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: currentTab === 'categories' ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                      border: 'none',
                      color: currentTab === 'categories' ? '#f5df93' : '#e2e8f0',
                      fontSize: '0.8rem',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <Layers size={14} color="#60a5fa" />
                    <span>Categories & Families</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabSelect('brands')}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: currentTab === 'brands' ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                      border: 'none',
                      color: currentTab === 'brands' ? '#f5df93' : '#e2e8f0',
                      fontSize: '0.8rem',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <Crown size={14} color="#c084fc" />
                    <span>Brands & Houses</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabSelect('filters')}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: currentTab === 'filters' ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                      border: 'none',
                      color: currentTab === 'filters' ? '#f5df93' : '#e2e8f0',
                      fontSize: '0.8rem',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <SlidersHorizontal size={14} color="#10b981" />
                    <span>Filter & Search Rules</span>
                  </button>
                </div>
              )}
            </div>

            {/* 4. Returns & Refunds */}
            <button
              type="button"
              onClick={() => handleTabSelect('returns')}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: currentTab === 'returns' ? '1px solid #d4af37' : '1px solid transparent',
                background: currentTab === 'returns' ? 'rgba(212, 175, 55, 0.18)' : 'transparent',
                color: currentTab === 'returns' ? '#f5df93' : '#cbd5e1',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <RotateCcw size={15} color={currentTab === 'returns' ? '#d4af37' : '#94a3b8'} />
              <span>Returns</span>
              {pendingReturnsCount > 0 && (
                <span style={{ background: '#f43f5e', color: '#fff', fontSize: '0.64rem', fontWeight: 800, padding: '1px 6px', borderRadius: '9999px' }}>
                  {pendingReturnsCount} New
                </span>
              )}
            </button>

            {/* 5. Marketing & Banners Dropdown */}
            <div 
              style={{ position: 'relative' }}
              onMouseEnter={() => setBannersDropdownOpen(true)}
              onMouseLeave={() => setBannersDropdownOpen(false)}
            >
              <button
                type="button"
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isMarketingActive ? '1px solid #d4af37' : '1px solid transparent',
                  background: isMarketingActive ? 'rgba(212, 175, 55, 0.18)' : 'transparent',
                  color: isMarketingActive ? '#f5df93' : '#cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Film size={15} color={isMarketingActive ? '#d4af37' : '#94a3b8'} />
                <span>Marketing</span>
                <ChevronDown size={13} style={{ transform: bannersDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {bannersDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  width: '240px',
                  background: 'rgba(10, 13, 20, 0.98)',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  borderRadius: '12px',
                  padding: '8px',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.8)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  zIndex: 100
                }}>
                  <button
                    type="button"
                    onClick={() => handleTabSelect('banners')}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: currentTab === 'banners' ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                      border: 'none',
                      color: currentTab === 'banners' ? '#f5df93' : '#e2e8f0',
                      fontSize: '0.8rem',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <Film size={14} color="#f5df93" />
                    <span>Banners & Video Swiper</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabSelect('coupons')}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: currentTab === 'coupons' ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                      border: 'none',
                      color: currentTab === 'coupons' ? '#f5df93' : '#e2e8f0',
                      fontSize: '0.8rem',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <Gift size={14} color="#ec4899" />
                    <span>Coupons & Promo Codes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabSelect('reviews')}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: currentTab === 'reviews' ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                      border: 'none',
                      color: currentTab === 'reviews' ? '#f5df93' : '#e2e8f0',
                      fontSize: '0.8rem',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <Star size={14} color="#ffd700" fill="#ffd700" />
                    <span>Patron Reviews (Video & Written)</span>
                  </button>
                </div>
              )}
            </div>

            {/* 6. Page Content CMS */}
            <button
              type="button"
              onClick={() => handleTabSelect('cms')}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: currentTab === 'cms' ? '1px solid #d4af37' : '1px solid transparent',
                background: currentTab === 'cms' ? 'rgba(212, 175, 55, 0.18)' : 'transparent',
                color: currentTab === 'cms' ? '#f5df93' : '#cbd5e1',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <Globe size={15} color={currentTab === 'cms' ? '#d4af37' : '#94a3b8'} />
              <span>Page CMS</span>
            </button>

            {/* 7. Patron Reviews */}
            <button
              type="button"
              onClick={() => handleTabSelect('reviews')}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: currentTab === 'reviews' ? '1px solid #d4af37' : '1px solid transparent',
                background: currentTab === 'reviews' ? 'rgba(212, 175, 55, 0.18)' : 'transparent',
                color: currentTab === 'reviews' ? '#f5df93' : '#cbd5e1',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <Star size={15} color={currentTab === 'reviews' ? '#d4af37' : '#94a3b8'} fill={currentTab === 'reviews' ? '#d4af37' : 'transparent'} />
              <span>Reviews</span>
            </button>

            {/* 7. Store Settings Dropdown */}
            <div 
              style={{ position: 'relative' }}
              onMouseEnter={() => setSettingsDropdownOpen(true)}
              onMouseLeave={() => setSettingsDropdownOpen(false)}
            >
              <button
                type="button"
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isSettingsActive ? '1px solid #d4af37' : '1px solid transparent',
                  background: isSettingsActive ? 'rgba(212, 175, 55, 0.18)' : 'transparent',
                  color: isSettingsActive ? '#f5df93' : '#cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Truck size={15} color={isSettingsActive ? '#d4af37' : '#94a3b8'} />
                <span>Operations</span>
                <ChevronDown size={13} style={{ transform: settingsDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {settingsDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  width: '250px',
                  background: 'rgba(10, 13, 20, 0.98)',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  borderRadius: '12px',
                  padding: '8px',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.8)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  zIndex: 100
                }}>
                  <button
                    type="button"
                    onClick={() => handleTabSelect('shipping')}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: currentTab === 'shipping' ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                      border: 'none',
                      color: currentTab === 'shipping' ? '#f5df93' : '#e2e8f0',
                      fontSize: '0.8rem',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <Truck size={14} color="#60a5fa" />
                    <span>Delivery & Distance Rates</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabSelect('upi')}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: currentTab === 'upi' ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                      border: 'none',
                      color: currentTab === 'upi' ? '#f5df93' : '#e2e8f0',
                      fontSize: '0.8rem',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <CreditCard size={14} color="#d4af37" />
                    <span>Online Payment & UPI Settings</span>
                  </button>
                </div>
              )}
            </div>

          </nav>

          {/* Right: Admin Profile / Sign Out */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>

            <button
              type="button"
              onClick={logout}
              className="btn-luxury-outline"
              style={{ padding: '7px 12px', fontSize: '0.78rem', color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.4)', gap: '6px', display: 'flex', alignItems: 'center' }}
              title="Sign Out of Admin Console"
            >
              <LogOut size={13} />
              <span className="d-none d-sm-inline">Sign Out</span>
            </button>

          </div>

        </div>
      </header>

      {/* FULL-SCREEN PHONE/TABLET SIDEBAR DRAWER WITH OVERLAY */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9999,
          display: 'flex'
        }}>
          {/* Backdrop Blur Overlay */}
          <div 
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)'
            }}
          />

          {/* Slide-in Sidebar Panel */}
          <div style={{
            position: 'relative',
            width: 'min(320px, 86vw)',
            height: '100%',
            background: 'linear-gradient(180deg, #090d16 0%, #05070c 100%)',
            borderRight: '1.5px solid rgba(212, 175, 55, 0.4)',
            boxShadow: '10px 0 35px rgba(0, 0, 0, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            zIndex: 10000,
            animation: 'slideInLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}>
            {/* Sidebar Header */}
            <div style={{
              padding: '18px 16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src="/logo.png"
                  alt="TRY ME BRO Logo"
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    objectFit: 'contain',
                    background: '#04060a',
                    border: '1.2px solid rgba(212, 175, 55, 0.6)',
                    padding: '2px',
                    boxShadow: '0 0 12px rgba(212, 175, 55, 0.3)'
                  }}
                />
                <div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
                    TRY ME BRO
                  </div>
                  <div style={{ fontSize: '0.62rem', color: '#d4af37', letterSpacing: '0.14em', fontWeight: 700, marginTop: '1px' }}>
                    PERFUME • EXECUTIVE
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#94a3b8',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Sidebar Navigation Items */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '14px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, padding: '4px 8px' }}>
                MANAGEMENT SUITE
              </div>

              {[
                { id: 'overview', label: 'Overview & Orders', icon: TrendingUp, count: pendingOrdersCount },
                { id: 'chat', label: 'Live Concierge Chat', icon: MessageSquare, count: unreadChatCount, countColor: '#f43f5e' },
                { id: 'products', label: 'Fragrance Collections', icon: Package },
                { id: 'categories', label: 'Categories & Families', icon: Layers },
                { id: 'brands', label: 'Brands & Houses', icon: Crown },
                { id: 'returns', label: 'Returns & Refunds', icon: RotateCcw, count: pendingReturnsCount, countColor: '#f43f5e' },
                { id: 'banners', label: 'Hero Video & Banners', icon: Film },
                { id: 'coupons', label: 'Promo Codes & Discounts', icon: Gift },
                { id: 'reviews', label: 'Patron Reviews (Video & Written)', icon: Star },
                { id: 'cms', label: 'Page CMS (About & Contact)', icon: Globe },
                { id: 'filters', label: 'Search & Filter Rules', icon: SlidersHorizontal },
                { id: 'shipping', label: 'Delivery & Distance Rates', icon: Truck },
                { id: 'upi', label: 'Online Payment & UPI Settings', icon: CreditCard }
              ].map(item => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleTabSelect(item.id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: isActive ? '1px solid #d4af37' : '1px solid transparent',
                      background: isActive ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.22) 0%, rgba(10, 14, 22, 0.95) 100%)' : 'transparent',
                      color: isActive ? '#f5df93' : '#cbd5e1',
                      fontSize: '0.84rem',
                      fontWeight: isActive ? 700 : 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                      <Icon size={16} color={isActive ? '#d4af37' : '#94a3b8'} />
                      <span>{item.label}</span>
                    </div>
                    {item.count > 0 && (
                      <span style={{
                        background: item.countColor || '#f59e0b',
                        color: item.countColor ? '#fff' : '#000',
                        fontSize: '0.64rem',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '9999px'
                      }}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Sidebar Footer */}
            <div style={{
              padding: '14px 12px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <button
                type="button"
                onClick={logout}
                className="btn-luxury-outline"
                style={{ padding: '9px', fontSize: '0.78rem', color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminNavbar;
