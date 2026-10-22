// The Venus rover's drawings and the two bench photographs (shown once the real files replace the placeholders).
// The 72 scan ticks of Fig. 1 are written out, not computed: 5° apart, every ninth one long.
import { ArrowMarker, Diagram, Figure, Hatch, PhotoFigure } from '@portfolio/ui';

export function Autopilot() {
  return (
    <Figure placement="bleed" caption="Reactive autopilot: SCAN → APPROACH → EVALUATE → ROAM, a 72-position scan in 5° steps, and a boundary interrupt checked every tick that pre-empts all of them.">
      <Diagram viewBox="0 0 800 282" title="The autopilot drawn as a plan: four states in a row, SCAN, APPROACH, EVALUATE and ROAM, joined by arrows; 72 ticks in 5 degree steps around SCAN; a dashed boundary-evade rectangle enclosing all four, checked at the top of every tick; and a three-line legend of the robustness rules.">
        <defs>
          <ArrowMarker />
        </defs>
        <rect className="geo s-ramp" x="16" y="40" width="768" height="168" strokeDasharray="5 4" />
        <text className="t-ramp" x="28" y="58">boundary evade — checked at the top of every tick</text>
        <g className="geo">
          <circle cx="100" cy="120" r="44" />
          <circle cx="300" cy="120" r="44" />
          <circle cx="500" cy="120" r="44" />
          <circle cx="700" cy="120" r="44" />
        </g>
        <text className="t-state" x="100" y="120" textAnchor="middle" dominantBaseline="middle">SCAN</text>
        <text className="t-state" x="300" y="120" textAnchor="middle" dominantBaseline="middle">APPROACH</text>
        <text className="t-state" x="500" y="120" textAnchor="middle" dominantBaseline="middle">EVALUATE</text>
        <text className="t-state" x="700" y="120" textAnchor="middle" dominantBaseline="middle">ROAM</text>
        <g className="crisp">
          <path d="M144 120 H256" markerEnd="url(#arr)" />
          <path d="M344 120 H456" markerEnd="url(#arr)" />
          <path d="M544 120 H656" markerEnd="url(#arr)" />
        </g>
        <g>
          <line x1="148.00" y1="120.00" x2="158.00" y2="120.00" />
          <line x1="147.82" y1="124.18" x2="153.79" y2="124.71" />
          <line x1="147.27" y1="128.34" x2="153.18" y2="129.38" />
          <line x1="146.36" y1="132.42" x2="152.16" y2="133.98" />
          <line x1="145.11" y1="136.42" x2="150.74" y2="138.47" />
          <line x1="143.50" y1="140.29" x2="148.94" y2="142.82" />
          <line x1="141.57" y1="144.00" x2="146.77" y2="147.00" />
          <line x1="139.32" y1="147.53" x2="144.23" y2="150.97" />
          <line x1="136.77" y1="150.85" x2="141.37" y2="154.71" />
          <line x1="133.94" y1="153.94" x2="141.01" y2="161.01" />
          <line x1="130.85" y1="156.77" x2="134.71" y2="161.37" />
          <line x1="127.53" y1="159.32" x2="130.97" y2="164.23" />
          <line x1="124.00" y1="161.57" x2="127.00" y2="166.77" />
          <line x1="120.29" y1="163.50" x2="122.82" y2="168.94" />
          <line x1="116.42" y1="165.11" x2="118.47" y2="170.74" />
          <line x1="112.42" y1="166.36" x2="113.98" y2="172.16" />
          <line x1="108.34" y1="167.27" x2="109.38" y2="173.18" />
          <line x1="104.18" y1="167.82" x2="104.71" y2="173.79" />
          <line x1="100.00" y1="168.00" x2="100.00" y2="178.00" />
          <line x1="95.82" y1="167.82" x2="95.29" y2="173.79" />
          <line x1="91.66" y1="167.27" x2="90.62" y2="173.18" />
          <line x1="87.58" y1="166.36" x2="86.02" y2="172.16" />
          <line x1="83.58" y1="165.11" x2="81.53" y2="170.74" />
          <line x1="79.71" y1="163.50" x2="77.18" y2="168.94" />
          <line x1="76.00" y1="161.57" x2="73.00" y2="166.77" />
          <line x1="72.47" y1="159.32" x2="69.03" y2="164.23" />
          <line x1="69.15" y1="156.77" x2="65.29" y2="161.37" />
          <line x1="66.06" y1="153.94" x2="58.99" y2="161.01" />
          <line x1="63.23" y1="150.85" x2="58.63" y2="154.71" />
          <line x1="60.68" y1="147.53" x2="55.77" y2="150.97" />
          <line x1="58.43" y1="144.00" x2="53.23" y2="147.00" />
          <line x1="56.50" y1="140.29" x2="51.06" y2="142.82" />
          <line x1="54.89" y1="136.42" x2="49.26" y2="138.47" />
          <line x1="53.64" y1="132.42" x2="47.84" y2="133.98" />
          <line x1="52.73" y1="128.34" x2="46.82" y2="129.38" />
          <line x1="52.18" y1="124.18" x2="46.21" y2="124.71" />
          <line x1="52.00" y1="120.00" x2="42.00" y2="120.00" />
          <line x1="52.18" y1="115.82" x2="46.21" y2="115.29" />
          <line x1="52.73" y1="111.66" x2="46.82" y2="110.62" />
          <line x1="53.64" y1="107.58" x2="47.84" y2="106.02" />
          <line x1="54.89" y1="103.58" x2="49.26" y2="101.53" />
          <line x1="56.50" y1="99.71" x2="51.06" y2="97.18" />
          <line x1="58.43" y1="96.00" x2="53.23" y2="93.00" />
          <line x1="60.68" y1="92.47" x2="55.77" y2="89.03" />
          <line x1="63.23" y1="89.15" x2="58.63" y2="85.29" />
          <line x1="66.06" y1="86.06" x2="58.99" y2="78.99" />
          <line x1="69.15" y1="83.23" x2="65.29" y2="78.63" />
          <line x1="72.47" y1="80.68" x2="69.03" y2="75.77" />
          <line x1="76.00" y1="78.43" x2="73.00" y2="73.23" />
          <line x1="79.71" y1="76.50" x2="77.18" y2="71.06" />
          <line x1="83.58" y1="74.89" x2="81.53" y2="69.26" />
          <line x1="87.58" y1="73.64" x2="86.02" y2="67.84" />
          <line x1="91.66" y1="72.73" x2="90.62" y2="66.82" />
          <line x1="95.82" y1="72.18" x2="95.29" y2="66.21" />
          <line x1="100.00" y1="72.00" x2="100.00" y2="62.00" />
          <line x1="104.18" y1="72.18" x2="104.71" y2="66.21" />
          <line x1="108.34" y1="72.73" x2="109.38" y2="66.82" />
          <line x1="112.42" y1="73.64" x2="113.98" y2="67.84" />
          <line x1="116.42" y1="74.89" x2="118.47" y2="69.26" />
          <line x1="120.29" y1="76.50" x2="122.82" y2="71.06" />
          <line x1="124.00" y1="78.43" x2="127.00" y2="73.23" />
          <line x1="127.53" y1="80.68" x2="130.97" y2="75.77" />
          <line x1="130.85" y1="83.23" x2="134.71" y2="78.63" />
          <line x1="133.94" y1="86.06" x2="141.01" y2="78.99" />
          <line x1="136.77" y1="89.15" x2="141.37" y2="85.29" />
          <line x1="139.32" y1="92.47" x2="144.23" y2="89.03" />
          <line x1="141.57" y1="96.00" x2="146.77" y2="93.00" />
          <line x1="143.50" y1="99.71" x2="148.94" y2="97.18" />
          <line x1="145.11" y1="103.58" x2="150.74" y2="101.53" />
          <line x1="146.36" y1="107.58" x2="152.16" y2="106.02" />
          <line x1="147.27" y1="111.66" x2="153.18" y2="110.62" />
          <line x1="147.82" y1="115.82" x2="153.79" y2="115.29" />
        </g>
        <text x="100" y="190" textAnchor="middle">5° × 72</text>
        <text x="16" y="232">cube confirmed: ≥2 of 6 reads within 5 cm</text>
        <text x="16" y="252">color: average of 20 reads · registered on detection strength</text>
        <text x="16" y="272">finds deduplicated within 12 cm · both robots stop at six cubes</text>
      </Diagram>
    </Figure>
  );
}

