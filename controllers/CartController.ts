import { CartModel, CartItem, CartState } from '../models/CartModel';
import { Product } from '../models/ProductModel';
import { apiService } from '../services/api';

export class CartController {
  private cartModel: CartModel;

  constructor() {
    this.cartModel = new CartModel();
  }

  // Get the cart model instance
  getModel(): CartModel {
    return this.cartModel;
  }

  // Get cart state
  getCartState(): CartState {
    return this.cartModel.getCartState();
  }

  // Get all cart items
  getItems(): CartItem[] {
    return this.cartModel.getItems();
  }

  // Get cart item by product ID
  getItemByProductId(productId: string): CartItem | undefined {
    return this.cartModel.getItemByProductId(productId);
  }

  // Add item to cart
  async addItem(product: Product, quantity: number = 1): Promise<{ success: boolean; error?: string }> {
    try {
      this.cartModel.setLoading(true);
      this.cartModel.clearError();

      // Add to local model first
      this.cartModel.addItem(product, quantity);

      // Sync with backend
      const response = await apiService.addToCart(product.id, quantity);
      
      if (response.success) {
        this.cartModel.setLoading(false);
        return { success: true };
      } else {
        // Revert local changes if API call fails
        this.cartModel.removeItem(product.id);
        this.cartModel.setError(response.error || 'Failed to add item to cart');
        this.cartModel.setLoading(false);
        return { success: false, error: response.error || 'Failed to add item to cart' };
      }
    } catch (error: unknown) {
      // Revert local changes if API call fails
      this.cartModel.removeItem(product.id);
      let errorMessage = 'Failed to add item to cart';
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      this.cartModel.setError(errorMessage);
      this.cartModel.setLoading(false);
      return { success: false, error: errorMessage };
    }
  }

  // Update item quantity
  async updateItemQuantity(productId: string, quantity: number): Promise<{ success: boolean; error?: string }> {
    try {
      this.cartModel.setLoading(true);
      this.cartModel.clearError();

      // Update local model first
      this.cartModel.updateItemQuantity(productId, quantity);

      // Sync with backend
      const response = await apiService.updateCartItem(productId, quantity);
      
      if (response.success) {
        this.cartModel.setLoading(false);
        return { success: true };
      } else {
        // Revert local changes if API call fails
        const originalQuantity = this.cartModel.getItemQuantity(productId);
        this.cartModel.updateItemQuantity(productId, originalQuantity);
        this.cartModel.setError(response.error || 'Failed to update item quantity');
        this.cartModel.setLoading(false);
        return { success: false, error: response.error || 'Failed to update item quantity' };
      }
    } catch (error: unknown) {
      // Revert local changes if API call fails
      const originalQuantity = this.cartModel.getItemQuantity(productId);
      let errorMessage = 'Failed to update item quantity';
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      this.cartModel.updateItemQuantity(productId, originalQuantity);
      this.cartModel.setError(errorMessage);
      this.cartModel.setLoading(false);
      return { success: false, error: errorMessage };
    }
  }

  // Remove item from cart
  async removeItem(productId: string): Promise<{ success: boolean; error?: string }> {
    try {
      this.cartModel.setLoading(true);
      this.cartModel.clearError();

      // Remove from local model first
      this.cartModel.removeItem(productId);

      // Sync with backend
      const response = await apiService.removeFromCart(productId);
      
      if (response.success) {
        this.cartModel.setLoading(false);
        return { success: true };
      } else {
        // Revert local changes if API call fails
        // Note: We can't easily revert removal, so we'll need to reload cart
        await this.loadCart();
        this.cartModel.setError(response.error || 'Failed to remove item from cart');
        this.cartModel.setLoading(false);
        return { success: false, error: response.error || 'Failed to remove item from cart' };
      }
    } catch (error: unknown) {
      // Revert local changes if API call fails
      await this.loadCart();
      let errorMessage = 'Failed to remove item from cart';
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      this.cartModel.setError(errorMessage);
      this.cartModel.setLoading(false);
      return { success: false, error: errorMessage };
    }
  }

