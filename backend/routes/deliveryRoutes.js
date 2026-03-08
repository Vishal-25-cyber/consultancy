import express from 'express';
import {
  getDeliveries,
  getDeliveryById,
  createDelivery,
  updateDelivery,
  updateDeliveryStatus,
  deleteDelivery,
  getDeliveryStats
} from '../controllers/deliveryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getDeliveries)
  .post(protect, authorize('admin', 'staff'), createDelivery);

router.get('/stats/overview', protect, getDeliveryStats);

router.route('/:id')
  .get(protect, getDeliveryById)
  .put(protect, authorize('admin', 'staff'), updateDelivery)
  .delete(protect, authorize('admin'), deleteDelivery);

router.put('/:id/status', protect, authorize('admin', 'staff'), updateDeliveryStatus);

export default router;
