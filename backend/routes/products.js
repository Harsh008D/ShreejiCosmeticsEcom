import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get('/', [
  query('category').optional().isString().trim(),
  query('featured').optional().isIn(['true', 'false']),
  query('inStock').optional().isIn(['true', 'false']),
  query('search').optional().isString().trim().isLength({ max: 100 }),
  query('sort').optional().isIn(['name', 'price', 'createdAt', 'rating']),
  query('order').optional().isIn(['asc', 'desc']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('page').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Invalid query parameters', 
        errors: errors.array() 
      });
    }

    const { 
      category, 
      featured, 
      inStock, 
      search, 
      sort = 'name',
      order = 'asc',
      limit = 20,
      page = 1
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (category && category !== 'All') {
      filter.category = category;
    }
    
    if (featured !== undefined) {
      filter.featured = featured === 'true';
    }
    
    if (inStock !== undefined) {
      filter.inStock = inStock === 'true';
    }
    
    if (search) {
      // Use text search if available, otherwise use regex
      if (Product.collection.getIndexes().hasOwnProperty('name_text_description_text')) {
        filter.$text = { $search: search };
      } else {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
    }

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(filter)
      .sort(sortObj)
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ 
      featured: true, 
      inStock: true 
    })
    .limit(6)
    .sort({ createdAt: -1 })
    .lean();
    
    res.json(products);
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ message: 'Failed to fetch featured products' });
  }
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || id.length !== 24) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }

    const product = await Product.findById(id).lean();
    
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Get product error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, admin, [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('price')
    .isFloat({ min: 0, max: 10000 })
    .withMessage('Price must be a positive number between 0 and 10000'),
  // Custom validator for image field
  body('image')
    .custom((value, { req }) => {
      // If images is missing or empty, image must be a valid URL
      if (!req.body.images || !Array.isArray(req.body.images) || req.body.images.length === 0) {
        if (!value || typeof value !== 'string' || !/^https?:\/\//.test(value)) {
          throw new Error('Valid image URL is required if no images are uploaded');
        }
      }
      // If images is present and not empty, image can be empty or missing
      return true;
    }),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('images.*.url')
    .optional()
    .isURL()
    .withMessage('Each image URL must be valid'),
  body('images.*.publicId')
    .optional()
    .isString()
    .withMessage('Each image must have a public ID'),
  body('images.*.isThumbnail')
    .optional()
    .isBoolean()
    .withMessage('isThumbnail must be a boolean'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('category')
    .isIn(['Face Care', 'Hair Care', 'Body Care', 'Lip Care', 'Other'])
    .withMessage('Invalid category'),
  body('ingredients')
    .isArray({ min: 1, max: 50 })
    .withMessage('At least one ingredient is required (max 50)'),
  body('ingredients.*')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Each ingredient must be between 1 and 100 characters'),
  body('usage')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Usage instructions must be between 10 and 1000 characters'),
  body('stockQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean value')
], async (req, res) => {
  try {
    console.log('Product creation request received:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    // Check if product with same name already exists
    const existingProduct = await Product.findOne({ 
      name: { $regex: new RegExp(`^${req.body.name}$`, 'i') } 
    });
    
    if (existingProduct) {
      console.log('Product with same name already exists:', req.body.name);
      return res.status(409).json({ 
        message: 'A product with this name already exists' 
      });
    }

    console.log('Creating new product with data:', req.body);
    const product = new Product(req.body);
    
    // On create
    if (typeof product.stockQuantity === 'number') {
      product.inStock = product.stockQuantity > 0;
    }
    
    console.log('Product object before save:', product);
    const createdProduct = await product.save();
    console.log('Product created successfully:', createdProduct._id);
    
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Create product error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A product with this name already exists' });
    }
    
    res.status(500).json({ 
      message: 'Failed to create product',
      error: error.message,
      details: {
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      }
    });
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, admin, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0, max: 10000 })
    .withMessage('Price must be a positive number between 0 and 10000'),
  body('image')
    .optional()
    .trim()
    .isURL()
    .withMessage('Image URL must be valid when provided'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('images.*.url')
    .optional()
    .isURL()
    .withMessage('Each image URL must be valid'),
  body('images.*.publicId')
    .optional()
    .isString()
    .withMessage('Each image must have a public ID'),
  body('images.*.isThumbnail')
    .optional()
    .isBoolean()
    .withMessage('isThumbnail must be a boolean'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('category')
    .optional()
    .isIn(['Face Care', 'Hair Care', 'Body Care', 'Lip Care', 'Other'])
    .withMessage('Invalid category'),
  body('ingredients')
    .optional()
    .isArray({ min: 1, max: 50 })
    .withMessage('At least one ingredient is required (max 50)'),
  body('ingredients.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Each ingredient must be between 1 and 100 characters'),
  body('usage')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Usage instructions must be between 10 and 1000 characters'),
  body('stockQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean value')
], async (req, res) => {
  try {
    console.log('--- Product Update Request ---');
    console.log('Product ID:', req.params.id);
    console.log('Payload:', JSON.stringify(req.body, null, 2));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    
    if (!id || id.length !== 24) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }

    const product = await Product.findById(id);
    
    if (!product) {
      console.log('Product not found for update:', id);
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if name is being updated and if it conflicts with existing product
    if (req.body.name && req.body.name !== product.name) {
      const existingProduct = await Product.findOne({ 
        name: { $regex: new RegExp(`^${req.body.name}$`, 'i') },
        _id: { $ne: id }
      });
      
      if (existingProduct) {
        console.log('Duplicate product name detected:', req.body.name);
        return res.status(409).json({ 
          message: 'A product with this name already exists' 
        });
      }
    }

    // Update only the fields that are provided in the request
    const updateFields = req.body;
    
    // If images are not provided in the update, preserve existing images
    if (!updateFields.images && !updateFields.image) {
      delete updateFields.images;
      delete updateFields.image;
    }
    
    Object.assign(product, updateFields);
    
    // On update
    if (typeof product.stockQuantity === 'number') {
      product.inStock = product.stockQuantity > 0;
    }
    const updatedProduct = await product.save();
    console.log('Product updated successfully:', updatedProduct._id);
    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A product with this name already exists' });
    }
    res.status(500).json({ message: 'Failed to update product' });
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || id.length !== 24) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }

    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    console.log('Starting comprehensive cleanup for product:', product.name);

    // 1. Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      console.log('Deleting images from Cloudinary...');
      for (const image of product.images) {
        try {
          const cloudinary = await import('cloudinary').then(module => module.v2);
          cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
          });
          
          await cloudinary.uploader.destroy(image.publicId);
          console.log('Deleted image from Cloudinary:', image.publicId);
        } catch (error) {
          console.error('Failed to delete image from Cloudinary:', image.publicId, error);
          // Continue with other cleanup even if one image fails
        }
      }
    }

    // 2. Delete all reviews for this product
    try {
      const Review = await import('../models/Review.js').then(module => module.default);
      const deletedReviews = await Review.deleteMany({ product: id });
      console.log('Deleted reviews:', deletedReviews.deletedCount);
    } catch (error) {
      console.error('Failed to delete reviews:', error);
    }

    // 3. Remove product from all carts
    try {
      const Cart = await import('../models/Cart.js').then(module => module.default);
      const updatedCarts = await Cart.updateMany(
        { 'items.product': id },
        { $pull: { items: { product: id } } }
      );
      console.log('Updated carts:', updatedCarts.modifiedCount);
    } catch (error) {
      console.error('Failed to remove from carts:', error);
    }

    // 4. Remove product from all wishlists
    try {
      const Wishlist = await import('../models/Wishlist.js').then(module => module.default);
      const updatedWishlists = await Wishlist.updateMany(
        { products: id },
        { $pull: { products: id } }
      );
      console.log('Updated wishlists:', updatedWishlists.modifiedCount);
    } catch (error) {
      console.error('Failed to remove from wishlists:', error);
    }

    // 5. Update orders that contain this product
    try {
      const Order = await import('../models/Order.js').then(module => module.default);
      const ordersWithProduct = await Order.find({
        'items.product': id
      });
      
      for (const order of ordersWithProduct) {
        // Remove the product from order items
        order.items = order.items.filter(item => item.product.toString() !== id);
        
        // Recalculate order total
        order.total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // If order becomes empty, mark it as cancelled
        if (order.items.length === 0) {
          order.status = 'cancelled';
          order.cancellationReason = 'Product deleted by admin';
        }
        
        await order.save();
      }
      console.log('Updated orders:', ordersWithProduct.length);
    } catch (error) {
      console.error('Failed to update orders:', error);
    }

    // 6. Finally, delete the product itself
    await product.deleteOne();
    console.log('Product deleted successfully:', product.name);

    res.json({ 
      message: 'Product and all associated data removed successfully',
      cleanup: {
        imagesDeleted: product.images ? product.images.length : 0,
        reviewsDeleted: 'completed',
        cartsUpdated: 'completed',
        wishlistsUpdated: 'completed',
        ordersUpdated: 'completed'
      }
    });
  } catch (error) {
    console.error('Delete product error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories.sort());
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

export default router; 