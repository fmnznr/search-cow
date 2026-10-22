import { R, pick } from './core/rng.js';
import { $, COARSE, RM, TAU, clamp, easeBack, easeOut, fmt1, fmtInt } from './core/util.js';
import { E, GOLD, INK, MILK, RR, TUFT, blobPath, fs, mkBlob, stroke2 } from './render/draw.js';
import { DPR, H, U, W, bgCv, c, cv, setView } from './core/view.js';
import { APP_URL, EMBEDDED, IS_INSTALLED, IS_IOS, STANDALONE_HOST } from './core/platform.js';
import { BOARD } from './store/board.js';
import { MUSIC } from './audio/music.js';
import { SND } from './audio/sfx.js';
import { TYPES } from './content/entities/rig.js';
import './content/entities/cow.js';
import './content/entities/animals.js';
import './content/entities/small.js';
import './content/entities/people.js';
import './content/entities/farm.js';
import './content/entities/beach.js';
import './content/entities/city.js';
import './content/entities/winter.js';
import './content/entities/sea.js';
import './content/entities/space.js';
import { MODS } from './content/worlds.js';
import { HUD_TOP, REPLAY, TOUCH_TARGET, curFlip, entBox, entPos, genScene, inBox, layoutEnt, levelScene, live, overlap, paintBg, sceneId } from './scene/generate.js';

let installEvt = null;




/* ================================================================
   Rendering
   ================================================================ */
function drawEnt(c, e, t) {
  const T = TYPES[e.type], [x, y] = entPos(e, t);
  if (live.scene.wd.ground && !e.float) {
    const b = T.box, w = (b[2] - b[0]) * e.s * .42;
    c.fillStyle = 'rgba(33,27,38,.14)'; E(c, x + (b[0] + b[2]) / 2 * e.s * e.flip * .3, e.y, w, Math.max(2, e.s * .06)); c.fill();
  }
  c.save(); c.translate(x, y);
  if (e.float) c.rotate((e.rot || 0) + Math.sin(t * .7 + e.ph) * .1);
  if (e.oy) c.translate(0, e.oy * e.s);
  c.scale(curFlip(e, t), 1);
  T.draw(c, e, t);
  c.restore();
}
function drawWorld(c, t, view) {
  c.drawImage(bgCv, 0, 0, W, H);
  if (live.scene.wd.back) live.scene.wd.back(c, t, live.scene);
  for (const e of live.scene.ents) { if (view && !overlap(entBox(e, t), view)) continue; drawEnt(c, e, t); }
  if (live.scene.wd.front) live.scene.wd.front(c, t, live.scene);
}

const ptr = { x: -999, y: -999, inside: false, type: 'mouse', down: null, inspect: false, lp: 0 };
const light = { x: 0, y: 0 };

function burst(x, y, n, kinds, power = 1) {
  for (let i = 0; i < n; i++) live.fx.push({ x, y, vx: R(-1, 1) * R(120, 360) * power, vy: -R(200, 520) * power, g: 900, life: 0, max: R(.9, 1.5), kind: pick(kinds), rot: R(0, TAU), vr: R(-7, 7), size: R(6, 12) * (U / 50), p: mkBlob(6, .4) });
}
function drawParticle(c, p) {
  const a = 1 - clamp((p.life - p.max * .7) / (p.max * .3), 0, 1);
  c.save(); c.globalAlpha = a; c.translate(p.x, p.y); c.rotate(p.rot); const s = p.size;
  switch (p.kind) {
    case 'milk': blobPath(c, p.p, 0, 0, s, s * .8); fs(c, MILK, 2); break;
    case 'spot': blobPath(c, p.p, 0, 0, s, s * .8); fs(c, INK, null); break;
    case 'heart': c.beginPath(); c.moveTo(0, s * .35); c.bezierCurveTo(-s * 1.1, -s * .4, -s * .4, -s * 1.1, 0, -s * .4); c.bezierCurveTo(s * .4, -s * 1.1, s * 1.1, -s * .4, 0, s * .35); fs(c, '#ff8fab', 2); break;
    case 'star': c.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? s * .45 : s; const ang = k / 10 * TAU - Math.PI / 2; c.lineTo(Math.cos(ang) * r, Math.sin(ang) * r); } c.closePath(); fs(c, GOLD, 2); break;
    case 'spark': c.beginPath(); for (let k = 0; k < 8; k++) { const r = k % 2 ? s * .2 : s * .7; const ang = k / 8 * TAU; c.lineTo(Math.cos(ang) * r, Math.sin(ang) * r); } c.closePath(); c.fillStyle = '#fff6c8'; c.fill(); break;
  }
  c.restore();
}
function floatText(x, y, text, color, size = 26, dur = 1.1) { live.texts.push({ x, y, text, color, size, t0: live.T, dur }); }
function canvasText(c, text, x, y, size, color, align = 'center') {
  c.font = `${size}px "Bagel Fat One", "Arial Rounded MT Bold", system-ui, sans-serif`; c.textAlign = align; c.textBaseline = 'middle';
  c.lineWidth = Math.max(3, size * .16); c.strokeStyle = INK; c.lineJoin = 'round'; c.strokeText(text, x, y); c.fillStyle = color; c.fillText(text, x, y);
}
function bubble(c, x, y, text, size, k) {
  c.save(); c.translate(x, y); const sc = easeBack(clamp(k, 0, 1)); c.scale(sc, sc);
  c.font = `${size}px "Bagel Fat One", "Arial Rounded MT Bold", system-ui, sans-serif`;
  const w = c.measureText(text).width + size * 1.0, h = size * 1.45;
  const tail = () => { c.beginPath(); c.moveTo(-size * .3, -2); c.lineTo(0, size * .55); c.lineTo(size * .2, -2); c.closePath(); };
  tail(); fs(c, MILK, 3.5);
  RR(c, -w / 2, -h, w, h, h * .42); fs(c, MILK, 3.5);
  c.beginPath(); c.moveTo(-size * .3 + 3, -5); c.lineTo(0, size * .45); c.lineTo(size * .2 - 3, -5); c.closePath(); c.fillStyle = MILK; c.fill();
  c.fillStyle = INK; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, 0, -h / 2 + size * .05);
  c.restore();
}
function cowCenter(t = live.T) { const b = entBox(live.scene.cow, t); return [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2]; }
function lensR() { return clamp(U * 1.7, 62, 100); }
function nightR() { return clamp(Math.min(W, H) * .16, 85, 150); }

