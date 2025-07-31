import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CartItem, Product } from '../types';
import apiService from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => Promise<{ success: boolean; error?: string }>;
  removeFromCart: (productId: string) => Promise<{ success: boolean; error?: string }>;
  updateQuantity: (productId: string, quantity: number) => Promise<{ success: boolean; error?: string }>;
  clearCart: () => Promise<{ success: boolean; error?: string }>;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const clearError = () => setError(null);

  const loadCart = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const cartData = await apiService.getCart();
      // Map all products to ensure id is set
      const mappedItems = (cartData.items || []).map((item: { product: { _id?: string; id?: string } }) => ({ ...item, product: { ...item.product, id: item.product._id || item.product.id } }));
      setCartItems(mappedItems);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Failed to load cart:', error);
        setError(error.message || 'Failed to load cart');
      } else {
        setError('Failed to load cart');
      }
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshCart = async () => {
    await loadCart();
  };

  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setCartItems([]);
      setError(null);
    }
  }, [user, loadCart]);

  const addToCart = async (product: Product, quantity: number = 1, suppressToast = false): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      const errorMsg = 'Please login to add items to cart';
      showError('Login Required', errorMsg);
      return { success: false, error: errorMsg };
    }
    
    if (quantity <= 0) {
      const errorMsg = 'Quantity must be greater than 0';
      showError('Invalid Quantity', errorMsg);
      return { success: false, error: errorMsg };
    }
    
    try {
      setLoading(true);
      setError(null);
      const cartData = await apiService.addToCart(product.id || '', quantity);
      const mappedItems = (cartData.items || []).map((item: { product: { _id?: string; id?: string } }) => ({ ...item, product: { ...item.product, id: item.product._id || item.product.id } }));
      setCartItems(mappedItems);
      if (!suppressToast) {
        showSuccess('Added to Cart', `${product.name} has been added to your cart`);
      }
      return { success: true };
    } catch (error: unknown) {
      let errorMessage = 'Failed to add item to cart';
      if (error instanceof Error) {
        console.error('Failed to add to cart:', error);
        errorMessage = error.message || errorMessage;
      }
      setError(errorMessage);
      showError('Add to Cart Failed', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: string, suppressToast = false): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      const errorMsg = 'Please login to manage cart';
      showError('Login Required', errorMsg);
      return { success: false, error: errorMsg };
    }
    
    try {
      setLoading(true);
      setError(null);
      const cartData = await apiService.removeFromCart(productId);
      const mappedItems = (cartData.items || []).map((item: { product: { _id?: string; id?: string } }) => ({ ...item, product: { ...item.product, id: item.product._id || item.product.id } }));
      setCartItems(mappedItems);
      if (!suppressToast) {
        showSuccess('Removed from Cart', 'Item has been removed from your cart');
      }
      return { success: true };
    } catch (error: unknown) {
      let errorMessage = 'Failed to remove item from cart';
      if (error instanceof Error) {
        console.error('Failed to remove from cart:', error);
        errorMessage = error.message || errorMessage;
      }
      setError(errorMessage);
      showError('Remove from Cart Failed', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Please login to manage cart' };
    }
    
    if (quantity <= 0) {
      // If quantity is 0 or negative, remove the item
      return removeFromCart(productId);
    }
    
    try {
      setLoading(true);
      setError(null);
      const cartData = await apiService.updateCartItem(productId, quantity);
      const mappedItems = (cartData.items || []).map((item: { product: { _id?: string; id?: string } }) => ({ ...item, product: { ...item.product, id: item.product._id || item.product.id } }));
      setCartItems(mappedItems);
      return { success: true };
    } catch (error: unknown) {
      let errorMessage = 'Failed to update cart quantity';
      if (error instanceof Error) {
        console.error('Failed to update cart:', error);
        errorMessage = error.message || errorMessage;
      }
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      const errorMsg = 'Please login to manage cart';
      showError('Login Required', errorMsg);
      return { success: false, error: errorMsg };
    }
    
    try {
      setLoading(true);
      setError(null);
      await apiService.clearCart();
      setCartItems([]);
      showSuccess('Cart Cleared', 'Your cart has been cleared successfully');
      return { success: true };
    } catch (error: unknown) {
      let errorMessage = 'Failed to clear cart';
      if (error instanceof Error) {
        console.error('Failed to clear cart:', error);
        errorMessage = error.message || errorMessage;
      }
      setError(errorMessage);
      showError('Clear Cart Failed', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getCartTotal = (): number => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = (): number => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartItemCount,
      loading,
      error,
      clearError,
      refreshCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};