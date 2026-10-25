# Migration plan: Turborepo + React

Status, 25 October 2026: **all phases done** (the parity tool; the pnpm + Turborepo workspace; tokens and the CSS split; the content package; every page rendered by React components; the TMDS demo, the 3D board and the Tweaks bar as React islands; the dev kit, the lint rules and the "add a project" guide), each with the built site identical to the one before it apart from what the islands need, rebuilt on top of the live repository (`gonnzalofr.github.io`). Decided: option A (Astro + React), pnpm, and preact/compat for the islands' browser code (phase 5). Left undone on purpose: MDX for the case studies and the log, and a `packages/figures` package (see the phase 4 and phase 6 notes).

Notes from phase 1:
- The toolchain (Astro 7.3.2, Vite 8.3.0, rolldown 1.2.8, lightningcss, postcss, the Astro compiler) is pinned in `pnpm-workspace.yaml` to the versions the npm lockfile had. A fresh resolve picked rolldown 1.2.14, whose minifier changes the three.js chunks by 149 bytes. Bumping them is its own commit, followed by `pnpm golden`.
- esbuild's install script is denied explicitly (`allowBuilds`); pnpm 12 otherwise fails a frozen install in CI.
- The shared `tooling/tsconfig` moves to phase 2, where the first package that needs it appears.

Notes from phase 2:
- Tests use Node's built-in runner (`node --test`), and the tokens build runs TypeScript directly through Node's type stripping, so the tokens package needs no build tool. Vitest arrives in phase 4 with the React render tests. TypeScript is 7.0.2 (the native compiler).
- `apps/web` is not typechecked yet: `@astrojs/check` comes with the React work in phase 4.
- `pnpm dev` builds the tokens first (turbo `dev` depends on `^build`). A change to `tokens.ts` while the dev server runs needs `pnpm --filter @portfolio/tokens build`.

Notes from phase 3:
- Each project keeps the copy each surface shows (band, work row, case header, 404, CV) side by side, because those summaries differ on purpose (the HDMI stack is "Verilog · XSIM · PYNQ-Z2" on its band and "Verilog · XSIM · Vivado" in its header). What follows from data is derived instead: numbers, grounds, dates in three styles, status marks, counts, prev/next, the intro's Now/Next facts.
- Short copy is validated *inline* HTML (only `nb`, `nc`, `mono`, `status`, `vh`, `aria-hidden` spans, links and `<br>`), so phase 4 can parse it into React elements without `dangerouslySetInnerHTML`.
- Inconsistencies kept for parity, to decide later: `TU/e` is set as `nc` on the home bands but not in the work-index rows; Venus's and Rock Your Baby's stacks differ between band and row; `.nc` changes nothing visible in "Reel" (nothing is transformed), so it could go entirely.
- `pnpm parity` and `pnpm golden` empty `apps/web/dist` first: a turbo cache hit restores outputs over what is there, and a failed build can leave Astro's `.prerender/` behind.

Notes from phase 4:
- Every route in `apps/web/src/pages/` is now a thin `.astro` file: `Document.astro` (the `<head>`, the skip link, the header and footer from `src/chrome.tsx`) around one React page component from `src/screens/`. The drawings are components in `src/figures/`, one file per project plus the home glimpses. The only other `.astro` component left is `Tweaks` (an island, phase 5); the TMDS and board scripts stay `<script>` tags in their routes.
- React 19.3.0 with `@astrojs/react` 7.0.1, registered **without its client entrypoint** (`apps/web/tools/react-static.mjs`): Astro otherwise bundles react-dom's client (220 kB) into `dist/_astro/` whether or not a page hydrates anything. Phase 5 goes back to plain `react()`. No page ships React.
- `packages/ui` has the components beside their CSS (`src/<group>/*.tsx`), exported from `src/index.ts`, with render tests in Vitest 5 (`react-dom/server`, no DOM emulation). Each page's tree is wrapped in a `SiteProvider` that carries the page's root prefix (for `~/` links and the footer), the placeholder gate (`PhotoFigure` renders nothing, and takes no figure number, while its file is a placeholder; outside a provider every image counts as one) and the figure counter. `ui` does not import `@portfolio/content`: pages pass data in.
- Inline copy from `content` is parsed into elements by `Inline` (`packages/ui/src/text/Inline.tsx`), which reads exactly the whitelisted marks and throws on anything else. The one `dangerouslySetInnerHTML` left is a log entry's body, Markdown rendered by Astro (`entry.rendered.html`).
- `apps/web` is typechecked by `astro check` (0.9.10), which needs TypeScript 5 or 6: `apps/web` has its own `typescript` 6.0.3; the packages stay on 7.0.2.
- The parity tool got stricter for this phase (`dist_diff.py`): the text content of every element that holds only inline content is compared with its spaces (a space lost between `</span> <span>` used to pass, since whitespace next to an element was dropped); text either side of a comment is read as one run (React writes `<!-- -->` between adjacent text nodes, which renders the same); a bare boolean attribute equals the same attribute set to `""` (React writes `disabled=""`).
- Pages that do not ship today were checked too: a second baseline built with the placeholder gate forced open (the two log entries, the HiFi renders, the Venus photos and the Venus home photo), compared the same way before and after each conversion. To repeat it, make `isPlaceholder()` return `false` locally (never commit that), build, and compare with `dist_diff.py`.
- `svg-self-close.mjs` is still needed: React, like the Astro compiler, writes `<path …></path>`. Without the hook the parity check reports every drawing.
- Kept for parity, to decide in phase 6: hrefs stay as the pages wrote them (no `<Link to>` yet: resolving from the root would turn `hifi-player.html` into `../work/hifi-player.html`); the islands keep the ids their scripts use (`fig-board`, `fig-tmds`, `fig-tmds-cap`, `ftt`); captions nothing refers to have no id on the HDMI plate and the Venus photos (`captionId={false}`) but do on the HiFi renders; figure numbers cited in prose ("Fig.&nbsp;2") are still written by hand.
- Not done from §4, moved to later: MDX for the case studies and the log (the case-study prose is in the page components for now), a separate `packages/figures` (the drawings are in `apps/web/src/figures/`), `<Band>`, `<SkipLink>` and `HatchDefs` in `Document` (each hatch is still defined by the first drawing on a page that uses it, as before), and the `/dev/kit` page.
- Turbo's local cache is shared with the repository's other worktrees, so a "cold" run needs `--force` as well as removing `.turbo/`.

