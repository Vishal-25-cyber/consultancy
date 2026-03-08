import express from 'express';
import { 
  getDashboardOverview, 
  getOrders, 
  getSalesAnalytics, 
  getProfitAnalysis,
  createOrder,
  getAvailableProducts,
  getProductAnalytics,
  getCustomerAnalytics
} from '../controllers/superstoreController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Dashboard overview
router.get('/dashboard', getDashboardOverview);

// Orders
router.get('/orders', getOrders);
router.post('/orders', createOrder);

// Products
router.get('/products', getAvailableProducts);

// Analytics
router.get('/sales-analytics', getSalesAnalytics);
router.get('/profit-analysis', getProfitAnalysis);
router.get('/product-analytics', getProductAnalytics);
router.get('/customer-analytics', getCustomerAnalytics);

export default router;
