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
        <div className="w-1/2 flex flex-col justify-center pl-6 sm:pl-8 md:pl-12 lg:pl-16 pr-4 md:pr-8">
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="w-1 h-12 sm:h-16 bg-electric-red mr-3 sm:mr-4"></div>
            <div>
              <h2 className="text-sm sm:text-base uppercase tracking-widest mb-1 font-formula font-bold">
                Fashion Designer
              </h2>
              <p className="text-xs sm:text-sm opacity-75 font-serif">
                Warsaw, Poland
              </p>
            </div>
          </div>

          <h1 className="text-[8rem] sm:text-[10rem] md:text-[11rem] lg:text-[12rem] leading-[0.85] font-formula-condensed-black tracking-tight mb-8 md:mb-12">
            JAKUB KĘPKA
          </h1>
          
          <div className="flex gap-4 sm:gap-6">
            <a 
              href="/shop" 
              className="px-6 sm:px-8 py-3 border-2 border-white text-center font-bold uppercase tracking-wide bg-transparent transition-colors duration-300 hover:bg-electric-red hover:border-electric-red hover:text-white"
            >
              Shop My Designs
            </a>
            <a 
              href="/about" 
              className="px-6 sm:px-8 py-3 text-center font-bold uppercase tracking-wide bg-white text-black border-2 border-white transition-colors duration-300 hover:bg-electric-red hover:border-electric-red hover:text-white"
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
        <div className="flex-none px-4 sm:px-6 pt-8 sm:pt-10 pb-3 flex flex-col">
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="w-1 h-10 sm:h-12 bg-electric-red mr-3"></div>
            <div>
              <h2 className="text-xs sm:text-sm uppercase tracking-widest mb-0.5 font-formula font-bold">
                Fashion Designer
              </h2>
              <p className="text-xs opacity-75 font-serif">
                Warsaw, Poland
              </p>
            </div>
          </div>

          <h1 className="text-[4.5rem] sm:text-[7rem] leading-[0.85] font-formula-condensed-black text-center tracking-tight mb-5 sm:mb-6">
            JAKUB KĘPKA
          </h1>
          
          <div className="flex flex-col gap-3 sm:gap-4 w-full mb-4">
            <a 
              href="/shop" 
              className="px-6 py-3 border-2 border-white text-center font-bold uppercase tracking-wide bg-transparent transition-colors duration-300 hover:bg-electric-red hover:border-electric-red hover:text-white active:bg-electric-red active:border-electric-red active:text-white"
            >
              Shop My Designs
            </a>
            <a 
              href="/about" 
              className="px-6 py-3 text-center font-bold uppercase tracking-wide bg-white text-black border-2 border-white transition-colors duration-300 hover:bg-electric-red hover:border-electric-red hover:text-white active:bg-electric-red active:border-electric-red active:text-white"
            >
              About Me
            </a>
          </div>
        </div>
        
        {/* Bottom image - full width and takes remaining screen space */}
        <div className="h-[50vh] sm:h-[60vh] w-full relative flex-1">
          <CloudinaryImage
            publicId={kepkaData?.hero_image} 
            alt={kepkaData?.title || "Jakub Kepka Fashion"}
            className="w-full h-full object-cover object-top"
            grayscale={false}
            quality={85}
            crop="scale"
            gravity="north"
            client:load
          />
        </div>
      </div>
      
      
      
    </section>
  );
} 