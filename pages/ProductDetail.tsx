import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Share2, Truck, Shield, RotateCcw, Star, Edit, Trash2, User } from 'lucide-react';
import { Heart as HeartIcon } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import apiService from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../context/ToastContext';
import ImageCarousel from '../components/ImageCarousel';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user, isAdmin } = useAuth();
  const [reviews, setReviews] = useState<Array<{ _id: string; user?: { _id: string; name: string }; rating: number; comment: string; createdAt: string }>>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  // Add state for animating the selected star
  const [starAnim, setStarAnim] = useState<number | null>(null);
  // Add state for review delete dialog
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; reviewId: string | null }>({ open: false, reviewId: null });
  const [quantityError, setQuantityError] = useState('');
  const { showError, showInfo } = useToast();

  // Helper to load product
  const loadProduct = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError('');
      const productData = await apiService.getProduct(id);
      setProduct(productData ? { ...productData, id: productData._id || productData.id } : null);
    } catch (error: unknown) {
      console.error('Failed to load product:', error);
      setError('Product not found');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!product) return;
      setReviewLoading(true);
      setReviewError('');
      try {
        const res = await apiService.getProductReviews(product.id);
        setReviews(res);
        // Removed unused myReview logic
      } catch (e: unknown) {
        if (e instanceof Error) {
          setReviewError(e.message || 'Failed to load reviews');
        } else {
          setReviewError('Failed to load reviews');
        }
      }
      setReviewLoading(false);
    };
    fetchReviews();
  }, [product, user]);

  // Add or edit review
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewLoading(true);
    setReviewError('');
    try {
      if (!user) {
        navigate('/login');
        return;
      }
      if (editingReviewId) {
        await apiService.updateReview(editingReviewId, form.rating, form.comment);
      } else {
        await apiService.addReview(product.id, form.rating, form.comment);
      }
      setForm({ rating: 5, comment: '' });
      setEditingReviewId(null);
      // Refresh reviews and product
      const res = await apiService.getProductReviews(product.id);
      setReviews(res);
      // Removed unused myReview logic
      await loadProduct();
    } catch (e: unknown) {
      if (e instanceof Error) {
        setReviewError(e.message || 'Failed to submit review');
      } else {
        setReviewError('Failed to submit review');
      }
    }
    setReviewLoading(false);
  };

  // Delete review
  const handleDeleteReview = async (reviewId: string) => {
    setReviewLoading(true);
    setReviewError('');
    try {
      await apiService.deleteReview(reviewId);
      // Refresh reviews and product
      const res = await apiService.getProductReviews(product.id);
      setReviews(res);
      // Removed unused myReview logic
      await loadProduct();
    } catch (e: unknown) {
      if (e instanceof Error) {
        setReviewError(e.message || 'Failed to delete review');
      } else {
        setReviewError('Failed to delete review');
      }
    }
    setReviewLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-8">{error || 'The product you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center space-x-2 bg-emerald-500 text-white px-6 py-3 rounded-xl hover:bg-emerald-600 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Products</span>
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!user) {
      showInfo('Login Required', 'Please login to add items to your cart');
      setQuantityError('');
      return;
    }
    if (isAdmin) {
      showError('Not Allowed', 'Admin cannot add products to cart.');
      setQuantityError('');
      return;
    }
    if (product && quantity > product.stockQuantity) {
      setQuantityError(`Only ${product.stockQuantity} in stock. Please reduce quantity.`);
      return;
    }
    setQuantityError('');
    await addToCart(product, quantity);
    // Optionally show success toast here if addToCart returns a result
  };

  const handleWishlistToggle = () => {
    if (!user) {
      showInfo('Login Required', 'Please login to manage your wishlist');
      setError('');
      return;
    }
    if (isAdmin) {
      showError('Not Allowed', 'Admin cannot add products to wishlist.');
      setError('');
      return;
    }
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      // Optionally show success toast here
    } else {
      addToWishlist(product);
      // Optionally show success toast here
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Product link copied to clipboard!');
    }
  };

  // Prepare images for carousel - use new structure if available, fallback to old structure
  const images = product.images && product.images.length > 0 
    ? product.images 
    : [{ url: product.image, publicId: 'legacy', isThumbnail: true }];

  // Force inStock false if stockQuantity is 0
  const isOutOfStock = product && product.stockQuantity === 0;
  const effectiveInStock = product && product.inStock && !isOutOfStock;

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/products')}
          className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600 transition-colors duration-200 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Products</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <ImageCarousel images={images} />

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-emerald-600 font-medium">{product.category}</span>
                <button
                  onClick={handleShare}
                  className="p-2 text-gray-500 hover:text-emerald-600 transition-colors duration-200"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-emerald-600">₹{product.price}</span>
                {effectiveInStock ? (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    In Stock
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    Out of Stock
                  </span>
                )}
                {/* Stock warning for users */}
                {typeof product.stockQuantity === 'number' && product.inStock && (
                  product.stockQuantity <= 10 ? (
                    <span className="ml-2 text-xs text-red-500 font-semibold">Only {product.stockQuantity} left</span>
                  ) : product.stockQuantity <= 20 ? (
                    <span className="ml-2 text-xs text-yellow-500 font-semibold">Few left</span>
                  ) : null
                )}
              </div>
              
              <p className="text-gray-700 leading-relaxed text-lg">
                {product.description}
              </p>
              <div className="flex items-center mt-2 mb-4">
                {typeof product.rating === 'number' && product.numReviews > 0 ? (
                  <>
                    <Star className="w-5 h-5 text-amber-400 mr-1" fill="#fbbf24" />
                    <span className="font-semibold text-gray-800 mr-2">{product.rating.toFixed(1)}</span>
                    <span className="text-gray-500 text-base">({product.numReviews} review{product.numReviews > 1 ? 's' : ''})</span>
                  </>
                ) : (
                  <span className="text-gray-400 text-base">No ratings yet</span>
                )}
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-gray-700 font-medium">Quantity:</label>
                <div className="flex items-center border border-gray-200 rounded-xl">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-gray-600 hover:text-emerald-600 transition-colors duration-200"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 text-gray-600 hover:text-emerald-600 transition-colors duration-200"
                  >
                    +
                  </button>
                </div>
              </div>

              {quantityError && <div className="text-red-600 font-semibold mb-2">{quantityError}</div>}

              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!effectiveInStock}
                  className={`flex-1 flex items-center justify-center space-x-2 py-4 rounded-xl font-medium text-lg transition-all duration-200 ${
                    effectiveInStock
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>{effectiveInStock ? 'Add to Cart' : 'Out of Stock'}</span>
                </button>
                
                <button
                  onClick={handleWishlistToggle}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    isInWishlist(product.id)
                      ? 'border-rose-500 bg-rose-50 text-rose-500'
                      : 'border-gray-200 text-gray-600 hover:border-rose-500 hover:text-rose-500'
                  }`}
                  aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  {isInWishlist(product.id) ? (
                    <HeartIcon className="w-6 h-6 fill-rose-500 text-rose-500" fill="currentColor" />
                  ) : (
                    <HeartIcon className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-gray-200">
              <div className="text-center">
                <Truck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <span className="text-sm text-gray-600">Free Shipping</span>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <span className="text-sm text-gray-600">Quality Assured</span>
              </div>
              <div className="text-center">
                <RotateCcw className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <span className="text-sm text-gray-600">30-Day Return</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="bg-white rounded-2xl shadow-md p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Ingredients */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Ingredients</h3>
                <ul className="space-y-3">
                  {product.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-gray-700">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Usage */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Use</h3>
                <p className="text-gray-700 leading-relaxed">{product.usage}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <div className="bg-white rounded-2xl shadow-md p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Product Reviews</h3>
            {/* Review Form - moved above reviews list */}
            {user ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4 mb-8">
                <div className="flex items-center gap-2">
                  <label className="font-medium">Your Rating:</label>
                  {[1,2,3,4,5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => {
                        setForm(f => ({ ...f, rating: star }));
                        setStarAnim(star);
                        setTimeout(() => setStarAnim(null), 500);
                      }}
                      className={
                        (form.rating >= star ? 'text-amber-400' : 'text-gray-300') +
                        ' transition-transform duration-300 focus:outline-none'
                      }
                      style={{
                        outline: 'none',
                        transitionDelay: starAnim && form.rating >= star ? `${(star-1)*40}ms` : '0ms',
                        transform:
                          starAnim && form.rating >= star
                            ? 'scale(1.25) translateY(-4px)'
                            : 'scale(1) translateY(0)',
                        boxShadow:
                          starAnim && form.rating >= star
                            ? '0 4px 16px 0 rgba(251,191,36,0.25)'
                            : 'none',
                      }}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={3}
                  placeholder="Write your review..."
                  value={form.comment}
                  onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                  required
                  minLength={3}
                  maxLength={1000}
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-600 transition-colors duration-200"
                    disabled={reviewLoading}
                  >
                    {editingReviewId ? 'Update Review' : 'Add Review'}
                  </button>
                  {editingReviewId && (
                    <button
                      type="button"
                      onClick={() => { setForm({ rating: 5, comment: '' }); setEditingReviewId(null); }}
                      className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <div className="text-center mb-8">
                <button
                  onClick={() => navigate('/login')}
                  className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-600 transition-colors duration-200"
                >
                  Login to add a review
                </button>
              </div>
            )}
            {reviewLoading && <div className="text-gray-500">Loading reviews...</div>}
            {reviewError && <div className="text-red-500 mb-4">{reviewError}</div>}
            {reviews.length === 0 && !reviewLoading && <div className="text-gray-500">No reviews yet.</div>}
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review._id} className="border-b border-gray-100 pb-4">
                  <div className="flex items-center mb-2">
                    <User className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="font-semibold text-gray-800 mr-2">{review.user?.name || 'User'}</span>
                    <span className="flex items-center">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                      ))}
                    </span>
                    <span className="ml-2 text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-gray-700 mb-2">{review.comment}</div>
                  <div className="flex gap-2">
                    {user && review.user && (review.user._id === user._id || review.user === user._id) && (
                      <button
                        onClick={() => {
                          setForm({ rating: review.rating, comment: review.comment });
                          setEditingReviewId(review._id);
                        }}
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" /> Edit
                      </button>
                    )}
                    {user && (review.user && (review.user._id === user._id || review.user === user._id) || isAdmin) && (
                      <button
                        onClick={() => setConfirmDelete({ open: true, reviewId: review._id })}
                        className="text-red-600 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* ConfirmDialog for review deletion */}
      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete Review?"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => setConfirmDelete({ open: false, reviewId: null })}
        onConfirm={() => {
          if (confirmDelete.reviewId) handleDeleteReview(confirmDelete.reviewId);
          setConfirmDelete({ open: false, reviewId: null });
        }}
      />
    </div>
  );
};

export default ProductDetail;