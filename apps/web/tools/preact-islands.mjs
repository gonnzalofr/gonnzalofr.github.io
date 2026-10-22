// Astro integration: the islands' client bundles run on preact/compat instead of React.
//
// Every page is rendered to HTML by React at build time, and that stays React. Only the code a browser downloads to
// hydrate an island (TmdsEncoder on the HDMI page, BoardViewer on the HiFi page, Tweaks under `pnpm dev`) has `react`
// and `react-dom` resolved to preact/compat: about 10 kB gzip per island page instead of about 70 kB, with the same
// component code (measured in phase 5 of docs/migration-plan.md). @astrojs/preact's `compat` option is not used
// because it aliases the server render as well, which would change the HTML of every page.
import { fileURLToPath } from 'node:url';

const compat = {
  react: 'preact/compat',
  'react-dom': 'preact/compat',
  'react-dom/client': 'preact/compat/client',
  'react/jsx-runtime': 'preact/compat/jsx-runtime',
  'react/jsx-dev-runtime': 'preact/compat/jsx-dev-runtime',
};
// preact is a dependency of apps/web: resolve it from here, whichever package imports react
const from = fileURLToPath(import.meta.url);

export default function preactIslands() {
  const plugin = {
    name: 'preact-islands',
    enforce: 'pre',
    async resolveId(id, _importer, options) {
      const client = this.environment ? this.environment.config.consumer === 'client' : !options?.ssr;
      if (!client || !(id in compat)) return null;
      return this.resolve(compat[id], from, { ...options, skipSelf: true });
    },
  };
  return {
    name: 'preact-islands',
    hooks: { 'astro:config:setup': ({ updateConfig }) => updateConfig({ vite: { plugins: [plugin] } }) },
  };
}
