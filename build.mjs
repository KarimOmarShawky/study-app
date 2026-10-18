#!/usr/bin/env node
/*
 * build.mjs — turns the editable course sources in courses/ into the files the
 * static site loads at runtime.
 *
 *   data/<id>.js     one course, full data, as JSON.parse(...) for fast startup
 *   data/manifest.js names, tracks and counts only — the home page and the
 *                    track switcher work before any course data is loaded
 *
 * Usage:
 *   node build.mjs            build everything
 *   node build.mjs --check    validate only, write nothing
 *
 * Course files are plain scripts run in a sandbox with a browser-like `window`,
 * so the same file works with require(), with node, and could be dropped into a
 * page directly. Each file must register its course on window.COURSES, e.g.
 *
 *   (window.COURSES = window.COURSES || {})["os"] = { id: "os", ... };
 *   if (typeof module !== "undefined") module.exports = window.COURSES.os;
 *
 * Schema
 *   course  : id, name, short, code, by, color, description,
 *             tracks: { lectures|lab..., ... }, exams: []
 *   track   : label fields (name, unit, units, prefix) + sessions []
 *   session : n, title, mins, summary, tags, objectives,
 *             notes:   [{ h, pts[], list[], table{head,rows}, code, codeLang, callout }]
 *             cards:   [[front, back], ...]
 *             qa:      [[question, answer], ...]
 *             quiz:    [{ q, o[], a, why, src }, ...]
 *             extra:   [{ q, o[], a, why }, ...]   (optional practice questions)
 *   exam    : { id, title, kind, year, mins, questions: [quiz...] }
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import path from 'node:path';

const SRC_DIR = 'courses';
const OUT_DIR = 'data';
const CHECK_ONLY = process.argv.includes('--check');
const DEFAULT_COLOR = '#0f6b5c';

const errors = [];
const warnings = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const asArray = v => (Array.isArray(v) ? v : []);
const clean = v => (typeof v === 'string' ? v.trim() : '');

/* ── load sources ─────────────────────────────────────────────────────────── */

let files = [];
try {
  files = readdirSync(SRC_DIR).filter(f => f.endsWith('.js')).sort();
} catch {
  console.error(`✗ ${SRC_DIR}/ not found. Run this script from the repository root.`);
  process.exit(1);
}

if (!files.length) {
  console.error(`✗ No course files found in ${SRC_DIR}/. Add something like ${SRC_DIR}/os.js first.`);
  process.exit(1);
}

const sandbox = {
  console,
  window: null,
  module: { exports: {} },
  exports: {},
  setTimeout,
  clearTimeout
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

const rawCourses = new Map();

for (const file of files) {
  const filename = path.join(SRC_DIR, file);
  const source = readFileSync(filename, 'utf8');
  const before = sandbox.window.COURSES ? Object.keys(sandbox.window.COURSES) : [];
  try {
    vm.runInContext(source, sandbox, { filename });
  } catch (err) {
    console.error(`✗ ${filename} failed to run:\n  ${err.message}`);
    process.exit(1);
  }

  const exported = sandbox.module.exports;
  const bare = sandbox.window.COURSES || sandbox.COURSES || {};
  const keys = Object.keys(bare);
  const fresh = keys.filter(k => !before.includes(k));

  if (isObj(exported) && exported.id) {
    if (rawCourses.has(exported.id)) warn(filename, `course id "${exported.id}" overwrites an earlier file`);
    rawCourses.set(exported.id, { course: exported, file: filename });
  } else if (fresh.length) {
    for (const key of fresh) rawCourses.set(key, { course: bare[key], file: filename });
  } else if (keys.length) {
    // A course was overwritten rather than added; pick up changes anyway.
    for (const key of keys) rawCourses.set(key, { course: bare[key], file: filename });
  } else {
    fail(filename, 'did not register any course (set window.COURSES[id] or module.exports)');
  }
  sandbox.module.exports = {};
}

/* ── normalisation ────────────────────────────────────────────────────────── */

const TRACK_DEFAULTS = {
  lectures: { name: 'Lectures', unit: 'Lecture', units: 'lectures', prefix: 'L' },
  labs: { name: 'Labs', unit: 'Lab', units: 'labs', prefix: 'Lab ' }
};

function normalizeTable(table, where) {
  // Accept both { head, rows } and the compact [[header...], [cell...], ...]
  // form used by the CS332 source.
  if (Array.isArray(table)) {
    const rows = table.filter(Array.isArray).map(row => row.map(v => clean(String(v))));
    if (!rows.length) {
      warn(where, 'table without rows was dropped');
      return null;
    }
    return { head: rows[0], rows: rows.slice(1) };
  }
  if (!isObj(table) || !asArray(table.rows).length) {
    warn(where, 'table without rows was dropped');
    return null;
  }
  return {
    head: asArray(table.head).map(v => clean(String(v))),
    rows: asArray(table.rows).map(row => asArray(row).map(v => clean(String(v))))
  };
}

const plainText = value => String(value == null ? '' : value)
  .replace(/<pre[^>]*>[\s\S]*?<\/pre>/gi, ' ')
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/\s+/g, ' ')
  .trim();

