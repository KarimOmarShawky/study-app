# study-app

Study Deck — Algorithms Analysis & Design (CS311), **lectures 1–14 only** (the midterm half).
Plain HTML/JS/React (UMD, no bundler), built into a static site. The other courses (OS, DBMS, SWE, SAD,
Files) were removed in stage 1: the site is Algorithms only.

## Build

```bash
node build.mjs   # courses/algo.js -> data/algo.js + manifest.js
node dist.mjs     # -> dist/ (index.html, app.js, manifest.js, data/, vendor/, public/ files)
```

Open `dist/index.html` through any static server (`python3 -m http.server -d dist`) — opening the
file directly does not work because the page loads `data/*.js` over HTTP.

`dist/`, `data/` and `manifest.js` are generated and git-ignored; only sources are committed.

## Deploy (Vercel)

`vercel.json` sets `buildCommand: node build.mjs && node dist.mjs` and `outputDirectory: dist`,
so Vercel builds the site itself — do not upload `dist/`.

Every file the build reads must be present in the repository:

| Path | Needed for |
| --- | --- |
| `index.html`, `app.js`, `courses/algo.js` | the app |
| `vendor/*`, `vendor/fonts/*` | React/htm and the bundled fonts (offline, no CDN at runtime) |
| `public/og.jpg` (1200×630) | social share preview (`og:image`) — optional, build warns and continues |
| `public/favicon.svg` | tab icon — optional, build warns and continues |

## What is in the course

`courses/algo.js` holds one course, `algo`, with a `tracks` object: `lectures` (L1–L14) and `labs`
(Lab 1–6). Every lecture has `n`, `code`, `title`, `videos`, `notes`, `cards`, `qa`, `quiz`, `extra`.

- **Videos** — the links supplied for lectures 1–14, one entry per video (`id`, `title`, `channel`).
  Lecture 5's playlist sits in `resources`. Titles are neutral placeholders (`Lecture 8 · video 2`)
  until real titles are added; edit them in place.
- **Notes** — all 14 lectures are written out from Dr. Basheer's slides (250 sections), each in the
  same format: `lead` intro, "Before you start" prerequisites where the slides assume background,
  a `formula`/`table`/`code` block, slide figures, and a section summary. The last three were
  written for this build: **L12** Augmenting data structures (size fields, OS-SELECT, OS-RANK,
  interval trees), **L13** Skip lists (perfect vs. randomized, coin-flip promotion, backwards
  analysis), **L14** Dynamic programming (coin row, binomial coefficients, robot coin collection,
  LCS, 0/1 knapsack). Each lecture also keeps its cards (18–43 per lecture), Q&A (5–29) and quiz
  questions (12–37).
- **Quiz / exams** — the bank is **midterm material only**: 296 explained objective questions
  (final-sourced items and anything beyond lecture 14 were removed) plus 4 midterm papers
  (2025, 2024 + retake, 2021/2022, and the 2016–2020 compendium). The 2023 paper (100% Prim/Dijkstra)
  and every "Final" paper were dropped with the rest of the final half.

## Midterm Revision (placeholder)

The `Midterm Revision` tab (mode `midterm` in `app.js`, styles `.mrev-*` in `index.html`) is the
stage-1 shell: lecture chips, three "next stage" blocks, and links to what already works. Content
(quick revision per lecture, timed mock midterm, most-repeated ideas) is the next stage.

## Visualizer

The Visualizer tab is a topic lab: a topic list and a shared workspace (inputs, diagram, playback, step
history, inspector) drawn by `topics.js`. The catalog now holds the **9 topics of lectures 1–14**:
sorting, binary search, selection, recursion trees, hashing, amortized analysis, skip lists,
red-black trees and dynamic programming. Each is a module in `lab.js` registered in `window.LAB[id]`
with the slides' methods and conventions, "From the course" presets, free "try your own" input, its
engine, drawing, legend and cost. Topics for lectures 15–20 (shortest paths, MST, Huffman, reductions)
are no longer listed; their `lab.js` modules are still registered and can be pruned later.

