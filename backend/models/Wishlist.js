import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true
});

// Method to add product to wishlist
wishlistSchema.methods.addProduct = function(productId) {
  if (!this.products.includes(productId)) {
    this.products.push(productId);
  }
  return this.save();
};

// Method to remove product from wishlist
wishlistSchema.methods.removeProduct = function(productId) {
  this.products = this.products.filter(id => id.toString() !== productId);
  return this.save();
};

// Method to check if product is in wishlist
wishlistSchema.methods.hasProduct = function(productId) {
  return this.products.some(id => id.toString() === productId);
};

// Method to clear wishlist
wishlistSchema.methods.clearWishlist = function() {
  this.products = [];
  return this.save();
};

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

export default Wishlist; 