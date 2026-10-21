// @ts-check
import { defineConfig } from 'astro/config';
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
      // ship site.css as written: the minifier rewrites `@media (max-width: …)` to range syntax
      // (`(width<=…)`), which older Safari/Chrome/Firefox do not understand, so the breakpoints would stop applying there
      cssMinify: false,
    },
  },
  // the compiler expands `<path …/>` to `<path …></path>`; put the hand-written spelling back in dist/
  integrations: [svgSelfClose()],
});