const clipText = (text, max = 160) => {
  const value = plainText(text);
  if (value.length <= max) return value;
  const cut = value.slice(0, max);
  const at = cut.lastIndexOf(' ');
  return (at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[.,;:]$/, '') + '…';
};

function normalizeNotes(notes, where) {
  return asArray(notes).map((note, i) => {
    if (typeof note === 'string') return { h: '', pts: [note] };
    if (!isObj(note)) {
      warn(`${where} note ${i + 1}`, 'not an object; dropped');
      return null;
    }
    const out = {
      h: clean(note.h || note.heading || note.title),
      pts: asArray(note.pts || note.body || note.p).map(v => clean(String(v))),
      list: asArray(note.list || note.bullets).map(v => clean(String(v)))
    };
    if (note.table) {
      const table = normalizeTable(note.table, `${where} note ${i + 1}`);
      if (table) out.table = table;
    }
    if (note.code) {
      out.code = String(note.code).replace(/\s+$/, '');
      out.codeLang = clean(note.codeLang) || (
        /#include|\bstruct\b|->/.test(out.code) ? 'c'
          : /:::|BEGIN|END|dtrace/.test(out.code) ? 'dtrace'
            : 'code'
      );
    }
    if (note.formula) out.formula = clean(String(note.formula));
    if (note.callout) out.callout = clean(String(note.callout));
    if (!out.h && !out.pts.length && !out.list.length && !out.table && !out.code && !out.formula) {
      warn(`${where} note ${i + 1}`, 'is empty; dropped');
      return null;
    }
    return out;
  }).filter(Boolean);
}

function normalizeCards(cards, where) {
  return asArray(cards).map((card, i) => {
    if (Array.isArray(card) && card.length >= 2 && clean(String(card[0])) && clean(String(card[1]))) {
      return [clean(String(card[0])), clean(String(card[1]))];
    }
    if (isObj(card) && (card.front || card.q) && (card.back || card.a)) {
      return [clean(String(card.front || card.q)), clean(String(card.back || card.a))];
    }
    warn(`${where} card ${i + 1}`, 'needs a front and a back; dropped');
    return null;
  }).filter(Boolean);
}

function normalizeQa(qa, where) {
  return asArray(qa).map((item, i) => {
    if (Array.isArray(item) && item.length >= 2 && clean(String(item[0])) && clean(String(item[1]))) {
      return [clean(String(item[0])), clean(String(item[1]))];
    }
    if (isObj(item) && (item.q || item.question) && (item.a || item.answer)) {
      return [clean(String(item.q || item.question)), clean(String(item.a || item.answer))];
    }
    warn(`${where} Q&A ${i + 1}`, 'needs a question and an answer; dropped');
    return null;
  }).filter(Boolean);
}

