import { createDirectus, rest, readItems, readSingleton } from '@directus/sdk';

// Types
type Kepka = {
  title: string;
  description: string;
  hero_image: string;
  photoshoots_cover: string;
  paintings_cover: string;
  products_cover: string;
  bio_image: string;
  contact_email: string;
  contact_phone: string;
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
  date_created: string;
  slug: string;
  sort: number;
}

type Link = {
  id: string;
  description: string;
  url: string;
  type: 'Article' | 'Video' | 'Auction'; 
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
    date_created: string;
    slug: string;
    sort: number;
    products?: Product[];
}

type Product = {
  id?: string;
  images: ImageRelation[] | string[];
  title: string;
  description: string;
  price: string;
  buy_link: string;
  sizes?: string[];
  slug: string;
  date_created: string;
  quantity: number;
  material: string;
  photoshoots?: Photoshoot[];
}
export type Schema = {
  kepka_artworks: Artwork[];
  kepka: Kepka;
  kepka_pages: Page[];
  kepka_shoots: Photoshoot[];
  kepka_links: Link[];
  kepka_products: Product[];
}

// Environment variables
const DIRECTUS_URL = import.meta.env.PUBLIC_DIRECTUS_URL || 'https://cms.fram.dev';

// Create client
const directus = createDirectus<Schema>(DIRECTUS_URL).with(rest());

// ======= API Functions =======

/**
 * Fetch photoshoots with transformed image URLs
 */
