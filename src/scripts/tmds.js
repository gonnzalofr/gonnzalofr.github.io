/* tmds.js — "Try the encoder" (HDMI page). encode() is a one-to-one port of tmds_encoder.v
   (Verilog names in comments); decode() follows tmds_decode() in tb_tmds_encoder.v. */
(function () {
  var fig = document.getElementById('fig-tmds');
  if (!fig) return;
  var $ = function (id) { return document.getElementById(id); };

  function ones(v) { var n = 0, i; for (i = 0; i < 8; i++) n += (v >> i) & 1; return n; }  // count_one

  function encode(d, cnt_r) {
    var N1 = ones(d), b = [], s = [], o = [], i, N2 = 0, cnt_n, br, inv;
    for (i = 0; i < 8; i++) b[i] = (d >> i) & 1;
    s[0] = b[0];  // stage1
    if (N1 > 4 || (!b[0] && N1 === 4)) {  // XNOR chain, stage1[8] = 0
      for (i = 1; i < 8; i++) s[i] = 1 - (s[i - 1] ^ b[i]);
      s[8] = 0;
    } else {  // XOR chain, stage1[8] = 1
      for (i = 1; i < 8; i++) s[i] = s[i - 1] ^ b[i];
      s[8] = 1;
    }
    for (i = 0; i < 8; i++) N2 += s[i];  // N2 of stage1[7:0]
    if (cnt_r === 0 || N2 === 4) {  // stage2, branch 1
      br = 0; inv = !s[8];
      cnt_n = inv ? cnt_r - (2 * N2 - 8) : cnt_r + (2 * N2 - 8);
    } else if ((cnt_r > 0 && N2 > 4) || (cnt_r < 0 && N2 < 4)) {  // branch 2: invert
      br = 1; inv = 1;
      cnt_n = cnt_r - (2 * N2 - 8) + (s[8] ? 2 : 0);
    } else {  // branch 3: keep
      br = 2; inv = 0;
      cnt_n = cnt_r + (2 * N2 - 8) - (s[8] ? 0 : 2);
    }
    for (i = 0; i < 8; i++) o[i] = inv ? 1 - s[i] : s[i];  // stage2
    o[8] = s[8]; o[9] = inv ? 1 : 0;
    return { b: b, s: s, o: o, N1: N1, N2: N2, inv: inv, br: br, cnt_n: cnt_n };
  }

  function decode(q) {  // tmds_decode(sym)
    var m = [], r = [], d = 0, i;
    for (i = 0; i < 8; i++) m[i] = q[9] ? 1 - q[i] : q[i];
    r[0] = m[0];
    for (i = 1; i < 8; i++) r[i] = q[8] ? m[i] ^ m[i - 1] : 1 - (m[i] ^ m[i - 1]);
    for (i = 0; i < 8; i++) d |= r[i] << i;
    return d;
  }

  function lvl(c) { return 110 - c * 8; }
  var ramp = '';
  // self-check over one line (d = x mod 256, cnt_r = 0); its first 256 symbols are the trace at rest
  (function () {
    var cnt = 0, bad = [], nbad = 0, maxT = 0, maxC = 0, x, e, t, i;
    for (x = 0; x < 640; x++) {
      e = encode(x & 255, cnt); cnt = e.cnt_n;
      if (x < 256) ramp += ' ' + x * 3 + ',' + lvl(cnt) + ' ' + (x * 3 + 3) + ',' + lvl(cnt);
      if (decode(e.o) !== (x & 255) && !bad[x & 255]) { bad[x & 255] = 1; nbad++; }
      for (t = 0, i = 0; i < 9; i++) t += e.o[i] !== e.o[i + 1];
      if (t > maxT) maxT = t;
      if (Math.abs(cnt) > maxC) maxC = Math.abs(cnt);
    }
    var ok = !nbad && maxT <= 5 && maxC <= 8;
    $('tmds-check').textContent = (ok ? 'self-check: ' : 'self-check failed: ') + (256 - nbad) +
      '/256 round-trip · max ' + maxT + ' transitions · |disparity| ≤ ' + maxC;
  })();

  function hex(d) { return '0x' + (d < 16 ? '0' : '') + d.toString(16).toUpperCase(); }
  function sgn(c) { return c > 0 ? '+' + c : c < 0 ? '−' + (-c) : '0'; }
  function str(bits) { return bits.slice().reverse().join(''); }  // msb first
  function wave(bits, top) {  // bit 0 first, 36/bit
    var y = function (v) { return top + (v ? 5 : 25); }, p = 'M130 ' + y(bits[0]), i;
    for (i = 1; i < bits.length; i++) if (bits[i] !== bits[i - 1]) p += 'H' + (130 + 36 * i) + 'V' + y(bits[i]);
    return p + 'H' + (130 + 36 * bits.length);
  }
  function text(id, t) { $(id).textContent = t; }

  function render(d, cnt_r, x) {
    var e = encode(d, cnt_r), s8 = e.s[8], N2 = e.N2, chain = s8 ? 'XOR' : 'XNOR';
    text('tmds-d', hex(d)); text('tmds-c', sgn(cnt_r)); din.setAttribute('aria-valuetext', hex(d));
    $('tw-d').setAttribute('d', wave(e.b, 18));
    $('tw-m').setAttribute('d', wave(e.s, 56));
    $('tw-q').setAttribute('d', wave(e.o, 94));
    text('tl-d', 'd = ' + hex(d));
    text('ts-d', str(e.b)); text('ts-m', str(e.s)); text('ts-q', str(e.o));
    text('tn-d', 'N1 = ' + e.N1 + (x < 0 ? '' : ' · x ' + x + '/640'));
    text('tn-m', chain + ' · q_m[8] = ' + s8);
    text('tn-q', 'cnt_r ' + sgn(cnt_r) + ' → ' + sgn(e.cnt_n));
    text('tx-1', 'N1 = ' + e.N1 + ' ones in d' + (e.N1 === 4 ? ', d[0] = ' + e.b[0] : '') +
      ' → ' + chain + ' chain, q_m[8] = ' + s8);
    var why = e.br === 0 ? (cnt_r === 0 ? 'cnt_r = 0' : 'N2 = 4') + ' → q_m[8] decides'
      : 'cnt_r = ' + sgn(cnt_r) + (cnt_r > 0 ? ' > 0' : ' < 0') + ', N2 = ' + N2 + (N2 > 4 ? ' > 4' : ' < 4');
    text('tx-2', 'q_m[7:0]: ' + N2 + ' ones, ' + (8 - N2) + ' zeros · ' + why +
      ' → ' + (e.inv ? 'invert, q_out[9] = 1' : 'keep, q_out[9] = 0'));
    return e;
  }

  var run = $('tmds-run'), din = $('tmds-in'), cin = $('tmds-cnt'), trace = $('tmds-trace');
  var timer = null, x = -1, cnt = 0, pts = '';

  function single(draw) {  // one symbol, at its byte
    var c0 = +cin.value, d = +din.value, e = render(d, c0, -1), c1 = e.cnt_n, a = d * 3;
    text('tmds-res', 'q_out = ' + str(e.o) + ' · cnt_r ' + sgn(c0) + ' → ' + sgn(c1));
    text('tmds-why', $('tx-1').textContent + '\n' + $('tx-2').textContent);
    if (draw) trace.setAttribute('points', Math.max(0, a - 30) + ',' + lvl(c0) + ' ' + a + ',' + lvl(c0) + ' ' +
      a + ',' + lvl(c1) + ' ' + Math.min(768, a + 33) + ',' + lvl(c1));
  }
  function tick() {
    x = (x + 1) % 640;
    if (x === 0) cnt = 0;  // blanking: cnt_r <= 0
    if (x % 256 === 0) pts = '';
    var d = x & 255, xx = (x & 255) * 3, y;
    din.value = d; cin.value = cnt;
    cnt = render(d, cnt, x).cnt_n;
    y = lvl(cnt);
    pts += ' ' + xx + ',' + y + ' ' + (xx + 3) + ',' + y;
    trace.setAttribute('points', pts);
  }
  run.addEventListener('change', function () {
    din.disabled = cin.disabled = run.checked;
    if (run.checked) { text('tmds-why', ''); x = -1; tick(); timer = setInterval(tick, 125); }
    else { clearInterval(timer); single(1); }
  });
  din.addEventListener('input', function () { single(1); });
  cin.addEventListener('input', function () { single(1); });
  din.disabled = cin.disabled = run.disabled = false;
  if (run.checked) run.dispatchEvent(new Event('change'));
  else { single(0); trace.setAttribute('points', ramp); }
})();
