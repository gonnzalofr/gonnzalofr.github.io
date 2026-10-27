// The derived strings, against what the pages printed when they were written by hand.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { builds, curriculum, cv, project, projects } from '../src/index.ts';
import * as v from '../src/views.ts';

test('home and footer study lines', () => {
  assert.equal(v.homeKicker, '<span class="nc">BSc</span> Electrical Engineering · <span class="nc">TU/e</span> · <span class="nb">2025 – 28</span> · Eindhoven');
  assert.equal(v.footerStudy, 'BSc EE · TU/e · <span class="nb">2025 – 28</span>');
  assert.equal(v.revised, 'October 2026');
});

test('intro facts: roles are Now or Next by their dates', () => {
  const f = v.introFacts();
  assert.deepEqual(f.map((x) => x.label), ['Study', 'Team', 'Now', 'Next', 'Languages', 'Work auth', 'Schooling']);
  assert.equal(f[1]!.value, '<a href="~/notes.html#daedalus">Student Team Daedalus</a> · <span class="nb">Jan – 14 Oct 2026</span>');
  assert.equal(f[3]!.value, 'Student Assistant &amp; Course Reviewer, Communication 1 · <span class="nb">Apr – Jul 2027</span>');
});

test('project lines', () => {
  assert.equal(v.bandMeta(project('rock-your-baby')), 'C · libpynq — <span class="nc">TU/e</span> 5EWC0 · <span class="nb">2025 – 26</span> — complete');
  assert.equal(v.bandMeta(project('hdmi-dvi-transmitter')), 'Verilog · XSIM · PYNQ-Z2 — <span class="nb">Jul 2026 – present</span> — <span class="status">in progress</span>');
  assert.equal(v.rowWhen(project('venus-rover')), 'TU/e 5EID0 · 2026');
  assert.equal(v.caseKicker(project('venus-rover')), '<span class="nc">TU/e</span> 5EID0 · Group 10 · 2026');
  assert.equal(v.caseKicker(project('hifi-player')), 'Personal design study · <span class="nb">May – Oct 2026</span>');
});

// the counts follow from the data, so these tests state the format and take the numbers from it: adding a project
// (docs/add-a-project.md) must not mean editing them
test('counts', () => {
  const n = projects.length;
  const running = projects.filter((p) => p.status === 'in progress').length;
  assert.equal(v.homeWorkKicker, `${n} case studies · 1 team · 5 smaller builds — pick one`);
  assert.equal(v.workKicker, `${n} case studies · 5 smaller builds · <span class="nb">2025 – present</span>`);
  assert.equal(v.projectsReading, `${n} projects · ${running} in progress`);
  assert.equal(v.buildsReading, '5 builds · 1 in progress');
});

test('prev/next wraps around in case-study order', () => {
  const first = projects[0]!;
  const last = projects.at(-1)!;
  assert.deepEqual(v.turn(first.slug).prev, last);
  assert.deepEqual(v.turn(last.slug).next, first);
  assert.deepEqual(v.turn('venus-rover'), { prev: project('hdmi-dvi-transmitter'), next: project('hifi-player') });
});

test('projects are numbered 01… in order, with unique slugs', () => {
  assert.deepEqual(projects.map((p) => p.no), projects.map((_, i) => String(i + 1).padStart(2, '0')));
  assert.equal(new Set(projects.map((p) => p.slug)).size, projects.length);
  assert.equal(new Set(builds.map((b) => b.id)).size, builds.length);
});

test('curriculum credits', () => {
  assert.deepEqual(curriculum.map(v.yearLine), ['completed · 60 ECTS', 'in progress · 65 ECTS planned', 'planned · 50 ECTS']);
});

test('CV dates and readings', () => {
  assert.equal(v.cvDate(cv.experience[2]!), 'Jan 2026 – <span class="nb">14 Oct 2026</span>');
  assert.equal(v.cvDate({ dates: project('hifi-player').dates }), 'May 2026 – Oct 2026');
  assert.equal(v.educationReading, '<span class="nb">2023 – 2028</span> · 3 schools');
  assert.equal(v.cvProjectsReading, '4 projects · <span class="nb">2025 – present</span>');
  assert.equal(v.experienceReading, '<span class="nb">2026 – 2027</span>');
  assert.equal(v.cvKicker, 'Curriculum vitae · October 2026');
});