export async function fetchPhotoshoots(limit = 6, includeProducts = false) {
  try {
    const photoshoots = await directus.request(
      readItems('kepka_shoots', {
        fields: [
          '*', 
          'images.directus_files_id',
          ...(includeProducts ? ['products.*'] : [])
        ] as any,
        // Fallback to date_created if sort doesn't exist
        sort: ['sort', '-date_created'],
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
        fields: ['*', 'images.directus_files_id', 'products.*'] as any,
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
    
    // Process the product junction data
    return await processPhotoshootProducts(transformedPhotoshoot);
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
 * Fetch links
 */
export async function fetchLinks() {
  try {
    return await directus.request(
      readItems('kepka_links', {
        fields: ['*'],
        sort: ['-id'],
      })
    );
  } catch (error) {
    console.error('Error fetching links:', error);
    return [];
  }
}

/**
 * Fetch products with transformed image URLs
 */
export async function fetchProducts(limit = 100, includePhotoshoots = false) {
  try {
    const products = await directus.request(
      readItems('kepka_products', {
        fields: [
          '*', 
          'images.directus_files_id',
          ...(includePhotoshoots ? ['photoshoots.*'] : [])
        ] as any,
        sort: ['-date_created'],
        limit,
      })
    ) as unknown as Product[];
    
    return transformProductImages(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

/**
 * Fetch a single product by slug
 */
export async function fetchProductBySlug(slug: string) {
  try {
    const products = await directus.request(
      readItems('kepka_products', {
        fields: ['*', 'images.directus_files_id', 'photoshoots.*'] as any,
        filter: {
          slug: { _eq: slug }
        },
        limit: 1,
      })
    ) as unknown as Product[];
    
    if (!products || products.length === 0) {
      return null;
    }
    
    const [transformedProduct] = transformProductImages(products);
    
    // Process the photoshoot junction data
    return await processProductPhotoshoots(transformedProduct);
  } catch (error) {
    console.error(`Error fetching product with slug ${slug}:`, error);
    return null;
  }
}

/**
 * Fetch a single product by ID
 */
export async function fetchProductById(id: string | number) {
  try {
    const products = await directus.request(
      readItems('kepka_products', {
        fields: ['*', 'images.directus_files_id'] as any,
        filter: {
          id: { _eq: String(id) }
        },
        limit: 1,
      })
    ) as unknown as Product[];
    
    if (!products || products.length === 0) {
      return null;
    }
    
    const [transformedProduct] = transformProductImages(products);
    return transformedProduct;
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    return null;
  }
}

/**
 * Fetch a single photoshoot by ID
 */
export async function fetchPhotoshootById(id: string | number) {
  try {
    const photoshoots = await directus.request(
      readItems('kepka_shoots', {
        fields: ['*', 'images.directus_files_id'] as any,
        filter: {
          id: { _eq: String(id) }
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
    console.error(`Error fetching photoshoot with ID ${id}:`, error);
    return null;
  }
}

/**
 * Fetch artworks with sorting
 */
export async function fetchArtworks(limit = 100) {
  try {
    return await directus.request(
      readItems('kepka_artworks', {
        fields: ['*'],
        // Fallback to date_created if sort doesn't exist
        sort: ['sort', '-date_created'],
        limit,
      })
    );
  } catch (error) {
    console.error('Error fetching artworks:', error);
    return [];
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
    const transformedPhotoshoot = {
      ...photoshoot,
      images: photoshoot.images ? photoshoot.images.map(image => getAssetUrl(image)) : []
    };
    
    // If products are included, transform their images as well
    if (transformedPhotoshoot.products && Array.isArray(transformedPhotoshoot.products)) {
      // To avoid circular references, we don't transform photoshoots inside products
      transformedPhotoshoot.products = transformedPhotoshoot.products.map(product => {
        if (!product) return product;
        
        return {
          ...product,
          images: product.images ? product.images.map(image => getAssetUrl(image)) : [],
          // Explicitly remove the photoshoots property to avoid circular references
          photoshoots: undefined
        };
      });
    }
    
    return transformedPhotoshoot;
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

// Helper function to transform product images to URLs
export const transformProductImages = (products: Product[]) => {
  return products.map(product => {
    const transformedProduct = {
      ...product,
      images: product.images ? product.images.map(image => getAssetUrl(image)) : []
    };
    
    // If photoshoots are included, transform their images as well
    if (transformedProduct.photoshoots && Array.isArray(transformedProduct.photoshoots)) {
      // To avoid circular references, we don't transform products inside photoshoots
      transformedProduct.photoshoots = transformedProduct.photoshoots.map(photoshoot => {
        if (!photoshoot) return photoshoot;
        
        return {
          ...photoshoot,
          images: photoshoot.images ? photoshoot.images.map(image => getAssetUrl(image)) : [],
          // Explicitly remove the products property to avoid circular references
          products: undefined
        };
      });
    }
    
    return transformedProduct;
  });
};

/**
 * Process and expand junction table data for products in photoshoots
 * @param photoshoot The photoshoot object containing product junction data
 * @returns Promise with processed photoshoot with expanded product data
 */
export async function processPhotoshootProducts(photoshoot: Photoshoot): Promise<Photoshoot> {
  if (!photoshoot.products || !Array.isArray(photoshoot.products)) {
    return photoshoot;
  }

  // Check if products is an array of junction objects (IDs only)
  if (photoshoot.products.length > 0 && 
      typeof photoshoot.products[0] === 'object' && 
      'kepka_products_id' in photoshoot.products[0]) {
    
    // Fetch the full product objects for each ID
    const expandedProducts: Product[] = [];
    
    for (const junction of photoshoot.products) {
      // @ts-ignore - We know the junction object has kepka_products_id
      const productId = junction.kepka_products_id;
      if (productId) {
        const product = await fetchProductById(productId);
        if (product) {
          expandedProducts.push(product);
        }
      }
    }
    
    // Replace the junction array with full product objects
    photoshoot.products = expandedProducts;
  }
  
  return photoshoot;
}

/**
 * Process and expand junction table data for photoshoots in products
 * @param product The product object containing photoshoot junction data
 * @returns Promise with processed product with expanded photoshoot data
 */
export async function processProductPhotoshoots(product: Product): Promise<Product> {
  if (!product.photoshoots || !Array.isArray(product.photoshoots)) {
    return product;
  }

  // Check if photoshoots is an array of junction objects (IDs only)
  if (product.photoshoots.length > 0 && 
      typeof product.photoshoots[0] === 'object' && 
      'kepka_shoots_id' in product.photoshoots[0]) {
    
    // Fetch the full photoshoot objects for each ID
    const expandedPhotoshoots: Photoshoot[] = [];
    
    for (const junction of product.photoshoots) {
      // @ts-ignore - We know the junction object has kepka_shoots_id
      const photoshootId = junction.kepka_shoots_id;
      if (photoshootId) {
        const photoshoot = await fetchPhotoshootById(photoshootId);
        if (photoshoot) {
          expandedPhotoshoots.push(photoshoot);
        }
      }
    }
    
    // Replace the junction array with full photoshoot objects
    product.photoshoots = expandedPhotoshoots;
  }
  
  return product;
}

export default directus;