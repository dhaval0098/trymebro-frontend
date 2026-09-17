import axios from 'axios';

// Base URL resolution supporting Railway backend, Vite env and React App env
const getBaseApiUrl = () => {
  let url =
    import.meta.env.VITE_API_URL ||
    import.meta.env.REACT_APP_BACKEND_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    'https://trymebro-backend-production.up.railway.app/api';

  url = url.trim().replace(/\/+$/, '');

  // Ensure endpoint routes have /api prefix
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }

  // Use HTTPS for railway to prevent mixed content issues
  if (url.startsWith('http://') && url.includes('railway.app')) {
    url = url.replace('http://', 'https://');
  }

  return url;
};

const API_BASE_URL = getBaseApiUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('scentvogue_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired, clean up and notify
      if (localStorage.getItem('scentvogue_token')) {
        localStorage.removeItem('scentvogue_token');
        localStorage.removeItem('scentvogue_user');
      }
    }
    return Promise.reject(error);
  }
);

export { API_BASE_URL };
export default api;
