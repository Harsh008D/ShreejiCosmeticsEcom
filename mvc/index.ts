// Models
export { ProductModel, type Product, type ProductFilters, type ProductSortOptions } from '../models/ProductModel';
export { UserModel, type User, type LoginCredentials, type RegisterData, type AuthState } from '../models/UserModel';
export { CartModel, type CartItem, type CartState } from '../models/CartModel';

// Controllers
export { AppController } from '../controllers/AppController';
export { ProductController } from '../controllers/ProductController';
export { AuthController } from '../controllers/AuthController';
export { CartController } from '../controllers/CartController';

// Views
export { default as ProductListView } from '../views/ProductListView';
export { default as AuthView } from '../views/AuthView';

// Services
export { apiService } from '../services/ApiService';

// Type exports for convenience
export type {
  Product,
  ProductFilters,
  ProductSortOptions
} from '../models/ProductModel';

export type {
  User,
  LoginCredentials,
  RegisterData,
  AuthState
} from '../models/UserModel';

export type {
  CartItem,
  CartState
} from '../models/CartModel'; 