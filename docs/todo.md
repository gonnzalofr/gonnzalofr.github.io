# Todo

Things to do on the site, not yet scheduled. The migration phases are in `migration-plan.md`.

## Design

- [x] **Scroll bar matches the page's ground** (done 21 Oct 2026). `packages/tokens/src/css.ts` generates one rule per
  ground, `html:has(> body[data-ground="…"])`: the thumb in the dim ink, the track the ground itself, and
  `color-scheme: dark` on the dark grounds (black, walnut) so the browser's own parts follow. Home keeps its page ground
  (paper) for the whole page. A test in `packages/tokens` checks each rule and the thumb's contrast (at least 3:1).
  Browsers without `scrollbar-color` keep their own bar, which `color-scheme` still darkens on the dark pages.
