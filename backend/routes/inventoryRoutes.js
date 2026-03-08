import express from 'express';
import {
  getInventoryTransactions,
  addStock,
  removeStock,
  getStockSummary
} from '../controllers/inventoryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getInventoryTransactions);
router.get('/summary', protect, getStockSummary);
router.post('/stock-in', protect, authorize('admin', 'staff'), addStock);
router.post('/stock-out', protect, authorize('admin', 'staff'), removeStock);

export default router;
