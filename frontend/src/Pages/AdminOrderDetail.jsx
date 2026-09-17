import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  Truck,
  DollarSign,
  Save,
  Check,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  CreditCard,
  FileText
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

const AdminOrderDetail = () => {
  const params = useParams();
  const orderId = params.id || params.orderNumber || '';
  const id = orderId;
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form editable states
  const [orderFulfillmentStatus, setOrderFulfillmentStatus] = useState('Pending');
  const [orderCourierName, setOrderCourierName] = useState('Delhivery');
  const [orderTrackingNumber, setOrderTrackingNumber] = useState('');
  const [orderEstimatedDelivery, setOrderEstimatedDelivery] = useState('');
  const [orderTrackingUrl, setOrderTrackingUrl] = useState('');
  const [orderStatusNotes, setOrderStatusNotes] = useState('');

  const fetchOrder = async () => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/orders/${orderId}`);
      if (res.data?.success && res.data?.order) {
        const ord = res.data.order;
        setOrder(ord);
        setOrderFulfillmentStatus(ord.order_status || 'Pending');
        setOrderCourierName(ord.courier_name || 'Delhivery');
        setOrderTrackingNumber(ord.tracking_number || '');
        setOrderEstimatedDelivery(ord.estimated_delivery || '');
        setOrderTrackingUrl(ord.tracking_url || '');
        setOrderStatusNotes(ord.status_notes || '');
      } else {
        toast.error('Order not found');
        navigate('/admin?tab=overview');
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      toast.error(err.response?.data?.message || 'Failed to load order file');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handleSaveTrackingAndStatus = async () => {
    try {
      setIsSubmitting(true);
      const res = await api.put(`/orders/${order.id}/status`, {
        order_status: orderFulfillmentStatus,
        tracking_number: orderTrackingNumber,
        courier_name: orderCourierName,
        tracking_url: orderTrackingUrl,
        status_notes: orderStatusNotes,
        estimated_delivery: orderEstimatedDelivery
      });
      if (res.data?.success) {
        toast.success(`✨ Order #${order.order_number || order.id} updated & synced to customer account!`);
        if (res.data.order) {
          setOrder(res.data.order);
        } else {
          fetchOrder();
        }
      }
    } catch (err) {
      console.error('Save order tracking error:', err);
      toast.error(err.response?.data?.message || 'Failed to update order tracking details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePaymentStatus = async (newPaymentStatus) => {
    try {
      setIsSubmitting(true);
      const res = await api.put(`/orders/${order.id}/status`, {
        payment_status: newPaymentStatus,
        order_status: newPaymentStatus === 'Paid' ? 'Processing' : (newPaymentStatus === 'Failed' ? 'Cancelled' : 'Pending')
      });
      if (res.data?.success) {
        if (newPaymentStatus === 'Paid') {
          toast.success(`✨ Order #${order.order_number || order.id} payment APPROVED!`);
        } else if (newPaymentStatus === 'Failed') {
          toast.info(`Order #${order.order_number || order.id} payment REJECTED.`);
        } else {
          toast.success(`Payment status set to ${newPaymentStatus}`);
        }
        if (res.data.order) {
          setOrder(res.data.order);
          setOrderFulfillmentStatus(res.data.order.order_status);
        } else {
          fetchOrder();
        }
      }
    } catch (err) {
      console.error('Payment status error:', err);
      toast.error(err.response?.data?.message || 'Failed to update payment status');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37' }}>
        <div className="gold-shimmer" style={{ padding: '24px 48px', borderRadius: '16px', textAlign: 'center' }}>
          <RefreshCw size={24} className="spin" style={{ display: 'block', margin: '0 auto 12px auto' }} />
          Loading Executive Order File #{orderId || ''}...
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ minHeight: '70vh', padding: '40px 20px', textAlign: 'center', color: '#cbd5e1' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', color: '#f8fafc', marginBottom: '16px' }}>Order Record Not Found</h2>
        <Link to="/admin?tab=overview" className="btn-luxury-gold" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeft size={16} /> Return to Orders
        </Link>
      </div>
    );
  }

  const clientPhone = order.shipping_phone || order.customer_phone || '';
  const clientName = order.shipping_name || order.customer_name || 'Customer';
  const clientEmail = order.customer_email || '';

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: ' clamp(12px, 2.5vw, 24px) clamp(12px, 2.5vw, 28px) 60px' }}>
      
      {/* Top Breadcrumb & Executive Navigation Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <Link
          to="/admin?tab=overview"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#d4af37',
            textDecoration: 'none',
            fontSize: '0.86rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            background: 'rgba(212, 175, 55, 0.08)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            padding: '8px 16px',
            borderRadius: '9999px',
            transition: 'all 0.2s ease'
          }}
          className="admin-back-btn"
        >
          <ArrowLeft size={15} />
          <span>Back to All Orders</span>
        </Link>

        <button
          type="button"
          onClick={fetchOrder}
          className="btn-luxury-outline"
          style={{ padding: '7px 14px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={13} />
          <span>Refresh File</span>
        </button>
      </div>

      {/* Main Order Headline Banner */}
      <div className="glass-panel" style={{ borderRadius: '18px', padding: 'clamp(16px, 3vw, 24px)', marginBottom: '24px', border: '1px solid rgba(212, 175, 55, 0.35)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.74rem', color: '#d4af37', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                EXECUTIVE ORDER FILE
              </span>
              <span style={{
                background: order.order_status === 'Delivered' ? 'rgba(16, 185, 129, 0.2)' : (order.order_status === 'Cancelled' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(212, 175, 55, 0.2)'),
                border: order.order_status === 'Delivered' ? '1px solid #10b981' : (order.order_status === 'Cancelled' ? '1px solid #f43f5e' : '1px solid #d4af37'),
                color: order.order_status === 'Delivered' ? '#6ee7b7' : (order.order_status === 'Cancelled' ? '#fda4af' : '#fef08a'),
                fontSize: '0.74rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '9999px'
              }}>
                ● {order.order_status}
              </span>
              <span style={{
                background: order.payment_status === 'Paid' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                border: order.payment_status === 'Paid' ? '1px solid #10b981' : '1px solid #f59e0b',
                color: order.payment_status === 'Paid' ? '#10b981' : '#f59e0b',
                fontSize: '0.74rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '9999px'
              }}>
                ● {order.payment_status}
              </span>
            </div>

            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', color: '#ffffff', margin: 0, lineHeight: 1.2 }}>
              Order #{order.order_number || order.id}
            </h1>
            <div style={{ fontSize: '0.80rem', color: '#94a3b8', marginTop: '6px' }}>
              Placed on {new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Transaction</div>
            <div style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 800, color: '#f5df93', marginTop: '2px' }}>
              ₹{Number(order.total_amount || 0).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 600, marginTop: '2px' }}>
              {order.payment_method || 'UPI Settlement'}
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Responsive Workspace Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
        gap: '24px',
        alignItems: 'start'
      }}>

        {/* LEFT COLUMN: Customer & Delivery Destination & Purchased Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Card 1: Customer Contact & Direct Actions */}
          <div className="glass-panel" style={{ borderRadius: '16px', padding: 'clamp(16px, 2.5vw, 22px)', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f5df93', fontSize: '0.92rem', fontWeight: 700, marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
              <User size={17} color="#d4af37" />
              <span>Customer Profile & Direct Connect</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px' }}>
                <span style={{ color: '#94a3b8' }}>Client Name:</span>
                <strong style={{ color: '#ffffff', fontSize: '0.94rem' }}>{clientName}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                <span style={{ color: '#94a3b8' }}>Phone Number:</span>
                <strong style={{ color: '#f5df93', fontFamily: 'monospace', fontSize: '0.94rem' }}>
                  {clientPhone || 'Not recorded'}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px' }}>
                <span style={{ color: '#94a3b8' }}>Email Address:</span>
                <span style={{ color: '#cbd5e1' }}>{clientEmail || 'Not provided'}</span>
              </div>

              {/* Action Buttons: WhatsApp / Call / Email */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                {clientPhone && (
                  <>
                    <a
                      href={`https://wa.me/${clientPhone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(clientName)},%20this%20is%20TRY%20ME%20BRO%20Luxury%20Perfumes%20regarding%20your%20order%20%23${order.order_number || order.id}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                        color: '#ffffff',
                        borderRadius: '8px',
                        padding: '9px 16px',
                        fontSize: '0.80rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)',
                        flex: '1 1 auto',
                        justifyContent: 'center'
                      }}
                    >
                      <MessageSquare size={15} /> WhatsApp Chat
                    </a>

                    <a
                      href={`tel:${clientPhone.replace(/[^0-9]/g, '')}`}
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#f8fafc',
                        borderRadius: '8px',
                        padding: '9px 16px',
                        fontSize: '0.80rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        flex: '1 1 auto',
                        justifyContent: 'center'
                      }}
                    >
                      <Phone size={14} /> Direct Call
                    </a>
                  </>
                )}

                {clientEmail && (
                  <a
                    href={`mailto:${clientEmail}?subject=Regarding%20Your%20TRY%20ME%20BRO%20Order%20%23${order.order_number || order.id}`}
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#f8fafc',
                      borderRadius: '8px',
                      padding: '9px 16px',
                      fontSize: '0.80rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      flex: '1 1 auto',
                      justifyContent: 'center'
                    }}
                  >
                    <Mail size={14} /> Send Email
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Shipping Destination & Distance Calculation */}
          <div className="glass-panel" style={{ borderRadius: '16px', padding: 'clamp(16px, 2.5vw, 22px)', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f5df93', fontSize: '0.92rem', fontWeight: 700, marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
              <MapPin size={17} color="#d4af37" />
              <span>Delivery Destination & Origin Logistics</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem' }}>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.74rem', textTransform: 'uppercase', display: 'block' }}>Recipient:</span>
                <strong style={{ color: '#ffffff' }}>{order.shipping_name || clientName}</strong>
              </div>

              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.74rem', textTransform: 'uppercase', display: 'block' }}>Street Address:</span>
                <span style={{ color: '#e2e8f0', lineHeight: 1.4 }}>
                  {order.shipping_street || 'Address not recorded'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.74rem', textTransform: 'uppercase', display: 'block' }}>City / State:</span>
                  <span style={{ color: '#f8fafc' }}>
                    {order.shipping_city ? `${order.shipping_city}, ${order.shipping_state || ''}` : 'N/A'}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.74rem', textTransform: 'uppercase', display: 'block' }}>Postal PIN / Country:</span>
                  <span style={{ color: '#f8fafc' }}>
                    {order.shipping_postal_code || ''} ({order.shipping_country || 'India'})
                  </span>
                </div>
              </div>

              {/* Calculated Distance from Store PIN 382721 */}
              <div style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '10px', padding: '10px 14px', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.80rem', color: '#f5df93' }}>
                  <Truck size={16} color="#d4af37" />
                  <span>Calculated Distance from Store (PIN 382721):</span>
                </div>
                <strong style={{ color: '#ffffff', fontSize: '0.90rem' }}>
                  {order.distance_km ? `${order.distance_km} KM` : 'Calculated on dispatch'}
                </strong>
              </div>

              {order.notes && (
                <div style={{ background: 'rgba(212, 175, 55, 0.08)', border: '1px dashed rgba(212, 175, 55, 0.3)', borderRadius: '10px', padding: '10px 14px', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.74rem', color: '#f5df93', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>
                    Customer Delivery Notes / Gate Code:
                  </span>
                  <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>{order.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Purchased Fragrance Items Table */}
          <div className="glass-panel" style={{ borderRadius: '16px', padding: 'clamp(16px, 2.5vw, 22px)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontSize: '0.92rem', fontWeight: 700, marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
              <Package size={17} color="#d4af37" />
              <span>Purchased Fragrance Flacons ({order.items?.length || 0})</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px', padding: '10px' }}>
                    {item.product_image ? (
                      <img src={item.product_image} alt={item.product_name} style={{ width: '52px', height: '52px', borderRadius: '8px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '52px', height: '52px', borderRadius: '8px', background: 'rgba(212, 175, 55, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={20} color="#d4af37" />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.product_name || `Fragrance #${item.product_id}`}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '2px' }}>
                        {item.selected_size ? `Size: ${item.selected_size} • ` : ''}
                        Qty: <strong style={{ color: '#cbd5e1' }}>{item.quantity}</strong> × ₹{Number(item.price || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontWeight: 800, color: '#f5df93', fontSize: '0.94rem' }}>
                      ₹{(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: '#94a3b8', fontSize: '0.84rem', textAlign: 'center', padding: '16px' }}>
                  No individual item breakdown recorded on file.
                </div>
              )}
            </div>

            {/* Financial Summary */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '16px', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                <span>Items Subtotal:</span>
                <span style={{ color: '#cbd5e1' }}>₹{Number(order.subtotal || order.total_amount || 0).toLocaleString('en-IN')}</span>
              </div>
              {Number(order.discount_amount || 0) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                  <span>Promotional Discount:</span>
                  <span>-₹{Number(order.discount_amount).toLocaleString('en-IN')}</span>
                </div>
              )}
              {Number(order.shipping_fee || 0) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>Distance Logistics Delivery:</span>
                  <span style={{ color: '#cbd5e1' }}>₹{Number(order.shipping_fee).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f5df93', fontWeight: 800, fontSize: '1.05rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '8px', marginTop: '4px' }}>
                <span>Final Transaction Total:</span>
                <span>₹{Number(order.total_amount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Order Status, Courier Logistics & Live Customer Sync */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-panel" style={{
            background: 'linear-gradient(165deg, rgba(212, 175, 55, 0.08) 0%, rgba(10, 14, 22, 0.95) 100%)',
            border: '1.5px solid rgba(212, 175, 55, 0.35)',
            borderRadius: '18px',
            padding: 'clamp(18px, 3vw, 24px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '0.98rem', color: '#f5df93', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>
                ⚡ Order Status & Courier Logistics Control
              </h3>
              <span style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                padding: '4px 12px',
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
                Customer Sees: ● {orderFulfillmentStatus}
              </span>
            </div>

            {/* Status & Courier Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Fulfillment Status:
                </label>
                <select
                  value={orderFulfillmentStatus}
                  onChange={(e) => setOrderFulfillmentStatus(e.target.value)}
                  className="form-input-luxury"
                  style={{ padding: '9px 12px', fontSize: '0.86rem', background: '#0b0f19', color: '#ffffff' }}
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
                <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
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
                  style={{ padding: '9px 12px', fontSize: '0.86rem', background: '#0b0f19', color: '#ffffff' }}
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

            {/* Tracking Number & Estimated Delivery */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
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
                  style={{ padding: '9px 12px', fontSize: '0.86rem', fontFamily: 'monospace' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Estimated Delivery Date / Time:
                </label>
                <input
                  type="text"
                  placeholder="e.g. 15 Sep 2026 or 2–3 Days"
                  value={orderEstimatedDelivery}
                  onChange={(e) => setOrderEstimatedDelivery(e.target.value)}
                  className="form-input-luxury"
                  style={{ padding: '9px 12px', fontSize: '0.86rem' }}
                />
              </div>
            </div>

            {/* Live Tracking Portal URL */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600 }}>
                  Live Tracking Portal URL (Customer can click to track):
                </label>
                {orderTrackingUrl && (
                  <a href={orderTrackingUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.74rem', color: '#60a5fa', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span>Test Link</span> <ExternalLink size={11} />
                  </a>
                )}
              </div>
              <input
                type="url"
                placeholder="https://www.delhivery.com/track/package/..."
                value={orderTrackingUrl}
                onChange={(e) => setOrderTrackingUrl(e.target.value)}
                className="form-input-luxury"
                style={{ padding: '9px 12px', fontSize: '0.86rem' }}
              />
            </div>

            {/* Customer Delivery Remarks */}
            <div>
              <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Customer Delivery Remarks / Status Note:
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Fragrance packed in protective temperature-controlled casing and handed to courier partner."
                value={orderStatusNotes}
                onChange={(e) => setOrderStatusNotes(e.target.value)}
                className="form-input-luxury"
                style={{ padding: '9px 12px', fontSize: '0.84rem', resize: 'vertical' }}
              />
            </div>

            {/* Big Action Save Button */}
            <button
              type="button"
              onClick={handleSaveTrackingAndStatus}
              disabled={isSubmitting}
              className="btn-luxury-gold admin-save-tracking-btn"
              style={{
                padding: '13px 20px',
                fontSize: '0.88rem',
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
                borderRadius: '12px',
                marginTop: '6px'
              }}
            >
              <Save size={17} style={{ flexShrink: 0 }} />
              <span>{isSubmitting ? 'Saving Updates...' : 'Save Status & Tracking (Sync to Customer Account)'}</span>
            </button>

            {/* Quick Payment Verification */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px', marginTop: '6px' }}>
              <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                Quick Payment Verification:
              </label>
              <div className="admin-quick-pay-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleUpdatePaymentStatus('Paid')}
                  disabled={order.payment_status === 'Paid'}
                  style={{
                    background: order.payment_status === 'Paid' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid #10b981',
                    color: '#10b981',
                    padding: '9px 10px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: order.payment_status === 'Paid' ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    textAlign: 'center'
                  }}
                >
                  <span>✓</span>
                  <span>{order.payment_status === 'Paid' ? 'Verified' : 'Approve Payment'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdatePaymentStatus('Pending')}
                  disabled={order.payment_status === 'Pending'}
                  style={{
                    background: 'rgba(234, 179, 8, 0.15)',
                    border: '1px solid #eab308',
                    color: '#fde047',
                    padding: '9px 10px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    textAlign: 'center'
                  }}
                >
                  <span>⏳</span>
                  <span>Set Pending</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdatePaymentStatus('Failed')}
                  disabled={order.payment_status === 'Failed'}
                  style={{
                    background: order.payment_status === 'Failed' ? 'rgba(244, 63, 94, 0.3)' : 'rgba(244, 63, 94, 0.15)',
                    border: '1px solid #f43f5e',
                    color: '#fda4af',
                    padding: '9px 10px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: order.payment_status === 'Failed' ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    textAlign: 'center'
                  }}
                >
                  <span>✕</span>
                  <span>Reject Payment</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminOrderDetail;
