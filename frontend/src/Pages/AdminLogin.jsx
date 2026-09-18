import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  ArrowRight, 
  Lock, 
  Mail, 
  Sparkles, 
  Eye, 
  EyeOff, 
  AlertCircle
} from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { user, token, adminLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';

  // If already authenticated as admin, route directly to admin dashboard
  useEffect(() => {
    if (token && user?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [token, user, navigate]);

  // Submit email & password for direct authentication
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      const msg = 'Please enter both your administrator email and password.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    try {
      setLoading(true);
      const res = await adminLogin(cleanEmail, password);

      if (res.success && res.user) {
        toast.success(`Executive authentication verified. Welcome, ${res.user.name}.`);
        const invalidPaths = ['/admin/login', '/login', '/register'];
        const destination = from && !invalidPaths.includes(from) ? from : '/admin';
        navigate(destination, { replace: true });
      } else {
        const msg = res.message || 'Invalid administrator credentials.';
        setErrorMessage(msg);
        toast.error(msg);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Administrator authentication failed.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '500px', 
      width: '100%',
      margin: 'clamp(30px, 6vw, 60px) auto 80px auto', 
      padding: '0 16px',
      boxSizing: 'border-box'
    }}>
      <div 
        className="glass-panel" 
        style={{ 
          padding: 'clamp(28px, 6vw, 42px) clamp(20px, 5vw, 36px)', 
          borderRadius: '24px', 
          position: 'relative',
          border: '1.5px solid rgba(212, 175, 55, 0.45)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.9), 0 0 30px rgba(212, 175, 55, 0.12)',
          background: 'rgba(11, 15, 25, 0.95)',
          backdropFilter: 'blur(16px)'
        }}
      >
        
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: '#04060a',
            border: '1.5px solid rgba(212, 175, 55, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            boxShadow: '0 0 24px rgba(212, 175, 55, 0.35)',
            padding: '4px'
          }}>
            <img src="/logo.png" alt="TRY ME BRO Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>

          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px', 
            color: '#d4af37', 
            fontSize: '0.74rem', 
            fontWeight: 700, 
            letterSpacing: '0.14em', 
            textTransform: 'uppercase', 
            marginBottom: '6px' 
          }}>
            <Sparkles size={13} /> TRY ME BRO • EXECUTIVE PORTAL
          </div>
          
          <h1 style={{ 
            fontFamily: 'var(--font-serif)', 
            fontSize: 'clamp(1.5rem, 4vw, 1.9rem)', 
            color: '#ffffff', 
            marginBottom: '6px' 
          }}>
            Admin Portal Login
          </h1>
          
          <p style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.5, margin: '0 auto', maxWidth: '380px' }}>
            Authorized personnel access for store management, catalog control & orders.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            borderRadius: '12px',
            padding: '12px 16px',
            color: '#fda4af',
            fontSize: '0.84rem',
            marginBottom: '20px',
            lineHeight: 1.4
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* DIRECT CREDENTIALS FORM */}
        <form onSubmit={handleCredentialsSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Email */}
            <div>
              <label style={{ fontSize: '0.78rem', color: '#f5df93', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Administrator Email
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={16} color="#d4af37" style={{ position: 'absolute', left: '14px', pointerEvents: 'none' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="admin@trymebro.com"
                  required
                  autoComplete="email"
                  className="form-input-luxury"
                  style={{ paddingLeft: '40px', height: '46px', width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: '0.78rem', color: '#f5df93', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Executive Passcode
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} color="#d4af37" style={{ position: 'absolute', left: '14px', pointerEvents: 'none' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="form-input-luxury"
                  style={{ paddingLeft: '40px', paddingRight: '40px', height: '46px', width: '100%', boxSizing: 'border-box' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={18} color="#f5df93" /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-luxury-gold"
              style={{ 
                width: '100%', 
                padding: '14px', 
                fontSize: '0.95rem', 
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Portal</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

          </div>
        </form>

        {/* Footer Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'center', marginTop: '28px', fontSize: '0.84rem' }}>
          <div>
            <Link to="/" style={{ color: '#94a3b8', fontSize: '0.84rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              ← Return to Fragrance Store
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
