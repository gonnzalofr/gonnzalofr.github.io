// The 404: GitHub Pages serves it for any missing address at any depth, so its links start from the absolute root.
import { LinkList, PageHeader, Section, useSite } from '@portfolio/ui';
import { projects, views } from '@portfolio/content';
import { screen } from './screen';

function NotFound() {
  const S = useSite().root;
  return (
    <main id="main">
      <PageHeader kicker="404 · not found" title="Nothing at this address" deck="The page may have moved. Everything on the site starts from one of these:" />
      <Section>
        <LinkList items={[
          { href: `${S}work/index.html`, label: 'All work', note: views.notFoundAllWork },
          ...projects.map((p) => ({ href: `${S}work/${p.slug}.html`, label: p.name, note: p.notFound.stack })),
          { href: `${S}cv.html`, label: 'CV', note: 'one A4 page' },
          { href: '#contact', label: 'Contact', note: 'email · GitHub · LinkedIn' },
        ]} />
      </Section>
    </main>
  );
}

export default screen(NotFound);
