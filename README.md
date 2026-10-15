# gonzaloferrero — portfolio

A static site built with Astro: hand-written pages, one stylesheet, a small site script, and page-local scripts for the TMDS encoder demo (HDMI page) and the 3D board (HiFi page). The build writes plain HTML to `dist/`; the site works with JavaScript disabled.

The design is "Reel" (design context: `.impeccable.md`; references and direction studies are in `.design/`, which is kept out of git). It was developed on the `creative` branch and merged into `main` on 4 October 2026; the earlier monochrome monograph design is in the history before that merge (`3655a10`). `main` is the branch the deploy workflow publishes.

```
src/pages/index.astro                 home: an introduction (name, lead, about, facts), then one band per project on its own ground, the Daedalus band and the smaller builds
src/pages/work/index.astro            all work: the four case studies + five smaller builds
src/pages/work/*.astro                hdmi-dvi-transmitter, hifi-player, venus-rover, rock-your-baby
src/pages/notes.astro                 Student Team Daedalus + the BSc EE curriculum, quartile by quartile
src/pages/cv.astro                    one-page CV (also printed to public/assets/Gonzalo-Ferrero-Martin-CV.pdf; re-print it when cv.astro changes)
src/pages/log/                        bench log: index + one page per entry in src/content/log/*.md
src/layouts/Base.astro                the page shell: head, four-corner chrome, <main id="main">, Contact footer; `ground` prop picks the page's ground
src/components/                       Nav.astro (Work · Notes · CV · Contact), Footer.astro (Contact), Tweaks.astro (dev only)
src/styles/site.css                   the whole design system (tokens + grounds → grid → chrome → figures → home → breakpoints)
src/scripts/site.js                   sticky-head height + scrollable-figure tab stops
src/scripts/bits.js                   the TMDS bit field (same encoder port as tmds.js); not loaded by any page at the moment
src/scripts/tmds.js                   the interactive TMDS encoder on the HDMI page (loaded by that page only)
public/                               copied to dist/ as is: assets/, fonts/, .nojekyll
tools/check_site.py                   the mechanical checker run on dist/ (see below)
tools/svg-self-close.mjs              build hook that restores self-closed SVG elements in dist/
tools/share-card.html                 the share card (every page's og:image), rendered to public/assets/share-card.png
astro.config.mjs                      build.format 'preserve' keeps the URLs work/x.html, notes.html, …
```

## Run locally

```bash
npm install        # once
npm run dev        # dev server with live reload at http://localhost:4321/
npm run build      # writes dist/
npm run check      # python tools/check_site.py dist — the same check the deploy workflow runs
```

Node 22 or newer and Python 3 are needed (the checker is a Python script with no dependencies).

## Deploy to GitHub Pages

The site is built by Astro and published by the workflow in `.github/workflows/deploy.yml`. `astro.config.mjs` sets `site: 'https://gonnzalofr.github.io'` and no `base`, so the pages are served at the root of the domain: the repository has to be the user site, not a project site.

1. Create the repository **`gonnzalofr.github.io`** (exactly that name, under the `gonnzalofr` account) and push this project to `main` (the workflow triggers on that branch only, so the local branch must be named `main`: `git branch -M main` before the first push). Renaming an existing repository to that name (Settings → General) works the same. Any other name makes it a project site served under `/<name>/`, where the root-relative `/_astro/` stylesheet and scripts do not load.

   On a free GitHub plan, Pages needs the repository to be **public**, and a public repository publishes its whole git history, not only the current files. Read the history for anything private before switching it to public (or start the public repository from a fresh, single-commit history).
2. Repository → Settings → Pages → Source: *GitHub Actions* (not "Deploy from a branch").
3. Every push to `main` then runs the `Deploy` workflow: `npm ci`, `npm run build`, `python tools/check_site.py dist` (the job fails on any checker error, and nothing is published), then the `dist/` folder is uploaded and deployed to <https://gonnzalofr.github.io/>. The workflow can also be started by hand from the Actions tab (*Run workflow*).

`tools/check_site.py` walks every `.html` in `dist/`: tag balance, exactly one `h1`, `<html lang>`, `<main id="main">` and the skip link on every page, broken relative links, `src`s and `#fragment`s, `<img>` without `alt`, duplicate `id`s, banned strings (`[TODO]`, phone numbers, emoji, centered text, dark-scheme CSS), and the presence of `.nojekyll` and the favicon. British spelling and hype vocabulary are warnings. Exit code 1 on errors; warnings do not fail the build.

Strings that must never ship but must not be written in the repository either (your own phone numbers, in any spelling) go in the `CHECK_PRIVATE` environment variable as one regex: set it locally, and as a repository secret of the same name (Settings → Secrets and variables → Actions) for the deploy workflow. A match fails the build without printing the matched text.

## Editing

