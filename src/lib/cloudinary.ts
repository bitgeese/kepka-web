/**
 * Cloudinary utility functions for handling image URLs
 */

// Cloud name from environment variables
const CLOUD_NAME = 'dvlwpeoe9';

/**
 * Format a Directus asset ID into a Cloudinary URL
 * @param assetId Directus asset ID (UUID)
 * @param options Optional transformation options
 * @returns Formatted Cloudinary URL
 */
export const formatCloudinaryUrl = (assetId: string, options: { 
  width?: number; 
  height?: number;
  quality?: number;
  version?: string;
} = {}) => {
  if (!assetId) return '';
  
  // Add file extension if not present
  const assetWithExt = assetId.includes('.') ? assetId : `${assetId}.jpg`;
  
  // Use provided version or default
  const version = options.version || '1743295651';
  
  // Build transformation string
  let transformations = '';
  
  if (options.width) transformations += `/w_${options.width}`;
  if (options.height) transformations += `/h_${options.height}`;
  if (options.quality) transformations += `/q_${options.quality}`;
  
  // Format: https://res.cloudinary.com/cloud_name/image/upload/v{version}/asset_id.jpg
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/v${version}${transformations}/${assetWithExt}`;
}; 