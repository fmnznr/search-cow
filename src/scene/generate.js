// Scene generation: level plan, placement of figures and cow, seeds and replays.
import { R, mulberry, pick, rnd, withSeed, wpick } from '../core/rng.js';
import { TAU, clamp } from '../core/util.js';
import { DPR, H, U, W, bgCv, bgc } from '../core/view.js';
import { TYPES } from '../content/entities/rig.js';
import { ORDER, WORLDS } from '../content/worlds.js';

function planFor(lv) {
  let world = ORDER[(lv - 1) % 6];
  if (lv > 12) world = pick(ORDER);
  const mods = new Set();
  if (lv === 4) mods.add('twins');
  if (lv === 7) mods.add('night');
  if (lv === 8) mods.add('move');
  if (lv === 9) mods.add('tiny');
  if (lv >= 10) {
    const pool = ['night', 'move', 'twins', 'tiny'];
    const n = lv < 14 ? 1 : (rnd() < .5 ? 1 : 2);
    while (mods.size < n) mods.add(pick(pool));
  }
  return { world, mods, golden: lv >= 3 && rnd() < .12 };
}
function setPos(e, nx, ny, sc) {
  e.nx = nx; e.ny = ny;
  if (sc.wd.ground) e.p = .5 + .65 * clamp((ny - sc.hy) / (1 - sc.hy), 0, 1.1);
  else if (!e.p) e.p = R(.75, 1.1);
  layoutEnt(e);
}
export function layoutEnt(e) { e.x = e.nx * W; e.y = e.ny * H; e.s = e.k * U * e.p; e.lw = Math.max(1, .055 * U * e.p); }
function makeEnt(type, nx, ny, sc) {
  const T = TYPES[type];
  const e = { type, ph: rnd() * 100, flip: rnd() < .5 ? -1 : 1, k: T.k * R(.88, 1.12), wp: rnd() * TAU, p: 0 };
  if (T.float || (sc.wd.float && !T.floor)) { e.float = true; e.oy = T.oy || 0; e.rot = T.rotR ? R(-T.rotR, T.rotR) : 0; }
  if (T.init) T.init(e, sc);
  if (e.p && sc.wd.ground) e.p = 0;
  if (sc.mods.has('move') && (T.walk || (e.float && !T.floor))) { e.moving = true; e.spd = R(.35, .8); e.vy = e.float ? R(-.12, .12) : 0; }
  setPos(e, nx, ny, sc);
  return e;
}
export function curFlip(e, t) { return TYPES[e.type].swim && !e.moving ? (Math.cos(t * .45 + e.ph) >= 0 ? 1 : -1) * (e.flip) : e.flip; }
export function entPos(e, t) {
  const T = TYPES[e.type]; let x = e.x, y = e.y;
  if (T.swim && !e.moving) x += Math.sin(t * .45 + e.ph) * e.s * .35 * e.flip;
  if (T.side) x += Math.sin(t * 1.4 + e.ph) * e.s * .25;
  if (e.float) y += Math.sin(t * 1.1 + e.ph) * e.s * .07;
  if (e.hopT != null) { const k = (t - e.hopT) / .42; const n = e.hopN || 1; if (k >= 0 && k < n) y -= Math.sin((k % 1) * Math.PI) * e.s * .3 * (1 - Math.floor(k) * .2); }
  return [x, y];
}
export function entBox(e, t) {
  const T = TYPES[e.type], [x, y] = entPos(e, t), s = e.s, b = T.box, f = curFlip(e, t);
  let x0 = b[0], x1 = b[2]; if (f < 0) { const a = -x1; x1 = -x0; x0 = a; }
  const oy = (e.oy || 0) * s;
  return [x + x0 * s, y + b[1] * s + oy, x + x1 * s, y + b[3] * s + oy];
}
export const overlap = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
export const inBox = (b, x, y) => x >= b[0] && x <= b[2] && y >= b[1] && y <= b[3];
export const HUD_TOP = () => 118;

