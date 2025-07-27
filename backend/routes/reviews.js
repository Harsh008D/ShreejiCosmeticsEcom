import express from 'express';
import Review from '../models/Review.js';
import { protect } from '../middleware/auth.js';
import Product from '../models/Product.js';

const router = express.Router();

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// Add a review (requires authentication)
router.post('/', protect, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    
    if (!productId || !rating || !comment) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    // ALLOW MULTIPLE REVIEWS PER USER PER PRODUCT (no check for existing review)
    const review = new Review({
      product: productId,
      user: req.user._id,
      rating,
      comment
    });
    
    await review.save();
    // Populate user info for response
    await review.populate('user', 'name');

    // --- Update product rating and numReviews ---
    const reviews = await Review.find({ product: productId });
    const numReviews = reviews.length;
    const avgRating = numReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews : 0;
    await Product.findByIdAndUpdate(productId, { rating: avgRating, numReviews });
    // --- End update ---

    res.status(201).json(review);
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Error adding review' });
  }
});

// Update a review (requires authentication and ownership)
router.put('/:reviewId', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating || !comment) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user owns the review or is admin
    if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }
    
    review.rating = rating;
    review.comment = comment;
    
    await review.save();
    
    // Populate user info for response
    await review.populate('user', 'name');
    
    res.json(review);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Error updating review' });
  }
});

// Delete a review (requires authentication and ownership or admin)
router.delete('/:reviewId', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user owns the review or is admin
    if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }
    
    await Review.findByIdAndDelete(req.params.reviewId);
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Error deleting review' });
  }
});

export default router; 