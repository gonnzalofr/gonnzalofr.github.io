// Rock Your Baby's drawings. Coordinates are literal: each drawing is laid out by hand from the project's facts.
import { ArrowMarker, Diagram, Figure } from '@portfolio/ui';

export function Subsystems() {
  return (
    <Figure placement="bleed" caption="Four PYNQ-Z2 boards, one subsystem each, talking over UART; the actuator drives two PWM channels, one for frequency and one for amplitude.">
      <Diagram viewBox="0 0 800 260" fit="start" title="Four subsystems, each on its own PYNQ-Z2: heartbeat and crying feed decision-making over UART, and decision-making commands the actuator over UART; the actuator drives two PWM channels, one for frequency and one for amplitude.">
        <defs>
          <ArrowMarker />
        </defs>
        {/* heartbeat: box (0,20) 230 × 40 */}
        <rect className="crisp" x="0" y="20" width="230" height="40" />
        <text className="t-ink" x="12" y="45">heartbeat</text>
        <text x="0" y="80">ADC → filter → BPM</text>
        <text x="0" y="98">waveform on 240×240 TFT</text>
        <text x="0" y="118">PYNQ-Z2</text>
        {/* crying: box (0,150) 230 × 40 */}
        <rect className="crisp" x="0" y="150" width="230" height="40" />
        <text className="t-ink" x="12" y="175">crying</text>
        <text x="0" y="210">ADC → RMS − noise floor</text>
        <text x="0" y="228">three pthreads</text>
        <text x="0" y="246">PYNQ-Z2</text>
        {/* decision-making: box (320,85) 220 × 40 */}
        <rect className="crisp" x="320" y="85" width="220" height="40" />
        <text className="t-ink" x="332" y="110">decision-making</text>
        <text x="320" y="145">fuse → frequency 1–5,</text>
        <text x="320" y="163">amplitude 1–5 → UART</text>
        <text x="320" y="183">PYNQ-Z2</text>
        {/* actuator: box (600,85) 190 × 40, ends 790 */}
        <rect className="crisp" x="600" y="85" width="190" height="40" />
        <text className="t-ink" x="612" y="110">actuator</text>
        <text x="600" y="145">PWM 1 → frequency</text>
        <text x="600" y="163">PWM 2 → amplitude</text>
        <text x="600" y="183">PYNQ-Z2</text>
        {/* UART links */}
        <line className="geo" x1="230" y1="40" x2="320" y2="100" markerEnd="url(#arr)" />
        <text x="272" y="58">UART</text>
        <line className="geo" x1="230" y1="170" x2="320" y2="110" markerEnd="url(#arr)" />
        <text x="272" y="166">UART</text>
        <line className="crisp" x1="540" y1="105" x2="600" y2="105" markerEnd="url(#arr)" />
        <text x="548" y="98">UART</text>
      </Diagram>
    </Figure>
  );
}
