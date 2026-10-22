// All work: the four case studies as rows, then the smaller builds in two columns (the first half, rounded up, left).
import { EntryList, Inline, PageHeader, ProjectRow, Section } from '@portfolio/ui';
import { builds, projects, views } from '@portfolio/content';
import { screen } from './screen';

function WorkIndex() {
  const half = Math.ceil(builds.length / 2);
  const columns = [{ span: 'a', items: builds.slice(0, half) }, { span: 'b', items: builds.slice(half) }] as const;
  return (
    <main id="main">
      <PageHeader kicker={<Inline html={views.workKicker} />} title="Work" deck="Everything I have built so far, with the checks behind it." />

      <Section id="projects" reading={views.projectsReading} title="Case studies">
        {projects.map((p) => (
          <ProjectRow
            key={p.slug}
            id={p.anchor}
            no={p.no}
            name={p.name}
            href={`${p.slug}.html`}
            deck={<Inline html={p.row.deck} />}
            notice={<Inline html={p.row.notice} />}
            meta={[p.row.stack, <Inline html={views.rowWhen(p)} />, <Inline html={views.statusMark(p.status)} />]}
          />
        ))}
      </Section>

      <Section id="builds" reading={views.buildsReading} title="Smaller builds">
        {columns.map(({ span, items }) => (
          <EntryList key={span} span={span} heading="h3" items={items.map((b) => ({
            id: b.id,
            kicker: <Inline html={views.buildKicker(b)} />,
            title: <Inline html={b.title} />,
            body: <Inline html={b.body} />,
          }))} />
        ))}
      </Section>
    </main>
  );
}

export default screen(WorkIndex);
