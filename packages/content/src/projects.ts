// The four case studies, in case-study order (the numbering, the home bands, the work index and the prev/next cycle
// all follow this order). Each project is described once: its facts as data, and the copy each place on the site
// shows, side by side, so a change to a project is made in one file.
//
// Fact rules (from the dossier; check before changing): the HDMI serializer is a stub, so never say it drives a
// monitor; the frame testbench dumps a PPM and checks seven timing counts, it does not diff pixels; the HiFi player is
// a design study, stopped before any board was built; Rock Your Baby's heartbeat uses an adaptive exponential filter.
import { z } from 'zod';
import { groundNames, type Ground } from '@portfolio/tokens';
import { range } from './dates.ts';
import { inline } from './inline.ts';

export const status = z.enum(['in progress', 'complete', 'design only']);
export type Status = z.infer<typeof status>;

const Project = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  /** A short id for anchors to the project on other pages (#hdmi on the work index). */
  anchor: z.string().regex(/^[a-z0-9-]+$/),
  no: z.string().regex(/^\d\d$/),
  ground: z.enum(groundNames as [Ground, ...Ground[]]),
  /** The full name: case-study title, work index, 404. */
  name: z.string(),
  /** The name on the home band and in the prev/next links. */
  shortName: z.string(),
  /** <meta name="description"> of the case study. */
  description: z.string(),
  dates: range,
  status,
  /** The TU/e course code, for course projects. */
  course: z.string().optional(),
  /** Home: one band per project. */
  band: z.object({ line: inline, stack: z.string() }),
  /** Work index: one row per project. */
  row: z.object({ deck: inline, notice: inline, stack: z.string() }),
  /** The case study's header: kicker (followed by the dates), deck, and the four metadata cells. */
  case: z.object({
    context: inline,
    deck: inline,
    role: inline,
    stack: z.string(),
    board: inline,
    /** Follows the status in the Status cell, after a dash. */
    statusNote: inline,
  }),
  /** 404: the list of places to go. */
  notFound: z.object({ stack: z.string() }),
  /** CV: one entry under Projects. */
  cv: z.object({ role: inline, text: inline }),
});
export type Project = z.infer<typeof Project>;

