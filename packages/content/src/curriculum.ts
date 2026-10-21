// The BSc Electrical Engineering program at TU/e, as scheduled: three years, four quartiles each. Course names follow
// the TU/e catalog. A course that spans two quartiles is listed with its credits in the first and as "continued" in
// the second (`continues: true`, no name or credits: both come from the first listing).
import { z } from 'zod';
import { range } from './dates.ts';

const Course = z.union([
  z.object({
    code: z.string(),
    name: z.string(),
    /** core, elective, impact of technology, career program, BEP … */
    type: z.string(),
    /** Credits in ECTS; omitted for a course without credits (the career program). */
    ects: z.number().int().positive().optional(),
    /** For a course that runs over two quartiles: "Q1 – Q2". */
    spans: z.string().optional(),
  }).strict(),
  z.object({ code: z.string(), continues: z.literal(true) }).strict(),
]);

const Year = z.object({
  n: z.number().int(),
  dates: range,
  /** completed, in progress (credits planned), planned. */
  state: z.enum(['completed', 'in progress', 'planned']),
  quartiles: z.array(z.object({ state: z.enum(['passed', 'enrolled', 'planned']), courses: z.array(Course).min(1) })).length(4),
});
export type Year = z.infer<typeof Year>;
export type Course = z.infer<typeof Course>;

export const curriculum = z.array(Year).parse([
  {
    n: 1, dates: { from: '2025', to: '2026' }, state: 'completed',
    quartiles: [
      { state: 'passed', courses: [
        { code: '5EWC0', name: 'Programming and engineering challenge', type: 'core', ects: 10, spans: 'Q1 – Q2' },
        { code: '2WBB0', name: 'Calculus, variant 2', type: 'core', ects: 5 },
        { code: '5EPC0', name: 'Circuits', type: 'core', ects: 5 },
      ] },
      { state: 'passed', courses: [
        { code: '5EWC0', continues: true },
        { code: '5ESF0', name: 'Signals and systems', type: 'core', ects: 5 },
        { code: '5EZA0', name: 'Mathematics 1', type: 'core', ects: 5 },
      ] },
      { state: 'passed', courses: [
        { code: '5ECD0', name: 'Electronic circuits 1', type: 'core', ects: 5 },
        { code: '5EIC0', name: 'Computer architecture', type: 'core', ects: 5 },
        { code: '5EPD0', name: 'Physics for EE', type: 'core', ects: 5 },
        { code: 'SMFA00', name: 'MyFuture activities', type: 'career program' },
      ] },
      { state: 'passed', courses: [
        { code: '5EID0', name: 'Engineering challenge for Venus', type: 'core', ects: 5 },
        { code: '5ETC0', name: 'Communication 1', type: 'core', ects: 5 },
        { code: '5EZB0', name: 'Mathematics 2', type: 'core', ects: 5 },
      ] },
    ],
  },
  {
    n: 2, dates: { from: '2026', to: '2027' }, state: 'in progress',
    quartiles: [
      { state: 'enrolled', courses: [
        { code: '5ECE0', name: 'Electronic circuits 2', type: 'core', ects: 5 },
        { code: '5EPF0', name: 'Electromagnetics 1', type: 'core', ects: 5 },
        { code: '5XTA0', name: 'Telecommunications systems', type: 'elective', ects: 5 },
      ] },
      { state: 'enrolled', courses: [
        { code: '0LVX30', name: 'ITEC engineering ethics', type: 'impact of technology', ects: 5 },
        { code: '5EWD0', name: 'Electrical power systems for EE', type: 'core', ects: 5 },
        { code: '5XCD0', name: 'Electronic circuits 3', type: 'elective', ects: 5 },
      ] },
      { state: 'planned', courses: [
        { code: '34MLS', name: 'Machine learning in science', type: 'elective', ects: 5 },
        { code: '5EPG0', name: 'Introduction photonics', type: 'core', ects: 5 },
        { code: '5EZC0', name: 'Mathematics 3', type: 'core', ects: 5 },
        { code: '5XCC0', name: 'Biopotential and neural interface circuits', type: 'elective', ects: 5 },
      ] },
      { state: 'planned', courses: [
        { code: '4CBLW00', name: 'Multidisciplinary CBL', type: 'core', ects: 5 },
        { code: '5ESG0', name: 'Signal processing', type: 'core', ects: 5 },
        { code: '5ESH0', name: 'Control systems', type: 'core', ects: 5 },
      ] },
    ],
  },
  {
    n: 3, dates: { from: '2027', to: '2028' }, state: 'planned',
    quartiles: [
      { state: 'planned', courses: [
        { code: '0LVX40', name: 'ITEC engineering for society', type: 'impact of technology', ects: 5 },
        { code: '5EWF0', name: 'Electromechanics 1', type: 'core', ects: 5 },
        { code: '5XPG0', name: 'Semiconductor technology', type: 'elective', ects: 5 },
      ] },
      { state: 'planned', courses: [
        { code: '5EPB0', name: 'Electromagnetics 2', type: 'core', ects: 5 },
        { code: '5XIF0', name: 'Neuro computation', type: 'elective', ects: 5 },
      ] },
      { state: 'planned', courses: [
        { code: '5XEC0', name: 'Final bachelor project', type: 'BEP', ects: 10, spans: 'Q3 – Q4' },
        { code: '5ETD0', name: 'Communication 2', type: 'core', ects: 5 },
        { code: '5XTC0', name: 'Components in wireless technologies', type: 'elective', ects: 5 },
      ] },
      { state: 'planned', courses: [
        { code: '5XEC0', continues: true },
        { code: '5XPD0', name: 'High-speed electronic-photonic devices', type: 'elective', ects: 5 },
      ] },
    ],
  },
]);

/** A year's credits: every listed course once (a continued course counts in its first quartile only). */
export function yearEcts(y: Year): number {
  return y.quartiles.flatMap((q) => q.courses).reduce((sum, c) => sum + ('ects' in c ? (c.ects ?? 0) : 0), 0);
}

/** The first listing of a course code in the program, for a "continued" entry. */
export function courseByCode(code: string): Extract<Course, { name: string }> {
  for (const y of curriculum) for (const q of y.quartiles) for (const c of q.courses) if ('name' in c && c.code === code) return c;
  throw new Error(`no course ${code}`);
}
