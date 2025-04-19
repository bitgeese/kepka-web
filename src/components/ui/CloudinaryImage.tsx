import React, { useState } from 'react';
import { getAssetUrl } from '../../lib/directus';

interface CloudinaryImageProps {
  publicId: string;
  alt: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  crop?: 'fill' | 'scale' | 'crop';
  gravity?: 'auto' | 'face' | 'center' | 'north';
  className?: string;
  fallback?: string;
  grayscale?: boolean;
  loading?: 'lazy' | 'eager';
  quality?: number;
}

export function CloudinaryImage({
  publicId,
  alt,
  width,
  height,
  aspectRatio,
  crop = 'fill',
  gravity = 'auto',
  className = '',
  fallback = '',
  grayscale = false,
  loading = 'lazy',
  quality = 80,
}: CloudinaryImageProps) {
  const [error, setError] = useState(false);
  
  // Extract Directus ID from URL if needed
  const extractId = (input: string): string => {
    if (input.includes('/assets/')) {
      const parts = input.split('/assets/');
      // Return the last part, removing file extension if present
      return parts[parts.length - 1].split('.')[0];
    }
    return input;
  };
  
  const cleanPublicId = extractId(publicId);
  const cloudName = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'dvlwpeoe9';
  
  // If there's an error and a fallback, show the fallback
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
  
  // Build Cloudinary URL manually
  const buildCloudinaryUrl = () => {
    // Base URL
    let url = `https://res.cloudinary.com/${cloudName}/image/upload/`;
    
    // Add transformations
    const transforms = [];
    
    if (width) transforms.push(`w_${width}`);
    if (height) transforms.push(`h_${height}`);
    if (crop) transforms.push(`c_${crop}`);
    // Only add gravity if it's compatible with the crop mode
    if (gravity && crop !== 'scale') transforms.push(`g_${gravity}`);
    if (grayscale) transforms.push('e_grayscale');
    if (quality) transforms.push(`q_${quality}`);
    
    if (transforms.length > 0) {
      url += transforms.join(',') + '/';
    }
    
    // Add the public ID
    url += cleanPublicId;
    
    return url;
  };
  
  try {
    const cloudinaryUrl = buildCloudinaryUrl();
    
    return (
      <img 
        src={cloudinaryUrl}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={loading}
        onError={() => {
          console.warn(`Cloudinary image failed to load: ${cloudinaryUrl}`);
          setError(true);
        }}
      />
    );
  } catch (e) {
    console.error('Error rendering Cloudinary image:', e);
    
    // Fallback to regular img with Directus URL if Cloudinary fails
    return (
      <img 
        src={fallback || getAssetUrl(publicId)} 
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={loading}
        onError={() => setError(true)}
      />
    );
  }
} 