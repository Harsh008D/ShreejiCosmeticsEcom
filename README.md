# 🧴 Shreeji Cosmetics - Natural Beauty E-commerce Platform

A modern, full-stack e-commerce application built with React, TypeScript, Node.js, and MongoDB. This application features a unique WhatsApp-based ordering system, comprehensive admin panel, and beautiful user interface focused on natural cosmetics.

## ✨ Key Features

### 🛍️ E-commerce Features
- **Product Catalog**: Browse products with advanced filtering, sorting, and search
- **Shopping Cart**: Add, remove, and update cart items with real-time sync
- **Wishlist**: Save favorite products for later purchase
- **User Authentication**: Secure session-based authentication
- **Admin Panel**: Complete product, order, and user management
- **WhatsApp Ordering**: Unique WhatsApp integration for order placement
- **Product Reviews**: User reviews and ratings system
- **Responsive Design**: Mobile-first design that works on all devices

### 🔒 Security Features
- **Session-based Authentication**: Secure cookie-based sessions
- **Password Hashing**: Bcrypt password encryption
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive server-side validation
- **XSS Protection**: Cross-site scripting prevention
- **CORS Configuration**: Secure cross-origin requests
- **Helmet Security**: HTTP security headers
- **NoSQL Injection Prevention**: MongoDB query sanitization

### 🛡️ Error Handling
- **Global Error Boundary**: Catches React errors gracefully
- **API Error Handling**: Comprehensive backend error management
- **Toast Notifications**: User-friendly error messages
- **Loading States**: Smooth loading experiences
- **Retry Mechanisms**: Automatic retry for network failures
- **Graceful Degradation**: App works even when services fail

### 🚀 Performance Features
- **Optimized Queries**: Efficient database operations with Mongoose
- **Image Optimization**: Responsive image handling
- **Lazy Loading**: Components load on demand
- **Caching**: Smart data caching strategies
- **Compression**: Gzip compression for faster loading

## 🏗️ Architecture

```
├── frontend/                 # React TypeScript frontend
│   ├── components/          # Reusable UI components
│   ├── context/            # React context providers (Auth, Cart, Wishlist, Toast)
│   ├── controllers/        # MVC controllers for business logic
│   ├── models/            # TypeScript data models
│   ├── pages/             # Page components
│   ├── services/          # API service layer
│   ├── types/             # TypeScript type definitions
│   └── views/             # MVC view components
├── backend/                # Node.js Express backend
│   ├── models/            # MongoDB schemas (User, Product, Cart, Order, Wishlist, Review, BrandInfo)
│   ├── routes/            # API route handlers
│   ├── middleware/        # Custom middleware (auth, validation)
│   └── scripts/           # Database seeding and utilities
└── docs/                  # Documentation
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **Lucide React** - Beautiful icon library
- **Context API** - State management for auth, cart, wishlist, and toast

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework with middleware
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM with schema validation
- **Session-based Auth** - Cookie-based authentication (not JWT)
- **Bcrypt** - Password hashing
- **Express Validator** - Input validation and sanitization

### Security & Performance
- **Helmet** - Security headers
- **Rate Limiting** - DDoS protection
- **CORS** - Cross-origin resource sharing
- **XSS Protection** - Cross-site scripting prevention
- **MongoDB Sanitization** - NoSQL injection prevention
- **CSRF Protection** - Cross-site request forgery prevention

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- MongoDB 4.4+
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd shreeji-cosmetics
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Environment Setup
```bash
# Backend environment variables
cd backend
cp config.env.example config.env
```

Edit `backend/config.env` with your configuration:
```env
PORT=3001
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret_key
NODE_ENV=development
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
EMAIL_FROM=your_email@gmail.com
```

### 4. Start MongoDB
```bash
# macOS (using Homebrew)
brew services start mongodb-community

# Ubuntu/Debian
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 5. Seed the Database
```bash
cd backend
npm run seed
```

### 6. Start the Application
```bash
# Start both frontend and backend
npm run start:both

# Or start individually:
# Backend
cd backend && npm run dev

# Frontend (in new terminal)
npm run dev
```

