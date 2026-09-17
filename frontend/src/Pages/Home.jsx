import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

import { 
  Sparkles, 
  ArrowRight, 
  Flame, 
  Award, 
  Compass, 
  Copy, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Film,
  Tag,
  Gift
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import FragrancePyramid from '../components/FragrancePyramid';
import QuickViewModal from '../components/QuickViewModal';
import { toast } from 'react-toastify';

const DEFAULT_BANNER_CONFIG = {
  showHeroSwiper: true,
  showVideoBanner: true,
  showImageBanner: true,
  heroSlides: [
    {
      id: 'slide-1',
      active: true,
      tag: 'LUXURY PERFUMES 2026',
      title: 'The Alchemy of Rare Notes &',
      highlight: 'Pure Perfumes',
      description: 'Immerse your senses in handcrafted compositions of Mysore Sandalwood, Grasse Rose, and Bourbon Vanilla.',
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1920&q=85',
      primaryBtnText: 'Explore Fragrances',
      primaryBtnLink: '/shop',
      secondaryBtnText: 'Discover Collections',
      secondaryBtnLink: '/shop'
    },
    {
      id: 'slide-2',
      active: true,
      tag: 'HIGH CONCENTRATION PARFUM',
      title: 'Unrivaled Scent Trail,',
      highlight: 'Eternal Elegance',
      description: 'Featuring iconic elixirs and master-crafted bottles that linger gracefully for 12+ hours with radiant complexity.',
      image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1920&q=85',
      primaryBtnText: 'Explore Concentrates',
      primaryBtnLink: '/shop?category=niche-extrait',
      secondaryBtnText: 'Shop Men',
      secondaryBtnLink: '/shop?gender=Men'
    },
    {
      id: 'slide-3',
      active: true,
      tag: 'OFFICIAL LUXURY BOUTIQUE',
      title: 'Curated From',
      highlight: 'Prestige Brands',
      description: 'Dior, Chanel, Tom Ford, Creed, and Maison Francis Kurkdjian in climate-controlled artisanal presentation.',
      image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1920&q=85',
      primaryBtnText: 'Shop Women',
      primaryBtnLink: '/shop?gender=Women',
      secondaryBtnText: 'Our Brand Story',
      secondaryBtnLink: '/about'
    }
  ],
  videoBanner: {
    enabled: true,
    tag: 'CINEMATIC EXPERIENCE',
    title: 'The Art of Haute Parfumerie in Motion',
    highlight: 'Pure Elegance',
    description: 'Witness the craftsmanship of rare natural distillations. Every drop is curated with aged agarwood, French jasmine, and amber resin.',
    videoUrl: '/videos/luxury-perfume.mp4',
    posterImage: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1920&q=85',
    primaryBtnText: 'Discover Masterpieces',
    primaryBtnLink: '/shop',
    badgeText: '4K Ultra Cinema Edition',
    autoplay: true,
    loop: true,
    muted: true
  },
  imageBanner: {
    enabled: true,
    tag: 'EXCLUSIVE PRIVATE RESERVE',
    title: 'Rare Amber & Black Saffron Flacons',
    highlight: 'Handcrafted Perfection',
    description: 'Limited production batches numbered by master perfumers. Enjoy complimentary travel atomizers with every order.',
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1600&q=85',
    primaryBtnText: 'Shop Private Reserve',
    primaryBtnLink: '/shop',
    discountBadge: 'COMPLIMENTARY LUXURY ATOMIZER'
  }
};

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [activeTab, setActiveTab] = useState('bestsellers');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [bannerConfig, setBannerConfig] = useState(DEFAULT_BANNER_CONFIG);

  // Video Banner Player State
  const videoRef = useRef(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  // Bulletproof infinite loop video autoplay
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    videoEl.defaultMuted = true;
    videoEl.muted = true;
    videoEl.loop = true;
    videoEl.playsInline = true;

    const tryPlay = () => {
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsVideoPlaying(true);
          })
          .catch((err) => {
            console.log('Autoplay waiting for interaction:', err);
            // Ensure play starts on first user touch/scroll/click
            const resumeOnInteraction = () => {
              videoEl.play().then(() => setIsVideoPlaying(true)).catch(() => {});
              window.removeEventListener('click', resumeOnInteraction);
              window.removeEventListener('scroll', resumeOnInteraction);
              window.removeEventListener('touchstart', resumeOnInteraction);
            };
            window.addEventListener('click', resumeOnInteraction, { once: true });
            window.addEventListener('scroll', resumeOnInteraction, { once: true });
            window.addEventListener('touchstart', resumeOnInteraction, { once: true });
          });
      }
    };

    tryPlay();
  }, [bannerConfig.videoBanner?.videoUrl]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featRes, newRes, bestRes, catRes, brandRes, bannerRes] = await Promise.all([
          api.get('/products/featured').catch(() => ({ data: { products: [] } })),
          api.get('/products/new-arrivals').catch(() => ({ data: { products: [] } })),
          api.get('/products/best-sellers').catch(() => ({ data: { products: [] } })),
          api.get('/categories').catch(() => ({ data: { categories: [] } })),
          api.get('/brands').catch(() => ({ data: { brands: [] } })),
          api.get('/banners/config').catch(() => ({ data: { config: DEFAULT_BANNER_CONFIG } }))
        ]);

        if (featRes.data.products) setFeaturedProducts(featRes.data.products);
        if (newRes.data.products) setNewArrivals(newRes.data.products);
        if (bestRes.data.products) setBestSellers(bestRes.data.products);
        if (catRes.data.categories) setCategories(catRes.data.categories);
        if (brandRes.data.brands) setBrands(brandRes.data.brands);
        if (bannerRes.data?.config) setBannerConfig(bannerRes.data.config);
      } catch (err) {
        console.error('Error loading home data:', err);
      }
    };

    fetchData();
  }, []);

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(true);
    toast.success(`Code ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCoupon(false), 3000);
  };

  const activeHeroSlides = (bannerConfig?.heroSlides || DEFAULT_BANNER_CONFIG.heroSlides).filter(s => s.active !== false);

  return (
    <div style={{ width: '100%', overflowX: 'hidden' }}>
      
      {/* 1. HERO BANNER SWIPER (Configurable in Admin Panel) */}
      {bannerConfig.showHeroSwiper !== false && activeHeroSlides.length > 0 && (
        <section style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
          
          {/* Custom Luxury Navigation Buttons */}
          <button id="hero-prev" className="luxury-slider-btn prev-btn" aria-label="Previous Slide">
            <ChevronLeft size={22} strokeWidth={2.2} />
          </button>
          <button id="hero-next" className="luxury-slider-btn next-btn" aria-label="Next Slide">
            <ChevronRight size={22} strokeWidth={2.2} />
          </button>

          <Swiper
            className="hero-swiper"
            modules={[Navigation, Pagination, Autoplay, EffectFade]}
            effect="fade"
            loop={activeHeroSlides.length > 1}
            speed={1000}
            autoplay={{ delay: 6000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            navigation={{
              prevEl: '#hero-prev',
              nextEl: '#hero-next'
            }}
            style={{ width: '100%', minHeight: 'clamp(460px, 70vh, 700px)' }}
          >
            {activeHeroSlides.map((slide, idx) => (
              <SwiperSlide key={slide.id || idx}>
                <Link
                  to="/shop"
                  style={{
                    display: 'block',
                    textDecoration: 'none',
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer'
                  }}
                >
                  <div 
                    className="hero-slide-container"
                    style={{
                      position: 'relative',
                      width: '100%',
                      minHeight: 'clamp(460px, 70vh, 700px)',
                      backgroundImage: `radial-gradient(circle at center, rgba(8, 10, 15, 0.45) 0%, rgba(8, 10, 15, 0.95) 100%), url(${slide.image || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1920&q=85'})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 'clamp(40px, 6vw, 60px) clamp(12px, 3vw, 20px)'
                    }}
                  >
                    <div style={{ maxWidth: '880px', textAlign: 'center', zIndex: 2, width: '100%' }}>
                      {slide.tag && (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'rgba(212, 175, 55, 0.15)',
                          border: '1px solid rgba(212, 175, 55, 0.5)',
                          borderRadius: '9999px',
                          padding: '4px 12px',
                          color: '#f5df93',
                          fontSize: 'clamp(0.65rem, 1.8vw, 0.74rem)',
                          fontWeight: 600,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          marginBottom: '14px'
                        }}>
                          <Sparkles size={12} color="#d4af37" /> {slide.tag}
                        </div>
                      )}

                      <h1 style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(1.5rem, 4.5vw, 3.8rem)',
                        fontWeight: 800,
                        color: '#ffffff',
                        lineHeight: 1.15,
                        letterSpacing: '0.03em',
                        marginBottom: '12px'
                      }}>
                        {slide.title} {slide.highlight && <span className="gold-gradient-text">{slide.highlight}</span>}
                      </h1>

                      {slide.description && (
                        <p style={{
                          fontSize: 'clamp(0.85rem, 2vw, 1.15rem)',
                          color: '#cbd5e1',
                          maxWidth: '640px',
                          margin: '0 auto',
                          lineHeight: 1.55,
                          fontWeight: 300
                        }}>
                          {slide.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
      )}

      <section data-animate="fade-up" style={{ maxWidth: '1360px', margin: 'clamp(28px, 4vw, 44px) auto', padding: '0 clamp(16px, 4vw, 24px)', position: 'relative', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '2px' }}>
              Olfactory Taxonomy
            </div>
            <h2 style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.9rem)', color: '#f8fafc', fontWeight: 700 }}>
              Fragrance Families
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link to="/shop" style={{ color: '#d4af37', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
              View All <ArrowRight size={13} />
            </Link>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button id="cat-prev" className="btn-icon-round" style={{ width: '32px', height: '32px' }} aria-label="Previous Category">
                <ChevronLeft size={15} color="#f5df93" />
              </button>
              <button id="cat-next" className="btn-icon-round" style={{ width: '32px', height: '32px' }} aria-label="Next Category">
                <ChevronRight size={15} color="#f5df93" />
              </button>
            </div>
          </div>
        </div>

        <Swiper
          className="categories-swiper card-swiper"
          modules={[Navigation]}
          observer={true}
          observeParents={true}
          navigation={{
            prevEl: '#cat-prev',
            nextEl: '#cat-next'
          }}
          loop={categories.length > 2}
          spaceBetween={16}
          slidesPerView={1}
          breakpoints={{
            320: { slidesPerView: 1, spaceBetween: 14 },
            375: { slidesPerView: 1, spaceBetween: 14 },
            425: { slidesPerView: 1, spaceBetween: 14 },
            576: { slidesPerView: 2, spaceBetween: 16 },
            768: { slidesPerView: 3, spaceBetween: 18 },
            1024: { slidesPerView: 4, spaceBetween: 20 },
            1280: { slidesPerView: 5, spaceBetween: 20 }
          }}
          style={{ padding: '4px 0 12px 0', width: '100%' }}
        >
          {categories.map((cat) => (
            <SwiperSlide key={cat.id}>
              <Link 
                to={`/shop?category=${cat.slug}`}
                style={{
                  display: 'block',
                  position: 'relative',
                  width: '100%',
                  height: '240px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                  textDecoration: 'none',
                  background: '#0a0d14',
                  transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <img 
                  src={cat.image || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80'} 
                  alt={cat.name} 
                  style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    objectPosition: 'center',
                    transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' 
                  }}
                  className="family-card-img"
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(8, 10, 16, 0.95) 0%, rgba(8, 10, 16, 0.45) 55%, transparent 100%)',
                  pointerEvents: 'none'
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  boxSizing: 'border-box',
                  zIndex: 2
                }}>
                  <span style={{ fontSize: '0.68rem', color: '#ffd700', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
                    Olfactory Family
                  </span>
                  <h3 style={{ fontSize: 'clamp(1.08rem, 3vw, 1.25rem)', fontWeight: 700, color: '#f8fafc', margin: 0, lineHeight: 1.25, letterSpacing: '0.02em', textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}>
                    {cat.name}
                  </h3>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* 3. CINEMATIC VIDEO BANNER SECTION (Configurable in Admin Panel) */}
      {bannerConfig.showVideoBanner !== false && bannerConfig.videoBanner?.enabled !== false && (
        <section data-animate="zoom-in" style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1360px',
          margin: 'clamp(40px, 6vw, 70px) auto',
          padding: '0 clamp(12px, 3vw, 20px)'
        }}>
          <div style={{
            position: 'relative',
            borderRadius: '24px',
            overflow: 'hidden',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(212,175,55,0.1)',
            minHeight: 'clamp(380px, 50vw, 540px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0a0d14'
          }}>
            {/* Background Video Player with Infinite Loop & Autoplay */}
            <video
              key={bannerConfig.videoBanner?.videoUrl || 'video-banner-player'}
              ref={videoRef}
              id="cinematic-home-video"
              src={bannerConfig.videoBanner?.videoUrl || '/videos/luxury-perfume.mp4'}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster={bannerConfig.videoBanner?.posterImage || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1920&q=85'}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.6) contrast(1.15)',
                zIndex: 1
              }}
            >
              <source src={bannerConfig.videoBanner?.videoUrl || '/videos/luxury-perfume.mp4'} type="video/mp4" />
              <source src="https://vjs.zencdn.net/v/oceans.mp4" type="video/mp4" />
            </video>

            {/* Dark & Gold Tint Overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              zIndex: 2
            }} />

            {/* Content Container */}
            <div style={{
              position: 'relative',
              zIndex: 3,
              maxWidth: '820px',
              textAlign: 'center',
              padding: 'clamp(30px, 5vw, 60px) clamp(16px, 4vw, 30px)'
            }}>
              {bannerConfig.videoBanner?.tag && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(212, 175, 55, 0.2)',
                  border: '1px solid rgba(212, 175, 55, 0.6)',
                  borderRadius: '9999px',
                  padding: '5px 14px',
                  color: '#f5df93',
                  fontSize: 'clamp(0.68rem, 1.8vw, 0.78rem)',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: '16px'
                }}>
                  <Film size={13} color="#d4af37" /> {bannerConfig.videoBanner.tag}
                </div>
              )}

              <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.5rem, 4vw, 3.2rem)',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.2,
                marginBottom: '14px',
                letterSpacing: '0.02em'
              }}>
                {bannerConfig.videoBanner?.title}{' '}
                {bannerConfig.videoBanner?.highlight && (
                  <span className="gold-gradient-text">{bannerConfig.videoBanner.highlight}</span>
                )}
              </h2>

              {bannerConfig.videoBanner?.description && (
                <p style={{
                  fontSize: 'clamp(0.85rem, 2vw, 1.1rem)',
                  color: '#e2e8f0',
                  maxWidth: '620px',
                  margin: '0 auto 24px auto',
                  lineHeight: 1.6,
                  fontWeight: 300
                }}>
                  {bannerConfig.videoBanner.description}
                </p>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
                <Link
                  to={bannerConfig.videoBanner?.primaryBtnLink || '/shop'}
                  className="btn-luxury-gold"
                  style={{ padding: '12px 28px', fontSize: '0.9rem' }}
                >
                  {bannerConfig.videoBanner?.primaryBtnText || 'Discover Masterpieces'} <ArrowRight size={16} />
                </Link>

                {/* Video Play/Pause & Sound Toggles */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const v = document.getElementById('cinematic-home-video');
                      if (v) {
                        if (isVideoPlaying) {
                          v.pause();
                          setIsVideoPlaying(false);
                        } else {
                          v.play();
                          setIsVideoPlaying(true);
                        }
                      }
                    }}
                    className="btn-icon-round"
                    style={{ width: '42px', height: '42px', background: 'rgba(15, 19, 28, 0.85)', border: '1px solid #d4af37' }}
                    title={isVideoPlaying ? 'Pause Video' : 'Play Video'}
                  >
                    {isVideoPlaying ? <Pause size={16} color="#f5df93" /> : <Play size={16} color="#f5df93" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const v = document.getElementById('cinematic-home-video');
                      if (v) {
                        v.muted = !isVideoMuted;
                        setIsVideoMuted(!isVideoMuted);
                      }
                    }}
                    className="btn-icon-round"
                    style={{ width: '42px', height: '42px', background: 'rgba(15, 19, 28, 0.85)', border: '1px solid #d4af37' }}
                    title={isVideoMuted ? 'Unmute Sound' : 'Mute Sound'}
                  >
                    {isVideoMuted ? <VolumeX size={16} color="#f5df93" /> : <Volume2 size={16} color="#f5df93" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. EXCLUSIVE PROMOTIONAL IMAGE BANNER (Configurable in Admin Panel) */}
      {bannerConfig.showImageBanner !== false && bannerConfig.imageBanner?.enabled !== false && (
        <section data-animate="flip-up" style={{
          maxWidth: '1360px',
          margin: 'clamp(40px, 6vw, 70px) auto',
          padding: '0 clamp(12px, 3vw, 20px)'
        }}>
          <div style={{
            position: 'relative',
            borderRadius: '24px',
            overflow: 'hidden',
            border: '1px solid var(--border-gold)',
            boxShadow: 'var(--shadow-gold), 0 25px 60px rgba(0,0,0,0.85)',
            backgroundImage: `linear-gradient(135deg, rgba(10, 13, 20, 0.94) 0%, rgba(15, 19, 28, 0.85) 50%, rgba(8, 10, 15, 0.95) 100%), url(${bannerConfig.imageBanner?.image || 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1600&q=85'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
            gap: 'clamp(20px, 4vw, 40px)',
            alignItems: 'center',
            padding: 'clamp(28px, 5vw, 48px) clamp(20px, 4vw, 44px)'
          }}>
            <div>
              {bannerConfig.imageBanner?.tag && (
                <div className="badge-gold" style={{ marginBottom: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={12} /> {bannerConfig.imageBanner.tag}
                </div>
              )}

              <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.4rem, 3.5vw, 2.4rem)',
                color: '#ffffff',
                lineHeight: 1.25,
                marginBottom: '12px'
              }}>
                {bannerConfig.imageBanner?.title}{' '}
                {bannerConfig.imageBanner?.highlight && (
                  <span className="gold-gradient-text">{bannerConfig.imageBanner.highlight}</span>
                )}
              </h2>

              {bannerConfig.imageBanner?.description && (
                <p style={{
                  fontSize: 'clamp(0.85rem, 1.8vw, 1rem)',
                  color: '#cbd5e1',
                  lineHeight: 1.6,
                  marginBottom: '18px',
                  maxWidth: '520px'
                }}>
                  {bannerConfig.imageBanner.description}
                </p>
              )}

              {bannerConfig.imageBanner?.discountBadge && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(212, 175, 55, 0.12)',
                  border: '1px dashed #d4af37',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  marginBottom: '20px',
                  color: '#f5df93',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}>
                  <Gift size={15} color="#d4af37" />
                  <span>{bannerConfig.imageBanner.discountBadge}</span>
                </div>
              )}

              <div>
                <Link
                  to={bannerConfig.imageBanner?.primaryBtnLink || '/shop'}
                  className="btn-luxury-gold"
                  style={{ padding: '12px 28px', fontSize: '0.88rem' }}
                >
                  {bannerConfig.imageBanner?.primaryBtnText || 'Shop Private Reserve'} <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                display: 'inline-block',
                position: 'relative',
                borderRadius: '20px',
                overflow: 'hidden',
                border: '2px solid rgba(212, 175, 55, 0.4)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.9), 0 0 25px rgba(212,175,55,0.2)'
              }}>
                <img
                  src={bannerConfig.imageBanner?.image || 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=85'}
                  alt="Exclusive Perfume Showcase"
                  style={{
                    width: '100%',
                    maxWidth: 'clamp(240px, 40vw, 360px)',
                    height: 'clamp(220px, 35vw, 320px)',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. FEATURED PERFUMES SWIPER */}
      <section data-animate="fade-up" style={{ maxWidth: '1360px', margin: 'clamp(30px, 5vw, 50px) auto', padding: '0 clamp(16px, 4vw, 24px)', position: 'relative', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '22px', gap: '8px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#d4af37', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>
              <Sparkles size={12} /> Masterpiece Selection
            </div>
            <h2 style={{ fontSize: 'clamp(1.3rem, 3.8vw, 2.2rem)', color: '#ffffff', fontWeight: 700 }}>
              Featured Luxury Fragrances
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button id="feat-prev" className="btn-icon-round" style={{ width: '36px', height: '36px' }} aria-label="Previous Product">
              <ChevronLeft size={16} color="#f5df93" />
            </button>
            <button id="feat-next" className="btn-icon-round" style={{ width: '36px', height: '36px' }} aria-label="Next Product">
              <ChevronRight size={16} color="#f5df93" />
            </button>
          </div>
        </div>

        <Swiper
          className="featured-products-swiper card-swiper"
          modules={[Navigation, Pagination, Autoplay]}
          observer={true}
          observeParents={true}
          navigation={{
            prevEl: '#feat-prev',
            nextEl: '#feat-next'
          }}
          loop={featuredProducts.length > 3}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          spaceBetween={16}
          slidesPerView={1}
          breakpoints={{
            320: { slidesPerView: 1, spaceBetween: 14 },
            375: { slidesPerView: 1, spaceBetween: 14 },
            425: { slidesPerView: 1, spaceBetween: 14 },
            576: { slidesPerView: 2, spaceBetween: 16 },
            768: { slidesPerView: 2.5, spaceBetween: 18 },
            1024: { slidesPerView: 3.5, spaceBetween: 20 },
            1280: { slidesPerView: 4, spaceBetween: 22 }
          }}
          style={{ width: '100%' }}
        >
          {featuredProducts.map((product) => (
            <SwiperSlide key={product.id} style={{ height: 'auto', display: 'flex', flexDirection: 'column' }}>
              <ProductCard product={product} onQuickView={setQuickViewProduct} />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* 4. SCENT ARCHITECTURE / PYRAMID SHOWCASE */}
      <section data-animate="zoom-in" style={{
        background: 'linear-gradient(180deg, rgba(15, 19, 28, 0.4) 0%, rgba(8, 10, 15, 0.9) 100%)',
        borderTop: '1px solid rgba(212, 175, 55, 0.2)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
        padding: 'clamp(36px, 5vw, 50px) clamp(16px, 4vw, 24px)',
        margin: 'clamp(30px, 5vw, 50px) 0',
        boxSizing: 'border-box'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '0.72rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '3px' }}>
              The Anatomy of a Masterpiece
            </div>
            <h2 style={{ fontSize: 'clamp(1.3rem, 3.5vw, 2.1rem)', color: '#f8fafc', fontWeight: 700 }}>
              How High Parfumerie Unfolds On Skin
            </h2>
          </div>

          <FragrancePyramid 
            topNotes="Calabrian Bergamot, Cardamom, Pink Peppercorn, Bitter Almond"
            middleNotes="Grasse Rose de Mai, Jasmine Sambac, French Lavender, Precious Saffron"
            baseNotes="Mysore Sandalwood, Bourbon Vanilla, Ambergris, Haitian Vetiver, Oud Wood"
          />
        </div>
      </section>

      {/* 5. DUAL TABS: BEST SELLERS & NEW ARRIVALS */}
      <section data-animate="fade-up" style={{ maxWidth: '1360px', margin: 'clamp(30px, 5vw, 50px) auto', padding: '0 clamp(16px, 4vw, 24px)', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            background: 'rgba(15, 19, 28, 0.8)',
            border: '1px solid var(--border-gold)',
            borderRadius: '9999px',
            padding: '3px',
            maxWidth: '100%',
            overflowX: 'auto'
          }}>
            <button
              className="tab-pill-btn"
              onClick={() => setActiveTab('bestsellers')}
              style={{
                background: activeTab === 'bestsellers' ? 'var(--gold-gradient)' : 'transparent',
                color: activeTab === 'bestsellers' ? '#080a0f' : '#94a3b8',
                fontWeight: 600,
                fontSize: '0.78rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                padding: '7px 16px',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Best Sellers
            </button>
            <button
              className="tab-pill-btn"
              onClick={() => setActiveTab('newarrivals')}
              style={{
                background: activeTab === 'newarrivals' ? 'var(--gold-gradient)' : 'transparent',
                color: activeTab === 'newarrivals' ? '#080a0f' : '#94a3b8',
                fontWeight: 600,
                fontSize: '0.78rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                padding: '7px 16px',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              New Arrivals
            </button>
          </div>
        </div>

        <div className="product-grid">
          {(activeTab === 'bestsellers' ? bestSellers : newArrivals).length > 0 ? (
            (activeTab === 'bestsellers' ? bestSellers : newArrivals).map((product) => (
              <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
            ))
          ) : (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '40px 20px',
              color: '#94a3b8',
              fontSize: '0.9rem',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '16px',
              border: '1px dashed rgba(212, 175, 55, 0.2)'
            }}>
              No {activeTab === 'bestsellers' ? 'best sellers' : 'new arrivals'} available at the moment.
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '28px' }}>
          <Link to="/shop" className="btn-luxury-outline" style={{ padding: '10px 24px', fontSize: '0.86rem' }}>
            Browse Entire Boutique →
          </Link>
        </div>
      </section>

      {/* 6. PROMO COUPON BANNER */}
      <section data-animate="flip-up" style={{ maxWidth: '1360px', margin: 'clamp(30px, 5vw, 50px) auto', padding: '0 clamp(16px, 4vw, 24px)', boxSizing: 'border-box' }}>
        <div style={{
          background: 'linear-gradient(135deg, #161922 0%, #0d1017 100%)',
          border: '1px solid var(--border-gold)',
          borderRadius: '20px',
          padding: 'clamp(20px, 4vw, 36px) clamp(16px, 3vw, 24px)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
          gap: '20px',
          alignItems: 'center',
          boxShadow: 'var(--shadow-gold)'
        }}>
          <div>
            <div className="badge-gold" style={{ marginBottom: '8px', display: 'inline-block' }}>
              MEMBER PRIVILEGE CODE
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.3rem, 3.2vw, 2.1rem)', color: '#ffffff', marginBottom: '8px', lineHeight: 1.25 }}>
              Receive 10% Off Your First Perfume Bottle
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: '1.55', marginBottom: '14px' }}>
              Apply code <strong style={{ color: '#f5df93' }}>WELCOME10</strong> at checkout to unlock your private introductory discount.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
              <div style={{
                background: 'rgba(212, 175, 55, 0.12)',
                border: '1px dashed #d4af37',
                borderRadius: '8px',
                padding: '7px 12px',
                fontFamily: 'monospace',
                fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
                fontWeight: 700,
                color: '#f5df93',
                letterSpacing: '0.08em'
              }}>
                WELCOME10
              </div>
              <button
                onClick={() => handleCopyCoupon('WELCOME10')}
                className="btn-luxury-gold"
                style={{ padding: '8px 16px', fontSize: '0.8rem' }}
              >
                {copiedCoupon ? <Check size={14} /> : <Copy size={14} />}
                {copiedCoupon ? 'Copied' : 'Copy Code'}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <img 
              src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80" 
              alt="Luxury Perfume Bottle" 
              style={{
                maxWidth: 'clamp(180px, 35vw, 240px)',
                width: '100%',
                borderRadius: '14px',
                boxShadow: '0 15px 30px rgba(0,0,0,0.8)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                margin: '0 auto',
                objectFit: 'cover'
              }}
            />
          </div>
        </div>
      </section>

      {/* 6. GENDER PROMOTIONAL CARDS */}
      <section data-animate="fade-up" style={{ maxWidth: '1360px', margin: '30px auto clamp(40px, 6vw, 60px) auto', padding: '0 clamp(16px, 3.5vw, 28px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '24px' }}>
          
          {/* Men Card */}
          <div 
            className="promo-editorial-card"
            data-animate="fade-left" 
            style={{
              position: 'relative',
              borderRadius: '20px',
              overflow: 'hidden',
              minHeight: 'clamp(290px, 36vw, 360px)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'flex-end',
              padding: 'clamp(20px, 3.5vw, 32px)'
            }}
          >
            {/* Background Image Layer */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'url(https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=85)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              zIndex: 1,
              transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
            }} />

            {/* Seamless Luxury Studio Gradient Overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(110deg, rgba(8, 10, 15, 0.95) 0%, rgba(8, 10, 15, 0.82) 42%, rgba(8, 10, 15, 0.45) 75%, rgba(8, 10, 15, 0.15) 100%), linear-gradient(to top, rgba(8, 10, 15, 0.95) 0%, rgba(8, 10, 15, 0.5) 45%, transparent 100%)',
              zIndex: 2,
              pointerEvents: 'none'
            }} />

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 3, maxWidth: '380px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700, marginBottom: '6px' }}>
                <Flame size={13} /> Signature Collections
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.35rem, 3.2vw, 1.75rem)', color: '#ffffff', fontWeight: 700, marginBottom: '8px', lineHeight: 1.25 }}>
                Men's Fine Fragrances
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#cbd5e1', marginBottom: '18px', lineHeight: 1.55 }}>
                Smoky birch, rare agarwood, vetiver, and majestic amber tailored for bold presence.
              </p>
              <Link to="/shop?gender=Men" className="btn-luxury-gold" style={{ padding: '10px 20px', fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                Shop Men's Line <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Women Card */}
          <div 
            className="promo-editorial-card"
            data-animate="fade-right" 
            style={{
              position: 'relative',
              borderRadius: '20px',
              overflow: 'hidden',
              minHeight: 'clamp(290px, 36vw, 360px)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'flex-end',
              padding: 'clamp(20px, 3.5vw, 32px)'
            }}
          >
            {/* Background Image Layer */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'url(https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=85)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              zIndex: 1,
              transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
            }} />

            {/* Seamless Luxury Studio Gradient Overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(110deg, rgba(8, 10, 15, 0.95) 0%, rgba(8, 10, 15, 0.82) 42%, rgba(8, 10, 15, 0.45) 75%, rgba(8, 10, 15, 0.15) 100%), linear-gradient(to top, rgba(8, 10, 15, 0.96) 0%, rgba(8, 10, 15, 0.5) 45%, transparent 100%)',
              zIndex: 2,
              pointerEvents: 'none'
            }} />

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 3, maxWidth: '380px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700, marginBottom: '6px' }}>
                <Sparkles size={13} /> Floral & Amber
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.35rem, 3.2vw, 1.75rem)', color: '#ffffff', fontWeight: 700, marginBottom: '8px', lineHeight: 1.25 }}>
                Women's Fine Fragrances
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#cbd5e1', marginBottom: '18px', lineHeight: 1.55 }}>
                Velvet Bulgarian rose, white jasmine, vanilla orchid, and golden radiant musk.
              </p>
              <Link to="/shop?gender=Women" className="btn-luxury-gold" style={{ padding: '10px 20px', fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                Shop Women's Line <ArrowRight size={14} />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Quick View Modal Popup */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};

export default Home;
