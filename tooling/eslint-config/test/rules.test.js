// The design system's rules, through ESLint itself with the workspace's config, so these tests cover the rules and
// the files each one applies to. Every case is a file path (which decides the rules), its text, and the rule ids
// expected (none: it passes).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';

const root = fileURLToPath(new URL('../../..', import.meta.url)).replace(/[\\/]$/, '');
const eslint = new ESLint({ cwd: root, overrideConfigFile: `${root}/eslint.config.mjs` });

async function ids(filePath, text) {
  const [result] = await eslint.lintText(text, { filePath: `${root}/${filePath}` });
  return result.messages.map((m) => m.ruleId ?? `parse error: ${m.message}`);
}

const page = 'apps/web/src/screens/Example.tsx';
const component = 'packages/ui/src/text/Example.tsx';
const tsx = (jsx) => `export const A = () => (${jsx});\n`;
const css = 'packages/ui/src/text/example.css';

const cases = [
  // style
  ['a style prop', page, tsx('<p style={{ margin: 0 }}>x</p>'), ['portfolio/no-inline-style']],
  ['a style prop in the design system itself', component, tsx('<p style={{ margin: 0 }}>x</p>'), ['portfolio/no-inline-style']],
  ['a <style> element', page, tsx('<style>{`p { margin: 0 }`}</style>'), ['portfolio/no-inline-style']],
  ['a style attribute in an Astro file', 'apps/web/src/pages/example.astro', '<p style="margin: 0">x</p>\n', ['portfolio/no-inline-style']],
  ['no style', page, tsx('<p className="note">x</p>'), []],
  ['the Tweaks bar (dev only) is exempt', 'apps/web/src/components/Tweaks.tsx', tsx('<style>{`.tw { color: #111; display: grid; grid-template-columns: 1fr; font: 12px/1.3 ui-monospace }`}</style>'), []],

  // placement
  ['grid-column in a page', page, "export const a = 'grid-column: 1 / 3';\n", ['portfolio/no-grid-placement']],
  ['gridColumn in a component', component, 'export const a = { gridColumn: 1 };\n', ['portfolio/no-grid-placement']],
  ['grid-column in the layout folder', 'packages/ui/src/layout/Example.tsx', "export const a = 'grid-column: 1 / 3';\n", []],
  ['a placement class in a page', page, tsx('<p className="col-prose">x</p>'), ['portfolio/no-placement-classes']],
  ['a placement class among others', page, tsx('<div className="entry fig--right">x</div>'), ['portfolio/no-placement-classes']],
  ['a placement class in an Astro file', 'apps/web/src/pages/example.astro', '<p class="col-margin">x</p>\n', ['portfolio/no-placement-classes']],
  ['a placement class inside a component', component, tsx('<p className="col-prose">x</p>'), []],
  ['a drawing class', page, tsx('<rect className="crisp f-hatch" />'), []],

  // type
  ['font-family', page, "export const a = 'font-family: Arial';\n", ['portfolio/no-type-settings']],
  ['fontSize', page, 'export const a = { fontSize: 12 };\n', ['portfolio/no-type-settings']],
  ['font-size in the tokens package', 'packages/tokens/src/example.ts', "export const a = 'font-size: 1rem';\n", []],

  // tokens
  ['a hex color', page, "export const a = '#F3EEE4';\n", ['portfolio/no-token-literals']],
  ['a color function', page, 'export const a = `rgb(1, 2, 3)`;\n', ['portfolio/no-token-literals']],
  ['a bare length', page, "export const a = '12px';\n", ['portfolio/no-token-literals']],
  ['a hex color in the tokens package', 'packages/tokens/src/example.ts', "export const a = '#F3EEE4';\n", []],
  ['an anchor that looks like a hex color', page, "export const a = '#add-a-project'; export const b = '#contact';\n", []],
  ['a margin as an observer takes it', 'apps/web/src/pages/example.astro', "---\nconst margin = '600px 0px';\n---\n<p>x</p>\n", []],
  ['a hex color in an Astro file', 'apps/web/src/pages/example.astro', "---\nconst c = '#fff';\n---\n<p>x</p>\n", ['portfolio/no-token-literals']],

  // html and animation
  ['dangerouslySetInnerHTML in a page', page, tsx('<div dangerouslySetInnerHTML={{ __html: "x" }} />'), ['portfolio/no-danger']],
  ['dangerouslySetInnerHTML in EntryBody', 'packages/ui/src/text/EntryBody.tsx', tsx('<div dangerouslySetInnerHTML={{ __html: "x" }} />'), []],
  ['an animation library', page, "import gsap from 'gsap';\nexport const a = gsap;\n", ['no-restricted-imports']],
  ['a scoped animation library', page, "import { useSpring } from '@react-spring/web';\nexport const a = useSpring;\n", ['no-restricted-imports']],

  // css
  ['CSS in the app', 'apps/web/src/example.css', 'p { margin: 0; }\n', ['portfolio/css-only-in-ui']],
  ['CSS in the design system', css, 'p { margin: 0; color: var(--ink); }\n', []],
  ["a hex color in a component's CSS", css, 'p { color: #333; }\n', ['portfolio/no-literal-color']],
  ['a color function in a custom property', css, 'p { --x: rgb(1 2 3); }\n', ['portfolio/no-literal-color']],
  ['a color in print.css', 'packages/ui/src/global/print.css', 'p { color: #000; }\n', []],
  ['a third family', css, 'p { font-family: Arial, sans-serif; }\n', ['portfolio/font-family-tokens']],
  ['a family in the font shorthand', css, 'p { font: 400 1rem/1.5 Georgia; }\n', ['portfolio/font-family-tokens']],
  ['the two families', css, 'p { font-family: var(--f-mono); } q { font: 400 var(--t-mono)/1.5 var(--f-sans); }\n', []],
  ['@font-face declares a family', 'packages/ui/src/global/example.css', "@font-face { font-family: 'Anybody'; src: url(a.woff2); }\n", []],
  ['!important', css, 'p { margin: 0 !important; }\n', ['css/no-important']],
  ['!important under reduced motion', 'packages/ui/src/global/motion.css', '@media (prefers-reduced-motion: reduce) { * { transition-duration: 0s !important; } }\n', []],
];

for (const [name, file, text, expected] of cases) {
  test(name, async () => assert.deepEqual(await ids(file, text), expected));
}
