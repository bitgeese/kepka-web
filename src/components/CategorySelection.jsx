import React, { useEffect } from 'react';
import { CloudinaryImage } from './ui/CloudinaryImage';
import { getAssetUrl } from '../lib/directus';
import { SectionHeading } from './SectionHeading';

export function CategorySelection({ kepkaData }) {
  // Debug in development to see the structure of the data
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('CategorySelection kepkaData:', kepkaData);
      console.log('Photoshoot cover:', kepkaData?.photoshoots_cover);
      console.log('Paintings cover:', kepkaData?.paintings_cover);
      console.log('Products cover:', kepkaData?.products_cover);
    }
  }, [kepkaData]);

  // Define the categories with their properties
  const categories = [
    {
      title: "PHOTOSHOOTS",
      image: kepkaData?.photoshoots_cover || '',
      href: "/photoshoots",
      gravity: "auto",
    },
    {
      title: "ARTWORKS",
      image: kepkaData?.paintings_cover || '',
      href: "/artworks",
      gravity: "center", // Use center gravity for artwork images
    },
    {
      title: "SHOP",
      image: kepkaData?.products_cover || '',
      href: "/shop",
      gravity: "auto",
    }
  ];

  return (
    <section className="py-24 relative">
      {/* Subtle top divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-foreground opacity-10"></div>
      
      <div className="container mx-auto px-6 lg:px-16">
        <SectionHeading title="Explore Categories" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {categories.map((category, index) => (
            <a 
              key={index} 
              href={category.href}
              className="group relative overflow-hidden"
            >
              <div className="relative w-full aspect-square overflow-hidden border-2 border-transparent group-hover:border-electric-red transition-all duration-500">
                {category.image ? (
                  <div className="w-full h-full">
                    <CloudinaryImage 
                      publicId={getAssetUrl(category.image)}
                      alt={category.title}
                      className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
                      grayscale={false}
                      crop="fill"
                      gravity={category.gravity}
                      quality={90}
                      client:load
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-muted">
                    <span className="text-muted-foreground">No image available</span>
                  </div>
                )}
                
                {/* Simple background for text that works on all images */}
                <div className="absolute left-0 top-0 p-4 z-10">
                  <span className="inline-block bg-black bg-opacity-50 px-3 pt-1.5 pb-0.5">
                    <h3 className="text-3xl font-formula-condensed font-black text-white">
                      {category.title}
                    </h3>
                  </span>
                </div>
                
                {/* Digital noise overlay */}
                <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none"></div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
} 