# 🛡️ Error Handling Documentation

This document outlines the comprehensive error handling implemented in the Shreeji Cosmetics full-stack application.

## 🔧 Backend Error Handling

### 1. Server-Level Error Handling

**Location**: `backend/server.js`

- **Validation Errors**: Returns 422 status with detailed validation messages
- **Cast Errors**: Returns 400 status for invalid MongoDB ObjectId format
- **Duplicate Key Errors**: Returns 409 status for unique constraint violations
- **JWT Errors**: Returns 401 status for invalid/expired tokens
- **Generic Errors**: Returns 500 status with appropriate error messages
- **Development Mode**: Includes stack traces for debugging

### 2. Route-Level Error Handling

**Authentication Routes** (`backend/routes/auth.js`):
- Input validation with express-validator
- Password comparison errors
- User not found scenarios
- Duplicate email registration

**Product Routes** (`backend/routes/products.js`):
- Product not found scenarios
- Invalid category filters
- Database operation failures

**Cart/Wishlist Routes**:
- User authentication checks
- Product existence validation
- Quantity validation
- Database transaction errors

### 3. Middleware Error Handling

**Auth Middleware** (`backend/middleware/auth.js`):
- Token validation
- User existence checks
- Account status verification

## 🎨 Frontend Error Handling

### 1. API Service Error Handling

**Location**: `src/services/api.js`

- **Network Errors**: Handles connection issues and server unavailability
- **HTTP Status Codes**: Specific error messages for different status codes
- **Token Management**: Automatic token cleanup on 401 errors
- **JSON Parsing**: Graceful handling of non-JSON responses

### 2. Context Error Handling

**AuthContext** (`src/context/AuthContext.tsx`):
- Login/signup failures
- Token validation errors
- Profile loading failures

**CartContext** (`src/context/CartContext.tsx`):
- Cart loading failures
- Add/remove item errors
- Quantity update failures

**WishlistContext** (`src/context/WishlistContext.tsx`):
- Wishlist loading failures
- Add/remove item errors

### 3. Component Error Handling

**Pages with Loading States**:
- Products page: Loading spinner and error messages
- Product detail: Product not found handling
- About/Contact: Brand info loading errors
- Admin panel: Data loading and save failures

**User Feedback**:
- Loading spinners during API calls
- Error messages with retry options
- Graceful fallbacks for missing data

## 🚨 Error Categories

### 1. Network Errors
- **Cause**: No internet connection, server down
- **Handling**: User-friendly messages with retry suggestions
- **Recovery**: Automatic retry mechanisms in some contexts

### 2. Authentication Errors
- **Cause**: Invalid/expired tokens, unauthorized access
- **Handling**: Automatic token cleanup, redirect to login
- **Recovery**: User re-authentication

### 3. Validation Errors
- **Cause**: Invalid input data, missing required fields
- **Handling**: Field-specific error messages
- **Recovery**: Form validation with helpful hints

### 4. Database Errors
- **Cause**: Connection issues, constraint violations
- **Handling**: Appropriate HTTP status codes
- **Recovery**: Retry mechanisms, user feedback

### 5. Business Logic Errors
- **Cause**: Invalid operations, insufficient permissions
- **Handling**: Clear error messages with context
- **Recovery**: User guidance for correct actions

## 🔄 Error Recovery Strategies

### 1. Automatic Recovery
- Token refresh on expiration
- Retry failed network requests
- Fallback to cached data when possible

### 2. User-Initiated Recovery
- Retry buttons on error pages
- Form resubmission with corrections
- Manual refresh options

### 3. Graceful Degradation
- Offline mode indicators
- Cached data usage
- Reduced functionality when services unavailable

## 📊 Error Monitoring

### 1. Console Logging
- Detailed error logs for debugging
- Stack traces in development mode
- Performance metrics

### 2. User Feedback
- Toast notifications for errors
- Error pages with helpful information
- Contact support options

## 🧪 Testing Error Scenarios

### Backend Testing
```bash
# Test server health
curl http://localhost:5000/api/health

# Test authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid@email.com","password":"wrong"}'

# Test protected routes
curl http://localhost:5000/api/cart
```

### Frontend Testing
- Network tab monitoring
- Console error checking
- User interaction testing
- Edge case validation

## 🚀 Best Practices

1. **Never expose sensitive information** in error messages
2. **Provide actionable feedback** to users
3. **Log errors appropriately** for debugging
4. **Handle errors gracefully** without crashing
5. **Implement retry mechanisms** for transient failures
6. **Use appropriate HTTP status codes**
7. **Validate input data** thoroughly
8. **Test error scenarios** regularly

## 🔧 Configuration

### Environment Variables
```env
NODE_ENV=development  # Enable detailed error messages
JWT_SECRET=your-secret  # Secure token validation
MONGODB_URI=mongodb://localhost:27017/shreeji-cosmetics
```

### Error Message Customization
- Backend: Modify error messages in route handlers
- Frontend: Update error text in components
- API: Customize response messages

This comprehensive error handling ensures a robust and user-friendly application experience. 