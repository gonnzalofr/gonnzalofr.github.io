// A project on the work index: its number, its name over a deck and a notice, and a column of stack · when · status.
import type { ReactNode } from 'react';

export function ProjectRow({ id, no, name, href, deck, notice, meta }: {
  id: string;
  no: string;
  name: string;
  href: string;
  deck: ReactNode;
  notice: ReactNode;
  meta: ReactNode[];
}) {
  return (
    <article className="row col-full" id={id}>
      <p className="row__no">{no}</p>
      <div className="row__title">
        <h3><a href={href}>{name}</a></h3>
        <p className="row__deck">{deck}</p>
        <p className="row__notice">{notice}</p>
      </div>
      <ul className="row__meta">
        {meta.map((m, i) => <li key={i}>{m}</li>)}
      </ul>
    </article>
  );
}
