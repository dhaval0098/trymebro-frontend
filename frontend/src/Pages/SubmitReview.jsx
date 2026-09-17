import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Star,
  Film,
  MessageSquare,
  Upload,
  Send,
  Droplets,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  X
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const SubmitReview = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [productsList, setProductsList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);

  const [form, setForm] = useState({
    review_type: 'written', // 'written' | 'video'
    rating: 5,
    title: '',
    comment: '',
    product_id: '',
    video_url: '',
    video_thumbnail: '',
    customer_name: user?.name || '',
    customer_location: ''
  });

  useEffect(() => {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Fetch product list for selection
    api.get('/products?limit=100')
      .then(res => {
        if (res.data?.products) setProductsList(res.data.products);
      })
      .catch(() => {});
  }, []);

  // Direct Device Video Upload
  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|m4v|ogg)$/i)) {
      toast.error('Please select a valid video file (MP4, WEBM, MOV, etc.)');
      return;
    }

    if (file.size > 150 * 1024 * 1024) {
      toast.error('Video size must be under 150MB');
      return;
    }

    try {
      setVideoUploading(true);
      const formData = new FormData();
      formData.append('video', file);

      const res = await api.post('/upload/video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.url || res.data?.path) {
        const finalUrl = res.data.url || res.data.path;
        setForm(prev => ({ ...prev, video_url: finalUrl }));
        toast.success('🎬 Video review uploaded successfully!');
      }
    } catch (err) {
      console.error('Video upload error:', err);
      toast.error('Server upload failed. You can also paste a direct URL.');
    } finally {
      setVideoUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.comment.trim()) {
      toast.error('Please enter your sensory impressions');
      return;
    }
    if (form.review_type === 'video' && !form.video_url.trim()) {
      toast.error('Please provide or upload a video for your wear-test review');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        ...form,
        rating: Number(form.rating),
        product_id: form.product_id ? Number(form.product_id) : null
      };

      const res = await api.post('/reviews', payload);
      if (res.data?.success) {
        toast.success(res.data.message || '✨ Thank you! Your review has been submitted.');
        navigate('/reviews');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary, #04060a)', color: '#f8fafc', paddingBottom: '80px' }}>
      
      {/* Top Header Navigation */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(4, 6, 10, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <button
          type="button"
          onClick={() => navigate('/reviews')}
          style={{
            background: 'none',
            border: 'none',
            color: '#f5df93',
            fontSize: '0.84rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            borderRadius: '8px'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Reviews</span>
        </button>

        <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
          Patron Submission
        </span>
      </div>

      {/* Main Content Container */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px 16px 0' }}>
        
        {/* Hero Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(212, 175, 55, 0.15)',
            border: '1px solid #d4af37',
            color: '#f5df93',
            marginBottom: '12px'
          }}>
            <Sparkles size={24} />
          </div>

          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.5rem, 5vw, 2rem)',
            color: '#ffffff',
            margin: '0 0 8px 0',
            lineHeight: 1.2
          }}>
            Share Your Scent Story
          </h1>
          <p style={{ fontSize: '0.86rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
            Submit an unboxing wear-test video or write your olfactory critique to guide connoisseurs worldwide.
          </p>
        </div>

        {/* Form Card */}
        <div style={{
          background: 'linear-gradient(180deg, rgba(16, 20, 31, 0.95) 0%, rgba(10, 13, 20, 0.98) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          borderRadius: '20px',
          padding: 'clamp(18px, 4vw, 28px)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* 1. Format Switcher */}
            <div>
              <label style={{ fontSize: '0.78rem', color: '#f5df93', fontWeight: 700, display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                1. Select Format
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, review_type: 'written' }))}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: form.review_type === 'written' ? '1.5px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                    background: form.review_type === 'written' ? 'rgba(212, 175, 55, 0.20)' : 'rgba(255,255,255,0.03)',
                    color: form.review_type === 'written' ? '#f5df93' : '#cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <MessageSquare size={16} /> Written Impression
                </button>

                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, review_type: 'video' }))}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: form.review_type === 'video' ? '1.5px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                    background: form.review_type === 'video' ? 'rgba(212, 175, 55, 0.20)' : 'rgba(255,255,255,0.03)',
                    color: form.review_type === 'video' ? '#f5df93' : '#cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Film size={16} /> 🎬 Video Wear-Test Reel
                </button>
              </div>
            </div>

            {/* 2. Associated Fragrance */}
            <div>
              <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Select Fragrance (Optional)
              </label>
              <select
                value={form.product_id}
                onChange={(e) => setForm(prev => ({ ...prev, product_id: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  color: '#fff',
                  fontSize: '0.86rem',
                  outline: 'none'
                }}
              >
                <option value="">General Boutique Experience</option>
                {productsList.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* 3. Star Rating */}
            <div>
              <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                Your Olfactory Score
              </label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, rating: star }))}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    <Star
                      size={28}
                      fill={star <= form.rating ? '#d4af37' : 'transparent'}
                      color={star <= form.rating ? '#d4af37' : 'rgba(212, 175, 55, 0.3)'}
                    />
                  </button>
                ))}
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f5df93', marginLeft: '6px' }}>
                  {form.rating} / 5 Stars
                </span>
              </div>
            </div>

            {/* 4. Reviewer Name & Location */}
            <div className="reviews-form-row-2col">
              <div>
                <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Your Name
                </label>
                <input
                  type="text"
                  value={form.customer_name}
                  onChange={(e) => setForm(prev => ({ ...prev, customer_name: e.target.value }))}
                  placeholder={user?.name || "e.g. Vikram Singhania"}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#fff',
                    fontSize: '0.86rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  City / Location
                </label>
                <input
                  type="text"
                  value={form.customer_location}
                  onChange={(e) => setForm(prev => ({ ...prev, customer_location: e.target.value }))}
                  placeholder="e.g. Mumbai, India"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#fff',
                    fontSize: '0.86rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* 5. Video File Upload or Link (if video review) */}
            {form.review_type === 'video' && (
              <div style={{
                padding: '14px',
                background: 'rgba(212, 175, 55, 0.06)',
                border: '1.5px dashed rgba(212, 175, 55, 0.4)',
                borderRadius: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <label style={{ fontSize: '0.78rem', color: '#f5df93', fontWeight: 700 }}>
                    Video File Upload or Direct Link *
                  </label>
                  <label
                    style={{
                      fontSize: '0.74rem',
                      color: '#d4af37',
                      background: 'rgba(212,175,55,0.18)',
                      border: '1px solid #d4af37',
                      borderRadius: '8px',
                      padding: '5px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontWeight: 600
                    }}
                  >
                    <Upload size={13} />
                    {videoUploading ? 'Uploading Video...' : 'Choose Device Video'}
                    <input
                      type="file"
                      accept="video/*"
                      style={{ display: 'none' }}
                      onChange={handleVideoUpload}
                      disabled={videoUploading}
                    />
                  </label>
                </div>

                <input
                  type="text"
                  value={form.video_url}
                  onChange={(e) => setForm(prev => ({ ...prev, video_url: e.target.value }))}
                  placeholder="https://... or /videos/luxury-perfume.mp4"
                  required={form.review_type === 'video'}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(0,0,0,0.6)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    color: '#fff',
                    fontSize: '0.84rem',
                    outline: 'none'
                  }}
                />

                {form.video_url && (
                  <div style={{ fontSize: '0.74rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={13} /> Video source ready
                  </div>
                )}
              </div>
            )}

            {/* 6. Headline */}
            <div>
              <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Review Headline
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Masterpiece with 12+ hr longevity"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff',
                  fontSize: '0.86rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* 7. Detailed Critique */}
            <div>
              <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Sensory Impressions & Critique *
              </label>
              <textarea
                rows={5}
                required
                value={form.comment}
                onChange={(e) => setForm(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Describe the opening notes, dry-down, sillage projection, compliments, and presentation..."
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff',
                  fontSize: '0.86rem',
                  resize: 'vertical',
                  lineHeight: 1.5,
                  outline: 'none'
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || videoUploading}
              className="btn-luxury-gold"
              style={{
                marginTop: '10px',
                padding: '15px',
                borderRadius: '14px',
                fontSize: '0.94rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%'
              }}
            >
              <Send size={16} />
              <span>{isSubmitting ? 'Publishing Impression...' : 'Publish Patron Review'}</span>
            </button>

          </form>
        </div>

      </div>

    </div>
  );
};

export default SubmitReview;
