import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tokensCss } from '../src/css.ts';
import { groundNames, grounds } from '../src/tokens.ts';

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
