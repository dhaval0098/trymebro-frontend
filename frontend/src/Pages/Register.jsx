import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, ArrowRight, Eye, EyeOff, Tag, User, Mail, Lock, Phone, MapPin, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { user, token, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
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
    const cleanName = name.trim();

    if (!cleanName || !cleanEmail || !password) {
      const msg = 'Please complete all required fields.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (password !== confirmPassword) {
      const msg = 'Passwords do not match.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (password.length < 6) {
      const msg = 'Password must be at least 6 characters.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    try {
      setLoading(true);
      const res = await register({
        name: cleanName,
        email: cleanEmail,
        password,
        phone: phone.trim() || null,
        address_city: city.trim() || null
      });

      if (res.success) {
        toast.success(`Welcome to TRY ME BRO, ${cleanName}! Your promo code WELCOME10 is active.`);
        
        const rawFrom = location.state?.from?.pathname;
        const invalidPaths = ['/login', '/register', '/admin/login'];
        const destination = rawFrom && !invalidPaths.includes(rawFrom) ? rawFrom : '/profile';
        
        navigate(destination, { replace: true });
      } else {
        const msg = res.message || 'Registration failed. Please try again.';
        setErrorMessage(msg);
        toast.error(msg);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '40px auto 70px auto', padding: '0 16px' }}>
      <div 
        className="glass-card" 
        style={{ 
          padding: '38px 30px', 
          borderRadius: '24px',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.75), 0 0 20px rgba(212, 175, 55, 0.08)'
        }}
      >
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
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

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#d4af37', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
            <Sparkles size={14} /> TRY ME BRO • PERFUME
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.95rem', color: '#ffffff', marginBottom: '8px' }}>
            Create Your Account
          </h1>
          <p style={{ fontSize: '0.86rem', color: '#94a3b8' }}>
            Enjoy exclusive deals, free perfume samples & 10% off your first order.
          </p>
        </div>

        {/* Promo Benefit Badge */}
        <div style={{
          background: 'rgba(212, 175, 55, 0.1)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          borderRadius: '12px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <Tag size={20} color="#d4af37" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.82rem', color: '#f5df93', lineHeight: 1.4 }}>
            <strong>WELCOME10:</strong> Automatically activated upon registering your account.
          </div>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Name */}
            <div>
              <label style={{ fontSize: '0.78rem', color: '#f5df93', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Full Name *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={17} color="#d4af37" style={{ position: 'absolute', left: '14px', pointerEvents: 'none', opacity: 0.85 }} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Lord / Lady / Full Name"
                  required
                  autoComplete="name"
                  className="form-input-luxury"
                  style={{ paddingLeft: '42px', height: '44px' }}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ fontSize: '0.78rem', color: '#f5df93', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Email Address *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={17} color="#d4af37" style={{ position: 'absolute', left: '14px', pointerEvents: 'none', opacity: 0.85 }} />
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
                  style={{ paddingLeft: '42px', height: '44px' }}
                />
              </div>
            </div>

            {/* Phone & City Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Phone (Optional)</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Phone size={15} color="#d4af37" style={{ position: 'absolute', left: '12px', pointerEvents: 'none', opacity: 0.85 }} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                    className="form-input-luxury"
                    style={{ paddingLeft: '36px', height: '42px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>City (Optional)</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <MapPin size={15} color="#d4af37" style={{ position: 'absolute', left: '12px', pointerEvents: 'none', opacity: 0.85 }} />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Mumbai"
                    className="form-input-luxury"
                    style={{ paddingLeft: '36px', height: '42px' }}
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: '0.78rem', color: '#f5df93', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Security Password *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={17} color="#d4af37" style={{ position: 'absolute', left: '14px', pointerEvents: 'none', opacity: 0.85 }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Minimum 6 characters"
                  required
                  autoComplete="new-password"
                  className="form-input-luxury"
                  style={{ paddingLeft: '42px', paddingRight: '42px', height: '44px' }}
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
                  {showPassword ? <EyeOff size={17} color="#f5df93" /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{ fontSize: '0.78rem', color: '#f5df93', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Confirm Password *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={17} color="#d4af37" style={{ position: 'absolute', left: '14px', pointerEvents: 'none', opacity: 0.85 }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Re-enter password"
                  required
                  autoComplete="new-password"
                  className="form-input-luxury"
                  style={{ paddingLeft: '42px', paddingRight: '42px', height: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
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
                  {showConfirmPassword ? <EyeOff size={17} color="#f5df93" /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Submit */}
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>

          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '0.85rem', color: '#94a3b8' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#d4af37', fontWeight: 600, textDecoration: 'none' }}>
            Sign In Here →
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
