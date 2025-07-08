import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://nazo-prism.vercel.app",
  output: "static",
  prefetch: true,
  build: {
    assets: "assets",
  },
  vite: {
    css: {
      modules: {
        localsConvention: "camelCase",
      },
    },
  },
});
