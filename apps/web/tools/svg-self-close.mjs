// Astro integration: restore self-closing SVG elements in the built HTML.
//
// The Astro compiler prints every empty SVG element as an open/close pair
// (`<path d="…"></path>`), while the hand-written pages this site was ported
// from wrote them self-closed (`<path d="…"/>`). The two spellings parse to the
// same DOM (these are SVG foreign-content elements), but the port is required
// to reproduce the pre-Astro markup byte for byte, so this hook rewrites the
// empty pairs back to `<name …/>` in every dist/**/*.html after the build.
// Only element names that are always empty in SVG are touched.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PAIR = /<(path|line|rect|circle|ellipse|polygon|polyline|use|stop|image)\b([^<>]*?)\s*><\/\1>/g;

async function* htmlFiles(dir) {
  for (const d of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, d.name);
    if (d.isDirectory()) yield* htmlFiles(p);
    else if (d.name.endsWith('.html')) yield p;
  }
}

export default function svgSelfClose() {
  return {
    name: 'svg-self-close',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        let files = 0, tags = 0;
        for await (const file of htmlFiles(fileURLToPath(dir))) {
          const src = await readFile(file, 'utf8');
          let n = 0;
          const out = src.replace(PAIR, (_, name, attrs) => { n++; return `<${name}${attrs}/>`; });
          if (n) { await writeFile(file, out); files++; tags += n; }
        }
        logger.info(`restored ${tags} self-closing SVG element(s) in ${files} file(s)`);
      },
    },
  };
}
