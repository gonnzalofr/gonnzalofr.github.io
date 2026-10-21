// The smaller builds: coursework and side projects without a case study. The home page lists them as a line of links;
// the work index gives each a paragraph, at #<id>.
import { z } from 'zod';
import { inline } from './inline.ts';
import { status } from './projects.ts';

const Build = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: inline,
  /** Languages and the course code, in the order they are shown; inline marks allowed ("libpynq" is set as written). */
  tags: z.array(inline).min(1),
  /** Only when it is not complete. */
  status: status.optional(),
  body: inline,
});
export type Build = z.infer<typeof Build>;

export const builds = z.array(Build).parse([
  {
    id: 'counter',
    title: '32-bit counter from gate logic',
    tags: ['Verilog', '5EIC0'],
    body: 'Half-adders from an XOR and an AND, full-adders from two half-adders, a 32-bit ripple adder from <span class="nb">32</span> of those, and a clocked counter with enable and reset on top, interfaced to an AXI4-Lite bus so a processor can configure it. Simulated, then run on the PYNQ board.',
  },
  {
    id: 'edurv',
    title: 'EduRV RISC-V labs',
    tags: ['Verilog', 'C', '5EIC0'],
    body: 'Labs on EduRV, an educational RISC-V core: simulating it in Verilator, working with it in Vivado, and writing C code that runs on the core itself.',
  },
  {
    id: 'i2c',
    title: 'I²C master',
    tags: ['Verilog'],
    status: 'in progress',
    body: 'A reusable configuration block for the HDMI transmitter — reading the sink’s EDID over DDC — and, later, an audio DAC. So far only the module interface exists: address, data and an enable strobe in; SCL and a bidirectional SDA out. Body and testbench still to be written.',
  },
  {
    id: 'plotter',
    title: 'Function plotter',
    tags: ['C', '<span class="nc">libpynq</span>'],
    body: 'An oscilloscope-style plotter that draws equations, with axes, on the <span class="nb">240×240</span> TFT: sine and cosine, alone or together, from 360-entry lookup tables, scaled by an adjustable ratio.',
  },
  {
    id: 'snake',
    title: 'Snake',
    tags: ['C', '<span class="nc">libpynq</span>'],
    body: 'A tick-based game loop: the snake moves every <span class="nb">200 ms</span>, but the loop polls the buttons every <span class="nb">10 ms</span>, keeps the last valid direction and rejects a <span class="nb">180°</span> reversal, so input feels instant.',
  },
]);
