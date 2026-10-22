// "Try the encoder" (HDMI page): one byte through the encoder (@portfolio/tmds), drawn and explained, a prior cnt_r to
// reach the inversion branch, the ramp to feed it, and a self-check of the port. An island: the server renders what a
// reader without JavaScript sees (d = 0x47 from cnt_r 0, the controls disabled, the self-check not run), and the page
// hydrates it when the figure comes into view. The body of a <Figure>, whose caption it is labeled by.
// Data figures never tween: every change redraws. The <output> is the site's one implicit status region, so it is
// written per change (a slider, the checkbox), never per tick of the ramp.
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { checkLine, encode, type Bit, type Encoded } from '@portfolio/tmds';
import { Diagram } from '../figure/Figure.tsx';

const hex = (d: number) => '0x' + d.toString(16).toUpperCase().padStart(2, '0');
const sgn = (c: number) => (c > 0 ? '+' + c : c < 0 ? '−' + -c : '0');
const str = (bits: readonly Bit[]) => bits.toReversed().join('');  // msb first
/** A stepped waveform, bit 0 first at 36 per bit, between top + 5 (1) and top + 25 (0). */
function wave(bits: readonly Bit[], top: number) {
  const y = (v: Bit | undefined) => top + (v ? 5 : 25);
  let p = `M130 ${y(bits[0])}`;
  for (let i = 1; i < bits.length; i++) if (bits[i] !== bits[i - 1]) p += ` H${130 + 36 * i} V${y(bits[i])}`;
  return p + ` H${130 + 36 * bits.length}`;
}
/** The trace's y for a running disparity: ±8 full scale around 110. */
const lvl = (c: number) => 110 - c * 8;
const chain = (e: Encoded) => (e.s[8] ? 'XOR' : 'XNOR');
function stage1(e: Encoded) {
  return `N1 = ${e.N1} ones in d${e.N1 === 4 ? `, d[0] = ${e.b[0]}` : ''} → ${chain(e)} chain, q_m[8] = ${e.s[8]}`;
}
function stage2(e: Encoded, cnt_r: number) {
  const why = e.br === 0 ? `${cnt_r === 0 ? 'cnt_r = 0' : 'N2 = 4'} → q_m[8] decides`
    : `cnt_r = ${sgn(cnt_r)}${cnt_r > 0 ? ' > 0' : ' < 0'}, N2 = ${e.N2}${e.N2 > 4 ? ' > 4' : ' < 4'}`;
  return `q_m[7:0]: ${e.N2} ones, ${8 - e.N2} zeros · ${why} → ${e.inv ? 'invert, q_out[9] = 1' : 'keep, q_out[9] = 0'}`;
}
/** One symbol, before and after, drawn at its byte. */
function symbolTrace(d: number, c0: number) {
  const a = d * 3, c1 = encode(d, c0).cnt_n;
  return `${Math.max(0, a - 30)},${lvl(c0)} ${a},${lvl(c0)} ${a},${lvl(c1)} ${Math.min(768, a + 33)},${lvl(c1)}`;
}
const points = (x: number, c: number) => ` ${x},${lvl(c)} ${x + 3},${lvl(c)}`;

interface State {
  /** hydrated: the controls work and the self-check has run */
  live: boolean;
  /** the symbol drawn: the byte and the cnt_r before it */
  d: number;
  c: number;
  /** feeding the ramp, at pixel x of the line (-1 otherwise) */
  run: boolean;
  x: number;
  /** what the <output> says: the last symbol picked by hand, and whether the reasons are shown */
  out: { d: number; c: number; why: boolean };
  /** the cnt_r trace: one symbol, the ramp at rest, or the line fed so far */
  trace: string;
  check: string;
}

const initial: State = {
  live: false, d: 0x47, c: 0, run: false, x: -1, out: { d: 0x47, c: 0, why: true },
  trace: symbolTrace(0x47, 0), check: 'self-check: not run — this line needs JavaScript',
};

/** A symbol picked by hand: written to the <output>, and drawn at its byte. */
const single = (s: State): State => ({ ...s, out: { d: s.d, c: s.c, why: true }, trace: symbolTrace(s.d, s.c) });
/** The next pixel of the ramp (d = x mod 256); cnt_r is cleared in the blanking before each line. */
function tick(s: State): State {
  const x = (s.x + 1) % 640, d = x & 255, c = x === 0 ? 0 : encode(s.d, s.c).cnt_n;
  return { ...s, x, d, c, trace: (x % 256 === 0 ? '' : s.trace) + points(d * 3, encode(d, c).cnt_n) };
}
const start = (s: State): State => tick({ ...s, run: true, x: -1, out: { ...s.out, why: false } });
const stop = (s: State): State => single({ ...s, run: false, x: -1 });

