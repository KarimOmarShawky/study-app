// Builds dist/, the standalone site for static hosting (Vercel).
// index.html is written for claude.ai, which wraps it in a document skeleton; here we add that skeleton ourselves.
// Run after build.mjs: node build.mjs && node dist.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const SITE = 'https://study-deck-five.vercel.app';
const TITLE = 'Study Deck · Level 2 & 3 CS';
const DESC = 'Notes, flashcards, quizzes, interactive video roadmaps and solved past papers for 12 Level 2 and Level 3 Computer Science courses. Every answer choice explained, with Egyptian Arabic explanations.';

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist');
const hash = buf => createHash('sha256').update(buf).digest('hex').slice(0, 8);
const ver = f => f + '?v=' + hash(readFileSync(f));
const dataV = Object.fromEntries(readdirSync('data').filter(f => f.endsWith('.js')).map(f => [f.slice(0, -3), hash(readFileSync('data/' + f))]));
const VENDOR = {
  'https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js': 'vendor/react-18.3.1.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js': 'vendor/react-dom-18.3.1.production.min.js',
  'https://cdn.jsdelivr.net/npm/htm@3.1.1/dist/htm.umd.js': 'vendor/htm-3.1.1.umd.js'
};
let page = readFileSync('index.html', 'utf8');
for (const [cdn, local] of Object.entries(VENDOR)) {
  if (!page.includes(`src="${cdn}"`)) throw new Error('index.html no longer loads ' + cdn + '; update VENDOR in dist.mjs');
  page = page.replace(`src="${cdn}"`, `src="${local}"`);
}
const GOOGLE_FONTS = /<link rel="preconnect" href="https:\/\/fonts\.(googleapis|gstatic)\.com"( crossorigin)?>\n|<!-- fonts load[^\n]*-->\n|<script>\(function\(\)\{var l=document\.createElement\("link"\);[^\n]*fonts\.googleapis[^\n]*<\/script>\n|<noscript><link rel="stylesheet" href="https:\/\/fonts\.googleapis[^\n]*<\/noscript>\n/g;
if ((page.match(GOOGLE_FONTS) || []).length !== 5) throw new Error('index.html font loading changed; update GOOGLE_FONTS in dist.mjs');
const fontCss = readFileSync('vendor/fonts/main.css', 'utf8').replaceAll('__BASE__', 'vendor/fonts/').trim();
const lazyFont = f => readFileSync('vendor/fonts/' + f, 'utf8').replaceAll('url(', 'url(vendor/fonts/').replace(/\n+/g, '');
const FONT_CSS = { ar: lazyFont('ar.css'), book: lazyFont('book.css') };
page = page
  .replace(GOOGLE_FONTS, '')
  .replace('<style>', `<link rel="preload" href="vendor/fonts/outfit-400-latin-v15.woff2" as="font" type="font/woff2" crossorigin>\n<style>\n${fontCss}\n</style>\n<style>`)
  .replace(/<link rel="preconnect" href="https:\/\/(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net)" crossorigin>\n/g, '')
  .replace('<script defer src="manifest.js"></script>', `<script>window.DATA_V=${JSON.stringify(dataV)};window.FONT_CSS=${JSON.stringify(FONT_CSS)}</script>\n<script defer src="${ver('manifest.js')}"></script>`)
  .replace('<script defer src="app.js"></script>', `<script defer src="${ver('app.js')}"></script>`);
const og = readFileSync('public/og.jpg');
const OG = `og-${hash(og)}.jpg`;
const share = `<meta name="description" content="${DESC}">
<meta name="theme-color" content="#7444D6">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="canonical" href="${SITE}/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Study Deck">
<meta property="og:title" content="${TITLE}">
<meta property="og:description" content="${DESC}">
<meta property="og:url" content="${SITE}/">
<meta property="og:image" content="${SITE}/${OG}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Study Deck: Level 2 and 3 CS, all in one place">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${TITLE}">
<meta name="twitter:description" content="${DESC}">
<meta name="twitter:image" content="${SITE}/${OG}">`;
const body = page.replace(/(<meta name="viewport"[^>]*>)/, '$1\n' + share).replace('</style>', '</style>\n</head>\n<body>');
const inline = [...body.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => `'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`);
const CSP = [
  "default-src 'self'",
  `script-src 'self' ${inline.join(' ')} https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://unpkg.com`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data: https://i.ytimg.com https://img.youtube.com",
  "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'"
].join('; ');
writeFileSync('dist/index.html', `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
${body}
</body>
</html>
`);
for (const f of ['app.js', 'manifest.js', 'data']) cpSync(f, 'dist/' + f, { recursive: true });
mkdirSync('dist/vendor');
for (const [local, file] of [['react-18.3.1.production.min.js', 'react.production.min.js'], ['react-dom-18.3.1.production.min.js', 'react-dom.production.min.js'], ['htm-3.1.1.umd.js', 'htm.umd.js']]) cpSync('vendor/' + file, 'dist/vendor/' + local);
cpSync('vendor/fonts', 'dist/vendor/fonts', { recursive: true });
cpSync('public', 'dist', { recursive: true });
writeFileSync('dist/' + OG, og);
console.log('dist/ ready');