export function Architecture() {
  return (
    <Figure placement="bleed" caption="Two identical robots, one communication and networking subsystem, one base station — after Fig.&nbsp;2.1 of the team’s final report.">
      <Diagram viewBox="0 0 800 300" title="Block diagram: two identical robot blocks, Robot 1 on the left and Robot 2 on the right, each holding three boxes, electronic circuits and interfaces and embedded software both pointing up to algorithms. Two-headed arrows join each robot to a central communication and networking box, which is joined by a downward arrow to computer software and user interface.">
        <defs>
          <ArrowMarker id="arr-arch" reversible />
        </defs>
        <g className="crisp">
          <rect x="16" y="36" width="272" height="200" />
          <rect x="104" y="76" width="96" height="32" />
          <rect x="26" y="160" width="164" height="48" />
          <rect x="198" y="160" width="80" height="48" />
          <rect x="512" y="36" width="272" height="200" />
          <rect x="600" y="76" width="96" height="32" />
          <rect x="522" y="160" width="164" height="48" />
          <rect x="694" y="160" width="80" height="48" />
          <rect x="328" y="112" width="144" height="48" />
          <rect x="320" y="232" width="160" height="48" />
        </g>
        <text x="28" y="58">Robot 1</text>
        <text className="t-ink" x="152" y="96" textAnchor="middle">algorithms</text>
        <text className="t-ink" x="108" y="180" textAnchor="middle">electronic circuits</text>
        <text className="t-ink" x="108" y="197" textAnchor="middle">and interfaces</text>
        <text className="t-ink" x="238" y="180" textAnchor="middle">embedded</text>
        <text className="t-ink" x="238" y="197" textAnchor="middle">software</text>
        <text x="524" y="58">Robot 2</text>
        <text className="t-ink" x="648" y="96" textAnchor="middle">algorithms</text>
        <text className="t-ink" x="604" y="180" textAnchor="middle">electronic circuits</text>
        <text className="t-ink" x="604" y="197" textAnchor="middle">and interfaces</text>
        <text className="t-ink" x="734" y="180" textAnchor="middle">embedded</text>
        <text className="t-ink" x="734" y="197" textAnchor="middle">software</text>
        <text className="t-ink" x="400" y="132" textAnchor="middle">communication</text>
        <text className="t-ink" x="400" y="149" textAnchor="middle">and networking</text>
        <text className="t-ink" x="400" y="252" textAnchor="middle">computer software</text>
        <text className="t-ink" x="400" y="269" textAnchor="middle">and user interface</text>
        <g className="geo">
          <line x1="120" y1="160" x2="140" y2="108" markerEnd="url(#arr-arch)" />
          <line x1="226" y1="160" x2="164" y2="108" markerEnd="url(#arr-arch)" />
          <line x1="616" y1="160" x2="636" y2="108" markerEnd="url(#arr-arch)" />
          <line x1="722" y1="160" x2="660" y2="108" markerEnd="url(#arr-arch)" />
        </g>
        <g className="crisp">
          <line x1="288" y1="136" x2="328" y2="136" markerStart="url(#arr-arch)" markerEnd="url(#arr-arch)" />
          <line x1="472" y1="136" x2="512" y2="136" markerStart="url(#arr-arch)" markerEnd="url(#arr-arch)" />
          <line x1="400" y1="160" x2="400" y2="232" markerEnd="url(#arr-arch)" />
        </g>
      </Diagram>
    </Figure>
  );
}

