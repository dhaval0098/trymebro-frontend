import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  Film,
  MessageSquare,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  MapPin,
  X,
  Save,
  Video,
  Play,
  Pause,
  ExternalLink,
  Droplets,
  AlertTriangle,
  Upload,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

const AdminReviewsTab = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    videoCount: 0,
    writtenCount: 0,
    avgRating: 5.0
  });
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'video' | 'written'
  const [ratingFilter, setRatingFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Review Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

  // Video Preview Modal
  const [previewVideoUrl, setPreviewVideoUrl] = useState(null);

  // Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Responsive Navigation Helpers for Mobile (< 768px) vs Desktop (Modal)
  const handleAddReview = () => {
    if (window.innerWidth <= 768) {
      navigate('/admin/reviews/new');
    } else {
      setIsAddModalOpen(true);
    }
  };

  const handleWatchVideo = (review) => {
    if (window.innerWidth <= 768) {
      navigate(`/reviews/video/${review.id}`);
    } else {
      setPreviewVideoUrl(review.video_url);
    }
  };

  // Load reviews & products
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (ratingFilter !== 'all') params.append('rating', ratingFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const [reviewRes, prodRes] = await Promise.all([
        api.get(`/reviews?${params.toString()}`),
        api.get('/products?limit=100').catch(() => ({ data: { products: [] } }))
      ]);

      if (reviewRes.data?.success) {
        setReviews(reviewRes.data.reviews || []);
        if (reviewRes.data.stats) {
          setStats(reviewRes.data.stats);
        }
      }
      if (prodRes.data?.products) {
        setProductsList(prodRes.data.products);
      }
    } catch (err) {
      console.error('Failed to load reviews in admin:', err);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [typeFilter, ratingFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReviews();
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  // Handle Add Review Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (!newReview.customer_name.trim()) {
      toast.error('Customer / Reviewer name is required');
      return;
    }

    if (!newReview.comment.trim()) {
      toast.error('Review text/comment is required');
      return;
    }

    if (newReview.review_type === 'video' && !newReview.video_url.trim()) {
      toast.error('Please upload or provide a video URL for video reviews');
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
        toast.success(res.data.message || 'Review added successfully!');
        setIsAddModalOpen(false);
        setNewReview({
          review_type: 'video',
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
        fetchReviews();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add review');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Review
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      const res = await api.delete(`/reviews/${deleteTarget.id}`);
      if (res.data?.success) {
        toast.success('Review deleted successfully!');
        setDeleteTarget(null);
        fetchReviews();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete review');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="admin-reviews-root">
      
      {/* 1. Header & Quick Actions */}
      <div className="admin-reviews-header-card">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star size={20} color="#d4af37" fill="#d4af37" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0, fontFamily: 'var(--font-serif)' }}>
              Patron Reviews Management
            </h2>
          </div>
          <p style={{ fontSize: '0.80rem', color: '#94a3b8', margin: '4px 0 0' }}>
            Curate video wear-tests, unboxings, and written impressions visible on the storefront review page.
          </p>
        </div>

        <div className="admin-reviews-actions-group">
          <a
            href="/reviews"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#cbd5e1',
              fontSize: '0.82rem',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ExternalLink size={14} /> View Storefront Page
          </a>

          <button
            type="button"
            onClick={handleAddReview}
            className="btn-luxury-gold"
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              fontSize: '0.84rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Plus size={16} /> + Add New Review
          </button>
        </div>
      </div>

      {/* 2. Metrics Summary Bar */}
      <div className="admin-reviews-stats-grid">
        {/* Metric 1 */}
        <div className="admin-reviews-stat-card">
          <span style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
            Total Published Reviews
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
            {stats.total}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#10b981' }}>Live on customer storefront</span>
        </div>

        {/* Metric 2 */}
        <div className="admin-reviews-stat-card">
          <span style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
            🎬 Video Wear-Tests
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f5df93' }}>
            {stats.videoCount}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Reels & Unboxings</span>
        </div>

        {/* Metric 3 */}
        <div className="admin-reviews-stat-card">
          <span style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
            ✍️ Written Reviews
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#60a5fa' }}>
            {stats.writtenCount}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Sensory Critiques</span>
        </div>

        {/* Metric 4 */}
        <div className="admin-reviews-stat-card">
          <span style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
            Average Star Rating
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#d4af37' }}>
            {stats.avgRating.toFixed(1)} ★
          </div>
          <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Out of 5.0 stars</span>
        </div>
      </div>

      {/* 3. Search and Filtering Controls */}
      <div className="admin-reviews-filter-bar">
        {/* Type Tabs */}
        <div className="admin-reviews-type-tabs">
          {[
            { id: 'all', label: 'All Formats' },
            { id: 'video', label: '🎬 Video Reviews' },
            { id: 'written', label: '✍️ Written' }
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTypeFilter(t.id)}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: typeFilter === t.id ? '1px solid #d4af37' : '1px solid transparent',
                background: typeFilter === t.id ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                color: typeFilter === t.id ? '#f5df93' : '#94a3b8',
                transition: 'all 0.15s ease'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search & Rating */}
        <div className="admin-reviews-search-group">
          <div style={{ position: 'relative', minWidth: '180px' }}>
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patron or perfume..."
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '7px 10px 7px 30px',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                fontSize: '0.78rem'
              }}
            />
          </div>

          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            style={{
              padding: '7px 10px',
              borderRadius: '8px',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#f5df93',
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Stars</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
          </select>
        </div>
      </div>

      {/* 4. Reviews List Table / Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#d4af37' }}>
          Loading patron reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'rgba(16, 20, 31, 0.4)',
          borderRadius: '16px',
          border: '1px dashed rgba(212, 175, 55, 0.25)'
        }}>
          <MessageSquare size={36} color="#d4af37" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', color: '#fff', margin: '0 0 6px' }}>No Reviews Found</h3>
          <p style={{ fontSize: '0.80rem', color: '#94a3b8', margin: '0 0 16px' }}>
            Add video or written reviews using the button above.
          </p>
          <button
            type="button"
            onClick={handleAddReview}
            className="btn-luxury-gold"
            style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600 }}
          >
            + Add First Review
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table View (>= 860px) */}
          <div className="admin-reviews-table-wrapper">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(6, 8, 14, 0.85)', borderBottom: '1.5px solid rgba(212, 175, 55, 0.3)', color: '#94a3b8' }}>
                    <th style={{ padding: '14px 16px' }}>Type & Media</th>
                    <th style={{ padding: '14px 16px' }}>Patron / Reviewer</th>
                    <th style={{ padding: '14px 16px' }}>Fragrance</th>
                    <th style={{ padding: '14px 16px' }}>Rating</th>
                    <th style={{ padding: '14px 16px' }}>Impression & Title</th>
                    <th style={{ padding: '14px 16px' }}>Date</th>
                    <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map(review => (
                    <tr
                      key={review.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Media preview */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                        {review.review_type === 'video' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                              onClick={() => handleWatchVideo(review)}
                              style={{
                                width: '54px',
                                height: '54px',
                                borderRadius: '8px',
                                background: '#000',
                                border: '1.5px solid #d4af37',
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Click to preview video"
                            >
                              {review.video_thumbnail ? (
                                <img src={review.video_thumbnail} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <Film size={20} color="#d4af37" />
                              )}
                              <div style={{ position: 'absolute', background: 'rgba(0,0,0,0.6)', borderRadius: '50%', padding: '4px' }}>
                                <Play size={12} color="#fff" />
                              </div>
                            </div>
                            <span style={{
                              fontSize: '0.70rem',
                              fontWeight: 700,
                              color: '#f5df93',
                              background: 'rgba(212, 175, 55, 0.15)',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}>
                              VIDEO
                            </span>
                          </div>
                        ) : (
                          <span style={{
                            fontSize: '0.70rem',
                            fontWeight: 700,
                            color: '#60a5fa',
                            background: 'rgba(96, 165, 250, 0.15)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <MessageSquare size={11} /> WRITTEN
                          </span>
                        )}
                      </td>

                      {/* Reviewer */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {review.customer_name || 'Anonymous Patron'}
                          {review.is_verified_buyer ? <CheckCircle2 size={13} color="#10b981" /> : null}
                        </div>
                        {review.customer_location && (
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <MapPin size={10} color="#d4af37" /> {review.customer_location}
                          </div>
                        )}
                      </td>

                      {/* Product */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                        {review.product_name ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {review.product_image ? (
                              <img src={review.product_image} alt="" style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }} />
                            ) : (
                              <Droplets size={16} color="#d4af37" />
                            )}
                            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{review.product_name}</span>
                          </div>
                        ) : (
                          <span style={{ color: '#64748b', fontStyle: 'italic' }}>General Experience</span>
                        )}
                      </td>

                      {/* Rating */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#d4af37' }}>
                          {[...Array(review.rating || 5)].map((_, i) => (
                            <Star key={i} size={13} fill="#d4af37" strokeWidth={1} />
                          ))}
                        </div>
                      </td>

                      {/* Comment snippet */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'middle', maxWidth: '300px' }}>
                        {review.title && (
                          <div style={{ fontWeight: 700, color: '#f5df93', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            "{review.title}"
                          </div>
                        )}
                        <div style={{ color: '#94a3b8', fontSize: '0.76rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {review.comment}
                        </div>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'middle', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                        {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'middle', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          {review.video_url && (
                            <button
                              type="button"
                              onClick={() => handleWatchVideo(review)}
                              style={{
                                background: 'rgba(212, 175, 55, 0.15)',
                                border: '1px solid #d4af37',
                                color: '#f5df93',
                                borderRadius: '8px',
                                padding: '6px 10px',
                                fontSize: '0.74rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              title="Play Video"
                            >
                              <Play size={12} /> Play
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(review)}
                            style={{
                              background: 'rgba(244, 63, 94, 0.15)',
                              border: '1px solid #f43f5e',
                              color: '#fda4af',
                              borderRadius: '8px',
                              padding: '6px 10px',
                              fontSize: '0.74rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Delete Review"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile & Tablet Card View (< 860px) */}
          <div className="admin-reviews-mobile-card-list">
            {reviews.map(review => (
              <div key={review.id} className="admin-review-mobile-card">
                {/* Top Row: Type Badge, Star Rating & Date */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {review.review_type === 'video' ? (
                      <span style={{
                        fontSize: '0.70rem',
                        fontWeight: 700,
                        color: '#f5df93',
                        background: 'rgba(212, 175, 55, 0.15)',
                        border: '1px solid rgba(212, 175, 55, 0.4)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Film size={11} color="#d4af37" /> VIDEO REEL
                      </span>
                    ) : (
                      <span style={{
                        fontSize: '0.70rem',
                        fontWeight: 700,
                        color: '#60a5fa',
                        background: 'rgba(96, 165, 250, 0.15)',
                        border: '1px solid rgba(96, 165, 250, 0.3)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <MessageSquare size={11} /> WRITTEN
                      </span>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#d4af37' }}>
                      {[...Array(review.rating || 5)].map((_, i) => (
                        <Star key={i} size={13} fill="#d4af37" strokeWidth={1} />
                      ))}
                    </div>
                  </div>

                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                {/* Reviewer & Fragrance Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {review.customer_name || 'Anonymous Patron'}
                      {review.is_verified_buyer ? <CheckCircle2 size={13} color="#10b981" /> : null}
                    </div>
                    {review.customer_location && (
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '1px' }}>
                        <MapPin size={10} color="#d4af37" /> {review.customer_location}
                      </div>
                    )}
                  </div>

                  {review.product_name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', padding: '4px 8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      {review.product_image ? (
                        <img src={review.product_image} alt="" style={{ width: '22px', height: '22px', borderRadius: '4px', objectFit: 'cover' }} />
                      ) : (
                        <Droplets size={13} color="#d4af37" />
                      )}
                      <span style={{ fontSize: '0.74rem', color: '#e2e8f0', fontWeight: 600, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {review.product_name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Headline & Commentary */}
                <div>
                  {review.title && (
                    <div style={{ fontWeight: 700, color: '#f5df93', fontSize: '0.84rem', marginBottom: '3px' }}>
                      "{review.title}"
                    </div>
                  )}
                  <div style={{ color: '#cbd5e1', fontSize: '0.80rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {review.comment}
                  </div>
                </div>

                {/* Actions Row */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  {review.video_url && (
                    <button
                      type="button"
                      onClick={() => handleWatchVideo(review)}
                      style={{
                        background: 'rgba(212, 175, 55, 0.15)',
                        border: '1px solid #d4af37',
                        color: '#f5df93',
                        borderRadius: '8px',
                        padding: '7px 14px',
                        fontSize: '0.76rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: 600
                      }}
                    >
                      <Play size={13} /> Watch Video
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(review)}
                    style={{
                      background: 'rgba(244, 63, 94, 0.15)',
                      border: '1px solid #f43f5e',
                      color: '#fda4af',
                      borderRadius: '8px',
                      padding: '7px 14px',
                      fontSize: '0.76rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: 600
                    }}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>

              </div>
            ))}
          </div>
        </>
      )}

      {/* 5. Add Review Modal */}
      {isAddModalOpen && (
        <div className="reviews-modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="reviews-submit-modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                color: '#cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10
              }}
              title="Close modal"
            >
              <X size={16} />
            </button>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f5df93', fontSize: '0.80rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                <Sparkles size={14} /> Admin Publishing Console
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: '#fff', margin: 0 }}>
                Publish New Patron Review
              </h3>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Type Switcher */}
              <div>
                <label style={{ fontSize: '0.78rem', color: '#f5df93', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Select Review Type
                </label>
                <div className="admin-reviews-form-grid-2col">
                  <button
                    type="button"
                    onClick={() => setNewReview(prev => ({ ...prev, review_type: 'video' }))}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
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
                    <Film size={15} /> 🎬 Video Wear-Test Review
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewReview(prev => ({ ...prev, review_type: 'written' }))}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
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
                    <MessageSquare size={15} /> ✍️ Written Review
                  </button>
                </div>
              </div>

              {/* Customer Name & Location */}
              <div className="admin-reviews-form-grid-2col">
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Reviewer / Patron Name *</label>
                  <input
                    type="text"
                    required
                    value={newReview.customer_name}
                    onChange={(e) => setNewReview(prev => ({ ...prev, customer_name: e.target.value }))}
                    placeholder="e.g. Vikram Singhania"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#fff',
                      fontSize: '0.82rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Location (City, State)</label>
                  <input
                    type="text"
                    value={newReview.customer_location}
                    onChange={(e) => setNewReview(prev => ({ ...prev, customer_location: e.target.value }))}
                    placeholder="e.g. Bandra, Mumbai"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#fff',
                      fontSize: '0.82rem'
                    }}
                  />
                </div>
              </div>

              {/* Product Selection & Star Rating */}
              <div className="admin-reviews-form-grid-prod-rating">
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Associated Fragrance</label>
                  <select
                    value={newReview.product_id}
                    onChange={(e) => setNewReview(prev => ({ ...prev, product_id: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      color: '#fff',
                      fontSize: '0.82rem'
                    }}
                  >
                    <option value="">General Boutique Experience</option>
                    {productsList.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Star Rating</label>
                  <select
                    value={newReview.rating}
                    onChange={(e) => setNewReview(prev => ({ ...prev, rating: Number(e.target.value) }))}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      color: '#f5df93',
                      fontSize: '0.82rem'
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

              {/* Video Specific: Upload or URL */}
              {newReview.review_type === 'video' && (
                <div style={{
                  padding: '12px',
                  background: 'rgba(212, 175, 55, 0.05)',
                  border: '1px dashed rgba(212, 175, 55, 0.35)',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <label style={{ fontSize: '0.78rem', color: '#f5df93', fontWeight: 700 }}>
                      Video File Upload or Direct Link *
                    </label>
                    <label
                      style={{
                        fontSize: '0.72rem',
                        color: '#d4af37',
                        background: 'rgba(212,175,55,0.15)',
                        border: '1px solid #d4af37',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Upload size={12} />
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
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'rgba(0,0,0,0.6)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      color: '#fff',
                      fontSize: '0.82rem'
                    }}
                  />

                  <div>
                    <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>
                      Video Poster / Thumbnail Image URL (Optional)
                    </label>
                    <input
                      type="text"
                      value={newReview.video_thumbnail}
                      onChange={(e) => setNewReview(prev => ({ ...prev, video_thumbnail: e.target.value }))}
                      placeholder="https://images.unsplash.com/..."
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '7px 10px',
                        borderRadius: '6px',
                        background: 'rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                        fontSize: '0.78rem'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Review Headline */}
              <div>
                <label style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Review Headline / Title</label>
                <input
                  type="text"
                  value={newReview.title}
                  onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Unbelievable sillage and presentation!"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#fff',
                    fontSize: '0.82rem'
                  }}
                />
              </div>

              {/* Detailed Review Commentary */}
              <div>
                <label style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Detailed Sensory Review *</label>
                <textarea
                  rows={3}
                  required
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Enter detailed wear-test commentary, notes, projection, and patron sentiment..."
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#fff',
                    fontSize: '0.82rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Verified Buyer and Featured Checkboxes */}
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.80rem', color: '#cbd5e1', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(newReview.is_verified_buyer)}
                    onChange={(e) => setNewReview(prev => ({ ...prev, is_verified_buyer: e.target.checked ? 1 : 0 }))}
                    style={{ accentColor: '#10b981' }}
                  />
                  <span>Verified Patron Badge</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.80rem', color: '#cbd5e1', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(newReview.is_featured)}
                    onChange={(e) => setNewReview(prev => ({ ...prev, is_featured: e.target.checked ? 1 : 0 }))}
                    style={{ accentColor: '#d4af37' }}
                  />
                  <span>Featured on Top</span>
                </label>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#cbd5e1',
                    fontSize: '0.84rem',
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
                    padding: '11px',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Save size={15} />
                  <span>{isSubmitting ? 'Publishing...' : 'Publish Patron Review'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 6. Video Preview Player Modal */}
      {previewVideoUrl && (
        <div className="reviews-modal-backdrop" onClick={() => setPreviewVideoUrl(null)}>
          <div style={{
            maxWidth: '650px',
            width: '100%',
            background: '#04060a',
            borderRadius: '16px',
            border: '1.5px solid #d4af37',
            overflow: 'hidden',
            position: 'relative'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f5df93', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Film size={15} /> Video Wear-Test Preview
              </span>
              <button
                type="button"
                onClick={() => setPreviewVideoUrl(null)}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                title="Close preview"
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <video
                src={previewVideoUrl}
                controls
                autoPlay
                playsInline
                style={{ width: '100%', maxHeight: '65vh', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 7. Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="reviews-modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <div style={{
            maxWidth: '420px',
            width: '100%',
            background: '#0d111a',
            border: '1px solid #f43f5e',
            borderRadius: '16px',
            padding: 'clamp(18px, 4vw, 24px)',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <AlertTriangle size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: '0 0 8px 0' }}>
              Delete Patron Review?
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 20px 0' }}>
              Are you sure you want to permanently delete the review from <strong>{deleteTarget.customer_name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#cbd5e1',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  background: '#f43f5e',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminReviewsTab;
