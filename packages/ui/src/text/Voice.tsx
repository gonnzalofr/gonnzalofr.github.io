// The quiet voice around the big names: the kicker above a title, the deck below it, a heading in a case study's
// prose. None of them takes a size: there is no third size (big or small, nothing in between).
import type { ReactNode } from 'react';
import { col, type Span } from '../layout/Col.tsx';

export function Kicker({ span = 'head', children }: { span?: Span; children: ReactNode }) {
  return <p className={`kicker ${col(span)}`}>{children}</p>;
}

export function Deck({ children }: { children: ReactNode }) {
  return <p className="deck col-prose">{children}</p>;
}

/** A section heading inside a case study's prose block, with the id the page's anchors use. */
export function H2({ id, children }: { id: string; children: ReactNode }) {
  return <h2 className="col-head" id={id}>{children}</h2>;
}

/** A paragraph in the prose column. */
export function Prose({ children }: { children: ReactNode }) {
  return <p className="col-prose">{children}</p>;
}

/** A pull quote: a kicker word (constraint, verification) and one sentence, beside the prose. */
export function PullQuote({ kicker, children }: { kicker: string; children: ReactNode }) {
  return (
    <aside className="pull">
      <p className="pull__kicker">{kicker}</p>
      <p>{children}</p>
    </aside>
  );
}

/** A note in the margin column, beside the paragraph that follows it. */
export function MarginNote({ children }: { children: ReactNode }) {
  return <aside className="note col-margin">{children}</aside>;
}
