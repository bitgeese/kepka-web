import React, { useEffect, useRef } from 'react';

export function Y2KHero({ kepkaData }) {
  const imageRef = useRef(null);

  // Random glitch effect on the image only
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const applyGlitchEffect = () => {
      if (imageRef.current) {
        imageRef.current.classList.add('glitch-effect-grayscale');
        setTimeout(() => {
          imageRef.current?.classList.remove('glitch-effect-grayscale');
        }, 500);
      }
    };

    // Initial glitch
    setTimeout(applyGlitchEffect, 2000);

    // Random glitches
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        applyGlitchEffect();
      }
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section 
      className="relative w-full overflow-hidden pt-4 md:pt-8 min-h-[calc(100vh-0px)]"
      style={{ 
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)'
      }}
    >
      {/* Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 h-full">
        {/* Text content */}
        <div className="md:col-span-7 flex flex-col justify-center px-6 md:px-16 py-12 z-10">
          <div className="mb-8 border-l-4 pl-4" style={{ borderColor: 'var(--electric-red)' }}>
            <h2 className="text-sm md:text-base uppercase tracking-widest mb-1 font-bold">
              Fashion Designer
            </h2>
            <p className="text-xs md:text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Warsaw, Poland
            </p>
          </div>

          <h1 
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-display font-bold tracking-tighter mb-8 leading-none"
          >
            JAKUB<br />KEPKA
          </h1>
          
          <div 
            className="text-base sm:text-lg md:text-xl max-w-md mb-12" 
            style={{ color: 'var(--foreground)', opacity: 0.9 }}
            dangerouslySetInnerHTML={{ __html: kepkaData?.description || "Contemporary fashion designer exploring the intersection of traditional craftsmanship and modern silhouettes." }}
          />
          
          <div className="flex flex-wrap gap-4">
            <a 
              href="/shop" 
              className="px-6 sm:px-8 py-3 border-2 font-bold uppercase tracking-wide bg-transparent hover:bg-electric-red hover:text-white hover:border-electric-red transition-all duration-300"
              style={{ borderColor: 'var(--foreground)' }}
            >
              Shop my Designs
            </a>
            <a 
              href="/about" 
              className="px-6 sm:px-8 py-3 font-bold uppercase tracking-wide hover:bg-electric-blue hover:border-electric-blue hover:text-white transition-all duration-300"
              style={{ 
                backgroundColor: 'var(--foreground)',
                color: 'var(--background)',
                borderColor: 'var(--foreground)',
                borderWidth: '2px'
              }}
            >
              About Me
            </a>
          </div>
        </div>

        {/* Image with diagonal slash - occupies 5 columns on desktop */}
        <div className="relative hidden md:block md:col-span-5">
          <div 
            ref={imageRef}
            className="absolute inset-0 overflow-hidden"
          >
            <img 
              src={kepkaData?.hero_image || "https://img2.storyblok.com/500x0/filters:quality(95),format(png)/f/105186/4822x6028/cd59c77950/a-painted-veil_3179_jpeg-quality-50.jpg"} 
              alt={kepkaData?.title || "Jakub Kepka Fashion"} 
              className="w-full h-full object-cover object-center grayscale hover:grayscale-0 transition-all duration-700"
              style={{ filter: 'contrast(1.2) brightness(1.05)' }}
            />
          </div>
        </div>
      </div>

      {/* Mobile image */}
      <div className="relative md:hidden mt-8 h-[50vh] sm:h-[60vh] w-full">
        <img 
          src={kepkaData?.hero_image || "https://img2.storyblok.com/500x0/filters:quality(95),format(png)/f/105186/4822x6028/cd59c77950/a-painted-veil_3179_jpeg-quality-50.jpg"} 
          alt={kepkaData?.title || "Jakub Kepka Fashion"} 
          className="w-full h-full object-cover object-center grayscale"
          style={{ filter: 'contrast(1.2) brightness(1.05)' }}
        />
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <div className="animate-bounce flex flex-col items-center opacity-80">
          <span className="text-xs uppercase tracking-wider mb-2 font-bold">Scroll</span>
          <svg width="16" height="24" viewBox="0 0 16 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="14" height="22" rx="7" stroke="currentColor" strokeWidth="2"/>
            <circle cx="8" cy="8" r="3" fill="currentColor" className="animate-pulse"/>
          </svg>
        </div>
      </div>
    </section>
  );
} 