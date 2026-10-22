// Generates many levels per viewport and checks that the cow is always fair to find:
// placed, clear of HUD and radar button, not covered by figures in front of it, big enough to tap.
// Usage: node scripts/fairness.mjs [--seeds 50] [--levels 20]
// Replay a reported scene with index.html?szene=<lv>-<seed> at the same window size.
import { chromium } from 'playwright';

const arg = (name, def) => { const i = process.argv.indexOf(name); return i > 0 ? +process.argv[i + 1] : def; };
const SEEDS = arg('--seeds', 50), LEVELS = arg('--levels', 20);
const VIEWPORTS = [[360, 640], [390, 844], [768, 1024], [1366, 768], [1920, 1080]];
// minSide mirrors COW_MIN / COW_MIN_TINY in src/game.html (drawn size; touch taps get a 40 px target on top).
const LIMITS = { covered: .35, minSide: 22, minSideTiny: 16, edge: 8 };

// CHROMIUM_PATH points at a preinstalled browser when the bundled one is not downloaded.
const page = await (await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})).newPage();
const url = new URL('../index.html?test', import.meta.url).href;
const failures = [], stats = [];

for (const [w, h] of VIEWPORTS) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto(url);
  await page.waitForFunction(() => window.__WDK__);
  const res = await page.evaluate(([SEEDS, LEVELS, L]) => {
    // Fixed seed sequence so every run checks the same scenes.
    let a = 20261022; Math.random = () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const K = window.__WDK__; K.resize();
    const W = K.W, H = K.H, out = { fails: [], kinds: {}, minSide: Infinity, maxCovered: 0, scenes: 0 };
    const inter = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
    for (const mode of Object.values(K.MODES)) for (let lv = 1; lv <= LEVELS; lv++) {
      let prev = null;
      for (let n = 0; n < SEEDS; n++) {
        const sc = K.levelScene(lv, prev, null, mode); prev = sc.world; out.scenes++;
        const ui = K.uiRects(sc), why = [];
        const fail = (kind, msg = kind) => { why.push(msg); out.kinds[kind] = (out.kinds[kind] || 0) + 1; };
        // Boss levels can hide more than one cow; each must be fair on its own.
        for (const cow of sc.cows) {
          const b = K.entBox(cow, 0);
          if (!sc.cowPlaced) fail('kein Platz');
          if (b[0] < L.edge || b[2] > W - L.edge || b[3] > H - L.edge) fail('Rand');
          if (b[1] < ui.hudBottom) fail('HUD', `unter dem HUD (${Math.round(ui.hudBottom - b[1])} px)`);
          if (inter(b, ui.controls)) fail('Radar');
          // Share of the cow's box covered by figures drawn after it, sampled on a grid.
          const front = sc.ents.slice(sc.ents.indexOf(cow) + 1).map(e => K.entBox(e, 0)).filter(o => inter(o, b));
          let hit = 0; const G = 24;
          for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) {
            const x = b[0] + (i + .5) / G * (b[2] - b[0]), y = b[1] + (j + .5) / G * (b[3] - b[1]);
            if (front.some(o => x >= o[0] && x <= o[2] && y >= o[1] && y <= o[3])) hit++;
          }
          const covered = hit / (G * G), side = Math.min(b[2] - b[0], b[3] - b[1]);
          out.maxCovered = Math.max(out.maxCovered, covered); out.minSide = Math.min(out.minSide, side);
          if (covered > L.covered) fail('verdeckt', `${Math.round(covered * 100)} % verdeckt`);
          if (side < (sc.mods.has('tiny') ? L.minSideTiny : L.minSide)) fail('zu klein', `nur ${Math.round(side)} px groß`);
          if (sc.cows.some(o => o !== cow && inter(K.entBox(o, 0), b))) fail('Kühe überlappen');
        }
        if (why.length) out.fails.push({ scene: ({ chill: 'c', challenge: 'h' }[mode.id] || '') + `${lv}-${sc.seed}`, world: sc.world, mods: [...sc.mods].join('+') || '-', why: why.join(', ') });
      }
    }
    return out;
  }, [SEEDS, LEVELS, LIMITS]);
  stats.push(`${w}×${h}: ${res.scenes} Szenen, ${res.fails.length} Verstöße ${JSON.stringify(res.kinds)}, kleinste Kuh ${Math.round(res.minSide)} px, max. verdeckt ${Math.round(res.maxCovered * 100)} %`);
  for (const f of res.fails) failures.push({ viewport: `${w}×${h}`, ...f });
}
await page.context().browser().close();

console.log(stats.join('\n'));
if (failures.length) {
  console.log(`\n${failures.length} Verstöße (Wiederholen mit index.html?szene=<Szene> in gleicher Fenstergröße):`);
  console.table(failures.slice(0, 40));
  process.exit(1);
}
console.log('\nAlle Szenen fair.');
