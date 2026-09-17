import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('scentvogue_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem('scentvogue_token') || null);
  const [loading, setLoading] = useState(!!localStorage.getItem('scentvogue_token'));

  // Initialize auth state & verify token
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('scentvogue_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Profile verification failed, resetting session:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('scentvogue_token', res.data.token);
        localStorage.setItem('scentvogue_user', JSON.stringify(res.data.user));
        return { success: true, user: res.data.user, message: res.data.message };
      }
      return { success: false, message: res.data.message || 'Login failed.' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Login failed. Please check your credentials.'
      };
    }
  };

  // Register handler
  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('scentvogue_token', res.data.token);
        localStorage.setItem('scentvogue_user', JSON.stringify(res.data.user));
        return { success: true, user: res.data.user, message: res.data.message };
      }
      return { success: false, message: res.data.message || 'Registration failed.' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Registration failed. Please try again.'
      };
    }
  };

  // Admin Login handler (Step 1: Credentials)
  const adminLogin = async (email, password) => {
    try {
      const res = await api.post('/auth/admin/login', { email, password });
      if (res.data.success) {
        if (res.data.require2FA) {
          return {
            success: true,
            require2FA: true,
            email: res.data.email,
            message: res.data.message
          };
        }
        // Direct login fallback
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('scentvogue_token', res.data.token);
        localStorage.setItem('scentvogue_user', JSON.stringify(res.data.user));
        return { success: true, user: res.data.user, message: res.data.message };
      }
      return { success: false, message: res.data.message || 'Administrator authentication failed.' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Administrator authentication failed.'
      };
    }
  };

  // Admin 2FA OTP Verification handler (Step 2: OTP)
  const adminVerifyOtp = async (email, otp) => {
    try {
      const res = await api.post('/auth/admin/verify-otp', { email, otp });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('scentvogue_token', res.data.token);
        localStorage.setItem('scentvogue_user', JSON.stringify(res.data.user));
        return { success: true, user: res.data.user, message: res.data.message };
      }
      return { success: false, message: res.data.message || 'OTP verification failed.' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Verification failed. Please check the code.'
      };
    }
  };

  // Admin 2FA Resend OTP handler
  const adminResendOtp = async (email) => {
    try {
      const res = await api.post('/auth/admin/resend-otp', { email });
      return {
        success: res.data.success,
        message: res.data.message || 'Verification code resent successfully.'
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Failed to resend verification code.'
      };
    }
  };

  // Admin Register handler
  const adminRegister = async (adminData) => {
    try {
      const res = await api.post('/auth/admin/register', adminData);
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('scentvogue_token', res.data.token);
        localStorage.setItem('scentvogue_user', JSON.stringify(res.data.user));
        return { success: true, user: res.data.user, message: res.data.message };
      }
      return { success: false, message: res.data.message || 'Admin registration failed.' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Admin registration failed.'
      };
    }
  };

  // Update Profile
  const updateProfile = async (profileData) => {
    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('scentvogue_user', JSON.stringify(res.data.user));
        return { success: true, user: res.data.user, message: res.data.message };
      }
      return { success: false, message: res.data.message || 'Failed to update profile.' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Failed to update profile.'
      };
    }
  };

  // Logout handler
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('scentvogue_token');
    localStorage.removeItem('scentvogue_user');
    localStorage.removeItem('scentvogue_guest_cart');
    localStorage.removeItem('scentvogue_wishlist');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        login,
        register,
        adminLogin,
        adminVerifyOtp,
        adminResendOtp,
        adminRegister,
        updateProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
