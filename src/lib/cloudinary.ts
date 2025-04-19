/**
 * Image utility functions for handling Directus and Cloudinary URLs
 */

// Environment variables with fallbacks
const DIRECTUS_URL = import.meta.env.PUBLIC_DIRECTUS_URL || 'https://cms.fram.dev';
const CLOUDINARY_CLOUD_NAME = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'dvlwpeoe9';
const CLOUDINARY_VERSION = import.meta.env.PUBLIC_CLOUDINARY_VERSION || '1745013619';

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
 * Format a Directus asset ID into a Cloudinary URL
 * @param assetId Directus asset ID (UUID)
 * @param options Optional transformation options
 * @returns Formatted Cloudinary URL
 */
export const formatCloudinaryUrl = (assetId: string | any, options: { 
  width?: number; 
  height?: number;
  quality?: number;
  version?: string;
  grayscale?: boolean;
} = {}): string => {
  if (!assetId) return '';
  
  // Extract ID if it's an object
  const id = typeof assetId === 'object' ? assetId.id || assetId.directus_files_id || '' : assetId;
  
  if (!id) {
    console.warn('Invalid asset ID:', assetId);
    return '';
  }
  
  // Extract actual ID from Directus URL if necessary
  let cleanId = id.toString();
  if (cleanId.includes('/assets/')) {
    cleanId = cleanId.split('/assets/')[1];
  }
  
  // Remove any file extension
  cleanId = cleanId.split('.')[0];
  
  // Use provided version or default
  const version = options.version || CLOUDINARY_VERSION;
  
  // Build transformation array
  const transformations = [];
  
  // Add grayscale first if needed
  if (options.grayscale) {
    transformations.push('e_grayscale');
  }
  
  // Add size transformations
  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.quality) transformations.push(`q_${options.quality}`);
  
  // Join all transformations with commas
  const transformationString = transformations.length > 0 
    ? transformations.join(',') + '/' 
    : '';
  
  // Format: https://res.cloudinary.com/cloud_name/image/upload/v{version}/{transformations}/{asset_id}.jpg
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/v${version}/${transformationString}${cleanId}.jpg`;
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
export const getImageUrl = (
  assetId: string | any,
  options: { 
    width?: number; 
    height?: number; 
    quality?: number; 
    version?: string;
    grayscale?: boolean;
  } = {},
  useCloudinary = true
): string => {
  return useCloudinary 
    ? formatCloudinaryUrl(assetId, options)
    : getDirectusUrl(assetId);
}; 