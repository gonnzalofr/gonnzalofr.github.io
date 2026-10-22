import { describe, expect, test } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { BoardViewer } from '../src/islands/BoardViewer.tsx';
import { TmdsEncoder } from '../src/islands/TmdsEncoder.tsx';

// What the server renders is what a reader without JavaScript keeps; the page hydrates it later.
describe('TmdsEncoder', () => {
  const out = renderToStaticMarkup(<TmdsEncoder />);

  test('renders d = 0x47 from cnt_r 0, with the controls disabled and the self-check not run', () => {
    expect(out).toContain('<input id="tmds-in" type="range" min="0" max="255" disabled="" value="71"/>');
    expect(out).toContain('<input id="tmds-cnt" type="range" min="-8" max="8" step="2" disabled="" value="0"/>');
    expect(out).toContain('<input id="tmds-run" type="checkbox" disabled=""/>feed the ramp');
    expect(out).toContain('<span id="tmds-res">q_out = 0100111101 · cnt_r 0 → +2</span>');
    expect(out).toContain('<p class="tmds__check" id="tmds-check">self-check: not run — this line needs JavaScript</p>');
    expect(out).not.toContain('aria-valuetext');
  });

  test('draws the symbol from the encoder, and labels the drawing by the figure caption', () => {
    expect(out).toContain('<path class="crisp" id="tw-q" d="M130 99 H166 V119 H202 V99 H346 V119 H418 V99 H454 V119 H490"></path>');
    expect(out).toContain('<polyline class="crisp s-ramp" id="tmds-trace" points="183,110 213,110 213,94 246,94"></polyline>');
    expect(out).toContain('<div class="fig__scroll" tabindex="0" role="group" aria-labelledby="fig-tmds-cap">');
    expect(out).toContain('<title id="ftt">');
  });
});

describe('BoardViewer', () => {
  test('renders the still render, says why it stays still, and hides the reset', () => {
    const out = renderToStaticMarkup(<BoardViewer model="m.glb" label="A board." poster={{ src: 'b.webp', width: 1600, height: 800, alt: 'A board, rendered.' }} />);
    expect(out).toBe('<div class="board__stage"><img class="board__poster" src="b.webp" width="1600" height="800" loading="lazy" decoding="async" alt="A board, rendered."/></div>'
      + '<p class="board__bar"><span class="board__status" id="board-status">still render · turning the model needs JavaScript and WebGL</span><button class="board__reset" type="button" hidden="">reset view</button></p>');
  });
});
