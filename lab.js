// Visualizer topics rebuilt to follow the Algorithms course (Dr. Basheer's slides): each module registers window.LAB[topic id]
// with its inputs, engine (immutable step frames), drawing, legend, cost, and presets that load the course's worked examples.
// topics.js draws the shared workspace (playback, step history, inspector) around them. build.mjs copies this file to data/.
window.LAB = window.LAB || {};

/* ── sort ── */
// Visualizer lab: Sorting (CS311 L1, L5, L6). Insertion sort, merge sort and the two-finger MERGE (L1 slides 1.5-1.38),
// exchange sort (L1 Neapolitan part, slides 1.55 and 1.65), PARTITION and QUICKSORT (L5 slides 5.4-5.17), counting sort
// with C, C′ and the final C (L6 slides 6.11-6.30 and the exam table), LSD radix sort with counting sort per digit (L6 slide 6.32).
(function () {
  const { useState, useMemo, useEffect } = React;
  const html = htm.bind(React.createElement);
  const CSS = `
.lx-sort-w{ max-width:560px; margin:0 auto; color:var(--ink); }
.lx-sort-row{ display:grid; gap:3px; margin:0 auto 3px; }
.lx-sort-c{ min-height:34px; display:grid; place-items:center; border:1px solid var(--line); border-radius:6px; font:600 15px var(--mono, ui-monospace, monospace); color:var(--ink); background:var(--paper); min-width:0; transition:background .3s, box-shadow .3s, opacity .3s; }
.lx-sort-c.lx-sort-e{ color:var(--faint); border-style:dashed; }
.lx-sort-ix{ font:500 12px var(--mono, ui-monospace, monospace); color:var(--graphite); text-align:center; min-width:0; }
.lx-sort-ptr{ font:700 14px var(--mono, ui-monospace, monospace); color:var(--c); text-align:center; min-height:18px; min-width:0; white-space:nowrap; }
.lx-sort-sorted{ background:color-mix(in srgb, var(--ok) 20%, var(--paper)); }
.lx-sort-act{ background:color-mix(in srgb, var(--c) 22%, var(--paper)); }
.lx-sort-key{ background:#f2a93b; color:#1d1d1d; border-color:#c98314; }
.lx-sort-cmp{ box-shadow:0 0 0 2px var(--c) inset; }
.lx-sort-sw{ box-shadow:0 0 0 2.5px #d23c3c inset; }
.lx-sort-dim{ opacity:.38; }
.lx-sort-le{ background:color-mix(in srgb, var(--c) 24%, var(--paper)); }
.lx-sort-ge{ background:color-mix(in srgb, #d23c3c 24%, var(--paper)); }
.lx-sort-un{ background:var(--paper); }
.lx-sort-out{ background:var(--paper-2); color:var(--faint); }
.lx-sort-fix{ background:color-mix(in srgb, var(--ok) 26%, var(--paper)); }
.lx-sort-lab{ font:600 13px var(--body); color:var(--graphite); margin:10px 0 4px; text-transform:uppercase; letter-spacing:.04em; }
.lx-sort-keybox{ display:flex; justify-content:center; gap:10px; align-items:center; margin:0 0 8px; font-size:15px; flex-wrap:wrap; }
.lx-sort-keybox b{ display:inline-grid; place-items:center; min-width:34px; height:30px; padding:0 6px; border-radius:6px; background:#f2a93b; color:#1d1d1d; font:700 15px var(--mono, ui-monospace, monospace); }
.lx-sort-hist{ display:grid; gap:2px; font:500 13px var(--mono, ui-monospace, monospace); color:var(--graphite); }
.lx-sort-hist div{ display:flex; gap:8px; flex-wrap:wrap; }
.lx-sort-hist span:first-child{ min-width:62px; color:var(--graphite); }
.lx-sort-hist .lx-sort-now{ color:var(--ink); font-weight:700; }
.lx-sort-tree{ display:grid; gap:4px; }
.lx-sort-lvl{ display:grid; gap:3px; margin:0 auto; width:100%; }
.lx-sort-node{ display:grid; gap:1px; border:1px solid var(--line); border-radius:6px; padding:2px; background:var(--paper); min-width:0; transition:background .3s, opacity .3s; }
.lx-sort-node span{ font:600 13px var(--mono, ui-monospace, monospace); text-align:center; min-width:0; padding:3px 0; }
.lx-sort-node.lx-sort-wait{ opacity:.45; border-style:dashed; }
.lx-sort-node.lx-sort-open{ background:var(--paper); }
.lx-sort-node.lx-sort-cur{ background:color-mix(in srgb, var(--c) 22%, var(--paper)); box-shadow:0 0 0 2px var(--c); }
.lx-sort-node.lx-sort-done{ background:color-mix(in srgb, var(--ok) 20%, var(--paper)); }
.lx-sort-two{ display:grid; grid-template-columns:auto 1fr; gap:4px 8px; align-items:center; }
.lx-sort-two > b{ font:700 14px var(--mono, ui-monospace, monospace); color:var(--graphite); }
.lx-sort-taken{ opacity:.3; text-decoration:line-through; }
.lx-sort-head{ background:#f2a93b; color:#1d1d1d; border-color:#c98314; }
.lx-sort-stack{ display:flex; flex-wrap:wrap; gap:4px; }
.lx-sort-stack span{ font:600 13px var(--mono, ui-monospace, monospace); padding:3px 7px; border-radius:6px; border:1px solid var(--line); background:var(--paper); }
.lx-sort-stack span:last-child{ background:color-mix(in srgb, var(--c) 22%, var(--paper)); border-color:var(--c); }
.lx-sort-tri{ display:grid; gap:2px; justify-content:center; margin:6px auto 0; }
.lx-sort-tri span{ font:500 12px var(--mono, ui-monospace, monospace); color:var(--graphite); text-align:center; line-height:20px; }
.lx-sort-tri i{ display:block; height:20px; border-radius:3px; border:1px solid var(--line); }
.lx-sort-tri i.d{ background:color-mix(in srgb, var(--c) 40%, var(--paper)); }
.lx-sort-tri i.x{ background:#d23c3c; border-color:#d23c3c; }
.lx-sort-tri i.n{ background:#f2a93b; border-color:#c98314; }
.lx-sort-code{ font:500 13px/1.45 var(--mono, ui-monospace, monospace); white-space:pre-wrap; background:var(--paper-2); border:1px solid var(--line); border-radius:8px; padding:6px 8px; margin:8px 0 0; color:var(--ink); }
.lx-sort-arr{ display:grid; grid-template-columns:30px 1fr; gap:3px 6px; align-items:center; }
.lx-sort-arr > b{ font:italic 700 15px var(--body); color:var(--ink); text-align:right; }
.lx-sort-arr > b small{ font-size:12px; font-style:normal; color:var(--graphite); }
.lx-sort-cols{ display:flex; gap:6px; justify-content:center; }
.lx-sort-col{ display:grid; gap:2px; align-content:start; }
.lx-sort-col h5{ margin:0 0 2px; font:600 12px var(--body); color:var(--graphite); text-align:center; white-space:nowrap; }
.lx-sort-num{ font:600 15px var(--mono, ui-monospace, monospace); padding:2px 5px; border-radius:5px; border:1px solid var(--line); background:var(--paper); white-space:pre; text-align:right; }
.lx-sort-num.lx-sort-e{ color:var(--faint); border-style:dashed; text-align:center; }
.lx-sort-num.lx-sort-new{ box-shadow:0 0 0 2px #d23c3c inset; }
.lx-sort-num.lx-sort-rd{ box-shadow:0 0 0 2px var(--c) inset; }
.lx-sort-d{ background:#f2a93b; color:#1d1d1d; border-radius:3px; }
.lx-sort-met{ display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin:10px 0 0; }
.lx-sort-met span{ font:600 13px var(--body); padding:3px 9px; border-radius:99px; background:color-mix(in srgb, var(--c) 14%, var(--paper)); border:1px solid var(--line); }
`;
  if (!document.getElementById('lx-sort-css')) { const s = document.createElement('style'); s.id = 'lx-sort-css'; s.textContent = CSS; document.head.appendChild(s); }

  const strip = s => s.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  const cap = s => ({ html: s, desc: strip(s) });
  const MONO = 'var(--mono, ui-monospace, monospace)';

  function parseNums(text, { min = 2, max = 10, lo = -99, hi = 999, what = 'values' } = {}) {
    const t = String(text || '').split(/[\s,]+/).filter(Boolean);
    if (t.length < min || t.length > max) throw new Error(`Type ${min} to ${max} ${what}, separated by spaces or commas (at most ${max} so the diagram fits a phone).`);
    if (t.some(x => !/^-?\d+$/.test(x))) throw new Error(`Use whole numbers only (got "${t.find(x => !/^-?\d+$/.test(x))}").`);
    const v = t.map(Number);
    if (v.some(x => x < lo || x > hi)) throw new Error(`Use whole numbers from ${lo} to ${hi}.`);
    return v;
  }

  const METHODS = [
    ['insertion', 'Insertion sort (L1)'],
    ['merge', 'Merge sort (L1)'],
    ['merge2', 'MERGE two sorted lists (L1)'],
    ['exchange', 'Exchange sort (L1, Neapolitan)'],
    ['partition', 'PARTITION once (L5)'],
    ['quick', 'Quicksort (L5)'],
    ['counting', 'Counting sort (L6)'],
    ['radix', 'Radix sort, LSD (L6)'],
  ];
  const DEF = {
    insertion: '8 2 4 9 3 6', merge: '8 2 4 9 3 6', merge2: '2 7 13 20 | 1 9 11 12', exchange: '8 2 4 9 3 6',
    partition: '6 10 13 5 8 3 2 11', quick: '6 10 13 5 8 3 2 11', counting: '4 1 3 4 3', radix: '329 457 657 839 436 720 355',
  };

  /* ───────── insertion sort (L1 slides 1.6-1.18), A[1..n] ───────── */
  function insertion(A0) {
    const A = A0.slice(), n = A.length, F = []; let cmp = 0, sh = 0;
    const hist = [];
    const push = (o, s) => F.push(Object.assign({ kind: 'insertion', A: A.slice(), hist: hist.slice(), sorted: 1, j: 0, i: -1, key: null, hl: {} }, o, cap(s), { metrics: [['Comparisons A[i] > key', cmp], ['Shifts A[i+1] ← A[i]', sh], ['j', o.j || '–']] }));
    push({}, `INSERTION-SORT keeps <b>A[1 .. j−1] sorted</b> and inserts <b>key ← A[j]</b> by shifting larger elements one place right. Start: A[1 .. 1] = ${A[0]} is trivially sorted.`);
    for (let j = 2; j <= n; j++) {
      const key = A[j - 1]; let i = j - 1;
      push({ j, i, iv: i, key, sorted: j - 1, hl: { key: j } }, `<b>j = ${j}</b>: key ← A[${j}] = <b>${key}</b>, i ← j − 1 = ${i}. Now find where ${key} belongs in the sorted A[1 .. ${j - 1}].`);
      while (i > 0 && A[i - 1] > key) {
        cmp++; const v = A[i - 1]; A[i] = v; sh++;
        push({ j, i, iv: i - 1, key, sorted: j - 1, hl: { cmp: i, sh: i + 1 } }, `A[${i}] = ${v} &gt; key = ${key}: shift it right, A[${i + 1}] ← A[${i}] = ${v}, then i ← ${i - 1}.`);
        i--;
      }
      let why;
      if (i > 0) { cmp++; why = `A[${i}] = ${A[i - 1]} ≤ key = ${key}, so the while loop stops.`; }
      else why = `i = 0, so the while loop stops (key is the smallest so far; no comparison is made).`;
      A[i] = key; hist.push({ j, a: A.slice() });
      push({ j, i, iv: i, key, sorted: j, hl: { key: i + 1, cmp: i > 0 ? i : 0 } }, `${why} A[i+1] ← key: <b>${key}</b> goes to A[${i + 1}]. A[1 .. ${j}] = ${A.slice(0, j).join(' ')} is sorted.`);
    }
    const W = n * (n - 1) / 2;
    push({ sorted: n, done: 1 }, `<b>Sorted</b>: ${A.join(' ')}. ${cmp} comparisons and ${sh} shifts. Worst case (reverse sorted) is Σ<sub>j=2..n</sub> (j−1) = n(n−1)/2 = ${W} comparisons: Θ(n<sup>2</sup>). Best case (already sorted) is n − 1 = ${n - 1}: Θ(n).`);
    return F;
  }

  /* ───────── merge sort (L1 slide 1.25): left half A[1..⌈n/2⌉] ───────── */
  function mergeSort(A0) {
    const A = A0.slice(), n = A.length, F = []; let cmp = 0, mv = 0, maxd = 0;
    const nodes = []; // {p, r, d}
    (function mk(p, r, d) { nodes.push({ p, r, d }); if (p < r) { const m = p + Math.ceil((r - p + 1) / 2) - 1; mk(p, m, d + 1); mk(m + 1, r, d + 1); } })(1, n, 0);
    const st = nodes.map(() => 'wait'), sv = nodes.map(() => null), stack = [];
    const id = (p, r) => nodes.findIndex(x => x.p === p && x.r === r);
    const push = (o, s) => F.push(Object.assign({ kind: 'merge', A: A.slice(), nodes, st: st.slice(), sv: sv.map(x => x && x.slice()), stack: stack.map(x => x.slice()), act: null, L: null, R: null, li: 0, ri: 0, k: 0, wrote: [] }, o, cap(s),
      { metrics: [['Comparisons', cmp], ['Moves (writes to A)', mv], ['Recursion depth', stack.length], ['Max depth', maxd]] }));
    push({}, `MERGE-SORT A[1 .. ${n}]: if n = 1, done; otherwise recursively sort A[1 .. ⌈n/2⌉] and A[⌈n/2⌉+1 .. n], then <b>MERGE</b> the two sorted lists. Input: ${A.join(' ')}.`);
    (function ms(p, r) {
      const me = id(p, r);
      if (p === r) { st[me] = 'done'; sv[me] = [A[p - 1]]; return; }
      stack.push([p, r]); maxd = Math.max(maxd, stack.length); st[me] = 'cur';
      const m = p + Math.ceil((r - p + 1) / 2) - 1;
      push({ act: [p, r] }, `MERGE-SORT(A[${p} .. ${r}]), ${r - p + 1} elements: split at ⌈${r - p + 1}/2⌉ = ${m - p + 1} into A[${p} .. ${m}] and A[${m + 1} .. ${r}]` + (m === p || m + 1 === r ? ` (a single element is already sorted).` : '.'));
      st[me] = 'open'; ms(p, m); ms(m + 1, r); st[me] = 'cur';
      const L = A.slice(p - 1, m), R = A.slice(m, r); let a = 0, b = 0, k = p; const wrote = [];
      push({ act: [p, r], L, R, li: 0, ri: 0, k: 0, wrote: [] }, `Both halves are sorted. <b>MERGE</b> L = ${L.join(' ')} and R = ${R.join(' ')} back into A[${p} .. ${r}], always comparing only the two heads.`);
      while (a < L.length && b < R.length) {
        cmp++; const x = L[a], y = R[b], takeL = x <= y; const v = takeL ? x : y;
        if (takeL) a++; else b++;
        A[k - 1] = v; mv++; wrote.push(k);
        push({ act: [p, r], L, R, li: a, ri: b, k, wrote: wrote.slice() }, `Compare heads ${x} and ${y}: ${takeL ? `${x} ≤ ${y}` : `${y} &lt; ${x}`}, so A[${k}] ← <b>${v}</b>` + (takeL && x === y ? ' (ties take the left list first, which keeps merge sort stable).' : '.'));
        k++;
      }
      const rest = a < L.length ? L.slice(a) : R.slice(b);
      if (rest.length) {
        const k0 = k; rest.forEach(v => { A[k - 1] = v; mv++; wrote.push(k); k++; });
        push({ act: [p, r], L, R, li: L.length, ri: R.length, k: k - 1, wrote: wrote.slice() }, `${a < L.length ? 'R' : 'L'} is empty, so the rest (${rest.join(' ')}) is copied to A[${k0} .. ${r}] with <b>no comparisons</b>. A[${p} .. ${r}] = ${A.slice(p - 1, r).join(' ')} is sorted.`);
      }
      st[me] = 'done'; sv[me] = A.slice(p - 1, r); stack.pop();
    })(1, n);
    const lg = Math.ceil(Math.log2(n));
    push({}, `<b>Sorted</b>: ${A.join(' ')}. ${cmp} comparisons, ${mv} moves. Each level of the recursion tree merges n = ${n} elements in Θ(n), and there are ⌈lg n⌉ = ${lg} levels of merging: T(n) = 2T(n/2) + Θ(n) = <b>Θ(n lg n)</b> in every case.`);
    return F;
  }

  /* ───────── MERGE of two sorted lists (L1 slides 1.26-1.38) ───────── */
  function merge2(text) {
    const parts = String(text || '').split('|');
    if (parts.length !== 2) throw new Error('Write the two sorted lists separated by |, for example 2 7 13 20 | 1 9 11 12.');
    const A = parseNums(parts[0], { min: 1, max: 6, what: 'numbers in list 1' }), B = parseNums(parts[1], { min: 1, max: 6, what: 'numbers in list 2' });
    const up = L => L.every((q, k) => !k || L[k - 1] <= q);
    if (!up(A) || !up(B)) throw new Error('MERGE needs both lists already sorted, smallest first (for example 2 7 13 20 | 1 9 11 12).');
    let a = 0, b = 0, cmp = 0; const out = [], F = [];
    const push = (o, s) => F.push(Object.assign({ kind: 'merge2', A, B, a, b, out: out.slice(), w: -1 }, o, cap(s), { metrics: [['Comparisons', cmp], ['Output', `${out.length} of ${A.length + B.length}`], ['At most n − 1', A.length + B.length - 1]] }));
    push({}, `Two sorted lists. MERGE only ever looks at the two <b>heads</b> (the smallest unmerged element of each list): ${A[0]} and ${B[0]}.`);
    while (a < A.length && b < B.length) {
      cmp++; const x = A[a], y = B[b], m = Math.min(x, y);
      if (x <= y) { out.push(x); a++; } else { out.push(y); b++; }
      push({ w: out.length - 1, cx: [a - (x <= y ? 1 : 0), b - (x <= y ? 0 : 1)] }, `Compare the heads ${x} and ${y}: <b>${m}</b> is smaller, so it goes to the output.` + (a < A.length && b < B.length ? ` New heads: ${A[a]} and ${B[b]}.` : ''));
    }
    if (a < A.length || b < B.length) {
      const rest = a < A.length ? A.slice(a) : B.slice(b), from = a < A.length ? 1 : 2;
      rest.forEach(v => out.push(v)); a = A.length; b = B.length;
      push({ w: out.length - 1 }, `List ${3 - from} is empty, so the rest of list ${from} (${rest.join(' ')}) is copied with <b>no comparisons</b>.` + (A.join() === '2,7,13,20' && B.join() === '1,9,11,12' ? ' (The slides stop after 12.)' : ''));
    }
    push({}, `Merged: ${out.join(' ')}. Each step is Θ(1) and outputs one element, so merging n = ${out.length} elements takes <b>Θ(n)</b> time: ${cmp} comparisons here, never more than n − 1 = ${out.length - 1}.`);
    return F;
  }

  /* ───────── exchange sort (Neapolitan, L1 slide 1.55) ───────── */
  function exchange(S0) {
    const S = S0.slice(), n = S.length, F = []; let c = 0, x = 0;
    const push = (o, s) => F.push(Object.assign({ kind: 'exchange', S: S.slice(), n, i: 0, j: 0, sw: false }, o, cap(s), { metrics: [['Comparisons S[j] < S[i]', c], ['Exchanges', x], ['Every case n(n−1)/2', n * (n - 1) / 2]] }));
    push({}, `exchangesort compares S[i] with every later S[j] (i = 1 .. n, j = i+1 .. n) and exchanges them when S[j] &lt; S[i]. After row i, S[i] holds the i-th smallest key. S = ${S.join(' ')}, n = ${n}.`);
    for (let i = 1; i <= n; i++) for (let j = i + 1; j <= n; j++) {
      c++; const a = S[i - 1], b = S[j - 1], sw = b < a;
      if (sw) { S[i - 1] = b; S[j - 1] = a; x++; }
      push({ i, j, sw }, `i = ${i}, j = ${j}: is S[${j}] = ${b} &lt; S[${i}] = ${a}? ` + (sw ? `<b>Yes</b>: exchange them, S[${i}] = ${b}.` : `No, nothing moves.`) + (j === n ? ` Row i = ${i} is finished: S[${i}] = ${S[i - 1]} is in place.` : ''));
    }
    push({ done: 1 }, `<b>Sorted</b>: ${S.join(' ')}. Row i always makes n − i comparisons, so T(n) = (n−1) + (n−2) + … + 1 = n(n−1)/2 = <b>${n * (n - 1) / 2}</b> whatever the keys are: an <b>every-case</b> time complexity. Only the number of exchanges (${x}) depends on the input.`);
    return F;
  }

  /* ───────── PARTITION and QUICKSORT (L5 slides 5.4-5.17) ───────── */
  function quick(A0, once) {
    const A = A0.slice(), n = A.length, F = []; let cmp = 0, ex = 0, maxd = 0, calls = 0;
    const fixed = Array(n).fill(false), stack = [], after = [], rows = [];
    const reg = (p, q, i, j, fin) => A.map((_, k0) => { const k = k0 + 1; if (k < p || k > q) return fixed[k0] ? 'fix' : 'out';
      if (fin) return k < i ? 'le' : k === i ? 'fix' : 'ge';
      return k === p ? 'x' : k <= i ? 'le' : k < j ? 'ge' : 'un'; });
    const push = (o, s) => F.push(Object.assign({ kind: once ? 'partition' : 'quick', A: A.slice(), stack: stack.map(x => x.slice()), after: after.map(x => Object.assign({}, x, { a: x.a.slice() })), rows: rows.map(x => Object.assign({}, x)), p: 0, q: 0, i: 0, j: 0, reg: A.map((_, k) => fixed[k] ? 'fix' : 'out'), sw: [] }, o, cap(s),
      { metrics: once ? [['Comparisons A[j] ≤ x', cmp], ['Exchanges', ex], ['i', o.i || '–'], ['j', o.j > 0 && o.j <= n ? o.j : '–']]
        : [['Comparisons A[j] ≤ x', cmp], ['Exchanges', ex], ['Recursion depth', stack.length], ['Max depth', maxd], ['PARTITION calls', calls]] }));
    function partition(p, q) {
      calls++;
      const x = A[p - 1]; let i = p;
      const rowPush = (sw) => { if (once) rows.push({ a: A.slice(), reg: reg(p, q, i, 0, false), sw }); };
      if (once) rows.push({ a: A.slice(), reg: reg(p, q, i, p + 1, false), sw: [] });
      push({ p, q, i, j: p + 1, x, reg: reg(p, q, i, p + 1), code: [1, 2] }, `PARTITION(A, ${p}, ${q}): pivot <b>x ← A[${p}] = ${x}</b>, i ← p = ${p}. Invariant: A[${p + 1} .. i] ≤ x, A[i+1 .. j−1] ≥ x, A[j .. ${q}] not examined yet.`);
      for (let j = p + 1; j <= q; j++) {
        cmp++;
        if (A[j - 1] <= x) {
          i++; const out = A[i - 1], inn = A[j - 1]; A[i - 1] = inn; A[j - 1] = out; ex++;
          if (once) rows.push({ a: A.slice(), reg: reg(p, q, i, j + 1), sw: i === j ? [i] : [i, j] });
          push({ p, q, i, j, x, reg: reg(p, q, i, j + 1), sw: i === j ? [i] : [i, j], code: [4, 5, 6] }, `j = ${j}: A[${j}] = ${inn} ≤ ${x}, so i ← i + 1 = ${i} and exchange A[${i}] ↔ A[${j}]` + (i === j ? ` (the same cell, ${inn} stays).` : ` (${out} ↔ ${inn}).`));
        } else {
          if (once) rows[rows.length - 1] = { a: A.slice(), reg: reg(p, q, i, j + 1), sw: [] };
          push({ p, q, i, j, x, reg: reg(p, q, i, j + 1), code: [3, 4] }, `j = ${j}: A[${j}] = ${A[j - 1]} &gt; ${x}: no exchange; the ≥ x part grows to A[${i + 1} .. ${j}].`);
        }
      }
      const o = A[i - 1]; A[i - 1] = A[p - 1]; A[p - 1] = o; ex++; fixed[i - 1] = true;
      if (once) rows.push({ a: A.slice(), reg: reg(p, q, i, 0, true), sw: i === p ? [p] : [p, i] });
      after.push({ a: A.slice(), p, q, i });
      push({ p, q, i, j: q + 1, x, reg: reg(p, q, i, 0, true), sw: i === p ? [p] : [p, i], code: [7, 8] }, `The for loop ends (j passed q = ${q}). Exchange A[p] ↔ A[i] = A[${p}] ↔ A[${i}] (${x} ↔ ${o}) and <b>return i = ${i}</b>: pivot ${x} is in its final place` + (i > p ? `, A[${p} .. ${i - 1}] ≤ ${x}` : '') + (i < q ? `, A[${i + 1} .. ${q}] ≥ ${x}` : '') + '.');
      return i;
    }
    if (once) {
      partition(1, n);
      F[F.length - 1].metrics.push(['Θ(n): comparisons = n − 1', n - 1]);
      return F;
    }
    push({}, `QUICKSORT(A, p, r): if p &lt; r then q ← PARTITION(A, p, r), QUICKSORT(A, p, q−1), QUICKSORT(A, q+1, r). Initial call QUICKSORT(A, 1, ${n}) on ${A.join(' ')}.`);
    (function qs(p, r) {
      if (p > r) return;
      if (p === r) { fixed[p - 1] = true; return; }
      stack.push([p, r]); maxd = Math.max(maxd, stack.length);
      const q = partition(p, r);
      const lp = [p, q - 1], rp = [q + 1, r], sz = x => Math.max(0, x[1] - x[0] + 1);
      if (q - 1 === p) fixed[p - 1] = true; if (q + 1 === r) fixed[r - 1] = true;
      push({ p, q: r, i: q, j: 0, reg: A.map((_, k) => fixed[k] ? 'fix' : (k + 1 >= p && k + 1 <= r ? (k + 1 < q ? 'le' : 'ge') : 'out')) },
        `Split ${sz(lp)} : ${sz(rp)}. Recurse on A[${p} .. ${q - 1}]${sz(lp) <= 1 ? (sz(lp) ? ' (one element: nothing to do)' : ' (empty)') : ''} and A[${q + 1} .. ${r}]${sz(rp) <= 1 ? (sz(rp) ? ' (one element: nothing to do)' : ' (empty)') : ''}.` + (Math.min(sz(lp), sz(rp)) === 0 && r - p >= 2 ? ' A 0 : n−1 split like this is the worst case.' : ''));
      qs(p, q - 1); qs(q + 1, r); stack.pop();
    })(1, n);
    push({}, `<b>Sorted</b>: ${A.join(' ')}. ${cmp} comparisons, ${ex} exchanges, maximum recursion depth ${maxd}. Each level of recursion does Θ(n) partition work: balanced splits give Θ(n lg n); sorted or reverse-sorted input gives 0 : n−1 splits, n(n−1)/2 = ${n * (n - 1) / 2} comparisons, Θ(n<sup>2</sup>).`);
    return F;
  }

  /* ───────── counting sort (L6 slides 6.11-6.28), keys in {1..k} ───────── */
  const CS_CODE = ['for i ← 1 to k\n   do C[i] ← 0', 'for j ← 1 to n\n   do C[A[j]] ← C[A[j]] + 1   ⊳ C[i] = |{key = i}|', 'for i ← 2 to k\n   do C[i] ← C[i] + C[i–1]   ⊳ C[i] = |{key ≤ i}|', 'for j ← n downto 1\n   do B[C[A[j]]] ← A[j]\n      C[A[j]] ← C[A[j]] – 1'];
  function counting(A) {
    const n = A.length, k = Math.max(...A), F = [];
    let C = Array(k).fill(null), occ = null, acc = null, B = Array(n).fill(null), w = 0;
    const push = (o, s) => F.push(Object.assign({ kind: 'counting', A, k, C: C.slice(), occ: occ && occ.slice(), acc: acc && acc.slice(), B: B.slice(), loop: 0, ja: -1, ci: -1, bi: -1 }, o, cap(s),
      { metrics: [['Element comparisons', 0], ['Loop', o.loop === 5 ? 'done' : o.loop ? `${o.loop} of 4` : '–'], ['Writes to B', w], ['n + k', `${n} + ${k} = ${n + k}`]] }));
    push({}, `Counting sort: input A[1 .. ${n}] with every A[j] ∈ {1, …, k}, k = ${k}; output B[1 .. ${n}]; auxiliary storage C[1 .. ${k}]. No two elements are ever compared.`);
    C = Array(k).fill(0);
    push({ loop: 1 }, `<b>Loop 1</b>: for i ← 1 to k do C[i] ← 0. Θ(k) time.`);
    for (let j = 0; j < n; j++) { C[A[j] - 1]++; push({ loop: 2, ja: j, ci: A[j] - 1 }, `<b>Loop 2</b>, j = ${j + 1}: A[${j + 1}] = ${A[j]}, so C[${A[j]}] ← C[${A[j]}] + 1 = ${C[A[j] - 1]}. C[i] counts the keys equal to i.`); }
    occ = C.slice(); acc = [C[0]];
    push({ loop: 3, ci: 0 }, `<b>Loop 3</b> (accumulation) starts at i = 2; C′[1] = C[1] = ${C[0]}. When it ends, C′[i] = |{key ≤ i}| = the last slot of key i in B.`);
    for (let i = 1; i < k; i++) { const old = C[i]; C[i] += C[i - 1]; acc = C.slice(0, i + 1); push({ loop: 3, ci: i }, `<b>Loop 3</b>, i = ${i + 1}: C[${i + 1}] ← C[${i + 1}] + C[${i}] = ${old} + ${C[i - 1]} = ${C[i]}.`); }
    acc = C.slice();
    for (let j = n - 1; j >= 0; j--) {
      const pos = C[A[j] - 1]; B[pos - 1] = A[j]; C[A[j] - 1]--; w++;
      push({ loop: 4, ja: j, ci: A[j] - 1, bi: pos - 1 }, `<b>Loop 4</b>, j = ${j + 1}: A[${j + 1}] = ${A[j]} and C[${A[j]}] = ${pos}, so B[${pos}] ← ${A[j]}, then C[${A[j]}] ← ${pos} − 1 = ${pos - 1}. Going from j = n down keeps equal keys in input order (stable).`);
    }
    push({ loop: 5 }, `<b>Done</b>: B = ${B.join(' ')}. Final C = ${C.join(' ')} (each C[i] now = number of keys &lt; i). Time Θ(k) + Θ(n) + Θ(k) + Θ(n) = <b>Θ(n + k)</b>, and not a single comparison between elements.`);
    return F;
  }

  /* ───────── LSD radix sort, counting sort on each decimal digit (L6 slides 6.31-6.39) ───────── */
  const dig = (x, t) => Math.floor(x / Math.pow(10, t)) % 10;
  const PL = ['units', 'tens', 'hundreds', 'thousands'];
  function radix(nums) {
    const n = nums.length, d = Math.max(1, ...nums.map(x => String(x).length)), F = [], cols = [nums.slice()];
    let w = 0;
    const push = (o, s) => F.push(Object.assign({ kind: 'radix', d, cols: cols.map(c => c.slice()), t: -1, C: null, Cp: null, ja: -1, bi: -1, ci: -1 }, o, cap(s),
      { metrics: [['Pass', o.t >= 0 ? `${o.t + 1} of ${d}` : '–'], ['Digit', o.t >= 0 ? PL[o.t] : '–'], ['Element comparisons', 0], ['Writes', w]] }));
    push({}, `Radix sort: sort on the <b>least-significant digit first</b>, using counting sort (stable) on one digit per pass, keys 0..9 so C[0..9]. ${d} digit${d > 1 ? 's' : ''}, so ${d} pass${d > 1 ? 'es' : ''}.`);
    for (let t = 0; t < d; t++) {
      const src = cols[t], C = Array(10).fill(0);
      src.forEach(x => C[dig(x, t)]++);
      const B = Array(n).fill(null); cols.push(B);
      push({ t, C: C.slice() }, `Pass ${t + 1}, ${PL[t]} digit: count each digit value: C = ${C.join(' ')} (for digits 0 .. 9).`);
      const Cp = C.slice(); for (let v = 1; v < 10; v++) Cp[v] += Cp[v - 1];
      push({ t, C: C.slice(), Cp: Cp.slice() }, `Accumulate: C′[v] = number of keys whose ${PL[t]} digit is ≤ v: ${Cp.join(' ')}.`);
      for (let j = n - 1; j >= 0; j--) {
        const x = src[j], v = dig(x, t), pos = Cp[v]; B[pos - 1] = x; Cp[v]--; w++;
        push({ t, C: C.slice(), Cp: Cp.slice(), ja: j, bi: pos - 1, ci: v }, `j = ${j + 1}: ${x} has ${PL[t]} digit ${v}, C′[${v}] = ${pos}, so it goes to row ${pos}; C′[${v}] ← ${pos - 1}.` + (j === 0 ? ` Pass ${t + 1} gives ${B.join(' ')}.` : ''));
      }
    }
    const out = cols[d];
    push({ t: -1 }, `<b>Sorted</b>: ${out.join(' ')}. Each pass is a stable counting sort, Θ(n + k) with k = 10, so ${d} passes cost Θ(d(n + k)). For b-bit words in r-bit digits: Θ((b/r)(n + 2<sup>r</sup>)), and r = lg n gives Θ(bn / lg n).`);
    return F;
  }

  function build(cfg) {
    const m = cfg.method, t = cfg.text;
    if (m === 'merge2') return merge2(t);
    if (m === 'counting') { const A = parseNums(t, { min: 1, max: 10, lo: 1, hi: 10, what: 'keys' }); return counting(A); }
    if (m === 'radix') return radix(parseNums(t, { min: 2, max: 8, lo: 0, hi: 9999, what: 'numbers' }));
    const A = parseNums(t, { min: 2, max: 10 });
    if (m === 'insertion') return insertion(A);
    if (m === 'merge') return mergeSort(A);
    if (m === 'exchange') return exchange(A);
    if (m === 'partition') return quick(A, true);
    if (m === 'quick') return quick(A, false);
    throw new Error('Choose a method.');
  }

  /* ───────── drawing ───────── */
  const g = n => ({ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, maxWidth: (n * 46) + 'px' });
  const Idx = ({ n, from = 1 }) => html`<div className="lx-sort-row" style=${g(n)}>${Array.from({ length: n }, (_, k) => html`<div key=${k} className="lx-sort-ix">${k + from}</div>`)}</div>`;
  const Ptr = ({ n, at }) => html`<div className="lx-sort-row" style=${g(n)}>${Array.from({ length: n }, (_, k) => html`<div key=${k} className="lx-sort-ptr">${at(k + 1)}</div>`)}</div>`;
  const Met = ({ items }) => html`<div className="lx-sort-met">${items.map(([a, b]) => html`<span key=${a}>${a}: ${b}</span>`)}</div>`;

  function DInsertion({ f }) {
    const n = f.A.length;
    return html`<div className="lx-sort-w">
      <div className="lx-sort-keybox">${f.key != null ? html`<span>key =</span><b>${f.key}</b>` : html`<span>${f.done ? 'Done' : 'Ready'}</span>`}${f.j ? html`<span>j = ${f.j}, i = ${f.iv}</span>` : null}</div>
      <${Idx} n=${n} />
      <div className="lx-sort-row" style=${g(n)}>${f.A.map((v, k0) => { const k = k0 + 1;
        const c = (k === f.hl.key ? ' lx-sort-key' : k === f.hl.sh ? ' lx-sort-act lx-sort-sw' : k <= f.sorted ? ' lx-sort-sorted' : '') + (k === f.hl.cmp ? ' lx-sort-cmp' : '');
        return html`<div key=${k0} className=${'lx-sort-c' + c}>${v}</div>`; })}</div>
      <${Ptr} n=${n} at=${k => [f.j && !f.done && k === f.j ? 'j' : '', f.hl.cmp === k ? 'i' : ''].filter(Boolean).join(' ')} />
      ${f.hist.length ? html`<div className="lx-sort-lab">After each pass</div><div className="lx-sort-hist">${f.hist.map((h, q) => html`<div key=${q} className=${q === f.hist.length - 1 ? 'lx-sort-now' : ''}><span>j = ${h.j}</span><span>${h.a.join(' ')}</span></div>`)}</div>` : null}
    </div>`;
  }

  function DMerge({ f }) {
    const n = f.A.length, depth = Math.max(...f.nodes.map(x => x.d));
    const inAct = k => f.act && k >= f.act[0] && k <= f.act[1];
    return html`<div className="lx-sort-w">
      <div className="lx-sort-lab">Array A</div>
      <${Idx} n=${n} />
      <div className="lx-sort-row" style=${g(n)}>${f.A.map((v, k0) => { const k = k0 + 1, w = f.wrote.includes(k);
        return html`<div key=${k0} className=${'lx-sort-c' + (k === f.k && f.L ? ' lx-sort-key' : w ? ' lx-sort-sorted' : inAct(k) ? ' lx-sort-act' : f.act ? ' lx-sort-dim' : '')}>${v}</div>`; })}</div>
      ${f.L ? html`<div className="lx-sort-lab">MERGE: heads in amber</div><div className="lx-sort-two">
        <b>L</b><div className="lx-sort-row" style=${{ ...g(f.L.length), margin: 0 }}>${f.L.map((v, q) => html`<div key=${q} className=${'lx-sort-c' + (q < f.li ? ' lx-sort-taken' : q === f.li && f.ri < f.R.length ? ' lx-sort-head' : '')}>${v}</div>`)}</div>
        <b>R</b><div className="lx-sort-row" style=${{ ...g(f.R.length), margin: 0 }}>${f.R.map((v, q) => html`<div key=${q} className=${'lx-sort-c' + (q < f.ri ? ' lx-sort-taken' : q === f.ri && f.li < f.L.length ? ' lx-sort-head' : '')}>${v}</div>`)}</div></div>` : null}
      <div className="lx-sort-lab">Recursion tree (split at ⌈n/2⌉)</div>
      <div className="lx-sort-tree">${Array.from({ length: depth + 1 }, (_, d) => html`<div key=${d} className="lx-sort-lvl" style=${g(n)}>
        ${f.nodes.map((x, q) => x.d !== d ? null : html`<div key=${q} className=${'lx-sort-node lx-sort-' + f.st[q]} style=${{ gridColumn: `${x.p} / ${x.r + 1}`, gridTemplateColumns: `repeat(${x.r - x.p + 1}, minmax(0,1fr))` }}>
          ${(f.st[q] === 'done' ? f.sv[q] : f.A.slice(x.p - 1, x.r)).map((v, z) => html`<span key=${z}>${v}</span>`)}</div>`)}</div>`)}</div>
      ${f.stack.length ? html`<div className="lx-sort-lab">Call stack</div><div className="lx-sort-stack">${f.stack.map((s, q) => html`<span key=${q}>MERGE-SORT(${s[0]}..${s[1]})</span>`)}</div>` : null}
    </div>`;
  }

  function DMerge2({ f }) {
    const row = (L, h, nm) => html`<b>${nm}</b><div className="lx-sort-row" style=${{ ...g(6), margin: 0 }}>${L.map((v, q) => html`<div key=${q} className=${'lx-sort-c' + (q < h ? ' lx-sort-taken' : q === h ? ' lx-sort-head' : '')}>${v}</div>`)}</div>`;
    const N = f.A.length + f.B.length;
    return html`<div className="lx-sort-w">
      <div className="lx-sort-lab">Two sorted lists (heads in amber)</div>
      <div className="lx-sort-two">${row(f.A, f.a, '1')}${row(f.B, f.b, '2')}</div>
      <div className="lx-sort-lab">Output</div>
      <div className="lx-sort-row" style=${g(Math.min(N, 6))}>${Array.from({ length: N }, (_, q) => html`<div key=${q} className=${'lx-sort-c' + (q >= f.out.length ? ' lx-sort-e' : q === f.w ? ' lx-sort-key' : ' lx-sort-sorted')}>${q < f.out.length ? f.out[q] : '·'}</div>`)}</div>
    </div>`;
  }

  function DExchange({ f }) {
    const n = f.n, cell = n > 8 ? 22 : 26;
    return html`<div className="lx-sort-w">
      <${Idx} n=${n} />
      <div className="lx-sort-row" style=${g(n)}>${f.S.map((v, k0) => { const k = k0 + 1, on = k === f.i || k === f.j;
        return html`<div key=${k0} className=${'lx-sort-c' + (on ? (f.sw ? ' lx-sort-key lx-sort-sw' : ' lx-sort-act') : (f.done || k < f.i) ? ' lx-sort-sorted' : '')}>${v}</div>`; })}</div>
      <${Ptr} n=${n} at=${k => [k === f.i ? 'i' : '', k === f.j ? 'j' : ''].filter(Boolean).join(' ')} />
      <div className="lx-sort-lab">Comparisons made (row i, column j)</div>
      <div className="lx-sort-tri" style=${{ gridTemplateColumns: `28px repeat(${n - 1}, ${cell}px)` }}>
        <span></span>${Array.from({ length: n - 1 }, (_, q) => html`<span key=${'h' + q}>${q + 2}</span>`)}
        ${Array.from({ length: n - 1 }, (_, r) => [html`<span key=${'r' + r}>${r + 1}</span>`, ...Array.from({ length: n - 1 }, (_, q) => {
          const i = r + 1, j = q + 2; if (j <= i) return html`<span key=${r + '-' + q}></span>`;
          const now = i === f.i && j === f.j, done = f.done || i < f.i || (i === f.i && j < f.j);
          return html`<i key=${r + '-' + q} className=${now ? (f.sw ? 'x' : 'n') : done ? 'd' : ''}></i>`; })])}
      </div>
    </div>`;
  }

  const RC = { x: 'lx-sort-key', le: 'lx-sort-le', ge: 'lx-sort-ge', un: 'lx-sort-un', out: 'lx-sort-out', fix: 'lx-sort-fix' };
  const QROW = (a, reg, sw, small) => html`<div className="lx-sort-row" style=${g(a.length)}>${a.map((v, k) => html`<div key=${k} className=${'lx-sort-c ' + RC[reg[k]] + (sw && sw.includes(k + 1) ? ' lx-sort-sw' : '')} style=${small ? { minHeight: '26px', fontSize: '13px' } : null}>${v}</div>`)}</div>`;
  const PCODE = ['PARTITION(A, p, q)', '  x ← A[p]', '  i ← p', '  for j ← p + 1 to q', '    do if A[j] ≤ x', '      then i ← i + 1', '           exchange A[i] ↔ A[j]', '  exchange A[p] ↔ A[i]', '  return i'];
  function DQuick({ f }) {
    const n = f.A.length, once = f.kind === 'partition';
    return html`<div className="lx-sort-w">
      ${f.x != null ? html`<div className="lx-sort-keybox"><span>pivot x =</span><b>${f.x}</b><span>p = ${f.p}, q = ${f.q}</span></div>` : null}
      <${Idx} n=${n} />
      ${once && f.rows.length > 1 ? f.rows.slice(0, -1).map((r, q) => html`<div key=${q} style=${{ opacity: .5 }}>${QROW(r.a, r.reg, r.sw, true)}</div>`) : null}
      ${QROW(f.A, f.reg, f.sw)}
      <${Ptr} n=${n} at=${k => [f.p && k === f.i ? 'i' : '', f.x != null && k === f.j ? 'j' : ''].filter(Boolean).join(' ')} />
      ${f.code ? html`<div className="lx-sort-code">${PCODE.map((l, q) => html`<div key=${q} style=${f.code.includes(q) ? { fontWeight: 700, color: 'var(--ink)', background: 'color-mix(in srgb, var(--c) 18%, var(--paper-2))' } : { color: 'var(--graphite)' }}>${l}</div>`)}</div>` : null}
      ${!once && f.stack.length ? html`<div className="lx-sort-lab">Call stack (depth ${f.stack.length})</div><div className="lx-sort-stack">${f.stack.map((s, q) => html`<span key=${q}>QS(${s[0]}, ${s[1]})</span>`)}</div>` : null}
      ${!once && f.after.length ? html`<div className="lx-sort-lab">After each PARTITION (pivot green)</div><div className="lx-sort-hist">${f.after.map((h, q) => html`<div key=${q}><span>(${h.p}, ${h.q})</span><span>${h.a.map((v, k) => html`<span key=${k} style=${k + 1 === h.i ? { color: 'var(--ok)', fontWeight: 700 } : k + 1 < h.p || k + 1 > h.q ? { opacity: .45 } : null}>${v}${k < n - 1 ? ' ' : ''}</span>`)}</span></div>`)}</div>` : null}
    </div>`;
  }

  const Cells = ({ lab, v, hi, ch, dim }) => html`<b>${lab}</b><div><div className="lx-sort-row" style=${{ ...g(v.length), margin: 0, maxWidth: (v.length * 40) + 'px' }}>${v.map((x, k) => html`<div key=${k} className=${'lx-sort-c' + (x == null ? ' lx-sort-e' : '') + (k === hi ? ' lx-sort-key' : '') + (k === ch ? ' lx-sort-sw' : '') + (dim ? ' lx-sort-dim' : '')} style=${{ minHeight: '30px' }}>${x == null ? '·' : x}</div>`)}</div></div>`;
  const IxRow = ({ n, from = 1 }) => html`<span></span><div className="lx-sort-row" style=${{ ...g(n), margin: 0, maxWidth: (n * 40) + 'px' }}>${Array.from({ length: n }, (_, k) => html`<div key=${k} className="lx-sort-ix">${k + from}</div>`)}</div>`;
  function DCounting({ f }) {
    const n = f.A.length, k = f.k;
    return html`<div className="lx-sort-w"><div className="lx-sort-arr">
      <${IxRow} n=${n} />
      <${Cells} lab="A" v=${f.A} hi=${f.ja} />
      <${Cells} lab="B" v=${f.B} ch=${f.bi} />
      <span></span><div style=${{ height: '6px' }}></div>
      <${IxRow} n=${k} />
      <${Cells} lab="C" v=${f.loop <= 2 ? f.C : f.occ} hi=${f.loop === 2 ? f.ci : -1} dim=${f.loop >= 3} />
      ${f.loop >= 3 ? html`<${Cells} lab=${html`C′`} v=${f.loop === 3 ? Array.from({ length: k }, (_, q) => f.acc && q < f.acc.length ? f.acc[q] : null) : f.acc} hi=${f.loop === 3 ? f.ci : -1} dim=${f.loop >= 4} />` : null}
      ${f.loop >= 4 ? html`<${Cells} lab=${html`C<small>${f.loop === 5 ? ' final' : ''}</small>`} v=${f.C} hi=${f.loop === 4 ? f.ci : -1} />` : null}
    </div>
    ${f.loop >= 1 && f.loop <= 4 ? html`<div className="lx-sort-code">${CS_CODE[f.loop - 1]}</div>` : null}
    </div>`;
  }

  function DRadix({ f }) {
    const d = f.d, cur = f.t;
    const num = (x, colIdx, r) => {
      if (x == null) return html`<div key=${r} className="lx-sort-num lx-sort-e">${'·'.padStart(d, ' ')}</div>`;
      const s = String(x).padStart(d, ' ');
      const showT = cur >= 0 ? (colIdx === cur || colIdx === cur + 1 ? cur : -1) : (colIdx >= 1 ? colIdx - 1 : -1);
      const cls = 'lx-sort-num' + (colIdx === cur + 1 && r === f.bi ? ' lx-sort-new' : '') + (colIdx === cur && r === f.ja ? ' lx-sort-rd' : '');
      return html`<div key=${r} className=${cls}>${[...s].map((ch, p) => html`<span key=${p} className=${d - 1 - p === showT ? 'lx-sort-d' : ''}>${ch}</span>`)}</div>`;
    };
    const shown = cur >= 0 ? f.cols.slice(0, cur + 2) : f.cols;
    return html`<div className="lx-sort-w">
      <div className="lx-sort-cols">${shown.map((c, q) => html`<div key=${q} className="lx-sort-col" style=${cur >= 0 && q < cur ? { opacity: .5 } : null}><h5>${q === 0 ? 'input' : 'by ' + PL[q - 1]}</h5>${c.map((x, r) => num(x, q, r))}</div>`)}</div>
      ${f.C ? html`<div className="lx-sort-lab">Counting sort on the ${PL[cur]} digit</div><div className="lx-sort-arr">
        <${IxRow} n=${10} from=${0} />
        <${Cells} lab="C" v=${f.C} dim=${!!f.Cp} />
        ${f.Cp ? html`<${Cells} lab=${html`C′`} v=${f.Cp} hi=${f.ci} />` : null}</div>` : null}
    </div>`;
  }

  function Diagram({ f }) {
    const k = f.kind;
    return k === 'insertion' ? html`<${DInsertion} f=${f} />` : k === 'merge' ? html`<${DMerge} f=${f} />` : k === 'merge2' ? html`<${DMerge2} f=${f} />`
      : k === 'exchange' ? html`<${DExchange} f=${f} />` : k === 'partition' || k === 'quick' ? html`<${DQuick} f=${f} />` : k === 'counting' ? html`<${DCounting} f=${f} />` : html`<${DRadix} f=${f} />`;
  }

  function Controls({ cfg, setCfg }) {
    const setMethod = method => setCfg(c => { let text = c.text; try { build({ method, text }); } catch (e) { text = DEF[method]; } return { ...c, method, text }; });
    const hint = { merge2: 'list 1 | list 2', counting: 'keys 1 to 10', radix: '0 to 9999, up to 8' }[cfg.method] || 'up to 10 numbers';
    return html`<label className="tl-wide">Method<select value=${cfg.method} onChange=${e => setMethod(e.target.value)}>${METHODS.map(([v, t]) => html`<option key=${v} value=${v}>${t}</option>`)}</select></label>
      <label className="tl-wide">Values (${hint})<input value=${cfg.text} spellCheck="false" onInput=${e => { const text = e.target.value; setCfg(c => ({ ...c, text })); }} /></label>`;
  }

  const COST = {
    insertion: 'INSERTION-SORT on A[1..n] (slides index from 1). Worst case (reverse sorted) Θ(n²) with n(n−1)/2 comparisons, average Θ(n²), best case (sorted) Θ(n) with n − 1 comparisons. In place, O(1) extra space; stable because only strictly larger keys are shifted.',
    merge: 'MERGE-SORT sorts A[1..⌈n/2⌉] and A[⌈n/2⌉+1..n] (slide 1.25), then merges in Θ(n) using Θ(n) extra space. T(n) = 2T(n/2) + Θ(n) = Θ(n lg n) in every case. Ties take the left element first (stable).',
    merge2: 'Two-finger MERGE: compare only the two heads, output the smaller. Θ(n) time for n elements in total, at most n − 1 comparisons; leftover elements are copied without comparisons.',
    exchange: 'Neapolitan’s exchangesort (slide 1.55): for i = 1..n, for j = i+1..n, exchange when S[j] < S[i]. Every-case T(n) = n(n−1)/2 comparisons (slide 1.65).',
    partition: 'The slides’ PARTITION (Lomuto style, L5): pivot x = A[p], i ← p, for j ← p+1 to q, exchange A[i] ↔ A[j] when A[j] ≤ x, then A[p] ↔ A[i]. Θ(n): exactly n − 1 comparisons. The exchange count includes the line executions where i = j (nothing moves). This differs from the textbook’s last-element pivot; the slides’ version is used.',
    quick: 'QUICKSORT(A, p, r) with the slides’ PARTITION (pivot = first element A[p]). Best/balanced Θ(n lg n); worst case (already sorted or reverse sorted input) splits 0 : n−1, T(n) = T(n−1) + Θ(n) = Θ(n²), recursion depth n − 1. Depth here counts the QUICKSORT calls with p < r on the stack. In place, not stable. Randomized quicksort (slide 5.34) picks a random pivot instead: expected Θ(n lg n).',
    counting: 'Counting sort (L6): A[j] ∈ {1..k}, k = max key here, C[1..k]. Θ(n + k) time and space, no comparisons, stable (loop 4 runs j = n downto 1). The exam table rows are C (occurrence, after loop 2), C′ (accumulation, after loop 3) and the final C (after loop 4).',
    radix: 'LSD radix sort (L6): d passes of a stable counting sort on decimal digits 0..9 (C[0..9]), least significant first. Θ(d(n + k)); for n b-bit words split into r-bit digits, Θ((b/r)(n + 2^r)) and r = lg n gives Θ(bn / lg n).',
  };

  window.LAB = window.LAB || {};
  window.LAB['sort'] = {
    meta: {
      title: 'Sorting', group: 'Sequences', icon: '▥', desc: 'Insertion, merge, exchange, quick, counting, radix.',
      question: 'How does each sorting method of the course build order, and what does it cost?',
      model: 'Comparison sorts (insertion, merge, exchange, quicksort) move keys after comparing them and need Ω(n lg n) comparisons. Counting and radix sort never compare elements: they count keys and place them.',
      watch: 'Follow the highlighted cells and the live counts. A partitioned region is not yet a sorted region.',
    },
    defaults: { method: 'insertion', text: '8 2 4 9 3 6' },
    presets: [
      { label: 'Insertion sort trace', src: 'L1 slides 1.8-1.18', cfg: { method: 'insertion', text: '8 2 4 9 3 6' } },
      { label: 'Insertion worst case: reverse sorted', src: 'L1 slide 1.24', cfg: { method: 'insertion', text: '6 5 4 3 2 1' } },
      { label: 'Insertion best case: sorted', src: 'L1 slide 1.24', cfg: { method: 'insertion', text: '1 2 3 4 5 6' } },
      { label: 'Merge sort on 8 2 4 9 3 6', src: 'L1 slides 1.5, 1.25', cfg: { method: 'merge', text: '8 2 4 9 3 6' } },
      { label: 'MERGE 2 7 13 20 with 1 9 11 12', src: 'L1 slides 1.26-1.38', cfg: { method: 'merge2', text: '2 7 13 20 | 1 9 11 12' } },
      { label: 'Exchange sort, every case', src: 'L1 slides 1.55, 1.65 (array from slide 1.5)', cfg: { method: 'exchange', text: '8 2 4 9 3 6' } },
      { label: 'PARTITION trace, pivot 6', src: 'L5 slides 5.5-5.16', cfg: { method: 'partition', text: '6 10 13 5 8 3 2 11' } },
      { label: 'Quicksort on the slide array', src: 'L5 slides 5.5-5.17', cfg: { method: 'quick', text: '6 10 13 5 8 3 2 11' } },
      { label: 'Quicksort worst case: sorted input', src: 'L5 slides 5.19-5.26', cfg: { method: 'quick', text: '1 2 3 4 5 6 7 8' } },
      { label: 'Counting sort A = 4 1 3 4 3', src: 'L6 slides 6.13-6.28', cfg: { method: 'counting', text: '4 1 3 4 3' } },
      { label: 'Counting sort exam table', src: 'Midterm 2019 Q6, Final 1 Q3', cfg: { method: 'counting', text: '8 5 7 3 6 1 2' } },
      { label: 'Radix sort 329 … 355', src: 'L6 slide 6.32', cfg: { method: 'radix', text: '329 457 657 839 436 720 355' } },
    ],
    Controls, build, Diagram,
    legend: [['#f2a93b', 'Key / pivot / head'], ['color-mix(in srgb, var(--c) 24%, var(--paper))', 'Active or ≤ pivot'], ['color-mix(in srgb, #d23c3c 30%, var(--paper))', '≥ pivot'], ['color-mix(in srgb, var(--ok) 22%, var(--paper))', 'Sorted / placed'], ['#d23c3c', 'Exchange / write']],
    cost: cfg => COST[cfg.method] || '',
  };
})();

/* ── search ── */
// Visualizer lab: Searching (CS311 L1 Neapolitan part and L4). Binary search as divide and conquer (L4 slides 4.7-4.15,
// find 9 in 3 5 7 8 9 12 15), Neapolitan's binsearch (L1 slide 1.57), seqsearch with W(n), A(n), B(n) (L1 slides 1.53,
// 1.67-1.70), both side by side, and the slide's table of worst-case comparisons for large arrays (L1 slide 1.58).
(function () {
  const { useState, useMemo, useEffect } = React;
  const html = htm.bind(React.createElement);
  const CSS = `
.lx-search-w{ max-width:640px; margin:0 auto; color:var(--ink); }
.lx-search-row{ display:grid; gap:3px; margin:0 auto 3px; }
.lx-search-c{ min-height:36px; display:grid; place-items:center; border:1px solid var(--line); border-radius:6px; font:600 15px var(--mono, ui-monospace, monospace); color:var(--ink); background:var(--paper); min-width:0; transition:background .3s, opacity .3s, box-shadow .3s; }
.lx-search-in{ background:color-mix(in srgb, #e86a8a 26%, var(--paper)); }
.lx-search-mid{ background:#f2d33b; color:#1d1d1d; border-color:#b89a12; }
.lx-search-ok{ background:var(--ok); color:#fff; border-color:var(--ok); }
.lx-search-no{ box-shadow:0 0 0 2px var(--graphite) inset; opacity:.8; }
.lx-search-dim{ opacity:.35; }
.lx-search-ix{ font:500 12px var(--mono, ui-monospace, monospace); color:var(--graphite); text-align:center; min-width:0; }
.lx-search-ptr{ font:700 13px var(--mono, ui-monospace, monospace); color:var(--c); text-align:center; min-height:18px; min-width:0; white-space:nowrap; }
.lx-search-lab{ font:600 13px var(--body); color:var(--graphite); margin:10px 0 4px; text-transform:uppercase; letter-spacing:.04em; }
.lx-search-find{ text-align:center; font-size:15px; margin:0 0 8px; }
.lx-search-find b{ display:inline-grid; place-items:center; min-width:32px; height:28px; padding:0 6px; border-radius:6px; background:#f2d33b; color:#1d1d1d; font:700 15px var(--mono, ui-monospace, monospace); }
.lx-search-vars{ display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin:6px 0 0; }
.lx-search-vars span{ font:600 14px var(--mono, ui-monospace, monospace); padding:3px 9px; border-radius:6px; border:1px solid var(--line); background:var(--paper); }
.lx-search-calls{ display:grid; gap:3px; }
.lx-search-calls div{ font:500 14px var(--mono, ui-monospace, monospace); padding:3px 8px; border-radius:6px; border:1px solid var(--line); background:var(--paper); }
.lx-search-calls div.on{ border-color:var(--c); background:color-mix(in srgb, var(--c) 16%, var(--paper)); font-weight:700; }
.lx-search-tbl{ width:100%; border-collapse:collapse; font-size:14px; }
.lx-search-tbl th, .lx-search-tbl td{ border:1px solid var(--line); padding:5px 6px; text-align:right; font-variant-numeric:tabular-nums; }
.lx-search-tbl th{ font-size:12.5px; color:var(--graphite); text-align:center; font-weight:600; background:var(--paper-2); }
.lx-search-tbl tr.on td{ background:color-mix(in srgb, var(--c) 18%, var(--paper)); font-weight:700; }
.lx-search-tbl td{ background:var(--paper); }
.lx-search-chips{ display:flex; flex-wrap:wrap; gap:4px; justify-content:center; }
.lx-search-chips span{ font:600 13px var(--mono, ui-monospace, monospace); padding:3px 7px; border-radius:99px; border:1px solid var(--line); background:var(--paper); }
.lx-search-chips span.on{ background:#f2d33b; color:#1d1d1d; border-color:#b89a12; }
.lx-search-chips span.past{ opacity:.55; }
.lx-search-big{ display:grid; grid-template-columns:1fr 1fr; gap:6px; margin:8px 0 0; }
.lx-search-big div{ border:1px solid var(--line); border-radius:8px; padding:6px; text-align:center; font-size:13px; color:var(--graphite); background:var(--paper); }
.lx-search-big b{ display:block; font:700 20px var(--mono, ui-monospace, monospace); color:var(--ink); }
.lx-search-side{ display:grid; grid-template-columns:repeat(auto-fit, minmax(270px, 1fr)); gap:6px; }
.lx-search-box{ border:1px solid var(--line); border-radius:8px; padding:6px; background:color-mix(in srgb, var(--paper-2) 60%, var(--paper)); }
.lx-search-box h4{ margin:0 0 4px; font:700 14px var(--body); color:var(--ink); display:flex; justify-content:space-between; gap:6px; flex-wrap:wrap; }
.lx-search-box h4 span{ font-weight:600; color:var(--graphite); font-size:13px; }
.lx-search-span{ font:500 13px var(--mono, ui-monospace, monospace); color:var(--graphite); text-align:center; margin:4px 0 0; overflow-wrap:anywhere; }
`;
  if (!document.getElementById('lx-search-css')) { const s = document.createElement('style'); s.id = 'lx-search-css'; s.textContent = CSS; document.head.appendChild(s); }

  const strip = s => s.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  const cap = s => ({ html: s, desc: strip(s) });
  const fmt = x => Number(x).toLocaleString('en-US');
  const r2 = v => Math.round(v * 100) / 100;
  const SIZES = [128, 1024, 1048576, 4294967296];

  function parseKeys(text, sorted) {
    const t = String(text || '').split(/[\s,]+/).filter(Boolean);
    if (t.length < 1 || t.length > 10) throw new Error('Type 1 to 10 keys separated by spaces or commas (at most 10 so the array fits a phone).');
    if (t.some(x => !/^-?\d+$/.test(x))) throw new Error(`Use whole numbers only (got "${t.find(x => !/^-?\d+$/.test(x))}").`);
    const v = t.map(Number);
    if (v.some(x => x < -99 || x > 999)) throw new Error('Use keys from -99 to 999.');
    if (sorted && v.some((x, k) => k && v[k - 1] > x)) throw new Error('Binary search needs a sorted array: type the keys in nondecreasing order (for example 3 5 7 8 9 12 15).');
    return v;
  }
  function parseX(x) {
    if (!/^\s*-?\d+\s*$/.test(String(x))) throw new Error('Type a whole number to search for (x).');
    return Number(x);
  }

  /* ───────── L4 slides 4.7-4.15: divide and conquer binary search, A[1..n] ───────── */
  function dcFrames(A, x) {
    const n = A.length, F = [], calls = []; let lo = 1, hi = n, cmp = 0;
    const push = (o, s) => F.push(Object.assign({ kind: 'dc', A, x, lo, hi, mid: 0, found: 0, calls: calls.slice() }, o, cap(s),
      { metrics: [['Comparisons with x', cmp], ['Recursive calls', calls.length], ['Subarray size', Math.max(0, hi - lo + 1)], ['Worst case ⌊lg n⌋ + 1', Math.floor(Math.log2(n)) + 1]] }));
    for (;;) {
      if (lo > hi) { push({}, `lo = ${lo} &gt; hi = ${hi}: the subarray is empty, so <b>${x} is not in the array</b>. ${cmp} comparisons for n = ${n}: T(n) = T(n/2) + Θ(1) = Θ(lg n).`); break; }
      calls.push([lo, hi]);
      push({}, calls.length === 1 ? `Find ${x} in the sorted array A[1 .. ${n}]. Divide: check the middle element. Conquer: recursively search 1 subarray. Combine: trivial.` : `<b>Conquer</b>: recursively search 1 subarray, A[${lo} .. ${hi}] (${hi - lo + 1} element${hi > lo ? 's' : ''}).`);
      const mid = Math.floor((lo + hi) / 2), v = A[mid - 1]; cmp++;
      if (v === x) { push({ mid, found: mid }, `<b>Divide</b>: middle mid = ⌊(${lo} + ${hi})/2⌋ = ${mid}, A[${mid}] = ${v} = x: <b>found</b> at index ${mid} after ${cmp} comparison${cmp > 1 ? 's' : ''}. Combine is trivial. T(n) = 1·T(n/2) + Θ(1) = Θ(lg n) (master theorem case 2, n<sup>log<sub>2</sub>1</sup> = 1).`); break; }
      push({ mid }, `<b>Divide</b>: middle mid = ⌊(${lo} + ${hi})/2⌋ = ${mid}, A[${mid}] = ${v}. ${x} ${x < v ? '&lt;' : '&gt;'} ${v}, so only the ${x < v ? `left part A[${lo} .. ${mid - 1}]` : `right part A[${mid + 1} .. ${hi}]`} can hold ${x}.`);
      if (x < v) hi = mid - 1; else lo = mid + 1;
    }
    return F;
  }

  /* ───────── Neapolitan binsearch (L1 slide 1.57), S[1..n] ───────── */
  function binSteps(S, x) {
    const n = S.length, st = []; let low = 1, high = n, location = 0, pass = 0;
    while (low <= high && location === 0) {
      const mid = Math.floor((low + high) / 2); pass++;
      const v = S[mid - 1], o = { low, high, mid, pass, v };
      if (x === v) { location = mid; o.res = 'eq'; }
      else if (x < v) { high = mid - 1; o.res = 'lt'; } else { low = mid + 1; o.res = 'gt'; }
      Object.assign(o, { nlow: low, nhigh: high, location }); st.push(o);
    }
    return { st, location, low, high };
  }
  function binFrames(S, x) {
    const n = S.length, F = [], { st, location } = binSteps(S, x);
    const push = (o, s, done) => F.push(Object.assign({ kind: 'bin', A: S, x, lo: 1, hi: n, mid: 0, found: 0, location: 0, vars: null }, o, cap(s),
      { metrics: [['Comparisons (passes)', o.pass || 0], ['low', o.lo], ['high', o.hi], ['location', o.location]] }));
    push({ lo: 1, hi: n, location: 0, vars: { low: 1, high: n, mid: '–', location: 0 }, pass: 0 }, `binsearch(n = ${n}, S, x = ${x}): low ← 1, high ← n = ${n}, location ← 0. The loop runs while low ≤ high and location == 0.`);
    st.forEach(s => {
      const t = s.res === 'eq' ? `x == S[${s.mid}]: location ← ${s.mid}.` : s.res === 'lt' ? `x = ${x} &lt; S[${s.mid}] = ${s.v}: high ← mid − 1 = ${s.nhigh}.` : `x = ${x} &gt; S[${s.mid}] = ${s.v}: low ← mid + 1 = ${s.nlow}.`;
      push({ lo: s.low, hi: s.high, mid: s.mid, found: s.res === 'eq' ? s.mid : 0, location: s.location, pass: s.pass, vars: { low: s.low, high: s.high, mid: s.mid, location: s.location } },
        `Pass ${s.pass}: mid ← ⌊(low + high)/2⌋ = ⌊(${s.low} + ${s.high})/2⌋ = ${s.mid}, S[${s.mid}] = ${s.v}. ${t}`);
    });
    const last = st[st.length - 1] || { nlow: 1, nhigh: n, pass: 0 };
    push({ lo: location ? location : last.nlow, hi: location ? location : last.nhigh, found: location, location, pass: st.length, vars: { low: last.nlow, high: last.nhigh, mid: last.mid || '–', location } },
      location ? `The loop stops because location ≠ 0: <b>location = ${location}</b>. ${st.length} pass${st.length > 1 ? 'es' : ''}, each one comparison of x with S[mid]. Worst case W(n) = ⌊lg n⌋ + 1 = ${Math.floor(Math.log2(n)) + 1}.`
        : `The loop stops because low = ${last.nlow} &gt; high = ${last.nhigh}: x is not in S, <b>location = 0</b>. ${st.length} pass${st.length > 1 ? 'es' : ''}; worst case W(n) = ⌊lg n⌋ + 1 = ${Math.floor(Math.log2(n)) + 1}.`);
    return F;
  }

  /* ───────── seqsearch (L1 slide 1.53) with W(n), B(n), A(n) (slides 1.67-1.70) ───────── */
  function seqSteps(S, x) { const n = S.length; let loc = 1; const seen = []; while (loc <= n && S[loc - 1] !== x) { seen.push(loc); loc++; } if (loc <= n) seen.push(loc); return { seen, location: loc > n ? 0 : loc }; }
  function seqFrames(S, x, p) {
    const n = S.length, F = [], { seen, location } = seqSteps(S, x);
    const An = (n + 1) / 2, Ap = p * (n + 1) / 2 + (1 - p) * n;
    const push = (o, s) => F.push(Object.assign({ kind: 'seq', A: S, x, at: 0, upto: 0, location: 0, p, n, An, Ap, fin: false }, o, cap(s),
      { metrics: [['Comparisons S[location] != x', o.upto || 0], ['location', o.fin ? (o.location || 0) : (o.location || o.at || 1)], ['B(n) / W(n)', `1 / ${n}`], ['A(n) = (n+1)/2', r2(An)]] }));
    push({}, `seqsearch(n = ${n}, S, x = ${x}): location ← 1. While location ≤ n and S[location] != x, location++. The basic operation is the comparison of x with S[location].`);
    seen.forEach((loc, k) => {
      const hit = S[loc - 1] === x;
      push({ at: loc, upto: k + 1, location: hit ? loc : 0 }, hit ? `Comparison ${k + 1}: S[${loc}] = ${x} = x, so the loop stops with <b>location = ${loc}</b>.` : `Comparison ${k + 1}: S[${loc}] = ${S[loc - 1]} != ${x}, so location ← ${loc + 1}.`);
    });
    push({ at: 0, upto: seen.length, location, fin: true },
      (location ? `Found at location ${location} with <b>${seen.length}</b> comparison${seen.length > 1 ? 's' : ''}` + (location === 1 ? ': the best case, B(n) = 1.' : location === n ? `: x is last, the worst case W(n) = n = ${n}.` : '.') : `location = ${n + 1} &gt; n, so location ← 0: x is not in S after all <b>${n}</b> comparisons, the worst case W(n) = n.`)
      + ` If x is in S and every slot is equally likely, A(n) = Σ k·(1/n) = (n+1)/2 = ${r2(An)}. If x is in S with probability p = ${p}, A(n) = p(n+1)/2 + (1−p)n = n(1 − p/2) + p/2 = <b>${r2(Ap)}</b>.`);
    return F;
  }

  /* ───────── side by side (L1 slides 1.57-1.58) ───────── */
  function versusFrames(S, x) {
    const n = S.length, sq = seqSteps(S, x), bn = binSteps(S, x), T = Math.max(sq.seen.length, bn.st.length), F = [];
    const push = (t, s) => {
      const sc = Math.min(t, sq.seen.length), bc = Math.min(t, bn.st.length), b = bc ? bn.st[bc - 1] : null;
      F.push(Object.assign({ kind: 'versus', A: S, x, t, sc, sAt: sc ? sq.seen[sc - 1] : 0, sDone: t >= sq.seen.length && t > 0, sLoc: sq.location,
        bc, bLo: b ? b.low : 1, bHi: b ? b.high : n, bMid: b ? b.mid : 0, bDone: t >= bn.st.length && t > 0, bLoc: bn.location }, cap(s),
        { metrics: [['Sequential comparisons', sc], ['Binary comparisons', bc], ['Worst: n vs ⌊lg n⌋+1', `${n} vs ${Math.floor(Math.log2(n)) + 1}`]] }));
    };
    push(0, `Search for x = ${x} in the same sorted array (n = ${n}) with seqsearch (left to right) and binsearch (halving). Each step below is one comparison of x with a key.`);
    for (let t = 1; t <= T; t++) {
      const parts = [];
      if (t <= sq.seen.length) { const l = sq.seen[t - 1]; parts.push(`Sequential: S[${l}] = ${S[l - 1]}${S[l - 1] === x ? ' = x, found' : ' != x'}.`); } else parts.push(`Sequential is ${sq.location ? 'done' : 'done (not found)'}.`);
      if (t <= bn.st.length) { const b = bn.st[t - 1]; parts.push(`Binary: mid = ${b.mid}, S[${b.mid}] = ${b.v}${b.res === 'eq' ? ' = x, found' : b.res === 'lt' ? ` &gt; x, keep S[${b.low} .. ${b.mid - 1}]` : ` &lt; x, keep S[${b.mid + 1} .. ${b.high}]`}.`); } else parts.push(`Binary is ${bn.location ? 'done' : 'done (not found)'}.`);
      push(t, `Step ${t}. ` + parts.join(' '));
    }
    push(T + 1, `Sequential search used <b>${sq.seen.length}</b> comparison${sq.seen.length === 1 ? '' : 's'}, binary search <b>${bn.st.length}</b>. In the worst case for n = ${n}: ${n} against ⌊lg n⌋ + 1 = ${Math.floor(Math.log2(n)) + 1}. The gap grows fast: for n = 4,294,967,296 it is 4,294,967,296 against 33 (slide 1.58).`);
    return F;
  }

  /* ───────── slide 1.58 table: worst-case comparisons for huge n ───────── */
  function sizesFrames(N) {
    const F = []; let low = 1, high = N; const sizes = [];
    while (low <= high) { sizes.push(high - low + 1); const mid = Math.floor((low + high) / 2); low = mid + 1; }
    const W = sizes.length;
    const push = (k, s) => F.push(Object.assign({ kind: 'sizes', N, sizes, k }, cap(s), { metrics: [['Array size n', fmt(N)], ['Sequential W(n) = n', fmt(N)], ['Binary passes so far', Math.min(k, W)], ['Binary W(n) = ⌊lg n⌋ + 1', W]] }));
    push(0, `Worst case for an array of n = ${fmt(N)} keys: x is larger than every key (or absent). seqsearch compares x with all ${fmt(N)} keys. binsearch halves S[low .. high] on each pass.`);
    let lo = 1, hi = N;
    for (let k = 1; k <= W; k++) {
      const mid = Math.floor((lo + hi) / 2), sz = hi - lo + 1, nlo = mid + 1;
      push(k, `Pass ${k}: S[${fmt(lo)} .. ${fmt(hi)}] holds ${fmt(sz)} key${sz > 1 ? 's' : ''}; mid = ${fmt(mid)}, x &gt; S[mid], so low ← ${fmt(nlo)}` + (nlo > hi ? `, now low &gt; high and the loop ends.` : `, leaving ${fmt(hi - nlo + 1)}.`));
      lo = nlo;
    }
    push(W + 1, `binsearch needs <b>${W}</b> comparisons (⌊lg ${fmt(N)}⌋ + 1) where seqsearch needs <b>${fmt(N)}</b>.` + (SIZES.includes(N) ? ' Same as the slide’s table.' : ''));
    return F;
  }

  function build(cfg) {
    const m = cfg.method;
    if (m === 'sizes') {
      const t = String(cfg.n || '').replace(/[,\s]/g, '');
      if (!/^\d+$/.test(t) || +t < 1 || +t > 4294967296) throw new Error('Type an array size from 1 to 4,294,967,296.');
      return sizesFrames(+t);
    }
    const S = parseKeys(cfg.text, m !== 'seq'), x = parseX(cfg.x);
    if (m === 'dc') return dcFrames(S, x);
    if (m === 'bin') return binFrames(S, x);
    if (m === 'versus') return versusFrames(S, x);
    if (m === 'seq') {
      const p = Number(cfg.p);
      if (String(cfg.p).trim() === '' || !Number.isFinite(p) || p < 0 || p > 1) throw new Error('The probability p that x is in S must be a number from 0 to 1.');
      return seqFrames(S, x, p);
    }
    throw new Error('Choose a method.');
  }

  /* ───────── drawing ───────── */
  const g = n => ({ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, maxWidth: (n * 48) + 'px' });
  const Idx = ({ n }) => html`<div className="lx-search-row" style=${g(n)}>${Array.from({ length: n }, (_, k) => html`<div key=${k} className="lx-search-ix">${k + 1}</div>`)}</div>`;
  function Arr({ A, cls, ptr }) {
    const n = A.length;
    return html`<${Idx} n=${n} /><div className="lx-search-row" style=${g(n)}>${A.map((v, k) => html`<div key=${k} className=${'lx-search-c ' + (cls(k + 1) || '')}>${v}</div>`)}</div>
      ${ptr ? html`<div className="lx-search-row" style=${g(n)}>${A.map((_, k) => html`<div key=${k} className="lx-search-ptr">${ptr(k + 1).map(t => html`<div key=${t}>${t}</div>`)}</div>`)}</div>` : null}`;
  }
  const halfCls = (lo, hi, mid, found) => k => k === found ? 'lx-search-ok' : k === mid ? 'lx-search-mid' : k >= lo && k <= hi ? 'lx-search-in' : 'lx-search-dim';

  function DHalf({ f }) {
    const n = f.A.length;
    return html`<div className="lx-search-w">
      <p className="lx-search-find">Find <b>${f.x}</b></p>
      <${Arr} A=${f.A} cls=${halfCls(f.lo, f.hi, f.mid, f.found)} ptr=${k => [f.lo === k && f.lo <= f.hi ? (f.kind === 'bin' ? 'low' : 'lo') : '', f.hi === k && f.lo <= f.hi ? (f.kind === 'bin' ? 'high' : 'hi') : ''].filter(Boolean)} />
      ${f.kind === 'dc' ? html`<div className="lx-search-lab">Recursive calls (1 subarray each)</div><div className="lx-search-calls">${f.calls.map((c, q) => html`<div key=${q} className=${q === f.calls.length - 1 ? 'on' : ''}>${'  '.repeat(q)}search A[${c[0]} .. ${c[1]}] · size ${c[1] - c[0] + 1}</div>`)}</div>`
        : html`<div className="lx-search-vars">${Object.entries(f.vars).map(([a, b]) => html`<span key=${a}>${a} = ${b}</span>`)}</div>`}
    </div>`;
  }

  function DSeq({ f }) {
    return html`<div className="lx-search-w">
      <p className="lx-search-find">Find <b>${f.x}</b></p>
      <${Arr} A=${f.A} cls=${k => f.location === k ? 'lx-search-ok' : k === f.at ? 'lx-search-mid' : k < (f.fin ? f.upto + 1 : f.at) ? 'lx-search-no' : ''} ptr=${k => k === f.at ? ['loc'] : []} />
      <div className="lx-search-big"><div>comparisons<b>${f.upto}</b></div><div>location<b>${f.fin ? f.location : f.location || f.at || 1}</b></div></div>
      <div className="lx-search-lab">Cases for n = ${f.n}</div>
      <table className="lx-search-tbl"><tbody>
        <tr><td style=${{ textAlign: 'left' }}>Best B(n) = 1 (x = S[1])</td><td>1</td></tr>
        <tr><td style=${{ textAlign: 'left' }}>Worst W(n) = n (x last or absent)</td><td>${f.n}</td></tr>
        <tr><td style=${{ textAlign: 'left' }}>Average A(n) = (n+1)/2</td><td>${r2(f.An)}</td></tr>
        <tr><td style=${{ textAlign: 'left' }}>With p = ${f.p}: n(1 − p/2) + p/2</td><td>${r2(f.Ap)}</td></tr>
      </tbody></table>
    </div>`;
  }

  function DVersus({ f }) {
    return html`<div className="lx-search-w">
      <p className="lx-search-find">Find <b>${f.x}</b></p>
      <div className="lx-search-side">
        <div className="lx-search-box"><h4>Sequential search <span>${f.sc} comparison${f.sc === 1 ? '' : 's'}</span></h4>
          <${Arr} A=${f.A} cls=${k => f.sDone && f.sLoc === k ? 'lx-search-ok' : k === f.sAt && !f.sDone ? 'lx-search-mid' : k < f.sAt || (f.sDone && k <= f.sAt) ? 'lx-search-no' : ''} /></div>
        <div className="lx-search-box"><h4>Binary search <span>${f.bc} comparison${f.bc === 1 ? '' : 's'}</span></h4>
          <${Arr} A=${f.A} cls=${f.bDone && f.bLoc ? halfCls(0, -1, 0, f.bLoc) : f.bDone ? () => 'lx-search-dim' : halfCls(f.bLo, f.bHi, f.bMid, 0)} /></div>
      </div>
      <div className="lx-search-lab">Worst-case comparisons (slide 1.58)</div>
      <${Table} n=${f.A.length} />
    </div>`;
  }
  const Table = ({ n }) => html`<table className="lx-search-tbl"><thead><tr><th>Array size</th><th>Sequential</th><th>Binary</th></tr></thead><tbody>
    ${(SIZES.includes(n) ? SIZES : [n, ...SIZES]).map(r => html`<tr key=${r} className=${r === n ? 'on' : ''}><td>${fmt(r)}</td><td>${fmt(r)}</td><td>${Math.floor(Math.log2(r)) + 1}</td></tr>`)}</tbody></table>`;

  function DSizes({ f }) {
    const W = f.sizes.length, many = W > 12;
    const idx = many ? [0, 1, 2, 3, -1, W - 4, W - 3, W - 2, W - 1] : f.sizes.map((_, q) => q);
    const cur = f.k - 1;
    return html`<div className="lx-search-w">
      <${Table} n=${f.N} />
      <div className="lx-search-lab">Size of S[low .. high] at each binsearch pass</div>
      <div className="lx-search-chips">${idx.map((q, z) => q < 0 ? html`<span key=${'g' + z}>…</span>` : html`<span key=${z} className=${q === cur ? 'on' : q < cur || f.k > W ? 'past' : ''}>${fmt(f.sizes[q])}</span>`)}</div>
      ${many && cur >= 4 && cur < W - 4 ? html`<p className="lx-search-span">now pass ${f.k}: ${fmt(f.sizes[cur])} keys left</p>` : null}
      <div className="lx-search-big"><div>sequential<b>${fmt(f.N)}</b></div><div>binary<b>${Math.min(f.k, W)}${f.k <= W ? ' / ' + W : ''}</b></div></div>
    </div>`;
  }

  function Diagram({ f }) {
    return f.kind === 'seq' ? html`<${DSeq} f=${f} />` : f.kind === 'versus' ? html`<${DVersus} f=${f} />` : f.kind === 'sizes' ? html`<${DSizes} f=${f} />` : html`<${DHalf} f=${f} />`;
  }

  const METHODS = [['dc', 'Binary search, D&C (L4)'], ['bin', 'binsearch (L1)'], ['seq', 'seqsearch (L1)'], ['versus', 'Sequential vs binary'], ['sizes', 'Worst case, large n (L1)']];
  function Controls({ cfg, setCfg }) {
    const set = (k, v) => setCfg(c => ({ ...c, [k]: v }));
    const setMethod = method => setCfg(c => {
      const n = { ...c, method };
      if (method === 'sizes') { if (!n.n) n.n = '128'; return n; }
      try { parseKeys(n.text, method !== 'seq'); } catch (e) { n.text = method === 'seq' ? '8 2 4 9 3 6' : '3 5 7 8 9 12 15'; n.x = '9'; }
      if (method === 'seq' && (n.p === undefined || n.p === '')) n.p = '1';
      return n;
    });
    return html`<label className="tl-wide">Method<select value=${cfg.method} onChange=${e => setMethod(e.target.value)}>${METHODS.map(([v, t]) => html`<option key=${v} value=${v}>${t}</option>`)}</select></label>
      ${cfg.method === 'sizes' ? html`<label className="tl-wide">Array size n (up to 4,294,967,296)<input inputMode="numeric" value=${cfg.n || ''} onInput=${e => set('n', e.target.value)} /></label>`
        : html`<label className="tl-wide">Keys S[1..n] (up to 10${cfg.method === 'seq' ? '' : ', sorted'})<input value=${cfg.text} spellCheck="false" onInput=${e => set('text', e.target.value)} /></label>
          <label>Search for x<input inputMode="numeric" value=${cfg.x} onInput=${e => set('x', e.target.value)} /></label>
          ${cfg.method === 'seq' ? html`<label>p = P(x in S)<input inputMode="decimal" value=${cfg.p} onInput=${e => set('p', e.target.value)} /></label>` : null}`}`;
  }

  const COST = {
    dc: 'Binary search as divide and conquer (L4): divide = check the middle element A[⌊(lo+hi)/2⌋], conquer = search 1 subarray, combine = trivial. T(n) = 1·T(n/2) + Θ(1) = Θ(lg n) by master theorem case 2. Arrays index from 1 as on the slides; one comparison per middle check (equal / smaller / larger is counted once).',
    bin: 'Neapolitan’s binsearch (slide 1.57): low = 1, high = n, location = 0; while low ≤ high and location == 0, mid = ⌊(low+high)/2⌋. Each pass counts as one comparison of x with S[mid] (Neapolitan’s convention), so the worst case is W(n) = ⌊lg n⌋ + 1 (slide 1.58: 128 → 8). Duplicates may return any matching location.',
    seq: 'seqsearch (slide 1.53): basic operation = comparison of x with S[location]. No every-case complexity (slide 1.67): B(n) = 1, W(n) = n, A(n) = (n+1)/2 if x is in S with each slot equally likely, A(n) = n(1 − p/2) + p/2 if x is in S with probability p. Works on unsorted arrays.',
    versus: 'Both searches on the same sorted array, one comparison per step. Sequential: up to n; binary: up to ⌊lg n⌋ + 1 (slide 1.58). Binary search needs sorted input; sequential search does not.',
    sizes: 'Slide 1.58 table: worst-case comparisons are n for seqsearch and ⌊lg n⌋ + 1 for binsearch (x larger than every key, so low moves right on every pass). 4,294,967,296 = 2³² keys need only 33 comparisons.',
  };

  window.LAB = window.LAB || {};
  window.LAB['search'] = {
    meta: {
      title: 'Searching', group: 'Sequences', icon: '⌕', desc: 'Binary vs sequential search, comparison counts.',
      question: 'How many comparisons does it take to find x, and why does a sorted array change the answer?',
      model: 'Sequential search checks the keys one by one: up to n comparisons. Binary search on a sorted array checks the middle and keeps only one half: T(n) = T(n/2) + Θ(1) = Θ(lg n).',
      watch: 'Pink is the part that can still hold x, yellow is the key being compared, green is the match. Count the comparisons.',
    },
    defaults: { method: 'dc', text: '3 5 7 8 9 12 15', x: '9', p: '1', n: '128' },
    presets: [
      { label: 'Binary search: find 9', src: 'L4 slides 4.8-4.13', cfg: { method: 'dc', text: '3 5 7 8 9 12 15', x: '9', p: '1', n: '128' } },
      { label: 'binsearch: find 9', src: 'L1 slide 1.57', cfg: { method: 'bin', text: '3 5 7 8 9 12 15', x: '9', p: '1', n: '128' } },
      { label: 'seqsearch: x = 9', src: 'L1 slides 1.53, 1.69 (array from slide 1.5)', cfg: { method: 'seq', text: '8 2 4 9 3 6', x: '9', p: '1', n: '128' } },
      { label: 'seqsearch best case: x = S[1]', src: 'L1 slide 1.70 (array from slide 1.5)', cfg: { method: 'seq', text: '8 2 4 9 3 6', x: '8', p: '1', n: '128' } },
      { label: 'seqsearch worst case: x not in S', src: 'L1 slide 1.68 (array from slide 1.5)', cfg: { method: 'seq', text: '8 2 4 9 3 6', x: '5', p: '0.5', n: '128' } },
      { label: 'Sequential vs binary: find 9', src: 'L1 slides 1.57-1.58, L4', cfg: { method: 'versus', text: '3 5 7 8 9 12 15', x: '9', p: '1', n: '128' } },
      { label: 'Table: n = 128', src: 'L1 slide 1.58', cfg: { method: 'sizes', text: '3 5 7 8 9 12 15', x: '9', p: '1', n: '128' } },
      { label: 'Table: n = 1,024', src: 'L1 slide 1.58', cfg: { method: 'sizes', text: '3 5 7 8 9 12 15', x: '9', p: '1', n: '1024' } },
      { label: 'Table: n = 1,048,576', src: 'L1 slide 1.58', cfg: { method: 'sizes', text: '3 5 7 8 9 12 15', x: '9', p: '1', n: '1048576' } },
      { label: 'Table: n = 4,294,967,296', src: 'L1 slide 1.58', cfg: { method: 'sizes', text: '3 5 7 8 9 12 15', x: '9', p: '1', n: '4294967296' } },
    ],
    Controls, build, Diagram,
    legend: [['color-mix(in srgb, #e86a8a 30%, var(--paper))', 'Can still hold x'], ['#f2d33b', 'Compared now'], ['var(--ok)', 'Found'], ['var(--graphite)', 'Compared, not x']],
    cost: cfg => COST[cfg.method] || '',
  };
})();

/* ── select ── */
/* ── lab: select (Selection, Lecture 7) ── */
// RAND-SELECT with the slides' PARTITION (L5 slide 4: pivot x = A[p], 1-based) and the worst-case linear SELECT
// (median of medians, L7 slides 19-30) on real numbers. Every frame is plain data built in build(); Diagram only draws it.
(function () {
  const { useState, useMemo, useEffect } = React;
  const html = htm.bind(React.createElement);
  const CSS = `
.lx-select-wrap{ max-width:640px; margin:0 auto; color:var(--ink); }
.lx-select-stack{ display:flex; flex-wrap:wrap; gap:4px 6px; align-items:center; margin:0 0 10px; font-size:12.5px; }
.lx-select-call{ font-family:var(--mono); padding:3px 7px; border-radius:7px; border:1px solid var(--line); background:var(--paper); color:var(--graphite); }
.lx-select-call.on{ border-color:var(--c); color:var(--ink); background:color-mix(in srgb, var(--c) 12%, var(--paper)); font-weight:600; }
.lx-select-arrow{ color:var(--graphite); font-size:12.5px; }
.lx-select-arr{ display:flex; flex-wrap:wrap; gap:4px 3px; justify-content:center; }
.lx-select-cell{ width:33px; text-align:center; transition:opacity .3s; }
.lx-select-cell b{ display:flex; align-items:center; justify-content:center; height:36px; border:1.5px solid var(--graphite); border-radius:6px; font-size:15px; font-weight:600; background:var(--paper); color:var(--ink); transition:background .3s, border-color .3s; }
.lx-select-cell span{ display:block; font-size:12px; color:var(--graphite); line-height:1.25; margin-top:2px; }
.lx-select-cell em{ display:block; font-style:normal; font-size:12px; font-weight:700; color:var(--c); min-height:15px; line-height:1.25; }
.lx-select-cell.out{ opacity:.32; }
.lx-select-cell.lo b{ background:color-mix(in srgb, var(--c) 24%, var(--paper)); }
.lx-select-cell.hi b{ background:color-mix(in srgb, #eb8452 26%, var(--paper)); }
.lx-select-cell.pv b{ background:color-mix(in srgb, var(--ok) 30%, var(--paper)); border-color:var(--ok); border-width:2.5px; }
.lx-select-cell.cur b{ box-shadow:0 0 0 3px #f2a93b; }
.lx-select-cell.ans b{ background:#22a06b; border-color:#22a06b; color:#fff; }
.lx-select-info{ display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin:12px 0 0; font-size:13px; }
.lx-select-info span{ padding:3px 8px; border-radius:8px; background:var(--paper-2); border:1px solid var(--line); }
.lx-select-info b{ color:var(--c); }
.lx-select-code{ margin:12px auto 0; max-width:440px; font-family:var(--mono); font-size:12.5px; line-height:1.5; background:var(--paper); border:1px solid var(--line); border-radius:9px; padding:6px 4px; }
.lx-select-code div{ padding:0 8px; border-radius:5px; white-space:pre-wrap; overflow-wrap:anywhere; }
.lx-select-code div.on{ background:color-mix(in srgb, var(--c) 18%, var(--paper)); box-shadow:inset 3px 0 0 var(--c); }
.lx-select-code div.hd{ color:var(--graphite); font-weight:700; }
.lx-select-sub{ font-size:13px; color:var(--graphite); text-align:center; margin:8px 0 6px; }
.lx-select-grid{ display:grid; gap:5px; margin:0 auto; }
.lx-select-col{ display:grid; gap:4px; min-width:0; }
.lx-select-col > i{ font-style:normal; text-align:center; font-size:12px; color:var(--graphite); }
.lx-select-g{ display:flex; align-items:center; justify-content:center; height:32px; border:1.5px solid var(--line); border-radius:6px; font-size:14px; font-weight:600; background:var(--paper); color:var(--ink); min-width:0; }
.lx-select-g.med{ background:#f2d43a; border-color:#c9a800; color:#2b2400; }
.lx-select-g.x{ background:#d23c3c; border-color:#d23c3c; color:#fff; }
.lx-select-g.le{ background:color-mix(in srgb, var(--c) 24%, var(--paper)); }
.lx-select-g.ge{ background:color-mix(in srgb, #eb8452 26%, var(--paper)); }
.lx-select-g.le.med, .lx-select-g.ge.med{ background:#f2d43a; color:#2b2400; }
.lx-select-g.dim{ opacity:.35; }
.lx-select-left{ display:flex; flex-wrap:wrap; gap:4px; justify-content:center; align-items:center; margin-top:8px; font-size:12.5px; color:var(--graphite); }
.lx-select-left .lx-select-g{ width:34px; }
.lx-select-guar{ margin:10px auto 0; max-width:440px; font-size:13px; line-height:1.5; padding:6px 10px; border-radius:9px; border:1px solid color-mix(in srgb, var(--ok) 50%, var(--line)); background:color-mix(in srgb, var(--ok) 8%, var(--paper)); }
`;
  if (!document.getElementById('lx-select-css')) { const s = document.createElement('style'); s.id = 'lx-select-css'; s.textContent = CSS; document.head.appendChild(s); }

  const ord = i => i + (i % 10 === 1 && i % 100 !== 11 ? 'st' : i % 10 === 2 && i % 100 !== 12 ? 'nd' : i % 10 === 3 && i % 100 !== 13 ? 'rd' : 'th');
  const rng = seed => { let a = (seed >>> 0) || 1; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const parse = (text, max) => {
    const parts = String(text).trim().split(/[\s,]+/).filter(Boolean);
    if (!parts.length) throw new Error('Enter some numbers, separated by spaces or commas.');
    if (parts.length > max) throw new Error(`Keep it to at most ${max} numbers so the array fits a phone (you have ${parts.length}).`);
    if (parts.some(x => !/^-?\d+$/.test(x))) throw new Error('Use whole numbers only, for example 6 10 13 5 8 3 2 11.');
    const v = parts.map(Number);
    if (v.some(x => x < -99 || x > 999)) throw new Error('Keep every number between −99 and 999.');
    return v;
  };
  const rank = (cfg, n) => {
    const s = String(cfg.i).trim();
    if (!/^\d+$/.test(s)) throw new Error('The rank i must be a whole number.');
    const i = +s; if (i < 1 || i > n) throw new Error(`The rank i must be between 1 and n = ${n}.`);
    return i;
  };

  /* ── RAND-SELECT (L7 slide 3) with PARTITION (L5 slide 4) ── */
  const RS_CODE = [['hd', 'RAND-SELECT(A, p, q, i)'], ['', '1 if p = q then return A[p]'], ['', '2 r ← RAND-PARTITION(A, p, q)'], ['', '3 k ← r − p + 1'], ['', '4 if i = k then return A[r]'], ['', '5 if i < k'], ['', '6   then return RAND-SELECT(A, p, r − 1, i)'], ['', '7   else return RAND-SELECT(A, r + 1, q, i − k)'],
    ['hd', 'PARTITION(A, p, q)'], ['', 'x ← A[p]; i ← p'], ['', 'for j ← p + 1 to q'], ['', '  do if A[j] ≤ x then i ← i + 1; exchange A[i] ↔ A[j]'], ['', 'exchange A[p] ↔ A[i]; return i']];
  function randFrames(cfg) {
    const A = parse(cfg.values, 16), n = A.length, i0 = rank(cfg, n), rnd = cfg.pivot === 'random', scan = cfg.scan !== 'call', R = rng(+cfg.seed || 1);
    const sorted = [...A].sort((a, b) => a - b), answer = sorted[i0 - 1];
    const F = []; let p = 1, q = n, i = i0, cmp = 0, exch = 0, calls = 0; const stack = [];
    const push = (o) => F.push(Object.assign({ kind: 'rand', A: [...A], p, q, rank: i, stack: stack.map(s => ({ ...s })), metrics: [['Rank wanted', i], ['Subarray size', q - p + 1], ['Calls', calls], ['Comparisons', cmp], ['Exchanges', exch]] }, o));
    push({ line: -1, desc: `Find the ${ord(i0)} smallest of these ${n} numbers without sorting. RAND-SELECT partitions, then keeps only the side that holds rank i.`, html: `Find the <b>${ord(i0)} smallest</b> of these ${n} numbers without sorting. RAND-SELECT partitions, then keeps only the side that holds rank i.` });
    for (;;) {
      calls++; stack.push({ t: `RAND-SELECT(A, ${p}, ${q}, ${i})` });
      if (p === q) {
        push({ line: 1, ans: p, done: true, desc: `RAND-SELECT(A, ${p}, ${q}, ${i}): p = q, one element left, so return A[${p}] = ${A[p - 1]}. It is the ${ord(i0)} smallest.`, html: `RAND-SELECT(A, ${p}, ${q}, ${i}): p = q, one element left, so return A[${p}] = <b>${A[p - 1]}</b>, the ${ord(i0)} smallest.`, inv: `Check: sorted, the input is ${sorted.join(' ')}; position ${i0} holds ${answer}.` });
        break;
      }
      const t = rnd ? p + Math.floor(R() * (q - p + 1)) : p;
      push({ line: 2, pick: t, desc: `RAND-SELECT(A, ${p}, ${q}, ${i}): ${rnd ? `RAND-PARTITION picks A[${t}] = ${A[t - 1]} at random${t !== p ? ` and exchanges it with A[${p}], so PARTITION can use x = A[p]` : ' (it is already at A[p])'}` : `the pivot is the first element, x = A[${p}] = ${A[p - 1]}${calls === 1 && cfg.values.replace(/[\s,]+/g, ' ').trim() === '6 10 13 5 8 3 2 11' ? ', as on slide 4' : ''}`}.` });
      if (t !== p) { [A[p - 1], A[t - 1]] = [A[t - 1], A[p - 1]]; exch++; }
      const x = A[p - 1]; let ii = p;
      if (scan) push({ line: 9, x, ii, j: p, desc: `PARTITION(A, ${p}, ${q}): x ← A[${p}] = ${x}, i ← ${p}. Scan j from ${p + 1} to ${q}: everything in A[${p + 1}..i] will be ≤ ${x}, everything in A[i+1..j−1] greater.` });
      for (let j = p + 1; j <= q; j++) {
        cmp++;
        if (A[j - 1] <= x) { ii++; const sw = ii !== j; [A[ii - 1], A[j - 1]] = [A[j - 1], A[ii - 1]]; if (sw) exch++;
          if (scan) push({ line: 11, x, ii, j, desc: `j = ${j}: A[j] = ${A[ii - 1]} ≤ ${x}, so i ← ${ii}${sw ? ` and exchange A[${ii}] ↔ A[${j}]` : ' (exchanging A[i] with itself)'}. The ≤ ${x} region grows.` });
        } else if (scan) push({ line: 11, x, ii, j, desc: `j = ${j}: A[j] = ${A[j - 1]} > ${x}, so it stays in the greater region; i stays ${ii}.` });
      }
      if (ii !== p) exch++; [A[p - 1], A[ii - 1]] = [A[ii - 1], A[p - 1]];
      const r = ii, k = r - p + 1;
      push({ line: 3, r, x, desc: `PARTITION ends: exchange A[${p}] ↔ A[${r}] puts the pivot ${x} at r = ${r}. ${r > p ? `A[${p}..${r - 1}] ≤ ${x}` : 'Nothing is smaller'}, ${r < q ? `A[${r + 1}..${q}] ≥ ${x}` : 'nothing is larger'}. k = r − p + 1 = ${r} − ${p} + 1 = ${k}, the rank of ${x} in A[${p}..${q}].`,
        html: `PARTITION ends: exchange A[${p}] ↔ A[${r}] puts the pivot ${x} at <b>r = ${r}</b>. ${r > p ? `A[${p}..${r - 1}] ≤ ${x}` : 'Nothing is smaller'}, ${r < q ? `A[${r + 1}..${q}] ≥ ${x}` : 'nothing is larger'}. <b>k = r − p + 1 = ${r} − ${p} + 1 = ${k}</b>, the rank of ${x} in A[${p}..${q}].` });
      const top = stack[stack.length - 1];
      if (i === k) {
        top.note = `k = ${k} = i: found`;
        push({ line: 4, r, x, ans: r, done: true, desc: `i = ${i} = k, so return A[${r}] = ${x}. It is the ${ord(i0)} smallest.`, html: `i = ${i} = k, so return A[${r}] = <b>${x}</b>, the ${ord(i0)} smallest.`, inv: `Check: sorted, the input is ${sorted.join(' ')}; position ${i0} holds ${answer}.` });
        break;
      }
      if (i < k) {
        top.note = `i < k: keep left, rank ${i}`;
        push({ line: 6, r, x, keep: 'lo', desc: `i = ${i} < k = ${k}: the answer is among the ${k - 1} smaller elements. Keep A[${p}..${r - 1}] with the same rank i = ${i}; the pivot and the right side are thrown away.`, html: `i = ${i} &lt; k = ${k}: the answer is among the ${k - 1} smaller elements. Keep <b>A[${p}..${r - 1}]</b> with the same rank i = ${i}; the pivot and the right side are thrown away.` });
        q = r - 1;
      } else {
        top.note = `i > k: keep right, rank ${i} − ${k} = ${i - k}`;
        push({ line: 7, r, x, keep: 'hi', desc: `i = ${i} > k = ${k}: ${k > 1 ? `the pivot and the ${k - 1} element${k > 2 ? 's' : ''} left of it are` : 'the pivot is'} smaller, so the answer is the ${ord(i - k)} smallest of A[${r + 1}..${q}] (i − k = ${i} − ${k} = ${i - k}).`, html: `i = ${i} &gt; k = ${k}: ${k > 1 ? `the pivot and the ${k - 1} element${k > 2 ? 's' : ''} left of it are` : 'the pivot is'} smaller, so look for the <b>${ord(i - k)}</b> smallest of <b>A[${r + 1}..${q}]</b> (i − k = ${i} − ${k} = ${i - k}).` });
        p = r + 1; i = i - k;
      }
    }
    return F;
  }

  /* ── worst-case linear SELECT, median of medians (L7 slides 19-30) ── */
  function partitionArr(B, x) { // the slides' PARTITION with x moved to the front: returns the rearranged copy and r (1-based)
    const A = [...B], t = A.indexOf(x); [A[0], A[t]] = [A[t], A[0]]; let ii = 1;
    for (let j = 2; j <= A.length; j++) if (A[j - 1] <= x) { ii++; [A[ii - 1], A[j - 1]] = [A[j - 1], A[ii - 1]]; }
    [A[0], A[ii - 1]] = [A[ii - 1], A[0]]; return { A, r: ii };
  }
  function momFrames(cfg) {
    const A0 = parse(cfg.values, 45), n0 = A0.length, i0 = rank(cfg, n0);
    if (new Set(A0).size !== n0) throw new Error('The median-of-medians analysis on the slides assumes distinct elements: remove the repeated numbers.');
    const answer = [...A0].sort((a, b) => a - b)[i0 - 1];
    const F = [], stack = []; let calls = 0, work = 0;
    const push = (o, B, i) => F.push(Object.assign({ kind: 'mom', B: [...B], rank: i, stack: stack.map(s => ({ ...s })), metrics: [['Call depth', stack.length], ['n in this call', B.length], ['Rank wanted', i], ['SELECT calls', calls], ['Elements handled', work]] }, o));
    function sel(B, i, why) {
      calls++; work += B.length; const n = B.length;
      stack.push({ t: `SELECT(${i}, ${n})${why ? ' ' + why : ''}` });
      if (n <= 5) {
        const S = [...B].sort((a, b) => a - b);
        push({ phase: 'base', S, pick: i - 1, desc: n === 1 ? `SELECT(1, 1): a single element, ${S[0]}, is its own answer.` : `SELECT(${i}, ${n}): only ${n} elements, so sort them by rote (constant time) and take position ${i}: ${S[i - 1]}.`, html: n === 1 ? `SELECT(1, 1): a single element, <b>${S[0]}</b>, is its own answer.` : `SELECT(${i}, ${n}): only ${n} elements, so sort them by rote (constant time) and take position ${i}: <b>${S[i - 1]}</b>.` }, B, i);
        stack.pop(); return S[i - 1];
      }
      const g = Math.floor(n / 5), groups = Array.from({ length: g }, (_, j) => B.slice(5 * j, 5 * j + 5)), left = B.slice(5 * g);
      push({ phase: 'groups', groups, left, desc: `SELECT(${i}, ${n}), step 1: divide the ${n} elements into groups of 5: ⌊n/5⌋ = ⌊${n}/5⌋ = ${g} group${g > 1 ? 's' : ''}${left.length ? `, ${left.length} left over (they still take part in the partition)` : ''}.` }, B, i);
      const sg = groups.map(G => [...G].sort((a, b) => a - b)), meds = sg.map(G => G[2]);
      push({ phase: 'sorted', groups: sg, left, desc: `Step 1: find the median of each 5-element group by rote: sort each group (lesser on top) and take its 3rd element. Group medians: ${meds.join(', ')}.`, html: `Step 1: find the median of each 5-element group by rote: sort each group (lesser on top) and take its 3rd element. Group medians: <b>${meds.join(', ')}</b>.` }, B, i);
      const mi = Math.floor((g + 1) / 2);
      push({ phase: 'sorted', groups: sg, left, desc: `Step 2: recursively SELECT the median x of the ${g} group median${g > 1 ? 's' : ''}: rank ⌊(${g} + 1)/2⌋ = ${mi} among them. This call costs T(n/5).` }, B, i);
      const x = sel(meds, mi, 'on the medians');
      const order = sg.map((G, j) => j).sort((a, b) => meds[a] - meds[b]), cs = order.map(j => sg[j]);
      const le = meds.filter(m => m <= x).length, ge = meds.filter(m => m >= x).length, guar = 3 * Math.floor(n / 10);
      push({ phase: 'x', groups: cs, left, x, desc: `Back in SELECT(${i}, ${n}): x = ${x}. Groups are redrawn in order of their medians. ${le} group median${le > 1 ? 's are' : ' is'} ≤ x, at least ⌊⌊n/5⌋/2⌋ = ⌊n/10⌋ = ${Math.floor(n / 10)}.`, html: `Back in SELECT(${i}, ${n}): the pivot is <b>x = ${x}</b>. Groups are redrawn in order of their medians. ${le} group median${le > 1 ? 's are' : ' is'} ≤ x, at least ⌊⌊n/5⌋/2⌋ = ⌊n/10⌋ = ${Math.floor(n / 10)}.` }, B, i);
      const smaller = B.filter(v => v < x).length, larger = B.filter(v => v > x).length;
      push({ phase: 'guar', groups: cs, left, x, le, ge, guar, smaller, larger, desc: `Each median ≤ x brings the 2 smaller elements of its group: at least 3·${le} = ${3 * le} elements are ≤ x (shaded blue), and 3·${ge} = ${3 * ge} are ≥ x (shaded orange). The slides' guarantee: at least 3⌊n/10⌋ = ${guar} on each side${n >= 50 ? ', and 3⌊n/10⌋ ≥ n/4 for n ≥ 50' : ''}.`,
        html: `Each median ≤ x brings the 2 smaller elements of its group: at least 3·${le} = <b>${3 * le}</b> elements are ≤ x (blue), and 3·${ge} = <b>${3 * ge}</b> are ≥ x (orange). The slides' guarantee: at least <b>3⌊n/10⌋ = ${guar}</b> on each side, so the recursive call in step 4 can never get more than n − ${guar} = ${n - guar} elements.`,
        inv: `Guarantee 3⌊n/10⌋ = ${guar}; actually ${smaller + 1} elements are ≤ x and ${larger + 1} are ≥ x.` }, B, i);
      const { A: P, r } = partitionArr(B, x), k = r;
      push({ phase: 'part', P, r, x, desc: `Step 3: partition around x = ${x} (the slides' PARTITION with x moved to the front). It lands at position r = ${r}, so k = rank(x) = ${k}: ${k - 1} smaller, ${n - k} larger.`, html: `Step 3: partition around x = ${x} (the slides' PARTITION with x moved to the front). It lands at position ${r}, so <b>k = rank(x) = ${k}</b>: ${k - 1} smaller, ${n - k} larger.` }, B, i);
      const top = stack[stack.length - 1];
      if (i === k) {
        top.note = `k = ${k} = i: x`;
        push({ phase: 'part', P, r, x, ans: r, desc: `Step 4: i = ${i} = k, so return x = ${x}.`, html: `Step 4: i = ${i} = k, so return <b>x = ${x}</b>.` }, B, i);
        stack.pop(); return x;
      }
      if (i < k) {
        top.note = `i < k: lower part`;
        push({ phase: 'part', P, r, x, keep: 'lo', desc: `Step 4: i = ${i} < k = ${k}: recursively SELECT the ${ord(i)} smallest in the lower part (${k - 1} elements, at most n − 3⌊n/10⌋ = ${n - guar}). This is T(3n/4) in the worst case.`, html: `Step 4: i = ${i} &lt; k = ${k}: recursively SELECT the <b>${ord(i)}</b> smallest in the <b>lower part</b> (${k - 1} elements, at most n − 3⌊n/10⌋ = ${n - guar}).` }, B, i);
        const v = sel(P.slice(0, r - 1), i, 'lower part'); stack.pop(); return v;
      }
      top.note = `i > k: upper part, rank ${i - k}`;
      push({ phase: 'part', P, r, x, keep: 'hi', desc: `Step 4: i = ${i} > k = ${k}: recursively SELECT the (i − k) = ${ord(i - k)} smallest in the upper part (${n - k} elements, at most n − 3⌊n/10⌋ = ${n - guar}). This is T(3n/4) in the worst case.`, html: `Step 4: i = ${i} &gt; k = ${k}: recursively SELECT the (i − k) = <b>${ord(i - k)}</b> smallest in the <b>upper part</b> (${n - k} elements, at most n − 3⌊n/10⌋ = ${n - guar}).` }, B, i);
      const v = sel(P.slice(r), i - k, 'upper part'); stack.pop(); return v;
    }
    F.push({ kind: 'mom', phase: 'start', B: [...A0], rank: i0, stack: [], metrics: [['n', n0], ['Rank wanted', i0]], desc: `Find the ${ord(i0)} smallest of ${n0} numbers in worst-case linear time: SELECT picks its pivot as the median of the group medians, so neither side of the partition can be too big.` });
    const v = sel(A0, i0, '');
    F.push({ kind: 'mom', phase: 'done', B: [...A0], val: v, rank: i0, stack: [], metrics: [['n', n0], ['SELECT calls', calls], ['Elements handled', work], ['Answer', v]],
      desc: `SELECT returns ${v}, the ${ord(i0)} smallest. The calls handled ${work} elements in all, a constant times n = ${n0}: T(n) ≤ T(n/5) + T(3n/4) + Θ(n) = Θ(n), because 1/5 + 3/4 = 19/20 < 1.`,
      html: `SELECT returns <b>${v}</b>, the ${ord(i0)} smallest${v === answer ? '' : ' (check failed!)'}. The calls handled ${work} elements in all, a constant times n = ${n0}: <b>T(n) ≤ T(n/5) + T(3n/4) + Θ(n) = Θ(n)</b>, because 1/5 + 3/4 = 19/20 &lt; 1.` });
    return F;
  }

  /* ── drawing ── */
  const Stack = ({ s: s0 }) => { const cut = Math.max(0, s0.length - 3), s = s0.slice(cut); return s.length ? html`<div className="lx-select-stack">${cut ? html`<span className="lx-select-call">… ${cut} earlier call${cut > 1 ? 's' : ''}</span><span className="lx-select-arrow">→</span>` : null}${s.map((c, j) => html`<${React.Fragment} key=${j}>${j ? html`<span className="lx-select-arrow">→</span>` : null}<span className=${'lx-select-call' + (j === s.length - 1 ? ' on' : '')}>${c.t}${c.note ? ' · ' + c.note : ''}</span></${React.Fragment}>`)}</div>` : null; };
  function RandView({ f }) {
    const cls = x => {
      if (f.ans) return x === f.ans ? ' ans' : ' out';
      if (x < f.p || x > f.q) return ' out';
      if (f.pick) return x === f.pick ? ' pv' : '';
      if (f.r) { if (f.keep === 'lo' && x >= f.r) return ' out'; if (f.keep === 'hi' && x <= f.r) return ' out'; return x < f.r ? ' lo' : x === f.r ? ' pv' : ' hi'; }
      if (f.j) return x === f.p ? ' pv' : x <= f.ii ? ' lo' : x <= f.j ? ' hi' + (x === f.j ? ' cur' : '') : '';
      return '';
    };
    const mark = x => { const m = []; if (f.r) { if (x === f.r) m.push('r'); } else if (f.j) { if (x === f.ii) m.push('i'); if (x === f.j && f.j > f.p) m.push('j'); } if (!f.r && !f.j && !f.ans && f.p !== f.q) { if (x === f.p) m.push('p'); if (x === f.q) m.push('q'); } return m.join(' '); };
    const k = f.r ? f.r - f.p + 1 : null;
    return html`<div className="lx-select-wrap"><${Stack} s=${f.stack} />
      <div className="lx-select-arr">${f.A.map((v, j) => html`<div key=${j} className=${'lx-select-cell' + cls(j + 1)}><b>${v}</b><span>${j + 1}</span><em>${mark(j + 1)}</em></div>`)}</div>
      <div className="lx-select-info"><span>p = <b>${f.p}</b>, q = <b>${f.q}</b></span><span>rank i = <b>${f.rank}</b></span>${f.x !== undefined ? html`<span>x = <b>${f.x}</b></span>` : null}${k ? html`<span>k = r − p + 1 = <b>${k}</b></span>` : null}</div>
      <div className="lx-select-code" aria-label="Pseudocode">${RS_CODE.map((l, j) => html`<div key=${j} className=${(l[0] === 'hd' ? 'hd' : '') + (j === f.line ? ' on' : '')}>${l[1]}</div>`)}</div></div>`;
  }
  function Groups({ f }) {
    const g = f.groups.length, xcol = f.x !== undefined;
    const cell = (v, row, G) => {
      let c = 'lx-select-g';
      if (f.phase !== 'groups' && row === 2) c += ' med';
      if (xcol && v === f.x) c += ' x';
      if (f.phase === 'guar') { const m = G[2]; if (m <= f.x && row <= 2 && v !== f.x) c += ' le'; else if (m >= f.x && row >= 2 && v !== f.x) c += ' ge'; else if (v !== f.x && row !== 2) c += ' dim'; }
      return c;
    };
    return html`<div><div className="lx-select-sub">${f.phase === 'groups' ? 'groups of 5 (in input order)' : f.phase === 'sorted' ? 'each group sorted, lesser on top; yellow = group median' : 'groups in order of their medians; red = x'}</div>
      <div className="lx-select-grid" style=${{ gridTemplateColumns: `repeat(${g}, minmax(0, 46px))`, justifyContent: 'center' }}>${f.groups.map((G, j) => html`<div key=${j} className="lx-select-col">${G.map((v, r) => html`<div key=${r} className=${cell(v, r, G)}>${v}</div>`)}</div>`)}</div>
      ${f.left.length ? html`<div className="lx-select-left">left over:${f.left.map((v, j) => html`<span key=${j} className=${'lx-select-g' + (f.phase === 'guar' ? ' dim' : '')}>${v}</span>`)}</div>` : null}
      ${f.phase === 'guar' ? html`<div className="lx-select-guar">≤ x for sure: 3 · ${f.le} = <b>${3 * f.le}</b> · ≥ x for sure: 3 · ${f.ge} = <b>${3 * f.ge}</b><br/>slides' bound 3⌊n/10⌋ = 3⌊${f.B.length}/10⌋ = <b>${f.guar}</b> · actual: ${f.smaller} smaller, ${f.larger} larger</div>` : null}</div>`;
  }
  function MomView({ f }) {
    let body;
    if (f.phase === 'start' || f.phase === 'done') body = html`<div className="lx-select-arr">${f.B.map((v, j) => html`<div key=${j} className=${'lx-select-cell' + (f.phase === 'done' ? (v === f.val ? ' ans' : ' out') : '')}><b>${v}</b><span>${j + 1}</span></div>`)}</div>`;
    else if (f.phase === 'base') body = html`<div><div className="lx-select-sub">sorted by rote</div><div className="lx-select-arr">${f.S.map((v, j) => html`<div key=${j} className=${'lx-select-cell' + (j === f.pick ? ' ans' : '')}><b>${v}</b><span>${j + 1}</span></div>`)}</div></div>`;
    else if (f.phase === 'part') body = html`<div><div className="lx-select-sub">after PARTITION around x = ${f.x}: lower part | x | upper part</div><div className="lx-select-arr">${f.P.map((v, j) => { const x = j + 1; let c = x < f.r ? ' lo' : x === f.r ? ' pv' : ' hi'; if (f.ans) c = x === f.r ? ' ans' : ' out'; else if (f.keep === 'lo' && x >= f.r || f.keep === 'hi' && x <= f.r) c = ' out'; return html`<div key=${j} className=${'lx-select-cell' + c}><b>${v}</b><span>${x}</span><em>${x === f.r ? 'k' : ''}</em></div>`; })}</div></div>`;
    else body = html`<${Groups} f=${f} />`;
    return html`<div className="lx-select-wrap"><${Stack} s=${f.stack} />${body}
      <div className="lx-select-info"><span>n = <b>${f.B.length}</b></span><span>rank i = <b>${f.rank}</b></span>${f.x !== undefined ? html`<span>x = <b>${f.x}</b></span>` : null}${f.r ? html`<span>k = <b>${f.r}</b></span>` : null}</div></div>`;
  }

  const S4 = '6 10 13 5 8 3 2 11', M25 = '12 47 3 88 25 61 9 34 72 18 55 40 93 7 66 29 81 14 50 37 96 21 58 44 70';
  window.LAB = window.LAB || {};
  window.LAB['select'] = {
    meta: { title: 'Selection', group: 'Sequences', icon: '⋯', desc: 'RAND-SELECT and the median of medians.', question: 'How do we find the i-th smallest element in linear time, without sorting?',
      model: 'Partition around a pivot, read its rank k = r − p + 1, and recurse into only the side that holds rank i (rank i − k on the right). RAND-SELECT picks the pivot at random: expected Θ(n). SELECT picks the median of the group medians: worst case Θ(n).',
      watch: 'Only one side of each partition survives. On the right side the rank drops by k.' },
    defaults: { method: 'rand', values: S4, i: '7', pivot: 'first', scan: 'scan', seed: 1 },
    presets: [
      { label: 'Slide example: 7th smallest, pivot 6', src: 'L7 slides 3-4', cfg: { method: 'rand', values: S4, i: '7', pivot: 'first', scan: 'scan', seed: 1 } },
      { label: 'Same array, random pivots', src: 'L7 slide 3 (RAND-PARTITION)', cfg: { method: 'rand', values: S4, i: '7', pivot: 'random', scan: 'scan', seed: 7 } },
      { label: 'Same array, lower median i = 4', src: 'L7 slides 2-4', cfg: { method: 'rand', values: S4, i: '4', pivot: 'first', scan: 'scan', seed: 1 } },
      { label: 'Unlucky splits: sorted input', src: 'L7 slide 5', cfg: { method: 'rand', values: '1 2 3 4 5 6 7 8 9 10', i: '10', pivot: 'first', scan: 'call', seed: 1 } },
      { label: 'Median of medians, n = 25', src: 'L7 slides 19-30', cfg: { method: 'mom', values: M25, i: '13', pivot: 'first', scan: 'scan', seed: 1 } },
      { label: 'Median of medians on slide 4', src: 'L7 slides 4, 19', cfg: { method: 'mom', values: S4, i: '7', pivot: 'first', scan: 'scan', seed: 1 } },
      { label: 'Median of medians, n = 44', src: 'L7 slides 20-26 (n as drawn)', cfg: { method: 'mom', values: '50 3 77 21 64 8 92 35 16 59 41 88 27 70 5 96 33 62 14 81 47 2 73 38 55 19 84 11 66 29 99 44 7 58 25 90 13 68 36 79 1 52 23 85', i: '22', pivot: 'first', scan: 'scan', seed: 1 } }
    ],
    Controls: ({ cfg, setCfg }) => {
      const set = (k, v) => setCfg(c => ({ ...c, [k]: v }));
      return html`<label>Method<select value=${cfg.method} onChange=${e => { const m = e.target.value; setCfg(c => ({ ...c, method: m, ...(m === 'mom' && c.values.trim().split(/[\s,]+/).length < 10 ? { values: M25, i: '13' } : {}) })); }}><option value="rand">RAND-SELECT (randomized)</option><option value="mom">SELECT (median of medians)</option></select></label>
        <label className="tl-wide">Values (${cfg.method === 'rand' ? 'up to 16' : 'up to 45, distinct'})<input value=${cfg.values} onInput=${e => set('values', e.target.value)} /></label>
        <label>Rank i<input value=${cfg.i} inputMode="numeric" onInput=${e => set('i', e.target.value)} /></label>
        ${cfg.method === 'rand' ? html`<label>Pivot<select value=${cfg.pivot} onChange=${e => set('pivot', e.target.value)}><option value="first">First element (slide 4)</option><option value="random">Random</option></select></label>
        <label>PARTITION<select value=${cfg.scan} onChange=${e => set('scan', e.target.value)}><option value="scan">Step through the scan</option><option value="call">One step per call</option></select></label>
        ${cfg.pivot === 'random' ? html`<label>Random pivots<button type="button" style=${{ font: 'inherit', fontSize: '.8rem', padding: '9px 10px', minHeight: '37px', borderRadius: '7px', border: '1px solid var(--line)', background: 'var(--paper)', color: 'var(--ink)', cursor: 'pointer' }} onClick=${() => set('seed', 1 + Math.floor(Math.random() * 1e6))}>Roll again ⟳</button></label>` : null}` : null}`;
    },
    build: cfg => cfg.method === 'mom' ? momFrames(cfg) : randFrames(cfg),
    Diagram: ({ f }) => f.kind === 'mom' ? html`<${MomView} f=${f} />` : html`<${RandView} f=${f} />`,
    legend: [['color-mix(in srgb, var(--ok) 30%, var(--paper))', 'Pivot x'], ['color-mix(in srgb, var(--c) 24%, var(--paper))', '≤ x (lower part)'], ['color-mix(in srgb, #eb8452 26%, var(--paper))', '≥ x (upper part)'], ['#f2a93b', 'Current j'], ['#f2d43a', 'Group median'], ['#d23c3c', 'Median of medians x'], ['#22a06b', 'Answer']],
    cost: cfg => cfg.method === 'mom'
      ? 'SELECT: T(n) ≤ T(n/5) + T(3n/4) + Θ(n) = Θ(n) worst case (1/5 + 3/4 = 19/20 < 1). Following the slides, ⌊n/5⌋ full groups are formed and the n mod 5 leftovers only join the partition; x is the lower median ⌊(g+1)/2⌋ of the g group medians. The slides stop the recursion at n < 50 (Θ(1)); here it recurses down to 5 elements so you can see every level. Elements must be distinct, as the slides assume.'
      : 'RAND-SELECT: expected Θ(n) (lucky 9:1 split, T(n) = T(9n/10) + Θ(n), case 3); worst case Θ(n²) with 0 : n−1 splits (slide 5). PARTITION is the one from Lecture 5: x = A[p], A[j] ≤ x goes left, 1-based indices. "First element" reproduces slide 4; "Random" swaps a random element to A[p] first (RAND-PARTITION).'
  };
})();

/* ── rec ── */
/* ── lab: rec (Recurrences, Lecture 3 with the recurrences of Lectures 4, 5 and 7) ── */
// T(n) = aT(n/b) + f(n) with f(n) = c·n^k·lg^p n, solved by the four methods of L3: recursion tree (level by level),
// master method (L3 slides 24-30, extended case 2 of L4 slide 5), iteration (unrolling, slides 11-14) and substitution
// (slides 15-20). Unbalanced trees T(α₁n) + T(α₂n) + f(n) (L3 slide 22, L5 slides 27-32, L7 slides 28-29) as a second form.
(function () {
  const { useState, useMemo, useEffect } = React;
  const html = htm.bind(React.createElement);
  const CSS = `
.lx-rec-wrap{ max-width:640px; margin:0 auto; color:var(--ink); }
.lx-rec-head{ text-align:center; font-size:17px; font-weight:600; margin:0 0 12px; line-height:1.4; }
.lx-rec-head small{ display:block; font-size:12.5px; font-weight:500; color:var(--graphite); }
.lx-rec-rows{ display:grid; gap:6px; }
.lx-rec-row{ border:1px solid var(--line); border-radius:10px; padding:6px 8px; background:var(--paper); transition:opacity .3s, background .3s; }
.lx-rec-row.fut{ opacity:.18; }
.lx-rec-row.on{ border-color:var(--c); background:color-mix(in srgb, var(--c) 9%, var(--paper)); box-shadow:inset 3px 0 0 var(--c); }
.lx-rec-row.leaf{ border-color:color-mix(in srgb, var(--ok) 55%, var(--line)); }
.lx-rec-row.leaf.on{ background:color-mix(in srgb, var(--ok) 10%, var(--paper)); box-shadow:inset 3px 0 0 var(--ok); }
.lx-rec-meta{ font-size:12.5px; color:var(--graphite); margin-bottom:4px; }
.lx-rec-meta b{ color:var(--ink); }
.lx-rec-chips{ display:flex; flex-wrap:wrap; gap:4px; justify-content:center; align-items:center; }
.lx-rec-chip{ border:1.5px solid var(--c); border-radius:8px; padding:2px 7px; font-size:14px; background:var(--paper); text-align:center; line-height:1.3; }
.lx-rec-chip small{ display:block; font-size:12px; color:var(--graphite); }
.lx-rec-leaf .lx-rec-chip, .lx-rec-row.leaf .lx-rec-chip{ border-color:var(--ok); }
.lx-rec-more{ font-size:13px; color:var(--graphite); }
.lx-rec-sum{ display:flex; align-items:center; gap:8px; margin-top:5px; font-size:13.5px; }
.lx-rec-sum span{ flex:1 1 auto; min-width:0; overflow-wrap:anywhere; }
.lx-rec-bar{ flex:0 0 34%; height:10px; border-radius:5px; background:var(--paper-2); border:1px solid var(--line); overflow:hidden; }
.lx-rec-bar i{ display:block; height:100%; background:var(--c); border-radius:5px; }
.lx-rec-row.leaf .lx-rec-bar i{ background:var(--ok); }
.lx-rec-dots{ text-align:center; font-size:15px; color:var(--graphite); line-height:1; }
.lx-rec-total{ margin-top:8px; border:1.5px solid var(--ok); border-radius:10px; padding:7px 10px; font-size:14px; line-height:1.5; background:color-mix(in srgb, var(--ok) 8%, var(--paper)); }
.lx-rec-lines{ display:grid; gap:4px; }
.lx-rec-ln{ display:grid; grid-template-columns:max-content minmax(0,1fr); gap:8px; align-items:baseline; padding:4px 8px; border-radius:7px; font-size:14px; line-height:1.5; transition:opacity .3s, background .3s; }
.lx-rec-ln > i{ font-style:normal; font-size:12px; font-weight:700; color:var(--c); text-transform:uppercase; letter-spacing:.03em; }
.lx-rec-ln > span{ min-width:0; overflow-wrap:anywhere; }
.lx-rec-ln.fut{ opacity:0; }
.lx-rec-ln.on{ background:color-mix(in srgb, var(--c) 14%, var(--paper)); box-shadow:inset 3px 0 0 var(--c); }
.lx-rec-ln.lx-rec-fin{ background:color-mix(in srgb, var(--ok) 12%, var(--paper)); }
.lx-rec-cases{ display:grid; gap:6px; margin-top:10px; }
.lx-rec-case{ border:1px solid var(--line); border-radius:10px; padding:6px 10px; font-size:13.5px; line-height:1.5; background:var(--paper); transition:opacity .3s; }
.lx-rec-case b{ color:var(--c); }
.lx-rec-case.dim{ opacity:.4; }
.lx-rec-case.hit{ border:2px solid var(--ok); background:color-mix(in srgb, var(--ok) 10%, var(--paper)); }
.lx-rec-case.miss{ border:2px solid var(--pen, #d23c3c); }
.lx-rec-svg{ display:block; width:100%; max-width:420px; margin:0 auto; }
.lx-rec-svg text{ font-family:var(--body); fill:var(--ink); }
.lx-rec-ans{ text-align:center; margin-top:10px; font-size:16px; }
.lx-rec-ans b{ color:var(--ok); }
.lx-rec-wrap sup, .lx-rec-wrap sub{ font-size:12px; line-height:0; }
`;
  if (!document.getElementById('lx-rec-css')) { const s = document.createElement('style'); s.id = 'lx-rec-css'; s.textContent = CSS; document.head.appendChild(s); }

  /* ── small number helpers ── */
  const gcd = (x, y) => { x = Math.abs(x); y = Math.abs(y); while (y) [x, y] = [y, x % y]; return x || 1; };
  const red = (n, d) => { const g = gcd(n, d); return [n / g, d / g]; };
  const isInt = x => Math.abs(x - Math.round(x)) < 1e-9;
  const num = x => isInt(x) ? String(Math.round(x)) : (Math.abs(x) >= 100 ? x.toFixed(1) : String(+x.toFixed(3)));
  const fracS = ([n, d]) => d === 1 ? String(n) : `${n}/${d}`;
  const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻', '+': '⁺', '(': '⁽', ')': '⁾', 'k': 'ᵏ', 'i': 'ⁱ', 'j': 'ʲ', 'd': 'ᵈ', 'h': 'ʰ', 'n': 'ⁿ', ' ': ' ' };
  const text = h => h.replace(/<sub>(.*?)<\/sub>/g, '_$1 ').replace(/<sup>(.*?)<\/sup>/g, (_, x) => { const y = x.replace(/<[^>]+>/g, ''); return [...y].every(ch => SUP[ch]) ? [...y].map(ch => SUP[ch]).join('') : '^' + (y.length > 1 ? '(' + y + ')' : y); })
    .replace(/<sub>(.*?)<\/sub>/g, '_$1').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');
  const sup = x => `<sup>${x}</sup>`;

  /* ── f(n) = c·n^k·lg^p n ── */
  function parseF(src) {
    let s = String(src).toLowerCase().replace(/θ\(|theta\(/g, '').replace(/\)$/, '').replace(/\s+/g, '').replace(/log/g, 'lg').replace(/²/g, '^2').replace(/³/g, '^3').replace(/\*|·/g, '');
    if (!s) throw new Error('Enter f(n), for example n, n^2, 4n, √n, n lg n or 1.');
    let m = s.match(/^(\d+(?:\.\d+)?|c)?(?:(√n|sqrt\(?n\)?)|(n)(?:\^\(?(\d+(?:\.\d+)?)(?:\/(\d+))?\)?)?)?(?:(lg)(?:\^(\d))?\(?n\)?)?$/);
    if (!m || (!m[1] && !m[2] && !m[3] && !m[6])) throw new Error(`Cannot read f(n) = "${src}". Write it as c·n^k·lg^p n, for example 1, c, 4n, n^2, √n, n lg n, n^2 lg^2 n.`);
    const coef = m[1] === 'c' ? 'c' : m[1] ? +m[1] : 1;
    let k = m[2] ? 0.5 : m[3] ? (m[4] ? +m[4] / (m[5] ? +m[5] : 1) : 1) : 0;
    const p = m[6] ? (m[7] ? +m[7] : 1) : 0;
    if (coef !== 'c' && (coef <= 0 || coef > 99)) throw new Error('Keep the constant in f(n) between 1 and 99 (or write c).');
    if (!(k >= 0 && k <= 4)) throw new Error('Keep the power of n in f(n) between 0 and 4.');
    if (p > 3) throw new Error('Keep the power of lg n in f(n) at most 3.');
    return { coef, cv: coef === 'c' ? 1 : coef, k: +k.toFixed(6), p };
  }
  // f applied to an argument: arg is HTML like 'n' or 'n/4'; simple = no parentheses needed
  function fH(F, arg = 'n', simple = arg === 'n') {
    const A = simple ? arg : `(${arg})`, co = F.coef === 1 ? '' : F.coef === 'c' ? 'c' : num(F.coef);
    let np = F.k === 0 ? '' : F.k === 1 ? A : F.k === 0.5 ? `√${simple ? arg : '(' + arg + ')'}` : `${A}${sup(num(F.k))}`;
    let lg = F.p === 0 ? '' : `lg${F.p > 1 ? sup(F.p) : ''}${simple ? ' ' + arg : '(' + arg + ')'}`;
    if (F.k === 1 && !simple) np = arg;
    const body = [np, lg].filter(Boolean).join(' ');
    return (co + body) || '1';
  }
  const fVal = (F, s) => F.cv * Math.pow(s, F.k) * Math.pow(s > 1 ? Math.log2(s) : 0, F.p);
  const nPowH = E => isInt(E) ? (Math.round(E) === 0 ? '1' : Math.round(E) === 1 ? 'n' : 'n' + sup(Math.round(E))) : Math.abs(E - .5) < 1e-9 ? '√n' : 'n' + sup(num(E));
  const lgH = (q) => q === 0 ? '' : q === 1 ? 'lg n' : `lg${sup(q)} n`;
  const theta = (E, q) => { const a = nPowH(E), b = lgH(q); return `Θ(${a === '1' && b ? b : [a, b].filter(Boolean).join(' ')})`; };

  /* ── validation ── */
  function readDiv(cfg) {
    const a = +cfg.a, b = +cfg.b;
    if (!/^\d+$/.test(String(cfg.a).trim()) || a < 1 || a > 16) throw new Error('a (the number of subproblems) must be a whole number from 1 to 16.');
    if (!/^\d+$/.test(String(cfg.b).trim()) || b < 2 || b > 16) throw new Error('b (the size divisor) must be a whole number from 2 to 16.');
    const F = parseF(cfg.f), t1 = +cfg.t1;
    if (!(t1 >= 0 && t1 <= 99) || String(cfg.t1).trim() === '') throw new Error('T(1) must be a number from 0 to 99.');
    const n = +cfg.n; let h = 0, x = n;
    if (!/^\d+$/.test(String(cfg.n).trim()) || n < b) throw new Error(`n must be a power of b = ${b}, at least ${b}.`);
    while (x > 1 && x % b === 0) { x /= b; h++; }
    if (x !== 1) throw new Error(`n must be a power of b = ${b} so the tree has whole levels (try ${b ** 2} or ${b ** 3}).`);
    if (h > 10 || a ** h > 1e7) throw new Error(`n is too big for the drawing: keep log_b n ≤ 10 and aʰ ≤ 10,000,000 (try n = ${b ** Math.min(4, h)}).`);
    return { a, b, F, t1, n, h, E: Math.log(a) / Math.log(b), v: cfg.v || 'T' };
  }
  function readSplit(cfg) {
    const parts = String(cfg.fr).split(/[,;\s]+/).filter(Boolean);
    if (!parts.length || parts.length > 3) throw new Error('Enter 1 to 3 fractions for the subproblem sizes, for example 1/4, 1/2.');
    const fr = parts.map(t => { const m = t.match(/^(\d+)\/(\d+)$/); if (!m) throw new Error(`"${t}" is not a fraction like 1/4 or 9/10.`); const [x, y] = red(+m[1], +m[2]); if (!(x > 0 && x < y) || y > 100) throw new Error(`Each fraction must be between 0 and 1 with a denominator up to 100 ("${t}").`); return [x, y]; });
    const F = parseF(cfg.f);
    if (F.p) throw new Error('For unequal splits keep f(n) = c·n^k without a lg factor, as in the slides.');
    const s = fr.reduce((t, [x, y]) => t + Math.pow(x / y, F.k), 0);
    if (s > 1 + 1e-9) throw new Error(`Here Σ αᵏ = ${num(s)} > 1: the level sums grow. The course's unbalanced trees all have Σ αᵏ ≤ 1; pick smaller fractions or a bigger power of n.`);
    return { fr, F, s, v: cfg.v || 'T' };
  }
  const recH = (D) => D.fr ? `${D.v}(n) = ${D.fr.map(([x, y]) => `${D.v}(${x === 1 ? '' : x}n/${y})`).join(' + ')} + ${fH(D.F)}` : `${D.v}(n) = ${D.a === 1 ? '' : D.a}${D.v}(n/${D.b}) + ${fH(D.F)}`;
  const ratioF = (a, b, k) => isInt(k) ? red(a, b ** Math.round(k)) : null; // a / b^k as a fraction when possible
  const frPow = ([x, y], d) => [x ** d, y ** d];
  const sizeH = ([x, y]) => y === 1 ? (x === 1 ? 'n' : x + 'n') : `${x === 1 ? '' : x}n/${y}`;

  /* ── master method decision (shared by several methods) ── */
  function master(D) {
    const { a, b, F, E } = D, k = F.k, p = F.p, Es = isInt(E) ? num(E) : E.toFixed(3);
    const bS = D.bS || String(b), out = { E, Es, bS };
    if (Math.abs(k - E) < 1e-9) {
      if (p === 0) Object.assign(out, { cs: 2, basic: true, why: `f(n) = ${fH(F)} = Θ(${nPowH(E)}): f has the same size as n${sup('log<sub>' + bS + '</sub>' + a)}`, T: theta(E, 1) });
      else Object.assign(out, { cs: 2, basic: false, why: `f(n) = ${fH(F)} is larger than ${nPowH(E)} only by lg${p > 1 ? sup(p) : ''} n, not by a polynomial factor n${sup('ε')}`, T: theta(E, p + 1) });
    } else if (k < E) Object.assign(out, { cs: 1, basic: true, eps: E - k, why: `f(n) = ${fH(F)} = O(n${sup(Es + ' − ε')}) with ε = ${num(E - k)}${p ? ' (any smaller ε also absorbs the lg factor)' : ''}: f is polynomially smaller`, T: isInt(E) || Math.abs(E - .5) < 1e-9 ? theta(E, 0) : `Θ(n${sup((bS === '2' ? 'lg ' : 'log<sub>' + bS + '</sub>') + a)}) ≈ Θ(n${sup(Es)})` });
    else {
      const rf = D.alpha ? (isInt(k) ? red(...frPow(D.alpha, Math.round(k))) : null) : ratioF(a, b, k), rv = a / b ** k;
      Object.assign(out, { cs: 3, basic: true, eps: k - E, why: `f(n) = ${fH(F)} = Ω(n${sup(Es + ' + ε')}) with ε = ${num(k - E)}: f is polynomially larger`, T: theta(k, p),
        reg: `a·f(n/b) = ${a === 1 ? '' : a + '·'}${fH(F, D.alpha ? sizeH(D.alpha) : 'n/' + bS)} ≤ ${rf ? fracS(rf) : num(rv)}·${fH(F)} = c·f(n) with c = ${rf ? fracS(rf) : num(rv)} &lt; 1 ✓${p ? ' (lg(n/b) ≤ lg n)' : ''}` });
    }
    return out;
  }

  /* ── method 1: recursion tree ── */
  function treeDiv(D) {
    const { a, b, F, t1, n, h, E } = D, frames = [], rf = ratioF(a, b, F.k), rv = a / b ** F.k;
    const rows = [];
    for (let d = 0; d < h; d++) {
      const nodes = a ** d, size = n / b ** d, each = fVal(F, size), sum = nodes * each;
      const argH = d === 0 ? 'n' : `n/${b}${d > 1 ? sup(d) : ''}`, argN = d === 0 ? 'n' : `n/${b ** d}`;
      let symSum;
      if (d === 0) symSum = fH(F);
      else if (F.p === 0 && rf) { const [x, y] = frPow(rf, d); const co = F.coef === 'c' ? 'c' : F.coef; const cx = F.coef === 'c' ? 1 : co; const [X, Y] = red(x * cx, y); symSum = y > 99999 ? `(${fracS(rf)})${sup(d)}·${fH(F)}` : `${Y === 1 ? (X === 1 ? '' : X) : X + '/' + Y + ' '}${F.coef === 'c' ? 'c' : ''}${nPowH(F.k) === '1' && (X !== 1 || Y !== 1 || F.coef === 'c') ? '' : nPowH(F.k)}`; if (symSum === '') symSum = '1'; }
      else symSum = `${a}${sup(d)}·${fH(F, argH)}`;
      rows.push({ d, nodes, size, each, sum, chip: fH(F, argH, d === 0), meta: `d = ${d} · ${nodes} node${nodes > 1 ? 's' : ''} · size ${d === 0 ? 'n' : argH} = ${num(size)}`, symSum, symFull: d === 0 ? `${fH(F)}` : `${a === 1 ? '' : a + sup(d) + '·'}${fH(F, argH)}` + (symSum !== fH(F, argH) ? ` = ${symSum}` : '') });
    }
    const leaves = a ** h, leafSum = leaves * t1, total = rows.reduce((t, r) => t + r.sum, 0) + leafSum;
    const maxS = Math.max(leafSum, ...rows.map(r => r.sum)) || 1;
    rows.forEach(r => r.w = r.sum / maxS);
    const shown = h <= 6 ? rows.map(r => r.d) : [0, 1, 2, -1, h - 1];
    const m = master(D);
    const base = { form: 'div', rows, shown, leaf: { nodes: leaves, t1, sum: leafSum, w: leafSum / maxS, h }, total, rf, rv };
    const met = (cur, acc) => [['Height log_b n', h], ['Levels drawn', `${Math.min(cur + 1, h + 1)} / ${h + 1}`], ['Work so far', num(acc)], ['Leaves aʰ', leaves], ['T(' + n + ')', num(total)]];
    frames.push({ ...base, cur: -1, desc: '', html: `Draw ${D.v}(n) as a tree: each node is one call and holds its own non-recursive cost; a node of size s has ${a} child${a > 1 ? 'ren' : ''} of size s/${b}. We add the costs <b>level by level</b>, here for n = ${n} and ${D.v}(1) = ${t1}.`, metrics: met(-1, 0) });
    let acc = 0;
    for (const d of shown) {
      if (d === -1) { frames.push({ ...base, cur: -2, html: `Levels ${3} to ${h - 2} follow the same pattern: level d has ${a}${sup('d')} nodes of size n/${b}${sup('d')}, so its sum is ${a}${sup('d')}·${fH(F, 'n/' + b + sup('d'))}${rf && F.p === 0 ? ` = (${fracS(rf)})${sup('d')}·${fH(F)}` : ''}.`, metrics: met(2, acc) }); for (let j = 3; j < h - 1; j++) acc += rows[j].sum; continue; }
      const r = rows[d]; acc += r.sum;
      const trend = d === 0 ? '' : (F.p === 0 ? (Math.abs(rv - 1) < 1e-9 ? ' Every level costs the same.' : rv < 1 ? ` Each level is ${rf ? fracS(rf) : num(rv)} of the level above: the sums shrink.` : ` Each level is ${rf ? fracS(rf) : num(rv)} times the level above: the sums grow.`) : '');
      frames.push({ ...base, cur: d, html: d === 0 ? `Level 0: the root alone, cost f(n) = ${fH(F)} = <b>${num(r.sum)}</b> for n = ${n}.` : `Level ${d}: ${a}${sup(d)} = ${r.nodes} node${r.nodes > 1 ? 's' : ''}, each of size n/${b}${d > 1 ? sup(d) : ''} = ${num(r.size)} and cost ${fH(F, 'n/' + b + (d > 1 ? sup(d) : ''))} = ${num(r.each)}. Level sum ${r.symFull} = <b>${num(r.sum)}</b>.${trend}`, metrics: met(d, acc) });
    }
    acc += leafSum;
    frames.push({ ...base, cur: h, html: `The leaves: n/${b}${sup('h')} = 1 when h = log<sub>${b}</sub> n = ${h}. There are ${a}${sup('h')} = ${a}${sup('log<sub>' + b + '</sub> n')} = n${sup('log<sub>' + b + '</sub>' + a)} = <b>${leaves}</b> leaves, each ${D.v}(1) = ${t1}: leaf level ${leaves} × ${t1} = <b>${leafSum}</b>.`, metrics: met(h, acc) });
    let concl;
    if (F.p === 0 && Math.abs(rv - 1) < 1e-9) concl = `Every one of the ${h} levels costs ${fH(F)}, so the total is ${fH(F)}·log<sub>${b}</sub> n + n${sup('log<sub>' + b + '</sub>' + a)}·${D.v}(1) = ${num(rows[0].sum)}·${h} + ${leafSum} = <b>${num(total)}</b>. In general <b>${m.T}</b>.`;
    else if (F.p === 0 && rv < 1) concl = `Decreasing geometric series: total = ${fH(F)}·(1 + ${rf ? fracS(rf) : num(rv)} + …) + leaves ≤ ${fH(F)}/(1 − ${rf ? fracS(rf) : num(rv)}) + leaves. The root dominates: ${D.v}(${n}) = <b>${num(total)}</b>, in general <b>${m.T}</b>.`;
    else if (F.p === 0) concl = `Increasing geometric series: the deepest levels dominate, so the total is a constant times the leaf level n${sup('log<sub>' + b + '</sub>' + a)} = ${leaves}. ${D.v}(${n}) = <b>${num(total)}</b>, in general <b>${m.T}</b>.`;
    else concl = `Add all levels: ${D.v}(${n}) = <b>${num(total)}</b>. Here f has a lg factor, so the level sums ${m.cs === 2 ? 'are about equal near the top and shrink slowly; summing lg(n/b' + sup('d') + ') over the levels gives an extra lg n' : m.cs === 1 ? 'grow toward the leaves, which dominate' : 'shrink geometrically, so the root dominates'}: <b>${m.T}</b>.`;
    frames.push({ ...base, cur: h + 1, html: concl + ` (Master method: ${m.basic ? 'case ' + m.cs : 'extended case 2'}.)`, metrics: met(h + 1, total) });
    frames.forEach(f => f.desc = text(f.html));
    return frames;
  }
  function treeSplit(D) {
    const { fr, F, s } = D, frames = [], m = fr.length, depth = 3;
    const sF = isInt(F.k) ? fr.reduce((t, [x, y]) => { const [X, Y] = [x ** F.k, y ** F.k]; return red(t[0] * Y + X * t[1], t[1] * Y); }, [0, 1]) : null;
    const sS = sF ? fracS(sF) : num(s);
    const rows = [];
    for (let d = 0; d <= depth; d++) {
      const combos = []; const walk = (acc, left) => { if (combos.length >= 4) return; if (!left) { combos.push(acc); return; } for (const f of fr) walk([acc[0] * f[0], acc[1] * f[1]], left - 1); };
      walk([1, 1], d);
      const nodes = m ** d, chips = combos.map(c => { const r = red(c[0], c[1]); return d === 0 ? fH(F) : F.k === 1 ? (F.coef === 1 ? sizeH(r) : `${fracS(r)} ${fH(F)}`) : fH(F, sizeH(r)); });
      let sum; if (d === 0) sum = fH(F); else if (sF) { const [x, y] = frPow(sF, d); sum = (x === y ? '' : fracS(red(x, y)) + ' ') + fH(F); } else sum = `${num(s ** d)}·${fH(F)}`;
      rows.push({ d, nodes, chips, sum, w: Math.pow(s, d) });
    }
    const aMin = Math.min(...fr.map(([x, y]) => x / y)), aMax = Math.max(...fr.map(([x, y]) => x / y));
    const fMin = fr.find(([x, y]) => x / y === aMin), fMax = fr.find(([x, y]) => x / y === aMax);
    const inv = ([x, y]) => (x === 1 ? String(y) : `${y}/${x}`);
    const base = { form: 'split', rows, sS, short: inv(fMin), long: inv(fMax) };
    const met = (d) => [['Terms per node', m], ['Σ αᵏ (level ratio)', sS], ['Levels drawn', Math.min(d + 1, depth + 1)]];
    frames.push({ ...base, cur: -1, html: `Unequal split: a node of size s has ${m} child${m > 1 ? 'ren' : ''} of sizes ${fr.map(f => sizeH(f).replace('n', 's')).join(' and ')}. The tree is lopsided, so we add level by level and watch how each level compares with the one above.`, metrics: met(-1) });
    for (let d = 0; d <= depth; d++) {
      const r = rows[d];
      frames.push({ ...base, cur: d, html: d === 0 ? `Level 0: the root costs ${fH(F)}.` : `Level ${d}: ${r.nodes} nodes${r.nodes > 4 ? ' (4 drawn)' : ''}, costs ${r.chips.join(', ')}${r.nodes > 4 ? ', …' : ''}. Level sum = (${fr.map(f => fracS(f) + (F.k === 1 ? '' : sup(num(F.k)))).join(' + ')})${d > 1 ? sup(d) : ''}·${fH(F)} = <b>${r.sum}</b>.`, metrics: met(d) });
    }
    const lg = x => `log<sub>${x}</sub> n`;
    frames.push({ ...base, cur: depth + 1, html: m === 1 ? `A single chain: depth ${lg(base.short)}. Each level is ${sS} of the one above.` : `The shortest root-to-leaf path keeps taking ${sizeH(fMin)}: it reaches size 1 at depth <b>${lg(base.short)}</b>. The longest keeps taking ${sizeH(fMax)}: depth <b>${lg(base.long)}</b>. All levels down to ${lg(base.short)} are complete; below it, levels lose nodes and cost less.`, metrics: met(depth + 1) });
    let concl;
    if (Math.abs(s - 1) < 1e-9) concl = `Every complete level costs exactly ${fH(F)}. So ${fH(F)}·${lg(base.short)} ≤ ${D.v}(n) ≤ ${fH(F)}·${lg(base.long)} + O(n) leaves, and both bounds are Θ(${[nPowH(F.k), 'lg n'].filter(x => x !== '1').join(' ')}): <b>${D.v}(n) = ${theta(F.k, 1)}</b>.`;
    else concl = `The level sums form a decreasing geometric series: ${D.v}(n) ≤ ${fH(F)}(1 + ${sS} + (${sS})${sup(2)} + (${sS})${sup(3)} + …) = ${fH(F)}/(1 − ${sS}) + leaves. The root dominates: <b>${D.v}(n) = ${theta(F.k, 0)}</b>${fr.length === 2 && s < 1 ? ` (${sS} &lt; 1)` : ''}.`;
    frames.push({ ...base, cur: depth + 2, html: concl, metrics: met(depth + 2) });
    frames.forEach(f => f.desc = text(f.html));
    return frames;
  }

  /* ── method 2: master ── */
  function masterFrames(D) {
    const frames = [];
    if (D.fr && D.fr.length > 1) {
      const L = [['Form', `${recH(D)}`], ['Needs', 'T(n) = aT(n/b) + f(n): a subproblems of the <b>same</b> size n/b'], ['Here', `sizes ${D.fr.map(sizeH).join(' and ')} differ`], ['Result', 'The master method does not apply. Use the recursion tree (or guess and prove by substitution).']];
      L.forEach((_, j) => frames.push({ kind: 'lines', lines: L, cur: j, res: j === 3 ? 3 : -1, html: ['The master method only solves recurrences of the form aT(n/b) + f(n).', 'All a subproblems must have the same size n/b.', `Here the subproblem sizes ${D.fr.map(sizeH).join(' and ')} differ, so there is no single b.`, '<b>The master method does not apply.</b> Switch the method to Recursion tree to solve it level by level.'][j], metrics: [['Subproblem sizes', D.fr.map(f => fracS(f)).join(', ')]] }));
      frames.forEach(f => f.desc = text(f.html)); return frames;
    }
    const m = master(D), { a, F, E } = D, bS = m.bS, k = F.k;
    const mk = (step, html) => frames.push({ kind: 'master', step, m, k, p: F.p, E, html, metrics: [['a', a], ['b', bS], ['log_b a', m.Es], ['k (power of n in f)', num(k)], ['p (power of lg n)', F.p], ['Case', step >= 3 ? (m.basic ? m.cs : '2 (ext.)') : '?']] });
    mk(0, `${recH(D)}: a = ${a} ≥ 1, b = ${bS} &gt; 1, f(n) = ${fH(F)} &gt; 0. The master method applies to this form.`);
    mk(1, `Compute the watershed n${sup('log<sub>b</sub>a')} = n${sup('log<sub>' + bS + '</sub>' + a)} = ${nPowH(E)}${isInt(E) ? '' : ` (log<sub>${bS}</sub>${a} ≈ ${m.Es}${a === 3 && bS === '4' ? '; slide 29 rounds it to 0.793' : ''})`}.`);
    mk(2, `Compare f(n) = ${fH(F)} with ${nPowH(E)}: the power of n in f is ${num(k)}, the watershed power is ${m.Es}${F.p ? `, and f has an extra lg${F.p > 1 ? sup(F.p) : ''} n` : ''}.`);
    if (m.cs === 2 && !m.basic) {
      mk(3, `${m.why}. It looks like case 3, but <b>the basic master method does not apply</b> (L3 slide 30): none of the three cases fits.`);
      mk(4, `The extended case 2 (L4 slide 5): f(n) = Θ(n${sup('log<sub>b</sub>a')} lg${sup('k')} n) with k = ${F.p} ≥ 0 gives T(n) = Θ(n${sup('log<sub>b</sub>a')} lg${sup('k+1')} n) = <b>${m.T}</b>.`);
    } else {
      mk(3, `${m.why} ⇒ <b>Case ${m.cs}</b>${m.cs === 2 && F.p === 0 ? ' (k = 0 in the extended form)' : ''}.`);
      if (m.cs === 3) mk(4, `Case 3 also needs the regularity condition: ${m.reg}.`);
      mk(5, `So <b>T(n) = ${m.T}</b>.`);
    }
    frames.forEach(f => f.desc = text(f.html));
    return frames;
  }

  /* ── method 3: iteration (unrolling) ── */
  function iterFrames(D) {
    if (D.fr && D.fr.length > 1) throw new Error('Unrolling one call at a time works when each call makes the same kind of subproblem. With two different sizes the expansion branches: use the recursion tree (or substitution).');
    const { a, F, v } = D, b = D.bS || String(D.b), A = a === 1 ? '' : String(a), Ah = d => a === 1 ? '' : d === 1 ? A : a + sup(d), arg = d => d === 0 ? 'n' : `n/${b}${d > 1 ? sup(d) : ''}`;
    const T = d => `${Ah(d)}${v}(${arg(d)})`;
    const wrap = x => a === 1 || /^[(√]|^\d*$|^c$/.test(x) ? x : `(${x})`;
    const fd = d => d === 0 ? fH(F) : `${Ah(d)}${a === 1 ? '' : '·'}${wrap(fH(F, arg(d)))}`;
    const L = [];
    L.push(['Start', `${v}(n) = ${fd(0)} + ${T(1)}`, `Write the recurrence with f first, as on slides 12-13.`]);
    L.push(['Aside', `${v}(${arg(1)}) = ${fH(F, arg(1))} + ${A}${v}(${arg(2)})`, `Write the next level aside: the same recurrence for size ${arg(1)}.`]);
    L.push(['Expand', `= ${fd(0)} + ${fd(1)} + ${T(2)}`, `Substitute it: ${a === 1 ? 'one' : a} more cost term${a === 1 ? '' : 's'} and ${a === 1 ? 'a' : a + sup(2)} smaller call${a === 1 ? '' : 's'}.`]);
    L.push(['Expand', `= ${fd(0)} + ${fd(1)} + ${fd(2)} + ${T(3)}`, `Once more: the pattern is clear.`]);
    L.push(['After i', a === 1 && F.k === 0 && F.p === 0 ? `= ${fH(F) === '1' ? 'i' : 'i·' + fH(F)} + ${v}(n/${b}${sup('i')})` : `= Σ<sub>j=0..i−1</sub> ${a === 1 ? '' : a + sup('j') + '·'}${fH(F, 'n/' + b + sup('j'))} + ${a === 1 ? '' : a + sup('i')}${v}(n/${b}${sup('i')})`, 'After i expansions there are i cost terms and the leftover calls.']);
    const bInt = D.b && isInt(D.b);
    L.push(['Stop', `n/${b}${sup('i')} = 1 ⇔ i = log<sub>${b}</sub> n${a === 1 ? '' : `, and ${a}${sup('log<sub>' + b + '</sub> n')} = n${sup('log<sub>' + b + '</sub>' + a)}`}`, `Stop at the boundary condition: ${bInt ? `assume n = ${b}${sup('k')}, so ` : ''}i = log<sub>${b}</sub> n.`]);
    const rv = a / Math.pow(D.b, F.k), rf = isInt(D.b) ? ratioF(a, D.b, F.k) : null, m = master(D);
    const term = F.p === 0 ? (Math.abs(rv - 1) < 1e-9 ? `each term = ${fH(F)}` : `term j = (${rf ? fracS(rf) : num(rv)})${sup('j')}·${fH(F)}`) : `term j = ${a === 1 ? '' : a + sup('j') + '·'}${fH(F, 'n/' + b + sup('j'))}`;
    L.push(['Sum', `= Σ<sub>j=0..log<sub>${b}</sub>n−1</sub> (${term}) + ${a === 1 ? '' : 'n' + sup('log<sub>' + b + '</sub>' + a) + '·'}${v}(1)`, `Substitute i = log<sub>${b}</sub> n. ${F.p === 0 ? (Math.abs(rv - 1) < 1e-9 ? `a/b${sup('k')} = 1, so all log<sub>${b}</sub> n terms are equal.` : `The terms form a geometric series with ratio a/b${sup('k')} = ${rf ? fracS(rf) : num(rv)}.`) : 'The terms carry a shrinking lg factor.'}`]);
    let res;
    if (F.p === 0 && Math.abs(rv - 1) < 1e-9) res = `= ${fH(F) === '1' ? '' : fH(F) + '·'}log<sub>${b}</sub> n + ${a === 1 ? '' : 'n' + sup('log<sub>' + b + '</sub>' + a) + '·'}${v}(1) = ${m.T}`;
    else if (F.p === 0 && rv < 1) res = `≤ ${fH(F)}/(1 − ${rf ? fracS(rf) : num(rv)}) + ${nPowH(m.E) === '1' ? '' : nPowH(m.E) + '·'}${v}(1) = ${m.T}`;
    else if (F.p === 0) res = `= Θ(last term) = Θ(n${sup('log<sub>' + b + '</sub>' + a)}) = ${m.T}`;
    else res = `= ${m.T}`;
    L.push(['Result', res, F.p === 0 ? (Math.abs(rv - 1) < 1e-9 ? 'Equal terms: the cost per level times the number of levels.' : rv < 1 ? 'A decreasing geometric series is bounded by a constant times its first term: the top level dominates.' : 'An increasing geometric series is dominated by its last term: the leaves dominate.') : 'Summing the lg factors over the levels gives the result the master method predicts.']);
    let check = null;
    if (D.n && isInt(D.b)) { const Tn = x => x <= 1 ? D.t1 : a * Tn(x / D.b) + fVal(F, x); check = `Check with n = ${D.n}, ${v}(1) = ${D.t1}: the recursion gives ${v}(${D.n}) = ${num(Tn(D.n))}.`; }
    return L.map((l, j) => ({ kind: 'lines', lines: L.map(x => [x[0], x[1]]), cur: j, res: j === L.length - 1 ? j : -1, check: j === L.length - 1 ? check : null, html: l[2] + (j === L.length - 1 ? ` <b>${v}(n) = ${m.T}</b>.` : ''), desc: text(l[2] + (j === L.length - 1 ? ` ${v}(n) = ${m.T}.` : '')), metrics: [['Expansions shown', Math.min(j, 3)], ['a', a], ['b', b], ['f(n)', text(fH(F))]] }));
  }

  /* ── method 4: substitution (guess, then strong induction; slides 15-20) ── */
  function substFrames(D) {
    const F = D.F, v = D.v;
    if (F.p) throw new Error('Substitution is shown for f(n) = c·n^k without a lg factor, like slides 17-20. Pick the recursion tree or the master method for this f.');
    const c0 = F.coef === 'c' ? 'c' : num(F.cv), cv = F.cv, nk = nPowH(F.k), k = F.k;
    let L;
    if (D.fr) { // unequal split
      const s = D.s, sF = isInt(k) ? D.fr.reduce((t, [x, y]) => { const [X, Y] = [x ** k, y ** k]; return red(t[0] * Y + X * t[1], t[1] * Y); }, [0, 1]) : null, sS = sF ? fracS(sF) : num(s);
      const terms = D.fr.map(f => `${v}(${sizeH(f)})`).join(' + ');
      if (Math.abs(s - 1) > 1e-9) {
        const need = sF ? fracS(red(sF[1] * cv, sF[1] - sF[0])) : num(cv / (1 - s));
        L = [['Recurrence', `${recH(D)}`], ['Guess', `${v}(n) = O(${nk})`], ['Goal', `${v}(n) ≤ d${nk === '1' ? '' : nk}, for some d and n ≥ n<sub>0</sub>`], ['Hypothesis', `${v}(m) ≤ d${nk === '1' ? '' : '·m' + (k === 1 ? '' : sup(num(k)))} for all m &lt; n`],
          ['Proof', `${v}(n) ≤ ${D.fr.map(f => `d(${sizeH(f)})${k === 1 ? '' : sup(num(k))}`).join(' + ')} + ${fH(F)}`], ['', `= ${sS}·d${nk} + ${fH(F)} = d${nk} − (${sF ? fracS(red(sF[1] - sF[0], sF[1])) : num(1 - s)}·d − ${c0})${nk}`], ['Condition', `≤ d${nk} if d ≥ ${F.coef === 'c' ? sF ? fracS(red(sF[1], sF[1] - sF[0])) + 'c' : num(1 / (1 - s)) + 'c' : need}`]];
      } else {
        const H = -D.fr.reduce((t, [x, y]) => t + Math.pow(x / y, k) * Math.log2(x / y), 0);
        L = [['Recurrence', `${recH(D)}`], ['Guess', `${v}(n) = O(${nk === '1' ? '' : nk + ' '}lg n)`], ['Goal', `${v}(n) ≤ d${nk === '1' ? '' : nk} lg n`], ['Hypothesis', `${v}(m) ≤ d·m${k === 1 ? '' : sup(num(k))} lg m for all m &lt; n`],
          ['Proof', `${v}(n) ≤ ${D.fr.map(f => `d(${sizeH(f)})${k === 1 ? '' : sup(num(k))} lg(${sizeH(f)})`).join(' + ')} + ${fH(F)}`], ['', `= d${nk} lg n − d${nk}·(${D.fr.map(([x, y]) => `${fracS([x, y])}${k === 1 ? '' : sup(num(k))} lg ${fracS([y, x])}`).join(' + ')}) + ${fH(F)}`], ['', `= d${nk} lg n − (${num(H)}·d − ${c0})${nk}`], ['Condition', `≤ d${nk} lg n if d ≥ ${F.coef === 'c' ? num(1 / H) + 'c' : num(cv / H)}`]];
      }
    } else {
      const { a, b } = D, m = master(D), rf = ratioF(a, b, k), rv = a / b ** k, rS = rf ? fracS(rf) : num(rv), A = a === 1 ? '' : a;
      const pw = (arg) => k === 0 ? '' : k === 1 ? `(${arg})` : k === 0.5 ? `√(${arg})` : `(${arg})${sup(num(k))}`;
      if (m.cs === 2) {
        const E = m.E, nE = nPowH(E), pE = (arg) => E === 0 ? '' : E === 1 ? `(${arg})` : `(${arg})${sup(num(E))}`;
        const cond = b === 2 ? (F.coef === 'c' ? 'c' : cv) : `${F.coef === 'c' ? 'c' : cv}/lg ${b}`;
        L = [['Recurrence', `${recH(D)}`], ['Guess', `${v}(n) = O(${nE === '1' ? '' : nE + ' '}lg n)`], ['Goal', `${v}(n) ≤ c${nE === '1' ? '' : nE} lg n, for some c and n ≥ n<sub>0</sub>`], ['Hypothesis', `${v}(n/${b}) ≤ c${pE('n/' + b)} lg(n/${b})`],
          ['Proof', `${v}(n) ≤ ${A}c${pE('n/' + b)} lg(n/${b}) + ${fH(F)}`], ['', `= c${nE === '1' ? '' : nE} lg n − c${nE === '1' ? '' : nE}${b === 2 ? '' : ' lg ' + b} + ${fH(F)}`], ['Condition', `≤ c${nE === '1' ? '' : nE} lg n if −c${nE === '1' ? '' : nE}${b === 2 ? '' : ' lg ' + b} + ${fH(F)} ≤ 0, i.e. c ≥ ${b === 2 ? (F.coef === 'c' ? 'c₀' : cv) : (F.coef === 'c' ? 'c₀/lg ' + b : num(cv / Math.log2(b)))}`]];
      } else if (m.cs === 3) {
        const need = rf ? fracS(red(rf[1] * cv, rf[1] - rf[0])) : num(cv / (1 - rv));
        L = [['Recurrence', `${recH(D)}`], ['Guess', `${v}(n) = O(${nk})`], ['Goal', `${v}(n) ≤ d${nk}, for some d and n ≥ n<sub>0</sub>`], ['Hypothesis', `${v}(n/${b}) ≤ d${pw('n/' + b)}`],
          ['Proof', `${v}(n) ≤ ${A}d${pw('n/' + b)} + ${fH(F)}`], ['', `= (${rS})d${nk} + ${fH(F)}`], ['Condition', `≤ d${nk} if (${rS})d + ${c0} ≤ d, i.e. d ≥ ${F.coef === 'c' ? (rf ? fracS(red(rf[1], rf[1] - rf[0])) : num(1 / (1 - rv))) + 'c' : need}`]];
      } else {
        const E = m.E, nE = nPowH(E), pE = (arg) => E === 1 ? `(${arg})` : E === 0.5 ? `√(${arg})` : `(${arg})${sup(num(E))}`;
        const need = rf ? fracS(red(rf[1] * cv, rf[0] - rf[1])) : num(cv / (rv - 1));
        L = [['Recurrence', `${recH(D)}`], ['Guess', `${v}(n) = O(${nE})`], ['Try', `${v}(n) ≤ ${A}c${pE('n/' + b)} + ${fH(F)} = c${nE} + ${fH(F)}: not ≤ c${nE}, the induction fails by a lower-order term`], ['Stronger goal', `${v}(n) ≤ c${nE} − d${nk === '1' ? '' : nk}`], ['Hypothesis', `${v}(n/${b}) ≤ c${pE('n/' + b)} − d${pw('n/' + b)}`],
          ['Proof', `${v}(n) ≤ ${A}[c${pE('n/' + b)} − d${pw('n/' + b)}] + ${fH(F)}`], ['', `= c${nE} − ${rS}·d${nk === '1' ? '' : nk} + ${fH(F)}`], ['Condition', `≤ c${nE} − d${nk === '1' ? '' : nk} if (${rS} − 1)d ≥ ${c0}, i.e. d ≥ ${F.coef === 'c' ? 'c₀/' + num(rv - 1) : need}`]];
      }
    }
    const caps = { Recurrence: 'The recurrence to solve.', Guess: 'Step 1: guess the answer (from a recursion tree or the master method).', Goal: 'Induction goal: the definition of O with an explicit constant.', Hypothesis: 'Strong induction hypothesis: assume the bound for every smaller input.', Proof: 'Prove the goal: replace each recursive call by its hypothesis bound.', '': 'Simplify.', Condition: 'The goal holds whenever this condition on the constant holds, so the guess is right.', Try: 'First try the plain guess: the leftover term cannot be absorbed.', 'Stronger goal': 'Subtract a lower-order term from the guess (CLRS trick, beyond the slides): a stronger hypothesis is easier to use.' };
    return L.map((l, j) => ({ kind: 'lines', lines: L, cur: j, res: j === L.length - 1 ? j : -1, html: caps[l[0]] + (j === L.length - 1 ? ` <b>${L[1][1].replace('Guess', '')}</b> is proved.` : ''), desc: text(caps[l[0]] + (j === L.length - 1 ? ` ${L[1][1]} is proved.` : '')), metrics: [['Line', `${j + 1} / ${L.length}`]] }));
  }

  /* ── drawing ── */
  const H = s => ({ __html: s });
  function TreeView({ f }) {
    if (f.form === 'split') return html`<div className="lx-rec-rows">${f.rows.map(r => html`<div key=${r.d} className=${'lx-rec-row' + (r.d === f.cur ? ' on' : r.d > f.cur ? ' fut' : '')}>
        <div className="lx-rec-meta">d = <b>${r.d}</b> · ${r.nodes} node${r.nodes > 1 ? 's' : ''}</div>
        <div className="lx-rec-chips">${r.chips.map((c, j) => html`<span key=${j} className="lx-rec-chip" dangerouslySetInnerHTML=${H(c)}></span>`)}${r.nodes > 4 ? html`<span className="lx-rec-more">… ${r.nodes} nodes</span>` : null}</div>
        <div className="lx-rec-sum"><span dangerouslySetInnerHTML=${H('level sum = <b>' + r.sum + '</b>')}></span><div className="lx-rec-bar"><i style=${{ width: (r.w * 100).toFixed(1) + '%' }}></i></div></div></div>`)}
      <div className="lx-rec-dots">⋮</div>
      <div className=${'lx-rec-row leaf' + (f.cur >= 4 ? ' on' : ' fut')}><div className="lx-rec-meta">leaves Θ(1): shortest path depth <b dangerouslySetInnerHTML=${H('log<sub>' + f.short + '</sub> n')}></b>${f.short !== f.long ? html`, longest <b dangerouslySetInnerHTML=${H('log<sub>' + f.long + '</sub> n')}></b>` : null}</div></div></div>`;
    const R = d => {
      if (d === -1) return html`<div key="dots" className=${'lx-rec-dots' + (f.cur === -2 ? '' : '')}>⋮ levels 3 … ${f.leaf.h - 2}</div>`;
      const r = f.rows[d], st = d === f.cur ? ' on' : (f.cur >= 0 ? d > f.cur : true) && !(f.cur === -2 && d <= 2) ? ' fut' : '';
      return html`<div key=${d} className=${'lx-rec-row' + st}><div className="lx-rec-meta" dangerouslySetInnerHTML=${H(r.meta)}></div>
        <div className="lx-rec-chips">${Array.from({ length: Math.min(r.nodes, 4) }, (_, j) => html`<span key=${j} className="lx-rec-chip"><span dangerouslySetInnerHTML=${H(r.chip)}></span>${r.chip === num(r.each) ? null : html`<small>= ${num(r.each)}</small>`}</span>`)}${r.nodes > 4 ? html`<span className="lx-rec-more">… ×${r.nodes}</span>` : null}</div>
        <div className="lx-rec-sum"><span dangerouslySetInnerHTML=${H(r.symSum === num(r.sum) ? `sum = <b>${num(r.sum)}</b>` : `sum = ${r.symSum} = <b>${num(r.sum)}</b>`)}></span><div className="lx-rec-bar"><i style=${{ width: (r.w * 100).toFixed(1) + '%' }}></i></div></div></div>`;
    };
    const L = f.leaf, lc = f.cur >= L.h ? (f.cur === L.h ? ' on' : '') : ' fut';
    return html`<div className="lx-rec-rows">${f.shown.map(R)}
      <div className=${'lx-rec-row leaf' + lc}><div className="lx-rec-meta">d = <b>${L.h}</b> (leaves) · ${L.nodes} node${L.nodes > 1 ? 's' : ''} · size 1</div>
        <div className="lx-rec-chips">${Array.from({ length: Math.min(L.nodes, 4) }, (_, j) => html`<span key=${j} className="lx-rec-chip">T(1)<small>= ${L.t1}</small></span>`)}${L.nodes > 4 ? html`<span className="lx-rec-more">… ×${L.nodes}</span>` : null}</div>
        <div className="lx-rec-sum"><span>sum = ${L.nodes} × ${L.t1} = <b>${L.sum}</b></span><div className="lx-rec-bar"><i style=${{ width: (L.w * 100).toFixed(1) + '%' }}></i></div></div></div>
      ${f.cur > L.h ? html`<div className="lx-rec-total">Total = sum of all ${L.h + 1} levels = <b>${num(f.total)}</b></div>` : null}</div>`;
  }
  function LinesView({ f }) {
    return html`<div><div className="lx-rec-lines">${f.lines.map((l, j) => html`<div key=${j} className=${'lx-rec-ln' + (j === f.cur ? ' on' : j > f.cur ? ' fut' : '') + (j === f.res ? ' lx-rec-fin' : '')}><i>${l[0]}</i><span dangerouslySetInnerHTML=${H(l[1])}></span></div>`)}</div>
      ${f.check ? html`<div className="lx-rec-total">${f.check}</div>` : null}</div>`;
  }
  function MasterView({ f }) {
    const { m, k, E, step } = f, top = Math.max(1, Math.ceil(Math.max(k, E) + 0.5)), sx = x => 24 + x / top * 292;
    const near = Math.abs(sx(k) - sx(E)) < 46;
    const C = [[1, `<b>Case 1</b>: f(n) = O(n${sup('log<sub>b</sub>a − ε')}) ⇒ Θ(n${sup('log<sub>b</sub>a')})`], [2, `<b>Case 2</b>: f(n) = Θ(n${sup('log<sub>b</sub>a')} lg${sup('k')} n), k ≥ 0 ⇒ Θ(n${sup('log<sub>b</sub>a')} lg${sup('k+1')} n) (basic form: k = 0)`], [3, `<b>Case 3</b>: f(n) = Ω(n${sup('log<sub>b</sub>a + ε')}) and a·f(n/b) ≤ c·f(n), c &lt; 1 ⇒ Θ(f(n))`]];
    return html`<div>
      <svg className="lx-rec-svg" viewBox="0 0 340 104" role="img" aria-label="Exponent of f against log base b of a">
        <line x1="24" y1="56" x2="316" y2="56" stroke="var(--graphite)" strokeWidth="1.5" />
        ${Array.from({ length: top + 1 }, (_, j) => html`<g key=${j}><line x1=${sx(j)} y1="50" x2=${sx(j)} y2="62" stroke="var(--graphite)" /><text x=${sx(j)} y="96" textAnchor="middle" fontSize="15">${j}</text></g>`)}
        <g style=${{ opacity: step >= 1 ? 1 : 0, transition: 'opacity .4s' }}><circle cx=${sx(E)} cy="56" r="7" fill="#d23c3c" /><text x=${Math.min(270, Math.max(70, sx(E)))} y="30" textAnchor="middle" fontSize="15" fontWeight="700" style=${{ fill: '#d23c3c' }}>log_b a = ${m.Es}</text></g>
        <g style=${{ opacity: step >= 2 ? 1 : 0, transition: 'opacity .4s' }}><rect x=${sx(k) - 6} y="50" width="12" height="12" fill="var(--c)" transform=${`rotate(45 ${sx(k)} 56)`} /><text x=${Math.min(290, Math.max(50, sx(k)))} y=${near ? 80 : 30} textAnchor="middle" fontSize="15" fontWeight="700" style=${{ fill: 'var(--c)' }}>k = ${num(k)}${f.p ? ' (+lg)' : ''}</text></g>
      </svg>
      <div className="lx-rec-cases">${C.map(([c, t]) => html`<div key=${c} className=${'lx-rec-case' + (step < 3 ? '' : c === m.cs ? (m.basic ? ' hit' : (step >= 4 ? ' hit' : ' miss')) : ' dim')} dangerouslySetInnerHTML=${H(t + (c === 3 && m.cs === 3 && step >= 4 ? `<br/>Regularity: ${m.reg}` : '') + (c === 2 && m.cs === 2 && !m.basic && step === 3 ? '<br/><b>Basic case 2 needs k = 0: no case fits</b>' : ''))}></div>`)}</div>
      <div className="lx-rec-ans" dangerouslySetInnerHTML=${H(step >= 4 || (step >= 3 && m.basic && m.cs !== 3) ? `T(n) = <b>${m.T}</b>` : 'T(n) = ?')}></div></div>`;
  }

  const build = cfg => {
    const D = cfg.form === 'split' ? readSplit(cfg) : readDiv(cfg);
    if (D.fr && D.fr.length === 1) { const [x, y] = D.fr[0]; Object.assign(D, { a: 1, b: y / x, bS: x === 1 ? String(y) : `${y}/${x}`, E: 0, alpha: [x, y] }); }
    const head = recH(D) + (cfg.form === 'split' ? '' : `, ${D.v}(1) = ${D.t1}`);
    let F;
    if (cfg.method === 'master') F = masterFrames(D);
    else if (cfg.method === 'iter') F = iterFrames(D);
    else if (cfg.method === 'subst') F = substFrames(D);
    else F = D.fr ? treeSplit(D) : treeDiv(D);
    F.forEach(f => { f.head = head; f.method = cfg.method; });
    return F;
  };
  const NAMES = { tree: 'Recursion tree', master: 'Master method', iter: 'Iteration (unrolling)', subst: 'Substitution' };

  const P = (label, src, c) => ({ label, src, cfg: Object.assign({ form: 'div', method: 'master', a: '2', b: '2', f: 'n', n: '16', t1: '1', fr: '1/4, 1/2', v: 'T' }, c) });
  const presets = [
    P('Tree: T(1) = 4, 2T(n/2) + 4n', 'L3 slide 23', { method: 'tree', f: '4n', n: '8', t1: '4' }),
    P('Tree: T(n/4) + T(n/2) + n²', 'L3 slide 22', { form: 'split', method: 'tree', fr: '1/4, 1/2', f: 'n^2' }),
    P('Iteration: c + T(n/2)', 'L3 slides 9, 12', { method: 'iter', a: '1', f: 'c' }),
    P('Iteration: n + 2T(n/2)', 'L3 slide 13', { method: 'iter' }),
    P('Iteration: T(1) = 4, 2T(n/2) + 4n', 'L3 slide 14', { method: 'iter', f: '4n', n: '8', t1: '4' }),
    P('Substitution: T(n/2) + 1', 'L3 slide 17', { method: 'subst', a: '1', f: '1' }),
    P('Substitution: 3T(n/4) + n²', 'L3 slide 19', { method: 'subst', a: '3', b: '4', f: 'n^2' }),
    P('Substitution: 2T(n/2) + n', 'L3 slide 20', { method: 'subst' }),
    P('Master: 2T(n/2) + n', 'L3 slide 26', {}),
    P('Master: 2T(n/2) + n²', 'L3 slide 27', { f: 'n^2' }),
    P('Master: 2T(n/2) + √n', 'L3 slide 28', { f: 'sqrt n' }),
    P('Master: 3T(n/4) + n lg n', 'L3 slide 29', { a: '3', b: '4', f: 'n lg n' }),
    P('Master: 2T(n/2) + n lg n (fails)', 'L3 slide 30, L4 slide 5', { f: 'n lg n' }),
    P('Notes table: 4T(n/2) + n', 'L3 notes', { a: '4', f: 'n' }),
    P('Notes table: 4T(n/2) + n²', 'L3 notes', { a: '4', f: 'n^2' }),
    P('Notes table: 4T(n/2) + n³', 'L3 notes', { a: '4', f: 'n^3' }),
    P('Notes table: 4T(n/4) + 1', 'L3 notes', { a: '4', b: '4', f: '1' }),
    P('Notes table: 4T(n/4) + n', 'L3 notes', { a: '4', b: '4', f: 'n' }),
    P('Notes table: 2T(n/4) + √n', 'L3 notes', { a: '2', b: '4', f: 'sqrt n' }),
    P('Merge sort: 2T(n/2) + n', 'L4 slides 4-6', { method: 'tree' }),
    P('Binary search: T(n/2) + 1', 'L4 slides 14-15', { a: '1', f: '1' }),
    P('Powering aⁿ: T(n/2) + 1', 'L4 slide 18', { method: 'tree', a: '1', f: '1' }),
    P('Matrix blocks: 8T(n/2) + n²', 'L4 slides 32-34', { a: '8', f: 'n^2' }),
    P('Strassen: 7T(n/2) + n²', 'L4 slide 44', { a: '7', f: 'n^2', n: '8' }),
    P('VLSI height H(n/2) + 1', 'L4 slide 48', { method: 'tree', a: '1', f: '1', v: 'H' }),
    P('VLSI width 2W(n/2) + 1', 'L4 slide 49', { method: 'tree', a: '2', f: '1', v: 'W' }),
    P('H-tree: L(n) = 2L(n/4) + 1', 'L4 slides 51-53', { method: 'tree', a: '2', b: '4', f: '1', n: '256', v: 'L' }),
    P('Quicksort 1:9 split', 'L5 slides 27-32', { form: 'split', method: 'tree', fr: '1/10, 9/10', f: 'cn' }),
    P('Lucky RAND-SELECT: T(9n/10) + n', 'L7 slide 5', { form: 'split', fr: '9/10', f: 'n' }),
    P('SELECT: T(n/5) + T(3n/4) + n', 'L7 slides 28-30', { form: 'split', method: 'tree', fr: '1/5, 3/4', f: 'n' }),
    P('SELECT by substitution', 'L7 slide 29', { form: 'split', method: 'subst', fr: '1/5, 3/4', f: 'cn' })
  ];
  const inp = (cfg, setCfg, k, label, extra = {}) => html`<label ...${extra.wide ? { className: 'tl-wide' } : {}}>${label}<input value=${cfg[k]} onInput=${e => { const v = e.target.value; setCfg(c => ({ ...c, [k]: v })); }} /></label>`;

  window.LAB = window.LAB || {};
  window.LAB['rec'] = {
    meta: { title: 'Recurrences', group: 'Divide & conquer', icon: '⋔', desc: 'Recursion trees, master, iteration, substitution.', question: 'How much work does T(n) = aT(n/b) + f(n) do, and where is it spent?',
      model: 'A call of size n does f(n) work and makes a calls of size n/b. Level d of the recursion tree has aᵈ nodes of size n/bᵈ; the leaves are n^(log_b a). Compare f(n) with n^(log_b a): the root, every level, or the leaves dominate.',
      watch: 'Compare consecutive level sums: shrinking means the root dominates, equal means f(n)·lg n, growing means the leaves dominate.' },
    defaults: presets[0].cfg,
    presets,
    Controls: ({ cfg, setCfg }) => html`
      <label>Form<select value=${cfg.form} onChange=${e => { const v = e.target.value; setCfg(c => ({ ...c, form: v, method: v === 'split' && c.method === 'iter' ? 'tree' : c.method })); }}><option value="div">aT(n/b) + f(n)</option><option value="split">T(α₁n) + T(α₂n) + f(n)</option></select></label>
      <label>Method<select value=${cfg.method} onChange=${e => { const v = e.target.value; setCfg(c => ({ ...c, method: v })); }}>${Object.entries(NAMES).map(([k, t]) => html`<option key=${k} value=${k}>${t}</option>`)}</select></label>
      ${cfg.form === 'split' ? inp(cfg, setCfg, 'fr', 'Sizes α (fractions)') : html`${inp(cfg, setCfg, 'a', 'a')}${inp(cfg, setCfg, 'b', 'b')}`}
      ${inp(cfg, setCfg, 'f', 'f(n)', { wide: cfg.form === 'split' })}
      ${cfg.form === 'div' ? html`${inp(cfg, setCfg, 'n', 'n (a power of b)')}${inp(cfg, setCfg, 't1', 'T(1)')}` : null}`,
    build,
    Diagram: ({ f }) => html`<div className="lx-rec-wrap"><div className="lx-rec-head"><span dangerouslySetInnerHTML=${H(f.head)}></span><small>${NAMES[f.method]}</small></div>
      ${f.kind === 'master' ? html`<${MasterView} f=${f} />` : f.kind === 'lines' ? html`<${LinesView} f=${f} />` : html`<${TreeView} f=${f} />`}</div>`,
    legend: [['var(--c)', 'Current level / line'], ['var(--ok)', 'Leaves / result'], ['#d23c3c', 'Watershed log_b a']],
    cost: cfg => 'f(n) is entered as c·nᵏ·lgᵖ n (write c for a symbolic constant). The tree numbers use n a power of b and the given T(1); unequal splits are drawn symbolically for 4 levels. Master method as on L3 slide 25; the extended case 2 with lgᵏ n is the L4 slide 5 reprise. log_b a is printed to 3 decimals (L3 slide 29 writes log₄3 = 0.793). Substitution follows slides 17-20 (letters c and d as there); for case 1 the guess needs a subtracted lower-order term, which is the textbook trick, not on the slides.'
  };
})();

/* ── hash ── */
/* ── lab: Hashing (L8) ── */
// Hash functions of L8 (direct, division with the prime-size comparison, multiplication, mid-square, folding) computed step by step,
// and collision resolution with insert / search / delete: separate chaining (load factor, rehashing), linear probing, quadratic probing
// and double hashing with h2(k) = R − (k mod R). Operations are typed as in the L8 visuals: 18 inserts, s18 searches, d18 deletes (Deleted marker),
// x18 deletes by just emptying the slot (the wrong way of slide 62). Every preset reproduces a slide or an exam workout from the notes.
(function () {
  const { useState, useMemo, useEffect } = React;
  const html = htm.bind(React.createElement);
  const CSS = `
.lx-hash-wrap sub, .lx-hash-row sub{ font-size:max(.85em, 12px); line-height:0; }
.lx-hash-wrap{ display:flex; flex-direction:column; gap:12px; font-size:15px; color:var(--ink); }
.lx-hash-row{ display:flex; flex-wrap:wrap; gap:14px; justify-content:center; align-items:flex-start; }
.lx-hash-card{ border:1px solid var(--line); border-radius:10px; background:var(--paper); padding:10px 12px; min-width:0; flex:1 1 260px; max-width:440px; }
.lx-hash-card h4{ margin:0 0 6px; font-size:14px; color:var(--graphite); font-weight:600; }
.lx-hash-gen{ font-family:var(--mono); font-size:13px; color:var(--graphite); margin:0 0 6px; line-height:1.45; overflow-wrap:anywhere; }
.lx-hash-op{ font-weight:700; font-size:16px; margin:0 0 4px; }
.lx-hash-ln{ display:flex; flex-wrap:wrap; justify-content:space-between; gap:2px 10px; font-family:var(--mono); font-size:13.5px; padding:3px 0; border-top:1px dashed var(--rule); }
.lx-hash-ln:first-of-type{ border-top:0; }
.lx-hash-ln.now{ font-weight:700; }
.lx-hash-ok{ color:var(--ok); font-weight:600; }
.lx-hash-bad{ color:var(--pen); font-weight:600; }
.lx-hash-mid{ color:var(--graphite); font-weight:600; }
.lx-hash-ht{ display:grid; grid-template-columns:30px minmax(56px,auto) minmax(0,150px); gap:3px 6px; align-items:center; justify-content:center; font-size:14px; }
.lx-hash-ht.nar{ grid-template-columns:30px minmax(56px,auto); }
.lx-hash-info{ display:flex; flex-direction:column; line-height:1.15; min-width:0; }
.lx-hash-hl{ font-family:var(--mono); font-size:12.5px; color:var(--graphite); white-space:nowrap; }
.lx-hash-hi{ text-align:right; font-family:var(--mono); color:var(--graphite); font-size:13px; }
.lx-hash-hv{ min-height:26px; border:1.5px solid var(--line); border-radius:5px; display:flex; align-items:center; justify-content:center; font-family:var(--mono); font-weight:600; padding:0 6px; background:var(--paper); color:var(--ink); }
.lx-hash-hv.occ{ background:color-mix(in srgb, var(--c) 16%, var(--paper)); border-color:color-mix(in srgb, var(--c) 45%, var(--paper)); }
.lx-hash-hv.del{ background:repeating-linear-gradient(135deg, color-mix(in srgb, var(--faint) 22%, var(--paper)) 0 6px, var(--paper) 6px 12px); color:var(--graphite); font-weight:500; font-size:12.5px; }
.lx-hash-hv.ok{ border-color:var(--ok); box-shadow:0 0 0 2px color-mix(in srgb, var(--ok) 40%, transparent); }
.lx-hash-hv.bad{ border-color:var(--pen); box-shadow:0 0 0 2px color-mix(in srgb, var(--pen) 35%, transparent); }
.lx-hash-hv.mid{ border-color:#f2a93b; box-shadow:0 0 0 2px color-mix(in srgb, #f2a93b 45%, transparent); }
.lx-hash-hv.cur{ outline:2px dashed var(--ink); outline-offset:2px; }
.lx-hash-hs{ font-size:12.5px; white-space:nowrap; }
.lx-hash-tt{ text-align:center; font-size:13.5px; color:var(--graphite); margin:0 0 6px; font-weight:600; }
.lx-hash-chips{ display:flex; flex-wrap:wrap; gap:6px; justify-content:center; }
.lx-hash-chips span{ font-family:var(--mono); font-size:13.5px; border:1px solid var(--line); border-radius:999px; padding:3px 9px; background:var(--paper); }
.lx-hash-chips span.on{ border-color:var(--c); background:color-mix(in srgb, var(--c) 14%, var(--paper)); font-weight:700; }
.lx-hash-chips span.x{ border-color:var(--pen); color:var(--pen); }
.lx-hash-chips span.ok{ border-color:var(--ok); }
.lx-hash-calc{ display:flex; flex-direction:column; gap:6px; }
.lx-hash-calc > div{ display:flex; flex-wrap:wrap; justify-content:space-between; gap:2px 12px; border-bottom:1px dashed var(--rule); padding:3px 0; font-family:var(--mono); font-size:14px; }
.lx-hash-calc > div.off{ opacity:.35; }
.lx-hash-calc > div.now{ font-weight:700; }
.lx-hash-calc .lab{ font-family:inherit; color:var(--graphite); font-size:13px; font-weight:500; }
.lx-hash-big{ font-size:18px; font-weight:700; }
.lx-hash-dg{ display:flex; flex-wrap:wrap; justify-content:center; gap:3px; align-items:center; margin:4px 0; }
.lx-hash-dg span{ min-width:24px; height:30px; display:flex; align-items:center; justify-content:center; border:1px solid var(--line); border-radius:5px; font-family:var(--mono); font-size:16px; background:var(--paper); }
.lx-hash-dg span.on{ background:color-mix(in srgb, var(--c) 20%, var(--paper)); border-color:var(--c); font-weight:700; }
.lx-hash-dg span.rv{ background:color-mix(in srgb, #f2a93b 30%, var(--paper)); border-color:#f2a93b; font-weight:700; }
.lx-hash-dg span.bare{ border:0; background:none; min-width:0; padding:0 4px; font-size:14px; color:var(--graphite); }
.lx-hash-dg i{ width:10px; }
.lx-hash-ch{ display:flex; flex-direction:column; gap:5px; align-items:flex-start; margin:0 auto; max-width:100%; }
.lx-hash-cr{ display:flex; flex-wrap:wrap; align-items:center; gap:4px; font-family:var(--mono); font-size:14px; }
.lx-hash-ix{ width:30px; height:28px; display:flex; align-items:center; justify-content:center; border:1.5px solid var(--line); border-radius:5px; background:var(--paper-2); color:var(--graphite); }
.lx-hash-ix.on{ border-color:var(--c); color:var(--ink); font-weight:700; }
.lx-hash-nd{ min-width:36px; height:28px; display:flex; align-items:center; justify-content:center; border:1.5px solid color-mix(in srgb, var(--c) 45%, var(--paper)); border-radius:5px; background:color-mix(in srgb, var(--c) 14%, var(--paper)); font-weight:600; padding:0 5px; }
.lx-hash-nd.ok{ border-color:var(--ok); box-shadow:0 0 0 2px color-mix(in srgb, var(--ok) 40%, transparent); }
.lx-hash-nd.bad{ border-color:var(--pen); box-shadow:0 0 0 2px color-mix(in srgb, var(--pen) 35%, transparent); }
.lx-hash-nd.mid{ border-color:#f2a93b; box-shadow:0 0 0 2px color-mix(in srgb, #f2a93b 45%, transparent); }
.lx-hash-nd.gone{ opacity:.4; text-decoration:line-through; }
.lx-hash-ar{ color:var(--graphite); font-size:13px; }
.lx-hash-nil{ color:var(--graphite); font-size:12.5px; }
.lx-hash-lf{ text-align:center; font-family:var(--mono); font-size:14px; }
.lx-hash-help{ font-size:12px; color:var(--graphite); flex-basis:100%; line-height:1.4; }
`;
  if (!document.getElementById('lx-hash-css')) { const s = document.createElement('style'); s.id = 'lx-hash-css'; s.textContent = CSS; document.head.appendChild(s); }
  const H = s => html`<span dangerouslySetInnerHTML=${{ __html: s }}></span>`;
  const strip = s => String(s).replace(/<sub>(.*?)<\/sub>/g, '$1').replace(/<sup>(.*?)<\/sup>/g, '^$1').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  const f2 = x => String(Math.round(x * 100) / 100);
  const isPrime = x => { if (!Number.isInteger(x) || x < 2) return false; for (let d = 2; d * d <= x; d++) if (x % d === 0) return false; return true; };
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const DEL = 'D';

  /* ── input parsing with friendly errors ── */
  function intIn(s, lo, hi, name) {
    const t = String(s == null ? '' : s).trim();
    if (!/^\d+$/.test(t) || +t < lo || +t > hi) throw new Error(`${name} must be a whole number from ${lo} to ${hi}.`);
    return +t;
  }
  function keysIn(txt, max, lo, hi) {
    const tok = String(txt || '').split(/[\s,]+/).filter(Boolean);
    if (!tok.length) throw new Error('Type at least one key, separated by commas.');
    if (tok.length > max) throw new Error(`At most ${max} keys, so the drawing fits a phone.`);
    return tok.map(x => { if (!/^\d+$/.test(x)) throw new Error(`"${x}" is not a whole number.`); const v = +x; if (v < lo || v > hi) throw new Error(`Keys must be from ${lo} to ${hi} ("${x}" is not).`); return v; });
  }
  function opsIn(txt, max) {
    const tok = String(txt || '').split(/[\s,]+/).filter(Boolean);
    if (!tok.length) throw new Error('Type at least one operation, e.g. 7, 36, 18, s18, d18.');
    if (tok.length > max) throw new Error(`At most ${max} operations, so the steps stay readable.`);
    return tok.map(t => { const m = /^([sdx]?)(\d{1,3})$/i.exec(t); if (!m) throw new Error(`"${t}" is not understood: use a key (0 to 999) to insert it, s18 to search, d18 to delete (Deleted marker), x18 to delete by just emptying the slot.`);
      const c = m[1].toLowerCase(); return { t: c === 's' ? 'srch' : c === 'd' ? 'del' : c === 'x' ? 'x' : 'ins', k: +m[2] }; });
  }
  const OPN = { ins: 'Insert', srch: 'Search', del: 'Delete', x: 'Delete' };

  /* ── hash functions ── */
  // exact decimal arithmetic for the multiplication method (no floating-point noise)
  function decOf(s) { const t = String(s).trim(); if (!/^0?\.\d{1,9}$/.test(t)) return null; const d = t.split('.')[1]; return { n: BigInt(d), p: d.length }; }
  function decStr(v, p) { const neg = v < 0n; if (neg) v = -v; const s = v.toString().padStart(p + 1, '0'); let a = s.slice(0, s.length - p), b = s.slice(s.length - p).replace(/0+$/, ''); return (neg ? '−' : '') + a + (b ? '.' + b : ''); }
  function midSq(k, n) {
    const sq = String(BigInt(k) * BigInt(k)), r = String(n - 1).length, L = sq.length;
    const w = L <= r ? L : ((L - r) % 2 === 0 ? r : r + 1), st = Math.max(0, Math.floor((L - w) / 2));
    const mid = sq.slice(st, st + w), h = Number(mid) % n;
    return { sq, r, st, w, mid, h, modded: Number(mid) >= n || w > r };
  }

  function buildFn(cfg) {
    const M = cfg.method, F = [];
    if (M === 'direct' || M === 'division') {
      const keys = keysIn(cfg.keys, 12, 0, 999), m = intIn(cfg.m, 2, 13, 'Table size n');
      const m2 = M === 'division' && String(cfg.m2 || '').trim() ? intIn(cfg.m2, 2, 13, 'The second table size') : 0;
      const sizes = m2 ? [m, m2] : [m];
      const T = sizes.map(s => Array(s).fill(null));
      const hf = (k, s) => M === 'direct' ? k : k % s;
      const formula = M === 'direct' ? 'h(K) = K' : 'h(k) = k mod n';
      const chips = keys.map(k => ({ t: String(k), cls: '' }));
      const snap = (extra) => ({ kind: 'fn', tables: sizes.map((s, q) => ({ title: M === 'direct' ? `h(K) = K, slots 0 to ${s - 1}` : `k mod ${s}${isPrime(s) ? ' (prime)' : ''}`, cells: T[q].map(c => c && c.join(', ')), mark: {} })), chips: chips.map(c => ({ ...c })), ...extra });
      const used = q => T[q].filter(Boolean).length, coll = q => T[q].reduce((a, c) => a + (c ? c.length - 1 : 0), 0);
      const met = (q0) => [['Keys placed', `${chips.filter(c => c.cls).length} / ${keys.length}`], ...sizes.map((s, q) => [`Collisions (n = ${s})`, coll(q)]), ...sizes.map((s, q) => [`Slots used (n = ${s})`, `${used(q)} / ${s}`])];
      const intro = M === 'direct'
        ? `<b>Direct hashing</b>: the key is the address without any algorithmic manipulation, <b>h(K) = K</b>. Keys ${keys.join(', ')} into a table with slots 0 to ${m - 1}.`
        : `<b>Division method</b>: h(k) = k mod n, the remainder of the key divided by the table size n. Keys ${keys.join(', ')}${m2 ? ` into a table of size ${m} and one of size ${m2}, to compare them` : ` into a table of size ${m}`}. It is best that n is a prime number, so the keys spread more uniformly.`;
      F.push(snap({ html: intro, calc: [{ lab: 'hash function', val: formula }], inv: M === 'direct' ? 'Each key is its own address: O(1) search, insert and delete, but the array must be as large as the largest key.' : 'Watch which slots get used. Non-prime sizes (and powers of 2) can leave many slots empty while others collide.', metrics: met() }));
      keys.forEach((k, idx) => {
        const res = sizes.map((s, q) => { const j = hf(k, s); if (j >= s) return { j, miss: true }; const was = T[q][j] ? T[q][j].slice() : null; T[q][j] = (T[q][j] || []).concat(k); return { j, coll: !!was, was }; });
        chips[idx].cls = res[0].miss ? 'x' : res.some(r => r.coll) ? 'x' : 'on';
        chips[idx].t = `${k} → ${res.map(r => r.miss ? '✗' : r.j).join(' / ')}`;
        const fr = snap({});
        fr.tables.forEach((t, q) => { const r = res[q]; if (!r.miss) t.mark[r.j] = r.coll ? 'bad' : 'ok'; });
        let cap;
        if (M === 'direct') cap = res[0].miss ? `h(${k}) = ${k}, but there is no slot ${k}: the address space (array) must be as large as the largest key. That is the disadvantage of direct hashing: <b>memory consuming</b>.` : res[0].coll ? `h(${k}) = ${k}: slot ${k} already holds ${res[0].was.join(', ')}. Direct hashing assumes distinct keys.` : `h(${k}) = <b>${k}</b>: ${k} goes to its own slot. Searching, insertion and deletion are O(1).`;
        else cap = res.map((r, q) => `${k} mod ${sizes[q]} = <b>${r.j}</b>${r.coll ? ` (collision with ${r.was.join(', ')})` : ''}`).join(', and ') + (res.some(r => r.coll) ? '. Two different keys want the same slot: a <b>collision</b>.' : '.');
        fr.html = cap; fr.calc = res.map((r, q) => ({ lab: M === 'direct' ? 'h(K) = K' : `k mod ${sizes[q]}`, val: M === 'direct' ? `h(${k}) = ${k}` : `${k} mod ${sizes[q]} = ${r.j}`, now: true }));
        fr.metrics = met(); fr.inv = res.some(r => r.coll) ? 'A collision: the hash function alone cannot store both keys. Collision resolution (chaining or open addressing) handles it.' : undefined;
        F.push(fr);
      });
      const fin = snap({}); fin.calc = [{ lab: 'hash function', val: formula }]; fin.metrics = met();
      if (M === 'direct') fin.html = `Direct hashing: O(1) for searching, insertion and deletion. But it is memory consuming: the array needs a slot for every possible key${keys.some(k => k >= m) ? `, and ${keys.filter(k => k >= m).join(', ')} did not fit` : ''}.`;
      else fin.html = sizes.map((s, q) => `size ${s}${isPrime(s) ? ' (prime)' : ''} uses <b>${used(q)} of ${s}</b> slots with ${coll(q)} collision${coll(q) === 1 ? '' : 's'}`).join('; ') + '. ' + (m2 ? 'Certain values of n are bad (non-prime numbers, 2<sup>p</sup>) because they might cause a lot of collisions, so it is better to use prime numbers.' : 'Advantage: fast, only one operation. Disadvantage: certain values of n (non-prime, 2<sup>p</sup>) cause many collisions.');
      F.push(fin);
      return F;
    }
    if (M === 'mult') {
      const keys = keysIn(cfg.keys, 4, 0, 999999), n = intIn(cfg.n, 1, 100000, 'Table size n'), A = decOf(cfg.A);
      if (!A || A.n === 0n) throw new Error('A must be a decimal between 0 and 1 with up to 9 digits after the point, e.g. 0.618033.');
      const P = 10n ** BigInt(A.p), As = decStr(A.n, A.p), done = [];
      const lines = (k, upto) => { const kA = BigInt(k) * A.n, fr = kA % P, nf = BigInt(n) * fr, h = nf / P;
        const L = [{ lab: 'k · A', val: `${k} × ${As} = ${decStr(kA, A.p)}` }, { lab: 'kA mod 1 (fractional part)', val: `${decStr(kA, A.p)} mod 1 = ${decStr(fr, A.p)}` }, { lab: 'n · (kA mod 1)', val: `${n} × ${decStr(fr, A.p)} = ${decStr(nf, A.p)}` }, { lab: 'floor', val: `h(${k}) = ⌊ ${decStr(nf, A.p)} ⌋ = ${h}` }];
        return { L: L.map((l, j) => ({ ...l, off: j > upto, now: j === upto })), kA: decStr(kA, A.p), fr: decStr(fr, A.p), nf: decStr(nf, A.p), h: Number(h) }; };
      const chips = () => keys.map((k, j) => ({ t: j < done.length ? `${k} → ${done[j]}` : String(k), cls: j < done.length ? 'on' : '' }));
      F.push({ kind: 'fn', calc: [{ lab: 'hash function', val: 'h(k) = ⌊ n (kA mod 1) ⌋' }, { lab: 'constants', val: `n = ${n}, A = ${As}` }], chips: chips(), html: `<b>Multiplication method</b>: h(k) = ⌊n (kA mod 1)⌋. Multiply k by a constant A between 0 and 1, keep the fractional part, multiply it by n and take the floor. Here n = ${n}, A = ${As}.`, inv: 'Advantage: the value of n is not critical. Disadvantage: slower than the division method.', metrics: [['Keys hashed', `0 / ${keys.length}`], ['n', n], ['A', As]] });
      keys.forEach(k => {
        for (let s = 0; s < 4; s++) {
          const r = lines(k, s);
          const cap = [`Multiply the key by A: ${k} × ${As} = <b>${r.kA}</b>.`, `kA mod 1 keeps only the fractional part: ${r.kA} mod 1 = <b>${r.fr}</b>, a number in [0, 1).`, `Scale it to the table: ${n} × ${r.fr} = <b>${r.nf}</b>, a number in [0, ${n}).`, `Take the floor: <b>h(${k}) = ⌊${r.nf}⌋ = ${r.h}</b>.`][s];
          if (s === 3) done.push(r.h);
          F.push({ kind: 'fn', head: `k = ${k}`, calc: r.L, chips: chips(), html: cap, metrics: [['Keys hashed', `${done.length} / ${keys.length}`], ['n', n], ['A', As], ['Step', ['k·A', 'mod 1', '× n', 'floor'][s]]] });
        }
      });
      F.push({ kind: 'fn', calc: [{ lab: 'hash function', val: 'h(k) = ⌊ n (kA mod 1) ⌋' }], chips: chips(), html: `Results: ${keys.map((k, j) => `h(${k}) = <b>${done[j]}</b>`).join(', ')}. Every slot 0 to ${n - 1} is reachable, whatever n is: the value of n is not critical (Knuth suggests A ≈ (√5 − 1)/2 ≈ 0.618033).`, metrics: [['Keys hashed', `${done.length} / ${keys.length}`], ['n', n], ['A', As]] });
      return F;
    }
    if (M === 'midsq') {
      const n0 = intIn(cfg.n, 2, 100000, 'Table size n');
      const tok = String(cfg.keys || '').split(/[\s,]+/).filter(Boolean);
      if (!tok.length) throw new Error('Type at least one key (or key:n pairs such as 120:10).');
      if (tok.length > 6) throw new Error('At most 6 keys, so the steps stay readable.');
      const items = tok.map(t => { const m = /^(\d{1,7})(?::(\d{1,6}))?$/.exec(t); if (!m) throw new Error(`"${t}" is not understood: type a key (up to 7 digits) or key:n, e.g. 120:10.`); const n = m[2] ? +m[2] : n0; if (n < 2) throw new Error('Every table size n must be at least 2.'); return { k: +m[1], n }; });
      const done = [];
      const chips = () => items.map((o, j) => ({ t: j < done.length ? `h(${o.k}) = ${done[j]}` : String(o.k), cls: j < done.length ? 'on' : '' }));
      F.push({ kind: 'fn', calc: [{ lab: 'rule', val: 'square k, keep the middle r digits' }, { lab: 'r from n', val: 'n = 10 → r = 1, n = 100 → r = 2, n = 1000 → r = 3' }], chips: chips(), html: '<b>Mid-square method</b>: square the key and extract the <b>middle r digits</b> as the hash value. r depends on the table size n: the number of digits of n − 1 (n = 10 → r = 1, n = 100 → r = 2, n = 1000 → r = 3).', inv: 'Every digit of the key affects the middle of k², so collisions are fewer. Disadvantage: it is difficult to square large values.', metrics: [['Keys hashed', `0 / ${items.length}`]] });
      items.forEach(o => {
        const r = midSq(o.k, o.n), dg = on => r.sq.split('').map((d, j) => ({ d, on: on && j >= r.st && j < r.st + r.w }));
        const base = { kind: 'fn', head: `k = ${o.k}, n = ${o.n} (0 to ${o.n - 1}), r = ${r.r}` };
        F.push({ ...base, digits: dg(false), calc: [{ lab: 'k²', val: `${o.k}² = ${r.sq}`, now: true }], chips: chips(), html: `k = ${o.k}, n = ${o.n}: the table has slots 0 to ${o.n - 1}, so r = ${r.r} (the digits of ${o.n - 1}). Square the key: ${o.k}² = <b>${r.sq}</b>.`, metrics: [['Keys hashed', `${done.length} / ${items.length}`], ['r', r.r], ['digits of k²', r.sq.length]] });
        const odd = r.w > r.r;
        F.push({ ...base, digits: dg(true), calc: [{ lab: 'k²', val: `${o.k}² = ${r.sq}` }, { lab: `middle ${r.w} digit${r.w > 1 ? 's' : ''}`, val: r.mid, now: true }], chips: chips(), html: `Take the middle ${r.w} digit${r.w > 1 ? 's' : ''} of ${r.sq}: <b>${r.mid}</b>.${odd ? ` ${r.sq} has ${r.sq.length} digits and r = ${r.r}, so there is no exact middle of ${r.r}; as on the slide, take the middle ${r.w} and reduce mod n.` : ''}`, metrics: [['Keys hashed', `${done.length} / ${items.length}`], ['r', r.r], ['digits of k²', r.sq.length]] });
        done.push(r.h);
        F.push({ ...base, digits: dg(true), calc: [{ lab: 'k²', val: `${o.k}² = ${r.sq}` }, { lab: `middle ${r.w} digit${r.w > 1 ? 's' : ''}`, val: r.mid }, ...(r.modded ? [{ lab: 'keep it in range', val: `${r.mid} % ${o.n} = ${r.h}` }] : []), { lab: 'hash value', val: `h(${o.k}) = ${r.h}`, now: true, big: true }], chips: chips(), html: `${r.modded ? `${r.mid} is not in 0 to ${o.n - 1}, so take ${r.mid} % ${o.n} = ${r.h}. ` : ''}<b>h(${o.k}) = ${r.h}</b>.`, metrics: [['Keys hashed', `${done.length} / ${items.length}`], ['r', r.r], ['h(k)', r.h]] });
      });
      return F;
    }
    if (M === 'fold') {
      const key = String(cfg.key || '').trim();
      if (!/^\d{2,12}$/.test(key)) throw new Error('The key must have 2 to 12 digits.');
      const r = intIn(cfg.r, 1, 4, 'The address size (digits)');
      if (r >= key.length) throw new Error(`The address size must be smaller than the key (${key.length} digits).`);
      const parts = []; for (let j = 0; j < key.length; j += r) parts.push(key.slice(j, j + r));
      const Mx = Math.pow(10, r), sum = parts.reduce((a, p) => a + Number(p), 0);
      const rev = parts.map((p, j) => (j === 0 || j === parts.length - 1) ? p.split('').reverse().join('') : p), sumB = rev.reduce((a, p) => a + Number(p), 0);
      const grp = (ps, rv) => ps.map((p, j) => ({ p, rv: rv && (j === 0 || j === ps.length - 1) }));
      const head = `K = ${key}, address of ${r} digit${r > 1 ? 's' : ''} (0 to ${Mx - 1})`;
      const met = (a, b) => [['Parts', parts.length], ['Fold-shifting', a == null ? '·' : a], ['Fold-boundary', b == null ? '·' : b]];
      F.push({ kind: 'fn', head, digits: key.split('').map(d => ({ d })), calc: [{ lab: 'key', val: key }], html: `<b>Folding method</b>: partition the key K into parts K1, K2, … and add them. The partition depends on the address size: the address has ${r} digit${r > 1 ? 's' : ''} (0 to ${Mx - 1}).`, inv: 'Fold-shifting adds the parts as they are; fold-boundary first reverses the two outer parts.', metrics: met() });
      F.push({ kind: 'fn', head, groups: grp(parts, false), calc: [{ lab: 'parts', val: parts.join(', '), now: true }], html: `Break the key into parts of ${r} digit${r > 1 ? 's' : ''}: <b>${parts.join(', ')}</b>.`, metrics: met() });
      F.push({ kind: 'fn', head, groups: grp(parts, false), calc: [{ lab: 'parts', val: parts.join(', ') }, { lab: 'fold-shifting sum', val: `${parts.join(' + ')} = ${sum}`, now: true }], html: `<b>Fold-shifting</b>: add the actual values of the parts: ${parts.join(' + ')} = <b>${sum}</b>.`, metrics: met() });
      F.push({ kind: 'fn', head, groups: grp(parts, false), calc: [{ lab: 'parts', val: parts.join(', ') }, { lab: 'fold-shifting sum', val: `${parts.join(' + ')} = ${sum}` }, { lab: 'location', val: `${sum} % ${Mx} = ${sum % Mx}`, now: true, big: true }], html: `${sum} % ${Mx} = <b>${sum % Mx}</b>: with fold-shifting we get ${sum % Mx} as the location.`, metrics: met(sum % Mx) });
      F.push({ kind: 'fn', head, groups: grp(rev, true), calc: [{ lab: 'outer parts reversed', val: `${parts[0]} → ${rev[0]}, ${parts[parts.length - 1]} → ${rev[rev.length - 1]}`, now: true }], html: `<b>Fold-boundary</b>: reverse the values of the outer parts, ${parts[0]} → <b>${rev[0]}</b> and ${parts[parts.length - 1]} → <b>${rev[rev.length - 1]}</b>; the inner parts stay.`, metrics: met(sum % Mx) });
      F.push({ kind: 'fn', head, groups: grp(rev, true), calc: [{ lab: 'parts', val: rev.join(', ') }, { lab: 'fold-boundary sum', val: `${rev.join(' + ')} = ${sumB}` }, { lab: 'location', val: `${sumB} % ${Mx} = ${sumB % Mx}`, now: true, big: true }], html: `Add them: ${rev.join(' + ')} = ${sumB}, and ${sumB} % ${Mx} = <b>${sumB % Mx}</b>: with fold-boundary we get ${sumB % Mx} as the location (fold-shifting gave ${sum % Mx}).`, metrics: met(sum % Mx, sumB % Mx) });
      return F;
    }
    throw new Error('Unknown method.');
  }

  /* ── open addressing: HASH-INSERT, HASH-SEARCH (slides 52-53), delete with a Deleted marker (slide 54) ── */
  const slotOf = (M, k, i, m, R) => M === 'linear' ? (k + i) % m : M === 'quad' ? (k + i * i) % m : (k % m + i * (R - k % R)) % m;
  const fx = (M, k, i, m, R) => M === 'linear' ? `(${k} + ${i}) mod ${m}` : M === 'quad' ? `(${k} + ${i}·${i}) mod ${m}` : `(${k % m} + ${i}·${R - k % R}) mod ${m}`;
  const genOf = (M, m, R) => M === 'linear' ? `h(k, i) = (h′(k) + i) mod ${m}, h′(k) = k mod ${m}` : M === 'quad' ? `h(k, i) = (h′(k) + i²) mod ${m}, h′(k) = k mod ${m}` : `h(k, i) = (h₁(k) + i·h₂(k)) mod ${m}, h₁(k) = k mod ${m}, h₂(k) = ${R} − (k mod ${R})`;
  const keyGen = (M, k, m, R) => M === 'double' ? `h₂(${k}) = ${R} − (${k} mod ${R}) = ${R} − ${k % R} = ${R - k % R}` : `h′(${k}) = ${k} mod ${m} = ${k % m}`;
  const ST = { col: ['Collision', 'bad'], ins: ['Insertion', 'ok'], insd: ['Insertion (Deleted slot)', 'ok'], hit: ['Matched', 'ok'], empty: ['Empty: stop', 'bad'], neq: ['≠ key', 'bad'], skipd: ['Deleted: go on', 'mid'] };
  const NAME = { linear: 'Linear probing', quad: 'Quadratic probing', double: 'Double hashing' };

  function buildOA(cfg) {
    const M = cfg.method, m = intIn(cfg.m, 2, 13, 'Table size m');
    let R = 0;
    if (M === 'double') { R = intIn(cfg.R, 2, 12, 'R'); if (!isPrime(R)) throw new Error(`R must be a prime (h₂(k) = R − (k mod R) with R a prime smaller than the table size); ${R} is not prime.`); if (R >= m) throw new Error(`R must be a prime smaller than the table size m = ${m}.`); }
    const ops = opsIn(cfg.ops, 14);
    const T = Array(m).fill(null), F = [];
    let tot = 0, done = 0;
    const nKeys = () => T.filter(v => v !== null && v !== DEL).length, nDel = () => T.filter(v => v === DEL).length;
    const alpha = () => nKeys() / m;
    const met = (extra) => { const a = alpha(); return [...(extra || []), ['Keys n', nKeys()], ['Load α = n/m', `${nKeys()}/${m} = ${f2(a)}`], ['Expected probes 1/(1−α)', a < 1 ? f2(1 / (1 - a)) : '∞ (full)'], ['Deleted markers', nDel()], ['Total probes', tot]]; };
    const quadWarn = () => M === 'quad' && (!isPrime(m) || alpha() > 0.5) ? ` Note: quadratic probing is only guaranteed to find an empty slot when the table is at most half full and its size is prime (slide 79)${!isPrime(m) ? `; m = ${m} is not prime` : ''}${alpha() > 0.5 ? `; α = ${f2(alpha())} > 0.5` : ''}.` : '';
    const intro = { linear: '<b>Linear probing</b>: h(k, i) = (h′(k) + f(i)) mod m with f(i) = i. When a collision occurs, probe the next bucket, and keep probing until an empty bucket is found.', quad: '<b>Quadratic probing</b>: when a collision occurs, probe the i<sup>2</sup>-th bucket in the i-th iteration: h(k, i) = (h′(k) + i·i) mod m.', double: `<b>Double hashing</b>: use a second hash function and look at slot i·hash2(k) in the i-th rotation: h(k, i) = (hash1(k) + i·hash2(k)) mod m, hash1(k) = k mod ${m}, hash2(k) = ${R} − (k mod ${R}); ${R} is a prime smaller than the table size, so hash2 never evaluates to 0.` }[M];
    F.push({ kind: 'oa', T: T.slice(), marks: {}, op: NAME[M] + `, m = ${m}`, gen: genOf(M, m, R), lines: [], html: intro + ` Operations: ${ops.map(o => o.t === 'ins' ? o.k : (o.t === 'srch' ? 's' : o.t === 'del' ? 'd' : 'x') + o.k).join(', ')}.` + quadWarn(), metrics: met([['Operation', '·']]), inv: 'Insert stops at the first empty or Deleted slot. Search stops at the key or at an empty slot, and walks past Deleted slots.' });
    for (const op of ops) {
      const k = op.k, lines = [], marks = {}, label = `${OPN[op.t]} (${k})${op.t === 'x' ? ' by emptying the slot' : ''}`;
      let probes = 0;
      for (let i = 0; i < m; i++) {
        const j = slotOf(M, k, i, m, R), v = T[j]; probes++; tot++;
        let r;
        if (op.t === 'ins') r = v === null ? 'ins' : v === DEL ? 'insd' : 'col';
        else r = v === k ? 'hit' : v === null ? 'empty' : v === DEL ? 'skipd' : 'neq';
        const stop = r === 'ins' || r === 'insd' || r === 'hit' || r === 'empty', last = stop || i === m - 1;
        const was = v;
        if (op.t === 'ins' && stop) T[j] = k;
        if (r === 'hit' && op.t === 'del') T[j] = DEL;
        if (r === 'hit' && op.t === 'x') T[j] = null;
        lines.push({ h: `h<sub>${i}</sub>(${k}) = ${fx(M, k, i, m, R)} = <b>${j}</b>`, st: ST[r][0], cls: ST[r][1] });
        Object.keys(marks).forEach(q => { marks[q].cur = false; });
        const mk = marks[j] || (marks[j] = { labs: [] }); mk.labs.push(`h<sub>${i}</sub>(${k})`); mk.st = ST[r][0]; mk.cls = ST[r][1]; mk.cur = true;
        const pre = `<b>${label}</b>, probe i = ${i}: h<sub>${i}</sub>(${k}) = ${fx(M, k, i, m, R)} = ${j}. `;
        let why;
        if (r === 'col') why = `Slot ${j} holds ${was}: <b>collision</b>${i < m - 1 ? `, so try i = ${i + 1}.` : '.'}`;
        else if (r === 'ins') why = `Slot ${j} is empty: insert ${k} there (${probes} probe${probes > 1 ? 's' : ''}).`;
        else if (r === 'insd') why = `Slot ${j} is marked Deleted, which Insert treats as empty: insert ${k} there (${probes} probe${probes > 1 ? 's' : ''}).`;
        else if (r === 'hit') why = op.t === 'srch' ? `Slot ${j} holds ${k}: <b>matched</b>, found after ${probes} probe${probes > 1 ? 's' : ''}.` : op.t === 'del' ? `Slot ${j} holds ${k}: found. Replace it with the special flag <b>Deleted</b>, which Insert treats as empty but Search does not (slide 63).` : `Slot ${j} holds ${k}. Deleting it by simply <b>emptying</b> the slot: a later search that passed through slot ${j} will now stop there too early (slide 62).`;
        else if (r === 'empty') { const there = T.indexOf(k); why = `Slot ${j} is empty, and an empty slot breaks the search: <b>${k} is not found</b>${there >= 0 ? `, although ${k} is in slot ${there}! An earlier delete emptied a slot on its probe path; that is why delete must leave a Deleted marker (slides 62-63)` : ''} (${probes} probe${probes > 1 ? 's' : ''}).`; }
        else if (r === 'neq') why = `Slot ${j} holds ${was}, not matching${i < m - 1 ? `: try i = ${i + 1}.` : '.'}`;
        else why = `Slot ${j} is marked Deleted: the search does not stop there${i < m - 1 ? `, try i = ${i + 1}.` : '.'}`;
        let tail = '';
        if (last && !stop) {
          if (op.t === 'ins') { tail = ` All ${m} probes found occupied slots: <b>unable to insert ${k}</b> (Hash Table Overflow), the index calculated is never empty.`;
            if (M === 'quad') tail += ' Keys with the same first probe follow the same sequence (secondary clustering); the table should be at most half full and its size prime (slide 79).';
            if (M === 'double') { const g = gcd(R - k % R, m); if (g > 1) tail += ` h₂(${k}) = ${R - k % R} and gcd(${R - k % R}, ${m}) = ${g}, so the probes only visit ${m / g} different slots. h₂ must be relatively prime to m so all cells can be probed (a prime m guarantees it).`; } }
          else tail = ` All ${m} probes done: ${k} is not in the table.`;
        }
        if (last && op.t === 'ins' && stop) done++;
        F.push({ kind: 'oa', T: T.slice(), marks: JSON.parse(JSON.stringify(marks)), op: label, gen: keyGen(M, k, m, R), lines: lines.slice(), fail: last && !stop && op.t === 'ins' ? `Unable to insert ${k}` : null,
          html: pre + why + tail + (last && op.t === 'ins' && stop ? quadWarn() : ''),
          metrics: met([['Operation', label], ['Probes (this op)', probes]]),
          inv: M === 'linear' ? 'Linear probing builds long runs of occupied slots (primary clustering): every key that lands in a run walks to its end.' : M === 'quad' ? 'Keys with the same first probe h(k, 0) follow the same probe sequence: secondary clustering.' : 'Each (h₁(k), h₂(k)) pair gives its own probe sequence, so keys that collide once go different ways: no clustering.' });
        if (stop) break;
      }
    }
    const a = alpha();
    F.push({ kind: 'oa', T: T.slice(), marks: {}, op: 'Done', gen: genOf(M, m, R), lines: [], html: `Done: ${nKeys()} key${nKeys() === 1 ? '' : 's'} in ${m} slots, load factor α = ${nKeys()}/${m} = ${f2(a)}; ${tot} probes over ${ops.length} operations (${f2(tot / ops.length)} each). For α &lt; 1 the expected number of probes in an unsuccessful search (or an insert) is at most <b>1/(1 − α)</b>${a < 1 ? ` = ${f2(1 / (1 - a))}` : ''}: 2 when half full, 10 when 90% full (slide 90).`, metrics: met([['Operation', 'all done']]), inv: M === 'linear' ? 'Primary and secondary clustering; m probe sequences; best cache performance.' : M === 'quad' ? 'No primary clustering, but secondary clustering; m probe sequences.' : 'No clustering; Θ(m²) probe sequences; poor cache performance.' });
    return F;
  }

  /* ── separate chaining (slides 31-37) with rehashing (slides 47-48) ── */
  function buildChain(cfg) {
    let m = intIn(cfg.m, 1, 13, 'Table size m');
    const thrT = String(cfg.thr || '').trim();
    const thr = thrT ? Number(thrT) : 0;
    if (thrT && !(thr > 0 && thr <= 10)) throw new Error('The load-factor threshold must be a number from 0.1 to 10, or empty for no rehashing.');
    const ops = opsIn(cfg.ops, 14);
    if (ops.some(o => o.t === 'x')) throw new Error('x (delete by emptying) is for open addressing; in chaining use d18 to unlink a key.');
    let C = Array.from({ length: m }, () => []);
    const F = []; let tot = 0;
    const n = () => C.reduce((a, c) => a + c.length, 0), al = () => n() / m;
    const met = extra => [...(extra || []), ['Keys n', n()], ['Slots m', m], ['Load α = n/m', `${n()}/${m} = ${f2(al())}`], ['Expected search 1 + α', f2(1 + al())], ['Longest chain', Math.max(0, ...C.map(c => c.length))], ['Total nodes visited', tot]];
    const snap = (hot, extra) => ({ kind: 'ch', rows: C.map(c => c.slice()), hot: hot || null, ...extra });
    F.push(snap(null, { html: `<b>Separate chaining</b> (open hashing): every slot A[i] holds a chain (linked list) of the keys with hash(k) = i. Hash function k mod ${m}${thr ? `; rehash when the load factor exceeds the threshold ${thr}` : ''}.`, metrics: met([['Operation', '·']]), lf: `α = n/m = ${n()}/${m}`, inv: 'Under simple uniform hashing the expected chain length is the load factor α = n/m, so search and delete cost O(1 + α).' }));
    for (const op of ops) {
      const k = op.k, j = k % m, label = `${OPN[op.t]} (${k})`;
      if (op.t === 'ins') {
        C[j].push(k); tot++;
        F.push(snap({ row: j, idx: C[j].length - 1, cls: 'ok' }, { html: `<b>${label}</b>: hash(${k}) = ${k} mod ${m} = ${j}; link ${k} into chain ${j} (at its end, as on slide 47). Insert costs O(1): hash, then link. Now α = ${n()}/${m} = ${f2(al())}.`, metrics: met([['Operation', label], ['Chain length', C[j].length]]), lf: `α = n/m = ${n()}/${m} = ${f2(al())}${thr ? (al() > thr ? ` > ${thr}` : ` ≤ ${thr}`) : ''}` }));
        if (thr && al() > thr) {
          F.push(snap({ row: j, idx: C[j].length - 1, cls: 'mid' }, { html: `The load factor ${n()}/${m} = <b>${f2(al())}</b> is greater than the threshold ${thr}: <b>start rehashing</b>. Initialize a new array of double size, ${2 * m} slots, with the new hash function k mod ${2 * m}.`, metrics: met([['Operation', 'rehash']]), lf: `α = ${f2(al())} > ${thr}: rehash` }));
          const old = C, m2 = 2 * m; m = m2; C = Array.from({ length: m }, () => []);
          const map = []; old.forEach(c => c.forEach(x => { C[x % m].push(x); map.push(`${x} → ${x % m}`); tot++; }));
          F.push(snap(null, { html: `Rehash: hash every key again with k mod ${m} and copy it into the new array (${map.join(', ')}), then make it the bucket array. The load factor drops to ${n()}/${m} = <b>${f2(al())}</b>.`, metrics: met([['Operation', 'rehash done']]), lf: `α = n/m = ${n()}/${m} = ${f2(al())}` }));
        }
        continue;
      }
      // search / delete: hash, then walk the chain
      let found = -1;
      for (let q = 0; q < C[j].length; q++) {
        tot++;
        const hit = C[j][q] === k;
        F.push(snap({ row: j, idx: q, cls: hit ? 'ok' : 'bad', walk: true }, { html: `<b>${label}</b>: hash(${k}) = ${k} mod ${m} = ${j}; node ${q + 1} of chain ${j} holds ${C[j][q]}: ${hit ? '<b>found</b>' : `≠ ${k}, follow the link`}.`, metrics: met([['Operation', label], ['Nodes visited', q + 1]]), lf: `α = n/m = ${n()}/${m} = ${f2(al())}` }));
        if (hit) { found = q; break; }
      }
      if (found < 0) F.push(snap({ row: j, idx: -1, cls: 'bad', walk: true }, { html: `<b>${label}</b>: hash(${k}) = ${k} mod ${m} = ${j}; ${C[j].length ? 'the chain ends (nil)' : `chain ${j} is empty (nil)`}: ${k} is not in the table.`, metrics: met([['Operation', label], ['Nodes visited', C[j].length]]), lf: `α = n/m = ${n()}/${m} = ${f2(al())}` }));
      else if (op.t === 'del') {
        F.push(snap({ row: j, idx: found, cls: 'gone' }, { html: `Delete: unlink ${k} from chain ${j} (its predecessor now points past it). Expected time to delete = time to search = <b>O(1 + α)</b>; no Deleted marker is needed in chaining.`, metrics: met([['Operation', label]]), lf: `α = n/m = ${n()}/${m} = ${f2(al())}` }));
        C[j].splice(found, 1);
        F.push(snap(null, { html: `${k} is gone; α = ${n()}/${m} = ${f2(al())}.`, metrics: met([['Operation', label]]), lf: `α = n/m = ${n()}/${m} = ${f2(al())}` }));
      }
    }
    F.push(snap(null, { html: `Done: ${n()} keys in ${m} chains, α = ${n()}/${m} = ${f2(al())}, longest chain ${Math.max(0, ...C.map(c => c.length))}. Expected search/delete O(1 + α), insert O(1); worst case all keys in one chain: O(n).`, metrics: met([['Operation', 'all done']]), lf: `α = n/m = ${n()}/${m} = ${f2(al())}` }));
    return F;
  }

  /* ── drawing ── */
  function HT({ T, marks, narrow, title }) {
    const labs = l => l.length > 2 ? `${l[0]}, …, ${l[l.length - 1]}` : l.join(', ');
    return html`<div>${title ? html`<div className="lx-hash-tt">${title}</div>` : null}<div className=${'lx-hash-ht' + (narrow ? ' nar' : '')}>${T.map((v, j) => { const mk = marks && marks[j]; return html`<${React.Fragment} key=${j}>
      <span className="lx-hash-hi">${j}</span>
      <span className=${'lx-hash-hv' + (v === DEL ? ' del' : v != null ? ' occ' : '') + (mk ? ' ' + (mk.cls || '') + (mk.cur ? ' cur' : '') : '')}>${v === DEL ? 'Deleted' : v == null ? '' : v}</span>
      ${narrow ? null : html`<span className="lx-hash-info">${mk ? html`<span className="lx-hash-hl">${H(labs(mk.labs))}</span><span className=${'lx-hash-hs lx-hash-' + (mk.cls || 'mid')}>${mk.st}</span>` : null}</span>`}</${React.Fragment}>`; })}</div></div>`;
  }
  function FnView({ f }) {
    return html`<div className="lx-hash-wrap">
      ${f.chips ? html`<div className="lx-hash-chips" aria-label="Keys">${f.chips.map((c, j) => html`<span key=${j} className=${c.cls}>${c.t}</span>`)}</div>` : null}
      <div className="lx-hash-row"><div className="lx-hash-card">
        ${f.head ? html`<div className="lx-hash-op">${f.head}</div>` : null}
        ${f.digits ? html`<div className="lx-hash-dg">${f.digits.map((d, j) => html`<span key=${j} className=${d.on ? 'on' : ''}>${d.d}</span>`)}</div>` : null}
        ${f.groups ? html`<div className="lx-hash-dg">${f.groups.map((g, j) => html`<${React.Fragment} key=${j}>${j ? html`<span className="bare">+</span>` : null}${g.p.split('').map((d, q) => html`<span key=${q} className=${g.rv ? 'rv' : 'on'}>${d}</span>`)}</${React.Fragment}>`)}</div>` : null}
        <div className="lx-hash-calc">${f.calc.map((l, j) => html`<div key=${j} className=${(l.off ? 'off' : '') + (l.now ? ' now' : '')}><span className="lab">${l.lab}</span><span className=${l.big ? 'lx-hash-big' : ''}>${l.off ? '…' : l.val}</span></div>`)}</div></div></div>
      ${f.tables ? html`<div className="lx-hash-row">${f.tables.map((t, q) => html`<${HT} key=${q} title=${t.title} narrow=${true} T=${t.cells} marks=${Object.fromEntries(Object.entries(t.mark).map(([j, c]) => [j, { cls: c, labs: [] }]))} />`)}</div>` : null}
    </div>`;
  }
  function OAView({ f }) {
    return html`<div className="lx-hash-row">
      <div className="lx-hash-card"><div className="lx-hash-op">${f.op}</div><div className="lx-hash-gen">${f.gen}</div>
        ${f.lines.map((l, j) => html`<div key=${j} className=${'lx-hash-ln' + (j === f.lines.length - 1 ? ' now' : '')}><span>${H(l.h)}</span><span className=${'lx-hash-' + l.cls}>${l.st}</span></div>`)}
        ${f.fail ? html`<div className="lx-hash-bad" style=${{ marginTop: '6px' }}>${f.fail}</div>` : null}</div>
      <${HT} T=${f.T} marks=${f.marks} /></div>`;
  }
  function ChainView({ f }) {
    const h = f.hot;
    return html`<div className="lx-hash-wrap"><div className="lx-hash-ch" aria-label="Chains">${f.rows.map((r, j) => html`<div className="lx-hash-cr" key=${j}>
      <span className=${'lx-hash-ix' + (h && h.row === j ? ' on' : '')}>${j}</span>
      ${r.map((x, q) => { const c = h && h.row === j ? (h.idx === q ? h.cls : h.walk && (h.idx > q || h.idx === -1) ? 'mid' : '') : ''; return html`<${React.Fragment} key=${q}><span className="lx-hash-ar">→</span><span className=${'lx-hash-nd' + (c ? ' ' + c : '')}>${x}</span></${React.Fragment}>`; })}
      <span className="lx-hash-ar">→</span><span className=${'lx-hash-nil' + (h && h.row === j && h.idx === -1 ? ' lx-hash-bad' : '')}>nil</span></div>`)}</div>
      <div className="lx-hash-lf">${f.lf}</div></div>`;
  }

  /* ── methods, defaults, presets ── */
  const METHODS = [['direct', 'Direct hashing: h(k) = k'], ['division', 'Division: k mod n'], ['mult', 'Multiplication: ⌊n(kA mod 1)⌋'], ['midsq', 'Mid-square'], ['fold', 'Folding (shift and boundary)'], ['chain', 'Separate chaining'], ['linear', 'Linear probing'], ['quad', 'Quadratic probing'], ['double', 'Double hashing']];
  const RES = ['chain', 'linear', 'quad', 'double'];
  const DEF = {
    direct: { keys: '1, 4, 7, 9, 0, 8, 30', m: '10' },
    division: { keys: '10, 20, 30, 40, 50', m: '4', m2: '7' },
    mult: { keys: '123, 150', n: '100', A: '0.618033' },
    midsq: { keys: '5642', n: '1000' },
    fold: { key: '12345678', r: '2' },
    chain: { ops: '12, 10, 7, 14, 5, 11, 22', m: '3', thr: '2' },
    linear: { ops: '7, 36, 18, 62, s18, d18, s62, 51', m: '11' },
    quad: { ops: '7, 36, 18, 62, 51', m: '11' },
    double: { ops: '37, 90, 45, 22, 17, 49, 55', m: '10', R: '7' }
  };
  const mk = (method, over) => ({ method, ...DEF[method], ...(over || {}) });
  const EXAM = '0, 30, 1, 55, 16, 28, 13, 9, 26';
  const presets = [
    { label: 'Direct hashing h(K) = K', src: 'L8 slides 5-6', cfg: mk('direct') },
    { label: 'Division mod 10: collision at 0', src: 'L8 slide 7', cfg: mk('division', { keys: '1, 4, 7, 9, 0, 8, 35, 30', m: '10', m2: '' }) },
    { label: 'mod 4 against the prime 7', src: 'L8 slide 9', cfg: mk('division') },
    { label: 'Multiplication k = 123, 150', src: 'L8 slides 10-11', cfg: mk('mult') },
    { label: 'Mid-square: the 5 examples', src: 'L8 slides 12-13', cfg: mk('midsq', { keys: '120:10, 50:100, 1234:1000, 110:200, 5642:1000' }) },
    { label: 'Folding: 3-digit parts', src: 'L8 slide 14', cfg: mk('fold', { r: '3' }) },
    { label: 'Folding: shift 80, boundary 98', src: 'L8 slide 15', cfg: mk('fold') },
    { label: 'Chaining: rehash at α > 2', src: 'L8 slides 47-48', cfg: mk('chain') },
    { label: 'Linear: delete by emptying breaks search', src: 'L8 slides 58-62', cfg: mk('linear', { ops: '7, 36, 18, 62, s18, x18, s62' }) },
    { label: 'Linear probing: search, Deleted, insert', src: 'L8 slides 58-64', cfg: mk('linear') },
    { label: 'Quadratic probing', src: 'L8 slides 67-72', cfg: mk('quad') },
    { label: 'Secondary clustering, mod 10', src: 'L8 slides 74-79', cfg: mk('quad', { ops: '2, 12, 22, 32, 42, 52, 62', m: '10' }) },
    { label: 'Double hashing, R = 7', src: 'L8 slides 80-87', cfg: mk('double') },
    { label: 'Exam: linear, m = 10', src: 'Midterm 2021 (notes)', cfg: mk('linear', { ops: EXAM, m: '10' }) },
    { label: 'Exam: quadratic, m = 10', src: 'Midterm 2021 (notes)', cfg: mk('quad', { ops: EXAM, m: '10' }) },
    { label: 'Exam: double, m = 10, R = 5 (55 fails)', src: 'Midterm 2021 (notes)', cfg: mk('double', { ops: EXAM, m: '10', R: '5' }) },
    { label: 'Exam: linear, m = 11', src: 'Midterm 2022 (notes)', cfg: mk('linear', { ops: EXAM, m: '11' }) },
    { label: 'Exam: quadratic, m = 11', src: 'Midterm 2022 (notes)', cfg: mk('quad', { ops: EXAM, m: '11' }) },
    { label: 'Exam: double, m = 11, R = 7', src: 'Midterm 2022 (notes)', cfg: mk('double', { ops: EXAM, m: '11', R: '7' }) }
  ];

  function Controls({ cfg, setCfg }) {
    const M = cfg.method, set = k => e => { const v = e.target.value; setCfg(c => ({ ...c, [k]: v })); };
    const setMethod = e => { const method = e.target.value; setCfg(c => {
      if (RES.includes(method) && RES.includes(c.method)) { const keep = { ...mk(method), ops: c.ops, m: c.m }; if (method === 'double' && !c.R) keep.R = DEF.double.R; if (method === 'chain') keep.ops = c.ops.split(/[\s,]+/).filter(t => !/^x/i.test(t)).join(', '); return keep; }
      return mk(method); }); };
    const sel = html`<label>Method<select aria-label="Method" value=${M} onChange=${setMethod}>${METHODS.map(([v, t]) => html`<option key=${v} value=${v}>${t}</option>`)}</select></label>`;
    const inp = (k, lab, wide, aria) => html`<label className=${wide ? 'tl-wide' : ''}>${lab}<input aria-label=${aria || lab} value=${cfg[k] == null ? '' : cfg[k]} onInput=${set(k)} /></label>`;
    if (M === 'direct') return html`${sel}${inp('keys', 'Keys', true)}${inp('m', 'Table size n')}`;
    if (M === 'division') return html`${sel}${inp('keys', 'Keys', true)}${inp('m', 'Size n')}${inp('m2', 'Compare with (blank: none)', false, 'Second table size')}`;
    if (M === 'mult') return html`${sel}${inp('keys', 'Keys (up to 4)', true)}${inp('n', 'n')}${inp('A', 'A (0 to 1)')}`;
    if (M === 'midsq') return html`${sel}${inp('keys', 'Keys (or key:n)', true)}${inp('n', 'Table size n')}`;
    if (M === 'fold') return html`${sel}${inp('key', 'Key K', true)}${inp('r', 'Address digits')}`;
    return html`${sel}${inp('ops', 'Operations', true)}${inp('m', 'Table size m')}${M === 'double' ? inp('R', 'Prime R (h₂)') : null}${M === 'chain' ? inp('thr', 'Rehash when α > (blank: never)', false, 'Load factor threshold') : null}
      <span className="lx-hash-help">A key inserts it; s18 searches for 18; d18 deletes 18${M === 'chain' ? ' (unlinks it)' : ' (leaves a Deleted marker); x18 deletes by just emptying the slot, the wrong way'}. Keys 0 to 999, m up to 13, at most 14 operations.</span>`;
  }

  const COST = {
    direct: 'h(K) = K: search, insert and delete O(1), but the array must be as large as the largest key (memory consuming). Keys 0 to 999, table up to 13 slots here.',
    division: 'h(k) = k mod n: fast, one operation. Choose n prime, not close to a power of 2 or 10: certain values of n (non-prime, 2^p) cause many collisions (slides 8-9). Up to 12 keys, sizes 2 to 13.',
    mult: 'h(k) = ⌊n (kA mod 1)⌋ with 0 < A < 1, computed exactly in decimal. The value of n is not critical; slower than division. In binary implementations m = 2^p.',
    midsq: 'r = the number of digits of n − 1. When k² has no exact middle of r digits, the slide takes one more middle digit and reduces mod n (5642² = 31832164 → 8321 % 1000 = 321). Slide 13 slips: it writes the range 0→199 for n = 1000 and "h(50)" for k = 110.',
    fold: 'Parts of r digits from the left (the last part may be shorter). Fold-shifting adds the parts; fold-boundary reverses the outer two first; the location is the sum mod 10^r.',
    chain: 'α = n/m. Search and delete expected O(1 + α) under simple uniform hashing, insert O(1); worst case O(n) when all keys share one chain. New keys are linked at the end of the chain, as on slide 47. Rehash (slides 47-48): when α exceeds the threshold, double m and rehash every key with k mod 2m. The slide lists chain 5 as "11, 5" and writes 1.67 for the new load factor; rehashing in chain order gives "5, 11" and α = 7/6 = 1.17.',
    linear: 'h(k, i) = (h′(k) + i) mod m, h′(k) = k mod m; HASH-INSERT and HASH-SEARCH stop after m probes (slides 52-53). Delete leaves a Deleted marker: Insert reuses it, Search walks past it (slide 54). Worst-case search O(table size); primary clustering. Expected probes ≤ 1/(1 − α).',
    quad: 'h(k, i) = (h′(k) + i²) mod m. No primary clustering, but secondary clustering: keys with the same h(k, 0) share the probe sequence. Keep the table at most half full and its size prime, otherwise insertion may fail (slide 79). Expected probes ≤ 1/(1 − α).',
    double: 'h(k, i) = (h₁(k) + i·h₂(k)) mod m with h₁(k) = k mod m and the slides\' h₂(k) = R − (k mod R), R a prime smaller than m (never 0). h₂ must be relatively prime to m so every cell can be probed: with m = 10, R = 5, h₂(55) = 5 only reaches 2 slots. No clustering; Θ(m²) probe sequences. Expected probes ≤ 1/(1 − α).'
  };

  window.LAB = window.LAB || {};
  window.LAB['hash'] = {
    meta: { title: 'Hashing', group: 'Data structures', icon: '#', desc: 'Hash functions, chaining and open addressing.', question: 'Where does a key go, and what happens when two keys want the same slot?',
      model: 'A hash function turns a key into a slot (direct, division, multiplication, mid-square, folding). Collisions are resolved by chaining (a list per slot) or open addressing (probe h(k, 0), h(k, 1), … inside the table).',
      watch: 'The probe sequence for each operation, the load factor α = n/m, and how Deleted markers keep searches going.' },
    defaults: mk('linear'),
    presets,
    Controls,
    build: cfg => cfg.method === 'chain' ? buildChain(cfg) : RES.includes(cfg.method) ? buildOA(cfg) : buildFn(cfg),
    Diagram: ({ f }) => f.kind === 'oa' ? html`<${OAView} f=${f} />` : f.kind === 'ch' ? html`<${ChainView} f=${f} />` : html`<${FnView} f=${f} />`,
    legend: [['color-mix(in srgb, var(--c) 30%, var(--paper))', 'Occupied'], ['var(--ok)', 'Inserted / found'], ['var(--pen)', 'Collision / mismatch'], ['#f2a93b', 'Deleted, walked past'], ['var(--faint)', 'Deleted marker']],
    cost: cfg => COST[cfg.method] || ''
  };
  // frames need a plain-text desc for the step history: derive it from the HTML caption
  const build0 = window.LAB['hash'].build;
  window.LAB['hash'].build = cfg => build0(cfg).map(f => ({ ...f, desc: f.desc || strip(f.html || '') }));
})();

/* ── amortized ── */
/* ── lab: amortized (Amortized analysis, Lecture 8 slides 16-29) ── */
// Table doubling (size 1, 2, 4, 8, ...; c_i = i if i − 1 is an exact power of 2, else 1) analysed by the three methods
// of the slides: aggregate (Σ c_i ≤ 3n), accounting ($3 per insert, bank never negative) and potential (Φ = 2i − size).
(function () {
  const { useState, useMemo, useEffect } = React;
  const html = htm.bind(React.createElement);
  const CSS = `
.lx-amortized-wrap{ max-width:620px; margin:0 auto; color:var(--ink); }
.lx-amortized-cap{ text-align:center; font-size:13px; color:var(--graphite); margin:0 0 6px; }
.lx-amortized-cap b{ color:var(--ink); }
.lx-amortized-arr{ display:flex; flex-wrap:wrap; gap:6px 3px; justify-content:center; }
.lx-amortized-cell{ width:31px; flex:0 0 31px; text-align:center; line-height:1.2; }
.lx-amortized-cell .lx-amortized-box{ box-sizing:border-box; width:31px; display:flex; align-items:center; justify-content:center; height:31px; border:1.5px solid var(--graphite); border-radius:5px; font-size:13.5px; font-weight:600; background:var(--paper); color:var(--ink); }
.lx-amortized-cell.lx-amortized-e .lx-amortized-box{ border-style:dashed; border-color:color-mix(in srgb, var(--graphite) 60%, var(--paper)); background:var(--paper-2); }
.lx-amortized-cell.copy .lx-amortized-box{ background:color-mix(in srgb, #f2a93b 30%, var(--paper)); border-color:#f2a93b; }
.lx-amortized-cell.new .lx-amortized-box{ background:color-mix(in srgb, var(--c) 26%, var(--paper)); border-color:var(--c); border-width:2.5px; }
.lx-amortized-cell i{ display:block; font-style:normal; font-size:12px; line-height:1.3; min-height:16px; color:#b07800; font-weight:700; letter-spacing:-.5px; }
.lx-amortized-bank{ display:flex; flex-wrap:wrap; justify-content:center; align-items:center; gap:4px; margin:10px 0 0; font-size:13.5px; }
.lx-amortized-coin{ display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:50%; background:#f2c94c; color:#3a2a00; font-size:12px; font-weight:800; border:1.5px solid #c9a227; }
.lx-amortized-coin.spare{ background:#f7dd8a; border-style:dashed; }
.lx-amortized-gauge{ max-width:420px; margin:10px auto 0; font-size:13.5px; }
.lx-amortized-gauge div{ height:14px; border-radius:7px; background:var(--paper-2); border:1px solid var(--line); overflow:hidden; margin-top:3px; }
.lx-amortized-gauge div i{ display:block; height:100%; background:var(--c); transition:width .4s; }
.lx-amortized-eq{ max-width:460px; margin:10px auto 0; padding:6px 10px; border-radius:9px; border:1px solid var(--line); background:var(--paper); font-size:14px; line-height:1.55; overflow-wrap:anywhere; }
.lx-amortized-eq b{ color:var(--c); }
.lx-amortized-tbl{ width:100%; max-width:460px; margin:10px auto 0; border-collapse:collapse; font-size:13px; }
.lx-amortized-tbl th, .lx-amortized-tbl td{ border:1px solid var(--line); padding:3px 4px; text-align:center; }
.lx-amortized-tbl th{ background:var(--paper-2); font-weight:600; }
.lx-amortized-tbl tr.exp td{ background:color-mix(in srgb, #f2a93b 14%, var(--paper)); }
.lx-amortized-tbl tr.cur td{ background:color-mix(in srgb, var(--c) 18%, var(--paper)); font-weight:700; }
.lx-amortized-tbl td.slip{ color:#d23c3c; font-weight:700; }
.lx-amortized-more{ text-align:center; font-size:12.5px; color:var(--graphite); margin-top:4px; }
.lx-amortized-sum{ max-width:460px; margin:10px auto 0; padding:7px 10px; border-radius:10px; border:1.5px solid var(--ok); background:color-mix(in srgb, var(--ok) 8%, var(--paper)); font-size:14px; line-height:1.55; }
.lx-amortized-wrap sup, .lx-amortized-wrap sub{ font-size:12px; line-height:0; }
.lx-amortized-flag{ max-width:460px; margin:8px auto 0; padding:6px 10px; border-radius:9px; border:1.5px solid #d23c3c; font-size:13px; line-height:1.5; }
`;
  if (!document.getElementById('lx-amortized-css')) { const s = document.createElement('style'); s.id = 'lx-amortized-css'; s.textContent = CSS; document.head.appendChild(s); }

  const pow2 = x => x > 0 && (x & (x - 1)) === 0;
  const sizeOf = i => { if (i < 1) return 0; let s = 1; while (s < i) s *= 2; return s; };
  const sub = (x, i) => `${x}<sub>${i}</sub>`;
  const text = h => h.replace(/<sub>(.*?)<\/sub>/g, '_$1').replace(/<sup>(.*?)<\/sup>/g, '^$1').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

  function rowsFor(n) {
    const R = []; let pp = 0, b = 0, sc = 0, sa = 0;
    const coins = [], st = { spare: 0 };
    for (let i = 1; i <= n; i++) {
      const s = sizeOf(i), ps = sizeOf(i - 1), exp = i > 1 && pow2(i - 1), copy = exp ? i - 1 : 0, c = 1 + copy, ph = 2 * i - s;
      // accounting: each old item spends its $1 on its copy; the new item gets $1, its partner i − s/2 gets $1
      let neg = false; if (exp) for (let j = 1; j < i; j++) { coins[j] = (coins[j] || 0) - 1; if (coins[j] < 0) neg = true; }
      coins[i] = 1; const partner = s >= 2 ? i - s / 2 : 0; if (partner >= 1) coins[partner] = (coins[partner] || 0) + 1; else st.spare++;
      b += 3 - c; sc += c; const a = c + ph - pp; sa += a;
      R.push({ i, s, ps, exp, copy, c, ph, pp, a, b, sc, sa, partner, coins: coins.slice(1, i + 1), spare: st.spare, neg });
      pp = ph;
    }
    return R;
  }

  function build(cfg) {
    const t = String(cfg.n).trim();
    if (!/^\d+$/.test(t) || +t < 1 || +t > 32) throw new Error('Enter how many inserts to make: a whole number from 1 to 32 (the table must fit a phone).');
    const n = +t, R = rowsFor(n), M = cfg.method, F = [];
    const base = r => ({ M, n, i: r ? r.i : 0, rows: R });
    const geo = []; for (let j = 1; j < n; j *= 2) geo.push(j);
    if (M === 'aggregate') {
      const met = r => [['Inserts so far', r ? r.i : 0], ['Table size', r ? r.s : 0], ['This insert c_i', r ? r.c : 0], ['Σ c_i', r ? r.sc : 0], ['Bound 3i', r ? 3 * r.i : 0]];
      F.push({ ...base(null), html: 'Aggregate method: insert n items into a dynamic table. When it is full, allocate a table <b>twice</b> as large, copy the old items, free the old table, then insert. One insert can cost O(n), so a simple analysis says n inserts cost n·O(n) = O(n<sup>2</sup>). Is that tight?', metrics: met(null) });
      for (const r of R) F.push({ ...base(r), html: r.i === 1 ? `Insert 1 into a table of size 1: ${sub('c', 1)} = 1.` : r.exp ? `Insert ${r.i}: i − 1 = ${r.i - 1} is an exact power of 2, so the table of size ${r.ps} is full. Double it to ${r.s}, copy ${r.copy} item${r.copy > 1 ? 's' : ''}, write the new one: ${sub('c', r.i)} = ${r.copy} + 1 = <b>${r.c}</b>. Σ c = ${r.sc} ≤ 3 × ${r.i} = ${3 * r.i}.` : `Insert ${r.i}: there is room in the table of size ${r.s}, so ${sub('c', r.i)} = <b>1</b>. Σ c = ${r.sc} ≤ 3 × ${r.i} = ${3 * r.i}.`, metrics: met(r) });
      const last = R[n - 1];
      F.push({ ...base(last), split: true, html: `Split each cost into 1 for writing plus the copies. The writes give n = ${n} ones; the copies happen only at i − 1 = 1, 2, 4, …: ${geo.length ? geo.join(' + ') + ' = ' + geo.reduce((x, y) => x + y, 0) : 'none yet'}, a <b>geometric series</b>, which is less than 2n.`, metrics: met(last) });
      F.push({ ...base(last), split: true, total: true, html: `Cost of n inserts = Σ ${sub('c', 'i')} ≤ (1 + 1 + … + 1) + (1 + 2 + 4 + …) ≤ n + 2n = <b>3n</b>. For n = ${n}: ${n} + ${geo.reduce((x, y) => x + y, 0)} = <b>${last.sc}</b> ≤ ${3 * n}. So n inserts cost O(n) and the amortized cost per insert is 3n/n = <b>3 = O(1)</b>.`, metrics: met(last) });
    } else if (M === 'accounting') {
      const met = r => [['Charged Σ ĉ = 3i', r ? 3 * r.i : 0], ['Real Σ c_i', r ? r.sc : 0], ['Bank b_i', r ? r.b : 0], ['Lowest bank so far', r ? Math.min(...R.slice(0, r.i).map(x => x.b)) : 0]];
      F.push({ ...base(null), html: 'Accounting method: charge every insert an amortized cost ĉ = <b>$3</b>, where $1 pays for 1 unit of work. $1 writes the new item, $1 is stored on the new item and $1 on one item in the first half of the table (its partner). Money not spent stays in the bank, which must never go negative.', metrics: met(null) });
      for (const r of R) {
        const prev = r.i > 1 ? R[r.i - 2].b : 0, slip = r.i === 10 ? ' (Slide 26 prints b<sub>10</sub> = 4: a slip, it is 5.)' : '';
        const coin = r.partner >= 1 ? `$1 to the new item ${r.i} and $1 to its partner, item ${r.partner}` : '$1 to the new item and $1 kept spare (there is no first half yet)';
        F.push({ ...base(r), slip: r.i === 10, html: r.exp
          ? `Insert ${r.i}: the table of size ${r.ps} is full. Every old item spends its $1 coin on its own copy (${r.copy} cop${r.copy > 1 ? 'ies' : 'y'}). Then $1 writes item ${r.i}, ${coin}. ${sub('b', r.i)} = ${prev} + 3 − ${r.c} = <b>${r.b}</b>.${slip}`
          : `Insert ${r.i}: $1 writes it, ${coin}. ${sub('b', r.i)} = ${prev} + 3 − 1 = <b>${r.b}</b>.${slip}`, metrics: met(r) });
      }
      const last = R[n - 1], low = Math.min(...R.map(x => x.b));
      F.push({ ...base(last), total: true, html: `Charging <b>$3</b> per insert pays for everything: the bank never went below ${low}${n > 1 ? ' (after each doubling it falls back to 3, because the coins on the items paid for the copies)' : ''}. So Σ c<sub>i</sub> = ${last.sc} ≤ Σ ĉ<sub>i</sub> = ${3 * n}: n inserts cost O(n), O(1) each. Note b<sub>i</sub> = Φ<sub>i</sub> + 1, the potential of the next method plus the spare coin.`, metrics: met(last) });
    } else {
      const met = r => [['Φ_i = 2i − size_i', r ? r.ph : 0], ['ĉ_i = c_i + ΔΦ', r ? r.a : '–'], ['Σ ĉ_i', r ? r.sa : 0], ['Σ c_i', r ? r.sc : 0]];
      F.push({ ...base(null), html: 'Potential method: store prepaid work as potential of the whole table, <b>Φ(h) = 2i − size</b> (i items). The amortized cost of insert i is <b>ĉ<sub>i</sub> = c<sub>i</sub> + Φ(h<sub>i</sub>) − Φ(h<sub>i−1</sub>)</b>; the empty table has Φ<sub>0</sub> = 0. Φ is 0 right after a doubling and reaches size when the table is full.', metrics: met(null) });
      for (const r of R) {
        const eq = r.i === 1 ? `ĉ<sub>1</sub> = 1 + (2 × 1 − 1) − 0 = <b>2</b>` : r.exp
          ? `Case 2, expansion: ĉ<sub>${r.i}</sub> = ${r.i} + (2 × ${r.i} − ${r.s}) − (2 × ${r.i - 1} − ${r.ps}) = ${r.i} + ${r.ph} − ${r.pp} = <b>${r.a}</b>`
          : `Case 1, normal: ĉ<sub>${r.i}</sub> = 1 + (2 × ${r.i} − ${r.s}) − (2 × ${r.i - 1} − ${r.s}) = 1 + ${r.ph} − ${r.pp} = <b>${r.a}</b>`;
        const why = r.i === 1 ? 'The first insert is the one exception (Φ<sub>0</sub> = 0, as in the slide 29 table).' : r.exp ? `The full table had Φ = ${r.pp} = i − 1 stored, enough for the ${r.copy} cop${r.copy > 1 ? 'ies' : 'y'}; after the doubling Φ = ${r.ph}. In general c<sub>i</sub> = i, size goes s → 2s with s = i − 1, so ĉ = i + 2 − (i − 1) = 3.` : 'The 2i grows by 2 and the size is unchanged, so ΔΦ = 2 and ĉ = 1 + 2 = 3.';
        F.push({ ...base(r), eq, slip28: r.exp && r.i === 2, html: `Insert ${r.i}${r.exp ? `: the table doubles from ${r.ps} to ${r.s}, c<sub>${r.i}</sub> = ${r.c}` : `: c<sub>${r.i}</sub> = 1`}. Φ<sub>${r.i}</sub> = 2 × ${r.i} − ${r.s} = ${r.ph}. ${eq}. ${why}`, metrics: met(r) });
      }
      const last = R[n - 1];
      F.push({ ...base(last), total: true, slip28: true, html: `Every amortized cost is 3 except the first (2). So Σ c<sub>i</sub> ≤ Σ ĉ<sub>i</sub> = ${last.sa} ≤ 3n = ${3 * n}, because Φ<sub>n</sub> = ${last.ph} ≥ 0 = Φ<sub>0</sub>. Each insert is <b>O(1)</b> amortized. Slide 28's expansion case writes (i + 1) + Φ(2i − 2i) − Φ(2(i−1) − i): each Φ term is off by 2 and the two slips cancel, so its 3 is still right.`, metrics: met(last) });
    }
    F.forEach(f => f.desc = text(f.html));
    return F;
  }

  const H = s => ({ __html: s });
  function Table({ f }) {
    const r = f.i ? f.rows[f.i - 1] : null, s = r ? r.s : 0;
    const cells = Array.from({ length: Math.max(s, 1) }, (_, j) => {
      const x = j + 1, filled = r && x <= r.i;
      let c = filled ? '' : ' lx-amortized-e';
      if (r && x === r.i && !f.total && !f.split) c = ' new'; else if (r && r.exp && x < r.i && !f.total && !f.split) c = ' copy';
      const coin = f.M === 'accounting' && filled ? '$'.repeat(r.coins[j]) : '';
      return html`<div key=${j} className=${'lx-amortized-cell' + c}><div className="lx-amortized-box">${filled ? x : '\u00a0'}</div>${f.M === 'accounting' ? html`<i>${coin}</i>` : null}</div>`;
    });
    return html`<div><div className="lx-amortized-cap">${r ? html`table size <b>${s}</b>, holding <b>${r.i}</b> item${r.i > 1 ? 's' : ''}${r.exp && !f.total && !f.split ? html`, just doubled from ${r.ps}: <b>${r.copy}</b> copied` : null}` : 'empty table, size 0'}</div>
      ${r ? html`<div className="lx-amortized-arr">${cells}</div>` : null}</div>`;
  }
  function Rows({ f }) {
    const k = f.i, M = f.M, all = f.rows.slice(0, k), from = Math.max(0, all.length - 17), R = all.slice(from);
    if (!k) return null;
    const head = M === 'aggregate' ? html`<tr><th>i</th><th>size<sub>i</sub></th><th>c<sub>i</sub></th>${f.split ? html`<th>1 + copies</th>` : null}<th>Σ c</th></tr>`
      : M === 'accounting' ? html`<tr><th>i</th><th>s<sub>i</sub></th><th>c<sub>i</sub></th><th>ĉ<sub>i</sub></th><th>b<sub>i</sub></th></tr>`
      : html`<tr><th>i</th><th>size</th><th>C<sub>i</sub></th><th>Φ<sub>i</sub></th><th>C<sub>i</sub> + Φ<sub>i</sub> − Φ<sub>i−1</sub></th></tr>`;
    const row = r => M === 'aggregate' ? html`<td>${r.i}</td><td>${r.s}</td><td>${r.c}</td>${f.split ? html`<td>${r.copy ? '1 + ' + r.copy : '1'}</td>` : null}<td>${r.sc}</td>`
      : M === 'accounting' ? html`<td>${r.i}</td><td>${r.s}</td><td>${r.c}</td><td>3</td><td className=${r.i === 10 ? 'slip' : ''}>${r.b}${r.i === 10 ? ' (slide: 4)' : ''}</td>`
      : html`<td>${r.i}</td><td>${r.s}</td><td>${r.c}</td><td>2 × ${r.i} − ${r.s} = ${r.ph}</td><td>${r.c} + (${r.ph} − ${r.pp}) = <b>${r.a}</b></td>`;
    return html`<div>${from ? html`<div className="lx-amortized-more">rows 1 to ${from} above</div>` : null}<table className="lx-amortized-tbl"><thead>${head}</thead><tbody>${R.map(r => html`<tr key=${r.i} className=${(r.i === k && !f.total && !f.split ? 'cur' : '') + (r.exp ? ' exp' : '')}>${row(r)}</tr>`)}</tbody></table></div>`;
  }
  function Diagram({ f }) {
    const r = f.i ? f.rows[f.i - 1] : null;
    let mid = null;
    if (f.M === 'accounting' && r) mid = html`<div className="lx-amortized-bank" aria-label=${'bank ' + r.b}>bank${r.coins.map((c, j) => Array.from({ length: c }, (_, q) => html`<span key=${j + '-' + q} className="lx-amortized-coin">$</span>`))}${Array.from({ length: r.spare }, (_, q) => html`<span key=${'s' + q} className="lx-amortized-coin spare">$</span>`)}<b> = $${r.b}</b></div>`;
    if (f.M === 'potential' && r) mid = html`<div><div className="lx-amortized-gauge">Φ = 2 × ${r.i} − ${r.s} = <b>${r.ph}</b> (of at most ${r.s})<div><i style=${{ width: (r.s ? r.ph / r.s * 100 : 0) + '%' }}></i></div></div>${f.eq && !f.total ? html`<div className="lx-amortized-eq" dangerouslySetInnerHTML=${H(f.eq)}></div>` : null}</div>`;
    const sumBox = f.total ? html`<div className="lx-amortized-sum" dangerouslySetInnerHTML=${H(f.M === 'aggregate' ? `Σ c<sub>i</sub> = ${r.sc} ≤ n + 2n = ${3 * f.n}<br/>amortized cost ≤ 3n / n = <b>3 = O(1)</b>` : f.M === 'accounting' ? `Σ c<sub>i</sub> = ${r.sc} ≤ Σ ĉ<sub>i</sub> = 3n = ${3 * f.n}<br/>bank never below 0: <b>O(1)</b> per insert` : `Σ ĉ<sub>i</sub> = ${r.sa} = Σ c<sub>i</sub> + Φ<sub>n</sub> − Φ<sub>0</sub> = ${r.sc} + ${r.ph}<br/>ĉ<sub>i</sub> = 3 (2 for i = 1): <b>O(1)</b> per insert`)}></div>` : null;
    const flag = f.M === 'accounting' && f.n >= 10 && f.i >= 10 ? html`<div className="lx-amortized-flag">Slide 26's table prints b<sub>10</sub> = 4. With b<sub>9</sub> = 3, c<sub>10</sub> = 1 and ĉ = 3 the bank is 3 + 3 − 1 = <b>5</b>.</div>`
      : f.M === 'aggregate' && f.total && f.n >= 10 ? html`<div className="lx-amortized-flag">Slide 23 writes the sum as (1 + 2 + 3 + 5 + 1 + 1 + 9 + 1 …)/n: it drops the two 1s of inserts 4 and 8. The full sum for 10 inserts is 1+2+3+1+5+1+1+1+9+1 = 25.</div>`
      : f.M === 'potential' && f.slip28 ? html`<div className="lx-amortized-flag">Slide 28, expansion case: it writes ĉ = (i+1) + Φ(2i − 2i) − Φ(2(i−1) − i). After the doubling Φ = 2(i+1) − 2i = 2, before it Φ = 2i − i = i; both printed terms are 2 too small, so the slips cancel and ĉ = 3 holds.</div>` : null;
    return html`<div className="lx-amortized-wrap"><${Table} f=${f} />${mid}${sumBox}${flag}<${Rows} f=${f} /></div>`;
  }

  window.LAB = window.LAB || {};
  window.LAB['amortized'] = {
    meta: { title: 'Amortized analysis', group: 'Data structures', icon: '↗', desc: 'Table doubling: aggregate, accounting, potential.', question: 'How can an insert that sometimes copies the whole table cost O(1) on average?',
      model: 'The table doubles when full (1, 2, 4, 8, …). Insert i costs c_i = i when i − 1 is an exact power of 2 (i − 1 copies + 1 write), otherwise 1. Aggregate: total ≤ 3n. Accounting: charge $3, keep the change as coins. Potential: Φ = 2i − size pays for the copies.',
      watch: 'The expensive inserts are rare: each one is paid by the cheap inserts since the last doubling.' },
    defaults: { method: 'aggregate', n: '10' },
    presets: [
      { label: 'Aggregate method, 10 inserts', src: 'L8 slides 17-23', cfg: { method: 'aggregate', n: '10' } },
      { label: 'Accounting method, $3 per insert', src: 'L8 slides 24-26', cfg: { method: 'accounting', n: '10' } },
      { label: 'Potential method, 17 inserts', src: 'L8 slides 27-29', cfg: { method: 'potential', n: '17' } },
      { label: 'Exam: n inserts cost < 3n', src: 'Midterm 2018 Q6, Final 2019 Q2, Final Summer Q28', cfg: { method: 'aggregate', n: '17' } }
    ],
    Controls: ({ cfg, setCfg }) => html`<label>Method<select value=${cfg.method} onChange=${e => { const m = e.target.value; setCfg(c => ({ ...c, method: m })); }}><option value="aggregate">Aggregate method</option><option value="accounting">Accounting (banker's) method</option><option value="potential">Potential method</option></select></label>
      <label>Inserts n (1 to 32)<input value=${cfg.n} inputMode="numeric" onInput=${e => { const v = e.target.value; setCfg(c => ({ ...c, n: v })); }} /></label>`,
    build,
    Diagram,
    legend: [['color-mix(in srgb, var(--c) 26%, var(--paper))', 'New item'], ['color-mix(in srgb, #f2a93b 30%, var(--paper))', 'Copied on doubling'], ['#f2c94c', '$1 coin (accounting)'], ['#d23c3c', 'Slide slip']],
    cost: 'A single insert costs Θ(n) in the worst case, but n inserts cost at most 3n: Θ(1) amortized per insert, by all three methods. Conventions of the slides: the table starts at size 1 and doubles; c_i counts 1 per write and 1 per copied item; Φ(h) = 2i − size with Φ₀ = 0 for the empty table (so ĉ₁ = 2, as in slide 29). The accounting coins follow the slides\' $3 = $1 write + $1 on the new item + $1 on a partner in the first half; the first insert has no partner, so its third dollar stays spare and b_i = Φ_i + 1.'
  };
})();

/* ── skip ── */
/* ── lab: Skip lists (L13) ── */
// Perfect skip lists (slides 4-10) with Find, randomized skip lists with insert by coin flips and delete (slides 11-17),
// and the backwards analysis of the search path, C(j) = 2j (slides 19-22). Find follows the slides' rule: if k = key, done;
// if k < next key, go down a level; if k ≥ next key, go right. Every preset reproduces a slide.
(function () {
  const { useState, useMemo, useEffect } = React;
  const html = htm.bind(React.createElement);
  const CSS = `
.lx-skip-wrap{ display:flex; flex-direction:column; gap:10px; align-items:center; color:var(--ink); }
.lx-skip-svg{ display:block; width:100%; height:auto; margin:0 auto; }
.lx-skip-cmp{ font-family:var(--mono); font-size:15px; text-align:center; line-height:1.5; }
.lx-skip-cmp b{ font-size:17px; }
.lx-skip-yes{ color:var(--ok); font-weight:700; }
.lx-skip-no{ color:var(--pen); font-weight:700; }
.lx-skip-coins{ display:flex; flex-wrap:wrap; gap:6px; justify-content:center; align-items:center; font-size:14px; }
.lx-skip-coin{ width:30px; height:30px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-weight:700; font-size:14px; border:2px solid #f2a93b; background:color-mix(in srgb, #f2a93b 22%, var(--paper)); color:var(--ink); }
.lx-skip-coin.t{ border-color:var(--faint); background:var(--paper-2); }
.lx-skip-ask{ display:flex; flex-wrap:wrap; gap:8px; justify-content:center; }
.lx-skip-ask button{ font:inherit; font-size:14px; font-weight:600; padding:7px 14px; border-radius:8px; border:1px solid var(--c); background:color-mix(in srgb, var(--c) 14%, var(--paper)); color:var(--ink); cursor:pointer; }
.lx-skip-tbl{ border-collapse:collapse; font-size:14px; margin:0 auto; }
.lx-skip-tbl td, .lx-skip-tbl th{ border:1px solid var(--line); padding:4px 9px; text-align:center; }
.lx-skip-tbl th{ font-weight:600; color:var(--graphite); font-size:13px; }
.lx-skip-tbl sup{ font-size:12px; }
.lx-skip-tbl tr.on td{ background:color-mix(in srgb, var(--c) 14%, var(--paper)); font-weight:700; }
.lx-skip-eq{ font-family:var(--mono); font-size:15px; text-align:center; line-height:1.7; }
.lx-skip-eq div{ opacity:.55; } .lx-skip-eq div.on{ opacity:1; font-weight:700; }
.lx-skip-help{ font-size:12px; color:var(--graphite); flex-basis:100%; line-height:1.4; }
.lx-skip-ctl button{ font:inherit; font-size:.8rem; padding:9px 10px; border:1px solid var(--line); background:var(--paper); color:var(--ink); border-radius:7px; min-height:37px; cursor:pointer; }
`;
  if (!document.getElementById('lx-skip-css')) { const s = document.createElement('style'); s.id = 'lx-skip-css'; s.textContent = CSS; document.head.appendChild(s); }
  const strip = s => String(s).replace(/<sub>(.*?)<\/sub>/g, '$1').replace(/<sup>(.*?)<\/sup>/g, '^$1').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  const MAXN = 12, MAXH = 5;

  /* ── input ── */
  function keysIn(txt, auto) {
    const tok = String(txt || '').split(/[\s,]+/).filter(Boolean);
    if (!tok.length) throw new Error('Type at least one key, e.g. 2, 10, 15, 16, 31, 71, 96.');
    if (tok.length > MAXN) throw new Error(`At most ${MAXN} keys, so the list fits a phone.`);
    const seen = new Set();
    const L = tok.map(t => { const m = /^(\d{1,2})(?::(\d))?$/.exec(t); if (!m) throw new Error(`"${t}" is not understood: type keys 1 to 99${auto ? '' : ', optionally with a height, e.g. 16:4'}.`);
      const k = +m[1]; if (k < 1) throw new Error('Keys must be 1 to 99.'); if (seen.has(k)) throw new Error(`${k} appears twice: a skip list holds distinct keys.`); seen.add(k);
      if (m[2] && auto) throw new Error('A perfect skip list sets the heights itself: type the keys without :height (use Randomized to give heights).');
      const h = m[2] ? +m[2] : 1; if (h < 1 || h > MAXH) throw new Error(`Heights must be 1 to ${MAXH}.`); return { k, h }; });
    L.sort((a, b) => a.k - b.k);
    return L;
  }
  // perfect skip list as on slides 4 and 7: while a level has more than 3 keys, the next level keeps every other key (1st, 3rd, …);
  // when 2 or 3 keys remain, the middle one goes alone on top
  function perfect(L) {
    let cur = L.map((_, j) => j), h = 1; L.forEach(o => { o.h = 1; });
    while (cur.length > 1) { h++; const nx = cur.length > 3 ? cur.filter((_, q) => q % 2 === 0) : [cur[Math.floor(cur.length / 2)]]; nx.forEach(j => { L[j].h = h; }); cur = nx; if (h >= MAXH) break; }
    return L;
  }
  function opsIn(txt, method) {
    const tok = String(txt || '').split(/[\s,]+/).filter(Boolean);
    if (!tok.length) throw new Error(method === 'back' ? 'Type the key whose search path to analyse, e.g. 86.' : 'Type at least one operation, e.g. f71.');
    if (tok.length > 8) throw new Error('At most 8 operations, so the steps stay readable.');
    return tok.map((t, ti) => { const m = /^([fsid]?)(\d{1,2})(?::([HT?]*))?$/i.exec(t);
      if (!m || +m[2] < 1) throw new Error(`"${t}" is not understood: f71 finds 71, i87:HHT inserts 87 with coin flips heads, heads, tails (i87 flips at random, i87:? lets you flip), d87 deletes 87. Keys 1 to 99.`);
      const c = (m[1] || 'f').toLowerCase(), t2 = c === 's' ? 'f' : c, fl = (m[3] || '').toUpperCase();
      if (m[3] != null && t2 !== 'i') throw new Error(`"${t}": coin flips only go with an insert, e.g. i87:HHT.`);
      if (fl && !/^H*(T|\?)$/.test(fl)) throw new Error(`"${t}": the flips are heads (H) until the first tails (T) ends them, e.g. HHT; end with ? to flip the coin yourself.`);
      if (fl && (fl.match(/H/g) || []).length > MAXH - 1) throw new Error(`"${t}": at most ${MAXH - 1} heads (${MAXH} levels), so the list fits a phone.`);
      if (method === 'perfect' && t2 !== 'f') throw new Error('A perfect skip list only supports Find here: inserting or deleting one key can force rearranging the entire list (slide 11). Choose Randomized to insert and delete.');
      if (method === 'back' && (t2 !== 'f' || tok.length > 1)) throw new Error('The backwards analysis follows one search: type a single key, e.g. 86.');
      return { t: t2, k: +m[2], fl: m[3] == null ? null : fl, ti, raw: t }; });
  }
  // deterministic coin for "random" flips: the seed comes from cfg, so frames are pure data
  function coins(seed, k, ti) { let a = (Number(seed) || 1) * 2654435761 + k * 40503 + ti * 977 >>> 0; const r = () => { a = a + 0x6D2B79F5 >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    let s = ''; while (s.length < MAXH - 1) { const c = r() < 0.5 ? 'H' : 'T'; s += c; if (c === 'T') break; } if (!s.endsWith('T')) s += 'T'; return s; }

  /* ── engine ── */
  const levelsOf = L => Math.max(1, ...L.map(o => o.h));
  const nm = (L, j) => j < 0 ? 'the header' : j >= L.length ? 'the sentinel' : String(L[j].k);
  function search(L, k, levels, tag) {
    const S = [], upd = [], per = {}; let c = -1, l = levels - 1, comps = 0; const trail = [[-1, l]];
    const met = () => [['Operation', tag], ['Comparisons', comps], ['Level', l], ['Comparisons on this level', per[l] || 0], ['Levels', levels]];
    for (;;) {
      let nx = c + 1; while (nx < L.length && L[nx].h <= l) nx++;
      const nk = nx >= L.length ? '∞' : L[nx].k, less = nx >= L.length || k < L[nx].k;
      comps++; per[l] = (per[l] || 0) + 1;
      const q = `${k} < ${nk === '∞' ? 'Inf' : nk}?`;
      if (less) {
        upd[l] = c;
        if (l === 0) { S.push({ c, l, cmp: [c, nx, l], trail: trail.slice(), cmpT: [q, 'Yes', 'not found'], html: `At ${nm(L, c)}, level 0: ${q.replace('<', '&lt;')} <b>Yes</b>, and this is the bottom level: <b>${k} is not in the list</b>; it would go right after ${nm(L, c)}.`, metrics: met() }); return { S, upd, found: false, trail, comps, per }; }
        S.push({ c, l, cmp: [c, nx, l], trail: trail.slice(), cmpT: [q, 'Yes', 'go down'], html: `At ${nm(L, c)}, level ${l}: ${q.replace('<', '&lt;')} <b>Yes</b>, so ${k} is before the next key: go <b>down</b> to level ${l - 1}.`, metrics: met() });
        l--; trail.push([c, l]);
      } else {
        S.push({ c, l, cmp: [c, nx, l], trail: trail.slice(), cmpT: [q, 'No', 'go right'], html: `At ${nm(L, c)}, level ${l}: ${q.replace('<', '&lt;')} <b>No</b> (${k} ≥ ${nk}): go <b>right</b> to ${nk}.`, metrics: met() });
        c = nx; trail.push([c, l]);
        if (L[c].k === k) { S.push({ c, l, cmp: null, trail: trail.slice(), found: true, cmpT: [`${k} = ${k}`, '', 'found'], html: `k = key: <b>found ${k}</b> on level ${l}, after ${comps} comparison${comps > 1 ? 's' : ''} (at most ${Math.max(...Object.values(per))} on any level).`, metrics: met() }); return { S, upd, found: c, trail, comps, per }; }
      }
    }
  }

  function build(cfg) {
    const M = cfg.method;
    let L = keysIn(cfg.keys, M === 'perfect');
    if (M === 'perfect') L = perfect(L);
    const ops = opsIn(cfg.ops, M);
    const F = [];
    const snap = (list, extra) => ({ list: list.map(o => ({ ...o })), levels: Math.max(levelsOf(list), extra && extra.minLv || 0), ...extra });
    if (M === 'perfect') {
      const lv = levelsOf(L);
      for (let s = 1; s <= lv; s++) {
        const on = L.filter(o => o.h >= s).map(o => o.k);
        F.push(snap(L, { show: s, html: s === 1 ? `<b>Level 0</b>: all keys in sorted order, ${on.join(', ')}, from the <b>header</b> (green) to the <b>sentinel</b> (red): an ordinary sorted linked list.` : `<b>Level ${s - 1}</b>: ${on.length === 1 ? `only ${on[0]}, the middle key of the level below` : `every other key of level ${s - 2}: ${on.join(', ')}`}. Each higher level contains about 1/2 the elements of the level below.${s === lv ? ` So there are O(log n) levels (${lv} for n = ${L.length}); header and sentinel are in every level.` : ''}`,
          metrics: [['Keys n', L.length], ['Levels', lv], [`Keys on level ${s - 1}`, on.length]], inv: 'A perfect skip list: like a perfect binary tree, each level halves the one below.' }));
      }
    } else {
      const cnt = l => L.filter(o => o.h > l).length;
      F.push(snap(L, { html: M === 'back' ? `<b>Skip list analysis</b>: expected number of levels = O(log n), since E[# nodes at level i] = n/2<sup>i</sup>. This list has n = ${L.length}: levels 1, 2, 3 hold ${[1, 2, 3].map(cnt).join(', ')} nodes (expected ${[1, 2, 3].map(i => +(L.length / 2 ** i).toFixed(2)).join(', ')}). We still need the number of steps on each level to be small.` : `<b>Randomized skip list</b>: each node is promoted to the next higher level with probability 1/2, so we expect 1/2 the nodes at level 1, 1/4 at level 2, …: the same as a perfect skip list on average.`,
        tbl: M === 'back' ? Array.from({ length: Math.max(0, levelsOf(L) - 1) }, (_, i) => [i + 1, +(L.length / 2 ** (i + 1)).toFixed(2), cnt(i + 1)]) : null,
        metrics: [['Keys n', L.length], ['Levels', levelsOf(L)]], inv: 'The level structure depends only on the coin flips, not on the keys: there are no bad input sequences.' }));
    }
    for (const op of ops) {
      const lv = levelsOf(L);
      if (op.t === 'f') {
        const r = search(L, op.k, lv, `Find ${op.k}`);
        F.push(snap(L, { cur: [-1, lv - 1], trail: [], html: `<b>Find ${op.k}</b>: start at the top level of the header. If k = key, done! If k &lt; next key, go down a level. If k ≥ next key, go right.`, metrics: [['Operation', `Find ${op.k}`], ['Comparisons', 0], ['Levels', lv]], inv: 'At most 2 nodes are visited per level in a perfect skip list: if you visited more, you could have done it one level higher up.' }));
        if (M === 'perfect' && L.map(o => o.k).join(', ') === FINDL) r.S.forEach(s => { if (op.k === 71 && s.l === 1 && s.c >= 0 && L[s.c].k === 31 && s.cmp) s.html += ' (Slide 7 writes "71 &lt; 96?" here, but the next key on level 1 after 31 is 76.)'; if (op.k === 96 && s.l === 0 && s.c >= 0 && L[s.c].k === 91 && s.cmp) s.html += ' (Slide 9 writes this test as "96 ≤ 96?".)'; });
        r.S.forEach(s => F.push(snap(L, { ...s, cur: [s.c, s.l], hot: s.found ? op.k : null, inv: 'The dashed path is the current location; the blue arrow is the comparison with the next key on this level.' })));
        if (M === 'back') backwards(F, L, r, op.k, snap);
        else { const last = F[F.length - 1]; last.html += ` Search time: O(log n) levels, and at most 2 nodes visited per level, so <b>O(log n)</b>.`; }
        continue;
      }
      if (op.t === 'i') {
        if (L.some(o => o.k === op.k)) { const r = search(L, op.k, lv, `Insert ${op.k}`); r.S.forEach(s => F.push(snap(L, { ...s, cur: [s.c, s.l], hot: s.found ? op.k : null }))); F[F.length - 1].html += ` ${op.k} is already in the list: nothing to insert.`; continue; }
        if (L.length >= MAXN) throw new Error(`At most ${MAXN} keys, so the list fits a phone: delete one before inserting ${op.k}.`);
        const rnd = op.fl === null || op.fl === '';
        const fl = rnd ? coins(cfg.seed, op.k, op.ti) : op.fl;
        const r = search(L, op.k, lv, `Insert ${op.k}`);
        F.push(snap(L, { cur: [-1, lv - 1], trail: [], html: `<b>Insert ${op.k}</b>: first find k, remembering the last node visited on each level (the new node goes right after it).`, metrics: [['Operation', `Insert ${op.k}`], ['Levels', lv]] }));
        r.S.forEach(s => F.push(snap(L, { ...s, cur: [s.c, s.l] })));
        const at = r.upd[0] + 1, node = { k: op.k, h: 1 }, NL = [...L.slice(0, at), node, ...L.slice(at)];
        const met = (fs, h) => [['Operation', `Insert ${op.k}`], ['Coin flips', fs || 'none yet'], ['Height of ' + op.k, h], ['Levels', Math.max(lv, h)], ['Keys n', NL.length]];
        F.push(snap(NL, { hot: op.k, flips: '', minLv: lv, html: `<b>Insert node ${op.k} in level 0</b>, just a linked-list insertion after the last visited node, ${nm(L, r.upd[0])}. Let i = 1; while FLIP() == heads: insert the node into level i, i++.`, metrics: met('', 1) }));
        let h = 1, asked = false;
        for (let q = 0; q < fl.length; q++) {
          const c = fl[q], done = fl.slice(0, q);
          if (c === '?') { F.push(snap(NL, { hot: op.k, flips: done, minLv: lv, ask: { ti: op.ti, done, k: op.k }, html: `<b>Your turn: FLIP()</b>. Heads promotes ${op.k} into level ${h}; tails stops. ${ops.length > op.ti + 1 ? 'The remaining operations wait for your flips.' : ''}`, metrics: met(done, h) })); asked = true; break; }
          if (c === 'H') { const prev = r.upd[h] != null ? nm(L, r.upd[h]) : 'the header'; h++; node.h = h;
            F.push(snap(NL, { hot: op.k, flips: done + c, minLv: lv, html: `FLIP() = <b>heads</b>${rnd ? ' (random)' : ''}: insert the node into <b>level ${h - 1}</b>, a linked-list insertion after the last visited node in level ${h - 1} (${prev}); i++.`, metrics: met(done + c, h) }));
          }
          else F.push(snap(NL, { hot: op.k, flips: done + c, minLv: lv, html: `FLIP() = <b>tails</b>${rnd ? ' (random)' : ''}: stop. ${op.k} has ${h} level${h > 1 ? 's' : ''} (0${h > 1 ? ' to ' + (h - 1) : ''}). Probability of reaching height ≥ ${h}: 1/2<sup>${h - 1}</sup>.`, metrics: met(done + c, h) }));
        }
        L = NL;
        if (asked) return F;
        continue;
      }
      // delete
      const r = search(L, op.k, lv, `Delete ${op.k}`);
      F.push(snap(L, { cur: [-1, lv - 1], trail: [], html: `<b>Delete ${op.k}</b>: first find it.`, metrics: [['Operation', `Delete ${op.k}`], ['Levels', lv]] }));
      r.S.forEach(s => F.push(snap(L, { ...s, cur: [s.c, s.l], hot: s.found ? op.k : null })));
      if (r.found === false) { F[F.length - 1].html += ' Nothing to delete.'; continue; }
      const h = L[r.found].h, NL = L.filter(o => o.k !== op.k);
      F.push(snap(L, { fade: op.k, html: `<b>Delete ${op.k}</b>: splice it out of every level in which it appears (level${h > 1 ? 's 0 to ' + (h - 1) : ' 0'}): on each level its predecessor now points past it. Expected O(log n).`, metrics: [['Operation', `Delete ${op.k}`], ['Levels spliced', h], ['Keys n', NL.length]] }));
      L = NL;
      F.push(snap(L, { html: `${op.k} is gone; every level is again a sorted linked list.`, metrics: [['Operation', `Delete ${op.k}`], ['Keys n', L.length], ['Levels', levelsOf(L)]] }));
    }
    return F;
  }

  // slides 19-22: walk the search path in reverse; up when the node has a higher level, otherwise left
  function backwards(F, L, r, k, snap) {
    const T = r.trail, rev = [], mv = [];
    for (let q = T.length - 1; q >= 0; q--) { rev.push(T[q]); if (q < T.length - 1) { const a = T[q + 1], b = T[q]; mv.push(a[0] === b[0] ? 'up' : 'left'); } }
    const lv = levelsOf(L), j = T[0][1] - T[T.length - 1][1];
    const per = {}; let level = T[T.length - 1][1], ups = 0, lefts = 0;
    const tbl = () => Array.from({ length: j + 1 }, (_, i) => [T[T.length - 1][1] + i, per[T[T.length - 1][1] + i] || 0]);
    const nodeName = p => p[0] < 0 ? 'the header' : String(L[p[0]].k);
    F.push(snap(L, { trail: T, rtrail: [rev[0]], cur: rev[0], hot: r.found !== false ? k : null, back: tbl(), backLv: level, html: `<b>Backwards analysis</b>: consider the <b>reverse</b> of the path you took to find ${k}, from ${nodeName(rev[0])} on level ${rev[0][1]} back to the top of the header (${j} level${j === 1 ? '' : 's'} to climb). Note that you always move up if you can, because a find enters a node from its topmost level.`, metrics: [['Reverse steps', 0], ['Up', 0], ['Left', 0], ['Levels to climb j', j], ['Expected 2j', 2 * j]] }));
    for (let s = 0; s < mv.length; s++) {
      per[level] = (per[level] || 0) + 1;
      if (mv[s] === 'up') { ups++; } else lefts++;
      const from = rev[s], to = rev[s + 1];
      const row = level;
      if (mv[s] === 'up') level++;
      F.push(snap(L, { trail: T, rtrail: rev.slice(0, s + 2), cur: to, hot: r.found !== false ? k : null, back: tbl(), backLv: row, html: `Reverse step ${s + 1}: move <b>${mv[s]}</b> ${mv[s] === 'up' ? `from level ${from[1]} to ${to[1]} at ${nodeName(from)}, which has a higher level (probability 0.5)` : `from ${nodeName(from)} to ${nodeName(to)} on level ${from[1]}: ${nodeName(from)} goes no higher (probability 0.5)`}.${s === mv.length - 1 ? ` Back at the header: <b>${mv.length} steps to climb ${j} levels</b> (expected 2j = ${2 * j}).` : ''}`, metrics: [['Reverse steps', s + 1], ['Up', ups], ['Left', lefts], ['Levels to climb j', j], ['Expected 2j', 2 * j]] }));
    }
    const eq = ['C(j) = 1 + 0.5 C(j−1) + 0.5 C(j)', '2C(j) = 2 + C(j−1) + C(j)', 'C(j) = 2 + C(j−1)', 'C(j) = 2j'];
    const caps = [
      'At each step of the reverse walk the probability that you can move up is <b>0.5</b>. Make one step, then either C(j−1) more steps if it went up [prob 0.5], or C(j) more if it went left [prob 0.5]: <b>C(j) = 1 + 0.5 C(j−1) + 0.5 C(j)</b>.',
      'Multiply by 2: <b>2C(j) = 2 + C(j−1) + C(j)</b>.',
      'Subtract C(j): <b>C(j) = 2 + C(j−1)</b>. The expected number of steps at each level is 2.',
      `Expanding gives <b>C(j) = 2j</b> (C(0) = 0). Since there are O(log n) levels, a search takes <b>O(log n)</b> steps, expected. Here j = ${j}: expected ${2 * j} steps, this path took ${mv.length}.`
    ];
    caps.forEach((c, q) => F.push(snap(L, { trail: T, rtrail: rev, cur: rev[rev.length - 1], back: tbl(), eq: eq.slice(0, q + 1), html: c, metrics: [['Reverse steps', mv.length], ['Up', ups], ['Left', lefts], ['Levels to climb j', j], ['Expected 2j', 2 * j]] })));
  }

  /* ── drawing: header (green), towers, sentinel (red); each level's forward pointer is an arrow ── */
  function SL({ f }) {
    const list = f.list, n = list.length, levels = f.levels, show = f.show || levels;
    const BW = 34, G = 9, HW = 18, P = BW + G;
    const W = 8 + HW + G + n * P + HW + 8, fs = Math.max(15, 12.4 * W / 290), RH = Math.max(32, fs * 1.4);
    const top = 8, base = top + levels * RH, Hh = base + 8;
    const xl = j => j < 0 ? 8 : j >= n ? 8 + HW + G + n * P : 8 + HW + G + j * P, wd = j => j < 0 || j >= n ? HW : BW;
    const yl = l => base - l * RH - RH / 2, hOf = j => j < 0 || j >= n ? levels : list[j].h;
    const cmp = f.cmp, arrows = [];
    for (let l = 0; l < Math.min(show, levels); l++) {
      let a = -1;
      for (let j = 0; j <= n; j++) { if (j < n && list[j].h <= l) continue; const on = cmp && cmp[2] === l && cmp[0] === a && cmp[1] === j;
        arrows.push(html`<path key=${'a' + l + '-' + a} d=${`M${xl(a) + wd(a) - 4} ${yl(l)} L${xl(j) - 2} ${yl(l)}`} style=${{ stroke: on ? 'var(--c)' : 'var(--graphite)' }} strokeWidth=${on ? 4 : 1.8} markerEnd=${on ? 'url(#lx-skip-ah)' : 'url(#lx-skip-a)'} />`,
          html`<circle key=${'d' + l + '-' + a} cx=${xl(a) + wd(a) - 4} cy=${yl(l)} r="2.8" style=${{ fill: 'var(--ink)' }} />`); a = j; }
    }
    const tower = j => { const h = Math.min(hOf(j), show), x = xl(j), w = wd(j), key = j >= 0 && j < n ? list[j].k : null, hot = key != null && key === f.hot, fade = key != null && key === f.fade;
      const col = j < 0 ? 'var(--ok)' : j >= n ? '#d23c3c' : hot ? '#f2a93b' : 'var(--ink)';
      return html`<g key=${'t' + j} style=${{ opacity: fade ? .3 : 1 }}>
        <rect x=${x} y=${base - h * RH} width=${w} height=${h * RH} style=${{ fill: hot ? 'color-mix(in srgb, #f2a93b 25%, var(--paper))' : 'var(--paper)', stroke: col }} strokeWidth=${j < 0 || j >= n || hot ? 2.6 : 1.5} />
        ${Array.from({ length: h - 1 }, (_, q) => html`<line key=${q} x1=${x} x2=${x + w} y1=${base - (q + 1) * RH} y2=${base - (q + 1) * RH} style=${{ stroke: col }} strokeWidth="1" />`)}
        ${key != null ? html`<text x=${x + (w - 7) / 2} y=${base - RH / 2} dy=".36em" textAnchor="middle" fontSize=${fs} fontWeight="700" style=${{ fill: 'var(--ink)' }}>${key}</text>` : null}</g>`; };
    const pt = ([j, l]) => [xl(j) + (j >= 0 && j < n ? 10 : wd(j) / 2), yl(l) + 0];
    const path = (tr, col, dash) => tr && tr.length > 1 ? html`<path d=${'M' + tr.map(pt).map(p => p.join(' ')).join(' L')} fill="none" stroke=${col} strokeWidth="3.4" strokeDasharray=${dash} strokeLinejoin="round" />` : null;
    return html`<svg className="lx-skip-svg" viewBox=${`0 0 ${W} ${Hh}`} style=${{ maxWidth: Math.round(W * 1.25) + 'px' }} role="img" aria-label=${'Skip list with keys ' + list.map(o => o.k).join(', ')}>
      <defs><marker id="lx-skip-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" style=${{ fill: 'var(--graphite)' }} /></marker>
        <marker id="lx-skip-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="3.5" markerHeight="3.5" orient="auto"><path d="M0 0 L10 5 L0 10 z" style=${{ fill: 'var(--c)' }} /></marker></defs>
      ${[-1, ...list.map((_, j) => j), n].map(tower)}${arrows}
      ${path(f.trail, '#e8452c', f.rtrail ? '3 5' : '7 5')}
      ${f.rtrail ? path(f.rtrail, '#7863d4', '') : null}
      ${f.cur ? html`<circle cx=${pt(f.cur)[0]} cy=${pt(f.cur)[1]} r="7" fill=${f.rtrail ? '#7863d4' : '#e8452c'} stroke="#fff" strokeWidth="1.6" />` : null}
    </svg>`;
  }
  function Diagram({ f, setCfg, step, jump }) {
    const flip = c => { const a = f.ask; setCfg(cfg => { const tok = String(cfg.ops).split(/[\s,]+/).filter(Boolean); tok[a.ti] = `i${a.k}:${a.done}${c === 'R' ? (Math.random() < .5 ? 'H' : 'T') : c}`; if (!tok[a.ti].endsWith('T') && (tok[a.ti].match(/H/g) || []).length < MAXH - 1) tok[a.ti] += '?'; else if (!tok[a.ti].endsWith('T')) tok[a.ti] += 'T'; return { ...cfg, ops: tok.join(', ') }; }); setTimeout(() => jump(step), 80); };
    return html`<div className="lx-skip-wrap"><${SL} f=${f} />
      ${f.cmpT ? html`<div className="lx-skip-cmp"><b>${f.cmpT[0]}</b> ${f.cmpT[1] ? html`<span className=${f.cmpT[1] === 'Yes' ? 'lx-skip-yes' : 'lx-skip-no'}>${f.cmpT[1]}</span>` : null} → ${f.cmpT[2]}</div>` : null}
      ${f.flips != null ? html`<div className="lx-skip-coins"><span>FLIP():</span>${f.flips ? f.flips.split('').map((c, q) => html`<span key=${q} className=${'lx-skip-coin' + (c === 'T' ? ' t' : '')}>${c}</span>`) : html`<span>none yet</span>`}</div>` : null}
      ${f.ask ? html`<div className="lx-skip-ask"><button onClick=${() => flip('H')}>Heads</button><button onClick=${() => flip('T')}>Tails</button><button onClick=${() => flip('R')}>Toss a coin</button></div>` : null}
      ${f.tbl ? html`<table className="lx-skip-tbl"><thead><tr><th>level i</th><th>expected n/2<sup>i</sup></th><th>in this list</th></tr></thead><tbody>${f.tbl.map(r => html`<tr key=${r[0]}><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`)}</tbody></table>` : null}
      ${f.back ? html`<table className="lx-skip-tbl"><thead><tr><th>level</th><th>reverse steps on it</th></tr></thead><tbody>${f.back.slice().reverse().map(r => html`<tr key=${r[0]} className=${r[0] === f.backLv ? 'on' : ''}><td>${r[0]}</td><td>${r[1]}</td></tr>`)}</tbody></table>` : null}
      ${f.eq ? html`<div className="lx-skip-eq">${f.eq.map((e, q) => html`<div key=${q} className=${q === f.eq.length - 1 ? 'on' : ''}>${e}</div>`)}</div>` : null}
    </div>`;
  }

  /* ── methods, presets ── */
  const PERF = '2, 10, 15, 16, 31, 71, 96', FINDL = '2, 10, 15, 16, 31, 71, 76, 87, 91, 96';
  const RAND = '2:2, 10, 15, 16:4, 31, 71:3, 86, 89:2, 91:3, 96';
  const DEF = { perfect: { keys: FINDL, ops: 'f71', seed: '1' }, random: { keys: RAND, ops: 'i87:HHT', seed: '1' }, back: { keys: RAND, ops: '86', seed: '1' } };
  const mk = (method, over) => ({ method, ...DEF[method], ...(over || {}) });
  const presets = [
    { label: 'Perfect skip list, level by level', src: 'L13 slides 4-6', cfg: mk('perfect', { keys: PERF, ops: 'f96' }) },
    { label: 'Find 71 ("71 < 96?" is 76)', src: 'L13 slides 7-8', cfg: mk('perfect') },
    { label: 'Find 96', src: 'L13 slides 9-10', cfg: mk('perfect', { ops: 'f96' }) },
    { label: 'Insert 87 with H, H, T', src: 'L13 slides 13-15', cfg: mk('random') },
    { label: 'Delete 87', src: 'L13 slides 16-17', cfg: mk('random', { ops: 'i87:HHT, d87' }) },
    { label: 'Insert 87: flip the coin yourself', src: 'L13 slide 15', cfg: mk('random', { ops: 'i87:?' }) },
    { label: 'Backwards analysis, path to 86', src: 'L13 slides 19-22', cfg: mk('back') }
  ];
  function Controls({ cfg, setCfg }) {
    const M = cfg.method, set = k => e => { const v = e.target.value; setCfg(c => ({ ...c, [k]: v })); };
    const setMethod = e => { const method = e.target.value; setCfg(c => mk(method)); };
    return html`<label>Method<select aria-label="Method" value=${M} onChange=${setMethod}><option value="perfect">Perfect skip list · Find</option><option value="random">Randomized · insert / delete</option><option value="back">Backwards analysis</option></select></label>
      <label className="tl-wide">${M === 'perfect' ? 'Keys (1 to 99)' : 'Keys (key:height, height 1 if left out)'}<input aria-label="Keys" value=${cfg.keys} onInput=${set('keys')} /></label>
      <label className="tl-wide">${M === 'back' ? 'Key to find' : 'Operations'}<input aria-label="Operations" value=${cfg.ops} onInput=${set('ops')} /></label>
      ${M === 'random' ? html`<label className="lx-skip-ctl">Random flips<button onClick=${() => setCfg(c => ({ ...c, seed: String(1 + Math.floor(Math.random() * 99999)) }))}>New coins ↻</button></label>` : null}
      <span className="lx-skip-help">${M === 'perfect' ? 'f71 (or just 71) finds 71. Heights are set as on slides 4 and 7: every other key goes up a level; with 2 or 3 left, the middle one goes on top.' : M === 'random' ? 'f71 finds, d87 deletes, i87:HHT inserts 87 with flips heads, heads, tails; i87 flips random coins (New coins re-tosses them); i87:? lets you flip in the diagram. Up to 12 keys and 5 levels.' : 'Type one key: the lab finds it, then walks the search path backwards (up when the node goes higher, else left).'}</span>`;
  }
  const COST = {
    perfect: 'O(log n) levels, because each level halves the one below; at most 2 nodes visited per level, so Find is O(log n). Insert/delete can force rearranging the entire list. Heights: every other key moves up while a level has more than 3 keys, then the middle key goes alone on top (this reproduces slides 4 and 7). Slide 7 writes "71 < 96?" on level 1, but the next key there after 31 is 76; slide 9 writes the last test as "96 ≤ 96?".',
    random: 'Each node is promoted with probability 1/2 (while FLIP() == heads), so the expected structure matches a perfect skip list: expected O(log n) find, insert and delete, O(n) expected space. Insert links the node after the last visited node on each level it reaches. Random flips use a seeded coin so a step can be replayed; capped at 5 levels to fit a phone.',
    back: 'Reverse the find path: at each step you move up with probability 0.5 (the node goes higher), else left. C(j) = 1 + 0.5C(j−1) + 0.5C(j) ⇒ C(j) = 2 + C(j−1) = 2j, and there are O(log n) levels, so a search takes O(log n) expected steps.'
  };
  window.LAB = window.LAB || {};
  window.LAB['skip'] = {
    meta: { title: 'Skip lists', group: 'Data structures', icon: '☰', desc: 'Express lanes over a sorted list, built by coin flips.', question: 'How do random coin flips give O(log n) search?',
      model: 'A skip list is a sorted linked list with extra levels: each level holds about half the keys of the level below, between a header (−∞) and a sentinel (+∞) present on every level.',
      watch: 'Find moves right while k ≥ next key, otherwise drops a level; count the nodes visited on each level.' },
    defaults: mk('perfect'),
    presets,
    Controls,
    build: cfg => build(cfg).map(f => ({ ...f, desc: strip(f.html || '') })),
    Diagram,
    legend: [['var(--ok)', 'Header'], ['#d23c3c', 'Sentinel'], ['#e8452c', 'Search path'], ['var(--c)', 'Comparison'], ['#f2a93b', 'Inserted / found'], ['#7863d4', 'Reverse walk']],
    cost: cfg => COST[cfg.method] || ''
  };
})();

/* ── trees ── */
/* ── lab: trees (Red-black trees, L9-L12) ── */
// RB-INSERT with Cases 1-3 and the mirror Cases 4-6 (L9, L10), RB-DELETE as on the L11 slides (predecessor, extra black token,
// pretend NIL node, rbTreeFix cases (1)-(4) with subcases (i)/(ii)), and the order-statistic tree of L12 (sizes, OS-SELECT, OS-RANK).
// The engine (insTrace / delTrace) is the one of the slide visuals ag-9 / ag-11, checked against the slides.
(function () {
  const { useState, useEffect, useRef } = React;
  const html = htm.bind(React.createElement);
  const RRD = '#d23c3c', RBK = '#28384d', AMB = '#f2a93b';
  const CSS = `
.lx-trees-top{ display:flex; flex-wrap:wrap; gap:6px 10px; align-items:center; justify-content:space-between; margin:0 0 8px; }
.lx-trees-ops{ display:flex; flex-wrap:wrap; gap:4px; }
.lx-trees-ops span{ font-size:13px; line-height:1.2; padding:3px 8px; border-radius:99px; border:1px solid var(--line); color:var(--graphite); white-space:nowrap; }
.lx-trees-ops span.lx-trees-done{ color:var(--ink); border-color:color-mix(in srgb, var(--c) 55%, var(--paper)); }
.lx-trees-ops span.lx-trees-cur{ background:var(--c); color:#fff; border-color:transparent; font-weight:700; }
.lx-trees-case{ font-size:14px; font-weight:700; color:var(--ink); margin:0 0 6px; text-align:center; }
.lx-trees-case i{ font-style:normal; display:inline-block; padding:2px 9px; border-radius:6px; background:color-mix(in srgb, ${AMB} 30%, var(--paper)); margin-left:6px; }
.lx-trees-tools{ display:flex; flex-wrap:wrap; gap:6px; align-items:center; justify-content:center; margin:8px 0 0; font-size:13px; color:var(--graphite); }
.lx-trees-tools button{ font:inherit; font-size:13px; padding:3px 9px; border-radius:6px; border:1px solid var(--line); background:var(--paper); color:var(--ink); cursor:pointer; }
.lx-trees-tools button[aria-pressed="true"]{ background:var(--c); color:#fff; border-color:transparent; }
.lx-trees-tools label{ display:inline-flex; gap:4px; align-items:center; font-size:13px; }
.lx-trees-svg{ display:block; width:100%; height:auto; margin:0 auto; }
.lx-trees-anim .lx-trees-mv{ transition:transform .35s ease; }
.lx-trees-anim .lx-trees-ed{ transition:d .35s ease; }
.lx-trees-anim circle{ transition:fill .3s; }
.lx-trees-svg .lx-trees-halo{ paint-order:stroke; stroke:var(--paper); stroke-width:4px; stroke-linejoin:round; }
.lx-trees-note{ font-size:13px; color:var(--graphite); text-align:center; margin:4px 0 0; }
@media (prefers-reduced-motion: reduce){ .lx-trees-svg .lx-trees-mv, .lx-trees-svg .lx-trees-ed, .lx-trees-anim circle{ transition:none; } }
`;
  if (!document.getElementById('lx-trees-css')) { const s = document.createElement('style'); s.id = 'lx-trees-css'; s.textContent = CSS; document.head.appendChild(s); }

  // ── shared red-black engine (from ag-9 / ag-11): insert / delete with one snapshot per step ──
  let UID = 0, ROTS = 0;
  const T0 = () => ({ root: null, n: {} });
  const cl = t => ({ root: t.root, n: Object.fromEntries(Object.entries(t.n).map(([k, v]) => [k, { ...v }])) });
  const col = (t, id) => id ? t.n[id].c : 'B';
  const keyOf = (t, id) => id ? (t.n[id].pre ? 'NIL' : t.n[id].k) : 'NIL';
  const findK = (t, k) => { let x = t.root; while (x && t.n[x].k !== k) x = k < t.n[x].k ? t.n[x].l : t.n[x].r; return x; };
  const keysOf = t => { const o = []; const f = id => { if (!id) return; f(t.n[id].l); if (!t.n[id].pre) o.push(t.n[id].k); f(t.n[id].r); }; f(t.root); return o; };
  function rotL(t, x) { ROTS++; const n = t.n, X = n[x], y = X.r, Y = n[y]; X.r = Y.l; if (Y.l) n[Y.l].p = x; Y.p = X.p; if (!X.p) t.root = y; else if (n[X.p].l === x) n[X.p].l = y; else n[X.p].r = y; Y.l = x; X.p = y; }
  function rotR(t, y) { ROTS++; const n = t.n, Y = n[y], x = Y.l, X = n[x]; Y.l = X.r; if (X.r) n[X.r].p = y; X.p = Y.p; if (!Y.p) t.root = x; else if (n[Y.p].l === y) n[Y.p].l = x; else n[Y.p].r = x; X.r = y; Y.p = x; }
  // RB-INSERT: steps [{ t, en, tags, cas }]; o.six names the mirror cases 4-6 (Lecture 10)
  function insTrace(t0, key, o = {}) {
    const t = cl(t0), n = t.n, S = [], K = id => n[id].k;
    const snap = (en, tags = {}, cas = 0) => S.push({ t: cl(t), en, tags, cas, rot: ROTS });
    const id = 'n' + (++UID); let y = null, x = t.root; const path = [];
    while (x) { y = x; path.push(K(x)); x = key < K(x) ? n[x].l : n[x].r; }
    n[id] = { k: key, c: 'R', p: y, l: null, r: null };
    if (!y) t.root = id; else if (key < K(y)) n[y].l = id; else n[y].r = id;
    snap(y ? `<b>Insert ${key}</b>: the BST search goes ${path.join(' → ')}, so ${key} becomes the ${key < K(y) ? 'left' : 'right'} child of ${K(y)}. Colour it <b>red</b> (color[x] ← RED), so black-heights do not change.`
      : `<b>Insert ${key}</b> into the empty tree: it becomes the root, coloured red for now.`, { [id]: 'x' });
    x = id; let fixed = false;
    while (x !== t.root && n[n[x].p].c === 'R') {
      fixed = true;
      const p = n[x].p, g = n[p].p, left = p === n[g].l, u = left ? n[g].r : n[g].l, un = u ? K(u) : 'NIL';
      const tags = { [x]: 'x', [p]: 'p[x]' }; if (u) tags[u] = 'y';
      const cn = c => (o.six && !left ? c + 3 : c);
      const mr = c => (!left ? ` (p[x] is a right child, so this is Case ${c} with left and right swapped)` : '');
      const two = `x = ${K(x)} and its parent ${K(p)} are both red (property 3 broken).`;
      if (col(t, u) === 'R') {
        snap(`${two} The uncle y = ${un} is <b>red</b>: <b>Case ${cn(1)}</b>${mr(1)}.`, tags, cn(1));
        n[p].c = 'B'; n[u].c = 'B'; n[g].c = 'R';
        snap(`<b>Case ${cn(1)}</b>: colour p[x] = ${K(p)} and y = ${un} <b>black</b> and the grandparent ${K(g)} <b>red</b>; then x ← p[p[x]] = ${K(g)}. No black-height changes.`, { [g]: 'new x' }, cn(1));
        x = g;
      } else {
        const zig = left ? x === n[p].r : x === n[p].l;
        if (zig) {
          snap(`${two} The uncle y = ${un} is <b>black</b> and x is a ${left ? 'right' : 'left'} child while p[x] is a ${left ? 'left' : 'right'} child (a zig-zag): <b>Case ${cn(2)}</b>${mr(2)}.`, tags, cn(2));
          x = p; left ? rotL(t, x) : rotR(t, x);
          snap(`<b>Case ${cn(2)}</b>: x ← p[x] = ${K(x)}, then ${left ? 'LEFT' : 'RIGHT'}-ROTATE(${K(x)}). Now x, p[x] and p[p[x]] lie on a straight line, which is Case ${cn(3)}.`, { [x]: 'x', [n[x].p]: 'p[x]' }, cn(2));
        } else snap(`${two} The uncle y = ${un} is <b>black</b> and x is a ${left ? 'left' : 'right'} child like p[x] (a straight line): <b>Case ${cn(3)}</b>${mr(3)}.`, tags, cn(3));
        const p2 = n[x].p, g2 = n[p2].p;
        n[p2].c = 'B'; n[g2].c = 'R';
        snap(`<b>Case ${cn(3)}</b>: colour p[x] = ${K(p2)} <b>black</b> and p[p[x]] = ${K(g2)} <b>red</b>.`, { [x]: 'x', [p2]: 'p[x]' }, cn(3));
        left ? rotR(t, g2) : rotL(t, g2);
        snap(`<b>Case ${cn(3)}</b>: ${left ? 'RIGHT' : 'LEFT'}-ROTATE(${K(g2)}). Now ${K(p2)} is black with red children ${K(x)} and ${K(g2)}: no red node has a red parent, so the loop stops.`, { [p2]: '' }, cn(3));
      }
    }
    const last = S[S.length - 1];
    if (n[t.root].c === 'R') { n[t.root].c = 'B'; snap(`color[root[T]] ← BLACK: the root ${K(t.root)} is coloured black (property 2). Done.`, { [t.root]: 'root' }, 0); }
    else if (!fixed) last.en += ` Its parent ${K(n[id].p)} is black, so nothing is violated. Done.`;
    else if (last.cas === 1 || last.cas === 4) last.en += ` The new x = ${K(x)} has a black parent, so the loop stops. Done.`;
    else last.en += ' Done.';
    return S;
  }
  // RB-DELETE as on the slides: two children → copy the predecessor's data, remove node y, its child x (or a black pretend NIL) takes its place, rbTreeFix(x) if y was black
  function delTrace(t0, key) {
    const t = cl(t0), n = t.n, S = [], K = id => keyOf(t, id);
    const snap = (en, tags = {}, tok = null, cas = '') => S.push({ t: cl(t), en, tags, tok, cas, rot: ROTS });
    const z = findK(t, key);
    if (!z) { snap(`${key} is not in the tree.`); return S; }
    let y;
    if (!n[z].l || !n[z].r) { y = z; snap(`<b>Delete ${key}</b>: it has at most one real child, so this node y is removed itself.`, { [z]: 'y' }); }
    else {
      y = n[z].l; while (n[y].r) y = n[y].r;
      snap(`<b>Delete ${key}</b>: it has two children, so use its <b>predecessor</b> y = ${K(y)} (the largest key in its left subtree).`, { [z]: 'z', [y]: 'y' });
      n[z].k = n[y].k;
      snap(`Replace the data of ${key} with the predecessor's ${n[z].k}; the node keeps its colour (${n[z].c === 'R' ? 'red' : 'black'}). Now remove the predecessor's old node y.`, { [z]: '', [y]: 'y' });
    }
    let x = n[y].r || n[y].l, pre = false;
    const pid = 'nil' + (++UID); if (!x) { x = pid; n[x] = { k: null, c: 'B', pre: true, l: null, r: null, p: null }; pre = true; }
    const yc = n[y].c, yk = n[y].k, yp = n[y].p;
    n[x].p = yp;
    if (!yp) t.root = x; else if (n[yp].l === y) n[yp].l = x; else n[yp].r = x;
    delete n[y];
    const xs = pre ? 'a black pretend NIL node x' : `its child x = ${K(x)}`;
    if (yc === 'R') { snap(`Remove y = ${yk}; ${xs} takes its place. The removed node was <b>red</b>, so no property is violated.`, { [x]: 'x' });
      if (pre) { const p = n[pid].p; if (!p) t.root = null; else if (n[p].l === pid) n[p].l = null; else n[p].r = null; delete n[pid]; }
      snap(`${pre ? 'The pretend NIL node is detached again. ' : ''}Done: the tree is a valid red-black tree.`); return S; }
    snap(`Remove y = ${yk}; ${xs} takes its place. y was <b>black</b>, so every path through it lost one black node: x gets an extra <b>black token</b> ■ and rbTreeFix(x) runs.`, { [x]: 'x' }, x);
    while (x !== t.root && col(t, x) === 'B') {
      const p = n[x].p, left = x === n[p].l; let s = left ? n[p].r : n[p].l;
      const sib = () => (left ? n[p].r : n[p].l);
      if (col(t, s) === 'R') {
        snap(`x = ${K(x)} is black with the token and its sibling y = ${K(s)} is <b>red</b>: <b>case (2)</b>.`, { [x]: 'x', [s]: 'y' }, x, '2');
        n[s].c = 'B'; n[p].c = 'R'; left ? rotL(t, p) : rotR(t, p); s = sib();
        snap(`<b>Case (2)</b>: colour y black and x's parent ${K(p)} red, then ${left ? 'left' : 'right'}-rotate ${K(p)}. x's new sibling y = ${K(s)} is black, so case (3) or (4) follows.`, { [x]: 'x', [s]: 'new y' }, x, '2');
      }
      const near = left ? n[s].l : n[s].r, far = left ? n[s].r : n[s].l;
      if (col(t, n[s].l) === 'B' && col(t, n[s].r) === 'B') {
        snap(`Sibling y = ${K(s)} is black and both nephews (${K(n[s].l)}, ${K(n[s].r)}) are black: <b>case (3)</b>.`, { [x]: 'x', [s]: 'y' }, x, '3');
        n[s].c = 'R'; x = p;
        snap(`<b>Case (3)</b>: colour y = ${K(s)} red and pass the token one level up: x ← parent = ${K(x)}${n[x].c === 'R' ? ' (which is red, so case (1) ends the loop)' : x === t.root ? ' (the root)' : ''}.`, { [x]: 'new x' }, x, '3');
      } else {
        if (col(t, far) === 'B') {
          snap(`Sibling y = ${K(s)} is black, its far nephew is black and its near nephew ${K(near)} is <b>red</b>: <b>case (4), subcase (i)</b>.`, { [x]: 'x', [s]: 'y', [near]: 'near' }, x, '4i');
          n[near].c = 'B'; n[s].c = 'R'; left ? rotR(t, s) : rotL(t, s); s = sib();
          snap(`<b>Subcase (i)</b>: colour the near nephew black and y red, then ${left ? 'right' : 'left'}-rotate y. The new sibling y = ${K(s)} has a <b>red far nephew</b>: subcase (ii).`, { [x]: 'x', [s]: 'y' }, x, '4i');
        }
        const f2 = left ? n[s].r : n[s].l;
        snap(`Sibling y = ${K(s)} is black and its far nephew ${K(f2)} is <b>red</b>: <b>case (4), subcase (ii)</b>.`, { [x]: 'x', [s]: 'y', [f2]: 'far' }, x, '4ii');
        n[s].c = n[p].c; n[p].c = 'B'; n[f2].c = 'B'; left ? rotL(t, p) : rotR(t, p);
        x = t.root;
        snap(`<b>Subcase (ii)</b>: y takes the parent's colour, the parent ${K(p)} and the far nephew ${K(f2)} become black, then ${left ? 'left' : 'right'}-rotate ${K(p)}. The black token is <b>removed</b> (x ← root): done.`, {}, null, '4ii');
      }
    }
    if (col(t, x) === 'R') { n[x].c = 'B'; snap(`x = ${K(x)} is <b>red</b> (case (1)): colour it black, which absorbs the token. Done.`, { [x]: 'x' }, null, '1'); }
    else if (S[S.length - 1].tok) snap(`x is the root: the extra black token is simply dropped. Done.`, {}, null, '');
    if (pre && n[pid]) { const p = n[pid].p; if (!p) t.root = null; else if (n[p].l === pid) n[p].l = null; else n[p].r = null; delete n[pid];
      snap(`Finally the pretend NIL node is detached again (if x is a pretend node, its parent's pointer is set back to null).`, {}, null, ''); }
    return S;
  }

  // ── order statistics (L12): sizes are recomputed from the tree, so they are always right after rotations ──
  const ord = k => k + (k % 100 >= 11 && k % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][k % 10] || 'th');
  const sizeOf = (t, id) => (!id || t.n[id].pre ? 0 : 1 + sizeOf(t, t.n[id].l) + sizeOf(t, t.n[id].r));
  function selTrace(t, i0) {
    const S = [], snap = (en, tags) => S.push({ t, en, tags, cas: 'sel', rot: ROTS, lab: 'size' });
    const path = {}; let x = t.root, i = i0;
    snap(`<b>OS-SELECT(root, ${i0})</b>: find the ${ord(i0)} smallest key. At each node x, k = size[left[x]] + 1 is the rank of x inside its own subtree (size[NIL] = 0).`, {});
    while (x) {
      const k = sizeOf(t, t.n[x].l) + 1, K = t.n[x].k;
      if (i === k) { path[x] = 'k=' + k; snap(`At ${K}: k = size[left[${K}]] + 1 = ${k - 1} + 1 = ${k}. i = ${i} = k, so return <b>${K}</b>: the ${ord(i0)} smallest key is <b>${K}</b>.`, { ...path }); break; }
      if (i < k) { path[x] = 'k=' + k; snap(`At ${K}: k = ${k - 1} + 1 = ${k}. i = ${i} &lt; k, so OS-SELECT(left[${K}], ${i}): go left.`, { ...path }); x = t.n[x].l; }
      else { path[x] = 'k=' + k; snap(`At ${K}: k = ${k - 1} + 1 = ${k}. i = ${i} &gt; k, so OS-SELECT(right[${K}], i − k = ${i} − ${k} = ${i - k}): go right.`, { ...path }); i -= k; x = t.n[x].r; }
    }
    return S;
  }
  function rankTrace(t, key) {
    const S = [], n = t.n, snap = (en, tags) => S.push({ t, en, tags, cas: 'rank', rot: ROTS, lab: 'size' });
    const x = findK(t, key); let r = sizeOf(t, n[x].l) + 1, y = x; const tags = { [x]: 'r=' + r };
    snap(`<b>OS-RANK(T, ${key})</b>: r ← size[left[${key}]] + 1 = ${r - 1} + 1 = ${r}, y ← ${key}. Climb to the root, adding what lies to the left.`, { ...tags });
    while (y !== t.root) {
      const p = n[y].p;
      if (n[p].r === y) { const a = sizeOf(t, n[p].l); r += a + 1; tags[p] = 'r=' + r; snap(`${n[y].k} is a <b>right</b> child of ${n[p].k}: r ← r + size[left[${n[p].k}]] + 1 = ${r - a - 1} + ${a} + 1 = <b>${r}</b>; y ← ${n[p].k}.`, { ...tags }); }
      else { tags[p] = 'r=' + r; snap(`${n[y].k} is a <b>left</b> child of ${n[p].k}: nothing to add (r = ${r}); y ← ${n[p].k}.`, { ...tags }); }
      y = p;
    }
    snap(`y is the root: return r = <b>${r}</b>. ${key} is the ${ord(r)} smallest key.`, { ...tags });
    return S;
  }

  // ── checks for the inspector ──
  function bhMap(t, tok) {
    const n = t.n, M = {};
    const w = id => (!id ? 1 : n[id].pre ? 1 + (tok === id ? 1 : 0) : (n[id].c === 'B' ? 1 : 0) + (tok === id ? 1 : 0));
    const go = id => { if (!id || n[id].pre) return [0]; const a = go(n[id].l).map(v => v + w(n[id].l)), b = go(n[id].r).map(v => v + w(n[id].r)); const s = [...new Set([...a, ...b])]; M[id] = s.length === 1 ? s[0] : '≠'; return s; };
    if (t.root) go(t.root); return M;
  }
  function height(t) { const go = id => (!id || t.n[id].pre ? 0 : 1 + Math.max(go(t.n[id].l), go(t.n[id].r))); return go(t.root); }
  function propCheck(t, tok) {
    const n = t.n, out = [];
    if (t.root && !n[t.root].pre && n[t.root].c === 'R') out.push('root is red (2)');
    for (const id in n) { const v = n[id]; if (!v.pre && v.c === 'R' && v.p && n[v.p].c === 'R') out.push(`${v.k} and ${n[v.p].k} both red (3)`); }
    const M = bhMap(t, tok); if (Object.values(M).includes('≠')) out.push('black-heights differ (4)');
    if (out.length) return out.join('; ');
    return tok ? 'hold if ■ counts as 1 black' : 'all 4 hold';
  }

  // ── input ──
  const HELP = 'Use 15 (insert 15), d15 (delete 15), s3 (OS-SELECT: 3rd smallest) or r15 (OS-RANK of 15). Keys are whole numbers 0 to 99, or single letters A to Z.';
  function parse(txt, startOnly) {
    const toks = String(txt || '').replace(/\b([dDsSrRiI])\s+(?=\d)/g, '$1').split(/[\s,;]+/).filter(Boolean), out = [];
    for (const tk of toks) {
      let m;
      if (/^\d{1,2}$/.test(tk)) out.push({ op: 'i', k: +tk });
      else if (/^[A-Za-z]$/.test(tk)) out.push({ op: 'i', k: tk.toUpperCase() });
      else if ((m = tk.match(/^([iIdDsSrR])(\d{1,2}|[A-Za-z])$/))) {
        const op = m[1].toLowerCase(), a = /^\d+$/.test(m[2]) ? +m[2] : m[2].toUpperCase();
        if (op === 's' && typeof a !== 'number') throw new Error(`"${tk}": OS-SELECT takes a rank number, like s3.`);
        out.push(op === 's' ? { op, i: a } : { op, k: a });
      } else if (/^-?\d+$/.test(tk)) throw new Error(`"${tk}": keys are whole numbers from 0 to 99, so the tree fits a phone.`);
      else throw new Error(`"${tk}" is not an operation. ${HELP}`);
      if (startOnly && out[out.length - 1].op !== 'i') throw new Error(`The start tree only takes keys to insert ("${tk}" is an operation): put it under Operations.`);
    }
    return out;
  }
  const opLabel = o => o.op === 'i' ? 'insert ' + o.k : o.op === 'd' ? 'delete ' + o.k : o.op === 's' ? 'OS-SELECT ' + o.i : 'OS-RANK ' + o.k;
  const chipLabel = o => o.op === 'i' ? '+' + o.k : o.op === 'd' ? '−' + o.k : o.op === 's' ? 'sel ' + o.i : 'rank ' + o.k;
  const caseName = c => c === 'sel' ? 'OS-SELECT' : c === 'rank' ? 'OS-RANK' : typeof c === 'number' ? (c ? 'Case ' + c + (c > 3 ? ' (mirror of ' + (c - 3) + ')' : '') : '') : c ? 'case (' + c.replace(/i+$/, '') + ')' + (/i/.test(c) ? ' (' + c.replace(/^\d/, '') + ')' : '') : '';
  const INV = {
    ins: 'A new key is always red, so black-heights cannot change: only property 3 (a red node has a black parent) or the root colour can break.',
    1: 'Case 1 only recolours: the grandparent\'s black moves down to the parent and the uncle. Black-heights stay the same, and the red-red problem may move two levels up.',
    2: 'Case 2 is one rotation that turns the zig-zag into a straight line. It changes no colours and always leads to Case 3.',
    3: 'Case 3 recolours and rotates the grandparent. After it the loop always stops: an insertion does at most 2 rotations.',
    del: 'If the removed node y was black, every path through it lost a black node. The token ■ on x stands for that missing black: count it and property 4 holds again.',
    d1: 'Case (1): a red x simply turns black and absorbs the token.',
    d2: 'Case (2) rotates the red sibling up so that x gets a black sibling. Black-heights (with the token) stay equal; case (3) or (4) follows.',
    d3: 'Case (3) takes one black from x and from its sibling (which turns red) and gives it to the parent: the token moves one level up.',
    d4i: 'Subcase (i) rotates the sibling so that its red nephew ends up on the far side: it becomes subcase (ii).',
    d4ii: 'Subcase (ii) ends the loop: one rotation at the parent gives x\'s side an extra black. rbTreeFix does at most 3 rotations in all.',
    sel: 'k = size[left[x]] + 1 is the rank of x inside its own subtree: compare i with k and go left, stop, or go right with i − k.',
    rank: 'Every time y is a right child, the parent and the parent\'s left subtree are smaller than x: add size[left[p]] + 1.'
  };
  const invOf = (kind, c) => kind === 'i' ? (c ? INV[((c - 1) % 3) + 1] : INV.ins) : kind === 'd' ? (c ? INV['d' + c] : INV.del) : INV[c] || '';

  function build(cfg) {
    UID = 0; ROTS = 0;
    const st = parse(cfg.start, true), ops = parse(cfg.ops, false);
    if (!st.length && !ops.length) throw new Error('Type some operations, e.g. 7, 3, 18, 10, d18. ' + HELP);
    if (st.length > 20) throw new Error('At most 20 keys in the start tree, so it stays readable on a phone.');
    if (ops.length > 30) throw new Error('At most 30 operations at a time.');
    const all = [...st.map(o => o.k), ...ops.filter(o => o.op !== 's').map(o => o.k)];
    if (all.some(k => typeof k === 'number') && all.some(k => typeof k === 'string')) throw new Error('Use either numbers or letters as keys, not both.');
    let t = T0();
    for (const o of st) { if (findK(t, o.k)) throw new Error(`The start tree has ${o.k} twice. Each key may appear only once.`); const S = insTrace(t, o.k, { six: true }); t = S[S.length - 1].t; }
    ROTS = 0;
    const frames = [], meta = { ops: ops.map(chipLabel), start: st.map(o => o.k) };
    const push = (s, j, kind) => {
      const tt = s.t, keys = keysOf(tt), n = keys.length, h = height(tt), bhm = bhMap(tt, s.tok), rk = tt.root && !tt.n[tt.root].pre ? tt.root : null;
      const desc = s.en.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      const cn = caseName(s.cas);
      frames.push({ desc, html: s.en, t: tt, tags: s.tags || {}, tok: s.tok || null, cas: s.cas, cn, j, kind, lab: s.lab || null, inv: invOf(kind, s.cas),
        metrics: [['Operation', j < 0 ? 'start tree' : `${opLabel(ops[j])} (${j + 1} of ${ops.length})`], ['Fix step', cn || '–'], ['Keys n', n], ['Height h', h], ['2 lg(n + 1)', n ? (2 * Math.log2(n + 1)).toFixed(2) : '0'], ['bh(root)', rk ? bhm[rk] : 0], ['Rotations', s.rot], ['RB properties', propCheck(tt, s.tok)]] });
    };
    const intro = st.length ? `Start tree: the keys ${st.map(o => o.k).join(', ')} inserted in this order (the colours come out as on the slide). ${ops.length ? 'Next: ' + ops.map(opLabel).join(', ') + '.' : ''}`
      : `Start with an empty tree. Then: ${ops.map(opLabel).join(', ')}. Each insert is a BST insert, colour red, then the fix-up cases.`;
    push({ t, en: intro, tags: {}, rot: 0 }, -1, 'start');
    frames[0].meta = meta;
    ops.forEach((o, j) => {
      let S;
      if (o.op === 'i') {
        if (findK(t, o.k)) throw new Error(`${o.k} is already in the tree at operation ${j + 1} (${chipLabel(o)}). Each key may appear only once.`);
        if (keysOf(t).length >= 20) throw new Error('At most 20 keys in the tree at once, so it stays readable on a phone.');
        S = insTrace(t, o.k, { six: true });
      } else if (o.op === 'd') {
        if (!findK(t, o.k)) throw new Error(`${o.k} is not in the tree at operation ${j + 1} (d${o.k}), so it cannot be deleted.`);
        S = delTrace(t, o.k);
      } else if (o.op === 's') {
        const n = keysOf(t).length;
        if (o.i < 1 || o.i > n) throw new Error(`s${o.i}: OS-SELECT needs a rank from 1 to n = ${n} at operation ${j + 1}.`);
        S = selTrace(t, o.i);
      } else {
        if (!findK(t, o.k)) throw new Error(`r${o.k}: ${o.k} is not in the tree at operation ${j + 1}, so it has no rank.`);
        S = rankTrace(t, o.k);
      }
      S.forEach(s => push(s, j, o.op === 'i' ? 'i' : o.op === 'd' ? 'd' : 'q'));
      t = S[S.length - 1].t;
    });
    const last = frames[frames.length - 1], tt = last.t, n = keysOf(tt).length;
    if (ops.length && tt.root) { const add = ` Final tree: n = ${n}, height ${height(tt)} ≤ 2 lg(n + 1) = ${(2 * Math.log2(n + 1)).toFixed(2)}, bh(root) = ${bhMap(tt, null)[tt.root]}.`; last.html += add; last.desc += add; }
    return frames;
  }

  // ── layout ──
  // horizontal: contour-compacted tidy drawing (subtrees slide together level by level); sideways: depth to the right, keys in order downwards
  function treeOf(t, nil) {
    const n = t.n;
    const rec = (id, d) => { const v = n[id]; if (v.pre) return { id, kind: 'pre', d, hw: .45, ch: [] };
      const ch = [v.l ? rec(v.l, d + 1) : nil ? { id: id + 'L', kind: 'nil', d: d + 1, hw: .2, ch: [] } : null, v.r ? rec(v.r, d + 1) : nil ? { id: id + 'R', kind: 'nil', d: d + 1, hw: .2, ch: [] } : null];
      return { id, kind: 'node', d, hw: .5, ch, k: v.k, c: v.c }; };
    return t.root ? rec(t.root, 0) : null;
  }
  function layH(root) {
    const GAP = .14;
    const go = v => {
      const [a, b] = v.ch; const A = a && go(a), B = b && go(b); let xa = 0, xb = 0;
      if (A && B) { let need = 0; for (let k = 0; k < Math.min(A.rc.length, B.lc.length); k++) need = Math.max(need, A.rc[k] - B.lc[k] + GAP); xa = -need / 2; xb = need / 2; }
      else if (A) xa = -.62; else if (B) xb = .62;
      const lc = [-v.hw], rc = [v.hw], items = [{ v, x: 0 }];
      const add = (S, dx) => { if (!S) return; S.items.forEach(o => items.push({ v: o.v, x: o.x + dx })); S.lc.forEach((c, k) => { lc[k + 1] = lc[k + 1] == null ? c + dx : Math.min(lc[k + 1], c + dx); }); S.rc.forEach((c, k) => { rc[k + 1] = rc[k + 1] == null ? c + dx : Math.max(rc[k + 1], c + dx); }); };
      add(A, xa); add(B, xb);
      return { items, lc, rc };
    };
    const R = go(root), xs = R.items.map(o => o.x), mn = Math.min(...R.items.map(o => o.x - o.v.hw)), mx = Math.max(...R.items.map(o => o.x + o.v.hw));
    void xs; return { items: R.items.map(o => ({ v: o.v, x: o.x - mn })), w: mx - mn };
  }
  function laySide(root) {
    const items = []; let row = 0;
    const go = v => { if (!v || v.kind === 'nil') return; go(v.ch[0]); items.push({ v, row: row++ }); go(v.ch[1]); };
    go(root); return { items, rows: row };
  }
  const edgesOf = root => { const E = []; const go = v => v.ch.forEach(c => { if (c) { E.push([v.id, c.id, c.kind]); go(c); } }); if (root) go(root); return E; };

  function Diagram({ f, cfg, frames, step }) {
    const prev = useRef({ frames: null, step: -9 }), anim = prev.current.frames === frames && Math.abs(prev.current.step - step) === 1;
    useEffect(() => { prev.current = { frames, step }; });
    const [lab, setLab] = useState(cfg.labels || 'bh'), [nil, setNil] = useState(cfg.nil !== false);
    useEffect(() => { setLab(cfg.labels || 'bh'); setNil(cfg.nil !== false); }, [cfg]);
    const ref = useRef(null), [w, setW] = useState(0);
    useEffect(() => { const el = ref.current; if (!el) return; setW(el.getBoundingClientRect().width); if (!window.ResizeObserver) return; const ro = new ResizeObserver(e => setW(e[0].contentRect.width)); ro.observe(el); return () => ro.disconnect(); }, []);
    const show = f.lab || lab, t = f.t, meta = frames[0].meta || { ops: [] };
    const bhm = bhMap(t, f.tok), num = id => show === 'bh' ? bhm[id] : show === 'size' ? sizeOf(t, id) : null;
    const root = treeOf(t, nil);
    const W0 = w || 600;
    // try the horizontal drawing first; fall back to the sideways one when it would need text below the minimum size
    const U = 36, LV = 60, TOP = 34;
    let mode = 'h', P = {}, VW = 300, VH = 120, nodes = [];
    if (root) {
      const L = layH(root), vw = L.w * U + 44, dmax = Math.max(...L.items.map(o => o.v.d));
      if (W0 / vw >= .8 || !w) { VW = Math.max(vw, 220); const ox = (VW - L.w * U) / 2; L.items.forEach(o => { P[o.v.id] = [ox + o.x * U, TOP + o.v.d * LV - (o.v.kind === 'nil' ? LV * .32 : 0)]; }); nodes = L.items.map(o => o.v); VH = TOP + dmax * LV + 34; }
      else {
        mode = 's'; const S = laySide(treeOf(t, false)), DX = 54, RH = 42, dm = Math.max(...S.items.map(o => o.v.d));
        VW = 26 + dm * DX + 66; S.items.forEach(o => { P[o.v.id] = [24 + o.v.d * DX, 26 + o.row * RH]; }); nodes = S.items.map(o => o.v); VH = 26 + (S.rows - 1) * RH + 30;
      }
    }
    const MX = mode === 's' ? 1.6 : 1.3, sc = Math.min(W0, VW * MX) / VW, m = Math.max(1, 12.6 / (13 * sc)); // font bump keeps every text ≥ 12.6 px on screen
    const FK = 15 * m, FS = 13 * m, R = Math.max(15, FK * .98);
    const E = root ? edgesOf(mode === 'h' ? root : treeOf(t, false)).filter(([a, b]) => P[a] && P[b]) : [];
    const ring = (v, r) => html`<circle r=${r + 5} fill="none" stroke=${AMB} strokeWidth="3.5" />`;
    const tk = (r) => html`<rect x=${-r - 9} y=${-r - 9} width="11" height="11" fill="var(--ink)" stroke="var(--paper)" strokeWidth="1.5" />`;
    const drawn = nodes.map(v => {
      const [x, y] = P[v.id], tg = f.tags[v.id];
      if (v.kind === 'nil') return html`<g key=${v.id} className="lx-trees-mv" style=${{ transform: `translate(${x}px,${y}px)` }}><rect x="-5" y="-5" width="10" height="10" fill=${RBK} stroke="var(--ink)" strokeWidth="1" /></g>`;
      if (v.kind === 'pre') return html`<g key=${v.id} className="lx-trees-mv" style=${{ transform: `translate(${x}px,${y}px)` }}>${tg != null ? ring(v, 8) : null}<circle r="8" fill=${RBK} stroke="var(--ink)" strokeWidth="1.2" />${f.tok === v.id ? tk(8) : null}
        <text className="lx-trees-halo" y=${-8 - 9} textAnchor="middle" fontSize=${FS} fontWeight="700" style=${{ fill: 'var(--c)' }}>${tg || 'NIL'}</text></g>`;
      const nm = num(v.id);
      return html`<g key=${v.id} className="lx-trees-mv" style=${{ transform: `translate(${x}px,${y}px)` }}>
        ${tg != null ? ring(v, R) : null}
        <circle r=${R} fill=${v.c === 'R' ? RRD : RBK} stroke="var(--ink)" strokeWidth="1.2" />
        <text textAnchor="middle" dy=".35em" fontSize=${String(v.k).length > 1 ? FK * .93 : FK} fontWeight="700" style=${{ fill: '#fff' }}>${v.k}</text>
        ${f.tok === v.id ? tk(R) : null}
        ${tg ? (mode === 'h' ? html`<text className="lx-trees-halo" y=${-R - 9} textAnchor="middle" fontSize=${FS} fontWeight="700" style=${{ fill: 'var(--c)' }}>${tg}</text>`
          : html`<text className="lx-trees-halo" x=${-R - 4} y=${-R + 2} textAnchor="end" fontSize=${FS} fontWeight="700" style=${{ fill: 'var(--c)' }}>${tg}</text>`) : null}
        ${nm != null ? (mode === 'h' ? html`<text className="lx-trees-halo" y=${R + FS + 1} textAnchor="middle" fontSize=${FS} fontWeight="700" style=${{ fill: nm === '≠' ? RRD : 'var(--graphite)' }}>${nm}</text>`
          : html`<text className="lx-trees-halo" x=${R + 5} y=${5} fontSize=${FS} fontWeight="700" style=${{ fill: nm === '≠' ? RRD : 'var(--graphite)' }}>${nm}</text>`) : null}
      </g>`;
    });
    const eds = E.map(([a, b, kind]) => { const [x1, y1] = P[a], [x2, y2] = P[b], d = `M${x1} ${y1} L${x2} ${y2}`; return html`<path key=${'e' + b} className="lx-trees-ed" d=${d} style=${{ d: `path("${d}")` }} stroke="var(--graphite)" strokeWidth=${kind === 'nil' ? 1.4 : 2} fill="none" />`; });
    const j = f.j, opsC = meta.ops;
    return html`<div ref=${ref}>
      <div className="lx-trees-top"><div className="lx-trees-ops" aria-label="Operations">${meta.start && meta.start.length ? html`<span className=${j < 0 ? 'lx-trees-cur' : 'lx-trees-done'}>start</span>` : null}${opsC.map((o, k) => html`<span key=${k} className=${k === j ? 'lx-trees-cur' : k < j ? 'lx-trees-done' : ''}>${o}</span>`)}</div></div>
      <p className="lx-trees-case">${j < 0 ? 'Start tree' : 'Step: ' + (f.kind === 'q' ? 'query' : f.kind === 'i' ? 'RB-INSERT' : 'RB-DELETE')}${f.cn ? html`<i>${f.cn}</i>` : null}</p>
      ${root ? html`<svg className=${"lx-trees-svg" + (anim ? " lx-trees-anim" : "")} viewBox=${`0 0 ${VW.toFixed(1)} ${VH.toFixed(1)}`} style=${{ maxWidth: (VW * MX).toFixed(0) + 'px' }} role="img" aria-label="Red-black tree">${eds}${drawn}</svg>`
        : html`<p className="lx-trees-note">The tree is empty.</p>`}
      ${mode === 's' ? html`<p className="lx-trees-note">Drawn sideways to fit: the root is on the left, smaller keys are higher up.</p>` : null}
      <div className="lx-trees-tools"><span>Numbers by the nodes:</span>${[['bh', 'black-height'], ['size', 'size'], ['none', 'none']].map(([k, l]) => html`<button key=${k} aria-pressed=${String(show === k)} disabled=${!!f.lab} onClick=${() => setLab(k)}>${l}</button>`)}
        <label><input type="checkbox" checked=${nil} onChange=${e => setNil(e.target.checked)} />NIL leaves</label></div>
    </div>`;
  }

  function Controls({ cfg, setCfg }) {
    return html`<label className="tl-wide">Start tree (keys inserted without steps)<input value=${cfg.start} placeholder="e.g. 7, 3, 18 (optional)" onInput=${e => { const v = e.target.value; setCfg(c => ({ ...c, start: v })); }} /></label>
      <label className="tl-wide">Operations: 15 insert, d15 delete, s3 OS-SELECT, r15 OS-RANK<input value=${cfg.ops} placeholder="7, 3, 18, 10, 22, 8, 11, 26, 15, d18" onInput=${e => { const v = e.target.value; setCfg(c => ({ ...c, ops: v })); }} /></label>`;
  }

  const L9 = '7, 3, 18, 10, 22, 8, 11, 26', L11 = '47, 32, 71, 93', DT = '47, 32, 71, 93, 65, 82, 87';
  window.LAB = window.LAB || {};
  window.LAB.trees = {
    meta: {
      title: 'Red-black trees', group: 'Data structures', icon: '♧', desc: 'RB-INSERT, RB-DELETE, OS-SELECT as in L9-L12.',
      question: 'How do recolouring and at most a few rotations keep the height ≤ 2 lg(n + 1)?',
      model: 'A red-black tree is a BST with one colour bit per node: the root and the NIL leaves are black, a red node has a black parent, and every path from a node down to a NIL has the same number of black nodes, its black-height bh. So h ≤ 2 lg(n + 1).',
      watch: 'Insert colours the new node red and repairs red-red pairs (Cases 1-3, mirror 4-6). Delete removes a node; if it was black, an extra black token ■ travels up until rbTreeFix cases (1)-(4) absorb it.'
    },
    defaults: { start: L9, ops: '15', labels: 'bh', nil: true },
    presets: [
      { label: 'L9 example tree: insert 15', src: 'L9 slides 4-8, 19-23', cfg: { start: L9, ops: '15', labels: 'bh', nil: true } },
      { label: 'Insertion problem {7, 5, 9, 12}: 8, 11, 10', src: 'L10 slides 8-19', cfg: { start: '7, 5, 9, 12', ops: '8, 11, 10', labels: 'bh', nil: true } },
      { label: 'L11 example: insert 65, 82, 87', src: 'L11 slides 1-11', cfg: { start: L11, ops: '65, 82, 87', labels: 'bh', nil: true } },
      { label: 'Exam: insert 2, 1, 4, 5, 9, 3, 6, 7', src: 'Final 2016 Q4, notes L11', cfg: { start: '', ops: '2, 1, 4, 5, 9, 3, 6, 7', labels: 'bh', nil: true } },
      { label: 'Exam: insert 5, 1, 4, 10, 9, 20, 6, 7', src: 'Final 2018 Q4, notes L11', cfg: { start: '', ops: '5, 1, 4, 10, 9, 20, 6, 7', labels: 'bh', nil: true } },
      { label: 'Deletion example 1: delete 87', src: 'L11 slides 17-18', cfg: { start: DT, ops: 'd87', labels: 'bh', nil: true } },
      { label: 'Deletion example 2: delete 71', src: 'L11 slides 19-21', cfg: { start: DT + ', 51', ops: 'd71', labels: 'bh', nil: true } },
      { label: 'Deletion example 3: delete 32', src: 'L11 slides 22-29', cfg: { start: DT, ops: 'd32', labels: 'bh', nil: true } },
      { label: 'OS-tree: OS-SELECT(5), OS-RANK(N)', src: 'L12 slides 3-5, Midterm 2025 Q6', cfg: { start: 'M, C, P, A, F, N, Q, D, H', ops: 's5, rN', labels: 'size', nil: false } }
    ],
    Controls, build, Diagram,
    legend: [[RBK, 'Black node'], [RRD, 'Red node'], [AMB, 'Ring: nodes of this step'], ['var(--ink)', 'Extra black token']],
    cost: 'RB-INSERT and RB-DELETE run in O(lg n) since h ≤ 2 lg(n + 1). Insert: Case 1 (or 4) only recolours and can repeat up the tree; Cases 2-3 (5-6) do at most 2 rotations and stop. Delete: at most 3 rotations in rbTreeFix. Conventions of the slides: case numbers 1-3 when p[x] is a left child and 4-6 for the mirror (L10); a node with two children is replaced by its predecessor (L11; the textbook uses the successor); a removed leaf is replaced by a black pretend NIL node. Black-heights shown count the NIL and not the node itself, and count the token ■ as one black. Sizes (L12) satisfy size[x] = size[left] + size[right] + 1 and are fixed in O(1) per rotation, so OS-SELECT and OS-RANK run in O(lg n). Keys 0 to 99 or A to Z, at most 20 in the tree.'
  };
})();

/* ── dp ── */
/* ── lab: dp (Lecture 14, Dynamic Programming) ── */
// Seven methods of L14, each filling its table cell by cell (dependencies highlighted, the recurrence of the cell in the caption)
// and then backtracing: Fibonacci bottom-up vs naive recursion (slides 3-4), coin-row (6-9), binomial C(n,k) (10-15), robot coin
// collecting (16-19), LCS with len/prev and Output-LCS (20-30), 0/1 knapsack V[i,j] (31-33), change-making c[p]/s[p] (34-37).
// Engines follow ag-14.js (checked against the slides).
(function () {
  const { useState } = React;
  const html = htm.bind(React.createElement);
  const CSS = `
.lx-dp-wrap{ max-width:760px; margin:0 auto; color:var(--ink); }
.lx-dp-t{ table-layout:fixed; border-collapse:collapse; margin:0 auto; font-variant-numeric:tabular-nums; font-size:clamp(12px, 2.3vw, 15px); color:var(--ink); }
.lx-dp-t td, .lx-dp-t th{ border:1px solid var(--line); text-align:center; padding:3px 0; line-height:1.2; background:var(--paper); transition:background .25s; }
.lx-dp-t th{ background:var(--paper-2); color:var(--graphite); font-weight:600; }
.lx-dp-t th small, .lx-dp-t td small{ display:block; font-size:1em; font-weight:400; }
.lx-dp-t th em{ display:block; font-style:italic; color:var(--ink); font-weight:600; }
.lx-dp-t td.lx-dp-na{ background:var(--paper-2); }
.lx-dp-t td.lx-dp-unk{ color:var(--faint); }
.lx-dp-t td.lx-dp-edge{ color:var(--graphite); }
.lx-dp-ar{ display:block; color:var(--graphite); }
.lx-dp-cur{ background:color-mix(in srgb, var(--c) 38%, var(--paper)) !important; font-weight:700; box-shadow:inset 0 0 0 2px var(--c); }
.lx-dp-dep{ background:color-mix(in srgb, #f2a93b 42%, var(--paper)) !important; }
.lx-dp-best{ box-shadow:inset 0 0 0 2px #d9861c; font-weight:700; }
.lx-dp-path{ background:color-mix(in srgb, var(--ok) 30%, var(--paper)) !important; }
.lx-dp-hit{ background:color-mix(in srgb, var(--ok) 55%, var(--paper)) !important; font-weight:700; }
.lx-dp-cur .lx-dp-ar, .lx-dp-hit .lx-dp-ar, .lx-dp-path .lx-dp-ar, .lx-dp-dep .lx-dp-ar{ color:var(--ink); }
.lx-dp-tap td.lx-dp-cell{ cursor:pointer; }
.lx-dp-board td{ position:relative; height:2.4em; }
.lx-dp-dot{ position:absolute; left:3px; top:3px; width:9px; height:9px; border-radius:50%; background:#f2a93b; border:1px solid #b06f10; }
.lx-dp-cards{ display:grid; grid-template-columns:repeat(auto-fill, minmax(52px, 1fr)); gap:5px; font-variant-numeric:tabular-nums; }
.lx-dp-card{ border:1px solid var(--line); border-radius:7px; background:var(--paper); text-align:center; font-size:15px; line-height:1.35; padding:2px 0 3px; transition:background .25s; color:var(--ink); }
.lx-dp-card b{ display:block; font-size:12.5px; color:var(--graphite); border-bottom:1px solid var(--line); font-weight:600; }
.lx-dp-card i{ display:block; font-style:normal; font-size:13px; color:var(--graphite); }
.lx-dp-card.lx-dp-leg{ background:var(--paper-2); font-size:12.5px; }
.lx-dp-card.lx-dp-unk span{ color:var(--faint); }
.lx-dp-chips{ display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin:0 0 10px; font-size:13px; }
.lx-dp-chips span{ border:1px solid var(--line); border-radius:99px; padding:2px 9px; background:var(--paper); color:var(--ink); }
.lx-dp-chips span.lx-dp-in{ background:color-mix(in srgb, var(--ok) 32%, var(--paper)); border-color:var(--ok); font-weight:700; }
.lx-dp-chips span.lx-dp-out{ opacity:.55; text-decoration:line-through; }
.lx-dp-chips span.lx-dp-now{ box-shadow:0 0 0 2px var(--c); }
.lx-dp-out-line{ text-align:center; font-size:14px; margin:10px 0 0; color:var(--ink); }
.lx-dp-out-line span{ color:var(--graphite); }
.lx-dp-hint{ text-align:center; font-size:12.5px; color:var(--graphite); margin:8px 0 0; }
.lx-dp-mono{ font-family:var(--mono, monospace); letter-spacing:.04em; }
@media (prefers-reduced-motion: reduce){ .lx-dp-t td, .lx-dp-card{ transition:none; } }`;
  if (!document.getElementById('lx-dp-css')) { const s = document.createElement('style'); s.id = 'lx-dp-css'; s.textContent = CSS; document.head.appendChild(s); }

  // ── helpers ──
  const strip = h => h.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');
  const fr = (h, o) => ({ desc: strip(h), html: h, ...o });
  const sub = x => `<sub>${x}</sub>`;
  const toInt = (s, name, lo, hi) => { const t = String(s).trim(); const x = Number(t);
    if (!t || !Number.isInteger(x) || x < lo || x > hi) throw new Error(`${name} must be a whole number from ${lo} to ${hi}.`); return x; };
  const list = s => String(s).split(/[\s,;]+/).filter(Boolean);
  const has = (L, i, j) => !!L && L.some(p => p[0] === i && p[1] === j);
  const fmt = x => x == null ? '∞' : String(x);
  const rankTable = (R, C) => Array.from({ length: R }, () => Array(C).fill(null));

  /* ── 1. Fibonacci: bottom-up table vs naive recursion (slides 3-4) ── */
  function buildFib(cfg) {
    const n = toInt(cfg.fibN, 'n', 2, 25);
    const f = [0, 1], calls = [1, 1];
    for (let k = 2; k <= n; k++) { f[k] = f[k - 1] + f[k - 2]; calls[k] = 1 + calls[k - 1] + calls[k - 2]; }
    const times = Array(n + 1).fill(0); times[n] = 1;
    for (let k = n; k >= 2; k--) { times[k - 1] += times[k]; times[k - 2] += times[k]; }
    const base = { kind: 'fib', n, f, times };
    const M = (k, add) => [['Values stored', k], ['Additions (bottom-up)', add], ['Calls (naive top-down)', calls[n]]];
    const F = [];
    F.push(fr(`Top-down, f(n) = f(n−1) + f(n−2) calls itself twice and the two calls overlap: f(n−1) also calls f(n−2). Computing f(${n}) that way makes <b>${calls[n]}</b> calls; the bottom line of each card is how many times the naive recursion recomputes f(k).`,
      { ...base, k: 0, cur: null, dep: [], metrics: M(0, 0), inv: 'The “naive ×” counts are themselves Fibonacci numbers: the work explodes exponentially.' }));
    F.push(fr(`Bottom-up: store the smallest instances first, f(0) = 0 and f(1) = 1.`, { ...base, k: 2, cur: null, curs: [0, 1], dep: [], metrics: M(2, 0), inv: 'Each value is stored once; nothing is ever recomputed.' }));
    for (let k = 2; k <= n; k++)
      F.push(fr(`f(${k}) = f(${k - 1}) + f(${k - 2}) = ${f[k - 1]} + ${f[k - 2]} = <b>${f[k]}</b>, read from the two cells already in the table (the naive recursion computes f(${k}) ${times[k]} time${times[k] > 1 ? 's' : ''}).`,
        { ...base, k: k + 1, cur: k, dep: [k - 1, k - 2], metrics: M(k + 1, k - 1), inv: 'The amber cells are the only ones read: one addition per new cell.' }));
    F.push(fr(`f(${n}) = <b>${f[n]}</b>. Bottom-up computed ${n + 1} values with ${n - 1} additions (Θ(n)); the naive recursion made ${calls[n]} calls for the same answer.`,
      { ...base, k: n + 1, cur: null, dep: [], path: [n], metrics: M(n + 1, n - 1), inv: 'Overlapping subproblems solved once and stored: that is dynamic programming.' }));
    return F;
  }

  /* ── 2. Coin-row (slides 6-9) ── */
  function buildCoin(cfg) {
    const raw = list(cfg.coins).map(Number);
    if (raw.length < 1 || raw.length > 14 || !raw.every(x => Number.isInteger(x) && x >= 1 && x <= 99)) throw new Error('Enter 1 to 14 coin values, whole numbers from 1 to 99, separated by commas.');
    const c = [0, ...raw], n = raw.length, Fv = [0, c[1]];
    for (let k = 2; k <= n; k++) Fv[k] = Math.max(c[k] + Fv[k - 2], Fv[k - 1]);
    const base = { kind: 'coin', n, c, F: Fv };
    let cmp = 0; const M = (k, extra) => [['F values filled', k], ['max{ } evaluations', cmp], ...(extra || [])];
    const out = [];
    out.push(fr(`Row of coins ${raw.join(', ')}: pick the most money with <b>no two adjacent coins</b>. Split the choices by the last coin: with it, c${sub('n')} + F(n−2); without it, F(n−1). So F(n) = max{c${sub('n')} + F(n−2), F(n−1)}.`,
      { ...base, k: 0, dep: [], metrics: M(0), inv: 'F(k) = best amount from the first k coins only.' }));
    out.push(fr(`Base cases: F(0) = 0 (no coins) and F(1) = c${sub(1)} = ${c[1]}.`, { ...base, k: 2, curs: [0, 1], dep: [], metrics: M(2), inv: 'Two base cases, because the recurrence looks two cells back.' }));
    for (let k = 2; k <= n; k++) { cmp++; const a = c[k] + Fv[k - 2], b = Fv[k - 1];
      out.push(fr(`F(${k}) = max{c${sub(k)} + F(${k - 2}), F(${k - 1})} = max{${c[k]} + ${Fv[k - 2]}, ${b}} = max{${a}, ${b}} = <b>${Fv[k]}</b> (${a > b ? `take coin ${k}` : a === b ? 'a tie' : `leave coin ${k}`}).`,
        { ...base, k: k + 1, cur: k, dep: [k - 2, k - 1], metrics: M(k + 1), inv: 'F(k−2) (with coin k) and F(k−1) (without it) are the two cells read.' })); }
    const take = [], skip = []; let k = n;
    while (k >= 1) {
      if (k === 1) { take.push(1); out.push(fr(`k = 1: F(1) = c${sub(1)}, so coin 1 (${c[1]}) is taken. Done.`, { ...base, k: n + 1, cur: 1, dep: [], take: take.slice(), skip: skip.slice(), metrics: M(n + 1, [['Coins taken', take.length]]), inv: 'Backtrace: follow the choice that produced each F value.' })); k = 0; break; }
      const a = c[k] + Fv[k - 2], b = Fv[k - 1];
      if (a > b) { take.push(k); out.push(fr(`Backtrace at k = ${k}: c${sub(k)} + F(${k - 2}) = ${a} &gt; F(${k - 1}) = ${b}, so coin ${k} (${c[k]}) <b>is taken</b>; coin ${k - 1} can't be, jump to k = ${k - 2}.`,
        { ...base, k: n + 1, cur: k, dep: [k - 2], take: take.slice(), skip: skip.slice(), metrics: M(n + 1, [['Coins taken', take.length]]), inv: 'Backtrace: follow the choice that produced each F value.' })); k -= 2; if (k >= 1) skip.push(k + 1); }
      else { skip.push(k); out.push(fr(`Backtrace at k = ${k}: c${sub(k)} + F(${k - 2}) = ${a} ${a === b ? '=' : '&lt;'} F(${k - 1}) = ${b}, so F(${k}) came from F(${k - 1}): coin ${k} is <b>left</b>, go to k = ${k - 1}.`,
        { ...base, k: n + 1, cur: k, dep: [k - 1], take: take.slice(), skip: skip.slice(), metrics: M(n + 1, [['Coins taken', take.length]]), inv: 'Backtrace: follow the choice that produced each F value.' })); k -= 1; }
    }
    take.reverse();
    out.push(fr(`Max amount F(${n}) = <b>${Fv[n]}</b> with coins ${take.map(t => `c${sub(t)} = ${c[t]}`).join(', ')}. Time Θ(n), space Θ(n); all smaller instances were solved on the way.`,
      { ...base, k: n + 1, dep: [], take, skip: Array.from({ length: n }, (_, i) => i + 1).filter(i => !take.includes(i)), path: take, done: true, metrics: M(n + 1, [['Coins taken', take.length]]), inv: 'No two taken coins are next to each other.' }));
    return out;
  }

  /* ── 3. Binomial coefficients C(n,k) (slides 10-15) ── */
  function buildBinom(cfg) {
    const n = toInt(cfg.bn, 'n', 1, 12), K = toInt(cfg.bk, 'k', 0, Math.min(n, 7));
    const T = rankTable(n + 1, K + 1), rank = rankTable(n + 1, K + 1); let r = 0;
    for (let i = 0; i <= n; i++) for (let j = 0; j <= Math.min(i, K); j++) { T[i][j] = j === 0 || j === i ? 1 : T[i - 1][j - 1] + T[i - 1][j]; rank[i][j] = r++; }
    const base = { kind: 'binom', n, K, T, rank }; let adds = 0;
    const M = k => [['Cells filled', k + ' / ' + r], ['Additions', adds]];
    const out = [fr(`C(n,k) counts the k-element subsets of an n-element set. Those <b>without</b> the last element: C(n−1,k); those <b>with</b> it: C(n−1,k−1). So C(n,k) = C(n−1,k) + C(n−1,k−1) for n &gt; k &gt; 0, C(n,0) = C(n,n) = 1. Fill row i = 0..${n}, j = 0..min(i, ${K}).`,
      { ...base, k: 0, dep: [], metrics: M(0), inv: 'Row i only reads row i−1: Pascal\'s triangle, cut at column k.' })];
    for (let i = 0; i <= n; i++) for (let j = 0; j <= Math.min(i, K); j++) {
      const k = rank[i][j] + 1;
      if (j === 0 || j === i) out.push(fr(`C(${i},${j}) = 1 (${j === 0 ? 'j = 0: one way to choose nothing' : 'j = i: one way to choose everything'}).`, { ...base, k, cur: [i, j], dep: [], metrics: M(k), inv: 'Boundary cells need no lookup.' }));
      else { adds++; out.push(fr(`C(${i},${j}) = C(${i - 1},${j - 1}) + C(${i - 1},${j}) = ${T[i - 1][j - 1]} + ${T[i - 1][j]} = <b>${T[i][j]}</b>.`, { ...base, k, cur: [i, j], dep: [[i - 1, j - 1], [i - 1, j]], metrics: M(k), inv: 'The two amber cells are diagonally up-left and straight up.' })); }
    }
    const last = K === 0 || K === n ? `C(${n},${K}) = 1` : `C(${n},${K}) = C(${n - 1},${K - 1}) + C(${n - 1},${K}) = ${T[n - 1][K - 1]} + ${T[n - 1][K]} = <b>${T[n][K]}</b>`;
    out.push(fr(`${last}. The two loops filled ${r} cells, each in O(1): time Θ(nk), space Θ(nk).`, { ...base, k: r, dep: K === 0 || K === n ? [] : [[n - 1, K - 1], [n - 1, K]], path: [[n, K]], metrics: M(r), inv: 'Only about n·k cells were needed, not all of Pascal\'s triangle.' }));
    return out;
  }

  /* ── 4. Robot coin collecting (slides 16-19) ── */
  const parseBoard = (s, R, C) => {
    const t = String(s).trim(); if (!t) return [];
    const parts = t.split(/[\s;]+/).filter(Boolean), out = [];
    for (const p of parts) { const m = /^(\d+),(\d+)$/.exec(p);
      if (!m) throw new Error('Write coin cells as row,column pairs separated by spaces, e.g. 1,5 2,2 3,4 (or tap the board).');
      const i = +m[1], j = +m[2]; if (i < 1 || i > R || j < 1 || j > C) throw new Error(`Coin cell ${i},${j} is outside the ${R} × ${C} board.`);
      if (!out.some(q => q[0] === i && q[1] === j)) out.push([i, j]); }
    return out;
  };
  function buildRobot(cfg) {
    const R = toInt(cfg.rows, 'Rows', 1, 8), C = toInt(cfg.cols, 'Columns', 1, 8), coins = parseBoard(cfg.board, R, C);
    const c = (i, j) => has(coins, i, j) ? 1 : 0;
    const T = rankTable(R + 1, C + 1), rank = rankTable(R + 1, C + 1); let r = 0;
    for (let j = 0; j <= C; j++) { T[0][j] = 0; rank[0][j] = r++; } for (let i = 1; i <= R; i++) { T[i][0] = 0; rank[i][0] = r++; }
    const edge = r;
    for (let i = 1; i <= R; i++) for (let j = 1; j <= C; j++) { T[i][j] = Math.max(T[i - 1][j], T[i][j - 1]) + c(i, j); rank[i][j] = r++; }
    const base = { kind: 'robot', R, C, T, rank, coins };
    const M = (k, extra) => [['Cells filled', Math.max(0, k - edge) + ' / ' + R * C], ['Coins on board', coins.length], ...(extra || [])];
    const out = [fr(`Coins (dots) lie in ${coins.length} cells of the ${R} × ${C} board; c${sub('ij')} = 1 for a coin. The robot starts top-left and moves only right or down. F(i,j) = most coins it can bring to (i,j) = max{F(i−1,j), F(i,j−1)} + c${sub('ij')}, with F(0,j) = F(i,0) = 0.`,
      { ...base, k: edge, dep: [], metrics: M(edge), inv: 'Row 0 and column 0 are the zero borders. Tap a cell to add or remove a coin.' })];
    for (let i = 1; i <= R; i++) for (let j = 1; j <= C; j++) {
      const u = T[i - 1][j], l = T[i][j - 1], k = rank[i][j] + 1;
      out.push(fr(`F(${i},${j}) = max{F(${i - 1},${j}), F(${i},${j - 1})} + c${sub(`${i}${j}`)} = max{${u}, ${l}} + ${c(i, j)} = <b>${T[i][j]}</b>${c(i, j) ? ' (a coin here)' : ''}; best arrival ${u > l ? 'from above' : u < l ? 'from the left' : 'either way (tie)'}.`,
        { ...base, k, cur: [i, j], dep: [[i - 1, j], [i, j - 1]], metrics: M(k), inv: 'Amber: the cell above and the cell to the left, the only two ways in.' }));
    }
    const path = [[R, C]], got = []; let i = R, j = C;
    if (c(R, C)) got.push([R, C]);
    while (i > 1 || j > 1) {
      const u = i > 1 ? T[i - 1][j] : -1, l = j > 1 ? T[i][j - 1] : -1, up = u >= l;
      const why = i === 1 ? 'row 1: only the left neighbour' : j === 1 ? 'column 1: only the cell above' : `F(${i - 1},${j}) = ${u} ${u > l ? '&gt;' : u === l ? '=' : '&lt;'} F(${i},${j - 1}) = ${l}${u === l ? ', tie: go up' : ''}`;
      const ni = up ? i - 1 : i, nj = up ? j : j - 1;
      out.push(fr(`Backtrace at (${i},${j}), F = ${T[i][j]}: ${why}, so the robot came from (${ni},${nj}).`,
        { ...base, k: r, cur: [i, j], dep: [[ni, nj]], path: path.slice(), hit: got.slice(), metrics: M(r, [['Coins on path', got.length]]), inv: 'Walk back to the neighbour with the larger F: that is where the best path came from.' }));
      i = ni; j = nj; path.push([i, j]); if (c(i, j)) got.push([i, j]);
    }
    out.push(fr(`F(${R},${C}) = <b>${T[R][C]}</b> coins. The path (green) collects ${got.length ? got.slice().reverse().map(p => `(${p[0]},${p[1]})`).join(', ') : 'nothing'}. Time Θ(nm), space Θ(nm).`,
      { ...base, k: r, dep: [], path, hit: got, done: true, metrics: M(r, [['Coins on path', got.length]]), inv: 'A greedy robot that grabs the nearest coin can miss this optimum (L15 slide 18).' }));
    return out;
  }

  /* ── 5. LCS: LCS-Length and Output-LCS (slides 20-30) ── */
  function buildLcs(cfg) {
    const A = String(cfg.a).trim().toLowerCase(), B = String(cfg.b).trim().toLowerCase();
    if (!/^[a-z0-9]{1,10}$/.test(A) || !/^[a-z0-9]{1,10}$/.test(B)) throw new Error('Use 1 to 10 letters or digits (no spaces) for each string A and B.');
    const m = A.length, n = B.length, L = rankTable(m + 1, n + 1), P = rankTable(m + 1, n + 1), rank = rankTable(m + 1, n + 1); let r = 0;
    for (let i = 0; i <= m; i++) { L[i][0] = 0; rank[i][0] = r++; } for (let j = 1; j <= n; j++) { L[0][j] = 0; rank[0][j] = r++; }
    const edge = r;
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
      if (A[i - 1] === B[j - 1]) { L[i][j] = L[i - 1][j - 1] + 1; P[i][j] = '↖'; }
      else if (L[i - 1][j] >= L[i][j - 1]) { L[i][j] = L[i - 1][j]; P[i][j] = '↑'; }
      else { L[i][j] = L[i][j - 1]; P[i][j] = '←'; }
      rank[i][j] = r++;
    }
    const base = { kind: 'lcs', A, B, L, P, rank }; let matches = 0;
    const M = (k, extra) => [['Cells filled', Math.max(0, k - edge) + ' / ' + m * n], ['Matches (↖)', matches], ...(extra || [])];
    const out = [fr(`len(i,j) = length of an LCS of a${sub(1)}…a${sub('i')} and b${sub(1)}…b${sub('j')}, for A = <span class="lx-dp-mono">${A}</span>, B = <span class="lx-dp-mono">${B}</span>. Lines 1-2 of LCS-Length: column 0 and row 0 are 0 (an empty prefix has nothing in common).`,
      { ...base, k: edge, dep: [], metrics: M(edge), inv: 'Each cell also stores prev: the arrow to the cell it came from.' })];
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
      const k = rank[i][j] + 1; let h, dep;
      if (P[i][j] === '↖') { matches++; dep = [[i - 1, j - 1]];
        h = `a${sub(i)} = b${sub(j)} = ${A[i - 1]}: len(${i},${j}) = len(${i - 1},${j - 1}) + 1 = ${L[i - 1][j - 1]} + 1 = <b>${L[i][j]}</b>, prev = ↖ (line 5).`; }
      else { dep = [[i - 1, j], [i, j - 1]]; const u = L[i - 1][j], l = L[i][j - 1];
        h = `a${sub(i)} = ${A[i - 1]} ≠ b${sub(j)} = ${B[j - 1]}: len(${i - 1},${j}) = ${u} ${u >= l ? '≥' : '&lt;'} len(${i},${j - 1}) = ${l}, so len(${i},${j}) = <b>${L[i][j]}</b>, prev = ${P[i][j]} (${u >= l ? `lines 6-7${u === l ? ', a tie goes up' : ''}` : 'line 8'}).`; }
      out.push(fr(h, { ...base, k, cur: [i, j], dep, metrics: M(k), inv: P[i][j] === '↖' ? 'Equal letters: extend the diagonal answer by one.' : 'Different letters: copy the larger of above / left (≥ prefers above, the slides\' rule).' }));
    }
    const path = [], hit = []; let i = m, j = n, rev = '';
    while (i > 0 && j > 0) {
      path.push([i, j]); const p = P[i][j];
      if (p === '↖') { hit.push([i, j]); rev = A[i - 1] + rev; }
      const ni = p === '↑' ? i - 1 : p === '←' ? i : i - 1, nj = p === '←' ? j - 1 : p === '↑' ? j : j - 1;
      out.push(fr(p === '↖' ? `Output-LCS(${i},${j}): prev = ↖ (line 2), so call Output-LCS(${ni},${nj}) and then print a${sub(i)} = <b>${A[i - 1]}</b>. Letters waiting to print: <span class="lx-dp-mono">${rev}</span>.`
        : `Output-LCS(${i},${j}): prev = ${p} (line ${p === '↑' ? 3 : 4}), move to (${ni},${nj}) without printing.`,
        { ...base, k: r, cur: [i, j], dep: [[ni, nj]], path: path.slice(), hit: hit.slice(), outStr: rev, metrics: M(r, [['LCS letters found', rev.length]]), inv: 'Follow prev from (m,n); only ↖ cells contribute a letter.' }));
      i = ni; j = nj;
    }
    path.push([i, j]);
    out.push(fr(`Reached (${i},${j}): ${i === 0 ? 'i' : 'j'} = 0, return (line 1). The recursion prints on the way back: <b class="lx-dp-mono">${rev || '(empty)'}</b>, length len(${m},${n}) = ${L[m][n]}. LCS-Length takes O(mn) time and memory; Output-LCS O(m + n).`,
      { ...base, k: r, dep: [], path, hit, outStr: rev, done: true, metrics: M(r, [['LCS letters found', rev.length]]), inv: 'The length is unique; with other tie choices a different LCS of the same length can come out.' }));
    return out;
  }

  /* ── 6. 0/1 knapsack (slides 31-33) ── */
  const parseItems = s => {
    const parts = String(s).split(/[,;]+/).map(x => x.trim()).filter(Boolean);
    if (parts.length < 1 || parts.length > 6) throw new Error('Give 1 to 6 items as weight:value, separated by commas (e.g. 2:12, 1:10).');
    return parts.map(p => { const m = /^(\d+)\s*:\s*(\d+)$/.exec(p);
      if (!m) throw new Error(`“${p}” is not weight:value. Write items like 2:12, 1:10.`);
      const w = +m[1], v = +m[2]; if (w < 1 || w > 10 || v < 1 || v > 99) throw new Error('Each weight must be 1 to 10 and each value 1 to 99.');
      return [w, v]; });
  };
  function buildKnap(cfg) {
    const items = parseItems(cfg.items), W = toInt(cfg.W, 'Capacity W', 1, 10), n = items.length;
    const V = rankTable(n + 1, W + 1), rank = rankTable(n + 1, W + 1); let r = 0;
    for (let j = 0; j <= W; j++) { V[0][j] = 0; rank[0][j] = r++; } for (let i = 1; i <= n; i++) { V[i][0] = 0; rank[i][0] = r++; }
    const edge = r;
    for (let i = 1; i <= n; i++) for (let j = 1; j <= W; j++) { const [w, v] = items[i - 1];
      V[i][j] = w <= j && v + V[i - 1][j - w] > V[i - 1][j] ? v + V[i - 1][j - w] : V[i - 1][j]; rank[i][j] = r++; }
    const base = { kind: 'knap', items, W, V, rank };
    const M = (k, extra) => [['Cells filled', Math.max(0, k - edge) + ' / ' + n * W], ['Best so far', V[n][W] != null && k >= r ? V[n][W] : '–'], ...(extra || [])];
    const out = [fr(`Capacity W = ${W}, ${n} items. V[i,j] = best value using only items 1..i with capacity j. Initial conditions: V[0,j] = 0 and V[i,0] = 0.`,
      { ...base, k: edge, dep: [], metrics: M(edge), inv: 'Row i decides only about item i; everything else comes from row i−1.' })];
    for (let i = 1; i <= n; i++) for (let j = 1; j <= W; j++) {
      const [w, v] = items[i - 1], k = rank[i][j] + 1;
      if (j - w < 0) out.push(fr(`V[${i},${j}]: j − w${sub(i)} = ${j} − ${w} &lt; 0, item ${i} does not fit, so V[${i},${j}] = V[${i - 1},${j}] = <b>${V[i][j]}</b>.`,
        { ...base, k, cur: [i, j], dep: [[i - 1, j]], now: i, metrics: M(k), inv: 'Too heavy: copy the value straight above.' }));
      else { const t = v + V[i - 1][j - w];
        out.push(fr(`V[${i},${j}] = max{V[${i - 1},${j}], v${sub(i)} + V[${i - 1},${j - w}]} = max{${V[i - 1][j]}, ${v} + ${V[i - 1][j - w]}} = <b>${V[i][j]}</b> (${t > V[i - 1][j] ? `take item ${i}` : `leave item ${i}`}).`,
          { ...base, k, cur: [i, j], dep: [[i - 1, j], [i - 1, j - w]], now: i, metrics: M(k), inv: `Leave item ${i} (straight up) or take it (up and ${w} to the left, plus v${i} = ${v}).` })); }
    }
    let j = W; const take = [], path = [[n, W]];
    for (let i = n; i >= 1; i--) { const [w] = items[i - 1];
      if (V[i][j] === V[i - 1][j]) out.push(fr(`Backtrace at V[${i},${j}] = ${V[i][j]}: equal to the value above, V[${i - 1},${j}], so item ${i} is <b>not</b> in the knapsack; go up with the same j = ${j}.`,
        { ...base, k: r, cur: [i, j], dep: [[i - 1, j]], path: path.slice(), take: take.slice(), bt: i, metrics: M(r, [['Items taken', take.length]]), inv: 'Equal to the cell above means item i was not needed.' }));
      else { take.push(i); out.push(fr(`Backtrace at V[${i},${j}] = ${V[i][j]}: not equal to V[${i - 1},${j}] = ${V[i - 1][j]}, so item ${i} <b>is</b> in; go up to row ${i - 1} with j = ${j} − w${sub(i)} = ${j - w}.`,
        { ...base, k: r, cur: [i, j], dep: [[i - 1, j - w]], path: path.slice(), take: take.slice(), bt: i, metrics: M(r, [['Items taken', take.length]]), inv: 'Different from the cell above means item i was taken.' })); j -= w; }
      path.push([i - 1, j]);
    }
    take.reverse(); const tw = take.reduce((a, i) => a + items[i - 1][0], 0);
    const greedy = key => { const ord = items.map((it, k) => k).sort((a, b) => key(items[b]) - key(items[a]) || a - b); let cap = W, val = 0; const g = [];
      for (const k of ord) if (items[k][0] <= cap) { cap -= items[k][0]; val += items[k][1]; g.push(k + 1); } return [val, g]; };
    const [gv, gs] = greedy(it => it[1]), [rv, rs] = greedy(it => it[1] / it[0]);
    out.push(fr(`Optimal subset {${take.join(', ')}}: weight ${tw} ≤ ${W}, value <b>${V[n][W]}</b>. Time and space O(nW). For comparison, greedy by largest value takes {${gs.join(', ')}} = ${gv}; greedy by value/weight takes {${rs.join(', ')}} = ${rv}.`,
      { ...base, k: r, dep: [], path, hit: path.filter(([i, jj], q) => q < path.length - 1 && take.includes(i)), take, bt: 0, done: true, metrics: M(r, [['Items taken', take.length], ['Weight used', tw + ' / ' + W]]), inv: 'Greedy choices can miss the optimum; the table checks every capacity.' }));
    return out;
  }

  /* ── 7. Change-making c[p], s[p] (slides 34-37) ── */
  function buildChange(cfg) {
    const n = toInt(cfg.amount, 'Amount n', 1, 40);
    const raw = list(cfg.denoms).map(Number);
    if (!raw.length || raw.length > 6 || !raw.every(x => Number.isInteger(x) && x >= 1 && x <= 50)) throw new Error('Give 1 to 6 coin values d, whole numbers from 1 to 50, separated by commas.');
    const D = [...new Set(raw)].sort((a, b) => a - b);
    const c = [0], s = [null];
    for (let p = 1; p <= n; p++) { c[p] = null; s[p] = null;
      for (const d of D) if (d <= p && c[p - d] != null && (c[p] == null || c[p - d] + 1 < c[p])) { c[p] = c[p - d] + 1; s[p] = d; } }
    const base = { kind: 'change', n, D, c, s }; let looks = 0;
    const M = (k, extra) => [['c[p] filled', k + ' / ' + (n + 1)], ['Look-ups c[p − d]', looks], ...(extra || [])];
    const out = [fr(`Amount n = ${n}, coins D = {${D.join(', ')}}, unlimited of each. c[p] = fewest coins for p, s[p] = last coin used. c[0] = 0; for p &gt; 0, c[p] = min over d${sub('i')} ≤ p of c[p − d${sub('i')}] + 1.`,
      { ...base, k: 1, curs: [0], dep: [], metrics: M(1), inv: 'c[p] reads one earlier cell per coin value: p − d for each d ≤ p.' })];
    for (let p = 1; p <= n; p++) {
      const ok = D.filter(d => d <= p); looks += ok.length;
      const tr = ok.map(d => `d = ${d}: c[${p - d}] + 1 = ${c[p - d] == null ? '∞' : c[p - d] + 1}`).join('; ');
      const h = !ok.length ? `p = ${p}: no coin is ≤ ${p}, so c[${p}] = <b>∞</b> (cannot be made).`
        : c[p] == null ? `p = ${p}: ${tr}. All ∞, so c[${p}] = <b>∞</b>: ${p} cannot be made.`
        : `p = ${p}: ${tr}. Minimum ${c[p]}${ok.filter(d => c[p - d] != null && c[p - d] + 1 === c[p]).length > 1 ? ', first reached with the smallest d' : ''}, so c[${p}] = <b>${c[p]}</b>, s[${p}] = ${s[p]}.`;
      out.push(fr(h, { ...base, k: p + 1, cur: p, dep: ok.map(d => p - d), best: s[p] != null ? p - s[p] : null, metrics: M(p + 1), inv: 'Amber: c[p − d] for every coin d; the outlined one gives the minimum.' }));
    }
    if (c[n] == null) {
      out.push(fr(`c[${n}] = ∞: the amount ${n} has <b>no solution</b> with coins {${D.join(', ')}}.`, { ...base, k: n + 1, dep: [], none: true, done: true, metrics: M(n + 1), inv: 'Some amounts cannot be made at all; the table says so with ∞.' }));
      return out;
    }
    const path = [n], used = []; let p = n;
    while (p > 0) { const d = s[p]; used.push(d);
      out.push(fr(`Backtrace: s[${p}] = ${d}, so use a ${d} coin and go to p = ${p} − ${d} = ${p - d}. Coins so far: ${used.join(' + ')}.`,
        { ...base, k: n + 1, cur: p, dep: [p - d], path: path.slice(), used: used.slice(), metrics: M(n + 1, [['Coins used', used.length]]), inv: 's[p] remembers which coin gave the minimum.' }));
      p -= d; path.push(p); }
    out.push(fr(`Reached p = 0. Change for ${n}: ${used.join(' + ')} = ${n}, <b>${c[n]} coin${c[n] > 1 ? 's' : ''}</b>. Time O(n·m) for m coin values, space O(n).`,
      { ...base, k: n + 1, dep: [], path, used, done: true, metrics: M(n + 1, [['Coins used', used.length]]), inv: 'Greedy (largest coin first) would not always find this minimum.' }));
    return out;
  }

  const BUILD = { fib: buildFib, coin: buildCoin, binom: buildBinom, robot: buildRobot, lcs: buildLcs, knap: buildKnap, change: buildChange };

  // ── drawing ──
  function Grid({ f, rows, cols, colHead, rowHead, corner, body, onCell, colW = 54, extraCls = '' }) {
    const cls = (i, j) => {
      const v = body(i, j); if (v.na) return 'lx-dp-na';
      const filled = f.rank[i][j] != null && f.rank[i][j] < f.k;
      let k = 'lx-dp-cell' + (filled ? '' : ' lx-dp-unk') + (v.edge ? ' lx-dp-edge' : '');
      if (f.cur && f.cur[0] === i && f.cur[1] === j) k += ' lx-dp-cur';
      else if (has(f.dep, i, j)) k += ' lx-dp-dep';
      else if (has(f.hit, i, j)) k += ' lx-dp-hit';
      else if (has(f.path, i, j)) k += ' lx-dp-path';
      return k;
    };
    const ncol = cols.length + 1;
    return html`<table className=${'lx-dp-t ' + extraCls} style=${{ width: `min(100%, ${ncol * colW}px)` }}><thead><tr><th>${corner}</th>${cols.map(j => { const [a, b] = colHead(j); return html`<th key=${j}>${a}${b != null ? html`<em>${b}</em>` : null}</th>`; })}</tr></thead>
      <tbody>${rows.map(i => { const [a, b] = rowHead(i); return html`<tr key=${i}><th>${a}${b != null ? html`<em>${b}</em>` : null}</th>${cols.map(j => {
        const v = body(i, j), c = cls(i, j), filled = !v.na && f.rank[i][j] != null && f.rank[i][j] < f.k;
        return html`<td key=${j} className=${c} onClick=${onCell && !v.na ? () => onCell(i, j) : null}>${v.dot ? html`<span className="lx-dp-dot"></span>` : null}${v.na ? '' : filled ? html`${v.ar ? html`<span className="lx-dp-ar">${v.ar}</span>` : null}${v.v}` : (v.ar !== undefined ? html`<span className="lx-dp-ar"> </span>·` : '·')}</td>`; })}</tr>`; })}</tbody></table>`;
  }
  function Cards({ f, n, legend, top, mid, bot }) {
    const cls = k => { const filled = k < f.k; let c = 'lx-dp-card' + (filled ? '' : ' lx-dp-unk');
      if (f.cur === k || (f.curs && f.curs.includes(k) && !f.done)) c += ' lx-dp-cur';
      else if (f.dep && f.dep.includes(k)) c += ' lx-dp-dep' + (f.best === k ? ' lx-dp-best' : '');
      else if (f.path && f.path.includes(k)) c += ' lx-dp-path';
      return c; };
    return html`<div className="lx-dp-cards"><div className="lx-dp-card lx-dp-leg"><b>${legend[0]}</b>${legend[1]}<i>${legend[2]}</i></div>
      ${Array.from({ length: n }, (_, k) => html`<div key=${k} className=${cls(k)} style=${f.skip && f.skip.includes(k) ? { opacity: .55 } : null}><b>${top(k)}</b><span>${k < f.k ? mid(k) : '·'}</span><i>${bot(k)}</i></div>`)}</div>`;
  }
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

  function Diagram({ f, setCfg }) {
    if (f.kind === 'fib') return html`<div className="lx-dp-wrap"><${Cards} f=${f} n=${f.n + 1} legend=${['k', 'f(k)', 'naive ×']} top=${k => k} mid=${k => f.f[k]} bot=${k => '×' + f.times[k]} /></div>`;
    if (f.kind === 'coin') return html`<div className="lx-dp-wrap"><${Cards} f=${{ ...f, path: f.take }} n=${f.n + 1} legend=${['k', 'F(k)', 'coin']} top=${k => k} mid=${k => f.F[k]} bot=${k => k ? 'c=' + f.c[k] : '–'} />
      ${f.take ? html`<p className="lx-dp-out-line"><span>Coins taken: </span>${f.take.length ? f.take.slice().sort((a, b) => a - b).map(t => `c${t} = ${f.c[t]}`).join(', ') : '…'}${f.done ? html` <b>= ${f.F[f.n]}</b>` : null}</p>` : null}</div>`;
    if (f.kind === 'binom') return html`<div className="lx-dp-wrap"><${Grid} f=${f} rows=${range(0, f.n)} cols=${range(0, f.K)} corner=${'i\\j'} colHead=${j => [j]} rowHead=${i => [i]} body=${(i, j) => j > i ? { na: true } : { v: f.T[i][j] }} colW=${50} /></div>`;
    if (f.kind === 'robot') {
      const toggle = (i, j) => { if (!i || !j) return; const next = has(f.coins, i, j) ? f.coins.filter(p => !(p[0] === i && p[1] === j)) : [...f.coins, [i, j]];
        next.sort((a, b) => a[0] - b[0] || a[1] - b[1]); setCfg(c => ({ ...c, method: 'robot', board: next.map(p => p.join(',')).join(' ') })); };
      return html`<div className="lx-dp-wrap"><${Grid} f=${f} rows=${range(0, f.R)} cols=${range(0, f.C)} corner="" colHead=${j => [j]} rowHead=${i => [i]} extraCls="lx-dp-board lx-dp-tap"
        body=${(i, j) => ({ v: f.T[i][j], dot: has(f.coins, i, j), edge: !i || !j })} onCell=${toggle} colW=${50} />
        <p className="lx-dp-hint">Tap a board cell to add or remove a coin.</p></div>`;
    }
    if (f.kind === 'lcs') return html`<div className="lx-dp-wrap"><${Grid} f=${f} rows=${range(0, f.A.length)} cols=${range(0, f.B.length)} corner=${'i\\j'}
        colHead=${j => [j, j ? f.B[j - 1] : ' ']} rowHead=${i => [i, i ? f.A[i - 1] : ' ']} body=${(i, j) => ({ v: f.L[i][j], ar: i && j ? f.P[i][j] : ' ', edge: !i || !j })} colW=${46} />
      ${f.outStr != null ? html`<p className="lx-dp-out-line"><span>${f.done ? 'Output: ' : 'LCS letters found (printed left to right on return): '}</span><b className="lx-dp-mono">${f.outStr || '…'}</b></p>` : null}</div>`;
    if (f.kind === 'knap') return html`<div className="lx-dp-wrap"><div className="lx-dp-chips">${f.items.map(([w, v], k) => {
        const i = k + 1, c = f.take && f.take.includes(i) ? 'lx-dp-in' : f.bt != null && (f.done || i > f.bt) ? 'lx-dp-out' : '';
        return html`<span key=${k} className=${c + ((f.bt ? f.bt === i : f.now === i) ? ' lx-dp-now' : '')}>${i}: w=${w}, v=${v}</span>`; })}</div>
      <${Grid} f=${f} rows=${range(0, f.items.length)} cols=${range(0, f.W)} corner=${'i\\j'} colHead=${j => [j]} rowHead=${i => [i]} body=${(i, j) => ({ v: f.V[i][j], edge: !i || !j })} colW=${50} /></div>`;
    if (f.kind === 'change') return html`<div className="lx-dp-wrap"><div className="lx-dp-chips">${f.D.map(d => html`<span key=${d} className=${f.used && f.used.includes(d) ? 'lx-dp-in' : ''}>d = ${d}</span>`)}</div>
      <${Cards} f=${f} n=${f.n + 1} legend=${['p', 'c[p]', 's[p]']} top=${p => p} mid=${p => fmt(f.c[p])} bot=${p => p < f.k && f.s[p] != null ? f.s[p] : '–'} />
      ${f.used || f.none ? html`<p className="lx-dp-out-line"><span>${f.none ? 'Result: ' : 'Coins used: '}</span><b>${f.none ? 'no solution (∞)' : f.used.join(' + ') + (f.done ? ' = ' + f.n : '')}</b></p>` : null}</div>`;
    return null;
  }

  // ── inputs ──
  const METHODS = [['fib', 'Fibonacci: bottom-up vs naive'], ['coin', 'Coin-row'], ['binom', 'Binomial coefficient C(n,k)'], ['robot', 'Robot coin collecting'], ['lcs', 'Longest common subsequence'], ['knap', '0/1 knapsack'], ['change', 'Change-making']];
  function Controls({ cfg, setCfg }) {
    const inp = (k, label, w, wide) => html`<label className=${wide ? 'tl-wide' : ''}>${label}<input value=${cfg[k]} style=${w ? { maxWidth: w } : null} onInput=${e => { const v = e.target.value; setCfg(c => ({ ...c, [k]: v })); }} /></label>`;
    const m = cfg.method;
    return html`<label>Method<select value=${m} onChange=${e => { const v = e.target.value; setCfg(c => ({ ...c, method: v })); }}>${METHODS.map(([k, l]) => html`<option key=${k} value=${k}>${l}</option>`)}</select></label>
      ${m === 'fib' ? inp('fibN', 'n (2-25)') : null}
      ${m === 'coin' ? inp('coins', 'Coins c1, c2, … (up to 14)', null, true) : null}
      ${m === 'binom' ? html`${inp('bn', 'n (1-12)')}${inp('bk', 'k (0-min(n,7))')}` : null}
      ${m === 'robot' ? html`${inp('rows', 'Rows (1-8)')}${inp('cols', 'Columns (1-8)')}${inp('board', 'Coin cells row,col (or tap the board)', null, true)}` : null}
      ${m === 'lcs' ? html`${inp('a', 'A (up to 10)')}${inp('b', 'B (up to 10)')}` : null}
      ${m === 'knap' ? html`${inp('items', 'Items weight:value (up to 6)', null, true)}${inp('W', 'Capacity W (1-10)')}` : null}
      ${m === 'change' ? html`${inp('amount', 'Amount n (1-40)')}${inp('denoms', 'Coin values d (up to 6)', null, true)}` : null}`;
  }

  const DEF = { method: 'lcs', fibN: '5', coins: '5, 1, 2, 10, 6, 2', bn: '6', bk: '3', rows: '5', cols: '6', board: '1,5 2,2 2,4 3,4 3,6 4,3 4,6 5,1 5,5',
    a: 'president', b: 'providence', items: '2:12, 1:10, 3:20, 2:15', W: '5', amount: '16', denoms: '1, 5, 12, 25' };
  const P = (label, src, o) => ({ label, src, cfg: { ...DEF, ...o } });
  const COST = {
    fib: 'Bottom-up: Θ(n) additions and Θ(n) space (or two variables). Naive top-down recursion makes 2·f(n+1) − 1 calls, exponential in n, because it recomputes overlapping subproblems.',
    coin: 'Θ(n) time and Θ(n) space (slide 9). Backtrace: coin k is taken when c_k + F(k−2) > F(k−1); on a tie the coin is left (F(k−1)), which the slides do not need for their example.',
    binom: 'Θ(nk) time and Θ(nk) space (slide 14): row i fills j = 0..min(i, k). Values are exact integers; inputs are capped at n ≤ 12, k ≤ 7 to fit a phone.',
    robot: 'Θ(nm) time and Θ(nm) space (slide 19). Coins c_ij ∈ {0, 1}. Backtrace from (n, m) goes to the larger of F(i−1, j) and F(i, j−1); on a tie it goes up (any choice is optimal). Board capped at 8 × 8.',
    lcs: 'LCS-Length: O(mn) time and memory; Output-LCS: O(m + n) (slides 26-29). Ties follow the slides\' pseudocode: if len(i−1, j) ≥ len(i, j−1) the arrow is ↑, else ←. Strings capped at 10 characters.',
    knap: 'O(nW) time and space, pseudo-polynomial in W (slide 33). As in DPKnapsack, item i is taken only when v_i + V[i−1, j−w_i] > V[i−1, j] (strict); backtrace: V[i, j] = V[i−1, j] means item i is out. Capped at 6 items and W ≤ 10.',
    change: 'O(n·m) time for m coin values, O(n) space (slides 36-37). Coin values are tried smallest first and only a strictly smaller count replaces the minimum, so on ties s[p] keeps the smallest coin, matching s[16] = 1 on slide 37. ∞ marks amounts that cannot be made.'
  };

  window.LAB = window.LAB || {};
  window.LAB['dp'] = {
    meta: { title: 'Dynamic programming', group: 'Optimization', icon: '▦', desc: 'L14: tables of solved subproblems.',
      question: 'Which smaller answers does this cell depend on, and how do we read the solution back?',
      model: 'Each cell is a smaller instance (a prefix, a smaller capacity, a smaller amount). Fill the table in an order where every cell it reads is already solved, then backtrace from the answer cell to recover the choices.',
      watch: 'Blue: the cell being written. Amber: the cells its recurrence reads. Green: the backtrace. A dot (·) is not yet computed, not zero.' },
    defaults: DEF,
    presets: [
      P('Fibonacci f(0..5)', 'L14 slides 3-4', { method: 'fib', fibN: '5' }),
      P('Coin-row 5, 1, 2, 10, 6, 2', 'L14 slides 6-9 (exam Q9)', { method: 'coin' }),
      P('C(6, 3)', 'L14 slides 12-15', { method: 'binom' }),
      P('Robot, 5 × 6 board', 'L14 slides 17-19', { method: 'robot' }),
      P('LCS president / providence', 'L14 slides 21, 27-30', { method: 'lcs' }),
      P('LCS algorithm / alignment', 'L14 slide 22', { method: 'lcs', a: 'algorithm', b: 'alignment' }),
      P('Knapsack W = 5 (37)', 'L14 slides 32-33', { method: 'knap' }),
      P('Knapsack Final 1 Q2 (34)', 'Final 1 Q2', { method: 'knap', items: '1:9, 2:14, 3:13, 1:11', W: '5' }),
      P('Knapsack Final 2019 Q6 (37)', 'Final 2019 Credit Q6', { method: 'knap', items: '1:10, 2:15, 3:14, 1:12', W: '5' }),
      P('Change 16, {1, 5, 12, 25}', 'L14 slides 36-37', { method: 'change' }),
      P('Change 11, {1, 2, 5}', 'L14 slide 35', { method: 'change', amount: '11', denoms: '1, 2, 5' }),
      P('Change 10, {1, 5, 7}', 'L14 slide 34', { method: 'change', amount: '10', denoms: '1, 5, 7' }),
      P('Change 6, {5, 7}: no solution', 'L14 slide 34', { method: 'change', amount: '6', denoms: '5, 7' })
    ],
    Controls,
    build: cfg => { const b = BUILD[cfg.method]; if (!b) throw new Error('Choose a method.'); return b(cfg); },
    Diagram,
    legend: [['color-mix(in srgb, var(--c) 45%, var(--paper))', 'Cell being written'], ['color-mix(in srgb, #f2a93b 55%, var(--paper))', 'Cells it reads'], ['color-mix(in srgb, var(--ok) 45%, var(--paper))', 'Backtrace / solution']],
    cost: cfg => COST[cfg.method] || ''
  };
})();

/* ── paths ── */
/* ── lab: paths (Shortest paths: Dijkstra and BFS, L18-L19) ── */
(function () {
  const html = htm.bind(React.createElement);
  const CSS = `
.lx-paths-wrap{ max-width:600px; margin:0 auto; display:flex; flex-direction:column; gap:10px; color:var(--ink); }
.tl-stage svg.lx-paths-svg{ display:block; width:100%; max-width:470px; min-height:0; margin:0 auto; height:auto; }
.lx-paths-n circle{ fill:var(--paper); stroke:var(--ink); stroke-width:1.6; }
.lx-paths-n.q circle{ fill:color-mix(in srgb, var(--c) 18%, var(--paper)); stroke:var(--c); }
.lx-paths-n.s circle{ fill:color-mix(in srgb, var(--ok) 38%, var(--paper)); stroke:var(--ok); stroke-width:2.2; }
.lx-paths-n.u circle{ stroke:#f2a93b; stroke-width:5; }
.lx-paths-n text{ fill:var(--ink); font-weight:700; }
.lx-paths-e{ fill:none; stroke:var(--graphite); stroke-width:1.6; }
.lx-paths-e.t{ stroke:var(--c); stroke-width:3.6; }
.lx-paths-e.r{ stroke:#f2a93b; stroke-width:4.2; }
.lx-paths-e.p{ stroke:var(--ok); stroke-width:5; }
.lx-paths-e.x{ opacity:.3; }
.lx-paths-w{ fill:var(--ink); font-weight:600; }
.lx-paths-wb{ fill:var(--paper); opacity:.88; }
.lx-paths-bd rect{ fill:var(--paper); stroke:var(--c); stroke-width:1.4; }
.lx-paths-bd text{ fill:var(--c); font-weight:700; }
.lx-paths-bd.nw rect{ fill:color-mix(in srgb, #f2a93b 30%, var(--paper)); stroke:#f2a93b; }
.lx-paths-bd.nw text{ fill:var(--ink); }
.lx-paths-tw{ width:100%; overflow-x:auto; }
.lx-paths-t{ width:100%; border-collapse:collapse; table-layout:fixed; font-size:.8rem; text-align:center; }
.lx-paths-t th, .lx-paths-t td{ border:1px solid var(--line); padding:3px 0; overflow:hidden; }
.lx-paths-t th:first-child, .lx-paths-t td:first-child{ width:2.6em; color:var(--graphite); font-weight:600; }
.lx-paths-t thead th{ background:color-mix(in srgb, var(--c) 16%, var(--paper)); }
.lx-paths-t tr.par td{ color:var(--c); font-weight:700; }
.lx-paths-t tr.par td.nw{ background:color-mix(in srgb, #f2a93b 30%, var(--paper)); }
.lx-paths-t td span{ display:inline-block; min-width:1.6em; border-radius:4px; }
.lx-paths-t td span.min{ background:color-mix(in srgb, var(--ok) 38%, var(--paper)); font-weight:800; }
.lx-paths-t td span.nw{ color:var(--ink); background:color-mix(in srgb, #f2a93b 32%, var(--paper)); font-weight:700; }
.lx-paths-t tbody tr.cur td{ background:color-mix(in srgb, var(--c) 7%, var(--paper)); }
.lx-paths-cap{ font-size:.8rem; color:var(--graphite); text-align:center; margin:2px 0 0; }
.lx-paths-sets{ display:flex; flex-wrap:wrap; gap:6px 14px; justify-content:center; align-items:center; font-size:.9rem; }
.lx-paths-sets > span{ display:flex; flex-wrap:wrap; gap:4px; align-items:center; }
.lx-paths-chip{ display:inline-flex; flex-direction:column; align-items:center; min-width:2em; padding:2px 6px; border-radius:6px; border:1px solid var(--line); background:var(--paper); font-weight:700; line-height:1.2; }
.lx-paths-chip small{ font-size:.75rem; font-weight:700; color:var(--c); }
.lx-paths-chip.s{ background:color-mix(in srgb, var(--ok) 30%, var(--paper)); border-color:var(--ok); }
.lx-paths-chip.out{ opacity:.45; }
.lx-paths-chip.head{ border:2px solid #f2a93b; }
.lx-paths-chip.nw{ background:color-mix(in srgb, #f2a93b 28%, var(--paper)); }
.lx-paths-code{ font-family:var(--mono, ui-monospace, monospace); font-size:.78rem; line-height:1.5; border:1px solid var(--line); border-radius:8px; background:var(--paper); padding:6px 8px; }
.lx-paths-code div{ white-space:pre-wrap; padding:0 4px; border-radius:4px; }
.lx-paths-code div.on{ background:color-mix(in srgb, var(--c) 22%, var(--paper)); }
.lx-paths-code b{ font-family:var(--body); }
.lx-paths-pl{ display:grid; grid-template-columns:repeat(auto-fill, minmax(150px, 1fr)); gap:4px 10px; font-size:.88rem; }
.lx-paths-pl div{ padding:3px 8px; border-left:3px solid var(--line); }
.lx-paths-pl div.cur{ border-left-color:var(--ok); font-weight:700; background:color-mix(in srgb, var(--ok) 14%, var(--paper)); }
.lx-paths-pl div.no{ color:var(--graphite); }
`;
  if (!document.getElementById('lx-paths-css')) { const s = document.createElement('style'); s.id = 'lx-paths-css'; s.textContent = CSS; document.head.appendChild(s); }

  const INF = Infinity, sh = x => (x === INF ? '∞' : String(x));
  const cmp = (a, b) => a.localeCompare(b, undefined, { numeric: true });

  // hand layouts of the course graphs (positions as in the slide visuals ag-18 / ag-19); badge = where d[v] is written
  const LAYOUTS = {
    l18: { pos: { A: [40, 135], B: [150, 55], C: [150, 215], D: [290, 55], E: [290, 215] },
      badge: { A: [40, 95], B: [150, 17], C: [150, 253], D: [290, 17], E: [290, 253] } },
    l19: { pos: { A: [26, 100], B: [110, 32], C: [200, 100], D: [110, 195], G: [296, 32], E: [374, 100], F: [296, 195] },
      badge: { A: [26, 62], B: [110, -5], C: [200, 138], D: [110, 232], G: [296, -5], E: [374, 62], F: [296, 232] } },
    bfs: { pos: { a: [50, 50], b: [50, 130], c: [50, 210], d: [148, 90], e: [148, 170], f: [246, 50], g: [246, 130], h: [344, 50], i: [344, 170] },
      badge: { a: [14, 50], b: [14, 130], c: [14, 210], d: [148, 55], e: [148, 207], f: [246, 14], g: [210, 104], h: [344, 14], i: [344, 207] } }
  };

  function parse(cfg) {
    const directed = cfg.directed !== false, dij = cfg.method !== 'bfs';
    const parts = String(cfg.text || '').split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
    if (!parts.length) throw new Error('Type at least one edge, like A B 4 (from, to, weight).');
    if (parts.length > 24) throw new Error('At most 24 edges, so the graph stays readable on a phone.');
    const E = [], V = [], seen = new Set();
    for (const p of parts) {
      const m = p.match(/^([A-Za-z0-9]{1,2})\s*(?:->|→|-|–|\s)\s*([A-Za-z0-9]{1,2})(?:\s*[:=]?\s*(-?\d{1,3}))?$/);
      if (!m) throw new Error(`"${p}" is not an edge. Write it as two vertex names and a weight, like A B 4 (or A-B 4).`);
      const u = m[1], v = m[2], w = m[3] == null ? 1 : +m[3];
      if (u === v) throw new Error(`"${p}" is a loop from ${u} to itself; shortest paths never use one. Remove it.`);
      if (dij && w < 0) throw new Error(`The edge ${u}${directed ? '→' : '–'}${v} weighs ${w}. Dijkstra needs w(u, v) ≥ 0 for every edge (L18): with a negative weight EXTRACT-MIN can settle a vertex before its true shortest path is found, and a negative-weight cycle makes δ(s, v) = −∞ so no shortest path exists (L18 slides 10-11)${directed ? '' : '; in an undirected graph a negative edge is itself such a cycle, u–v–u'}. Use weights 0 to 99.`);
      if (w > 99) throw new Error(`Keep weights from 0 to 99 (the edge ${u} ${v} has ${w}).`);
      const k = directed ? u + '>' + v : [u, v].sort().join('|');
      if (seen.has(k)) throw new Error(`The edge ${u}${directed ? '→' : '–'}${v} is listed twice${directed ? '' : ' (in an undirected graph ' + u + ' ' + v + ' and ' + v + ' ' + u + ' are the same edge)'}.`);
      seen.add(k); E.push([u, v, w]);
      [u, v].forEach(x => { if (!V.includes(x)) V.push(x); });
    }
    if (V.length > 10) throw new Error(`At most 10 vertices (this graph has ${V.length}), so the table fits a phone.`);
    V.sort(cmp);
    const s = String(cfg.source || '').trim();
    if (!V.includes(s)) throw new Error(`The source "${s}" is not a vertex of the graph. Pick one of ${V.join(', ')}.`);
    const adj = Object.fromEntries(V.map(v => [v, []]));
    E.forEach(([u, v, w], k) => { adj[u].push([v, w, k]); if (!directed) adj[v].push([u, w, k]); });
    return { V, E, adj, s, directed, geo: geometry(V, E, directed, cfg.layout) };
  }

  // positions, edge curves and label spots; a hand layout is used when it places every vertex, otherwise a circle
  function geometry(V, E, directed, lay) {
    const L = LAYOUTS[lay], hand = L && V.every(v => L.pos[v]);
    const n = V.length, R = n <= 4 ? 95 : n <= 7 ? 120 : 135;
    const P = hand ? L.pos : Object.fromEntries(V.map((v, k) => [v, [180 + R * Math.cos(-Math.PI / 2 + 2 * Math.PI * k / n), 160 + R * Math.sin(-Math.PI / 2 + 2 * Math.PI * k / n)]]));
    const cx = V.reduce((a, v) => a + P[v][0], 0) / n, cy = V.reduce((a, v) => a + P[v][1], 0) / n;
    const B = Object.fromEntries(V.map(v => {
      if (hand && L.badge && L.badge[v]) return [v, L.badge[v]];
      const dx = P[v][0] - cx, dy = P[v][1] - cy, l = Math.hypot(dx, dy) || 1; return [v, [P[v][0] + dx / l * 38, P[v][1] + dy / l * 38]];
    }));
    const r = 19;
    const edges = E.map(([u, v]) => {
      const a = P[u], b = P[v], rev = directed && E.some(e => e[0] === v && e[1] === u);
      const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
      const bend = rev ? 20 : 0, c = [(a[0] + b[0]) / 2 + nx * bend, (a[1] + b[1]) / 2 + ny * bend];
      const to = (p, q, d) => { const ex = q[0] - p[0], ey = q[1] - p[1], el = Math.hypot(ex, ey) || 1; return [p[0] + ex / el * d, p[1] + ey / el * d]; };
      const s = to(a, c, r), e = to(b, c, r + (directed ? 1 : 0));
      const d = bend ? `M${s[0]},${s[1]} Q${c[0]},${c[1]} ${e[0]},${e[1]}` : `M${s[0]},${s[1]} L${e[0]},${e[1]}`;
      const mx = .25 * s[0] + .5 * c[0] + .25 * e[0], my = .25 * s[1] + .5 * c[1] + .25 * e[1];
      let sx = nx, sy = ny;
      if (!bend && ((mx - cx) * nx + (my - cy) * ny < 0)) { sx = -nx; sy = -ny; }
      return { d, lab: [mx + sx * 13, my + sy * 13] };
    });
    const xs = [], ys = [];
    V.forEach(v => { xs.push(P[v][0] - 24, P[v][0] + 24, B[v][0] - 22, B[v][0] + 22); ys.push(P[v][1] - 24, P[v][1] + 24, B[v][1] - 14, B[v][1] + 14); });
    edges.forEach(e => { xs.push(e.lab[0] - 12, e.lab[0] + 12); ys.push(e.lab[1] - 12, e.lab[1] + 12); });
    const x0 = Math.min(...xs) - 4, y0 = Math.min(...ys) - 4, x1 = Math.max(...xs) + 4, y1 = Math.max(...ys) + 4;
    return { P, B, edges, vb: [x0, y0, x1 - x0, y1 - y0].map(z => Math.round(z)) };
  }

  const DCODE = ['d[s] ← 0', 'for each v ∈ V − {s} do d[v] ← ∞', 'S ← ∅', 'Q ← V   ⊳ priority queue keyed on d', 'while Q ≠ ∅', '  do u ← EXTRACT-MIN(Q)', '     S ← S ∪ {u}', '     for each v ∈ Adj[u]', '       do if d[v] > d[u] + w(u, v)', '          then d[v] ← d[u] + w(u, v)', '               π[v] ← u   ⊳ DECREASE-KEY'];
  const BCODE = ['d[s] ← 0; d[v] ← ∞ for v ≠ s', 'ENQUEUE(Q, s)   ⊳ Q is a FIFO queue', 'while Q ≠ ∅', '  do u ← DEQUEUE(Q)', '     for each v ∈ Adj[u]', '       do if d[v] = ∞', '          then d[v] ← d[u] + 1', '               ENQUEUE(Q, v)'];
  const arrow = g => (g.directed ? '→' : '–');

  function readBack(g, d, pi, order, frames, base, wOf, unit) {
    const list = order.filter(v => v !== g.s).map(v => {
      if (d[v] === INF) return { v, p: null };
      const p = [v]; while (pi[p[0]]) p.unshift(pi[p[0]]);
      const ws = p.slice(1).map((x, k) => (unit ? 1 : wOf(p[k], x)));
      return { v, p, ws };
    });
    list.forEach((it, k) => {
      if (!it.p) return;
      const chain = it.p.slice(1).reverse().map(x => `π[${x}] = ${pi[x]}`).join(', ');
      const txt = `Read the path to ${it.v} back through PARENT: ${chain}. Reversed: ${it.p.join(' → ')}, ${unit ? `${it.p.length - 1} edge${it.p.length > 2 ? 's' : ''} = d[${it.v}] = ${d[it.v]}` : `weight ${it.ws.length > 1 ? it.ws.join(' + ') + ' = ' : ''}${d[it.v]} = d[${it.v}]`}.`;
      frames.push(Object.assign({}, base, { desc: txt, path: it.p, plist: list, pcur: it.v, line: [], inv: 'Every subpath of a shortest path is a shortest path (optimal substructure), so following π[v] backwards from any vertex retraces a shortest path from the source.' }));
    });
    return list;
  }

  function dijkstra(g) {
    const { V, adj, s } = g, d = {}, pi = {}, S = [], Q = V.slice(), rows = [], frames = [], order = [];
    let ext = 0, tests = 0, dec = 0;
    V.forEach(v => { d[v] = v === s ? 0 : INF; pi[v] = null; });
    const wOf = (a, b) => g.E.find(e => (e[0] === a && e[1] === b) || (!g.directed && e[0] === b && e[1] === a))[2];
    const cl = o => JSON.parse(JSON.stringify(o, (k, x) => (x === INF ? '∞' : x)));
    const snap = o => frames.push(Object.assign({ g, d: cl(d), pi: { ...pi }, S: S.slice(), Q: Q.slice(), rows: cl(rows), metrics: [['EXTRACT-MIN', ext], ['Relaxations tested', tests], ['DECREASE-KEY', dec], ['|S|', S.length]] }, o));
    rows.push({ cells: Object.fromEntries(V.map(v => [v, { t: sh(d[v]) }])) });
    snap({ line: [0, 1, 2, 3], desc: `Initialize: d[${s}] ← 0, d[v] ← ∞ for every other vertex, S ← ∅ and Q ← V = {${V.join(', ')}}, a priority queue keyed on d. Row 1 of the table holds these keys.`, inv: 'd[v] is the weight of the best path found so far; it starts as an upper bound ∞ and only ever decreases. d[v] ≥ δ(s, v) at all times (L18 Part I).' });
    while (Q.length) {
      let u = Q[0]; Q.forEach(v => { if (d[v] < d[u]) u = v; });
      const keys = Q.map(v => `${v}:${sh(d[v])}`).join(', ');
      rows[rows.length - 1].cells[u].min = true;
      Q.splice(Q.indexOf(u), 1); S.push(u); order.push(u); ext++;
      if (Q.length) rows.push({ after: u, cells: Object.fromEntries(V.map(v => [v, Q.includes(v) ? { t: sh(d[v]) } : { t: '' }])) });
      const reach = d[u] !== INF;
      snap({ u, line: [5, 6], desc: reach ? `u ← EXTRACT-MIN(Q) = ${u}: d[${u}] = ${d[u]} is the smallest key in Q = {${keys}}. S ← S ∪ {${u}} = {${S.join(', ')}}; d[${u}] = δ(${s}, ${u}) = ${d[u]} is now final.${adj[u].length ? '' : ` ${u} has no outgoing edges, so nothing is relaxed.`}`
        : `u ← EXTRACT-MIN(Q) = ${u}, but d[${u}] = ∞: no path from ${s} reaches ${u}. Relaxing its edges cannot change anything (∞ + w = ∞).`,
        inv: 'Greedy choice: the vertex in Q with the smallest d already has d = δ(s, u), because every other way to it leaves S through a vertex whose d is at least as large and weights are ≥ 0 (L18 Part III).' });
      if (!reach) { tests += adj[u].length; continue; }
      for (const [v, w] of adj[u]) {
        tests++;
        const nd = d[u] + w, row = rows[rows.length - 1];
        if (d[v] > nd) {
          const old = d[v]; d[v] = nd; pi[v] = u; dec++;
          if (row.cells[v]) row.cells[v] = { t: sh(nd), nw: true };
          snap({ u, rel: [u, v], ok: true, line: [8, 9, 10], desc: `Relax ${u}${arrow(g)}${v}: d[${v}] = ${sh(old)} > d[${u}] + w(${u}, ${v}) = ${d[u]} + ${w} = ${nd}, so d[${v}] ← ${nd} and π[${v}] ← ${u} (DECREASE-KEY).`, chg: v,
            inv: 'Relaxation: if the path through u is shorter, take it. Lemma (L18 Part II): once d[u] = δ(s, u) and (u, v) is relaxed, d[v] is correct whenever u precedes v on a shortest path.' });
        } else {
          const done = S.includes(v);
          snap({ u, rel: [u, v], ok: false, line: [8], desc: `Relax ${u}${arrow(g)}${v}: d[${v}] = ${sh(d[v])} ≤ d[${u}] + w(${u}, ${v}) = ${d[u]} + ${w} = ${nd}, so no change.${done ? ` (${v} is already in S: its d is final and never changes.)` : ''}`,
            inv: 'A failed test keeps the old, shorter path; π[v] keeps pointing to the vertex that gave it.' });
        }
      }
    }
    const reach = V.filter(v => d[v] !== INF), tree = V.filter(v => pi[v]).map(v => `${pi[v]}${arrow(g)}${v}`);
    const base = { g, d: frames[frames.length - 1].d, pi: { ...pi }, S: S.slice(), Q: [], rows: frames[frames.length - 1].rows, metrics: [['EXTRACT-MIN', ext], ['Relaxations tested', tests], ['DECREASE-KEY', dec], ['|S|', S.length]], done: true };
    frames.push(Object.assign({}, base, { line: [4], desc: `Q = ∅, so the algorithm stops. d = ${V.map(v => `${v}: ${sh(d[v])}`).join(', ')}. The PARENT row holds π; the edges (π[v], v) = ${tree.join(', ') || 'none'} form the shortest-path tree.${reach.length < V.length ? ` ${V.filter(v => d[v] === INF).join(', ')} cannot be reached from ${g.s}.` : ''}`, inv: 'Theorem: when Dijkstra stops, d[v] = δ(s, v) for every vertex v (nonnegative weights).' }));
    const plist = readBack(g, d, pi, order, frames, base, wOf, false);
    frames.forEach(f => { if (f.done && !f.plist) f.plist = plist; });
    return frames;
  }

  function bfs(g) {
    const { V, adj, s } = g, d = {}, pi = {}, Q = [], frames = [];
    let head = 0, scans = 0;
    V.forEach(v => { d[v] = INF; pi[v] = null; });
    const cl = o => JSON.parse(JSON.stringify(o, (k, x) => (x === INF ? '∞' : x)));
    const snap = o => frames.push(Object.assign({ g, d: cl(d), pi: { ...pi }, BQ: Q.slice(), head, metrics: [['DEQUEUE', head], ['ENQUEUE', Q.length], ['Edges scanned', scans]] }, o));
    snap({ line: [], desc: 'Unweighted graph: w(u, v) = 1 for every edge, so Dijkstra can be improved by using a simple FIFO queue instead of a priority queue. Every d starts at ∞ and Q is empty.' + (g.E.some(e => e[2] !== 1) ? ' (The weights you typed are ignored: BFS counts edges.)' : ''), inv: 'BFS measures distance in number of edges.' });
    d[s] = 0; Q.push(s);
    snap({ line: [0, 1], desc: `d[${s}] ← 0 and ENQUEUE(Q, ${s}).`, inv: 'The queue holds discovered vertices whose neighbours have not been scanned yet.' });
    while (head < Q.length) {
      const u = Q[head++], nw = [], old = [];
      for (const [v] of adj[u]) { scans++; if (d[v] === INF) { d[v] = d[u] + 1; pi[v] = u; Q.push(v); nw.push(v); } else old.push(v); }
      snap({ u, nw, line: nw.length ? [3, 4, 5, 6, 7] : [3, 4, 5], desc: `u ← DEQUEUE(Q) = ${u} (d = ${d[u]}). ` + (adj[u].length ? (nw.length ? `Neighbours with d = ∞: ${nw.map(v => `d[${v}] ← ${d[u]} + 1 = ${d[v]}`).join(', ')}; ENQUEUE ${nw.join(', ')}.` : 'Every neighbour already has a distance, so nothing is enqueued.') + (old.length ? ` (${old.join(', ')} already ha${old.length > 1 ? 've' : 's'} d < ∞ and ${old.length > 1 ? 'are' : 'is'} skipped.)` : '') : `${u} has no outgoing edges.`),
        inv: 'Invariant (L18 slide 59): if v comes after u in Q, then d[v] = d[u] or d[v] = d[u] + 1. The FIFO queue mimics Dijkstra’s priority queue.' });
    }
    const miss = V.filter(v => d[v] === INF);
    const base = { g, d: cl(d), pi: { ...pi }, BQ: Q.slice(), head, metrics: [['DEQUEUE', head], ['ENQUEUE', Q.length], ['Edges scanned', scans]], done: true };
    frames.push(Object.assign({}, base, { line: [2], desc: `Q is empty. Q received ${Q.join(' ')} with d = ${Q.map(v => d[v]).join(' ')}: d[v] is the number of edges on a shortest path from ${s}.${miss.length ? ` ${miss.join(', ')} stay ∞ (unreachable).` : ''} Time O(V + E).`, inv: 'Each vertex is enqueued at most once and each adjacency list scanned once: O(V + E).' }));
    const plist = readBack(g, d, pi, Q.slice(), frames, base, null, true);
    frames.forEach(f => { if (f.done && !f.plist) f.plist = plist; });
    return frames;
  }

  function build(cfg) {
    const g = parse(cfg);
    return cfg.method === 'bfs' ? bfs(g) : dijkstra(g);
  }

  const MK = [['g', 'var(--graphite)', 11], ['t', 'var(--c)', 13], ['r', '#f2a93b', 13], ['p', 'var(--ok)', 14]];
  function Graph({ f, dash }) {
    const g = f.g, G = g.geo, bfsM = !!f.BQ;
    const inS = v => (bfsM ? f.BQ.indexOf(v) >= 0 && f.BQ.indexOf(v) < f.head : f.S.includes(v));
    const inQ = v => (bfsM ? f.BQ.indexOf(v) >= f.head : f.Q.includes(v) && f.d[v] !== '∞');
    const pe = f.path ? f.path.slice(1).map((v, k) => [f.path[k], v]) : null;
    const isP = (a, b) => pe && pe.some(([x, y]) => (x === a && y === b) || (!g.directed && x === b && y === a));
    const isT = (a, b) => f.pi[b] === a || (!g.directed && f.pi[a] === b);
    const isR = (a, b) => f.rel && ((f.rel[0] === a && f.rel[1] === b) || (!g.directed && f.rel[0] === b && f.rel[1] === a));
    return html`<svg className="lx-paths-svg" viewBox=${G.vb.join(' ')} role="img" aria-label="The graph with the current distances">
      <defs>${MK.map(([k, c, s]) => html`<marker key=${k} id=${'lx-paths-a' + k} viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth=${s} markerHeight=${s} orient="auto"><path d="M0,0 L10,5 L0,10 z" style=${{ fill: c }} /></marker>`)}</defs>
      ${g.E.map(([a, b, w], k) => {
        const cls = isR(a, b) ? 'r' : isP(a, b) ? 'p' : pe ? 'x' : isT(a, b) ? 't' : '';
        return html`<path key=${'e' + k} d=${G.edges[k].d} className=${'lx-paths-e ' + cls} markerEnd=${g.directed ? `url(#lx-paths-a${cls && cls !== 'x' ? cls : 'g'})` : null} />`;
      })}
      ${!bfsM && g.E.map(([a, b, w], k) => { const [x, y] = G.edges[k].lab; return html`<g key=${'w' + k}><rect className="lx-paths-wb" x=${x - 11} y=${y - 11} width="22" height="22" rx="5" /><text className="lx-paths-w" x=${x} y=${y + 6} textAnchor="middle" fontSize="17">${w}</text></g>`; })}
      ${g.V.map(v => { const [x, y] = G.P[v]; return html`<g key=${v} className=${'lx-paths-n' + (inS(v) ? ' s' : inQ(v) ? ' q' : '') + (f.u === v || f.pcur === v ? ' u' : '')}><circle cx=${x} cy=${y} r="19" /><text x=${x} y=${y + 6.5} textAnchor="middle" fontSize="18">${v}</text></g>`; })}
      ${g.V.map(v => { const [x, y] = G.B[v], t = f.d[v] === '∞' ? (dash ? '-' : '∞') : f.d[v], wd = Math.max(26, String(t).length * 10 + 12); return html`<g key=${'b' + v} className=${'lx-paths-bd' + (f.chg === v || (f.nw && f.nw.includes(v)) ? ' nw' : '')}><rect x=${x - wd / 2} y=${y - 12} width=${wd} height="24" rx="7" /><text x=${x} y=${y + 6} textAnchor="middle" fontSize="17">${t}</text></g>`; })}
    </svg>`;
  }

  function Diagram({ f, cfg }) {
    const g = f.g, dash = !!cfg.dash, cellT = t => (t === '∞' && dash ? '-' : t);
    if (f.BQ) {
      return html`<div className="lx-paths-wrap">
        <${Graph} f=${f} />
        <div className="lx-paths-sets" aria-label="FIFO queue"><span><b>Q:</b>${f.BQ.length ? f.BQ.map((v, k) => html`<span key=${v} className=${'lx-paths-chip' + (k < f.head ? ' out' : '') + (k === f.head && !f.done ? ' head' : '') + (f.nw && f.nw.includes(v) ? ' nw' : '')}>${v}<small>${f.d[v]}</small></span>`) : html`<span className="lx-paths-cap">empty</span>`}</span></div>
        <p className="lx-paths-cap">Faded = already dequeued; the outlined one is the head of the FIFO queue. Numbers under each vertex are d.</p>
        ${f.plist && html`<${PList} f=${f} unit=${true} />`}
        <div className="lx-paths-code" aria-label="BFS pseudocode">${BCODE.map((l, k) => html`<div key=${k} className=${f.line.includes(k) ? 'on' : ''}>${l}</div>`)}</div>
      </div>`;
    }
    const nRow = f.rows.length;
    return html`<div className="lx-paths-wrap">
      <${Graph} f=${f} dash=${dash} />
      <div className="lx-paths-sets"><span><b>S =</b> {${f.S.join(', ')}}</span><span><b>Q =</b> {${f.Q.join(', ')}}</span></div>
      <div className="lx-paths-tw"><table className="lx-paths-t" aria-label="Distance table, one row per EXTRACT-MIN">
        <thead><tr className="par"><th>π</th>${g.V.map(v => html`<td key=${v} className=${f.chg === v ? 'nw' : ''}>${f.pi[v] || ''}</td>`)}</tr>
          <tr><th>#</th>${g.V.map(v => html`<th key=${v}>${v}</th>`)}</tr></thead>
        <tbody>${f.rows.map((r, k) => html`<tr key=${k} className=${k === nRow - 1 && !f.done ? 'cur' : ''}><td>${k + 1}</td>${g.V.map(v => { const c = r.cells[v]; return html`<td key=${v}>${c && c.t ? html`<span className=${c.min ? 'min' : c.nw ? 'nw' : ''}>${cellT(c.t)}</span>` : ''}</td>`; })}</tr>`)}</tbody>
      </table></div>
      <p className="lx-paths-cap">Row 1 is the initial d; each later row is written after one EXTRACT-MIN (settled columns left blank${dash ? ', ∞ written as -' : ''}). Green = the minimum, extracted next. π is the PARENT row.</p>
      ${f.plist && html`<${PList} f=${f} />`}
      <div className="lx-paths-code" aria-label="Dijkstra pseudocode">${DCODE.map((l, k) => html`<div key=${k} className=${f.line.includes(k) ? 'on' : ''}>${l}</div>`)}</div>
    </div>`;
  }
  function PList({ f, unit }) {
    return html`<div className="lx-paths-pl" aria-label="Shortest paths read back through PARENT">${f.plist.map(it => html`<div key=${it.v} className=${(f.pcur === it.v ? 'cur' : '') + (it.p ? '' : ' no')}>${it.p ? `${it.p.join('')} = ${unit ? it.p.length - 1 : it.ws.reduce((a, b) => a + b, 0)}` : `${it.v}: unreachable`}</div>`)}</div>`;
  }

  function Controls({ cfg, setCfg }) {
    const set = k => e => { const val = e.target.value; setCfg(c => ({ ...c, [k]: val })); };
    return html`
      <label>Method<select value=${cfg.method} onChange=${e => { const method = e.target.value; setCfg(c => ({ ...c, method })); }}><option value="dijkstra">Dijkstra (weighted)</option><option value="bfs">BFS (FIFO queue)</option></select></label>
      <label>Edges are<select value=${cfg.directed === false ? 'u' : 'd'} onChange=${e => { const directed = e.target.value === 'd'; setCfg(c => ({ ...c, directed })); }}><option value="d">Directed u → v</option><option value="u">Undirected u – v</option></select></label>
      <label>Source<input value=${cfg.source} maxLength="2" onInput=${set('source')} /></label>
      <label className="tl-wide">Edges · from to weight, comma separated<input value=${cfg.text} spellCheck="false" onInput=${set('text')} /></label>`;
  }

  const L18 = 'A B 10, A C 3, B C 1, B D 2, C B 4, C D 8, C E 2, D E 7, E D 9';
  const L19 = 'A B 5, A C 3, B G 1, B C 2, B E 3, C D 7, C E 7, D A 2, D F 6, E D 2, E F 1, G E 1';
  const BFSG = 'a b, a d, b c, b e, d b, d e, e c, e g, e i, f d, f h, g f, g i, h g, i h';
  const defaults = { method: 'dijkstra', directed: true, source: 'A', text: L18, layout: 'l18' };

  window.LAB = window.LAB || {};
  window.LAB.paths = {
    meta: { title: 'Shortest paths', group: 'Graphs & greedy', icon: '◎', desc: 'Dijkstra’s table and BFS, as in L18-L19.',
      question: 'Which vertex does EXTRACT-MIN settle next, and which d values does it improve?',
      model: 'Dijkstra keeps d[v], the best path weight found so far, and a parent π[v]. It repeatedly extracts the vertex in Q with the smallest d (now final) and relaxes its outgoing edges. BFS is the same idea with all weights 1 and a FIFO queue.',
      watch: 'Green vertices are in S: their d is final. Amber marks the edge being relaxed and every d that just improved. Blue edges are the current (π[v], v) tree.' },
    defaults,
    presets: [
      { label: 'Slide example: Dijkstra on A..E', src: 'L18 slides 16-26', cfg: defaults },
      { label: 'Exam table: Dijkstra on A..G', src: 'L19 slides 1-2 · Final 2019 Q7', cfg: { method: 'dijkstra', directed: true, source: 'A', text: L19, layout: 'l19', dash: true } },
      { label: 'Slide example: BFS on a..i', src: 'L18 slides 47-59', cfg: { method: 'bfs', directed: true, source: 'a', text: BFSG, layout: 'bfs' } }
    ],
    Controls, build, Diagram,
    legend: [['color-mix(in srgb, var(--ok) 45%, var(--paper))', 'In S / dequeued (final)'], ['color-mix(in srgb, var(--c) 30%, var(--paper))', 'In Q with d < ∞'], ['#f2a93b', 'Current vertex, edge, new d'], ['var(--c)', 'Tree edge (π[v], v)'], ['var(--ok)', 'Path read back']],
    cost: cfg => cfg.method === 'bfs'
      ? 'BFS: every edge counts 1 (weights are ignored). Each vertex is enqueued and dequeued once and each adjacency list is scanned once: O(V + E) (L18 slide 46). Adjacency lists follow the order the edges are typed; ties in the queue follow that order.'
      : 'Dijkstra needs every w(u, v) ≥ 0 (negative edges are rejected). Time = Θ(V)·T(EXTRACT-MIN) + Θ(E)·T(DECREASE-KEY): array O(V²), binary heap O(E lg V), Fibonacci heap O(E + V lg V) (L18 slides 34-42). EXTRACT-MIN breaks ties by vertex name (A before B); adjacency lists follow the typed edge order. Each relaxation that improves d is one implicit DECREASE-KEY. The table follows Dr. Basheer’s exam format (L19): one row per EXTRACT-MIN, settled columns blank; the L19 preset writes ∞ as - like the exam.'
  };
})();

/* ── mst ── */
/* ── lab: mst (Spanning trees: Kruskal and Prim, L15-L17) ── */
(function () {
  const html = htm.bind(React.createElement);
  const CSS = `
.lx-mst-wrap{ max-width:600px; margin:0 auto; display:flex; flex-direction:column; gap:10px; color:var(--ink); }
.tl-stage svg.lx-mst-svg{ display:block; width:100%; max-width:440px; min-height:0; margin:0 auto; height:auto; }
.lx-mst-n circle{ fill:var(--paper); stroke:var(--ink); stroke-width:1.6; }
.lx-mst-n.a circle{ fill:color-mix(in srgb, var(--ok) 38%, var(--paper)); stroke:var(--ok); stroke-width:2.2; }
.lx-mst-n.q circle{ fill:color-mix(in srgb, var(--c) 16%, var(--paper)); stroke:var(--c); }
.lx-mst-n.u circle{ stroke:#f2a93b; stroke-width:5; }
.lx-mst-n text{ fill:var(--ink); font-weight:700; }
.lx-mst-e{ fill:none; stroke:var(--graphite); stroke-width:1.6; stroke-linecap:round; }
.lx-mst-e.ok{ stroke:var(--ok); stroke-width:6; }
.lx-mst-e.cur{ stroke:#f2a93b; stroke-width:6; }
.lx-mst-e.no{ stroke:#d23c3c; stroke-width:2.4; stroke-dasharray:6 5; }
.lx-mst-e.nocur{ stroke:#d23c3c; stroke-width:4.5; stroke-dasharray:6 5; }
.lx-mst-e.cand{ stroke:var(--c); stroke-width:3; stroke-dasharray:7 5; }
.lx-mst-wb{ fill:var(--paper); opacity:.9; }
.lx-mst-w{ fill:var(--ink); font-weight:600; }
.lx-mst-bd rect{ fill:var(--paper); stroke:var(--c); stroke-width:1.4; }
.lx-mst-bd text{ fill:var(--c); font-weight:700; }
.lx-mst-bd.nw rect{ fill:color-mix(in srgb, #f2a93b 30%, var(--paper)); stroke:#f2a93b; }
.lx-mst-bd.nw text{ fill:var(--ink); }
.lx-mst-cap{ font-size:.8rem; color:var(--graphite); text-align:center; margin:0; }
.lx-mst-chips{ display:flex; flex-wrap:wrap; gap:4px; justify-content:center; }
.lx-mst-chips span{ font-size:.82rem; padding:2px 6px; border-radius:6px; border:1px solid var(--line); background:var(--paper); white-space:nowrap; }
.lx-mst-chips span.ok{ background:color-mix(in srgb, var(--ok) 30%, var(--paper)); border-color:var(--ok); font-weight:700; }
.lx-mst-chips span.no{ text-decoration:line-through; color:var(--graphite); border-color:#d23c3c; }
.lx-mst-chips span.cur{ outline:2.5px solid #f2a93b; outline-offset:0; font-weight:700; }
.lx-mst-sets{ display:flex; flex-wrap:wrap; gap:5px; justify-content:center; font-size:.9rem; }
.lx-mst-sets span{ padding:2px 8px; border-radius:99px; border:1.5px solid var(--line); background:var(--paper); }
.lx-mst-sets span.nw{ border-color:var(--ok); background:color-mix(in srgb, var(--ok) 22%, var(--paper)); font-weight:700; }
.lx-mst-sets span.hit{ border-color:#f2a93b; }
.lx-mst-h{ font-size:.8rem; font-weight:700; color:var(--graphite); text-align:center; margin:0; letter-spacing:.02em; }
.lx-mst-t{ width:100%; border-collapse:collapse; table-layout:fixed; font-size:.82rem; text-align:center; }
.lx-mst-t th, .lx-mst-t td{ border:1px solid var(--line); padding:3px 0; overflow:hidden; }
.lx-mst-t th:first-child{ width:2.8em; color:var(--graphite); }
.lx-mst-t thead th{ background:color-mix(in srgb, var(--c) 16%, var(--paper)); }
.lx-mst-t td.out{ color:var(--graphite); background:color-mix(in srgb, var(--ok) 14%, var(--paper)); }
.lx-mst-t td.nw{ background:color-mix(in srgb, #f2a93b 32%, var(--paper)); font-weight:700; }
.lx-mst-t th.u{ outline:2.5px solid #f2a93b; outline-offset:-2px; }
.lx-mst-code{ font-family:var(--mono, ui-monospace, monospace); font-size:.78rem; line-height:1.5; border:1px solid var(--line); border-radius:8px; background:var(--paper); padding:6px 8px; }
.lx-mst-code div{ white-space:pre-wrap; padding:0 4px; border-radius:4px; }
.lx-mst-code div.on{ background:color-mix(in srgb, var(--c) 22%, var(--paper)); }
`;
  if (!document.getElementById('lx-mst-css')) { const s = document.createElement('style'); s.id = 'lx-mst-css'; s.textContent = CSS; document.head.appendChild(s); }

  const INF = Infinity, sh = x => (x === INF ? '∞' : String(x));
  const cmp = (a, b) => a.localeCompare(b, undefined, { numeric: true });
  const fw = w => (w < 0 ? `(${w})` : w);
  const ek = (u, v) => [u, v].sort(cmp).join('|');

  // hand layouts from the slide visuals (ag-15 slide 10, ag-16 Prim, ag-17 Kruskal/Prim and the Final 2021 graph); lab = weight label spots
  const T19 = ([x, y]) => [Math.round((x - 110) * .93 + 24), Math.round((y - 155) * .93 + 26)];
  const LAYOUTS = {
    l16: { pos: { a: [139, 34], b: [40, 102], c: [236, 102], d: [331, 102], e: [40, 182], f: [236, 182], g: [331, 182], h: [139, 254] },
      lab: { 'a|b': [78, 58], 'a|c': [200, 58], 'b|c': [138, 92], 'c|d': [283, 90], 'b|e': [22, 142], 'b|h': [100, 168], 'c|f': [220, 142], 'f|g': [283, 196], 'e|h': [78, 232], 'f|h': [200, 232] },
      badge: { a: [139, -2], b: [40, 66], c: [236, 66], d: [331, 66], e: [40, 218], f: [236, 218], g: [331, 218], h: [139, 290] } },
    l17: { pos: Object.fromEntries(Object.entries({ a: [110, 155], b: [290, 155], c: [465, 155], d: [200, 240], e: [375, 240], f: [110, 333], g: [290, 333], h: [465, 333] }).map(([k, p]) => [k, T19(p)])),
      lab: Object.fromEntries([['a|b', 203, 141], ['b|c', 377, 141], ['a|d', 166, 192], ['b|d', 238, 192], ['a|f', 96, 244], ['d|f', 150, 280], ['d|g', 250, 276], ['b|g', 278, 244], ['b|e', 338, 190], ['c|e', 418, 190], ['c|h', 484, 244], ['e|g', 325, 280], ['e|h', 424, 276], ['f|g', 200, 349], ['g|h', 380, 349]].map(([k, x, y]) => [k, T19([x, y])])),
      badge: { a: [24, -12], b: [192, -12], c: [354, -12], d: [58, 105], e: [292, 105], f: [24, 222], g: [192, 222], h: [354, 222] } },
    exam: { pos: { A: [60, 44], B: [190, 26], C: [320, 44], G: [190, 116], D: [60, 186], E: [190, 216], F: [320, 186] },
      lab: { 'D|F': [250, 175] },
      badge: { A: [22, 12], B: [190, -10], C: [358, 12], G: [214, 154], D: [22, 218], E: [190, 252], F: [358, 218] } },
    l15: { pos: { 1: [40, 118], 2: [40, 298], 3: [160, 210], 4: [282, 298], 5: [282, 118], 6: [244, 30] },
      lab: { '1|6': [128, 62], '1|5': [160, 106], '1|3': [96, 152], '1|2': [24, 210], '2|3': [114, 270], '2|4': [160, 316], '3|5': [238, 178], '3|4': [208, 274], '4|5': [298, 210], '5|6': [276, 70] },
      badge: { 1: [40, 80], 2: [40, 336], 3: [160, 250], 4: [282, 336], 5: [320, 118], 6: [244, -6] } }
  };

  function parse(cfg) {
    const parts = String(cfg.text || '').split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
    if (!parts.length) throw new Error('Type at least one edge, like a b 4 (two vertices and a weight).');
    if (parts.length > 22) throw new Error('At most 22 edges, so the graph stays readable on a phone.');
    const E = [], V = [], seen = new Set();
    for (const p of parts) {
      const m = p.match(/^([A-Za-z0-9]{1,2})\s*(?:-|–|\s)\s*([A-Za-z0-9]{1,2})\s*[:=]?\s*(-?\d{1,3})$/);
      if (!m) throw new Error(`"${p}" is not an edge. Write two vertex names and a weight, like a b 4 (or a-b 4).`);
      const u = m[1], v = m[2], w = +m[3];
      if (u === v) throw new Error(`"${p}" is a loop; a spanning tree never uses one. Remove it.`);
      if (Math.abs(w) > 99) throw new Error(`Keep weights between −99 and 99 (the edge ${u} ${v} has ${w}).`);
      const k = ek(u, v); if (seen.has(k)) throw new Error(`The edge ${u}–${v} is listed twice (the graph is undirected, so ${u} ${v} and ${v} ${u} are the same edge).`);
      seen.add(k); E.push([u, v, w]); [u, v].forEach(x => { if (!V.includes(x)) V.push(x); });
    }
    if (V.length > 10) throw new Error(`At most 10 vertices (this graph has ${V.length}), so the key table fits a phone.`);
    V.sort(cmp);
    const adj = Object.fromEntries(V.map(v => [v, []])); E.forEach(([u, v, w]) => { adj[u].push([v, w]); adj[v].push([u, w]); });
    const st = [V[0]], vis = new Set(st); while (st.length) { const x = st.pop(); adj[x].forEach(([y]) => { if (!vis.has(y)) { vis.add(y); st.push(y); } }); }
    if (vis.size < V.length) throw new Error(`The graph is not connected (${V.filter(v => !vis.has(v)).join(', ')} cannot be reached from ${V[0]}), so it has no spanning tree. Add an edge that joins them to the rest.`);
    const root = String(cfg.root || '').trim();
    if (cfg.method === 'prim' && !V.includes(root)) throw new Error(`The root "${root}" is not a vertex. Pick one of ${V.join(', ')}.`);
    return { V, E, adj, root, geo: geometry(V, E, cfg.layout) };
  }

  function geometry(V, E, lay) {
    const L = LAYOUTS[lay], hand = L && V.every(v => L.pos[v]);
    const n = V.length, R = n <= 4 ? 95 : n <= 7 ? 120 : 135;
    const P = hand ? L.pos : Object.fromEntries(V.map((v, k) => [v, [180 + R * Math.cos(-Math.PI / 2 + 2 * Math.PI * k / n), 160 + R * Math.sin(-Math.PI / 2 + 2 * Math.PI * k / n)]]));
    const cx = V.reduce((a, v) => a + P[v][0], 0) / n, cy = V.reduce((a, v) => a + P[v][1], 0) / n;
    const B = Object.fromEntries(V.map(v => {
      if (hand && L.badge && L.badge[v]) return [v, L.badge[v]];
      const dx = P[v][0] - cx, dy = P[v][1] - cy, l = Math.hypot(dx, dy) || 1; return [v, [P[v][0] + dx / l * 38, P[v][1] + dy / l * 38]];
    }));
    const lab = E.map(([u, v]) => {
      const k = ek(u, v); if (hand && L.lab && L.lab[k]) return L.lab[k];
      const a = P[u], b = P[v], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      let nx = -(b[1] - a[1]) / len, ny = (b[0] - a[0]) / len; if ((mx - cx) * nx + (my - cy) * ny < 0) { nx = -nx; ny = -ny; }
      return [mx + nx * 12, my + ny * 12];
    });
    const xs = [], ys = [];
    V.forEach(v => { xs.push(P[v][0] - 22, P[v][0] + 22, B[v][0] - 20, B[v][0] + 20); ys.push(P[v][1] - 22, P[v][1] + 22, B[v][1] - 13, B[v][1] + 13); });
    lab.forEach(([x, y]) => { xs.push(x - 13, x + 13); ys.push(y - 12, y + 12); });
    const x0 = Math.min(...xs) - 4, y0 = Math.min(...ys) - 4, x1 = Math.max(...xs) + 4, y1 = Math.max(...ys) + 4;
    return { P, B, lab, vb: [x0, y0, x1 - x0, y1 - y0].map(Math.round) };
  }

  const KCODE = ['A ← ∅', 'for each vertex v ∈ V[G]', '    do MAKE-SET(v)', 'sort the edges of E into nondecreasing order by weight w', 'for each edge (u, v) ∈ E, in nondecreasing order', '    do if FIND-SET(u) ≠ FIND-SET(v)', '        then A ← A ∪ {(u, v)}', '             UNION(u, v)', 'return A'];
  const PCODE = ['Q ← V[G]', 'for each u ∈ Q', '    do key[u] ← ∞', '       π[u] ← NIL', 'key[r] ← 0', 'while Q ≠ ∅', '    do u ← EXTRACT-MIN(Q)', '       for each v ∈ Adj[u]', '           do if v ∈ Q and w(u, v) < key[v]', '               then π[v] ← u', '                    key[v] ← w(u, v)   ⊳ DECREASE-KEY'];

  function kruskal(g) {
    const par = Object.fromEntries(g.V.map(v => [v, v]));
    const find = x => (par[x] === x ? x : find(par[x]));
    const sets = () => { const m = {}; g.V.forEach(v => { const r = find(v); (m[r] = m[r] || []).push(v); }); return Object.values(m).sort((a, b) => cmp(a[0], b[0])); };
    const sorted = g.E.map((e, k) => [e, k]).sort((a, b) => a[0][2] - b[0][2] || a[1] - b[1]).map(x => x[1]);
    const st = {}, A = [], frames = []; let seen = 0, ok = 0, no = 0;
    const snap = o => frames.push(Object.assign({ g, st: { ...st }, A: A.slice(), sets: sets(), sorted: null, metrics: [['Edges examined', seen], ['Accepted (UNION)', ok], ['Skipped (cycle)', no], ['w(A)', A.reduce((s, k) => s + g.E[k][2], 0)]] }, o));
    snap({ line: [0, 1, 2], desc: `A ← ∅ and MAKE-SET(v) for every vertex: a forest of ${g.V.length} one-vertex trees {${g.V.join('}, {')}}.`, inv: 'Kruskal keeps a forest A; every edge of A belongs to some MST (cut theorem, L16).' });
    snap({ line: [3], sorted, desc: `Sort the ${g.E.length} edges into nondecreasing order by weight: ${sorted.map(k => g.E[k][2]).join(', ')}. Equal weights keep the order they were typed in.`, inv: 'Sorting costs O(E lg E), the dominant term.' });
    sorted.forEach(k => {
      const [u, v, w] = g.E[k], fu = find(u), fv = find(v); seen++;
      const su = sets().find(s => s.includes(u)), sv = sets().find(s => s.includes(v));
      if (fu !== fv) {
        par[fu] = fv; A.push(k); st[k] = 'ok'; ok++;
        const full = A.length === g.V.length - 1;
        snap({ line: [4, 5, 6, 7], sorted, cur: k, hit: [u, v], desc: `Edge (${u}, ${v}) = ${w}: FIND-SET(${u}) = {${su.join(', ')}} ≠ FIND-SET(${v}) = {${sv.join(', ')}}, so A ← A ∪ {(${u}, ${v})} and UNION(${u}, ${v}). It is a lightest edge joining two different trees, so it is safe.${full ? ` A now has |V| − 1 = ${A.length} edges: it is a spanning tree.` : ''}`, inv: 'An accepted edge is a light edge crossing the cut (its tree, the rest), so it is safe by the cut theorem.' });
      } else {
        st[k] = 'no'; no++;
        snap({ line: [4, 5], sorted, cur: k, hit: [u, v], desc: `Edge (${u}, ${v}) = ${w}: FIND-SET(${u}) = FIND-SET(${v}) = {${su.join(', ')}}: both ends are already in the same tree, so this edge would close a cycle. Skip it.`, inv: 'A spanning tree has no cycles, so an edge inside one tree is never added.' });
      }
    });
    const tot = A.reduce((s, k) => s + g.E[k][2], 0);
    snap({ line: [8], sorted, done: true, desc: `Return A = {${A.map(k => `(${g.E[k][0]}, ${g.E[k][1]})`).join(', ')}}: ${A.length} = |V| − 1 edges, total weight w(T) = ${A.map(k => fw(g.E[k][2])).join(' + ')} = ${tot}.`, inv: 'Kruskal: O(V) MAKE-SETs + O(E lg E) sort + O(E) FIND-SET/UNION = O(E lg V).', tot });
    return frames;
  }

  function prim(g) {
    const r = g.root, key = {}, pi = {}, inQ = {}, frames = [], order = [];
    let ext = 0, dk = 0;
    g.V.forEach(v => { key[v] = INF; pi[v] = null; inQ[v] = true; });
    const W = (u, v) => g.E.find(e => ek(e[0], e[1]) === ek(u, v))[2];
    const wT = () => order.reduce((s, e) => s + e[2], 0);
    const cl = o => JSON.parse(JSON.stringify(o, (k, x) => (x === INF ? '∞' : x)));
    const snap = o => frames.push(Object.assign({ g, key: cl(key), pi: { ...pi }, inQ: { ...inQ }, order: order.slice(), metrics: [['EXTRACT-MIN', ext], ['DECREASE-KEY', dk], ['Tree edges', order.length], ['w(T) so far', wT()]] }, o));
    snap({ line: [0, 1, 2, 3], desc: `Q ← V; key[u] ← ∞ and π[u] ← NIL for every vertex. Every vertex is in Q = V − A.`, inv: 'key[v] = the weight of the lightest edge joining v to the tree A (∞ if none yet).' });
    key[r] = 0;
    snap({ line: [4], chg: [r], desc: `key[${r}] ← 0: the tree A will grow from the root r = ${r}.`, inv: 'Prim grows one single tree; Q = V − A is a min-priority queue keyed on key[v].' });
    while (g.V.some(v => inQ[v])) {
      let u = null; g.V.forEach(v => { if (inQ[v] && (u === null || key[v] < key[u])) u = v; });
      const keys = g.V.filter(v => inQ[v]).map(v => `${v}:${sh(key[v])}`).join(', ');
      inQ[u] = false; ext++; if (pi[u]) order.push([pi[u], u, key[u]]);
      snap({ u, line: [5, 6], desc: `u ← EXTRACT-MIN(Q) = ${u}, the smallest key in Q = {${keys}}. ` + (pi[u] ? `The light edge (${pi[u]}, ${u}) = ${key[u]} joins the tree: it is the lightest edge crossing the cut (A, V − A).` : `${u} is the root, so no edge is added.`), inv: 'Cut theorem (L16): the lightest edge between A and V − A belongs to some MST, so adding it is safe.' });
      const chg = [], kept = [];
      g.adj[u].forEach(([v, w]) => { if (!inQ[v]) return; if (w < key[v]) { chg.push(`key[${v}] ← ${w} (was ${sh(key[v])}), π[${v}] ← ${u}`); key[v] = w; pi[v] = u; dk++; } else kept.push(`key[${v}] stays ${sh(key[v])} since w(${u}, ${v}) = ${w} ≥ ${sh(key[v])}`); });
      const ch = g.adj[u].filter(([v]) => frames.length && pi[v] === u && inQ[v]).map(([v]) => v);
      if (chg.length || kept.length) snap({ u, chg: ch, line: chg.length ? [7, 8, 9, 10] : [7, 8], desc: `For each v ∈ Adj[${u}] still in Q: ` + [chg.join('; '), kept.join('; ')].filter(Boolean).join('. ') + '.' + (chg.length ? ' (Each change is one DECREASE-KEY.)' : ''), inv: 'Only vertices still in Q are updated: tree vertices keep their final key and π.' });
    }
    snap({ line: [5], done: true, desc: `Q = ∅. The tree edges, in the order they were added: ${order.map(([a, b, w]) => `(${a}, ${b}) = ${w}`).join(', ')}. The edges {(v, π[v])} form the MST, w(T) = ${order.map(e => fw(e[2])).join(' + ')} = ${wT()}.`, inv: 'Prim: Θ(V) EXTRACT-MIN + Θ(E) DECREASE-KEY. Array O(V²), binary heap O(E lg V), Fibonacci heap O(E + V lg V).' });
    return frames;
  }

  function build(cfg) {
    const g = parse(cfg);
    return cfg.method === 'prim' ? prim(g) : kruskal(g);
  }

  function Graph({ f }) {
    const g = f.g, G = g.geo, P = G.P, pr = !!f.key;
    const kind = k => {
      const [u, v] = g.E[k];
      if (pr) {
        const tree = (f.pi[v] === u && !f.inQ[v]) || (f.pi[u] === v && !f.inQ[u]);
        const cand = (f.pi[v] === u && f.inQ[v]) || (f.pi[u] === v && f.inQ[u]);
        const isNew = f.u && ((f.pi[f.u] === u && f.u === v) || (f.pi[f.u] === v && f.u === u)) && f.line.includes(6);
        return isNew ? 'cur' : tree ? 'ok' : cand ? 'cand' : '';
      }
      const s = f.st[k]; return f.cur === k ? (s === 'ok' ? 'cur' : 'nocur') : s || '';
    };
    const nodeCls = v => pr ? (f.inQ[v] ? ' q' : ' a') + (f.u === v ? ' u' : '') : (f.hit && f.hit.includes(v) ? ' u' : '');
    return html`<svg className="lx-mst-svg" viewBox=${G.vb.join(' ')} role="img" aria-label="The graph and the growing spanning tree">
      ${g.E.map(([u, v], k) => html`<line key=${'e' + k} x1=${P[u][0]} y1=${P[u][1]} x2=${P[v][0]} y2=${P[v][1]} className=${'lx-mst-e ' + kind(k)} />`)}
      ${g.E.map(([, , w], k) => { const [x, y] = G.lab[k]; return html`<g key=${'w' + k}><rect className="lx-mst-wb" x=${x - 12} y=${y - 11} width="24" height="22" rx="5" /><text className="lx-mst-w" x=${x} y=${y + 6} textAnchor="middle" fontSize="17">${w}</text></g>`; })}
      ${g.V.map(v => html`<g key=${v} className=${'lx-mst-n' + nodeCls(v)}><circle cx=${P[v][0]} cy=${P[v][1]} r="18" /><text x=${P[v][0]} y=${P[v][1] + 6} textAnchor="middle" fontSize="18">${v}</text></g>`)}
      ${pr && g.V.map(v => { const [x, y] = G.B[v], t = f.key[v], wd = Math.max(26, String(t).length * 10 + 12); return html`<g key=${'b' + v} className=${'lx-mst-bd' + (f.chg && f.chg.includes(v) ? ' nw' : '')}><rect x=${x - wd / 2} y=${y - 12} width=${wd} height="24" rx="7" /><text x=${x} y=${y + 6} textAnchor="middle" fontSize="17">${t}</text></g>`; })}
    </svg>`;
  }

  function Diagram({ f }) {
    const g = f.g;
    if (f.key) {
      return html`<div className="lx-mst-wrap">
        <${Graph} f=${f} />
        <p className="lx-mst-cap">Boxes show key[v]. Green = in the tree A; blue = still in Q; dashed blue = (v, π[v]) for v in Q.</p>
        <table className="lx-mst-t" aria-label="key and parent of each vertex"><thead><tr><th>v</th>${g.V.map(v => html`<th key=${v} className=${f.u === v ? 'u' : ''}>${v}</th>`)}</tr></thead>
          <tbody><tr><th>key</th>${g.V.map(v => html`<td key=${v} className=${(f.chg && f.chg.includes(v) ? 'nw' : '') + (f.inQ[v] ? '' : ' out')}>${f.key[v]}</td>`)}</tr>
          <tr><th>π</th>${g.V.map(v => html`<td key=${v} className=${(f.chg && f.chg.includes(v) ? 'nw' : '') + (f.inQ[v] ? '' : ' out')}>${f.pi[v] || '·'}</td>`)}</tr></tbody></table>
        <p className="lx-mst-cap">Q = {${g.V.filter(v => f.inQ[v]).join(', ')}}${f.order.length ? ` · tree edges: ${f.order.map(([a, b]) => a + b).join(', ')}` : ''}</p>
        <div className="lx-mst-code" aria-label="MST-PRIM pseudocode">${PCODE.map((l, k) => html`<div key=${k} className=${f.line.includes(k) ? 'on' : ''}>${l}</div>`)}</div>
      </div>`;
    }
    const newSet = f.cur != null && f.st[f.cur] === 'ok' ? f.sets.find(s => s.includes(g.E[f.cur][0])) : null;
    const hitSet = f.cur != null && f.st[f.cur] === 'no' ? f.sets.find(s => s.includes(g.E[f.cur][0])) : null;
    return html`<div className="lx-mst-wrap">
      <${Graph} f=${f} />
      ${f.sorted && html`<p className="lx-mst-h">EDGES IN SORTED ORDER</p><div className="lx-mst-chips" aria-label="Edges in sorted order">${f.sorted.map(k => html`<span key=${k} className=${(f.st[k] || '') + (f.cur === k ? ' cur' : '')}>${g.E[k][0]}${g.E[k][1]} ${g.E[k][2]}</span>`)}</div>`}
      <p className="lx-mst-h">FOREST (one set per tree)</p>
      <div className="lx-mst-sets" aria-label="Disjoint sets">${f.sets.map((s, k) => html`<span key=${k} className=${s === newSet ? 'nw' : s === hitSet ? 'hit' : ''}>{${s.join(', ')}}</span>`)}</div>
      <div className="lx-mst-code" aria-label="MST-KRUSKAL pseudocode">${KCODE.map((l, k) => html`<div key=${k} className=${f.line.includes(k) ? 'on' : ''}>${l}</div>`)}</div>
    </div>`;
  }

  function Controls({ cfg, setCfg }) {
    return html`
      <label>Method<select value=${cfg.method} onChange=${e => { const method = e.target.value; setCfg(c => ({ ...c, method })); }}><option value="kruskal">Kruskal (sorted edges)</option><option value="prim">Prim (key, π, Q)</option></select></label>
      ${cfg.method === 'prim' && html`<label>Root r<input value=${cfg.root} maxLength="2" onInput=${e => { const root = e.target.value; setCfg(c => ({ ...c, root })); }} /></label>`}
      <label className="tl-wide">Edges · u v weight, comma separated<input value=${cfg.text} spellCheck="false" onInput=${e => { const text = e.target.value; setCfg(c => ({ ...c, text })); }} /></label>`;
  }

  const G16 = 'a b 6, a c 12, b c 5, c d 9, b e 14, b h 8, c f 7, f g 15, e h 3, f h 10';
  const G17 = 'a b 12, b c 8, a d 2, b d 9, a f 5, d f 8, d g 7, b g 3, b e 1, c e 9, c h 11, e g 3, e h 5, f g 1, g h 10';
  const GEX = 'A G 1, B C 1, F E 1, A B 2, C G 4, B G 3, A D 3, C F 3, D E 5, D G 5, G F 6, D F 4';
  const G15 = '1 6 4, 1 5 4, 1 3 3, 1 2 3, 2 3 3, 2 4 4, 3 5 2, 3 4 2, 4 5 3, 5 6 2';
  const defaults = { method: 'prim', root: 'f', text: G16, layout: 'l16' };

  window.LAB = window.LAB || {};
  window.LAB.mst = {
    meta: { title: 'Spanning trees', group: 'Graphs & greedy', icon: '⌁', desc: 'Kruskal and Prim, as in L16-L17.',
      question: 'Which edge is the safe one to add next, and why does it never close a cycle?',
      model: 'Both methods add a light edge crossing a cut (the cut theorem, L16). Kruskal scans all edges from lightest to heaviest and joins two different trees of a forest (FIND-SET / UNION). Prim grows one tree from a root r, keeping for every vertex outside it key[v] = the lightest edge to the tree.',
      watch: 'Green edges are in the tree; amber is the edge being decided; red dashed edges were skipped because they would close a cycle. In Prim, blue dashed edges are the current (v, π[v]) candidates.' },
    defaults,
    presets: [
      { label: 'Slide example: Prim from f (w = 53)', src: 'L16 slides 26-39', cfg: defaults },
      { label: 'Slide example: Kruskal (w = 25)', src: 'L17 slides 18-21', cfg: { method: 'kruskal', root: 'a', text: G17, layout: 'l17' } },
      { label: 'Slide example: Prim from a (w = 25)', src: 'L17 slides 22, 24-26', cfg: { method: 'prim', root: 'a', text: G17, layout: 'l17' } },
      { label: 'Exam: Prim from A', src: 'Final 2021 Q17', cfg: { method: 'prim', root: 'A', text: GEX, layout: 'exam' } },
      { label: 'Exam: Kruskal order', src: 'Final 2021 Q18', cfg: { method: 'kruskal', root: 'A', text: GEX, layout: 'exam' } },
      { label: 'Greedy MST from node 1 (cost 12)', src: 'L15 slide 10', cfg: { method: 'prim', root: '1', text: G15, layout: 'l15' } }
    ],
    Controls, build, Diagram,
    legend: [['var(--ok)', 'Tree edge / vertex in A'], ['#f2a93b', 'Edge being decided, key just changed'], ['#d23c3c', 'Skipped: would close a cycle'], ['var(--c)', 'Prim: (v, π[v]) for v in Q']],
    cost: cfg => (cfg.method === 'prim'
      ? 'MST-PRIM (L16): Θ(V) EXTRACT-MIN + Θ(E) implicit DECREASE-KEY. Array O(V²) (best for dense graphs), binary heap O(E lg V), Fibonacci heap O(E + V lg V). EXTRACT-MIN breaks ties by vertex name; the test is strict (w(u, v) < key[v]), so an equal-weight edge never replaces π[v]. On L15 slide 10 this picks 1–3 where the slide’s picture uses 2–3: both cost 3, so both trees cost 12 (an MST need not be unique when weights repeat).'
      : 'MST-KRUSKAL (L17): O(V) MAKE-SET + O(E lg E) sort + O(E) FIND-SET/UNION; since lg E ≤ 2 lg V the total is O(E lg V). Equal weights keep the typed order (a stable sort). Final 2021 Q18: Kruskal takes (A,G), (B,C), (F,E), (A,B), skips (B,G), then (A,D) and (C,F) (all weight 3) for w(T) = 11. The exam’s chosen answer lists (C,F) before a final (D,E); that order has the right first five edges but (D,E) = 5 is never taken, because (A,D) = 3 already joins D.')
      + ' The graph must be connected and undirected; negative weights are allowed (an MST only compares weights).'
  };
})();

/* ── huffman ── */
/* ── lab: huffman (Huffman codes, L15 slide 9, L17 slides 28-37) ── */
// HUFFMAN(C) exactly as on L17 slide 37: Q = C (min-priority queue), n − 1 times z.left = x = EXTRACT-MIN(Q), z.right = y = EXTRACT-MIN(Q),
// z.f = x.f + y.f, INSERT(Q, z); 0 on left edges, 1 on right edges. Ties go to the node that entered Q first (engine of the slide visual ag-17).
(function () {
  const { useState, useEffect, useRef } = React;
  const html = htm.bind(React.createElement);
  const AMB = '#f2a93b';
  const CSS = `
.lx-huffman-q{ display:flex; flex-wrap:wrap; gap:5px; align-items:center; margin:0 0 6px; font-size:13px; }
.lx-huffman-q > b{ font-size:13px; color:var(--graphite); margin-right:2px; }
.lx-huffman-q span{ display:inline-flex; gap:4px; align-items:baseline; font-size:13.5px; padding:3px 8px; border-radius:6px; border:1px solid var(--line); background:var(--paper); color:var(--ink); white-space:nowrap; }
.lx-huffman-q span em{ font-style:normal; font-weight:700; }
.lx-huffman-q span.lx-huffman-xy{ background:color-mix(in srgb, ${AMB} 40%, var(--paper)); border-color:${AMB}; }
.lx-huffman-q span.lx-huffman-z{ background:color-mix(in srgb, var(--c) 22%, var(--paper)); border-color:var(--c); font-weight:700; }
.lx-huffman-q span small{ font-size:12px; color:var(--graphite); }
.lx-huffman-op{ font-size:14px; color:var(--ink); text-align:center; margin:2px 0 6px; line-height:1.45; }
.lx-huffman-svg{ display:block; width:100%; height:auto; margin:0 auto; }
.lx-huffman-tbl{ border-collapse:collapse; margin:10px auto 0; font-size:13.5px; color:var(--ink); }
.lx-huffman-tbl th, .lx-huffman-tbl td{ border:1px solid var(--line); padding:4px 7px; text-align:center; }
.lx-huffman-tbl th{ background:var(--paper-2); font-weight:700; }
.lx-huffman-tbl td.lx-huffman-cw{ font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-weight:700; color:var(--c); }
.lx-huffman-tbl td.lx-huffman-fx{ font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; color:var(--graphite); }
.lx-huffman-tbl tfoot td{ font-weight:700; background:var(--paper-2); }
.lx-huffman-sum{ font-size:14px; text-align:center; color:var(--ink); margin:8px 0 0; line-height:1.5; }
`;
  if (!document.getElementById('lx-huffman-css')) { const s = document.createElement('style'); s.id = 'lx-huffman-css'; s.textContent = CSS; document.head.appendChild(s); }

  // ── input ──
  function parseFreq(txt) {
    const parts = String(txt || '').split(/[,;\n]+/).map(s => s.trim()).filter(Boolean), out = [];
    if (!parts.length) throw new Error('Type characters with their frequencies, like A:5, B:9, C:12.');
    for (const p of parts) {
      const m = p.match(/^(\S{1,2}?)\s*[:=\s]\s*(\d+)$/u);
      if (!m) throw new Error(`"${p}" should be a character and its frequency, like A:20 (one or two characters, a whole number).`);
      if (+m[2] < 1 || +m[2] > 999) throw new Error(`${m[1]}: frequencies must be whole numbers from 1 to 999.`);
      if (out.some(o => o.c === m[1])) throw new Error(`${m[1]} appears twice. Each character needs one frequency.`);
      out.push({ c: m[1], f: +m[2] });
    }
    if (out.length < 2) throw new Error('Give at least 2 characters: a code needs a choice between 0 and 1.');
    if (out.length > 10) throw new Error('At most 10 characters, so the tree fits a phone.');
    return out;
  }

  // ── slides' remarks for the worked examples ──
  const NOTES = {
    'ก36ข17ค17ง15จ10ฉ5': 'The slide\'s tree (L17 slide 34) draws จ left of ฉ and 34 left of 30, so it reads ก 0, ข 100, ค 101, ง 110, จ 1110, ฉ 1111. HUFFMAN(C) on slide 37 sets z.left = x, the smaller one, so here ฉ is left of จ and 30 left of 34: some bits differ, every length and B(T) = 243 are the same.',
    'A22B12C24D6E27F9': 'The slide (L15 slide 9) gives A 00, B 100, C 01, D 1010, E 11, F 1011: it draws the merged 27 (B, D, F) left of E 27. Those two tie; here the tie goes to E, which entered Q first, so E is the left child (E 10, B 110, D 1110, F 1111). Same lengths, same 2.42 bits per character.',
    'A20B30C15D5E8F22': 'This matches the notes exactly: A 00, F 01, B 11, C 101, D 1000, E 1001, 2.41 bits per character.'
  };

  const fmt = x => (Math.round(x * 100) / 100).toString();
  function build(cfg) {
    const C = parseFreq(cfg.text), n = C.length;
    let id = 0, seq = 0;
    const Q = C.map(x => ({ c: x.c, f: x.f, id: 'L' + id++, seq: seq++, nm: x.c }));
    const leaves = Q.slice();
    const pick = () => { let b = 0; Q.forEach((q, k) => { if (q.f < Q[b].f || (q.f === Q[b].f && q.seq < Q[b].seq)) b = k; }); return Q.splice(b, 1)[0]; };
    const qv = (arr, mark = {}) => arr.slice().sort((a, b) => a.f - b.f || a.seq - b.seq).map(q => ({ id: q.id, nm: q.nm, f: q.f, m: mark[q.id] || '' }));
    const total = C.reduce((s, x) => s + x.f, 0), Lfix = Math.max(1, Math.ceil(Math.log2(n)));
    const frames = [];
    let cost = 0;
    const met = (i, q, extra = []) => [['Iteration i', i ? `${i} of ${n - 1}` : `0 of ${n - 1}`], ['Nodes in Q', q], ['Σ f (characters)', total], ['Σ z.f so far', cost], ...extra];
    frames.push({ phase: 'init', k: 0, hot: [], Q: qv(Q),
      desc: `n = |C| = ${n}; Q ← C: a min-priority queue keyed on f (built as a min-heap in O(n)). Each character is a one-node tree. The loop runs n − 1 = ${n - 1} times.`,
      html: `n = |C| = ${n}; Q ← C: a <b>min-priority queue</b> keyed on f (built as a min-heap in O(n)). Each character is a one-node tree. The loop runs n − 1 = <b>${n - 1}</b> times.`,
      inv: 'Q always holds the roots of the forest. Greedy choice: the two least frequent trees go deepest, as siblings.', metrics: met(0, Q.length) });
    let root = null;
    for (let i = 1; i < n; i++) {
      const before = Q.slice(), x = pick(), y = pick();
      const tie = before.some(q => q !== x && q !== y && (q.f === y.f)) || x.f === y.f;
      const z = { f: x.f + y.f, l: x, r: y, id: 'Z' + i, seq: seq++, nm: x.nm + y.nm, ord: i };
      frames.push({ phase: 'ext', k: i - 1, hot: [x.id, y.id], Q: qv(before, { [x.id]: 'x', [y.id]: 'y' }), x: [x.nm, x.f], y: [y.nm, y.f],
        desc: `i = ${i}: x = EXTRACT-MIN(Q) = ${x.nm} (${x.f}), then y = EXTRACT-MIN(Q) = ${y.nm} (${y.f}): the two smallest frequencies.${tie ? ' Ties go to the node that entered Q first.' : ''}`,
        html: `i = ${i}: x = EXTRACT-MIN(Q) = <b>${x.nm} (${x.f})</b>, then y = EXTRACT-MIN(Q) = <b>${y.nm} (${y.f})</b>: the two smallest frequencies.${tie ? ' Ties go to the node that entered Q first.' : ''}`,
        inv: 'x is the smaller of the two, so it becomes the left child (bit 0), y the right child (bit 1).', metrics: met(i, before.length - 2) });
      Q.push(z); cost += z.f; root = z;
      frames.push({ phase: 'ins', k: i, hot: [z.id, x.id, y.id], Q: qv(Q, { [z.id]: 'z' }), z: [z.nm, z.f],
        desc: `Allocate z: z.left = ${x.nm}, z.right = ${y.nm}, z.f = ${x.f} + ${y.f} = ${z.f}; INSERT(Q, z). Q now has ${Q.length} node${Q.length > 1 ? 's' : ''}.`,
        html: `Allocate z: z.left = ${x.nm}, z.right = ${y.nm}, z.f = ${x.f} + ${y.f} = <b>${z.f}</b>; INSERT(Q, z). Q now has ${Q.length} node${Q.length > 1 ? 's' : ''}.`,
        inv: 'Every merge adds z.f to the cost: each character under z gets one more bit. So B(T) is the sum of all z.f.', metrics: met(i, Q.length) });
    }
    // codewords and cost
    const code = {}, dep = {}; (function w(v, s) { if (v.l) { w(v.l, s + '0'); w(v.r, s + '1'); } else { code[v.c] = s || '0'; dep[v.c] = s.length || 1; } })(root, '');
    const B = C.reduce((s, x) => s + x.f * dep[x.c], 0), key = C.map(x => x.c + x.f).join(''), note = NOTES[key] || '';
    const fix = {}; C.forEach((x, k) => { fix[x.c] = k.toString(2).padStart(Lfix, '0'); });
    const rows = C.map(x => ({ c: x.c, f: x.f, cw: code[x.c], d: dep[x.c], fd: x.f * dep[x.c], fx: fix[x.c] }));
    const fin = [['B(T)', B], ['Average bits / char', fmt(B / total)], [`Fixed ${Lfix}-bit code`, Lfix * total]];
    frames.push({ phase: 'codes', k: n - 1, hot: [], Q: qv(Q), rows, B, total, Lfix,
      desc: `Return EXTRACT-MIN(Q), the root (${root.f}). Read 0 on every left edge and 1 on every right edge: ${rows.map(r => r.c + ' = ' + r.cw).join(', ')}. No codeword is a prefix of another: every character is a leaf.`,
      html: `Return EXTRACT-MIN(Q), the root (<b>${root.f}</b>). Read 0 on every left edge and 1 on every right edge: ${rows.map(r => r.c + ' = <b>' + r.cw + '</b>').join(', ')}. No codeword is a prefix of another: every character is a leaf.`,
      inv: `A full binary tree: ${n} leaves and ${n - 1} internal nodes (L17 slide 35). Rare characters sit deep and get long codewords.`, metrics: met(n - 1, 1, fin) });
    const save = Lfix * total - B, line = `B(T) = Σ f(c)·d(c) = ${rows.map(r => r.f + '·' + r.d).join(' + ')} = ${B} bits, so ${fmt(B / total)} bits per character on average. A fixed-length code needs ⌈lg ${n}⌉ = ${Lfix} bits each: ${Lfix}·${total} = ${Lfix * total} bits${save > 0 ? `, so Huffman saves ${save} bits (${fmt(100 * save / (Lfix * total))} %)` : ''}.`;
    frames.push({ phase: 'cost', k: n - 1, hot: [], Q: qv(Q), rows, B, total, Lfix,
      desc: line + (note ? ' ' + note : ''), html: line.replace(` = ${B} bits`, ` = <b>${B}</b> bits`) + (note ? ' ' + note : ''),
      inv: 'B(T) also equals the sum of the internal node weights, the Σ z.f counted during the loop. Huffman\'s tree has the minimum B(T) of all prefix codes.', metrics: met(n - 1, 1, fin) });
    frames[0].tree = root; frames[0].leaves = leaves.map(l => l.id);
    return frames;
  }

  // ── drawing: the final tree's layout (leaves on the bottom row, in tree order) with the nodes not made yet hidden ──
  function layout(root) {
    const all = [], lv = []; let maxD = 0;
    const walk = (v, d) => { v.d = d; maxD = Math.max(maxD, d); all.push(v); if (v.l) { walk(v.l, d + 1); walk(v.r, d + 1); } else lv.push(v); };
    walk(root, 0);
    const X = {}; lv.forEach((v, k) => { X[v.id] = k + .5; });
    const pos = v => { if (!v.l) return X[v.id]; X[v.id] = (pos(v.l) + pos(v.r)) / 2; return X[v.id]; }; pos(root);
    return { all, X, maxD, nl: lv.length };
  }
  function Diagram({ f, frames }) {
    const ref = useRef(null), [w, setW] = useState(0);
    useEffect(() => { const el = ref.current; if (!el) return; setW(el.getBoundingClientRect().width); if (!window.ResizeObserver) return; const ro = new ResizeObserver(e => setW(e[0].contentRect.width)); ro.observe(el); return () => ro.disconnect(); }, []);
    const root = frames[0].tree, L = layout(root), SL = 40, GY = 54, TOP = 22;
    const VW = L.nl * SL + 12, W0 = w || 600, sc = Math.min(W0, VW * 1.6) / VW, m = Math.max(1, 12.6 / (13 * sc));
    const FB = 14 * m, FS = 13 * m;
    const px = v => 6 + L.X[v.id] * SL, py = v => TOP + (v.l ? v.d : L.maxD) * GY + (v.l ? 0 : 6);
    const VH = TOP + L.maxD * GY + 6 + 26 * m + 6;
    const shown = v => !v.l || v.ord <= f.k, hot = new Set(f.hot);
    const inner = L.all.filter(v => v.l && shown(v)), lvs = L.all.filter(v => !v.l);
    const lw = 16 * m, lh = 20 * m;
    const edges = inner.map(v => { const x = px(v), y = py(v);
      return html`<g key=${'e' + v.id}>${[[v.l, '0', -1], [v.r, '1', 1]].map(([c, b, s]) => { const cx = px(c), cy = py(c) - (c.l ? 0 : lh), mx = (x + cx) / 2, my = (y + cy) / 2;
        return html`<g key=${b}><line x1=${x} y1=${y} x2=${cx} y2=${cy} stroke=${hot.has(v.id) ? AMB : 'var(--graphite)'} strokeWidth=${hot.has(v.id) ? 3 : 1.6} />
          <text x=${mx + s * 7 * m} y=${my} textAnchor="middle" dy=".35em" fontSize=${FS} fontWeight="700" style=${{ fill: 'var(--c)', paintOrder: 'stroke', stroke: 'var(--paper)', strokeWidth: '3px' }}>${b}</text></g>`; })}</g>`; });
    const box = (v, wdt, hgt, kids) => { const h = hot.has(v.id);
      return html`<g key=${v.id} transform=${`translate(${px(v)},${py(v)})`}><rect x=${-wdt / 2} y=${-hgt / 2} width=${wdt} height=${hgt} rx="5" fill=${h ? `color-mix(in srgb, ${AMB} 42%, var(--paper))` : v.l ? 'var(--paper)' : 'color-mix(in srgb, var(--c) 14%, var(--paper))'} stroke=${h ? AMB : 'var(--c)'} strokeWidth=${h ? 2.6 : 1.4} />${kids}</g>`; };
    const nodesI = inner.map(v => { const wd = Math.max(28, String(v.f).length * FS * .62 + 12); return box(v, wd, 22 * m, html`<text textAnchor="middle" dy=".35em" fontSize=${FS} fontWeight="700" style=${{ fill: 'var(--ink)' }}>${v.f}</text>`); });
    const nodesL = lvs.map(v => box(v, Math.min(SL - 4, 32 * m), 2 * lh, html`<text textAnchor="middle" y=${-lh * .28} dy=".35em" fontSize=${FB} fontWeight="700" style=${{ fill: 'var(--ink)' }}>${v.c}</text><text textAnchor="middle" y=${lh * .5} dy=".35em" fontSize=${FS} style=${{ fill: 'var(--ink)' }}>${v.f}</text>`));
    void lw;
    const y0 = Math.max(0, Math.min(...inner.map(v => py(v)), py(lvs[0]) - lh) - 20 * m);
    const fin = f.phase === 'codes' || f.phase === 'cost';
    return html`<div ref=${ref}>
      <div className="lx-huffman-q" aria-label="Priority queue Q"><b>Q (by f):</b>${f.Q.map(q => html`<span key=${q.id} className=${q.m === 'z' ? 'lx-huffman-z' : q.m ? 'lx-huffman-xy' : ''}>${q.m ? html`<small>${q.m} =</small>` : null}<em>${q.nm}</em> ${q.f}</span>`)}</div>
      ${f.phase === 'ext' ? html`<p className="lx-huffman-op">x = ${f.x[0]} (${f.x[1]}), y = ${f.y[0]} (${f.y[1]}) leave Q</p>` : f.phase === 'ins' ? html`<p className="lx-huffman-op">z = ${f.z[0]}: f = <b>${f.z[1]}</b> enters Q</p>` : null}
      <svg className="lx-huffman-svg" viewBox=${`0 ${y0.toFixed(1)} ${VW} ${(VH - y0).toFixed(1)}`} style=${{ maxWidth: (VW * 1.6).toFixed(0) + 'px' }} role="img" aria-label="Huffman tree">${edges}${nodesI}${nodesL}</svg>
      ${fin ? html`<table className="lx-huffman-tbl"><thead><tr><th>c</th><th>f</th><th>code</th><th>d</th><th>f·d</th><th>fixed</th></tr></thead>
        <tbody>${f.rows.map(r => html`<tr key=${r.c}><td><b>${r.c}</b></td><td>${r.f}</td><td className="lx-huffman-cw">${r.cw}</td><td>${r.d}</td><td>${r.fd}</td><td className="lx-huffman-fx">${r.fx}</td></tr>`)}</tbody>
        <tfoot><tr><td>Σ</td><td>${f.total}</td><td></td><td></td><td>${f.B}</td><td>${f.Lfix * f.total}</td></tr></tfoot></table>
        <p className="lx-huffman-sum">B(T) = <b>${f.B}</b> bits · ${fmt(f.B / f.total)} bits/char · fixed ${f.Lfix} bits/char = ${f.Lfix * f.total} bits</p>` : null}
    </div>`;
  }

  function Controls({ cfg, setCfg }) {
    return html`<label className="tl-wide">Characters and frequencies (2 to 10, f from 1 to 999)<input value=${cfg.text} placeholder="A:5, B:9, C:12, D:13, E:16, F:45" onInput=${e => { const v = e.target.value; setCfg(c => ({ ...c, text: v })); }} /></label>`;
  }

  const THAI = 'ก:36, ข:17, ค:17, ง:15, จ:10, ฉ:5';
  window.LAB = window.LAB || {};
  window.LAB.huffman = {
    meta: {
      title: 'Huffman codes', group: 'Graphs & greedy', icon: '⑂', desc: 'HUFFMAN(C) with its min-priority queue (L15, L17).',
      question: 'Why does merging the two least frequent trees give the cheapest prefix code?',
      model: 'A prefix code is a full binary tree: characters are leaves, 0 = left edge, 1 = right edge, and the codeword length is the leaf depth d(c). HUFFMAN(C) keeps the forest roots in a min-priority queue Q and n − 1 times merges the two smallest: z.left = x, z.right = y, z.f = x.f + y.f.',
      watch: 'Watch Q: the two smallest leave, their sum enters. The cost B(T) = Σ f(c)·d(c) equals the sum of all merged weights z.f.'
    },
    defaults: { text: THAI },
    presets: [
      { label: 'Thai example: B(T) = 243', src: 'L17 slides 29-30, 34, 37', cfg: { text: THAI } },
      { label: 'A 22, B 12, C 24, D 6, E 27, F 9: 2.42 bits', src: 'L15 slide 9', cfg: { text: 'A:22, B:12, C:24, D:6, E:27, F:9' } },
      { label: 'A 20, B 30, C 15, D 5, E 8, F 22: 2.41 bits', src: 'Final 2018 I Q5 / II Q8, notes L17', cfg: { text: 'A:20, B:30, C:15, D:5, E:8, F:22' } }
    ],
    Controls, build, Diagram,
    legend: [['color-mix(in srgb, var(--c) 14%, var(--paper))', 'Character (leaf)'], ['var(--c)', 'Merged node z (outlined)'], [AMB, 'x, y, z of this step']],
    cost: 'Q is a min-heap: building it is O(n), and the n − 1 iterations each do two EXTRACT-MIN and one INSERT in O(lg n), so HUFFMAN(C) is O(n lg n) (L17 slide 37). Conventions: z.left = x, the smaller node, gets bit 0; equal frequencies leave Q in the order they entered it (characters in input order, merged nodes when created). The slides\' own drawings sometimes put the larger child on the left; that swaps bits but never changes a codeword length or B(T). The fixed-length code uses ⌈lg n⌉ bits per character.'
  };
})();

/* ── reduction ── */
/* ── lab: reduction (P, NP and reductions: 3-CNF SAT to CLIQUE and SAT truth tables, L20) ── */
(function () {
  const html = htm.bind(React.createElement);
  const CSS = `
.lx-reduction-wrap{ max-width:600px; margin:0 auto; display:flex; flex-direction:column; gap:10px; color:var(--ink); }
.tl-stage svg.lx-reduction-svg{ display:block; width:100%; max-width:430px; min-height:0; margin:0 auto; height:auto; }
.lx-reduction-f{ display:flex; flex-wrap:wrap; gap:4px 6px; justify-content:center; align-items:center; font-size:.95rem; }
.lx-reduction-cl{ display:inline-flex; flex-wrap:wrap; align-items:center; gap:2px 4px; padding:3px 7px; border-radius:8px; border:2px solid var(--line); background:var(--paper); white-space:nowrap; }
.lx-reduction-cl.ok{ background:color-mix(in srgb, var(--ok) 16%, var(--paper)); }
.lx-reduction-cl.no{ background:color-mix(in srgb, #d23c3c 14%, var(--paper)); }
.lx-reduction-cl small{ font-size:.75rem; font-weight:700; color:var(--graphite); margin-right:2px; }
.lx-reduction-lit.T{ font-weight:800; text-decoration:underline; text-decoration-color:var(--ok); text-decoration-thickness:3px; }
.lx-reduction-lit.F{ color:var(--graphite); }
.lx-reduction-op{ color:var(--graphite); font-weight:700; }
.lx-reduction-v circle{ stroke-width:2.2; }
.lx-reduction-v text{ fill:var(--ink); font-weight:700; }
.lx-reduction-v.dim{ opacity:.25; }
.lx-reduction-e{ stroke:var(--graphite); stroke-width:1.5; opacity:.55; }
.lx-reduction-e.nw{ stroke:var(--c); stroke-width:2.6; opacity:1; }
.lx-reduction-e.k{ stroke:#d23c3c; stroke-width:4.5; opacity:1; }
.lx-reduction-e.faint{ opacity:.18; }
.lx-reduction-e.miss{ stroke:#d23c3c; stroke-width:2; stroke-dasharray:4 5; opacity:.9; }
.lx-reduction-ct{ font-weight:700; }
.lx-reduction-row{ display:flex; flex-wrap:wrap; gap:6px; justify-content:center; align-items:center; font-size:.85rem; }
.lx-reduction-row button{ font:inherit; font-size:.9rem; font-weight:700; padding:4px 10px; border-radius:8px; border:1.5px solid var(--line); background:var(--paper); color:var(--ink); cursor:pointer; }
.lx-reduction-row button.T{ border-color:var(--ok); background:color-mix(in srgb, var(--ok) 26%, var(--paper)); }
.lx-reduction-box{ border:1px solid var(--line); border-radius:8px; background:var(--paper); padding:8px 10px; font-size:.9rem; line-height:1.5; }
.lx-reduction-box b.ok{ color:var(--ok); }
.lx-reduction-box b.no{ color:#d23c3c; }
.lx-reduction-box ul{ margin:4px 0 0; padding-left:1.2em; }
.lx-reduction-tw{ width:100%; overflow-x:auto; }
.lx-reduction-t{ width:100%; border-collapse:collapse; table-layout:fixed; font-size:.8rem; text-align:center; }
.lx-reduction-t th, .lx-reduction-t td{ border:1px solid var(--line); padding:3px 1px; overflow-wrap:anywhere; }
.lx-reduction-t thead th{ background:color-mix(in srgb, var(--c) 16%, var(--paper)); font-weight:700; }
.lx-reduction-t td.T{ color:var(--ok); font-weight:800; }
.lx-reduction-t td.F{ color:var(--graphite); }
.lx-reduction-t tr.cur td{ background:color-mix(in srgb, #f2a93b 22%, var(--paper)); }
.lx-reduction-t tr.sat td:last-child{ background:color-mix(in srgb, var(--ok) 26%, var(--paper)); }
.lx-reduction-h{ font-size:.8rem; font-weight:700; color:var(--graphite); text-align:center; margin:0; letter-spacing:.02em; }
.lx-reduction-np th:first-child, .lx-reduction-np td:first-child{ text-align:left; padding-left:6px; font-weight:700; }
.lx-reduction-cap{ font-size:.8rem; color:var(--graphite); text-align:center; margin:0; }
`;
  if (!document.getElementById('lx-reduction-css')) { const s = document.createElement('style'); s.id = 'lx-reduction-css'; s.textContent = CSS; document.head.appendChild(s); }

  const SUBS = '₀₁₂₃₄₅₆₇₈₉';
  const nice = v => v.replace(/(\D)(\d+)$/, (m, a, d) => a + d.split('').map(c => SUBS[+c]).join(''));
  const lt = l => (l.n ? '¬' : '') + nice(l.v);
  const COL = ['var(--c)', 'var(--ok)', '#d97706', '#7863d4', '#ce5266'];
  const cmp = (a, b) => a.localeCompare(b, undefined, { numeric: true });

  // "(x1 v !x2 v x3) ^ (!x1 v x2)" and the usual spellings: ∨ v | OR, ∧ ^ & AND, ¬ ! ~ - NOT
  function parse(src, maxCl) {
    let s = String(src || '').trim();
    if (!s) throw new Error('Type a formula in CNF, like (x1 ∨ ¬x2 ∨ x3) ∧ (¬x1 ∨ x2).');
    s = s.replace(/\bAND\b/gi, '∧').replace(/[\^&]/g, '∧').replace(/\bOR\b/gi, '∨').replace(/\|/g, '∨').replace(/\bNOT\s*/gi, '¬').replace(/[!~\-]/g, '¬');
    let parts;
    if (/[()]/.test(s)) {
      parts = []; const re = /\(([^()]*)\)/g; let m, rest = s;
      while ((m = re.exec(s))) parts.push(m[1]);
      rest = s.replace(/\(([^()]*)\)/g, '').replace(/[∧\s]/g, '');
      if (rest) throw new Error(`I could not read "${rest}" outside the brackets. Write each clause in brackets and join them with ∧ (or ^).`);
    } else parts = s.split('∧');
    parts = parts.map(p => p.trim()).filter(Boolean);
    if (!parts.length) throw new Error('No clauses found. Write clauses in brackets, like (a ∨ b) ∧ (a ∨ ¬b).');
    if (parts.length > maxCl) throw new Error(`At most ${maxCl} clauses here (you have ${parts.length}), so the picture fits a phone.`);
    const cl = parts.map((p, i) => {
      const lits = p.split(/∨|\s+[vV]\s+/).map(t => t.trim()).filter(Boolean);
      if (!lits.length) throw new Error(`Clause ${i + 1} is empty.`);
      if (lits.length > 3) throw new Error(`Clause ${i + 1} has ${lits.length} literals; 3-CNF allows at most 3 per clause.`);
      return lits.map(t => { const m = t.match(/^(¬\s*)*([A-Za-z][A-Za-z0-9]{0,3})$/); if (!m) throw new Error(`"${t}" in clause ${i + 1} is not a literal. Use a variable name like x1 or a, with ¬ (or !) for NOT.`); return { v: m[2], n: ((t.match(/¬/g) || []).length % 2) === 1 }; });
    });
    const vars = [...new Set(cl.flat().map(l => l.v))].sort(cmp);
    return { cl, vars };
  }
  const val = (A, l) => !!A[l.v] !== l.n, clv = (A, c) => c.some(l => val(A, l)), sat = (A, cl) => cl.every(c => clv(A, c));
  const ftxt = cl => cl.map(c => '(' + c.map(lt).join(' ∨ ') + ')').join(' ∧ ');
  const atxt = (A, vars) => vars.map(v => `${nice(v)} = ${A[v] ? 'T' : 'F'}`).join(', ');

  // the slide's formula and drawing (L20 slides 35-36), vertex order: clause by clause, literal by literal
  const SLIDE_F = '(x1 ∨ ¬x2 ∨ x3) ∧ (¬x1 ∨ x2) ∧ (¬x2 ∨ x3)';
  const SLIDE_POS = [[40, 200], [70, 114], [106, 44], [316, 52], [362, 134], [165, 294], [258, 294]];

  function layout(cl, slide) {
    const V = []; cl.forEach((c, ci) => c.forEach((l, li) => V.push({ c: ci, i: li, l })));
    if (slide) { V.forEach((u, k) => { u.p = SLIDE_POS[k]; }); return { V, vb: [10, 14, 384, 310], lab: [[20, 258, 'start'], [384, 190, 'end'], [212, 252, 'middle']] }; }
    const m = cl.length, R = m <= 2 ? 90 : m === 3 ? 115 : 140, cx = 190, cy = 175, lab = [];
    cl.forEach((c, ci) => {
      const th = -Math.PI / 2 + 2 * Math.PI * ci / m, gx = cx + R * Math.cos(th), gy = cy + R * Math.sin(th), tx = -Math.sin(th), ty = Math.cos(th);
      c.forEach((l, li) => { const o = (li - (c.length - 1) / 2) * 58; const u = V.find(z => z.c === ci && z.i === li); u.p = [gx + tx * o, gy + ty * o]; });
      lab.push([cx + (R + 46) * Math.cos(th), cy + (R + 46) * Math.sin(th) + 6, 'middle']);
    });
    const xs = V.flatMap(u => [u.p[0] - 28, u.p[0] + 28]).concat(lab.flatMap(l => [l[0] - 40, l[0] + 40])), ys = V.flatMap(u => [u.p[1] - 28, u.p[1] + 28]).concat(lab.flatMap(l => [l[1] - 18, l[1] + 6]));
    const x0 = Math.min(...xs), y0 = Math.min(...ys);
    return { V, lab, vb: [x0, y0, Math.max(...xs) - x0, Math.max(...ys) - y0].map(Math.round) };
  }

  function cliqueFrames(cfg) {
    const { cl, vars } = parse(cfg.formula, 5), m = cl.length;
    const slide = cl.length === 3 && ftxt(cl) === ftxt(parse(SLIDE_F, 5).cl);
    const G = layout(cl, slide), V = G.V;
    const okE = (a, b) => a.c !== b.c && !(a.l.v === b.l.v && a.l.n !== b.l.n);
    const E = []; V.forEach((a, i) => V.forEach((b, j) => { if (i < j && okE(a, b)) E.push([i, j]); }));
    const A = Object.fromEntries(vars.map(v => [v, !!(cfg.assign && cfg.assign[v])]));
    // all cliques of size m = one vertex per clause, pairwise compatible
    const cliques = []; (function go(ci, cur) { if (cliques.length > 200) return; if (ci === m) { cliques.push(cur.slice()); return; } V.forEach((u, k) => { if (u.c === ci && cur.every(j => okE(V[j], u))) { cur.push(k); go(ci + 1, cur); cur.pop(); } }); })(0, []);
    const asgOf = S => { const o = {}; S.forEach(k => { o[V[k].l.v] = !V[k].l.n; }); return vars.map(v => `${nice(v)} = ${v in o ? (o[v] ? 'T' : 'F') : 'either'}`).join(', '); };
    const base = { kind: 'clique', G, E, cl, vars, A, m, slide, cliques: cliques.length };
    const frames = []; let shownE = [];
    const met = (nv, ne) => [['Clauses m', m], ['Vertices', nv], ['Edges', ne], ['Cliques of size m', cliques.length > 200 ? '200+' : cliques.length]];
    frames.push(Object.assign({}, base, { g: 0, shown: [], metrics: met(0, 0), desc: `Reduce 3-CNF SAT to CLIQUE. The formula has m = ${m} clause${m > 1 ? 's' : ''}. Build a graph in polynomial time so that the formula is satisfiable exactly when the graph has a clique of size m.${slide ? ' (The slide’s clauses 2 and 3 have only two literals; 3-CNF allows at most three, and the construction is the same.)' : ''}`, inv: 'A reduction transforms every instance of one problem into an instance of another, in polynomial time, so that the answers agree.' }));
    frames.push(Object.assign({}, base, { g: 1, shown: [], metrics: met(V.length, 0), desc: `For each clause, create a vertex for each literal: ${cl.map(c => c.length).join(' + ')} = ${V.length} vertices, grouped by clause (colour = clause).`, inv: 'Vertices of the same clause are never joined: a clique can use at most one vertex per clause.' }));
    for (let a = 0; a < m; a++) for (let b = a + 1; b < m; b++) {
      const nw = E.filter(([i, j]) => V[i].c === a && V[j].c === b);
      const miss = []; V.forEach((x, i) => V.forEach((y, j) => { if (x.c === a && y.c === b && !okE(x, y)) miss.push([i, j]); }));
      shownE = shownE.concat(nw);
      const last = a === m - 2 && b === m - 1;
      frames.push(Object.assign({}, base, { g: 2, shown: shownE.slice(), nw, miss, metrics: met(V.length, shownE.length), desc: `Connect clause ${a + 1} with clause ${b + 1}: ${nw.length} edge${nw.length === 1 ? '' : 's'} between compatible literals` + (miss.length ? `, but not ${miss.map(([i, j]) => `${lt(V[i].l)}–${lt(V[j].l)}`).join(', ')} (a variable is never joined to its NOT).` : ' (no pair contradicts).') + (last ? ` The graph is built: ${V.length} vertices and ${E.length} edges, O(m²) work.` : ''), inv: 'Edge rule: different clauses AND not x with ¬x. Two joined literals can both be TRUE at once.' }));
    }
    if (m === 1) frames.push(Object.assign({}, base, { g: 2, shown: [], nw: [], miss: [], metrics: met(V.length, 0), desc: 'With a single clause there are no pairs of clauses, so the graph has no edges; any one vertex is a clique of size m = 1.', inv: 'A single vertex is a clique of size 1.' }));
    const trueV = V.map((u, k) => (val(A, u.l) ? k : -1)).filter(k => k >= 0);
    frames.push(Object.assign({}, base, { g: 3, shown: E, tv: trueV, metrics: met(V.length, E.length), desc: `Choose a truth assignment: ${atxt(A, vars)}. Its TRUE literals are highlighted: ${trueV.length ? trueV.map(k => `${lt(V[k].l)} (clause ${V[k].c + 1})`).join(', ') : 'none'}. Tap a variable to flip it.`, inv: 'An assignment makes some literals TRUE. TRUE literals never contradict each other, so any two of them in different clauses are joined.' }));
    const pick = cl.map((c, ci) => V.findIndex(u => u.c === ci && val(A, u.l)));
    const ok = pick.every(k => k >= 0);
    frames.push(Object.assign({}, base, { g: 4, shown: E, tv: trueV, S: ok ? pick : pick.filter(k => k >= 0), ok, metrics: met(V.length, E.length),
      desc: ok ? `Every clause has a TRUE literal, so the formula is satisfied. Take one TRUE literal per clause: ${pick.map(k => lt(V[k].l)).join(', ')}. They are in different clauses and none contradicts another, so all ${m * (m - 1) / 2} pairs are edges: a clique of size m = ${m}.`
        : `Clause ${pick.findIndex(k => k < 0) + 1} has no TRUE literal, so this assignment does not satisfy the formula and gives no clique of size ${m}. That does not prove no clique exists: ${cliques.length ? 'another assignment may work (see the next step).' : 'here none exists (see the next step).'}`,
      inv: 'Satisfying assignment → clique: pick one TRUE literal per clause.' }));
    const ex = (ok ? [pick].concat(cliques.filter(S => S.join() !== pick.join())) : cliques).slice(0, 4);
    frames.push(Object.assign({}, base, { g: 5, shown: E, S: ok ? pick : cliques[0] || [], ok: !!cliques.length, list: ex.map(S => ({ S: S.map(k => `${lt(V[k].l)}`).join(', '), a: asgOf(S) })), metrics: met(V.length, E.length),
      desc: cliques.length ? `Clique → assignment: a clique of size m has one vertex per clause and no x with ¬x, so making its literals TRUE satisfies every clause (unused variables can be either). This graph has ${cliques.length > 200 ? 'more than 200' : cliques.length} clique${cliques.length === 1 ? '' : 's'} of size ${m}, so the formula is satisfiable${slide ? '; the slide’s red triangle is ¬x₂, ¬x₁, ¬x₂' : ''}. Highlighted: ${ok ? 'the clique from your assignment' : 'the first clique found'}.`
        : `This graph has no clique of size ${m}, so no assignment satisfies the formula: it is unsatisfiable. Formula satisfiable ⇔ clique of size m.`,
      inv: 'Formula satisfiable ⇔ graph has a clique of size m. Since 3-CNF SAT is NP-complete and the construction is polynomial, CLIQUE is NP-hard; it is in NP (a clique is checked in O(k²)), so it is NP-complete.' }));
    return frames;
  }

  function satFrames(cfg) {
    const { cl, vars } = parse(cfg.formula, 12);
    if (vars.length > 6) throw new Error(`At most 6 variables in the truth table (you have ${vars.length}: 2^${vars.length} rows is too many to step through).`);
    const n = vars.length, N = 2 ** n, full = N <= 16;
    const rowA = r => Object.fromEntries(vars.map((v, j) => [v, !((r >> (n - 1 - j)) & 1)]));
    const all = Array.from({ length: N }, (_, r) => rowA(r)), nSat = all.filter(A => sat(A, cl)).length;
    const note = /\(\s*a\s*∨\s*b\s*\)\s*∧\s*\(\s*a\s*∨\s*¬c\s*\)/.test(ftxt(cl)) && cl.length === 2 ? ' Slide 29 writes this formula as (a ∨ b) ∧ (b ∨ ¬c), but its table header and every row use (a ∨ ¬c); this preset follows the table.'
      : ftxt(cl) === '(a ∨ b) ∧ (b ∨ ¬c)' ? ' This is slide 29’s formula as written; the slide’s table actually evaluates (a ∨ ¬c) instead of (b ∨ ¬c), so the SAT column differs in rows T F T and F T T.' : '';
    const base = { kind: 'sat', cl, vars, wide: cl.length > 4 };
    const frames = [{ ...base, rows: [], metrics: [['Variables', n], ['Rows 2ⁿ', N], ['Rows checked', 0], ['Satisfying', 0]], desc: `SAT: can the variables be set TRUE/FALSE so the formula is TRUE? ${n} variable${n > 1 ? 's' : ''} give 2^${n} = ${N} assignments to try.${note}${full ? '' : ' With more than 16 rows the search stops at the first satisfying row.'}`, inv: 'SAT was the first known NP-complete problem (Cook-Levin). Checking one assignment is fast (polynomial); trying all of them is 2ⁿ.' }];
    const rows = []; let found = 0;
    for (let r = 0; r < N; r++) {
      const A = all[r], cv = cl.map(c => clv(A, c)), s = cv.every(Boolean); if (s) found++;
      rows.push({ A, cv, s });
      const ff = cv.indexOf(false);
      frames.push({ ...base, rows: rows.slice(-10), skipped: Math.max(0, rows.length - 10), cur: true, metrics: [['Variables', n], ['Rows 2ⁿ', N], ['Rows checked', r + 1], ['Satisfying', found]],
        desc: `Row ${r + 1}: ${atxt(A, vars)}. ` + (s ? `Every clause is TRUE, so the formula is TRUE: this assignment satisfies it.` : `Clause ${ff + 1} ${'(' + cl[ff].map(lt).join(' ∨ ') + ')'} is FALSE (all its literals are FALSE), so the formula is FALSE.`),
        inv: 'A CNF formula is TRUE exactly when every clause has at least one TRUE literal.' });
      if (!full && s) break;
    }
    const firstS = all.find(A => sat(A, cl));
    frames.push({ ...base, rows: rows.slice(-10), skipped: Math.max(0, rows.length - 10), metrics: [['Variables', n], ['Rows 2ⁿ', N], ['Rows checked', rows.length], ['Satisfying', full ? found : nSat]],
      desc: nSat ? `Yes, it is satisfiable: ${nSat} of the ${N} assignments make it TRUE${full ? '' : ` (counted over all ${N}; the search stopped at row ${rows.length})`}, for example ${atxt(firstS, vars)}. Verifying that answer takes one pass over the clauses: SAT is in NP.` : `No assignment works: all ${N} rows give FALSE, so the formula is unsatisfiable.`,
      inv: 'Finding a satisfying assignment may take 2ⁿ tries; checking a given one is polynomial. That gap is the P vs NP question.' });
    return frames;
  }

  function build(cfg) { return cfg.method === 'sat' ? satFrames(cfg) : cliqueFrames(cfg); }

  function Formula({ f, A }) {
    return html`<div className="lx-reduction-f" aria-label="The formula">${f.cl.map((c, ci) => html`${ci ? html`<span key=${'op' + ci} className="lx-reduction-op">∧</span>` : null}<span key=${ci} className=${'lx-reduction-cl' + (A ? (clv(A, c) ? ' ok' : ' no') : '')} style=${{ borderColor: f.kind === 'clique' ? COL[ci % 5] : 'var(--line)' }}><small>C${ci + 1}</small>(${c.map((l, li) => html`${li ? html`<span key=${'o' + li} className="lx-reduction-op"> ∨ </span>` : null}<span key=${li} className=${'lx-reduction-lit' + (A ? (val(A, l) ? ' T' : ' F') : '')}>${lt(l)}</span>`)})</span>`)}</div>`;
  }

  function NPTable() {
    const R = [['P', 'Yes', 'Yes'], ['NP', 'Yes', 'Yes or No *'], ['NP-Complete', 'Yes', 'Unknown'], ['NP-Hard', 'Yes or No **', 'Unknown ***']];
    return html`<div><p className="lx-reduction-h">PROBLEM CLASSES (L20 slide 24) · difficulty increases downwards</p>
      <table className="lx-reduction-t lx-reduction-np"><thead><tr><th>Problem type</th><th>Verifiable in P time</th><th>Solvable in P time</th></tr></thead>
      <tbody>${R.map(r => html`<tr key=${r[0]}>${r.map((c, k) => html`<td key=${k}>${c}</td>`)}</tr>`)}</tbody></table>
      <p className="lx-reduction-cap">NP-complete = in NP and NP-hard. SAT, 3-CNF SAT and CLIQUE are NP-complete; assuming P ≠ NP none of them is in P.</p></div>`;
  }

  function Diagram({ f, cfg, setCfg, step, jump }) {
    if (f.kind === 'sat') {
      const cols = f.wide ? null : f.cl;
      return html`<div className="lx-reduction-wrap">
        <${Formula} f=${f} A=${f.rows.length && f.cur ? f.rows[f.rows.length - 1].A : null} />
        <div className="lx-reduction-tw"><table className="lx-reduction-t" aria-label="Truth table"><thead><tr>${f.vars.map(v => html`<th key=${v}>${nice(v)}</th>`)}${cols ? cols.map((c, k) => html`<th key=${'c' + k}>(${c.map(lt).join(' ∨ ')})</th>`) : html`<th>Fails</th>`}<th>SAT</th></tr></thead>
          <tbody>${f.skipped ? html`<tr><td colSpan=${f.vars.length + (cols ? cols.length : 1) + 1} className="F">… ${f.skipped} earlier row${f.skipped > 1 ? 's' : ''}</td></tr>` : null}
          ${f.rows.map((r, k) => html`<tr key=${k} className=${(f.cur && k === f.rows.length - 1 ? 'cur' : '') + (r.s ? ' sat' : '')}>${f.vars.map(v => html`<td key=${v} className=${r.A[v] ? 'T' : 'F'}>${r.A[v] ? 'T' : 'F'}</td>`)}${cols ? r.cv.map((x, j) => html`<td key=${'c' + j} className=${x ? 'T' : 'F'}>${x ? 'T' : 'F'}</td>`) : html`<td className="F">${r.s ? '-' : 'C' + (r.cv.indexOf(false) + 1)}</td>`}<td className=${r.s ? 'T' : 'F'}>${r.s ? 'T' : 'F'}</td></tr>`)}</tbody></table></div>
        <${NPTable} />
      </div>`;
    }
    const G = f.G, V = G.V, S = f.S || [], tv = f.tv || [];
    const inS = k => S.includes(k);
    const flip = v => { setCfg(c => ({ ...c, assign: { ...(c.assign || {}), [v]: !(c.assign && c.assign[v]) } })); const at = step; setTimeout(() => jump(at), 60); };
    const shown = new Set(f.shown.map(([i, j]) => i + '-' + j)), nw = new Set((f.nw || []).map(([i, j]) => i + '-' + j));
    const A = f.g >= 3 && f.g < 5 ? f.A : null;
    return html`<div className="lx-reduction-wrap">
      <${Formula} f=${f} A=${A} />
      <svg className="lx-reduction-svg" viewBox=${G.vb.join(' ')} role="img" aria-label="Graph built from the formula">
        ${f.E.filter(([i, j]) => shown.has(i + '-' + j)).map(([i, j]) => { const k = inS(i) && inS(j), cls = k ? 'k' : nw.has(i + '-' + j) ? 'nw' : (f.g === 2 && f.nw ? 'faint' : S.length ? 'faint' : ''); return html`<line key=${i + '-' + j} x1=${V[i].p[0]} y1=${V[i].p[1]} x2=${V[j].p[0]} y2=${V[j].p[1]} className=${'lx-reduction-e ' + cls} />`; })}
        ${(f.miss || []).map(([i, j]) => html`<line key=${'m' + i + '-' + j} x1=${V[i].p[0]} y1=${V[i].p[1]} x2=${V[j].p[0]} y2=${V[j].p[1]} className="lx-reduction-e miss" />`)}
        ${V.map((u, k) => { const c = COL[u.c % 5], on = inS(k) || (f.g === 3 && tv.includes(k)); return html`<g key=${k} className=${'lx-reduction-v' + (f.g === 0 ? ' dim' : '')}><circle cx=${u.p[0]} cy=${u.p[1]} r="24" style=${{ fill: `color-mix(in srgb, ${c} ${on ? 50 : 14}%, var(--paper))`, stroke: inS(k) ? '#d23c3c' : c, strokeWidth: on ? 4 : 2.2 }} /><text x=${u.p[0]} y=${u.p[1] + 6.5} textAnchor="middle" fontSize="18">${lt(u.l)}</text></g>`; })}
        ${G.lab.map(([x, y, a], ci) => ci < f.cl.length && html`<text key=${'l' + ci} x=${x} y=${y} textAnchor=${a} fontSize="17" className="lx-reduction-ct" style=${{ fill: COL[ci % 5], stroke: 'var(--paper)', strokeWidth: 4, paintOrder: 'stroke' }}>clause ${ci + 1}</text>`)}
      </svg>
      ${f.g >= 3 && f.g < 5 && html`<div className="lx-reduction-row"><span>Assignment (tap to flip):</span>${f.vars.map(v => html`<button key=${v} className=${f.A[v] ? 'T' : ''} onClick=${() => flip(v)} aria-label=${'Flip ' + v}>${nice(v)} = ${f.A[v] ? 'T' : 'F'}</button>`)}</div>`}
      ${f.g === 4 && html`<div className="lx-reduction-box">${f.ok ? html`<b className="ok">Clique of size ${f.m}</b> ↔ assignment ${atxt(f.A, f.vars)}: one TRUE literal per clause, {${S.map(k => lt(V[k].l)).join(', ')}}.` : html`<b className="no">No clique from this assignment.</b> A clause with no TRUE literal leaves no vertex to pick there.`}</div>`}
      ${f.g === 5 && html`<div className="lx-reduction-box">${f.ok ? html`<b className="ok">Satisfiable.</b> Cliques of size ${f.m} and the assignments they give:<ul>${f.list.map((x, k) => html`<li key=${k}>{${x.S}} → ${x.a}</li>`)}</ul>${f.cliques > f.list.length ? html`<span className="lx-reduction-cap">…and ${f.cliques > 200 ? 'many' : f.cliques - f.list.length} more.</span>` : null}` : html`<b className="no">Unsatisfiable:</b> no clique of size ${f.m}.`}</div>`}
      ${f.g === 5 && html`<${NPTable} />`}
    </div>`;
  }

  function Controls({ cfg, setCfg }) {
    let vars = []; try { vars = parse(cfg.formula, 12).vars; } catch (e) { vars = []; }
    return html`
      <label>Mode<select value=${cfg.method} onChange=${e => { const method = e.target.value; setCfg(c => ({ ...c, method })); }}><option value="clique">3-CNF SAT → CLIQUE</option><option value="sat">SAT truth table</option></select></label>
      <label className="tl-wide">Formula · (a ∨ ¬b) ∧ …, ! for NOT<input value=${cfg.formula} spellCheck="false" onInput=${e => { const formula = e.target.value; setCfg(c => ({ ...c, formula })); }} /></label>
      ${cfg.method === 'clique' && vars.length <= 6 && vars.map(v => html`<label key=${v}>${nice(v)}<select value=${cfg.assign && cfg.assign[v] ? 'T' : 'F'} onChange=${e => { const t = e.target.value === 'T'; setCfg(c => ({ ...c, assign: { ...(c.assign || {}), [v]: t } })); }}><option value="T">TRUE</option><option value="F">FALSE</option></select></label>`)}`;
  }

  const defaults = { method: 'clique', formula: SLIDE_F, assign: { x1: false, x2: false, x3: false } };
  window.LAB = window.LAB || {};
  window.LAB.reduction = {
    meta: { title: 'P, NP and reductions', group: 'Foundations', icon: '⇄', desc: '3-CNF SAT → CLIQUE and SAT, as in L20.',
      question: 'How does a satisfying assignment become a clique of size m, and back?',
      model: 'A reduction rewrites every instance of one problem as an instance of another in polynomial time. From a 3-CNF formula with m clauses, make a vertex per literal and join literals of different clauses unless one is the NOT of the other. The formula is satisfiable exactly when the graph has a clique of size m.',
      watch: 'Each colour is a clause. Red edges and red-ringed vertices form the clique; the formula chips show which literals the assignment makes TRUE.' },
    defaults,
    presets: [
      { label: 'Slide reduction: satisfying (x₁ = F, x₂ = F)', src: 'L20 slides 35-36', cfg: defaults },
      { label: 'Slide reduction: x₁ = T, x₂ = F, x₃ = F', src: 'L20 slides 35-36', cfg: { method: 'clique', formula: SLIDE_F, assign: { x1: true, x2: false, x3: false } } },
      { label: 'SAT: (a ∨ b) ∧ (a ∨ ¬b)', src: 'L20 slide 28', cfg: { method: 'sat', formula: '(a ∨ b) ∧ (a ∨ ¬b)', assign: {} } },
      { label: 'SAT: slide 29 as tabulated', src: 'L20 slide 29 (table)', cfg: { method: 'sat', formula: '(a ∨ b) ∧ (a ∨ ¬c)', assign: {} } },
      { label: 'SAT: slide 29 as written', src: 'L20 slide 29 (formula)', cfg: { method: 'sat', formula: '(a ∨ b) ∧ (b ∨ ¬c)', assign: {} } },
      { label: 'SAT: 11 clauses, 6 variables', src: 'L20 slide 27', cfg: { method: 'sat', formula: '(a ∨ b) ∧ (b ∨ ¬c) ∧ (¬a ∨ ¬d) ∧ (c ∨ e) ∧ (b ∨ ¬c) ∧ (¬a ∨ ¬d) ∧ (e ∨ a) ∧ (f ∨ ¬b) ∧ (¬f ∨ ¬e) ∧ (b ∨ e) ∧ (b ∨ ¬d)', assign: {} } }
    ],
    Controls, build, Diagram,
    legend: [['var(--c)', 'Clause 1'], ['var(--ok)', 'Clause 2'], ['#d97706', 'Clause 3'], ['#d23c3c', 'Clique edges / contradiction']],
    cost: cfg => cfg.method === 'sat'
      ? 'Truth table: 2ⁿ rows for n variables, each checked in time linear in the formula, so brute force is O(2ⁿ · |formula|) while verifying one assignment is polynomial (SAT ∈ NP). Rows go from all TRUE to all FALSE as on the slides. Up to 6 variables; above 16 rows the search stops at the first satisfying row. Slide 29 conflict: its formula reads (a ∨ b) ∧ (b ∨ ¬c) but its table uses (a ∨ ¬c); both versions are presets.'
      : 'Construction: one vertex per literal (at most 3m) and O(m²) pairs tested, so polynomial. Up to 5 clauses of at most 3 literals (the slide’s formula has 2-literal clauses, which 3-CNF allows). The assignment step takes the first TRUE literal of each clause. Cliques of size m are counted by trying one vertex per clause.'
  };
})();
