import React, { useState, useEffect } from 'react';
import { ensureAltText } from '../../lib/accessibility';

export function CloudinaryImage({ 
  publicId, 
  alt = '', 
  className = '', 
  crop = "limit", 
  gravity = "auto", 
  quality = 80,
  grayscale = false,
  width,
  height,
  fallback = '',
  loading = 'lazy',
  fetchPriority,
  ...props 
}) {
  const [src, setSrc] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Ensure the image has proper alt text
  const safeAlt = ensureAltText(alt, 'Image from Kepka collection');
  
  // Handle srcset for responsive images
  const generateSrcSet = (baseUrl) => {
    if (!baseUrl) return '';
    
    // Generate multiple sizes for responsive images
    const widths = [400, 800, 1200, 1600, 2000];
    return widths
      .map(w => {
        const transformedUrl = baseUrl
          .replace('/upload/', `/upload/w_${w},q_${quality}/`)
          .replace('/image/upload/', `/image/upload/w_${w},q_${quality}/`);
        return `${transformedUrl} ${w}w`;
      })
      .join(', ');
  };

  useEffect(() => {
    if (!publicId) {
      console.warn('CloudinaryImage is missing publicId');
      setError(true);
      return;
    }

    try {
      // Process the URL: check if it's a full Cloudinary URL or just an ID
      let imageUrl = publicId;
      
      // If URLs don't include cloudinary in them, use the fallback
      if (!imageUrl.includes('cloudinary') && fallback) {
        imageUrl = fallback;
      }
      
      // Apply transformations
      let transformUrl = imageUrl;
      
      // Only apply cloudinary transformations if it's a cloudinary URL
      if (imageUrl.includes('cloudinary')) {
        const transformations = [];
        
        if (crop) transformations.push(`c_${crop}`);
        if (gravity) transformations.push(`g_${gravity}`);
        if (quality) transformations.push(`q_${quality}`);
        if (grayscale) transformations.push('e_grayscale');
        if (width) transformations.push(`w_${width}`);
        if (height) transformations.push(`h_${height}`);
        
        const transformString = transformations.join(',');
        
        // Insert transformations into the URL
        if (transformString) {
          if (imageUrl.includes('/upload/')) {
            transformUrl = imageUrl.replace('/upload/', `/upload/${transformString}/`);
          } else if (imageUrl.includes('/image/upload/')) {
            transformUrl = imageUrl.replace('/image/upload/', `/image/upload/${transformString}/`);
          }
        }
      }
      
      setSrc(transformUrl);
      setIsLoading(false);
    } catch (err) {
      console.error('Error processing Cloudinary image:', err);
      setError(true);
      setIsLoading(false);
      
      // Fallback to the provided URL if any
      if (fallback) {
        setSrc(fallback);
      }
    }
  }, [publicId, crop, gravity, quality, grayscale, width, height, fallback]);

  // For missing images or loading state
  if (!publicId || error) {
    return (
      <div 
        className={`bg-muted flex items-center justify-center ${className}`}
        role="img" 
        aria-label={safeAlt}
      >
        <span className="text-muted-foreground text-xs">Image unavailable</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`bg-muted animate-pulse ${className}`}>
        <span className="sr-only">Loading image...</span>
      </div>
    );
  }

  // Render the image with proper accessibility attributes
  return (
    <img
      src={src}
      alt={safeAlt}
      srcSet={generateSrcSet(src)}
      className={className}
      loading={loading}
      fetchPriority={fetchPriority}
      width={width}
      height={height}
      onError={() => {
        console.warn('Failed to load image:', publicId);
        setError(true);
      }}
      {...props}
    />
  );
} 