# Migration plan: Turborepo + React

Status, 21 October 2026: **phases 0–2 done** (the parity tool; the pnpm + Turborepo workspace; tokens and the CSS split), each with the built site identical to the one before it. Decided: option A (Astro + React), pnpm.

Notes from phase 1:
- The toolchain (Astro 7.3.2, Vite 8.3.0, rolldown 1.2.8, lightningcss, postcss, the Astro compiler) is pinned in `pnpm-workspace.yaml` to the versions the npm lockfile had. A fresh resolve picked rolldown 1.2.14, whose minifier changes the three.js chunks by 149 bytes. Bumping them is its own commit, followed by `pnpm golden`.
- esbuild's install script is denied explicitly (`allowBuilds`); pnpm 12 otherwise fails a frozen install in CI.
- The shared `tooling/tsconfig` moves to phase 2, where the first package that needs it appears.

Notes from phase 2:
- Tests use Node's built-in runner (`node --test`), and the tokens build runs TypeScript directly through Node's type stripping, so the tokens package needs no build tool. Vitest arrives in phase 4 with the React render tests. TypeScript is 7.0.2 (the native compiler).
- `apps/web` is not typechecked yet: `@astrojs/check` comes with the React work in phase 4.
- `pnpm dev` builds the tokens first (turbo `dev` depends on `^build`). A change to `tokens.ts` while the dev server runs needs `pnpm --filter @portfolio/tokens build`.

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

Cost to watch: the React runtime adds ~45 KB gzip, **only** on the HDMI and HiFi pages. If that matters, aliasing `react` to `preact/compat` for islands cuts it to ~4 KB with the same component code. We'd measure that in phase 5 before deciding.

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

Plus a **dev-only `/dev/kit` page** that renders every component on every ground. It's the living style guide, and it replaces Storybook at no extra cost. The Tweaks bar works there too.

## 6. Migration in phases: parity first

Each phase ends with a **byte-for-byte (normalized DOM) match against the current site**, until phase 6, where new content is allowed. The tool for this, `tooling/check-site/dist-diff`, parses both `dist/` trees and compares element trees, attributes and text, ignoring attribute order, whitespace and Astro asset hashes. The parity diff is what makes a large refactor like this safe.

| Phase | Work | Done when |
|---|---|---|
| **0. Baseline** ✓ | Build today's site and store `dist/` as `golden/` (gitignored). Write `dist-diff`. | `dist-diff golden dist` passes on an unchanged build. |
| **1. Monorepo shell** ✓ | pnpm + Turborepo; move the Astro app to `apps/web` unchanged; update CI (`pnpm check` = turbo build → check). | Zero diff; deploy workflow green. |
| **2. Tokens + CSS split** ✓ | Shared `tooling/tsconfig`; `packages/tokens`, generated `tokens.css`, contrast test; split `site.css` into per-component files in cascade order (no layers, see §3). | Zero diff on HTML; computed styles unchanged (spot-check every page on every breakpoint in the browser pane). |
| **3. Content package** | Extract `person`, `projects`, `builds`, `curriculum`, `cv` with Zod; the existing `.astro` pages read from it. | Zero diff. Project names appear once in `src/`. |
| **4. React components** | Add `@astrojs/react` + MDX. Build the `ui` primitives (§4.1–4.4) with render tests. Convert pages one at a time, simplest first: 404 → log → work index → CV → notes → home → case studies (MDX + `figures`). | Zero diff after each page (the diff tool lists any differences that are accepted on purpose, such as SVG self-closing). |
| **5. Islands** | `packages/tmds` + tests; `TmdsEncoder`, `BoardViewer`, `Tweaks` as React islands. Measure JS weight; decide React vs. `preact/compat` for islands. | Demo and board behave as before with and without JS; the checker passes; no new JS on other pages. |
| **6. System polish** | `/dev/kit`, the lint rules from §5, an "add a project" guide (one `projects.ts` entry + one MDX file + figures), README update. Delete `bits.js` (unused) and `svg-self-close.mjs` if the diff shows they're no longer needed. | A new project is ~2 files; `turbo run lint typecheck test build check` green. |

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
