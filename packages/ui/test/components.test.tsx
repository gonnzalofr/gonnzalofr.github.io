import { describe, expect, test } from 'vitest';
import { SiteHeader } from '../src/chrome/SiteHeader.tsx';
import { Turn } from '../src/chrome/Turn.tsx';
import { Section } from '../src/layout/Section.tsx';
import { Col } from '../src/layout/Col.tsx';
import { Checklist, MetaRow } from '../src/text/Lists.tsx';
import { Status } from '../src/text/Marks.tsx';
import { Curriculum } from '../src/work/Curriculum.tsx';
import { html } from './render.tsx';

describe('SiteHeader', () => {
  test('marks the current page, and a case study as inside Work', () => {
    expect(html(<SiteHeader current="cv" hasLog={false} />)).toContain('<a class="head__mid" href="../cv.html" aria-current="page">CV</a>');
    const work = html(<SiteHeader current="work-case" hasLog={false} />);
    expect(work).toContain('<a class="head__mid" href="index.html" aria-current="true">Work</a>');
    expect(work).not.toContain('Log');
  });

  test('links Log once an entry is published; an entry is inside Log', () => {
    expect(html(<SiteHeader current="log" entry hasLog />)).toContain('<a class="head__mid" href="../log/index.html" aria-current="true">Log</a>');
  });
});

describe('Section', () => {
  test('a titled section has the rule, the reading and the heading', () => {
    expect(html(<Section id="skills" reading="3 rows" title="Skills"><p>x</p></Section>))
      .toBe('<section class="page sec" id="skills"><hr class="sec__rule col-full"/><p class="sec__reading col-margin">3 rows</p><h2 class="col-head">Skills</h2><p>x</p></section>');
  });
  test('an untitled one is only the band', () => {
    expect(html(<Section><p>x</p></Section>)).toBe('<section class="page sec"><p>x</p></section>');
  });
});

test('Col places by span only, with a listed hook after it', () => {
  expect(html(<Col span="prose" hook="cv__pdf">PDF</Col>)).toBe('<p class="col-prose cv__pdf">PDF</p>');
});

test('Checklist ticks only what is done, and says every state in words', () => {
  const out = html(<Checklist items={[{ state: 'done', text: 'timing' }, { state: 'in progress', text: 'serializer' }]} />);
  expect(out.match(/<path /g)).toHaveLength(1);
  expect(out).toContain('<span class="check__state">in progress</span>serializer');
});

test('Status: words, with the open square only while in progress', () => {
  expect(html(<Status value="in progress" />)).toBe('<span class="status">in progress</span>');
  expect(html(<Status value="complete" />)).toBe('complete');
});

test('MetaRow: one cell per item', () => {
  expect(html(<MetaRow items={[{ label: 'Role', value: 'All' }]} />)).toBe('<dl class="meta col-full"><div class="meta__cell"><dt>Role</dt><dd>All</dd></div></dl>');
});

test('Turn: the neighbors on their grounds', () => {
  const out = html(<Turn prev={{ href: 'a.html', no: '01', name: 'A', ground: 'black' }} next={{ href: 'b.html', no: '03', name: 'B', ground: 'paper' }} />);
  expect(out).toContain('<a data-ground="black" href="a.html" rel="prev"><span class="mono">01</span> <span aria-hidden="true">←</span> A</a>');
  expect(out).toContain('<a data-ground="paper" class="turn__next" href="b.html" rel="next"><span class="mono">03</span> B <span aria-hidden="true">→</span></a>');
});

test('Curriculum: credits read as "5 ECTS", continued courses have none', () => {
  const out = html(<Curriculum years={[{ n: 1, dates: '2025 – 26', line: 'complete · 60 ECTS', quartiles: [{ state: 'complete', courses: [
    { code: '5EWC0', name: 'Challenge', type: 'core', ects: 5 }, { code: '5EWC0', name: 'Challenge', type: 'continued' },
  ] }] }]} />);
  expect(out).toContain('<span class="cur__ects">5<span class="vh"> ECTS</span></span>');
  expect(out).toContain('<span class="cur__type">continued</span></span><span class="cur__ects"></span>');
});
