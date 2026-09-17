import axios from 'axios';

// Helper for safe localStorage access (guards against iOS Safari Private Browsing SecurityError)
export const getSafeStorage = (key) => {
  try {
    return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
  } catch (e) {
    return null;
  }
};

export const setSafeStorage = (key, value) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  } catch (e) {}
};

export const removeSafeStorage = (key) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch (e) {}
};

const DIRECT_BACKEND_URL = 'https://trymebro-backend-production.up.railway.app/api';

// Base URL resolution:
// On production (e.g. trymebro.in), use same-origin '/api' proxied by Netlify.
// This eliminates ISP blocking (Jio/Airtel), iOS Safari CORS, ITP, and mixed content issues.
const getBaseApiUrl = () => {
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    if (!isLocalhost) {
      return '/api';
    }
  }

  let url =
    import.meta.env.VITE_API_URL ||
    import.meta.env.REACT_APP_BACKEND_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    DIRECT_BACKEND_URL;

  url = url.trim().replace(/\/+$/, '');
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  if (url.startsWith('http://') && url.includes('railway.app')) {
    url = url.replace('http://', 'https://');
  }

  return url;
};

const API_BASE_URL = getBaseApiUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to requests automatically with safe storage
api.interceptors.request.use(
  (config) => {
    const token = getSafeStorage('scentvogue_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response error handler with automatic dual-path fallback
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response && error.response.status === 401) {
      removeSafeStorage('scentvogue_token');
      removeSafeStorage('scentvogue_user');
      return Promise.reject(error);
    }

    // Automatic Fallback Strategy for iOS / cellular ISP issues:
    // If request failed and has not been retried yet
    if (originalRequest && !originalRequest.__isRetry) {
      originalRequest.__isRetry = true;

      const currentBase = originalRequest.baseURL || API_BASE_URL;
      const isRelative = currentBase === '/api' || currentBase.startsWith('/');

      // If failed on same-origin '/api', fallback to direct Railway URL
      if (isRelative) {
        originalRequest.baseURL = DIRECT_BACKEND_URL;
        return api(originalRequest);
      }
      // If failed on direct Railway URL, fallback to same-origin '/api'
      else if (typeof window !== 'undefined' && window.location && !window.location.hostname.includes('localhost')) {
        originalRequest.baseURL = '/api';
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export { API_BASE_URL, DIRECT_BACKEND_URL };
export default api;
