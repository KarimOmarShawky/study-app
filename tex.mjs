// Turns the LaTeX math in course text (and Markdown `code` spans) ($…$ inline, $$…$$ display, \$ for a dollar sign) into plain HTML
// (Θ, ≤, <sup>, <sub>, stacked fractions, matrices), so the page needs no math library. Used by build.mjs.
// texToHtml(s) converts one string; unknown commands are collected in texUnknown so the build can report them.

const SYM = {
  Theta: 'Θ', Omega: 'Ω', Phi: 'Φ', Delta: 'Δ', Gamma: 'Γ', Lambda: 'Λ', Pi: 'Π', Sigma: 'Σ', Psi: 'Ψ',
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', varepsilon: 'ε', theta: 'θ', lambda: 'λ', mu: 'μ',
  pi: 'π', rho: 'ρ', sigma: 'σ', tau: 'τ', phi: 'φ', varphi: 'φ', omega: 'ω', psi: 'ψ', chi: 'χ', eta: 'η', zeta: 'ζ', kappa: 'κ', nu: 'ν', xi: 'ξ',
  le: '≤', leq: '≤', ge: '≥', geq: '≥', ne: '≠', neq: '≠', ll: '≪', gg: '≫', approx: '≈', equiv: '≡', sim: '∼', cong: '≅', propto: '∝',
  to: '→', rightarrow: '→', leftarrow: '←', gets: '←', leftrightarrow: '↔', Rightarrow: '⇒', Leftarrow: '⇐', implies: '⟹', iff: '⟺',
  Leftrightarrow: '⇔', mapsto: '↦', leadsto: '⇝', uparrow: '↑', downarrow: '↓', longrightarrow: '⟶',
  in: '∈', notin: '∉', subset: '⊂', subseteq: '⊆', supset: '⊃', supseteq: '⊇', cup: '∪', cap: '∩', emptyset: '∅', varnothing: '∅',
  setminus: '∖', forall: '∀', exists: '∃', neg: '¬', lnot: '¬', land: '∧', wedge: '∧', lor: '∨', vee: '∨', oplus: '⊕',
  infty: '∞', cdot: '·', cdots: '⋯', ldots: '…', dots: '…', times: '×', div: '÷', pm: '±', mp: '∓', ast: '∗', star: '⋆', circ: '∘',
  lfloor: '⌊', rfloor: '⌋', lceil: '⌈', rceil: '⌉', langle: '⟨', rangle: '⟩', vert: '|', mid: '∣', parallel: '∥',
  partial: '∂', nabla: '∇', prime: '′', angle: '∠', triangle: '△', square: '□', checkmark: '✓', top: '⊤', bot: '⊥',
  sum: '∑', prod: '∏', int: '∫'
};
const FN = { lg: 'lg', log: 'log', ln: 'ln', max: 'max', min: 'min', deg: 'deg', exp: 'exp', sin: 'sin', cos: 'cos', gcd: 'gcd', lcm: 'lcm', det: 'det', arg: 'arg', sup: 'sup', inf: 'inf', lim: 'lim', Pr: 'Pr', bmod: 'mod', mod: 'mod' };
const SPACE = { ',': ' ', ';': ' ', ':': ' ', '!': '', ' ': ' ', quad: ' ', qquad: '  ', enspace: ' ' };
const BIG = new Set(['sum', 'prod', 'int']);
export const texUnknown = new Set();

const esc = c => c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '&' ? '&amp;' : c;

// tokens: {t:'cmd', v}, {t:'ch', v}, {t:'{'}, {t:'}'}, {t:'^'}, {t:'_'}, {t:'&'}, {t:'nl'} (\\)
function lex(s) {
  const out = [];
  for (let i = 0; i < s.length;) {
    const c = s[i];
    if (c === '\\') {
      const n = s[i + 1];
      if (n === '\\') { out.push({ t: 'nl' }); i += 2; continue; }
      const m = /^[A-Za-z]+/.exec(s.slice(i + 1));
      if (m) { out.push({ t: 'cmd', v: m[0] }); i += 1 + m[0].length; continue; }
      out.push({ t: 'cmd', v: n }); i += 2; continue;
    }
    if (c === '{' || c === '}' || c === '^' || c === '_' || c === '&') { out.push({ t: c }); i++; continue; }
    // HTML entities and tags already in the text pass through whole
    if (c === '<' && /^<\/?[a-z][^<>]*>/i.test(s.slice(i))) { const m = /^<\/?[a-z][^<>]*>/i.exec(s.slice(i)); out.push({ t: 'raw', v: m[0] }); i += m[0].length; continue; }
    if (c === '&' ) { out.push({ t: '&' }); i++; continue; }
    out.push({ t: 'ch', v: c }); i++;
  }
  return out;
}

