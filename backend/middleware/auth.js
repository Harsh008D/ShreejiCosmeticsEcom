import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Not authorized, no session' });
    }
    req.user = req.session.user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Not authorized, session failed' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
}; 