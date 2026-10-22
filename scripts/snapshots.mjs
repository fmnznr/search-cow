// Freezes today's behaviour so a refactor cannot change it unnoticed:
//   scenes – generated scenes for fixed seeds (hash per scene plus a readable summary)
//   images – a few scenes rendered at t=0, compared pixel by pixel with a small tolerance
//   runs   – scripted games on a manual clock (find, miss, radar, time out), state after every step
// Usage: node scripts/snapshots.mjs [--update]   (references live in test/snapshots/)
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { serve } from './serve.mjs';

const UPDATE = process.argv.includes('--update');
const dir = new URL('../test/snapshots/', import.meta.url), outDir = new URL('out/', dir);
mkdirSync(new URL('img/', dir), { recursive: true }); rmSync(outDir, { recursive: true, force: true });
const problems = [];

const srv = await serve();
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
// Fresh page with sound off (audio setup draws random numbers depending on the device) and a seeded Math.random.
async function open(viewport, query = '') {
  const ctx = await browser.newContext({ viewport, hasTouch: true });
  await ctx.addInitScript(() => {
    localStorage.setItem('wdk-sound', '0'); localStorage.setItem('wdk-music', '0');
    let a = 7; Math.random = () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  });
  const page = await ctx.newPage();
  page.on('pageerror', e => problems.push(`Seitenfehler: ${e.message}`));
  await page.goto(`${srv.url}?test${query}`);
  await page.waitForFunction(() => window.__WDK__);
  return page;
}
const json = f => JSON.parse(readFileSync(new URL(f, dir), 'utf8'));
const save = (f, v) => writeFileSync(new URL(f, dir), JSON.stringify(v, null, 1) + '\n');

/* ---------- scenes ---------- */
const scenes = {};
for (const viewport of [{ width: 390, height: 844 }, { width: 1366, height: 768 }]) {
  const page = await open(viewport);
  const list = await page.evaluate(() => {
    const K = window.__WDK__, out = [];
    const round = (k, v) => typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v;
    for (let lv = 1; lv <= 20; lv++) for (const seed of [1, 2, 3]) {
      const sc = K.genScene(lv, { seed });
      const data = { world: sc.world, mods: [...sc.mods], golden: sc.golden, hy: sc.hy, seed: sc.seed, cowPlaced: sc.cowPlaced, amb: sc.amb, cow: sc.ents.indexOf(sc.cow), ents: sc.ents };
      out.push({ id: `${lv}-${seed}`, json: JSON.stringify(data, round), summary: { world: sc.world, mods: [...sc.mods].join('+'), golden: sc.golden, figures: sc.ents.length, cow: [round(0, sc.cow.nx), round(0, sc.cow.ny)] } });
    }
    return out;
  });
  for (const s of list) scenes[`${viewport.width}x${viewport.height} ${s.id}`] = { hash: createHash('sha256').update(s.json).digest('hex').slice(0, 16), ...s.summary };
  await page.context().close();
}
if (UPDATE) save('scenes.json', scenes);
else {
  const ref = json('scenes.json'); let n = 0;
  for (const k of new Set([...Object.keys(ref), ...Object.keys(scenes)])) {
    if (JSON.stringify(ref[k]) === JSON.stringify(scenes[k])) continue;
    if (n++ < 10) problems.push(`Szene ${k}: erwartet ${JSON.stringify(ref[k])}, bekommen ${JSON.stringify(scenes[k])}`);
  }
  if (n > 10) problems.push(`… insgesamt ${n} Szenen verändert`);
}

/* ---------- images ---------- */
const IMAGES = [
  ...['weide', 'strand', 'stadt', 'winter', 'meer', 'all'].map(world => ({ name: world, lv: 10, seed: 1, plan: { world, mods: [], golden: false } })),
  { name: 'stadt-twins-golden', lv: 12, seed: 4, plan: { world: 'stadt', mods: ['twins'], golden: true } },
  { name: 'weide-phone', lv: 5, seed: 2, plan: { world: 'weide', mods: [], golden: false }, viewport: { width: 390, height: 844 } }
];
for (const img of IMAGES) {
  const page = await open(img.viewport || { width: 800, height: 500 });
  const file = new URL(`img/${img.name}.png`, dir);
  const ref = !UPDATE && existsSync(file) ? `data:image/png;base64,${readFileSync(file).toString('base64')}` : null;
  const res = await page.evaluate(async ({ img, ref }) => {
    const K = window.__WDK__;
    const url = K.renderScene(K.genScene(img.lv, { seed: img.seed, plan: { ...img.plan, mods: new Set(img.plan.mods) } }), 0);
    if (!ref) return { url };
    const pixels = async src => { const im = new Image(); im.src = src; await im.decode(); const cv = new OffscreenCanvas(im.width, im.height), c = cv.getContext('2d'); c.drawImage(im, 0, 0); return c.getImageData(0, 0, im.width, im.height); };
    const [a, b] = await Promise.all([pixels(ref), pixels(url)]);
    if (a.width !== b.width || a.height !== b.height) return { url, size: `${a.width}×${a.height} → ${b.width}×${b.height}` };
    let diff = 0;
    for (let i = 0; i < a.data.length; i += 4) if (Math.max(Math.abs(a.data[i] - b.data[i]), Math.abs(a.data[i + 1] - b.data[i + 1]), Math.abs(a.data[i + 2] - b.data[i + 2])) > 8) diff++;
    return { url, diff: diff / (a.width * a.height) };
  }, { img, ref });
  const png = Buffer.from(res.url.split(',')[1], 'base64');
  if (UPDATE) writeFileSync(file, png);
  else if (!ref) problems.push(`Bild ${img.name}: keine Referenz (erst --update)`);
  else if (res.size || res.diff > .002) {
    problems.push(`Bild ${img.name}: ${res.size || `${(res.diff * 100).toFixed(2)} % der Pixel anders`} → test/snapshots/out/${img.name}.png`);
    mkdirSync(outDir, { recursive: true }); writeFileSync(new URL(`${img.name}.png`, outDir), png);
  }
  await page.context().close();
}

