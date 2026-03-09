import mongoose from 'mongoose';

const productStockSchema = new mongoose.Schema({
  productName: { type: String, required: true, unique: true },
  category:    { type: String, default: '' },
  subCategory: { type: String, default: '' },
  currentStock:  { type: Number, default: 0, min: 0 },
  reorderLevel:  { type: Number, default: 50 },  // alert threshold
  lastRestockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  lastRestockedAt: { type: Date, default: null },
}, { timestamps: true });

productStockSchema.index({ productName: 1 });
productStockSchema.index({ currentStock: 1 });

const ProductStock = mongoose.model('ProductStock', productStockSchema);
export default ProductStock;