Notes from phase 5:
- `packages/tmds` is the encoder as typed TypeScript (a line-for-line port of `tmds_encoder.v`, `decode()` after `tmds_decode()` in `tb_tmds_encoder.v`, plus the four control codewords), tested with `node --test`. The testbench in gonnzalofr/fpga-hdmi checks properties rather than vectors, so the tests port those properties (round trip, at most five transitions, a disparity accumulated from the ten bits sent matching `cnt_n`, the bench's bound of 12 over its stimulus phases 2–5) and its four codewords, and add hand-worked symbols for each stage-2 branch and the page's 640-pixel line within ±8. Before the old script was deleted, the port was compared with `tmds.js` on every byte from every even `cnt_r` in ±12: identical.
- The islands are in `packages/ui/src/islands/` (`TmdsEncoder`, `BoardViewer` with `board-scene.ts`), exported as `@portfolio/ui/islands/tmds-encoder` and `…/board-viewer` so an island's bundle pulls in only its own module. Only an `.astro` file can give a component a `client:*` directive, so each route renders its island into a named slot of its page component (`<TmdsEncoder slot="encoder" client:visible />`), and the page places it inside its `<Figure>` (`TmdsEncoderFigure`, `BoardFigure` in `src/figures/`), which keeps the caption and the figure number. Astro writes the slot's HTML in place, with no wrapper besides `<astro-island>` itself (`display: contents`). `Diagram` and `FigScroll` take a `captionId` for a drawing rendered apart from its `Figure`.
- `TmdsEncoder` derives everything it draws from its state, so the server markup comes from the encoder: d = 0x47 from cnt_r 0, controls disabled, "self-check: not run". The waveform paths are now written with spaces between commands (`M130 23 H238 V43 …`), as the static markup had them; `tmds.js` wrote them without. On hydration it reads the controls' values from the DOM (a restored form), as the script did. Only a slider or the checkbox writes the `<output>`; a tick of the ramp does not (checked with a MutationObserver: 0 writes while the ramp runs). The empty reasons line renders no text node, because preact rewrites an empty one on every render.
- `BoardViewer` is hydrated with `client:visible={{ rootMargin: '600px 0px' }}`, the margin `board.js` imported three.js at. `board-scene.ts` imports three.js statically and is itself imported lazily, so the HiFi page's lazy JavaScript is one chunk: 663 kB (165 kB gzip) against 831 kB (211 kB gzip) in five chunks before, because a static `import * as THREE` tree-shakes and `import('three')` did not. The figure's `data-model` and `data-label` became the island's props (`board` in `src/figures/hifi-player.tsx`).
- `Tweaks` is a React component, made a `client:only` island by `src/components/DevTweaks.astro`, which `Document.astro` imports only under `import.meta.env.DEV`: Astro bundles every `client:only` component in the files it compiles, rendered or not, so the directive cannot sit in `Document.astro` behind a condition.
- The weight decision (owner, 22 Oct 2026: preact/compat). JavaScript a page loads for its island, gzip, beside the page scripts before: HDMI 72.5 kB with React (react-dom's client is 66 kB of it), 11.6 kB with preact/compat, 1.7 kB before; HiFi 70.7 kB, 9.8 kB, 2.8 kB. Both add 4.8 kB of inline island scripts (Astro's runtime and the `visible` directive). `tools/preact-islands.mjs` resolves `react` and `react-dom` to preact/compat in the client build only; `@astrojs/preact`'s `compat` would alias the server render as well. The server HTML is the same with either runtime; the render tests run React only.
- Plain `react()` replaces `tools/react-static.mjs`. `site.js` stays a global script. `bits.js` is deleted (unused; owner, 22 Oct 2026).
- Parity: `pnpm parity` reports the 8 pages without an island identical. On the HDMI and HiFi pages Astro adds a `<style>` and two inline `<script>`s before `<main>` and the `<astro-island>` element, the page scripts go, and the bundles are new. `dist_diff.py --islands` unwraps the islands and leaves out scripts and styles: the HDMI page is then identical, and the HiFi page differs only by the two `data-*` attributes above. The checker gained a rule: a page without an island has no `<script>` but the site script.
- The islands were checked in the browser pane against the live site: one scripted sequence through the TMDS demo (rest, both sliders, the inversion and keep branches, the ramp, stop) gave identical snapshots with both runtimes; the board loads, takes keys and resets to its first view. While this session's window was hidden, IntersectionObserver did not fire, so `client:visible` was exercised by swapping in the same island with a `load` directive; the hydration path is the same.

Notes from phase 6:
- **`/dev/kit`** is `apps/web/src/dev/kit.astro`, injected as a route by `apps/web/tools/dev-routes.mjs` only when Astro runs as `dev`, so it sits outside `src/pages` and a build has no such route (a page under `src/pages/dev/` with a `getStaticPaths` guard would still be compiled into the build). It renders `Kit` from `packages/ui/src/kit/`: every example of `examples.tsx` (one per component or family, with the props a page would pass) on each of the five grounds, grouped as the components are (Chrome, Layout, Text, Figure, Work, Home), then the two hydrated islands once each (their ids are fixed). The Tweaks bar comes with `Document` as on every dev page. `kit.css` is imported by the route alone and every class in it starts with `devkit`, so the checker can fail on it; the checker also fails on a `dev/` folder in `dist/`. A test (`packages/ui/test/kit.test.tsx`) fails while a component exported by `@portfolio/ui` is in no example's `covers`, and renders every example, so the kit cannot fall behind the components. Examples that set an id the page can hold once (the hatch, the arrowhead, the footer, the header) are shown on the first ground only; figure numbers continue across the grounds, so every id is unique. `paths.ts` treats `/dev/…` like `work/` (one level down).
- **Lint**: ESLint 10.12.0 with typescript-eslint 8.71.1, eslint-plugin-astro 3.2.1 and @eslint/css 2.0.0, one tool for TypeScript, JSX, Astro and CSS, pinned to versions released at least two weeks before (eslint 10.13.0, typescript-eslint 8.71.2 and @eslint/css 2.0.1 were younger). typescript-eslint does not support TypeScript 7 (peer `<6.1`), so `tooling/eslint-config` has its own `typescript` 6.0.3, as `apps/web` has. The shared config is `tooling/eslint-config/src/index.js` (the root `eslint.config.mjs` re-exports it), the rules are in `src/rules.js`, each message says what to write instead, and `test/rules.test.js` runs 41 cases through ESLint with the real config, so the rules and the files each one applies to are both tested. `lint` is a turbo task of every package (its inputs include the root config) and a CI step before the build, and `test/dependencies.test.js` fails if any `package.json` lists an animation library (the import side is `no-restricted-imports`).
- **How the §5 table was read.** "No `grid-column` outside `ui/layout`" is enforced for TypeScript, JSX and Astro (a page or a component cannot write it) and for CSS by "all CSS is in `packages/ui/src`". Inside `packages/ui`, the component CSS files still place their own parts on the grid (`.row__no`, `.meta__cell`, `.band__text`, `.foot__h`, the breakpoints in `global/responsive.css`): 25 lines in 7 files besides `layout/`. Moving them would reorder the cascade for no gain in safety, so they stay; the placements a *page* can choose are the `Col` spans. "Hard-coded color/size values that should be tokens" is enforced as colors (hex and color functions) in TypeScript, JSX, Astro and `packages/ui` CSS, and as a bare length (`'12px'`) in code. The named exceptions: `packages/ui/src/global/print.css` (black on white whatever the ground) for colors, `motion.css` for `!important` (reduced motion has to win over any specificity), the Tweaks bar for the code rules.
- **Real violations found, fixed (no rule was loosened for them):** `LogEntry` wrote `prose-block col-full` and `fig--right` by hand and `LogIndex` wrote `col-prose` (placement classes in a page); both now go through `ui` (`EntryBody`, `Prose`) with identical markup. `Tweaks.tsx` had two empty `catch {}` blocks (now say why); being a development tool with its own white-and-black chrome, the neutral palette of the warmth slider and a `<style>` block, it is exempt from the style, type, token and grid rules by name. `Figure.tsx` writes `Fig.` and its number with a no-break space inside a template literal, which `no-irregular-whitespace` flags, so that rule skips templates for TypeScript. Two unused imports in the new kit examples.
- **Not enforced, found while writing the rules** (for the owner to decide): the name voice's sizes are literals in three places (`.band__name`, `.row h3`, `.turn a` have their own `clamp()`s instead of tokens next to `--t-name` and `--t-h2`), and SVG `text` sizes are `13px`/`14px` in `figure.css` and `project-band.css`; a rule on `font-size` in CSS would flag these, so only the font *family* is enforced there. `check_site.py`'s "svg viewBox width is not 800" warning has never fired: Python's `HTMLParser` lowercases attribute names, so `"viewBox" in attrs` is always false (the home glimpses are 400 and 406 wide, and no warning appears).
- **"Add a project"** is `docs/add-a-project.md`, walked with a scratch project. After phases 4–5 it took five files (an entry, a glimpse, a screen, a figures file, a route); now it takes three: `src/pages/work/[slug].astro` renders every project (the islands by slug), and `src/lib/cases.ts` finds each project's screen by the `slug` it exports (a project without a screen fails the build). The content tests no longer pin the number of projects, which the walk showed was the first thing to break. What does not follow from the data is listed there: the work index's `description`, the CV (`cv.projects` and the PDF) and the sentences that name projects.
- **MDX for the case studies: not done.** The case-study prose is JSX (`<Prose>`, `<Nb>`, `<Mono>`), and what it needs from React context (the figure counter, the root prefix, the placeholder gate) lives in one tree per page. An MDX file rendered through Astro's integration is its own module whose components render apart from the page's React tree, so `<Figure>` could not count the page's figures; making it work means compiling MDX to React components inside the page tree (a Vite plugin besides `@astrojs/mdx`), writing the heading ids by hand, and rewriting the prose of four screens (about 250 lines) with its entities and braces, to save the `<Prose>` wrappers. Not a clear win, and the three-file guide does not depend on it. This is reasoning about how the pieces fit, not something built and measured. The log stays Markdown for the same reason; its entries are the repository's own files, and the one `dangerouslySetInnerHTML` of the site is now `EntryBody`, with a comment on why it is safe and the only file the lint rule allows it in.
- **`svg-self-close.mjs` stays.** With the hook removed, `pnpm parity` reports 5 pages different (every drawing: `<path …></path>` against `<path …/>`), as in phase 4. The DOM is the same, so the hook could go if `dist_diff.py` learned that an empty SVG element's pair equals its self-closed form; the built HTML would then differ in bytes from the live site's, which is why it was not done here.
- **Parity.** `pnpm parity`: 10 pages, 15 other files and 8 bundled assets identical to the build of the live `main`; the same comparison with the placeholder gate forced open in both (the two log entries, the HiFi renders, the Venus photos): 12 pages identical. The `lint` task and the workflow's `lint` step are the only additions that reach CI; nothing is added to `dist/`.
- **Kept for parity, to decide** (not changed in phase 6): `TU/e` is set as `nc` on the home bands and not in the work-index rows; Venus's and Rock Your Baby's stacks differ between band and row; `.nc` changes nothing visible in "Reel" and could go entirely; hrefs are written as the pages wrote them (no `<Link to>`); the islands keep their fixed ids; captions nothing refers to have no id on the HDMI plate and the Venus photos; figure numbers cited in prose are written by hand; each hatch is defined by the first drawing on a page that uses it (no `HatchDefs` in `Document`); `<Band>` and `<SkipLink>` are still inside `ProjectBand` and `Document`; there is no `packages/figures` (the drawings are in `apps/web/src/figures/`).

## 0. Where we actually are

The site is **not** static HTML any more. It has been an Astro 7 project since 14 September 2026:

| Area | Today | Size |
|---|---|---|
| Pages | 11 `.astro` files, all hand-written markup | ~1,150 lines |
| Shell | `layouts/Base.astro` + `Nav`, `Footer`, `Tweaks` | ~180 lines |
| Styles | one `site.css` (tokens, grid, chrome, figures, home, print) + `fonts.css` | ~490 lines |
| Behavior | `site.js` (sticky head height, scroll-figure tab stops), `tmds.js` (encoder demo), `board.js` (three.js, lazy), `bits.js` (unused) | ~425 lines |
| Content | `content/log/*.md` (Zod schema), `lib/placeholder.ts` (hash gate) | 2 entries |
| Quality gate | `tools/check_site.py` on `dist/`, run in CI before deploy | 134 lines |
| Deploy | GitHub Actions → GitHub Pages, `build.format: 'preserve'` keeps `work/x.html` URLs | — |

What slows development down today:

1. **Facts are copied by hand.** Each project's name, number, ground, stack, dates, status and one-line summary appear on the home band, the work index row, the case study header, the prev/next links, the CV, and the 404. Project names alone are written out 40 times in `src/`. One wrong date means editing it in five places.
2. **No components below page level.** A figure is ~10 lines of boilerplate (`fig__scroll`, `tabindex`, `aria-labelledby`, `Fig.&nbsp;N —`, hand-numbered ids). The checklist icon SVG is pasted 10 times. The 37 curriculum courses are 37 copies of one `<li>`.
3. **The design system is documented, not enforced.** `.impeccable.md` and the README set the rules: five grounds, a fixed set of placement classes, two families, nothing in between. Nothing stops a page from breaking them; only review and the checker catch it.
4. **Relative paths are threaded by hand** (`depth={0|1|'abs'}`, `P` prefixes in three files).

## 1. The decision to make first: which React framework

"Turbo" most likely means **Turborepo** (the monorepo task runner). It does not choose a framework. React has to render into a site that **ships zero JavaScript by default and works without it** (an `.impeccable.md` rule, and part of the checker's job). There are two serious options:

| | **A. Astro + React (recommended)** | B. Next.js static export (Turbopack) |
|---|---|---|
| Components | All in React (`.tsx`), rendered to HTML at build time | All in React |
| JS shipped | **None** except the islands that need it (TMDS demo, 3D board) | React runtime + a hydration bundle on **every** page (~90 KB+) |
| Works without JS | Yes, unchanged | HTML renders, but the pages are built to hydrate |
| URLs `work/x.html` | Kept (`build.format: 'preserve'`) | Needs `trailingSlash: false` and `.html` handling; GitHub Pages serves both |
| Content collections, Markdown/MDX log | Kept | Rebuild with a custom loader |
| Migration risk | Low: same build, same `dist/`, same checker | High: new router, new head handling, new build output |
| Dev server | Vite HMR | Turbopack HMR |

**Recommendation: A.** Turborepo for the workspace, Astro as the static renderer, and React for every component. In practice you write React; Astro only turns it into HTML and loads the two islands. Option B costs a JS runtime on every page and gives this site nothing it needs (no server, no client routing, no data fetching).

The rest of this plan assumes A. Under B, the package layout (§2) and the component system (§4) stay the same, and only `apps/web` changes.

## 2. Monorepo layout

```
portfolio/
├─ apps/
│  └─ web/                         Astro + @astrojs/react + @astrojs/mdx; the only deployable
│     ├─ src/pages/                thin route files: each one renders a React page component in <Document>
│     ├─ src/content/              log/*.mdx, case/*.mdx (case-study prose)
│     ├─ public/                   assets/, fonts/, .nojekyll (unchanged)
│     └─ astro.config.mjs
├─ packages/
│  ├─ tokens/                      design tokens in TS → emits tokens.css; Ground type, contrast tests
│  ├─ ui/                          React components + their CSS (the design system)
│  ├─ content/                     typed site data: person, projects, builds, curriculum, CV (Zod-validated)
│  ├─ figures/                     every drawn SVG figure as a React component, grouped by project
│  └─ tmds/                        pure TMDS encode/decode (port of tmds_encoder.v) + unit tests
├─ tooling/
│  ├─ check-site/                  check_site.py (unchanged) + dist-diff (parity tool, §6)
│  ├─ tsconfig/                    shared strict tsconfig bases
│  └─ eslint-config/               shared lint rules, including the design-system rules in §5
├─ turbo.json
├─ pnpm-workspace.yaml
└─ docs/                           this plan, then the architecture notes and the "add a project" guide
```

Dependency direction is one way: `tokens ← ui ← figures ← apps/web`, `content → apps/web`, `tmds → ui` (the island). `ui` never imports `content`. Components take props, and pages pass data in. That keeps every component reusable and testable on its own.

Turbo tasks:

| Task | Depends on | Does |
|---|---|---|
| `build` | `^build` | tokens → CSS, then the Astro build to `apps/web/dist` |
| `check` | `build` | `check_site.py dist` (the CI gate, unchanged) |
| `test` | `^build` | Vitest: tmds vectors, token contrast, content schema, component render snapshots |
| `typecheck`, `lint` | — | `tsc --noEmit`, ESLint |
| `dev` | — | Astro dev server (persistent) |

The package manager would be **pnpm**, because its strict workspaces stop a package from quietly using a dependency it doesn't declare. npm workspaces also work if you'd rather not switch.

## 3. Design system: tokens as code

`packages/tokens/src/tokens.ts` becomes the single source for what `:root` in `site.css` holds today:

```ts
export const grounds = {
  black:  { g: '#120E0B', ink: 'light' },
  paper:  { g: '#F3EEE4', ink: 'dark'  },
  sand:   { g: '#E7DBC3', ink: 'dark'  },
  walnut: { g: '#241B15', ink: 'light' },
  dusk:   { g: '#E8D2AE', ink: 'dark'  },
} as const;
export type Ground = keyof typeof grounds;          // used by every component that takes a ground
export const inks = { light: { ink: '#F4ECDF', dim: '#B3A796' }, dark: { ink: '#1C150F', dim: '#5E5244' } };
export const type = { name: …, h2: …, lead: …, body: …, small: …, mono: …, monoS: … };   // the clamp() scale
export const space = { s1: .5, s2: 1, s3: 1.5, s4: 2.5, s5: 4, s6: 6.5, s7: 10 };       // rem, × --k-space
export const fonts = { sans: 'Anybody', mono: 'Azeret Mono' };
```

- A build step writes `tokens.css` (the custom properties and the `[data-ground]` rules), so the CSS and the TypeScript can't drift apart.
- `Base.astro`'s hard-coded `theme-color` map and the Tweaks bar's palette both read from it.
- **A test checks the contrast of every ink on every ground** against the AA thresholds (the generated `tokens.css` header shows the measured values), so a palette change that breaks AA fails `pnpm test`.

**CSS stays plain CSS**, not Tailwind or CSS-in-JS. The class names *are* the system: print rules, `:has()` selectors across components, and the checker all depend on them. Utility classes would also turn "big or small, nothing in between" into "any size you like". `site.css` is split into one file per component (in `packages/ui/src/<group>/`, where each `.tsx` will sit beside its CSS in phase 4), imported by `packages/ui/src/styles.css` **in the original cascade order**.

*Changed in phase 2:* the first draft put the files in cascade layers (`@layer tokens, base, …`). That was dropped, because layer order beats specificity: a later layer's single-class rule would override an earlier layer's more specific one, which changes rendering. Instead the split is contiguous, with no rule moved relative to another. Breakpoints, motion and print stay as their own files at the end, as they were. The diff tool (§6) compares stylesheets rule by rule, in order, so it proves this.

## 4. Component inventory

Every component below already exists as a CSS pattern in `site.css`. This step names it, types its props and removes the copies. Props use the tokens' types, so a component can only be given values the system allows.

### 4.1 Document and chrome — `packages/ui/chrome`

| Component | Replaces | Props / notes |
|---|---|---|
| `<Document>` (Astro shell) | `Base.astro` | `title, description, ground, og?, noindex?, current`. The only `.astro` file left besides routes. It renders `<head>`, `SkipLink`, `SiteHeader`, `Footer`, `HatchDefs`. |
| `<SiteHeader>` / `<Nav>` | `.head`, `Nav.astro` | `current: 'home' \| 'work' \| 'notes' \| 'log' \| 'cv'`, `entry?`. Works out `aria-current` itself. |
| `<Footer>` | `Footer.astro` | Reads `person` from props. The internship line still appears exactly once per page. |
| `<SkipLink>` | `.skip` | — |
| `<Link to>` | the `P` / `depth` prefixes | `to="work/hifi-player"` → a correct relative `.html` href from any page, via a `PageContext` that knows the current path. The 404 uses absolute URLs. This removes `depth` from every page. |
| `<Tweaks>` | `Tweaks.astro` | React island, `client:only`, dev builds only. Reads its ranges and palettes from `tokens`. |

### 4.2 Layout — `packages/ui/layout`

| Component | Replaces | Notes |
|---|---|---|
| `<Page as="section">` | `.page` (34 uses) | The 12-column grid. |
| `<Col span>` | `.col-full/head/prose/margin/a/b` | `span: 'full' \| 'head' \| 'prose' \| 'margin' \| 'a' \| 'b'`. **This type is the only way to place anything on the grid.** It enforces the README's "don't set `grid-column` anywhere else" rule. |
| `<ProseBlock>` | `.prose-block` | A subgrid wrapper for case-study bodies. |
| `<PageHeader kicker title deck>` | `.cs` + kicker + h1 + deck (10 pages) | `children` hold the lead figure and the `MetaRow`. |
| `<Section id reading title>` | `.sec` + `hr.sec__rule` + `.sec__reading` + `h2.col-head` (9×) | One line instead of four. |
| `<Band ground>` | `.band` | A full-width strip on its own ground. Home uses it now, and future pages can reuse it. |

### 4.3 Text and data primitives — `packages/ui/text`

| Component | Replaces | Notes |
|---|---|---|
| `<Kicker>`, `<Deck>`, `<H2 id>`, `<Wide>` | `.kicker`, `.deck`, `h2.col-head`, `.wide` | The two voices: wide (Anybody 800/150) and quiet. There is no third size, so these take no size prop. |
| `<Mono>`, `<Nb>`, `<Nc>`, `<Vh>` | `.mono` (41), `.nb` (110), `.nc`, `.vh` (34) | Inline helpers. `Nb` keeps quantities on one line. |
| `<Status value>` | `.status` | `'in progress' \| 'complete' \| …`: always words, with the open square, never color. |
| `<MetaRow items>` | `dl.meta` (6×: case studies, notes, CV, footer) | `items: {label, value}[]`, at most 4 cells. The grid placement is built in. |
| `<FactList items>` | `.intro__facts` and `.spec` | One component, used for both. |
| `<PullQuote kicker>`, `<MarginNote>` | `.pull`, `.note` | — |
| `<Checklist items>` | `ul.check` + 10 pasted `chk` SVGs | `items: {state: 'done' \| 'in progress', text}[]`. Draws the box or the tick. |
| `<EntryList>` | `.nlist` (work builds, log index) | `items: {id, kicker, title, href?, body}[]`. |
| `<LinkList>` | `.more` (404) | — |
| `<Timeline>` | `.rec` / `.rec__entry` (CV, 10 entries) | `items: {date, role, org}[]`. |
| `<KeyValueRows>` | `.kit` / `.kit__row` (CV) | — |

### 4.4 Figures — `packages/ui/figure` and `packages/figures`

| Component | Replaces | Notes |
|---|---|---|
| `<Figure no placement scroll caption>` | `.fig` boilerplate (18 figures) | Builds `id="fig-N"`, `fig__scroll` with the right `role`/`aria-labelledby`, and the `Fig.&nbsp;N —` caption prefix. **Numbering comes from a per-page counter context**, so inserting a figure renumbers the rest. `placement: 'right' \| 'bleed'`. |
| `<Diagram viewBox title>` | the inline `<svg role="img" aria-labelledby><title>` wrapper | Generates the title id. Children are the drawing. |
| `<Arrow>` marker, `<HatchDefs>` | `<marker id="arr">`, `<pattern id="hatch">` repeated per SVG | The CSS uses `url(#hatch)`, so the hatch must be defined **once per page** (the checker bans duplicate ids). `Document` renders it once in a hidden SVG. |
| `<Photo src alt>` | `img.fig__img` + `isPlaceholder()` checks in pages | **Renders nothing while the file is a placeholder.** The gate moves into the component, so pages stop calling `isPlaceholder` themselves. |
| `<Envelope>`, `<ScaleBar>` | the XSIM frame in its 800×525 envelope, the timing scale | Used on home and the HDMI page. |
| `packages/figures/<project>/Fig*.tsx` | the ~600 lines of hand-drawn SVG inside pages | One component per drawing, so prose files stay readable. Values stay literal: the drawings come from real numbers and aren't generated. |

### 4.5 Domain components — `packages/ui/work`

These are fed from `packages/content`. Each project is described **once**:

```ts
// packages/content/src/projects.ts
{ slug: 'hifi-player', no: '03', ground: 'paper',
  name: 'Battery-powered HiFi player', shortName: 'HiFi player',
  line: 'A battery-powered music player: …', stack: ['PCB layout', 'C', 'ESP32-S3R8'],
  dates: { from: '2026-05', to: '2026-10' }, status: 'design only',
  notice: 'A design study, stopped before any board was built or bench-tested.', cv: { … }, glimpse: 'board' }
```

| Component | Built from | Replaces |
|---|---|---|
| `<ProjectBand project>` | `projects[]` | the four home bands |
| `<ProjectRow project>` | `projects[]` | the four work-index rows |
| `<CaseHeader project>` | `projects[]` | kicker, h1, deck and `MetaRow` on each case study |
| `<Turn project>` | the order of `projects[]` | prev/next on case studies, so it can no longer cycle wrongly |
| `<BuildList builds>` | `builds[]` | home builds line and the work-index "Smaller builds" section |
| `<Curriculum years>` | `curriculum[]` | 37 hand-written course rows on Notes |
| `<TeamBand team>` | `team` | the Daedalus band (with `FactList`) |

Dates are stored as data (`'2026-05'`) and formatted in one place (today's `dates.ts`), so "May 2026 – present" can't be spelled two ways.

### 4.6 Islands: the only client-side JavaScript

| Island | Hydration | Notes |
|---|---|---|
| `<TmdsEncoder>` | `client:visible`, HDMI page | SSR renders the static figure (as today without JS). `encode`/`decode` move to `packages/tmds` with **unit tests against vectors from `tb_tmds_encoder.v`**, and the in-page self-check stays. Only the `<output>` changes per update. The no-`aria-live` rule stays. |
| `<BoardViewer>` | `client:visible`, HiFi page | Same lazy three.js import. The poster `<img>` stays SSR, and the canvas is added on load. |
| `<Tweaks>` | `client:only`, dev only | — |
| head height, scroll-figure tab stops | stays a tiny inline script (`site.js`) | Global, not tied to a component. React would cost more than it saves here. |

Cost to watch: the React runtime adds ~45 KB gzip, **only** on the HDMI and HiFi pages. If that matters, aliasing `react` to `preact/compat` for islands cuts it to ~4 KB with the same component code. We'd measure that in phase 5 before deciding. *Measured in phase 5:* React's client is 66 kB gzip (about 71 kB per island page in all), preact/compat about 10 kB per page in all; the islands use preact/compat (see the phase 5 notes).

### 4.7 Authoring

- **Case studies become MDX** in `apps/web/src/content/case/`. The prose stays prose, and figures, pull quotes and checklists become components (`<Figure><HdmiFig2 /></Figure>`, `<PullQuote kicker="constraint">…`). The route file reads `projects` for the header and `Turn`, and the MDX for the body.
- **Log entries move from `.md` with raw `<figure>` HTML to `.mdx`** with `<Figure>`/`<Photo>`. The placeholder gate then works on components rather than a regex over the body.
- Home, Work, Notes, CV and 404 are **React page components fed by `content`**, with no prose copies.

## 5. Keeping the UI systematic: enforcement

| Rule (from `.impeccable.md` / README) | Enforced by |
|---|---|
| Five grounds, each ink checked for AA | `Ground` type; contrast test in `tokens` |
| Placement only through the fixed classes | `Col span` type; lint rule: no `style`, no `grid-column` outside `ui/layout` |
| Two families; big or small, nothing in between | Text components take no size/font props; lint bans `font-family`/`font-size` outside `ui` CSS |
| Status in words, never color | `Status` takes a string union, not a color |
| Figure captions "Fig. N —", numbered in order | `Figure` + counter context |
| Placeholder images never ship | `Photo` gate + the existing checker error |
| Nothing moves on its own; reduced motion | No animation library (lint: none in deps); motion only via `--k-motion` transitions in CSS |
| American spelling, no hype, one h1, alt text, no phone numbers | `check_site.py` (unchanged, still the CI gate) |

Plus a **dev-only `/dev/kit` page** that renders every component on every ground. It's the living style guide, and it replaces Storybook at no extra cost. The Tweaks bar works there too. *Built in phase 6; how each row is enforced, and where the rules stop, is in the phase 6 notes.*

## 6. Migration in phases: parity first

Each phase ends with a **byte-for-byte (normalized DOM) match against the current site**, until phase 6, where new content is allowed. The tool for this, `tooling/check-site/dist-diff`, parses both `dist/` trees and compares element trees, attributes and text, ignoring attribute order, whitespace and Astro asset hashes. The parity diff is what makes a large refactor like this safe.

| Phase | Work | Done when |
|---|---|---|
| **0. Baseline** ✓ | Build today's site and store `dist/` as `golden/` (gitignored). Write `dist-diff`. | `dist-diff golden dist` passes on an unchanged build. |
| **1. Monorepo shell** ✓ | pnpm + Turborepo; move the Astro app to `apps/web` unchanged; update CI (`pnpm check` = turbo build → check). | Zero diff; deploy workflow green. |
| **2. Tokens + CSS split** ✓ | Shared `tooling/tsconfig`; `packages/tokens`, generated `tokens.css`, contrast test; split `site.css` into per-component files in cascade order (no layers, see §3). | Zero diff on HTML; computed styles unchanged (spot-check every page on every breakpoint in the browser pane). |
| **3. Content package** ✓ | Extract `person`, `projects`, `builds`, `curriculum`, `cv` with Zod; the existing `.astro` pages read from it. | Zero diff. Project names appear once in `src/`. |
| **4. React components** ✓ | Add `@astrojs/react` + MDX (MDX moved to later, see the phase 4 notes). Build the `ui` primitives (§4.1–4.4) with render tests. Convert pages one at a time, simplest first: 404 → log → work index → CV → notes → home → case studies (MDX + `figures`). | Zero diff after each page (the diff tool lists any differences that are accepted on purpose, such as SVG self-closing). |
| **5. Islands** ✓ | `packages/tmds` + tests; `TmdsEncoder`, `BoardViewer`, `Tweaks` as React islands. Measure JS weight; decide React vs. `preact/compat` for islands (preact/compat). Delete `bits.js`. | Demo and board behave as before with and without JS; the checker passes; no new JS on other pages. |
| **6. System polish** ✓ | `/dev/kit`, the lint rules from §5, an "add a project" guide (one `projects.ts` entry + one MDX file + figures), README update. Delete `svg-self-close.mjs` if the diff shows it is no longer needed. | A new project is ~2 files; `turbo run lint typecheck test build check` green. As built: 3 files, see the phase 6 notes. |

Phases 1–3 are useful on their own and change nothing visible. If the React part stalls, the site is still better off than before.

## 7. Risks and how each is handled

| Risk | Handling |
|---|---|
| JSX changes SVG markup (`stroke-dasharray` → `strokeDasharray`, `class` → `className`, `&nbsp;`) | Convert the figures with a script (svgr-style transform), then let `dist-diff` show any difference. |
| Duplicate ids from `useId` breaking `url(#hatch)` and `#arr` | Fixed ids for page-wide defs (`HatchDefs` once per page); `useId` only for title/caption ids, and the checker's duplicate-id check stays. |
| Relative links breaking at depth / on the 404 | `<Link>` + `PageContext`, and the checker's broken-link pass runs on every build. |
| JS creeping onto every page | Islands only by explicit `client:*`; the CI checker gains a rule: no `<script>` on pages without an island. |
| `cssMinify: false`, `assetsInlineLimit: 0`, `build.format: 'preserve'` quirks | These carry over unchanged in `apps/web/astro.config.mjs`. They're documented there for a reason. |
| Repo must stay at `gonnzalofr.github.io` root (no `base`) | Unchanged. The workflow only gains `pnpm` + `turbo`, and the Pages upload path becomes `apps/web/dist`. |
| Share card and CV PDF are generated by hand | Out of scope here; later they could become turbo tasks (`render:share-card`, `render:cv-pdf`) using headless Edge, as in the README. |

## 8. What I need from you

1. **Framework**: confirm Astro + React in Turborepo (A), or tell me you specifically want Next.js (B).
2. **Package manager**: pnpm (recommended) or stay on npm.
3. **Go-ahead for phases 0–1** on this branch. They change no output, and the parity tool is built first so every later step can be checked.
