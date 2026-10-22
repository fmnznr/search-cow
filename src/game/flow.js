// Game flow: start, levels, finding the cow, misses, time out.
import { pick } from '../core/rng.js';
import { $, RM, clamp, fmt1, fmtInt } from '../core/util.js';
import { H, U, W } from '../core/view.js';
import { MUSIC } from '../audio/music.js';
import { SND } from '../audio/sfx.js';
import { TYPES } from '../content/entities/rig.js';
import { REPLAY, genScene, levelScene, paintBg } from '../scene/generate.js';
import { G, after, light, live } from './state.js';
import { currentMode } from '../modes/index.js';
import { burst, floatText } from '../render/fx.js';
import { cowCenter } from '../render/frame.js';
import { runTransition } from '../render/transition.js';
import { loadRecord } from '../store/records.js';
import { els, showBanner, showGameUi, updateHud, updateLevelPills } from '../ui/hud.js';
import { showOver } from '../ui/over.js';
import { praise, say } from './actions.js';

export function startGame() {
  SND.unlock(); SND.start();
  const lv0 = REPLAY ? REPLAY.lv : 1, mode = currentMode();
  Object.assign(G, { lv: lv0, score: 0, cows: 0, time: mode.timer.start, streak: 0, bestStreak: 0, fastest: null, radar: mode.radar.start, misses: 0, levelT: 0, usedRadar: false, paused: false, lastTick: 99, nudged: false });
  $('#title').hidden = true; $('#over').hidden = true; $('#pause').hidden = true; $('#board').hidden = true;
  MUSIC.play();
  G.state = 'trans';
  runTransition(() => { loadLevel(lv0, REPLAY && REPLAY.seed); showGameUi(true); updateHud(); }, () => { G.state = 'play'; }, 2.1);
}
export function toTitle() {
  G.state = 'title'; G.paused = false; showGameUi(false);
  $('#over').hidden = true; $('#pause').hidden = true; $('#banner').hidden = true; $('#board').hidden = true; live.trans = null;
  MUSIC.setWorld('weide'); MUSIC.play();
  live.scene = genScene(1, { title: true, density: .75, plan: { world: 'weide', mods: new Set(), golden: false } }); paintBg(live.scene);
  live.fx = []; live.texts = []; live.marks = []; live.iris = null; live.radar = null;
  const rec = loadRecord(currentMode().records);
  if (REPLAY) $('#record').textContent = `Wiederholung von Szene ${REPLAY.lv}-${REPLAY.seed}. Zählt nicht für Rekord und Bestenliste.`;
  else $('#record').innerHTML = rec.score > 0 ? `Dein Rekord <b>${fmtInt(rec.score)} Punkte</b> <b>${rec.cows} ${rec.cows === 1 ? 'Kuh' : 'Kühe'}</b>` : 'Noch kein Rekord. Zeit, das zu ändern.';
  $('#title').hidden = false;
}
function nextLevel() {
  G.state = 'trans';
  runTransition(() => { G.lv++; loadLevel(G.lv); updateHud(); }, () => { G.state = 'play'; });
}
const RATINGS = [[1.5, 'Adlerauge!'], [3, 'Blitzschnell!'], [6, 'Gefunden!'], [12, 'Da ist sie ja!'], [1e9, 'Endlich!']];
export function onFound() {
  G.state = 'found';
  const secs = G.levelT, cow = live.scene.cow;
  const { points: pts, bonus, mult, extraRadar } = currentMode().found(G, { secs, golden: live.scene.golden });
  const [cx, cy] = cowCenter();
  cow.hopT = live.T; cow.hopN = 3;
  live.iris = { t0: live.T, r: Math.max(cow.s * 1.05, 60) };
  burst(cx, cy, RM ? 14 : 34, live.scene.golden ? ['star', 'spark', 'milk', 'heart'] : ['milk', 'spot', 'heart', 'milk']);
  if (!RM) for (const e of live.scene.ents) if (e !== cow && TYPES[e.type].walk) { e.hopT = live.T + Math.hypot(e.x - cx, e.y - cy) / Math.max(W, H) * .7 + .1; e.hopN = 1; }
  MUSIC.duck(1.6); SND.moo((cx / W) * 2 - 1, live.scene.golden ? 1.25 : 1); SND.fanfare(G.streak); if (live.scene.golden) SND.gold();
  const rating = live.scene.golden ? 'Goldkuh!' : RATINGS.find(([lim]) => secs < lim)[1];
  const parts = [`+${fmtInt(pts)} Punkte`, `+${bonus} s`, `${fmt1(secs)} s`];
  if (mult > 1) parts.splice(1, 0, `Serie ×${fmt1(mult).replace(',0', '')}`);
  if (extraRadar) parts.push('+1 Radar');
  praise(rating, parts.join(' · '), live.scene.golden);
  els.timer.classList.add('gain'); setTimeout(() => els.timer.classList.remove('gain'), 500);
  els.radarBtn.classList.remove('nudge');
  after(1.85, nextLevel);
}
export function onMiss(x, y, ent) {
  const { penalty } = currentMode().miss(G);
  live.shake = .3; live.marks.push({ x, y, t0: live.T }); floatText(x, y - 24, `−${penalty} s`, '#ff5a4e', clamp(U * .48, 18, 28), .9);
  let msg;
  if (ent) { const m = TYPES[ent.type].msg; msg = typeof m === 'function' ? m(ent) : pick(m); ent.hopT = live.T; ent.hopN = 1; SND.animal(TYPES[ent.type].snd, (x / W) * 2 - 1); }
  else { msg = live.scene.mods.has('night') && Math.random() < .4 ? 'Im Dunkeln getappt.' : pick(live.scene.wd.empty); SND.bonk(); }
  say(msg, x, y);
  els.timer.classList.add('flash'); setTimeout(() => els.timer.classList.remove('flash'), 300);
}
export function timeUp() {
  G.state = 'reveal'; G.time = 0; updateHud(); MUSIC.stop(); SND.womp();
  const cow = live.scene.cow; cow.hopT = live.T + .4; cow.hopN = 2;
  live.iris = { t0: live.T, r: Math.max(cow.s * 1.05, 60), lost: true };
  after(2.7, showOver);
}

export function loadLevel(lv, seed) {
  live.scene = levelScene(lv, live.scene && live.scene.world, seed, currentMode().plan); paintBg(live.scene); live.fx = []; live.texts = []; live.marks = []; live.iris = null; live.radar = null; live.nightK = 1;
  light.x = W / 2; light.y = H * .55; G.levelT = 0; G.usedRadar = false;
  updateLevelPills(); showBanner(); MUSIC.setWorld(live.scene.world);
}
