import { ProductController } from './ProductController';
import { AuthController } from './AuthController';
import { CartController } from './CartController';
import { apiService } from '../services/ApiService';
import { Product } from '../models/Product';

export class AppController {
  private productController: ProductController;
  private authController: AuthController;
  private cartController: CartController;
  private isInitialized: boolean = false;

  constructor() {
    this.productController = new ProductController();
    this.authController = new AuthController();
    this.cartController = new CartController();
  }

  // Get controller instances
  getProductController(): ProductController {
    return this.productController;
  }

  getAuthController(): AuthController {
    return this.authController;
  }

  getCartController(): CartController {
    return this.cartController;
  }

  // Initialize the application
  async initialize(): Promise<{ success: boolean; error?: string }> {
    try {
      // Check authentication status first
      await this.authController.checkAuthStatus();

      // Load products
      await this.productController.loadProducts();

      // Load cart if user is authenticated
      if (this.authController.isAuthenticated()) {
        await this.cartController.loadCart();
      }

      this.isInitialized = true;
      return { success: true };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Failed to initialize app:', error);
        return { success: false, error: error.message || 'Failed to initialize application' };
      } else {
        return { success: false, error: 'Failed to initialize application' };
      }
    }
  }

  // Check if app is initialized
  isAppInitialized(): boolean {
    return this.isInitialized;
  }

  // Refresh all data
  async refreshData(): Promise<{ success: boolean; error?: string }> {
    try {
      // Refresh products
      await this.productController.refreshProducts();

      // Refresh cart if authenticated
      if (this.authController.isAuthenticated()) {
        await this.cartController.loadCart();
      }

      return { success: true };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Failed to refresh data:', error);
        return { success: false, error: error.message || 'Failed to refresh data' };
      } else {
        return { success: false, error: 'Failed to refresh data' };
      }
    }
  }

  // Logout user
  async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      // Logout from auth controller
      await this.authController.logout();

      // Clear cart
      this.cartController.getModel().clearCart();

      // Clear API service token
      apiService.clearAuth();

      return { success: true };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Logout error:', error);
      }
      // Even if API call fails, clear local data
      this.cartController.getModel().clearCart();
      apiService.clearAuth();
      return { success: true };
    }
  }

  // Get application state summary
  getAppState() {
    return {
      isInitialized: this.isInitialized,
      auth: this.authController.getAuthState(),
      cart: this.cartController.getCartState(),
      products: {
        total: this.productController.getAllProducts().length,
        categories: this.productController.getCategories().length,
        brands: this.productController.getBrands().length
      }
    };
  }

  // Check if user has admin privileges
  isAdmin(): boolean {
    return this.authController.isAdmin();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.authController.isAuthenticated();
  }

  // Get current user
  getCurrentUser() {
    return this.authController.getCurrentUser();
  }

  // Get cart items count
  getCartItemsCount(): number {
    return this.cartController.getTotalItems();
  }

  // Get cart total price
  getCartTotalPrice(): number {
    return this.cartController.getTotalPrice();
  }

  // Search products
  searchProducts(query: string) {
    return this.productController.searchProducts(query);
  }

  // Get featured products
  getFeaturedProducts(limit?: number) {
    return this.productController.getFeaturedProducts(limit);
  }

  // Get new arrivals
  getNewArrivals(limit?: number) {
    return this.productController.getNewArrivals(limit);
  }

  // Get discounted products
  getDiscountedProducts() {
    return this.productController.getDiscountedProducts();
  }

  // Get products by category
  getProductsByCategory(category: string) {
    return this.productController.getProductsByCategory(category);
  }

  // Get products by brand
  getProductsByBrand(brand: string) {
    return this.productController.getProductsByBrand(brand);
  }

  // Add item to cart
  async addToCart(product: Product, quantity: number = 1) {
    return this.cartController.addItem(product, quantity);
  }

  // Update cart item quantity
  async updateCartItemQuantity(productId: string, quantity: number) {
    return this.cartController.updateItemQuantity(productId, quantity);
  }

  // Remove item from cart
  async removeFromCart(productId: string) {
    return this.cartController.removeItem(productId);
  }

  // Clear cart
  async clearCart() {
    return this.cartController.clearCart();
  }

  // Check if product is in cart
  isProductInCart(productId: string): boolean {
    return this.cartController.isProductInCart(productId);
  }

  // Get cart item quantity
  getCartItemQuantity(productId: string): number {
    return this.cartController.getItemQuantity(productId);
  }

  // Get all categories
  getCategories() {
    return this.productController.getCategories();
  }

  // Get all brands
  getBrands() {
    return this.productController.getBrands();
  }

  // Get price range
  getPriceRange() {
    return this.productController.getPriceRange();
  }

  // Filter products
  filterProducts(filters: Record<string, unknown>) {
    return this.productController.filterProducts(filters);
  }

  // Sort products
  sortProducts(sortOptions: Record<string, unknown>) {
    return this.productController.sortProducts(sortOptions);
  }

  // Get product by ID
  async getProductById(id: string) {
    return this.productController.getProductById(id);
  }

  // Get all products
  getAllProducts() {
    return this.productController.getAllProducts();
  }

  // Get filtered products
  getFilteredProducts() {
    return this.productController.getFilteredProducts();
  }
} 