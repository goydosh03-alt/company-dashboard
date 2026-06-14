import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  adapter: vercel(),
  // pages are static by default; API endpoints opt out via `export const prerender = false`
});
