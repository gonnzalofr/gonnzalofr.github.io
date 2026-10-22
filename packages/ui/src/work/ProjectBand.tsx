// Home: the work to choose from. A heading, then one full-width band per project on the ground its case study uses
// (the whole band opens it), the team band, and the smaller builds as a line of links.
import type { ReactNode } from 'react';
import type { Ground } from '@portfolio/tokens';
import { Page } from '../layout/Page.tsx';
import { Kicker } from '../text/Voice.tsx';
import { FactList, type Labeled } from '../text/Lists.tsx';

export function Choose({ id, kicker, title, children }: { id: string; kicker: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="choose" id={id} aria-labelledby={`${id}-h`}>
      <Page as="div" variant="choose">
        <Kicker span="full">{kicker}</Kicker>
        <h2 className="col-full" id={`${id}-h`}>{title}</h2>
      </Page>
      {children}
    </section>
  );
}

export function Bands({ children }: { children: ReactNode }) {
  return <ol className="bands">{children}</ol>;
}

interface BandText { ground: Ground; no: string; name: string; href: string; line: ReactNode; meta: ReactNode }

function Band({ team, ground, no, name, href, line, meta, children }: BandText & { team?: boolean; children: ReactNode }) {
  return (
    <li className={team ? 'band band--team' : 'band'} data-ground={ground}>
      <div className="page band__in">
        <div className="band__text">
          <p className="band__no">{no}</p>
          <h3 className="band__name"><a href={href}>{name}</a></h3>
          <p className="band__line">{line}</p>
          <p className="band__meta">{meta}</p>
        </div>
        {children}
      </div>
    </li>
  );
}

/** A project's band; `glimpse` is its evidence (a Glimpse). */
export function ProjectBand({ glimpse, ...text }: BandText & { glimpse: ReactNode }) {
  return <Band {...text}>{glimpse}</Band>;
}

/** The team's band: its numbers as a spec list where a project has its glimpse. */
export function TeamBand({ spec, ...text }: Omit<BandText, 'no'> & { spec: Labeled[] }) {
  return (
    <Band team no="Team" {...text}>
      <div className="band__fig band__fig--spec"><FactList variant="spec" items={spec} /></div>
    </Band>
  );
}

/** The evidence beside a band: decorative (the band's text says what the project is), so hidden from screen readers. */
export function Glimpse({ kind, children }: { kind: 'env' | 'board' | 'draw' | 'photo'; children: ReactNode }) {
  return <figure className={`band__fig band__fig--${kind}`} aria-hidden="true">{children}</figure>;
}

/** The smaller builds as one line of links, each with its tags. */
export function BuildList({ items }: { items: { href: string; title: ReactNode; tag: string }[] }) {
  return (
    <Page as="div" variant="builds">
      <Kicker span="full">Smaller builds · coursework and side projects</Kicker>
      <ul className="builds__list col-full">
        {items.map((b) => <li key={b.href}><a href={b.href}>{b.title}</a> <span>{b.tag}</span></li>)}
      </ul>
    </Page>
  );
}
