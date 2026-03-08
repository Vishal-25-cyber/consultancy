import axios from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

// Get ML service health
export const getMLServiceHealth = async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/health`);
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('ML Service health check error:', error.message);
    res.status(503).json({
      success: false,
      message: 'ML service unavailable',
      error: error.message
    });
  }
};

// Predict sales for a product
export const predictSales = async (req, res) => {
  try {
    const { productName, category, region, segment, shipMode, quantity, discount } = req.body;
    
    const response = await axios.post(`${ML_SERVICE_URL}/predict/sales`, {
      productName,
      category,
      region,
      segment,
      shipMode,
      quantity: quantity || 100,
      discount: discount || 0
    });
    
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Sales prediction error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to predict sales',
      error: error.response?.data?.error || error.message
    });
  }
};

// Predict demand for a product
export const predictDemand = async (req, res) => {
  try {
    const { productName, month } = req.body;
    
    const response = await axios.post(`${ML_SERVICE_URL}/predict/demand`, {
      productName,
      month: month || new Date().getMonth() + 1
    });
    
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Demand prediction error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to predict demand',
      error: error.response?.data?.error || error.message
    });
  }
};

// Predict customer segment
export const predictCustomerSegment = async (req, res) => {
  try {
    const { recency, frequency, monetary } = req.body;
    
    const response = await axios.post(`${ML_SERVICE_URL}/predict/customer-segment`, {
      recency,
      frequency,
      monetary
    });
    
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Customer segment prediction error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to predict customer segment',
      error: error.response?.data?.error || error.message
    });
  }
};

// Get next month forecast
export const getNextMonthForecast = async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/forecast/next-month`);
    
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Forecast error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get forecast',
      error: error.response?.data?.error || error.message
    });
  }
};

// Get model information
export const getModelInfo = async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/model/info`);
    
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Model info error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get model information',
      error: error.response?.data?.error || error.message
    });
  }
};
