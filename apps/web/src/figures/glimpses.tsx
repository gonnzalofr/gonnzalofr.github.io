// Each project's evidence on its home band, decorative (the band's text says what the project is). A new project
// needs one here, registered in `glimpses` by its slug.
import type { ReactNode } from 'react';
import { Envelope, Glimpse, Hatch, usePublished } from '@portfolio/ui';

function HdmiGlimpse() {
  return (
    <Glimpse kind="env">
      <Envelope><img src="assets/hdmi-frame-640x480.png" width="640" height="480" loading="lazy" decoding="async" alt="" /></Envelope>
    </Glimpse>
  );
}

function HifiGlimpse() {
  return (
    <Glimpse kind="board">
      <img src="assets/pcb/hifi-board-cut.webp" width="1600" height="800" loading="lazy" decoding="async" alt="" />
    </Glimpse>
  );
}

// The bench photograph once the real one replaces the placeholder; until then, the to-scale drawing.
function VenusGlimpse() {
  const photo = 'assets/work/venus-bench-front.jpg';
  if (usePublished(photo)) {
    return <Glimpse kind="photo"><img src={photo} width="1125" height="2000" loading="lazy" decoding="async" alt="" /></Glimpse>;
  }
  return (
    <Glimpse kind="draw">
      <svg viewBox="0 0 400 290">
        <defs>
          <Hatch stroke="s-axis" />
        </defs>
        <line className="s-axis" x1="0" y1="250" x2="400" y2="250" />
        <text className="t-ink" x="0" y="18">VL53L0X ×3 · one I²C bus</text>
        <rect className="crisp" x="0" y="90" width="50" height="160" />
        <rect className="crisp" x="50" y="230" width="16" height="10" />
        <rect className="crisp" x="50" y="200" width="16" height="10" />
        <rect className="crisp" x="50" y="145" width="16" height="10" />
        <line className="s-axis" x1="58" y1="155" x2="58" y2="230" />
        <g className="s-axis" strokeDasharray="4 3">
          <line x1="66" y1="235" x2="140" y2="235" />
          <line x1="66" y1="205" x2="200" y2="205" />
          <line x1="66" y1="150" x2="310" y2="150" />
        </g>
        <text className="t-ink" x="72" y="228">bottom</text>
        <text className="t-ink" x="72" y="198">mid</text>
        <text className="t-ink" x="72" y="143">top</text>
        <rect className="crisp" x="140" y="220" width="30" height="30" />
        <rect className="crisp" x="200" y="190" width="60" height="60" />
        <rect className="crisp f-hatch" x="310" y="130" width="40" height="120" />
        <text className="t-ink" x="140" y="272">3 cm</text>
        <text className="t-ink" x="200" y="272">6 cm</text>
        <text className="t-ink" x="310" y="272">obstacle</text>
      </svg>
    </Glimpse>
  );
}

function RybGlimpse() {
  return (
    <Glimpse kind="draw">
      <svg viewBox="0 0 406 356">
        <rect className="crisp" x="0" y="0" width="200" height="32" />
        <text className="t-ink" x="12" y="21">heartbeat</text>
        <text x="0" y="50">ADC → filter → BPM</text>
        <text x="0" y="68">waveform on 240×240 TFT</text>
        <rect className="crisp" x="0" y="84" width="200" height="32" />
        <text className="t-ink" x="12" y="105">crying</text>
        <text x="0" y="134">ADC → RMS − noise floor</text>
        <text x="0" y="152">three pthreads</text>
        <path className="crisp" d="M200 16 H360 V192 H300 M200 100 H360" /><path d="M309 187 L300 192 L309 197" />
        <text x="366" y="62">UART</text>
        <rect className="crisp" x="0" y="176" width="300" height="32" />
        <text className="t-ink" x="12" y="197">decision-making</text>
        <text x="0" y="226">fuse → frequency 1–5,</text>
        <text x="0" y="244">amplitude 1–5 → UART</text>
        <line className="crisp" x1="150" y1="254" x2="150" y2="280" /><path d="M145 271 L150 280 L155 271" />
        <text x="160" y="272">UART</text>
        <rect className="crisp" x="0" y="280" width="200" height="32" />
        <text className="t-ink" x="12" y="301">actuator</text>
        <text x="0" y="330">PWM 1 → frequency</text>
        <text x="0" y="348">PWM 2 → amplitude</text>
      </svg>
    </Glimpse>
  );
}

export const glimpses: Record<string, () => ReactNode> = {
  'hdmi-dvi-transmitter': HdmiGlimpse,
  'venus-rover': VenusGlimpse,
  'hifi-player': HifiGlimpse,
  'rock-your-baby': RybGlimpse,
};
