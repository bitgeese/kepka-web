/**
 * Structured data generators for different page types
 */

export const generateDesignerData = (overrides = {}) => {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Jakub Kepka",
    "url": "https://jakubkepka.com",
    "sameAs": [
      "https://www.instagram.com/jakubkepka/",
      // Add other social profiles here
    ],
    "jobTitle": "Fashion Designer",
    "description": "Jakub Kepka - Fashion Designer and Creative Director based in Warsaw, Poland.",
    "knowsAbout": ["Fashion Design", "Clothing", "Textiles", "Sustainable Fashion"],
    ...overrides
  };
};

export const generateProductData = (product: any, overrides = {}) => {
  if (!product) return {};
  
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name || product.title,
    "description": product.description,
    "image": product.image || product.images?.[0],
    "sku": product.id || "",
    "brand": {
      "@type": "Brand",
      "name": "Jakub Kepka"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://jakubkepka.com/shop/${product.slug}`,
      "priceCurrency": "PLN",
      "price": product.price || "",
      "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    },
    ...overrides
  };
};

export const generatePhotoshootData = (photoshoot: any, overrides = {}) => {
  if (!photoshoot) return {};
  
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": photoshoot.title,
    "description": photoshoot.description || `${photoshoot.title} photoshoot by Jakub Kepka`,
    "image": photoshoot.images?.[0] || photoshoot.coverImage,
    "author": {
      "@type": "Person",
      "name": "Jakub Kepka"
    },
    "datePublished": photoshoot.date || new Date().toISOString().split('T')[0],
    "keywords": ["fashion", "photoshoot", "jakub kepka", photoshoot.title?.toLowerCase()].filter(Boolean),
    ...overrides
  };
}; 