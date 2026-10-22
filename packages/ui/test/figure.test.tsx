import { describe, expect, test } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Diagram, Figure, Hatch, PhotoFigure } from '../src/figure/Figure.tsx';
import { html } from './render.tsx';

const drawing = <Diagram viewBox="0 0 800 100" title="A drawing."><rect x="0" y="0" width="10" height="10" /></Diagram>;

describe('Figure', () => {
  test('numbers figures in render order and labels the scroll box by the caption', () => {
    const out = html(<>
      <Figure placement="bleed" caption="First.">{drawing}</Figure>
      <Figure placement="right" caption="Second.">{drawing}</Figure>
    </>);
    expect(out).toContain('<figure class="fig fig--bleed" id="fig-1"><div class="fig__scroll" tabindex="0" role="group" aria-labelledby="fig-1-cap">');
    expect(out).toContain('<svg viewBox="0 0 800 100" role="img" aria-labelledby="f1t"><title id="f1t">A drawing.</title>');
    expect(out).toContain('<figcaption id="fig-1-cap"><span class="fig__no">Fig. 1</span> — First.</figcaption>');
    expect(out).toContain('<figure class="fig fig--right" id="fig-2">');
    expect(out).toContain('aria-labelledby="f2t"');
  });

  test('a placeholder photo renders nothing and takes no number', () => {
    const out = html(<>
      <PhotoFigure placement="right" src="../assets/placeholder.jpg" width={3} height={4} alt="x" caption="Hidden." />
      <PhotoFigure placement="right" src="../assets/real.jpg" width={3} height={4} alt="A real photo." portrait caption="Shown." />
    </>);
    expect(out).not.toContain('Hidden');
    expect(out).toBe('<figure class="fig fig--right" id="fig-1"><img class="fig__img fig__img--portrait" src="../assets/real.jpg" width="3" height="4" loading="lazy" decoding="async" alt="A real photo."/><figcaption id="fig-1-cap"><span class="fig__no">Fig. 1</span> — Shown.</figcaption></figure>');
  });

  test('without a SiteProvider every photo counts as a placeholder', () => {
    expect(renderToStaticMarkup(<PhotoFigure placement="right" src="../assets/real.jpg" width={3} height={4} alt="x" caption="c" />)).toBe('');
  });

  test('island figures keep their ids, and a plate caption can go without one', () => {
    const out = html(<>
      <Figure placement="bleed" id="fig-board" variant="board" data-model="m.glb" caption="Board."><p>stage</p></Figure>
      <Figure placement="bleed" variant="plate" captionId={false} caption="Plate."><p>frame</p></Figure>
    </>);
    expect(out).toContain('<figure class="fig fig--bleed board" id="fig-board" data-model="m.glb"><p>stage</p><figcaption id="fig-1-cap">');
    expect(out).toContain('<figure class="fig fig--bleed plate" id="fig-2"><p>frame</p><figcaption><span class="fig__no">');
  });

  test('the hatch has the fixed id the stylesheet fills with', () => {
    expect(html(<svg><defs><Hatch stroke="s-rule" /></defs></svg>)).toContain('<pattern id="hatch"');
  });
});