function render() {
  const t = live.T;
  c.setTransform(DPR, 0, 0, DPR, 0, 0); c.lineJoin = 'round'; c.lineCap = 'round';
  if (!live.scene) { c.fillStyle = INK; c.fillRect(0, 0, W, H); return; }
  c.save();
  if (live.shake > 0 && !RM) c.translate((Math.random() - .5) * live.shake * 26, (Math.random() - .5) * live.shake * 26);
  drawWorld(c, t, null);
  for (const m of live.marks) {
    const k = (t - m.t0) / .9; if (k > 1) continue; const a = 1 - Math.max(0, (k - .6) / .4), s = 16 * easeBack(Math.min(1, k * 4)) * (U / 50);
    c.save(); c.globalAlpha = a; c.translate(m.x, m.y); c.rotate(-.1);
    c.beginPath(); c.moveTo(-s, -s); c.lineTo(s, s); c.moveTo(s, -s); c.lineTo(-s, s); stroke2(c, 6, '#ff5a4e', 3); c.restore();
  }
  c.restore();
  const night = live.scene.mods.has('night');
  if (night && live.nightK > .01) {
    const lx = light.x, ly = light.y, r = nightR();
    const g = c.createRadialGradient(lx, ly, r * .55, lx, ly, r * 1.05);
    g.addColorStop(0, 'rgba(8,6,22,0)'); g.addColorStop(1, `rgba(8,6,22,${.93 * live.nightK})`);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.beginPath(); c.arc(lx, ly, r * 1.02, 0, TAU); c.lineWidth = 2; c.strokeStyle = `rgba(255,240,180,${.25 * live.nightK})`; c.stroke();
  }
  if (live.radar) {
    const k = t - live.radar.t0;
    if (k > 3.8) live.radar = null;
    else {
      const a = k < .3 ? k / .3 : k > 3.2 ? (3.8 - k) / .6 : 1;
      c.save(); c.globalAlpha = a;
      c.beginPath(); c.arc(live.radar.x, live.radar.y, live.radar.r, 0, TAU); c.fillStyle = 'rgba(255,176,194,.16)'; c.fill();
      c.setLineDash([12, 9]); c.lineDashOffset = -k * 40; c.lineWidth = 4; c.strokeStyle = INK; c.stroke(); c.setLineDash([]);
      c.lineWidth = 2; c.strokeStyle = MILK; c.beginPath(); c.arc(live.radar.x, live.radar.y, live.radar.r - 4, 0, TAU); c.stroke();
      for (let i = 0; i < 3; i++) { const p = (k * .8 + i / 3) % 1; c.beginPath(); c.arc(live.radar.x, live.radar.y, live.radar.r * (1 - p), 0, TAU); c.strokeStyle = `rgba(242,90,130,${(1 - p) * .9})`; c.lineWidth = 3; c.stroke(); }
      canvasText(c, 'Muh?', live.radar.x, live.radar.y - live.radar.r - 4, 22, GOLD);
      c.restore();
    }
  }
  const lensOn = G.state === 'play' && !night && ((ptr.type === 'mouse' && ptr.inside) || (ptr.type !== 'mouse' && ptr.down && ptr.inspect));
  if (lensOn) {
    const r = lensR(), z = 2, px = ptr.x, py = ptr.y;
    let lx = px, ly = py;
    if (ptr.type !== 'mouse') { ly = py - r - 40; if (ly - r < 8) ly = py + r + 40; lx = clamp(px, r + 4, W - r - 4); }
    c.save(); c.beginPath(); c.arc(lx, ly, r, 0, TAU); c.clip();
    c.translate(lx, ly); c.scale(z, z); c.translate(-px, -py);
    const vr = r / z + U * 2; drawWorld(c, t, [px - vr, py - vr, px + vr, py + vr]);
    c.restore();
    c.save(); const a = Math.PI * .25; c.translate(lx + Math.cos(a) * r, ly + Math.sin(a) * r); c.rotate(a); RR(c, -2, -8, r * .62, 16, 8); fs(c, '#ff8fab', 3); c.restore();
    c.beginPath(); c.arc(lx, ly, r, 0, TAU); c.lineWidth = 6; c.strokeStyle = INK; c.stroke();
    c.beginPath(); c.arc(lx, ly, r - 5, -2.6, -1.7); c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,.75)'; c.stroke();
    c.beginPath(); c.arc(lx, ly, 3, 0, TAU); c.fillStyle = INK; c.fill(); c.beginPath(); c.arc(lx, ly, 9, 0, TAU); c.lineWidth = 1.5; c.strokeStyle = 'rgba(33,27,38,.5)'; c.stroke();
  } else if (G.state === 'play' && night && ptr.type === 'mouse' && ptr.inside) {
    c.beginPath(); c.arc(ptr.x, ptr.y, 6, 0, TAU); c.lineWidth = 2; c.strokeStyle = 'rgba(255,240,180,.9)'; c.stroke();
  }
  if (live.iris) {
    const k = easeOut(clamp((t - live.iris.t0) / .6, 0, 1)), [cx, cy] = cowCenter(t), R0 = Math.hypot(W, H), r = R0 + (live.iris.r - R0) * k;
    c.save(); c.beginPath(); c.rect(0, 0, W, H); c.arc(cx, cy, r, 0, TAU, true); c.fillStyle = `rgba(33,27,38,${.62 * k})`; c.fill('evenodd');
    c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.lineWidth = 4; c.strokeStyle = `rgba(255,253,248,${.9 * k})`; c.stroke(); c.restore();
    const b = entBox(live.scene.cow, t), bk = (t - live.iris.t0 - .15) / .35;
    if (bk > 0) bubble(c, clamp((b[0] + b[2]) / 2 + live.scene.cow.s * .2 * live.scene.cow.flip, 90, W - 90), Math.max(b[1] - 14, 70), live.iris.lost ? 'Hier war ich!' : (live.scene.golden ? 'MUUUH!' : 'MUH!'), clamp(U * .55, 22, 34), bk);
  }
  for (const p of live.fx) drawParticle(c, p);
  for (const tx of live.texts) { const k = (t - tx.t0) / tx.dur; if (k > 1) continue; c.save(); c.globalAlpha = 1 - Math.max(0, (k - .7) / .3); canvasText(c, tx.text, tx.x, tx.y - k * 46, tx.size * (k < .12 ? easeBack(k / .12) : 1), tx.color); c.restore(); }
  if (live.trans) drawTrans(c);
}

