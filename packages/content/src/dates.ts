// Dates are stored as calendar values ("2026", "2026-07", "2026-10-14") and written out in one of three styles:
//   short  the site's default: a shared year is written once     "May – Oct 2026", "Jan – 14 Oct 2026", "2025 – 26"
//   cv     every end written in full, as a CV reads               "May 2026 – Oct 2026", "Jan 2026 – 14 Oct 2026", "2025 – 2026"
//   long   month names in full (prose-like cells)                 "January – 14 October 2026"
// A range without an end is one date ("2026"); `to: 'present'` is open-ended ("Jul 2026 – present").
import { z } from 'zod';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const calendar = z.string().regex(/^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/, 'a date as YYYY, YYYY-MM or YYYY-MM-DD');
export const range = z.object({ from: calendar, to: z.union([calendar, z.literal('present')]).optional() }).strict();
export type Range = z.infer<typeof range>;
export type Style = 'short' | 'cv' | 'long';

type Parts = { y: number; m?: number; d?: number };
const parse = (s: string): Parts => {
  const [y, m, d] = s.split('-').map(Number) as [number, number?, number?];
  return { y, m, d };
};
const month = (m: number, style: Style) => (style === 'long' ? MONTHS[m - 1]! : MONTHS[m - 1]!.slice(0, 3));
const write = (p: Parts, style: Style, withYear = true): string =>
  [p.d, p.m && month(p.m, style), withYear ? p.y : undefined].filter((x) => x !== undefined).join(' ');

/** Writes a range; ranges split with a spaced en dash. */
export function when(r: Range, style: Style = 'short'): string {
  const from = parse(r.from);
  if (!r.to) return write(from, style);
  if (r.to === 'present') return `${write(from, style)} – present`;
  const to = parse(r.to);
  if (from.m === undefined && to.m === undefined) {
    if (from.y === to.y) return String(from.y);
    return `${from.y} – ${style === 'cv' ? to.y : String(to.y).slice(2)}`;
  }
  const shareYear = style !== 'cv' && from.y === to.y && from.m !== undefined;
  return `${write(from, style, !shareYear)} – ${write(to, style)}`;
}

/** The last day a range covers, for sorting and for "is it over": open ranges never end. */
export function ends(r: Range): string {
  return r.to === 'present' ? '9999' : (r.to ?? r.from);
}

/** The years a set of ranges spans, as one range ("2025 – present", "2023 – 2028"). */
export function span(ranges: Range[]): Range {
  const from = ranges.map((r) => r.from.slice(0, 4)).sort()[0]!;
  if (ranges.some((r) => r.to === 'present')) return { from, to: 'present' };
  return { from, to: ranges.map((r) => (r.to ?? r.from).slice(0, 4)).sort().at(-1)! };
}

// Dates in front matter (the bench log) are calendar days; read them back in UTC so the day does not shift with the
// build machine's zone.
/** "19 June 2026" */
export function longDate(d: Date): string {
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
/** "2026-06-19", for <time datetime> */
export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
