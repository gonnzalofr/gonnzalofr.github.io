# gonzaloferrero — portfolio

A static site: React components rendered to HTML by Astro at build time, one stylesheet, a small site script, and two islands, the only components that run in the browser: the TMDS encoder demo (HDMI page) and the 3D board (HiFi page), hydrated on preact/compat. The build writes plain HTML to `apps/web/dist/`; the other eight pages ship no JavaScript but the site script, and the site works with JavaScript disabled.

The repository is a pnpm + Turborepo workspace. The site is the app in `apps/web/`, and the paths below under `src/`, `public/` and `tools/` are relative to it. The move to Turborepo and React is done through phase 5 (every page renders from React components, and the two interactive figures are React islands); what is left is in `docs/migration-plan.md`.

The design is "Reel" (design context: `.impeccable.md`; references and direction studies are in `.design/`, which is kept out of git). It was developed on the `creative` branch and merged into `main` on 4 October 2026; the earlier monochrome monograph design is in the history before that merge (`3655a10`). `main` is the branch the deploy workflow publishes.

```
src/pages/                            the routes, one thin .astro file each: its title, description and ground, the page component it renders, and its island
src/screens/Home.tsx                  home: an introduction (name, lead, about, facts), then one band per project on its own ground, the Daedalus band and the smaller builds
src/screens/WorkIndex.tsx             all work: the four case studies + five smaller builds
src/screens/work/*.tsx                the case studies: HdmiDviTransmitter, HifiPlayer, VenusRover, RockYourBaby (case.tsx: the header and prev/next from the project's data)
src/screens/Notes.tsx                 Student Team Daedalus + the BSc EE curriculum, quartile by quartile
src/screens/Cv.tsx                    one-page CV (also printed to public/assets/Gonzalo-Ferrero-Martin-CV.pdf; re-print it when the CV changes)
src/screens/LogIndex.tsx, LogEntry.tsx  bench log: index + one page per entry in src/content/log/*.md
src/screens/NotFound.tsx              the 404 (absolute links: GitHub Pages serves it at any depth)
src/figures/                          the drawings, one file per project, as React components (literal coordinates); glimpses.tsx: each project's evidence on its home band
src/layouts/Document.astro            the document: head, skip link, the four-corner header and the Contact footer (src/chrome.tsx) around the page; `ground` picks the page's ground
src/lib/                              site.ts (what the components need to know about the page), paths.ts (its root prefix), placeholder.ts (the placeholder gate)
src/components/Tweaks.tsx             the tweaks bar (dev only; DevTweaks.astro makes it a client:only island)
src/scripts/site.js                   sticky-head height + scrollable-figure tab stops
public/                               copied to dist/ as is: assets/, fonts/, .nojekyll
tools/svg-self-close.mjs              build hook that restores self-closed SVG elements in dist/
tools/preact-islands.mjs              the islands' browser bundles get preact/compat for react (the server render stays React)
tools/share-card.html                 the share card (every page's og:image), rendered to public/assets/share-card.png
astro.config.mjs                      build.format 'preserve' keeps the URLs work/x.html, notes.html, …

At the repository root:
packages/tokens/                      the design tokens in TypeScript (grounds, inks, type scale, space, motion) → generated tokens.css; contrast test
packages/content/                     the site's facts as typed, Zod-validated data: person, projects, builds, team, curriculum, CV;
                                      views.ts derives counts, date lines, kickers, prev/next and the intro facts from them
packages/ui/                          the design system: React components (src/<group>/*.tsx) beside the CSS that styles them; render tests in test/
packages/ui/src/islands/              the two islands, TmdsEncoder and BoardViewer (board-scene.ts: the three.js scene it imports lazily)
packages/tmds/                        TMDS encode/decode, ported from the RTL (tmds_encoder.v, tb_tmds_encoder.v); tests from the testbench
packages/ui/src/styles.css            the whole design system's CSS: one file per component or concern, imported in cascade order
tooling/tsconfig/                     shared strict tsconfig presets (base, node, react)
tooling/check-site/check_site.py      the mechanical checker run on apps/web/dist/ (see below)
tooling/check-site/dist_diff.py       the parity check: compares two builds page by page (see "Parity" below)
turbo.json, pnpm-workspace.yaml       the task graph (tokens build → site build → check; test, typecheck) and the workspace; package.json pins pnpm
```

## Run locally

