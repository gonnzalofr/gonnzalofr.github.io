// The XSIM frame inside the 800×525 timing envelope it was generated in (home band, HDMI Fig. 4), and the scale bar
// under it. The envelope's hatched blanking is drawn by envelope.css around whatever image is inside.
import type { ReactNode } from 'react';

export function Envelope({ children }: { children: ReactNode }) {
  return <div className="envelope">{children}</div>;
}

export function EnvelopeLabel({ side, children }: { side: 'right' | 'bottom'; children: ReactNode }) {
  return <p className={`envelope__lbl envelope__lbl--${side}`}>{children}</p>;
}

/** A scale along the envelope: a line `length` long with a tick and a label at each mark; `repeat` marks are drawn in the ink. */
export function ScaleBar({ length, marks }: { length: number; marks: { at: number; repeat?: boolean }[] }) {
  return (
    <div className="scale" aria-hidden="true">
      <svg className="scale__bar" viewBox={`0 0 ${length} 28`} preserveAspectRatio="none" aria-hidden="true">
        <line x1="0" y1="8" x2={length} y2="8" />
        {marks.map((m) => <line key={m.at} className={m.repeat ? 's-cu' : undefined} x1={m.at} y1="0" x2={m.at} y2="8" />)}
      </svg>
      {marks.map((m) => <span key={m.at} className={`scale__lbl scale__lbl--${m.at}`}>{m.at}</span>)}
    </div>
  );
}
