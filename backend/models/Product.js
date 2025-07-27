import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  image: {
    type: String,
    required: false // Not required: products can use only the images array
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    isThumbnail: {
      type: Boolean,
      default: false
    }
  }],
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  ingredients: [{
    type: String,
    required: [true, 'Product ingredients are required']
  }],
  usage: {
    type: String,
    required: [true, 'Product usage instructions are required']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: ['Face Care', 'Hair Care', 'Body Care', 'Lip Care', 'Other']
  },
  inStock: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  stockQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better search performance
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product; 