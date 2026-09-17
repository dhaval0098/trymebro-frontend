import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Award, 
  Droplets, 
  Compass, 
  Crown, 
  HeartHandshake, 
  ArrowRight, 
  CheckCircle, 
  ThermometerSnowflake, 
  Flame 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const DEFAULT_ABOUT_CONTENT = {
  hero_badge: 'The Art of Haute Parfumerie',
  hero_title: 'Curators of Rare, Artisanal & Timeless Scents',
  hero_subtitle: "Born from an unyielding devotion to olfactory excellence, TRY ME BRO unites the world's most revered master perfumers, rare distillations, and bespoke flacons.",
  hero_image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1600&q=80',
  story_badge: 'BEYOND CONVENTIONAL LUXURY',
  story_title: 'Crafting Intimate Signatures of Identity',
  story_p1: 'A true luxury perfume is never merely a scent — it is an invisible garment, a lingering memory, and an intimate assertion of individuality.',
  story_p2: 'We work exclusively with licensed heritage perfume houses and master distillers who harvest botanical essences at dawn, mature oils in French oak casks, and bottle flacons with relentless devotion to purity.',
  story_image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80',
  story_image_tag: 'Master Distillations from Grasse, Taif & Mysore',
  pillars: [
    {
      title: 'Extrait Oil Concentration',
      description: 'Bottles feature 20% to 40% pure aromatic oils for opulent silage, deep sillage projection, and 12+ hour skin longevity.'
    },
    {
      title: 'Rare Botanical Reserves',
      description: 'Sustainably harvested Grasse Centifolia rose, Mysore Sandalwood, Bourbon vanilla, and aged Cambodian Agarwood.'
    },
    {
      title: '100% Flacon Provenance',
      description: 'Every flacon is serialized with verified batch codes, authentic cellophane seals, and official certificates of origin.'
    },
    {
      title: 'Climate-Shielded Vaults',
      description: 'Preserved in darkness at an exact 18°C temperature to safeguard volatile top notes and ensure immaculate delivery.'
    }
  ],
  stats: [
    { value: '500+', label: 'Curated Flacons' },
    { value: '100%', label: 'Authenticity Promise' },
    { value: '15,000+', label: 'Discerning Patrons' },
    { value: '24h', label: 'Concierge Support' }
  ],
  cta_title: 'Begin Your Olfactory Discovery',
  cta_subtitle: 'Uncover rare elixirs, bespoke extraits, and signature notes tailored for your personal scent aura.'
};

