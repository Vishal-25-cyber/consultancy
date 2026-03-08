import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  transactionType: {
    type: String,
    enum: ['stock-in', 'stock-out', 'adjustment', 'return'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  stockBefore: {
    type: Number,
    required: true
  },
  stockAfter: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    trim: true
  },
  referenceType: {
    type: String,
    enum: ['purchase', 'sale', 'adjustment', 'return', 'damaged', 'expired']
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  warehouse: {
    type: String,
    default: 'Main Warehouse'
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for better query performance
inventorySchema.index({ product: 1, createdAt: -1 });

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;
