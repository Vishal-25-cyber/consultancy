import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getMLServiceHealth,
  predictSales,
  predictDemand,
  predictCustomerSegment,
  getNextMonthForecast,
  getModelInfo
} from '../controllers/mlController.js';

const router = express.Router();

// Public routes (no auth required for ML predictions)
router.get('/health', getMLServiceHealth);
router.post('/predict/sales', predictSales);
router.post('/predict/demand', predictDemand);
router.post('/predict/customer-segment', predictCustomerSegment);
router.get('/forecast/next-month', getNextMonthForecast);
router.get('/model/info', getModelInfo);

export default router;
