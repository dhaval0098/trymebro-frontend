import React, { useState, useEffect, useRef } from 'react';
import {
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  Package,
  TrendingUp,
  X,
  QrCode,
  Save,
  ShieldCheck,
  Upload,
  Image as ImageIcon,
  LogOut,
  Layers,
  Crown,
  Search,
  ExternalLink,
  Sparkles,
  Droplets,
  Tag,
  Globe,
  SlidersHorizontal,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
  RefreshCw,
  Check,
  Film,
  Video,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Gift,
  Star,
  Flame,
  Rocket,
  Award,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Calendar,
  CreditCard,
  User,
  Truck,
  ChevronDown,
  RotateCcw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  Zap,
  ThermometerSnowflake,
  FileText,
  Headphones,
  Percent,
  ArrowLeft,
  Paperclip,
  Maximize2,
  Loader2
} from 'lucide-react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import jsQR from 'jsqr';
import AdminReviewsTab from '../components/AdminReviewsTab';

// Responsive Device Image Uploader Component (Works on Mobile Phones, Tablets & Desktops)
const ImageUploadField = ({ label, value, onChange, placeholder = "Upload photo from device", id }) => {
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be under 10MB');
      return;
    }

    try {
      setUploading(true);
      // Try multipart server upload first
      const formData = new FormData();
      formData.append('image', file);

      try {
        const res = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data?.url || res.data?.path) {
          const finalUrl = res.data.url || res.data.path;
          onChange(finalUrl);
          toast.success('📷 Photo uploaded from device successfully!');
          setUploading(false);
          return;
        }
      } catch (uploadErr) {
        console.warn('Server upload failed, falling back to base64 data URL:', uploadErr);
      }

      // Fallback to base64 data URL (works 100% offline & across all mobile phones)
      const reader = new FileReader();
      reader.onload = () => {
        onChange(reader.result);
        toast.success('📷 Photo loaded from device!');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File processing error:', err);
      toast.error('Failed to load image from device');
      setUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '4px' }}>
        <label style={{ fontSize: '0.8rem', color: '#f5df93', fontWeight: 600, margin: 0 }}>
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {showUrlInput ? 'Switch to Device File Upload' : 'Paste URL instead'}
        </button>
      </div>

      {showUrlInput ? (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="form-input-luxury"
          style={{ width: '100%', boxSizing: 'border-box' }}
        />
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {value && (
            <div style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', border: '1.5px solid #d4af37', flexShrink: 0 }}>
              <img src={value} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                type="button"
                onClick={() => onChange('')}
                style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.7)', border: 'none', color: '#f43f5e', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
                title="Remove photo"
              >
                <X size={12} />
              </button>
            </div>
          )}

          <label
            htmlFor={`file-upload-${id}`}
            style={{
              flex: 1,
              minWidth: '180px',
              padding: '12px 16px',
              background: 'rgba(212, 175, 55, 0.08)',
              border: '1.5px dashed rgba(212, 175, 55, 0.4)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: '#f5df93',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box',
              userSelect: 'none'
            }}
          >
            {uploading ? (
              <span>Uploading Photo...</span>
            ) : (
              <>
                <Upload size={16} color="#d4af37" />
                <span>{value ? 'Change Photo from Device' : 'Choose File from Device / Gallery'}</span>
              </>
            )}
            <input
              id={`file-upload-${id}`}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        </div>
      )}
    </div>
  );
};

