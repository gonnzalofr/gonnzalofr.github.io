// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import devRoutes from './tools/dev-routes.mjs';
import preactIslands from './tools/preact-islands.mjs';
import svgSelfClose from './tools/svg-self-close.mjs';

export default defineConfig({
  site: 'https://gonnzalofr.github.io',
  // 'preserve' keeps the source layout: work/index.astro -> work/index.html, work/x.astro -> work/x.html
  // ('file' would flatten work/index.astro to work.html and break the existing URLs).
  build: { format: 'preserve' },
  compressHTML: false,
  trailingSlash: 'ignore',
  vite: {
    build: {
      // keep site.js as a hashed external file instead of inlining it into every page (it is under Vite's 4 kB inline limit)
      assetsInlineLimit: 0,
      // ship the stylesheet (packages/ui/src/styles.css) as written: the minifier rewrites `@media (max-width: …)` to range syntax
      // (`(width<=…)`), which older Safari/Chrome/Firefox do not understand, so the breakpoints would stop applying there
      cssMinify: false,
    },
  },
  // React renders every component to static HTML at build time; only a component given a client:* directive (the
  // islands, on the HDMI and HiFi pages) ships JavaScript, and that runs on preact/compat (see tools/preact-islands.mjs).
  // React and the Astro compiler both write `<path …/>` as `<path …></path>`; svgSelfClose puts the hand-written
  // spelling back in dist/. devRoutes adds /dev/kit under `pnpm dev` only.
  integrations: [react(), preactIslands(), svgSelfClose(), devRoutes()],
});
