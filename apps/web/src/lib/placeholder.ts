// The five images in public/assets/work/ ship as labeled placeholders until the owner saves the real
// photographs and renders over them. Nothing may show a placeholder to a reader: every figure that uses
// one is left out of the build, and a log entry that shows one stays unpublished. Saving a real file
// changes its hash, so the next build shows the figure (and publishes the entry) with no other edit.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const PLACEHOLDERS = new Set([
  '7e27c48b7e4b49e2', // hifi-rev1.png
  '2e8a531eff2526bb', // hifi-rev2.png
  'ae34e15c4f0881e5', // hifi-rev3.png
  '8d1c7d574d8b3db3', // venus-bench-front.jpg
  'ba04bb0303424caa', // venus-bench-side.jpg
]);

/** True when the file under public/ is missing or is still one of the labeled placeholders.
 *  `path` is relative to public/, e.g. "assets/work/hifi-rev1.png" (leading "../" are ignored). */
export function isPlaceholder(path: string): boolean {
  const file = join(process.cwd(), 'public', path.replace(/^(\.\.\/)+/, ''));
  if (!existsSync(file)) return true;
  return PLACEHOLDERS.has(createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 16));
}

/** Every local image a Markdown body references, as a path relative to public/. */
export function imagesIn(body: string | undefined): string[] {
  return [...(body ?? '').matchAll(/src="((?:\.\.\/)*assets\/[^"]+)"/g)].map((m) => m[1]);
}

/** A log entry is published once none of its images is a placeholder. */
export function isPublished(entry: { body?: string }): boolean {
  return !imagesIn(entry.body).some(isPlaceholder);
}