function normalizeQuestion(q, where, allowSource = true) {
  if (!isObj(q)) {
    fail(where, 'question is not an object');
    return null;
  }
  const text = clean(q.q || q.question || q.text);
  const rawOptions = asArray(q.o || q.options || q.choices);
  let optionNotes = rawOptions.map(opt => {
    if (Array.isArray(opt)) return clean(String(opt[1] || ''));
    if (isObj(opt)) return clean(String(opt.why || opt.explanation || ''));
    return '';
  });
  if (asArray(q.ow).length) optionNotes = asArray(q.ow).map(v => clean(String(v || '')));
  let options = rawOptions.map(opt => {
    if (Array.isArray(opt)) return clean(String(opt[0]));
    if (isObj(opt)) return clean(String(opt.text || opt.t || opt.label));
    return clean(String(opt));
  });
  if (text.length < 3) fail(where, 'question text is empty or too short');
  if (options.length < 2) fail(where, 'needs at least two options');
  if (options.length > 6) {
    warn(where, `${options.length} options; keeping the first six`);
    options = options.slice(0, 6);
  }
  let answer = q.a ?? q.answer ?? q.correct;
  if (typeof answer === 'string' && /^[A-Fa-f]$/.test(answer)) answer = answer.toUpperCase().charCodeAt(0) - 65;
  else if (typeof answer === 'string' && /^\d+$/.test(answer)) answer = Number(answer);
  if (!Number.isInteger(answer) || answer < 0 || answer >= options.length) {
    fail(where, `answer index ${JSON.stringify(answer)} is not valid for ${options.length} options`);
    answer = 0;
  }
  const out = { q: text, o: options, a: answer };
  let why = clean(q.why || q.explanation || q.note) || optionNotes[answer] || '';
  why = why.replace(/^Correct\.\s*/i, '');
  if (why) out.why = why;
  if (optionNotes.some(Boolean)) out.ow = optionNotes;
  const src = clean(q.src || q.source);
  if (src && allowSource) out.src = src;
  return out;
}

function normalizeQuiz(quiz, where) {
  return asArray(quiz).map((q, i) => normalizeQuestion(q, `${where} quiz ${i + 1}`)).filter(Boolean);
}

function normalizeSession(raw, trackKey, track, where) {
  if (!isObj(raw)) {
    fail(where, 'session is not an object');
    return null;
  }
  const n = Number(raw.n ?? raw.number ?? raw.id);
  if (!Number.isInteger(n) || n < 1) fail(where, `invalid session number ${JSON.stringify(raw.n)}`);
  let title = clean(raw.title || raw.name);
  if (track.id === 'labs') title = title.replace(/^Lab\s*\d+\s*[:.\-–—]\s*/i, '').trim() || title;
  if (!title) fail(where, 'session title is missing');
  const sessionWhere = `${where}${Number.isInteger(n) ? ` ${track.unit} ${n}` : ''}`;

  const notesRaw = asArray(raw.notes || raw.sections);
  const cards = normalizeCards(raw.cards, sessionWhere);
  const qa = normalizeQa(raw.qa || raw.questions || raw.qaPairs, sessionWhere);
  const quiz = normalizeQuiz(raw.quiz, sessionWhere);
  const extra = normalizeQuiz(raw.extra, `${sessionWhere} extra`);

  const firstPoint = notesRaw.flatMap(n => asArray(isObj(n) ? (n.pts || n.body || n.p) : [])).find(Boolean);
  const estimate = Math.max(8, Math.round(
    notesRaw.length * 4 + cards.length * 0.4 + quiz.length * 0.2 + (track.id === 'labs' ? 18 : 6)
  ));
  const summary = clean(raw.summary || raw.blurb || raw.intro) || clipText(firstPoint, 150);

  if (!notesRaw.length && !cards.length && !quiz.length) {
    warn(sessionWhere, 'has no notes, cards or quiz questions');
  }

  return {
    n: Number.isInteger(n) ? n : 0,
    title,
    code: clean(raw.code) || `${track.prefix}${n}`,
    mins: Math.max(1, Number(raw.mins || raw.minutes || raw.duration) || estimate),
    summary,
    tags: asArray(raw.tags).map(t => clean(String(t))).filter(Boolean),
    objectives: asArray(raw.objectives || raw.goals).map(o => clean(String(o))).filter(Boolean),
    notes: normalizeNotes(notesRaw, sessionWhere),
    cards,
    qa,
    quiz,
    extra
  };
}

