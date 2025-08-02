import { Product } from '../types';
import { User, LoginCredentials, RegisterData } from '../models/UserModel';
import { CartItem } from '../models/CartModel';

// API Response types
interface ApiResponse {
  message?: string;
  error?: string;
  errors?: Record<string, unknown>;
  [key: string]: unknown;
}

// Helper function to map MongoDB _id to id for frontend compatibility
function mapProductId(product: Record<string, unknown>): Product {
  if (!product) return product as Product;
  return {
    ...product,
    id: (product._id as string) || (product.id as string),
    numReviews: typeof product.numReviews === 'number' ? product.numReviews : 0,
    rating: typeof product.rating === 'number' ? product.rating : 0,
    _id: undefined
  } as Product;
}

// Helper function to map array of products
function mapProductsArray(products: Record<string, unknown>[]): Product[] {
  return products.map(mapProductId);
}

class ApiService {
  private baseUrl: string;
  private authToken: string | null = null;
  private isMobile: boolean;

  constructor() {
    // Use the Railway URL from environment variable
    this.baseUrl = import.meta.env.VITE_API_URL || 'https://shreejicosmeticsecom-production.up.railway.app';
    
    // Load token from localStorage on initialization
    this.authToken = localStorage.getItem('authToken');
    
    // Detect mobile device
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // Make HTTP request (with credentials for session-based auth)
  private async request<T = Record<string, unknown>>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Prepare headers with JWT token if available
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // Add JWT token if available (fallback for devices with cookie issues)
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    const config: RequestInit = {
      headers,
      credentials: this.authToken ? 'omit' : 'include', // Use omit when JWT token is available
      ...options,
    };

    // Add timeout for mobile connections (longer timeout for mobile)
    const controller = new AbortController();
    const timeoutDuration = this.isMobile ? 15000 : 10000; // 15 seconds for mobile
    const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
    config.signal = controller.signal;
    
    try {
      const response = await fetch(url, config);
      
      // Handle network errors
      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: 'Network error' }));
        throw data;
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      // Clear timeout
      clearTimeout(timeoutId);
      
      // Handle fetch errors (network issues, CORS, etc.)
      if (error instanceof TypeError || error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
        const errorMessage = this.isMobile 
          ? 'Mobile connection failed. Please check your internet connection and try again.'
          : 'Network connection failed. Please check your internet connection and try again.';
        throw { 
          message: errorMessage,
          error: 'NETWORK_ERROR'
        };
      }
      
      // Handle timeout errors
      if (error.name === 'AbortError') {
        throw { 
          message: 'Request timed out. Please check your internet connection and try again.',
          error: 'TIMEOUT_ERROR'
        };
      }
      
      throw error;
    }
  }

  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<User> {
    const response = await this.request<User>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Store JWT token if provided (fallback for devices with cookie issues)
    if (response.token) {
      this.authToken = response.token;
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  }

  async register(userData: Omit<RegisterData, 'confirmPassword'>): Promise<User> {
    const response = await this.request<User>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Store JWT token if provided (fallback for devices with cookie issues)
    if (response.token) {
      this.authToken = response.token;
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.request('/api/auth/logout', {
      method: 'POST',
    });
    
    // Clear JWT token on logout
    this.authToken = null;
    localStorage.removeItem('authToken');
    
    return response;
  }

  async checkAuthStatus(): Promise<User> {
    return this.request<User>('/api/auth/profile');
  }

  async updateProfile(profileData: Partial<User>): Promise<User> {
    return this.request<User>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Password reset endpoints
  async sendResetOTP(email: string): Promise<{ message: string; email: string }> {
    return this.request<{ message: string; email: string }>('/api/auth/send-reset-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyResetOTP(email: string, otp: string): Promise<{ message: string; email: string }> {
    return this.request<{ message: string; email: string }>('/api/auth/verify-reset-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  async resetPassword(email: string, otp: string, password: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, password }),
    });
  }

  // Product endpoints
  async getProducts(): Promise<Product[]> {
    const response = await this.request<{ products: Record<string, unknown>[] }>('/api/products');
    return mapProductsArray(response.products || []);
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const product = await this.request<Record<string, unknown>>(`/api/products/${id}`);
    return product ? mapProductId(product) : undefined;
  }

  // Alias for getProductById for compatibility
  async getProduct(id: string): Promise<Product | undefined> {
    return this.getProductById(id);
  }

  // Create product (Admin)
  async createProduct(product: Partial<Product>): Promise<Product> {
    // Remove id/_id from payload
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, _id, ...payload } = product;
    return this.request<Record<string, unknown>>('/api/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    }).then(mapProductId);
  }

  // Update product (Admin)
  async updateProduct(productId: string, product: Partial<Product>): Promise<Product> {
    // Remove id/_id from payload
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, _id, ...payload } = product;
    return this.request<Record<string, unknown>>(`/api/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }).then(mapProductId);
  }

  // Delete product (Admin)
  async deleteProduct(productId: string): Promise<ApiResponse> {
    return this.request(`/api/products/${productId}`, {
      method: 'DELETE',
    });
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    const response = await this.request<{ products: Record<string, unknown>[] }>(`/api/products/category/${category}`);
    return mapProductsArray(response.products || []);
  }

  async getProductsByBrand(brand: string): Promise<Product[]> {
    const response = await this.request<{ products: Record<string, unknown>[] }>(`/api/products/brand/${brand}`);
    return mapProductsArray(response.products || []);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const response = await this.request<{ products: Record<string, unknown>[] }>(`/api/products/search?q=${encodeURIComponent(query)}`);
    return mapProductsArray(response.products || []);
  }

  // Featured products endpoint
  async getFeaturedProducts(): Promise<Product[]> {
    const products = await this.request<Record<string, unknown>[]>('/api/products/featured');
    return mapProductsArray(products || []);
  }

  // Cart endpoints
  async getCart(): Promise<{ items: CartItem[] }> {
    return this.request<{ items: CartItem[] }>('/api/cart');
  }

  async addToCart(productId: string, quantity: number = 1): Promise<ApiResponse> {
    return this.request('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async updateCartItem(productId: string, quantity: number): Promise<ApiResponse> {
    return this.request(`/api/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(productId: string): Promise<ApiResponse> {
    return this.request(`/api/cart/${productId}`, {
      method: 'DELETE',
    });
  }

  async clearCart(): Promise<ApiResponse> {
    return this.request('/api/cart', {
      method: 'DELETE',
    });
  }

  // Wishlist endpoints
  async getWishlist(): Promise<ApiResponse> {
    return this.request('/api/wishlist');
  }

  async addToWishlist(productId: string): Promise<ApiResponse> {
    return this.request('/api/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  }

  async removeFromWishlist(productId: string): Promise<ApiResponse> {
    return this.request(`/api/wishlist/${productId}`, {
      method: 'DELETE',
    });
  }

  async clearWishlist(): Promise<ApiResponse> {
    return this.request('/api/wishlist', {
      method: 'DELETE',
    });
  }

  // Review endpoints
  async getProductReviews(productId: string): Promise<Record<string, unknown>[]> {
    // Use the correct backend endpoint for fetching reviews
    return this.request(`/api/reviews/product/${productId}`);
  }

  async addProductReview(productId: string, review: {
    rating: number;
    comment: string;
  }): Promise<ApiResponse> {
    return this.request(`/api/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(review),
    });
  }

  async updateProductReview(reviewId: string, review: {
    rating: number;
    comment: string;
  }): Promise<ApiResponse> {
    return this.request(`/api/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(review),
    });
  }

  async deleteProductReview(reviewId: string): Promise<ApiResponse> {
    return this.request(`/api/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  }

  // Add a review (use /reviews/ endpoint for POST)
  async addReview(productId: string, rating: number, comment: string): Promise<Record<string, unknown>> {
    return this.request('/api/reviews/', {
      method: 'POST',
      body: JSON.stringify({ productId, rating, comment }),
    });
    // Old version (commented):
    // return this.request(`/review/product/${productId}`, {
    //   method: 'POST',
    //   body: JSON.stringify({ rating, comment }),
    // });
  }

  // Update a review
  async updateReview(reviewId: string, rating: number, comment: string): Promise<Record<string, unknown>> {
    return this.request(`/api/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify({ rating, comment }),
    });
  }

  // Delete a review
  async deleteReview(reviewId: string): Promise<Record<string, unknown>> {
    return this.request(`/api/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  }

  // Brand endpoints
  async getBrandInfo(): Promise<ApiResponse> {
    return this.request('/api/brand');
  }

  async updateBrandInfo(brandInfo: Record<string, unknown>): Promise<ApiResponse> {
    return this.request('/api/brand', {
      method: 'PUT',
      body: JSON.stringify(brandInfo),
    });
  }

  // Order endpoints
  async placeOrder(items: { product: string; quantity: number; price: number }[], status: string = 'pending'): Promise<Record<string, unknown>> {
    return this.request('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ items, status }),
    });
  }

  async getMyOrders(): Promise<Record<string, unknown>[]> {
    return this.request('/api/orders/my');
  }

  async cancelOrder(orderId: string): Promise<Record<string, unknown>> {
    return this.request(`/api/orders/${orderId}/cancel`, {
      method: 'POST',
    });
  }

  // Admin: Get all orders
  async getAllOrders(): Promise<Record<string, unknown>[]> {
    return this.request('/api/orders');
  }

  // Admin: Cancel any order
  async adminCancelOrder(orderId: string): Promise<Record<string, unknown>> {
    return this.request(`/api/orders/${orderId}/admin-cancel`, { method: 'POST' });
  }

  // Admin: Mark any order as delivered
  async markOrderDelivered(orderId: string): Promise<Record<string, unknown>> {
    return this.request(`/api/orders/${orderId}/deliver`, { method: 'POST' });
  }

  // Admin: Confirm a pending order
  async confirmOrder(orderId: string, status: string = 'active'): Promise<Record<string, unknown>> {
    return this.request(`/api/orders/${orderId}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  // User endpoints
  async getUsers(): Promise<User[]> {
    const response = await this.request<Record<string, unknown>[]>('/api/users');
    // The backend returns an array of users directly
    return (response || []).map((user: Record<string, unknown>) => ({ 
      ...user, 
      id: (user._id as string) || (user.id as string) 
    } as User));
  }

  // Image upload endpoints
  async uploadImages(files: File[]): Promise<{ images: Array<{ url: string; publicId: string; isThumbnail: boolean }> }> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    // Prepare headers with authentication
    const headers: Record<string, string> = {};
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(`${this.baseUrl}/api/upload/images`, {
      method: 'POST',
      body: formData,
      headers,
      credentials: this.authToken ? 'omit' : 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return response.json();
  }

  async deleteImage(publicId: string): Promise<ApiResponse> {
    return this.request(`/api/upload/images/${publicId}`, {
      method: 'DELETE',
    });
  }

  async setThumbnail(publicId: string, productId: string): Promise<ApiResponse> {
    return this.request(`/api/upload/thumbnail/${publicId}`, {
      method: 'PUT',
      body: JSON.stringify({ productId }),
    });
  }
}

// Export singleton instance
export const apiService = new ApiService(); 