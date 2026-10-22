// The inline marks, for copy written in a page rather than in @portfolio/content.
import type { ReactNode } from 'react';

/** Keeps a quantity or a range on one line ("4.0 m", "2025 – 26"). */
export const Nb = ({ children }: { children: ReactNode }) => <span className="nb">{children}</span>;
/** An identifier set in Azeret Mono (hex, signal names, code). */
export const Mono = ({ children }: { children: ReactNode }) => <span className="mono">{children}</span>;
/** Read by screen readers only. */
export const Vh = ({ children }: { children: ReactNode }) => <span className="vh">{children}</span>;

/** A name with the family name kept on one line: "Gonzalo <nb>Ferrero Martín</nb>". */
export function Name({ given, family }: { given: string; family: string }) {
  return <>{`${given} `}<Nb>{family}</Nb></>;
}

export type StatusValue = 'in progress' | 'complete' | 'design only';
/** A status in words; "in progress" carries the small open square. Never a color. */
export function Status({ value }: { value: StatusValue }) {
  return value === 'in progress' ? <span className="status">{value}</span> : <>{value}</>;
}