function normalizeTrack(raw, key, where) {
  if (!isObj(raw)) {
    fail(where, 'track is not an object');
    return null;
  }
  const defaults = TRACK_DEFAULTS[key] || {
    name: key.charAt(0).toUpperCase() + key.slice(1),
    unit: key.charAt(0).toUpperCase() + key.slice(1, -1),
    units: key,
    prefix: key.slice(0, 2) + ' '
  };
  const rawPrefix = clean(raw.prefix) || clean(defaults.prefix);
  const prefix = rawPrefix.length > 1 ? rawPrefix + ' ' : rawPrefix;
  const track = {
    id: clean(raw.id) || key,
    key,
    name: clean(raw.name) || defaults.name,
    unit: clean(raw.unit) || defaults.unit,
    units: clean(raw.units) || defaults.units,
    prefix,
    blurb: clean(raw.blurb || raw.description)
  };
  const seen = new Set();
  track.sessions = asArray(raw.sessions || raw.lectures)
    .map((s, i) => normalizeSession(s, key, track, `${where}.${track.id}[${i}]`))
    .filter(Boolean)
    .sort((a, b) => a.n - b.n);
  for (const s of track.sessions) {
    if (seen.has(s.n)) fail(where, `duplicate session number ${s.n} in track ${track.id}`);
    seen.add(s.n);
  }
  return track;
}

