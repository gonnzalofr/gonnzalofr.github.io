// The placement classes: the only way to put something on the 12-column grid (README: "don't set grid-column anywhere
// else"). `span` names a column range in layout/grid.css; there is no other way to give a component a width.
import type { ReactNode } from 'react';
import { cx } from '../site.tsx';

export type Span = 'full' | 'head' | 'prose' | 'margin' | 'a' | 'b';
export const col = (span: Span) => `col-${span}`;

/** Page-specific hooks for a rule in print or page CSS; each one is listed here, so none is made up in a page. */
export type Hook = 'cv__pdf';

export function Col({ as: Tag = 'p', span, id, hook, children }: {
  as?: 'p' | 'div' | 'h1' | 'h2';
  span: Span;
  id?: string;
  hook?: Hook;
  children: ReactNode;
}) {
  return <Tag className={cx(col(span), hook)} id={id}>{children}</Tag>;
}
