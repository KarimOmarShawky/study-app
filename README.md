# Study — Operating Systems (CS332)

A quiet, dependency-free study notebook for an Operating Systems course. It has two
tracks — **Lectures** and **Labs** — each with its own sessions, progress, flashcards,
Q&A, quizzes and practice papers.

The course source is the CS332 material: four lectures and four labs following
Silberschatz, Galvin & Gagné (9th ed.) and Dr. Khaled Wassif's slides, plus two
chapter practice papers with model answers.

Everything is plain HTML, CSS and JavaScript. There is no framework, no bundler and no
network request at runtime except loading the generated course data. Progress lives in
`localStorage`, so the site also works offline once loaded.

## Quick start

```bash
node build.mjs             # generate data/manifest.js and data/os.js
python3 -m http.server 8000
```

Open <http://localhost:8000>. Any static server works; the site can also be served
directly from GitHub Pages (all paths are relative).

If `data/` is missing, the page shows a short setup screen instead of failing silently.

## Project layout

```
index.html          the shell: layout, styles, track switcher, SVG icons
app.js              router, views, search, storage, quiz/deck engines
build.mjs           reads courses/*.js, validates, writes data/*.js
courses/
  os.js             the complete CS332 source (Lectures + Labs + papers)
data/               generated — commit it for static hosting
  manifest.js       names, tracks and counts (loaded first)
  os.js             full course data, loaded on demand
SOURCE.md           all four source files bundled as one readable document
extra/              room for supplementary material (not loaded yet)
```

## How the data is structured

```
course
 ├── tracks
 │    ├── lectures: { name, unit, units, prefix, sessions[] }
 │    └── labs:     { name, unit, units, prefix, sessions[] }
 │          └── session { n, code, title, notes[], cards[], qa[], quiz[] }
 └── exams[]
      └── { title, meta, note, sections[] }
            └── section { title, marks, items[] }
                  ├── { type: "mcq", q, o[], a, why, ow[] }
                  └── { type: "written", q, ans, why }
```

A session has:

- `notes` — sections with `h`, `pts[]`, `list[]`, `table`, `code`, `formula`, `callout`.
  Tables may be `{ head, rows }` or the compact `[[header…], [cell…], …]` form.
  Prose supports inline `code`, **bold** and *italic*, plus a small allowlist of HTML
  tags (`<b>`, `<i>`, `<code>`, `<br>`, `<pre>`) used by the CS332 source.
- `cards` — `[front, back]` pairs.
- `qa` — `[question, answer]` pairs.
- `quiz` — `{ q, o[], a, why, src }`, where `a` is the zero-based correct option.
  Each option can also be `[text, explanation]`, and a parallel `ow[]` array is accepted;
  those per-option notes are shown after an answer.
- `mins` and `summary` are optional. When missing, the build derives a reading estimate
  from the content and takes the summary from the first note.

Papers may use `sections` with `mcq` and `written` items (the CS332 papers do), or the
older flat `questions[]` form. `build.mjs` normalises both into MCQ questions for the
timed quiz plus expandable written model answers.

`build.mjs` validates the source and fails with a readable message on a bad answer index,
duplicate session numbers, missing fields and so on. It also normalises terse input
(`{ a: "B" }` is accepted for answers), converts compact tables and drops empty sections.

## Adding or editing a course

1. Copy `courses/os.js` to `courses/<id>.js` and change `id`, `name`, `short`, `code`,
   `color`, `description`, `tracks` and `exams`.
2. Register it on the shared namespace:
   ```js
   window.COURSES = window.COURSES || {};
   window.COURSES.os = {
     id: "os",
     // …
   };
   ```
   An optional `module.exports` assignment also works when the file is loaded by Node.
3. Run `node build.mjs`. The new course appears in the sidebar and the library
   automatically; the manifest carries its tracks and counts.

`node build.mjs --check` validates without writing anything.

## Routes

```
#/                                      library
#/search?q=interrupt                    full-text search across both tracks
#/course/os/lectures                    path (sessions in order)
#/course/os/labs                        labs path
#/course/os/lectures/read/2             a session
#/course/os/labs/cards/2                cards for one session
#/course/os/lectures/qa                 Q&A
#/course/os/labs/quiz                   quiz setup / active quiz
#/course/os/lectures/papers             practice papers
#/course/os/lectures/papers/chapter-1-paper
#/course/os/lectures/progress
```

The track segment is part of the URL, so a link can point at either track. Switching
tracks keeps the current section when it makes sense (Read opens the first unread session
of the other track) and always keeps **separate progress per track**.

## What is stored in the browser

| Key | Contents |
| --- | --- |
| `sap:v1:theme` | `light` or `dark` |
| `sap:v1:track:<course>` | last track used for a course |
| `sap:v1:progress:<course>:<track>` | `read[]`, `known[]`, `miss[]`, `best`, `attempts`, `lastRead` |
| `sap:v1:last` | last course / track / section |

Clearing site data resets all progress. The Progress tab can reset one track without
touching the other.

## Keyboard

- `/` — search
- `t` — switch track (on a course page)
- `1`–`6` — answer a quiz question
- `Enter` — next question
- `Space` — flip a flashcard
- `1` / `2` — again / got it, while a flashcard is open
- `Esc` — close the mobile drawer or clear the search field

## Notes on the content

The course data in `courses/os.js` is the CS332 source supplied for this project. It
contains 4 lectures, 4 labs, 110 flashcards, 112 quiz questions and 2 chapter practice
papers (3 MCQs plus 4 written model answers each). Reading times and short summaries are
derived by the build when the source does not provide them.

The site deliberately has no external fonts, icons, analytics or CDN dependencies, so it
loads instantly and works from a USB stick as well as from GitHub Pages.
