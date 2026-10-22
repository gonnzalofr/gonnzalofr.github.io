// The site's lists and labeled rows. Each takes its items as data; the markup and the placement are fixed here.
import type { ReactNode } from 'react';
import { col, type Span } from '../layout/Col.tsx';

export interface Labeled { label: ReactNode; value: ReactNode }

/** The metadata row: up to four label/value cells across the grid (case studies, Notes, the CV, the footer). */
export function MetaRow({ items }: { items: Labeled[] }) {
  return (
    <dl className="meta col-full">
      {items.map((c, i) => <div className="meta__cell" key={i}><dt>{c.label}</dt><dd>{c.value}</dd></div>)}
    </dl>
  );
}

/** Facts as label and value: the home intro's facts in the margin column, or a spec list inside a band. */
export function FactList({ items, variant }: { items: Labeled[]; variant: 'intro' | 'spec' }) {
  return (
    <dl className={variant === 'intro' ? 'intro__facts col-margin' : 'spec'}>
      {items.map((f, i) => <div key={i}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}
    </dl>
  );
}

export type CheckState = 'done' | 'in progress' | 'not built' | 'not finished';
/** What is done and what is not, in words, each with a drawn box (ticked when done). */
export function Checklist({ items }: { items: { state: CheckState; text: ReactNode }[] }) {
  return (
    <ul className="check col-prose">
      {items.map((it, i) => (
        <li key={i}>
          <svg className="chk" viewBox="0 0 10 10" aria-hidden="true">
            <rect x=".5" y=".5" width="9" height="9" />
            {it.state === 'done' && <path d="M2 5 L4.5 7.5 L8 3" />}
          </svg>
          <span className="check__state">{it.state}</span>
          {it.text}
        </li>
      ))}
    </ul>
  );
}

/** Entries as a kicker, a title and a line (the log index, the smaller builds). */
export function EntryList({ span = 'prose', heading: H = 'h2', items }: {
  span?: Span;
  heading?: 'h2' | 'h3';
  items: { id: string; kicker: ReactNode; title: ReactNode; body: ReactNode }[];
}) {
  return (
    <ul className={`nlist ${col(span)}`}>
      {items.map((e) => (
        <li id={e.id} key={e.id}>
          <p className="nlist__kicker">{e.kicker}</p>
          <H className="nlist__title">{e.title}</H>
          <p>{e.body}</p>
        </li>
      ))}
    </ul>
  );
}

/** Places to go, each with a quiet note (the 404). */
export function LinkList({ items }: { items: { href: string; label: ReactNode; note: ReactNode }[] }) {
  return (
    <ul className="more col-prose">
      {items.map((it, i) => <li key={i}><a href={it.href}>{it.label}</a> <span>{it.note}</span></li>)}
    </ul>
  );
}

/** Dated entries, newest first: a date beside a role and a line about it (the CV). */
export function Timeline({ entries }: { entries: { date: ReactNode; role: ReactNode; text: ReactNode }[] }) {
  return (
    <div className="rec col-prose">
      {entries.map((e, i) => (
        <div className="rec__entry" key={i}>
          <p className="rec__date">{e.date}</p>
          <div className="rec__body">
            <h3 className="rec__role">{e.role}</h3>
            <p className="rec__org">{e.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/** A label beside text, one row each (CV skills and languages), with an optional closing line in mono. */
export function KeyValueRows({ rows, parts }: { rows: { label: ReactNode; text: ReactNode }[]; parts?: string }) {
  return (
    <div className="kit col-prose">
      {rows.map((r, i) => (
        <div className="kit__row" key={i}>
          <p className="kit__label">{r.label}</p>
          <p className="kit__text">{r.text}</p>
        </div>
      ))}
      {parts && <p className="kit__parts">{parts}</p>}
    </div>
  );
}
