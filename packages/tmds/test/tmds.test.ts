// The encoder against the properties tb_tmds_encoder.v checks on every symbol (round trip, at most five transitions,
// a running disparity accumulated independently from the ten transmitted bits, a bound), its four control codewords,
// and a few symbols worked out by hand from tmds_encoder.v.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkLine, control, decode, encode, transitions, type Bit } from '../src/index.ts';

const msbFirst = (bits: readonly Bit[]) => bits.toReversed().join('');
const ones10 = (q: readonly Bit[]) => q.reduce<number>((n, b) => n + b, 0);
const bytes = Array.from({ length: 256 }, (_, d) => d);
/** every running disparity the encoder can start a symbol from: cnt_r moves in steps of 2 and stays within ±8 */
const priors = [-8, -6, -4, -2, 0, 2, 4, 6, 8];

test('hand-worked symbols, one per branch of stage2', () => {
  const cases = [
    // d, cnt_r → q_m, q_out (msb first), cnt_n
    { d: 0x47, c: 0, qm: '100111101', q: '0100111101', n: 2 },   // N1 = 4, d[0] = 1: XOR; cnt_r = 0: q_m[8] = 1 keeps (the page at rest)
    { d: 0x47, c: 2, qm: '100111101', q: '1111000010', n: 2 },   // cnt_r > 0 and N2 = 5 > 4: invert
    { d: 0x47, c: -2, qm: '100111101', q: '0100111101', n: 0 },  // cnt_r < 0 but N2 = 5: keep
    { d: 0x00, c: 0, qm: '100000000', q: '0100000000', n: -8 },  // N1 = 0: XOR, nothing to flip
    { d: 0xff, c: 0, qm: '011111111', q: '1000000000', n: -8 },  // N1 = 8: XNOR; q_m[8] = 0 inverts
  ];
  for (const { d, c, qm, q, n } of cases) {
    const e = encode(d, c);
    assert.equal(msbFirst(e.s), qm, `q_m for d = ${d}, cnt_r = ${c}`);
    assert.equal(msbFirst(e.o), q, `q_out for d = ${d}, cnt_r = ${c}`);
    assert.equal(e.cnt_n, n, `cnt_n for d = ${d}, cnt_r = ${c}`);
  }
});

test('the four control codewords are the spec codewords the testbench checks against', () => {
  assert.equal(msbFirst(control(false, false)), '1101010100');
  assert.equal(msbFirst(control(false, true)), '0010101011');
  assert.equal(msbFirst(control(true, false)), '0101010100');
  assert.equal(msbFirst(control(true, true)), '1010101011');
});

test('round trip: every byte decodes back to itself from every running disparity', () => {
  for (const c of priors) for (const d of bytes) assert.equal(decode(encode(d, c).o), d, `d = ${d}, cnt_r = ${c}`);
});

test('transitions: a data symbol has at most 5 edges', () => {
  for (const c of priors) for (const d of bytes) assert.ok(transitions(encode(d, c).o) <= 5, `d = ${d}, cnt_r = ${c}`);
});

test('disparity: cnt_n follows the ones and zeros actually sent', () => {
  for (const c of priors) for (const d of bytes) {
    const e = encode(d, c);
    assert.equal(e.cnt_n, c + 2 * ones10(e.o) - 10, `d = ${d}, cnt_r = ${c}`);
  }
});

test('the testbench stimulus, phases 2–5: the disparity stays within its limit of 12 and every symbol round-trips', () => {
  const stream = [
    ...bytes,                                              // all 256 values ascending
    ...bytes.toReversed(),                                 // and descending
    ...bytes.flatMap((d) => Array<number>(8).fill(d)),     // each value held for 8 cycles
    ...[0xfe, 0x00, 0xff, 0xaa].flatMap((d) => Array<number>(64).fill(d)),
  ];
  assert.equal(stream.length + 40 * 200, 10816);          // with phase 6's random bursts, the symbols one run checks
  let cnt = 0, ref = 0;
  for (const d of stream) {
    const e = encode(d, cnt);
    ref += 2 * ones10(e.o) - 10;
    cnt = e.cnt_n;
    assert.equal(decode(e.o), d);
    assert.equal(cnt, ref);
    assert.ok(Math.abs(cnt) <= 12);
  }
});

test('the self-check on one 640-pixel line of the ramp passes: |cnt_r| ≤ 8 throughout', () => {
  const line = checkLine();
  assert.equal(line.roundTrip, 256);
  assert.ok(line.maxTransitions <= 5);
  assert.ok(line.maxDisparity <= 8);
  assert.ok(line.ok);
  assert.equal(line.levels.length, 640);
  let cnt = 0;
  line.levels.forEach((level, x) => { cnt = encode(x & 255, cnt).cnt_n; assert.equal(level, cnt); });
});
