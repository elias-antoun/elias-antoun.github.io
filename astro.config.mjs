// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // User site: served from the domain root. Do NOT add a `base` property.
  site: 'https://elias-antoun.github.io',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Astro builds with target 'esnext', which leaves Vite's CSS minifier
      // with no browsers to support, so it strips the prefixes older Safari
      // needs (-webkit-backdrop-filter among them). These are the browsers
      // Tailwind v4 itself supports.
      cssTarget: ['chrome111', 'edge111', 'firefox128', 'safari16.4', 'ios16.4'],
    },
  },
});
