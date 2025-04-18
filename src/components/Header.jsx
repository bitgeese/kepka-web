import React, { useState } from 'react';
import { ThemeToggle } from './ui/theme-toggle';
import { Menu, X } from 'lucide-react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Header styles using CSS variables
  const headerStyles = {
    backgroundColor: 'var(--background, #FFFFFF)',
    color: 'var(--foreground, #000000)',
    borderColor: 'var(--border, #000000)'
  };

  // Transparent background for fixed header
  const transparentHeaderStyles = {
    backgroundColor: 'var(--background, rgba(255, 255, 255, 0.9))',
    backdropFilter: 'blur(8px)'
  };

  // Menu styles
  const menuItemStyles = {
    color: 'var(--foreground, #000000)',
    borderColor: 'var(--foreground, #000000)'
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50" style={transparentHeaderStyles}>
      {/* Top line accent - adds a techno edge */}
      <div className="h-1 w-full bg-gradient-to-r from-electric-red via-electric-blue to-electric-red"></div>
      
      <div className="container mx-auto flex justify-between items-center h-16 px-4">
        {/* Logo area */}
        <div className="flex items-center">
          <a 
            href="/" 
            className="font-display text-xl md:text-2xl font-bold tracking-tighter"
            style={{ color: 'var(--foreground, #000000)' }}
          >
            KEPKA
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-10">
          <a 
            href="/collections" 
            className="relative font-medium tracking-wide transition-colors group"
            style={menuItemStyles}
          >
            Collections
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-electric-red transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
          </a>
          <a 
            href="/about" 
            className="relative font-medium tracking-wide transition-colors group"
            style={menuItemStyles}
          >
            About
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-electric-red transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
          </a>
          <a 
            href="/lookbook" 
            className="relative font-medium tracking-wide transition-colors group"
            style={menuItemStyles}
          >
            Lookbook
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-electric-red transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
          </a>
          <a 
            href="/contact" 
            className="relative font-medium tracking-wide transition-colors group"
            style={menuItemStyles}
          >
            Contact
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-electric-red transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
          </a>
        </nav>

        {/* Controls area */}
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          
          {/* Mobile menu button */}
          <button 
            onClick={toggleMenu} 
            className="p-1 md:hidden focus:outline-none"
            style={{ color: 'var(--foreground, #000000)' }}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div 
        className={`absolute inset-x-0 top-[65px] z-50 border-t transform ${
          isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        } transition-all duration-300 ease-in-out md:hidden`}
        style={{
          backgroundColor: 'var(--background, #FFFFFF)',
          borderColor: 'var(--foreground, #000000)',
          borderOpacity: '0.1'
        }}
      >
        <div className="py-5 px-6 space-y-6">
          <a 
            href="/collections" 
            className="block font-medium tracking-wide hover:text-electric-red transition-colors border-b pb-3"
            style={{
              color: 'var(--foreground, #000000)',
              borderColor: 'var(--foreground, #000000)',
              borderOpacity: '0.1'
            }}
            onClick={toggleMenu}
          >
            Collections
          </a>
          <a 
            href="/about" 
            className="block font-medium tracking-wide hover:text-electric-red transition-colors border-b pb-3"
            style={{
              color: 'var(--foreground, #000000)',
              borderColor: 'var(--foreground, #000000)',
              borderOpacity: '0.1'
            }}
            onClick={toggleMenu}
          >
            About
          </a>
          <a 
            href="/lookbook" 
            className="block font-medium tracking-wide hover:text-electric-red transition-colors border-b pb-3"
            style={{
              color: 'var(--foreground, #000000)',
              borderColor: 'var(--foreground, #000000)',
              borderOpacity: '0.1'
            }}
            onClick={toggleMenu}
          >
            Lookbook
          </a>
          <a 
            href="/contact" 
            className="block font-medium tracking-wide hover:text-electric-red transition-colors pb-3"
            style={{ color: 'var(--foreground, #000000)' }}
            onClick={toggleMenu}
          >
            Contact
          </a>
        </div>
      </div>
    </header>
  );
} 