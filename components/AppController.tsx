import React, { useEffect, useState, createContext, useContext } from 'react';
import { AppController as AppControllerClass } from '../controllers/AppController';

// Create context for AppController
const AppControllerContext = createContext<AppControllerClass | null>(null);

export const useAppController = () => {
  const context = useContext(AppControllerContext);
  if (!context) {
    throw new Error('useAppController must be used within AppControllerProvider');
  }
  return context;
};

interface AppControllerProps {
  children: React.ReactNode;
}

const AppController: React.FC<AppControllerProps> = ({ children }) => {
  const [appController] = useState(() => new AppControllerClass());
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const result = await appController.initialize();
        if (result.success) {
          setIsInitialized(true);
        } else {
          setError(result.error || 'Failed to initialize application');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize application');
      }
    };

    initializeApp();
  }, [appController]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-2xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Application Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing Shreeji Cosmetics...</p>
        </div>
      </div>
    );
  }

  return (
    <AppControllerContext.Provider value={appController}>
      {children}
    </AppControllerContext.Provider>
  );
};

export default AppController;