// The CV: one page on screen in the site's typography, and one A4 page when printed (packages/ui/src/global/print.css
// hides the running head and footer and compacts the entries). public/assets/Gonzalo-Ferrero-Martin-CV.pdf is printed
// from this page with headless Edge after a build; regenerate it whenever the CV's content changes.
import { Fragment } from 'react';
import { Col, Inline, KeyValueRows, MetaRow, Name, PageHeader, Section, Timeline } from '@portfolio/ui';
import { cv, person, views, type CvEntry } from '@portfolio/content';
import { screen } from './screen';

const timeline = (entries: Pick<CvEntry, 'dates' | 'role' | 'text'>[]) =>
  entries.map((e) => ({ date: <Inline html={views.cvDate(e)} />, role: <Inline html={e.role} />, text: <Inline html={e.text} /> }));
const rows = (rs: { label: string; text: string }[]) => rs.map((r) => ({ label: <Inline html={r.label} />, text: <Inline html={r.text} /> }));

function Cv() {
  // the Projects section: each project's CV entry, dated by the project's own dates
  const projectEntries = views.cvProjects.map((p) => ({ dates: p.dates, role: p.cv.role, text: p.cv.text }));
  const sections = [
    { id: 'education', reading: views.educationReading, title: 'Education', entries: cv.education },
    { id: 'projects', reading: views.cvProjectsReading, title: 'Projects', entries: projectEntries },
    { id: 'experience', reading: views.experienceReading, title: 'Experience', entries: cv.experience },
  ];
  return (
    <main id="main" className="cv">
      <PageHeader kicker={views.cvKicker} title={<Name {...person.name} />} deck="Electrical Engineering student — hardware and software.">
        <Col span="prose" hook="cv__pdf"><a href={person.cvPdf.path}>Download the PDF — one A4 page</a></Col>
        <MetaRow items={[
          { label: 'Email', value: <a href={`mailto:${person.email}`}>{person.email}</a> },
          { label: 'Portfolio', value: <a href={person.site.url}>{person.site.label}</a> },
          { label: 'Links', value: person.links.map((l, i) => <Fragment key={l.href}>{i > 0 && <br />}<a href={l.href} rel="noopener">{l.label}</a></Fragment>) },
          { label: 'Based', value: person.based },
        ]} />
      </PageHeader>

      {sections.map((s) => (
        <Section key={s.id} id={s.id} reading={<Inline html={s.reading} />} title={s.title}>
          <Timeline entries={timeline(s.entries)} />
        </Section>
      ))}

      <Section id="skills" reading={cv.skills.reading} title="Skills">
        <KeyValueRows rows={rows(cv.skills.rows)} parts={cv.skills.parts} />
      </Section>

      <Section id="languages" reading={cv.languages.reading} title="Languages">
        <KeyValueRows rows={rows(cv.languages.rows)} />
      </Section>
    </main>
  );
}

export default screen(Cv);
