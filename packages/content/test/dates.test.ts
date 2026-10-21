// Every date the site prints, in every style it is printed in: the formatter has to reproduce them exactly.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { range, span, when } from '../src/dates.ts';

const cases: [object, string, string, string?][] = [
  // range                                   short                      cv                          long
  [{ from: '2026-07', to: 'present' },      'Jul 2026 – present',      'Jul 2026 – present'],
  [{ from: '2026-05', to: '2026-10' },      'May – Oct 2026',          'May 2026 – Oct 2026'],
  [{ from: '2026' },                        '2026',                    '2026'],
  [{ from: '2025', to: '2026' },            '2025 – 26',               '2025 – 2026'],
  [{ from: '2026-01', to: '2026-10-14' },   'Jan – 14 Oct 2026',       'Jan 2026 – 14 Oct 2026',   'January – 14 October 2026'],
  [{ from: '2026-09', to: '2027-06' },      'Sep 2026 – Jun 2027',     'Sep 2026 – Jun 2027'],
  [{ from: '2027-04', to: '2027-07' },      'Apr – Jul 2027',          'Apr 2027 – Jul 2027'],
  [{ from: '2025-09', to: '2028-07' },      'Sep 2025 – Jul 2028',     'Sep 2025 – Jul 2028'],
  [{ from: '2025', to: '2028' },            '2025 – 28',               '2025 – 2028'],
];

for (const [r, short, cv, long] of cases) {
  test(`${JSON.stringify(r)} → "${short}" / "${cv}"`, () => {
    const parsed = range.parse(r);
    assert.equal(when(parsed, 'short'), short);
    assert.equal(when(parsed, 'cv'), cv);
    if (long) assert.equal(when(parsed, 'long'), long);
  });
}

test('span: the years a set of ranges covers', () => {
  assert.deepEqual(span([{ from: '2026-07', to: 'present' }, { from: '2025', to: '2026' }]), { from: '2025', to: 'present' });
  assert.deepEqual(span([{ from: '2025-09', to: '2028-07' }, { from: '2023-09', to: '2024-06' }]), { from: '2023', to: '2028' });
});

test('malformed dates are rejected', () => {
  assert.throws(() => range.parse({ from: '2026-13' }));
  assert.throws(() => range.parse({ from: 'Jul 2026' }));
  assert.throws(() => range.parse({ from: '2026', until: '2027' }));
});
