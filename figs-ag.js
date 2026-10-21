// Visuals for the Algorithms notes (names 'ag-…'), built on figs.js (window.FIGKIT).
// Each one redraws a figure or works through an example from Dr. Basheer's slides. build.mjs copies this file to data/; app.js loads it on demand.
(function(){ if (!document.getElementById('ag-accent')) { const s = document.createElement('style'); s.id = 'ag-accent'; s.textContent = '[data-fig^="ag-"]{ --fig-k: var(--k-compiler); --fig-s: var(--s-compiler); }'; document.head.appendChild(s); } })();
/* ── part L5 ── */
// Algorithms visuals, Lecture 5 (Quicksort): divide and conquer picture (slide 3), the PARTITION invariant (slide 4), the partitioning trace on
// 6 10 13 5 8 3 2 11 (slides 5-16), the worst-case and "almost-best" recursion trees (slides 20-32), lucky/unlucky alternation (slide 33),
// the random split X_k (slides 34-36) and the expected-time derivation (slides 37-46). Every label and number comes from the slides.
(function () {
  const { useState, useEffect, useRef, useMemo } = React;
  const { html, useSteps, Cap, Bar, pop, calm, useClock, useFit, sec } = window.FIGKIT;
  const CSS = `
.a5-w{ max-width:520px; margin:0 auto; color:var(--ink); }
.a5-row{ display:grid; gap:3px; margin:0 auto 4px; }
.a5-c{ height:32px; display:grid; place-items:center; border:1px solid var(--line); border-radius:5px; font:600 15px var(--mono); color:var(--ink); background:var(--paper); transition:background .35s, box-shadow .35s; min-width:0; }
.a5-x{ background:color-mix(in srgb, var(--hl) 34%, var(--paper)); }
.a5-le{ background:color-mix(in srgb, var(--k-compiler) 24%, var(--paper)); }
.a5-ge{ background:color-mix(in srgb, var(--pen) 20%, var(--paper)); }
.a5-un{ background:color-mix(in srgb, var(--ok) 20%, var(--paper)); }
.a5-old .a5-c{ opacity:.5; height:26px; font-size:13px; }
.a5-sw{ box-shadow:0 0 0 2px var(--fig-k) inset; }
.a5-idx{ font:500 12px var(--mono); color:var(--graphite); text-align:center; }
.a5-ptr{ font:700 15px var(--mono); color:var(--fig-k); text-align:center; min-height:20px; }
.a5-leg{ display:flex; flex-wrap:wrap; gap:6px 12px; justify-content:center; font-size:13px; color:var(--graphite); margin:8px 0 0; }
.a5-leg i{ display:inline-block; width:12px; height:12px; border-radius:3px; margin-right:4px; vertical-align:-1px; border:1px solid var(--line); }
.a5-in{ display:flex; gap:6px; flex-wrap:wrap; align-items:center; margin:0 0 10px; }
.a5-in input{ flex:1 1 100%; order:-1; min-width:0; font:500 14px var(--mono); color:var(--ink); background:var(--paper); border:1px solid var(--line); border-radius:8px; padding:6px 8px; }
.a5-in .fig-btn{ font-size:13px; padding:4px 10px; }
.a5-err{ color:var(--pen); font-size:13px; font-weight:600; margin:0 0 8px; }
.a5-bar{ display:flex; height:40px; border:1px solid var(--line); border-radius:6px; overflow:hidden; }
.a5-bar > div{ display:grid; place-items:center; font:600 15px var(--body); color:var(--ink); transition:flex-basis .7s ease, background .4s; overflow:hidden; white-space:nowrap; min-width:0; }
.a5-marks{ position:relative; height:22px; margin-top:2px; }
.a5-marks span{ position:absolute; transform:translateX(-50%); font:italic 600 15px var(--body); color:var(--fig-k); transition:left .7s ease; }
.a5-box{ margin:10px auto 0; padding:8px 10px; border:1px solid var(--line); border-radius:8px; background:var(--paper); font-size:15px; line-height:1.5; text-align:center; max-width:420px; }
.a5-lines{ display:grid; gap:6px; }
.a5-ln{ border:1px solid var(--line); border-radius:8px; background:var(--paper); padding:6px 8px; font-size:15px; line-height:1.55; transition:opacity .4s, box-shadow .4s; }
.a5-ln.a5-now{ box-shadow:0 0 0 2px var(--fig-k); }
.a5-ln.a5-past{ opacity:.6; }
.a5-ln small{ display:block; font-size:13px; color:var(--graphite); }
.a5-sum{ display:inline-flex; align-items:center; vertical-align:middle; font-size:1.4em; line-height:1; }
.a5-sum .a5-lim{ font-size:12px; }
.a5-hd{ margin:0 0 6px; font-size:13px; font-weight:700; color:var(--graphite); text-transform:uppercase; letter-spacing:.04em; }
.a5-lim{ display:inline-flex; flex-direction:column; font-size:12px; line-height:1.05; margin:0 2px 0 1px; }
.a5-fr{ display:inline-flex; flex-direction:column; text-align:center; vertical-align:middle; font-size:13px; line-height:1.1; margin:0 2px; }
.a5-fr > span:first-child{ border-bottom:1px solid var(--ink); }
.a5-hist{ display:grid; gap:3px; align-items:end; height:90px; margin:8px 0 2px; }
.a5-hist div{ background:color-mix(in srgb, var(--fig-k) 55%, var(--paper)); border-radius:3px 3px 0 0; transition:height .3s; }
.a5-note{ font:400 14px/1.4 var(--body); color:var(--graphite); text-align:center; }
.a5-tag{ display:inline-block; font-size:13px; font-weight:700; padding:1px 8px; border-radius:99px; background:color-mix(in srgb, var(--fig-k) 18%, var(--paper)); color:var(--ink); }
`;
  if (!document.getElementById('a5-css')) { const s = document.createElement('style'); s.id = 'a5-css'; s.textContent = CSS; document.head.appendChild(s); }

  const SLIDE = [6, 10, 13, 5, 8, 3, 2, 11];
  const cls = r => 'a5-c a5-' + r;
  const Row = ({ a, reg, sw, old }) => html`<div className=${'a5-row' + (old ? ' a5-old' : '')} style=${{ gridTemplateColumns: `repeat(${a.length}, 1fr)` }}>
    ${a.map((v, k) => html`<div key=${k} className=${cls(reg[k]) + (sw && sw.includes(k) ? ' a5-sw' : '')}>${v}</div>`)}</div>`;
  const Legend = () => html`<div className="a5-leg"><span><i className="a5-x"></i>pivot x</span><span><i className="a5-le"></i>≤ x</span><span><i className="a5-ge"></i>≥ x</span><span><i className="a5-un"></i>not examined yet</span></div>`;
  function parseNums(s, lo, hi, nmin, nmax) {
    const t = s.split(/[\s,]+/).filter(Boolean);
    if (t.length < nmin || t.length > nmax) return { err: `Type ${nmin} to ${nmax} numbers.` };
    const v = t.map(Number);
    if (v.some(x => !Number.isInteger(x) || x < lo || x > hi)) return { err: `Use whole numbers from ${lo} to ${hi}.` };
    return { v };
  }

  // slide 3: divide and conquer
  function Divide() {
    const steps = [
      { en: '<b>Divide:</b> PARTITION the array around a pivot x so that every element of the lower subarray is ≤ x and every element of the upper subarray is ≥ x. On the slides’ example x = 6 ends at index 4.' },
      { en: '<b>Conquer:</b> recursively sort the two subarrays: A[1..3] = 2 5 3 becomes 2 3 5 and A[5..8] = 8 13 10 11 becomes 8 10 11 13. The pivot is already in its final place.' },
      { en: '<b>Combine:</b> trivial. The array is sorted in place, nothing to merge. <b>Key:</b> a linear-time partitioning subroutine.' }
    ];
    const [i, ctl] = useSteps(steps.length, 2600);
    const lo = i >= 1 ? [2, 3, 5] : [2, 5, 3], hi = i >= 1 ? [8, 10, 11, 13] : [8, 13, 10, 11];
    const a = [...lo, 6, ...hi], reg = ['le', 'le', 'le', 'x', 'ge', 'ge', 'ge', 'ge'];
    return html`<figure className="fig"><div className="fig-stage"><div className="a5-w">
      <div className="a5-bar"><div className="a5-le" style=${{ flexBasis: '38%' }}>≤ x</div><div className="a5-x" style=${{ flexBasis: '12%' }}>x</div><div className="a5-ge" style=${{ flexBasis: '50%' }}>≥ x</div></div>
      <div style=${{ height: '12px' }}></div>
      <${Row} a=${a} reg=${reg} sw=${i === 1 ? [0, 1, 2, 4, 5, 6, 7] : null} />
      <div className=${'a5-box ' + pop(i >= 2)}>sorted: ${a.join(' ')}</div>
    </div></div><${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  // slide 4: the invariant of PARTITION
  function Invariant() {
    const W = [[8, 26, 24, 42], [8, 26, 32, 34], [8, 34, 32, 26], [8, 34, 58, 0], [8, 34, 58, 0]];
    const steps = [
      { en: '<b>Invariant:</b> A[p] = x is the pivot, A[p+1..i] ≤ x, A[i+1..j−1] ≥ x, and A[j..q] is not examined yet. Start: x ← A[p], i ← p, j ← p + 1.' },
      { en: 'If A[j] > x: nothing to move. j ← j + 1, so the ≥ x part grows by one.' },
      { en: 'If A[j] ≤ x: i ← i + 1, then exchange A[i] ↔ A[j]. The small element joins the ≤ x part; the ≥ x element that was at A[i] moves to the end of the ≥ x part.' },
      { en: 'When j passes q every element has been examined: nothing is left in the “?” part.' },
      { en: 'Finally exchange A[p] ↔ A[i] and return i: x sits between the two parts. One pass over n elements, so the running time is O(n).' }
    ];
    const [i, ctl] = useSteps(steps.length, 2400);
    const w = W[i], fin = i === 4;
    const parts = fin ? [['le', w[1] + 0, '≤ x'], ['x', w[0], 'x'], ['ge', w[2], '≥ x']] : [['x', w[0], 'x'], ['le', w[1], '≤ x'], ['ge', w[2], '≥ x'], ['un', w[3], '?']];
    const iPos = fin ? w[1] + w[0] / 2 : w[0] + w[1], jPos = w[0] + w[1] + w[2];
    return html`<figure className="fig"><div className="fig-stage"><div className="a5-w">
      <div className="a5-bar">${parts.map(([r, b, t]) => html`<div key=${r} className=${'a5-' + r} style=${{ flexBasis: b + '%' }}>${b > 0 ? t : ''}</div>`)}</div>
      <div className="a5-marks"><span style=${{ left: '3%' }}>p</span><span style=${{ left: Math.min(iPos, 90) - (fin ? 0 : 3) + '%' }}>i</span>
        ${i < 3 && html`<span style=${{ left: jPos + 3 + '%' }}>j</span>`}<span style=${{ left: '97%' }}>q</span></div>
      <${Legend} />
    </div></div><${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  // slides 5-16: PARTITION(A, 1, n) on the slide's array
  function partTrace(A) {
    const a = A.slice(), n = a.length, x = a[0]; let i = 0;
    const reg = (i, jd, fin) => a.map((_, k) => fin ? (k < i ? 'le' : k === i ? 'x' : 'ge') : (k === 0 ? 'x' : k <= i ? 'le' : k <= jd ? 'ge' : 'un'));
    const rows = [{ a: a.slice(), reg: reg(0, 0) }], F = [];
    F.push({ rows: rows.slice(), i: 0, j: 1, en: `x ← A[1] = <b>${x}</b> is the pivot, i ← p = 1, and the for loop starts with j = 2.` });
    for (let j = 1; j < n; j++) {
      let en;
      if (a[j] <= x) {
        i++; const out = a[i], inn = a[j]; [a[i], a[j]] = [a[j], a[i]];
        en = `j = ${j + 1}: A[${j + 1}] = ${inn} ≤ ${x}, so i ← i + 1 = ${i + 1} and exchange A[${i + 1}] ↔ A[${j + 1}]` + (i === j ? ` (the same cell: ${inn} stays).` : ` (${out} ↔ ${inn}).`);
        rows.push({ a: a.slice(), reg: reg(i, j), sw: i === j ? [i] : [i, j] });
      } else {
        en = `j = ${j + 1}: A[${j + 1}] = ${a[j]} > ${x}: no exchange, the ≥ x part grows to A[${i + 2}..${j + 1}].`;
        rows[rows.length - 1] = { a: a.slice(), reg: reg(i, j) };
      }
      F.push({ rows: rows.slice(), i, j, en });
    }
    F.push({ rows: rows.slice(), i, j: n, en: `j = ${n + 1} > q = ${n}: the for loop ends. Now A[2..${i + 1}] ≤ ${x} and A[${i + 2}..${n}] ≥ ${x}.` });
    const o = a[i]; [a[0], a[i]] = [a[i], a[0]];
    rows.push({ a: a.slice(), reg: reg(i, n, true), sw: i ? [0, i] : [0] });
    F.push({ rows: rows.slice(), i, j: -1, en: `Exchange A[p] ↔ A[i] = A[1] ↔ A[${i + 1}] (${x} ↔ ${o}) and <b>return i = ${i + 1}</b>: the pivot ${x} is in its final place, smaller elements on its left, larger on its right.` });
    return F;
  }
  function PartRun({ A, top }) {
    const F = useMemo(() => partTrace(A), [A]);
    const [i, ctl] = useSteps(F.length, 1700), f = F[i], n = A.length;
    const cols = { gridTemplateColumns: `repeat(${n}, 1fr)` };
    return html`<div className="fig-stage"><div className="a5-w">${top}
      <div className="a5-row" style=${cols}>${A.map((_, k) => html`<div key=${k} className="a5-idx">${k + 1}</div>`)}</div>
      ${f.rows.map((r, k) => html`<${Row} key=${k} a=${r.a} reg=${r.reg} sw=${k === f.rows.length - 1 ? r.sw : null} old=${k < f.rows.length - 1} />`)}
      <div className="a5-row" style=${cols}>${A.map((_, k) => html`<div key=${k} className="a5-ptr">${[k === f.i ? 'i' : '', k === f.j ? 'j' : ''].filter(Boolean).join(' ')}</div>`)}</div>
      <${Legend} /></div></div>
      <${Cap} en=${f.en} /><${Bar} steps=${F} i=${i} ctl=${ctl} />`;
  }
  function Partition() {
    const [txt, setTxt] = useState(SLIDE.join(' ')), [A, setA] = useState(SLIDE), [err, setErr] = useState('');
    const load = s => { const r = parseNums(s, 0, 99, 2, 10); if (r.err) { setErr(r.err); return; } setErr(''); setA(r.v); };
    const top = html`<div className="a5-in"><button className="fig-btn" onClick=${() => { setTxt(SLIDE.join(' ')); setA(SLIDE); setErr(''); }}>Slide example</button>
        <input aria-label="Array to partition" value=${txt} onInput=${e => setTxt(e.target.value)} onKeyDown=${e => e.key === 'Enter' && load(txt)} />
        <button className="fig-btn solid" onClick=${() => load(txt)}>Try your own</button></div>
      ${err && html`<p className="a5-err" role="alert">${err}</p>`}`;
    return html`<figure className="fig"><${PartRun} key=${A.join(',')} A=${A} top=${top} /></figure>`;
  }

  // slides 20-26: worst-case recursion tree
  function Worst() {
    const steps = [
      { en: 'Worst case: the input is sorted or reverse sorted, so the pivot is the min or max and one side is empty: T(n) = T(0) + T(n−1) + cn.' },
      { en: 'Expand the root: it costs cn, its children are T(0) and T(n−1).' },
      { en: 'Expand T(n−1): cost c(n−1), children T(0) and T(n−2).' },
      { en: 'Keep going: c(n−2), and so on down to Θ(1). Every level peels off only one element.' },
      { en: 'Add the costs along the long branch: cn + c(n−1) + … + c = Θ(Σ<sub>k=1</sub><sup>n</sup> k) = Θ(n<sup>2</sup>) (arithmetic series).' },
      { en: 'Each T(0) is Θ(1) and the height is h = n, so the leaves add Θ(n): T(n) = Θ(n) + Θ(n<sup>2</sup>) = <b>Θ(n<sup>2</sup>)</b>.' }
    ];
    const [i, ctl] = useSteps(steps.length, 2300);
    const M = k => [100 + 42 * k, 40 + 50 * k], L = k => [M(k)[0] - 50, M(k)[1] + 50];
    const leaf = i >= 5 ? 'Θ(1)' : 'T(0)';
    const main = ['cn', i >= 2 ? 'c(n−1)' : 'T(n−1)', i >= 3 ? 'c(n−2)' : 'T(n−2)'];
    const E = (a, b, on) => html`<line x1=${a[0]} y1=${a[1] + 8} x2=${b[0]} y2=${b[1] - 16} stroke="var(--ink)" strokeWidth="2" className=${pop(on)} />`;
    const T = (p, t, on, hot) => html`<text x=${p[0]} y=${p[1]} textAnchor="middle" fontSize="18" fontStyle="italic" className=${pop(on)} style=${hot ? { fill: 'var(--fig-k)', fontWeight: 700 } : null}>${t}</text>`;
    return html`<figure className="fig"><div className="fig-stage">
      <svg viewBox="0 0 320 300" role="img" aria-label="Worst-case recursion tree of quicksort">
        <line x1="78" y1="22" x2="290" y2="268" stroke="color-mix(in srgb, var(--hl) 45%, var(--paper))" strokeWidth="44" strokeLinecap="round" className=${pop(i >= 4)} />
        ${i === 0 ? T(M(0), 'T(n)', true) : T(M(0), 'cn', true, i >= 4)}
        ${E(M(0), L(0), i >= 1)}${E(M(0), M(1), i >= 1)}${T(L(0), leaf, i >= 1)}${T(M(1), main[1], i >= 1, i >= 4)}
        ${E(M(1), L(1), i >= 2)}${E(M(1), M(2), i >= 2)}${T(L(1), leaf, i >= 2)}${T(M(2), main[2], i >= 2, i >= 4)}
        ${E(M(2), L(2), i >= 3)}${T(L(2), leaf, i >= 3)}
        <text x=${M(3)[0] + 4} y=${M(3)[1] - 6} textAnchor="middle" fontSize="22" className=${pop(i >= 3)}>⋱</text>
        ${T([M(4)[0] + 5, M(4)[1] - 10], 'Θ(1)', i >= 3, i >= 4)}
        <g className=${pop(i >= 5)}><line x1="16" y1="30" x2="16" y2="236" stroke="var(--pen)" strokeWidth="2" /><path d="M10 38 L16 26 L22 38 M10 228 L16 240 L22 228" stroke="var(--pen)" strokeWidth="2" fill="none" />
          <text x="26" y="140" fontSize="18" fontStyle="italic">h = n</text></g>
      </svg>
      <div className=${'a5-box ' + pop(i >= 4)}>Θ(Σ<sub>k=1</sub><sup>n</sup> k) = Θ(n<sup>2</sup>)${i >= 5 ? html`<br />T(n) = Θ(n) + Θ(n<sup>2</sup>) = Θ(n<sup>2</sup>)` : ''}</div>
    </div><${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  // slides 27-32: the 1/10 : 9/10 split
  function AlmostBest() {
    const steps = [
      { en: 'Best case (for intuition): an even split gives T(n) = 2T(n/2) + Θ(n) = Θ(n lg n), like merge sort. What if the split is always <sup>1</sup>⁄<sub>10</sub> : <sup>9</sup>⁄<sub>10</sub>? T(n) = T(n/10) + T(9n/10) + Θ(n).' },
      { en: 'The root costs cn and has children T(n/10) and T(9n/10).' },
      { en: 'Level 1 costs cn/10 + 9cn/10 = cn. Its children: T(n/100), T(9n/100), T(9n/100), T(81n/100).' },
      { en: 'Level 2 costs (1 + 9 + 9 + 81)cn/100 = cn. Every full level adds up to cn.' },
      { en: 'The leftmost path shrinks fastest (by 10) and reaches Θ(1) after log<sub>10</sub> n levels; the rightmost shrinks slowest (by 10/9) and reaches Θ(1) after log<sub>10/9</sub> n levels. There are O(n) leaves.' },
      { en: 'So cn log<sub>10</sub> n ≤ T(n) ≤ cn log<sub>10/9</sub> n + O(n), and both bounds are Θ(n lg n). <b>Lucky!</b> Even a 1 : 9 split is fast.' }
    ];
    const [i, ctl] = useSteps(steps.length, 2500);
    const R = [175, 34], L1 = [[88, 104], [262, 104]], L2 = [[42, 174], [132, 174], [222, 174], [312, 174]];
    const T = (p, t, on, st) => html`<text x=${p[0]} y=${p[1]} textAnchor="middle" fontSize="18" fontStyle="italic" className=${pop(on)} style=${st}>${t}</text>`;
    const E = (a, b, on) => html`<line x1=${a[0]} y1=${a[1] + 7} x2=${b[0]} y2=${b[1] - 17} stroke="var(--ink)" strokeWidth="1.6" className=${pop(on)} />`;
    const l1 = i >= 2 ? ['cn/10', '9cn/10'] : ['T(n/10)', 'T(9n/10)'];
    const l2 = i >= 3 ? ['cn/100', '9cn/100', '9cn/100', '81cn/100'] : ['T(n/100)', 'T(9n/100)', 'T(9n/100)', 'T(81n/100)'];
    const sum = (y, on) => html`<g className=${pop(on)}><line x1="345" y1=${y - 5} x2="368" y2=${y - 5} stroke="var(--pen)" strokeDasharray="4 4" /><text x="384" y=${y} textAnchor="middle" fontSize="18" fontStyle="italic" style=${{ fill: 'var(--pen)' }}>cn</text></g>`;
    const hot = { fill: 'var(--fig-k)', fontWeight: 700 };
    return html`<figure className="fig"><div className="fig-stage">
      <svg viewBox="0 0 400 330" role="img" aria-label="Recursion tree of the one-tenth to nine-tenths split">
        ${T(R, i === 0 ? 'T(n)' : 'cn', true)}
        ${L1.map((p, k) => html`<g key=${k}>${E(R, p, i >= 1)}${T(p, l1[k], i >= 1)}</g>`)}
        ${L2.map((p, k) => { const q = i < 3 && k % 2 ? [p[0], p[1] + 24] : p; return html`<g key=${k}>${E(L1[k >> 1], p, i >= 2)}${T(q, l2[k], i >= 2)}</g>`; })}
        ${sum(R[1], i >= 3)}${sum(L1[0][1], i >= 3)}${sum(L2[0][1], i >= 3)}
        <text x="384" y="232" textAnchor="middle" fontSize="18" className=${pop(i >= 3)}>⋮</text>
        <g className=${pop(i >= 4)}>
          <line x1="36" y1="184" x2="24" y2="246" stroke="var(--ink)" strokeDasharray="2 5" strokeWidth="2" />
          ${T([26, 270], 'Θ(1)', true, hot)}
          <line x1="316" y1="184" x2="330" y2="276" stroke="var(--ink)" strokeDasharray="2 5" strokeWidth="2" />
          ${T([334, 300], 'Θ(1)', true, hot)}
          <rect x="112" y="238" width="128" height="34" rx="8" fill="color-mix(in srgb, var(--pen) 16%, var(--paper))" stroke="var(--pen)" />
          <text x="176" y="261" textAnchor="middle" fontSize="18"><tspan fontStyle="italic">O(n)</tspan> leaves</text>
          <text x="10" y="226" fontSize="18" style=${hot}>log<tspan dy="5">10</tspan><tspan dy="-5"> n</tspan></text>
          <text x="228" y="318" fontSize="18" style=${hot}>log<tspan dy="5">10/9</tspan><tspan dy="-5"> n</tspan></text>
        </g>
      </svg>
      <div className=${'a5-box ' + pop(i >= 5)}>cn log<sub>10</sub> n ≤ T(n) ≤ cn log<sub>10/9</sub> n + O(n)<br /><b>T(n) = Θ(n lg n)</b> <span className="a5-tag">Lucky!</span></div>
    </div><${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  // slide 33: alternating lucky and unlucky splits
  function Lucky() {
    const steps = [
      { en: 'Suppose the splits alternate: lucky, unlucky, lucky, unlucky, …. A lucky split is even: <b>L(n) = 2U(n/2) + Θ(n)</b>.' },
      { en: 'An unlucky split peels off one element: <b>U(n) = L(n − 1) + Θ(n)</b>. Each U(n/2) costs Θ(n/2) and leaves L(n/2 − 1).' },
      { en: 'Substitute U into L: L(n) = 2(L(n/2 − 1) + Θ(n/2)) + Θ(n).' },
      { en: '= 2L(n/2 − 1) + Θ(n) = <b>Θ(n lg n)</b>. Lucky! The unlucky levels only add Θ(n) per pair of levels. How can we make sure we are usually lucky?' }
    ];
    const [i, ctl] = useSteps(steps.length, 2600);
    const R = [200, 34], C = [[110, 110], [290, 110]], G = [[60, 186], [158, 186], [242, 186], [340, 186]];
    const T = (p, t, on, st) => html`<text x=${p[0]} y=${p[1]} textAnchor="middle" fontSize="18" fontStyle="italic" className=${pop(on)} style=${st}>${t}</text>`;
    const E = (a, b, on) => html`<line x1=${a[0]} y1=${a[1] + 8} x2=${b[0]} y2=${b[1] - 18} stroke="var(--ink)" strokeWidth="1.6" className=${pop(on)} />`;
    const hot = i >= 2 ? { fill: 'var(--fig-k)', fontWeight: 700 } : null;
    return html`<figure className="fig"><div className="fig-stage">
      <svg viewBox="0 0 400 230" role="img" aria-label="Lucky split followed by unlucky splits">
        ${T(R, 'L(n): Θ(n)', true)}<text x="200" y="62" textAnchor="middle" fontSize="18" style=${{ fill: 'var(--ok)' }}>lucky</text>
        ${C.map((p, k) => html`<g key=${k}>${E([R[0], R[1] + 22], p, true)}${T(p, i >= 1 ? 'U(n/2): Θ(n/2)' : 'U(n/2)', true)}</g>`)}
        <text x="200" y="140" textAnchor="middle" fontSize="18" className=${pop(i >= 1)} style=${{ fill: 'var(--pen)' }}>unlucky</text>
        ${G.map((p, k) => html`<g key=${k}>${E(C[k >> 1], p, i >= 1)}${T(p, k % 2 ? 'L(n/2 − 1)' : 'Θ(1)', i >= 1, k % 2 ? hot : null)}</g>`)}
        <text x="200" y="222" textAnchor="middle" fontSize="18" className=${pop(i >= 3)}>L(n) = 2L(n/2 − 1) + Θ(n)</text>
      </svg>
    </div><${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  // slides 34-36: randomized partition and the indicator X_k
  function Random() {
    const n = SLIDE.length, sorted = SLIDE.slice().sort((a, b) => a - b);
    const [pick, setPick] = useState(null), [cnt, setCnt] = useState(() => Array(n).fill(0)), [tot, setTot] = useState(0);
    const draw = m => { const c = cnt.slice(); let last = 0; for (let t = 0; t < m; t++) { last = Math.floor(Math.random() * n); c[sorted.indexOf(SLIDE[last])]++; } setCnt(c); setTot(tot + m); setPick(last); };
    const k = pick == null ? null : sorted.indexOf(SLIDE[pick]);
    const reg = SLIDE.map((v, j) => pick == null ? 'un' : j === pick ? 'x' : v < SLIDE[pick] ? 'le' : 'ge');
    const mx = Math.max(1, ...cnt);
    const en = pick == null ? 'Randomized quicksort partitions around a <b>random</b> element. Press “Pick a pivot” to choose one of the slides’ 8 elements uniformly at random.'
      : `Random pivot A[${pick + 1}] = ${SLIDE[pick]}: ${k} elements are smaller and ${n - k - 1} larger, a <b>${k} : ${n - k - 1} split</b>, so X<sub>${k}</sub> = 1 and every other X is 0. Then T(n) = T(${k}) + T(${n - k - 1}) + Θ(n). Each split has E[X<sub>k</sub>] = Pr{X<sub>k</sub> = 1} = 1/n = 1/${n}` + (tot > 1 ? ` (after ${tot} picks the bars level out near ${(tot / n).toFixed(1)} each).` : '.');
    return html`<figure className="fig"><div className="fig-stage"><div className="a5-w">
      <${Row} a=${SLIDE} reg=${reg} />
      <p className="a5-note" style=${{ margin: '6px 0 0', fontSize: '15px' }}>indicators X<sub>k</sub>, k = 0, 1, …, 7</p>
      <div className="a5-row" style=${{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>${cnt.map((_, j) => html`<div key=${j} className="a5-ptr" style=${{ color: k === j ? 'var(--pen)' : 'var(--graphite)' }}>${k == null ? '·' : k === j ? 1 : 0}</div>`)}</div>
      <div className="a5-hist" style=${{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>${cnt.map((c, j) => html`<div key=${j} style=${{ height: (c / mx * 100) + '%' }}></div>`)}</div>
      <div className="a5-row" style=${{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>${cnt.map((c, j) => html`<div key=${j} className="a5-idx">${j}:${n - j - 1}</div>`)}</div>
      <p className="a5-note" style=${{ margin: '4px 0 0' }}>how often each k : n−k−1 split came up (${tot} picks)</p>
    </div></div><${Cap} en=${en} />
      <div className="fig-bar"><button className="fig-btn solid" onClick=${() => draw(1)}>Pick a pivot</button><button className="fig-btn" onClick=${() => draw(100)}>Pick 100 times</button><span className="grow"></span>
        <button className="fig-btn" onClick=${() => { setPick(null); setCnt(Array(n).fill(0)); setTot(0); }}>↻ Reset</button></div></figure>`;
  }

  // slides 37-46: calculating the expectation, then the substitution method
  const S = (lo, hi) => `<span class="a5-sum">Σ<span class="a5-lim"><span>${hi}</span><span>${lo}</span></span></span>`;
  const Fr = (a, b) => `<span class="a5-fr"><span>${a}</span><span>${b}</span></span>`;
  const Q = 'T(k) + T(n−k−1) + Θ(n)';
  const DER = [
    [0, `E[T(n)] = E[ ${S('k=0', 'n−1')} X<sub>k</sub>(${Q}) ]`, 'Take expectations of both sides.', '37'],
    [0, `= ${S('k=0', 'n−1')} E[ X<sub>k</sub>(${Q}) ]`, 'Linearity of expectation.', '38'],
    [0, `= ${S('k=0', 'n−1')} E[X<sub>k</sub>] · E[${Q}]`, 'Independence of X<sub>k</sub> from other random choices.', '39'],
    [0, `= ${Fr(1, 'n')}${S('k=0', 'n−1')} E[T(k)] + ${Fr(1, 'n')}${S('k=0', 'n−1')} E[T(n−k−1)] + ${Fr(1, 'n')}${S('k=0', 'n−1')} Θ(n)`, 'Linearity of expectation; E[X<sub>k</sub>] = 1/n.', '40'],
    [0, `= ${Fr(2, 'n')}${S('k=1', 'n−1')} E[T(k)] + Θ(n)`, 'Summations have identical terms (k and n−k−1 run over the same values). The slide starts at k = 1; the k = 0 term 2E[T(0)]/n is only Θ(1/n) and fits in the Θ(n).', '41'],
    [1, `E[T(n)] = ${Fr(2, 'n')}${S('k=2', 'n−1')} E[T(k)] + Θ(n)`, 'Hairy recurrence: the k = 0, 1 terms are absorbed in the Θ(n). Prove E[T(n)] ≤ an lg n for a constant a > 0, choosing a large enough that an lg n dominates E[T(n)] for small n ≥ 2. Use the fact: ' + S('k=2', 'n−1') + ' k lg k ≤ ½n<sup>2</sup> lg n − ⅛n<sup>2</sup>.', '42'],
    [1, `E[T(n)] ≤ ${Fr(2, 'n')}${S('k=2', 'n−1')} ak lg k + Θ(n)`, 'Substitute the inductive hypothesis E[T(k)] ≤ ak lg k.', '43'],
    [1, `≤ ${Fr('2a', 'n')}(½n<sup>2</sup> lg n − ⅛n<sup>2</sup>) + Θ(n)`, 'Use the fact.', '44'],
    [1, `= an lg n − (${Fr('an', 4)} − Θ(n))`, 'Express as desired minus a residual: (2a/n)(½n<sup>2</sup> lg n) = an lg n and (2a/n)(⅛n<sup>2</sup>) = an/4.', '45'],
    [1, `≤ an lg n`, 'If a is chosen large enough that an/4 dominates the Θ(n). So E[T(n)] = O(n lg n). (Slide 46 writes “=” on the “2a/n(…)” line; it is “≤” as on slide 44.)', '46']
  ];
  function Expect() {
    const steps = DER.map(d => ({ en: `<b>Slide ${d[3]}:</b> ${d[2]}` }));
    const [i, ctl] = useSteps(steps.length, 3200);
    const g = DER[i][0];
    return html`<figure className="fig"><div className="fig-stage"><div className="a5-w">
      <p className="a5-hd">${g === 0 ? 'Calculating expectation' : 'Hairy recurrence, substitution method'}</p>
      <div className="a5-lines">${DER.map((d, k) => d[0] === g && k <= i && html`<div key=${k} className=${'a5-ln ' + (k === i ? 'a5-now' : 'a5-past')} dangerouslySetInnerHTML=${{ __html: d[1] }}></div>`)}</div>
    </div></div><${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  window.FIGS = Object.assign(window.FIGS || {}, {
    'ag-5-divide': Divide, 'ag-5-invariant': Invariant, 'ag-5-partition': Partition, 'ag-5-worst': Worst,
    'ag-5-almost-best': AlmostBest, 'ag-5-lucky': Lucky, 'ag-5-random': Random, 'ag-5-expect': Expect
  });
})();
/* ── part L6 ── */
// Algorithms visuals, Lecture 6 (Sorting lower bounds, counting sort, radix sort): the decision tree on 〈9, 4, 6〉 (slides 3-7), the
// height ≥ lg(n!) argument (slides 8-10), counting sort on A = 4 1 3 4 3 loop by loop (slides 13-28), stability (slide 30), radix sort on
// 329 457 657 839 436 720 355 (slide 32) and its correctness (slides 33-35), choosing r (slides 36-39) and Hollerith's sorter (slides 40-46).
// Every label and number comes from the slides.
(function () {
  const { useState, useEffect, useRef, useMemo } = React;
  const { html, useSteps, Cap, Bar, pop, calm, useClock, useFit, sec } = window.FIGKIT;
  const CSS = `
.a6-w{ max-width:520px; margin:0 auto; color:var(--ink); }
.a6-in{ display:flex; gap:6px; flex-wrap:wrap; align-items:center; margin:0 0 10px; }
.a6-in input{ flex:1 1 100%; order:-1; min-width:0; font:500 14px var(--mono); color:var(--ink); background:var(--paper); border:1px solid var(--line); border-radius:8px; padding:6px 8px; }
.a6-in .fig-btn{ font-size:13px; padding:4px 10px; }
.a6-in .fig-btn.a6-sel{ border-color:var(--fig-k); box-shadow:0 0 0 1px var(--fig-k); }
.a6-err{ color:var(--pen); font-size:13px; font-weight:600; margin:0 0 8px; }
.a6-arr{ display:grid; grid-template-columns:30px 1fr; gap:4px 6px; align-items:center; margin:0 0 6px; }
.a6-lab{ font:italic 600 16px var(--body); color:var(--ink); text-align:right; }
.a6-cells{ display:grid; gap:3px; }
.a6-c{ height:30px; display:grid; place-items:center; border:1px solid var(--line); border-radius:5px; font:600 15px var(--mono); color:var(--ink); background:var(--paper); transition:background .3s, box-shadow .3s; min-width:0; }
.a6-c.a6-on{ background:color-mix(in srgb, var(--hl) 40%, var(--paper)); }
.a6-c.a6-ch{ box-shadow:0 0 0 2px var(--fig-k) inset; }
.a6-c.a6-e{ color:transparent; }
.a6-ix{ font:500 12px var(--mono); color:var(--graphite); text-align:center; }
.a6-code{ font:500 13px/1.5 var(--mono); background:var(--paper); border:1px solid var(--line); border-radius:8px; padding:6px 8px; margin:8px 0 0; white-space:pre-wrap; color:var(--ink); }
.a6-code b{ color:var(--fig-k); }
.a6-box{ margin:10px auto 0; padding:8px 10px; border:1px solid var(--line); border-radius:8px; background:var(--paper); font-size:15px; line-height:1.5; text-align:center; max-width:440px; }
.a6-cols{ display:flex; justify-content:center; gap:10px; flex-wrap:nowrap; }
.a6-col{ display:flex; flex-direction:column; gap:2px; align-items:center; }
.a6-col h5{ margin:0 0 4px; font:600 12px var(--body); color:var(--graphite); text-align:center; min-height:30px; max-width:62px; line-height:1.2; }
.a6-num{ font:600 16px/1.5 var(--mono); color:var(--ink); padding:0 3px; border-radius:4px; }
.a6-num span{ padding:0 1px; border-radius:3px; }
.a6-d0{ background:color-mix(in srgb, var(--hl) 45%, var(--paper)); }
.a6-d1{ background:color-mix(in srgb, var(--pen) 26%, var(--paper)); }
.a6-d2{ background:color-mix(in srgb, var(--k-compiler) 28%, var(--paper)); }
.a6-d3{ background:color-mix(in srgb, var(--ok) 28%, var(--paper)); }
.a6-word{ display:flex; border:1px solid var(--line); border-radius:6px; overflow:hidden; height:34px; margin:4px 0; }
.a6-word div{ flex:1; display:grid; place-items:center; font:600 13px var(--mono); border-left:1px solid var(--line); background:color-mix(in srgb, var(--pen) 16%, var(--paper)); color:var(--ink); min-width:0; overflow:hidden; }
.a6-word div:first-child{ border-left:0; }
.a6-kv{ display:grid; grid-template-columns:auto 1fr; gap:3px 10px; font-size:15px; line-height:1.4; margin:8px 0 0; }
.a6-kv b{ color:var(--graphite); font-weight:600; }
.a6-ctl{ display:flex; gap:8px; align-items:center; flex-wrap:wrap; font-size:15px; margin:0 0 6px; }
.a6-ctl input[type=range]{ flex:1; min-width:120px; accent-color:var(--fig-k); }
.a6-ctl input[type=number]{ width:90px; font:500 14px var(--mono); color:var(--ink); background:var(--paper); border:1px solid var(--line); border-radius:8px; padding:4px 6px; }
.a6-sort{ display:grid; grid-template-columns:auto 1fr; gap:10px; align-items:start; }
.a6-card{ display:grid; grid-template-columns:22px repeat(3, 22px); gap:2px 3px; padding:6px 6px 6px 4px; border-radius:6px; background:color-mix(in srgb, var(--hl) 22%, var(--paper)); border:1px solid var(--line); }
.a6-card span{ height:18px; display:grid; place-items:center; font:500 12px var(--mono); color:var(--graphite); border-radius:3px; }
.a6-card .a6-h{ background:var(--ink); color:var(--paper); font-weight:700; }
.a6-card .a6-colon{ background:color-mix(in srgb, var(--fig-k) 22%, var(--paper)); }
.a6-card .a6-colon.a6-h{ background:var(--ink); }
.a6-note{ font:400 14px/1.4 var(--body); color:var(--graphite); text-align:center; }
.a6-bins{ display:grid; grid-template-rows:repeat(11, 18px); gap:2px; padding-top:6px; }
.a6-bin{ display:flex; gap:6px; align-items:center; font:600 13px var(--mono); color:var(--ink); border-bottom:1px dashed var(--line); transition:background .3s; min-width:0; overflow:hidden; white-space:nowrap; }
.a6-bin i{ font-style:normal; color:var(--graphite); width:30px; flex:none; font-weight:500; font-size:12px; }
.a6-bin.a6-lift{ background:color-mix(in srgb, var(--fig-k) 18%, var(--paper)); }
.a6-tag{ display:inline-block; font-size:13px; font-weight:700; padding:1px 8px; border-radius:99px; background:color-mix(in srgb, var(--fig-k) 18%, var(--paper)); }
`;
  if (!document.getElementById('a6-css')) { const s = document.createElement('style'); s.id = 'a6-css'; s.textContent = CSS; document.head.appendChild(s); }

  function parseNums(s, lo, hi, nmin, nmax) {
    const t = s.split(/[\s,]+/).filter(Boolean);
    if (t.length < nmin || t.length > nmax) return { err: nmin === nmax ? `Type exactly ${nmin} numbers.` : `Type ${nmin} to ${nmax} numbers.` };
    if (t.some(x => !/^\d+$/.test(x))) return { err: `Use whole numbers from ${lo} to ${hi}.` };
    const v = t.map(Number);
    if (v.some(x => x < lo || x > hi)) return { err: `Use whole numbers from ${lo} to ${hi}.` };
    return { v };
  }
  // an input row with presets; the keyed child restarts its steps whenever the input changes
  function useInput(presets, check) {
    const [txt, setTxt] = useState(presets[0][1].join(' ')), [v, setV] = useState(presets[0][1]), [err, setErr] = useState(''), [sel, setSel] = useState(0);
    const load = s => { const r = check(s); if (r.err) { setErr(r.err); return; } setErr(''); setSel(-1); setV(r.v); };
    const top = html`<div className="a6-in">${presets.map(([name, val], k) => html`<button key=${k} className=${'fig-btn' + (sel === k ? ' a6-sel' : '')} onClick=${() => { setTxt(val.join(' ')); setV(val); setErr(''); setSel(k); }}>${name}</button>`)}
        <input aria-label="Input numbers" value=${txt} onInput=${e => setTxt(e.target.value)} onKeyDown=${e => e.key === 'Enter' && load(txt)} />
        <button className="fig-btn solid" onClick=${() => load(txt)}>Try your own</button></div>
      ${err && html`<p className="a6-err" role="alert">${err}</p>`}`;
    return [v, top];
  }

  // slides 3-8: the decision tree for n = 3, followed on 〈9, 4, 6〉
  const DT = { id: 'r', t: '1:2', i: 0, j: 1, x: 195, y: 30,
    L: { id: 'a', t: '2:3', i: 1, j: 2, x: 102, y: 92, L: { leaf: [1, 2, 3], x: 46, y: 154 }, R: { id: 'b', t: '1:3', i: 0, j: 2, x: 152, y: 154, L: { leaf: [1, 3, 2], x: 108, y: 216 }, R: { leaf: [3, 1, 2], x: 196, y: 216 } } },
    R: { id: 'c', t: '1:3', i: 0, j: 2, x: 288, y: 92, L: { leaf: [2, 1, 3], x: 240, y: 154 }, R: { id: 'd', t: '2:3', i: 1, j: 2, x: 336, y: 154, L: { leaf: [2, 3, 1], x: 292, y: 216 }, R: { leaf: [3, 2, 1], x: 362, y: 216 } } } };
  function dtPath(a) { const P = []; let n = DT; while (!n.leaf) { const le = a[n.i] <= a[n.j]; P.push({ n, le }); n = le ? n.L : n.R; } P.push({ n }); return P; }
  function DTreeRun({ a }) {
    const P = useMemo(() => dtPath(a), [a]);
    const steps = [{ en: `Sort 〈a<sub>1</sub>, a<sub>2</sub>, a<sub>3</sub>〉 = 〈${a.join(', ')}〉. Each internal node i:j compares a<sub>i</sub> with a<sub>j</sub>: go <b>left</b> if a<sub>i</sub> ≤ a<sub>j</sub>, <b>right</b> if a<sub>i</sub> ≥ a<sub>j</sub>.` }];
    P.forEach((s, k) => {
      if (s.n.leaf) { const pi = s.n.leaf, v = pi.map(q => a[q - 1]); steps.push({ en: `Leaf <b>${pi.join('')}</b>: the ordering a<sub>${pi[0]}</sub> ≤ a<sub>${pi[1]}</sub> ≤ a<sub>${pi[2]}</sub>, that is <b>${v.join(' ≤ ')}</b>, has been established. The path took ${k} comparisons: the running time is the length of the path, the worst case is the height of the tree (3).` }); }
      else { const ai = a[s.n.i], aj = a[s.n.j]; steps.push({ en: `Node ${s.n.t}: a<sub>${s.n.i + 1}</sub> = ${ai} ${s.le ? '≤' : '≥'} a<sub>${s.n.j + 1}</sub> = ${aj}, so go <b>${s.le ? 'left' : 'right'}</b>.` }); }
    });
    const [i, ctl] = useSteps(steps.length, 1800);
    const on = new Set(P.slice(0, i).map(s => s.n)), edgeOn = (p, c) => P.slice(0, i).some((s, k) => s.n === p && P[k + 1] && P[k + 1].n === c);
    const nodes = [], edges = [];
    (function walk(n, par) { if (par) edges.push([par, n]); nodes.push(n); if (!n.leaf) { walk(n.L, n); walk(n.R, n); } })(DT, null);
    const cur = i > 0 ? P[i - 1] : null;
    return html`<div className="fig-stage">
      <svg viewBox="0 0 390 250" role="img" aria-label="Decision tree for sorting three elements">
        ${edges.map(([p, c], k) => html`<line key=${k} x1=${p.x} y1=${p.y} x2=${c.x} y2=${c.y} stroke=${edgeOn(p, c) ? 'var(--fig-k)' : 'var(--ink)'} strokeWidth=${edgeOn(p, c) ? 4 : 1.6} />`)}
        ${cur && !cur.n.leaf && html`<text x=${(cur.n.x + (cur.le ? cur.n.L : cur.n.R).x) / 2 + (cur.le ? -26 : 26)} y=${(cur.n.y + (cur.le ? cur.n.L : cur.n.R).y) / 2 - 2} textAnchor="middle" fontSize="17" style=${{ fill: 'var(--pen)', fontWeight: 700 }}>${a[cur.n.i]}${cur.le ? '≤' : '≥'}${a[cur.n.j]}</text>`}
        ${nodes.map((n, k) => n.leaf
          ? html`<g key=${k}><rect x=${n.x - 25} y=${n.y - 15} width="50" height="30" rx="3" fill=${on.has(n) ? 'color-mix(in srgb, var(--hl) 55%, var(--paper))' : 'var(--paper-2)'} stroke="var(--graphite)" strokeWidth="1.5" /><text x=${n.x} y=${n.y + 6} textAnchor="middle" fontSize="17">${n.leaf.join('')}</text></g>`
          : html`<g key=${k}><ellipse cx=${n.x} cy=${n.y} rx="26" ry="17" fill=${on.has(n) ? 'color-mix(in srgb, var(--fig-k) 30%, var(--paper))' : 'color-mix(in srgb, var(--pen) 16%, var(--paper))'} stroke=${on.has(n) ? 'var(--fig-k)' : 'var(--graphite)'} strokeWidth="1.5" /><text x=${n.x} y=${n.y + 6} textAnchor="middle" fontSize="17">${n.t}</text></g>`)}
      </svg></div>
      <${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} />`;
  }
  function DTree() {
    const [a, top] = useInput([['Slide example', [9, 4, 6]]], s => parseNums(s, 0, 99, 3, 3));
    return html`<figure className="fig"><div className="fig-stage" style=${{ paddingBottom: 0 }}><div className="a6-w">${top}</div></div><${DTreeRun} key=${a.join(',')} a=${a} /></figure>`;
  }

  // slides 8-10: any decision tree that sorts n elements has height Ω(n lg n)
  const lgFact = n => { let s = 0; for (let k = 2; k <= n; k++) s += Math.log2(k); return s; };
  const fact = n => { let f = 1; for (let k = 2; k <= n; k++) f *= k; return f; };
  function LowerBound() {
    const steps = [
      { en: 'A decision tree models any comparison sort: one tree per n, one path per input. Running time = length of the path, worst-case time = <b>height h</b> of the tree.' },
      { en: 'The tree must contain <b>≥ n!</b> leaves, since every one of the n! permutations can be the answer. For n = 3: 3! = 6 leaves (123, 132, 312, 213, 231, 321).' },
      { en: 'A binary tree of height h has <b>≤ 2<sup>h</sup></b> leaves. Thus n! ≤ 2<sup>h</sup>, so h ≥ lg(n!) (lg is monotonically increasing).' },
      { en: 'Stirling’s formula: n! ≥ (n/e)<sup>n</sup>, so h ≥ lg((n/e)<sup>n</sup>) = n lg n − n lg e = <b>Ω(n lg n)</b>.' },
      { en: '<b>Corollary:</b> heapsort and merge sort, which run in O(n lg n), are asymptotically optimal comparison sorts. Move n to compare the bound with n lg n.' }
    ];
    const [i, ctl] = useSteps(steps.length, 2800);
    const [n, setN] = useState(3);
    const lf = lgFact(n), hmin = Math.ceil(lf - 1e-9), st = n * Math.log2(n) - n * Math.log2(Math.E);
    return html`<figure className="fig"><div className="fig-stage"><div className="a6-w">
      <svg viewBox="0 0 320 170" role="img" aria-label="A tree of height h with n factorial leaves">
        <path d="M160 18 L40 132 L280 132 Z" fill="color-mix(in srgb, var(--fig-k) 14%, var(--paper))" stroke="var(--fig-k)" strokeWidth="2" />
        <text x="160" y="90" textAnchor="middle" fontSize="18">decision tree</text>
        <g className=${pop(i >= 1)}>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => html`<rect key=${k} x=${48 + k * 23} y="136" width="17" height="13" fill="color-mix(in srgb, var(--hl) 55%, var(--paper))" stroke="var(--graphite)" />`)}
          <text x="160" y="168" textAnchor="middle" fontSize="16">≥ n! leaves${i >= 2 ? ', ≤ 2' : ''}${i >= 2 ? html`<tspan dy="-6" fontSize="14">h</tspan>` : ''}</text></g>
        <g className=${pop(i >= 0)}><line x1="300" y1="18" x2="300" y2="132" stroke="var(--pen)" strokeWidth="2" /><path d="M294 28 L300 16 L306 28 M294 122 L300 134 L306 122" stroke="var(--pen)" strokeWidth="2" fill="none" /><text x="290" y="80" textAnchor="end" fontSize="18" fontStyle="italic">h</text></g>
      </svg>
      <div className=${'a6-box ' + pop(i >= 2)}>n! ≤ 2<sup>h</sup> ⇒ h ≥ lg(n!)${i >= 3 ? html` ≥ lg((n/e)<sup>n</sup>) = n lg n − n lg e` : ''}</div>
      <div className=${pop(i >= 4)}>
        <div className="a6-ctl" style=${{ marginTop: '10px' }}><label htmlFor="a6-n">n = <b>${n}</b></label><input id="a6-n" type="range" min="2" max="20" value=${n} onInput=${e => setN(+e.target.value)} aria-label="Number of elements n" /></div>
        <div className="a6-kv"><b>leaves ≥ n!</b><span>${fact(n).toLocaleString('en-US')}</span><b>h ≥ ⌈lg n!⌉</b><span>${hmin} comparisons</span><b>n lg n − n lg e</b><span>${st.toFixed(1)}</span><b>n lg n</b><span>${(n * Math.log2(n)).toFixed(1)}</span></div>
      </div>
    </div></div><${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  // slides 13-28: counting sort loop by loop
  function csTrace(A) {
    const n = A.length, k = Math.max(...A), F = [];
    let C = Array(k).fill(null), cnt = null, B = Array(n).fill(null);
    const snap = (o) => F.push(Object.assign({ C: C.slice(), Cp: null, B: B.slice(), ja: -1, ci: -1, bi: -1 }, o));
    snap({ loop: 0, en: `Input A[1..${n}] with every A[j] ∈ {1, …, ${k}}, output B[1..${n}], auxiliary storage C[1..${k}]. No comparisons between elements will be made.` });
    C = Array(k).fill(0);
    snap({ loop: 1, en: `<b>Loop 1:</b> for i ← 1 to k do C[i] ← 0. Θ(k) time.` });
    for (let j = 0; j < n; j++) { C[A[j] - 1]++; snap({ loop: 2, ja: j, ci: A[j] - 1, en: `<b>Loop 2</b>, j = ${j + 1}: A[${j + 1}] = ${A[j]}, so C[${A[j]}] ← C[${A[j]}] + 1 = ${C[A[j] - 1]}. Now C[i] = |{key = i}|.` }); }
    cnt = C.slice();
    for (let i = 1; i < k; i++) { const old = C[i]; C[i] += C[i - 1]; F.push({ loop: 3, C: cnt.slice(), Cp: C.slice(), B: B.slice(), ja: -1, ci: i, bi: -1, en: `<b>Loop 3</b>, i = ${i + 1}: C[${i + 1}] ← C[${i + 1}] + C[${i}] = ${old} + ${C[i - 1]} = ${C[i]}. Now C[i] = |{key ≤ i}|.` }); }
    if (k === 1) F.push({ loop: 3, C: cnt.slice(), Cp: C.slice(), B: B.slice(), ja: -1, ci: -1, bi: -1, en: '<b>Loop 3</b>: k = 1, nothing to add.' });
    for (let j = n - 1; j >= 0; j--) {
      const before = C.slice(), pos = C[A[j] - 1]; B[pos - 1] = A[j]; C[A[j] - 1]--;
      F.push({ loop: 4, C: before, Cp: C.slice(), B: B.slice(), ja: j, ci: A[j] - 1, bi: pos - 1, en: `<b>Loop 4</b>, j = ${j + 1}: A[${j + 1}] = ${A[j]} and C[${A[j]}] = ${pos}, so B[${pos}] ← ${A[j]}, then C[${A[j]}] ← ${pos} − 1 = ${pos - 1}.` });
    }
    F.push({ loop: 5, C: C.slice(), Cp: null, B: B.slice(), ja: -1, ci: -1, bi: -1, en: `Done: B = ${B.join(' ')}. Time Θ(k) + Θ(n) + Θ(k) + Θ(n) = <b>Θ(n + k)</b>; when k = O(n) that is Θ(n), with not a single comparison. Final C = ${C.join(' ')}.` });
    return F;
  }
  const CODE = ['for i ← 1 to k\n   do C[i] ← 0', 'for j ← 1 to n\n   do C[A[j]] ← C[A[j]] + 1   ⊳ C[i] = |{key = i}|', 'for i ← 2 to k\n   do C[i] ← C[i] + C[i–1]   ⊳ C[i] = |{key ≤ i}|', 'for j ← n downto 1\n   do B[C[A[j]]] ← A[j]\n      C[A[j]] ← C[A[j]] – 1'];
  function Cells({ lab, v, hi, ch, idx }) {
    const n = v.length;
    return html`<div className="a6-arr">${idx ? html`<span></span><div className="a6-cells" style=${{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>${v.map((_, k) => html`<span key=${k} className="a6-ix">${k + 1}</span>`)}</div>` : ''}
      <span className="a6-lab">${lab}</span><div className="a6-cells" style=${{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>${v.map((x, k) => html`<div key=${k} className=${'a6-c' + (x == null ? ' a6-e' : '') + (k === hi ? ' a6-on' : '') + (k === ch ? ' a6-ch' : '')}>${x == null ? '·' : x}</div>`)}</div></div>`;
  }
  function CsRun({ A }) {
    const F = useMemo(() => csTrace(A), [A]);
    const [i, ctl] = useSteps(F.length, 1500), f = F[i];
    return html`<div className="fig-stage" style=${{ paddingTop: 0 }}><div className="a6-w">
      <${Cells} lab="A:" v=${A} hi=${f.ja} idx=${true} />
      <${Cells} lab="B:" v=${f.B} ch=${f.bi} />
      <div style=${{ height: '6px' }}></div>
      <${Cells} lab="C:" v=${f.C} ch=${f.loop === 2 ? f.ci : -1} hi=${f.loop === 4 ? f.ci : -1} idx=${true} />
      ${f.Cp && html`<${Cells} lab="C′:" v=${f.Cp} ch=${f.ci} />`}
      ${f.loop >= 1 && f.loop <= 4 ? html`<div className="a6-code">${CODE[f.loop - 1]}</div>` : ''}
    </div></div><${Cap} en=${f.en} /><${Bar} steps=${F} i=${i} ctl=${ctl} />`;
  }
  function CSort() {
    const [A, top] = useInput([['Slide example', [4, 1, 3, 4, 3]], ['Exam table', [8, 5, 7, 3, 6, 1, 2]]], s => parseNums(s, 1, 9, 2, 10));
    return html`<figure className="fig"><div className="fig-stage" style=${{ paddingBottom: '4px' }}><div className="a6-w">${top}</div></div><${CsRun} key=${A.join(',')} A=${A} /></figure>`;
  }

  // slide 30: counting sort is stable
  function Stable() {
    const A = [4, 1, 3, 4, 3], Bv = [1, 3, 3, 4, 4], map = [3, 0, 1, 4, 2]; // A index -> B index (from loop 4)
    const tag = ['first 4', '1', 'first 3', 'second 4', 'second 3'];
    const steps = [
      { en: 'Counting sort is a <b>stable</b> sort: it preserves the input order among equal elements. A = 4 1 3 4 3 becomes B = 1 3 3 4 4.' },
      { en: 'The two 3s: A[3] goes to B[2] and A[5] goes to B[3]. The 3 that came first in A is still first in B.' },
      { en: 'The two 4s: A[1] goes to B[4] and A[4] goes to B[5], again in input order. Loop 4 runs j from n down to 1 and fills each key’s slots from the right, which is what keeps equal keys in order.' },
      { en: 'Exercise from the slide: what other sorts have this property? (Insertion sort and merge sort are stable; quicksort and heapsort are not.)' }
    ];
    const [i, ctl] = useSteps(steps.length, 2600);
    const show = k => i >= 3 || (i === 1 && A[k] === 3) || (i === 2 && A[k] === 4) || (i >= 2 && A[k] === 3);
    const col = k => A[k] === 3 ? 'var(--fig-k)' : A[k] === 4 ? 'var(--pen)' : 'var(--ok)';
    const X = k => 30 + k * 60;
    return html`<figure className="fig"><div className="fig-stage">
      <svg viewBox="0 0 320 210" role="img" aria-label="Equal keys keep their order from A to B">
        <text x="6" y="47" fontSize="18" fontStyle="italic">A:</text><text x="6" y="177" fontSize="18" fontStyle="italic">B:</text>
        ${A.map((v, k) => html`<g key=${k}>
          <line x1=${X(k) + 25} y1="62" x2=${X(map[k]) + 25} y2="150" stroke=${col(k)} strokeWidth=${A[k] === 1 ? 2 : 3} strokeDasharray=${k === 3 || k === 4 ? '7 5' : null} className=${pop(show(k))} />
          <rect x=${X(k)} y="22" width="50" height="38" rx="5" fill="color-mix(in srgb, var(--pen) 14%, var(--paper))" stroke="var(--line)" />
          <text x=${X(k) + 25} y="48" textAnchor="middle" fontSize="20">${v}</text>
          <text x=${X(k) + 25} y="16" textAnchor="middle" fontSize="14" style=${{ fill: 'var(--graphite)' }}>${k + 1}</text>
          <rect x=${X(k)} y="150" width="50" height="38" rx="5" fill="color-mix(in srgb, var(--pen) 14%, var(--paper))" stroke="var(--line)" />
          <text x=${X(k) + 25} y="176" textAnchor="middle" fontSize="20">${Bv[k]}</text>
          <text x=${X(k) + 25} y="206" textAnchor="middle" fontSize="14" style=${{ fill: 'var(--graphite)' }}>${k + 1}</text></g>`)}
      </svg>
      <p className="a6-note" style=${{ margin: '2px 0 0' }}>solid line: the first copy of a key, dashed: the second copy</p>
    </div><${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  // slide 32: radix sort, least significant digit first
  const dig = (x, t) => Math.floor(x / Math.pow(10, t)) % 10;
  function rxTrace(nums) {
    const d = Math.max(1, ...nums.map(x => String(x).length)), cols = [nums.slice()];
    for (let t = 0; t < d; t++) { const c = cols[t], o = []; for (let v = 0; v < 10; v++) for (const x of c) if (dig(x, t) === v) o.push(x); cols.push(o); }
    return { d, cols };
  }
  const NAMES = ['units', 'tens', 'hundreds', 'thousands'];
  function RadixRun({ nums }) {
    const { d, cols } = useMemo(() => rxTrace(nums), [nums]);
    const steps = [{ en: `Radix sort, digit by digit, <b>least-significant digit first</b>, with a stable sort on each digit. ${d} digits, so ${d} passes. The first pass sorts on the ${NAMES[0]} digit (highlighted).` }];
    for (let t = 0; t < d; t++) {
      const prev = cols[t], c = cols[t + 1];
      let pair = null; for (let a = 0; a < c.length - 1 && !pair; a++) if (dig(c[a], t) === dig(c[a + 1], t) && c[a] !== c[a + 1]) pair = [c[a], c[a + 1]];
      steps.push({ en: `Pass ${t + 1}: stable sort on the ${NAMES[t]} digit: ${c.join(' ')}.` + (pair ? ` ${pair[0]} stays above ${pair[1]}: both have ${NAMES[t]} digit ${dig(pair[0], t)} and ${pair[0]} came first.` : '') + (t === d - 1 ? ' <b>Sorted.</b>' : '') });
    }
    const [i, ctl] = useSteps(steps.length, 2200);
    const w = String(Math.max(...nums)).length;
    const N = (x, c) => { const s = String(x).padStart(d, ' '); return html`<div className="a6-num">${[...s].map((ch, p) => { const t = d - 1 - p, on = (t === c && c < d && c <= i) || (t === c - 1); return html`<span key=${p} className=${on ? 'a6-d' + t : ''}>${ch === ' ' ? ' ' : ch}</span>`; })}</div>`; };
    return html`<div className="fig-stage" style=${{ paddingTop: 0 }}><div className="a6-w"><div className="a6-cols">
      ${cols.map((c, k) => k <= i && html`<div key=${k} className="a6-col"><h5>${k === 0 ? 'input' : 'by ' + NAMES[k - 1]}</h5>${c.map((x, r) => html`<div key=${r}>${N(x, k)}</div>`)}</div>`)}
    </div></div></div><${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} />`;
  }
  function Radix() {
    const [v, top] = useInput([['Slide example', [329, 457, 657, 839, 436, 720, 355]]], s => parseNums(s, 0, 9999, 2, 8));
    return html`<figure className="fig"><div className="fig-stage" style=${{ paddingBottom: '4px' }}><div className="a6-w">${top}</div></div><${RadixRun} key=${v.join(',')} nums=${v} /></figure>`;
  }

  // slides 33-35: correctness by induction on the digit position
  function RadixProof() {
    const L = [720, 329, 436, 839, 355, 457, 657], R = [329, 355, 436, 457, 657, 720, 839];
    const steps = [
      { en: '<b>Induction on digit position.</b> Assume the numbers are already sorted by their low-order t − 1 digits (here t = 3: the left column is sorted on its last two digits, pink).' },
      { en: 'Sort on digit t (the hundreds digit, blue) with a stable sort: 329 355 436 457 657 720 839.' },
      { en: 'Two numbers that <b>differ in digit t</b> are correctly sorted: 720 and 329 differ in the hundreds digit (7 > 3), so the sort on digit t puts 329 first, whatever their low-order digits.' },
      { en: 'Two numbers <b>equal in digit t</b> are put in the same order as the input: 436 and 457 both have hundreds digit 4, so the stable sort keeps 436 above 457, which is correct because by induction they were already in order on their low digits.' }
    ];
    const [i, ctl] = useSteps(steps.length, 2800);
    const y = r => 34 + r * 30, hot = new Set(i === 2 ? [720, 329] : i === 3 ? [436, 457] : []);
    const N = (x, X, r, side) => { const s = String(x); return html`<text x=${X} y=${y(r)} fontSize="20" style=${{ fontFamily: 'var(--mono)', fontWeight: hot.has(x) ? 700 : 500 }}>
      <tspan style=${{ fill: hot.has(x) ? 'var(--pen)' : 'var(--ink)' }}>${s[0]}</tspan><tspan style=${{ fill: hot.has(x) ? 'var(--pen)' : 'var(--ink)' }}>${s.slice(1)}</tspan></text>`; };
    const arrow = (x, c) => { const a = L.indexOf(x), b = R.indexOf(x); return html`<path key=${x} d=${`M102 ${y(a) - 6} C160 ${y(a) - 6} 150 ${y(b) - 6} 195 ${y(b) - 6}`} stroke="var(--pen)" strokeWidth="2.5" fill="none" markerEnd="url(#a6-ar)" />`; };
    return html`<figure className="fig"><div className="fig-stage">
      <svg viewBox="0 0 300 240" role="img" aria-label="Sorting on digit t keeps the order correct">
        <defs><marker id="a6-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="var(--pen)" /></marker></defs>
        <rect x="55" y="12" width="17" height="210" rx="8" fill="color-mix(in srgb, var(--k-compiler) 26%, var(--paper))" className=${pop(i >= 1)} />
        <rect x="72" y="12" width="26" height="210" rx="8" fill="color-mix(in srgb, var(--pen) 18%, var(--paper))" />
        <rect x="199" y="12" width="17" height="210" rx="8" fill="color-mix(in srgb, var(--k-compiler) 26%, var(--paper))" className=${pop(i >= 1)} />
        ${L.map((x, r) => html`<g key=${'l' + x}>${N(x, 58, r)}</g>`)}
        <g className=${pop(i >= 1)}>${R.map((x, r) => html`<g key=${'r' + x}>${N(x, 202, r)}</g>`)}</g>
        ${i === 2 && [720, 329].map(x => arrow(x))}${i === 3 && [436, 457].map(x => arrow(x))}
      </svg>
    </div><${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  // slides 36-39: n words of b bits, cut into r-bit digits
  function RadixR() {
    const [n, setN] = useState(2000), [b, setB] = useState(32), [r, setR] = useState(8);
    const nn = Math.max(1, Math.min(1e7, Math.floor(+n) || 1)), rr = Math.min(r, b), passes = Math.ceil(b / rr), per = nn + Math.pow(2, rr), lg = Math.log2(nn);
    const cost = q => Math.ceil(b / q) * (nn + Math.pow(2, q));
    const rs = Array.from({ length: Math.min(b, 24) }, (_, k) => k + 1), best = rs.reduce((m, q) => cost(q) < cost(m) ? q : m, 1);
    const lc = rs.map(q => Math.log(cost(q))), lo = Math.min(...lc), hi = Math.max(...lc), H = c => 8 + (Math.log(c) - lo) / Math.max(1e-9, hi - lo) * 84;
    const en = `b = ${b}-bit words, r = ${rr}: each word is ${passes} base-2<sup>${rr}</sup> digits, so ${passes} passes of counting sort, each Θ(n + 2<sup>r</sup>) = ${nn.toLocaleString('en-US')} + ${Math.pow(2, rr).toLocaleString('en-US')}. T(n, b) = Θ((b/r)(n + 2<sup>r</sup>)) ≈ ${passes} × ${per.toLocaleString('en-US')} = ${(passes * per).toLocaleString('en-US')}. ` +
      (rr > lg + 1 ? 'Here 2<sup>r</sup> ≫ n: fewer passes, but each pass grows exponentially. ' : '') + `Choosing r = lg n ≈ ${lg.toFixed(1)} gives Θ(bn / lg n), at most ⌈b / ${Math.max(1, Math.round(lg))}⌉ = ${Math.ceil(b / Math.max(1, Math.round(lg)))} passes; merge sort and quicksort do at least ⌈lg n⌉ = ${Math.ceil(lg)} passes.`;
    return html`<figure className="fig"><div className="fig-stage"><div className="a6-w">
      <div className="a6-ctl"><label>n = <input type="number" min="1" max="10000000" value=${n} onInput=${e => setN(e.target.value)} aria-label="Number of words n" /></label>
        <label>b = <select className="fig-btn" value=${b} onChange=${e => setB(+e.target.value)} aria-label="Bits per word b">${[16, 32, 64].map(x => html`<option key=${x} value=${x}>${x}</option>`)}</select></label></div>
      <div className="a6-ctl"><label htmlFor="a6-r">r = <b>${rr}</b></label><input id="a6-r" type="range" min="1" max=${b} value=${rr} onInput=${e => setR(+e.target.value)} aria-label="Bits per digit r" /></div>
      <div className="a6-word">${passes <= 16 ? Array.from({ length: passes }, (_, k) => html`<div key=${k}>${k === passes - 1 && b % rr ? b % rr : rr}</div>`) : html`<div>${passes} digits of ${rr} bit${rr > 1 ? 's' : ''}</div>`}</div>
      <p className="a6-note" style=${{ margin: '0 0 6px' }}>one ${b}-bit word cut into r-bit digits (bits per digit shown); bars: ⌈b/r⌉(n + 2<sup style=${{ fontSize: '12px' }}>r</sup>) for each r, log scale</p>
      <svg viewBox="0 0 320 130" role="img" aria-label="Cost of radix sort for each r">
        ${rs.map(q => html`<rect key=${q} x=${8 + (q - 1) * (300 / rs.length)} y=${100 - H(cost(q))} width=${300 / rs.length - 2} height=${H(cost(q))} fill=${q === rr ? 'var(--fig-k)' : q === best ? 'var(--ok)' : 'color-mix(in srgb, var(--fig-k) 30%, var(--paper))'} />`)}
        <line x1="6" y1="100" x2="312" y2="100" stroke="var(--line)" />
        <text x="8" y="122" fontSize="16">r = 1</text><text x="312" y="122" textAnchor="end" fontSize="16">r = ${rs.length}</text>
        <text x="160" y="122" textAnchor="middle" fontSize="16" style=${{ fill: 'var(--ok)' }}>cheapest: r = ${best}</text>
      </svg>
      <div className="a6-ctl" style=${{ justifyContent: 'center', marginTop: '4px' }}><button className="fig-btn" onClick=${() => { setN(2000); setB(32); setR(8); }}>Slide: b = 32, r = 8 (4 passes)</button><button className="fig-btn" onClick=${() => { setB(32); setR(16); }}>r = 16 (2 passes)</button></div>
    </div></div><${Cap} en=${en} /></figure>`;
  }

  // slides 40-46: Hollerith's sorter does one pass of a stable sort
  function Sorter() {
    const cards = [329, 457, 657, 839, 436, 720, 355];
    const steps = [{ en: 'Punched card = data record, hole = value. Each column of the card has rows 0 to 9 and a hole in the row of its digit. The operator sorts the slide’s cards on the <b>units</b> column (highlighted).' }];
    cards.forEach(c => steps.push({ en: `The operator inserts card ${c} into the press. A pin reaches through the hole in row ${c % 10} and makes contact with the mercury cup below, so the lid of <b>bin ${c % 10}</b> lifts; the card goes in and the lid closes.` }));
    steps.push({ en: 'All cards processed: the front panel opens and the bins are collected in order 0, 1, …, 9: 720 355 436 457 657 329 839, exactly the second column of slide 32. Cards in the same bin keep their order: <b>one pass of a stable sort</b>.' });
    steps.push({ en: 'Hollerith’s 1889 patent describes most-significant-digit first. Least-significant-digit-first radix sort seems to be a folk invention of the machine operators. (Hollerith’s machines reported the 1890 U.S. census in 6 weeks; the 1880 census took almost 10 years.)' });
    const [i, ctl] = useSteps(steps.length, 1900);
    const k = Math.min(i, cards.length), cur = i >= 1 && i <= cards.length ? cards[i - 1] : null;
    const bins = Array.from({ length: 10 }, (_, d) => cards.slice(0, k).filter(c => c % 10 === d));
    const out = bins.flat();
    const card = cur != null ? cur : i === 0 ? cards[0] : null;
    const ds = card == null ? null : String(card).split('').map(Number);
    return html`<figure className="fig"><div className="fig-stage"><div className="a6-w"><div className="a6-sort">
      <div><div className="a6-card" aria-label=${card == null ? 'card' : 'punched card ' + card}>
        <span></span>${[0, 1, 2].map(c => html`<span key=${c} style=${{ fontWeight: 700, color: c === 2 ? 'var(--fig-k)' : 'var(--graphite)' }}>${ds ? ds[c] : '·'}</span>`)}
        ${Array.from({ length: 10 }, (_, d) => html`<${React.Fragment} key=${d}><span>${d}</span>${[0, 1, 2].map(c => html`<span key=${c} className=${(ds && ds[c] === d ? 'a6-h' : '') + (c === 2 ? ' a6-colon' : '')}>${ds && ds[c] === d ? '●' : ''}</span>`)}</${React.Fragment}>`)}
      </div><p className="a6-ix" style=${{ margin: '4px 0 0', fontSize: '12px' }}>${card == null ? 'cards collected' : 'card ' + card}</p></div>
      <div className="a6-bins"><div className="a6-bin"><i>bin</i>cards</div>${bins.map((bn, d) => html`<div key=${d} className=${'a6-bin' + (cur != null && cur % 10 === d ? ' a6-lift' : '')}><i>${d}</i>${bn.join(' ')}</div>`)}</div>
    </div>
    <div className=${'a6-box ' + pop(i >= cards.length + 1)}>collected: ${out.join(' ')}</div>
    </div></div><${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  window.FIGS = Object.assign(window.FIGS || {}, {
    'ag-6-dtree': DTree, 'ag-6-lower-bound': LowerBound, 'ag-6-csort': CSort, 'ag-6-stable': Stable,
    'ag-6-radix': Radix, 'ag-6-radix-proof': RadixProof, 'ag-6-radix-r': RadixR, 'ag-6-sorter': Sorter
  });
})();
/* ── part L12 ── */
// Algorithms visuals, Lecture 12 (Augmenting data structures): the OS-tree and its sizes (slides 2-3), OS-SELECT(root, 5) (slides 4-5),
// OS-RANK on the same tree (notes, Midterm 2025), INSERT("K") and why ranks are not stored (slides 6-7), size fix-up in a rotation (slide 8),
// intervals and overlap (slide 10), the interval tree and m[x] (slides 11-12), m fix-up in a rotation (slide 13), INTERVAL-SEARCH on
// [14,16] and [12,14] (slides 14-21) and the correctness proof pictures (slides 23-25). Every label and number comes from the slides.
(function () {
  const { useState, useEffect, useRef, useMemo } = React;
  const { html, useSteps, Cap, Bar, pop, calm, useClock, useFit, sec } = window.FIGKIT;
  const CSS = `
.a12-w{ max-width:520px; margin:0 auto; color:var(--ink); }
.a12-pick{ display:flex; flex-wrap:wrap; gap:5px; justify-content:center; align-items:center; margin:0 0 8px; }
.a12-pick .fig-btn{ font-size:13px; padding:3px 9px; min-height:30px; }
.a12-pick .fig-btn.a12-sel{ border-color:var(--fig-k); box-shadow:0 0 0 1px var(--fig-k); background:color-mix(in srgb, var(--fig-k) 14%, var(--paper)); }
.a12-lbl{ font-size:14px; color:var(--graphite); }
.a12-in{ width:64px; font:500 14px var(--mono); color:var(--ink); background:var(--paper); border:1px solid var(--line); border-radius:8px; padding:4px 6px; }
.a12-err{ color:var(--pen); font-size:13px; font-weight:600; margin:0 0 6px; text-align:center; }
.a12-g{ transition:transform .8s ease; }
.a12-note{ font:400 14px/1.4 var(--body); color:var(--graphite); text-align:center; margin:4px 0 0; }
.a12-box{ margin:8px auto 0; padding:6px 10px; border:1px solid var(--line); border-radius:8px; background:var(--paper); font-size:15px; line-height:1.5; text-align:center; max-width:420px; }
.a12-ctl{ display:flex; gap:8px; align-items:center; font-size:15px; margin:0 0 4px; }
.a12-ctl input[type=range]{ flex:1; min-width:0; accent-color:var(--fig-k); }
.a12-ctl span{ width:74px; flex:none; }
@media (prefers-reduced-motion: reduce){ .a12-g{ transition:none; } }
`;
  if (!document.getElementById('a12-css')) { const s = document.createElement('style'); s.id = 'a12-css'; s.textContent = CSS; document.head.appendChild(s); }

  // a node: key on top, the stored value (size or m) below the line
  const FILL = { y: 'color-mix(in srgb, var(--hl) 38%, var(--paper))', b: '#1f2329', r: '#d23c3c', n: 'color-mix(in srgb, var(--k-compiler) 32%, var(--paper))' };
  function Node({ x, y, top, bot, kind, hot, dim, R = 24 }) {
    const wt = kind === 'b' || kind === 'r' ? { fill: '#fff' } : null;
    return html`<g style=${{ opacity: dim ? .35 : 1, transition: 'opacity .4s' }}>
      ${hot && html`<circle cx=${x} cy=${y} r=${R + 5} fill="none" stroke="var(--fig-k)" strokeWidth="3.5" />`}
      <circle cx=${x} cy=${y} r=${R} fill=${FILL[kind || 'y']} stroke="var(--graphite)" strokeWidth="1.5" />
      <line x1=${x - R + 3} y1=${y + 1} x2=${x + R - 3} y2=${y + 1} stroke=${wt ? '#fff' : 'var(--graphite)'} strokeWidth="1" />
      <text x=${x} y=${y - 5} textAnchor="middle" fontSize="16" style=${wt}>${top}</text>
      <text x=${x} y=${y + 17} textAnchor="middle" fontSize="16" style=${wt ? Object.assign({ fontWeight: 600 }, wt) : { fontWeight: 600 }}>${bot}</text></g>`;
  }
  const Edge = ({ a, b, hot }) => html`<line x1=${a.x} y1=${a.y} x2=${b.x} y2=${b.y} stroke=${hot ? 'var(--pen)' : 'var(--ink)'} strokeWidth=${hot ? 3.5 : 1.6} />`;

  // the OS-tree of slide 3 (and K of slide 7)
  const OSP = { M: [190, 36], C: [95, 100], P: [298, 100], A: [40, 166], F: [150, 166], N: [258, 166], Q: [336, 166], D: [112, 232], H: [188, 232], K: [230, 294] };
  const OSKIDS = { M: ['C', 'P'], C: ['A', 'F'], P: ['N', 'Q'], F: ['D', 'H'], A: [], N: [], Q: [], D: [], H: [] };
  function osTree(withK) {
    const kids = JSON.parse(JSON.stringify(OSKIDS)); if (withK) { kids.H = [null, 'K']; kids.K = []; }
    const size = {}; const sz = k => k == null || !kids[k] ? 0 : (size[k] = sz(kids[k][0]) + sz(kids[k][1]) + 1);
    sz('M'); const par = {}; for (const k in kids) for (const c of kids[k]) if (c) par[c] = k;
    const order = []; (function io(k) { if (!k || !kids[k]) return; io(kids[k][0]); order.push(k); io(kids[k][1]); })('M');
    return { kids, size, par, order };
  }
  const OS = osTree(false), OSK = osTree(true);
  const N_ = k => ({ x: OSP[k][0], y: OSP[k][1] });
  function OsSvg({ T, val, hot, path, extra, h = 262 }) {
    const keys = Object.keys(T.kids), edges = [];
    keys.forEach(k => T.kids[k].forEach(c => c && edges.push([k, c])));
    return html`<svg viewBox=${`0 0 360 ${h}`} role="img" aria-label="Order-statistics tree">
      ${edges.map(([a, b]) => html`<${Edge} key=${a + b} a=${N_(a)} b=${N_(b)} hot=${path && path.includes(a) && path.includes(b)} />`)}
      ${keys.map(k => html`<${Node} key=${k} ...${N_(k)} top=${k} bot=${val(k)} kind=${k === 'K' ? 'n' : 'y'} hot=${hot && hot.includes(k)} />`)}
      ${extra}</svg>`;
  }

  // slides 2-3: subtree sizes, bottom up
  function OsTree() {
    const seq = [['A', 'D', 'H', 'N', 'Q'], ['F', 'P'], ['C'], ['M']];
    const steps = [
      { en: 'An <b>OS-tree</b>: a red-black tree for the set S that keeps subtree sizes. Notation for nodes: <b>key</b> on top, <b>size</b> below. Keys in order: A C D F H M N P Q.' },
      { en: 'With a sentinel for NIL, size[NIL] = 0, so every leaf has size[x] = 0 + 0 + 1 = <b>1</b>: A, D, H, N, Q.' },
      { en: 'size[F] = size[D] + size[H] + 1 = 1 + 1 + 1 = <b>3</b>, and size[P] = size[N] + size[Q] + 1 = 1 + 1 + 1 = <b>3</b>.' },
      { en: 'size[C] = size[A] + size[F] + 1 = 1 + 3 + 1 = <b>5</b>.' },
      { en: 'size[M] = size[C] + size[P] + 1 = 5 + 3 + 1 = <b>9</b>: the whole tree. In general size[x] = size[left[x]] + size[right[x]] + 1.' }
    ];
    const [i, ctl] = useSteps(steps.length, 2200);
    const done = new Set(seq.slice(0, i).flat());
    return html`<figure className="fig"><div className="fig-stage">
      <${OsSvg} T=${OS} val=${k => done.has(k) ? OS.size[k] : '?'} hot=${i > 0 ? seq[i - 1] : null} />
    </div><${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  // slides 4-5: OS-SELECT(x, i)
  const SELLAB = { M: [222, 40, 'start'], C: [64, 104, 'end'], P: [298, 64, 'middle'], A: [40, 210, 'middle'], F: [178, 170, 'start'], N: [258, 210, 'middle'], Q: [336, 210, 'middle'], D: [112, 276, 'middle'], H: [216, 236, 'start'] };
  function selTrace(i0) {
    const F = []; let x = 'M', i = i0;
    while (x) {
      const L = OS.kids[x][0], k = (L ? OS.size[L] : 0) + 1;
      if (i === k) { F.push({ x, i, k, en: `At ${x}: k = size[left[${x}]] + 1 = ${k - 1} + 1 = ${k} = i, so <b>return ${x}</b>, the ${i0}${['th', 'st', 'nd', 'rd'][i0 % 10 > 3 || [11, 12, 13].includes(i0) ? 0 : i0 % 10]} smallest key. Running time = O(h) = O(lg n) for red-black trees.` }); break; }
      if (i < k) { F.push({ x, i, k, en: `At ${x}: k = size[left[${x}]] + 1 = ${k - 1} + 1 = ${k}. i = ${i} < k, so OS-SELECT(left[${x}], ${i}): go left to ${L}.` }); x = L; }
      else { const R = OS.kids[x][1]; F.push({ x, i, k, en: `At ${x}: k = size[left[${x}]] + 1 = ${k - 1} + 1 = ${k}. i = ${i} > k, so OS-SELECT(right[${x}], i − k) = OS-SELECT(${R}, ${i} − ${k} = ${i - k}): go right.` }); i -= k; x = R; }
    }
    return F;
  }
  function SelRun({ i0 }) {
    const F = useMemo(() => selTrace(i0), [i0]);
    const steps = [{ en: `OS-SELECT(root, ${i0}): find the ${i0}-th smallest element. At each node x, k = size[left[x]] + 1 is the rank of x inside its own subtree.` }, ...F];
    const [s, ctl] = useSteps(steps.length, 2000);
    const seen = F.slice(0, s), path = seen.map(f => f.x);
    return html`<div className="fig-stage" style=${{ paddingTop: 0 }}>
      <${OsSvg} T=${OS} val=${k => OS.size[k]} hot=${s > 0 ? [F[s - 1].x] : null} path=${path} h=${290}
        extra=${seen.map(f => { const [x, y, a] = SELLAB[f.x]; return html`<text key=${f.x} x=${x} y=${y} textAnchor=${a} fontSize="16" style=${{ fill: 'var(--pen)', fontWeight: 700 }}>i=${f.i} k=${f.k}</text>`; })} />
    </div><${Cap} en=${steps[s].en} /><${Bar} steps=${steps} i=${s} ctl=${ctl} />`;
  }
  function Select() {
    const [i0, setI] = useState(5);
    return html`<figure className="fig"><div className="fig-stage" style=${{ paddingBottom: 0 }}><div className="a12-pick"><span className="a12-lbl">i =</span>
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(v => html`<button key=${v} className=${'fig-btn' + (v === i0 ? ' a12-sel' : '')} onClick=${() => setI(v)} aria-label=${'Select the ' + v + '-th smallest'}>${v}${v === 5 ? ' (slide)' : ''}</button>`)}</div></div>
      <${SelRun} key=${i0} i0=${i0} /></figure>`;
  }

  // OS-RANK(T, x), climbing from x to the root
  function rankTrace(x) {
    const T = OS, L = T.kids[x][0]; let r = (L ? T.size[L] : 0) + 1, y = x;
    const F = [{ y, r, en: `r ← size[left[${x}]] + 1 = ${r - 1} + 1 = ${r} (the rank of ${x} inside its own subtree), y ← ${x}.` }];
    while (y !== 'M') {
      const p = T.par[y];
      if (T.kids[p][1] === y) { const ls = T.kids[p][0] ? T.size[T.kids[p][0]] : 0; r += ls + 1; F.push({ y: p, r, en: `${y} is the <b>right</b> child of ${p}: everything in left[${p}] and ${p} itself come before it. r ← r + size[left[${p}]] + 1 = ${r - ls - 1} + ${ls} + 1 = ${r}. y ← ${p}.` }); }
      else F.push({ y: p, r, en: `${y} is the <b>left</b> child of ${p}: nothing on ${p}’s side comes before it, r stays ${r}. y ← ${p}.` });
      y = p;
    }
    F.push({ y, r, en: `y = T.root: <b>return r = ${r}</b>. ${x} is the ${r}-th key in order (A C D F H M N P Q). O(h) = O(lg n) steps up the tree.` });
    return F;
  }
  function RankRun({ x }) {
    const F = useMemo(() => rankTrace(x), [x]);
    const [s, ctl] = useSteps(F.length, 2000), f = F[s];
    const path = []; let y = x; path.push(y); while (y !== f.y) { y = OS.par[y]; path.push(y); }
    const p = N_(f.y);
    return html`<div className="fig-stage" style=${{ paddingTop: 0 }}>
      <${OsSvg} T=${OS} val=${k => OS.size[k]} hot=${[f.y]} path=${path} h=${270}
        extra=${html`<text x=${p.x + 30} y=${p.y - 22} fontSize="16" style=${{ fill: 'var(--pen)', fontWeight: 700 }}>y, r=${f.r}</text>`} />
    </div><${Cap} en=${f.en} /><${Bar} steps=${F} i=${s} ctl=${ctl} />`;
  }
  function Rank() {
    const [x, setX] = useState('H');
    return html`<figure className="fig"><div className="fig-stage" style=${{ paddingBottom: 0 }}><div className="a12-pick"><span className="a12-lbl">OS-RANK(T, x), x =</span>
      ${OS.order.map(k => html`<button key=${k} className=${'fig-btn' + (k === x ? ' a12-sel' : '')} onClick=${() => setX(k)}>${k}</button>`)}</div></div>
      <${RankRun} key=${x} x=${x} /></figure>`;
  }

  // slides 6-7: INSERT("K") fixes sizes on the way down; ranks would not be cheap
  function Insert() {
    const path = ['M', 'C', 'F', 'H'];
    const steps = [
      { en: 'INSERT(“K”): walk down from the root as in a binary search tree and add 1 to the size of every node on the way.' },
      { en: 'K < M: go left. size[M] ← 9 + 1 = <b>10</b>.' },
      { en: 'K > C: go right. size[C] ← 5 + 1 = <b>6</b>.' },
      { en: 'K > F: go right. size[F] ← 3 + 1 = <b>4</b>.' },
      { en: 'K > H: go right. size[H] ← 1 + 1 = <b>2</b>.' },
      { en: 'right[H] is NIL: K goes there with size[K] = 1. Only the O(lg n) nodes on the path changed.' },
      { en: '<b>Why not keep the ranks themselves?</b> They are hard to maintain: after K, every key larger than K moves up one rank (M 6→7, N 7→8, P 8→9, Q 9→10). Inserting a new minimum would change all n ranks, Θ(n).' },
      { en: 'RB-INSERT and RB-DELETE may also recolor (no effect on sizes) or rotate (fix-up in O(1), next figure), so they still run in O(lg n) time.' }
    ];
    const [i, ctl] = useSteps(steps.length, 2000);
    const upd = new Set(path.slice(0, Math.min(i, 4))), T = i >= 5 ? OSK : OS;
    const val = k => k === 'K' ? 1 : upd.has(k) ? OS.size[k] + 1 : OS.size[k];
    const RK = { M: '6→7', N: '7→8', P: '8→9', Q: '9→10' };
    const rk = i === 6 ? Object.keys(RK).map(k => { const p = N_(k); return html`<text key=${k} x=${p.x + (k === 'M' ? 56 : 0)} y=${p.y + (k === 'M' ? 6 : 44)} textAnchor="middle" fontSize="16" style=${{ fill: 'var(--pen)', fontWeight: 700 }}>${RK[k]}</text>`; }) : null;
    return html`<figure className="fig"><div className="fig-stage">
      <${OsSvg} T=${T} val=${val} hot=${i >= 1 && i <= 4 ? [path[i - 1]] : i === 5 ? ['K'] : null} path=${i >= 1 ? path.slice(0, Math.min(i, 4)).concat(i >= 5 ? ['K'] : []) : null} h=${324} extra=${rk} />
      ${i === 6 && html`<p className="a12-note">red: the rank before → after inserting K</p>`}
    </div><${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  // a right rotation; X is the top node before, Y its left child; a, b, c the subtrees
  function Rot({ steps, vals, labels }) {
    const [i, ctl] = useSteps(steps.length, 2400);
    const after = i >= 1;
    const P = after ? { Y: [180, 48], X: [262, 122], a: [110, 128], b: [214, 200], c: [314, 200] } : { X: [180, 48], Y: [98, 122], a: [48, 200], b: [150, 200], c: [262, 128] };
    const v = vals(i);
    const Tri = (k) => html`<g className="a12-g" style=${{ transform: `translate(${P[k][0]}px, ${P[k][1]}px)` }}>
      <path d="M0 -18 L-24 22 L24 22 Z" fill="color-mix(in srgb, var(--ok) 18%, var(--paper))" stroke="var(--graphite)" strokeWidth="1.5" />
      <text x="0" y="16" textAnchor="middle" fontSize="16" style=${{ fontWeight: 600 }}>${v[k]}</text></g>`;
    const Nd = (k) => html`<g className="a12-g" style=${{ transform: `translate(${P[k][0]}px, ${P[k][1]}px)` }}><${Node} x=${0} y=${0} top=${labels[k]} bot=${v[k]} hot=${i === 2 && v.hot && v.hot.includes(k)} R=${27} /></g>`;
    const L = (a, b) => html`<line x1=${P[a][0]} y1=${P[a][1]} x2=${P[b][0]} y2=${P[b][1] - 14} stroke="var(--ink)" strokeWidth="1.6" style=${{ transition: 'all .8s ease' }} />`;
    const top = after ? 'Y' : 'X';
    return html`<figure className="fig"><div className="fig-stage">
      <svg viewBox="0 0 360 236" role="img" aria-label="A rotation and the fix-up of the stored values">
        <line x1="180" y1="48" x2="226" y2="6" stroke="var(--ink)" strokeWidth="1.6" />
        ${after ? html`${L('Y', 'a')}${L('Y', 'X')}${L('X', 'b')}${L('X', 'c')}` : html`${L('X', 'Y')}${L('X', 'c')}${L('Y', 'a')}${L('Y', 'b')}`}
        ${Tri('a')}${Tri('b')}${Tri('c')}${Nd(after ? 'X' : 'Y')}${Nd(top)}
      </svg></div><${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }
  // slide 8
  const RotSize = () => html`<${Rot} labels=${{ X: 'E', Y: 'C' }}
    vals=${i => Object.assign(i < 2 ? { X: 16, Y: 11 } : { X: 8, Y: 16 }, { a: 7, b: 3, c: 4, hot: ['X', 'Y'] })}
    steps=${[
      { en: 'Before: E has size 16, its left child C has size 11 (subtrees of sizes 7 and 3), and E’s right subtree has size 4. Check: 11 + 4 + 1 = 16.' },
      { en: 'Rotate right at E: C moves up, E becomes C’s right child and takes C’s old right subtree (size 3). The sizes are now stale.' },
      { en: 'Fix up in O(1) from the children: size[E] = 3 + 4 + 1 = <b>8</b>, then size[C] = 7 + 8 + 1 = <b>16</b> (C takes E’s old size). Recolorings never change sizes.' }
    ]} />`;
  // slide 13
  const RotM = () => html`<${Rot} labels=${{ X: '11,15', Y: '6,20' }}
    vals=${i => Object.assign(i < 2 ? { X: 30, Y: 30 } : { X: 19, Y: 30 }, { a: 30, b: 14, c: 19, hot: ['X', 'Y'] })}
    steps=${[
      { en: 'Before: node [11,15] with m = 30; its left child [6,20] with m = 30 has subtrees with m = 30 and 14; the right subtree has m = 19.' },
      { en: 'Rotate right: [6,20] moves up, [11,15] becomes its right child and takes the subtree with m = 14.' },
      { en: 'Fix up in O(1): m[11,15] = max(15, 14, 19) = <b>19</b>, then m[6,20] = max(20, 30, 19) = <b>30</b>. INSERT fixes the m’s on the way down, so total INSERT time is O(lg n); DELETE is similar.' }
    ]} />`;

  // slide 10: a set of intervals and a query interval
  const IV = [[7, 10, 0], [5, 11, 1], [17, 19, 1], [4, 8, 2], [15, 18, 2], [22, 23, 0]];
  const ov = (a, b) => a[0] <= b[1] && b[0] <= a[1];
  function Intervals() {
    const [q, setQ] = useState([14, 16]);
    const X = v => 10 + v * 13, Y = r => 74 + r * 34;
    const hit = IV.filter(t => ov(t, q));
    const set = (k, v) => { const n = q.slice(); n[k] = v; if (n[0] > n[1]) n[1 - k] = v; setQ(n); };
    const en = `Each interval i has low[i] and high[i] (for i = [7, 10]: low[i] = 7, high[i] = 10). Two intervals i and i′ overlap when low[i] ≤ high[i′] and low[i′] ≤ high[i]. Query [${q[0]}, ${q[1]}]: ` +
      (hit.length ? `it overlaps ${hit.map(t => `[${t[0]}, ${t[1]}]`).join(', ')}.` : 'no interval of the set overlaps it.') + ' The goal: find <b>an</b> interval of the set that overlaps the query.';
    return html`<figure className="fig"><div className="fig-stage"><div className="a12-w">
      <svg viewBox="0 0 340 186" role="img" aria-label="Intervals on a line and a query interval">
        <line x1=${X(q[0])} y1="30" x2=${X(q[1])} y2="30" stroke="var(--pen)" strokeWidth="4" /><circle cx=${X(q[0])} cy="30" r="5" fill="var(--pen)" /><circle cx=${X(q[1])} cy="30" r="5" fill="var(--pen)" />
        <text x=${X(q[0]) - 8} y="36" textAnchor="end" fontSize="16" style=${{ fill: 'var(--pen)' }}>${q[0]}</text><text x=${X(q[1]) + 8} y="36" fontSize="16" style=${{ fill: 'var(--pen)' }}>${q[1]}</text>
        <rect x=${X(q[0])} y="44" width=${Math.max(1, X(q[1]) - X(q[0]))} height="132" fill="color-mix(in srgb, var(--pen) 10%, transparent)" />
        ${IV.map((t, k) => { const on = ov(t, q); return html`<g key=${k}>
          <line x1=${X(t[0])} y1=${Y(t[2])} x2=${X(t[1])} y2=${Y(t[2])} stroke=${on ? 'var(--fig-k)' : 'var(--ink)'} strokeWidth=${on ? 4 : 2.5} />
          <circle cx=${X(t[0])} cy=${Y(t[2])} r="4" fill=${on ? 'var(--fig-k)' : 'var(--ink)'} /><circle cx=${X(t[1])} cy=${Y(t[2])} r="4" fill=${on ? 'var(--fig-k)' : 'var(--ink)'} />
          <text x=${X(t[0]) - 7} y=${Y(t[2]) + 6} textAnchor="end" fontSize="16" style=${on ? { fill: 'var(--fig-k)', fontWeight: 700 } : null}>${t[0]}</text>
          <text x=${X(t[1]) + 7} y=${Y(t[2]) + 6} fontSize="16" style=${on ? { fill: 'var(--fig-k)', fontWeight: 700 } : null}>${t[1]}</text></g>`; })}
      </svg>
      <div className="a12-ctl"><span>low = <b>${q[0]}</b></span><input type="range" min="1" max="24" value=${q[0]} onInput=${e => set(0, +e.target.value)} aria-label="Low endpoint of the query" /></div>
      <div className="a12-ctl"><span>high = <b>${q[1]}</b></span><input type="range" min="1" max="24" value=${q[1]} onInput=${e => set(1, +e.target.value)} aria-label="High endpoint of the query" /></div>
      <div className="a12-pick">${[[14, 16], [12, 14], [7, 10]].map(p => html`<button key=${p} className=${'fig-btn' + (p[0] === q[0] && p[1] === q[1] ? ' a12-sel' : '')} onClick=${() => setQ(p)}>[${p[0]}, ${p[1]}]</button>`)}</div>
    </div></div><${Cap} en=${en} /></figure>`;
  }

  // slides 11-12: the interval tree, keyed on the low endpoint, with m[x]
  const IT = {
    a: { iv: [17, 19], c: 'b', x: 190, y: 36, L: 'b', R: 'c' }, b: { iv: [5, 11], c: 'r', x: 104, y: 104, L: 'd', R: 'e' },
    c: { iv: [22, 23], c: 'b', x: 296, y: 104 }, d: { iv: [4, 8], c: 'b', x: 44, y: 174 }, e: { iv: [15, 18], c: 'b', x: 166, y: 174, L: 'f' },
    f: { iv: [7, 10], c: 'r', x: 124, y: 244 }
  };
  const M = {}; (function m(k) { if (!k) return -Infinity; const n = IT[k]; return (M[k] = Math.max(n.iv[1], m(n.L), m(n.R))); })('a');
  function ITreeSvg({ val, hot, path, extra, h = 280 }) {
    const keys = Object.keys(IT), edges = [];
    keys.forEach(k => ['L', 'R'].forEach(s => IT[k][s] && edges.push([k, IT[k][s]])));
    return html`<svg viewBox=${`0 0 360 ${h}`} role="img" aria-label="Interval tree">
      ${edges.map(([a, b]) => html`<${Edge} key=${a + b} a=${IT[a]} b=${IT[b]} hot=${path && path.includes(a) && path.includes(b)} />`)}
      ${extra && extra.under}
      ${keys.map(k => html`<${Node} key=${k} x=${IT[k].x} y=${IT[k].y} top=${IT[k].iv.join(',')} bot=${val(k)} kind=${IT[k].c} hot=${hot && hot.includes(k)} R=${27} />`)}
      ${extra && extra.over}</svg>`;
  }
  function ITree() {
    const seq = ['d', 'f', 'e', 'b', 'c', 'a'];
    const ex = k => { const n = IT[k], parts = [n.iv[1]]; if (n.L) parts.push(M[n.L]); if (n.R) parts.push(M[n.R]); return parts; };
    const nm = k => '[' + IT[k].iv.join(', ') + ']';
    const steps = [{ en: '1. Underlying structure: a red-black tree keyed on the <b>low</b> (left) endpoint: 4 &lt; 5 &lt; 7 &lt; 15 &lt; 17 &lt; 22 in order. 2. Extra information: each node x stores its interval int[x] and <b>m[x]</b>, the largest value in its subtree: m[x] = max(high[int[x]], m[left[x]], m[right[x]]).' }]
      .concat(seq.map(k => ({ en: `m${nm(k)} = max(${ex(k).join(', ')}) = <b>${M[k]}</b>` + (ex(k).length === 1 ? ' (no children: just its own high endpoint).' : '.') })));
    const [i, ctl] = useSteps(steps.length, 1900);
    const done = new Set(seq.slice(0, i));
    return html`<figure className="fig"><div className="fig-stage">
      <${ITreeSvg} val=${k => done.has(k) ? M[k] : '?'} hot=${i > 0 ? [seq[i - 1]] : null} />
      <p className="a12-note">black and red nodes as on the slide: a red-black tree</p>
    </div><${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  // slides 14-21: INTERVAL-SEARCH(i)
  function isTrace(q) {
    const F = []; let x = 'a', from = null;
    const nm = k => '[' + IT[k].iv.join(',') + ']', Q = `[${q[0]},${q[1]}]`;
    F.push({ x: null, en: `INTERVAL-SEARCH(${Q}): start with x ← root and walk down one path. In the loop, i and int[x] don’t overlap when low[i] &gt; high[int[x]] or low[int[x]] &gt; high[i].` });
    while (x) {
      const n = IT[x];
      if (ov(n.iv, q)) { F.push({ x, en: `${Q} and ${nm(x)} overlap: <b>return ${nm(x)}</b>.` }); return F; }
      const L = n.L;
      if (L && q[0] <= M[L]) { F.push({ x, go: 'L', en: `${Q} and ${nm(x)} don’t overlap. left[x] ≠ NIL and ${q[0]} ≤ m[left[x]] = ${M[L]} ⇒ x ← left[x].` }); from = x; x = L; }
      else { F.push({ x, go: 'R', en: `${Q} and ${nm(x)} don’t overlap. ` + (L ? `${q[0]} &gt; m[left[x]] = ${M[L]} ⇒ x ← right[x].` : `left[x] = NIL ⇒ x ← right[x].`) }); from = x; x = n.R || null; if (!x) F.push({ x: null, nil: from, en: `x = NIL ⇒ no interval that overlaps ${Q} exists. Time = O(h) = O(lg n): constant work per level on one path down.` }); }
    }
    return F;
  }
  function ISearchRun({ q }) {
    const F = useMemo(() => isTrace(q), [q]);
    const [s, ctl] = useSteps(F.length, 2100), f = F[s];
    const path = F.slice(1, s + 1).map(g => g.x).filter(Boolean);
    const nilAt = f.nil ? { x: IT[f.nil].x + 44, y: IT[f.nil].y + 66 } : null;
    const xp = f.x ? IT[f.x] : nilAt;
    const over = html`${xp && html`<text x=${xp.x - 34} y=${xp.y - 22} textAnchor="end" fontSize="18" style=${{ fill: 'var(--pen)', fontWeight: 700, fontStyle: 'italic' }}>x</text>`}`;
    const under = nilAt && html`<g><line x1=${IT[f.nil].x} y1=${IT[f.nil].y} x2=${nilAt.x} y2=${nilAt.y} stroke="var(--pen)" strokeWidth="3" strokeDasharray="5 4" /><rect x=${nilAt.x - 20} y=${nilAt.y - 12} width="40" height="24" rx="4" fill="var(--paper)" stroke="var(--pen)" /><text x=${nilAt.x} y=${nilAt.y + 6} textAnchor="middle" fontSize="15" style=${{ fill: 'var(--pen)' }}>NIL</text></g>`;
    return html`<div className="fig-stage" style=${{ paddingTop: 0 }}>
      <${ITreeSvg} val=${k => M[k]} hot=${f.x ? [f.x] : null} path=${path} extra=${{ over, under }} h=${330} />
    </div><${Cap} en=${f.en} /><${Bar} steps=${F} i=${s} ctl=${ctl} />`;
  }
  function ISearch() {
    const P = [[14, 16], [12, 14]];
    const [q, setQ] = useState(P[0]), [lo, setLo] = useState('14'), [hi, setHi] = useState('16'), [err, setErr] = useState('');
    const go = () => { const a = +lo, b = +hi; if (!/^\d+$/.test(lo) || !/^\d+$/.test(hi) || a > 30 || b > 30) { setErr('Use whole numbers from 0 to 30.'); return; } if (a > b) { setErr('low must be ≤ high.'); return; } setErr(''); setQ([a, b]); };
    return html`<figure className="fig"><div className="fig-stage" style=${{ paddingBottom: 0 }}>
      <div className="a12-pick">${P.map((p, k) => html`<button key=${k} className=${'fig-btn' + (p[0] === q[0] && p[1] === q[1] ? ' a12-sel' : '')} onClick=${() => { setQ(p); setLo(String(p[0])); setHi(String(p[1])); setErr(''); }}>Example ${k + 1}: [${p[0]},${p[1]}]</button>`)}</div>
      <div className="a12-pick"><span className="a12-lbl">your own: [</span><input className="a12-in" aria-label="Query low endpoint" value=${lo} onInput=${e => setLo(e.target.value)} /><span className="a12-lbl">,</span><input className="a12-in" aria-label="Query high endpoint" value=${hi} onInput=${e => setHi(e.target.value)} /><span className="a12-lbl">]</span><button className="fig-btn solid" onClick=${go}>Search</button></div>
      ${err && html`<p className="a12-err" role="alert">${err}</p>`}
    </div><${ISearchRun} key=${q.join(',')} q=${q} /></figure>`;
  }

  // slides 23-25: why it is safe to take only one child
  function Proof() {
    const steps = [
      { en: '<b>Theorem.</b> Let L be the intervals in the left subtree of x and R those in the right subtree. If the search goes right, then {i′ ∈ L : i′ overlaps i} = ∅. If it goes left, then {i′ ∈ L : i′ overlaps i} = ∅ ⇒ {i′ ∈ R : i′ overlaps i} = ∅. So one child is always enough.' },
      { en: '<b>Search goes right.</b> If left[x] = NIL we are done, since L = ∅. Otherwise the code went right because low[i] &gt; m[left[x]].' },
      { en: 'm[left[x]] is the high endpoint of some interval j ∈ L, and no interval in L has a larger high endpoint than high[j]. So every interval of L ends before i starts: {i′ ∈ L : i′ overlaps i} = ∅.' },
      { en: '<b>Search goes left</b>, and assume nothing in L overlaps i. The code went left because low[i] ≤ m[left[x]] = high[j] for some j ∈ L. Since j does not overlap i, it must lie to the right: high[i] &lt; low[j].' },
      { en: 'The binary-search-tree property (keyed on low endpoints) gives low[j] ≤ low[i′] for every i′ ∈ R. So every i′ starts after i ends: {i′ ∈ R : i′ overlaps i} = ∅. ∎' }
    ];
    const [i, ctl] = useSteps(steps.length, 3000);
    const seg = (x1, x2, y, lab, col, on, k) => html`<g key=${k} className=${pop(on)}><line x1=${x1} y1=${y} x2=${x2} y2=${y} stroke=${col} strokeWidth="3" /><circle cx=${x1} cy=${y} r="4" fill=${col} /><circle cx=${x2} cy=${y} r="4" fill=${col} />
      <text x=${(x1 + x2) / 2} y=${y - 10} textAnchor="middle" fontSize="17" fontStyle="italic" style=${{ fill: col }}>${lab}</text></g>`;
    const right = i >= 1 && i <= 2, left = i >= 3;
    return html`<figure className="fig"><div className="fig-stage">
      <svg viewBox="0 0 320 150" role="img" aria-label="The two cases of the correctness proof">
        ${i === 0 && html`<g>
          <line x1="160" y1="40" x2="90" y2="100" stroke="var(--ink)" strokeWidth="1.6" /><line x1="160" y1="40" x2="230" y2="100" stroke="var(--ink)" strokeWidth="1.6" />
          <path d="M90 84 L54 140 L126 140 Z" fill="color-mix(in srgb, var(--k-compiler) 20%, var(--paper))" stroke="var(--graphite)" /><text x="90" y="132" textAnchor="middle" fontSize="18" fontStyle="italic">L</text>
          <path d="M230 84 L194 140 L266 140 Z" fill="color-mix(in srgb, var(--ok) 20%, var(--paper))" stroke="var(--graphite)" /><text x="230" y="132" textAnchor="middle" fontSize="18" fontStyle="italic">R</text>
          <${Node} x=${160} y=${40} top="x" bot="" kind="y" R=${24} /></g>`}
        ${right && html`<g>
          <text x="22" y="56" fontSize="18">…</text>
          ${seg(48, 140, 50, 'j', 'var(--k-compiler)', i >= 2, 'j')}
          ${seg(190, 296, 50, 'i', 'var(--pen)', true, 'i')}
          <text x="140" y="96" textAnchor="middle" fontSize="16" className=${pop(i >= 2)}>high[j] = m[left[x]]</text>
          <text x="236" y="96" textAnchor="middle" fontSize="16">low(i)</text>
          <text x="160" y="134" textAnchor="middle" fontSize="16" className=${pop(i >= 2)}>high[j] ${'<'} low(i): no overlap in L</text></g>`}
        ${left && html`<g>
          ${seg(24, 124, 50, 'i', 'var(--pen)', true, 'i')}
          ${seg(160, 300, 50, 'j', 'var(--k-compiler)', true, 'j')}
          ${seg(176, 280, 96, 'i′', 'var(--ok)', i >= 4, 'ip')}<text x="292" y="102" fontSize="18" className=${pop(i >= 4)}>…</text>
          <text x="140" y="134" textAnchor="middle" fontSize="16">high[i] ${'<'} low[j]${i >= 4 ? ' ≤ low[i′]' : ''}</text></g>`}
      </svg></div><${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  window.FIGS = Object.assign(window.FIGS || {}, {
    'ag-12-os-tree': OsTree, 'ag-12-insert': Insert, 'ag-12-rotate-size': RotSize, 'ag-12-select': Select, 'ag-12-rank': Rank,
    'ag-12-intervals': Intervals, 'ag-12-itree': ITree, 'ag-12-rotate-m': RotM, 'ag-12-isearch': ISearch, 'ag-12-proof': Proof
  });
})();
/* ── part L16 ── */
// Algorithms visuals, Lecture 16 (Greedy algorithms and graphs: representations, MST, Prim): adjacency matrix and lists (slides 3-7),
// the MST example (10-11), optimal substructure (12-19), the cut theorem proof (21-25), Prim's algorithm on the slide graph (26-39)
// and the analysis of Prim (40-50). Every label and number comes from the slides.
(function () {
  const { useState, useEffect, useRef, useMemo } = React;
  const { html, useSteps, Cap, Bar, pop, calm, useClock, useFit, sec } = window.FIGKIT;
  const CSS = `
.a16-row{ display:flex; flex-wrap:wrap; gap:6px; justify-content:center; align-items:center; margin:0 0 10px; }
.a16-row .fig-btn.sel{ border-color:var(--fig-k); box-shadow:inset 0 0 0 1px var(--fig-k); }
.a16-lab{ font-size:.82rem; color:var(--graphite); width:100%; text-align:center; }
.a16-leg{ display:flex; flex-wrap:wrap; gap:4px 14px; justify-content:center; font-size:.82rem; color:var(--graphite); margin:6px 0 0; }
.a16-leg i{ display:inline-block; width:12px; height:12px; border-radius:50%; vertical-align:-2px; margin-right:5px; border:1.5px solid var(--ink); }
.a16-leg i.q{ background:#c23b3b; } .a16-leg i.a{ background:color-mix(in srgb, var(--fig-k) 30%, var(--paper)); }
.a16-leg s{ display:inline-block; width:18px; height:0; border-top:4px solid var(--fig-k); vertical-align:3px; margin-right:5px; }
.a16-leg s.d{ border-top:2px dashed var(--fig-k); }
.a16-keys{ display:grid; grid-template-columns:auto repeat(8, 1fr); gap:2px; max-width:420px; margin:10px auto 0; font-size:.86rem; text-align:center; }
.a16-keys > div{ padding:3px 0; border-radius:4px; background:var(--paper); border:1px solid var(--line); min-width:0; transition:background .4s; }
.a16-keys > div.h{ background:transparent; border-color:transparent; color:var(--graphite); font-size:.8rem; text-align:right; padding-right:4px; }
.a16-keys > div.v{ font-weight:700; font-style:italic; }
.a16-keys > div.out{ color:var(--graphite); background:color-mix(in srgb, var(--fig-k) 14%, var(--paper)); }
.a16-keys > div.chg{ background:color-mix(in srgb, var(--fig-k) 38%, var(--paper)); font-weight:700; }
.a16-keys > div.cur{ outline:2px solid var(--fig-k); outline-offset:-2px; font-weight:700; }
.a16-ws{ display:grid; grid-template-columns:repeat(auto-fill, minmax(84px, 1fr)); gap:6px; max-width:440px; margin:0 auto 8px; }
.a16-ws label{ display:flex; align-items:center; gap:4px; font-size:.86rem; justify-content:center; }
.a16-ws input{ width:3.2em; font:inherit; font-size:.9rem; padding:3px 4px; border:1px solid var(--line); border-radius:6px; background:var(--paper); color:var(--ink); }
.a16-ws input.bad{ border-color:#d23c3c; outline:1px solid #d23c3c; }
.a16-err{ color:#d23c3c; font-size:.86rem; text-align:center; margin:0 0 6px; }
.a16-adj{ display:flex; flex-wrap:wrap; gap:12px 18px; justify-content:center; align-items:flex-start; }
.a16-adj svg{ max-width:200px !important; margin:0 !important; }
.a16-mx{ border-collapse:collapse; font-size:1rem; }
.a16-mx td, .a16-mx th{ width:30px; height:28px; text-align:center; padding:0; }
.a16-mx th{ color:var(--graphite); font-weight:600; }
.a16-mx tr > th:first-child{ border-right:2px solid var(--ink); }
.a16-mx thead th{ border-bottom:2px solid var(--ink); }
.a16-mx td{ transition:opacity .4s, background .4s; }
.a16-mx td.off{ opacity:0; } .a16-mx td.one{ font-weight:700; color:var(--fig-k); }
.a16-mx tr.on td{ background:color-mix(in srgb, var(--fig-k) 16%, var(--paper)); }
.a16-lists{ font-size:.95rem; display:grid; gap:6px; }
.a16-lists .r{ display:flex; align-items:center; gap:6px; }
.a16-lists .r > b{ min-width:4.4em; font-weight:600; }
.a16-lists .c{ display:inline-block; min-width:24px; padding:2px 6px; border:1.5px solid var(--ink); border-radius:4px; text-align:center; background:var(--paper); }
.a16-lists .n{ color:var(--graphite); font-size:.85rem; }
.a16-lists .dg{ margin-left:auto; padding-left:8px; color:var(--fig-k); font-weight:700; font-size:.88rem; }
.a16-sum{ text-align:center; margin:10px 0 0; font-size:.95rem; }
.a16-code{ font-family:var(--mono); font-size:.8rem; line-height:1.45; background:var(--paper); border:1px solid var(--line); border-radius:8px; padding:8px 10px; max-width:470px; margin:0 auto; }
.a16-code .l{ display:flex; flex-wrap:wrap; align-items:baseline; gap:2px 8px; padding:1px 4px; border-radius:4px; transition:background .4s; }
.a16-code .l.on{ background:color-mix(in srgb, var(--fig-k) 20%, var(--paper)); }
.a16-code .t{ padding-left:1.2em; text-indent:-1.2em; }
.a16-code .tag{ font-family:var(--body); font-size:.78rem; font-weight:700; color:#fff; background:var(--fig-s); border-radius:99px; padding:0 8px; white-space:nowrap; }
.a16-formula{ text-align:center; margin:10px 0 0; font-size:.98rem; line-height:1.5; }
.a16-tbl{ width:100%; max-width:470px; margin:10px auto 0; border-collapse:collapse; font-size:.84rem; }
.a16-tbl th, .a16-tbl td{ border:1px solid var(--line); padding:4px 4px; text-align:center; }
.a16-tbl th{ background:var(--paper); color:var(--graphite); font-weight:600; }
.a16-tbl td.tot{ font-weight:700; color:var(--fig-k); }
.a16-tbl tr.off td{ opacity:0; }
.a16-calc{ margin:12px auto 0; max-width:470px; border-top:1px dashed var(--line); padding-top:10px; font-size:.88rem; }
.a16-calc label{ display:grid; grid-template-columns:4.6em 1fr 3.6em; gap:6px; align-items:center; margin:0 0 6px; }
.a16-calc input[type=range]{ width:100%; min-width:0; accent-color:var(--fig-k); }
.a16-bars{ display:grid; gap:5px; margin-top:6px; }
.a16-bars .r{ display:grid; grid-template-columns:7.4em 1fr; gap:6px; align-items:center; }
.a16-bars .bar{ height:16px; border-radius:4px; background:var(--fig-k); opacity:.45; min-width:2px; transition:width .3s; }
.a16-bars .r.min .bar{ opacity:1; }
.a16-bars .r span{ font-size:.82rem; }
.a16-bars .val{ grid-column:2; font-size:.8rem; color:var(--graphite); margin-top:-3px; }
`;
  if (!document.getElementById('a16-css')) { const s = document.createElement('style'); s.id = 'a16-css'; s.textContent = CSS; document.head.appendChild(s); }

  const RED = '#c23b3b';
  const LIGHT = 'color-mix(in srgb, var(--fig-k) 30%, var(--paper))';
  const INF = Infinity, kstr = k => (k === INF ? '∞' : String(k));
  // a line between two circles of radius r, shortened at both ends, with an optional arrowhead at the end
  function seg(a, b, r1, r2) { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L; return [a[0] + ux * r1, a[1] + uy * r1, b[0] - ux * r2, b[1] - uy * r2, ux, uy]; }
  function arrowHead(x, y, ux, uy, s, fill) { const px = -uy, py = ux; return html`<path d=${`M${x},${y} L${x - ux * s + px * s * .55},${y - uy * s + py * s * .55} L${x - ux * s - px * s * .55},${y - uy * s - py * s * .55} Z`} fill=${fill} />`; }

  // ── the slide graph (slides 10, 27-39); the slides do not name the vertices, the letters are added here so the steps can name them
  const NODES = { a: [139, 34], b: [40, 102], c: [236, 102], d: [331, 102], e: [40, 182], f: [236, 182], g: [331, 182], h: [139, 254] };
  const NAMEPOS = { a: [164, 30], b: [40, 72], c: [236, 72], d: [331, 72], e: [40, 218], f: [258, 214], g: [331, 218], h: [168, 270] };
  // [u, v, w, labelX, labelY]
  const SLIDE_E = [['a', 'b', 6, 78, 58], ['a', 'c', 12, 200, 58], ['b', 'c', 5, 138, 94], ['c', 'd', 9, 283, 94], ['b', 'e', 14, 22, 147],
    ['b', 'h', 8, 104, 168], ['c', 'f', 7, 222, 147], ['f', 'g', 15, 283, 174], ['e', 'h', 3, 78, 232], ['f', 'h', 10, 200, 232]];
  const VS = Object.keys(NODES);
  const eid = (u, v) => [u, v].sort().join('');

  function GraphSvg({ weights, nodeFill, nodeText, nodeTextFill, nodeRing, showNames, edgeKind, arrows, label }) {
    const R = 19;
    return html`<svg viewBox="0 0 360 290" role="img" aria-label=${label}>
      ${SLIDE_E.map(([u, v, , lx, ly], k) => {
        const kind = edgeKind ? edgeKind(u, v) : 'plain', [x1, y1, x2, y2, ux, uy] = seg(NODES[u], NODES[v], 0, 0);
        const st = kind === 'tree' ? { stroke: 'var(--fig-k)', strokeWidth: 7, opacity: .75 } : kind === 'cand' ? { stroke: 'var(--fig-k)', strokeWidth: 3, strokeDasharray: '7 5' } : kind === 'cut' ? { stroke: '#d23c3c', strokeWidth: 5 } : kind === 'dim' ? { stroke: 'var(--line)', strokeWidth: 2 } : { stroke: 'var(--graphite)', strokeWidth: 2 };
        return html`<line key=${'e' + k} x1=${x1} y1=${y1} x2=${x2} y2=${y2} ...${st} strokeLinecap="round" style=${{ transition: 'all .4s' }} />`;
      })}
      ${arrows && arrows.map(([v, p, dashed], k) => { const [x1, y1, x2, y2, ux, uy] = seg(NODES[v], NODES[p], R + 2, R + 3); return html`<g key=${'a' + k}>${arrowHead(x2, y2, ux, uy, 11, 'var(--fig-k)')}</g>`; })}
      ${SLIDE_E.map(([u, v, , lx, ly], k) => html`<text key=${'w' + k} x=${lx} y=${ly} textAnchor="middle" dominantBaseline="middle" fontSize="17" fontWeight="600" style=${{ fill: 'var(--fig-k)' }}>${weights[eid(u, v)]}</text>`)}
      ${VS.map(v => { const [x, y] = NODES[v]; return html`<g key=${v}>
        <circle cx=${x} cy=${y} r=${R} fill=${nodeFill ? nodeFill(v) : LIGHT} stroke="var(--ink)" strokeWidth=${nodeRing && nodeRing(v) ? 4 : 1.5} style=${{ transition: 'fill .4s' }} />
        <text x=${x} y=${y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="17" fontWeight="700" style=${{ fill: nodeTextFill ? nodeTextFill(v) : 'var(--ink)' }}>${nodeText ? nodeText(v) : v}</text>
        ${showNames && html`<text x=${NAMEPOS[v][0]} y=${NAMEPOS[v][1]} textAnchor="middle" dominantBaseline="middle" fontSize="16" fontStyle="italic" style=${{ fill: 'var(--graphite)' }}>${v}</text>`}</g>`; })}
    </svg>`;
  }
  const slideW = () => Object.fromEntries(SLIDE_E.map(([u, v, w]) => [eid(u, v), w]));

  /* ── slides 3-7: adjacency matrix and adjacency lists of the 4-vertex digraph ── */
  function Adjacency() {
    const E = [[1, 2], [1, 3], [2, 3], [4, 3]], P = { 1: [150, 40], 2: [45, 40], 3: [45, 140], 4: [150, 140] };
    const steps = [
      { en: 'The slide\'s digraph G = (V, E) with V = {1, 2, 3, 4} and 4 edges: 1→2, 1→3, 2→3, 4→3. The adjacency matrix is A[1..n, 1..n] with A[i, j] = 1 if (i, j) ∈ E, else 0.' },
      { en: 'Row 1: vertex 1 has edges to 2 and 3, so A[1, 2] = A[1, 3] = 1 and the rest of the row is 0.' },
      { en: 'Row 2: the only edge out of 2 is 2→3, so A[2, 3] = 1.' },
      { en: 'Row 3: no edge leaves 3, so row 3 is all 0.' },
      { en: 'Row 4: the edge 4→3 gives A[4, 3] = 1.' },
      { en: 'The matrix has n<sup>2</sup> = 4<sup>2</sup> = 16 entries, however few edges there are (here only 4 ones): <b>Θ(V<sup>2</sup>) storage ⇒ dense representation</b>.' },
      { en: 'Adjacency lists: Adj[v] is the list of vertices adjacent to v. Adj[1] = {2, 3}, Adj[2] = {3}, Adj[3] = {}, Adj[4] = {3}.' },
      { en: 'For digraphs |Adj[v]| = out-degree(v): 2 + 1 + 0 + 1 = 4 = |E|. For undirected graphs |Adj[v]| = degree(v).' },
      { en: '<b>Handshaking Lemma</b>: Σ<sub>v∈V</sub> degree(v) = 2|E| for undirected graphs. Read the same 4 edges as undirected: degrees 2 + 2 + 3 + 1 = 8 = 2 · 4. So the lists hold Θ(V + E) entries: a <b>sparse</b> representation (for either type of graph). (The slide writes Σ<sub>v∈V</sub> = 2|E|, leaving out degree(v).)' }
    ];
    const [i, ctl] = useSteps(steps.length, 2300);
    const row = i >= 1 && i <= 4 ? i : 0, rowsShown = Math.min(i, 4), und = i === 8;
    const lists = { 1: [2, 3], 2: [3], 3: [], 4: [3] }, ulists = { 1: [2, 3], 2: [1, 3], 3: [1, 2, 4], 4: [3] };
    const L = und ? ulists : lists;
    return html`<figure className="fig"><div className="fig-stage"><div className="a16-adj">
      <svg viewBox="0 0 200 180" role="img" aria-label="Digraph with edges 1 to 2, 1 to 3, 2 to 3 and 4 to 3">
        ${E.map(([a, b], k) => { const [x1, y1, x2, y2, ux, uy] = seg(P[a], P[b], 20, 22), on = row === a || i === 7 && false;
          return html`<g key=${k}><line x1=${x1} y1=${y1} x2=${x2 - ux * 6} y2=${y2 - uy * 6} stroke=${on ? 'var(--fig-k)' : 'var(--ink)'} strokeWidth=${on ? 4 : 2} />${!und && arrowHead(x2, y2, ux, uy, 12, on ? 'var(--fig-k)' : 'var(--ink)')}</g>`; })}
        ${[1, 2, 3, 4].map(v => html`<g key=${v}><circle cx=${P[v][0]} cy=${P[v][1]} r="19" fill=${LIGHT} stroke=${row === v ? 'var(--fig-k)' : 'var(--ink)'} strokeWidth=${row === v ? 4 : 1.5} /><text x=${P[v][0]} y=${P[v][1] + 1} textAnchor="middle" dominantBaseline="middle" fontSize="19" fontWeight="700">${v}</text></g>`)}
        <text x="100" y="174" textAnchor="middle" fontSize="16" style=${{ fill: 'var(--graphite)' }}>${und ? 'read as undirected' : 'digraph'}</text>
      </svg>
      ${i < 6 ? html`<table className="a16-mx" aria-label="Adjacency matrix"><thead><tr><th>A</th>${[1, 2, 3, 4].map(j => html`<th key=${j}>${j}</th>`)}</tr></thead>
        <tbody>${[1, 2, 3, 4].map(r => html`<tr key=${r} className=${row === r ? 'on' : ''}><th>${r}</th>${[1, 2, 3, 4].map(c => { const one = E.some(([a, b]) => a === r && b === c); return html`<td key=${c} className=${(r > rowsShown ? 'off' : '') + (one ? ' one' : '')}>${one ? 1 : 0}</td>`; })}</tr>`)}</tbody></table>`
      : html`<div className="a16-lists" aria-label="Adjacency lists">${[1, 2, 3, 4].map(v => html`<div className="r" key=${v}><b>Adj[${v}]</b>${L[v].length ? L[v].map((x, k) => html`<span key=${k}>${k ? html`<span className="n">→ </span>` : ''}<span className="c">${x}</span></span>`) : html`<span className="n">empty</span>`}${i >= 7 && html`<span className="dg">${L[v].length}</span>`}</div>`)}
        ${i >= 7 && html`<div className="r"><span className="n">${und ? 'Σ degree(v) = 2 + 2 + 3 + 1 = 8 = 2|E|' : 'Σ out-degree(v) = 2 + 1 + 0 + 1 = 4 = |E|'}</span></div>`}</div>`}
    </div>
    ${i === 5 && html`<p className="a16-sum"><b>16</b> entries for <b>4</b> edges: Θ(V<sup>2</sup>) storage</p>`}
    </div><${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  /* ── slides 10-11: example of an MST ── */
  function MstExample() {
    const W = slideW(), MST = new Set(['ab', 'bc', 'cd', 'bh', 'cf', 'fg', 'eh']);
    const steps = [
      { en: 'Input: a connected, undirected graph G = (V, E) with a weight on every edge; all weights are distinct (6, 12, 5, 9, 14, 8, 7, 15, 3, 10).' },
      { en: 'Output: a spanning tree T, a tree that connects all 8 vertices, of minimum weight. The highlighted 7 = |V| − 1 edges form the MST: there is no cycle and every vertex is reached.' },
      { en: 'w(T) = Σ<sub>(u,v)∈T</sub> w(u, v) = 6 + 5 + 9 + 8 + 7 + 15 + 3 = <b>53</b>. The edges left out (12, 14, 10) would each close a cycle with heavier weight than the tree edges on it.' }
    ];
    const [i, ctl] = useSteps(steps.length, 2600);
    return html`<figure className="fig"><div className="fig-stage">
      <${GraphSvg} weights=${W} label="Example graph with its minimum spanning tree" edgeKind=${(u, v) => i >= 1 && MST.has(eid(u, v)) ? 'tree' : i >= 1 ? 'plain' : 'plain'} />
      ${i === 2 && html`<p className="a16-sum">w(T) = 6 + 5 + 9 + 8 + 7 + 15 + 3 = <b>53</b></p>`}
      <p className="a16-lab">The slide's vertices have no names; the letters are added so the steps can refer to them.</p>
    </div><${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  /* ── slides 12-19: optimal substructure of an MST (cut and paste) ── */
  function OptSub() {
    const N = { p1: [15, 53], p2: [15, 130], p3: [65, 90], u: [130, 90], p4: [173, 53], v: [173, 128], q1: [243, 128], q2: [300, 77], q3: [290, 22], q4: [347, 37], q5: [377, 110], q6: [320, 148] };
    const T1 = [['p1', 'p3'], ['p2', 'p3'], ['p3', 'u'], ['u', 'p4']], T2 = [['v', 'q1'], ['q1', 'q2'], ['q2', 'q3'], ['q2', 'q4'], ['q2', 'q5'], ['q1', 'q6']];
    const T1alt = [['p1', 'p2'], ['p2', 'p3'], ['p3', 'p4'], ['u', 'p4']];
    const steps = [
      { en: 'An MST T of some graph G (the other edges of G are not shown).' },
      { en: 'Remove any edge (u, v) ∈ T.' },
      { en: 'Then T is partitioned into two subtrees T<sub>1</sub> and T<sub>2</sub>.' },
      { en: '<b>Theorem.</b> T<sub>1</sub> is an MST of G<sub>1</sub> = (V<sub>1</sub>, E<sub>1</sub>), the subgraph of G <i>induced</i> by the vertices of T<sub>1</sub>: V<sub>1</sub> = vertices of T<sub>1</sub>, E<sub>1</sub> = {(x, y) ∈ E : x, y ∈ V<sub>1</sub>}. Similarly for T<sub>2</sub>.' },
      { en: '<b>Proof, cut and paste:</b> w(T) = w(u, v) + w(T<sub>1</sub>) + w(T<sub>2</sub>). If T<sub>1</sub>′ (dashed) were a lower-weight spanning tree than T<sub>1</sub> for G<sub>1</sub>, then T′ = {(u, v)} ∪ T<sub>1</sub>′ ∪ T<sub>2</sub> would be a lower-weight spanning tree than T for G: a contradiction.' },
      { en: 'Do we also have overlapping subproblems? <b>Yes.</b> Then dynamic programming may work: yes, but MST exhibits another powerful property (the greedy choice) which leads to an even more efficient algorithm.' }
    ];
    const [i, ctl] = useSteps(steps.length, 2600);
    const ln = ([a, b], k, st) => html`<line key=${k} x1=${N[a][0]} y1=${N[a][1]} x2=${N[b][0]} y2=${N[b][1]} strokeLinecap="round" ...${st} />`;
    const blobs = i >= 2;
    return html`<figure className="fig"><div className="fig-stage">
      <svg viewBox="-12 0 412 172" role="img" aria-label="MST T split into subtrees T1 and T2 by removing edge u v">
        <g className=${pop(blobs)}>
          <path d="M-6 44 Q-4 30 20 34 L168 30 Q196 34 190 62 L142 110 Q70 156 14 152 Q-8 150 -6 120 Z" fill="color-mix(in srgb, var(--fig-k) 18%, var(--paper))" stroke="var(--fig-k)" strokeWidth="1.5" />
          <path d="M158 130 Q158 110 200 112 L250 108 Q264 22 280 10 Q302 2 352 20 Q396 60 393 115 Q386 166 330 166 L182 152 Q158 148 158 130 Z" fill="color-mix(in srgb, var(--fig-k) 18%, var(--paper))" stroke="var(--fig-k)" strokeWidth="1.5" />
          <text x="84" y="76" fontSize="21" fontStyle="italic" fontWeight="700" style=${{ fill: 'var(--fig-k)' }}>T<tspan dy="5" fontSize="18">1</tspan></text>
          <text x="262" y="72" fontSize="21" fontStyle="italic" fontWeight="700" style=${{ fill: 'var(--fig-k)' }}>T<tspan dy="5" fontSize="18">2</tspan></text>
        </g>
        ${T1.map((e, k) => ln(e, 't1' + k, { stroke: 'var(--ink)', strokeWidth: 3, opacity: i === 4 ? .25 : 1 }))}
        ${i === 4 && T1alt.map((e, k) => ln(e, 'ta' + k, { stroke: 'var(--fig-k)', strokeWidth: 3, strokeDasharray: '6 5' }))}
        ${T2.map((e, k) => ln(e, 't2' + k, { stroke: 'var(--ink)', strokeWidth: 3 }))}
        ${ln(['u', 'v'], 'uv', i === 0 ? { stroke: 'var(--ink)', strokeWidth: 3 } : i === 1 ? { stroke: '#d23c3c', strokeWidth: 4 } : { stroke: '#d23c3c', strokeWidth: 2.5, strokeDasharray: '4 5', opacity: i === 4 ? 1 : .6 })}
        ${Object.entries(N).map(([k, [x, y]]) => html`<circle key=${k} cx=${x} cy=${y} r="5" fill="var(--ink)" />`)}
        ${i >= 1 && html`<text x="126" y="72" fontSize="19" fontStyle="italic" style=${{ fill: 'var(--fig-k)' }}>u</text><text x="154" y="140" textAnchor="end" fontSize="19" fontStyle="italic" style=${{ fill: 'var(--fig-k)' }}>v</text>`}
        ${i === 4 && html`<text x="4" y="168" fontSize="18" fontStyle="italic" style=${{ fill: 'var(--fig-k)' }}>T₁′ (dashed)</text>`}
      </svg>
      ${i >= 4 && html`<p className="a16-formula">w(T) = w(u, v) + w(T<sub>1</sub>) + w(T<sub>2</sub>)</p>`}
    </div><${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  /* ── slides 20-25: greedy-choice property, proof of the cut theorem ── */
  function CutProof() {
    const s = ([x, y]) => [(x - 300) / 2.55, (y - 262) / 2.55];
    const raw = { r1: [350, 443, 0], r2: [327, 500, 0], r3: [360, 555, 0], a1: [455, 500, 1], x: [583, 500, 1], r4: [595, 420, 0], y: [792, 430, 0], u: [723, 535, 1], c1: [653, 628, 1], c2: [723, 628, 1], c3: [793, 628, 1], v: [898, 488, 0], b3: [1027, 442, 1], r5: [1027, 537, 0], r6: [1155, 430, 0], b4: [1203, 513, 1], b5: [1260, 383, 1], b6: [1295, 292, 1] };
    const N = Object.fromEntries(Object.entries(raw).map(([k, p]) => [k, s(p)])), inA = k => raw[k][2] === 1;
    const T = [['r1', 'a1'], ['r2', 'a1'], ['r3', 'a1'], ['a1', 'x'], ['x', 'r4'], ['x', 'y'], ['y', 'v'], ['x', 'u'], ['u', 'c1'], ['u', 'c2'], ['u', 'c3'], ['v', 'b3'], ['b3', 'r5'], ['b3', 'r6'], ['r6', 'b4'], ['r6', 'b5'], ['b5', 'b6']];
    const path = new Set(['x-u', 'x-y', 'y-v']), key = ([a, b]) => a + '-' + b;
    const steps = [
      { en: '<b>Greedy-choice property:</b> a locally optimal choice is globally optimal. <b>Theorem.</b> Let T be the MST of G = (V, E) and A ⊆ V. If (u, v) ∈ E is the least-weight edge connecting A to V − A, then (u, v) ∈ T.' },
      { en: '<b>Proof.</b> Suppose (u, v) ∉ T. Cut and paste. Light vertices are in A, red ones in V − A; the dashed (u, v) is the least-weight edge connecting A to V − A.' },
      { en: 'Consider the unique simple path from u to v in T (highlighted): u → x → y → v.' },
      { en: 'Swap (u, v) with the <b>first edge on this path that connects a vertex in A to a vertex in V − A</b>: that is (x, y), since x ∈ A and y ∈ V − A.' },
      { en: 'T′ = T − {(x, y)} ∪ {(u, v)} is still a spanning tree, and w(T′) = w(T) − w(x, y) + w(u, v) &lt; w(T) because w(u, v) &lt; w(x, y) (distinct weights). A lighter-weight spanning tree than T results: contradiction, so (u, v) ∈ T. ∎' }
    ];
    const [i, ctl] = useSteps(steps.length, 2600);
    const swapped = i >= 4;
    return html`<figure className="fig"><div className="fig-stage">
      <svg viewBox="0 0 392 152" role="img" aria-label="Spanning tree T with vertices in A and V minus A and the light edge u v">
        ${i >= 2 && i <= 3 && [...path].map(p => { const [a, b] = p.split('-'); return html`<line key=${'h' + p} x1=${N[a][0]} y1=${N[a][1]} x2=${N[b][0]} y2=${N[b][1]} stroke="var(--fig-k)" strokeOpacity=".35" strokeWidth="10" strokeLinecap="round" />`; })}
        ${i >= 2 && i <= 3 && html`<line x1=${N.u[0]} y1=${N.u[1]} x2=${N.v[0]} y2=${N.v[1]} stroke="var(--fig-k)" strokeOpacity=".2" strokeWidth="10" strokeLinecap="round" />`}
        ${T.map((e, k) => { const isXY = key(e) === 'x-y'; if (isXY && swapped) return null;
          return html`<line key=${k} x1=${N[e[0]][0]} y1=${N[e[0]][1]} x2=${N[e[1]][0]} y2=${N[e[1]][1]} stroke=${isXY && i === 3 ? '#d23c3c' : 'var(--ink)'} strokeWidth=${isXY && i === 3 ? 3.5 : 2} strokeDasharray=${isXY && i === 3 ? '6 4' : ''} />`; })}
        ${i >= 1 && html`<line x1=${N.u[0]} y1=${N.u[1]} x2=${N.v[0]} y2=${N.v[1]} stroke=${swapped ? 'var(--ink)' : 'var(--fig-k)'} strokeWidth=${swapped ? 2 : 3} strokeDasharray=${swapped ? '' : '6 4'} />`}
        ${Object.keys(N).map(k => html`<circle key=${k} cx=${N[k][0]} cy=${N[k][1]} r="6" fill=${inA(k) ? LIGHT : RED} stroke="var(--ink)" strokeWidth="1.2" />`)}
        <text x=${N.u[0]} y=${N.u[1] - 10} textAnchor="middle" fontSize="18" fontStyle="italic" style=${{ fill: 'var(--fig-k)' }}>u</text>
        <text x=${N.v[0] - 4} y=${N.v[1] - 12} fontSize="18" fontStyle="italic" style=${{ fill: 'var(--fig-k)' }}>v</text>
        ${i >= 3 && html`<text x=${N.x[0] - 6} y=${N.x[1] + 22} fontSize="17" fontStyle="italic" style=${{ fill: 'var(--graphite)' }}>x</text><text x=${N.y[0] - 4} y=${N.y[1] - 11} fontSize="17" fontStyle="italic" style=${{ fill: 'var(--graphite)' }}>y</text>`}
        <text x="2" y="18" fontSize="18" fontStyle="italic">${swapped ? 'T′' : 'T'}</text>
      </svg>
      <div className="a16-leg"><span><i className="a"></i>∈ A</span><span><i className="q"></i>∈ V − A</span>${i >= 1 && i < 4 && html`<span><s className="d"></s>(u, v): least-weight edge A to V − A</span>`}</div>
      ${swapped && html`<p className="a16-formula">w(T′) = w(T) − w(x, y) + w(u, v) ${"<"} w(T)</p>`}
    </div><${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  /* ── slides 26-39: Prim's algorithm on the slide graph, with "try your own" weights and root ── */
  function primRun(W, root) {
    const adj = Object.fromEntries(VS.map(v => [v, []]));
    SLIDE_E.forEach(([u, v]) => { adj[u].push(v); adj[v].push(u); });
    const key = Object.fromEntries(VS.map(v => [v, INF])), pi = Object.fromEntries(VS.map(v => [v, null])), inQ = Object.fromEntries(VS.map(v => [v, true]));
    key[root] = 0;
    const snap = (o) => Object.assign({ key: { ...key }, pi: { ...pi }, inQ: { ...inQ } }, o);
    const out = [snap({ t: 'init' })];
    for (let n = 0; n < VS.length; n++) {
      let u = null; VS.forEach(v => { if (inQ[v] && (u === null || key[v] < key[u])) u = v; });
      inQ[u] = false; out.push(snap({ t: 'ext', u }));
      const chg = [], kept = [];
      adj[u].forEach(v => { if (!inQ[v]) return; const w = W[eid(u, v)]; if (w < key[v]) { chg.push([v, key[v], w]); key[v] = w; pi[v] = u; } else kept.push([v, key[v], w]); });
      if (chg.length) out.push(snap({ t: 'upd', u, chg, kept }));
    }
    return out;
  }
  function Prim() {
    const [W, setW] = useState(slideW), [root, setRoot] = useState('f'), [edit, setEdit] = useState(false), [txt, setTxt] = useState(() => Object.fromEntries(SLIDE_E.map(([u, v, w]) => [eid(u, v), String(w)])));
    const isSlide = root === 'f' && SLIDE_E.every(([u, v, w]) => W[eid(u, v)] === w);
    const run = useMemo(() => primRun(W, root), [W, root]);
    const [i0, ctl] = useSteps(run.length, 1900);
    const i = Math.min(i0, run.length - 1), st = run[i];
    const sig = JSON.stringify([W, root]), first = useRef(true);
    useEffect(() => { if (first.current) { first.current = false; return; } ctl.replay(); }, [sig]);
    const mstW = VS.reduce((s, v) => s + (run[run.length - 1].pi[v] ? W[eid(v, run[run.length - 1].pi[v])] : 0), 0);
    let en;
    if (st.t === 'init') en = `Q ← V; key[v] ← ∞ for all v; key[${root}] ← 0 for the root ${root}. Every vertex is still in Q = V − A (red). Each key is the weight of the least-weight edge from the vertex to A.`;
    else if (st.t === 'ext') {
      const p = st.pi[st.u];
      en = `u ← EXTRACT-MIN(Q) = <b>${st.u}</b> (key ${kstr(st.key[st.u])}). ${st.u} joins A${p ? `, and the edge (${st.u}, π[${st.u}]) = (${st.u}, ${p}) of weight ${W[eid(st.u, p)]} joins the tree` : ' as the root'}.`;
      if (i === run.length - 1) en += ` Q = ∅: the edges {(v, π[v])} form the MST, of weight ${VS.filter(v => st.pi[v]).map(v => W[eid(v, st.pi[v])]).join(' + ')} = <b>${mstW}</b>.`;
    } else {
      en = `For each v ∈ Adj[${st.u}] still in Q with w(${st.u}, v) &lt; key[v]: ` + st.chg.map(([v, o, w]) => `key[${v}] ← ${w} (was ${kstr(o)}), π[${v}] ← ${st.u}`).join('; ') + ' (DECREASE-KEY).';
      if (st.kept.length) en += ' ' + st.kept.map(([v, o, w]) => `key[${v}] stays ${kstr(o)} since w(${st.u}, ${v}) = ${w} ≥ ${kstr(o)}`).join('; ') + '.';
    }
    if (isSlide) en += ` <span style="color:var(--graphite)">(slide ${27 + i})</span>`;
    const inTree = (u, v) => (st.pi[u] === v && !st.inQ[u]) || (st.pi[v] === u && !st.inQ[v]);
    const cand = (u, v) => (st.pi[u] === v && st.inQ[u]) || (st.pi[v] === u && st.inQ[v]);
    const arrows = VS.filter(v => st.pi[v]).map(v => [v, st.pi[v], st.inQ[v]]);
    const chgSet = new Set(st.t === 'upd' ? st.chg.map(c => c[0]) : []);
    const bad = Object.fromEntries(Object.entries(txt).map(([k, s]) => [k, !/^\d{1,2}$/.test(s.trim()) || +s < 1 || +s > 99]));
    const apply = () => { if (Object.values(bad).some(Boolean)) return; setW(Object.fromEntries(Object.entries(txt).map(([k, s]) => [k, +s]))); setEdit(false); };
    const loadSlide = () => { setW(slideW()); setRoot('f'); setTxt(Object.fromEntries(SLIDE_E.map(([u, v, w]) => [eid(u, v), String(w)]))); setEdit(false); };
    const rnd = () => { const pool = Array.from({ length: 20 }, (_, k) => k + 1).sort(() => Math.random() - .5); const t = Object.fromEntries(SLIDE_E.map(([u, v], k) => [eid(u, v), String(pool[k])])); setTxt(t); setW(Object.fromEntries(Object.entries(t).map(([k, s]) => [k, +s]))); };
    return html`<figure className="fig"><div className="fig-stage">
      <div className="a16-row"><button className=${'fig-btn' + (isSlide ? ' sel' : '')} onClick=${loadSlide}>Example from the slides</button>
        <button className=${'fig-btn' + (edit ? ' solid' : '')} onClick=${() => (edit ? apply() : setEdit(true))}>${edit ? '✓ Run with these weights' : '✎ Try your own'}</button></div>
      ${edit && html`<div>
        <p className="a16-lab">Edge weights (whole numbers 1 to 99). Root vertex:</p>
        <div className="a16-row">${VS.map(v => html`<button key=${v} className=${'fig-btn' + (root === v ? ' sel' : '')} onClick=${() => setRoot(v)} aria-label=${'Root ' + v}>${v}</button>`)}</div>
        <div className="a16-ws">${SLIDE_E.map(([u, v]) => { const k = eid(u, v); return html`<label key=${k}>${u}–${v}<input inputMode="numeric" value=${txt[k]} className=${bad[k] ? 'bad' : ''} aria-label=${'weight of ' + u + ' ' + v} onInput=${e => setTxt({ ...txt, [k]: e.target.value.slice(0, 2) })} /></label>`; })}</div>
        ${Object.values(bad).some(Boolean) && html`<p className="a16-err">Every weight must be a whole number from 1 to 99.</p>`}
        <div className="a16-row"><button className="fig-btn" onClick=${rnd}>Random weights</button></div></div>`}
      <${GraphSvg} weights=${W} showNames=${true} label="Prim's algorithm on the graph"
        nodeFill=${v => (st.inQ[v] ? RED : LIGHT)} nodeTextFill=${v => (st.inQ[v] ? '#fff' : 'var(--ink)')} nodeText=${v => kstr(st.key[v])}
        nodeRing=${v => st.u === v} edgeKind=${(u, v) => (inTree(u, v) ? 'tree' : cand(u, v) ? 'cand' : 'plain')} arrows=${arrows} />
      <div className="a16-leg"><span><i className="a"></i>∈ A</span><span><i className="q"></i>∈ V − A (in Q)</span><span><s></s>tree edge</span><span><s className="d"></s>(v, π[v]), v in Q</span></div>
      <div className="a16-keys" aria-label="key and parent of each vertex">
        <div className="h">v</div>${VS.map(v => html`<div key=${'v' + v} className=${'v' + (st.u === v ? ' cur' : '') + (st.inQ[v] ? '' : ' out')}>${v}</div>`)}
        <div className="h">key</div>${VS.map(v => html`<div key=${'k' + v} className=${(chgSet.has(v) ? 'chg' : '') + (st.inQ[v] ? '' : ' out')}>${kstr(st.key[v])}</div>`)}
        <div className="h">π</div>${VS.map(v => html`<div key=${'p' + v} className=${(chgSet.has(v) ? 'chg' : '') + (st.inQ[v] ? '' : ' out')}>${st.pi[v] || '·'}</div>`)}
      </div>
    </div><${Cap} en=${en} /><${Bar} steps=${run} i=${i} ctl=${ctl} /></figure>`;
  }

  /* ── slides 40-50: analysis of Prim, and the three priority queues ── */
  function PrimCost() {
    const code = [
      [0, 'Q ← V', 'init'], [0, 'key[v] ← ∞ for all v ∈ V', 'init'], [0, 'key[s] ← 0 for some arbitrary s ∈ V', 'init'],
      [0, 'while Q ≠ ∅', 'loop'], [1, 'do u ← EXTRACT-MIN(Q)', 'ext'], [2, 'for each v ∈ Adj[u]', 'for'],
      [3, 'do if v ∈ Q and w(u, v) < key[v]', 'if'], [4, 'then key[v] ← w(u, v)', 'dk'], [5, 'π[v] ← u', 'dk']];
    const steps = [
      { en: 'Prim\'s algorithm again (slide 40). How many times does each line run?', on: [] },
      { en: 'The initialisation touches every vertex once: <b>Θ(V) total</b>.', on: ['init'], tags: { init: 'Θ(V) total' } },
      { en: 'Every vertex leaves Q exactly once, so the while loop and EXTRACT-MIN run <b>|V| times</b>.', on: ['loop', 'ext'], tags: { init: 'Θ(V) total', ext: '|V| times' } },
      { en: 'For the extracted u, the inner loop runs <b>degree(u) times</b>, once per neighbour.', on: ['for', 'if'], tags: { init: 'Θ(V) total', ext: '|V| times', for: 'degree(u) times' } },
      { en: '<b>Handshaking Lemma</b>: Σ<sub>u∈V</sub> degree(u) = 2|E|, so the test runs 2|E| times in all and the assignment key[v] ← w(u, v) is done at most that often: <b>Θ(E) implicit DECREASE-KEYs</b>.', on: ['dk'], tags: { init: 'Θ(V) total', ext: '|V| times', for: 'degree(u) times', dk: 'Θ(E) DECREASE-KEY' } },
      { en: 'Time = Θ(V) · T<sub>EXTRACT-MIN</sub> + Θ(E) · T<sub>DECREASE-KEY</sub>. The total depends on how the priority queue Q is implemented.', on: [], tags: { init: 'Θ(V) total', ext: '|V| times', for: 'degree(u) times', dk: 'Θ(E) DECREASE-KEY' }, rows: 0 },
      { en: '<b>Array</b>: EXTRACT-MIN scans all of Q, O(V); DECREASE-KEY just writes the key, O(1). Total Θ(V) · O(V) + Θ(E) · O(1) = <b>O(V<sup>2</sup>)</b>.', rows: 1 },
      { en: '<b>Binary heap</b>: both operations cost O(lg V). Total Θ(V) · O(lg V) + Θ(E) · O(lg V) = <b>O(E lg V)</b> (E ≥ V − 1 for a connected graph).', rows: 2 },
      { en: '<b>Fibonacci heap</b>: EXTRACT-MIN O(lg V) amortized, DECREASE-KEY O(1) amortized. Total <b>O(E + V lg V)</b> worst case. Try sizes below: the array wins for dense graphs (E near V<sup>2</sup>), the heaps for sparse ones.', rows: 3 }
    ];
    const [i, ctl] = useSteps(steps.length, 2600);
    const s = steps[i], tags = s.tags || steps[5].tags, table = i >= 5;
    const [V, setV] = useState(100), [dens, setDens] = useState(10);
    const maxE = V * (V - 1) / 2, E = Math.max(V - 1, Math.round(maxE * dens / 100));
    const lg = Math.log2(V), costs = [['array: V²', V * V], ['binary: E lg V', E * lg], ['Fibonacci: E + V lg V', E + V * lg]], top = Math.max(...costs.map(c => c[1])), best = Math.min(...costs.map(c => c[1]));
    const fmt = x => x >= 1e6 ? (x / 1e6).toFixed(2) + ' M' : x >= 1e4 ? Math.round(x / 1e3) + ' k' : String(Math.round(x));
    return html`<figure className="fig"><div className="fig-stage">
      ${!table ? html`<div className="a16-code" aria-label="Prim pseudocode with costs">${code.map(([d, t, g], k) => html`<div key=${k} className=${'l' + ((s.on || []).includes(g) ? ' on' : '')} style=${{ paddingLeft: (4 + d * 12) + 'px' }}><span className="t">${t}</span>${tags[g] && (k === code.findIndex(c => c[2] === g)) && html`<span className="tag">${tags[g]}</span>`}</div>`)}</div>`
        : html`<p className="a16-formula">Time = Θ(V) · T<sub>EXTRACT-MIN</sub> + Θ(E) · T<sub>DECREASE-KEY</sub></p>
        <table className="a16-tbl"><thead><tr><th>Q</th><th>T<sub>EXTRACT-MIN</sub></th><th>T<sub>DECREASE-KEY</sub></th><th>Total</th></tr></thead><tbody>
          <tr className=${s.rows >= 1 ? '' : 'off'}><td>array</td><td>O(V)</td><td>O(1)</td><td className="tot">O(V<sup>2</sup>)</td></tr>
          <tr className=${s.rows >= 2 ? '' : 'off'}><td>binary heap</td><td>O(lg V)</td><td>O(lg V)</td><td className="tot">O(E lg V)</td></tr>
          <tr className=${s.rows >= 3 ? '' : 'off'}><td>Fibonacci heap</td><td>O(lg V) amortized</td><td>O(1) amortized</td><td className="tot">O(E + V lg V) worst case</td></tr></tbody></table>`}
      ${i === 8 && html`<div className="a16-calc">
        <label><span>|V| = ${V}</span><input type="range" min="10" max="1000" step="10" value=${V} aria-label="Number of vertices" onInput=${e => setV(+e.target.value)} /><span></span></label>
        <label><span>density</span><input type="range" min="0" max="100" value=${dens} aria-label="Edge density" onInput=${e => setDens(+e.target.value)} /><span>${dens} %</span></label>
        <div className="a16-lab" style=${{ textAlign: 'left' }}>|E| = ${E} (from V − 1 = ${V - 1} up to V(V − 1)/2 = ${maxE})</div>
        <div className="a16-bars">${costs.map(([n, c]) => html`<div key=${n} className=${'r' + (c === best ? ' min' : '')}><span>${n}</span><div className="bar" style=${{ width: Math.max(1, c / top * 100) + '%' }}></div><span className="val">≈ ${fmt(c)} steps${c === best ? ' (fewest)' : ''}</span></div>`)}</div></div>`}
    </div><${Cap} en=${s.en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  window.FIGS = Object.assign(window.FIGS || {}, {
    'ag-16-adj': Adjacency, 'ag-16-mst-example': MstExample, 'ag-16-opt-sub': OptSub, 'ag-16-cut-proof': CutProof,
    'ag-16-prim': Prim, 'ag-16-prim-cost': PrimCost
  });
})();
/* ── part L17 ── */
// Algorithms visuals, Lecture 17 (Greedy algorithms: Kruskal, Prim, Huffman codes, activity selection): the cut theorem (slides 12-17),
// Kruskal and Prim on the slide graph (18-27), full binary trees and the Huffman example (29-37), the Huffman proofs (38-46)
// and activity selection (48-58). Every label and number comes from the slides.
(function () {
  const { useState, useEffect, useRef, useMemo } = React;
  const { html, useSteps, Cap, Bar, pop, calm, useClock, useFit, sec } = window.FIGKIT;
  const CSS = `
.a17-row{ display:flex; flex-wrap:wrap; gap:6px; justify-content:center; align-items:center; margin:0 0 10px; }
.a17-row .fig-btn.sel{ border-color:var(--fig-k); box-shadow:inset 0 0 0 1px var(--fig-k); }
.a17-lab{ font-size:.82rem; color:var(--graphite); text-align:center; margin:4px 0 6px; }
.a17-in{ display:block; width:100%; max-width:460px; margin:0 auto 6px; box-sizing:border-box; font-family:var(--mono); font-size:.88rem; padding:6px 8px; border:1px solid var(--line); border-radius:8px; background:var(--paper); color:var(--ink); resize:vertical; }
.a17-in.bad{ border-color:#d23c3c; }
.a17-err{ color:#d23c3c; font-size:.86rem; text-align:center; margin:0 0 6px; }
.a17-leg{ display:flex; flex-wrap:wrap; gap:4px 14px; justify-content:center; font-size:.82rem; color:var(--graphite); margin:6px 0 0; }
.a17-leg i{ display:inline-block; width:12px; height:12px; border-radius:50%; vertical-align:-2px; margin-right:5px; border:1.5px solid var(--ink); }
.a17-leg i.q{ background:#c23b3b; } .a17-leg i.a{ background:color-mix(in srgb, var(--fig-k) 30%, var(--paper)); }
.a17-leg s{ display:inline-block; width:18px; height:0; border-top:4px solid var(--fig-k); vertical-align:3px; margin-right:5px; }
.a17-leg s.d{ border-top:2px dashed var(--fig-k); } .a17-leg s.x{ border-top:2px dashed #d23c3c; }
.a17-chips{ display:flex; flex-wrap:wrap; gap:4px; justify-content:center; margin:8px auto 0; max-width:480px; }
.a17-chips span{ font-size:.84rem; padding:2px 7px; border-radius:99px; border:1px solid var(--line); background:var(--paper); transition:background .3s, opacity .3s; }
.a17-chips span.ok{ background:color-mix(in srgb, var(--fig-k) 30%, var(--paper)); border-color:var(--fig-k); font-weight:600; }
.a17-chips span.no{ opacity:.5; text-decoration:line-through; }
.a17-chips span.cur{ outline:2px solid var(--fig-k); outline-offset:1px; }
.a17-sets{ display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin:8px 0 0; font-size:.86rem; }
.a17-sets span{ padding:2px 8px; border:1.5px solid var(--graphite); border-radius:10px; background:var(--paper); }
.a17-sets span.new{ border-color:var(--fig-k); background:color-mix(in srgb, var(--fig-k) 22%, var(--paper)); font-weight:600; }
.a17-keys{ display:grid; gap:2px; max-width:440px; margin:10px auto 0; font-size:.86rem; text-align:center; }
.a17-keys > div{ padding:3px 0; border-radius:4px; background:var(--paper); border:1px solid var(--line); min-width:0; transition:background .4s; }
.a17-keys > div.h{ background:transparent; border-color:transparent; color:var(--graphite); font-size:.8rem; text-align:right; padding-right:4px; }
.a17-keys > div.v{ font-weight:700; font-style:italic; }
.a17-keys > div.out{ color:var(--graphite); background:color-mix(in srgb, var(--fig-k) 14%, var(--paper)); }
.a17-keys > div.chg{ background:color-mix(in srgb, var(--fig-k) 38%, var(--paper)); font-weight:700; }
.a17-keys > div.cur{ outline:2px solid var(--fig-k); outline-offset:-2px; font-weight:700; }
.a17-sum{ text-align:center; margin:10px 0 0; font-size:.95rem; line-height:1.5; }
.a17-code{ font-family:var(--mono); font-size:.8rem; line-height:1.45; background:var(--paper); border:1px solid var(--line); border-radius:8px; padding:8px 10px; max-width:470px; margin:0 auto; }
.a17-code .l{ display:flex; flex-wrap:wrap; align-items:baseline; gap:2px 8px; padding:1px 4px; border-radius:4px; transition:background .4s; }
.a17-code .l.on{ background:color-mix(in srgb, var(--fig-k) 20%, var(--paper)); }
.a17-code .t{ padding-left:1.2em; text-indent:-1.2em; }
.a17-code .tag{ font-family:var(--body); font-size:.78rem; font-weight:700; color:#fff; background:var(--fig-s); border-radius:99px; padding:0 8px; white-space:nowrap; }
.a17-code .hd{ font-family:var(--body); font-weight:700; margin-bottom:2px; }
.a17-trees{ display:flex; flex-wrap:wrap; gap:6px 14px; justify-content:center; align-items:flex-end; }
.a17-trees figure{ margin:0; flex:1 1 200px; max-width:250px; text-align:center; }
.a17-trees figcaption{ font-size:.84rem; color:var(--graphite); margin-top:2px; }
.a17-trees svg{ max-width:250px !important; }
.a17-q{ display:flex; flex-wrap:wrap; gap:4px; justify-content:center; align-items:center; margin:8px 0 0; font-size:.86rem; }
.a17-q b{ font-weight:600; color:var(--graphite); margin-right:2px; }
.a17-q span{ padding:2px 7px; border:1px solid var(--line); border-radius:6px; background:var(--paper); }
.a17-q span.x{ border-color:var(--fig-k); background:color-mix(in srgb, var(--fig-k) 28%, var(--paper)); font-weight:700; }
.a17-q span.z{ border:2px solid var(--fig-k); font-weight:700; }
.a17-codes{ width:100%; max-width:440px; margin:10px auto 0; border-collapse:collapse; font-size:.86rem; }
.a17-codes th, .a17-codes td{ border:1px solid var(--line); padding:3px 4px; text-align:center; }
.a17-codes th{ background:var(--paper); color:var(--graphite); font-weight:600; }
.a17-codes td.cw{ font-family:var(--mono); font-weight:700; color:var(--fig-k); }
.a17-pc{ display:grid; gap:6px; max-width:440px; margin:0 auto; font-size:.92rem; }
.a17-pc .set{ display:flex; flex-wrap:wrap; gap:4px; align-items:center; }
.a17-pc .set span{ font-family:var(--mono); padding:2px 7px; border:1px solid var(--line); border-radius:6px; background:var(--paper); }
.a17-pc .set span.hit{ border-color:#d23c3c; outline:1px solid #d23c3c; font-weight:700; }
.a17-pc .ok{ color:var(--ok); font-weight:700; } .a17-pc .bad{ color:#d23c3c; font-weight:700; }
`;
  if (!document.getElementById('a17-css')) { const s = document.createElement('style'); s.id = 'a17-css'; s.textContent = CSS; document.head.appendChild(s); }

  const RED = '#c23b3b', LIGHT = 'color-mix(in srgb, var(--fig-k) 30%, var(--paper))';
  const INF = Infinity, kstr = k => (k === INF ? '∞' : String(k));
  const ekey = (u, v) => (u < v ? u + '|' + v : v + '|' + u);
  function seg(a, b, r1, r2) { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L; return [a[0] + ux * r1, a[1] + uy * r1, b[0] - ux * r2, b[1] - uy * r2, ux, uy]; }
  function arrowHead(x, y, ux, uy, s, fill) { const px = -uy, py = ux; return html`<path d=${`M${x},${y} L${x - ux * s + px * s * .55},${y - uy * s + py * s * .55} L${x - ux * s - px * s * .55},${y - uy * s - py * s * .55} Z`} fill=${fill} />`; }
  const sub = s => s.replace(/_(\w+)/g, '<sub>$1</sub>');

  // ── graphs: the slide graph (slides 19, 24, 26: the vertices have no names there, the letters are added so the steps can name them),
  //    the graph of the final-exam question in the notes, and the user's own
  const T19 = ([x, y]) => [Math.round((x - 110) * .93 + 24), Math.round((y - 155) * .93 + 26)];
  const SLIDE = {
    label: 'Example from the slides', n: 'slide',
    V: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
    P: Object.fromEntries(Object.entries({ a: [110, 155], b: [290, 155], c: [465, 155], d: [200, 240], e: [375, 240], f: [110, 333], g: [290, 333], h: [465, 333] }).map(([k, p]) => [k, T19(p)])),
    E: [['a', 'b', 12, 203, 141], ['b', 'c', 8, 377, 141], ['a', 'd', 2, 166, 192], ['b', 'd', 9, 238, 192], ['a', 'f', 5, 96, 244], ['d', 'f', 8, 150, 280], ['d', 'g', 7, 250, 276],
      ['b', 'g', 3, 278, 244], ['b', 'e', 1, 338, 190], ['c', 'e', 9, 418, 190], ['c', 'h', 11, 484, 244], ['e', 'g', 3, 325, 280], ['e', 'h', 5, 424, 276], ['f', 'g', 1, 200, 349], ['g', 'h', 10, 380, 349]]
      .map(([u, v, w, x, y]) => [u, v, w].concat(T19([x, y]))),
    names: { a: [0, -25], b: [0, -25], c: [0, -25], d: [-26, -6], e: [26, -6], f: [0, 27], g: [0, 27], h: [0, 27] },
    vb: [0, -14, 380, 252], root: 'a'
  };
  const EXAM = {
    label: 'Final 2021 Q17-18', n: 'exam',
    V: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    P: { A: [60, 44], B: [190, 26], C: [320, 44], G: [190, 116], D: [60, 186], E: [190, 216], F: [320, 186] },
    E: [['A', 'G', 1], ['B', 'C', 1], ['F', 'E', 1], ['A', 'B', 2], ['C', 'G', 4], ['B', 'G', 3], ['A', 'D', 3], ['C', 'F', 3], ['D', 'E', 5], ['D', 'G', 5], ['G', 'F', 6], ['D', 'F', 4]],
    vb: [0, -14, 380, 272], root: 'A'
  };
  function autoLabels(g) {
    const cx = g.V.reduce((s, v) => s + g.P[v][0], 0) / g.V.length, cy = g.V.reduce((s, v) => s + g.P[v][1], 0) / g.V.length;
    g.E = g.E.map(e => { if (e.length > 3) return e; const [u, v] = e, a = g.P[u], b = g.P[v], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      let nx = -(b[1] - a[1]) / L, ny = (b[0] - a[0]) / L; if ((mx - cx) * nx + (my - cy) * ny < 0) { nx = -nx; ny = -ny; }
      return [e[0], e[1], e[2], mx + nx * 12, my + ny * 12]; });
    g.names = g.names || Object.fromEntries(g.V.map(v => { const dx = g.P[v][0] - cx, dy = g.P[v][1] - cy, L = Math.hypot(dx, dy) || 1; return [v, [dx / L * 26, dy / L * 26]]; }));
    return g;
  }
  autoLabels(EXAM);
  function parseGraph(txt) {
    const parts = txt.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
    if (!parts.length) throw new Error('Type at least one edge, like A-B 4.');
    if (parts.length > 20) throw new Error('At most 20 edges, so the picture fits a phone.');
    const E = [], V = [], seen = new Set();
    for (const p of parts) {
      const m = p.match(/^([A-Za-z0-9]{1,2})\s*[-–\s]\s*([A-Za-z0-9]{1,2})\s*[=:\s]\s*(\d{1,2})$/);
      if (!m) throw new Error(`"${p}" is not an edge: write it like A-B 4 (two names, then a weight from 0 to 99).`);
      const [, u, v, w] = m; if (u === v) throw new Error(`"${p}" is a loop: an MST never uses one.`);
      const k = ekey(u, v); if (seen.has(k)) throw new Error(`The edge ${u}-${v} appears twice.`); seen.add(k);
      [u, v].forEach(x => { if (!V.includes(x)) V.push(x); }); E.push([u, v, +w]);
    }
    if (V.length > 9) throw new Error('At most 9 vertices, so the picture fits a phone.');
    const adj = Object.fromEntries(V.map(v => [v, []])); E.forEach(([u, v]) => { adj[u].push(v); adj[v].push(u); });
    const st = [V[0]], vis = new Set(st); while (st.length) { const x = st.pop(); adj[x].forEach(y => { if (!vis.has(y)) { vis.add(y); st.push(y); } }); }
    if (vis.size < V.length) throw new Error('The graph is not connected, so it has no spanning tree. Add edges that join ' + V.filter(v => !vis.has(v)).join(', ') + ' to the rest.');
    const n = V.length, P = Object.fromEntries(V.map((v, k) => [v, [190 + 140 * Math.cos(-Math.PI / 2 + 2 * Math.PI * k / n), 122 + 94 * Math.sin(-Math.PI / 2 + 2 * Math.PI * k / n)]]));
    return autoLabels({ label: 'Your graph', n: 'own', V, P, E, vb: [0, -14, 380, 278], root: V[0] });
  }
  const graphText = g => g.E.map(e => `${e[0]}-${e[1]} ${e[2]}`).join(', ');

  function GView({ g, nodeFill, nodeText, nodeTextFill, ring, showNames, edgeKind, arrows, label }) {
    const R = 16;
    const sty = k => k === 'tree' ? { stroke: 'var(--fig-k)', strokeWidth: 7, opacity: .8 } : k === 'cur' ? { stroke: 'var(--fig-k)', strokeWidth: 4, strokeDasharray: '7 5' } : k === 'cand' ? { stroke: 'var(--fig-k)', strokeWidth: 3, strokeDasharray: '7 5' } : k === 'rej' ? { stroke: '#d23c3c', strokeWidth: 2, strokeDasharray: '5 5' } : k === 'rejcur' ? { stroke: '#d23c3c', strokeWidth: 4, strokeDasharray: '5 5' } : { stroke: 'var(--graphite)', strokeWidth: 1.6 };
    return html`<svg viewBox=${g.vb.join(' ')} role="img" aria-label=${label}>
      ${g.E.map(([u, v], k) => html`<line key=${'e' + k} x1=${g.P[u][0]} y1=${g.P[u][1]} x2=${g.P[v][0]} y2=${g.P[v][1]} strokeLinecap="round" ...${sty(edgeKind ? edgeKind(u, v) : '')} />`)}
      ${arrows && arrows.map(([v, p], k) => { const [, , x2, y2, ux, uy] = seg(g.P[v], g.P[p], R, R + 2); return html`<g key=${'a' + k}>${arrowHead(x2, y2, ux, uy, 10, 'var(--fig-k)')}</g>`; })}
      ${g.E.map(([, , w, x, y], k) => html`<g key=${'w' + k}><rect x=${x - 11} y=${y - 10} width="22" height="20" rx="5" fill="var(--paper-2)" opacity=".85" /><text x=${x} y=${y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="17" fontWeight="600" style=${{ fill: 'var(--fig-k)' }}>${w}</text></g>`)}
      ${g.V.map(v => { const [x, y] = g.P[v]; return html`<g key=${v}>
        <circle cx=${x} cy=${y} r=${R} fill=${nodeFill ? nodeFill(v) : LIGHT} stroke="var(--ink)" strokeWidth=${ring && ring(v) ? 4 : 1.5} style=${{ transition: 'fill .4s' }} />
        <text x=${x} y=${y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="17" fontWeight="700" style=${{ fill: nodeTextFill ? nodeTextFill(v) : 'var(--ink)' }}>${nodeText ? nodeText(v) : v}</text>
        ${showNames && html`<text x=${x + g.names[v][0]} y=${y + g.names[v][1]} textAnchor="middle" dominantBaseline="middle" fontSize="17" fontStyle="italic" style=${{ fill: 'var(--graphite)' }}>${v}</text>`}</g>`; })}
    </svg>`;
  }

  function kruskalRun(g) {
    const par = Object.fromEntries(g.V.map(v => [v, v])), find = x => (par[x] === x ? x : (par[x] = find(par[x])));
    const sets = () => { const m = {}; g.V.forEach(v => { const r = find(v); (m[r] = m[r] || []).push(v); }); return Object.values(m); };
    const sorted = g.E.map((e, k) => [e, k]).sort((a, b) => a[0][2] - b[0][2] || a[1] - b[1]).map(x => x[0]);
    const out = [{ t: 'init', sets: sets(), st: {} }, { t: 'sort', sets: sets(), st: {}, sorted }];
    const st = {}; let A = [];
    sorted.forEach(([u, v, w], k) => {
      const fu = find(u), fv = find(v), ok = fu !== fv, before = ok ? [sets().find(s => s.includes(u)), sets().find(s => s.includes(v))] : null;
      if (ok) { par[fu] = fv; A = A.concat([[u, v, w]]); }
      st[ekey(u, v)] = ok ? 'ok' : 'no';
      out.push({ t: 'edge', e: [u, v, w], ok, k, sets: sets(), st: { ...st }, A, sorted, before });
    });
    return out;
  }
  function primRun(g, root) {
    const adj = Object.fromEntries(g.V.map(v => [v, []])); g.E.forEach(([u, v, w]) => { adj[u].push([v, w]); adj[v].push([u, w]); });
    const key = Object.fromEntries(g.V.map(v => [v, INF])), pi = Object.fromEntries(g.V.map(v => [v, null])), inQ = Object.fromEntries(g.V.map(v => [v, true]));
    key[root] = 0;
    const snap = o => Object.assign({ key: { ...key }, pi: { ...pi }, inQ: { ...inQ } }, o), out = [snap({ t: 'init' })], order = [];
    for (let n = 0; n < g.V.length; n++) {
      let u = null; g.V.forEach(v => { if (inQ[v] && (u === null || key[v] < key[u])) u = v; });
      inQ[u] = false; if (pi[u]) order.push([pi[u], u, key[u]]); out.push(snap({ t: 'ext', u, order: order.slice() }));
      const chg = [], kept = [];
      adj[u].forEach(([v, w]) => { if (!inQ[v]) return; if (w < key[v]) { chg.push([v, key[v], w]); key[v] = w; pi[v] = u; } else kept.push([v, key[v], w]); });
      if (chg.length) out.push(snap({ t: 'upd', u, chg, kept, order: order.slice() }));
    }
    return out;
  }
  const wOf = (g, u, v) => g.E.find(e => ekey(e[0], e[1]) === ekey(u, v))[2];

  /* ── slides 18-21 (Kruskal) and 22, 24-26 (Prim) on the slide graph; presets and "try your own" ── */
  function MstSim({ alg }) {
    const [g, setG] = useState(SLIDE), [edit, setEdit] = useState(false), [txt, setTxt] = useState(graphText(SLIDE)), [root, setRoot] = useState(SLIDE.root);
    const parsed = useMemo(() => { try { return { g: parseGraph(txt) }; } catch (e) { return { err: e.message }; } }, [txt]);
    const run = useMemo(() => (alg === 'k' ? kruskalRun(g) : primRun(g, root)), [g, root, alg]);
    const [i0, ctl] = useSteps(run.length, alg === 'k' ? 1700 : 1900);
    const i = Math.min(i0, run.length - 1), st = run[i], last = i === run.length - 1;
    const sig = g.n + JSON.stringify(g.E) + root, first = useRef(true);
    useEffect(() => { if (first.current) { first.current = false; return; } ctl.replay(); }, [sig]);
    const load = G => { setG(G); setRoot(G.root); setTxt(graphText(G)); setEdit(false); };
    const go = () => { if (!parsed.g) return; setG(parsed.g); setRoot(parsed.g.root); setEdit(false); };
    let body, en;
    if (alg === 'k') {
      const total = st.A ? st.A.reduce((s, e) => s + e[2], 0) : 0, need = g.V.length - 1;
      if (st.t === 'init') en = 'A ← ∅, and MAKE-SET(v) for every vertex: a forest of ' + g.V.length + ' one-vertex trees.';
      else if (st.t === 'sort') en = 'Sort the edges of E into nondecreasing order by weight: ' + st.sorted.map(e => e[2]).join(', ') + '. Edges of equal weight keep their input order.';
      else {
        const [u, v, w] = st.e;
        en = st.ok ? `Edge (${u}, ${v}) = ${w}: FIND-SET(${u}) ≠ FIND-SET(${v}), the ends are in different trees {${st.before[0].join(', ')}} and {${st.before[1].join(', ')}}, so A ← A ∪ {(${u}, ${v})} and UNION(${u}, ${v}). It is the lightest edge joining two trees, so it is safe.`
          : `Edge (${u}, ${v}) = ${w}: FIND-SET(${u}) = FIND-SET(${v}), both ends are already in the same tree, so the edge would close a cycle: skip it.`;
        if (st.A.length === need && (st.ok || last)) en += ` A now has |V| − 1 = ${need} edges${last ? '' : '; the remaining edges can only be skipped'}.`;
        if (last) en += ` Return A: total weight ${st.A.map(e => e[2]).join(' + ')} = <b>${total}</b>.`;
      }
      const cur = st.t === 'edge' ? ekey(st.e[0], st.e[1]) : null;
      const kind = (u, v) => { const k = ekey(u, v), s = st.st[k]; return s === 'ok' ? 'tree' : s === 'no' ? (k === cur ? 'rejcur' : 'rej') : ''; };
      const newSet = st.t === 'edge' && st.ok ? st.sets.find(s => s.includes(st.e[0])) : null;
      body = html`<${GView} g=${g} label="Kruskal's algorithm on the graph" edgeKind=${kind} ring=${v => st.t === 'edge' && (v === st.e[0] || v === st.e[1])} />
        <div className="a17-leg"><span><s></s>in A</span><span><s className="x"></s>skipped (cycle)</span></div>
        ${st.t !== 'init' && html`<div className="a17-chips" aria-label="edges in sorted order">${(st.sorted || []).map(([u, v, w]) => { const k = ekey(u, v), s = st.st[k]; return html`<span key=${k} className=${(s === 'ok' ? 'ok' : s === 'no' ? 'no' : '') + (k === cur ? ' cur' : '')}>${u}${v} ${w}</span>`; })}</div>`}
        <div className="a17-sets" aria-label="the trees of the forest">${st.sets.map((s, k) => html`<span key=${k} className=${newSet === s ? 'new' : ''}>{${s.join(', ')}}</span>`)}</div>`;
    } else {
      const total = g.V.reduce((s, v) => s + (st.pi[v] && !st.inQ[v] ? wOf(g, v, st.pi[v]) : 0), 0);
      if (st.t === 'init') en = `key[u] ← ∞ and π[u] ← NIL for every u; key[r] ← 0 for the root r = ${root}; Q ← V[G]. The tree A grows from ${root} and always stays a single tree.`;
      else if (st.t === 'ext') {
        const p = st.pi[st.u];
        en = `u ← EXTRACT-MIN(Q) = <b>${st.u}</b> (key ${kstr(st.key[st.u])}). ${p ? `The light edge (${p}, ${st.u}) = ${st.key[st.u]} joins the tree: it connects A to the isolated vertex ${st.u}.` : 'It is the root.'}`;
        if (last) en += ` Q = ∅: the order of tree edges was ${st.order.map(([a, b, w]) => `(${a}, ${b}) = ${w}`).join(', ')}; total weight <b>${total}</b>.`;
      } else {
        en = `For each v ∈ Adj[${st.u}] still in Q with w(${st.u}, v) &lt; key[v]: ` + st.chg.map(([v, o, w]) => `π[${v}] ← ${st.u}, key[${v}] ← ${w} (was ${kstr(o)})`).join('; ') + '.';
        if (st.kept.length) en += ' ' + st.kept.map(([v, o, w]) => `key[${v}] stays ${kstr(o)} (w = ${w})`).join('; ') + '.';
      }
      if (last && g.n === 'slide') en += ' These are the final keys of slide 26.';
      const inTree = (u, v) => (st.pi[u] === v && !st.inQ[u]) || (st.pi[v] === u && !st.inQ[v]);
      const cand = (u, v) => (st.pi[u] === v && st.inQ[u]) || (st.pi[v] === u && st.inQ[v]);
      const chg = new Set(st.t === 'upd' ? st.chg.map(c => c[0]) : []);
      const cols = { gridTemplateColumns: `auto repeat(${g.V.length}, 1fr)` };
      body = html`
        ${edit ? null : html`<div className="a17-row" style=${{ gap: '4px' }}><span className="a17-lab" style=${{ margin: 0, width: '100%' }}>Root (tap to restart from another vertex):</span>${g.V.map(v => html`<button key=${v} className=${'fig-btn' + (root === v ? ' sel' : '')} style=${{ padding: '3px 4px', minWidth: '29px' }} onClick=${() => setRoot(v)} aria-label=${'Start at ' + v}>${v}</button>`)}</div>`}
        <${GView} g=${g} showNames=${true} label="Prim's algorithm on the graph" nodeFill=${v => (st.inQ[v] ? RED : LIGHT)} nodeTextFill=${v => (st.inQ[v] ? '#fff' : 'var(--ink)')} nodeText=${v => kstr(st.key[v])}
          ring=${v => st.u === v} edgeKind=${(u, v) => (inTree(u, v) ? 'tree' : cand(u, v) ? 'cand' : '')} arrows=${g.V.filter(v => st.pi[v]).map(v => [v, st.pi[v]])} />
        <div className="a17-leg"><span><i className="a"></i>in A</span><span><i className="q"></i>in Q</span><span><s></s>tree edge</span><span><s className="d"></s>(v, π[v]), v in Q</span></div>
        <div className="a17-keys" style=${cols} aria-label="key and parent of each vertex">
          <div className="h">v</div>${g.V.map(v => html`<div key=${'v' + v} className=${'v' + (st.u === v ? ' cur' : '') + (st.inQ[v] ? '' : ' out')}>${v}</div>`)}
          <div className="h">key</div>${g.V.map(v => html`<div key=${'k' + v} className=${(chg.has(v) ? 'chg' : '') + (st.inQ[v] ? '' : ' out')}>${kstr(st.key[v])}</div>`)}
          <div className="h">π</div>${g.V.map(v => html`<div key=${'p' + v} className=${(chg.has(v) ? 'chg' : '') + (st.inQ[v] ? '' : ' out')}>${st.pi[v] || '·'}</div>`)}</div>`;
    }
    return html`<figure className="fig"><div className="fig-stage">
      <div className="a17-row">${[SLIDE, EXAM].map(G => html`<button key=${G.n} className=${'fig-btn' + (g === G ? ' sel' : '')} onClick=${() => load(G)}>${G.label}</button>`)}
        <button className=${'fig-btn' + (edit ? ' solid' : '') + (g.n === 'own' ? ' sel' : '')} onClick=${() => (edit ? go() : setEdit(true))}>${edit ? '✓ Run it' : '✎ Try your own'}</button></div>
      ${edit && html`<div><p className="a17-lab">Edges as name-name weight, separated by commas (up to 9 vertices and 20 edges, weights 0 to 99). ${alg === 'p' ? 'The first vertex is the root; tap another one after running.' : ''}</p>
        <textarea className=${'a17-in' + (parsed.err ? ' bad' : '')} rows="3" spellCheck="false" aria-label="Edges of your graph" value=${txt} onInput=${e => setTxt(e.target.value.slice(0, 400))}></textarea>
        ${parsed.err && html`<p className="a17-err" role="alert">${parsed.err}</p>`}</div>`}
      ${body}
    </div><${Cap} en=${en} /><${Bar} steps=${run} i=${i} ctl=${ctl} /></figure>`;
  }
  const Kruskal = () => html`<${MstSim} alg="k" />`, Prim = () => html`<${MstSim} alg="p" />`;

  /* ── slides 11-17: cut, light edge, and the safe-edge theorem ── */
  function CutTheorem() {
    const s = ([x, y]) => [Math.round((x - 930) * .62), Math.round((y - 230) * .62)];
    const raw = { n1: [1085, 342], n2: [1157, 330], n3: [1287, 352], u: [1028, 415], n4: [1168, 450], x: [1300, 453], v: [1028, 720], n5: [1193, 720], y: [1287, 757], n6: [1075, 803], n7: [1205, 840] };
    const N = Object.fromEntries(Object.entries(raw).map(([k, p]) => [k, s(p)]));
    const A = [['u', 'n1'], ['n1', 'n4'], ['n4', 'n3'], ['n2', 'n3'], ['n3', 'x']], TB = [['x', 'y'], ['v', 'n6'], ['n6', 'n5'], ['n5', 'n7'], ['n7', 'y']], other = [['n2', 'n6'], ['n4', 'n5'], ['x', 'n5']];
    const cyc = new Set(['u-n1', 'n1-n4', 'n4-n3', 'n3-x', 'x-y', 'n7-y', 'n5-n7', 'n6-n5', 'v-n6']);
    const steps = [
      { en: 'A <b>cut</b> (S, V − S) is a partition of V. An edge <b>crosses</b> the cut if one end is in S and the other in V − S. The cut <b>respects</b> A (the olive edges inside S) because no edge of A crosses it.' },
      { en: 'A <b>light edge</b> crossing the cut is one of minimum weight among the crossing edges: here (u, v). <b>Theorem:</b> if A is included in some MST and the cut respects A, then the light edge (u, v) is <b>safe</b> for A: A ∪ {(u, v)} is still part of an MST.' },
      { en: '<b>Proof.</b> Let T be an MST that includes A (all thick edges). If (u, v) is in T it is safe. If not, T must contain another edge (x, y) crossing S and V − S, since T connects u to v.' },
      { en: 'Add edge (u, v): together with T\'s path from u to v it creates a cycle (highlighted). Both (u, v) and (x, y) cross S and V − S on this cycle.' },
      { en: 'Remove edge (x, y) from the cycle: T′ = T − {(x, y)} ∪ {(u, v)} is again a spanning tree that includes A.' },
      { en: 'w(T′) = w(T) − w(x, y) + w(u, v), and w(u, v) ≤ w(x, y) because (u, v) is a light edge, so w(T′) ≤ w(T). T is an MST, so w(T′) = w(T): T′ is also an MST and (u, v) is safe for A. <b>Corollary</b> (slide 17): a light edge joining a tree C of the forest G<sub>A</sub> to another tree is safe, using the cut (V<sub>C</sub>, V − V<sub>C</sub>).' }
    ];
    const [i, ctl] = useSteps(steps.length, 2600);
    const L = ([a, b], k, st) => html`<line key=${k} x1=${N[a][0]} y1=${N[a][1]} x2=${N[b][0]} y2=${N[b][1]} strokeLinecap="round" ...${st} />`;
    const OL = 'color-mix(in srgb, var(--ink) 55%, #8a8a1a)', thickT = i >= 2;
    const removed = i >= 4;
    const fill = k => (k === 'u' || k === 'v' ? 'color-mix(in srgb, #7fb800 70%, var(--paper))' : k === 'x' || k === 'y' ? 'color-mix(in srgb, #f2b600 75%, var(--paper))' : 'var(--paper)');
    return html`<figure className="fig"><div className="fig-stage">
      <svg viewBox="0 0 290 440" style=${{ maxWidth: '300px' }} role="img" aria-label="Cut S and V minus S with the light edge u v and the edge x y of T">
        <ellipse cx="144" cy="110" rx="132" ry="79" fill="color-mix(in srgb, var(--fig-k) 10%, var(--paper))" stroke="var(--ink)" strokeWidth="1.3" />
        <ellipse cx="137" cy="327" rx="131" ry="84" fill="color-mix(in srgb, var(--fig-k) 10%, var(--paper))" stroke="var(--ink)" strokeWidth="1.3" />
        <text x="144" y="22" textAnchor="middle" fontSize="20" fontStyle="italic" fontWeight="700">S</text>
        <text x="137" y="434" textAnchor="middle" fontSize="20" fontStyle="italic" fontWeight="700">V − S</text>
        <text x="250" y="104" fontSize="18" fontStyle="italic" style=${{ fill: OL }}>A</text>
        ${thickT && html`<text x="252" y="262" fontSize="18" fontStyle="italic" style=${{ fill: OL }}>${removed ? 'T′' : 'T'}</text>`}
        ${i >= 3 && i <= 4 && [...A, ...TB].filter(([a, b]) => cyc.has(a + '-' + b)).map((e, k) => L(e, 'h' + k, { stroke: 'var(--fig-k)', strokeWidth: 11, strokeOpacity: .3 }))}
        ${i >= 3 && i <= 4 && L(['u', 'v'], 'huv', { stroke: 'var(--fig-k)', strokeWidth: 11, strokeOpacity: .3 })}
        ${other.map((e, k) => L(e, 'o' + k, { stroke: 'var(--ink)', strokeWidth: 1.2 }))}
        ${A.map((e, k) => L(e, 'a' + k, { stroke: OL, strokeWidth: 3.5 }))}
        ${TB.map((e, k) => { const xy = e[0] === 'x' && e[1] === 'y'; if (xy && removed) return L(e, 't' + k, { stroke: 'var(--ink)', strokeWidth: 1.2 });
          return L(e, 't' + k, thickT ? { stroke: OL, strokeWidth: 3.5 } : { stroke: 'var(--ink)', strokeWidth: 1.2 }); })}
        ${L(['u', 'v'], 'uv', { stroke: '#e8590c', strokeWidth: i >= 3 ? 3.5 : 2 })}
        <text x=${N.u[0] - 10} y="212" fontSize="17" fontStyle="italic" transform=${`rotate(-90 ${N.u[0] - 10} 212)`} textAnchor="middle" style=${{ fill: '#e8590c' }} className=${pop(i >= 1)}>light edge</text>
        ${Object.keys(N).map(k => html`<g key=${k}><circle cx=${N[k][0]} cy=${N[k][1]} r="16" fill=${fill(k)} stroke="var(--ink)" strokeWidth="1.4" />${['u', 'v', 'x', 'y'].includes(k) && html`<text x=${N[k][0]} y=${N[k][1] + 1} textAnchor="middle" dominantBaseline="middle" fontSize="18" fontWeight="700" fontStyle="italic" style=${{ fill: '#111' }}>${k}</text>`}</g>`)}
      </svg>
      ${i === 5 && html`<p className="a17-sum">w(T′) = w(T) − w(x, y) + w(u, v) ≤ w(T)</p>`}
    </div><${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  /* ── slides 20-21, 23 (Kruskal) and 25, 27 (Prim): running times ── */
  function Costs() {
    const K = [[0, 'A = ∅', ''], [0, 'for each vertex v in V[G]', 'mk'], [1, 'do MAKE-SET(v)', 'mk'], [0, 'sort the edges of E in nondecreasing order by weight w', 'sort'],
      [0, 'for each edge (u, v) in E, taken in nondecreasing order by weight', 'loop'], [1, 'do if FIND-SET(u) ≠ FIND-SET(v)', 'loop'], [2, 'then A = A ∪ {(u, v)}', 'loop'], [3, 'UNION(u, v)', 'loop'], [0, 'return A', '']];
    const P = [[0, 'for each u in V[G]', 'init'], [1, 'do key[u] = ∞', 'init'], [1, 'π[u] = NIL', 'init'], [0, 'key[r] = 0', 'init'], [0, 'Q = V[G]', 'init'],
      [0, 'while Q ≠ ∅', 'ext'], [1, 'do u = EXTRACT-MIN(Q)', 'ext'], [2, 'for each v in Adj[u]', 'dk'], [3, 'do if v in Q and w(u, v) < key[v]', 'dk'], [4, 'then π[v] = u', 'dk'], [5, 'key[v] = w(u, v)', 'dk']];
    const steps = [
      { c: 'K', en: 'MST-KRUSKAL (slide 20). How long does each part take?', on: [], tags: {} },
      { c: 'K', en: 'MAKE-SET once per vertex: <b>O(V)</b>.', on: ['mk'], tags: { mk: 'O(V)' } },
      { c: 'K', en: 'Sorting the |E| edges: <b>O(E lg E)</b>.', on: ['sort'], tags: { mk: 'O(V)', sort: 'O(E lg E)' } },
      { c: 'K', en: 'The loop does O(E) FIND-SET and UNION operations on the disjoint-set forest: <b>O(E lg V)</b>.', on: ['loop'], tags: { mk: 'O(V)', sort: 'O(E lg E)', loop: 'O(E lg V)' } },
      { c: 'K', en: 'T(n) = O(1) + O(V) + O(E lg E) + O(E lg V). Since E ≤ V · V, lg E ≤ 2 lg V, so Kruskal is O(E lg E), which you can also write <b>O(E lg V)</b> (slide 23: O((V + E) lg V) = O(E lg V)).', on: [], tags: { mk: 'O(V)', sort: 'O(E lg E)', loop: 'O(E lg V)' }, sum: 'O(1) + O(V) + O(E lg E) + O(E lg V) = O(E lg V)' },
      { c: 'P', en: 'PRIM with Q as a min-heap (slides 25, 27). The initialisation is O(V); building the min-heap of V keys is also O(V).', on: ['init'], tags: { init: 'O(V), also build min-heap' } },
      { c: 'P', en: 'The while loop runs V times and each EXTRACT-MIN costs O(lg V): <b>O(V lg V)</b>.', on: ['ext'], tags: { init: 'O(V), also build min-heap', ext: 'O(lg V) each: O(V lg V)' } },
      { c: 'P', en: 'Over the whole run the inner loop looks at each edge from both ends, and each key change is a heap DECREASE-KEY of O(lg V): <b>O(E lg V)</b>. Total O(V) + O(V lg V) + O(E lg V) = <b>O(E lg V)</b>.', on: ['dk'], tags: { init: 'O(V), also build min-heap', ext: 'O(lg V) each: O(V lg V)', dk: 'O(lg V) each: O(E lg V)' }, sum: 'O(V) + O(V lg V) + O(E lg V) = O(E lg V)' }
    ];
    const [i, ctl] = useSteps(steps.length, 2600);
    const s = steps[i], code = s.c === 'K' ? K : P;
    return html`<figure className="fig"><div className="fig-stage">
      <div className="a17-code" aria-label=${s.c === 'K' ? 'MST-KRUSKAL with costs' : 'PRIM with costs'}><div className="hd">${s.c === 'K' ? 'MST-KRUSKAL(G, w)' : 'PRIM(G, w, r)'}</div>
        ${code.map(([d, t, g], k) => html`<div key=${s.c + k} className=${'l' + (g && s.on.includes(g) ? ' on' : '')} style=${{ paddingLeft: (4 + d * 12) + 'px' }}><span className="t">${t}</span>${g && s.tags[g] && k === code.findIndex(c => c[2] === g) && html`<span className="tag">${s.tags[g]}</span>`}</div>`)}</div>
      ${s.sum && html`<p className="a17-sum">${s.sum}</p>`}
    </div><${Cap} en=${s.en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  // ── binary trees: { l, r } internal, { n } leaf; layout by leaf order, depth by level
  function layTree(t, W, top, gapY, leavesBottom) {
    const leaves = []; const walk = (n, d) => { n.d = d; if (n.l) { walk(n.l, d + 1); walk(n.r, d + 1); } else leaves.push(n); }; walk(t, 0);
    const maxD = Math.max(...leaves.map(n => n.d)), gx = W / leaves.length;
    leaves.forEach((n, k) => { n.x = gx * (k + .5); n.y = top + (leavesBottom ? maxD : n.d) * gapY; });
    const pos = n => { if (!n.l) return; pos(n.l); pos(n.r); n.x = (n.l.x + n.r.x) / 2; n.y = top + n.d * gapY; }; pos(t);
    const all = []; const col = n => { all.push(n); if (n.l) { col(n.l); col(n.r); } }; col(t);
    return { all, H: top + maxD * gapY, leaves };
  }
  function SmallTree({ t, hl, label }) {
    const { all, H } = layTree(t, 230, 22, 48);
    return html`<svg viewBox=${`0 0 230 ${H + 24}`} role="img" aria-label=${label}>
      ${all.filter(n => n.l).map((n, k) => html`<g key=${'e' + k}><line x1=${n.x} y1=${n.y} x2=${n.l.x} y2=${n.l.y} stroke="var(--ink)" strokeWidth="1.5" /><line x1=${n.x} y1=${n.y} x2=${n.r.x} y2=${n.r.y} stroke="var(--ink)" strokeWidth="1.5" /></g>`)}
      ${all.map((n, k) => html`<g key=${k}><ellipse cx=${n.x} cy=${n.y} rx="19" ry="15" fill=${hl[n.n] === 'in' ? 'color-mix(in srgb, #f2d600 55%, var(--paper))' : hl[n.n] === 'leaf' ? 'color-mix(in srgb, #3fd0e0 40%, var(--paper))' : 'var(--paper)'} stroke="var(--ink)" strokeWidth="1.3" />
        <text x=${n.x} y=${n.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="19">${n.n}</text></g>`)}
    </svg>`;
  }
  const lf = n => ({ n }), nd = (n, l, r) => ({ n, l, r });

  /* ── slides 31-33, 35-36: full binary trees, |C| leaves and |C| − 1 internal nodes ── */
  function FullTrees() {
    const S = [
      { trees: [[lf('1'), {}, 'Tree for 1 letter']], en: '<b>Basis</b>, C = 1: one letter needs only 1 leaf node and 0 internal nodes. (An optimal code is always a <b>full</b> binary tree: every nonleaf node has two children.)' },
      { trees: [[nd('A', lf('1'), lf('2')), { A: 'in', 2: 'leaf' }, 'Tree for 2 letters']], en: 'Add letter 2: a new internal node A gets the old leaf 1 and the new leaf 2 as children. 2 leaves, 1 internal node.' },
      { trees: [[nd('B', lf('3'), nd('A', lf('1'), lf('2'))), { B: 'in', 3: 'leaf' }, 'new root B'], [nd('A', lf('1'), nd('B', lf('2'), lf('3'))), { B: 'in', 3: 'leaf' }, 'leaf 2 replaced by B']],
        en: 'Tree for 3 letters, two ways to add leaf L = 3: a <b>new root</b> R = B with L and the old root as children, or <b>replace a leaf</b> N = 2 by an internal node B with L and N as children. Either way: 3 leaves, 2 internal nodes.' },
      { trees: [[nd('B', nd('C', lf('4'), lf('3')), nd('A', lf('1'), lf('2'))), { C: 'in', 4: 'leaf' }, 'leaf 3 replaced by C'], [nd('C', lf('4'), nd('B', lf('3'), nd('A', lf('1'), lf('2')))), { C: 'in', 4: 'leaf' }, 'new root C']],
        en: 'Tree for 4 letters, from the tree B(3, A(1, 2)): replace leaf 3 by C(4, 3), or put a new root C above it. 4 leaves, 3 internal nodes.' },
      { trees: [[nd('B', nd('C', nd('D', lf('5'), lf('4')), lf('3')), nd('A', lf('1'), lf('2'))), { D: 'in', 5: 'leaf' }, 'leaf 4 replaced by D'], [nd('D', lf('5'), nd('B', nd('C', lf('4'), lf('3')), nd('A', lf('1'), lf('2')))), { D: 'in', 5: 'leaf' }, 'new root D']],
        en: 'Tree for 5 letters, from B(C(4, 3), A(1, 2)): replace leaf 4 by D(5, 4), or a new root D. 5 leaves, 4 internal nodes.' },
      { trees: [[nd('B', nd('C', nd('D', lf('5'), lf('4')), lf('3')), nd('A', lf('1'), lf('2'))), {}, '5 leaves, 4 internal']],
        en: '<b>Theorem</b> (by induction): a full binary tree for an optimal prefix code for C letters has exactly <b>C leaves</b> and exactly <b>C − 1 internal nodes</b>. Each step adds one leaf and one internal node, so from C letters (C leaves, C − 1 internal) we reach C + 1 leaves and C internal nodes.' }
    ];
    const [i, ctl] = useSteps(S.length, 2800);
    const n = [1, 2, 3, 4, 5, 5][i];
    return html`<figure className="fig"><div className="fig-stage">
      <div className="a17-trees">${S[i].trees.map(([t, hl, cap], k) => html`<figure key=${i + '-' + k}><${SmallTree} t=${t} hl=${hl} label=${cap} /><figcaption>${cap}</figcaption></figure>`)}</div>
      <p className="a17-sum">${n} leaves, ${n - 1} internal node${n - 1 === 1 ? '' : 's'}</p>
      <div className="a17-leg"><span><i style=${{ background: 'color-mix(in srgb, #f2d600 55%, var(--paper))' }}></i>new internal node</span><span><i style=${{ background: 'color-mix(in srgb, #3fd0e0 40%, var(--paper))' }}></i>new leaf</span></div>
    </div><${Cap} en=${S[i].en} /><${Bar} steps=${S} i=${i} ctl=${ctl} /></figure>`;
  }

  // ── Huffman trees drawn like the slides: leaves on the bottom row, 0 on left edges, 1 on right edges
  function HuffTree({ t, shown, codes, label, W = 360 }) {
    const { all, H, leaves } = layTree(t, W, 22, 56, true);
    const vis = n => !n.l || shown.has(n.id);
    return html`<svg viewBox=${`0 0 ${W} ${H + (codes ? 58 : 36)}`} role="img" aria-label=${label}>
      ${all.filter(n => n.l && vis(n)).map((n, k) => html`<g key=${'e' + n.id} className="pop">
        <line x1=${n.x} y1=${n.y + 12} x2=${n.l.x} y2=${n.l.y - (n.l.l ? 12 : 16)} stroke="var(--ink)" strokeWidth="1.4" />
        <line x1=${n.x} y1=${n.y + 12} x2=${n.r.x} y2=${n.r.y - (n.r.l ? 12 : 16)} stroke="var(--ink)" strokeWidth="1.4" />
        <text x=${(n.x + n.l.x) / 2 - 9} y=${(n.y + n.l.y) / 2} textAnchor="middle" fontSize="16" style=${{ fill: '#e8590c' }}>0</text>
        <text x=${(n.x + n.r.x) / 2 + 9} y=${(n.y + n.r.y) / 2} textAnchor="middle" fontSize="16" style=${{ fill: '#e8590c' }}>1</text></g>`)}
      ${all.filter(n => n.l && vis(n)).map(n => html`<g key=${'n' + n.id}><rect x=${n.x - 20} y=${n.y - 12} width="40" height="24" rx="4" fill=${n.hot ? LIGHT : 'var(--paper)'} stroke="var(--fig-k)" strokeWidth=${n.hot ? 2.5 : 1.3} /><text x=${n.x} y=${n.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="16" fontWeight="700">${n.f}</text></g>`)}
      ${leaves.map(n => html`<g key=${'l' + n.id}><rect x=${n.x - 22} y=${n.y - 16} width="44" height="38" rx="4" fill=${n.hot ? LIGHT : 'var(--paper)'} stroke="var(--fig-k)" strokeWidth=${n.hot ? 2.5 : 1.3} />
        <text x=${n.x} y=${n.y - 3} textAnchor="middle" dominantBaseline="middle" fontSize="16" fontWeight="700">${n.c}</text><text x=${n.x} y=${n.y + 13} textAnchor="middle" dominantBaseline="middle" fontSize="16">${n.f}</text>
        ${codes && html`<text x=${n.x} y=${n.y + 40} textAnchor="middle" fontSize="16" fontWeight="700" style=${{ fill: '#e8590c', fontFamily: 'var(--mono)' }}>${codes[n.c]}</text>`}</g>`)}
    </svg>`;
  }
  const codesOf = t => { const m = {}; const w = (n, s) => { if (n.l) { w(n.l, s + '0'); w(n.r, s + '1'); } else m[n.c] = s || '0'; }; w(t, ''); return m; };
  const depthOf = t => { const m = {}; const w = (n, d) => { if (n.l) { w(n.l, d + 1); w(n.r, d + 1); } else m[n.c] = d; }; w(t, 0); return m; };

  /* ── slides 29-30, 34: prefix codes and the slide's Huffman tree ── */
  function HuffSlide() {
    let id = 0; const L = (c, f) => ({ c, f, id: id++ }), I = (f, l, r, nm) => ({ f, l, r, id: id++, nm });
    const ka = L('ก', 36), kb = L('ข', 17), kc = L('ค', 17), kd = L('ง', 15), ke = L('จ', 10), kf = L('ฉ', 5);
    const z15 = I(15, ke, kf, 'จฉ'), z30 = I(30, kd, z15, 'งจฉ'), z34 = I(34, kb, kc, 'ขค'), z64 = I(64, z34, z30, 'ขคงจฉ'), root = I(100, ka, z64, 'กขคงจฉ');
    const order = [z15, z30, z34, z64, root], codes = codesOf(root);
    const steps = [
      { pc: 1, en: 'A <b>prefix code</b>: no codeword is also a prefix of some other codeword, so a file can be decoded without separators. {0, 110, 101, 111, 1000, 1001} is a prefix code.' },
      { pc: 2, en: '{0, 110, 101, 111, 1010, 0111} is <b>not</b> a prefix code: 0 is a prefix of 0111. Optimality: the code should give the file with the minimum number of bits.' },
      { k: 0, en: 'The slide\'s file: six characters with frequencies ก 36, ข 17, ค 17, ง 15, จ 10, ฉ 5 (total 100). Each starts as its own one-node tree.' },
      { k: 1, en: 'The two least frequent, จ 10 and ฉ 5, become the children of a new node จฉ: 10 + 5 = 15.' },
      { k: 2, en: 'Now the least are ง 15 and จฉ 15: merge them into งจฉ: 15 + 15 = 30.' },
      { k: 3, en: 'Next ข 17 and ค 17: merge into ขค: 17 + 17 = 34.' },
      { k: 4, en: 'Next ขค 34 and งจฉ 30: merge into ขคงจฉ: 34 + 30 = 64.' },
      { k: 5, en: 'Finally ก 36 and ขคงจฉ 64 give the root, 100. Reading 0 on each left edge and 1 on each right edge gives the codewords: ก 0, ข 100, ค 101, ง 110, จ 1110, ฉ 1111: the prefix code of the first step.' },
      { k: 5, c: 1, en: 'Cost of the file: B(T) = Σ f(c) d<sub>T</sub>(c) = 36·1 + 17·3 + 17·3 + 15·3 + 10·4 + 5·4 = <b>243</b> bits per 100 characters, 2.43 bits each (a fixed 3-bit code needs 300). The slide draws 34 left of 30 and จ left of ฉ; HUFFMAN(C) on slide 37 puts the smaller x on the left, which swaps some bits but keeps every length and B(T).' }
    ];
    const [i, ctl] = useSteps(steps.length, 2600);
    const s = steps[i];
    const sets = [['0', '110', '101', '111', '1000', '1001'], ['0', '110', '101', '111', '1010', '0111']];
    if (s.pc) return html`<figure className="fig"><div className="fig-stage"><div className="a17-pc">
        ${sets.map((set, k) => html`<div key=${k} className=${pop(k < s.pc)}><div className="set">${set.map((w, j) => html`<span key=${j} className=${k === 1 && s.pc === 2 && (w === '0' || w === '0111') ? 'hit' : ''}>${w}</span>`)}</div>
          <div>${k === 0 ? html`<span className="ok">✓ prefix code</span>` : html`<span className="bad">✗ not a prefix code</span>: 0 is a prefix of 0111`}</div></div>`)}</div>
      </div><${Cap} en=${s.en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
    const shown = new Set(order.slice(0, s.k).map(n => n.id));
    order.forEach((n, k) => { n.hot = k === s.k - 1; }); [ka, kb, kc, kd, ke, kf].forEach(n => { n.hot = (s.k >= 1 && (order[s.k - 1].l === n || order[s.k - 1].r === n)); });
    return html`<figure className="fig"><div className="fig-stage">
      <${HuffTree} t=${root} shown=${shown} codes=${s.k === 5 ? codes : null} label="Huffman tree of the slide example" />
      ${s.k >= 1 && s.k < 5 && html`<p className="a17-sum">new node ${order[s.k - 1].nm}: ${order[s.k - 1].l.f} + ${order[s.k - 1].r.f} = <b>${order[s.k - 1].f}</b></p>`}
      ${s.c && html`<p className="a17-sum">B(T) = 36·1 + 17·3 + 17·3 + 15·3 + 10·4 + 5·4 = <b>243</b></p>`}
    </div><${Cap} en=${s.en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  /* ── slide 37: HUFFMAN(C) step by step, with presets and "try your own" ── */
  const HPRE = [
    { label: 'Example from the slides', n: 'slide', txt: 'ก 36, ข 17, ค 17, ง 15, จ 10, ฉ 5' },
    { label: 'Final 2018 (A to F)', n: 'exam', txt: 'A 20, B 30, C 15, D 5, E 8, F 22' }
  ];
  function parseFreq(txt) {
    const parts = txt.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean), out = [];
    for (const p of parts) { const m = p.match(/^(\S{1,2})\s*[:=\s]\s*(\d{1,3})$/u); if (!m) throw new Error(`"${p}" should be a character and its frequency, like A 20.`); if (+m[2] < 1) throw new Error('Frequencies must be at least 1.'); if (out.some(o => o.c === m[1])) throw new Error(`${m[1]} appears twice.`); out.push({ c: m[1], f: +m[2] }); }
    if (out.length < 2) throw new Error('Give at least 2 characters.'); if (out.length > 8) throw new Error('At most 8 characters, so the tree fits a phone.');
    return out;
  }
  function huffRun(C) {
    let id = 0, seq = 0; const Q = C.map(x => ({ c: x.c, f: x.f, id: id++, seq: seq++ }));
    const pick = () => { let b = 0; Q.forEach((n, k) => { if (n.f < Q[b].f || (n.f === Q[b].f && n.seq < Q[b].seq)) b = k; }); return Q.splice(b, 1)[0]; };
    const name = n => (n.l ? name(n.l) + name(n.r) : n.c);
    const steps = [{ Q: Q.slice() }], made = [];
    for (let k = 1; k < C.length; k++) { const x = pick(), y = pick(), z = { f: x.f + y.f, l: x, r: y, id: id++, seq: seq++ }; z.nm = name(z); Q.push(z); made.push(z); steps.push({ x, y, z, Q: Q.slice() }); }
    return { steps, root: Q[0], made };
  }
  function HuffSim() {
    const [txt, setTxt] = useState(HPRE[0].txt), [cur, setCur] = useState(HPRE[0].txt), [edit, setEdit] = useState(false);
    const parsed = useMemo(() => { try { return { C: parseFreq(txt) }; } catch (e) { return { err: e.message }; } }, [txt]);
    const C = useMemo(() => parseFreq(cur), [cur]);
    const R = useMemo(() => huffRun(C), [C]);
    const n = C.length, nSteps = n + 1;
    const [i0, ctl] = useSteps(nSteps, 2200);
    const i = Math.min(i0, nSteps - 1), first = useRef(true);
    useEffect(() => { if (first.current) { first.current = false; return; } ctl.replay(); }, [cur]);
    const pre = HPRE.find(p => p.txt === cur);
    const st = i < n ? R.steps[i] : R.steps[n - 1], fin = i === n;
    const shown = new Set(R.made.slice(0, Math.min(i, n - 1)).map(z => z.id));
    const codes = codesOf(R.root), dep = depthOf(R.root), tot = C.reduce((s, x) => s + x.f, 0), B = C.reduce((s, x) => s + x.f * dep[x.c], 0);
    const walk = nn => { nn.hot = false; if (nn.l) { walk(nn.l); walk(nn.r); } }; walk(R.root);
    if (i >= 1 && i < n) { st.z.hot = true; st.x.hot = true; st.y.hot = true; }
    const fmt = x => (Math.round(x * 100) / 100).toString();
    let en;
    if (i === 0) en = `n = |C| = ${n}; Q ← C, a min-priority queue keyed on frequency (built in O(n) as a min-heap). The loop will run n − 1 = ${n - 1} times.`;
    else if (!fin) en = `i = ${i}: allocate a new node z; z.left = x = EXTRACT-MIN(Q) = ${st.x.l ? st.x.nm : st.x.c} (${st.x.f}); z.right = y = EXTRACT-MIN(Q) = ${st.y.l ? st.y.nm : st.y.c} (${st.y.f}); z.f = ${st.x.f} + ${st.y.f} = <b>${st.z.f}</b>; INSERT(Q, z).${R.steps[i - 1].Q.some(q => q !== st.x && q !== st.y && (q.f === st.x.f || q.f === st.y.f)) || st.x.f === st.y.f ? ' Ties go to the node that entered Q first.' : ''}`;
    else en = `Return EXTRACT-MIN(Q), the root (${R.root.f}). With 0 for left and 1 for right: ${C.map(x => `${x.c} = ${codes[x.c]}`).join(', ')}. B(T) = ${C.map(x => `${x.f}·${dep[x.c]}`).join(' + ')} = <b>${B}</b>, so ${fmt(B / tot)} bits per character on average. n − 1 EXTRACT-MIN/INSERT pairs of O(lg n): O(n lg n).`;
    if (fin && pre && pre.n === 'slide') en += ' The slide draws 34 left of 30 and จ left of ฉ (ข 100, ค 101, ง 110, จ 1110, ฉ 1111): the same lengths and the same B(T).';
    if (fin && pre && pre.n === 'exam') en += ' This matches the notes: A 00, F 01, B 11, C 101, D 1000, E 1001, 2.41 bits per character.';
    const Qshow = (i === 0 ? R.steps[0].Q : st.Q).slice().sort((a, b) => a.f - b.f || a.seq - b.seq);
    return html`<figure className="fig"><div className="fig-stage">
      <div className="a17-row">${HPRE.map(p => html`<button key=${p.n} className=${'fig-btn' + (cur === p.txt ? ' sel' : '')} onClick=${() => { setCur(p.txt); setTxt(p.txt); setEdit(false); }}>${p.label}</button>`)}
        <button className=${'fig-btn' + (edit ? ' solid' : '') + (!pre ? ' sel' : '')} onClick=${() => { if (!edit) return setEdit(true); if (parsed.C) { setCur(txt); setEdit(false); } }}>${edit ? '✓ Run it' : '✎ Try your own'}</button></div>
      ${edit && html`<div><p className="a17-lab">Characters and frequencies, like A 20, B 30 (2 to 8 characters, frequencies 1 to 999).</p>
        <textarea className=${'a17-in' + (parsed.err ? ' bad' : '')} rows="2" spellCheck="false" aria-label="Characters and frequencies" value=${txt} onInput=${e => setTxt(e.target.value.slice(0, 200))}></textarea>
        ${parsed.err && html`<p className="a17-err" role="alert">${parsed.err}</p>`}</div>`}
      <${HuffTree} t=${R.root} shown=${shown} codes=${fin ? codes : null} label="Huffman tree being built" />
      <div className="a17-q" aria-label="priority queue"><b>Q:</b>${Qshow.map(q => html`<span key=${q.id} className=${i >= 1 && !fin && q === st.z ? 'z' : ''}>${q.l ? q.nm : q.c} ${q.f}</span>`)}</div>
      ${fin && html`<table className="a17-codes"><thead><tr><th>c</th>${C.map(x => html`<th key=${x.c}>${x.c}</th>`)}</tr></thead><tbody>
        <tr><td>f</td>${C.map(x => html`<td key=${x.c}>${x.f}</td>`)}</tr><tr><td>code</td>${C.map(x => html`<td key=${x.c} className="cw">${codes[x.c]}</td>`)}</tr><tr><td>d</td>${C.map(x => html`<td key=${x.c}>${dep[x.c]}</td>`)}</tr></tbody></table>`}
    </div><${Cap} en=${en} /><${Bar} steps=${Array(nSteps).fill(0)} i=${i} ctl=${ctl} /></figure>`;
  }

  /* ── slides 38-42: greedy choice of Huffman, the exchange argument ── */
  function HuffExchange() {
    // positions of the four leaves in the slide's tree: root → (n1, slot P), n1 → (slot Q, n2), n2 → (slot R, slot S)
    const slot = { P: [190, 74], Q: [60, 124], R: [130, 174], S: [210, 174] }, depth = { P: 1, Q: 2, R: 3, S: 3 };
    const at = [{ x: 'P', y: 'Q', a: 'R', b: 'S' }, { x: 'R', y: 'Q', a: 'P', b: 'S' }, { x: 'R', y: 'S', a: 'P', b: 'Q' }];
    const steps = [
      { t: 0, en: '<b>Greedy-choice property</b>: let x and y be the two characters with the lowest frequencies. Then some optimal prefix code gives x and y codewords of the same length that differ only in the last bit.' },
      { t: 0, en: 'Take the tree T of an arbitrary optimal code, and let a and b be sibling leaves of maximum depth. Here d<sub>T</sub>(x) = 1, d<sub>T</sub>(y) = 2, d<sub>T</sub>(a) = d<sub>T</sub>(b) = 3.' },
      { t: 0, en: 'Assume f[a] ≤ f[b] and f[x] ≤ f[y]. x and y have the two lowest frequencies, so f[x] ≤ f[a] and f[y] ≤ f[b].' },
      { t: 1, en: 'Exchange a and x to get T′. B(T) − B(T′) = f[x]d<sub>T</sub>(x) + f[a]d<sub>T</sub>(a) − f[x]d<sub>T</sub>(a) − f[a]d<sub>T</sub>(x) = (f[a] − f[x])(d<sub>T</sub>(a) − d<sub>T</sub>(x)) = (f[a] − f[x])(3 − 1) ≥ 0.', f: 'B(T) − B(T′) = (f[a] − f[x])(d<sub>T</sub>(a) − d<sub>T</sub>(x)) ≥ 0' },
      { t: 2, en: 'Then exchange b and y in T′ to get T″. Similarly it does not increase the cost: B(T′) − B(T″) ≥ 0, so B(T″) ≤ B(T). T is optimal, so B(T) ≤ B(T″), hence B(T″) = B(T): T″ is an optimal tree in which x and y are sibling leaves of maximum depth.', f: 'B(T″) ≤ B(T′) ≤ B(T), and T optimal ⇒ B(T″) = B(T)' }
    ];
    const [i, ctl] = useSteps(steps.length, 2800);
    const s = steps[i], pos = at[s.t];
    const col = c => (c === 'x' || c === 'y' ? 'color-mix(in srgb, #ffb347 70%, var(--paper))' : 'color-mix(in srgb, #a8b84a 65%, var(--paper))');
    const L = (a, b) => html`<line x1=${a[0]} y1=${a[1]} x2=${b[0]} y2=${b[1]} stroke="var(--ink)" strokeWidth="1.5" />`;
    const root = [150, 24], n1 = [100, 74], n2 = [170, 124];
    return html`<figure className="fig"><div className="fig-stage">
      <svg viewBox="0 0 270 205" style=${{ maxWidth: '330px' }} role="img" aria-label="Tree with leaves x, y, a, b being exchanged">
        ${L(root, n1)}${L(root, slot.P)}${L(n1, slot.Q)}${L(n1, n2)}${L(n2, slot.R)}${L(n2, slot.S)}
        ${[root, n1, n2].map((p, k) => html`<circle key=${k} cx=${p[0]} cy=${p[1]} r="15" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1.4" />`)}
        ${['x', 'y', 'a', 'b'].map(c => { const p = slot[pos[c]]; return html`<g key=${c} style=${{ transform: `translate(${p[0]}px, ${p[1]}px)`, transition: calm() ? 'none' : 'transform .8s ease' }}>
          <circle r="15" fill=${col(c)} stroke="var(--ink)" strokeWidth="1.4" /><text y="1" textAnchor="middle" dominantBaseline="middle" fontSize="19" fontStyle="italic" style=${{ fill: '#111' }}>${c}</text></g>`; })}
        ${i >= 1 && Object.entries(depth).map(([k, d]) => html`<text key=${k} x=${slot[k][0] + (k === 'Q' ? -22 : 22)} y=${slot[k][1] + 5} textAnchor=${k === 'Q' ? 'end' : 'start'} fontSize="16" style=${{ fill: 'var(--graphite)' }}>d=${d}</text>`)}
        <text x="10" y="30" fontSize="20" fontStyle="italic">${['T', 'T′', 'T″'][s.t]}</text>
      </svg>
      ${s.f && html`<p className="a17-sum" dangerouslySetInnerHTML=${{ __html: s.f }}></p>`}
    </div><${Cap} en=${s.en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  /* ── slides 43-46: optimal substructure of Huffman, shown with the numbers of the slide-30 example ── */
  function HuffSub() {
    let id = 0; const L = (c, f) => ({ c, f, id: id++ }), I = (f, l, r) => ({ f, l, r, id: id++ });
    const mk = expand => { const z = expand ? I(15, L('จ', 10), L('ฉ', 5)) : L('z', 15); const r = I(100, L('ก', 36), I(64, I(34, L('ข', 17), L('ค', 17)), I(30, L('ง', 15), z))); return { r, z }; };
    const Tp = mk(false), T = mk(true), all = t => { const o = []; const w = n => { o.push(n.id); if (n.l) { w(n.l); w(n.r); } }; w(t); return new Set(o); };
    const steps = [
      { t: 0, en: 'Let x, y be the two characters of C with minimum frequency, and C′ = C − {x, y} ∪ {z} with f[z] = f[x] + f[y]. With the slide-30 numbers: x = ฉ 5, y = จ 10, z = 15. T′ is an optimal tree for C′.' },
      { t: 1, en: 'Replace the leaf z of T′ by an internal node with children x and y: this is the tree T for C. The theorem says T is optimal for C.' },
      { t: 1, en: 'For every other c, d<sub>T</sub>(c) = d<sub>T′</sub>(c). And d<sub>T</sub>(x) = d<sub>T</sub>(y) = d<sub>T′</sub>(z) + 1, so f[x]d<sub>T</sub>(x) + f[y]d<sub>T</sub>(y) = (f[x] + f[y])(d<sub>T′</sub>(z) + 1) = f[z]d<sub>T′</sub>(z) + (f[x] + f[y]). Here (5 + 10)(3 + 1) = 60 = 15·3 + 15.', f: 'B(T) = B(T′) + f[x] + f[y]: 243 = 228 + 5 + 10' },
      { t: 1, en: 'Proof by contradiction: if T were not optimal for C, some T″ has B(T″) &lt; B(T), with x and y as siblings (without loss of generality). Let T‴ be T″ with the parent of x and y replaced by a leaf z: B(T‴) = B(T″) − f[x] − f[y] &lt; B(T) − f[x] − f[y] = B(T′). That contradicts T′ being optimal for C′, so T is optimal for C.', f: 'B(T‴) = B(T″) − f[x] − f[y] &lt; B(T) − f[x] − f[y] = B(T′)' }
    ];
    const [i, ctl] = useSteps(steps.length, 2900);
    const s = steps[i], cur = s.t ? T : Tp;
    cur.z.hot = true; if (cur.z.l) { cur.z.l.hot = true; cur.z.r.hot = true; }
    return html`<figure className="fig"><div className="fig-stage">
      <${HuffTree} key=${s.t} t=${cur.r} shown=${all(cur.r)} label=${s.t ? 'Tree T for C' : 'Tree T prime for C prime'} />
      <p className="a17-sum">${s.t ? html`B(T) = 36·1 + 17·3 + 17·3 + 15·3 + 10·4 + 5·4 = <b>243</b>` : html`B(T′) = 36·1 + 17·3 + 17·3 + 15·3 + 15·3 = <b>228</b>`}</p>
      ${s.f && html`<p className="a17-sum" dangerouslySetInnerHTML=${{ __html: s.f }}></p>`}
    </div><${Cap} en=${s.en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  // ── activities: the slide-49 example (times read off the slide's grid, one unit per grid line; the slide's colours)
  const HUES = ['#33669a', '#9966ff', '#ff5555', '#ff9900', '#e6d300', '#669900', '#006600', '#00e08a', '#00bbee', '#ff99cc', '#ee1111', '#993300'];
  const ACTS = [[0, 3], [1, 9], [2, 4], [3, 4], [4, 7], [4, 6], [5, 8], [7, 12], [8, 11], [8, 10], [9, 12], [10, 12]].map(([s, f], k) => ({ s, f, n: 'a' + (k + 1), c: HUES[k] }));
  function Gantt({ rows, T, label, gx = 26, lab = 40, rh = 22, line, extra, ticks = true }) {
    const lbl = t => { const [m, sb] = String(t).split('_'); return sb ? html`${m}<tspan dy="5" fontSize="16">${sb}</tspan>` : m; };
    const W = lab + T * gx + 8, H = rows.length * rh + 34;
    return html`<svg viewBox=${`0 0 ${W} ${H}`} role="img" aria-label=${label}>
      ${Array.from({ length: T + 1 }, (_, t) => html`<line key=${'g' + t} x1=${lab + t * gx} x2=${lab + t * gx} y1="2" y2=${rows.length * rh + 4} stroke="var(--line)" strokeWidth="1" />`)}
      ${ticks && Array.from({ length: T + 1 }, (_, t) => (t % (T > 12 ? 4 : 2) === 0 ? html`<text key=${'t' + t} x=${lab + t * gx} y=${rows.length * rh + 24} textAnchor="middle" fontSize="16" style=${{ fill: 'var(--graphite)' }}>${t}</text>` : null))}
      ${line != null && html`<line x1=${lab + line * gx} x2=${lab + line * gx} y1="0" y2=${rows.length * rh + 6} stroke="var(--fig-k)" strokeWidth="3" strokeDasharray="5 4" />`}
      ${rows.map((r, k) => r && html`<g key=${k} style=${{ opacity: r.dim ? .25 : 1, transition: 'opacity .4s' }}>
        ${r.label && html`<text x=${lab - 6} y=${k * rh + rh / 2 + 3} textAnchor="end" dominantBaseline="middle" fontSize="16" fontStyle="italic" fontWeight=${r.bold ? 700 : 400}>${lbl(r.label)}</text>`}
        ${(r.bars || [r]).map((b, j) => html`<rect key=${j} x=${lab + b.s * gx} y=${k * rh + 5} width=${Math.max(2, (b.f - b.s) * gx)} height=${rh - 8} fill=${b.c} stroke=${b.ring ? 'var(--ink)' : 'rgba(0,0,0,.35)'} strokeWidth=${b.ring ? 3 : 1} />`)}</g>`)}
      ${extra}
    </svg>`;
  }

  /* ── slides 48-49: the activity-selection problem and the slide example ── */
  function ActExample() {
    const pick = [null, ['a1', 'a4', 'a7', 'a10', 'a12'], ['a1', 'a4', 'a5', 'a10', 'a12'], ['a1', 'a4', 'a6', 'a10', 'a12']];
    const steps = [
      { en: 'S = {a<sub>1</sub>, …, a<sub>12</sub>}: activities that want the same resource, one at a time. a<sub>i</sub> takes the half-open interval [s<sub>i</sub>, f<sub>i</sub>); a<sub>i</sub> and a<sub>j</sub> are <b>compatible</b> if their intervals do not overlap. (Times are read off the slide\'s grid, one unit per line.)' },
      { en: 'A<sub>1</sub> = {a<sub>1</sub>, a<sub>4</sub>, a<sub>7</sub>, a<sub>10</sub>, a<sub>12</sub>}: [0, 3), [3, 4), [5, 8), [8, 10), [10, 12). Touching ends are fine because the intervals are half-open. 5 activities.' },
      { en: 'A<sub>2</sub> = {a<sub>1</sub>, a<sub>4</sub>, a<sub>5</sub>, a<sub>10</sub>, a<sub>12</sub>}: a<sub>5</sub> = [4, 7) instead of a<sub>7</sub>. Also 5 activities.' },
      { en: 'A<sub>3</sub> = {a<sub>1</sub>, a<sub>4</sub>, a<sub>6</sub>, a<sub>10</sub>, a<sub>12</sub>}, with a<sub>6</sub> = [4, 6). The problem asks for a <b>largest</b> subset of mutually compatible activities: here the maximum is 5, and it is reached by several subsets.' }
    ];
    const [i, ctl] = useSteps(steps.length, 2600);
    const byN = Object.fromEntries(ACTS.map(a => [a.n, a]));
    const rows = ACTS.map(a => ({ ...a, label: a.n.replace('a', 'a_'), dim: i > 0 && !pick[i].includes(a.n), ring: i > 0 && pick[i].includes(a.n) }));
    const sel = [1, 2, 3].map(k => ({ label: 'A_' + k, bold: k === i, dim: k > i, bars: pick[k].map(n => byN[n]) }));
    return html`<figure className="fig"><div className="fig-stage">
      <${Gantt} rows=${rows.concat([null], sel)} T=${12} label="Twelve activities and three maximum subsets" />
    </div><${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  /* ── slides 50-51: subproblems S_ij and the recurrence for c[i, j] ── */
  function ActDp() {
    const A1 = ['a1', 'a4', 'a7', 'a10', 'a12'].map(n => ACTS.find(a => a.n === n));
    const steps = [
      { en: 'S<sub>ij</sub> = {a<sub>k</sub> ∈ S : f<sub>i</sub> ≤ s<sub>k</sub> &lt; f<sub>k</sub> ≤ s<sub>j</sub>}: the activities that start after a<sub>i</sub> finishes and finish before a<sub>j</sub> starts. Add a<sub>0</sub> with f<sub>0</sub> = 0 and a<sub>n+1</sub> with s<sub>n+1</sub> = ∞; then S = S<sub>0,n+1</sub>.' },
      { en: 'Let A<sub>ij</sub> be an optimal solution to S<sub>ij</sub> (here A<sub>1</sub> of the example) and c[i, j] its size; c[i, j] = 0 when S<sub>ij</sub> = ∅. Pick an activity a<sub>k</sub> in A<sub>ij</sub>, here a<sub>7</sub>.' },
      { en: 'a<sub>k</sub> splits A<sub>ij</sub> into a solution of S<sub>ik</sub> (a<sub>1</sub>, a<sub>4</sub>) and one of S<sub>kj</sub> (a<sub>10</sub>, a<sub>12</sub>): c[i, j] = c[i, k] + c[k, j] + 1 = 2 + 2 + 1 = 5.' },
      { en: 'We do not know which a<sub>k</sub> to pick, so the recurrence tries all: c[i, j] = 0 if S<sub>ij</sub> = ∅, otherwise the max of c[i, k] + c[k, j] + 1 over all i &lt; k &lt; j with a<sub>k</sub> ∈ S<sub>ij</sub>. That is dynamic programming; the greedy choice will avoid it.' }
    ];
    const [i, ctl] = useSteps(steps.length, 2600);
    const bars = A1.map(a => ({ ...a, ring: i >= 1 && a.n === 'a7', dim: false }));
    const left = i >= 2 ? { label: 'S_ik', bars: bars.filter(b => b.f <= 5) } : null, right = i >= 2 ? { label: 'S_kj', bars: bars.filter(b => b.s >= 8) } : null;
    return html`<figure className="fig"><div className="fig-stage">
      <${Gantt} rows=${[{ label: 'A_ij', bars }, left, right].filter(Boolean)} T=${12} rh=${30} label="A i j split at a k" />
      ${i >= 2 && html`<p className="a17-sum">c[i, j] = c[i, k] + c[k, j] + 1 = 2 + 2 + 1 = <b>5</b></p>`}
      ${i === 3 && html`<p className="a17-sum">c[i, j] = max { c[i, k] + c[k, j] + 1 : i ${"<"} k ${"<"} j, a<sub>k</sub> ∈ S<sub>ij</sub> }</p>`}
    </div><${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  /* ── slides 52-55: the earliest-finishing activity is a safe choice ── */
  function ActProof() {
    const c = HUES, S53 = [[0, 3, c[0]], [1, 5, c[1]], [3, 4, c[3]], [4, 7, c[4]], [1, 3, c[2]], [3, 6, c[5]], [5, 8, c[6]]].map(([s, f, cc]) => ({ s, f, c: cc }));
    const rows53 = [{ label: '', bars: [S53[0]] }, { bars: [S53[1]] }, { bars: [S53[2], S53[3]] }, { bars: [S53[4], S53[5]] }, { bars: [S53[6]] }];
    const Aij = [S53[0], S53[2], S53[6]], Ap = [S53[4], S53[2], S53[6]];
    const S55 = [[0, 3, c[0]], [1, 7, c[1]], [1, 3, c[2]], [3, 4, c[3]], [4, 7, c[4]], [3, 6, c[5]], [5, 8, c[6]], [0, 1, c[4]]].map(([s, f, cc]) => ({ s, f, c: cc }));
    const steps = [
      { p: 1, en: '<b>Theorem.</b> For a nonempty S<sub>ij</sub>, let a<sub>m</sub> be the activity with the earliest finish time: f<sub>m</sub> = min{f<sub>k</sub> : a<sub>k</sub> ∈ S<sub>ij</sub>}. Then a<sub>m</sub> is in some maximum-size subset of S<sub>ij</sub>, and S<sub>im</sub> is empty, so S<sub>mj</sub> is the only subproblem left.' },
      { p: 1, en: '<b>First part.</b> Let A<sub>ij</sub> be a maximum-size subset of S<sub>ij</sub>, sorted by finish time, and a<sub>k</sub> its first activity (ringed). If a<sub>k</sub> = a<sub>m</sub> we are done.' },
      { p: 1, en: 'If a<sub>k</sub> ≠ a<sub>m</sub>, build A′<sub>ij</sub> = A<sub>ij</sub> − {a<sub>k</sub>} ∪ {a<sub>m</sub>}. It is still disjoint, because a<sub>k</sub> finished first in A<sub>ij</sub> and f<sub>m</sub> ≤ f<sub>k</sub>; it has as many activities as A<sub>ij</sub>, so it is a maximum-size subset that includes a<sub>m</sub>.' },
      { p: 2, en: '<b>Second part.</b> Suppose S<sub>im</sub> were nonempty: some a<sub>k</sub> with f<sub>i</sub> ≤ s<sub>k</sub> &lt; f<sub>k</sub> ≤ s<sub>m</sub> &lt; f<sub>m</sub>. Then a<sub>k</sub> is also in S<sub>ij</sub> and finishes earlier than a<sub>m</sub>, contradicting the choice of a<sub>m</sub>. So S<sub>im</sub> is empty.' }
    ];
    const [i, ctl] = useSteps(steps.length, 2800);
    let rows, line = null;
    if (steps[i].p === 1) {
      rows = rows53.map((r, k) => ({ ...r, label: k === 0 ? 'S' : '' }));
      rows = rows.concat([null, i >= 1 ? { label: 'A_ij', bars: Aij.map((b, k) => ({ ...b, ring: k === 0 })) } : null, i >= 2 ? { label: 'A′_ij', bars: Ap.map((b, k) => ({ ...b, ring: k === 0 })) } : null]);
      if (i === 2) line = 3;
    } else {
      const o = 1.5;
      rows = [{ label: 'a_i', bars: [{ s: 0, f: o, c: '#ff6600' }] }].concat(S55.map((b, k) => ({ label: k === 2 ? 'a_m' : k === 7 ? 'a_k' : k === 3 ? 'S' : '', bars: [{ ...b, s: b.s + o, f: b.f + o, ring: k === 2 || k === 7 }] })), [{ label: 'a_j', bars: [{ s: 8 + o, f: 9.5 + o, c: '#ff6600' }] }]);
    }
    return html`<figure className="fig"><div className="fig-stage">
      ${steps[i].p === 1 ? html`<${Gantt} rows=${rows} T=${8} gx=${36} lab=${54} ticks=${false} label="Exchanging a k for a m" line=${line} />`
        : html`<${Gantt} rows=${rows} T=${11} gx=${27} lab=${48} ticks=${false} label="An activity a k in S i m would finish before a m" />`}
      ${steps[i].p === 2 && html`<p className="a17-sum">f<sub>i</sub> ≤ s<sub>k</sub> ${"<"} f<sub>k</sub> ≤ s<sub>m</sub> ${"<"} f<sub>m</sub> ⇒ f<sub>k</sub> ${"<"} f<sub>m</sub>: contradiction</p>`}
    </div><${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  /* ── slides 56-58: GREEDY-ACTIVITY-SELECTOR on the slide example, or your own activities ── */
  const ACT_TXT = ACTS.map(a => `${a.s}-${a.f}`).join(', ');
  function parseActs(txt) {
    const parts = txt.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
    if (parts.length < 2) throw new Error('Give at least 2 activities.'); if (parts.length > 12) throw new Error('At most 12 activities, so the chart fits a phone.');
    return parts.map((p, k) => { const m = p.match(/^(\d{1,2})\s*[-–\s]\s*(\d{1,2})$/); if (!m) throw new Error(`"${p}" should be start-finish, like 3-7.`); const s = +m[1], f = +m[2]; if (!(s < f)) throw new Error(`In "${p}" the start must be before the finish.`); if (f > 24) throw new Error('Keep times from 0 to 24.'); return { s, f, n: 'a' + (k + 1), c: HUES[k % HUES.length] }; });
  }
  function ActGreedy() {
    const [cur, setCur] = useState(ACT_TXT), [txt, setTxt] = useState(ACT_TXT), [edit, setEdit] = useState(false);
    const parsed = useMemo(() => { try { return { A: parseActs(txt) }; } catch (e) { return { err: e.message }; } }, [txt]);
    const A = useMemo(() => parseActs(cur), [cur]);
    const sorted = useMemo(() => A.map((a, k) => [a, k]).sort((x, y) => x[0].f - y[0].f || x[1] - y[1]).map(x => x[0]), [A]);
    const run = useMemo(() => { const out = [{ t: 'sort' }, { t: 'first', sel: [0], i: 0 }]; let sel = [0], i = 0;
      for (let m = 1; m < sorted.length; m++) { const ok = sorted[m].s >= sorted[i].f, fi = sorted[i].f; if (ok) { sel = sel.concat([m]); i = m; } out.push({ t: 'm', m, ok, fi, sel, i }); }
      out.push({ t: 'end', sel, i }); return out; }, [sorted]);
    const [i0, ctl] = useSteps(run.length, 1700);
    const k = Math.min(i0, run.length - 1), st = run[k], first = useRef(true);
    useEffect(() => { if (first.current) { first.current = false; return; } ctl.replay(); }, [cur]);
    const T = Math.max(...A.map(a => a.f)), isSlide = cur === ACT_TXT;
    const nm = a => a.n.replace(/a(\d+)/, 'a<sub>$1</sub>');
    let en;
    if (st.t === 'sort') en = `Sort by finish time: ${sorted.map(nm).join(', ')} (f = ${sorted.map(a => a.f).join(', ')}). Sorting takes O(n lg n); ties keep their input order.`;
    else if (st.t === 'first') en = `A = {${nm(sorted[0])}}, i = 1: the activity that finishes first (f = ${sorted[0].f}) is always a safe choice.`;
    else if (st.t === 'm') { const a = sorted[st.m]; en = `m = ${st.m + 1}, ${nm(a)} = [${a.s}, ${a.f}): s[m] = ${a.s} ${st.ok ? '≥' : '&lt;'} f[i] = ${st.fi}, so ${st.ok ? `A = A ∪ {${nm(a)}} and i = m` : 'it overlaps the last chosen activity: skip it'}.`; }
    else en = `Return A = {${st.sel.map(m => nm(sorted[m])).join(', ')}}: <b>${st.sel.length}</b> activities, found in one Θ(n) scan after sorting. The recursive ACTIVITY-SELECTOR (slide 57) makes the same choices.${isSlide ? ' This is A<sub>3</sub> of slide 49.' : ''}`;
    const selSet = new Set(st.sel || []);
    const rows = sorted.map((a, j) => ({ label: a.n.replace('a', 'a_'), bars: [{ ...a, ring: st.t === 'm' && st.m === j }], dim: st.t !== 'sort' && !selSet.has(j) && (st.t === 'end' || (st.t === 'm' && j < st.m) || (st.t === 'm' && j === st.m && !st.ok)), bold: selSet.has(j) }));
    const line = st.t === 'first' ? sorted[0].f : st.t === 'm' ? st.fi : null;
    const gx = Math.min(26, Math.floor(300 / T));
    return html`<figure className="fig"><div className="fig-stage">
      <div className="a17-row"><button className=${'fig-btn' + (isSlide ? ' sel' : '')} onClick=${() => { setCur(ACT_TXT); setTxt(ACT_TXT); setEdit(false); }}>Example from the slides</button>
        <button className=${'fig-btn' + (edit ? ' solid' : '') + (!isSlide ? ' sel' : '')} onClick=${() => { if (!edit) return setEdit(true); if (parsed.A) { setCur(txt); setEdit(false); } }}>${edit ? '✓ Run it' : '✎ Try your own'}</button></div>
      ${edit && html`<div><p className="a17-lab">Activities as start-finish, separated by commas (2 to 12 of them, times 0 to 24).</p>
        <textarea className=${'a17-in' + (parsed.err ? ' bad' : '')} rows="2" spellCheck="false" aria-label="Activities" value=${txt} onInput=${e => setTxt(e.target.value.slice(0, 200))}></textarea>
        ${parsed.err && html`<p className="a17-err" role="alert">${parsed.err}</p>`}</div>`}
      <${Gantt} rows=${rows} T=${T} gx=${gx} label="Greedy activity selection, activities sorted by finish time" line=${line} />
      <div className="a17-leg"><span><s className="d"></s>f[i] of the last chosen activity</span></div>
    </div><${Cap} en=${en} /><${Bar} steps=${run} i=${k} ctl=${ctl} /></figure>`;
  }

  window.FIGS = Object.assign(window.FIGS || {}, {
    'ag-17-cut': CutTheorem, 'ag-17-kruskal': Kruskal, 'ag-17-costs': Costs, 'ag-17-prim': Prim,
    'ag-17-huffman': HuffSlide, 'ag-17-full-trees': FullTrees, 'ag-17-huff-exchange': HuffExchange, 'ag-17-huff-sub': HuffSub, 'ag-17-huffman-sim': HuffSim,
    'ag-17-act-example': ActExample, 'ag-17-act-dp': ActDp, 'ag-17-act-proof': ActProof, 'ag-17-act-greedy': ActGreedy
  });
})();
/* ── part L14 ── */
// Algorithms visuals, Lecture 14 (Dynamic Programming): Fibonacci top-down vs bottom-up (slides 3-4), coin-row (6-9),
// binomial coefficients C(6,3) (10-15), robot coin collecting (16-19), LCS pictures and table with backtracing (20-30),
// 0/1 knapsack table and backtracing (31-33), change-making c[p]/s[p] (34-37). Every label and number comes from the slides.
(function () {
  const { useState, useEffect, useRef, useMemo } = React;
  const { html, useSteps, Cap, Bar, pop, calm, useClock, useFit, sec } = window.FIGKIT;
  const CSS = `
.a14-tabs{ display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin:0 0 10px; }
.a14-tabs .fig-btn{ font-size:.84rem; padding:4px 10px; min-height:30px; }
.fig-btn.a14-on{ background:color-mix(in srgb, var(--fig-k) 18%, var(--paper)); border-color:var(--fig-k); box-shadow:0 0 0 1px var(--fig-k); }
.a14-form{ display:flex; flex-wrap:wrap; gap:6px 8px; align-items:center; justify-content:center; margin:0 0 10px; font-size:.88rem; color:var(--ink); }
.a14-form label{ display:flex; gap:5px; align-items:center; }
.a14-form input{ font:inherit; font-size:.9rem; padding:4px 6px; border:1px solid var(--line); border-radius:6px; background:var(--paper); color:var(--ink); min-width:0; box-sizing:border-box; }
.a14-err{ width:100%; text-align:center; color:var(--pen); font-size:.85rem; }
.a14-hint{ text-align:center; font-size:.84rem; color:var(--graphite); margin:0 0 8px; }
.a14-cnt{ font-size:.84rem; color:var(--graphite); }
.a14-t{ border-collapse:collapse; margin:0 auto; font-size:.9rem; color:var(--ink); font-variant-numeric:tabular-nums; }
.a14-t td, .a14-t th{ border:1px solid var(--line); text-align:center; padding:4px 6px; background:var(--paper); transition:background .35s; }
.a14-t th{ background:var(--paper-2); color:var(--graphite); font-weight:600; font-size:.84rem; }
.a14-t td.a14-na{ background:var(--paper-2); }
.a14-t td.a14-hid, .a14-t td.a14-hid .a14-ar{ color:transparent; }
.a14-t td.a14-cur{ background:color-mix(in srgb, var(--fig-k) 34%, var(--paper)); font-weight:700; }
.a14-t td.a14-src{ background:color-mix(in srgb, var(--fig-k) 12%, var(--paper)); box-shadow:inset 0 0 0 2px var(--fig-k); }
.a14-t td.a14-path{ background:color-mix(in srgb, var(--ok) 30%, var(--paper)); font-weight:700; }
.a14-t td.a14-tap{ cursor:pointer; }
.a14-info{ text-align:center; font-size:.86rem; color:var(--graphite); margin:8px 0 0; min-height:1.4em; line-height:1.4; }
.a14-fill{ width:100%; table-layout:fixed; }
.a14-fill td, .a14-fill th{ padding:3px 0; }
.a14-lcs{ font-size:.78rem; }
.a14-lcs td, .a14-lcs th{ padding:2px 0; line-height:1.15; }
.a14-lcs th{ font-size:.86rem; font-style:italic; }
.a14-lcs .a14-ar{ display:block; font-size:.78rem; color:var(--graphite); }
.a14-lcs td.a14-path .a14-ar, .a14-lcs td.a14-cur .a14-ar{ color:var(--ink); }
.a14-coins{ display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin:0 0 12px; }
.a14-coin{ width:38px; height:38px; border-radius:50%; display:grid; place-items:center; font-weight:700; font-size:.95rem; color:var(--ink); background:var(--paper); border:2px solid var(--graphite); transition:background .35s, border-color .35s, opacity .35s; }
.a14-coin.a14-take{ background:color-mix(in srgb, var(--ok) 34%, var(--paper)); border-color:var(--ok); }
.a14-coin.a14-skip{ opacity:.45; }
.a14-dot{ display:inline-block; width:9px; height:9px; border-radius:50%; background:var(--graphite); vertical-align:middle; }
.a14-board td{ position:relative; height:34px; }
.a14-board td .a14-dot{ position:absolute; left:4px; top:4px; }
.a14-arr{ display:flex; flex-wrap:wrap; gap:4px; justify-content:center; margin:10px 0 0; }
.a14-arr div{ border:1px solid var(--line); border-radius:6px; background:var(--paper); padding:3px 6px; font-size:.86rem; text-align:center; min-width:44px; color:var(--ink); transition:background .35s, opacity .35s; }
.a14-arr div b{ display:block; font-size:.78rem; color:var(--graphite); font-weight:600; }
.a14-arr div.a14-off{ opacity:.3; }
.a14-arr div.a14-cur{ background:color-mix(in srgb, var(--fig-k) 30%, var(--paper)); }
.a14-arr div.a14-src{ box-shadow:inset 0 0 0 2px var(--fig-k); }
.a14-arr div.a14-path{ background:color-mix(in srgb, var(--ok) 30%, var(--paper)); }
.a14-cm{ display:grid; grid-template-columns:repeat(auto-fill, minmax(42px, 1fr)); gap:4px; margin:6px 0 0; }
.a14-cm div{ border:1px solid var(--line); border-radius:6px; background:var(--paper); text-align:center; font-size:.9rem; line-height:1.3; padding:2px 0; color:var(--ink); transition:background .35s; }
.a14-cm div b{ display:block; font-size:.78rem; color:var(--graphite); border-bottom:1px solid var(--line); }
.a14-cm div i{ display:block; font-style:normal; color:var(--graphite); font-size:.84rem; }
.a14-cm div.a14-leg{ background:var(--paper-2); }
.a14-cm div.a14-cur{ background:color-mix(in srgb, var(--fig-k) 30%, var(--paper)); }
.a14-cm div.a14-src{ box-shadow:inset 0 0 0 2px var(--fig-k); }
.a14-cm div.a14-path{ background:color-mix(in srgb, var(--ok) 30%, var(--paper)); }
.a14-cm div.a14-hid{ color:transparent; } .a14-cm div.a14-hid b{ color:var(--graphite); } .a14-cm div.a14-hid i{ color:transparent; }
.a14-items{ display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin:0 0 10px; font-size:.86rem; }
.a14-items span{ border:1px solid var(--line); border-radius:99px; padding:2px 9px; background:var(--paper); color:var(--ink); transition:background .35s; }
.a14-items span.a14-in{ background:color-mix(in srgb, var(--ok) 30%, var(--paper)); border-color:var(--ok); }
.a14-items span.a14-out{ opacity:.45; text-decoration:line-through; }
.a14-items span.a14-now{ box-shadow:0 0 0 2px var(--fig-k); }
.a14-word{ font-family:var(--mono, monospace); }
@media (prefers-reduced-motion: reduce){ .a14-t td, .a14-coin, .a14-arr div, .a14-cm div{ transition:none; } }`;
  if (!document.getElementById('a14-css')) { const s = document.createElement('style'); s.id = 'a14-css'; s.textContent = CSS; document.head.appendChild(s); }

  // ── shared helpers ──
  function Bar2({ n, i, ctl }) {
    if (n <= 14) return html`<${Bar} steps=${Array.from({ length: n })} i=${i} ctl=${ctl} />`;
    return html`<div className="fig-bar"><span className="a14-cnt">Step ${i + 1} / ${n}</span><span className="grow"></span>
      <button className="fig-btn" onClick=${() => ctl.go(Math.max(0, i - 1))} disabled=${i === 0} aria-label="Previous step">‹ Back</button>
      <button className="fig-btn" onClick=${() => ctl.go(Math.min(n - 1, i + 1))} disabled=${i === n - 1} aria-label="Next step">Next ›</button>
      <button className="fig-btn" onClick=${ctl.replay}>↻ Replay</button></div>`;
  }
  function Player({ steps, view, head, ms = 1800 }) {
    const [i, ctl] = useSteps(steps.length, ms);
    const s = steps[Math.min(i, steps.length - 1)];
    return html`<div className="fig-stage">${head}${view(s, i)}</div><${Cap} en=${s.en} /><${Bar2} n=${steps.length} i=${i} ctl=${ctl} />`;
  }
  const Tabs = ({ opts, v, set }) => html`<div className="a14-tabs">${opts.map(([k, l]) => html`<button key=${k} className=${'fig-btn' + (v === k ? ' a14-on' : '')} onClick=${() => set(k)}>${l}</button>`)}</div>`;
  // fields: [{ k, label, init, w }]; parse(values) → { err } or { ok }
  function TryForm({ fields, parse, onOk }) {
    const [vals, setVals] = useState(() => Object.fromEntries(fields.map(f => [f.k, f.init])));
    const [err, setErr] = useState('');
    const go = e => { e && e.preventDefault(); const r = parse(vals); if (r.err) setErr(r.err); else { setErr(''); onOk(r.ok); } };
    return html`<form className="a14-form" onSubmit=${go}>
      ${fields.map(f => html`<label key=${f.k}>${f.label}<input value=${vals[f.k]} style=${{ width: f.w || '8em' }} onInput=${e => setVals(v => ({ ...v, [f.k]: e.target.value }))} /></label>`)}
      <button className="fig-btn solid" type="submit">Run</button>
      ${err && html`<div className="a14-err">${err}</div>`}</form>`;
  }
  const ints = s => String(s).split(/[\s,;]+/).filter(Boolean).map(Number);
  const isInt = (x, lo, hi) => Number.isInteger(x) && x >= lo && x <= hi;

  /* ── slides 3-4: Fibonacci, top-down recursion tree vs bottom-up table ── */
  function Fib() {
    const calls = [1, 1]; for (let k = 2; k <= 5; k++) calls[k] = 1 + calls[k - 1] + calls[k - 2];
    const fv = [0, 1]; for (let k = 2; k <= 5; k++) fv[k] = fv[k - 1] + fv[k - 2];
    const steps = [
      { en: 'Fibonacci: f(0) = 0, f(1) = 1, f(n) = f(n-1) + f(n-2). Computing f(n) <b>recursively (top-down)</b> starts at the root f(n).' },
      { en: 'f(n) calls f(n-1) and f(n-2), and adds them.' },
      { en: 'Next level: f(n-1) calls f(n-2) and f(n-3); f(n-2) calls f(n-3) and f(n-4). Now <b>f(n-2) is computed twice</b> and <b>f(n-3) twice</b>: the subproblems overlap.' },
      { en: `The tree keeps doubling, so the same values are recomputed again and again. Even f(5) this way makes ${calls[5]} calls; the number of calls grows exponentially.` },
      { en: 'Bottom-up iteration (the DP way): start with the smallest instances f(0) = 0 and f(1) = 1 and record them in a table.' },
      ...[2, 3, 4, 5].map(k => ({ en: `f(${k}) = f(${k - 1}) + f(${k - 2}) = ${fv[k - 2]} + ${fv[k - 1]} = <b>${fv[k]}</b>, read from the two cells already in the table.` })),
      { en: 'Continue up to f(n) = f(n-1) + f(n-2). Each value is computed <b>once</b> from the two before it: n + 1 values, Θ(n) additions instead of exponentially many calls.' }
    ];
    const T = (x, y, t, on, hl) => html`<g className=${pop(on)}>${hl && html`<rect x=${x - 36} y=${y - 18} width="72" height="26" rx="6" fill=${hl} />`}<text x=${x} y=${y + 2} textAnchor="middle" fontSize="18" fontStyle="italic">${t}</text></g>`;
    const L = (x1, y1, x2, y2, on) => html`<line x1=${x1} y1=${y1} x2=${x2} y2=${y2} stroke="var(--graphite)" strokeWidth="1.5" className=${pop(on)} />`;
    const view = (s, i) => {
      const d1 = i >= 2 ? 'color-mix(in srgb, var(--fig-k) 28%, var(--paper))' : null, d2 = i >= 2 ? 'color-mix(in srgb, var(--ok) 28%, var(--paper))' : null;
      return html`<svg viewBox="0 0 400 196" role="img" aria-label="Recursion tree of f(n)">
        ${T(200, 22, 'f(n)', true)}
        ${L(185, 30, 120, 62, i >= 1)}${L(215, 30, 280, 62, i >= 1)}
        ${T(110, 80, 'f(n-1)', i >= 1)}${T(290, 80, 'f(n-2)', i >= 1, d1)}<text x="200" y="84" textAnchor="middle" fontSize="18" className=${pop(i >= 1)}>+</text>
        ${L(95, 90, 62, 122, i >= 2)}${L(125, 90, 158, 122, i >= 2)}${L(275, 90, 242, 122, i >= 2)}${L(305, 90, 338, 122, i >= 2)}
        ${T(55, 140, 'f(n-2)', i >= 2, d1)}${T(165, 140, 'f(n-3)', i >= 2, d2)}${T(235, 140, 'f(n-3)', i >= 2, d2)}${T(345, 140, 'f(n-4)', i >= 2)}
        <text x="110" y="144" textAnchor="middle" fontSize="18" className=${pop(i >= 2)}>+</text><text x="290" y="144" textAnchor="middle" fontSize="18" className=${pop(i >= 2)}>+</text>
        <text x="40" y="184" fontSize="22" className=${pop(i >= 3)}>…</text>
        <text x="380" y="186" textAnchor="end" fontSize="18" fill="var(--graphite)" className=${pop(i >= 3)}>f(5): ${calls[5]} calls</text>
      </svg>
      <div className="a14-arr" style=${{ opacity: i >= 4 ? 1 : .25 }}>
        ${[0, 1, 2, 3, 4, 5].map(k => { const on = i >= 4 && (k <= 1 || i >= k + 3); const cur = (k <= 1 && i === 4) || i === k + 3; const src = k >= 0 && i >= 5 && i <= 8 && (k === i - 4 || k === i - 5);
          return html`<div key=${k} className=${(on ? '' : 'a14-off') + (cur ? ' a14-cur' : '') + (src && !cur ? ' a14-src' : '')}><b>f(${k})</b>${on ? fv[k] : '?'}</div>`; })}
        <div className=${i >= 9 ? 'a14-cur' : 'a14-off'}><b>…</b>…</div><div className=${i >= 9 ? 'a14-cur' : 'a14-off'}><b>f(n)</b>${i >= 9 ? '✓' : '?'}</div>
      </div>`;
    };
    return html`<figure className="fig"><${Player} steps=${steps} view=${view} ms=${2000} /></figure>`;
  }

  /* ── slides 6-9: coin-row problem ── */
  function coinSteps(c) { // c[1..n]
    const n = c.length - 1, F = [0, c[1]];
    const steps = [{ en: `Row of coins ${c.slice(1).join(', ')}: pick the most money with <b>no two adjacent coins</b>. F(n) = max{c<sub>n</sub> + F(n-2), F(n-1)}: either take the last coin (then coin n-1 is not allowed) or leave it.`, k: -1 }];
    steps.push({ en: `Base cases: F(0) = 0 (no coins) and F(1) = c<sub>1</sub> = ${c[1]}.`, k: 1 });
    for (let k = 2; k <= n; k++) { const a = c[k] + F[k - 2], b = F[k - 1]; F[k] = Math.max(a, b);
      steps.push({ en: `F(${k}) = max{c<sub>${k}</sub> + F(${k - 2}), F(${k - 1})} = max{${c[k]} + ${F[k - 2]}, ${b}} = <b>${F[k]}</b> (${a > b ? `take coin ${k}` : a === b ? 'both give the same' : `leave coin ${k}`}).`, k }); }
    const take = []; let k = n; while (k >= 1) { if (k === 1 || c[k] + F[k - 2] > F[k - 1]) { take.push(k); k -= 2; } else k -= 1; }
    take.reverse();
    steps.push({ en: `Max amount F(${n}) = <b>${F[n]}</b>. Backtrace from F(${n}): a coin is in the solution when c<sub>k</sub> + F(k-2) beat F(k-1). Coins of the optimal solution: ${take.map(t => `c<sub>${t}</sub> = ${c[t]}`).join(', ')}. Time Θ(n), space Θ(n); all smaller instances were solved.`, k: n + 1, take });
    return { steps, F };
  }
  function CoinRow() {
    const [mode, setMode] = useState('slide'), [own, setOwn] = useState([0, 3, 8, 4, 1, 9]);
    const c = mode === 'slide' ? [0, 5, 1, 2, 10, 6, 2] : own, n = c.length - 1;
    const { steps, F } = useMemo(() => coinSteps(c), [c]);
    const view = (s, i) => {
      const shown = k => k === 0 ? s.k >= 1 : k <= s.k;
      return html`<div className="a14-coins">${c.slice(1).map((v, j) => html`<div key=${j} className=${'a14-coin' + (s.take ? (s.take.includes(j + 1) ? ' a14-take' : ' a14-skip') : '')}>${v}</div>`)}</div>
        <table className="a14-t a14-fill"><tbody>
          <tr><th>index</th>${c.map((_, k) => html`<th key=${k}>${k}</th>`)}</tr>
          <tr><th>coins</th>${c.map((v, k) => html`<td key=${k} className=${s.take && s.take.includes(k) ? 'a14-path' : ''}>${k ? v : '–'}</td>`)}</tr>
          <tr><th>F( )</th>${c.map((_, k) => html`<td key=${k} className=${(shown(k) ? '' : 'a14-hid') + (k === s.k || (s.k === 1 && k === 0) ? ' a14-cur' : '') + (s.k >= 2 && s.k <= n && (k === s.k - 1 || k === s.k - 2) ? ' a14-src' : '')}>${F[k]}</td>`)}</tr>
        </tbody></table>`;
    };
    const head = html`<${Tabs} opts=${[['slide', 'Example from the slides'], ['own', 'Try your own']]} v=${mode} set=${setMode} />
      ${mode === 'own' && html`<${TryForm} fields=${[{ k: 'c', label: 'Coins', init: own.slice(1).join(', '), w: '11em' }]} onOk=${setOwn}
        parse=${v => { const a = ints(v.c); return a.length < 2 || a.length > 8 || !a.every(x => isInt(x, 1, 99)) ? { err: 'Enter 2 to 8 whole coin values from 1 to 99.' } : { ok: [0, ...a] }; }} />`}`;
    return html`<figure className="fig"><${Player} key=${mode + c.join()} steps=${steps} view=${view} head=${head} /></figure>`;
  }

  /* ── slides 10-15: binomial coefficient C(n,k) by DP; the in-class exercise C(6,3) ── */
  function Binom() {
    const [nk, setNk] = useState([6, 3]), [tap, setTap] = useState(null);
    const [n, k] = nk;
    const C = useMemo(() => { const T = []; for (let i = 0; i <= n; i++) { T[i] = []; for (let j = 0; j <= Math.min(i, k); j++) T[i][j] = j === 0 || j === i ? 1 : T[i - 1][j - 1] + T[i - 1][j]; } return T; }, [n, k]);
    const why = (i, j) => j === 0 || j === i ? `C(${i},${j}) = 1 (${j === 0 ? 'j = 0' : 'j = i'})` : `C(${i},${j}) = C(${i - 1},${j - 1}) + C(${i - 1},${j}) = ${C[i - 1][j - 1]} + ${C[i - 1][j]} = <b>${C[i][j]}</b>`;
    const steps = useMemo(() => {
      const st = [{ en: `C(n,k) counts the k-element subsets of an n-element set. Split them: those <b>without</b> the last element, C(n-1,k), and those <b>with</b> it, C(n-1,k-1). So C(n,k) = C(n-1,k) + C(n-1,k-1) for n &gt; k &gt; 0, C(n,0) = C(n,n) = 1. Fill the table row by row for C(${n},${k}).`, r: -1 }];
      for (let i = 0; i <= n; i++) { const m = Math.min(i, k), j = m === i ? Math.max(1, i - 1) : m; st.push({ en: `Row ${i} (j = 0 … min(${i}, ${k}) = ${m}): ${i < 2 ? `all 1s, since j = 0 or j = i.` : `${why(i, j)}${j !== m ? `, and C(${i},${m}) = 1` : ''}.`}`, r: i, c: i >= 2 && j < i ? j : null }); }
      st.push({ en: `C(${n},${k}) = ${k === 0 || k === n ? '1' : `C(${n - 1},${k - 1}) + C(${n - 1},${k}) = ${C[n - 1][k - 1]} + ${C[n - 1][k]}`} = <b>${C[n][k]}</b>. The two loops fill about n·k cells, each in O(1): time Θ(nk), space Θ(nk).`, r: n + 1, c: k, fin: true });
      return st;
    }, [C]);
    const view = (s) => html`<table className="a14-t"><tbody>
        <tr><th>i \\ j</th>${Array.from({ length: k + 1 }, (_, j) => html`<th key=${j}>${j}</th>`)}</tr>
        ${C.map((row, i) => html`<tr key=${i}><th>${i}</th>${Array.from({ length: k + 1 }, (_, j) => {
          if (j > i) return html`<td key=${j} className="a14-na"></td>`;
          const on = i <= s.r, ci = s.fin ? n : s.r, cur = s.c != null && i === ci && j === s.c, src = s.c != null && i === ci - 1 && (j === s.c || j === s.c - 1) && s.c > 0 && s.c < ci;
          return html`<td key=${j} onClick=${() => on && setTap([i, j])} className=${'a14-tap ' + (on ? '' : 'a14-hid') + (cur || (s.r === i && !s.fin && s.c == null) ? ' a14-cur' : '') + (src ? ' a14-src' : '') + (tap && tap[0] === i && tap[1] === j && on ? ' a14-src' : '')}>${row[j]}</td>`; })}</tr>`)}
      </tbody></table>
      <p className="a14-info" dangerouslySetInnerHTML=${{ __html: tap && tap[0] <= s.r ? why(tap[0], tap[1]) : 'Tap a filled cell to see how it was computed.' }}></p>`;
    const head = html`<${TryForm} fields=${[{ k: 'n', label: 'n', init: '6', w: '3.2em' }, { k: 'k', label: 'k', init: '3', w: '3.2em' }]} onOk=${v => { setTap(null); setNk(v); }}
      parse=${v => { const a = +v.n, b = +v.k; return !isInt(a, 1, 10) || !isInt(b, 0, Math.min(a, 6)) ? { err: 'Use 1 ≤ n ≤ 10 and 0 ≤ k ≤ min(n, 6).' } : { ok: [a, b] }; }} />
      <p className="a14-hint">The slide exercise is C(6, 3); change n and k to try your own.</p>`;
    return html`<figure className="fig"><${Player} key=${n + ',' + k} steps=${steps} view=${view} head=${head} ms=${2100} /></figure>`;
  }

  /* ── slides 16-19: robot coin collecting on the 5 × 6 board ── */
  const ROBOT = [[1, 5], [2, 2], [2, 4], [3, 4], [3, 6], [4, 3], [4, 6], [5, 1], [5, 5]];
  function Robot() {
    const [mode, setMode] = useState('slide'), [own, setOwn] = useState(ROBOT.map(x => x.join(',')));
    const coins = mode === 'slide' ? ROBOT.map(x => x.join(',')) : own, has = (i, j) => coins.includes(i + ',' + j);
    const R = 5, M = 6;
    const F = useMemo(() => { const T = Array.from({ length: R + 1 }, () => Array(M + 1).fill(0)); for (let i = 1; i <= R; i++) for (let j = 1; j <= M; j++) T[i][j] = Math.max(T[i - 1][j], T[i][j - 1]) + (has(i, j) ? 1 : 0); return T; }, [coins.join(';')]);
    const path = useMemo(() => { const p = [[R, M]]; let i = R, j = M; while (i > 1 || j > 1) { if (i === 1) j--; else if (j === 1) i--; else if (F[i - 1][j] >= F[i][j - 1]) i--; else j--; p.push([i, j]); } return p.map(x => x.join(',')); }, [F]);
    const row = i => Array.from({ length: M }, (_, j) => j + 1).map(j => `F(${i},${j}) = ${F[i][j]}`).filter((_, j) => has(i, j + 1)).slice(0, 2);
    const steps = [
      { en: `Coins sit in some cells of the ${R} × ${M} board (c<sub>ij</sub> = 1 if cell (i, j) has a coin). The robot starts at the upper-left cell, moves only <b>right</b> or <b>down</b>, and wants to bring the most coins to the bottom-right cell.`, r: 0 },
      { en: 'F(i, j) = most coins the robot can bring to cell (i, j). It arrives from the neighbor above or from the left neighbor: F(i, j) = max{F(i-1, j), F(i, j-1)} + c<sub>ij</sub>, with F(0, j) = 0 and F(i, 0) = 0.', r: 0 },
      ...[1, 2, 3, 4, 5].map(i => ({ en: `Row ${i}: each cell takes the larger of the cell above and the cell to its left, plus 1 if it holds a coin${row(i).length ? `, e.g. ${row(i).join(', ')} (coin cells)` : ''}.`, r: i })),
      { en: `F(${R},${M}) = <b>${F[R][M]}</b> coins. To find the path, walk back from (${R},${M}) to the neighbor (above or left) with the larger F. Time Θ(nm), space Θ(nm).`, r: R, path: true }
    ];
    const view = (s) => html`<table className="a14-t a14-fill a14-board"><tbody>
        <tr><th></th>${Array.from({ length: M }, (_, j) => html`<th key=${j}>${j + 1}</th>`)}</tr>
        ${Array.from({ length: R }, (_, i0) => { const i = i0 + 1; return html`<tr key=${i}><th>${i}</th>${Array.from({ length: M }, (_, j0) => { const j = j0 + 1, on = i <= s.r, inP = s.path && path.includes(i + ',' + j);
          return html`<td key=${j} onClick=${() => { if (mode === 'own') setOwn(o => o.includes(i + ',' + j) ? o.filter(x => x !== i + ',' + j) : [...o, i + ',' + j]); }}
            className=${(mode === 'own' ? 'a14-tap ' : '') + (inP ? 'a14-path' : on && i === s.r && !s.path ? 'a14-cur' : '')}>${has(i, j) && html`<span className="a14-dot"></span>`}${on ? F[i][j] : ''}</td>`; })}</tr>`; })}
      </tbody></table>`;
    const head = html`<${Tabs} opts=${[['slide', 'Board from the slides'], ['own', 'Try your own']]} v=${mode} set=${setMode} />
      ${mode === 'own' && html`<p className="a14-hint">Tap cells to add or remove coins.</p>`}`;
    return html`<figure className="fig"><${Player} key=${mode + coins.slice().sort().join(';')} steps=${steps} view=${view} head=${head} ms=${2000} /></figure>`;
  }

  /* ── slides 20-22: what a common subsequence looks like ── */
  function lcs(A, B) {
    const m = A.length, n = B.length, L = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0)), P = Array.from({ length: m + 1 }, () => Array(n + 1).fill(''));
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
      if (A[i - 1] === B[j - 1]) { L[i][j] = L[i - 1][j - 1] + 1; P[i][j] = '↖'; }
      else if (L[i - 1][j] >= L[i][j - 1]) { L[i][j] = L[i - 1][j]; P[i][j] = '↑'; }
      else { L[i][j] = L[i][j - 1]; P[i][j] = '←'; }
    }
    const path = [], pairs = []; let i = m, j = n;
    while (i > 0 && j > 0) { path.push([i, j]); if (P[i][j] === '↖') { pairs.push([i - 1, j - 1]); i--; j--; } else if (P[i][j] === '↑') i--; else j--; }
    path.push([i, j]); pairs.reverse();
    return { L, P, path, pairs, out: pairs.map(p => A[p[0]]).join('') };
  }
  function LcsMatch() {
    const ex = [['president', 'providence'], ['algorithm', 'alignment']].map(([a, b]) => ({ a, b, ...lcs(a, b) }));
    const alt = [[[0, 0], [1, 1], [2, 3], [6, 8]], [[0, 0], [1, 1], [5, 2], [8, 5]]], ALGM = [[0, 0], [1, 1], [2, 3], [8, 5]]; // algt, alim, algm
    const steps = [
      { en: 'A <b>subsequence</b> of S keeps some letters of S in their order, not necessarily next to each other: <span class="a14-word">pred</span>, <span class="a14-word">sdn</span> and <span class="a14-word">predent</span> are subsequences of <span class="a14-word">president</span>.', e: 0, sub: [0, 1, 2, 5] },
      { en: `<span class="a14-word">president</span> and <span class="a14-word">providence</span>: join equal letters with lines that never cross. The longest such set gives the LCS <b>${ex[0].out}</b> (length ${ex[0].out.length}).`, e: 0, pairs: ex[0].pairs },
      { en: `<span class="a14-word">algorithm</span> and <span class="a14-word">alignment</span>: one of its LCSs is <b>algm</b> (length ${ex[1].out.length}).`, e: 1, pairs: ALGM },
      { en: 'Lines may not cross: the i–i line crosses g–g and the t–t line crosses m–m, so they cannot be added. Other LCSs of the same length 4: <b>algt</b> (m–m swapped for t–t) and <b>alim</b> (g–g swapped for i–i).', e: 1, pairs: ALGM, ghost: [[5, 2], [6, 8]] },
      { en: 'Another LCS: <b>algt</b> (the one the LCS-Length table of slide 26 backtraces to for these strings).', e: 1, pairs: alt[0] },
      { en: 'Another LCS: <b>alim</b>. The LCS length is unique (4), the subsequence itself is not.', e: 1, pairs: alt[1] }
    ];
    const view = (s) => { const E = ex[s.e], dx = 38, x0 = 200 - (Math.max(E.a.length, E.b.length) - 1) * dx / 2, X = k => x0 + k * dx;
      const subOn = k => s.sub && s.sub.includes(k);
      return html`<svg viewBox="0 0 400 150" role="img" aria-label=${'Matching letters of ' + E.a + ' and ' + E.b}>
        ${[...E.a].map((ch, k) => html`<g key=${'a' + k}>${(subOn(k) || (s.pairs && s.pairs.some(p => p[0] === k))) && html`<rect x=${X(k) - 14} y="10" width="28" height="34" rx="6" fill="color-mix(in srgb, var(--fig-k) 26%, var(--paper))" />`}<text x=${X(k)} y="36" textAnchor="middle" fontSize="24" fontFamily="var(--mono, monospace)">${ch}</text></g>`)}
        ${!s.sub && [...E.b].map((ch, k) => html`<g key=${'b' + k}>${s.pairs && s.pairs.some(p => p[1] === k) && html`<rect x=${X(k) - 14} y="106" width="28" height="34" rx="6" fill="color-mix(in srgb, var(--fig-k) 26%, var(--paper))" />`}<text x=${X(k)} y="132" textAnchor="middle" fontSize="24" fontFamily="var(--mono, monospace)">${ch}</text></g>`)}
        ${s.pairs && s.pairs.map(([p, q], k) => html`<line key=${k} x1=${X(p)} y1="48" x2=${X(q)} y2="104" stroke="var(--fig-k)" strokeWidth="3" />`)}
        ${s.ghost && s.ghost.map(([p, q], k) => html`<line key=${'g' + k} x1=${X(p)} y1="48" x2=${X(q)} y2="104" stroke="var(--pen)" strokeWidth="2" strokeDasharray="5 5" />`)}
        ${s.sub && html`<text x="200" y="100" textAnchor="middle" fontSize="20">subsequence: ${s.sub.map(k => E.a[k]).join('')}</text>`}
      </svg>`; };
    return html`<figure className="fig"><${Player} steps=${steps} view=${view} ms=${2600} /></figure>`;
  }

  /* ── slides 23-30: LCS-Length table with prev arrows, then Output-LCS backtracing ── */
  function LcsTable() {
    const [ab, setAb] = useState(['president', 'providence']), [tap, setTap] = useState(null);
    const [A, B] = ab, m = A.length, n = B.length;
    const R = useMemo(() => lcs(A, B), [A, B]);
    const why = (i, j) => i === 0 || j === 0 ? `len(${i},${j}) = 0 (${i === 0 ? 'i' : 'j'} = 0)` : A[i - 1] === B[j - 1]
      ? `a<sub>${i}</sub> = b<sub>${j}</sub> = ${A[i - 1]}: len(${i},${j}) = len(${i - 1},${j - 1}) + 1 = ${R.L[i][j]}, prev = ↖`
      : `a<sub>${i}</sub> = ${A[i - 1]} ≠ b<sub>${j}</sub> = ${B[j - 1]}: len(${i - 1},${j}) = ${R.L[i - 1][j]} ${R.L[i - 1][j] >= R.L[i][j - 1] ? '≥' : '&lt;'} len(${i},${j - 1}) = ${R.L[i][j - 1]}, so len(${i},${j}) = ${R.L[i][j]}, prev = ${R.P[i][j]}`;
    const steps = useMemo(() => {
      const st = [{ en: `len(i, j) = length of an LCS of a<sub>1</sub>…a<sub>i</sub> and b<sub>1</sub>…b<sub>j</sub>. Lines 1-2 of LCS-Length: row 0 and column 0 are 0 (an empty string has no common letters).`, r: 0 }];
      for (let i = 1; i <= m; i++) { const j = [...B].findIndex(ch => ch === A[i - 1]) + 1;
        st.push({ en: `Row ${i} (a<sub>${i}</sub> = ${A[i - 1]}): if a<sub>i</sub> = b<sub>j</sub>, len = len(i-1, j-1) + 1 and prev = ↖; else if len(i-1, j) ≥ len(i, j-1), copy from above (↑), else from the left (←). ${j ? why(i, j) + '.' : `No b<sub>j</sub> equals ${A[i - 1]}, so the row only copies.`}`, r: i, c: j || null }); }
      st.push({ en: `len(${m},${n}) = <b>${R.L[m][n]}</b>. Output-LCS starts at (${m},${n}) and follows prev: ↖ prints a<sub>i</sub> and moves to (i-1, j-1); ↑ moves to (i-1, j); ← moves to (i, j-1); stop at row or column 0.`, r: m, path: true });
      st.push({ en: `Output: <b>${R.out || '(empty)'}</b>, printed at the ↖ cells on the way. Filling the table takes O(mn) time and O(mn) memory; backtracing takes O(m + n).`, r: m, path: true, out: true });
      return st;
    }, [R]);
    const onP = (i, j) => R.path.some(p => p[0] === i && p[1] === j);
    const view = (s) => html`<table className="a14-t a14-fill a14-lcs"><tbody>
        <tr><th></th><th></th>${[...B].map((ch, j) => html`<th key=${j}>${ch}</th>`)}</tr>
        ${Array.from({ length: m + 1 }, (_, i) => html`<tr key=${i}><th>${i ? A[i - 1] : ''}</th>${Array.from({ length: n + 1 }, (_, j) => {
          const on = i <= s.r, p = s.path && onP(i, j), cur = !s.path && i === s.r && i > 0 && j === s.c, src = cur && (A[i - 1] === B[j - 1] ? [[i - 1, j - 1]] : [[i - 1, j], [i, j - 1]]);
          const pm = s.out && p && R.P[i][j] === '↖';
          return html`<td key=${j} onClick=${() => on && setTap([i, j])} className=${'a14-tap ' + (on ? '' : 'a14-hid') + (p ? ' a14-path' : '') + (cur || pm ? ' a14-cur' : '') + (tap && tap[0] === i && tap[1] === j && on ? ' a14-src' : '')}>${i > 0 && j > 0 && html`<span className="a14-ar">${R.P[i][j]}</span>`}${R.L[i][j]}</td>`; })}</tr>`)}
      </tbody></table>
      <p className="a14-info" dangerouslySetInnerHTML=${{ __html: tap && tap[0] <= s.r ? why(tap[0], tap[1]) : s.out ? `Output: <b>${R.out}</b>` : 'Tap a filled cell to see how it was computed.' }}></p>`;
    const head = html`<${TryForm} fields=${[{ k: 'a', label: 'A', init: 'president', w: '7.5em' }, { k: 'b', label: 'B', init: 'providence', w: '7.5em' }]} onOk=${v => { setTap(null); setAb(v); }}
      parse=${v => { const a = v.a.trim().toLowerCase(), b = v.b.trim().toLowerCase(); return !/^[a-z]{1,10}$/.test(a) || !/^[a-z]{1,10}$/.test(b) ? { err: 'Use 1 to 10 letters (a-z) for each string.' } : { ok: [a, b] }; }} />`;
    return html`<figure className="fig"><${Player} key=${A + '|' + B} steps=${steps} view=${view} head=${head} ms=${1900} /></figure>`;
  }

  /* ── slides 31-33: 0/1 knapsack V[i,j] table and backtracing ── */
  function knapSteps(items, W) {
    const n = items.length, V = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));
    const st = [{ en: `Capacity W = ${W}. V[i, j] = best value using the first i items with capacity j. Initial conditions: V[0, j] = 0 and V[i, 0] = 0.`, at: [0, W] }];
    for (let i = 1; i <= n; i++) for (let j = 1; j <= W; j++) {
      const [w, v] = items[i - 1];
      if (j - w < 0) { V[i][j] = V[i - 1][j]; st.push({ en: `V[${i},${j}]: j - w<sub>${i}</sub> = ${j} - ${w} &lt; 0, item ${i} does not fit, so V[${i},${j}] = V[${i - 1},${j}] = <b>${V[i][j]}</b>.`, at: [i, j], src: [[i - 1, j]] }); }
      else { const t = v + V[i - 1][j - w]; V[i][j] = t > V[i - 1][j] ? t : V[i - 1][j];
        st.push({ en: `V[${i},${j}] = max{V[${i - 1},${j}], v<sub>${i}</sub> + V[${i - 1},${j - w}]} = max{${V[i - 1][j]}, ${v} + ${V[i - 1][j - w]}} = <b>${V[i][j]}</b>${t > V[i - 1][j] ? ` (take item ${i})` : ''}.`, at: [i, j], src: [[i - 1, j], [i - 1, j - w]] }); }
    }
    let j = W; const take = [], path = [[n, W]];
    for (let i = n; i >= 1; i--) { const [w, v] = items[i - 1];
      if (V[i][j] === V[i - 1][j]) st.push({ en: `Backtrace at V[${i},${j}] = ${V[i][j]}: equal to the value above, V[${i - 1},${j}], so item ${i} is <b>not</b> in the knapsack; go up to row ${i - 1} with the same j.`, at: [n, W], bt: i, path: path.slice(), take: take.slice() });
      else { take.push(i); st.push({ en: `Backtrace at V[${i},${j}] = ${V[i][j]}: not equal to V[${i - 1},${j}] = ${V[i - 1][j]}, so item ${i} <b>is</b> in; go up to row ${i - 1} with j = ${j} - w<sub>${i}</sub> = ${j - w}.`, at: [n, W], bt: i, path: path.slice(), take: take.slice() }); j -= w; }
      path.push([i - 1, j]); st[st.length - 1].path = path.slice();
    }
    const tw = take.reduce((a, i) => a + items[i - 1][0], 0);
    st.push({ en: `Optimal subset {${take.slice().reverse().join(', ')}}: weight ${tw} ≤ ${W}, value <b>${V[n][W]}</b>. Running time and space: O(nW).`, at: [n, W], path, take, fin: true, bt: 0 });
    return { st, V };
  }
  function Knap() {
    const SL = [[2, 12], [1, 10], [3, 20], [2, 15]];
    const [mode, setMode] = useState('slide'), [own, setOwn] = useState({ items: [[1, 9], [2, 14], [3, 13], [1, 11]], W: 5 }), [tap, setTap] = useState(null);
    const items = mode === 'slide' ? SL : own.items, W = mode === 'slide' ? 5 : own.W, n = items.length;
    const { st, V } = useMemo(() => knapSteps(items, W), [JSON.stringify(items), W]);
    const filled = (s, i, j) => i === 0 || j === 0 || s.bt != null || i < s.at[0] || (i === s.at[0] && j <= s.at[1]);
    const why = (i, j) => { if (i === 0 || j === 0) return `V[${i},${j}] = 0 (initial condition)`; const [w, v] = items[i - 1];
      return j < w ? `V[${i},${j}] = V[${i - 1},${j}] = ${V[i][j]} (item ${i} does not fit)` : `V[${i},${j}] = max{${V[i - 1][j]}, ${v} + ${V[i - 1][j - w]}} = ${V[i][j]}`; };
    const view = (s) => html`<div className="a14-items">${items.map(([w, v], k) => html`<span key=${k} className=${(s.take && s.take.includes(k + 1) ? 'a14-in' : s.bt != null && (s.fin || k + 1 > s.bt) ? 'a14-out' : '') + ((s.bt ? s.bt === k + 1 : s.at[0] === k + 1 && s.bt == null) ? ' a14-now' : '')}>${k + 1}: w=${w}, v=${v}</span>`)}</div>
      <table className="a14-t a14-fill"><tbody>
        <tr><th>i \\ j</th>${Array.from({ length: W + 1 }, (_, j) => html`<th key=${j}>${j}</th>`)}</tr>
        ${V.map((row, i) => html`<tr key=${i}><th>${i}</th>${row.map((x, j) => { const on = filled(s, i, j), cur = s.bt == null && s.at[0] === i && s.at[1] === j && i > 0, src = s.src && s.src.some(p => p[0] === i && p[1] === j), p = s.path && s.path.some(q => q[0] === i && q[1] === j);
          return html`<td key=${j} onClick=${() => on && setTap([i, j])} className=${'a14-tap ' + (on ? '' : 'a14-hid') + (cur ? ' a14-cur' : '') + (src ? ' a14-src' : '') + (p ? ' a14-path' : '') + (tap && tap[0] === i && tap[1] === j && on ? ' a14-src' : '')}>${x}</td>`; })}</tr>`)}
      </tbody></table>
      <p className="a14-info" dangerouslySetInnerHTML=${{ __html: tap && filled(s, tap[0], tap[1]) ? why(tap[0], tap[1]) : mode === 'slide' && s.at[0] === 4 && s.at[1] === 2 && s.bt == null ? 'The slide marks this cell with “?”: the answer is 15.' : 'Tap a filled cell to see how it was computed.' }}></p>`;
    const head = html`<${Tabs} opts=${[['slide', 'Example from the slides'], ['own', 'Try your own']]} v=${mode} set=${m => { setTap(null); setMode(m); }} />
      ${mode === 'own' && html`<${TryForm} fields=${[{ k: 'it', label: 'Items w,v;', init: own.items.map(x => x.join(',')).join('; '), w: '12em' }, { k: 'W', label: 'W', init: String(own.W), w: '3em' }]}
        onOk=${v => { setTap(null); setOwn(v); }}
        parse=${v => { const parts = v.it.split(';').map(x => ints(x)).filter(x => x.length); const Wn = +v.W;
          if (!parts.length || parts.length > 5 || !parts.every(p => p.length === 2 && isInt(p[0], 1, 9) && isInt(p[1], 1, 99))) return { err: 'Write 1 to 5 items as w,v separated by ; (w 1-9, v 1-99).' };
          if (!isInt(Wn, 1, 8)) return { err: 'Capacity W must be 1 to 8.' }; return { ok: { items: parts, W: Wn } }; }} />`}`;
    return html`<figure className="fig"><${Player} key=${mode + JSON.stringify(items) + W} steps=${st} view=${view} head=${head} ms=${1500} /></figure>`;
  }

  /* ── slides 34-37: change-making by DP, c[p] and s[p] ── */
  function changeSteps(n, D) {
    const c = [0], s = [0], st = [{ en: `Amount n = ${n}, coins D = {${D.join(', ')}}. c[p] = min number of coins for p, s[p] = last coin used. c[0] = 0; for p &gt; 0, c[p] = min over d<sub>i</sub> ≤ p of c[p - d<sub>i</sub>] + 1.`, p: 0 }];
    for (let p = 1; p <= n; p++) { c[p] = Infinity; s[p] = null; const tr = [];
      for (const d of D) if (d <= p) { const v = c[p - d] + 1; tr.push(`d = ${d}: c[${p - d}] + 1 = ${v === Infinity ? '∞' : v}`); if (v < c[p]) { c[p] = v; s[p] = d; } }
      st.push({ en: `p = ${p}: ${tr.length ? tr.join('; ') : 'no coin is small enough'}. ${c[p] === Infinity ? `So p = ${p} <b>cannot</b> be made (∞).` : `So c[${p}] = <b>${c[p]}</b>, s[${p}] = ${s[p]}.`}`, p, src: D.filter(d => d <= p).map(d => p - d) });
    }
    if (c[n] === Infinity) st.push({ en: `c[${n}] = ∞: the amount ${n} has <b>no solution</b> with coins {${D.join(', ')}}.`, p: n, fin: true });
    else { const path = [n], used = []; let p = n; while (p > 0) { used.push(s[p]); p -= s[p]; path.push(p); }
      st.push({ en: `Follow s[ ] back from p = ${n}: ${path.slice(0, -1).map(q => `s[${q}] = ${s[q]} → p = ${q - s[q]}`).join(', ')}. Coins: ${used.join(' + ')} = ${n}, <b>${c[n]} coins</b>. Time O(n·m) for m coin kinds.`, p: n, fin: true, path }); }
    return { st, c, s };
  }
  function Change() {
    const P = { s37: [16, [1, 5, 12, 25]], s35: [11, [1, 2, 5]], s34a: [10, [1, 5, 7]], s34b: [6, [5, 7]] };
    const [mode, setMode] = useState('s37'), [own, setOwn] = useState([13, [1, 4, 6]]);
    const [n, D] = mode === 'own' ? own : P[mode];
    const { st, c, s } = useMemo(() => changeSteps(n, D), [n, D.join()]);
    const view = (S) => html`<div className="a14-cm">
        <div className="a14-leg"><b>p</b>c[p]<i>s[p]</i></div>
        ${c.map((x, p) => { const on = p <= S.p || S.fin, cur = !S.fin && p === S.p, src = !S.fin && S.src && S.src.includes(p), pa = S.path && S.path.includes(p);
          return html`<div key=${p} className=${(on ? '' : 'a14-hid') + (cur ? ' a14-cur' : '') + (src ? ' a14-src' : '') + (pa ? ' a14-path' : '')}><b>${p}</b>${x === Infinity ? '∞' : x}<i>${s[p] == null ? '–' : s[p]}</i></div>`; })}
      </div>`;
    const head = html`<${Tabs} opts=${[['s37', 'n=16, {1,5,12,25}'], ['s35', 'n=11, {1,2,5}'], ['s34a', 'n=10, {1,5,7}'], ['s34b', 'n=6, {5,7}'], ['own', 'Try your own']]} v=${mode} set=${setMode} />
      ${mode === 'own' && html`<${TryForm} fields=${[{ k: 'n', label: 'n', init: String(own[0]), w: '3.2em' }, { k: 'd', label: 'Coins', init: own[1].join(', '), w: '8em' }]} onOk=${setOwn}
        parse=${v => { const a = +v.n, d = [...new Set(ints(v.d))].sort((x, y) => x - y); return !isInt(a, 1, 30) ? { err: 'Amount n must be 1 to 30.' } : !d.length || d.length > 5 || !d.every(x => isInt(x, 1, 30)) ? { err: 'Give 1 to 5 coin values from 1 to 30.' } : { ok: [a, d] }; }} />`}`;
    return html`<figure className="fig"><${Player} key=${mode + n + D.join()} steps=${st} view=${view} head=${head} ms=${1300} /></figure>`;
  }

  window.FIGS = Object.assign(window.FIGS || {}, {
    'ag-14-fib': Fib, 'ag-14-coinrow': CoinRow, 'ag-14-binom': Binom, 'ag-14-robot': Robot,
    'ag-14-lcs-match': LcsMatch, 'ag-14-lcs': LcsTable, 'ag-14-knap': Knap, 'ag-14-change': Change
  });
})();
/* ── part L15 ── */
// Algorithms visuals, Lecture 15 (Greedy Algorithms): counting money and the krons failure (slides 4-5), the 9-job scheduling problem
// (6-8), Huffman encoding (9), the minimum spanning tree (10), the greedy traveling salesman (11), connecting wires (17) and
// collecting coins with robots (18). Every label and number comes from the slides.
(function () {
  const { useState, useEffect, useRef, useMemo } = React;
  const { html, useSteps, Cap, Bar, pop, calm, useClock, useFit, sec } = window.FIGKIT;
  const CSS = `
.a15-tabs{ display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin:0 0 10px; }
.a15-tabs .fig-btn{ font-size:.84rem; padding:4px 10px; min-height:30px; }
.fig-btn.a15-on{ background:color-mix(in srgb, var(--fig-k) 18%, var(--paper)); border-color:var(--fig-k); box-shadow:0 0 0 1px var(--fig-k); }
.a15-form{ display:flex; flex-wrap:wrap; gap:6px 8px; align-items:center; justify-content:center; margin:0 0 10px; font-size:.88rem; color:var(--ink); }
.a15-form label{ display:flex; gap:5px; align-items:center; }
.a15-form input{ font:inherit; font-size:.9rem; padding:4px 6px; border:1px solid var(--line); border-radius:6px; background:var(--paper); color:var(--ink); min-width:0; box-sizing:border-box; }
.a15-err{ width:100%; text-align:center; color:var(--pen); font-size:.85rem; }
.a15-hint{ text-align:center; font-size:.84rem; color:var(--graphite); margin:0 0 8px; }
.a15-cnt{ font-size:.84rem; color:var(--graphite); }
.a15-info{ text-align:center; font-size:.88rem; color:var(--ink); margin:8px 0 0; min-height:1.4em; line-height:1.45; }
.a15-pile{ display:flex; flex-wrap:wrap; gap:5px; justify-content:center; align-items:center; min-height:44px; margin:4px 0; }
.a15-c{ min-width:38px; height:38px; padding:0 4px; box-sizing:border-box; border-radius:99px; display:grid; place-items:center; font-weight:700; font-size:.82rem; color:var(--ink); background:color-mix(in srgb, var(--fig-k) 18%, var(--paper)); border:2px solid var(--fig-k); animation:a15in .35s ease both; }
.a15-c.a15-bill{ border-radius:6px; min-width:50px; background:color-mix(in srgb, var(--ok) 20%, var(--paper)); border-color:var(--ok); }
.a15-c.a15-opt{ background:color-mix(in srgb, var(--ok) 22%, var(--paper)); border-color:var(--ok); }
@keyframes a15in{ from{ opacity:0; transform:scale(.6); } to{ opacity:1; transform:none; } }
.a15-row{ display:flex; justify-content:space-between; align-items:baseline; gap:8px; font-size:.88rem; color:var(--graphite); margin:6px 2px 0; }
.a15-row b{ color:var(--ink); font-size:1rem; }
.a15-jobs{ display:flex; flex-wrap:wrap; gap:4px; justify-content:center; margin:0 0 10px; font-size:.86rem; }
.a15-jobs span{ border:1px solid var(--line); border-radius:6px; padding:2px 7px; background:var(--paper); color:var(--ink); transition:opacity .3s; }
.a15-jobs span.a15-used{ opacity:.3; } .a15-jobs span.a15-now{ box-shadow:0 0 0 2px var(--fig-k); }
.a15-g{ display:grid; grid-template-columns:26px minmax(0, 1fr) 30px; gap:6px 6px; align-items:center; }
.a15-g .a15-p{ font-weight:700; font-size:.88rem; color:var(--ink); }
.a15-g .a15-tr{ display:flex; height:32px; background:var(--paper); border:1px solid var(--line); border-radius:4px; overflow:hidden; }
.a15-g .a15-tr span{ display:grid; place-items:center; font-size:.8rem; font-weight:600; color:var(--ink); border-right:1px solid var(--graphite); box-sizing:border-box; min-width:0; overflow:hidden; animation:a15in .35s ease both; }
.a15-g .a15-tr span.a15-new{ background:color-mix(in srgb, var(--fig-k) 34%, var(--paper)); }
.a15-g .a15-tr span.a15-old{ background:color-mix(in srgb, var(--fig-k) 14%, var(--paper)); }
.a15-g .a15-end{ font-size:.84rem; color:var(--graphite); text-align:right; font-variant-numeric:tabular-nums; }
.a15-g .a15-end.a15-max{ color:var(--ink); font-weight:700; }
.a15-chips{ display:flex; flex-wrap:wrap; gap:5px; justify-content:center; margin:8px 0 0; font-size:.86rem; }
.a15-chips span{ border:1px solid var(--line); border-radius:99px; padding:2px 9px; background:var(--paper); color:var(--ink); }
.a15-chips span.a15-hl{ border-color:var(--fig-k); box-shadow:0 0 0 1px var(--fig-k); background:color-mix(in srgb, var(--fig-k) 16%, var(--paper)); }
.a15-hit{ cursor:pointer; }
@media (prefers-reduced-motion: reduce){ .a15-c, .a15-g .a15-tr span{ animation:none; } }`;
  if (!document.getElementById('a15-css')) { const s = document.createElement('style'); s.id = 'a15-css'; s.textContent = CSS; document.head.appendChild(s); }

  // ── shared helpers ──
  function Bar2({ n, i, ctl }) {
    if (n <= 14) return html`<${Bar} steps=${Array.from({ length: n })} i=${i} ctl=${ctl} />`;
    return html`<div className="fig-bar"><span className="a15-cnt">Step ${i + 1} / ${n}</span><span className="grow"></span>
      <button className="fig-btn" onClick=${() => ctl.go(Math.max(0, i - 1))} disabled=${i === 0} aria-label="Previous step">‹ Back</button>
      <button className="fig-btn" onClick=${() => ctl.go(Math.min(n - 1, i + 1))} disabled=${i === n - 1} aria-label="Next step">Next ›</button>
      <button className="fig-btn" onClick=${ctl.replay}>↻ Replay</button></div>`;
  }
  function Player({ steps, view, head, ms = 1800 }) {
    const [i, ctl] = useSteps(steps.length, ms);
    const s = steps[Math.min(i, steps.length - 1)];
    return html`<div className="fig-stage">${head}${view(s, i)}</div><${Cap} en=${s.en} /><${Bar2} n=${steps.length} i=${i} ctl=${ctl} />`;
  }
  const Tabs = ({ opts, v, set }) => html`<div className="a15-tabs">${opts.map(([k, l]) => html`<button key=${k} className=${'fig-btn' + (v === k ? ' a15-on' : '')} onClick=${() => set(k)}>${l}</button>`)}</div>`;
  // fields: [{ k, label, init, w }]; parse(values) → { err } or { ok }
  function TryForm({ fields, parse, onOk }) {
    const [vals, setVals] = useState(() => Object.fromEntries(fields.map(f => [f.k, f.init])));
    const [err, setErr] = useState('');
    const go = e => { e && e.preventDefault(); const r = parse(vals); if (r.err) setErr(r.err); else { setErr(''); onOk(r.ok); } };
    return html`<form className="a15-form" onSubmit=${go}>
      ${fields.map(f => html`<label key=${f.k}>${f.label}<input value=${vals[f.k]} style=${{ width: f.w || '8em' }} onInput=${e => setVals(v => ({ ...v, [f.k]: e.target.value }))} /></label>`)}
      <button className="fig-btn solid" type="submit">Run</button>
      ${err && html`<div className="a15-err">${err}</div>`}</form>`;
  }
  const ints = s => String(s).split(/[\s,;]+/).filter(Boolean).map(Number);
  const isInt = (x, lo, hi) => Number.isInteger(x) && x >= lo && x <= hi;


  /* ── slides 4-5: counting money greedily ($6.39) and the krons failure (15 krons) ── */
  function bestCoins(D, amt) { const c = [0], s = [0]; for (let p = 1; p <= amt; p++) { c[p] = Infinity; for (const d of D) if (d <= p && c[p - d] + 1 < c[p]) { c[p] = c[p - d] + 1; s[p] = d; } }
    if (c[amt] === Infinity) return null; const out = []; let p = amt; while (p > 0) { out.push(s[p]); p -= s[p]; } return out.sort((a, b) => b - a); }
  function Money() {
    const US = [500, 100, 25, 10, 5, 1], usLab = d => d >= 100 ? '$' + d / 100 : d + '¢', usAmt = a => '$' + (a / 100).toFixed(2);
    const [mode, setMode] = useState('us'), [own, setOwn] = useState({ D: [1, 3, 4], amt: 6 });
    const cfg = mode === 'us' ? { D: US, amt: 639, lab: usLab, fmt: usAmt, unit: 'pieces' } : mode === 'kr' ? { D: [10, 7, 1], amt: 15, lab: d => d + ' kr', fmt: a => a + ' krons', unit: 'coins' } : { D: own.D, amt: own.amt, lab: d => String(d), fmt: a => String(a), unit: 'coins' };
    const { D, amt, lab, fmt, unit } = cfg;
    const steps = useMemo(() => {
      const st = [{ en: `Make ${fmt(amt)} with the fewest ${unit}. Greedy rule: at each step take the <b>largest</b> ${mode === 'us' ? 'bill or coin' : 'coin'} that does not overshoot. Available: ${D.map(lab).join(', ')}.`, got: [] }];
      let left = amt, got = [];
      for (const d of D) { const k = Math.floor(left / d); if (!k) continue; left -= k * d; got = got.concat(Array(k).fill(d));
        st.push({ en: `Take ${k === 1 ? 'a' : k} ${lab(d)}${k > 1 ? ' pieces' : ''}, to make ${fmt(amt - left)}${left ? ` (${fmt(left)} still to go)` : ''}.`, got: got.slice() }); }
      const opt = bestCoins(D, amt);
      if (left) st.push({ en: `Greedy is stuck: ${fmt(left)} is left and no coin is small enough. ${opt ? `Yet ${opt.map(lab).join(' + ')} works.` : 'No combination makes this amount.'}`, got, opt, fin: true });
      else st.push({ en: opt.length === got.length ? `Greedy used ${got.length} ${unit}, and the fewest possible (checked by DP) is also ${opt.length}: here greedy is optimal${mode === 'us' ? '; for US money it always is' : ''}.`
        : `Greedy used <b>${got.length}</b> ${unit}, but ${opt.map(lab).join(' + ')} needs only <b>${opt.length}</b>. The greedy algorithm results in a solution, but not an optimal one.`, got, opt, fin: true });
      return st;
    }, [mode, JSON.stringify(own)]);
    const chip = (d, k, cls) => html`<span key=${k} className=${'a15-c ' + (mode === 'us' && d >= 100 ? 'a15-bill ' : '') + (cls || '')}>${lab(d)}</span>`;
    const view = (s) => html`<div className="a15-row"><span>Greedy</span><b>${s.got.length} ${unit}, ${fmt(s.got.reduce((a, b) => a + b, 0))}</b></div>
      <div className="a15-pile">${s.got.map((d, k) => chip(d, k))}</div>
      ${s.fin && s.opt && html`<div className="a15-row"><span>Fewest possible</span><b>${s.opt.length} ${unit}</b></div><div className="a15-pile">${s.opt.map((d, k) => chip(d, 'o' + k, 'a15-opt'))}</div>`}`;
    const head = html`<${Tabs} opts=${[['us', '$6.39, US money'], ['kr', '15 krons'], ['own', 'Try your own']]} v=${mode} set=${setMode} />
      ${mode === 'own' && html`<${TryForm} fields=${[{ k: 'd', label: 'Coins', init: own.D.join(', '), w: '7em' }, { k: 'a', label: 'Amount', init: String(own.amt), w: '4em' }]} onOk=${setOwn}
        parse=${v => { const d = [...new Set(ints(v.d))].sort((x, y) => y - x), a = +v.a; return !d.length || d.length > 6 || !d.every(x => isInt(x, 1, 100)) ? { err: 'Give 1 to 6 coin values from 1 to 100.' } : !isInt(a, 1, 300) ? { err: 'Amount must be 1 to 300.' } : { ok: { D: d, amt: a } }; }} />`}`;
    return html`<figure className="fig"><${Player} key=${mode + JSON.stringify(own)} steps=${steps} view=${view} head=${head} ms=${1700} /></figure>`;
  }

  /* ── slides 6-8: nine jobs on three processors ── */
  const JOBS = [3, 5, 6, 10, 11, 14, 15, 18, 20];
  function greedySched(jobs, P, longest) {
    const order = jobs.slice().sort((a, b) => longest ? b - a : a - b), lanes = Array.from({ length: P }, () => []), st = [];
    for (const t of order) { const end = lanes.map(l => l.reduce((a, b) => a + b, 0)), k = end.indexOf(Math.min(...end)); lanes[k].push(t); st.push({ t, k, at: end[k] }); }
    return { lanes, st };
  }
  function optSched(jobs, P) {
    const js = jobs.slice().sort((a, b) => b - a), lanes = Array.from({ length: P }, () => []), load = Array(P).fill(0); let best = Infinity, bestL = null;
    (function go(i) { const mx = Math.max(...load); if (mx >= best) return; if (i === js.length) { best = mx; bestL = lanes.map(l => l.slice()); return; }
      const seen = new Set(); for (let k = 0; k < P; k++) { if (seen.has(load[k])) continue; seen.add(load[k]); load[k] += js[i]; lanes[k].push(js[i]); go(i + 1); lanes[k].pop(); load[k] -= js[i]; } })(0);
    return bestL;
  }
  function Sched() {
    const [mode, setMode] = useState('lpt'), [cfg, setCfg] = useState({ jobs: JOBS, P: 3, slide: true });
    const { jobs, P } = cfg, sum = jobs.reduce((a, b) => a + b, 0);
    const R = useMemo(() => {
      const lpt = greedySched(jobs, P, true), spt = greedySched(jobs, P, false);
      const opt = cfg.slide ? [[20, 14], [18, 11, 5], [15, 10, 6, 3]] : optSched(jobs, P);
      const ms = l => Math.max(...l.map(x => x.reduce((a, b) => a + b, 0)));
      return { lpt, spt, opt, scale: Math.max(ms(lpt.lanes), ms(spt.lanes)), ms };
    }, [JSON.stringify(cfg)]);
    const lanesAt = (G, n) => { const L = Array.from({ length: P }, () => []); G.st.slice(0, n).forEach(x => L[x.k].push(x.t)); return L; };
    const endTxt = L => { const e = L.map(l => l.reduce((a, b) => a + b, 0)), m = Math.max(...e), k = e.indexOf(m); return `${L[k].join(' + ')} = ${m}`; };
    const steps = useMemo(() => {
      if (mode === 'opt') { const L = R.opt, m = R.ms(L);
        return [{ en: `A better schedule exists: finishing time <b>${m}</b> minutes.`, L },
          { en: `${m * P === sum ? `It is clearly optimal: the jobs total ${sum} minutes, and ${sum} / ${P} = ${m}, so ${P} processors can never all be done sooner.` : `No assignment finishes sooner: all ${P}<sup>${jobs.length}</sup> ways of assigning jobs to processors were checked.`} Other optimal schedules exist too (e.g. swap two processors' rows). Finding one in general means trying assignments, which can take exponential time.`, L }]; }
      const G = mode === 'lpt' ? R.lpt : R.spt, word = mode === 'lpt' ? 'longest' : 'shortest';
      const st = [{ en: `Run ${jobs.length} jobs (${jobs.join(', ')} minutes) on ${P} processors. Greedy: take the <b>${word}</b> remaining job and put it on whichever processor is free first.`, L: lanesAt(G, 0) }];
      G.st.forEach((x, n) => st.push({ en: `Job ${x.t}: P${x.k + 1} is free first (at time ${x.at}), so it runs there until ${x.at + x.t}.`, L: lanesAt(G, n + 1), now: n }));
      const L = G.lanes; st.push({ en: `Time to completion: <b>${endTxt(L)}</b> minutes.${mode === 'spt' ? ' Not such a good idea; still, the greedy algorithm itself is fast: each stage only picks the minimum.' : ' Not bad, but we might do better.'}`, L, fin: true });
      return st;
    }, [mode, R]);
    const view = (s) => { const used = s.now != null ? s.now + 1 : s.fin ? jobs.length : 0, order = mode === 'opt' ? [] : (mode === 'lpt' ? R.lpt : R.spt).st.map(x => x.t);
      const end = s.L.map(l => l.reduce((a, b) => a + b, 0)), mx = Math.max(...end, 0);
      return html`${mode !== 'opt' && html`<div className="a15-jobs">${order.map((t, k) => html`<span key=${k} className=${k < used ? (k === used - 1 && !s.fin ? 'a15-now' : 'a15-used') : ''}>${t}</span>`)}</div>`}
        <div className="a15-g">${s.L.map((l, k) => html`<span key=${'p' + k} className="a15-p">P${k + 1}</span>
          <div key=${'t' + k} className="a15-tr">${l.map((t, j) => html`<span key=${j} className=${s.now != null && j === l.length - 1 && s.L[k].length && (mode === 'lpt' ? R.lpt : R.spt).st[s.now].k === k ? 'a15-new' : 'a15-old'} style=${{ width: (t / R.scale * 100) + '%' }}>${t}</span>`)}</div>
          <span key=${'e' + k} className=${'a15-end' + (end[k] === mx && mx ? ' a15-max' : '')}>${end[k]}</span>`)}</div>`; };
    const head = html`<${Tabs} opts=${[['lpt', 'Longest first'], ['spt', 'Shortest first'], ['opt', 'Optimum']]} v=${mode} set=${setMode} />
      <${TryForm} fields=${[{ k: 'j', label: 'Jobs', init: JOBS.join(', '), w: '11em' }, { k: 'p', label: 'Processors', init: '3', w: '2.6em' }]} onOk=${setCfg}
        parse=${v => { const j = ints(v.j), p = +v.p; if (j.length < 2 || j.length > 9 || !j.every(x => isInt(x, 1, 60))) return { err: 'Give 2 to 9 job times from 1 to 60.' }; if (!isInt(p, 2, 4)) return { err: 'Use 2 to 4 processors.' };
          const sl = p === 3 && j.slice().sort((a, b) => a - b).join() === JOBS.join(); return { ok: { jobs: j, P: p, slide: sl } }; }} />`;
    return html`<figure className="fig"><${Player} key=${mode + JSON.stringify(cfg)} steps=${steps} view=${view} head=${head} ms=${1300} /></figure>`;
  }

  /* ── slide 9: Huffman encoding of A:22 B:12 C:24 D:6 E:27 F:9 ── */
  function Huffman() {
    const F = [['A', 22], ['B', 12], ['C', 24], ['D', 6], ['E', 27], ['F', 9]];
    const T = useMemo(() => {
      const nodes = F.map(([c, w], k) => ({ id: k, c, w, made: -1 })), q = nodes.slice(), merges = [];
      while (q.length > 1) { q.sort((a, b) => a.w - b.w || b.made - a.made || a.id - b.id); const a = q.shift(), b = q.shift();
        const n = { id: nodes.length, w: a.w + b.w, l: a, r: b, made: merges.length }; nodes.push(n); q.push(n); merges.push(n); }
      const root = merges[merges.length - 1], leaves = []; const walk = (n, d, code) => { n.d = d; n.code = code; if (n.l) { walk(n.l, d + 1, code + '0'); walk(n.r, d + 1, code + '1'); } else leaves.push(n); }; walk(root, 0, '');
      leaves.forEach((n, k) => { n.x = 40 + k * 64; }); const setX = n => { if (n.l) { setX(n.l); setX(n.r); n.x = (n.l.x + n.r.x) / 2; } }; setX(root);
      nodes.forEach(n => { n.y = 26 + n.d * 46; });
      const avg = leaves.reduce((a, n) => a + n.w * n.code.length, 0) / 100;
      return { nodes, merges, leaves, avg };
    }, []);
    const M = T.merges.length, nm = x => x.c ? `${x.c} (${x.w})` : `the combined ${x.w}`;
    const steps = [{ en: 'Huffman encoding is greedy: <b>always combine the two smallest numbers</b>. Start with the six letter frequencies A:22, B:12, C:24, D:6, E:27, F:9.', k: 0 },
      ...T.merges.map((n, k) => ({ en: `The two smallest are ${nm(n.l)} and ${nm(n.r)}: combine them into ${n.l.w} + ${n.r.w} = <b>${n.w}</b>.${k === 3 ? ' (27 and 27 tie; the slide puts the combined 27 on the left.)' : ''}`, k: k + 1 })),
      { en: 'Label left branches 0 and right branches 1: each letter\'s code is the path from the root. ' + T.leaves.map(n => `${n.c}=${n.code}`).join(', ') + '.', k: M, codes: true },
      { en: `Average bits/char = ${T.leaves.map(n => `0.${String(n.w).padStart(2, '0')}·${n.code.length}`).join(' + ')} = <b>${T.avg.toFixed(2)}</b>. The Huffman algorithm finds an optimal code.`, k: M, codes: true, avg: true }];
    const view = (s) => { const on = n => !n.l || n.made < s.k, live = T.nodes.filter(n => on(n) && !T.nodes.some(p => p.l && on(p) && (p.l === n || p.r === n))).map(n => n.w).sort((a, b) => a - b);
      const nw = s.k > 0 && s.k <= M && !s.codes ? T.merges[s.k - 1] : null;
      return html`<svg viewBox="0 0 400 280" role="img" aria-label="Huffman tree">
        ${T.nodes.filter(n => n.l && on(n)).map(n => [n.l, n.r].map((c, j) => html`<g key=${n.id + '-' + j}><line x1=${n.x} y1=${n.y + 17} x2=${c.x} y2=${c.y - 17} stroke=${nw === n ? 'var(--fig-k)' : 'var(--graphite)'} strokeWidth=${nw === n ? 3 : 1.6} />
          ${s.codes && html`<text x=${(n.x + c.x) / 2 + (j ? 9 : -9)} y=${(n.y + c.y) / 2 + 4} textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--fig-k)">${j}</text>`}</g>`))}
        ${T.nodes.filter(on).map(n => html`<g key=${n.id}><circle cx=${n.x} cy=${n.y} r="18" fill=${nw === n ? 'color-mix(in srgb, var(--fig-k) 35%, var(--paper))' : n.l ? 'var(--paper-2)' : 'var(--paper)'} stroke=${n.l ? 'var(--fig-k)' : 'var(--graphite)'} strokeWidth="2" />
          <text x=${n.x} y=${n.y + 6} textAnchor="middle" fontSize="18" fontWeight="600">${n.w}</text>
          ${!n.l && html`<text x=${n.x} y=${n.y + 40} textAnchor="middle" fontSize="18" fontWeight="700">${n.c}</text>`}
          ${!n.l && s.codes && html`<text x=${n.x} y=${n.y + 60} textAnchor="middle" fontSize="18" fill="var(--ok)" fontWeight="700">${n.code}</text>`}</g>`)}
      </svg>
      ${!s.codes && html`<div className="a15-chips">${live.map((w, k) => html`<span key=${k} className=${k < 2 && s.k < M ? 'a15-hl' : ''}>${w}</span>`)}</div>`}`; };
    return html`<figure className="fig"><${Player} steps=${steps} view=${view} ms=${2000} /></figure>`;
  }

  /* ── slide 10: minimum spanning tree, growing the tree from node 1 ── */
  const MV = { 1: [40, 118], 2: [40, 298], 3: [160, 210], 4: [282, 298], 5: [282, 118], 6: [244, 30] };
  const ME = [[1, 6, 4], [1, 5, 4], [1, 3, 3], [1, 2, 3], [2, 3, 3], [2, 4, 4], [3, 5, 2], [3, 4, 2], [4, 5, 3], [5, 6, 2]];
  const LBL = { '1-6': [128, 62], '1-5': [160, 106], '1-3': [96, 152], '1-2': [24, 210], '2-3': [114, 270], '2-4': [160, 316], '3-5': [238, 178], '3-4': [208, 274], '4-5': [298, 210], '5-6': [276, 70] };
  function Mst() {
    const ORDER = [[1, 2], [2, 3], [3, 5], [3, 4], [5, 6]], [pick, setPick] = useState(null);
    const key = (a, b) => Math.min(a, b) + '-' + Math.max(a, b), cost = (a, b) => ME.find(e => key(e[0], e[1]) === key(a, b))[2];
    const steps = useMemo(() => {
      const st = [{ en: 'A minimum spanning tree is a least-cost subset of the edges that connects all the nodes. Start by picking any node, here node 1, and adding it to the tree.', inT: [1], tE: [] }];
      const inT = [1], tE = [];
      for (const [a, b] of ORDER) { const cand = ME.filter(e => inT.includes(e[0]) !== inT.includes(e[1])), mn = Math.min(...cand.map(e => e[2])), ties = cand.filter(e => e[2] === mn && key(e[0], e[1]) !== key(a, b));
        tE.push(key(a, b)); inT.push(inT.includes(a) ? b : a);
        st.push({ en: `Edges from the tree to a new node: ${cand.map(e => `${e[0]}–${e[1]} (${e[2]})`).join(', ')}. Take a least-cost one, <b>${a}–${b} (${cost(a, b)})</b>${ties.length ? `; ${ties.map(e => `${e[0]}–${e[1]}`).join(', ')} cost${ties.length > 1 ? '' : 's'} the same, and the slide's tree uses ${a}–${b}` : ''}.`, inT: inT.slice(), tE: tE.slice(), cand: cand.map(e => key(e[0], e[1])) }); }
      st.push({ en: `All nodes are in: the least-cost spanning tree costs ${ORDER.map(([a, b]) => cost(a, b)).join(' + ')} = <b>${ORDER.reduce((s, [a, b]) => s + cost(a, b), 0)}</b>. Think another edge belongs in it? <b>Tap a grey edge</b> to try adding it.`, inT: inT.slice(), tE: tE.slice(), fin: true });
      return st;
    }, []);
    const cycle = useMemo(() => { if (!pick) return null; const [a, b] = pick.split('-').map(Number), T = ORDER.map(([x, y]) => [x, y]);
      const adj = {}; T.forEach(([x, y]) => { (adj[x] = adj[x] || []).push(y); (adj[y] = adj[y] || []).push(x); });
      const prev = { [a]: 0 }, q = [a]; while (q.length) { const u = q.shift(); for (const v of adj[u] || []) if (!(v in prev)) { prev[v] = u; q.push(v); } }
      const path = [b]; while (path[path.length - 1] !== a) path.push(prev[path[path.length - 1]]);
      const es = path.slice(1).map((v, k) => key(v, path[k])), mx = Math.max(...es.map(e => cost(...e.split('-').map(Number)))), c = cost(a, b);
      return { es, path, c, mx, txt: `Adding ${a}–${b} (${c}) closes the cycle ${path.concat(b).join('–')}. ${c > mx ? `To break it, remove the edge with the greatest cost: that is ${a}–${b} itself, the edge you just added.` : `Its other edges cost at most ${mx} = ${c}: swapping gives another spanning tree of the same cost 12, never a cheaper one.`}` }; }, [pick]);
    const view = (s) => html`<svg viewBox="0 0 330 336" role="img" aria-label="Graph with nodes 1 to 6 and its minimum spanning tree">
        ${ME.map(([a, b, w]) => { const k = key(a, b), inTree = s.tE.includes(k), last = s.tE[s.tE.length - 1] === k && !s.fin, cand = s.cand && s.cand.includes(k) && !inTree, cyc = s.fin && cycle && (cycle.es.includes(k) || pick === k);
          const [x1, y1] = MV[a], [x2, y2] = MV[b], [lx, ly] = LBL[k];
          return html`<g key=${k} className=${s.fin && !inTree ? 'a15-hit' : ''} onClick=${() => s.fin && !inTree && setPick(k)}>
            <line x1=${x1} y1=${y1} x2=${x2} y2=${y2} stroke="transparent" strokeWidth="18" />
            <line x1=${x1} y1=${y1} x2=${x2} y2=${y2} stroke=${cyc ? (pick === k ? 'var(--pen)' : 'var(--fig-k)') : inTree ? 'var(--ok)' : 'var(--graphite)'} strokeWidth=${inTree || cyc ? (last ? 6 : 4.5) : 1.6} strokeDasharray=${cand ? '6 5' : pick === k && s.fin ? '7 4' : ''} />
            <text x=${lx} y=${ly + 6} textAnchor="middle" fontSize="18" fontWeight=${inTree ? 700 : 400} fill=${cand ? 'var(--fig-k)' : 'var(--ink)'}>${w}</text></g>`; })}
        ${Object.entries(MV).map(([v, [x, y]]) => html`<g key=${v}><circle cx=${x} cy=${y} r="15" fill=${s.inT.includes(+v) ? 'color-mix(in srgb, var(--ok) 40%, var(--paper))' : 'var(--paper)'} stroke="var(--ink)" strokeWidth="2" /><text x=${x} y=${y + 6} textAnchor="middle" fontSize="18" fontWeight="700">${v}</text></g>`)}
      </svg>
      ${s.fin && html`<p className="a15-info">${cycle ? cycle.txt : 'Tap a grey edge to add it to the tree.'}</p>`}`;
    return html`<figure className="fig"><${Player} steps=${steps} view=${view} ms=${2200} /></figure>`;
  }

  /* ── slide 11: greedy traveling salesman from A ── */
  function Tsp() {
    const V = { A: [40, 60], B: [132, 60], C: [330, 60], D: [86, 218], E: [226, 262] };
    const E = [['A', 'B', 2], ['B', 'C', 4], ['A', 'D', 3], ['B', 'D', 3], ['B', 'E', 4], ['C', 'E', 4]];
    const w = (a, b) => E.find(e => (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a))[2];
    const tour = (p) => p.slice(1).map((v, k) => w(p[k], v));
    const G = ['A', 'B', 'D', 'B', 'C', 'E'], O = ['A', 'D', 'B', 'C', 'E'];
    const steps = [
      { en: 'A salesman must visit every city, starting from A, covering the least distance; he may revisit a city and reuse a road. Greedy: always go to the <b>nearest</b> city not yet visited.', p: ['A'] },
      { en: 'From A: B costs 2, D costs 3. He goes to the nearest, <b>B</b>.', p: G.slice(0, 2) },
      { en: 'From B: D costs 3, C costs 4, E costs 4. He goes to <b>D</b>. This is not going to result in a shortest path!', p: G.slice(0, 3) },
      { en: 'D\'s only roads lead back to A and B, both visited, so he must go back to B (3 more).', p: G.slice(0, 4) },
      { en: 'From B: C and E both cost 4. Go to C, then the last city E.', p: G.slice(0, 5) },
      { en: `Greedy route <b>${G.join('')}</b>: ${tour(G).join(' + ')} = <b>${tour(G).reduce((a, b) => a + b)}</b>. That is the best he can get after the first greedy choices.`, p: G },
      { en: `An actual least-cost path from A is <b>${O.join('')}</b>: ${tour(O).join(' + ')} = <b>${tour(O).reduce((a, b) => a + b)}</b>. Taking the cheapest first step (A–B, 2) trapped him into paying for B–D twice.`, p: O, opt: true }];
    const view = (s) => { const used = {}; s.p.slice(1).forEach((v, k) => { const kk = [s.p[k], v].sort().join(); used[kk] = (used[kk] || 0) + 1; });
      const col = s.opt ? 'var(--ok)' : 'var(--fig-k)';
      return html`<svg viewBox="0 0 370 300" role="img" aria-label="Five cities A to E and the salesman's route">
        ${E.map(([a, b, c]) => { const k = [a, b].sort().join(), [x1, y1] = V[a], [x2, y2] = V[b], n = used[k] || 0, mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
          const off = a + b === 'AB' || a + b === 'BC' ? [0, -16] : a + b === 'AD' ? [-16, 0] : a + b === 'BD' ? [33, 7] : a + b === 'BE' ? [-16, 4] : [16, 0];
          return html`<g key=${k}><line x1=${x1} y1=${y1} x2=${x2} y2=${y2} stroke=${n ? col : 'var(--graphite)'} strokeWidth=${n ? 5 : 1.6} />
            ${n === 2 && html`<line x1=${x1 + 7} y1=${y1} x2=${x2 + 7} y2=${y2} stroke=${col} strokeWidth="3" strokeDasharray="6 4" />`}
            <text x=${mx + off[0]} y=${my + off[1] + 6} textAnchor="middle" fontSize="18" fontWeight=${n ? 700 : 400}>${c}${n === 2 ? ' ×2' : ''}</text></g>`; })}
        ${Object.entries(V).map(([v, [x, y]]) => { const cur = s.p[s.p.length - 1] === v; return html`<g key=${v}><circle cx=${x} cy=${y} r="17" fill=${s.p.includes(v) ? `color-mix(in srgb, ${col} 32%, var(--paper))` : 'var(--paper)'} stroke=${cur ? col : 'var(--ink)'} strokeWidth=${cur ? 4 : 2} /><text x=${x} y=${y + 6} textAnchor="middle" fontSize="18" fontWeight="700">${v}</text></g>`; })}
      </svg>
      <p className="a15-info">${s.opt ? 'Optimal' : 'Greedy'} route: <b>${s.p.join(' → ')}</b>, cost ${s.p.length > 1 ? tour(s.p).reduce((a, b) => a + b) : 0}</p>`; };
    return html`<figure className="fig"><${Player} steps=${steps} view=${view} ms=${2200} /></figure>`;
  }

  /* ── slide 17: connecting n white and n black dots ── */
  function Wires() {
    const SL = 'BBWBWWWB', [mode, setMode] = useState('slide'), [own, setOwn] = useState('BWWBBW');
    const dots = mode === 'slide' ? SL : own, n = dots.length, nb = [...dots].filter(c => c === 'B').length;
    const R = useMemo(() => { if (nb * 2 !== n) return null;
      const W = [...dots].map((c, k) => c === 'W' ? k : -1).filter(k => k >= 0), B = [...dots].map((c, k) => c === 'B' ? k : -1).filter(k => k >= 0);
      const greedy = W.map((x, k) => [x, B[k]]), len = P => P.reduce((a, [x, y]) => a + Math.abs(x - y), 0);
      let best = Infinity, cnt = 0; (function go(i, used, s) { if (s >= best && i < W.length) return; if (i === W.length) { cnt++; best = Math.min(best, s); return; } for (let j = 0; j < B.length; j++) if (!(used >> j & 1)) go(i + 1, used | 1 << j, s + Math.abs(W[i] - B[j])); })(0, 0, 0);
      let f = 1; for (let k = 2; k <= W.length; k++) f *= k;
      return { greedy, gl: len(greedy), best, f, slide: [[1, 2], [3, 4], [6, 7], [0, 5]] };
    }, [dots]);
    const steps = !R ? [{ en: `There are ${nb} black and ${n - nb} white dots: the counts must be equal. Tap dots to change their colour.` }] : [
      { en: `There are ${n / 2} white and ${n / 2} black dots, equally spaced in a line. Connect each white dot with some one black dot, using the minimum total length of wire.` },
      ...(mode === 'slide' ? [{ en: 'The slide\'s wiring: total wire length 1 + 1 + 1 + 5 = <b>8</b>.', P: R.slide }] : []),
      { en: `A greedy algorithm: connect the k-th white dot from the left to the k-th black dot from the left. Lengths ${R.greedy.map(([x, y]) => Math.abs(x - y)).join(' + ')} = <b>${R.gl}</b>.`, P: R.greedy },
      { en: `Checking all ${R.f} ways to pair them, the minimum is <b>${R.best}</b>, so the greedy answer ${R.gl === R.best ? 'is optimal. It always is: if two wires cross or nest, re-pairing their ends in left-to-right order never makes the total longer.' : 'is not optimal here.'}`, P: R.greedy, fin: true }];
    const gap = Math.min(46, 360 / Math.max(1, n - 1)), X = k => 200 + (k - (n - 1) / 2) * gap;
    const view = (s) => html`<svg viewBox="0 0 400 198" role="img" aria-label="White and black dots on a line with wires">
        ${s.P && s.P.slice().sort((a, b) => Math.abs(a[0] - a[1]) - Math.abs(b[0] - b[1])).map(([a, b], k) => { const h = 138 - 16 - k * 22, x1 = X(a), x2 = X(b);
          return html`<g key=${a + '-' + b}><path d=${`M${x1} 118 V${h} H${x2} V138`} fill="none" stroke="var(--fig-k)" strokeWidth="2.5" />
            <text x=${(x1 + x2) / 2} y=${h - 5} textAnchor="middle" fontSize="18" fontWeight="600" stroke="var(--paper-2)" strokeWidth="5" paintOrder="stroke">${Math.abs(a - b)}</text></g>`; })}
        ${[...dots].map((c, k) => html`<circle key=${k} cx=${X(k)} cy="150" r="13" fill=${c === 'B' ? '#1b1d22' : '#ffffff'} stroke="var(--ink)" strokeWidth="2.5"
          className=${mode === 'own' ? 'a15-hit' : ''} onClick=${() => mode === 'own' && setOwn(o => o.slice(0, k) + (o[k] === 'B' ? 'W' : 'B') + o.slice(k + 1))} />`)}
        <text x="200" y="190" textAnchor="middle" fontSize="18" fill="var(--graphite)">${s.P ? `total = ${s.P.reduce((a, [x, y]) => a + Math.abs(x - y), 0)}` : ''}</text>
      </svg>`;
    const head = html`<${Tabs} opts=${[['slide', 'Example from the slide'], ['own', 'Try your own']]} v=${mode} set=${setMode} />
      ${mode === 'own' && html`<div className="a15-form"><span>Tap a dot to flip it.</span><button className="fig-btn" onClick=${() => setOwn(o => o.length < 10 ? o + 'BW' : o)}>+ 2 dots</button><button className="fig-btn" onClick=${() => setOwn(o => o.length > 2 ? o.slice(0, -2) : o)}>− 2 dots</button></div>`}`;
    return html`<figure className="fig"><${Player} key=${mode + dots} steps=${steps} view=${view} head=${head} ms=${2300} /></figure>`;
  }

  /* ── slide 18: collecting all coins with the fewest robots ── */
  const BOARD = [[2, 6], [3, 3], [3, 8], [4, 4], [4, 6], [5, 3], [5, 6], [6, 8], [8, 6], [8, 7]].map(x => x.join(','));
  const RC = ['var(--fig-k)', 'var(--ok)', '#d97706', 'var(--pen)', 'var(--graphite)'];
  function Robots() {
    const [mode, setMode] = useState('slide'), [own, setOwn] = useState(BOARD);
    const coins = mode === 'slide' ? BOARD : own, N = 8;
    const R = useMemo(() => {
      let left = coins.map(s => s.split(',').map(Number)); const robots = [];
      while (left.length && robots.length < 12) { let c = 1; const pts = [[1, 1]], got = [];
        for (let r = 1; r <= N; r++) { const row = left.filter(([y, x]) => y === r && x >= c); if (row.length) { const mx = Math.max(...row.map(p => p[1])); got.push(...row); c = mx; pts.push([r, c]); }
          if (r === N) { if (c < N) pts.push([N, N]); } else pts.push([r + 1, c]); }
        left = left.filter(p => !got.includes(p)); robots.push({ pts, got: got.map(p => p.join(',')) }); }
      const P = coins.map(s => s.split(',').map(Number)).sort((a, b) => a[0] - b[0] || b[1] - a[1]), L = P.map(() => 1), pr = P.map(() => -1);
      P.forEach((p, i) => { for (let j = 0; j < i; j++) if (P[j][0] < p[0] && P[j][1] > p[1] && L[j] + 1 > L[i]) { L[i] = L[j] + 1; pr[i] = j; } });
      let bi = L.indexOf(Math.max(0, ...L)), anti = []; while (bi >= 0) { anti.unshift(P[bi].join(',')); bi = pr[bi]; }
      return { robots, anti };
    }, [coins.slice().sort().join(';')]);
    const steps = [
      { en: `A robot starts in the upper-left corner, moves only right and down, and collects coins on the way to the bottom-right corner (the slide says "bottom left-hand corner", but moving only right and down it ends bottom-right). Goal: collect <b>all</b> ${coins.length} coins with the fewest robots.`, r: 0 },
      ...R.robots.map((rb, k) => ({ en: `Greedy robot ${k + 1}: in each row, go right as far as the rightmost coin still to collect (if it is not behind it), then step down. It collects ${rb.got.length} coin${rb.got.length === 1 ? '' : 's'}: ${rb.got.map(g => `(${g})`).join(', ')}.`, r: k + 1 })),
      { en: `Greedy uses <b>${R.robots.length}</b> robot${R.robots.length === 1 ? '' : 's'}. ${R.anti.length === R.robots.length ? `It is optimal: the coins ${R.anti.map(g => `(${g})`).join(', ')} each lie lower and further left than the one before, so no robot can collect two of them, and at least ${R.anti.length} robots are needed.` : ''}`, r: R.robots.length, anti: true }];
    const cell = 36, o = 6, cx = c => o + (c - .5) * cell, cy = r => o + (r - .5) * cell;
    const view = (s) => { const who = {}; R.robots.slice(0, s.r).forEach((rb, k) => rb.got.forEach(g => { who[g] = k; }));
      return html`<svg viewBox="0 0 300 300" role="img" aria-label="8 by 8 board with coins and robot paths">
        ${Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => html`<rect key=${r + '-' + c} x=${o + c * cell} y=${o + r * cell} width=${cell} height=${cell} fill="var(--paper)" stroke="var(--line)"
          className=${mode === 'own' ? 'a15-hit' : ''} onClick=${() => { if (mode !== 'own') return; const k = (r + 1) + ',' + (c + 1); setOwn(x => x.includes(k) ? x.filter(y => y !== k) : [...x, k]); }} />`))}
        <rect x=${o} y=${o} width=${N * cell} height=${N * cell} fill="none" stroke="var(--ink)" strokeWidth="2" />
        ${R.robots.slice(0, s.r).map((rb, k) => html`<polyline key=${'p' + k} points=${rb.pts.map(([r, c]) => `${cx(c) + (k % 3 - 1) * 5},${cy(r) + (k % 3 - 1) * 5}`).join(' ')} fill="none" stroke=${RC[k % RC.length]} strokeWidth="3.5" strokeLinejoin="round" style=${{ pointerEvents: 'none' }} />`)}
        ${coins.map(g => { const [r, c] = g.split(',').map(Number); return html`<circle key=${g} cx=${cx(c)} cy=${cy(r)} r="11" fill=${g in who ? RC[who[g] % RC.length] : 'color-mix(in srgb, #d97706 30%, var(--paper))'} stroke=${s.anti && R.anti.includes(g) ? 'var(--ink)' : 'var(--graphite)'} strokeWidth=${s.anti && R.anti.includes(g) ? 4 : 1.5} style=${{ pointerEvents: 'none' }} />`; })}
        <circle cx=${cx(1)} cy=${cy(1)} r="7" fill="var(--ink)" style=${{ pointerEvents: 'none' }} />
      </svg>`; };
    const head = html`<${Tabs} opts=${[['slide', 'Board from the slide'], ['own', 'Try your own']]} v=${mode} set=${setMode} />
      ${mode === 'own' && html`<p className="a15-hint">Tap squares to add or remove coins.</p>`}`;
    return html`<figure className="fig"><${Player} key=${mode + coins.slice().sort().join(';')} steps=${steps} view=${view} head=${head} ms=${2200} /></figure>`;
  }

  window.FIGS = Object.assign(window.FIGS || {}, {
    'ag-15-money': Money, 'ag-15-sched': Sched, 'ag-15-huffman': Huffman, 'ag-15-mst': Mst,
    'ag-15-wires': Wires, 'ag-15-tsp': Tsp, 'ag-15-robots': Robots
  });
})();
/* ── part L20 ── */
// Algorithms visuals, Lecture 20 (P, NP, NP-hard and NP-complete): Big-O / Big-Omega / Theta pictures (slides 4-6), complexity vs
// input length (7, 10), IsPrime (9), TSP tours and search space (13-15), CLIQUE (16-18, 32-33), the class diagrams (19, 21-24),
// reduction (25-26), SAT truth tables (27-29) and the 3-CNF SAT to CLIQUE construction (30-36). Every label and number comes from the slides.
(function () {
  const { useState, useEffect, useRef, useMemo } = React;
  const { html, useSteps, Cap, Bar, pop, calm, useClock, useFit, sec } = window.FIGKIT;
  const CSS = `
.a20-tabs{ display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin:0 0 10px; }
.a20-tabs .fig-btn{ font-size:.84rem; padding:4px 10px; min-height:30px; }
.fig-btn.a20-on{ background:color-mix(in srgb, var(--fig-k) 18%, var(--paper)); border-color:var(--fig-k); box-shadow:0 0 0 1px var(--fig-k); }
.a20-form{ display:flex; flex-wrap:wrap; gap:6px 8px; align-items:center; justify-content:center; margin:0 0 10px; font-size:.88rem; color:var(--ink); }
.a20-form label{ display:flex; gap:5px; align-items:center; }
.a20-form input{ font:inherit; font-size:.9rem; padding:4px 6px; border:1px solid var(--line); border-radius:6px; background:var(--paper); color:var(--ink); min-width:0; box-sizing:border-box; }
.a20-form input[type=range]{ width:150px; accent-color:var(--fig-k); padding:0; }
.a20-err{ width:100%; text-align:center; color:var(--pen); font-size:.85rem; }
.a20-hint{ text-align:center; font-size:.84rem; color:var(--graphite); margin:0 0 8px; }
.a20-cnt{ font-size:.84rem; color:var(--graphite); }
.a20-info{ text-align:center; font-size:.88rem; color:var(--ink); margin:8px 0 0; min-height:1.4em; line-height:1.45; overflow-wrap:anywhere; }
.a20-t{ border-collapse:collapse; margin:0 auto; font-size:.86rem; color:var(--ink); font-variant-numeric:tabular-nums; }
.a20-t td, .a20-t th{ border:1px solid var(--line); text-align:center; padding:4px 3px; background:var(--paper); }
.a20-t th{ background:var(--paper-2); color:var(--graphite); font-weight:600; }
.a20-t tr.a20-cur td{ background:color-mix(in srgb, var(--fig-k) 26%, var(--paper)); font-weight:700; }
.a20-t td.a20-T{ color:var(--ok); font-weight:700; } .a20-t td.a20-F{ color:var(--pen); }
.a20-t tr.a20-hit{ cursor:pointer; }
.a20-gr{ display:grid; grid-template-columns:auto minmax(0, 1fr); gap:5px 8px; align-items:center; font-size:.86rem; color:var(--ink); }
.a20-gr .a20-nm{ white-space:nowrap; }
.a20-gr .a20-bar{ position:relative; height:24px; background:var(--paper); border:1px solid var(--line); border-radius:4px; overflow:hidden; }
.a20-gr .a20-bar i{ position:absolute; left:0; top:0; bottom:0; background:color-mix(in srgb, var(--fig-k) 35%, var(--paper)); transition:width .35s; }
.a20-gr .a20-bar i.a20-ex{ background:color-mix(in srgb, var(--pen) 35%, var(--paper)); }
.a20-gr .a20-bar span{ position:relative; padding-left:6px; line-height:24px; white-space:nowrap; }
.a20-two{ display:grid; grid-template-columns:1fr 1fr; gap:8px; margin:12px 0 0; font-size:.84rem; color:var(--ink); }
.a20-two div{ border:1px solid var(--line); border-radius:8px; background:var(--paper); padding:6px 8px; line-height:1.45; }
.a20-two b{ display:block; font-size:.84rem; color:var(--fig-k); }
.a20-two .a20-x b{ color:var(--pen); }
.a20-chips{ display:flex; flex-wrap:wrap; gap:4px; justify-content:center; margin:8px 0 0; font-size:.8rem; }
.a20-chips span{ border:1px solid var(--line); border-radius:6px; padding:2px 6px; background:var(--paper); color:var(--ink); font-variant-numeric:tabular-nums; }
.a20-chips span.a20-z{ border-color:var(--pen); box-shadow:0 0 0 1px var(--pen); font-weight:700; }
.a20-big{ font-family:var(--mono, monospace); font-size:.82rem; overflow-wrap:anywhere; word-break:break-all; text-align:center; color:var(--ink); margin:6px 0 0; line-height:1.4; }
.a20-vars{ display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin:0 0 10px; }
.a20-vars .fig-btn{ min-width:54px; font-size:.86rem; padding:4px 8px; }
.a20-vars .fig-btn.a20-tv{ background:color-mix(in srgb, var(--ok) 22%, var(--paper)); border-color:var(--ok); }
.a20-cl{ display:flex; flex-wrap:wrap; gap:4px; justify-content:center; margin:0 0 10px; font-size:.86rem; color:var(--ink); align-items:center; }
.a20-cl span.a20-c{ border:1.5px solid var(--line); border-radius:6px; padding:2px 6px; background:var(--paper); white-space:nowrap; }
.a20-cl span.a20-c.a20-ok{ border-color:var(--ok); background:color-mix(in srgb, var(--ok) 16%, var(--paper)); }
.a20-cl span.a20-c.a20-no{ border-color:var(--pen); background:color-mix(in srgb, var(--pen) 14%, var(--paper)); }
.a20-res{ text-align:center; font-weight:700; margin:0 0 8px; font-size:.95rem; color:var(--ink); }
.a20-hitg{ cursor:pointer; }
.a20-ks{ display:flex; flex-wrap:wrap; gap:6px; justify-content:center; align-items:center; margin:10px 0 0; font-size:.86rem; color:var(--ink); }
.a20-ks .fig-btn{ font-size:.84rem; padding:3px 10px; min-height:30px; }
.a20-gr sup, .a20-two sup, .a20-info sup, .a20-chips sup, .a20-big sup{ font-size:.9em; line-height:0; }
.a20-gr .a20-bar span{ font-size:.84rem; }
@media (prefers-reduced-motion: reduce){ .a20-gr .a20-bar i{ transition:none; } }`;
  if (!document.getElementById('a20-css')) { const s = document.createElement('style'); s.id = 'a20-css'; s.textContent = CSS; document.head.appendChild(s); }

  // ── shared helpers ──
  function Bar2({ n, i, ctl }) {
    if (n <= 14) return html`<${Bar} steps=${Array.from({ length: n })} i=${i} ctl=${ctl} />`;
    return html`<div className="fig-bar"><span className="a20-cnt">Step ${i + 1} / ${n}</span><span className="grow"></span>
      <button className="fig-btn" onClick=${() => ctl.go(Math.max(0, i - 1))} disabled=${i === 0} aria-label="Previous step">‹ Back</button>
      <button className="fig-btn" onClick=${() => ctl.go(Math.min(n - 1, i + 1))} disabled=${i === n - 1} aria-label="Next step">Next ›</button>
      <button className="fig-btn" onClick=${ctl.replay}>↻ Replay</button></div>`;
  }
  function Player({ steps, view, head, ms = 1800 }) {
    const [i, ctl] = useSteps(steps.length, ms);
    const s = steps[Math.min(i, steps.length - 1)];
    return html`<div className="fig-stage">${head}${view(s, i)}</div><${Cap} en=${s.en} /><${Bar2} n=${steps.length} i=${i} ctl=${ctl} />`;
  }
  const Tabs = ({ opts, v, set }) => html`<div className="a20-tabs">${opts.map(([k, l]) => html`<button key=${k} className=${'fig-btn' + (v === k ? ' a20-on' : '')} onClick=${() => set(k)}>${l}</button>`)}</div>`;
  // fields: [{ k, label, init, w }]; parse(values) → { err } or { ok }
  function TryForm({ fields, parse, onOk }) {
    const [vals, setVals] = useState(() => Object.fromEntries(fields.map(f => [f.k, f.init])));
    const [err, setErr] = useState('');
    const go = e => { e && e.preventDefault(); const r = parse(vals); if (r.err) setErr(r.err); else { setErr(''); onOk(r.ok); } };
    return html`<form className="a20-form" onSubmit=${go}>
      ${fields.map(f => html`<label key=${f.k}>${f.label}<input value=${vals[f.k]} style=${{ width: f.w || '8em' }} onInput=${e => setVals(v => ({ ...v, [f.k]: e.target.value }))} /></label>`)}
      <button className="fig-btn solid" type="submit">Run</button>
      ${err && html`<div className="a20-err">${err}</div>`}</form>`;
  }
  const ints = s => String(s).split(/[\s,;]+/).filter(Boolean).map(Number);
  const isInt = (x, lo, hi) => Number.isInteger(x) && x >= lo && x <= hi;

  const fmtBig = x => { if (!isFinite(x)) return '∞'; if (x < 1e15) return Math.round(x).toLocaleString('en-US'); const e = Math.floor(Math.log10(x)); return (x / 10 ** e).toFixed(2) + ' × 10<sup>' + e + '</sup>'; };

  /* ── slides 4-6: Big-O, Big-Omega and Theta pictures ── */
  function Bounds() {
    const N = 10, X = n => 44 + n / N * 336, Y = v => 196 - v / 10 * 176;
    const K = {
      O: { f: n => 2.4 + 1.3 * Math.sin(1.6 * n) + .22 * n, up: n => .6 + .07 * n * n + .25 * n, ok: (f, u) => f <= u },
      W: { f: n => 1.2 + .075 * n * n + .6 * Math.sin(2 * n), lo: n => 1.6 + .32 * n, ok: (f, l) => l <= f },
      T: { f: n => 1.6 + .5 * n + .5 * Math.sin(2.2 * n), up: n => 1.8 + .75 * n, lo: n => .9 + .32 * n }
    };
    const n0 = (test) => { let last = 0; for (let n = 0; n <= N; n += .01) if (!test(n)) last = n; return Math.ceil(last * 10) / 10; };
    const n0s = { O: n0(n => K.O.f(n) <= K.O.up(n)), W: n0(n => K.W.lo(n) <= K.W.f(n)), T: n0(n => K.T.lo(n) <= K.T.f(n) && K.T.f(n) <= K.T.up(n)) };
    const path = g => Array.from({ length: 201 }, (_, k) => k * N / 200).map((n, k) => (k ? 'L' : 'M') + X(n).toFixed(1) + ' ' + Y(Math.min(10, Math.max(0, g(n)))).toFixed(1)).join(' ');
    const steps = [
      { en: 'Big-O, an <b>upper bound</b>: f(n) = O(g(n)) if there are positive constants c and n<sub>0</sub> with f(n) ≤ c·g(n) for all n ≥ n<sub>0</sub>. Left of n<sub>0</sub> anything may happen.', k: 'O' },
      { en: 'Big-Omega, a <b>lower bound</b>: f(n) = Ω(g(n)) if there are positive c and n<sub>0</sub> with 0 ≤ c·g(n) ≤ f(n) for all n ≥ n<sub>0</sub>.', k: 'W' },
      { en: 'Theta: f is bounded <b>from above and below</b> by the same g: f(n) = Θ(g(n)) if there are positive c<sub>1</sub>, c<sub>2</sub>, n<sub>0</sub> with 0 ≤ c<sub>1</sub>·g(n) ≤ f(n) ≤ c<sub>2</sub>·g(n) for all n ≥ n<sub>0</sub>.', k: 'T' }];
    const view = (s) => { const k = K[s.k], z = n0s[s.k];
      return html`<svg viewBox="0 0 400 236" role="img" aria-label="f(n) and its bound c g(n)">
        <rect x=${X(z)} y="16" width=${X(N) - X(z)} height="180" fill="color-mix(in srgb, var(--fig-k) 10%, var(--paper-2))" />
        <line x1="44" y1="196" x2="388" y2="196" stroke="var(--ink)" strokeWidth="1.5" /><line x1="44" y1="196" x2="44" y2="10" stroke="var(--ink)" strokeWidth="1.5" />
        <line x1=${X(z)} y1="196" x2=${X(z)} y2="20" stroke="var(--graphite)" strokeDasharray="5 5" />
        <text x=${X(z)} y="220" textAnchor="middle" fontSize="18">n₀</text><text x="372" y="220" textAnchor="middle" fontSize="18">n</text><text x="30" y="24" textAnchor="middle" fontSize="18">t</text>
        <path d=${path(k.f)} fill="none" stroke="var(--ink)" strokeWidth="2.5" />
        ${k.up && html`<path d=${path(k.up)} fill="none" stroke="var(--fig-k)" strokeWidth="2.5" />`}
        ${k.lo && html`<path d=${path(k.lo)} fill="none" stroke="var(--ok)" strokeWidth="2.5" />`}
        <text x="384" y=${Y(Math.min(9.6, k.f(N))) + (s.k === 'W' ? -8 : s.k === 'T' ? 6 : 22)} textAnchor="end" fontSize="18" fontWeight="700">f(n)</text>
        ${k.up && html`<text x=${s.k === 'O' ? 300 : 384} y=${s.k === 'O' ? 30 : Y(k.up(N)) - 8} textAnchor="end" fontSize="18" fill="var(--fig-k)" fontWeight="700">${s.k === 'T' ? 'c₂·g(n)' : 'c·g(n)'}</text>`}
        ${k.lo && html`<text x="384" y=${Y(k.lo(N)) + 22} textAnchor="end" fontSize="18" fill="var(--ok)" fontWeight="700">${s.k === 'T' ? 'c₁·g(n)' : 'c·g(n)'}</text>`}
      </svg>`; };
    return html`<figure className="fig"><${Player} steps=${steps} view=${view} ms=${3200} /></figure>`;
  }

  /* ── slides 7 and 10: complexity vs input length ── */
  function Growth() {
    const [n, setN] = useState(20);
    const fact = k => { let r = 1; for (let j = 2; j <= k; j++) r *= j; return r; };
    const rows = [['C (constant)', () => 1], ['log N', x => Math.log2(x)], ['N', x => x], ['N log N', x => x * Math.log2(x)], ['N²', x => x * x], ['N³ (polynomial)', x => x ** 3], ['2<sup>N</sup>', x => 2 ** x, 1], ['N!', x => fact(x), 1]];
    const vals = rows.map(r => r[1](n)), top = Math.log10(fact(40));
    const en = `At N = ${n}: N² = ${fmtBig(n * n)} and N³ = ${fmtBig(n ** 3)} steps, but 2<sup>N</sup> = ${fmtBig(2 ** n)} and N! = ${fmtBig(fact(n))}. Polynomial times stay manageable; exponential ones (2<sup>N</sup>, N!) are the <b>most dangerous</b>.`;
    return html`<figure className="fig"><div className="fig-stage">
        <div className="a20-form"><label>N = <b>${n}</b><input type="range" min="1" max="40" value=${n} onInput=${e => setN(+e.target.value)} aria-label="Input length N" /></label></div>
        <div className="a20-gr">${rows.map((r, k) => html`<span key=${'n' + k} className="a20-nm" dangerouslySetInnerHTML=${{ __html: r[0] }}></span>
          <div key=${'b' + k} className="a20-bar"><i className=${r[2] ? 'a20-ex' : ''} style=${{ width: Math.min(100, Math.log10(vals[k] + 1) / top * 100) + '%' }}></i><span dangerouslySetInnerHTML=${{ __html: fmtBig(vals[k]) }}></span></div>`)}</div>
        <p className="a20-hint" style=${{ margin: '6px 0 0' }}>Bars on a log scale (number of digits).</p>
        <div className="a20-two"><div><b>Polynomial time</b>Linear search n<br />Binary search log n<br />Insertion sort n²<br />Merge sort n log n<br />Matrix multiplication n³</div>
          <div className="a20-x"><b>Exponential time</b>0/1 knapsack 2<sup>n</sup><br />Traveling SP 2<sup>n</sup><br />Sum of subsets 2<sup>n</sup><br />Graph coloring 2<sup>n</sup><br />Hamiltonian cycle 2<sup>n</sup></div></div>
      </div><${Cap} en=${en} /></figure>`;
  }

  /* ── slide 9: IsPrime(12) and IsPrime(1009) ── */
  function IsPrime() {
    const [mode, setMode] = useState('a'), [own, setOwn] = useState(221);
    const n = mode === 'a' ? 12 : mode === 'b' ? 1009 : own;
    const steps = useMemo(() => {
      const r = Math.floor(Math.sqrt(n)), ds = []; let hit = null;
      for (let d = 2; d <= r; d++) { ds.push(d); if (n % d === 0) { hit = d; break; } }
      const st = [{ en: `IsPrime(${n}): try dividing by d = 2, 3, … up to ⌊√${n}⌋ = ${r}. A divisor d &gt; √n would pair with one below √n, so this is enough.${n < 4 ? '' : ''}`, k: 0 }];
      const B = Math.max(1, Math.ceil(ds.length / 8));
      for (let k = B; k < ds.length + B; k += B) { const m = Math.min(k, ds.length), last = ds[m - 1];
        st.push({ en: hit && m === ds.length ? `${n} mod ${hit} = 0: ${hit} divides ${n}, so IsPrime(${n}) ⇒ <b>No</b>.` : `${n} mod ${ds.slice(Math.max(0, m - B), m).join(', ')} ≠ 0: no divisor yet (checked up to ${last}).`, k: m }); }
      if (!hit) st.push({ en: n < 2 ? `${n} is not prime by definition: IsPrime(${n}) ⇒ <b>No</b>.` : `No d from 2 to ${r} divides ${n}, so IsPrime(${n}) ⇒ <b>Yes</b>. At most √n divisions; primality testing is in P (the AKS algorithm runs in time polynomial in the number of digits).`, k: ds.length, fin: true });
      return { st, ds };
    }, [n]);
    const view = (s) => html`<div className="a20-chips">${steps.ds.slice(0, s.k).map(d => html`<span key=${d} className=${n % d === 0 ? 'a20-z' : ''}>${n} mod ${d} = ${n % d}</span>`)}</div>`;
    const head = html`<${Tabs} opts=${[['a', 'IsPrime(12)'], ['b', 'IsPrime(1009)'], ['own', 'Try your own']]} v=${mode} set=${setMode} />
      ${mode === 'own' && html`<${TryForm} fields=${[{ k: 'n', label: 'n', init: String(own), w: '6em' }]} onOk=${setOwn} parse=${v => { const x = +v.n; return !isInt(x, 2, 1000000) ? { err: 'Use a whole number from 2 to 1,000,000.' } : { ok: x }; }} />`}`;
    return html`<figure className="fig"><${Player} key=${n} steps=${steps.st} view=${view} head=${head} ms=${1100} /></figure>`;
  }

  /* ── slides 13-15: TSP, the slide's 4-city example and the N! search space ── */
  function TspSpace() {
    const V = { A: [70, 50], B: [330, 50], C: [330, 220], D: [70, 220] }, E = { AB: 2, AD: 1, BC: 5, CD: 6, AC: 4, BD: 3 };
    const w = (a, b) => E[a + b] ?? E[b + a];
    const tours = [['A', 'B', 'C', 'D', 'A'], ['A', 'B', 'D', 'C', 'A'], ['A', 'C', 'B', 'D', 'A']].map(t => ({ t, c: t.slice(1).map((v, k) => w(t[k], v)) }));
    const best = Math.min(...tours.map(t => t.c.reduce((a, b) => a + b)));
    const [N, setN] = useState(25);
    const fact = useMemo(() => { let r = 1n; for (let k = 2n; k <= BigInt(N); k++) r *= k; return r.toString(); }, [N]);
    const steps = [
      { en: 'TSP. Input: an undirected graph with non-negative edge costs (four cities here, labels A-D added). Output: a min-cost <b>tour</b>, a cycle that visits every vertex exactly once.', t: null },
      ...tours.map(({ t, c }) => { const s = c.reduce((a, b) => a + b); return { en: `Tour ${t.join('')}: ${c.join(' + ')} = <b>${s}</b>${s === best ? ` = OPT, the minimum (the slide's OPT = ${best})` : ''}.`, t, s }; }),
      { en: `Brute force visits the whole search space. Listing the N cities in every order gives N! candidates: 4! = 24 orders here, which are only ${tours.length} different tours (24 / (4 starts × 2 directions)). The table on slide 15 grows as N!; change N below.`, t: tours.find(x => x.c.reduce((a, b) => a + b) === best).t, s: best }];
    const view = (s) => { const on = s.t ? s.t.slice(1).map((v, k) => [s.t[k], v].sort().join('')) : [];
      return html`<svg viewBox="0 0 400 296" role="img" aria-label="Four cities with edge costs">
        ${Object.entries(E).map(([k, c]) => { const [x1, y1] = V[k[0]], [x2, y2] = V[k[1]], hot = on.includes(k.split('').sort().join(''));
          const lp = { AB: [200, 34], CD: [200, 252], AD: [50, 140], BC: [350, 140], AC: [150, 72], BD: [282, 110] }[k];
          return html`<g key=${k}><line x1=${x1} y1=${y1} x2=${x2} y2=${y2} stroke=${hot ? (s.s === best ? 'var(--ok)' : 'var(--fig-k)') : 'var(--graphite)'} strokeWidth=${hot ? 5 : 1.6} />
            <text x=${lp[0]} y=${lp[1] + 6} textAnchor="middle" fontSize="20" fontWeight="700" stroke="var(--paper-2)" strokeWidth="5" paintOrder="stroke">${c}</text></g>`; })}
        ${Object.entries(V).map(([v, [x, y]]) => html`<g key=${v}><circle cx=${x} cy=${y} r="17" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2" /><text x=${x} y=${y + 6} textAnchor="middle" fontSize="18" fontWeight="700">${v}</text></g>`)}
        ${s.s != null && html`<text x="200" y="288" textAnchor="middle" fontSize="20" fontWeight="700" fill=${s.s === best ? 'var(--ok)' : 'var(--fig-k)'} stroke="var(--paper-2)" strokeWidth="6" paintOrder="stroke">cost ${s.s}</text>`}
      </svg>
      <div className="a20-form" style=${{ margin: '6px 0 0' }}><label>N = <b>${N}</b> cities<input type="range" min="1" max="100" value=${N} onInput=${e => setN(+e.target.value)} aria-label="Number of cities" /></label></div>
      <p className="a20-big">${N}! = ${fact}</p><p className="a20-hint" style=${{ margin: '2px 0 0' }}>${fact.length} digits</p>`; };
    return html`<figure className="fig"><${Player} steps=${steps} view=${view} ms=${2600} /></figure>`;
  }

  /* ── slides 16-18, 32-33: CLIQUE on the slide's graph ── */
  const CV = { a: [40, 111], b: [147, 40], c: [252, 40], d: [360, 111], g: [40, 258], f: [147, 331], e: [252, 331] };
  const CE = ['ab', 'ac', 'ad', 'ag', 'bc', 'bd', 'bg', 'bf', 'cd', 'cg', 'cf', 'ce', 'dg', 'df', 'de', 'gf'];
  const adj = (u, v) => CE.includes(u + v) || CE.includes(v + u);
  const subsets = (arr, k) => { const out = []; (function go(i, cur) { if (cur.length === k) { out.push(cur.slice()); return; } for (let j = i; j < arr.length; j++) { cur.push(arr[j]); go(j + 1, cur); cur.pop(); } })(0, []); return out; };
  const isClique = S => S.every((u, i) => S.slice(i + 1).every(v => adj(u, v)));
  function Clique() {
    const vs = Object.keys(CV).sort(), [sel, setSel] = useState([]), [k, setK] = useState(4);
    const byK = useMemo(() => { const r = {}; for (let q = 2; q <= 7; q++) { const all = subsets(vs, q); r[q] = { all: all.length, cl: all.filter(isClique) }; } return r; }, []);
    const mx = Math.max(...Object.keys(byK).filter(q => byK[q].cl.length).map(Number));
    const steps = [
      { en: `A <b>clique</b> is a subset of vertices that are all adjacent to each other (a complete subgraph). The slide's graph has ${vs.length} vertices and ${CE.length} edges.`, S: [] },
      { en: 'The slide\'s middle picture: {a, b, c, g} is a clique of size 4. All 6 pairs among them are edges; the other edges are dashed.', S: ['a', 'b', 'c', 'g'] },
      { en: `The slide's right picture: {a, b, c, d, g}, a clique of size 5. The largest here is ${mx}; there ${byK[mx].cl.length === 1 ? 'is one' : `are ${byK[mx].cl.length}`}: ${byK[mx].cl.map(c => '{' + c.join(', ') + '}').join(' and ')}.`, S: ['a', 'b', 'c', 'd', 'g'] },
      { en: '<b>Verify</b> a given set of k vertices: check its k(k-1)/2 pairs, polynomial O(k²). <b>Tap vertices</b> to pick a set. Does the graph have a clique of size k? Trying all k-subsets costs O(V<sup>k</sup> k²); finding the maximum clique size is NP-hard.', S: null, tap: true }];
    const missing = useMemo(() => { for (let i = 0; i < sel.length; i++) for (let j = i + 1; j < sel.length; j++) if (!adj(sel[i], sel[j])) return sel[i] + '–' + sel[j]; return null; }, [sel]);
    const view = (s) => { const S = s.tap ? sel : s.S;
      return html`<svg viewBox="0 0 400 372" role="img" aria-label="Graph with vertices a to g">
        ${CE.map(e => { const [u, v] = e, inS = S.includes(u) && S.includes(v), dim = S.length > 0 && !inS, [x1, y1] = CV[u], [x2, y2] = CV[v];
          return html`<line key=${e} x1=${x1} y1=${y1} x2=${x2} y2=${y2} stroke=${inS ? 'var(--fig-k)' : 'var(--graphite)'} strokeWidth=${inS ? 4.5 : dim ? 1.4 : 2.2} strokeDasharray=${dim ? '6 5' : ''} opacity=${dim ? .55 : 1} />`; })}
        ${s.tap && missing && (() => { const [u, v] = missing.split('–'), [x1, y1] = CV[u], [x2, y2] = CV[v]; return html`<line x1=${x1} y1=${y1} x2=${x2} y2=${y2} stroke="var(--pen)" strokeWidth="3" strokeDasharray="3 6" />`; })()}
        ${vs.map(v => { const [x, y] = CV[v], on = S.includes(v); return html`<g key=${v} className=${s.tap ? 'a20-hitg' : ''} onClick=${() => s.tap && setSel(x => x.includes(v) ? x.filter(y => y !== v) : [...x, v].sort())}>
          <circle cx=${x} cy=${y} r="19" fill=${on ? 'color-mix(in srgb, var(--fig-k) 40%, var(--paper))' : S.length ? 'var(--paper-2)' : 'var(--paper)'} stroke="var(--ink)" strokeWidth="2" />
          <text x=${x} y=${y + 6} textAnchor="middle" fontSize="20" fontWeight="700" fontStyle="italic">${v}</text></g>`; })}
      </svg>
      ${s.tap && html`<p className="a20-info">${sel.length < 2 ? 'Tap two or more vertices.' : missing ? `{${sel.join(', ')}} is not a clique: ${missing} is not an edge.` : `{${sel.join(', ')}} is a clique of size ${sel.length} (${sel.length * (sel.length - 1) / 2} pairs checked).`}</p>
        <div className="a20-ks"><span>Brute force for size k:</span>${[3, 4, 5, 6].map(q => html`<button key=${q} className=${'fig-btn' + (k === q ? ' a20-on' : '')} onClick=${() => setK(q)}>${q}</button>`)}</div>
        <p className="a20-info">C(7, ${k}) = ${byK[k].all} subsets to check, ${k * (k - 1) / 2} pairs each: ${byK[k].cl.length ? `${byK[k].cl.length} of them ${byK[k].cl.length === 1 ? 'is a clique' : 'are cliques'}` : 'none is a clique'}.</p>`}`; };
    return html`<figure className="fig"><${Player} steps=${steps} view=${view} ms=${3000} /></figure>`;
  }

  /* ── slides 19-24: P vs NP, NP-hard, NP-complete ── */
  function Classes() {
    const E = (cx, cy, rx, ry, lab, lx, ly, on, fill) => html`<g className=${pop(on)}><ellipse cx=${cx} cy=${cy} rx=${rx} ry=${ry} fill=${fill || 'none'} stroke="var(--ink)" strokeWidth="2" />${lab && html`<text x=${lx ?? cx} y=${ly ?? cy} textAnchor="middle" fontSize="19" fontWeight="600">${lab}</text>`}</g>`;
    const steps = [
      { en: 'Two possibilities: either <b>P ⊂ NP</b> (some problems in NP cannot be solved in polynomial time) or <b>P = NP</b>. Every problem in P is in NP: if you can solve it fast, you can check an answer fast.', k: 0 },
      { en: 'No one knows if P = NP or not. It is one of the Clay Mathematics Institute Millennium Problems: solve it for a million dollars!', k: 0 },
      { en: 'A problem L is <b>NP-hard</b> if every problem in NP can be reduced to it in polynomial time: L′ ≤<sub>p</sub> L for every L′ ∈ NP. If one NP-complete problem can be solved in polynomial time, all of NP can. Examples: SAT, TSP.', k: 1 },
      { en: 'A problem is <b>NP-complete</b> if it is both in NP and NP-hard: the overlap of the two regions. P sits inside NP (drawn apart from NP-complete, assuming P ≠ NP).', k: 2 },
      { en: 'Summary table (slide 24), in order of increasing difficulty. NP: solvable in P time for the problems that are also in P, unknown for the rest. NP-hard: problems outside NP may not even be verifiable in P time.', k: 3 }];
    const view = (s) => s.k === 0 ? html`<svg viewBox="0 0 400 220" role="img" aria-label="P inside NP, or P equal to NP">
        ${E(120, 108, 92, 96, 'NP', 140, 44, true)}${E(110, 136, 50, 50, 'P', 110, 142, true, 'color-mix(in srgb, var(--fig-k) 18%, var(--paper))')}
        ${E(310, 108, 64, 78, 'P = NP', 310, 114, true, 'color-mix(in srgb, var(--fig-k) 18%, var(--paper))')}
        <text x="120" y="214" textAnchor="middle" fontSize="18" fill="var(--graphite)">P ≠ NP</text><text x="310" y="214" textAnchor="middle" fontSize="18" fill="var(--graphite)">P = NP</text></svg>`
      : s.k < 3 ? html`<svg viewBox="0 0 400 220" role="img" aria-label="NP-hard and NP">
        ${E(130, 110, 120, 70, '', 0, 0, true, 'color-mix(in srgb, var(--pen) 12%, var(--paper))')}
        ${E(262, 110, 128, 70, '', 0, 0, s.k >= 2, 'color-mix(in srgb, var(--fig-k) 12%, var(--paper))')}
        <text x="80" y="116" textAnchor="middle" fontSize="19" fontWeight="600">NP-hard</text>
        <g className=${pop(s.k >= 2)}><text x="320" y="96" textAnchor="middle" fontSize="19" fontWeight="600">NP</text>
          <ellipse cx="322" cy="134" rx="34" ry="20" fill="color-mix(in srgb, var(--ok) 22%, var(--paper))" stroke="var(--ink)" strokeWidth="2" /><text x="322" y="140" textAnchor="middle" fontSize="18">P</text>
          <text x="196" y="116" textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--fig-k)">NP-complete</text></g>
        <text x="200" y="210" textAnchor="middle" fontSize="18" fill="var(--graphite)">${s.k === 1 ? 'L′ ≤ₚ L for every L′ ∈ NP' : 'NP-complete = NP ∩ NP-hard'}</text></svg>`
      : html`<table className="a20-t"><thead><tr><th>Problem type</th><th>Verifiable in P time</th><th>Solvable in P time</th></tr></thead><tbody>
          ${[['P', 'Yes', 'Yes'], ['NP', 'Yes', 'Yes or No *'], ['NP-Complete', 'Yes', 'Unknown'], ['NP-Hard', 'Yes or No **', 'Unknown ***']].map(r => html`<tr key=${r[0]}><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td></tr>`)}
        </tbody></table><p className="a20-hint" style=${{ margin: '6px 0 0' }}>↓ increasing difficulty</p>`;
    return html`<figure className="fig"><${Player} steps=${steps} view=${view} ms=${3000} /></figure>`;
  }

  /* ── slides 25-26: reduction, LCM reduced to GCD ── */
  function Reduce() {
    const [mn, setMn] = useState([12, 18]), [m, n] = mn;
    const steps = useMemo(() => {
      const ev = []; let a = Math.max(m, n), b = Math.min(m, n); while (b) { ev.push([a, b, a % b]); [a, b] = [b, a % b]; } const g = a;
      return [{ en: 'A problem R <b>reduces</b> to a problem Q if any instance of R can be rephrased (transformed) into an instance of Q whose solution gives the solution of R. If the transformation is polynomial, R is “no harder to solve” than Q.', k: 0 },
        { en: `Example: R = LCM(${m}, ${n}). Rephrase it as the GCD problem on the same numbers, ${m} and ${n}.`, k: 1 },
        ...ev.map(([x, y, r]) => ({ en: `Solve GCD with Euclid: ${x} mod ${y} = ${r}${r ? `, so GCD(${x}, ${y}) = GCD(${y}, ${r})` : `, so the GCD is ${y}`}.`, k: 2, g })),
        { en: `Turn Q's answer back into R's: LCM(${m}, ${n}) = ${m} × ${n} / GCD(${m}, ${n}) = ${m * n} / ${g} = <b>${m * n / g}</b>. The LCM problem is reduced to the GCD problem.`, k: 3, g, l: m * n / g },
        { en: 'Is a linear equation reducible to a quadratic equation? Sure: let the coefficient of the square term be 0. bx + c = 0 becomes 0·x² + bx + c = 0, so a solver for ax² + bx + c = 0 (one that allows a = 0) also solves the linear one.', k: 4 }];
    }, [m, n]);
    const box = (x, y, w, t1, t2, on, hl) => html`<g className=${pop(on)}><rect x=${x} y=${y} width=${w} height="58" rx="8" fill=${hl ? 'color-mix(in srgb, var(--fig-k) 20%, var(--paper))' : 'var(--paper)'} stroke=${hl ? 'var(--fig-k)' : 'var(--graphite)'} strokeWidth="2" />
      <text x=${x + w / 2} y=${y + 25} textAnchor="middle" fontSize="18" fontWeight="700">${t1}</text><text x=${x + w / 2} y=${y + 48} textAnchor="middle" fontSize="18">${t2}</text></g>`;
    const view = (s) => { const L = s.k >= 1 && s.k <= 3, Q = s.k === 4;
      return html`<svg viewBox="0 0 400 236" role="img" aria-label="Reduction of R to Q">
        ${box(10, 10, 180, 'instance of R', Q ? 'bx + c = 0' : L ? `LCM(${m}, ${n})` : '', true, s.k === 1)}
        ${box(210, 10, 180, 'instance of Q', Q ? '0·x² + bx + c = 0' : L ? `GCD(${m}, ${n})` : '', true, s.k === 1 || Q)}
        <path d="M190 39 H206" stroke="var(--ink)" strokeWidth="2" /><path d="M200 33 l7 6 l-7 6" fill="none" stroke="var(--ink)" strokeWidth="2" />
        <text x="200" y="88" textAnchor="middle" fontSize="18" fill="var(--graphite)">transformation</text>
        <path d="M300 68 V118" stroke="var(--ink)" strokeWidth="2" /><path d="M294 110 l6 8 l6 -8" fill="none" stroke="var(--ink)" strokeWidth="2" />
        ${box(210, 120, 180, 'solution of Q', s.g ? `GCD = ${s.g}` : Q ? 'x = −c / b' : '', true, s.k === 2)}
        ${box(10, 120, 180, 'solution of R', s.l ? `LCM = ${s.l}` : Q ? 'x = −c / b' : '', true, s.k === 3)}
        <path d="M210 149 H194" stroke="var(--ink)" strokeWidth="2" /><path d="M201 143 l-7 6 l7 6" fill="none" stroke="var(--ink)" strokeWidth="2" />
        <text x="100" y="208" textAnchor="middle" fontSize="18" fill="var(--graphite)">${L ? 'm × n / GCD' : ''}</text><text x="300" y="208" textAnchor="middle" fontSize="18" fill="var(--graphite)">${L ? 'Euclid' : 'solver for Q'}</text>
      </svg>`; };
    const head = html`<${TryForm} fields=${[{ k: 'm', label: 'm', init: '12', w: '4em' }, { k: 'n', label: 'n', init: '18', w: '4em' }]} onOk=${setMn}
      parse=${v => { const a = +v.m, b = +v.n; return !isInt(a, 1, 9999) || !isInt(b, 1, 9999) ? { err: 'Use whole numbers from 1 to 9999.' } : { ok: [a, b] }; }} />
      <p className="a20-hint">The slide gives no numbers for LCM; pick any m and n.</p>`;
    return html`<figure className="fig"><${Player} key=${m + ',' + n} steps=${steps} view=${view} head=${head} ms=${2600} /></figure>`;
  }

  /* ── slides 27-29: SAT ── */
  const L = s => s.split(' ').map(t => t[0] === '!' ? [t.slice(1), 1] : [t, 0]);
  const SATS = {
    s28: { lab: 'Slide 28', cl: ['a b', 'a !b'].map(L) },
    s29: { lab: 'Slide 29', cl: ['a b', 'a !c'].map(L), note: 'The slide writes the formula as (a ∨ b) ∧ (b ∨ ¬c), but its table header and every row use (a ∨ ¬c); the table here follows the slide\'s table.' },
    s29w: { lab: '29 as written', cl: ['a b', 'b !c'].map(L) },
    s27: { lab: 'Slide 27 (11 clauses)', cl: ['a b', 'b !c', '!a !d', 'c e', 'b !c', '!a !d', 'e a', 'f !b', '!f !e', 'b e', 'b !d'].map(L) } };
  function Sat() {
    const [k, setK] = useState('s28'), F = SATS[k], vars = [...new Set(F.cl.flat().map(x => x[0]))].sort();
    const [as, setAs] = useState({});
    const val = (A, [v, ng]) => !!A[v] !== !!ng, clv = (A, c) => c.some(l => val(A, l)), ok = A => F.cl.every(c => clv(A, c));
    const rows = useMemo(() => Array.from({ length: 2 ** vars.length }, (_, r) => Object.fromEntries(vars.map((v, j) => [v, !(r >> (vars.length - 1 - j) & 1)]))), [k]);
    const nSat = rows.filter(ok).length, first = rows.find(ok);
    const A = Object.fromEntries(vars.map(v => [v, !!as[v]]));
    const lit = ([v, ng]) => (ng ? '¬' : '') + v, cTxt = c => '(' + c.map(lit).join(' ∨ ') + ')';
    const en = `SAT asks: can the variables be set TRUE/FALSE so the formula is TRUE? SAT was the first known NP-complete problem. ${F.note ? F.note + ' ' : ''}Checking one assignment is fast; trying all ${rows.length} = 2<sup>${vars.length}</sup> finds <b>${nSat}</b> that satisfy it${first ? `, e.g. ${vars.map(v => v + ' = ' + (first[v] ? 'T' : 'F')).join(', ')}` : ''}.`;
    return html`<figure className="fig"><div className="fig-stage">
      <${Tabs} opts=${Object.entries(SATS).map(([q, f]) => [q, f.lab])} v=${k} set=${q => { setK(q); setAs({}); }} />
      <div className="a20-cl">${F.cl.map((c, j) => html`${j ? html`<span key=${'x' + j}>∧</span>` : ''}<span key=${j} className=${'a20-c ' + (clv(A, c) ? 'a20-ok' : 'a20-no')}>${cTxt(c)}</span>`)}</div>
      <div className="a20-vars">${vars.map(v => html`<button key=${v} className=${'fig-btn' + (A[v] ? ' a20-tv' : '')} onClick=${() => setAs(x => ({ ...x, [v]: !x[v] }))}>${v} = ${A[v] ? 'T' : 'F'}</button>`)}</div>
      <p className="a20-res">Formula is ${ok(A) ? 'TRUE: satisfied' : 'FALSE for this assignment'}</p>
      ${vars.length <= 3 && html`<table className="a20-t"><thead><tr>${vars.map(v => html`<th key=${v}>${v}</th>`)}${F.cl.map((c, j) => html`<th key=${'c' + j}>${cTxt(c)}</th>`)}<th>SAT</th></tr></thead><tbody>
        ${rows.map((R, r) => html`<tr key=${r} className=${'a20-hit' + (vars.every(v => R[v] === A[v]) ? ' a20-cur' : '')} onClick=${() => setAs(R)}>${vars.map(v => html`<td key=${v}>${R[v] ? 'T' : 'F'}</td>`)}${F.cl.map((c, j) => html`<td key=${'c' + j} className=${clv(R, c) ? 'a20-T' : 'a20-F'}>${clv(R, c) ? 'T' : 'F'}</td>`)}<td className=${ok(R) ? 'a20-T' : 'a20-F'}>${ok(R) ? 'T' : 'F'}</td></tr>`)}
      </tbody></table>`}
      ${vars.length > 3 && html`<div className="a20-ks"><button className="fig-btn solid" onClick=${() => first && setAs(first)}>Try all ${rows.length} assignments</button></div>`}
      <p className="a20-hint" style=${{ margin: '8px 0 0' }}>Tap the variables${vars.length <= 3 ? ' or a table row' : ''} to change the assignment.</p>
    </div><${Cap} en=${en} /></figure>`;
  }

  /* ── slides 30-36: reduce 3-CNF SAT to CLIQUE ── */
  const NV = [{ c: 0, v: 3, n: 0, p: [106, 44] }, { c: 0, v: 2, n: 1, p: [70, 114] }, { c: 0, v: 1, n: 0, p: [40, 200] }, { c: 1, v: 1, n: 1, p: [316, 52] }, { c: 1, v: 2, n: 0, p: [362, 134] }, { c: 2, v: 2, n: 1, p: [165, 294] }, { c: 2, v: 3, n: 0, p: [258, 294] }];
  const SUB = ['', '₁', '₂', '₃'], lt = u => (u.n ? '¬' : '') + 'x' + SUB[u.v];
  const okE = (a, b) => a.c !== b.c && !(a.v === b.v && a.n !== b.n);
  function CnfClique() {
    const [sel, setSel] = useState([]);
    const EDG = useMemo(() => { const r = []; NV.forEach((a, i) => NV.forEach((b, j) => { if (i < j && okE(a, b)) r.push([i, j]); })); return r; }, []);
    const tri = useMemo(() => { const r = []; for (const i of [0, 1, 2]) for (const j of [3, 4]) for (const k of [5, 6]) if (okE(NV[i], NV[j]) && okE(NV[i], NV[k]) && okE(NV[j], NV[k])) r.push([i, j, k]); return r; }, []);
    const pairs = (c1, c2) => EDG.filter(([i, j]) => NV[i].c === c1 && NV[j].c === c2);
    const miss = (c1, c2) => { const r = []; NV.forEach((a, i) => NV.forEach((b, j) => { if (i < j && a.c === c1 && b.c === c2 && !okE(a, b)) r.push(lt(a) + '–' + lt(b)); })); return r; };
    const asg = S => { const o = {}; S.forEach(i => { o[NV[i].v] = !NV[i].n; }); return o; };
    const asTxt = S => { const o = asg(S); return [1, 2, 3].map(v => v in o ? `x${SUB[v]} = ${o[v] ? 'T' : 'F'}` : `x${SUB[v]} either`).join(', '); };
    const steps = [
      { en: 'Given a Boolean formula in CNF with k = 3 clauses, build a graph (in polynomial time) such that the formula is satisfiable exactly when the graph has a clique of size k.', g: 0 },
      { en: 'For each clause, create a vertex for each literal: 3 + 2 + 2 = 7 vertices, grouped by clause.', g: 1 },
      { en: `Connect vertices from different clauses, but never a variable to its NOT. Clause 1 – clause 2: ${pairs(0, 1).length} edges (not ${miss(0, 1).join(', ')}).`, g: 2, E: [[0, 1]] },
      { en: `Clause 1 – clause 3: ${pairs(0, 2).length} edges${miss(0, 2).length ? ` (not ${miss(0, 2).join(', ')})` : ': every pair is compatible'}.`, g: 2, E: [[0, 1], [0, 2]] },
      { en: `Clause 2 – clause 3: ${pairs(1, 2).length} edges (not ${miss(1, 2).join(', ')}). The graph has ${EDG.length} edges. Vertices of one clause are never joined.`, g: 2, E: [[0, 1], [0, 2], [1, 2]] },
      { en: `The slide's red triangle: ¬x₂ (clause 1), ¬x₁ (clause 2), ¬x₂ (clause 3) is a clique of size 3. Make its literals TRUE: ${asTxt([1, 3, 5])}. Every clause then has a TRUE literal, so the formula is satisfied.`, g: 3, S: [1, 3, 5] },
      { en: `A clique of size m (one vertex per clause, no contradictions) is exactly a choice of one TRUE literal per clause. This graph has ${tri.length} cliques of size 3. <b>Tap one vertex in each clause</b> to test your own choice.`, g: 4 }];
    const ER = (s, i, j) => s.g >= 3 || (s.E && s.E.some(([a, b]) => NV[i].c === a && NV[j].c === b));
    const view = (s) => { const S = s.g === 4 ? sel : s.S || [], isTri = S.length === 3 && new Set(S.map(i => NV[i].c)).size === 3 && S.every((a, x) => S.slice(x + 1).every(b => okE(NV[a], NV[b])));
      const COL = ['var(--fig-k)', 'var(--ok)', '#d97706'];
      return html`<div className="a20-cl">${[[2, 1, 0], [3, 4], [5, 6]].map((g, c) => html`${c ? html`<span key=${'x' + c}>∧</span>` : ''}<span key=${c} className="a20-c" style=${{ borderColor: COL[c] }}>(${g.map(i => lt(NV[i])).join(' ∨ ')})</span>`)}</div>
        <svg viewBox="0 0 400 330" role="img" aria-label="Graph built from the formula">
          ${EDG.filter(([i, j]) => ER(s, i, j)).map(([i, j]) => { const hot = S.includes(i) && S.includes(j); const [x1, y1] = NV[i].p, [x2, y2] = NV[j].p;
            return html`<line key=${i + '-' + j} x1=${x1} y1=${y1} x2=${x2} y2=${y2} stroke=${hot ? 'var(--pen)' : 'var(--graphite)'} strokeWidth=${hot ? 4 : 1.5} opacity=${S.length && !hot ? .5 : 1} />`; })}
          ${NV.map((u, i) => { const [x, y] = u.p, on = S.includes(i); return html`<g key=${i} className=${pop(s.g >= 1) + (s.g === 4 ? ' a20-hitg' : '')} onClick=${() => s.g === 4 && setSel(q => q.includes(i) ? q.filter(z => z !== i) : [...q.filter(z => NV[z].c !== u.c), i])}>
            <circle cx=${x} cy=${y} r="24" fill=${on ? `color-mix(in srgb, ${COL[u.c]} 45%, var(--paper))` : `color-mix(in srgb, ${COL[u.c]} 14%, var(--paper))`} stroke=${COL[u.c]} strokeWidth=${on ? 4 : 2} />
            <text x=${x} y=${y + 7} textAnchor="middle" fontSize="19" fontWeight="700">${lt(u)}</text></g>`; })}
          <g className=${pop(s.g >= 1)}><text x="12" y="252" fontSize="18" fill="var(--fig-k)" fontWeight="700">clause 1</text><text x="396" y="186" textAnchor="end" fontSize="18" fill="var(--ok)" fontWeight="700">clause 2</text><text x="212" y="254" textAnchor="middle" fontSize="18" fill="#d97706" fontWeight="700" stroke="var(--paper-2)" strokeWidth="5" paintOrder="stroke">clause 3</text></g>
        </svg>
        ${s.g === 4 && html`<p className="a20-info">${S.length < 3 ? `Picked ${S.length} of 3 (one per clause).` : isTri ? `A clique of size 3: ${asTxt(S)} satisfies the formula.` : 'Not a clique: two of these literals contradict each other (x and ¬x).'}</p>`}`; };
    return html`<figure className="fig"><${Player} steps=${steps} view=${view} ms=${2800} /></figure>`;
  }

  window.FIGS = Object.assign(window.FIGS || {}, {
    'ag-20-bounds': Bounds, 'ag-20-growth': Growth, 'ag-20-isprime': IsPrime, 'ag-20-tsp': TspSpace, 'ag-20-clique': Clique,
    'ag-20-classes': Classes, 'ag-20-reduce': Reduce, 'ag-20-sat': Sat, 'ag-20-cnf-clique': CnfClique
  });
})();
/* ── part L8 ── */
// Algorithms visuals, Lecture 8 (Hashing): direct hashing and the division method (slides 5-9), multiplication (10-11), mid-square (12-13) and folding (14-15);
// amortized analysis of table doubling: aggregate (17-23), accounting (24-26) and potential (27-29); separate chaining (31-37), BST chains (38-43), AVL (44-46), rehashing (47-48);
// open addressing: linear probing (52-64), quadratic probing (69-73), secondary clustering (75-78), double hashing (83-86), expected probes (90) and cache misses (93). Every label and number comes from the slides.
(function () {
  const { useState, useEffect, useRef, useMemo } = React;
  const { html, useSteps, Cap, Bar, pop, calm, useClock, useFit, sec } = window.FIGKIT;
  const CSS = `
.a8 .fig-btn:disabled{ opacity:.45; cursor:default; }
.a8 .fig-stage sub, .a8 .fig-stage sup{ font-size:max(.78em, 12px); line-height:0; }
.a8-tabs{ display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin:0 0 10px; }
.a8-tabs .fig-btn{ font-size:.84rem; padding:4px 10px; }
.a8-tabs .fig-btn.on{ border-color:var(--fig-k); box-shadow:0 0 0 1px var(--fig-k); background:color-mix(in srgb, var(--fig-k) 14%, var(--paper)); }
.a8-form{ display:flex; flex-wrap:wrap; gap:8px 12px; justify-content:center; align-items:center; margin:0 0 10px; font-size:.88rem; color:var(--ink); }
.a8-form label{ display:flex; gap:5px; align-items:center; }
.a8-form input{ font:inherit; font-size:.92rem; padding:4px 6px; border:1px solid var(--line); border-radius:6px; background:var(--paper); color:var(--ink); min-width:0; }
.a8-form input.w{ width:min(230px, 70vw); } .a8-form input.n{ width:64px; }
.a8-help{ font-size:.8rem; color:var(--graphite); text-align:center; margin:-4px 0 10px; line-height:1.4; }
.a8-err{ color:var(--pen); font-size:.86rem; text-align:center; margin:0 0 8px; }
.a8-cnt{ font-size:.85rem; color:var(--graphite); }
.a8-k{ color:var(--fig-k); font-weight:700; }
.a8-ok{ color:var(--ok); font-weight:600; } .a8-bad{ color:var(--pen); font-weight:600; }
.a8-mono{ font-family:var(--mono, ui-monospace, SFMono-Regular, Menlo, monospace); }
/* hash table */
.a8-ht{ display:grid; gap:3px; max-width:380px; margin:0 auto; font-size:.9rem; color:var(--ink); }
.a8-hr{ display:grid; grid-template-columns:minmax(0,1fr) 22px 62px minmax(0,1fr); gap:6px; align-items:center; min-height:27px; }
.a8-ht.nar .a8-hr{ grid-template-columns:22px 1fr; }
.a8-hl{ text-align:right; color:var(--graphite); font-size:.8rem; line-height:1.2; }
.a8-hi{ text-align:right; color:var(--graphite); font-size:.82rem; }
.a8-hv{ height:25px; border:1px solid var(--line); border-radius:4px; background:var(--paper); display:grid; place-items:center; font-weight:600; transition:background .4s, box-shadow .4s; overflow:hidden; white-space:nowrap; }
.a8-hv.occ{ background:color-mix(in srgb, var(--fig-k) 22%, var(--paper)); }
.a8-hv.del{ background:repeating-linear-gradient(45deg, var(--paper), var(--paper) 4px, color-mix(in srgb, var(--faint) 35%, var(--paper)) 4px, color-mix(in srgb, var(--faint) 35%, var(--paper)) 8px); color:var(--graphite); font-weight:500; font-size:.75rem; }
.a8-hv.cur{ box-shadow:0 0 0 2px var(--fig-k); }
.a8-hv.cur.bad{ box-shadow:0 0 0 2px var(--pen); } .a8-hv.cur.ok{ box-shadow:0 0 0 2px var(--ok); }
.a8-hs{ font-size:.8rem; line-height:1.2; color:var(--graphite); }
.a8-hs.bad{ color:var(--pen); font-weight:600; } .a8-hs.ok{ color:var(--ok); font-weight:600; }
.a8-leg{ display:flex; flex-wrap:wrap; gap:6px 14px; justify-content:center; font-size:.8rem; color:var(--graphite); margin:10px 0 0; }
.a8-leg i{ display:inline-block; width:14px; height:12px; border:1px solid var(--line); border-radius:3px; vertical-align:-2px; margin-right:5px; background:var(--paper); }
.a8-leg i.occ{ background:color-mix(in srgb, var(--fig-k) 22%, var(--paper)); }
.a8-leg i.del{ background:repeating-linear-gradient(45deg, var(--paper), var(--paper) 3px, color-mix(in srgb, var(--faint) 45%, var(--paper)) 3px, color-mix(in srgb, var(--faint) 45%, var(--paper)) 6px); }
/* probe panel */
.a8-pw{ display:flex; flex-wrap:wrap; gap:12px 16px; justify-content:center; align-items:flex-start; }
.a8-pw > *{ flex:1 1 240px; min-width:0; }
.a8-pl{ border:1px solid var(--line); border-radius:8px; background:var(--paper); padding:8px 10px; font-size:.86rem; line-height:1.45; color:var(--ink); }
.a8-pl .op{ font-weight:700; color:var(--fig-k); margin-bottom:2px; }
.a8-pl .gen{ color:var(--graphite); margin-bottom:4px; }
.a8-pl .ln{ display:flex; flex-wrap:wrap; gap:0 8px; }
.a8-chips{ display:flex; flex-wrap:wrap; gap:4px; margin-top:4px; }
.a8-chips span{ border:1px solid var(--line); border-radius:99px; padding:1px 8px; font-size:.8rem; }
.a8-chips span.bad{ border-color:var(--pen); } .a8-chips span.ok{ border-color:var(--ok); }
/* chips of keys */
.a8-keys{ display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin:0 0 12px; font-size:.86rem; }
.a8-keys span{ border:1px solid var(--line); border-radius:6px; padding:2px 8px; background:var(--paper); color:var(--ink); transition:opacity .4s, background .4s; }
.a8-keys span.on{ background:color-mix(in srgb, var(--fig-k) 22%, var(--paper)); border-color:var(--fig-k); }
.a8-keys span.x{ border-color:var(--pen); color:var(--pen); }
.a8-keys span.dim{ opacity:.45; }
/* side by side tables */
.a8-two{ display:flex; flex-wrap:wrap; gap:14px; justify-content:center; }
.a8-two > div{ flex:1 1 120px; max-width:200px; min-width:0; }
.a8-two h4{ margin:0 0 6px; text-align:center; font-size:.88rem; color:var(--ink); }
.a8-two .a8-hv{ font-size:.82rem; padding:0 4px; }
.a8-two p{ margin:6px 0 0; text-align:center; font-size:.8rem; color:var(--graphite); }
/* computation lines */
.a8-calc{ max-width:440px; margin:0 auto; display:grid; gap:6px; font-size:.95rem; color:var(--ink); }
.a8-calc > div{ border-left:3px solid var(--fig-k); background:var(--paper); padding:5px 10px; border-radius:0 6px 6px 0; overflow-wrap:anywhere; }
.a8-calc .lab{ display:block; font-size:.78rem; color:var(--graphite); }
.a8-calc .big{ font-size:1.1rem; font-weight:700; }
/* digits */
.a8-dg{ display:flex; flex-wrap:wrap; gap:3px; justify-content:center; align-items:center; margin:4px 0; }
.a8-dg span{ min-width:20px; height:28px; display:grid; place-items:center; border:1px solid var(--line); border-radius:4px; background:var(--paper); font-weight:600; font-size:.95rem; transition:background .4s; }
.a8-dg span.on{ background:color-mix(in srgb, var(--fig-k) 28%, var(--paper)); border-color:var(--fig-k); }
.a8-dg span.rv{ background:color-mix(in srgb, var(--ok) 22%, var(--paper)); border-color:var(--ok); }
.a8-dg i{ width:8px; }
.a8-ms{ display:grid; gap:8px; max-width:460px; margin:0 auto; }
.a8-ms > div{ border:1px solid var(--line); border-radius:8px; background:var(--paper); padding:6px 10px; font-size:.86rem; color:var(--ink); }
.a8-ms .hd{ display:flex; flex-wrap:wrap; justify-content:space-between; gap:2px 10px; }
.a8-ms .hd b{ color:var(--fig-k); }
/* dynamic table */
.a8-arr{ display:flex; flex-wrap:wrap; gap:3px; justify-content:center; min-height:30px; margin:0 0 6px; }
.a8-arr span{ width:24px; height:26px; border:1px solid var(--graphite); border-radius:3px; background:var(--paper); display:grid; place-items:center; font-size:.78rem; font-weight:600; color:var(--ink); }
.a8-arr span.f{ background:color-mix(in srgb, var(--fig-k) 22%, var(--paper)); }
.a8-arr span.n{ background:var(--fig-s); color:#fff; border-color:transparent; }
.a8-arr span.c{ box-shadow:0 0 0 2px var(--pen); }
.a8-note{ text-align:center; font-size:.84rem; color:var(--graphite); margin:0 0 8px; min-height:1.3em; }
.a8-tb{ border-collapse:collapse; margin:0 auto; font-size:.86rem; color:var(--ink); }
.a8-tb th, .a8-tb td{ border:1px solid var(--line); padding:3px 7px; text-align:center; }
.a8-tb th{ background:var(--paper); font-weight:600; }
.a8-tb td{ background:var(--paper); }
.a8-tb tr.cur td{ background:color-mix(in srgb, var(--fig-k) 18%, var(--paper)); }
.a8-tb tr.exp td.c{ color:var(--pen); font-weight:700; }
.a8-coins{ display:flex; flex-wrap:wrap; gap:4px; justify-content:center; align-items:center; margin:0 0 8px; min-height:26px; font-size:.84rem; color:var(--graphite); }
.a8-coins i{ width:22px; height:22px; border-radius:50%; display:grid; place-items:center; font-style:normal; font-size:.75rem; font-weight:700; background:color-mix(in srgb, var(--ok) 30%, var(--paper)); border:1px solid var(--ok); color:var(--ink); }
.a8-sum{ max-width:440px; margin:10px auto 0; border:1px solid var(--line); border-radius:8px; background:var(--paper); padding:8px 10px; font-size:.9rem; line-height:1.5; color:var(--ink); }
/* derivation */
.a8-der{ max-width:460px; margin:0 auto; display:grid; gap:3px; font-size:.95rem; color:var(--ink); }
.a8-der div{ padding:2px 8px; border-radius:5px; }
.a8-der div.h{ font-weight:700; color:var(--fig-k); margin-top:6px; }
.a8-der div.cur{ background:color-mix(in srgb, var(--fig-k) 14%, var(--paper)); }
.a8-der div.r{ font-weight:700; }
/* chains */
.a8-ch{ display:grid; gap:6px; max-width:420px; margin:0 auto; font-size:.86rem; color:var(--ink); }
.a8-cr{ display:flex; align-items:center; gap:3px; flex-wrap:wrap; }
.a8-cr .a8-ix{ width:34px; text-align:center; flex:none; height:28px; display:grid; place-items:center; border:1px solid var(--graphite); border-radius:3px; background:color-mix(in srgb, var(--fig-k) 12%, var(--paper)); font-size:.82rem; }
.a8-cr .a8-ix.on{ background:var(--fig-s); color:#fff; border-color:transparent; }
.a8-cr .a8-nd{ min-width:34px; height:28px; padding:0 6px; display:grid; place-items:center; border:1px solid var(--graphite); border-radius:3px; background:var(--paper); }
.a8-cr .a8-nd.on{ box-shadow:0 0 0 2px var(--fig-k); }
.a8-cr .a8-nd.ok{ box-shadow:0 0 0 2px var(--ok); background:color-mix(in srgb, var(--ok) 16%, var(--paper)); }
.a8-cr .a8-nd.bad{ box-shadow:0 0 0 2px var(--pen); text-decoration:line-through; }
.a8-cr .a8-ar{ color:var(--graphite); }
.a8-cr .a8-nil{ color:var(--faint); font-size:.8rem; }
.a8-lf{ text-align:center; font-size:.95rem; color:var(--ink); margin:10px 0 0; }
.a8-lf b{ color:var(--fig-k); }
/* svg */
.a8 svg .ed{ stroke:var(--graphite); stroke-width:1.6; fill:none; }
.a8 svg .nd{ fill:var(--paper); stroke:var(--fig-k); stroke-width:2; }
.a8 svg .nd.hl{ fill:color-mix(in srgb, var(--fig-k) 25%, var(--paper)); }
.a8 svg .nd.bad{ stroke:var(--pen); stroke-width:3; }
.a8 svg .nd.ok{ stroke:var(--ok); stroke-width:3; }
.a8 svg .cell{ fill:color-mix(in srgb, var(--fig-k) 18%, var(--paper)); stroke:var(--graphite); stroke-width:1; }
.a8 svg .cell.on{ fill:var(--fig-s); }
.a8 svg text.on{ fill:#fff; }
.a8 svg .ax{ stroke:var(--graphite); stroke-width:1.3; fill:none; }
.a8 svg .gr{ stroke:var(--line); stroke-width:1; }
.a8 svg .cv{ stroke:var(--fig-k); stroke-width:3; fill:none; }
.a8 svg .cv2{ stroke:var(--pen); stroke-width:3; fill:none; }
.a8 svg .dot{ fill:var(--fig-k); }
.a8 svg .muted{ fill:var(--graphite); }
.a8 svg .halo{ fill:color-mix(in srgb, var(--fig-k) 12%, transparent); stroke:var(--fig-k); stroke-dasharray:5 4; stroke-width:1.5; }
.a8 svg .halo2{ fill:color-mix(in srgb, var(--ok) 12%, transparent); stroke:var(--ok); stroke-dasharray:5 4; stroke-width:1.5; }
.a8-rng{ display:flex; gap:10px; align-items:center; justify-content:center; font-size:.9rem; color:var(--ink); margin:8px 0 0; flex-wrap:wrap; }
.a8-rng input{ width:min(220px, 60vw); accent-color:var(--fig-k); }
`;
  if (!document.getElementById('a8-css')) { const s = document.createElement('style'); s.id = 'a8-css'; s.textContent = CSS; document.head.appendChild(s); }

  /* ── shared helpers ── */
  function useRun(n, ms, sig) {
    const [i, setI] = useState(calm() ? n - 1 : 0), [play, setPlay] = useState(!calm());
    const first = useRef(true);
    useEffect(() => { if (first.current) { first.current = false; return; } setI(calm() ? n - 1 : 0); setPlay(!calm()); }, [sig]);
    const ii = Math.min(i, n - 1);
    useEffect(() => { if (!play) return; if (ii >= n - 1) { setPlay(false); return; } const t = setTimeout(() => setI(x => Math.min(x, n - 1) + 1), ms); return () => clearTimeout(t); }, [ii, play, n]);
    return [ii, { replay: () => { setI(0); setPlay(!calm()); }, go: j => { setPlay(false); setI(j); } }];
  }
  const Nav = ({ n, i, ctl }) => html`<div className="fig-bar">
    ${n <= 16 ? html`<div className="fig-dots" aria-hidden="true">${Array.from({ length: n }, (_, j) => html`<i key=${j} className=${j <= i ? 'on' : ''}></i>`)}</div>` : html`<span className="a8-cnt">Step ${i + 1} of ${n}</span>`}
    <span className="grow"></span>
    <button className="fig-btn" onClick=${() => ctl.go(Math.max(0, i - 1))} disabled=${i === 0} aria-label="Previous step">‹ Back</button>
    <button className="fig-btn" onClick=${() => ctl.go(Math.min(n - 1, i + 1))} disabled=${i >= n - 1} aria-label="Next step">Next ›</button>
    <button className="fig-btn" onClick=${ctl.replay}>↻ Replay</button></div>`;
  const Tabs = ({ opts, v, set }) => html`<div className="a8-tabs" role="tablist">${opts.map(([k, t]) => html`<button key=${k} role="tab" aria-selected=${v === k} className=${'fig-btn' + (v === k ? ' on' : '')} onClick=${() => set(k)}>${t}</button>`)}</div>`;
  const H = s => html`<span dangerouslySetInnerHTML=${{ __html: s }}></span>`;
  const fmt = x => String(Math.round(x * 1e9) / 1e9);
  const Fig = (kids, cap, nav, label) => html`<figure className="fig a8"><div className="fig-stage" role="group" aria-label=${label || ''}>${kids}</div><${Cap} en=${cap} />${nav}</figure>`;

  /* ── slides 5-7: direct hashing, then the division method with its collision ── */
  function Direct() {
    const D = [1, 4, 7, 9, 0, 8, 30], V = [1, 4, 7, 9, 0, 8, 35, 30];
    const steps = [
      'In <b>direct hashing</b> the key is the address without any algorithmic manipulation: <b>h(K) = K</b>. Key space: 1, 4, 7, 9, 0, 8, 30; the table has slots 0 to 9.',
      'Each key goes to the slot with its own number: 1 → 1, 4 → 4, 7 → 7, 9 → 9, 0 → 0, 8 → 8. Searching, insertion and deletion are all <b>O(1)</b>.',
      'But h(30) = 30 and there is no slot 30. The address space (array) must be as large as the largest key: <b>memory consuming</b>, and most slots stay empty.',
      '<b>Division method</b>: h(k) = k mod n with n = 10. Key space: 1, 4, 7, 9, 0, 8, 35, 30. Now 35 mod 10 = 5 and 30 mod 10 = 0, so every key fits in 10 slots.',
      'But 0 mod 10 = 0 and 30 mod 10 = 0: two keys want slot 0, a <b>collision</b>. It is best that n is a <b>prime number</b>, so the keys spread more uniformly.'
    ];
    const [i, ctl] = useSteps(steps.length, 2300);
    const div = i >= 3, keys = div ? V : D;
    const T = Array(10).fill(null), marks = {};
    if (!div) { if (i >= 1) D.slice(0, 6).forEach(k => { T[k] = String(k); }); }
    else { V.forEach(k => { const j = k % 10; T[j] = T[j] == null ? String(k) : T[j] + ', ' + k; }); if (i === 4) marks[0] = { labs: ['h(0) = h(30) = 0'], st: 'Collision', cls: 'bad' }; else marks[5] = { labs: ['35 mod 10'], st: '', cls: '' }; }
    const chip = k => { if (i === 0) return ['', '']; if (!div) return k === 30 ? (i === 2 ? ['x', ' → 30 ✗'] : ['', '']) : ['on', ' → ' + k]; return [(i === 4 && (k === 0 || k === 30)) ? 'x' : 'on', ' → ' + (k % 10)]; };
    return Fig(html`<div className="a8-keys" aria-label="Key space">${keys.map(k => { const c = chip(k); return html`<span key=${k} className=${c[0]}>${k}${c[1]}</span>`; })}</div>
      <div className="a8-note">${div ? 'h(k) = k mod 10' : i === 2 ? 'h(30) = 30, but there is no slot 30' : 'h(K) = K'}</div>
      <${HT} T=${T} marks=${marks} />`, steps[i], html`<${Bar} steps=${steps} i=${i} ctl=${ctl} />`, 'Key space mapped into a table of 10 slots');
  }

  /* ── hash table (vertical, as on the slides) ── */
  const DEL = 'DEL';
  function HT({ T, marks, narrow }) {
    return html`<div className=${'a8-ht' + (narrow ? ' nar' : '')}>${T.map((v, j) => { const mk = marks && marks[j]; return html`<div className="a8-hr" key=${j}>
      ${narrow ? null : html`<span className="a8-hl">${mk ? H(mk.labs.join(', ')) : ''}</span>`}
      <span className="a8-hi">${j}</span>
      <span className=${'a8-hv' + (v === DEL ? ' del' : v != null ? ' occ' : '') + (mk && mk.cls !== undefined ? ' cur ' + mk.cls : '')}>${v === DEL ? 'Deleted' : v == null ? '' : v}</span>
      ${narrow ? null : html`<span className=${'a8-hs ' + (mk ? mk.cls : '')}>${mk ? H(mk.st) : ''}</span>`}</div>`; })}</div>`;
  }
  const Legend = () => html`<div className="a8-leg"><span><i></i>Empty</span><span><i className="occ"></i>Occupied</span><span><i className="del"></i>Deleted</span></div>`;

  /* ── slide 9: mod 4 against the prime 7 ── */
  function parseNums(t, max, lo, hi) {
    const tok = String(t).split(/[\s,]+/).filter(Boolean);
    if (!tok.length) return { err: 'Type at least one key.' };
    if (tok.length > max) return { err: `At most ${max} keys.` };
    const v = []; for (const x of tok) { if (!/^\d+$/.test(x)) return { err: `"${x}" is not a whole number.` }; const n = +x; if (n < lo || n > hi) return { err: `Keys must be ${lo} to ${hi}.` }; v.push(n); }
    return { v };
  }
  function ModPrime() {
    const [mode, setMode] = useState('slide'), [kt, setKt] = useState('10, 20, 30, 40, 50'), [at, setAt] = useState('4'), [bt, setBt] = useState('7');
    const good = useRef({ keys: [10, 20, 30, 40, 50], a: 4, b: 7 });
    let err = '';
    if (mode === 'own') { const p = parseNums(kt, 10, 0, 9999), a = +at, b = +bt; if (p.err) err = p.err; else if (!(Number.isInteger(a) && a >= 2 && a <= 12 && Number.isInteger(b) && b >= 2 && b <= 12)) err = 'Both table sizes must be 2 to 12.'; else good.current = { keys: p.v, a, b }; }
    const S = mode === 'slide' ? { keys: [10, 20, 30, 40, 50], a: 4, b: 7 } : good.current;
    const n = S.keys.length + 2, sig = JSON.stringify([mode, S]);
    const [i, ctl] = useRun(n, 1800, sig);
    const shown = Math.min(Math.max(i, 0), S.keys.length);
    const tbl = m => { const T = Array(m).fill(null); S.keys.slice(0, shown).forEach(k => { const j = k % m; T[j] = T[j] == null ? String(k) : T[j] + ', ' + k; }); return T; };
    const used = m => new Set(S.keys.map(k => k % m)).size;
    const isP = x => { if (x < 2) return false; for (let d = 2; d * d <= x; d++) if (x % d === 0) return false; return true; };
    let cap;
    if (i === 0) cap = mode === 'slide' ? 'If data is random it does not matter which table size we pick. But when data is not random, strange things happen. Keys 10, 20, 30, 40, 50 into a table of size 4 and a table of the prime size 7.' : `Your keys into a table of size ${S.a} and one of size ${S.b}. Press Next to place them one by one.`;
    else if (i <= S.keys.length) { const k = S.keys[i - 1]; cap = `${k} mod ${S.a} = <b>${k % S.a}</b> and ${k} mod ${S.b} = <b>${k % S.b}</b>.`; }
    else cap = mode === 'slide' ? 'With mod 4, of the possible values 0, 1, 2, 3 only <b>0 and 2</b> are used, so they collide: that is bad. With the prime 7 the keys land in 3, 6, 2, 4, 1: <b>no collisions</b>.' : `Size ${S.a}${isP(S.a) ? ' (prime)' : ''} uses ${used(S.a)} of ${S.a} slots; size ${S.b}${isP(S.b) ? ' (prime)' : ''} uses ${used(S.b)} of ${S.b} slots for ${S.keys.length} keys.`;
    const marks = m => { if (i < 1 || i > S.keys.length) return {}; const k = S.keys[i - 1], j = k % m, T = tbl(m); return { [j]: { labs: [], st: '', cls: T[j] && T[j].includes(',') ? 'bad' : 'ok' } }; };
    return Fig(html`<${Tabs} opts=${[['slide', 'Example from the slides'], ['own', 'Try your own']]} v=${mode} set=${setMode} />
      ${mode === 'own' ? html`<div className="a8-form"><label>Keys <input className="w" value=${kt} onInput=${e => setKt(e.target.value)} aria-label="Keys" /></label><label>n₁ <input className="n" type="number" min="2" max="12" value=${at} onInput=${e => setAt(e.target.value)} aria-label="First table size" /></label><label>n₂ <input className="n" type="number" min="2" max="12" value=${bt} onInput=${e => setBt(e.target.value)} aria-label="Second table size" /></label></div>${err ? html`<div className="a8-err">${err}</div>` : null}` : null}
      <div className="a8-two">${[S.a, S.b].map((m, t) => html`<div key=${t}><h4>k mod ${m}</h4><${HT} T=${tbl(m)} marks=${marks(m)} narrow=${true} /><p>${i > S.keys.length ? `${used(m)} of ${m} slots used` : ''}</p></div>`)}</div>`,
      cap, html`<${Nav} n=${n} i=${i} ctl=${ctl} />`, 'Keys placed with mod 4 and with mod 7');
  }

  /* ── slides 10-11: the multiplication method ── */
  function Mult() {
    const [mode, setMode] = useState('123'), [kt, setKt] = useState('123'), [nt, setNt] = useState('100'), [At, setAt] = useState('0.618033');
    const good = useRef({ k: 123, n: 100, A: 0.618033 });
    let err = '';
    if (mode === 'own') { const k = +kt, n = +nt, A = +At; if (!/^\d{1,6}$/.test(kt.trim())) err = 'k must be a whole number 0 to 999999.'; else if (!(Number.isInteger(n) && n >= 1 && n <= 10000)) err = 'n must be 1 to 10000.'; else if (!(A > 0 && A < 1)) err = 'A must be between 0 and 1.'; else good.current = { k, n, A }; }
    const S = mode === '123' ? { k: 123, n: 100, A: 0.618033 } : mode === '150' ? { k: 150, n: 100, A: 0.618033 } : good.current;
    const kA = +fmt(S.k * S.A), fr = +fmt(kA - Math.floor(kA)), nf = +fmt(S.n * fr), h = Math.floor(nf + 1e-9);
    const lines = [
      ['h(k) = ⌊ n ( kA mod 1 ) ⌋', `k = ${S.k}, n = ${S.n}, A = ${S.A}`],
      ['k · A', `${S.k} × ${S.A} = ${kA}`],
      ['kA mod 1 (keep the fractional part)', `${kA} mod 1 = ${fr}`],
      ['n · (kA mod 1)', `${S.n} × ${fr} = ${nf}`],
      ['floor', `h(${S.k}) = ⌊ ${nf} ⌋ = ${h}`]
    ];
    const caps = [
      'The <b>multiplication method</b>: multiply k by a constant A between 0 and 1, keep the fractional part, multiply it by n and take the floor. Advantage: the value of n is not critical. Disadvantage: slower than the division method.',
      `Multiply the key by A: ${S.k} × ${S.A} = <b>${kA}</b>.`,
      `kA mod 1 throws away the integer part: <b>${fr}</b>, a number in [0, 1).`,
      `Scale it to the table: ${S.n} × ${fr} = <b>${nf}</b>, a number in [0, ${S.n}).`,
      `Take the floor: <b>h(${S.k}) = ${h}</b>.${mode !== 'own' ? ' Same as slide 11.' : ''}`
    ];
    const sig = JSON.stringify([mode, S]);
    const [i, ctl] = useRun(5, 2000, sig);
    return Fig(html`<${Tabs} opts=${[['123', 'k = 123'], ['150', 'k = 150'], ['own', 'Try your own']]} v=${mode} set=${setMode} />
      ${mode === 'own' ? html`<div className="a8-form"><label>k <input className="n" value=${kt} onInput=${e => setKt(e.target.value)} aria-label="Key k" style=${{ width: '86px' }} /></label><label>n <input className="n" type="number" value=${nt} onInput=${e => setNt(e.target.value)} aria-label="Table size n" /></label><label>A <input className="n" value=${At} onInput=${e => setAt(e.target.value)} aria-label="Constant A" style=${{ width: '86px' }} /></label></div>${err ? html`<div className="a8-err">${err}</div>` : null}` : null}
      <div className="a8-calc">${lines.map((l, j) => html`<div key=${j} className=${pop(j <= i)}><span className="lab">${l[0]}</span><span className=${j === 4 ? 'big' : ''}>${l[1]}</span></div>`)}</div>`,
      caps[i], html`<${Nav} n=${5} i=${i} ctl=${ctl} />`, 'Multiplication method computed line by line');
  }

  /* ── slides 12-13: the mid-square method ── */
  function midSq(k, n) {
    const sq = String(BigInt(k) * BigInt(k)), r = String(n - 1).length, L = sq.length;
    let w = L <= r ? L : ((L - r) % 2 === 0 ? r : r + 1); const st = Math.max(0, Math.floor((L - w) / 2));
    const mid = sq.slice(st, st + w), h = Number(mid) % n;
    return { sq, r, st, w, mid, h, modded: Number(mid) >= n };
  }
  const MS = [
    { k: 120, n: 10, rng: '0→9' }, { k: 50, n: 100, rng: '0→99' }, { k: 1234, n: 1000, rng: '0→999', slip: 'the slide shows the range 0→199' },
    { k: 110, n: 200, rng: '0→199', slip: 'the slide writes h(50) = 10' }, { k: 5642, n: 1000, rng: '0→999' }
  ];
  function MidRow({ k, n, rng, on }) {
    const m = midSq(k, n);
    return html`<div className=${pop(on)}><div className="hd"><span>k = <b>${k}</b>, n = ${n} (${rng}, r = ${m.r})</span><span>h(${k}) = <b>${m.h}</b></span></div>
      <div className="a8-dg" aria-label=${'k squared = ' + m.sq}><span style=${{ border: 0, background: 'none' }}>k² =</span>${m.sq.split('').map((d, j) => html`<span key=${j} className=${j >= m.st && j < m.st + m.w ? 'on' : ''}>${d}</span>`)}</div>
      <div style=${{ textAlign: 'center', color: 'var(--graphite)' }}>middle digits ${m.mid}${m.modded || m.w > m.r ? ` → ${m.mid} mod ${n} = ${m.h}` : ''}</div></div>`;
  }
  function MidSquare() {
    const [mode, setMode] = useState('slide'), [kt, setKt] = useState('5642'), [nt, setNt] = useState('1000');
    const steps = [
      'The <b>mid-square method</b>: square the key and extract the <b>middle r digits</b>, where r depends on the table size n (n = 10 → r = 1, n = 100 → r = 2, n = 1000 → r = 3).',
      ...MS.map(e => { const m = midSq(e.k, e.n); return `k = ${e.k}, n = ${e.n}: k² = ${m.sq}. Its middle ${m.w} digit${m.w > 1 ? 's are' : ' is'} <b>${m.mid}</b>${m.modded || m.w > m.r ? `, and ${m.mid} mod ${e.n} = ${m.h} keeps it in ${e.rng}` : ''}, so h(${e.k}) = <b>${m.h}</b>.${e.slip ? ' (' + e.slip + '.)' : ''}${m.w > m.r ? ' k² has an even number of digits, so the slide takes the middle 4 and reduces them.' : ''}`; }),
      'Advantage: collisions are much fewer, because every digit of the key affects the middle of k². Disadvantage: it is difficult to calculate the square of large values.'
    ];
    const [i, ctl] = useSteps(steps.length, 2600);
    let own = null, err = '';
    if (mode === 'own') { const n = +nt; if (!/^\d{1,7}$/.test(kt.trim())) err = 'k must be a whole number with up to 7 digits.'; else if (!(Number.isInteger(n) && n >= 2 && n <= 10000)) err = 'n must be 2 to 10000.'; else own = { k: +kt, n }; }
    const om = own && midSq(own.k, own.n);
    const cap = mode === 'own' ? (own ? `k = ${own.k}, n = ${own.n} gives r = ${om.r} (the digits of ${own.n - 1}). k² = ${om.sq}; the middle ${om.w} digit${om.w > 1 ? 's' : ''} ${om.w > 1 ? 'are' : 'is'} ${om.mid}${om.modded || om.w > om.r ? `, and ${om.mid} mod ${own.n} = ${om.h}` : ''}. So <b>h(${own.k}) = ${om.h}</b>.` : 'Fix the input above.') : steps[i];
    return Fig(html`<${Tabs} opts=${[['slide', 'Examples from the slides'], ['own', 'Try your own']]} v=${mode} set=${setMode} />
      ${mode === 'own' ? html`<div className="a8-form"><label>k <input className="n" value=${kt} onInput=${e => setKt(e.target.value)} aria-label="Key k" style=${{ width: '96px' }} /></label><label>n <input className="n" type="number" value=${nt} onInput=${e => setNt(e.target.value)} aria-label="Table size n" style=${{ width: '80px' }} /></label></div>${err ? html`<div className="a8-err">${err}</div>` : null}
        ${own ? html`<div className="a8-ms"><${MidRow} k=${own.k} n=${own.n} rng=${'0→' + (own.n - 1)} on=${true} /></div>` : null}`
      : html`<div className="a8-ms">${MS.map((e, j) => html`<${MidRow} key=${j} ...${e} on=${i >= j + 1} />`)}</div>`}`,
      cap, mode === 'own' ? null : html`<${Bar} steps=${steps} i=${i} ctl=${ctl} />`, 'Mid-square examples');
  }

  /* ── slides 14-15: folding ── */
  function foldSteps(key, r, slide) {
    const parts = []; for (let j = 0; j < key.length; j += r) parts.push(key.slice(j, j + r));
    const M = Math.pow(10, r), sum = parts.reduce((a, p) => a + Number(p), 0);
    const rev = parts.map((p, j) => (j === 0 || j === parts.length - 1) && parts.length > 1 ? p.split('').reverse().join('') : p);
    const sumB = rev.reduce((a, p) => a + Number(p), 0);
    const S = [];
    if (slide) {
      S.push({ parts: ['123', '456', '78'], key, cap: 'The <b>folding method</b>: partition the key K into parts K1, K2, …, then add the parts. The partition depends on the address size: for key 12345678 and an address of 3 digits the parts are <b>123, 456, 78</b>.' });
      S.push({ parts: ['1234', '5678'], key, cap: 'If the address size is 4, the parts are <b>1234, 5678</b>.' });
    }
    S.push({ parts, key, cap: `The required address has ${r} digit${r > 1 ? 's' : ''} (0 to ${M - 1}), so break the key into parts of ${r}: <b>${parts.join(', ')}</b>.` });
    S.push({ parts, key, sum: `${parts.join(' + ')} = ${sum}`, res: `${sum} % ${M} = ${sum % M}`, cap: `<b>Fold-shifting</b>: add the actual values of the parts: ${parts.join(' + ')} = ${sum}, and ${sum} % ${M} = <b>${sum % M}</b>${slide ? '. We get 80 as the location.' : '.'}` });
    S.push({ parts: rev, key, rv: true, sum: `${rev.join(' + ')} = ${sumB}`, res: `${sumB} % ${M} = ${sumB % M}`, cap: parts.length > 1 ? `<b>Fold-boundary</b>: reverse the outer parts (${parts[0]} → ${rev[0]}, ${parts[parts.length - 1]} → ${rev[rev.length - 1]}) and add: ${rev.join(' + ')} = ${sumB}, and ${sumB} % ${M} = <b>${sumB % M}</b>${slide ? '. We get 98 as the location.' : '.'}` : 'Only one part, so there is nothing to fold.' });
    return S;
  }
  function Folding() {
    const [mode, setMode] = useState('slide'), [kt, setKt] = useState('12345678'), [rt, setRt] = useState('2');
    const good = useRef({ key: '12345678', r: 2 });
    let err = '';
    if (mode === 'own') { const r = +rt; if (!/^\d{2,12}$/.test(kt.trim())) err = 'The key must have 2 to 12 digits.'; else if (!(r >= 1 && r <= 4 && Number.isInteger(r))) err = 'The address size must be 1 to 4 digits.'; else good.current = { key: kt.trim(), r }; }
    const S = mode === 'slide' ? { key: '12345678', r: 2 } : good.current;
    const steps = foldSteps(S.key, S.r, mode === 'slide');
    const [i, ctl] = useRun(steps.length, 2400, JSON.stringify([mode, S]));
    const st = steps[i];
    let off = 0;
    return Fig(html`<${Tabs} opts=${[['slide', 'Example from the slides'], ['own', 'Try your own']]} v=${mode} set=${setMode} />
      ${mode === 'own' ? html`<div className="a8-form"><label>Key <input className="n" value=${kt} onInput=${e => setKt(e.target.value)} aria-label="Key" style=${{ width: '130px' }} /></label><label>Address digits <input className="n" type="number" min="1" max="4" value=${rt} onInput=${e => setRt(e.target.value)} aria-label="Address digits" /></label></div>${err ? html`<div className="a8-err">${err}</div>` : null}` : null}
      <div className="a8-note">K = ${S.key}</div>
      <div className="a8-dg">${st.parts.map((p, j) => { const outer = st.rv && (j === 0 || j === st.parts.length - 1) && st.parts.length > 1; return html`<${React.Fragment} key=${j}>${j ? html`<i></i>` : null}${p.split('').map((d, q) => html`<span key=${q} className=${outer ? 'rv' : 'on'}>${d}</span>`)}</${React.Fragment}>`; })}</div>
      <div className="a8-calc" style=${{ marginTop: '10px' }}>
        <div className=${pop(!!st.sum)}><span className="lab">${st.rv ? 'fold-boundary sum' : 'fold-shifting sum'}</span>${st.sum || ' '}</div>
        <div className=${pop(!!st.res)}><span className="lab">location</span><span className="big">${st.res || ' '}</span></div></div>`,
      st.cap, html`<${Nav} n=${steps.length} i=${i} ctl=${ctl} />`, 'Folding the key into parts');
  }

  /* ── slides 17-23: aggregate method on table doubling ── */
  const sizeOf = i => { let s = 1; while (s < i) s *= 2; return s; };
  const pow2 = x => x > 0 && (x & (x - 1)) === 0;
  const costOf = i => pow2(i - 1) ? i : 1;
  function DynArr({ i }) {
    if (i < 1) return html`<div className="a8-arr"><span></span></div>`;
    const s = sizeOf(i), exp = pow2(i - 1);
    return html`<div className="a8-arr" aria-label=${`table of size ${s} holding ${i} items`}>${Array.from({ length: s }, (_, j) => html`<span key=${j} className=${j === i - 1 ? 'n' : j < i - 1 ? 'f' + (exp ? ' c' : '') : ''}>${j < i ? j + 1 : ''}</span>`)}</div>`;
  }
  function Aggregate() {
    const N = 10, rows = Array.from({ length: N }, (_, j) => ({ i: j + 1, s: sizeOf(j + 1), c: costOf(j + 1) }));
    const steps = [
      { cap: 'Dynamic table: when the table is full, allocate a table <b>twice</b> as large, copy the old contents, free the old table, then insert. A simple analysis says one insert costs O(n) in the worst case, so n inserts cost n · O(n) = O(n<sup>2</sup>). Is that really correct?' },
      ...rows.map(r => ({ cap: r.i === 1 ? 'Insert 1: the table of size 1 is empty, cost c<sub>1</sub> = 1.' : pow2(r.i - 1) ? `Insert ${r.i}: i − 1 = ${r.i - 1} is an exact power of 2, so the table is full. Double it to ${r.s}, copy the ${r.i - 1} old item${r.i > 2 ? 's' : ''} and write the new one: c<sub>${r.i}</sub> = ${r.i - 1} + 1 = <b>${r.i}</b>.` : `Insert ${r.i}: there is room in the table of size ${r.s}, so c<sub>${r.i}</sub> = <b>1</b>.` })),
      { cap: 'Split each cost into the 1 for writing the new item plus the copies: c<sub>i</sub> = 1 + (i − 1) when i − 1 is a power of 2. The copies are 1, 2, 4, 8, …, a <b>geometric series</b>.' },
      { cap: 'Cost of n insertions = Σ c<sub>i</sub> ≤ (1 + 1 + … + 1) + (1 + 2 + 4 + …) ≤ n + 2n = <b>3n</b>. For n = 10: 10 + (1 + 2 + 4 + 8) = 25 ≤ 30. So n insertions cost O(n), and the amortized cost per insertion is 3n / n = <b>3 = O(1)</b>.' }
    ];
    const [i, ctl] = useSteps(steps.length, 1700);
    const k = Math.min(i, N), split = i > N;
    return Fig(html`<div className="a8-note">${k ? `size = ${sizeOf(k)}${pow2(k - 1) && k > 1 ? `, ${k - 1} copied` : ''}` : 'empty table'}</div><${DynArr} i=${k} />
      <table className="a8-tb" style=${{ marginTop: '6px' }}><thead><tr><th>i</th><th>size<sub>i</sub></th><th>c<sub>i</sub></th>${split ? html`<th>1 + copies</th>` : null}</tr></thead>
      <tbody>${rows.map(r => html`<tr key=${r.i} className=${(r.i === k && !split ? 'cur ' : '') + (pow2(r.i - 1) && r.i > 1 ? 'exp' : '')} style=${{ visibility: r.i <= k ? 'visible' : 'hidden' }}><td>${r.i}</td><td>${r.s}</td><td className="c">${r.c}</td>${split ? html`<td>${r.c > 1 ? `1 + ${r.c - 1}` : '1'}</td>` : null}</tr>`)}</tbody></table>
      ${i === steps.length - 1 ? html`<div className="a8-sum">Σ c<sub>i</sub> = 1+2+3+1+5+1+1+1+9+1 = <b>25</b> ≤ n + 2n = 30<br />amortized cost = 3n / n = <b>3 = O(1)</b></div>` : null}`,
      steps[i].cap, html`<${Nav} n=${steps.length} i=${i} ctl=${ctl} />`, 'Table doubling, cost of each insertion');
  }

  /* ── slides 24-26: accounting method ── */
  function Accounting() {
    const N = 10, rows = []; let b = 0;
    for (let i = 1; i <= N; i++) { const c = costOf(i); b = b + 3 - c; rows.push({ i, s: sizeOf(i), c, b }); }
    const steps = [
      { cap: 'Accounting method: charge the i-th operation an amortized cost ĉ<sub>i</sub>, where <b>$1 pays for 1 unit of work</b>. The fee pays for the operation; any amount not consumed is stored in the <b>bank</b> for later operations. The bank must never go negative: Σ c<sub>i</sub> ≤ Σ ĉ<sub>i</sub>.' },
      ...rows.map((r, j) => { const prev = j ? rows[j - 1].b : 0; return { cap: `Insert ${r.i}: charge ĉ<sub>${r.i}</sub> = $3, the true cost is c<sub>${r.i}</sub> = ${r.c}${r.c > 1 ? ` (${r.c - 1} copied + 1 written)` : ''}. Bank: b<sub>${r.i}</sub> = ${prev} + 3 − ${r.c} = <b>${r.b}</b>.${r.i === 10 ? ' (The slide shows 4.)' : ''}` }; }),
      { cap: 'Charging <b>$3</b> per APPEND is enough to pay for every cost in the sequence: the bank drops to 3 right after each doubling, but <b>never below 0</b>. So the sum of the amortized costs, 3n, is an upper bound on the true cost: O(1) per insertion.' }
    ];
    const [i, ctl] = useSteps(steps.length, 1800);
    const k = Math.min(i, N), cur = k ? rows[k - 1] : null;
    return Fig(html`<${DynArr} i=${k} />
      <div className="a8-coins" aria-label=${'bank balance ' + (cur ? cur.b : 0)}>bank ${cur ? Array.from({ length: cur.b }, (_, j) => html`<i key=${j}>$</i>`) : html`<span>$0</span>`} ${cur ? html`<b style=${{ color: 'var(--ink)' }}>= $${cur.b}</b>` : null}</div>
      <table className="a8-tb"><thead><tr><th>i</th><th>s<sub>i</sub></th><th>c<sub>i</sub></th><th>ĉ<sub>i</sub></th><th>b<sub>i</sub></th></tr></thead>
      <tbody>${rows.map(r => html`<tr key=${r.i} className=${(r.i === k && i <= N ? 'cur ' : '') + (pow2(r.i - 1) && r.i > 1 ? 'exp' : '')} style=${{ visibility: r.i <= k ? 'visible' : 'hidden' }}><td>${r.i}</td><td>${r.s}</td><td className="c">${r.c}</td><td>3</td><td>${r.b}</td></tr>`)}</tbody></table>`,
      steps[i].cap, html`<${Nav} n=${steps.length} i=${i} ctl=${ctl} />`, 'Accounting method: bank balance per insertion');
  }

  /* ── slides 27-28: potential method, the two cases ── */
  function Potential() {
    const L = [
      ['h', 'Potential function'], ['', 'Φ(h<sub>i</sub>) = 2i − size<sub>i</sub>'], ['', 'ĉ<sub>i</sub> = c<sub>i</sub> + Φ(h<sub>i</sub>) − Φ(h<sub>i−1</sub>)'],
      ['h', 'Case 1: normal insert, no expansion'], ['', 'ĉ<sub>i</sub> = 1 + (2i − size) − (2(i−1) − size)'], ['', '= 1 + 2i − size − 2i + 2 + size'], ['r', '= 3'],
      ['h', 'Case 2: expansion (i items fill the table, size i → 2i)'], ['', 'ĉ = (i+1) + Φ(2(i+1) − 2i) − Φ(2i − i)'], ['', '= (i+1) + 2 − i'], ['r', '= 3']
    ];
    const groups = [[0, 2], [3, 4], [5, 5], [6, 6], [7, 8], [9, 9], [10, 10]];
    const caps = [
      'Potential method: the accounting and potential methods are closely related. The potential of the dynamic array is <b>Φ(h) = 2i − size</b>, and the amortized cost of the i-th insertion is its true cost plus the change in potential.',
      '<b>Case 1</b>, insert normally with no array expansion: the true cost is 1 and the size does not change.',
      'Expand both potentials: the 2i and the size cancel.',
      'So a normal insertion has amortized cost <b>ĉ<sub>i</sub> = 3</b>.',
      '<b>Case 2</b>, expansion: the table holds i items and is full, so inserting item i+1 copies i items and writes 1: true cost i + 1. After it, 2(i+1) − 2i = 2; before it, 2i − i = i.',
      'Substitute: (i + 1) + 2 − i. (The slide writes Φ(2i − 2i) − Φ(2(i−1) − i): each term is off by 2 and the two slips cancel.)',
      'The i terms cancel: an expansion also has amortized cost <b>ĉ = 3</b>. Every insertion is O(1) amortized.'
    ];
    const [i, ctl] = useSteps(groups.length, 2400);
    const last = groups[i][1], cur = groups[i];
    return Fig(html`<div className="a8-der">${L.map((l, j) => html`<div key=${j} className=${pop(j <= last) + (l[0] ? ' ' + l[0] : '') + (j >= cur[0] && j <= cur[1] && l[0] !== 'h' ? ' cur' : '')} dangerouslySetInnerHTML=${{ __html: l[1] }}></div>`)}</div>`,
      caps[i], html`<${Bar} steps=${groups} i=${i} ctl=${ctl} />`, 'Potential method derivation');
  }

  /* ── slide 29: potential method table ── */
  function PotTable() {
    const N = 17, rows = []; let pp = 0;
    for (let i = 1; i <= N; i++) { const s = sizeOf(i), copy = pow2(i - 1) ? i - 1 : 0, c = 1 + copy, ph = 2 * i - s; rows.push({ i, s, copy, c, ph, pp, a: c + ph - pp }); pp = ph; }
    const steps = [{ cap: 'Slide 29 tabulates the potential method for 17 insertions: true cost C<sub>i</sub> = 1 + cost of doubling and copying, Φ<sub>i</sub> = 2i − size<sub>i</sub> (with Φ<sub>0</sub> = 0), and amortized cost C<sub>i</sub> + Φ<sub>i</sub> − Φ<sub>i−1</sub>.' },
      ...rows.map(r => ({ cap: `i = ${r.i}: size ${r.s}${r.copy ? `, the table doubled and ${r.copy} item${r.copy > 1 ? 's were' : ' was'} copied` : ''}, C<sub>${r.i}</sub> = ${r.c}. Φ<sub>${r.i}</sub> = 2 × ${r.i} − ${r.s} = ${r.ph}. Amortized = ${r.c} + (${r.ph} − ${r.pp}) = <b>${r.a}</b>.` })),
      { cap: 'Every amortized cost is 3, except the very first insertion (2, because Φ<sub>0</sub> = 0). The big copying costs 2, 3, 5, 9, 17 are paid by the potential that built up: Φ drops from 8 to 2 at i = 9 and from 16 to 2 at i = 17.' }];
    const [i, ctl] = useSteps(steps.length, 1300);
    const k = Math.min(i, N);
    return Fig(html`<table className="a8-tb"><thead><tr><th>i</th><th>size</th><th>copy</th><th>C<sub>i</sub></th><th>Φ<sub>i</sub></th><th>C<sub>i</sub> + ΔΦ</th></tr></thead>
      <tbody>${rows.map(r => html`<tr key=${r.i} className=${(r.i === k && i <= N ? 'cur ' : '') + (r.copy ? 'exp' : '')} style=${{ visibility: r.i <= k ? 'visible' : 'hidden' }}><td>${r.i}</td><td>${r.s}</td><td>${r.copy}</td><td className="c">${r.c}</td><td>${r.ph}</td><td><b>${r.a}</b></td></tr>`)}</tbody></table>`,
      steps[i].cap, html`<${Nav} n=${steps.length} i=${i} ctl=${ctl} />`, 'Potential method table for 17 insertions');
  }

  /* ── slides 31-37: separate chaining ── */
  function Chains({ rows, on }) {
    return html`<div className="a8-ch">${rows.map((r, j) => html`<div className="a8-cr" key=${j}><span className=${'a8-ix' + (on === j ? ' on' : '')}>${r[0]}</span>${r[1].map((e, q) => html`<${React.Fragment} key=${q}><span className="a8-ar">→</span><span className=${'a8-nd ' + (r[2] && r[2][q] || '')}>${H(e)}</span></${React.Fragment}>`)}${r[1].length ? html`<span className="a8-ar">→</span><span className="a8-nil">nil</span>` : html`<span className="a8-nil">nil</span>`}</div>`)}</div>`;
  }
  function Chaining() {
    const E = s => `e<sub>${s}</sub>`;
    const steps = [
      { rows: [['0', []], ['i', [E(1), E(2)]], ['m−1', []]], on: 1, lf: '', cap: 'Separate chaining (open hashing): hash(k<sub>1</sub>) = i = hash(k<sub>2</sub>) for two distinct keys. The simplest fix: arrange e<sub>1</sub> and e<sub>2</sub> into a <b>chain</b> (a linked list) and store the list in A[i].' },
      { rows: [['0', [E('b')]], ['1', [E('j')]], ['2', [E('n')]]], lf: 'n = 3, m = 3 ⇒ α = 3/3 = 1', cap: 'Under <b>simple uniform hashing</b> each key is equally likely to hash to any slot. With n = 3 keys in m = 3 slots the expected chain length is 1.' },
      { rows: [['0', [E('a'), E('b')]], ['1', [E('k'), E('j')]], ['2', [E('x'), E('n')]]], lf: 'n = 6, m = 3 ⇒ α = 6/3 = 2', cap: 'With n = 6 and m = 3 the expected length of any chain is 2. This number <b>α = n/m</b> is called the <b>load factor</b> of the hash table.' },
      { rows: [['0', [E('a'), E('b'), E('c')]], ['1', [E('k'), E('j'), E('d')]], ['2', [E('x'), E('e'), E('w')], ['on', 'on', 'ok']]], on: 2, lf: 'search: O(1) + O(α) = O(1 + α)', cap: 'Searching for e<sub>w</sub>: hash(key(e<sub>w</sub>)) = 2 costs O(1), then walk the chain, whose expected length is α (3 here). Expected time to search = <b>O(1 + α)</b>.' },
      { rows: [['0', [E('a'), E('b'), E('c')]], ['1', [E('k'), E('j'), E('d')]], ['2', [E('x'), E('e'), E('w')], ['on', 'on', 'bad']]], on: 2, lf: 'delete: O(1 + α)', cap: 'Deleting e<sub>w</sub>: first search for it, O(1 + α), then unlink it from the chain. Expected time to delete = <b>O(1 + α)</b>.' },
      { rows: [['0', [E('a'), E('b'), E('c')]], ['1', [E('k'), E('j'), E('d')]], ['2', [E('w'), E('x'), E('e')], ['ok']]], on: 2, lf: 'insert: 1 + 1 ⇒ O(1)', cap: 'Inserting e<sub>w</sub>: hash it (1) and link it at the front of chain 2 (1). Expected time to insert = 1 + 1 = <b>O(1)</b>.' },
      { rows: [['0', []], ['i', [E(1), E(2), E(3), '…', E('n−1'), E('n')]], ['m−1', []]], on: 1, lf: 'chain length = n ⇒ O(1 + n) = O(n)', cap: '<b>Worst case</b>: all n elements are stored in one chain, so the chain length is n. Expected time to search = O(1 + n) = <b>O(n)</b>, and the same for delete.' }
    ];
    const [i, ctl] = useSteps(steps.length, 2500);
    const s = steps[i];
    return Fig(html`<${Chains} rows=${s.rows.map(r => [r[0], r[1], r[2]])} on=${s.on} /><div className="a8-lf">${s.lf ? H(s.lf.replace('α', '<b>α</b>')) : ' '}</div>`,
      s.cap, html`<${Bar} steps=${steps} i=${i} ctl=${ctl} />`, 'Separate chaining');
  }

  /* ── tree drawing ── */
  const N_ = (v, l, r) => ({ v, l, r });
  function bstFrom(keys) { let root = null; const ins = (n, k) => { if (!n) return N_(k); if (k < n.v) n.l = ins(n.l, k); else n.r = ins(n.r, k); return n; }; keys.forEach(k => { root = ins(root, k); }); return root; }
  function layout(root, x0, x1, y0, dy) {
    const ns = [], es = []; let cnt = 0;
    const walk = (n, d) => { if (!n) return; walk(n.l, d + 1); n._r = cnt++; n._d = d; walk(n.r, d + 1); };
    walk(root, 0); const w = (x1 - x0) / Math.max(1, cnt);
    const put = (n, p) => { if (!n) return; const me = { x: x0 + w * (n._r + .5), y: y0 + n._d * dy, n }; ns.push(me); if (p) es.push([p.x, p.y, me.x, me.y]); put(n.l, me); put(n.r, me); };
    put(root, null); return { ns, es };
  }
  const label = v => { const s = String(v); const m = /^e(\d+|n)$/.exec(s); return m ? html`<tspan>e</tspan><tspan fontSize="13" dy="4">${m[1]}</tspan>` : s; };
  function TreeG({ L, r, cls }) {
    return html`<g>${L.es.map((q, j) => html`<line key=${'e' + j} className="ed" x1=${q[0]} y1=${q[1]} x2=${q[2]} y2=${q[3]} />`)}
      ${L.ns.map((q, j) => html`<g key=${'n' + j}><circle className=${'nd ' + ((cls && cls(q.n)) || '')} cx=${q.x} cy=${q.y} r=${r} /><text x=${q.x} y=${q.y + 6} textAnchor="middle" fontSize="17">${label(q.n.v)}</text></g>`)}</g>`;
  }

  /* ── slides 38-43: a BST in every slot ── */
  function BstChains() {
    const cells = ['0', '1', '2', '3', '4', '5', '…', 'm−1'], cw = 45;
    const cx = c => c * cw + cw / 2;
    const T42 = [N_('e1', N_('e2', N_('e4'))), N_('e3', null, N_('e5', null, N_('en'))), N_('e6', N_('e7', N_('e8')))];
    const T43 = [N_('e1', N_('e2', N_('e3'), N_('e4')), N_('e5')), N_('e6', N_('e7', null, N_('e10')), N_('e8', N_('e9'))), N_('e11', N_('e12'), N_('e13', N_('e14'), N_('en')))];
    const steps = [
      { seq: '', cap: 'Extended technique: instead of a linked list, each index of the hash table holds a <b>binary search tree</b>, which grows as the data grows. Slot 1 holds 50, 30, 80, 10, 40 and slot 5 holds 55, 35, 85, 45.',
        trees: [[1, bstFrom([50, 30, 80, 10, 40]), 0, 180], [5, bstFrom([55, 35, 85, 45]), 180, 360]] },
      { seq: '', cap: '<b>Worst case</b>: all n keys collide and hash to the same index, so one tree holds all of them.', trees: [[0, bstFrom([50, 30, 80, 10, 40]), 0, 240]] },
      { seq: 'insert: 10, 20, 30, 40, …, eₙ', cap: 'Worst case, <b>case 1</b>: the keys come in sorted order, so the tree grows only to one side (right for increasing keys, left for decreasing). It is a chain of n elements: <b>O(n)</b>.', trees: [[0, bstFrom([10, 20, 30, 40, 50]), 0, 300]], last: 'en' },
      { seq: 'insert: 50, 30, 10, 40, …, eₙ', cap: 'Worst case, <b>case 2</b>: the keys come in no sorted order and the tree height stays minimum: <b>O(log n)</b>.', trees: [[0, bstFrom([50, 30, 10, 40]), 0, 300]] },
      { seq: '', cap: '<b>Best case</b>: the keys are equally distributed over all m slots, so each BST holds about n/m elements. Case 1, they arrive sorted: each tree is skewed, height n/m: <b>O(n/m)</b> = O(n / table size).', trees: T42.map((t, j) => [[0, 1, 7][j], t, [18, 130, 242][j], [118, 230, 342][j]]) },
      { seq: '', cap: 'Best case, <b>case 2</b>: the keys are not in sorted order and each tree has minimum height, so search costs the log of the expected number of nodes per tree: <b>O(log(n/m))</b>.', trees: T43.map((t, j) => [[0, 1, 7][j], t, [18, 130, 242][j], [118, 230, 342][j]]) }
    ];
    const [i, ctl] = useSteps(steps.length, 2600);
    const s = steps[i], small = i >= 4;
    const Ls = s.trees.map(t => { const L = layout(t[1], t[2], t[3], 92, small ? 50 : 46); return { c: t[0], L }; });
    if (s.last) { const L = Ls[0].L; L.ns[L.ns.length - 1].n = { v: 'en' }; }
    const H_ = Math.max(...Ls.map(o => Math.max(...o.L.ns.map(q => q.y)))) + 30;
    return Fig(html`<div className="a8-note">${s.seq || ' '}</div><svg viewBox=${`0 0 360 ${H_}`} role="img" aria-label="Hash table whose slots hold binary search trees">
      ${cells.map((c, j) => html`<g key=${j}><rect className=${'cell' + (Ls.some(o => o.c === j) ? ' on' : '')} x=${j * cw} y="8" width=${cw} height="30" /><text className=${Ls.some(o => o.c === j) ? 'on' : ''} x=${cx(j)} y="29" textAnchor="middle" fontSize="16">${c}</text></g>`)}
      ${Ls.map((o, j) => html`<line key=${'a' + j} className="ed" x1=${cx(o.c)} y1="38" x2=${o.L.ns[0].x} y2=${o.L.ns[0].y - 18} markerEnd="url(#a8-arr)" />`)}
      <defs><marker id="a8-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--graphite)" /></marker></defs>
      ${Ls.map((o, j) => html`<${TreeG} key=${j} L=${o.L} r=${small ? 17 : 18} />`)}</svg>`,
      s.cap, html`<${Bar} steps=${steps} i=${i} ctl=${ctl} />`, 'BST chains');
  }

  /* ── slides 44-46: AVL tree in a slot ── */
  function Avl() {
    const big = N_(40, N_(20, N_(10), N_(30)), N_(60, N_(50), N_(70, null, N_(80))));
    const ht = n => n ? 1 + Math.max(ht(n.l), ht(n.r)) : 0;
    const steps = [
      { t: big, cap: 'Separate chaining with a plain BST is good except worst-case case 1, the skewed tree. Fix it with an <b>AVL tree</b>: a self-balancing BST where the heights of the left and right subtrees differ by at most one, for every node. BalanceFactor = height(left subtree) − height(right subtree).' },
      { t: big, at: 40, cap: `At the root 40: the left subtree (20, 10, 30) has height ${ht(big.l)} and the right subtree (60, 50, 70, 80) has height ${ht(big.r)}, so |${ht(big.l)} − ${ht(big.r)}| = 1: balanced.` },
      { t: big, at: 70, cap: 'At 70: the left subtree is empty (height 0) and the right subtree is 80 (height 1): |0 − 1| = 1, balanced. Every node passes, so this is an AVL tree.' },
      { t: N_(20, null, N_(30)), cap: 'Insert into one slot of the table: 20, then 30 goes to its right.', slot: true },
      { t: N_(20, null, N_(30, null, N_(40))), bad: 20, cap: 'Insert 40: it goes right of 30. Now node 20 has left height 0 and right height 2: |0 − 2| = 2, an <b>unbalanced tree</b>.', slot: true },
      { t: N_(30, N_(20), N_(40)), ok: 30, cap: 'A rotation makes 30 the root with children 20 and 40: a <b>balanced tree</b>. With an AVL tree all the operations cost <b>O(log n)</b>, n = number of elements.', slot: true }
    ];
    const [i, ctl] = useSteps(steps.length, 2600);
    const s = steps[i], L = layout(s.t, s.slot ? 90 : 20, s.slot ? 270 : 340, s.slot ? 40 : 34, s.slot ? 56 : 54);
    const find = v => L.ns.find(q => q.n.v === v);
    const halo = [];
    if (s.at === 40) { const l = L.ns.filter(q => [20, 10, 30].includes(q.n.v)), r = L.ns.filter(q => [60, 50, 70, 80].includes(q.n.v)); halo.push(['halo', l, 'height ' + ht(big.l)], ['halo2', r, 'height ' + ht(big.r)]); }
    if (s.at === 70) halo.push(['halo2', [find(80)], 'height 1']);
    const box = (cls, qs, t, j) => { const xs = qs.map(q => q.x), ys = qs.map(q => q.y), x0 = Math.min(...xs) - 26, x1 = Math.max(...xs) + 26, y0 = Math.min(...ys) - 26, y1 = Math.max(...ys) + 26; return html`<g key=${'h' + j}><rect className=${cls} x=${x0} y=${y0} width=${x1 - x0} height=${y1 - y0} rx="14" /><text x=${(x0 + x1) / 2} y=${y1 + 20} textAnchor="middle" fontSize="16" className="muted">${t}</text></g>`; };
    const Hh = Math.max(...L.ns.map(q => q.y)) + (halo.length ? 52 : 30);
    return Fig(html`<svg viewBox=${`0 0 360 ${Math.max(Hh, 230)}`} role="img" aria-label="AVL tree">
      ${halo.map((h, j) => box(h[0], h[1], h[2], j))}
      <${TreeG} L=${L} r=${19} cls=${n => n.v === s.bad ? 'bad' : n.v === s.ok ? 'ok' : (n.v === s.at ? 'hl' : '')} />
      ${s.at === 70 ? html`<text x=${find(70).x - 40} y=${find(70).y + 40} textAnchor="middle" fontSize="16" className="muted">0</text>` : null}
      ${s.bad ? html`<text x=${find(20).x - 30} y=${find(20).y - 26} textAnchor="middle" fontSize="16" fill="var(--pen)" style=${{ fill: 'var(--pen)' }}>Unbalanced</text>` : null}
      ${s.ok ? html`<text x=${find(30).x} y=${find(30).y - 26} textAnchor="middle" fontSize="16" style=${{ fill: 'var(--ok)' }}>Balanced</text>` : null}</svg>`,
      s.cap, html`<${Bar} steps=${steps} i=${i} ctl=${ctl} />`, 'AVL balance');
  }

  /* ── slides 47-48: rehashing a chained table ── */
  function Rehash() {
    const steps = [
      { rows: [['0', ['12']], ['1', ['10', '7']], ['2', ['14', '5']]], lf: 'load factor = 5/3 = 1.67 ≤ 2', cap: 'As long as the load factor does not get too large, the average time stays O(1). Here the threshold value is <b>2</b>. The table has m = 3 chains holding 12, 10, 7, 14, 5.' },
      { rows: [['0', ['12']], ['1', ['10', '7']], ['2', ['14', '5', '11'], [0, 0, 'ok']]], on: 2, lf: 'load factor = 6/3 = 2, not > 2', cap: 'For every new entry, check the load factor. Insert 11: 11 mod 3 = 2, append it to chain 2. 6/3 = 2 is not greater than the threshold.' },
      { rows: [['0', ['12']], ['1', ['10', '7', '22'], [0, 0, 'ok']], ['2', ['14', '5', '11']]], on: 1, lf: 'load factor = 7/3 = 2.33 > threshold ⇒ rehash', cap: 'Insert 22: 22 mod 3 = 1. Now the load factor is 7/3 = <b>2.33 &gt; 2</b>, so start rehashing.' },
      { rows: [['0', ['12']], ['1', ['7']], ['2', ['14']], ['3', []], ['4', ['10', '22']], ['5', ['11', '5']]], lf: 'load factor = 7/6 = 1.17 ≤ 2', cap: 'Rehash: initialize a new array of double size (m = 6), hash every key again with the new function k mod 6 (12 → 0, 7 → 1, 14 → 2, 10 and 22 → 4, 11 and 5 → 5) and make it the new bucket array. Load factor 7/6 = 1.17. (The slide shows 1.67.)' }
    ];
    const [i, ctl] = useSteps(steps.length, 2600);
    const s = steps[i];
    return Fig(html`<div className="a8-note">threshold value = 2 · insert 11, 22</div><${Chains} rows=${s.rows.map(r => [r[0], r[1], r[2] ? r[2].map(x => x || '') : null])} on=${s.on} /><div className="a8-lf">${H(s.lf)}</div>`,
      s.cap, html`<${Bar} steps=${steps} i=${i} ctl=${ctl} />`, 'Rehashing');
  }

  /* ── open addressing engine (slides 52-54: HASH-INSERT, HASH-SEARCH, delete with a Deleted marker) ── */
  const slotOf = (mode, k, i, m, R) => mode === 'linear' ? (k + i) % m : mode === 'quad' ? (k + i * i) % m : (k % m + i * (R - k % R)) % m;
  const fx = (mode, k, i, m, R) => mode === 'linear' ? `(${k} + ${i}) mod ${m}` : mode === 'quad' ? `(${k} + ${i}·${i}) mod ${m}` : `(${k % m} + ${i}·${R - k % R}) mod ${m}`;
  const genF = (mode, k, m, R) => mode === 'linear' ? `h<sub>i</sub>(${k}) = (${k} + i) mod ${m}` : mode === 'quad' ? `h<sub>i</sub>(${k}) = (${k} + i·i) mod ${m}` : `h<sub>2</sub>(${k}) = ${R} − (${k} mod ${R}) = ${R - k % R}; h<sub>i</sub>(${k}) = (${k} mod ${m} + i·${R - k % R}) mod ${m}`;
  function runProbe(mode, m, R, ops) {
    let T = Array(m).fill(null); const out = [];
    for (const op of ops) {
      const k = op.k, P = []; let res, Tv;
      if (op.t === 'ins') {
        let done = false;
        for (let i = 0; i < m; i++) { const j = slotOf(mode, k, i, m, R); if (T[j] === null || T[j] === DEL) { P.push({ i, j, r: T[j] === DEL ? 'insd' : 'ins' }); T[j] = k; done = true; break; } P.push({ i, j, r: 'col' }); }
        res = done ? 'ok' : 'fail'; Tv = T.slice();
      } else {
        let S = T; if (op.t === 'naive') { S = T.slice(); const p = S.indexOf(op.del); if (p >= 0) S[p] = null; }
        let found = -1;
        for (let i = 0; i < m; i++) { const j = slotOf(mode, k, i, m, R); if (S[j] === k) { P.push({ i, j, r: 'hit' }); found = j; break; } if (S[j] === null) { P.push({ i, j, r: 'empty' }); break; } P.push({ i, j, r: S[j] === DEL ? 'skipd' : 'neq' }); }
        if (op.t === 'del' && found >= 0) T[found] = DEL;
        res = found >= 0 ? 'found' : 'miss'; Tv = op.t === 'naive' ? S : T.slice();
      }
      out.push({ op, P, res, T: Tv });
    }
    return out;
  }
  const ST = { col: ['Collision', 'bad'], ins: ['Insertion', 'ok'], insd: ['Insertion (reuses Deleted)', 'ok'], hit: ['Found', 'ok'], empty: ['Empty: stop', 'bad'], neq: ['≠ key', 'bad'], skipd: ['Deleted: go on', ''] };
  const OPN = { ins: 'Insert', srch: 'Search', del: 'Delete', naive: 'Search' };
  function describe(mode, m, R, s) {
    const { op, P, res } = s, k = op.k;
    const ln = p => `h<sub>${p.i}</sub>(${k}) = ${fx(mode, k, p.i, m, R)} = ${p.j}`;
    const why = { col: 'is taken (collision)', ins: 'is empty', insd: 'is marked Deleted, which Insert treats as empty', hit: 'holds ' + k + ': found', empty: 'is empty, which breaks the search', neq: 'holds ' + (s.T[P[0] && P[0].j]) + ', not ' + k, skipd: 'is marked Deleted, so the search does not stop' };
    let txt;
    if (P.length <= 4) txt = P.map(p => `${ln(p)} ${p.r === 'neq' ? 'holds ' + s.T[p.j] + ', not matching' : why[p.r]}`).join('; ');
    else { const last = P[P.length - 1]; txt = `the probes visit slots ${P.map(p => p.j).join(', ')}${res === 'fail' ? ', all occupied' : `; ${ln(last)} ${why[last.r]}`}`; }
    let head;
    if (op.t === 'ins') head = res === 'ok' ? `Insert (${k}): ` : `Insert (${k}): `;
    else if (op.t === 'naive') head = `If Delete (${op.del}) just emptied its slot, Search (${k}): `;
    else head = `${OPN[op.t]} (${k}): `;
    let tail = '';
    if (op.t === 'ins') tail = res === 'ok' ? `. Insert ${k} in slot ${P[P.length - 1].j}.` : `. <b>Unable to insert ${k}</b>: the index calculated is never empty.`;
    else if (op.t === 'naive') tail = res === 'miss' ? `. <b>Search (${k}) fails</b> although ${k} is in the table: an empty slot means stop.` : '.';
    else if (op.t === 'del') tail = res === 'found' ? `. Replace it with the special flag <b>Deleted</b>, which Insert treats as empty but Search does not.` : `. ${k} is not in the table.`;
    else tail = res === 'found' ? '.' : `. ${k} is not found.`;
    return head + txt + tail;
  }
  function marksOf(mode, m, R, s) {
    const M = {};
    s.P.forEach(p => { const st = ST[p.r]; const o = M[p.j] || (M[p.j] = { labs: [], st: '', cls: '' }); o.labs.push(`h<sub>${p.i}</sub>(${s.op.k})`); o.st = st[0]; o.cls = st[1]; });
    return M;
  }
  function ProbeLines({ mode, m, R, s }) {
    const { op, P } = s, k = op.k;
    return html`<div className="a8-pl"><div className="op">${op.t === 'naive' ? `Delete (${op.del}) by emptying the slot, then Search (${k})` : `${OPN[op.t]} (${k})`}</div>
      <div className="gen">${H(genF(mode, k, m, R))}</div>
      ${P.length <= 5 ? P.map((p, j) => html`<div className="ln" key=${j}><span>${H(`h<sub>${p.i}</sub>(${k}) = ${fx(mode, k, p.i, m, R)} = <b>${p.j}</b>`)}</span><span className=${'a8-' + (ST[p.r][1] || 'cnt')}>${ST[p.r][0]}</span></div>`)
        : html`<div className="a8-chips">${P.map((p, j) => html`<span key=${j} className=${ST[p.r][1]}>${H(`i=${p.i} → ${p.j}`)}</span>`)}</div>`}
      ${s.res === 'fail' ? html`<div className="a8-bad">Unable to insert ${k}</div>` : null}</div>`;
  }
  function parseOps(txt, maxOps) {
    const tok = String(txt).split(/[\s,]+/).filter(Boolean);
    if (!tok.length) return { err: 'Type at least one key.' };
    if (tok.length > maxOps) return { err: `At most ${maxOps} operations.` };
    const ops = [];
    for (const t of tok) { const m = /^([sd]?)(\d{1,3})$/i.exec(t); if (!m) return { err: `"${t}" is not understood: use a key (0 to 999), s<key> to search, d<key> to delete.` }; ops.push({ t: m[1] ? (m[1].toLowerCase() === 's' ? 'srch' : 'del') : 'ins', k: +m[2] }); }
    return { ops };
  }
  const isPrime = x => { if (!Number.isInteger(x) || x < 2) return false; for (let d = 2; d * d <= x; d++) if (x % d === 0) return false; return true; };
  function ProbeSim({ cfg }) {
    const [mode, setMode] = useState('slide'), [txt, setTxt] = useState(cfg.own), [mt, setMt] = useState(String(cfg.m)), [rt, setRt] = useState(String(cfg.R || 7));
    const good = useRef({ m: cfg.m, R: cfg.R, ops: cfg.ops });
    let err = '';
    if (mode === 'own') {
      const p = parseOps(txt, 12), m = +mt, R = +rt;
      if (p.err) err = p.err; else if (!(Number.isInteger(m) && m >= 2 && m <= 13)) err = 'Table size m must be 2 to 13.';
      else if (cfg.mode === 'double' && !(isPrime(R) && R < m)) err = 'R must be a prime smaller than m.';
      else good.current = { m, R: cfg.mode === 'double' ? R : 0, ops: p.ops };
    }
    const S = mode === 'slide' ? { m: cfg.m, R: cfg.R, ops: cfg.ops } : good.current;
    const run = useMemo(() => runProbe(cfg.mode, S.m, S.R, S.ops), [JSON.stringify(S)]);
    const n = run.length + 1, sig = JSON.stringify([mode, S]);
    const [i, ctl] = useRun(n, 2300, sig);
    const s = i > 0 ? run[i - 1] : null;
    const T = s ? s.T : Array(S.m).fill(null);
    let cap = i === 0 ? (mode === 'slide' ? cfg.intro : `Your sequence in a table of size ${S.m}${cfg.mode === 'double' ? `, h<sub>2</sub>(k) = ${S.R} − (k mod ${S.R})` : ''}. Press Next to follow each operation.`) : describe(cfg.mode, S.m, S.R, s);
    if (mode === 'slide' && i > 0 && cfg.note && cfg.note[i]) cap += ' ' + cfg.note[i];
    if (mode === 'slide' && i > 0 && cfg.sl) cap += ` (slide ${cfg.sl[i - 1]})`;
    return Fig(html`<${Tabs} opts=${[['slide', 'Example from the slides'], ['own', 'Try your own']]} v=${mode} set=${setMode} />
      ${mode === 'own' ? html`<div className="a8-form"><label>Operations <input className="w" value=${txt} onInput=${e => setTxt(e.target.value)} aria-label="Operations" /></label><label>m <input className="n" type="number" min="2" max="13" value=${mt} onInput=${e => setMt(e.target.value)} aria-label="Table size m" /></label>${cfg.mode === 'double' ? html`<label>R <input className="n" type="number" value=${rt} onInput=${e => setRt(e.target.value)} aria-label="Prime R" /></label>` : null}</div>
        <div className="a8-help">A key inserts it; s18 searches for 18; d18 deletes 18 (marks it Deleted).</div>${err ? html`<div className="a8-err">${err}</div>` : null}` : null}
      <div className="a8-pw">${s ? html`<${ProbeLines} mode=${cfg.mode} m=${S.m} R=${S.R} s=${s} />` : html`<div className="a8-pl"><div className="op">${cfg.title}</div><div className="gen">${H(cfg.gen(S))}</div></div>`}
        <div><${HT} T=${T} marks=${s ? marksOf(cfg.mode, S.m, S.R, s) : {}} /><${Legend} /></div></div>`,
      cap, html`<${Nav} n=${n} i=${i} ctl=${ctl} />`, cfg.title);
  }
  const ins = ks => ks.map(k => ({ t: 'ins', k }));
  const LIN = { mode: 'linear', m: 11, title: 'Linear probing, key mod 11', gen: S => `h(k, i) = (h′(k) + i) mod ${S.m}`,
    ops: [...ins([7, 36, 18, 62]), { t: 'srch', k: 18 }, { t: 'naive', del: 18, k: 62 }, { t: 'del', k: 18 }, { t: 'srch', k: 62 }, { t: 'ins', k: 51 }], own: '7 36 18 62 s18 d18 s62 51',
    sl: [58, 58, 59, 60, 61, 62, 63, 63, 64],
    intro: '<b>Linear probing</b>: h(k, i) = (h′(k) + f(i)) mod m with f(i) = i. When a collision occurs, probe the next bucket, and keep probing until an empty bucket is found. Hash function key mod 11, keys 7, 36, 18, 62.',
    note: { 9: 'Insert can reuse a Deleted slot. Worst-case search in linear probing is O(table size): Deleted markers can make a search scan the whole table.' } };
  const QUAD = { mode: 'quad', m: 11, title: 'Quadratic probing, key mod 11', gen: S => `h(k, i) = (h′(k) + i·i) mod ${S.m}`, ops: ins([7, 36, 18, 62, 51]), own: '7 36 18 62 51', sl: [69, 69, 70, 71, 72],
    intro: '<b>Quadratic probing</b>: when a collision occurs, probe the i<sup>2</sup>-th bucket in the i-th iteration: h(k, i) = (h′(k) + i·i) mod m. Same hash function key mod 11 and keys 7, 36, 18, 62, 51.' };
  const SEC = { mode: 'quad', m: 10, title: 'Secondary clustering, key mod 10', gen: S => `h(k, i) = (k + i·i) mod ${S.m}`, ops: ins([2, 12, 22, 32, 42, 52, 62]), own: '2 12 22 32 42 52 62', sl: [75, 75, 76, 77, 77, 77, 78],
    intro: 'Secondary clustering example: hash function key mod 10, keys 2, 12, 22, 32, 42, 52 (then 62). They all have h(k, 0) = 2, so they all follow the <b>same probe sequence</b>.',
    note: { 7: 'All keys with the same first probe share one sequence: secondary clustering. So the table should be at most half full and its size must be prime, otherwise insertion may fail.' } };
  const DBL = { mode: 'double', m: 10, R: 7, title: 'Double hashing, key mod 10', gen: S => `h(k, i) = (hash1(k) + i·hash2(k)) mod ${S.m}, hash2(k) = ${S.R} − (k mod ${S.R})`, ops: ins([37, 90, 45, 22, 17, 49, 55]), own: '37 90 45 22 17 49 55', sl: [83, 83, 84, 84, 85, 86, 86],
    intro: '<b>Double hashing</b>: use a second hash function and look at slot i·hash2(k) in the i-th rotation: h(k, i) = (hash1(k) + i·hash2(k)) mod m. hash1 = key mod 10, hash2(k) = 7 − (k mod 7); 7 is a prime smaller than the table size, and hash2 never evaluates to 0.',
    note: { 7: 'Each (h1(k), h2(k)) pair gives its own probe sequence, so keys that collide once go different ways: no clustering.' } };
  const mkProbe = c => () => html`<${ProbeSim} cfg=${c} />`;

  /* ── slide 73: linear against quadratic on the same keys ── */
  function LinQuad() {
    const keys = [7, 36, 18, 62, 51];
    const A = runProbe('linear', 11, 0, ins(keys)), B = runProbe('quad', 11, 0, ins(keys));
    const steps = [{ cap: 'Insert 7, 36, 18, 62, 51 with key mod 11 into two tables: one with linear probing, one with quadratic probing.' },
      ...keys.map((k, j) => ({ cap: `Insert ${k}: linear probing visits ${A[j].P.map(p => p.j).join(', ')} (${A[j].P.length} probe${A[j].P.length > 1 ? 's' : ''}); quadratic probing visits ${B[j].P.map(p => p.j).join(', ')} (${B[j].P.length} probe${B[j].P.length > 1 ? 's' : ''}).` })),
      { cap: 'Linear probing builds one long run 7, 8, 9, 10 (<b>primary clustering</b>): every key that lands in it must walk to its end. Quadratic probing jumps away (62 to slot 0, 51 to slot 5), so it suffers a lesser clustering.' }];
    const [i, ctl] = useSteps(steps.length, 2000);
    const k = Math.min(i, keys.length);
    const tot = R => R.slice(0, k).reduce((a, s) => a + s.P.length, 0);
    const mk = R => { if (!k || i > keys.length) return {}; const M = {}; R[k - 1].P.forEach(p => { M[p.j] = { labs: [], st: '', cls: ST[p.r][1] }; }); return M; };
    return Fig(html`<div className="a8-two">${[['Linear probing', A], ['Quadratic probing', B]].map(([t, R], q) => html`<div key=${q}><h4>${t}</h4><${HT} T=${k ? R[k - 1].T : Array(11).fill(null)} marks=${mk(R)} narrow=${true} /><p>probes so far: ${tot(R)}</p></div>`)}</div>`,
      steps[i].cap, html`<${Bar} steps=${steps} i=${i} ctl=${ctl} />`, 'Linear probing against quadratic probing');
  }

  /* ── slide 90: expected number of probes 1/(1 − α) ── */
  function Probes() {
    const [a, setA] = useState(50);
    const X = x => 52 + x * 290, Y = y => 220 - y * 9.5;
    const pts = []; for (let x = 0; x <= 0.951; x += 0.01) pts.push(`${X(x).toFixed(1)},${Y(1 / (1 - x)).toFixed(1)}`);
    const al = a / 100, v = 1 / (1 - al);
    const cap = `With load factor α = n/m &lt; 1, the expected number of probes in an (unsuccessful) open-addressing search is at most <b>1/(1 − α)</b>. If α is constant, access takes constant time. Half full: 1/(1 − 0.5) = 2. 90% full: 1/(1 − 0.9) = 10. Now α = ${al.toFixed(2)}: 1/(1 − ${al.toFixed(2)}) = <b>${fmt(Math.round(v * 100) / 100)}</b> probes.`;
    return Fig(html`<svg viewBox="0 0 360 262" role="img" aria-label="Expected probes 1 over 1 minus alpha against the load factor">
      ${[0, 5, 10, 15, 20].map(y => html`<g key=${'y' + y}><line className="gr" x1=${X(0)} x2=${X(1)} y1=${Y(y)} y2=${Y(y)} /><text x=${X(0) - 8} y=${Y(y) + 6} textAnchor="end" fontSize="16">${y}</text></g>`)}
      ${[0, .5, .9, 1].map(x => html`<text key=${'x' + x} x=${X(x)} y="244" textAnchor="middle" fontSize="16">${x}</text>`)}
      <line className="ax" x1=${X(0)} y1=${Y(0)} x2=${X(1)} y2=${Y(0)} /><line className="ax" x1=${X(0)} y1=${Y(0)} x2=${X(0)} y2=${Y(21)} />
      <polyline className="cv" points=${pts.join(' ')} />
      <circle className="dot" cx=${X(.5)} cy=${Y(2)} r="5" /><text x=${X(.5)} y=${Y(2) - 12} textAnchor="middle" fontSize="16">2</text>
      <circle className="dot" cx=${X(.9)} cy=${Y(10)} r="5" /><text x=${X(.9) - 14} y=${Y(10) + 6} textAnchor="end" fontSize="16">10</text>
      <line x1=${X(al)} x2=${X(al)} y1=${Y(0)} y2=${Y(Math.min(v, 21))} stroke="var(--ok)" strokeWidth="2" strokeDasharray="5 4" />
      <circle cx=${X(al)} cy=${Y(Math.min(v, 21))} r="6" fill="var(--ok)" />
      <text x=${X(0) + 6} y=${Y(20) - 2} fontSize="16" className="muted">probes</text><text x=${X(1)} y="260" textAnchor="end" fontSize="16" className="muted">α</text></svg>
      <div className="a8-rng"><label htmlFor="a8-alpha">α = ${al.toFixed(2)}</label><input id="a8-alpha" type="range" min="0" max="95" step="5" value=${a} onInput=${e => setA(+e.target.value)} /></div>`,
      cap, null, 'Expected probes');
  }

  /* ── slide 93: average cache misses, chaining against linear probing ── */
  function Cache() {
    const X = x => 52 + x * 290, Y = y => 220 - (y - 1) * 58;
    const ch = [], lp = [];
    for (let x = 0; x <= 1.0001; x += .02) ch.push(`${X(x).toFixed(1)},${Y(2 + .9 * x).toFixed(1)}`);
    for (let x = 0; x <= .935; x += .01) { const y = 1 + .35 * x + .04 / Math.pow(1 - x, 1.5); if (y > 4.6) break; lp.push(`${X(x).toFixed(1)},${Y(y).toFixed(1)}`); }
    const steps = [
      'Slide 93 compares separate chaining and open addressing by the <b>average cache misses per lookup</b> as the load factor grows from 0 to 1.',
      '<b>Chaining</b>: every lookup follows pointers into the linked lists, so it starts near 2 misses and grows slowly with the load factor. Cache performance of chaining is not good.',
      '<b>Linear probing</b> stores everything in the table itself, so it starts near 1 miss and stays below chaining for most load factors (best cache performance).',
      'Near a full table (load factor around 0.8 to 0.9) the clusters get long and linear probing shoots up past chaining. Open addressing needs care with clustering and load factor; chaining is less sensitive to it.'
    ];
    const [i, ctl] = useSteps(steps.length, 2500);
    return Fig(html`<svg viewBox="0 0 360 262" role="img" aria-label="Average cache misses per lookup against load factor">
      ${[1, 2, 3, 4].map(y => html`<g key=${'y' + y}><line className="gr" x1=${X(0)} x2=${X(1)} y1=${Y(y)} y2=${Y(y)} /><text x=${X(0) - 8} y=${Y(y) + 6} textAnchor="end" fontSize="16">${y}</text></g>`)}
      ${[0, .2, .4, .6, .8, 1].map(x => html`<text key=${'x' + x} x=${X(x)} y="244" textAnchor="middle" fontSize="16">${x}</text>`)}
      <line className="ax" x1=${X(0)} y1=${Y(1)} x2=${X(1)} y2=${Y(1)} /><line className="ax" x1=${X(0)} y1=${Y(1)} x2=${X(0)} y2=${Y(4.6)} />
      <polyline className=${'cv ' + pop(i >= 1)} points=${ch.join(' ')} /><text className=${pop(i >= 1)} x=${X(.12)} y=${Y(2.55)} fontSize="16">Chaining</text>
      <polyline className=${'cv2 ' + pop(i >= 2)} points=${lp.join(' ')} /><text className=${pop(i >= 2)} x=${X(.3)} y=${Y(1.55)} fontSize="16">Linear probing</text>
      <text x=${X(1)} y="260" textAnchor="end" fontSize="16" className="muted">Load factor</text><text x=${X(0) + 6} y=${Y(4.6) + 4} fontSize="16" className="muted">cache misses</text></svg>`,
      steps[i], html`<${Bar} steps=${steps} i=${i} ctl=${ctl} />`, 'Cache misses');
  }

  window.FIGS = Object.assign(window.FIGS || {}, {
    'ag-8-direct': Direct, 'ag-8-mod-prime': ModPrime, 'ag-8-mult': Mult, 'ag-8-midsquare': MidSquare, 'ag-8-folding': Folding,
    'ag-8-aggregate': Aggregate, 'ag-8-accounting': Accounting, 'ag-8-potential': Potential, 'ag-8-potential-table': PotTable,
    'ag-8-chaining': Chaining, 'ag-8-bst-chains': BstChains, 'ag-8-avl': Avl, 'ag-8-rehash': Rehash,
    'ag-8-linear': mkProbe(LIN), 'ag-8-quadratic': mkProbe(QUAD), 'ag-8-lin-quad': LinQuad, 'ag-8-secondary': mkProbe(SEC), 'ag-8-double': mkProbe(DBL),
    'ag-8-probes': Probes, 'ag-8-cache': Cache
  });
})();
/* ── part L18 ── */
// Algorithms visuals, Lecture 18 (Shortest Paths I): path weight (slide 3), optimal substructure (5-7), triangle inequality (8-9),
// negative-weight cycle (10-11), Dijkstra on the slide graph (13-26), correctness lemmas and theorem (27-33), analysis (34-42),
// breadth-first search on the slide graph (43-59). Every label and number comes from the slides.
(function () {
  const { useState, useEffect, useRef, useMemo } = React;
  const { html, useSteps, Cap, Bar, pop, calm, useClock, useFit, sec } = window.FIGKIT;
  const CSS = `
.a18-n circle{ fill:var(--paper); stroke:var(--ink); stroke-width:1.6; transition:fill .4s, stroke .4s; }
.a18-n text{ font-weight:700; font-style:italic; }
.a18-n.on circle{ fill:var(--fig-s); stroke:var(--fig-s); } .fig svg .a18-n.on text{ fill:#fff; }
.a18-n.cur circle{ stroke:var(--fig-k); stroke-width:4.5; }
.a18-n.dim{ opacity:.35; }
.a18-e{ fill:none; stroke:var(--graphite); stroke-width:1.6; transition:stroke .4s, stroke-width .4s; }
.a18-e.hot{ stroke:var(--fig-k); stroke-width:3.4; }
.a18-e.try{ stroke:var(--ok); stroke-width:3; }
.a18-e.dash{ stroke-dasharray:6 6; }
.a18-w{ font-weight:600; }
.fig svg text.a18-k{ fill:var(--fig-k); font-weight:700; }
.fig svg text.a18-g{ fill:var(--graphite); }
.a18-blob{ fill:color-mix(in srgb, var(--fig-k) 18%, var(--paper)); stroke:var(--fig-k); stroke-width:1.5; }
.a18-panel{ max-width:520px; margin:10px auto 0; font-size:.9rem; color:var(--ink); }
.a18-q{ width:100%; border-collapse:collapse; font-size:.92rem; text-align:center; table-layout:fixed; }
.a18-q th{ font-style:italic; color:var(--graphite); font-weight:600; border-bottom:2px solid var(--fig-k); padding:2px 0; }
.a18-q td{ padding:2px 0; }
.a18-q td span{ display:inline-block; min-width:1.9em; padding:1px 3px; border-radius:4px; }
.a18-q td span.box{ background:color-mix(in srgb, var(--fig-k) 28%, var(--paper)); font-weight:700; }
.a18-q td span.new{ color:var(--fig-k); font-weight:700; }
.a18-q th:first-child, .a18-q td:first-child{ width:2.2em; }
.a18-s{ margin:6px 0 0; text-align:center; font-style:italic; }
.a18-code{ margin:10px auto 0; max-width:520px; font-family:var(--mono, ui-monospace, monospace); font-size:.76rem; line-height:1.45; border:1px solid var(--line); border-radius:8px; background:var(--paper); padding:6px 8px; color:var(--ink); }
.a18-code div{ white-space:pre-wrap; padding:0 4px; border-radius:4px; transition:background .3s; }
.a18-code div.on{ background:color-mix(in srgb, var(--fig-k) 22%, var(--paper)); }
.a18-code .c{ color:var(--graphite); font-family:var(--body); font-style:italic; }
.a18-code .v{ border-left:4px solid transparent; }
.a18-code .v.lv{ border-left-color:var(--fig-k); }
.a18-code .d2{ box-shadow:inset 4px 0 0 var(--ok); padding-left:10px; }
.a18-leg{ display:flex; flex-wrap:wrap; gap:6px 14px; justify-content:center; font-size:.85rem; margin:0 0 6px; }
.a18-leg i{ display:inline-block; width:12px; height:12px; border-radius:2px; margin-right:5px; vertical-align:-1px; }
.a18-chain{ max-width:520px; margin:8px auto 0; font-size:.92rem; color:var(--ink); }
.a18-chain > div{ display:flex; flex-wrap:wrap; gap:2px 10px; justify-content:space-between; padding:3px 6px; border-bottom:1px dashed var(--line); }
.a18-chain > div > span:last-child{ color:var(--graphite); font-style:italic; font-size:.85rem; }
.a18-chain .hd{ font-weight:700; color:var(--fig-k); border-bottom:0; }
.a18-chain .x{ font-weight:700; color:var(--fig-k); }
.a18-tbl{ width:100%; border-collapse:collapse; font-size:.82rem; text-align:center; margin-top:8px; }
.a18-tbl th{ border-bottom:2px solid var(--fig-k); font-weight:600; padding:3px 2px; }
.a18-tbl td{ padding:4px 2px; border-bottom:1px solid var(--line); }
.a18-tbl td:first-child{ font-weight:600; text-align:left; }
.a18-tbl sub, .a18-tm sub, .a18-tbl sup{ font-size:.92em; }
.a18-tbl small{ display:block; color:var(--graphite); font-size:.78rem; }
.a18-tm{ text-align:center; font-size:.92rem; margin:8px 0 0; }
.a18-bq{ display:flex; flex-wrap:wrap; justify-content:center; align-items:flex-end; gap:2px; margin-top:6px; font-size:1rem; }
.a18-bq > b{ font-style:italic; margin-right:6px; }
.a18-bq span{ display:inline-flex; flex-direction:column; align-items:center; min-width:1.5em; font-style:italic; transition:opacity .4s; }
.a18-bq span small{ font-style:normal; font-size:.8rem; color:var(--fig-k); font-weight:700; min-height:1.1em; }
.a18-bq span.out{ opacity:.35; } .a18-bq span.head{ font-weight:700; text-decoration:underline; text-decoration-color:var(--fig-k); text-decoration-thickness:2px; }
`;
  if (!document.getElementById('a18-css')) { const s = document.createElement('style'); s.id = 'a18-css'; s.textContent = CSS; document.head.appendChild(s); }

  // ── shared drawing helpers ──
  const Defs = () => html`<defs>
    <marker id="a18-ah" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="11" markerHeight="11" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style=${{ fill: 'var(--graphite)' }} /></marker>
    <marker id="a18-ahk" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="13" markerHeight="13" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style=${{ fill: 'var(--fig-k)' }} /></marker>
    <marker id="a18-aho" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="13" markerHeight="13" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style=${{ fill: 'var(--ok)' }} /></marker>
  </defs>`;
  const toward = (p, q, r) => { const dx = q.x - p.x, dy = q.y - p.y, L = Math.hypot(dx, dy) || 1; return { x: p.x + dx / L * r, y: p.y + dy / L * r }; };
  // a directed edge a→b, bent by `bend` to its left, with its weight label
  function Edge({ a, b, w, bend = 0, r = 18, cls = '', lab = 14, fs = 17 }) {
    const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    const c = { x: (a.x + b.x) / 2 + nx * bend, y: (a.y + b.y) / 2 + ny * bend };
    const s = toward(a, c, r), e = toward(b, c, r + 1);
    const d = bend ? `M${s.x},${s.y} Q${c.x},${c.y} ${e.x},${e.y}` : `M${s.x},${s.y} L${e.x},${e.y}`;
    const mx = .25 * s.x + .5 * c.x + .25 * e.x, my = .25 * s.y + .5 * c.y + .25 * e.y;
    const sg = bend < 0 ? -1 : 1, lx = mx + nx * lab * sg, ly = my + ny * lab * sg;
    const mk = /hot/.test(cls) ? 'a18-ahk' : /try/.test(cls) ? 'a18-aho' : 'a18-ah';
    return html`<g><path d=${d} className=${'a18-e ' + cls} markerEnd=${`url(#${mk})`} />${w != null && html`<text x=${lx} y=${ly + fs * .35} textAnchor="middle" fontSize=${fs} className="a18-w">${w}</text>`}</g>`;
  }
  const Node = ({ p, l, cls = '', r = 18, fs = 18 }) => html`<g className=${'a18-n ' + cls}><circle cx=${p.x} cy=${p.y} r=${r} /><text x=${p.x} y=${p.y + fs * .35} textAnchor="middle" fontSize=${fs}>${l}</text></g>`;
  function wave(x1, y1, x2, y2, amp = 6, n = 4) {
    const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, nx = -uy, ny = ux, N = n * 10; let d = `M${x1},${y1}`;
    for (let k = 1; k <= N; k++) { const t = k / N, s = Math.sin(t * n * 2 * Math.PI) * amp * Math.sin(t * Math.PI); d += ` L${(x1 + ux * L * t + nx * s).toFixed(1)},${(y1 + uy * L * t + ny * s).toFixed(1)}`; }
    return d;
  }
  const fig = (stage, steps, i, ctl, label) => html`<figure className="fig"><div className="fig-stage" role="group" aria-label=${label}>${stage}</div><${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;

  // slide 3: weight of a path
  function PathWeight() {
    const P = [{ x: 34, y: 40 }, { x: 118, y: 92 }, { x: 202, y: 40 }, { x: 286, y: 92 }, { x: 370, y: 40 }], W = [4, -2, -5, 1];
    const fmt = x => x < 0 ? '−' + (-x) : '' + x;
    const run = W.map((_, k) => W.slice(0, k + 1).reduce((a, b) => a + b, 0));
    const steps = [{ en: 'A path p = v<sub>1</sub> → v<sub>2</sub> → … → v<sub>k</sub> in a digraph G = (V, E) with edge weights w : E → ℝ (weights may be negative).' }]
      .concat(W.map((w, k) => ({ en: `Add w(v<sub>${k + 1}</sub>, v<sub>${k + 2}</sub>) = ${fmt(w)}: running total ${k ? fmt(run[k - 1]) + ' + (' + fmt(w) + ') = ' : ''}${fmt(run[k])}.` })))
      .concat([{ en: 'w(p) = Σ<sub>i=1</sub><sup>k−1</sup> w(v<sub>i</sub>, v<sub>i+1</sub>) = 4 + (−2) + (−5) + 1 = <b>−2</b>.' }]);
    const [i, ctl] = useSteps(steps.length, 1700);
    return fig(html`<svg viewBox="0 0 404 150"><${Defs} />
      ${W.map((w, k) => html`<${Edge} key=${k} a=${P[k]} b=${P[k + 1]} w=${fmt(w)} fs=${19} cls=${i === k + 1 ? 'hot' : ''} lab=${k % 2 ? 16 : -16} />`)}
      ${P.map((p, k) => html`<${Node} key=${k} p=${p} l=${'v' + (k + 1)} cls=${i >= 1 && k <= Math.min(i, 4) ? 'on' : ''} fs=${18} />`)}
      <text x="380" y="138" textAnchor="end" fontSize="18" className=${'a18-k ' + pop(i >= 1)}>${i >= 1 ? 'w = ' + fmt(run[Math.min(i, 4) - 1]) : ''}</text>
    </svg>`, steps, i, ctl, 'Path v1 to v5 with weights 4, -2, -5, 1');
  }

  // slides 5-7: optimal substructure, cut and paste
  function CutPaste() {
    const P = [0, 1, 2, 3, 4, 5].map(k => ({ x: 30 + k * 68, y: 50 }));
    const steps = [
      { en: '<b>Theorem.</b> A subpath of a shortest path is a shortest path. Take a shortest path p from u to v.' },
      { en: 'Pick any subpath p′ of it, here from x to y.' },
      { en: '<i>Proof.</i> Cut and paste: suppose there were a shorter path q from x to y, with w(q) &lt; w(p′).' },
      { en: 'Cut out p′ and paste in q: the new path from u to v weighs w(p) − w(p′) + w(q) &lt; w(p), so p was not a shortest path. Contradiction, so p′ is a shortest path. ∎' }
    ];
    const [i, ctl] = useSteps(steps.length, 2400);
    const sub = k => k >= 1 && k < 4;
    const q = `M${P[1].x + 8},${P[1].y + 16} Q${(P[1].x + P[4].x) / 2},${P[1].y + 100} ${P[4].x - 8},${P[4].y + 16}`;
    return fig(html`<svg viewBox="0 0 400 150"><${Defs} />
      ${P.slice(0, 5).map((p, k) => html`<path key=${k} d=${`M${p.x + 18},${p.y} L${P[k + 1].x - 19},${p.y}`} className=${'a18-e' + (i >= 1 && sub(k) ? (i >= 3 ? ' dash' : ' hot') : '')} markerEnd=${i >= 1 && sub(k) && i < 3 ? 'url(#a18-ahk)' : 'url(#a18-ah)'} style=${{ opacity: i >= 3 && sub(k) ? .35 : 1 }} />`)}
      <path d=${q} className=${'a18-e dash ' + (i >= 3 ? 'try ' : '') + pop(i >= 2)} markerEnd=${i >= 3 ? 'url(#a18-aho)' : 'url(#a18-ah)'} />
      <text x="200" y="140" textAnchor="middle" fontSize="18" className=${pop(i >= 2)}>${"q, with w(q) < w(p′)"}</text>
      ${P.map((p, k) => html`<${Node} key=${k} p=${p} l=${['u', '', '', '', '', 'v'][k] || (k === 1 && i >= 1 ? 'x' : k === 4 && i >= 1 ? 'y' : '')} cls=${i >= 1 && (k === 1 || k === 4) ? 'on' : ''} />`)}
      <text x=${(P[1].x + P[4].x) / 2} y="26" textAnchor="middle" fontSize="18" className=${'a18-k ' + pop(i >= 1)}>p′</text>
    </svg>`, steps, i, ctl, 'Cut and paste proof on a six-vertex path');
  }

  // slides 8-9: triangle inequality
  function Triangle() {
    const u = { x: 50, y: 40 }, v = { x: 350, y: 40 }, x = { x: 200, y: 130 };
    const steps = [
      { en: '<b>Theorem.</b> For all u, v, x ∈ V, δ(u, v) ≤ δ(u, x) + δ(x, v).' },
      { en: 'δ(u, v) is the weight of a shortest path from u to v.' },
      { en: 'Going from u to x by a shortest path and then from x to v by a shortest path is one particular path from u to v, of weight δ(u, x) + δ(x, v).' },
      { en: 'A shortest path weighs no more than any particular path, so δ(u, v) ≤ δ(u, x) + δ(x, v). ∎' }
    ];
    const [i, ctl] = useSteps(steps.length, 2200);
    return fig(html`<svg viewBox="0 0 400 175"><${Defs} />
      <path d=${wave(u.x + 18, u.y, v.x - 20, v.y, 5, 6)} className=${'a18-e ' + (i === 1 || i === 3 ? 'hot ' : '') + pop(i >= 1)} markerEnd="url(#a18-ah)" />
      <text x="200" y="22" textAnchor="middle" fontSize="18" className=${pop(i >= 1)}>δ(u, v)</text>
      <path d=${wave(u.x + 12, u.y + 14, x.x - 14, x.y - 10, 5, 3)} className=${'a18-e ' + (i >= 2 ? 'try ' : '') + pop(i >= 2)} markerEnd="url(#a18-ah)" />
      <path d=${wave(x.x + 14, x.y - 10, v.x - 12, v.y + 14, 5, 3)} className=${'a18-e ' + (i >= 2 ? 'try ' : '') + pop(i >= 2)} markerEnd="url(#a18-ah)" />
      <text x="95" y="112" textAnchor="middle" fontSize="18" className=${pop(i >= 2)}>δ(u, x)</text>
      <text x="305" y="112" textAnchor="middle" fontSize="18" className=${pop(i >= 2)}>δ(x, v)</text>
      <${Node} p=${u} l="u" /><${Node} p=${v} l="v" /><${Node} p=${x} l="x" />
      <text x="200" y="170" textAnchor="middle" fontSize="18" className=${'a18-k ' + pop(i >= 3)}>δ(u, v) ≤ δ(u, x) + δ(x, v)</text>
    </svg>`, steps, i, ctl, 'Triangle inequality with vertices u, x and v');
  }

  // slides 10-11: negative-weight cycle
  function NegCycle() {
    const u = { x: 30, y: 150 }, a = { x: 120, y: 150 }, b = { x: 230, y: 150 }, v = { x: 360, y: 150 }, c1 = { x: 185, y: 70 }, c2 = { x: 275, y: 70 };
    const steps = [
      { en: 'If a graph G contains a <b>negative-weight cycle</b>, then some shortest paths may not exist. Take a path from u to v.' },
      { en: 'Its middle vertex lies on a cycle whose total weight is &lt; 0.' },
      { en: 'Going once more around the cycle gives another path from u to v that is lighter by |w(cycle)|.' },
      { en: 'Every extra loop makes the path lighter again, with no end: there is no minimum, so δ(u, v) = −∞ and no shortest path from u to v exists. (Dijkstra needs w(u, v) ≥ 0.)' }
    ];
    const [i, ctl] = useSteps(steps.length, 2200);
    const loops = Math.max(0, i - 1);
    return fig(html`<svg viewBox="0 0 400 190"><${Defs} />
      <${Edge} a=${u} b=${a} /><${Edge} a=${a} b=${b} /><${Edge} a=${b} b=${v} />
      <g className=${i >= 1 ? '' : 'a18-n dim'}>
        <path d=${`M${b.x - 12},${b.y - 14} Q${c1.x - 5},${b.y - 30} ${c1.x},${c1.y + 19}`} className=${'a18-e' + (i >= 2 ? ' hot' : '')} markerEnd=${i >= 2 ? 'url(#a18-ahk)' : 'url(#a18-ah)'} />
        <path d=${`M${c1.x - 10},${c1.y - 15} Q${(c1.x + c2.x) / 2},${c1.y - 58} ${c2.x + 6},${c2.y - 18}`} className=${'a18-e' + (i >= 2 ? ' hot' : '')} markerEnd=${i >= 2 ? 'url(#a18-ahk)' : 'url(#a18-ah)'} />
        <path d=${`M${c2.x},${c2.y + 19} Q${c2.x + 5},${b.y - 30} ${b.x + 13},${b.y - 14}`} className=${'a18-e' + (i >= 2 ? ' hot' : '')} markerEnd=${i >= 2 ? 'url(#a18-ahk)' : 'url(#a18-ah)'} />
        <text x=${(c1.x + c2.x) / 2} y=${c1.y - 34} textAnchor="middle" fontSize="18">…</text>
        <text x=${(c1.x + c2.x) / 2} y=${c1.y + 22} textAnchor="middle" fontSize="20" className="a18-k">${"< 0"}</text>
      </g>
      ${[u, a, b, v, c1, c2].map((p, k) => html`<${Node} key=${k} p=${p} l=${k === 0 ? 'u' : k === 3 ? 'v' : ''} />`)}
      <text x="200" y="186" textAnchor="middle" fontSize="18" className=${'a18-k ' + pop(i >= 2)}>${i >= 3 ? 'loops: 1, 2, 3, …  ⇒  δ(u, v) = −∞' : 'loops: ' + loops + '  ⇒  lighter by ' + loops + '·|w(cycle)|'}</text>
    </svg>`, steps, i, ctl, 'A negative-weight cycle on the path from u to v');
  }

  // slides 13-26: Dijkstra on the slide graph
  const DG = {
    V: ['A', 'B', 'C', 'D', 'E'],
    pos: { A: { x: 40, y: 135 }, B: { x: 150, y: 55 }, C: { x: 150, y: 215 }, D: { x: 290, y: 55 }, E: { x: 290, y: 215 } },
    E: [['A', 'B', 10, 0, -14], ['A', 'C', 3, 0, 14], ['B', 'C', 1, 22, 12], ['C', 'B', 4, 22, 12], ['B', 'D', 2, 0, -14], ['C', 'D', 8, 0, -14], ['C', 'E', 2, 0, 14], ['D', 'E', 7, 22, 12], ['E', 'D', 9, 22, 12]],
    dpos: { A: [40, 105, 'middle'], B: [150, 24, 'middle'], C: [150, 258, 'middle'], D: [290, 24, 'middle'], E: [290, 258, 'middle'] }
  };
  const INF = Infinity, sh = x => x === INF ? '∞' : '' + x;
  function dijkstraTrace(G, s) {
    const d = {}, par = {}, S = [], Q = G.V.slice(), steps = [], rows = [];
    G.V.forEach(v => d[v] = v === s ? 0 : INF);
    const snap = (o) => steps.push(Object.assign({ d: Object.assign({}, d), par: Object.assign({}, par), S: S.slice(), rows: rows.map(r => r.map(c => Object.assign({}, c))) }, o));
    snap({ kind: 'graph', lines: [], en: 'Graph with <b>nonnegative edge weights</b>; the source is A. B→C weighs 1 and C→B weighs 4; D→E weighs 7 and E→D weighs 9.' });
    rows.push(G.V.map(v => ({ v, t: sh(d[v]) })));
    snap({ kind: 'init', lines: [0, 1, 2, 3, 4], en: 'Initialize: d[A] ← 0, d[v] ← ∞ for every other v, S ← ∅, and Q ← V, a priority queue keyed on d.' });
    while (Q.length) {
      let u = Q[0]; Q.forEach(v => { if (d[v] < d[u]) u = v; });
      if (d[u] === INF) break;
      Q.splice(Q.indexOf(u), 1); S.push(u);
      const last = rows[rows.length - 1], cell = last.find(c => c.v === u); if (cell) cell.box = true;
      snap({ kind: 'extract', u, lines: [6, 7], en: `“${u}” ← EXTRACT-MIN(Q): d[${u}] = ${d[u]} is the smallest key left in Q, so ${u} joins S = {${S.join(', ')}}.` });
      const out = G.E.filter(e => e[0] === u), parts = [], changed = [];
      for (const [, v, w] of out) {
        const nd = d[u] + w;
        if (d[v] > nd) { parts.push(`${u}→${v}: ${d[u]} + ${w} = ${nd} &lt; ${sh(d[v])}, so d[${v}] ← ${nd}`); d[v] = nd; par[v] = u; changed.push(v); }
        else parts.push(`${u}→${v}: ${d[u]} + ${w} = ${nd} ≥ ${d[v]}, no change`);
      }
      if (Q.length) rows.push(G.V.map(v => Q.includes(v) ? { v, t: sh(d[v]), nw: changed.includes(v) } : { v, t: '' }));
      const en = `Relax all edges leaving ${u}: ` + (parts.length ? parts.join('; ') + '.' : 'there are none.');
      snap({ kind: 'relax', u, lines: [8, 9, 10], changed, en: Q.length ? en : en + ` Q = ∅, so the algorithm stops: d = ${G.V.map(v => v + ' ' + sh(d[v])).join(', ')}. The coloured edges (each vertex's last relaxing edge) form the shortest-path tree.` });
    }
    return steps;
  }
  const DCODE = [['d[s] ← 0'], ['for each v ∈ V − {s}'], ['  do d[v] ← ∞'], ['S ← ∅'], ['Q ← V', '⊳ Q is a priority queue maintaining V − S'], ['while Q ≠ ∅'], [' do u ← EXTRACT-MIN(Q)'], ['    S ← S ∪ {u}'], ['    for each v ∈ Adj[u]'], ['     do if d[v] > d[u]+w(u, v)'], ['      then d[v] ← d[u]+w(u, v)', 'relaxation step: implicit DECREASE-KEY']];
  function Dijkstra() {
    const steps = useMemo(() => dijkstraTrace(DG, 'A'), []);
    const [i, ctl] = useSteps(steps.length, 2600);
    const st = steps[i], P = DG.pos;
    return fig(html`
      <svg viewBox="0 0 330 270"><${Defs} />
        ${DG.E.map(([a, b, w, bend, lab], k) => html`<${Edge} key=${k} a=${P[a]} b=${P[b]} w=${w} bend=${bend} lab=${lab} r=${20} cls=${st.par[b] === a ? 'hot' : ''} />`)}
        ${DG.V.map(v => html`<${Node} key=${v} p=${P[v]} l=${v} r=${20} cls=${(st.S.includes(v) ? 'on' : '') + (st.u === v ? ' cur' : '')} />`)}
        ${st.kind !== 'graph' && DG.V.map(v => html`<text key=${'d' + v} x=${DG.dpos[v][0]} y=${DG.dpos[v][1]} textAnchor="middle" fontSize="19" className="a18-k">${sh(st.d[v])}</text>`)}
      </svg>
      <div className=${'a18-panel ' + pop(st.kind !== 'graph')}>
        <table className="a18-q"><thead><tr><th>Q:</th>${DG.V.map(v => html`<th key=${v}>${v}</th>`)}</tr></thead>
          <tbody>${st.rows.map((r, k) => html`<tr key=${k}><td></td>${r.map(c => html`<td key=${c.v}>${c.t && html`<span className=${c.box ? 'box' : c.nw ? 'new' : ''}>${c.t}</span>`}</td>`)}</tr>`)}</tbody></table>
        <p className="a18-s">S: { ${st.S.join(', ')} }</p>
      </div>
      <div className="a18-code" aria-label="Dijkstra pseudocode">${DCODE.map((l, k) => html`<div key=${k} className=${st.lines.includes(k) ? 'on' : ''}>${l[0]}${l[1] && html`<span className="c" style=${{ display: 'block', paddingLeft: '1.5em' }}>${l[1]}</span>`}</div>`)}</div>
    `, steps, i, ctl, 'Dijkstra trace on the slide graph A to E');
  }

  // slides 27-30: correctness parts I and II
  function Lemmas() {
    const steps = [
      { en: '<b>Part I. Lemma.</b> Initializing d[s] ← 0 and d[v] ← ∞ for all v ∈ V − {s} establishes d[v] ≥ δ(s, v) for all v ∈ V, and relaxation keeps it true.' },
      { en: '<i>Proof.</i> Suppose not. Let v be the first vertex with d[v] &lt; δ(s, v), and u the vertex that changed it: d[v] = d[u] + w(u, v).' },
      { en: 'Then d[v] &lt; δ(s, v) ≤ δ(s, u) + δ(u, v) by the triangle inequality.' },
      { en: '≤ δ(s, u) + w(u, v), because a shortest path weighs no more than the specific edge (u, v).' },
      { en: '≤ d[u] + w(u, v), because v is the first violation, so d[u] ≥ δ(s, u). That gives d[v] &lt; d[u] + w(u, v) = d[v]: contradiction. ∎' },
      { en: '<b>Part II. Lemma.</b> Let u be v’s predecessor on a shortest path from s to v. If d[u] = δ(s, u) and edge (u, v) is relaxed, then d[v] = δ(s, v) afterwards.' },
      { en: '<i>Proof.</i> Observe δ(s, v) = δ(s, u) + w(u, v) (optimal substructure). Suppose d[v] &gt; δ(s, v) before the relaxation (otherwise, by Part I, we are done).' },
      { en: 'Then the test d[v] &gt; d[u] + w(u, v) succeeds, because d[v] &gt; δ(s, v) = δ(s, u) + w(u, v) = d[u] + w(u, v), and the algorithm sets d[v] = d[u] + w(u, v) = δ(s, v). ∎' }
    ];
    const [i, ctl] = useSteps(steps.length, 2600);
    const one = i < 5;
    const rowsI = [['d[v] &lt; δ(s, v)', 'supposition'], ['≤ δ(s, u) + δ(u, v)', 'triangle inequality'], ['≤ δ(s, u) + w(u, v)', 'sh. path ≤ specific path'], ['≤ d[u] + w(u, v)', 'v is first violation']];
    const rowsII = [['δ(s, v) = δ(s, u) + w(u, v)', 'subpath of a shortest path'], ['d[v] &gt; δ(s, v) = d[u] + w(u, v)', 'test succeeds'], ['d[v] ← d[u] + w(u, v) = δ(s, v)', 'after relaxing']];
    const s = { x: 40, y: 45 }, u = { x: 230, y: 45 }, v = { x: 340, y: 45 };
    const R = one ? rowsI : rowsII, shown = one ? i : i - 5;
    return fig(html`
      <svg viewBox="0 0 380 90"><${Defs} />
        <path d=${wave(s.x + 18, s.y, u.x - 20, u.y, 6, 4)} className="a18-e" markerEnd="url(#a18-ah)" />
        <${Edge} a=${u} b=${v} w="w(u, v)" lab=${-16} cls=${(one && i >= 1) || (!one && i >= 7) ? 'hot' : ''} />
        <${Node} p=${s} l="s" /><${Node} p=${u} l="u" cls=${!one ? 'on' : ''} /><${Node} p=${v} l="v" cls=${(!one && i >= 7) ? 'on' : ''} />
        <text x="135" y="84" textAnchor="middle" fontSize="17" className="a18-g">${one ? 'some path to u' : 'shortest path, d[u] = δ(s, u)'}</text>
      </svg>
      <div className="a18-chain">
        <div className="hd"><span>${one ? 'Part I: d[v] ≥ δ(s, v)' : 'Part II: relaxing (u, v) fixes v'}</span></div>
        ${R.map((r, k) => html`<div key=${(one ? 'a' : 'b') + k} className=${pop(k < shown || (!one && i === 7 && k <= 2))}><span dangerouslySetInnerHTML=${{ __html: r[0] }}></span><span>${r[1]}</span></div>`)}
        ${one && html`<div className=${pop(i >= 4)}><span className="x">= d[v]: contradiction</span><span></span></div>`}
      </div>`, steps, i, ctl, 'Correctness lemmas of Dijkstra');
  }

  // slides 31-33: correctness part III
  function Proof() {
    const steps = [
      { en: '<b>Theorem.</b> Dijkstra’s algorithm terminates with d[v] = δ(s, v) for all v ∈ V. It suffices to show d[v] = δ(s, v) for every v when v is added to S.' },
      { en: 'Suppose u is the <b>first</b> vertex added to S for which d[u] &gt; δ(s, u). Picture S just before adding u.' },
      { en: 'Let y be the first vertex in V − S along a shortest path from s to u, and let x ∈ S be its predecessor.' },
      { en: 'Since u is the first violation, d[x] = δ(s, x). When x was added to S, the edge (x, y) was relaxed, so d[y] = δ(s, y) (Part II).' },
      { en: 'y comes before u on a shortest path and weights are nonnegative, so d[y] = δ(s, y) ≤ δ(s, u) &lt; d[u].' },
      { en: 'But EXTRACT-MIN chose u before y, so d[u] ≤ d[y]. Contradiction. ∎' }
    ];
    const [i, ctl] = useSteps(steps.length, 2600);
    const s = { x: 70, y: 115 }, x = { x: 205, y: 120 }, y = { x: 262, y: 142 }, u = { x: 340, y: 50 };
    const L = [['d[x] = δ(s, x)', 3], ['d[y] = δ(s, y)', 3], ['δ(s, y) ≤ δ(s, u) &lt; d[u]', 4], ['d[u] ≤ d[y]  ⇒  contradiction', 5]];
    return fig(html`
      <svg viewBox="0 0 380 190"><${Defs} />
        <path d="M30,110 C20,60 110,50 160,62 C200,70 240,60 245,95 C250,130 240,170 180,168 C120,166 40,170 30,110 Z" className=${'a18-blob ' + pop(i >= 1)} />
        <text x="105" y="88" fontSize="20" className=${'a18-k ' + pop(i >= 1)} fontStyle="italic">S</text>
        <path d=${wave(s.x + 18, s.y, x.x - 18, x.y, 7, 3)} className=${'a18-e ' + (i >= 2 ? 'hot' : '')} />
        <${Edge} a=${x} b=${y} r=${16} cls=${i >= 3 ? 'hot ' + pop(i >= 2) : pop(i >= 2)} />
        <path d=${`M${y.x + 4},${y.y - 16} C${y.x + 20},${60} ${200},${30} ${235},${38} C${270},${44} ${285},${70} ${u.x - 18},${u.y + 4}`} className=${'a18-e ' + (i >= 2 ? 'hot ' : '') + pop(i >= 2)} markerEnd=${i >= 2 ? 'url(#a18-ahk)' : 'url(#a18-ah)'} />
        <${Node} p=${s} l="s" cls="on" r=${16} /><${Node} p=${x} l="x" cls=${i >= 2 ? 'on' : ''} r=${16} />
        <${Node} p=${y} l="y" cls=${i >= 2 ? (i >= 3 ? 'cur' : '') : 'dim'} r=${16} /><${Node} p=${u} l="u" cls=${i >= 1 ? 'cur' : ''} r=${16} />
        <text x="110" y="186" textAnchor="middle" fontSize="17" className=${'a18-g ' + pop(i >= 1)}>S, just before adding u</text>
      </svg>
      <div className="a18-chain">${L.map((l, k) => html`<div key=${k} className=${pop(i >= l[1])}><span className=${k === 3 ? 'x' : ''} dangerouslySetInnerHTML=${{ __html: l[0] }}></span><span></span></div>`)}</div>`, steps, i, ctl, 'Proof picture: S, s, x, y and u');
  }

  // slides 34-42: analysis
  function Analysis() {
    const steps = [
      { en: 'The main loop of Dijkstra’s algorithm.' },
      { en: 'The while loop runs <b>|V| times</b>: one EXTRACT-MIN per vertex.' },
      { en: 'For each u, the for loop runs <b>degree(u) times</b>.' },
      { en: '<b>Handshaking Lemma</b> ⇒ Σ degree(u) = Θ(E), so there are Θ(E) implicit DECREASE-KEY’s.' },
      { en: 'Time = Θ(V·T<sub>EXTRACT-MIN</sub> + E·T<sub>DECREASE-KEY</sub>). Note: same formula as in the analysis of Prim’s minimum spanning tree algorithm.' },
      { en: 'The total depends on how the priority queue Q is implemented.' },
      { en: '<b>Array</b>: EXTRACT-MIN scans in O(V), DECREASE-KEY is O(1): V·V + E·1 = <b>O(V<sup>2</sup>)</b>.' },
      { en: '<b>Binary heap</b>: both take O(lg V): V lg V + E lg V = <b>O(E lg V)</b>.' },
      { en: '<b>Fibonacci heap</b>: EXTRACT-MIN O(lg V) amortized, DECREASE-KEY O(1) amortized: <b>O(E + V lg V)</b> worst case.' }
    ];
    const [i, ctl] = useSteps(steps.length, 2300);
    const code = [['while Q ≠ ∅', 0], ['  do u ← EXTRACT-MIN(Q)', 1], ['     S ← S ∪ {u}', 1], ['     for each v ∈ Adj[u]', 2], ['      do if d[v] > d[u]+w(u, v)', 2], ['       then d[v] ← d[u]+w(u, v)', 3]];
    const rows = [['array', 'O(V)', 'O(1)', 'O(V<sup>2</sup>)'], ['binary heap', 'O(lg V)', 'O(lg V)', 'O(E lg V)'], ['Fibonacci heap', 'O(lg V)<small>amortized</small>', 'O(1)<small>amortized</small>', 'O(E + V lg V)<small>worst case</small>']];
    return fig(html`
      <div className="a18-leg"><span className=${pop(i >= 1)}><i style=${{ background: 'var(--fig-k)' }}></i>|V| times</span><span className=${pop(i >= 2)}><i style=${{ background: 'var(--ok)' }}></i>degree(u) times</span></div>
      <div className="a18-code" style=${{ marginTop: 0 }}>${code.map(([t, g], k) => html`<div key=${k} className=${'v' + (i >= 1 && g >= 1 ? ' lv' : '') + (i >= 3 && g === 3 ? ' on' : '')}><span className=${i >= 2 && g >= 2 ? 'd2' : ''} style=${{ display: 'block' }}>${t}</span></div>`)}</div>
      <p className=${'a18-tm ' + pop(i >= 3)}>Handshaking Lemma ⇒ Θ(E) implicit DECREASE-KEY’s</p>
      <p className=${'a18-tm ' + pop(i >= 4)}><b>Time = Θ(V)·T<sub>EXTRACT-MIN</sub> + Θ(E)·T<sub>DECREASE-KEY</sub></b></p>
      <table className=${'a18-tbl ' + pop(i >= 5)}><thead><tr><th>Q</th><th>T<sub>EXTRACT-MIN</sub></th><th>T<sub>DECREASE-KEY</sub></th><th>Total</th></tr></thead>
        <tbody>${rows.map((r, k) => html`<tr key=${k} className=${pop(i >= 6 + k)}>${r.map((c, j) => html`<td key=${j} dangerouslySetInnerHTML=${{ __html: c }}></td>`)}</tr>`)}</tbody></table>
    `, steps, i, ctl, 'Running time of Dijkstra');
  }

  // slides 43-59: breadth-first search on the slide graph
  const BG = {
    V: 'abcdefghi'.split(''),
    pos: { a: { x: 50, y: 50 }, b: { x: 50, y: 130 }, c: { x: 50, y: 210 }, d: { x: 148, y: 90 }, e: { x: 148, y: 170 }, f: { x: 246, y: 50 }, g: { x: 246, y: 130 }, h: { x: 344, y: 50 }, i: { x: 344, y: 170 } },
    adj: { a: ['b', 'd'], b: ['c', 'e'], c: [], d: ['b', 'e'], e: ['c', 'g', 'i'], f: ['d', 'h'], g: ['f', 'i'], h: ['g'], i: ['h'] },
    dpos: { a: [20, 56], b: [20, 136], c: [20, 216], d: [148, 60], e: [148, 210], f: [246, 22], g: [218, 105], h: [344, 22], i: [344, 210] }
  };
  function bfsTrace(G, s) {
    const d = {}, par = {}, Q = [], steps = []; let head = 0;
    G.V.forEach(v => d[v] = INF);
    const snap = o => steps.push(Object.assign({ d: Object.assign({}, d), par: Object.assign({}, par), Q: Q.slice(), head }, o));
    snap({ lines: [], en: '<b>Unweighted graphs</b>: w(u, v) = 1 for all (u, v) ∈ E. Can Dijkstra’s algorithm be improved? Use a simple FIFO queue instead of a priority queue. Q starts empty.' });
    d[s] = 0; Q.push(s);
    snap({ lines: [], en: `d[${s}] ← 0 and ENQUEUE(Q, ${s}); every other d is ∞.` });
    while (head < Q.length) {
      const u = Q[head++], nw = [], old = [];
      for (const v of G.adj[u]) { if (d[v] === INF) { d[v] = d[u] + 1; par[v] = u; Q.push(v); nw.push(v); } else old.push(v); }
      const parts = nw.map(v => `d[${v}] ← ${d[u]} + 1 = ${d[v]}`);
      snap({ u, nw, lines: [1, 2, 3, 4, 5], en: `${u} ← DEQUEUE(Q). ` + (nw.length ? `New neighbours: ${parts.join(', ')}, then ENQUEUE ${nw.join(', ')}.` : 'No neighbour with d = ∞, nothing is enqueued.') + (old.length ? ` (${old.join(', ')} already ${old.length > 1 ? 'have' : 'has'} a distance.)` : '') });
    }
    snap({ lines: [], fin: true, en: 'Q is empty: d is the number of edges on a shortest path from a. Analysis: Time = O(V + E). <b>Key idea</b>: the FIFO Q mimics Dijkstra’s priority queue. <b>Invariant</b>: v comes after u in Q implies d[v] = d[u] or d[v] = d[u] + 1 (the queue reads 0 1 1 2 2 3 3 4 4).' });
    return steps;
  }
  const BCODE = [['while Q ≠ ∅'], ['  do u ← DEQUEUE(Q)'], ['     for each v ∈ Adj[u]'], ['      do if d[v] = ∞'], ['       then d[v] ← d[u] + 1'], ['            ENQUEUE(Q, v)']];
  function Bfs() {
    const steps = useMemo(() => bfsTrace(BG, 'a'), []);
    const [i, ctl] = useSteps(steps.length, 2300);
    const st = steps[i], P = BG.pos, edges = [];
    BG.V.forEach(u => BG.adj[u].forEach(v => edges.push([u, v])));
    const done = v => st.Q.indexOf(v) >= 0 && st.Q.indexOf(v) < st.head;
    return fig(html`
      <svg viewBox="0 0 380 236"><${Defs} />
        ${edges.map(([a, b], k) => html`<${Edge} key=${k} a=${P[a]} b=${P[b]} r=${17} cls=${st.par[b] === a ? 'hot' : ''} />`)}
        ${BG.V.map(v => html`<${Node} key=${v} p=${P[v]} l=${v} r=${17} cls=${(done(v) ? 'on' : '') + (st.u === v ? ' cur' : '')} />`)}
        ${BG.V.map(v => st.d[v] !== INF && html`<text key=${'d' + v} x=${BG.dpos[v][0]} y=${BG.dpos[v][1]} textAnchor="middle" fontSize="18" className="a18-k">${st.d[v]}</text>`)}
      </svg>
      <div className="a18-bq" aria-label="Queue"><b>Q:</b>${st.Q.map((v, k) => html`<span key=${v} className=${(k < st.head ? 'out' : '') + (k === st.head && !st.fin ? ' head' : '')}><small>${k >= st.head || st.fin ? st.d[v] : ''}</small>${v}</span>`)}</div>
      <div className="a18-code">${BCODE.map((l, k) => html`<div key=${k} className=${st.lines.includes(k) ? 'on' : ''}>${l[0]}</div>`)}</div>
    `, steps, i, ctl, 'Breadth-first search on the slide graph a to i');
  }

  window.FIGS = Object.assign(window.FIGS || {}, {
    'ag-18-path-weight': PathWeight, 'ag-18-cut-paste': CutPaste, 'ag-18-triangle': Triangle, 'ag-18-neg-cycle': NegCycle,
    'ag-18-dijkstra': Dijkstra, 'ag-18-lemmas': Lemmas, 'ag-18-proof': Proof, 'ag-18-analysis': Analysis, 'ag-18-bfs': Bfs
  });
})();
/* ── part L19 ── */
// Algorithms visuals, Lecture 19 (Dijkstra's exam table): the PARENT / step table filled row by row on the slide's 7-vertex graph (slide 1),
// with "try your own" edge weights, and the shortest paths read back through PARENT (slide 2). Every label and number comes from the slides.
(function () {
  const { useState, useEffect, useRef, useMemo } = React;
  const { html, useSteps, Cap, Bar, pop, calm, useClock, useFit, sec } = window.FIGKIT;
  const CSS = `
.a19-n circle{ fill:var(--paper); stroke:var(--ink); stroke-width:1.6; transition:fill .4s, stroke .4s; }
.a19-n text{ font-weight:700; }
.a19-n.on circle{ fill:var(--fig-s); stroke:var(--fig-s); } .fig svg .a19-n.on text{ fill:#fff; }
.a19-n.cur circle{ stroke:var(--fig-k); stroke-width:4.5; }
.a19-e{ fill:none; stroke:var(--graphite); stroke-width:1.5; stroke-dasharray:5 4; transition:stroke .4s; }
.a19-e.hot{ stroke:var(--fig-k); stroke-width:3.4; stroke-dasharray:none; }
.a19-e.rx{ stroke:var(--ok); stroke-width:3; stroke-dasharray:none; }
.a19-w{ font-weight:600; }
.fig svg text.a19-wh{ fill:var(--fig-k); font-weight:800; }
.a19-tw{ max-width:520px; margin:8px auto 0; }
.a19-t{ width:100%; border-collapse:collapse; table-layout:fixed; font-size:.82rem; text-align:center; color:var(--ink); }
.a19-t th, .a19-t td{ border:1px solid var(--line); padding:3px 0; }
.a19-t th:first-child, .a19-t td:first-child{ width:3.9em; font-size:.74rem; }
.a19-t thead th{ background:color-mix(in srgb, var(--fig-k) 22%, var(--paper)); font-weight:700; }
.a19-t .par td{ font-weight:700; color:var(--fig-k); transition:background .4s; }
.a19-t .par td.chg{ background:color-mix(in srgb, var(--ok) 22%, var(--paper)); }
.a19-t tbody tr:nth-child(odd){ background:color-mix(in srgb, var(--fig-k) 6%, var(--paper)); }
.a19-t td span{ display:inline-block; min-width:1.7em; border-radius:4px; }
.a19-t td span.min{ background:color-mix(in srgb, var(--fig-k) 30%, var(--paper)); font-weight:800; }
.a19-t td span.nw{ color:var(--ok); font-weight:800; }
.a19-row{ display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin:0 0 8px; }
.a19-row .fig-btn{ font-size:.84rem; padding:4px 10px; }
.a19-row .fig-btn.a19-sel{ border-color:var(--fig-k); box-shadow:0 0 0 1px var(--fig-k); }
.a19-ed{ display:grid; grid-template-columns:repeat(auto-fill, minmax(84px, 1fr)); gap:6px; max-width:520px; margin:0 auto 8px; }
.a19-ed label{ display:flex; align-items:center; justify-content:space-between; gap:4px; font-size:.85rem; border:1px solid var(--line); border-radius:6px; padding:2px 4px 2px 6px; background:var(--paper); color:var(--ink); }
.a19-ed input{ width:42px; font:inherit; font-size:16px; padding:2px 3px; border:1px solid var(--line); border-radius:4px; background:var(--paper-2); color:var(--ink); }
.a19-ed input.bad{ border-color:#d23c3c; outline:1px solid #d23c3c; }
.a19-msg{ text-align:center; font-size:.85rem; color:var(--graphite); margin:0 0 6px; }
.a19-msg.err{ color:var(--ink); font-weight:700; }
.a19-pl{ max-width:520px; margin:8px auto 0; display:grid; grid-template-columns:repeat(auto-fill, minmax(130px, 1fr)); gap:4px 10px; font-size:.95rem; }
.a19-pl div{ padding:3px 8px; border-left:3px solid var(--line); }
.a19-pl div.cur{ border-left-color:var(--fig-k); font-weight:700; }
`;
  if (!document.getElementById('a19-css')) { const s = document.createElement('style'); s.id = 'a19-css'; s.textContent = CSS; document.head.appendChild(s); }

  // the slide's graph: vertices, positions and directed edges [from, to, weight, label offset]
  const V = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const POS = { A: { x: 26, y: 100 }, B: { x: 110, y: 32 }, C: { x: 200, y: 100 }, D: { x: 110, y: 168 }, G: { x: 296, y: 32 }, E: { x: 374, y: 100 }, F: { x: 296, y: 168 } };
  const EDGES = [['A', 'B', 5, -15], ['A', 'C', 3, -13], ['B', 'G', 1, -13], ['B', 'C', 2, -14], ['B', 'E', 3, -13], ['C', 'D', 7, 14], ['C', 'E', 7, -13], ['D', 'A', 2, -14], ['D', 'F', 6, 15], ['E', 'D', 2, -13], ['E', 'F', 1, 14], ['G', 'E', 1, -14]];
  const SLIDE_W = EDGES.map(e => e[2]);
  const R = 19;
  const toward = (p, q, r) => { const dx = q.x - p.x, dy = q.y - p.y, L = Math.hypot(dx, dy) || 1; return { x: p.x + dx / L * r, y: p.y + dy / L * r }; };
  function Graph({ W, settled = [], cur, hot = [], rx = [] }) {
    const has = (L, a, b) => L.some(e => e[0] === a && e[1] === b);
    return html`<svg viewBox="0 0 400 200" role="img" aria-label="Directed graph on A to G with the slide's edge weights">
      <defs>
        <marker id="a19-ah" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="11" markerHeight="11" orient="auto"><path d="M0,0 L10,5 L0,10 z" style=${{ fill: 'var(--graphite)' }} /></marker>
        <marker id="a19-ahk" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="13" markerHeight="13" orient="auto"><path d="M0,0 L10,5 L0,10 z" style=${{ fill: 'var(--fig-k)' }} /></marker>
        <marker id="a19-aho" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="13" markerHeight="13" orient="auto"><path d="M0,0 L10,5 L0,10 z" style=${{ fill: 'var(--ok)' }} /></marker>
      </defs>
      ${EDGES.map(([a, b, , lab], k) => {
        const p = POS[a], q = POS[b], s = toward(p, q, R), e = toward(q, p, R + 1), L = Math.hypot(q.x - p.x, q.y - p.y), nx = -(q.y - p.y) / L, ny = (q.x - p.x) / L;
        const cls = has(rx, a, b) ? 'rx' : has(hot, a, b) ? 'hot' : '', mk = cls === 'rx' ? 'a19-aho' : cls === 'hot' ? 'a19-ahk' : 'a19-ah';
        const t = .5, mx = s.x + (e.x - s.x) * t + nx * lab, my = s.y + (e.y - s.y) * t + ny * lab;
        return html`<g key=${k}><path d=${`M${s.x},${s.y} L${e.x},${e.y}`} className=${'a19-e ' + cls} markerEnd=${`url(#${mk})`} />
          <text x=${mx} y=${my + 6.5} textAnchor="middle" fontSize="19" className=${'a19-w' + (W[k] !== SLIDE_W[k] ? ' a19-wh' : '')}>${W[k]}</text></g>`;
      })}
      ${V.map(v => html`<g key=${v} className=${'a19-n' + (settled.includes(v) ? ' on' : '') + (cur === v ? ' cur' : '')}><circle cx=${POS[v].x} cy=${POS[v].y} r=${R} /><text x=${POS[v].x} y=${POS[v].y + 6.6} textAnchor="middle" fontSize="19">${v}</text></g>`)}
    </svg>`;
  }

  // Dijkstra exactly as the exam table records it: one row per EXTRACT-MIN, settled columns blank, ∞ written as -
  function trace(W) {
    const E = EDGES.map((e, k) => [e[0], e[1], W[k]]), d = {}, par = {}, S = [], rows = [], steps = [];
    V.forEach(v => d[v] = v === 'A' ? 0 : Infinity);
    const cell = v => d[v] === Infinity ? '-' : '' + d[v];
    const pick = () => { let m = null; V.forEach(v => { if (!S.includes(v) && d[v] !== Infinity && (m === null || d[v] < d[m])) m = v; }); return m; };
    steps.push({ rows: [], par: {}, S: [], en: 'Dr. Basheer’s exam table for Dijkstra from source A. The top row records PARENT (π) of each vertex, the next row names the vertices, and each row after that is one EXTRACT-MIN. ∞ is written as -.' });
    let u = 'A', rel = [], chg = [];
    rows.push({ cells: V.map(v => ({ v, t: cell(v) })) });
    let m = pick(); rows[0].min = m;
    steps.push({ rows: rows.slice(), par: {}, S: [], cur: null, en: 'Row 1 (init at A): d[A] = 0 and every other vertex is - (∞). The minimum is A (0), so A is extracted first.' });
    while (m) {
      u = m; S.push(u); rel = []; chg = [];
      const parts = [];
      for (const [a, b, w] of E) if (a === u) {
        if (S.includes(b)) { parts.push(`${a}→${b} goes to a settled vertex`); continue; }
        const nd = d[u] + w;
        if (nd < d[b]) { parts.push(`${a}→${b}: ${d[u]} + ${w} = ${nd} &lt; ${d[b] === Infinity ? "∞" : d[b]}, so d[${b}] ← ${nd} (parent ${u})`); d[b] = nd; par[b] = u; rel.push([a, b]); chg.push(b); }
        else parts.push(`${a}→${b}: ${d[u]} + ${w} = ${nd}, not better than ${d[b]}`);
      }
      const left = V.filter(v => !S.includes(v));
      if (!left.length) { steps.push({ rows: rows.slice(), par: Object.assign({}, par), S: S.slice(), cur: u, rel, chg, en: `Extract ${u} (${d[u]}): every vertex is settled. ` + (parts.length ? parts.join('; ') + '.' : '') }); break; }
      const nm = pick();
      const row = { cells: V.map(v => ({ v, t: S.includes(v) ? '' : cell(v), nw: chg.includes(v) })), min: nm };
      rows.push(row);
      const k = rows.length;
      let en = `Row ${k} (after ${u} = ${d[u]}): ` + (parts.length ? parts.join('; ') + '. ' : `${u} has no outgoing edges. `);
      en += nm ? `The minimum is ${nm} (${d[nm]}), so extract ${nm}.` : `The rest stay - (∞): they cannot be reached from A.`;
      if (nm && V.filter(v => !S.includes(v)).length === 1) en += ' It is the last vertex, so the table ends here.';
      steps.push({ rows: rows.slice(), par: Object.assign({}, par), S: S.slice(), cur: u, rel, chg, en });
      m = nm;
      if (m && V.filter(v => !S.includes(v)).length === 1) { S.push(m); break; }
    }
    const fin = V.filter(v => v !== 'A').map(v => d[v] === Infinity ? `${v}: unreachable` : `${v} = ${d[v]} (π = ${par[v]})`).join(', ');
    steps.push({ rows: rows.slice(), par: Object.assign({}, par), S: S.slice(), cur: null, rel: [], chg: [], fin: true, en: `Final distances from A: ${fin}. The PARENT row now holds each vertex’s last improving predecessor; the coloured edges form the shortest-path tree.` });
    return { steps, d, par };
  }

  function Table() {
    const [W, setW] = useState(SLIDE_W), [edit, setEdit] = useState(false), [draft, setDraft] = useState(SLIDE_W.map(String));
    const bad = draft.map(s => !/^\d{1,2}$/.test(s.trim()) || +s < 1 || +s > 20);
    const { steps } = useMemo(() => trace(W), [W.join()]);
    const [i, ctl] = useSteps(steps.length, 2600);
    const ii = Math.min(i, steps.length - 1), st = steps[ii];
    const first = useRef(true);
    useEffect(() => { if (first.current) { first.current = false; return; } ctl.go(0); }, [W.join()]);
    const slide = W.join() === SLIDE_W.join();
    const setD = (k, v) => { const nd = draft.slice(); nd[k] = v; setDraft(nd); const ok = /^\d{1,2}$/.test(v.trim()) && +v >= 1 && +v <= 20; if (ok) { const nw = W.slice(); nw[k] = +v; setW(nw); } };
    const reset = () => { setW(SLIDE_W); setDraft(SLIDE_W.map(String)); };
    const tree = Object.keys(st.par).map(v => [st.par[v], v]);
    return html`<figure className="fig"><div className="fig-stage">
      <div className="a19-row">
        <button className=${'fig-btn' + (slide ? ' a19-sel' : '')} onClick=${reset}>Example from the slide</button>
        <button className=${'fig-btn' + (edit ? ' solid' : '')} onClick=${() => setEdit(!edit)}>${edit ? '✓ Done' : '✎ Try your own weights'}</button>
      </div>
      ${edit && html`<div><div className="a19-ed">${EDGES.map((e, k) => html`<label key=${k}>${e[0]}→${e[1]}<input type="text" inputMode="numeric" value=${draft[k]} className=${bad[k] ? 'bad' : ''} aria-label=${'weight of ' + e[0] + ' to ' + e[1]} onChange=${ev => setD(k, ev.target.value)} /></label>`)}</div>
        <p className=${'a19-msg' + (bad.some(x => x) ? ' err' : '')}>${bad.some(x => x) ? 'Each weight must be a whole number from 1 to 20; the red boxes are ignored until fixed.' : 'Weights are whole numbers 1 to 20 (Dijkstra needs w ≥ 0). Changed weights are coloured on the graph.'}</p></div>`}
      <${Graph} W=${W} settled=${st.S} cur=${st.cur} hot=${tree} rx=${st.rel || []} />
      <div className="a19-tw"><table className="a19-t">
        <thead><tr className="par"><th>PARENT</th>${V.map(v => html`<td key=${v} className=${(st.chg || []).includes(v) ? 'chg' : ''}>${st.par[v] || ''}</td>`)}</tr>
          <tr><th>#</th>${V.map(v => html`<th key=${v}>${v}</th>`)}</tr></thead>
        <tbody>${st.rows.map((r, k) => html`<tr key=${k}><td>${k + 1}</td>${r.cells.map(c => html`<td key=${c.v}>${c.t && html`<span className=${c.v === r.min ? 'min' : c.nw ? 'nw' : ''}>${c.t}</span>`}</td>`)}</tr>`)}</tbody>
      </table></div>
    </div><${Cap} en=${st.en} /><${Bar} steps=${steps} i=${ii} ctl=${ctl} /></figure>`;
  }

  // slide 2: read each shortest path back through PARENT
  function Paths() {
    const { d, par } = useMemo(() => trace(SLIDE_W), []);
    const order = ['G', 'F', 'E', 'D', 'C', 'B'];
    const info = order.map(t => { const p = [t]; while (par[p[0]]) p.unshift(par[p[0]]); const ws = p.slice(1).map((v, k) => EDGES.find(e => e[0] === p[k] && e[1] === v)[2]); return { t, p, ws }; });
    const steps = [{ en: 'After the table, the PARENT row is B: A, C: A, D: E, E: G, F: E, G: B. Follow it backwards from any vertex to A to get its shortest path.' }]
      .concat(info.map(({ t, p, ws }) => ({ en: `To ${t}: ${p.slice().reverse().slice(0, -1).map(v => `PARENT[${v}] = ${par[v]}`).join(', ')}. Reversed: ${p.join(' → ')}, weight ${ws.join(' + ')} = <b>${d[t]}</b>.` })));
    const [i, ctl] = useSteps(steps.length, 2400);
    const curI = info[i - 1], hot = curI ? curI.p.slice(1).map((v, k) => [curI.p[k], v]) : [], tree = Object.keys(par).map(v => [par[v], v]);
    return html`<figure className="fig"><div className="fig-stage">
      <${Graph} W=${SLIDE_W} settled=${curI ? curI.p : []} cur=${curI && curI.t} hot=${i === 0 ? tree : []} rx=${hot} />
      <div className="a19-pl">${info.map((x, k) => html`<div key=${x.t} className=${pop(i > k) + (i === k + 1 ? ' cur' : '')}>${x.p.join('')} = ${d[x.t]}</div>`)}</div>
    </div><${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  window.FIGS = Object.assign(window.FIGS || {}, { 'ag-19-table': Table, 'ag-19-paths': Paths });
})();
/* ── part L3 ── */
// Algorithms visuals, Lecture 3 (Solving Recurrences): asymptotic notation (slides 2-6), iteration method (9, 12-14),
// substitution method (15-20), recursion trees (21-23) and the master method (24-30). Every label and number comes from the slides.
(function () {
  const { useState, useEffect, useRef, useMemo } = React;
  const { html, useSteps, Cap, Bar, pop, calm, useClock, useFit, sec } = window.FIGKIT;
  const CSS = `
.a3-tabs{ display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin:0 0 10px; }
.a3-tabs .fig-btn{ padding:4px 11px; min-height:32px; }
.fig-btn.a3-on{ background:var(--fig-s); color:#fff; border-color:transparent; }
.fig-btn:disabled{ opacity:.45; cursor:default; }
.a3-box{ max-width:520px; margin:0 auto; background:var(--paper); border:1px solid var(--line); border-radius:10px; padding:8px 10px; color:var(--ink); font-size:.95rem; line-height:1.5; overflow-wrap:anywhere; }
.a3-box + .a3-box, .a3-box + .a3-lines, .a3-lines + .a3-box, svg + .a3-box, .a3-box + svg, .a3-row + .a3-box{ margin-top:10px; }
.a3-k{ color:var(--fig-k); font-weight:700; }
.a3-p{ color:var(--pen); font-weight:700; }
.a3-g{ color:var(--ok); font-weight:700; }
.a3-mut{ color:var(--graphite); font-size:.9rem; }
.a3-lines{ max-width:520px; margin:0 auto; display:grid; gap:4px; }
.a3-ln{ padding:3px 8px; border-radius:6px; font-size:.95rem; line-height:1.45; color:var(--ink); transition:background .4s; overflow-wrap:anywhere; }
.a3-ln.on{ background:color-mix(in srgb, var(--fig-k) 18%, var(--paper)); box-shadow:inset 3px 0 0 var(--fig-k); }
.a3-tag{ display:inline-block; font-size:.76rem; font-weight:700; color:var(--fig-k); text-transform:uppercase; letter-spacing:.04em; margin-right:6px; }
.a3-code{ font-family:var(--mono); font-size:.8rem; line-height:1.5; }
.a3-code div{ padding:1px 6px 1px 20px; text-indent:-14px; border-radius:5px; transition:background .4s; }
.a3-code div.on{ background:color-mix(in srgb, var(--fig-k) 20%, var(--paper)); }
.a3-code i{ font-style:normal; font-family:var(--body); color:var(--pen); font-size:.8rem; margin-left:8px; white-space:nowrap; }
.a3-tbl{ width:100%; border-collapse:collapse; font-size:.9rem; color:var(--ink); }
.a3-tbl th, .a3-tbl td{ border:1px solid var(--line); padding:3px 4px; text-align:center; }
.a3-tbl th{ background:var(--paper-2); font-weight:600; }
.a3-tbl tr.on td{ background:color-mix(in srgb, var(--fig-k) 18%, var(--paper)); }
.a3-chain{ display:flex; flex-wrap:wrap; gap:4px; align-items:center; justify-content:center; margin-top:8px; }
.a3-chip{ border:1.5px solid var(--fig-k); border-radius:8px; padding:2px 8px; background:var(--paper); font-size:.9rem; color:var(--ink); }
.a3-arw{ color:var(--pen); font-size:.85rem; font-weight:700; }
.a3-read{ text-align:center; font-size:.9rem; margin-top:6px; color:var(--ink); line-height:1.45; }
.a3-rng{ width:100%; max-width:420px; display:block; margin:6px auto 0; accent-color:var(--fig-k); }
.a3-form{ display:flex; flex-wrap:wrap; gap:8px; align-items:center; justify-content:center; font-size:.9rem; color:var(--ink); margin-top:8px; }
.a3-form label{ display:flex; gap:4px; align-items:center; }
.a3-form input{ width:52px; font:inherit; padding:3px 5px; border:1px solid var(--line); border-radius:6px; background:var(--paper); color:var(--ink); }
.a3-err{ color:var(--pen); font-size:.88rem; text-align:center; margin-top:6px; }
.a3-fade{ transition:opacity .5s ease; }
.a3-svg text{ font-family:var(--body); }
[data-fig^="ag-3-"] .fig-stage sup, [data-fig^="ag-3-"] .fig-stage sub{ font-size:.85em; }
[data-fig^="ag-3-"] .fig-stage sup sub, [data-fig^="ag-3-"] .fig-stage sub sup{ font-size:1em; }`;
  if (!document.getElementById('a3-css')) { const s = document.createElement('style'); s.id = 'a3-css'; s.textContent = CSS; document.head.appendChild(s); }

  const Tabs = ({ items, v, set }) => html`<div className="a3-tabs" role="tablist">${items.map((t, j) => html`<button key=${j} role="tab" aria-selected=${v === j} className=${'fig-btn' + (v === j ? ' a3-on' : '')} onClick=${() => set(j)} dangerouslySetInnerHTML=${{ __html: t }}></button>`)}</div>`;
  const H = s => ({ __html: s });
  const fmt = x => Math.abs(x - Math.round(x)) < 1e-9 ? String(Math.round(x)) : (Math.abs(x) >= 100 ? x.toFixed(0) : x.toFixed(2));
  const lg = Math.log2;

  /* ── slides 2-6: O, Ω, Θ, ω with the slides' examples ── */
  const ASY = [
    { tab: 'O', def: 'O(g(n)) = { f(n) : there exist constants c&nbsp;&gt;&nbsp;0, n<sub>0</sub>&nbsp;&gt;&nbsp;0 such that 0 ≤ f(n) ≤ c·g(n) for all n ≥ n<sub>0</sub> }  <span class="a3-mut">(slides 2-3: upper bound)</span>',
      ex: 'Example: 2n<sup>2</sup> = O(n<sup>3</sup>) with c = 1, n<sub>0</sub> = 2', fl: '2n²', gl: '1·n³', f: n => 2 * n * n, g: n => n * n * n, n0: 2, lo: 0, hi: 4, st: .25, ymax: 64,
      ok: (f, g) => 0 <= f && f <= g, rel: '0 ≤ f(n) ≤ c·g(n)' },
    { tab: 'Ω', def: 'Ω(g(n)) = { f(n) : there exist constants c&nbsp;&gt;&nbsp;0, n<sub>0</sub>&nbsp;&gt;&nbsp;0 such that 0 ≤ c·g(n) ≤ f(n) for all n ≥ n<sub>0</sub> }  <span class="a3-mut">(slide 4: lower bound)</span>',
      ex: 'Example: √n = Ω(lg n) with c = 1, n<sub>0</sub> = 16', fl: '√n', gl: '1·lg n', f: n => Math.sqrt(n), g: n => lg(n), n0: 16, lo: 1, hi: 40, st: 1, ymax: 7,
      ok: (f, g) => 0 <= g && g <= f + 1e-12, rel: '0 ≤ c·g(n) ≤ f(n)' },
    { tab: 'Θ', def: 'Θ(g(n)) = O(g(n)) ∩ Ω(g(n)): both bounds at once, c<sub>1</sub>·g(n) ≤ f(n) ≤ c<sub>2</sub>·g(n) for all n ≥ n<sub>0</sub>  <span class="a3-mut">(slide 5: tight bound)</span>',
      ex: 'Example: ½n<sup>2</sup> − 2n = Θ(n<sup>2</sup>). The slide gives no constants; c<sub>1</sub> = ¼, c<sub>2</sub> = ½, n<sub>0</sub> = 8 work, since ½n<sup>2</sup> − 2n ≥ ¼n<sup>2</sup> ⇔ n ≥ 8.', fl: '½n² − 2n', gl: '½n²', gl2: '¼n²',
      f: n => n * n / 2 - 2 * n, g: n => n * n / 2, g2: n => n * n / 4, n0: 8, lo: 0, hi: 16, st: 1, ymax: 128,
      ok: (f, g, g2) => g2 <= f && f <= g, rel: '¼n² ≤ f(n) ≤ ½n²' },
    { tab: 'ω', def: 'ω(g(n)) = { f(n) : for <b>any</b> constant c &gt; 0 there is a constant n<sub>0</sub> &gt; 0 such that 0 ≤ c·g(n) &lt; f(n) for all n ≥ n<sub>0</sub> }  <span class="a3-mut">(slide 6: like &gt;, while Ω is like ≥)</span>',
      ex: 'The slide gives no example. Picture: f(n) = n<sup>2</sup> = ω(n). Move c: however big it is, n<sup>2</sup> passes c·n once n &gt; c.', fl: 'n²', gl: 'c·n', f: n => n * n, n0: null, lo: 0, hi: 12, st: 1, ymax: 150,
      ok: (f, g) => 0 <= g && g < f, rel: '0 ≤ c·g(n) &lt; f(n)' }
  ];
  function AsymPlot({ d, n, c }) {
    const X0 = 42, X1 = 306, Y0 = 196, Y1 = 14;
    const sx = v => X0 + (v - d.lo) / (d.hi - d.lo) * (X1 - X0), sy = v => Y0 - Math.max(-0.05, Math.min(1.05, v / d.ymax)) * (Y0 - Y1);
    const g = d.tab === 'ω' ? (m => c * m) : d.g;
    const pts = fn => { const a = []; for (let k = 0; k <= 160; k++) { const m = d.lo + (d.hi - d.lo) * k / 160; const v = fn(m); if (isFinite(v)) a.push(sx(m).toFixed(1) + ',' + sy(v).toFixed(1)); } return a.join(' '); };
    const n0 = d.tab === 'ω' ? Math.floor(c) + 1 : d.n0;
    return html`<svg className="a3-svg" viewBox="0 0 320 228" role="img" aria-label=${'Plot of f(n) and c·g(n) for the ' + d.tab + ' example'}>
      <rect x=${sx(n0)} y=${Y1} width=${X1 - sx(n0)} height=${Y0 - Y1} fill="var(--ok)" opacity=".12" />
      <line x1=${X0} y1=${Y0} x2=${X1} y2=${Y0} stroke="var(--graphite)" strokeWidth="1.5" />
      <line x1=${X0} y1=${Y0} x2=${X0} y2=${Y1} stroke="var(--graphite)" strokeWidth="1.5" />
      <line x1=${sx(n0)} y1=${Y0} x2=${sx(n0)} y2=${Y1} stroke="var(--ok)" strokeWidth="2" strokeDasharray="5 4" />
      <text x=${sx(n0)} y=${Y0 + 22} textAnchor="middle" fontSize="16" fill="var(--ok)" style=${{ fill: 'var(--ok)' }} fontWeight="700">n₀ = ${n0}</text>
      <text x=${X1} y=${Y0 + 22} textAnchor="end" fontSize="16">n</text>
      <text x=${X0 - 6} y=${Y0 + 5} textAnchor="end" fontSize="15">0</text>
      <text x=${X0 - 6} y=${Y1 + 10} textAnchor="end" fontSize="15">${d.ymax}</text>
      <polyline points=${pts(g)} fill="none" stroke="var(--pen)" strokeWidth="2.5" />
      ${d.g2 && html`<polyline points=${pts(d.g2)} fill="none" stroke="var(--pen)" strokeWidth="2.5" strokeDasharray="6 4" />`}
      <polyline points=${pts(d.f)} fill="none" stroke="var(--fig-k)" strokeWidth="3" />
      <line x1=${sx(n)} y1=${Y0} x2=${sx(n)} y2=${Y1} stroke="var(--ink)" strokeWidth="1" opacity=".5" />
      <circle cx=${sx(n)} cy=${sy(d.f(n))} r="5" fill="var(--fig-k)" />
      <circle cx=${sx(n)} cy=${sy(g(n))} r="5" fill="var(--pen)" />
      ${d.g2 && html`<circle cx=${sx(n)} cy=${sy(d.g2(n))} r="5" fill="var(--pen)" />`}
    </svg>`;
  }
  function Asym() {
    const [t, setT] = useState(0), [ns, setNs] = useState(ASY.map(d => d.tab === 'ω' ? 6 : d.n0 + (d.hi - d.n0) / 2)), [c, setC] = useState(4);
    const d = ASY[t], n = ns[t], g = d.tab === 'ω' ? c * n : d.g(n), f = d.f(n), g2 = d.g2 ? d.g2(n) : null;
    const n0 = d.tab === 'ω' ? Math.floor(c) + 1 : d.n0, holds = d.ok(f, g, g2);
    const gl = d.tab === 'ω' ? `${c}·n` : d.gl;
    const cap = holds ? (n >= n0 ? `At n = ${fmt(n)} the inequality ${d.rel} holds, as it must for every n ≥ n<sub>0</sub> = ${n0}.` : `At n = ${fmt(n)} it happens to hold, but the definition only asks for n ≥ n<sub>0</sub> = ${n0}.`)
      : `At n = ${fmt(n)} it fails (n &lt; n<sub>0</sub> = ${n0}): the definition allows that, it only needs ${d.rel} from n<sub>0</sub> on.`;
    return html`<figure className="fig"><div className="fig-stage">
      <${Tabs} items=${ASY.map(x => x.tab)} v=${t} set=${setT} />
      <div className="a3-box" dangerouslySetInnerHTML=${H(d.def)}></div>
      <div className="a3-read" dangerouslySetInnerHTML=${H(d.ex)}></div>
      <${AsymPlot} d=${d} n=${n} c=${c} />
      <div className="a3-read"><span className="a3-k">f(n) = ${d.fl}</span> · <span className="a3-p">${d.g2 ? 'bounds ' + d.gl2 + ' and ' + gl : 'c·g(n) = ' + gl}</span></div>
      <input className="a3-rng" type="range" min=${d.lo} max=${d.hi} step=${d.st} value=${n} aria-label="n" onChange=${e => { const v = +e.target.value; setNs(a => a.map((x, j) => j === t ? v : x)); }} />
      ${d.tab === 'ω' && html`<div className="a3-read">c = ${c}<input className="a3-rng" type="range" min="1" max="10" step="1" value=${c} aria-label="c" onChange=${e => setC(+e.target.value)} /></div>`}
      <div className="a3-read">n = ${fmt(n)}: f(n) = ${fmt(f)}, ${d.g2 ? `¼n² = ${fmt(g2)}, ½n² = ${fmt(g)}` : `c·g(n) = ${fmt(g)}`} <b className=${holds ? 'a3-g' : 'a3-p'}>${holds ? '✓' : '✗'}</b></div>
      </div><${Cap} en=${cap} /></figure>`;
  }

  /* ── slides 9 and 12: BINARY-SEARCH costs and iterating T(n) = c + T(n/2) ── */
  function BsIter() {
    const code = [['BINARY-SEARCH (A, lo, hi, x)', ''], ['  if (lo > hi)', 'constant c₁'], ['    return FALSE', ''], ['  mid ← ⌊(lo+hi)/2⌋', 'constant c₂'], ['  if x = A[mid]', 'constant c₃'], ['    return TRUE', ''],
      ['  if ( x < A[mid] )', ''], ['    BINARY-SEARCH (A, lo, mid-1, x)', 'size n/2'], ['  if ( x > A[mid] )', ''], ['    BINARY-SEARCH (A, mid+1, hi, x)', 'size n/2']];
    const lines = ['T(n) = c + T(n/2)', '= c + c + T(n/4)', '= c + c + c + T(n/8)', '= c + c + … + c + T(1)   (k times, n = 2<sup>k</sup>)', '= c lg n + T(1) = Θ(lg n)'];
    const steps = [
      { hl: [], ln: 0, en: 'BINARY-SEARCH on an array of n elements (slide 9). T(n) is its running time.' },
      { hl: [1, 3, 4], ln: 0, en: 'The tests and the middle index each take constant time c<sub>1</sub>, c<sub>2</sub>, c<sub>3</sub>; together call it c.' },
      { hl: [7, 9], ln: 1, en: 'Only <b>one</b> of the two recursive calls runs, on half the array: <b>T(n) = c + T(n/2)</b>.' },
      { hl: [], ln: 2, en: 'Iterate (slide 12): substitute T(n/2) = c + T(n/4).' },
      { hl: [], ln: 3, en: 'Substitute again, T(n/4) = c + T(n/8): one more c for each halving.' },
      { hl: [], ln: 4, chain: 1, en: 'Assume n = 2<sup>k</sup>: halving k times reaches T(1), so there are k copies of c. For n = 16: 16 → 8 → 4 → 2 → 1 is k = 4 halvings.' },
      { hl: [], ln: 5, chain: 1, en: 'k = lg n, so T(n) = c lg n + T(1) = <b>Θ(lg n)</b>.' }
    ];
    const [i, ctl] = useSteps(steps.length, 2200), s = steps[i];
    return html`<figure className="fig"><div className="fig-stage">
      <div className="a3-box a3-code">${code.map((l, j) => html`<div key=${j} className=${s.hl.includes(j) ? 'on' : ''} style=${{ marginLeft: (l[0].match(/^ */)[0].length * 6) + 'px' }}><span>${l[0].trim()}</span>${l[1] && html`<i>${l[1]}</i>`}</div>`)}</div>
      ${s.ln > 0 && html`<div className="a3-lines" style=${{ marginTop: '10px' }}>${lines.slice(0, s.ln).map((l, j) => html`<div key=${j} className=${'a3-ln' + (j === s.ln - 1 ? ' on' : '')} dangerouslySetInnerHTML=${H(l)}></div>`)}</div>`}
      ${s.chain && html`<div className="a3-chain">${[16, 8, 4, 2, 1].map((v, j) => html`<span key=${j} style=${{ display: 'contents' }}>${j > 0 && html`<span className="a3-arw">+c →</span>`}<span className="a3-chip">${v}</span></span>`)}</div>`}
      </div><${Cap} en=${s.en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  /* ── slides 13-14: iterating T(n) = n + 2T(n/2), and the handwritten T(1) = 4, T(n) = 2T(n/2) + 4n ── */
  function IterN() {
    const L13 = ['T(n) = n + 2T(n/2)', '= n + 2(n/2 + 2T(n/4))', '= n + n + 4T(n/4)', '= n + n + 4(n/4 + 2T(n/8))', '= n + n + n + 8T(n/8)', '… = i·n + 2<sup>i</sup>T(n/2<sup>i</sup>)', '= k·n + 2<sup>k</sup>T(1)   (n = 2<sup>k</sup>, i = k)', '= n lg n + n·T(1) = Θ(n lg n)'];
    const L14 = ['T(1) = 4, T(n) = 2T(n/2) + 4n', '= 2<sup>2</sup>T(n/2<sup>2</sup>) + 4n + 4n', '= 2<sup>3</sup>T(n/2<sup>3</sup>) + 4n + 4n + 4n', '= 2<sup>i</sup>T(n/2<sup>i</sup>) + i(4n)', 'n/2<sup>i</sup> = 1 ⇒ n = 2<sup>i</sup> ⇒ i = log<sub>2</sub>n', '= n·T(1) + (log<sub>2</sub>n)(4n) = 4n + 4n log<sub>2</sub>n = Θ(n log n)'];
    const caps13 = ['Slide 13: T(n) = n + 2T(n/2). Write the next level aside: T(n/2) = n/2 + 2T(n/4).', 'Substitute T(n/2).', 'Multiply out: 2·(n/2) = n, so one more n.', 'Substitute T(n/4) = n/4 + 2T(n/8).', 'Each level adds another n.', 'After i substitutions: <b>i·n + 2<sup>i</sup>T(n/2<sup>i</sup>)</b>.', 'Stop when n/2<sup>i</sup> = 1, i.e. i = k with n = 2<sup>k</sup>.', 'k = lg n and 2<sup>k</sup> = n: <b>T(n) = n lg n + n·T(1) = Θ(n lg n)</b>.'];
    const caps14 = ['Slide 14 (handwritten): the same shape with T(1) = 4 and 4n work. Expand it the same way.', 'One expansion: 2[2T(n/2<sup>2</sup>) + 4n/2] + 4n.', 'Each expansion adds another 4n.', 'After i expansions: <b>2<sup>i</sup>T(n/2<sup>i</sup>) + i(4n)</b>.', 'The base case is reached when n/2<sup>i</sup> = 1, so i = log<sub>2</sub>n, and 2<sup>log<sub>2</sub>n</sup> = n.', '<b>T(n) = 4n + 4n log<sub>2</sub>n</b>. Check below: the recursion and the formula agree.'];
    const steps = [...caps13.map((en, j) => ({ en, a: 13, k: j + 1 })), ...caps14.map((en, j) => ({ en, a: 14, k: j + 1 }))];
    const [i, ctl] = useSteps(steps.length, 2100), s = steps[i];
    const L = s.a === 13 ? L13 : L14;
    const rows = []; let T = 4; for (let n = 1; n <= 32; n *= 2) { if (n > 1) T = 2 * T + 4 * n; rows.push([n, T, 4 * n + 4 * n * lg(n)]); }
    return html`<figure className="fig"><div className="fig-stage">
      <div className="a3-lines">${L.slice(0, s.k).map((l, j) => html`<div key=${s.a + '-' + j} className=${'a3-ln' + (j === s.k - 1 ? ' on' : '')} dangerouslySetInnerHTML=${H(l)}></div>`)}</div>
      ${s.a === 14 && s.k === L14.length && html`<div className="a3-box"><table className="a3-tbl"><thead><tr><th>n</th><th>T(n) by the recursion</th><th>4n + 4n log<sub>2</sub>n</th></tr></thead>
        <tbody>${rows.map(r => html`<tr key=${r[0]}><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`)}</tbody></table></div>`}
      </div><${Cap} en=${s.en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  /* ── slides 15-20: the substitution method on the four slide examples ── */
  const SUB = [
    { tab: 'T(n/2) + 1', sl: 17, ln: [['Recurrence', 'T(n) = 1 + T(n/2)'], ['Guess', 'T(n) = O(lg n)'], ['Goal', 'T(n) ≤ c lg n, for some c and n ≥ n<sub>0</sub>'], ['Hypothesis', 'T(n/2) ≤ c lg(n/2)'],
      ['Proof', 'T(n) = T(n/2) + 1 ≤ c lg(n/2) + 1'], ['', '= c lg n − c + 1 ≤ c lg n'], ['Condition', '−c + 1 ≤ 0 ⇔ <b>c ≥ 1</b>']],
      cap: ['Slide 17: binary search, T(n) = 1 + T(n/2).', 'Step 1: guess the answer.', 'Induction goal: the O-definition with a constant c.', 'Strong induction: assume the bound for the smaller input n/2.', 'Use the hypothesis on T(n/2).', 'lg(n/2) = lg n − 1, so c lg(n/2) = c lg n − c.', 'The goal holds when −c + 1 ≤ 0, so any <b>c ≥ 1</b> works.'] },
    { tab: 'T(n−1) + n', sl: 18, ln: [['Recurrence', 'T(n) = T(n−1) + n'], ['Guess', 'T(n) = O(n<sup>2</sup>)'], ['Goal', 'T(n) ≤ cn<sup>2</sup>, for some c and n ≥ n<sub>0</sub>'], ['Hypothesis', 'T(n−1) ≤ c(n−1)<sup>2</sup>'],
      ['Proof', 'T(n) = T(n−1) + n ≤ c(n−1)<sup>2</sup> + n'], ['', '= cn<sup>2</sup> − (2cn − c − n) ≤ cn<sup>2</sup>'], ['Condition', '2cn − c − n ≥ 0 ⇔ c ≥ n/(2n−1)']],
      tbl: 1, cap: ['Slide 18: T(n) = T(n−1) + n.', 'Guess O(n<sup>2</sup>).', 'Goal T(n) ≤ cn<sup>2</sup>.', 'Hypothesis for the smaller input n−1.', 'Use the hypothesis on T(n−1).', 'c(n−1)<sup>2</sup> + n = cn<sup>2</sup> − 2cn + c + n = cn<sup>2</sup> − (2cn − c − n).', 'Need 2cn − c − n ≥ 0, i.e. c ≥ n/(2n−1). This is largest at n = 1, where it is 1, so <b>any c ≥ 1 works</b>.'] },
    { tab: '3T(n/4) + n²', sl: 19, ln: [['Recurrence', 'T(n) = 3T(n/4) + n<sup>2</sup>'], ['Guess', 'T(n) = O(n<sup>2</sup>)'], ['Goal', 'T(n) ≤ dn<sup>2</sup>, for some d and n ≥ n<sub>0</sub>'], ['Hypothesis', 'T(n/4) ≤ d(n/4)<sup>2</sup>'],
      ['Proof', 'T(n) = 3T(n/4) + n<sup>2</sup> ≤ 3d(n/4)<sup>2</sup> + n<sup>2</sup>'], ['', '= (3/16)dn<sup>2</sup> + n<sup>2</sup> ≤ dn<sup>2</sup>'], ['Condition', '(3/16)d + 1 ≤ d ⇔ <b>d ≥ 16/13</b>']],
      cap: ['Slide 19: T(n) = 3T(n/4) + n<sup>2</sup>.', 'Guess O(n<sup>2</sup>).', 'Goal T(n) ≤ dn<sup>2</sup>.', 'Hypothesis for n/4.', 'Use it on the three calls.', '3d(n/4)<sup>2</sup> = (3/16)dn<sup>2</sup>.', '(3/16)d + 1 ≤ d ⇔ 1 ≤ (13/16)d ⇔ <b>d ≥ 16/13</b>. Therefore T(n) = O(n<sup>2</sup>).'] },
    { tab: '2T(n/2) + n', sl: 20, ln: [['Recurrence', 'T(n) = 2T(n/2) + n'], ['Guess', 'T(n) = O(n lg n)'], ['Goal', 'T(n) ≤ cn lg n, for some c and n ≥ n<sub>0</sub>'], ['Hypothesis', 'T(n/2) ≤ c(n/2) lg(n/2)'],
      ['Proof', 'T(n) = 2T(n/2) + n ≤ 2c(n/2) lg(n/2) + n'], ['', '= cn lg n − cn + n ≤ cn lg n'], ['Condition', '−cn + n ≤ 0 ⇔ <b>c ≥ 1</b>']],
      cap: ['Slide 20: T(n) = 2T(n/2) + n.', 'Guess O(n lg n).', 'Goal T(n) ≤ cn lg n.', 'Hypothesis for n/2.', 'Use it on both calls.', '2c(n/2)(lg n − 1) = cn lg n − cn.', '−cn + n ≤ 0 ⇔ <b>c ≥ 1</b>.'] }
  ];
  function SubOne({ ex, head }) {
    const steps = ex.cap.map(en => ({ en }));
    const [i, ctl] = useSteps(steps.length, 2300);
    return html`<div className="fig-stage">${head}<div className="a3-lines">${ex.ln.slice(0, i + 1).map((l, j) => html`<div key=${j} className=${'a3-ln' + (j === i ? ' on' : '')}>${l[0] && html`<span className="a3-tag">${l[0]}</span>`}<span dangerouslySetInnerHTML=${H(l[1])}></span></div>`)}</div>
      ${ex.tbl && i === steps.length - 1 && html`<div className="a3-box"><table className="a3-tbl"><thead><tr><th>n</th>${[1, 2, 3, 4, 10].map(n => html`<th key=${n}>${n}</th>`)}</tr></thead>
        <tbody><tr><td>n/(2n−1)</td>${[1, 2, 3, 4, 10].map(n => html`<td key=${n}>${fmt(n / (2 * n - 1))}</td>`)}</tr></tbody></table></div>`}
      </div><${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} />`;
  }
  function Subst() {
    const [t, setT] = useState(0);
    const head = html`<${Tabs} items=${SUB.map(x => x.tab)} v=${t} set=${setT} />
      <div className="a3-read a3-mut" style=${{ marginBottom: '8px' }}>1. Guess a solution. 2. Use (strong) induction to prove it works (slides 15-16).</div>`;
    return html`<figure className="fig"><${SubOne} key=${t} ex=${SUB[t]} head=${head} /></figure>`;
  }

  /* ── slide 22: recursion tree of T(n) = T(n/4) + T(n/2) + n² ── */
  function TreeSq() {
    const N = [[150, 24, 'n²', 0], [80, 84, '(n/4)²', 1], [220, 84, '(n/2)²', 1], [38, 144, '(n/16)²', 2], [112, 144, '(n/8)²', 2], [188, 144, '(n/8)²', 2], [262, 144, '(n/4)²', 2]];
    const E = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]];
    const sums = ['Level 0: n<sup>2</sup>', 'Level 1: n<sup>2</sup>/16 + n<sup>2</sup>/4 = <b>(5/16) n<sup>2</sup></b>', 'Level 2: (1/256 + 1/64 + 1/64 + 1/16) n<sup>2</sup> = <b>(25/256) n<sup>2</sup></b> = (5/16)<sup>2</sup> n<sup>2</sup>'];
    const steps = [
      { en: 'Solve T(n) = T(n/4) + T(n/2) + n<sup>2</sup>. The root costs n<sup>2</sup> and has children of sizes n/4 and n/2.' },
      { en: 'Level 1 costs (n/4)<sup>2</sup> + (n/2)<sup>2</sup> = (5/16) n<sup>2</sup>.' },
      { en: 'Level 2 costs (25/256) n<sup>2</sup> = (5/16)<sup>2</sup> n<sup>2</sup>: each level is 5/16 of the one above.' },
      { en: 'The tree goes on until Θ(1) leaves (the n/4 branch ends first, the n/2 branch last).' },
      { en: 'Total = n<sup>2</sup>(1 + 5/16 + (5/16)<sup>2</sup> + (5/16)<sup>3</sup> + …), a geometric series ≤ n<sup>2</sup>/(1 − 5/16) = (16/11) n<sup>2</sup>, so <b>Θ(n<sup>2</sup>)</b>.' }
    ];
    const [i, ctl] = useSteps(steps.length, 2300);
    const lv = j => j === 0 ? 0 : j <= 2 ? 1 : 2;
    return html`<figure className="fig"><div className="fig-stage">
      <svg className="a3-svg" viewBox="0 0 300 210" role="img" aria-label="Recursion tree of T(n) = T(n/4) + T(n/2) + n squared">
        ${E.map(([a, b], j) => html`<line key=${j} className="a3-fade" style=${{ opacity: i >= N[b][3] ? 1 : 0 }} x1=${N[a][0]} y1=${N[a][1] + 8} x2=${N[b][0]} y2=${N[b][1] - 16} stroke="var(--graphite)" strokeWidth="1.5" />`)}
        ${N.map((d, j) => html`<text key=${j} className="a3-fade" style=${{ opacity: i >= d[3] ? 1 : 0 }} x=${d[0]} y=${d[1]} textAnchor="middle" fontSize="17" style=${{ fill: 'var(--fig-k)' }} fontWeight="600">${d[2]}</text>`)}
        <g className="a3-fade" style=${{ opacity: i >= 3 ? 1 : 0 }}>
          <line x1="38" y1="152" x2="38" y2="178" stroke="var(--graphite)" strokeWidth="1.5" strokeDasharray="2 4" />
          <text x="38" y="200" textAnchor="middle" fontSize="17" fontWeight="600">Θ(1)</text>
          ${[112, 188, 262].map(x => html`<text key=${x} x=${x} y="176" textAnchor="middle" fontSize="18">⋮</text>`)}
        </g>
      </svg>
      <div className="a3-lines">${sums.slice(0, Math.min(i + 1, 3)).map((l, j) => html`<div key=${j} className=${'a3-ln' + (j === i ? ' on' : '')} dangerouslySetInnerHTML=${H(l)}></div>`)}
        ${i >= 4 && html`<div className="a3-ln on">Total = n<sup>2</sup>(1 + 5/16 + (5/16)<sup>2</sup> + …) = <b>Θ(n<sup>2</sup>)</b> (geometric series)</div>`}</div>
      </div><${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  /* ── slide 23 (handwritten): recursion tree of T(1) = 4, T(n) = 2T(n/2) + 4n, drawn for n = 8 ── */
  function Tree4n() {
    const n = 8, levels = [1, 2, 4, 8];
    const val = d => d === 3 ? 4 : 4 * n / 2 ** d;
    const pos = (d, j) => { const w = 300 / levels[d]; return w * j + w / 2; };
    const sym = ['4n', '4n/2', '4n/2²', 'T(1) = 4'];
    const steps = [
      { en: 'i = 0: one call T(n), cost 4n. For n = 8 that is 32.' },
      { en: 'i = 1: 2 calls T(n/2), each 4n/2. Row sum 2 · 4n/2 = <b>4n</b> (= 32).' },
      { en: 'i = 2: 2<sup>2</sup> calls T(n/2<sup>2</sup>), each 4n/2<sup>2</sup>. Row sum again <b>4n</b>.' },
      { en: 'Last row: n/2<sup>i</sup> = 1 ⇒ i = log<sub>2</sub>n. There are n leaves, each T(1) = 4: row sum 4n again.' },
      { en: 'Σ<sub>i=0</sub><sup>log₂n</sup> 4n = 4n(log<sub>2</sub>n + 1) = 4n log<sub>2</sub>n + 4n = Θ(n log n). For n = 8: 32 · 4 = <b>128</b>.' }
    ];
    const [i, ctl] = useSteps(steps.length, 2200);
    const rows = [['0', '1', '4n', '32'], ['1', '2', '4n/2', '32'], ['2', '2²', '4n/2²', '32'], ['log₂n', 'n', '4', '32']];
    return html`<figure className="fig"><div className="fig-stage">
      <svg className="a3-svg" viewBox="0 0 300 186" role="img" aria-label="Recursion tree for n = 8 with each node's cost">
        ${levels.map((m, d) => Array.from({ length: m }, (_, j) => html`<g key=${d + '-' + j} className="a3-fade" style=${{ opacity: i >= d ? 1 : 0 }}>
          ${d > 0 && html`<line x1=${pos(d - 1, j >> 1)} y1=${(d - 1) * 50 + 30} x2=${pos(d, j)} y2=${d * 50 + 6} stroke="var(--graphite)" strokeWidth="1.5" />`}
          <circle cx=${pos(d, j)} cy=${d * 50 + 20} r="15" fill=${d === 3 ? 'color-mix(in srgb, var(--ok) 25%, var(--paper))' : 'color-mix(in srgb, var(--fig-k) 20%, var(--paper))'} stroke=${d === 3 ? 'var(--ok)' : 'var(--fig-k)'} strokeWidth="1.5" />
          <text x=${pos(d, j)} y=${d * 50 + 26} textAnchor="middle" fontSize="16" fontWeight="600">${val(d)}</text></g>`))}
      </svg>
      <div className="a3-box"><table className="a3-tbl"><thead><tr><th>i</th><th>nodes</th><th>each</th><th>row sum (n = 8)</th></tr></thead>
        <tbody>${rows.map((r, d) => html`<tr key=${d} className=${i === d ? 'on' : ''} style=${{ opacity: i >= d ? 1 : .25 }}><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>4n = ${r[3]}</td></tr>`)}
        <tr className=${i === 4 ? 'on' : ''} style=${{ opacity: i >= 4 ? 1 : .25 }}><td colSpan="3">Total 4n(log₂n + 1)</td><td>128</td></tr></tbody></table></div>
      </div><${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  /* ── slides 24-30: the master method on the slide examples, or your own a, b, f(n) = n^p lg^k n ── */
  const PRE = [{ s: 26, a: 2, b: 2, p: 1, k: 0 }, { s: 27, a: 2, b: 2, p: 2, k: 0 }, { s: 28, a: 2, b: 2, p: .5, k: 0 }, { s: 29, a: 3, b: 4, p: 1, k: 1 }, { s: 30, a: 2, b: 2, p: 1, k: 1 }];
  const fS = (p, k) => { const P = p === 0 ? '' : p === 1 ? 'n' : p === .5 ? '√n' : `n<sup>${p}</sup>`; const K = k === 0 ? '' : k === 1 ? 'lg n' : `lg<sup>${k}</sup> n`; return (P + (P && K ? ' ' : '') + K) || '1'; };
  const nE = E => Math.abs(E - Math.round(E)) < 1e-9 ? (Math.round(E) === 0 ? '1' : Math.round(E) === 1 ? 'n' : `n<sup>${Math.round(E)}</sup>`) : `n<sup>${E.toFixed(3)}</sup>`;
  function master(c) {
    const { a, b, p, k } = c, E = Math.log(a) / Math.log(b), eq = Math.abs(p - E) < 1e-9, f = fS(p, k);
    const Es = Math.abs(E - Math.round(E)) < 1e-9 ? String(Math.round(E)) : E.toFixed(3);
    const out = { E, Es, f };
    if (!eq && p < E) Object.assign(out, { cs: 1, d: `f(n) = ${f} = O(n<sup>${Es} − ε</sup>) with ε = ${fmt(E - p)}: f is polynomially <b>smaller</b> ⇒ <b>Case 1</b>.`, T: `Θ(${nE(E)})` });
    else if (eq && k === 0) Object.assign(out, { cs: 2, d: `f(n) = Θ(${nE(E)}): same size as n<sup>log<sub>b</sub>a</sup> ⇒ <b>Case 2</b>.`, T: `Θ(${nE(E) === '1' ? '' : nE(E) + ' '}lg n)` });
    else if (eq) Object.assign(out, { cs: 0, d: `f(n) = ${f} looks larger than ${nE(E)}, so case 3 seems to apply, but it is larger only by lg${k > 1 ? '<sup>' + k + '</sup>' : ''} n, not by a polynomial factor n<sup>ε</sup>: <b>none of the three cases applies</b> (slide 30).`,
      x: `The extended case 2 (Lecture 4, slide 5: f(n) = Θ(n<sup>log<sub>b</sub>a</sup> lg<sup>k</sup> n), k ≥ 0) gives Θ(${nE(E) === '1' ? '' : nE(E) + ' '}lg<sup>${k + 1}</sup> n).`, T: '?' });
    else { const cc = a / b ** p; Object.assign(out, { cs: 3, d: `f(n) = ${f} = Ω(n<sup>${Es} + ε</sup>) with ε = ${fmt(p - E)}: f is polynomially <b>larger</b> ⇒ <b>Case 3</b>.`,
      r: `Regularity: a·f(n/b) = ${a}·${fS(p, k).replace(/n/g, `(n/${b})`)} ≤ ${fmt(cc)}·f(n), so c = ${a}/${b}${p === 1 ? '' : '<sup>' + p + '</sup>'} = ${fmt(cc)} &lt; 1 ✓`, T: `Θ(${f})` }); }
    return out;
  }
  function MasterRun({ c, head }) {
    const m = master(c), Ex = m.E, P = c.p, top = Math.max(Ex, P) + 1, sx = v => 24 + v / top * 272;
    const steps = [
      { en: `T(n) = ${c.a}T(n/${c.b}) + ${m.f}: a = ${c.a} ≥ 1, b = ${c.b} &gt; 1, f(n) = ${m.f}.` },
      { en: `Compute n<sup>log<sub>b</sub>a</sup> = n<sup>log<sub>${c.b}</sub>${c.a}</sup> = ${nE(Ex)}${Math.abs(Ex - Math.round(Ex)) > 1e-9 ? ` (log<sub>${c.b}</sub>${c.a} ≈ ${m.Es}${c.a === 3 && c.b === 4 ? '; the slide shows 0.793' : ''})` : ''}.` },
      { en: `Compare the exponents: f(n) has n<sup>${fmt(P)}</sup>${c.k ? ' times lg' + (c.k > 1 ? '<sup>' + c.k + '</sup>' : '') + ' n' : ''}, the watershed has n<sup>${m.Es}</sup>.` },
      { en: m.d + (m.r ? ' ' + m.r : '') },
      { en: m.cs ? `<b>T(n) = ${m.T}</b>.` : `The basic master method fails. ${m.x}` }
    ];
    const [i, ctl] = useSteps(steps.length, 2300);
    return html`<div className="fig-stage">${head}<svg className="a3-svg" viewBox="0 0 320 96" role="img" aria-label="Exponent line comparing log base b of a with the exponent of f">
        <line x1="24" y1="50" x2="300" y2="50" stroke="var(--graphite)" strokeWidth="1.5" />
        ${Array.from({ length: Math.floor(top) + 1 }, (_, j) => html`<g key=${j}><line x1=${sx(j)} y1="45" x2=${sx(j)} y2="55" stroke="var(--graphite)" /><text x=${sx(j)} y="88" textAnchor="middle" fontSize="15">${j}</text></g>`)}
        <g className="a3-fade" style=${{ opacity: i >= 1 ? 1 : 0 }}><circle cx=${sx(Ex)} cy="50" r="7" fill="var(--pen)" /><text x=${sx(Ex)} y="28" textAnchor="middle" fontSize="15" fill="var(--pen)" style=${{ fill: 'var(--pen)' }} fontWeight="700">log${' '}b a</text></g>
        <g className="a3-fade" style=${{ opacity: i >= 2 ? 1 : 0 }}><rect x=${sx(P) - 6} y="44" width="12" height="12" fill="var(--fig-k)" transform=${`rotate(45 ${sx(P)} 50)`} /><text x=${sx(P)} y=${Math.abs(P - Ex) * 272 / top < 40 ? 72 : 28} textAnchor="middle" fontSize="15" fill="var(--fig-k)" style=${{ fill: 'var(--fig-k)' }} fontWeight="700">f(n)</text></g>
      </svg>
      <div className="a3-box" style=${{ textAlign: 'center' }}><b>${m.cs === 0 ? 'No case' : i >= 3 ? 'Case ' + m.cs : 'Case ?'}</b> · T(n) = ${i >= 4 ? html`<b dangerouslySetInnerHTML=${H(m.T === '?' ? 'not by the basic method' : m.T)}></b>` : '?'}</div>
      </div><${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} />`;
  }
  function Master() {
    const [t, setT] = useState(0), [own, setOwn] = useState({ a: '4', b: '2', p: '3', k: '0' }), [cfg, setCfg] = useState(PRE[0]), [err, setErr] = useState('');
    const pick = j => { setT(j); setErr(''); if (j < PRE.length) setCfg(PRE[j]); };
    const run = () => { const a = +own.a, b = +own.b, p = +own.p, k = +own.k;
      if (!Number.isInteger(a) || a < 1 || a > 64) return setErr('a must be a whole number from 1 to 64.');
      if (!(b > 1) || b > 16) return setErr('b must be a number with 1 < b ≤ 16.');
      if (!(p >= 0) || p > 5 || own.p.trim() === '') return setErr('p must be a number from 0 to 5.');
      if (!Number.isInteger(k) || k < 0 || k > 3) return setErr('k must be 0, 1, 2 or 3.');
      setErr(''); setCfg({ a, b, p, k, s: 0, id: Date.now() }); };
    const set = (f, v) => setOwn(o => Object.assign({}, o, { [f]: v }));
    const head = html`<${Tabs} items=${[...PRE.map(x => 'Slide ' + x.s), 'Try your own']} v=${t} set=${pick} />
      <div className="a3-box a3-mut" style=${{ textAlign: 'center' }}>T(n) = aT(n/b) + f(n), a ≥ 1, b > 1. Compare f(n) with n<sup>log<sub>b</sub>a</sup> (slides 24-25).</div>
      ${t === PRE.length && html`<div className="a3-form">
        <label>a <input value=${own.a} onChange=${e => set('a', e.target.value)} inputMode="numeric" /></label>
        <label>b <input value=${own.b} onChange=${e => set('b', e.target.value)} inputMode="decimal" /></label>
        <span>f(n) = n<sup>p</sup> lg<sup>k</sup> n:</span>
        <label>p <input value=${own.p} onChange=${e => set('p', e.target.value)} inputMode="decimal" /></label>
        <label>k <input value=${own.k} onChange=${e => set('k', e.target.value)} inputMode="numeric" /></label>
        <button className="fig-btn solid" onClick=${run}>Solve</button></div>`}
      ${err && html`<div className="a3-err">${err}</div>`}
      <div className="a3-read" style=${{ fontSize: '1.02rem', margin: '8px 0 2px' }}>T(n) = ${cfg.a}T(n/${cfg.b}) + <span dangerouslySetInnerHTML=${H(fS(cfg.p, cfg.k))}></span></div>`;
    return html`<figure className="fig"><${MasterRun} key=${JSON.stringify(cfg)} c=${cfg} head=${head} /></figure>`;
  }

  window.FIGS = Object.assign(window.FIGS || {}, {
    'ag-3-bs-iter': BsIter, 'ag-3-iter-n': IterN, 'ag-3-asym': Asym, 'ag-3-subst': Subst,
    'ag-3-tree-sq': TreeSq, 'ag-3-tree-4n': Tree4n, 'ag-3-master': Master
  });
})();
/* ── part L4 ── */
// Algorithms visuals, Lecture 4 (Divide & Conquer): D&C recurrences (slides 2-6, 14-15, 32-34, 40-45), binary search (8-13), powering (16-18),
// Fibonacci (19-26), matrix multiplication and Strassen (27-45), VLSI layout and the H-tree (46-53). Every label and number comes from the slides.
(function () {
  const { useState, useEffect, useRef, useMemo } = React;
  const { html, useSteps, Cap, Bar, pop, calm, useClock, useFit, sec } = window.FIGKIT;
  const CSS = `
.a4-tabs{ display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin:0 0 10px; }
.a4-tabs .fig-btn{ padding:4px 11px; min-height:32px; }
.fig-btn.a4-on{ background:var(--fig-s); color:#fff; border-color:transparent; }
.fig-btn:disabled{ opacity:.45; cursor:default; }
.a4-box{ max-width:520px; margin:0 auto; background:var(--paper); border:1px solid var(--line); border-radius:10px; padding:8px 10px; color:var(--ink); font-size:.92rem; line-height:1.5; overflow-wrap:anywhere; }
.a4-sp{ margin-top:10px; }
.a4-k{ color:var(--fig-k); font-weight:700; } .a4-p{ color:var(--pen); font-weight:700; } .a4-g{ color:var(--ok); font-weight:700; }
.a4-mut{ color:var(--graphite); font-size:.86rem; }
.a4-c{ text-align:center; }
.a4-lines{ max-width:520px; margin:0 auto; display:grid; gap:4px; }
.a4-ln{ padding:3px 8px; border-radius:6px; font-size:.95rem; line-height:1.45; color:var(--ink); transition:background .4s, opacity .4s; overflow-wrap:anywhere; }
.a4-ln.on{ background:color-mix(in srgb, var(--fig-k) 18%, var(--paper)); box-shadow:inset 3px 0 0 var(--fig-k); }
.a4-ln.dim{ opacity:.35; }
.a4-tag{ display:inline-block; font-size:.76rem; font-weight:700; color:var(--fig-k); text-transform:uppercase; letter-spacing:.04em; margin-right:6px; }
.a4-rec{ display:flex; flex-wrap:nowrap; align-items:center; justify-content:center; gap:2px 4px; font-size:1.15rem; color:var(--ink); }
.a4-rec > span{ white-space:nowrap; }
.a4-pt{ display:flex; flex-direction:column; align-items:center; border-radius:8px; padding:3px 6px; transition:background .4s, box-shadow .4s; }
.a4-pt b{ font-weight:700; }
.a4-pt i{ font-style:normal; font-size:.74rem; line-height:1.2; color:var(--graphite); max-width:96px; text-align:center; opacity:0; transition:opacity .4s; }
.a4-pt.on{ background:color-mix(in srgb, var(--fig-k) 18%, var(--paper)); box-shadow:0 0 0 1.5px var(--fig-k); }
.a4-pt.on i, .a4-pt.was i{ opacity:1; }
.a4-steps3{ display:grid; gap:4px; max-width:520px; margin:10px auto 0; }
.a4-arr{ display:flex; justify-content:center; gap:4px; flex-wrap:wrap; }
.a4-cell{ width:34px; text-align:center; }
.a4-cell b{ display:flex; align-items:center; justify-content:center; height:34px; border-radius:50%; font-size:1.02rem; font-weight:600; color:var(--fig-k); transition:background .4s, box-shadow .4s; }
.a4-cell i{ display:block; font-style:normal; font-size:.76rem; color:var(--graphite); }
.a4-cell.in b{ background:color-mix(in srgb, var(--pen) 20%, var(--paper)); border-radius:7px; }
.a4-cell.mid b{ box-shadow:0 0 0 3px var(--fig-k); border-radius:50%; background:color-mix(in srgb, var(--ok) 30%, var(--paper)); color:var(--ink); }
.a4-pick{ display:flex; flex-wrap:wrap; gap:5px; justify-content:center; align-items:center; margin:0 0 10px; font-size:.88rem; color:var(--ink); }
.a4-pick .fig-btn{ padding:3px 9px; min-height:30px; font-size:.84rem; }
.a4-form{ display:flex; flex-wrap:wrap; gap:8px; align-items:center; justify-content:center; font-size:.9rem; color:var(--ink); margin:0 0 8px; }
.a4-form label{ display:flex; gap:4px; align-items:center; }
.a4-form input{ width:52px; font:inherit; padding:3px 5px; border:1px solid var(--line); border-radius:6px; background:var(--paper); color:var(--ink); }
.a4-err{ color:var(--pen); font-size:.88rem; text-align:center; margin:0 0 6px; }
.a4-tbl{ width:100%; border-collapse:collapse; font-size:.9rem; color:var(--ink); }
.a4-tbl th, .a4-tbl td{ border:1px solid var(--line); padding:3px 4px; text-align:center; overflow-wrap:anywhere; }
.a4-tbl th{ background:var(--paper-2); font-weight:600; }
.a4-tbl tr.on td{ background:color-mix(in srgb, var(--fig-k) 18%, var(--paper)); }
.a4-tbl td.l{ text-align:left; }
.a4-mat{ display:inline-grid; grid-template-columns:repeat(var(--c, 2), auto); gap:2px 6px; padding:2px 5px; border-left:2px solid var(--ink); border-right:2px solid var(--ink); border-radius:5px; vertical-align:middle; font-size:.9rem; text-align:center; margin:2px; }
.a4-mat > span{ padding:1px 4px; border-radius:4px; transition:background .4s; }
.a4-mat > span.on{ background:color-mix(in srgb, var(--fig-k) 28%, var(--paper)); }
.a4-tight .a4-mat{ gap:1px 1px; padding:2px 3px; margin:1px; }
.a4-tight .a4-mat > span{ padding:1px 2px; }
.a4-mat > span.ok{ background:color-mix(in srgb, var(--ok) 25%, var(--paper)); }
.a4-eq{ display:flex; flex-wrap:wrap; align-items:center; justify-content:center; gap:4px; font-size:.95rem; color:var(--ink); }
.a4-seq{ display:flex; flex-wrap:wrap; gap:4px; justify-content:center; }
.a4-seq span{ min-width:30px; text-align:center; border:1px solid var(--line); border-radius:6px; background:var(--paper); padding:2px 4px; font-size:.9rem; transition:background .4s, opacity .4s; }
.a4-seq span i{ display:block; font-style:normal; font-size:.74rem; color:var(--graphite); }
.a4-seq span.on{ background:color-mix(in srgb, var(--fig-k) 22%, var(--paper)); }
.a4-chips{ display:flex; flex-wrap:wrap; gap:5px; justify-content:center; }
.a4-chip{ border:1.5px solid var(--fig-k); border-radius:8px; padding:2px 7px; font-size:.95rem; background:var(--paper); color:var(--ink); transition:opacity .5s, background .4s; }
.a4-chip.x{ opacity:.3; text-decoration:line-through; }
.a4-chip.hit{ background:color-mix(in srgb, var(--pen) 22%, var(--paper)); border-color:var(--pen); }
.a4-chip.keep{ background:color-mix(in srgb, var(--ok) 25%, var(--paper)); border-color:var(--ok); }
.a4-grp{ display:inline-flex; flex-wrap:wrap; gap:4px; align-items:center; border:1px dashed var(--line); border-radius:9px; padding:3px 5px; }
.a4-grp > em{ font-style:normal; font-size:.86rem; color:var(--graphite); width:100%; }
.a4-svg text{ font-family:var(--body); }
.a4-fade{ transition:opacity .5s ease; }
.a4-code{ font-family:var(--mono); font-size:.88rem; line-height:1.5; }
.a4-code div{ border-radius:4px; padding:0 4px; transition:background .4s; }
.a4-code div.on{ background:color-mix(in srgb, var(--fig-k) 20%, var(--paper)); }
[data-fig^="ag-4-"] .fig-stage sup, [data-fig^="ag-4-"] .fig-stage sub{ font-size:.85em; }
[data-fig^="ag-4-"] .fig-stage sup sub, [data-fig^="ag-4-"] .fig-stage sub sup{ font-size:1em; }`;
  if (!document.getElementById('a4-css')) { const s = document.createElement('style'); s.id = 'a4-css'; s.textContent = CSS; document.head.appendChild(s); }

  const H = s => ({ __html: s });
  const Tabs = ({ items, v, set }) => html`<div className="a4-tabs" role="tablist">${items.map((t, j) => html`<button key=${j} role="tab" aria-selected=${v === j} className=${'fig-btn' + (v === j ? ' a4-on' : '')} onClick=${() => set(j)} dangerouslySetInnerHTML=${H(t)}></button>`)}</div>`;
  const Mat = ({ m, hl = [], ok = [], c = 2 }) => html`<span className="a4-mat" style=${{ '--c': c }}>${m.flat().map((v, j) => html`<span key=${j} className=${hl.includes(j) ? 'on' : ok.includes(j) ? 'ok' : ''} dangerouslySetInnerHTML=${H(String(v))}></span>`)}</span>`;
  const Lines = ({ ls, i }) => html`<div className="a4-lines">${ls.map((l, j) => html`<div key=${j} className=${'a4-ln' + (j === i ? ' on' : '')} dangerouslySetInnerHTML=${H(l)}></div>`)}</div>`;

  /* ── slides 2-6, 7, 14-15, 30-34, 40-45: the D&C recurrence, part by part, and its master-method solution ── */
  const REC = [
    { tab: 'Merge sort', sl: '3-6', a: '2', b: 'n/2', f: 'Θ(n)', fl: 'work dividing and combining',
      dc: ['<b>Divide:</b> trivial.', '<b>Conquer:</b> recursively sort 2 subarrays.', '<b>Combine:</b> linear-time merge.'],
      w: 'n<sup>log<sub>b</sub>a</sup> = n<sup>log<sub>2</sub>2</sup> = n', cs: 'f(n) = Θ(n) matches n ⇒ <b>Case 2 (k = 0)</b> ⇒ <b>T(n) = Θ(n lg n)</b>.' },
    { tab: 'Binary search', sl: '7, 14-15', a: '1', b: 'n/2', f: 'Θ(1)', fl: 'work dividing and combining',
      dc: ['<b>Divide:</b> check middle element.', '<b>Conquer:</b> recursively search 1 subarray.', '<b>Combine:</b> trivial.'],
      w: 'n<sup>log<sub>b</sub>a</sup> = n<sup>log<sub>2</sub>1</sup> = n<sup>0</sup> = 1', cs: 'f(n) = Θ(1) matches 1 ⇒ <b>Case 2 (k = 0)</b> ⇒ <b>T(n) = Θ(lg n)</b>.' },
    { tab: 'Matrix D&amp;C', sl: '30-34', a: '8', b: 'n/2', f: 'Θ(n<sup>2</sup>)', fl: 'work adding submatrices', sub: '# submatrices', size: 'submatrix size',
      dc: ['<b>Divide:</b> split each n×n matrix into 2×2 blocks of (n/2)×(n/2) submatrices.', '<b>Conquer:</b> 8 recursive multiplications of submatrices.', '<b>Combine:</b> 4 additions of submatrices.'],
      w: 'n<sup>log<sub>b</sub>a</sup> = n<sup>log<sub>2</sub>8</sup> = n<sup>3</sup>', cs: 'n<sup>2</sup> is polynomially smaller than n<sup>3</sup> ⇒ <b>Case 1</b> ⇒ <b>T(n) = Θ(n<sup>3</sup>)</b>: no better than the ordinary algorithm.' },
    { tab: 'Strassen', sl: '40-45', a: '7', b: 'n/2', f: 'Θ(n<sup>2</sup>)', fl: 'work adding submatrices', sub: '# submatrices', size: 'submatrix size',
      dc: ['<b>Divide:</b> partition A and B into (n/2)×(n/2) submatrices; form the terms to be multiplied using + and −.', '<b>Conquer:</b> perform 7 multiplications of (n/2)×(n/2) submatrices recursively.', '<b>Combine:</b> form C using + and − on (n/2)×(n/2) submatrices.'],
      w: 'n<sup>log<sub>b</sub>a</sup> = n<sup>log<sub>2</sub>7</sup> ≈ n<sup>2.81</sup>', cs: 'n<sup>2</sup> is polynomially smaller than n<sup>2.81</sup> ⇒ <b>Case 1</b> ⇒ <b>T(n) = Θ(n<sup>lg 7</sup>)</b>. 2.81 is in the exponent: for n = 32, n<sup>3</sup> = 32,768 but n<sup>lg 7</sup> = 7<sup>5</sup> = 16,807. Best to date: Θ(n<sup>2.376…</sup>), of theoretical interest only.' }
  ];
  function RecOne({ r, head }) {
    const steps = [
      { en: `The divide-and-conquer design for ${r.tab.replace('&amp;', '&')} (slides ${r.sl}).` },
      { en: `<b>${r.a}</b> = the number of subproblems.` },
      { en: `<b>${r.b}</b> = the size of each subproblem.` },
      { en: `<b>${r.f}</b> = the ${r.fl}.` },
      { en: `Master theorem: compare f(n) with ${r.w}.` },
      { en: r.cs }
    ];
    const [i, ctl] = useSteps(steps.length, 2300);
    const pt = (j, v) => html`<span className=${'a4-pt' + (i === j ? ' on' : '')}><b dangerouslySetInnerHTML=${H(v)}></b></span>`;
    const lab = [[1, r.a, r.sub || '# subproblems'], [2, r.b, r.size || 'subproblem size'], [3, r.f, r.fl]].filter(x => i >= x[0]);
    return html`<div className="fig-stage">${head}
      <div className="a4-rec"><span>T(n) =</span>${pt(1, r.a)}<span>T(</span>${pt(2, r.b)}<span>) +</span>${pt(3, r.f)}</div>
      <div className="a4-c" style=${{ minHeight: '1.5em', fontSize: '.88rem', color: 'var(--graphite)' }}>${lab.map(x => html`<span key=${x[0]} style=${{ display: 'inline-block', margin: '0 6px' }}><b className="a4-k" dangerouslySetInnerHTML=${H(x[1])}></b> = ${x[2]}</span>`)}</div>
      <div className="a4-steps3">${r.dc.map((d, j) => html`<div key=${j} className=${'a4-ln' + (i === 0 ? ' on' : '')} dangerouslySetInnerHTML=${H((j + 1) + '. ' + d)}></div>`)}</div>
      ${i >= 4 && html`<div className="a4-box a4-sp a4-c"><div dangerouslySetInnerHTML=${H(r.w)}></div>${i >= 5 && html`<div dangerouslySetInnerHTML=${H(r.cs)}></div>`}</div>`}
      </div><${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} />`;
  }
  function Recur() {
    const [t, setT] = useState(0);
    const head = html`<${Tabs} items=${REC.map(r => r.tab)} v=${t} set=${setT} />`;
    return html`<figure className="fig"><${RecOne} key=${t} r=${REC[t]} head=${head} /></figure>`;
  }

  /* ── slides 8-13: binary search, find 9 in 3 5 7 8 9 12 15 ── */
  const BA = [3, 5, 7, 8, 9, 12, 15];
  function bsTrace(A, x) {
    const st = []; let lo = 1, hi = A.length;
    for (;;) {
      if (lo > hi) { st.push({ lo, hi, mid: 0, en: `lo = ${lo} &gt; hi = ${hi}: no subarray is left, so ${x} is <b>not in the array</b> (return FALSE).` }); break; }
      st.push({ lo, hi, mid: 0, en: lo === 1 && hi === A.length ? `Find ${x} in the sorted array A[1..${A.length}].` : `Conquer: recursively search 1 subarray, A[${lo}..${hi}].` });
      const mid = Math.floor((lo + hi) / 2), v = A[mid - 1];
      if (v === x) { st.push({ lo, hi, mid, en: `Divide: check the middle element, mid = ⌊(${lo}+${hi})/2⌋ = ${mid}. A[${mid}] = ${x}: <b>found</b>. Combine is trivial. T(n) = T(n/2) + Θ(1).` }); break; }
      st.push({ lo, hi, mid, en: `Divide: check the middle element, mid = ⌊(${lo}+${hi})/2⌋ = ${mid}, A[${mid}] = ${v}. ${x} ${x < v ? '&lt;' : '&gt;'} ${v}, so only the ${x < v ? 'left' : 'right'} part can hold ${x}.` });
      if (x < v) hi = mid - 1; else lo = mid + 1;
    }
    return st;
  }
  function BsRun({ x, head }) {
    const steps = useMemo(() => bsTrace(BA, x), [x]);
    const [i, ctl] = useSteps(steps.length, 1700), s = steps[i];
    return html`<div className="fig-stage">${head}
      <div className="a4-arr" role="img" aria-label=${'Array 3 5 7 8 9 12 15, searching for ' + x}>${BA.map((v, j) => { const k = j + 1, cl = (k === s.mid ? ' mid' : k >= s.lo && k <= s.hi ? ' in' : ''); return html`<div key=${j} className=${'a4-cell' + cl}><b>${v}</b><i>${k}</i></div>`; })}</div>
      <div className="a4-c a4-mut" style=${{ marginTop: '6px' }}>lo = ${s.lo}, hi = ${s.hi}${s.mid ? ', mid = ' + s.mid : ''}</div>
      </div><${Cap} en=${s.en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} />`;
  }
  function BSearch() {
    const [x, setX] = useState(9);
    const head = html`<div className="a4-pick"><span>Find:</span>${[...BA, 10].map(v => html`<button key=${v} className=${'fig-btn' + (v === x ? ' a4-on' : '')} onClick=${() => setX(v)}>${v}${v === 9 ? ' (slides)' : ''}</button>`)}</div>`;
    return html`<figure className="fig"><${BsRun} key=${x} x=${x} head=${head} /></figure>`;
  }

  /* ── slides 16-18: powering a number by divide and conquer ── */
  function powSteps(a, n) {
    const ms = []; for (let m = n; ; m = Math.floor(m / 2)) { ms.push(m); if (m <= 1) break; }
    const A = BigInt(a), val = {}; let mults = 0;
    const rule = m => m === 1 ? 'a<sup>1</sup> = a' : m % 2 === 0 ? `a<sup>${m}</sup> = a<sup>${m / 2}</sup> · a<sup>${m / 2}</sup>` : `a<sup>${m}</sup> = a<sup>${(m - 1) / 2}</sup> · a<sup>${(m - 1) / 2}</sup> · a`;
    const steps = [];
    ms.forEach((m, j) => steps.push({ down: j + 1, up: ms.length, en: m === 1 ? 'n = 1: the base case, a<sup>1</sup> = a. Every call made only one recursive call, on ⌊n/2⌋.' : `n = ${m} is ${m % 2 ? 'odd' : 'even'}: ${rule(m)}. Compute a<sup>${Math.floor(m / 2)}</sup> <b>once</b> and reuse it.` }));
    for (let j = ms.length - 1; j >= 0; j--) {
      const m = ms[j], h = Math.floor(m / 2);
      let how;
      if (m === 1) { val[1] = A; how = `${a}`; }
      else { const x = val[h]; val[m] = x * x * (m % 2 ? A : 1n); mults += m % 2 ? 2 : 1; how = m % 2 ? `${x} · ${x} · ${a}` : `${x} · ${x}`; }
      steps.push({ down: ms.length, up: j, how: Object.assign({}, steps.length ? steps[steps.length - 1].how : {}, { [m]: how + ' = ' + val[m] }), en: m === 1 ? `Combine on the way back: a<sup>1</sup> = ${a}.` : `a<sup>${m}</sup> = ${how} = ${val[m]} (${m % 2 ? 2 : 1} multiplication${m % 2 ? 's' : ''}).` });
    }
    steps.push({ down: ms.length, up: 0, how: steps[steps.length - 1].how, en: `<b>${a}<sup>${n}</sup> = ${val[n]}</b> with ${mults} multiplications, against ${n - 1} for the naive Θ(n) loop. T(n) = T(n/2) + Θ(1) ⇒ <b>Θ(lg n)</b>.` });
    return { ms, steps, rule };
  }
  function PowRun({ a, n, head }) {
    const { ms, steps, rule } = useMemo(() => powSteps(a, n), [a, n]);
    const [i, ctl] = useSteps(steps.length, 1600), s = steps[i];
    return html`<div className="fig-stage">${head}
      <table className="a4-tbl"><thead><tr><th>n</th><th>rule (slide 17)</th></tr></thead><tbody>
      ${ms.slice(0, s.down).map((m, j) => html`<tr key=${m} className=${(i < ms.length ? j === s.down - 1 : j === s.up) && i < steps.length - 1 ? 'on' : ''}><td>${m}</td><td className="l"><span dangerouslySetInnerHTML=${H(rule(m))}></span>${s.how && s.how[m] && html`<div className="a4-k" style=${{ overflowWrap: 'anywhere' }}>= ${s.how[m]}</div>`}</td></tr>`)}
      </tbody></table></div><${Cap} en=${s.en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} />`;
  }
  function Power() {
    const [cfg, setCfg] = useState({ a: 2, n: 13 }), [f, setF] = useState({ a: '2', n: '13' }), [err, setErr] = useState('');
    const go = () => { const a = +f.a, n = +f.n; if (!Number.isInteger(a) || a < 1 || a > 9) return setErr('a must be a whole number from 1 to 9.'); if (!Number.isInteger(n) || n < 1 || n > 64) return setErr('n must be a whole number from 1 to 64.'); setErr(''); setCfg({ a, n }); };
    const head = html`<div className="a4-form"><span>Compute a<sup>n</sup>:</span><label>a <input value=${f.a} inputMode="numeric" onChange=${e => setF(o => Object.assign({}, o, { a: e.target.value }))} /></label>
      <label>n <input value=${f.n} inputMode="numeric" onChange=${e => setF(o => Object.assign({}, o, { n: e.target.value }))} /></label><button className="fig-btn solid" onClick=${go}>Run</button></div>
      ${err && html`<div className="a4-err">${err}</div>`}
      <div className="a4-mut a4-c" style=${{ marginBottom: '8px' }}>The slides give no numbers: 2<sup>13</sup> is our example; try your own.</div>`;
    return html`<figure className="fig"><${PowRun} key=${cfg.a + '-' + cfg.n} a=${cfg.a} n=${cfg.n} head=${head} /></figure>`;
  }

  /* ── slides 19-22: Fibonacci numbers, naive recursion, bottom-up, and φⁿ/√5 rounding ── */
  function fibTree(n) {
    const nodes = [], edges = []; let leaf = 0;
    const go = (m, d, p) => { const id = nodes.length; nodes.push({ m, d, x: 0 }); if (p >= 0) edges.push([p, id]);
      if (m < 2) nodes[id].x = leaf++; else { const a = go(m - 1, d + 1, id), b = go(m - 2, d + 1, id); nodes[id].x = (nodes[a].x + nodes[b].x) / 2; } return id; };
    go(n, 0, -1); return { nodes, edges, leaves: leaf };
  }
  function Fib() {
    const F = useMemo(() => { const a = [0n, 1n]; for (let k = 2; k <= 80; k++) a.push(a[k - 1] + a[k - 2]); return a; }, []);
    const fail = useMemo(() => { const phi = (1 + Math.sqrt(5)) / 2; for (let k = 0; k <= 80; k++) { const v = phi ** k / Math.sqrt(5); if (BigInt(Math.round(v)) !== F[k]) return { k, v, r: Math.round(v) }; } return null; }, []);
    const T = useMemo(() => fibTree(5), []);
    const phi = (1 + Math.sqrt(5)) / 2;
    const steps = [
      { en: 'Recursive definition: F<sub>0</sub> = 0, F<sub>1</sub> = 1, F<sub>n</sub> = F<sub>n−1</sub> + F<sub>n−2</sub> for n ≥ 2.' },
      { en: `Naive recursion: F<sub>5</sub> already makes ${T.nodes.length} calls, and F<sub>3</sub> is computed 2 times, F<sub>2</sub> 3 times. The calls grow like Ω(φ<sup>n</sup>), φ = (1 + √5)/2: exponential.` },
      { en: 'Bottom-up: compute F<sub>0</sub>, F<sub>1</sub>, F<sub>2</sub>, … in order, each the sum of the two before. Θ(n) time.' },
      { en: `Naive recursive squaring: F<sub>n</sub> = φ<sup>n</sup>/√5 rounded to the nearest integer, Θ(lg n) time. Unreliable: in double-precision floating point it first goes wrong at n = ${fail ? fail.k : '?'}.` }
    ];
    const [i, ctl] = useSteps(steps.length, 2600);
    const sx = x => 20 + x * (260 / Math.max(1, T.leaves - 1)), sy = d => 22 + d * 44;
    const cnt = {}; T.nodes.forEach(nd => cnt[nd.m] = (cnt[nd.m] || 0) + 1);
    return html`<figure className="fig"><div className="fig-stage">
      ${i !== 1 && html`<div className="a4-seq">${Array.from({ length: 10 }, (_, k) => html`<span key=${k} className=${i === 2 ? 'on' : ''}><i>F${k}</i>${String(F[k])}</span>`)}<span style=${{ border: 0, background: 'none' }}>…</span></div>`}
      ${i === 1 && html`<svg className="a4-svg" viewBox="0 0 300 206" role="img" aria-label="Recursion tree of the naive Fibonacci algorithm for F5">
        ${T.edges.map(([a, b], j) => html`<line key=${j} x1=${sx(T.nodes[a].x)} y1=${sy(T.nodes[a].d)} x2=${sx(T.nodes[b].x)} y2=${sy(T.nodes[b].d)} stroke="var(--graphite)" strokeWidth="1.5" />`)}
        ${T.nodes.map((nd, j) => html`<g key=${j}><circle cx=${sx(nd.x)} cy=${sy(nd.d)} r="15" fill=${nd.m === 3 ? 'color-mix(in srgb, var(--pen) 28%, var(--paper))' : nd.m === 2 ? 'color-mix(in srgb, var(--fig-k) 28%, var(--paper))' : 'var(--paper)'} stroke="var(--graphite)" strokeWidth="1.2" />
          <text x=${sx(nd.x)} y=${sy(nd.d) + 5} textAnchor="middle" fontSize="15" fontWeight="600">F${nd.m}</text></g>`)}
      </svg><div className="a4-c a4-mut">${T.nodes.length} calls for F<sub>5</sub>: F<sub>3</sub> × ${cnt[3]}, F<sub>2</sub> × ${cnt[2]}, F<sub>1</sub> × ${cnt[1]}, F<sub>0</sub> × ${cnt[0]}</div>`}
      ${i === 2 && html`<div className="a4-box a4-sp a4-c">F<sub>2</sub> = 1 + 0, F<sub>3</sub> = 1 + 1, F<sub>4</sub> = 2 + 1, …, F<sub>9</sub> = 21 + 13 = 34: one addition per number.</div>`}
      ${i === 3 && html`<div className="a4-box a4-sp"><table className="a4-tbl"><thead><tr><th>n</th><th>φ<sup>n</sup>/√5</th><th>rounded</th><th>F<sub>n</sub></th></tr></thead><tbody>
        ${[5, 10, 20].map(k => { const v = phi ** k / Math.sqrt(5); return html`<tr key=${k}><td>${k}</td><td>${v.toFixed(4)}</td><td>${Math.round(v)}</td><td>${String(F[k])} ✓</td></tr>`; })}
        ${fail && html`<tr className="on"><td>${fail.k}</td><td>${fail.v.toFixed(1)}</td><td>${fail.r}</td><td>${String(F[fail.k])} ✗</td></tr>`}</tbody></table></div>`}
      </div><${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  /* ── slides 23-26: the matrix theorem and its proof by induction ── */
  function FibProof() {
    const M = [[1, 1], [1, 0]];
    const L = [[['F<sub>n+1</sub>', 'F<sub>n</sub>'], ['F<sub>n</sub>', 'F<sub>n−1</sub>']], [['F<sub>n</sub>', 'F<sub>n−1</sub>'], ['F<sub>n−1</sub>', 'F<sub>n−2</sub>']]];
    const steps = [
      { en: '<b>Theorem</b> (slide 23): the n-th power of [[1, 1], [1, 0]] holds F<sub>n+1</sub>, F<sub>n</sub>, F<sub>n</sub>, F<sub>n−1</sub>. So recursive squaring gives F<sub>n</sub> in <b>Θ(lg n)</b> time.' },
      { en: '<b>Base (n = 1)</b>: [[F<sub>2</sub>, F<sub>1</sub>], [F<sub>1</sub>, F<sub>0</sub>]] = [[1, 1], [1, 0]], which is the matrix to the power 1.' },
      { en: '<b>Inductive step (n ≥ 2)</b>: multiply the matrix for n − 1 by [[1, 1], [1, 0]]. Top left: F<sub>n</sub>·1 + F<sub>n−1</sub>·1 = F<sub>n+1</sub>; top right: F<sub>n</sub>·1 + F<sub>n−1</sub>·0 = F<sub>n</sub>.' },
      { en: 'Bottom row the same way: F<sub>n−1</sub> + F<sub>n−2</sub> = F<sub>n</sub> and F<sub>n−1</sub>. So the product is exactly the matrix for n.' },
      { en: 'By the induction hypothesis the left factor is [[1, 1], [1, 0]]<sup>n−1</sup>.' },
      { en: '[[1, 1], [1, 0]]<sup>n−1</sup> · [[1, 1], [1, 0]] = [[1, 1], [1, 0]]<sup>n</sup>. ∎' }
    ];
    const [i, ctl] = useSteps(steps.length, 2600);
    const P = (t, x) => html`<span className="a4-mut" style=${{ fontSize: '1rem' }} dangerouslySetInnerHTML=${H(t)}></span>`;
    return html`<figure className="fig"><div className="fig-stage">
      <div className="a4-eq">${i === 1 ? html`<${Mat} m=${[['F<sub>2</sub>', 'F<sub>1</sub>'], ['F<sub>1</sub>', 'F<sub>0</sub>']]} ok=${[0, 1, 2, 3]} />` : html`<${Mat} m=${L[0]} hl=${i === 2 ? [0, 1] : i === 3 ? [2, 3] : []} />`}<span>=</span>
        ${i === 0 && html`<span><${Mat} m=${M} /><sup>n</sup></span>`}
        ${i === 1 && html`<span><${Mat} m=${M} /><sup>1</sup></span>`}
        ${(i === 2 || i === 3) && html`<${Mat} m=${L[1]} hl=${i === 2 ? [0, 1] : [2, 3]} /><span>·</span><${Mat} m=${M} />`}
        ${i === 4 && html`<span><${Mat} m=${M} /><sup>n−1</sup></span><span>·</span><${Mat} m=${M} />`}
        ${i === 5 && html`<span><${Mat} m=${M} /><sup>n</sup></span>`}</div>
      ${(i === 2 || i === 3) && html`<div className="a4-box a4-sp a4-c" dangerouslySetInnerHTML=${H(i === 2 ? 'top left: F<sub>n</sub>·1 + F<sub>n−1</sub>·1 = <b>F<sub>n+1</sub></b><br/>top right: F<sub>n</sub>·1 + F<sub>n−1</sub>·0 = <b>F<sub>n</sub></b>' : 'bottom left: F<sub>n−1</sub>·1 + F<sub>n−2</sub>·1 = <b>F<sub>n</sub></b><br/>bottom right: F<sub>n−1</sub>·1 + F<sub>n−2</sub>·0 = <b>F<sub>n−1</sub></b>')}></div>`}
      ${i === 1 && html`<div className="a4-box a4-sp a4-c">F<sub>2</sub> = 1, F<sub>1</sub> = 1, F<sub>0</sub> = 0 ✓</div>`}
      </div><${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  /* ── slide 24 and the notes' exam workout: F(n) by recursive squaring (default F(16) in 4 squarings) ── */
  const mul = (X, Y) => [[X[0][0] * Y[0][0] + X[0][1] * Y[1][0], X[0][0] * Y[0][1] + X[0][1] * Y[1][1]], [X[1][0] * Y[0][0] + X[1][1] * Y[1][0], X[1][0] * Y[0][1] + X[1][1] * Y[1][1]]];
  function sqSteps(n) {
    const ms = []; for (let m = n; ; m = Math.floor(m / 2)) { ms.push(m); if (m <= 1) break; }
    const M = [[1n, 1n], [1n, 0n]], P = {}; P[1] = M; const steps = [{ m: 1, X: M, en: `M = [[1, 1], [1, 0]] = M<sup>1</sup>. To reach M<sup>${n}</sup> the exponents halve: ${ms.join(' → ')}.`, mults: 0 }];
    let mults = 0;
    for (let j = ms.length - 2; j >= 0; j--) { const m = ms[j], h = Math.floor(m / 2); let X = mul(P[h], P[h]); mults++; if (m % 2) { X = mul(X, M); mults++; } P[m] = X;
      steps.push({ m, X, mults, en: `M<sup>${m}</sup> = (M<sup>${h}</sup>)<sup>2</sup>${m % 2 ? ' · M' : ''}: top-right entry F<sub>${m}</sub> = <b>${X[0][1]}</b>.` }); }
    const last = steps[steps.length - 1];
    steps.push({ m: n, X: last.X, mults, en: `<b>F(${n}) = ${last.X[0][1]}</b> after ${mults} matrix multiplication${mults === 1 ? '' : 's'} of 2×2 integer matrices (Θ(lg n)), with no round-off.` });
    return steps;
  }
  function SqRun({ n, head }) {
    const steps = useMemo(() => sqSteps(n), [n]);
    const [i, ctl] = useSteps(steps.length, 1800), s = steps[i];
    const fit = useFit(i + '-' + n);
    return html`<div className="fig-stage">${head}
      <div ref=${fit} className="a4-eq" style=${{ fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden' }}><span>M<sup>${s.m}</sup> =</span><${Mat} m=${s.X.map(r => r.map(String))} hl=${i > 0 ? [1] : []} /></div>
      <div className="a4-seq a4-sp">${steps.slice(0, -1).map((t, j) => html`<span key=${j} className=${j === Math.min(i, steps.length - 2) ? 'on' : ''} style=${{ opacity: j <= i ? 1 : .3 }}>M<sup>${t.m}</sup></span>`)}</div>
      </div><${Cap} en=${s.en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} />`;
  }
  function FibSq() {
    const [n, setN] = useState(16), [f, setF] = useState('16'), [err, setErr] = useState('');
    const go = () => { const v = +f; if (!Number.isInteger(v) || v < 1 || v > 60) return setErr('n must be a whole number from 1 to 60.'); setErr(''); setN(v); };
    const head = html`<div className="a4-form"><label>n <input value=${f} inputMode="numeric" onChange=${e => setF(e.target.value)} /></label><button className="fig-btn solid" onClick=${go}>Compute F(n)</button>
      ${n !== 16 && html`<button className="fig-btn" onClick=${() => { setF('16'); setN(16); setErr(''); }}>F(16)</button>`}</div>${err && html`<div className="a4-err">${err}</div>`}`;
    return html`<figure className="fig"><${SqRun} key=${n} n=${n} head=${head} /></figure>`;
  }

  /* ── slides 27-29: the standard algorithm, c_ij = Σ a_ik · b_kj, on n = 3 ── */
  function MatMul() {
    const sub = ['₁', '₂', '₃'], n = 3;
    const cells = []; for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) cells.push([r, c]);
    const steps = [{ en: 'Input A = [a<sub>ij</sub>], B = [b<sub>ij</sub>], i, j = 1, 2, …, n. Output C = A·B with c<sub>ij</sub> = Σ<sub>k=1</sub><sup>n</sup> a<sub>ik</sub>·b<sub>kj</sub>. Here n = 3.' },
      ...cells.map(([r, c], j) => ({ r, c, en: `i = ${r + 1}, j = ${c + 1}: c<sub>${r + 1}${c + 1}</sub> = ${[0, 1, 2].map(k => `a<sub>${r + 1}${k + 1}</sub>b<sub>${k + 1}${c + 1}</sub>`).join(' + ')}, n = 3 multiplications (inner loop on k). Total so far: ${3 * (j + 1)}.` })),
      { en: 'n<sup>2</sup> = 9 entries × n = 3 multiplications each = n<sup>3</sup> = 27. <b>Running time = Θ(n<sup>3</sup>)</b>.' }];
    const [i, ctl] = useSteps(steps.length, 1300), s = steps[i];
    const done = Math.min(i, 9);
    const G = (ch, f) => html`<${Mat} c=${3} m=${[0, 1, 2].map(r => [0, 1, 2].map(c => ch + sub[r] + sub[c]))} hl=${f} />`;
    const aH = s.r != null ? [0, 1, 2].map(k => s.r * 3 + k) : [], bH = s.r != null ? [0, 1, 2].map(k => k * 3 + s.c) : [];
    const cH = cells.slice(0, done).map(([r, c]) => r * 3 + c);
    const code = ['for i ← 1 to n', '  do for j ← 1 to n', '    do c<sub>ij</sub> ← 0', '      for k ← 1 to n', '        do c<sub>ij</sub> ← c<sub>ij</sub> + a<sub>ik</sub>·b<sub>kj</sub>'];
    return html`<figure className="fig"><div className="fig-stage">
      <div className="a4-box a4-code">${code.map((l, j) => html`<div key=${j} className=${s.r != null && j >= 3 ? 'on' : ''} style=${{ paddingLeft: (l.match(/^ */)[0].length * 4 + 4) + 'px' }} dangerouslySetInnerHTML=${H(l.trim())}></div>`)}</div>
      <div className="a4-eq a4-sp a4-tight" style=${{ fontSize: '.8rem', gap: '1px', flexWrap: 'nowrap' }}>${G('c', cH)}<span>=</span>${G('a', aH)}<span>·</span>${G('b', bH)}</div>
      <div className="a4-c a4-mut a4-sp">multiplications: <b className="a4-k">${3 * done}</b> of n<sup>3</sup> = 27</div>
      </div><${Cap} en=${s.en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  /* ── slides 30-34: 2×2 block divide and conquer, 8 multiplications ── */
  function Blocks() {
    const C = [['r', 's'], ['t', 'u']], A = [['a', 'b'], ['c', 'd']], B = [['e', 'f'], ['g', 'h']];
    const eqs = [['r', 'ae + bg', [0], [0, 1], [0, 2]], ['s', 'af + bh', [1], [0, 1], [1, 3]], ['t', 'ce + dg', [2], [2, 3], [0, 2]], ['u', 'cf + dh', [3], [2, 3], [1, 3]]];
    const steps = [{ en: 'Idea: an n×n matrix = a 2×2 matrix of (n/2)×(n/2) submatrices. C = A · B.' },
      ...eqs.map(e => ({ e, en: `<b>${e[0]} = ${e[1]}</b>: row ${e[0] === 'r' || e[0] === 's' ? 1 : 2} of A times column ${e[0] === 'r' || e[0] === 't' ? 1 : 2} of B, with submatrices as entries.` })),
      { en: '<b>8 recursive multiplications</b> and <b>4 additions</b> of (n/2)×(n/2) submatrices. (Slide 31 shows t = ce + dh and u = cf + dg; the correct ones are t = ce + dg and u = cf + dh, as on slide 30.)' },
      { en: 'T(n) = 8T(n/2) + Θ(n<sup>2</sup>). n<sup>log<sub>2</sub>8</sup> = n<sup>3</sup> ⇒ Case 1 ⇒ <b>Θ(n<sup>3</sup>)</b>: no better than the ordinary algorithm.' }];
    const [i, ctl] = useSteps(steps.length, 2100), s = steps[i];
    const e = s.e || [null, '', [], [], []];
    const shown = Math.min(4, Math.max(0, i));
    return html`<figure className="fig"><div className="fig-stage">
      <div className="a4-eq" style=${{ fontSize: '1.15rem' }}><${Mat} m=${C} hl=${e[2]} /><span>=</span><${Mat} m=${A} hl=${e[3]} /><span>·</span><${Mat} m=${B} hl=${e[4]} /></div>
      <div className="a4-eq a4-mut">C = A · B</div>
      <div className="a4-lines a4-sp">${eqs.slice(0, shown).map((q, j) => html`<div key=${j} className=${'a4-ln' + (j === i - 1 ? ' on' : '')}>${q[0]} = ${q[1]}</div>`)}</div>
      ${i >= 5 && html`<div className="a4-box a4-sp a4-c" dangerouslySetInnerHTML=${H(i === 5 ? '8 mults · 4 adds of (n/2)×(n/2) submatrices' : 'T(n) = 8T(n/2) + Θ(n<sup>2</sup>) = Θ(n<sup>3</sup>)')}></div>`}
      </div><${Cap} en=${s.en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  /* ── slides 35-38: Strassen's seven products ── */
  const PS = [['P<sub>1</sub>', 'a · (f − h)', [0], [1, 3]], ['P<sub>2</sub>', '(a + b) · h', [0, 1], [3]], ['P<sub>3</sub>', '(c + d) · e', [2, 3], [0]], ['P<sub>4</sub>', 'd · (g − e)', [3], [2, 0]],
    ['P<sub>5</sub>', '(a + d) · (e + h)', [0, 3], [0, 3]], ['P<sub>6</sub>', '(b − d) · (g + h)', [1, 3], [2, 3]], ['P<sub>7</sub>', '(a − c) · (e + f)', [0, 2], [0, 1]]];
  function Strassen() {
    const steps = [{ en: 'Strassen\'s idea: multiply 2×2 (block) matrices with only <b>7</b> recursive multiplications instead of 8.' },
      ...PS.map((p, j) => ({ en: `${p[0]} = ${p[1]}: one multiplication of a sum/difference of A blocks by a sum/difference of B blocks.` })),
      { en: 'C is formed from the P\'s with additions and subtractions only: r = P<sub>5</sub> + P<sub>4</sub> − P<sub>2</sub> + P<sub>6</sub>, s = P<sub>1</sub> + P<sub>2</sub>, t = P<sub>3</sub> + P<sub>4</sub>, u = P<sub>5</sub> + P<sub>1</sub> − P<sub>3</sub> − P<sub>7</sub>.' },
      { en: '<b>7 mults, 18 adds/subs</b> (10 to form the P\'s, 8 to form r, s, t, u). Note: no reliance on commutativity of multiplication, so it works on submatrices.' }];
    const [i, ctl] = useSteps(steps.length, 1700);
    const p = i >= 1 && i <= 7 ? PS[i - 1] : null;
    return html`<figure className="fig"><div className="fig-stage">
      <div className="a4-eq" style=${{ fontSize: '1.05rem' }}><${Mat} m=${[['r', 's'], ['t', 'u']]} hl=${i >= 8 ? [0, 1, 2, 3] : []} /><span>=</span><${Mat} m=${[['a', 'b'], ['c', 'd']]} hl=${p ? p[2] : []} /><span>·</span><${Mat} m=${[['e', 'f'], ['g', 'h']]} hl=${p ? p[3] : []} /></div>
      <div className="a4-lines a4-sp">${PS.slice(0, Math.min(7, i)).map((q, j) => html`<div key=${j} className=${'a4-ln' + (j === i - 1 ? ' on' : '')} dangerouslySetInnerHTML=${H(q[0] + ' = ' + q[1])}></div>`)}</div>
      ${i >= 8 && html`<div className="a4-box a4-sp" style=${{ lineHeight: 1.7 }}>r = P<sub>5</sub> + P<sub>4</sub> − P<sub>2</sub> + P<sub>6</sub><br/>s = P<sub>1</sub> + P<sub>2</sub><br/>t = P<sub>3</sub> + P<sub>4</sub><br/>u = P<sub>5</sub> + P<sub>1</sub> − P<sub>3</sub> − P<sub>7</sub>
        ${i >= 9 && html`<div className="a4-k">7 mults, 18 adds/subs.</div>`}</div>`}
      </div><${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  /* ── slide 39: checking r = P5 + P4 − P2 + P6 = ae + bg ── */
  function StrassenR() {
    const G = [['P<sub>5</sub> = (a + d)(e + h)', ['+ae', '+ah', '+de', '+dh']], ['P<sub>4</sub> = d(g − e)', ['+dg', '−de']], ['−P<sub>2</sub> = −(a + b)h', ['−ah', '−bh']], ['P<sub>6</sub> = (b − d)(g + h)', ['+bg', '+bh', '−dg', '−dh']]];
    const pairs = ['ah', 'de', 'dh', 'dg', 'bh'];
    const steps = [{ en: 'Check one entry (slide 39): r = P<sub>5</sub> + P<sub>4</sub> − P<sub>2</sub> + P<sub>6</sub> should equal ae + bg.' },
      { en: 'Multiply out each product (keeping the order of factors: no commutativity needed).' },
      ...pairs.map(p => ({ p, en: `+${p} and −${p} cancel.` })),
      { en: 'Only <b>ae + bg</b> is left, which is r from slide 30 ✓.' }];
    const [i, ctl] = useSteps(steps.length, 1500), s = steps[i];
    const gone = pairs.slice(0, Math.max(0, i - 1));
    return html`<figure className="fig"><div className="fig-stage">
      <div className="a4-c" style=${{ fontSize: '1.05rem', marginBottom: '8px' }}>r = P<sub>5</sub> + P<sub>4</sub> − P<sub>2</sub> + P<sub>6</sub></div>
      ${i >= 1 && html`<div className="a4-chips">${G.map((g, j) => html`<span key=${j} className="a4-grp"><em dangerouslySetInnerHTML=${H(g[0])}></em>${g[1].map(t => { const v = t.slice(1), cl = s.p === v ? ' hit' : gone.includes(v) && s.p !== v ? ' x' : i === steps.length - 1 ? ' keep' : ''; return html`<span key=${t} className=${'a4-chip' + cl}>${t[0] === '+' ? '+' : '−'} ${v}</span>`; })}</span>`)}</div>`}
      ${i === steps.length - 1 && html`<div className="a4-box a4-sp a4-c"><b>r = ae + bg</b> ✓</div>`}
      </div><${Cap} en=${s.en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  /* ── slides 36-38 with numbers: Strassen's 7 products against the standard 8 ── */
  function StrassenNum() {
    const [v, setV] = useState({ a: '1', b: '3', c: '7', d: '5', e: '6', f: '8', g: '4', h: '2' });
    const N = {}; let bad = false; for (const k in v) { const x = +v[k]; if (v[k].trim() === '' || !Number.isInteger(x) || Math.abs(x) > 99) bad = true; N[k] = x; }
    const { a, b, c, d, e, f, g, h } = N;
    const P = [a * (f - h), (a + b) * h, (c + d) * e, d * (g - e), (a + d) * (e + h), (b - d) * (g + h), (a - c) * (e + f)];
    const R = [P[4] + P[3] - P[1] + P[5], P[0] + P[1], P[2] + P[3], P[4] + P[0] - P[2] - P[6]];
    const S = [a * e + b * g, a * f + b * h, c * e + d * g, c * f + d * h];
    const inp = k => html`<input key=${k} aria-label=${k} value=${v[k]} inputMode="numeric" style=${{ width: '34px' }} onChange=${ev => { const t = ev.target.value; setV(o => Object.assign({}, o, { [k]: t })); }} />`;
    const box = ks => html`<span className="a4-mat" style=${{ '--c': 2 }}>${ks.map(k => html`<span key=${k}><span className="a4-mut">${k}</span> ${inp(k)}</span>`)}</span>`;
    const pf = ['a(f − h)', '(a + b)h', '(c + d)e', 'd(g − e)', '(a + d)(e + h)', '(b − d)(g + h)', '(a − c)(e + f)'];
    const rf = ['P<sub>5</sub> + P<sub>4</sub> − P<sub>2</sub> + P<sub>6</sub>', 'P<sub>1</sub> + P<sub>2</sub>', 'P<sub>3</sub> + P<sub>4</sub>', 'P<sub>5</sub> + P<sub>1</sub> − P<sub>3</sub> − P<sub>7</sub>'];
    const sf = ['ae + bg', 'af + bh', 'ce + dg', 'cf + dh'];
    const ok = !bad && R.every((x, j) => x === S[j]);
    return html`<figure className="fig"><div className="fig-stage">
      <div className="a4-eq" style=${{ fontSize: '.88rem' }}>${box(['a', 'b', 'c', 'd'])}<span>·</span>${box(['e', 'f', 'g', 'h'])}</div>
      <div className="a4-c a4-sp"><button className="fig-btn" onClick=${() => setV({ a: '1', b: '3', c: '7', d: '5', e: '6', f: '8', g: '4', h: '2' })}>Reset example</button></div>
      ${bad ? html`<div className="a4-err a4-sp">Enter whole numbers from −99 to 99.</div>` : html`
      <div className="a4-sp"><table className="a4-tbl"><tbody>${P.map((x, j) => html`<tr key=${j}><td>P<sub>${j + 1}</sub></td><td className="l">${pf[j]}</td><td><b>${x}</b></td></tr>`)}</tbody></table></div>
      <div className="a4-sp"><table className="a4-tbl"><thead><tr><th></th><th>Strassen</th><th>standard</th></tr></thead><tbody>${['r', 's', 't', 'u'].map((k, j) => html`<tr key=${k}><td>${k}</td><td className="l"><span dangerouslySetInnerHTML=${H(rf[j])}></span> = <b>${R[j]}</b></td><td>${sf[j]} = <b>${S[j]}</b> ${R[j] === S[j] ? '✓' : '✗'}</td></tr>`)}</tbody></table></div>`}
      </div><${Cap} en=${bad ? 'Each entry must be a whole number.' : `${ok ? 'Same C' : 'Mismatch'} from <b>7</b> multiplications (P<sub>1</sub>…P<sub>7</sub>) as from the standard <b>8</b>. Our example (the slides give no numbers): A = [[1, 3], [7, 5]], B = [[6, 8], [4, 2]]; change any entry.`} /></figure>`;
  }

  /* ── slides 46-50: the naive VLSI layout of a complete binary tree (8 leaves, as drawn) ── */
  function Vlsi() {
    const U = 18, X0 = 60, Y0 = 46, n = 8;
    const nodes = [], edges = [];
    for (let d = 0; d <= 3; d++) { const cnt = 2 ** d, span = 16 / cnt; for (let j = 0; j < cnt; j++) { const x = j * span + span / 2 - 1, id = nodes.length; nodes.push({ x, y: d, d }); } }
    const idx = (d, j) => 2 ** d - 1 + j;
    for (let d = 0; d < 3; d++) for (let j = 0; j < 2 ** d; j++) { const p = nodes[idx(d, j)]; for (const k of [2 * j, 2 * j + 1]) { const c = nodes[idx(d + 1, k)]; edges.push({ d: d + 1, pts: `${X0 + p.x * U},${Y0 + p.y * U} ${X0 + c.x * U},${Y0 + p.y * U} ${X0 + c.x * U},${Y0 + c.y * U}` }); } }
    const steps = [
      { show: 3, en: 'Problem: embed a complete binary tree with n leaves in a grid using minimal area. The n = 8 leaves sit on the bottom row, 2 grid units apart.' },
      { show: 2, en: 'Each parent sits one row above its two children, in the middle between them.' },
      { show: 1, en: 'The next level up: each node spans twice the width.' },
      { show: 0, en: 'The root on top: the whole tree is drawn.' },
      { show: 0, hh: 1, en: 'Height: one row more than a half-tree, <b>H(n) = H(n/2) + Θ(1) = Θ(lg n)</b>. Here H = 3 = lg 8 rows.' },
      { show: 0, hh: 1, ww: 1, en: 'Width: two half-trees side by side plus a gap, <b>W(n) = 2W(n/2) + Θ(1) = Θ(n)</b>. Here W(2) = 2, W(4) = 2·2 + 2 = 6, W(8) = 2·6 + 2 = 14 units.' },
      { show: 0, hh: 1, ww: 1, ar: 1, en: '<b>Area = Θ(n lg n)</b> (here 14 × 3 = 42 cells). The H-tree below does better.' }
    ];
    const [i, ctl] = useSteps(steps.length, 2000), s = steps[i];
    return html`<figure className="fig"><div className="fig-stage">
      <svg className="a4-svg" viewBox="0 0 320 112" role="img" aria-label="Naive layout of a complete binary tree with 8 leaves in a grid">
        ${Array.from({ length: 15 }, (_, x) => html`<line key=${'v' + x} x1=${X0 + x * U} y1=${Y0} x2=${X0 + x * U} y2=${Y0 + 3 * U} stroke="var(--line)" strokeWidth="1" />`)}
        ${Array.from({ length: 4 }, (_, y) => html`<line key=${'h' + y} x1=${X0} y1=${Y0 + y * U} x2=${X0 + 14 * U} y2=${Y0 + y * U} stroke="var(--line)" strokeWidth="1" />`)}
        ${edges.map((e, j) => html`<polyline key=${j} className="a4-fade" style=${{ opacity: e.d - 1 >= s.show ? 1 : 0 }} points=${e.pts} fill="none" stroke="var(--ink)" strokeWidth="3" />`)}
        ${nodes.map((nd, j) => html`<rect key=${j} className="a4-fade" style=${{ opacity: nd.d >= s.show ? 1 : 0 }} x=${X0 + nd.x * U - 6} y=${Y0 + nd.y * U - 6} width="12" height="12" fill="#d23c3c" stroke="#7a1010" strokeWidth="1" />`)}
        <g className="a4-fade" style=${{ opacity: s.ww ? 1 : 0 }}><line x1=${X0} y1="18" x2=${X0 + 14 * U} y2="18" stroke="var(--fig-k)" strokeWidth="1.5" markerStart="url(#a4-ah)" markerEnd="url(#a4-ah)" />
          <rect x=${X0 + 7 * U - 32} y="6" width="64" height="24" fill="var(--paper-2)" /><text x=${X0 + 7 * U} y="24" textAnchor="middle" fontSize="17" style=${{ fill: 'var(--fig-k)' }} fontWeight="700">W(n)</text></g>
        <g className="a4-fade" style=${{ opacity: s.hh ? 1 : 0 }}><line x1="52" y1=${Y0} x2="52" y2=${Y0 + 3 * U} stroke="var(--fig-k)" strokeWidth="1.5" markerStart="url(#a4-ah)" markerEnd="url(#a4-ah)" />
          <text x="28" y=${Y0 + 1.5 * U + 6} textAnchor="middle" fontSize="17" style=${{ fill: 'var(--fig-k)' }} fontWeight="700">H(n)</text></g>
        <defs><marker id="a4-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--fig-k)" /></marker></defs>
      </svg>
      <div className="a4-box a4-c" style=${{ marginTop: '4px' }}>${s.hh ? html`<div>H(n) = H(n/2) + Θ(1) = Θ(lg n)</div>` : html`<div className="a4-mut">n = 8 leaves</div>`}${s.ww && html`<div>W(n) = 2W(n/2) + Θ(1) = Θ(n)</div>`}${s.ar && html`<div className="a4-p">Area = Θ(n lg n)</div>`}</div>
      </div><${Cap} en=${s.en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  /* ── slides 51-53: the H-tree embedding (16 leaves as drawn; also 4 and 64) ── */
  function htree(k) {
    const nodes = [], edges = [];
    const L = j => 2 ** (j + 1) - 2;
    const go = (x0, y0, j, d) => { // returns id of the root of a 4^j-leaf H-tree whose square starts at (x0, y0)
      if (j === 0) { nodes.push({ x: x0, y: y0, d }); return nodes.length - 1; }
      const s = L(j), q = L(j - 1), off = q + 2, c = s / 2;
      const root = nodes.push({ x: x0 + c, y: y0 + c, d }) - 1;
      const lft = nodes.push({ x: x0 + q / 2, y: y0 + c, d: d + 1 }) - 1, rgt = nodes.push({ x: x0 + off + q / 2, y: y0 + c, d: d + 1 }) - 1;
      edges.push([root, lft, d + 1], [root, rgt, d + 1]);
      const sub = [[0, 0, lft], [0, off, lft], [off, 0, rgt], [off, off, rgt]];
      for (const [dx, dy, p] of sub) { const r = go(x0 + dx, y0 + dy, j - 1, d + 2); edges.push([p, r, d + 2]); }
      return root;
    };
    go(0, 0, k, 0);
    return { nodes, edges, side: L(k), depth: 2 * k };
  }
  function HRun({ k, head }) {
    const T = useMemo(() => htree(k), [k]), n = 4 ** k, D = T.depth;
    const naiveW = 2 * n - 2, naiveH = Math.log2(n), sz = T.side;
    const steps = [];
    steps.push({ lv: D, en: `n = ${n} leaves on a ${sz}×${sz} grid. Build the complete binary tree from the leaves up.` });
    for (let d = D - 1; d >= 0; d--) steps.push({ lv: d, en: d === 0 ? 'The root joins the two halves in the center: the tree looks like nested letters H.' : `Depth ${d}: ${2 ** d} nodes, each joining two subtrees with a ${(D - d) % 2 ? 'vertical' : 'horizontal'} wire.` });
    steps.push({ lv: 0, dim: 1, en: k === 1 ? 'L(4) = 2L(1) + Θ(1) = 2 units. In general <b>L(n) = 2L(n/4) + Θ(1) = Θ(√n)</b>, so <b>Area = Θ(n)</b>.' : `Side: two L(n/4) blocks plus a Θ(1) gap, <b>L(n) = 2L(n/4) + Θ(1) = Θ(√n)</b>. Here L(${n}) = 2·${T.side / 2 - 1} + 2 = ${sz}.` });
    steps.push({ lv: 0, dim: 1, area: 1, en: `<b>Area = L(n)<sup>2</sup> = Θ(n)</b>: here ${sz}<sup>2</sup> = ${sz * sz} cells, against W·H = ${naiveW}·${naiveH} = ${naiveW * naiveH} for the naive layout (Θ(n lg n)).` });
    const [i, ctl] = useSteps(steps.length, 1700), s = steps[i];
    const M = 34, W = 252, U = W / sz, P = v => M + v * U, nodeR = k === 3 ? 4 : 6;
    const q = sz / 2 - 1;
    return html`<div className="fig-stage">${head}
      <svg className="a4-svg" viewBox="0 0 300 320" role="img" aria-label=${'H-tree layout of a complete binary tree with ' + n + ' leaves'}>
        ${Array.from({ length: sz + 1 }, (_, x) => html`<g key=${x}><line x1=${P(x)} y1=${P(0)} x2=${P(x)} y2=${P(sz)} stroke="var(--line)" strokeWidth="1" /><line x1=${P(0)} y1=${P(x)} x2=${P(sz)} y2=${P(x)} stroke="var(--line)" strokeWidth="1" /></g>`)}
        ${T.edges.map(([a, b, d], j) => html`<line key=${j} className="a4-fade" style=${{ opacity: d - 1 >= s.lv ? 1 : 0 }} x1=${P(T.nodes[a].x)} y1=${P(T.nodes[a].y)} x2=${P(T.nodes[b].x)} y2=${P(T.nodes[b].y)} stroke="var(--ink)" strokeWidth=${k === 3 ? 2 : 3} />`)}
        ${T.nodes.map((nd, j) => html`<rect key=${j} className="a4-fade" style=${{ opacity: nd.d >= s.lv ? 1 : 0 }} x=${P(nd.x) - nodeR} y=${P(nd.y) - nodeR} width=${2 * nodeR} height=${2 * nodeR} fill="#d23c3c" stroke="#7a1010" strokeWidth="1" />`)}
        <g className="a4-fade" style=${{ opacity: s.dim ? 1 : 0 }}>
          <line x1=${P(0)} y1="12" x2=${P(sz)} y2="12" stroke="var(--fig-k)" strokeWidth="1.5" markerStart="url(#a4-ah2)" markerEnd="url(#a4-ah2)" />
          <rect x="122" y="0" width="56" height="22" fill="var(--paper-2)" /><text x="150" y="18" textAnchor="middle" fontSize="17" style=${{ fill: 'var(--fig-k)' }} fontWeight="700">L(n)</text>
          ${k > 1 && html`<g><line x1=${P(0)} y1="300" x2=${P(q)} y2="300" stroke="var(--fig-k)" strokeWidth="1.5" markerStart="url(#a4-ah2)" markerEnd="url(#a4-ah2)" />
            <line x1=${P(sz - q)} y1="300" x2=${P(sz)} y2="300" stroke="var(--fig-k)" strokeWidth="1.5" markerStart="url(#a4-ah2)" markerEnd="url(#a4-ah2)" />
            <text x=${P(q / 2)} y="318" textAnchor="middle" fontSize="16" style=${{ fill: 'var(--fig-k)' }}>L(n/4)</text><text x=${P(sz / 2)} y="318" textAnchor="middle" fontSize="16" style=${{ fill: 'var(--fig-k)' }}>Θ(1)</text>
            <text x=${P(sz - q / 2)} y="318" textAnchor="middle" fontSize="16" style=${{ fill: 'var(--fig-k)' }}>L(n/4)</text></g>`}
        </g>
        <defs><marker id="a4-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--fig-k)" /></marker></defs>
      </svg>
      ${s.dim && html`<div className="a4-box a4-c">L(n) = 2L(n/4) + Θ(1) = Θ(√n)${s.area && html`<div className="a4-p">Area = Θ(n)</div>`}</div>`}
      </div><${Cap} en=${s.en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} />`;
  }
  function HTree() {
    const [k, setK] = useState(2);
    const head = html`<${Tabs} items=${['n = 4', 'n = 16 (slides)', 'n = 64']} v=${k - 1} set=${j => setK(j + 1)} />`;
    return html`<figure className="fig"><${HRun} key=${k} k=${k} head=${head} /></figure>`;
  }

  window.FIGS = Object.assign(window.FIGS || {}, {
    'ag-4-recur': Recur, 'ag-4-bsearch': BSearch, 'ag-4-power': Power, 'ag-4-fib': Fib, 'ag-4-fibproof': FibProof, 'ag-4-fibsq': FibSq,
    'ag-4-matmul': MatMul, 'ag-4-blocks': Blocks, 'ag-4-strassen': Strassen, 'ag-4-strassen-r': StrassenR, 'ag-4-strassen-num': StrassenNum,
    'ag-4-vlsi': Vlsi, 'ag-4-htree': HTree
  });
})();
/* ── part L7 ── */
// Algorithms visuals, Lecture 7 (Order Statistics): ranks (slide 2), RAND-SELECT and its example (3-4), lucky and unlucky splits (5),
// the expected-time analysis (6-17), median-of-medians SELECT (19-27) and its recurrence (28-30). Every label and number comes from the slides.
(function () {
  const { useState, useEffect, useRef, useMemo } = React;
  const { html, useSteps, Cap, Bar, pop, calm, useClock, useFit, sec } = window.FIGKIT;
  const CSS = `
.a7-tabs{ display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin:0 0 10px; }
.a7-tabs .fig-btn{ padding:4px 11px; min-height:32px; }
.fig-btn.a7-on{ background:var(--fig-s); color:#fff; border-color:transparent; }
.fig-btn:disabled{ opacity:.45; cursor:default; }
.a7-box{ max-width:520px; margin:0 auto; background:var(--paper); border:1px solid var(--line); border-radius:10px; padding:8px 10px; color:var(--ink); font-size:.95rem; line-height:1.5; overflow-wrap:anywhere; }
.a7-sp{ margin-top:10px; }
.a7-c{ text-align:center; }
.a7-k{ color:var(--fig-k); font-weight:700; } .a7-p{ color:var(--pen); font-weight:700; } .a7-g{ color:var(--ok); font-weight:700; }
.a7-mut{ color:var(--graphite); font-size:.9rem; }
.a7-lines{ max-width:520px; margin:0 auto; display:grid; gap:4px; }
.a7-ln{ padding:3px 8px; border-radius:6px; font-size:.95rem; line-height:1.5; color:var(--ink); transition:background .4s, opacity .4s; overflow-wrap:anywhere; }
.a7-ln.on{ background:color-mix(in srgb, var(--fig-k) 18%, var(--paper)); box-shadow:inset 3px 0 0 var(--fig-k); }
.a7-ln.dim{ opacity:.5; }
.a7-arr{ display:flex; justify-content:center; gap:3px; flex-wrap:nowrap; }
.a7-cell{ flex:1 1 0; max-width:40px; min-width:0; text-align:center; transition:opacity .4s; }
.a7-cell b{ display:flex; align-items:center; justify-content:center; height:34px; border:1.5px solid var(--graphite); border-radius:5px; font-size:.98rem; font-weight:600; color:var(--ink); background:var(--paper); transition:background .4s, border-color .4s; }
.a7-cell i{ display:block; font-style:normal; font-size:.76rem; color:var(--graphite); margin-top:2px; }
.a7-cell.out{ opacity:.3; }
.a7-cell.lo b{ background:color-mix(in srgb, var(--fig-k) 25%, var(--paper)); }
.a7-cell.hi b{ background:color-mix(in srgb, var(--pen) 22%, var(--paper)); }
.a7-cell.pv b{ background:color-mix(in srgb, var(--ok) 32%, var(--paper)); border-color:var(--ok); border-width:2.5px; }
.a7-cell.sel b{ box-shadow:0 0 0 3px var(--fig-k); }
.a7-form{ display:flex; flex-wrap:wrap; gap:8px; align-items:center; justify-content:center; font-size:.9rem; color:var(--ink); margin:0 0 8px; }
.a7-form label{ display:flex; gap:4px; align-items:center; }
.a7-form input{ font:inherit; padding:3px 6px; border:1px solid var(--line); border-radius:6px; background:var(--paper); color:var(--ink); min-width:0; }
.a7-err{ color:var(--pen); font-size:.88rem; text-align:center; margin:0 0 6px; }
.a7-tbl{ width:100%; border-collapse:collapse; font-size:.9rem; color:var(--ink); }
.a7-tbl td, .a7-tbl th{ border:1px solid var(--line); padding:4px 6px; vertical-align:top; transition:background .4s; }
.a7-tbl td:first-child{ white-space:nowrap; font-weight:700; color:var(--fig-k); text-align:center; }
.a7-tbl tr.on td{ background:color-mix(in srgb, var(--fig-k) 18%, var(--paper)); }
.a7-key{ display:flex; flex-wrap:wrap; gap:4px 12px; justify-content:center; font-size:.88rem; color:var(--ink); margin-top:6px; }
.a7-key span::before{ content:""; display:inline-block; width:11px; height:11px; border-radius:3px; margin-right:4px; vertical-align:-1px; background:var(--sw); }
.a7-rng{ width:100%; max-width:420px; display:block; margin:6px auto 0; accent-color:var(--fig-k); }
.a7-svg text{ font-family:var(--body); }
.a7-fade{ transition:opacity .5s ease; }
[data-fig^="ag-7-"] .fig-stage sup, [data-fig^="ag-7-"] .fig-stage sub{ font-size:.85em; }`;
  if (!document.getElementById('a7-css')) { const s = document.createElement('style'); s.id = 'a7-css'; s.textContent = CSS; document.head.appendChild(s); }

  const H = s => ({ __html: s });
  const Tabs = ({ items, v, set }) => html`<div className="a7-tabs" role="tablist">${items.map((t, j) => html`<button key=${j} role="tab" aria-selected=${v === j} className=${'fig-btn' + (v === j ? ' a7-on' : '')} onClick=${() => set(j)} dangerouslySetInnerHTML=${H(t)}></button>`)}</div>`;
  const EX = [6, 10, 13, 5, 8, 3, 2, 11];
  const ord = i => i + (i % 10 === 1 && i % 100 !== 11 ? 'st' : i % 10 === 2 && i % 100 !== 12 ? 'nd' : i % 10 === 3 && i % 100 !== 13 ? 'rd' : 'th');

  /* ── slide 2: order statistics, on slide 4's array ── */
  function Rank() {
    const S = [...EX].sort((a, b) => a - b), n = S.length;
    const steps = [
      { sorted: 0, hl: [], en: 'Select the i-th smallest of n elements, the element with <b>rank i</b>. Slide 4\'s array, n = 8.' },
      { sorted: 1, hl: [], en: 'Naive algorithm: sort (merge sort or heapsort, not quicksort) in Θ(n lg n), then index the i-th element in Θ(1). Worst case <b>Θ(n lg n)</b>.' },
      { sorted: 1, hl: [1], en: 'i = 1: the <b>minimum</b>, 2.' },
      { sorted: 1, hl: [n], en: `i = n = ${n}: the <b>maximum</b>, ${S[n - 1]}.` },
      { sorted: 1, hl: [Math.floor((n + 1) / 2), Math.ceil((n + 1) / 2)], en: `i = ⌊(n+1)/2⌋ = ${Math.floor((n + 1) / 2)} or ⌈(n+1)/2⌉ = ${Math.ceil((n + 1) / 2)}: the <b>medians</b>, ${S[Math.floor((n + 1) / 2) - 1]} and ${S[Math.ceil((n + 1) / 2) - 1]} (n is even, so there are two).` },
      { sorted: 1, hl: [7], en: `Slide 4 asks for i = 7: the answer is <b>${S[6]}</b>. RAND-SELECT finds it without sorting.` }
    ];
    const [i, ctl] = useSteps(steps.length, 2100), s = steps[i];
    const A = s.sorted ? S : EX;
    return html`<figure className="fig"><div className="fig-stage">
      <div className="a7-arr">${A.map((v, j) => html`<div key=${v} className=${'a7-cell' + (s.hl.includes(j + 1) && s.sorted ? ' pv' : '')}><b>${v}</b><i>${s.sorted ? j + 1 : ' '}</i></div>`)}</div>
      <div className="a7-c a7-mut a7-sp">${s.sorted ? 'sorted: the number under each element is its rank' : 'unsorted input'}</div>
      </div><${Cap} en=${s.en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  /* ── slides 3-4: RAND-SELECT, the slide example (pivot 6, k = 4, then the 3rd smallest of the upper part) or your own ── */
  function partition(A, p, q) { // the slides' PARTITION (Lecture 5): pivot x = A[p], 1-based indices
    const x = A[p - 1]; let i = p;
    for (let j = p + 1; j <= q; j++) if (A[j - 1] <= x) { i++; [A[i - 1], A[j - 1]] = [A[j - 1], A[i - 1]]; }
    [A[p - 1], A[i - 1]] = [A[i - 1], A[p - 1]]; return i;
  }
  function selTrace(A0, i0, rnd) {
    const A = [...A0], steps = []; let p = 1, q = A.length, i = i0;
    for (;;) {
      const call = `RAND-SELECT(A, ${p}, ${q}, ${i})`;
      if (p === q) { steps.push({ A: [...A], p, q, r: p, done: p, en: `${call}: p = q, so return A[${p}] = <b>${A[p - 1]}</b>, the ${ord(i0)} smallest.` }); break; }
      const t = rnd ? p + Math.floor(Math.random() * (q - p + 1)) : p;
      steps.push({ A: [...A], p, q, pick: t, en: `${call}: ${rnd ? 'RAND-PARTITION picks' : 'the pivot is'} A[${t}] = ${A[t - 1]}${rnd ? '' : (steps.length === 0 && A0 === EX ? ' (as on the slide)' : ' (the slides stop here; we keep taking the first element, as if RAND-PARTITION picked it)')}.` });
      if (t !== p) [A[p - 1], A[t - 1]] = [A[t - 1], A[p - 1]];
      const r = partition(A, p, q), k = r - p + 1;
      const tail = i === k ? `i = k, so return A[${r}] = <b>${A[r - 1]}</b>.` : i < k ? `i = ${i} &lt; k: select the ${ord(i)} smallest in the lower part A[${p}..${r - 1}].` : `i = ${i} &gt; k: select the ${i} − ${k} = ${ord(i - k)} smallest in the upper part A[${r + 1}..${q}].`;
      steps.push({ A: [...A], p, q, r, k, done: i === k ? r : 0, en: `Partition: ${A.slice(p - 1, r - 1).length ? 'A[' + p + '..' + (r - 1) + '] ≤ ' + A[r - 1] : 'nothing is smaller'}, pivot at r = ${r}, ${r < q ? 'A[' + (r + 1) + '..' + q + '] ≥ ' + A[r - 1] : 'nothing is larger'}. k = r − p + 1 = <b>${k}</b>. ${tail}` });
      if (i === k) break;
      if (i < k) q = r - 1; else { p = r + 1; i = i - k; }
    }
    return steps;
  }
  function SelRun({ A, i0, rnd, head }) {
    const steps = useMemo(() => selTrace(A, i0, rnd), [A, i0, rnd]);
    const [i, ctl] = useSteps(steps.length, 2300), s = steps[i];
    const cls = j => { const x = j + 1; if (s.done) return x === s.done ? ' pv sel' : ' out'; if (x < s.p || x > s.q) return ' out'; if (s.pick) return x === s.pick ? ' pv' : ''; if (s.r) return x < s.r ? ' lo' : x === s.r ? ' pv' : ' hi'; return ''; };
    return html`<div className="fig-stage">${head}
      <div className="a7-arr">${s.A.map((v, j) => html`<div key=${j} className=${'a7-cell' + cls(j)}><b>${v}</b><i>${j + 1}</i></div>`)}</div>
      <div className="a7-c a7-sp" style=${{ fontSize: '.95rem' }}>p = ${s.p}, q = ${s.q}${s.r ? html`, r = ${s.r}` : ''}${s.k ? html`, <b className="a7-k">k = ${s.k}</b>` : ''}</div>
      <div className="a7-key"><span style=${{ '--sw': 'color-mix(in srgb, var(--fig-k) 25%, var(--paper))' }}>≤ A[r]</span><span style=${{ '--sw': 'color-mix(in srgb, var(--ok) 32%, var(--paper))' }}>pivot A[r]</span><span style=${{ '--sw': 'color-mix(in srgb, var(--pen) 22%, var(--paper))' }}>≥ A[r]</span></div>
      </div><${Cap} en=${s.en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} />`;
  }
  function RandSel() {
    const [cfg, setCfg] = useState({ A: EX, i: 7, rnd: false, id: 0 }), [txt, setTxt] = useState('6, 10, 13, 5, 8, 3, 2, 11'), [it, setIt] = useState('7'), [err, setErr] = useState('');
    const run = () => {
      const A = txt.split(/[\s,]+/).filter(Boolean).map(Number), i = +it;
      if (A.length < 2 || A.length > 12) return setErr('Enter 2 to 12 numbers.');
      if (A.some(v => !Number.isInteger(v) || Math.abs(v) > 999)) return setErr('Use whole numbers from −999 to 999.');
      if (new Set(A).size !== A.length) return setErr('The slides assume distinct elements: remove repeats.');
      if (!Number.isInteger(i) || i < 1 || i > A.length) return setErr(`i must be from 1 to ${A.length}.`);
      setErr(''); setCfg({ A, i, rnd: true, id: Date.now() });
    };
    const head = html`<div className="a7-form"><label style=${{ flex: '1 1 180px' }}>A <input style=${{ width: '100%' }} value=${txt} onChange=${e => setTxt(e.target.value)} aria-label="array" /></label>
        <label>i <input style=${{ width: '44px' }} value=${it} inputMode="numeric" onChange=${e => setIt(e.target.value)} /></label></div>
      <div className="a7-form"><button className="fig-btn solid" onClick=${run}>Run (random pivots)</button>
        <button className="fig-btn" onClick=${() => { setTxt('6, 10, 13, 5, 8, 3, 2, 11'); setIt('7'); setErr(''); setCfg({ A: EX, i: 7, rnd: false, id: Date.now() }); }}>Example from the slides</button></div>
      ${err && html`<div className="a7-err">${err}</div>`}
      <div className="a7-c a7-mut" style=${{ marginBottom: '8px' }}>Select the i = ${cfg.i}${ord(cfg.i).replace(/^\d+/, '')} smallest</div>`;
    return html`<figure className="fig"><${SelRun} key=${cfg.id} A=${cfg.A} i0=${cfg.i} rnd=${cfg.rnd} head=${head} /></figure>`;
  }

  /* ── slide 5: lucky 9:1 splits against unlucky 0 : n−1 splits (picture for n = 100) ── */
  function Lucky() {
    const n = 100, lucky = []; for (let s = n; s >= 1; s *= .9) lucky.push(s);
    const unl = Array.from({ length: n }, (_, j) => n - j);
    const sumL = lucky.reduce((a, b) => a + b, 0), sumU = n * (n + 1) / 2, nlg = n * Math.log2(n);
    const steps = [
      { en: 'All elements distinct. Each call partitions in Θ(n) and then recurses on <b>one</b> side only. Each bar is one call; its length is the size of the array it partitions (n = 100).' },
      { L: 1, en: `<b>Lucky</b>: always a 9 : 1 split, keep 9n/10. T(n) = T(9n/10) + Θ(n). n<sup>log<sub>10/9</sub>1</sup> = n<sup>0</sup> = 1 ⇒ Case 3 ⇒ <b>Θ(n)</b>. Total work ${Math.round(sumL)} ≤ 10n = ${10 * n}.` },
      { L: 1, U: 1, en: `<b>Unlucky</b>: always a 0 : n−1 split. T(n) = T(n−1) + Θ(n), an arithmetic series ⇒ <b>Θ(n<sup>2</sup>)</b>. Total work n(n+1)/2 = ${sumU}.` },
      { L: 1, U: 1, W: 1, en: `<b>Worse than sorting!</b> n lg n ≈ ${Math.round(nlg)} for n = 100, against ${sumU} in the unlucky case. Randomizing the pivot makes the unlucky case very unlikely.` }
    ];
    const [i, ctl] = useSteps(steps.length, 2600), s = steps[i];
    const bh = 1.8, Y = 40, wx = v => v / n * 128;
    return html`<figure className="fig"><div className="fig-stage">
      <svg className="a7-svg" viewBox="0 0 300 260" role="img" aria-label="Sizes of the recursive calls in the lucky and the unlucky case">
        <text x="75" y="22" textAnchor="middle" fontSize="16" fontWeight="700">Lucky 9 : 1</text>
        <text x="225" y="22" textAnchor="middle" fontSize="16" fontWeight="700">Unlucky 0 : n−1</text>
        <g className="a7-fade" style=${{ opacity: s.L ? 1 : .15 }}>${lucky.map((v, j) => html`<rect key=${j} x=${75 - wx(v) / 2} y=${Y + j * bh} width=${wx(v)} height=${bh - .3} fill="var(--fig-k)" />`)}
          <text x="75" y=${Y + lucky.length * bh + 22} textAnchor="middle" fontSize="15">${lucky.length} calls</text>
          <text x="75" y=${Y + lucky.length * bh + 42} textAnchor="middle" fontSize="15">work ≈ ${Math.round(sumL)}</text></g>
        <g className="a7-fade" style=${{ opacity: s.U ? 1 : .15 }}>${unl.map((v, j) => html`<rect key=${j} x=${225 - wx(v) / 2} y=${Y + j * bh} width=${wx(v)} height=${bh - .3} fill="var(--pen)" />`)}
          <text x="225" y=${Y + n * bh + 18} textAnchor="middle" fontSize="15">${n} calls, work ${sumU}</text></g>
      </svg>
      ${s.W && html`<div className="a7-box a7-c">sorting: n lg n ≈ ${Math.round(nlg)} · unlucky select: ${sumU}</div>`}
      </div><${Cap} en=${s.en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  /* ── slides 6-17: expected time of RAND-SELECT, with the splits drawn for n = 8 (or 9) ── */
  const EXL = [
    ['X<sub>k</sub> = 1 if PARTITION generates a k : n−k−1 split, 0 otherwise (k = 0, 1, …, n−1)', 'Slide 6: one indicator per possible split. Exactly one X<sub>k</sub> is 1.'],
    ['T(n) = Σ<sub>k=0</sub><sup>n−1</sup> X<sub>k</sub> (T(max{k, n−k−1}) + Θ(n))', 'Slide 7: for an upper bound, assume the i-th element always falls in the <b>larger</b> side, of size max{k, n−k−1} (outlined).'],
    ['E[T(n)] = E[Σ<sub>k=0</sub><sup>n−1</sup> X<sub>k</sub> (T(max{k, n−k−1}) + Θ(n))]', 'Slide 8: take expectations of both sides.'],
    ['= Σ<sub>k=0</sub><sup>n−1</sup> E[X<sub>k</sub> (T(max{k, n−k−1}) + Θ(n))]', 'Slide 9: linearity of expectation.'],
    ['= Σ<sub>k=0</sub><sup>n−1</sup> E[X<sub>k</sub>] · E[T(max{k, n−k−1}) + Θ(n)]', 'Slide 10: X<sub>k</sub> is independent of the other random choices.'],
    ['= (1/n) Σ<sub>k=0</sub><sup>n−1</sup> E[T(max{k, n−k−1})] + (1/n) Σ<sub>k=0</sub><sup>n−1</sup> Θ(n)', 'Slide 11: linearity again, and E[X<sub>k</sub>] = 1/n since every split is equally likely.'],
    ['≤ (2/n) Σ<sub>k=⌊n/2⌋</sub><sup>n−1</sup> E[T(k)] + Θ(n)', 'Slide 12: <b>upper terms appear twice</b>: max{k, n−k−1} takes each value from ⌊n/2⌋ to n−1 twice (once only for the middle one when n is odd).'],
    ['Prove E[T(n)] ≤ cn. Fact: Σ<sub>k=⌊n/2⌋</sub><sup>n−1</sup> k ≤ (3/8) n<sup>2</sup>', 'Slide 13: choose c large enough for the base cases, and use the fact (an exercise).'],
    ['E[T(n)] ≤ (2/n) Σ<sub>k=⌊n/2⌋</sub><sup>n−1</sup> ck + Θ(n)', 'Slide 14: substitute the inductive hypothesis E[T(k)] ≤ ck.'],
    ['≤ (2c/n)((3/8) n<sup>2</sup>) + Θ(n)', 'Slide 15: use the fact.'],
    ['= cn − (cn/4 − Θ(n))', 'Slide 16: (2c/n)(3/8)n<sup>2</sup> = (3/4)cn; express as desired minus residual.'],
    ['≤ cn', 'Slide 17: true if c is chosen large enough that cn/4 dominates the Θ(n). So <b>E[T(n)] = Θ(n)</b>.']
  ];
  function Expect() {
    const [n, setN] = useState(8);
    const steps = EXL.map(l => ({ en: l[1] }));
    const [i, ctl] = useSteps(steps.length, 2600);
    const mx = k => Math.max(k, n - k - 1), lo = Math.floor(n / 2);
    const fact = (() => { let s = 0; for (let k = lo; k <= n - 1; k++) s += k; return s; })();
    const U = 20, X0 = 44, RH = 20, Y0 = 8;
    const tone = ['var(--fig-k)', 'var(--pen)', 'var(--ok)', 'var(--graphite)', 'var(--fig-k)'];
    const panel = i <= 7;
    const first = Math.max(0, i - 2);
    return html`<figure className="fig"><div className="fig-stage">
      ${panel && html`<${Tabs} items=${['n = 8', 'n = 9']} v=${n - 8} set=${j => setN(8 + j)} />`}
      ${panel && html`<svg className="a7-svg" viewBox=${`0 0 300 ${Y0 + n * RH + 6}`} role="img" aria-label=${'All ' + n + ' splits k : n−k−1 with the larger side marked'}>
        ${Array.from({ length: n }, (_, k) => { const y = Y0 + k * RH, big = mx(k), left = k >= n - k - 1;
          return html`<g key=${k}><text x=${X0 - 6} y=${y + 15} textAnchor="end" fontSize="15">k=${k}</text>
            ${k > 0 && html`<rect x=${X0} y=${y + 2} width=${k * U} height=${RH - 5} rx="3" fill="color-mix(in srgb, var(--fig-k) 25%, var(--paper))" />`}
            <rect x=${X0 + k * U} y=${y + 2} width=${U} height=${RH - 5} rx="3" fill="color-mix(in srgb, var(--ok) 40%, var(--paper))" />
            ${n - k - 1 > 0 && html`<rect x=${X0 + (k + 1) * U} y=${y + 2} width=${(n - k - 1) * U} height=${RH - 5} rx="3" fill="color-mix(in srgb, var(--pen) 22%, var(--paper))" />`}
            ${i >= 1 && big > 0 && html`<rect x=${left ? X0 : X0 + (k + 1) * U} y=${y + 1} width=${big * U} height=${RH - 3} rx="3" fill="none" stroke=${i >= 6 ? tone[big - lo] || 'var(--ink)' : 'var(--ink)'} strokeWidth="2.2" />`}
            <text x=${X0 + n * U + 8} y=${y + 15} fontSize="15" style=${{ fill: i >= 6 ? (tone[big - lo] || 'var(--ink)') : 'var(--ink)' }} fontWeight=${i >= 6 ? 700 : 400}>${i === 5 ? 'p = 1/' + n : i >= 1 ? 'max ' + big : ''}</text></g>`; })}
      </svg>`}
      ${panel && i === 0 && html`<div className="a7-c a7-mut">left part k (≤ pivot), pivot, right part n−k−1</div>`}
      ${panel && i === 6 && html`<div className="a7-c a7-mut">${Array.from({ length: n - lo }, (_, j) => { const v = lo + j, c = Array.from({ length: n }, (_, k) => mx(k)).filter(x => x === v).length; return `${v} ×${c}`; }).join(' · ')}</div>`}
      ${panel && i === 7 && html`<div className="a7-box a7-c">n = ${n}: Σ<sub>k=${lo}</sub><sup>${n - 1}</sup> k = ${Array.from({ length: n - lo }, (_, j) => lo + j).join(' + ')} = <b>${fact}</b> ≤ (3/8)·${n}<sup>2</sup> = ${(3 * n * n / 8).toFixed(3).replace(/\.?0+$/, '')} ✓</div>`}
      <div className="a7-lines a7-sp">${EXL.slice(first, i + 1).map((l, j) => html`<div key=${first + j} className=${'a7-ln' + (first + j === i ? ' on' : ' dim')} dangerouslySetInnerHTML=${H(l[0])}></div>`)}</div>
      </div><${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  /* ── slides 20-26: choosing the pivot, groups of 5 and the median of medians (n = 44 as drawn) ── */
  function Mom() {
    const [n, setN] = useState(44);
    const g = Math.floor(n / 5), r = n % 5, cols = g + (r ? 1 : 0), m = Math.ceil(g / 2) - 1;
    const steps = [
      { en: `The n = ${n} elements.` },
      { en: `1. Divide the n elements into groups of 5: ⌊n/5⌋ = ${g} groups${r ? ` (${r} left over)` : ''}.` },
      { en: '1. Find the median of each 5-element group by rote. Arrows point from greater to lesser: lesser on top.' },
      { en: `2. Recursively SELECT the median <b>x</b> of the ⌊n/5⌋ = ${g} group medians to be the pivot (groups drawn in order of their medians).` },
      { en: `At least half the group medians are ≤ x: at least ⌊⌊n/5⌋/2⌋ = ⌊n/10⌋ = <b>${Math.floor(n / 10)}</b> group medians.` },
      { en: `Each of them has 2 more elements above it in its group, so at least <b>3⌊n/10⌋ = ${3 * Math.floor(n / 10)}</b> elements are ≤ x (here the block holds ${3 * (m + 1)}).` },
      { en: `Similarly, at least <b>3⌊n/10⌋ = ${3 * Math.floor(n / 10)}</b> elements are ≥ x (here ${3 * (g - m)}). So x is never too close to either end.` }
    ];
    const [i, ctl] = useSteps(steps.length, 2300);
    const dx = Math.min(34, 272 / cols), X = c => 14 + dx / 2 + c * dx, Y = row => 22 + row * 34, R = Math.min(8, dx / 3.2);
    const dots = []; for (let c = 0; c < cols; c++) { const h = c < g ? 5 : r; for (let row = 0; row < h; row++) dots.push([c, row]); }
    const blue = 'color-mix(in srgb, var(--fig-k) 30%, var(--paper))';
    return html`<figure className="fig"><div className="fig-stage">
      <div className="a7-form"><button className="fig-btn" disabled=${n <= 15} onClick=${() => setN(n - 1)} aria-label="fewer elements">− 1</button><span>n = <b>${n}</b></span><button className="fig-btn" disabled=${n >= 60} onClick=${() => setN(n + 1)} aria-label="more elements">+ 1</button>
        ${n !== 44 && html`<button className="fig-btn" onClick=${() => setN(44)}>n = 44 (slides)</button>`}</div>
      <svg className="a7-svg" viewBox="0 0 300 196" role="img" aria-label="Elements in groups of five with the median of medians x">
        <defs><marker id="a7-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--ink)" /></marker></defs>
        ${i >= 1 && Array.from({ length: g }, (_, c) => html`<rect key=${'g' + c} x=${X(c) - dx * .42} y=${Y(0) - 14} width=${dx * .84} height=${Y(4) - Y(0) + 28} rx="6" fill="color-mix(in srgb, var(--pen) 20%, var(--paper))" />`)}
        ${i === 4 && html`<rect x=${X(0) - dx * .48} y=${Y(2) - 13} width=${X(m) - X(0) + dx * .96} height="26" rx="8" fill=${blue} />`}
        ${i === 5 && html`<rect x=${X(0) - dx * .48} y=${Y(0) - 15} width=${X(m) - X(0) + dx * .96} height=${Y(2) - Y(0) + 30} rx="10" fill=${blue} />`}
        ${i === 6 && html`<rect x=${X(m) - dx * .48} y=${Y(2) - 15} width=${X(g - 1) - X(m) + dx * .96} height=${Y(4) - Y(2) + 30} rx="10" fill=${blue} />`}
        ${i >= 2 && Array.from({ length: g }, (_, c) => [0, 1, 2, 3].map(row => html`<line key=${c + '-' + row} x1=${X(c)} y1=${Y(row + 1) - R - 1} x2=${X(c)} y2=${Y(row) + R + 2} stroke="var(--ink)" strokeWidth="1.3" markerEnd="url(#a7-ah)" />`))}
        ${i >= 3 && Array.from({ length: g - 1 }, (_, c) => html`<line key=${'m' + c} x1=${X(c + 1) - R - 1} y1=${Y(2)} x2=${X(c) + R + 2} y2=${Y(2)} stroke="var(--ink)" strokeWidth="1.3" markerEnd="url(#a7-ah)" />`)}
        ${dots.map(([c, row]) => { const med = i >= 2 && c < g && row === 2, isx = i >= 3 && med && c === m;
          return html`<circle key=${c + ':' + row} cx=${X(c)} cy=${Y(row)} r=${R} fill=${isx ? '#d23c3c' : med ? '#f2d43a' : '#138a85'} stroke="var(--ink)" strokeWidth="1" />`; })}
        ${i >= 3 && html`<text x=${X(m) + R + 2} y=${Y(2) + 18} fontSize="17" fontStyle="italic" fontWeight="700" style=${{ fill: 'var(--fig-k)' }}>x</text>`}
      </svg>
      <div className="a7-key"><span style=${{ '--sw': '#f2d43a' }}>group median</span><span style=${{ '--sw': '#d23c3c' }}>x</span><span style=${{ '--sw': 'color-mix(in srgb, var(--pen) 20%, var(--paper))' }}>group of 5</span><span>↑ lesser · greater ↓</span></div>
      </div><${Cap} en=${steps[i].en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  /* ── slide 27: for n ≥ 50, 3⌊n/10⌋ ≥ n/4 ── */
  function N50() {
    const [n, setN] = useState(50);
    const lo = 10, hi = 80, X0 = 40, X1 = 306, Y0 = 186, Y1 = 14, ymax = 24;
    const sx = v => X0 + (v - lo) / (hi - lo) * (X1 - X0), sy = v => Y0 - v / ymax * (Y0 - Y1);
    let step = ''; for (let m = lo; m <= hi; m++) { const v = 3 * Math.floor(m / 10); step += (m === lo ? 'M' : 'L') + sx(m) + ',' + sy(v) + ' '; if (m < hi) step += 'L' + sx(m + 1) + ',' + sy(v) + ' '; }
    let last = 0; for (let m = 1; m <= 200; m++) if (3 * Math.floor(m / 10) < m / 4) last = m;
    const a = 3 * Math.floor(n / 10), b = n / 4, ok = a >= b;
    return html`<figure className="fig"><div className="fig-stage">
      <svg className="a7-svg" viewBox="0 0 320 214" role="img" aria-label="3 times floor of n over 10 against n over 4">
        <rect x=${sx(50)} y=${Y1} width=${X1 - sx(50)} height=${Y0 - Y1} fill="var(--ok)" opacity=".12" />
        <line x1=${X0} y1=${Y0} x2=${X1} y2=${Y0} stroke="var(--graphite)" strokeWidth="1.5" /><line x1=${X0} y1=${Y0} x2=${X0} y2=${Y1} stroke="var(--graphite)" strokeWidth="1.5" />
        ${[10, 30, 50, 70].map(v => html`<text key=${v} x=${sx(v)} y=${Y0 + 20} textAnchor="middle" fontSize="15">${v}</text>`)}
        ${[0, 12, 24].map(v => html`<text key=${v} x=${X0 - 6} y=${sy(v) + 5} textAnchor="end" fontSize="15">${v}</text>`)}
        <path d=${step} fill="none" stroke="var(--fig-k)" strokeWidth="2.5" />
        <line x1=${sx(lo)} y1=${sy(lo / 4)} x2=${sx(hi)} y2=${sy(hi / 4)} stroke="var(--pen)" strokeWidth="2.5" />
        <line x1=${sx(n)} y1=${Y0} x2=${sx(n)} y2=${Y1} stroke="var(--ink)" opacity=".5" />
        <circle cx=${sx(n)} cy=${sy(a)} r="5" fill="var(--fig-k)" /><circle cx=${sx(n)} cy=${sy(b)} r="5" fill="var(--pen)" />
        <text x=${sx(52)} y=${Y1 + 18} fontSize="15" style=${{ fill: 'var(--ok)' }} fontWeight="700">n ≥ 50</text>
      </svg>
      <div className="a7-c" style=${{ fontSize: '.92rem' }}><span className="a7-k">3⌊n/10⌋</span> · <span className="a7-p">n/4</span></div>
      <input className="a7-rng" type="range" min=${lo} max=${hi} step="1" value=${n} aria-label="n" onChange=${e => setN(+e.target.value)} />
      <div className="a7-c" style=${{ fontSize: '.95rem', marginTop: '4px' }}>n = ${n}: 3⌊n/10⌋ = ${a}, n/4 = ${b} <b className=${ok ? 'a7-g' : 'a7-p'}>${ok ? '✓ ≥' : '✗ <'}</b></div>
      </div><${Cap} en=${`For n ≥ 50, 3⌊n/10⌋ ≥ n/4 (the last n where it fails is ${last}), so the recursive call in step 4 works on at most n − 3⌊n/10⌋ ≤ <b>3n/4</b> elements. For n &lt; 50 the worst-case time is Θ(1).`} /></figure>`;
  }

  /* ── slides 28-30: the recurrence of SELECT and its solution ── */
  function SelRec() {
    const code = [['T(n)', '<b>SELECT(i, n)</b>'], ['Θ(n)', '1. Divide the n elements into groups of 5. Find the median of each 5-element group by rote.'], ['T(n/5)', '2. Recursively SELECT the median x of the ⌊n/5⌋ group medians to be the pivot.'],
      ['Θ(n)', '3. Partition around the pivot x. Let k = rank(x).'], ['T(3n/4)', '4. if i = k then return x; elseif i &lt; k then recursively SELECT the i-th smallest element in the lower part, else recursively SELECT the (i−k)-th smallest element in the upper part.']];
    const L = ['T(n) = T(n/5) + T(3n/4) + Θ(n)', 'T(n) ≤ (1/5)cn + (3/4)cn + Θ(n)', '= (19/20)cn + Θ(n)', '= cn − ((1/20)cn − Θ(n))', '≤ cn'];
    const steps = [
      { c: 1, en: 'Step 1: ⌊n/5⌋ groups, each median by rote in constant time: <b>Θ(n)</b>.' },
      { c: 2, en: 'Step 2: a recursive SELECT on the ⌊n/5⌋ medians: <b>T(n/5)</b>.' },
      { c: 3, en: 'Step 3: partition around x: <b>Θ(n)</b>.' },
      { c: 4, en: 'Step 4: at most 3n/4 elements remain (for n ≥ 50): <b>T(3n/4)</b>.' },
      { l: 1, en: 'Slide 29: add the costs up.' },
      { l: 2, en: 'Substitution: assume T(k) ≤ ck for smaller k.' },
      { l: 3, en: '1/5 + 3/4 = 19/20.' },
      { l: 4, en: 'Express as desired minus residual.' },
      { l: 5, en: '≤ cn if c is chosen large enough to handle both the Θ(n) and the initial conditions: <b>T(n) = Θ(n)</b> in the worst case.' },
      { t: 1, en: 'Slide 30: each level of recursion does a constant fraction 19/20 of the work above it, a geometric series dominated by the linear work at the root.' },
      { t: 2, en: 'In practice this algorithm runs slowly (the constant in front of n is large); the randomized algorithm is far more practical. Exercise: why not groups of 3?' }
    ];
    const [i, ctl] = useSteps(steps.length, 2400), s = steps[i];
    const N = [[150, 22, 'n', 0], [75, 74, 'n/5', 1], [225, 74, '3n/4', 1], [34, 126, 'n/25', 2], [110, 126, '3n/20', 2], [190, 126, '3n/20', 2], [266, 126, '9n/16', 2]];
    const E = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]];
    return html`<figure className="fig"><div className="fig-stage">
      ${!s.t && html`<table className="a7-tbl"><tbody>${code.map((c, j) => html`<tr key=${j} className=${s.c === j ? 'on' : ''}><td>${c[0]}</td><td dangerouslySetInnerHTML=${H(c[1])}></td></tr>`)}</tbody></table>`}
      ${s.l && html`<div className="a7-lines a7-sp">${L.slice(0, s.l).map((l, j) => html`<div key=${j} className=${'a7-ln' + (j === s.l - 1 ? ' on' : '')}>${l}</div>`)}</div>`}
      ${s.t && html`<svg className="a7-svg" viewBox="0 0 300 140" role="img" aria-label="Recursion tree of T(n/5) + T(3n/4) + n">
        ${E.map(([a, b], j) => html`<line key=${j} x1=${N[a][0]} y1=${N[a][1] + 6} x2=${N[b][0]} y2=${N[b][1] - 16} stroke="var(--graphite)" strokeWidth="1.5" />`)}
        ${N.map((d, j) => html`<text key=${j} x=${d[0]} y=${d[1]} textAnchor="middle" fontSize="17" fontWeight="600" style=${{ fill: 'var(--fig-k)' }}>${d[2]}</text>`)}</svg>
        <div className="a7-lines"><div className="a7-ln">level 0: n</div><div className="a7-ln">level 1: (1/5 + 3/4) n = (19/20) n</div><div className="a7-ln">level 2: (1/25 + 3/20 + 3/20 + 9/16) n = (19/20)<sup>2</sup> n</div>
        <div className="a7-ln on">total ≤ n (1 + 19/20 + (19/20)<sup>2</sup> + …) = 20n = Θ(n)</div></div>`}
      </div><${Cap} en=${s.en} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  window.FIGS = Object.assign(window.FIGS || {}, {
    'ag-7-rank': Rank, 'ag-7-randsel': RandSel, 'ag-7-lucky': Lucky, 'ag-7-expect': Expect, 'ag-7-mom': Mom, 'ag-7-n50': N50, 'ag-7-selrec': SelRec
  });
})();
/* ── part L1 ── */
// Algorithms visuals, Lecture 1 (Introduction: insertion sort, asymptotic analysis, merge sort, recursion tree, Neapolitan ch. 1):
// insertion sort trace (slides 1.7-1.18), its cases (1.20, 1.24), Θ-notation (1.22), asymptotic crossover (1.23), merge (1.26-1.38),
// recursion tree (1.41-1.51), exchange sort / every-case (1.55, 1.65), sequential and binary search (1.53, 1.57-1.58, 1.67-1.70),
// Fibonacci (1.59-1.63), applying the theory and order (1.71-1.74). Every label and number comes from the slides.
(function () {
  const { useState, useEffect, useRef, useMemo } = React;
  const { html, useSteps, Cap, Bar, pop, calm, useClock, useFit, sec } = window.FIGKIT;
  const CSS = `
.a1-wrap{ max-width:520px; margin:0 auto; }
.a1-idx{ display:grid; gap:4px; justify-content:center; margin:0 auto 2px; }
.a1-idx span{ text-align:center; font-size:12px; color:var(--graphite); }
.a1-row{ display:grid; gap:4px; justify-content:center; margin:0 auto 5px; transition:opacity .4s; }
.a1-row.old{ opacity:.5; }
.a1-c{ height:34px; border:1px solid var(--line); border-radius:6px; background:var(--paper); display:grid; place-items:center; font-weight:600; font-size:15px; color:var(--ink); transition:background .3s, color .3s; }
.a1-c.s{ background:color-mix(in srgb, var(--fig-k) 16%, var(--paper)); }
.a1-c.k{ background:var(--fig-s); color:#fff; border-color:transparent; }
.a1-c.mv{ border:2px dashed var(--fig-k); }
.a1-c.ok{ background:color-mix(in srgb, var(--ok) 22%, var(--paper)); }
.a1-c.no{ opacity:.45; }
.a1-tag{ text-align:center; font-size:12.5px; color:var(--graphite); margin:2px 0 6px; }
.a1-seg{ display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin:0 0 10px; }
.a1-seg .fig-btn[aria-pressed="true"]{ background:var(--fig-s); color:#fff; border-color:transparent; }
.a1-try{ padding:10px 14px 12px; border-top:1px solid var(--line); display:grid; gap:8px; }
.a1-lab{ display:grid; gap:4px; font-size:13px; color:var(--graphite); }
.a1-in{ font:inherit; font-size:15px; padding:7px 9px; border-radius:6px; border:1px solid var(--line); background:var(--paper); color:var(--ink); width:100%; box-sizing:border-box; min-width:0; }
.a1-btns{ display:flex; flex-wrap:wrap; gap:8px; }
.a1-err{ margin:0; font-size:13px; color:var(--pen); }
.a1-hint{ margin:0; font-size:12.5px; color:var(--graphite); }
.a1-cnt{ font-size:13px; color:var(--graphite); }
.a1-two{ display:grid; grid-template-columns:auto auto; gap:26px; justify-content:center; align-items:end; }
.a1-col{ display:grid; gap:5px; justify-items:center; }
.a1-col b{ font-size:13px; color:var(--graphite); font-weight:600; }
.a1-ball{ width:40px; height:34px; border-radius:17px; display:grid; place-items:center; font-weight:600; font-size:15px; border:1px solid var(--line); background:var(--paper); color:var(--ink); }
.a1-ball.h{ background:color-mix(in srgb, var(--fig-k) 26%, var(--paper)); border:2px solid var(--fig-k); }
.a1-ball.w{ background:var(--fig-s); color:#fff; border-color:transparent; }
.a1-out{ display:flex; flex-wrap:wrap; gap:5px; justify-content:center; min-height:36px; margin-top:12px; padding-top:10px; border-top:1px dashed var(--line); }
.a1-out .a1-c{ width:36px; }
.a1-tri{ display:grid; gap:3px; justify-content:center; margin:10px auto 0; }
.a1-tri span{ width:26px; height:22px; border-radius:4px; font-size:12px; display:grid; place-items:center; color:var(--graphite); }
.a1-tri .e{ border:1px solid var(--line); background:var(--paper); }
.a1-tri .d{ background:color-mix(in srgb, var(--fig-k) 30%, var(--paper)); color:var(--ink); }
.a1-tri .n{ background:var(--fig-s); color:#fff; }
.a1-bars{ display:grid; grid-template-columns:auto 1fr auto; gap:5px 8px; align-items:center; max-width:440px; margin:0 auto; font-size:13px; }
.a1-bars .t{ height:16px; border-radius:4px; background:var(--fig-s); transition:width .5s; min-width:2px; }
.a1-bars .l{ color:var(--graphite); } .a1-bars .v{ font-weight:600; color:var(--ink); }
.a1-sum{ text-align:center; font-size:14px; margin:10px 0 0; color:var(--ink); }
.a1-tbl{ width:100%; max-width:480px; margin:0 auto; border-collapse:collapse; font-size:13px; table-layout:fixed; }
.a1-tbl th, .a1-tbl td{ border:1px solid var(--line); padding:4px 3px; text-align:center; color:var(--ink); overflow-wrap:anywhere; }
.a1-tbl th{ background:color-mix(in srgb, var(--fig-k) 16%, var(--paper)); font-weight:600; }
.a1-tbl td{ background:var(--paper); }
.a1-tbl sup{ font-size:.9em; }
.a1-tbl.au{ table-layout:auto; } .a1-tbl.au td, .a1-tbl.au th{ overflow-wrap:normal; padding:4px 2px; }
.a1-tbl tr.on td{ background:color-mix(in srgb, var(--fig-k) 24%, var(--paper)); font-weight:600; }
.a1-tbl tr.off td{ opacity:.3; }
.a1-chips{ display:flex; flex-wrap:wrap; gap:4px; justify-content:center; margin:8px 0 0; }
.a1-chips span{ font-size:12.5px; padding:3px 7px; border-radius:99px; border:1px solid var(--line); background:var(--paper); color:var(--ink); }
.a1-big{ display:grid; grid-template-columns:1fr 1fr; gap:8px; max-width:420px; margin:0 auto; }
.a1-big div{ border:1px solid var(--line); border-radius:8px; background:var(--paper); padding:8px; text-align:center; font-size:13px; color:var(--graphite); }
.a1-big b{ display:block; font-size:18px; color:var(--ink); overflow-wrap:anywhere; }
.a1-range{ width:100%; accent-color:var(--fig-s); }
.a1-share{ height:12px; border-radius:4px; background:var(--line); overflow:hidden; }
.a1-share i{ display:block; height:100%; background:var(--fig-s); transition:width .5s; }
@media (prefers-reduced-motion: reduce){ .a1-c, .a1-row, .a1-bars .t, .a1-share i{ transition:none; } }`;
  if (!document.getElementById('a1-css')) { const s = document.createElement('style'); s.id = 'a1-css'; s.textContent = CSS; document.head.appendChild(s); }

  const F = React.Fragment;
  const fmt = x => x.toLocaleString('en-US');
  // Back / Next / Replay; long walks show "step k / n" instead of dots so the bar never gets wider than a phone
  function Nav({ n, i, ctl }) {
    if (n <= 12) return html`<${Bar} steps=${Array.from({ length: n })} i=${i} ctl=${ctl} />`;
    return html`<div className="fig-bar"><span className="a1-cnt">step ${i + 1} / ${n}</span><span className="grow"></span>
      <button className="fig-btn" onClick=${() => ctl.go(Math.max(0, i - 1))} disabled=${i === 0} aria-label="Previous step">‹ Back</button>
      <button className="fig-btn" onClick=${() => ctl.go(Math.min(n - 1, i + 1))} disabled=${i === n - 1} aria-label="Next step">Next ›</button>
      <button className="fig-btn" onClick=${ctl.replay}>↻ Replay</button></div>`;
  }
  // stage + caption + bar for a list of steps; remount it (key) when the input changes
  function Walk({ steps, ms, view, top }) {
    const [i, ctl] = useSteps(steps.length, ms), s = steps[Math.min(i, steps.length - 1)];
    return html`<${F}><div className="fig-stage">${top}${view(s, i)}</div><${Cap} en=${s.en} /><${Nav} n=${steps.length} i=${i} ctl=${ctl} /></${F}>`;
  }
  const Seg = ({ opts, val, set }) => html`<div className="a1-seg">${opts.map(([k, t]) => html`<button key=${k} className="fig-btn" aria-pressed=${String(val === k)} onClick=${() => set(k)}>${t}</button>`)}</div>`;
  function parseNums(s, { min = 2, max = 8, lo = -99, hi = 999 } = {}) {
    const p = String(s).trim().split(/[\s,]+/).filter(Boolean);
    if (p.length < min || p.length > max) return { err: `Enter ${min} to ${max} whole numbers, separated by spaces or commas.` };
    const v = p.map(Number);
    if (v.some(x => !Number.isInteger(x) || x < lo || x > hi)) return { err: `Use whole numbers from ${lo} to ${hi}.` };
    return { val: v };
  }
  function TryBox({ label, ex, parse, onOk, hint }) {
    const [t, setT] = useState(ex), [err, setErr] = useState('');
    const run = v => { const r = parse(v); if (r.err) setErr(r.err); else { setErr(''); onOk(r.val); } };
    return html`<div className="a1-try"><label className="a1-lab">${label}<input className="a1-in" value=${t} onChange=${e => setT(e.target.value)} onKeyDown=${e => { if (e.key === 'Enter') run(t); }} /></label>
      <div className="a1-btns"><button className="fig-btn solid" onClick=${() => run(t)}>Run</button><button className="fig-btn" onClick=${() => { setT(ex); run(ex); }}>Example from the slides</button></div>
      ${err ? html`<p className="a1-err" role="alert">${err}</p>` : html`<p className="a1-hint">${hint}</p>`}</div>`;
  }
  const cols = n => ({ gridTemplateColumns: `repeat(${n}, minmax(0, 36px))` });

  /* ── slides 1.7-1.18: INSERTION-SORT on the slide's array, step by step ── */
  function isortSteps(A0) {
    const A = A0.slice(), n = A.length, hist = [A.slice()], st = [];
    st.push({ hist: [A.slice()], hl: {}, sorted: 1, en: `INSERTION-SORT keeps <b>A[1 .. j−1] sorted</b> and takes <b>key ← A[j]</b>; it shifts the larger sorted elements one place right (A[i+1] ← A[i]) until key fits. Start: A = ${A.join(' ')}, and A[1 .. 1] = ${A[0]} is sorted.` });
    for (let j = 2; j <= n; j++) {
      const key = A[j - 1]; let i = j - 1; const moved = [];
      while (i > 0 && A[i - 1] > key) { moved.push(A[i - 1]); A[i] = A[i - 1]; i--; }
      const before = hist[hist.length - 1];
      const mvIdx = []; for (let q = i + 1; q <= j - 1; q++) mvIdx.push(q);
      let en = `<b>j = ${j}</b>: key ← A[${j}] = <b>${key}</b>, i ← ${j - 1}. `;
      if (moved.length) en += `A[i] > key for ${moved.join(', ')}: ${moved.length === 1 ? 'it is' : 'each is'} shifted one place right (A[i+1] ← A[i], i ← i − 1). ` + (i > 0 ? `The loop stops at A[${i}] = ${before[i - 1]} ≤ ${key}.` : 'The loop stops at i = 0.');
      else en += `A[${j - 1}] = ${before[j - 2]} ≤ ${key}, so the while loop does not run (0 shifts).`;
      st.push({ hist: hist.slice(), hl: { key: j, mv: mvIdx }, sorted: j - 1, en });
      A[i] = key; hist.push(A.slice());
      const mv2 = mvIdx.map(q => q + 1);
      st.push({ hist: hist.slice(), hl: { key: i + 1, mv: mv2 }, sorted: j, en: `A[i+1] ← key: <b>${key}</b> goes to A[${i + 1}]. Now A[1 .. ${j}] = ${A.slice(0, j).join(' ')} is sorted.` + (j === n ? ` <b>Done</b>: ${A.join(' ')}.` : '') });
    }
    return st;
  }
  function ISort() {
    const EX = '8 2 4 9 3 6', [arr, setArr] = useState([8, 2, 4, 9, 3, 6]);
    const steps = useMemo(() => isortSteps(arr), [arr]), n = arr.length;
    const view = s => html`<div className="a1-wrap">
      <div className="a1-idx" style=${cols(n)}>${arr.map((_, k) => html`<span key=${k}>${k + 1}</span>`)}</div>
      ${s.hist.map((row, r) => { const last = r === s.hist.length - 1;
        return html`<div key=${r} className=${'a1-row' + (last ? '' : ' old')} style=${cols(n)}>${row.map((v, k) => {
          const p = k + 1; let c = 'a1-c';
          if (last) { if (s.hl.key === p) c += ' k'; else if ((s.hl.mv || []).includes(p)) c += ' mv s'; else if (p <= s.sorted) c += ' s'; }
          return html`<span key=${k} className=${c}>${v}</span>`; })}</div>`; })}
      <p className="a1-tag">tinted = sorted part A[1 .. ${s.sorted}] · solid = key · dashed = shifted right</p></div>`;
    return html`<figure className="fig">
      <${Walk} key=${arr.join(',')} steps=${steps} ms=${2300} view=${view} />
      <${TryBox} label="Your array (2 to 8 numbers)" ex=${EX} parse=${v => parseNums(v)} onOk=${setArr} hint="Each row is the array after one pass of the for loop, as on the slides." /></figure>`;
  }

  /* ── slides 1.20, 1.24: worst / average / best case of insertion sort ── */
  function perms(n) { const out = [], a = Array.from({ length: n }, (_, k) => k + 1);
    (function go(k) { if (k === n) { out.push(a.slice()); return; } for (let q = k; q < n; q++) { [a[k], a[q]] = [a[q], a[k]]; go(k + 1); [a[k], a[q]] = [a[q], a[k]]; } })(0); return out; }
  function testsPerJ(A0) { const A = A0.slice(), n = A.length, t = []; // while-condition tests for each j = 2..n
    for (let j = 2; j <= n; j++) { const key = A[j - 1]; let i = j - 1, c = 1; while (i > 0 && A[i - 1] > key) { A[i] = A[i - 1]; i--; c++; } A[i] = key; t.push(c); } return t; }
  function Cases() {
    const [mode, setMode] = useState('worst'), [n, setN] = useState(6);
    const data = useMemo(() => {
      const w = testsPerJ(Array.from({ length: n }, (_, k) => n - k)), b = testsPerJ(Array.from({ length: n }, (_, k) => k + 1));
      const P = perms(n), sum = Array(n - 1).fill(0); P.forEach(p => testsPerJ(p).forEach((c, k) => { sum[k] += c; }));
      return { worst: w, best: b, avg: sum.map(x => x / P.length) };
    }, [n]);
    const t = data[mode], tot = t.reduce((a, b) => a + b, 0), r = x => Math.round(x * 100) / 100;
    const cap = {
      worst: `<b>Worst case</b>: input reverse sorted (${Array.from({ length: n }, (_, k) => n - k).join(' ')}). Every key moves to A[1], so the while test runs <b>j</b> times for each j: T(n) = Σ<sub>j=2</sub><sup>n</sup> Θ(j) = Θ(n<sup>2</sup>) (arithmetic series). Here ${tot} tests.`,
      avg: `<b>Average case</b>: all ${fmt(perms(n).length)} orders of ${n} keys equally likely (counted by running all of them). On average key moves past half of A[1 .. j−1]: about <b>j/2</b> tests, so T(n) = Σ<sub>j=2</sub><sup>n</sup> Θ(j/2) = Θ(n<sup>2</sup>). Here ${r(tot)} tests on average.`,
      best: `<b>Best case</b>: input already sorted (${Array.from({ length: n }, (_, k) => k + 1).join(' ')}). One test per j finds A[j−1] ≤ key: T(n) = Σ Θ(1) = Θ(n). The slide calls best case <b>bogus</b>: a slow algorithm can look fast on one lucky input. Here ${tot} tests.`
    }[mode];
    const mx = n;
    return html`<figure className="fig"><div className="fig-stage">
      <${Seg} opts=${[['worst', 'Worst'], ['avg', 'Average'], ['best', 'Best']]} val=${mode} set=${setMode} />
      <div className="a1-seg"><span className="a1-cnt" style=${{ alignSelf: 'center' }}>n =</span><button className="fig-btn" onClick=${() => setN(Math.max(3, n - 1))} disabled=${n <= 3} aria-label="Smaller n">−</button><b style=${{ alignSelf: 'center', fontSize: '16px' }}>${n}</b><button className="fig-btn" onClick=${() => setN(Math.min(8, n + 1))} disabled=${n >= 8} aria-label="Larger n">+</button></div>
      <div className="a1-bars">${t.map((c, k) => html`<${F} key=${k}><span className="l">j = ${k + 2}</span><span><i className="t" style=${{ display: 'block', width: (c / mx * 100) + '%' }}></i></span><span className="v">${r(c)}</span></${F}>`)}</div>
      <p className="a1-sum">while-loop tests in total: <b>${r(tot)}</b></p></div>
      <${Cap} en=${cap} /></figure>`;
  }

  /* ── slide 1.22: Θ-notation on the slide's example 3n³ + 90n² − 5n + 6046 ── */
  function Theta() {
    const f = n => 3 * n ** 3 + 90 * n ** 2 - 5 * n + 6046;
    let n0 = 1; while (!(f(n0) <= 4 * n0 ** 3)) n0++;
    const X0 = 20, X1 = 400, Y1 = 9, px = n => 46 + (n - X0) / (X1 - X0) * 300, py = y => 190 - Math.min(y, Y1) / Y1 * 165;
    const pts = []; for (let n = X0; n <= X1; n += 4) pts.push(`${px(n).toFixed(1)},${py(f(n) / n ** 3).toFixed(1)}`);
    const steps = [
      { en: 'Take f(n) = 3n<sup>3</sup> + 90n<sup>2</sup> − 5n + 6046 from the slide and g(n) = n<sup>3</sup>. Plotted: the ratio f(n) / n<sup>3</sup> for n = 20 to 400.' },
      { en: 'For small n the low-order terms 90n<sup>2</sup> and 6046 are big, so the ratio is far above 3. As n grows the ratio falls towards the leading constant <b>3</b>.' },
      { en: '<b>c<sub>1</sub> = 3</b>: f(n) − 3n<sup>3</sup> = 90n<sup>2</sup> − 5n + 6046 > 0 for every n ≥ 1, so c<sub>1</sub>·g(n) ≤ f(n) always.' },
      { en: `<b>c<sub>2</sub> = 4</b>: f(n) ≤ 4n<sup>3</sup> first holds at n = ${n0} (checked by the code) and for every larger n. So <b>n<sub>0</sub> = ${n0}</b>.` },
      { en: `From n<sub>0</sub> = ${n0} on, 0 ≤ 3·g(n) ≤ f(n) ≤ 4·g(n): f(n) = <b>Θ(n<sup>3</sup>)</b>. Engineering shortcut: drop the low-order terms and the leading constant.` }
    ];
    const view = (s, i) => html`<svg viewBox="0 0 360 236" role="img" aria-label="Ratio f(n) over n cubed between 3 and 4 after n0">
      <line x1="46" y1="190" x2="350" y2="190" stroke="var(--graphite)" /><line x1="46" y1="20" x2="46" y2="190" stroke="var(--graphite)" />
      ${[0, 8].map(y => html`<text key=${y} x="40" y=${py(y) + 5} textAnchor="end" fontSize="16">${y}</text>`)}
      ${[20, 200, 400].map(x => html`<text key=${x} x=${px(x)} y="210" textAnchor="middle" fontSize="16">${x}</text>`)}
      <text x="198" y="233" textAnchor="middle" fontSize="16" fill="var(--graphite)">n</text>
      <rect x=${px(n0)} y=${py(4)} width=${px(X1) - px(n0)} height=${py(3) - py(4)} fill="var(--fig-k)" opacity=${i >= 4 ? .18 : 0} className="fade" />
      <line x1="46" x2="346" y1=${py(3)} y2=${py(3)} stroke="var(--ok)" strokeWidth="2.5" strokeDasharray="6 5" className=${pop(i >= 2)} />
      <text x="346" y=${py(3) + 18} textAnchor="end" fontSize="16" className=${pop(i >= 2)}>c₁ = 3</text>
      <line x1="46" x2="346" y1=${py(4)} y2=${py(4)} stroke="var(--pen)" strokeWidth="2.5" strokeDasharray="6 5" className=${pop(i >= 3)} />
      <text x="346" y=${py(4) - 7} textAnchor="end" fontSize="16" className=${pop(i >= 3)}>c₂ = 4</text>
      <g className=${pop(i >= 3)}><line x1=${px(n0)} x2=${px(n0)} y1="20" y2="190" stroke="var(--graphite)" strokeDasharray="3 4" /><text x=${px(n0) + 4} y="34" fontSize="16">n₀ = ${n0}</text></g>
      <polyline points=${pts.join(' ')} fill="none" stroke="var(--fig-s)" strokeWidth="3" className=${pop(i >= 1)} />
      <text x="70" y="44" fontSize="16" fontWeight="600" className=${pop(i >= 1)}>f(n) / n³</text>
    </svg>`;
    return html`<figure className="fig"><${Walk} steps=${steps} ms=${2800} view=${view} /></figure>`;
  }

  /* ── slide 1.23: a Θ(n²) algorithm beats a Θ(n³) one once n ≥ n₀ (the slide's sketch) ── */
  function Asym() {
    const red = d => 60 + .0012 * d * d, teal = d => 15 + 1.287e-5 * d ** 3, X = d => 50 + d, Y = h => 205 - h;
    let dc = 0; while (teal(dc) < red(dc)) dc++;
    const path = fn => { const p = []; for (let d = 0; d <= 250; d += 5) p.push(`${X(d)},${Y(Math.min(fn(d), 200)).toFixed(1)}`); return p.join(' '); };
    const steps = [
      { en: 'Running time T(n) against n for two algorithms. The red one is Θ(n<sup>2</sup>) but has larger constants, so it starts higher.' },
      { en: 'The teal one is Θ(n<sup>3</sup>): faster for small n, but its curve bends up more steeply.' },
      { en: 'The curves cross at <b>n<sub>0</sub></b>. For every n ≥ n<sub>0</sub> the Θ(n<sup>2</sup>) algorithm is faster: when n gets large enough it <b>always</b> beats the Θ(n<sup>3</sup>) one.' },
      { en: 'Still, do not ignore the asymptotically slower algorithm: below n<sub>0</sub> it wins, and real designs balance engineering objectives. Asymptotic analysis structures our thinking.' }
    ];
    const view = (s, i) => html`<svg viewBox="0 0 330 240" role="img" aria-label="Theta n squared and theta n cubed curves crossing at n0">
      <line x1="50" y1="205" x2="315" y2="205" stroke="var(--graphite)" /><line x1="50" y1="10" x2="50" y2="205" stroke="var(--graphite)" />
      <text x="40" y="110" textAnchor="end" fontSize="17">T(n)</text><text x="200" y="232" textAnchor="middle" fontSize="17">n</text>
      <polyline points=${path(red)} fill="none" stroke="#d23c3c" strokeWidth="3" />
      <text x="292" y=${Y(red(250)) - 8} textAnchor="middle" fontSize="16" fill="#d23c3c" fontWeight="600">Θ(n²)</text>
      <g className=${pop(i >= 1)}><polyline points=${path(teal)} fill="none" stroke="var(--fig-s)" strokeWidth="3" />
        <text x="240" y="26" textAnchor="middle" fontSize="16" fontWeight="600">Θ(n³)</text></g>
      <g className=${pop(i >= 2)}><line x1=${X(dc)} x2=${X(dc)} y1=${Y(red(dc))} y2="205" stroke="var(--ink)" strokeDasharray="4 4" />
        <circle cx=${X(dc)} cy=${Y(red(dc))} r="5" fill="var(--ink)" /><text x=${X(dc)} y="225" textAnchor="middle" fontSize="16">n₀</text></g>
      <rect x=${X(dc)} y="10" width=${315 - X(dc)} height="195" fill="var(--ok)" opacity=${i >= 2 ? .1 : 0} className="fade" />
    </svg>`;
    return html`<figure className="fig"><${Walk} steps=${steps} ms=${2600} view=${view} /></figure>`;
  }

  /* ── slides 1.73-1.74: the quadratic term dominates 0.1n² + n + 100 ── */
  function Order() {
    const rows = [10, 20, 50, 100, 1000].map(n => ({ n, q: .1 * n * n, f: .1 * n * n + n + 100 }));
    const steps = [{ en: '<b>5n<sup>2</sup></b> and <b>5n<sup>2</sup> + 100</b> are <b>pure quadratic</b> functions (no linear term). <b>0.1n<sup>2</sup> + n + 100</b> is a <b>complete quadratic</b>: it has a linear term. Watch the share of the 0.1n<sup>2</sup> term grow.', on: -1 },
      ...rows.map((r, k) => ({ on: k, en: `n = ${fmt(r.n)}: 0.1n<sup>2</sup> = ${fmt(r.q)} and 0.1n<sup>2</sup> + n + 100 = ${fmt(r.f)}, so the quadratic term is <b>${(r.q / r.f * 100).toFixed(1)} %</b> of the value.` + (k === 4 ? ' The other terms have become insignificant.' : '') })),
      { on: 5, en: 'So we classify 0.1n<sup>2</sup> + n + 100 with the pure quadratics: it is in <b>Θ(n<sup>2</sup>)</b>, "order of n<sup>2</sup>". Likewise 5n<sup>2</sup> + 100n + 20 ∈ Θ(n<sup>2</sup>). Common categories: Θ(lg n), Θ(n), Θ(n lg n), Θ(n<sup>2</sup>), Θ(n<sup>3</sup>), Θ(2<sup>n</sup>).' }];
    const view = s => html`<table className="a1-tbl"><thead><tr><th>n</th><th>0.1n²</th><th>0.1n² + n + 100</th><th>share of 0.1n²</th></tr></thead>
      <tbody>${rows.map((r, k) => html`<tr key=${k} className=${k === s.on ? 'on' : k > s.on ? 'off' : ''}><td>${fmt(r.n)}</td><td>${fmt(r.q)}</td><td>${fmt(r.f)}</td>
        <td><div className="a1-share"><i style=${{ width: (k > s.on ? 0 : r.q / r.f * 100) + '%' }}></i></div>${k > s.on ? '' : (r.q / r.f * 100).toFixed(1) + ' %'}</td></tr>`)}</tbody></table>`;
    return html`<figure className="fig"><${Walk} steps=${steps} ms=${2400} view=${view} /></figure>`;
  }

  /* ── slides 1.26-1.38: merging the two sorted lists 2 7 13 20 and 1 9 11 12 ── */
  function mergeSteps(A, B) {
    let a = 0, b = 0, cmp = 0; const out = [], st = [];
    const snap = (en, w) => st.push({ a, b, out: out.slice(), cmp, en, w });
    snap(`Two sorted lists, smallest at the bottom (as drawn on the slide). MERGE only ever looks at the two <b>heads</b>: ${A[0]} and ${B[0]}.`, null);
    while (a < A.length && b < B.length) {
      cmp++; const x = A[a], y = B[b];
      if (x <= y) { out.push(x); a++; } else { out.push(y); b++; }
      const m = Math.min(x, y);
      snap(`Compare the heads ${x} and ${y}: <b>${m}</b> is smaller, so it goes to the output. ` + (a < A.length && b < B.length ? `New heads: ${A[a]} and ${B[b]}.` : ''), out.length - 1);
    }
    if (a < A.length || b < B.length) {
      const rest = a < A.length ? A.slice(a) : B.slice(b), from = a < A.length ? 'first' : 'second';
      rest.forEach(v => out.push(v)); a = A.length; b = B.length;
      snap(`The ${from === 'first' ? 'second' : 'first'} list is empty, so the rest of the ${from} list (${rest.join(', ')}) is copied with <b>no comparisons</b>.` + (A.join() === '2,7,13,20' && B.join() === '1,9,11,12' ? ' (The slides stop at 12.)' : ''), out.length - 1);
    }
    snap(`Merged: ${out.join(' ')}. Each step does Θ(1) work and outputs one element, so merging n = ${out.length} elements takes <b>Θ(n)</b> time (linear): ${cmp} comparisons here, at most n − 1 = ${out.length - 1}.`, null);
    return st;
  }
  function Merge() {
    const [lists, setLists] = useState([[2, 7, 13, 20], [1, 9, 11, 12]]);
    const [A, B] = lists, steps = useMemo(() => mergeSteps(A, B), [lists]);
    const col = (L, h, name) => html`<div className="a1-col"><b>${name}</b>${L.slice(h).reverse().map((v, k, R) => html`<span key=${v + '-' + k} className=${'a1-ball' + (k === R.length - 1 ? ' h' : '')}>${v}</span>`)}${h >= L.length ? html`<span className="a1-cnt">empty</span>` : null}</div>`;
    const view = s => html`<div className="a1-wrap"><div className="a1-two">${col(A, s.a, 'list 1')}${col(B, s.b, 'list 2')}</div>
      <div className="a1-out" aria-label="output">${s.out.map((v, k) => html`<span key=${k} className=${'a1-c' + (k === s.w ? ' k' : ' s')}>${v}</span>`)}</div>
      <p className="a1-tag">comparisons so far: ${s.cmp}</p></div>`;
    const parse = v => { const p = v.split('|'); if (p.length !== 2) return { err: 'Write the two lists separated by |, e.g. 2 7 13 20 | 1 9 11 12.' };
      const x = parseNums(p[0], { min: 1, max: 6 }), y = parseNums(p[1], { min: 1, max: 6 }); if (x.err || y.err) return { err: 'Each list needs 1 to 6 whole numbers from -99 to 999.' };
      const up = L => L.every((q, k) => !k || L[k - 1] <= q); if (!up(x.val) || !up(y.val)) return { err: 'MERGE needs both lists already sorted (smallest first).' };
      return { val: [x.val, y.val] }; };
    return html`<figure className="fig"><${Walk} key=${JSON.stringify(lists)} steps=${steps} ms=${2200} view=${view} />
      <${TryBox} label="Your two sorted lists (list 1 | list 2)" ex="2 7 13 20 | 1 9 11 12" parse=${parse} onOk=${setLists} hint="Up to 6 numbers per list, each list in increasing order." /></figure>`;
  }

  /* ── slides 1.41-1.51: recursion tree for T(n) = 2T(n/2) + cn ── */
  function RTree() {
    const steps = [
      { en: 'Solve <b>T(n) = 2T(n/2) + cn</b>, c > 0 constant. Start with the whole problem: T(n).' },
      { en: 'Expand the root: it does <b>cn</b> work (the merge) and makes two subproblems <b>T(n/2)</b>.' },
      { en: 'Expand again: each T(n/2) costs <b>cn/2</b> and makes two <b>T(n/4)</b>.' },
      { en: 'Keep going: level 2 costs <b>cn/4</b> per node, down to leaves of size 1 that cost <b>Θ(1)</b>. (The slide prints the third cn/4 split as "cn  /4".)' },
      { en: 'Sizes halve at each level: n, n/2, n/4, …, 1, so the height is <b>h = lg n</b>.' },
      { en: 'Add each level. Level 0: <b>cn</b>.' },
      { en: 'Level 1: cn/2 + cn/2 = <b>cn</b>.' },
      { en: 'Level 2: 4 · cn/4 = <b>cn</b>. Every level d has 2<sup>d</sup> nodes of cost cn/2<sup>d</sup>: total cn.' },
      { en: 'The bottom level has <b>#leaves = n</b>, each Θ(1): <b>Θ(n)</b>.' },
      { en: '<b>Total</b> = cn per level × lg n levels + Θ(n) = cn lg n + Θ(n) = <b>Θ(n lg n)</b>.' }
    ];
    const N = (x, y, t, on, k) => html`<text key=${k} x=${x} y=${y} textAnchor="middle" fontSize="19" className=${pop(on)}>${t}</text>`;
    const E = (x1, y1, x2, y2, on, k) => html`<line key=${k} x1=${x1} y1=${y1} x2=${x2} y2=${y2} stroke="var(--ink)" strokeWidth="1.5" className=${pop(on)} />`;
    const S = (y, t, on, x0) => html`<g className=${pop(on)}><line x1=${x0} x2="365" y1=${y - 6} y2=${y - 6} stroke="#d23c3c" strokeWidth="1" /><text x="412" y=${y} textAnchor="end" fontSize="19" fontWeight="600">${t}</text></g>`;
    const view = (s, i) => html`<svg viewBox="0 0 420 300" role="img" aria-label="Recursion tree with level sums cn and total theta n lg n">
      ${N(200, 40, i === 0 ? 'T(n)' : 'cn', true, 'r')}
      ${E(185, 48, 125, 82, i >= 1, 'e1')}${E(215, 48, 275, 82, i >= 1, 'e2')}
      ${N(115, 100, i === 1 ? 'T(n/2)' : 'cn/2', i >= 1, 'a')}${N(285, 100, i === 1 ? 'T(n/2)' : 'cn/2', i >= 1, 'b')}
      ${[[100, 75], [130, 155], [270, 245], [300, 325]].map(([x1, x2], k) => E(x1, 108, x2, 142, i >= 2, 'f' + k))}
      ${[75, 155, 245, 325].map((x, k) => N(x, 160, i === 2 ? 'T(n/4)' : 'cn/4', i >= 2, 'c' + k))}
      <g className=${pop(i >= 3)}><text x="75" y="192" textAnchor="middle" fontSize="19">⋮</text><text x="75" y="216" textAnchor="middle" fontSize="19">⋮</text>${N(75, 250, 'Θ(1)', true, 'l')}</g>
      <g className=${pop(i >= 4)}><line x1="18" y1="34" x2="18" y2="250" stroke="#d23c3c" strokeWidth="2" /><path d="M12 42 L18 30 L24 42 M12 242 L18 254 L24 242" fill="none" stroke="#d23c3c" strokeWidth="2" />
        <text x="0" y="0" fontSize="19" transform="translate(42 142) rotate(-90)" textAnchor="middle">h = lg n</text></g>
      ${S(40, 'cn', i >= 5, 228)}${S(100, 'cn', i >= 6, 322)}${S(160, 'cn', i >= 7, 358)}
      <g className=${pop(i >= 7)}><text x="395" y="196" textAnchor="middle" fontSize="19">⋮</text></g>
      <g className=${pop(i >= 8)}><rect x="140" y="230" width="128" height="30" rx="5" fill="color-mix(in srgb, var(--fig-k) 20%, var(--paper))" stroke="var(--fig-k)" />
        <text x="204" y="251" textAnchor="middle" fontSize="19">#leaves = n</text>${S(252, 'Θ(n)', true, 272)}</g>
      <g className=${pop(i >= 9)}><line x1="300" x2="412" y1="266" y2="266" stroke="#d23c3c" strokeWidth="2" /><text x="412" y="292" textAnchor="end" fontSize="19" fontWeight="700">Total = Θ(n lg n)</text></g>
    </svg>`;
    return html`<figure className="fig"><${Walk} steps=${steps} ms=${2400} view=${view} /></figure>`;
  }

  /* ── slides 1.55, 1.65-1.66: exchange sort does n(n−1)/2 comparisons on every input ── */
  function exSteps(S0) {
    const S = S0.slice(), n = S.length, st = []; let c = 0;
    st.push({ S: S.slice(), i: 0, j: 0, c, sw: false, en: `exchangesort compares S[i] with every later S[j] (i = 1 .. n, j = i+1 .. n) and exchanges them when S[j] < S[i]. S = ${S.join(' ')}, n = ${n}.` });
    for (let i = 1; i <= n; i++) for (let j = i + 1; j <= n; j++) {
      c++; const a = S[i - 1], b = S[j - 1], sw = b < a;
      if (sw) { S[i - 1] = b; S[j - 1] = a; }
      st.push({ S: S.slice(), i, j, c, sw, en: `i = ${i}, j = ${j}: is S[${j}] = ${b} < S[${i}] = ${a}? ` + (sw ? `<b>Yes</b>: exchange them.` : `No.`) + ` Comparisons: <b>${c}</b>.` + (j === n && i === n - 1 ? ` Sorted: ${S.join(' ')}.` : '') });
    }
    st.push({ S: S.slice(), i: 0, j: 0, c, sw: false, done: 1, en: `Row i always makes n − i comparisons: T(n) = (n−1) + (n−2) + … + 1 = n(n−1)/2 = <b>${n * (n - 1) / 2}</b>, whatever the keys are: an <b>every-case</b> complexity. Likewise add array members: T(n) = n = ${n}; matrix multiplication: T(n) = n·n·n = n<sup>3</sup> = ${n ** 3}. (Slide 1.56 writes the outer loop as "for (i=1; j<=n; j++)"; it should be "for (i=1; i<=n; i++)".)` });
    return st;
  }
  function Every() {
    const [arr, setArr] = useState([8, 2, 4, 9, 3, 6]), steps = useMemo(() => exSteps(arr), [arr]), n = arr.length;
    const view = s => html`<div className="a1-wrap">
      <div className="a1-idx" style=${cols(n)}>${arr.map((_, k) => html`<span key=${k}>${k + 1 === s.i ? 'i' : k + 1 === s.j ? 'j' : k + 1}</span>`)}</div>
      <div className="a1-row" style=${cols(n)}>${s.S.map((v, k) => html`<span key=${k} className=${'a1-c' + ((k + 1 === s.i || k + 1 === s.j) ? (s.sw ? ' k' : ' mv s') : '')}>${v}</span>`)}</div>
      <div className="a1-tri" style=${{ gridTemplateColumns: `repeat(${n}, 26px)` }} aria-label="comparisons made">
        <span></span>${Array.from({ length: n - 1 }, (_, q) => html`<span key=${'h' + q}>j${q + 2}</span>`)}
        ${Array.from({ length: n - 1 }, (_, r) => html`<${F} key=${r}><span>i${r + 1}</span>${Array.from({ length: n - 1 }, (_, q) => { const i = r + 1, j = q + 2;
          if (j <= i) return html`<span key=${q}></span>`;
          const done = s.done || i < s.i || (i === s.i && j <= s.j), now = i === s.i && j === s.j;
          return html`<span key=${q} className=${now ? 'n' : done ? 'd' : 'e'}></span>`; })}</${F}>`)}</div>
      <p className="a1-tag">each filled square = one comparison S[j] ${"<"} S[i] · ${s.c} of ${n * (n - 1) / 2}</p></div>`;
    return html`<figure className="fig"><${Walk} key=${arr.join(',')} steps=${steps} ms=${1100} view=${view} />
      <${TryBox} label="Your keys (2 to 7 numbers)" ex="8 2 4 9 3 6" parse=${v => parseNums(v, { max: 7 })} onOk=${setArr} hint="The slides give no array for exchange sort; the example uses the sorting example of slide 1.5. Any order gives the same count." /></figure>`;
  }

  /* ── slides 1.53, 1.67-1.70: sequential search, best / worst / average ── */
  function SeqSearch() {
    const S = [8, 2, 4, 9, 3, 6], n = S.length, [x, setX] = useState(9), [p, setP] = useState(1);
    let loc = 1; while (loc <= n && S[loc - 1] !== x) loc++;
    const found = loc <= n, comps = found ? loc : n;
    const A = p * (n + 1) / 2 + (1 - p) * n, r2 = v => Math.round(v * 100) / 100;
    const cap = `seqsearch(x = ${x}): ` + (found ? `S[location] != x is tested at locations 1 .. ${loc}, so the basic operation runs <b>${comps}</b> time${comps > 1 ? 's' : ''}; location = ${loc}.` : `x is not in S: all n = ${n} keys are compared, then location = 0.`)
      + ` <b>B(n) = 1</b> (x = S[1]), <b>W(n) = n = ${n}</b> (x last or absent). If x is in S with each slot equally likely: A(n) = Σ k·(1/n) = (n+1)/2 = <b>${(n + 1) / 2}</b>. With probability p that x is in S: A(n) = p(n+1)/2 + (1−p)n = n(1 − p/2) + p/2 = <b>${r2(A)}</b> for p = ${p}.`;
    return html`<figure className="fig"><div className="fig-stage"><div className="a1-wrap">
      <p className="a1-tag">Tap a key to search for it · dashed = compared, not equal · green = found</p>
      <div className="a1-idx" style=${cols(n)}>${S.map((_, k) => html`<span key=${k}>${k + 1}</span>`)}</div>
      <div className="a1-row" style=${cols(n)}>${S.map((v, k) => html`<button key=${k} className=${'a1-c fig-btn' + (found && k + 1 === loc ? ' ok' : (k + 1 <= comps ? ' mv' : ''))} style=${{ padding: 0, borderRadius: '6px', minHeight: '34px' }} onClick=${() => setX(v)} aria-label=${'search for ' + v}>${v}</button>`)}</div>
      <div className="a1-seg"><button className="fig-btn" aria-pressed=${String(!found)} onClick=${() => setX(5)}>x = 5 (not in S)</button></div>
      <div className="a1-big"><div>comparisons<b>${comps}</b></div><div>location<b>${found ? loc : 0}</b></div></div>
      <label className="a1-lab" style=${{ marginTop: '10px' }}>probability p that x is in S: ${p}<input className="a1-range" type="range" min="0" max="1" step="0.1" value=${p} onChange=${e => setP(+e.target.value)} /></label>
      <p className="a1-sum">A(n) = ${r2(A)} comparisons on average (n = ${n})</p></div></div>
      <${Cap} en=${cap} /></figure>`;
  }

  /* ── slides 1.57-1.58: sequential vs binary search comparisons ── */
  function BinSearch() {
    const ROWS = [128, 1024, 1048576, 4294967296], [n, setN] = useState(128), [t, setT] = useState(''), [err, setErr] = useState('');
    // binsearch from slide 1.57 with x larger than every key (worst case): one pass per loop iteration
    const sizes = []; { let low = 1, high = n; while (low <= high) { sizes.push(high - low + 1); const mid = Math.floor((low + high) / 2); low = mid + 1; } }
    const chips = sizes.length <= 12 ? sizes.map(fmt) : [...sizes.slice(0, 4).map(fmt), '…', ...sizes.slice(-3).map(fmt)];
    const run = () => { const v = Number(t.replace(/,/g, '')); if (!Number.isInteger(v) || v < 1 || v > 4294967296) { setErr('Enter a whole number from 1 to 4,294,967,296.'); return; } setErr(''); setN(v); };
    const cap = `Array size n = ${fmt(n)}. Sequential search may compare x with all <b>${fmt(n)}</b> keys. binsearch compares x with S[mid] and throws away half of S[low .. high] each pass: sizes ${sizes.length <= 12 ? sizes.map(fmt).join(', ') : chips.join(', ')}. That is ⌊lg n⌋ + 1 = <b>${sizes.length}</b> passes in the worst case.` + (ROWS.includes(n) ? ' (Same as the slide\'s table.)' : '');
    return html`<figure className="fig"><div className="fig-stage">
      <table className="a1-tbl"><thead><tr><th>Array size</th><th>sequential search</th><th>binary search</th></tr></thead>
        <tbody>${ROWS.map(r => html`<tr key=${r} className=${r === n ? 'on' : ''} onClick=${() => setN(r)} style=${{ cursor: 'pointer' }}><td>${fmt(r)}</td><td>${fmt(r)}</td><td>${Math.floor(Math.log2(r)) + 1}</td></tr>`)}</tbody></table>
      <p className="a1-tag">tap a row · worst-case comparisons</p>
      <div className="a1-big"><div>sequential<b>${fmt(n)}</b></div><div>binary<b>${sizes.length}</b></div></div>
      <div className="a1-chips" aria-label="size of S[low..high] at each pass">${chips.map((c, k) => html`<span key=${k}>${c}</span>`)}</div></div>
      <${Cap} en=${cap} />
      <div className="a1-try"><label className="a1-lab">Your array size<input className="a1-in" inputMode="numeric" value=${t} placeholder="e.g. 1000" onChange=${e => setT(e.target.value)} onKeyDown=${e => { if (e.key === 'Enter') run(); }} /></label>
        <div className="a1-btns"><button className="fig-btn solid" onClick=${run}>Run</button><button className="fig-btn" onClick=${() => { setT(''); setErr(''); setN(128); }}>Example from the slides</button></div>
        ${err ? html`<p className="a1-err" role="alert">${err}</p>` : null}</div></figure>`;
  }

  /* ── slides 1.59-1.61: the recursion tree of fib(n) and the number of terms computed ── */
  function fibTree(n) {
    let leaf = 0, ord = 0; const nodes = [], edges = [];
    (function go(v, d, par) { const me = { v, d, o: ord++ }; nodes.push(me); if (par) edges.push([par, me]);
      if (v <= 1) { me.x = leaf++; return me; } const a = go(v - 1, d + 1, me), b = go(v - 2, d + 1, me); me.x = (a.x + b.x) / 2; return me; })(n, 0, null);
    return { nodes, edges, leaves: leaf, depth: Math.max(...nodes.map(q => q.d)) };
  }
  function FibTree() {
    const TERMS = [1, 1, 3, 5, 9, 15, 25], [n, setN] = useState(5);
    const t = useMemo(() => fibTree(n), [n]), cnt = t.nodes.length;
    const W = 340, sx = t.leaves > 1 ? (W - 40) / (t.leaves - 1) : 0, X = q => t.leaves > 1 ? 20 + q.x * sx : W / 2, Y = q => 22 + q.d * 42, H = 44 + t.depth * 42;
    const steps = [...t.nodes.map((q, k) => ({ k, en: `Call ${k + 1}: fib(${q.v})` + (q.v <= 1 ? ` returns ${q.v} directly (n ≤ 1).` : ` calls fib(${q.v - 1}) and then fib(${q.v - 2}).`) + ` Terms computed so far: <b>${k + 1}</b>.` })),
      { k: cnt, en: `fib(${n}) computes <b>${cnt}</b> terms, as in the slide's table. The tree is not like a binary search tree: fib(n−2) is recomputed inside fib(n−1). T(n) > 2T(n−2) > 2·2·T(n−4) > … > 2<sup>n/2</sup>T(0), and T(0) = 1, so <b>T(n) > 2<sup>n/2</sup></b> for n ≥ 2` + (n >= 2 ? ` (here ${cnt} > 2<sup>${n}/2</sup> ≈ ${(2 ** (n / 2)).toFixed(2).replace(/\.00$/, '')}).` : '.') }];
    const view = s => html`<svg viewBox=${`0 0 ${W} ${H}`} role="img" aria-label=${`recursion tree of fib(${n})`} style=${{ maxWidth: '460px' }}>
      ${t.edges.map(([a, b], k) => html`<line key=${k} x1=${X(a)} y1=${Y(a)} x2=${X(b)} y2=${Y(b)} stroke="var(--graphite)" strokeWidth="1.5" className=${pop(b.o <= s.k)} />`)}
      ${t.nodes.map(q => html`<g key=${q.o} className=${pop(q.o <= s.k)}><circle cx=${X(q)} cy=${Y(q)} r="13" fill=${q.o === s.k ? 'var(--fig-s)' : 'var(--paper)'} stroke="var(--fig-k)" strokeWidth="2" />
        <text x=${X(q)} y=${Y(q) + 5.5} textAnchor="middle" fontSize="16" fontWeight="600" style=${q.o === s.k ? { fill: '#fff' } : null}>${q.v}</text></g>`)}</svg>
      <table className="a1-tbl au" style=${{ maxWidth: '300px', marginTop: '8px' }}><thead><tr><th>n</th>${TERMS.map((_, k) => html`<th key=${k}>${k}</th>`)}</tr></thead>
        <tbody><tr><td>terms</td>${TERMS.map((v, k) => html`<td key=${k} style=${k === n ? { background: 'var(--fig-s)', color: '#fff', fontWeight: 600 } : null}>${v}</td>`)}</tr></tbody></table>`;
    return html`<figure className="fig"><${Walk} key=${n} steps=${steps} ms=${650} view=${view}
      top=${html`<div className="a1-seg">${[0, 1, 2, 3, 4, 5, 6].map(v => html`<button key=${v} className="fig-btn" aria-pressed=${String(v === n)} onClick=${() => setN(v)}>fib(${v})</button>`)}</div>`} /></figure>`;
  }

  /* ── slide 1.62: fib2 fills f[0 .. n] once ── */
  function Fib2() {
    const [n, setN] = useState(6);
    const f = [0, 1]; for (let k = 2; k <= n; k++) f[k] = f[k - 1] + f[k - 2];
    const steps = [{ k: 0, en: 'f[0] = 0.' }];
    if (n > 0) steps.push({ k: 1, en: 'n > 0, so f[1] = 1.' });
    for (let k = 2; k <= n; k++) steps.push({ k, en: `i = ${k}: f[${k}] = f[${k - 1}] + f[${k - 2}] = ${f[k - 1]} + ${f[k - 2]} = <b>${f[k]}</b>.` });
    steps.push({ k: n, end: 1, en: `return f[${n}] = <b>${f[n]}</b>. Each term is computed once: T(n) = n + 1 = <b>${n + 1}</b> terms (fib(${n}) needs ${fibTree(Math.min(n, 12)).nodes.length}). Linear, Θ(n).` });
    const view = s => html`<div className="a1-wrap"><div className="a1-idx" style=${cols(n + 1)}>${f.slice(0, n + 1).map((_, k) => html`<span key=${k}>f[${k}]</span>`)}</div>
      <div className="a1-row" style=${cols(n + 1)}>${f.slice(0, n + 1).map((v, k) => html`<span key=${k} className=${'a1-c' + (k > s.k ? ' no' : k === s.k && !s.end ? ' k' : ' s')}>${k > s.k ? '' : v}</span>`)}</div></div>`;
    return html`<figure className="fig"><${Walk} key=${n} steps=${steps} ms=${1300} view=${view}
      top=${html`<div className="a1-seg"><span className="a1-cnt" style=${{ alignSelf: 'center' }}>n =</span><button className="fig-btn" onClick=${() => setN(Math.max(0, n - 1))} disabled=${n <= 0} aria-label="Smaller n">−</button><b style=${{ alignSelf: 'center', fontSize: '16px' }}>${n}</b><button className="fig-btn" onClick=${() => setN(Math.min(7, n + 1))} disabled=${n >= 7} aria-label="Larger n">+</button></div>`} /></figure>`;
  }

  /* ── slide 1.63: execution times of fib2 (A2) and fib (A1) ── */
  function FibTime() {
    const R = [[40, '1,048,576', '41 ns', '1048 µs'], [60, '1.1 × 10<sup>9</sup>', '61 ns', '1 s'], [80, '1.1 × 10<sup>12</sup>', '81 ns', '18 min'], [100, '1.1 × 10<sup>15</sup>', '101 ns', '13 days'],
      [120, '1.2 × 10<sup>18</sup>', '121 ns', '36 years'], [160, '1.2 × 10<sup>24</sup>', '161 ns', '3.8 × 10<sup>7</sup> years'], [200, '1.3 × 10<sup>30</sup>', '201 ns', '4 × 10<sup>13</sup> years']];
    const steps = [{ on: -1, en: 'Assume one term takes <b>1 ns</b>. fib2 (A2) computes n + 1 terms; the recursive fib (A1) computes more than 2<sup>n/2</sup> terms.' },
      ...R.map((r, k) => ({ on: k, en: `n = ${r[0]}: A2 needs ${r[0] + 1} terms = <b>${r[2]}</b>; A1 needs more than 2<sup>${r[0] / 2}</sup> ≈ ${r[1]} terms = <b>${r[3]}</b>.` + (k === 6 ? ' Linear vs exponential.' : '') }))];
    const view = s => html`<table className="a1-tbl au"><thead><tr><th>n</th><th>n + 1</th><th>2<sup>n/2</sup></th><th>time A2</th><th>time A1</th></tr></thead>
      <tbody>${R.map((r, k) => html`<tr key=${k} className=${k === s.on ? 'on' : k > s.on ? 'off' : ''}><td>${r[0]}</td><td>${r[0] + 1}</td><td dangerouslySetInnerHTML=${{ __html: r[1] }}></td><td>${r[2]}</td><td dangerouslySetInnerHTML=${{ __html: r[3] }}></td></tr>`)}</tbody></table>`;
    return html`<figure className="fig"><${Walk} steps=${steps} ms=${2200} view=${view} /></figure>`;
  }

  /* ── slides 1.71-1.72: when does the linear algorithm win? ── */
  function Cross() {
    const M = { a: { f1: n => 1000 * n, f2: n => n * n, l1: 'n × 1,000t', l2: 'n² × t', x: 1000, unit: 't' }, b: { f1: n => 100 * n, f2: n => .01 * n * n, l1: '100n', l2: '0.01n²', x: 10000, unit: '' } };
    const [m, setM] = useState('a'), c = M[m], X1 = 2 * c.x, Y1 = c.f2(X1);
    const px = n => 40 + n / X1 * 290, py = y => 200 - y / Y1 * 180;
    const line = fn => { const p = []; for (let k = 0; k <= 50; k++) { const n = X1 * k / 50; p.push(`${px(n).toFixed(1)},${py(fn(n)).toFixed(1)}`); } return p.join(' '); };
    const steps = m === 'a' ? [
      { en: 'Algorithm 1 is <b>n</b>, but each basic operation takes 1,000t: time <b>n × 1,000t</b>.' },
      { en: 'Algorithm 2 is <b>n<sup>2</sup></b> with basic operation t: time <b>n<sup>2</sup> × t</b>. For small n it is faster.' },
      { en: 'Algorithm 1 is faster when n<sup>2</sup>·t > n·1,000t. Divide by nt: <b>n > 1,000</b>.' },
      { en: 'Beyond n = 1,000 the linear algorithm wins, however large its constant is.' }] : [
      { en: 'Every-case complexities <b>100n</b> for the first algorithm …' },
      { en: '… and <b>0.01n<sup>2</sup></b> for the second.' },
      { en: 'The first is more efficient when 0.01n<sup>2</sup> > 100n, i.e. <b>n > 10,000</b>.' },
      { en: 'Principle: any linear-time algorithm is <b>eventually</b> more efficient than any quadratic-time algorithm.' }];
    const view = (s, i) => html`<svg viewBox="0 0 345 245" role="img" aria-label="linear versus quadratic time, crossing point">
      <line x1="40" y1="200" x2="335" y2="200" stroke="var(--graphite)" /><line x1="40" y1="15" x2="40" y2="200" stroke="var(--graphite)" />
      ${[0, c.x, X1].map(v => html`<text key=${v} x=${v === X1 ? 336 : px(v)} y="220" textAnchor=${v === X1 ? 'end' : 'middle'} fontSize="15">${fmt(v)}</text>`)}<text x="190" y="240" textAnchor="middle" fontSize="15" fill="var(--graphite)">n</text>
      <text x="34" y="22" textAnchor="end" fontSize="15" fill="var(--graphite)">time</text>
      <polyline points=${line(c.f1)} fill="none" stroke="var(--fig-s)" strokeWidth="3" /><text x="330" y=${py(c.f1(X1)) - 8} textAnchor="end" fontSize="15" fontWeight="600">${c.l1}</text>
      <g className=${pop(i >= 1)}><polyline points=${line(c.f2)} fill="none" stroke="#d23c3c" strokeWidth="3" /><text x=${px(X1 * .78)} y="32" textAnchor="end" fontSize="15" fontWeight="600" fill="#d23c3c">${c.l2}</text></g>
      <g className=${pop(i >= 2)}><line x1=${px(c.x)} x2=${px(c.x)} y1=${py(c.f1(c.x))} y2="200" stroke="var(--ink)" strokeDasharray="4 4" /><circle cx=${px(c.x)} cy=${py(c.f1(c.x))} r="5" fill="var(--ink)" /></g>
      <rect x=${px(c.x)} y="15" width=${px(X1) - px(c.x)} height="185" fill="var(--ok)" opacity=${i >= 3 ? .12 : 0} className="fade" />
    </svg>`;
    return html`<figure className="fig"><${Walk} key=${m} steps=${steps} ms=${2500} view=${view}
      top=${html`<${Seg} opts=${[['a', 'n·1,000t vs n²·t (1.71)'], ['b', '100n vs 0.01n² (1.72)']]} val=${m} set=${setM} />`} /></figure>`;
  }

  window.FIGS = Object.assign(window.FIGS || {}, {
    'ag-1-isort': ISort, 'ag-1-cases': Cases, 'ag-1-theta': Theta, 'ag-1-asym': Asym, 'ag-1-order': Order,
    'ag-1-merge': Merge, 'ag-1-rtree': RTree, 'ag-1-every': Every, 'ag-1-seqsearch': SeqSearch, 'ag-1-binsearch': BinSearch,
    'ag-1-fibtree': FibTree, 'ag-1-fib2': Fib2, 'ag-1-fibtime': FibTime, 'ag-1-cross': Cross
  });
})();
/* ── part L2 ── */
// Algorithms visuals, Lecture 2 (Mathematical background, proofs and asymptotic notation): induction, counterexample and contradiction
// proofs (slides 2.12-2.18), term contribution experiments (2.32-2.38), Big-Oh witnesses (2.40-2.43), Big-Oh rules and Examples 3, 9, 10, 12
// (2.44-2.52), the seven growth functions and their table (2.53-2.55), the three summation algorithms (2.8, 2.56-2.59), Ω and Θ (2.60-2.61),
// selectkth (2.62); added: set notation (2.6), log rules (2.7), n! and the Tower of Hanoi (2.9). Every label and number comes from the slides.
(function () {
  const { useState, useEffect, useRef, useMemo } = React;
  const { html, useSteps, Cap, Bar, pop, calm, useClock, useFit, sec } = window.FIGKIT;
  const CSS = `
.a2-wrap{ max-width:520px; margin:0 auto; }
.a2-idx{ display:grid; gap:4px; justify-content:center; margin:0 auto 2px; }
.a2-idx span{ text-align:center; font-size:12px; color:var(--graphite); }
.a2-row{ display:grid; gap:4px; justify-content:center; margin:0 auto 5px; transition:opacity .4s; }
.a2-row.old{ opacity:.5; }
.a2-c{ height:34px; border:1px solid var(--line); border-radius:6px; background:var(--paper); display:grid; place-items:center; font-weight:600; font-size:15px; color:var(--ink); transition:background .3s, color .3s; }
.a2-c.s{ background:color-mix(in srgb, var(--fig-k) 16%, var(--paper)); }
.a2-c.k{ background:var(--fig-s); color:#fff; border-color:transparent; }
.a2-c.mv{ border:2px dashed var(--fig-k); }
.a2-c.ok{ background:color-mix(in srgb, var(--ok) 22%, var(--paper)); }
.a2-c.no{ opacity:.45; }
.a2-tag{ text-align:center; font-size:12.5px; color:var(--graphite); margin:2px 0 6px; }
.a2-seg{ display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin:0 0 10px; }
.a2-seg .fig-btn[aria-pressed="true"]{ background:var(--fig-s); color:#fff; border-color:transparent; }
.a2-try{ padding:10px 14px 12px; border-top:1px solid var(--line); display:grid; gap:8px; }
.a2-lab{ display:grid; gap:4px; font-size:13px; color:var(--graphite); }
.a2-in{ font:inherit; font-size:15px; padding:7px 9px; border-radius:6px; border:1px solid var(--line); background:var(--paper); color:var(--ink); width:100%; box-sizing:border-box; min-width:0; }
.a2-btns{ display:flex; flex-wrap:wrap; gap:8px; }
.a2-err{ margin:0; font-size:13px; color:var(--pen); }
.a2-hint{ margin:0; font-size:12.5px; color:var(--graphite); }
.a2-cnt{ font-size:13px; color:var(--graphite); }
.a2-two{ display:grid; grid-template-columns:auto auto; gap:26px; justify-content:center; align-items:end; }
.a2-col{ display:grid; gap:5px; justify-items:center; }
.a2-col b{ font-size:13px; color:var(--graphite); font-weight:600; }
.a2-ball{ width:40px; height:34px; border-radius:17px; display:grid; place-items:center; font-weight:600; font-size:15px; border:1px solid var(--line); background:var(--paper); color:var(--ink); }
.a2-ball.h{ background:color-mix(in srgb, var(--fig-k) 26%, var(--paper)); border:2px solid var(--fig-k); }
.a2-ball.w{ background:var(--fig-s); color:#fff; border-color:transparent; }
.a2-out{ display:flex; flex-wrap:wrap; gap:5px; justify-content:center; min-height:36px; margin-top:12px; padding-top:10px; border-top:1px dashed var(--line); }
.a2-out .a2-c{ width:36px; }
.a2-tri{ display:grid; gap:3px; justify-content:center; margin:10px auto 0; }
.a2-tri span{ width:26px; height:22px; border-radius:4px; font-size:12px; display:grid; place-items:center; color:var(--graphite); }
.a2-tri .e{ border:1px solid var(--line); background:var(--paper); }
.a2-tri .d{ background:color-mix(in srgb, var(--fig-k) 30%, var(--paper)); color:var(--ink); }
.a2-tri .n{ background:var(--fig-s); color:#fff; }
.a2-bars{ display:grid; grid-template-columns:auto 1fr auto; gap:5px 8px; align-items:center; max-width:440px; margin:0 auto; font-size:13px; }
.a2-bars .t{ height:16px; border-radius:4px; background:var(--fig-s); transition:width .5s; min-width:2px; }
.a2-bars .l{ color:var(--graphite); } .a2-bars .v{ font-weight:600; color:var(--ink); }
.a2-sum{ text-align:center; font-size:14px; margin:10px 0 0; color:var(--ink); }
.a2-tbl{ width:100%; max-width:480px; margin:0 auto; border-collapse:collapse; font-size:13px; table-layout:fixed; }
.a2-tbl th, .a2-tbl td{ border:1px solid var(--line); padding:4px 3px; text-align:center; color:var(--ink); overflow-wrap:anywhere; }
.a2-tbl th{ background:color-mix(in srgb, var(--fig-k) 16%, var(--paper)); font-weight:600; }
.a2-tbl td{ background:var(--paper); }
.a2-tbl sup{ font-size:.9em; }
.a2-tbl.au{ table-layout:auto; } .a2-tbl.au td, .a2-tbl.au th{ overflow-wrap:normal; padding:4px 2px; }
.a2-tbl tr.on td{ background:color-mix(in srgb, var(--fig-k) 24%, var(--paper)); font-weight:600; }
.a2-tbl tr.off td{ opacity:.3; }
.a2-chips{ display:flex; flex-wrap:wrap; gap:4px; justify-content:center; margin:8px 0 0; }
.a2-chips span{ font-size:12.5px; padding:3px 7px; border-radius:99px; border:1px solid var(--line); background:var(--paper); color:var(--ink); }
.a2-big{ display:grid; grid-template-columns:1fr 1fr; gap:8px; max-width:420px; margin:0 auto; }
.a2-big div{ border:1px solid var(--line); border-radius:8px; background:var(--paper); padding:8px; text-align:center; font-size:13px; color:var(--graphite); }
.a2-big b{ display:block; font-size:18px; color:var(--ink); overflow-wrap:anywhere; }
.a2-range{ width:100%; accent-color:var(--fig-s); }
.a2-share{ height:12px; border-radius:4px; background:var(--line); overflow:hidden; }
.a2-share i{ display:block; height:100%; background:var(--fig-s); transition:width .5s; }
@media (prefers-reduced-motion: reduce){ .a2-c, .a2-row, .a2-bars .t, .a2-share i{ transition:none; } }`;
  if (!document.getElementById('a2-css')) { const s = document.createElement('style'); s.id = 'a2-css'; s.textContent = CSS; document.head.appendChild(s); }

  const F = React.Fragment;
  const fmt = x => x.toLocaleString('en-US');
  // Back / Next / Replay; long walks show "step k / n" instead of dots so the bar never gets wider than a phone
  function Nav({ n, i, ctl }) {
    if (n <= 12) return html`<${Bar} steps=${Array.from({ length: n })} i=${i} ctl=${ctl} />`;
    return html`<div className="fig-bar"><span className="a2-cnt">step ${i + 1} / ${n}</span><span className="grow"></span>
      <button className="fig-btn" onClick=${() => ctl.go(Math.max(0, i - 1))} disabled=${i === 0} aria-label="Previous step">‹ Back</button>
      <button className="fig-btn" onClick=${() => ctl.go(Math.min(n - 1, i + 1))} disabled=${i === n - 1} aria-label="Next step">Next ›</button>
      <button className="fig-btn" onClick=${ctl.replay}>↻ Replay</button></div>`;
  }
  // stage + caption + bar for a list of steps; remount it (key) when the input changes
  function Walk({ steps, ms, view, top }) {
    const [i, ctl] = useSteps(steps.length, ms), s = steps[Math.min(i, steps.length - 1)];
    return html`<${F}><div className="fig-stage">${top}${view(s, i)}</div><${Cap} en=${s.en} /><${Nav} n=${steps.length} i=${i} ctl=${ctl} /></${F}>`;
  }
  const Seg = ({ opts, val, set }) => html`<div className="a2-seg">${opts.map(([k, t]) => html`<button key=${k} className="fig-btn" aria-pressed=${String(val === k)} onClick=${() => set(k)}>${t}</button>`)}</div>`;
  function parseNums(s, { min = 2, max = 8, lo = -99, hi = 999 } = {}) {
    const p = String(s).trim().split(/[\s,]+/).filter(Boolean);
    if (p.length < min || p.length > max) return { err: `Enter ${min} to ${max} whole numbers, separated by spaces or commas.` };
    const v = p.map(Number);
    if (v.some(x => !Number.isInteger(x) || x < lo || x > hi)) return { err: `Use whole numbers from ${lo} to ${hi}.` };
    return { val: v };
  }
  function TryBox({ label, ex, parse, onOk, hint }) {
    const [t, setT] = useState(ex), [err, setErr] = useState('');
    const run = v => { const r = parse(v); if (r.err) setErr(r.err); else { setErr(''); onOk(r.val); } };
    return html`<div className="a2-try"><label className="a2-lab">${label}<input className="a2-in" value=${t} onChange=${e => setT(e.target.value)} onKeyDown=${e => { if (e.key === 'Enter') run(t); }} /></label>
      <div className="a2-btns"><button className="fig-btn solid" onClick=${() => run(t)}>Run</button><button className="fig-btn" onClick=${() => { setT(ex); run(ex); }}>Example from the slides</button></div>
      ${err ? html`<p className="a2-err" role="alert">${err}</p>` : html`<p className="a2-hint">${hint}</p>`}</div>`;
  }
  const cols = n => ({ gridTemplateColumns: `repeat(${n}, minmax(0, 36px))` });

  const CSS2 = `
.a2-lines{ display:grid; gap:4px; max-width:440px; margin:0 auto 10px; font-size:14.5px; color:var(--ink); }
.a2-lines div{ padding:4px 8px; border-radius:6px; background:var(--paper); border:1px solid var(--line); transition:opacity .4s, background .4s; }
.a2-lines div.now{ background:color-mix(in srgb, var(--fig-k) 20%, var(--paper)); border-color:var(--fig-k); }
.a2-lines div.off{ opacity:0; }
.a2-pair{ display:grid; grid-template-columns:auto 1fr auto; gap:4px 8px; align-items:center; max-width:440px; margin:0 auto; font-size:13px; }
.a2-pair .l{ color:var(--graphite); text-align:right; }
.a2-pair .bb{ display:grid; gap:2px; }
.a2-pair .bb i{ display:block; height:9px; border-radius:3px; transition:width .5s; min-width:2px; }
.a2-pair .bb i.f{ background:var(--fig-s); } .a2-pair .bb i.g{ background:var(--graphite); opacity:.55; }
.a2-pair .v{ font-size:13.5px; color:var(--graphite); white-space:nowrap; }
.a2-pair .on .l, .a2-pair .on{ color:var(--ink); font-weight:600; }
.a2-key{ display:flex; flex-wrap:wrap; gap:4px 14px; justify-content:center; font-size:13.5px; color:var(--graphite); margin:8px 0 0; }
.a2-key i{ display:inline-block; width:14px; height:9px; border-radius:2px; margin-right:5px; vertical-align:middle; }
.a2-box{ border:1px solid var(--line); border-radius:8px; background:var(--paper); padding:7px 10px; text-align:center; font-size:14px; color:var(--ink); transition:opacity .4s, background .4s; }
.a2-box b{ color:var(--pen); }
.a2-box.on{ background:color-mix(in srgb, var(--fig-k) 18%, var(--paper)); border-color:var(--fig-k); }
.a2-loop{ border:2px dashed var(--fig-k); border-radius:10px; padding:8px; display:grid; gap:6px; position:relative; }
.a2-loop.offl{ border-color:transparent; }
.a2-arrow{ text-align:center; color:var(--graphite); font-size:14px; line-height:1; }
.a2-grid{ display:grid; gap:2px; justify-content:center; margin:6px auto 0; }
.a2-grid span{ width:14px; height:14px; border-radius:3px; border:1px solid var(--line); background:var(--paper); }
.a2-grid span.d{ background:var(--fig-s); border-color:transparent; }
.a2-grid span.x{ border-color:transparent; background:transparent; }
.a2-grid b{ font-size:12px; color:var(--graphite); font-weight:500; display:grid; place-items:center; width:auto; padding-right:4px; }
.a2-ins{ display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:8px; }
.a2-ins label{ display:grid; gap:3px; font-size:13px; color:var(--graphite); }
.a2-code{ font-family:var(--mono, monospace); font-size:13px; background:var(--paper); border:1px solid var(--line); border-radius:6px; padding:6px 8px; margin:0 auto 8px; max-width:440px; white-space:pre-wrap; color:var(--ink); }
.a2-pair sub, .a2-pair sup, .a2-pair .v sup, .a2-key sub, .a2-key sup, .a2-lines sub, .a2-lines sup{ font-size:.9em; }
@media (prefers-reduced-motion: reduce){ .a2-lines div, .a2-pair .bb i, .a2-box{ transition:none; } }`;
  if (!document.getElementById('a2-css2')) { const s = document.createElement('style'); s.id = 'a2-css2'; s.textContent = CSS2; document.head.appendChild(s); }
  const r2 = v => Math.round(v * 100) / 100;
  const Lines = ({ L, upto, now }) => html`<div className="a2-lines">${L.slice(0, upto + 1).map((t, k) => html`<div key=${k} className=${k === now ? 'now' : ''} dangerouslySetInnerHTML=${{ __html: t }}></div>`)}</div>`;
  const FIB = [1, 1]; for (let k = 2; k <= 13; k++) FIB[k] = FIB[k - 1] + FIB[k - 2]; // slide 2.12: F0 = 1, F1 = 1, F2 = 2

  /* ── slides 2.12-2.15: induction proof that F_i < (5/3)^i ── */
  function Induction() {
    const L = ['<b>Base:</b> F<sub>1</sub> = 1 < (5/3)<sup>1</sup> ≈ 1.67', '<b>Base:</b> F<sub>2</sub> = 2 < (5/3)<sup>2</sup> = 25/9 ≈ 2.78',
      '<b>Hypothesis:</b> F<sub>i</sub> < (5/3)<sup>i</sup> for i = 1, 2, …, k−1', 'F<sub>k</sub> = F<sub>k−1</sub> + F<sub>k−2</sub> < (5/3)<sup>k−1</sup> + (5/3)<sup>k−2</sup>',
      'F<sub>k</sub> < (5/3)<sup>k−2</sup>(5/3 + 1) = (5/3)<sup>k−2</sup>(8/3)', '8/3 = 24/9 < 25/9 = (5/3)<sup>2</sup>', 'F<sub>k</sub> < (5/3)<sup>k−2</sup>(5/3)<sup>2</sup> = <b>(5/3)<sup>k</sup></b> ∎'];
    const steps = [
      { up: -1, ok: 0, en: 'Claim (slide 2.12): the Fibonacci numbers F<sub>0</sub> = 1, F<sub>1</sub> = 1, F<sub>2</sub> = 2, F<sub>i</sub> = F<sub>i−1</sub> + F<sub>i−2</sub> satisfy <b>F<sub>i</sub> < (5/3)<sup>i</sup></b> for i ≥ 1. Bars: F<sub>i</sub> against (5/3)<sup>i</sup>, right column F<sub>i</sub> < (5/3)<sup>i</sup>.' },
      { up: 0, ok: 1, en: 'Base case i = 1: F<sub>1</sub> = 1 < 5/3.' },
      { up: 1, ok: 2, en: 'Base case i = 2: F<sub>2</sub> = 2 < 25/9. Two base cases are needed because each step uses the two previous values.' },
      { up: 2, ok: 2, en: 'Inductive hypothesis: assume the theorem for every i up to k − 1. (The slide writes "i = 1, 2, .., k" and then proves F<sub>k</sub>; the step only uses k − 1 and k − 2.)' },
      { up: 3, ok: 2, en: 'Expand F<sub>k</sub> by its definition and apply the hypothesis to both terms.' },
      { up: 4, ok: 2, en: 'Factor out (5/3)<sup>k−2</sup>: 5/3 + 1 = 8/3.' },
      { up: 5, ok: 2, en: 'Compare 8/3 with (5/3)<sup>2</sup>: 8/3 = 24/9 is smaller than 25/9.' },
      { up: 6, ok: 10, en: 'So F<sub>k</sub> < (5/3)<sup>k</sup>: true for k whenever it is true for all smaller i. With the base cases it holds for every i ≥ 1 (bars for i = 1 to 8).' }];
    const view = s => html`<${Lines} L=${L} upto=${s.up} now=${s.up} />
      <div className="a2-pair">${Array.from({ length: 8 }, (_, k) => { const i = k + 1, g = (5 / 3) ** i, on = i <= s.ok;
        return html`<${F} key=${i}><span className=${'l' + (on ? ' on' : '')}>i = ${i}</span><span className="bb" style=${{ opacity: on ? 1 : .35 }}>
          <i className="f" style=${{ width: FIB[i] / 60 * 100 + '%' }}></i><i className="g" style=${{ width: g / 60 * 100 + '%' }}></i></span><span className="v" style=${{ opacity: on ? 1 : .5 }}>${FIB[i]} ${"<"} ${r2(g)}${on ? ' ✓' : ''}</span></${F}>`; })}</div>
      <div className="a2-key"><span><i style=${{ background: 'var(--fig-s)' }}></i>F<sub>i</sub></span><span><i style=${{ background: 'var(--graphite)', opacity: .55 }}></i>(5/3)<sup>i</sup></span></div>`;
    return html`<figure className="fig"><${Walk} steps=${steps} ms=${2600} view=${view} /></figure>`;
  }

  /* ── slide 2.16: counterexample to F_k ≤ k² ── */
  function Counter() {
    let first = 1; while (FIB[first] <= first * first) first++;
    const steps = [{ k: 0, en: 'Claim to disprove: <b>F<sub>k</sub> ≤ k<sup>2</sup></b> (same F as before: 1, 1, 2, 3, 5, …). One case where it fails is enough.' },
      ...Array.from({ length: first }, (_, q) => { const k = q + 1, bad = FIB[k] > k * k;
        return { k, en: `k = ${k}: F<sub>${k}</sub> = ${FIB[k]}, k<sup>2</sup> = ${k * k}. ` + (bad ? `<b>${FIB[k]} > ${k * k}</b>: the claim is false. One counterexample (k = ${k}, F<sub>11</sub> = 144) disproves it.` : `${FIB[k]} ≤ ${k * k}, the claim holds here, but that proves nothing.`) }; })];
    const view = s => html`<div className="a2-pair">${Array.from({ length: first }, (_, q) => { const k = q + 1, on = k <= s.k, bad = FIB[k] > k * k;
      return html`<${F} key=${k}><span className=${'l' + (k === s.k ? ' on' : '')}>k = ${k}</span><span className="bb" style=${{ opacity: on ? 1 : .3 }}>
        <i className="f" style=${{ width: FIB[k] / 150 * 100 + '%', background: bad && on ? '#d23c3c' : null }}></i><i className="g" style=${{ width: k * k / 150 * 100 + '%' }}></i></span>
        <span className="v" style=${{ opacity: on ? 1 : .5, color: bad && on ? '#d23c3c' : null, fontWeight: bad && on ? 700 : null }}>${FIB[k]} ${on ? (bad ? '>' : '≤') : '?'} ${k * k}</span></${F}>`; })}</div>
      <div className="a2-key"><span><i style=${{ background: 'var(--fig-s)' }}></i>F<sub>k</sub></span><span><i style=${{ background: 'var(--graphite)', opacity: .55 }}></i>k<sup>2</sup></span></div>`;
    return html`<figure className="fig"><${Walk} steps=${steps} ms=${1500} view=${view} /></figure>`;
  }

  /* ── slides 2.17-2.18: proof by contradiction, there is no largest integer ── */
  function Contra() {
    const steps = [{ en: '<b>Theorem</b>: there is no largest integer. <b>Step 1</b>, contrary assumption: assume it is false, so some integer <b>B</b> is the largest.' },
      { en: '<b>Step 2</b>: consider <b>C = B + 1</b>. C is an integer because it is the sum of two integers.' },
      { en: 'Also <b>C > B</b>, so B is not the largest integer.' },
      { en: '<b>Contradiction!</b> The assumption was wrong, hence the theorem is true.' }];
    const X = v => 40 + v * 50;
    const view = (s, i) => html`<svg viewBox="0 0 360 150" role="img" aria-label="number line with B and C = B + 1">
      <line x1="20" y1="80" x2="345" y2="80" stroke="var(--graphite)" strokeWidth="2" /><path d="M337 74 L347 80 L337 86" fill="none" stroke="var(--graphite)" strokeWidth="2" />
      ${[0, 1, 2, 3, 4, 5].map(v => html`<line key=${v} x1=${X(v)} x2=${X(v)} y1="72" y2="88" stroke="var(--graphite)" />`)}
      <circle cx=${X(3)} cy="80" r="9" fill=${i >= 3 ? 'var(--paper)' : 'var(--fig-s)'} stroke="var(--fig-s)" strokeWidth="2" />
      <text x=${X(3)} y="116" textAnchor="middle" fontSize="18" fontWeight="600">B</text>
      <text x=${X(3) - 8} y="50" textAnchor="end" fontSize="16">"largest"?</text>
      <g className=${pop(i >= 1)}><path d=${`M${X(3)} 64 Q ${X(3.5)} 34 ${X(4)} 64`} fill="none" stroke="var(--fig-k)" strokeWidth="2" /><text x=${X(3.5)} y="30" textAnchor="middle" fontSize="16">+1</text>
        <circle cx=${X(4)} cy="80" r="9" fill="var(--ok)" /><text x=${X(4)} y="116" textAnchor="middle" fontSize="18" fontWeight="600">C</text></g>
      <text x=${X(3.5)} y="142" textAnchor="middle" fontSize="17" className=${pop(i >= 2)}>C > B</text>
      <g className=${pop(i >= 3)}><line x1=${X(3) - 88} y1="44" x2=${X(3) - 4} y2="44" stroke="#d23c3c" strokeWidth="3" /><text x=${X(1.5)} y="20" textAnchor="middle" fontSize="17" fill="#d23c3c" fontWeight="700">contradiction!</text></g>
    </svg>`;
    return html`<figure className="fig"><${Walk} steps=${steps} ms=${2400} view=${view} /></figure>`;
  }

  /* ── slides 2.32-2.38: term contribution experiments #1, #2, #3 ── */
  function Contrib() {
    const [m, setM] = useState('e1'), [n, setN] = useState(10), [abc, setAbc] = useState([3, 8, 10]);
    const co = m === 'e1' ? [3, 8, 10] : m === 'e2' ? [1, 8, 10] : m === 'own' ? abc : [3, 8, 10];
    const T = x => co[0] * x * x + co[1] * x + co[2];
    const part = x => { const t = T(x); return [co[0] * x * x / t, co[1] * x / t, co[2] / t]; };
    const NS = [1, ...Array.from({ length: 20 }, (_, k) => (k + 1) * 5)];
    const px = x => 46 + (x - 1) / 99 * 296, py = y => 175 - y * 155;
    const curve = fn => NS.map(x => `${px(x).toFixed(1)},${py(fn(x)).toFixed(1)}`).join(' ');
    const COL = ['#d23c3c', 'var(--fig-s)', 'var(--ok)'];
    const lab = m === 'e2' ? ['C(n²)', 'C(8n)', 'C(10)'] : m === 'own' ? [`C(${co[0]}n²)`, `C(${co[1]}n)`, `C(${co[2]})`] : ['C(3n²)', 'C(8n)', 'C(10)'];
    const p = part(n), ratio = x => x * x / (3 * x * x + 8 * x + 10);
    const tt = m === 'e2' ? 'n² + 8n + 10' : m === 'own' ? `${co[0]}n² + ${co[1]}n + ${co[2]}` : '3n² + 8n + 10';
    const cap = m === 'e3' ? `<b>Experiment #3</b>: approximated T(n) = n<sup>2</sup> over exact T(n) = 3n<sup>2</sup> + 8n + 10. At n = ${n} the ratio is <b>${(ratio(n)).toFixed(3)}</b>. It levels off near 1/3 ≈ 0.33 from about n = 25 on: from there n<sup>2</sup> grows at the same rate as the exact T(n).`
      : `<b>${m === 'own' ? 'Your T(n)' : m === 'e1' ? 'Experiment #1' : 'Experiment #2'}</b>: T(n) = ${tt}. At n = ${n}: T(n) = ${fmt(T(n))}; the terms contribute ${lab.map((l, k) => `${l} = <b>${(p[k] * 100).toFixed(2)} %</b>`).join(', ')}. ` + ((m === 'e1' || m === 'e2') && n > 1 ? `(The slide's tables use T(n) + n/5, e.g. ${fmt(T(n) + n / 5)} for n = ${n}, so their percentages differ slightly; here T(n) = ${co[0]}·${n * n} + ${co[1] * n} + 10 exactly.) ` : '') + (m === 'e1' ? 'As n → ∞ the 3n<sup>2</sup> term approaches 100 %: drop the lower terms, T(n) ≈ 3n<sup>2</sup>.' : m === 'e2' ? 'Even without its coefficient the n<sup>2</sup> term still dominates as n grows: T(n) ≈ n<sup>2</sup>.' : 'The highest-degree term wins as n grows.');
    const okAbc = v => { const x = v.map(Number); return x.every(q => Number.isFinite(q) && q >= 0 && q <= 1000) && x.some(q => q > 0); };
    return html`<figure className="fig"><div className="fig-stage">
      <${Seg} opts=${[['e1', '#1: 3n²+8n+10'], ['e2', '#2: n²+8n+10'], ['e3', '#3: ratio'], ['own', 'Your T(n)']]} val=${m} set=${setM} />
      ${m === 'own' && html`<div className="a2-ins" style=${{ maxWidth: '320px', margin: '0 auto 8px' }}>${['n²', 'n', '1'].map((t, k) => html`<label key=${k}>× ${t}<input className="a2-in" type="number" min="0" max="1000" value=${abc[k]} onChange=${e => { const v = abc.slice(); v[k] = e.target.value === '' ? 0 : +e.target.value; if (okAbc(v)) setAbc(v); }} /></label>`)}</div>`}
      <svg viewBox="0 0 360 215" role="img" aria-label="contribution of each term as n grows">
        <line x1="46" y1="175" x2="346" y2="175" stroke="var(--graphite)" /><line x1="46" y1="15" x2="46" y2="175" stroke="var(--graphite)" />
        ${(m === 'e3' ? [0, .1, .2, .3] : [0, .5, 1]).map(y => html`<text key=${y} x="40" y=${py(m === 'e3' ? y / .35 : y) + 5} textAnchor="end" fontSize="16">${m === 'e3' ? y : y * 100 + '%'}</text>`)}
        ${[1, 50, 100].map(x => html`<text key=${x} x=${px(x)} y="196" textAnchor="middle" fontSize="16">${x}</text>`)}<text x="196" y="213" textAnchor="middle" fontSize="16" fill="var(--graphite)">n</text>
        ${m === 'e3' ? html`<polyline points=${curve(x => ratio(x) / .35)} fill="none" stroke="#d23c3c" strokeWidth="3" /><line x1="46" x2="346" y1=${py(1 / 3 / .35)} y2=${py(1 / 3 / .35)} stroke="var(--graphite)" strokeDasharray="4 4" /><text x="340" y=${py(1 / 3 / .35) + 20} textAnchor="end" fontSize="16">1/3</text>`
          : [0, 1, 2].map(k => html`<polyline key=${k} points=${curve(x => part(x)[k])} fill="none" stroke=${COL[k]} strokeWidth="3" />`)}
        <line x1=${px(n)} x2=${px(n)} y1="15" y2="175" stroke="var(--ink)" strokeDasharray="3 4" />
      </svg>
      ${m !== 'e3' && html`<div className="a2-key">${lab.map((l, k) => html`<span key=${k}><i style=${{ background: COL[k] }}></i>${l}</span>`)}</div>`}
      <label className="a2-lab" style=${{ marginTop: '8px' }}>n = ${n} (the slides' table rows: 1, 5, 10, …, 100)<input className="a2-range" type="range" min="0" max="20" step="1" value=${NS.indexOf(n)} onChange=${e => setN(NS[+e.target.value])} /></label></div>
      <${Cap} en=${cap} /></figure>`;
  }

  /* ── slides 2.40-2.43: Big-Oh witnesses c and n₀ ── */
  function BigOh() {
    const EX = { a: { f: n => 3 * n + 2, g: n => n, fs: '3n + 2', gs: 'n', c: 5, lead: 3 }, b: { f: n => 3 * n * n + 20, g: n => n * n, fs: '3n² + 20', gs: 'n²', c: 4, lead: 3 } };
    const [e, setE] = useState('a'), [cs, setC] = useState({ a: 5, b: 4 }), x = EX[e], c = cs[e];
    let n0 = null; if (c > x.lead) { for (let t = 1; t <= 1000; t++) { let ok = true; for (let n = t; n <= 1000; n++) if (x.f(n) > c * x.g(n)) { ok = false; break; } if (ok) { n0 = t; break; } } }
    const N1 = 8, Y1 = Math.max(x.f(N1), c * x.g(N1)), px = n => 46 + n / N1 * 296, py = y => 180 - y / Y1 * 160;
    const line = fn => { const p = []; for (let k = 0; k <= 64; k++) { const n = k / 8; p.push(`${px(n).toFixed(1)},${py(fn(n)).toFixed(1)}`); } return p.join(' '); };
    const isSlide = c === x.c;
    const cap = `f(n) = ${x.fs} ∈ O(${x.gs}) needs c > 0 and n<sub>0</sub> > 0 with 0 ≤ f(n) ≤ c·${x.gs} for all n ≥ n<sub>0</sub>. With <b>c = ${c}</b>: ` + (n0 ? `the inequality ${x.fs} ≤ ${c}${x.gs} first holds for good at <b>n<sub>0</sub> = ${n0}</b>` + (e === 'b' && c === 4 ? ' (3n<sup>2</sup> + 20 ≤ 4n<sup>2</sup> ⇔ n<sup>2</sup> ≥ 20 ⇔ n ≥ 5; at n = 4: 68 > 64)' : '') + '.' + (isSlide ? ' These are the slide\'s witnesses.' : ' Any working pair proves it; the slide uses c = ' + x.c + '.') + ' From n<sub>0</sub> on, f grows no faster than c·g: c·g is an <b>asymptotic upper bound</b>.' : `no n<sub>0</sub> works, because c·${x.gs} never catches up with the leading term 3${x.gs}. Pick c > 3.`);
    return html`<figure className="fig"><div className="fig-stage">
      <${Seg} opts=${[['a', 'Example 1: 3n + 2'], ['b', 'Example 2: 3n² + 20']]} val=${e} set=${setE} />
      <svg viewBox="0 0 360 220" role="img" aria-label="f(n) below c g(n) from n0 on">
        <line x1="46" y1="180" x2="346" y2="180" stroke="var(--graphite)" /><line x1="46" y1="15" x2="46" y2="180" stroke="var(--graphite)" />
        ${[0, 2, 4, 6, 8].map(n => html`<text key=${n} x=${px(n)} y="200" textAnchor="middle" fontSize="16">${n}</text>`)}<text x="196" y="218" textAnchor="middle" fontSize="16" fill="var(--graphite)">n</text>
        ${n0 && n0 <= N1 ? html`<rect x=${px(n0)} y="15" width=${px(N1) - px(n0)} height="165" fill="var(--ok)" opacity=".12" /><line x1=${px(n0)} x2=${px(n0)} y1="15" y2="180" stroke="var(--ink)" strokeDasharray="4 4" /><text x=${px(n0) + 5} y="32" fontSize="16">n₀ = ${n0}</text>` : null}
        <polyline points=${line(n => c * x.g(n))} fill="none" stroke="var(--graphite)" strokeWidth="3" strokeDasharray="7 5" />
        <polyline points=${line(x.f)} fill="none" stroke="var(--fig-s)" strokeWidth="3" />
        <text x="340" y=${Math.max(16, py(c * x.g(N1)) + (c * x.g(N1) >= x.f(N1) ? 16 : 34))} textAnchor="end" fontSize="16">c·g = ${c}${x.gs}</text>
        <text x="340" y=${Math.max(16, py(x.f(N1)) + (c * x.g(N1) >= x.f(N1) ? 34 : 16))} textAnchor="end" fontSize="16" fontWeight="600">f = ${x.fs}</text>
      </svg>
      <div className="a2-seg"><span className="a2-cnt" style=${{ alignSelf: 'center' }}>c =</span><button className="fig-btn" onClick=${() => setC({ ...cs, [e]: Math.max(1, c - 1) })} disabled=${c <= 1} aria-label="Smaller c">−</button><b style=${{ alignSelf: 'center', fontSize: '16px' }}>${c}</b><button className="fig-btn" onClick=${() => setC({ ...cs, [e]: Math.min(10, c + 1) })} disabled=${c >= 10} aria-label="Larger c">+</button><button className="fig-btn" onClick=${() => setC({ ...cs, [e]: x.c })}>Slide's c</button></div></div>
      <${Cap} en=${cap} /></figure>`;
  }

  /* ── slides 2.44-2.51: Example 3 and the sum and product rules (Examples 9, 10) ── */
  function Rules() {
    const steps = [
      { on: ['mul'], en: '<b>Example 3</b>: multiply walks the arrays once, doing one sum ← sum + x[i]*y[i] per element: n multiplications, so <b>O(n)</b>.' },
      { on: ['read', 'sort'], en: '<b>Example 9</b>: readArray runs its loop n times: <b>O(n)</b>. Sort has two nested loops (j < i): <b>O(n<sup>2</sup>)</b>. They run one after the other.' },
      { on: ['read', 'sort', 'sum1'], en: '<b>Rule #1</b>: O(f(n)) + O(g(n)) = O(f(n) + g(n)). Reading then sorting: O(n + n<sup>2</sup>) = <b>O(n<sup>2</sup>)</b>, the larger term wins.' },
      { on: ['read', 'sort', 'print', 'sum2'], en: '<b>Example 10</b>: read, sort, print in sequence: O(n + n<sup>2</sup> + n) = <b>O(n<sup>2</sup>)</b>.' },
      { on: ['read', 'sort', 'print', 'sum2', 'loop'], en: '<b>Rule #2</b>: O(f(n))·O(g(n)) = O(f(n)·g(n)). The three run m times (for array ← 1 to m): O(m)·O(n<sup>2</sup>) = <b>O(m·n<sup>2</sup>)</b>. (Slides 2.50 and 2.51 show the same example, numbered 10 and 11.)' }];
    const view = (s, i) => { const on = k => s.on.includes(k), B = (k, t) => html`<div className=${'a2-box' + (on(k) ? ' on' : '')} style=${{ opacity: on(k) ? 1 : .25 }} dangerouslySetInnerHTML=${{ __html: t }}></div>`;
      return i === 0 ? html`<div style=${{ maxWidth: '360px', margin: '0 auto' }}><div className="a2-code">${'multiply(x[], y[], n)\n  sum ← 0\n  for (i = 0; i ' + '<' + ' n; i++)\n    sum ← sum + x[i]*y[i]\n  return sum'}</div>${B('mul', 'n multiplications → <b>O(n)</b>')}</div>`
        : html`<div style=${{ maxWidth: '360px', margin: '0 auto', display: 'grid', gap: '6px' }}>
          <div className=${'a2-loop' + (on('loop') ? '' : ' offl')}>${on('loop') ? html`<div className="a2-cnt" style=${{ textAlign: 'center' }}>for array ← 1 to m</div>` : null}
            ${B('read', 'readArray(x, n): <b>O(n)</b>')}<div className="a2-arrow">↓</div>${B('sort', 'sortArray(x, n): <b>O(n²)</b>')}
            ${i >= 3 ? html`<${F}><div className="a2-arrow">↓</div>${B('print', 'printArray(x, n): <b>O(n)</b>')}</${F}>` : null}</div>
          ${i === 2 ? B('sum1', 'O(n) + O(n²) = O(n + n²) = <b>O(n²)</b>') : null}
          ${i >= 3 ? B('sum2', on('loop') ? 'm × O(n + n² + n) = <b>O(m·n²)</b>' : 'O(n + n² + n) = <b>O(n²)</b>') : null}</div>`; };
    return html`<figure className="fig"><${Walk} steps=${steps} ms=${2800} view=${view} /></figure>`;
  }

  /* ── slide 2.52: Example 12, a doubling loop around a linear loop ── */
  function Ex12() {
    const [n, setN] = useState(16);
    const ks = []; for (let k = 1; k <= n; k *= 2) ks.push(k);
    const steps = [{ r: -1, en: `Run the code with n = ${n}: the outer loop doubles k (k *= 2), the inner loop runs j = 1 .. n and does sum++. Each square below is one sum++.` },
      ...ks.map((k, q) => ({ r: q, en: `k = ${k}: the inner loop runs n = ${n} times. sum = <b>${(q + 1) * n}</b>.` })),
      { r: ks.length, en: `k takes the values ${ks.join(', ')}: ⌊lg n⌋ + 1 = ${ks.length} passes ("log n times"), each of n steps. sum = ${ks.length} × ${n} = <b>${ks.length * n}</b>. Answer <b>D: O(n log n)</b>.` }];
    const view = s => html`<div className="a2-code">${'sum = 0;\nfor (k=1; k' + '<' + '=n; k*=2) // log n\n  for (j=1; j' + '<' + '=n; j++) // n\n    sum++;'}</div>
      <div className="a2-grid" style=${{ gridTemplateColumns: `auto repeat(${n}, 14px)` }}>${ks.map((k, q) => html`<${F} key=${k}><b>k=${k}</b>${Array.from({ length: n }, (_, j) => html`<span key=${j} className=${q <= s.r ? 'd' : ''}></span>`)}</${F}>`)}</div>`;
    return html`<figure className="fig"><${Walk} key=${n} steps=${steps} ms=${1500} view=${view}
      top=${html`<${Seg} opts=${[[4, 'n = 4'], [8, 'n = 8'], [16, 'n = 16']]} val=${n} set=${setN} />`} /></figure>`;
  }

  /* ── slides 2.53, 2.55: the 7 functions, drawn one by one ── */
  function Growth() {
    const FN = [['1', n => 1, 'Constant function f(n) = c; the most fundamental is g(n) = 1.', 'var(--graphite)'],
      ['lg n', n => Math.log2(n), 'Logarithmic function f(n) = log<sub>b</sub> n; the most fundamental is g(n) = log<sub>2</sub> n.', '#a3462e'],
      ['n', n => n, 'Linear function f(n) = n.', 'var(--ink)'], ['n lg n', n => n * Math.log2(n), 'N-Log-N function f(n) = n lg n.', '#d98a1c'],
      ['n²', n => n * n, 'Quadratic function f(n) = n<sup>2</sup>.', 'var(--ok)'], ['n³', n => n ** 3, 'Cube function f(n) = n<sup>3</sup>.', '#7b4bc4'],
      ['2ⁿ', n => 2 ** n, 'Exponential function f(n) = 2<sup>n</sup>: it doubles with every step of n.', '#d23c3c']];
    const X1 = 10, Y1 = 40, px = n => 40 + n / X1 * 300, py = y => 190 - Math.min(y, Y1) / Y1 * 175;
    const pts = fn => { const p = []; for (let k = 1; k <= 200; k++) { const n = k / 20, y = fn(n); p.push(`${px(n).toFixed(1)},${py(y).toFixed(1)}`); if (y > Y1) break; } return p.join(' '); };
    const lab = (fn, k) => { let n = .05; while (n < X1 && fn(n) < Y1) n += .05; const top = fn(n) >= Y1; return top ? [px(n), 30, 'middle'] : [342, py(fn(X1)) + (k === 0 ? -3 : k === 1 ? -8 : -6), 'end']; };
    const steps = [...FN.map((f, k) => ({ en: `<b>${k + 1}.</b> ${f[2]}` })), { en: 'All seven together (y up to 40). For small n the order can change (2<sup>n</sup> is still under n<sup>3</sup> here), but as n grows: 1 < lg n < n < n lg n < n<sup>2</sup> < n<sup>3</sup> < 2<sup>n</sup>.' }];
    const view = (s, i) => html`<svg viewBox="0 0 360 215" role="img" aria-label="growth of 1, lg n, n, n lg n, n squared, n cubed and 2 to the n">
      <line x1="40" y1="190" x2="350" y2="190" stroke="var(--graphite)" /><line x1="40" y1="10" x2="40" y2="190" stroke="var(--graphite)" />
      ${[20, 40].map(y => html`<text key=${y} x="34" y=${py(y) + 5} textAnchor="end" fontSize="16">${y}</text>`)}${[0, 5, 10].map(x => html`<text key=${x} x=${px(x)} y="210" textAnchor="middle" fontSize="16">${x}</text>`)}
      ${FN.map((f, k) => { const [lx, ly, an] = lab(f[1], k); return html`<g key=${k} className=${pop(k <= i)}><polyline points=${pts(f[1])} fill="none" stroke=${f[3]} strokeWidth=${k === i ? 4 : 2.5} />
        <text x=${lx} y=${ly} textAnchor=${an} fontSize="16" fontWeight="600" fill=${f[3]}>${f[0]}</text></g>`; })}
    </svg>`;
    return html`<figure className="fig"><${Walk} steps=${steps} ms=${1800} view=${view} /></figure>`;
  }

  /* ── slide 2.54: the growth table ── */
  function GrowTab() {
    const NS = ['5', '10', '100', '1000', '10000'];
    const ROWS = [['(1)', ['1', '1', '1', '1', '1']], ['log n', ['3', '4', '7', '10', '13']], ['n', ['5', '10', '100', '1000', '10000']], ['n log n', ['15', '33', '664', '10<sup>4</sup>', '10<sup>5</sup>']],
      ['n²', ['25', '100', '10<sup>4</sup>', '10<sup>6</sup>', '10<sup>8</sup>']], ['n³', ['125', '10<sup>3</sup>', '10<sup>6</sup>', '10<sup>9</sup>', '10<sup>12</sup>']], ['2ⁿ', ['32', '10<sup>3</sup>', '10<sup>30</sup>', '10<sup>300</sup>', '10<sup>3000</sup>']]];
    const steps = [{ c: -1, en: 'The slide\'s table: how each function grows as the input size n grows. Rows are the seven functions, columns the input sizes.' },
      ...NS.map((n, k) => ({ c: k, en: `n = ${(+n).toLocaleString('en-US')}: ` + ['2<sup>5</sup> = 32 is close to n<sup>2</sup> = 25.', 'n<sup>3</sup> and 2<sup>n</sup> are both about 10<sup>3</sup> (2<sup>10</sup> = 1024).', 'n lg n = 664 but 2<sup>n</sup> ≈ 10<sup>30</sup>.', 'lg n is only 10 while 2<sup>n</sup> ≈ 10<sup>300</sup>.', 'lg n = 13 but n<sup>3</sup> = 10<sup>12</sup> and 2<sup>n</sup> ≈ 10<sup>3000</sup>.'][k] + (k === 0 ? ' The slide rounds lg n up here (lg 5 ≈ 2.32 is shown as 3, so n log n = 15).' : k === 4 ? ' (lg 10000 ≈ 13.3; n lg n ≈ 1.3 × 10<sup>5</sup>, shown as 10<sup>5</sup>.)' : '') }))];
    const view = s => html`<table className="a2-tbl au"><thead><tr><th>f(n) \\ n</th>${NS.map((n, k) => html`<th key=${k} style=${k === s.c ? { background: 'var(--fig-s)', color: '#fff' } : null}>${n}</th>`)}</tr></thead>
      <tbody>${ROWS.map(([h, v]) => html`<tr key=${h}><td><b>${h}</b></td>${v.map((x, k) => html`<td key=${k} style=${{ opacity: k <= s.c ? 1 : .25, fontWeight: k === s.c ? 600 : 400 }} dangerouslySetInnerHTML=${{ __html: x }}></td>`)}</tr>`)}</tbody></table>`;
    return html`<figure className="fig"><${Walk} steps=${steps} ms=${2300} view=${view} /></figure>`;
  }

  /* ── slides 2.8, 2.56-2.59: three algorithms for 1 + 2 + … + n ── */
  function Sum3() {
    const [a, setA] = useState('B'), [n, setN] = useState(5);
    // run each algorithm and count its operations the way the slide's table does
    const run = () => { const c = { as: 0, ad: 0, mu: 0, dv: 0, sum: 0 };
      if (a === 'A') { c.sum = 0; c.as++; for (let i = 1; i <= n; i++) { c.sum = c.sum + i; c.as++; c.ad++; } }
      else if (a === 'B') { c.sum = 0; c.as++; for (let i = 1; i <= n; i++) for (let j = n; j >= i; j--) { c.sum = c.sum + 1; c.as++; c.ad++; } }
      else { c.sum = n * (n + 1) / 2; c.as = 1; c.ad = 1; c.mu = 1; c.dv = 1; }
      return c; };
    const c = run(), tot = c.as + c.ad + c.mu + c.dv;
    const F_ = { A: ['n + 1', 'n', '', '', '2n + 1', 'Θ(n)'], B: ['1 + n(n+1)/2', 'n(n+1)/2', '', '', 'n² + n + 1', 'Θ(n²)'], C: ['1', '1', '1', '1', '4', 'Θ(1)'] }[a];
    const CODE = { A: 'sum = 0\nfor i = 1 to n\n  sum = sum + i', B: 'sum = 0\nfor i = 1 to n\n  for j = n to i\n    sum = sum + 1', C: 'sum = n * (n + 1) / 2' }[a];
    const cap = `<b>Algorithm ${a}</b> with n = ${n} gives sum = ${c.sum}. Counted: ${c.as} assignments, ${c.ad} additions${a === 'C' ? ', 1 multiplication, 1 division' : ''}: total <b>${tot}</b> = ${F_[4]} → <b>${F_[5]}</b>.` +
      (a === 'B' ? ` Row i of the staircase runs j = n down to i: n − i + 1 additions, so the total is n + (n−1) + … + 1 = n(n+1)/2 = ${n * (n + 1) / 2} (the summation of slide 2.8).` : a === 'C' ? ' The same 4 operations for any n. (The slide\'s table counts 4: one each of =, +, *, /.)' : ' One addition per value of i.');
    return html`<figure className="fig"><div className="fig-stage">
      <${Seg} opts=${[['A', 'Algorithm A'], ['B', 'Algorithm B'], ['C', 'Algorithm C']]} val=${a} set=${setA} />
      <div className="a2-seg"><span className="a2-cnt" style=${{ alignSelf: 'center' }}>n =</span><button className="fig-btn" onClick=${() => setN(Math.max(1, n - 1))} disabled=${n <= 1} aria-label="Smaller n">−</button><b style=${{ alignSelf: 'center', fontSize: '16px' }}>${n}</b><button className="fig-btn" onClick=${() => setN(Math.min(10, n + 1))} disabled=${n >= 10} aria-label="Larger n">+</button></div>
      <div className="a2-code">${CODE}</div>
      ${a !== 'C' && html`<div className="a2-grid" style=${{ gridTemplateColumns: `auto repeat(${n}, 14px)` }} aria-label="one square per addition">${Array.from({ length: a === 'A' ? 1 : n }, (_, r) => html`<${F} key=${r}><b>${a === 'A' ? 'i = 1..n' : 'i=' + (r + 1)}</b>${Array.from({ length: n }, (_, q) => html`<span key=${q} className=${a === 'A' || q >= r ? 'd' : 'x'}></span>`)}</${F}>`)}</div>`}
      <table className="a2-tbl au" style=${{ marginTop: '10px' }}><thead><tr><th></th><th>slide's count</th><th>n = ${n}</th></tr></thead>
        <tbody>${[['Assignments', F_[0], c.as], ['Additions', F_[1], c.ad], ['Multiplications', F_[2], c.mu || ''], ['Divisions', F_[3], c.dv || ''], ['Total', F_[4], tot]].map(([h, f, v]) => html`<tr key=${h}><td>${h}</td><td>${f}</td><td>${v}</td></tr>`)}</tbody></table></div>
      <${Cap} en=${cap} /></figure>`;
  }

  /* ── slides 2.60-2.61: O, Ω and Θ on the slides' f(n) = 3n + 2 ── */
  function Bounds() {
    const f = n => 3 * n + 2, N1 = 6, px = n => 46 + n / N1 * 296, py = y => 180 - y / 32 * 160;
    const ln = fn => `${px(0)},${py(fn(0))} ${px(N1)},${py(fn(N1))}`;
    const steps = [
      { up: 1, lo: 0, en: '<b>Big-O</b> is an upper bound: 3n + 2 ≤ 5n for n ≥ 1 (Example 1), so 3n + 2 ∈ O(n).' },
      { up: 0, lo: 1, en: '<b>Ω</b>: f(n) is Ω(g(n)) if f(n) ≥ c·g(n) for all n ≥ N. Here 3n + 2 ≥ 3n for every n ≥ 1 (c = 3, N = 1), so 3n + 2 ∈ Ω(n): a lower bound.' },
      { up: 0, lo: 1, en: 'Equivalently, f(n) is Ω(g(n)) iff g(n) is O(f(n)): n ≤ (1/3)(3n + 2), so n ∈ O(3n + 2).' },
      { up: 1, lo: 1, en: '<b>Θ</b>: f(n) is Θ(g(n)) if it is both Ω(g(n)) and O(g(n)). 3n ≤ 3n + 2 ≤ 5n for n ≥ 1, so 3n + 2 ∈ <b>Θ(n)</b>: a tight bound.' }];
    const view = s => html`<svg viewBox="0 0 360 220" role="img" aria-label="3n+2 between 3n and 5n">
      <line x1="46" y1="180" x2="346" y2="180" stroke="var(--graphite)" /><line x1="46" y1="15" x2="46" y2="180" stroke="var(--graphite)" />
      ${[0, 2, 4, 6].map(n => html`<text key=${n} x=${px(n)} y="200" textAnchor="middle" fontSize="16">${n}</text>`)}<text x="196" y="218" textAnchor="middle" fontSize="16" fill="var(--graphite)">n</text>
      <rect x=${px(1)} y="15" width=${px(N1) - px(1)} height="165" fill="var(--ok)" opacity=".1" /><line x1=${px(1)} x2=${px(1)} y1="15" y2="180" stroke="var(--ink)" strokeDasharray="4 4" /><text x=${px(1) + 5} y="32" fontSize="16">n₀ = 1</text>
      <g className=${pop(s.up)}><polyline points=${ln(n => 5 * n)} fill="none" stroke="var(--pen)" strokeWidth="3" strokeDasharray="7 5" /></g>
      <polyline points=${ln(f)} fill="none" stroke="var(--fig-s)" strokeWidth="3.5" />
      <g className=${pop(s.lo)}><polyline points=${ln(n => 3 * n)} fill="none" stroke="var(--ok)" strokeWidth="3" strokeDasharray="7 5" /></g>
    </svg><div className="a2-key"><span style=${{ opacity: s.up ? 1 : .35 }}><i style=${{ background: 'var(--pen)' }}></i>5n (upper)</span><span><i style=${{ background: 'var(--fig-s)' }}></i>f(n) = 3n + 2</span><span style=${{ opacity: s.lo ? 1 : .35 }}><i style=${{ background: 'var(--ok)' }}></i>3n (lower)</span></div>`;
    return html`<figure className="fig"><${Walk} steps=${steps} ms=${2800} view=${view} /></figure>`;
  }

  /* ── slide 2.62: selectkth, counting comparisons ── */
  function selSteps(a0, k) {
    const a = a0.slice(), n = a.length, st = []; let c = 0;
    st.push({ a: a.slice(), i: -1, j: -1, m: -1, c, en: `selectkth(a, k = ${k}, n = ${n}): for i = 0 .. k−1 it finds the smallest of a[i .. n−1] (index mini) and swaps it into a[i]. Basic operation: the comparison a[j] < a[mini].` });
    for (let i = 0; i < k; i++) {
      let mini = i;
      for (let j = i + 1; j < n; j++) { c++; const lt = a[j] < a[mini]; const old = mini; if (lt) mini = j;
        st.push({ a: a.slice(), i, j, m: mini, c, en: `i = ${i}, j = ${j}: a[${j}] = ${a[j]} < a[mini] = a[${old}] = ${a[old]}? ${lt ? `<b>Yes</b>, mini = ${j}.` : 'No.'} Comparisons: <b>${c}</b>.` }); }
      const t = a[i]; a[i] = a[mini]; a[mini] = t;
      st.push({ a: a.slice(), i, j: -1, m: i, c, sw: 1, en: `Swap a[${i}] and a[${mini}]: a[${i}] = <b>${a[i]}</b> is now the ${i + 1}${['st', 'nd', 'rd'][i] || 'th'} smallest.` });
    }
    st.push({ a: a.slice(), i: k - 1, j: -1, m: k - 1, c, done: 1, en: `return a[k−1] = a[${k - 1}] = <b>${a[k - 1]}</b>, the ${k}${['st', 'nd', 'rd'][k - 1] || 'th'} smallest. Pass i makes n − 1 − i comparisons: (n−1) + … + (n−k) = kn − k(k+1)/2 = <b>${c}</b>. That is O(kn); for k near n it is O(n<sup>2</sup>).` });
    return st;
  }
  function SelectK() {
    const [inp, setInp] = useState({ a: [5, 2, 1, 7, 3], k: 3 }), steps = useMemo(() => selSteps(inp.a, inp.k), [inp]), n = inp.a.length;
    const view = s => html`<div className="a2-wrap"><div className="a2-idx" style=${cols(n)}>${inp.a.map((_, q) => html`<span key=${q}>${q === s.j ? 'j' : q === s.m && s.i >= 0 ? 'mini' : q}</span>`)}</div>
      <div className="a2-row" style=${cols(n)}>${s.a.map((v, q) => html`<span key=${q} className=${'a2-c' + (s.done && q === inp.k - 1 ? ' k' : q < s.i || (s.sw && q === s.i) || s.done && q < inp.k ? ' ok' : q === s.m && s.i >= 0 ? ' k' : q === s.j ? ' mv' : '')}>${v}</span>`)}</div>
      <p className="a2-tag">green = placed · solid = a[mini] · dashed = a[j] · comparisons: ${s.c}</p></div>`;
    const parse = v => { const p = v.split('|'); if (p.length !== 2) return { err: 'Write the array, then | and k, e.g. 5 2 1 7 3 | 3.' };
      const x = parseNums(p[0], { min: 2, max: 7 }); if (x.err) return x; const k = Number(p[1]); if (!Number.isInteger(k) || k < 1 || k > x.val.length) return { err: `k must be a whole number from 1 to ${x.val.length}.` };
      return { val: { a: x.val, k } }; };
    return html`<figure className="fig"><${Walk} key=${JSON.stringify(inp)} steps=${steps} ms=${1400} view=${view} />
      <${TryBox} label="Your array | k" ex="5 2 1 7 3 | 3" parse=${parse} onOk=${setInp} hint="The slide gives no array; the example uses the problem instance [5, 2, 1, 7, 3] of slide 2.23." /></figure>`;
  }

  const CSS3 = `
.a2-stack{ display:grid; gap:5px; max-width:330px; margin:0 auto; }
.a2-fr{ border:1px solid var(--line); border-radius:7px; background:var(--paper); padding:6px 10px; font-size:14.5px; color:var(--ink); display:flex; justify-content:space-between; gap:8px; transition:background .3s; }
.a2-fr.top{ border-color:var(--fig-k); background:color-mix(in srgb, var(--fig-k) 18%, var(--paper)); }
.a2-fr.ret{ border-color:var(--ok); background:color-mix(in srgb, var(--ok) 16%, var(--paper)); }
.a2-fr .w{ color:var(--graphite); font-size:13px; align-self:center; }
.a2-hn{ display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:6px; max-width:420px; margin:0 auto; }
.a2-peg{ font:inherit; width:100%; box-sizing:border-box; position:relative; display:flex; flex-direction:column-reverse; align-items:center; gap:3px; min-height:128px; padding:6px 2px 4px; border:1px solid transparent; border-bottom:4px solid var(--graphite); border-radius:8px 8px 2px 2px; background:transparent; cursor:pointer; color:var(--ink); }
.a2-peg::before{ content:""; position:absolute; left:50%; bottom:0; top:10px; width:4px; margin-left:-2px; background:var(--line); border-radius:2px; z-index:0; }
.a2-peg.sel{ border-color:var(--fig-k); background:color-mix(in srgb, var(--fig-k) 10%, transparent); }
.a2-peg:disabled{ cursor:default; }
.a2-dk{ position:relative; z-index:1; height:18px; border-radius:9px; background:var(--fig-s); color:#fff; font-size:12px; line-height:18px; text-align:center; transition:transform .2s; }
.a2-dk.up{ transform:translateY(-8px); background:#d23c3c; }
.a2-pl{ text-align:center; font-size:14px; font-weight:600; color:var(--ink); }
.a2-msg{ text-align:center; font-size:14px; color:var(--ink); margin:8px 0 0; min-height:1.4em; }
.a2-msg.bad{ color:var(--pen); }`;
  if (!document.getElementById('a2-css3')) { const s = document.createElement('style'); s.id = 'a2-css3'; s.textContent = CSS3; document.head.appendChild(s); }
  const Stepper = ({ v, set, lo, hi, name }) => html`<div className="a2-seg"><span className="a2-cnt" style=${{ alignSelf: 'center' }}>${name} =</span><button className="fig-btn" onClick=${() => set(Math.max(lo, v - 1))} disabled=${v <= lo} aria-label=${'Smaller ' + name}>−</button><b style=${{ alignSelf: 'center', fontSize: '16px' }}>${v}</b><button className="fig-btn" onClick=${() => set(Math.min(hi, v + 1))} disabled=${v >= hi} aria-label=${'Larger ' + name}>+</button></div>`;

  /* ── slide 2.6: set notation on a Venn diagram ── */
  function Sets() {
    const steps = [
      { hl: '', en: '<b>{1, 4}</b> is the set composed of the members 1 and 4 (the slide\'s example). Call it <b>P</b>. For the operations we add a second small set <b>Q = {4, 5, 9}</b> (not on the slide).' },
      { hl: 'P', mem: 1, en: '<b>x ∈ P</b>: x is a member of P, e.g. 1 ∈ P. <b>x ∉ P</b>: x is not a member, e.g. 5 ∉ P. A set former describes members by a rule: {x | x is a positive integer}.' },
      { hl: '', card: 1, en: '<b>|P|</b> is the cardinality, the number of members: |P| = 2, |Q| = 3. <b>∅</b> is the null (empty) set: |∅| = 0.' },
      { hl: 'U', en: '<b>P ∪ Q</b> (union): all elements appearing in P <b>OR</b> Q = {1, 4, 5, 9}.' },
      { hl: 'I', en: '<b>P ∩ Q</b> (intersection): all elements appearing in P <b>AND</b> Q = {4}.' },
      { hl: 'D', en: '<b>P − Q</b> (difference): all elements of P <b>NOT</b> in Q = {1}. (And Q − P = {5, 9}.)' },
      { hl: 'S', en: '<b>S ⊆ Q, Q ⊇ S</b>: S = {4, 9} is included in Q: S is a subset of Q and Q is a superset of S. P ⊄ Q, because 1 ∈ P but 1 ∉ Q.' }];
    const K = 'color-mix(in srgb, var(--fig-k) 38%, transparent)';
    const view = (s, i) => html`<svg viewBox="0 0 360 230" role="img" aria-label="Venn diagram of P = {1, 4} and Q = {4, 5, 9}">
      <defs><clipPath id="a2-vq"><circle cx="210" cy="115" r="78" /></clipPath>
        <mask id="a2-vd"><rect x="0" y="0" width="360" height="230" fill="#fff" /><circle cx="210" cy="115" r="78" fill="#000" /></mask></defs>
      ${s.hl === 'P' && html`<circle cx="140" cy="115" r="78" fill=${K} />`}
      ${s.hl === 'U' && html`<g><circle cx="140" cy="115" r="78" fill=${K} /><circle cx="210" cy="115" r="78" fill=${K} /></g>`}
      ${s.hl === 'I' && html`<circle cx="140" cy="115" r="78" fill=${K} clipPath="url(#a2-vq)" />`}
      ${s.hl === 'D' && html`<circle cx="140" cy="115" r="78" fill=${K} mask="url(#a2-vd)" />`}
      <circle cx="140" cy="115" r="78" fill="none" stroke="var(--fig-s)" strokeWidth="2.5" />
      <circle cx="210" cy="115" r="78" fill="none" stroke="var(--graphite)" strokeWidth="2.5" />
      ${s.hl === 'S' && html`<ellipse cx="200" cy="130" rx="47" ry="36" fill=${K} stroke="var(--ok)" strokeWidth="2.5" />`}
      <text x="70" y="38" fontSize="18" fontWeight="700" fill="var(--fig-s)">P</text><text x="282" y="38" fontSize="18" fontWeight="700">Q</text>
      ${s.hl === 'S' && html`<text x="200" y="182" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--ok)">S</text>`}
      ${[[1, 105, 121], [4, 175, 121], [5, 240, 100], [9, 235, 150]].map(([v, x, y]) => html`<text key=${v} x=${x} y=${y} textAnchor="middle" fontSize="20" fontWeight="600">${v}</text>`)}
      ${s.mem && html`<text x="105" y="146" textAnchor="middle" fontSize="16" fill="var(--ok)">1 ∈ P</text>`}
      ${s.mem && html`<text x="262" y="122" textAnchor="middle" fontSize="16" fill="var(--pen)">5 ∉ P</text>`}
      ${s.card && html`<text x="175" y="222" textAnchor="middle" fontSize="16">|P| = 2 · |Q| = 3 · |∅| = 0</text>`}
      ${(s.hl === 'U' || s.hl === 'I' || s.hl === 'D') && html`<text x="175" y="222" textAnchor="middle" fontSize="17" fontWeight="600">${{ U: 'P ∪ Q = {1, 4, 5, 9}', I: 'P ∩ Q = {4}', D: 'P − Q = {1}' }[s.hl]}</text>`}
    </svg>`;
    return html`<figure className="fig"><${Walk} steps=${steps} ms=${2600} view=${view} /></figure>`;
  }

  /* ── slide 2.7: the four logarithm rules, checked on a base-2 ruler ── */
  function Logs() {
    const X = k => 40 + k * 47, Y = 120;
    const steps = [
      { en: 'Logarithms in base 2 on a ruler: the mark for 2<sup>k</sup> sits at distance k = lg 2<sup>k</sup>. Multiplying numbers adds distances.', segs: [] },
      { en: '<b>Rule 1: log(nm) = log n + log m.</b> lg(8 · 4) = lg 32 = 5, and lg 8 + lg 4 = 3 + 2 = 5 ✓.', segs: [[0, 3, 'lg 8 = 3', 0], [3, 5, 'lg 4 = 2', 1]], hit: 5 },
      { en: '<b>Rule 2: log(n/m) = log n − log m.</b> lg(32 / 4) = lg 8 = 3, and lg 32 − lg 4 = 5 − 2 = 3 ✓.', segs: [[0, 5, 'lg 32 = 5', 0], [5, 3, '− lg 4 = 2', 1]], hit: 3 },
      { en: '<b>Rule 3: log(n<sup>r</sup>) = r log n.</b> lg(4<sup>3</sup>) = lg 64 = 6, and 3 · lg 4 = 3 · 2 = 6 ✓.', segs: [[0, 2, 'lg 4', 0], [2, 4, 'lg 4', 1], [4, 6, 'lg 4', 0]], hit: 6 },
      { en: '<b>Rule 4: log<sub>a</sub> n = log<sub>b</sub> n / log<sub>b</sub> a.</b> log<sub>4</sub> 64 = lg 64 / lg 4 = 6 / 2 = 3 ✓ (4<sup>3</sup> = 64): measured in steps of lg 4 = 2, 64 is 3 steps away.', segs: [[0, 2, '1', 0], [2, 4, '2', 1], [4, 6, '3', 0]], hit: 6, b4: 1 }];
    const view = s => html`<svg viewBox="0 0 360 175" role="img" aria-label="base 2 logarithm ruler">
      <line x1=${X(0)} x2=${X(6)} y1=${Y} y2=${Y} stroke="var(--graphite)" strokeWidth="2" />
      ${[0, 1, 2, 3, 4, 5, 6].map(k => html`<g key=${k}><line x1=${X(k)} x2=${X(k)} y1=${Y - 7} y2=${Y + 7} stroke="var(--graphite)" strokeWidth="2" />
        <text x=${X(k)} y=${Y + 28} textAnchor="middle" fontSize="17" fontWeight=${k === s.hit ? 700 : 400} style=${k === s.hit ? { fill: 'var(--pen)' } : null}>${2 ** k}</text>
        <text x=${X(k)} y=${Y + 50} textAnchor="middle" fontSize="16" fill="var(--graphite)">${k}</text></g>`)}
      <text x="0" y=${Y + 50} fontSize="16" fill="var(--graphite)">lg</text><text x="0" y=${Y + 28} fontSize="16" fill="var(--graphite)">n</text>
      ${s.segs.map(([a, b, t, alt], k) => { const y = Y - 22 - (alt ? 30 : 0), back = b < a;
        return html`<g key=${k}><line x1=${X(a)} x2=${X(b)} y1=${y} y2=${y} stroke=${back ? '#d23c3c' : alt ? 'var(--ok)' : 'var(--fig-s)'} strokeWidth="4" />
          <path d=${back ? `M${X(b) + 9} ${y - 6} L${X(b)} ${y} L${X(b) + 9} ${y + 6}` : `M${X(b) - 9} ${y - 6} L${X(b)} ${y} L${X(b) - 9} ${y + 6}`} fill="none" stroke=${back ? '#d23c3c' : alt ? 'var(--ok)' : 'var(--fig-s)'} strokeWidth="3" />
          <text x=${(X(a) + X(b)) / 2} y=${y - 8} textAnchor="middle" fontSize="16">${t}</text></g>`; })}
      ${s.b4 && html`<text x="180" y="18" textAnchor="middle" fontSize="16" fontWeight="600">steps of log₄: 4¹, 4², 4³ = 64</text>`}
    </svg>`;
    return html`<figure className="fig"><${Walk} steps=${steps} ms=${3000} view=${view} /></figure>`;
  }

  /* ── slide 2.9, example 1: computing n! recursively ── */
  function Factorial() {
    const [n, setN] = useState(4);
    const steps = [];
    for (let k = n; k >= 1; k--) steps.push({ d: n - k + 1, ret: 0, en: `Call <b>fact(${k})</b>. ` + (k > 1 ? `${k} > 1, so it needs ${k} × fact(${k - 1}) and calls itself on the smaller problem; this call waits on the stack.` : `<b>Base case</b>: n = 1, so fact(1) returns 1 without calling itself.`) });
    let v = 1;
    for (let k = 2; k <= n; k++) { const prev = v; v *= k; steps.push({ d: n - k + 1, ret: k, val: v, en: `fact(${k - 1}) returned ${prev}, so fact(${k}) = ${k} × ${prev} = <b>${v}</b>. Its frame is popped.` + (k === n ? ` Done: <b>${n}! = ${v}</b>, after ${n} calls.` : '') }); }
    if (n === 1) steps[0].en += ' Done: <b>1! = 1</b>.';
    const val = k => { let p = 1; for (let q = 2; q <= k; q++) p *= q; return p; };
    const view = s => { const frames = []; for (let k = n; k >= n - s.d + 1; k--) frames.push(k);
      return html`<div className="a2-code" style=${{ maxWidth: '330px' }}>${'fact(n)\n  if (n <= 1) return 1\n  return n * fact(n - 1)'}</div>
        <div className="a2-stack" aria-label="call stack, newest on top">${frames.slice().reverse().map((k, q) => { const top = q === 0, done = s.ret && k === s.ret;
          return html`<div key=${k} className=${'a2-fr' + (done ? ' ret' : top ? ' top' : '')}><span>fact(${k})${k > 1 ? ` = ${k} × fact(${k - 1})` : ''}</span><span className="w">${done ? '= ' + s.val : k === 1 && top && !s.ret ? 'returns 1' : 'waiting'}</span></div>`; })}
</div>
        <p className="a2-tag">call stack (newest on top) · depth ${s.d}${s.ret ? '' : ''}</p>`; };
    return html`<figure className="fig"><${Walk} key=${n} steps=${steps} ms=${1600} view=${view} top=${html`<${Stepper} v=${n} set=${setN} lo=${1} hi=${6} name="n" />`} /></figure>`;
  }

  /* ── slide 2.9, example 2: the Tower of Hanoi, play it or watch the recursive solution ── */
  const PEG = ['A', 'B', 'C'];
  function hanoiMoves(n) { const out = []; (function go(k, f, t, s) { if (!k) return; go(k - 1, f, s, t); out.push([k, f, t, s]); go(k - 1, s, t, f); })(n, 0, 2, 1); return out; }
  function Pegs({ pegs, n, sel, onPeg, lift }) {
    return html`<div className="a2-hn">${pegs.map((p, k) => html`<div key=${k}><button className=${'a2-peg' + (sel === k ? ' sel' : '')} disabled=${!onPeg} onClick=${() => onPeg && onPeg(k)} aria-label=${`peg ${PEG[k]}: ${p.length ? 'disks ' + p.join(', ') : 'empty'}`}>
      ${p.map((d, q) => html`<div key=${d} className=${'a2-dk' + (lift && sel === k && q === p.length - 1 ? ' up' : '')} style=${{ width: (28 + d / Math.max(n, 3) * 72) + '%' }}>${d}</div>`)}</button><div className="a2-pl">${PEG[k]}</div></div>`)}</div>`;
  }
  function HanoiPlay({ n }) {
    const start = () => [Array.from({ length: n }, (_, k) => n - k), [], []];
    const [pegs, setPegs] = useState(start), [sel, setSel] = useState(null), [moves, setMoves] = useState(0), [msg, setMsg] = useState({ t: `Move all ${n} disk${n > 1 ? 's' : ''} from A to C. Tap a peg to pick up its top disk, then tap another peg to drop it.` });
    const won = pegs[2].length === n;
    const tap = k => { if (won) return;
      if (sel === null) { if (!pegs[k].length) { setMsg({ t: `Peg ${PEG[k]} is empty: pick a peg with a disk.`, bad: 1 }); return; } setSel(k); setMsg({ t: `Picked up disk ${pegs[k][pegs[k].length - 1]} from ${PEG[k]}. Tap the peg to drop it on.` }); return; }
      if (k === sel) { setSel(null); setMsg({ t: 'Put back. Pick a peg.' }); return; }
      const d = pegs[sel][pegs[sel].length - 1], top = pegs[k][pegs[k].length - 1];
      if (top !== undefined && top < d) { setMsg({ t: `Not allowed: disk ${d} cannot go on the smaller disk ${top}.`, bad: 1 }); return; }
      const P = pegs.map(x => x.slice()); P[sel].pop(); P[k].push(d); const m = moves + 1;
      setPegs(P); setSel(null); setMoves(m);
      if (P[2].length === n) setMsg({ t: `Solved in ${m} moves. The minimum is 2<sup>${n}</sup> − 1 = ${2 ** n - 1}${m === 2 ** n - 1 ? ': perfect!' : '.'}` });
      else setMsg({ t: `Moved disk ${d} from ${PEG[sel]} to ${PEG[k]}.` }); };
    return html`<${F}><div className="fig-stage"><${Pegs} pegs=${pegs} n=${n} sel=${sel} onPeg=${tap} lift=${1} />
      <p className=${'a2-msg' + (msg.bad ? ' bad' : '')} role="status" dangerouslySetInnerHTML=${{ __html: msg.t }}></p></div>
      <${Cap} en=${`Rules: move one disk at a time, and never put a larger disk on a smaller one. Moves: <b>${moves}</b> (minimum 2<sup>${n}</sup> − 1 = ${2 ** n - 1}).`} />
      <div className="fig-bar"><span className="grow"></span><button className="fig-btn" onClick=${() => { setPegs(start()); setSel(null); setMoves(0); setMsg({ t: 'Reset. Move all disks from A to C.' }); }}>↻ Reset</button></div></${F}>`;
  }
  function Hanoi() {
    const [n, setN] = useState(3), [mode, setMode] = useState('play');
    const mv = useMemo(() => hanoiMoves(n), [n]);
    const steps = useMemo(() => { const P = [Array.from({ length: n }, (_, k) => n - k), [], []], st = [{ pegs: P.map(x => x.slice()), c: 0, en: `Recursive solution for n = ${n}: to move n disks from A to C, (1) move the top n − 1 to the spare peg, (2) move the largest disk, (3) move the n − 1 back on top of it. The slides give no recurrence; counting gives T(n) = 2T(n−1) + 1, T(1) = 1.` }];
      mv.forEach(([d, f, t, s], q) => { P[f].pop(); P[t].push(d);
        const why = d === n ? `the largest disk ${d} goes straight from ${PEG[f]} to ${PEG[t]} (step 2)` : `disk ${d} moves ${PEG[f]} → ${PEG[t]}, part of moving the smaller tower above it`;
        st.push({ pegs: P.map(x => x.slice()), c: q + 1, en: `Move ${q + 1}: ${why}.` + (q + 1 === mv.length ? ` Finished in <b>${mv.length}</b> moves = 2<sup>${n}</sup> − 1: T(n) = 2T(n−1) + 1 = 2<sup>n</sup> − 1, so the puzzle is O(2<sup>n</sup>).` : '') }); });
      return st; }, [n]);
    const view = s => html`<${Pegs} pegs=${s.pegs} n=${n} sel=${null} /><p className="a2-msg">moves: <b>${s.c}</b> of 2<sup>${n}</sup> − 1 = ${2 ** n - 1}</p>`;
    const top = html`<${Seg} opts=${[['play', 'Play'], ['sol', 'Show the solution']]} val=${mode} set=${setMode} /><${Stepper} v=${n} set=${setN} lo=${1} hi=${5} name="disks" />`;
    return html`<figure className="fig">${mode === 'play' ? html`<div className="fig-stage" style=${{ paddingBottom: 0 }}>${top}</div><${HanoiPlay} key=${n} n=${n} />`
      : html`<${Walk} key=${n} steps=${steps} ms=${1300} view=${view} top=${top} />`}</figure>`;
  }

  window.FIGS = Object.assign(window.FIGS || {}, {
    'ag-2-induction': Induction, 'ag-2-counter': Counter, 'ag-2-contra': Contra, 'ag-2-contrib': Contrib,
    'ag-2-bigoh': BigOh, 'ag-2-rules': Rules, 'ag-2-ex12': Ex12, 'ag-2-growth': Growth, 'ag-2-growtab': GrowTab,
    'ag-2-sum3': Sum3, 'ag-2-bounds': Bounds, 'ag-2-selectk': SelectK,
    'ag-2-factorial': Factorial, 'ag-2-hanoi': Hanoi, 'ag-2-sets': Sets, 'ag-2-logs': Logs
  });
})();
/* ── part L9 ── */
// Algorithms visuals, Lecture 9 (Red-black trees: properties, height, rotations, insertion): the example tree and its four properties (slides 4-8), the 2-3-4 merge proof of h ≤ 2 lg(n + 1) (9-15), rotations (18), inserting 15 (19-23), the pseudocode and Cases 1-3 (24-29). Every label and number comes from the slides.
(function () {
  const { useState, useEffect, useRef, useMemo } = React;
  const { html, useSteps, Cap, Bar, pop, calm, useClock, useFit, sec } = window.FIGKIT;
  // ── shared red-black engine: insert / delete with one snapshot per step (follows the slides' rbInsert and rbDelete + rbTreeFix code) ──
  const RBK = '#1f2328', RRD = '#d23c3c', MOVE = calm() ? 'none' : 'transform .6s ease, opacity .4s ease', DMOVE = calm() ? 'none' : 'd .6s ease';
  let UID = 0;
  const T0 = () => ({ root: null, n: {} });
  const cl = t => ({ root: t.root, n: Object.fromEntries(Object.entries(t.n).map(([k, v]) => [k, { ...v }])) });
  // nested spec [key, 'R'|'B', left, right]
  function build(spec) {
    const t = T0();
    const mk = (s, p) => { if (!s) return null; const id = 'n' + (++UID); t.n[id] = { k: s[0], c: s[1], p, l: null, r: null }; t.n[id].l = mk(s[2], id); t.n[id].r = mk(s[3], id); return id; };
    t.root = mk(spec, null); return t;
  }
  const col = (t, id) => id ? t.n[id].c : 'B';
  const keyOf = (t, id) => id ? (t.n[id].pre ? 'NIL' : t.n[id].k) : 'NIL';
  const findK = (t, k) => { let x = t.root; while (x && t.n[x].k !== k) x = k < t.n[x].k ? t.n[x].l : t.n[x].r; return x; };
  const keysOf = t => { const o = []; const f = id => { if (!id) return; f(t.n[id].l); if (!t.n[id].pre) o.push(t.n[id].k); f(t.n[id].r); }; f(t.root); return o; };
  function rotL(t, x) { const n = t.n, X = n[x], y = X.r, Y = n[y]; X.r = Y.l; if (Y.l) n[Y.l].p = x; Y.p = X.p; if (!X.p) t.root = y; else if (n[X.p].l === x) n[X.p].l = y; else n[X.p].r = y; Y.l = x; X.p = y; }
  function rotR(t, y) { const n = t.n, Y = n[y], x = Y.l, X = n[x]; Y.l = X.r; if (X.r) n[X.r].p = y; X.p = Y.p; if (!Y.p) t.root = x; else if (n[Y.p].l === y) n[Y.p].l = x; else n[Y.p].r = x; X.r = y; Y.p = x; }
  // RB-INSERT: returns steps [{ t, en, tags, cas }]; o.six names the mirror cases 4-6 (Lecture 10), otherwise "Case k (mirror)"
  function insTrace(t0, key, o = {}) {
    const t = cl(t0), n = t.n, S = [], K = id => n[id].k;
    const snap = (en, tags = {}, cas = 0) => S.push({ t: cl(t), en, tags, cas });
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
      const tags = { [x]: 'x', [p]: 'p' }; if (u) tags[u] = 'y';
      const cn = c => (o.six && !left ? c + 3 : c), mir = !left && !o.six ? ' (mirror: p[x] is a right child)' : '';
      const two = `x = ${K(x)} and its parent ${K(p)} are both red (property 3 broken).`;
      if (col(t, u) === 'R') {
        snap(`${two} The uncle y = ${un} is <b>red</b>: <b>Case ${cn(1)}</b>${mir}.`, tags, cn(1));
        n[p].c = 'B'; n[u].c = 'B'; n[g].c = 'R';
        snap(`<b>Case ${cn(1)}</b>: colour p[x] = ${K(p)} and y = ${un} <b>black</b> and the grandparent ${K(g)} <b>red</b>; then x ← p[p[x]] = ${K(g)}. No black-height changes.`, { [g]: 'new x' }, cn(1));
        x = g;
      } else {
        const zig = left ? x === n[p].r : x === n[p].l;
        if (zig) {
          snap(`${two} The uncle y = ${un} is <b>black</b> and x is a ${left ? 'right' : 'left'} child while p[x] is a ${left ? 'left' : 'right'} child (a zig-zag): <b>Case ${cn(2)}</b>${mir}.`, tags, cn(2));
          x = p; left ? rotL(t, x) : rotR(t, x);
          snap(`<b>Case ${cn(2)}</b>: x ← p[x] = ${K(x)}, then ${left ? 'LEFT' : 'RIGHT'}-ROTATE(${K(x)}). Now x, p[x] and p[p[x]] lie on a straight line, which is Case ${cn(3)}.`, { [x]: 'x', [n[x].p]: 'p' }, cn(2));
        } else snap(`${two} The uncle y = ${un} is <b>black</b> and x is a ${left ? 'left' : 'right'} child like p[x] (a straight line): <b>Case ${cn(3)}</b>${mir}.`, tags, cn(3));
        const p2 = n[x].p, g2 = n[p2].p;
        n[p2].c = 'B'; n[g2].c = 'R';
        snap(`<b>Case ${cn(3)}</b>: colour p[x] = ${K(p2)} <b>black</b> and p[p[x]] = ${K(g2)} <b>red</b>.`, { [x]: 'x', [p2]: 'p' }, cn(3));
        left ? rotR(t, g2) : rotL(t, g2);
        snap(`<b>Case ${cn(3)}</b>: ${left ? 'RIGHT' : 'LEFT'}-ROTATE(${K(g2)}). Now ${K(p2)} is black with red children ${K(x)} and ${K(g2)}: no red node has a red parent, so the loop stops.`, { [p2]: '' }, cn(3));
      }
    }
    const last = S[S.length - 1];
    if (n[t.root].c === 'R') { n[t.root].c = 'B'; snap(`color[root[T]] ← BLACK: the root ${K(t.root)} is coloured black (property 2). Done.`, {}, 0); }
    else if (!fixed) last.en += ` Its parent ${K(n[id].p)} is black, so nothing is violated. Done.`;
    else if (last.cas === 1 || last.cas === 4) last.en += ` The new x = ${K(x)} has a black parent, so the loop stops. Done.`;
    else last.en += ' Done.';
    return S;
  }
  // RB-DELETE as on the slides: two children → copy the predecessor's data, remove node y, its child x (or a black pretend NIL) takes its place, rbTreeFix(x) if y was black
  function delTrace(t0, key) {
    const t = cl(t0), n = t.n, S = [], K = id => keyOf(t, id);
    const snap = (en, tags = {}, tok = null, cas = '') => S.push({ t: cl(t), en, tags, tok, cas });
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
  // tree → drawing structure; nil adds the NIL leaves as small black squares
  function toS(t, nil) {
    const f = id => { const v = t.n[id]; if (v.pre) return { id, pre: 1 }; return { id, label: v.k, c: v.c, L: v.l ? f(v.l) : nil ? { nil: 1, side: -1, id: id + 'L' } : null, R: v.r ? f(v.r) : nil ? { nil: 1, side: 1, id: id + 'R' } : null }; };
    return t.root ? f(t.root) : null;
  }
  function lay(s) {
    const items = [], edges = [], nils = []; let slot = 0, dmax = 0;
    const walk = (v, d, pid) => {
      if (!v) return;
      if (v.nil) { nils.push({ ...v, pid, d }); return; }
      dmax = Math.max(dmax, d);
      if (v.tri || v.pre) { items.push({ ...v, sx: slot++, d }); if (pid) edges.push([pid, v.id]); return; }
      walk(v.L, d + 1, v.id); items.push({ ...v, sx: slot++, d }); walk(v.R, d + 1, v.id); if (pid) edges.push([pid, v.id]);
    };
    walk(s, 0, null);
    return { items, edges, nils, slots: slot, dmax };
  }
  const nodeFill = c => c === 'R' ? RRD : c === 'B' ? RBK : 'var(--paper)';
  // the drawing: nodes keep their place on screen between steps (keyed by id), so rotations and recolourings animate
  function Tree({ s, tags = {}, tok = null, nil = false, min = 7, label = 'Red-black tree', marks = {}, onTap = null }) {
    const L = s ? lay(s) : { items: [], edges: [], nils: [], slots: 0, dmax: 0 };
    const SL = 36, LV = 54, slots = Math.max(min, L.slots), W = slots * SL + 60, sc = 268 / W;
    const fs = Math.max(16, 12.4 / sc), tf = Math.max(14, 12.2 / sc), R = Math.max(15, fs * .86);
    const H = (L.dmax + 1) * LV + (nil ? 26 : 2) + 16, ox = 14 + (slots - L.slots) * SL / 2 + SL / 2, P = {};
    L.items.forEach(o => { P[o.id] = [ox + o.sx * SL, 26 + o.d * LV]; });
    const it = Object.fromEntries(L.items.map(o => [o.id, o]));
    const tip = id => { const o = it[id], [x, y] = P[id]; return o.tri ? [x, y - 14] : o.pre ? [x, y - 7] : [x, y]; };
    const eds = L.edges.map(([a, b]) => { const [x1, y1] = P[a], [x2, y2] = tip(b); const d = `M${x1} ${y1} L${x2} ${y2}`; return html`<path key=${'e' + b} d=${d} style=${{ d: `path("${d}")`, transition: DMOVE }} stroke="var(--graphite)" strokeWidth="2" fill="none" />`; });
    const nl = nil ? L.nils.map(v => { const [x, y] = P[v.pid], nx = x + v.side * 12, ny = y + 34; return html`<g key=${v.id}><path d=${`M${x} ${y} L${nx} ${ny}`} stroke="var(--graphite)" strokeWidth="1.6" /><rect x=${nx - 5} y=${ny - 5} width="10" height="10" fill=${RBK} stroke="var(--ink)" strokeWidth="1" /></g>`; }) : null;
    const nodes = L.items.map(o => {
      const [x, y] = P[o.id], tg = tags[o.id], mk = marks[o.id];
      let body;
      if (o.tri) body = html`<path d="M0 -14 L17 22 L-17 22 Z" fill="color-mix(in srgb, var(--fig-k) 20%, var(--paper))" stroke="var(--fig-k)" strokeWidth="1.6" /><text y="16" textAnchor="middle" fontSize=${tf}>${o.tri === true ? '' : o.tri}</text>${o.b ? html`<circle cy="-14" r="4.5" fill=${RBK} stroke="var(--ink)" strokeWidth="1" />` : null}`;
      else if (o.pre) body = html`<circle r="7" fill=${RBK} stroke="var(--ink)" strokeWidth="1.2" />`;
      else body = html`<circle r=${R} fill=${nodeFill(o.c)} stroke=${o.c === '?' ? 'var(--fig-k)' : o.c === 'A' ? 'var(--graphite)' : o.c === 'N' ? 'var(--ink)' : 'var(--ink)'} strokeWidth=${o.c === 'R' || o.c === 'B' ? 1.2 : 2} strokeDasharray=${o.c === '?' || o.c === 'A' ? '4 3' : null} style=${{ transition: calm() ? 'none' : 'fill .5s' }} />
        <text textAnchor="middle" dy=".35em" fontSize=${fs} fontWeight="700" style=${{ fill: o.c === 'R' || o.c === 'B' ? '#fff' : 'var(--ink)' }}>${o.label}</text>`;
      const tap = onTap && !o.tri && !o.pre ? { onClick: () => onTap(o.id), onKeyDown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTap(o.id); } }, tabIndex: 0, role: 'button', 'aria-label': 'node ' + o.label } : {};
      return html`<g key=${o.id} ...${tap} style=${{ transform: `translate(${x}px,${y}px)`, transition: MOVE, cursor: onTap && !o.tri ? 'pointer' : null }}>
        ${tg != null && !o.tri ? html`<circle r=${(o.pre ? 7 : R) + 5} fill="none" stroke="var(--fig-k)" strokeWidth="3" />` : null}
        ${body}
        ${tg ? html`<text x=${(o.pre ? 9 : R) + 3} y=${-R + 3} fontSize=${tf} fontWeight="700" style=${{ fill: 'var(--fig-k)' }}>${tg}</text>` : null}
        ${mk ? html`<text x=${(o.pre ? 9 : R) + 3} y=${R + 4} fontSize=${tf} fontWeight="700" style=${{ fill: mk[1] || 'var(--pen)' }}>${mk[0]}</text>` : null}
        ${tok === o.id ? html`<rect x=${-(o.pre ? 7 : R) - 15} y=${-R + 1} width="10" height="10" fill="var(--ink)" />` : null}
      </g>`;
    });
    return html`<svg className="a9-tree" viewBox=${`0 0 ${W} ${Math.max(H, 80)}`} role="img" aria-label=${label}>${eds}${nl}${nodes}</svg>`;
  }
  // a code listing with the lines of the current step highlighted
  const Code = ({ lines, on = [] }) => html`<pre className="a9-code" aria-label="Pseudocode">${lines.map((l, k) => { const ind = l.length - l.trimStart().length; return html`<span key=${k} className=${on.includes(k) ? 'on' : ''} style=${{ paddingLeft: (ind * .5 + 1.6) + 'em', textIndent: '-1.2em' }}>${l.trimStart()}</span>`; })}</pre>`;
  const Tabs = ({ opts, v, set }) => html`<div className="a9-tabs" role="group">${opts.map(([k, t]) => html`<button key=${k} className="fig-btn" aria-pressed=${String(v === k)} onClick=${() => set(k)}>${t}</button>`)}</div>`;
  const CORE_CSS = `
.a9-of{ font-size:.85rem; color:var(--graphite); }
.a9-tree{ display:block; width:100%; height:auto; max-width:520px; margin:0 auto; }
.a9-code{ font:12px/1.45 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; background:var(--paper); color:var(--ink); border:1px solid var(--line); border-radius:8px; padding:8px 6px; margin:10px auto 0; max-width:520px; white-space:pre-wrap; overflow-wrap:anywhere; text-align:left; }
.a9-code span{ display:block; padding:0 4px; border-radius:4px; }
.a9-code span.on{ background:color-mix(in srgb, var(--fig-k) 24%, transparent); font-weight:700; }
.a9-tabs{ display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin:0 0 10px; }
.a9-tabs .fig-btn[aria-pressed="true"]{ background:var(--fig-s); color:#fff; border-color:transparent; }
.a9-eq{ text-align:center; font-size:.95rem; line-height:1.6; margin:8px 0 0; color:var(--ink); }
.a9-eq div{ transition:opacity .5s; } .a9-eq .off{ opacity:.15; } .a9-eq .on{ font-weight:700; }
.a9-leg{ display:flex; flex-wrap:wrap; gap:6px 14px; justify-content:center; font-size:.85rem; color:var(--graphite); margin-top:6px; }
.a9-leg i{ display:inline-block; width:12px; height:12px; border-radius:50%; vertical-align:-1px; margin-right:4px; }
.a9-in{ display:flex; flex-wrap:wrap; gap:6px; align-items:center; justify-content:center; margin:0 0 10px; font-size:.9rem; }
.a9-in input{ font:inherit; min-width:0; flex:1 1 150px; max-width:260px; padding:6px 8px; border:1px solid var(--line); border-radius:8px; background:var(--paper); color:var(--ink); }
.a9-err{ color:var(--pen); font-size:.88rem; text-align:center; margin:0 0 8px; }
.a9-chips{ display:flex; flex-wrap:wrap; gap:4px; justify-content:center; margin:0 0 8px; }
.a9-chips span{ font-size:.85rem; padding:2px 8px; border-radius:99px; border:1px solid var(--line); color:var(--graphite); }
.a9-chips span.cur{ background:var(--fig-s); color:#fff; border-color:transparent; } .a9-chips span.done{ color:var(--ink); border-color:var(--fig-k); }
`;
  // Back / Next / Replay; long traces show "step i of n" instead of a row of dots that would not fit a phone
  const SBar = ({ steps, i, ctl }) => steps.length <= 11 ? html`<${Bar} steps=${steps} i=${i} ctl=${ctl} />` : html`<div className="fig-bar">
    <span className="a9-of">step ${i + 1} of ${steps.length}</span><span className="grow"></span>
    <button className="fig-btn" onClick=${() => ctl.go(Math.max(0, i - 1))} disabled=${i === 0} aria-label="Previous step">‹ Back</button>
    <button className="fig-btn" onClick=${() => ctl.go(Math.min(steps.length - 1, i + 1))} disabled=${i === steps.length - 1} aria-label="Next step">Next ›</button>
    <button className="fig-btn" onClick=${ctl.replay}>↻ Replay</button></div>`;
  const CSS = CORE_CSS + `
.a9-box{ fill:color-mix(in srgb, var(--fig-k) 14%, var(--paper)); stroke:var(--fig-k); stroke-width:2; transition:opacity .5s; }
`;
  if (!document.getElementById('a9-css')) { const s = document.createElement('style'); s.id = 'a9-css'; s.textContent = CSS; document.head.appendChild(s); }
  const EX = [7, 'B', [3, 'B'], [18, 'R', [10, 'B', [8, 'R'], [11, 'R']], [22, 'B', null, [26, 'R']]]];
  const bhOf = (t, id) => { let b = 0; for (let x = t.n[id].l; ; x = t.n[x].l) { if (!x) return b + 1; if (t.n[x].c === 'B') b++; } };

  // slides 9.4-9.8: the example tree and the four red-black properties
  function Props() {
    const t = useMemo(() => build(EX), []), id = k => findK(t, k), s = useMemo(() => toS(t, true), [t]);
    const reds = [18, 8, 11, 26], all = Object.fromEntries(Object.keys(t.n).map(k => [k, '']));
    const steps = [
      { en: 'The slides\' example red-black tree: 8 keys, the NIL leaves drawn as small black squares. Its height is <b>h = 4</b> (root 7 down to a NIL under 8).', tags: {} },
      { en: '<b>1.</b> Every node is either <b>red</b> or <b>black</b>: the colour is one extra bit per node.', tags: all },
      { en: '<b>2.</b> The <b>root</b> (7) and the <b>leaves</b> (all 9 NILs) are black.', tags: { [id(7)]: 'root' } },
      { en: '<b>3.</b> If a node is red, then its parent is black: the red nodes 18, 8, 11, 26 have the black parents 7, 10, 10, 22. So a path never has two reds in a row.', tags: Object.fromEntries(reds.map(k => [id(k), ''])) },
      { en: '<b>4.</b> All simple paths from a node x down to a leaf have the same number of black nodes, the <b>black-height bh(x)</b> (x not counted, the NIL counted): bh(7) = 2, bh(18) = 2, bh(10) = 1, bh(8) = 1, and bh(NIL) = 0.', tags: {}, bh: [7, 18, 10, 8] }
    ];
    const [i, ctl] = useSteps(steps.length, 2600), st = steps[i];
    const marks = st.bh ? Object.fromEntries(st.bh.map(k => [id(k), ['bh=' + bhOf(t, id(k)), 'var(--fig-k)']])) : {};
    return html`<figure className="fig"><div className="fig-stage">
      <${Tree} s=${s} tags=${st.tags} nil=${true} marks=${marks} min=${8} label="Example red-black tree with keys 7, 3, 18, 10, 22, 8, 11, 26" />
      <div className="a9-leg a9-leg"><span><i style=${{ background: RBK, border: '1px solid var(--ink)' }}></i>black</span><span><i style=${{ background: RRD }}></i>red</span><span><i style=${{ background: RBK, borderRadius: 0, width: '9px', height: '9px', border: '1px solid var(--ink)' }}></i>NIL leaf</span></div></div>
      <${Cap} en=${st.en} /><${SBar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  // slides 9.9-9.15: merge the red nodes into their black parents → a 2-3-4 tree, then the height bound
  function Merge() {
    const t = useMemo(() => build(EX), []), id = k => findK(t, k);
    const SL = 36, LV = 54, W = 372, L = useMemo(() => lay(toS(t, true)), [t]), ox = 14 + SL / 2;
    const RB = {}; L.items.forEach(o => { RB[o.id] = [ox + o.sx * SL, 26 + o.d * LV]; });
    L.nils.forEach(v => { const [x, y] = RB[v.pid]; RB[v.id] = [x + v.side * 12, y + 34]; });
    // the 2-3-4 tree: {7,18} on top; {3}, {8,10,11}, {22,26} below; the 9 NIL leaves on one level
    const M = { [id(7)]: [160, 30], [id(18)]: [194, 30], [id(3)]: [50, 104], [id(8)]: [138, 104], [id(10)]: [172, 104], [id(11)]: [206, 104], [id(22)]: [272, 104], [id(26)]: [306, 104] };
    const NIL = { [id(3) + 'L']: 36, [id(3) + 'R']: 64, [id(8) + 'L']: 124, [id(8) + 'R']: 150, [id(11) + 'L']: 194, [id(11) + 'R']: 220, [id(22) + 'L']: 258, [id(26) + 'L']: 296, [id(26) + 'R']: 322 };
    Object.entries(NIL).forEach(([k, x]) => { M[k] = [x, 170]; });
    const under18 = [10, 8, 11, 22, 26].map(id), lift = k => under18.includes(k) || L.nils.some(v => v.id === k && under18.includes(v.pid));
    const P1 = Object.fromEntries(Object.entries(RB).map(([k, [x, y]]) => [k, k === id(18) ? [RB[id(7)][0] + 34, RB[id(7)][1]] : lift(k) ? [x, y - LV] : [x, y]]));
    const steps = [
      { en: '<b>Intuition</b> for the theorem h ≤ 2 lg(n + 1): start from the example red-black tree (n = 8 keys, height h = 4).', P: RB, m: [] },
      { en: '<b>Merge red nodes into their black parents</b>: the red 18 moves up into its black parent 7, and its subtrees move up with it.', P: P1, m: [18] },
      { en: 'Then the red 8 and 11 merge into their black parent 10, and the red 26 into 22.', P: M, m: [18, 8, 11, 26] },
      { en: 'This produces a <b>2-3-4 tree</b>: each node has 2, 3 or 4 children ({3}: 2, {22, 26}: 3, {8, 10, 11}: 4, {7, 18}: 3), and all leaves have the <b>same depth h′</b> = bh(root) = 2.', P: M, m: [18, 8, 11, 26], box: 1, eq: 0 },
      { en: '<b>h′ ≥ h/2</b>, since at most half the nodes on any root-to-leaf path are red (property 3: no two reds in a row). Here h′ = 2 ≥ 4/2.', P: M, m: [18, 8, 11, 26], box: 1, eq: 1 },
      { en: 'The number of leaves in each tree is <b>n + 1</b> = 9, and a 2-3-4 tree of uniform depth h′ has at least 2<sup>h′</sup> leaves (every node has ≥ 2 children): <b>n + 1 ≥ 2<sup>h′</sup></b>, here 9 ≥ 4.', P: M, m: [18, 8, 11, 26], box: 1, eq: 2 },
      { en: 'Take lg: <b>lg(n + 1) ≥ h′ ≥ h/2 ⇒ h ≤ 2 lg(n + 1)</b>. Here 4 ≤ 2 lg 9 ≈ 6.3. So every red-black tree has height O(lg n).', P: M, m: [18, 8, 11, 26], box: 1, eq: 3 }
    ];
    const [i, ctl] = useSteps(steps.length, 2900), st = steps[i], P = st.P, merged = st.m.map(id);
    const edges = [...L.edges, ...L.nils.map(v => [v.pid, v.id])];
    const R = 15, line = (a, b) => { const [x1, y1] = P[a], [x2, y2] = P[b], d = `M${x1} ${y1} L${x2} ${y2}`; return d; };
    const boxes = [[143, 13, 68, 34], [33, 87, 34, 34], [121, 87, 102, 34], [255, 87, 68, 34]];
    const eq = ['h′ ≥ h/2', 'n + 1 ≥ 2<sup>h′</sup>', '⇒ lg(n + 1) ≥ h′ ≥ h/2', '⇒ h ≤ 2 lg(n + 1)'];
    return html`<figure className="fig"><div className="fig-stage">
      <svg className="a9-tree a9-tree" viewBox=${`0 0 ${W} 236`} role="img" aria-label="Red nodes merged into their black parents give a 2-3-4 tree">
        ${boxes.map((b, k) => html`<rect key=${k} className="a9-box" x=${b[0]} y=${b[1]} width=${b[2]} height=${b[3]} rx="17" style=${{ opacity: st.box ? 1 : 0 }} />`)}
        ${edges.map(([a, b]) => { const d = line(a, b), inner = merged.includes(b); return html`<path key=${'e' + b} d=${d} style=${{ d: `path("${d}")`, transition: DMOVE + ', opacity .5s', opacity: inner ? 0 : 1 }} stroke="var(--graphite)" strokeWidth="2" fill="none" />`; })}
        ${L.nils.map(v => html`<rect key=${v.id} x="-5" y="-5" width="10" height="10" fill=${RBK} stroke="var(--ink)" strokeWidth="1" style=${{ transform: `translate(${P[v.id][0]}px,${P[v.id][1]}px)`, transition: MOVE }} />`)}
        ${L.items.map(o => html`<g key=${o.id} style=${{ transform: `translate(${P[o.id][0]}px,${P[o.id][1]}px)`, transition: MOVE }}>
          <circle r=${R} fill=${nodeFill(o.c)} stroke="var(--ink)" strokeWidth="1.2" /><text textAnchor="middle" dy=".35em" fontSize="17.5" fontWeight="700" style=${{ fill: "#fff" }}>${o.label}</text></g>`)}
        <g className=${pop(!st.box)}><path d="M346 26 V222" stroke="var(--fig-k)" strokeWidth="2" /><path d="M340 32 L346 22 L352 32 M340 216 L346 226 L352 216" stroke="var(--fig-k)" strokeWidth="2" fill="none" /><text x="358" y="128" fontSize="17" fontWeight="700" textAnchor="middle" style=${{ fill: 'var(--fig-k)' }}>h</text></g>
        <g className=${pop(st.box)}><path d="M346 30 V170" stroke="var(--fig-k)" strokeWidth="2" /><path d="M340 36 L346 26 L352 36 M340 164 L346 174 L352 164" stroke="var(--fig-k)" strokeWidth="2" fill="none" /><text x="358" y="104" fontSize="17" fontWeight="700" textAnchor="middle" style=${{ fill: 'var(--fig-k)' }}>h′</text></g>
      </svg>
      ${st.eq != null ? html`<div className="a9-eq">${eq.map((e, k) => html`<div key=${k} className=${k > st.eq ? 'off' : k === st.eq ? 'on' : ''} dangerouslySetInnerHTML=${{ __html: e }}></div>`)}</div>` : null}</div>
      <${Cap} en=${st.en} /><${SBar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  // slide 9.18: RIGHT-ROTATE(B) and LEFT-ROTATE(A)
  const RL = { id: 'B', label: 'B', c: 'N', L: { id: 'A', label: 'A', c: 'N', L: { id: 'al', tri: 'α' }, R: { id: 'be', tri: 'β' } }, R: { id: 'ga', tri: 'γ' } };
  const RR = { id: 'A', label: 'A', c: 'N', L: { id: 'al', tri: 'α' }, R: { id: 'B', label: 'B', c: 'N', L: { id: 'be', tri: 'β' }, R: { id: 'ga', tri: 'γ' } } };
  function Rotate() {
    const steps = [
      { en: 'B with its left child A; α, β, γ are whole subtrees. Keys in α are ≤ A, keys in β lie between A and B, keys in γ are ≥ B.', s: RL, tags: {} },
      { en: '<b>RIGHT-ROTATE(B)</b>: A moves up, B becomes A\'s right child, and β moves over from A\'s right to B\'s left. Only a constant number of pointers change: <b>O(1)</b> time.', s: RR, tags: { be: '' } },
      { en: '<b>LEFT-ROTATE(A)</b> is the inverse: it puts B back on top. Read either tree left to right: α A β B γ, so <b>a ≤ A ≤ b ≤ B ≤ c</b> for a ∈ α, b ∈ β, c ∈ γ in both. Rotations keep the inorder order of keys.', s: RL, tags: { be: '' } }
    ];
    const [i, ctl] = useSteps(steps.length, 2600), st = steps[i];
    return html`<figure className="fig"><div className="fig-stage">
      <${Tree} s=${st.s} tags=${st.tags} min=${5} label="Rotation between B over A and A over B with subtrees alpha, beta, gamma" />
      <p className="a9-eq">inorder: α ≤ A ≤ β ≤ B ≤ γ (unchanged)</p></div>
      <${Cap} en=${st.en} /><${SBar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  // slides 9.19-9.23: insert x = 15 into the example tree
  function Insert15() {
    const steps = useMemo(() => { const t = build(EX); return [{ t, en: 'IDEA: insert x in the tree and colour it red; only property 3 can break. Move the violation up by recolouring until rotations and recolouring fix it. Example tree from the slides.', tags: {} }, ...insTrace(t, 15)]; }, []);
    const [i, ctl] = useSteps(steps.length, 2700), st = steps[i];
    return html`<figure className="fig"><div className="fig-stage">
      <${Tree} s=${toS(st.t)} tags=${st.tags} min=${9} label="Inserting 15 into the example red-black tree" /></div>
      <${Cap} en=${st.en} /><${SBar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  // slides 9.24-9.29: the pseudocode and the pictures of Cases 1, 2 and 3
  const PSEUDO = ['RB-INSERT(T, x)', ' TREE-INSERT(T, x)', ' color[x] ← RED  ⊳ only RB property 3 can be violated', ' while x ≠ root[T] and color[p[x]] = RED', '  do if p[x] = left[p[p[x]]]', '   then y ← right[p[p[x]]]  ⊳ y = aunt/uncle of x', '    if color[y] = RED', '     then 〈Case 1〉', '     else if x = right[p[x]]', '      then 〈Case 2〉  ⊳ Case 2 falls into Case 3', '     〈Case 3〉', '   else 〈"then" clause with "left" and "right" swapped〉', ' color[root[T]] ← BLACK'];
  const tri = id => ({ id, tri: true });
  const N = (id, label, c, L, R) => ({ id, label, c, L, R });
  const C1a = N('1C', 'C', 'B', N('1A', 'A', 'R', tri('1t1'), N('1B', 'B', 'R', tri('1t2'), tri('1t3'))), N('1D', 'D', 'R', tri('1t4'), tri('1t5')));
  const C1b = N('1C', 'C', 'R', N('1A', 'A', 'B', tri('1t1'), N('1B', 'B', 'R', tri('1t2'), tri('1t3'))), N('1D', 'D', 'B', tri('1t4'), tri('1t5')));
  const C2a = N('2C', 'C', 'B', N('2A', 'A', 'R', tri('2t1'), N('2B', 'B', 'R', tri('2t2'), tri('2t3'))), tri('2t4'));
  const C2b = N('2C', 'C', 'B', N('2B', 'B', 'R', N('2A', 'A', 'R', tri('2t1'), tri('2t2')), tri('2t3')), tri('2t4'));
  const C3b = N('2B', 'B', 'B', N('2A', 'A', 'R', tri('2t1'), tri('2t2')), N('2C', 'C', 'R', tri('2t3'), tri('2t4')));
  function Cases() {
    const steps = [
      { en: '<b>Graphical notation</b>: a triangle denotes a subtree with a <b>black root</b>, and all the triangles have the <b>same black-height</b>. The loop runs while x\'s parent is red.', s: C1a, tags: {}, on: [3, 4, 5] },
      { en: '<b>Case 1</b>: x = B and its parent A are red, and the uncle y = D is <b>red</b>. (Or the children of A are swapped: same action.)', s: C1a, tags: { '1B': 'x', '1D': 'y' }, on: [6, 7] },
      { en: '<b>Case 1, recolour</b>: push C\'s black onto A and D (A, D black, C red). Black-heights stay the same; recurse with <b>new x = C</b>, since C\'s parent may be red.', s: C1b, tags: { '1C': 'new x' }, on: [7] },
      { en: '<b>Case 2</b>: the uncle y is <b>black</b> (a black-rooted subtree) and x = B is a <b>right</b> child of A: A, B, C form a zig-zag.', s: C2a, tags: { '2B': 'x', '2t4': 'y' }, on: [8, 9] },
      { en: '<b>Case 2</b>: LEFT-ROTATE(A). Now x = A is a left child and A, B, C lie on a straight line: <b>transform to Case 3</b>.', s: C2b, tags: { '2A': 'x', '2t4': 'y' }, on: [9] },
      { en: '<b>Case 3</b>: the uncle y is black and x = A is a <b>left</b> child of B, which is a left child of C.', s: C2b, tags: { '2A': 'x', '2t4': 'y' }, on: [10] },
      { en: '<b>Case 3</b>: RIGHT-ROTATE(C) and recolour (B black, C red). <b>Done!</b> No more violations of RB property 3 are possible.', s: C3b, tags: {}, on: [10] },
      { en: '<b>Analysis</b>: go up the tree performing Case 1, which only recolours nodes (O(1) each, at most O(lg n) levels). If Case 2 or Case 3 occurs, perform 1 or 2 rotations and terminate. Running time <b>O(lg n) with O(1) rotations</b>. RB-DELETE has the same asymptotic running time and number of rotations (see the textbook).', s: C3b, tags: {}, on: [12] }
    ];
    const [i, ctl] = useSteps(steps.length, 3000), st = steps[i];
    return html`<figure className="fig"><div className="fig-stage">
      <${Tree} s=${st.s} tags=${st.tags} min=${7} label="Insertion case picture with nodes A, B, C, D and black-rooted subtrees" />
      <${Code} lines=${PSEUDO} on=${st.on} /></div>
      <${Cap} en=${st.en} /><${SBar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  window.FIGS = Object.assign(window.FIGS || {}, { 'ag-9-props': Props, 'ag-9-merge': Merge, 'ag-9-rotate': Rotate, 'ag-9-insert15': Insert15, 'ag-9-cases': Cases });
})();
/* ── part L10 ── */
// Algorithms visuals, Lecture 10 (Red-black trees: colouring, the insertion problem, rotations, insert cases): black-height review (3-6), colour this tree (8), the problem with inserting 8, 11, 10 (9-19), rightRotate pointers (20-21), rotate left about 9 (22-23), rbInsert Cases 1-6 (25-31). Every label and number comes from the slides.
(function () {
  const { useState, useEffect, useRef, useMemo } = React;
  const { html, useSteps, Cap, Bar, pop, calm, useClock, useFit, sec } = window.FIGKIT;
  // ── shared red-black engine: insert / delete with one snapshot per step (follows the slides' rbInsert and rbDelete + rbTreeFix code) ──
  const RBK = '#1f2328', RRD = '#d23c3c', MOVE = calm() ? 'none' : 'transform .6s ease, opacity .4s ease', DMOVE = calm() ? 'none' : 'd .6s ease';
  let UID = 0;
  const T0 = () => ({ root: null, n: {} });
  const cl = t => ({ root: t.root, n: Object.fromEntries(Object.entries(t.n).map(([k, v]) => [k, { ...v }])) });
  // nested spec [key, 'R'|'B', left, right]
  function build(spec) {
    const t = T0();
    const mk = (s, p) => { if (!s) return null; const id = 'n' + (++UID); t.n[id] = { k: s[0], c: s[1], p, l: null, r: null }; t.n[id].l = mk(s[2], id); t.n[id].r = mk(s[3], id); return id; };
    t.root = mk(spec, null); return t;
  }
  const col = (t, id) => id ? t.n[id].c : 'B';
  const keyOf = (t, id) => id ? (t.n[id].pre ? 'NIL' : t.n[id].k) : 'NIL';
  const findK = (t, k) => { let x = t.root; while (x && t.n[x].k !== k) x = k < t.n[x].k ? t.n[x].l : t.n[x].r; return x; };
  const keysOf = t => { const o = []; const f = id => { if (!id) return; f(t.n[id].l); if (!t.n[id].pre) o.push(t.n[id].k); f(t.n[id].r); }; f(t.root); return o; };
  function rotL(t, x) { const n = t.n, X = n[x], y = X.r, Y = n[y]; X.r = Y.l; if (Y.l) n[Y.l].p = x; Y.p = X.p; if (!X.p) t.root = y; else if (n[X.p].l === x) n[X.p].l = y; else n[X.p].r = y; Y.l = x; X.p = y; }
  function rotR(t, y) { const n = t.n, Y = n[y], x = Y.l, X = n[x]; Y.l = X.r; if (X.r) n[X.r].p = y; X.p = Y.p; if (!Y.p) t.root = x; else if (n[Y.p].l === y) n[Y.p].l = x; else n[Y.p].r = x; X.r = y; Y.p = x; }
  // RB-INSERT: returns steps [{ t, en, tags, cas }]; o.six names the mirror cases 4-6 (Lecture 10), otherwise "Case k (mirror)"
  function insTrace(t0, key, o = {}) {
    const t = cl(t0), n = t.n, S = [], K = id => n[id].k;
    const snap = (en, tags = {}, cas = 0) => S.push({ t: cl(t), en, tags, cas });
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
      const tags = { [x]: 'x', [p]: 'p' }; if (u) tags[u] = 'y';
      const cn = c => (o.six && !left ? c + 3 : c), mir = !left && !o.six ? ' (mirror: p[x] is a right child)' : '';
      const two = `x = ${K(x)} and its parent ${K(p)} are both red (property 3 broken).`;
      if (col(t, u) === 'R') {
        snap(`${two} The uncle y = ${un} is <b>red</b>: <b>Case ${cn(1)}</b>${mir}.`, tags, cn(1));
        n[p].c = 'B'; n[u].c = 'B'; n[g].c = 'R';
        snap(`<b>Case ${cn(1)}</b>: colour p[x] = ${K(p)} and y = ${un} <b>black</b> and the grandparent ${K(g)} <b>red</b>; then x ← p[p[x]] = ${K(g)}. No black-height changes.`, { [g]: 'new x' }, cn(1));
        x = g;
      } else {
        const zig = left ? x === n[p].r : x === n[p].l;
        if (zig) {
          snap(`${two} The uncle y = ${un} is <b>black</b> and x is a ${left ? 'right' : 'left'} child while p[x] is a ${left ? 'left' : 'right'} child (a zig-zag): <b>Case ${cn(2)}</b>${mir}.`, tags, cn(2));
          x = p; left ? rotL(t, x) : rotR(t, x);
          snap(`<b>Case ${cn(2)}</b>: x ← p[x] = ${K(x)}, then ${left ? 'LEFT' : 'RIGHT'}-ROTATE(${K(x)}). Now x, p[x] and p[p[x]] lie on a straight line, which is Case ${cn(3)}.`, { [x]: 'x', [n[x].p]: 'p' }, cn(2));
        } else snap(`${two} The uncle y = ${un} is <b>black</b> and x is a ${left ? 'left' : 'right'} child like p[x] (a straight line): <b>Case ${cn(3)}</b>${mir}.`, tags, cn(3));
        const p2 = n[x].p, g2 = n[p2].p;
        n[p2].c = 'B'; n[g2].c = 'R';
        snap(`<b>Case ${cn(3)}</b>: colour p[x] = ${K(p2)} <b>black</b> and p[p[x]] = ${K(g2)} <b>red</b>.`, { [x]: 'x', [p2]: 'p' }, cn(3));
        left ? rotR(t, g2) : rotL(t, g2);
        snap(`<b>Case ${cn(3)}</b>: ${left ? 'RIGHT' : 'LEFT'}-ROTATE(${K(g2)}). Now ${K(p2)} is black with red children ${K(x)} and ${K(g2)}: no red node has a red parent, so the loop stops.`, { [p2]: '' }, cn(3));
      }
    }
    const last = S[S.length - 1];
    if (n[t.root].c === 'R') { n[t.root].c = 'B'; snap(`color[root[T]] ← BLACK: the root ${K(t.root)} is coloured black (property 2). Done.`, {}, 0); }
    else if (!fixed) last.en += ` Its parent ${K(n[id].p)} is black, so nothing is violated. Done.`;
    else if (last.cas === 1 || last.cas === 4) last.en += ` The new x = ${K(x)} has a black parent, so the loop stops. Done.`;
    else last.en += ' Done.';
    return S;
  }
  // RB-DELETE as on the slides: two children → copy the predecessor's data, remove node y, its child x (or a black pretend NIL) takes its place, rbTreeFix(x) if y was black
  function delTrace(t0, key) {
    const t = cl(t0), n = t.n, S = [], K = id => keyOf(t, id);
    const snap = (en, tags = {}, tok = null, cas = '') => S.push({ t: cl(t), en, tags, tok, cas });
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
  // tree → drawing structure; nil adds the NIL leaves as small black squares
  function toS(t, nil) {
    const f = id => { const v = t.n[id]; if (v.pre) return { id, pre: 1 }; return { id, label: v.k, c: v.c, L: v.l ? f(v.l) : nil ? { nil: 1, side: -1, id: id + 'L' } : null, R: v.r ? f(v.r) : nil ? { nil: 1, side: 1, id: id + 'R' } : null }; };
    return t.root ? f(t.root) : null;
  }
  function lay(s) {
    const items = [], edges = [], nils = []; let slot = 0, dmax = 0;
    const walk = (v, d, pid) => {
      if (!v) return;
      if (v.nil) { nils.push({ ...v, pid, d }); return; }
      dmax = Math.max(dmax, d);
      if (v.tri || v.pre) { items.push({ ...v, sx: slot++, d }); if (pid) edges.push([pid, v.id]); return; }
      walk(v.L, d + 1, v.id); items.push({ ...v, sx: slot++, d }); walk(v.R, d + 1, v.id); if (pid) edges.push([pid, v.id]);
    };
    walk(s, 0, null);
    return { items, edges, nils, slots: slot, dmax };
  }
  const nodeFill = c => c === 'R' ? RRD : c === 'B' ? RBK : 'var(--paper)';
  // the drawing: nodes keep their place on screen between steps (keyed by id), so rotations and recolourings animate
  function Tree({ s, tags = {}, tok = null, nil = false, min = 7, label = 'Red-black tree', marks = {}, onTap = null }) {
    const L = s ? lay(s) : { items: [], edges: [], nils: [], slots: 0, dmax: 0 };
    const SL = 36, LV = 54, slots = Math.max(min, L.slots), W = slots * SL + 60, sc = 268 / W;
    const fs = Math.max(16, 12.4 / sc), tf = Math.max(14, 12.2 / sc), R = Math.max(15, fs * .86);
    const H = (L.dmax + 1) * LV + (nil ? 26 : 2) + 16, ox = 14 + (slots - L.slots) * SL / 2 + SL / 2, P = {};
    L.items.forEach(o => { P[o.id] = [ox + o.sx * SL, 26 + o.d * LV]; });
    const it = Object.fromEntries(L.items.map(o => [o.id, o]));
    const tip = id => { const o = it[id], [x, y] = P[id]; return o.tri ? [x, y - 14] : o.pre ? [x, y - 7] : [x, y]; };
    const eds = L.edges.map(([a, b]) => { const [x1, y1] = P[a], [x2, y2] = tip(b); const d = `M${x1} ${y1} L${x2} ${y2}`; return html`<path key=${'e' + b} d=${d} style=${{ d: `path("${d}")`, transition: DMOVE }} stroke="var(--graphite)" strokeWidth="2" fill="none" />`; });
    const nl = nil ? L.nils.map(v => { const [x, y] = P[v.pid], nx = x + v.side * 12, ny = y + 34; return html`<g key=${v.id}><path d=${`M${x} ${y} L${nx} ${ny}`} stroke="var(--graphite)" strokeWidth="1.6" /><rect x=${nx - 5} y=${ny - 5} width="10" height="10" fill=${RBK} stroke="var(--ink)" strokeWidth="1" /></g>`; }) : null;
    const nodes = L.items.map(o => {
      const [x, y] = P[o.id], tg = tags[o.id], mk = marks[o.id];
      let body;
      if (o.tri) body = html`<path d="M0 -14 L17 22 L-17 22 Z" fill="color-mix(in srgb, var(--fig-k) 20%, var(--paper))" stroke="var(--fig-k)" strokeWidth="1.6" /><text y="16" textAnchor="middle" fontSize=${tf}>${o.tri === true ? '' : o.tri}</text>${o.b ? html`<circle cy="-14" r="4.5" fill=${RBK} stroke="var(--ink)" strokeWidth="1" />` : null}`;
      else if (o.pre) body = html`<circle r="7" fill=${RBK} stroke="var(--ink)" strokeWidth="1.2" />`;
      else body = html`<circle r=${R} fill=${nodeFill(o.c)} stroke=${o.c === '?' ? 'var(--fig-k)' : o.c === 'A' ? 'var(--graphite)' : o.c === 'N' ? 'var(--ink)' : 'var(--ink)'} strokeWidth=${o.c === 'R' || o.c === 'B' ? 1.2 : 2} strokeDasharray=${o.c === '?' || o.c === 'A' ? '4 3' : null} style=${{ transition: calm() ? 'none' : 'fill .5s' }} />
        <text textAnchor="middle" dy=".35em" fontSize=${fs} fontWeight="700" style=${{ fill: o.c === 'R' || o.c === 'B' ? '#fff' : 'var(--ink)' }}>${o.label}</text>`;
      const tap = onTap && !o.tri && !o.pre ? { onClick: () => onTap(o.id), onKeyDown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTap(o.id); } }, tabIndex: 0, role: 'button', 'aria-label': 'node ' + o.label } : {};
      return html`<g key=${o.id} ...${tap} style=${{ transform: `translate(${x}px,${y}px)`, transition: MOVE, cursor: onTap && !o.tri ? 'pointer' : null }}>
        ${tg != null && !o.tri ? html`<circle r=${(o.pre ? 7 : R) + 5} fill="none" stroke="var(--fig-k)" strokeWidth="3" />` : null}
        ${body}
        ${tg ? html`<text x=${(o.pre ? 9 : R) + 3} y=${-R + 3} fontSize=${tf} fontWeight="700" style=${{ fill: 'var(--fig-k)' }}>${tg}</text>` : null}
        ${mk ? html`<text x=${(o.pre ? 9 : R) + 3} y=${R + 4} fontSize=${tf} fontWeight="700" style=${{ fill: mk[1] || 'var(--pen)' }}>${mk[0]}</text>` : null}
        ${tok === o.id ? html`<rect x=${-(o.pre ? 7 : R) - 15} y=${-R + 1} width="10" height="10" fill="var(--ink)" />` : null}
      </g>`;
    });
    return html`<svg className="a10-tree" viewBox=${`0 0 ${W} ${Math.max(H, 80)}`} role="img" aria-label=${label}>${eds}${nl}${nodes}</svg>`;
  }
  // a code listing with the lines of the current step highlighted
  const Code = ({ lines, on = [] }) => html`<pre className="a10-code" aria-label="Pseudocode">${lines.map((l, k) => { const ind = l.length - l.trimStart().length; return html`<span key=${k} className=${on.includes(k) ? 'on' : ''} style=${{ paddingLeft: (ind * .5 + 1.6) + 'em', textIndent: '-1.2em' }}>${l.trimStart()}</span>`; })}</pre>`;
  const Tabs = ({ opts, v, set }) => html`<div className="a10-tabs" role="group">${opts.map(([k, t]) => html`<button key=${k} className="fig-btn" aria-pressed=${String(v === k)} onClick=${() => set(k)}>${t}</button>`)}</div>`;
  const CORE_CSS = `
.a10-of{ font-size:.85rem; color:var(--graphite); }
.a10-tree{ display:block; width:100%; height:auto; max-width:520px; margin:0 auto; }
.a10-code{ font:12px/1.45 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; background:var(--paper); color:var(--ink); border:1px solid var(--line); border-radius:8px; padding:8px 6px; margin:10px auto 0; max-width:520px; white-space:pre-wrap; overflow-wrap:anywhere; text-align:left; }
.a10-code span{ display:block; padding:0 4px; border-radius:4px; }
.a10-code span.on{ background:color-mix(in srgb, var(--fig-k) 24%, transparent); font-weight:700; }
.a10-tabs{ display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin:0 0 10px; }
.a10-tabs .fig-btn[aria-pressed="true"]{ background:var(--fig-s); color:#fff; border-color:transparent; }
.a10-eq{ text-align:center; font-size:.95rem; line-height:1.6; margin:8px 0 0; color:var(--ink); }
.a10-eq div{ transition:opacity .5s; } .a10-eq .off{ opacity:.15; } .a10-eq .on{ font-weight:700; }
.a10-leg{ display:flex; flex-wrap:wrap; gap:6px 14px; justify-content:center; font-size:.85rem; color:var(--graphite); margin-top:6px; }
.a10-leg i{ display:inline-block; width:12px; height:12px; border-radius:50%; vertical-align:-1px; margin-right:4px; }
.a10-in{ display:flex; flex-wrap:wrap; gap:6px; align-items:center; justify-content:center; margin:0 0 10px; font-size:.9rem; }
.a10-in input{ font:inherit; min-width:0; flex:1 1 150px; max-width:260px; padding:6px 8px; border:1px solid var(--line); border-radius:8px; background:var(--paper); color:var(--ink); }
.a10-err{ color:var(--pen); font-size:.88rem; text-align:center; margin:0 0 8px; }
.a10-chips{ display:flex; flex-wrap:wrap; gap:4px; justify-content:center; margin:0 0 8px; }
.a10-chips span{ font-size:.85rem; padding:2px 8px; border-radius:99px; border:1px solid var(--line); color:var(--graphite); }
.a10-chips span.cur{ background:var(--fig-s); color:#fff; border-color:transparent; } .a10-chips span.done{ color:var(--ink); border-color:var(--fig-k); }
`;
  // Back / Next / Replay; long traces show "step i of n" instead of a row of dots that would not fit a phone
  const SBar = ({ steps, i, ctl }) => steps.length <= 11 ? html`<${Bar} steps=${steps} i=${i} ctl=${ctl} />` : html`<div className="fig-bar">
    <span className="a10-of">step ${i + 1} of ${steps.length}</span><span className="grow"></span>
    <button className="fig-btn" onClick=${() => ctl.go(Math.max(0, i - 1))} disabled=${i === 0} aria-label="Previous step">‹ Back</button>
    <button className="fig-btn" onClick=${() => ctl.go(Math.min(steps.length - 1, i + 1))} disabled=${i === steps.length - 1} aria-label="Next step">Next ›</button>
    <button className="fig-btn" onClick=${ctl.replay}>↻ Replay</button></div>`;
  const CSS = CORE_CSS + `
.a10-chk{ list-style:none; padding:0; margin:10px auto 0; max-width:420px; font-size:.9rem; line-height:1.45; }
.a10-chk li{ display:flex; gap:8px; align-items:baseline; padding:2px 0; }
.a10-chk .a10-m{ flex:0 0 1.4em; text-align:center; font-weight:700; } .a10-chk .a10-y{ color:var(--ok); } .a10-chk .a10-n{ color:var(--pen); } .a10-chk .a10-w{ color:var(--graphite); }
.a10-paths div{ margin:1px 0; }
.a10-paths{ text-align:center; font-size:.88rem; color:var(--graphite); margin:4px 0 0; }
.a10-ptr{ display:block; width:100%; height:auto; max-width:440px; margin:0 auto; }
`;
  if (!document.getElementById('a10-css')) { const s = document.createElement('style'); s.id = 'a10-css'; s.textContent = CSS; document.head.appendChild(s); }
  const EX = [7, 'B', [3, 'B'], [18, 'R', [10, 'B', [8, 'R'], [11, 'R']], [22, 'B', null, [26, 'R']]]];
  const bhOf = (t, id) => { let b = 0; for (let x = t.n[id].l; ; x = t.n[x].l) { if (!x) return b + 1; if (t.n[x].c === 'B') b++; } };
  const sizeOf = (t, id) => id ? 1 + sizeOf(t, t.n[id].l) + sizeOf(t, t.n[id].r) : 0;
  // put a key in as a plain BST leaf with a given colour (no fixing): used to show the slides' "what colour?" attempts
  const leaf = (t0, k, c) => { const t = cl(t0); let y = null, x = t.root; while (x) { y = x; x = k < t.n[x].k ? t.n[x].l : t.n[x].r; } const id = 'n' + (++UID); t.n[id] = { k, c, p: y, l: null, r: null }; if (k < t.n[y].k) t.n[y].l = id; else t.n[y].r = id; return t; };
  const recol = (t0, m) => { const t = cl(t0); for (const [k, c] of Object.entries(m)) t.n[findK(t, +k)].c = c; return t; };

  // slides 10.3-10.7: black-height and the proof of h ≤ 2 lg(n + 1)
  function BlackHeight() {
    const t = useMemo(() => build(EX), []), id = k => findK(t, k), s = useMemo(() => toS(t, true), [t]);
    const bhAll = Object.fromEntries(Object.keys(t.n).map(k => [k, ['bh=' + bhOf(t, k), 'var(--fig-k)']]));
    const eq = ['bh(x) = number of black nodes on a path from x down to a leaf (x not counted, the NIL leaf counted)', 'a node of height h has bh ≥ h/2', 'subtree of x has ≥ 2<sup>bh(x)</sup> − 1 internal nodes', 'n ≥ 2<sup>bh(root)</sup> − 1', 'n ≥ 2<sup>h/2</sup> − 1', 'lg(n + 1) ≥ h/2', 'h ≤ 2 lg(n + 1), so h = O(lg n)'];
    const steps = [
      { en: 'Review: a red-black tree is a BST with a colour per node and 5 properties: (1) every node is red or black, (2) every leaf (NULL pointer) is black, so every real node has 2 children, (3) a red node has two black children, (4) every path from a node to a descendant leaf has the same number of black nodes, (5) the root is black.', marks: {}, eq: -1 },
      { en: '<b>Black-height</b> bh(x): the number of black nodes on a path from x to a leaf. Property 4 makes it the same on every path. Here every node is labelled with its bh.', marks: bhAll, eq: 0 },
      { en: 'Minimum black-height of a node of height h? Property 3 allows no two reds in a row, so at least half the nodes on a path are black: <b>bh ≥ h/2</b>. The root 7 has h = 4 and bh = 2.', marks: { [id(7)]: ['h=4, bh=2', 'var(--fig-k)'] }, eq: 1 },
      { en: 'By induction on the height: the subtree of x has <b>≥ 2<sup>bh(x)</sup> − 1</b> internal nodes. Base: a leaf has bh = 0 and 2<sup>0</sup> − 1 = 0. Step: each child has bh ≥ bh(x) − 1, so x\'s subtree has ≥ 2(2<sup>bh(x)−1</sup> − 1) + 1 = 2<sup>bh(x)</sup> − 1. For 18: bh = 2, so ≥ 3, and it has ' + sizeOf(t, id(18)) + '.', marks: { [id(18)]: ['bh=2: ' + sizeOf(t, id(18)) + ' ≥ 3', 'var(--fig-k)'] }, eq: 2 },
      { en: 'Thus at the root: n ≥ 2<sup>bh(root)</sup> − 1 ≥ 2<sup>h/2</sup> − 1, so lg(n + 1) ≥ h/2 and <b>h ≤ 2 lg(n + 1)</b>. Here n = 8: 8 ≥ 2<sup>2</sup> − 1 = 3, and h = 4 ≤ 2 lg 9 ≈ 6.3.', marks: { [id(7)]: ['n=8', 'var(--fig-k)'] }, eq: 6 },
      { en: '<b>Corollary</b>: Minimum(), Maximum(), Successor(), Predecessor() and Search() take O(lg n) time, since each walks one path. Insert() and Delete() also take O(lg n), but need special care since they modify the tree.', marks: {}, eq: 6 }
    ];
    const [i, ctl] = useSteps(steps.length, 3200), st = steps[i];
    return html`<figure className="fig"><div className="fig-stage">
      <${Tree} s=${s} nil=${true} marks=${st.marks} min=${8} label="Example red-black tree with black-heights" />
      ${st.eq >= 0 ? html`<div className="a10-eq">${eq.map((e, k) => k > st.eq ? null : html`<div key=${k} className=${k === st.eq ? 'on' : ''} dangerouslySetInnerHTML=${{ __html: e }}></div>`)}</div>` : null}</div>
      <${Cap} en=${st.en} /><${SBar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  // slide 10.8: colour this tree (tap the nodes)
  const C8 = [7, '?', [5, '?'], [9, '?', null, [12, '?']]];
  function ColorIt() {
    const base = useMemo(() => build(C8), []), K = useMemo(() => Object.fromEntries(Object.keys(base.n).map(id => [base.n[id].k, id])), [base]);
    const [c, setC] = useState({ 7: '?', 5: '?', 9: '?', 12: '?' });
    const t = useMemo(() => { const x = cl(base); for (const k in c) x.n[K[k]].c = c[k]; return x; }, [c]);
    const tap = id => { const k = t.n[id].k; setC(o => ({ ...o, [k]: o[k] === 'B' ? 'R' : 'B' })); };
    const all = Object.values(c).every(v => v !== '?');
    const red3 = Object.values(t.n).every(v => v.c !== 'R' || ((!v.l || t.n[v.l].c !== 'R') && (!v.r || t.n[v.r].c !== 'R')));
    const paths = [['7 → 5 → NIL', [7, 5]], ['7 → 9 → NIL', [7, 9]], ['7 → 9 → 12 → NIL', [7, 9, 12]]].map(([s, ks]) => [s, ks.filter(k => c[k] === 'B').length + 1]);
    const okAt = id => { const f = x => { if (!x) return 1; const v = t.n[x], a = f(v.l), b = f(v.r); return a < 0 || b < 0 || a !== b ? -1 : a + (v.c === 'B' ? 1 : 0); }; return f(id) >= 0; };
    const p4 = okAt(t.root);
    const row = (ok, txt) => html`<li><span className=${'a10-m ' + (!all ? 'a10-w' : ok ? 'a10-y' : 'a10-n')}>${!all ? '?' : ok ? '✓' : '✗'}</span><span>${txt}</span></li>`;
    const win = all && red3 && p4 && c[7] === 'B';
    const msg = !all ? '<b>Colour this tree</b> (slide 10.8): tap a node to make it black, tap again for red. The checks under the tree update as you go.'
      : win ? '<b>Correct.</b> 7, 5, 9 black and 12 red: every path from 7 has 3 black nodes counting 7 and the NIL (bh(7) = 2), and red 12 has black (NIL) children. This is the only valid colouring.'
      : 'Not yet: a property is broken (see the ✗). Hint: the path through 12 is one node longer, so one node on it must be red.';
    return html`<figure className="fig"><div className="fig-stage">
      <${Tree} s=${toS(t, true)} nil=${true} onTap=${tap} min=${6} label="Tree with keys 7, 5, 9, 12 to colour; tap a node to change its colour" />
      <ul className="a10-chk">
        ${row(true, '1. Every node is either red or black')}
        ${row(true, '2. Every leaf (NULL pointer) is black')}
        ${row(red3, '3. If a node is red, both children are black')}
        ${row(p4, '4. Every path from a node to a descendant leaf has the same number of black nodes')}
        ${row(c[7] === 'B', '5. The root is always black')}
      </ul>
      <div className="a10-paths"><div>Black nodes on each path (counting 7 and the NIL):</div>${paths.map(([s, n]) => html`<div key=${s}>${s}: <b>${all ? n : '?'}</b></div>`)}</div></div>
      <${Cap} en=${msg} />
      <div className="fig-bar"><button className="fig-btn solid" onClick=${() => setC({ 7: 'B', 5: 'B', 9: 'B', 12: 'R' })}>Show the answer</button><span className="grow"></span><button className="fig-btn" onClick=${() => setC({ 7: '?', 5: '?', 9: '?', 12: '?' })}>↻ Clear</button></div></figure>`;
  }

  // slides 10.9-10.19: the problem with insertion: 8, then 11, then 10
  function Problem() {
    const steps = useMemo(() => {
      const t0 = build([7, 'B', [5, 'B'], [9, 'B', null, [12, 'R']]]), mk = (t, k) => findK(t, k);
      const a8 = leaf(t0, 8, '?'), r8 = recol(a8, { 8: 'R' }), a11 = leaf(r8, 11, '?'), red11 = recol(a11, { 11: 'R' }), blk11 = recol(a11, { 11: 'B' });
      const fix11 = recol(a11, { 11: 'R', 9: 'R', 8: 'B', 12: 'B' }), a10 = leaf(fix11, 10, '?');
      const tr = insTrace(fix11, 10, { six: true }), done = tr[tr.length - 1].t;
      return [
        { t: t0, en: 'Start from the coloured tree of slide 10.8: 7, 5, 9 black and 12 red.' },
        { t: a8, en: '<b>Insert 8</b>. Where does it go? 8 > 7 and 8 < 9: the left child of 9. What colour should it be?', tags: { [mk(a8, 8)]: '?' } },
        { t: r8, en: '<b>Red</b>: its parent 9 is black (no red-red pair) and a red node adds no black to any path, so every property still holds.', tags: { [mk(r8, 8)]: '' } },
        { t: a11, en: '<b>Insert 11</b>. Where does it go? 11 > 7, 11 > 9, 11 < 12: the left child of 12. What colour?', tags: { [mk(a11, 11)]: '?' } },
        { t: red11, en: '<b>Can\'t be red!</b> (#3): its parent 12 is red, and a red node must have black children.', tags: { [mk(red11, 11)]: '' }, marks: { [mk(red11, 11)]: ['✗ #3'], [mk(red11, 12)]: ['red'] } },
        { t: blk11, en: '<b>Can\'t be black!</b> (#4): the path 7 → 9 → 12 → 11 → NIL would have one more black node than 7 → 5 → NIL.', tags: { [mk(blk11, 11)]: '' }, marks: { [mk(blk11, 11)]: ['✗ #4'] } },
        { t: fix11, en: '<b>Solution: recolour the tree</b>. 11 red, its parent 12 and uncle 8 black, the grandparent 9 red. Every path from 7 again has the same number of blacks (this is Case 1 of rbInsert).', tags: { [mk(fix11, 9)]: '', [mk(fix11, 8)]: '', [mk(fix11, 12)]: '' } },
        { t: a10, en: '<b>Insert 10</b>. Where does it go? 10 > 7, 10 > 9, 10 < 12, 10 < 11: the left child of 11. What colour?', tags: { [mk(a10, 10)]: '?' } },
        { t: a10, en: '<b>A: no colour!</b> Red breaks #3 (11 is red), black breaks #4. The tree is too imbalanced: the path to 10 has 5 nodes but the path to 5 only 2. We must change the tree structure to allow recolouring. Goal: restructure the tree in O(lg n) time.', tags: { [mk(a10, 10)]: '?' }, marks: { [mk(a10, 10)]: ['✗ R, ✗ B'] } },
        { t: done, en: 'Preview of what rbInsert does: 10\'s parent 11 is red, the uncle (NIL) is black and 10, 11, 12 lie on a line, so recolour 11 black, 12 red and <b>rightRotate(12)</b>. A <b>rotation</b> fixes it.', tags: {} }
      ];
    }, []);
    const [i, ctl] = useSteps(steps.length, 3000), st = steps[i];
    return html`<figure className="fig"><div className="fig-stage">
      <${Tree} s=${toS(st.t, true)} nil=${true} tags=${st.tags || {}} marks=${st.marks || {}} min=${7} label="Inserting 8, 11 and 10 into the tree 7, 5, 9, 12" />
      <div className="a10-leg"><span><i style=${{ background: 'var(--paper)', border: '2px dashed var(--fig-k)' }}></i>colour not chosen yet</span></div></div>
      <${Cap} en=${st.en} /><${SBar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  // slides 10.20-10.21: what rightRotate(y) does to the pointers
  const RCODE = ['rightRotate(y)', ' x = y->left;', ' y->left = x->right;', ' if (x->right != NIL) x->right->p = y;', ' x->p = y->p;', ' if (y->p == NIL) root = x;', ' else if (y == y->p->left) y->p->left = x;', ' else y->p->right = x;', ' x->right = y;', ' y->p = x;'];
  function RotPtr() {
    const X = s => 36 + s * 58, Y = d => 30 + d * 58;
    const before = { p: [X(4.3), Y(0)], y: [X(3), Y(1)], x: [X(1), Y(2)], C: [X(4), Y(2)], A: [X(0), Y(3)], B: [X(2), Y(3)] };
    const after = { p: [X(4.3), Y(0)], x: [X(1), Y(1)], A: [X(0), Y(2)], y: [X(3), Y(2)], B: [X(2), Y(3)], C: [X(4), Y(3)] };
    const steps = [
      { en: '<b>rightRotate(y)</b>: x is y\'s left child; A, B, C are subtrees. x keeps its left child A, and y keeps its right child C.', P: before, E: [['p', 'y'], ['y', 'x'], ['y', 'C'], ['x', 'A'], ['x', 'B']], hot: [], on: [0, 1] },
      { en: '<b>x\'s right child becomes y\'s left child</b>: y->left = B, and B\'s parent becomes y.', P: before, E: [['p', 'y'], ['y', 'B'], ['y', 'C'], ['x', 'A']], hot: [['y', 'B']], on: [2, 3], loose: 1 },
      { en: '<b>x\'s parent changes</b>: x takes y\'s place under y\'s old parent p (or x becomes the root).', P: before, E: [['p', 'x'], ['y', 'B'], ['y', 'C'], ['x', 'A']], hot: [['p', 'x']], on: [4, 5, 6, 7] },
      { en: '<b>y\'s parent changes</b>: x->right = y and y->p = x. Now x is on top with children A and y; y has B and C.', P: after, E: [['p', 'x'], ['x', 'A'], ['x', 'y'], ['y', 'B'], ['y', 'C']], hot: [['x', 'y']], on: [8, 9] },
      { en: 'Inorder is still A x B y C, so the key order is preserved. Running time: <b>O(1)</b>, a fixed number of pointer changes whatever the subtree sizes. leftRotate(x) is the mirror image and undoes it.', P: after, E: [['p', 'x'], ['x', 'A'], ['x', 'y'], ['y', 'B'], ['y', 'C']], hot: [], on: [] }
    ];
    const [i, ctl] = useSteps(steps.length, 3200), st = steps[i], P = st.P;
    const isT = k => 'ABC'.includes(k);
    const end = (a, b) => { const [x1, y1] = P[a], [x2, y2] = P[b]; return `M${x1} ${y1 + (a === 'p' ? 12 : 16)} L${x2} ${y2 - (isT(b) ? 14 : 16)}`; };
    return html`<figure className="fig"><div className="fig-stage">
      <svg className="a10-ptr" viewBox="0 0 330 236" role="img" aria-label="Pointer changes of rightRotate(y)">
        ${st.E.map(([a, b]) => { const d = end(a, b), hot = st.hot.some(h => h[0] === a && h[1] === b); return html`<path key=${a + b} d=${d} style=${{ d: `path("${d}")`, transition: DMOVE }} stroke=${hot ? 'var(--fig-k)' : 'var(--graphite)'} strokeWidth=${hot ? 3.5 : 2} fill="none" />`; })}
        ${Object.keys(P).map(k => html`<g key=${k} style=${{ transform: `translate(${P[k][0]}px,${P[k][1]}px)`, transition: MOVE }}>
          ${k === 'p' ? html`<circle r="12" fill="var(--paper)" stroke="var(--graphite)" strokeWidth="2" strokeDasharray="4 3" /><text dy=".35em" textAnchor="middle" fontSize="16">p</text>`
          : isT(k) ? html`<path d="M0 -14 L19 24 L-19 24 Z" fill="color-mix(in srgb, var(--fig-k) 20%, var(--paper))" stroke="var(--fig-k)" strokeWidth="1.6" /><text y="16" textAnchor="middle" fontSize="16">${k}</text>`
          : html`<circle r="16" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2" /><text dy=".35em" textAnchor="middle" fontSize="18" fontWeight="700">${k}</text>`}</g>`)}
      </svg>
      <${Code} lines=${RCODE} on=${st.on} /></div>
      <${Cap} en=${st.en} /><${SBar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  // slides 10.22-10.23: rotate left about 9
  function RotEx() {
    const steps = useMemo(() => { const t = build([7, 'N', [5, 'N'], [9, 'N', [8, 'N'], [12, 'N', [11, 'N']]]]), u = cl(t); rotL(u, findK(u, 9));
      return [{ t, en: '<b>Rotate left about 9</b>: 9 has the right child 12, and 12 has the left child 11.', tags: { [findK(t, 9)]: '9', [findK(t, 12)]: '' } },
        { t: u, en: 'After leftRotate(9): 12 takes 9\'s place under 7, 9 becomes 12\'s left child, and 12\'s old left child 11 becomes 9\'s right child. Inorder is still 5, 7, 8, 9, 11, 12.', tags: { [findK(u, 9)]: '', [findK(u, 12)]: '' } }]; }, []);
    const [i, ctl] = useSteps(steps.length, 2600), st = steps[i];
    return html`<figure className="fig"><div className="fig-stage">
      <${Tree} s=${toS(st.t, true)} nil=${true} tags=${st.tags} min=${7} label="Left rotation about 9" />
      <p className="a10-eq">inorder: 5, 7, 8, 9, 11, 12</p></div>
      <${Cap} en=${st.en} /><${SBar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  // slides 10.25-10.31: rbInsert, Cases 1-3 with their pictures, Cases 4-6 by symmetry
  const ICODE = ['rbInsert(x)', ' treeInsert(x);', ' x->color = RED;', ' // Move violation of #3 up tree, maintaining #4 as invariant:', ' while (x!=root && x->p->color == RED)', '  if (x->p == x->p->p->left)', '   y = x->p->p->right;', '   if (y->color == RED)', '    x->p->color = BLACK;  // Case 1', '    y->color = BLACK;', '    x->p->p->color = RED;', '    x = x->p->p;', '   else  // y->color == BLACK', '    if (x == x->p->right)  // Case 2', '     x = x->p;', '     leftRotate(x);', '    x->p->color = BLACK;  // Case 3', '    x->p->p->color = RED;', '    rightRotate(x->p->p);', '  else  // x->p == x->p->p->right', '   (same as above, but with "right" & "left" exchanged)'];
  const tri = id => ({ id, tri: 'Δ' });
  const N = (id, label, c, L, R) => ({ id, label, c, L, R });
  function InsCases() {
    const steps = [
      { en: '<b>Case 1: the "uncle" is red</b>. In the figures all Δ\'s are subtrees of equal black-height. x = B and its parent A are red; the uncle y = D is red.', s: N('aC', 'C', 'B', N('aA', 'A', 'R', tri('a1'), N('aB', 'B', 'R', tri('a2'), tri('a3'))), N('aD', 'D', 'R', tri('a4'), tri('a5'))), tags: { aB: 'x', aD: 'y' }, on: [6, 7] },
      { en: '<b>Case 1</b>: change the colours of some nodes (A, D black, C red), preserving #4: all downward paths have equal b.h. The while loop continues with x\'s grandparent C as the <b>new x</b>.', s: N('aC', 'C', 'R', N('aA', 'A', 'B', tri('a1'), N('aB', 'B', 'R', tri('a2'), tri('a3'))), N('aD', 'D', 'B', tri('a4'), tri('a5'))), tags: { aC: 'new x' }, on: [8, 9, 10, 11] },
      { en: '<b>Case 1 with x a left child</b>: x = B is now the left child of A. Same situation: red parent, red uncle y = D.', s: N('bC', 'C', 'B', N('bA', 'A', 'R', N('bB', 'B', 'R', tri('b1'), tri('b2')), tri('b3')), N('bD', 'D', 'R', tri('b4'), tri('b5'))), tags: { bB: 'x', bD: 'y' }, on: [7] },
      { en: '<b>Same action whether x is a left or a right child</b>: A and D black, C red, new x = C.', s: N('bC', 'C', 'R', N('bA', 'A', 'B', N('bB', 'B', 'R', tri('b1'), tri('b2')), tri('b3')), N('bD', 'D', 'B', tri('b4'), tri('b5'))), tags: { bC: 'new x' }, on: [8, 9, 10, 11] },
      { en: '<b>Case 2</b>: the "uncle" y is black and node x = B is a <b>right</b> child.', s: N('cC', 'C', 'B', N('cA', 'A', 'R', tri('c1'), N('cB', 'B', 'R', tri('c2'), tri('c3'))), tri('c4')), tags: { cB: 'x', c4: 'y' }, on: [12, 13] },
      { en: '<b>Case 2</b>: x = x->p, then leftRotate(x). This transforms case 2 into case 3 (x = A is now a left child), and preserves property 4: all downward paths contain the same number of black nodes.', s: N('cC', 'C', 'B', N('cB', 'B', 'R', N('cA', 'A', 'R', tri('c1'), tri('c2')), tri('c3')), tri('c4')), tags: { cA: 'x', c4: 'y' }, on: [14, 15] },
      { en: '<b>Case 3</b>: the "uncle" y is black and node x = A is a <b>left</b> child.', s: N('cC', 'C', 'B', N('cB', 'B', 'R', N('cA', 'A', 'R', tri('c1'), tri('c2')), tri('c3')), tri('c4')), tags: { cA: 'x', c4: 'y' }, on: [16, 17, 18] },
      { en: '<b>Case 3</b>: change colours (B black, C red) and rotate right at C. Again this preserves property 4, and no red node has a red parent any more: the loop ends.', s: N('cB', 'B', 'B', N('cA', 'A', 'R', tri('c1'), tri('c2')), N('cC', 'C', 'R', tri('c3'), tri('c4'))), tags: { cA: 'x' }, on: [16, 17, 18] },
      { en: '<b>Cases 4-6</b>: Cases 1-3 hold if x\'s parent is a left child. If x\'s parent is a <b>right</b> child, cases 4-6 are symmetric (swap left for right). Here Case 6, the mirror of Case 3: uncle y black, x a right child of a right child.', s: N('dA', 'A', 'B', tri('d1'), N('dB', 'B', 'R', tri('d2'), N('dC', 'C', 'R', tri('d3'), tri('d4')))), tags: { dC: 'x', d1: 'y' }, on: [19, 20] },
      { en: '<b>Case 6</b>: colour B black and A red, then <b>leftRotate</b> at A (the mirror of Case 3\'s right rotation).', s: N('dB', 'B', 'B', N('dA', 'A', 'R', tri('d1'), tri('d2')), N('dC', 'C', 'R', tri('d3'), tri('d4'))), tags: { dC: 'x' }, on: [19, 20] }
    ];
    const [i, ctl] = useSteps(steps.length, 3200), st = steps[i];
    return html`<figure className="fig"><div className="fig-stage">
      <${Tree} s=${st.s} tags=${st.tags} min=${7} label="rbInsert case picture" />
      <${Code} lines=${ICODE} on=${st.on} /></div>
      <${Cap} en=${st.en} /><${SBar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  window.FIGS = Object.assign(window.FIGS || {}, { 'ag-10-bh': BlackHeight, 'ag-10-color': ColorIt, 'ag-10-problem': Problem, 'ag-10-rotptr': RotPtr, 'ag-10-rotex': RotEx, 'ag-10-cases': InsCases });
})();
/* ── part L11 ── */
// Algorithms visuals, Lecture 11 (Red-black trees: insertion example, deletion and rbTreeFix): insert 65, 82, 87 (slides 1-11), leftRotate code (12), rbInsert simulator (13-14), deletion examples 1-3 (15-29), rbTreeFix cases (1)-(4) (30-38), efficiency table (39). Every label and number comes from the slides.
(function () {
  const { useState, useEffect, useRef, useMemo } = React;
  const { html, useSteps, Cap, Bar, pop, calm, useClock, useFit, sec } = window.FIGKIT;
  // ── shared red-black engine: insert / delete with one snapshot per step (follows the slides' rbInsert and rbDelete + rbTreeFix code) ──
  const RBK = '#1f2328', RRD = '#d23c3c', MOVE = calm() ? 'none' : 'transform .6s ease, opacity .4s ease', DMOVE = calm() ? 'none' : 'd .6s ease';
  let UID = 0;
  const T0 = () => ({ root: null, n: {} });
  const cl = t => ({ root: t.root, n: Object.fromEntries(Object.entries(t.n).map(([k, v]) => [k, { ...v }])) });
  // nested spec [key, 'R'|'B', left, right]
  function build(spec) {
    const t = T0();
    const mk = (s, p) => { if (!s) return null; const id = 'n' + (++UID); t.n[id] = { k: s[0], c: s[1], p, l: null, r: null }; t.n[id].l = mk(s[2], id); t.n[id].r = mk(s[3], id); return id; };
    t.root = mk(spec, null); return t;
  }
  const col = (t, id) => id ? t.n[id].c : 'B';
  const keyOf = (t, id) => id ? (t.n[id].pre ? 'NIL' : t.n[id].k) : 'NIL';
  const findK = (t, k) => { let x = t.root; while (x && t.n[x].k !== k) x = k < t.n[x].k ? t.n[x].l : t.n[x].r; return x; };
  const keysOf = t => { const o = []; const f = id => { if (!id) return; f(t.n[id].l); if (!t.n[id].pre) o.push(t.n[id].k); f(t.n[id].r); }; f(t.root); return o; };
  function rotL(t, x) { const n = t.n, X = n[x], y = X.r, Y = n[y]; X.r = Y.l; if (Y.l) n[Y.l].p = x; Y.p = X.p; if (!X.p) t.root = y; else if (n[X.p].l === x) n[X.p].l = y; else n[X.p].r = y; Y.l = x; X.p = y; }
  function rotR(t, y) { const n = t.n, Y = n[y], x = Y.l, X = n[x]; Y.l = X.r; if (X.r) n[X.r].p = y; X.p = Y.p; if (!Y.p) t.root = x; else if (n[Y.p].l === y) n[Y.p].l = x; else n[Y.p].r = x; X.r = y; Y.p = x; }
  // RB-INSERT: returns steps [{ t, en, tags, cas }]; o.six names the mirror cases 4-6 (Lecture 10), otherwise "Case k (mirror)"
  function insTrace(t0, key, o = {}) {
    const t = cl(t0), n = t.n, S = [], K = id => n[id].k;
    const snap = (en, tags = {}, cas = 0) => S.push({ t: cl(t), en, tags, cas });
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
      const tags = { [x]: 'x', [p]: 'p' }; if (u) tags[u] = 'y';
      const cn = c => (o.six && !left ? c + 3 : c), mir = !left && !o.six ? ' (mirror: p[x] is a right child)' : '';
      const two = `x = ${K(x)} and its parent ${K(p)} are both red (property 3 broken).`;
      if (col(t, u) === 'R') {
        snap(`${two} The uncle y = ${un} is <b>red</b>: <b>Case ${cn(1)}</b>${mir}.`, tags, cn(1));
        n[p].c = 'B'; n[u].c = 'B'; n[g].c = 'R';
        snap(`<b>Case ${cn(1)}</b>: colour p[x] = ${K(p)} and y = ${un} <b>black</b> and the grandparent ${K(g)} <b>red</b>; then x ← p[p[x]] = ${K(g)}. No black-height changes.`, { [g]: 'new x' }, cn(1));
        x = g;
      } else {
        const zig = left ? x === n[p].r : x === n[p].l;
        if (zig) {
          snap(`${two} The uncle y = ${un} is <b>black</b> and x is a ${left ? 'right' : 'left'} child while p[x] is a ${left ? 'left' : 'right'} child (a zig-zag): <b>Case ${cn(2)}</b>${mir}.`, tags, cn(2));
          x = p; left ? rotL(t, x) : rotR(t, x);
          snap(`<b>Case ${cn(2)}</b>: x ← p[x] = ${K(x)}, then ${left ? 'LEFT' : 'RIGHT'}-ROTATE(${K(x)}). Now x, p[x] and p[p[x]] lie on a straight line, which is Case ${cn(3)}.`, { [x]: 'x', [n[x].p]: 'p' }, cn(2));
        } else snap(`${two} The uncle y = ${un} is <b>black</b> and x is a ${left ? 'left' : 'right'} child like p[x] (a straight line): <b>Case ${cn(3)}</b>${mir}.`, tags, cn(3));
        const p2 = n[x].p, g2 = n[p2].p;
        n[p2].c = 'B'; n[g2].c = 'R';
        snap(`<b>Case ${cn(3)}</b>: colour p[x] = ${K(p2)} <b>black</b> and p[p[x]] = ${K(g2)} <b>red</b>.`, { [x]: 'x', [p2]: 'p' }, cn(3));
        left ? rotR(t, g2) : rotL(t, g2);
        snap(`<b>Case ${cn(3)}</b>: ${left ? 'RIGHT' : 'LEFT'}-ROTATE(${K(g2)}). Now ${K(p2)} is black with red children ${K(x)} and ${K(g2)}: no red node has a red parent, so the loop stops.`, { [p2]: '' }, cn(3));
      }
    }
    const last = S[S.length - 1];
    if (n[t.root].c === 'R') { n[t.root].c = 'B'; snap(`color[root[T]] ← BLACK: the root ${K(t.root)} is coloured black (property 2). Done.`, {}, 0); }
    else if (!fixed) last.en += ` Its parent ${K(n[id].p)} is black, so nothing is violated. Done.`;
    else if (last.cas === 1 || last.cas === 4) last.en += ` The new x = ${K(x)} has a black parent, so the loop stops. Done.`;
    else last.en += ' Done.';
    return S;
  }
  // RB-DELETE as on the slides: two children → copy the predecessor's data, remove node y, its child x (or a black pretend NIL) takes its place, rbTreeFix(x) if y was black
  function delTrace(t0, key) {
    const t = cl(t0), n = t.n, S = [], K = id => keyOf(t, id);
    const snap = (en, tags = {}, tok = null, cas = '') => S.push({ t: cl(t), en, tags, tok, cas });
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
  // tree → drawing structure; nil adds the NIL leaves as small black squares
  function toS(t, nil) {
    const f = id => { const v = t.n[id]; if (v.pre) return { id, pre: 1 }; return { id, label: v.k, c: v.c, L: v.l ? f(v.l) : nil ? { nil: 1, side: -1, id: id + 'L' } : null, R: v.r ? f(v.r) : nil ? { nil: 1, side: 1, id: id + 'R' } : null }; };
    return t.root ? f(t.root) : null;
  }
  function lay(s) {
    const items = [], edges = [], nils = []; let slot = 0, dmax = 0;
    const walk = (v, d, pid) => {
      if (!v) return;
      if (v.nil) { nils.push({ ...v, pid, d }); return; }
      dmax = Math.max(dmax, d);
      if (v.tri || v.pre) { items.push({ ...v, sx: slot++, d }); if (pid) edges.push([pid, v.id]); return; }
      walk(v.L, d + 1, v.id); items.push({ ...v, sx: slot++, d }); walk(v.R, d + 1, v.id); if (pid) edges.push([pid, v.id]);
    };
    walk(s, 0, null);
    return { items, edges, nils, slots: slot, dmax };
  }
  const nodeFill = c => c === 'R' ? RRD : c === 'B' ? RBK : 'var(--paper)';
  // the drawing: nodes keep their place on screen between steps (keyed by id), so rotations and recolourings animate
  function Tree({ s, tags = {}, tok = null, nil = false, min = 7, label = 'Red-black tree', marks = {}, onTap = null }) {
    const L = s ? lay(s) : { items: [], edges: [], nils: [], slots: 0, dmax: 0 };
    const SL = 36, LV = 54, slots = Math.max(min, L.slots), W = slots * SL + 60, sc = 268 / W;
    const fs = Math.max(16, 12.4 / sc), tf = Math.max(14, 12.2 / sc), R = Math.max(15, fs * .86);
    const H = (L.dmax + 1) * LV + (nil ? 26 : 2) + 16, ox = 14 + (slots - L.slots) * SL / 2 + SL / 2, P = {};
    L.items.forEach(o => { P[o.id] = [ox + o.sx * SL, 26 + o.d * LV]; });
    const it = Object.fromEntries(L.items.map(o => [o.id, o]));
    const tip = id => { const o = it[id], [x, y] = P[id]; return o.tri ? [x, y - 14] : o.pre ? [x, y - 7] : [x, y]; };
    const eds = L.edges.map(([a, b]) => { const [x1, y1] = P[a], [x2, y2] = tip(b); const d = `M${x1} ${y1} L${x2} ${y2}`; return html`<path key=${'e' + b} d=${d} style=${{ d: `path("${d}")`, transition: DMOVE }} stroke="var(--graphite)" strokeWidth="2" fill="none" />`; });
    const nl = nil ? L.nils.map(v => { const [x, y] = P[v.pid], nx = x + v.side * 12, ny = y + 34; return html`<g key=${v.id}><path d=${`M${x} ${y} L${nx} ${ny}`} stroke="var(--graphite)" strokeWidth="1.6" /><rect x=${nx - 5} y=${ny - 5} width="10" height="10" fill=${RBK} stroke="var(--ink)" strokeWidth="1" /></g>`; }) : null;
    const nodes = L.items.map(o => {
      const [x, y] = P[o.id], tg = tags[o.id], mk = marks[o.id];
      let body;
      if (o.tri) body = html`<path d="M0 -14 L17 22 L-17 22 Z" fill="color-mix(in srgb, var(--fig-k) 20%, var(--paper))" stroke="var(--fig-k)" strokeWidth="1.6" /><text y="16" textAnchor="middle" fontSize=${tf}>${o.tri === true ? '' : o.tri}</text>${o.b ? html`<circle cy="-14" r="4.5" fill=${RBK} stroke="var(--ink)" strokeWidth="1" />` : null}`;
      else if (o.pre) body = html`<circle r="7" fill=${RBK} stroke="var(--ink)" strokeWidth="1.2" />`;
      else body = html`<circle r=${R} fill=${nodeFill(o.c)} stroke=${o.c === '?' ? 'var(--fig-k)' : o.c === 'A' ? 'var(--graphite)' : o.c === 'N' ? 'var(--ink)' : 'var(--ink)'} strokeWidth=${o.c === 'R' || o.c === 'B' ? 1.2 : 2} strokeDasharray=${o.c === '?' || o.c === 'A' ? '4 3' : null} style=${{ transition: calm() ? 'none' : 'fill .5s' }} />
        <text textAnchor="middle" dy=".35em" fontSize=${fs} fontWeight="700" style=${{ fill: o.c === 'R' || o.c === 'B' ? '#fff' : 'var(--ink)' }}>${o.label}</text>`;
      const tap = onTap && !o.tri && !o.pre ? { onClick: () => onTap(o.id), onKeyDown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTap(o.id); } }, tabIndex: 0, role: 'button', 'aria-label': 'node ' + o.label } : {};
      return html`<g key=${o.id} ...${tap} style=${{ transform: `translate(${x}px,${y}px)`, transition: MOVE, cursor: onTap && !o.tri ? 'pointer' : null }}>
        ${tg != null && !o.tri ? html`<circle r=${(o.pre ? 7 : R) + 5} fill="none" stroke="var(--fig-k)" strokeWidth="3" />` : null}
        ${body}
        ${tg ? html`<text x=${(o.pre ? 9 : R) + 3} y=${-R + 3} fontSize=${tf} fontWeight="700" style=${{ fill: 'var(--fig-k)' }}>${tg}</text>` : null}
        ${mk ? html`<text x=${(o.pre ? 9 : R) + 3} y=${R + 4} fontSize=${tf} fontWeight="700" style=${{ fill: mk[1] || 'var(--pen)' }}>${mk[0]}</text>` : null}
        ${tok === o.id ? html`<rect x=${-(o.pre ? 7 : R) - 15} y=${-R + 1} width="10" height="10" fill="var(--ink)" />` : null}
      </g>`;
    });
    return html`<svg className="a11-tree" viewBox=${`0 0 ${W} ${Math.max(H, 80)}`} role="img" aria-label=${label}>${eds}${nl}${nodes}</svg>`;
  }
  // a code listing with the lines of the current step highlighted
  const Code = ({ lines, on = [] }) => html`<pre className="a11-code" aria-label="Pseudocode">${lines.map((l, k) => { const ind = l.length - l.trimStart().length; return html`<span key=${k} className=${on.includes(k) ? 'on' : ''} style=${{ paddingLeft: (ind * .5 + 1.6) + 'em', textIndent: '-1.2em' }}>${l.trimStart()}</span>`; })}</pre>`;
  const Tabs = ({ opts, v, set }) => html`<div className="a11-tabs" role="group">${opts.map(([k, t]) => html`<button key=${k} className="fig-btn" aria-pressed=${String(v === k)} onClick=${() => set(k)}>${t}</button>`)}</div>`;
  const CORE_CSS = `
.a11-of{ font-size:.85rem; color:var(--graphite); }
.a11-tree{ display:block; width:100%; height:auto; max-width:520px; margin:0 auto; }
.a11-code{ font:12px/1.45 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; background:var(--paper); color:var(--ink); border:1px solid var(--line); border-radius:8px; padding:8px 6px; margin:10px auto 0; max-width:520px; white-space:pre-wrap; overflow-wrap:anywhere; text-align:left; }
.a11-code span{ display:block; padding:0 4px; border-radius:4px; }
.a11-code span.on{ background:color-mix(in srgb, var(--fig-k) 24%, transparent); font-weight:700; }
.a11-tabs{ display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin:0 0 10px; }
.a11-tabs .fig-btn[aria-pressed="true"]{ background:var(--fig-s); color:#fff; border-color:transparent; }
.a11-eq{ text-align:center; font-size:.95rem; line-height:1.6; margin:8px 0 0; color:var(--ink); }
.a11-eq div{ transition:opacity .5s; } .a11-eq .off{ opacity:.15; } .a11-eq .on{ font-weight:700; }
.a11-leg{ display:flex; flex-wrap:wrap; gap:6px 14px; justify-content:center; font-size:.85rem; color:var(--graphite); margin-top:6px; }
.a11-leg i{ display:inline-block; width:12px; height:12px; border-radius:50%; vertical-align:-1px; margin-right:4px; }
.a11-in{ display:flex; flex-wrap:wrap; gap:6px; align-items:center; justify-content:center; margin:0 0 10px; font-size:.9rem; }
.a11-in input{ font:inherit; min-width:0; flex:1 1 150px; max-width:260px; padding:6px 8px; border:1px solid var(--line); border-radius:8px; background:var(--paper); color:var(--ink); }
.a11-err{ color:var(--pen); font-size:.88rem; text-align:center; margin:0 0 8px; }
.a11-chips{ display:flex; flex-wrap:wrap; gap:4px; justify-content:center; margin:0 0 8px; }
.a11-chips span{ font-size:.85rem; padding:2px 8px; border-radius:99px; border:1px solid var(--line); color:var(--graphite); }
.a11-chips span.cur{ background:var(--fig-s); color:#fff; border-color:transparent; } .a11-chips span.done{ color:var(--ink); border-color:var(--fig-k); }
`;
  // Back / Next / Replay; long traces show "step i of n" instead of a row of dots that would not fit a phone
  const SBar = ({ steps, i, ctl }) => steps.length <= 11 ? html`<${Bar} steps=${steps} i=${i} ctl=${ctl} />` : html`<div className="fig-bar">
    <span className="a11-of">step ${i + 1} of ${steps.length}</span><span className="grow"></span>
    <button className="fig-btn" onClick=${() => ctl.go(Math.max(0, i - 1))} disabled=${i === 0} aria-label="Previous step">‹ Back</button>
    <button className="fig-btn" onClick=${() => ctl.go(Math.min(steps.length - 1, i + 1))} disabled=${i === steps.length - 1} aria-label="Next step">Next ›</button>
    <button className="fig-btn" onClick=${ctl.replay}>↻ Replay</button></div>`;
  const CSS = CORE_CSS + `
.a11-ptr{ display:block; width:100%; height:auto; max-width:420px; margin:0 auto; }
.a11-tbl{ width:100%; max-width:440px; margin:0 auto; border-collapse:collapse; font-size:.9rem; }
.a11-tbl th, .a11-tbl td{ border:1px solid var(--line); padding:6px 5px; text-align:center; }
.a11-tbl th{ background:var(--paper); } .a11-tbl td.a11-good{ color:var(--ok); font-weight:700; }
.a11-cnt{ text-align:center; font-size:.9rem; margin:10px 0 0; color:var(--ink); }
`;
  if (!document.getElementById('a11-css')) { const s = document.createElement('style'); s.id = 'a11-css'; s.textContent = CSS; document.head.appendChild(s); }
  const START = [47, 'B', [32, 'B'], [71, 'B', null, [93, 'R']]];
  const chain = (t, keys, o) => { const S = []; keys.forEach((k, j) => { const tr = insTrace(t, k, o); tr.forEach(s => { s.j = j; }); S.push(...tr); t = tr[tr.length - 1].t; }); return S; };
  const Chips = ({ keys, j, pre = 'Insert' }) => html`<div className="a11-chips">${keys.map((k, m) => html`<span key=${m} className=${m === j ? 'cur' : m < j ? 'done' : ''}>${pre} ${k}</span>`)}</div>`;

  // slides 11.1-11.11: insert 65, 82, 87
  function InsertEx() {
    const steps = useMemo(() => { const t = build(START); return [{ t, en: 'Insertion example: start tree 47, 32, 71 black and 93 red (the right child of 71). Insert 65, 82, 87.', tags: {}, j: -1 }, ...chain(t, [65, 82, 87])]; }, []);
    const [i, ctl] = useSteps(steps.length, 2700), st = steps[i];
    return html`<figure className="fig"><div className="fig-stage">
      <${Chips} keys=${[65, 82, 87]} j=${st.j} />
      <${Tree} s=${toS(st.t, true)} nil=${true} tags=${st.tags} min=${7} label="Inserting 65, 82 and 87" /></div>
      <${Cap} en=${st.en} /><${SBar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  // slide 11.12: the leftRotate code, traced on the slides' own left rotation of 82 (slides 11.8 → 11.9)
  const LCODE = ['TreeNode<T> leftRotate(TreeNode<T> root,TreeNode<T> x)', '//returns a new root; Pre: right child of x is a proper node (with value)', '{', ' TreeNode<T> z = x.getRight();', ' x.setRight(z.getLeft());', ' // Set parent reference', ' if (z.getLeft() != null)', '  z.getLeft().setParent(x);', ' z.setLeft(x); //move x down', ' z.setParent(x.getParent());', ' // Set parent reference of x', ' if (x.getParent() != null) //x is not the root', '  if (x == x.getParent().getLeft()) //left child', '   x.getParent().setLeft(z);', '  else', '   x.getParent().setRight(z);', ' else', '  root=z;', ' x.setParent(z);', ' return root;', '}'];
  function LeftRot() {
    const B = { 93: [230, 34], 82: [140, 112], 87: [230, 190] }, A = { 93: [230, 34], 87: [140, 112], 82: [70, 190] };
    const st0 = [['c', 93, 82], ['c', 82, 87], ['p', 82, 93], ['p', 87, 82]];
    const steps = [
      { en: 'Insert 87 needs <b>leftRotate(root, x)</b> with x = 82 (Case 2). Solid arrows are child pointers, dashed arrows are parent pointers.', P: B, E: st0, on: [0, 1] },
      { en: '<b>z = x.getRight()</b>: z = 87.', P: B, E: st0, on: [3], z: 1 },
      { en: '<b>x.setRight(z.getLeft())</b>: 87 has no left child, so 82\'s right pointer becomes null.', P: B, E: [['c', 93, 82], ['p', 82, 93], ['p', 87, 82]], on: [4], z: 1 },
      { en: 'z.getLeft() is null, so there is no parent reference to set.', P: B, E: [['c', 93, 82], ['p', 82, 93], ['p', 87, 82]], on: [6, 7], z: 1 },
      { en: '<b>z.setLeft(x)</b>: 82 becomes 87\'s left child (move x down).', P: B, E: [['c', 93, 82], ['p', 82, 93], ['p', 87, 82], ['c', 87, 82]], hot: 'c8782', on: [8], z: 1 },
      { en: '<b>z.setParent(x.getParent())</b>: 87\'s parent becomes 93.', P: B, E: [['c', 93, 82], ['p', 82, 93], ['c', 87, 82], ['p', 87, 93]], hot: 'p8793', on: [9], z: 1 },
      { en: 'x is not the root and x is the <b>left</b> child of 93, so <b>x.getParent().setLeft(z)</b>: 93\'s left child becomes 87.', P: B, E: [['c', 93, 87], ['p', 82, 93], ['c', 87, 82], ['p', 87, 93]], hot: 'c9387', on: [11, 12, 13], z: 1 },
      { en: '<b>x.setParent(z)</b>: 82\'s parent becomes 87. Redrawn: 87 now hangs under 93 with 82 as its left child (slide 11.9).', P: A, E: [['c', 93, 87], ['p', 82, 87], ['c', 87, 82], ['p', 87, 93]], hot: 'p8287', on: [18], z: 1 },
      { en: '<b>return root</b>: the root (47) did not change. Then Case 3 recolours 87 black, 93 red and right-rotates 93.', P: A, E: [['c', 93, 87], ['p', 82, 87], ['c', 87, 82], ['p', 87, 93]], on: [19] }
    ];
    const [i, ctl] = useSteps(steps.length, 3000), st = steps[i], P = st.P, C = { 93: RBK, 82: RRD, 87: RRD };
    const arrow = ([k, a, b]) => { const [x1, y1] = P[a], [x2, y2] = P[b], dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, off = k === 'p' ? 9 : -9;
      const sx = x1 + ux * 19 - uy * off, sy = y1 + uy * 19 + ux * off, ex = x2 - ux * 23 - uy * off, ey = y2 - uy * 23 + ux * off, d = `M${sx} ${sy} L${ex} ${ey}`;
      const hot = st.hot === k + a + b;
      return html`<path key=${k + a + b} d=${d} style=${{ d: `path("${d}")`, transition: DMOVE }} stroke=${hot ? 'var(--fig-k)' : 'var(--graphite)'} strokeWidth=${hot ? 3.2 : 2} strokeDasharray=${k === 'p' ? '6 4' : null} fill="none" markerEnd=${hot ? 'url(#a11-ah)' : 'url(#a11-a)'} />`; };
    return html`<figure className="fig"><div className="fig-stage">
      <svg className="a11-ptr" viewBox="0 0 300 226" role="img" aria-label="Child and parent pointers during leftRotate of 82">
        <defs><marker id="a11-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" style=${{ fill: 'var(--graphite)' }} /></marker>
          <marker id="a11-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" style=${{ fill: 'var(--fig-k)' }} /></marker></defs>
        ${st.E.map(arrow)}
        ${[93, 82, 87].map(k => html`<g key=${k} style=${{ transform: `translate(${P[k][0]}px,${P[k][1]}px)`, transition: MOVE }}>
          <circle r="17" fill=${C[k]} stroke="var(--ink)" strokeWidth="1.2" /><text textAnchor="middle" dy=".35em" fontSize="17" fontWeight="700" style=${{ fill: '#fff' }}>${k}</text>
          ${k === 82 || (k === 87 && st.z) ? html`<text x="22" y="-14" fontSize="16" fontWeight="700" style=${{ fill: 'var(--fig-k)' }}>${k === 82 ? 'x' : 'z'}</text>` : null}</g>`)}
      </svg>
      <${Code} lines=${LCODE} on=${st.on} /></div>
      <${Cap} en=${st.en} /><${SBar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  // slides 11.13-11.14 (rbInsert code) on the exam sequences, the slide example, or your own keys
  const PRE = { slide: { keys: [65, 82, 87], start: START, name: 'Slide example' }, e1: { keys: [2, 1, 4, 5, 9, 3, 6, 7], name: 'Exam: 2, 1, 4, 5, 9, 3, 6, 7' }, e2: { keys: [5, 1, 4, 10, 9, 20, 6, 7], name: 'Exam: 5, 1, 4, 10, 9, 20, 6, 7' } };
  const parseKeys = s => { const p = s.split(/[\s,;]+/).filter(Boolean); if (!p.length) return 'Type some keys, e.g. 10, 20, 30.'; if (p.some(x => !/^\d{1,2}$/.test(x) || +x < 1)) return 'Use whole numbers from 1 to 99.'; const k = p.map(Number); if (new Set(k).size !== k.length) return 'Each key may appear only once.'; if (k.length > 10) return 'At most 10 keys, so the tree fits a phone.'; return k; };
  function InsRun({ keys, start }) {
    const steps = useMemo(() => { const t = start ? build(start) : T0(); return [{ t, en: start ? 'Start tree from the slides: 47, 32, 71 black, 93 red.' : 'Start with an empty tree. Each key is inserted with rbInsert: BST insert, colour red, then fix Cases 1-3 (or their mirrors).', tags: {}, j: -1 }, ...chain(t, keys)]; }, [keys.join(','), start]);
    const [i, ctl] = useSteps(steps.length, 2300), st = steps[i];
    const last = i === steps.length - 1, tt = st.t, bh = tt.root ? (() => { let b = 1; for (let x = tt.root; x; x = tt.n[x].l) if (tt.n[x].c === 'B') b++; return b - 1; })() : 0;
    return html`<div className="fig-stage" style=${{ paddingTop: '4px' }}><${Chips} keys=${keys} j=${st.j} />
      <${Tree} s=${toS(tt, true)} nil=${true} tags=${st.tags} min=${7} label="Red-black tree after the insertions" /></div>
      <${Cap} en=${st.en + (last && tt.root ? ` Final tree: root ${tt.n[tt.root].k}, black-height of the root ${bh}.` : '')} /><${SBar} steps=${steps} i=${i} ctl=${ctl} />`;
  }
  const InsSim = def => function InsSimFig() {
    const [p, setP] = useState(def), [txt, setTxt] = useState('10, 20, 30, 15, 25, 5'), [own, setOwn] = useState([10, 20, 30, 15, 25, 5]);
    const parsed = parseKeys(txt), cur = p === 'own' ? { keys: own } : PRE[p];
    return html`<figure className="fig"><div className="fig-stage" style=${{ paddingBottom: '4px' }}>
      <${Tabs} opts=${[['e1', '2, 1, 4, 5, 9, 3, 6, 7'], ['e2', '5, 1, 4, 10, 9, 20, 6, 7'], ['slide', 'Slide 11.1'], ['own', 'Try your own']]} v=${p} set=${setP} />
      ${p === 'own' ? html`<div className="a11-in"><input aria-label="Keys to insert" value=${txt} onInput=${e => setTxt(e.target.value)} /><button className="fig-btn solid" disabled=${typeof parsed === 'string'} onClick=${() => setOwn(parsed)}>Insert</button></div>
        ${typeof parsed === 'string' ? html`<p className="a11-err">${parsed}</p>` : null}` : null}
      </div><${InsRun} key=${p + cur.keys.join(',')} keys=${cur.keys} start=${cur.start} /></figure>`;
  };

  // slides 11.15-11.29: deletion examples 1, 2, 3
  const DT = [47, 'B', [32, 'B'], [71, 'R', [65, 'B'], [87, 'B', [82, 'R'], [93, 'R']]]];
  const DT2 = [47, 'B', [32, 'B'], [71, 'R', [65, 'B', [51, 'R']], [87, 'B', [82, 'R'], [93, 'R']]]];
  const DEX = { 1: { spec: DT, k: 87 }, 2: { spec: DT2, k: 71 }, 3: { spec: DT, k: 32 } };
  function DelRun({ spec, k, intro }) {
    const steps = useMemo(() => { const t = build(spec); return [{ t, en: intro, tags: {} }, ...delTrace(t, k)]; }, [spec, k]);
    const [i, ctl] = useSteps(steps.length, 2800), st = steps[i];
    return html`<div className="fig-stage" style=${{ paddingTop: '4px' }}><${Tree} s=${toS(st.t, true)} nil=${true} tags=${st.tags} tok=${st.tok} min=${8} label=${'Deleting ' + k} /></div>
      <${Cap} en=${st.en} /><${SBar} steps=${steps} i=${i} ctl=${ctl} />`;
  }
  function DelEx() {
    const [e, setE] = useState(1), d = DEX[e];
    const intro = { 1: 'Deletion example 1: <b>delete 87</b>. First the standard BST deletion; if the node has two children its data is replaced by its predecessor\'s.', 2: 'Deletion example 2: <b>delete 71</b> (65 now has a red left child 51).', 3: 'Deletion example 3: <b>delete 32</b>, a black node with no real children.' }[e];
    return html`<figure className="fig"><div className="fig-stage" style=${{ paddingBottom: '4px' }}>
      <${Tabs} opts=${[[1, 'Example 1: delete 87'], [2, 'Example 2: delete 71'], [3, 'Example 3: delete 32']]} v=${e} set=${setE} />
      </div><${DelRun} key=${e} spec=${d.spec} k=${d.k} intro=${intro} />
      <div className="a11-leg" style=${{ paddingBottom: '10px' }}><span>■ = extra black token · small dot = pretend NIL node</span></div></figure>`;
  }

  // slides 11.30-11.38: the four cases of rbTreeFix (letters as in the slides' pictures)
  const FCODE = ['while (x != root && x.getColor() == black) // not case (1)', ' if (x == x.getParent().getLeft()) { // x is left child', '  y = x.getParent().getRight(); // y is x\'s sibling', '  if (y.getColor() == red) { // case (2)', '   y.setColor(black);', '   x.getParent().setColor(red); // p was black', '   root = left_rotate(root,x.getParent());', '   y = x.getParent().getRight(); // new sibling', '  }', '  if (y.getLeft().getColor() == black &&', '      y.getRight().getColor() == black) {', '   // nephews are black - case (3)', '   y.setColor(red);', '   x = x.getParent();', '  } else { // case (4)', '   if (y.getRight().getColor() == black) {', '    // subcase (i)', '    y.getLeft().setColor(black);', '    y.setColor(red);', '    root = right_rotate(root,y);', '    y = x.getParent().getRight();', '   }', '   // subcase (ii)', '   y.setColor(x.getParent().getColor());', '   x.getParent().setColor(black);', '   y.getRight().setColor(black);', '   root = left_rotate(root, x.getParent());', '   x = root; // we can finish', '  }', ' } else { … // x is right child - symmetric', ' }', 'x.setColor(black);'];
  const N = (id, label, c, L, R) => ({ id, label, c, L, R });
  const T = (l, b) => ({ id: 't' + l, tri: l, b });
  const FIX = {
    1: [
      { en: '<b>Case (1): x is red</b>, the simplest case. x has the black token and is coloured red.', s: N('y', 'y', 'A', N('x', 'x', 'R', T('A'), T('B')), T('C')), tok: 'x', on: [0] },
      { en: 'So just colour x <b>black</b> and remove the token: we are done! In the remaining cases x is black and has the token, i.e. it is <b>double black</b>.', s: N('y', 'y', 'A', N('x', 'x', 'B', T('A'), T('B')), T('C')), on: [31] }],
    2: [
      { en: '<b>Case (2): x\'s sibling is red</b>. Here x has the token, its parent y is black and its sibling z is red; the roots of subtrees C and D are black. (The code calls the sibling y.)', s: N('y', 'y', 'B', N('x', 'x', 'B', T('A'), T('B')), N('z', 'z', 'R', T('C', 1), T('D', 1))), tok: 'x', on: [3] },
      { en: '<b>Left_rotate(y)</b>: the colours of y and z were swapped (z black, y red). x now has a black sibling (C), so in the next step, case (3) or (4), the algorithm will finish.', s: N('z', 'z', 'B', N('y', 'y', 'R', N('x', 'x', 'B', T('A'), T('B')), T('C', 1)), T('D', 1)), tok: 'x', on: [4, 5, 6, 7] },
      { en: 'The symmetric case, when the token node is the <b>right</b> child: z has the token, its sibling x is red.', s: N('y', 'y', 'B', N('x', 'x', 'R', T('A', 1), T('B', 1)), N('z', 'z', 'B', T('C'), T('D'))), tok: 'z', on: [29] },
      { en: '<b>Right_rotate(y)</b>: the colours of x and y were swapped (x black, y red).', s: N('x', 'x', 'B', T('A', 1), N('y', 'y', 'R', T('B', 1), N('z', 'z', 'B', T('C'), T('D')))), tok: 'z', on: [29] }],
    3: [
      { en: '<b>Case (3): x\'s sibling is black and both nephews are black</b>. The nephews are the roots of subtrees C and D. The parent y may be any colour (dashed).', s: N('y', 'y', 'A', N('x', 'x', 'B', T('A'), T('B')), N('z', 'z', 'B', T('C', 1), T('D', 1))), tok: 'x', on: [9, 10, 11] },
      { en: 'Colour the sibling z <b>red</b>: the <b>black token is passed one level up</b> to y. If y is red, case (1) finishes; otherwise the loop goes on from y.', s: N('y', 'y', 'A', N('x', 'x', 'B', T('A'), T('B')), N('z', 'z', 'R', T('C', 1), T('D', 1))), tok: 'y', on: [12, 13] },
      { en: 'The symmetric case: the token is on z and its sibling x has black children (A, B).', s: N('y', 'y', 'A', N('x', 'x', 'B', T('A', 1), T('B', 1)), N('z', 'z', 'B', T('C'), T('D'))), tok: 'z', on: [29] },
      { en: 'Colour x red and pass the token up to y.', s: N('y', 'y', 'A', N('x', 'x', 'R', T('A', 1), T('B', 1)), N('z', 'z', 'B', T('C'), T('D'))), tok: 'y', on: [29] }],
    4: [
      { en: '<b>Case (4): x\'s sibling w is black and at least one nephew is red</b>. <b>Subcase (i)</b>: the far nephew (root of E) is black, the near nephew z is red.', s: N('y', 'y', 'A', N('x', 'x', 'B', T('A'), T('B')), N('w', 'w', 'B', N('z', 'z', 'R', T('C'), T('D')), T('E', 1))), tok: 'x', on: [14, 15, 16] },
      { en: '<b>Right_rotate(w)</b>: the colours of z and w were swapped. Now the far nephew w is red: <b>subcase (ii)</b>.', s: N('y', 'y', 'A', N('x', 'x', 'B', T('A'), T('B')), N('z', 'z', 'B', T('C'), N('w', 'w', 'R', T('D'), T('E', 1)))), tok: 'x', on: [17, 18, 19, 20] },
      { en: '<b>Left_rotate(y)</b>: the colours of y and z were swapped, the far nephew w is coloured black and the <b>black token is removed</b> completely.', s: N('z', 'z', 'A', N('y', 'y', 'B', N('x', 'x', 'B', T('A'), T('B')), T('C')), N('w', 'w', 'B', T('D'), T('E', 1))), on: [22, 23, 24, 25, 26, 27] },
      { en: 'The symmetric case: the token is on w (a right child); its sibling x is black with a red near nephew y and a black far nephew (A).', s: N('z', 'z', 'A', N('x', 'x', 'B', T('A', 1), N('y', 'y', 'R', T('B'), T('C'))), N('w', 'w', 'B', T('D'), T('E'))), tok: 'w', on: [29] },
      { en: '<b>Left_rotate(x)</b>: the colours of x and y were swapped. Now the far nephew x is red.', s: N('z', 'z', 'A', N('y', 'y', 'B', N('x', 'x', 'R', T('A', 1), T('B')), T('C')), N('w', 'w', 'B', T('D'), T('E'))), tok: 'w', on: [29] },
      { en: '<b>Right_rotate(z)</b>: the colours of z and y were swapped, the far nephew x is coloured black and the black token is removed. If the far nephew is red from the start, begin directly in subcase (ii).', s: N('y', 'y', 'A', N('x', 'x', 'B', T('A', 1), T('B')), N('z', 'z', 'B', T('C'), N('w', 'w', 'B', T('D'), T('E')))), on: [29] }]
  };
  function FixRun({ steps }) {
    const [i, ctl] = useSteps(steps.length, 3200), st = steps[i];
    return html`<div className="fig-stage" style=${{ paddingTop: '4px' }}><${Tree} s=${st.s} tok=${st.tok} min=${6} label="rbTreeFix case picture" /><${Code} lines=${FCODE} on=${st.on} /></div>
      <${Cap} en=${st.en} /><${SBar} steps=${steps} i=${i} ctl=${ctl} />`;
  }
  function FixCases() {
    const [c, setC] = useState(1);
    return html`<figure className="fig"><div className="fig-stage" style=${{ paddingBottom: '4px' }}>
      <${Tabs} opts=${[[1, 'Case (1)'], [2, 'Case (2)'], [3, 'Case (3)'], [4, 'Case (4)']]} v=${c} set=${setC} />
      </div><${FixRun} key=${c} steps=${FIX[c]} />
      <div className="a11-leg" style=${{ paddingBottom: '10px' }}><span>■ = black token</span><span><i style=${{ background: 'var(--paper)', border: '2px dashed var(--graphite)' }}></i>any colour</span><span><i style=${{ background: RBK, width: '9px', height: '9px', border: '1px solid var(--ink)' }}></i>black subtree root</span></div></figure>`;
  }

  // try your own: delete (and insert) keys on the slides' tree, every rbTreeFix step shown
  function DelSim() {
    const [t, setT] = useState(() => build(DT2)), [run, setRun] = useState(null), [txt, setTxt] = useState(''), [n, setN] = useState(0);
    const keys = keysOf(t), v = txt.trim(), bad = v && (!/^\d{1,2}$/.test(v) || +v < 1 ? 'Use a whole number from 1 to 99.' : keys.includes(+v) ? v + ' is already in the tree.' : keys.length >= 10 ? 'At most 10 keys.' : '');
    const del = k => { const S = delTrace(t, k); setRun({ S, k, op: 'Delete' }); setT(S[S.length - 1].t); setN(x => x + 1); };
    const ins = () => { const S = insTrace(t, +v); setRun({ S, k: +v, op: 'Insert' }); setT(S[S.length - 1].t); setTxt(''); setN(x => x + 1); };
    return html`<figure className="fig"><div className="fig-stage" style=${{ paddingBottom: '4px' }}>
      <div className="a11-chips" role="group" aria-label="Delete a key">${keys.map(k => html`<button key=${k} className="fig-btn" onClick=${() => del(k)} aria-label=${'Delete ' + k}>✕ ${k}</button>`)}</div>
      <div className="a11-in"><input aria-label="Key to insert" placeholder="key to insert" value=${txt} onInput=${e => setTxt(e.target.value)} /><button className="fig-btn" disabled=${!v || !!bad} onClick=${ins}>Insert</button><button className="fig-btn" onClick=${() => { setT(build(DT2)); setRun(null); setN(x => x + 1); }}>↻ Slide tree</button></div>
      ${bad ? html`<p className="a11-err">${bad}</p>` : null}
      </div>${run ? html`<${OpRun} key=${n} run=${run} />` : html`<div className="fig-stage" style=${{ paddingTop: '4px' }}><${Tree} s=${toS(t, true)} nil=${true} min=${8} label="Red-black tree" /></div>
        <${Cap} en=${keys.length ? '<b>Try your own</b>: tap ✕ on a key to delete it (predecessor rule, as on the slides) and follow every rbTreeFix step, or insert a key. This is the tree of deletion example 2.' : 'The tree is empty: insert a key.'} />`}</figure>`;
  }
  function OpRun({ run }) {
    const [i, ctl] = useSteps(run.S.length, 2300), st = run.S[i];
    return html`<div className="fig-stage" style=${{ paddingTop: '4px' }}><${Tree} s=${toS(st.t, true)} nil=${true} tags=${st.tags} tok=${st.tok} min=${8} label=${run.op + ' ' + run.k} /></div>
      <${Cap} en=${st.en} /><${SBar} steps=${run.S} i=${i} ctl=${ctl} />`;
  }

  // slide 11.39: RB trees efficiency
  function Eff() {
    const [e, setE] = useState(6), n = Math.pow(10, e), lg = Math.ceil(Math.log2(n));
    const f = x => x.toLocaleString('en-US');
    return html`<figure className="fig"><div className="fig-stage">
      <table className="a11-tbl"><thead><tr><th>Sorted list</th><th>Search</th><th>Insertion</th><th>Deletion</th></tr></thead><tbody>
        <tr><td>with arrays</td><td className="a11-good">O(log n)</td><td>O(n)</td><td>O(n)</td></tr>
        <tr><td>with linked list</td><td>O(n)</td><td>O(n)</td><td>O(n)</td></tr>
        <tr><td>with RB trees</td><td className="a11-good">O(log n)</td><td className="a11-good">O(log n)</td><td className="a11-good">O(log n)</td></tr></tbody></table>
      <${Tabs} opts=${[[3, 'n = 1,000'], [6, 'n = 10⁶'], [9, 'n = 10⁹']]} v=${e} set=${setE} />
      <p className="a11-cnt">lg n ≈ <b>${lg}</b> steps, against n = <b>${f(n)}</b> steps.</p></div>
      <${Cap} en=${`All red-black tree operations work in O(height), and the height is O(log n): with n = ${f(n)} keys an RB tree needs about ${lg} steps (at most 2 lg(n + 1) ≈ ${Math.ceil(2 * Math.log2(n + 1))} levels), a linked list up to ${f(n)}.`} /></figure>`;
  }

  window.FIGS = Object.assign(window.FIGS || {}, { 'ag-11-ins': InsertEx, 'ag-11-lrot': LeftRot, 'ag-11-exam1': InsSim('e1'), 'ag-11-exam2': InsSim('e2'), 'ag-11-delex': DelEx, 'ag-11-fixcases': FixCases, 'ag-11-delsim': DelSim, 'ag-11-eff': Eff });
})();
/* ── part L13 ── */
// Algorithms visuals, Lecture 13 (Skip lists): perfect skip lists (slides 4-6), Find 71 and Find 96 (7-10), randomized skip list with insert and delete 87 (12-17), backwards analysis (19-22). Every label and number comes from the slides.
(function () {
  const { useState, useEffect, useRef, useMemo } = React;
  const { html, useSteps, Cap, Bar, pop, calm, useClock, useFit, sec } = window.FIGKIT;
  const CSS = `
.a13-sl{ display:block; width:100%; height:auto; max-width:560px; margin:0 auto; }
.a13-tabs{ display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin:0 0 10px; }
.a13-tabs .fig-btn[aria-pressed="true"]{ background:var(--fig-s); color:#fff; border-color:transparent; }
.a13-in{ display:flex; flex-wrap:wrap; gap:6px; align-items:center; justify-content:center; margin:0 0 8px; }
.a13-in input{ font:inherit; min-width:0; flex:1 1 110px; max-width:160px; padding:6px 8px; border:1px solid var(--line); border-radius:8px; background:var(--paper); color:var(--ink); }
.a13-err{ color:var(--pen); font-size:.88rem; text-align:center; margin:0 0 8px; }
.a13-of{ font-size:.85rem; color:var(--graphite); }
.a13-eq{ text-align:center; font-size:.95rem; line-height:1.6; margin:8px 0 0; color:var(--ink); }
.a13-eq .a13-on{ font-weight:700; }
.a13-tbl{ margin:8px auto 0; border-collapse:collapse; font-size:.88rem; }
.a13-tbl td, .a13-tbl th{ border:1px solid var(--line); padding:3px 8px; text-align:center; }
.a13-coins{ text-align:center; font-size:.9rem; margin:6px 0 0; color:var(--ink); }
`;
  if (!document.getElementById('a13-css')) { const s = document.createElement('style'); s.id = 'a13-css'; s.textContent = CSS; document.head.appendChild(s); }
  const Tabs = ({ opts, v, set }) => html`<div className="a13-tabs" role="group">${opts.map(([k, t]) => html`<button key=${k} className="fig-btn" aria-pressed=${String(v === k)} onClick=${() => set(k)}>${t}</button>`)}</div>`;
  const SBar = ({ steps, i, ctl }) => steps.length <= 11 ? html`<${Bar} steps=${steps} i=${i} ctl=${ctl} />` : html`<div className="fig-bar">
    <span className="a13-of">step ${i + 1} of ${steps.length}</span><span className="grow"></span>
    <button className="fig-btn" onClick=${() => ctl.go(Math.max(0, i - 1))} disabled=${i === 0} aria-label="Previous step">‹ Back</button>
    <button className="fig-btn" onClick=${() => ctl.go(Math.min(steps.length - 1, i + 1))} disabled=${i === steps.length - 1} aria-label="Next step">Next ›</button>
    <button className="fig-btn" onClick=${ctl.replay}>↻ Replay</button></div>`;

  // lists from the slides: [key, number of levels]
  const L = a => a.map(([k, h]) => ({ k, h }));
  const PERF = L([[2, 3], [10, 1], [15, 2], [16, 1], [31, 4], [71, 1], [96, 2]]);
  const FINDL = L([[2, 3], [10, 1], [15, 2], [16, 1], [31, 4], [71, 1], [76, 2], [87, 1], [91, 3], [96, 1]]);
  const RAND = L([[2, 2], [10, 1], [15, 1], [16, 4], [31, 1], [71, 3], [86, 1], [89, 2], [91, 3], [96, 1]]);
  const levelsOf = list => Math.max(4, ...list.map(o => o.h));
  // the search of the slides: k ≥ next key → go right, k < next key → go down a level; remembers the last node visited on each level
  function search(list, k, levels) {
    const S = [], upd = []; let c = -1, l = levels - 1, trail = [[-1, l]];
    const nm = j => j < 0 ? 'the header' : j >= list.length ? 'the sentinel' : list[j].k;
    for (;;) {
      let nx = c + 1; while (nx < list.length && list[nx].h <= l) nx++;
      const nk = nx >= list.length ? '∞' : list[nx].k, less = nx >= list.length || k < list[nx].k;
      if (less) {
        upd[l] = c;
        if (l === 0) { S.push({ c, l, cmp: [c, nx, l], trail: trail.slice(), found: false, upd: upd.slice(), en: `${k} &lt; ${nk === '∞' ? 'Inf' : nk}? <b>Yes</b>, and we are on the bottom level: ${k} is not in the list; it would go right after ${nm(c)}.` }); return { S, upd, found: false }; }
        S.push({ c, l, cmp: [c, nx, l], trail: trail.slice(), en: `At ${nm(c)}, level ${l}: ${k} &lt; ${nk === '∞' ? 'Inf' : nk}? <b>Yes</b>: go <b>down</b> a level.` });
        l--; trail.push([c, l]);
      } else {
        S.push({ c, l, cmp: [c, nx, l], trail: trail.slice(), en: `At ${nm(c)}, level ${l}: ${k} &lt; ${nk}? <b>No</b> (${k} ≥ ${nk}): go <b>right</b> to ${nk}.` });
        c = nx; trail.push([c, l]);
        if (list[c].k === k) { S.push({ c, l, cmp: null, trail: trail.slice(), found: true, en: `k = key: <b>found ${k}</b> (on level ${l}).` }); return { S, upd, found: c }; }
      }
    }
  }
  // the drawing: header (green), towers, sentinel (red); each level's forward pointer is an arrow
  function SL({ list, levels, cur = null, trail = [], cmp = null, hot = null, fade = null, show = null, label = 'Skip list' }) {
    const n = list.length, BW = 32, G = 9, P = BW + G, RH = 30, HW = 16;
    const W = 10 + HW + G + n * P + HW + 10, sc = 268 / W, fs = Math.max(16, 12.2 / sc);
    const top = 14, base = top + levels * RH, H = base + 14;
    const lv = show == null ? levels : show;
    const xl = j => j < 0 ? 10 : j >= n ? 10 + HW + G + n * P : 10 + HW + G + j * P, wd = j => j < 0 || j >= n ? HW : BW;
    const yl = l => base - l * RH - RH / 2, hOf = j => j < 0 || j >= n ? levels : list[j].h;
    const arrows = [];
    for (let l = 0; l < Math.min(lv, levels); l++) {
      let a = -1;
      for (let j = 0; j <= n; j++) { if (j < n && list[j].h <= l) continue; const on = cmp && cmp[2] === l && cmp[0] === a && cmp[1] === j;
        arrows.push(html`<path key=${l + '-' + a} d=${`M${xl(a) + wd(a) - 3} ${yl(l)} L${xl(j) - 1} ${yl(l)}`} stroke=${on ? 'var(--fig-k)' : 'var(--ink)'} strokeWidth=${on ? 3 : 1.6} markerEnd=${on ? 'url(#a13-ah)' : 'url(#a13-a)'} />`, html`<circle key=${'d' + l + '-' + a} cx=${xl(a) + wd(a) - 3} cy=${yl(l)} r="2.4" style=${{ fill: 'var(--ink)' }} />`); a = j; }
    }
    const tower = j => { const h = Math.min(hOf(j), lv), x = xl(j), w = wd(j), col = j < 0 ? 'var(--ok)' : j >= n ? '#d23c3c' : list[j].k === hot ? 'var(--fig-k)' : 'var(--ink)';
      return html`<g key=${'t' + j} style=${{ opacity: fade != null && j >= 0 && j < n && list[j].k === fade ? .25 : 1, transition: 'opacity .5s' }}>
        <rect x=${x} y=${base - h * RH} width=${w} height=${h * RH} fill=${j >= 0 && j < n && list[j].k === hot ? 'color-mix(in srgb, var(--fig-k) 18%, var(--paper))' : 'var(--paper)'} stroke=${col} strokeWidth=${j < 0 || j >= n || list[j].k === hot ? 2.4 : 1.4} />
        ${Array.from({ length: h - 1 }, (_, m) => html`<line key=${m} x1=${x} x2=${x + w} y1=${base - (m + 1) * RH} y2=${base - (m + 1) * RH} stroke=${col} strokeWidth="1" />`)}
        ${j >= 0 && j < n ? html`<text x=${x + (w - 6) / 2} y=${base - RH / 2} dy=".36em" textAnchor="middle" fontSize=${fs} fontWeight="600">${list[j].k}</text>` : null}</g>`; };
    const pt = ([j, l]) => [xl(j) + (j >= 0 && j < n ? 9 : wd(j) / 2), yl(l)];
    const tr = trail.length > 1 ? trail.map(pt).map(p => p.join(' ')).join(' L') : null;
    return html`<svg className="a13-sl" viewBox=${`0 0 ${W} ${H}`} role="img" aria-label=${label}>
      <defs><marker id="a13-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" style=${{ fill: 'var(--ink)' }} /></marker>
        <marker id="a13-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0 L10 5 L0 10 z" style=${{ fill: 'var(--fig-k)' }} /></marker></defs>
      ${[-1, ...list.map((_, j) => j), n].map(tower)}${arrows}
      ${tr ? html`<path d=${'M' + tr} fill="none" stroke="#e8452c" strokeWidth="3" strokeDasharray="5 4" strokeLinejoin="round" />` : null}
      ${cur ? html`<circle cx=${pt(cur)[0]} cy=${pt(cur)[1]} r="6" fill="#e8452c" stroke="var(--ink)" strokeWidth="1.2" />` : null}
    </svg>`;
  }

  // slides 13.4-13.6: a perfect skip list, level by level
  function Perfect() {
    const steps = [
      { show: 1, en: '<b>Level 0</b>: all keys in sorted order, 2, 10, 15, 16, 31, 71, 96, from the <b>header</b> (green) to the <b>sentinel</b> (red): an ordinary sorted linked list.' },
      { show: 2, en: '<b>Level 1</b>: each higher level contains <b>1/2</b> of the elements of the level below it: 2, 15, 31, 96.' },
      { show: 3, en: '<b>Level 2</b>: half again: 2 and 31.' },
      { show: 4, en: '<b>Level 3</b>: only 31. So there are <b>O(log n)</b> levels, and the header and sentinel nodes are in every level.' },
      { show: 4, en: 'Nodes are of variable size: each contains between 1 and O(log n) pointers (pointers point to the start of each node; the picture draws them horizontally). Called <b>skip lists</b> because the higher level lists let you skip over many items.' }
    ];
    const [i, ctl] = useSteps(steps.length, 2400), st = steps[i];
    return html`<figure className="fig"><div className="fig-stage"><${SL} list=${PERF} levels=${4} show=${st.show} label="Perfect skip list with keys 2, 10, 15, 16, 31, 71, 96" /></div>
      <${Cap} en=${st.en} /><${SBar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  // slides 13.7-13.10: Find 71 and Find 96, or any key
  function FindRun({ k }) {
    const steps = useMemo(() => { const r = search(FINDL, k, 4), S = r.S.map(s => ({ ...s }));
      if (k === 71) S.forEach(s => { if (s.cmp && s.l === 1 && s.c === 4) s.en += ' (The slide writes "71 &lt; 96?", but the next key on level 1 after 31 is 76.)'; });
      if (k === 96) S.forEach(s => { if (s.cmp && s.l === 0 && s.c === 8) s.en += ' (The slide writes this test as "96 ≤ 96?".)'; });
      S.push({ ...S[S.length - 1], en: `Search time: O(log n) levels, because the number of items is cut in half at each level, and at most 2 nodes are visited per level (if you visit more, you could have done it one level higher up). So search takes <b>O(log n)</b>. This search made ${r.S.length} comparisons.` });
      return [{ c: -1, l: 3, trail: [], en: `<b>Find ${k}</b>: start at the top level of the header. Rules: if k = key, done! If k &lt; next key, go down a level. If k ≥ next key, go right.` }, ...S]; }, [k]);
    const [i, ctl] = useSteps(steps.length, 1900), st = steps[i];
    return html`<div className="fig-stage" style=${{ paddingTop: '4px' }}><${SL} list=${FINDL} levels=${4} cur=${[st.c, st.l]} trail=${st.trail} cmp=${st.cmp} hot=${st.found ? k : null} label=${'Searching for ' + k} /></div>
      <${Cap} en=${st.en} /><${SBar} steps=${steps} i=${i} ctl=${ctl} />`;
  }
  function Find() {
    const [k, setK] = useState(71), [txt, setTxt] = useState(''), [mode, setMode] = useState(71);
    const v = txt.trim(), bad = v && (!/^\d{1,3}$/.test(v) || +v < 1 || +v > 999) ? 'Type a whole number from 1 to 999.' : '';
    return html`<figure className="fig"><div className="fig-stage" style=${{ paddingBottom: '4px' }}>
      <${Tabs} opts=${[[71, 'Find 71'], [96, 'Find 96'], ['own', 'Your key']]} v=${mode} set=${m => { setMode(m); if (m !== 'own') setK(m); }} />
      ${mode === 'own' ? html`<div className="a13-in"><input aria-label="Key to find" inputMode="numeric" placeholder="e.g. 80" value=${txt} onInput=${e => setTxt(e.target.value)} /><button className="fig-btn solid" disabled=${!v || !!bad} onClick=${() => setK(+v)}>Find</button></div>${bad ? html`<p className="a13-err">${bad}</p>` : null}` : null}</div>
      <${FindRun} key=${k} k=${k} /></figure>`;
  }

  // slides 13.12-13.17: the randomized skip list; insert 87 (heads, heads, tails), delete 87; or your own
  function insertSteps(list, k, flips) {
    const levels = levelsOf(list), r = search(list, k, levels), S = r.S.map(s => ({ ...s, list }));
    if (r.found !== false) { S.push({ ...S[S.length - 1], en: `${k} is already in the list: nothing to insert.` }); return { S, list }; }
    let h = 1; while (flips[h - 1] === 'H') h++;
    const at = r.upd[0] + 1, nl = [...list.slice(0, at), { k, h }, ...list.slice(at)], nm = j => j < 0 ? 'the header' : list[j].k;
    const L2 = Math.max(levels, h), withH = m => nl.map(o => o.k === k ? { k, h: m } : o);
    S.push({ list: withH(1), levels: L2, hot: k, trail: [], en: `<b>Insert node ${k} in level 0</b>, right after the last visited node ${nm(r.upd[0])}. Then let i = 1.`, flips: [] });
    for (let i = 1; i <= h; i++) {
      const f = flips[i - 1], lastV = r.upd[i] != null ? nm(r.upd[i]) : 'the header';
      S.push({ list: withH(f === 'H' ? i + 1 : h), levels: L2, hot: k, trail: [], flips: flips.slice(0, i), en: f === 'H' ? `FLIP() = <b>heads</b>: insert the node into <b>level ${i}</b>, just a linked-list insertion after the last visited node in level ${i} (${lastV}); i++.` : `FLIP() = <b>tails</b>: stop. ${k} has ${h} level${h > 1 ? 's' : ''} (0${h > 1 ? ' to ' + (h - 1) : ''}).` });
    }
    return { S, list: nl };
  }
  function deleteSteps(list, k) {
    const levels = levelsOf(list), r = search(list, k, levels), S = r.S.map(s => ({ ...s, list }));
    if (r.found === false) { S.push({ ...S[S.length - 1], en: S[S.length - 1].en + ` Nothing to delete.` }); return { S, list }; }
    const h = list[r.found].h, nl = list.filter(o => o.k !== k);
    S.push({ list, levels, fade: k, trail: [], en: `<b>Delete ${k}</b>: splice it out of every level in which it appears (levels 0${h > 1 ? ' to ' + (h - 1) : ''}): each predecessor on that level now points past it.` });
    S.push({ list: nl, levels: levelsOf(nl), trail: [], en: `${k} is gone; every level is again a sorted linked list.` });
    return { S, list: nl };
  }
  const coinFlips = () => { const f = []; while (f.length < 4) { const c = Math.random() < .5 ? 'H' : 'T'; f.push(c); if (c === 'T') break; } if (f[f.length - 1] === 'H') f.push('T'); return f; };
  function OpRun({ op }) {
    const [i, ctl] = useSteps(op.S.length, 1900), st = op.S[i];
    return html`<div className="fig-stage" style=${{ paddingTop: '4px' }}><${SL} list=${st.list} levels=${st.levels || levelsOf(st.list)} cur=${st.c != null ? [st.c, st.l] : null} trail=${st.trail || []} cmp=${st.cmp} hot=${st.hot || (st.found ? op.k : null)} fade=${st.fade} label=${op.title} />
      ${st.flips ? html`<p className="a13-coins">coin flips: ${st.flips.map(f => f === 'H' ? 'heads' : 'tails').join(', ') || 'none yet'}</p>` : null}</div>
      <${Cap} en=${st.en} /><${SBar} steps=${op.S} i=${i} ctl=${ctl} />`;
  }
  function Randomized() {
    const [mode, setMode] = useState('ins'), [list, setList] = useState(RAND), [op, setOp] = useState(null), [n, setN] = useState(0), [txt, setTxt] = useState('');
    const show = useMemo(() => {
      if (mode === 'ins') { const r = insertSteps(RAND, 87, ['H', 'H', 'T']); return { title: 'Insert 87', k: 87, S: [{ list: RAND, trail: [], en: '<b>Randomized skip list</b>: each node is promoted to the next higher level with probability 1/2, so we expect 1/2 the nodes at level 1, 1/4 at level 2, …, the same as a perfect skip list on average. <b>Insert 87</b>: first find where it goes.' }, ...r.S.map(s => ({ ...s }))] }; }
      if (mode === 'del') { const with87 = insertSteps(RAND, 87, ['H', 'H', 'T']).list, r = deleteSteps(with87, 87); return { title: 'Delete 87', k: 87, S: [{ list: with87, trail: [], en: '<b>Delete 87</b> from the list after the insertion: first find it.' }, ...r.S] }; }
      return op;
    }, [mode, op]);
    const v = txt.trim(), bad = v && (!/^\d{1,2}$/.test(v) || +v < 1) ? 'Type a whole number from 1 to 99.' : '';
    const doIns = () => { if (list.some(o => o.k === +v)) { setOp({ title: 'Insert', k: +v, S: [{ list, trail: [], en: `${v} is already in the list.` }] }); setN(x => x + 1); return; } if (list.length >= 11) { setOp({ title: 'Insert', k: +v, S: [{ list, trail: [], en: 'At most 11 keys here, so the list fits a phone: delete one first.' }] }); setN(x => x + 1); return; }
      const r = insertSteps(list, +v, coinFlips()); setOp({ title: 'Insert ' + v, k: +v, S: r.S }); setList(r.list); setN(x => x + 1); };
    const doDel = () => { const r = deleteSteps(list, +v); setOp({ title: 'Delete ' + v, k: +v, S: r.S }); setList(r.list); setN(x => x + 1); };
    const own = mode === 'own';
    const cur = own ? (op || { title: 'Your list', k: null, S: [{ list, trail: [], en: '<b>Your turn</b>: insert a key (the coins are flipped at random, so the same inserts can give different structures) or delete one. The list starts as the slides\' randomized skip list.' }] }) : show;
    return html`<figure className="fig"><div className="fig-stage" style=${{ paddingBottom: '4px' }}>
      <${Tabs} opts=${[['ins', 'Insert 87'], ['del', 'Delete 87'], ['own', 'Try your own']]} v=${mode} set=${m => { setMode(m); setN(x => x + 1); }} />
      ${own ? html`<div className="a13-in"><input aria-label="Key" inputMode="numeric" placeholder="key" value=${txt} onInput=${e => setTxt(e.target.value)} />
        <button className="fig-btn solid" disabled=${!v || !!bad} onClick=${doIns}>Insert</button><button className="fig-btn" disabled=${!v || !!bad} onClick=${doDel}>Delete</button>
        <button className="fig-btn" onClick=${() => { setList(RAND); setOp(null); setN(x => x + 1); }}>↻ Reset</button></div>${bad ? html`<p className="a13-err">${bad}</p>` : null}` : null}</div>
      <${OpRun} key=${mode + n} op=${cur} /></figure>`;
  }

  // slides 13.19-13.22: expected level sizes and the backwards analysis on the path to 86
  function Backwards() {
    const fwd = search(RAND, 86, 4), path = fwd.S[fwd.S.length - 1].trail;
    const rev = [[6, 0], [5, 0], [5, 1], [5, 2], [3, 2], [3, 3], [-1, 3]];
    const mv = ['', 'left', 'up', 'up', 'left', 'up', 'left'];
    const eq = ['C(j) = 1 + 0.5 C(j−1) + 0.5 C(j)', '2C(j) = 2 + C(j−1) + C(j)', 'C(j) = 2 + C(j−1)', 'C(j) = 2j'];
    const steps = [
      { tbl: 1, en: 'Expected number of levels = O(log n): E[# nodes at level 1] = n/2, at level 2 = n/4, …, at level log n = 1. For the slides\' list (n = 10) compare with what the coins gave. We still need to show that the number of steps on each level is small.' },
      { trail: path, cur: [6, 0], en: '<b>Backwards analysis</b>: consider the path you took to find k = 86 (dashed), and walk it in <b>reverse</b>, from 86 back to the top of the header.' },
      ...rev.slice(1).map((p, j) => ({ trail: rev.slice(0, j + 2), cur: p, en: `Reverse step ${j + 1}: move <b>${mv[j + 1]}</b>${mv[j + 1] === 'up' ? ` (this node has a higher level, and you always move up if you can, because a find enters a node from its topmost level)` : ` (this node has no higher level)`}.` + (j === 5 ? ' Back at the header: 6 steps to climb 3 levels, 2 per level.' : '') })),
      { trail: rev, cur: [-1, 3], eq: 0, en: 'At each step of the reverse walk the probability that you can move up is <b>0.5</b>. Make one step, then either C(j−1) more steps if it went up [prob 0.5] or C(j) more if it went left [prob 0.5]: <b>C(j) = 1 + 0.5C(j−1) + 0.5C(j)</b>.' },
      { trail: rev, cur: [-1, 3], eq: 2, en: 'Multiply by 2: 2C(j) = 2 + C(j−1) + C(j), so <b>C(j) = 2 + C(j−1)</b>: the expected number of steps at each level is 2.' },
      { trail: rev, cur: [-1, 3], eq: 3, en: 'Expanding gives <b>C(j) = 2j</b>. Since there are O(log n) levels, a search takes <b>O(log n)</b> steps, expected.' }
    ];
    const [i, ctl] = useSteps(steps.length, 2500), st = steps[i];
    const cnt = l => RAND.filter(o => o.h > l).length;
    return html`<figure className="fig"><div className="fig-stage"><${SL} list=${RAND} levels=${4} cur=${st.cur || null} trail=${st.trail || []} label="Randomized skip list with the reversed search path to 86" />
      ${st.tbl ? html`<table className="a13-tbl"><thead><tr><th>level</th><th>expected n/2<sup>i</sup></th><th>in the slide</th></tr></thead><tbody>${[1, 2, 3].map(l => html`<tr key=${l}><td>${l}</td><td>${10 / Math.pow(2, l)}</td><td>${cnt(l)}</td></tr>`)}</tbody></table>` : null}
      ${st.eq != null ? html`<div className="a13-eq">${eq.map((e, k) => k > st.eq ? null : html`<div key=${k} className=${k === st.eq ? 'a13-on' : ''}>${e}</div>`)}</div>` : null}</div>
      <${Cap} en=${st.en} /><${SBar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  window.FIGS = Object.assign(window.FIGS || {}, { 'ag-13-perfect': Perfect, 'ag-13-find': Find, 'ag-13-random': Randomized, 'ag-13-back': Backwards });
})();
