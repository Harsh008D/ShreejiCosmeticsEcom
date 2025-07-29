import { UserModel, User, LoginCredentials, RegisterData, AuthState } from '../models/UserModel';
import { apiService } from '../services/api';

export class AuthController {
  private userModel: UserModel;

  constructor() {
    this.userModel = new UserModel();
  }

  // Get the user model instance
  getModel(): UserModel {
    return this.userModel;
  }

  // Get current authentication state
  getAuthState(): AuthState {
    return this.userModel.getAuthState();
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.userModel.getCurrentUser();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.userModel.getAuthState().isAuthenticated;
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.userModel.isAdmin();
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate credentials
      const validation = this.userModel.validateLoginCredentials(credentials);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      this.userModel.setLoading(true);
      this.userModel.clearError();

      // Call API to login
      const user = await apiService.login(credentials);
      if (user && user.email) {
        this.userModel.setUser(user);
        this.userModel.setLoading(false);
        return { success: true };
      } else {
        this.userModel.setError('Login failed');
        this.userModel.setLoading(false);
        return { success: false, error: 'Login failed' };
      }
    } catch (error: unknown) {
      let errorMessage = 'Login failed';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'error' in error) {
        errorMessage = (error as { error: string }).error;
      }
      this.userModel.setError(errorMessage);
      this.userModel.setLoading(false);
      return { success: false, error: errorMessage };
    }
  }

  // Register user
  async register(data: RegisterData): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate registration data
      const validation = this.userModel.validateRegisterData(data);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      this.userModel.setLoading(true);
      this.userModel.clearError();

      // Call API to register
      const user = await apiService.register({
        name: data.name,
        email: data.email,
        password: data.password
      });
      if (user && user.email) {
        this.userModel.setUser(user);
        this.userModel.setLoading(false);
        return { success: true };
      } else {
        this.userModel.setError('Registration failed');
        this.userModel.setLoading(false);
        return { success: false, error: 'Registration failed' };
      }
    } catch (error: unknown) {
      let errorMessage = 'Registration failed';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'error' in error) {
        errorMessage = (error as { error: string }).error;
      }
      this.userModel.setError(errorMessage);
      this.userModel.setLoading(false);
      return { success: false, error: errorMessage };
    }
  }

  // Logout user
  async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      // Call API to logout
      await apiService.logout();
      // Clear local user data
      this.userModel.logout();
      return { success: true };
    } catch {
      // Even if API call fails, clear local data
      this.userModel.logout();
      return { success: true };
    }
  }

  // Check authentication status (for app initialization)
  async checkAuthStatus(): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const user = await apiService.checkAuthStatus();
      if (user && user.email) {
        this.userModel.setUser(user);
        return { success: true, user };
      } else {
        this.userModel.setUser(null);
        return { success: true };
      }
    } catch {
      this.userModel.setUser(null);
      return { success: true };
    }
  }

  // Update user profile
  async updateProfile(profileData: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      this.userModel.setLoading(true);
      this.userModel.clearError();
      const user = await apiService.updateProfile(profileData);
      if (user && user.email) {
        this.userModel.setUser(user);
        this.userModel.setLoading(false);
        return { success: true, user };
      } else {
        this.userModel.setError('Profile update failed');
        this.userModel.setLoading(false);
        return { success: false, error: 'Profile update failed' };
      }
    } catch (err: unknown) {
      let errorMessage = 'Profile update failed';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'error' in err) {
        errorMessage = (err as { error: string }).error;
      }
      this.userModel.setError(errorMessage);
      this.userModel.setLoading(false);
      return { success: false, error: errorMessage };
    }
  }

  // Clear error
  clearError(): void {
    this.userModel.clearError();
  }

  // Get loading state
  isLoading(): boolean {
    return this.userModel.getAuthState().isLoading;
  }

  // Get error
  getError(): string | null {
    return this.userModel.getAuthState().error;
  }
} 