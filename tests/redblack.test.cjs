// Red-black tracer: the lab examples and a random sweep must always end in a valid tree.
// Dependency-free: node --test tests/redblack.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

const ctx = { console, React: {}, htm: { bind: () => () => null }, document: { getElementById: () => true } };
ctx.window = ctx;
vm.createContext(ctx);
for (const f of ['figs.js', 'figs-ag.js', 'viz.js']) vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });
const V = ctx.VIZ;

// Rebuild the drawn tree from a frame: BST order, one connected tree, no red-red, equal black height.
function audit(frame) {
  const nodes = new Map(), kids = new Map(), parent = new Map();
  for (const it of frame.items) if (it.k === 'circ') nodes.set(it.id, { t: String(it.t), red: /rb-red/.test(it.c || '') });
  for (const e of frame.edges) { const k = kids.get(e.a) || []; k[e.side || 0] = e.b; kids.set(e.a, k); parent.set(e.b, e.a); }
  const ids = [...nodes.keys()], rootId = ids.find(id => !parent.has(id)), seen = new Set();
  let order = true;
  const walk = (id, lo, hi) => {
    if (!id) return true;
    const n = nodes.get(id);
    if (!n || seen.has(id)) return false;
    seen.add(id);
    if (n.t === 'NIL') return true;
    const k = Number(n.t);
    if (!(k > lo && k < hi)) order = false;
    const [l, r] = kids.get(id) || [];
    return walk(l, lo, k) && walk(r, k, hi);
  };
  let redRed = false;
  for (const id of ids) {
    const n = nodes.get(id);
    if (n.t === 'NIL' || !n.red) continue;
    const p = parent.get(id);
    if (!p || nodes.get(p).red) redRed = true;
  }
  let bhOk = true;
  const bh = id => {
    if (!id) return 1;
    const n = nodes.get(id);
    if (!n || n.t === 'NIL') return 1;
    const [l, r] = kids.get(id) || [];
    const a = bh(l), b = bh(r);
    if (a !== b) bhOk = false;
    return a + (n.red ? 0 : 1);
  };
  if (rootId != null) bh(rootId);
  const keys = ids.map(id => nodes.get(id).t).filter(t => t !== 'NIL').map(Number).sort((a, b) => a - b);
  return {
    ok: rootId != null && walk(rootId, -Infinity, Infinity) && seen.size === ids.length && order && !redRed && bhOk,
    keys, connected: seen.size === ids.length, order, redRed, bhOk,
  };
}

const frames = spec => V.run(spec);

test('the lab examples end in a valid red-black tree with exactly the expected keys', () => {
  const start = [10, 85, 15, 70, 20, 60, 30, 50, 65, 80, 90, 40, 5, 55];
  const cases = [
    [{ type: 'rbt', keys: start }, start.slice().sort((a, b) => a - b)],
    [{ type: 'rbt', keys: [2, 1, 4, 5, 9, 3, 6, 7] }, [1, 2, 3, 4, 5, 6, 7, 9]],
    [{ type: 'rbt', start: [47, 32, 71, 93], keys: [65, 82, 87] }, [32, 47, 65, 71, 82, 87, 93]],
    [{ type: 'rbt', op: 'delete', start, keys: [5, 55, 30] }, start.filter(k => ![5, 55, 30].includes(k)).sort((a, b) => a - b)],
    [{ type: 'rbt', op: 'delete', start: [47, 32, 71, 93, 65, 82, 87], keys: [32] }, [47, 65, 71, 82, 87, 93]],
    [{ type: 'rbt', op: 'delete', start: [47, 32, 71, 93, 65, 82, 87, 51], keys: [87, 71] }, [32, 47, 51, 65, 82, 93]],
    [{ type: 'rbt', op: 'delete', start: [33, 34, 15, 18, 5, 28], keys: [33] }, [5, 15, 18, 28, 34]],
  ];
  for (const [spec, want] of cases) {
    const fr = frames(spec);
    assert.ok(fr.length >= 4, JSON.stringify(spec) + ': too few frames');
    const a = audit(fr.at(-1));
    assert.deepEqual([a.ok, a.redRed, a.bhOk, a.order], [true, false, true, true], JSON.stringify(spec));
    assert.equal(a.keys.join(','), want.join(','), JSON.stringify(spec));
  }
});

