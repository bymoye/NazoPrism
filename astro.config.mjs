import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://nazo-prism.vercel.app',
  output: 'static',
  prefetch: true,
  build: {
    assets: 'assets',
    inlineStylesheets: 'auto',
    rollupOptions: {
      output: {
        manualChunks: {
          'material-color-utilities': ['@material/material-color-utilities'],
          worker: ['./src/utils/color-extraction-worker.ts'],
        },
      },
    },
  },
  vite: {
    css: {
      modules: {
        localsConvention: 'camelCase',
      },
    },
    build: {
      rollupOptions: {
        treeshake: true,
      },
      chunkSizeWarningLimit: 1000,
    },
  },
});
