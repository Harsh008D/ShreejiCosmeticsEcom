import { Product } from './ProductModel';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  addedAt: string;
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
}

export class CartModel {
  private items: CartItem[] = [];
  private isLoading: boolean = false;
  private error: string | null = null;

  // Get cart state
  getCartState(): CartState {
    return {
      items: this.items,
      totalItems: this.getTotalItems(),
      totalPrice: this.getTotalPrice(),
      isLoading: this.isLoading,
      error: this.error
    };
  }

  // Get all cart items
  getItems(): CartItem[] {
    return this.items;
  }

  // Get cart item by product ID
  getItemByProductId(productId: string): CartItem | undefined {
    return this.items.find(item => item.product.id === productId);
  }

  // Add item to cart
  addItem(product: Product, quantity: number = 1): CartItem[] {
    const existingItem = this.getItemByProductId(product.id);

    if (existingItem) {
      // Update existing item quantity
      existingItem.quantity += quantity;
      existingItem.addedAt = new Date().toISOString();
    } else {
      // Add new item
      const newItem: CartItem = {
        id: `${product.id}-${Date.now()}`,
        product,
        quantity,
        addedAt: new Date().toISOString()
      };
      this.items.push(newItem);
    }

    return this.items;
  }

  // Update item quantity
  updateItemQuantity(productId: string, quantity: number): CartItem[] {
    const item = this.getItemByProductId(productId);
    
    if (item) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        this.removeItem(productId);
      } else {
        item.quantity = quantity;
        item.addedAt = new Date().toISOString();
      }
    }

    return this.items;
  }

  // Remove item from cart
  removeItem(productId: string): CartItem[] {
    this.items = this.items.filter(item => item.product.id !== productId);
    return this.items;
  }

  // Clear cart
  clearCart(): void {
    this.items = [];
  }

  // Get total number of items
  getTotalItems(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  // Get total price
  getTotalPrice(): number {
    return this.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  }

  // Get total price with discount
  getTotalPriceWithDiscount(discountPercentage: number = 0): number {
    const totalPrice = this.getTotalPrice();
    const discount = (totalPrice * discountPercentage) / 100;
    return totalPrice - discount;
  }

  // Check if cart is empty
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  // Get unique products count
  getUniqueProductsCount(): number {
    return this.items.length;
  }

  // Set loading state
  setLoading(loading: boolean): void {
    this.isLoading = loading;
  }

  // Set error
  setError(error: string | null): void {
    this.error = error;
  }

  // Clear error
  clearError(): void {
    this.error = null;
  }

  // Set cart items (for syncing with backend)
  setItems(items: CartItem[]): void {
    this.items = items;
  }

  // Check if product is in cart
  isProductInCart(productId: string): boolean {
    return this.getItemByProductId(productId) !== undefined;
  }

  // Get item quantity
  getItemQuantity(productId: string): number {
    const item = this.getItemByProductId(productId);
    return item ? item.quantity : 0;
  }
} 