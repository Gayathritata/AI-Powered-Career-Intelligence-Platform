// services/authService.js
// All authentication-related API calls.

import api from './api';

const authService = {
  /**
   * Register a new user.
   * @param {{ name: string, email: string, password: string }} data
   */
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  /**
   * Login with email and password.
   * Stores the JWT token and user info in localStorage on success.
   * @param {{ email: string, password: string }} credentials
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { access_token, user } = response.data;
    localStorage.setItem('careercast_token', access_token);
    localStorage.setItem('careercast_user', JSON.stringify(user));
    return response.data;
  },

  /**
   * Fetch the currently authenticated user's details.
   */
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Log out — remove token and user info from localStorage.
   */
  logout: () => {
    localStorage.removeItem('careercast_token');
    localStorage.removeItem('careercast_user');
  },

  /**
   * Return the stored user object (parsed from localStorage).
   */
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('careercast_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  /**
   * Return true if a token is present in localStorage.
   */
  isAuthenticated: () => {
    return Boolean(localStorage.getItem('careercast_token'));
  },
};

export default authService;
