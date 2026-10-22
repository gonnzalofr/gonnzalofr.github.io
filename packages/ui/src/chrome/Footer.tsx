// Contact: the footer of every page. The confirmed internship line (`contact`) appears here, once per page.
import { Fragment, type ReactNode } from 'react';
import { MetaRow } from '../text/Lists.tsx';
import { useSite } from '../site.tsx';

export function Footer({ contact, email, cv, links, study, colophon }: {
  contact: ReactNode;
  email: string;
  /** The CV PDF: a path from the site root. */
  cv: { path: string; label: string };
  links: { href: string; label: string }[];
  study: ReactNode;
  colophon: { year: string; name: string; city: string; revised: string };
}) {
  const P = useSite().root;
  return (
    <footer className="foot page" id="contact">
      <hr className="sec__rule col-full" />
      <h2 className="foot__h">Contact</h2>
      <p className="col-prose">{contact}</p>
      <MetaRow items={[
        { label: 'Email', value: <a href={`mailto:${email}`}>{email}</a> },
        { label: 'CV', value: <a href={`${P}${cv.path}`}>{cv.label}</a> },
        { label: 'Links', value: links.map((l, i) => <Fragment key={l.href}>{i > 0 && <br />}<a href={l.href} rel="noopener">{`${l.label} `}<span aria-hidden="true">↗</span></a></Fragment>) },
        { label: 'Study', value: study },
      ]} />
      <p className="foot__colophon">{`© ${colophon.year} ${colophon.name} · ${colophon.city} `}<span>{`Last revised ${colophon.revised}`}</span></p>
    </footer>
  );
}
