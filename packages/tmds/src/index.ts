// TMDS 8b/10b encoding as the HDMI transmitter's RTL does it (gonnzalofr/fpga-hdmi). encode() is a line-for-line port
// of tmds_encoder.v, with the Verilog names in the comments; decode() follows tmds_decode() in tb_tmds_encoder.v.
// Bits are kept in arrays indexed by bit number: [0] is bit 0, the first bit on the wire.

export type Bit = 0 | 1;

export interface Encoded {
  /** d[7:0] */
  b: Bit[];
  /** q_m, stage1[8:0]: after the transition-minimizing stage; [8] is 1 for the XOR chain, 0 for XNOR */
  s: Bit[];
  /** q_out, stage2[9:0]: after DC balancing; [9] is 1 when q_m[7:0] was inverted */
  o: Bit[];
  /** ones in d */
  N1: number;
  /** ones in q_m[7:0] */
  N2: number;
  inv: boolean;
  /** the branch of stage2 that decided: 0 when cnt_r = 0 or N2 = 4 (q_m[8] decides), 1 invert, 2 keep */
  br: 0 | 1 | 2;
  /** cnt_n: the running disparity after this symbol */
  cnt_n: number;
}

const bit = (v: number): Bit => (v & 1) as Bit;
const not = (v: Bit): Bit => (1 - v) as Bit;

/** count_one */
export function ones(v: number): number {
  let n = 0;
  for (let i = 0; i < 8; i++) n += (v >> i) & 1;
  return n;
}

/** One data symbol (de = 1): the byte d with the running disparity cnt_r before it. */
export function encode(d: number, cnt_r: number): Encoded {
  const N1 = ones(d), b: Bit[] = [], s: Bit[] = [], o: Bit[] = [];
  for (let i = 0; i < 8; i++) b[i] = bit(d >> i);
  s[0] = b[0]!;  // stage1
  if (N1 > 4 || (!b[0] && N1 === 4)) {  // XNOR chain, stage1[8] = 0
    for (let i = 1; i < 8; i++) s[i] = not(bit(s[i - 1]! ^ b[i]!));
    s[8] = 0;
  } else {  // XOR chain, stage1[8] = 1
    for (let i = 1; i < 8; i++) s[i] = bit(s[i - 1]! ^ b[i]!);
    s[8] = 1;
  }
  let N2 = 0;
  for (let i = 0; i < 8; i++) N2 += s[i]!;  // N2 of stage1[7:0]
  let br: Encoded['br'], inv: boolean, cnt_n: number;
  if (cnt_r === 0 || N2 === 4) {  // stage2, branch 1
    br = 0; inv = !s[8];
    cnt_n = inv ? cnt_r - (2 * N2 - 8) : cnt_r + (2 * N2 - 8);
  } else if ((cnt_r > 0 && N2 > 4) || (cnt_r < 0 && N2 < 4)) {  // branch 2: invert
    br = 1; inv = true;
    cnt_n = cnt_r - (2 * N2 - 8) + (s[8] ? 2 : 0);
  } else {  // branch 3: keep
    br = 2; inv = false;
    cnt_n = cnt_r + (2 * N2 - 8) - (s[8] ? 0 : 2);
  }
  for (let i = 0; i < 8; i++) o[i] = inv ? not(s[i]!) : s[i]!;  // stage2
  o[8] = s[8]; o[9] = inv ? 1 : 0;
  return { b, s, o, N1, N2, inv, br, cnt_n };
}

/** One control symbol (de = 0): the codeword for c1, c0. The encoder clears cnt_r while it sends these. */
export function control(c1: boolean, c0: boolean): Bit[] {
  const q = c0 && c1 ? 0b1010101011 : c0 ? 0b0010101011 : c1 ? 0b0101010100 : 0b1101010100;
  return Array.from({ length: 10 }, (_, i) => bit(q >> i));
}

/** tmds_decode(sym): the byte a data symbol carries. */
export function decode(q: readonly Bit[]): number {
  const m: Bit[] = [], r: Bit[] = [];
  for (let i = 0; i < 8; i++) m[i] = q[9] ? not(q[i]!) : q[i]!;
  r[0] = m[0]!;
  for (let i = 1; i < 8; i++) r[i] = q[8] ? bit(m[i]! ^ m[i - 1]!) : not(bit(m[i]! ^ m[i - 1]!));
  let d = 0;
  for (let i = 0; i < 8; i++) d |= r[i]! << i;
  return d;
}

/** transitions(v): the edges inside one symbol. */
export function transitions(q: readonly Bit[]): number {
  let t = 0;
  for (let i = 0; i < q.length - 1; i++) if (q[i] !== q[i + 1]) t++;
  return t;
}

export interface LineCheck {
  /** bytes (of 256) that decode back to themselves everywhere on the line */
  roundTrip: number;
  maxTransitions: number;
  maxDisparity: number;
  /** round trip on every byte, at most 5 transitions per symbol, |cnt_r| ≤ 8 */
  ok: boolean;
  /** cnt_r after each symbol */
  levels: number[];
}

/** One active video line of the red-ramp pattern (d = x mod 256) from cnt_r = 0, as the encoder starts it after blanking. */
export function checkLine(width = 640): LineCheck {
  const bad = new Set<number>(), levels: number[] = [];
  let cnt = 0, maxTransitions = 0, maxDisparity = 0;
  for (let x = 0; x < width; x++) {
    const d = x & 255, e = encode(d, cnt);
    cnt = e.cnt_n;
    levels.push(cnt);
    if (decode(e.o) !== d) bad.add(d);
    maxTransitions = Math.max(maxTransitions, transitions(e.o));
    maxDisparity = Math.max(maxDisparity, Math.abs(cnt));
  }
  const roundTrip = 256 - bad.size;
  return { roundTrip, maxTransitions, maxDisparity, ok: !bad.size && maxTransitions <= 5 && maxDisparity <= 8, levels };
}
