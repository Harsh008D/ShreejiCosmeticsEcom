import express from 'express';
import { upload, handleUploadError, cloudinary } from '../middleware/upload.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Debug middleware to log all requests to upload routes
router.use((req, res, next) => {
  console.log(`Upload route accessed: ${req.method} ${req.path}`);
  next();
});

// Test route to verify upload routes are working
router.get('/test', (req, res) => {
  res.json({ message: 'Upload routes are working!' });
});

// @desc    Upload multiple images
// @route   POST /api/upload/images
// @access  Private
router.post('/images', protect, upload.array('images', 10), handleUploadError, async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('User:', req.user);
    console.log('Files:', req.files);
    console.log('Body:', req.body);
    console.log('Headers:', req.headers);
    
    if (!req.files || req.files.length === 0) {
      console.log('No files uploaded');
      return res.status(400).json({ message: 'No images uploaded' });
    }

    console.log('Processing', req.files.length, 'files');
    
    const uploadedImages = req.files.map((file, index) => {
      console.log('File', index, ':', file);
      return {
        url: file.path,
        publicId: file.filename,
        isThumbnail: index === 0 // First image is thumbnail
      };
    });

    console.log('Uploaded images:', uploadedImages);

    res.status(200).json({
      message: 'Images uploaded successfully',
      images: uploadedImages
    });
  } catch (error) {
    console.error('Upload error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to upload images',
      error: error.message,
      details: {
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      }
    });
  }
});

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/images/*
// @access  Private
router.delete('/images/*', protect, async (req, res) => {
  try {
    const publicId = req.params[0]; // Get the full path from wildcard
    
    console.log('Delete request for publicId:', publicId);
    
    // Handle legacy images (images that don't exist in Cloudinary)
    if (publicId.startsWith('legacy-')) {
      console.log('Legacy image detected, skipping Cloudinary deletion');
      return res.json({ message: 'Image deleted successfully' });
    }
    
    // Delete from Cloudinary
    const result = await cloudinary.v2.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      console.log('Image deleted from Cloudinary successfully');
      res.json({ message: 'Image deleted successfully' });
    } else {
      console.log('Cloudinary deletion failed:', result);
      res.status(400).json({ message: 'Failed to delete image' });
    }
  } catch (error) {
    console.error('Delete image error:', error);
    
    // If it's a "not found" error from Cloudinary, treat it as success
    if (error.message && error.message.includes('not found')) {
      console.log('Image not found in Cloudinary, treating as deleted');
      return res.json({ message: 'Image deleted successfully' });
    }
    
    res.status(500).json({ message: 'Failed to delete image' });
  }
});

// @desc    Set thumbnail image
// @route   PUT /api/upload/thumbnail/:publicId
// @access  Private
router.put('/thumbnail/:publicId', protect, async (req, res) => {
  try {
    const { publicId } = req.params;
    const { productId } = req.body;
    
    // This will be handled in the product update route
    res.json({ message: 'Thumbnail updated successfully' });
  } catch (error) {
    console.error('Set thumbnail error:', error);
    res.status(500).json({ message: 'Failed to set thumbnail' });
  }
});

export default router; 