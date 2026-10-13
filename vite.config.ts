import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the built site works from a domain root *or* a sub-path
  // (e.g. GitHub Pages project pages) without a rebuild.
  base: './',
  build: {
    target: 'es2020',
    assetsInlineLimit: 2048,
  },
});
