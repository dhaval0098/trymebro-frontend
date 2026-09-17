import React, { useState } from 'react';
import { X, Sparkles, Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ScentQuizModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    occasion: '',
    vibe: '',
    family: ''
  });
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSelect = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleFinish = () => {
    let query = '/shop?';
    if (answers.family) query += `category=${encodeURIComponent(answers.family)}&`;
    if (answers.vibe) query += `scent_family=${encodeURIComponent(answers.vibe)}`;
    onClose();
    setStep(1);
    navigate(query);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(3, 5, 8, 0.88)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '16px',
      overflowY: 'auto'
    }} onClick={onClose}>
      <div style={{
        background: '#0d1017',
        border: '1px solid var(--border-gold)',
        borderRadius: '20px',
        maxWidth: '560px',
        width: '100%',
        padding: 'clamp(20px, 4vw, 32px)',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.95), 0 0 25px rgba(212, 175, 55, 0.1)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            color: '#94a3b8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#d4af37';
            e.currentTarget.style.borderColor = '#d4af37';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#94a3b8';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '22px', paddingRight: '20px', paddingLeft: '20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#d4af37', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>
            <Sparkles size={14} /> Fragrance Matcher & Profiler
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.15rem, 3vw, 1.45rem)', color: '#f8fafc', marginBottom: '6px', lineHeight: '1.3' }}>
            {step === 1 && 'When will you wear this fragrance?'}
            {step === 2 && 'What aura do you wish to project?'}
            {step === 3 && 'Which scent accord speaks to your soul?'}
            {step === 4 && 'Your Signature Scent Profile is Ready!'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Step {Math.min(step, 3)} of 3 • Curated by TRY ME BRO Fragrance Experts
          </p>
        </div>

        {/* Step 1: Occasion */}
        {step === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {[
              { label: 'Black-Tie & Evening Galas', value: 'evening', desc: 'Opulent, magnetic, long lasting scent trail' },
              { label: 'Daily Signature & Office', value: 'daily', desc: 'Refined, versatile, crisp elegance' },
              { label: 'Romantic & Date Nights', value: 'intimate', desc: 'Warm vanilla, sensual amber, rose' },
              { label: 'High Summer & Getaways', value: 'vacation', desc: 'Aquatic breeze, neroli, citrus' }
            ].map(item => (
              <button
                key={item.value}
                onClick={() => handleSelect('occasion', item.value)}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  color: '#f8fafc'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#d4af37'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              >
                <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '4px' }}>{item.label}</div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{item.desc}</div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Vibe */}
        {step === 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {[
              { label: 'Mysterious & Powerful', value: 'Woody', desc: 'Dark cedarwood, oud & smoky leather' },
              { label: 'Sophisticated & Regal', value: 'Floral', desc: 'Turkish rose, jasmine, grand iris' },
              { label: 'Warm & Seductive', value: 'Oriental', desc: 'Ambergris, tonka, rich bourbon vanilla' },
              { label: 'Effortless & Fresh', value: 'Fresh', desc: 'Italian bergamot, sea salt, green tea' }
            ].map(item => (
              <button
                key={item.value}
                onClick={() => handleSelect('vibe', item.value)}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  color: '#f8fafc'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#d4af37'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              >
                <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '4px' }}>{item.label}</div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{item.desc}</div>
              </button>
            ))}
          </div>
        )}

        {/* Step 3: Scent Family Accord */}
        {step === 3 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {[
              { label: 'Woody & Earthy', slug: 'woody-earthy', desc: 'Cedar, sandalwood, patchouli' },
              { label: 'Oriental & Amber', slug: 'oriental-amber', desc: 'Amber, saffron, exotic spices' },
              { label: 'Floral Elegance', slug: 'floral-elegance', desc: 'Damask rose, white florals' },
              { label: 'Pure Perfume Extrait 30%+', slug: 'niche-extrait', desc: 'Max concentration luxury blends' }
            ].map(item => (
              <button
                key={item.slug}
                onClick={() => {
                  setAnswers(prev => ({ ...prev, family: item.slug }));
                  setStep(4);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  color: '#f8fafc'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#d4af37'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              >
                <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '4px' }}>{item.label}</div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{item.desc}</div>
              </button>
            ))}
          </div>
        )}

        {/* Step 4: Result Confirmation */}
        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid #d4af37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <Check size={28} color="#d4af37" />
            </div>
            <h3 style={{ fontSize: '1.2rem', color: '#f8fafc', marginBottom: '8px' }}>
              Tailored Recommendation Unlocked
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#94a3b8', marginBottom: '22px', lineHeight: '1.6' }}>
              We have synthesized your preferences to curate an exclusive list of perfumes with matching top, heart, and base accords.
            </p>
            <button
              onClick={handleFinish}
              className="btn-luxury-gold"
              style={{ width: '100%', padding: '12px 20px', fontSize: '0.92rem' }}
            >
              Reveal My Fragrance Matches <ArrowRight size={18} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ScentQuizModal;
