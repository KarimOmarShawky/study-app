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
