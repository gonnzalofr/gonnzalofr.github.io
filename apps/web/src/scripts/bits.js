/* bits.js — the bit field on the home reel's first slide: the first 256 pixels of one 640×480 line on the three TMDS
   encoder lanes (D2 red = x mod 256, D1 and D0 zero), ten bits per pixel clock, q[0] at the top, each column painted
   in its pixel's own color. encode() is the same one-to-one port of tmds_encoder.v as tmds.js; the running disparity
   starts at 0 because the encoder resets it during blanking. It only redraws when the reader moves the cursor. */
function ones(v) { let n = 0; for (let i = 0; i < 8; i++) n += (v >> i) & 1; return n; }
function encode(d, cnt_r) {
  const N1 = ones(d), b = [], s = [], o = [];
  let N2 = 0, cnt_n, inv;
  for (let i = 0; i < 8; i++) b[i] = (d >> i) & 1;
  s[0] = b[0];
  if (N1 > 4 || (!b[0] && N1 === 4)) { for (let i = 1; i < 8; i++) s[i] = 1 - (s[i - 1] ^ b[i]); s[8] = 0; }
  else { for (let i = 1; i < 8; i++) s[i] = s[i - 1] ^ b[i]; s[8] = 1; }
  for (let i = 0; i < 8; i++) N2 += s[i];
  if (cnt_r === 0 || N2 === 4) { inv = !s[8]; cnt_n = inv ? cnt_r - (2 * N2 - 8) : cnt_r + (2 * N2 - 8); }
  else if ((cnt_r > 0 && N2 > 4) || (cnt_r < 0 && N2 < 4)) { inv = 1; cnt_n = cnt_r - (2 * N2 - 8) + (s[8] ? 2 : 0); }
  else { inv = 0; cnt_n = cnt_r + (2 * N2 - 8) - (s[8] ? 0 : 2); }
  for (let i = 0; i < 8; i++) o[i] = inv ? 1 - s[i] : s[i];
  o[8] = s[8]; o[9] = inv ? 1 : 0;
  return { q: o, cnt: cnt_n };
}
const LANES = [[], [], []];
{ const c = [0, 0, 0]; for (let x = 0; x < 256; x++) for (let l = 0; l < 3; l++) { const d = l ? 0 : x, r = encode(d, c[l]); c[l] = r.cnt; LANES[l].push({ d, q: r.q, cnt: r.cnt }); } }
const hex = (v) => '0x' + (v < 16 ? '0' : '') + v.toString(16).toUpperCase();
const sgn = (v) => (v > 0 ? '+' + v : v < 0 ? '−' + -v : '0');

