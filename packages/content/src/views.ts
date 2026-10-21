// The strings the pages print that follow from the data rather than being written: counts, date lines, kickers,
// status marks, the prev/next pair, the intro's facts. Every function returns inline copy (see inline.ts).
import { builds } from './builds.ts';
import { cv, type CvEntry } from './cv.ts';
import { curriculum, yearEcts, type Year } from './curriculum.ts';
import { span, when, type Range } from './dates.ts';
import { keep, link, nb, nc } from './inline.ts';
import { fullName, person } from './person.ts';
import { projects, type Project, type Status } from './projects.ts';
import { team } from './team.ts';

/** A status in words; "in progress" carries the small open square. Never a color. */
export const statusMark = (s: Status) => (s === 'in progress' ? `<span class="status">${s}</span>` : s);

/** Narrows a range to its years: "Sep 2025 – Jul 2028" → "2025 – 28". */
export const years = (r: Range): Range => ({ from: r.from.slice(0, 4), ...(r.to && { to: r.to === 'present' ? 'present' : r.to.slice(0, 4) }) });

const inProgress = <T extends { status?: Status }>(xs: T[]) => xs.filter((x) => x.status === 'in progress').length;

// ---- the person
export const study = person.study;
export const studyYears = when(years(study.dates));
export const homeKicker = `${nc(study.degree)} ${study.field} · ${nc(study.school)} · ${nb(studyYears)} · ${person.city}`;
export const footerStudy = `${study.short} · ${study.school} · ${nb(studyYears)}`;
export const revised = when({ from: person.revised }, 'long');

/** The home intro's facts: study, team, the roles current and next (by their dates), then the rest as written. */
export function introFacts(): { label: string; value: string }[] {
  const roles = cv.experience.filter((e) => e.fact);
  return [
    { label: 'Study', value: `${footerStudy} · first-year weighted average ${nb(study.average)}` },
    { label: 'Team', value: `${link(team.name, `~/${team.path}`)} · ${nb(when(team.dates))}` },
    ...roles.map((e) => ({ label: e.dates.from <= person.revised ? 'Now' : 'Next', value: `${e.fact} · ${nb(when(e.dates))}` })),
    ...person.facts,
  ];
}

// ---- projects and builds
const coursePrefix = (p: Project, mark: boolean) => (p.course ? `${mark ? nc('TU/e') : 'TU/e'} ${p.course} · ` : '');

/** Home band: stack — when — status. */
export const bandMeta = (p: Project) => `${p.band.stack} — ${coursePrefix(p, true)}${keep(when(p.dates))} — ${statusMark(p.status)}`;
/** Work index row: the "when" line. */
export const rowWhen = (p: Project) => `${coursePrefix(p, false)}${keep(when(p.dates))}`;
/** Case-study kicker: context · dates. */
export const caseKicker = (p: Project) => `${p.case.context} · ${keep(when(p.dates))}`;
/** Case-study Status cell. */
export const caseStatus = (p: Project) => `${statusMark(p.status)} — ${p.case.statusNote}`;
export const caseTitle = (p: Project) => `${p.name} — ${fullName}`;

/** Prev and next in case-study order, wrapping around. */
export function turn(slug: string): { prev: Project; next: Project } {
  const i = projects.findIndex((p) => p.slug === slug);
  if (i < 0) throw new Error(`no project "${slug}"`);
  const n = projects.length;
  return { prev: projects[(i - 1 + n) % n]!, next: projects[(i + 1) % n]! };
}

export const workSpan = when(span(projects.map((p) => p.dates)));
export const counts = {
  projects: projects.length,
  projectsInProgress: inProgress(projects),
  builds: builds.length,
  buildsInProgress: inProgress(builds),
};
export const homeWorkKicker = `${counts.projects} case studies · 1 team · ${counts.builds} smaller builds — pick one`;
export const workKicker = `${counts.projects} case studies · ${counts.builds} smaller builds · ${nb(workSpan)}`;
export const notFoundAllWork = `${counts.projects} case studies · ${counts.builds} smaller builds`;
export const projectsReading = `${counts.projects} projects · ${counts.projectsInProgress} in progress`;
export const buildsReading = `${counts.builds} builds · ${counts.buildsInProgress} in progress`;

/** Inline copy without its marks, for places that set it as plain text. */
export const plain = (s: string) => s.replace(/<[^>]+>/g, '');
/** A build's kicker on the work index (marks kept, status as a mark) and on home (plain). */
export const buildKicker = (b: (typeof builds)[number]) => [...b.tags, ...(b.status ? [statusMark(b.status)] : [])].join(' · ');
export const buildTag = (b: (typeof builds)[number]) => plain([...b.tags, ...(b.status ? [b.status] : [])].join(' · '));

// ---- team
export const teamBandMeta = `${team.department} — ${nb(when(team.dates))}`;
export const teamReading = `Team · ${nc(team.school)} · est. ${team.founded}`;

// ---- curriculum
export const curriculumReading = `${nc(study.degree)} ${study.field} · ${nc(study.school)} · ${study.ects} ECTS · ${nb(studyYears)}`;
export function yearLine(y: Year): string {
  const ects = yearEcts(y);
  return y.state === 'in progress' ? `in progress · ${ects} ECTS planned` : `${y.state} · ${ects} ECTS`;
}
export { curriculum };

// ---- CV
/** A CV date: written in full; a date to the day keeps its day, month and year together. */
export function cvDate(e: Pick<CvEntry, 'dates'>): string {
  const s = when(e.dates, 'cv');
  const to = e.dates.to;
  if (!to || to === 'present' || to.length < 10) return s;
  const [from, end] = s.split(' – ') as [string, string];
  return `${from} – ${nb(end)}`;
}
export const cvKicker = `Curriculum vitae · ${revised}`;
export const cvProjects = cv.projects.map((slug) => projects.find((p) => p.slug === slug)!);
export const educationReading = `${nb(when(span(cv.education.map((e) => e.dates)), 'cv'))} · ${cv.education.length} schools`;
export const cvProjectsReading = `${cvProjects.length} projects · ${nb(when(span(cvProjects.map((p) => p.dates))))}`;
export const experienceReading = nb(when(span(cv.experience.map((e) => e.dates)), 'cv'));
