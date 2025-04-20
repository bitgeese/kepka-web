/**
 * Image utility functions for handling Directus and Cloudinary URLs
 */

// Environment variables with fallbacks
const DIRECTUS_URL = import.meta.env.PUBLIC_DIRECTUS_URL || 'https://cms.fram.dev';
const CLOUDINARY_CLOUD_NAME = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'dvlwpeoe9';
const CLOUDINARY_VERSION = import.meta.env.PUBLIC_CLOUDINARY_VERSION || '1745013619';

// Define breakpoints for responsive images
const BREAKPOINTS = [320, 640, 768, 1024, 1280, 1536, 1920];

// Define image format quality presets
const FORMAT_QUALITY_MAP: Record<string, string | number> = {
  auto: 'auto:good',
  webp: 85,
  avif: 80,
  jpg: 85,
  png: 90,
};

export interface CloudinaryUrlOptions {
  width?: number;
  height?: number;
  quality?: number | string;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png' | string;
  grayscale?: boolean;
  placeholder?: boolean;
  blurAmount?: number;
  crop?: 'fill' | 'limit' | 'crop' | 'pad' | 'scale' | 'thumb' | string;
  gravity?: 'auto' | 'face' | 'center' | 'faces' | string;
  aspectRatio?: number | string;
  background?: string;
  dpr?: number | string;
  fetchFormat?: string;
}

/**
 * Creates a Cloudinary transformation URL fragment from the given options
 */
function createTransformations(options: CloudinaryUrlOptions = {}): string {
  const transformations: string[] = [];

  // Add crop and gravity parameters (if crop is specified)
  if (options.crop) {
    transformations.push(`c_${options.crop}`);
    
    if (options.gravity) {
      transformations.push(`g_${options.gravity}`);
    }
  }

  // Add width and height parameters
  if (options.width) {
    transformations.push(`w_${options.width}`);
  }
  
  if (options.height) {
    transformations.push(`h_${options.height}`);
  }

  // Add aspect ratio parameter (used for responsive images with preserved aspect ratio)
  if (options.aspectRatio) {
    transformations.push(`ar_${options.aspectRatio}`);
  }

  // Add quality parameter
  if (options.quality) {
    transformations.push(`q_${options.quality}`);
  } else if (options.format && FORMAT_QUALITY_MAP[options.format]) {
    transformations.push(`q_${FORMAT_QUALITY_MAP[options.format]}`);
  } else {
    // Default quality
    transformations.push('q_auto:good');
  }

  // Add format parameter (format is always the last transformation)
  if (options.format) {
    if (options.format === 'auto') {
      transformations.push('f_auto');
    } else {
      transformations.push(`f_${options.format}`);
    }
  } else {
    // Default to auto format for optimal browser support
    transformations.push('f_auto');
  }

  // Add grayscale effect if specified
  if (options.grayscale) {
    transformations.push('e_grayscale');
  }

  // Add placeholder blur effect if specified
  if (options.placeholder && options.blurAmount) {
    transformations.push(`e_blur:${options.blurAmount}`);
  }

  // Add background color if specified
  if (options.background) {
    transformations.push(`b_${options.background}`);
  }

  // Add DPR parameter if specified
  if (options.dpr) {
    transformations.push(`dpr_${options.dpr}`);
  }

  return transformations.join(',');
}

/**
 * Formats a Cloudinary URL with the given options
 */
export function formatCloudinaryUrl(
  publicId: string,
  options: CloudinaryUrlOptions = {}
): string {
  if (!publicId) {
    console.warn('No publicId provided to formatCloudinaryUrl');
    return '';
  }

  // Clean the publicId
  const cleanId = publicId.startsWith('http') 
    ? publicId.split('/').pop()?.split('.')[0] || publicId 
    : publicId;

  // Get the transformation string
  const transformations = createTransformations(options);

  // Construct the Cloudinary URL
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}/${cleanId}`;
}

/**
 * Generates a responsive srcSet using the Cloudinary API
 */
export function generateSrcSet(
  publicId: string,
  options: CloudinaryUrlOptions = {}
): string {
  if (!publicId) {
    console.warn('No publicId provided to generateSrcSet');
    return '';
  }

  // Generate srcset entries for each breakpoint
  return BREAKPOINTS.map(width => {
    const imgUrl = formatCloudinaryUrl(publicId, {
      ...options,
      width,
    });
    return `${imgUrl} ${width}w`;
  }).join(', ');
}

/**
 * Convert a Directus asset URL to Cloudinary public ID
 */
export function directusToCloudinary(directusUrl: string): string {
  if (!directusUrl) return '';
  
  if (directusUrl.includes('/assets/')) {
    // Extract the ID from Directus URL
    return directusUrl.split('/assets/').pop()?.split('.')[0] || '';
  }
  
  // Already a Cloudinary ID or non-Directus URL
  return directusUrl;
}

/**
 * Get the appropriate image URL based on source type
 */
export function getImageUrl(
  image: string | undefined | null,
  options: CloudinaryUrlOptions = {}
): string {
  if (!image) return '';
  
  // If it's a full URL that's not from Directus, return it directly
  if (image.startsWith('http') && !image.includes('/assets/')) {
    return image;
  }
  
  // For Directus or Cloudinary IDs, use Cloudinary
  const cloudinaryId = directusToCloudinary(image);
  return formatCloudinaryUrl(cloudinaryId, options);
}

/**
 * Determine if an URL is from our Directus instance
 */
export function isDirectusUrl(url: string): boolean {
  return url.includes('/assets/');
}

/**
 * Get a direct Directus asset URL
 * @param assetId Directus asset ID (UUID)
 * @returns Formatted Directus URL
 */
export const getDirectusUrl = (assetId: string | any): string => {
  if (!assetId) return '';
  
  // Extract ID if it's an object
  const id = typeof assetId === 'object' ? assetId.id || assetId.directus_files_id || '' : assetId;
  
  if (!id) {
    console.warn('Invalid asset ID:', assetId);
    return '';
  }
  
  // Clean the ID (remove file extension if present)
  const cleanId = id.toString().split('.')[0];
  
  return `${DIRECTUS_URL}/assets/${cleanId}`;
};

/**
 * Generate a responsive srcset from a Directus asset
 * @param assetId Directus asset ID
 * @param options Base options for the image
 * @param breakpoints Array of width breakpoints
 * @returns Formatted srcset string
 */
export const generateSrcSetFromDirectus = (
  assetId: string | any,
  options: Parameters<typeof formatCloudinaryUrl>[1] = {},
  breakpoints: number[] = [320, 640, 768, 1024, 1280, 1536, 1920]
): string => {
  return breakpoints
    .map(width => {
      const imageUrl = formatCloudinaryUrl(assetId, {
        ...options,
        width,
        // Don't override height to maintain aspect ratio
        height: options.height ? undefined : undefined
      });
      return `${imageUrl} ${width}w`;
    })
    .join(', ');
};

/**
 * Get the appropriate image URL based on configuration
 * This provides a single function to use in components
 * 
 * @param assetId Directus asset ID
 * @param options Image options
 * @param useCloudinary Whether to use Cloudinary (default: true)
 * @returns Formatted image URL
 */
export const getImageUrlFromDirectus = (
  assetId: string | any,
  options: Parameters<typeof formatCloudinaryUrl>[1] = {},
  useCloudinary = true
): string => {
  return useCloudinary 
    ? formatCloudinaryUrl(assetId, options)
    : getDirectusUrl(assetId);
}; 