export function SensorStack() {
  return (
    <Figure placement="right" caption="Three time-of-flight sensors on one shared I²C bus, one beam per height: bottom for 3 cm cubes, middle for 6 cm cubes, top for obstacles. Cubes drawn to scale; sensor heights schematic.">
      <Diagram viewBox="0 0 800 260" title="Elevation, drawn to scale at ten units per centimeter: the rover’s front face on the left with three time-of-flight sensors stacked on it, and three dashed sight lines running right — the bottom beam to a 3 centimeter cube, the middle beam over it to a 6 centimeter cube, the top beam over both to a hatched obstacle at the far right.">
        <defs>
          <Hatch stroke="s-rule" />
        </defs>
        <line className="s-axis" x1="20" y1="220" x2="780" y2="220" />
        <text className="t-ink" x="40" y="44">VL53L0X ×3 · one I²C bus, shared</text>
        <rect className="crisp" x="40" y="60" width="80" height="160" />
        <rect className="crisp" x="120" y="200" width="16" height="10" />
        <rect className="crisp" x="120" y="170" width="16" height="10" />
        <rect className="crisp" x="120" y="115" width="16" height="10" />
        <line className="s-axis" x1="128" y1="125" x2="128" y2="200" />
        <text className="t-ink" x="112" y="209" textAnchor="end">bottom</text>
        <text className="t-ink" x="112" y="179" textAnchor="end">mid</text>
        <text className="t-ink" x="112" y="124" textAnchor="end">top</text>
        <g className="s-axis" strokeDasharray="4 3">
          <line x1="136" y1="205" x2="300" y2="205" />
          <line x1="136" y1="175" x2="420" y2="175" />
          <line x1="136" y1="120" x2="600" y2="120" />
        </g>
        <rect className="crisp" x="300" y="190" width="30" height="30" />
        <rect className="crisp" x="420" y="160" width="60" height="60" />
        <rect className="crisp f-hatch" x="600" y="100" width="40" height="120" />
        <text className="t-ink" x="300" y="240">3 cm</text>
        <text className="t-ink" x="420" y="240">6 cm</text>
        <text className="t-ink" x="600" y="240">obstacle (“mountain”)</text>
      </Diagram>
    </Figure>
  );
}

