import axios from 'axios';
import { API_URL } from '../config/constants';
import { storage } from '../utils/storage';

// Debug: Log API URL
console.log('API_URL configured as:', API_URL);

// In-memory token cache to avoid async storage delays
let tokenCache = null;

/**
 * Set token in cache (called after login/register)
 */
export const setTokenCache = (token) => {
  tokenCache = token;
};

/**
 * Clear token cache (called on logout)
 */
export const clearTokenCache = () => {
  tokenCache = null;
};

/**
 * Axios instance with base configuration
 */
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to add auth token
 */
api.interceptors.request.use(
  async (config) => {
    try {
      // First try the in-memory cache for immediate availability
      let token = tokenCache;
      console.log('Token from cache:', token ? 'YES' : 'NO');

      // If not in cache, get from storage
      if (!token) {
        token = await storage.get('token');
        console.log('Token from storage:', token ? 'YES' : 'NO');
        if (token) {
          tokenCache = token; // Cache it for next time
        }
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Authorization header set');
      } else {
        console.log('No token available for request');
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle errors
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Clear storage and redirect to login
        await storage.remove('token');
        await storage.remove('user');

        // You can dispatch a logout action here if needed
        // store.dispatch(logout());

        return Promise.reject(error);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    // Handle network errors
    if (!error.response) {
      error.message = 'Network error. Please check your internet connection.';
    }

    // Handle server errors
    if (error.response?.status >= 500) {
      error.message = 'Server error. Please try again later.';
    }

    return Promise.reject(error);
  }
);

/**
 * Upload file helper
 * @param {string} endpoint - API endpoint
 * @param {FormData} formData - Form data with file
 * @param {Function} onProgress - Progress callback
 */
export const uploadFile = async (endpoint, formData, onProgress) => {
  const token = await storage.get('token');

  return axios.post(`${API_URL}${endpoint}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });
};

export default api;
