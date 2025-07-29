import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import apiService from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../context/AuthContext';

const Cart: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal, loading, refreshCart } = useCart();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  // Track input quantities for all items
  const [inputQty, setInputQty] = useState<{ [id: string]: number }>({});
  const [showWhatsAppConfirm, setShowWhatsAppConfirm] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [showOrderConfirm, setShowOrderConfirm] = useState(false);
  const { user } = useAuth();

  // Ensure all cartItems have id set from _id if needed
  const mappedCartItems = cartItems.map((item) => ({ ...item, product: { ...item.product, id: item.product._id || item.product.id } }));

  // Sync inputQty with cartItems
  useEffect(() => {
    const newQty: { [id: string]: number } = {};
    mappedCartItems.forEach(item => {
      const pid = item.product.id;
      newQty[pid] = item.quantity;
    });
    setInputQty(newQty);
  }, [mappedCartItems]);

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    setUpdatingId(productId);
    setLocalError(null);
    const item = mappedCartItems.find(i => i.product.id === productId);
    if (item && newQuantity > item.product.stockQuantity) {
      setLocalError(`Only ${item.product.stockQuantity} in stock. Please reduce quantity.`);
      setUpdatingId(null);
      return;
    }
    try {
      const result = await updateQuantity(productId, newQuantity);
      if (!result.success) setLocalError(result.error || 'Failed to update quantity');
    } catch (e: unknown) {
      setLocalError(e instanceof Error ? e.message : 'Failed to update quantity');
    }
    setUpdatingId(null);
  };

  const handleRemoveFromCart = async (productId: string) => {
    setUpdatingId(productId);
    setLocalError(null);
    try {
      const result = await removeFromCart(productId);
      if (!result.success) setLocalError(result.error || 'Failed to remove item');
    } catch (e: unknown) {
      setLocalError(e instanceof Error ? e.message : 'Failed to remove item');
    }
    setUpdatingId(null);
  };

  const handleWhatsAppOrder = () => {
    setShowWhatsAppConfirm(true);
  };

  const confirmWhatsAppOrder = async () => {
    setPlacingOrder(true);
    try {
      // 1. Place the order first and get the order id
      const items = cartItems.map(item => ({
        product: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }));
      const orderRes = await apiService.placeOrder(items, 'pending');
      const orderId = orderRes?._id || orderRes?.orderId || orderRes?.id;
      if (!orderId) throw new Error('Order ID not returned from server.');
      // 2. Get brand info
      const brandInfo = await apiService.getBrandInfo();
      // 3. Generate WhatsApp message with user info and short order number
      const orderNo = orderId.slice(-6).toUpperCase();
      const userName = user?.name || '';
      const userEmail = user?.email || '';
      const message = `Hello! I would like to place an order:\nName: ${userName}\nEmail: ${userEmail}\nOrder No.: #${orderNo}:\n\n${cartItems.map(item => `${item.product.name} - Qty: ${item.quantity} - \u20b9${item.product.price * item.quantity}`).join('\n')}\n\nTotal: \u20b9${getCartTotal()}\n\nPlease confirm my order. Thank you!`;
      const formattedMessage = message.replace(/\\n/g, '\n');
      const whatsappUrl = `https://wa.me/${brandInfo.whatsapp?.replace('+', '')}?text=${encodeURIComponent(formattedMessage)}`;
      window.open(whatsappUrl, '_blank');
      // 4. Show confirm dialog to user
      setShowOrderConfirm(true);
      // Save orderId for use in handleOrderConfirm if needed
      (window as Record<string, unknown>)._lastPlacedOrderId = orderId;
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Failed to place order or open WhatsApp.');
    }
    setPlacingOrder(false);
    setShowWhatsAppConfirm(false);
  };

  const handleOrderConfirm = async () => {
    setPlacingOrder(true);
    try {
      // Optionally, you could update the order status here if needed
      const clearResult = await clearCart();
      if (!clearResult.success) {
        setLocalError(clearResult.error || 'Failed to clear cart after order.');
        setPlacingOrder(false);
        setShowOrderConfirm(false);
        return;
      }
      if (typeof refreshCart === 'function') await refreshCart();
      window.location.href = '/profile';
    } catch {
      setLocalError('Failed to complete order.');
    }
    setPlacingOrder(false);
    setShowOrderConfirm(false);
  };

  const handleInputChange = (pid: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setInputQty(qty => ({ ...qty, [pid]: val ? parseInt(val, 10) : 1 }));
  };
  const handleInputBlur = async (pid: string, itemQty: number) => {
    if (inputQty[pid] !== itemQty && inputQty[pid] >= 1) {
      await handleUpdateQuantity(pid, inputQty[pid]);
    } else if (inputQty[pid] < 1) {
      setInputQty(qty => ({ ...qty, [pid]: itemQty }));
    }
  };
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 bg-emerald-500 text-white px-8 py-4 rounded-xl hover:bg-emerald-600 transition-colors duration-200"
            >
              <span>Continue Shopping</span>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">Review your items and proceed to checkout</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="w-full lg:w-2/3 flex flex-col gap-4">
            {mappedCartItems.map((item) => {
              const pid = item.product.id;
              return (
                <div key={pid} className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Link to={`/product/${item.product.id}`} className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 mx-auto sm:mx-0 block group">
                      <img
                        src={item.product.images && item.product.images.length > 0 
                          ? item.product.images.find(img => img.isThumbnail)?.url || item.product.images[0].url 
                          : item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </Link>
                    <div className="flex-1 min-w-0 w-full">
                      <Link to={`/product/${item.product.id}`} className="text-center sm:text-left block group">
                        <div className="block text-lg font-semibold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors duration-200">
                          {item.product.name}
                        </div>
                        <p className="text-emerald-600 font-medium mb-2">₹{item.product.price}</p>
                      </Link>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-4 sm:mt-0">
                        <div className="flex flex-row items-center w-full">
                          <div className="flex items-center border border-gray-200 rounded-xl">
                            <button
                              onClick={async () => {
                                await handleUpdateQuantity(pid, Math.max(1, item.quantity - 1));
                              }}
                              className="p-2 text-gray-600 hover:text-emerald-600 transition-colors duration-200"
                              disabled={item.quantity <= 1 || loading || updatingId === pid}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={inputQty[pid] ?? item.quantity}
                              onChange={e => handleInputChange(pid, e)}
                              onBlur={() => handleInputBlur(pid, item.quantity)}
                              onKeyDown={handleInputKeyDown}
                              className="w-14 text-center border-none focus:ring-0 px-2 py-2 font-medium bg-transparent hide-arrows"
                              disabled={loading || updatingId === pid}
                            />
                            <button
                              onClick={async () => {
                                await handleUpdateQuantity(pid, item.quantity + 1);
                              }}
                              className="p-2 text-gray-600 hover:text-emerald-600 transition-colors duration-200"
                              disabled={loading || updatingId === pid}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-left sm:text-right ml-4">
                            <p className="text-lg font-bold text-gray-900">
                              ₹{item.product.price * item.quantity}
                            </p>
                          </div>
                          <button
                            onClick={async () => await handleRemoveFromCart(pid)}
                            className="p-2 text-red-500 hover:text-red-700 transition-colors duration-200 ml-auto"
                            aria-label="Remove from cart"
                            disabled={loading || updatingId === pid}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {localError && (
              <div className="text-red-600 text-center py-2">{localError}</div>
            )}
            <div className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-2">
              <Link
                to="/products"
                className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-200"
              >
                ← Continue Shopping
              </Link>
              <button
                onClick={clearCart}
                className="text-red-500 hover:text-red-700 font-medium transition-colors duration-200"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-md p-6 h-fit">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex justify-between items-center">
                  <span className="text-gray-600">
                    {item.product.name} x {item.quantity}
                  </span>
                  <span className="font-medium">₹{item.product.price * item.quantity}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span className="text-emerald-600">₹{getCartTotal()}</span>
              </div>
            </div>
            
            <button
              onClick={handleWhatsAppOrder}
              className="w-full bg-green-500 text-white py-4 rounded-xl font-medium hover:bg-green-600 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Order via WhatsApp</span>
            </button>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              You'll be redirected to WhatsApp to complete your order
            </p>
          </div>
        </div>
        <ConfirmDialog
          open={showWhatsAppConfirm}
          title="Order via WhatsApp?"
          message="Are you sure you want to place this order via WhatsApp? This will send your order details to the brand and add the order to your account."
          confirmText={placingOrder ? "Placing..." : "Order via WhatsApp"}
          cancelText="Cancel"
          onCancel={() => setShowWhatsAppConfirm(false)}
          onConfirm={confirmWhatsAppOrder}
        />
        {/* After WhatsApp, ask user to confirm they sent the message */}
        <ConfirmDialog
          open={showOrderConfirm}
          title="Confirm WhatsApp Message Sent"
          message="Did you send the WhatsApp message to confirm your order? Only after this your order will be placed as pending."
          confirmText={placingOrder ? "Placing..." : "Yes, I sent the message"}
          cancelText="Cancel"
          onCancel={() => setShowOrderConfirm(false)}
          onConfirm={handleOrderConfirm}
        />
      </div>
    </div>
  );
};

export default Cart;