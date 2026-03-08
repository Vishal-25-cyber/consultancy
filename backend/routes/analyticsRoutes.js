import express from 'express';
import {
  getDashboardOverview,
  getSalesTrend,
  getTopProducts,
  getRevenueByCategory,
  getCustomerAnalytics,
  getDeliveryPerformance,
  getInventoryAnalytics,
  getSalesByRegion,
  getProductPerformance,
  getProfitabilityAnalysis
} from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All analytics routes are admin-only
router.use(protect);
router.use(authorize('admin', 'staff'));

router.get('/dashboard', getDashboardOverview);
router.get('/sales-trend', getSalesTrend);
router.get('/top-products', getTopProducts);
router.get('/revenue-by-category', getRevenueByCategory);
router.get('/customer-analytics', getCustomerAnalytics);
router.get('/delivery-performance', getDeliveryPerformance);
router.get('/inventory-analytics', getInventoryAnalytics);
router.get('/sales-by-region', getSalesByRegion);
router.get('/product-performance', getProductPerformance);
router.get('/profitability', getProfitabilityAnalysis);

export default router;