function Parser(toks) { this.k = toks; this.i = 0; }
Parser.prototype.peek = function () { return this.k[this.i]; };
Parser.prototype.next = function () { return this.k[this.i++]; };
// one argument: a {group} or a single token
Parser.prototype.arg = function (mode) {
  let t = this.peek();
  while (t && t.t === 'ch' && t.v === ' ') { this.i++; t = this.peek(); }
  if (!t) return '';
  if (t.t === '{') { this.i++; const r = this.seq(mode, '}'); this.i++; return r; }
  return this.atom(mode);
};
// a raw group's text, for \text{…} and environment names
Parser.prototype.rawArg = function () {
  let t = this.peek();
  while (t && t.t === 'ch' && t.v === ' ') { this.i++; t = this.peek(); }
  if (!t || t.t !== '{') return '';
  this.i++; let depth = 1, s = '';
  while (this.i < this.k.length) {
    const x = this.next();
    if (x.t === '{') depth++;
    else if (x.t === '}' && --depth === 0) break;
    s += x.t === 'ch' ? esc(x.v) : x.t === 'cmd' ? (SYM[x.v] || (/^[^A-Za-z]$/.test(x.v) ? esc(x.v) : '')) : x.t === 'raw' ? x.v : x.t === '{' || x.t === '}' ? '' : x.t === '&' ? '&amp;' : x.t === '^' ? '^' : x.t === '_' ? '_' : '';
  }
  return s;
};
// scripts after a base
Parser.prototype.scripts = function (base, mode, big) {
  let sub = null, sup = null;
  for (;;) {
    const t = this.peek();
    if (t && t.t === '_') { this.i++; sub = this.arg(mode); continue; }
    if (t && t.t === '^') { this.i++; sup = this.arg(mode); continue; }
    if (t && t.t === 'cmd' && t.v === 'limits') { this.i++; continue; }
    break;
  }
  if (sub == null && sup == null) return base;
  if (big && mode === 'display') return `<span class="m-op"><span class="m-ol">${sup || ''}</span><span class="m-ob">${base}</span><span class="m-ol">${sub || ''}</span></span>`;
  return base + (sub != null ? `<sub>${sub}</sub>` : '') + (sup != null ? `<sup>${sup}</sup>` : '');
};
Parser.prototype.atom = function (mode) {
  const t = this.next();
  if (!t) return '';
  if (t.t === 'ch') {
    if (/[A-Za-z]/.test(t.v)) { let w = t.v; while (this.peek() && this.peek().t === 'ch' && /[A-Za-z]/.test(this.peek().v)) w += this.next().v; return this.scripts(`<i>${w}</i>`, mode); }
    if (t.v === ' ' || t.v === '\n' || t.v === '\t') { while (this.peek() && this.peek().t === 'ch' && /\s/.test(this.peek().v)) this.i++; return ' '; }
    if (t.v === '~') return ' ';
    if (t.v === "'") return this.scripts('′', mode);
    if (t.v === '-') return this.scripts('−', mode);
    return this.scripts(esc(t.v), mode);
  }
  if (t.t === 'raw') return t.v;
  if (t.t === '{') { const r = this.seq(mode, '}'); this.i++; return this.scripts(r, mode); }
  if (t.t === '^' || t.t === '_') { this.i--; return this.scripts('', mode); }
  if (t.t === '&') return '&amp;';
  if (t.t === 'nl') return '<br>';
  if (t.t === '}') return '';
  const v = t.v;
  if (v in SPACE) return SPACE[v];
  if (v === '&') return '&amp;';
  if (v === '$' || v === '%' || v === '#' || v === '_' || v === '{' || v === '}' || v === '|') return this.scripts(v === '|' ? '‖' : v, mode);
  if (v in SYM) {
    const s = SYM[v];
    if (/^(le|leq|ge|geq|ne|neq|approx|equiv|to|rightarrow|leftarrow|gets|leftrightarrow|Rightarrow|implies|iff|in|notin|subseteq|subset|cup|cap|times|cdot|ll|gg|leadsto|mapsto|land|lor|wedge|vee|setminus|sim|pm)$/.test(v)) return ` ${s} `;
    return this.scripts(s, mode, BIG.has(v));
  }
  if (v in FN) {
    const w = v === 'bmod' ? ' mod ' : FN[v] + (/^(max|min|lim|sup|inf)$/.test(v) ? '' : ' ');
    return ' ' + this.scripts(`<span class="m-fn">${w.trim()}</span>`, mode, /^(max|min|lim)$/.test(v)) + (/^(max|min|lim|sup|inf)$/.test(v) ? '' : ' ');
  }
  if (v === 'pmod') return ` (mod ${this.arg(mode)})`;
  if (v === 'text' || v === 'textrm' || v === 'mathrm' || v === 'operatorname' || v === 'textnormal' || v === 'mbox') return this.scripts(`<span class="m-tx">${this.rawArg()}</span>`, mode);
  if (v === 'textit' || v === 'mathit') return this.scripts(`<i>${this.arg(mode)}</i>`, mode);
  if (v === 'mathbf' || v === 'textbf' || v === 'boldsymbol' || v === 'bm') return this.scripts(`<b>${this.arg(mode)}</b>`, mode);
  if (v === 'texttt' || v === 'mathtt') return this.scripts(`<code>${this.rawArg()}</code>`, mode);
  if (v === 'mathcal' || v === 'mathbb' || v === 'mathsf') return this.scripts(this.arg(mode), mode);
  if (v === 'frac' || v === 'dfrac' || v === 'tfrac') { const a = this.arg(mode), b = this.arg(mode); return this.scripts(`<span class="m-fr"><span>${a}</span><span>${b}</span></span>`, mode); }
  if (v === 'binom') { const a = this.arg(mode), b = this.arg(mode); return this.scripts(`(<span class="m-fr m-bn"><span>${a}</span><span>${b}</span></span>)`, mode); }
  if (v === 'sqrt') { const a = this.arg(mode); return this.scripts(`√<span class="m-sq">${a}</span>`, mode); }
  if (v === 'hat' || v === 'widehat') { const a = this.arg(mode); return this.scripts(a.replace(/^(<i>)?([^<])/, (m, i, c) => (i || '') + c + '̂'), mode); }
  if (v === 'bar' || v === 'overline') { const a = this.arg(mode); return this.scripts(`<span class="m-ov">${a}</span>`, mode); }
  if (v === 'tilde') { const a = this.arg(mode); return this.scripts(a.replace(/^(<i>)?([^<])/, (m, i, c) => (i || '') + c + '̃'), mode); }
  if (v === 'vec') { const a = this.arg(mode); return this.scripts(a.replace(/^(<i>)?([^<])/, (m, i, c) => (i || '') + c + '⃗'), mode); }
  if (v === 'underline') return this.scripts(`<u>${this.arg(mode)}</u>`, mode);
  if (v === 'stackrel' || v === 'overset') { const top = this.arg(mode), base = this.arg(mode); return ` <span class="m-op"><span class="m-ol">${top}</span><span class="m-ob">${base.trim()}</span><span class="m-ol"></span></span> `; }
  if (v === 'underset') { const bot = this.arg(mode), base = this.arg(mode); return ` <span class="m-op"><span class="m-ol"></span><span class="m-ob">${base.trim()}</span><span class="m-ol">${bot}</span></span> `; }
  if (v === 'left' || v === 'right' || v === 'big' || v === 'Big' || v === 'bigg' || v === 'Bigg' || v === 'bigl' || v === 'bigr' || v === 'Bigl' || v === 'Bigr') {
    const d = this.next(); if (!d) return '';
    if (d.t === 'ch') return d.v === '.' ? '' : esc(d.v);
    if (d.t === 'cmd') return d.v === '{' || d.v === '}' || d.v === '|' ? (d.v === '|' ? '‖' : d.v) : SYM[d.v] || '';
    return '';
  }
  if (v === 'begin') {
    const env = this.rawArg();
    if (/^array$/.test(env)) this.rawArg();
    const rows = [[]]; let cell = '';
    for (;;) {
      const x = this.peek(); if (!x) break;
      if (x.t === 'cmd' && x.v === 'end') { this.i++; this.rawArg(); break; }
      if (x.t === '&') { this.i++; rows[rows.length - 1].push(cell.trim()); cell = ''; continue; }
      if (x.t === 'nl') { this.i++; rows[rows.length - 1].push(cell.trim()); cell = ''; rows.push([]); continue; }
      cell += this.atom(mode);
    }
    rows[rows.length - 1].push(cell.trim());
    if (rows.length > 1 && rows[rows.length - 1].every(c => !c)) rows.pop();
    const cols = Math.max(...rows.map(r => r.length));
    const kind = /^(cases)$/.test(env) ? 'cs' : /^(bmatrix)$/.test(env) ? 'bm' : /^(vmatrix)$/.test(env) ? 'vm' : /^(pmatrix)$/.test(env) ? 'pm' : 'mx';
    return this.scripts(`<span class="m-mx m-${kind}" style="grid-template-columns:repeat(${cols},auto)">${rows.map(r => Array.from({ length: cols }, (_, j) => `<span>${r[j] || ''}</span>`).join('')).join('')}</span>`, mode);
  }
  if (v === 'not') { const a = this.atom(mode); return a.replace(/[=∈⊂⊆]/, c => ({ '=': '≠', '∈': '∉', '⊂': '⊄', '⊆': '⊈' })[c]); }
  if (v === 'displaystyle' || v === 'textstyle' || v === 'scriptstyle' || v === 'limits' || v === 'nolimits' || v === 'nonumber' || v === 'qed') return '';
  texUnknown.add(v);
  return esc(v);
};
Parser.prototype.seq = function (mode, stop) {
  let s = '';
  while (this.i < this.k.length) {
    const t = this.peek();
    if (stop && t.t === stop) break;
    s += this.atom(mode);
  }
  return s;
};

