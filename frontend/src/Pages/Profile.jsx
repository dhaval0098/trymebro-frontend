import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  User,
  Package,
  Lock,
  LogOut,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  RefreshCw,
  Copy,
  ExternalLink,
  Navigation,
  Check,
  Compass,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  X,
  ChevronRight,
  Upload,
  Camera,
  ImageIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState(user?.address_street || '');
  const [city, setCity] = useState(user?.address_city || '');
  const [state, setState] = useState(user?.address_state || '');
  const [postalCode, setPostalCode] = useState(user?.address_postal_code || '');
  const [country, setCountry] = useState(user?.address_country || 'India');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);
  const [copiedAwb, setCopiedAwb] = useState(null);

  // Returns State
  const [returnsList, setReturnsList] = useState([]);
  const [returnsLoading, setReturnsLoading] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedReturnOrder, setSelectedReturnOrder] = useState(null);
  const [selectedReturnItem, setSelectedReturnItem] = useState(null);
  const [returnReason, setReturnReason] = useState('Damaged or leaking bottle during courier transit');
  const [returnQuantity, setReturnQuantity] = useState(1);
  const [returnCustomerNotes, setReturnCustomerNotes] = useState('');
  const [returnImageProof, setReturnImageProof] = useState('');
  const [uploadingProof, setUploadingProof] = useState(false);
  const [showProofUrlInput, setShowProofUrlInput] = useState(false);
  const [submittingReturn, setSubmittingReturn] = useState(false);

  useEffect(() => {
    if (searchParams.get('tab')) {
      setActiveTab(searchParams.get('tab'));
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setStreet(user.address_street || '');
      setCity(user.address_city || '');
      setState(user.address_state || '');
      setPostalCode(user.address_postal_code || '');
      setCountry(user.address_country || 'India');
    }
  }, [user]);

  // Load user orders
  const fetchOrders = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setOrdersLoading(true);
      else setIsRefreshingOrders(true);
      const res = await api.get('/orders/my-orders');
      if (res.data && res.data.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setOrdersLoading(false);
      setIsRefreshingOrders(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'orders' || activeTab === 'returns') {
      fetchOrders();
      fetchReturns();
      const interval = setInterval(() => {
        fetchOrders(true);
        fetchReturns(true);
      }, 20000);
      return () => clearInterval(interval);
    }
  }, [activeTab, fetchOrders]);

  // Load user returns
  const fetchReturns = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setReturnsLoading(true);
      const res = await api.get('/returns/my-returns');
      if (res.data && res.data.success) {
        setReturnsList(res.data.returns || []);
      }
    } catch (err) {
      console.error('Error fetching returns:', err);
    } finally {
      setReturnsLoading(false);
    }
  }, []);

  const handleCopyAwb = (awb) => {
    if (!awb) return;
    navigator.clipboard.writeText(awb);
    setCopiedAwb(awb);
    toast.success(`AWB #${awb} copied to clipboard!`);
    setTimeout(() => setCopiedAwb(null), 3000);
  };

  const handleOpenReturnModal = (order, item) => {
    setSelectedReturnOrder(order);
    setSelectedReturnItem(item);
    setReturnQuantity(1);
    setReturnReason('Damaged or leaking bottle during courier transit');
    setReturnCustomerNotes('');
    setReturnImageProof('');
    setShowProofUrlInput(false);
    setUploadingProof(false);
    setReturnModalOpen(true);
  };

  const handleProofFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Photo size must be under 10MB');
      return;
    }

    try {
      setUploadingProof(true);
      const formData = new FormData();
      formData.append('image', file);

      try {
        const res = await api.post('/upload/proof', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data?.url || res.data?.path) {
          setReturnImageProof(res.data.url || res.data.path);
          toast.success('📷 Photo uploaded from device successfully!');
          setUploadingProof(false);
          return;
        }
      } catch (uploadErr) {
        console.warn('Server upload failed, falling back to base64 data URL:', uploadErr);
      }

      // Fallback to base64 Data URL
      const reader = new FileReader();
      reader.onload = () => {
        setReturnImageProof(reader.result);
        toast.success('📷 Photo loaded from device!');
        setUploadingProof(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File processing error:', err);
      toast.error('Failed to load image from device');
      setUploadingProof(false);
    }
  };

  const handleSubmitReturnRequest = async (e) => {
    e.preventDefault();
    if (!selectedReturnOrder || !selectedReturnItem) return;

    try {
      setSubmittingReturn(true);
      const payload = {
        order_id: selectedReturnOrder.id,
        product_id: selectedReturnItem.product_id,
        product_name: selectedReturnItem.product_name,
        product_image: selectedReturnItem.product_image,
        selected_size: selectedReturnItem.selected_size,
        quantity: returnQuantity,
        reason: returnReason,
        customer_notes: returnCustomerNotes,
        image_proof: returnImageProof
      };

      const res = await api.post('/returns/request', payload);
      if (res.data.success) {
        toast.success('✨ Return application submitted! Our concierge team will review within 24 hours.');
        setReturnModalOpen(false);
        fetchReturns();
        switchTab('returns');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit return request');
    } finally {
      setSubmittingReturn(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await updateProfile({
        name,
        phone,
        address_street: street,
        address_city: city,
        address_state: state,
        address_postal_code: postalCode,
        address_country: country
      });
      if (res.success) {
        toast.success('Client profile & address updated successfully.');
      }
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    try {
      setSavingPassword(true);
      const res = await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      if (res.data.success) {
        toast.success('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      const res = await api.put(`/orders/${orderId}/cancel`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchOrders(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel order');
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Helper for Stepper Stage Index
  const getStepperActiveIndex = (status) => {
    switch (status) {
      case 'Pending': return 1;
      case 'Confirmed':
      case 'Processing': return 2;
      case 'Shipped': return 3;
      case 'Out for Delivery': return 4;
      case 'Delivered': return 5;
      case 'Cancelled': return -1;
      default: return 1;
    }
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '40px auto', padding: '0 20px' }}>

      {/* Client Header Card */}
      <div className="glass-panel" style={{ borderRadius: '20px', padding: 'clamp(18px, 3vw, 32px)', marginBottom: '30px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 2.5vw, 20px)' }}>
          <div style={{
            width: 'clamp(52px, 12vw, 68px)',
            height: 'clamp(52px, 12vw, 68px)',
            borderRadius: '50%',
            background: 'var(--gold-gradient)',
            color: '#080a0f',
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.4rem, 3.5vw, 1.8rem)',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--gold-glow)',
            flexShrink: 0
          }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'V'}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.25rem, 3vw, 1.8rem)', color: '#ffffff', margin: 0 }}>
                {user?.name || 'Valued Client'}
              </h1>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
              {user?.email} • {user?.role === 'admin' ? 'Store Administrator' : 'Member Account'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={logout} className="btn-luxury-outline" style={{ padding: '8px 18px', fontSize: '0.82rem', color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.4)' }}>
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Grid (Nav Tabs + Body) */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }} className="profile-layout">

        {/* Left Nav Tabs */}
        <div>
          <div className="glass-panel" style={{ borderRadius: '16px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              onClick={() => switchTab('profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'profile' ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                color: activeTab === 'profile' ? '#f5df93' : '#94a3b8',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
            >
              <User size={16} color={activeTab === 'profile' ? '#d4af37' : '#94a3b8'} />
              <span>Profile & Address</span>
            </button>

            <button
              onClick={() => switchTab('orders')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'orders' ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                color: activeTab === 'orders' ? '#f5df93' : '#94a3b8',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
            >
              <Package size={16} color={activeTab === 'orders' ? '#d4af37' : '#94a3b8'} />
              <span>Orders & Parcel Tracking</span>
            </button>

            <button
              onClick={() => switchTab('returns')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'returns' ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                color: activeTab === 'returns' ? '#f5df93' : '#94a3b8',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <RotateCcw size={16} color={activeTab === 'returns' ? '#d4af37' : '#94a3b8'} />
                <span>Returns & Refunds</span>
              </div>
              {returnsList.length > 0 && (
                <span style={{ fontSize: '0.72rem', background: 'rgba(212, 175, 55, 0.25)', color: '#f5df93', padding: '1px 7px', borderRadius: '9999px', fontWeight: 700 }}>
                  {returnsList.length}
                </span>
              )}
            </button>

            <button
              onClick={() => switchTab('security')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'security' ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                color: activeTab === 'security' ? '#f5df93' : '#94a3b8',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
            >
              <Lock size={16} color={activeTab === 'security' ? '#d4af37' : '#94a3b8'} />
              <span>Security & Password</span>
            </button>
          </div>
        </div>

        {/* Right Active Tab View */}
        <div>

          {/* TAB 1: PROFILE & ADDRESS */}
          {activeTab === 'profile' && (
            <div className="glass-panel" style={{ borderRadius: '20px', padding: 'clamp(18px, 3vw, 32px)' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: '#ffffff', marginBottom: '6px' }}>
                Client Information & Address Book
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '20px' }}>
                Manage your default white-glove shipping location and personal details.
              </p>

              <form onSubmit={handleUpdateProfile}>
                <div className="responsive-grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="form-input-luxury"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="form-input-luxury"
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Delivery Street Address</label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Penthouse, Street, Landmark"
                      className="form-input-luxury"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Mumbai"
                      className="form-input-luxury"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Maharashtra"
                      className="form-input-luxury"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Postal Code / PIN</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="400050"
                      className="form-input-luxury"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="form-input-luxury"
                      readOnly
                    />
                  </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="btn-luxury-gold"
                    style={{ padding: '10px 24px', fontSize: '0.85rem' }}
                  >
                    {savingProfile ? 'Updating...' : 'Save Profile & Address'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: ORDER HISTORY & PARCEL TRACKING */}
          {activeTab === 'orders' && (
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#ffffff', margin: 0 }}>
                  My Fragrance Orders ({orders.length})
                </h2>
                <button
                  type="button"
                  onClick={() => fetchOrders(true)}
                  disabled={isRefreshingOrders || ordersLoading}
                  className="btn-luxury-outline"
                  style={{ padding: '6px 14px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  title="Sync live status from merchant fulfillment center"
                >
                  <RefreshCw size={13} className={isRefreshingOrders ? 'spin-animation' : ''} />
                  {isRefreshingOrders ? 'Syncing...' : 'Sync Live Status'}
                </button>
              </div>

              {ordersLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#d4af37' }}>
                  <div className="gold-shimmer" style={{ padding: '16px 32px', borderRadius: '12px', display: 'inline-block' }}>
                    Retrieving your orders & live parcel tracking...
                  </div>
                </div>
              ) : orders.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 20px', borderRadius: '16px' }}>
                  <Package size={40} color="#d4af37" style={{ margin: '0 auto 16px auto' }} />
                  <h3 style={{ color: '#ffffff', marginBottom: '8px' }}>No Orders Found</h3>
                  <p style={{ color: '#94a3b8', marginBottom: '20px' }}>You haven't placed any perfume orders yet.</p>
                  <Link to="/shop" className="btn-luxury-gold">Discover Our Collection</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {orders.map(ord => {
                    const activeStep = getStepperActiveIndex(ord.order_status);
                    const isCancelled = ord.order_status === 'Cancelled';

                    return (
                      <div key={ord.id} className="glass-panel" style={{ borderRadius: '18px', padding: '24px', position: 'relative' }}>

                        {/* Header bar of order */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '18px' }}>
                          <div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Order Number</div>
                            <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700, color: '#f5df93', letterSpacing: '0.04em' }}>
                              #{ord.order_number}
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Order Date</div>
                            <div style={{ fontSize: '0.85rem', color: '#f8fafc' }}>
                              {new Date(ord.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Total Amount</div>
                            <div style={{ fontSize: '0.88rem', color: '#f8fafc', fontWeight: 700 }}>
                              ₹{Number(ord.final_amount).toLocaleString('en-IN')} <span style={{ color: '#94a3b8', fontWeight: 500, fontSize: '0.78rem' }}>({ord.payment_method})</span>
                            </div>
                          </div>

                          {/* Status & Payment Badges */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                            {/* Order Status Badge */}
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              letterSpacing: '0.06em',
                              textTransform: 'uppercase',
                              padding: '5px 12px',
                              borderRadius: '9999px',
                              background:
                                ord.order_status === 'Delivered' ? 'rgba(16, 185, 129, 0.2)' :
                                ord.order_status === 'Shipped' ? 'rgba(59, 130, 246, 0.2)' :
                                ord.order_status === 'Out for Delivery' ? 'rgba(168, 85, 247, 0.2)' :
                                ord.order_status === 'Processing' ? 'rgba(234, 179, 8, 0.2)' :
                                ord.order_status === 'Confirmed' ? 'rgba(20, 184, 166, 0.2)' :
                                ord.order_status === 'Cancelled' ? 'rgba(244, 63, 94, 0.2)' :
                                'rgba(212, 175, 55, 0.2)',
                              color:
                                ord.order_status === 'Delivered' ? '#6ee7b7' :
                                ord.order_status === 'Shipped' ? '#93c5fd' :
                                ord.order_status === 'Out for Delivery' ? '#d8b4fe' :
                                ord.order_status === 'Processing' ? '#fde047' :
                                ord.order_status === 'Confirmed' ? '#5eead4' :
                                ord.order_status === 'Cancelled' ? '#fda4af' :
                                '#f5df93',
                              border: `1px solid ${
                                ord.order_status === 'Delivered' ? '#10b981' :
                                ord.order_status === 'Shipped' ? '#3b82f6' :
                                ord.order_status === 'Out for Delivery' ? '#a855f7' :
                                ord.order_status === 'Processing' ? '#eab308' :
                                ord.order_status === 'Confirmed' ? '#14b8a6' :
                                ord.order_status === 'Cancelled' ? '#f43f5e' :
                                '#d4af37'
                              }`,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}>
                              <span style={{ fontSize: '0.8rem' }}>●</span>
                              {ord.order_status === 'Pending' ? 'Pending Confirmation' :
                               ord.order_status === 'Confirmed' ? 'Order Confirmed' :
                               ord.order_status === 'Processing' ? 'Processing / Packing' :
                               ord.order_status === 'Shipped' ? 'Dispatched / In Transit' :
                               ord.order_status === 'Out for Delivery' ? 'Out For Delivery' :
                               ord.order_status === 'Delivered' ? 'Delivered' :
                               ord.order_status === 'Cancelled' ? 'Order Cancelled' :
                               ord.order_status}
                            </span>

                            {/* Payment Status Badge */}
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              padding: '4px 10px',
                              borderRadius: '9999px',
                              background:
                                ord.payment_method === 'COD' ? 'rgba(16, 185, 129, 0.12)' :
                                ord.payment_status === 'Paid' ? 'rgba(16, 185, 129, 0.12)' :
                                ord.payment_status === 'Failed' ? 'rgba(244, 63, 94, 0.12)' :
                                'rgba(245, 158, 11, 0.12)',
                              color:
                                ord.payment_method === 'COD' ? '#6ee7b7' :
                                ord.payment_status === 'Paid' ? '#6ee7b7' :
                                ord.payment_status === 'Failed' ? '#fda4af' :
                                '#fde68a',
                              border: '1px solid currentColor'
                            }}>
                              {ord.payment_method === 'COD' ? 'Cash On Delivery' :
                               ord.payment_status === 'Paid' ? 'Payment Verified' :
                               ord.payment_status === 'Failed' ? 'Payment Failed' :
                               'Payment Under Review'}
                            </span>
                          </div>
                        </div>

                        {/* Visual 5-Stage Order Progress Tracker (Stepper) */}
                        {!isCancelled ? (
                          <div style={{
                            background: 'rgba(10, 14, 23, 0.7)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '14px',
                            padding: '20px 16px',
                            marginBottom: '18px'
                          }}>
                            <div style={{ fontSize: '0.74rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Navigation size={14} /> Real-Time Order & Delivery Timeline
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', position: 'relative', gap: '8px' }}>
                              {/* Connector Bar Background */}
                              <div style={{
                                position: 'absolute',
                                top: '16px',
                                left: '10%',
                                right: '10%',
                                height: '3px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                zIndex: 1
                              }} />
                              
                              {/* Active Connector Progress Bar */}
                              <div style={{
                                position: 'absolute',
                                top: '16px',
                                left: '10%',
                                width: `${Math.max(0, Math.min(100, ((activeStep - 1) / 4) * 80))}%`,
                                height: '3px',
                                background: 'linear-gradient(90deg, #d4af37, #10b981)',
                                zIndex: 2,
                                transition: 'width 0.4s ease'
                              }} />

                              {/* Stage 1: Order Placed */}
                              <div style={{ textAlign: 'center', position: 'relative', zIndex: 3 }}>
                                <div style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  margin: '0 auto 8px auto',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: activeStep >= 1 ? '#d4af37' : '#1e293b',
                                  color: activeStep >= 1 ? '#080a0f' : '#94a3b8',
                                  boxShadow: activeStep === 1 ? '0 0 12px rgba(212, 175, 55, 0.6)' : 'none',
                                  fontWeight: 800,
                                  fontSize: '0.8rem'
                                }}>
                                  {activeStep > 1 ? <Check size={16} /> : '1'}
                                </div>
                                <div style={{ fontSize: '0.76rem', fontWeight: activeStep >= 1 ? 700 : 500, color: activeStep >= 1 ? '#f8fafc' : '#64748b' }}>
                                  Order Placed
                                </div>
                                <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                                  {new Date(ord.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                </div>
                              </div>

                              {/* Stage 2: Confirmed / Processing */}
                              <div style={{ textAlign: 'center', position: 'relative', zIndex: 3 }}>
                                <div style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  margin: '0 auto 8px auto',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: activeStep >= 2 ? '#d4af37' : '#1e293b',
                                  color: activeStep >= 2 ? '#080a0f' : '#94a3b8',
                                  boxShadow: activeStep === 2 ? '0 0 12px rgba(212, 175, 55, 0.6)' : 'none',
                                  fontWeight: 800,
                                  fontSize: '0.8rem'
                                }}>
                                  {activeStep > 2 ? <Check size={16} /> : '2'}
                                </div>
                                <div style={{ fontSize: '0.76rem', fontWeight: activeStep >= 2 ? 700 : 500, color: activeStep >= 2 ? '#f8fafc' : '#64748b' }}>
                                  Confirmed
                                </div>
                                <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                                  {activeStep >= 2 ? 'Packed' : 'Verification'}
                                </div>
                              </div>

                              {/* Stage 3: Shipped / In Transit */}
                              <div style={{ textAlign: 'center', position: 'relative', zIndex: 3 }}>
                                <div style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  margin: '0 auto 8px auto',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: activeStep >= 3 ? '#3b82f6' : '#1e293b',
                                  color: activeStep >= 3 ? '#ffffff' : '#94a3b8',
                                  boxShadow: activeStep === 3 ? '0 0 14px rgba(59, 130, 246, 0.6)' : 'none',
                                  fontWeight: 800,
                                  fontSize: '0.8rem'
                                }}>
                                  {activeStep > 3 ? <Check size={16} /> : <Truck size={15} />}
                                </div>
                                <div style={{ fontSize: '0.76rem', fontWeight: activeStep >= 3 ? 700 : 500, color: activeStep >= 3 ? '#93c5fd' : '#64748b' }}>
                                  Dispatched
                                </div>
                                <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                                  {ord.courier_name || 'In Transit'}
                                </div>
                              </div>

                              {/* Stage 4: Out for Delivery */}
                              <div style={{ textAlign: 'center', position: 'relative', zIndex: 3 }}>
                                <div style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  margin: '0 auto 8px auto',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: activeStep >= 4 ? '#a855f7' : '#1e293b',
                                  color: activeStep >= 4 ? '#ffffff' : '#94a3b8',
                                  boxShadow: activeStep === 4 ? '0 0 14px rgba(168, 85, 247, 0.6)' : 'none',
                                  fontWeight: 800,
                                  fontSize: '0.8rem'
                                }}>
                                  {activeStep > 4 ? <Check size={16} /> : <Compass size={15} />}
                                </div>
                                <div style={{ fontSize: '0.76rem', fontWeight: activeStep >= 4 ? 700 : 500, color: activeStep >= 4 ? '#d8b4fe' : '#64748b' }}>
                                  Out For Delivery
                                </div>
                                <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                                  {activeStep >= 4 ? 'Arriving Today' : 'Near Destination'}
                                </div>
                              </div>

                              {/* Stage 5: Delivered */}
                              <div style={{ textAlign: 'center', position: 'relative', zIndex: 3 }}>
                                <div style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  margin: '0 auto 8px auto',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: activeStep >= 5 ? '#10b981' : '#1e293b',
                                  color: activeStep >= 5 ? '#ffffff' : '#94a3b8',
                                  boxShadow: activeStep === 5 ? '0 0 16px rgba(16, 185, 129, 0.7)' : 'none',
                                  fontWeight: 800,
                                  fontSize: '0.8rem'
                                }}>
                                  <CheckCircle2 size={16} />
                                </div>
                                <div style={{ fontSize: '0.76rem', fontWeight: activeStep >= 5 ? 700 : 500, color: activeStep >= 5 ? '#6ee7b7' : '#64748b' }}>
                                  Delivered
                                </div>
                                <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                                  {activeStep >= 5 ? 'Handed Over' : 'Destination'}
                                </div>
                              </div>

                            </div>
                          </div>
                        ) : (
                          <div style={{
                            background: 'rgba(244, 63, 94, 0.1)',
                            border: '1px solid rgba(244, 63, 94, 0.35)',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            marginBottom: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}>
                            <XCircle size={20} color="#f43f5e" style={{ flexShrink: 0 }} />
                            <div style={{ fontSize: '0.82rem', color: '#fda4af' }}>
                              <strong>Order Cancelled:</strong> This order has been cancelled and stock returned. If payment was deducted, refunds are initiated back to source account.
                            </div>
                          </div>
                        )}

                        {/* Live Courier & Tracking Details Card */}
                        {(ord.tracking_number || ord.courier_name || ord.status_notes || ord.estimated_delivery) && (
                          <div style={{
                            background: 'rgba(212, 175, 55, 0.06)',
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                            borderRadius: '14px',
                            padding: '16px',
                            marginBottom: '18px'
                          }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Truck size={17} color="#d4af37" />
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f5df93' }}>
                                  {ord.courier_name ? `${ord.courier_name} Shipment` : 'Courier Partner Tracking'}
                                </span>
                              </div>

                              {ord.estimated_delivery && (
                                <div style={{ fontSize: '0.78rem', color: '#6ee7b7', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '3px 10px', borderRadius: '6px', fontWeight: 600 }}>
                                  Estimated Delivery: {ord.estimated_delivery}
                                </div>
                              )}
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', fontSize: '0.82rem', color: '#cbd5e1' }}>
                              {ord.tracking_number && (
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(15, 19, 28, 0.8)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                  <span style={{ color: '#94a3b8', fontSize: '0.74rem', textTransform: 'uppercase' }}>AWB / Tracking:</span>
                                  <strong style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#ffffff' }}>{ord.tracking_number}</strong>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyAwb(ord.tracking_number)}
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: copiedAwb === ord.tracking_number ? '#10b981' : '#d4af37',
                                      cursor: 'pointer',
                                      padding: '2px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px',
                                      fontSize: '0.72rem'
                                    }}
                                    title="Copy AWB Tracking Number"
                                  >
                                    {copiedAwb === ord.tracking_number ? <Check size={13} /> : <Copy size={13} />}
                                    {copiedAwb === ord.tracking_number ? 'Copied' : 'Copy'}
                                  </button>
                                </div>
                              )}

                              {ord.tracking_url && (
                                <a
                                  href={ord.tracking_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn-luxury-gold"
                                  style={{
                                    padding: '6px 14px',
                                    fontSize: '0.78rem',
                                    borderRadius: '8px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    textDecoration: 'none'
                                  }}
                                >
                                  <ExternalLink size={13} /> Track On Courier Portal
                                </a>
                              )}
                            </div>

                            {ord.status_notes && (
                              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.8rem', color: '#cbd5e1', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ color: '#d4af37', fontWeight: 600 }}>Dispatch Remark:</span> "{ord.status_notes}"
                              </div>
                            )}
                          </div>
                        )}

                        {/* Payment Verification & Delivery Timing Banner (for orders without tracking yet) */}
                        {!ord.tracking_number && !ord.courier_name && !isCancelled && (
                          <>
                            {ord.payment_method === 'COD' ? (
                              <div style={{
                                background: 'rgba(16, 185, 129, 0.12)',
                                border: '1px solid rgba(16, 185, 129, 0.35)',
                                borderRadius: '12px',
                                padding: '10px 14px',
                                marginBottom: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                              }}>
                                <Truck size={18} color="#10b981" style={{ flexShrink: 0 }} />
                                <div style={{ fontSize: '0.82rem', color: '#6ee7b7' }}>
                                  <strong>Order Confirmed (Cash on Delivery):</strong> Estimated Delivery in <strong>3–5 Business Days</strong>. Please pay ₹{Number(ord.final_amount).toLocaleString('en-IN')} to courier partner upon delivery.
                                </div>
                              </div>
                            ) : (
                              <>
                                {ord.payment_status === 'Paid' && (
                                  <div style={{
                                    background: 'rgba(16, 185, 129, 0.12)',
                                    border: '1px solid rgba(16, 185, 129, 0.35)',
                                    borderRadius: '12px',
                                    padding: '10px 14px',
                                    marginBottom: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                  }}>
                                    <Truck size={18} color="#10b981" style={{ flexShrink: 0 }} />
                                    <div style={{ fontSize: '0.82rem', color: '#6ee7b7' }}>
                                      <strong>Payment Verified & Done:</strong> Estimated Delivery in <strong>3–5 Business Days</strong> via Premium Fragrance Courier.
                                    </div>
                                  </div>
                                )}

                                {ord.payment_status === 'Pending' && (
                                  <div style={{
                                    background: 'rgba(245, 158, 11, 0.1)',
                                    border: '1px solid rgba(245, 158, 11, 0.3)',
                                    borderRadius: '12px',
                                    padding: '10px 14px',
                                    marginBottom: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                  }}>
                                    <Clock size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
                                    <div style={{ fontSize: '0.82rem', color: '#fde68a' }}>
                                      <strong>Payment Under Checking:</strong> Order is in <strong>PENDING</strong> mode. Please wait for merchant confirmation. Delivery timings will appear once approved.
                                    </div>
                                  </div>
                                )}

                                {ord.payment_status === 'Failed' && (
                                  <div style={{
                                    background: 'rgba(244, 63, 94, 0.12)',
                                    border: '1px solid rgba(244, 63, 94, 0.35)',
                                    borderRadius: '12px',
                                    padding: '12px 14px',
                                    marginBottom: '16px',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: '10px'
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <XCircle size={18} color="#f43f5e" style={{ flexShrink: 0 }} />
                                      <div style={{ fontSize: '0.82rem', color: '#fda4af' }}>
                                        <strong>Payment is not done:</strong> UTR / Payment could not be verified in merchant bank. Please do retry payment.
                                      </div>
                                    </div>
                                    <Link to="/shop" className="btn-luxury-gold" style={{ padding: '6px 14px', fontSize: '0.76rem' }}>
                                      Retry Payment / Re-order →
                                    </Link>
                                  </div>
                                )}
                              </>
                            )}
                          </>
                        )}

                        {/* Items Breakdown */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                          {ord.items?.map(it => {
                            const existingReturn = returnsList.find(
                              r => Number(r.order_id) === Number(ord.id) && (Number(r.product_id) === Number(it.product_id) || r.product_name === it.product_name)
                            );

                            return (
                              <div 
                                key={it.id} 
                                style={{ 
                                  display: 'flex', 
                                  flexWrap: 'wrap', 
                                  alignItems: 'center', 
                                  justifyContent: 'space-between', 
                                  gap: '12px', 
                                  background: 'rgba(255, 255, 255, 0.02)', 
                                  padding: '10px 14px', 
                                  borderRadius: '12px',
                                  border: '1px solid rgba(255, 255, 255, 0.05)'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px', flex: '1 1 auto' }}>
                                  <img 
                                    src={it.product_image} 
                                    alt={it.product_name} 
                                    style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(255, 255, 255, 0.1)' }} 
                                  />
                                  <div>
                                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc' }}>{it.product_name}</div>
                                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '2px' }}>
                                      Qty: {it.quantity} • ₹{Number(it.price).toLocaleString('en-IN')} each
                                    </div>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginLeft: 'auto', flexWrap: 'wrap' }}>
                                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#d4af37' }}>
                                    ₹{Number(it.subtotal).toLocaleString('en-IN')}
                                  </div>

                                  {/* Return Action / Status Badge */}
                                  {existingReturn ? (
                                    <button
                                      type="button"
                                      onClick={() => switchTab('returns')}
                                      style={{
                                        background: 
                                          existingReturn.status === 'Completed' || existingReturn.status === 'Refunded' ? 'rgba(16, 185, 129, 0.15)' :
                                          existingReturn.status === 'Approved' ? 'rgba(59, 130, 246, 0.15)' :
                                          existingReturn.status === 'Rejected' ? 'rgba(244, 63, 94, 0.15)' :
                                          'rgba(212, 175, 55, 0.15)',
                                        border: `1px solid ${
                                          existingReturn.status === 'Completed' || existingReturn.status === 'Refunded' ? '#10b981' :
                                          existingReturn.status === 'Approved' ? '#3b82f6' :
                                          existingReturn.status === 'Rejected' ? '#f43f5e' :
                                          '#d4af37'
                                        }`,
                                        color: 
                                          existingReturn.status === 'Completed' || existingReturn.status === 'Refunded' ? '#6ee7b7' :
                                          existingReturn.status === 'Approved' ? '#93c5fd' :
                                          existingReturn.status === 'Rejected' ? '#fda4af' :
                                          '#f5df93',
                                        borderRadius: '8px',
                                        padding: '4px 10px',
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px'
                                      }}
                                      title="View return status and tracking in Returns tab"
                                    >
                                      <RotateCcw size={12} />
                                      <span>Return #{existingReturn.return_number}: {existingReturn.status} →</span>
                                    </button>
                                  ) : (
                                    ord.order_status !== 'Cancelled' && (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenReturnModal(ord, it)}
                                        className="btn-luxury-outline"
                                        style={{
                                          padding: '5px 12px',
                                          fontSize: '0.74rem',
                                          borderRadius: '8px',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '5px',
                                          color: '#f5df93',
                                          borderColor: 'rgba(212, 175, 55, 0.35)'
                                        }}
                                        title="Apply for product return, replacement, or refund"
                                      >
                                        <RotateCcw size={13} />
                                        <span>Request Return</span>
                                      </button>
                                    )
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Footer Actions */}
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: '#94a3b8' }}>
                          <div>
                            Delivery Address: <strong style={{ color: '#cbd5e1' }}>{ord.shipping_name}</strong>, {ord.shipping_street}, {ord.shipping_city}, {ord.shipping_state} - {ord.shipping_postal_code}
                          </div>

                          {ord.order_status === 'Pending' && (
                            <button
                              onClick={() => handleCancelOrder(ord.id)}
                              style={{ background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RETURNS & REFUNDS TRACKING */}
          {activeTab === 'returns' && (
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#ffffff', margin: 0 }}>
                    My Return & Refund Applications ({returnsList.length})
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                    Track live concierge approval, pickup dispatch, and refund settlements.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => fetchReturns(true)}
                  disabled={returnsLoading}
                  className="btn-luxury-outline"
                  style={{ padding: '6px 14px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <RefreshCw size={13} className={returnsLoading ? 'spin-animation' : ''} />
                  {returnsLoading ? 'Updating...' : 'Refresh Returns'}
                </button>
              </div>

              {returnsLoading && returnsList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#d4af37' }}>
                  <div className="gold-shimmer" style={{ padding: '16px 32px', borderRadius: '12px', display: 'inline-block' }}>
                    Retrieving your return requests...
                  </div>
                </div>
              ) : returnsList.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 20px', borderRadius: '16px' }}>
                  <RotateCcw size={40} color="#d4af37" style={{ margin: '0 auto 16px auto' }} />
                  <h3 style={{ color: '#ffffff', marginBottom: '8px' }}>No Active Return Requests</h3>
                  <p style={{ color: '#94a3b8', marginBottom: '20px', maxWidth: '420px', margin: '0 auto 20px auto' }}>
                    You have not submitted any return applications. To request a return, go to <strong>Orders & Parcel Tracking</strong> and click <strong>Request Return</strong> on any eligible item.
                  </p>
                  <button onClick={() => switchTab('orders')} className="btn-luxury-gold">
                    View My Orders
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {returnsList.map(ret => {
                    const status = ret.status || 'Requested';
                    let stageIndex = 1;
                    if (status === 'Approved') stageIndex = 2;
                    else if (ret.pickup_tracking_number || status === 'In Transit') stageIndex = 3;
                    else if (status === 'Completed' || status === 'Refunded') stageIndex = 4;
                    else if (status === 'Rejected') stageIndex = -1;

                    return (
                      <div 
                        key={ret.id} 
                        className="glass-panel" 
                        style={{ 
                          borderRadius: '18px', 
                          padding: '24px', 
                          border: status === 'Rejected' ? '1px solid rgba(244, 63, 94, 0.35)' : '1px solid rgba(212, 175, 55, 0.3)' 
                        }}
                      >
                        {/* Return Header */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '18px' }}>
                          <div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Return Reference</div>
                            <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700, color: '#f5df93', letterSpacing: '0.04em' }}>
                              #{ret.return_number}
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Order Number</div>
                            <div style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: 600 }}>
                              #{ret.order_number}
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Applied On</div>
                            <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                              {new Date(ret.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Refund Amount</div>
                            <div style={{ fontSize: '1rem', color: '#10b981', fontWeight: 800 }}>
                              ₹{Number(ret.refund_amount || 0).toLocaleString('en-IN')}
                            </div>
                          </div>

                          {/* Status Pill */}
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            padding: '5px 14px',
                            borderRadius: '9999px',
                            background:
                              status === 'Completed' || status === 'Refunded' ? 'rgba(16, 185, 129, 0.2)' :
                              status === 'Approved' ? 'rgba(59, 130, 246, 0.2)' :
                              status === 'Rejected' ? 'rgba(244, 63, 94, 0.2)' :
                              'rgba(212, 175, 55, 0.2)',
                            color:
                              status === 'Completed' || status === 'Refunded' ? '#6ee7b7' :
                              status === 'Approved' ? '#93c5fd' :
                              status === 'Rejected' ? '#fda4af' :
                              '#f5df93',
                            border: `1px solid ${
                              status === 'Completed' || status === 'Refunded' ? '#10b981' :
                              status === 'Approved' ? '#3b82f6' :
                              status === 'Rejected' ? '#f43f5e' :
                              '#d4af37'
                            }`
                          }}>
                            ● {status === 'Requested' ? 'Pending Concierge Review' :
                               status === 'Approved' ? 'Approved - Pickup Scheduled' :
                               status === 'Completed' || status === 'Refunded' ? 'Refund Processed & Completed' :
                               status === 'Rejected' ? 'Return Rejected' :
                               status}
                          </span>
                        </div>

                        {/* 4-Stage Return Stepper (unless rejected) */}
                        {status !== 'Rejected' ? (
                          <div style={{
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '14px',
                            padding: '18px 14px',
                            marginBottom: '18px'
                          }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', position: 'relative', gap: '8px' }}>
                              
                              {/* Connector Bar */}
                              <div style={{
                                position: 'absolute',
                                top: '16px',
                                left: '12%',
                                right: '12%',
                                height: '2px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                zIndex: 1
                              }}>
                                <div style={{
                                  height: '100%',
                                  background: 'linear-gradient(90deg, #d4af37, #10b981)',
                                  width: 
                                    stageIndex === 1 ? '0%' :
                                    stageIndex === 2 ? '33%' :
                                    stageIndex === 3 ? '66%' :
                                    '100%',
                                  transition: 'width 0.4s ease'
                                }} />
                              </div>

                              {/* Step 1: Requested */}
                              <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
                                <div style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  margin: '0 auto 8px auto',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: stageIndex >= 1 ? '#d4af37' : '#1e293b',
                                  color: '#080a0f',
                                  fontWeight: 800,
                                  fontSize: '0.8rem'
                                }}>
                                  {stageIndex > 1 ? <Check size={16} /> : '1'}
                                </div>
                                <div style={{ fontSize: '0.76rem', fontWeight: stageIndex >= 1 ? 700 : 500, color: stageIndex >= 1 ? '#f8fafc' : '#64748b' }}>
                                  Request Submitted
                                </div>
                              </div>

                              {/* Step 2: Approved */}
                              <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
                                <div style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  margin: '0 auto 8px auto',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: stageIndex >= 2 ? '#3b82f6' : '#1e293b',
                                  color: stageIndex >= 2 ? '#ffffff' : '#94a3b8',
                                  fontWeight: 800,
                                  fontSize: '0.8rem'
                                }}>
                                  {stageIndex > 2 ? <Check size={16} /> : '2'}
                                </div>
                                <div style={{ fontSize: '0.76rem', fontWeight: stageIndex >= 2 ? 700 : 500, color: stageIndex >= 2 ? '#93c5fd' : '#64748b' }}>
                                  Concierge Approved
                                </div>
                              </div>

                              {/* Step 3: Pickup In Transit */}
                              <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
                                <div style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  margin: '0 auto 8px auto',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: stageIndex >= 3 ? '#a855f7' : '#1e293b',
                                  color: stageIndex >= 3 ? '#ffffff' : '#94a3b8',
                                  fontWeight: 800,
                                  fontSize: '0.8rem'
                                }}>
                                  {stageIndex > 3 ? <Check size={16} /> : <Truck size={14} />}
                                </div>
                                <div style={{ fontSize: '0.76rem', fontWeight: stageIndex >= 3 ? 700 : 500, color: stageIndex >= 3 ? '#d8b4fe' : '#64748b' }}>
                                  Doorstep Pickup
                                </div>
                              </div>

                              {/* Step 4: Refund Completed */}
                              <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
                                <div style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  margin: '0 auto 8px auto',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: stageIndex >= 4 ? '#10b981' : '#1e293b',
                                  color: '#080a0f',
                                  fontWeight: 800,
                                  fontSize: '0.8rem'
                                }}>
                                  <CheckCircle2 size={16} />
                                </div>
                                <div style={{ fontSize: '0.76rem', fontWeight: stageIndex >= 4 ? 700 : 500, color: stageIndex >= 4 ? '#6ee7b7' : '#64748b' }}>
                                  Refund Completed
                                </div>
                              </div>

                            </div>
                          </div>
                        ) : (
                          <div style={{
                            background: 'rgba(244, 63, 94, 0.1)',
                            border: '1px solid rgba(244, 63, 94, 0.35)',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            marginBottom: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}>
                            <XCircle size={20} color="#f43f5e" style={{ flexShrink: 0 }} />
                            <div style={{ fontSize: '0.82rem', color: '#fda4af' }}>
                              <strong>Return Rejected:</strong> This request could not be approved based on return policy criteria (e.g. broken seal or expired return window).
                            </div>
                          </div>
                        )}

                        {/* Product & Return Details Card */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', background: 'rgba(255, 255, 255, 0.02)', padding: '14px', borderRadius: '12px', marginBottom: '14px' }}>
                          {ret.product_image && (
                            <img 
                              src={ret.product_image} 
                              alt={ret.product_name} 
                              style={{ width: '64px', height: '64px', borderRadius: '10px', objectFit: 'cover', border: '1px solid rgba(212, 175, 55, 0.3)' }} 
                            />
                          )}
                          <div style={{ flex: 1, minWidth: '220px' }}>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                              {ret.product_name}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '3px' }}>
                              Quantity: <strong style={{ color: '#cbd5e1' }}>{ret.quantity}</strong> {ret.selected_size ? `• Size: ${ret.selected_size}` : ''}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#f5df93', marginTop: '6px' }}>
                              <strong>Reason:</strong> "{ret.reason}"
                            </div>
                          </div>

                          {ret.image_proof && (
                            <div>
                              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>Attached Proof:</div>
                              <a href={ret.image_proof} target="_blank" rel="noopener noreferrer">
                                <img src={ret.image_proof} alt="Proof" style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }} />
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Admin Notes & Pickup Courier Info */}
                        {(ret.admin_notes || ret.pickup_tracking_number) && (
                          <div style={{ background: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '12px', padding: '14px', marginBottom: '10px' }}>
                            {ret.pickup_tracking_number && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: ret.admin_notes ? '8px' : '0' }}>
                                <Truck size={16} color="#d4af37" />
                                <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                                  Pickup Partner: <strong style={{ color: '#f5df93' }}>{ret.pickup_courier || 'Express Courier'}</strong> • AWB: <strong style={{ fontFamily: 'monospace', color: '#ffffff' }}>{ret.pickup_tracking_number}</strong>
                                </span>
                              </div>
                            )}
                            {ret.admin_notes && (
                              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', fontStyle: 'italic' }}>
                                <span style={{ color: '#f5df93', fontWeight: 600 }}>Merchant Concierge Note:</span> "{ret.admin_notes}"
                              </div>
                            )}
                          </div>
                        )}

                        {ret.customer_notes && (
                          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                            <strong>Your Comments:</strong> {ret.customer_notes}
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SECURITY & PASSWORD */}
          {activeTab === 'security' && (
            <div className="glass-panel" style={{ borderRadius: '20px', padding: '32px', maxWidth: '560px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#ffffff', marginBottom: '8px' }}>
                Update Security Passcode
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '24px' }}>
                Enhance the protection of your TRY ME BRO member account.
              </p>

              <form onSubmit={handleChangePassword}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Current Password *</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="form-input-luxury"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>New Password *</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="form-input-luxury"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Confirm New Password *</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="form-input-luxury"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="btn-luxury-gold"
                    style={{ marginTop: '10px', padding: '12px' }}
                  >
                    {savingPassword ? 'Securing...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

      </div>

      {/* LUXURY RETURN APPLICATION MODAL */}
      {returnModalOpen && selectedReturnItem && selectedReturnOrder && (
        <div style={{
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
            className="glass-panel" 
            style={{
              maxWidth: '560px',
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
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RotateCcw size={18} color="#d4af37" />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#ffffff', margin: 0 }}>
                    Apply for Return / Replacement
                  </h3>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                    Order #{selectedReturnOrder.order_number}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setReturnModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Selected Product Summary Card */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(212, 175, 55, 0.2)', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px' }}>
              <img 
                src={selectedReturnItem.product_image} 
                alt={selectedReturnItem.product_name} 
                style={{ width: '54px', height: '54px', borderRadius: '10px', objectFit: 'cover', border: '1px solid rgba(255, 255, 255, 0.1)' }} 
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>
                  {selectedReturnItem.product_name}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                  Unit Price: ₹{Number(selectedReturnItem.price).toLocaleString('en-IN')}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Refund Total</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#10b981' }}>
                  ₹{(Number(selectedReturnItem.price) * returnQuantity).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Return Form */}
            <form onSubmit={handleSubmitReturnRequest}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Return Reason Select */}
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#f5df93', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Reason for Return *
                  </label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    required
                    className="form-input-luxury"
                    style={{ background: '#0a0d14', color: '#f8fafc', fontSize: '0.86rem' }}
                  >
                    <option value="Damaged or leaking bottle during courier transit">Damaged or leaking bottle during courier transit</option>
                    <option value="Defective spray atomizer / cap nozzle">Defective spray atomizer / cap nozzle</option>
                    <option value="Incorrect fragrance variant or size received">Incorrect fragrance variant or size received</option>
                    <option value="Fragrance quality / longevity concern">Fragrance quality / longevity concern</option>
                    <option value="Changed mind / Gift mismatch (Seal unopened)">Changed mind / Gift mismatch (Seal unopened)</option>
                    <option value="Other reason">Other reason</option>
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#f5df93', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Quantity to Return
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="number"
                      min="1"
                      max={selectedReturnItem.quantity || 1}
                      value={returnQuantity}
                      onChange={(e) => setReturnQuantity(Math.min(selectedReturnItem.quantity || 1, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                      className="form-input-luxury"
                      style={{ width: '80px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 700 }}
                    />
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      (Max available: {selectedReturnItem.quantity || 1} units)
                    </span>
                  </div>
                </div>

                {/* Customer Notes */}
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#f5df93', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Additional Remarks / Batch Issue Description
                  </label>
                  <textarea
                    rows={3}
                    value={returnCustomerNotes}
                    onChange={(e) => setReturnCustomerNotes(e.target.value)}
                    placeholder="Provide any details regarding the issue to expedite concierge review..."
                    className="form-input-luxury"
                    style={{ fontSize: '0.84rem' }}
                  />
                </div>

                {/* Device Photo Proof Uploader */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#f5df93', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Item Proof / Damage Photo (Optional)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowProofUrlInput(!showProofUrlInput)}
                      style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      {showProofUrlInput ? '📁 Switch to Upload from Device' : '🔗 Paste image URL instead'}
                    </button>
                  </div>

                  {showProofUrlInput ? (
                    <input
                      type="text"
                      value={returnImageProof}
                      onChange={(e) => setReturnImageProof(e.target.value)}
                      placeholder="https://images... or paste image web link"
                      className="form-input-luxury"
                      style={{ fontSize: '0.84rem' }}
                    />
                  ) : (
                    <div>
                      {returnImageProof ? (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(212, 175, 55, 0.3)',
                          borderRadius: '12px',
                          padding: '10px 14px'
                        }}>
                          <img
                            src={returnImageProof}
                            alt="Return proof preview"
                            style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(212, 175, 55, 0.4)' }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <CheckCircle2 size={15} color="#10b981" /> Photo Attached
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {returnImageProof.startsWith('data:') ? 'Photo loaded from device storage' : returnImageProof}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setReturnImageProof('')}
                            style={{
                              background: 'rgba(244, 63, 94, 0.15)',
                              border: '1px solid #f43f5e',
                              color: '#fda4af',
                              borderRadius: '8px',
                              padding: '6px 10px',
                              fontSize: '0.74rem',
                              cursor: 'pointer',
                              fontWeight: 600
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <label
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            border: '1.5px dashed rgba(212, 175, 55, 0.4)',
                            borderRadius: '12px',
                            padding: '18px',
                            background: 'rgba(15, 20, 30, 0.5)',
                            cursor: uploadingProof ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                            textAlign: 'center'
                          }}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProofFileUpload}
                            disabled={uploadingProof}
                            style={{ display: 'none' }}
                          />
                          {uploadingProof ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f5df93', fontSize: '0.82rem' }}>
                              <RefreshCw size={18} className="animate-spin" /> Uploading photo from device...
                            </div>
                          ) : (
                            <>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'rgba(212, 175, 55, 0.12)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#d4af37'
                              }}>
                                <Camera size={20} />
                              </div>
                              <div>
                                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f8fafc' }}>
                                  Tap to Choose Photo from Device or Camera
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                                  Supports JPG, PNG, WEBP (Max 10MB)
                                </div>
                              </div>
                            </>
                          )}
                        </label>
                      )}
                    </div>
                  )}
                </div>

                {/* Luxury Policy Notice */}
                <div style={{
                  background: 'rgba(212, 175, 55, 0.08)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  borderRadius: '12px',
                  padding: '12px',
                  fontSize: '0.74rem',
                  color: '#cbd5e1',
                  lineHeight: 1.45
                }}>
                  🛡️ <strong>TRY ME BRO Return Guarantee:</strong> Once approved, our luxury courier partner will arrive for doorstep pickup. Refunds are credited to original payment source upon warehouse inspection.
                </div>

                {/* Submit Actions */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setReturnModalOpen(false)}
                    className="btn-luxury-outline"
                    style={{ flex: 1, padding: '12px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReturn}
                    className="btn-luxury-gold"
                    style={{ flex: 2, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <RotateCcw size={16} />
                    {submittingReturn ? 'Submitting Application...' : 'Confirm Return Request'}
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

export default Profile;

