import React from 'react';

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '1rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <h1 style={{ color: '#333', marginBottom: '1rem' }}>
          🎉 JavaScript React Test!
        </h1>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Testing if TypeScript was the issue.
        </p>
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginTop: '1rem',
          textAlign: 'left'
        }}>
          <strong>Status:</strong> JavaScript React test<br/>
          <strong>Next Step:</strong> Check if this works
        </div>
      </div>
    </div>
  );
}

export default App; 