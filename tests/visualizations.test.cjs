// Dependency-free engine tests: node --test tests/visualizations.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const ctx = { console, React: {}, htm: { bind: () => () => null }, document: { getElementById: () => true } };
ctx.window = ctx;
vm.createContext(ctx);
for (const f of ['figs.js', 'viz.js']) vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });
const { buildSortTrace, solveMemory, solveDisk } = ctx.STUDY_SIM;
const clean = a => JSON.parse(JSON.stringify(a));
const values = f => f.items.filter(i => i.k === 'val').sort((a, b) => a.x - b.x).map(i => +i.t);

test('every declared figure is registered, including previously missing OS labs', () => {
  const files = ['app.js', ...fs.readdirSync('courses').map(f => 'courses/' + f)];
  const names = new Set();
  for (const f of files) for (const m of fs.readFileSync(f, 'utf8').matchAll(/(?:["']?fig["']?:\s*|name=)["']([a-z0-9-]+)["']/g)) names.add(m[1]);
  for (const name of names) if (/^(os-|algo-|hci-|invisible-|elevator|vending|truckers|id-)/.test(name)) assert.equal(typeof ctx.FIGS[name], 'function', name);
});

test('sorting engines agree with numeric sort for signed, repeated and singleton keys', () => {
  const inputs = [[3], [0, 0], [5, 2, 4, 6, 1, 3], [9, 8, 7, 6], [-2, 0, -2, 4, 1]];
  for (const arr of inputs) for (const alg of ['insertion', 'merge', 'quick']) {
    const steps = buildSortTrace(alg, arr.join(', '), 1);
    assert.deepEqual(clean(steps.at(-1).arr), arr.slice().sort((a, b) => a - b), alg + ': ' + arr);
    for (const s of steps) assert.ok(s.arr.every(Number.isFinite));
  }
});

test('counting sort preserves zeros and duplicates without clamping input', () => {
  for (const arr of [[0], [0, 3, 0, 2, 1], [2, 5, 3, 0, 2, 3, 0, 3], [30, 0, 30, 2]]) {
    const trace = buildSortTrace('counting', arr.join(','), 1);
    assert.deepEqual(clean(trace.at(-1).extra.B), arr.slice().sort((a, b) => a - b));
    assert.deepEqual(clean(trace[0].arr), arr);
    const frames = ctx.VIZ.run({ type: 'csort', arr });
    assert.match(frames.at(-1).cap[0], new RegExp('Sorted B = \\[' + arr.slice().sort((a, b) => a - b).join(', ') + '\\]'));
  }
});

test('Quickselect returns every requested rank with duplicate/signed keys', () => {
  const arr = [5, -2, 5, 0, 7, -2];
  const sorted = arr.slice().sort((a, b) => a - b);
  for (let rank = 1; rank <= arr.length; rank++) {
    const last = buildSortTrace('select', arr.join(','), rank).at(-1);
    const highlighted = Object.keys(last.roles).find(i => last.roles[i] === 'sorted');
    assert.equal(last.arr[highlighted], sorted[rank - 1]);
  }
});

test('invalid editable input is rejected, never silently truncated or changed', () => {
  for (const str of ['', '2,bad,3', 'Infinity,2', '1.5,2', '1000,1', Array(13).fill(1).join(',')])
    assert.throws(() => buildSortTrace('insertion', str, 1));
  for (const str of ['-1,2', '31,0']) assert.throws(() => buildSortTrace('counting', str, 1));
  assert.throws(() => buildSortTrace('select', '2,3', 3));
  assert.throws(() => ctx.VIZ.parse('isort', 'start 1.5 2'), /whole numbers/);
  assert.equal(ctx.VIZ.parse('bsearch', 'start 0 2 4, search 0').target, 0);
  assert.throws(() => ctx.VIZ.run({ type: 'missing' }), /Unknown/);
  assert.throws(() => ctx.VIZ.parse('csort', 'start 1 2 3 4 5 6 7 8 9 1'), /2 to 9/);
});

test('line trace schema accepts both type and legacy kind', () => {
  assert.ok(ctx.VIZ.run({ kind: 'isort', arr: [2, 1] }).length > 2);
  assert.deepEqual(clean(values(ctx.VIZ.run({ type: 'isort', arr: [3, 1, 2] }).at(-1))), [1, 2, 3]);
});

test('partition fixes only the pivot and preserves the partition invariant', () => {
  const out = ctx.VIZ.run({ type: 'qsort', arr: [4, 8, 2, 5, 1, 4, 0] }).at(-1);
  const arr = values(out), p = +out.vars.find(([key]) => key === 'pivot index')[1] - 1;
  assert.equal(arr[p], 4);
  assert.ok(arr.slice(0, p).every(v => v <= 4));
  assert.ok(arr.slice(p + 1).every(v => v > 4));
});

test('custom Dijkstra uses supplied directed weighted graph and source', () => {
  const frames = ctx.VIZ.run({ type: 'dijkstra', nodes: ['s', 't', 'x', 'y', 'z'], source: 's', edges: [['s','t',10],['s','y',5],['t','x',1],['t','y',2],['y','t',3],['y','x',9],['y','z',2],['x','z',4],['z','x',6],['z','s',7]] });
  const vars = Object.fromEntries(frames.at(-1).vars);
  for (const [n, d] of Object.entries({ s: 0, t: 8, x: 9, y: 5, z: 7 })) assert.match(vars[`d[${n}] (p)`], new RegExp('^' + d + ' '));
  assert.ok(frames[0].items.some(i => i.id.startsWith('w') && i.t === '10'), 'weights are rendered');
  assert.throws(() => ctx.VIZ.run({ type: 'dijkstra', nodes: ['s', 't'], source: 's', edges: [['s', 't', -1]] }), /nonnegative/);
  const disconnected = ctx.VIZ.run({ type: 'dijkstra', nodes: ['s', 't'], source: 't', edges: [] });
  assert.match(disconnected.at(-1).cap[0], /s=Infinity, t=0/);
});

test('memory placement conserves space and reproduces classic first/best fit distinction', () => {
  for (const policy of ['first', 'best', 'worst']) {
    const frames = solveMemory([100, 500, 200, 300, 600], [212, 417, 112, 426], policy);
    for (const f of frames) assert.equal(f.blocks.reduce((s, b) => s + b.size, 0), 1700);
    assert.equal(frames.at(-1).blocks.some(b => b.id === 'P4'), policy === 'best');
  }
});

test('disk scheduling movement includes endpoints, wrap travel and duplicate requests', () => {
  const input = '98,183,37,122,14,124,65,67';
  for (const [alg, expected] of Object.entries({ FCFS: 640, SSTF: 236, SCAN: 331, 'C-SCAN': 382, LOOK: 299, 'C-LOOK': 322 }))
    assert.equal(solveDisk(input, 53, alg, 'up').at(-1).total, expected, alg);
  assert.equal(solveDisk('53,53', 53, 'LOOK', 'up').length, 3);
  assert.equal(solveDisk('10,20', 0, 'SCAN', 'up').at(-1).total, 20);
  assert.throws(() => solveDisk('2,NaN', 53, 'FCFS', 'up'));
});

test('every authored lecture visualization can build a nonempty trace', () => {
  for (const file of fs.readdirSync('courses').filter(f => f.endsWith('.js'))) vm.runInContext(fs.readFileSync('courses/' + file, 'utf8'), ctx);
  let count = 0;
  function visit(obj) {
    if (!obj || typeof obj !== 'object') return;
    if (obj.viz) for (const spec of [].concat(obj.viz)) {
      assert.ok(ctx.VIZ.run(spec).length > 0, JSON.stringify(spec)); count++;
    }
    for (const [key, val] of Object.entries(obj)) if (key !== 'viz') visit(val);
  }
  visit(ctx.COURSES);
  assert.ok(count >= 16, 'expected existing course examples');
});
