import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'active', 'confirmed', 'cancelled', 'delivered'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  cancelledAt: { type: Date },
  deliveredAt: { type: Date },
  cancelledByAdmin: { type: Boolean, default: false },
  deliveredByAdmin: { type: Boolean, default: false },
});

export default mongoose.model('Order', orderSchema); 