function normalizeCourse(raw, file) {
  const where = file;
  if (!isObj(raw)) {
    fail(where, 'course is not an object');
    return null;
  }
  const id = clean(raw.id);
  if (!id) fail(where, 'course id is missing');
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(id)) fail(where, `course id "${id}" should be letters, digits and dashes`);
  const name = clean(raw.name || raw.title);
  if (!name) fail(where, 'course name is missing');

  const tracksRaw = isObj(raw.tracks) ? raw.tracks : (
    Array.isArray(raw.lectures) ? { lectures: { sessions: raw.lectures } } : null
  );
  if (!tracksRaw) fail(where, 'no tracks object (expected tracks.lectures.sessions...)');

  const tracks = {};
  for (const [key, value] of Object.entries(tracksRaw || {})) {
    const track = normalizeTrack(value, key, `${where}.tracks.${key}`);
    if (track) {
      if (tracks[track.id]) fail(where, `two tracks share the id "${track.id}"`);
      tracks[track.id] = track;
    }
  }
  if (!Object.keys(tracks).length) fail(where, 'no usable tracks');

  const examIds = new Set();
  const exams = asArray(raw.exams).map((exam, i) => {
    if (!isObj(exam)) return null;
    const examWhere = `${where}.exams[${i}]`;
    const questions = [];
    const sections = [];

    const addMcq = item => {
      const q = normalizeQuestion(item, `${examWhere}.q${questions.length + 1}`, false);
      if (!q) return null;
      questions.push(q);
      return { type: 'mcq', ...q };
    };

    const rawSections = asArray(exam.sections);
    if (rawSections.length) {
      rawSections.forEach((section, si) => {
        if (!isObj(section)) return;
        const items = [];
        asArray(section.items).forEach((item, ii) => {
          if (!isObj(item)) return;
          const written = item.type === 'written' || (!item.o && (item.ans || item.answer));
          if (written) {
            const q = clean(item.q || item.question);
            const ans = clean(item.ans || item.answer);
            if (!q || !ans) {
              warn(`${examWhere}.s${si + 1}.item${ii + 1}`, 'written question needs text and an answer');
              return;
            }
            items.push({ type: 'written', q, ans, why: clean(item.why) });
          } else {
            const q = addMcq(item);
            if (q) items.push(q);
          }
        });
        if (items.length) {
          sections.push({
            title: clean(section.title) || `Part ${si + 1}`,
            marks: clean(section.marks),
            items
          });
        }
      });
    } else {
      asArray(exam.questions).forEach(item => addMcq(item));
      if (questions.length) {
        sections.push({ title: 'Questions', marks: '', items: questions.map(q => ({ type: 'mcq', ...q })) });
      }
    }

    if (!sections.length) {
      warn(examWhere, 'has no usable questions; dropped');
      return null;
    }

    const writtenCount = sections.reduce(
      (total, section) => total + section.items.filter(item => item.type === 'written').length, 0
    );
    const title = clean(exam.title) || `Past paper ${i + 1}`;
    let id = clean(exam.id);
    if (!id) {
      const chapter = /^chapter\s+(\d+)/i.exec(title);
      id = chapter ? `chapter-${chapter[1]}-paper` : `paper-${i + 1}`;
    }
    id = id.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `paper-${i + 1}`;
    let unique = id;
    let suffix = 2;
    while (examIds.has(unique)) unique = `${id}-${suffix++}`;
    examIds.add(unique);

    return {
      id: unique,
      title,
      kind: clean(exam.kind) || (rawSections.length ? 'Practice paper' : 'Exam'),
      meta: clean(exam.meta),
      year: clean(String(exam.year || '')),
      mins: Math.max(10, Number(exam.mins) || Math.round(questions.length * 1.5 + writtenCount * 6 + 10)),
      note: clean(exam.note),
      questions,
      sections,
      mcqCount: questions.length,
      writtenCount
    };
  }).filter(Boolean);

  const course = {
    id,
    name,
    short: clean(raw.short) || name,
    code: clean(raw.code) || '',
    by: clean(raw.by) || '',
    color: /^#[0-9a-f]{3,8}$/i.test(clean(raw.color)) ? clean(raw.color) : DEFAULT_COLOR,
    description: clean(raw.description) || `${name} — lecture notes, lab guides and practice papers.`,
    tracks,
    exams
  };

  for (const track of Object.values(tracks)) {
    if (!track.sessions.length) warn(`${where}.${track.id}`, 'track has no sessions');
    const numbers = track.sessions.map(s => s.n);
    for (let i = 0; i < numbers.length; i++) {
      if (numbers[i] !== i + 1) {
        warn(`${where}.${track.id}`, `session numbers are not contiguous (${numbers.join(', ')})`);
        break;
      }
    }
  }

  return course;
}

if (!rawCourses.size) {
  console.error('✗ No course was registered by any file in courses/.');
  process.exit(1);
}

const courses = [];
for (const [key, { course: raw, file }] of rawCourses) {
  const course = normalizeCourse(raw, file);
  if (!course) continue;
  if (course.id !== key) warn(file, `registered as "${key}" but course id is "${course.id}"`);
  courses.push(course);
}

if (!courses.length) {
  console.error('✗ No valid courses to build.');
  process.exit(1);
}

if (errors.length) {
  console.error('\n✗ Validation failed:\n');
  for (const e of errors) console.error('  • ' + e);
  if (warnings.length) {
    console.error('\nWarnings:');
    for (const w of warnings) console.error('  – ' + w);
  }
  process.exit(1);
}

/* ── summaries ────────────────────────────────────────────────────────────── */

const countQuiz = list => asArray(list).length;

