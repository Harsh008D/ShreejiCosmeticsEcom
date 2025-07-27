import React, { useState, useEffect, useCallback } from 'react';
import { ProductController } from '../controllers/ProductController';
import { ProductFilters, ProductSortOptions } from '../models/ProductModel';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Filter, Search } from 'lucide-react';

interface ProductListViewProps {
  title?: string;
  showFilters?: boolean;
  showSearch?: boolean;
  categoryFilter?: string;
  brandFilter?: string;
  limit?: number;
}

const ProductListView: React.FC<ProductListViewProps> = ({
  title = 'Products',
  showFilters = true,
  showSearch = true,
  categoryFilter,
  brandFilter,
  limit
}) => {
  const [productController] = useState(() => new ProductController());
  const [products, setProducts] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ProductFilters>({
    category: categoryFilter,
    brand: brandFilter
  });
  const [sortOptions, setSortOptions] = useState<ProductSortOptions>({
    field: 'name',
    direction: 'asc'
  });
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await productController.loadProducts();
      applyFiltersAndSearch();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [productController, applyFiltersAndSearch]);

  const applyFiltersAndSearch = useCallback(() => {
    let filteredProducts = productController.getAllProducts();

    // Apply search
    if (searchQuery.trim()) {
      filteredProducts = productController.searchProducts(searchQuery);
    }

    // Apply filters
    if (Object.keys(filters).some(key => filters[key as keyof ProductFilters])) {
      filteredProducts = productController.filterProducts(filters);
    }

    // Apply sorting
    filteredProducts = productController.sortProducts(sortOptions);

    // Apply limit
    if (limit) {
      filteredProducts = filteredProducts.slice(0, limit);
    }

    setProducts(filteredProducts);
  }, [productController, searchQuery, filters, sortOptions, limit]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [applyFiltersAndSearch]);

  const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({ category: categoryFilter, brand: brandFilter });
    setSearchQuery('');
  };

  const getCategories = () => productController.getCategories();
  const getBrands = () => productController.getBrands();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" text="Loading products..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={loadProducts}
          className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-2">
            {products.length} product{products.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          {/* Search */}
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Filter Toggle */}
          {showFilters && (
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          )}

          {/* Sort */}
          <select
            value={`${sortOptions.field}-${sortOptions.direction}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split('-') as [ProductSortOptions['field'], 'asc' | 'desc'];
              setSortOptions({ field, direction });
            }}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="price-asc">Price Low to High</option>
            <option value="price-desc">Price High to Low</option>
            <option value="rating-desc">Highest Rated</option>
            <option value="createdAt-desc">Newest First</option>
          </select>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && showFilterPanel && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange({ category: e.target.value || undefined })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {getCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <select
                value={filters.brand || ''}
                onChange={(e) => handleFilterChange({ brand: e.target.value || undefined })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">All Brands</option>
                {getBrands().map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice || ''}
                  onChange={(e) => handleFilterChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handleFilterChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Stock Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability
              </label>
              <select
                value={filters.inStock === undefined ? '' : filters.inStock.toString()}
                onChange={(e) => handleFilterChange({ inStock: e.target.value === '' ? undefined : e.target.value === 'true' })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">All</option>
                <option value="true">In Stock</option>
                <option value="false">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
          <button
            onClick={clearFilters}
            className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductListView; 