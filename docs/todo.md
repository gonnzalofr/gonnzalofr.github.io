# Todo

Things to do on the site, not yet scheduled. The migration phases are in `migration-plan.md`.

## Design

- [x] **Scroll bar matches the page's ground** (done 21 Oct 2026). `packages/tokens/src/css.ts` generates one rule per
  ground, `html:has(> body[data-ground="…"])`: the thumb in the dim ink, the track the ground itself, and
  `color-scheme: dark` on the dark grounds (black, walnut) so the browser's own parts follow. Home keeps its page ground
  (paper) for the whole page. A test in `packages/tokens` checks each rule and the thumb's contrast (at least 3:1).
  Browsers without `scrollbar-color` keep their own bar, which `color-scheme` still darkens on the dark pages.

## Left from the migration

Decisions for the owner, each kept as it was for parity (details in the phase 6 notes of `migration-plan.md`):

- [ ] `TU/e` is wrapped in `nc` on the home bands but not in the work-index rows; `.nc` changes nothing visible in "Reel", so it could be removed everywhere.
- [ ] Venus's and Rock Your Baby's stacks differ between their home band and their work-index row.
- [ ] The name voice's sizes (`.band__name`, `.row h3`, `.turn a`) are literal `clamp()`s, not tokens; SVG text sizes are literal pixels.
- [ ] `check_site.py`'s viewBox-width warning never fires (a lower-casing bug), so it is not a guard today.
- [ ] `svg-self-close.mjs` could go if the parity tool treated an empty SVG pair like a self-closed element.
- [ ] Case-study prose as MDX was not done (see the phase 6 notes for why).