function summarizeTrack(track) {
  const sessions = track.sessions.map(s => ({
    n: s.n,
    code: s.code,
    title: s.title,
    mins: s.mins,
    summary: s.summary,
    tags: s.tags,
    cards: countQuiz(s.cards),
    quiz: countQuiz(s.quiz) + countQuiz(s.extra),
    qa: countQuiz(s.qa)
  }));
  const sum = key => sessions.reduce((total, s) => total + s[key], 0);
  return {
    id: track.id,
    name: track.name,
    unit: track.unit,
    units: track.units,
    prefix: track.prefix,
    blurb: track.blurb,
    count: sessions.length,
    minutes: sessions.reduce((total, s) => total + s.mins, 0),
    cards: sum('cards'),
    quiz: sum('quiz'),
    qa: sum('qa'),
    sessions
  };
}

const manifestCourses = {};
const dataFiles = new Map();

for (const course of courses) {
  const tracks = {};
  for (const track of Object.values(course.tracks)) tracks[track.id] = summarizeTrack(track);

  const totals = Object.values(tracks).reduce((acc, t) => ({
    sessions: acc.sessions + t.count,
    cards: acc.cards + t.cards,
    quiz: acc.quiz + t.quiz,
    qa: acc.qa + t.qa
  }), { sessions: 0, cards: 0, quiz: 0, qa: 0 });

  manifestCourses[course.id] = {
    id: course.id,
    name: course.name,
    short: course.short,
    code: course.code,
    by: course.by,
    color: course.color,
    description: course.description,
    tracks,
    trackOrder: Object.keys(course.tracks),
    exams: course.exams.length,
    totals
  };

  const json = JSON.stringify(course)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
  dataFiles.set(course.id, json);
  console.log(
    `  ${course.id.padEnd(12)} ${String(Object.values(tracks).reduce((a, t) => a + t.count, 0)).padStart(3)} sessions · ` +
    `${String(totals.cards).padStart(4)} cards · ${String(totals.quiz).padStart(4)} questions · ` +
    `${String(course.exams.length).padStart(2)} papers · ${(json.length / 1024).toFixed(0).padStart(4)} KB`
  );
}

const version = createHash('sha1')
  .update(JSON.stringify(manifestCourses) + [...dataFiles.values()].join(''))
  .digest('hex')
  .slice(0, 10);

const manifest = {
  version,
  generated: new Date().toISOString().slice(0, 10),
  courses: manifestCourses,
  order: courses.map(c => c.id)
};

/* ── write output ─────────────────────────────────────────────────────────── */

if (CHECK_ONLY) {
  console.log(`\n✓ ${courses.length} course(s) valid. Manifest version ${version}. Nothing written (--check).`);
  if (warnings.length) {
    console.log('\nWarnings:');
    for (const w of warnings) console.log('  – ' + w);
  }
  process.exit(0);
}

mkdirSync(OUT_DIR, { recursive: true });

const expected = new Set(['manifest.js']);
for (const [id, json] of dataFiles) {
  const name = `${id}.js`;
  expected.add(name);
  writeFileSync(
    path.join(OUT_DIR, name),
    `/* generated by build.mjs — edit courses/${id}.js instead */\n` +
    `(window.COURSES=window.COURSES||{})[${JSON.stringify(id)}]=JSON.parse(${JSON.stringify(json)});\n`
  );
}

writeFileSync(
  path.join(OUT_DIR, 'manifest.js'),
  `/* generated by build.mjs — do not edit */\n` +
  `window.MANIFEST=${JSON.stringify(manifest)};\n`
);

// Remove stale generated course files, but leave anything else alone.
for (const name of readdirSync(OUT_DIR)) {
  if (name.endsWith('.js') && !expected.has(name)) {
    rmSync(path.join(OUT_DIR, name));
    console.log(`  removed stale data/${name}`);
  }
}

console.log(`\n✓ Built ${courses.length} course(s) into ${OUT_DIR}/ · manifest version ${version}`);

if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  for (const w of warnings) console.log('  – ' + w);
}