export function TmdsEncoder() {
  const [s, set] = useState(initial);
  const din = useRef<HTMLInputElement>(null), cin = useRef<HTMLInputElement>(null), run = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const line = checkLine();
    const check = (line.ok ? 'self-check: ' : 'self-check failed: ') + `${line.roundTrip}/256 round-trip · max ${line.maxTransitions} transitions · |disparity| ≤ ${line.maxDisparity}`;
    // the first 256 symbols of the line are the trace at rest
    const ramp = line.levels.slice(0, 256).map((c, x) => points(x * 3, c)).join('');
    // the controls as the browser left them (a restored form), as the page found them before it was hydrated
    const d = Number(din.current?.value ?? initial.d), c = Number(cin.current?.value ?? initial.c);
    set((s) => {
      const at = { ...s, live: true, check, d, c };
      return run.current?.checked ? start(at) : { ...at, out: { d, c, why: true }, trace: ramp };
    });
  }, []);

  useEffect(() => {
    if (!s.run) return;
    const timer = setInterval(() => set(tick), 125);
    return () => clearInterval(timer);
  }, [s.run]);

  const pick = (key: 'd' | 'c') => (ev: ChangeEvent<HTMLInputElement>) => {
    const v = Number(ev.currentTarget.value);
    set((s) => single({ ...s, [key]: v }));
  };
  const e = encode(s.d, s.c), shown = encode(s.out.d, s.out.c);
  return (
    <>
      <div className="tmds__ctl">
        <label>d = <span id="tmds-d">{hex(s.d)}</span><input ref={din} id="tmds-in" type="range" min="0" max="255" value={s.d} aria-valuetext={s.live ? hex(s.d) : undefined} disabled={!s.live || s.run} onChange={pick('d')} /></label>
        <label>prior cnt_r = <span id="tmds-c">{sgn(s.c)}</span><input ref={cin} id="tmds-cnt" type="range" min="-8" max="8" step="2" value={s.c} disabled={!s.live || s.run} onChange={pick('c')} /></label>
        <label><input ref={run} id="tmds-run" type="checkbox" checked={s.run} disabled={!s.live} onChange={(ev) => { const on = ev.currentTarget.checked; set((s) => (on ? start(s) : stop(s))); }} />feed the ramp</label>
        <output id="tmds-out" htmlFor="tmds-in tmds-cnt" className="tmds__check"><span id="tmds-res">{`q_out = ${str(shown.o)} · cnt_r ${sgn(s.out.c)} → ${sgn(shown.cnt_n)}`}</span><span className="tmds__why" id="tmds-why">{s.out.why ? `${stage1(shown)}\n${stage2(shown, s.out.c)}` : null /* no text node: preact rewrites an empty one on every render */}</span></output>
      </div>
      <Diagram viewBox="0 0 800 320" titleId="ftt" captionId="fig-tmds-cap" title="The TMDS encoder on one byte: the input bits, the nine-bit q_m after the transition-minimizing stage, and the ten-bit q_out after DC balancing, each drawn as a stepped waveform bit 0 first and written beside it msb first, with the ones count, the chaining choice, the inversion decision and the running disparity before and after. Below, the running disparity as a stepped trace, plus or minus 8 full scale, against the input byte d, 0x00 to 0xFF.">
        <text x="130" y="11">bit 0 first, as transmitted</text>
        <text x="520" y="11">written msb first</text>

        <text className="t-ink" id="tl-d" x="0" y="38">{`d = ${hex(s.d)}`}</text>
        <path className="s-rule" d="M130 43 V47 M166 43 V47 M202 43 V47 M238 43 V47 M274 43 V47 M310 43 V47 M346 43 V47 M382 43 V47 M418 43 V47" />
        <path className="crisp" id="tw-d" d={wave(e.b, 18)} />
        <text className="t-ink" id="ts-d" x="520" y="38">{str(e.b)}</text>
        <text className="t-ink" id="tn-d" x="620" y="38">{`N1 = ${e.N1}${s.x < 0 ? '' : ` · x ${s.x}/640`}`}</text>

        <text className="t-ink" x="0" y="76">q_m</text>
        <path className="s-rule" d="M130 81 V85 M166 81 V85 M202 81 V85 M238 81 V85 M274 81 V85 M310 81 V85 M346 81 V85 M382 81 V85 M418 81 V85 M454 81 V85" />
        <path className="crisp" id="tw-m" d={wave(e.s, 56)} />
        <text className="t-ink" id="ts-m" x="520" y="76">{str(e.s)}</text>
        <text className="t-ink" id="tn-m" x="620" y="76">{`${chain(e)} · q_m[8] = ${e.s[8]}`}</text>

        <text className="t-ink" x="0" y="114">q_out</text>
        <path className="s-rule" d="M130 119 V123 M166 119 V123 M202 119 V123 M238 119 V123 M274 119 V123 M310 119 V123 M346 119 V123 M382 119 V123 M418 119 V123 M454 119 V123 M490 119 V123" />
        <path className="crisp" id="tw-q" d={wave(e.o, 94)} />
        <text className="t-ink" id="ts-q" x="520" y="114">{str(e.o)}</text>
        <text className="t-ink" id="tn-q" x="620" y="114">{`cnt_r ${sgn(s.c)} → ${sgn(e.cnt_n)}`}</text>

        <text className="t-ink" id="tx-1" x="0" y="141">{stage1(e)}</text>
        <text className="t-ink" id="tx-2" x="0" y="157">{stage2(e, s.c)}</text>

        <g transform="translate(0 122)">
          <path className="s-axis" d="M0 110 H768 M764 46 H768 M764 174 H768" />
          <polyline className="crisp s-ramp" id="tmds-trace" points={s.trace} />
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
      <p className="tmds__check" id="tmds-check">{s.check}</p>
    </>
  );
}
