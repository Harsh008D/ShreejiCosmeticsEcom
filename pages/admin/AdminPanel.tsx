import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { Package, Settings, BarChart3, Users, Plus, Edit, Trash2, Save, Filter, Search, Boxes } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Product, BrandInfo, User, ProductImage } from '../../types';
import apiService from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ConfirmDialog from '../../components/ConfirmDialog';
import AdminOrders from './AdminOrders';
import ImageUpload, { ImageUploadRef } from '../../components/ImageUpload';

const AdminPanel: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [brandInfo, setBrandInfo] = useState<BrandInfo | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{ 
    open: boolean; 
    action: 'add' | 'update' | 'delete' | null; 
    productId?: string;
    message?: string;
  }>({ open: false, action: null });
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [pendingOrderCount, setPendingOrderCount] = useState(0);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const products = await apiService.getProducts();
      setProducts(products || []);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Failed to load products:', error);
        setError('Failed to load products');
      } else {
        setError('Failed to load products');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBrandInfo = useCallback(async () => {
    try {
      const data = await apiService.getBrandInfo() as BrandInfo;
      setBrandInfo(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Failed to load brand info:', error);
      } else {
        console.error('Failed to load brand info:', error);
      }
    }
  }, []);

  const fetchPendingOrderCount = useCallback(async () => {
    try {
      const orders = await apiService.getAllOrders();
      const pending = orders.filter((order: { status: string }) => order.status === 'pending').length;
      setPendingOrderCount(pending);
    } catch {
      setPendingOrderCount(0);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadProducts();
      loadBrandInfo();
      fetchPendingOrderCount();
      // Poll for pending order count every 10 seconds
      const interval = setInterval(fetchPendingOrderCount, 5000);
      return () => clearInterval(interval);
    }
  }, [isAdmin, loadProducts, loadBrandInfo, fetchPendingOrderCount]);

  const deleteProduct = async (productId: string) => {
    try {
      setLoading(true);
      const response = await apiService.deleteProduct(productId);
      
      // Show detailed success message with cleanup info
      if (response.cleanup) {
        const cleanupInfo = response.cleanup;
        const message = `Product deleted successfully!\n\nCleanup completed:\n• ${cleanupInfo.imagesDeleted} images removed from Cloudinary\n• All reviews deleted\n• Removed from ${cleanupInfo.cartsUpdated} carts\n• Removed from ${cleanupInfo.wishlistsUpdated} wishlists\n• Updated ${cleanupInfo.ordersUpdated} orders`;
        showSuccess('Product Deleted', message);
      } else {
        showSuccess('Product Deleted', 'Product has been successfully deleted');
      }
      
      await loadProducts(); // Reload products after deletion
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Failed to delete product:', error);
        showError('Delete Failed', error.message || 'Failed to delete product');
      } else {
        showError('Delete Failed', 'Failed to delete product');
      }
    } finally {
      setLoading(false);
    }
  };

  // saveProducts is no longer used, removed to fix unused variable warning

  const saveBrandInfo = async (updatedBrandInfo: BrandInfo) => {
    try {
      await apiService.updateBrandInfo(updatedBrandInfo);
      setBrandInfo(updatedBrandInfo);
      showSuccess('Brand Info Updated', 'Brand information has been successfully updated');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Failed to save brand info:', error);
        showError('Save Failed', error.message || 'Failed to save brand info');
      } else {
        showError('Save Failed', 'Failed to save brand info');
      }
    }
  };

  // Fetch pending order count for red dot
  // const fetchPendingOrderCount = async () => {
  //   try {
  //     const orders = await apiService.getAllOrders();
  //     const pending = orders.filter((order: any) => order.status === 'pending').length;
  //     setPendingOrderCount(pending);
  //   } catch (e: unknown) {
  //     setPendingOrderCount(0);
  //   }
  // };

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const tabs = [
    { id: 'products', label: 'Products', icon: <Boxes className="w-5 h-5" /> },
    { id: 'brand', label: 'Brand Info', icon: <Settings className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-5 h-5" /> },
    { id: 'orders', label: 'Orders', icon: <Package className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage your Shreeji Cosmetics store</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-md mb-8">
          <div className="flex justify-center gap-x-4 md:gap-x-8 lg:gap-x-10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col md:flex-row items-center md:space-x-2 px-4 md:px-6 py-3 md:py-4 transition-colors duration-200 focus:outline-none relative ${
                  activeTab === tab.id
                    ? 'text-emerald-600 border-b-2 border-emerald-500'
                    : 'text-gray-600 hover:text-emerald-600'
                }`}
                style={{ minWidth: 0 }}
              >
                {tab.icon}
                <span className="hidden md:inline ml-0 md:ml-2" style={{ position: 'relative' }}>
                  {tab.label}
                  {tab.id === 'orders' && pendingOrderCount > 0 && (
                    <span style={{
                      display: 'inline-block',
                      position: 'absolute',
                      top: '-6px',
                      right: '-16px',
                      width: '10px',
                      height: '10px',
                      background: '#ef4444',
                      borderRadius: '50%',
                      border: '2px solid white',
                    }} />
                  )}
                </span>
                {/* Red dot for orders icon on mobile */}
                {tab.id === 'orders' && pendingOrderCount > 0 && (
                  <span className="md:hidden" style={{
                    position: 'absolute',
                    top: 8,
                    right: 16,
                    width: '10px',
                    height: '10px',
                    background: '#ef4444',
                    borderRadius: '50%',
                    border: '2px solid white',
                  }} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && activeTab === 'products' && (
          <ProductsTab
            products={products}
            deleteProduct={deleteProduct}
            editingProduct={editingProduct}
            setEditingProduct={setEditingProduct}
            showProductForm={showProductForm}
            setShowProductForm={setShowProductForm}
            loadProducts={loadProducts}
            showSuccess={showSuccess}
            showError={showError}
            confirmDialog={confirmDialog}
            setConfirmDialog={setConfirmDialog}
            showSearchModal={showSearchModal}
            setShowSearchModal={setShowSearchModal}
          />
        )}

        {!loading && activeTab === 'brand' && brandInfo && (
          <BrandInfoTab
            brandInfo={brandInfo}
            saveBrandInfo={saveBrandInfo}
          />
        )}

        {!loading && activeTab === 'analytics' && <AnalyticsTab products={products} />}

        {!loading && activeTab === 'users' && <UsersTab />}
        {!loading && activeTab === 'orders' && <AdminOrders />}
      </div>
    </div>
  );
};

// Products Tab Component
const ProductsTab: React.FC<{
  products: Product[];
  deleteProduct: (productId: string) => void;
  editingProduct: Product | null;
  setEditingProduct: (product: Product | null) => void;
  showProductForm: boolean;
  setShowProductForm: (show: boolean) => void;
  loadProducts: () => Promise<void>;
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string) => void;
  confirmDialog: { 
    open: boolean; 
    action: 'add' | 'update' | 'delete' | null; 
    productId?: string;
    message?: string;
  };
  setConfirmDialog: (dialog: { 
    open: boolean; 
    action: 'add' | 'update' | 'delete' | null; 
    productId?: string;
    message?: string;
  }) => void;
  showSearchModal: boolean;
  setShowSearchModal: (show: boolean) => void;
}> = ({ products, deleteProduct, editingProduct, setEditingProduct, showProductForm, setShowProductForm, loadProducts, showSuccess, showError, confirmDialog, setConfirmDialog, showSearchModal, setShowSearchModal }) => {
  
  // Helper function to get the best image URL for a product
  const getProductImageUrl = (product: Product): string => {
    if (product.images && product.images.length > 0) {
      const thumbnail = product.images.find(img => img.isThumbnail);
      return thumbnail?.url || product.images[0].url;
    }
    return product.image || 'https://via.placeholder.com/400x400?text=No+Image';
  };
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: '',
    image: '',
    images: [],
    description: '',
    ingredients: [],
    ingredientsRaw: '',
    usage: '',
    category: '',
    inStock: true,
    featured: false,
    stockQuantity: 0,
    rating: 0,
    numReviews: 0
  });
  const [imagesMarkedForDeletion, setImagesMarkedForDeletion] = useState<string[]>([]);
  const [localImages, setLocalImages] = useState<any[]>([]);
  const imageUploadRef = useRef<ImageUploadRef>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{ category: string; inStock: boolean | undefined }>({ category: '', inStock: undefined });
  const [sort, setSort] = useState('all');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    if (editingProduct) {
      // Ensure ingredients is always string[] in formData
      setFormData({
        ...editingProduct,
        images: editingProduct.images || [],
        // Preserve existing image URL if no uploaded images
        image: editingProduct.image || '',
        ingredients: Array.isArray(editingProduct.ingredients)
          ? editingProduct.ingredients
          : typeof editingProduct.ingredients === 'string'
            ? (editingProduct.ingredients as string).split('\n').filter((i: string) => i && i.trim())
            : []
      });
      setShowProductForm(true);
    }
  }, [editingProduct, setShowProductForm]);

  useEffect(() => {
    let result = products;
    // Search
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase();
      result = result.filter(product => {
        const name = typeof product.name === 'string' ? product.name : '';
        const description = typeof product.description === 'string' ? product.description : '';
        const category = typeof product.category === 'string' ? product.category : '';
        return (
          name.toLowerCase().includes(searchTerm) ||
          description.toLowerCase().includes(searchTerm) ||
          category.toLowerCase().includes(searchTerm)
        );
      });
    }
    // Filter
    if (filters.category || filters.inStock !== undefined) {
      result = result.filter(product => {
        if (filters.category && product.category !== filters.category) return false;
        if (filters.inStock !== undefined && typeof product.inStock === 'boolean' && product.inStock !== filters.inStock) return false;
        return true;
      });
    }
    // Sort
    if (sort === 'featured') {
      result = [...result].sort((a, b) => (b.featured === true ? 1 : 0) - (a.featured === true ? 1 : 0));
    } else if (sort === 'category') {
      result = [...result].sort((a, b) => {
        const aCat = typeof a.category === 'string' ? a.category : '';
        const bCat = typeof b.category === 'string' ? b.category : '';
        return aCat.localeCompare(bCat);
      });
    } else if (sort === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    }
    setFilteredProducts(result);
  }, [products, searchQuery, filters, sort]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleIngredientsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value: string = e.target.value;
    // Split by newlines and filter out empty lines, but preserve the raw value for display
    const ingredients: string[] = value 
      ? value.split('\n')
          .map(item => item.trim())
          .filter(item => item.length > 0)
      : [];
    
    setFormData(prev => ({ 
      ...prev, 
      ingredients,
      // Store the raw value for better UX
      ingredientsRaw: value 
    }));
  };

  const handleImagesUploaded = (newImages: ProductImage[]) => {
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), ...newImages]
    }));
  };

  const handleLocalImagesSelected = (images: any[]) => {
    setLocalImages(images);
  };

  const handleImageDelete = (publicId: string) => {
    // For new images that haven't been saved yet (immediate deletion)
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter(img => img.publicId !== publicId)
    }));
  };

  const handleImageMarkForDeletion = (publicId: string) => {
    console.log('handleImageMarkForDeletion called with publicId:', publicId);
    // For existing images in edit mode (mark for deletion)
    setImagesMarkedForDeletion(prev => {
      console.log('Previous images marked for deletion:', prev);
      const newList = [...prev, publicId];
      console.log('New images marked for deletion:', newList);
      return newList;
    });
    setFormData(prev => {
      console.log('Previous formData.images:', prev.images);
      const filteredImages = (prev.images || []).filter(img => img.publicId !== publicId);
      console.log('Filtered images:', filteredImages);
      return {
        ...prev,
        images: filteredImages
      };
    });
  };

  const validateForm = (data: Partial<Product>) => {
    if (!data.name || data.name.length < 2) return 'Product name must be at least 2 characters.';
    if (data.price === undefined || data.price === null || isNaN(Number(data.price)) || Number(data.price) < 0) return 'Product price is required and must be non-negative.';
    
    // For new products, require either image URL, uploaded images, or local images
    if (!editingProduct) {
      const hasImageUrl = data.image && /^https?:\/\//.test(data.image);
      const hasUploadedImages = data.images && data.images.length > 0;
      const hasLocalImages = localImages.length > 0;
      if (!hasImageUrl && !hasUploadedImages && !hasLocalImages) {
        return 'Product must have either an image URL or uploaded images.';
      }
    }
    
    if (!data.description || data.description.length < 10) return 'Description must be at least 10 characters.';
    if (!data.usage || data.usage.length < 10) return 'Usage instructions must be at least 10 characters.';
    if (!data.category || !['Face Care', 'Hair Care', 'Body Care', 'Lip Care', 'Other'].includes(data.category)) return 'Please select a valid category.';
    const ingredientsArr = Array.isArray(data.ingredients)
      ? (data.ingredients as string[]).filter((i: string) => i && i.trim())
      : (typeof data.ingredients === 'string' ? (data.ingredients as string).split('\n').filter((i: string) => i && i.trim()) : []);
    if (!ingredientsArr.length) return 'At least one ingredient is required.';
    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errorMsg = validateForm(formData);
    if (errorMsg) {
      showError('Validation Error', errorMsg);
      return;
    }
    // Show confirm dialog for add/update
    setConfirmDialog({ open: true, action: editingProduct ? 'update' : 'add' });
  };

  const handleDelete = (productId: string) => {
    setConfirmDialog({ 
      open: true, 
      action: 'delete', 
      productId,
      message: 'This will permanently delete the product and remove all associated data including images, reviews, cart items, and wishlist entries. This action cannot be undone.'
    });
  };

  // Move actual add/update/delete logic to handlers for dialog
  const handleConfirm = async () => {
    if (confirmDialog.action === 'delete' && confirmDialog.productId) {
      deleteProduct(confirmDialog.productId);
      setConfirmDialog({ open: false, action: null });
      return;
    }
    if (confirmDialog.action === 'add' || confirmDialog.action === 'update') {
      try {
        console.log('Starting product save process...');
        console.log('Local images count:', localImages.length);
        console.log('Images marked for deletion:', imagesMarkedForDeletion);
        console.log('Image upload ref:', imageUploadRef.current);
        
        // For edit mode: Delete marked images from Cloudinary first
        if (confirmDialog.action === 'update' && imagesMarkedForDeletion.length > 0) {
          console.log('Deleting marked images from Cloudinary...');
          for (const publicId of imagesMarkedForDeletion) {
            try {
              const { apiService } = await import('../../services/ApiService');
              await apiService.deleteImage(publicId);
              console.log('Successfully deleted image from Cloudinary:', publicId);
            } catch (error) {
              console.error('Failed to delete image from Cloudinary:', publicId, error);
              // Continue with other operations even if one deletion fails
            }
          }
        }
        
        // Upload local images first if any
        let uploadedImages: ProductImage[] = [];
        if (localImages.length > 0 && imageUploadRef.current) {
          console.log('Uploading local images to Cloudinary...');
          try {
            uploadedImages = await imageUploadRef.current.uploadLocalImages();
            console.log('Successfully uploaded images:', uploadedImages);
          } catch (error) {
            console.error('Failed to upload images:', error);
            showError('Upload Failed', 'Failed to upload images. Please try again.');
            return;
          }
        } else {
          console.log('No local images to upload or ref not available');
        }

        // Normalize images to always be array of objects
        let normalizedImages: ProductImage[] = [];
        if (Array.isArray(formData.images)) {
          normalizedImages = formData.images.map((img, idx) => {
            if (typeof img === 'string') {
              return {
                url: img,
                publicId: 'legacy-' + idx,
                isThumbnail: idx === 0,
              };
            }
            return img;
          });
        }

        // Combine existing images with newly uploaded ones
        const allImages = [...normalizedImages, ...uploadedImages];
        console.log('All images for product:', allImages);

        // Prepare payload, only include fields that are provided
        const payload: Partial<Product> = {
          name: formData.name,
          price: Number(formData.price),
          description: formData.description,
          ingredients: Array.isArray(formData.ingredients)
            ? formData.ingredients
            : [],
          usage: formData.usage,
          category: formData.category,
          inStock: !!formData.inStock,
          featured: !!formData.featured,
          stockQuantity: Number(formData.stockQuantity) || 0,
          rating: Number(formData.rating) || 0,
          numReviews: Number(formData.numReviews) || 0
        };

        // Only include image fields if they are provided
        if (formData.image) {
          payload.image = formData.image;
        }
        
        // Always include images array if we have any images
        if (allImages.length > 0) {
          payload.images = allImages;
          console.log('Including images in payload:', payload.images);
        } else {
          console.log('No images to include in payload');
        }

        console.log('Final payload:', payload);

        if (confirmDialog.action === 'add') {
          console.log('Creating product with payload:', JSON.stringify(payload, null, 2));
          await apiService.createProduct(payload);
          showSuccess('Product Added', 'Product has been successfully created');
        } else if (confirmDialog.action === 'update' && editingProduct) {
          console.log('Updating product with payload:', JSON.stringify(payload, null, 2));
          await apiService.updateProduct(editingProduct.id!, payload);
          showSuccess('Product Updated', 'Product has been successfully updated');
        }

        // Reset form
        setFormData({
          name: '',
          price: '',
          image: '',
          images: [],
          description: '',
          ingredients: [],
          ingredientsRaw: '',
          usage: '',
          category: '',
          inStock: true,
          featured: false,
          stockQuantity: 0,
          rating: 0,
          numReviews: 0
        });
        setImagesMarkedForDeletion([]);
        setLocalImages([]);
        setEditingProduct(null);
        setShowProductForm(false);
        await loadProducts();
      } catch (err: unknown) {
        console.error('Product save error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to save product.';
        showError('Save Failed', errorMessage);
      }
      setConfirmDialog({ open: false, action: null });
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Product Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 text-center w-full">Products Management</h2>
      </div>

      {/* Controls Card */}
      <div className="bg-white rounded-2xl shadow-md mx-auto w-full max-w-5xl px-2 py-2 sm:px-6 sm:py-4 flex flex-col gap-2 sm:gap-4 mb-6">
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
          {/* Filter Button (always visible, opens popup modal) */}
          <button
            onClick={() => setShowFilterPanel(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-emerald-50 text-emerald-700 font-medium shadow-sm transition-colors min-w-[44px] justify-center"
            aria-label="Filter"
            title="Filter"
          >
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline">Filter</span>
          </button>
          {/* Sort Dropdown */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 bg-white text-base text-gray-700 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
          >
            <option value="all">Sort By</option>
            <option value="featured">Featured</option>
            <option value="category">Category</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
        {/* Filter Panel (always popup modal) */}
        {showFilterPanel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fadeIn">
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Filter & Sort</h2>
                <button onClick={() => setShowFilterPanel(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-lg"
                  >
                    <option value="">All Categories</option>
                    <option value="Face Care">Face Care</option>
                    <option value="Hair Care">Hair Care</option>
                    <option value="Body Care">Body Care</option>
                    <option value="Lip Care">Lip Care</option>
                  </select>
                </div>
                {/* Sort option removed from filter modal */}
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-2">Availability</label>
                  <select
                    value={filters.inStock === undefined ? '' : filters.inStock ? 'in' : 'out'}
                    onChange={e => setFilters(f => ({ ...f, inStock: e.target.value === '' ? undefined : e.target.value === 'in' }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-lg"
                  >
                    <option value="">All</option>
                    <option value="in">In Stock</option>
                    <option value="out">Out of Stock</option>
                  </select>
                </div>
                <div className="flex justify-between items-center mt-6">
                  <button
                    onClick={() => {
                      setFilters({ category: '', inStock: undefined });
                      setSort('all');
                    }}
                    className="text-emerald-600 font-semibold text-lg hover:underline"
                  >
                    Clear All Filters
                  </button>
                  <button
                    onClick={() => setShowFilterPanel(false)}
                    className="bg-[#12c08b] text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-[#0fa172] transition"
                  >
                    Apply
                  </button>
                </div>
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
          </div>
        )}
      </div>

      {/* Add Product Button (moved below controls) */}
      <div className="w-full flex justify-center mb-6">
        <button
          onClick={() => {
            setEditingProduct(null);
            setFormData({
              name: '',
              price: '',
              image: '',
              description: '',
              ingredients: [],
              ingredientsRaw: '',
              usage: '',
              category: '',
              inStock: true,
              featured: false,
              stockQuantity: 0,
              rating: 0,
              numReviews: 0
            });
            setImagesMarkedForDeletion([]);
            setShowProductForm(true);
          }}
          className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-600 transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Product Form */}
      {showProductForm && (
        <div className="bg-white rounded-2xl shadow-md p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <button
              onClick={() => {
                setShowProductForm(false);
                setEditingProduct(null);
                setImagesMarkedForDeletion([]);
              }}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
              <input
                type="number"
                name="price"
                required
                value={formData.price}
                onChange={handleInputChange}
                onWheel={e => e.currentTarget.blur()}
                className="w-full px-4 py-3 border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
              <ImageUpload
                ref={imageUploadRef}
                onImagesUploaded={handleImagesUploaded}
                existingImages={formData.images || []}
                onImageDelete={handleImageDelete}
                onImageMarkForDeletion={handleImageMarkForDeletion}
                maxImages={10}
                allowImmediateDelete={false} // Disable immediate delete for both new and edit
                delayedUpload={true} // Enable delayed upload for both new and edit products
                onLocalImagesSelected={handleLocalImagesSelected}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select Category</option>
                <option value="Face Care">Face Care</option>
                <option value="Hair Care">Hair Care</option>
                <option value="Body Care">Body Care</option>
                <option value="Lip Care">Lip Care</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
              <input
                type="number"
                name="stockQuantity"
                min={0}
                value={formData.stockQuantity ?? 0}
                onChange={handleInputChange}
                onWheel={e => e.currentTarget.blur()}
                className="w-full px-4 py-3 border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                required
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients (one per line)</label>
              <textarea
                name="ingredients"
                rows={4}
                value={formData.ingredientsRaw || (formData.ingredients ?? []).join('\n')}
                onChange={handleIngredientsChange}
                placeholder="Enter ingredients, one per line&#10;Example:&#10;Aloe Vera&#10;Coconut Oil&#10;Vitamin E"
                className="w-full px-4 py-3 border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Usage Instructions</label>
              <textarea
                name="usage"
                required
                rows={3}
                value={formData.usage}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="inStock"
                  checked={formData.inStock}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                In Stock
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Featured Product
              </label>
            </div>

            <div className="md:col-span-2 flex space-x-4">
              <button
                type="submit"
                className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-600 transition-colors duration-200 flex items-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>{editingProduct ? 'Update Product' : 'Add Product'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowProductForm(false);
                  setEditingProduct(null);
                  // Reset form data
                  setFormData({
                    name: '', 
                    price: '', 
                    image: '', 
                    images: [], 
                    description: '', 
                    ingredients: [], 
                    ingredientsRaw: '',
                    usage: '', 
                    category: '', 
                    inStock: true, 
                    featured: false,
                    stockQuantity: 0,
                    rating: 0,
                    numReviews: 0
                  });
                  setImagesMarkedForDeletion([]);
                }}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Responsive Product Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:hidden gap-4">
        {filteredProducts.map((product: Product) => (
          <div key={product.id} className="bg-white rounded-2xl shadow-md p-4 flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <img 
                src={getProductImageUrl(product)} 
                alt={product.name} 
                className="w-16 h-16 rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/64x64?text=No+Image';
                }}
              />
              <div className="flex-1">
                <div className="font-bold text-lg text-gray-900">{product.name}</div>
                <div className="text-gray-600 text-sm">{product.category}</div>
                {product.featured && (
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full mt-1 inline-block">Featured</span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="font-semibold text-emerald-600">₹{product.price}</div>
              <div className="text-gray-900 font-medium">Stock: {product.stockQuantity ?? 0}</div>
            </div>
            <div className="flex justify-between items-center">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
              <div className="flex space-x-2">
                <button onClick={() => setEditingProduct(product)} className="p-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(product._id || product.id || '')} className="p-2 text-red-600 hover:text-red-800 transition-colors duration-200"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Table for md+ screens */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Product</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Category</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Price</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Stock</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={getProductImageUrl(product)}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/48x48?text=No+Image';
                        }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        {product.featured && (
                          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{product.category}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">₹{product.price}</td>
                  <td className="px-6 py-4 text-gray-900 font-medium">{product.stockQuantity ?? 0}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      product.inStock
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="p-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id || product.id || '')}
                        className="p-2 text-red-600 hover:text-red-800 transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* ConfirmDialog for product actions */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.action === 'delete' ? 'Delete Product?' : confirmDialog.action === 'add' ? 'Add Product?' : 'Update Product?'}
        message={
          confirmDialog.action === 'delete'
            ? confirmDialog.message || 'Are you sure you want to delete this product? This action cannot be undone.'
            : confirmDialog.action === 'add'
            ? 'Are you sure you want to add this product?'
            : 'Are you sure you want to update this product?'
        }
        confirmText={confirmDialog.action === 'delete' ? 'Delete' : confirmDialog.action === 'add' ? 'Add' : 'Update'}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmDialog({ open: false, action: null })}
      />
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
    </div>
  );
};

// Brand Info Tab Component
const BrandInfoTab: React.FC<{
  brandInfo: BrandInfo;
  saveBrandInfo: (brandInfo: BrandInfo) => void;
}> = ({ brandInfo, saveBrandInfo }) => {
  const [formData, setFormData] = useState(brandInfo);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Handle businessHours fields
    if (name.startsWith('businessHours.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        businessHours: {
          ...prev.businessHours,
          [key]: value
        }
      }));
    } else if (name.startsWith('socialMedia.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [key]: value
        }
      }));
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add any validation here and call showError if needed
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    saveBrandInfo(formData);
    setShowConfirm(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Brand Information</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Brand Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Tagline</label>
            <input
              type="text"
              name="tagline"
              value={formData.tagline}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">WhatsApp Number</label>
          <input
            type="tel"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
          <textarea
            name="address"
            rows={3}
            value={formData.address}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        {/* Business Hours Section */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Business Hours</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="block text-sm text-gray-700 mb-1">Monday to Friday</label>
              <input
                type="text"
                name="businessHours.mondayToFriday"
                value={formData.businessHours?.mondayToFriday || ''}
                onChange={handleInputChange}
                className="w-full min-w-0 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="e.g. 9:00 AM - 7:00 PM"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-sm text-gray-700 mb-1">Saturday</label>
              <input
                type="text"
                name="businessHours.saturday"
                value={formData.businessHours?.saturday || ''}
                onChange={handleInputChange}
                className="w-full min-w-0 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="e.g. 10:00 AM - 6:00 PM"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-sm text-gray-700 mb-1">Sunday</label>
              <input
                type="text"
                name="businessHours.sunday"
                value={formData.businessHours?.sunday || ''}
                onChange={handleInputChange}
                className="w-full min-w-0 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Closed"
              />
            </div>
          </div>
        </div>
        {/* Social Media Links Section */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Social Media Links</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="block text-sm text-gray-700 mb-1">Facebook</label>
              <input
                type="url"
                name="socialMedia.facebook"
                value={formData.socialMedia?.facebook || ''}
                onChange={handleInputChange}
                className="w-full min-w-0 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Facebook URL"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-sm text-gray-700 mb-1">Instagram</label>
              <input
                type="url"
                name="socialMedia.instagram"
                value={formData.socialMedia?.instagram || ''}
                onChange={handleInputChange}
                className="w-full min-w-0 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Instagram URL"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-sm text-gray-700 mb-1">X (Twitter)</label>
              <input
                type="url"
                name="socialMedia.twitter"
                value={formData.socialMedia?.twitter || ''}
                onChange={handleInputChange}
                className="w-full min-w-0 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="X (Twitter) URL"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-sm text-gray-700 mb-1">LinkedIn</label>
              <input
                type="url"
                name="socialMedia.linkedin"
                value={formData.socialMedia?.linkedin || ''}
                onChange={handleInputChange}
                className="w-full min-w-0 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                placeholder="LinkedIn URL"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-600 transition-colors duration-200 flex items-center space-x-2"
        >
          <Save className="w-5 h-5" />
          <span>Save Changes</span>
        </button>
      </form>
      <ConfirmDialog
        open={showConfirm}
        title="Update Brand Info?"
        message="Are you sure you want to update the brand information?"
        confirmText="Update"
        cancelText="Cancel"
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
      />
    </div>
  );
};

// Analytics Tab Component
const AnalyticsTab: React.FC<{ products: Product[] }> = ({ products }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Total Products</p>
            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
          </div>
          <Package className="w-8 h-8 text-emerald-500" />
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">In Stock</p>
            <p className="text-2xl font-bold text-gray-900">
              {products.filter((p: Product) => p.inStock).length}
            </p>
          </div>
          <BarChart3 className="w-8 h-8 text-green-500" />
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Featured Products</p>
            <p className="text-2xl font-bold text-gray-900">
              {products.filter((p: Product) => p.featured).length}
            </p>
          </div>
          <Package className="w-8 h-8 text-amber-500" />
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Categories</p>
            <p className="text-2xl font-bold text-gray-900">
              {new Set(products.map((p: Product) => p.category)).size}
            </p>
          </div>
          <Settings className="w-8 h-8 text-blue-500" />
        </div>
      </div>
    </div>
  );
};

// Users Tab Component
const UsersTab: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await apiService.getUsers();
        console.log('API /api/users response:', response);
        setUsers(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    };

    loadUsers();
  }, []);

  // Show all users, including admins
  const allUsers = users;

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 text-center w-full">Registered Users</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Name</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Email</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Registration Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {allUsers.map((user) => (
              <tr key={user._id || user.id}>
                <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                <td className="px-6 py-4 text-gray-600">
                  {user._id ? new Date(user.createdAt || Date.now()).toLocaleDateString() : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {allUsers.length === 0 && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No registered users yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;