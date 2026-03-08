import express from 'express';
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle
} from '../controllers/vehicleController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getVehicles)
  .post(protect, authorize('admin', 'staff'), createVehicle);

router.route('/:id')
  .get(protect, getVehicleById)
  .put(protect, authorize('admin', 'staff'), updateVehicle)
  .delete(protect, authorize('admin'), deleteVehicle);

export default router;
