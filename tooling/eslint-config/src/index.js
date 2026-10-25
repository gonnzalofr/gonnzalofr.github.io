// The workspace's lint configuration: ESLint's recommended rules for JavaScript, TypeScript and Astro, and the design
// system's rules (docs/migration-plan.md, section 5) with the files each applies to. The root eslint.config.mjs
// re-exports it, so every package's `eslint .` reads the same rules.
import css from '@eslint/css';
import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { imports } from './animation.js';
import { cssRules, rules } from './rules.js';

const portfolio = { rules: { ...rules, ...cssRules } };

// where a component can be written: the site's source and the design system's
const source = ['apps/web/src/**/*.{ts,tsx,astro}', 'packages/ui/src/**/*.{ts,tsx}'];
const tests = ['**/test/**', '**/*.test.*'];

export default defineConfig([
  globalIgnores(['**/dist/**', '**/.astro/**', '**/node_modules/**', '**/.turbo/**', '.golden/**', '.claude/**', 'apps/web/public/**']),

  { files: ['**/*.{js,mjs,ts,tsx,astro}'], languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  { files: ['**/*.{js,mjs}'], extends: [js.configs.recommended] },
  { files: ['**/*.{ts,tsx}'], extends: [js.configs.recommended, tseslint.configs.recommended] },
  // a no-break space inside a template literal is deliberate (the "Fig. N" caption prefix)
  { files: ['**/*.{ts,tsx}'], rules: { 'no-irregular-whitespace': ['error', { skipTemplates: true }] } },
  { files: ['**/*.astro'], extends: [astro.configs.recommended] },

  // ---- the design system's rules, in the files they apply to
  {
    files: source,
    ignores: tests,
    plugins: { portfolio },
    rules: {
      'portfolio/no-inline-style': 'error',
      'portfolio/no-type-settings': 'error',
      'portfolio/no-token-literals': 'error',
      'portfolio/no-danger': 'error',
      'no-restricted-imports': ['error', imports],
    },
  },
  // placement: <Col span> and the components built on it, never a class a page writes
  { files: ['apps/web/src/**/*.{ts,tsx,astro}'], plugins: { portfolio }, rules: { 'portfolio/no-placement-classes': 'error' } },
  // grid-column and its relatives: the layout folder only (everything else sets a placement by <Col span>)
  { files: ['{apps,packages}/**/*.{ts,tsx,astro,js,mjs}'], ignores: ['packages/ui/src/layout/**'], plugins: { portfolio }, rules: { 'portfolio/no-grid-placement': 'error' } },

  // ---- the exceptions, each one a file and a reason
  // the Tweaks bar is a development tool that never reaches dist/: its own chrome (a white box, a black border, the
  // neutral palette that is the warmth slider's far end) is deliberately outside the design system
  { files: ['apps/web/src/components/Tweaks.tsx'], rules: { 'portfolio/no-inline-style': 'off', 'portfolio/no-type-settings': 'off', 'portfolio/no-token-literals': 'off', 'portfolio/no-grid-placement': 'off' } },
  // the one place a Markdown body is set as HTML: Astro's rendering of the repository's own log entries, at build time
  { files: ['packages/ui/src/text/EntryBody.tsx'], rules: { 'portfolio/no-danger': 'off' } },

  // ---- CSS: all of it in packages/ui/src, following the grounds, in the two families
  {
    files: ['**/*.css'],
    plugins: { css, portfolio },
    language: 'css/css',
    languageOptions: { tolerant: true },
    rules: { 'portfolio/css-only-in-ui': 'error' },
  },
  {
    files: ['packages/ui/src/**/*.css'],
    rules: {
      'portfolio/css-only-in-ui': 'off',
      'portfolio/no-literal-color': 'error',
      'portfolio/font-family-tokens': 'error',
      'css/no-important': 'error',
    },
  },
  // reduced motion has to win over any rule's specificity: it is the one place !important belongs
  { files: ['packages/ui/src/global/motion.css'], rules: { 'css/no-important': 'off' } },
  // print is black on white whatever the ground: its literals are the point
  { files: ['packages/ui/src/global/print.css'], rules: { 'portfolio/no-literal-color': 'off' } },
]);
