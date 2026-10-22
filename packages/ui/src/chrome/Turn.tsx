// Prev / next at the end of a case study: the neighboring projects, each on its own ground.
import type { Ground } from '@portfolio/tokens';

export interface TurnTarget { href: string; no: string; name: string; ground: Ground }

export function Turn({ prev, next }: { prev: TurnTarget; next: TurnTarget }) {
  return (
    <nav className="turn col-full" aria-label="Previous and next project">
      <a data-ground={prev.ground} href={prev.href} rel="prev"><span className="mono">{prev.no}</span> <span aria-hidden="true">←</span>{` ${prev.name}`}</a>
      <a data-ground={next.ground} className="turn__next" href={next.href} rel="next"><span className="mono">{next.no}</span>{` ${next.name} `}<span aria-hidden="true">→</span></a>
    </nav>
  );
}
