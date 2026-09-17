import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Key, ArrowRight, Lock, Mail, User, Phone, ShieldCheck, Crown } from 'lucide-react';

const AdminRegister = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [adminSecretKey, setAdminSecretKey] = useState('TRYMEBRO_ADMIN_2026');
  const [loading, setLoading] = useState(false);

  const { adminRegister } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      toast.error('Security passcode must be at least 6 characters.');
      return;
    }

    if (!adminSecretKey.trim()) {
      toast.error('Please provide the Master Admin Security Passcode.');
      return;
    }

    try {
      setLoading(true);
      const res = await adminRegister({
        name,
        email,
        password,
        phone,
        admin_secret_key: adminSecretKey.trim()
      });

      if (res.success) {
        toast.success(`Executive Staff Account Created! Welcome, ${name}.`);
        navigate('/admin');
      } else {
        toast.error(res.message || 'Admin registration failed.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Admin registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '50px auto', padding: '0 20px' }}>
      <div 
        className="glass-panel" 
        style={{ 
          padding: '40px 32px', 
          borderRadius: '24px',
          border: '1.5px solid rgba(212, 175, 55, 0.45)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.9), 0 0 25px rgba(212, 175, 55, 0.15)'
        }}
      >
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(10, 13, 20, 0.95) 100%)',
            border: '1.5px solid rgba(212, 175, 55, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            boxShadow: '0 0 20px rgba(212, 175, 55, 0.35)'
          }}>
            <Crown size={28} color="#f5df93" />
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#d4af37', fontSize: '0.76rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '6px' }}>
            <ShieldCheck size={14} /> Executive Clearance Required
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', color: '#ffffff', marginBottom: '6px' }}>
            Register Admin Staff
          </h1>

          <p style={{ fontSize: '0.84rem', color: '#94a3b8' }}>
            Register an authorized executive account to manage the perfume boutique.
          </p>
        </div>

        {/* Security Notice */}
        <div style={{
          background: 'rgba(212, 175, 55, 0.08)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '12px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <Key size={20} color="#d4af37" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.8rem', color: '#f5df93' }}>
            <strong>Master Security Key:</strong> Auto-filled for initial setup (<code>TRYMEBRO_ADMIN_2026</code>).
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Master Security Key */}
            <div>
              <label style={{ fontSize: '0.78rem', color: '#f5df93', fontWeight: 700, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Master Admin Passcode *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Key size={16} color="#d4af37" style={{ position: 'absolute', left: '14px' }} />
                <input
                  type="text"
                  value={adminSecretKey}
                  onChange={(e) => setAdminSecretKey(e.target.value)}
                  placeholder="TRYMEBRO_ADMIN_2026"
                  required
                  className="form-input-luxury"
                  style={{ paddingLeft: '40px', borderColor: 'rgba(212, 175, 55, 0.5)' }}
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label style={{ fontSize: '0.78rem', color: '#f5df93', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Executive Staff Name *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={16} color="#d4af37" style={{ position: 'absolute', left: '14px' }} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alexander Vance"
                  required
                  className="form-input-luxury"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ fontSize: '0.78rem', color: '#f5df93', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Official Admin Email *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={16} color="#d4af37" style={{ position: 'absolute', left: '14px' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@trymebro.com"
                  required
                  className="form-input-luxury"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Contact Phone (Optional)
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Phone size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px' }} />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="form-input-luxury"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            {/* Passwords */}
            <div>
              <label style={{ fontSize: '0.78rem', color: '#f5df93', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Account Password *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} color="#d4af37" style={{ position: 'absolute', left: '14px' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  className="form-input-luxury"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: '#f5df93', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Confirm Password *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} color="#d4af37" style={{ position: 'absolute', left: '14px' }} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className="form-input-luxury"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-luxury-gold"
              style={{ width: '100%', padding: '14px', fontSize: '0.95rem', marginTop: '8px' }}
            >
              {loading ? 'Registering Admin...' : 'Authorize & Create Admin Account'} <ArrowRight size={16} />
            </button>

          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.84rem' }}>
          Already have admin access?{' '}
          <Link to="/admin/login" style={{ color: '#d4af37', fontWeight: 600 }}>
            Sign In to Admin Portal →
          </Link>
        </div>

      </div>
    </div>
  );
};

export default AdminRegister;
