import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Sparkles, Eye, EyeOff, AlertCircle, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { user, token, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect immediately to profile or intended page
  useEffect(() => {
    if (token && user) {
      const rawFrom = location.state?.from?.pathname;
      const invalidPaths = ['/login', '/register', '/admin/login'];
      const destination = rawFrom && !invalidPaths.includes(rawFrom) ? rawFrom : '/profile';
      navigate(destination, { replace: true });
    }
  }, [token, user, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      const msg = 'Please enter both your registered email and password.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    try {
      setLoading(true);
      const res = await login(cleanEmail, password);

      if (res.success) {
        toast.success(`Welcome back, ${res.user.name}!`);
        
        const rawFrom = location.state?.from?.pathname;
        const invalidPaths = ['/login', '/register', '/admin/login'];
        const destination = rawFrom && !invalidPaths.includes(rawFrom) ? rawFrom : '/profile';
        
        navigate(destination, { replace: true });
      } else {
        const msg = res.message || 'Invalid email or password. Please check your credentials.';
        setErrorMessage(msg);
        toast.error(msg);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Authentication failed. Please check your connection.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '50px auto 70px auto', padding: '0 16px' }}>
      <div 
        className="glass-card" 
        style={{ 
          padding: '40px 32px', 
          borderRadius: '24px', 
          position: 'relative',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.75), 0 0 20px rgba(212, 175, 55, 0.08)'
        }}
      >
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '14px',
            background: '#04060a',
            border: '1.5px solid rgba(212, 175, 55, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px auto',
            boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)',
            padding: '3px'
          }}>
            <img src="/logo.png" alt="TRY ME BRO Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#d4af37', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '8px' }}>
            <Sparkles size={14} /> TRY ME BRO • PERFUME
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.95rem', color: '#ffffff', marginBottom: '8px' }}>
            Sign In to Account
          </h1>
          <p style={{ fontSize: '0.86rem', color: '#94a3b8', lineHeight: 1.5 }}>
            Access your private perfume collection, track recent orders & member benefits.
          </p>
        </div>

        {/* Error Alert Message */}
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
            animation: 'fadeIn 0.3s ease'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Email Field */}
            <div>
              <label style={{ fontSize: '0.78rem', color: '#f5df93', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Email Address
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail 
                  size={17} 
                  color="#d4af37" 
                  style={{ position: 'absolute', left: '14px', pointerEvents: 'none', opacity: 0.85 }} 
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="name@luxury.com"
                  required
                  autoComplete="email"
                  className="form-input-luxury"
                  style={{ paddingLeft: '42px', height: '46px' }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.78rem', color: '#f5df93', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Security Password
                </label>
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock 
                  size={17} 
                  color="#d4af37" 
                  style={{ position: 'absolute', left: '14px', pointerEvents: 'none', opacity: 0.85 }} 
                />
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
                  style={{ paddingLeft: '42px', paddingRight: '42px', height: '46px' }}
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
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Account</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>

          </div>
        </form>

        {/* Register and Admin portal link */}
        <div style={{ textAlign: 'center', marginTop: '26px', fontSize: '0.86rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            New to TRY ME BRO?{' '}
            <Link to="/register" style={{ color: '#d4af37', fontWeight: 600, textDecoration: 'none' }}>
              Create Member Account →
            </Link>
          </div>
          <div>
            <Link to="/admin/login" style={{ color: '#64748b', fontSize: '0.76rem', textDecoration: 'none' }}>
              Store Executive? Access Admin Console
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