test('every insert and every delete is decided by a question asked before the step', () => {
  const fr = frames({ type: 'rbt', keys: [10, 85, 15, 70, 20, 60, 30, 50, 65, 80, 90, 40, 5, 55] });
  let asks = 0;
  for (let i = 0; i < fr.length; i++) {
    if (!fr[i].ask) continue;
    asks++;
    assert.equal(fr[i].ask.o.length, 3, 'frame ' + i + ': each question offers three answers');
    assert.ok(fr[i].ask.a >= 0 && fr[i].ask.a < 3, 'frame ' + i + ': the right answer is one of them');
    assert.match(fr[i].ask.q[0], /\?$/, 'frame ' + i + ': the question should be a question');
    // the question is answered by a stage that names the case, before any rotation/recolour is performed
    const near = fr.slice(i + 1, i + 3).map(f => f.cap[0]);
    assert.ok(near.some(c => /<b>Case \d<\/b>|<b>Step \d<\/b>/.test(c)), 'frame ' + i + ': the case is never named after the question');
  }
  assert.ok(asks >= 6, 'the case questions should fire: ' + asks);
  const del = frames({ type: 'rbt', op: 'delete', start: [33, 34, 15, 18, 5, 28], keys: [33] });
  const labels = del.filter(f => f.ask).map(f => f.ask.q[0]);
  assert.ok(labels.some(q => /Which case|sibling|nephew/.test(q)), 'the deletion cases are asked too: ' + labels.length);
});

test('a random sweep of inserts and deletes never leaves an invalid tree behind', () => {
  let seed = 20261111;
  const rnd = n => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
  for (let round = 0; round < 40; round++) {
    const pool = Array.from({ length: 30 }, (_, i) => i + 1), keys = [];
    const n = 4 + rnd(9);
    while (pool.length && keys.length < n) keys.push(pool.splice(rnd(pool.length), 1)[0]);
    const start = keys.slice(0, Math.floor(keys.length / 2));
    if (!start.length) continue;
    const insert = { type: 'rbt', start, keys: keys.slice(start.length) };
    if (insert.keys.length) {
      const a = audit(frames(insert).at(-1));
      assert.ok(a.ok, 'insert ' + JSON.stringify(insert) + ' → ' + JSON.stringify(a));
      assert.equal(a.keys.join(','), keys.slice().sort((x, y) => x - y).join(','), 'insert ' + JSON.stringify(insert));
    }
    const del = { type: 'rbt', op: 'delete', start: keys, keys: [keys[rnd(keys.length)]] };
    const b = audit(frames(del).at(-1));
    assert.ok(b.ok, 'delete ' + JSON.stringify(del) + ' → ' + JSON.stringify(b));
    const left = keys.filter(k => k !== del.keys[0]).sort((x, y) => x - y);
    assert.equal(b.keys.join(','), left.join(','), 'delete ' + JSON.stringify(del));
  }
});

test('the "try your own" box can read and write rbt commands', () => {
  const spec = V.parse('rbt', 'start 47 32 71 93, insert 65 82 87');
  assert.equal(JSON.stringify(spec), JSON.stringify({ type: 'rbt', start: [47, 32, 71, 93], keys: [65, 82, 87], op: 'insert' }));
  assert.equal(V.toText(spec), 'start 47 32 71 93, insert 65 82 87');
  const del = V.parse('rbt', 'start 47 32 71 93 65 82 87, delete 32');
  assert.equal(V.toText(del), 'start 47 32 71 93 65 82 87, delete 32');
  assert.equal(audit(frames(del).at(-1)).ok, true);
  assert.throws(() => V.parse('rbt', 'delete 99'), /already in the tree/);
  assert.throws(() => V.parse('rbt', 'start 5 5, insert 8'), /only once/);
  assert.throws(() => V.parse('rbt', ''), /at least one key/);
});
