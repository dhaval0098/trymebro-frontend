import React from 'react';
import { Wind, Heart, Sparkles } from 'lucide-react';

const FragrancePyramid = ({ topNotes, middleNotes, baseNotes }) => {
  return (
    <div style={{
      background: 'rgba(15, 19, 28, 0.6)',
      border: '1px solid var(--border-gold)',
      borderRadius: '16px',
      padding: '24px',
      margin: '24px 0'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.15rem',
          color: '#f5df93',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '4px'
        }}>
          Olfactory Pyramid & Scent Architecture
        </h3>
        <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
          Experience the evolving harmonic notes as the fragrance settles on your skin
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '640px', margin: '0 auto' }}>
        
        {/* Tier 1: Top Notes (Head) */}
        <div style={{
          background: 'linear-gradient(90deg, rgba(212, 175, 55, 0.05) 0%, rgba(212, 175, 55, 0.15) 50%, rgba(212, 175, 55, 0.05) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '12px',
          padding: '14px 16px',
          textAlign: 'center',
          maxWidth: '100%',
          margin: '0 auto',
          width: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#f5df93', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
            <Wind size={14} /> Top Notes (First 15 mins)
          </div>
          <div style={{ fontSize: '0.92rem', color: '#f8fafc', fontWeight: 500 }}>
            {topNotes || 'Bergamot, Pink Pepper, Sicilian Citrus'}
          </div>
        </div>

        {/* Tier 2: Heart / Middle Notes */}
        <div style={{
          background: 'linear-gradient(90deg, rgba(244, 63, 94, 0.05) 0%, rgba(244, 63, 94, 0.15) 50%, rgba(244, 63, 94, 0.05) 100%)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: '12px',
          padding: '16px 16px',
          textAlign: 'center',
          maxWidth: '100%',
          margin: '0 auto',
          width: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#fda4af', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
            <Heart size={14} /> Heart Notes (2 - 4 hours)
          </div>
          <div style={{ fontSize: '0.92rem', color: '#f8fafc', fontWeight: 500 }}>
            {middleNotes || 'Grasse Rose, Jasmine Sambac, Lavender, Iris'}
          </div>
        </div>

        {/* Tier 3: Base Notes */}
        <div style={{
          background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.05) 0%, rgba(168, 85, 247, 0.15) 50%, rgba(168, 85, 247, 0.05) 100%)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          borderRadius: '12px',
          padding: '18px 16px',
          textAlign: 'center',
          maxWidth: '100%',
          margin: '0 auto',
          width: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#d8b4fe', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
            <Sparkles size={14} /> Base Notes (6 - 12+ hours)
          </div>
          <div style={{ fontSize: '0.92rem', color: '#f8fafc', fontWeight: 500 }}>
            {baseNotes || 'Mysore Sandalwood, Bourbon Vanilla, Amber, Haitian Vetiver'}
          </div>
        </div>

      </div>
    </div>
  );
};

export default FragrancePyramid;
