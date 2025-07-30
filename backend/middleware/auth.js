import User from '../models/User.js';
import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
  try {
    console.log('=== AUTH MIDDLEWARE DEBUG ===');
    console.log('Session:', req.session);
    console.log('Session user:', req.session?.user);
    console.log('Authorization header:', req.headers.authorization);
    console.log('URL:', req.url);
    console.log('Method:', req.method);
    console.log('===========================');

    // First try session-based auth
    if (req.session && req.session.user) {
      console.log('Using session-based auth');
      req.user = req.session.user;
      return next();
    }

    // Fallback to JWT token auth
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log('Using JWT token auth');
      
      try {
        const decoded = jwt.verify(token, process.env.SESSION_SECRET || 'shreeji-session-secret');
        console.log('JWT decoded successfully:', decoded);
        req.user = decoded;
        return next();
      } catch (jwtError) {
        console.error('JWT verification failed:', jwtError);
      }
    }

    console.log('No valid authentication found');
    // If neither session nor JWT works
    return res.status(401).json({ message: 'Not authorized, no valid authentication' });
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Not authorized, authentication failed' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
}; 