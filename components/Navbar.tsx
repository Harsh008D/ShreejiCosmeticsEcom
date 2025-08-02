import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, User, Menu, X, Leaf, ChevronDown, LogOut, Settings, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { getCartItemCount } = useCart();
  const { wishlistItems } = useWishlist();
  const { user, logout } = useAuth();
  const [pendingOrderCount, setPendingOrderCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    const fetchPendingOrderCount = async () => {
      if (user?.isAdmin) {
        try {
          const orders = await apiService.getAllOrders();
          const pending = orders.filter((order: Record<string, unknown>) => (order as { status: string }).status === 'pending').length;
          setPendingOrderCount(pending);
        } catch {
          setPendingOrderCount(0);
        }
      }
    };
    if (user?.isAdmin) {
      fetchPendingOrderCount();
      interval = setInterval(fetchPendingOrderCount, 5000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [user?.isAdmin]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' }
  ];

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  return (
    <nav className={`fixed top-4 left-4 right-4 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white/30 backdrop-blur-sm'
    } rounded-2xl border border-emerald-100`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-emerald-700">Shreeji</span>
              <span className="text-sm font-medium text-emerald-600">Cosmetics</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-medium px-4 py-2 rounded-full transition-colors duration-200 ${
                  location.pathname === link.to
                    ? 'text-white font-bold bg-emerald-500 hover:bg-emerald-500'
                    : 'text-gray-700 hover:text-emerald-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {!user?.isAdmin && (
              <>
                <Link
                  to="/wishlist"
                  className={`relative p-2 transition-all duration-300 rounded-lg ${
                    location.pathname === '/wishlist' ? 'text-rose-800 font-bold underline underline-offset-8 decoration-2 decoration-rose-700 bg-rose-100 shadow-sm scale-105' : 'text-gray-700 hover:text-rose-500'
                  }`}
                >
                  <Heart className="w-6 h-6" />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>
                <Link
                  to="/cart"
                  className={`relative p-2 transition-all duration-300 rounded-lg ${
                    location.pathname === '/cart' ? 'text-emerald-800 font-bold underline underline-offset-8 decoration-2 decoration-emerald-700 bg-emerald-100 shadow-sm scale-105' : 'text-gray-700 hover:text-emerald-600'
                  }`}
                >
                  <ShoppingCart className="w-6 h-6" />
                  {getCartItemCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {getCartItemCount()}
                    </span>
                  )}
                </Link>
              </>
            )}
            {user?.isAdmin && (
              <Link
                to="/admin"
                className={`relative p-2 transition-all duration-300 rounded-lg ${
                  location.pathname === '/admin' && !new URLSearchParams(location.search).get('tab')
                    ? 'text-emerald-800 font-bold underline underline-offset-8 decoration-2 decoration-emerald-700 bg-emerald-100 shadow-sm scale-105'
                    : 'text-gray-700 hover:text-emerald-600'
                }`}
                title="Admin Panel"
              >
                <Settings className="w-6 h-6" />
                {pendingOrderCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white z-10" />
                )}
              </Link>
            )}
            {user ? (
              <div className="relative user-menu-container">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 bg-emerald-500 text-white px-4 py-2 rounded-full hover:bg-emerald-600 transition-colors duration-200"
                >
                  <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    {!user.isAdmin && (
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>My Orders</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1 bg-emerald-500 text-white px-4 py-2 rounded-full hover:bg-emerald-600 transition-colors duration-200"
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile right-side actions: Only menu toggle on small screens */}
          <div className="flex items-center md:hidden">
            {user?.isAdmin && (
              <Link
                to="/admin"
                className={`relative mr-2 p-2 transition-all duration-300 rounded-lg ${
                  location.pathname === '/admin' && !new URLSearchParams(location.search).get('tab')
                    ? 'text-emerald-800 font-bold underline underline-offset-8 decoration-2 decoration-emerald-700 bg-emerald-100 shadow-sm scale-105'
                    : 'text-gray-700 hover:text-emerald-600'
                }`}
                title="Admin Panel"
              >
                <Settings className="w-6 h-6" />
                {pendingOrderCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white z-10" />
                )}
              </Link>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700 hover:text-emerald-600 transition-colors duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-emerald-100 py-4">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-gray-700 hover:text-emerald-600 transition-all duration-300 font-medium px-2 py-1 rounded-lg ${
                    location.pathname === link.to ? 'text-white font-bold bg-emerald-500 hover:bg-emerald-500 shadow-sm scale-105' : ''
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {!user?.isAdmin && (
                <div className="flex items-center justify-between pt-4 border-t border-emerald-100">
                  <div className="flex space-x-4">
                    <Link
                      to="/wishlist"
                      onClick={() => setIsMenuOpen(false)}
                      className={`relative p-2 transition-all duration-300 rounded-lg ${
                        location.pathname === '/wishlist' ? 'text-rose-800 font-bold underline underline-offset-8 decoration-2 decoration-rose-700 bg-rose-100 shadow-sm scale-105' : 'text-gray-700 hover:text-rose-500'
                      }`}
                    >
                      <Heart className="w-6 h-6" />
                      {wishlistItems.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {wishlistItems.length}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/cart"
                      onClick={() => setIsMenuOpen(false)}
                      className={`relative p-2 transition-all duration-300 rounded-lg ${
                        location.pathname === '/cart' ? 'text-emerald-800 font-bold underline underline-offset-8 decoration-2 decoration-emerald-700 bg-emerald-100 shadow-sm scale-105' : 'text-gray-700 hover:text-emerald-600'
                      }`}
                    >
                      <ShoppingCart className="w-6 h-6" />
                      {getCartItemCount() > 0 && (
                        <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {getCartItemCount()}
                        </span>
                      )}
                    </Link>
                  </div>
                </div>
              )}
              {/* User options for mobile */}
              {user && (
                <div className="mt-4 bg-white rounded-xl shadow border border-gray-200 p-4 flex flex-col space-y-2">
                  <div className="border-b border-gray-100 pb-2 mb-2">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  {/* Only show My Orders for non-admins, never show Admin Panel here */}
                  {!user.isAdmin && (
                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center space-x-2 px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>My Orders</span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
              {/* Show Login button if not logged in (mobile menu) */}
              {!user && (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-2 bg-emerald-500 text-white px-4 py-2 rounded-full hover:bg-emerald-600 transition-colors duration-200 mt-4 justify-center"
                >
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;