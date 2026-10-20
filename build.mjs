// Builds the files the page loads from the editable course sources (courses/<id>.js or <id>.js).
//   data/<id>.js   one course, minified, wrapped in JSON.parse (faster to parse than an object literal)
//   manifest.js    names, tracks and counts for the shelf, so the home page loads without any course data
// Run: node build.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import vm from 'node:vm';

const BASE_SOURCES = ['os', 'algo', 'swe', 'files', 'sad', 'dbms'];
const extraInCourses = existsSync('courses')
  ? readdirSync('courses').filter(f => f.endsWith('.js')).map(f => f.replace(/\.js$/, ''))
  : [];
const SOURCES = [...new Set([...BASE_SOURCES, ...extraInCourses])];

const ctx = {};
ctx.window = ctx; // the sources use window as the global object, like a browser
vm.createContext(ctx);
for (const f of SOURCES) {
  const srcPath = existsSync(`courses/${f}.js`) ? `courses/${f}.js` : existsSync(`${f}.js`) ? `${f}.js` : null;
  if (srcPath) vm.runInContext(readFileSync(srcPath, 'utf8'), ctx, { filename: srcPath });
}
const COURSES = ctx.window.COURSES || {};

function normalizeSession(s) {
  s.notes = (s.notes || []).map(n => {
    const out = Object.assign({}, n);
    if (typeof out.formula === 'string') out.formula = [out.formula];
    if (Array.isArray(out.code)) out.code = out.code.join('\n');
    out.pts = out.pts || [];
    return out;
  });
  s.videos = s.videos || [];
  s.cards = s.cards || [];
  s.qa = s.qa || [];
  s.quiz = s.quiz || [];
  s.extra = s.extra || [];
  return s;
}

// Normalize courses that use the Track schema: Course -> Track (lectures / labs) -> Session -> Content
for (const c of Object.values(COURSES)) {
  if (c.tracks) {
    const lecSessions = ((c.tracks.lectures && c.tracks.lectures.sessions) || []).map(normalizeSession);
    const labSessions = ((c.tracks.labs && c.tracks.labs.sessions) || []).map(normalizeSession);
    if (c.tracks.lectures) c.tracks.lectures.sessions = lecSessions;
    if (c.tracks.labs) c.tracks.labs.sessions = labSessions;
    if (!c.lectures || !c.lectures.length) c.lectures = lecSessions;
    else c.lectures = c.lectures.map(normalizeSession);
  } else if (c.lectures) {
    c.lectures = c.lectures.map(normalizeSession);
  } else {
    c.lectures = [];
  }
  c.exams = c.exams || [];
}

// extra/<id>.js: practice questions written for the site (not the professor's), merged into each lecture as lecture.extra
for (const id of Object.keys(COURSES)) {
  const f = `extra/${id}.js`;
  if (existsSync(f)) vm.runInContext(readFileSync(f, 'utf8'), ctx, { filename: f });
}
const EXTRA = ctx.window.EXTRA || {};

// papers/<id>.js: full past-exam papers, plus exam questions that get merged into their lectures
for (const id of Object.keys(COURSES)) {
  const f = `papers/${id}.js`;
  if (existsSync(f)) vm.runInContext(readFileSync(f, 'utf8'), ctx, { filename: f });
}
const PAPERS = ctx.window.PAPERS || {};
for (const [id, P] of Object.entries(PAPERS)) {
  const c = COURSES[id];
  if (!c) continue;
  if (P.exams) c.exams = c.exams.concat(P.exams);
  if (P.quiz) for (const l of c.lectures) if (P.quiz[l.n]) l.quiz = l.quiz.concat(P.quiz[l.n]);
  if (P.qa) for (const l of c.lectures) if (P.qa[l.n]) l.qa = l.qa.concat(P.qa[l.n]);
}

// summary/<id>.js: optional additions from student summaries
for (const id of Object.keys(COURSES)) {
  const f = `summary/${id}.js`;
  if (existsSync(f)) vm.runInContext(readFileSync(f, 'utf8'), ctx, { filename: f });
}
const SUMMARY = ctx.window.SUMMARY || {};
for (const [id, S] of Object.entries(SUMMARY)) {
  const c = COURSES[id];
  if (!c) continue;
  for (const l of c.lectures) {
    if (S.notes && S.notes[l.n]) l.notes = l.notes.concat(S.notes[l.n]);
    if (S.cards && S.cards[l.n]) l.cards = l.cards.concat(S.cards[l.n]);
    if (S.quiz && S.quiz[l.n]) l.quiz = l.quiz.concat(S.quiz[l.n]);
    if (S.qa && S.qa[l.n]) l.qa = l.qa.concat(S.qa[l.n]);
  }
}

