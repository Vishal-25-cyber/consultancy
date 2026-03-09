import axios from 'axios';

const API_URL = 'http://localhost:5000/api/ml';

// Get auth token
const getAuthToken = () => localStorage.getItem('token');

// Configure axios with auth
const axiosConfig = () => ({
  headers: {
    Authorization: `Bearer ${getAuthToken()}`
  }
});

export const mlApi = {
  // Check ML service health
  checkHealth: async () => {
    const response = await axios.get(`${API_URL}/health`);
    return response.data;
  },

  // Predict sales
  predictSales: async (data) => {
    const response = await axios.post(`${API_URL}/predict/sales`, data, axiosConfig());
    return response.data;
  },

  // Predict demand
  predictDemand: async (data) => {
    const response = await axios.post(`${API_URL}/predict/demand`, data, axiosConfig());
    return response.data;
  },

  // Predict customer segment
  predictCustomerSegment: async (data) => {
    const response = await axios.post(`${API_URL}/predict/customer-segment`, data, axiosConfig());
    return response.data;
  },

  // Get next month forecast
  getNextMonthForecast: async () => {
    const response = await axios.get(`${API_URL}/forecast/next-month`, axiosConfig());
    return response.data;
  },

  // Get model info
  getModelInfo: async () => {
    const response = await axios.get(`${API_URL}/model/info`, axiosConfig());
    return response.data;
  }
};
