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
  (response) => {
    // If request succeeded after cold-start retries, notify listeners that server is online
    if (response.config?._retryCount > 0) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('careercast_cold_start_resolved'));
      }
    }
    return response;
  },
  async (error) => {
    const config = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('careercast_token');
      localStorage.removeItem('careercast_user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Auto-retry up to 8 times for cold starts / temporary 502/503/504 network drops (covering Render ~30s spin-up window)
    const isNetworkOrColdStart = !error.response || [502, 503, 504].includes(error.response?.status) || error.code === 'ERR_NETWORK' || error.message === 'Network Error';
    
    if (config && isNetworkOrColdStart) {
      config._retryCount = config._retryCount || 0;
      const MAX_RETRIES = 8;

      if (config._retryCount < MAX_RETRIES) {
        config._retryCount += 1;
        const delayMs = 4000; // 4 seconds interval -> total window = 32 seconds
        
        console.log(`[API Interceptor] Retrying request due to cloud cold-start (Attempt ${config._retryCount}/${MAX_RETRIES}). Waiting ${delayMs}ms...`);
        
        // Notify UI components that a cold start retry is currently in progress
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('careercast_cold_start', {
              detail: { attempt: config._retryCount, maxAttempts: MAX_RETRIES, delayMs }
            })
          );
        }

        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return api(config);
      }
    }

    // Notify UI components if cold start retries exhausted
    if (typeof window !== 'undefined' && config?._retryCount >= 8) {
      window.dispatchEvent(new CustomEvent('careercast_cold_start_failed'));
    }

    // Format generic "Network Error" into a clear, actionable user message
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK' || !error.response) {
      error.userFriendlyMessage =
        'Backend server connection issue. If using Render free hosting, the server may be spinning up from a cold start (~30s delay) or memory pressure occurred. Please wait a moment and click Retry.';
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
