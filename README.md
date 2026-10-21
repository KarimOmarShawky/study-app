# study-app

Study Deck — notes, flashcards, quizzes and past papers for Level 2 & 3 CS courses.
Plain HTML/JS/React (UMD, no bundler), built into a static site.

## Build

```bash
node build.mjs   # courses/*.js -> data/<id>.js + manifest.js
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
| `index.html`, `app.js`, `courses/*.js` | the app |
| `vendor/*`, `vendor/fonts/*` | React/htm and the bundled fonts (offline, no CDN at runtime) |
| `public/og.jpg` (1200×630) | social share preview (`og:image`) — optional, build warns and continues |
| `public/favicon.svg` | tab icon — optional, build warns and continues |

A missing `public/og.jpg` was what made an earlier Vercel build fail with
`Error: ENOENT: no such file or directory, open 'public/og.jpg'`.
When uploading files through the GitHub web UI, make sure the `public/` folder is included
(GitHub keeps empty folders out of a repo).

## Textbook quick quizzes

`book/<course>.js` holds five questions per lecture, written from the course textbook
(*Operating System Concepts*, 9th ed. — Silberschatz, Galvin & Gagne). Every question records the section and
page it comes from in `src`, e.g. `Book · Ch. 5 §5.2, p. 206–207`, and every option's explanation quotes or
closely paraphrases the book — no invented answers.

`build.mjs` attaches these to each lecture as `bookQuiz` (lectures only; lab sessions have their own numbering and
are skipped), and the video player's **Quick quiz** shows these five with the citation under each question. A
session with no book quiz falls back to the first five questions of its own quiz.

## Visualizer

The Visualizer tab is a topic lab: a topic list and a shared workspace (inputs, diagram, playback, step history, inspector)
drawn by `topics.js`. For Algorithms, every topic follows the course: `lab.js` registers one module per topic in
`window.LAB[id]` with the slides' methods and conventions, "From the course" presets that load each worked example from
the slides and exams (a dropdown on phones), free "try your own" input, its engine, drawing, legend and cost.

**Algorithms topics (13):** sorting (insertion, merge, MERGE, exchange, PARTITION, quicksort, counting, radix), searching
(binary, binsearch, sequential, comparison), selection (RAND-SELECT, median of medians), recurrences (recursion trees,
Master method, iteration, substitution, unequal splits), hashing (5 hash functions; chaining, linear, quadratic, double
hashing with insert/search/delete), amortized analysis (aggregate, accounting, potential), skip lists, red-black trees
(insert, delete with rbTreeFix, order-statistic queries), dynamic programming (7 problems), shortest paths (Dijkstra, BFS),
spanning trees (Kruskal, Prim), Huffman codes, and P/NP reductions (3-CNF SAT to CLIQUE, truth tables).

A module is `{ meta, defaults, presets: [{ label, src, cfg }], Controls, build(cfg) → frames, Diagram, legend, cost }`;
each frame has `desc` (plain caption), optional `html`, `inv` and `metrics`. Topics without a module keep the models in
`topics.js` (the OS lab, and the bit-operations model still embedded in the notes as `algo-bit-sim`).

**OS topics (5):** CPU scheduling, page replacement, deadlock, memory placement, and disk scheduling, with neutral,
editable workloads.

Notes can embed a workspace with `fig: 'algo-sort-sim'` (and the other registered `algo-*-sim` names) through
`TOPICS.Embed`. The separate `viz.js` code tracer remains available via `viz: { type, ...settings }`.

### Regression checks

No packages are needed for engine tests:

```bash
node --test tests/*.test.cjs
node build.mjs && node dist.mjs
```

The optional browser test opens all 13 Algorithms topics and plays every course example to the end, then checks
playback, keyboard controls, topic search, the phone layout, embedded figures and the 5 OS topics:

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

`figs-ag.js` holds 180 visuals for the 20 Algorithms lectures (names `ag-<lecture>-…`), each redrawing a figure or
working through an example from Dr. Basheer's slides: step-throughs with Back/Next and a caption per step, and
simulators with "Example from the slides" plus "Try your own". It builds on `window.FIGKIT` from `figs.js`;
`build.mjs` copies it to `data/` and `app.js` loads it only when a lecture that uses it is opened.

A note section lists its visuals in `fig` (a name or a list), places each under a point with
`figAt: { name: pointIndex }` (missing = end of the section), and gives it a headline with `figH: { name: 'headline' }`.
Where a slide has a mistake, the visual shows the correct value and its caption says what the slide printed.

## Math in the notes

The Algorithms course is written with LaTeX math (`$\Theta(n^2)$`, `$$…$$` for display, `\$` for a dollar sign) and
Markdown `code` spans. `build.mjs` turns them into plain HTML with `tex.mjs` (Θ, ≤, sub/superscripts, stacked
fractions, matrices), so the page needs no math library. It runs only for the courses listed in `TEX` in `build.mjs`
(not OS, where `$` is a shell prompt) and skips `code` and `formula` fields. Unknown commands are reported by the build.