for (const [id, c] of Object.entries(COURSES)) {
  for (const l of c.lectures) l.extra = l.extra && l.extra.length ? l.extra : ((EXTRA[id] && EXTRA[id][l.n]) || []);
  if (c.tracks && c.tracks.labs && c.tracks.labs.sessions) {
    for (const s of c.tracks.labs.sessions) s.extra = s.extra || [];
  }
}

// where a quiz question came from: the professor (exam, sheet, lecture example), a student summary, or the site itself
const originOf = q => !q.src ? 'extra' : /^(exam|midterm)\b/i.test(q.src) ? 'exam' : /sheet|revision/i.test(q.src) ? 'sheet' : /^lecture\b/i.test(q.src) ? 'lecture' : /summary/i.test(q.src) ? 'summary' : 'extra';

function trackSummary(sessions, meta = {}) {
  return {
    id: meta.id || 'lectures',
    name: meta.name || 'Lectures',
    unit: meta.unit || 'Lecture',
    units: meta.units || 'lectures',
    prefix: meta.prefix || 'L',
    lectures: sessions.map(l => ({ n: l.n, code: l.code || ((meta.prefix || 'L') + l.n), title: l.title, videos: l.videos ? l.videos.length : 0 })),
    videos: sessions.reduce((a, l) => a + (l.videos ? l.videos.length : 0), 0),
    cards: sessions.reduce((a, l) => a + (l.cards ? l.cards.length : 0), 0),
    quiz: sessions.reduce((a, l) => a + (l.quiz ? l.quiz.length : 0) + (l.extra ? l.extra.length : 0), 0),
    prof: sessions.reduce((a, l) => a + (l.quiz || []).filter(q => ['exam', 'sheet', 'lecture'].includes(originOf(q))).length, 0),
    extra: sessions.reduce((a, l) => a + (l.quiz || []).filter(q => originOf(q) === 'extra').length + (l.extra ? l.extra.length : 0), 0),
    qa: sessions.reduce((a, l) => a + (l.qa ? l.qa.length : 0), 0),
    examQs: sessions.reduce((a, l) => a + (l.quiz || []).filter(q => q.src && /^(exam|midterm)\b/i.test(q.src)).length, 0)
  };
}

mkdirSync('data', { recursive: true });
const manifest = {};
for (const [id, c] of Object.entries(COURSES)) {
  const json = JSON.stringify(c);
  writeFileSync(`data/${id}.js`, `(window.COURSES=window.COURSES||{})[${JSON.stringify(id)}]=JSON.parse(${JSON.stringify(json)});\n`);
  const lecSummary = trackSummary(c.lectures, c.tracks && c.tracks.lectures);
  manifest[id] = {
    name: c.name, short: c.short, code: c.code, by: c.by,
    lectures: lecSummary.lectures,
    videos: lecSummary.videos,
    cards: lecSummary.cards,
    quiz: lecSummary.quiz,
    prof: lecSummary.prof,
    extra: lecSummary.extra,
    exams: (c.exams || []).length,
    qa: lecSummary.qa,
    examQs: lecSummary.examQs
  };
  if (c.tracks) {
    manifest[id].tracks = {
      lectures: lecSummary,
      labs: trackSummary((c.tracks.labs && c.tracks.labs.sessions) || [], Object.assign({ id: 'labs', name: 'Labs', unit: 'Lab', units: 'labs', prefix: 'Lab ' }, c.tracks.labs || {}))
    };
  }
  console.log(`data/${id}.js`.padEnd(20), (json.length / 1024).toFixed(0).padStart(5), 'KB');
}
for (const id of Object.keys(COURSES)) {
  const f = `ar/${id}.js`;
  if (!existsSync(f)) continue;
  vm.runInContext(readFileSync(f, 'utf8'), ctx, { filename: f });
  const a = ctx.window.AR && ctx.window.AR[id];
  if (!a) continue;
  const json = JSON.stringify(a);
  writeFileSync(`data/ar-${id}.js`, `(window.AR=window.AR||{})[${JSON.stringify(id)}]=JSON.parse(${JSON.stringify(json)});\n`);
  manifest[id].ar = 1;
  console.log(`data/ar-${id}.js`.padEnd(20), (json.length / 1024).toFixed(0).padStart(5), 'KB');
}
for (const aux of ['viz', 'figs']) {
  if (!existsSync(`${aux}.js`)) continue;
  const src = readFileSync(`${aux}.js`, 'utf8');
  writeFileSync(`data/${aux}.js`, src);
  console.log(`data/${aux}.js`.padEnd(20), (src.length / 1024).toFixed(0).padStart(5), 'KB');
}
const mjson = `window.MANIFEST=${JSON.stringify(manifest)};\n`;
writeFileSync('manifest.js', mjson);
writeFileSync('data/manifest.js', mjson);
console.log('manifest.js'.padEnd(20), (mjson.length / 1024).toFixed(1).padStart(5), 'KB');
