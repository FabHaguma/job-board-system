import axios from 'axios';

// Optional callbacks registered by the app (set in store.js) to avoid circular deps
let onUnauthorized;
export const registerUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

const api = axios.create({
  baseURL: '/api', // Proxied by Vite to the backend
  timeout: 10000, // 10 second timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject({
      message: 'Request configuration failed',
      originalError: error
    });
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorResponse = {
      message: 'An unexpected error occurred',
      status: error.response?.status,
      data: error.response?.data
    };

    if (error.code === 'ECONNABORTED') {
      errorResponse.message = 'Request timeout. Please try again.';
    } else if (error.response?.status === 401) {
      errorResponse.message = 'Session expired. Please login again.';
      // Auto logout on 401 (delegated to registered handler to avoid circular import)
      try { localStorage.removeItem('token'); } catch { /* ignore */ }
      if (onUnauthorized) onUnauthorized();
    } else if (error.response?.status === 403) {
      errorResponse.message = 'Access denied. You don\'t have permission.';
    } else if (error.response?.status === 404) {
      errorResponse.message = 'Resource not found.';
    } else if (error.response?.status >= 500) {
      errorResponse.message = 'Server error. Please try again later.';
    } else if (error.response?.data?.message) {
      errorResponse.message = error.response.data.message;
    }

    return Promise.reject(errorResponse);
  }
);

export default api;