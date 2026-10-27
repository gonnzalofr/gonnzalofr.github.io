// Dev-only tweaks bar: a client:only island (components/DevTweaks.astro) that Document.astro renders only under
// `pnpm dev`, so it never reaches dist/. Each control writes one custom property on :root that the stylesheet already
// reads; "Copy values" gives the settings as CSS; the values belong in packages/tokens/src/tokens.ts. Settings persist
// in localStorage for this browser only.
import { useEffect, useState } from 'react';
import { grounds, inks } from '@portfolio/tokens';

// warmth 1 = E2, the owner's pick: the current tokens
const warm: Record<string, string> = {
  ...Object.fromEntries(Object.entries(grounds).map(([name, { g }]) => [`--g-${name}`, g])),
  '--ink-light': inks.light.ink, '--ink-dark': inks.dark.ink, '--dim-light': inks.light.dim, '--dim-dark': inks.dark.dim,
};
// warmth 0 = the neutral grounds of the first E (kept here only as the slider's other end)
const neutral: Record<string, string> = { '--g-black': '#0A0A0A', '--g-paper': '#FAFAFA', '--g-sand': '#E6E2D6', '--g-walnut': '#16181A', '--g-dusk': '#D5DDE0', '--ink-light': '#F2F2EE', '--ink-dark': '#121212', '--dim-light': '#A3A39C', '--dim-dark': '#53534E' };
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i]! - v) * t).toString(16).padStart(2, '0')).join('').toUpperCase();

/** One slider: a custom property (or the warmth, which mixes every ground and ink). */
const controls = [
  { label: 'name size', v: '--k-name', min: 0.6, max: 1.6, step: 0.02, value: 1 },
  { label: 'name width', v: '--name-wdth', min: 100, max: 150, step: 1, value: 150 },
  { label: 'name weight', v: '--name-wght', min: 500, max: 900, step: 10, value: 800 },
  { label: 'text size', v: '--k-text', min: 0.85, max: 1.25, step: 0.01, value: 1 },
  { label: 'density', v: '--k-space', min: 0.6, max: 1.5, step: 0.02, value: 1 },
  { label: 'motion', v: '--k-motion', min: 0, max: 3, step: 0.25, value: 1 },
  { label: 'warmth', v: null, min: 0, max: 1, step: 0.05, value: 1 },
] as const;
const defaults = controls.map((c) => String(c.value));
const KEY = 'tweaks-v1';

function saved() {
  try {
    const s: unknown = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (Array.isArray(s)) return defaults.map((d, k) => (typeof s[k] === 'string' ? s[k] : d));
  } catch { /* storage blocked: start from the defaults */ }
  return defaults;
}

export default function Tweaks() {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(saved);

  const vals: Record<string, string> = {};
  controls.forEach((c, k) => {
    const value = values[k]!;
    if (c.v) vals[c.v] = value;
    else for (const key of Object.keys(warm)) vals[key] = mix(neutral[key]!, warm[key]!, +value);
  });
  const css = ':root {\n' + Object.entries(vals).map(([k, v]) => `  ${k}: ${v};`).join('\n') + '\n}';

  useEffect(() => {
    const root = document.documentElement;
    for (const [k, v] of Object.entries(vals)) root.style.setProperty(k, v);
    try { localStorage.setItem(KEY, JSON.stringify(values)); } catch { /* storage blocked: the settings last for this visit */ }
  });

  return (
    <aside className="tw" aria-label="Design tweaks (development only)">
      <style>{`
  .tw { position: fixed; left: 12px; bottom: 12px; z-index: 100; font: 12px/1.3 ui-monospace, Consolas, monospace; color: #111; }
  .tw__toggle { font: inherit; background: #fff; color: #111; border: 1px solid #111; padding: 6px 10px; cursor: pointer; }
  .tw__panel { margin-top: 6px; background: #fff; border: 1px solid #111; padding: 10px; width: 280px; display: grid; gap: 6px; }
  .tw__panel[hidden] { display: none; }
  .tw label { display: grid; grid-template-columns: 6.5em 1fr 3.2em; align-items: center; gap: 6px; }
  .tw input[type="range"] { width: 100%; }
  .tw output { text-align: right; }
  .tw__row { margin: 4px 0 0; display: flex; gap: 6px; }
  .tw button { font: inherit; background: #fff; color: #111; border: 1px solid #111; padding: 4px 8px; cursor: pointer; }
  .tw textarea { font: 11px/1.3 ui-monospace, Consolas, monospace; width: 100%; resize: vertical; }
`}</style>
      <button className="tw__toggle" type="button" aria-expanded={open} aria-controls="tw-panel" onClick={() => setOpen(!open)}>tweaks</button>
      <div className="tw__panel" id="tw-panel" hidden={!open}>
        {controls.map((c, k) => (
          <label key={c.label}>{c.label} <input type="range" min={c.min} max={c.max} step={c.step} value={values[k]} onChange={(e) => { const v = e.currentTarget.value; setValues((vs) => vs.map((x, i) => (i === k ? v : x))); }} /><output>{values[k]}</output></label>
        ))}
        <p className="tw__row">
          <button type="button" onClick={() => setValues(defaults)}>Reset</button>{' '}
          <button type="button" onClick={(e) => { const t = e.currentTarget.closest('.tw')?.querySelector('textarea'); t?.select(); navigator.clipboard?.writeText(css).catch(() => {}); }}>Copy values</button>
        </p>
        <textarea readOnly rows={4} aria-label="Current values as CSS" value={css} />
      </div>
    </aside>
  );
}
