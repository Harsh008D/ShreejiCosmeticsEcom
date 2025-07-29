# Shreeji Cosmetics Backend API

A full-stack Node.js/Express backend with MongoDB for the Shreeji Cosmetics e-commerce application.

## 🚀 Features

- **RESTful API** with Express.js
- **MongoDB** database with Mongoose ODM
- **JWT Authentication** with bcrypt password hashing
- **Role-based Access Control** (Admin/User)
- **Input Validation** with express-validator
- **CORS** enabled for frontend integration
- **Error Handling** middleware
- **Data Seeding** script

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables:**
   - Copy `config.env` and update the values:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/shreeji-cosmetics
   JWT_SECRET=your-secret-key-here
   NODE_ENV=development
   ```

3. **Start MongoDB:**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas (update MONGODB_URI in config.env)
   ```

4. **Seed the database:**
   ```bash
   npm run seed
   ```

5. **Start the server:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)
- `GET /api/products/categories` - Get product categories

### Brand Info
- `GET /api/brand` - Get brand information
- `POST /api/brand` - Create brand info (Admin only)
- `PUT /api/brand` - Update brand info (Admin only)

### Cart (Authenticated)
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:productId` - Update cart item quantity
- `DELETE /api/cart/:productId` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Wishlist (Authenticated)
- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist` - Add product to wishlist
- `DELETE /api/wishlist/:productId` - Remove product from wishlist
- `DELETE /api/wishlist` - Clear wishlist
- `GET /api/wishlist/check/:productId` - Check if product is in wishlist

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📝 Database Models

### Product
- name, price, description, ingredients, usage
- category, inStock, featured, stockQuantity
- rating, numReviews, images

### User
- name, email, password (hashed)
- isAdmin, phone, address, avatar
- isActive, lastLogin

### BrandInfo
- name, tagline, description
- email, phone, address, whatsapp
- socialMedia, businessHours, policies

### Cart
- user (reference), items array
- total (calculated)

### Wishlist
- user (reference), products array

## 🧪 Testing the API

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Products
```bash
curl http://localhost:5000/api/products
```

## 🔧 Development

### Project Structure
```
backend/
├── models/          # MongoDB schemas
├── routes/          # API routes
├── middleware/      # Custom middleware
├── scripts/         # Database scripts
├── config.env       # Environment variables
├── server.js        # Main server file
└── package.json
```

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with initial data

## 🚀 Deployment

1. Set `NODE_ENV=production` in environment variables
2. Update `MONGODB_URI` to production database
3. Set a strong `JWT_SECRET`
4. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "shreeji-backend"
   ```

## 📞 Support

For issues or questions, please check the frontend integration guide or contact the development team.

## 🔄 Frontend Integration

The frontend should be updated to use these API endpoints instead of localStorage. See the frontend migration guide for details. 