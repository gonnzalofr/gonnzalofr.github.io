# Add a project

A new case study is **three files**, and one more for its drawings if it has any:

| File | What goes in it |
|---|---|
| `packages/content/src/projects.ts` | the project's facts and the short copy each place shows (an entry at the end of the list) |
| `apps/web/src/figures/glimpses.tsx` | the evidence on its home band (a function and one line in the `glimpses` map) |
| `apps/web/src/screens/work/<Name>.tsx` | the case study itself: its prose and its figures |
| `apps/web/src/figures/<project>.tsx` | optional: the drawings, if the screen would otherwise get long |

There is no route to add: `src/pages/work/[slug].astro` renders every project in `projects.ts` with the screen that exports its slug (`src/lib/cases.ts` finds them). The home band, the work-index row, the 404's link, the prev/next links of every case study (the cycle wraps, so the first and the last project both change) and every count ("5 case studies · …") follow from the data. A project in `projects.ts` without a glimpse or without a screen fails the build, with a message that names the missing file.

This guide was walked on 25 October 2026 with a scratch project, a fifth entry, a glimpse and a one-section screen: `pnpm turbo run lint typecheck test check` passed, the project showed on home, on the work index, on the 404, in the prev/next links of the first and last case studies and in every count, and `pnpm dev` served `/work/<slug>.html` without a restart. The scratch project was then removed.

Before you start, the rules that decide what may be written (`.impeccable.md`, the README, `packages/content/src/projects.ts`):

- Facts come only from the dossier and the source. If a number is not in the source, the page does not show it, and status is stated plainly ("in progress", "design only", "nothing assembled yet").
- American spelling, no hype words, no phone numbers anywhere. The checker fails the build on a phone number and warns on British spelling and hype words.
- Placeholder images never ship; see "Photographs" below.

## 1. The facts: `packages/content/src/projects.ts`

Add an entry **at the end** of the array. Projects are numbered in order (`no: '05'` is the fifth; a test checks the numbers run `01…`), and the entry's place is its place in every list and in the prev/next cycle.

```ts
{
  slug: 'scratch-bench',          // the page is work/scratch-bench.html; lower case, digits, hyphens
  anchor: 'scratch',              // the id of its row on the work index (work/index.html#scratch)
  no: '05',
  ground: 'dusk',                 // black · paper · sand · walnut · dusk: its ink and its quieter ink follow
  name: 'Scratch bench supply',   // case-study title, work index, 404
  shortName: 'Scratch supply',    // home band, prev/next links
  description: '…',               // the case study's <meta name="description">
  dates: { from: '2026-10' },     // '2026-10', '2026', or { from, to: 'present' }; printed by when() in three styles
  status: 'in progress',          // 'in progress' · 'complete' · 'design only': words, never colors
  course: '5EID0',                // only for a TU/e course project
  band:    { line: '…', stack: 'C · KiCad' },                    // home
  row:     { deck: '…', notice: '…', stack: 'C · KiCad' },       // work index
  case:    { context: 'Personal project', deck: '…', role: '…', stack: '…', board: '…', statusNote: '…' },  // case-study header
  notFound: { stack: 'C · KiCad' },                               // the 404's list
  cv:      { role: '…', text: '…' },                              // the CV (see "Not everything follows" below)
}
```

Each place keeps its own copy because the summaries differ on purpose (the HDMI stack is "Verilog · XSIM · PYNQ-Z2" on its band and "Verilog · XSIM · Vivado" in its header). The copy is *inline*: text with only the marks `nb`, `nc`, `mono`, `status`, `vh`, `aria-hidden` spans, links and `<br>`; the schema rejects anything else. A link inside the site is written from the root as `~/notes.html#daedalus`.

Tests that pin numbers (`packages/content/test/views.test.ts`) take them from the data, so a new project does not mean editing them.

## 2. The glimpse: `apps/web/src/figures/glimpses.tsx`

