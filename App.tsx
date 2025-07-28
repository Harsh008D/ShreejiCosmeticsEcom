import React from 'react';

// Debug environment variable
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('All env vars:', import.meta.env);
console.log('NODE_ENV:', import.meta.env.NODE_ENV);
console.log('MODE:', import.meta.env.MODE);

function App() {
  console.log('App component rendering...');
  
  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          🎉 Shreeji Cosmetics is Working!
        </h1>
        <p className="text-gray-600 mb-4">
          Your website is successfully deployed!
        </p>
        <div className="text-sm text-gray-500">
          <p>VITE_API_URL: {import.meta.env.VITE_API_URL || 'Not set'}</p>
          <p>Environment: {import.meta.env.MODE}</p>
        </div>
      </div>
    </div>
  );
}

export default App;