```bash
corepack enable    # once: puts pnpm (the version in package.json) on the PATH
pnpm install       # once, and after every pull that changes pnpm-lock.yaml
pnpm dev           # dev server with live reload at http://localhost:4321/
pnpm build         # writes apps/web/dist/
pnpm check         # build, then tooling/check-site/check_site.py on apps/web/dist — the same check the deploy workflow runs
pnpm test          # unit tests: the TMDS encoder against the testbench's properties, the tokens' contrast and CSS generation, the content's dates and views, the components' render tests
pnpm typecheck     # tsc on every TypeScript package, astro check on the site
```

Node 22.18 or newer (the tokens build runs TypeScript directly) and Python 3 are needed (the checker is a Python script with no dependencies). `corepack enable` writes the `pnpm` command next to Node's own; if that folder is not writable, run `npm install -g corepack` first or open the terminal as administrator once. Turbo caches builds in `.turbo/`: an unchanged `apps/web` is not rebuilt.

### Parity

While the migration is in progress, every change that should not alter the site is checked against a saved build of the site before it:

```bash
pnpm golden        # once, on a commit you trust: build and save apps/web/dist to .golden/dist (gitignored)
pnpm parity        # after a change: build, then compare apps/web/dist with .golden/dist; exit 1 on any difference
```

