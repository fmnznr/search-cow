// Wraps src/game.html (the claude.ai artifact source) into a standalone
// index.html with PWA head tags, and stamps the service worker cache version.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const body = readFileSync(new URL('src/game.html', root), 'utf8');

const head = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#211b26">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Kuh suchen">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon-192.png" type="image/png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>
</head>
<body>
`;
const html = head + body.trim() + '\n</body>\n</html>\n';
writeFileSync(new URL('index.html', root), html);

const hash = createHash('sha256').update(html);
for (const f of ['manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png']) hash.update(readFileSync(new URL(f, root)));
const version = hash.digest('hex').slice(0, 10);
const sw = readFileSync(new URL('src/sw.template.js', root), 'utf8').replace('__VERSION__', version);
writeFileSync(new URL('sw.js', root), sw);
console.log(`index.html + sw.js built (cache wdk-${version})`);
