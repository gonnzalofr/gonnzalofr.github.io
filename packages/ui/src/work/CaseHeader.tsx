// A case study's header: kicker (context · dates), the project's name, the deck, the lead figure (children), and the
// four metadata cells (role, stack, board, status).
import type { ReactNode } from 'react';
import { PageHeader } from '../layout/PageHeader.tsx';
import { MetaRow, type Labeled } from '../text/Lists.tsx';

export function CaseHeader({ kicker, name, deck, cells, children }: {
  kicker: ReactNode;
  name: string;
  deck: ReactNode;
  cells: Labeled[];
  children?: ReactNode;
}) {
  return (
    <PageHeader kicker={kicker} title={name} deck={deck}>
      {children}
      <MetaRow items={cells} />
    </PageHeader>
  );
}
