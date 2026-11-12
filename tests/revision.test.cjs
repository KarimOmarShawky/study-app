// Guards the midterm revision content (rev.js → data/rev.js): the page breaks silently if a lecture or a mock
// question loses a field, and the mock's marks are meant to add up to exactly 100.
// No browser or packages required: node --test tests/*.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), vm = require('node:vm');
const ctx = { console }; ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync('rev.js', 'utf8'), ctx, { filename: 'rev.js' });
const R = ctx.REV.algo;

const html = s => typeof s === 'string' && s.length > 0;

test('revision: 14 lectures, numbered 1–14, each teachable on its own', () => {
  assert.equal(R.lectures.length, 14);
  assert.equal(R.lectures.map(l => l.n).join(','), '1,2,3,4,5,6,7,8,9,10,11,12,13,14');
  for (const l of R.lectures) {
    assert.ok(html(l.t), `L${l.n} title`);
    assert.ok(html(l.one), `L${l.n} one-liner`);
    assert.equal(l.keep.length, 3, `L${l.n} keeps three things`);
    l.keep.forEach(k => assert.ok(html(k), `L${l.n} keep text`));
    assert.ok(l.blocks.length >= 3, `L${l.n} has teaching blocks`);
    for (const b of l.blocks) assert.ok(html(b.h) || html(b.p) || html(b.key) || html(b.code) || html(b.table), `L${l.n} block has content`);
    assert.ok(html(l.exam), `L${l.n} says how the paper asks it`);
  }
});

test('revision: tables are rectangular and every row has a header width', () => {
  const tables = R.lectures.flatMap(l => l.blocks.filter(b => b.table).map(b => [l.n, b.table]));
  assert.ok(tables.length >= 4, 'a few tables');
  for (const [n, t] of tables) {
    const w = t[0].length;
    for (const row of t) assert.equal(row.length, w, `L${n} table row width`);
  }
});

test('revision: the mock is 25 questions worth 100 marks, every one answered', () => {
  const qs = R.mock.questions;
  assert.equal(qs.length, 25);
  assert.equal(qs.map(q => q.n).join(','), Array.from({ length: 25 }, (_, i) => i + 1).join(','));
  assert.equal(qs.reduce((a, q) => a + q.marks, 0), 100);
  for (const q of qs) {
    assert.ok(q.marks > 0, `Q${q.n} marks`);
    assert.ok(html(q.topic) && html(q.q) && html(q.ans), `Q${q.n} has topic, question and answer`);
  }
  // the first twelve questions are the 48-mark one-hour paper
  assert.equal(qs.slice(0, 12).reduce((a, q) => a + q.marks, 0), 48);
});

test('revision: the mock covers every lecture of the course', () => {
  const topics = R.mock.questions.map(q => q.topic).join(' ').toLowerCase();
  const families = ['master method', 'iteration', 'recursion tree', 'substitution', 'loop complexity', 'growth',
    'true / false', 'sorting table', 'quicksort', 'counting sort', 'lower bound', 'hashing', 'double hashing',
    'open addressing', 'divide and conquer', 'fast powering', 'median of two arrays', 'selection',
    'red-black', 'rbt insertion', 'rbt deletion', 'order-statistic', 'skip list', 'divide-and-conquer code', 'dynamic programming'];
  for (const f of families) assert.ok(topics.includes(f), 'mock covers ' + f);
});

test('revision: the pattern table points at the years the papers were set', () => {
  assert.ok(R.patterns.rows.length >= 12);
  const years = R.patterns.rows.map(r => r[1]).join(' ');
  for (const y of ['2020', '2021', '2022', '2023', '2024', '2025']) assert.ok(years.includes(y), 'mentions ' + y);
  for (const row of R.patterns.rows) assert.equal(row.length, 4, 'topic, years, what it looks like, marks');
});
