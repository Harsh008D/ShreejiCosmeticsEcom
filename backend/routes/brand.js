import express from 'express';
import { body, validationResult } from 'express-validator';
import BrandInfo from '../models/BrandInfo.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get brand info
// @route   GET /api/brand
// @access  Public
router.get('/', async (req, res) => {
  try {
    const brandInfo = await BrandInfo.findOne();
    
    if (brandInfo) {
      res.json(brandInfo);
    } else {
      res.status(404).json({ message: 'Brand info not found' });
    }
  } catch (error) {
    console.error('Get brand info error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create brand info
// @route   POST /api/brand
// @access  Private/Admin
router.post('/', protect, admin, [
  body('name').trim().isLength({ min: 2 }).withMessage('Brand name is required'),
  body('tagline').trim().isLength({ min: 5 }).withMessage('Tagline is required'),
  body('description').trim().isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').trim().isLength({ min: 10 }).withMessage('Phone number is required'),
  body('address').trim().isLength({ min: 10 }).withMessage('Address is required'),
  body('whatsapp').trim().isLength({ min: 10 }).withMessage('WhatsApp number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    // Check if brand info already exists
    const existingBrand = await BrandInfo.findOne();
    if (existingBrand) {
      return res.status(400).json({ message: 'Brand info already exists. Use PUT to update.' });
    }

    const brandInfo = new BrandInfo(req.body);
    const createdBrand = await brandInfo.save();
    
    res.status(201).json(createdBrand);
  } catch (error) {
    console.error('Create brand info error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update brand info
// @route   PUT /api/brand
// @access  Private/Admin
router.put('/', protect, admin, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Brand name must be at least 2 characters'),
  body('tagline').optional().trim().isLength({ min: 5 }).withMessage('Tagline must be at least 5 characters'),
  body('description').optional().trim().isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().trim().isLength({ min: 10 }).withMessage('Phone number must be at least 10 characters'),
  body('address').optional().trim().isLength({ min: 10 }).withMessage('Address must be at least 10 characters'),
  body('whatsapp').optional().trim().isLength({ min: 10 }).withMessage('WhatsApp number must be at least 10 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const brandInfo = await BrandInfo.findOne();
    
    if (brandInfo) {
      Object.assign(brandInfo, req.body);
      const updatedBrand = await brandInfo.save();
      res.json(updatedBrand);
    } else {
      res.status(404).json({ message: 'Brand info not found' });
    }
  } catch (error) {
    console.error('Update brand info error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 