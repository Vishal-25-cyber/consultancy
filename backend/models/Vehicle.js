import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  vehicleNumber: {
    type: String,
    required: [true, 'Vehicle number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ['truck', 'van', 'mini-truck', 'bike', 'tempo']
  },
  model: {
    type: String,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    comment: 'Capacity in kg or cubic meters'
  },
  driver: {
    name: String,
    phone: String,
    license: String
  },
  status: {
    type: String,
    enum: ['available', 'in-transit', 'maintenance', 'inactive'],
    default: 'available'
  },
  lastMaintenanceDate: {
    type: Date
  },
  nextMaintenanceDate: {
    type: Date
  },
  fuelType: {
    type: String,
    enum: ['petrol', 'diesel', 'cng', 'electric']
  }
}, {
  timestamps: true
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;
