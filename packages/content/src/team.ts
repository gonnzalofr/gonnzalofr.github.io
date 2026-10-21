// Student Team Daedalus: the home band, the Notes section, the intro's Team fact and the CV's experience entry.
// (The owner does not name his own board on the team; never add one.)
import { z } from 'zod';
import { groundNames, type Ground } from '@portfolio/tokens';
import { range } from './dates.ts';
import { inline } from './inline.ts';

const Team = z.object({
  name: z.string(),
  /** Where the site's own page about the team is, from the site root. */
  path: z.string(),
  ground: z.enum(groundNames as [Ground, ...Ground[]]),
  url: z.url(),
  urlLabel: z.string(),
  school: z.string(),
  founded: z.number().int(),
  department: z.string(),
  role: z.string(),
  dates: range,
  /** The one line on the home band. */
  line: inline,
  /** The aircraft's numbers, beside the band's text. */
  aircraft: z.array(z.object({ label: z.string(), value: inline })),
});

export const team = Team.parse({
  name: 'Student Team Daedalus',
  path: 'notes.html#daedalus',
  ground: 'dusk',
  url: 'https://www.teamdaedalus.eu/',
  urlLabel: 'teamdaedalus.eu',
  school: 'TU/e',
  founded: 2021,
  department: 'Electrical / Embedded Systems',
  role: 'PCB design · embedded programming · bench verification',
  dates: { from: '2026-01', to: '2026-10-14' },
  line: 'PCB design, embedded programming and bench verification for a solar-powered autonomous aircraft for wildfire surveillance.',
  aircraft: [
    { label: 'Aircraft', value: 'Lapyx 4' },
    { label: 'Wingspan', value: '4.0 m' },
    { label: 'Mass', value: '9.2 kg' },
    { label: 'Solar', value: '<span class="nb">225 W</span> across the upper wing' },
    { label: 'Endurance', value: 'about <span class="nb">7 h</span> on battery alone, estimated' },
    { label: 'First flight', value: '25 Feb 2026' },
  ],
});
