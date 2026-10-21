import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tokensCss } from '../src/css.ts';
import { groundNames, grounds, inks } from '../src/tokens.ts';
import { AA, contrast } from '../src/contrast.ts';

const css = tokensCss();

test('every ground has its custom property and its rule', () => {
  for (const g of groundNames) {
    assert.ok(css.includes(`--g-${g}: ${grounds[g].g};`), `--g-${g}`);
    assert.ok(css.includes(`[data-ground="${g}"] {`), `[data-ground="${g}"]`);
  }
});

test('the contrast summary in the header is measured, not typed', () => {
  assert.match(css, /ink-light on black 16\.4 \/ walnut 14\.4/);
  assert.match(css, /dim-dark 6\.6 \/ 5\.5 \/ 5\.2/);
});

test('the scale has two voices and no third family', () => {
  assert.equal((css.match(/--f-[a-z]+:/g) ?? []).length, 2);
});

test('the page scroll bar follows the page ground: dim thumb on the ground, at least 3:1', () => {
  for (const g of groundNames) {
    const ink = grounds[g].ink;
    const head = `html:has(> body[data-ground="${g}"]) {`;
    const at = css.indexOf(head);
    assert.ok(at >= 0, `no scroll bar rule for ${g}`);
    const rule = css.slice(at + head.length, css.indexOf('}', at));
    assert.ok(rule.includes(`scrollbar-color: var(--dim-${ink}) var(--g-${g});`), `${g}: ${rule}`);
    assert.equal(rule.includes('color-scheme: dark'), ink === 'light', `${g}: color-scheme dark only on the dark grounds`);
    const r = contrast(inks[ink].dim, grounds[g].g);
    assert.ok(r >= AA.nonText, `thumb on ${g} is ${r.toFixed(2)}:1`);
  }
});
