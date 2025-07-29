import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductImage } from '../types';

interface ImageCarouselProps {
  images: ProductImage[];
  className?: string;
  showThumbnails?: boolean;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  className = '',
  showThumbnails = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goToImage = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-gray-500 text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-2xl">📷</span>
          </div>
          <p className="text-sm">No images available</p>
        </div>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Image */}
      <div className="relative group">
        <img
          src={currentImage.url}
          alt={`Product image ${currentIndex + 1}`}
          className="w-full h-[32rem] object-cover rounded-lg"
        />
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Thumbnail Indicator */}
        {currentImage.isThumbnail && (
          <div className="absolute top-4 left-4 bg-emerald-500 text-white px-2 py-1 rounded text-xs">
            Thumbnail
          </div>
        )}
      </div>

      {/* Indicators */}
      {images.length > 1 && (
        <div className="flex justify-center space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex
                  ? 'bg-emerald-500'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}

      {/* Thumbnail Navigation */}
      {showThumbnails && images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.publicId}
              onClick={() => goToImage(index)}
              className={`flex-shrink-0 relative p-1 rounded-lg transition-all duration-200 ${
                index === currentIndex
                  ? 'border-2 border-emerald-500'
                  : 'border-2 border-gray-200 hover:border-emerald-300'
              }`}
            >
              <img
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                className="w-16 h-16 object-cover rounded-md"
              />
              {image.isThumbnail && (
                <div className="absolute top-0 left-0 bg-emerald-500 text-white text-xs px-1 py-0.5 rounded-tl-md">
                  T
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel; 