import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Send, 
  X, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  PackageCheck, 
  Mail, 
  Phone,
  FileText,
  Lock,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

const Footer = () => {
  const navigate = useNavigate();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  
  // Return Settings from Admin
  const [returnSettings, setReturnSettings] = useState({
    default_return_window: 7,
    allow_returns_globally: true,
    global_policy_text: 'Eligible for return or replacement within 7 days of delivery. Perfume flacon must be unopened, in its original box with cellophane seal and batch code intact for authenticity and hygiene standards.',
    refund_methods: ['Original Payment Method (UPI / Card)', 'Store Credit Voucher', 'Bank Account Transfer / NEFT'],
    support_email: 'returns@trymebro.com',
    support_phone: '+91 98765 43210'
  });

  // Modals state
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState(null); // 'privacy' | 'terms' | 'cookies' | null

  useEffect(() => {
    // 1. Fetch categories
    api.get('/categories')
      .then(res => {
        if (res.data?.categories) setCategories(res.data.categories);
      })
      .catch(() => {});

    // 2. Fetch admin return policy settings
    api.get('/returns/settings')
      .then(res => {
        if (res.data?.success && res.data.settings) {
          setReturnSettings(prev => ({ ...prev, ...res.data.settings }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    try {
      setLoading(true);
      const res = await api.post('/contact/newsletter', { email: newsletterEmail });
      if (res.data.success) {
        toast.success(res.data.message || '✨ Welcome to the TRY ME BRO VIP Circle!');
        setNewsletterEmail('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Subscription failed');
    } finally {
      setLoading(false);
    }
  };

  const returnWindowDays = returnSettings?.default_return_window || 7;
  const returnsAllowed = returnSettings?.allow_returns_globally !== false;

  return (
    <footer className="luxury-footer-root">
      {/* 1. Guarantees & Ethos Badges */}
      <div className="footer-guarantees-bar">
        <div className="footer-guarantees-grid">
          {/* Badge 1: Authenticity */}
          <div className="footer-guarantee-card">
            <div className="footer-guarantee-icon-wrap">
              <ShieldCheck size={22} color="#d4af37" />
            </div>
            <div className="footer-guarantee-content">
              <h4 className="footer-guarantee-title">100% Authentic Luxury</h4>
              <p className="footer-guarantee-sub">Direct sourcing with verified batch codes</p>
            </div>
          </div>

          {/* Badge 2: Delivery */}
          <div className="footer-guarantee-card">
            <div className="footer-guarantee-icon-wrap">
              <Truck size={22} color="#d4af37" />
            </div>
            <div className="footer-guarantee-content">
              <h4 className="footer-guarantee-title">White-Glove Delivery</h4>
              <p className="footer-guarantee-sub">Complimentary shipping on orders over ₹5,000</p>
            </div>
          </div>

          {/* Badge 3: Discovery Decants */}
          <div className="footer-guarantee-card">
            <div className="footer-guarantee-icon-wrap">
              <Sparkles size={22} color="#d4af37" />
            </div>
            <div className="footer-guarantee-content">
              <h4 className="footer-guarantee-title">Artisanal Discovery Vials</h4>
              <p className="footer-guarantee-sub">2 complimentary travel decants with every order</p>
            </div>
          </div>

          {/* Badge 4: Dynamic Return Policy according to Admin */}
          <div 
            className="footer-guarantee-card clickable" 
            onClick={() => setIsReturnModalOpen(true)}
            title="Click to view detailed return policy"
          >
            <div className="footer-guarantee-icon-wrap">
              {returnsAllowed ? (
                <RotateCcw size={22} color="#d4af37" />
              ) : (
                <ShieldCheck size={22} color="#d4af37" />
              )}
            </div>
            <div className="footer-guarantee-content">
              <h4 className="footer-guarantee-title">
                {returnsAllowed ? `${returnWindowDays}-Day Pristine Returns` : 'Hygiene & Quality Assured'}
              </h4>
              <p className="footer-guarantee-sub">
                {returnsAllowed ? `Hassle-free ${returnWindowDays}-day unopened returns` : 'Original tamper-sealed authentic packaging'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Links & Newsletter */}
      <div className="footer-main-container">
        <div className="footer-main-grid">
          {/* Col 1: Brand Info */}
          <div className="footer-brand-col" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <img
                src="/logo.png"
                alt="TRY ME BRO Logo"
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  objectFit: 'cover',
                  background: '#04060a',
                  border: '1.5px solid rgba(212, 175, 55, 0.75)',
                  padding: '1px',
                  boxShadow: '0 0 16px rgba(212, 175, 55, 0.3)',
                  imageRendering: '-webkit-optimize-contrast'
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  letterSpacing: '0.10em',
                  background: 'linear-gradient(135deg, #ffffff 0%, #fdf0cd 35%, #d4af37 75%, #aa8620 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textTransform: 'uppercase',
                  lineHeight: 1.05
                }}>
                  TRY ME BRO
                </div>
                <span style={{
                  fontSize: '0.58rem',
                  letterSpacing: '0.25em',
                  color: '#d4af37',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  marginTop: '2px'
                }}>
                  PERFUME
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: '1.65', margin: '0 0 16px 0', maxWidth: '340px' }}>
              Curating the finest perfumes, rare amber fragrances, and handcrafted luxury scents for discerning fragrance enthusiasts.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: '#cbd5e1' }}>
              <CheckCircle2 size={15} color="#d4af37" />
              <span>Official Authorized Retailer • 100% Genuine</span>
            </div>
          </div>

          {/* Col 2: Fragrance Families */}
          <div className="footer-fragrance-col">
            <h4 className="footer-col-title">Fragrance Families</h4>
            <ul className="footer-link-list">
              {categories.length > 0 ? (
                categories.slice(0, 5).map(cat => (
                  <li key={cat.id || cat.name}>
                    <Link 
                      to={`/shop?category=${encodeURIComponent(cat.slug || cat.name)}`} 
                      className="footer-nav-link"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li>
                  <Link to="/shop" className="footer-nav-link">All Fragrance Families</Link>
                </li>
              )}
              <li>
                <Link to="/shop?concentration=Extrait%20de%20Parfum" className="footer-nav-link">
                  Pure Perfume Oils
                </Link>
              </li>
              <li>
                <Link to="/shop" className="footer-nav-link">
                  Browse All Collections
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Support (In Between Fragrance & The VIP Club) */}
          <div className="footer-support-col">
            <h4 className="footer-col-title">Customer Support</h4>
            <ul className="footer-link-list">
              <li>
                <Link to="/contact" className="footer-nav-link">
                  Fragrance Consultation
                </Link>
              </li>
              <li>
                <Link to="/profile?tab=orders" className="footer-nav-link">
                  Track Your Orders
                </Link>
              </li>
              <li>
                <Link to="/about" className="footer-nav-link">
                  Our Story & Heritage
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="footer-nav-link" style={{ color: '#f5df93' }}>
                  ★ Patron Reviews & Videos
                </Link>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => setIsReturnModalOpen(true)}
                  className="footer-nav-link"
                  style={{ color: '#f5df93' }}
                >
                  Shipping & Returns Policy
                </button>
              </li>
              <li>
                <Link to="/contact" className="footer-nav-link">
                  Authenticity Guarantee
                </Link>
              </li>
              <li>
                <Link to="/profile" className="footer-nav-link">
                  Member Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: VIP Newsletter Subscription */}
          <div className="footer-vip-col">
            <h4 className="footer-col-title">The VIP Club</h4>
            <p style={{ fontSize: '0.80rem', color: '#94a3b8', lineHeight: '1.55', margin: '0 0 12px 0' }}>
              Subscribe to receive private invitations to limited-edition new arrivals, master perfumer guides, and an exclusive 10% privilege code.
            </p>
            <form onSubmit={handleSubscribe} className="footer-newsletter-form">
              <input
                type="email"
                placeholder="Enter your email address..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                className="footer-newsletter-input"
              />
              <button 
                type="submit" 
                disabled={loading} 
                className="btn-luxury-gold footer-newsletter-btn"
                aria-label="Subscribe to VIP Club"
              >
                {loading ? <Clock size={16} className="animate-spin" /> : <Send size={15} />}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 3. Bottom Copyright & Legal Links */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-inner">
          <div>
            © {new Date().getFullYear()} TRY ME BRO Luxury Fragrances. All rights reserved.
          </div>
          <div className="footer-legal-links">
            <button 
              type="button" 
              className="footer-legal-btn" 
              onClick={() => setActiveLegalModal('privacy')}
            >
              Privacy Policy
            </button>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>•</span>
            <button 
              type="button" 
              className="footer-legal-btn" 
              onClick={() => setActiveLegalModal('terms')}
            >
              Terms of Service
            </button>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>•</span>
            <button 
              type="button" 
              className="footer-legal-btn" 
              onClick={() => setIsReturnModalOpen(true)}
            >
              Returns Policy
            </button>
          </div>
        </div>
      </div>

      {/* 4. Live Admin Return Policy Modal */}
      {isReturnModalOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(3, 7, 18, 0.82)',
            backdropFilter: 'blur(8px)',
            padding: '16px'
          }}
          onClick={() => setIsReturnModalOpen(false)}
        >
          <div 
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxSizing: 'border-box',
              background: 'linear-gradient(160deg, #0d121d 0%, #060910 100%)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              borderRadius: '20px',
              padding: 'clamp(18px, 4vw, 28px)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 30px rgba(212, 175, 55, 0.15)',
              position: 'relative',
              animation: 'fadeIn 0.25s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(212, 175, 55, 0.15)',
                  border: '1px solid var(--border-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <RotateCcw size={22} color="#d4af37" />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#f8fafc', margin: 0 }}>
                    Returns & Replacements
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: '#d4af37', marginTop: '2px', fontWeight: 600 }}>
                    {returnsAllowed ? `${returnWindowDays}-Day Hassle-Free Window` : 'Luxury Hygiene Standard'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsReturnModalOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Official Policy Statement from Admin */}
            <div style={{
              background: 'rgba(212, 175, 55, 0.06)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              borderRadius: '14px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '0.76rem', textTransform: 'uppercase', color: '#d4af37', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '6px' }}>
                Admin Verified Policy
              </div>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#e2e8f0', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {returnSettings?.global_policy_text || `Eligible for return or replacement within ${returnWindowDays} days of delivery. Perfume flacon must be unopened, in its original box with cellophane seal and batch code intact for authenticity and hygiene standards.`}
              </p>
            </div>

            {/* Key Policy Points */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '22px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <PackageCheck size={18} color="#d4af37" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#ffffff' }}>Unopened Hygiene Seal</div>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8', lineHeight: 1.45, marginTop: '2px' }}>
                    As luxury perfumery contains personal care formulations, returned items must retain the intact transparent cellophane wrap and batch code sticker.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Truck size={18} color="#d4af37" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#ffffff' }}>Doorstep Return Pickup</div>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8', lineHeight: 1.45, marginTop: '2px' }}>
                    Our trusted express courier partners pick up your securely packed return package directly from your delivery address.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Clock size={18} color="#d4af37" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#ffffff' }}>Swift Refund Processing</div>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8', lineHeight: 1.45, marginTop: '2px' }}>
                    Approved returns receive refunds within 2–4 business days via your original payment channel, store credit, or direct bank transfer.
                  </div>
                </div>
              </div>
            </div>

            {/* Concierge Support Channels */}
            {(returnSettings?.support_email || returnSettings?.support_phone) && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '12px 14px',
                marginBottom: '22px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                fontSize: '0.76rem',
                color: '#94a3b8'
              }}>
                {returnSettings.support_email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={14} color="#d4af37" />
                    <span>{returnSettings.support_email}</span>
                  </div>
                )}
                {returnSettings.support_phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={14} color="#d4af37" />
                    <span>{returnSettings.support_phone}</span>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginTop: '6px' }}>
              <button
                type="button"
                className="btn-luxury-gold"
                style={{ 
                  width: '100%',
                  padding: '12px 16px', 
                  fontSize: '0.84rem', 
                  fontWeight: 700,
                  justifyContent: 'center',
                  borderRadius: '10px',
                  whiteSpace: 'normal',
                  textAlign: 'center',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxSizing: 'border-box'
                }}
                onClick={() => {
                  setIsReturnModalOpen(false);
                  navigate('/profile?tab=returns');
                }}
              >
                <span>Request Return in Member Portal</span>
                <ArrowRight size={15} style={{ flexShrink: 0 }} />
              </button>
              <button
                type="button"
                className="btn-luxury-outline"
                style={{ 
                  width: '100%',
                  padding: '10px 16px', 
                  fontSize: '0.82rem',
                  justifyContent: 'center',
                  borderRadius: '10px',
                  minHeight: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  boxSizing: 'border-box'
                }}
                onClick={() => setIsReturnModalOpen(false)}
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Legal Information Modal */}
      {activeLegalModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(3, 7, 18, 0.82)',
            backdropFilter: 'blur(8px)',
            padding: '16px'
          }}
          onClick={() => setActiveLegalModal(null)}
        >
          <div 
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '520px',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxSizing: 'border-box',
              background: 'linear-gradient(160deg, #0d121d 0%, #060910 100%)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              borderRadius: '20px',
              padding: 'clamp(18px, 4vw, 28px)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: '#f8fafc', margin: 0 }}>
                {activeLegalModal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
              </h3>
              <button
                type="button"
                onClick={() => setActiveLegalModal(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.65' }}>
              {activeLegalModal === 'privacy' ? (
                <>
                  <p>
                    At TRY ME BRO, we strictly uphold data confidentiality. Your personal information, order history, and fragrance preferences are securely encrypted and never shared with unauthorized third parties.
                  </p>
                  <p>
                    We collect your delivery details and contact email solely to process luxury orders, verify batch deliveries, and provide VIP concierge services.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    All perfumes, colognes, and fragrant elixirs sold on TRY ME BRO are authentic, sourced from verified European and international distributors.
                  </p>
                  <p>
                    Orders placed are subject to our dispatch protocols and luxury hygiene return regulations. For customized fragrance consultations or order queries, our support team is available 24/7.
                  </p>
                </>
              )}
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button
                type="button"
                className="btn-luxury-gold"
                style={{ padding: '8px 18px', fontSize: '0.80rem' }}
                onClick={() => setActiveLegalModal(null)}
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
