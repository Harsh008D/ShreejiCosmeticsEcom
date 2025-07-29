# 🚀 Full-Stack Migration Guide: localStorage → MongoDB

This guide will help you migrate your Shreeji Cosmetics application from localStorage to a full-stack MongoDB solution.

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** or **yarn**
- **Git** (for version control)

## 🛠️ Installation Steps

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Set up environment variables
cp config.env.example config.env
# Edit config.env with your MongoDB connection string

# Start MongoDB (if using local installation)
mongod

# Seed the database with initial data
npm run seed

# Start the development server
npm run dev
```

### 2. Frontend Updates

The frontend has been updated to use the API instead of localStorage. Key changes include:

- **API Service**: Created `src/services/api.js` for all backend communication
- **Context Updates**: Updated AuthContext, CartContext, and WishlistContext to use API calls
- **Type Updates**: Enhanced TypeScript interfaces to include MongoDB fields
- **Loading States**: Added loading states for better UX

### 3. Environment Configuration

#### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shreeji-cosmetics
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

#### Frontend (if needed)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🔄 Migration Process

### Phase 1: Data Migration

1. **Export localStorage Data** (if you have existing data):
   ```javascript
   // Run this in browser console
   const products = JSON.parse(localStorage.getItem('products') || '[]');
   const users = JSON.parse(localStorage.getItem('users') || '[]');
   const brandInfo = JSON.parse(localStorage.getItem('brandInfo') || '{}');
   
   console.log('Products:', products);
   console.log('Users:', users);
   console.log('Brand Info:', brandInfo);
   ```

2. **Seed Database**:
   ```bash
   cd backend
   npm run seed
   ```

### Phase 2: Frontend Updates

The frontend has been automatically updated to:
- Use API calls instead of localStorage
- Handle authentication with JWT tokens
- Manage loading states
- Support MongoDB data structure

### Phase 3: Testing

1. **Test Backend API**:
   ```bash
   # Health check
   curl http://localhost:5000/api/health
   
   # Get products
   curl http://localhost:5000/api/products
   
   # Register user
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
   ```

2. **Test Frontend**:
   - Start the frontend: `npm run dev`
   - Test user registration/login
   - Test product browsing
   - Test cart and wishlist functionality
   - Test admin panel

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

### Cart & Wishlist
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:productId` - Update cart item
- `DELETE /api/cart/:productId` - Remove from cart
- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/:productId` - Remove from wishlist

## 🔐 Authentication Flow

1. **Registration**: User registers → JWT token stored in localStorage
2. **Login**: User logs in → JWT token stored in localStorage
3. **API Calls**: Token automatically included in Authorization header
4. **Logout**: Token removed from localStorage

## 🗄️ Database Schema

### Collections
- **users**: User accounts with authentication
- **products**: Product catalog with details
- **carts**: User shopping carts
- **wishlists**: User wishlists
- **brandInfo**: Company information

### Key Features
- **Password Hashing**: bcrypt for secure password storage
- **JWT Authentication**: Stateless authentication
- **Role-based Access**: Admin/User permissions
- **Data Validation**: Input validation with express-validator

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production`
2. Update `MONGODB_URI` to production database
3. Set strong `JWT_SECRET`
4. Use process manager (PM2):
   ```bash
   npm install -g pm2
   pm2 start server.js --name "shreeji-backend"
   ```

### Frontend Deployment
1. Update API URL to production backend
2. Build for production:
   ```bash
   npm run build
   ```
3. Deploy to your preferred hosting service

## 🔧 Development

### Backend Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with initial data

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Ensure MongoDB is running
   - Check connection string in config.env
   - Verify network connectivity

2. **CORS Errors**:
   - Backend CORS is configured for localhost:3000
   - Update CORS settings for production

3. **Authentication Issues**:
   - Check JWT token in localStorage
   - Verify token expiration
   - Ensure proper Authorization header

4. **API Errors**:
   - Check backend server status
   - Verify API endpoint URLs
   - Check request/response format

### Debug Mode
Enable debug logging:
```bash
# Backend
DEBUG=* npm run dev

# Frontend
# Check browser console for API errors
```

## 📈 Benefits of Migration

### Performance
- **Scalability**: Handle multiple users simultaneously
- **Data Persistence**: Data survives browser clearing
- **Real-time Updates**: Changes reflect across all users

### Security
- **Password Hashing**: Secure password storage
- **JWT Authentication**: Stateless, secure authentication
- **Input Validation**: Server-side validation
- **Role-based Access**: Admin/User permissions

### Features
- **User Management**: Admin can manage users
- **Analytics**: Track user behavior and sales
- **Data Backup**: MongoDB backup capabilities
- **API Access**: External integrations possible

## 🎯 Next Steps

1. **Testing**: Thoroughly test all functionality
2. **Security**: Review and enhance security measures
3. **Performance**: Optimize database queries
4. **Monitoring**: Add logging and monitoring
5. **Backup**: Set up automated database backups
6. **Documentation**: Update user documentation

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check server logs
4. Contact the development team

---

**🎉 Congratulations!** Your application is now a full-stack solution with MongoDB backend and React frontend. 