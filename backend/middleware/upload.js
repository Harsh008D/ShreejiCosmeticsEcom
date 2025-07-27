import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Function to load environment variables from config.env file
const loadEnvFromFile = () => {
  try {
    const envPath = path.join(process.cwd(), 'config.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('Error loading config.env:', error.message);
    return {};
  }
};

// Load environment variables with fallback
const envVars = loadEnvFromFile();

// Configure Cloudinary
console.log('Loading Cloudinary configuration...');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME || envVars.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', (process.env.CLOUDINARY_API_KEY || envVars.CLOUDINARY_API_KEY) ? '***' + (process.env.CLOUDINARY_API_KEY || envVars.CLOUDINARY_API_KEY).slice(-4) : 'Missing');
console.log('CLOUDINARY_API_SECRET:', (process.env.CLOUDINARY_API_SECRET || envVars.CLOUDINARY_API_SECRET) ? '***' + (process.env.CLOUDINARY_API_SECRET || envVars.CLOUDINARY_API_SECRET).slice(-4) : 'Missing');

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || envVars.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || envVars.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET || envVars.CLOUDINARY_API_SECRET,
});

// Validate Cloudinary configuration
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || envVars.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY || envVars.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET || envVars.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Cloudinary configuration missing!');
  console.error('CLOUDINARY_CLOUD_NAME:', cloudName ? 'Set' : 'Missing');
  console.error('CLOUDINARY_API_KEY:', apiKey ? 'Set' : 'Missing');
  console.error('CLOUDINARY_API_SECRET:', apiSecret ? 'Set' : 'Missing');
} else {
  console.log('✅ Cloudinary configuration loaded successfully');
}

// Configure multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: 'shreeji-cosmetics',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 800, crop: 'limit' },
      { quality: 'auto' }
    ],
  },
});

// Configure multer for multiple image uploads
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// Middleware for handling upload errors
const handleUploadError = (error, req, res, next) => {
  console.error('Upload error middleware caught:', error);
  console.error('Error type:', error.constructor.name);
  console.error('Error message:', error.message);
  
  if (error instanceof multer.MulterError) {
    console.error('Multer error code:', error.code);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files. Maximum is 10 images.' });
    }
    return res.status(400).json({ message: 'Upload error: ' + error.message });
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({ message: error.message });
  }
  
  // Handle Cloudinary configuration errors
  if (error.message && error.message.includes('cloudinary')) {
    console.error('Cloudinary configuration error:', error);
    return res.status(500).json({ 
      message: 'Image upload service configuration error. Please contact administrator.',
      error: error.message 
    });
  }
  
  // Handle any other errors
  console.error('Unhandled upload error:', error);
  return res.status(500).json({ 
    message: 'Something went wrong!',
    error: error.message,
    details: {
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    }
  });
};

export { upload, handleUploadError, cloudinary }; 