### 7. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/register    - Register new user
POST /api/auth/login       - User login (session-based)
GET  /api/auth/profile     - Get user profile
PUT  /api/auth/profile     - Update user profile
POST /api/auth/logout      - User logout
POST /api/auth/send-reset-otp - Send password reset OTP
POST /api/auth/verify-reset-otp - Verify OTP
POST /api/auth/reset-password - Reset password with OTP
```

### Product Endpoints
```
GET    /api/products       - Get all products with filtering
GET    /api/products/:id   - Get product by ID
GET    /api/products/featured - Get featured products
POST   /api/products       - Create product (Admin)
PUT    /api/products/:id   - Update product (Admin)
DELETE /api/products/:id   - Delete product (Admin)
```

### Cart Endpoints
```
GET    /api/cart           - Get user cart
POST   /api/cart           - Add item to cart
PUT    /api/cart/:id       - Update cart item quantity
DELETE /api/cart/:id       - Remove from cart
DELETE /api/cart           - Clear cart
```

### Wishlist Endpoints
```
GET    /api/wishlist       - Get user wishlist
POST   /api/wishlist       - Add to wishlist
DELETE /api/wishlist/:id   - Remove from wishlist
DELETE /api/wishlist       - Clear wishlist
GET    /api/wishlist/check/:id - Check if product in wishlist
```

### Order Endpoints
```
POST   /api/orders         - Place new order
GET    /api/orders/my      - Get user orders
POST   /api/orders/:id/cancel - Cancel order
GET    /api/orders         - Get all orders (Admin)
POST   /api/orders/:id/confirm - Confirm order (Admin)
POST   /api/orders/:id/deliver - Mark as delivered (Admin)
```

### Review Endpoints
```
GET    /api/reviews/product/:id - Get product reviews
POST   /api/reviews        - Add review
PUT    /api/reviews/:id    - Update review
DELETE /api/reviews/:id    - Delete review
```

### Brand Information
```
GET    /api/brand          - Get brand information
PUT    /api/brand          - Update brand info (Admin)
```

## 🔄 Application Flow

### 1. User Authentication Flow
1. User registers/logs in via `/login` page
2. Backend creates session and stores in secure cookies
3. User data stored in React AuthContext
4. Protected routes check session validity

### 2. Product Browsing Flow
1. Products loaded from `/api/products` endpoint
2. Advanced filtering by category, price, availability
3. Search functionality across product names and descriptions
4. Product details with images, ingredients, usage instructions

### 3. Shopping Cart Flow
1. Add products to cart from product pages
2. Cart data synced with backend via `/api/cart`
3. Real-time quantity updates and price calculations
4. Cart persistence across sessions

### 4. WhatsApp Ordering Flow
1. User reviews cart and clicks "Order via WhatsApp"
2. Backend creates pending order
3. WhatsApp message generated with order details
4. User redirected to WhatsApp with pre-filled message
5. Order confirmed after WhatsApp message sent
6. Cart cleared and order status updated

### 5. Admin Management Flow
1. Admin access via `/admin` route
2. Product management (CRUD operations)
3. Order management (confirm, cancel, deliver)
4. User management and analytics
5. Brand information management

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=3001                          # Server port
MONGODB_URI=your_mongodb_uri       # MongoDB connection string
SESSION_SECRET=your_session_secret # Session signing secret
NODE_ENV=development               # Environment (development/production)
EMAIL_USER=your_email@gmail.com    # Gmail for password reset
EMAIL_PASS=your_app_password       # Gmail app password
EMAIL_FROM=your_email@gmail.com    # From email address
```

#### Frontend (vite.config.ts)
```typescript
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
```

## 🗄️ Database Models

### User Model
- Name, email, password (hashed)
- Admin flag, phone, address
- Session management

### Product Model
- Name, price, images, description
- Ingredients, usage instructions, category
- Stock quantity, featured flag, ratings

### Cart Model
- User reference, items array
- Quantity, price tracking
- Automatic total calculation

### Order Model
- User reference, items array
- Status tracking (pending, confirmed, delivered, cancelled)
- Admin cancellation and delivery tracking

### Wishlist Model
- User reference, products array
- Add/remove functionality

### Review Model
- Product and user references
- Rating (1-5), comment
- Timestamps

### BrandInfo Model
- Company information, contact details
- Social media links, business hours
- WhatsApp integration details

## 🎯 Key Features Deep Dive

### WhatsApp Integration
- **Unique Order System**: Orders placed via WhatsApp instead of traditional checkout
- **Message Generation**: Automatic WhatsApp message with order details
- **Order Tracking**: Pending orders until WhatsApp confirmation
- **User Experience**: Seamless transition from cart to WhatsApp

### Admin Panel
- **Product Management**: Full CRUD with image URLs, categories, stock
- **Order Management**: View, confirm, cancel, deliver orders
- **User Management**: View registered users
- **Brand Information**: Manage company details and contact info
- **Analytics**: Basic product and order statistics

### Security Implementation
- **Session-based Auth**: Secure cookies instead of JWT tokens
- **Password Hashing**: Bcrypt with salt rounds
- **Input Validation**: Express-validator for all inputs
- **Rate Limiting**: Protection against abuse
- **XSS Protection**: Automatic sanitization
- **CSRF Protection**: Cross-site request forgery prevention

### Error Handling
- **Frontend**: Error boundaries, toast notifications, loading states
- **Backend**: Global error middleware, validation errors, database error handling
- **User Experience**: Graceful error messages, retry mechanisms

## 🚨 Troubleshooting

### Common Issues

#### MongoDB Connection Failed
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start MongoDB
brew services start mongodb-community
```

#### Port Already in Use
```bash
# Find process using port
lsof -i :3001
lsof -i :5173

# Kill process
kill -9 <PID>
```

#### Session Issues
```bash
# Clear browser cookies
# Check SESSION_SECRET in config.env
# Ensure cookies are enabled
```

#### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🚀 Deployment

### Free Deployment Options
- **Frontend**: Vercel (React hosting)
- **Backend**: Railway (Node.js hosting)
- **Database**: MongoDB Atlas (cloud database)

### Environment Variables for Production
Set these in your deployment platform:
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `SESSION_SECRET`: A strong random string
- `EMAIL_USER`: Your Gmail address
- `EMAIL_PASS`: Your Gmail app password
- `EMAIL_FROM`: Your Gmail address
- `NODE_ENV`: production
- `FRONTEND_URL`: Your frontend URL (for CORS)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔄 Changelog

### Version 2.0.0 (Current)
- ✨ WhatsApp-based ordering system
- 🔒 Session-based authentication
- 🛡️ Comprehensive security features
- 📱 Mobile-first responsive design
- 🎨 Modern UI with Tailwind CSS
- 📊 Complete admin panel
- ⭐ Product reviews and ratings
- 🛒 Advanced cart and wishlist functionality
- 🔐 Password reset with OTP
- 🚀 Free deployment ready

### Version 1.0.0
- 🎉 Initial release
- Basic e-commerce functionality
- User authentication
- Product management
- Shopping cart
- Wishlist

---

**Made with ❤️ by Shreeji Cosmetics Team** 