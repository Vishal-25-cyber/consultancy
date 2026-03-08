import express from 'express';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
  getOrderStats
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getOrders)
  .post(protect, authorize('admin', 'staff'), createOrder);

router.get('/stats/overview', protect, getOrderStats);

router.route('/:id')
  .get(protect, getOrderById)
  .put(protect, authorize('admin', 'staff'), updateOrder)
  .delete(protect, authorize('admin'), deleteOrder);

router.put('/:id/status', protect, authorize('admin', 'staff'), updateOrderStatus);
router.put('/:id/payment', protect, authorize('admin', 'staff'), updatePaymentStatus);

export default router;
