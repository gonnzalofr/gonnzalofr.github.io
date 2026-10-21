// The design tokens of "Reel" (design context: .impeccable.md). This file is the single source: tokens.css is generated
// from it (src/css.ts), the page shell reads the grounds for <meta name="theme-color">, and the contrast test checks every
// ink on every ground it is set on. Values are CSS text, written exactly as the stylesheet uses them.

/** The two inks: warm white on the dark grounds, brown-black on the light ones, each with a quieter "dim" ink. */
export const inks = {
  light: { ink: '#F4ECDF', dim: '#B3A796' },
  dark: { ink: '#1C150F', dim: '#5E5244' },
} as const;
export type InkName = keyof typeof inks;

/** One ground per project (E2, warm; owner, 27 Sep 2026). Pages that are not one project use paper, Notes uses dusk,
 *  the 404 uses black. The order is the order of the custom properties in tokens.css. */
export const grounds = {
  black: { g: '#120E0B', ink: 'light', use: 'HDMI / DVI transmitter, the 404' },
  paper: { g: '#F3EEE4', ink: 'dark', use: 'HiFi player, the index pages, the CV, the log' },
  sand: { g: '#E7DBC3', ink: 'dark', use: 'Venus rover' },
  walnut: { g: '#241B15', ink: 'light', use: 'Rock Your Baby' },
  dusk: { g: '#E8D2AE', ink: 'dark', use: 'Student Team Daedalus, Notes' },
} as const satisfies Record<string, { g: string; ink: InkName; use: string }>;
export type Ground = keyof typeof grounds;
export const groundNames = Object.keys(grounds) as Ground[];

/** The ground :root starts on, before a page or band sets data-ground. */
export const defaultGround: Ground = 'paper';

/** Two families, nothing else. Both are self-hosted latin subsets (fonts.css). */
export const fonts = {
  sans: '"Anybody", "Segoe UI", system-ui, sans-serif',
  mono: '"Azeret Mono", "Cascadia Mono", Consolas, "SF Mono", Menlo, monospace',
} as const;

/** Multipliers the dev-only tweaks bar adjusts; 1 everywhere in a build. */
export const knobs = {
  'k-name': '1',
  'k-text': '1',
  'k-space': '1',
  'name-wdth': '150',
  'name-wght': '800',
} as const;

/** The type scale: huge wide names, then small. There is no third size for decoration. */
export const type = {
  // the second term only binds on screens narrower than about 380px: the longest word in a name ("transmitter", about
  // 10.5em at width 150) has to fit inside the 16px page padding on a 320px screen (WCAG 1.4.10 reflow)
  name: 'calc(min(clamp(1.9rem, 6.1vw + .2rem, 6.25rem), (100vw - 2rem) / 11) * var(--k-name))',
  h2: 'calc(clamp(1.6rem, 2.9vw, 2.75rem) * var(--k-name))',
  lead: 'calc(clamp(1.1875rem, 1rem + .75vw, 1.625rem) * var(--k-text))',
  body: 'calc(clamp(1.0625rem, 1rem + .2vw, 1.1875rem) * var(--k-text))',
  small: 'calc(.9375rem * var(--k-text))',
  mono: 'calc(.8125rem * var(--k-text))', // 13px: spec lines, captions, labels
  'mono-s': 'calc(.75rem * var(--k-text))', // 12px: the smallest text on the site
} as const;

/** Page padding and the column gutter of the 12-column grid. */
export const layout = {
  pad: 'clamp(1rem, 1.4vw + .25rem, 1.75rem)',
  gut: 'clamp(1rem, 2vw, 2rem)',
} as const;

/** The spacing steps, in rem before the density multiplier. */
export const space = { s1: '.5rem', s2: '1rem', s3: '1.5rem', s4: '2.5rem', s5: '4rem', s6: '6.5rem', s7: '10rem' } as const;

/** Motion: one easing curve; --k-motion scales every duration (0 under the tweaks bar's "motion" slider = instant). */
export const motion = { ease: 'cubic-bezier(.2, .7, .2, 1)', 'k-motion': '1' } as const;

/** Decorative hairlines only: the ink mixed into the ground. Never carries meaning (the dim ink does that). */
export const hairline = 'color-mix(in srgb, var(--ink) 22%, var(--g))';
