import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// No props required for this component
export function Y2KHero() {
  const imageRef = useRef(null);
  const textRef = useRef(null);

  // Random glitch effect on load and occasionally
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const applyGlitchEffect = () => {
      if (imageRef.current) {
        imageRef.current.classList.add('glitch-effect');
        setTimeout(() => {
          imageRef.current?.classList.remove('glitch-effect');
        }, 500);
      }
      
      if (textRef.current) {
        textRef.current.classList.add('text-glitch');
        setTimeout(() => {
          textRef.current?.classList.remove('text-glitch');
        }, 800);
      }
    };

    // Initial glitch
    applyGlitchEffect();

    // Random glitches
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        applyGlitchEffect();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[90vh] w-full overflow-hidden bg-background dark:bg-foreground">
      {/* Grid layout for Y2K techno aesthetic */}
      <div className="grid grid-cols-1 md:grid-cols-2 h-full">
        {/* Text content with stark minimalism */}
        <div className="flex flex-col justify-center px-6 md:px-16 py-12 z-10">
          <div className="mb-8 border-l-4 border-electric-red pl-4">
            <h2 className="text-sm md:text-base uppercase tracking-widest text-foreground dark:text-background mb-1">
              Fashion Designer
            </h2>
            <p className="text-xs md:text-sm text-foreground/70 dark:text-background/70">
              Warsaw / Berlin / London
            </p>
          </div>

          <h1 
            ref={textRef}
            className="text-7xl md:text-9xl font-display font-bold tracking-tighter mb-8 text-foreground dark:text-background leading-none"
            data-text="JAKUB KEPKA"
          >
            JAKUB<br />KEPKA
          </h1>
          
          <p className="text-lg md:text-xl max-w-md mb-12 text-foreground/90 dark:text-background/90">
            Bold, disruptive approach fusing Y2K techno aesthetics with Polish design sensibilities.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <a 
              href="/collections" 
              className="px-8 py-3 border-2 border-foreground dark:border-background font-bold uppercase tracking-wide bg-transparent hover:bg-electric-red hover:text-background hover:border-electric-red dark:hover:text-foreground transition-all duration-300"
            >
              View Collections
            </a>
            <a 
              href="/about" 
              className="px-8 py-3 bg-foreground text-background dark:bg-background dark:text-foreground border-2 border-foreground dark:border-background font-bold uppercase tracking-wide hover:bg-electric-blue hover:border-electric-blue hover:text-foreground dark:hover:text-background transition-all duration-300"
            >
              About Me
            </a>
          </div>
        </div>

        {/* Image with diagonal slash and high contrast */}
        <div className="relative hidden md:block">
          <div 
            ref={imageRef}
            className="absolute inset-0 overflow-hidden"
          >
            <img 
              src="https://img2.storyblok.com/500x0/filters:quality(95),format(png)/f/105186/4822x6028/cd59c77950/a-painted-veil_3179_jpeg-quality-50.jpg" 
              alt="Jakub Kepka Fashion" 
              className="w-full h-full object-cover object-center grayscale hover:grayscale-0 transition-all duration-700"
            />
            {/* Diagonal slash with electric red */}
            <div className="absolute -bottom-24 -left-24 w-[150%] h-48 bg-electric-red transform rotate-12 opacity-80 mix-blend-multiply dark:mix-blend-lighten"></div>
          </div>
        </div>
      </div>

      {/* Mobile image */}
      <div className="relative md:hidden mt-8 h-[60vh] w-full">
        <img 
          src="https://img2.storyblok.com/500x0/filters:quality(95),format(png)/f/105186/4822x6028/cd59c77950/a-painted-veil_3179_jpeg-quality-50.jpg" 
          alt="Jakub Kepka Fashion" 
          className="w-full h-full object-cover object-center grayscale"
        />
        {/* Diagonal slash with electric red for mobile */}
        <div className="absolute -bottom-12 -left-12 w-[150%] h-24 bg-electric-red transform rotate-12 opacity-80 mix-blend-multiply dark:mix-blend-lighten"></div>
      </div>

      {/* Tech-inspired noise overlay */}
      <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none"></div>
    </section>
  );
} 