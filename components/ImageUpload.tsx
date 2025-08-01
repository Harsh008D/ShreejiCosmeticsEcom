import React, { useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { ProductImage } from '../types';

interface LocalImage {
  file: File;
  preview: string;
  id: string;
}

interface ImageUploadProps {
  onImagesUploaded: (images: ProductImage[]) => void;
  onLocalImagesSelected?: (images: LocalImage[]) => void;
  existingImages?: ProductImage[];
  onImageDelete?: (publicId: string) => void;
  onImageMarkForDeletion?: (publicId: string) => void;
  maxImages?: number;
  disabled?: boolean;
  allowImmediateDelete?: boolean;
  delayedUpload?: boolean; // New prop for delayed upload mode
}

export interface ImageUploadRef {
  uploadLocalImages: () => Promise<ProductImage[]>;
}

const ImageUpload = forwardRef<ImageUploadRef, ImageUploadProps>(({
  onImagesUploaded,
  onLocalImagesSelected,
  existingImages = [],
  onImageDelete,
  onImageMarkForDeletion,
  maxImages = 10,
  disabled = false,
  allowImmediateDelete = false,
  delayedUpload = false
}, ref) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localImages, setLocalImages] = useState<LocalImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    if (disabled) return;

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      setError('Please select only image files');
      return;
    }

    const totalImages = existingImages.length + localImages.length + imageFiles.length;
    if (totalImages > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    setError(null);

    if (delayedUpload) {
      // Store images locally for delayed upload
      const newLocalImages: LocalImage[] = imageFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substr(2, 9)
      }));
      
      setLocalImages(prev => [...prev, ...newLocalImages]);
      onLocalImagesSelected?.(newLocalImages);
    } else {
      // Immediate upload to Cloudinary
      setUploading(true);
      try {
        const { apiService } = await import('../services/ApiService');
        const result = await apiService.uploadImages(imageFiles);
        onImagesUploaded(result.images);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to upload images';
        setError(errorMessage);
      } finally {
        setUploading(false);
      }
    }
  }, [disabled, existingImages.length, localImages.length, maxImages, onImagesUploaded, onLocalImagesSelected, delayedUpload]);

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
  }, [handleFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }, [handleFiles]);

  const handleDeleteImage = useCallback(async (publicId: string) => {
    if (disabled) {
      return;
    }

    if (allowImmediateDelete) {
      // Immediate deletion (for new uploads that haven't been saved yet)
      try {
        const { apiService } = await import('../services/ApiService');
        await apiService.deleteImage(publicId);
        
        // Clear any previous errors
        setError(null);
        
        // Call the callback to update the parent component
        onImageDelete?.(publicId);
      } catch (err: unknown) {
        console.error('Delete image error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete image';
        setError(errorMessage);
      }
    } else {
      // Mark for deletion (for existing images in edit mode) - no confirmation needed
      onImageMarkForDeletion?.(publicId);
    }
  }, [disabled, allowImmediateDelete, onImageDelete, onImageMarkForDeletion]);

  const handleDeleteLocalImage = useCallback((id: string) => {
    setLocalImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  }, []);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Function to upload local images to Cloudinary
  const uploadLocalImages = useCallback(async (): Promise<ProductImage[]> => {
    if (localImages.length === 0) {
      return [];
    }
    
    setUploading(true);
    try {
      const { apiService } = await import('../services/ApiService');
      const files = localImages.map(img => img.file);
      const result = await apiService.uploadImages(files);
      
      // Clean up local images
      localImages.forEach(img => URL.revokeObjectURL(img.preview));
      setLocalImages([]);
      
      return result.images;
    } catch (err: unknown) {
      console.error('Upload error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload images';
      setError(errorMessage);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [localImages]);

  // Expose upload function to parent via ref
  useImperativeHandle(ref, () => ({
    uploadLocalImages
  }), [uploadLocalImages]);

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
          {delayedUpload && ' (Images will be uploaded when you save the product)'}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
          aria-label="Select images to upload"
          title="Select images to upload"
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

      {/* All Images (Existing + New) */}
      {(existingImages.length > 0 || localImages.length > 0) && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Product Images</h4>
          <div className="flex flex-wrap gap-2">
            {/* Existing Images */}
            {existingImages.map((image, index) => (
              <div key={image.publicId} className="relative group w-24 h-24 flex-shrink-0">
                <img
                  src={image.url}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                {!disabled && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteImage(image.publicId);
                    }}
                    className="absolute top-0 right-0 m-0 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 leading-none"
                    title="Delete image"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            {/* New Local Images */}
            {localImages.map((image) => (
              <div key={image.id} className="relative group w-24 h-24 flex-shrink-0">
                <img
                  src={image.preview}
                  alt="Selected image preview"
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  New
                </div>
                {!disabled && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteLocalImage(image.id);
                    }}
                    className="absolute top-0 right-0 m-0 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 leading-none"
                    title="Delete image"
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
});

export default ImageUpload; 