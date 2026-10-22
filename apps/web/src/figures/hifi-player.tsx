// The HiFi player's drawings, the 3D board (static markup for src/scripts/board.js) and the layout renders.
import { ArrowMarker, Diagram, Figure, Hatch, PhotoFigure } from '@portfolio/ui';

export function AudioPath() {
  return (
    <Figure placement="bleed" caption="Audio path: Bluetooth or microSD, selected by a MUX, into an I2S DAC.">
      <Diagram viewBox="0 0 800 130" fit="start" overflow="visible" title="Audio path block diagram: a Bluetooth source and a microSD source, both under ESP32-S3R8 firmware, feed a MUX, which feeds an I2S DAC, which feeds the output.">
        <defs>
          <ArrowMarker />
        </defs>
        {/* bracket over the two sources: y=22, x 0–140, 6px end ticks down */}
        <path className="crisp" d="M0 28 V22 H140 V28" />
        <text x="0" y="14">ESP32-S3R8 firmware</text>
        {/* boxes */}
        <rect className="crisp" x="0" y="32" width="140" height="36" />
        <rect className="crisp" x="0" y="82" width="140" height="36" />
        <rect className="crisp" x="240" y="57" width="90" height="36" />
        <rect className="crisp" x="400" y="57" width="110" height="36" />
        <rect className="crisp" x="580" y="57" width="70" height="36" />
        <text className="t-ink" x="70" y="55" textAnchor="middle">Bluetooth</text>
        <text className="t-ink" x="70" y="105" textAnchor="middle">microSD</text>
        <text className="t-ink" x="285" y="80" textAnchor="middle">MUX</text>
        <text className="t-ink" x="455" y="80" textAnchor="middle">I2S DAC</text>
        <text className="t-ink" x="615" y="80" textAnchor="middle">out</text>
        {/* sources converge on the MUX */}
        <line className="geo" x1="140" y1="50" x2="240" y2="75" markerEnd="url(#arr)" />
        <line className="geo" x1="140" y1="100" x2="240" y2="75" markerEnd="url(#arr)" />
        {/* MUX → DAC → out */}
        <line className="crisp" x1="330" y1="75" x2="400" y2="75" markerEnd="url(#arr)" />
        <line className="crisp" x1="510" y1="75" x2="580" y2="75" markerEnd="url(#arr)" />
      </Diagram>
    </Figure>
  );
}

export function StackUp() {
  return (
    <Figure placement="right" caption="Four-layer stack, schematic: layer assignment and thicknesses not shown.">
      <Diagram viewBox="0 0 800 200" fit="start" title="Four-layer PCB stack-up in section: four copper layers L1 to L4 separated by three dielectric slabs, drawn at equal thickness because no thicknesses are stated.">
        <defs>
          <Hatch stroke="s-rule" />
        </defs>
        <rect className="f-hatch" stroke="none" x="0" y="34" width="560" height="40" />
        <rect className="f-hatch" stroke="none" x="0" y="78" width="560" height="40" />
        <rect className="f-hatch" stroke="none" x="0" y="122" width="560" height="40" />
        <rect className="f-cu crisp" x="0" y="30" width="560" height="4" />
        <rect className="f-cu crisp" x="0" y="74" width="560" height="4" />
        <rect className="f-cu crisp" x="0" y="118" width="560" height="4" />
        <rect className="f-cu crisp" x="0" y="162" width="560" height="4" />
        <text className="t-ink" x="576" y="37">L1</text>
        <text className="t-ink" x="576" y="81">L2</text>
        <text className="t-ink" x="576" y="125">L3</text>
        <text className="t-ink" x="576" y="169">L4</text>
        <text x="576" y="58">dielectric</text>
        <text x="576" y="102">dielectric</text>
        <text x="576" y="146">dielectric</text>
      </Diagram>
    </Figure>
  );
}

/** The board as a 3D model: the still render, which src/scripts/board.js replaces with the model once the figure
 *  comes near the viewport (and keeps, without JavaScript or WebGL). The ids and data attributes are the script's. */
export function BoardViewer() {
  return (
    <Figure
      placement="bleed"
      id="fig-board"
      variant="board"
      data-model="../assets/pcb/hifi-board.glb"
      data-label="The current HiFi player board as a 3D model. Drag, or use the arrow keys, to turn it."
      caption="The current layout: the STEP export from EasyEDA Pro, converted to glTF with every component body kept. The model loads when the figure comes into view."
    >
      <div className="board__stage">
        <img className="board__poster" src="../assets/pcb/hifi-board-cut.webp" width="1600" height="800" loading="lazy" decoding="async" alt="The current HiFi player board rendered in 3D, seen from above at an angle: a blue board with the ESP32 and the other packages, four electrolytic capacitors in the middle, four buttons and the USB-C connector along the front edge, and a 7-pin header at the back." />
      </div>
      <p className="board__bar"><span className="board__status" id="board-status">still render · turning the model needs JavaScript and WebGL</span><button className="board__reset" type="button" hidden>reset view</button></p>
    </Figure>
  );
}

/** The three layout renders, as the page shows them: all three, or none while any is a placeholder. */
export const renders = ['../assets/work/hifi-rev1.png', '../assets/work/hifi-rev2.png', '../assets/work/hifi-rev3.png'] as const;

export const Rev1 = () => (
  <PhotoFigure placement="right" src={renders[0]} width={766} height={559} alt="Rendered layout, revision 1: a small board with two buttons, a USB-C connector, a 3.5 mm jack, a large rotary control and a 4-pin header." caption="Layout, revision 1 (render)." />
);
export const Rev2 = () => (
  <PhotoFigure placement="right" src={renders[1]} width={939} height={699} alt="Rendered layout, revision 2: a larger board with a Bluetooth module and its crystal, four buttons, a microSD slot and the ESP32-S3R8 with its crystal." caption="Layout, revision 2 (render)." />
);
export const Rev3 = () => (
  <PhotoFigure placement="right" src={renders[2]} width={1415} height={989} alt="Rendered layout, revision 3: four mounting holes; the Bluetooth module and the ESP32 on the left, the DAC section and the 3.5 mm jack top right, two electrolytic capacitors and the power section in the middle, USB-C, microSD and a JST battery connector along the bottom edge, and a 7-pin screen header at the top." caption="Layout, revision 3 (render)." />
);
