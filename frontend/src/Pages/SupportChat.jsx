import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Headphones, 
  Send, 
  User, 
  ArrowLeft, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Lock, 
  ArrowDown, 
  Image as ImageIcon, 
  X, 
  Maximize2, 
  Loader2, 
  ExternalLink 
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const SUGGESTED_QUESTIONS = [
  {
    label: '✨ Help me choose a perfume',
    text: 'Can you recommend a good perfume for me based on my preferences?'
  },
  {
    label: '📦 Check my order & delivery status',
    text: 'Could you please check the delivery and shipping status of my recent order?'
  },
  {
    label: '🎁 Free sample perfume bottles',
    text: 'Do I get complimentary sample perfume bottles with my order?'
  },
  {
    label: '🛡️ Return or replace an item',
    text: 'I need assistance regarding a product return or replacement request.'
  },
  {
    label: '💎 Perfume quality & lasting time',
    text: 'How long do your high-concentration perfume oils last on clothes and skin?'
  },
  {
    label: '🏢 Gift boxes & bulk orders',
    text: 'I want to ask about special gift packaging and large order discounts.'
  },
  {
    label: '📍 Store location & opening hours',
    text: 'What are your store location details and opening hours in Kalol (382721)?'
  }
];

const SupportChat = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const [hasNewMessagesBelow, setHasNewMessagesBelow] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');

  // Image Upload & Lightbox State
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const chatBottomRef = useRef(null);
  const prevMessageCountRef = useRef(0);
  const justSentRef = useRef(false);

  // Scroll to bottom smoothly helper
  const scrollToBottom = (behavior = 'smooth') => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior });
      setUserScrolledUp(false);
      setHasNewMessagesBelow(false);
    }
  };

  // Track container scroll position to detect if user has scrolled up
  const handleChatScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight <= 80;
    
    if (isAtBottom) {
      setUserScrolledUp(false);
      setHasNewMessagesBelow(false);
    } else {
      setUserScrolledUp(true);
    }
  };

  // 1. Initialize or load user's conversation thread
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    const initChat = async () => {
      try {
        setLoadingHistory(true);
        const res = await api.post('/chat/init', {
          user_id: user.id,
          user_name: user.name || 'Valued Customer',
          user_email: user.email || null,
          user_phone: user.phone || null
        });

        if (isMounted && res.data?.success) {
          setConversation(res.data.conversation);
          const initialMsgs = res.data.messages || [];
          setMessages(initialMsgs);
          prevMessageCountRef.current = initialMsgs.length;
          setTimeout(() => scrollToBottom('auto'), 150);
        }
      } catch (err) {
        console.error('Failed to init chat session:', err);
        toast.error('Could not connect to live support. Please try again.');
      } finally {
        if (isMounted) setLoadingHistory(false);
      }
    };

    initChat();
    return () => { isMounted = false; };
  }, [user]);

  // 2. Smart auto-scroll effect: only scroll if at bottom or user sent message
  useEffect(() => {
    if (messages.length === 0) return;

    const countChanged = messages.length > prevMessageCountRef.current;
    const isInitial = prevMessageCountRef.current === 0;

    if (justSentRef.current) {
      justSentRef.current = false;
      scrollToBottom('smooth');
    } else if (isInitial) {
      scrollToBottom('auto');
    } else if (countChanged) {
      if (!userScrolledUp) {
        scrollToBottom('smooth');
      } else {
        setHasNewMessagesBelow(true);
      }
    }

    prevMessageCountRef.current = messages.length;
  }, [messages, userScrolledUp]);

  // 3. Live Polling for incoming messages (every 3 seconds)
  useEffect(() => {
    if (!conversation?.id || !user) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/chat/messages/${conversation.id}`);
        if (res.data?.success && Array.isArray(res.data.messages)) {
          setMessages(res.data.messages);
        }
      } catch (err) {
        // Silent poll error
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [conversation?.id, user]);

  // Image Selection Handler
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, WEBP, GIF)');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error('Image size exceeds 15MB limit. Please choose a smaller photo.');
      return;
    }

    setSelectedImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreviewUrl(objectUrl);
    e.target.value = '';
  };

  const handleRemoveSelectedImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
  };

  // 4. Send message handler
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if ((!inputMessage.trim() && !selectedImageFile) || sendingMessage || !user) return;

    const textToSend = inputMessage.trim();
    let uploadedImageUrl = null;

    setSendingMessage(true);
    justSentRef.current = true;

    try {
      // 1. Upload image if selected
      if (selectedImageFile) {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append('image', selectedImageFile);

        const uploadRes = await api.post('/chat/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (uploadRes.data?.success && uploadRes.data.url) {
          uploadedImageUrl = uploadRes.data.url;
        } else {
          throw new Error('Image upload failed');
        }
      }

      // 2. Send message
      const res = await api.post('/chat/send', {
        conversation_id: conversation?.id || null,
        message: textToSend,
        image_url: uploadedImageUrl,
        user_name: user.name || 'Valued Customer',
        user_email: user.email || null,
        user_id: user.id
      });

      if (res.data?.success && res.data.message) {
        setMessages((prev) => [...prev, res.data.message]);
        if (!conversation?.id && res.data.conversation_id) {
          setConversation((prev) => ({ ...(prev || {}), id: res.data.conversation_id }));
        }
        setInputMessage('');
        setSelectedTopic('');
        handleRemoveSelectedImage();
        setTimeout(() => scrollToBottom('smooth'), 50);
      }
    } catch (err) {
      console.error('Send message error:', err);
      toast.error('Failed to send message or image. Please try again.');
      justSentRef.current = false;
    } finally {
      setSendingMessage(false);
      setUploadingImage(false);
    }
  };

  // Handle dropdown selection
  const handleSelectSuggestedQuestion = (e) => {
    const val = e.target.value;
    setSelectedTopic(val);
    if (val) {
      setInputMessage(val);
    }
  };

  // If not logged in
  if (!user || !token) {
    return (
      <div style={{ maxWidth: '640px', margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ borderRadius: '24px', padding: '40px 24px', border: '1px solid rgba(212, 175, 55, 0.4)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid #d4af37', margin: '0 auto 20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={28} color="#d4af37" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: '#ffffff', marginBottom: '12px' }}>
            Please Sign In to Chat
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '28px' }}>
            Live customer support is available for registered members. Please sign in to chat directly with our team.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login" state={{ from: { pathname: '/support' } }} className="btn-luxury-gold" style={{ padding: '12px 28px' }}>
              Sign In to Your Account
            </Link>
            <Link to="/register" className="btn-luxury-outline" style={{ padding: '12px 24px' }}>
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '20px auto', padding: '0 16px', minHeight: '85vh' }}>
      
      {/* Top Header Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn-luxury-outline"
          style={{ padding: '8px 18px', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <ArrowLeft size={15} /> Back
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.78rem', color: '#6ee7b7', fontWeight: 600 }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }}></span>
          Support Team Online
        </div>
      </div>

      {/* Main Live Chat Panel */}
      <div className="glass-panel" style={{
        borderRadius: '20px',
        border: '1.5px solid rgba(212, 175, 55, 0.35)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 40px rgba(212, 175, 55, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(88vh - 70px)',
        minHeight: '620px',
        maxHeight: '860px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        
        {/* Chat Card Header - Clean & Compact */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(10, 13, 20, 0.95) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #d4af37 0%, #996515 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(212, 175, 55, 0.35)',
              color: '#05070a',
              flexShrink: 0
            }}>
              <Headphones size={20} />
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>TRY ME BRO Live Support</span>
                <Sparkles size={14} color="#d4af37" />
              </div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Order Help, Product Guidance & General Inquiries
              </div>
            </div>
          </div>

          {/* Member Badge Info */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '0.82rem', color: '#f5df93', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
              <User size={14} /> {user.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Member #{user.id}
            </div>
          </div>
        </div>

        {/* Message Stream Body */}
        <div 
          ref={chatContainerRef}
          onScroll={handleChatScroll}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            background: 'rgba(5, 7, 12, 0.65)'
          }}
        >
          {/* Welcome Intro Banner */}
          <div style={{
            background: 'rgba(212, 175, 55, 0.08)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: '16px',
            padding: '14px 20px',
            textAlign: 'center',
            margin: '0 auto 6px auto',
            maxWidth: '620px'
          }}>
            <div style={{ fontSize: '0.92rem', color: '#f5df93', fontWeight: 700, marginBottom: '4px' }}>
              👋 Welcome, {user.name}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              You are connected with our customer support team. Ask any questions about your orders, shipping, returns, or perfumes.
            </div>
          </div>

          {loadingHistory ? (
            <div style={{ margin: 'auto', textAlign: 'center', color: '#d4af37', fontSize: '0.90rem' }}>
              Loading conversation history...
            </div>
          ) : messages.length === 0 ? (
            <div style={{ margin: 'auto', textAlign: 'center', color: '#94a3b8', fontSize: '0.88rem', padding: '20px' }}>
              No messages yet. Pick a question below or type a message to start chatting!
            </div>
          ) : (
            messages.map((msg, index) => {
              const isAdmin = msg.sender_type === 'admin';
              const hasImage = Boolean(msg.image_url);
              const isPlaceholderText = msg.message === '📷 Photo Attached' || msg.message === '📷 Image';

              return (
                <div
                  key={msg.id || index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isAdmin ? 'flex-start' : 'flex-end',
                    maxWidth: '85%',
                    alignSelf: isAdmin ? 'flex-start' : 'flex-end'
                  }}
                >
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '3px', paddingLeft: '4px', paddingRight: '4px', fontWeight: 500 }}>
                    {isAdmin ? 'Support Agent' : 'You'} • {new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  <div
                    style={{
                      padding: hasImage ? '10px' : '14px 20px',
                      borderRadius: isAdmin ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                      background: isAdmin 
                        ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.22) 0%, rgba(20, 25, 35, 0.96) 100%)' 
                        : 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
                      color: isAdmin ? '#f8fafc' : '#05070a',
                      fontWeight: isAdmin ? 400 : 600,
                      fontSize: '0.96rem',
                      lineHeight: '1.55',
                      border: isAdmin ? '1px solid rgba(212, 175, 55, 0.35)' : 'none',
                      wordBreak: 'break-word',
                      boxShadow: isAdmin ? '0 4px 18px rgba(0,0,0,0.5)' : '0 4px 18px rgba(212, 175, 55, 0.35)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    {/* Attached Image Thumbnail */}
                    {hasImage && (
                      <div 
                        style={{
                          position: 'relative',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border: '1px solid rgba(255,255,255,0.2)',
                          maxHeight: '300px',
                          background: '#000000'
                        }}
                        onClick={() => setLightboxImage(msg.image_url)}
                        title="Click to view full photo"
                      >
                        <img 
                          src={msg.image_url} 
                          alt="Chat attachment" 
                          style={{
                            width: '100%',
                            maxHeight: '300px',
                            objectFit: 'cover',
                            display: 'block',
                            transition: 'transform 0.25s ease'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        />
                        <div style={{
                          position: 'absolute',
                          bottom: '8px',
                          right: '8px',
                          background: 'rgba(0,0,0,0.7)',
                          backdropFilter: 'blur(4px)',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '0.72rem',
                          color: '#f5df93',
                          fontWeight: 600
                        }}>
                          <Maximize2 size={12} />
                          <span>View Full Photo</span>
                        </div>
                      </div>
                    )}

                    {/* Text Caption or Message */}
                    {(!hasImage || (!isPlaceholderText && msg.message)) && (
                      <div style={{ padding: hasImage ? '4px 8px' : 0 }}>
                        {msg.message}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Floating "Scroll Down" Button */}
        {(userScrolledUp || hasNewMessagesBelow) && (
          <button
            type="button"
            onClick={() => scrollToBottom('smooth')}
            style={{
              position: 'absolute',
              bottom: imagePreviewUrl ? '200px' : '135px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: hasNewMessagesBelow 
                ? 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)' 
                : 'rgba(15, 20, 30, 0.95)',
              color: hasNewMessagesBelow ? '#05070a' : '#f5df93',
              border: hasNewMessagesBelow ? 'none' : '1px solid rgba(212, 175, 55, 0.5)',
              borderRadius: '9999px',
              padding: '8px 18px',
              fontSize: '0.80rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)',
              zIndex: 10,
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowDown size={14} />
            <span>{hasNewMessagesBelow ? 'New Message ↓' : 'Scroll to Latest ↓'}</span>
          </button>
        )}

        {/* QUICK QUESTIONS DROPDOWN */}
        <div style={{
          padding: '10px 18px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'rgba(10, 14, 22, 0.96)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.80rem', color: '#d4af37', fontWeight: 700, flexShrink: 0 }}>
            <Sparkles size={14} />
            <span>Quick Questions:</span>
          </div>

          <div style={{ flex: 1, minWidth: '220px' }}>
            <select
              value={selectedTopic}
              onChange={handleSelectSuggestedQuestion}
              className="form-input-luxury"
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '0.84rem',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                color: selectedTopic ? '#f5df93' : '#94a3b8',
                cursor: 'pointer'
              }}
            >
              <option value="" style={{ background: '#0f141f', color: '#94a3b8' }}>
                -- Select a common question to ask... --
              </option>
              {SUGGESTED_QUESTIONS.map((item, idx) => (
                <option key={idx} value={item.text} style={{ background: '#0f141f', color: '#f8fafc' }}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Image Attachment Preview Bar */}
        {imagePreviewUrl && (
          <div style={{
            padding: '12px 18px',
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(15, 20, 30, 0.96) 100%)',
            borderTop: '1px solid rgba(212, 175, 55, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1.5px solid #d4af37',
                flexShrink: 0,
                position: 'relative',
                background: '#000000'
              }}>
                <img 
                  src={imagePreviewUrl} 
                  alt="Selected" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#f5df93', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedImageFile?.name || 'Attached Image'}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                  {selectedImageFile ? `${(selectedImageFile.size / 1024).toFixed(1)} KB` : 'Ready'} • Click Send or add a text message below
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemoveSelectedImage}
              disabled={sendingMessage}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171',
                borderRadius: '8px',
                padding: '7px 14px',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <X size={14} /> Remove Photo
            </button>
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} style={{
          padding: '14px 20px',
          background: 'rgba(8, 11, 18, 0.98)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        }}>
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageFileChange}
          />

          {/* Image Upload Trigger Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={sendingMessage}
            className="btn-luxury-outline"
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '0.88rem',
              color: selectedImageFile ? '#d4af37' : '#cbd5e1',
              borderColor: selectedImageFile ? '#d4af37' : 'rgba(255,255,255,0.15)',
              background: selectedImageFile ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
              flexShrink: 0,
              cursor: 'pointer',
              height: '48px'
            }}
            title="Attach Photo / Image"
          >
            <ImageIcon size={19} color={selectedImageFile ? '#d4af37' : '#94a3b8'} />
            <span className="d-none d-sm-inline">{selectedImageFile ? 'Photo Added' : 'Attach Photo'}</span>
          </button>

          <input
            type="text"
            placeholder={selectedImageFile ? 'Add an optional note with this photo...' : 'Type your message here...'}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="form-input-luxury"
            style={{
              flex: 1,
              padding: '13px 18px',
              fontSize: '0.96rem',
              borderRadius: '12px',
              height: '48px'
            }}
            disabled={sendingMessage}
            autoFocus
          />

          <button
            type="submit"
            disabled={sendingMessage || (!inputMessage.trim() && !selectedImageFile)}
            className="btn-luxury-gold"
            style={{
              padding: '13px 26px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.95rem',
              fontWeight: 700,
              borderRadius: '12px',
              opacity: sendingMessage || (!inputMessage.trim() && !selectedImageFile) ? 0.6 : 1,
              flexShrink: 0
            }}
          >
            {sendingMessage ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{uploadingImage ? 'Uploading...' : 'Sending...'}</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Send</span>
              </>
            )}
          </button>
        </form>

      </div>

      {/* Trust & Guarantee Strip */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', marginTop: '16px', fontSize: '0.78rem', color: '#94a3b8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={15} color="#d4af37" /> 100% Secure & Private Chat
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={15} color="#d4af37" /> Live Help Available: 10:00 AM – 9:00 PM IST
        </div>
      </div>

      {/* FULL-SCREEN IMAGE LIGHTBOX MODAL */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.94)',
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
            {/* Action Bar */}
            <div style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              marginBottom: '12px'
            }}>
              <a
                href={lightboxImage}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-luxury-outline"
                style={{ padding: '7px 16px', fontSize: '0.80rem', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#f5df93' }}
              >
                <ExternalLink size={14} /> Open Original Photo
              </a>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#ffffff',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.80rem'
                }}
              >
                <X size={15} /> Close
              </button>
            </div>

            {/* Image Viewer */}
            <div style={{
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1.5px solid rgba(212, 175, 55, 0.5)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.95), 0 0 35px rgba(212,175,55,0.25)',
              background: '#0a0d14'
            }}>
              <img 
                src={lightboxImage} 
                alt="Enlarged preview" 
                style={{
                  maxWidth: '85vw',
                  maxHeight: '78vh',
                  objectFit: 'contain',
                  display: 'block'
                }} 
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SupportChat;


