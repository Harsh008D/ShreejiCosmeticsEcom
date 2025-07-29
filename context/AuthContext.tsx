import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import apiService from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  // Password reset methods
  sendResetOTP: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyResetOTP: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string, otp: string, password: string) => Promise<{ success: boolean; error?: string }>;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        setError(null);
        const userData = await apiService.checkAuthStatus();
        setUser(userData);
      } catch {
        setUser(null);
        setError(null);
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);
      const userData = await apiService.login({ email, password });
      setUser(userData);
      return { success: true };
    } catch (error: unknown) {
      let errorMessage = 'Login failed. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'error' in error) {
        errorMessage = (error as { error: string }).error;
      }
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);
      const userData = await apiService.register({ name, email, password });
      setUser(userData);
      return { success: true };
    } catch (error: unknown) {
      let errorMessage = 'Signup failed. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'error' in error) {
        errorMessage = (error as { error: string }).error;
      }
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await apiService.logout();
      setUser(null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Password reset methods
  const sendResetOTP = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);
      await apiService.sendResetOTP(email);
      return { success: true };
    } catch (error: unknown) {
      let errorMessage = 'Failed to send OTP. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'error' in error) {
        errorMessage = (error as { error: string }).error;
      }
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const verifyResetOTP = async (email: string, otp: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);
      await apiService.verifyResetOTP(email, otp);
      return { success: true };
    } catch (error: unknown) {
      let errorMessage = 'Failed to verify OTP. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'error' in error) {
        errorMessage = (error as { error: string }).error;
      }
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string, otp: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);
      await apiService.resetPassword(email, otp, password);
      return { success: true };
    } catch (error: unknown) {
      let errorMessage = 'Failed to reset password. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'error' in error) {
        errorMessage = (error as { error: string }).error;
      }
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      sendResetOTP,
      verifyResetOTP,
      resetPassword,
      isAdmin: user?.isAdmin || false,
      loading,
      error,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};