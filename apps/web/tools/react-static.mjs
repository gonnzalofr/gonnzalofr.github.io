// Astro integration: @astrojs/react as a server-only renderer.
//
// Astro bundles the client runtime of every renderer it is given (react-dom/client, about 220 kB) into dist/_astro/,
// whether or not a page hydrates a component. Until the islands become React components (phase 5 of
// docs/migration-plan.md), no page does: React only renders HTML at build time. Registering the renderer without its
// client entrypoint keeps that unused bundle out of the build. A component given a client:* directive is then
// rendered without the script that would hydrate it, which the parity check shows as a new <astro-island> element.
// Phase 5 replaces this wrapper with plain react().
import react from '@astrojs/react';

export default function reactStatic(options) {
  const integration = react(options);
  const setup = integration.hooks['astro:config:setup'];
  return {
    ...integration,
    hooks: {
      ...integration.hooks,
      'astro:config:setup': (params) =>
        setup({ ...params, addRenderer: ({ clientEntrypoint, ...renderer }) => params.addRenderer(renderer) }),
    },
  };
}