  // Clear cart
  async clearCart(): Promise<{ success: boolean; error?: string }> {
    try {
      this.cartModel.setLoading(true);
      this.cartModel.clearError();

      // Clear local model first
      this.cartModel.clearCart();

      // Sync with backend
      const response = await apiService.clearCart();
      
      if (response.success) {
        this.cartModel.setLoading(false);
        return { success: true };
      } else {
        // Revert local changes if API call fails
        await this.loadCart();
        this.cartModel.setError(response.error || 'Failed to clear cart');
        this.cartModel.setLoading(false);
        return { success: false, error: response.error || 'Failed to clear cart' };
      }
    } catch (error: unknown) {
      // Revert local changes if API call fails
      await this.loadCart();
      let errorMessage = 'Failed to clear cart';
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      this.cartModel.setError(errorMessage);
      this.cartModel.setLoading(false);
      return { success: false, error: errorMessage };
    }
  }

  // Load cart from backend
  async loadCart(): Promise<{ success: boolean; error?: string }> {
    try {
      this.cartModel.setLoading(true);
      this.cartModel.clearError();

      const response = await apiService.getCart();
      
      if (response.success) {
        this.cartModel.setItems(response.items || []);
        this.cartModel.setLoading(false);
        return { success: true };
      } else {
        this.cartModel.setError(response.error || 'Failed to load cart');
        this.cartModel.setLoading(false);
        return { success: false, error: response.error || 'Failed to load cart' };
      }
    } catch (error: unknown) {
      let errorMessage = 'Failed to load cart';
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      this.cartModel.setError(errorMessage);
      this.cartModel.setLoading(false);
      return { success: false, error: errorMessage };
    }
  }

  // Get total items count
  getTotalItems(): number {
    return this.cartModel.getTotalItems();
  }

  // Get total price
  getTotalPrice(): number {
    return this.cartModel.getTotalPrice();
  }

  // Get total price with discount
  getTotalPriceWithDiscount(discountPercentage: number = 0): number {
    return this.cartModel.getTotalPriceWithDiscount(discountPercentage);
  }

  // Check if cart is empty
  isEmpty(): boolean {
    return this.cartModel.isEmpty();
  }

  // Check if product is in cart
  isProductInCart(productId: string): boolean {
    return this.cartModel.isProductInCart(productId);
  }

  // Get item quantity
  getItemQuantity(productId: string): number {
    return this.cartModel.getItemQuantity(productId);
  }

  // Get unique products count
  getUniqueProductsCount(): number {
    return this.cartModel.getUniqueProductsCount();
  }

  // Clear error
  clearError(): void {
    this.cartModel.clearError();
  }

  // Get loading state
  isLoading(): boolean {
    return this.cartModel.getCartState().isLoading;
  }

  // Get error
  getError(): string | null {
    return this.cartModel.getCartState().error;
  }

  // Apply discount code
  async applyDiscountCode(code: string): Promise<{ success: boolean; discount?: number; error?: string }> {
    try {
      this.cartModel.setLoading(true);
      this.cartModel.clearError();

      const response = await apiService.applyDiscountCode(code);
      
      if (response.success) {
        this.cartModel.setLoading(false);
        return { success: true, discount: response.discount };
      } else {
        this.cartModel.setError(response.error || 'Invalid discount code');
        this.cartModel.setLoading(false);
        return { success: false, error: response.error || 'Invalid discount code' };
      }
    } catch (error: unknown) {
      let errorMessage = 'Failed to apply discount code';
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      this.cartModel.setError(errorMessage);
      this.cartModel.setLoading(false);
      return { success: false, error: errorMessage };
    }
  }

  // Checkout
  async checkout(paymentData: Record<string, unknown>): Promise<{ success: boolean; orderId?: string; error?: string }> {
    try {
      this.cartModel.setLoading(true);
      this.cartModel.clearError();

      const response = await apiService.checkout(paymentData);
      
      if (response.success) {
        // Clear cart after successful checkout
        this.cartModel.clearCart();
        this.cartModel.setLoading(false);
        return { success: true, orderId: response.orderId };
      } else {
        this.cartModel.setError(response.error || 'Checkout failed');
        this.cartModel.setLoading(false);
        return { success: false, error: response.error || 'Checkout failed' };
      }
    } catch (error: unknown) {
      let errorMessage = 'Checkout failed';
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      this.cartModel.setError(errorMessage);
      this.cartModel.setLoading(false);
      return { success: false, error: errorMessage };
    }
  }
} 