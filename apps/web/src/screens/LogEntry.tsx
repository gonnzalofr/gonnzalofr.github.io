// One bench-log entry. The body is the entry's Markdown as Astro rendered it (src/content/log/*.md, figures written
// as raw HTML in the Markdown); it moves to MDX with <Figure>/<Photo> later (docs/migration-plan.md, section 4.7).
import { Page, PageHeader } from '@portfolio/ui';
import { isoDate, longDate } from '@portfolio/content';
import { screen } from './screen';
import type { LogEntryData } from './LogIndex';

function LogEntry({ entry, html }: { entry: LogEntryData; html: string }) {
  const kicker = <>{'Log · '}<time dateTime={isoDate(entry.date)}>{longDate(entry.date)}</time></>;
  return (
    <main id="main">
      <PageHeader kicker={kicker} title={entry.title} deck={entry.summary} />
      <Page>
        <div className="prose-block col-full entry__body">
          <div className="fig--right entry__text" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </Page>
    </main>
  );
}

export default screen(LogEntry);
