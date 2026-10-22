// Player actions during a level: radar, pause, speech bubbles and praise.
import { R } from '../core/rng.js';
import { $, TAU, clamp } from '../core/util.js';
import { H, W } from '../core/view.js';
import { MUSIC } from '../audio/music.js';
import { SND } from '../audio/sfx.js';
import { sceneId } from '../scene/generate.js';
import { G, live } from './state.js';
import { cowCenter } from '../render/frame.js';
import { els, updateHud } from '../ui/hud.js';
import { syncSoundLabels } from '../ui/controls.js';
import { resetClock } from './loop.js';

export function useRadar() {
  if (G.state !== 'play' || G.radar <= 0) return;
  G.radar--; G.usedRadar = true; els.radarBtn.classList.remove('nudge');
  const [cx, cy] = cowCenter(), r = clamp(Math.min(W, H) * .2, 90, 190), a = R(0, TAU), d = R(0, r * .5);
  live.radar = { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, r, t0: live.T };
  SND.ping(); setTimeout(() => SND.moo((cx / W) * 2 - 1, 1.08, .85), 250);
  updateHud();
}
export function say(msg, x, y) {
  document.querySelectorAll('.say').forEach((n, i, all) => { if (all.length - i > 1) n.remove(); });
  const d = document.createElement('div'); d.className = 'say'; d.textContent = msg; document.body.appendChild(d);
  const w = d.offsetWidth, h = d.offsetHeight;
  let left = clamp(x - w / 2, 12, W - w - 12), top = y - h - 26;
  if (top < 110) { top = y + 30; d.classList.add('below'); }
  d.style.left = left + 'px'; d.style.top = top + 'px'; d.style.setProperty('--tx', clamp(x - left, 18, w - 18) + 'px');
  setTimeout(() => d.remove(), 2100);
}
export function praise(big, small, gold) {
  const p = $('#praise'); $('#praiseBig').textContent = big; $('#praiseBig').classList.toggle('gold', !!gold); $('#praiseSmall').textContent = small;
  p.classList.remove('show'); void p.offsetWidth; p.classList.add('show');
}
export function pauseGame() { if (G.state !== 'play' || G.paused) return; G.paused = true; $('#pauseScene').textContent = `Szene ${sceneId(live.scene)}`; MUSIC.stop(); $('#pause').hidden = false; syncSoundLabels(); setTimeout(() => $('#resumeBtn').focus({ preventScroll: true }), 30); }
export function resumeGame() { if (!G.paused) return; G.paused = false; $('#pause').hidden = true; resetClock(); MUSIC.play(); }
