// The HDMI / DVI transmitter's drawings, the TMDS encoder's figure (around its island) and the XSIM frame.
// Waveforms are drawn to scale from the timing numbers and the encoder's output; nothing here is generated.
import type { ReactNode } from 'react';
import { ArrowMarker, Diagram, Envelope, EnvelopeLabel, Figure, ScaleBar } from '@portfolio/ui';

export function LineTiming() {
  return (
    <Figure placement="bleed" caption="One line of 640×480 @ 25.175 MHz: 640 active, 16 front porch, 96 sync, 48 back porch; 800 clocks in all. Drawn to scale; hsync low from clock 656 to 751.">
      <Diagram viewBox="0 0 800 120" fit="start" title="One horizontal line of 640 by 480 video timing, drawn to scale: de is high for 640 clocks and low for 160; hsync is low from clock 656 to 751 inside the 800-clock line.">
        <g className="s-axis" strokeDasharray="2 3"><path d="M640 16 V104" /><path d="M656 16 V104" /><path d="M752 16 V104" /></g>
        <path className="crisp" d="M0 28 H640 V48 H800" />
        <path className="crisp s-ramp" d="M0 76 H656 V96 H752 V76 H800" />
        <text className="t-ink" x="4" y="22">de</text>
        <text className="t-ink" x="4" y="70">hsync</text>
        <text x="320" y="116" textAnchor="middle">active 640</text>
        <text x="648" y="116" textAnchor="middle">16</text>
        <text x="704" y="116" textAnchor="middle">sync 96</text>
        <text x="776" y="116" textAnchor="middle">48</text>
      </Diagram>
    </Figure>
  );
}

export function ControlCodewords() {
  return (
    <Figure placement="right" caption="The four control codewords the encoder emits during blanking, drawn q[0] first as transmitted; written q[9:0] as in the DVI 1.0 spec. Checked against the spec by the testbench.">
      <Diagram viewBox="0 0 800 176" title="The four DVI control codewords as stepped waveforms, drawn in transmission order with q[0] first: c1c0 = 00, 01, 10 and 11, each written beside its waveform as q[9:0].">
        <text x="130" y="14">transmitted q[0] → q[9]</text>
        <text x="520" y="14">q[9:0] as written</text>

        <text className="t-ink" x="0" y="44">c1c0 = 00</text>
        <path className="s-rule" d="M130 49 V53 M166 49 V53 M202 49 V53 M238 49 V53 M274 49 V53 M310 49 V53 M346 49 V53 M382 49 V53 M418 49 V53 M454 49 V53 M490 49 V53" />
        <path className="crisp" d="M130 49 H202 V29 H238 V49 H274 V29 H310 V49 H346 V29 H382 V49 H418 V29 H490" />
        <text className="t-ink" x="520" y="44">1101010100</text>

        <text className="t-ink" x="0" y="82">c1c0 = 01</text>
        <path className="s-rule" d="M130 87 V91 M166 87 V91 M202 87 V91 M238 87 V91 M274 87 V91 M310 87 V91 M346 87 V91 M382 87 V91 M418 87 V91 M454 87 V91 M490 87 V91" />
        <path className="crisp" d="M130 67 H202 V87 H238 V67 H274 V87 H310 V67 H346 V87 H382 V67 H418 V87 H490" />
        <text className="t-ink" x="520" y="82">0010101011</text>

        <text className="t-ink" x="0" y="120">c1c0 = 10</text>
        <path className="s-rule" d="M130 125 V129 M166 125 V129 M202 125 V129 M238 125 V129 M274 125 V129 M310 125 V129 M346 125 V129 M382 125 V129 M418 125 V129 M454 125 V129 M490 125 V129" />
        <path className="crisp" d="M130 125 H202 V105 H238 V125 H274 V105 H310 V125 H346 V105 H382 V125 H418 V105 H454 V125 H490" />
        <text className="t-ink" x="520" y="120">0101010100</text>

        <text className="t-ink" x="0" y="158">c1c0 = 11</text>
        <path className="s-rule" d="M130 163 V167 M166 163 V167 M202 163 V167 M238 163 V167 M274 163 V167 M310 163 V167 M346 163 V167 M382 163 V167 M418 163 V167 M454 163 V167 M490 163 V167" />
        <path className="crisp" d="M130 143 H202 V163 H238 V143 H274 V163 H310 V143 H346 V163 H382 V143 H418 V163 H454 V143 H490" />
        <text className="t-ink" x="520" y="158">1010101011</text>
      </Diagram>
    </Figure>
  );
}

