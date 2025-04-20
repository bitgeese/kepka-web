/**
 * Generate a placeholder image using canvas
 * Used for fallback when Cloudinary images fail to load
 */

function createPlaceholderImage(width = 400, height = 300, text = 'Image not found') {
  // Create a canvas element
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set canvas dimensions
  canvas.width = width;
  canvas.height = height;
  
  // Fill background with light gray
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, width, height);
  
  // Add border
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width - 2, height - 2);
  
  // Add text
  ctx.font = 'bold 16px "ABC Laica", system-ui, serif';
  ctx.fillStyle = '#777';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);
  
  // Add dimensions text
  ctx.font = '12px "ABC Laica", system-ui, serif';
  ctx.fillText(`${width}×${height}`, width / 2, height / 2 + 20);
  
  // Convert to data URL
  return canvas.toDataURL('image/png');
}

// Export as a data URL that can be used as image src
const placeholderImage = createPlaceholderImage();

// Make it available globally
if (typeof window !== 'undefined') {
  window.createPlaceholderImage = createPlaceholderImage;
  window.placeholderImage = placeholderImage;
} 