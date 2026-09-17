import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Film,
  MessageSquare,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  CheckCircle2,
  ShieldCheck,
  Award,
  Sparkles,
  Heart,
  Search,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  X,
  Send,
  Upload,
  User,
  MapPin,
  Clock,
  ArrowRight,
  ExternalLink,
  ThumbsUp,
  Droplets
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

// Helper component for star ratings
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

// Interactive Video Review Card Component
const VideoReviewCard = ({ review, onOpenModal, onLike }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(review.likes_count || 0);

  const handleOpen = () => {
    if (window.innerWidth <= 768) {
      navigate(`/reviews/video/${review.id}`);
    } else if (onOpenModal) {
      onOpenModal(review);
    }
  };

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn('Playback error:', err);
      });
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleLikeClick = async (e) => {
    e.stopPropagation();
    if (hasLiked) return;
    setHasLiked(true);
    setLikesCount(prev => prev + 1);
    try {
      await api.post(`/reviews/${review.id}/like`);
    } catch (err) {
      // silent fallback
    }
  };

  return (
    <div
      className="video-review-card"
      style={{
        background: 'linear-gradient(180deg, rgba(16, 20, 31, 0.95) 0%, rgba(8, 10, 16, 0.98) 100%)',
        border: '1px solid rgba(212, 175, 55, 0.22)',
        borderRadius: '20px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.55)',
        transition: 'transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
        position: 'relative'
      }}
    >
      {/* Video Viewport Container (Portrait 4:5 / Reel Aspect) */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '120%', // 5:6 vertical reel aspect
          background: '#04060a',
          cursor: 'pointer',
          overflow: 'hidden'
        }}
        onClick={handleOpen}
      >
        <video
          ref={videoRef}
          src={review.video_url}
          poster={review.video_thumbnail || (review.product_image || undefined)}
          loop
          muted={isMuted}
          playsInline
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />

        {/* Top Badges Overlay */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          right: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 3
        }}>
          <span style={{
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            color: '#f5df93',
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            letterSpacing: '0.04em'
          }}>
            <Film size={12} color="#d4af37" /> Video Wear-Test
          </span>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={toggleMute}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title={isMuted ? 'Unmute Video' : 'Mute Video'}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} color="#d4af37" />}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleOpen();
              }}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Fullscreen Cinematic View"
            >
              <Maximize2 size={14} />
            </button>
          </div>
        </div>

        {/* Center Play Button Overlay */}
        <div
          onClick={togglePlay}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: isPlaying ? 'rgba(0, 0, 0, 0.35)' : 'rgba(212, 175, 55, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '2px solid rgba(255, 255, 255, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isPlaying ? '#fff' : '#04060a',
            cursor: 'pointer',
            zIndex: 2,
            transition: 'all 0.2s ease',
            opacity: isPlaying ? 0 : 1
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.08)';
          }}
          onMouseLeave={(e) => {
            if (isPlaying) e.currentTarget.style.opacity = '0';
            e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
          }}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: '3px' }} />}
        </div>

        {/* Bottom subtle gradient */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: 'linear-gradient(to top, rgba(8, 10, 16, 0.95), transparent)',
          pointerEvents: 'none'
        }} />
      </div>

      {/* Review Content & Patron Details */}
      <div style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', flex: 1, gap: '14px' }}>
        
        {/* Reviewer Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {review.customer_avatar ? (
              <img
                src={review.customer_avatar}
                alt={review.customer_name}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1.5px solid #d4af37'
                }}
              />
            ) : (
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.3) 0%, rgba(212, 175, 55, 0.1) 100%)',
                border: '1.5px solid #d4af37',
                color: '#f5df93',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.86rem'
              }}>
                {(review.customer_name || 'P')[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                  {review.customer_name || 'Verified Patron'}
                </span>
                {review.is_verified_buyer ? (
                  <span title="Verified Patron Purchase" style={{ color: '#10b981', display: 'inline-flex' }}>
                    <CheckCircle2 size={14} />
                  </span>
                ) : null}
              </div>
              {review.customer_location && (
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '1px' }}>
                  <MapPin size={11} color="#d4af37" />
                  <span>{review.customer_location}</span>
                </div>
              )}
            </div>
          </div>

          <StarRating rating={review.rating || 5} size={14} />
        </div>

        {/* Review Title & Commentary */}
        <div>
          {review.title && (
            <h4 style={{
              fontSize: '0.94rem',
              fontWeight: 700,
              color: '#f5df93',
              fontFamily: 'var(--font-serif)',
              margin: '0 0 6px 0',
              lineHeight: 1.3
            }}>
              "{review.title}"
            </h4>
          )}
          <p style={{
            fontSize: '0.84rem',
            color: '#cbd5e1',
            lineHeight: 1.55,
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {review.comment}
          </p>
        </div>

        {/* Associated Perfume Pill (if present) */}
        {review.product_name && (
          <Link
            to={`/product/${review.product_slug || review.product_id}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              background: 'rgba(212, 175, 55, 0.08)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              borderRadius: '12px',
              textDecoration: 'none',
              marginTop: 'auto',
              transition: 'background 0.2s ease, border-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(212, 175, 55, 0.16)';
              e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(212, 175, 55, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.25)';
            }}
          >
            {review.product_image ? (
              <img
                src={review.product_image}
                alt={review.product_name}
                style={{ width: '34px', height: '34px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            ) : (
              <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Droplets size={16} color="#d4af37" />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.68rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                Featured Flacon
              </div>
              <div style={{ fontSize: '0.80rem', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {review.product_name}
              </div>
            </div>
            <ArrowRight size={14} color="#d4af37" />
          </Link>
        )}

        {/* Footer: Date & Helpful button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '8px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: '0.74rem',
          color: '#94a3b8'
        }}>
          <span>
            {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>

          <button
            type="button"
            onClick={handleLikeClick}
            style={{
              background: hasLiked ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
              border: hasLiked ? '1px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.15)',
              color: hasLiked ? '#f5df93' : '#94a3b8',
              borderRadius: '9999px',
              padding: '3px 10px',
              fontSize: '0.72rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.2s ease'
            }}
          >
            <ThumbsUp size={12} color={hasLiked ? '#d4af37' : '#94a3b8'} />
            <span>Helpful ({likesCount})</span>
          </button>
        </div>

      </div>
    </div>
  );
};

// Written Review Card Component
const WrittenReviewCard = ({ review }) => {
  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(review.likes_count || 0);

  const handleLikeClick = async () => {
    if (hasLiked) return;
    setHasLiked(true);
    setLikesCount(prev => prev + 1);
    try {
      await api.post(`/reviews/${review.id}/like`);
    } catch (err) {
      // silent
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(180deg, rgba(16, 20, 31, 0.90) 0%, rgba(10, 13, 20, 0.96) 100%)',
      border: '1px solid rgba(212, 175, 55, 0.20)',
      borderRadius: '20px',
      padding: 'clamp(16px, 3vw, 24px)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)',
      position: 'relative',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box'
    }}>
      {/* Top row: Patron Info & Stars */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {review.customer_avatar ? (
            <img
              src={review.customer_avatar}
              alt={review.customer_name}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1.5px solid #d4af37'
              }}
            />
          ) : (
            <div style={{
              width: '44px',
              height: '44px',
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
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', fontSize: '0.74rem', color: '#94a3b8' }}>
              {review.customer_location && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <MapPin size={11} color="#d4af37" /> {review.customer_location}
                </span>
              )}
              <span>•</span>
              <span>{new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        <StarRating rating={review.rating || 5} size={15} />
      </div>

      {/* Review Title & Content */}
      <div>
        {review.title && (
          <h4 style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: '#f5df93',
            fontFamily: 'var(--font-serif)',
            margin: '0 0 8px 0',
            lineHeight: 1.35
          }}>
            "{review.title}"
          </h4>
        )}
        <p style={{
          fontSize: '0.88rem',
          color: '#cbd5e1',
          lineHeight: 1.65,
          margin: 0
        }}>
          {review.comment}
        </p>
      </div>

      {/* Associated Perfume Pill (if present) */}
      {review.product_name && (
        <Link
          to={`/product/${review.product_slug || review.product_id}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 12px',
            background: 'rgba(212, 175, 55, 0.08)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: '12px',
            textDecoration: 'none',
            marginTop: 'auto',
            transition: 'background 0.2s ease, border-color 0.2s ease'
          }}
        >
          {review.product_image ? (
            <img
              src={review.product_image}
              alt={review.product_name}
              style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Droplets size={15} color="#d4af37" />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.66rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
              Reviewed Fragrance
            </div>
            <div style={{ fontSize: '0.80rem', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {review.product_name}
            </div>
          </div>
          <ArrowRight size={13} color="#d4af37" />
        </Link>
      )}

      {/* Helpful Upvote Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '6px' }}>
        <button
          type="button"
          onClick={handleLikeClick}
          style={{
            background: hasLiked ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.04)',
            border: hasLiked ? '1px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.12)',
            color: hasLiked ? '#f5df93' : '#94a3b8',
            borderRadius: '9999px',
            padding: '4px 12px',
            fontSize: '0.74rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.2s ease'
          }}
        >
          <ThumbsUp size={13} color={hasLiked ? '#d4af37' : '#94a3b8'} />
          <span>Helpful ({likesCount})</span>
        </button>
      </div>
    </div>
  );
};

// Fullscreen Cinematic Video Modal Player
const VideoPlayerModal = ({ review, onClose }) => {
  const modalVideoRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!review) return null;

  return (
    <div className="reviews-modal-backdrop" onClick={onClose}>
      <div className="reviews-video-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 20
          }}
          title="Close modal"
        >
          <X size={20} />
        </button>

        <div className="reviews-video-modal-body">
          {/* Video Player */}
          <div className="reviews-video-modal-player">
            <video
              ref={modalVideoRef}
              src={review.video_url}
              controls
              autoPlay
              playsInline
              style={{ width: '100%', maxHeight: '75vh', objectFit: 'contain' }}
            />
          </div>

          {/* Details Column */}
          <div className="reviews-video-modal-info">
            <div>
              {/* Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <span style={{
                  background: 'rgba(212, 175, 55, 0.15)',
                  border: '1px solid rgba(212, 175, 55, 0.5)',
                  color: '#f5df93',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em'
                }}>
                  🎬 Patron Video Wear-Test
                </span>
                <StarRating rating={review.rating || 5} size={15} />
              </div>

              {/* Title & Comment */}
              <h3 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.25rem',
                color: '#ffffff',
                fontWeight: 700,
                lineHeight: 1.3,
                margin: '0 0 12px 0'
              }}>
                "{review.title || 'Exceptional Fragrance Experience'}"
              </h3>

              <p style={{ fontSize: '0.90rem', color: '#cbd5e1', lineHeight: 1.65, margin: '0 0 20px 0' }}>
                {review.comment}
              </p>

              {/* Reviewer Details */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                {review.customer_avatar ? (
                  <img src={review.customer_avatar} alt={review.customer_name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.2)', color: '#f5df93', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {(review.customer_name || 'P')[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '0.90rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {review.customer_name}
                    {review.is_verified_buyer ? <CheckCircle2 size={14} color="#10b981" /> : null}
                  </div>
                  {review.customer_location && (
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{review.customer_location}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Product link if available */}
            {review.product_name && (
              <div style={{ marginTop: '24px' }}>
                <Link
                  to={`/product/${review.product_slug || review.product_id}`}
                  onClick={onClose}
                  className="btn-luxury-gold"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.86rem'
                  }}
                >
                  <Droplets size={16} />
                  <span>Discover {review.product_name}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Reviews Page
const Reviews = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    videoCount: 0,
    writtenCount: 0,
    avgRating: 5.0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [loading, setLoading] = useState(true);

  // Filters State
  const [activeTypeTab, setActiveTypeTab] = useState('all'); // 'all' | 'video' | 'written'
  const [selectedRating, setSelectedRating] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [productsList, setProductsList] = useState([]);

  // Modal States
  const [activeVideoModal, setActiveVideoModal] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Submission Form State
  const [submitForm, setSubmitForm] = useState({
    review_type: 'written',
    rating: 5,
    title: '',
    comment: '',
    product_id: '',
    video_url: '',
    customer_name: '',
    customer_location: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch initial data
  useEffect(() => {
    // 1. Fetch products for dropdown filter
    api.get('/products?limit=100')
      .then(res => {
        if (res.data?.products) setProductsList(res.data.products);
      })
      .catch(() => {});
  }, []);

  // Fetch reviews based on active filters
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeTypeTab !== 'all') params.append('type', activeTypeTab);
      if (selectedRating !== 'all') params.append('rating', selectedRating);
      if (selectedProduct !== 'all') params.append('productId', selectedProduct);
      if (sortBy) params.append('sort', sortBy);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await api.get(`/reviews?${params.toString()}`);
      if (res.data?.success) {
        setReviews(res.data.reviews || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
      toast.error('Failed to load patron reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [activeTypeTab, selectedRating, selectedProduct, sortBy]);

  // Handle live search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReviews();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle Patron Review Submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!submitForm.comment.trim()) {
      toast.error('Please enter your review commentary');
      return;
    }
    if (submitForm.review_type === 'video' && !submitForm.video_url.trim()) {
      toast.error('Please provide a direct video URL');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        ...submitForm,
        rating: Number(submitForm.rating),
        product_id: submitForm.product_id ? Number(submitForm.product_id) : null
      };

      const res = await api.post('/reviews', payload);
      if (res.data?.success) {
        toast.success(res.data.message || '✨ Thank you! Your review has been submitted.');
        setIsSubmitModalOpen(false);
        setSubmitForm({
          review_type: 'written',
          rating: 5,
          title: '',
          comment: '',
          product_id: '',
          video_url: '',
          customer_name: '',
          customer_location: ''
        });
        fetchReviews();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary, #04060a)', color: '#f8fafc', paddingBottom: '80px' }}>
      
      {/* 1. Hero Banner: The Patron Chronicles */}
      <section className="reviews-hero-section">
        <div className="reviews-hero-container">
          
          {/* Eyebrow */}
          <div className="reviews-eyebrow-pill">
            <Sparkles size={13} color="#d4af37" />
            <span>The Patron Chronicles • Verified Wear-Tests</span>
          </div>

          <h1 className="reviews-hero-title">
            Real Fragrance Stories. Bespoke Impressions.
          </h1>

          <p className="reviews-hero-desc">
            Discover unfiltered video unboxings, skin wear-tests, and poetic sensory critiques shared by our connoisseurs worldwide.
          </p>

          {/* Aggregate Rating Scoreboard Card */}
          <div className="reviews-scoreboard-card">
            {/* Left: Overall Rating */}
            <div className="reviews-score-col">
              <div className="reviews-score-number">
                {stats.avgRating.toFixed(1)}
              </div>
              <div style={{ margin: '8px 0 4px' }}>
                <StarRating rating={stats.avgRating} size={20} />
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', letterSpacing: '0.04em' }}>
                Based on <strong style={{ color: '#fff' }}>{stats.total}</strong> Verified Patron Reviews
              </div>
            </div>

            {/* Middle: Breakdown & Metrics */}
            <div className="reviews-breakdown-col">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.80rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#e2e8f0' }}>
                  <Film size={14} color="#d4af37" /> Video Wear-Tests
                </span>
                <span style={{ fontWeight: 700, color: '#f5df93' }}>{stats.videoCount}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.80rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#e2e8f0' }}>
                  <MessageSquare size={14} color="#60a5fa" /> Written Reviews
                </span>
                <span style={{ fontWeight: 700, color: '#f5df93' }}>{stats.writtenCount}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.80rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#e2e8f0' }}>
                  <ShieldCheck size={14} color="#10b981" /> Authenticity Guarantee
                </span>
                <span style={{ fontWeight: 700, color: '#10b981' }}>100% Proven</span>
              </div>
            </div>

            {/* Right: CTA to submit review */}
            <div className="reviews-cta-col">
              <button
                type="button"
                onClick={() => {
                  if (window.innerWidth <= 768) {
                    navigate('/reviews/new');
                  } else {
                    setIsSubmitModalOpen(true);
                  }
                }}
                className="btn-luxury-gold"
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: '14px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Sparkles size={16} />
                <span>Share Your Scent Story</span>
              </button>
              <span style={{ fontSize: '0.70rem', color: '#64748b' }}>
                Patron reviews undergo batch verification
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Main Reviews Showcase & Interactive Filter Navigation */}
      <section className="reviews-main-section">
        
        {/* Navigation Switcher: All / Video Reviews / Written Reviews */}
        <div className="reviews-toolbar-container">
          {/* Type Tab Buttons */}
          <div className="reviews-type-tabs">
            <button
              type="button"
              onClick={() => setActiveTypeTab('all')}
              className="reviews-type-tab-btn"
              style={{
                background: activeTypeTab === 'all' ? 'linear-gradient(135deg, #d4af37 0%, #b89628 100%)' : 'transparent',
                color: activeTypeTab === 'all' ? '#04060a' : '#cbd5e1'
              }}
            >
              <span>All Reviews</span>
              <span style={{
                background: activeTypeTab === 'all' ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.1)',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '0.72rem'
              }}>
                {stats.total}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTypeTab('video')}
              className="reviews-type-tab-btn"
              style={{
                background: activeTypeTab === 'video' ? 'linear-gradient(135deg, #d4af37 0%, #b89628 100%)' : 'transparent',
                color: activeTypeTab === 'video' ? '#04060a' : '#cbd5e1'
              }}
            >
              <Film size={15} />
              <span>Video Reviews</span>
              <span style={{
                background: activeTypeTab === 'video' ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.1)',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '0.72rem'
              }}>
                {stats.videoCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTypeTab('written')}
              className="reviews-type-tab-btn"
              style={{
                background: activeTypeTab === 'written' ? 'linear-gradient(135deg, #d4af37 0%, #b89628 100%)' : 'transparent',
                color: activeTypeTab === 'written' ? '#04060a' : '#cbd5e1'
              }}
            >
              <MessageSquare size={15} />
              <span>Written Reviews</span>
              <span style={{
                background: activeTypeTab === 'written' ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.1)',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '0.72rem'
              }}>
                {stats.writtenCount}
              </span>
            </button>
          </div>

          {/* Quick Search & Sort Filters */}
          <div className="reviews-filter-controls">
            
            {/* Search Input */}
            <div className="reviews-search-wrapper">
              <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reviews..."
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '9px 12px 9px 34px',
                  borderRadius: '12px',
                  background: 'rgba(16, 20, 31, 0.8)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  color: '#fff',
                  fontSize: '0.82rem',
                  outline: 'none'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Star Rating Filter */}
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="reviews-select-filter"
            >
              <option value="all">All Star Ratings</option>
              <option value="5">5 Stars Only</option>
              <option value="4">4 Stars & Above</option>
              <option value="3">3 Stars</option>
            </select>

            {/* Fragrance Filter */}
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="reviews-select-filter"
              style={{ maxWidth: '180px' }}
            >
              <option value="all">All Fragrances</option>
              {productsList.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="reviews-select-filter"
              style={{ color: '#cbd5e1' }}
            >
              <option value="newest">Newest First</option>
              <option value="highest">Highest Rating</option>
              <option value="helpful">Most Helpful</option>
              <option value="lowest">Lowest Rating</option>
            </select>

          </div>
        </div>

        {/* 3. Review Cards Display */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#d4af37' }}>
            <Sparkles size={32} className="animate-spin" style={{ margin: '0 auto 16px' }} />
            <div style={{ fontSize: '1rem', fontWeight: 600 }}>Curating Patron Impressions...</div>
          </div>
        ) : reviews.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: 'rgba(16, 20, 31, 0.4)',
            border: '1px dashed rgba(212, 175, 55, 0.3)',
            borderRadius: '24px'
          }}>
            <MessageSquare size={44} color="#d4af37" style={{ margin: '0 auto 14px' }} />
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', color: '#fff', margin: '0 0 8px 0' }}>
              No Reviews Found for the Selected Filter
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#94a3b8', margin: '0 0 20px 0' }}>
              Try clearing your filters or be the first to share your experience!
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveTypeTab('all');
                setSelectedRating('all');
                setSelectedProduct('all');
                setSearchQuery('');
              }}
              style={{
                background: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid #d4af37',
                color: '#f5df93',
                padding: '8px 18px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div>
            {/* If All is selected and has video reviews, display video reviews first in high impact grid */}
            {activeTypeTab === 'video' ? (
              <div className="reviews-video-grid">
                {reviews.map(review => (
                  <VideoReviewCard
                    key={review.id}
                    review={review}
                    onOpenModal={(r) => setActiveVideoModal(r)}
                  />
                ))}
              </div>
            ) : activeTypeTab === 'written' ? (
              <div className="reviews-written-grid">
                {reviews.map(review => (
                  <WrittenReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              /* All Reviews View: Split into Featured Video Reviews & Written Reviews */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                
                {/* Video Reviews Section */}
                {reviews.some(r => r.review_type === 'video') && (
                  <div>
                    <div className="reviews-section-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Film size={20} color="#d4af37" />
                        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#fff', margin: 0 }}>
                          Patron Video Unboxings & Skin Tests
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTypeTab('video')}
                        style={{ background: 'none', border: 'none', color: '#f5df93', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <span>View All Videos ({stats.videoCount})</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>

                    <div className="reviews-video-grid">
                      {reviews.filter(r => r.review_type === 'video').map(review => (
                        <VideoReviewCard
                          key={review.id}
                          review={review}
                          onOpenModal={(r) => setActiveVideoModal(r)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Written Reviews Section */}
                {reviews.some(r => r.review_type === 'written') && (
                  <div>
                    <div className="reviews-section-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MessageSquare size={20} color="#60a5fa" />
                        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#fff', margin: 0 }}>
                          Written Sensory Impressions
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTypeTab('written')}
                        style={{ background: 'none', border: 'none', color: '#f5df93', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <span>View All Written ({stats.writtenCount})</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>

                    <div className="reviews-written-grid">
                      {reviews.filter(r => r.review_type === 'written').map(review => (
                        <WrittenReviewCard key={review.id} review={review} />
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        )}

      </section>

      {/* 4. Fullscreen Video Modal */}
      {activeVideoModal && (
        <VideoPlayerModal
          review={activeVideoModal}
          onClose={() => setActiveVideoModal(null)}
        />
      )}

      {/* 5. Submit Review Modal for Patrons */}
      {isSubmitModalOpen && (
        <div className="reviews-modal-backdrop" onClick={() => setIsSubmitModalOpen(false)}>
          <div className="reviews-submit-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(false)}
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

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid #d4af37', color: '#f5df93', marginBottom: '12px' }}>
                <Sparkles size={24} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#fff', margin: '0 0 6px 0' }}>
                Share Your Olfactory Impression
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>
                Your sensory review guides fellow fragrance enthusiasts worldwide.
              </p>
            </div>

            <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Type Switcher: Written vs Video */}
              <div>
                <label style={{ fontSize: '0.78rem', color: '#f5df93', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Review Format
                </label>
                <div className="reviews-form-row-2col">
                  <button
                    type="button"
                    onClick={() => setSubmitForm(prev => ({ ...prev, review_type: 'written' }))}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: submitForm.review_type === 'written' ? '1.5px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                      background: submitForm.review_type === 'written' ? 'rgba(212, 175, 55, 0.18)' : 'rgba(255,255,255,0.03)',
                      color: submitForm.review_type === 'written' ? '#f5df93' : '#cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <MessageSquare size={14} /> Written Review
                  </button>

                  <button
                    type="button"
                    onClick={() => setSubmitForm(prev => ({ ...prev, review_type: 'video' }))}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: submitForm.review_type === 'video' ? '1.5px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                      background: submitForm.review_type === 'video' ? 'rgba(212, 175, 55, 0.18)' : 'rgba(255,255,255,0.03)',
                      color: submitForm.review_type === 'video' ? '#f5df93' : '#cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Film size={14} /> Video Unboxing Reel
                  </button>
                </div>
              </div>

              {/* Fragrance selector */}
              <div>
                <label style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                  Select Perfume (Optional)
                </label>
                <select
                  value={submitForm.product_id}
                  onChange={(e) => setSubmitForm(prev => ({ ...prev, product_id: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    color: '#fff',
                    fontSize: '0.84rem'
                  }}
                >
                  <option value="">General Boutique Experience</option>
                  {productsList.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Star Rating Selector */}
              <div>
                <label style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                  Your Rating
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSubmitForm(prev => ({ ...prev, rating: star }))}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      <Star
                        size={26}
                        fill={star <= submitForm.rating ? '#d4af37' : 'transparent'}
                        color={star <= submitForm.rating ? '#d4af37' : 'rgba(212, 175, 55, 0.3)'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Reviewer Name & Location */}
              <div className="reviews-form-row-2col">
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Your Name</label>
                  <input
                    type="text"
                    value={submitForm.customer_name}
                    onChange={(e) => setSubmitForm(prev => ({ ...prev, customer_name: e.target.value }))}
                    placeholder={user?.name || "e.g. Vikram Singhania"}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#fff',
                      fontSize: '0.84rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>City / Location</label>
                  <input
                    type="text"
                    value={submitForm.customer_location}
                    onChange={(e) => setSubmitForm(prev => ({ ...prev, customer_location: e.target.value }))}
                    placeholder="e.g. Mumbai, India"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#fff',
                      fontSize: '0.84rem'
                    }}
                  />
                </div>
              </div>

              {/* If Video review, Video URL */}
              {submitForm.review_type === 'video' && (
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#f5df93', display: 'block', marginBottom: '4px' }}>
                    Direct Video Link (.mp4 / Cloudinary / Reel link)
                  </label>
                  <input
                    type="text"
                    value={submitForm.video_url}
                    onChange={(e) => setSubmitForm(prev => ({ ...prev, video_url: e.target.value }))}
                    placeholder="https://... or /videos/luxury-perfume.mp4"
                    required
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(212, 175, 55, 0.4)',
                      color: '#fff',
                      fontSize: '0.84rem'
                    }}
                  />
                </div>
              )}

              {/* Review Title */}
              <div>
                <label style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Review Headline</label>
                <input
                  type="text"
                  value={submitForm.title}
                  onChange={(e) => setSubmitForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Masterpiece with 12+ hr longevity"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#fff',
                    fontSize: '0.84rem'
                  }}
                />
              </div>

              {/* Detailed Review Commentary */}
              <div>
                <label style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                  Sensory Critique & Impressions *
                </label>
                <textarea
                  rows={4}
                  value={submitForm.comment}
                  onChange={(e) => setSubmitForm(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Describe the opening notes, dry-down, sillage projection, and packaging..."
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#fff',
                    fontSize: '0.84rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-luxury-gold"
                style={{
                  marginTop: '10px',
                  padding: '14px',
                  borderRadius: '12px',
                  fontSize: '0.90rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Send size={16} />
                <span>{isSubmitting ? 'Publishing Impression...' : 'Publish Patron Review'}</span>
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Reviews;
