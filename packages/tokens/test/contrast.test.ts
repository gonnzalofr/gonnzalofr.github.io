// Every ink on every ground it is set on must pass WCAG 2.2 AA, so a palette change that breaks it fails `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AA, contrast, luminance } from '../src/contrast.ts';
import { groundNames, grounds, inks } from '../src/tokens.ts';

test('the contrast formula matches the WCAG reference values', () => {
  assert.equal(contrast('#000000', '#FFFFFF').toFixed(2), '21.00');
  assert.equal(contrast('#777777', '#FFFFFF').toFixed(2), '4.48');
  assert.equal(luminance('#FFFFFF'), 1);
  assert.throws(() => luminance('#FFF'));
});

for (const g of groundNames) {
  const { ink, dim } = inks[grounds[g].ink];
  test(`${g}: the ink reads as body text (AA ${AA.text}:1)`, () => {
    const r = contrast(ink, grounds[g].g);
    assert.ok(r >= AA.text, `ink ${ink} on ${grounds[g].g} is ${r.toFixed(2)}:1`);
  });
  test(`${g}: the dim ink reads as body text too (it sets captions and labels; AA ${AA.text}:1)`, () => {
    const r = contrast(dim, grounds[g].g);
    assert.ok(r >= AA.text, `dim ${dim} on ${grounds[g].g} is ${r.toFixed(2)}:1`);
  });
}

test('the dark inks sit on light grounds and the light inks on dark grounds', () => {
  for (const g of groundNames) {
    const lightGround = luminance(grounds[g].g) > 0.18;
    assert.equal(grounds[g].ink, lightGround ? 'dark' : 'light', g);
  }
});
