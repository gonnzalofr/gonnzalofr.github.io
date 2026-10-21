// The CV: education, experience, skills and languages. Its Projects section is built from projects.ts in the order
// listed here, newest first. The page is also printed to the one-page PDF (re-print it when anything here changes).
import { z } from 'zod';
import { range } from './dates.ts';
import { inline } from './inline.ts';
import { projects } from './projects.ts';
import { team } from './team.ts';

const Entry = z.object({
  dates: range,
  role: inline,
  text: inline,
  /** The short label when the entry is also one of the home intro's facts ("Now" or "Next", by its dates). */
  fact: z.string().optional(),
});
const Row = z.object({ label: inline, text: inline });

const Cv = z.object({
  education: z.array(Entry),
  projects: z.array(z.string()),
  experience: z.array(Entry),
  skills: z.object({ reading: z.string(), rows: z.array(Row), parts: z.string() }),
  languages: z.object({ reading: z.string(), rows: z.array(Row) }),
});
export type CvEntry = z.infer<typeof Entry>;

export const cv = Cv.parse({
  education: [
    {
      dates: { from: '2025-09', to: '2028-07' },
      role: 'Eindhoven University of Technology (TU/e)',
      text: 'Eindhoven — BSc Electrical Engineering, expected July 2028. First-year weighted average <span class="nb">9.58 / 10</span>.',
    },
    {
      dates: { from: '2024-09', to: '2025-06' },
      role: 'Harrison High School',
      text: 'Harrison, New York — Graduated Summa Cum Laude. <span class="nb">ACT 35</span>.',
    },
    {
      dates: { from: '2023-09', to: '2024-06' },
      role: 'Humanitas Bilingual School',
      text: 'Tres Cantos, Madrid — Honorable mentions in Mathematics, Physics, and Chemistry.',
    },
  ],
  projects: ['hdmi-dvi-transmitter', 'hifi-player', 'venus-rover', 'rock-your-baby'],
  experience: [
    {
      dates: { from: '2026-09', to: '2027-06' },
      role: 'Student Mentor, First-Year Electrical Engineering',
      text: 'TU/e — current. Selected to guide incoming Electrical Engineering students through coursework and the transition to university.',
      fact: 'Student Mentor, first-year EE',
    },
    {
      dates: { from: '2027-04', to: '2027-07' },
      role: 'Student Assistant &amp; Course Reviewer, Communication 1',
      text: 'TU/e — upcoming. Selected as one of two students to review and catalog the course’s content and support the lab sessions.',
      fact: 'Student Assistant &amp; Course Reviewer, Communication 1',
    },
    {
      dates: team.dates,
      role: `Electrical Engineer, ${team.name}`,
      text: `<a href="~/${team.path}">${team.name}</a>, ${team.school} — a solar-powered autonomous aircraft for wildfire surveillance. PCB design, embedded programming and bench verification of the aircraft’s electronics, in the ${team.department} department.`,
    },
  ],
  skills: {
    reading: 'HDL, code, tools, hardware',
    rows: [
      { label: 'HDL &amp; code', text: 'Verilog, C, Python, MATLAB, engineering mathematics.' },
      { label: 'Tools', text: 'Vivado, XSIM, Verilator, Altium, KiCad, EasyEDA, LTspice.' },
      { label: 'Hardware', text: 'Analog and digital circuit design, 4-layer PCB layout, embedded systems, bring-up and bench debug.' },
    ],
    parts: 'PYNQ-Z2 (Zynq-7020) · ESP32 / ESP32-S3R8 · VL53L0X ToF · TCS3200 color sensor · TCRT5000 IR · NTC thermistors · stepper drivers · I2S DACs',
  },
  languages: {
    reading: 'Three languages · EU citizen',
    rows: [
      { label: 'Spoken', text: 'Spanish, native · English, fluent · French, B1' },
      { label: 'Citizenship', text: 'Spanish and French (EU) · authorized to work in the United States through 2028' },
    ],
  },
});

for (const slug of cv.projects) if (!projects.some((p) => p.slug === slug)) throw new Error(`cv.projects: no project "${slug}"`);
