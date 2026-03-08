import express from 'express';
import {
  getDailySalesReport,
  getMonthlySalesReport,
  getInventoryReport,
  getDeliveryPerformanceReport,
  getCustomerReport,
  getProfitLossReport
} from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All report routes are admin/staff only
router.use(protect);
router.use(authorize('admin', 'staff'));

router.get('/daily-sales', getDailySalesReport);
router.get('/monthly-sales', getMonthlySalesReport);
router.get('/inventory', getInventoryReport);
router.get('/delivery-performance', getDeliveryPerformanceReport);
router.get('/customer', getCustomerReport);
router.get('/profit-loss', getProfitLossReport);

export default router;
