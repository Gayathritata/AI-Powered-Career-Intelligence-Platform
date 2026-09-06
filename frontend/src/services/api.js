// services/api.js
// Axios instance with base URL, auth interceptor, and error handling.

import axios from 'axios';

const getBaseUrl = () => {
  let url = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.trim() : '';
  if (!url) {
    const hostname = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : '127.0.0.1';
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `http://${hostname}:8000/api/v1`;
    }
    return 'https://ai-powered-career-intelligence-platform-teik.onrender.com/api/v1';
  }
  url = url.replace(/\/+$/, '');
  if (!url.endsWith('/api/v1')) {
    url = `${url}/api/v1`;
  }
  return url;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 300000, // 300 seconds timeout for cloud cold-starts, ML model inference and resume parsing
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor — inject Bearer token ──────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('careercast_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle 401 globally ─────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid → clear storage and redirect to login
      localStorage.removeItem('careercast_token');
      localStorage.removeItem('careercast_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
