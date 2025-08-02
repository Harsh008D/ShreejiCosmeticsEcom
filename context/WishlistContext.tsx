import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Product } from '../types';
import apiService from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface WishlistContextType {
  wishlistItems: Product[];
  addToWishlist: (product: Product) => Promise<{ success: boolean; error?: string }>;
  removeFromWishlist: (productId: string) => Promise<{ success: boolean; error?: string }>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const clearError = () => setError(null);

  const loadWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([]);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const wishlistData = await apiService.getWishlist();
      // Map all products to ensure id is set
      const mappedProducts = (wishlistData.products || []).map((p: { _id?: string; id?: string }) => ({ ...p, id: p._id || p.id }));
      setWishlistItems(mappedProducts);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Failed to load wishlist:', error);
        setError(error.message || 'Failed to load wishlist');
      } else {
        setError('Failed to load wishlist');
      }
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshWishlist = async () => {
    await loadWishlist();
  };

  useEffect(() => {
    if (user) {
      loadWishlist();
    } else {
      setWishlistItems([]);
      setError(null);
    }
  }, [user, loadWishlist]);

  const addToWishlist = async (product: Product): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      const errorMsg = 'Please login to add items to wishlist';
      showError('Login Required', errorMsg);
      return { success: false, error: errorMsg };
    }
    
    try {
      setLoading(true);
      setError(null);
      const wishlistData = await apiService.addToWishlist(product.id || '');
      const mappedProducts = (wishlistData.products || []).map((p: { _id?: string; id?: string }) => ({ ...p, id: p._id || p.id }));
      setWishlistItems(mappedProducts);
      showSuccess('Added to Wishlist', `${product.name} has been added to your wishlist`);
      return { success: true };
    } catch (error: unknown) {
      let errorMessage = 'Failed to add item to wishlist';
      if (error instanceof Error) {
        console.error('Failed to add to wishlist:', error);
        errorMessage = error.message || errorMessage;
      }
      setError(errorMessage);
      showError('Add to Wishlist Failed', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string, suppressToast = false): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      const errorMsg = 'Please login to manage wishlist';
      showError('Login Required', errorMsg);
      return { success: false, error: errorMsg };
    }
    
    try {
      setLoading(true);
      setError(null);
      const wishlistData = await apiService.removeFromWishlist(productId);
      const mappedProducts = (wishlistData.products || []).map((p: { _id?: string; id?: string }) => ({ ...p, id: p._id || p.id }));
      setWishlistItems(mappedProducts);
      if (!suppressToast) {
        showSuccess('Removed from Wishlist', 'Item has been removed from your wishlist');
      }
      return { success: true };
    } catch (error: unknown) {
      let errorMessage = 'Failed to remove item from wishlist';
      if (error instanceof Error) {
        console.error('Failed to remove from wishlist:', error);
        errorMessage = error.message || errorMessage;
      }
      setError(errorMessage);
      showError('Remove from Wishlist Failed', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlistItems.some(item => item.id === productId);
  };

  const clearWishlist = async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      const errorMsg = 'Please login to manage wishlist';
      showError('Login Required', errorMsg);
      return { success: false, error: errorMsg };
    }
    
    try {
      setLoading(true);
      setError(null);
      await apiService.clearWishlist();
      setWishlistItems([]);
      showSuccess('Wishlist Cleared', 'Your wishlist has been cleared successfully');
      return { success: true };
    } catch (error: unknown) {
      let errorMessage = 'Failed to clear wishlist';
      if (error instanceof Error) {
        console.error('Failed to clear wishlist:', error);
        errorMessage = error.message || errorMessage;
      }
      setError(errorMessage);
      showError('Clear Wishlist Failed', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      clearWishlist,
      loading,
      error,
      clearError,
      refreshWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};