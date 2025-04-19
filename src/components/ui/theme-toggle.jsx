import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className }) {
  // Since we can't know the theme on the server, default to a placeholder state
  // This avoids the hydration mismatch
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState('light'); // Default always to light for SSR

  // Only update state after component mounts in the browser
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // Apply theme to document
    const root = document.documentElement;
    if (savedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  // Effect for theme changes after initial mount
  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // If not mounted yet, render a placeholder to avoid hydration mismatch
  if (!mounted) {
    return (
      <button
        className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-colors duration-300 
          bg-foreground text-background ${className || ''}`}
        style={{
          border: '2px solid var(--foreground)',
        }}
        aria-label="Toggle theme"
      >
        <div className="h-6 w-6" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-colors duration-300 ${
        theme === 'light'
          ? 'bg-foreground text-background hover:bg-electric-red'
          : 'bg-background text-foreground hover:bg-electric-blue'
      } ${className || ''}`}
      style={{
        border: '2px solid var(--foreground)',
      }}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="h-6 w-6" />
      ) : (
        <Sun className="h-6 w-6" />
      )}
    </button>
  );
} 