import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2020',
    outDir: 'dist',
    minify: 'oxc',
    rollupOptions: {
      output: {
        manualChunks: undefined, // single bundle for a small intro
      },
    },
  },
});
