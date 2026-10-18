/*
 * Study — a small, dependency-free study notebook.
 * ---------------------------------------------------------------------------
 * Loads data/manifest.js (built by build.mjs), then lazy-loads data/<course>.js
 * when a course is opened. Everything is rendered from one state object and a
 * hash router; all progress lives in localStorage under the `sap:v1:` prefix.
 *
 * Routes
 *   #/                              library
 *   #/search?q=...                  full-text search
 *   #/course/<id>/<track>           path (sessions list)
 *   #/course/<id>/<track>/read/<n>  a session
 *   #/course/<id>/<track>/cards     flashcards
 *   #/course/<id>/<track>/qa        questions & answers
 *   #/course/<id>/<track>/quiz      quiz + timed practice
 *   #/course/<id>/<track>/papers[/<exam>]
 *   #/course/<id>/<track>/progress
 * ---------------------------------------------------------------------------
 */
(function () {
  'use strict';

  /* ── tiny helpers ───────────────────────────────────────────────────── */

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const NS = 'sap:v1:';

  const esc = value => String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  // The course source mixes a little safe HTML (<b>, <i>, <code>, <br>, <pre>)
  // with inline markdown. Everything else is escaped, so a stray < in code
  // samples or maths still renders as text.
  const decodeEntities = value => String(value == null ? '' : value)
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&amp;/g, '&');

  function inline(value) {
    let out = String(value == null ? '' : value);
    if (!out) return '';
    const tags = [];
    const keep = html => {
      tags.push(html);
      return `\u0000${tags.length - 1}\u0000`;
    };

    out = out.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, code) => {
      const text = decodeEntities(code).replace(/\\n/g, '\n');
      return keep(`<pre class="rich-pre"><code>${esc(text)}</code></pre>`);
    });
    out = out.replace(/<\s*\/?\s*(b|strong|i|em|code)\s*>/gi, tag => {
      const closing = /^<\s*\//.test(tag);
      const name = /<\s*\/?\s*([a-z]+)/i.exec(tag)[1].toLowerCase();
      return keep(closing ? `</${name}>` : `<${name}>`);
    });
    out = out.replace(/<\s*br\s*\/?\s*>/gi, () => keep('<br>'));

    out = esc(decodeEntities(out));
    out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s.,;:!?)]|$)/g, '$1<em>$2</em>');
    return out.replace(/\u0000(\d+)\u0000/g, (_, i) => tags[Number(i)]);
  }

  // Plain text for search and snippets: drops markup and entities.
  const plain = value => decodeEntities(String(value == null ? '' : value)
    .replace(/<pre[^>]*>[\s\S]*?<\/pre>/gi, ' ')
    .replace(/<\/?(?:b|strong|i|em|code|br)\b[^>]*>/gi, ''))
    .replace(/\s+/g, ' ')
    .trim();

  const icon = (name, cls = '') =>
    `<svg class="ic ${cls}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;

  const sessionLabel = (trackMeta, n) => `${trackMeta.prefix || 'L'}${n}`;
  const pad = n => String(n).padStart(2, '0');
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  const shuffle = list => {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const mins = n => (n >= 60 ? `${Math.floor(n / 60)}h ${n % 60 ? (n % 60) + 'm' : ''}`.trim() : `${n} min`);

  /* ── persistence ────────────────────────────────────────────────────── */

  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(NS + key);
        return raw == null ? fallback : JSON.parse(raw);
      } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(NS + key, JSON.stringify(value)); } catch { /* private mode */ }
    },
    del(key) {
      try { localStorage.removeItem(NS + key); } catch { /* ignore */ }
    }
  };

  function getProgress(courseId, trackId) {
    const p = store.get(`progress:${courseId}:${trackId}`, null) || {};
    return {
      read: Array.isArray(p.read) ? p.read : [],
      known: Array.isArray(p.known) ? p.known : [],
      miss: Array.isArray(p.miss) ? p.miss : [],
      best: typeof p.best === 'number' ? p.best : null,
      attempts: p.attempts || 0,
      lastRead: p.lastRead || null,
      updated: p.updated || 0
    };
  }
  function saveProgress(courseId, trackId, progress) {
    progress.updated = Date.now();
    store.set(`progress:${courseId}:${trackId}`, progress);
  }

  /* ── app state ──────────────────────────────────────────────────────── */

  const app = {
    manifest: null,
    route: null,
    fatal: null,
    courseError: null,
    index: null,
    searchQuery: '',
    deck: null,
    qaScope: 'all',
    quizSetup: { scope: 'all', count: 10, timer: 0 },
    quiz: null,
    timerId: null
  };

  /* ── data loading ───────────────────────────────────────────────────── */

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      let settled = false;
      const finish = error => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (error) {
          script.remove();
          reject(error);
        } else {
          resolve();
        }
      };
      const timer = setTimeout(() => finish(new Error('Timed out loading ' + src)), 12000);
      script.src = src;
      script.onload = () => finish();
      script.onerror = () => finish(new Error('Failed to load ' + src));
      document.head.appendChild(script);
    });
  }

  function courseData(id) {
    return (window.COURSES || {})[id] || null;
  }

  const courseLoads = {};

  async function ensureCourse(id) {
    if (courseData(id)) return courseData(id);
    if (courseLoads[id]) return courseLoads[id];
    const version = (window.MANIFEST && window.MANIFEST.version) || '';
    courseLoads[id] = loadScript(`data/${id}.js${version ? '?v=' + encodeURIComponent(version) : ''}`)
      .then(() => {
        if (!courseData(id)) throw new Error(`data/${id}.js loaded but did not register a course`);
        return courseData(id);
      })
      .finally(() => { delete courseLoads[id]; });
    return courseLoads[id];
  }

  /* ── routing ────────────────────────────────────────────────────────── */

  function parseRoute() {
    const raw = location.hash.replace(/^#\/?/, '');
    const [pathPart, queryPart] = raw.split('?');
    const seg = pathPart.split('/').filter(Boolean);
    const query = new URLSearchParams(queryPart || '');

    if (!seg.length) return { view: 'home' };
    if (seg[0] === 'search') return { view: 'search', q: query.get('q') || '' };
    if (seg[0] === 'course' && seg[1]) {
      return {
        view: 'course',
        id: seg[1],
        track: seg[2] || null,
        mode: seg[3] || 'path',
        n: seg[4] || null
      };
    }
    return { view: 'notfound' };
  }

  function go(hash) {
    if (location.hash === hash) {
      onRoute();
      return;
    }
    location.hash = hash;
  }

  const hrefCourse = (id, track, mode = 'path', n = null) =>
    `#/course/${id}/${track}/${mode}${n != null && n !== '' ? '/' + n : ''}`;

  function trackIdFor(route, meta) {
    if (!meta) return 'lectures';
    const order = meta.trackOrder || Object.keys(meta.tracks || {});
    if (route.track && meta.tracks[route.track]) return route.track;
    const saved = store.get(`track:${meta.id}`, null);
    if (saved && meta.tracks[saved]) return saved;
    return order[0] || 'lectures';
  }

  /* ── shell rendering ────────────────────────────────────────────────── */

  function courseMeta(id) {
    return (app.manifest && app.manifest.courses && app.manifest.courses[id]) || null;
  }
  function manifestCourses() {
    if (!app.manifest || !app.manifest.courses) return [];
    const order = app.manifest.order || Object.keys(app.manifest.courses);
    return order.map(id => app.manifest.courses[id]).filter(Boolean);
  }

  function applyTheme(theme) {
    const t = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = t;
    store.set('theme', t);
    $$('[data-theme-icon]').forEach(el => {
      el.setAttribute('href', t === 'dark' ? '#i-sun' : '#i-moon');
    });
    $$('[data-theme-label]').forEach(el => { el.textContent = t === 'dark' ? 'Light mode' : 'Dark mode'; });
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#121917' : '#0f6b5c');
  }

  function renderSidebar() {
    const host = $('#side-courses');
    if (!host) return;
    host.innerHTML = manifestCourses().map(c => `
      <a class="side-course" href="#/course/${esc(c.id)}/${esc(trackIdFor({ id: c.id, track: null }, c))}">
        <span class="dot" style="background:${esc(c.color || '#4fb39b')}"></span>
        <span>${esc(c.short || c.name)}</span>
        <span class="sc-short">${esc((c.code || '').split(' ')[0])}</span>
      </a>`).join('') || '<p class="side-note">No courses built yet.</p>';

    $$('.nav-a').forEach(a => a.removeAttribute('aria-current'));
    if (app.route && app.route.view === 'home') $('.nav-a[data-match="home"]')?.setAttribute('aria-current', 'page');
    if (app.route && app.route.view === 'search') $('.nav-a[data-match="search"]')?.setAttribute('aria-current', 'page');
    if (app.route && app.route.view === 'course') {
      const meta = courseMeta(app.route.id);
      if (meta) {
        const link = $$('.side-course').find(a => a.getAttribute('href').includes(`/course/${meta.id}/`));
        if (link) link.classList.add('on');
      }
    }
  }

  function crumbFor(route) {
    const bits = ['<a href="#/">Library</a>'];
    if (route.view === 'search') {
      bits.push('<span class="sep">/</span><span class="here">Search</span>');
    } else if (route.view === 'course') {
      const meta = courseMeta(route.id);
      if (meta) {
        const trackId = trackIdFor(route, meta);
        const tm = meta.tracks[trackId];
        bits.push('<span class="sep">/</span>', `<a href="${hrefCourse(meta.id, trackId)}">${esc(meta.short || meta.name)}</a>`);
        bits.push('<span class="sep">/</span>', `<a href="${hrefCourse(meta.id, trackId)}">${esc(tm ? tm.name : trackId)}</a>`);
        const modeNames = { path: 'Path', read: 'Read', cards: 'Cards', qa: 'Q&A', quiz: 'Quiz', papers: 'Past papers', progress: 'Progress' };
        if (route.mode !== 'path') {
          bits.push('<span class="sep">/</span><span class="here">' + esc(modeNames[route.mode] || route.mode) + '</span>');
        }
      }
    }
    return bits.join('');
  }

  function renderShell() {
    renderSidebar();
    const crumb = $('#crumb');
    if (crumb) crumb.innerHTML = crumbFor(app.route || { view: 'home' });
    const t = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    $$('[data-theme-icon]').forEach(el => el.setAttribute('href', t === 'dark' ? '#i-sun' : '#i-moon'));
    $$('[data-theme-label]').forEach(el => { el.textContent = t === 'dark' ? 'Light mode' : 'Dark mode'; });
    document.body.dataset.course = app.route && app.route.view === 'course' ? app.route.id : '';
  }

  function toast(message) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast._id);
    toast._id = setTimeout(() => el.classList.remove('show'), 2400);
  }

  /* ── home ───────────────────────────────────────────────────────────── */

  function resumeCard() {
    const last = store.get('last', null);
    if (!last || !last.course) return '';
    const meta = courseMeta(last.course);
    if (!meta) return '';
    const trackId = meta.tracks[last.track] ? last.track : (meta.trackOrder || Object.keys(meta.tracks))[0];
    const tm = meta.tracks[trackId];
    if (!tm) return '';
    const progress = getProgress(meta.id, trackId);
    let mode = MODES.includes(last.mode) ? last.mode : 'path';
    let n = null;
    if (mode === 'read') {
      n = progress.lastRead;
      if (!n) mode = 'path';
    }
    const labels = { path: 'Path', read: 'Reading', cards: 'Flashcards', qa: 'Q&A', quiz: 'Quiz', papers: 'Past papers', progress: 'Progress' };
    return `<div class="continue-card" style="margin:0 0 22px">
      <div style="flex:1;min-width:220px">
        <span class="cc-pill">Pick up where you left off</span>
        <h2>${esc(meta.short || meta.name)} · ${esc(tm.name)}${n ? ' · ' + esc(`${tm.prefix}${n}`) : ''}</h2>
        <p>${esc(labels[mode] || 'Course')} · ${progress.read.length}/${tm.count} ${esc(tm.units)} read${progress.best != null ? ` · best quiz ${progress.best}%` : ''}</p>
      </div>
      <a class="btn primary" href="${hrefCourse(meta.id, trackId, mode, n)}">${icon('arrow')} Resume</a>
    </div>`;
  }

  function viewHome() {
    const courses = manifestCourses();
    const totals = courses.reduce((acc, c) => {
      acc.sessions += c.totals?.sessions || 0;
      acc.cards += c.totals?.cards || 0;
      acc.quiz += c.totals?.quiz || 0;
      return acc;
    }, { sessions: 0, cards: 0, quiz: 0 });

    const cards = courses.map(c => {
      const tracks = (c.trackOrder || Object.keys(c.tracks || {})).map(id => c.tracks[id]).filter(Boolean);
      const savedTrack = trackIdFor({ id: c.id, track: null }, c);
      const progress = getProgress(c.id, savedTrack);
      const tm = c.tracks[savedTrack];
      const readPct = pct(progress.read.length, tm ? tm.count : 0);
      return `
        <article class="course-card" style="--c:${esc(c.color || '#0f6b5c')}">
          <div class="cc-top">
            <div class="cc-badge">${esc((c.code || c.short || 'S').slice(0, 2))}</div>
            <div>
              <p class="cc-kicker">${esc(c.code || 'Course')}${c.by ? ' · ' + esc(c.by) : ''}</p>
              <h2 class="cc-title"><a href="${hrefCourse(c.id, savedTrack)}" style="color:inherit">${esc(c.name)}</a></h2>
            </div>
          </div>
          <p class="cc-desc" style="margin:0">${esc(c.description || '')}</p>
          <div class="cc-tracks">
            ${tracks.map(t => `
              <a class="cc-track" href="${hrefCourse(c.id, t.id)}">
                ${icon(t.id === 'labs' ? 'flask' : 'book')}
                <span class="ct-name">${esc(t.name)}</span>
                <span class="ct-meta">${t.count} ${esc(t.units)} · ${t.cards} cards</span>
                ${icon('chev')}
              </a>`).join('')}
          </div>
          <div class="cc-foot">
            <span class="mono">${readPct}% read</span>
            <span class="mini-meter" aria-hidden="true"><i style="width:${readPct}%"></i></span>
            <span>${tracks.reduce((a, t) => a + t.count, 0)} sessions</span>
          </div>
        </article>`;
    }).join('');

    return `
      <section class="home-hero wrap">
        <p class="kicker">Your notebook</p>
        <h1>Learn the machine underneath.</h1>
        <p>Lecture notes and lab guides, written to be read twice: once for the idea, once for the detail. Every session comes with cards, questions and a quiz, and the Lectures / Labs switch keeps the two views of the course apart — with their own progress.</p>
        <div class="home-tools">
          <button class="search-pill" type="button" data-action="open-search">
            ${icon('search')}<span>Search every note, card and question…</span><kbd>/</kbd>
          </button>
          <span class="chip accent">${plural(totals.sessions, 'session', 'sessions')}</span>
          <span class="chip">${plural(totals.cards, 'card', 'cards')}</span>
          <span class="chip">${plural(totals.quiz, 'question', 'questions')}</span>
        </div>
      </section>
      <section class="wrap">
        ${resumeCard()}
        <div class="shelf${courses.length === 1 ? ' single' : ''}">
          ${cards || `<div class="empty"><h3>No courses yet</h3>Add a file to <span class="mono">courses/</span>, then run <span class="mono">node build.mjs</span>.</div>`}
        </div>
      </section>`;
  }

  /* ── search ─────────────────────────────────────────────────────────── */

  function buildIndex() {
    if (app.index) return app.index;
    const index = [];
    manifestCourses().forEach(meta => {
      const course = courseData(meta.id);
      if (!course) return;
      const trackIds = meta.trackOrder || Object.keys(meta.tracks || {});
      trackIds.forEach(trackId => {
        const track = course.tracks && course.tracks[trackId];
        if (!track) return;
        const tm = meta.tracks[trackId];
        const label = n => `${tm.prefix || 'L'}${n}`;
        const base = { course: meta.id, courseName: meta.short || meta.name, track: trackId, trackName: tm.name };
        (track.sessions || []).forEach(s => {
          const head = `${label(s.n)} · ${s.title}`;
          const hrefRead = hrefCourse(meta.id, trackId, 'read', s.n);
          (s.notes || []).forEach(note => {
            const body = plain([
              ...(note.pts || []), ...(note.list || []),
              ...((note.table && note.table.rows) ? note.table.rows.flat() : []),
              note.code || '', note.formula || '', note.callout || ''
            ].join(' '));
            index.push({
              ...base, kind: 'Notes', icon: 'notes', lec: s.n, label: label(s.n),
              title: plain(`${head} — ${note.h || 'Notes'}`),
              text: body,
              href: hrefRead
            });
          });
          (s.cards || []).forEach(card => {
            index.push({
              ...base, kind: 'Card', icon: 'card', lec: s.n, label: label(s.n),
              title: plain(card[0]), text: plain(`${card[0]} ${card[1]}`),
              href: hrefCourse(meta.id, trackId, 'cards', s.n)
            });
          });
          (s.qa || []).forEach(qa => {
            index.push({
              ...base, kind: 'Q&A', icon: 'qa', lec: s.n, label: label(s.n),
              title: plain(qa[0]), text: plain(`${qa[0]} ${qa[1]}`),
              href: hrefCourse(meta.id, trackId, 'qa', s.n)
            });
          });
          [...(s.quiz || []).map(q => ({ q, extra: false })), ...(s.extra || []).map(q => ({ q, extra: true }))].forEach(({ q, extra }) => {
            index.push({
              ...base, kind: extra ? 'Practice' : 'Quiz', icon: 'quiz', lec: s.n, label: label(s.n),
              title: plain(q.q), text: plain(`${q.q} ${(q.o || []).join(' ')} ${q.why || ''}`),
              href: hrefCourse(meta.id, trackId, 'quiz', s.n)
            });
          });
        });
      });

      // Past papers cover the whole course; file them under the first track.
      const firstTrack = trackIds[0];
      if (firstTrack) (course.exams || []).forEach(exam => {
        (exam.questions || []).forEach((q, i) => {
          index.push({
            course: meta.id, courseName: meta.short || meta.name,
            track: firstTrack, trackName: 'All tracks',
            kind: 'Past paper', icon: 'notes', lec: null,
            label: `${plain(exam.title)} · Q${i + 1}`,
            title: plain(q.q),
            text: plain(`${q.q} ${(q.o || []).join(' ')} ${q.why || ''}`),
            href: hrefCourse(meta.id, firstTrack, 'papers', exam.id)
          });
        });
        (exam.sections || []).forEach(section => {
          section.items.forEach((item, i) => {
            if (item.type !== 'written') return;
            index.push({
              course: meta.id, courseName: meta.short || meta.name,
              track: firstTrack, trackName: 'All tracks',
              kind: 'Past paper', icon: 'notes', lec: null,
              label: `${plain(exam.title)} · Written ${i + 1}`,
              title: plain(item.q),
              text: plain(`${item.q} ${item.ans} ${item.why || ''}`),
              href: hrefCourse(meta.id, firstTrack, 'papers', exam.id)
            });
          });
        });
      });
    });
    app.index = index;
    return index;
  }

  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function highlight(text, tokens) {
    let out = esc(text);
    const clean = tokens.filter(t => t.length > 1).sort((a, b) => b.length - a.length);
    if (!clean.length) return out;
    const re = new RegExp('(' + clean.map(escapeRe).join('|') + ')', 'gi');
    return out.replace(re, '<mark>$1</mark>');
  }

  function snippetFor(text, tokens) {
    const lower = text.toLowerCase();
    let at = -1;
    for (const t of tokens) {
      const i = lower.indexOf(t.toLowerCase());
      if (i >= 0 && (at < 0 || i < at)) at = i;
    }
    if (at < 0) return text.slice(0, 150);
    const start = Math.max(0, at - 55);
    const end = Math.min(text.length, at + 120);
    return (start > 0 ? '…' : '') + text.slice(start, end).trim() + (end < text.length ? '…' : '');
  }

  function searchResults(query) {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!tokens.length) return [];
    const index = buildIndex();
    const scored = [];
    for (const item of index) {
      const title = item.title.toLowerCase();
      const text = item.text.toLowerCase();
      let score = 0;
      for (const t of tokens) {
        if (title.includes(t)) score += 9;
        if (item.kind.toLowerCase().includes(t)) score += 2;
        let at = text.indexOf(t);
        let hits = 0;
        while (at >= 0 && hits < 8) { hits++; at = text.indexOf(t, at + t.length); }
        score += hits * 2;
      }
      if (score > 0) scored.push({ item, score });
    }
    return scored.sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title)).slice(0, 60).map(x => x.item);
  }

  function searchResultsHtml(query) {
    if (!query.trim()) {
      return `<div class="search-empty empty"><h3>Search the whole notebook</h3>Type a term like <span class="mono">interrupt</span>, <span class="mono">system call</span>, <span class="mono">mode bit</span> or <span class="mono">microkernel</span>. Results cover both tracks, all notes, cards, Q&amp;A, quiz questions and written paper answers.</div>
        <div class="search-sugg">
          ${['interrupt', 'system call', 'DMA', 'mode bit', 'microkernel', 'page table'].map(t => `<button class="choice" type="button" data-action="suggest" data-q="${t}">${t}</button>`).join('')}
        </div>`;
    }
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    const results = searchResults(query);
    if (!results.length) {
      return `<div class="search-empty empty"><h3>No matches for “${esc(query)}”</h3>Try a shorter term, or check the spelling. Search looks at note text, card backs, answers and quiz explanations.</div>`;
    }
    return `<div class="search-meta"><span>${results.length} result${results.length === 1 ? '' : 's'}</span><span>${esc(query)}</span></div>
      <div class="results" id="results">${results.map(r => `
        <a class="result-row" href="${r.href}">
          <span class="rr-kind ${r.icon}">${esc(r.kind)}</span>
          <span style="min-width:0">
            <span class="rr-meta">${esc(r.courseName)} · ${esc(r.trackName)} · ${esc(r.label)}</span>
            <span class="rr-title" style="display:block">${highlight(r.title, tokens)}</span>
            <span class="rr-snippet">${highlight(snippetFor(r.text, tokens), tokens)}</span>
          </span>
        </a>`).join('')}</div>`;
  }

  function viewSearch() {
    const query = app.searchQuery || (app.route && app.route.q) || '';
    return `
      <div class="wrap search-page">
        <div class="search-hero">
          <p class="kicker">Everything, one box</p>
          <h1>Search</h1>
          <p>Notes, flashcards, answers and explanations from every track.</p>
        </div>
        <form class="search-field" role="search" data-form="search">
          ${icon('search')}
          <input id="search-input" type="search" name="q" placeholder="Try “interrupt”, “system call”, “microkernel”…" value="${esc(query)}" autocomplete="off" spellcheck="false" aria-label="Search the notebook">
          <kbd>esc</kbd>
        </form>
        <div id="search-output">${searchResultsHtml(query)}</div>
      </div>`;
  }

  /* ── course shell ───────────────────────────────────────────────────── */

  function trackSwitchHtml(meta, active, small = false) {
    const ids = meta.trackOrder || Object.keys(meta.tracks || {});
    return `<div class="track-switch${small ? ' small' : ''}" role="tablist" aria-label="Course track">
      ${ids.map(id => {
        const t = meta.tracks[id];
        if (!t) return '';
        return `<button class="track-btn" type="button" role="tab" aria-selected="${id === active ? 'true' : 'false'}"
          data-action="track" data-track="${esc(id)}" title="Show ${esc(t.name)}">
          ${icon(id === 'labs' ? 'flask' : 'book')}
          <span>${esc(t.name)}</span>
          <span class="tb-num">${t.count}</span>
        </button>`;
      }).join('')}
    </div>`;
  }

  function courseHero(meta, trackMeta, progress) {
    const total = trackMeta ? trackMeta.count : 0;
    const read = progress.read.length;
    const known = progress.known.length;
    const cards = trackMeta ? trackMeta.cards : 0;
    const readPct = pct(read, total);
    const trackName = trackMeta ? trackMeta.name : 'Lectures';
    return `
      <section class="hero">
        <div class="hero-in">
          <div class="hero-top">
            <div>
              <p class="hero-kicker"><span>${esc(meta.code || 'Course')}</span><span class="bar"></span><span>${esc(trackName)} track</span><span class="bar"></span><span>${total} ${esc(trackMeta ? trackMeta.units : 'sessions')}</span></p>
              <h1>${esc(meta.name)}</h1>
              <p class="hero-lede">${esc(meta.description || '')}</p>
              <div class="hero-meta">
                ${meta.by ? `<span>${esc(meta.by)}</span>` : ''}
                <span>${meta.exams || 0} past paper${meta.exams === 1 ? '' : 's'}</span>
                <span>${cards} cards</span>
              </div>
              ${trackSwitchHtml(meta, trackMeta ? trackMeta.id : 'lectures')}
            </div>
            <div class="hero-side">
              <div class="hero-stamp">
                <b>${read}/${total}</b>
                <span>${esc(trackMeta ? trackMeta.units : 'sessions')} read</span>
              </div>
            </div>
          </div>
          <div class="hero-stats">
            <div class="hstat"><b>${read}<em>/${total}</em></b><span>${esc(trackMeta ? trackMeta.units : 'sessions')} read</span></div>
            <div class="hstat"><b>${known}<em>/${cards}</em></b><span>cards known</span></div>
            <div class="hstat"><b>${progress.best == null ? '–' : progress.best + '%'}</b><span>best quiz</span></div>
            <div class="hstat"><b>${trackMeta ? trackMeta.quiz : 0}</b><span>quiz questions</span></div>
          </div>
          <div class="progress-line" aria-hidden="true"><i style="width:${readPct}%"></i></div>
        </div>
      </section>`;
  }

  function tabsHtml(meta, trackMeta) {
    const total = trackMeta ? trackMeta.count : 0;
    const modes = [
      ['path', 'Path', 'chart', null],
      ['read', 'Read', 'book', total],
      ['cards', 'Cards', 'cards', trackMeta ? trackMeta.cards : 0],
      ['qa', 'Q&A', 'help', trackMeta ? trackMeta.qa : 0],
      ['quiz', 'Quiz', 'quiz', trackMeta ? trackMeta.quiz : 0],
      ['papers', 'Past papers', 'file', meta.exams || 0],
      ['progress', 'Progress', 'chart', null]
    ];
    return `<div class="course-tabs"><div class="tabs" role="tablist" aria-label="Course sections">
      ${modes.map(([mode, label, ic, count]) => `
        <button class="tab" type="button" role="tab" aria-selected="${app.route.mode === mode ? 'true' : 'false'}"
          data-action="mode" data-mode="${mode}">
          ${icon(ic)}<span>${label}</span>${count != null ? `<span class="tab-count">${count}</span>` : ''}
        </button>`).join('')}
    </div></div>`;
  }

  function sessionCard(trackMeta, s, progress) {
    const isRead = progress.read.includes(s.n);
    const known = (s.cards || []).filter((_, i) => progress.known.includes(`${s.n}:${i}`)).length;
    const cardTotal = (s.cards || []).length;
    const quizTotal = (s.quiz || []).length + (s.extra || []).length;
    return `
      <button class="session-card${isRead ? ' is-read' : ''}" type="button" data-action="open-session" data-n="${s.n}">
        <span class="sc-num">${pad(s.n)}</span>
        <span style="min-width:0">
          <span class="sc-title" style="display:block">${esc(s.title)}</span>
          ${s.summary ? `<span class="sc-sum">${esc(s.summary)}</span>` : ''}
          <span class="sc-tags">
            ${(s.tags || []).slice(0, 3).map(t => `<span class="chip">${esc(t)}</span>`).join('')}
            ${isRead ? `<span class="chip ok">${icon('check')} read</span>` : ''}
          </span>
        </span>
        <span class="sc-side">
          <span>${esc(sessionLabel(trackMeta, s.n))} · ${s.mins} min</span>
          <span>${known}/${cardTotal} cards</span>
          <span>${quizTotal} questions</span>
          ${isRead ? '<span class="done">done</span>' : icon('chev')}
        </span>
      </button>`;
  }

  function viewPath(meta, trackMeta, track, progress) {
    const sessions = track.sessions || [];
    const next = sessions.find(s => !progress.read.includes(s.n)) || sessions[0];
    const readPct = pct(progress.read.length, sessions.length);
    return `
      <div class="path-head">
        <div>
          <h2>${esc(trackMeta.name)} path</h2>
          <p>${esc(trackMeta.blurb || `${sessions.length} ${trackMeta.units}, in order.`)}</p>
        </div>
        <span class="chip accent">${readPct}% complete</span>
      </div>
      ${next ? `
      <div class="continue-card">
        <div style="flex:1;min-width:220px">
          <span class="cc-pill">${progress.read.length ? 'Continue' : 'Start here'}</span>
          <h2>${sessionLabel(trackMeta, next.n)} · ${esc(next.title)}</h2>
          <p>${esc(next.summary || `${(next.notes || []).length} sections · ${(next.cards || []).length} cards`)}</p>
        </div>
        <a class="btn primary" href="${hrefCourse(meta.id, trackMeta.id, 'read', next.n)}">${icon('play')} Open ${sessionLabel(trackMeta, next.n)}</a>
      </div>` : ''}
      <div class="path-list">
        ${sessions.map(s => sessionCard(trackMeta, s, progress)).join('')}
      </div>`;
  }

  /* ── reading ────────────────────────────────────────────────────────── */

  function noteHtml(note, n, i) {
    return `
      <section class="note" id="sec-${n}-${i}">
        ${note.h ? `<h3>${inline(note.h)}</h3>` : ''}
        ${(note.pts || []).map(p => `<p>${inline(p)}</p>`).join('')}
        ${(note.list || []).length ? `<ul>${note.list.map(li => `<li>${inline(li)}</li>`).join('')}</ul>` : ''}
        ${note.formula ? `<div class="formula">${inline(note.formula)}</div>` : ''}
        ${note.table ? `<div class="table-wrap"><table>
          ${note.table.head.length ? `<thead><tr>${note.table.head.map(h => `<th>${inline(h)}</th>`).join('')}</tr></thead>` : ''}
          <tbody>${note.table.rows.map(row => `<tr>${row.map(cell => `<td>${inline(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
        </table></div>` : ''}
        ${note.code ? `<div class="code-block"><div class="code-head"><span class="dots"><i></i><i></i><i></i></span>${esc(note.codeLang || 'code')}</div><pre><code>${esc(note.code)}</code></pre></div>` : ''}
        ${note.callout ? `<div class="callout">${icon('info')}<div>${inline(note.callout)}</div></div>` : ''}
      </section>`;
  }

  function viewRead(meta, trackMeta, track, progress, n) {
    const sessions = track.sessions || [];
    const session = sessions.find(s => s.n === n) || sessions[0];
    if (!session) return `<div class="empty"><h3>No ${esc(trackMeta.units)} in this track yet</h3></div>`;
    const idx = sessions.findIndex(s => s.n === session.n);
    const isRead = progress.read.includes(session.n);
    const quizCount = (session.quiz || []).length + (session.extra || []).length;
    return `
      <div class="read-layout">
        <aside class="rail" aria-label="Sessions">
          <p class="rail-title">${esc(trackMeta.name)}</p>
          ${sessions.map(s => `
            <a class="rail-link${s.n === session.n ? ' on' : ''}" href="${hrefCourse(meta.id, trackMeta.id, 'read', s.n)}">
              <span class="rl-n">${sessionLabel(trackMeta, s.n)}</span>
              <span>${esc(s.title)}</span>
              ${progress.read.includes(s.n) ? '<span class="rl-check">✓</span>' : ''}
            </a>`).join('')}
        </aside>
        <article class="paper">
          <header class="page-head">
            <p class="kicker">${esc(trackMeta.unit)} ${session.n} · ${sessions.length} in track</p>
            <h2>${esc(session.title)}</h2>
            <p class="meta">
              <span>${session.mins} min read</span>
              <span>${(session.notes || []).length} sections</span>
              <span>${(session.cards || []).length} cards</span>
              <span>${quizCount} quiz questions</span>
            </p>
            ${session.summary ? `<p style="margin:14px 0 0;color:var(--muted);font-size:.95rem;line-height:1.65">${esc(session.summary)}</p>` : ''}
            <div class="read-progress" aria-hidden="true"><i style="width:${pct(idx + 1, sessions.length)}%"></i></div>
          </header>

          ${(session.objectives || []).length ? `
          <div class="objectives">
            <h3>By the end you should be able to</h3>
            <ol>${session.objectives.map(o => `<li>${inline(o)}</li>`).join('')}</ol>
          </div>` : ''}

          ${(session.notes || []).map((note, i) => noteHtml(note, session.n, i)).join('')}

          <footer class="page-foot">
            <button class="btn readmark${isRead ? ' on' : ''}" type="button" data-action="mark-read" data-n="${session.n}" aria-pressed="${isRead}">
              ${icon('check')} ${isRead ? 'Read' : 'Mark as read'}
            </button>
            <button class="btn primary" type="button" data-action="quiz-session" data-n="${session.n}">${icon('quiz')} Quiz me on this</button>
            <button class="btn" type="button" data-action="cards-session" data-n="${session.n}">${icon('cards')} Flip its ${(session.cards || []).length} cards</button>
            <button class="btn ghost" type="button" data-action="print">${icon('print')} Print</button>
            <span class="grow"></span>
            ${idx > 0 ? `<a class="btn ghost" href="${hrefCourse(meta.id, trackMeta.id, 'read', sessions[idx - 1].n)}">${icon('left')} ${sessionLabel(trackMeta, sessions[idx - 1].n)}</a>` : ''}
            ${idx < sessions.length - 1 ? `<a class="btn ghost" href="${hrefCourse(meta.id, trackMeta.id, 'read', sessions[idx + 1].n)}">${sessionLabel(trackMeta, sessions[idx + 1].n)} ${icon('arrow')}</a>` : ''}
          </footer>
        </article>
      </div>`;
  }

  /* ── flashcards ─────────────────────────────────────────────────────── */

  function deckSessions(track) { return track.sessions || []; }

  function ensureDeck(course, meta, trackMeta, track, progress, routeN) {
    const sessions = deckSessions(track);
    let scope = app.deckScope;
    if (routeN && sessions.some(s => s.n === routeN)) scope = routeN;
    if (scope !== 0 && !sessions.some(s => s.n === scope)) scope = 0;
    app.deckScope = scope;
    const mode = app.deckMode || 'all';
    const key = `${course.id}:${trackMeta.id}:${scope}:${mode}`;
    if (!app.deck || app.deck.key !== key) {
      const items = [];
      sessions.filter(s => scope === 0 || s.n === scope).forEach(s => {
        (s.cards || []).forEach((card, i) => {
          if (mode === 'unknown' && progress.known.includes(`${s.n}:${i}`)) return;
          items.push({ n: s.n, i, front: card[0], back: card[1], title: s.title });
        });
      });
      app.deck = { key, course: course.id, track: trackMeta.id, scope, mode, items, pos: 0, flipped: false, got: 0 };
    }
    return app.deck;
  }

  function viewCards(course, meta, trackMeta, track, progress, routeN) {
    const deck = ensureDeck(course, meta, trackMeta, track, progress, routeN);
    const sessions = deckSessions(track);
    const knownInTrack = progress.known.length;
    const totalCards = trackMeta.cards;
    const item = deck.items[deck.pos];
    const scopeName = deck.scope === 0 ? 'All sessions' : sessionLabel(trackMeta, deck.scope);
    const filters = `
      <div class="session-filter" aria-label="Deck scope">
        <button class="fchip" aria-pressed="${deck.scope === 0}" data-action="deck-scope" data-n="0">All ${esc(trackMeta.units)} <span class="n">${totalCards}</span></button>
        ${sessions.map(s => `<button class="fchip" aria-pressed="${deck.scope === s.n}" data-action="deck-scope" data-n="${s.n}">
          ${esc(sessionLabel(trackMeta, s.n))} <span class="n">${(s.cards || []).length}</span></button>`).join('')}
      </div>`;

    let stage;
    if (!deck.items.length) {
      stage = `<div class="deck-done">
        <div class="big">✓</div>
        <h3>Nothing left to review</h3>
        <p>${deck.mode === 'unknown' ? 'Every card in this scope is marked known.' : 'This scope has no cards yet.'}</p>
        <div class="btn-row" style="display:flex;gap:10px;justify-content:center;margin-top:18px;flex-wrap:wrap">
          <button class="btn primary" type="button" data-action="deck-mode" data-mode="all">Study all cards</button>
          <button class="btn" type="button" data-action="deck-scope" data-n="0">Pick another scope</button>
        </div>
      </div>`;
    } else if (!item) {
      stage = `<div class="deck-done">
        <div class="big">${deck.items.length}</div>
        <h3>Deck finished</h3>
        <p>You reviewed ${deck.items.length} card${deck.items.length === 1 ? '' : 's'} and marked ${deck.got} as known. Run the deck again, or switch to “Only unknown” to skip what you already know.</p>
        <div class="btn-row" style="display:flex;gap:10px;justify-content:center;margin-top:18px;flex-wrap:wrap">
          <button class="btn primary" type="button" data-action="deck-restart">${icon('refresh')} Go again</button>
          <button class="btn" type="button" data-action="deck-mode" data-mode="unknown">Only unknown cards</button>
          ${deck.scope !== 0 ? `<a class="btn ghost" href="${hrefCourse(meta.id, trackMeta.id, 'read', deck.scope)}">Back to the ${esc(trackMeta.unit.toLowerCase())}</a>` : ''}
        </div>
      </div>`;
    } else {
      stage = `
        <div class="flashcard${deck.flipped ? ' flipped' : ''}" id="flashcard" data-action="flip" role="button" tabindex="0"
          aria-label="Flashcard. ${deck.flipped ? 'Showing the answer.' : 'Showing the question. Press Enter to reveal the answer.'}">
          <div class="fc-inner">
            <div class="fc-face fc-front" aria-hidden="${deck.flipped ? 'true' : 'false'}">
              <span class="fc-label">${esc(sessionLabel(trackMeta, item.n))} · card ${item.i + 1} of ${(sessions.find(s => s.n === item.n)?.cards || []).length}</span>
              <div class="fc-text">${inline(item.front)}</div>
              <span class="fc-hint">Click, or press Space, to reveal the answer</span>
            </div>
            <div class="fc-face fc-back" aria-hidden="${deck.flipped ? 'false' : 'true'}">
              <span class="fc-label">Answer</span>
              <div class="fc-text">${inline(item.back)}</div>
              <span class="fc-hint">Space flips back · 1 = again · 2 = got it</span>
            </div>
          </div>
        </div>
        <div class="fc-controls">
          <button class="btn" type="button" data-action="deck-again">${icon('refresh')} Again</button>
          <button class="btn" type="button" data-action="flip">${icon('cards')} ${deck.flipped ? 'Show question' : 'Show answer'}</button>
          <button class="btn primary" type="button" data-action="deck-got">${icon('check')} Got it</button>
        </div>`;
    }

    return `
      <div class="deck-wrap">
        <div class="section-head">
          <div>
            <h2>Flashcards</h2>
            <p>${esc(scopeName)} · ${knownInTrack}/${totalCards} cards known in ${esc(trackMeta.name.toLowerCase())}.</p>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <button class="btn small" type="button" data-action="deck-mode" data-mode="${deck.mode === 'all' ? 'unknown' : 'all'}" aria-pressed="${deck.mode === 'unknown'}">
              ${deck.mode === 'all' ? 'Only unknown' : 'All cards'}
            </button>
            ${item ? '<button class="btn small" type="button" data-action="deck-restart">Shuffle / restart</button>' : ''}
          </div>
        </div>
        ${filters}
        <div class="deck-bar">
          <span class="db-meta">${item ? `Card ${deck.pos + 1} of ${deck.items.length}` : 'Ready'}</span>
          <span class="grow"></span>
          <span class="db-meta">${deck.got} marked known this run</span>
        </div>
        <div class="deck-progress" aria-hidden="true"><i style="width:${item ? pct(deck.pos, deck.items.length) : 100}%"></i></div>
        ${stage}
      </div>`;
  }

  /* ── Q&A ────────────────────────────────────────────────────────────── */

  function viewQa(meta, trackMeta, track) {
    const sessions = track.sessions || [];
    const scope = app.qaScope;
    const rows = [];
    sessions.forEach(s => {
      if (scope !== 'all' && s.n !== Number(scope)) return;
      (s.qa || []).forEach((qa, i) => rows.push({ s, qa, i }));
    });
    const filters = `
      <div class="session-filter" aria-label="Filter questions">
        <button class="fchip" aria-pressed="${scope === 'all'}" data-action="qa-scope" data-n="all">All ${esc(trackMeta.units)}</button>
        ${sessions.map(s => `<button class="fchip" aria-pressed="${String(scope) === String(s.n)}" data-action="qa-scope" data-n="${s.n}">
          ${esc(sessionLabel(trackMeta, s.n))}</button>`).join('')}
      </div>`;
    return `
      <div style="max-width:860px;margin:0 auto">
        <div class="section-head">
          <div>
            <h2>Questions & answers</h2>
            <p>${rows.length} question${rows.length === 1 ? '' : 's'} — open one, answer it in your head, then check.</p>
          </div>
          <button class="btn small" type="button" data-action="qa-toggle">Expand all</button>
        </div>
        ${filters}
        <div class="qa-list">
          ${rows.length ? rows.map(({ s, qa, i }) => `
            <details class="qa-item">
              <summary><span class="qa-n">${esc(sessionLabel(trackMeta, s.n))}·${i + 1}</span><span>${inline(qa[0])}</span></summary>
              <div class="qa-a"><span class="chip accent">${esc(sessionLabel(trackMeta, s.n))}</span><div>${inline(qa[1])}</div></div>
            </details>`).join('') : `<div class="empty"><h3>No Q&amp;A in this scope</h3>Pick another ${esc(trackMeta.unit.toLowerCase())}.</div>`}
        </div>
      </div>`;
  }

  /* ── quiz ───────────────────────────────────────────────────────────── */

  function poolFor(track, scope) {
    const pool = [];
    (track.sessions || []).forEach(s => {
      if (scope !== 'all' && s.n !== Number(scope)) return;
      (s.quiz || []).forEach((q, i) => pool.push({ q, key: `${s.n}:${i}`, n: s.n, extra: false }));
      (s.extra || []).forEach((q, i) => pool.push({ q, key: `${s.n}:x${i}`, n: s.n, extra: true }));
    });
    return pool;
  }

  function findMissing(meta, trackMeta, track, key) {
    const m = /^(\d+):(x?)(\d+)$/.exec(String(key));
    if (!m) return null;
    const n = Number(m[1]);
    const extra = m[2] === 'x';
    const idx = Number(m[3]);
    const session = (track.sessions || []).find(s => s.n === n);
    if (!session) return null;
    const q = (extra ? session.extra : session.quiz || [])[idx];
    if (!q) return null;
    return { q, n, extra, key, label: sessionLabel(trackMeta, n), session };
  }

  function stopTimer() {
    if (app.timerId) {
      clearInterval(app.timerId);
      app.timerId = null;
    }
  }

  function startTimer() {
    stopTimer();
    const quiz = app.quiz;
    if (!quiz || quiz.finished || !quiz.timeLimit) return;
    const tick = () => {
      const el = $('#quiz-timer');
      if (!app.quiz || app.quiz.finished) { stopTimer(); return; }
      const left = Math.max(0, app.quiz.timeLimit - Math.floor((Date.now() - app.quiz.started) / 1000));
      if (el) {
        el.textContent = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`;
        el.classList.toggle('low', left <= 60);
      }
      if (left <= 0) {
        stopTimer();
        finishQuiz();
      }
    };
    tick();
    app.timerId = setInterval(tick, 1000);
  }

  function startQuiz(options = {}) {
    const meta = courseMeta(app.route.id);
    const course = courseData(app.route.id);
    if (!meta || !course) return;
    const trackId = trackIdFor(app.route, meta);
    const track = course.tracks[trackId];
    stopTimer();

    let questions;
    let config;
    if (options.paper) {
      questions = options.paper.questions.map((q, i) => ({
        q, key: `p:${options.paper.id}:${i}`, n: null, extra: false, label: options.paper.title
      }));
      config = {
        mode: 'paper', paperId: options.paper.id, paperTitle: options.paper.title,
        seconds: (options.timed ? options.paper.mins : 0) * 60
      };
    } else if (options.items) {
      questions = options.items;
      config = { mode: 'practice', scope: 'custom', seconds: (options.timer || 0) * 60 };
    } else {
      const scope = options.scope == null ? 'all' : options.scope;
      const pool = poolFor(track, scope);
      if (!pool.length) { toast('No quiz questions in this scope yet.'); return; }
      const count = options.count === 'all' ? pool.length : Math.min(Number(options.count) || 10, pool.length);
      questions = shuffle(pool).slice(0, count);
      config = { mode: 'quiz', scope, seconds: (options.timer || 0) * 60 };
    }

    if (!questions.length) {
      toast('This paper has no multiple-choice questions to start.');
      return;
    }

    app.quiz = {
      key: `${meta.id}:${trackId}:${config.paperId || 'quiz'}`,
      courseId: meta.id, trackId,
      questions, i: 0, picked: null, answers: [],
      started: Date.now(), timeLimit: config.seconds, finished: false,
      ...config
    };
  }

  function recordAttempt(quiz, question, correct) {
    const progress = getProgress(quiz.courseId, quiz.trackId);
    const key = question.key;
    if (!key.startsWith('p:')) {
      if (correct) progress.miss = progress.miss.filter(k => k !== key);
      else if (!progress.miss.includes(key)) progress.miss.push(key);
      saveProgress(quiz.courseId, quiz.trackId, progress);
    }
  }

  function answerQuiz(choice) {
    const quiz = app.quiz;
    if (!quiz || quiz.finished || quiz.picked != null) return;
    const item = quiz.questions[quiz.i];
    if (!item) return;
    const correct = choice === item.q.a;
    quiz.picked = choice;
    quiz.answers.push({ key: item.key, choice, correct });
    recordAttempt(quiz, item, correct);
    render({ keepScroll: true });
  }

  function finishQuiz() {
    const quiz = app.quiz;
    if (!quiz || quiz.finished) return;
    stopTimer();
    quiz.finished = true;
    quiz.finishedAt = Date.now();
    quiz.correct = quiz.answers.filter(a => a.correct).length;
    quiz.score = pct(quiz.correct, quiz.questions.length);
    if (quiz.mode !== 'paper') {
      const progress = getProgress(quiz.courseId, quiz.trackId);
      progress.best = progress.best == null ? quiz.score : Math.max(progress.best, quiz.score);
      progress.attempts = (progress.attempts || 0) + 1;
      saveProgress(quiz.courseId, quiz.trackId, progress);
    }
    render({ keepScroll: true });
  }

  function nextQuestion() {
    const quiz = app.quiz;
    if (!quiz) return;
    if (quiz.i + 1 >= quiz.questions.length) {
      finishQuiz();
      return;
    }
    quiz.i += 1;
    quiz.picked = null;
    render({ keepScroll: true });
  }

  function quizScopeOptions(track, trackMeta) {
    return `<button class="choice" data-action="quiz-scope" data-scope="all" aria-pressed="${app.quizSetup.scope === 'all'}">All ${esc(trackMeta.units)}</button>` +
      (track.sessions || []).map(s => `<button class="choice" data-action="quiz-scope" data-scope="${s.n}" aria-pressed="${String(app.quizSetup.scope) === String(s.n)}">${esc(sessionLabel(trackMeta, s.n))}</button>`).join('');
  }

  function viewQuizSetup(meta, trackMeta, track, progress) {
    const scope = app.quizSetup.scope;
    const pool = poolFor(track, scope);
    const counts = [10, 20, 'all'];
    return `
      <div class="quiz-wrap">
        <div class="quiz-setup">
          <p class="kicker">${esc(trackMeta.name)} track</p>
          <h2>Quiz yourself</h2>
          <p>Questions come from the ${esc(trackMeta.units)} in this track, including the short practice questions at the end of each session. Explanations appear after every answer.</p>
          <div class="setup-row">
            <h3>Scope</h3>
            <div class="choice-row">${quizScopeOptions(track, trackMeta)}</div>
          </div>
          <div class="setup-row">
            <h3>Length</h3>
            <div class="choice-row">
              ${counts.map(c => `<button class="choice" data-action="quiz-count" data-count="${c}" aria-pressed="${String(app.quizSetup.count) === String(c)}">${c === 'all' ? `All (${pool.length})` : Math.min(Number(c), pool.length) + ' questions'}</button>`).join('')}
            </div>
          </div>
          <div class="setup-row">
            <h3>Timer</h3>
            <div class="choice-row">
              ${[0, 10, 20].map(m => `<button class="choice" data-action="quiz-timer" data-timer="${m}" aria-pressed="${String(app.quizSetup.timer) === String(m)}">${m ? m + ' minutes' : 'No timer'}</button>`).join('')}
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:14px;margin-top:28px;flex-wrap:wrap">
            <button class="btn primary" type="button" data-action="quiz-start" ${pool.length ? '' : 'disabled'}>${icon('play')} Start quiz</button>
            <span class="mono muted" style="font-size:.76rem">${pool.length} question${pool.length === 1 ? '' : 's'} available${progress.best != null ? ` · best ${progress.best}%` : ''}</span>
          </div>
        </div>
      </div>`;
  }

  function viewQuizActive(meta, trackMeta) {
    const quiz = app.quiz;
    if (!quiz) return '';
    const item = quiz.questions[quiz.i];
    if (!item) return '';
    const q = item.q;
    const picked = quiz.picked;
    const isCorrect = picked != null && picked === q.a;
    const label = item.label || (item.n ? sessionLabel(trackMeta, item.n) : quiz.paperTitle || 'Practice');
    let sourceLabel;
    if (quiz.mode === 'paper') sourceLabel = `Question ${quiz.i + 1} of ${quiz.questions.length}`;
    else if (q.src && q.src !== label) sourceLabel = q.src;
    else sourceLabel = item.extra ? 'Practice question' : 'Quiz question';
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    return `
      <div class="quiz-wrap">
        <div class="quiz-top">
          <button class="btn ghost small" type="button" data-action="quiz-quit">${icon('left')} Exit</button>
          <span class="qcount">Question ${quiz.i + 1} of ${quiz.questions.length}</span>
          ${quiz.timeLimit ? `<span class="timer" id="quiz-timer">--:--</span>` : ''}
        </div>
        <div class="quiz-progress" aria-hidden="true"><i style="width:${pct(quiz.i, quiz.questions.length)}%"></i></div>
        <div class="q-card">
          <div class="q-src">
            <span class="chip accent">${esc(label)}</span>
            <span class="chip">${esc(sourceLabel)}</span>
            ${quiz.mode === 'paper' ? '<span class="chip brass">Past paper</span>' : ''}
          </div>
          <h2 class="q-text">${inline(q.q)}</h2>
          <div class="options" role="group" aria-label="Answer options">
            ${(q.o || []).map((opt, i) => {
              let cls = 'opt';
              if (picked != null) {
                if (i === q.a) cls += ' correct';
                else if (i === picked) cls += ' wrong';
                else cls += ' dim';
              }
              return `<button class="${cls}" type="button" data-action="answer" data-i="${i}" ${picked != null ? 'disabled' : ''}>
                <span class="key">${letters[i] || i + 1}</span><span>${inline(opt)}</span>
              </button>`;
            }).join('')}
          </div>
          ${picked != null ? `
            <div class="explain">
              <b>${isCorrect ? 'Correct' : 'Not quite'}</b>
              ${q.why ? inline(q.why) : `The correct answer is ${letters[q.a]}.`}
              ${!isCorrect && q.ow && q.ow[picked] ? `<div class="opt-why">${inline(q.ow[picked])}</div>` : ''}
            </div>
            <div class="quiz-actions">
              <span class="mono muted" style="font-size:.72rem">Press 1–${(q.o || []).length} to answer · Enter for next</span>
              <span class="grow"></span>
              <button class="btn primary" type="button" data-action="quiz-next">${quiz.i + 1 === quiz.questions.length ? 'See results' : 'Next question'} ${icon('arrow')}</button>
            </div>` : `
            <div class="quiz-actions">
              <span class="mono muted" style="font-size:.72rem">Press 1–${(q.o || []).length} to answer</span>
            </div>`}
        </div>
        <p class="mono muted" style="font-size:.7rem;text-align:center;margin-top:14px">${quiz.mode === 'paper' ? 'Answer key is hidden until you submit each question.' : 'Your best score is saved for this track.'}</p>
      </div>`;
  }

  function viewQuizResult(meta, trackMeta) {
    const quiz = app.quiz;
    const total = quiz.questions.length;
    const passed = quiz.score >= 70;
    const review = quiz.questions.map((item, idx) => {
      const ans = quiz.answers.find(a => a.key === item.key);
      const ok = ans && ans.correct;
      return `<div class="review-item ${ok ? 'good' : 'bad'}">
        <div class="ri-q">${idx + 1}. ${inline(item.q.q)}</div>
        <div class="ri-a">${ok ? '✓ Correct' : `✗ Your answer: ${ans ? inline(item.q.o[ans.choice]) : 'not answered'} · Correct: ${inline(item.q.o[item.q.a])}`}</div>
        ${!ok && (item.q.why || (item.q.ow && item.q.ow[item.q.a])) ? `<div class="ri-a" style="margin-top:6px">${inline(item.q.why || item.q.ow[item.q.a])}</div>` : ''}
      </div>`;
    }).join('');
    return `
      <div class="quiz-wrap">
        <div class="result">
          <div class="score-ring" style="--pct:${quiz.score}"><b>${quiz.score}%</b></div>
          <h2>${passed ? 'Passed.' : 'Keep going.'}</h2>
          <p>${quiz.correct} of ${total} correct${quiz.mode === 'paper' ? ` · ${esc(quiz.paperTitle)}` : ` · best ${getProgress(quiz.courseId, quiz.trackId).best}% this track`}.</p>
          <div class="btn-row">
            <button class="btn primary" type="button" data-action="quiz-retry">${icon('refresh')} Try again</button>
            <button class="btn" type="button" data-action="quiz-new">New quiz</button>
            <a class="btn ghost" href="${hrefCourse(meta.id, trackMeta.id)}">Back to path</a>
          </div>
          <details style="margin-top:26px;text-align:left">
            <summary style="cursor:pointer;font-family:var(--mono);font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)">Review all ${total} answers</summary>
            <div class="review">${review}</div>
          </details>
        </div>
      </div>`;
  }

  /* ── past papers ────────────────────────────────────────────────────── */

  function viewPapers(meta, trackMeta, course) {
    const exams = course.exams || [];
    return `
      <div class="section-head">
        <div>
          <h2>Past papers</h2>
          <p>Work through a paper, or read the answer key first. Papers draw on the whole course, not only one ${esc(trackMeta.unit.toLowerCase())}.</p>
        </div>
        <span class="chip">${exams.length} paper${exams.length === 1 ? '' : 's'}</span>
      </div>
      ${exams.length ? `<div class="papers-grid">${exams.map(exam => `
        <article class="paper-card">
          <div class="pc-top">
            <span class="pc-icon">${icon('file')}</span>
            <span class="chip brass">${esc(exam.kind)}${exam.year ? ' · ' + esc(exam.year) : ''}</span>
          </div>
          <h3>${esc(exam.title)}</h3>
          <p>${esc(exam.note || 'A full paper with worked explanations.')}</p>
          <div class="pc-meta">
            ${exam.questions.length ? `<span class="chip">${exam.questions.length} MCQ${exam.questions.length === 1 ? '' : 's'}</span>` : ''}
            ${exam.writtenCount ? `<span class="chip">${exam.writtenCount} written</span>` : ''}
            <span class="chip">${mins(exam.mins)}</span>
          </div>
          <div class="pc-actions">
            <a class="btn primary small" href="${hrefCourse(meta.id, trackMeta.id, 'papers', exam.id)}">${icon('play')} Open paper</a>
            ${exam.questions.length ? `<button class="btn small" type="button" data-action="start-paper" data-id="${exam.id}" data-timed="1">${icon('clock')} Timed</button>` : ''}
          </div>
        </article>`).join('')}</div>` : `<div class="empty"><h3>No papers yet</h3>Add <span class="mono">exams</span> to the course source and rebuild.</div>`}`;
  }

  function paperMcqHtml(q, i) {
    return `<details class="qa-item">
      <summary><span class="qa-n">Q${i + 1}</span><span>${inline(q.q)}</span></summary>
      <div class="qa-a">
        <ol type="A" style="padding-left:20px;display:grid;gap:5px">${(q.o || []).map((o, oi) => `<li style="${oi === q.a ? 'font-weight:650;color:var(--ok)' : ''}">${inline(o)}${oi === q.a ? ' ✓' : ''}</li>`).join('')}</ol>
        ${q.why ? `<p style="margin:10px 0 0">${inline(q.why)}</p>` : ''}
      </div>
    </details>`;
  }

  function paperWrittenHtml(item, i) {
    return `<details class="qa-item">
      <summary><span class="qa-n">W${i + 1}</span><span>${inline(item.q)}</span></summary>
      <div class="qa-a">
        <div class="written-answer">${inline(item.ans)}</div>
        ${item.why ? `<p class="mono muted" style="margin:10px 0 0;font-size:.72rem">${inline(item.why)}</p>` : ''}
      </div>
    </details>`;
  }

  function viewPaperDetail(meta, trackMeta, course, examId) {
    const exam = (course.exams || []).find(e => e.id === examId);
    if (!exam) return `<div class="empty"><h3>Paper not found</h3><a class="btn" href="${hrefCourse(meta.id, trackMeta.id, 'papers')}">All papers</a></div>`;
    const hasSections = (exam.sections || []).length > 0;
    return `
      <div class="section-head">
        <div>
          <p class="kicker">${esc(exam.kind)}${exam.year ? ' · ' + esc(exam.year) : ''}</p>
          <h2>${esc(exam.title)}</h2>
          <p>${esc(exam.note || '')}</p>
          ${exam.meta ? `<p class="mono muted" style="font-size:.72rem;margin-top:8px">${esc(exam.meta)}</p>` : ''}
        </div>
        <a class="btn ghost small" href="${hrefCourse(meta.id, trackMeta.id, 'papers')}">${icon('left')} All papers</a>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px">
        ${exam.questions.length ? `
          <button class="btn primary" type="button" data-action="start-paper" data-id="${exam.id}" data-timed="0">${icon('play')} Practise ${exam.questions.length} MCQs</button>
          <button class="btn" type="button" data-action="start-paper" data-id="${exam.id}" data-timed="1">${icon('clock')} Timed · ${mins(exam.mins)}</button>` : ''}
        ${exam.writtenCount ? `<span class="chip">${exam.writtenCount} written answers</span>` : ''}
      </div>
      ${hasSections ? (exam.sections || []).map(section => `
        <div class="paper-section">
          <div class="section-head" style="margin:26px 0 12px">
            <div>
              <h3 style="margin:0;font-family:var(--serif);font-size:1.25rem">${esc(section.title)}</h3>
              ${section.marks ? `<p style="margin:4px 0 0">${esc(section.marks)}</p>` : ''}
            </div>
          </div>
          <div class="qa-list">
            ${section.items.map((item, i) => item.type === 'written' ? paperWrittenHtml(item, i) : paperMcqHtml(item, i)).join('')}
          </div>
        </div>`).join('') : `<div class="qa-list">${exam.questions.map((q, i) => paperMcqHtml(q, i)).join('')}</div>`}`;
  }

  /* ── progress ───────────────────────────────────────────────────────── */

  function viewProgress(course, meta, trackMeta, track, progress) {
    const sessions = track.sessions || [];
    const cards = trackMeta.cards;
    const readPct = pct(progress.read.length, sessions.length);
    const knownPct = pct(progress.known.length, cards);
    const missed = progress.miss.map(key => findMissing(meta, trackMeta, track, key)).filter(Boolean);
    return `
      <div class="section-head">
        <div>
          <h2>Progress</h2>
          <p>Saved in this browser. Switching between ${esc(trackMeta.name)} and the other track keeps two independent records.</p>
        </div>
        <span class="chip ${readPct === 100 ? 'ok' : 'accent'}">${readPct === 100 ? 'Track read ✓' : readPct + '% read'}</span>
      </div>
      <div class="progress-grid">
        <div class="prog-card">
          <h3>Reading</h3>
          <div class="big">${progress.read.length}<span class="muted" style="font-size:1rem">/${sessions.length}</span></div>
          <p class="sub">${esc(trackMeta.units)} marked as read</p>
          <div class="meter"><i style="width:${readPct}%"></i></div>
        </div>
        <div class="prog-card">
          <h3>Flashcards</h3>
          <div class="big">${progress.known.length}<span class="muted" style="font-size:1rem">/${cards}</span></div>
          <p class="sub">cards marked known</p>
          <div class="meter brass"><i style="width:${knownPct}%"></i></div>
        </div>
        <div class="prog-card">
          <h3>Quizzes</h3>
          <div class="big">${progress.best == null ? '–' : progress.best + '%'}</div>
          <p class="sub">best score · ${progress.attempts} attempt${progress.attempts === 1 ? '' : 's'} · pass at 70%</p>
          <div class="meter"><i style="width:${progress.best || 0}%"></i></div>
        </div>
      </div>
      <div class="miss-panel">
        <h3>Questions to revisit ${missed.length ? `<span class="chip brass" style="margin-left:6px">${missed.length}</span>` : ''}</h3>
        ${missed.length ? `
          <div class="miss-list">
            ${missed.map(m => `<div class="miss-row"><span class="chip accent">${esc(m.label)}</span><span>${inline(m.q.q)}</span></div>`).join('')}
          </div>
          <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap">
            <button class="btn primary small" type="button" data-action="practice-missed">${icon('quiz')} Practise these ${missed.length}</button>
            <button class="btn small" type="button" data-action="clear-miss">Clear list</button>
          </div>` : `<p class="muted" style="font-size:.9rem;margin:0">Nothing here. Missed questions appear after an incorrect quiz answer, and leave once you get them right.</p>`}
      </div>
      <div class="danger-zone">
        <button class="btn danger small" type="button" data-action="reset-progress">Reset ${esc(trackMeta.name)} progress</button>
        <span class="mono muted" style="font-size:.7rem;align-self:center">Clears read marks, known cards, best score and missed questions for this track only.</span>
      </div>`;
  }

  /* ── course page ────────────────────────────────────────────────────── */

  const MODES = ['path', 'read', 'cards', 'qa', 'quiz', 'papers', 'progress'];

  function readTarget(track, progress, rawN) {
    const sessions = track.sessions || [];
    if (rawN != null && sessions.some(s => s.n === Number(rawN))) return Number(rawN);
    const unread = sessions.find(s => !progress.read.includes(s.n));
    if (unread) return unread.n;
    if (progress.lastRead && sessions.some(s => s.n === progress.lastRead)) return progress.lastRead;
    return sessions[0] ? sessions[0].n : 1;
  }

  function viewCourse() {
    const route = app.route;
    const meta = courseMeta(route.id);
    if (!meta) return notFound(`No course called “${route.id}”.`);
    const trackId = trackIdFor(route, meta);
    const trackMeta = meta.tracks[trackId];
    const course = courseData(route.id);

    if (!course) {
      const body = app.courseError
        ? `<div class="empty" style="max-width:640px;margin:40px auto">
            <h3>Couldn't load this course</h3>
            <p>${esc(app.courseError)}</p>
            <p class="mono" style="font-size:.78rem">Run <b>node build.mjs</b> in the project root, then reload. The page expects <b>data/${esc(route.id)}.js</b>.</p>
            <button class="btn primary" type="button" data-action="retry-course">Try again</button>
          </div>`
        : `<div class="wrap view-body"><div class="skel" style="height:38px;max-width:320px;margin:20px 0"></div><div class="skel" style="height:220px;margin:20px 0"></div><div class="skel" style="height:80px"></div></div>`;
      return `<section class="hero"><div class="hero-in"><p class="hero-kicker"><span>${esc(meta.code || '')}</span><span class="bar"></span><span>Opening</span></p><h1>${esc(meta.name)}</h1><p class="hero-lede">${esc(meta.description || '')}</p></div></section>${body}`;
    }

    const track = course.tracks[trackId];
    if (!track || !trackMeta) return notFound(`This course has no “${trackId}” track.`);
    const progress = getProgress(meta.id, trackId);
    const mode = MODES.includes(route.mode) ? route.mode : 'path';
    let body = '';

    if (mode === 'path') {
      body = viewPath(meta, trackMeta, track, progress);
    } else if (mode === 'read') {
      const n = readTarget(track, progress, route.n);
      body = viewRead(meta, trackMeta, track, progress, n);
    } else if (mode === 'cards') {
      const n = route.n != null && /^\d+$/.test(String(route.n)) && Number(route.n) > 0 ? Number(route.n) : null;
      body = viewCards(course, meta, trackMeta, track, progress, n);
    } else if (mode === 'qa') {
      if (route.n && (track.sessions || []).some(s => s.n === Number(route.n))) app.qaScope = Number(route.n);
      body = viewQa(meta, trackMeta, track);
    } else if (mode === 'quiz') {
      if (!app.quiz && route.n && (track.sessions || []).some(s => s.n === Number(route.n))) app.quizSetup.scope = Number(route.n);
      if (app.quiz) body = app.quiz.finished ? viewQuizResult(meta, trackMeta) : viewQuizActive(meta, trackMeta);
      else body = viewQuizSetup(meta, trackMeta, track, progress);
    } else if (mode === 'papers') {
      const examId = route.n;
      if (examId && app.quiz && app.quiz.paperId === examId && app.quiz.courseId === meta.id) {
        body = app.quiz.finished ? viewQuizResult(meta, trackMeta) : viewQuizActive(meta, trackMeta);
      } else if (examId) {
        body = viewPaperDetail(meta, trackMeta, course, examId);
      } else {
        body = viewPapers(meta, trackMeta, course);
      }
    } else if (mode === 'progress') {
      body = viewProgress(course, meta, trackMeta, track, progress);
    }

    return `${courseHero(meta, trackMeta, progress)}${tabsHtml(meta, trackMeta)}<div class="wrap view-body">${body}</div>`;
  }

  function notFound(message) {
    return `<div class="wrap"><div class="empty" style="max-width:560px;margin:60px auto">
      <h3>Not found</h3><p>${esc(message || 'That page does not exist.')}</p>
      <a class="btn primary" href="#/">Back to the library</a>
    </div></div>`;
  }

  /* ── master render ──────────────────────────────────────────────────── */

  function quizVisible() {
    const route = app.route;
    if (!route || route.view !== 'course' || !app.quiz) return false;
    return route.mode === 'quiz' || (route.mode === 'papers' && String(route.n) === String(app.quiz.paperId));
  }

  function render(options = {}) {
    if (!app.manifest && !app.fatal) return;
    const y = window.scrollY;
    renderShell();
    const view = $('#view');
    if (!view) return;

    if (app.fatal) {
      view.innerHTML = `<div class="wrap"><div class="empty" style="max-width:640px;margin:70px auto;text-align:left">
        <p class="kicker">Setup needed</p>
        <h3 style="font-size:1.5rem">${esc(app.fatal.title)}</h3>
        <p>${esc(app.fatal.message)}</p>
        <div class="code-block"><div class="code-head"><span class="dots"><i></i><i></i><i></i></span>terminal</div><pre><code>${esc(app.fatal.command || 'node build.mjs')}</code></pre></div>
        <p class="muted" style="font-size:.85rem">${esc(app.fatal.hint || '')}</p>
        <button class="btn primary" type="button" data-action="reload">Reload after building</button>
      </div></div>`;
      return;
    }

    const route = app.route || { view: 'home' };
    let html;
    if (route.view === 'home') html = viewHome();
    else if (route.view === 'search') html = viewSearch();
    else if (route.view === 'course') html = viewCourse();
    else html = notFound();
    view.innerHTML = html;

    if (options.keepScroll) {
      requestAnimationFrame(() => window.scrollTo(0, y));
    }

    if (quizVisible()) startTimer();
    else stopTimer();
  }

  /* ── loading a route ────────────────────────────────────────────────── */

  async function ensureManifest() {
    // index.html loads data/manifest.js before app.js, so a missing manifest means
    // the project has not been built (or the file failed to download).
    if (window.MANIFEST && window.MANIFEST.courses) return window.MANIFEST;
    throw new Error('data/manifest.js is missing or empty');
  }

  async function loadAllCourses() {
    const ids = Object.keys((app.manifest && app.manifest.courses) || {});
    await Promise.all(ids.map(id => ensureCourse(id).catch(() => null)));
  }

  async function routeTo(route, options = {}) {
    // A quiz only survives while its own view is on screen.
    if (app.quiz) {
      const staying = route.view === 'course' &&
        (route.mode === 'quiz' || (route.mode === 'papers' && String(route.n) === String(app.quiz.paperId)));
      if (!staying) {
        stopTimer();
        app.quiz = null;
      }
    }

    if (route.view === 'course' && !MODES.includes(route.mode)) route.mode = 'path';
    app.route = route;
    app.courseError = null;

    if (route.view === 'course') {
      const meta = courseMeta(route.id);
      if (meta) {
        const trackId = trackIdFor(route, meta);
        store.set(`track:${meta.id}`, trackId);
        if (!courseData(route.id)) {
          render();
          try {
            await ensureCourse(route.id);
          } catch (error) {
            app.courseError = error.message;
          }
        }
        const course = courseData(route.id);
        const track = course && course.tracks[trackId];
        const trackMeta = meta.tracks[trackId];
        if (course && track && trackMeta) {
          if (route.mode === 'read') {
            const progress = getProgress(meta.id, trackId);
            progress.lastRead = readTarget(track, progress, route.n);
            saveProgress(meta.id, trackId, progress);
          }
          store.set('last', { course: meta.id, track: trackId, mode: route.mode || 'path' });
        }
      }
    }

    if (route.view === 'search') {
      app.searchQuery = route.q || app.searchQuery || '';
      await loadAllCourses();
      app.index = null;
    }

    render();
    if (!options.silent) {
      requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }));
    }
    updateTitle();
  }

  function updateTitle() {
    const route = app.route;
    let title = 'Study — Operating Systems';
    if (route && route.view === 'course') {
      const meta = courseMeta(route.id);
      if (meta) {
        const trackId = trackIdFor(route, meta);
        const tm = meta.tracks[trackId];
        title = `${meta.short || meta.name} · ${tm ? tm.name : trackId} — Study`;
        if (route.mode === 'read') {
          const course = courseData(route.id);
          const readTrack = course && course.tracks && course.tracks[trackId];
          if (readTrack && tm) {
            const sessions = readTrack.sessions || [];
            const progress = getProgress(meta.id, trackId);
            const s = sessions.find(x => x.n === readTarget(readTrack, progress, route.n));
            if (s) title = `${sessionLabel(tm, s.n)} · ${s.title} — Study`;
          }
        }
      }
    } else if (route && route.view === 'search') {
      title = 'Search — Study';
    }
    document.title = title;
  }

  /* ── navigation helpers ─────────────────────────────────────────────── */

  function openSearch() {
    if (!app.route || app.route.view !== 'search') go('#/search');
    const focus = () => $('#search-input')?.focus();
    setTimeout(focus, 80);
    setTimeout(focus, 260);
  }

  function closeNav() {
    document.body.classList.remove('nav-open');
    const btn = $('[data-action="open-nav"]');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function toggleNav() {
    const open = document.body.classList.toggle('nav-open');
    const btn = $('[data-action="open-nav"]');
    if (btn) btn.setAttribute('aria-expanded', String(open));
  }

  function switchTrack(nextTrack) {
    const route = app.route;
    if (!route || route.view !== 'course') return;
    const meta = courseMeta(route.id);
    if (!meta || !meta.tracks[nextTrack]) return;
    if (trackIdFor(route, meta) === nextTrack) return;
    const course = courseData(route.id);
    if (!course) return;
    stopTimer();
    app.quiz = null;
    app.deck = null;
    app.qaScope = 'all';
    store.set(`track:${meta.id}`, nextTrack);
    const nextMeta = meta.tracks[nextTrack];
    const mode = MODES.includes(route.mode) ? route.mode : 'path';
    let n = null;
    if (mode === 'read') {
      const track = course.tracks[nextTrack];
      n = readTarget(track, getProgress(meta.id, nextTrack), null);
    }
    toast(`${nextMeta.name} — ${nextMeta.count} ${nextMeta.units}, separate progress.`);
    go(hrefCourse(meta.id, nextTrack, mode, n));
  }

  function toggleOtherTrack() {
    const route = app.route;
    if (!route || route.view !== 'course') return;
    const meta = courseMeta(route.id);
    if (!meta || !meta.tracks) return;
    const ids = meta.trackOrder || Object.keys(meta.tracks);
    if (ids.length < 2) return;
    const current = trackIdFor(route, meta);
    const next = ids.find(id => id !== current);
    if (next) switchTrack(next);
  }

  /* ── deck actions ───────────────────────────────────────────────────── */

  function deckFlip() {
    const deck = app.deck;
    const card = $('#flashcard');
    if (!deck || !card) return;
    deck.flipped = !deck.flipped;
    card.classList.toggle('flipped', deck.flipped);
    card.setAttribute('aria-label', `Flashcard. ${deck.flipped ? 'Showing the answer.' : 'Showing the question. Press Space to reveal the answer.'}`);
    card.querySelector('.fc-front')?.setAttribute('aria-hidden', String(deck.flipped));
    card.querySelector('.fc-back')?.setAttribute('aria-hidden', String(!deck.flipped));
  }

  function deckAdvance(got) {
    const deck = app.deck;
    if (!deck) return;
    const item = deck.items[deck.pos];
    if (item && got) {
      const key = `${item.n}:${item.i}`;
      const progress = getProgress(deck.course, deck.track);
      if (!progress.known.includes(key)) {
        progress.known.push(key);
        saveProgress(deck.course, deck.track, progress);
        deck.got += 1;
      }
    }
    deck.pos += 1;
    deck.flipped = false;
    render({ keepScroll: true });
  }

  /* ── event handling ─────────────────────────────────────────────────── */

  function findExam(examId) {
    const course = courseData(app.route.id);
    return (course && (course.exams || []).find(e => e.id === examId)) || null;
  }

  function onClick(event) {
    const el = event.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;
    const route = app.route;

    switch (action) {
      case 'theme': {
        const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        render({ keepScroll: true });
        break;
      }
      case 'open-nav': toggleNav(); break;
      case 'close-nav': closeNav(); break;
      case 'open-search': openSearch(); break;
      case 'reload': location.reload(); break;
      case 'retry-course': routeTo(route); break;
      case 'print': window.print(); break;

      case 'track': switchTrack(el.dataset.track); break;
      case 'mode':
        if (route && route.view === 'course') {
          const meta = courseMeta(route.id);
          const trackId = trackIdFor(route, meta);
          go(hrefCourse(meta.id, trackId, el.dataset.mode));
        }
        break;
      case 'open-session':
        if (route && route.view === 'course') {
          const meta = courseMeta(route.id);
          go(hrefCourse(meta.id, trackIdFor(route, meta), 'read', Number(el.dataset.n)));
        }
        break;
      case 'mark-read': {
        const meta = courseMeta(route.id);
        const trackId = trackIdFor(route, meta);
        const progress = getProgress(meta.id, trackId);
        const n = Number(el.dataset.n);
        if (progress.read.includes(n)) {
          progress.read = progress.read.filter(x => x !== n);
          toast(`Read mark removed from ${meta.tracks[trackId].unit} ${n}`);
        } else {
          progress.read.push(n);
          const tm = meta.tracks[trackId];
          toast(`${tm.unit} ${n} marked as read`);
        }
        saveProgress(meta.id, trackId, progress);
        render({ keepScroll: true });
        break;
      }
      case 'quiz-session': {
        startQuiz({ scope: Number(el.dataset.n), count: 'all', timer: 0 });
        const meta = courseMeta(route.id);
        go(hrefCourse(meta.id, trackIdFor(route, meta), 'quiz'));
        break;
      }
      case 'cards-session': {
        const meta = courseMeta(route.id);
        const n = Number(el.dataset.n);
        app.deckScope = n;
        app.deck = null;
        go(hrefCourse(meta.id, trackIdFor(route, meta), 'cards', n));
        break;
      }
      case 'deck-scope': {
        app.deckScope = Number(el.dataset.n);
        app.deck = null;
        const meta = courseMeta(route.id);
        const trackId = trackIdFor(route, meta);
        const n = Number(el.dataset.n);
        go(hrefCourse(meta.id, trackId, 'cards', n || null));
        break;
      }
      case 'deck-mode':
        app.deckMode = el.dataset.mode;
        app.deck = null;
        render({ keepScroll: true });
        break;
      case 'deck-restart':
        if (app.deck) {
          app.deck.items = shuffle(app.deck.items);
          app.deck.pos = 0;
          app.deck.got = 0;
          app.deck.flipped = false;
        }
        render({ keepScroll: true });
        break;
      case 'flip': deckFlip(); break;
      case 'deck-got': deckAdvance(true); break;
      case 'deck-again': deckAdvance(false); break;

      case 'qa-scope':
        app.qaScope = el.dataset.n === 'all' ? 'all' : Number(el.dataset.n);
        render({ keepScroll: true });
        break;
      case 'qa-toggle': {
        const items = $$('.qa-list details');
        const allOpen = items.every(d => d.open);
        items.forEach(d => { d.open = !allOpen; });
        el.textContent = allOpen ? 'Expand all' : 'Collapse all';
        break;
      }

      case 'quiz-scope':
        app.quizSetup.scope = el.dataset.scope === 'all' ? 'all' : Number(el.dataset.scope);
        render({ keepScroll: true });
        break;
      case 'quiz-count':
        app.quizSetup.count = el.dataset.count === 'all' ? 'all' : Number(el.dataset.count);
        render({ keepScroll: true });
        break;
      case 'quiz-timer':
        app.quizSetup.timer = Number(el.dataset.timer) || 0;
        render({ keepScroll: true });
        break;
      case 'quiz-start':
        startQuiz(app.quizSetup);
        render();
        break;
      case 'answer': answerQuiz(Number(el.dataset.i)); break;
      case 'quiz-next': nextQuestion(); break;
      case 'quiz-quit':
        stopTimer();
        app.quiz = null;
        render();
        break;
      case 'quiz-new':
        stopTimer();
        app.quiz = null;
        render();
        break;
      case 'quiz-retry': {
        const old = app.quiz;
        if (!old) break;
        if (old.mode === 'paper') {
          const exam = findExam(old.paperId);
          if (exam) startQuiz({ paper: exam, timed: old.timeLimit > 0 });
        } else if (old.mode === 'practice') {
          startQuiz({ items: old.questions, timer: Math.round((old.timeLimit || 0) / 60) });
        } else {
          startQuiz({ scope: old.scope, count: old.questions.length, timer: Math.round((old.timeLimit || 0) / 60) });
        }
        render();
        break;
      }
      case 'start-paper': {
        const exam = findExam(el.dataset.id);
        if (!exam) break;
        startQuiz({ paper: exam, timed: el.dataset.timed === '1' });
        const meta = courseMeta(route.id);
        go(hrefCourse(meta.id, trackIdFor(route, meta), 'papers', exam.id));
        break;
      }
      case 'practice-missed': {
        const meta = courseMeta(route.id);
        const trackId = trackIdFor(route, meta);
        const course = courseData(route.id);
        const track = course.tracks[trackId];
        const trackMeta = meta.tracks[trackId];
        const progress = getProgress(meta.id, trackId);
        const items = progress.miss.map(key => findMissing(meta, trackMeta, track, key)).filter(Boolean)
          .map(m => ({ q: m.q, key: m.key, n: m.n, extra: m.extra, label: m.label }));
        if (!items.length) { toast('No missed questions to practise.'); break; }
        startQuiz({ items, timer: 0 });
        go(hrefCourse(meta.id, trackId, 'quiz'));
        break;
      }
      case 'clear-miss': {
        const meta = courseMeta(route.id);
        const trackId = trackIdFor(route, meta);
        const progress = getProgress(meta.id, trackId);
        progress.miss = [];
        saveProgress(meta.id, trackId, progress);
        render({ keepScroll: true });
        break;
      }
      case 'reset-progress': {
        const meta = courseMeta(route.id);
        const trackId = trackIdFor(route, meta);
        const tm = meta.tracks[trackId];
        if (!window.confirm(`Reset all ${tm.name} progress for ${meta.short}? This cannot be undone.`)) break;
        store.del(`progress:${meta.id}:${trackId}`);
        app.quiz = null;
        app.deck = null;
        render();
        toast(`${tm.name} progress reset.`);
        break;
      }
      case 'suggest': {
        const input = $('#search-input');
        const q = el.dataset.q || '';
        if (input) input.value = q;
        app.searchQuery = q;
        const out = $('#search-output');
        if (out) out.innerHTML = searchResultsHtml(q);
        if (input) input.focus();
        break;
      }
      default: break;
    }
  }

  let searchDebounce = null;
  function onInput(event) {
    const target = event.target;
    if (target && target.id === 'search-input') {
      const value = target.value;
      app.searchQuery = value;
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        const out = $('#search-output');
        if (out) out.innerHTML = searchResultsHtml(value);
      }, 110);
    }
  }

  function onSubmit(event) {
    if (event.target && event.target.matches('[data-form="search"]')) {
      event.preventDefault();
      const first = $('.result-row');
      if (first) first.click();
    }
  }

  function isTyping(target) {
    if (!target) return false;
    return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable;
  }

  function onKey(event) {
    if (event.key === 'Escape') {
      closeNav();
      const input = $('#search-input');
      if (input && document.activeElement === input) {
        input.value = '';
        app.searchQuery = '';
        const out = $('#search-output');
        if (out) out.innerHTML = searchResultsHtml('');
      }
      return;
    }
    if (isTyping(event.target) || event.metaKey || event.ctrlKey || event.altKey) return;
    const route = app.route;

    if (quizVisible() && app.quiz && !app.quiz.finished) {
      const item = app.quiz.questions[app.quiz.i];
      if (item && /^[1-6]$/.test(event.key)) {
        const choice = Number(event.key) - 1;
        if (app.quiz.picked == null && choice < (item.q.o || []).length) {
          event.preventDefault();
          answerQuiz(choice);
        }
      } else if (event.key === 'Enter' && app.quiz.picked != null) {
        event.preventDefault();
        nextQuestion();
      }
      return;
    }

    if (event.key === '/') {
      event.preventDefault();
      openSearch();
      return;
    }
    if ((event.key === 't' || event.key === 'T') && route && route.view === 'course') {
      event.preventDefault();
      toggleOtherTrack();
      return;
    }

    if (route && route.view === 'course' && route.mode === 'cards' && app.deck) {
      if (event.key === ' ' || event.key === 'Enter') {
        if (event.target.id === 'flashcard' || document.activeElement === document.body) {
          event.preventDefault();
          deckFlip();
        }
      } else if (event.key === '1') {
        event.preventDefault();
        deckAdvance(false);
      } else if (event.key === '2') {
        event.preventDefault();
        deckAdvance(true);
      }
    }
  }

  /* ── boot ───────────────────────────────────────────────────────────── */

  async function onRoute() {
    closeNav();
    await routeTo(parseRoute());
    const view = $('#view');
    if (view) view.focus({ preventScroll: true });
  }

  function bindEvents() {
    document.addEventListener('click', onClick);
    document.addEventListener('input', onInput);
    document.addEventListener('submit', onSubmit);
    document.addEventListener('keydown', onKey);
    window.addEventListener('hashchange', onRoute);
    // Close the mobile drawer when a link inside it is followed.
    document.addEventListener('click', event => {
      if (event.target.closest('.sidebar a[href^="#/"]')) closeNav();
    });
  }

  async function boot() {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(store.get('theme', prefersDark ? 'dark' : 'light'));
    bindEvents();
    try {
      app.manifest = await ensureManifest();
    } catch (error) {
      app.fatal = {
        title: 'Build the course data first',
        message: 'The app could not find data/manifest.js, so there is nothing to read yet. Generate it from the editable source files.',
        command: 'node build.mjs',
        hint: 'Edit courses/os.js, run the command above from the repository root, then reload this page.'
      };
      render();
      return;
    }
    await routeTo(parseRoute(), { silent: true });
    document.body.classList.add('ready');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
