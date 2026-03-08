import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  deliveryNumber: {
    type: String,
    required: true,
    unique: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  driver: {
    name: String,
    phone: String
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  actualDeliveryDate: {
    type: Date
  },
  deliveryStatus: {
    type: String,
    enum: ['pending', 'assigned', 'in-transit', 'delivered', 'failed', 'returned'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  notes: {
    type: String,
    trim: true
  },
  failureReason: {
    type: String,
    trim: true
  },
  deliveryProof: {
    type: String,
    trim: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Auto-generate delivery number
deliverySchema.pre('save', async function(next) {
  if (this.isNew && !this.deliveryNumber) {
    const count = await mongoose.model('Delivery').countDocuments();
    this.deliveryNumber = `DEL-${Date.now()}-${count + 1}`;
  }
  next();
});

// Index for performance
deliverySchema.index({ deliveryNumber: 1 });
deliverySchema.index({ deliveryStatus: 1 });
deliverySchema.index({ scheduledDate: -1 });

const Delivery = mongoose.model('Delivery', deliverySchema);

export default Delivery;
