// Inline copy: a short run of text with the site's few inline marks, written as the HTML the pages use. Only these
// marks are allowed, and the schema rejects anything else, so data can never smuggle in a <div>, an attribute that
// styles, or an unescaped "&":
//   <span class="nb">…</span>      keep together (quantities, date ranges)
//   <span class="nc">…</span>      an acronym set as written
//   <span class="mono">…</span>    an identifier in Azeret Mono (hex, signal names, code)
//   <span class="status">…</span>  a status in words, with the small open square
//   <span class="vh">…</span>      visually hidden, read by screen readers
//   <span aria-hidden="true">…</span>   decorative glyphs (↗ ← →)
//   <a href="…">…</a>, <a href="…" rel="noopener">…</a>, <br>
// Links inside the site are written from the site root as "~/path" ("~/notes.html#daedalus") and resolved per page
// by resolve(), so the same copy works on root pages, on work/ and log/ pages, and on the 404.
import { z } from 'zod';

const TAG = /<\/?[a-z][^>]*>/gi;
const ALLOWED_TAG =
  /^(<span class="(nb|nc|mono|status|vh)">|<span aria-hidden="true">|<\/span>|<a href="(https:\/\/[^"]+|mailto:[^"]+|#[\w-]+|~\/[^"]*)"( rel="noopener")?>|<\/a>|<br>)$/;
const BARE_AMP = /&(?!(amp|lt|gt|nbsp|quot);)/;

export function inlineProblems(s: string): string[] {
  const problems = [...s.matchAll(TAG)].map((m) => m[0]).filter((t) => !ALLOWED_TAG.test(t)).map((t) => `tag not allowed: ${t}`);
  if (BARE_AMP.test(s)) problems.push('unescaped "&" (write &amp;)');
  const opened = (s.match(/<(span|a)\b/g) ?? []).length, closed = (s.match(/<\/(span|a)>/g) ?? []).length;
  if (opened !== closed) problems.push(`${opened} opening and ${closed} closing tags`);
  return problems;
}

export const inline = z.string().min(1).superRefine((s, ctx) => {
  for (const message of inlineProblems(s)) ctx.addIssue({ code: 'custom', message });
});
export type Inline = z.infer<typeof inline>;

/** Rewrites "~/" links for a page: '' on root pages, '../' one level down, an absolute origin on the 404. */
export function resolve(s: string, prefix: string): string {
  return s.replaceAll('href="~/', `href="${prefix}`);
}

/** Escapes plain text for use inside inline copy. */
export const text = (s: string) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

export const nb = (s: string) => `<span class="nb">${s}</span>`;
export const nc = (s: string) => `<span class="nc">${s}</span>`;
export const mono = (s: string) => `<span class="mono">${s}</span>`;
export const link = (label: string, href: string, opts: { external?: boolean } = {}) =>
  `<a href="${href}"${opts.external ? ' rel="noopener"' : ''}>${label}</a>`;

/** A date range or quantity is kept on one line only when it has a space to break at. */
export const keep = (s: string) => (s.includes(' ') ? nb(s) : s);