`dist_diff.py` compares every page as an element tree (attribute order and whitespace ignored), the bundled `_astro/` files by content (their hashed file names ignored; stylesheets as rules, so comments and file boundaries don't count but rule order does), and every other file byte for byte. With `--islands` (`python3 tooling/check-site/dist_diff.py .golden/dist apps/web/dist --islands`) it unwraps Astro's `<astro-island>` elements and leaves out every `<script>` and `<style>`, which compares what an island renders on the server with the markup before it, and lists each island.

## Deploy to GitHub Pages

The site is built by Astro and published by the workflow in `.github/workflows/deploy.yml`. `astro.config.mjs` sets `site: 'https://gonnzalofr.github.io'` and no `base`, so the pages are served at the root of the domain: the repository has to be the user site, not a project site.

1. Create the repository **`gonnzalofr.github.io`** (exactly that name, under the `gonnzalofr` account) and push this project to `main` (the workflow triggers on that branch only, so the local branch must be named `main`: `git branch -M main` before the first push). Renaming an existing repository to that name (Settings → General) works the same. Any other name makes it a project site served under `/<name>/`, where the root-relative `/_astro/` stylesheet and scripts do not load.

   On a free GitHub plan, Pages needs the repository to be **public**, and a public repository publishes its whole git history, not only the current files. Read the history for anything private before switching it to public (or start the public repository from a fresh, single-commit history).
2. Repository → Settings → Pages → Source: *GitHub Actions* (not "Deploy from a branch").
3. Every push to `main` then runs the `Deploy` workflow: `pnpm install --frozen-lockfile`, then `pnpm turbo run typecheck test check`, which typechecks, runs the unit tests, builds the site and runs `tooling/check-site/check_site.py` on it (the job fails on any checker error, and nothing is published), then the `apps/web/dist/` folder is uploaded and deployed to <https://gonnzalofr.github.io/>. The workflow can also be started by hand from the Actions tab (*Run workflow*).

`tooling/check-site/check_site.py` walks every `.html` in `apps/web/dist/`: tag balance, exactly one `h1`, `<html lang>`, `<main id="main">` and the skip link on every page, broken relative links, `src`s and `#fragment`s, any `<script>` but the site script on a page without an island, `<img>` without `alt`, duplicate `id`s, banned strings (`[TODO]`, phone numbers, emoji, centered text, dark-scheme CSS), and the presence of `.nojekyll` and the favicon. British spelling and hype vocabulary are warnings. Exit code 1 on errors; warnings do not fail the build.

Strings that must never ship but must not be written in the repository either (your own phone numbers, in any spelling) go in the `CHECK_PRIVATE` environment variable as one regex: set it locally (turbo passes it through to the check), and as a repository secret of the same name (Settings → Secrets and variables → Actions) for the deploy workflow. A match fails the build without printing the matched text.

## Editing

- Grounds: every route passes `ground` to `Document` (`black`, `paper`, `sand`, `walnut`, `dusk`); one ground per project (HDMI black, HiFi paper, Venus sand, Rock Your Baby walnut, Daedalus/Notes dusk). The ink and the quieter ink follow automatically, and each pair is contrast-checked in the header of the generated `tokens.css` (and asserted by `pnpm test`). The prev/next links at the end of a case study carry `data-ground` so they show the next project's ground. The page's scroll bar follows the page's ground too (dim thumb on the ground; the dark grounds switch the browser to its dark scheme), from rules generated with the grounds.
- A new project: one entry in `packages/content/src/projects.ts` (its ground, dates, status, and the copy each place shows), a glimpse in `src/figures/glimpses.tsx` registered there by its slug, and its case study (a page component in `src/screens/work/`, its drawings in `src/figures/`, and a route in `src/pages/work/`). The home band, the work-index row, the 404 link, the CV entry, the prev/next cycle and every count ("4 case studies · …") follow from the data.
- Tweaks bar: under `pnpm dev` a small "tweaks" button (bottom left) adjusts name size, width and weight, text size, density, motion and warmth live, and "Copy values" gives the values as CSS; they belong in `packages/tokens/src/tokens.ts`. It is never rendered in a build.
- Facts and short copy live in `packages/content` (dates as `2026-07`, written out by `when()`: "Jul 2026 – present", or in full on the CV); the long prose of each case study, Notes and the intro is in its page component (`src/screens/`), with `<Prose>`, `<Nb>`, `<Mono>` and the other components from `@portfolio/ui`. Short copy is *inline*: text with only the marks below, checked by the schema, with links inside the site written from the root as `~/notes.html#daedalus`. Identifiers in prose (hex, signal names, code) are wrapped in `<span class="mono">` so they set in Azeret Mono; quantities stay in the text face inside `<span class="nb">`.
- Every figure is inline SVG drawn from real numbers (`<Figure>` with a `<Diagram>`), or a photograph or render (`<PhotoFigure>`); `Figure` numbers the figures in page order and writes the "Fig. N —" caption prefix. Figure numbers cited in the prose are still written by hand.
- Status is only ever the dossier's words plus the small open square (`<span class="status">in progress</span>`); never colour.
- Motion is CSS transitions on state changes only (link underlines, the prev/next blocks); all of it is instant under `prefers-reduced-motion`. There is no animation library: anime.js was evaluated in September 2026 and left out. Data figures never tween — a waveform, trace or codeword changes by redrawing, never by interpolating between states the hardware did not produce.
- The TMDS demo's `<output>` is the one implicit status region on the site (written per change, never per tick); the checker still bans the `aria-live` attribute.
- JavaScript only in islands: a component runs in the browser only if its route gives it a `client:*` directive (see "Islands" below). Everything else renders to HTML once, at build time.
- Placeholder images never ship: `src/lib/placeholder.ts` recognizes the five labeled placeholders, `<PhotoFigure>` (and `usePublished()`) leave out every figure whose file is still one of them, and a log entry stays unpublished until its images are real. Saving the real file is the only step; the next build shows it. The checker fails the build if a placeholder reaches a page.
- Type: Anybody (variable width and weight) for everything you read — build names and section heads at weight 800 and width 150, prose at 400 and width 100 — and Azeret Mono for specs, labels, captions and figure text. Both are self-hosted latin subsets in `public/fonts/`; Anybody borrows Azeret Mono's × (its own is dot-sized).
- Layout uses a fixed set of placement classes (`.col-margin`, `.col-head`, `.col-prose`, `.fig--right`, `.fig--bleed`, …). Don't set `grid-column` anywhere else.
- Styles: a new component's CSS goes in its own file under `packages/ui/src/` and is imported in `styles.css` at the place its rules belong in the cascade (the list there is in cascade order, not alphabetical). Token values (colors, sizes, spacing) live only in `packages/tokens/src/tokens.ts`.

## Photos and renders

The images live in `public/assets/work/`. Five of them are **labeled placeholders** until the real files are saved over them with exactly these names and sizes:

| File | What | Size |
|---|---|---|
| `hifi-rev1.png` | HiFi player layout, first revision (render) | 766 × 559 |
| `hifi-rev2.png` | second revision | 939 × 699 |
| `hifi-rev3.png` | third revision | 1415 × 989 |
| `venus-bench-front.jpg` | the rover from the front on the lab bench — also the Venus band on home, in place of the drawing | 1125 × 2000 |
| `venus-bench-side.jpg` | the rover from the side, with the oscilloscope behind it | 1125 × 2000 |

Other sizes work too (the `width`/`height` attributes in the pages only set the aspect ratio), but keep the aspect ratio close. JPG or WebP, ideally under 300 KB each.

## Islands

Two figures run in the browser; each is a React component in `packages/ui/src/islands/`. A route hydrates one by passing it to its page component through a named slot (`<TmdsEncoder slot="encoder" client:visible />`), because only an `.astro` file can give a component a `client:*` directive; the page puts it inside its `<Figure>`, which keeps the caption and the figure number. The server renders each island exactly as a reader without JavaScript sees it. Their browser code runs on preact/compat (`tools/preact-islands.mjs`): about 10 kB gzip per island page against about 70 kB for React's own client, measured in phase 5, with the same component code; the HTML of every page is still rendered by React. The Tweaks bar is a third island, `client:only`, under `pnpm dev` only.

## The TMDS encoder demo (HDMI page, Fig. 3)

`packages/tmds` is the encoder from `tmds_encoder.v` in [gonnzalofr/fpga-hdmi](https://github.com/gonnzalofr/fpga-hdmi), ported line for line (the Verilog names are in its comments), and a decoder that follows `tmds_decode()` in `tb_tmds_encoder.v`. Its tests check what the testbench checks on every symbol (round trip, at most five transitions, a running disparity accumulated from the ten bits sent, the bench's bound of 12 over its stimulus), the four control codewords, one 640-pixel line of the ramp within ±8, and hand-worked symbols for each branch of the DC-balance stage.

The island (`TmdsEncoder`, `client:visible`) renders d = 0x47 from cnt_r 0 on the server, with the controls disabled and "self-check: not run — this line needs JavaScript". Hydrated, it runs the self-check over one line, enables the byte and prior-cnt_r sliders, and feeds the ramp (d = x mod 256, one symbol every 125 ms) only while "feed the ramp" is checked. Every change redraws; nothing tweens. The `<output>` is written when the reader moves a control, never on a tick of the ramp.

## The 3D board (HiFi page, Fig. 3)

`public/assets/pcb/hifi-board.glb` is the current layout exported from EasyEDA Pro as STEP and converted without losing geometry; `hifi-board.webp` is a still of the same view, and `hifi-board-cut.webp` is that still with its light backdrop made transparent (so it sits on any ground) — shown until the model loads and whenever JavaScript or WebGL is missing, and used on the home page. The `BoardViewer` island is hydrated when the figure comes within 600 px of the viewport, and only then, where WebGL works, imports three.js and the scene (`board-scene.ts`; the rest of the site ships none of it). The model moves only while it is dragged (no inertia), or with the arrow keys and + / − while it has focus; "reset view" returns to the first view. Its model, label and still are passed in from `src/figures/hifi-player.tsx`.

When the board changes, export a new STEP from EasyEDA Pro and run, from `apps/web/`:

```bash
py -3.13 -m pip install cascadio                                        # once
py -3.13 -c "import cascadio; cascadio.step_to_glb(r'HiFi_PCB.step', 'hifi-raw.glb', tol_linear=0.05, tol_angular=0.3)"
npx gltfpack -i hifi-raw.glb -o public/assets/pcb/hifi-board.glb -vp 14 -vt 12 -cc
```

Then replace `hifi-board.webp` with a 1600 × 800 still of the new model (a screenshot of the figure at that size once it has loaded), so the still and the live view match, and regenerate `hifi-board-cut.webp` from it (near-white, unsaturated pixels made transparent).

## Share card

`public/assets/share-card.png` (1200 × 630) is every page's `og:image`: the preview LinkedIn and other sites show for a shared link. It is rendered from `tools/share-card.html`, the name beside the XSIM frame on the HDMI band's warm black (add `?ground=paper` to the file's address to see it on paper). After changing the template, re-render it from `apps/web/` with headless Edge (Chrome takes the same flags):

```powershell
& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless --hide-scrollbars --window-size=1200,630 --screenshot="$PWD\public\assets\share-card.png" "$PWD\tools\share-card.html"
```

Check that the PNG is 1200 × 630 and set in Anybody and Azeret Mono, not a system face. LinkedIn caches link previews: after deploying a new card, refresh it with the Post Inspector (<https://www.linkedin.com/post-inspector/>).

## Bench log

Each entry is a Markdown file in `src/content/log/` named `YYYY-MM-DD-slug.md` with front matter `title`, `date`, `summary` and optional `tags`. Figures are written as raw HTML inside the Markdown (`<figure class="fig fig--right"><img class="fig__img" …><figcaption><span class="fig__no">Fig. 1</span> — …</figcaption></figure>`). The log index lists entries newest first; nothing else needs editing.