/* ---------- Holstein transition ---------- */
const TR_IN = RM ? .3 : .85, TR_HOLD = 1.55, TR_OUT = RM ? .3 : .8;
function makeTrans(onCovered, onDone) {
  const cell = Math.max(W, H) / 5, blobs = [];
  for (let gx = -.5; gx < W / cell + 1; gx++) for (let gy = -.5; gy < H / cell + 1; gy++) {
    const x = (gx + R(-.25, .25)) * cell, y = (gy + R(-.25, .25)) * cell;
    blobs.push({ x, y, r: cell * 1.5, d: (x / W) * .3 + R(0, .1), col: MILK, p: mkBlob(9, .35), z: 0 });
    if (Math.random() < .42) blobs.push({ x: x + R(-.3, .3) * cell, y: y + R(-.3, .3) * cell, r: cell * R(.5, .85), d: (x / W) * .3 + R(.05, .12), col: INK, p: mkBlob(8, .5), z: 1 });
  }
  blobs.sort((a, b) => a.z - b.z);
  return { blobs, t0: live.T, stage: 'in', onCovered, onDone };
}
function drawTrans(c) {
  const tt = live.T - live.trans.t0;
  for (const b of live.trans.blobs) {
    let p;
    if (live.trans.stage === 'in') p = easeOut(clamp((tt - b.d * TR_IN / .85) / (TR_IN * .5), 0, 1));
    else if (live.trans.stage === 'hold') p = 1;
    else p = 1 - easeOut(clamp((tt - b.d * TR_OUT / .85) / (TR_OUT * .5), 0, 1));
    if (p <= 0) continue;
    blobPath(c, b.p, b.x, b.y, b.r * p, b.r * p); c.fillStyle = b.col; c.fill();
    if (b.col === MILK && p < 1) { c.lineWidth = 3; c.strokeStyle = INK; c.stroke(); }
  }
}
function updateTrans() {
  if (!live.trans) return;
  const tt = live.T - live.trans.t0;
  if (live.trans.stage === 'in' && tt >= TR_IN) { live.trans.stage = 'hold'; live.trans.t0 = live.T; live.trans.onCovered && live.trans.onCovered(); }
  else if (live.trans.stage === 'hold' && tt >= live.trans.hold) { live.trans.stage = 'out'; live.trans.t0 = live.T; $('#banner').hidden = true; SND.whoosh(false); }
  else if (live.trans.stage === 'out' && tt >= TR_OUT) { const d = live.trans.onDone; live.trans = null; d && d(); }
}
function runTransition(onCovered, onDone, hold = TR_HOLD) { live.trans = makeTrans(onCovered, onDone); live.trans.hold = hold; SND.whoosh(true); }

/* ================================================================
   Game state & flow
   ================================================================ */
const G = { state: 'boot', lv: 1, score: 0, cows: 0, time: 45, streak: 0, bestStreak: 0, fastest: null, radar: 3, misses: 0, levelT: 0, usedRadar: false, paused: false, lastTick: 99, nudged: false };
const START_TIME = 45, MAX_TIME = 60;
function after(sec, fn) { live.timers.push({ at: live.T + sec, fn }); }
function loadRecord() { try { return JSON.parse(localStorage.getItem('wdk-record') || 'null') || { score: 0, cows: 0 }; } catch (_) { return { score: 0, cows: 0 }; } }
function saveRecord(r) { try { localStorage.setItem('wdk-record', JSON.stringify(r)); } catch (_) {} }