function math(src, display) {
  const p = new Parser(lex(src));
  const body = p.seq(display ? 'display' : 'inline').replace(/ {2,}/g, ' ').replace(/^ | $/g, '').replace(/\( /g, '(').replace(/ \)/g, ')');
  return display ? `<span class="m m-d">${body}</span>` : `<span class="m">${body}</span>`;
}

// `code` spans (Markdown backticks) become <code>; their text is shown as written, so $ in them is a dollar sign
const codeSpan = c => `<code>${/<\/?[a-z][^<>]*>/i.test(c) ? c : c.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>`;
export function texToHtml(s) {
  if (typeof s !== 'string' || (s.indexOf('$') < 0 && s.indexOf('`') < 0)) return s;
  return s.split(/(`[^`\n]+`)/).map((part, i) => i % 2 ? codeSpan(part.slice(1, -1).replace(/\\\$/g, '$')) : mathText(part)).join('');
}
function mathText(s) {
  if (s.indexOf('$') < 0) return s;
  let out = '';
  for (let i = 0; i < s.length;) {
    const c = s[i];
    if (c === '\\' && s[i + 1] === '$') { out += '$'; i += 2; continue; }
    if (c === '$') {
      const disp = s[i + 1] === '$', open = disp ? 2 : 1;
      let j = i + open, found = -1;
      for (; j < s.length; j++) {
        if (s[j] === '\\') { j++; continue; }
        if (s[j] === '$' && (!disp || s[j + 1] === '$')) { found = j; break; }
      }
      if (found < 0) { out += c; i++; continue; }
      out += math(s.slice(i + open, found), disp);
      i = found + open; continue;
    }
    out += c; i++;
  }
  return out;
}

// every string in a course, except code listings, formula boxes (plain text, where $ is a dollar) and links
// (an object reached twice is converted once: its dollar signs are plain text after the first pass)
export function texCourse(o, key, seen = new WeakSet()) {
  if (typeof o === 'string') return key === 'code' || key === 'formula' || key === 'url' || key === 'id' ? o : texToHtml(o);
  if (!o || typeof o !== 'object' || seen.has(o)) return o;
  seen.add(o);
  if (Array.isArray(o)) { for (let i = 0; i < o.length; i++) o[i] = key === 'code' || key === 'formula' ? o[i] : texCourse(o[i], key, seen); return o; }
  for (const k of Object.keys(o)) o[k] = texCourse(o[k], k, seen);
  return o;
}
