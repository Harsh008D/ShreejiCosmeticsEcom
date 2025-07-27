import React, { useState, useEffect, useCallback } from 'react';
import { ProductController } from '../controllers/ProductController';
import { ProductFilters } from '../models/ProductModel';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Filter, Search, List, Grid } from 'lucide-react';

const Products: React.FC = () => {
  const [productController] = useState(() => new ProductController());
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ProductFilters>({});
  // Remove sortOptions state and use a simple string for sort
  const [sort, setSort] = useState('all');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSearchModal, setShowSearchModal] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loaded = await productController.loadProducts();
      setAllProducts(loaded);
      setProducts(loaded);
    } catch {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [productController]);

  const applyFiltersAndSearch = useCallback(() => {
    try {
      let result: Product[] = allProducts;
      // Debug logging
      console.log('All products:', allProducts);
      console.log('Search query:', searchQuery);

      // Apply search
      if (searchQuery.trim()) {
        const searchTerm = searchQuery.toLowerCase();
        result = result.filter(product => {
          const name = typeof product.name === 'string' ? product.name : '';
          const description = typeof product.description === 'string' ? product.description : '';
          const brand = typeof product.brand === 'string' ? product.brand : '';
          const category = typeof product.category === 'string' ? product.category : '';
          return (
            name.toLowerCase().includes(searchTerm) ||
            description.toLowerCase().includes(searchTerm) ||
            brand.toLowerCase().includes(searchTerm) ||
            category.toLowerCase().includes(searchTerm)
          );
        });
      }

      // Apply filters (only category and inStock)
      if (filters.category || filters.inStock !== undefined) {
        result = result.filter(product => {
          if (filters.category && product.category !== filters.category) return false;
          if (filters.inStock !== undefined && product.inStock !== filters.inStock) return false;
          return true;
        });
      }

      // Apply sort
      if (sort === 'category') {
        result = [...result].sort((a, b) => {
          const aCat = typeof a.category === 'string' ? a.category : '';
          const bCat = typeof b.category === 'string' ? b.category : '';
          return aCat.localeCompare(bCat);
        });
      } else if (sort === 'price-asc') {
        result = [...result].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      } else if (sort === 'price-desc') {
        result = [...result].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      }
      // 'all' means no sort

      setProducts(result);
      // Only clear error if it was a filtering/searching error, not a real error
      if (error && error.startsWith('Something went wrong')) setError(null);
    } catch (err: unknown) {
      setError('Something went wrong while filtering or searching products.');
      setProducts([]);
    }
  }, [allProducts, searchQuery, filters, sort, error]);

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
    setFilters({});
    setSearchQuery('');
    setSort('all'); // Reset sort to default
  };

  const getCategories = () => productController.getCategories();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" text="Loading products..." />
      </div>
    );
  }

  // Only show retry if a real error (not just empty search/filter result)
  if (error && !error.startsWith('Something went wrong')) {
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

  // Calculate filtered/total product counts
  const totalProducts = productController.getAllProducts().length;
  const showingCount = products.length;

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-8 pt-32">
      {/* Title and Subtitle */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Our Products</h1>
        <p className="text-lg text-gray-600">Discover our complete range of natural and handcrafted beauty products</p>
      </div>

      {/* Controls Card */}
      <div className="bg-white rounded-2xl shadow-md mx-auto w-full max-w-5xl px-2 py-2 sm:px-6 sm:py-4 flex flex-col gap-2 sm:gap-4 mb-6">
        {/* Controls Row */}
        <div className="flex flex-row items-center w-full gap-2 sm:gap-4">
          {/* Search: icon on mobile, input on desktop */}
          <button
            className="sm:hidden flex items-center justify-center p-2 rounded-lg border border-gray-200 bg-white hover:bg-emerald-50 text-emerald-700 font-medium shadow-sm transition-colors min-w-[44px]"
            aria-label="Search"
            title="Search"
            onClick={() => setShowSearchModal(true)}
          >
            <Search className="w-5 h-5" />
          </button>
          <div className="relative flex-1 min-w-0 hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg bg-white text-base placeholder-gray-400 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
            />
          </div>
          {/* Filter Icon (mobile) or Button (desktop) */}
          <button
            onClick={() => setShowFilterPanel(true)}
            className="flex items-center justify-center p-2 rounded-lg border border-gray-200 bg-white hover:bg-emerald-50 text-emerald-700 font-medium shadow-sm transition-colors min-w-[44px] sm:hidden"
            aria-label="Filter"
            title="Filter"
          >
            <Filter className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-emerald-50 text-emerald-700 font-medium shadow-sm transition-colors min-w-[44px] justify-center"
            aria-label="Filter"
            title="Filter"
          >
            <Filter className="w-5 h-5" />
            <span>Filter</span>
          </button>
          {/* Grid/List Toggle (always visible) */}
          <div className="flex items-center justify-center">
            <div className="flex rounded-xl bg-gray-50 border border-gray-200 p-1 gap-1">
              <button
                className={`p-2 rounded-lg border transition-colors ${viewMode === 'grid' ? 'bg-white text-emerald-600 border-emerald-200 shadow-sm ring-2 ring-emerald-200' : 'bg-gray-50 text-gray-600 border-transparent hover:bg-white hover:text-emerald-600'}`}
                aria-label="Grid View"
                title="Grid View"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                className={`p-2 rounded-lg border transition-colors ${viewMode === 'list' ? 'bg-white text-emerald-600 border-emerald-200 shadow-sm ring-2 ring-emerald-200' : 'bg-gray-50 text-gray-600 border-transparent hover:bg-white hover:text-emerald-600'}`}
                aria-label="List View"
                title="List View"
                onClick={() => setViewMode('list')}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel/Modal */}
      {showFilterPanel && (
        <div>
          {/* Mobile Modal */}
          <div className="fixed inset-0 z-50 flex items-end sm:hidden bg-black bg-opacity-40" onClick={() => setShowFilterPanel(false)}>
            <div className="bg-white w-full rounded-t-2xl p-6" onClick={e => e.stopPropagation()}>
              {/* Filter Panel Content */}
              <div className="grid grid-cols-1 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
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
                {/* Sort Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sort}
                    onChange={e => setSort(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="all">All</option>
                    <option value="category">Category</option>
                    <option value="price-asc">Price Low to High</option>
                    <option value="price-desc">Price High to Low</option>
                  </select>
                </div>
                {/* Stock Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
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
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={clearFilters}
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Clear All Filters
                </button>
                <button
                  onClick={() => setShowFilterPanel(false)}
                  className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
          {/* Desktop Sidebar/Popup */}
          <div className="hidden sm:fixed sm:inset-0 sm:z-50 sm:flex sm:items-center sm:justify-center bg-black bg-opacity-40" onClick={() => setShowFilterPanel(false)}>
            <div className="bg-white rounded-2xl p-8 w-full max-w-sm mx-auto" onClick={e => e.stopPropagation()}>
              <div className="text-lg font-semibold mb-4">Filter & Sort</div>
              <div className="grid grid-cols-1 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
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
                {/* Sort Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sort}
                    onChange={e => setSort(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="all">All</option>
                    <option value="category">Category</option>
                    <option value="price-asc">Price Low to High</option>
                    <option value="price-desc">Price High to Low</option>
                  </select>
                </div>
                {/* Stock Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
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
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={clearFilters}
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Clear All Filters
                </button>
                <button
                  onClick={() => setShowFilterPanel(false)}
                  className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal (mobile only) */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity sm:hidden">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fadeIn">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Search</h2>
              <button onClick={() => setShowSearchModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>
            <form onSubmit={e => { e.preventDefault(); setShowSearchModal(false); }}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-lg"
                autoFocus
              />
              <button
                type="submit"
                className="w-full mt-6 bg-[#12c08b] text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-[#0fa172] transition"
              >
                Search
              </button>
            </form>
          </div>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
            }
            .animate-fadeIn {
              animation: fadeIn 0.18s cubic-bezier(0.4,0,0.2,1);
            }
          `}</style>
        </div>
      )}

      {/* Showing X of Y products */}
      <div className="mb-4 text-gray-700 font-medium text-base">Showing {showingCount} of {totalProducts} products</div>

      {/* Products Grid or List */}
      {Array.isArray(products) && products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
          <button
            onClick={clearFilters}
            className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : Array.isArray(products) && viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : Array.isArray(products) ? (
        <div className="flex flex-col gap-6">
          {products.map((product: Product) => (
            <div className="w-full" key={product.id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default Products;