import express from 'express';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../controllers/customerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getCustomers)
  .post(protect, authorize('admin', 'staff'), createCustomer);

router.route('/:id')
  .get(protect, getCustomerById)
  .put(protect, authorize('admin', 'staff'), updateCustomer)
  .delete(protect, authorize('admin'), deleteCustomer);

export default router;
