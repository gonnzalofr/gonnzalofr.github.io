// The case-study pages, found rather than listed: every file in src/screens/work/ that exports the `slug` of its
// project (and the page as its default export) is that project's case study. work/[slug].astro renders them, so a new
// project needs no route of its own. A project in packages/content without such a file fails the build.
import type { ComponentType, ReactNode } from 'react';
import { projects } from '@portfolio/content';
import type { Site } from '@portfolio/ui';

/** `encoder` and `board` are the islands a route passes in through slots (see work/[slug].astro). */
type CaseScreen = ComponentType<{ site: Site; encoder?: ReactNode; board?: ReactNode }>;

const modules = import.meta.glob<{ slug?: string; default: CaseScreen }>('../screens/work/*.tsx', { eager: true });

const found = Object.fromEntries(Object.values(modules).filter((m) => m.slug).map((m) => [m.slug!, m.default]));

for (const p of projects) {
  if (!found[p.slug]) throw new Error(`no case study for ${p.slug}: add src/screens/work/<Name>.tsx that exports slug = '${p.slug}' and the page as its default`);
}

export const cases: Record<string, CaseScreen> = found;
