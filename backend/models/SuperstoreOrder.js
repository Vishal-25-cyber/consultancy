import mongoose from 'mongoose';

// Superstore Dataset Schema
const superstoreOrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  orderDate: {
    type: Date,
    required: true
  },
  shipDate: {
    type: Date,
    required: true
  },
  shipMode: {
    type: String,
    enum: ['Standard Class', 'Second Class', 'First Class', 'Same Day'],
    required: true
  },
  customerId: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  segment: {
    type: String,
    enum: ['Consumer', 'Corporate', 'Home Office'],
    required: true
  },
  country: {
    type: String,
    default: 'United States'
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  postalCode: {
    type: String,
    required: true
  },
  region: {
    type: String,
    enum: ['East', 'West', 'Central', 'South'],
    required: true
  },
  productId: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Furniture', 'Office Supplies', 'Technology'],
    required: true
  },
  subCategory: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  sales: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  },
  profit: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
superstoreOrderSchema.index({ orderId: 1 });
superstoreOrderSchema.index({ orderDate: -1 });
superstoreOrderSchema.index({ category: 1 });
superstoreOrderSchema.index({ region: 1 });
superstoreOrderSchema.index({ segment: 1 });
superstoreOrderSchema.index({ customerId: 1 });

export default mongoose.model('SuperstoreOrder', superstoreOrderSchema);
