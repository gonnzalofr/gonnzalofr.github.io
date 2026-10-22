// Home: about him first. The kicker, his name set wide, the one-sentence deck, the paragraphs about how he works with
// a line of links under them, and the facts in the margin column.
import type { ReactNode } from 'react';
import { Page } from '../layout/Page.tsx';
import { Kicker, Deck } from '../text/Voice.tsx';
import { FactList, type Labeled } from '../text/Lists.tsx';
import { Name } from '../text/Marks.tsx';

export function Intro({ kicker, name, deck, links, facts, children }: {
  kicker: ReactNode;
  name: { given: string; family: string };
  deck: ReactNode;
  /** The line of links under the paragraphs (CV, PDF, Contact). */
  links: ReactNode;
  facts: Labeled[];
  children: ReactNode;
}) {
  return (
    <Page variant="intro">
      <Kicker span="full">{kicker}</Kicker>
      <h1 className="col-full"><Name {...name} /></h1>
      <Deck>{deck}</Deck>
      <div className="intro__about col-prose">
        {children}
        <p className="intro__act">{links}</p>
      </div>
      <FactList variant="intro" items={facts} />
    </Page>
  );
}
