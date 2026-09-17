import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Film,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  CheckCircle2,
  MapPin,
  ThumbsUp,
  Droplets,
  ArrowRight,
  Share2,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

const StarRating = ({ rating = 5, size = 16, activeColor = '#d4af37', emptyColor = 'rgba(212, 175, 55, 0.2)' }) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          fill={star <= Math.round(rating) ? activeColor : 'transparent'}
          color={star <= Math.round(rating) ? activeColor : emptyColor}
          strokeWidth={1.8}
        />
      ))}
    </div>
  );
};

const VideoReviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [moreVideos, setMoreVideos] = useState([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const fetchReviewDetail = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/reviews/${id}`);
        if (res.data?.success && res.data?.review) {
          setReview(res.data.review);
          setLikesCount(res.data.review.likes_count || 0);
        }
      } catch (err) {
        console.error('Failed to load video review:', err);
        toast.error('Video review not found');
      } finally {
        setLoading(false);
      }
    };

    fetchReviewDetail();

    // Fetch other video reviews for discovery
    api.get('/reviews?type=video')
      .then(res => {
        if (res.data?.reviews) {
          setMoreVideos(res.data.reviews.filter(r => String(r.id) !== String(id)));
        }
      })
      .catch(() => {});
  }, [id]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    } else if (videoRef.current.webkitRequestFullscreen) {
      videoRef.current.webkitRequestFullscreen();
    }
  };

  const handleLike = async () => {
    if (hasLiked || !review) return;
    setHasLiked(true);
    setLikesCount(prev => prev + 1);
    try {
      await api.post(`/reviews/${review.id}/like`);
      toast.success('✨ Thank you for your feedback!');
    } catch (e) {
      // silent
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: review?.title || 'Video Fragrance Wear-Test',
          text: review?.comment || 'Check out this perfume video review',
          url: window.location.href
        });
      } catch (e) {
        // user cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.info('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#04060a', color: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <Sparkles size={36} color="#d4af37" className="animate-spin" style={{ marginBottom: '16px' }} />
        <div style={{ fontSize: '1rem', fontWeight: 600, color: '#f5df93' }}>Loading Cinematic Wear-Test...</div>
      </div>
    );
  }

  if (!review) {
    return (
      <div style={{ minHeight: '100vh', background: '#04060a', color: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
        <Film size={44} color="#d4af37" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontFamily: 'var(--font-serif)', color: '#fff', margin: '0 0 8px 0' }}>Video Review Not Found</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.86rem', margin: '0 0 20px 0' }}>The requested wear-test reel may have been updated or removed.</p>
        <button
          type="button"
          onClick={() => navigate('/reviews')}
          className="btn-luxury-gold"
          style={{ padding: '10px 22px', borderRadius: '10px', fontSize: '0.86rem', fontWeight: 700 }}
        >
          Return to All Reviews
        </button>
      </div>
    );
  }

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
        padding: '12px 16px',
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
            gap: '6px'
          }}
        >
          <ArrowLeft size={16} />
          <span>All Reviews</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={handleShare}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#cbd5e1',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Share review"
          >
            <Share2 size={15} />
          </button>
        </div>
      </div>

      {/* Main Reel Viewport Container */}
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '16px 14px 0' }}>
        
        {/* Video Player Card */}
        <div style={{
          position: 'relative',
          width: '100%',
          paddingTop: '130%', // Portrait 3:4 / Reel ratio
          background: '#000000',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1.5px solid rgba(212, 175, 55, 0.4)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)'
        }}>
          <video
            ref={videoRef}
            src={review.video_url}
            poster={review.video_thumbnail || (review.product_image || undefined)}
            loop
            playsInline
            muted={isMuted}
            onClick={togglePlay}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              cursor: 'pointer'
            }}
          />

          {/* Top Video Controls Overlay */}
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            right: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 4
          }}>
            <span style={{
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              color: '#f5df93',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <Film size={12} color="#d4af37" /> Wear-Test Reel
            </span>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={toggleMute}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} color="#d4af37" />}
              </button>

              <button
                type="button"
                onClick={handleFullscreen}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title="Fullscreen"
              >
                <Maximize2 size={15} />
              </button>
            </div>
          </div>

          {/* Center Play Overlay */}
          {!isPlaying && (
            <div
              onClick={togglePlay}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(212, 175, 55, 0.9)',
                border: '2px solid rgba(255, 255, 255, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#04060a',
                cursor: 'pointer',
                zIndex: 3,
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7)'
              }}
            >
              <Play size={28} style={{ marginLeft: '4px' }} />
            </div>
          )}

          {/* Bottom Gradient */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '80px',
            background: 'linear-gradient(to top, rgba(4, 6, 10, 0.95), transparent)',
            pointerEvents: 'none'
          }} />
        </div>

        {/* Patron & Impression Details Card */}
        <div style={{
          marginTop: '16px',
          background: 'linear-gradient(180deg, rgba(16, 20, 31, 0.95) 0%, rgba(10, 13, 20, 0.98) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          borderRadius: '20px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)'
        }}>
          
          {/* Patron Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {review.customer_avatar ? (
                <img
                  src={review.customer_avatar}
                  alt={review.customer_name}
                  style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #d4af37' }}
                />
              ) : (
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.3) 0%, rgba(212, 175, 55, 0.1) 100%)',
                  border: '1.5px solid #d4af37',
                  color: '#f5df93',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.94rem'
                }}>
                  {(review.customer_name || 'P')[0]?.toUpperCase()}
                </div>
              )}

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.96rem', fontWeight: 700, color: '#f8fafc' }}>
                    {review.customer_name || 'Verified Patron'}
                  </span>
                  {review.is_verified_buyer ? (
                    <span title="Verified Patron Purchase" style={{ color: '#10b981', display: 'inline-flex' }}>
                      <CheckCircle2 size={15} />
                    </span>
                  ) : null}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#94a3b8', marginTop: '1px' }}>
                  {review.customer_location && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <MapPin size={11} color="#d4af37" /> {review.customer_location} •
                    </span>
                  )}
                  <span>{new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </div>

            <StarRating rating={review.rating || 5} size={16} />
          </div>

          {/* Title & Commentary */}
          <div>
            {review.title && (
              <h3 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.15rem',
                color: '#f5df93',
                fontWeight: 700,
                lineHeight: 1.3,
                margin: '0 0 8px 0'
              }}>
                "{review.title}"
              </h3>
            )}
            <p style={{
              fontSize: '0.88rem',
              color: '#cbd5e1',
              lineHeight: 1.6,
              margin: 0
            }}>
              {review.comment}
            </p>
          </div>

          {/* Featured Fragrance Box */}
          {review.product_name && (
            <Link
              to={`/product/${review.product_slug || review.product_id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                background: 'rgba(212, 175, 55, 0.08)',
                border: '1px solid rgba(212, 175, 55, 0.28)',
                borderRadius: '14px',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {review.product_image ? (
                <img
                  src={review.product_image}
                  alt={review.product_name}
                  style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              ) : (
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Droplets size={18} color="#d4af37" />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.68rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                  Featured Fragrance Flacon
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {review.product_name}
                </div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #b89628 100%)',
                color: '#04060a',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.74rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span>Shop</span>
                <ArrowRight size={12} />
              </div>
            </Link>
          )}

          {/* Helpful Like Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
              Did this video wear-test help you?
            </span>
            <button
              type="button"
              onClick={handleLike}
              style={{
                background: hasLiked ? 'rgba(212, 175, 55, 0.22)' : 'rgba(255, 255, 255, 0.05)',
                border: hasLiked ? '1px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.15)',
                color: hasLiked ? '#f5df93' : '#cbd5e1',
                borderRadius: '9999px',
                padding: '6px 14px',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ThumbsUp size={13} color={hasLiked ? '#d4af37' : '#cbd5e1'} />
              <span>Helpful ({likesCount})</span>
            </button>
          </div>

        </div>

        {/* More Video Wear-Tests Gallery */}
        {moreVideos.length > 0 && (
          <div style={{ marginTop: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Film size={18} color="#d4af37" />
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: '#fff', margin: 0 }}>
                  More Video Wear-Tests
                </h3>
              </div>
              <button
                type="button"
                onClick={() => navigate('/reviews')}
                style={{ background: 'none', border: 'none', color: '#f5df93', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span>View All</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '12px'
            }}>
              {moreVideos.slice(0, 4).map(v => (
                <div
                  key={v.id}
                  onClick={() => navigate(`/reviews/video/${v.id}`)}
                  style={{
                    position: 'relative',
                    paddingTop: '130%',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: '#04060a',
                    border: '1px solid rgba(212, 175, 55, 0.25)',
                    cursor: 'pointer'
                  }}
                >
                  <video
                    src={v.video_url}
                    poster={v.video_thumbnail || (v.product_image || undefined)}
                    muted
                    playsInline
                    preload="metadata"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)' }} />
                  <div style={{ position: 'absolute', bottom: '8px', left: '8px', right: '8px' }}>
                    <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {v.customer_name}
                    </div>
                    <div style={{ fontSize: '0.66rem', color: '#f5df93', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      ★ {v.rating}.0 • Wear-Test
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default VideoReviewDetail;
