// Pointer, keyboard and visibility input; guess() decides between hit and miss.
import { W, cv } from '../core/view.js';
import { MUSIC } from '../audio/music.js';
import { SND } from '../audio/sfx.js';
import { TOUCH_TARGET, entBox, inBox } from '../scene/generate.js';
import { G, light, live, ptr } from './state.js';
import { burst } from '../render/fx.js';
import { onFound, onMiss } from './flow.js';
import { pauseGame, resumeGame, say, useRadar } from './actions.js';
import { musicMayPlay, toggleMusic } from '../ui/controls.js';

export function guess(x, y) {
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
