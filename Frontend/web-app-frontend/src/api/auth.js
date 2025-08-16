// src/api/auth.js

import axiosInstance from './axiosConfig';
const API_BASE = '/auth';

// Helper to get token
const getToken = () => localStorage.getItem('token');

// Helper to handle errors
const handleError = (error, fallback) => {
  throw error?.response?.data?.message || error.message || fallback;
};

// Helper to set user/token
const setAuthData = (data) => {
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
};

export const signIn = async (credentials) => {
  try {
  const res = await axiosInstance.post(`${API_BASE}/login`, credentials);
    setAuthData(res.data);
    return res.data;
  } catch (error) {
    handleError(error, 'Failed to sign in');
  }
};

export const signUp = async (userInfo) => {
  try {
    if (!userInfo.aiConfig?.apiKey) throw new Error('API key is required to use this platform');
  // Use '/signup' alias to avoid client-side blockers that target '/register'
  const res = await axiosInstance.post(`${API_BASE}/signup`, userInfo);
    setAuthData(res.data);
    return res.data;
  } catch (error) {
    handleError(error, 'Failed to sign up');
  }
};

export const validateApiKey = async () => {
  try {
  const token = getToken();
  if (!token) throw new Error('No authentication token found');
  const res = await axiosInstance.post(`${API_BASE}/validate-api-key`, {});
    return res.data;
  } catch (error) {
    handleError(error, 'Failed to validate API key');
  }
};

export const updateApiConfig = async (apiConfig) => {
  try {
  const token = getToken();
  if (!token) throw new Error('No authentication token found');
  const res = await axiosInstance.put(`${API_BASE}/api-config`, apiConfig);
    return res.data;
  } catch (error) {
    handleError(error, 'Failed to update API configuration');
  }
};

export const getApiConfig = async () => {
  try {
  const token = getToken();
  if (!token) throw new Error('No authentication token found');
  const res = await axiosInstance.get(`${API_BASE}/me`);
    return res.data.user?.aiConfig || null;
  } catch (error) {
    handleError(error, 'Failed to get API configuration');
  }
};