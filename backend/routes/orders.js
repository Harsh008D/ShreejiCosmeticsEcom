import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Place a new order
router.post('/', protect, async (req, res) => {
  try {
    const { items, status } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items in order.' });
    }
    let total = 0;
    // Check stock and calculate total
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.inStock || product.stockQuantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for product: ${product ? product.name : 'Unknown'}` });
      }
      total += product.price * item.quantity;
    }
    // Subtract stock only if order is confirmed (not pending)
    if (status !== 'pending') {
      for (const item of items) {
        const prod = await Product.findByIdAndUpdate(item.product, { $inc: { stockQuantity: -item.quantity } }, { new: true });
        if (prod) {
          prod.inStock = prod.stockQuantity > 0;
          await prod.save();
        }
      }
    }
    const order = await Order.create({
      user: req.user._id,
      items,
      total,
      status: status === 'pending' ? 'pending' : 'confirmed',
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all orders for the logged-in user
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('items.product');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel an order
router.post('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    if (order.status === 'cancelled') return res.status(400).json({ error: 'Order already cancelled.' });
    // Restore stock (user or admin cancel)
    for (const item of order.items) {
      const prod = await Product.findByIdAndUpdate(item.product, { $inc: { stockQuantity: item.quantity } }, { new: true });
      if (prod) {
        prod.inStock = prod.stockQuantity > 0;
        await prod.save();
      }
    }
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get all orders (with optional status filter)
router.get('/', protect, admin, async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const orders = await Order.find(query).populate('user').populate('items.product');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Confirm a pending order
router.post('/:id/confirm', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    if (order.status !== 'pending') return res.status(400).json({ error: 'Order is not pending.' });
    // Check stock again before confirming
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (!product || !product.inStock || product.stockQuantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for product: ${product ? product.name : 'Unknown'}` });
      }
    }
    // Subtract stock
    for (const item of order.items) {
      const prod = await Product.findByIdAndUpdate(item.product, { $inc: { stockQuantity: -item.quantity } }, { new: true });
      if (prod) {
        prod.inStock = prod.stockQuantity > 0;
        await prod.save();
      }
    }
    order.status = status || 'active';
    await order.save();
    // Populate user and items.product for response
    const populatedOrder = await Order.findById(order._id).populate('user').populate('items.product');
    res.json(populatedOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Cancel a pending order
router.post('/:id/admin-cancel', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    if (order.status === 'cancelled') return res.status(400).json({ error: 'Order already cancelled.' });
    // Only restore stock if not pending
    if (order.status !== 'pending') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stockQuantity: item.quantity } });
      }
    }
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelledByAdmin = true;
    await order.save();
    // Populate user and items.product for response
    const populatedOrder = await Order.findById(order._id).populate('user').populate('items.product');
    res.json({ order: populatedOrder, message: 'You didn\'t send WhatsApp message for order confirmation.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Mark order as delivered
router.post('/:id/deliver', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    if (order.status === 'delivered') return res.status(400).json({ error: 'Order already delivered.' });
    order.status = 'delivered';
    order.deliveredAt = new Date();
    order.deliveredByAdmin = true;
    await order.save();
    // Populate user and items.product for response
    const populatedOrder = await Order.findById(order._id).populate('user').populate('items.product');
    res.json(populatedOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router; 