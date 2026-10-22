// The bench log's index: every published entry, newest first.
import { EntryList, PageHeader, Section } from '@portfolio/ui';
import { isoDate, longDate } from '@portfolio/content';
import { screen } from './screen';

export interface LogEntryData { id: string; title: string; date: Date; summary: string }

function LogIndex({ entries }: { entries: LogEntryData[] }) {
  const newest = entries[0]?.date;
  const kicker = `Bench log · ${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}${newest ? ` · newest ${longDate(newest)}` : ''}`;
  return (
    <main id="main">
      <PageHeader kicker={kicker} title="Log" deck="What is on the bench and what changed, one dated entry at a time, newest first." />
      <Section id="entries">
        {entries.length === 0 && <p className="col-prose">No entries are published yet: each one appears once its photographs are on the site.</p>}
        <EntryList items={entries.map((e) => ({
          id: e.id,
          kicker: <time dateTime={isoDate(e.date)}>{longDate(e.date)}</time>,
          title: <a href={`${e.id}.html`}>{e.title}</a>,
          body: e.summary,
        }))} />
      </Section>
    </main>
  );
}

export default screen(LogIndex);
