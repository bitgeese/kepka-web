import React, { useState, useEffect, useRef } from 'react';
import { formatCloudinaryUrl, generateSrcSet } from '../../lib/cloudinary';

interface OptimizedImageProps {
  publicId: string;
  alt: string;
  width?: number;
  height?: number;
  aspectRatio?: number | string;
  className?: string;
  fallback?: string;
  grayscale?: boolean;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  fill?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  onLoad?: () => void;
  onError?: () => void;
}

// Default local fallback image
const DEFAULT_FALLBACK = '/images/placeholder.jpg';

/**
 * Extract Directus ID from URL if needed
 */
const extractDirectusId = (input: string): string => {
  if (!input) return '';
  
  if (input.includes('/assets/')) {
    const parts = input.split('/assets/');
    // Return the last part, removing file extension if present
    return parts[parts.length - 1].split('.')[0];
  }
  return input;
};

/**
 * Build transformation string for Cloudinary
 */
const buildTransformationString = (
  width?: number,
  height?: number,
  quality = 80,
  grayscale = false
): string => {
  const transforms = [];
  
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (quality) transforms.push(`q_${quality}`);
  if (grayscale) transforms.push('e_grayscale');
  
  return transforms.length > 0 ? transforms.join(',') : '';
};

/**
 * Generate a low-quality placeholder image URL
 */
const generatePlaceholderUrl = (publicId: string): string => {
  return formatCloudinaryUrl(publicId, {
    width: 20,
    quality: 30,
    placeholder: true,
    blurAmount: 800,
  });
};

// Add timeout handling 
const IMAGE_LOAD_TIMEOUT = 15000; // 15 seconds timeout

// Use the placeholder generator if available
const getPlaceholder = (width?: number, height?: number): string => {
  if (typeof window !== 'undefined' && window.createPlaceholderImage) {
    return window.createPlaceholderImage(width || 400, height || 300);
  }
  return DEFAULT_FALLBACK;
};

export function OptimizedImage({
  publicId,
  alt,
  width,
  height,
  aspectRatio,
  className = '',
  fallback = DEFAULT_FALLBACK,
  grayscale = false,
  priority = false,
  quality = 80,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  fill = false,
  objectFit = 'cover',
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [placeholderUrl, setPlaceholderUrl] = useState('');
  const [dynamicFallback, setDynamicFallback] = useState(fallback);
  const timeoutRef = useRef<number | null>(null);
  
  // Clean public ID
  const cleanPublicId = extractDirectusId(publicId);
  
  // Setup dynamic fallback
  useEffect(() => {
    // Try to use the placeholder generator for better dimensions
    if (error || !publicId) {
      setDynamicFallback(getPlaceholder(width, height));
    }
  }, [error, publicId, width, height]);
  
  // Generate placeholder on component mount
  useEffect(() => {
    if (cleanPublicId) {
      try {
        setPlaceholderUrl(generatePlaceholderUrl(cleanPublicId));
      } catch (err) {
        console.warn('Failed to generate placeholder:', err);
      }
    }
    
    // Set a timeout for image loading
    if (!priority) {
      timeoutRef.current = window.setTimeout(() => {
        if (!loaded) {
          console.warn(`Image load timeout for ${publicId}`);
          setError(true);
          if (onError) onError();
        }
      }, IMAGE_LOAD_TIMEOUT);
    }
    
    return () => {
      // Clear timeout on unmount
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [cleanPublicId, publicId, priority, loaded, onError]);
  
  // If publicId is empty or invalid, show fallback immediately
  if (!publicId || publicId === 'undefined' || publicId === 'null') {
    return (
      <img
        src={dynamicFallback}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        style={fill ? { objectFit } : {}}
        onLoad={onLoad}
      />
    );
  }
  
  // If there's an error and a fallback, show the fallback
  if (error && dynamicFallback) {
    return (
      <img
        src={dynamicFallback}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={onLoad}
        onError={onError}
      />
    );
  }
  
  try {
    // Base image URL
    const imageUrl = formatCloudinaryUrl(cleanPublicId, {
      width,
      height,
      quality,
      grayscale,
      format: 'auto',
      aspectRatio,
      crop: 'fill',
      gravity: 'auto',
    });
    
    // Generate responsive srcset
    const srcSet = generateSrcSet(cleanPublicId, {
      quality,
      grayscale,
      format: 'auto',
      aspectRatio,
      crop: 'fill',
      gravity: 'auto',
    });
    
    // Determine style for fill mode
    const fillStyle = fill ? {
      position: 'absolute',
      height: '100%',
      width: '100%',
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      objectFit,
    } as React.CSSProperties : {};
    
    return (
      <div
        className={`relative ${fill ? 'w-full h-full' : ''}`}
        style={fill ? { position: 'relative', overflow: 'hidden' } : {}}
      >
        {placeholderUrl && !loaded && (
          <img
            src={placeholderUrl}
            alt=""
            className={`${className} absolute inset-0 w-full h-full object-cover blur-lg scale-105 transition-opacity ${loaded ? 'opacity-0' : 'opacity-100'}`}
            aria-hidden="true"
            style={{ filter: 'blur(8px)' }}
          />
        )}
        
        <img 
          src={imageUrl}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          className={`${className} ${placeholderUrl && !loaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'auto'}
          style={fillStyle}
          onLoad={() => {
            setLoaded(true);
            if (onLoad) onLoad();
          }}
          onError={() => {
            console.warn(`Image failed to load: ${imageUrl}`);
            setError(true);
            if (onError) onError();
          }}
        />
      </div>
    );
  } catch (e) {
    console.error('Error rendering optimized image:', e);
    
    // Fallback to regular img if optimization fails
    return (
      <img 
        src={dynamicFallback || publicId} 
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        onError={() => {
          setError(true);
          if (onError) onError();
        }}
        onLoad={onLoad}
      />
    );
  }
} 