// Direct Device Video Uploader Component (Supports MP4, WEBM, MOV with inline live preview)
const VideoUploadField = ({ label, value, onChange, placeholder = "Upload direct video from device", id }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleVideoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|m4v|mkv|ogg)$/i)) {
      toast.error('Please select a video file (MP4, WEBM, MOV, M4V, etc.)');
      return;
    }

    if (file.size > 150 * 1024 * 1024) {
      toast.error('Video file size exceeds 150MB limit');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(10);
      const formData = new FormData();
      formData.append('video', file);

      try {
        const res = await api.post('/upload/video', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(pct);
            }
          }
        });

        if (res.data?.url || res.data?.path) {
          const finalUrl = res.data.url || res.data.path;
          onChange(finalUrl);
          toast.success('🎬 Direct video uploaded from device successfully!');
          setUploading(false);
          setUploadProgress(0);
          return;
        }
      } catch (uploadErr) {
        console.warn('Server video upload failed, falling back to base64 data URL:', uploadErr);
      }

      // Fallback to base64 Data URL (for smaller local videos or offline mode)
      const reader = new FileReader();
      reader.onload = () => {
        onChange(reader.result);
        toast.success('🎬 Video loaded from device!');
        setUploading(false);
        setUploadProgress(0);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Video file error:', err);
      toast.error('Failed to load video from device');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '4px' }}>
        <label style={{ fontSize: '0.8rem', color: '#f5df93', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {showUrlInput ? '📁 Switch to Direct Video File Upload' : '🔗 Paste direct video link instead'}
        </button>
      </div>

      {showUrlInput ? (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... (Direct .mp4 or .webm link)"
          className="form-input-luxury"
          style={{ width: '100%', boxSizing: 'border-box' }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {value && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.6)',
              border: '1.5px solid rgba(212, 175, 55, 0.4)',
              borderRadius: '14px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#10b981', fontWeight: 700 }}>
                  <Film size={16} color="#10b981" />
                  <span>Video Loaded & Ready for Banner</span>
                </div>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  style={{
                    background: 'rgba(244, 63, 94, 0.15)',
                    border: '1px solid #f43f5e',
                    color: '#fda4af',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Remove video"
                >
                  <X size={13} /> Remove Video
                </button>
              </div>

              {/* Live Video Preview Player */}
              <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '10px', overflow: 'hidden', background: '#000000' }}>
                <video
                  src={value}
                  controls
                  loop
                  muted
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Source: {value.startsWith('data:') ? 'Local Device Memory Stream' : value}
              </div>
            </div>
          )}

          <label
            htmlFor={`video-upload-${id}`}
            style={{
              padding: '16px 20px',
              background: 'rgba(212, 175, 55, 0.08)',
              border: '1.5px dashed rgba(212, 175, 55, 0.4)',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: '#f5df93',
              cursor: uploading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box',
              userSelect: 'none',
              textAlign: 'center'
            }}
          >
            {uploading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f5df93', fontSize: '0.84rem', fontWeight: 600 }}>
                  <RefreshCw size={18} className="animate-spin" /> Uploading Video from Device ({uploadProgress}%)...
                </div>
                <div style={{ width: '200px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#d4af37', transition: 'width 0.2s ease' }} />
                </div>
              </div>
            ) : (
              <>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'rgba(212, 175, 55, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#d4af37'
                }}>
                  <Video size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#f8fafc' }}>
                    {value ? 'Upload / Replace Video from Device' : 'Choose Video File from Device (MP4, WEBM, MOV)'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                    High-res cinematic video files supported up to 150MB
                  </div>
                </div>
              </>
            )}
            <input
              id={`video-upload-${id}`}
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
              style={{ display: 'none' }}
              onChange={handleVideoFileChange}
              disabled={uploading}
            />
          </label>
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const [activeTab, setActiveTabState] = useState(urlTab || 'overview');

  // Sync activeTab when URL parameter changes (e.g. from AdminNavbar)
  useEffect(() => {
    if (urlTab && urlTab !== activeTab) {
      setActiveTabState(urlTab);
    }
  }, [urlTab]);

  const setActiveTab = (tabId) => {
    setActiveTabState(tabId);
    setSearchParams({ tab: tabId });
  };

  // Data States
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [topSelling, setTopSelling] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Store Filter Configurations State
  const [filterConfig, setFilterConfig] = useState({
    genders: [
      { id: 'Men', label: 'Men', sub: 'Pour Homme', active: true },
      { id: 'Women', label: 'Women', sub: 'Pour Femme', active: true },
      { id: 'Unisex', label: 'Unisex', sub: 'Shared', active: true }
    ],
    pricePresets: [
      { label: 'All', min: '', max: '', active: true },
      { label: 'Under ₹5K', min: '', max: '5000', active: true },
      { label: '₹5K – ₹15K', min: '5000', max: '15000', active: true },
      { label: '₹15K – ₹30K', min: '15000', max: '30000', active: true },
      { label: '₹30K+', min: '30000', max: '', active: true }
    ],
    sections: {
      showSearch: true,
      showGender: true,
      showCategories: true,
      showBrands: true,
      showPrice: true,
      showInStock: true
    },
    searchPlaceholder: 'e.g. Amber, Vanilla, Oud, Sauvage...',
    bannerSubtitle: 'HAUTE PARFUMERIE COLLECTION',
    bannerTitle: 'Explore Our Fragrance Sanctuary',
    bannerDescription: 'Discover artisanal elixirs, rare oud accords, and signature luxury perfumes curated for distinction.'
  });
  const [isSavingFilters, setIsSavingFilters] = useState(false);

  // Search/Filters inside Catalog
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState('');
  const [catalogBrandFilter, setCatalogBrandFilter] = useState('');
  const [catalogBadgeFilter, setCatalogBadgeFilter] = useState(''); // '' | 'new_arrival' | 'best_seller' | 'top_rated' | 'featured'

  // Modals state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null = add, object = edit

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // null = add, object = edit

  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null); // null = add, object = edit

  // Order Details & Customer Contact Modal
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [orderDetailsModalOpen, setOrderDetailsModalOpen] = useState(false);
  const [orderTrackingNumber, setOrderTrackingNumber] = useState('');
  const [orderCourierName, setOrderCourierName] = useState('Delhivery');
  const [orderTrackingUrl, setOrderTrackingUrl] = useState('');
  const [orderStatusNotes, setOrderStatusNotes] = useState('');
  const [orderEstimatedDelivery, setOrderEstimatedDelivery] = useState('');
  const [orderFulfillmentStatus, setOrderFulfillmentStatus] = useState('Pending');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Product Form State
  const initialProductState = {
    name: '',
    brand_id: '',
    category_id: '',
    description: '',
    concentration: 'Eau de Parfum',
    scent_family: 'Woody & Earthy',
    gender: 'Unisex',
    volume_ml: 100,
    bottle_sizes: '50ml, 100ml, 200ml',
    size_variants: [
      { size: '50ml', price: '4999', discount_price: '4499', stock: 25 },
      { size: '100ml', price: '8999', discount_price: '7999', stock: 40 },
      { size: '200ml', price: '14999', discount_price: '12999', stock: 15 }
    ],
    top_notes: '',
    middle_notes: '',
    base_notes: '',
    price: '',
    discount_price: '',
    stock_quantity: 30,
    primary_image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    additional_images: [
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 5.0,
    num_reviews: 140,
    is_featured: true,
    is_best_seller: false,
    is_new_arrival: true,
    is_returnable: true,
    return_window_days: 7,
    return_policy: ''
  };
  const [productForm, setProductForm] = useState(initialProductState);
  const [discountPercent, setDiscountPercent] = useState('');

  // Return & Refund Management States
  const [returnRequests, setReturnRequests] = useState([]);
  const [returnStats, setReturnStats] = useState(null);
  const [returnStatusFilter, setReturnStatusFilter] = useState('all');
  const [returnSearch, setReturnSearch] = useState('');
  const [returnReviewModalOpen, setReturnReviewModalOpen] = useState(false);
  const [selectedReturnForReview, setSelectedReturnForReview] = useState(null);
  const [returnReviewStatus, setReturnReviewStatus] = useState('Requested');
  const [returnReviewNotes, setReturnReviewNotes] = useState('');
  const [returnReviewTracking, setReturnReviewTracking] = useState('');
  const [returnReviewCourier, setReturnReviewCourier] = useState('Delhivery');
  const [globalReturnSettings, setGlobalReturnSettings] = useState({
    default_return_window: 7,
    allow_returns_globally: true,
    global_policy_text: 'Eligible for return or replacement within 7 days of delivery. Perfume flacon must be unopened, in its original box with cellophane seal and batch code intact for authenticity and hygiene standards.',
    support_email: 'returns@scentvogue.com',
    support_phone: '+91 98765 43210'
  });
  const [isSavingReturnSettings, setIsSavingReturnSettings] = useState(false);

  // Category Form State
  const initialCategoryState = {
    name: '',
    slug: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=800&q=80'
  };
  const [categoryForm, setCategoryForm] = useState(initialCategoryState);

  // Brand Form State
  const initialBrandState = {
    name: '',
    slug: '',
    description: '',
    logo: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=300&q=80',
    banner_image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=80',
    origin_country: 'France',
    is_featured: true
  };
  const [brandForm, setBrandForm] = useState(initialBrandState);

  // Coupon / Promo Code State
  const [couponsList, setCouponsList] = useState([]);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const initialCouponState = {
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    buy_qty: 1,
    get_qty: 1,
    discount_percent_for_get: 100,
    applicable_type: 'all',
    applicable_product_ids: [],
    applicable_category_ids: [],
    min_order_amount: '',
    max_discount_amount: '',
    expiry_date: '',
    usage_limit: '',
    is_active: true,
    is_published: true
  };
  const [couponForm, setCouponForm] = useState(initialCouponState);
  const [couponProductSearch, setCouponProductSearch] = useState('');

  // Razorpay & UPI Payment Gateway Settings State
  const [paymentSettings, setPaymentSettings] = useState({
    razorpay_key_id: 'rzp_test_TbWUGrGr4J0GGV',
    razorpay_key_secret: 'T10EQGw0uKDliPGGmV2SkFoW',
    razorpay_mode: 'test',
    business_name: 'TRY ME BRO Luxury Perfumes',
    merchant_upi_id: '9510367164@pthdfc',
    payee_name: 'TRY ME BRO Luxury Perfumes',
    is_razorpay_enabled: true,
    is_cod_enabled: true,
    is_upi_direct_enabled: true
  });
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);

  // UPI Gateway Merchant Settings State (Legacy Support)
  const [upiSettings, setUpiSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('trymebro_upi_settings');
      return saved ? JSON.parse(saved) : {
        upiId: '9510367164@pthdfc',
        payeeName: 'TRY ME BRO Luxury Perfumes',
        customQrImage: ''
      };
    } catch {
      return {
        upiId: '9510367164@pthdfc',
        payeeName: 'TRY ME BRO Luxury Perfumes',
        customQrImage: ''
      };
    }
  });

  const [previewTestAmount, setPreviewTestAmount] = useState('29000');

  // Home Banners & Hero Swiper State
  const initialBannerConfig = {
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
        secondaryBtnText: 'Find Scent Profile',
        secondaryBtnLink: 'quiz'
      },
      {
        id: 'slide-2',
        active: true,
        tag: 'HAUTE COUTURE EXCLUSIVES',
        title: 'Artisanal Extraits &',
        highlight: 'Gold Flacons',
        description: 'Rare oud harvests, saffron extracts, and velvety ambers composed for collectors.',
        image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1920&q=85',
        primaryBtnText: 'Private Reserve',
        primaryBtnLink: '/shop',
        secondaryBtnText: 'Explore Maisons',
        secondaryBtnLink: '/shop'
      }
    ],
    videoBanner: {
      enabled: true,
      tag: 'CINEMATIC OLFACTORY EXPERIENCE',
      title: 'Crafted with Passion & Master-Distilled',
      highlight: 'French Botanicals',
      description: 'Step into the atelier of high parfumerie where every drop is steeped in heritage and aged to perfection.',
      videoUrl: '/videos/luxury-perfume.mp4',
      posterImage: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1920&q=85',
      primaryBtnText: 'Discover Masterpieces',
      primaryBtnLink: '/shop'
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
  const [bannerConfig, setBannerConfig] = useState(initialBannerConfig);
  const [isSavingBanners, setIsSavingBanners] = useState(false);

  // Delivery & Shipping Rate Management State
  const [shippingSettings, setShippingSettings] = useState({
    fixed_delivery_charge: 100,
    free_shipping_threshold: 5000,
    origin_pincode: '382721',
    origin_city: 'Kalol',
    origin_state: 'Gujarat'
  });
  const [isSavingShipping, setIsSavingShipping] = useState(false);

  // Distance Test Sandbox State
  const [testPincode, setTestPincode] = useState('380001');
  const [testSubtotal, setTestSubtotal] = useState('3500');
  const [testDistanceResult, setTestDistanceResult] = useState(null);
  const [testCalculating, setTestCalculating] = useState(false);

  // -------------------------------------------------------------
  // Live Concierge Chat & CMS State
  // -------------------------------------------------------------
  const [chatConversations, setChatConversations] = useState([]);
  const [selectedChatConv, setSelectedChatConv] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatReplyText, setChatReplyText] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [adminUnreadChatCount, setAdminUnreadChatCount] = useState(0);

  // Admin Chat Image Upload & Lightbox State
  const [adminChatImageFile, setAdminChatImageFile] = useState(null);
  const [adminChatImagePreview, setAdminChatImagePreview] = useState(null);
  const [adminChatUploading, setAdminChatUploading] = useState(false);
  const [adminChatLightboxImage, setAdminChatLightboxImage] = useState(null);
  const adminChatFileInputRef = useRef(null);

  // CMS Content Management State
  const [cmsActiveSubTab, setCmsActiveSubTab] = useState('about');
  const [isSavingCms, setIsSavingCms] = useState(false);
  const [cmsAboutContent, setCmsAboutContent] = useState({
    heroBadge: 'THE MAISON OF HAUTE PARFUMERIE',
    heroTitle: 'Alchemy of Scent, Crowned in Gold',
    heroSubtitle: 'Born in the royal fragrance corridors of India, TRY ME BRO curates rare essences and high-concentration extrait de parfums for connoisseurs who demand absolute distinction.',
    storyBadge: 'OUR HERITAGE & ORIGIN',
    storyTitle: 'Crafted Without Compromise, Aged to Perfection',
    storyParagraph1: 'Founded with a singular obsessive philosophy: perfume should never be an afterthought—it is your invisible crown, the aura that precedes you and lingers long after you leave the room.',
    storyParagraph2: 'We source the rarest botanicals from Grasse, ambergris from the Indian Ocean, and aged agarwood from Assam. Each flacon is hand-filled, meticulously blended at maximum extrait concentration (30–40%), and cured in temperature-regulated dark cellars.',
    storyImage: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85',
    stats: [
      { value: '40%', label: 'Extrait Concentration' },
      { value: '180+', label: 'Rare Pure Essences' },
      { value: '24h+', label: 'Silken Projection' },
      { value: '10,000+', label: 'Discerning Patrons' }
    ],
    pillars: [
      { title: 'Purest Extrait Strength', desc: 'Formulated at up to 40% perfume oil concentration for unrivaled 24+ hour longevity and majestic projection.' },
      { title: 'Artisanal Batch Maturation', desc: 'Each vintage undergoes months of slow cellar maturation to allow complex accords to marry harmoniously.' },
      { title: 'Ethical & Noble Sourcing', desc: 'Sustainably harvested oud, cruelty-free amber musks, and organic botanicals handpicked at dawn.' },
      { title: 'Bespoke Flacon Architecture', desc: 'Heavy crystalline glass adorned with brushed 24K gold accents and magnetic pressurized atomizers.' }
    ],
    ctaBadge: 'JOIN THE SOCIETY',
    ctaTitle: 'Find Your Signature Aura',
    ctaSubtitle: 'Experience the distinction of bespoke perfumery. Receive complimentary discovery vials with your first private order.',
    ctaBtnText: 'Explore Private Catalog',
    ctaBtnLink: '/shop'
  });

  const [cmsContactContent, setCmsContactContent] = useState({
    heroBadge: 'ATELIER CONCIERGE & PRIVATE SALON',
    heroTitle: 'Speak with Our Master Perfumers',
    heroSubtitle: 'Whether you seek guidance on our private extrait blends, customized corporate gifting, or order inquiries, our dedicated concierge team is at your immediate service.',
    boutiqueBadge: 'BOUTIQUE ATELIER & HEADQUARTERS',
    boutiqueTitle: 'The TRY ME BRO Private Salon',
    email: 'concierge@trymebro.com',
    phone: '+91 98765 43210',
    whatsapp: '+91 98765 43210',
    address: 'TRY ME BRO Luxury Atelier, Main Heritage Boulevard, Kalol 382721, Gujarat, India',
    timings: 'Monday – Sunday: 10:00 AM – 9:00 PM IST',
    mapEmbedUrl: '',
    faqs: [
      { q: 'How long do TRY ME BRO extrait perfumes last?', a: 'Because our creations are blended at maximum Extrait de Parfum strength (30% to 40% pure oil concentration), a single application delivers 18 to 24+ hours of opulent projection and skin longevity.' },
      { q: 'Do you offer sample discovery sets?', a: 'Yes! Every flacon purchase includes complimentary deluxe sample vials so you can sample your chosen scent before unsealing the master flacon, alongside our curated Discovery Coffret sets.' },
      { q: 'What is your shipping and delivery timeline?', a: 'We offer express courier delivery across India within 2 to 4 business days. All orders above ₹5,000 qualify for complimentary insured priority shipping.' },
      { q: 'What is your return & exchange privilege?', a: 'Unopened, pristine flacons with safety seals intact may be returned or replaced within our policy window. You can easily initiate a return right from your account dashboard.' }
    ]
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [
        dashRes, ordersRes, prodRes, catRes, brandRes, filterRes,
        bannerRes, couponRes, shippingRes, paymentRes, returnsRes, returnSettingsRes,
        aboutCmsRes, contactCmsRes, chatRes
      ] = await Promise.all([
        api.get('/admin/dashboard').catch(() => ({ data: { success: false } })),
        api.get('/orders?limit=100').catch(() => ({ data: { orders: [] } })),
        api.get('/products?limit=200').catch(() => ({ data: { products: [] } })),
        api.get('/categories').catch(() => ({ data: { categories: [] } })),
        api.get('/brands').catch(() => ({ data: { brands: [] } })),
        api.get('/filters/config').catch(() => ({ data: { config: null } })),
        api.get('/banners/config').catch(() => ({ data: { config: null } })),
        api.get('/coupons').catch(() => ({ data: { coupons: [] } })),
        api.get('/shipping/config').catch(() => ({ data: { config: null } })),
        api.get('/payment/settings').catch(() => ({ data: { settings: null } })),
        api.get('/returns').catch(() => ({ data: { returns: [], stats: null } })),
        api.get('/returns/settings').catch(() => ({ data: { settings: null } })),
        api.get('/content/about').catch(() => ({ data: { content: null } })),
        api.get('/content/contact').catch(() => ({ data: { content: null } })),
        api.get('/chat/admin/conversations').catch(() => ({ data: { conversations: [] } }))
      ]);

      const fetchedOrders = dashRes.data?.recentOrders || ordersRes.data?.orders || [];
      setRecentOrders(fetchedOrders);

      if (paymentRes.data?.settings) {
        setPaymentSettings(prev => ({ ...prev, ...paymentRes.data.settings }));
      }

      if (returnsRes.data?.returns) {
        setReturnRequests(returnsRes.data.returns);
        if (returnsRes.data.stats) setReturnStats(returnsRes.data.stats);
      }
      if (returnSettingsRes.data?.settings) {
        setGlobalReturnSettings(returnSettingsRes.data.settings);
      }

      if (aboutCmsRes.data?.content) {
        setCmsAboutContent(prev => ({ ...prev, ...aboutCmsRes.data.content }));
      }
      if (contactCmsRes.data?.content) {
        setCmsContactContent(prev => ({ ...prev, ...contactCmsRes.data.content }));
      }

      if (chatRes.data?.conversations) {
        setChatConversations(chatRes.data.conversations);
        const unread = chatRes.data.conversations.filter(c => Number(c.unread_admin || 0) > 0).length;
        setAdminUnreadChatCount(unread);
      }

      if (dashRes.data?.success && dashRes.data.stats) {
        setStats(dashRes.data.stats);
        setLowStockProducts(dashRes.data.lowStockProducts || []);
        setTopSelling(dashRes.data.topSelling || []);
      } else if (fetchedOrders.length > 0) {
        // Fallback stats computation
        const totalRev = fetchedOrders
          .filter(o => o.order_status !== 'Cancelled')
          .reduce((sum, o) => sum + Number(o.final_amount || 0), 0);
        const pendingCount = fetchedOrders.filter(o => o.order_status === 'Pending').length;
        const deliveredCount = fetchedOrders.filter(o => o.order_status === 'Delivered').length;

        setStats({
          total_revenue: totalRev,
          total_orders: fetchedOrders.length,
          pending_orders: pendingCount,
          delivered_orders: deliveredCount,
          total_customers: 6,
          total_products: prodRes.data?.products?.length || 0,
          low_stock_count: 0
        });
      }

      if (prodRes.data?.products) setProductsList(prodRes.data.products);
      if (catRes.data?.categories) setCategories(catRes.data.categories);
      if (brandRes.data?.brands) setBrands(brandRes.data.brands);
      if (filterRes.data?.config) setFilterConfig(filterRes.data.config);
      if (bannerRes.data?.config) setBannerConfig(bannerRes.data.config);
      if (couponRes.data?.coupons) setCouponsList(couponRes.data.coupons);
      if (shippingRes.data?.config) setShippingSettings(shippingRes.data.config);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Background polling for Live Chat conversations & active conversation messages
  useEffect(() => {
    const fetchChatUpdates = async () => {
      try {
        const convRes = await api.get('/chat/admin/conversations').catch(() => null);
        if (convRes?.data?.conversations) {
          setChatConversations(convRes.data.conversations);
          const unread = convRes.data.conversations.filter(c => Number(c.unread_admin || 0) > 0).length;
          setAdminUnreadChatCount(unread);
        }

        if (selectedChatConv?.id) {
          const msgRes = await api.get(`/chat/admin/messages/${selectedChatConv.id}`).catch(() => null);
          if (msgRes?.data?.messages) {
            setChatMessages(msgRes.data.messages);
          }
        }
      } catch (e) {
        // silent background poll
      }
    };

    const interval = setInterval(fetchChatUpdates, 3500);
    return () => clearInterval(interval);
  }, [selectedChatConv?.id]);

  // Chat Actions
  const handleSelectChatConv = async (conv) => {
    setSelectedChatConv(conv);
    try {
      const res = await api.get(`/chat/admin/messages/${conv.id}`);
      setChatMessages(res.data?.messages || []);
      // Reset unread count locally for this conversation
      setChatConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unread_admin: 0 } : c));
    } catch (err) {
      console.error('Failed to load chat messages:', err);
      toast.error('Could not load chat history');
    }
  };

  // Chat Image Handlers
  const handleAdminChatImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPG, PNG, WEBP, GIF)');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error('Image size exceeds 15MB limit. Please choose a smaller photo.');
      return;
    }

    setAdminChatImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAdminChatImagePreview(objectUrl);
    e.target.value = '';
  };

  const handleAdminRemoveChatImage = () => {
    if (adminChatImagePreview) {
      URL.revokeObjectURL(adminChatImagePreview);
    }
    setAdminChatImageFile(null);
    setAdminChatImagePreview(null);
  };

  const handleSendAdminReply = async (e) => {
    if (e) e.preventDefault();
    if ((!chatReplyText.trim() && !adminChatImageFile) || !selectedChatConv) return;

    try {
      setChatSending(true);
      const textToSend = chatReplyText.trim();
      let uploadedImageUrl = null;

      // 1. Upload image if attached
      if (adminChatImageFile) {
        setAdminChatUploading(true);
        const formData = new FormData();
        formData.append('image', adminChatImageFile);

        const uploadRes = await api.post('/chat/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (uploadRes.data?.success && uploadRes.data.url) {
          uploadedImageUrl = uploadRes.data.url;
        } else {
          throw new Error('Image upload failed');
        }
      }

      // 2. Send admin reply
      const res = await api.post('/chat/admin/reply', {
        conversation_id: selectedChatConv.id,
        message: textToSend,
        image_url: uploadedImageUrl
      });

      if (res.data?.message) {
        setChatMessages(prev => [...prev, res.data.message]);
        setChatConversations(prev => prev.map(c => 
          c.id === selectedChatConv.id ? { ...c, last_message: textToSend || '📷 Photo Attached', updated_at: new Date().toISOString() } : c
        ));
        setChatReplyText('');
        handleAdminRemoveChatImage();
      }
    } catch (err) {
      console.error('Failed to send admin reply:', err);
      toast.error('Failed to send response or upload photo');
    } finally {
      setChatSending(false);
      setAdminChatUploading(false);
    }
  };

  // CMS Save Actions
  const handleSaveCmsAbout = async (e) => {
    if (e) e.preventDefault();
    try {
      setIsSavingCms(true);
      const res = await api.post('/content/about', cmsAboutContent);
      if (res.data?.success) {
        toast.success('✨ About Us page content updated & published live!');
      } else {
        toast.success('✨ Content saved');
      }
    } catch (err) {
      console.error('Error saving about content:', err);
      toast.error(err.response?.data?.message || 'Failed to update About Us page');
    } finally {
      setIsSavingCms(false);
    }
  };

  const handleSaveCmsContact = async (e) => {
    if (e) e.preventDefault();
    try {
      setIsSavingCms(true);
      const res = await api.post('/content/contact', cmsContactContent);
      if (res.data?.success) {
        toast.success('✨ Contact Us page & FAQs updated & published live!');
      } else {
        toast.success('✨ Content saved');
      }
    } catch (err) {
      console.error('Error saving contact content:', err);
      toast.error(err.response?.data?.message || 'Failed to update Contact Us page');
    } finally {
      setIsSavingCms(false);
    }
  };

  const handleAddFaq = () => {
    setCmsContactContent(prev => ({
      ...prev,
      faqs: [...(prev.faqs || []), { q: 'New Frequently Asked Question', a: 'Detailed answer for your discerning patrons.' }]
    }));
  };

  const handleUpdateFaq = (index, field, value) => {
    setCmsContactContent(prev => {
      const updated = [...(prev.faqs || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, faqs: updated };
    });
  };

  const handleDeleteFaq = (index) => {
    setCmsContactContent(prev => ({
      ...prev,
      faqs: (prev.faqs || []).filter((_, i) => i !== index)
    }));
  };

  const handleUpdatePillar = (index, field, value) => {
    setCmsAboutContent(prev => {
      const updated = [...(prev.pillars || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, pillars: updated };
    });
  };

  const handleUpdateStat = (index, field, value) => {
    setCmsAboutContent(prev => {
      const updated = [...(prev.stats || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, stats: updated };
    });
  };

  // -------------------------------------------------------------
  // Order Status & Payment Actions
  // -------------------------------------------------------------
  const getOrderStatusStyle = (status) => {
    switch (status) {
      case 'Delivered':
        return {
          bg: 'linear-gradient(135deg, rgba(6, 78, 59, 0.45) 0%, rgba(16, 185, 129, 0.18) 100%)',
          border: 'rgba(16, 185, 129, 0.5)',
          color: '#6ee7b7',
          dot: '#10b981',
          glow: '0 0 10px rgba(16, 185, 129, 0.25)'
        };
      case 'Out for Delivery':
        return {
          bg: 'linear-gradient(135deg, rgba(88, 28, 135, 0.45) 0%, rgba(168, 85, 247, 0.18) 100%)',
          border: 'rgba(168, 85, 247, 0.5)',
          color: '#e9d5ff',
          dot: '#c084fc',
          glow: '0 0 10px rgba(168, 85, 247, 0.25)'
        };
      case 'Shipped':
        return {
          bg: 'linear-gradient(135deg, rgba(30, 58, 138, 0.45) 0%, rgba(59, 130, 246, 0.18) 100%)',
          border: 'rgba(59, 130, 246, 0.5)',
          color: '#bfdbfe',
          dot: '#60a5fa',
          glow: '0 0 10px rgba(59, 130, 246, 0.25)'
        };
      case 'Processing':
        return {
          bg: 'linear-gradient(135deg, rgba(113, 63, 18, 0.45) 0%, rgba(234, 179, 8, 0.18) 100%)',
          border: 'rgba(234, 179, 8, 0.5)',
          color: '#fef08a',
          dot: '#eab308',
          glow: '0 0 10px rgba(234, 179, 8, 0.25)'
        };
      case 'Confirmed':
        return {
          bg: 'linear-gradient(135deg, rgba(17, 94, 89, 0.45) 0%, rgba(20, 184, 166, 0.18) 100%)',
          border: 'rgba(20, 184, 166, 0.5)',
          color: '#99f6e4',
          dot: '#2dd4bf',
          glow: '0 0 10px rgba(20, 184, 166, 0.25)'
        };
      case 'Cancelled':
        return {
          bg: 'linear-gradient(135deg, rgba(136, 19, 55, 0.45) 0%, rgba(244, 63, 94, 0.18) 100%)',
          border: 'rgba(244, 63, 94, 0.5)',
          color: '#fecdd3',
          dot: '#f43f5e',
          glow: '0 0 10px rgba(244, 63, 94, 0.25)'
        };
      case 'Pending':
      default:
        return {
          bg: 'linear-gradient(135deg, rgba(120, 85, 10, 0.35) 0%, rgba(212, 175, 55, 0.12) 100%)',
          border: 'rgba(212, 175, 55, 0.5)',
          color: '#fef08a',
          dot: '#d4af37',
          glow: '0 0 10px rgba(212, 175, 55, 0.2)'
        };
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { order_status: newStatus });
      if (res.data.success) {
        toast.success(`✨ Order #${orderId} status updated to '${newStatus}'`);
        fetchData();
        if (selectedOrderDetails && selectedOrderDetails.id === orderId) {
          setSelectedOrderDetails(res.data.order);
        }
      }
    } catch (err) {
      console.error('Update status error:', err);
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleSaveOrderTrackingAndStatus = async (orderId) => {
    try {
      setIsSubmitting(true);
      const res = await api.put(`/orders/${orderId}/status`, {
        order_status: orderFulfillmentStatus,
        tracking_number: orderTrackingNumber,
        courier_name: orderCourierName,
        tracking_url: orderTrackingUrl,
        status_notes: orderStatusNotes,
        estimated_delivery: orderEstimatedDelivery
      });
      if (res.data.success) {
        toast.success(`✨ Order #${orderId} status & tracking details saved successfully!`);
        setSelectedOrderDetails(res.data.order);
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to update order tracking details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePaymentStatus = async (orderId, newPaymentStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, {
        payment_status: newPaymentStatus,
        order_status: newPaymentStatus === 'Paid' ? 'Processing' : (newPaymentStatus === 'Failed' ? 'Cancelled' : 'Pending')
      });
      if (res.data.success) {
        if (newPaymentStatus === 'Paid') {
          toast.success(`✨ Order #${orderId} payment APPROVED! Customer now sees 'Payment Done' & 3-5 days delivery.`);
        } else if (newPaymentStatus === 'Failed') {
          toast.info(`Order #${orderId} payment REJECTED.`);
        } else {
          toast.success(`Order #${orderId} payment status updated.`);
        }
        if (selectedOrderDetails && selectedOrderDetails.id === orderId) {
          setSelectedOrderDetails(res.data.order);
        }
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to update payment status');
    }
  };

  // -------------------------------------------------------------
  // Product (Fragrance Collection) CRUD
  // -------------------------------------------------------------
  const openAddProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      ...initialProductState,
      brand_id: brands[0]?.id || '',
      category_id: categories[0]?.id || ''
    });
    setDiscountPercent('');
    setProductModalOpen(true);
  };

  const openEditProductModal = (product) => {
    setEditingProduct(product);
    const basePrice = Number(product.price) || 0;
    const discPrice = Number(product.discount_price) || 0;
    const calculatedPct = (basePrice > 0 && discPrice > 0 && discPrice < basePrice)
      ? Math.round(((basePrice - discPrice) / basePrice) * 100)
      : '';

    let variants = [];
    if (product.size_variants) {
      try {
        const parsed = typeof product.size_variants === 'string' ? JSON.parse(product.size_variants) : product.size_variants;
        if (Array.isArray(parsed) && parsed.length > 0) {
          variants = parsed.map(v => {
            const vp = Number(v.price) || 0;
            const vdp = Number(v.discount_price) || 0;
            const vpct = (vp > 0 && vdp > 0 && vdp < vp) ? String(Math.round(((vp - vdp) / vp) * 100)) : (v.discount_percent || '');
            return {
              size: v.size || '',
              price: v.price !== undefined ? String(v.price) : '',
              discount_percent: vpct,
              discount_price: v.discount_price !== undefined ? String(v.discount_price) : '',
              stock: v.stock !== undefined ? v.stock : 30
            };
          });
        }
      } catch (e) {}
    }
    if (variants.length === 0) {
      const sizes = product.bottle_sizes 
        ? product.bottle_sizes.split(',').map(s => s.trim()).filter(Boolean)
        : (product.volume_ml ? [`${product.volume_ml}ml`] : ['100ml']);
      variants = sizes.map((sz, idx) => {
        const factor = sizes.length === 1 ? 1 : (idx === 0 ? 0.65 : (idx === 1 ? 1 : 1.6));
        const vp = product.price ? String(Math.round(Number(product.price) * factor)) : '';
        const vdp = product.discount_price ? String(Math.round(Number(product.discount_price) * factor)) : '';
        const vpNum = Number(vp);
        const vdpNum = Number(vdp);
        const vpct = (vpNum > 0 && vdpNum > 0 && vdpNum < vpNum) ? String(Math.round(((vpNum - vdpNum) / vpNum) * 100)) : '';
        return {
          size: sz,
          price: vp,
          discount_percent: vpct,
          discount_price: vdp,
          stock: product.stock_quantity ?? 30
        };
      });
    }

    let extraImages = [];
    if (product.additional_images) {
      try {
        const parsedImgs = typeof product.additional_images === 'string' ? JSON.parse(product.additional_images) : product.additional_images;
        if (Array.isArray(parsedImgs)) {
          extraImages = parsedImgs.filter(Boolean);
        }
      } catch (e) {}
    }

    setProductForm({
      name: product.name || '',
      brand_id: product.brand_id || brands[0]?.id || '',
      category_id: product.category_id || categories[0]?.id || '',
      description: product.description || '',
      concentration: product.concentration || 'Eau de Parfum',
      scent_family: product.scent_family || 'Woody & Earthy',
      gender: product.gender || 'Unisex',
      volume_ml: product.volume_ml || 100,
      bottle_sizes: product.bottle_sizes || (product.volume_ml ? `${product.volume_ml}ml` : '100ml'),
      size_variants: variants,
      top_notes: product.top_notes || '',
      middle_notes: product.middle_notes || '',
      base_notes: product.base_notes || '',
      price: product.price || '',
      discount_price: product.discount_price || '',
      stock_quantity: product.stock_quantity ?? 30,
      primary_image: product.primary_image || '',
      additional_images: extraImages,
      rating: product.rating !== undefined ? product.rating : 5.0,
      num_reviews: product.num_reviews !== undefined ? product.num_reviews : 140,
      is_featured: Boolean(product.is_featured),
      is_best_seller: Boolean(product.is_best_seller),
      is_new_arrival: Boolean(product.is_new_arrival),
      is_returnable: product.is_returnable !== undefined ? (product.is_returnable === 1 || product.is_returnable === true || product.is_returnable === '1') : true,
      return_window_days: product.return_window_days || 7,
      return_policy: product.return_policy || ''
    });
    setDiscountPercent(calculatedPct);
    setProductModalOpen(true);
  };

  // Gallery Additional Photos Handlers (Supports Unlimited Extra Photos)
  const handleAddAdditionalImage = () => {
    setProductForm(prev => ({
      ...prev,
      additional_images: [...(prev.additional_images || []), '']
    }));
  };

  const handleUpdateAdditionalImage = (index, url) => {
    const updated = [...(productForm.additional_images || [])];
    updated[index] = url;
    setProductForm(prev => ({ ...prev, additional_images: updated }));
  };

  const handleRemoveAdditionalImage = (index) => {
    const updated = (productForm.additional_images || []).filter((_, i) => i !== index);
    setProductForm(prev => ({ ...prev, additional_images: updated }));
  };

  // Quick 1-Click Toggle for Prestige Badges directly from Product Cards
  const handleQuickToggleBadge = async (prod, field) => {
    const currentVal = Boolean(prod[field]);
    const newVal = !currentVal;
    
    // Optimistic UI update
    setProductsList(prev => prev.map(p => p.id === prod.id ? { ...p, [field]: newVal ? 1 : 0 } : p));
    
    try {
      const res = await api.put(`/products/${prod.id}`, { [field]: newVal });
      if (res.data.success) {
        const badgeNames = {
          is_new_arrival: 'New Arrival 🚀',
          is_best_seller: 'Bestseller 👑',
          is_featured: 'Featured Collection ✨'
        };
        toast.success(`"${prod.name}" ${newVal ? 'marked as' : 'removed from'} ${badgeNames[field] || field}`);
      }
    } catch (err) {
      // Rollback on error
      setProductsList(prev => prev.map(p => p.id === prod.id ? { ...p, [field]: currentVal ? 1 : 0 } : p));
      toast.error('Failed to update fragrance badge status');
    }
  };

  // State for Bulk Variant Discount Setter
  const [bulkVariantDiscount, setBulkVariantDiscount] = useState('');

  // Bulk Variant Discount Applier (Applies % to all configured bottle sizes)
  const handleApplyBulkDiscountToVariants = (pctVal) => {
    const pct = Number(pctVal);
    if (isNaN(pct) || pct <= 0 || pct >= 100) {
      toast.warn('Please enter a valid discount percentage (1% to 99%).');
      return;
    }
    const current = productForm.size_variants || [];
    if (current.length === 0) {
      toast.info('Please add bottle sizes first before applying bulk discount.');
      return;
    }
    const updated = current.map(v => {
      const p = Number(v.price) || 0;
      const dp = p > 0 ? String(Math.round(p * (1 - pct / 100))) : '';
      return {
        ...v,
        discount_percent: String(pct),
        discount_price: dp
      };
    });
    setProductForm(prev => ({
      ...prev,
      size_variants: updated,
      discount_price: updated[0]?.discount_price || prev.discount_price
    }));
    toast.success(`✨ Set ${pct}% discount across all ${updated.length} bottle sizes!`);
  };

  // Bottle Sizes & Variant Pricing Handlers
  const handleAddSizeVariant = (sizeName = '') => {
    const currentVariants = productForm.size_variants || [];
    const newSize = sizeName || `${currentVariants.length === 0 ? 50 : (currentVariants.length === 1 ? 100 : 200)}ml`;
    if (currentVariants.some(v => (v.size || '').toLowerCase() === newSize.toLowerCase())) {
      toast.info(`Bottle size ${newSize} is already added in the list below.`);
      return;
    }
    const baseP = Number(productForm.price) || 8000;
    const basePct = Number(discountPercent) || 10;
    const baseDp = Number(productForm.discount_price) || Math.round(baseP * (1 - basePct / 100));
    const updated = [
      ...currentVariants,
      {
        size: newSize,
        price: String(baseP),
        discount_percent: String(basePct),
        discount_price: String(baseDp),
        stock: 30
      }
    ];
    const newSizesStr = updated.map(v => v.size).join(', ');
    setProductForm(prev => ({
      ...prev,
      size_variants: updated,
      bottle_sizes: newSizesStr
    }));
  };

  const handleUpdateVariant = (index, field, value) => {
    const updated = [...(productForm.size_variants || [])];
    if (!updated[index]) return;
    const current = { ...updated[index] };

    if (field === 'price') {
      current.price = value;
      const p = Number(value);
      const pct = Number(current.discount_percent);
      const dp = Number(current.discount_price);
      if (pct > 0 && pct < 100 && p > 0) {
        current.discount_price = String(Math.round(p * (1 - pct / 100)));
      } else if (p > 0 && dp > 0 && dp < p) {
        current.discount_percent = String(Math.round(((p - dp) / p) * 100));
      }
    } else if (field === 'discount_percent') {
      current.discount_percent = value;
      const pct = Number(value);
      const p = Number(current.price);
      if (value === '' || isNaN(pct) || pct <= 0) {
        current.discount_price = '';
      } else if (pct < 100 && p > 0) {
        current.discount_price = String(Math.round(p * (1 - pct / 100)));
      }
    } else if (field === 'discount_price') {
      current.discount_price = value;
      const dp = Number(value);
      const p = Number(current.price);
      if (value === '' || isNaN(dp) || dp <= 0) {
        current.discount_percent = '';
      } else if (p > 0 && dp < p) {
        current.discount_percent = String(Math.round(((p - dp) / p) * 100));
      } else if (dp >= p && p > 0) {
        current.discount_percent = '';
      }
    } else {
      current[field] = value;
    }

    updated[index] = current;

    let newPrice = productForm.price;
    let newDiscPrice = productForm.discount_price;
    if (index === 0) {
      newPrice = current.price || newPrice;
      newDiscPrice = current.discount_price || newDiscPrice;
    }
    const newSizesStr = updated.map(v => v.size).join(', ');
    setProductForm(prev => ({
      ...prev,
      size_variants: updated,
      bottle_sizes: newSizesStr,
      price: newPrice,
      discount_price: newDiscPrice
    }));
  };

  const handleRemoveVariant = (index) => {
    const updated = (productForm.size_variants || []).filter((_, i) => i !== index);
    const newSizesStr = updated.map(v => v.size).join(', ');
    let newPrice = productForm.price;
    let newDiscPrice = productForm.discount_price;
    if (updated.length > 0) {
      newPrice = updated[0].price || newPrice;
      newDiscPrice = updated[0].discount_price || newDiscPrice;
    }
    setProductForm(prev => ({
      ...prev,
      size_variants: updated,
      bottle_sizes: newSizesStr,
      price: newPrice,
      discount_price: newDiscPrice
    }));
  };


  // Synchronized Pricing and Discount Percentage Handlers
  const handlePriceChange = (val) => {
    const newPrice = val;
    let newDiscPrice = productForm.discount_price;

    if (newPrice && discountPercent) {
      const p = Number(newPrice);
      const pct = Number(discountPercent);
      if (p > 0 && pct > 0 && pct < 100) {
        newDiscPrice = Math.round(p * (1 - pct / 100));
      }
    } else if (newPrice && productForm.discount_price) {
      const p = Number(newPrice);
      const dp = Number(productForm.discount_price);
      if (p > 0 && dp > 0 && dp < p) {
        setDiscountPercent(Math.round(((p - dp) / p) * 100));
      }
    }
    setProductForm(prev => ({ ...prev, price: newPrice, discount_price: newDiscPrice }));
  };

  const handleDiscountPercentChange = (val) => {
    setDiscountPercent(val);
    const pct = Number(val);
    const p = Number(productForm.price);

    if (val === '' || isNaN(pct) || pct <= 0) {
      setProductForm(prev => ({ ...prev, discount_price: '' }));
      return;
    }

    if (pct >= 100) {
      toast.warn('Discount percentage must be less than 100%');
      return;
    }

    if (p > 0) {
      const calculatedDiscPrice = Math.round(p * (1 - pct / 100));
      setProductForm(prev => ({ ...prev, discount_price: calculatedDiscPrice }));
    }
  };

  const handleDiscountPriceChange = (val) => {
    const dp = Number(val);
    const p = Number(productForm.price);

    setProductForm(prev => ({ ...prev, discount_price: val }));

    if (val === '' || isNaN(dp) || dp <= 0) {
      setDiscountPercent('');
      return;
    }

    if (p > 0 && dp < p) {
      const calculatedPct = Math.round(((p - dp) / p) * 100);
      setDiscountPercent(calculatedPct);
    } else if (dp >= p && p > 0) {
      setDiscountPercent('');
    }
  };

  const handleSaveProduct = async (e) => {
    if (e) e.preventDefault();
    if (!productForm.name || !productForm.price) {
      toast.error('Product name and price are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const cleanedAdditional = (productForm.additional_images || []).filter(Boolean);
      const payload = {
        ...productForm,
        price: productForm.price !== '' && !isNaN(Number(productForm.price)) ? Number(productForm.price) : 0,
        discount_price: productForm.discount_price !== '' && productForm.discount_price !== null && !isNaN(Number(productForm.discount_price))
          ? Number(productForm.discount_price)
          : null,
        stock_quantity: productForm.stock_quantity !== '' && !isNaN(Number(productForm.stock_quantity))
          ? Number(productForm.stock_quantity)
          : 0,
        rating: productForm.rating !== '' && !isNaN(Number(productForm.rating)) ? Number(productForm.rating) : 5.0,
        num_reviews: productForm.num_reviews !== '' && !isNaN(Number(productForm.num_reviews)) ? Number(productForm.num_reviews) : 0,
        brand_id: productForm.brand_id ? Number(productForm.brand_id) : null,
        category_id: productForm.category_id ? Number(productForm.category_id) : null,
        additional_images: cleanedAdditional
      };

      if (editingProduct) {
        // Update product
        const res = await api.put(`/products/${editingProduct.id}`, payload);
        if (res.data.success) {
          toast.success(`✨ Fragrance "${productForm.name}" updated successfully!`);
          setProductModalOpen(false);
          await fetchData();
        }
      } else {
        // Create product
        const res = await api.post('/products', payload);
        if (res.data.success) {
          toast.success(`✨ New fragrance "${productForm.name}" created successfully!`);
          setProductModalOpen(false);
          await fetchData();
        }
      }
    } catch (err) {
      console.error('Save product error:', err);
      toast.error(err.response?.data?.message || 'Failed to save fragrance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (prodId) => {
    if (!window.confirm('Are you sure you want to delete this fragrance bottle?')) return;
    try {
      const res = await api.delete(`/products/${prodId}`);
      if (res.data.success) {
        toast.success('Fragrance bottle deleted from catalog.');
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  // -------------------------------------------------------------
  // Category / Fragrance Family CRUD
  // -------------------------------------------------------------
  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryForm(initialCategoryState);
    setCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      image: cat.image || ''
    });
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    if (e) e.preventDefault();
    if (!categoryForm.name.trim()) {
      toast.error('Category name is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingCategory) {
        const res = await api.put(`/categories/${editingCategory.id}`, categoryForm);
        if (res.data.success) {
          toast.success(`✨ Category "${categoryForm.name}" updated successfully!`);
          setCategoryModalOpen(false);
          await fetchData();
        }
      } else {
        const res = await api.post('/categories', categoryForm);
        if (res.data.success) {
          toast.success(`✨ New category "${categoryForm.name}" created successfully!`);
          setCategoryModalOpen(false);
          await fetchData();
        }
      }
    } catch (err) {
      console.error('Save category error:', err);
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (catId, catName) => {
    if (!window.confirm(`Are you sure you want to delete category "${catName}"? Associated products will have their category unassigned.`)) return;
    try {
      const res = await api.delete(`/categories/${catId}`);
      if (res.data.success) {
        toast.success(`Category "${catName}" deleted successfully.`);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  };

  // -------------------------------------------------------------
  // Brand / Designer House CRUD
  // -------------------------------------------------------------
  const openAddBrandModal = () => {
    setEditingBrand(null);
    setBrandForm(initialBrandState);
    setBrandModalOpen(true);
  };

  const openEditBrandModal = (brand) => {
    setEditingBrand(brand);
    setBrandForm({
      name: brand.name || '',
      slug: brand.slug || '',
      description: brand.description || '',
      logo: brand.logo || '',
      banner_image: brand.banner_image || '',
      origin_country: brand.origin_country || 'France',
      is_featured: Boolean(brand.is_featured)
    });
    setBrandModalOpen(true);
  };

  const handleSaveBrand = async (e) => {
    if (e) e.preventDefault();
    if (!brandForm.name.trim()) {
      toast.error('Brand name is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingBrand) {
        const res = await api.put(`/brands/${editingBrand.id}`, brandForm);
        if (res.data.success) {
          toast.success(`✨ Brand "${brandForm.name}" updated successfully!`);
          setBrandModalOpen(false);
          await fetchData();
        }
      } else {
        const res = await api.post('/brands', brandForm);
        if (res.data.success) {
          toast.success(`✨ New brand "${brandForm.name}" created successfully!`);
          setBrandModalOpen(false);
          await fetchData();
        }
      }
    } catch (err) {
      console.error('Save brand error:', err);
      toast.error(err.response?.data?.message || 'Failed to save brand');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBrand = async (brandId, brandName) => {
    if (!window.confirm(`Are you sure you want to delete brand "${brandName}"? Associated products will have their brand unassigned.`)) return;
    try {
      const res = await api.delete(`/brands/${brandId}`);
      if (res.data.success) {
        toast.success(`Brand "${brandName}" deleted successfully.`);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete brand');
    }
  };

  // -------------------------------------------------------------
  // Coupon & Promo Code CRUD
  // -------------------------------------------------------------
  const openAddCouponModal = () => {
    navigate('/admin/coupons/new');
  };

  const openEditCouponModal = (coupon) => {
    navigate(`/admin/coupons/edit/${coupon.id}`);
  };

  const handleSaveCoupon = async (e) => {
    if (e) e.preventDefault();
    if (!couponForm.code.trim()) {
      toast.error('Coupon code is required.');
      return;
    }
    const isBogo = couponForm.discount_type === 'bogo';
    if (!isBogo && (couponForm.discount_value === '' || isNaN(Number(couponForm.discount_value)) || Number(couponForm.discount_value) <= 0)) {
      toast.error('Please enter a valid positive discount value.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        code: couponForm.code.toUpperCase().trim(),
        description: couponForm.description.trim(),
        discount_type: couponForm.discount_type,
        discount_value: isBogo ? 100 : Number(couponForm.discount_value),
        buy_qty: parseInt(couponForm.buy_qty || 1, 10),
        get_qty: parseInt(couponForm.get_qty || 1, 10),
        discount_percent_for_get: parseInt(couponForm.discount_percent_for_get || 100, 10),
        applicable_type: couponForm.applicable_type || 'all',
        applicable_product_ids: couponForm.applicable_product_ids,
        applicable_category_ids: couponForm.applicable_category_ids,
        min_order_amount: couponForm.min_order_amount !== '' ? Number(couponForm.min_order_amount) : 0,
        max_discount_amount: couponForm.max_discount_amount !== '' && couponForm.max_discount_amount !== null ? Number(couponForm.max_discount_amount) : null,
        expiry_date: couponForm.expiry_date ? couponForm.expiry_date : null,
        usage_limit: couponForm.usage_limit !== '' && couponForm.usage_limit !== null ? parseInt(couponForm.usage_limit, 10) : null,
        is_active: Boolean(couponForm.is_active),
        is_published: Boolean(couponForm.is_published)
      };

      if (editingCoupon) {
        const res = await api.put(`/coupons/${editingCoupon.id}`, payload);
        if (res.data.success) {
          toast.success(`✨ Coupon "${payload.code}" updated successfully!`);
          setCouponModalOpen(false);
          await fetchData();
        }
      } else {
        const res = await api.post('/coupons', payload);
        if (res.data.success) {
          toast.success(`🚀 Coupon "${payload.code}" created & broadcasted successfully!`);
          setCouponModalOpen(false);
          await fetchData();
        }
      }
    } catch (err) {
      console.error('Save coupon error:', err);
      toast.error(err.response?.data?.message || 'Failed to save coupon code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublishCoupon = async (coupon) => {
    try {
      const res = await api.patch(`/coupons/${coupon.id}/toggle-publish`);
      if (res.data.success) {
        toast.success(res.data.message);
        setCouponsList(prev => prev.map(c => c.id === coupon.id ? { ...c, is_published: res.data.is_published ? 1 : 0 } : c));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle publish status');
    }
  };

  const handleToggleActiveCoupon = async (coupon) => {
    try {
      const res = await api.patch(`/coupons/${coupon.id}/toggle-active`);
      if (res.data.success) {
        toast.success(res.data.message);
        setCouponsList(prev => prev.map(c => c.id === coupon.id ? { ...c, is_active: res.data.is_active ? 1 : 0 } : c));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleDeleteCoupon = async (couponId, couponCode) => {
    if (!window.confirm(`Are you sure you want to permanently delete coupon "${couponCode}"?`)) return;
    try {
      const res = await api.delete(`/coupons/${couponId}`);
      if (res.data.success) {
        toast.success(`Coupon "${couponCode}" deleted successfully.`);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete coupon');
    }
  };

  // -------------------------------------------------------------
  // UPI QR Scan & Save
  // -------------------------------------------------------------
  const handleQrImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target.result;
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, img.width, img.height);
          const imgData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imgData.data, imgData.width, imgData.height);

          let detectedUpiId = '';
          let detectedPayee = '';

          if (code && code.data) {
            const raw = code.data;
            const matchPa = raw.match(/[?&]pa=([^&]+)/i);
            const matchPn = raw.match(/[?&]pn=([^&]+)/i);
            if (matchPa) detectedUpiId = decodeURIComponent(matchPa[1]);
            if (matchPn) detectedPayee = decodeURIComponent(matchPn[1]);
          }

          setUpiSettings(prev => ({
            ...prev,
            customQrImage: base64Data,
            upiId: detectedUpiId || prev.upiId,
            payeeName: detectedPayee || prev.payeeName
          }));

          if (detectedUpiId) {
            toast.success(`📷 QR Scanned! Detected Merchant VPA: ${detectedUpiId}. Cart total will now be automatically locked for customers.`);
          } else {
            toast.success('📷 QR Photo uploaded! Cart total will be dynamically embedded into checkout QR code.');
          }
        } catch (err) {
          setUpiSettings(prev => ({ ...prev, customQrImage: base64Data }));
          toast.success('📷 QR Photo uploaded!');
        }
      };
      img.src = base64Data;
    };
    reader.onerror = () => {
      toast.error('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleSavePaymentSettings = async (e) => {
    if (e) e.preventDefault();
    try {
      setIsSavingPayment(true);
      const payload = {
        razorpay_key_id: String(paymentSettings.razorpay_key_id || 'rzp_test_TbWUGrGr4J0GGV').trim(),
        razorpay_key_secret: String(paymentSettings.razorpay_key_secret || 'T10EQGw0uKDliPGGmV2SkFoW').trim(),
        razorpay_mode: paymentSettings.razorpay_mode || 'test',
        business_name: String(paymentSettings.business_name || 'TRY ME BRO Luxury Perfumes').trim(),
        merchant_upi_id: String(paymentSettings.merchant_upi_id || upiSettings.upiId || '9510367164@pthdfc').trim(),
        payee_name: String(paymentSettings.payee_name || upiSettings.payeeName || 'TRY ME BRO Luxury Perfumes').trim(),
        is_razorpay_enabled: Boolean(paymentSettings.is_razorpay_enabled),
        is_cod_enabled: Boolean(paymentSettings.is_cod_enabled),
        is_upi_direct_enabled: Boolean(paymentSettings.is_upi_direct_enabled)
      };

      const res = await api.put('/payment/settings', payload);
      if (res.data?.success) {
        toast.success('💳 Razorpay & UPI Payment Settings saved successfully!');
        setPaymentSettings(res.data.settings);
        setUpiSettings(prev => ({
          ...prev,
          upiId: payload.merchant_upi_id,
          payeeName: payload.payee_name
        }));
        localStorage.setItem('trymebro_upi_settings', JSON.stringify({
          upiId: payload.merchant_upi_id,
          payeeName: payload.payee_name
        }));
      }
    } catch (err) {
      console.error('Failed to save payment settings:', err);
      toast.error(err.response?.data?.message || 'Failed to save payment settings');
    } finally {
      setIsSavingPayment(false);
    }
  };

  const handleSaveUpiSettings = (e) => {
    handleSavePaymentSettings(e);
  };

  // -------------------------------------------------------------
  // Filter Management Handlers
  // -------------------------------------------------------------
  const handleSaveFilterConfig = async (e) => {
    if (e) e.preventDefault();
    try {
      setIsSavingFilters(true);
      const res = await api.put('/filters/config', filterConfig);
      if (res.data.success) {
        toast.success('✨ Store filter settings saved and updated live!');
        setFilterConfig(res.data.config);
      }
    } catch (err) {
      console.error('Save filter config error:', err);
      toast.error(err.response?.data?.message || 'Failed to save filter settings');
    } finally {
      setIsSavingFilters(false);
    }
  };

  const handleToggleSection = (sectionKey) => {
    setFilterConfig(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionKey]: !prev.sections?.[sectionKey]
      }
    }));
  };

  const handleAddGender = () => {
    const newId = `Option_${Date.now()}`;
    setFilterConfig(prev => ({
      ...prev,
      genders: [...(prev.genders || []), { id: newId, label: 'New Accord', sub: 'Custom', active: true }]
    }));
  };

  const handleUpdateGender = (index, field, value) => {
    setFilterConfig(prev => {
      const updated = [...(prev.genders || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, genders: updated };
    });
  };

  const handleRemoveGender = (index) => {
    setFilterConfig(prev => ({
      ...prev,
      genders: (prev.genders || []).filter((_, i) => i !== index)
    }));
  };

  const handleAddPricePreset = () => {
    setFilterConfig(prev => ({
      ...prev,
      pricePresets: [...(prev.pricePresets || []), { label: 'New Tier', min: '0', max: '10000', active: true }]
    }));
  };

  const handleUpdatePricePreset = (index, field, value) => {
    setFilterConfig(prev => {
      const updated = [...(prev.pricePresets || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, pricePresets: updated };
    });
  };

  const handleRemovePricePreset = (index) => {
    setFilterConfig(prev => ({
      ...prev,
      pricePresets: (prev.pricePresets || []).filter((_, i) => i !== index)
    }));
  };

  // -------------------------------------------------------------
  // Banner & Hero Swiper Handlers
  // -------------------------------------------------------------
  const handleSaveBannerConfig = async (e) => {
    if (e) e.preventDefault();
    try {
      setIsSavingBanners(true);
      const res = await api.put('/banners/config', bannerConfig);
      if (res.data.success) {
        toast.success('✨ Hero Swiper, Video & Image Banners updated live!');
        setBannerConfig(res.data.config);
      }
    } catch (err) {
      console.error('Save banner config error:', err);
      toast.error(err.response?.data?.message || 'Failed to save banner settings');
    } finally {
      setIsSavingBanners(false);
    }
  };

  const handleAddHeroSlide = () => {
    const newSlide = {
      id: `slide_${Date.now()}`,
      active: true,
      tag: 'EXCLUSIVE LAUNCH 2026',
      title: 'New Haute Accord &',
      highlight: 'Signature Note',
      description: 'Discover the latest artisanal creation crafted with master-distilled botanicals.',
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1920&q=85',
      primaryBtnText: 'Explore Fragrance',
      primaryBtnLink: '/shop',
      secondaryBtnText: 'View Notes',
      secondaryBtnLink: '/shop'
    };
    setBannerConfig(prev => ({
      ...prev,
      heroSlides: [...(prev.heroSlides || []), newSlide]
    }));
  };

  const handleUpdateHeroSlide = (index, field, value) => {
    setBannerConfig(prev => {
      const updated = [...(prev.heroSlides || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, heroSlides: updated };
    });
  };

  const handleRemoveHeroSlide = (index) => {
    setBannerConfig(prev => ({
      ...prev,
      heroSlides: (prev.heroSlides || []).filter((_, i) => i !== index)
    }));
  };

  // -------------------------------------------------------------
  // Delivery & Shipping Rate Management Handlers
  // -------------------------------------------------------------
  const handleSaveShippingConfig = async (e) => {
    if (e) e.preventDefault();
    try {
      setIsSavingShipping(true);
      const payload = {
        fixed_delivery_charge: Number(shippingSettings.fixed_delivery_charge !== undefined ? shippingSettings.fixed_delivery_charge : (shippingSettings.base_fee || 100)),
        free_shipping_threshold: Number(shippingSettings.free_shipping_threshold) || 0,
        origin_pincode: shippingSettings.origin_pincode || '382721',
        origin_city: shippingSettings.origin_city || 'Kalol',
        origin_state: shippingSettings.origin_state || 'Gujarat'
      };

      const res = await api.put('/shipping/config', payload);
      if (res.data.success) {
        toast.success(`🚚 Fixed delivery charge set to ₹${payload.fixed_delivery_charge} for all locations!`);
        setShippingSettings(res.data.config);
      }
    } catch (err) {
      console.error('Save shipping config error:', err);
      toast.error(err.response?.data?.message || 'Failed to save shipping rates');
    } finally {
      setIsSavingShipping(false);
    }
  };

  const handleRunDistanceTest = async () => {
    const cleanPin = String(testPincode || '').trim().replace(/[^0-9]/g, '');
    if (cleanPin.length !== 6) {
      toast.warning('Please enter a valid 6-digit Indian PIN code to test.');
      return;
    }
    try {
      setTestCalculating(true);
      const res = await api.post('/shipping/calculate', {
        destination_pincode: cleanPin,
        subtotal: Number(testSubtotal) || 0
      });
      if (res.data.success) {
        setTestDistanceResult(res.data);
        toast.success(`Delivery calculated for PIN ${res.data.destination_pincode}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delivery calculation failed');
    } finally {
      setTestCalculating(false);
    }
  };

  // -------------------------------------------------------------
  // Product Return & Refund Management Handlers
  // -------------------------------------------------------------
  const fetchReturnsData = async () => {
    try {
      const res = await api.get('/returns');
      if (res.data?.success) {
        setReturnRequests(res.data.returns || []);
        if (res.data.stats) setReturnStats(res.data.stats);
      }
      const settingsRes = await api.get('/returns/settings');
      if (settingsRes.data?.success && settingsRes.data.settings) {
        setGlobalReturnSettings(settingsRes.data.settings);
      }
    } catch (err) {
      console.error('Failed to reload returns data:', err);
    }
  };

  const handleOpenReturnReviewModal = (ret) => {
    setSelectedReturnForReview(ret);
    setReturnReviewStatus(ret.status || 'Requested');
    setReturnReviewNotes(ret.admin_notes || '');
    setReturnReviewTracking(ret.pickup_tracking_number || '');
    setReturnReviewCourier(ret.pickup_courier || 'Delhivery');
    setReturnReviewModalOpen(true);
  };

  const handleSaveReturnReview = async (e) => {
    if (e) e.preventDefault();
    if (!selectedReturnForReview) return;
    try {
      setIsSubmitting(true);
      const res = await api.put(`/returns/${selectedReturnForReview.id}/status`, {
        status: returnReviewStatus,
        admin_notes: returnReviewNotes,
        pickup_tracking_number: returnReviewTracking,
        pickup_courier: returnReviewCourier
      });
      if (res.data.success) {
        toast.success(`✨ Return #${selectedReturnForReview.return_number} updated to '${returnReviewStatus}'!`);
        setReturnReviewModalOpen(false);
        fetchReturnsData();
      }
    } catch (err) {
      console.error('Update return status error:', err);
      toast.error(err.response?.data?.message || 'Failed to update return status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveGlobalReturnSettings = async (e) => {
    if (e) e.preventDefault();
    try {
      setIsSavingReturnSettings(true);
      const res = await api.put('/returns/settings', globalReturnSettings);
      if (res.data.success) {
        toast.success('🛡️ Global Return & Replacement policy settings published live!');
        setGlobalReturnSettings(res.data.settings);
      }
    } catch (err) {
      console.error('Save global return settings error:', err);
      toast.error(err.response?.data?.message || 'Failed to save return settings');
    } finally {
      setIsSavingReturnSettings(false);
    }
  };

  // Filtered Return Requests List
  const filteredReturnRequests = returnRequests.filter(ret => {
    const matchesSearch = !returnSearch ||
      ret.return_number?.toLowerCase().includes(returnSearch.toLowerCase()) ||
      ret.order_number?.toLowerCase().includes(returnSearch.toLowerCase()) ||
      ret.product_name?.toLowerCase().includes(returnSearch.toLowerCase()) ||
      ret.user_name?.toLowerCase().includes(returnSearch.toLowerCase()) ||
      ret.user_email?.toLowerCase().includes(returnSearch.toLowerCase()) ||
      ret.reason?.toLowerCase().includes(returnSearch.toLowerCase());
    
    const matchesStatus = returnStatusFilter === 'all' || ret.status === returnStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Products List
  const filteredProducts = productsList.filter(prod => {
    const matchesSearch = !catalogSearch || 
      prod.name?.toLowerCase().includes(catalogSearch.toLowerCase()) || 
      prod.brand_name?.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      prod.scent_family?.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchesCategory = !catalogCategoryFilter || String(prod.category_id) === String(catalogCategoryFilter);
    const matchesBrand = !catalogBrandFilter || String(prod.brand_id) === String(catalogBrandFilter);
    
    let matchesBadge = true;
    if (catalogBadgeFilter === 'new_arrival') matchesBadge = Boolean(prod.is_new_arrival);
    else if (catalogBadgeFilter === 'best_seller') matchesBadge = Boolean(prod.is_best_seller);
    else if (catalogBadgeFilter === 'top_rated') matchesBadge = Number(prod.rating || 0) >= 4.8;
    else if (catalogBadgeFilter === 'featured') matchesBadge = Boolean(prod.is_featured);

    return matchesSearch && matchesCategory && matchesBrand && matchesBadge;
  });

  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37' }}>
        <div className="gold-shimmer" style={{ padding: '24px 48px', borderRadius: '16px' }}>
          Initializing TRY ME BRO Executive Console...
        </div>
      </div>
    );
  }

  const getSectionTitle = () => {
    switch (activeTab) {
      case 'overview': return { title: 'Executive Overview & Order Fulfillment', badge: 'OPERATIONAL COMMAND' };
      case 'chat': return { title: 'Patron Live Concierge & Real-Time Chat', badge: 'CLIENT LIAISON' };
      case 'products': return { title: 'Haute Fragrance Master Catalog', badge: 'INVENTORY & CURATION' };
      case 'categories': return { title: 'Fragrance Families & Olfactory Categories', badge: 'TAXONOMY' };
      case 'brands': return { title: 'Designer Houses & Perfumery Brands', badge: 'MAISONS' };
      case 'returns': return { title: 'Returns, Replacements & Customer Refunds', badge: 'AFTERCARE PRIVILEGE' };
      case 'banners': return { title: 'Cinematic Video Hero & Visual Swiper', badge: 'CREATIVE SHOWCASE' };
      case 'coupons': return { title: 'Promotional Privileges & Discount Codes', badge: 'PROMOTIONS' };
      case 'cms': return { title: 'Storefront CMS (About Us & Contact Us/FAQs)', badge: 'CONTENT STUDIO' };
      case 'filters': return { title: 'Search Criteria & Catalog Filters', badge: 'DISCOVERY RULES' };
      case 'shipping': return { title: 'Store Delivery Charges & Free Shipping Settings', badge: 'DELIVERY' };
      case 'upi': return { title: 'Razorpay & UPI Payment Gateway Settings', badge: 'PAYMENTS' };
      default: return { title: 'Executive Control Console', badge: 'MANAGEMENT' };
    }
  };

  const sectionInfo = getSectionTitle();

  return (
    <div className="admin-page-container" style={{ maxWidth: '1540px', margin: '6px auto 20px auto', padding: '0 clamp(10px, 2vw, 20px)' }}>

      {/* Sleek Active Module Breadcrumb Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px', marginTop: '2px' }}>
        <div>
          <div style={{ fontSize: '0.70rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '2px' }}>
            {sectionInfo.badge}
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.3rem, 2.5vw, 1.85rem)', color: '#ffffff', margin: 0, lineHeight: 1.2 }}>
            {sectionInfo.title}
          </h1>
        </div>

        <button
          type="button"
          onClick={fetchData}
          className="btn-luxury-outline"
          style={{ padding: '6px 12px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          title="Refresh Data"
        >
          <RefreshCw size={13} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: OVERVIEW & ORDERS */}
      {/* ========================================================= */}
      {activeTab === 'overview' && (
        <div>
          {/* KPI Cards (4 Grid) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '14px', marginBottom: '20px' }}>

            <div className="glass-panel" style={{ padding: '22px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gross Revenue</span>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DollarSign size={18} color="#d4af37" />
                </div>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff' }}>
                ₹{Number(stats?.total_revenue || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#10b981', marginTop: '4px' }}>
                Active order volume
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '22px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Orders</span>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingBag size={18} color="#60a5fa" />
                </div>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff' }}>
                {stats?.total_orders || 0}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#f5df93', marginTop: '4px' }}>
                {stats?.pending_orders || 0} Pending dispatch
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '22px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>VIP Customers</span>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={18} color="#c084fc" />
                </div>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff' }}>
                {stats?.total_customers || 0}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '4px' }}>
                Registered Society Members
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '22px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Low Stock Bottles</span>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={18} color="#f43f5e" />
                </div>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f43f5e' }}>
                {stats?.low_stock_count || 0}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '4px' }}>
                Bottles &le; 10 inventory
              </div>
            </div>

          </div>

          {/* RECENT ORDERS TABLE */}
          <div className="glass-panel" style={{ borderRadius: '20px', padding: 'clamp(16px, 3vw, 28px)', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: '#ffffff' }}>
                Recent Customer Orders
              </h2>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '10px' }}>Order Ref</th>
                    <th style={{ padding: '10px' }}>Client Info</th>
                    <th style={{ padding: '10px' }}>Contact & Delivery</th>
                    <th style={{ padding: '10px' }}>Amount</th>
                    <th style={{ padding: '10px' }}>Payment Method</th>
                    <th style={{ padding: '10px' }}>Payment Status</th>
                    <th style={{ padding: '10px' }}>Fulfillment</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>No recent orders.</td>
                    </tr>
                  ) : (
                    recentOrders.map(ord => (
                      <tr key={ord.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px 10px', fontFamily: 'monospace', fontWeight: 700, color: '#f5df93' }}>
                          #{ord.order_number || ord.id}
                          <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'sans-serif', fontWeight: 400 }}>
                            {new Date(ord.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td style={{ padding: '12px 10px' }}>
                          <div style={{ fontWeight: 600, color: '#f8fafc' }}>{ord.shipping_name || ord.customer_name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{ord.customer_email}</div>
                        </td>
                        <td style={{ padding: '12px 10px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <strong style={{ color: '#f5df93', fontSize: '0.78rem', fontFamily: 'monospace' }}>
                                {ord.shipping_phone || ord.customer_phone || 'No phone'}
                              </strong>
                              {ord.shipping_phone && (
                                <a
                                  href={`https://wa.me/${ord.shipping_phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(ord.shipping_name || 'Customer')},%20this%20is%20TRY%20ME%20BRO%20Luxury%20Perfumes%20regarding%20order%20%23${ord.order_number || ord.id}.`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Chat on WhatsApp"
                                  style={{ color: '#25D366', display: 'inline-flex', alignItems: 'center' }}
                                >
                                  <MessageSquare size={13} />
                                </a>
                              )}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                              {ord.shipping_city ? `${ord.shipping_city}, ${ord.shipping_state || ''}` : 'Location N/A'}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 10px', fontWeight: 700, color: '#ffffff' }}>
                          ₹{Number(ord.final_amount || ord.total_amount).toLocaleString('en-IN')}
                          {ord.items && ord.items.length > 0 && (
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 400 }}>
                              {ord.items.length} item{ord.items.length > 1 ? 's' : ''}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px 10px' }}>
                          <span style={{
                            background: ord.payment_method === 'UPI' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                            border: ord.payment_method === 'UPI' ? '1px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.15)',
                            color: ord.payment_method === 'UPI' ? '#f5df93' : '#cbd5e1',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px'
                          }}>
                            {ord.payment_method}
                          </span>
                          {ord.notes && (
                            <div style={{ fontSize: '0.7rem', color: '#f5df93', marginTop: '3px', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              📝 {ord.notes}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px 10px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <span style={{
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              color: ord.payment_status === 'Paid' ? '#10b981' : (ord.payment_status === 'Failed' ? '#f43f5e' : '#f59e0b')
                            }}>
                              ● {ord.payment_status === 'Paid' ? 'Paid' : (ord.payment_status === 'Failed' ? 'Rejected' : 'Pending Verification')}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                              {ord.payment_status !== 'Paid' && (
                                <button
                                  onClick={() => handleUpdatePaymentStatus(ord.id, 'Paid')}
                                  title="Approve and verify payment"
                                  style={{
                                    background: 'rgba(16, 185, 129, 0.15)',
                                    border: '1px solid #10b981',
                                    borderRadius: '4px',
                                    color: '#10b981',
                                    fontSize: '0.68rem',
                                    padding: '2px 6px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '2px'
                                  }}
                                >
                                  ✓ Approve
                                </button>
                              )}
                              {ord.payment_status !== 'Failed' && (
                                <button
                                  onClick={() => handleUpdatePaymentStatus(ord.id, 'Failed')}
                                  title="Reject payment"
                                  style={{
                                    background: 'rgba(244, 63, 94, 0.15)',
                                    border: '1px solid #f43f5e',
                                    borderRadius: '4px',
                                    color: '#fda4af',
                                    fontSize: '0.68rem',
                                    padding: '2px 6px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '2px'
                                  }}
                                >
                                  ✕ Reject
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 10px' }}>
                          {(() => {
                            const st = getOrderStatusStyle(ord.order_status);
                            return (
                              <div style={{ position: 'relative', display: 'inline-block', width: '100%', minWidth: '155px' }}>
                                <div style={{
                                  position: 'relative',
                                  display: 'flex',
                                  alignItems: 'center',
                                  background: st.bg,
                                  border: `1px solid ${st.border}`,
                                  borderRadius: '9999px',
                                  boxShadow: st.glow,
                                  padding: '3px 8px 3px 10px',
                                  transition: 'all 0.25s ease'
                                }}>
                                  <span style={{
                                    width: '7px',
                                    height: '7px',
                                    borderRadius: '50%',
                                    background: st.dot,
                                    boxShadow: `0 0 6px ${st.dot}`,
                                    flexShrink: 0,
                                    marginRight: '6px'
                                  }} />

                                  <select
                                    value={ord.order_status}
                                    onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                                    style={{
                                      width: '100%',
                                      background: 'transparent',
                                      border: 'none',
                                      outline: 'none',
                                      color: st.color,
                                      fontSize: '0.78rem',
                                      fontWeight: 700,
                                      letterSpacing: '0.02em',
                                      cursor: 'pointer',
                                      appearance: 'none',
                                      WebkitAppearance: 'none',
                                      MozAppearance: 'none',
                                      padding: '3px 20px 3px 2px',
                                      textTransform: 'capitalize'
                                    }}
                                  >
                                    <option value="Pending" style={{ background: '#0b0f19', color: '#fef08a' }}>● Pending</option>
                                    <option value="Confirmed" style={{ background: '#0b0f19', color: '#99f6e4' }}>● Confirmed</option>
                                    <option value="Processing" style={{ background: '#0b0f19', color: '#fde047' }}>● Processing</option>
                                    <option value="Shipped" style={{ background: '#0b0f19', color: '#bfdbfe' }}>● Shipped</option>
                                    <option value="Out for Delivery" style={{ background: '#0b0f19', color: '#e9d5ff' }}>● Out for Delivery</option>
                                    <option value="Delivered" style={{ background: '#0b0f19', color: '#6ee7b7' }}>● Delivered</option>
                                    <option value="Cancelled" style={{ background: '#0b0f19', color: '#fecdd3' }}>● Cancelled</option>
                                  </select>

                                  <ChevronDown
                                    size={12}
                                    color={st.color}
                                    style={{
                                      position: 'absolute',
                                      right: '10px',
                                      pointerEvents: 'none',
                                      opacity: 0.85
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })()}
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                          <Link
                            to={`/admin/orders/${ord.id}`}
                            className="btn-luxury-gold"
                            style={{
                              padding: '7px 14px',
                              fontSize: '0.78rem',
                              borderRadius: '8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              whiteSpace: 'nowrap',
                              textDecoration: 'none',
                              fontWeight: 700
                            }}
                            title="View complete delivery address, update tracking and customer contact details"
                          >
                            <Eye size={14} /> View & Update
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: FRAGRANCE COLLECTIONS & PRODUCTS */}
      {/* ========================================================= */}
      {activeTab === 'products' && (
        <div className="glass-panel" style={{ borderRadius: '20px', padding: 'clamp(16px, 3vw, 28px)', marginBottom: '32px' }}>
          
          {/* Header & Add Button */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#ffffff', marginBottom: '4px' }}>
                Fragrance Catalog & Collections Manager
              </h2>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                Showing {filteredProducts.length} of {productsList.length} total perfume bottles
              </div>
            </div>

            <button
              onClick={() => navigate('/admin/products/new')}
              className="btn-luxury-gold"
              style={{ padding: '10px 20px', fontSize: '0.86rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Plus size={16} /> Add New Perfume Bottle
            </button>
          </div>

          {/* Filter / Search Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '10px', marginBottom: '14px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} color="#d4af37" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search perfumes by name, notes..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="form-input-luxury"
                style={{ paddingLeft: '36px', fontSize: '0.82rem' }}
              />
            </div>

            <select
              value={catalogCategoryFilter}
              onChange={(e) => setCatalogCategoryFilter(e.target.value)}
              className="form-input-luxury"
              style={{ fontSize: '0.82rem' }}
            >
              <option value="">All Categories / Families</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              value={catalogBrandFilter}
              onChange={(e) => setCatalogBrandFilter(e.target.value)}
              className="form-input-luxury"
              style={{ fontSize: '0.82rem' }}
            >
              <option value="">All Brands / Houses</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Quick Prestige Filter Tabs (New Arrivals, Bestsellers, Highest Rated, Featured) */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            alignItems: 'center',
            marginBottom: '20px',
            padding: '8px 12px',
            background: 'rgba(12, 16, 25, 0.75)',
            borderRadius: '12px',
            border: '1px solid rgba(212, 175, 55, 0.15)'
          }}>
            <span style={{ fontSize: '0.72rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginRight: '4px' }}>
              Collection Tags:
            </span>

            {[
              { id: '', label: 'All Flacons', count: productsList.length },
              { id: 'new_arrival', label: '🚀 New Arrivals', count: productsList.filter(p => p.is_new_arrival).length },
              { id: 'best_seller', label: '👑 Bestsellers', count: productsList.filter(p => p.is_best_seller).length },
              { id: 'top_rated', label: '⭐ Highest Rated (4.8★+)', count: productsList.filter(p => Number(p.rating || 0) >= 4.8).length },
              { id: 'featured', label: '✨ Featured', count: productsList.filter(p => p.is_featured).length }
            ].map(tab => {
              const isActive = catalogBadgeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCatalogBadgeFilter(tab.id)}
                  style={{
                    background: isActive ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.3) 0%, rgba(212, 175, 55, 0.1) 100%)' : 'rgba(255, 255, 255, 0.04)',
                    border: isActive ? '1px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '5px 12px',
                    fontSize: '0.74rem',
                    color: isActive ? '#f5df93' : '#94a3b8',
                    cursor: 'pointer',
                    fontWeight: isActive ? 700 : 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 0 12px rgba(212, 175, 55, 0.25)' : 'none'
                  }}
                >
                  <span>{tab.label}</span>
                  <span style={{
                    background: isActive ? '#080a0f' : 'rgba(255, 255, 255, 0.08)',
                    color: isActive ? '#d4af37' : '#64748b',
                    borderRadius: '10px',
                    padding: '1px 6px',
                    fontSize: '0.66rem',
                    fontWeight: 700
                  }}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Products Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '14px' }}>
            {filteredProducts.map(prod => (
              <div 
                key={prod.id} 
                className="glass-card" 
                style={{ 
                  padding: '14px', 
                  borderRadius: '16px', 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '12px', 
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  background: 'linear-gradient(165deg, rgba(16, 21, 31, 0.85) 0%, rgba(10, 13, 20, 0.95) 100%)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <img 
                    src={prod.primary_image} 
                    alt={prod.name} 
                    style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', border: '1px solid rgba(212, 175, 55, 0.35)', flexShrink: 0 }} 
                  />
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.7rem', color: '#d4af37', fontWeight: 700, textTransform: 'uppercase' }}>
                        {prod.brand_name || 'TRY ME BRO'}
                      </span>
                      {prod.category_name && (
                        <span style={{ fontSize: '0.66rem', color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: '4px' }}>
                          {prod.category_name}
                        </span>
                      )}
                      {(prod.bottle_sizes || prod.volume_ml) && (
                        <span style={{ fontSize: '0.66rem', color: '#f5df93', background: 'rgba(212, 175, 55, 0.12)', border: '1px solid rgba(212, 175, 55, 0.3)', padding: '1px 6px', borderRadius: '4px' }}>
                          {prod.bottle_sizes || `${prod.volume_ml}ml`}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.94rem', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {prod.name}
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '3px' }}>
                      <strong style={{ color: '#f5df93' }}>₹{Number(prod.discount_price || prod.price).toLocaleString('en-IN')}</strong>
                      {prod.discount_price && <span style={{ fontSize: '0.72rem', color: '#64748b', textDecoration: 'line-through', marginLeft: '6px' }}>₹{Number(prod.price).toLocaleString('en-IN')}</span>}
                      {' • '}
                      <span style={{ color: prod.stock_quantity <= 10 ? '#f43f5e' : '#10b981', fontWeight: 600, fontSize: '0.78rem' }}>
                        {prod.stock_quantity} in stock
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                    <button
                      onClick={() => navigate(`/admin/products/edit/${prod.id}`)}
                      className="btn-luxury-outline"
                      style={{ padding: '6px 10px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      title="Edit Perfume Details"
                    >
                      <Edit size={13} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(prod.id)}
                      style={{ background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: '4px', textAlign: 'center', fontSize: '0.74rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      title="Delete Product"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Direct 1-Click Toggle Prestige Badges Bar */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '6px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  paddingTop: '10px',
                  marginTop: '2px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                    {/* New Arrival Toggle */}
                    <button
                      type="button"
                      onClick={() => handleQuickToggleBadge(prod, 'is_new_arrival')}
                      title="Click to toggle New Arrival status for this fragrance"
                      style={{
                        background: prod.is_new_arrival ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                        border: prod.is_new_arrival ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                        color: prod.is_new_arrival ? '#6ee7b7' : '#64748b',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Rocket size={10} color={prod.is_new_arrival ? '#10b981' : '#64748b'} />
                      <span>New Arrival</span>
                      <span style={{ fontWeight: 800 }}>{prod.is_new_arrival ? '✓' : '+'}</span>
                    </button>

                    {/* Bestseller Toggle */}
                    <button
                      type="button"
                      onClick={() => handleQuickToggleBadge(prod, 'is_best_seller')}
                      title="Click to toggle Bestseller status for this fragrance"
                      style={{
                        background: prod.is_best_seller ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                        border: prod.is_best_seller ? '1px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.08)',
                        color: prod.is_best_seller ? '#f5df93' : '#64748b',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Crown size={10} color={prod.is_best_seller ? '#d4af37' : '#64748b'} />
                      <span>Bestseller</span>
                      <span style={{ fontWeight: 800 }}>{prod.is_best_seller ? '✓' : '+'}</span>
                    </button>

                    {/* Featured Toggle */}
                    <button
                      type="button"
                      onClick={() => handleQuickToggleBadge(prod, 'is_featured')}
                      title="Click to toggle Featured Collection status"
                      style={{
                        background: prod.is_featured ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                        border: prod.is_featured ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
                        color: prod.is_featured ? '#93c5fd' : '#64748b',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Sparkles size={10} color={prod.is_featured ? '#60a5fa' : '#64748b'} />
                      <span>Featured</span>
                      <span style={{ fontWeight: 800 }}>{prod.is_featured ? '✓' : '+'}</span>
                    </button>
                  </div>

                  {/* Star Rating Badge */}
                  <div
                    title="Customer rating score and verified review count"
                    style={{
                      background: 'rgba(212, 175, 55, 0.08)',
                      border: '1px solid rgba(212, 175, 55, 0.25)',
                      color: '#f5df93',
                      borderRadius: '6px',
                      padding: '3px 7px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Star size={11} color="#d4af37" fill="#d4af37" />
                    <span>{Number(prod.rating || 5.0).toFixed(1)}★</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.64rem', fontWeight: 500 }}>({prod.num_reviews || 0})</span>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: CATEGORIES & FRAGRANCE FAMILIES */}
      {/* ========================================================= */}
      {activeTab === 'categories' && (
        <div className="glass-panel" style={{ borderRadius: '20px', padding: 'clamp(14px, 3vw, 28px)', marginBottom: '32px' }}>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.15rem, 4vw, 1.4rem)', color: '#ffffff', marginBottom: '4px' }}>
                Fragrance Categories & Accords Manager
              </h2>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Manage collections, olfactive families, and scent classifications
              </div>
            </div>

            <button
              onClick={openAddCategoryModal}
              className="btn-luxury-gold"
              style={{ padding: '8px 18px', fontSize: '0.82rem' }}
            >
              <Plus size={15} /> Add New Category
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '14px' }}>
            {categories.map(cat => (
              <div 
                key={cat.id} 
                className="glass-card" 
                style={{ 
                  padding: '14px', 
                  borderRadius: '16px', 
                  display: 'flex', 
                  gap: '12px', 
                  alignItems: 'flex-start',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  boxSizing: 'border-box'
                }}
              >
                <img 
                  src={cat.image || 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=400&q=80'} 
                  alt={cat.name} 
                  style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover', border: '1px solid rgba(212, 175, 55, 0.4)', flexShrink: 0 }} 
                />

                <div style={{ flex: 1, minWidth: 0, paddingRight: '2px' }}>
                  <div style={{ fontSize: '0.96rem', fontWeight: 600, color: '#f8fafc', wordBreak: 'break-word' }}>
                    {cat.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#d4af37', fontFamily: 'monospace', marginBottom: '4px', wordBreak: 'break-all' }}>
                    slug: /{cat.slug}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {cat.description || 'Artisanal luxury fragrance accord collection.'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>
                    {cat.product_count || 0} Products Assigned
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                  <button
                    onClick={() => openEditCategoryModal(cat)}
                    className="btn-luxury-outline"
                    style={{ padding: '5px 9px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    title="Edit Category"
                  >
                    <Edit size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    style={{ background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: '4px', textAlign: 'center', fontSize: '0.74rem' }}
                    title="Delete Category"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: BRANDS & DESIGNER HOUSES */}
      {/* ========================================================= */}
      {activeTab === 'brands' && (
        <div className="glass-panel" style={{ borderRadius: '20px', padding: 'clamp(14px, 3vw, 28px)', marginBottom: '32px' }}>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.15rem, 4vw, 1.4rem)', color: '#ffffff', marginBottom: '4px' }}>
                Brands & Designer Houses Manager
              </h2>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Manage luxury perfume brands, logos, banners, and heritage provenance
              </div>
            </div>

            <button
              onClick={openAddBrandModal}
              className="btn-luxury-gold"
              style={{ padding: '8px 18px', fontSize: '0.82rem' }}
            >
              <Plus size={15} /> Add New Brand House
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '14px' }}>
            {brands.map(brand => (
              <div 
                key={brand.id} 
                className="glass-card" 
                style={{ 
                  padding: '14px', 
                  borderRadius: '16px', 
                  display: 'flex', 
                  gap: '12px', 
                  alignItems: 'flex-start',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  boxSizing: 'border-box'
                }}
              >
                <img 
                  src={brand.logo || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=300&q=80'} 
                  alt={brand.name} 
                  style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover', border: '1px solid rgba(212, 175, 55, 0.4)', flexShrink: 0 }} 
                />

                <div style={{ flex: 1, minWidth: 0, paddingRight: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '0.96rem', fontWeight: 600, color: '#f8fafc', wordBreak: 'break-word' }}>
                      {brand.name}
                    </div>
                    {brand.is_featured && (
                      <span style={{ fontSize: '0.6rem', background: 'rgba(212, 175, 55, 0.2)', color: '#f5df93', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                        FEATURED
                      </span>
                    )}
                  </div>
                  
                  <div style={{ fontSize: '0.7rem', color: '#d4af37', fontFamily: 'monospace', marginBottom: '2px', wordBreak: 'break-all' }}>
                    slug: /{brand.slug} • {brand.origin_country || 'France'}
                  </div>

                  <div style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {brand.description || 'Prestige fragrance designer house.'}
                  </div>

                  <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>
                    {brand.product_count || 0} Perfumes in House
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                  <button
                    onClick={() => openEditBrandModal(brand)}
                    className="btn-luxury-outline"
                    style={{ padding: '5px 9px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    title="Edit Brand"
                  >
                    <Edit size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBrand(brand.id, brand.name)}
                    style={{ background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: '4px', textAlign: 'center', fontSize: '0.74rem' }}
                    title="Delete Brand"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: RAZORPAY PAYMENT GATEWAY & UPI CONFIGURATION */}
      {/* ========================================================= */}
      {activeTab === 'upi' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '36px' }}>
          
          {/* Header Bar with Save Action */}
          <div className="glass-panel" style={{
            borderRadius: '20px',
            padding: '24px 28px',
            border: '1px solid var(--border-gold)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            background: 'linear-gradient(135deg, rgba(20, 26, 38, 0.95) 0%, rgba(10, 13, 20, 0.98) 100%)'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CreditCard size={14} color="#d4af37" /> PAYMENT SETTLEMENT & GATEWAY
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#ffffff', margin: 0 }}>
                Online Payment & Settlement Settings
              </h2>
              <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                Enable or disable Online Payments (Razorpay/UPI) and Cash on Delivery (COD) instantly across your storefront.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={handleSavePaymentSettings}
                disabled={isSavingPayment}
                className="btn-luxury-gold"
                style={{ padding: '12px 28px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 18px rgba(212, 175, 55, 0.4)' }}
              >
                <Save size={16} />
                {isSavingPayment ? 'Saving Settings...' : 'Save & Apply Payment Settings'}
              </button>
            </div>
          </div>

          {/* MASTER TOGGLE SWITCHES ROW: ONLINE PAYMENT & COD */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '18px' }}>
            
            {/* 1. Master Switch: Razorpay Online Payment */}
            <div className="glass-panel" style={{
              borderRadius: '18px',
              padding: '22px',
              border: paymentSettings.is_razorpay_enabled ? '1.5px solid rgba(16, 185, 129, 0.5)' : '1.5px solid rgba(239, 68, 68, 0.5)',
              background: paymentSettings.is_razorpay_enabled 
                ? 'linear-gradient(145deg, rgba(16, 185, 129, 0.1) 0%, rgba(10, 15, 24, 0.95) 100%)' 
                : 'linear-gradient(145deg, rgba(239, 68, 68, 0.1) 0%, rgba(10, 15, 24, 0.95) 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '16px',
              transition: 'all 0.3s ease'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CreditCard size={20} color={paymentSettings.is_razorpay_enabled ? '#34d399' : '#f87171'} />
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>Online Payment Gateway</span>
                  </div>
                  <span style={{
                    background: paymentSettings.is_razorpay_enabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    border: paymentSettings.is_razorpay_enabled ? '1px solid #10b981' : '1px solid #ef4444',
                    color: paymentSettings.is_razorpay_enabled ? '#34d399' : '#f87171',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {paymentSettings.is_razorpay_enabled ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {paymentSettings.is_razorpay_enabled ? 'ONLINE ACTIVE' : 'ONLINE DISABLED'}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.45', margin: '6px 0 0 0' }}>
                  Accepts <strong>UPI (GPay, PhonePe, Paytm, QR), Credit & Debit Cards, NetBanking, and Wallets</strong> via Razorpay.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Storefront Status: <strong style={{ color: paymentSettings.is_razorpay_enabled ? '#34d399' : '#f87171' }}>{paymentSettings.is_razorpay_enabled ? 'Accepting Payments' : 'Turned OFF'}</strong>
                </span>
                
                <button
                  type="button"
                  onClick={() => setPaymentSettings(prev => ({ ...prev, is_razorpay_enabled: !prev.is_razorpay_enabled }))}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    border: paymentSettings.is_razorpay_enabled ? '1px solid #10b981' : '1px solid #ef4444',
                    background: paymentSettings.is_razorpay_enabled ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
                    color: paymentSettings.is_razorpay_enabled ? '#34d399' : '#fca5a5',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {paymentSettings.is_razorpay_enabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  <span>{paymentSettings.is_razorpay_enabled ? 'DISABLE ONLINE' : 'ENABLE ONLINE'}</span>
                </button>
              </div>
            </div>

            {/* 2. Master Switch: Cash on Delivery (COD) */}
            <div className="glass-panel" style={{
              borderRadius: '18px',
              padding: '22px',
              border: paymentSettings.is_cod_enabled ? '1.5px solid rgba(16, 185, 129, 0.5)' : '1.5px solid rgba(239, 68, 68, 0.5)',
              background: paymentSettings.is_cod_enabled 
                ? 'linear-gradient(145deg, rgba(16, 185, 129, 0.1) 0%, rgba(10, 15, 24, 0.95) 100%)' 
                : 'linear-gradient(145deg, rgba(239, 68, 68, 0.1) 0%, rgba(10, 15, 24, 0.95) 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '16px',
              transition: 'all 0.3s ease'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Truck size={20} color={paymentSettings.is_cod_enabled ? '#34d399' : '#f87171'} />
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>Cash on Delivery (COD)</span>
                  </div>
                  <span style={{
                    background: paymentSettings.is_cod_enabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    border: paymentSettings.is_cod_enabled ? '1px solid #10b981' : '1px solid #ef4444',
                    color: paymentSettings.is_cod_enabled ? '#34d399' : '#f87171',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {paymentSettings.is_cod_enabled ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {paymentSettings.is_cod_enabled ? 'COD ACTIVE' : 'COD DISABLED'}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.45', margin: '6px 0 0 0' }}>
                  Allows customers to pay in cash or via courier UPI scanner upon receiving parcel at their doorstep.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Storefront Status: <strong style={{ color: paymentSettings.is_cod_enabled ? '#34d399' : '#f87171' }}>{paymentSettings.is_cod_enabled ? 'Enabled at Checkout' : 'Turned OFF'}</strong>
                </span>
                
                <button
                  type="button"
                  onClick={() => setPaymentSettings(prev => ({ ...prev, is_cod_enabled: !prev.is_cod_enabled }))}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    border: paymentSettings.is_cod_enabled ? '1px solid #10b981' : '1px solid #ef4444',
                    background: paymentSettings.is_cod_enabled ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
                    color: paymentSettings.is_cod_enabled ? '#34d399' : '#fca5a5',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {paymentSettings.is_cod_enabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  <span>{paymentSettings.is_cod_enabled ? 'DISABLE COD' : 'ENABLE COD'}</span>
                </button>
              </div>
            </div>

          </div>

          <form onSubmit={handleSavePaymentSettings}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '24px', alignItems: 'start' }}>

              {/* Left Column: Razorpay API Credentials & Payment Methods Form */}
              <div className="glass-card" style={{ padding: '24px', borderRadius: '18px', border: '1px solid rgba(212, 175, 55, 0.3)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={18} color="#d4af37" />
                    <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#ffffff' }}>Razorpay Gateway Details</h3>
                  </div>
                  <span style={{
                    background: paymentSettings.razorpay_mode === 'live' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(212, 175, 55, 0.2)',
                    border: paymentSettings.razorpay_mode === 'live' ? '1px solid #10b981' : '1px solid #d4af37',
                    color: paymentSettings.razorpay_mode === 'live' ? '#34d399' : '#f5df93',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px'
                  }}>
                    {paymentSettings.razorpay_mode === 'live' ? '🟢 LIVE PRODUCTION' : '🧪 TEST SANDBOX'}
                  </span>
                </div>

                {/* Gateway Mode Toggle */}
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#f5df93', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                    Gateway Environment Mode
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setPaymentSettings({ ...paymentSettings, razorpay_mode: 'test' })}
                      style={{
                        flex: 1,
                        padding: '9px 12px',
                        borderRadius: '8px',
                        background: paymentSettings.razorpay_mode === 'test' ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                        border: paymentSettings.razorpay_mode === 'test' ? '1.5px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: paymentSettings.razorpay_mode === 'test' ? '#fef08a' : '#94a3b8',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      🧪 Test / Sandbox Mode
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentSettings({ ...paymentSettings, razorpay_mode: 'live' })}
                      style={{
                        flex: 1,
                        padding: '9px 12px',
                        borderRadius: '8px',
                        background: paymentSettings.razorpay_mode === 'live' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                        border: paymentSettings.razorpay_mode === 'live' ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: paymentSettings.razorpay_mode === 'live' ? '#34d399' : '#94a3b8',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      🟢 Live Production Mode
                    </button>
                  </div>
                </div>

                {/* Razorpay Key ID */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.78rem', color: '#f5df93', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Razorpay Key ID *
                    </label>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Public Key</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={paymentSettings.razorpay_key_id}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, razorpay_key_id: e.target.value.trim() })}
                    placeholder="rzp_test_TbWUGrGr4J0GGV"
                    className="form-input-luxury"
                    style={{ fontSize: '0.92rem', fontFamily: 'monospace', fontWeight: 700 }}
                  />
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                    Obtain from your <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noreferrer" style={{ color: '#d4af37', textDecoration: 'underline' }}>Razorpay Dashboard API Keys</a>.
                  </div>
                </div>

                {/* Razorpay Key Secret */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.78rem', color: '#f5df93', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Razorpay Key Secret *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                      style={{ background: 'transparent', border: 'none', color: '#d4af37', cursor: 'pointer', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      {showRazorpaySecret ? <EyeOff size={13} /> : <Eye size={13} />}
                      <span>{showRazorpaySecret ? 'Hide' : 'Show Secret'}</span>
                    </button>
                  </div>
                  <input
                    type={showRazorpaySecret ? 'text' : 'password'}
                    required
                    value={paymentSettings.razorpay_key_secret}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, razorpay_key_secret: e.target.value.trim() })}
                    placeholder="T10EQGw0uKDliPGGmV2SkFoW"
                    className="form-input-luxury"
                    style={{ fontSize: '0.92rem', fontFamily: 'monospace', fontWeight: 700 }}
                  />
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                    Used securely on backend server to authenticate transactions.
                  </div>
                </div>

                {/* Merchant Business Name */}
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#f5df93', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                    Merchant Business / Store Name
                  </label>
                  <input
                    type="text"
                    value={paymentSettings.business_name}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, business_name: e.target.value, payee_name: e.target.value })}
                    placeholder="TRY ME BRO Luxury Perfumes"
                    className="form-input-luxury"
                    style={{ fontSize: '0.9rem' }}
                  />
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                    Displayed in the Razorpay Checkout popup header and payment receipt emails.
                  </div>
                </div>

                {/* Merchant UPI ID / VPA */}
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#f5df93', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                    Merchant Direct UPI ID / VPA
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={paymentSettings.merchant_upi_id}
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        setPaymentSettings({ ...paymentSettings, merchant_upi_id: val });
                        setUpiSettings(prev => ({ ...prev, upiId: val }));
                      }}
                      placeholder="9510367164@pthdfc"
                      className="form-input-luxury"
                      style={{ fontSize: '0.92rem', fontFamily: 'monospace', fontWeight: 700 }}
                    />
                  </div>

                  {/* Quick Handle Selection Pills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Quick handles:</span>
                    {['@okhdfcbank', '@okaxis', '@oksbi', '@paytm', '@ybl', '@ibl'].map(handle => (
                      <button
                        key={handle}
                        type="button"
                        onClick={() => {
                          const currentPrefix = (paymentSettings.merchant_upi_id || '').includes('@') 
                            ? paymentSettings.merchant_upi_id.split('@')[0] 
                            : (paymentSettings.merchant_upi_id || '9510367164');
                          const newId = currentPrefix + handle;
                          setPaymentSettings({ ...paymentSettings, merchant_upi_id: newId });
                          setUpiSettings(prev => ({ ...prev, upiId: newId }));
                        }}
                        style={{
                          background: 'rgba(212, 175, 55, 0.1)',
                          border: '1px solid rgba(212, 175, 55, 0.3)',
                          borderRadius: '6px',
                          padding: '2px 8px',
                          color: '#f5df93',
                          fontSize: '0.72rem',
                          cursor: 'pointer'
                        }}
                      >
                        {handle}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ paddingTop: '8px' }}>
                  <button
                    type="submit"
                    disabled={isSavingPayment}
                    className="btn-luxury-gold"
                    style={{ width: '100%', padding: '12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Save size={16} />
                    {isSavingPayment ? 'Saving Settings...' : 'Save & Update Payment Gateway'}
                  </button>
                </div>

              </div>

              {/* Right Column: Live Status & Merchant QR Preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Gateway Status Badge Card */}
                <div className="glass-card" style={{ padding: '24px', borderRadius: '18px', border: '1.5px solid rgba(212, 175, 55, 0.4)', background: 'linear-gradient(145deg, rgba(15, 20, 30, 0.95) 0%, rgba(8, 10, 15, 0.98) 100%)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Zap size={18} color="#d4af37" />
                      <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#ffffff' }}>Live Checkout Status</h3>
                    </div>
                    <span style={{
                      background: paymentSettings.is_razorpay_enabled ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)',
                      border: paymentSettings.is_razorpay_enabled ? '1px solid #10b981' : '1px solid #ef4444',
                      color: paymentSettings.is_razorpay_enabled ? '#34d399' : '#f87171',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 9px',
                      borderRadius: '9999px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {paymentSettings.is_razorpay_enabled ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {paymentSettings.is_razorpay_enabled ? 'ONLINE READY' : 'ONLINE OFF'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#94a3b8' }}>Online Payment:</span>
                      <span style={{
                        fontWeight: 700,
                        color: paymentSettings.is_razorpay_enabled ? '#34d399' : '#f87171',
                        background: paymentSettings.is_razorpay_enabled ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        {paymentSettings.is_razorpay_enabled ? '🟢 ENABLED' : '🔴 DISABLED'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#94a3b8' }}>Cash On Delivery:</span>
                      <span style={{
                        fontWeight: 700,
                        color: paymentSettings.is_cod_enabled ? '#34d399' : '#f87171',
                        background: paymentSettings.is_cod_enabled ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        {paymentSettings.is_cod_enabled ? '🟢 ENABLED' : '🔴 DISABLED'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Active Key ID:</span>
                      <strong style={{ color: '#f5df93', fontFamily: 'monospace' }}>{paymentSettings.razorpay_key_id}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Environment:</span>
                      <strong style={{ color: paymentSettings.razorpay_mode === 'live' ? '#34d399' : '#fef08a' }}>
                        {paymentSettings.razorpay_mode === 'live' ? 'Live Production' : 'Test Sandbox'}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Security Level:</span>
                      <strong style={{ color: '#34d399' }}>PCI-DSS Level 1 Compliant</strong>
                    </div>
                  </div>
                </div>

                {/* Live Merchant QR Preview */}
                <div className="glass-card" style={{ padding: '24px', borderRadius: '18px', border: '1px solid rgba(212, 175, 55, 0.3)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <QrCode size={16} /> Live Merchant UPI QR Code
                  </div>

                  {/* Dynamic QR Display */}
                  <div style={{
                    background: '#ffffff',
                    padding: '14px',
                    borderRadius: '16px',
                    display: 'inline-block',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.7)',
                    marginBottom: '14px'
                  }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=${paymentSettings.merchant_upi_id || '9510367164@pthdfc'}&pn=${encodeURIComponent(paymentSettings.business_name || 'TRY ME BRO')}&am=${previewTestAmount}&cu=INR&tn=${encodeURIComponent('TRY ME BRO Order')}`)}&margin=8`}
                      alt="Live Generated QR"
                      style={{ width: '150px', height: '150px', display: 'block', objectFit: 'contain' }}
                    />
                  </div>

                  <div style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    borderRadius: '12px',
                    padding: '8px 12px',
                    marginBottom: '12px',
                    fontSize: '0.76rem',
                    color: '#10b981',
                    fontWeight: 700
                  }}>
                    🔒 Auto-Locks Amount: ₹{Number(previewTestAmount || 0).toLocaleString('en-IN')}
                  </div>

                  <div style={{ fontSize: '0.88rem', color: '#f8fafc', fontWeight: 700 }}>
                    {paymentSettings.business_name || 'TRY ME BRO Luxury Perfumes'}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#f5df93', marginTop: '3px', fontFamily: 'monospace', fontWeight: 600 }}>
                    VPA: {paymentSettings.merchant_upi_id || '9510367164@pthdfc'}
                  </div>

                  {/* Live Test Amount Adjuster */}
                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Test QR Amount:</span>
                    <input
                      type="number"
                      value={previewTestAmount}
                      onChange={(e) => setPreviewTestAmount(e.target.value)}
                      style={{
                        background: '#0a0d14',
                        border: '1px solid #d4af37',
                        borderRadius: '6px',
                        color: '#f5df93',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        width: '85px',
                        padding: '3px 8px',
                        textAlign: 'center'
                      }}
                    />
                  </div>
                </div>

              </div>

            </div>
          </form>
        </div>
      )}


      {/* ========================================================= */}
      {/* ========================================================= */}
      {/* TAB: STORE DELIVERY CHARGES & FREE DELIVERY THRESHOLD */}
      {/* ========================================================= */}
      {activeTab === 'shipping' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Header Bar with Save Action */}
          <div className="glass-panel" style={{
            borderRadius: '20px',
            padding: '24px 28px',
            border: '1px solid var(--border-gold)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            background: 'linear-gradient(135deg, rgba(20, 26, 38, 0.9) 0%, rgba(10, 13, 20, 0.95) 100%)'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Truck size={14} color="#d4af37" /> STORE DELIVERY CHARGES
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#ffffff', margin: 0 }}>
                Fixed Delivery Charges & Free Shipping Settings
              </h2>
              <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                Set a flat fixed delivery fee for customers anywhere across India, and optionally configure free delivery for orders above a specific amount.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={handleSaveShippingConfig}
                disabled={isSavingShipping}
                className="btn-luxury-gold"
                style={{ padding: '12px 28px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 18px rgba(212, 175, 55, 0.4)' }}
              >
                <Save size={16} />
                {isSavingShipping ? 'Saving Settings...' : 'Save & Update Delivery Charges'}
              </button>
            </div>
          </div>

          {/* Grid: 2 Columns (Left: Rate Configuration Form, Right: Live Sandbox Simulator) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '24px', alignItems: 'start' }}>
            
            {/* 1. Rate Configuration Form */}
            <div className="glass-card" style={{ padding: '24px', borderRadius: '18px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
                <SlidersHorizontal size={18} color="#d4af37" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#ffffff' }}>Fixed Delivery Charges</h3>
              </div>

              <form onSubmit={handleSaveShippingConfig} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Fixed Delivery Charge */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#f5df93', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Fixed Delivery Charge Anywhere (₹) *
                    </label>
                    <span style={{ background: 'rgba(212, 175, 55, 0.18)', border: '1px solid #d4af37', color: '#fef08a', fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      FLAT RATE
                    </span>
                  </div>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1"
                      value={shippingSettings.fixed_delivery_charge !== undefined ? shippingSettings.fixed_delivery_charge : (shippingSettings.base_fee || 100)}
                      onChange={(e) => setShippingSettings({ ...shippingSettings, fixed_delivery_charge: e.target.value, base_fee: e.target.value })}
                      placeholder="100"
                      className="form-input-luxury"
                      style={{ fontSize: '1.1rem', fontWeight: 700, paddingRight: '50px' }}
                    />
                    <span style={{ position: 'absolute', right: '14px', color: '#d4af37', fontWeight: 700, fontSize: '0.9rem', pointerEvents: 'none' }}>
                      ₹
                    </span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '4px' }}>
                    This exact delivery charge of <strong>₹{shippingSettings.fixed_delivery_charge !== undefined ? shippingSettings.fixed_delivery_charge : (shippingSettings.base_fee || 100)}</strong> will be charged to customers anywhere across India (unless they qualify for free shipping).
                  </div>
                </div>

                {/* Free Shipping Threshold */}
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#f5df93', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                    Free Delivery Order Minimum (₹)
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={shippingSettings.free_shipping_threshold}
                      onChange={(e) => setShippingSettings({ ...shippingSettings, free_shipping_threshold: e.target.value })}
                      placeholder="5000"
                      className="form-input-luxury"
                      style={{ fontSize: '1rem', fontWeight: 700, paddingRight: '50px' }}
                    />
                    <span style={{ position: 'absolute', right: '14px', color: '#d4af37', fontWeight: 700, fontSize: '0.9rem', pointerEvents: 'none' }}>
                      ₹
                    </span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '4px' }}>
                    Orders with total cart value equal to or above <strong>₹{Number(shippingSettings.free_shipping_threshold || 0).toLocaleString('en-IN')}</strong> will get 100% Free Delivery. (Set to <strong>0</strong> if you never want free delivery).
                  </div>
                </div>

                {/* Store Hub PIN Code */}
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Store Dispatch Location
                  </label>
                  <input
                    type="text"
                    value={`${shippingSettings.origin_city || 'Kalol'}, Gujarat (PIN ${shippingSettings.origin_pincode || '382721'})`}
                    disabled
                    className="form-input-luxury"
                    style={{ fontSize: '0.85rem', color: '#94a3b8', opacity: 0.8 }}
                  />
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                    All orders are dispatched from our central store hub in Kalol, Gujarat (382721).
                  </div>
                </div>

                <div style={{ paddingTop: '8px' }}>
                  <button
                    type="submit"
                    disabled={isSavingShipping}
                    className="btn-luxury-gold"
                    style={{ width: '100%', padding: '12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Save size={16} />
                    {isSavingShipping ? 'Saving Settings...' : 'Save & Apply Delivery Charges'}
                  </button>
                </div>

              </form>
            </div>

            {/* 2. Interactive Delivery Preview & Simulator */}
            <div className="glass-card" style={{ padding: '24px', borderRadius: '18px', border: '1.5px solid rgba(212, 175, 55, 0.4)', background: 'linear-gradient(145deg, rgba(15, 20, 30, 0.95) 0%, rgba(8, 10, 15, 0.98) 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Rocket size={18} color="#d4af37" />
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#ffffff' }}>Customer Checkout Preview</h3>
                </div>
                <span className="badge-gold" style={{ fontSize: '0.7rem' }}>LIVE PREVIEW</span>
              </div>

              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '16px' }}>
                Test how the fixed delivery charge or free delivery waiver is presented to customers during checkout.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                
                <div>
                  <label style={{ fontSize: '0.76rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Test Destination PIN Code:
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={testPincode}
                    onChange={(e) => setTestPincode(e.target.value)}
                    placeholder="e.g. 380001 or 400001"
                    className="form-input-luxury"
                    style={{ fontSize: '0.95rem', fontFamily: 'monospace', fontWeight: 700 }}
                  />

                  {/* Quick Test PIN Buttons */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                    {[
                      { pin: '382721', name: 'Kalol' },
                      { pin: '380001', name: 'Ahmedabad' },
                      { pin: '395001', name: 'Surat' },
                      { pin: '400001', name: 'Mumbai' },
                      { pin: '110001', name: 'Delhi' },
                      { pin: '560001', name: 'Bengaluru' }
                    ].map(p => (
                      <button
                        key={p.pin}
                        type="button"
                        onClick={() => setTestPincode(p.pin)}
                        style={{
                          background: testPincode === p.pin ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                          border: testPincode === p.pin ? '1px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '6px',
                          padding: '2px 8px',
                          color: testPincode === p.pin ? '#fef08a' : '#cbd5e1',
                          fontSize: '0.7rem',
                          cursor: 'pointer'
                        }}
                      >
                        {p.name} ({p.pin})
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Test Order Subtotal (₹):
                  </label>
                  <input
                    type="number"
                    value={testSubtotal}
                    onChange={(e) => setTestSubtotal(e.target.value)}
                    placeholder="3500"
                    className="form-input-luxury"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleRunDistanceTest}
                  disabled={testCalculating}
                  className="btn-luxury-gold"
                  style={{ padding: '10px 18px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Sparkles size={15} />
                  {testCalculating ? 'Checking Delivery...' : 'Check Delivery Charge'}
                </button>
              </div>

              {/* Live Test Results Card */}
              {testDistanceResult && (
                <div style={{
                  background: 'rgba(212, 175, 55, 0.08)',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  borderRadius: '14px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#f5df93', fontWeight: 700 }}>Calculation Results</span>
                    <span style={{
                      background: testDistanceResult.is_free ? 'rgba(16, 185, 129, 0.2)' : 'rgba(212, 175, 55, 0.2)',
                      color: testDistanceResult.is_free ? '#6ee7b7' : '#fef08a',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '9999px'
                    }}>
                      {testDistanceResult.is_free ? 'FREE DELIVERY' : 'FIXED DELIVERY'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem' }}>
                    <div>
                      <span style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'block' }}>Dispatch Origin:</span>
                      <strong style={{ color: '#ffffff' }}>PIN {testDistanceResult.origin_pincode} ({testDistanceResult.origin_city})</strong>
                    </div>

                    <div>
                      <span style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'block' }}>Destination:</span>
                      <strong style={{ color: '#ffffff' }}>PIN {testDistanceResult.destination_pincode} {testDistanceResult.destination_city ? `(${testDistanceResult.destination_city})` : ''}</strong>
                    </div>

                    <div>
                      <span style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'block' }}>Delivery Type:</span>
                      <span style={{ color: '#d4af37', fontSize: '1rem', fontWeight: 800 }}>
                        Fixed Rate
                      </span>
                    </div>

                    <div>
                      <span style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'block' }}>Delivery Fee:</span>
                      <span style={{ color: testDistanceResult.is_free ? '#10b981' : '#ffffff', fontSize: '1.1rem', fontWeight: 800 }}>
                        {testDistanceResult.is_free ? '₹0 (Free Delivery)' : `₹${testDistanceResult.final_shipping_fee}`}
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.72rem', color: '#cbd5e1', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '8px' }}>
                    {testDistanceResult.is_free 
                      ? `🎉 Free Delivery applied because subtotal (₹${testSubtotal}) meets minimum order value of ₹${testDistanceResult.free_shipping_threshold}.`
                      : `Flat Delivery Charge of ₹${testDistanceResult.final_shipping_fee} applied.`}
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB: RETURNS & REFUNDS CONCIERGE */}
      {/* ========================================================= */}
      {activeTab === 'returns' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Header Bar */}
          <div className="glass-panel" style={{
            borderRadius: '20px',
            padding: '24px 28px',
            border: '1px solid var(--border-gold)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            background: 'linear-gradient(135deg, rgba(20, 26, 38, 0.9) 0%, rgba(10, 13, 20, 0.95) 100%)'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: '4px' }}>
                CLIENT CONCIERGE & AFTERSALES
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#ffffff', margin: 0 }}>
                Product Returns & Refund Management
              </h2>
              <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                Review customer return applications, approve doorstep pickups, assign courier tracking numbers, and manage store return policy terms.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={fetchReturnsData}
                className="btn-luxury-outline"
                style={{ padding: '10px 18px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={14} /> Refresh Returns
              </button>
            </div>
          </div>

          {/* 4 Return KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '16px' }}>
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Total Applications</span>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RotateCcw size={16} color="#d4af37" />
                </div>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
                {returnStats?.total || returnRequests.length}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                Lifetime return requests
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.74rem', color: '#f5df93', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Pending Review</span>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={16} color="#f59e0b" />
                </div>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fde68a' }}>
                {returnStats?.pending || returnRequests.filter(r => r.status === 'Requested').length}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#f5df93', marginTop: '4px' }}>
                Needs concierge action
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.74rem', color: '#93c5fd', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Approved / In Pickup</span>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Truck size={16} color="#60a5fa" />
                </div>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#93c5fd' }}>
                {returnStats?.approved || returnRequests.filter(r => r.status === 'Approved').length}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                Pickup in progress
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.74rem', color: '#6ee7b7', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Completed Refunds</span>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={16} color="#10b981" />
                </div>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#6ee7b7' }}>
                ₹{Number(returnStats?.totalRefundAmount || returnRequests.reduce((s, r) => s + (Number(r.refund_amount) || 0), 0)).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#6ee7b7', marginTop: '4px' }}>
                Settled refund volume
              </div>
            </div>
          </div>

          {/* Search, Filter & Return Requests Section */}
          <div className="glass-panel" style={{ borderRadius: '20px', padding: 'clamp(16px, 3vw, 28px)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
              
              {/* Search Bar */}
              <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '420px', width: '100%' }}>
                <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search by Return #, Order #, Client, Fragrance..."
                  value={returnSearch}
                  onChange={(e) => setReturnSearch(e.target.value)}
                  className="form-input-luxury"
                  style={{ paddingLeft: '40px', fontSize: '0.84rem', width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              {/* Status Filter Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {[
                  { id: 'all', label: 'All Requests' },
                  { id: 'Requested', label: 'Pending Review' },
                  { id: 'Approved', label: 'Approved' },
                  { id: 'Completed', label: 'Completed' },
                  { id: 'Rejected', label: 'Rejected' }
                ].map(flt => (
                  <button
                    key={flt.id}
                    type="button"
                    onClick={() => setReturnStatusFilter(flt.id)}
                    style={{
                      background: returnStatusFilter === flt.id ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                      border: returnStatusFilter === flt.id ? '1px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.08)',
                      color: returnStatusFilter === flt.id ? '#f5df93' : '#94a3b8',
                      padding: '7px 14px',
                      borderRadius: '10px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {flt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop Table View */}
            <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch', borderRadius: '12px' }}>
              <table style={{ width: '100%', minWidth: '920px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.06em' }}>
                    <th style={{ padding: '14px 12px', fontWeight: 700 }}>Return Ref</th>
                    <th style={{ padding: '14px 12px', fontWeight: 700 }}>Client Info</th>
                    <th style={{ padding: '14px 12px', fontWeight: 700 }}>Order & Applied Date</th>
                    <th style={{ padding: '14px 12px', fontWeight: 700 }}>Fragrance Item</th>
                    <th style={{ padding: '14px 12px', fontWeight: 700 }}>Reason & Proof</th>
                    <th style={{ padding: '14px 12px', fontWeight: 700 }}>Refund Amount</th>
                    <th style={{ padding: '14px 12px', fontWeight: 700 }}>Status</th>
                    <th style={{ padding: '14px 12px', textAlign: 'center', fontWeight: 700 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReturnRequests.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '48px 20px', color: '#94a3b8' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <RotateCcw size={28} color="#64748b" />
                          <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>No return applications found matching the selected filter.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredReturnRequests.map(ret => {
                      const st = ret.status || 'Requested';

                      // Modern Luxury Status Badge Generator
                      const renderBadge = () => {
                        if (st === 'Approved') {
                          return (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              padding: '5px 12px',
                              borderRadius: '9999px',
                              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.18) 0%, rgba(37, 99, 235, 0.25) 100%)',
                              color: '#93c5fd',
                              border: '1px solid rgba(147, 197, 253, 0.45)',
                              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)',
                              whiteSpace: 'nowrap'
                            }}>
                              <Truck size={13} color="#93c5fd" />
                              <span>Approved</span>
                            </span>
                          );
                        }

                        if (st === 'Completed' || st === 'Refunded') {
                          return (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              padding: '5px 12px',
                              borderRadius: '9999px',
                              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(5, 150, 105, 0.25) 100%)',
                              color: '#6ee7b7',
                              border: '1px solid rgba(110, 231, 183, 0.45)',
                              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)',
                              whiteSpace: 'nowrap'
                            }}>
                              <CheckCircle2 size={13} color="#6ee7b7" />
                              <span>Refunded</span>
                            </span>
                          );
                        }

                        if (st === 'Rejected') {
                          return (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              padding: '5px 12px',
                              borderRadius: '9999px',
                              background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.18) 0%, rgba(225, 29, 72, 0.25) 100%)',
                              color: '#fda4af',
                              border: '1px solid rgba(253, 164, 175, 0.45)',
                              boxShadow: '0 2px 8px rgba(244, 63, 94, 0.2)',
                              whiteSpace: 'nowrap'
                            }}>
                              <XCircle size={13} color="#fda4af" />
                              <span>Rejected</span>
                            </span>
                          );
                        }

                        // Default: Requested / Pending
                        return (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            padding: '5px 12px',
                            borderRadius: '9999px',
                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(217, 119, 6, 0.25) 100%)',
                            color: '#fde68a',
                            border: '1px solid rgba(253, 230, 138, 0.45)',
                            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.2)',
                            whiteSpace: 'nowrap'
                          }}>
                            <Clock size={13} color="#fde047" />
                            <span>Pending Review</span>
                          </span>
                        );
                      };

                      return (
                        <tr key={ret.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.15s ease' }}>
                          <td style={{ padding: '14px 12px', fontFamily: 'monospace', fontWeight: 700, color: '#f5df93', verticalAlign: 'middle' }}>
                            #{ret.return_number}
                          </td>
                          <td style={{ padding: '14px 12px', verticalAlign: 'middle' }}>
                            <div style={{ fontWeight: 600, color: '#f8fafc' }}>{ret.user_name || 'Client'}</div>
                            <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{ret.user_email}</div>
                            {ret.user_phone && <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{ret.user_phone}</div>}
                          </td>
                          <td style={{ padding: '14px 12px', verticalAlign: 'middle' }}>
                            <div style={{ color: '#cbd5e1', fontWeight: 600 }}>#{ret.order_number}</div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                              {new Date(ret.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </td>
                          <td style={{ padding: '14px 12px', verticalAlign: 'middle' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {ret.product_image && (
                                <img src={ret.product_image} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(212, 175, 55, 0.3)', flexShrink: 0 }} />
                              )}
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.84rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                                  {ret.product_name}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Qty: {ret.quantity} {ret.selected_size ? `• ${ret.selected_size}` : ''}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '14px 12px', maxWidth: '220px', verticalAlign: 'middle' }}>
                            <div style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 500, lineHeight: 1.35 }}>
                              "{ret.reason}"
                            </div>
                            {ret.image_proof && (
                              <a href={ret.image_proof} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.72rem', color: '#60a5fa', textDecoration: 'underline', marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <ImageIcon size={11} /> View Attached Photo Proof ↗
                              </a>
                            )}
                          </td>
                          <td style={{ padding: '14px 12px', fontWeight: 800, color: '#10b981', fontSize: '0.92rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                            ₹{Number(ret.refund_amount || 0).toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '14px 12px', verticalAlign: 'middle' }}>
                            {renderBadge()}
                          </td>
                          <td style={{ padding: '14px 12px', textAlign: 'center', verticalAlign: 'middle' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenReturnReviewModal(ret)}
                              className="btn-luxury-gold"
                              style={{
                                padding: '7px 14px',
                                fontSize: '0.78rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                whiteSpace: 'nowrap',
                                fontWeight: 700,
                                borderRadius: '10px'
                              }}
                            >
                              <RotateCcw size={13} />
                              <span>Review & Process</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* GLOBAL RETURN POLICY & REPLACEMENT SETTINGS */}
          <div className="glass-panel" style={{ borderRadius: '20px', padding: 'clamp(18px, 3vw, 28px)', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#ffffff', fontFamily: 'var(--font-serif)' }}>
                  Global Store Return & Refund Policy Terms
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                  Sets the default return window and legal guarantee text for all perfumes unless overridden individually.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveGlobalReturnSettings}
                disabled={isSavingReturnSettings}
                className="btn-luxury-gold"
                style={{ padding: '10px 22px', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Save size={15} />
                {isSavingReturnSettings ? 'Saving Policy...' : 'Save Global Policy'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '18px', marginBottom: '18px' }}>
              {/* Default Window */}
              <div>
                <label style={{ fontSize: '0.78rem', color: '#f5df93', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Default Store Return Window (Days) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={globalReturnSettings.default_return_window || 7}
                  onChange={(e) => setGlobalReturnSettings({ ...globalReturnSettings, default_return_window: Number(e.target.value) || 7 })}
                  className="form-input-luxury"
                  style={{ fontSize: '0.88rem', width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              {/* Support Email */}
              <div>
                <label style={{ fontSize: '0.78rem', color: '#f5df93', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Concierge Support Email
                </label>
                <input
                  type="email"
                  value={globalReturnSettings.support_email || ''}
                  onChange={(e) => setGlobalReturnSettings({ ...globalReturnSettings, support_email: e.target.value })}
                  placeholder="returns@scentvogue.com"
                  className="form-input-luxury"
                  style={{ fontSize: '0.88rem', width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              {/* Support Phone */}
              <div>
                <label style={{ fontSize: '0.78rem', color: '#f5df93', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Concierge Hotline / WhatsApp
                </label>
                <input
                  type="text"
                  value={globalReturnSettings.support_phone || ''}
                  onChange={(e) => setGlobalReturnSettings({ ...globalReturnSettings, support_phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="form-input-luxury"
                  style={{ fontSize: '0.88rem', width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Global Policy Terms Textarea */}
            <div>
              <label style={{ fontSize: '0.78rem', color: '#f5df93', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Default Global Return & Hygiene Policy Terms (Shown on Product Details Pages)
              </label>
              <textarea
                rows={3}
                value={globalReturnSettings.global_policy_text || ''}
                onChange={(e) => setGlobalReturnSettings({ ...globalReturnSettings, global_policy_text: e.target.value })}
                placeholder="e.g. Eligible for return or replacement within 7 days of delivery. Perfume flacon must be unopened, in its original box with cellophane seal intact..."
                className="form-input-luxury"
                style={{ fontSize: '0.84rem', width: '100%', boxSizing: 'border-box', lineHeight: 1.5 }}
              />
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: FILTER & SEARCH SETTINGS */}
      {/* ========================================================= */}
      {activeTab === 'filters' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Header Bar with Save Action */}
          <div className="glass-panel" style={{
            borderRadius: '20px',
            padding: '24px 28px',
            border: '1px solid var(--border-gold)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            background: 'linear-gradient(135deg, rgba(20, 26, 38, 0.9) 0%, rgba(10, 13, 20, 0.95) 100%)'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: '4px' }}>
                DYNAMIC STORE ENGINE
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#ffffff', margin: 0 }}>
                Store Filters, Presets & Discovery Controls
              </h2>
              <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                Configure, enable, or edit filter sections, audience accords, price tiers, and discovery texts in real-time.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={handleSaveFilterConfig}
                disabled={isSavingFilters}
                className="btn-luxury-gold"
                style={{ padding: '12px 28px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 18px rgba(212, 175, 55, 0.4)' }}
              >
                <Save size={16} />
                {isSavingFilters ? 'Publishing Live...' : 'Save & Publish Live Filters'}
              </button>
            </div>
          </div>

          {/* Grid Layout: Controls & Previews */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '24px' }}>
            
            {/* 1. Filter Section Visibility Switcher */}
            <div className="glass-card" style={{ padding: '24px', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
                <SlidersHorizontal size={18} color="#d4af37" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#ffffff' }}>Filter Sections Visibility</h3>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '18px' }}>
                Choose which filter widgets are shown to customers on the Shop page & mobile modal.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { key: 'showSearch', label: 'Search Notes or Name Input', desc: 'Keyword search inside perfume notes & catalog' },
                  { key: 'showGender', label: 'Gender Accord Selector', desc: 'Men, Women, Unisex & custom audience cards' },
                  { key: 'showCategories', label: 'Fragrance Families (Categories)', desc: 'Chips for Woody, Oriental, Floral, etc.' },
                  { key: 'showBrands', label: 'Brand & Perfumer Houses', desc: 'Chips for Chanel, Creed, Dior, Tom Ford, etc.' },
                  { key: 'showPrice', label: 'Price Range & Budget Presets', desc: 'Min/Max inputs and quick price tier buttons' },
                  { key: 'showInStock', label: 'In-Stock Only Filter Toggle', desc: 'Quick switch to hide out-of-stock perfumes' }
                ].map(sec => {
                  const isChecked = filterConfig.sections?.[sec.key] !== false;
                  return (
                    <div
                      key={sec.key}
                      onClick={() => handleToggleSection(sec.key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: isChecked ? 'rgba(212, 175, 55, 0.08)' : 'rgba(15, 20, 30, 0.4)',
                        border: isChecked ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: isChecked ? '#f5df93' : '#94a3b8' }}>
                          {sec.label}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                          {sec.desc}
                        </div>
                      </div>

                      <div style={{ color: isChecked ? '#10b981' : '#64748b', display: 'flex', alignItems: 'center' }}>
                        {isChecked ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Banner & Discovery Header Customizer */}
            <div className="glass-card" style={{ padding: '24px', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
                <Sparkles size={18} color="#d4af37" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#ffffff' }}>Banner & Search Placeholders</h3>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '18px' }}>
                Customize the top catalog banner headlines and the search input placeholder prompt.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', color: '#f5df93', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Banner Subtitle Tag
                  </label>
                  <input
                    type="text"
                    value={filterConfig.bannerSubtitle || ''}
                    onChange={(e) => setFilterConfig(prev => ({ ...prev, bannerSubtitle: e.target.value }))}
                    placeholder="e.g. HAUTE PARFUMERIE COLLECTION"
                    className="form-input-luxury"
                    style={{ fontSize: '0.84rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', color: '#f5df93', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Banner Main Title
                  </label>
                  <input
                    type="text"
                    value={filterConfig.bannerTitle || ''}
                    onChange={(e) => setFilterConfig(prev => ({ ...prev, bannerTitle: e.target.value }))}
                    placeholder="e.g. Explore Our Fragrance Sanctuary"
                    className="form-input-luxury"
                    style={{ fontSize: '0.84rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', color: '#f5df93', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Banner Description
                  </label>
                  <textarea
                    rows={2}
                    value={filterConfig.bannerDescription || ''}
                    onChange={(e) => setFilterConfig(prev => ({ ...prev, bannerDescription: e.target.value }))}
                    placeholder="Describe your collection..."
                    className="form-input-luxury"
                    style={{ fontSize: '0.84rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', color: '#f5df93', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Search Input Placeholder
                  </label>
                  <input
                    type="text"
                    value={filterConfig.searchPlaceholder || ''}
                    onChange={(e) => setFilterConfig(prev => ({ ...prev, searchPlaceholder: e.target.value }))}
                    placeholder="e.g. Amber, Vanilla, Oud, Sauvage..."
                    className="form-input-luxury"
                    style={{ fontSize: '0.84rem' }}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* 3. Gender Accords Builder */}
          <div className="glass-card" style={{ padding: '24px', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '18px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="#d4af37" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#ffffff' }}>Gender & Audience Accords</h3>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Customize audience pills, labels (e.g. Men / Pour Homme), and add custom audience filters.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddGender}
                className="btn-luxury-outline"
                style={{ padding: '6px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={14} /> Add Accord Option
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '14px' }}>
              {(filterConfig.genders || []).map((g, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(15, 20, 30, 0.6)',
                    border: g.active ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '14px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: '#d4af37', fontWeight: 700, textTransform: 'uppercase' }}>
                      Option #{idx + 1}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleUpdateGender(idx, 'active', !g.active)}
                        style={{
                          background: g.active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                          border: g.active ? '1px solid #10b981' : '1px solid #64748b',
                          color: g.active ? '#10b981' : '#94a3b8',
                          borderRadius: '6px',
                          padding: '2px 8px',
                          fontSize: '0.68rem',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        {g.active ? 'Active' : 'Disabled'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveGender(idx)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                        title="Delete Accord"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>ID / Code</label>
                      <input
                        type="text"
                        value={g.id || ''}
                        onChange={(e) => handleUpdateGender(idx, 'id', e.target.value)}
                        placeholder="e.g. Men"
                        className="form-input-luxury"
                        style={{ padding: '6px 8px', fontSize: '0.78rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Display Label</label>
                      <input
                        type="text"
                        value={g.label || ''}
                        onChange={(e) => handleUpdateGender(idx, 'label', e.target.value)}
                        placeholder="e.g. Men"
                        className="form-input-luxury"
                        style={{ padding: '6px 8px', fontSize: '0.78rem' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Subtitle Tag</label>
                    <input
                      type="text"
                      value={g.sub || ''}
                      onChange={(e) => handleUpdateGender(idx, 'sub', e.target.value)}
                      placeholder="e.g. Pour Homme"
                      className="form-input-luxury"
                      style={{ padding: '6px 8px', fontSize: '0.78rem' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Price Presets Builder */}
          <div className="glass-card" style={{ padding: '24px', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '18px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={18} color="#d4af37" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#ffffff' }}>Price Range Quick Presets</h3>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Configure one-tap budget preset chips shown to shoppers (e.g. Under ₹5K, ₹5K - ₹15K).
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddPricePreset}
                className="btn-luxury-outline"
                style={{ padding: '6px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={14} /> Add Price Preset
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 250px), 1fr))', gap: '14px' }}>
              {(filterConfig.pricePresets || []).map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(15, 20, 30, 0.6)',
                    border: p.active ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '14px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: '#d4af37', fontWeight: 700, textTransform: 'uppercase' }}>
                      Preset #{idx + 1}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleUpdatePricePreset(idx, 'active', !p.active)}
                        style={{
                          background: p.active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                          border: p.active ? '1px solid #10b981' : '1px solid #64748b',
                          color: p.active ? '#10b981' : '#94a3b8',
                          borderRadius: '6px',
                          padding: '2px 8px',
                          fontSize: '0.68rem',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        {p.active ? 'Active' : 'Disabled'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemovePricePreset(idx)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                        title="Delete Preset"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Chip Label</label>
                    <input
                      type="text"
                      value={p.label || ''}
                      onChange={(e) => handleUpdatePricePreset(idx, 'label', e.target.value)}
                      placeholder="e.g. Under ₹5K"
                      className="form-input-luxury"
                      style={{ padding: '6px 8px', fontSize: '0.78rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Min Price (₹)</label>
                      <input
                        type="number"
                        value={p.min || ''}
                        onChange={(e) => handleUpdatePricePreset(idx, 'min', e.target.value)}
                        placeholder="0 or empty"
                        className="form-input-luxury"
                        style={{ padding: '6px 8px', fontSize: '0.78rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Max Price (₹)</label>
                      <input
                        type="number"
                        value={p.max || ''}
                        onChange={(e) => handleUpdatePricePreset(idx, 'max', e.target.value)}
                        placeholder="5000 or empty"
                        className="form-input-luxury"
                        style={{ padding: '6px 8px', fontSize: '0.78rem' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Shortcuts to Edit Categories & Brands */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '14px' }}>
            <div className="glass-card" style={{ padding: '16px', borderRadius: '16px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, minWidth: '160px' }}>
                <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '0.94rem' }}>Fragrance Categories ({categories.length})</h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.74rem', color: '#94a3b8' }}>Add or edit family names, slugs & description notes.</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('categories')}
                className="btn-luxury-outline"
                style={{ padding: '7px 14px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
              >
                Manage Categories
              </button>
            </div>

            <div className="glass-card" style={{ padding: '16px', borderRadius: '16px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, minWidth: '160px' }}>
                <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '0.94rem' }}>Perfumer Brands ({brands.length})</h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.74rem', color: '#94a3b8' }}>Add or edit brand names, logos & country tags.</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('brands')}
                className="btn-luxury-outline"
                style={{ padding: '7px 14px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
              >
                Manage Brands
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB: BANNERS & HERO SWIPER MANAGEMENT */}
      {/* ========================================================= */}
      {activeTab === 'banners' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Header Bar with Save Action */}
          <div className="glass-panel" style={{
            borderRadius: '20px',
            padding: '24px 28px',
            border: '1px solid var(--border-gold)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            background: 'linear-gradient(135deg, rgba(20, 26, 38, 0.9) 0%, rgba(10, 13, 20, 0.95) 100%)'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: '4px' }}>
                VISUAL PRESENTATION ENGINE
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#ffffff', margin: 0 }}>
                Hero Swiper, Video & Image Banners
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                Manage the main homepage carousel slides, 4K cinematic video banner, promotional image banner, and toggles to show or hide each on the store.
              </p>
            </div>

            <button
              type="button"
              disabled={isSavingBanners}
              onClick={handleSaveBannerConfig}
              className="btn-luxury-gold"
              style={{ padding: '12px 26px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', opacity: isSavingBanners ? 0.7 : 1 }}
            >
              {isSavingBanners ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              {isSavingBanners ? 'Saving Banners...' : 'Save All Banner Settings'}
            </button>
          </div>

          {/* 1. MASTER VISIBILITY SWITCHBOARD (SHOW / HIDE CONTROLS) */}
          <div className="glass-card" style={{ padding: '24px', borderRadius: '18px', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Eye size={20} color="#d4af37" />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#ffffff' }}>Customer Store Visibility Switches</h3>
                <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                  Choose which banner sections appear on the user homepage dashboard in real-time.
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
              
              {/* Hero Swiper Switch */}
              <div style={{
                background: 'rgba(15, 20, 30, 0.7)',
                border: bannerConfig.showHeroSwiper !== false ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>Top Hero Swiper</span>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: bannerConfig.showHeroSwiper !== false ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.2)',
                      color: bannerConfig.showHeroSwiper !== false ? '#10b981' : '#94a3b8',
                      border: bannerConfig.showHeroSwiper !== false ? '1px solid #10b981' : '1px solid #64748b'
                    }}>
                      {bannerConfig.showHeroSwiper !== false ? 'VISIBLE' : 'HIDDEN'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.76rem', color: '#94a3b8', margin: 0, lineHeight: 1.45 }}>
                    The first sliding hero carousel with luxury typography and action buttons.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setBannerConfig(prev => ({ ...prev, showHeroSwiper: !prev.showHeroSwiper }))}
                  className={bannerConfig.showHeroSwiper !== false ? "btn-luxury-gold" : "btn-luxury-outline"}
                  style={{ padding: '8px 14px', fontSize: '0.8rem', width: '100%', justifyContent: 'center' }}
                >
                  {bannerConfig.showHeroSwiper !== false ? <EyeOff size={14} /> : <Eye size={14} />}
                  {bannerConfig.showHeroSwiper !== false ? 'Hide Hero Swiper' : 'Show Hero Swiper on Website'}
                </button>
              </div>

              {/* Video Banner Switch */}
              <div style={{
                background: 'rgba(15, 20, 30, 0.7)',
                border: bannerConfig.showVideoBanner !== false ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>Cinematic Video Banner</span>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: bannerConfig.showVideoBanner !== false ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.2)',
                      color: bannerConfig.showVideoBanner !== false ? '#10b981' : '#94a3b8',
                      border: bannerConfig.showVideoBanner !== false ? '1px solid #10b981' : '1px solid #64748b'
                    }}>
                      {bannerConfig.showVideoBanner !== false ? 'VISIBLE' : 'HIDDEN'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.76rem', color: '#94a3b8', margin: 0, lineHeight: 1.45 }}>
                    Full-width cinematic ambient video container with live playback & sound toggle.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setBannerConfig(prev => ({ ...prev, showVideoBanner: !prev.showVideoBanner }))}
                  className={bannerConfig.showVideoBanner !== false ? "btn-luxury-gold" : "btn-luxury-outline"}
                  style={{ padding: '8px 14px', fontSize: '0.8rem', width: '100%', justifyContent: 'center' }}
                >
                  {bannerConfig.showVideoBanner !== false ? <EyeOff size={14} /> : <Eye size={14} />}
                  {bannerConfig.showVideoBanner !== false ? 'Hide Video Banner' : 'Show Video Banner on Website'}
                </button>
              </div>

              {/* Image Banner Switch */}
              <div style={{
                background: 'rgba(15, 20, 30, 0.7)',
                border: bannerConfig.showImageBanner !== false ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>Promotional Image Banner</span>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: bannerConfig.showImageBanner !== false ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.2)',
                      color: bannerConfig.showImageBanner !== false ? '#10b981' : '#94a3b8',
                      border: bannerConfig.showImageBanner !== false ? '1px solid #10b981' : '1px solid #64748b'
                    }}>
                      {bannerConfig.showImageBanner !== false ? 'VISIBLE' : 'HIDDEN'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.76rem', color: '#94a3b8', margin: 0, lineHeight: 1.45 }}>
                    Exclusive promotional card with custom background, perk badge, and direct shop link.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setBannerConfig(prev => ({ ...prev, showImageBanner: !prev.showImageBanner }))}
                  className={bannerConfig.showImageBanner !== false ? "btn-luxury-gold" : "btn-luxury-outline"}
                  style={{ padding: '8px 14px', fontSize: '0.8rem', width: '100%', justifyContent: 'center' }}
                >
                  {bannerConfig.showImageBanner !== false ? <EyeOff size={14} /> : <Eye size={14} />}
                  {bannerConfig.showImageBanner !== false ? 'Hide Image Banner' : 'Show Image Banner on Website'}
                </button>
              </div>

            </div>
          </div>

          {/* 2. HERO SWIPER SLIDES EDITOR */}
          <div className="glass-card" style={{ padding: '24px', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '18px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#d4af37" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#ffffff' }}>Hero Swiper Carousel Slides ({bannerConfig.heroSlides?.length || 0})</h3>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Edit the headline, gold text, description, call-to-actions, and upload background images for each slide.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddHeroSlide}
                className="btn-luxury-gold"
                style={{ padding: '7px 16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={15} /> Add New Slide
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {(bannerConfig.heroSlides || []).map((slide, idx) => (
                <div
                  key={slide.id || idx}
                  style={{
                    background: 'rgba(12, 16, 25, 0.85)',
                    border: slide.active !== false ? '1px solid rgba(212, 175, 55, 0.35)' : '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '16px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.84rem', color: '#f5df93', fontWeight: 700 }}>
                        Slide #{idx + 1}
                      </span>
                      {slide.title && (
                        <span style={{ fontSize: '0.76rem', color: '#cbd5e1', fontStyle: 'italic' }}>
                          – {slide.title.slice(0, 30)}...
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleUpdateHeroSlide(idx, 'active', slide.active === false)}
                        style={{
                          background: slide.active !== false ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                          border: slide.active !== false ? '1px solid #10b981' : '1px solid #64748b',
                          color: slide.active !== false ? '#10b981' : '#94a3b8',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        {slide.active !== false ? 'Active' : 'Disabled'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveHeroSlide(idx)}
                        disabled={(bannerConfig.heroSlides || []).length <= 1}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: (bannerConfig.heroSlides || []).length <= 1 ? '#475569' : '#ef4444',
                          cursor: (bannerConfig.heroSlides || []).length <= 1 ? 'not-allowed' : 'pointer',
                          padding: '4px'
                        }}
                        title="Delete Slide"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Grid for Slide Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.74rem', color: '#f5df93', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                        Badge / Tag
                      </label>
                      <input
                        type="text"
                        value={slide.tag || ''}
                        onChange={(e) => handleUpdateHeroSlide(idx, 'tag', e.target.value)}
                        placeholder="e.g. LUXURY PERFUMES 2026"
                        className="form-input-luxury"
                        style={{ fontSize: '0.82rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', color: '#f5df93', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                        Main Title Headline *
                      </label>
                      <input
                        type="text"
                        value={slide.title || ''}
                        onChange={(e) => handleUpdateHeroSlide(idx, 'title', e.target.value)}
                        placeholder="e.g. The Alchemy of Rare Notes &"
                        className="form-input-luxury"
                        style={{ fontSize: '0.82rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', color: '#f5df93', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                        Golden Highlight Accent Text
                      </label>
                      <input
                        type="text"
                        value={slide.highlight || ''}
                        onChange={(e) => handleUpdateHeroSlide(idx, 'highlight', e.target.value)}
                        placeholder="e.g. Pure Perfumes"
                        className="form-input-luxury"
                        style={{ fontSize: '0.82rem' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                      Slide Subtitle / Description
                    </label>
                    <textarea
                      rows={2}
                      value={slide.description || ''}
                      onChange={(e) => handleUpdateHeroSlide(idx, 'description', e.target.value)}
                      placeholder="Immerse your senses in handcrafted compositions..."
                      className="form-input-luxury"
                      style={{ fontSize: '0.82rem' }}
                    />
                  </div>

                  {/* CTAs */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Primary Button Text</label>
                      <input
                        type="text"
                        value={slide.primaryBtnText || ''}
                        onChange={(e) => handleUpdateHeroSlide(idx, 'primaryBtnText', e.target.value)}
                        placeholder="e.g. Explore Fragrances"
                        className="form-input-luxury"
                        style={{ fontSize: '0.8rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Primary Button Link</label>
                      <input
                        type="text"
                        value={slide.primaryBtnLink || ''}
                        onChange={(e) => handleUpdateHeroSlide(idx, 'primaryBtnLink', e.target.value)}
                        placeholder="/shop or quiz"
                        className="form-input-luxury"
                        style={{ fontSize: '0.8rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Secondary Button Text</label>
                      <input
                        type="text"
                        value={slide.secondaryBtnText || ''}
                        onChange={(e) => handleUpdateHeroSlide(idx, 'secondaryBtnText', e.target.value)}
                        placeholder="e.g. Find Scent Profile"
                        className="form-input-luxury"
                        style={{ fontSize: '0.8rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Secondary Button Link</label>
                      <input
                        type="text"
                        value={slide.secondaryBtnLink || ''}
                        onChange={(e) => handleUpdateHeroSlide(idx, 'secondaryBtnLink', e.target.value)}
                        placeholder="quiz or /about"
                        className="form-input-luxury"
                        style={{ fontSize: '0.8rem' }}
                      />
                    </div>
                  </div>

                  {/* Device Image Uploader for Hero Slide */}
                  <div>
                    <ImageUploadField
                      id={`hero-slide-${idx}`}
                      label="Slide Background Photo (Local Device File / Camera / URL)"
                      value={slide.image}
                      onChange={(url) => handleUpdateHeroSlide(idx, 'image', url)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. CINEMATIC VIDEO BANNER EDITOR */}
          <div className="glass-card" style={{ padding: '24px', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '18px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Film size={18} color="#d4af37" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#ffffff' }}>Cinematic Video Banner Section</h3>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Configure the ultra-luxury video player, ambient video loop URL, fallback poster, and action buttons.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setBannerConfig(prev => ({
                    ...prev,
                    videoBanner: {
                      ...prev.videoBanner,
                      enabled: prev.videoBanner?.enabled === false ? true : false
                    }
                  }))}
                  style={{
                    background: bannerConfig.videoBanner?.enabled !== false ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                    border: bannerConfig.videoBanner?.enabled !== false ? '1px solid #10b981' : '1px solid #64748b',
                    color: bannerConfig.videoBanner?.enabled !== false ? '#10b981' : '#94a3b8',
                    borderRadius: '6px',
                    padding: '5px 12px',
                    fontSize: '0.76rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  {bannerConfig.videoBanner?.enabled !== false ? 'Section Active' : 'Section Disabled'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', color: '#f5df93', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                    Badge Tag
                  </label>
                  <input
                    type="text"
                    value={bannerConfig.videoBanner?.tag || ''}
                    onChange={(e) => setBannerConfig(prev => ({ ...prev, videoBanner: { ...prev.videoBanner, tag: e.target.value } }))}
                    placeholder="e.g. CINEMATIC EXPERIENCE"
                    className="form-input-luxury"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', color: '#f5df93', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                    Main Headline
                  </label>
                  <input
                    type="text"
                    value={bannerConfig.videoBanner?.title || ''}
                    onChange={(e) => setBannerConfig(prev => ({ ...prev, videoBanner: { ...prev.videoBanner, title: e.target.value } }))}
                    placeholder="e.g. The Art of Haute Parfumerie in Motion"
                    className="form-input-luxury"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', color: '#f5df93', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                    Golden Highlight Accent
                  </label>
                  <input
                    type="text"
                    value={bannerConfig.videoBanner?.highlight || ''}
                    onChange={(e) => setBannerConfig(prev => ({ ...prev, videoBanner: { ...prev.videoBanner, highlight: e.target.value } }))}
                    placeholder="e.g. Pure Elegance"
                    className="form-input-luxury"
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  Video Banner Description
                </label>
                <textarea
                  rows={2}
                  value={bannerConfig.videoBanner?.description || ''}
                  onChange={(e) => setBannerConfig(prev => ({ ...prev, videoBanner: { ...prev.videoBanner, description: e.target.value } }))}
                  placeholder="Witness the craftsmanship of rare natural distillations..."
                  className="form-input-luxury"
                />
              </div>

              {/* Direct Device Video Uploader for Video Banner */}
              <div>
                <VideoUploadField
                  id="cinematic-banner-video"
                  label="Cinematic Video (Upload Direct File from Device or Paste Link)"
                  value={bannerConfig.videoBanner?.videoUrl}
                  onChange={(url) => setBannerConfig(prev => ({ ...prev, videoBanner: { ...prev.videoBanner, videoUrl: url } }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Button Text</label>
                  <input
                    type="text"
                    value={bannerConfig.videoBanner?.primaryBtnText || ''}
                    onChange={(e) => setBannerConfig(prev => ({ ...prev, videoBanner: { ...prev.videoBanner, primaryBtnText: e.target.value } }))}
                    placeholder="Discover Masterpieces"
                    className="form-input-luxury"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Button Link</label>
                  <input
                    type="text"
                    value={bannerConfig.videoBanner?.primaryBtnLink || ''}
                    onChange={(e) => setBannerConfig(prev => ({ ...prev, videoBanner: { ...prev.videoBanner, primaryBtnLink: e.target.value } }))}
                    placeholder="/shop"
                    className="form-input-luxury"
                  />
                </div>
              </div>

              {/* Poster Image Device Upload */}
              <div>
                <ImageUploadField
                  id="video-poster"
                  label="Video Fallback Poster Image (Local Device / Gallery / URL)"
                  value={bannerConfig.videoBanner?.posterImage}
                  onChange={(url) => setBannerConfig(prev => ({ ...prev, videoBanner: { ...prev.videoBanner, posterImage: url } }))}
                />
              </div>

            </div>
          </div>

          {/* 4. PROMOTIONAL IMAGE BANNER EDITOR */}
          <div className="glass-card" style={{ padding: '24px', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '18px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ImageIcon size={18} color="#d4af37" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#ffffff' }}>Exclusive Promotional Image Banner</h3>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Configure the promotional highlight card, discount perk, showcase photography, and direct link.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setBannerConfig(prev => ({
                    ...prev,
                    imageBanner: {
                      ...prev.imageBanner,
                      enabled: prev.imageBanner?.enabled === false ? true : false
                    }
                  }))}
                  style={{
                    background: bannerConfig.imageBanner?.enabled !== false ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                    border: bannerConfig.imageBanner?.enabled !== false ? '1px solid #10b981' : '1px solid #64748b',
                    color: bannerConfig.imageBanner?.enabled !== false ? '#10b981' : '#94a3b8',
                    borderRadius: '6px',
                    padding: '5px 12px',
                    fontSize: '0.76rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  {bannerConfig.imageBanner?.enabled !== false ? 'Section Active' : 'Section Disabled'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', color: '#f5df93', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                    Badge Tag
                  </label>
                  <input
                    type="text"
                    value={bannerConfig.imageBanner?.tag || ''}
                    onChange={(e) => setBannerConfig(prev => ({ ...prev, imageBanner: { ...prev.imageBanner, tag: e.target.value } }))}
                    placeholder="e.g. EXCLUSIVE PRIVATE RESERVE"
                    className="form-input-luxury"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', color: '#f5df93', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                    Main Headline
                  </label>
                  <input
                    type="text"
                    value={bannerConfig.imageBanner?.title || ''}
                    onChange={(e) => setBannerConfig(prev => ({ ...prev, imageBanner: { ...prev.imageBanner, title: e.target.value } }))}
                    placeholder="e.g. Rare Amber & Black Saffron Flacons"
                    className="form-input-luxury"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', color: '#f5df93', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                    Golden Highlight Accent
                  </label>
                  <input
                    type="text"
                    value={bannerConfig.imageBanner?.highlight || ''}
                    onChange={(e) => setBannerConfig(prev => ({ ...prev, imageBanner: { ...prev.imageBanner, highlight: e.target.value } }))}
                    placeholder="e.g. Handcrafted Perfection"
                    className="form-input-luxury"
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  Description Text
                </label>
                <textarea
                  rows={2}
                  value={bannerConfig.imageBanner?.description || ''}
                  onChange={(e) => setBannerConfig(prev => ({ ...prev, imageBanner: { ...prev.imageBanner, description: e.target.value } }))}
                  placeholder="Limited production batches numbered by master perfumers..."
                  className="form-input-luxury"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', color: '#f5df93', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                    Special Offer / Perk Tag
                  </label>
                  <input
                    type="text"
                    value={bannerConfig.imageBanner?.discountBadge || ''}
                    onChange={(e) => setBannerConfig(prev => ({ ...prev, imageBanner: { ...prev.imageBanner, discountBadge: e.target.value } }))}
                    placeholder="e.g. COMPLIMENTARY LUXURY ATOMIZER"
                    className="form-input-luxury"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Button Text</label>
                  <input
                    type="text"
                    value={bannerConfig.imageBanner?.primaryBtnText || ''}
                    onChange={(e) => setBannerConfig(prev => ({ ...prev, imageBanner: { ...prev.imageBanner, primaryBtnText: e.target.value } }))}
                    placeholder="Shop Private Reserve"
                    className="form-input-luxury"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Button Link</label>
                  <input
                    type="text"
                    value={bannerConfig.imageBanner?.primaryBtnLink || ''}
                    onChange={(e) => setBannerConfig(prev => ({ ...prev, imageBanner: { ...prev.imageBanner, primaryBtnLink: e.target.value } }))}
                    placeholder="/shop"
                    className="form-input-luxury"
                  />
                </div>
              </div>

              {/* Showcase Image Device Upload */}
              <div>
                <ImageUploadField
                  id="image-banner-img"
                  label="Promotional Showcase Photo (Local Device / Gallery / URL)"
                  value={bannerConfig.imageBanner?.image}
                  onChange={(url) => setBannerConfig(prev => ({ ...prev, imageBanner: { ...prev.imageBanner, image: url } }))}
                />
              </div>

            </div>
          </div>

          {/* Floating Save Action Bar */}
          <div style={{
            position: 'sticky',
            bottom: '20px',
            background: 'rgba(10, 13, 20, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--border-gold)',
            borderRadius: '16px',
            padding: '16px 24px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 15px 40px rgba(0,0,0,0.85), 0 0 25px rgba(212,175,55,0.2)',
            zIndex: 100
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#d4af37" />
              <span style={{ fontSize: '0.84rem', color: '#f5df93', fontWeight: 600 }}>
                Unsaved modifications? Click save to sync all changes to the live store immediately.
              </span>
            </div>

            <button
              type="button"
              disabled={isSavingBanners}
              onClick={handleSaveBannerConfig}
              className="btn-luxury-gold"
              style={{ padding: '10px 24px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {isSavingBanners ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
              {isSavingBanners ? 'Saving Changes...' : 'Save All Banner Settings'}
            </button>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB: COUPONS & PROMO CODES MANAGEMENT */}
      {/* ========================================================= */}
      {activeTab === 'coupons' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* Header Action Bar */}
          <div className="glass-panel" style={{
            borderRadius: '20px',
            padding: '24px 28px',
            border: '1px solid var(--border-gold)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            background: 'linear-gradient(135deg, rgba(20, 26, 38, 0.9) 0%, rgba(10, 13, 20, 0.95) 100%)'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: '4px' }}>
                PROMOTIONS & STORE BROADCAST
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#ffffff', margin: 0 }}>
                Coupons & Promo Codes
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                Create custom discount codes and publish them live to the storefront top announcement bar and customer checkout drawer with 1 click.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddCouponModal}
              className="btn-luxury-gold"
              style={{ padding: '12px 24px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Plus size={16} /> Create New Promo Code
            </button>
          </div>

          {/* KPI Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '16px' }}>
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.76rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Coupons</span>
                <Tag size={18} color="#d4af37" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
                {couponsList.length}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                Configured vouchers
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.76rem', color: '#f5df93', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Storefront Broadcast</span>
                <Rocket size={18} color="#10b981" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981' }}>
                {couponsList.filter(c => Boolean(c.is_published) && Boolean(c.is_active)).length}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '4px' }}>
                Live on Navbar & Checkout
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.76rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Active Codes</span>
                <CheckCircle size={18} color="#38bdf8" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8' }}>
                {couponsList.filter(c => Boolean(c.is_active)).length}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                Ready for checkout
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.76rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Redemptions</span>
                <Sparkles size={18} color="#e879f9" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
                {couponsList.reduce((acc, c) => acc + (Number(c.used_count) || 0), 0)}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                Lifetime usages
              </div>
            </div>
          </div>

          {/* Coupons Table List */}
          <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#ffffff' }}>All Promotional Codes</h3>
                <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                  Toggle the "Broadcast" switch to immediately show or hide any code on the customer top navbar ticker and checkout drawer.
                </span>
              </div>
            </div>

            {couponsList.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '780px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      <th style={{ padding: '12px 14px' }}>Promo Code</th>
                      <th style={{ padding: '12px 14px' }}>Discount Offer</th>
                      <th style={{ padding: '12px 14px' }}>Promo Description</th>
                      <th style={{ padding: '12px 14px' }}>Requirements</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>Active</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>Navbar & Checkout Broadcast</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {couponsList.map((c) => {
                      const isExpired = c.expiry_date && new Date(c.expiry_date) < new Date();
                      return (
                        <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.84rem' }}>
                          
                          {/* Code */}
                          <td style={{ padding: '14px' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{
                                fontFamily: 'monospace',
                                fontWeight: 800,
                                color: '#f5df93',
                                background: 'rgba(212, 175, 55, 0.15)',
                                border: '1px solid rgba(212, 175, 55, 0.4)',
                                borderRadius: '6px',
                                padding: '3px 8px',
                                fontSize: '0.82rem',
                                letterSpacing: '0.06em'
                              }}>
                                {c.code}
                              </span>
                            </div>
                            {c.created_at && (
                              <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                                Created: {new Date(c.created_at).toLocaleDateString()}
                              </div>
                            )}
                          </td>

                          {/* Discount / Offer */}
                          <td style={{ padding: '14px' }}>
                            {c.discount_type === 'bogo' || c.discount_type === 'buy_x_get_y' ? (
                              <div>
                                <div style={{ fontWeight: 800, color: '#f5df93', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <Gift size={14} color="#ffd700" />
                                  <span>BUY {c.buy_qty || 1} GET {c.get_qty || 1} {Number(c.discount_percent_for_get || 100) === 100 ? 'FREE' : `${c.discount_percent_for_get}% OFF`}</span>
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#38bdf8', marginTop: '2px' }}>
                                  {c.applicable_type === 'specific' ? (
                                    <span>🎯 Targeted: {(() => {
                                      try {
                                        const pIds = typeof c.applicable_product_ids === 'string' ? JSON.parse(c.applicable_product_ids) : c.applicable_product_ids;
                                        return `${(pIds || []).length} Selected Perfumes`;
                                      } catch (e) {
                                        return 'Selected Perfumes';
                                      }
                                    })()}</span>
                                  ) : c.applicable_type === 'category' ? (
                                    <span>📂 Category Specific</span>
                                  ) : (
                                    <span style={{ color: '#94a3b8' }}>All Perfumes Eligible</span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div style={{ fontWeight: 700, color: '#10b981', fontSize: '0.92rem' }}>
                                  {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `₹${Number(c.discount_value).toLocaleString('en-IN')} FLAT`}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                                  {c.discount_type}
                                </div>
                              </div>
                            )}
                          </td>

                          {/* Description */}
                          <td style={{ padding: '14px', maxWidth: '240px' }}>
                            <div style={{ color: '#f8fafc', fontWeight: 500, lineHeight: 1.35 }}>
                              {c.description || <span style={{ color: '#64748b', fontStyle: 'italic' }}>No description</span>}
                            </div>
                          </td>

                          {/* Requirements & Limits */}
                          <td style={{ padding: '14px', fontSize: '0.76rem', color: '#cbd5e1' }}>
                            <div>Min Order: <strong>{Number(c.min_order_amount) > 0 ? `₹${Number(c.min_order_amount).toLocaleString('en-IN')}` : 'None'}</strong></div>
                            {c.max_discount_amount && (
                              <div style={{ color: '#94a3b8' }}>Max Cap: ₹{Number(c.max_discount_amount).toLocaleString('en-IN')}</div>
                            )}
                            {c.expiry_date && (
                              <div style={{ color: isExpired ? '#f43f5e' : '#f5df93' }}>
                                {isExpired ? 'Expired: ' : 'Expires: '}{new Date(c.expiry_date).toLocaleDateString()}
                              </div>
                            )}
                          </td>

                          {/* Active Toggle */}
                          <td style={{ padding: '14px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleToggleActiveCoupon(c)}
                              style={{
                                background: c.is_active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                                border: c.is_active ? '1px solid #10b981' : '1px solid #64748b',
                                color: c.is_active ? '#10b981' : '#94a3b8',
                                borderRadius: '8px',
                                padding: '4px 10px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {c.is_active ? 'Active' : 'Disabled'}
                            </button>
                          </td>

                          {/* Broadcast to Storefront Navbar & Checkout Toggle */}
                          <td style={{ padding: '14px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleTogglePublishCoupon(c)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: c.is_published
                                  ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(16, 185, 129, 0.2) 100%)'
                                  : 'rgba(255, 255, 255, 0.04)',
                                border: c.is_published
                                  ? '1px solid #d4af37'
                                  : '1px solid rgba(255, 255, 255, 0.12)',
                                color: c.is_published ? '#f5df93' : '#94a3b8',
                                borderRadius: '9999px',
                                padding: '6px 14px',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: c.is_published ? '0 0 14px rgba(212, 175, 55, 0.3)' : 'none'
                              }}
                              title={c.is_published ? 'Click to unpublish from navbar and checkout' : 'Click to broadcast live on top navbar ticker and checkout drawer'}
                            >
                              {c.is_published ? (
                                <>
                                  <Rocket size={13} color="#10b981" />
                                  <span>🚀 Broadcasted</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff size={13} color="#64748b" />
                                  <span>Draft / Off</span>
                                </>
                              )}
                            </button>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '14px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => openEditCouponModal(c)}
                                className="btn-icon-round"
                                style={{ width: '32px', height: '32px' }}
                                title="Edit Coupon"
                              >
                                <Edit size={14} color="#f5df93" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCoupon(c.id, c.code)}
                                className="btn-icon-round"
                                style={{ width: '32px', height: '32px', borderColor: 'rgba(244, 63, 94, 0.4)' }}
                                title="Delete Coupon"
                              >
                                <Trash2 size={14} color="#f43f5e" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                <Gift size={36} color="#d4af37" style={{ marginBottom: '12px', opacity: 0.7 }} />
                <h4 style={{ color: '#ffffff', margin: '0 0 6px 0' }}>No Promotional Codes Created Yet</h4>
                <p style={{ fontSize: '0.82rem', margin: '0 0 16px 0' }}>
                  Create your first promo code to boost orders and broadcast it directly on the customer top navbar.
                </p>
                <button
                  type="button"
                  onClick={openAddCouponModal}
                  className="btn-luxury-gold"
                  style={{ padding: '10px 22px', fontSize: '0.84rem' }}
                >
                  <Plus size={15} /> Create Promo Code
                </button>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB: LIVE CONCIERGE CHAT */}
      {/* ========================================================= */}
      {activeTab === 'chat' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Header Banner */}
          <div className="glass-panel" style={{ borderRadius: '20px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Headphones size={14} /> REAL-TIME CLIENT LIAISON
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', color: '#ffffff', margin: 0 }}>
                Live Concierge & Patron Chat Center
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                Directly communicate with online visitors, answer perfume formulation inquiries, and assist with order fulfillment in real time.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.76rem', color: '#6ee7b7', fontWeight: 600 }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }}></span>
                Live Sync (3.5s Poll)
              </div>
              <button
                type="button"
                onClick={fetchData}
                className="btn-luxury-outline"
                style={{ padding: '8px 14px', fontSize: '0.78rem' }}
                title="Refresh Conversations"
              >
                <RefreshCw size={13} /> Refresh
              </button>
            </div>
          </div>

          {/* Chat Split-Screen Container */}
          <div className="admin-chat-layout" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: '16px',
            alignItems: 'start'
          }}>
            
            {/* Left Column: Conversations List */}
            <div 
              className={`glass-panel ${selectedChatConv ? 'd-none d-md-flex' : 'd-flex'}`} 
              style={{
                borderRadius: '18px',
                padding: '16px',
                flexDirection: 'column',
                gap: '12px',
                maxHeight: '75vh',
                overflowY: 'auto',
                border: '1px solid rgba(212, 175, 55, 0.25)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f5df93' }}>
                  Active Threads ({chatConversations.length})
                </span>
                {adminUnreadChatCount > 0 && (
                  <span style={{ background: '#f43f5e', color: '#ffffff', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px' }}>
                    {adminUnreadChatCount} New Message{adminUnreadChatCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {chatConversations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8' }}>
                  <MessageSquare size={32} color="#64748b" style={{ marginBottom: '10px', opacity: 0.6 }} />
                  <div style={{ fontSize: '0.88rem', color: '#cbd5e1', fontWeight: 600 }}>No conversations yet</div>
                  <p style={{ fontSize: '0.76rem', margin: '4px 0 0 0' }}>
                    When visitors click "Live Concierge Chat" on the Contact page, their message will appear here instantly.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {chatConversations.map(conv => {
                    const isSelected = selectedChatConv?.id === conv.id;
                    const hasUnread = Number(conv.unread_admin || 0) > 0;
                    return (
                      <div
                        key={conv.id}
                        onClick={() => handleSelectChatConv(conv)}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '12px',
                          background: isSelected 
                            ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.18) 0%, rgba(10, 13, 20, 0.95) 100%)' 
                            : 'rgba(255, 255, 255, 0.03)',
                          border: isSelected ? '1.5px solid #d4af37' : (hasUnread ? '1.5px solid #f43f5e' : '1px solid rgba(255, 255, 255, 0.06)'),
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: conv.user_id ? 'rgba(212, 175, 55, 0.2)' : 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: conv.user_id ? '#d4af37' : '#60a5fa', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                              {conv.user_name ? conv.user_name.charAt(0).toUpperCase() : (conv.user_id ? 'M' : 'G')}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: isSelected ? '#f5df93' : '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {conv.user_name || (conv.user_id ? `Member #${conv.user_id}` : 'Guest Patron')}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {conv.user_email || (conv.session_id ? `Guest (${conv.session_id.substring(0, 8)}...)` : 'Guest Session')}
                              </div>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            {hasUnread && (
                              <span style={{ background: '#f43f5e', color: '#ffffff', fontSize: '0.66rem', fontWeight: 800, padding: '2px 6px', borderRadius: '9999px', display: 'inline-block', marginBottom: '4px' }}>
                                NEW
                              </span>
                            )}
                            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                              {conv.updated_at ? new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </div>
                          </div>
                        </div>

                        <div style={{ fontSize: '0.78rem', color: isSelected ? '#cbd5e1' : '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontStyle: conv.last_message ? 'normal' : 'italic' }}>
                          {conv.last_message || 'No messages yet'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Active Conversation Stream & Reply Input */}
            <div 
              className={`glass-panel ${!selectedChatConv ? 'd-none d-md-flex' : 'd-flex'}`}
              style={{
                borderRadius: '18px',
                padding: 'clamp(14px, 2.5vw, 20px)',
                flexDirection: 'column',
                minHeight: selectedChatConv ? '460px' : '340px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              {selectedChatConv ? (
                <>
                  {/* Chat Active Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <button
                        type="button"
                        onClick={() => setSelectedChatConv(null)}
                        className="d-md-none"
                        style={{
                          background: 'rgba(212, 175, 55, 0.15)',
                          border: '1px solid #d4af37',
                          color: '#f5df93',
                          borderRadius: '8px',
                          padding: '6px 10px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                        title="Back to All Threads"
                      >
                        <ArrowLeft size={13} /> Threads
                      </button>

                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.2)', border: '1px solid #d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', fontWeight: 700, flexShrink: 0 }}>
                        <User size={16} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedChatConv.user_name || (selectedChatConv.user_id ? `Member #${selectedChatConv.user_id}` : 'Guest Visitor')}</span>
                          <span style={{ fontSize: '0.64rem', padding: '1px 6px', borderRadius: '9999px', background: selectedChatConv.user_id ? 'rgba(212, 175, 55, 0.2)' : 'rgba(59, 130, 246, 0.2)', color: selectedChatConv.user_id ? '#f5df93' : '#93c5fd', border: selectedChatConv.user_id ? '1px solid #d4af37' : '1px solid #3b82f6', whiteSpace: 'nowrap' }}>
                            {selectedChatConv.user_id ? 'VIP Member' : 'Guest'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {selectedChatConv.user_email ? `${selectedChatConv.user_email} • ` : ''}Thread #{selectedChatConv.id}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span> Connected
                    </div>
                  </div>

                  {/* Message Stream */}
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', padding: '8px 2px', maxHeight: '380px', minHeight: '220px' }}>
                    {chatMessages.length === 0 ? (
                      <div style={{ textAlign: 'center', margin: 'auto', color: '#94a3b8', fontSize: '0.84rem' }}>
                        No messages in this conversation yet. Send an opening greeting below!
                      </div>
                    ) : (
                      chatMessages.map((msg, idx) => {
                        const isAdmin = msg.sender_type === 'admin';
                        const hasImage = Boolean(msg.image_url);
                        const isPlaceholderText = msg.message === '📷 Photo Attached' || msg.message === '📷 Image';

                        return (
                          <div
                            key={msg.id || idx}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: isAdmin ? 'flex-end' : 'flex-start',
                              maxWidth: '88%',
                              alignSelf: isAdmin ? 'flex-end' : 'flex-start'
                            }}
                          >
                            <div style={{ fontSize: '0.66rem', color: '#64748b', marginBottom: '2px', paddingLeft: '4px', paddingRight: '4px' }}>
                              {isAdmin ? 'Support Team (You)' : (msg.sender_name || 'Customer')} • {new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div
                              style={{
                                padding: hasImage ? '6px' : '9px 14px',
                                borderRadius: isAdmin ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                                background: isAdmin 
                                  ? 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)' 
                                  : 'rgba(255, 255, 255, 0.08)',
                                color: isAdmin ? '#05070a' : '#f8fafc',
                                fontWeight: isAdmin ? 600 : 400,
                                fontSize: '0.84rem',
                                lineHeight: 1.4,
                                border: isAdmin ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                                wordBreak: 'break-word',
                                boxShadow: isAdmin ? '0 4px 16px rgba(212, 175, 55, 0.25)' : 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px'
                              }}
                            >
                              {/* Attached Image Thumbnail */}
                              {hasImage && (
                                <div
                                  style={{
                                    position: 'relative',
                                    borderRadius: '10px',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    maxHeight: '220px',
                                    background: '#000000'
                                  }}
                                  onClick={() => setAdminChatLightboxImage(msg.image_url)}
                                  title="Click to expand image"
                                >
                                  <img
                                    src={msg.image_url}
                                    alt="Chat attachment"
                                    style={{
                                      width: '100%',
                                      maxHeight: '220px',
                                      objectFit: 'cover',
                                      display: 'block'
                                    }}
                                  />
                                  <div style={{
                                    position: 'absolute',
                                    bottom: '4px',
                                    right: '4px',
                                    background: 'rgba(0,0,0,0.7)',
                                    backdropFilter: 'blur(4px)',
                                    borderRadius: '4px',
                                    padding: '2px 5px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    fontSize: '0.62rem',
                                    color: '#f5df93'
                                  }}>
                                    <Maximize2 size={10} />
                                    <span>Expand</span>
                                  </div>
                                </div>
                              )}

                              {/* Message / Caption */}
                              {(!hasImage || (!isPlaceholderText && msg.message)) && (
                                <div style={{ padding: hasImage ? '2px 6px 2px 6px' : 0 }}>
                                  {msg.message}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Canned Quick Response Dropdown */}
                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '10px', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '0.74rem', color: '#d4af37', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                      <Sparkles size={13} />
                      <span>Quick Templates:</span>
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            setChatReplyText(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        defaultValue=""
                        className="form-input-luxury"
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          fontSize: '0.78rem',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(212, 175, 55, 0.3)',
                          color: '#f5df93',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="" style={{ background: '#0f141f', color: '#94a3b8' }}>
                          -- Insert a quick response template... --
                        </option>
                        <option value="Hello! Welcome to TRY ME BRO. How can we help you today?" style={{ background: '#0f141f', color: '#f8fafc' }}>
                          👋 Welcome Greeting
                        </option>
                        <option value="Our perfumes are long-lasting and made with high quality perfume oils that stay for 24+ hours." style={{ background: '#0f141f', color: '#f8fafc' }}>
                          💎 Perfume Quality & Lasting Time
                        </option>
                        <option value="All orders are securely packed and dispatched via fast courier within 24 hours." style={{ background: '#0f141f', color: '#f8fafc' }}>
                          🚚 Dispatch & Delivery Info
                        </option>
                        <option value="We include free sample test bottles with your order so you can test the fragrance before opening the main box." style={{ background: '#0f141f', color: '#f8fafc' }}>
                          🎁 Free Sample Bottles Policy
                        </option>
                        <option value="Your return/replacement request has been received. Our team is verifying it and will update you shortly." style={{ background: '#0f141f', color: '#f8fafc' }}>
                          🛡️ Return Request Acknowledgement
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Admin Image Attachment Preview Bar */}
                  {adminChatImagePreview && (
                    <div style={{
                      padding: '8px 12px',
                      marginTop: '6px',
                      background: 'rgba(212, 175, 55, 0.1)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #d4af37', flexShrink: 0 }}>
                          <img src={adminChatImagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#f5df93', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {adminChatImageFile?.name || 'Photo Attached'}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                            {adminChatImageFile ? `${(adminChatImageFile.size / 1024).toFixed(1)} KB` : 'Ready'} • Click Send or add a reply message
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAdminRemoveChatImage}
                        disabled={chatSending}
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          color: '#f87171',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <X size={12} /> Remove
                      </button>
                    </div>
                  )}

                  {/* Reply Input Form */}
                  <form onSubmit={handleSendAdminReply} style={{ display: 'flex', gap: '8px', marginTop: '10px', alignItems: 'center' }}>
                    {/* Hidden Admin Chat File Input */}
                    <input
                      type="file"
                      ref={adminChatFileInputRef}
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleAdminChatImageChange}
                    />

                    {/* Image Attachment Trigger Button */}
                    <button
                      type="button"
                      onClick={() => adminChatFileInputRef.current?.click()}
                      disabled={chatSending}
                      className="btn-luxury-outline"
                      style={{
                        padding: '9px 12px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        fontSize: '0.78rem',
                        color: adminChatImageFile ? '#d4af37' : '#cbd5e1',
                        borderColor: adminChatImageFile ? '#d4af37' : 'rgba(255,255,255,0.15)',
                        background: adminChatImageFile ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                        flexShrink: 0,
                        cursor: 'pointer'
                      }}
                      title="Upload photo / screenshot to client"
                    >
                      <ImageIcon size={16} color={adminChatImageFile ? '#d4af37' : '#94a3b8'} />
                      <span className="d-none d-sm-inline">{adminChatImageFile ? 'Photo' : 'Photo'}</span>
                    </button>

                    <input
                      type="text"
                      placeholder={adminChatImageFile ? 'Add an optional note for this photo...' : 'Type your reply...'}
                      value={chatReplyText}
                      onChange={(e) => setChatReplyText(e.target.value)}
                      className="form-input-luxury"
                      style={{ flex: 1, padding: '10px 14px', fontSize: '0.84rem' }}
                      disabled={chatSending}
                    />
                    <button
                      type="submit"
                      disabled={chatSending || (!chatReplyText.trim() && !adminChatImageFile)}
                      className="btn-luxury-gold"
                      style={{ padding: '0 18px', height: '42px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', flexShrink: 0 }}
                    >
                      {chatSending ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>{adminChatUploading ? 'Uploading...' : 'Sending...'}</span>
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          <span>Send</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* ADMIN CHAT LIGHTBOX MODAL */}
                  {adminChatLightboxImage && (
                    <div 
                      onClick={() => setAdminChatLightboxImage(null)}
                      style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0, 0, 0, 0.92)',
                        backdropFilter: 'blur(12px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        padding: '24px'
                      }}
                    >
                      <div 
                        onClick={(e) => e.stopPropagation()} 
                        style={{
                          position: 'relative',
                          maxWidth: '90vw',
                          maxHeight: '90vh',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center'
                        }}
                      >
                        <div style={{
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'flex-end',
                          gap: '10px',
                          marginBottom: '10px'
                        }}>
                          <a
                            href={adminChatLightboxImage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-luxury-outline"
                            style={{ padding: '6px 14px', fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#f5df93' }}
                          >
                            <ExternalLink size={13} /> Open Original
                          </a>
                          <button
                            type="button"
                            onClick={() => setAdminChatLightboxImage(null)}
                            style={{
                              background: 'rgba(255, 255, 255, 0.1)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              color: '#ffffff',
                              borderRadius: '8px',
                              padding: '6px 12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.76rem'
                            }}
                          >
                            <X size={14} /> Close
                          </button>
                        </div>

                        <div style={{
                          borderRadius: '16px',
                          overflow: 'hidden',
                          border: '1.5px solid rgba(212, 175, 55, 0.5)',
                          boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(212,175,55,0.25)',
                          background: '#0a0d14'
                        }}>
                          <img 
                            src={adminChatLightboxImage} 
                            alt="Full resolution preview" 
                            style={{
                              maxWidth: '85vw',
                              maxHeight: '75vh',
                              objectFit: 'contain',
                              display: 'block'
                            }} 
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ margin: 'auto', textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                  <Headphones size={40} color="#d4af37" style={{ marginBottom: '12px', opacity: 0.7 }} />
                  <h3 style={{ color: '#ffffff', fontFamily: 'var(--font-serif)', margin: '0 0 8px 0', fontSize: '1.2rem' }}>
                    No Conversation Selected
                  </h3>
                  <p style={{ fontSize: '0.80rem', maxWidth: '360px', margin: '0 auto', lineHeight: 1.5 }}>
                    Select any client or guest thread from the left panel to review chat history and reply directly.
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB: CMS & PAGE CONTENT MANAGER (ABOUT & CONTACT) */}
      {/* ========================================================= */}
      {activeTab === 'cms' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Subtabs Header */}
          <div className="glass-panel" style={{ borderRadius: '20px', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, marginBottom: '4px' }}>
                DYNAMIC STOREFRONT CMS STUDIO
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', color: '#ffffff', margin: 0 }}>
                Page Content & Boutique Information Editor
              </h2>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setCmsActiveSubTab('about')}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: cmsActiveSubTab === 'about' ? '1px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: cmsActiveSubTab === 'about' ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(10, 13, 20, 0.95) 100%)' : 'rgba(255, 255, 255, 0.03)',
                  color: cmsActiveSubTab === 'about' ? '#f5df93' : '#cbd5e1'
                }}
              >
                📖 About Us Page
              </button>

              <button
                type="button"
                onClick={() => setCmsActiveSubTab('contact')}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: cmsActiveSubTab === 'contact' ? '1px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: cmsActiveSubTab === 'contact' ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(10, 13, 20, 0.95) 100%)' : 'rgba(255, 255, 255, 0.03)',
                  color: cmsActiveSubTab === 'contact' ? '#f5df93' : '#cbd5e1'
                }}
              >
                📍 Contact Us & FAQ Manager
              </button>
            </div>
          </div>

          {/* SUBTAB 1: ABOUT US PAGE CONTENT */}
          {cmsActiveSubTab === 'about' && (
            <form onSubmit={handleSaveCmsAbout} className="glass-panel" style={{ borderRadius: '20px', padding: 'clamp(20px, 3.5vw, 32px)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#f5df93', margin: 0 }}>
                  1. Hero & Brand Introduction
                </h3>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Live on /about page</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Hero Top Gold Badge:
                  </label>
                  <input
                    type="text"
                    value={cmsAboutContent.heroBadge || ''}
                    onChange={(e) => setCmsAboutContent({ ...cmsAboutContent, heroBadge: e.target.value })}
                    placeholder="e.g. THE MAISON OF HAUTE PARFUMERIE"
                    className="form-input-luxury"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Hero Main Headline:
                  </label>
                  <input
                    type="text"
                    value={cmsAboutContent.heroTitle || ''}
                    onChange={(e) => setCmsAboutContent({ ...cmsAboutContent, heroTitle: e.target.value })}
                    placeholder="e.g. Alchemy of Scent, Crowned in Gold"
                    className="form-input-luxury"
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Hero Subtitle / Mission Statement:
                </label>
                <textarea
                  rows={2}
                  value={cmsAboutContent.heroSubtitle || ''}
                  onChange={(e) => setCmsAboutContent({ ...cmsAboutContent, heroSubtitle: e.target.value })}
                  placeholder="e.g. Born in the royal fragrance corridors of India..."
                  className="form-input-luxury"
                />
              </div>

              {/* Heritage Story Section */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px', marginTop: '10px' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#f5df93', margin: 0 }}>
                  2. Heritage & Scent Storytelling
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Story Section Badge:
                  </label>
                  <input
                    type="text"
                    value={cmsAboutContent.storyBadge || ''}
                    onChange={(e) => setCmsAboutContent({ ...cmsAboutContent, storyBadge: e.target.value })}
                    placeholder="e.g. OUR HERITAGE & ORIGIN"
                    className="form-input-luxury"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Story Main Title:
                  </label>
                  <input
                    type="text"
                    value={cmsAboutContent.storyTitle || ''}
                    onChange={(e) => setCmsAboutContent({ ...cmsAboutContent, storyTitle: e.target.value })}
                    placeholder="e.g. Crafted Without Compromise, Aged to Perfection"
                    className="form-input-luxury"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Story Paragraph 1 (Philosophy):
                  </label>
                  <textarea
                    rows={4}
                    value={cmsAboutContent.storyParagraph1 || ''}
                    onChange={(e) => setCmsAboutContent({ ...cmsAboutContent, storyParagraph1: e.target.value })}
                    placeholder="Philosophy text..."
                    className="form-input-luxury"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Story Paragraph 2 (Artisanal Sourcing):
                  </label>
                  <textarea
                    rows={4}
                    value={cmsAboutContent.storyParagraph2 || ''}
                    onChange={(e) => setCmsAboutContent({ ...cmsAboutContent, storyParagraph2: e.target.value })}
                    placeholder="Sourcing text..."
                    className="form-input-luxury"
                  />
                </div>
              </div>

              <div>
                <ImageUploadField
                  label="Story Feature Photo (Atelier Flacon Image)"
                  value={cmsAboutContent.storyImage || ''}
                  onChange={(url) => setCmsAboutContent({ ...cmsAboutContent, storyImage: url })}
                  placeholder="Upload luxury perfume flacon image"
                  id="cms_story_image"
                />
              </div>

              {/* 4 Brand Pillars */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px', marginTop: '10px' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#f5df93', margin: 0 }}>
                  3. The 4 Pillars of Distinction
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '14px' }}>
                {(cmsAboutContent.pillars || []).map((pillar, pIdx) => (
                  <div key={pIdx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#d4af37', fontWeight: 700 }}>PILLAR #{pIdx + 1}</div>
                    <input
                      type="text"
                      value={pillar.title || ''}
                      onChange={(e) => handleUpdatePillar(pIdx, 'title', e.target.value)}
                      placeholder="Pillar Title"
                      className="form-input-luxury"
                      style={{ fontSize: '0.84rem', fontWeight: 700 }}
                    />
                    <textarea
                      rows={3}
                      value={pillar.desc || ''}
                      onChange={(e) => handleUpdatePillar(pIdx, 'desc', e.target.value)}
                      placeholder="Pillar Description"
                      className="form-input-luxury"
                      style={{ fontSize: '0.8rem' }}
                    />
                  </div>
                ))}
              </div>

              {/* Brand Metrics Stats */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px', marginTop: '10px' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#f5df93', margin: 0 }}>
                  4. Brand Highlights & Metrics (Stats Counter)
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '12px' }}>
                {(cmsAboutContent.stats || []).map((st, sIdx) => (
                  <div key={sIdx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.72rem', color: '#94a3b8' }}>STAT VALUE</label>
                    <input
                      type="text"
                      value={st.value || ''}
                      onChange={(e) => handleUpdateStat(sIdx, 'value', e.target.value)}
                      placeholder="e.g. 40%"
                      className="form-input-luxury"
                      style={{ fontSize: '0.86rem', fontWeight: 700, color: '#f5df93' }}
                    />
                    <label style={{ fontSize: '0.72rem', color: '#94a3b8' }}>STAT LABEL</label>
                    <input
                      type="text"
                      value={st.label || ''}
                      onChange={(e) => handleUpdateStat(sIdx, 'label', e.target.value)}
                      placeholder="e.g. Extrait Concentration"
                      className="form-input-luxury"
                      style={{ fontSize: '0.78rem' }}
                    />
                  </div>
                ))}
              </div>

              {/* CTA Section */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px', marginTop: '10px' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#f5df93', margin: 0 }}>
                  5. Bottom Call to Action Banner
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    CTA Title:
                  </label>
                  <input
                    type="text"
                    value={cmsAboutContent.ctaTitle || ''}
                    onChange={(e) => setCmsAboutContent({ ...cmsAboutContent, ctaTitle: e.target.value })}
                    placeholder="e.g. Find Your Signature Aura"
                    className="form-input-luxury"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    CTA Button Text:
                  </label>
                  <input
                    type="text"
                    value={cmsAboutContent.ctaBtnText || ''}
                    onChange={(e) => setCmsAboutContent({ ...cmsAboutContent, ctaBtnText: e.target.value })}
                    placeholder="e.g. Explore Private Catalog"
                    className="form-input-luxury"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  type="submit"
                  disabled={isSavingCms}
                  className="btn-luxury-gold"
                  style={{ padding: '12px 28px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Save size={16} />
                  {isSavingCms ? 'Publishing Updates...' : '✨ Save & Publish About Us Page Live'}
                </button>
              </div>

            </form>
          )}

          {/* SUBTAB 2: CONTACT US PAGE & FAQ MANAGER */}
          {cmsActiveSubTab === 'contact' && (
            <form onSubmit={handleSaveCmsContact} className="glass-panel" style={{ borderRadius: '20px', padding: 'clamp(20px, 3.5vw, 32px)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#f5df93', margin: 0 }}>
                  1. Contact Hero & Headline
                </h3>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Live on /contact page</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Hero Top Gold Badge:
                  </label>
                  <input
                    type="text"
                    value={cmsContactContent.heroBadge || ''}
                    onChange={(e) => setCmsContactContent({ ...cmsContactContent, heroBadge: e.target.value })}
                    placeholder="e.g. ATELIER CONCIERGE & PRIVATE SALON"
                    className="form-input-luxury"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Hero Main Headline:
                  </label>
                  <input
                    type="text"
                    value={cmsContactContent.heroTitle || ''}
                    onChange={(e) => setCmsContactContent({ ...cmsContactContent, heroTitle: e.target.value })}
                    placeholder="e.g. Speak with Our Master Perfumers"
                    className="form-input-luxury"
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Hero Subtitle Description:
                </label>
                <textarea
                  rows={2}
                  value={cmsContactContent.heroSubtitle || ''}
                  onChange={(e) => setCmsContactContent({ ...cmsContactContent, heroSubtitle: e.target.value })}
                  placeholder="e.g. Whether you seek guidance on our private extrait blends..."
                  className="form-input-luxury"
                />
              </div>

              {/* Boutique Atelier Contact Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px', marginTop: '10px' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#f5df93', margin: 0 }}>
                  2. Atelier Boutique Direct Contact Channels
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Concierge Official Email:
                  </label>
                  <input
                    type="email"
                    value={cmsContactContent.email || ''}
                    onChange={(e) => setCmsContactContent({ ...cmsContactContent, email: e.target.value })}
                    placeholder="concierge@trymebro.com"
                    className="form-input-luxury"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Direct Phone Line:
                  </label>
                  <input
                    type="text"
                    value={cmsContactContent.phone || ''}
                    onChange={(e) => setCmsContactContent({ ...cmsContactContent, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="form-input-luxury"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    WhatsApp Concierge Number:
                  </label>
                  <input
                    type="text"
                    value={cmsContactContent.whatsapp || ''}
                    onChange={(e) => setCmsContactContent({ ...cmsContactContent, whatsapp: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="form-input-luxury"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Full Physical Atelier Address:
                  </label>
                  <textarea
                    rows={2}
                    value={cmsContactContent.address || ''}
                    onChange={(e) => setCmsContactContent({ ...cmsContactContent, address: e.target.value })}
                    placeholder="e.g. TRY ME BRO Luxury Atelier, Main Heritage Boulevard, Kalol 382721, Gujarat"
                    className="form-input-luxury"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Salon Visiting & Consultation Timings:
                  </label>
                  <textarea
                    rows={2}
                    value={cmsContactContent.timings || ''}
                    onChange={(e) => setCmsContactContent({ ...cmsContactContent, timings: e.target.value })}
                    placeholder="e.g. Monday – Sunday: 10:00 AM – 9:00 PM IST"
                    className="form-input-luxury"
                  />
                </div>
              </div>

              {/* Dynamic Interactive FAQs Manager */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px', marginTop: '10px' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#f5df93', margin: 0 }}>
                    3. Interactive Frequently Asked Questions (FAQ Manager)
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                    Add, edit, or remove customer FAQs displayed on the Contact Us page accordion.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddFaq}
                  className="btn-luxury-outline"
                  style={{ padding: '8px 16px', fontSize: '0.78rem' }}
                >
                  <Plus size={14} /> Add New FAQ
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {(cmsContactContent.faqs || []).map((faq, fIdx) => (
                  <div
                    key={fIdx}
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(212,175,55,0.25)',
                      borderRadius: '14px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.76rem', color: '#d4af37', fontWeight: 700 }}>
                        FAQ #{fIdx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteFaq(fIdx)}
                        style={{ background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem' }}
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.72rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Question:</label>
                      <input
                        type="text"
                        value={faq.q || ''}
                        onChange={(e) => handleUpdateFaq(fIdx, 'q', e.target.value)}
                        placeholder="e.g. How long do TRY ME BRO extrait perfumes last?"
                        className="form-input-luxury"
                        style={{ fontSize: '0.84rem', fontWeight: 600 }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.72rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Detailed Answer:</label>
                      <textarea
                        rows={2}
                        value={faq.a || ''}
                        onChange={(e) => handleUpdateFaq(fIdx, 'a', e.target.value)}
                        placeholder="Detailed answer explanation..."
                        className="form-input-luxury"
                        style={{ fontSize: '0.8rem' }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  type="submit"
                  disabled={isSavingCms}
                  className="btn-luxury-gold"
                  style={{ padding: '12px 28px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Save size={16} />
                  {isSavingCms ? 'Publishing Updates...' : '✨ Save & Publish Contact Page & FAQs Live'}
                </button>
              </div>

            </form>
          )}

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB: PATRON REVIEWS MANAGEMENT (VIDEO & WRITTEN) */}
      {/* ========================================================= */}
      {activeTab === 'reviews' && (
        <AdminReviewsTab />
      )}

      {/* ========================================================= */}
      {/* PRODUCT MODAL (ADD & EDIT) */}
      {/* ========================================================= */}
      {productModalOpen && (
        <div className="admin-modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.88)',
          backdropFilter: 'blur(14px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2500,
          padding: '16px'
        }}>
          <div className="glass-panel admin-modal-panel" style={{
            maxWidth: '740px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            borderRadius: '20px',
            padding: 'clamp(20px, 4vw, 32px)',
            position: 'relative',
            border: '1px solid var(--border-gold)'
          }}>
            <button
              onClick={() => setProductModalOpen(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.76rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '4px' }}>
                {editingProduct ? 'Update Perfume Details' : 'Curate New Fragrance Bottle'}
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#ffffff' }}>
                {editingProduct ? `Edit "${editingProduct.name}"` : 'Add New Fragrance Creation'}
              </h2>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* Name */}
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#f5df93', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Fragrance Title *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g. Royal Oud Extrait"
                    className="form-input-luxury"
                  />
                </div>

                {/* Brand & Category Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#f5df93', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Brand / Designer House *</label>
                    <select
                      value={productForm.brand_id}
                      onChange={(e) => setProductForm({ ...productForm, brand_id: e.target.value })}
                      className="form-input-luxury"
                      required
                    >
                      <option value="">Select Brand</option>
                      {brands.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#f5df93', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Category / Fragrance Family *</label>
                    <select
                      value={productForm.category_id}
                      onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                      className="form-input-luxury"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Concentration & Gender */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Concentration</label>
                    <select
                      value={productForm.concentration}
                      onChange={(e) => setProductForm({ ...productForm, concentration: e.target.value })}
                      className="form-input-luxury"
                    >
                      <option value="Eau de Parfum">Eau de Parfum (15-20%)</option>
                      <option value="Extrait de Parfum">Extrait de Parfum (30-40%)</option>
                      <option value="Eau de Toilette">Eau de Toilette (5-15%)</option>
                      <option value="Elixir Precieux">Elixir Précieux (40%+)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Gender Accord</label>
                    <select
                      value={productForm.gender}
                      onChange={(e) => setProductForm({ ...productForm, gender: e.target.value })}
                      className="form-input-luxury"
                    >
                      <option value="Unisex">Unisex</option>
                      <option value="Men">Men (Pour Homme)</option>
                      <option value="Women">Women (Pour Femme)</option>
                    </select>
                  </div>
                </div>

                {/* Admin Bottle Sizes & Individual Variant Pricing Manager */}
                <div style={{
                  background: 'rgba(15, 20, 30, 0.9)',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  borderRadius: '16px',
                  padding: 'clamp(12px, 3vw, 18px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ fontSize: '0.86rem', color: '#f5df93', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Tag size={16} color="#d4af37" /> Bottle Sizes & Individual Variant Pricing
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
                        Configure individual MRP, discount %, sale price, and stock for each ml size.
                      </div>
                    </div>
                    <span className="badge-gold" style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                      {(productForm.size_variants || []).length} Sizes Configured
                    </span>
                  </div>

                  {/* Preset quick buttons & Bulk Discount Toolbar */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: '10px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 600 }}>+ Add Size:</span>
                      {['10ml', '30ml', '50ml', '75ml', '100ml', '150ml', '200ml'].map((sz) => (
                        <button
                          type="button"
                          key={sz}
                          onClick={() => handleAddSizeVariant(sz)}
                          className="btn-luxury-outline"
                          style={{ padding: '3px 8px', fontSize: '0.72rem', borderRadius: '6px' }}
                        >
                          + {sz}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleAddSizeVariant('')}
                        className="btn-luxury-gold"
                        style={{ padding: '3px 10px', fontSize: '0.72rem', borderRadius: '6px', marginLeft: 'auto' }}
                      >
                        <Plus size={12} /> Custom Size
                      </button>
                    </div>

                    {/* Bulk Discount Toolbar */}
                    {(productForm.size_variants || []).length > 0 && (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(245, 223, 147, 0.03) 100%)',
                        border: '1px dashed rgba(212, 175, 55, 0.3)',
                        borderRadius: '10px',
                        padding: '8px 12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#f5df93', fontWeight: 600 }}>
                          <Percent size={13} color="#d4af37" />
                          <span>Apply Bulk Discount to All Sizes:</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' }}>
                          {[5, 10, 15, 20, 25, 30, 40, 50].map(pct => (
                            <button
                              type="button"
                              key={pct}
                              onClick={() => handleApplyBulkDiscountToVariants(pct)}
                              className="btn-luxury-outline"
                              style={{
                                padding: '2px 8px',
                                fontSize: '0.7rem',
                                borderRadius: '6px',
                                borderColor: 'rgba(212,175,55,0.4)',
                                background: 'rgba(0,0,0,0.3)'
                              }}
                            >
                              {pct}% OFF
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Variant Rows */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(productForm.size_variants || []).map((variant, idx) => {
                      const vPrice = Number(variant.price || 0);
                      const vDiscPrice = Number(variant.discount_price || 0);
                      const vHasDisc = vPrice > 0 && vDiscPrice > 0 && vDiscPrice < vPrice;
                      const vPct = variant.discount_percent || (vHasDisc ? Math.round(((vPrice - vDiscPrice) / vPrice) * 100) : '');
                      const vSavings = vHasDisc ? vPrice - vDiscPrice : 0;

                      return (
                        <div
                          key={idx}
                          style={{
                            background: 'rgba(8, 10, 15, 0.85)',
                            border: vHasDisc ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                          }}
                        >
                          {/* Variant Card Header: Size Label & Delete Button */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                            paddingBottom: '6px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#f5df93', fontWeight: 700 }}>
                              <span style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                background: 'rgba(212, 175, 55, 0.2)',
                                border: '1px solid rgba(212, 175, 55, 0.4)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.66rem',
                                color: '#ffd700'
                              }}>
                                {idx + 1}
                              </span>
                              <span>Variant: {variant.size || 'Unspecified Size'}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveVariant(idx)}
                              className="btn-icon-round"
                              style={{ width: '28px', height: '28px', color: '#f43f5e', borderColor: 'rgba(244,63,94,0.35)', background: 'rgba(244,63,94,0.1)' }}
                              title="Remove size variant"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          {/* Responsive 2-column or multi-column grid */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))',
                            gap: '8px 10px',
                            alignItems: 'flex-end'
                          }}>
                            {/* Size Name */}
                            <div>
                              <label style={{ fontSize: '0.72rem', color: '#f5df93', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                                Bottle Size *
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. 50ml"
                                value={variant.size}
                                onChange={(e) => handleUpdateVariant(idx, 'size', e.target.value)}
                                className="form-input-luxury"
                                style={{ padding: '6px 8px', fontSize: '0.82rem', fontWeight: 700, width: '100%' }}
                                required
                              />
                            </div>

                            {/* Stock */}
                            <div>
                              <label style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                                Stock Qty
                              </label>
                              <input
                                type="number"
                                placeholder="30"
                                value={variant.stock !== undefined ? variant.stock : 30}
                                onChange={(e) => handleUpdateVariant(idx, 'stock', e.target.value)}
                                className="form-input-luxury"
                                style={{ padding: '6px 8px', fontSize: '0.82rem', width: '100%' }}
                              />
                            </div>

                            {/* Original Price */}
                            <div>
                              <label style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                                Original MRP (₹) *
                              </label>
                              <input
                                type="number"
                                placeholder="e.g. 8000"
                                value={variant.price}
                                onChange={(e) => handleUpdateVariant(idx, 'price', e.target.value)}
                                className="form-input-luxury"
                                style={{ padding: '6px 8px', fontSize: '0.82rem', width: '100%' }}
                                required
                              />
                            </div>

                            {/* Discount Percentage */}
                            <div>
                              <label style={{ fontSize: '0.72rem', color: '#ffd700', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                                Discount (%)
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="99"
                                placeholder="e.g. 20"
                                value={variant.discount_percent || ''}
                                onChange={(e) => handleUpdateVariant(idx, 'discount_percent', e.target.value)}
                                className="form-input-luxury"
                                style={{ padding: '6px 8px', fontSize: '0.82rem', color: '#ffd700', fontWeight: 700, width: '100%' }}
                              />
                            </div>

                            {/* Discount / Sale Price */}
                            <div>
                              <label style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                                Sale Price (₹)
                              </label>
                              <input
                                type="number"
                                placeholder="e.g. 6400"
                                value={variant.discount_price || ''}
                                onChange={(e) => handleUpdateVariant(idx, 'discount_price', e.target.value)}
                                className="form-input-luxury"
                                style={{ padding: '6px 8px', fontSize: '0.82rem', fontWeight: 700, color: '#f5df93', width: '100%' }}
                              />
                            </div>
                          </div>

                          {/* Live Savings Summary for this Variant */}
                          {vHasDisc && (
                            <div style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '6px',
                              background: 'rgba(212, 175, 55, 0.08)',
                              border: '1px solid rgba(212, 175, 55, 0.18)',
                              padding: '6px 10px',
                              borderRadius: '8px',
                              fontSize: '0.72rem',
                              color: '#f5df93'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                                <span>Customer pays:</span>
                                <strong style={{ color: '#ffffff', fontSize: '0.78rem' }}>₹{Number(variant.discount_price).toLocaleString('en-IN')}</strong>
                                <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>(MRP: <del>₹{vPrice.toLocaleString('en-IN')}</del>)</span>
                              </div>
                              <span className="badge-rose" style={{ fontSize: '0.68rem', padding: '2px 7px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                {vPct}% OFF • Save ₹{vSavings.toLocaleString('en-IN')}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {(productForm.size_variants || []).length === 0 && (
                      <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', color: '#94a3b8', fontSize: '0.82rem' }}>
                        No bottle sizes added yet. Click a preset button above to add sizes.
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing, Discount Percentage & Calculator */}
                <div style={{
                  background: 'rgba(15, 20, 30, 0.65)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px', gap: '8px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#f5df93', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <DollarSign size={15} color="#d4af37" /> Pricing & Discount Calculator
                    </div>
                    {productForm.price && productForm.discount_price && Number(productForm.discount_price) < Number(productForm.price) && (
                      <span className="badge-rose" style={{ fontSize: '0.72rem', padding: '3px 10px', fontWeight: 700 }}>
                        SAVE {discountPercent || Math.round(((Number(productForm.price) - Number(productForm.discount_price)) / Number(productForm.price)) * 100)}% (₹{(Number(productForm.price) - Number(productForm.discount_price)).toLocaleString('en-IN')} OFF)
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '12px' }}>
                    {/* Regular Price */}
                    <div>
                      <label style={{ fontSize: '0.76rem', color: '#f5df93', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Original Price (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="e.g. 10000"
                        value={productForm.price}
                        onChange={(e) => handlePriceChange(e.target.value)}
                        className="form-input-luxury"
                      />
                    </div>

                    {/* Discount Percentage (%) Input */}
                    <div>
                      <label style={{ fontSize: '0.76rem', color: '#ffd700', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Discount (%) <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Auto-calc</span>
                      </label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                          type="number"
                          min="0"
                          max="99"
                          placeholder="e.g. 15"
                          value={discountPercent}
                          onChange={(e) => handleDiscountPercentChange(e.target.value)}
                          className="form-input-luxury"
                          style={{ paddingRight: '28px' }}
                        />
                        <span style={{ position: 'absolute', right: '10px', color: '#d4af37', fontWeight: 700, fontSize: '0.85rem', pointerEvents: 'none' }}>%</span>
                      </div>
                    </div>

                    {/* Discounted Sale Price (₹) */}
                    <div>
                      <label style={{ fontSize: '0.76rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                        Sale Price (₹) <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Auto-calc</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Auto-calculated"
                        value={productForm.discount_price}
                        onChange={(e) => handleDiscountPriceChange(e.target.value)}
                        className="form-input-luxury"
                      />
                    </div>

                    {/* Stock Quantity */}
                    <div>
                      <label style={{ fontSize: '0.76rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                        Stock Quantity
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={productForm.stock_quantity}
                        onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                        className="form-input-luxury"
                      />
                    </div>
                  </div>

                  {/* Quick Percentage Presets */}
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                      Quick Discount Presets:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {[
                        { label: 'No Discount', val: '' },
                        { label: '5% OFF', val: '5' },
                        { label: '10% OFF', val: '10' },
                        { label: '15% OFF', val: '15' },
                        { label: '20% OFF', val: '20' },
                        { label: '25% OFF', val: '25' },
                        { label: '30% OFF', val: '30' },
                        { label: '40% OFF', val: '40' },
                        { label: '50% OFF', val: '50' }
                      ].map((chip, cIdx) => (
                        <button
                          key={cIdx}
                          type="button"
                          onClick={() => handleDiscountPercentChange(chip.val)}
                          style={{
                            fontSize: '0.7rem',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            border: (String(discountPercent) === chip.val && (chip.val !== '' || !productForm.discount_price)) ? '1px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.12)',
                            background: (String(discountPercent) === chip.val && (chip.val !== '' || !productForm.discount_price)) ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                            color: (String(discountPercent) === chip.val && (chip.val !== '' || !productForm.discount_price)) ? '#f5df93' : '#94a3b8',
                            cursor: 'pointer',
                            fontWeight: 600,
                            transition: 'all 0.2s'
                          }}
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Fragrance Photos Gallery (Primary + Multi-angle Extra Photos) */}
                <div style={{
                  background: 'linear-gradient(145deg, rgba(16, 21, 31, 0.95) 0%, rgba(10, 13, 20, 0.98) 100%)',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  borderRadius: '16px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: '0 8px 28px rgba(0, 0, 0, 0.5)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ImageIcon size={16} color="#d4af37" />
                      <span style={{ fontSize: '0.84rem', color: '#f5df93', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Fragrance Photos & Multi-Angle Gallery
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      Upload 3–4+ photos to activate the automatic card loop & product gallery
                    </span>
                  </div>

                  {/* Primary Cover Image */}
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#ffd700', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                      ⭐ Primary Cover Photo (First Slide on Card & Shop)
                    </div>
                    <ImageUploadField
                      id="product-primary"
                      label="Main Bottle Image *"
                      value={productForm.primary_image}
                      onChange={(url) => setProductForm({ ...productForm, primary_image: url })}
                    />
                  </div>

                  {/* Additional Gallery Photos Section */}
                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <span style={{ fontSize: '0.78rem', color: '#f8fafc', fontWeight: 600 }}>
                          Additional Gallery & Angle Photos ({productForm.additional_images?.length || 0})
                        </span>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          These will smoothly cycle in the card swiper loop on Home, Shop & Product Details.
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddAdditionalImage}
                        className="btn-luxury-gold"
                        style={{
                          padding: '6px 14px',
                          fontSize: '0.76rem',
                          borderRadius: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <Plus size={14} /> Add Extra Photo
                      </button>
                    </div>

                    {/* Gallery Items List */}
                    {productForm.additional_images && productForm.additional_images.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {productForm.additional_images.map((imgUrl, imgIdx) => (
                          <div 
                            key={imgIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '12px',
                              padding: '12px',
                              background: 'rgba(255, 255, 255, 0.02)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              borderRadius: '12px'
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <ImageUploadField
                                id={`product-additional-${imgIdx}`}
                                label={`Gallery Photo #${imgIdx + 2} (Angle / Box / Cap View)`}
                                value={imgUrl}
                                onChange={(url) => handleUpdateAdditionalImage(imgIdx, url)}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveAdditionalImage(imgIdx)}
                              style={{
                                background: 'rgba(244, 63, 94, 0.12)',
                                border: '1px solid rgba(244, 63, 94, 0.3)',
                                color: '#f43f5e',
                                borderRadius: '8px',
                                padding: '8px',
                                cursor: 'pointer',
                                marginTop: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                              }}
                              title="Delete this photo"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{
                        padding: '14px',
                        textAlign: 'center',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px dashed rgba(212, 175, 55, 0.25)',
                        borderRadius: '12px',
                        color: '#94a3b8',
                        fontSize: '0.78rem'
                      }}>
                        No extra gallery photos added yet. Click <strong>"+ Add Extra Photo"</strong> above to add 2–3 more angle photos so your perfume card loops seamlessly!
                      </div>
                    )}
                  </div>
                </div>

                {/* Fragrance Notes (Top, Middle, Base) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#f5df93', display: 'block', marginBottom: '4px' }}>Top Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. Bergamot, Saffron"
                      value={productForm.top_notes}
                      onChange={(e) => setProductForm({ ...productForm, top_notes: e.target.value })}
                      className="form-input-luxury"
                      style={{ fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#f5df93', display: 'block', marginBottom: '4px' }}>Heart / Middle Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. Grasse Rose, Jasmine"
                      value={productForm.middle_notes}
                      onChange={(e) => setProductForm({ ...productForm, middle_notes: e.target.value })}
                      className="form-input-luxury"
                      style={{ fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#f5df93', display: 'block', marginBottom: '4px' }}>Base Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. Mysore Sandalwood, Amber"
                      value={productForm.base_notes}
                      onChange={(e) => setProductForm({ ...productForm, base_notes: e.target.value })}
                      className="form-input-luxury"
                      style={{ fontSize: '0.8rem' }}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Fragrance Description & Story</label>
                  <textarea
                    rows={3}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="form-input-luxury"
                  />
                </div>

                {/* PRESTIGE BADGES, SPOTLIGHT STATUS & RATING SOCIAL PROOF */}
                <div style={{
                  background: 'linear-gradient(145deg, rgba(16, 21, 31, 0.95) 0%, rgba(10, 13, 20, 0.98) 100%)',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  borderRadius: '16px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: '0 8px 28px rgba(0, 0, 0, 0.5)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Crown size={16} color="#d4af37" />
                      <span style={{ fontSize: '0.84rem', color: '#f5df93', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Prestige Badges & Spotlight Placement
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      Select which collections & tags this perfume appears in
                    </span>
                  </div>

                  {/* 3 Prestige Toggle Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '12px' }}>
                    
                    {/* New Arrival Toggle Card */}
                    <div
                      onClick={() => setProductForm(prev => ({ ...prev, is_new_arrival: !prev.is_new_arrival }))}
                      style={{
                        background: productForm.is_new_arrival
                          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%)'
                          : 'rgba(255, 255, 255, 0.03)',
                        border: productForm.is_new_arrival ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        padding: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: productForm.is_new_arrival ? '0 0 16px rgba(16, 185, 129, 0.2)' : 'none',
                        userSelect: 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.86rem', color: productForm.is_new_arrival ? '#6ee7b7' : '#f8fafc' }}>
                          <Rocket size={15} color={productForm.is_new_arrival ? '#10b981' : '#94a3b8'} />
                          <span>New Arrival</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={productForm.is_new_arrival}
                          onChange={() => {}}
                          style={{ accentColor: '#10b981', cursor: 'pointer' }}
                        />
                      </div>
                      <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                        Ranks in New Arrivals carousel & displays "NEW" badge on storefront.
                      </p>
                    </div>

                    {/* Bestseller Toggle Card */}
                    <div
                      onClick={() => setProductForm(prev => ({ ...prev, is_best_seller: !prev.is_best_seller }))}
                      style={{
                        background: productForm.is_best_seller
                          ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.22) 0%, rgba(212, 175, 55, 0.06) 100%)'
                          : 'rgba(255, 255, 255, 0.03)',
                        border: productForm.is_best_seller ? '1px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        padding: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: productForm.is_best_seller ? '0 0 16px rgba(212, 175, 55, 0.25)' : 'none',
                        userSelect: 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.86rem', color: productForm.is_best_seller ? '#f5df93' : '#f8fafc' }}>
                          <Crown size={15} color={productForm.is_best_seller ? '#d4af37' : '#94a3b8'} />
                          <span>Bestseller</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={productForm.is_best_seller}
                          onChange={() => {}}
                          style={{ accentColor: '#d4af37', cursor: 'pointer' }}
                        />
                      </div>
                      <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                        Ranks in Most Coveted list & displays gold "BESTSELLER" tag.
                      </p>
                    </div>

                    {/* Featured Collection Toggle Card */}
                    <div
                      onClick={() => setProductForm(prev => ({ ...prev, is_featured: !prev.is_featured }))}
                      style={{
                        background: productForm.is_featured
                          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.05) 100%)'
                          : 'rgba(255, 255, 255, 0.03)',
                        border: productForm.is_featured ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        padding: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: productForm.is_featured ? '0 0 16px rgba(59, 130, 246, 0.2)' : 'none',
                        userSelect: 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.86rem', color: productForm.is_featured ? '#93c5fd' : '#f8fafc' }}>
                          <Sparkles size={15} color={productForm.is_featured ? '#60a5fa' : '#94a3b8'} />
                          <span>Featured Flacon</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={productForm.is_featured}
                          onChange={() => {}}
                          style={{ accentColor: '#3b82f6', cursor: 'pointer' }}
                        />
                      </div>
                      <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                        Spotlighted on Homepage curated fragrance showcases.
                      </p>
                    </div>

                  </div>

                  {/* Customer Star Rating & Review Count (Highest Rated Ranking Controls) */}
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#ffd700', fontWeight: 700 }}>
                        <Star size={14} color="#ffd700" fill="#ffd700" /> Star Rating & Social Proof (Highest Rated Sorting)
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        Controls ranking in "Highest Rated" filter on shop
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '10px', alignItems: 'center' }}>
                      {/* Star Rating Score */}
                      <div>
                        <label style={{ fontSize: '0.74rem', color: '#f5df93', display: 'block', marginBottom: '3px', fontWeight: 600 }}>
                          Star Rating (1.00 – 5.00)
                        </label>
                        <input
                          type="number"
                          step="0.05"
                          min="1"
                          max="5"
                          placeholder="4.95"
                          value={productForm.rating !== undefined ? productForm.rating : 5.0}
                          onChange={(e) => setProductForm({ ...productForm, rating: e.target.value })}
                          className="form-input-luxury"
                          style={{ padding: '7px 10px', fontSize: '0.82rem' }}
                        />
                      </div>

                      {/* Number of Reviews */}
                      <div>
                        <label style={{ fontSize: '0.74rem', color: '#f5df93', display: 'block', marginBottom: '3px', fontWeight: 600 }}>
                          Verified Reviews Count
                        </label>
                        <input
                          type="number"
                          min="0"
                          placeholder="140"
                          value={productForm.num_reviews !== undefined ? productForm.num_reviews : 140}
                          onChange={(e) => setProductForm({ ...productForm, num_reviews: e.target.value })}
                          className="form-input-luxury"
                          style={{ padding: '7px 10px', fontSize: '0.82rem' }}
                        />
                      </div>
                    </div>

                    {/* Quick Star Rating Presets */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {[
                        { label: '5.0 ★ Exceptional', val: 5.0 },
                        { label: '4.95 ★ Masterpiece', val: 4.95 },
                        { label: '4.90 ★ Top Rated', val: 4.90 },
                        { label: '4.85 ★ Coveted', val: 4.85 },
                        { label: '4.75 ★ Splendid', val: 4.75 }
                      ].map((preset, pIdx) => {
                        const isCurrent = Number(productForm.rating) === preset.val;
                        return (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => setProductForm(prev => ({ ...prev, rating: preset.val }))}
                            style={{
                              fontSize: '0.68rem',
                              padding: '3px 8px',
                              borderRadius: '8px',
                              border: isCurrent ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.08)',
                              background: isCurrent ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255,255,255,0.03)',
                              color: isCurrent ? '#f5df93' : '#94a3b8',
                              cursor: 'pointer',
                              fontWeight: isCurrent ? 700 : 500,
                              transition: 'all 0.15s'
                            }}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* PRODUCT RETURN & REPLACEMENT POLICY CONTROLS */}
                <div style={{
                  background: 'linear-gradient(145deg, rgba(16, 21, 31, 0.95) 0%, rgba(10, 13, 20, 0.98) 100%)',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  borderRadius: '16px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxShadow: '0 8px 28px rgba(0, 0, 0, 0.5)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <RotateCcw size={16} color="#d4af37" />
                      <span style={{ fontSize: '0.84rem', color: '#f5df93', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Return Eligibility & Product Policy
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      Displayed dynamically on the product details page & customer order receipts
                    </span>
                  </div>

                  {/* Returnable Switch */}
                  <div
                    onClick={() => setProductForm(prev => ({ ...prev, is_returnable: !prev.is_returnable }))}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: productForm.is_returnable ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.1)',
                      border: productForm.is_returnable ? '1px solid #10b981' : '1px solid rgba(244, 63, 94, 0.4)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      userSelect: 'none'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: productForm.is_returnable ? '#6ee7b7' : '#fda4af' }}>
                        {productForm.is_returnable ? '✓ Returns & Replacements Enabled' : '✕ Non-Returnable Item (Final Sale)'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                        {productForm.is_returnable 
                          ? 'Customers can request doorstep return / exchange for this fragrance' 
                          : 'Returns disabled for this item due to hygiene, sample or bespoke nature'}
                      </div>
                    </div>

                    <div style={{ color: productForm.is_returnable ? '#10b981' : '#f43f5e', display: 'flex', alignItems: 'center' }}>
                      {productForm.is_returnable ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                    </div>
                  </div>

                  {/* Return Window Days (When Enabled) */}
                  {productForm.is_returnable && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.74rem', color: '#f5df93', display: 'block', marginBottom: '3px', fontWeight: 600 }}>
                          Return Window (Days from Delivery) *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="90"
                          value={productForm.return_window_days !== undefined ? productForm.return_window_days : 7}
                          onChange={(e) => setProductForm({ ...productForm, return_window_days: parseInt(e.target.value, 10) || 7 })}
                          className="form-input-luxury"
                          style={{ padding: '7px 10px', fontSize: '0.82rem' }}
                        />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
                        {[7, 10, 15, 30].map(days => (
                          <button
                            key={days}
                            type="button"
                            onClick={() => setProductForm(prev => ({ ...prev, return_window_days: days }))}
                            style={{
                              background: Number(productForm.return_window_days) === days ? 'rgba(212, 175, 55, 0.3)' : 'rgba(255,255,255,0.04)',
                              border: Number(productForm.return_window_days) === days ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                              color: Number(productForm.return_window_days) === days ? '#f5df93' : '#94a3b8',
                              padding: '5px 10px',
                              borderRadius: '8px',
                              fontSize: '0.72rem',
                              cursor: 'pointer',
                              fontWeight: 600
                            }}
                          >
                            {days} Days
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Custom Policy Terms Textarea */}
                  <div>
                    <label style={{ fontSize: '0.74rem', color: '#f5df93', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                      Custom Return Terms & Hygiene Policy (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={productForm.return_policy || ''}
                      onChange={(e) => setProductForm({ ...productForm, return_policy: e.target.value })}
                      placeholder="e.g. Unopened flacon with intact outer box cellophane seal and batch code required..."
                      className="form-input-luxury"
                      style={{ fontSize: '0.82rem' }}
                    />
                    <span style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '3px', display: 'block' }}>
                      Leave blank to use the store's default luxury fragrance guarantee.
                    </span>
                  </div>
                </div>

                {/* Submit button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setProductModalOpen(false)}
                    disabled={isSubmitting}
                    className="btn-luxury-outline"
                    style={{ padding: '10px 18px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={handleSaveProduct}
                    className="btn-luxury-gold"
                    style={{ padding: '10px 24px', opacity: isSubmitting ? 0.7 : 1 }}
                  >
                    <Save size={16} /> {isSubmitting ? 'Saving...' : (editingProduct ? 'Save Changes' : 'Publish Fragrance')}
                  </button>
                </div>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CATEGORY MODAL (ADD & EDIT) */}
      {/* ========================================================= */}
      {categoryModalOpen && (
        <div className="admin-modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.88)',
          backdropFilter: 'blur(14px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2500,
          padding: '16px'
        }}>
          <div className="glass-panel admin-modal-panel" style={{
            maxWidth: '560px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            borderRadius: '20px',
            padding: 'clamp(20px, 4vw, 32px)',
            position: 'relative',
            border: '1px solid var(--border-gold)'
          }}>
            <button
              onClick={() => setCategoryModalOpen(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.76rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '4px' }}>
                {editingCategory ? 'Update Olfactory Family' : 'New Fragrance Family'}
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#ffffff' }}>
                {editingCategory ? `Edit Category "${editingCategory.name}"` : 'Add New Fragrance Category'}
              </h2>
            </div>

            <form onSubmit={handleSaveCategory}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#f5df93', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Category Name *</label>
                  <input
                    type="text"
                    required
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder="e.g. Woody & Smoky Amber"
                    className="form-input-luxury"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>URL Slug (Optional - auto generated)</label>
                  <input
                    type="text"
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                    placeholder="e.g. woody-smoky-amber"
                    className="form-input-luxury"
                  />
                </div>

                <ImageUploadField
                  id="category-banner"
                  label="Category Banner Image"
                  value={categoryForm.image}
                  onChange={(url) => setCategoryForm({ ...categoryForm, image: url })}
                />

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Description</label>
                  <textarea
                    rows={3}
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    placeholder="Describe notes and character of this olfactive accord..."
                    className="form-input-luxury"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setCategoryModalOpen(false)}
                    disabled={isSubmitting}
                    className="btn-luxury-outline"
                    style={{ padding: '10px 18px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={handleSaveCategory}
                    className="btn-luxury-gold"
                    style={{ padding: '10px 24px', opacity: isSubmitting ? 0.7 : 1 }}
                  >
                    <Save size={16} /> {isSubmitting ? 'Saving...' : (editingCategory ? 'Save Changes' : 'Create Category')}
                  </button>
                </div>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* BRAND MODAL (ADD & EDIT) */}
      {/* ========================================================= */}
      {brandModalOpen && (
        <div className="admin-modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.88)',
          backdropFilter: 'blur(14px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2500,
          padding: '16px'
        }}>
          <div className="glass-panel admin-modal-panel" style={{
            maxWidth: '580px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            borderRadius: '20px',
            padding: 'clamp(20px, 4vw, 32px)',
            position: 'relative',
            border: '1px solid var(--border-gold)'
          }}>
            <button
              onClick={() => setBrandModalOpen(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.76rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '4px' }}>
                {editingBrand ? 'Update Designer House' : 'New Perfume House'}
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#ffffff' }}>
                {editingBrand ? `Edit Brand "${editingBrand.name}"` : 'Add New Designer Brand'}
              </h2>
            </div>

            <form onSubmit={handleSaveBrand}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#f5df93', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={brandForm.name}
                    onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                    placeholder="e.g. Creed Paris"
                    className="form-input-luxury"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>URL Slug (Optional)</label>
                    <input
                      type="text"
                      value={brandForm.slug}
                      onChange={(e) => setBrandForm({ ...brandForm, slug: e.target.value })}
                      placeholder="e.g. creed"
                      className="form-input-luxury"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Country of Origin</label>
                    <input
                      type="text"
                      value={brandForm.origin_country}
                      onChange={(e) => setBrandForm({ ...brandForm, origin_country: e.target.value })}
                      placeholder="e.g. France, Italy, UK"
                      className="form-input-luxury"
                    />
                  </div>
                </div>

                <ImageUploadField
                  id="brand-logo"
                  label="Brand Logo Image"
                  value={brandForm.logo}
                  onChange={(url) => setBrandForm({ ...brandForm, logo: url })}
                />

                <ImageUploadField
                  id="brand-banner"
                  label="Brand Banner Image"
                  value={brandForm.banner_image}
                  onChange={(url) => setBrandForm({ ...brandForm, banner_image: url })}
                />

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Brand Story & Heritage</label>
                  <textarea
                    rows={3}
                    value={brandForm.description}
                    onChange={(e) => setBrandForm({ ...brandForm, description: e.target.value })}
                    placeholder="Heritage of the fragrance house..."
                    className="form-input-luxury"
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#cbd5e1', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={brandForm.is_featured}
                      onChange={(e) => setBrandForm({ ...brandForm, is_featured: e.target.checked })}
                      style={{ accentColor: '#d4af37' }}
                    />
                    Feature this brand on homepage & mega menu
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setBrandModalOpen(false)}
                    disabled={isSubmitting}
                    className="btn-luxury-outline"
                    style={{ padding: '10px 18px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={handleSaveBrand}
                    className="btn-luxury-gold"
                    style={{ padding: '10px 24px', opacity: isSubmitting ? 0.7 : 1 }}
                  >
                    <Save size={16} /> {isSubmitting ? 'Saving...' : (editingBrand ? 'Save Changes' : 'Create Brand')}
                  </button>
                </div>

              </div>
            </form>
          </div>
        </div>
      )}


      {/* ========================================================= */}
      {/* ORDER DETAILS & CUSTOMER CONNECT MODAL */}
      {/* ========================================================= */}
      {orderDetailsModalOpen && selectedOrderDetails && (
        <div className="admin-modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(4, 6, 10, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div 
            className="glass-panel admin-modal-panel" 
            style={{ 
              width: '100%', 
              maxWidth: '920px', 
              maxHeight: '92vh', 
              overflowY: 'auto', 
              borderRadius: '24px', 
              padding: 'clamp(20px, 3.5vw, 32px)', 
              border: '1.5px solid rgba(212, 175, 55, 0.4)', 
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(212, 175, 55, 0.15)',
              position: 'relative'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.78rem', color: '#d4af37', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    CUSTOMER ORDER FILE
                  </span>
                  <span style={{
                    background: selectedOrderDetails.order_status === 'Delivered' ? 'rgba(16, 185, 129, 0.2)' : (selectedOrderDetails.order_status === 'Cancelled' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(212, 175, 55, 0.2)'),
                    border: selectedOrderDetails.order_status === 'Delivered' ? '1px solid #10b981' : (selectedOrderDetails.order_status === 'Cancelled' ? '1px solid #f43f5e' : '1px solid #d4af37'),
                    color: selectedOrderDetails.order_status === 'Delivered' ? '#6ee7b7' : (selectedOrderDetails.order_status === 'Cancelled' ? '#fda4af' : '#fef08a'),
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '9999px'
                  }}>
                    {selectedOrderDetails.order_status}
                  </span>
                  <span style={{
                    background: selectedOrderDetails.payment_status === 'Paid' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    border: selectedOrderDetails.payment_status === 'Paid' ? '1px solid #10b981' : '1px solid #f59e0b',
                    color: selectedOrderDetails.payment_status === 'Paid' ? '#10b981' : '#f59e0b',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '9999px'
                  }}>
                    ● {selectedOrderDetails.payment_status}
                  </span>
                </div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#ffffff', margin: 0 }}>
                  Order #{selectedOrderDetails.order_number || selectedOrderDetails.id}
                </h2>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
                  Placed on {new Date(selectedOrderDetails.created_at).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOrderDetailsModalOpen(false)}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Grid: Customer Contact & Delivery Destination */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: '18px', marginBottom: '22px' }}>
              
              {/* Card 1: Customer Contact & Direct Connect */}
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '16px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f5df93', fontSize: '0.88rem', fontWeight: 700, marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                  <User size={16} color="#d4af37" />
                  <span>Customer Contact & Direct Connect</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ color: '#94a3b8' }}>Client Name:</span>
                    <strong style={{ color: '#ffffff', fontSize: '0.92rem' }}>{selectedOrderDetails.shipping_name || selectedOrderDetails.customer_name}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#94a3b8' }}>Phone Number:</span>
                    <strong style={{ color: '#f5df93', fontFamily: 'monospace', fontSize: '0.92rem' }}>
                      {selectedOrderDetails.shipping_phone || selectedOrderDetails.customer_phone || 'Not recorded'}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ color: '#94a3b8' }}>Email Address:</span>
                    <span style={{ color: '#cbd5e1' }}>{selectedOrderDetails.customer_email || 'Not provided'}</span>
                  </div>

                  {/* Direct Contact Action Buttons (Call / WhatsApp / Email) */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {(selectedOrderDetails.shipping_phone || selectedOrderDetails.customer_phone) && (
                      <>
                        <a
                          href={`https://wa.me/${(selectedOrderDetails.shipping_phone || selectedOrderDetails.customer_phone).replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(selectedOrderDetails.shipping_name || selectedOrderDetails.customer_name || 'Customer')},%20this%20is%20TRY%20ME%20BRO%20Luxury%20Perfumes%20regarding%20your%20order%20%23${selectedOrderDetails.order_number || selectedOrderDetails.id}.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                            color: '#ffffff',
                            borderRadius: '8px',
                            padding: '8px 14px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)'
                          }}
                        >
                          <MessageSquare size={14} /> WhatsApp Chat
                        </a>

                        <a
                          href={`tel:${selectedOrderDetails.shipping_phone || selectedOrderDetails.customer_phone}`}
                          style={{
                            background: 'rgba(212, 175, 55, 0.15)',
                            border: '1px solid #d4af37',
                            color: '#fef08a',
                            borderRadius: '8px',
                            padding: '8px 14px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Phone size={14} /> Call Phone
                        </a>
                      </>
                    )}

                    {selectedOrderDetails.customer_email && (
                      <a
                        href={`mailto:${selectedOrderDetails.customer_email}?subject=Regarding%20Your%20Order%20%23${selectedOrderDetails.order_number || selectedOrderDetails.id}&body=Dear%20${encodeURIComponent(selectedOrderDetails.shipping_name || 'Customer')},%0A%0AThank%20you%20for%20choosing%20TRY%20ME%20BRO%20Luxury%20Perfumes.`}
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          color: '#e2e8f0',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Mail size={14} /> Send Email
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 2: Delivery Destination & Shipping Details */}
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '16px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#f5df93', fontSize: '0.88rem', fontWeight: 700, marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} color="#d4af37" />
                    <span>Delivery Address & Destination</span>
                  </div>

                  {selectedOrderDetails.shipping_street && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedOrderDetails.shipping_street} ${selectedOrderDetails.shipping_city || ''} ${selectedOrderDetails.shipping_postal_code || ''}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#d4af37', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}
                    >
                      Google Maps <ExternalLink size={11} />
                    </a>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '0.74rem', textTransform: 'uppercase', display: 'block' }}>Recipient:</span>
                    <strong style={{ color: '#ffffff' }}>{selectedOrderDetails.shipping_name || selectedOrderDetails.customer_name || 'Customer'}</strong>
                  </div>

                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '0.74rem', textTransform: 'uppercase', display: 'block' }}>Street Address:</span>
                    <span style={{ color: '#e2e8f0', lineHeight: '1.4' }}>
                      {selectedOrderDetails.shipping_street || 'Address not recorded on order'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <span style={{ color: '#94a3b8', fontSize: '0.74rem', textTransform: 'uppercase', display: 'block' }}>City / State:</span>
                      <span style={{ color: '#f8fafc' }}>
                        {selectedOrderDetails.shipping_city ? `${selectedOrderDetails.shipping_city}, ${selectedOrderDetails.shipping_state || ''}` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8', fontSize: '0.74rem', textTransform: 'uppercase', display: 'block' }}>Postal PIN / Country:</span>
                      <span style={{ color: '#f8fafc' }}>
                        {selectedOrderDetails.shipping_postal_code || ''} ({selectedOrderDetails.shipping_country || 'India'})
                      </span>
                    </div>
                  </div>

                  {/* Distance from Main Store PIN 382721 */}
                  <div style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '8px', padding: '7px 10px', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#f5df93' }}>
                      <Truck size={14} color="#d4af37" />
                      <span>Distance from Main Store (PIN 382721):</span>
                    </div>
                    <strong style={{ color: '#ffffff', fontSize: '0.82rem' }}>
                      {selectedOrderDetails.distance_km ? `${selectedOrderDetails.distance_km} KM` : 'Calculated on dispatch'}
                    </strong>
                  </div>

                  {selectedOrderDetails.notes && (
                    <div style={{ background: 'rgba(212, 175, 55, 0.08)', border: '1px dashed rgba(212, 175, 55, 0.3)', borderRadius: '8px', padding: '8px 10px', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#f5df93', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>
                        Delivery Instructions / Notes:
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>{selectedOrderDetails.notes}</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Purchased Fragrance Items */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '18px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontSize: '0.88rem', fontWeight: 700, marginBottom: '12px' }}>
                <Package size={16} color="#d4af37" />
                <span>Purchased Fragrance Items ({selectedOrderDetails.items?.length || 0})</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(!selectedOrderDetails.items || selectedOrderDetails.items.length === 0) ? (
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No items recorded for this order.</div>
                ) : (
                  selectedOrderDetails.items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'rgba(10, 13, 20, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {item.primary_image && (
                          <img
                            src={item.primary_image}
                            alt={item.product_name || item.name}
                            style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }}
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.86rem' }}>
                            {item.product_name || item.name || `Fragrance Bottle #${item.product_id}`}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                            Qty: {item.quantity} • Unit Price: ₹{Number(item.price || item.unit_price || 0).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>

                      <div style={{ fontWeight: 700, color: '#d4af37', fontSize: '0.9rem' }}>
                        ₹{Number(item.subtotal || ((item.price || item.unit_price || 0) * item.quantity)).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Financial Breakdown & Live Action Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '16px', background: 'linear-gradient(135deg, rgba(20, 26, 38, 0.8) 0%, rgba(10, 13, 20, 0.9) 100%)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '16px', padding: '18px' }}>
              
              {/* Financial Summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>Artisanal Subtotal:</span>
                  <span style={{ color: '#ffffff' }}>₹{Number(selectedOrderDetails.subtotal || selectedOrderDetails.total_amount || selectedOrderDetails.final_amount).toLocaleString('en-IN')}</span>
                </div>

                {Number(selectedOrderDetails.discount_amount) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                    <span>Privilege Discount {selectedOrderDetails.coupon_code ? `(${selectedOrderDetails.coupon_code})` : ''}:</span>
                    <span>-₹{Number(selectedOrderDetails.discount_amount).toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>Shipping ({selectedOrderDetails.distance_km ? `${selectedOrderDetails.distance_km} KM from Store 382721` : 'Standard'}):</span>
                  <span style={{ color: Number(selectedOrderDetails.shipping_fee || selectedOrderDetails.shipping_amount) === 0 ? '#10b981' : '#ffffff', fontWeight: 600 }}>
                    {Number(selectedOrderDetails.shipping_fee || selectedOrderDetails.shipping_amount) === 0 ? 'COMPLIMENTARY' : `₹${Number(selectedOrderDetails.shipping_fee || selectedOrderDetails.shipping_amount).toLocaleString('en-IN')}`}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(212, 175, 55, 0.3)', paddingTop: '8px', fontSize: '1.05rem', fontWeight: 800 }}>
                  <span style={{ color: '#ffffff' }}>Grand Total:</span>
                  <span style={{ color: '#d4af37' }}>₹{Number(selectedOrderDetails.final_amount || selectedOrderDetails.total_amount).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Live Status & Logistics Fulfillment Management */}
              <div style={{
                background: 'rgba(212, 175, 55, 0.05)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#f5df93', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                    ⚡ Order Status & Courier Logistics Control
                  </h4>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    background:
                      orderFulfillmentStatus === 'Delivered' ? 'rgba(16, 185, 129, 0.2)' :
                      orderFulfillmentStatus === 'Shipped' ? 'rgba(59, 130, 246, 0.2)' :
                      orderFulfillmentStatus === 'Out for Delivery' ? 'rgba(168, 85, 247, 0.2)' :
                      orderFulfillmentStatus === 'Cancelled' ? 'rgba(244, 63, 94, 0.2)' :
                      'rgba(234, 179, 8, 0.2)',
                    color:
                      orderFulfillmentStatus === 'Delivered' ? '#6ee7b7' :
                      orderFulfillmentStatus === 'Shipped' ? '#93c5fd' :
                      orderFulfillmentStatus === 'Out for Delivery' ? '#d8b4fe' :
                      orderFulfillmentStatus === 'Cancelled' ? '#fda4af' :
                      '#fde047',
                    border: '1px solid currentColor'
                  }}>
                    User Sees: ● {orderFulfillmentStatus}
                  </span>
                </div>

                {/* Status Selection Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.74rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Fulfillment Status:
                    </label>
                    <select
                      value={orderFulfillmentStatus}
                      onChange={(e) => setOrderFulfillmentStatus(e.target.value)}
                      className="form-input-luxury"
                      style={{ padding: '8px 10px', fontSize: '0.84rem' }}
                    >
                      <option value="Pending">Pending (Awaiting Confirmation)</option>
                      <option value="Confirmed">Confirmed (Order Accepted)</option>
                      <option value="Processing">Processing (Packing in Boutique)</option>
                      <option value="Shipped">Shipped (Dispatched in Transit)</option>
                      <option value="Out for Delivery">Out for Delivery (Courier on Route)</option>
                      <option value="Delivered">Delivered (Completed)</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.74rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Courier / Logistics Partner:
                    </label>
                    <select
                      value={orderCourierName}
                      onChange={(e) => {
                        const c = e.target.value;
                        setOrderCourierName(c);
                        if (!orderTrackingUrl || orderTrackingUrl.includes('delhivery.com') || orderTrackingUrl.includes('bluedart.com') || orderTrackingUrl.includes('dtdc.in')) {
                          if (c === 'Delhivery') setOrderTrackingUrl(orderTrackingNumber ? `https://www.delhivery.com/track/package/${orderTrackingNumber}` : 'https://www.delhivery.com/');
                          else if (c === 'Blue Dart') setOrderTrackingUrl('https://www.bluedart.com/');
                          else if (c === 'DTDC') setOrderTrackingUrl('https://www.dtdc.in/');
                          else if (c === 'Ekart') setOrderTrackingUrl('https://ekartlogistics.com/');
                          else if (c === 'Shadowfax') setOrderTrackingUrl('https://track.shadowfax.in/');
                          else if (c === 'India Post') setOrderTrackingUrl('https://www.indiapost.gov.in/');
                        }
                      }}
                      className="form-input-luxury"
                      style={{ padding: '8px 10px', fontSize: '0.84rem' }}
                    >
                      <option value="Delhivery">Delhivery Express</option>
                      <option value="Blue Dart">Blue Dart</option>
                      <option value="DTDC">DTDC Express</option>
                      <option value="Ekart">Ekart Logistics</option>
                      <option value="Shadowfax">Shadowfax</option>
                      <option value="India Post">India Post (Speed Post)</option>
                      <option value="FedEx">FedEx International</option>
                      <option value="DHL">DHL Express</option>
                      <option value="Other">Other Courier Partner</option>
                    </select>
                  </div>
                </div>

                {/* Tracking Number & Tracking URL Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.74rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      AWB / Tracking Number:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. DL9823419082"
                      value={orderTrackingNumber}
                      onChange={(e) => {
                        const val = e.target.value;
                        setOrderTrackingNumber(val);
                        if (orderCourierName === 'Delhivery' && val) {
                          setOrderTrackingUrl(`https://www.delhivery.com/track/package/${val.trim()}`);
                        }
                      }}
                      className="form-input-luxury"
                      style={{ padding: '8px 10px', fontSize: '0.84rem', fontFamily: 'monospace' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.74rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Estimated Delivery Date / Time:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 15 Sep 2026 or 2–3 Days"
                      value={orderEstimatedDelivery}
                      onChange={(e) => setOrderEstimatedDelivery(e.target.value)}
                      className="form-input-luxury"
                      style={{ padding: '8px 10px', fontSize: '0.84rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Live Tracking Portal URL (Customer can click to track):
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.delhivery.com/track/package/..."
                    value={orderTrackingUrl}
                    onChange={(e) => setOrderTrackingUrl(e.target.value)}
                    className="form-input-luxury"
                    style={{ padding: '8px 10px', fontSize: '0.84rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Customer Delivery Remarks / Status Note:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Fragrance packed in protective temperature-controlled casing and handed to courier partner."
                    value={orderStatusNotes}
                    onChange={(e) => setOrderStatusNotes(e.target.value)}
                    className="form-input-luxury"
                    style={{ padding: '8px 10px', fontSize: '0.82rem', resize: 'vertical' }}
                  />
                </div>

                {/* Save Tracking & Status Button */}
                <button
                  type="button"
                  onClick={() => handleSaveOrderTrackingAndStatus(selectedOrderDetails.id)}
                  disabled={isSubmitting}
                  className="btn-luxury-gold admin-save-tracking-btn"
                  style={{
                    padding: '11px 16px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    whiteSpace: 'normal',
                    textAlign: 'center',
                    lineHeight: 1.3,
                    wordBreak: 'break-word',
                    borderRadius: '12px'
                  }}
                >
                  <Save size={16} style={{ flexShrink: 0 }} />
                  <span>{isSubmitting ? 'Saving Updates...' : 'Save Status & Tracking (Sync to Customer)'}</span>
                </button>

                {/* Payment Verification Controls */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
                  <label style={{ fontSize: '0.74rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                    Quick Payment Verification:
                  </label>
                  <div className="admin-quick-pay-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        handleUpdatePaymentStatus(selectedOrderDetails.id, 'Paid');
                        setSelectedOrderDetails(prev => ({ ...prev, payment_status: 'Paid', order_status: 'Processing' }));
                        setOrderFulfillmentStatus('Processing');
                      }}
                      disabled={selectedOrderDetails.payment_status === 'Paid'}
                      style={{
                        background: selectedOrderDetails.payment_status === 'Paid' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid #10b981',
                        color: '#10b981',
                        padding: '8px 6px',
                        borderRadius: '8px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: selectedOrderDetails.payment_status === 'Paid' ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        textAlign: 'center',
                        lineHeight: 1.2
                      }}
                    >
                      <span>✓</span>
                      <span>{selectedOrderDetails.payment_status === 'Paid' ? 'Verified' : 'Approve'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleUpdatePaymentStatus(selectedOrderDetails.id, 'Pending');
                        setSelectedOrderDetails(prev => ({ ...prev, payment_status: 'Pending' }));
                      }}
                      disabled={selectedOrderDetails.payment_status === 'Pending'}
                      style={{
                        background: 'rgba(234, 179, 8, 0.15)',
                        border: '1px solid #eab308',
                        color: '#fde047',
                        padding: '8px 6px',
                        borderRadius: '8px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        textAlign: 'center',
                        lineHeight: 1.2
                      }}
                    >
                      <span>⏳</span>
                      <span>Pending</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleUpdatePaymentStatus(selectedOrderDetails.id, 'Failed');
                        setSelectedOrderDetails(prev => ({ ...prev, payment_status: 'Failed', order_status: 'Cancelled' }));
                        setOrderFulfillmentStatus('Cancelled');
                      }}
                      disabled={selectedOrderDetails.payment_status === 'Failed'}
                      style={{
                        background: selectedOrderDetails.payment_status === 'Failed' ? 'rgba(244, 63, 94, 0.3)' : 'rgba(244, 63, 94, 0.15)',
                        border: '1px solid #f43f5e',
                        color: '#fda4af',
                        padding: '8px 6px',
                        borderRadius: '8px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: selectedOrderDetails.payment_status === 'Failed' ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        textAlign: 'center',
                        lineHeight: 1.2
                      }}
                    >
                      <span>✕</span>
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* RETURN REVIEW & PROCESSING MODAL */}
      {returnReviewModalOpen && selectedReturnForReview && (
        <div className="admin-modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div 
            className="glass-panel admin-modal-panel" 
            style={{
              maxWidth: '640px',
              width: '100%',
              borderRadius: '24px',
              padding: 'clamp(20px, 4vw, 32px)',
              border: '1.5px solid rgba(212, 175, 55, 0.4)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RotateCcw size={18} color="#d4af37" />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: '#ffffff', margin: 0 }}>
                    Process Return #{selectedReturnForReview.return_number}
                  </h3>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                    Order #{selectedReturnForReview.order_number} • Applied by {selectedReturnForReview.user_name || 'Customer'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setReturnReviewModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Product & Return Request Details Card */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(212, 175, 55, 0.25)', padding: '14px', borderRadius: '14px', marginBottom: '20px' }}>
              {selectedReturnForReview.product_image && (
                <img 
                  src={selectedReturnForReview.product_image} 
                  alt={selectedReturnForReview.product_name} 
                  style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover' }} 
                />
              )}
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                  {selectedReturnForReview.product_name}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                  Return Qty: <strong style={{ color: '#cbd5e1' }}>{selectedReturnForReview.quantity}</strong> {selectedReturnForReview.selected_size ? `• Size: ${selectedReturnForReview.selected_size}` : ''}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#f5df93', marginTop: '4px' }}>
                  <strong>Reason:</strong> "{selectedReturnForReview.reason}"
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Refund Amount</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>
                  ₹{Number(selectedReturnForReview.refund_amount || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Customer Remarks & Proof Photo */}
            {(selectedReturnForReview.customer_notes || selectedReturnForReview.image_proof) && (
              <div style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px', padding: '12px', marginBottom: '20px' }}>
                {selectedReturnForReview.customer_notes && (
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: selectedReturnForReview.image_proof ? '10px' : '0' }}>
                    <strong style={{ color: '#f5df93' }}>Customer Comment:</strong> "{selectedReturnForReview.customer_notes}"
                  </div>
                )}
                {selectedReturnForReview.image_proof && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Photo Proof:</span>
                    <a href={selectedReturnForReview.image_proof} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#60a5fa' }}>
                      <img src={selectedReturnForReview.image_proof} alt="" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                      <span>Click to view full image ↗</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Client Contact & Shipping Address Details */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', padding: '12px', marginBottom: '20px', fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              <div><strong>Client:</strong> {selectedReturnForReview.user_name} ({selectedReturnForReview.user_email} • {selectedReturnForReview.user_phone || 'No Phone'})</div>
              {selectedReturnForReview.shipping_street && (
                <div><strong>Pickup Address:</strong> {selectedReturnForReview.shipping_street}, {selectedReturnForReview.shipping_city}, {selectedReturnForReview.shipping_state} - {selectedReturnForReview.shipping_postal_code}</div>
              )}
            </div>

            {/* Form Actions */}
            <form onSubmit={handleSaveReturnReview}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Status Selector */}
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#f5df93', fontWeight: 700, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Set Return Status *
                  </label>
                  <select
                    value={returnReviewStatus}
                    onChange={(e) => setReturnReviewStatus(e.target.value)}
                    className="form-input-luxury"
                    style={{ background: '#0a0d14', color: '#f8fafc', fontSize: '0.9rem', fontWeight: 600 }}
                  >
                    <option value="Requested">Requested (Awaiting Concierge Verification)</option>
                    <option value="Approved">Approved (Doorstep Pickup Scheduled)</option>
                    <option value="Completed">Completed (Item Received at Atelier)</option>
                    <option value="Refunded">Refunded (Refund Credited to Customer)</option>
                    <option value="Rejected">Rejected (Declined per Return Policy)</option>
                  </select>
                </div>

                {/* Pickup Courier Partner & AWB Tracking */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Pickup Courier Partner:
                    </label>
                    <select
                      value={returnReviewCourier}
                      onChange={(e) => setReturnReviewCourier(e.target.value)}
                      className="form-input-luxury"
                      style={{ fontSize: '0.84rem' }}
                    >
                      <option value="Delhivery">Delhivery Return Pickup</option>
                      <option value="Blue Dart">Blue Dart Express</option>
                      <option value="Shadowfax">Shadowfax Reverse Logistics</option>
                      <option value="DTDC">DTDC Courier</option>
                      <option value="Ekart">Ekart Reverse Logistics</option>
                      <option value="Other">Merchant Pickup</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Pickup AWB / Tracking Reference:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. RET-DL9823419082"
                      value={returnReviewTracking}
                      onChange={(e) => setReturnReviewTracking(e.target.value)}
                      className="form-input-luxury"
                      style={{ fontSize: '0.84rem', fontFamily: 'monospace' }}
                    />
                  </div>
                </div>

                {/* Concierge Notes to Customer */}
                <div>
                  <label style={{ fontSize: '0.76rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Concierge Message / Resolution Notes (Displayed to Customer):
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Return approved. Our courier agent will arrive on Wednesday between 10am–2pm to pick up the flacon. Please keep the original box ready."
                    value={returnReviewNotes}
                    onChange={(e) => setReturnReviewNotes(e.target.value)}
                    className="form-input-luxury"
                    style={{ fontSize: '0.82rem' }}
                  />
                </div>

                {/* Submit Actions */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setReturnReviewModalOpen(false)}
                    className="btn-luxury-outline"
                    style={{ flex: 1, padding: '12px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-luxury-gold"
                    style={{ flex: 2, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Save size={16} />
                    {isSubmitting ? 'Saving Updates...' : 'Save & Sync to Customer'}
                  </button>
                </div>

              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;


