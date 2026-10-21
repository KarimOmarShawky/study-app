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

## Concept-first visualizations

The Visualizer is a topic laboratory, independent of the selected lecture and all
assessment datasets. `topics.js` defines its topic catalog, neutral examples,
computed snapshot models, diagram renderers, and shared playback workspace.
`figs.js` supplies reusable sorting/tree/OS engines and a few standalone diagrams.
Both are copied into versioned `data/` assets by `build.mjs` and loaded on demand.

**Algorithm topics (12):** sorting, binary search, recursion trees, hashing, dynamic
arrays/amortization, balanced trees, dynamic programming, graph exploration,
spanning trees, prefix coding, problem reductions, and bit operations.

Each topic uses its own visual grammar: bars with a held key and insertion hole;
merge buffers; branching recursion trees and work profiles; key-to-bucket routing
and probes; capacity slots and append costs; red–black trees; dependency-highlighted
DP grids; computed shortest-path/frontier diagrams; Kruskal forests; Huffman trees;
SAT/clique compatibility graphs; and fixed-width bit rows. Inputs are editable.
BFS and Dijkstra intentionally run on the same undirected graph so their hop and
weighted distances can be compared. Negative edge weights are rejected.

**OS topics (5):** CPU scheduling, page replacement, deadlock, memory placement,
and disk scheduling. CPU and page models use neutral, editable workloads. The
other models explicitly state their resource/memory/disk assumptions.

The shared workspace offers first/previous/next/last, play/pause, playback speed,
step scrubbing, diagram zoom, a live-state inspector, and optional history. Focus
the diagram to use arrows, Home/End, and Space. Recursion and reductions use direct
manipulation (depth/assignment selection) rather than a meaningless timeline.

Topic search and navigation replace the old lecture index and exam presets.
Embedded `fig: 'algo-sort-sim'` (and related registered names) now renders the same
neutral workspace through `TOPICS.Embed`. The separate `viz.js` code tracer remains
available to authored notes via `viz: { type, ...settings }`; `kind` is a supported
legacy alias. Existing lecture text and past-paper content are not rewritten.

### Regression checks

No packages are needed for engine tests:

```bash
node --test tests/*.test.cjs
node build.mjs && node dist.mjs
```

The optional browser test covers all 17 topics, algorithm variants, custom input,
invalid-input recovery, playback, keyboard controls, topic search, neutral embedded
figures, mobile layout, and the absence of lecture/exam references in the lab:

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