const els = { hud: $('#hud'), controls: $('#controls'), score: $('#score'), secs: $('#secs'), barFill: $('#barFill'), cows: $('#cows'), timer: $('#timer'), radarBtn: $('#radarBtn'), radarCount: $('#radarCount'), lvl: $('#lvlPill'), modPills: $('#modPills'), combo: $('#combo') };
const hudCache = {};
function setText(el, key, v) { if (hudCache[key] !== v) { hudCache[key] = v; el.textContent = v; } }
function updateHud() {
  setText(els.score, 'score', fmtInt(G.score));
  setText(els.cows, 'cows', String(G.cows));
  setText(els.secs, 'secs', String(Math.max(0, Math.ceil(G.time))));
  const f = clamp(G.time / MAX_TIME, 0, 1).toFixed(3);
  if (hudCache.bar !== f) { hudCache.bar = f; els.barFill.style.transform = `scaleX(${f})`; }
  els.timer.classList.toggle('low', G.time < 10 && G.state === 'play');
  setText(els.radarCount, 'radar', String(G.radar));
  els.radarBtn.disabled = G.radar <= 0 || G.state !== 'play';
  if (G.streak >= 2) { els.combo.hidden = false; setText(els.combo, 'combo', `Serie ×${fmt1(1 + .5 * Math.min(G.streak - 1, 8)).replace(',0', '')}`); } else els.combo.hidden = true;
}
function updateLevelPills() {
  els.lvl.textContent = `Level ${live.scene.lv} · ${live.scene.wd.name}`;
  els.modPills.innerHTML = '';
  for (const m of live.scene.mods) { const s = document.createElement('span'); s.className = 'pill mod'; s.textContent = MODS[m][0]; els.modPills.appendChild(s); }
}
function showBanner() {
  $('#bnLevel').textContent = `Level ${live.scene.lv}`;
  $('#bnName').textContent = live.scene.wd.name + (live.scene.mods.has('night') ? ' bei Nacht' : '');
  $('#bnTag').textContent = live.scene.lv === 1 ? 'Finde die Kuh. Klick drauf. So einfach ist das. Erstmal.' : live.scene.wd.tag;
  const m = $('#bnMods'); m.innerHTML = '';
  for (const k of live.scene.mods) { const d = document.createElement('div'); d.innerHTML = `<span class="pill mod"></span><span></span>`; d.children[0].textContent = MODS[k][0]; d.children[1].textContent = MODS[k][1]; m.appendChild(d); }
  const bn = $('#banner'); bn.hidden = false; const card = bn.firstElementChild; card.style.animation = 'none'; void card.offsetWidth; card.style.animation = '';
}
function loadLevel(lv, seed) {
  live.scene = levelScene(lv, live.scene && live.scene.world, seed); paintBg(live.scene); live.fx = []; live.texts = []; live.marks = []; live.iris = null; live.radar = null; live.nightK = 1;
  light.x = W / 2; light.y = H * .55; G.levelT = 0; G.usedRadar = false;
  updateLevelPills(); showBanner(); MUSIC.setWorld(live.scene.world);
}
function showGameUi(on) { els.hud.hidden = !on; els.controls.hidden = !on; }
function startGame() {
  SND.unlock(); SND.start();
  const lv0 = REPLAY ? REPLAY.lv : 1;
  Object.assign(G, { lv: lv0, score: 0, cows: 0, time: START_TIME, streak: 0, bestStreak: 0, fastest: null, radar: 3, misses: 0, levelT: 0, usedRadar: false, paused: false, lastTick: 99, nudged: false });
  $('#title').hidden = true; $('#over').hidden = true; $('#pause').hidden = true; $('#board').hidden = true;
  MUSIC.play();
  G.state = 'trans';
  runTransition(() => { loadLevel(lv0, REPLAY && REPLAY.seed); showGameUi(true); updateHud(); }, () => { G.state = 'play'; }, 2.1);
}
function toTitle() {
  G.state = 'title'; G.paused = false; showGameUi(false);
  $('#over').hidden = true; $('#pause').hidden = true; $('#banner').hidden = true; $('#board').hidden = true; live.trans = null;
  MUSIC.setWorld('weide'); MUSIC.play();
  live.scene = genScene(1, { title: true, density: .75, plan: { world: 'weide', mods: new Set(), golden: false } }); paintBg(live.scene);
  live.fx = []; live.texts = []; live.marks = []; live.iris = null; live.radar = null;
  const rec = loadRecord();
  if (REPLAY) $('#record').textContent = `Wiederholung von Szene ${REPLAY.lv}-${REPLAY.seed}. Zählt nicht für Rekord und Bestenliste.`;
  else $('#record').innerHTML = rec.score > 0 ? `Dein Rekord <b>${fmtInt(rec.score)} Punkte</b> <b>${rec.cows} ${rec.cows === 1 ? 'Kuh' : 'Kühe'}</b>` : 'Noch kein Rekord. Zeit, das zu ändern.';
  $('#title').hidden = false;
}
function nextLevel() {
  G.state = 'trans';
  runTransition(() => { G.lv++; loadLevel(G.lv); updateHud(); }, () => { G.state = 'play'; });
}
const RATINGS = [[1.5, 'Adlerauge!'], [3, 'Blitzschnell!'], [6, 'Gefunden!'], [12, 'Da ist sie ja!'], [1e9, 'Endlich!']];
function onFound() {
  G.state = 'found';
  const secs = G.levelT, cow = live.scene.cow;
  G.streak++; G.bestStreak = Math.max(G.bestStreak, G.streak); G.cows++;
  const mult = 1 + .5 * Math.min(G.streak - 1, 8), speed = 1 + clamp((8 - secs) / 8, 0, 1);
  const pts = Math.round((100 + 20 * G.lv) * speed * mult * (live.scene.golden ? 3 : 1) * (G.usedRadar ? .5 : 1) / 5) * 5;
  const bonus = Math.round(Math.max(6, 14 - G.lv * .5) + (live.scene.golden ? 8 : 0));
  G.score += pts; G.time = Math.min(G.time + bonus, 99);
  G.fastest = G.fastest == null ? secs : Math.min(G.fastest, secs);
  const extraRadar = G.cows % 5 === 0; if (extraRadar) G.radar++;
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
function onMiss(x, y, ent) {
  G.time = Math.max(0, G.time - 3); G.streak = 0; G.misses++;
  live.shake = .3; live.marks.push({ x, y, t0: live.T }); floatText(x, y - 24, '−3 s', '#ff5a4e', clamp(U * .48, 18, 28), .9);
  let msg;
  if (ent) { const m = TYPES[ent.type].msg; msg = typeof m === 'function' ? m(ent) : pick(m); ent.hopT = live.T; ent.hopN = 1; SND.animal(TYPES[ent.type].snd, (x / W) * 2 - 1); }
  else { msg = live.scene.mods.has('night') && Math.random() < .4 ? 'Im Dunkeln getappt.' : pick(live.scene.wd.empty); SND.bonk(); }
  say(msg, x, y);
  els.timer.classList.add('flash'); setTimeout(() => els.timer.classList.remove('flash'), 300);
}
function timeUp() {
  G.state = 'reveal'; G.time = 0; updateHud(); MUSIC.stop(); SND.womp();
  const cow = live.scene.cow; cow.hopT = live.T + .4; cow.hopN = 2;
  live.iris = { t0: live.T, r: Math.max(cow.s * 1.05, 60), lost: true };
  after(2.7, showOver);
}
const RANKS = [
  [0, 'Kuh-blind', 'Keine einzige Kuh. Die Weide lacht heute noch darüber.'],
  [1, 'Grünschnabel', 'Ein Anfang! Die Kühe haben dich bemerkt.'],
  [3, 'Melk-Azubi', 'Solide. Du erkennst eine Kuh, wenn sie vor dir steht.'],
  [6, 'Weide-Profi', 'Schafe und Schweine täuschen dich nicht mehr.'],
  [10, 'Kuhflüster-Ass', 'Du hörst das Muhen, bevor es passiert.'],
  [15, 'Herdenblick', 'Selbst im Weltall entgeht dir keine Kuh.'],
  [25, 'Legende der Alm', 'Man erzählt sich auf allen Almen von dir.']
];
function showOver() {
  G.state = 'over'; showGameUi(false);
  let rank = RANKS[0]; for (const r of RANKS) if (G.cows >= r[0]) rank = r;
  $('#rankName').textContent = rank[1]; $('#rankText').textContent = rank[2];
  $('#stCows').textContent = G.cows; $('#stScore').textContent = fmtInt(G.score); $('#stStreak').textContent = G.bestStreak;
  $('#stFast').textContent = G.fastest == null ? '–' : `${fmt1(G.fastest)} s`;
  const rec = loadRecord(), isNew = !REPLAY && G.score > rec.score;
  if (isNew) saveRecord({ score: G.score, cows: G.cows });
  $('#stamp').hidden = !isNew;
  $('#overRecord').innerHTML = isNew ? (rec.score > 0 ? `Alter Rekord <b>${fmtInt(rec.score)} Punkte</b>` : 'Dein erster Rekord. Den holst du dir nochmal.') : `Rekord <b>${fmtInt(rec.score)} Punkte</b> <b>${rec.cows} ${rec.cows === 1 ? 'Kuh' : 'Kühe'}</b>`;
  lastEntry = null; $('#entryMsg').textContent = ''; $('#entryBtn').disabled = false;
  $('#entryForm').hidden = G.score <= 0 || !!REPLAY;
  $('#overScene').textContent = `Szene ${sceneId(live.scene)}`;
  if (G.score > 0 && !REPLAY) {
    let nick = ''; try { nick = localStorage.getItem('wdk-nick') || ''; } catch (_) {}
    $('#nick').value = nick;
    lastEntry = { nick: nick || 'Du', score: G.score, cows: G.cows, at: Date.now() };
    const idx = BOARD.addLocal(lastEntry);
    if (BOARD.writable) {
      const place = 1 + BOARD.shared.filter(x => x.id !== BOARD.uid && x.score > G.score).length;
      $('#entryMsg').textContent = BOARD.mine && BOARD.mine.score >= G.score ? `Dein Bestwert in der Liste: ${fmtInt(BOARD.mine.score)} Punkte.` : `Das reicht für Platz ${place} in der Bestenliste.`;
    } else if (idx >= 0 && idx < 10) $('#entryMsg').textContent = `Platz ${idx + 1} auf diesem Gerät.`;
  }
  $('#over').hidden = false; setTimeout(() => $('#againBtn').focus({ preventScroll: true }), 50);
  if (isNew && G.score > 0) { SND.gold(); }
  setTimeout(() => { if (G.state === 'over') MUSIC.play(); }, 1400);
}
let lastEntry = null, boardTab = 'all';
async function submitEntry(ev) {
  ev.preventDefault(); if (!lastEntry) return;
  const nick = ($('#nick').value || '').replace(/\s+/g, ' ').trim().slice(0, 16) || 'Anonym';
  try { localStorage.setItem('wdk-nick', nick); } catch (_) {}
  BOARD.renameLocal(lastEntry.at, nick); lastEntry.nick = nick;
  const msg = $('#entryMsg'), btn = $('#entryBtn'); btn.disabled = true;
  if (!BOARD.writable) { msg.textContent = BOARD.available ? 'Auf diesem Gerät gespeichert. Für die gemeinsame Liste fehlen deinem Zugang die Schreibrechte.' : 'Auf diesem Gerät gespeichert.'; SND.bell(1.3); return; }
  msg.textContent = 'Wird eingetragen …';
  const r = await BOARD.submit(nick, G.score, G.cows);
  if (r === 'ok') { const place = 1 + BOARD.shared.filter(x => x.id !== BOARD.uid && x.score > G.score).length; msg.textContent = `Eingetragen! Platz ${place} in der Bestenliste.`; SND.fanfare(3); }
  else if (r === 'notbest') { msg.textContent = `Dein Bestwert von ${fmtInt(BOARD.mine.score)} Punkten steht schon drin. Name aktualisiert.`; SND.bell(1.3); }
  else if (r === 'readonly') { msg.textContent = 'Auf diesem Gerät gespeichert. Für die gemeinsame Liste fehlen deinem Zugang die Schreibrechte.'; }
  else { msg.textContent = 'Das hat nicht geklappt. Prüf deine Verbindung und versuch es nochmal.'; btn.disabled = false; }
}
function openBoard() { if (!BOARD.available) boardTab = 'local'; renderBoard(); $('#board').hidden = false; setTimeout(() => $('#boardClose').focus({ preventScroll: true }), 30); }
function renderBoard() {
  const shared = BOARD.available;
  if (!shared) boardTab = 'local';
  $('#tabAll').hidden = !shared;
  $('#tabAll').setAttribute('aria-selected', String(boardTab === 'all')); $('#tabLocal').setAttribute('aria-selected', String(boardTab === 'local'));
  const list = boardTab === 'all' ? BOARD.shared : BOARD.local(), ol = $('#rankList'); ol.textContent = '';
  if (!list.length) {
    const li = document.createElement('li'); li.className = 'empty';
    li.textContent = boardTab === 'all' && !BOARD.ready ? 'Bestenliste wird geladen …' : 'Noch keine Einträge. Spiel eine Runde und trag dich ein.';
    ol.appendChild(li);
  }
  list.forEach((e, i) => {
    const li = document.createElement('li');
    if (boardTab === 'all' ? e.id === BOARD.uid : (lastEntry && e.at === lastEntry.at)) li.className = 'me';
    const add = (cls, text) => { const sp = document.createElement('span'); sp.className = cls; sp.textContent = text; li.appendChild(sp); };
    add('pl', String(i + 1)); add('nm', e.nick); add('cw', `${e.cows} ${e.cows === 1 ? 'Kuh' : 'Kühe'}`); add('sc', fmtInt(e.score));
    ol.appendChild(li);
  });
  $('#boardNote').textContent = !shared ? 'Hier stehen deine zehn besten Runden auf diesem Gerät.'
    : boardTab === 'local' ? 'Deine zehn besten Runden auf diesem Gerät.'
    : BOARD.writable ? 'Pro Person zählt die beste Runde.' : 'Ansehen kann die Liste jeder. Eintragen kann sich, wer das Spiel mit Schreibrechten geteilt bekommen hat.';
}
BOARD.onChange(() => { if (!$('#board').hidden) renderBoard(); });
function useRadar() {
  if (G.state !== 'play' || G.radar <= 0) return;
  G.radar--; G.usedRadar = true; els.radarBtn.classList.remove('nudge');
  const [cx, cy] = cowCenter(), r = clamp(Math.min(W, H) * .2, 90, 190), a = R(0, TAU), d = R(0, r * .5);
  live.radar = { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, r, t0: live.T };
  SND.ping(); setTimeout(() => SND.moo((cx / W) * 2 - 1, 1.08, .85), 250);
  updateHud();
}
function say(msg, x, y) {
  document.querySelectorAll('.say').forEach((n, i, all) => { if (all.length - i > 1) n.remove(); });
  const d = document.createElement('div'); d.className = 'say'; d.textContent = msg; document.body.appendChild(d);
  const w = d.offsetWidth, h = d.offsetHeight;
  let left = clamp(x - w / 2, 12, W - w - 12), top = y - h - 26;
  if (top < 110) { top = y + 30; d.classList.add('below'); }
  d.style.left = left + 'px'; d.style.top = top + 'px'; d.style.setProperty('--tx', clamp(x - left, 18, w - 18) + 'px');
  setTimeout(() => d.remove(), 2100);
}
function praise(big, small, gold) {
  const p = $('#praise'); $('#praiseBig').textContent = big; $('#praiseBig').classList.toggle('gold', !!gold); $('#praiseSmall').textContent = small;
  p.classList.remove('show'); void p.offsetWidth; p.classList.add('show');
}
function pauseGame() { if (G.state !== 'play' || G.paused) return; G.paused = true; $('#pauseScene').textContent = `Szene ${sceneId(live.scene)}`; MUSIC.stop(); $('#pause').hidden = false; syncSoundLabels(); setTimeout(() => $('#resumeBtn').focus({ preventScroll: true }), 30); }
function resumeGame() { if (!G.paused) return; G.paused = false; $('#pause').hidden = true; last = performance.now(); MUSIC.play(); }

/* ---------- input ---------- */
function guess(x, y) {
  if (!live.scene) return;
  if (G.state === 'title') {
    const b = entBox(live.scene.cow, live.T), p = live.scene.cow.s * .12;
    if (inBox([b[0] - p, b[1] - p, b[2] + p, b[3] + p], x, y)) { SND.unlock(); SND.moo((x / W) * 2 - 1); live.scene.cow.hopT = live.T; live.scene.cow.hopN = 2; burst(x, y, 16, ['milk', 'spot', 'heart']); say('Muh! Die war leicht. Jetzt mit Zeitdruck?', x, y); }
    return;
  }
  if (G.state !== 'play' || G.paused) return;
  const b = entBox(live.scene.cow, live.T), p = live.scene.cow.s * .1;
  // Fingers need a bigger target than the cow's box when it is small.
  const tx = ptr.type === 'mouse' ? p : Math.max(p, (TOUCH_TARGET - (b[2] - b[0])) / 2), ty = ptr.type === 'mouse' ? p : Math.max(p, (TOUCH_TARGET - (b[3] - b[1])) / 2);
  if (inBox([b[0] - tx, b[1] - ty, b[2] + tx, b[3] + ty], x, y)) { onFound(); return; }
  let hit = null;
  for (let i = live.scene.ents.length - 1; i >= 0; i--) { const e = live.scene.ents[i]; if (e !== live.scene.cow && inBox(entBox(e, live.T), x, y)) { hit = e; break; } }
  onMiss(x, y, hit);
}
cv.addEventListener('pointerdown', ev => {
  SND.unlock();
  ptr.type = ev.pointerType || 'mouse'; ptr.x = ev.clientX; ptr.y = ev.clientY; ptr.inside = true;
  if (ptr.type === 'mouse') { if (ev.button === 0) guess(ptr.x, ptr.y); return; }
  ptr.down = { x: ptr.x, y: ptr.y }; ptr.inspect = false; light.x = ptr.x; light.y = ptr.y;
  clearTimeout(ptr.lp); ptr.lp = setTimeout(() => { if (ptr.down) ptr.inspect = true; }, 260);
  try { cv.setPointerCapture(ev.pointerId); } catch (_) {}
});
cv.addEventListener('pointermove', ev => {
  ptr.type = ev.pointerType || 'mouse'; ptr.x = ev.clientX; ptr.y = ev.clientY; ptr.inside = true;
  if (ptr.down && Math.hypot(ptr.x - ptr.down.x, ptr.y - ptr.down.y) > 12) ptr.inspect = true;
  if (ptr.type === 'mouse' || ptr.down) { light.x = ptr.x; light.y = ptr.y; }
});
cv.addEventListener('pointerup', ev => {
  clearTimeout(ptr.lp);
  if (ptr.type !== 'mouse' && ptr.down) { if (!ptr.inspect) guess(ev.clientX, ev.clientY); }
  ptr.down = null; ptr.inspect = false;
});
cv.addEventListener('pointercancel', () => { clearTimeout(ptr.lp); ptr.down = null; ptr.inspect = false; });
cv.addEventListener('pointerleave', ev => { if ((ev.pointerType || 'mouse') === 'mouse') ptr.inside = false; });
cv.addEventListener('contextmenu', ev => ev.preventDefault());
window.addEventListener('keydown', ev => {
  if (ev.target && ev.target.tagName === 'INPUT') return;
  if (ev.key === ' ' && G.state === 'play' && !G.paused) { ev.preventDefault(); useRadar(); }
  else if ((ev.key === 'p' || ev.key === 'P' || ev.key === 'Escape') && G.state === 'play') { ev.preventDefault(); G.paused ? resumeGame() : pauseGame(); }
  else if ((ev.key === 'm' || ev.key === 'M') && ev.target.tagName !== 'INPUT') toggleMusic();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { pauseGame(); MUSIC.stop(); }
  else if (musicMayPlay()) MUSIC.play();
});
const musicMayPlay = () => !G.paused && G.state !== 'reveal';
function toggleSound() { SND.toggle(); if (SND.on) { SND.bell(1); if (musicMayPlay()) MUSIC.play(); } else MUSIC.stop(); syncSoundLabels(); }
function toggleMusic() { MUSIC.arm(); if (MUSIC.toggle()) { if (musicMayPlay()) MUSIC.play(); } else MUSIC.stop(); syncSoundLabels(); }
const armAudio = () => { SND.unlock(); MUSIC.arm(); if (G.state === 'title' || G.state === 'over') MUSIC.play(); window.removeEventListener('pointerdown', armAudio, true); window.removeEventListener('keydown', armAudio, true); };
window.addEventListener('pointerdown', armAudio, true); window.addEventListener('keydown', armAudio, true);
function syncSoundLabels() {
  for (const id of ['#soundBtn', '#pauseSoundBtn']) { const b = $(id); b.textContent = `Ton: ${SND.on ? 'an' : 'aus'}`; b.setAttribute('aria-pressed', String(SND.on)); }
  for (const id of ['#musicBtn', '#pauseMusicBtn']) { const b = $(id); b.textContent = `Musik: ${MUSIC.on ? 'an' : 'aus'}`; b.setAttribute('aria-pressed', String(MUSIC.on)); }
}
$('#startBtn').addEventListener('click', startGame);
$('#againBtn').addEventListener('click', startGame);
$('#menuBtn').addEventListener('click', toTitle);
$('#soundBtn').addEventListener('click', toggleSound);
$('#pauseSoundBtn').addEventListener('click', toggleSound);
$('#musicBtn').addEventListener('click', toggleMusic);
$('#pauseMusicBtn').addEventListener('click', toggleMusic);
$('#boardBtn').addEventListener('click', openBoard);
$('#overBoardBtn').addEventListener('click', openBoard);
$('#boardClose').addEventListener('click', () => { $('#board').hidden = true; });
$('#tabAll').addEventListener('click', () => { boardTab = 'all'; renderBoard(); });
$('#tabLocal').addEventListener('click', () => { boardTab = 'local'; renderBoard(); });
$('#entryForm').addEventListener('submit', submitEntry);
$('#pauseBtn').addEventListener('click', pauseGame);
$('#resumeBtn').addEventListener('click', resumeGame);
$('#quitBtn').addEventListener('click', () => { G.paused = false; $('#pause').hidden = true; G.time = 0; timeUp(); });
els.radarBtn.addEventListener('click', useRadar);
$('#howto').textContent = COARSE ? 'Tippen = Tipp abgeben · Halten & ziehen = Lupe · Glocke = Muh-Radar' : 'Maus bewegen = Lupe · Klick = Tipp · Leertaste = Muh-Radar · P = Pause · M = Musik';
function setupInstall() {
  const btn = $('#installBtn'), link = $('#appLink'), hint = $('#installHint');
  $('#legal').hidden = !STANDALONE_HOST || EMBEDDED;
  if (IS_INSTALLED) return;
  if (STANDALONE_HOST && !EMBEDDED) {
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => {});
    window.addEventListener('beforeinstallprompt', ev => { ev.preventDefault(); installEvt = ev; btn.hidden = false; });
    window.addEventListener('appinstalled', () => { installEvt = null; btn.hidden = true; });
    btn.addEventListener('click', async () => { if (!installEvt) return; installEvt.prompt(); try { await installEvt.userChoice; } catch (_) {} installEvt = null; btn.hidden = true; });
    if (IS_IOS) { hint.hidden = false; hint.textContent = 'Als App sichern: unten auf das Teilen-Symbol tippen, dann „Zum Home-Bildschirm“.'; }
  } else if (APP_URL) { link.href = APP_URL; link.hidden = false; }
}