Notes can embed a workspace with `fig: 'algo-sort-sim'` (and the other registered `algo-*-sim` names)
through `TOPICS.Embed`. Separately, `viz.js` holds the step-through **code tracers** used with
`viz: { type, … }` on a note section. **Every one of the 14 lectures now carries one** (`tests/visualizations.test.cjs` checks this):
`isort` (L1), `table` — growth of functions (L2), `table` — recursion-tree levels (L3), `bsearch` (L4),
`qsort` (L5), `csort` (L6), `select` — quickselect keeping one side (L7), `hash` (L8), `table` — the
`h ≤ 2 lg(n+1)` bound (L9), `bst` insertion 8, 11, 10 (L10), `bst` exam workouts (L11), `table` —
OS-SELECT trace (L12), `skiplist` — search with coin-flip levels (L13), and `dp` — coin row, LCS and
knapsack tables (L14). The four new engines (`select`, `skiplist`, `dp`, `table`) live in `viz.js`
beside the existing ones and follow the same frame/step model, legend and trace guide.

### Regression checks

No packages are needed for engine tests:

```bash
node --test tests/*.test.cjs
node build.mjs && node dist.mjs
```

`tests/visualizations.test.cjs` builds a trace from every authored `viz` spec and asserts that each
lecture has at least one. The optional browser test opens the 9 Algorithm topics and plays every course example to the end,
then checks playback, keyboard controls, topic search, the phone layout, embedded figures and the
midterm revision placeholder:

```bash
npm install --no-save --package-lock=false @playwright/test
npx playwright install chromium  # add --with-deps if system libraries are missing
python3 -m http.server 3000 --bind 0.0.0.0 --directory dist
# In another terminal:
node tests/browser-smoke.cjs
```

Set `CHROMIUM_EXECUTABLE` to use an existing Chromium binary. Test packages and
build outputs are not part of the deployed source.

## Slide visuals (Algorithms)

`figs-ag.js` holds the visuals for the Algorithms lectures (names `ag-<lecture>-…`), each redrawing a
figure or working through an example from Dr. Basheer's slides: step-throughs with Back/Next and a
caption per step, and simulators with "Example from the slides" plus "Try your own". It builds on
`window.FIGKIT` from `figs.js`; `build.mjs` copies it to `data/` and `app.js` loads it only when a
lecture that uses it is opened. Visuals for lectures 15–20 are still in the file but no longer
referenced by any note.

A note section lists its visuals in `fig` (a name or a list), places each under a point with
`figAt: { name: pointIndex }` (missing = end of the section), and gives it a headline with
`figH: { name: 'headline' }`.
Where a slide has a mistake, the visual shows the correct value and its caption says what the slide printed.

## Math in the notes

The Algorithms course is written with LaTeX math (`$\Theta(n^2)$`, `$$…$$` for display, `\$` for a dollar sign) and
Markdown `code` spans. `build.mjs` turns them into plain HTML with `tex.mjs` (Θ, ≤, sub/superscripts, stacked
fractions, matrices), so the page needs no math library. It runs only for the courses listed in `TEX` in `build.mjs`
(now Algorithms only) and skips `code` and `formula` fields. Unknown commands are reported by the build.

## Textbook quick quizzes

`book/algo.js` holds questions taken from the course textbook (CLRS 3rd ed. & Neapolitan, *Foundations of
Algorithms*). Each question records the section and page it comes from in `src`, e.g.
`Book · Ch. 2 §2.1, p. 18`. `build.mjs` attaches them to each lecture as `bookQuiz` (lectures only; lab
sessions have their own numbering and are skipped), and the video player's **Quick quiz** shows them with the
citation under each question. A session with no book quiz falls back to the first five questions of its own quiz.
Coverage today: five questions for L1–L3, one for each of L4–L14.
