import { describe, expect, test } from 'vitest';
import * as ui from '../src/index.ts';
import pkg from '../package.json' with { type: 'json' };
import { examples, islandGrounds } from '../src/kit/examples.tsx';
import { html, site } from './render.tsx';

// Exported components that need no example of their own: the provider every example already sits inside.
const infrastructure = new Set(['SiteProvider']);

const components = Object.entries(ui).filter(([name, value]) => /^[A-Z]/.test(name) && typeof value === 'function').map(([name]) => name);

describe('the dev kit', () => {
  test('shows every component @portfolio/ui exports', () => {
    const covered = new Set(examples.flatMap((e) => e.covers));
    const missing = components.filter((c) => !covered.has(c) && !infrastructure.has(c));
    expect(missing, `add an example to packages/ui/src/kit/examples.tsx for: ${missing.join(', ')}`).toEqual([]);
  });

  test('names only components that exist', () => {
    const unknown = examples.flatMap((e) => e.covers).filter((c) => !components.includes(c));
    expect(unknown).toEqual([]);
  });

  test('shows both islands', () => {
    const islands = Object.values(pkg.exports).filter((p) => p.startsWith('./src/islands/')).map((p) => p.split('/').pop()!.replace('.tsx', ''));
    expect(islands.sort()).toEqual(Object.keys(islandGrounds).sort());
  });

  test('every example renders, on its own, on a page', () => {
    for (const e of examples) {
      for (const ground of ['black', 'paper'] as const) {
        expect(() => html(e.render({ ground, id: (n) => `${ground}-${n}`, root: site.root }), site), e.title).not.toThrow();
      }
    }
  });
});
