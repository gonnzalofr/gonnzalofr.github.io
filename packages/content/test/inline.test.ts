import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inline, inlineProblems, keep, resolve } from '../src/inline.ts';

test('the site\'s inline marks are accepted', () => {
  for (const s of [
    '<span class="nc">TU/e</span> 5EWC0 · <span class="nb">2025 – 26</span>',
    '<span class="status">in progress</span> — timing verified',
    'Student Assistant &amp; Course Reviewer',
    '<a href="https://www.teamdaedalus.eu/" rel="noopener">teamdaedalus.eu <span aria-hidden="true">↗</span></a>',
    '<a href="~/notes.html#daedalus">Student Team Daedalus</a>',
    '<a href="mailto:a@b.nl">a@b.nl</a><br><a href="#contact">Contact</a>',
  ]) assert.deepEqual(inlineProblems(s), [], s);
});

test('anything else is rejected', () => {
  assert.throws(() => inline.parse('<div>block</div>'));
  assert.throws(() => inline.parse('<span style="color:red">x</span>'));
  assert.throws(() => inline.parse('<span class="huge">x</span>'));
  assert.throws(() => inline.parse('<a href="notes.html">relative, not from the root</a>'));
  assert.throws(() => inline.parse('Tom & Jerry'));
  assert.throws(() => inline.parse('<span class="nb">unclosed'));
  assert.throws(() => inline.parse(''));
});

test('root links resolve per page depth', () => {
  const s = '<a href="~/cv.html">CV</a>';
  assert.equal(resolve(s, ''), '<a href="cv.html">CV</a>');
  assert.equal(resolve(s, '../'), '<a href="../cv.html">CV</a>');
});

test('keep() wraps only what can break', () => {
  assert.equal(keep('2026'), '2026');
  assert.equal(keep('2025 – 26'), '<span class="nb">2025 – 26</span>');
});
