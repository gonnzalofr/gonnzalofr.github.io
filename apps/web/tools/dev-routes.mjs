// Astro integration: routes that exist under `pnpm dev` only. The dev kit (src/dev/kit.astro, the living style guide at
// /dev/kit) is injected here, outside src/pages, so a build has no such route and nothing of it reaches dist/. The
// checker fails the build if a page under dev/ gets there anyway.
export default function devRoutes() {
  return {
    name: 'dev-routes',
    hooks: {
      'astro:config:setup': ({ command, injectRoute }) => {
        if (command !== 'dev') return;
        injectRoute({ pattern: '/dev/kit', entrypoint: './src/dev/kit.astro' });
      },
    },
  };
}