The evidence beside the project on home. Decorative (the band's text says what the project is), so it is hidden from screen readers. Write a function that returns a `<Glimpse>` and register it under the slug:

```tsx
function ScratchGlimpse() {
  return (
    <Glimpse kind="draw">
      <svg viewBox="0 0 400 290">…</svg>
    </Glimpse>
  );
}

export const glimpses: Record<string, () => ReactNode> = {
  'scratch-bench': ScratchGlimpse,
  …
};
```

`kind` is `env` (the XSIM frame in its envelope), `board` (a still of the 3D board), `draw` (a to-scale drawing, in the page's ink) or `photo`. `VenusGlimpse` shows how to prefer a photograph once it is real (`usePublished`) and fall back to a drawing until then.

## 3. The case study: `apps/web/src/screens/work/<Name>.tsx`

```tsx
// Scratch bench supply: one line about what the page is.
import { H2, Page, Prose, ProseBlock } from '@portfolio/ui';
import { project } from '@portfolio/content';
import { screen } from '../screen';
import { ProjectHeader, ProjectTurn } from './case';

const p = project('scratch-bench');
export const slug = p.slug;                       // how lib/cases.ts finds the page

function ScratchBench() {
  return (
    <main id="main">
      <ProjectHeader project={p}>{/* the lead figure goes here: <LineTiming /> */}</ProjectHeader>
      <Page>
        <ProseBlock>
          <H2 id="what">What it is</H2>
          <Prose>…</Prose>
        </ProseBlock>
        <ProjectTurn project={p} />
      </Page>
    </main>
  );
}

export default screen(ScratchBench);
```

- `ProjectHeader` writes the kicker, the one `h1`, the deck and the four metadata cells from the entry in step 1. `ProjectTurn` writes the prev/next links.
- The prose is `<H2 id>`, `<Prose>`, `<PullQuote kicker="…">` and `<MarginNote>` inside a `<ProseBlock>`, with `<Nb>` around quantities (`<Nb>25.175 MHz</Nb>` stays on one line) and `<Mono>` around identifiers (hex, signal names, code). Placement is only ever through these components (`<Col span>`): the lint fails on a class like `col-prose` written in a page, and on `style`, `grid-column`, `font-size` and hard-coded colors.
- `<Checklist items>` for what is done and what is not, `<MarginNote>` for the number beside a paragraph.
- Figure numbers (`Fig. 1`, `Fig. 2`) follow the order the figures render, so inserting a figure renumbers the rest; a number cited in the prose is written by hand (`Fig.&nbsp;2` in JSX text), so check those when figures move.

Look at `RockYourBaby.tsx` (prose and one figure, the simplest) and `HdmiDviTransmitter.tsx` (the most figures, plus an island) for the shape of a finished page.

### Drawings: `apps/web/src/figures/<project>.tsx`

Each drawing is a component, so the screen stays readable:

```tsx
export function Subsystems() {
  return (
    <Figure placement="bleed" caption="Four PYNQ-Z2 boards, one subsystem each, talking over UART.">
      <Diagram viewBox="0 0 800 260" fit="start" title="A description for screen readers.">
        <defs><ArrowMarker /></defs>
        <rect className="crisp" x="0" y="20" width="230" height="40" />
        <text className="t-ink" x="12" y="45">heartbeat</text>
      </Diagram>
    </Figure>
  );
}
```

- The viewBox is 800 wide by convention (the home glimpses are the exception), coordinates are literal and come from real numbers, never generated, and the drawing is in the page's ink: SVG classes `t-ink`, `s-axis`, `s-rule`, `crisp`, `geo`, `f-hatch` are in `packages/ui/src/figure/figure.css`.
- `url(#arr)` and `url(#hatch)` are ids that must exist once per page: put `<ArrowMarker />` or `<Hatch stroke=… />` in the `<defs>` of the **first** drawing on the page that uses them, and nowhere else (the checker fails on duplicate ids).
- `placement` is `right` or `bleed`; a figure's id and its caption's id are made for you (`fig-3`, `fig-3-cap`).

### Photographs

Save the file in `apps/web/public/assets/work/` and use `<PhotoFigure placement="right" src="../assets/work/x.jpg" width height alt caption />` (paths are relative to the page, one level down). A figure whose file is still one of the five labeled placeholders renders nothing and takes no number, and the checker fails the build if a placeholder reaches a page. Alt text is required; describe what is in the photograph.

### An island

Only the TMDS demo and the 3D board run in the browser. A third would be a React component in `packages/ui/src/islands/` that the route hydrates with a `client:*` directive: add a named slot to the screen (see `encoder` and `board` in `HdmiDviTransmitter.tsx` and `HifiPlayer.tsx`) and a line for it in `src/pages/work/[slug].astro`, which today renders the two existing islands for their slugs. Think twice: every island costs JavaScript on a site that ships none otherwise.

## 4. What does not follow from the data

Check these by hand when a project is added:

- **The work index's description.** `src/pages/work/index.astro` lists the projects in its `description` ("a DVI transmitter in Verilog, a HiFi player, an autonomous rover, a four-board cradle and five smaller builds"). It is prose, and it is what a search result shows.
- **The CV.** A project is on the one-page CV only if its slug is in `cv.projects` in `packages/content/src/cv.ts`, with its `cv` copy from step 1. Then re-print the PDF (`public/assets/Gonzalo-Ferrero-Martin-CV.pdf`) from `/cv.html`: the page is the source.
- **Prose that names projects.** The home introduction (`src/screens/Home.tsx`) and the Notes page mention projects by name in sentences; a new project is not added to them.

## 5. Check it

```bash
pnpm dev                                   # http://localhost:4321/work/<slug>.html, home, work index
pnpm turbo run lint typecheck test check   # what CI runs
pnpm parity                                # after a change that should not alter the other pages: lists what differs
```

`pnpm parity` compares the build with the saved golden one (`pnpm golden` saves it): after adding a project it reports exactly the pages that gained it (home, the work index, the 404, the first and last case studies) and any other difference is a mistake. Refresh the golden build once the change is what you meant.

`/dev/kit` (under `pnpm dev`) shows every component on every ground, for choosing what to write the page with.

## What could be fewer files

The three are the least this design can do without hiding something. The next reductions, if the owner wants them:

- **Case-study prose as MDX** would turn `<Prose>…</Prose>` wrappers into blank-line paragraphs, but not the file count, and it was not done in phase 6 (see the notes in `migration-plan.md`).
- **The glimpse beside the screen.** `lib/cases.ts` could also read a `Glimpse` export from the screen, which removes `glimpses.tsx` from the list. It means moving the four existing glimpses into their screens.
- **The work index's description** could be written from the data if it is allowed to change to a count-based sentence.