function field(box) {
  const fig = box.closest('figure'), cv = box.querySelector('canvas'), ctx = cv.getContext('2d');
  const out = fig.querySelector('output'), xr = fig.querySelector('.bits__x');
  const names = [['D2', 'red', 'd = x'], ['D1', 'green', 'd = 0'], ['D0', 'blue', 'd = 0']];
  const lanesLbl = fig.querySelector('.bits__lanes');
  let N = 256, L = 3, cw = 0, lh = 0, fs = 0, gut = 0, adv = 0.6, cursor = -1, W = 0, H = 0, ink = '#F4ECDF', dim = '#B3A796';
  const top = (li) => li * (lh * 10 + lh * 0.9);
  function layout() {
    W = box.clientWidth; if (!W) return;
    const cs = getComputedStyle(box); ink = cs.getPropertyValue('--ink').trim() || ink; dim = cs.getPropertyValue('--dim').trim() || dim;
    N = W >= 760 ? 256 : W >= 420 ? 128 : 64;
    ctx.font = '400 10px "Azeret Mono"'; adv = ctx.measureText('0').width / 10 || 0.6;
    gut = Math.min(84, Math.max(46, W * 0.06));
    cw = (W - gut) / N;
    // as wide as the slide allows, and no taller than the room the slide leaves above the build name
    const cap = fig.querySelector('figcaption'), room = fig.clientHeight - (cap ? cap.offsetHeight + 12 : 0);
    const lhW = Math.round(((cw / adv) * 0.98) * 1.16);
    L = room > 0 && room < 31.8 * 6 ? 1 : 3;           // a short window (a phone on its side): only D2, the lane that carries the ramp
    const lhH = room > 0 ? Math.floor(room / (L === 3 ? 31.8 : 10.2)) : lhW;
    lh = Math.max(L === 3 ? 6 : 4, Math.min(lhW, lhH)); fs = Math.max(4, Math.min((cw / adv) * 0.98, lh / 1.12, 14));
    H = L === 3 ? lh * 30 + lh * 2 * 0.9 : lh * 10 + 2;
    if (lanesLbl) lanesLbl.textContent = L === 3 ? 'Lanes D2, D1, D0' : 'Lane D2 (D1 and D0 need a taller window)';
    if (xr) xr.textContent = 'x = 0 … ' + (N - 1);
    document.querySelectorAll('.bits__n').forEach((el) => { el.textContent = N; });   // the slide's sentence names the pixels actually drawn
    const dpr = window.devicePixelRatio || 1;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw();
  }
  // every glyph clears 4.5:1 on what is behind it: 1 and 0 differ by weight, not by fading. On the D2 lane each column is
  // its pixel, rgb(d, 0, 0): white glyphs up to d = 236, black from 237 (both ≥ 4.6:1 there).
  // Between d ≈ 216 and 250 the red is too light for white and too dark for black to clear 4.5:1 by much (the best any
  // single glyph color reaches is 4.6:1, at the 236/237 flip), so there both digits are drawn heavy: fully covered pixels
  // reach the nominal contrast instead of losing it to antialiasing. Their shapes still tell 1 from 0.
  const band = (d) => d >= 216;
  function glyphs(li, bit, weight, color) {
    // on a 1x screen the digits are heavy (so their pixels reach full contrast) but smaller in their cell, so the pixel's own red still shows around them
    const small = (window.devicePixelRatio || 1) < 2 && fs < 10, g = small ? fs * 0.76 : fs;
    const t = top(li), normal = weight + ' ' + g + 'px "Azeret Mono"', heavy = '800 ' + fs + 'px "Azeret Mono"';
    for (let xi = 0; xi < N; xi++) {
      const sy = LANES[li][xi], hv = !li && band(sy.d), gs = hv ? fs : g;   // the bright end: full size and heavy
      const px = gut + xi * cw + (cw - adv * gs) / 2, dy = (fs - gs) * 0.55;
      ctx.font = hv ? heavy : normal;
      ctx.fillStyle = color || (sy.d > 236 ? '#000000' : '#FFFFFF');
      for (let bi = 0; bi < 10; bi++) if (sy.q[bi] === bit) ctx.fillText(bit ? '1' : '0', px, t + bi * lh + dy);
    }
  }
  function draw() {
    ctx.clearRect(0, 0, W, H); ctx.textBaseline = 'top';
    for (let li = 0; li < L; li++) {
      const t = top(li), lf = Math.max(10, Math.min(12.5, lh * 1.05));
      ctx.font = '500 ' + lf + 'px "Azeret Mono"'; ctx.fillStyle = ink; ctx.fillText(names[li][0], 0, t);
      ctx.font = '400 ' + lf + 'px "Azeret Mono"'; ctx.fillStyle = dim;
      if (lh * 10 > lf * 3.8) { ctx.fillText(names[li][1], 0, t + lf * 1.35); ctx.fillText(names[li][2], 0, t + lf * 2.7); }
      if (!li) for (let xi = 0; xi < N; xi++) { ctx.fillStyle = 'rgb(' + LANES[0][xi].d + ',0,0)'; ctx.fillRect(gut + xi * cw, t - 1, Math.ceil(cw), lh * 10 + 1); }   // the pixel itself
      const thin = (window.devicePixelRatio || 1) < 2 && fs < 10;
      glyphs(li, 1, thin ? 800 : 700, li ? ink : null);
      glyphs(li, 0, thin ? 640 : 300, li ? dim : null);
    }
    if (cursor >= 0) { ctx.strokeStyle = ink; ctx.lineWidth = 1; ctx.strokeRect(Math.round(gut + cursor * cw) - 1.5, -2.5, Math.round(cw) + 2, H + 3); }
  }
  function read(xi) {
    cursor = Math.max(0, Math.min(N - 1, xi)); const s = LANES[0][cursor];
    out.textContent = 'x = ' + cursor + ' · D2 d = ' + hex(s.d) + ' → q[9:0] = ' + s.q.slice().reverse().join('') + ' · running disparity ' + sgn(s.cnt);
    draw();
  }
  cv.addEventListener('mousemove', (e) => { const r = cv.getBoundingClientRect(), xi = Math.floor((e.clientX - r.left - gut) / cw); if (xi >= 0 && xi < N && xi !== cursor) read(xi); });
  box.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;   // leave browser shortcuts alone
    const k = e.key, step = e.shiftKey ? 16 : 1;
    if (k === 'ArrowRight') read((cursor < 0 ? -1 : cursor) + step);
    else if (k === 'ArrowLeft') read((cursor < 0 ? 0 : cursor) - step);
    else if (k === 'Home') read(0); else if (k === 'End') read(N - 1); else return;
    e.preventDefault();
  });
  box.addEventListener('focus', () => { if (cursor < 0) read(0); });
  layout();
  if ('ResizeObserver' in window) { const ro = new ResizeObserver(layout); ro.observe(box); ro.observe(fig); }
  // a move to a screen with another pixel density changes no CSS size: watch the resolution itself
  const dpr = () => matchMedia('(resolution: ' + (window.devicePixelRatio || 1) + 'dppx)').addEventListener('change', () => { layout(); dpr(); }, { once: true });
  dpr();
}

const boxes = document.querySelectorAll('.bits');
if (boxes.length) {
  const go = () => boxes.forEach(field);
  if (document.fonts && document.fonts.load) document.fonts.load('400 12px "Azeret Mono"').then(go, go); else go();
}