- Grounds: every page passes `ground` to `Base` (`black`, `paper`, `sand`, `walnut`, `dusk`); one ground per project (HDMI black, HiFi paper, Venus sand, Rock Your Baby walnut, Daedalus/Notes dusk). The ink and the quieter ink follow automatically, and each pair is contrast-checked in the comment at the top of `site.css`. The prev/next links at the end of a case study carry `data-ground` so they show the next project's ground.
- Home bands: each project on home is an `<li class="band" data-ground="…">` whose name link covers the whole band. A new project gets a band in `index.astro` (and a case study with the same ground).
- Tweaks bar: under `npm run dev` a small "tweaks" button (bottom left) adjusts name size, width and weight, text size, density, motion and warmth live, and "Copy values" gives CSS to paste into section 1 of `site.css`. It is never rendered in a build.
- Copy lives directly in the `.astro` pages. Identifiers in prose (hex, signal names, code) are wrapped in `<span class="mono">` so they set in Azeret Mono; quantities stay in the text face inside `<span class="nb">`.
- Every figure is inline SVG drawn from real numbers, or an `<img class="fig__img">` for photographs and renders; captions start with `<span class="fig__no">Fig. N</span> —`.
- Status is only ever the dossier's words plus the small open square (`<span class="status">in progress</span>`); never colour.
- Motion is CSS transitions on state changes only (link underlines, the prev/next blocks); all of it is instant under `prefers-reduced-motion`. There is no animation library: anime.js was evaluated in September 2026 and left out. Data figures never tween — a waveform, trace or codeword changes by redrawing, never by interpolating between states the hardware did not produce.
- The TMDS demo's `<output>` is the one implicit status region on the site (written per change, never per tick); the checker still bans the `aria-live` attribute.
- Placeholder images never ship: `src/lib/placeholder.ts` leaves out every figure whose file is still one of the five labeled placeholders, and a log entry stays unpublished until its images are real. Saving the real file is the only step; the next build shows it. The checker fails the build if a placeholder reaches a page.
- Type: Anybody (variable width and weight) for everything you read — build names and section heads at weight 800 and width 150, prose at 400 and width 100 — and Azeret Mono for specs, labels, captions and figure text. Both are self-hosted latin subsets in `public/fonts/`; Anybody borrows Azeret Mono's × (its own is dot-sized).
- Layout uses a fixed set of placement classes (`.col-margin`, `.col-head`, `.col-prose`, `.fig--right`, `.fig--bleed`, …). Don't set `grid-column` anywhere else.

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

## The 3D board (HiFi page, Fig. 3)

`public/assets/pcb/hifi-board.glb` is the current layout exported from EasyEDA Pro as STEP and converted without losing geometry; `hifi-board.webp` is a still of the same view, and `hifi-board-cut.webp` is that still with its light backdrop made transparent (so it sits on any ground) — shown until the model loads and whenever JavaScript or WebGL is missing, and used on the home page. `src/scripts/board.js` loads three.js only when the figure comes near the viewport (the rest of the site ships none of it). The model moves only while it is dragged.

When the board changes, export a new STEP from EasyEDA Pro and run:

```bash
py -3.13 -m pip install cascadio                                        # once
py -3.13 -c "import cascadio; cascadio.step_to_glb(r'HiFi_PCB.step', 'hifi-raw.glb', tol_linear=0.05, tol_angular=0.3)"
npx gltfpack -i hifi-raw.glb -o public/assets/pcb/hifi-board.glb -vp 14 -vt 12 -cc
```

Then replace `hifi-board.webp` with a 1600 × 800 still of the new model (a screenshot of the figure at that size once it has loaded), so the still and the live view match, and regenerate `hifi-board-cut.webp` from it (near-white, unsaturated pixels made transparent).

## Share card

`public/assets/share-card.png` (1200 × 630) is every page's `og:image`: the preview LinkedIn and other sites show for a shared link. It is rendered from `tools/share-card.html`, the name beside the XSIM frame on the HDMI band's warm black (add `?ground=paper` to the file's address to see it on paper). After changing the template, re-render it from the repository root with headless Edge (Chrome takes the same flags):

```powershell
& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless --hide-scrollbars --window-size=1200,630 --screenshot="$PWD\public\assets\share-card.png" "$PWD\tools\share-card.html"
```

Check that the PNG is 1200 × 630 and set in Anybody and Azeret Mono, not a system face. LinkedIn caches link previews: after deploying a new card, refresh it with the Post Inspector (<https://www.linkedin.com/post-inspector/>).

## Bench log

Each entry is a Markdown file in `src/content/log/` named `YYYY-MM-DD-slug.md` with front matter `title`, `date`, `summary` and optional `tags`. Figures are written as raw HTML inside the Markdown (`<figure class="fig fig--right"><img class="fig__img" …><figcaption><span class="fig__no">Fig. 1</span> — …</figcaption></figure>`). The log index lists entries newest first; nothing else needs editing.
