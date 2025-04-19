import { createDirectus, rest, readItems, readSingleton } from '@directus/sdk';

// Types
type Kepka = {
  title: string;
  description: string;
  hero_image: string;
  photoshoots_cover_image: string;
  paintings_cover_image: string;
  products_cover_image: string;
}

type Page = {
  title: string;
  content: string;
  slug: string;
}

type Artwork = {
  cover: string;
  title: string;
  description: string;
  date_created: string
  slug: string;
}

// Updated to properly reflect actual structure from API
type ImageRelation = {
  directus_files_id: string;
}

type Photoshoot = {
    id?: string;
    images: ImageRelation[] | string[];
    title: string;
    description: string;
    date_created: string
    slug: string;
}

export type Schema = {
  kepka_artworks: Artwork[];
  kepka: Kepka;
  kepka_pages: Page[];
  kepka_shoots: Photoshoot[];
}

// Environment variables
const DIRECTUS_URL = import.meta.env.PUBLIC_DIRECTUS_URL || 'https://cms.fram.dev';

// Create client
const directus = createDirectus<Schema>(DIRECTUS_URL).with(rest());

// ======= API Functions =======

/**
 * Fetch photoshoots with transformed image URLs
 */
export async function fetchPhotoshoots(limit = 6) {
  try {
    const photoshoots = await directus.request(
      readItems('kepka_shoots', {
        fields: ['*', 'images.directus_files_id'] as any,
        sort: ['-date_created'],
        limit,
      })
    ) as unknown as Photoshoot[];
    
    return transformPhotoshootImages(photoshoots);
  } catch (error) {
    console.error('Error fetching photoshoots:', error);
    return [];
  }
}

/**
 * Fetch a single photoshoot by slug
 */
export async function fetchPhotoshootBySlug(slug: string) {
  try {
    const photoshoots = await directus.request(
      readItems('kepka_shoots', {
        fields: ['*', 'images.directus_files_id'] as any,
        filter: {
          slug: { _eq: slug }
        },
        limit: 1,
      })
    ) as unknown as Photoshoot[];
    
    if (!photoshoots || photoshoots.length === 0) {
      return null;
    }
    
    const [transformedPhotoshoot] = transformPhotoshootImages(photoshoots);
    return transformedPhotoshoot;
  } catch (error) {
    console.error(`Error fetching photoshoot with slug ${slug}:`, error);
    return null;
  }
}

/**
 * Fetch CMS pages
 */
export async function fetchPages() {
  try {
    return await directus.request(
      readItems('kepka_pages', {
        fields: ['*'],
      })
    );
  } catch (error) {
    console.error('Error fetching pages:', error);
    return [];
  }
}

/**
 * Fetch a single page by slug
 */
export async function fetchPageBySlug(slug: string) {
  try {
    const pages = await directus.request(
      readItems('kepka_pages', {
        fields: ['*'],
        filter: {
          slug: { _eq: slug }
        },
        limit: 1,
      })
    );
    
    return pages[0] || null;
  } catch (error) {
    console.error(`Error fetching page with slug ${slug}:`, error);
    return null;
  }
}

/**
 * Fetch Kepka singleton data
 */
export async function fetchKepka() {
  try {
    return await directus.request(
      readSingleton('kepka')
    );
  } catch (error) {
    console.error('Error fetching Kepka data:', error);
    return null;
  }
}

/**
 * Extract clean asset ID from various formats
 * @param input The input asset identifier or URL
 * @returns Clean asset ID
 */
function extractAssetId(input: any): string {
  if (!input) return '';
  
  // If it's an object with directus_files_id, use that
  if (typeof input === 'object' && input?.directus_files_id) {
    return input.directus_files_id;
  }
  
  // If it's already a string, check if it's a URL
  if (typeof input === 'string') {
    // Check if it's a full Directus URL
    const assetsPattern = /\/assets\/([a-zA-Z0-9\-]+)/;
    const match = input.match(assetsPattern);
    if (match && match[1]) {
      return match[1];
    }
    
    // If not a URL, use as is
    return input;
  }
  
  // Fallback
  return String(input);
}

// Helper function to transform image objects to URLs
export const transformPhotoshootImages = (photoshoots: Photoshoot[]) => {
  return photoshoots.map(photoshoot => {
    return {
      ...photoshoot,
      images: photoshoot.images.map(image => getAssetUrl(image))
    };
  });
};

// Asset helper function - can be used globally
export const getAssetUrl = (assetId: string | ImageRelation): string => {
  if (!assetId) return '';
  
  // Check if it's already a full URL to prevent duplication
  if (typeof assetId === 'string' && assetId.startsWith('http')) {
    // If it contains /assets/ and has a valid UUID format after it, use as is
    if (assetId.includes('/assets/')) {
      return assetId;
    }
  }
  
  // Extract the clean ID
  const id = extractAssetId(assetId);
  
  // Return the full URL
  return `${DIRECTUS_URL}/assets/${id}`;
};

export default directus;