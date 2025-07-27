import express from 'express';
import { body, validationResult } from 'express-validator';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// Helper to update product rating and numReviews
async function updateProductRating(productId) {
  try {
    // Try both string and ObjectId for maximum compatibility
    const pidStr = typeof productId === 'string' ? productId : productId.toString();
    let pidObj;
    try { pidObj = mongoose.Types.ObjectId(pidStr); } catch (e) { pidObj = null; }
    let reviews = await Review.find({ product: pidStr });
    if (reviews.length === 0 && pidObj) {
      reviews = await Review.find({ product: pidObj });
    }
    const numReviews = reviews.length;
    let rating = 0;
    if (numReviews > 0) {
      rating = reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews;
    }
    // Try update with string id
    let result = await Product.findByIdAndUpdate(pidStr, { rating, numReviews }, { new: true });
    if (!result && pidObj) {
      // Try update with ObjectId
      result = await Product.findByIdAndUpdate(pidObj, { rating, numReviews }, { new: true });
    }
    // Force fetch to ensure update
    let updated = await Product.findById(pidStr);
    if (!updated && pidObj) {
      updated = await Product.findById(pidObj);
    }
    if (!updated) {
      console.warn('[updateProductRating] Product not found after update', { pidStr, pidObj });
    } else if (typeof updated.rating === 'undefined' || typeof updated.numReviews === 'undefined') {
      updated.rating = 0;
      updated.numReviews = 0;
      await updated.save();
      console.warn('[updateProductRating] Patched missing fields', { pidStr, pidObj });
    }
    console.log('[updateProductRating] Summary:', { pidStr, pidObj, numReviews, rating, updated });
  } catch (err) {
    console.error('[updateProductRating] Error:', err);
  }
}

// Get all reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

// Add a review (auth required)
router.post('/product/:productId', protect, [
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').isLength({ min: 3, max: 1000 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    // Always store product as string
    const review = new Review({ product: product._id.toString(), user: req.user._id, rating, comment });
    await review.save();
    await updateProductRating(product._id);
    await updateProductRating(product._id.toString());
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add review' });
  }
});

// Edit a review (auth, only owner)
router.put('/:reviewId', protect, [
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').isLength({ min: 3, max: 1000 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this review' });
    }
    review.rating = req.body.rating;
    review.comment = req.body.comment;
    await review.save();
    await updateProductRating(review.product);
    await updateProductRating(review.product.toString());
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update review' });
  }
});

// Delete a review (auth, only owner or admin)
router.delete('/:reviewId', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }
    const productId = review.product;
    await review.deleteOne();
    await updateProductRating(productId);
    await updateProductRating(productId.toString());
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete review' });
  }
});

export default router; 