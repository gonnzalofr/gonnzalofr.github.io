// .page: the 12-column grid every band of a page is set on. A variant adds the rules of one kind of band.
import type { ReactNode } from 'react';
import { cx } from '../site.tsx';

const variants = { case: 'cs', section: 'sec', intro: 'intro', builds: 'builds', choose: 'choose__head' } as const;
export type PageVariant = keyof typeof variants;

export function Page({ as: Tag = 'section', variant, id, children }: {
  as?: 'section' | 'div';
  variant?: PageVariant;
  id?: string;
  children: ReactNode;
}) {
  return <Tag className={cx('page', variant && variants[variant])} id={id}>{children}</Tag>;
}

/** A case study's or a log entry's body: a subgrid, so headings, prose, notes and figures keep their placements. */
export function ProseBlock({ children }: { children: ReactNode }) {
  return <div className="prose-block col-full">{children}</div>;
}
