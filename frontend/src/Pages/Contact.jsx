import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageSquare, 
  Clock, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Crown, 
  Headphones,
  User,
  CheckCircle,
  ExternalLink,
  Lock,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const DEFAULT_CONTACT_CONTENT = {
  header_badge: 'Concierge & Private Client Support',
  header_title: 'How May We Assist Your Senses?',
  header_subtitle: 'Whether you require bespoke fragrance curation, order tracking assistance, or corporate gifting consultations, our fragrance specialists are at your service.',
  boutique_address: 'TRY ME BRO Luxury Perfumes, Main Heritage Boulevard, Kalol 382721, Gujarat, India',
  concierge_email: 'concierge@trymebro.com',
  client_phone: '+91 98765 43210',
  client_whatsapp: '+91 98765 43210',
  working_hours: 'Monday – Sunday: 10:00 AM – 9:00 PM IST',
  guarantee_text: 'Every client inquiry is reviewed individually by our senior fragrance consultants. We treat each question with discretion and personalized dedication.',
  faqs: [
    {
      q: 'How can I verify the authenticity of my perfume bottle?',
      a: 'All our perfumes are sourced directly from verified authorized distributors and prestigious fragrance ateliers. Each bottle bears an authentic serial batch code on the flacon base that matches the outer presentation box seal.'
    },
    {
      q: 'What is the difference between Eau de Parfum (EDP) and Extrait de Parfum?',
      a: 'Eau de Parfum (EDP) features a 15-20% pure oil concentration providing 6 to 8 hours of performance. Extrait de Parfum is the pinnacle of fragrance art, containing 25-40% concentrated pure perfume oils for deep sillage that lasts 12 to 24+ hours.'
    },
    {
      q: 'How does your climate-controlled shipping protect fragile perfume oils?',
      a: 'Extreme temperature fluctuations can alter delicate top and heart notes. We package all parcels in thermal-shielded, cushioned presentation boxes that ensure your perfume arrives in pristine condition.'
    },
    {
      q: 'What is your return and replacement policy?',
      a: 'We offer hassle-free returns on eligible unopened flacons with their cellophane hygiene seals intact. You can easily initiate a return anytime through your Member Profile → Returns & Refunds tab.'
    },
    {
      q: 'Can I request a personalized bespoke olfactory recommendation?',
      a: 'Certainly. Simply start a live concierge chat or send us a message via the form below describing your preferred scent notes, and our certified fragrance curators will tailor a bespoke recommendation list for you.'
    }
  ]
};

