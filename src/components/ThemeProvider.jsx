import { useEffect } from 'react';

export function ThemeProvider({ children }) {
  useEffect(() => {
    // Check for user preference or saved theme
    const userPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    
    // Initialize theme - either from saved preference or system preference
    if (savedTheme === 'dark' || (!savedTheme && userPrefersDark)) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, []);

  return children;
} 