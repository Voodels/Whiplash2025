// src/api/axiosConfig.js

import axios from 'axios';

// Prefer env var, fallback to localhost API
const API_URL =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_REACT_APP_API_BASE ||
  // Default to Vite proxy path to avoid ad blockers and CORS during dev
  '/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor for adding auth token (both styles for compatibility)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling token expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to registration (this app uses register as entry)
      window.location.href = '/register';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;