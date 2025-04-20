import React, { useState, useEffect, useRef, useMemo } from 'react';
import { OptimizedImage } from './OptimizedImage';
import { formatCloudinaryUrl } from '../../lib/cloudinary';

interface LightboxProps {
  images: string[];
  initialIndex?: number;
  quality?: number;
}

// Cache for preloaded images
const imageCache = new Map<string, string>();

// Add a cleanup function for the image cache
// This prevents the cache from growing too large
const cleanupImageCache = () => {
  if (imageCache.size > 100) {
    // Keep only the most recent 50 entries
    const keysToDelete = Array.from(imageCache.keys()).slice(0, imageCache.size - 50);
    keysToDelete.forEach(key => imageCache.delete(key));
  }
};

// Add a retry count to prevent infinite retry loops
const MAX_RETRY_COUNT = 3;

export function Lightbox({ images = [], initialIndex = 0, quality = 90 }: LightboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([]);
  const [error, setError] = useState<string | null>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const [retryCount, setRetryCount] = useState<Record<number, number>>({});
  
  // Calculate optimal image dimensions based on screen size
  const imageDimensions = useMemo(() => {
    if (typeof window === 'undefined') return { width: 1920, height: 1080 };
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Use 80% of the viewport for image display
    const maxWidth = Math.round(viewportWidth * 0.9);
    const maxHeight = Math.round(viewportHeight * 0.9);
    
    return {
      width: maxWidth,
      height: maxHeight
    };
  }, []);
  
  // Initialize image loading state
  useEffect(() => {
    if (images && images.length > 0) {
      setImagesLoaded(new Array(images.length).fill(false));
    }
  }, [images]);
  
  // Close lightbox with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = ''; // Restore scrolling
    };
  }, [isOpen, currentIndex]);
  
  // Preload all thumbnail versions when lightbox opens
  useEffect(() => {
    if (isOpen && images.length > 0) {
      images.forEach((img, index) => {
        // Create small thumbnail version for quick display
        const thumbnailUrl = formatCloudinaryUrl(img, { 
          width: 20, 
          quality: 10, 
          placeholder: true,
          blurAmount: 1000 
        });
        
        // Cache the thumbnails
        if (!imageCache.has(img)) {
          const thumbnailImage = new Image();
          thumbnailImage.src = thumbnailUrl;
          thumbnailImage.onload = () => {
            imageCache.set(img, thumbnailUrl);
          };
          thumbnailImage.onerror = () => {
            console.warn(`Failed to load thumbnail for ${img}`);
          };
        }
      });
    }
  }, [isOpen, images]);
  
  // Preload adjacent images in high quality
  useEffect(() => {
    if (isOpen && images.length > 1) {
      // Calculate next and previous indices with wrap-around
      const nextIndex = (currentIndex + 1) % images.length;
      const prevIndex = (currentIndex - 1 + images.length) % images.length;
      
      // Preload high-res versions of next and previous images
      [nextIndex, prevIndex].forEach(index => {
        try {
          const highResImage = new Image();
          highResImage.src = formatCloudinaryUrl(images[index], { 
            width: imageDimensions.width, 
            quality,
            format: 'auto'
          });
          highResImage.onerror = () => {
            console.warn(`Failed to preload image ${index}`);
          };
        } catch (err) {
          console.error(`Error preloading image ${index}:`, err);
        }
      });
    }
  }, [isOpen, currentIndex, images, imageDimensions, quality]);
  
  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
    setIsLoading(true);
    setError(null);
  };
  
  const closeLightbox = () => {
    setIsOpen(false);
  };
  
  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsLoading(true);
      setError(null);
    } else {
      setCurrentIndex(0); // Loop back to first
      setIsLoading(true);
      setError(null);
    }
  };
  
  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsLoading(true);
      setError(null);
    } else {
      setCurrentIndex(images.length - 1); // Loop to last
      setIsLoading(true);
      setError(null);
    }
  };
  
  // Handle touch events for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  
  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      // Swipe left
      goToNext();
    } else if (touchEndX.current - touchStartX.current > 50) {
      // Swipe right
      goToPrev();
    }
  };

  // Handle image load error with retry logic
  const handleImageError = () => {
    setIsLoading(false);
    
    // Check retry count for current image
    const currentRetryCount = retryCount[currentIndex] || 0;
    
    if (currentRetryCount < MAX_RETRY_COUNT) {
      // Increment retry count
      setRetryCount({
        ...retryCount,
        [currentIndex]: currentRetryCount + 1
      });
      
      // Auto-retry after a delay with increasing backoff
      const delay = Math.min(1000 * (currentRetryCount + 1), 5000);
      
      console.log(`Retrying image ${currentIndex + 1} (attempt ${currentRetryCount + 1}/${MAX_RETRY_COUNT}) in ${delay}ms`);
      
      setIsLoading(true);
      setTimeout(() => {
        // Force remount of component by changing a key
        setCurrentIndex(currentIndex);
      }, delay);
    } else {
      setError(`Failed to load image ${currentIndex + 1} after ${MAX_RETRY_COUNT} attempts`);
    }
  };
  
  // Reset retry count when image successfully loads
  const handleImageLoaded = () => {
    setIsLoading(false);
    
    // Clear retry count for this image
    if (retryCount[currentIndex]) {
      const newRetryCounts = {...retryCount};
      delete newRetryCounts[currentIndex];
      setRetryCount(newRetryCounts);
    }
    
    const newImagesLoaded = [...imagesLoaded];
    newImagesLoaded[currentIndex] = true;
    setImagesLoaded(newImagesLoaded);
  };
  
  // Expose the openLightbox function to the window so we can call it from Astro
  useEffect(() => {
    (window as any).openLightbox = openLightbox;
    return () => {
      delete (window as any).openLightbox;
    };
  }, []);
  
  // Add cache cleanup when component unmounts
  useEffect(() => {
    return () => {
      cleanupImageCache();
    };
  }, []);
  
  // Check valid initialIndex
  const validInitialIndex = initialIndex >= 0 && initialIndex < images.length 
    ? initialIndex 
    : 0;
  
  // Make sure currentIndex is always valid
  useEffect(() => {
    if (currentIndex >= images.length) {
      setCurrentIndex(0);
    }
  }, [images, currentIndex]);
  
  if (!images || images.length === 0) return null;
  
  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close button */}
          <button 
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-electric-red transition-colors z-50"
            aria-label="Close lightbox"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Previous button */}
          {images.length > 1 && (
            <button 
              onClick={goToPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-electric-red transition-colors z-50"
              aria-label="Previous image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          {/* Current image with loading indicator */}
          <div className="w-full h-full flex items-center justify-center">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-electric-blue rounded-full animate-spin border-t-transparent"></div>
              </div>
            )}
            
            {error ? (
              <div className="text-white text-center p-4">
                <p className="text-electric-red mb-2">{error}</p>
                <button 
                  onClick={() => {
                    // Reset retry count for this image
                    const newRetryCounts = {...retryCount};
                    delete newRetryCounts[currentIndex];
                    setRetryCount(newRetryCounts);
                    
                    setIsLoading(true);
                    setError(null);
                  }}
                  className="bg-electric-blue text-black px-4 py-2 mt-2 hover:bg-white transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <OptimizedImage 
                key={`image-${currentIndex}-attempt-${retryCount[currentIndex] || 0}`}
                publicId={images[currentIndex]}
                alt={`Image ${currentIndex + 1} of ${images.length}`}
                className={`max-h-[90vh] max-w-[90vw] object-contain transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                width={imageDimensions.width}
                height={imageDimensions.height}
                quality={quality}
                priority={true}
                onLoad={handleImageLoaded}
                onError={handleImageError}
              />
            )}
          </div>
          
          {/* Next button */}
          {images.length > 1 && (
            <button 
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-electric-red transition-colors z-50"
              aria-label="Next image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          
          {/* Image count indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}
          
          {/* Thumbnail navigation for quick jumping between images */}
          {images.length > 3 && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex space-x-2 overflow-x-auto max-w-[90vw] p-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setIsLoading(true);
                    setError(null);
                  }}
                  className={`w-16 h-12 border-2 flex-shrink-0 transition-all duration-200 ${
                    currentIndex === idx 
                      ? 'border-electric-blue scale-110' 
                      : 'border-gray-500 opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`View image ${idx + 1}`}
                >
                  <OptimizedImage
                    publicId={img}
                    alt=""
                    width={64}
                    height={48}
                    className="w-full h-full object-cover"
                    quality={60}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
} 