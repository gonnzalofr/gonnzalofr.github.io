// The HDMI / DVI transmitter's drawings, the TMDS encoder (static markup for src/scripts/tmds.js) and the XSIM frame.
// Waveforms are drawn to scale from the timing numbers and the encoder's output; nothing here is generated.
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

/** The encoder on one byte, as it renders without JavaScript (d = 0x47, cnt_r 0). src/scripts/tmds.js enables the
 *  controls and redraws the waveforms, texts and trace by these ids; the <output> is the one status region on the site. */
export function TmdsEncoder() {
  return (
    <Figure
      placement="bleed"
      id="fig-tmds"
      captionId="fig-tmds-cap"
      caption="The encoder, ported from the RTL: the input byte, q_m after the transition stage and q_out after DC balancing, drawn q[0] first as transmitted, written msb first. Below, the running disparity cnt_r at ±8 full scale against the input byte d: at rest, the first 256-symbol pass of the ramp from cnt_r = 0; after a slider moves, this one symbol before and after, drawn at its byte."
    >
      <div className="tmds__ctl">
        <label>d = <span id="tmds-d">0x47</span><input id="tmds-in" type="range" min="0" max="255" defaultValue="71" disabled /></label>
        <label>prior cnt_r = <span id="tmds-c">0</span><input id="tmds-cnt" type="range" min="-8" max="8" step="2" defaultValue="0" disabled /></label>
        <label><input id="tmds-run" type="checkbox" disabled />feed the ramp</label>
        <output id="tmds-out" htmlFor="tmds-in tmds-cnt" className="tmds__check"><span id="tmds-res">q_out = 0100111101 · cnt_r 0 → +2</span><span className="tmds__why" id="tmds-why">{'N1 = 4 ones in d, d[0] = 1 → XOR chain, q_m[8] = 1\nq_m[7:0]: 5 ones, 3 zeros · cnt_r = 0 → q_m[8] decides → keep, q_out[9] = 0'}</span></output>
      </div>
      <Diagram viewBox="0 0 800 320" titleId="ftt" title="The TMDS encoder on one byte: the input bits, the nine-bit q_m after the transition-minimizing stage, and the ten-bit q_out after DC balancing, each drawn as a stepped waveform bit 0 first and written beside it msb first, with the ones count, the chaining choice, the inversion decision and the running disparity before and after. Below, the running disparity as a stepped trace, plus or minus 8 full scale, against the input byte d, 0x00 to 0xFF.">
        <text x="130" y="11">bit 0 first, as transmitted</text>
        <text x="520" y="11">written msb first</text>

        <text className="t-ink" id="tl-d" x="0" y="38">d = 0x47</text>
        <path className="s-rule" d="M130 43 V47 M166 43 V47 M202 43 V47 M238 43 V47 M274 43 V47 M310 43 V47 M346 43 V47 M382 43 V47 M418 43 V47" />
        <path className="crisp" id="tw-d" d="M130 23 H238 V43 H346 V23 H382 V43 H418" />
        <text className="t-ink" id="ts-d" x="520" y="38">01000111</text>
        <text className="t-ink" id="tn-d" x="620" y="38">N1 = 4</text>

        <text className="t-ink" x="0" y="76">q_m</text>
        <path className="s-rule" d="M130 81 V85 M166 81 V85 M202 81 V85 M238 81 V85 M274 81 V85 M310 81 V85 M346 81 V85 M382 81 V85 M418 81 V85 M454 81 V85" />
        <path className="crisp" id="tw-m" d="M130 61 H166 V81 H202 V61 H346 V81 H418 V61 H454" />
        <text className="t-ink" id="ts-m" x="520" y="76">100111101</text>
        <text className="t-ink" id="tn-m" x="620" y="76">XOR · q_m[8] = 1</text>

        <text className="t-ink" x="0" y="114">q_out</text>
        <path className="s-rule" d="M130 119 V123 M166 119 V123 M202 119 V123 M238 119 V123 M274 119 V123 M310 119 V123 M346 119 V123 M382 119 V123 M418 119 V123 M454 119 V123 M490 119 V123" />
        <path className="crisp" id="tw-q" d="M130 99 H166 V119 H202 V99 H346 V119 H418 V99 H454 V119 H490" />
        <text className="t-ink" id="ts-q" x="520" y="114">0100111101</text>
        <text className="t-ink" id="tn-q" x="620" y="114">cnt_r 0 → +2</text>

        <text className="t-ink" id="tx-1" x="0" y="141">N1 = 4 ones in d, d[0] = 1 → XOR chain, q_m[8] = 1</text>
        <text className="t-ink" id="tx-2" x="0" y="157">q_m[7:0]: 5 ones, 3 zeros · cnt_r = 0 → q_m[8] decides → keep, q_out[9] = 0</text>

        <g transform="translate(0 122)">
          <path className="s-axis" d="M0 110 H768 M764 46 H768 M764 174 H768" />
          <polyline className="crisp s-ramp" id="tmds-trace" points="183,110 213,110 213,94 246,94" />
          <path className="s-axis" d="M1.5 178 V182 M193.5 178 V182 M385.5 178 V182 M577.5 178 V182 M766.5 178 V182" />
          <text x="0" y="196">0x00</text>
          <text x="193.5" y="196" textAnchor="middle">0x40</text>
          <text x="385.5" y="196" textAnchor="middle">0x80</text>
          <text x="577.5" y="196" textAnchor="middle">0xC0</text>
          <text x="766.5" y="196" textAnchor="end">0xFF</text>
          <text x="780" y="196">d</text>
          <text x="772" y="50">+8</text>
          <text x="772" y="114">0</text>
          <text x="772" y="178">−8</text>
        </g>
      </Diagram>
      <p className="tmds__check" id="tmds-check">self-check: not run — this line needs JavaScript</p>
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
