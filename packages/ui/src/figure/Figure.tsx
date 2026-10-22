// A numbered figure: "Fig. N — caption". Numbers follow the order the figures render on the page, so inserting one
// renumbers the rest (prose that cites a figure by number still names it by hand). A scrolling drawing inside one
// (Diagram, FigScroll) is labeled by the caption, whose id it reads from here.
import { createContext, useContext, type ReactNode } from 'react';
import { cx, useNextFigure, usePublished } from '../site.tsx';

export type Placement = 'right' | 'bleed';

const FigureContext = createContext<{ no: number; captionId?: string }>({ no: 0 });

export function Figure({ placement, id, variant, captionId, caption, children, ...data }: {
  placement: Placement;
  /** Default `fig-N`; the islands keep the ids their scripts look up ("fig-board", "fig-tmds"). */
  id?: string;
  /** A figure that is a plate (the XSIM frame in its envelope) or the 3D board. */
  variant?: 'plate' | 'board';
  /** Default `fig-N-cap`; false for a caption nothing refers to. */
  captionId?: string | false;
  caption: ReactNode;
  children: ReactNode;
  [data: `data-${string}`]: string;
}) {
  const no = useNextFigure();
  const capId = captionId === false ? undefined : (captionId ?? `fig-${no}-cap`);
  return (
    <figure className={cx('fig', `fig--${placement}`, variant)} id={id ?? `fig-${no}`} {...data}>
      <FigureContext value={{ no, captionId: capId }}>{children}</FigureContext>
      <figcaption id={capId}><span className="fig__no">{`Fig. ${no}`}</span>{' — '}{caption}</figcaption>
    </figure>
  );
}

/** The scroll box around a drawing wider than a phone: a tab stop, labeled by the figure's caption. */
export function FigScroll({ children }: { children: ReactNode }) {
  const { captionId } = useContext(FigureContext);
  return <div className="fig__scroll" tabIndex={0} role="group" aria-labelledby={captionId}>{children}</div>;
}

/** An inline SVG drawing in a scroll box, described by its <title>. Children are the drawing, in literal numbers. */
export function Diagram({ viewBox, title, fit, overflow, titleId, children }: {
  viewBox: string;
  title: string;
  /** 'start' pins the drawing to the top left when the box is wider than its aspect ratio. */
  fit?: 'start';
  overflow?: 'visible';
  /** Default `fN-t`; the TMDS island keeps the id its script was written against. */
  titleId?: string;
  children: ReactNode;
}) {
  const { no } = useContext(FigureContext);
  const tid = titleId ?? `f${no}t`;
  return (
    <FigScroll>
      <svg viewBox={viewBox} preserveAspectRatio={fit && 'xMinYMin meet'} overflow={overflow} role="img" aria-labelledby={tid}>
        <title id={tid}>{title}</title>
        {children}
      </svg>
    </FigScroll>
  );
}

/** An arrowhead for marker-end (and marker-start, if `reversible`). Its id must be unique on the page. */
export function ArrowMarker({ id = 'arr', reversible = false }: { id?: string; reversible?: boolean }) {
  return (
    <marker id={id} viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient={reversible ? 'auto-start-reverse' : 'auto'}>
      <path d="M0 0 L10 5 L0 10" fill="none" stroke="currentColor" />
    </marker>
  );
}

/** The hatch that `.f-hatch` fills with (url(#hatch) in figure.css): define it once per page, in the first drawing that uses it. */
export function Hatch({ stroke }: { stroke: 's-rule' | 's-axis' }) {
  return (
    <pattern id="hatch" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)">
      <line className={stroke} x1="3.5" y1="0" x2="3.5" y2="7" />
    </pattern>
  );
}

export interface PhotoProps { src: string; width: number; height: number; alt: string; portrait?: boolean }

/** A photograph or render, loaded lazily. */
export function Photo({ src, width, height, alt, portrait }: PhotoProps) {
  return <img className={cx('fig__img', portrait && 'fig__img--portrait')} src={src} width={width} height={height} loading="lazy" decoding="async" alt={alt} />;
}

type PhotoFigureProps = PhotoProps & { placement: Placement; caption: ReactNode; captionId?: false };

/** A figure of one photograph that renders nothing, and takes no number, while the file is still a placeholder. */
export function PhotoFigure(props: PhotoFigureProps) {
  if (!usePublished(props.src)) return null;
  return <PhotoFigureShown {...props} />;
}
// a component of its own, so the figure number is only taken once the photo is known to be real
function PhotoFigureShown({ placement, caption, captionId, ...photo }: PhotoFigureProps) {
  return <Figure placement={placement} caption={caption} captionId={captionId}><Photo {...photo} /></Figure>;
}
