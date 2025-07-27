export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export class UserModel {
  private currentUser: User | null = null;
  private isAuthenticated: boolean = false;
  private isLoading: boolean = false;
  private error: string | null = null;

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Get authentication state
  getAuthState(): AuthState {
    return {
      user: this.currentUser,
      isAuthenticated: this.isAuthenticated,
      isLoading: this.isLoading,
      error: this.error
    };
  }

  // Set loading state
  setLoading(loading: boolean): void {
    this.isLoading = loading;
  }

  // Set error
  setError(error: string | null): void {
    this.error = error;
  }

  // Set user
  setUser(user: User | null): void {
    this.currentUser = user;
    this.isAuthenticated = !!user;
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  // Validate login credentials
  validateLoginCredentials(credentials: LoginCredentials): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!credentials.email) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(credentials.email)) {
      errors.push('Please enter a valid email address');
    }

    if (!credentials.password) {
      errors.push('Password is required');
    } else if (credentials.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate registration data
  validateRegisterData(data: RegisterData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name.trim()) {
      errors.push('Name is required');
    } else if (data.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }

    if (!data.email) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(data.email)) {
      errors.push('Please enter a valid email address');
    }

    if (!data.password) {
      errors.push('Password is required');
    } else if (data.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    if (data.password !== data.confirmPassword) {
      errors.push('Passwords do not match');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate email format
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Clear error
  clearError(): void {
    this.error = null;
  }

  // Logout
  logout(): void {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.error = null;
  }
} 