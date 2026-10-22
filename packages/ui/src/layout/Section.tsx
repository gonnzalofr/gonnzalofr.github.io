// A section of an index page: the rule, the reading (a quiet line of counts in the margin column) and the heading,
// then its content. Without a title it is only the band (the 404's list, the log's entries).
import type { ReactNode } from 'react';
import { Page } from './Page.tsx';

export function Section({ id, reading, title, children }: {
  id?: string;
  reading?: ReactNode;
  title?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Page variant="section" id={id}>
      {title !== undefined && (
        <>
          <hr className="sec__rule col-full" />
          <p className="sec__reading col-margin">{reading}</p>
          <h2 className="col-head">{title}</h2>
        </>
      )}
      {children}
    </Page>
  );
}
