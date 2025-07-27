import express from 'express';
import { body, validationResult } from 'express-validator';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
    
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }
    
    res.json(wishlist);
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
router.post('/', protect, [
  body('productId').isMongoId().withMessage('Valid product ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { productId } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    // Check if product is already in wishlist
    if (wishlist.hasProduct(productId)) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    await wishlist.addProduct(productId);
    await wishlist.populate('products');
    
    res.json(wishlist);
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
router.delete('/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    await wishlist.removeProduct(productId);
    await wishlist.populate('products');
    
    res.json(wishlist);
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    await wishlist.clearWishlist();
    
    res.json({ message: 'Wishlist cleared successfully' });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
router.get('/check/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      return res.json({ inWishlist: false });
    }

    const inWishlist = wishlist.hasProduct(productId);
    
    res.json({ inWishlist });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 