const About = () => {
  const [content, setContent] = useState(DEFAULT_ABOUT_CONTENT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        const res = await api.get('/content/about');
        if (res.data?.success && res.data.content) {
          setContent(res.data.content);
        }
      } catch (err) {
        console.warn('Using default about content:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAboutContent();
  }, []);

  const pillarsIcons = [
    <Droplets size={24} color="#d4af37" key="0" />,
    <Award size={24} color="#d4af37" key="1" />,
    <ShieldCheck size={24} color="#d4af37" key="2" />,
    <ThermometerSnowflake size={24} color="#d4af37" key="3" />
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: 'clamp(20px, 4vw, 40px) auto', padding: '0 clamp(14px, 3vw, 24px)' }}>
      
      {/* 1. Hero Showcase Banner */}
      <div 
        style={{
          position: 'relative',
          borderRadius: '24px',
          overflow: 'hidden',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          background: `radial-gradient(ellipse at center, rgba(20, 26, 38, 0.85) 0%, rgba(6, 8, 12, 0.98) 100%), url(${content.hero_image || DEFAULT_ABOUT_CONTENT.hero_image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(212, 175, 55, 0.15)',
          padding: 'clamp(48px, 9vw, 96px) clamp(20px, 5vw, 48px)',
          textAlign: 'center',
          marginBottom: 'clamp(36px, 6vw, 64px)'
        }}
      >
        <div 
          style={{
            position: 'absolute',
            top: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 1
          }} 
        />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '9999px',
            background: 'rgba(212, 175, 55, 0.12)',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            color: '#f5df93',
            fontSize: 'clamp(0.72rem, 1.8vw, 0.8rem)',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '18px'
          }}>
            <Crown size={14} color="#d4af37" />
            <span>{content.hero_badge || 'The Art of Haute Parfumerie'}</span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2rem, 5vw, 3.8rem)',
            fontWeight: 700,
            lineHeight: 1.15,
            color: '#ffffff',
            margin: '0 auto 20px auto',
            maxWidth: '900px'
          }}>
            {content.hero_title || 'Curators of Rare, Artisanal & Timeless Scents'}
          </h1>

          <p style={{
            fontSize: 'clamp(0.92rem, 2vw, 1.1rem)',
            color: '#cbd5e1',
            maxWidth: '720px',
            margin: '0 auto clamp(24px, 4vw, 36px) auto',
            lineHeight: 1.8,
            fontWeight: 300
          }}>
            {content.hero_subtitle || DEFAULT_ABOUT_CONTENT.hero_subtitle}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <Link to="/shop" className="btn-luxury-gold" style={{ padding: '13px 32px', fontSize: '0.88rem' }}>
              Explore Our Flacons <ArrowRight size={16} />
            </Link>
            <Link to="/contact" className="btn-luxury-outline" style={{ padding: '12px 28px', fontSize: '0.88rem' }}>
              Concierge Inquiries
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Our Story & Craftsmanship Showcase (2 Columns) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
        gap: 'clamp(24px, 5vw, 48px)',
        alignItems: 'center',
        marginBottom: 'clamp(48px, 8vw, 84px)'
      }}>
        {/* Left: Atmospheric Image Card */}
        <div 
          style={{
            position: 'relative',
            borderRadius: '20px',
            overflow: 'hidden',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
            aspectRatio: '4 / 3',
            background: '#0a0d14'
          }}
        >
          <img 
            src={content.story_image || DEFAULT_ABOUT_CONTENT.story_image} 
            alt="Artisanal perfume formulation"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '24px',
            background: 'linear-gradient(to top, rgba(6, 8, 12, 0.95) 0%, rgba(6, 8, 12, 0.4) 70%, transparent 100%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <span style={{ fontSize: '0.74rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
              Provenance & Heritage
            </span>
            <span style={{ fontSize: '1.05rem', color: '#f8fafc', fontWeight: 600 }}>
              {content.story_image_tag || 'Master Distillations from Grasse, Taif & Mysore'}
            </span>
          </div>
        </div>

        {/* Right: Story Content */}
        <div>
          <div style={{ fontSize: '0.76rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '10px' }}>
            {content.story_badge || 'BEYOND CONVENTIONAL LUXURY'}
          </div>
          
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
            color: '#f8fafc',
            marginBottom: '18px',
            lineHeight: 1.25
          }}>
            {content.story_title || 'Crafting Intimate Signatures of Identity'}
          </h2>

          <p style={{ fontSize: '0.94rem', color: '#cbd5e1', lineHeight: 1.8, marginBottom: '16px' }}>
            {content.story_p1 || DEFAULT_ABOUT_CONTENT.story_p1}
          </p>

          <p style={{ fontSize: '0.92rem', color: '#94a3b8', lineHeight: 1.75, marginBottom: '24px' }}>
            {content.story_p2 || DEFAULT_ABOUT_CONTENT.story_p2}
          </p>

          {/* Quick Checkpoints */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {[
              'Direct Atelier Sourcing',
              'Pure Extrait Formulations',
              'Registered Batch Provenance',
              'Climate-Controlled Dispatch'
            ].map((text, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: '#f5df93' }}>
                <CheckCircle size={15} color="#d4af37" style={{ flexShrink: 0 }} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Four Core Pillars of Excellence */}
      <div style={{ marginBottom: 'clamp(48px, 8vw, 84px)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(28px, 5vw, 44px)' }}>
          <div style={{ fontSize: '0.76rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '8px' }}>
            OUR UNCOMPROMISING STANDARD
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem, 3.5vw, 2.3rem)', color: '#ffffff' }}>
            The Four Pillars of Quality
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
          gap: '20px'
        }}>
          {(content.pillars || DEFAULT_ABOUT_CONTENT.pillars).map((pillar, idx) => (
            <div key={idx} className="glass-card" style={{ padding: '30px 24px', borderRadius: '18px', display: 'flex', flexDirection: 'column' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'rgba(212, 175, 55, 0.12)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px'
              }}>
                {pillarsIcons[idx % pillarsIcons.length]}
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: '#f8fafc', marginBottom: '10px' }}>
                {pillar.title}
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#94a3b8', lineHeight: 1.7, margin: 0 }}>
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Numbers & Accolades Bar */}
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(16, 21, 31, 0.9) 0%, rgba(8, 10, 15, 0.98) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          borderRadius: '20px',
          padding: 'clamp(28px, 4vw, 40px) clamp(16px, 3vw, 32px)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '24px',
          textAlign: 'center',
          marginBottom: 'clamp(48px, 8vw, 84px)'
        }}
      >
        {(content.stats || DEFAULT_ABOUT_CONTENT.stats).map((stat, idx) => (
          <div key={idx}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: '#f5df93', fontWeight: 700 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '4px' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* 5. CTA Footer Box */}
      <div 
        style={{
          background: 'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.12) 0%, rgba(10, 13, 20, 0.95) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.45)',
          borderRadius: '24px',
          padding: 'clamp(36px, 6vw, 60px) clamp(20px, 4vw, 36px)',
          textAlign: 'center',
          boxShadow: '0 12px 36px rgba(0,0,0,0.5)'
        }}
      >
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
          color: '#ffffff',
          marginBottom: '12px'
        }}>
          {content.cta_title || 'Begin Your Olfactory Discovery'}
        </h2>
        <p style={{
          fontSize: '0.92rem',
          color: '#cbd5e1',
          maxWidth: '560px',
          margin: '0 auto clamp(20px, 3vw, 28px) auto',
          lineHeight: 1.7
        }}>
          {content.cta_subtitle || DEFAULT_ABOUT_CONTENT.cta_subtitle}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <Link to="/shop" className="btn-luxury-gold" style={{ padding: '13px 32px' }}>
            Explore Fragrances <ArrowRight size={16} />
          </Link>
          <Link to="/contact" className="btn-luxury-outline" style={{ padding: '12px 26px' }}>
            Contact Our Concierge
          </Link>
        </div>
      </div>

    </div>
  );
};

export default About;
