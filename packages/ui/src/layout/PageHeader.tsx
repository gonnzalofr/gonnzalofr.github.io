// The head of every page but home: kicker, the one h1, the deck, then whatever the page leads with (a figure, the
// metadata row) as children.
import type { ReactNode } from 'react';
import { Page } from './Page.tsx';
import { Deck, Kicker } from '../text/Voice.tsx';

export function PageHeader({ kicker, title, deck, children }: {
  kicker: ReactNode;
  title: ReactNode;
  deck: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Page variant="case">
      <Kicker>{kicker}</Kicker>
      <h1 className="col-head">{title}</h1>
      <Deck>{deck}</Deck>
      {children}
    </Page>
  );
}
