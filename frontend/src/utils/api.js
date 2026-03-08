import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
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

// Response interceptor to handle errors
api.interceptors.response.use(
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

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Product APIs
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getLowStock: () => api.get('/products/alerts/low-stock'),
};

// Category APIs
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Supplier APIs
export const supplierAPI = {
  getAll: (params) => api.get('/suppliers', { params }),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
};

// Customer APIs
export const customerAPI = {
  getAll: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
};

// Vehicle APIs
export const vehicleAPI = {
  getAll: (params) => api.get('/vehicles', { params }),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

// Order APIs
export const orderAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { orderStatus: status }),
  updatePayment: (id, data) => api.put(`/orders/${id}/payment`, data),
  getStats: () => api.get('/orders/stats/overview'),
};

// Delivery APIs
export const deliveryAPI = {
  getAll: (params) => api.get('/deliveries', { params }),
  getById: (id) => api.get(`/deliveries/${id}`),
  create: (data) => api.post('/deliveries', data),
  update: (id, data) => api.put(`/deliveries/${id}`, data),
  delete: (id) => api.delete(`/deliveries/${id}`),
  updateStatus: (id, data) => api.put(`/deliveries/${id}/status`, data),
  getStats: () => api.get('/deliveries/stats/overview'),
};

// Inventory APIs
export const inventoryAPI = {
  getTransactions: (params) => api.get('/inventory', { params }),
  addStock: (data) => api.post('/inventory/stock-in', data),
  removeStock: (data) => api.post('/inventory/stock-out', data),
  getSummary: () => api.get('/inventory/summary'),
};

// Analytics APIs
export const analyticsAPI = {
  getDashboard: (params) => api.get('/analytics/dashboard', { params }),
  getSalesTrend: (params) => api.get('/analytics/sales-trend', { params }),
  getTopProducts: (params) => api.get('/analytics/top-products', { params }),
  getRevenueByCategory: (params) => api.get('/analytics/revenue-by-category', { params }),
  getCustomerAnalytics: (params) => api.get('/analytics/customer-analytics', { params }),
  getDeliveryPerformance: (params) => api.get('/analytics/delivery-performance', { params }),
  getInventoryAnalytics: () => api.get('/analytics/inventory-analytics'),
  getSalesByRegion: (params) => api.get('/analytics/sales-by-region', { params }),
  getProductPerformance: () => api.get('/analytics/product-performance'),
  getProfitability: (params) => api.get('/analytics/profitability', { params }),
};

// Report APIs
export const reportAPI = {
  getDailySales: (params) => api.get('/reports/daily-sales', { params }),
  getMonthlySales: (params) => api.get('/reports/monthly-sales', { params }),
  getInventory: (params) => api.get('/reports/inventory', { params }),
  getDeliveryPerformance: (params) => api.get('/reports/delivery-performance', { params }),
  getCustomer: (params) => api.get('/reports/customer', { params }),
  getProfitLoss: (params) => api.get('/reports/profit-loss', { params }),
};

export default api;
