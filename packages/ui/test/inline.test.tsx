import { describe, expect, test } from 'vitest';
import { Inline } from '../src/text/Inline.tsx';
import { html } from './render.tsx';

describe('Inline', () => {
  test('renders the site\'s marks as elements', () => {
    expect(html(<Inline html={'<span class="nc">TU/e</span> 5EWC0 · <span class="nb">2025 – 26</span>'} />))
      .toBe('<span class="nc">TU/e</span> 5EWC0 · <span class="nb">2025 – 26</span>');
    expect(html(<Inline html={'<span class="status">in progress</span> — <span class="mono">cnt_r</span>'} />))
      .toBe('<span class="status">in progress</span> — <span class="mono">cnt_r</span>');
    expect(html(<Inline html={'<a href="https://x.eu/" rel="noopener">x.eu <span aria-hidden="true">↗</span></a><br><a href="#contact">Contact</a>'} />))
      .toBe('<a href="https://x.eu/" rel="noopener">x.eu <span aria-hidden="true">↗</span></a><br/><a href="#contact">Contact</a>');
  });

  test('resolves root links for the page', () => {
    expect(html(<Inline html={'<a href="~/notes.html#daedalus">Daedalus</a>'} />)).toBe('<a href="../notes.html#daedalus">Daedalus</a>');
    expect(html(<Inline html={'<a href="~/cv.html">CV</a>'} />, { root: '', isPlaceholder: () => false })).toBe('<a href="cv.html">CV</a>');
  });

  test('decodes the allowed entities', () => {
    expect(html(<Inline html="Assistant &amp; Reviewer, Fig.&nbsp;2" />)).toBe('Assistant &amp; Reviewer, Fig. 2');
  });

  test('throws on anything outside the grammar', () => {
    expect(() => html(<Inline html="<div>block</div>" />)).toThrow(/not allowed/);
    expect(() => html(<Inline html={'<span style="color:red">x</span>'} />)).toThrow(/not allowed/);
    expect(() => html(<Inline html={'<span class="nb">open'} />)).toThrow(/unclosed/);
    expect(() => html(<Inline html={'<a href="#x">x</span>'} />)).toThrow(/unbalanced/);
  });
});
