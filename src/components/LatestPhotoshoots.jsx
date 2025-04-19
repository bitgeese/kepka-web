import React, { useEffect } from 'react';
import { getImageUrl } from '../lib/cloudinary';

export function LatestPhotoshoots({ photoshoots }) {
  // Debug in development to see the structure of the data
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('LatestPhotoshoots received:', photoshoots);
      if (photoshoots?.[0]?.images) {
        console.log('First photoshoot images:', photoshoots[0].images);
      }
    }
  }, [photoshoots]);
  
  // Helper to safely extract the first image ID
  const getFirstImageId = (photoshoot) => {
    if (!photoshoot || !photoshoot.images) return null;
    
    // Handle empty array
    if (Array.isArray(photoshoot.images) && photoshoot.images.length === 0) return null;
    
    try {
      // Case 1: Array of objects with directus_files_id (from join table)
      if (Array.isArray(photoshoot.images) && 
          typeof photoshoot.images[0] === 'object' && 
          photoshoot.images[0]?.directus_files_id) {
        return photoshoot.images[0].directus_files_id;
      }
      
      // Case 2: Array of numbers (direct IDs)
      if (Array.isArray(photoshoot.images) && 
          typeof photoshoot.images[0] === 'number') {
        return photoshoot.images[0].toString();
      }
      
      // Case 3: Array of direct string IDs
      if (Array.isArray(photoshoot.images) && typeof photoshoot.images[0] === 'string') {
        return photoshoot.images[0];
      }
      
      // Case 4: Single string
      if (typeof photoshoot.images === 'string') {
        return photoshoot.images;
      }
      
      // Case 5: Single object with id
      if (typeof photoshoot.images === 'object' && photoshoot.images?.id) {
        return photoshoot.images.id;
      }
      
      // Case 6: Object with directus_files_id (from kepka_shoots_files join table)
      if (photoshoot.kepka_shoots_files && 
          Array.isArray(photoshoot.kepka_shoots_files) && 
          photoshoot.kepka_shoots_files[0]?.directus_files_id) {
        return photoshoot.kepka_shoots_files[0].directus_files_id;
      }
      
      console.warn('Unable to determine image ID format:', photoshoot.images);
      return null;
    } catch (error) {
      console.error('Error extracting image ID:', error);
      return null;
    }
  };

  // If no photoshoots, show a message
  if (!photoshoots || photoshoots.length === 0) {
    return (
      <section className="py-20 relative">
        <div className="container mx-auto px-6 lg:px-16 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tighter mb-4">Latest Work</h2>
          <div className="w-24 h-1 bg-electric-red mx-auto mb-8"></div>
          <p>No photoshoots available at the moment.</p>
        </div>
      </section>
    );
  }

  // Arrange photoshoots for visual impact
  // First 2 in first row, then alternating 1-2 per row
  const arrangedPhotoshoots = arrangePhotoshoots(photoshoots.slice(0, 6));

  return (
    <section className="pt-24 pb-28 relative">
      {/* Subtle top divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-foreground opacity-10"></div>
      
      <div className="container mx-auto px-6 lg:px-16">
        <header className="mb-16">
          <h2 className="text-5xl md:text-6xl font-display font-bold tracking-tighter mb-4">Latest Work</h2>
          <div className="w-24 h-1 bg-electric-red"></div>
        </header>
        
        {/* Dynamic layout with rows of varying column counts */}
        <div className="flex flex-col gap-16">
          {arrangedPhotoshoots.map((row, rowIndex) => (
            <div key={rowIndex} className={`grid grid-cols-1 md:grid-cols-${row.length} gap-8 md:gap-12`}>
              {row.map((photoshoot, index) => {
                const imageId = getFirstImageId(photoshoot);
                return (
                  <a 
                    key={photoshoot.id || `${rowIndex}-${index}`} 
                    href={`/photoshoots/${photoshoot.slug}`} 
                    className="group relative overflow-hidden"
                  >
                    <div className={`
                      relative w-full overflow-hidden border-2 border-foreground/10 
                      transition-all duration-500 group-hover:border-electric-red
                      ${row.length === 1 ? 'aspect-[16/9]' : 'aspect-[3/4]'}
                    `}>
                      {imageId ? (
                        <img
                          src={getImageUrl(imageId, { 
                            width: row.length === 1 ? 1600 : 800, 
                            height: row.length === 1 ? 900 : 1000 
                          })}
                          alt={photoshoot.title}
                          className="w-full h-full object-cover transition-all duration-1000 grayscale group-hover:grayscale-0"
                          onError={(e) => {
                            console.warn(`Image failed to load for: ${imageId}`);
                            // If Cloudinary fails, try Directus directly
                            const directusUrl = getImageUrl(imageId, {}, false);
                            console.log('Falling back to Directus URL:', directusUrl);
                            e.target.src = directusUrl;
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-muted">
                          <span className="text-muted-foreground">No image available</span>
                        </div>
                      )}
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute bottom-0 left-0 w-full p-8">
                          <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{photoshoot.title}</h3>
                          <time className="text-sm text-white/70 block" dateTime={photoshoot.date_created}>
                            {new Date(photoshoot.date_created).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long'
                            })}
                          </time>
                          
                          {/* Description preview (only for single-column items) */}
                          {row.length === 1 && photoshoot.description && (
                            <p className="mt-4 text-white/80 line-clamp-2">
                              {stripMarkdown(photoshoot.description)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          ))}
        </div>
        
        <div className="mt-20 text-center">
          <a 
            href="/photoshoots" 
            className="inline-block px-10 py-4 border-2 font-bold uppercase tracking-wide bg-transparent hover:bg-electric-red hover:text-white hover:border-electric-red transition-all duration-300"
            style={{ borderColor: 'var(--foreground)' }}
          >
            View All Photoshoots
          </a>
        </div>
      </div>
    </section>
  );
}

// Helper to create a more visually interesting layout
function arrangePhotoshoots(photoshoots) {
  if (!photoshoots || photoshoots.length === 0) return [];
  
  // If we have 1 photoshoot, show it full width
  if (photoshoots.length === 1) {
    return [[photoshoots[0]]];
  }
  
  // If we have 2 photoshoots, show them in one row
  if (photoshoots.length === 2) {
    return [[photoshoots[0], photoshoots[1]]];
  }
  
  // If we have 3, show 1 in first row, 2 in second row
  if (photoshoots.length === 3) {
    return [
      [photoshoots[0]],
      [photoshoots[1], photoshoots[2]]
    ];
  }
  
  // If we have 4+, create an interesting layout
  // 2 in first row, then alternating 1 and 2 per row
  const result = [];
  let rowIndex = 0;
  
  // First row with 2 items
  result[rowIndex] = [photoshoots[0], photoshoots[1]];
  rowIndex++;
  
  // Process remaining items alternating 1-2 per row
  for (let i = 2; i < photoshoots.length; i += 3) {
    // Row with 1 item
    if (i < photoshoots.length) {
      result[rowIndex] = [photoshoots[i]];
      rowIndex++;
    }
    
    // Row with 2 items
    if (i + 1 < photoshoots.length && i + 2 < photoshoots.length) {
      result[rowIndex] = [photoshoots[i + 1], photoshoots[i + 2]];
      rowIndex++;
    } else if (i + 1 < photoshoots.length) {
      // If only one item left, add it to its own row
      result[rowIndex] = [photoshoots[i + 1]];
    }
  }
  
  return result;
}

// Helper to strip markdown for description preview
function stripMarkdown(text) {
  if (!text) return '';
  
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace markdown links with just the text
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // Remove bold
    .replace(/(\*|_)(.*?)\1/g, '$2') // Remove italic
    .replace(/#+\s+/g, '') // Remove headings
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();
} 