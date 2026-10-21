// Writes tokens.ts as CSS: the custom properties on :root, one rule per ground, and the hairline. The output keeps the
// declaration order the stylesheet had when it was written by hand, so the site's CSS is the same rule for rule.
import { contrast } from './contrast.ts';
import { defaultGround, fonts, groundNames, grounds, hairline, inks, knobs, layout, motion, space, type } from './tokens.ts';
import type { Ground, InkName } from './tokens.ts';

const decls = (pairs: [string, string][]) => pairs.map(([k, v]) => `--${k}: ${v};`).join(' ');

/** "ink-light on black 16.4 / walnut 14.4 · dim-light 8.1 / 7.2 · …": every pair the site sets, measured. */
export function contrastSummary(): string {
  const parts: string[] = [];
  for (const ink of Object.keys(inks) as InkName[]) {
    const on = groundNames.filter((g) => grounds[g].ink === ink);
    const ratio = (c: string, g: Ground) => contrast(c, grounds[g].g).toFixed(1);
    parts.push(`ink-${ink} on ${on.map((g) => `${g} ${ratio(inks[ink].ink, g)}`).join(' / ')}`);
    parts.push(`dim-${ink} ${on.map((g) => ratio(inks[ink].dim, g)).join(' / ')}`);
  }
  return parts.join(' · ');
}

export function tokensCss(): string {
  const ink = grounds[defaultGround].ink;
  // dark grounds first, then light: the order the ground rules have always had
  const ordered = [...groundNames].sort((a, b) => Number(grounds[a].ink === 'dark') - Number(grounds[b].ink === 'dark'));
  const groundRule = (g: Ground) =>
    `[data-ground="${g}"] { --g: var(--g-${g}); --ink: var(--ink-${grounds[g].ink}); --dim: var(--dim-${grounds[g].ink}); }`;
  // The page's scroll bar belongs to the viewport, which takes it from html; html has no ground of its own (the page
  // shell sets data-ground on body), so each rule reads it from body. Thumb in the dim ink, track the ground itself.
  const scrollRule = (g: Ground) =>
    `html:has(> body[data-ground="${g}"]) { ${grounds[g].ink === 'light' ? 'color-scheme: dark; ' : ''}scrollbar-color: var(--dim-${grounds[g].ink}) var(--g-${g}); }`;

  return `/* tokens.css — generated from packages/tokens/src/tokens.ts by \`pnpm build\`; edit the TypeScript, not this file.
   Contrast of each ink on each ground where it is used: ${contrastSummary()}.
   Link underlines and meaning-bearing strokes use the dim ink (at least 3:1 everywhere). */
:root {
  color-scheme: light;
  ${decls([['f-sans', fonts.sans], ['f-mono', fonts.mono]])}
  ${decls(groundNames.map((g) => [`g-${g}`, grounds[g].g]))}
  ${decls([['ink-light', inks.light.ink], ['ink-dark', inks.dark.ink], ['dim-light', inks.light.dim], ['dim-dark', inks.dark.dim]])}
  ${decls([['g', `var(--g-${defaultGround})`], ['ink', `var(--ink-${ink})`], ['dim', `var(--dim-${ink})`]])}
  ${decls(Object.entries(knobs))}
  ${Object.entries(type).map(([k, v]) => decls([[`t-${k}`, v]])).join('\n  ')}
  ${decls(Object.entries(layout))}
  ${decls(Object.entries(space).map(([k, v]) => [k, `calc(${v} * var(--k-space))`]))}
  ${decls(Object.entries(motion))}
}
/* grounds: one per page (the page shell sets data-ground); on home, one per project band */
${ordered.map(groundRule).join('\n')}
[data-ground] { --hair: ${hairline}; }   /* decorative hairlines only */
/* the page's scroll bar on the page's ground; the dark grounds also switch the browser's own parts to dark */
${groundNames.map(scrollRule).join('\n')}
`;
}
