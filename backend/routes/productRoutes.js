import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getProducts)
  .post(protect, authorize('admin', 'staff'), createProduct);

router.get('/alerts/low-stock', protect, authorize('admin', 'staff'), getLowStockProducts);

router.route('/:id')
  .get(protect, getProductById)
  .put(protect, authorize('admin', 'staff'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

export default router;
