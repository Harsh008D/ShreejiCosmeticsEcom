import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const AdminProducts = () => {
  const { user, isAdmin } = useAuth();
  const { showError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!isAdmin) {
      showError('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }
  }, [user, isAdmin, navigate, showError]);

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Product Management
          </h1>
          
          <div className="text-center py-12">
            <div className="text-gray-500">
              <p className="text-lg mb-4">
                Product management is handled in the main Admin Panel.
              </p>
              <button
                onClick={() => navigate('/admin')}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                Go to Admin Panel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts; 