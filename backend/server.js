import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';

// Import routes
import productRoutes from './routes/products.js';
import userRoutes from './routes/users.js';
import authRoutes from './routes/auth.js';
import brandRoutes from './routes/brand.js';
import cartRoutes from './routes/cart.js';
import wishlistRoutes from './routes/wishlist.js';
import reviewRoutes from './routes/reviews.js';
import ordersRoutes from './routes/orders.js';
import uploadRoutes from './routes/upload.js';

// Load environment variables
dotenv.config({ path: './config.env' });

// Environment variable validation
const requiredEnvVars = ['MONGODB_URI', 'SESSION_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars);
  console.error('Please check your config.env file or Railway environment variables');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for testing)
  message: {
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use(limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs (increased for testing)
  message: {
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Trust proxy for Railway
if (NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// CORS configuration
const corsOptions = {
  origin: NODE_ENV === 'production' 
    ? true // Allow all origins in production for now
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'shreeji-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: NODE_ENV === 'production' ? 'none' : 'lax', // Changed from 'strict' to 'none' for cross-origin
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}));

// CSRF protection (disabled for now to fix API issues)
// if (NODE_ENV === 'production') {
//   app.use(csurf({ cookie: false }));
//   // Expose CSRF token for frontend
//   app.get('/api/csrf-token', (req, res) => {
//     res.json({ csrfToken: req.csrfToken() });
//   });
// }

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// MongoDB Connection with better error handling
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected to MongoDB successfully');
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🌍 Host: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed through app termination');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/brand', brandRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const healthCheck = {
    status: 'OK',
    message: 'Shreeji Cosmetics API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    memory: process.memoryUsage(),
  };
  
  res.status(200).json(healthCheck);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Log error details
  const errorDetails = {
    message: err.message,
    stack: NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  };
  
  console.error('Error Details:', JSON.stringify(errorDetails, null, 2));
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(422).json({
      message: 'Validation failed',
      errors: errors
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format',
      field: err.path
    });
  }
  
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      message: `${field} already exists`,
      field: field
    });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid token'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expired'
    });
  }
  
  if (err.name === 'MongoError' && err.code === 121) {
    return res.status(400).json({
      message: 'Document validation failed'
    });
  }
  
  // Default error response
  const statusCode = err.status || 500;
  const message = err.message || 'Something went wrong!';
  
  res.status(statusCode).json({ 
    message: message,
    ...(NODE_ENV === 'development' && { 
      stack: err.stack,
      details: errorDetails
    })
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 MongoDB: ${process.env.MONGODB_URI}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`🔒 Security: ${NODE_ENV === 'production' ? 'Enabled' : 'Development mode'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('🔌 HTTP server closed');
    mongoose.connection.close().then(() => {
      console.log('🔌 MongoDB connection closed');
      process.exit(0);
    }).catch((err) => {
      console.error('❌ Error closing MongoDB connection:', err);
      process.exit(1);
    });
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  server.close(() => {
    process.exit(1);
  });
}); 