import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => {
    // Support both object and separate parameters
    if (typeof credentials === 'object' && credentials.email) {
      return apiClient.post('/auth/login', credentials);
    }
    return apiClient.post('/auth/login', { email: credentials, password: arguments[1] });
  },
  register: (userData) => {
    if (typeof userData === 'object') {
      return apiClient.post('/auth/register', userData);
    }
    return apiClient.post('/auth/register', { name: userData, email: arguments[1], password: arguments[2] });
  },
  getMe: () => apiClient.get('/auth/me'),
  getProfile: () => apiClient.get('/auth/me'),
};

// Superstore API
export const superstoreAPI = {
  getDashboard: () => apiClient.get('/superstore/dashboard'),
  getOrders: (params) => apiClient.get('/superstore/orders', { params }),
  createOrder: (orderData) => apiClient.post('/superstore/orders', orderData),
  getAvailableProducts: () => apiClient.get('/superstore/products'),
  getSalesAnalytics: () => apiClient.get('/superstore/sales-analytics'),
  getProfitAnalysis: () => apiClient.get('/superstore/profit-analysis'),
};

export default apiClient;