/** The encoder demo's figure. Its body is the TmdsEncoder island (@portfolio/ui/islands/tmds-encoder), which the route
 *  renders and the page passes in, since only an Astro route can hydrate a component; it keeps these two ids. */
export function TmdsEncoderFigure({ children }: { children: ReactNode }) {
  return (
    <Figure
      placement="bleed"
      id="fig-tmds"
      captionId="fig-tmds-cap"
      caption="The encoder, ported from the RTL: the input byte, q_m after the transition stage and q_out after DC balancing, drawn q[0] first as transmitted, written msb first. Below, the running disparity cnt_r at ±8 full scale against the input byte d: at rest, the first 256-symbol pass of the ramp from cnt_r = 0; after a slider moves, this one symbol before and after, drawn at its byte."
    >
      {children}
    </Figure>
  );
}

/** The frame the timing/pattern testbench dumped from XSIM, inside the 800×525 frame it was generated in. */
export function SimulatedFrame() {
  return (
    <Figure placement="bleed" variant="plate" captionId={false} caption="The frame the timing/pattern testbench dumped from XSIM to PPM, placed inside the 800×525 frame it was generated in; red is x mod 256. Seven timing counts checked against constants.">
      <Envelope>
        <img src="../assets/hdmi-frame-640x480.png" width="640" height="480" loading="eager" alt="Simulated 640 by 480 frame: three horizontal red ramps from black to red, repeating every 256 pixels." />
        <EnvelopeLabel side="right">blanking 160</EnvelopeLabel>
        <EnvelopeLabel side="bottom">blanking 45 lines<span className="envelope__x"> (10 / 2 / 33)</span></EnvelopeLabel>
      </Envelope>
      <ScaleBar length={800} marks={[{ at: 0 }, { at: 256, repeat: true }, { at: 512, repeat: true }, { at: 640 }, { at: 800 }]} />
    </Figure>
  );
}

export function Pipeline() {
  return (
    <Figure placement="right" caption="Pipeline. Three stages verified in simulation; the 10:1 serializer is being written.">
      <Diagram viewBox="0 0 800 135" title="Pipeline of four stages: timing generator, pattern generator, three TMDS encoders and a 10:1 serializer drawn dashed and marked in progress, feeding the TMDS differential outputs. Brackets mark the testbench coverage: the full-frame PPM dump with seven timing counts over the first two stages, and four checks per symbol over the encoder.">
        <defs>
          <ArrowMarker />
        </defs>
        <rect className="crisp" x="0" y="20" width="140" height="44" />
        <rect className="crisp" x="190" y="20" width="140" height="44" />
        <rect className="crisp" x="380" y="20" width="140" height="44" />
        <rect className="crisp s-ramp" x="570" y="20" width="140" height="44" strokeDasharray="4 3" />
        <text className="t-ink" x="70" y="46" textAnchor="middle">timing gen</text>
        <text className="t-ink" x="260" y="46" textAnchor="middle">pattern gen</text>
        <text className="t-ink" x="450" y="46" textAnchor="middle">TMDS enc ×3</text>
        <text className="t-ink" x="640" y="46" textAnchor="middle">10:1 serializer</text>
        <path className="crisp" d="M140 42 H190" markerEnd="url(#arr)" />
        <path className="crisp" d="M330 42 H380" markerEnd="url(#arr)" />
        <path className="crisp" d="M520 42 H570" markerEnd="url(#arr)" />
        <path className="crisp" d="M710 42 H735" markerEnd="url(#arr)" />
        <text className="t-ink" x="742" y="46">TMDS ±</text>
        <text x="0" y="84">25.175 MHz</text>
        <text x="570" y="84">in progress</text>
        <path className="crisp" d="M0 104 H330" strokeDasharray="4 3" />
        <path className="crisp" d="M0 104 V98 M330 104 V98" />
        <text x="0" y="122">TB: full frame → PPM · 7 timing counts</text>
        <path className="crisp" d="M380 104 H520" strokeDasharray="4 3" />
        <path className="crisp" d="M380 104 V98 M520 104 V98" />
        <text x="380" y="122">TB: 4 checks / symbol</text>
      </Diagram>
    </Figure>
  );
}
