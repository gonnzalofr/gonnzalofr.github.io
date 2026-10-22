// The chrome every page shares, fed from @portfolio/content: the four-corner header and the Contact footer.
// Document.astro renders both around the page.
import { SiteProvider, SiteHeader, Footer, Inline, type Current, type Site } from '@portfolio/ui';
import { person, fullName, views } from '@portfolio/content';

export function Header({ site, current, entry, hasLog }: { site: Site; current: Current; entry?: boolean; hasLog: boolean }) {
  return <SiteProvider site={site}><SiteHeader current={current} entry={entry} hasLog={hasLog} /></SiteProvider>;
}

export function SiteFooter({ site }: { site: Site }) {
  return (
    <SiteProvider site={site}>
      <Footer
        contact={<Inline html={person.contact} />}
        email={person.email}
        cv={person.cvPdf}
        links={person.links}
        study={<Inline html={views.footerStudy} />}
        colophon={{ year: person.revised.slice(0, 4), name: fullName, city: person.city, revised: views.revised }}
      />
    </SiteProvider>
  );
}
