// Generated from src/sw.template.js by scripts/build.mjs. Do not edit sw.js by hand.
const CACHE = 'wdk-5ea90e76bf';
const SHELL = ["./","./index.html","./manifest.webmanifest","./icons/icon-192.png","./icons/icon-512.png","./icons/icon-maskable-512.png","./icons/apple-touch-icon.png","./fonts/fonts.css","./fonts/bagel-fat-one-latin-ext.woff2","./fonts/bagel-fat-one-latin.woff2","./fonts/bricolage-grotesque-latin-ext.woff2","./fonts/bricolage-grotesque-latin.woff2","./datenschutz.html","./impressum.html"];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('wdk-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    // Network first for the page itself so updates arrive; cache first for everything else.
    if (req.mode === 'navigate') {
      // Each page under its own URL, so visiting the legal pages never replaces the cached game.
      // no-cache revalidates with the server; otherwise GitHub Pages' max-age=600 keeps old versions for 10 minutes.
      e.respondWith(fetch(req, { cache: 'no-cache' }).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; })
        .catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match('./index.html'))));
      return;
    }
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    })));
  }
});
