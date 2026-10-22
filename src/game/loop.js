// Resize handling and the frame loop.
import { R } from '../core/rng.js';
import { clamp } from '../core/util.js';
import { TUFT } from '../render/draw.js';
import { DPR, H, U, W, cv, setView } from '../core/view.js';
import { MANUAL_CLOCK } from '../core/platform.js';
import { MUSIC } from '../audio/music.js';
import { SND } from '../audio/sfx.js';
import { HUD_TOP, entBox, layoutEnt, paintBg } from '../scene/generate.js';
import { G, live, ptr } from './state.js';
import { currentMode } from '../modes/index.js';
import { render } from '../render/frame.js';
import { updateTrans } from '../render/transition.js';
import { els, updateHud } from '../ui/hud.js';
import { timeUp } from './flow.js';

export function resize() {
  const dpr = Math.min(2, window.devicePixelRatio || 1), w = Math.max(300, window.innerWidth), h = Math.max(300, window.innerHeight);
  setView(w, h, dpr, clamp(Math.sqrt(w * h) / 17, 30, 64));
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  if (live.scene) { for (const e of live.scene.ents) layoutEnt(e); paintBg(live.scene); }
}
let rzT = 0; window.addEventListener('resize', () => { clearTimeout(rzT); rzT = setTimeout(resize, 80); });

/* ---------- main loop ---------- */
let last = performance.now();
export function resetClock() { last = performance.now(); }
export function update(dt) {
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
    if (currentMode().isOver(G)) timeUp();
  }
  if (G.state !== 'title' && G.state !== 'boot' && G.state !== 'over') updateHud();
  MUSIC.setFast(G.state === 'play' && G.time < 10);
  cv.style.cursor = G.state === 'play' && ptr.type === 'mouse' ? 'none' : 'default';
}
export function frame(now) {
  if (MANUAL_CLOCK) { requestAnimationFrame(frame); return; }
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  if (!G.paused) update(dt);
  render();
  requestAnimationFrame(frame);
}
