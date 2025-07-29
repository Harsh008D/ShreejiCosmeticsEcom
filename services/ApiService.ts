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

  constructor() {
    this.baseUrl = '/api';
  }

  // Make HTTP request (with credentials for session-based auth)
  private async request<T = Record<string, unknown>>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Important for session/cookie auth
      ...options,
    };
    const response = await fetch(url, config);
    const data = await response.json();
    if (!response.ok) {
      throw data;
    }
    return data;
  }

  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<User> {
    return this.request<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: Omit<RegisterData, 'confirmPassword'>): Promise<User> {
    return this.request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async checkAuthStatus(): Promise<User> {
    return this.request<User>('/auth/profile');
  }

  async updateProfile(profileData: Partial<User>): Promise<User> {
    return this.request<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Password reset endpoints
  async sendResetOTP(email: string): Promise<{ message: string; email: string }> {
    return this.request<{ message: string; email: string }>('/auth/send-reset-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyResetOTP(email: string, otp: string): Promise<{ message: string; email: string }> {
    return this.request<{ message: string; email: string }>('/auth/verify-reset-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  async resetPassword(email: string, otp: string, password: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, password }),
    });
  }

  // Product endpoints
  async getProducts(): Promise<Product[]> {
    const response = await this.request<{ products: Record<string, unknown>[] }>('/products');
    return mapProductsArray(response.products || []);
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const product = await this.request<Record<string, unknown>>(`/products/${id}`);
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
    return this.request<Record<string, unknown>>('/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    }).then(mapProductId);
  }

  // Update product (Admin)
  async updateProduct(productId: string, product: Partial<Product>): Promise<Product> {
    // Remove id/_id from payload
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, _id, ...payload } = product;
    return this.request<Record<string, unknown>>(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }).then(mapProductId);
  }

  // Delete product (Admin)
  async deleteProduct(productId: string): Promise<ApiResponse> {
    return this.request(`/products/${productId}`, {
      method: 'DELETE',
    });
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    const response = await this.request<{ products: Record<string, unknown>[] }>(`/products/category/${category}`);
    return mapProductsArray(response.products || []);
  }

  async getProductsByBrand(brand: string): Promise<Product[]> {
    const response = await this.request<{ products: Record<string, unknown>[] }>(`/products/brand/${brand}`);
    return mapProductsArray(response.products || []);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const response = await this.request<{ products: Record<string, unknown>[] }>(`/products/search?q=${encodeURIComponent(query)}`);
    return mapProductsArray(response.products || []);
  }

  // Featured products endpoint
  async getFeaturedProducts(): Promise<Product[]> {
    const products = await this.request<Record<string, unknown>[]>('/products/featured');
    return mapProductsArray(products || []);
  }

  // Cart endpoints
  async getCart(): Promise<{ items: CartItem[] }> {
    return this.request<{ items: CartItem[] }>('/cart');
  }

  async addToCart(productId: string, quantity: number = 1): Promise<ApiResponse> {
    return this.request('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async updateCartItem(productId: string, quantity: number): Promise<ApiResponse> {
    return this.request(`/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(productId: string): Promise<ApiResponse> {
    return this.request(`/cart/${productId}`, {
      method: 'DELETE',
    });
  }

  async clearCart(): Promise<ApiResponse> {
    return this.request('/cart', {
      method: 'DELETE',
    });
  }

  // Wishlist endpoints
  async getWishlist(): Promise<ApiResponse> {
    return this.request('/wishlist');
  }

  async addToWishlist(productId: string): Promise<ApiResponse> {
    return this.request('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  }

  async removeFromWishlist(productId: string): Promise<ApiResponse> {
    return this.request(`/wishlist/${productId}`, {
      method: 'DELETE',
    });
  }

  // Review endpoints
  async getProductReviews(productId: string): Promise<Record<string, unknown>[]> {
    // Use the correct backend endpoint for fetching reviews
    return this.request(`/reviews/product/${productId}`);
  }

  async addProductReview(productId: string, review: {
    rating: number;
    comment: string;
  }): Promise<ApiResponse> {
    return this.request(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(review),
    });
  }

  async updateProductReview(reviewId: string, review: {
    rating: number;
    comment: string;
  }): Promise<ApiResponse> {
    return this.request(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(review),
    });
  }

  async deleteProductReview(reviewId: string): Promise<ApiResponse> {
    return this.request(`/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  }

  // Add a review (use /reviews/ endpoint for POST)
  async addReview(productId: string, rating: number, comment: string): Promise<Record<string, unknown>> {
    return this.request('/reviews/', {
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
    return this.request(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify({ rating, comment }),
    });
  }

  // Delete a review
  async deleteReview(reviewId: string): Promise<Record<string, unknown>> {
    return this.request(`/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  }

  // Brand endpoints
  async getBrandInfo(): Promise<ApiResponse> {
    return this.request('/brand');
  }

  async updateBrandInfo(brandInfo: Record<string, unknown>): Promise<ApiResponse> {
    return this.request('/brand', {
      method: 'PUT',
      body: JSON.stringify(brandInfo),
    });
  }

  // Order endpoints
  async placeOrder(items: { product: string; quantity: number; price: number }[], status: string = 'pending'): Promise<Record<string, unknown>> {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify({ items, status }),
    });
  }

  async getMyOrders(): Promise<Record<string, unknown>[]> {
    return this.request('/orders/my');
  }

  async cancelOrder(orderId: string): Promise<Record<string, unknown>> {
    return this.request(`/orders/${orderId}/cancel`, {
      method: 'POST',
    });
  }

  // Admin: Get all orders
  async getAllOrders(): Promise<Record<string, unknown>[]> {
    return this.request('/orders');
  }

  // Admin: Cancel any order
  async adminCancelOrder(orderId: string): Promise<Record<string, unknown>> {
    return this.request(`/orders/${orderId}/admin-cancel`, { method: 'POST' });
  }

  // Admin: Mark any order as delivered
  async markOrderDelivered(orderId: string): Promise<Record<string, unknown>> {
    return this.request(`/orders/${orderId}/deliver`, { method: 'POST' });
  }

  // Admin: Confirm a pending order
  async confirmOrder(orderId: string, status: string = 'active'): Promise<Record<string, unknown>> {
    return this.request(`/orders/${orderId}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ status }),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // User endpoints
  async getUsers(): Promise<User[]> {
    const response = await this.request<Record<string, unknown>[]>('/users');
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

    const response = await fetch(`${this.baseUrl}/upload/images`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return response.json();
  }

  async deleteImage(publicId: string): Promise<ApiResponse> {
    return this.request(`/upload/images/${publicId}`, {
      method: 'DELETE',
    });
  }

  async setThumbnail(publicId: string, productId: string): Promise<ApiResponse> {
    return this.request(`/upload/thumbnail/${publicId}`, {
      method: 'PUT',
      body: JSON.stringify({ productId }),
    });
  }
}

// Export singleton instance
export const apiService = new ApiService(); 