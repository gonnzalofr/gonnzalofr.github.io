// Who the site is about: name, contact, study. Facts here appear on many pages (the footer of every page, the home
// intro, the CV, Notes), so each is written once.
import { z } from 'zod';
import { calendar, range } from './dates.ts';
import { inline } from './inline.ts';

const Person = z.object({
  name: z.object({ given: z.string(), family: z.string() }),
  site: z.object({ url: z.url(), label: z.string() }),
  email: z.email(),
  links: z.array(z.object({ label: z.string(), href: z.url() })),
  cvPdf: z.object({ path: z.string(), label: z.string() }),
  city: z.string(),
  based: z.string(),
  /** The Contact paragraph in the footer: the confirmed internship line appears there, once per page. */
  contact: inline,
  /** When the site's content was last revised: the footer colophon and the CV's kicker. */
  revised: calendar,
  /** The home intro's last facts, after study, team and roles (which come from the data they describe). */
  facts: z.array(z.object({ label: z.string(), value: inline })),
  study: z.object({
    degree: z.string(),
    field: z.string(),
    short: z.string(),
    school: z.string(),
    schoolName: z.string(),
    dates: range,
    ects: z.number().int(),
    average: z.string(),
  }),
});

export const person = Person.parse({
  name: { given: 'Gonzalo', family: 'Ferrero Martín' },
  site: { url: 'https://gonnzalofr.github.io/', label: 'gonnzalofr.github.io' },
  email: 'g.ferrero.martin@student.tue.nl',
  links: [
    { label: 'github.com/gonnzalofr', href: 'https://github.com/gonnzalofr' },
    { label: 'linkedin.com/in/gonnzalofr', href: 'https://www.linkedin.com/in/gonnzalofr/' },
  ],
  cvPdf: { path: 'assets/Gonzalo-Ferrero-Martin-CV.pdf', label: 'PDF, one A4 page' },
  city: 'Eindhoven',
  based: 'Eindhoven · NL',
  contact:
    'Email is the quickest way to reach me; the code is on GitHub. EU citizen (Spanish and French), authorized to work in the US through 2028. Open to engineering internships in hardware, embedded systems, and FPGA work.',
  revised: '2026-10',
  facts: [
    { label: 'Languages', value: 'Spanish · English · French (B1)' },
    { label: 'Work auth', value: 'EU citizen · US to 2028' },
    { label: 'Schooling', value: 'Spain · Canada · United States' },
  ],
  study: {
    degree: 'BSc',
    field: 'Electrical Engineering',
    short: 'BSc EE',
    school: 'TU/e',
    schoolName: 'Eindhoven University of Technology',
    dates: { from: '2025-09', to: '2028-07' },
    ects: 180,
    average: '9.58 / 10',
  },
});

export const fullName = `${person.name.given} ${person.name.family}`;
