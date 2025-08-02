import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Product } from '../types';

const Wishlist: React.FC = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showSuccess, showError } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Ensure all wishlistItems have id set from _id if needed
  const mappedWishlistItems = wishlistItems.map((product) => ({ ...product, id: product._id || product.id }));

  const handleAddToCart = async (product: Product) => {
    const pid = product.id;
    if (!pid) return;
    setLoadingId(pid);
    await addToCart(product, 1);
    await removeFromWishlist(pid);
    setLoadingId(null);
  };

  const handleRemove = async (product: Product) => {
    const pid = product.id;
    if (!pid) return;
    setLoadingId(pid);
    try {
      const result = await removeFromWishlist(pid);
      if (result.success) {
        showSuccess('Removed from Wishlist', `${product.name} has been removed from your wishlist`);
      } else {
        showError('Failed to Remove', result.error || 'Failed to remove item from wishlist');
      }
    } catch {
      showError('Error', 'Failed to remove item from wishlist');
    } finally {
      setLoadingId(null);
    }
  };

  if (mappedWishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8">
              Save products you love to your wishlist and buy them later.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 bg-emerald-500 text-white px-8 py-4 rounded-xl hover:bg-emerald-600 transition-colors duration-200"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
            <p className="text-gray-600">{mappedWishlistItems.length} items saved</p>
          </div>
          
          {mappedWishlistItems.length > 0 && (
            <button
              onClick={async () => {
                try {
                  const result = await clearWishlist();
                  if (result.success) {
                    showSuccess('Wishlist Cleared', 'Your wishlist has been cleared successfully');
                  } else {
                    showError('Failed to Clear', result.error || 'Failed to clear wishlist');
                  }
                } catch {
                  showError('Error', 'Failed to clear wishlist');
                }
              }}
              className="text-red-500 hover:text-red-700 font-medium transition-colors duration-200"
            >
              Clear All
            </button>
          )}
        </div>

        <div className="flex flex-col gap-6">
          {mappedWishlistItems.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link to={`/product/${product.id}`} className="flex flex-1 w-full items-center gap-4 group">
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
                    <img
                      src={product.images && product.images.length > 0 
                  ? product.images.find(img => img.isThumbnail)?.url || product.images[0].url 
                  : product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <div className="block text-lg font-semibold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors duration-200">
                      {product.name}
                    </div>
                    <span className="text-sm text-emerald-600 font-medium block mb-1">{product.category}</span>
                    <span className="text-xl font-bold text-gray-900 block mb-2">₹{product.price}</span>
                  </div>
                </Link>
                <div className="flex flex-row items-center gap-3 justify-center sm:justify-end mt-4 sm:mt-0">
                  <button
                    onClick={async () => await handleRemove(product)}
                    className="p-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors duration-200"
                    aria-label="Remove from wishlist"
                    disabled={loadingId === product.id}
                  >
                    <Heart className="w-5 h-5 fill-current" />
                  </button>
                  <button
                    onClick={async () => await handleAddToCart(product)}
                    disabled={!product.inStock || loadingId === product.id}
                    className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      product.inStock
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;