import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Heart, Shield, Star, CheckCircle } from 'lucide-react';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import apiService from '../services/api';

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        setLoading(true);
        const products = await apiService.getFeaturedProducts();
        setFeaturedProducts(products);
      } catch {
        console.error('Failed to load featured products');
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  const features = [
    {
      icon: <Leaf className="w-8 h-8 text-emerald-500" />,
      title: '100% Natural',
      description: 'Made with pure, organic ingredients sourced directly from nature'
    },
    {
      icon: <Heart className="w-8 h-8 text-rose-500" />,
      title: 'Handcrafted with Love',
      description: 'Each product is carefully made in small batches with traditional recipes'
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-500" />,
      title: 'Safe & Gentle',
      description: 'Dermatologically tested and suitable for all skin types'
    },
    {
      icon: <Star className="w-8 h-8 text-amber-500" />,
      title: 'Premium Quality',
      description: 'High-quality ingredients for effective and luxurious skincare'
    }
  ];

  const benefits = [
    'Chemical-free formulations',
    '30-day satisfaction guarantee',
    'Sustainable packaging',
    'Cruelty-free products',
    'Expert customer support',
    'Fast & secure delivery'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading featured products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-home-hero"
        ></div>
        <div className="absolute inset-0 bg-black bg-opacity-0"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            <span className="text-emerald-600">Pure.</span>
            <span className="text-rose-500"> Natural.</span>
            <span className="text-amber-600"> Beautiful.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover the power of nature with our handcrafted cosmetics made from the finest organic ingredients
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/products"
              className="bg-emerald-500 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-emerald-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <Link
              to="/about"
              className="border-2 border-emerald-500 text-emerald-600 px-8 py-4 rounded-full text-lg font-medium hover:bg-emerald-500 hover:text-white transition-all duration-300 transform hover:scale-105"
            >
              Our Story
            </Link>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-emerald-500 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-emerald-500 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Shreeji Cosmetics?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We believe in the power of nature to enhance your natural beauty with pure, effective, and sustainable products
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-rose-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our most loved products, carefully crafted with premium natural ingredients
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="text-center">
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 bg-emerald-500 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-emerald-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              <span>View All Products</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                The Shreeji Promise
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                We're committed to providing you with the highest quality natural cosmetics that not only enhance your beauty but also care for your skin's health and the environment.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <Link
                  to="/about"
                  className="inline-flex items-center space-x-2 text-emerald-600 font-medium hover:text-emerald-700 transition-colors duration-200"
                >
                  <span>Learn more about us</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Natural cosmetics"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl">
                <Leaf className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-500 to-rose-500">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Beauty Routine?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 leading-relaxed">
            Join thousands of satisfied customers who have discovered the power of natural beauty
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/products"
              className="bg-white text-emerald-600 px-8 py-4 rounded-full text-lg font-medium hover:bg-emerald-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2"
            >
              <span>Start Shopping</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <Link
              to="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-white hover:text-emerald-600 transition-all duration-300 transform hover:scale-105"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;