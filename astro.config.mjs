import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  adapter: vercel(),
  // Inline ALL CSS into each page's <head> so styles always ship with the HTML
  // (no dependency on a separate /_astro/*.css request that can 404/cache-miss).
  build: { inlineStylesheets: 'always' },
  // pages are static by default; API endpoints opt out via `export const prerender = false`
});
