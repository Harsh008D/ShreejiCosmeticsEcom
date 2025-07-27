import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Loader2 } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product: originalProduct }) => {
  // Ensure product has id set from _id if needed
  const product = { ...originalProduct, id: originalProduct._id || originalProduct.id };
  // Force inStock false if stockQuantity is 0
  const isOutOfStock = product.stockQuantity === 0;
  const effectiveInStock = product.inStock && !isOutOfStock;
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showSuccess, showError, showInfo } = useToast();
  const { user, isAdmin } = useAuth();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event from bubbling up to the Link
    
    if (!user) {
      showInfo('Login Required', 'Please login to add items to your cart');
      return;
    }

    if (isAdmin) {
      showError('Not Allowed', 'Admin cannot add products to cart.');
      return;
    }

    if (!effectiveInStock) {
      showInfo('Out of Stock', 'This product is currently out of stock');
      return;
    }

    setIsAddingToCart(true);
    try {
      const result = await addToCart(product, 1);
      if (result.success) {
        showSuccess('Added to Cart', `${product.name} has been added to your cart`);
      } else {
        showError('Failed to Add', result.error || 'Failed to add item to cart');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        showError('Error', error.message || 'Failed to add item to cart');
      } else {
        showError('Error', 'Failed to add item to cart');
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event from bubbling up to the Link
    
    if (!user) {
      showInfo('Login Required', 'Please login to manage your wishlist');
      return;
    }

    if (isAdmin) {
      showError('Not Allowed', 'Admin cannot add products to wishlist.');
      return;
    }

    setIsTogglingWishlist(true);
    try {
      const productId = product.id;
      if (isInWishlist(productId)) {
        const result = await removeFromWishlist(productId);
        if (result.success) {
          showSuccess('Removed from Wishlist', `${product.name} has been removed from your wishlist`);
        } else {
          showError('Failed to Remove', result.error || 'Failed to remove item from wishlist');
        }
      } else {
        const result = await addToWishlist(product);
        if (result.success) {
          showSuccess('Added to Wishlist', `${product.name} has been added to your wishlist`);
        } else {
          showError('Failed to Add', result.error || 'Failed to add item to wishlist');
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        showError('Error', error.message || 'Failed to update wishlist');
      } else {
        showError('Error', 'Failed to update wishlist');
      }
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const productId = product.id;

  return (
    <Link to={`/product/${productId}`} className="group">
      <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
        <div className="relative overflow-hidden">
          <img
            src={product.images && product.images.length > 0 
              ? product.images.find(img => img.isThumbnail)?.url || product.images[0].url 
              : product.image}
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Image+Not+Available';
            }}
          />
          <div className="absolute top-4 right-4 flex space-x-2">
            {product.featured && (
              <div className="bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </div>
            )}
            <button
              onClick={handleWishlistToggle}
              disabled={isTogglingWishlist}
              className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                isInWishlist(productId)
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/80 text-gray-700 hover:bg-rose-500 hover:text-white'
              } ${isTogglingWishlist ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isTogglingWishlist ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Heart className="w-4 h-4" />
              )}
            </button>
          </div>
          {!effectiveInStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-500 text-white px-4 py-2 rounded-full font-medium">
                Out of Stock
              </span>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            {/* Stock warning or in stock for users */}
            {effectiveInStock && (
              typeof product.stockQuantity === 'number' ? (
                product.stockQuantity <= 10 ? (
                  <span className="text-xs text-red-500 font-semibold bg-red-100 px-3 py-1 rounded-full mr-2">Only {product.stockQuantity} left</span>
                ) : product.stockQuantity <= 20 ? (
                  <span className="text-xs text-yellow-700 font-semibold bg-yellow-100 px-3 py-1 rounded-full mr-2">Few left</span>
                ) : (
                  <span className="text-xs text-green-600 font-semibold bg-green-100 px-3 py-1 rounded-full mr-2">In Stock</span>
                )
              ) : (
                <span className="text-xs text-green-600 font-semibold bg-green-100 px-3 py-1 rounded-full mr-2">In Stock</span>
              )
            )}
            <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
          </div>
          {/* Category on next line */}
          <div className="mb-2">
            <span className="text-sm text-emerald-600 font-medium">{product.category}</span>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors duration-200">
            {product.name}
          </h3>
          <div className="flex items-center mb-2">
            {typeof product.rating === 'number' && product.numReviews > 0 ? (
              <>
                <Star className="w-4 h-4 text-amber-400 mr-1" fill="#fbbf24" />
                <span className="font-semibold text-gray-800 mr-2">{product.rating.toFixed(1)}</span>
                <span className="text-gray-500 text-sm">({product.numReviews} review{product.numReviews > 1 ? 's' : ''})</span>
              </>
            ) : (
              <span className="text-gray-400 text-sm">No ratings yet</span>
            )}
          </div>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>
          
          <button
            onClick={handleAddToCart}
            disabled={!effectiveInStock || isAddingToCart}
            className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-medium transition-all duration-200 ${
              effectiveInStock && !isAddingToCart
                ? 'bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isAddingToCart ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>{effectiveInStock ? 'Add to Cart' : 'Out of Stock'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;