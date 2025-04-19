import { useEffect } from 'react';

export function ThemeProvider({ children }) {
  useEffect(() => {
    // Always set dark mode, ignoring any preferences
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  return children;
} 