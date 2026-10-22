// The HDMI / DVI transmitter: a DVI pipeline in Verilog, verified in simulation; the serializer is still a stub.
import { Checklist, H2, MarginNote, Mono, Nb, Page, Prose, ProseBlock, PullQuote } from '@portfolio/ui';
import { project } from '@portfolio/content';
import { ControlCodewords, LineTiming, Pipeline, SimulatedFrame, TmdsEncoder } from '../../figures/hdmi-dvi-transmitter';
import { screen } from '../screen';
import { ProjectHeader, ProjectTurn } from './case';

const p = project('hdmi-dvi-transmitter');

function HdmiDviTransmitter() {
  return (
    <main id="main">
      <ProjectHeader project={p}>
        <LineTiming />
      </ProjectHeader>

      <Page>
        <ProseBlock>
          <H2 id="four-stages">Four stages</H2>
          <MarginNote>25.175 MHz pixel clock · 800×525 total</MarginNote>
          <Prose>The transmitter is a DVI video pipeline for the HDMI connector on a PYNQ-Z2, written from scratch in Verilog and started in July 2026 — plain DVI, with no audio and no data islands: three TMDS channels and a clock. It has four stages: a parameterized video timing generator, a pattern generator, a TMDS <Mono>8b/10b</Mono> encoder, and a <Nb>10:1</Nb> serializer driving differential outputs. The first three exist and pass their testbenches; the serializer’s port list exists, and its body is still being written.</Prose>
          <Prose>The timing generator is parameterized on the eight standard numbers and derives the rest as localparams. It produces <Nb>640×480</Nb> active pixels inside an <Nb>800×525</Nb> total frame — <Nb>16</Nb> front porch, <Nb>96</Nb> sync and <Nb>48</Nb> back porch clocks on every line; <Nb>10</Nb>, <Nb>2</Nb> and <Nb>33</Nb> lines around every frame — at a <Nb>25.175 MHz</Nb> pixel clock, and outputs hsync, vsync, de and 12-bit x/y counters. The pattern generator is deliberately simple for now: a horizontal red ramp, <Mono>red = x mod 256</Mono>, green and blue zero, black outside de.</Prose>

          <H2 id="encoder">The encoder</H2>
          <Prose>TMDS encoding is done in two stages, kept separate in the RTL so each can be reasoned about alone. The first counts the ones in the byte and chooses XOR or XNOR chaining to minimize transitions, flagging the choice in <Mono>bit 8</Mono>. The second is a DC-balance stage: it keeps a signed running disparity, <Mono>cnt_r</Mono>, and decides whether to invert the eight data bits to pull it back toward zero, flagging that in <Mono>bit 9</Mono>.</Prose>
          <Prose>During blanking the encoder ignores the data, emits one of the four DVI control codewords selected by <Mono>c0</Mono>/<Mono>c1</Mono> (Fig.&nbsp;2), and resets the disparity to zero. The disparity arithmetic is where I expected mistakes, so that is where the testbench looks hardest.</Prose>

          <ControlCodewords />

          <H2 id="try">Try the encoder</H2>
          <Prose>Fig.&nbsp;3 is the encoder itself, ported line for line from the RTL to JavaScript so it can be driven from the page. Pick a byte and the figure shows what each stage does with it: the ones count and the XOR or XNOR choice, the nine-bit <Mono>q_m</Mono>, the DC-balance decision with the reason the RTL used, and the ten bits that leave the encoder, drawn <Mono>q[0]</Mono> first as in Fig.&nbsp;2. Set a prior disparity to reach the inversion branch, or feed the ramp to watch <Mono>cnt_r</Mono> accumulate over a video line the way it does for the red-ramp pattern, reset to zero in blanking. Under the figure is a self-check that runs in the reader’s browser every time this page loads: all <Nb>256</Nb> bytes through the encoder and back through a decoder written from the testbench’s, with the transition count and the disparity bound checked over one full line.</Prose>

          <TmdsEncoder />

          <PullQuote kicker="verification"><Mono>decode(encode(d)) == d</Mono>, on every symbol, against a decoder written independently.</PullQuote>

          <H2 id="testbenches">What the testbenches check</H2>
          <MarginNote>10,816 data symbols per run · 4 properties each</MarginNote>
          <Prose>The encoder has a self-checking XSIM testbench that checks four properties on every symbol: round trip — <Mono>decode(encode(d)) == d</Mono> against an independently written decoder; at most five transitions per data symbol; an independently accumulated running disparity, kept from the ten transmitted bits, that matches the encoder’s own <Mono>cnt_r</Mono> every cycle; and a bounded <Mono>|disparity|</Mono>, with the bench’s limit at <Nb>12</Nb>. Control periods are checked against the four spec codewords. One run covers <Nb>10,816</Nb> data symbols: every byte value ascending and descending, each value held for eight cycles to provoke disparity drift, long runs of four constants, and forty random bursts with blanking between them.</Prose>
          <Prose>A second testbench drives the timing generator and the pattern generator together, waits for de at <Mono>x = 0, y = 0</Mono>, and dumps the full <Nb>640×480</Nb> frame from simulation to a PPM file so it can be checked numerically rather than by eye. Alongside it, it checks seven timing counts against constants: active pixels per frame, active lines, hsync pulses, total hsync and vsync cycles, and the length of every de run and every hsync pulse. Fig.&nbsp;4 is that frame, placed inside the <Nb>800×525</Nb> timing envelope it was generated in.</Prose>

          <SimulatedFrame />

          <Prose>Fig.&nbsp;5 lays the pipeline out with its coverage. The frame testbench brackets the first two stages, the encoder testbench the third, and the serializer is drawn dashed because its body is not yet written.</Prose>

          <Pipeline />

          <H2 id="not-done">What is not done</H2>
          <Prose>Timing, pattern and encoder are verified in simulation. The <Nb>10:1</Nb> serializer — port list written, body not yet — and board bring-up are in progress. Nothing has been displayed on a monitor, and the page will say so until it has.</Prose>
          <Checklist items={[
            { state: 'done', text: 'timing generator' },
            { state: 'done', text: 'pattern generator' },
            { state: 'done', text: 'TMDS encoder + self-checking testbench' },
            { state: 'in progress', text: '10:1 serializer' },
            { state: 'in progress', text: 'board bring-up' },
          ]} />
        </ProseBlock>

        <ProjectTurn project={p} />
      </Page>
    </main>
  );
}

export default screen(HdmiDviTransmitter);
