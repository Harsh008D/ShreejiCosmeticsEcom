import { Product } from '../types';

export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  rating?: number;
}

export interface ProductSortOptions {
  field: 'name' | 'price' | 'rating' | 'createdAt';
  direction: 'asc' | 'desc';
}

export class ProductModel {
  private products: Product[] = [];
  private filteredProducts: Product[] = [];

  // Get all products
  getAllProducts(): Product[] {
    return this.products;
  }

  // Get filtered products
  getFilteredProducts(): Product[] {
    return this.filteredProducts;
  }

  // Get product by ID
  getProductById(id: string): Product | undefined {
    return this.products.find(product => product.id === id);
  }

  // Set products data
  setProducts(products: Product[]): void {
    this.products = products;
    this.filteredProducts = products;
  }

  // Filter products
  filterProducts(filters: ProductFilters): Product[] {
    this.filteredProducts = this.products.filter(product => {
      if (filters.category && product.category !== filters.category) return false;
      if (filters.brand && product.brand !== filters.brand) return false;
      if (filters.minPrice && product.price < filters.minPrice) return false;
      if (filters.maxPrice && product.price > filters.maxPrice) return false;
      if (filters.inStock !== undefined && product.inStock !== filters.inStock) return false;
      if (filters.rating && product.rating < filters.rating) return false;
      return true;
    });
    return this.filteredProducts;
  }

  // Sort products
  sortProducts(sortOptions: ProductSortOptions): Product[] {
    const { field, direction } = sortOptions;
    
    this.filteredProducts.sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return this.filteredProducts;
  }

  // Get unique categories
  getCategories(): string[] {
    return [...new Set(this.products.map(product => product.category))];
  }

  // Get unique brands
  getBrands(): string[] {
    return [...new Set(this.products.map(product => product.brand))];
  }

  // Get price range
  getPriceRange(): { min: number; max: number } {
    if (this.products.length === 0) return { min: 0, max: 0 };
    
    const prices = this.products.map(product => product.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }
} 