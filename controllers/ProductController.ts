import { ProductModel, Product, ProductFilters, ProductSortOptions } from '../models/ProductModel';
import { apiService } from '../services/api';

export class ProductController {
  private productModel: ProductModel;

  constructor() {
    this.productModel = new ProductModel();
  }

  // Get the product model instance
  getModel(): ProductModel {
    return this.productModel;
  }

  // Load all products from API
  async loadProducts(): Promise<Product[]> {
    try {
      const products = await apiService.getProducts();
      this.productModel.setProducts(products);
      return products;
    } catch (error) {
      console.error('Failed to load products:', error);
      throw error;
    }
  }

  // Get all products
  getAllProducts(): Product[] {
    return this.productModel.getAllProducts();
  }

  // Get filtered products
  getFilteredProducts(): Product[] {
    return this.productModel.getFilteredProducts();
  }

  // Get product by ID
  async getProductById(id: string): Promise<Product | undefined> {
    try {
      // First check if product exists in local model
      let product = this.productModel.getProductById(id);
      
      if (!product) {
        // If not found locally, fetch from API
        product = await apiService.getProductById(id);
        if (product) {
          // Add to local model
          const currentProducts = this.productModel.getAllProducts();
          this.productModel.setProducts([...currentProducts, product]);
        }
      }
      
      return product;
    } catch (error) {
      console.error('Failed to get product by ID:', error);
      throw error;
    }
  }

  // Filter products
  filterProducts(filters: ProductFilters): Product[] {
    return this.productModel.filterProducts(filters);
  }

  // Sort products
  sortProducts(sortOptions: ProductSortOptions): Product[] {
    return this.productModel.sortProducts(sortOptions);
  }

  // Get categories
  getCategories(): string[] {
    return this.productModel.getCategories();
  }

  // Get brands
  getBrands(): string[] {
    return this.productModel.getBrands();
  }

  // Get price range
  getPriceRange(): { min: number; max: number } {
    return this.productModel.getPriceRange();
  }

  // Search products by name
  searchProducts(query: string): Product[] {
    const products = this.productModel.getAllProducts();
    if (!query.trim()) return products;
    
    const searchTerm = query.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.brand.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    );
  }

  // Get products by category
  getProductsByCategory(category: string): Product[] {
    return this.filterProducts({ category });
  }

  // Get products by brand
  getProductsByBrand(brand: string): Product[] {
    return this.filterProducts({ brand });
  }

  // Get featured products (high rating products)
  getFeaturedProducts(limit: number = 8): Product[] {
    const products = this.productModel.getAllProducts();
    return products
      .filter(product => product.rating >= 4.0)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  // Get new arrivals
  getNewArrivals(limit: number = 8): Product[] {
    const products = this.productModel.getAllProducts();
    return products
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  // Get discounted products
  getDiscountedProducts(): Product[] {
    const products = this.productModel.getAllProducts();
    return products.filter(product => product.originalPrice && product.originalPrice > product.price);
  }

  // Get in-stock products
  getInStockProducts(): Product[] {
    return this.filterProducts({ inStock: true });
  }

  // Refresh products data
  async refreshProducts(): Promise<Product[]> {
    return this.loadProducts();
  }
} 