import { useEffect, useRef } from 'react';
import { CloudinaryImage } from './ui/CloudinaryImage';
import { getAssetUrl } from '../lib/directus';

export function Y2KHero({ kepkaData }) {
  return (
    <section 
      className="relative w-full overflow-hidden min-h-[100vh] flex flex-col"
      style={{ 
        backgroundColor: 'black',
        color: 'white'
      }}
    >
      {/* Desktop layout */}
      <div className="hidden md:flex flex-1">
        {/* Left content panel */}
        <div className="w-1/2 flex flex-col justify-center pl-16 pr-8">
          <div className="flex items-center mb-6">
            <div className="w-1 h-16 bg-electric-red mr-4"></div>
            <div>
              <h2 className="text-base uppercase tracking-widest mb-1 font-bold">
                Fashion Designer
              </h2>
              <p className="text-sm opacity-75">
                Warsaw, Poland
              </p>
            </div>
          </div>

          <h1 
            className="text-[12rem] leading-[0.85] font-display font-bold tracking-tight mb-12"
          >
            JAKUB<br />KĘPKA
          </h1>
          
          <div className="flex gap-6">
            <a 
              href="/shop" 
              className="px-8 py-3 border-2 border-white font-bold uppercase tracking-wide bg-transparent hover:bg-electric-red hover:text-white hover:border-electric-red transition-all duration-300"
            >
              Shop My Designs
            </a>
            <a 
              href="/about" 
              className="px-8 py-3 font-bold uppercase tracking-wide bg-white text-black border-2 border-white hover:bg-electric-red hover:text-white hover:border-electric-red transition-all duration-300"
            >
              About Me
            </a>
          </div>
        </div>
        
        {/* Right image panel */}
        <div className="w-1/2 relative">
          <div className="absolute inset-0 overflow-hidden">
            <CloudinaryImage
              publicId={kepkaData.hero_image} 
              alt={kepkaData?.title || "Jakub Kepka Fashion"}
              className="w-full h-full object-cover object-center"
              grayscale={false}
              quality={90}
              crop="fill"
              gravity="north"
              client:load
            />
          </div>
        </div>
      </div>

      {/* Mobile layout - stacked with full-width elements */}
      <div className="md:hidden flex flex-col min-h-screen">
        {/* Top content */}
        <div className="flex-1 px-6 pt-10 pb-6 flex flex-col">
          <div className="flex items-center mb-6">
            <div className="w-1 h-12 bg-electric-red mr-3"></div>
            <div>
              <h2 className="text-sm uppercase tracking-widest mb-0.5 font-bold">
                Fashion Designer
              </h2>
              <p className="text-xs opacity-75">
                Warsaw, Poland
              </p>
            </div>
          </div>

          <h1 
            className="text-[7rem] leading-[0.85] font-display text-center font-bold tracking-tighter mb-8"
          >
            JAKUB KĘPKA
          </h1>
          
          <div className="flex flex-col gap-4 w-full">
            <a 
              href="/shop" 
              className="px-6 py-3 border-2 border-white font-bold uppercase tracking-wide bg-transparent hover:bg-electric-red hover:text-white hover:border-electric-red transition-all duration-300 text-center"
            >
              Shop My Designs
            </a>
            <a 
              href="/about" 
              className="px-6 py-3 font-bold uppercase tracking-wide bg-white text-black border-2 border-white hover:bg-electric-red hover:text-white hover:border-electric-red transition-all duration-300 text-center"
            >
              About Me
            </a>
          </div>
        </div>
        
        {/* Bottom image - full width and takes remaining screen space */}
        <div className="h-[60vh] w-full relative">
          <CloudinaryImage
            publicId={kepkaData?.hero_image} 
            alt={kepkaData?.title || "Jakub Kepka Fashion"}
            className="w-full h-full object-contain object-top"
            grayscale={false}
            quality={85}
            crop="scale"
            gravity="north"
            client:load
          />
        </div>
      </div>
      
      {/* Scroll indicator - only on desktop */}
      <div className="absolute bottom-8 left-0 right-0 hidden md:flex justify-center">
        <div className="animate-bounce flex flex-col items-center opacity-80">
          <span className="text-xs uppercase tracking-wider mb-2 font-mono">Scroll</span>
          <svg width="16" height="24" viewBox="0 0 16 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="14" height="22" rx="7" stroke="currentColor" strokeWidth="2"/>
            <circle cx="8" cy="8" r="3" fill="currentColor" className="animate-pulse"/>
          </svg>
        </div>
      </div>
    </section>
  );
} 