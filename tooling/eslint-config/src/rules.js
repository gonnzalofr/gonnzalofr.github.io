// The design system's rules as ESLint rules (docs/migration-plan.md, section 5). Each message says what to do
// instead, because the point is that the next person finds the right component, not that the build fails.
//
// The first group runs on JavaScript, TypeScript, JSX and Astro files; the second on CSS (the @eslint/css language).

const HEX = /(?<![\w&-])#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})(?![\w-])/i;
const COLOR_FUNCTION = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(|\bcolor\(/i;
const LENGTH = /^\s*-?(?:\d+|\d*\.\d+)(?:px|rem|em|vw|vh|vmin|vmax|pt|ch)\s*$/;
const FONT = /\bfont-(?:family|size)\b|\bfont(?:Family|Size)\b/;
const GRID = /\bgrid-(?:column|row|area|template)|\bgrid(?:Column|Row|Area|Template)/;
const PLACEMENT = /(?:^|\s)(?:col-(?:full|head|prose|margin|a|b)|fig--(?:right|bleed)|prose-block)(?:\s|$)/;

/** Visitors that call `check(node, text)` for every string a file writes: string literals (JSX attribute values
 *  included, they are Literals too) and the chunks of template literals. */
function strings(check) {
  return {
    Literal: (node) => { if (typeof node.value === 'string') check(node, node.value); },
    TemplateElement: (node) => { if (typeof node.value.cooked === 'string') check(node, node.value.cooked); },
  };
}

const rule = (description, messages, create) => ({ meta: { type: 'problem', docs: { description }, messages, schema: [] }, create });
const cssRule = (description, messages, create) => ({ meta: { type: 'problem', docs: { description }, languages: ['css/css'], messages, schema: [] }, create });

export const rules = {
  'no-inline-style': rule(
    'No style props or <style> elements in components: a style is a rule in packages/ui/src, using the tokens.',
    {
      prop: 'No `style` prop. Put the rule in a CSS file of packages/ui/src (a component of its own, or a variant of one), using the tokens.',
      element: 'No <style> element. Put the rule in a CSS file of packages/ui/src, imported in styles.css at its place in the cascade.',
    },
    (context) => ({
      JSXAttribute(node) {
        if (node.name.type === 'JSXIdentifier' && node.name.name === 'style') context.report({ node, messageId: 'prop' });
      },
      JSXOpeningElement(node) {
        if (node.name.type === 'JSXIdentifier' && node.name.name === 'style') context.report({ node, messageId: 'element' });
      },
    }),
  ),

  'no-grid-placement': rule(
    'grid-column and its relatives are written in packages/ui/src/layout only; everything else is placed with <Col span>.',
    { grid: 'Do not place anything on the grid here (`{{ text }}`). Use <Col span="…"> from @portfolio/ui; a new placement is a new span in packages/ui/src/layout.' },
    (context) => {
      const check = (node, text) => {
        const m = GRID.exec(text);
        if (m) context.report({ node, messageId: 'grid', data: { text: m[0] } });
      };
      return { ...strings(check), Identifier: (node) => check(node, node.name) };
    },
  ),

  'no-placement-classes': rule(
    'Placement classes (col-*, fig--*, prose-block) are written by the components of @portfolio/ui, never by a page.',
    { placement: 'Do not write the placement class `{{ text }}`. Use <Col span="…">, <Figure placement="…"> or <ProseBlock> from @portfolio/ui.' },
    (context) => ({
      JSXAttribute(node) {
        const name = node.name.type === 'JSXIdentifier' ? node.name.name : '';
        if ((name !== 'className' && name !== 'class') || node.value?.type !== 'Literal' || typeof node.value.value !== 'string') return;
        const m = PLACEMENT.exec(node.value.value);
        if (m) context.report({ node, messageId: 'placement', data: { text: m[0].trim() } });
      },
    }),
  ),

  'no-type-settings': rule(
    'font-family and font-size are set in the CSS of packages/ui only: two voices, big or small, nothing in between.',
    { type: 'Do not set `{{ text }}` here. The text components of @portfolio/ui carry the two voices; a new size is a token in packages/tokens.' },
    (context) => {
      const check = (node, text) => {
        const m = FONT.exec(text);
        if (m) context.report({ node, messageId: 'type', data: { text: m[0] } });
      };
      return { ...strings(check), Identifier: (node) => check(node, node.name) };
    },
  ),

  'no-token-literals': rule(
    'Colors and sizes come from the tokens (packages/tokens), not from literals in components.',
    {
      color: 'Hard-coded color `{{ text }}`. Colors come from the grounds and inks in packages/tokens; in CSS, var(--g), var(--ink) or var(--dim).',
      length: 'Hard-coded size `{{ text }}`. Sizes come from the type scale and the spacing in packages/tokens (var(--t-…), var(--s…)).',
    },
    (context) => strings((node, text) => {
      const color = HEX.exec(text) ?? COLOR_FUNCTION.exec(text);
      if (color) context.report({ node, messageId: 'color', data: { text: color[0] } });
      else if (LENGTH.test(text)) context.report({ node, messageId: 'length', data: { text: text.trim() } });
    }),
  ),

  'no-danger': rule(
    'dangerouslySetInnerHTML is used in one file, with a comment saying why it is safe.',
    { danger: 'No dangerouslySetInnerHTML here. Render elements; the one place that sets HTML is packages/ui/src/text/EntryBody.tsx.' },
    (context) => ({
      JSXAttribute(node) {
        if (node.name.type === 'JSXIdentifier' && node.name.name === 'dangerouslySetInnerHTML') context.report({ node, messageId: 'danger' });
      },
    }),
  ),
};

/** CSS rules (language css/css). */
export const cssRules = {
  'css-only-in-ui': cssRule(
    'CSS lives in packages/ui/src; the tokens package generates tokens.css.',
    { here: 'CSS belongs in packages/ui/src (a file of its own, imported in styles.css at its place in the cascade), not here.' },
    (context) => ({ StyleSheet(node) { context.report({ node, messageId: 'here' }); } }),
  ),

  'no-literal-color': cssRule(
    "A component's colors follow its ground: var(--g), var(--ink), var(--dim), var(--hair).",
    { color: 'Hard-coded color `{{ text }}`. Use var(--g), var(--ink), var(--dim) or var(--hair), so the component follows its ground.' },
    (context) => ({
      Declaration(node) {
        const value = context.sourceCode.getText(node.value);
        const m = HEX.exec(value) ?? COLOR_FUNCTION.exec(value);
        if (m) context.report({ node, messageId: 'color', data: { text: m[0] } });
      },
    }),
  ),

  'font-family-tokens': cssRule(
    'Two families only: var(--f-sans) and var(--f-mono).',
    { family: 'The family is var(--f-sans) or var(--f-mono) (the two families in packages/tokens), not `{{ text }}`.' },
    (context) => {
      let inFontFace = 0;
      const FAMILY = /var\(--f-(?:sans|mono)\)/;
      return {
        Atrule(node) { if (node.name === 'font-face') inFontFace++; },
        'Atrule:exit'(node) { if (node.name === 'font-face') inFontFace--; },
        Declaration(node) {
          if (inFontFace || (node.property !== 'font-family' && node.property !== 'font')) return;
          const text = context.sourceCode.getText(node.value).trim();
          if (!FAMILY.test(text) && text !== 'inherit') context.report({ node, messageId: 'family', data: { text } });
        },
      };
    },
  ),
};