/* ---------- resize ---------- */
function resize() {
  const dpr = Math.min(2, window.devicePixelRatio || 1), w = Math.max(300, window.innerWidth), h = Math.max(300, window.innerHeight);
  setView(w, h, dpr, clamp(Math.sqrt(w * h) / 17, 30, 64));
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  if (live.scene) { for (const e of live.scene.ents) layoutEnt(e); paintBg(live.scene); }
}
let rzT = 0; window.addEventListener('resize', () => { clearTimeout(rzT); rzT = setTimeout(resize, 80); });

/* ---------- main loop ---------- */
let last = performance.now();
function update(dt) {
  live.T += dt;
  for (let i = live.timers.length - 1; i >= 0; i--) if (live.timers[i].at <= live.T) { const f = live.timers[i].fn; live.timers.splice(i, 1); f(); }
  updateTrans();
  if (live.shake > 0) live.shake = Math.max(0, live.shake - dt * 1.4);
  if (live.scene) {
    let mv = false;
    for (const e of live.scene.ents) {
      if (!e.moving || (e === live.scene.cow && G.state !== 'play' && G.state !== 'title')) continue;
      mv = true; e.wp += dt * 9; e.x += e.flip * e.spd * U * dt;
      const maxX = e === live.scene.cow && e.y > H - 110 ? W - 230 : W - U * .7;
      if (e.x < U * .7 && e.flip < 0) e.flip = 1; else if (e.x > maxX && e.flip > 0) e.flip = -1;
      else if (Math.random() < dt * .12) e.flip *= -1;
      if (e.float) { e.y += e.vy * U * dt; const lo = HUD_TOP() + 40, hi = H * .9; if (e.y < lo) e.vy = Math.abs(e.vy); if (e.y > hi) e.vy = -Math.abs(e.vy); e.ny = e.y / H; }
      e.nx = e.x / W;
    }
    if (mv) live.scene.ents.sort((a, b) => a.y - b.y);
    if (live.scene.golden && G.state === 'play' && Math.random() < dt * 2.5) { const b = entBox(live.scene.cow, live.T); live.fx.push({ x: R(b[0], b[2]), y: R(b[1], b[3]), vx: 0, vy: -20, g: 0, life: 0, max: .7, kind: 'spark', rot: 0, vr: 2, size: R(4, 8) * (U / 50), p: TUFT }); }
  }
  for (let i = live.fx.length - 1; i >= 0; i--) { const p = live.fx[i]; p.life += dt; if (p.life > p.max) { live.fx.splice(i, 1); continue; } p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; }
  if (live.texts.length > 20) live.texts.splice(0, live.texts.length - 20);
  if ((G.state === 'found' || G.state === 'reveal') && live.nightK > 0) live.nightK = Math.max(0, live.nightK - dt * 2.5);
  if (G.state === 'play') {
    G.time -= dt; G.levelT += dt;
    if (G.time < 5.5) { const sec = Math.ceil(G.time); if (sec < G.lastTick && sec > 0) { G.lastTick = sec; SND.tick(sec); } } else G.lastTick = 99;
    if (G.lv === 1 && !G.nudged && G.levelT > 9 && G.radar > 0) { G.nudged = true; els.radarBtn.classList.add('nudge'); }
    if (G.time <= 0) timeUp();
  }
  if (G.state !== 'title' && G.state !== 'boot' && G.state !== 'over') updateHud();
  MUSIC.setFast(G.state === 'play' && G.time < 10);
  cv.style.cursor = G.state === 'play' && ptr.type === 'mouse' ? 'none' : 'default';
}
function frame(now) {
  if (MANUAL_CLOCK) { requestAnimationFrame(frame); return; }
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  if (!G.paused) update(dt);
  render();
  requestAnimationFrame(frame);
}