export const projects = z.array(Project).parse([
  {
    slug: 'hdmi-dvi-transmitter',
    anchor: 'hdmi',
    no: '01',
    ground: 'black',
    name: 'HDMI / DVI transmitter',
    shortName: 'HDMI / DVI transmitter',
    description: 'A DVI video pipeline written from scratch in Verilog for the PYNQ-Z2: 640×480 timing, TMDS encoder, and self-checking XSIM testbenches.',
    dates: { from: '2026-07', to: 'present' },
    status: 'in progress',
    band: {
      line: 'A DVI video pipeline in Verilog: timing, pattern and TMDS encoder verified in simulation; the 10:1 serializer is being written.',
      stack: 'Verilog · XSIM · PYNQ-Z2',
    },
    row: {
      deck: 'A DVI video pipeline in Verilog: timing, pattern, TMDS encoder; serializer in progress.',
      notice: '<span class="mono">decode(encode(d)) == d</span> on every symbol, against an independent decoder.',
      stack: 'Verilog · XSIM · PYNQ-Z2',
    },
    case: {
      context: 'Personal project',
      deck: 'A DVI transmitter written from scratch in Verilog, verified in simulation before it ever touches a board.',
      role: 'Everything — personal project',
      stack: 'Verilog · XSIM · Vivado',
      board: 'PYNQ-Z2 (Zynq-7020)',
      statusNote: 'timing · pattern and encoder verified in simulation; serializer and board bring-up in progress',
    },
    notFound: { stack: 'Verilog · XSIM' },
    cv: {
      role: 'HDMI / DVI transmitter — Verilog on PYNQ-Z2 (Zynq-7020)',
      text: 'Personal project. A DVI pipeline from scratch: <span class="nb">640×480</span> timing, pattern generator and TMDS 8b/10b encoder, verified by self-checking XSIM testbenches — an independent decoder on every symbol, a full frame dumped to a PPM file and seven timing counts checked against constants. Serializer and board bring-up in progress.',
    },
  },
  {
    slug: 'venus-rover',
    anchor: 'venus',
    no: '02',
    ground: 'sand',
    name: 'Venus rover',
    shortName: 'Venus rover',
    description: 'Run-on-boot C firmware for a PYNQ-Z2 rover that hunts colored cubes with three ToF sensors and shares finds with a partner robot over MQTT.',
    dates: { from: '2026' },
    status: 'complete',
    course: '5EID0',
    band: {
      line: 'Run-on-boot C firmware for a PYNQ-Z2 rover that hunts colored cubes and shares every find with a partner over MQTT; a cube counts only after two of six reads agree within <span class="nb">5 cm</span>.',
      stack: 'C · Python · PYNQ-Z2 · MQTT',
    },
    row: {
      deck: 'Run-on-boot C firmware for a PYNQ-Z2 rover that hunts colored cubes and coordinates with a partner over MQTT.',
      notice: 'Cubes confirmed by a 6-read burst vote, <span class="nb">≥2 within 5 cm</span>.',
      stack: 'C · Python · PYNQ-Z2 · ESP32',
    },
    case: {
      context: '<span class="nc">TU/e</span> 5EID0 · Group 10',
      deck: 'Run-on-boot firmware for a rover that hunts colored cubes, maps terrain, and shares every find with its partner.',
      role: 'Firmware + mission-control tooling · 5EID0 · Group 10',
      stack: 'C · Python · MQTT · ESP32-C3',
      board: 'PYNQ-Z2 + ESP32',
      statusNote: 'course project · 2026',
    },
    notFound: { stack: 'C · Python · MQTT' },
    cv: {
      role: 'Venus rover — autonomous dual-robot firmware, TU/e 5EID0',
      text: 'Run-on-boot C firmware for a PYNQ-Z2 rover: hunts colored cubes with three VL53L0X ToF sensors, dead-reckons its position, shares finds with a partner robot over MQTT (UART → ESP32 → broker); four-state autopilot, boundary-evade interrupt, <span class="nb">6</span>-read burst vote on every detection. Also the Python mission-control relay, logger and live map.',
    },
  },
  {
    slug: 'hifi-player',
    anchor: 'hifi',
    no: '03',
    ground: 'paper',
    name: 'Battery-powered HiFi player',
    shortName: 'HiFi player',
    description: 'A battery-powered HiFi player on a 4-layer PCB: ESP32-S3R8, Bluetooth or microSD source, I2S DAC. A design study: schematic and three layout revisions, never built or bench-tested.',
    dates: { from: '2026-05', to: '2026-10' },
    status: 'design only',
    band: {
      line: 'A battery-powered music player: schematic, 4-layer PCB, power path and ESP32-S3R8 firmware; Bluetooth or microSD into an I2S DAC. A design study, stopped before any board was built or bench-tested.',
      stack: 'PCB layout · C · ESP32-S3R8',
    },
    row: {
      deck: 'Schematic, 4-layer PCB, power path and ESP32-S3R8 firmware; Bluetooth or microSD into an I2S DAC.',
      notice: 'A design study, stopped before any board was built or bench-tested.',
      stack: 'PCB layout · C · ESP32-S3R8',
    },
    case: {
      context: 'Personal design study',
      deck: 'A battery-powered music player designed end to end: schematic, four-layer board, power path, firmware.',
      role: 'Everything — personal project',
      stack: 'PCB layout · C · ESP32-S3R8',
      board: 'ESP32-S3R8 · 4-layer PCB',
      statusNote: 'not built or bench-tested',
    },
    notFound: { stack: 'PCB layout · ESP32-S3R8' },
    cv: {
      role: 'Battery-powered HiFi music player — PCB design',
      text: 'Personal design study, not built. Schematic capture, 4-layer PCB layout in three revisions and power path around an ESP32-S3R8; audio from Bluetooth or microSD through a MUX into an I2S DAC.',
    },
  },
  {
    slug: 'rock-your-baby',
    anchor: 'ryb',
    no: '04',
    ground: 'walnut',
    name: 'Rock Your Baby',
    shortName: 'Rock Your Baby',
    description: 'A four-board baby-monitoring cradle on PYNQ-Z2s: heartbeat, crying, decision-making and actuator subsystems talking over UART, in C.',
    dates: { from: '2025', to: '2026' },
    status: 'complete',
    course: '5EWC0',
    band: {
      line: 'A baby-monitoring cradle across four PYNQ-Z2 boards, one subsystem each, talking over UART.',
      stack: 'C · libpynq',
    },
    row: {
      deck: 'A distributed baby-monitoring cradle: four PYNQ-Z2 subsystems over UART.',
      notice: 'RMS with noise-floor subtraction on a pthread capture loop.',
      stack: 'C · libpynq · PYNQ-Z2',
    },
    case: {
      context: '<span class="nc">TU/e</span> 5EWC0 · first year',
      deck: 'A baby-monitoring cradle split across four boards that talk over UART.',
      role: 'Team project · 5EWC0 · first year',
      stack: 'C · libpynq',
      board: 'PYNQ-Z2 ×4',
      statusNote: 'first-year project · <span class="nb">2025 – 26</span>',
    },
    notFound: { stack: 'C · libpynq' },
    cv: {
      role: 'Rock Your Baby — distributed baby-monitoring cradle, TU/e 5EWC0',
      text: 'Four PYNQ-Z2 subsystems in C talking over UART — heartbeat, crying, decision-making, actuator: ADC sampling, an adaptive exponential filter and RMS with noise-floor subtraction, pthreads, two PWM channels for the rocking motion.',
    },
  },
]);

export function project(slug: string): Project {
  const p = projects.find((x) => x.slug === slug);
  if (!p) throw new Error(`no project "${slug}"`);
  return p;
}
