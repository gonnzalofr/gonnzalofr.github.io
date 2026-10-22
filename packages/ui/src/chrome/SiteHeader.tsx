// The four-corner chrome: the name top left; Work, Notes, (Log), CV from the page's center line; Contact at the right
// edge, which jumps to the footer. Every href is relative to the page (the 404's are absolute: see Site.root).
import { useSite } from '../site.tsx';

export type Current = 'home' | 'notes' | 'work-index' | 'work-case' | 'log' | 'cv' | 'other';

export function SiteHeader({ current, entry = false, hasLog }: {
  current: Current;
  /** A log entry (aria-current="true" on Log) rather than the log index ("page"). */
  entry?: boolean;
  /** Log is linked once an entry is published. */
  hasLog: boolean;
}) {
  const P = useSite().root;
  const workHref = current === 'work-case' ? 'index.html' : `${P}work/index.html`;
  const page = (is: boolean) => (is ? 'page' : undefined);
  return (
    <header className="head">
      <a className="head__name" href={`${P}index.html`}>Gonzalo Ferrero Martín</a>
      <nav className="head__nav" aria-label="Site">
        <a className="head__mid" href={workHref} aria-current={current === 'work-case' ? 'true' : page(current === 'work-index')}>Work</a>
        <a className="head__mid" href={`${P}notes.html`} aria-current={page(current === 'notes')}>Notes</a>
        {hasLog && <a className="head__mid" href={`${P}log/index.html`} aria-current={current === 'log' ? (entry ? 'true' : 'page') : undefined}>Log</a>}
        <a className="head__mid" href={`${P}cv.html`} aria-current={page(current === 'cv')}>CV</a>
        <a className="head__end" href="#contact">Contact</a>
      </nav>
    </header>
  );
}