/* ---------- test hooks (only with ?test) ---------- */
// The contract for scripts/fairness.mjs and scripts/snapshots.mjs; keep it stable while refactoring.
const query = (() => { try { return new URLSearchParams(location.search); } catch (_) { return new URLSearchParams(); } })();
const TEST = query.has('test');
// ?clock=manual stops the frame loop; time then only moves through advance(), so runs are reproducible.
const MANUAL_CLOCK = TEST && query.get('clock') === 'manual';
function testHooks() {
  return {
    levelScene, genScene, entBox, resize, HUD_TOP, get W() { return W; }, get H() { return H; },
    // Where HUD and radar button really sit for this scene, with the widest pill row the game can show.
    uiRects(sc) {
      live.scene = sc; showGameUi(true); updateLevelPills(); els.combo.hidden = false; els.combo.textContent = 'Serie ×4,5';
      const hud = Math.max(...[...els.hud.children].map(el => el.getBoundingClientRect().bottom)), r = els.controls.getBoundingClientRect();
      return { hudBottom: hud, controls: [r.left, r.top, r.right, r.bottom] };
    },
    // Background, figures and ambience of a scene at time t, without HUD, lens or effects.
    renderScene(sc, t) {
      live.scene = sc; paintBg(sc);
      c.setTransform(DPR, 0, 0, DPR, 0, 0); c.lineJoin = 'round'; c.lineCap = 'round';
      drawWorld(c, t, null);
      return cv.toDataURL('image/png');
    },
    startGame, useRadar,
    advance(sec, dt = 1 / 60) { for (let i = Math.round(sec / dt); i > 0; i--) if (!G.paused) update(dt); },
    guess(x, y, type = 'mouse') { ptr.type = type; guess(x, y); },
    cowCenter: () => cowCenter(),
    state: () => ({ state: G.state, lv: G.lv, score: G.score, cows: G.cows, time: Math.round(G.time * 1000) / 1000, streak: G.streak, bestStreak: G.bestStreak, radar: G.radar, misses: G.misses, scene: live.scene && sceneId(live.scene), world: live.scene && live.scene.world })
  };
}

/* ---------- boot ---------- */
function start(data) {
  resize(); syncSoundLabels(); setupInstall(); BOARD.init();
  if (TEST) window.__WDK__ = testHooks();
  if (data && data.G && ['play', 'found', 'trans'].includes(data.state)) {
    Object.assign(G, data.G, { paused: false, state: 'trans' });
    $('#title').hidden = true;
    runTransition(() => { loadLevel(G.lv); showGameUi(true); updateHud(); }, () => { G.state = 'play'; });
  } else toTitle();
  requestAnimationFrame(frame);
}
try { window.claude?.hot?.snapshot?.(() => ({ G: Object.assign({}, G), state: G.state })); } catch (_) {}
if (window.claude?.hot?.ready) window.claude.hot.ready(start); else start(window.claude?.hot?.data ?? {});
