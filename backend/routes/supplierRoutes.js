import express from 'express';
import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
} from '../controllers/supplierController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getSuppliers)
  .post(protect, authorize('admin', 'staff'), createSupplier);

router.route('/:id')
  .get(protect, getSupplierById)
  .put(protect, authorize('admin', 'staff'), updateSupplier)
  .delete(protect, authorize('admin'), deleteSupplier);

export default router;
