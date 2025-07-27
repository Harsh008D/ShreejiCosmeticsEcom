import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Trash2 } from 'lucide-react';
import { ProductImage } from '../types';

interface ImageUploadProps {
  onImagesUploaded: (images: ProductImage[]) => void;
  existingImages?: ProductImage[];
  onImageDelete?: (publicId: string) => void;
  onImageMarkForDeletion?: (publicId: string) => void;
  maxImages?: number;
  disabled?: boolean;
  allowImmediateDelete?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImagesUploaded,
  existingImages = [],
  onImageDelete,
  onImageMarkForDeletion,
  maxImages = 10,
  disabled = false,
  allowImmediateDelete = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }, []);

  const handleFiles = async (files: File[]) => {
    if (disabled) return;

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      setError('Please select only image files');
      return;
    }

    if (existingImages.length + imageFiles.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const { apiService } = await import('../services/ApiService');
      const result = await apiService.uploadImages(imageFiles);
      onImagesUploaded(result.images);
    } catch (err: any) {
      setError(err.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (publicId: string) => {
    if (disabled) return;

    if (allowImmediateDelete) {
      // Immediate deletion (for new uploads that haven't been saved yet)
      try {
        console.log('Attempting to delete image with publicId:', publicId);
        const { apiService } = await import('../services/ApiService');
        const response = await apiService.deleteImage(publicId);
        console.log('Delete response:', response);
        
        // Clear any previous errors
        setError(null);
        
        // Call the callback to update the parent component
        onImageDelete?.(publicId);
      } catch (err: any) {
        console.error('Delete image error:', err);
        setError(err.message || 'Failed to delete image');
      }
    } else {
      // Mark for deletion (for existing images in edit mode)
      console.log('Marking image for deletion:', publicId);
      onImageMarkForDeletion?.(publicId);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-gray-300 hover:border-emerald-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 mb-2">
          Drag and drop images here, or click to select
        </p>
        <p className="text-xs text-gray-500">
          Maximum {maxImages} images, 5MB each
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="flex items-center space-x-2 text-sm text-emerald-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>
          <span>Uploading images...</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Current Images</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {existingImages.map((image, index) => (
              <div key={image.publicId} className="relative group">
                <img
                  src={image.url}
                  alt={`Product image ${index + 1}`}
                  className="w-24 h-24 md:w-48 md:h-48 object-cover rounded-lg mx-auto"
                />
                {image.isThumbnail && (
                  <div className="absolute top-1 left-1 bg-emerald-500 text-white text-xs px-2 py-1 rounded">
                    Thumbnail
                  </div>
                )}
                {!disabled && (
                  <button
                    onClick={() => handleDeleteImage(image.publicId)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 