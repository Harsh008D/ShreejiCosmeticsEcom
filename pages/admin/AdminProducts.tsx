import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminProducts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to main admin panel since product management is handled there
    navigate('/admin');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Redirecting to Admin Panel...
        </h1>
        <p className="text-gray-600">
          Product management is available in the main admin panel.
        </p>
      </div>
    </div>
  );
};

export default AdminProducts; 