export function Blocks() {
  return (
    <Figure placement="bleed" caption="Sensing, control and communication, after Fig.&nbsp;3.1 of the final report, with the sensor interfaces as wired.">
      <Diagram viewBox="0 0 800 320" title="Block diagram in three dashed groups. Sensing: four sensor boxes, TCRT5000 times two on digital GPIO, NTC 10 kilohm on ADC A5 via a unity-gain buffer, TCS3200 as a frequency output on GPIO, and VL53L0X times three on I squared C with XSHUT on AR4 and AR5, all feeding one arrow into the sensor interface. Robot control: sensor interface, then sensor processing plus navigation state machine, with a two-headed arrow to stepper motors. Communication and base station: a chain from UART with a 4-byte length plus JSON, to the ESP32-C3 connectivity board, to Wi-Fi and MQTT, to the MQTT broker, to the base station running the Python map.">
        <defs>
          <ArrowMarker id="arr-blk" reversible />
        </defs>
        <g className="crisp s-axis" strokeDasharray="5 4">
          <rect x="16" y="24" width="234" height="276" />
          <rect x="266" y="24" width="236" height="276" />
          <rect x="522" y="24" width="262" height="276" />
        </g>
        <text x="28" y="42">sensing</text>
        <text x="278" y="42">robot control</text>
        <text x="534" y="42">communication and base station</text>
        <g className="crisp">
          <rect x="28" y="56" width="210" height="52" />
          <rect x="28" y="116" width="210" height="52" />
          <rect x="28" y="176" width="210" height="52" />
          <rect x="28" y="236" width="210" height="52" />
          <rect x="278" y="56" width="212" height="44" />
          <rect x="278" y="134" width="212" height="44" />
          <rect x="278" y="234" width="212" height="44" />
          <rect x="534" y="56" width="238" height="34" />
          <rect x="534" y="104" width="238" height="34" />
          <rect x="534" y="152" width="238" height="34" />
          <rect x="534" y="200" width="238" height="34" />
          <rect x="534" y="248" width="238" height="34" />
        </g>
        <text className="t-ink" x="133" y="77" textAnchor="middle">TCRT5000 ×2</text>
        <text x="133" y="94" textAnchor="middle">digital GPIO</text>
        <text className="t-ink" x="133" y="132" textAnchor="middle">NTC 10 kΩ</text>
        <text x="133" y="147" textAnchor="middle">ADC A5 via</text>
        <text x="133" y="162" textAnchor="middle">unity-gain buffer</text>
        <text className="t-ink" x="133" y="197" textAnchor="middle">TCS3200</text>
        <text x="133" y="214" textAnchor="middle">frequency output on GPIO</text>
        <text className="t-ink" x="133" y="257" textAnchor="middle">VL53L0X ×3</text>
        <text x="133" y="274" textAnchor="middle">I²C, XSHUT on AR4/AR5</text>
        <text className="t-ink" x="384" y="74" textAnchor="middle">sensor interface</text>
        <text x="384" y="91" textAnchor="middle">(GPIO / I²C / ADC)</text>
        <text className="t-ink" x="384" y="152" textAnchor="middle">sensor processing +</text>
        <text className="t-ink" x="384" y="169" textAnchor="middle">navigation state machine</text>
        <text className="t-ink" x="384" y="260" textAnchor="middle">stepper motors</text>
        <text className="t-ink" x="653" y="77" textAnchor="middle">UART (4-byte length + JSON)</text>
        <text className="t-ink" x="653" y="125" textAnchor="middle">ESP32-C3 connectivity board</text>
        <text className="t-ink" x="653" y="173" textAnchor="middle">Wi-Fi / MQTT</text>
        <text className="t-ink" x="653" y="221" textAnchor="middle">MQTT broker</text>
        <text className="t-ink" x="653" y="269" textAnchor="middle">base station (Python map)</text>
        <g className="crisp">
          <line x1="238" y1="82" x2="258" y2="82" />
          <line x1="238" y1="142" x2="258" y2="142" />
          <line x1="238" y1="202" x2="258" y2="202" />
          <line x1="238" y1="262" x2="258" y2="262" />
          <line x1="258" y1="82" x2="258" y2="262" />
          <line x1="258" y1="82" x2="278" y2="82" markerEnd="url(#arr-blk)" />
          <line x1="384" y1="100" x2="384" y2="134" markerEnd="url(#arr-blk)" />
          <line x1="384" y1="178" x2="384" y2="234" markerStart="url(#arr-blk)" markerEnd="url(#arr-blk)" />
          <path d="M490 156 H510 V73 H534" markerEnd="url(#arr-blk)" />
          <line x1="653" y1="90" x2="653" y2="104" markerEnd="url(#arr-blk)" />
          <line x1="653" y1="138" x2="653" y2="152" markerEnd="url(#arr-blk)" />
          <line x1="653" y1="186" x2="653" y2="200" markerEnd="url(#arr-blk)" />
          <line x1="653" y1="234" x2="653" y2="248" markerEnd="url(#arr-blk)" />
        </g>
      </Diagram>
    </Figure>
  );
}

/** The two bench photographs, as the page shows them: both, or neither while either is a placeholder. */
export const photos = ['../assets/work/venus-bench-front.jpg', '../assets/work/venus-bench-side.jpg'] as const;

export const BenchFront = () => (
  <PhotoFigure placement="right" src={photos[0]} width={1125} height={2000} portrait captionId={false} alt="The rover from the front on a lab bench: two wheels, the PYNQ-Z2 in its case with a breadboard shield, the 3D-printed sensor mount with two IR sensor boards angled outward, the color sensor board with four white LEDs and the stacked time-of-flight boards" caption="The rover from the front on a lab bench: the PYNQ-Z2 in its case with a breadboard shield, the 3D-printed sensor mount with the two IR boards, the color sensor board and the stacked time-of-flight boards. June 2026." />
);
export const BenchSide = () => (
  <PhotoFigure placement="right" src={photos[1]} width={1125} height={2000} portrait captionId={false} alt="The rover from the side on a lab bench." caption="The rover from the side on the same bench. June 2026." />
);
