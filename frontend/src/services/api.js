// services/api.js
// Axios instance with base URL, auth interceptor, and error handling.

import axios from 'axios';

const getBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  const hostname = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : '127.0.0.1';
  return `http://${hostname}:8000/api/v1`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 120000, // 120 seconds timeout for ML model inference and resume parsing
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
