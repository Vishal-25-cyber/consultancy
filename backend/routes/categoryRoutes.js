import express from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getCategories)
  .post(protect, authorize('admin', 'staff'), createCategory);

router.route('/:id')
  .get(protect, getCategoryById)
  .put(protect, authorize('admin', 'staff'), updateCategory)
  .delete(protect, authorize('admin'), deleteCategory);

export default router;