/* ---------- runs ---------- */
// Steps: wait (until playable), find after s seconds, miss, radar, out (let the clock run down), quit (end from the pause menu).
const RUNS = {
  desktop: { viewport: { width: 1366, height: 768 }, pointer: 'mouse', steps: ['find 2', 'find 0.5', 'miss', 'find 1', 'radar', 'find 4', 'miss', 'miss', 'miss', 'find 1', 'find 7', 'find 0.3', 'out'] },
  phone: { viewport: { width: 390, height: 844 }, pointer: 'touch', steps: ['find 1.5', 'miss', 'find 3', 'radar', 'find 2', 'find 9', 'out'] },
  idle: { viewport: { width: 800, height: 600 }, pointer: 'mouse', steps: ['out'] },
  challenge: { viewport: { width: 1366, height: 768 }, pointer: 'mouse', mode: 'challenge', steps: ['find 1.5', 'find 4', 'miss', 'miss', 'miss', 'find 1', 'radar', 'find 2', 'out'] },
  // Boss levels of the challenge mode, entered through a replay id.
  'boss-herd': { viewport: { width: 1366, height: 768 }, pointer: 'mouse', query: '&szene=h5-11', steps: ['find 1', 'miss', 'find 2', 'find 1.5'] },
  'boss-flee': { viewport: { width: 1366, height: 768 }, pointer: 'mouse', query: '&szene=h10-22', steps: ['miss', 'miss', 'find 2'] },
  'boss-wanted': { viewport: { width: 390, height: 844 }, pointer: 'touch', query: '&szene=h15-33', steps: ['miss', 'find 3'] },
  chill: { viewport: { width: 390, height: 844 }, pointer: 'touch', mode: 'chill', steps: ['find 3', 'miss', 'radar', 'find 5', 'find 1', 'find 20', 'quit'] }
};
const runs = {};
for (const [name, run] of Object.entries(RUNS)) {
  const page = await open(run.viewport, '&clock=manual' + (run.query || ''));
  runs[name] = await page.evaluate(({ steps, pointer, mode }) => {
    const K = window.__WDK__, log = [];
    if (mode) K.setMode(mode);
    const until = (cond, max = 30) => { for (let t = 0; t < max && !cond(); t += .05) K.advance(.05); };
    const playable = () => until(() => K.state().state === 'play');
    K.startGame(); playable(); log.push(['start', K.state()]);
    for (const step of steps) {
      const [kind, arg] = step.split(' ');
      if (kind === 'find') { K.advance(+arg); const [x, y] = K.cowCenter(); K.guess(x, y, pointer); log.push([step, K.state()]); playable(); }
      else if (kind === 'miss') { const [x, y] = K.cowCenter(); K.guess(x > K.W / 2 ? K.W * .08 : K.W * .92, Math.min(y, K.H * .9), pointer); log.push([step, K.state()]); }
      else if (kind === 'radar') { K.useRadar(); log.push([step, K.state()]); }
      else if (kind === 'out') { until(() => K.state().state === 'over', 400); log.push([step, K.state()]); }
      else if (kind === 'quit') { K.quit(); until(() => K.state().state === 'over'); log.push([step, K.state()]); }
    }
    return log;
  }, run);
  await page.context().close();
}
if (UPDATE) save('runs.json', runs);
else {
  const ref = json('runs.json');
  for (const name of Object.keys(RUNS)) {
    const a = ref[name] || [], b = runs[name];
    const i = b.findIndex((s, k) => JSON.stringify(s) !== JSON.stringify(a[k]));
    if (i >= 0 || a.length !== b.length) { const k = i >= 0 ? i : b.length; problems.push(`Spielrunde ${name}, Schritt ${k} (${(b[k] || a[k])[0]}): erwartet ${JSON.stringify(a[k] && a[k][1])}, bekommen ${JSON.stringify(b[k] && b[k][1])}`); }
  }
}

await browser.close(); srv.close();
if (UPDATE) { console.log(`Referenzen geschrieben: ${Object.keys(scenes).length} Szenen, ${IMAGES.length} Bilder, ${Object.keys(runs).length} Spielrunden.`); process.exit(problems.length ? 1 : 0); }
if (problems.length) { console.log(problems.join('\n')); process.exit(1); }
console.log(`Schnappschüsse unverändert: ${Object.keys(scenes).length} Szenen, ${IMAGES.length} Bilder, ${Object.keys(runs).length} Spielrunden.`);
