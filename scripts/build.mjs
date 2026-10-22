// Bundles src/main.js with esbuild into src/shell.html, giving dist/artifact.html (what gets published
// as the claude.ai artifact) and the standalone index.html with PWA head tags. Also builds the legal pages
// and stamps the service worker cache version.
// node scripts/build.mjs --itch additionally writes dist/itch.zip for itch.io (no PWA, no legal pages).
import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { build } from 'esbuild';

const root = new URL('../', import.meta.url);
const read = f => readFileSync(new URL(f, root), 'utf8');
const APP_URL = 'https://fmnznr.github.io/search-cow/';
const TITLE = 'Wo ist die Kuh?';
const DESC = 'Wimmelspiel auf Zeit: Finde die eine echte Kuh zwischen Schafen, Dalmatinern und Leuten im Kuhkostüm.';

const { outputFiles: [bundle] } = await build({
  entryPoints: [new URL('src/main.js', root).pathname], bundle: true, write: false,
  format: 'iife', target: 'es2020', charset: 'utf8', legalComments: 'none', banner: { js: "'use strict';" }
});
if (/<\/script/i.test(bundle.text)) throw new Error('"</script" in the bundle would end the inline script early');
// Function replacers: the code contains "$" sequences that string replacements would interpret.
const artifact = read('src/shell.html').replace('/* @style */', () => read('src/style.css').trimEnd()).replace('/* @script */', () => bundle.text.trimEnd());
mkdirSync(new URL('dist/', root), { recursive: true });
writeFileSync(new URL('dist/artifact.html', root), artifact);

// The artifact may only load fonts from Google; the web app serves its own copies from fonts/ (scripts/fetch-fonts.mjs).
const body = artifact.replace(/<link rel="(preconnect|stylesheet)" href="https:\/\/fonts\.(googleapis|gstatic)\.com[^>]*>\n/g, '').trim();
if (/fonts\.(googleapis|gstatic)\.com/.test(body)) throw new Error('Google Fonts link in src/game.html not recognised');
const fonts = readdirSync(new URL('fonts/', root)).filter(f => f.endsWith('.woff2')).map(f => `fonts/${f}`);
const fontHead = `<link rel="stylesheet" href="fonts/fonts.css">
${fonts.filter(f => !f.includes('-ext')).map(f => `<link rel="preload" href="${f}" as="font" type="font/woff2" crossorigin>`).join('\n')}`;

const baseHead = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#211b26">
${fontHead}
<link rel="icon" href="icons/icon-192.png" type="image/png">`;
const pwaHead = `<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Kuh suchen">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta property="og:type" content="website">
<meta property="og:title" content="${TITLE}">
<meta property="og:description" content="${DESC}">
<meta property="og:url" content="${APP_URL}">
<meta property="og:image" content="${APP_URL}icons/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="de_DE">
<meta name="twitter:card" content="summary_large_image">`;
const gameStyle = `<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>`;
const page = (head, inner) => `<!doctype html>\n<html lang="de">\n<head>\n${head}\n</head>\n<body>\n${inner}\n</body>\n</html>\n`;

const html = page(`${baseHead}\n${pwaHead}\n${gameStyle}`, body);
writeFileSync(new URL('index.html', root), html);

const legalStyle = `<style>
:root{--ink:#211b26;--milk:#fffdf8;--pink:#ff8fab;color-scheme:light}
body{margin:0;background:var(--ink);color:var(--ink);font:400 1rem/1.55 "Bricolage Grotesque","Segoe UI",system-ui,sans-serif;padding:24px 16px 48px}
main{max-width:640px;margin:0 auto;background:var(--milk);border:4px solid var(--ink);border-radius:28px;box-shadow:8px 8px 0 var(--pink);padding:clamp(20px,5vw,40px)}
h1{font:400 clamp(1.8rem,6vw,2.4rem)/1.1 "Bagel Fat One",system-ui,sans-serif;margin:0 0 .6em}
h2{font-weight:800;font-size:1.05rem;margin:1.6em 0 .3em}
p,ul{margin:.4em 0}a{color:inherit}code{font-size:.9em}
.back{display:inline-block;margin-bottom:1.2em;font-weight:800;text-decoration:none}
.stand{margin-top:2em;opacity:.7;font-size:.9rem}
</style>`;
const legal = [];
for (const f of readdirSync(new URL('src/legal/', root))) {
  const src = read(`src/legal/${f}`), title = src.match(/<!-- title: (.+?) -->/)[1];
  const placeholders = src.match(/\[[A-ZÄÖÜ][^\]]*\]/g);
  if (placeholders) console.warn(`! ${f}: Platzhalter noch offen: ${[...new Set(placeholders)].join(', ')}`);
  writeFileSync(new URL(f, root), page(`${baseHead}\n<title>${title} · ${TITLE}</title>\n<meta name="robots" content="noindex">\n${legalStyle}`, `<main>\n<a class="back" href="./">← Zurück zum Spiel</a>\n${src.trim()}\n</main>`));
  legal.push(f);
}

// Everything the offline app needs; also feeds the cache version so any change reaches installed apps.
const assets = ['manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png', 'fonts/fonts.css', ...fonts, ...legal];
const hash = createHash('sha256').update(html);
for (const f of assets) hash.update(readFileSync(new URL(f, root)));
const version = hash.digest('hex').slice(0, 10);
const shell = JSON.stringify(['./', './index.html', ...assets.map(f => `./${f}`)]);
writeFileSync(new URL('sw.js', root), read('src/sw.template.js').replace('__VERSION__', version).replace('__SHELL__', shell));
console.log(`dist/artifact.html, index.html, ${legal.join(', ')} + sw.js built (cache wdk-${version})`);

if (process.argv.includes('--itch')) {
  const dir = new URL('dist/itch/', root);
  rmSync(dir, { recursive: true, force: true }); rmSync(new URL('dist/itch.zip', root), { force: true }); mkdirSync(dir, { recursive: true });
  writeFileSync(new URL('index.html', dir), page(`${baseHead}\n${gameStyle}`, body));
  cpSync(new URL('fonts/', root), new URL('fonts/', dir), { recursive: true });
  mkdirSync(new URL('icons/', dir)); cpSync(new URL('icons/icon-192.png', root), new URL('icons/icon-192.png', dir));
  execFileSync('zip', ['-qr', '../itch.zip', '.'], { cwd: dir });
  console.log('dist/itch.zip built');
}
