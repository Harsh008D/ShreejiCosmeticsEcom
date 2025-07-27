import React, { useState, useEffect } from 'react';
import { Leaf, Heart, Award, Users, CheckCircle, Star } from 'lucide-react';
import { BrandInfo } from '../types';
import apiService from '../services/api';

const About: React.FC = () => {
  const [brandInfo, setBrandInfo] = useState<BrandInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBrandInfo = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await apiService.getBrandInfo();
        setBrandInfo(data);
      } catch (error) {
        console.error('Failed to load brand info:', error);
        setError('Failed to load company information');
      } finally {
        setLoading(false);
      }
    };

    loadBrandInfo();
  }, []);

  const values = [
    {
      icon: <Leaf className="w-8 h-8 text-emerald-500" />,
      title: 'Natural & Pure',
      description: 'We use only the finest natural ingredients, sourced ethically and sustainably from trusted suppliers.'
    },
    {
      icon: <Heart className="w-8 h-8 text-rose-500" />,
      title: 'Handcrafted with Love',
      description: 'Every product is carefully handmade in small batches, ensuring quality and freshness in every jar.'
    },
    {
      icon: <Award className="w-8 h-8 text-amber-500" />,
      title: 'Quality Assured',
      description: 'All our products undergo rigorous testing to ensure they meet the highest standards of quality and safety.'
    },
    {
      icon: <Users className="w-8 h-8 text-blue-500" />,
      title: 'Customer First',
      description: 'Your satisfaction is our priority. We provide personalized care and support for all your beauty needs.'
    }
  ];

  const achievements = [
    { number: '5000+', label: 'Happy Customers' },
    { number: '50+', label: 'Natural Products' },
    { number: '3', label: 'Years of Excellence' },
    { number: '99%', label: 'Satisfaction Rate' }
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      rating: 5,
      text: 'Absolutely love their products! My skin has never felt better. The rose moisturizer is my favorite.'
    },
    {
      name: 'Anjali Patel',
      rating: 5,
      text: 'Natural ingredients, amazing results. I recommend Shreeji Cosmetics to all my friends and family.'
    },
    {
      name: 'Kavya Singh',
      rating: 5,
      text: 'The turmeric scrub transformed my skin completely. Pure, natural, and effective products!'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !brandInfo) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Company Information Unavailable</h2>
          <p className="text-gray-600 mb-8">{error || 'Unable to load company information.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            About <span className="text-emerald-600">{brandInfo.name}</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            {brandInfo.tagline}
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              {brandInfo.description}
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              Born from a passion for natural beauty and traditional wisdom, Shreeji Cosmetics began as a small family venture. 
              We believe that nature holds the key to true beauty, and our products are a testament to this philosophy.
            </p>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <Leaf className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">100% Natural</p>
                <p className="text-gray-600">No harmful chemicals or artificial additives</p>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Natural cosmetics workspace"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-emerald-400 to-rose-400 rounded-full opacity-20"></div>
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full opacity-20"></div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core principles guide everything we do and inspire us to create the best natural cosmetics for you
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-gray-50 rounded-full flex items-center justify-center">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements Section */}
        <div className="bg-gradient-to-r from-emerald-500 to-rose-500 rounded-3xl p-12 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Our Achievements</h2>
            <p className="text-xl text-emerald-100">
              Milestones that reflect our commitment to excellence and customer satisfaction
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-6xl font-bold text-white mb-2">
                  {achievement.number}
                </div>
                <div className="text-emerald-100 font-medium text-lg">
                  {achievement.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real experiences from real customers who have transformed their beauty routine with our products
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, starIndex) => (
                    <Star key={starIndex} className="w-5 h-5 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6 italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-rose-400 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-gray-600 text-sm">Verified Customer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-3xl p-12 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                To make natural, effective, and luxurious cosmetics accessible to everyone while promoting sustainable beauty practices 
                and supporting local communities.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                  <span className="text-gray-700">Sustainable and eco-friendly practices</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                  <span className="text-gray-700">Supporting local farmers and suppliers</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                  <span className="text-gray-700">Empowering women through natural beauty</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                  <span className="text-gray-700">Continuous innovation in natural cosmetics</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="https://images.pexels.com/photos/4465421/pexels-photo-4465421.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Natural ingredients"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;