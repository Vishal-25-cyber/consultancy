import mongoose from 'mongoose';

const stockAlertSchema = new mongoose.Schema({
  productName:      { type: String, required: true },
  category:         { type: String, default: '' },
  subCategory:      { type: String, default: '' },
  attemptedQty:     { type: Number, required: true },
  availableStock:   { type: Number, required: true },
  reason:           { type: String, enum: ['out_of_stock', 'insufficient_stock'], required: true },
  requestedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestedByName:  { type: String, default: '' },
  dismissed:        { type: Boolean, default: false },
}, { timestamps: true });

const StockAlert = mongoose.model('StockAlert', stockAlertSchema);
export default StockAlert;
