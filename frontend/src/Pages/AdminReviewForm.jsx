import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Film,
  MessageSquare,
  Upload,
  Save,
  Star,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

const AdminReviewForm = () => {
  const navigate = useNavigate();

  const [productsList, setProductsList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);

  const [newReview, setNewReview] = useState({
    review_type: 'video', // 'video' | 'written'
    customer_name: '',
    customer_location: '',
    customer_avatar: '',
    product_id: '',
    rating: 5,
    title: '',
    comment: '',
    video_url: '',
    video_thumbnail: '',
    is_verified_buyer: 1,
    is_featured: 1
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
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
        setNewReview(prev => ({ ...prev, video_url: finalUrl }));
        toast.success('🎬 Video review uploaded successfully!');
      }
    } catch (err) {
      console.error('Video upload failed:', err);
      toast.error('Video upload failed. You can also paste a direct URL.');
    } finally {
      setVideoUploading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (!newReview.customer_name.trim()) {
      toast.error('Please enter customer/reviewer name');
      return;
    }
    if (!newReview.comment.trim()) {
      toast.error('Please enter review comment');
      return;
    }
    if (newReview.review_type === 'video' && !newReview.video_url.trim()) {
      toast.error('Please provide or upload a video for video review');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        ...newReview,
        product_id: newReview.product_id ? Number(newReview.product_id) : null,
        rating: Number(newReview.rating),
        is_verified_buyer: newReview.is_verified_buyer ? 1 : 0,
        is_featured: newReview.is_featured ? 1 : 0
      };

      const res = await api.post('/reviews/admin', payload);
      if (res.data?.success) {
        toast.success('✨ Patron review published successfully!');
        navigate('/admin?tab=reviews');
      }
    } catch (err) {
      console.error('Failed to add review:', err);
      toast.error(err.response?.data?.message || 'Failed to publish review');
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
          onClick={() => navigate('/admin?tab=reviews')}
          style={{
            background: 'none',
            border: 'none',
            color: '#f5df93',
            fontSize: '0.84rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Reviews Tab</span>
        </button>

        <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
          Admin Console
        </span>
      </div>

      {/* Main Content Container */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px 16px 0' }}>
        
        {/* Title */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f5df93', fontSize: '0.80rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
            <Sparkles size={14} /> Executive Publishing
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', color: '#fff', margin: 0 }}>
            Publish New Patron Review
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '6px 0 0 0' }}>
            Directly curate video wear-tests, unboxings, or written connoisseur critiques.
          </p>
        </div>

        {/* Form Container */}
        <div style={{
          background: 'linear-gradient(180deg, rgba(16, 20, 31, 0.95) 0%, rgba(10, 13, 20, 0.98) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          borderRadius: '20px',
          padding: 'clamp(18px, 4vw, 28px)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
        }}>
          <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Review Type */}
            <div>
              <label style={{ fontSize: '0.78rem', color: '#f5df93', fontWeight: 700, display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Review Format
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setNewReview(prev => ({ ...prev, review_type: 'video' }))}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: newReview.review_type === 'video' ? '1.5px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                    background: newReview.review_type === 'video' ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255,255,255,0.03)',
                    color: newReview.review_type === 'video' ? '#f5df93' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Film size={15} /> 🎬 Video Wear-Test
                </button>

                <button
                  type="button"
                  onClick={() => setNewReview(prev => ({ ...prev, review_type: 'written' }))}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: newReview.review_type === 'written' ? '1.5px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                    background: newReview.review_type === 'written' ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255,255,255,0.03)',
                    color: newReview.review_type === 'written' ? '#f5df93' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <MessageSquare size={15} /> ✍️ Written Critique
                </button>
              </div>
            </div>

            {/* Customer Name & Location */}
            <div className="admin-reviews-form-grid-2col">
              <div>
                <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Reviewer / Patron Name *
                </label>
                <input
                  type="text"
                  required
                  value={newReview.customer_name}
                  onChange={(e) => setNewReview(prev => ({ ...prev, customer_name: e.target.value }))}
                  placeholder="e.g. Vikram Singhania"
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
                  Location (City, State)
                </label>
                <input
                  type="text"
                  value={newReview.customer_location}
                  onChange={(e) => setNewReview(prev => ({ ...prev, customer_location: e.target.value }))}
                  placeholder="e.g. Bandra, Mumbai"
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

            {/* Fragrance & Rating */}
            <div className="admin-reviews-form-grid-prod-rating">
              <div>
                <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Associated Fragrance
                </label>
                <select
                  value={newReview.product_id}
                  onChange={(e) => setNewReview(prev => ({ ...prev, product_id: e.target.value }))}
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

              <div>
                <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Star Rating
                </label>
                <select
                  value={newReview.rating}
                  onChange={(e) => setNewReview(prev => ({ ...prev, rating: Number(e.target.value) }))}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    color: '#f5df93',
                    fontSize: '0.86rem',
                    outline: 'none'
                  }}
                >
                  <option value={5}>5 Stars (Exceptional)</option>
                  <option value={4}>4 Stars (Very Good)</option>
                  <option value={3}>3 Stars (Average)</option>
                  <option value={2}>2 Stars</option>
                  <option value={1}>1 Star</option>
                </select>
              </div>
            </div>

            {/* Video Upload Section */}
            {newReview.review_type === 'video' && (
              <div style={{
                padding: '14px',
                background: 'rgba(212, 175, 55, 0.06)',
                border: '1.5px dashed rgba(212, 175, 55, 0.35)',
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
                    {videoUploading ? 'Uploading Video...' : 'Choose Device Video File'}
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
                  required
                  value={newReview.video_url}
                  onChange={(e) => setNewReview(prev => ({ ...prev, video_url: e.target.value }))}
                  placeholder="https://... or /videos/luxury-perfume.mp4"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    background: 'rgba(0,0,0,0.6)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    color: '#fff',
                    fontSize: '0.84rem',
                    outline: 'none'
                  }}
                />

                <div>
                  <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                    Video Poster / Thumbnail URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={newReview.video_thumbnail}
                    onChange={(e) => setNewReview(prev => ({ ...prev, video_thumbnail: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontSize: '0.82rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Headline */}
            <div>
              <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Review Headline / Title
              </label>
              <input
                type="text"
                value={newReview.title}
                onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Unbelievable sillage and presentation!"
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

            {/* Commentary */}
            <div>
              <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Detailed Sensory Review *
              </label>
              <textarea
                rows={4}
                required
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Enter detailed wear-test commentary, notes, projection, and patron sentiment..."
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
                  outline: 'none'
                }}
              />
            </div>

            {/* Badges Toggles */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#cbd5e1', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={Boolean(newReview.is_verified_buyer)}
                  onChange={(e) => setNewReview(prev => ({ ...prev, is_verified_buyer: e.target.checked ? 1 : 0 }))}
                  style={{ accentColor: '#10b981', width: '16px', height: '16px' }}
                />
                <span>Verified Patron Badge</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#cbd5e1', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={Boolean(newReview.is_featured)}
                  onChange={(e) => setNewReview(prev => ({ ...prev, is_featured: e.target.checked ? 1 : 0 }))}
                  style={{ accentColor: '#d4af37', width: '16px', height: '16px' }}
                />
                <span>Featured on Top</span>
              </label>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => navigate('/admin?tab=reviews')}
                style={{
                  flex: 1,
                  padding: '13px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#cbd5e1',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || videoUploading}
                className="btn-luxury-gold"
                style={{
                  flex: 2,
                  padding: '13px',
                  borderRadius: '10px',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Save size={16} />
                <span>{isSubmitting ? 'Publishing...' : 'Publish Patron Review'}</span>
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
};

export default AdminReviewForm;
