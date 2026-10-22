// What every case study takes from its project's data: the header (kicker, name, deck, the four metadata cells) and
// the prev/next links at the end, in case-study order.
import type { ReactNode } from 'react';
import { CaseHeader, Inline, Turn, type TurnTarget } from '@portfolio/ui';
import { views, type Project } from '@portfolio/content';

export function ProjectHeader({ project: p, children }: { project: Project; children: ReactNode }) {
  return (
    <CaseHeader
      kicker={<Inline html={views.caseKicker(p)} />}
      name={p.name}
      deck={<Inline html={p.case.deck} />}
      cells={[
        { label: 'Role', value: <Inline html={p.case.role} /> },
        { label: 'Stack', value: <Inline html={p.case.stack} /> },
        { label: 'Board', value: <Inline html={p.case.board} /> },
        { label: 'Status', value: <Inline html={views.caseStatus(p)} /> },
      ]}
    >
      {children}
    </CaseHeader>
  );
}

const target = (p: Project): TurnTarget => ({ href: `${p.slug}.html`, no: p.no, name: p.shortName, ground: p.ground });

export function ProjectTurn({ project }: { project: Project }) {
  const { prev, next } = views.turn(project.slug);
  return <Turn prev={target(prev)} next={target(next)} />;
}
