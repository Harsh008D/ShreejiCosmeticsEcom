import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Clock, Send } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram, faXTwitter, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
// Official SVGs for Facebook, Instagram, X, LinkedIn
import { BrandInfo } from '../types';
import apiService from '../services/api';

const Contact: React.FC = () => {
  const [brandInfo, setBrandInfo] = useState<BrandInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    const loadBrandInfo = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await apiService.getBrandInfo();
        setBrandInfo(data);
      } catch {
        console.error('Failed to load brand info');
        setError('Failed to load company information');
      } finally {
        setLoading(false);
      }
    };

    loadBrandInfo();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandInfo?.whatsapp) return;

    const message = `Hello! I'm contacting you through your website.

Name: ${formData.name}
Email: ${formData.email}
Subject: ${formData.subject}

Message:
${formData.message}`;

    const whatsappUrl = `https://wa.me/${brandInfo.whatsapp.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Reset form
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

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
            <MessageCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information Unavailable</h2>
          <p className="text-gray-600 mb-8">{error || 'Unable to load contact information.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Get in <span className="text-emerald-600">Touch</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We'd love to hear from you! Whether you have questions about our products, need skincare advice, 
            or want to share your experience, we're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-md overflow-hidden max-w-md w-full mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Phone</p>
                    <p className="text-gray-600">{brandInfo.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="min-w-0 w-full">
                    <p className="font-semibold text-gray-900 mb-1">Email</p>
                    <p className="text-gray-600 break-all w-full">{brandInfo.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">WhatsApp</p>
                    <p className="text-gray-600">{brandInfo.whatsapp}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-rose-600" />
                  </div>
                  <div className="min-w-0 w-full">
                    <p className="font-semibold text-gray-900 mb-1">Address</p>
                    <p className="text-gray-600 break-all w-full">{brandInfo.address}</p>
                  </div>
                </div>
                {/* Social Media Icons */}
                <div className="flex items-center justify-center space-x-4 pt-4">
                  {/* Facebook */}
                  {brandInfo.socialMedia?.facebook ? (
                    <a
                      href={brandInfo.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg transition-colors cursor-pointer group hover:bg-blue-600"
                      title="Visit our Facebook page"
                      aria-label="Visit our Facebook page"
                    >
                      <FontAwesomeIcon icon={faFacebookF} className="w-5 h-5 transition-colors group-hover:text-white text-blue-600" />
                    </a>
                  ) : (
                    <span className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg transition-colors group hover:bg-blue-600 cursor-pointer">
                      <FontAwesomeIcon icon={faFacebookF} className="w-5 h-5 transition-colors group-hover:text-white text-blue-600" />
                    </span>
                  )}
                  {/* Instagram */}
                  {brandInfo.socialMedia?.instagram ? (
                    <a
                      href={brandInfo.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg transition-colors cursor-pointer group hover:bg-pink-500"
                      title="Visit our Instagram page"
                      aria-label="Visit our Instagram page"
                    >
                      <FontAwesomeIcon icon={faInstagram} className="w-5 h-5 transition-colors group-hover:text-white text-pink-500" />
                    </a>
                  ) : (
                    <span className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg transition-colors group hover:bg-pink-500 cursor-pointer">
                      <FontAwesomeIcon icon={faInstagram} className="w-5 h-5 transition-colors group-hover:text-white text-pink-500" />
                    </span>
                  )}
                  {/* X (Twitter) */}
                  {brandInfo.socialMedia?.twitter ? (
                    <a
                      href={brandInfo.socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg transition-colors cursor-pointer group hover:bg-black"
                      title="Visit our X (Twitter) page"
                      aria-label="Visit our X (Twitter) page"
                    >
                      <FontAwesomeIcon icon={faXTwitter} className="w-5 h-5 transition-colors group-hover:text-white text-black" />
                    </a>
                  ) : (
                    <span className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg transition-colors group hover:bg-black cursor-pointer">
                      <FontAwesomeIcon icon={faXTwitter} className="w-5 h-5 transition-colors group-hover:text-white text-black" />
                    </span>
                  )}
                  {/* LinkedIn */}
                  {brandInfo.socialMedia?.linkedin ? (
                    <a
                      href={brandInfo.socialMedia.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg transition-colors cursor-pointer group hover:bg-blue-700"
                      title="Visit our LinkedIn page"
                      aria-label="Visit our LinkedIn page"
                    >
                      <FontAwesomeIcon icon={faLinkedinIn} className="w-5 h-5 transition-colors group-hover:text-white text-blue-700" />
                    </a>
                  ) : (
                    <span className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg transition-colors group hover:bg-blue-700 cursor-pointer">
                      <FontAwesomeIcon icon={faLinkedinIn} className="w-5 h-5 transition-colors group-hover:text-white text-blue-700" />
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-2xl p-8 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Clock className="w-6 h-6 text-emerald-600 mr-2" />
                Business Hours
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Monday to Friday</span>
                  <span className="font-medium text-gray-900">{brandInfo.businessHours?.mondayToFriday || 'Closed'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Saturday</span>
                  <span className="font-medium text-gray-900">{brandInfo.businessHours?.saturday || 'Closed'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sunday</span>
                  <span className="font-medium text-gray-900">{brandInfo.businessHours?.sunday || 'Closed'}</span>
                </div>
              </div>
            </div>

            {/* Quick WhatsApp */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-8 text-white">
              <h3 className="text-xl font-bold mb-4">Need Quick Help?</h3>
              <p className="mb-6 text-green-100">
                Chat with us directly on WhatsApp for instant support and product recommendations.
              </p>
              <a
                href={`https://wa.me/${brandInfo.whatsapp.replace('+', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-white text-green-600 px-6 py-3 rounded-xl font-medium hover:bg-green-50 transition-colors duration-200"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="What's this about?"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-emerald-500 text-white py-4 rounded-xl font-medium hover:bg-emerald-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Send className="w-5 h-5" />
                  <span>Send Message via WhatsApp</span>
                </button>
                
                <p className="text-sm text-gray-500 text-center">
                  This will open WhatsApp with your message pre-filled. We'll respond as soon as possible!
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Quick answers to common questions about our products and services
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Are your products really natural?</h3>
              <p className="text-gray-600 leading-relaxed">
                Yes! All our products are made with 100% natural ingredients. We don't use artificial colors, 
                fragrances, or harsh chemicals. Every ingredient is carefully selected for its purity and effectiveness.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-4">How long does delivery take?</h3>
              <p className="text-gray-600 leading-relaxed">
                We typically process orders within 1-2 business days and shipping takes 3-7 days depending on your location. 
                You'll receive tracking information once your order is dispatched.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Can I return products if I'm not satisfied?</h3>
              <p className="text-gray-600 leading-relaxed">
                Absolutely! We offer a 30-day satisfaction guarantee. If you're not completely happy with your purchase, 
                contact us for a full refund or exchange.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Do you offer custom product recommendations?</h3>
              <p className="text-gray-600 leading-relaxed">
                Yes! Our skincare experts are happy to provide personalized product recommendations based on your skin type 
                and concerns. Just message us on WhatsApp or email.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;