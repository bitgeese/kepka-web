/**
 * Accessibility utilities for Kepka website
 */

// Function to ensure alt text is always provided
export function ensureAltText(alt: string | undefined, fallback: string): string {
  if (!alt || alt.trim() === '') {
    return fallback;
  }
  return alt;
}

// Color contrast checker based on WCAG guidelines
export function hasGoodContrast(foreground: string, background: string): boolean {
  // Convert hex to rgb
  const getRgb = (hex: string) => {
    const cleanHex = hex.replace('#', '');
    return {
      r: parseInt(cleanHex.substring(0, 2), 16),
      g: parseInt(cleanHex.substring(2, 4), 16),
      b: parseInt(cleanHex.substring(4, 6), 16)
    };
  };

  // Calculate relative luminance
  const getLuminance = (rgb: { r: number, g: number, b: number }) => {
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r / 255, g / 255, b / 255].map(v => 
      v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    );
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  // Check inputs are valid hex codes
  if (!foreground.startsWith('#') || !background.startsWith('#')) {
    console.warn('Color contrast check requires hex color codes');
    return false;
  }

  const fgRgb = getRgb(foreground);
  const bgRgb = getRgb(background);
  
  const fgLuminance = getLuminance(fgRgb);
  const bgLuminance = getLuminance(bgRgb);
  
  // Calculate contrast ratio
  const ratio = (Math.max(fgLuminance, bgLuminance) + 0.05) / 
                (Math.min(fgLuminance, bgLuminance) + 0.05);
  
  // WCAG AA requires 4.5:1 for normal text and 3:1 for large text
  return ratio >= 4.5;
}

// Export common accessibility attributes
export const a11yProps = {
  skipLink: {
    className: "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-background focus:text-foreground",
    href: "#main-content",
    children: "Skip to main content"
  }
}; 