export const COW_MIN = 22, COW_MIN_TINY = 16, TOUCH_TARGET = 40;
const newSeed = () => (Math.random() * 2 ** 31) | 0;
// Same level, seed and viewport give the same scene. Callers paint the background, so rejected candidates stay cheap.
export function genScene(lv, opts = {}) {
  const seed = opts.seed ?? newSeed();
  return withSeed(seed, () => buildScene(lv, seed, opts));
}
function buildScene(lv, seed, opts) {
  const plan = opts.plan || planFor(lv);
  const wd = WORLDS[plan.world];
  const sc = { lv, world: plan.world, wd, mods: plan.mods, golden: plan.golden, hy: wd.ground ? wd.horizon : 0, seed, ents: [], amb: {} };
  wd.initAmb && wd.initAmb(sc);
  const density = opts.density || Math.min(1.5, .62 + lv * .07);
  const n = Math.round(density * W * H / (U * U * 2.7));
  const pool = wd.pool.map(([k, w]) => [k, w * (plan.mods.has('twins') && wd.twins.includes(k) ? 6 : 1)]);
  const topN = (opts.title ? 20 : HUD_TOP()) / H;
  for (let i = 0; i < n; i++) {
    const type = wpick(pool), T = TYPES[type];
    let best = null, bestD = -1;
    for (let k = 0; k < 6; k++) {
      let nx = R(-.02, 1.02), ny;
      if (wd.ground) ny = sc.hy + .025 + Math.pow(rnd(), .9) * (1.03 - sc.hy - .025);
      else if (T.floor) ny = R(.87, 1.0);
      else ny = R(topN * .6, .92);
      let d = 1e9; const px = nx * W, py = ny * H;
      for (const o of sc.ents) { const dx = o.x - px, dy = (o.y - py) * 1.6; const dd = dx * dx + dy * dy; if (dd < d) d = dd; }
      if (d > bestD) { bestD = d; best = [nx, ny]; }
    }
    sc.ents.push(makeEnt(type, best[0], best[1], sc));
  }
  const cow = makeEnt('cow', .5, .6, sc);
  if (plan.mods.has('tiny')) cow.k *= .6;
  if (!plan.mods.has('tiny') && lv > 6) cow.k *= clamp(1 - (lv - 6) * .025, .78, 1);
  const top = opts.title ? 30 : HUD_TOP() + 6;
  const lo = wd.ground ? sc.hy + .08 : (top + 50) / H, hi = wd.ground ? .97 : .84;
  let placed = false;
  for (let i = 0; i < 400; i++) {
    let nx = R(.05, .95), ny = R(lo, hi);
    if (opts.title) { if (W > 700) nx = R(.62, .92); else ny = R(lo, Math.min(hi, .52)); }
    setPos(cow, nx, ny, sc);
    const b = entBox(cow, 0);
    if (b[0] < 8 || b[2] > W - 8 || b[1] < top || b[3] > H - 8) continue;
    if (!opts.title && b[2] > W - 220 && b[3] > H - 100) continue;
    // On phones the back rows shrink the cow to a few pixels; keep it where it can still be seen.
    if (!opts.title && Math.min(b[2] - b[0], b[3] - b[1]) < (plan.mods.has('tiny') ? COW_MIN_TINY : COW_MIN)) continue;
    placed = true; break;
  }
  sc.cowPlaced = placed;
  const cb = entBox(cow, 0), cw = cb[2] - cb[0], ch = cb[3] - cb[1];
  const core = [cb[0] + cw * .18, cb[1] + ch * .12, cb[2] - cw * .18, cb[3] - ch * .08];
  sc.ents = sc.ents.filter(e => !(e.y >= cow.y - 2 && overlap(entBox(e, 0), core)) && !(e.float && overlap(entBox(e, 0), core)));
  sc.ents.push(cow); sc.cow = cow;
  sc.ents.sort((a, b) => a.y - b.y);
  return sc;
}
// Rerolls until the cow has a fair spot and, from level 13 on, the world changes. A given seed is replayed as is.
export function levelScene(lv, prevWorld, seed) {
  if (seed != null) return genScene(lv, { seed });
  let sc;
  for (let i = 0; i < 12; i++) { sc = genScene(lv); if (sc.cowPlaced && !(lv > 12 && sc.world === prevWorld)) break; }
  return sc;
}
export const sceneId = sc => `${sc.lv}-${sc.seed}`;
export const REPLAY = (() => {
  let m = null; try { m = /^(\d{1,3})-(\d{1,10})$/.exec(new URLSearchParams(location.search).get('szene') || ''); } catch (_) {}
  return m && +m[1] >= 1 ? { lv: +m[1], seed: +m[2] | 0 } : null;
})();
export function paintBg(sc) {
  bgCv.width = Math.round(W * DPR); bgCv.height = Math.round(H * DPR);
  bgc.setTransform(DPR, 0, 0, DPR, 0, 0); bgc.lineJoin = 'round'; bgc.lineCap = 'round';
  sc.wd.bg(bgc, W, H, mulberry(sc.seed), sc);
}
