export interface ProductImage {
  url: string;
  publicId: string;
  isThumbnail: boolean;
}

export interface Product {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  image: string;
  images?: ProductImage[];
  description: string;
  ingredients: string[];
  usage: string;
  category: string;
  brand?: string;
  inStock: boolean;
  featured?: boolean;
  stockQuantity?: number;
  rating: number;
  numReviews: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  isAdmin?: boolean;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  avatar?: string;
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  token?: string;
}

// Password reset types
export interface PasswordResetRequest {
  email: string;
}

export interface OTPVerificationRequest {
  email: string;
  otp: string;
}

export interface PasswordResetData {
  email: string;
  otp: string;
  password: string;
}

export interface CartItem {
  _id?: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  _id?: string;
  user: string;
  items: CartItem[];
  total: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Wishlist {
  _id?: string;
  user: string;
  products: Product[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BrandInfo {
  _id?: string;
  name: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  whatsapp: string;
  logo?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    linkedin?: string;
  };
  businessHours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
    mondayToFriday?: string;
  };
  policies?: {
    shipping?: string;
    returns?: string;
    privacy?: string;
    terms?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}