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

// ── Response interceptor — handle 401, auto-retry cold-starts, & format network errors ──
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('careercast_token');
      localStorage.removeItem('careercast_user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Auto-retry once or twice for cold starts / temporary 502/503 network drops
    if (config && (!error.response || [502, 503, 504].includes(error.response?.status))) {
      config._retryCount = config._retryCount || 0;
      if (config._retryCount < 2) {
        config._retryCount += 1;
        console.log(`[API Interceptor] Retrying request due to network drop / cold-start (Attempt ${config._retryCount}/2)...`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return api(config);
      }
    }

    // Format generic "Network Error" into a clear, actionable user message
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK' || !error.response) {
      error.userFriendlyMessage =
        'Backend server connection issue. If using Render free hosting, the server may be spinning up from a cold start (~30s delay) or memory pressure occurred. Please wait a moment and try again.';
    } else if (error.response?.data?.detail) {
      const detail = error.response.data.detail;
      error.userFriendlyMessage = typeof detail === 'string' ? detail : JSON.stringify(detail);
    } else {
      error.userFriendlyMessage = error.message || 'An unexpected API error occurred.';
    }

    return Promise.reject(error);
  }
);

export default api;
