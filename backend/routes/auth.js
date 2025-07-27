import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { generateOTP, sendOTPEmail } from '../utils/emailService.js';

const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    if (user) {
      await new Promise((resolve, reject) => {
        req.session.regenerate(err => {
          if (err) return reject(err);
          req.session.user = { _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin };
          resolve();
        });
      });
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    await new Promise((resolve, reject) => {
      req.session.regenerate(err => {
        if (err) return reject(err);
        req.session.user = { _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin };
        resolve();
      });
    });
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('phone').optional().trim(),
  body('address').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const user = await User.findById(req.user._id);
    
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ message: 'Logged out' }));
});

// @desc    Send password reset OTP
// @route   POST /api/auth/send-reset-otp
// @access  Public
router.post('/send-reset-otp', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save OTP to user
    user.resetOTP = otp;
    user.resetOTPExpires = otpExpires;
    user.resetOTPVerified = false;
    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, user.name);
      res.json({ 
        message: 'OTP sent successfully to your email',
        email: email // Return email for frontend use
      });
    } catch (emailError) {
      // Clear OTP if email fails
      user.resetOTP = null;
      user.resetOTPExpires = null;
      user.resetOTPVerified = false;
      await user.save();
      
      console.error('Email sending failed:', emailError);
      res.status(500).json({ message: 'Failed to send OTP. Please try again later.' });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-reset-otp
// @access  Public
router.post('/verify-reset-otp', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email, otp } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    // Check if OTP exists and is not expired
    if (!user.resetOTP || !user.resetOTPExpires) {
      return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
    }

    if (new Date() > user.resetOTPExpires) {
      // Clear expired OTP
      user.resetOTP = null;
      user.resetOTPExpires = null;
      user.resetOTPVerified = false;
      await user.save();
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Verify OTP
    if (user.resetOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    // Mark OTP as verified
    user.resetOTPVerified = true;
    await user.save();

    res.json({ 
      message: 'OTP verified successfully',
      email: email
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email, otp, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    // Check if OTP is verified and not expired
    if (!user.resetOTP || !user.resetOTPExpires || !user.resetOTPVerified) {
      return res.status(400).json({ message: 'OTP not verified or expired. Please request a new one.' });
    }

    if (new Date() > user.resetOTPExpires) {
      // Clear expired OTP
      user.resetOTP = null;
      user.resetOTPExpires = null;
      user.resetOTPVerified = false;
      await user.save();
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Verify OTP again
    if (user.resetOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    // Update password
    user.password = password;
    
    // Clear OTP fields
    user.resetOTP = null;
    user.resetOTPExpires = null;
    user.resetOTPVerified = false;
    
    await user.save();

    res.json({ 
      message: 'Password reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 