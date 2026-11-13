import { defineConfig } from 'vite';

export default defineConfig({
  // relative paths, so the same build works on GitHub Pages in "/" (production) and "/test/" (test env)
  base: './',
});
