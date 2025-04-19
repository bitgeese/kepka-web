import React, { useState } from 'react';
import { getAssetUrl } from '../../lib/directus';
import { getImageUrl } from '../../lib/cloudinary';

interface DirectusImageProps {
  src: string | { directus_files_id: string } | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallback?: string;
  useCloudinary?: boolean;
  quality?: number;
  grayscale?: boolean;
  loading?: 'lazy' | 'eager';
}

export function DirectusImage({
  src,
  alt,
  width,
  height,
  className = '',
  fallback = '',
  useCloudinary = false,
  quality = 80,
  grayscale = false,
  loading = 'lazy',
}: DirectusImageProps) {
  const [error, setError] = useState(false);
  
  if (!src && !fallback) {
    return (
      <div 
        className={`flex items-center justify-center bg-muted ${className}`}
        style={{ width: width ? `${width}px` : '100%', height: height ? `${height}px` : '100%' }}
      >
        <span className="text-muted-foreground text-sm">No image</span>
      </div>
    );
  }
  
  // If src is an error and we have a fallback, use the fallback
  if (error && fallback) {
    return (
      <img
        src={fallback}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={loading}
      />
    );
  }
  
  // Get URL using the appropriate helper
  let imageUrl = '';
  
  try {
    if (useCloudinary) {
      // Use Cloudinary with transformations (including grayscale if requested)
      imageUrl = getImageUrl(src, { 
        width, 
        height, 
        quality,
        grayscale
      });
    } else {
      // Direct Directus URL
      imageUrl = getAssetUrl(typeof src === 'string' ? src : (src || ''));
    }
  } catch (e) {
    console.error('Error generating image URL:', e);
    imageUrl = fallback;
  }
  
  return (
    <img
      src={imageUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={loading}
      onError={() => {
        console.warn(`Image failed to load: ${imageUrl}`);
        setError(true);
      }}
    />
  );
} 