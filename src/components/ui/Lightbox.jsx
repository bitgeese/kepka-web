import { useState, useEffect } from 'react';

export function Lightbox({ images, initialIndex = 0 }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  // Close lightbox with Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
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
  
  const openLightbox = (index) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };
  
  const closeLightbox = () => {
    setIsOpen(false);
  };
  
  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Loop back to first
    }
  };
  
  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(images.length - 1); // Loop to last
    }
  };
  
  // Expose the openLightbox function to the window so we can call it from Astro
  useEffect(() => {
    window.openLightbox = openLightbox;
    return () => {
      delete window.openLightbox;
    };
  }, []);
  
  if (!images || images.length === 0) return null;
  
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
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
          
          {/* Current image */}
          <div className="w-full h-full flex items-center justify-center">
            <img 
              src={images[currentIndex]} 
              alt="Enlarged view" 
              className="max-h-screen max-w-full object-contain" 
            />
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
        </div>
      )}
    </>
  );
} 