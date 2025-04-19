// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [
    react()
  ],
  // Configure Cloudinary via environment variables instead of integration
  // PUBLIC_CLOUDINARY_CLOUD_NAME is already set in .env
});