const Contact = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState(DEFAULT_CONTACT_CONTENT);
  const [openFaq, setOpenFaq] = useState(0);

  // Inquiry Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    inquiryType: 'Fragrance Consultation',
    subject: '',
    message: ''
  });
  const [submittingForm, setSubmittingForm] = useState(false);

  // 1. Fetch Dynamic CMS Content
  useEffect(() => {
    const fetchContactContent = async () => {
      try {
        const res = await api.get('/content/contact');
        if (res.data?.success && res.data.content) {
          setContent(prev => ({
            ...prev,
            ...res.data.content,
            header_badge: res.data.content.heroBadge || res.data.content.header_badge || prev.header_badge,
            header_title: res.data.content.heroTitle || res.data.content.header_title || prev.header_title,
            header_subtitle: res.data.content.heroSubtitle || res.data.content.header_subtitle || prev.header_subtitle,
            boutique_address: res.data.content.address || res.data.content.boutique_address || prev.boutique_address,
            concierge_email: res.data.content.email || res.data.content.concierge_email || prev.concierge_email,
            client_phone: res.data.content.phone || res.data.content.client_phone || prev.client_phone,
            client_whatsapp: res.data.content.whatsapp || res.data.content.client_whatsapp || prev.client_whatsapp,
            working_hours: res.data.content.timings || res.data.content.working_hours || prev.working_hours,
            faqs: res.data.content.faqs || prev.faqs
          }));
        }
      } catch (err) {
        console.warn('Using default contact content:', err.message);
      }
    };
    fetchContactContent();
  }, []);

  // Sync user details to form
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [user]);

  // Form Submit Handler
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in your name, email, and message.');
      return;
    }

    try {
      setSubmittingForm(true);
      const res = await api.post('/contact', {
        name: formData.name,
        email: formData.email,
        subject: `[${formData.inquiryType}] ${formData.subject || 'Client Inquiry'}`,
        message: formData.phone 
          ? `Phone/WhatsApp: ${formData.phone}\n\n${formData.message}` 
          : formData.message
      });

      if (res.data?.success || res.status === 200) {
        toast.success('✨ Message dispatched successfully. Our concierge will contact you shortly.');
        setFormData({
          name: user?.name || '',
          email: user?.email || '',
          phone: '',
          inquiryType: 'Fragrance Consultation',
          subject: '',
          message: ''
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to dispatch inquiry. Please try again.');
    } finally {
      setSubmittingForm(false);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: 'clamp(20px, 4vw, 40px) auto', padding: '0 clamp(14px, 3vw, 24px)' }}>
      
      {/* 1. Page Header */}
      <div style={{ textAlign: 'center', marginBottom: 'clamp(28px, 4vw, 44px)' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          padding: '5px 14px',
          borderRadius: '9999px',
          background: 'rgba(212, 175, 55, 0.12)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          color: '#f5df93',
          fontSize: 'clamp(0.72rem, 1.8vw, 0.78rem)',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          marginBottom: '14px'
        }}>
          <Headphones size={13} color="#d4af37" />
          <span>{content.header_badge}</span>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
          color: '#ffffff',
          fontWeight: 700,
          marginBottom: '12px',
          lineHeight: 1.2
        }}>
          {content.header_title}
        </h1>

        <p style={{
          fontSize: 'clamp(0.88rem, 1.8vw, 1.02rem)',
          color: '#94a3b8',
          maxWidth: '680px',
          margin: '0 auto',
          lineHeight: 1.7
        }}>
          {content.header_subtitle}
        </p>
      </div>

      {/* 2. DEDICATED LIVE CONCIERGE CHAT HERO BANNER */}
      <div 
        className="glass-panel"
        style={{
          borderRadius: '24px',
          border: '1.5px solid rgba(212, 175, 55, 0.45)',
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.16) 0%, rgba(10, 14, 22, 0.95) 100%)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(212, 175, 55, 0.12)',
          padding: 'clamp(24px, 4vw, 36px)',
          marginBottom: 'clamp(40px, 6vw, 56px)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px'
        }}
      >
        <div style={{ flex: '1 1 450px', display: 'flex', alignItems: 'flex-start', gap: '18px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #d4af37 0%, #996515 100%)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#05070a',
            flexShrink: 0,
            boxShadow: '0 0 20px rgba(212, 175, 55, 0.4)'
          }}>
            <MessageSquare size={26} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.74rem', color: '#f5df93', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
                REAL-TIME BESPOKE ADVISORY
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.68rem', color: '#6ee7b7', fontWeight: 600 }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span> Online
              </span>
            </div>

            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.35rem, 3vw, 1.8rem)', color: '#ffffff', margin: '0 0 8px 0', lineHeight: 1.3 }}>
              Maison Private Concierge & Live Support Chat
            </h2>

            <p style={{ fontSize: '0.86rem', color: '#cbd5e1', margin: 0, lineHeight: 1.6, maxWidth: '580px' }}>
              Connect directly with our master perfumers in a private conversation for personalized note curation, order tracking, and bespoke fragrance gifting consultations.
            </p>
          </div>
        </div>

        {/* Action Button & Access Gate */}
        <div style={{ flexShrink: 0, textAlign: 'center' }}>
          {user ? (
            <Link
              to="/support"
              className="btn-luxury-gold"
              style={{
                padding: '14px 32px',
                fontSize: '0.92rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 8px 24px rgba(212, 175, 55, 0.35)'
              }}
            >
              <MessageSquare size={18} />
              <span>Launch Live Concierge Chat</span>
              <ArrowRight size={16} />
            </Link>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              <Link
                to="/login"
                state={{ from: { pathname: '/support' } }}
                className="btn-luxury-gold"
                style={{
                  padding: '14px 28px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Lock size={16} />
                <span>Sign In to Access Live Chat</span>
                <ArrowRight size={16} />
              </Link>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Exclusive benefit for registered society members
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Main Dual Columns (Detailed Inquiry Form + Direct Boutique Channels) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
        gap: 'clamp(24px, 4vw, 36px)',
        marginBottom: 'clamp(48px, 8vw, 72px)'
      }}>
        
        {/* Left Column: Detailed Inquiry Form */}
        <div 
          className="glass-panel" 
          style={{
            borderRadius: '24px',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
            padding: 'clamp(22px, 4vw, 34px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Send size={18} color="#d4af37" />
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#ffffff', margin: 0 }}>
                Dispatched Client Inquiry Form
              </h2>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 20px 0' }}>
              Prefer an official email response? Submit your request below and our concierge desk will reply within 24 hours.
            </p>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Name & Email */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Lord / Lady Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input-luxury"
                    style={{ fontSize: '0.84rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input-luxury"
                    style={{ fontSize: '0.84rem' }}
                  />
                </div>
              </div>

              {/* Phone & Inquiry Type */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Contact Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-input-luxury"
                    style={{ fontSize: '0.84rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Inquiry Nature
                  </label>
                  <select
                    value={formData.inquiryType}
                    onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                    className="form-input-luxury"
                    style={{ fontSize: '0.84rem' }}
                  >
                    <option value="Fragrance Consultation">Fragrance Consultation</option>
                    <option value="Order Tracking & Logistics">Order Tracking & Logistics</option>
                    <option value="Return & Replacement">Return & Replacement</option>
                    <option value="Corporate & VIP Gifting">Corporate & VIP Gifting</option>
                    <option value="Other Inquiries">Other Inquiries</option>
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Inquiry Topic / Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. Guidance on Woody Extrait blends for evening wear"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="form-input-luxury"
                  style={{ fontSize: '0.84rem' }}
                />
              </div>

              {/* Message */}
              <div>
                <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Detailed Message *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your inquiry or notes preference in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="form-input-luxury"
                  style={{ fontSize: '0.84rem', resize: 'vertical' }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submittingForm}
                className="btn-luxury-gold"
                style={{
                  padding: '12px 24px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '6px'
                }}
              >
                <Send size={16} />
                {submittingForm ? 'Transmitting Inquiry...' : 'Dispatch Inquiry to Atelier'}
              </button>

            </form>
          </div>
        </div>

        {/* Right Column: Flagship Boutique Channels & Assurance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div 
            className="glass-panel" 
            style={{
              borderRadius: '24px',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              padding: 'clamp(22px, 4vw, 30px)',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(8, 11, 18, 0.95) 100%)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px'
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, marginBottom: '4px' }}>
                DIRECT SALON CHANNELS
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: '#ffffff', margin: 0 }}>
                TRY ME BRO Main Atelier
              </h3>
            </div>

            {/* Email Channel */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', flexShrink: 0 }}>
                <Mail size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Concierge Desk Email</div>
                <a href={`mailto:${content.concierge_email}`} style={{ color: '#f5df93', fontSize: '0.92rem', fontWeight: 600, textDecoration: 'none' }}>
                  {content.concierge_email}
                </a>
              </div>
            </div>

            {/* Phone Channel */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', flexShrink: 0 }}>
                <Phone size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>VIP Hotline & WhatsApp</div>
                <a href={`tel:${content.client_phone}`} style={{ color: '#f5df93', fontSize: '0.92rem', fontWeight: 600, textDecoration: 'none', display: 'block' }}>
                  {content.client_phone}
                </a>
              </div>
            </div>

            {/* Boutique Address */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', flexShrink: 0 }}>
                <MapPin size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Atelier & Private Salon</div>
                <div style={{ color: '#cbd5e1', fontSize: '0.84rem', lineHeight: 1.5, marginTop: '2px' }}>
                  {content.boutique_address}
                </div>
              </div>
            </div>

            {/* Working Timings */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', flexShrink: 0 }}>
                <Clock size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Visiting & Advisory Hours</div>
                <div style={{ color: '#cbd5e1', fontSize: '0.84rem', lineHeight: 1.5, marginTop: '2px' }}>
                  {content.working_hours}
                </div>
              </div>
            </div>

          </div>

          {/* Client Assurance Card */}
          <div 
            className="glass-panel" 
            style={{
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px'
            }}
          >
            <ShieldCheck size={28} color="#d4af37" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5 }}>
              {content.guarantee_text}
            </div>
          </div>

        </div>

      </div>

      {/* 4. DYNAMIC INTERACTIVE FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION) */}
      <div style={{ maxWidth: '960px', margin: '0 auto clamp(40px, 6vw, 60px) auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '0.74rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700, marginBottom: '6px' }}>
            PATRON CURATION & INQUIRY ARCHIVE
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#ffffff', margin: 0 }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(content.faqs || []).map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div 
                key={index}
                className="glass-panel"
                style={{
                  borderRadius: '16px',
                  border: isOpen ? '1px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden',
                  transition: 'all 0.25s ease'
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? -1 : index)}
                  style={{
                    width: '100%',
                    padding: '18px 22px',
                    background: 'transparent',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '14px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ fontSize: '0.94rem', fontWeight: 600, color: isOpen ? '#f5df93' : '#f8fafc' }}>
                    {faq.q}
                  </span>
                  {isOpen ? <ChevronUp size={18} color="#d4af37" /> : <ChevronDown size={18} color="#94a3b8" />}
                </button>

                {isOpen && (
                  <div style={{
                    padding: '0 22px 18px 22px',
                    fontSize: '0.86rem',
                    color: '#cbd5e1',
                    lineHeight: 1.65,
                    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                    paddingTop: '12px'
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default Contact;
