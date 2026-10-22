// Draws one frame: world, miss marks, night, radar, lens, iris, particles, texts, transition.
import { RM, TAU, clamp, easeBack, easeOut } from '../core/util.js';
import { GOLD, INK, MILK, RR, fs, stroke2 } from './draw.js';
import { DPR, H, U, W, c } from '../core/view.js';
import { entBox } from '../scene/generate.js';
import { G, light, live, ptr } from '../game/state.js';
import { drawWorld } from './world.js';
import { bubble, canvasText, drawParticle } from './fx.js';
import { drawTrans } from './transition.js';

export function cowCenter(t = live.T) { const b = entBox(live.scene.cow, t); return [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2]; }
function lensR() { return clamp(U * 1.7, 62, 100); }
function nightR() { return clamp(Math.min(W, H) * .16, 85, 150); }

export function render() {
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
