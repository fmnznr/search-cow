// Particles, floating texts and speech bubbles on the canvas.
import { R, pick } from '../core/rng.js';
import { TAU, clamp, easeBack } from '../core/util.js';
import { GOLD, INK, MILK, RR, blobPath, fs, mkBlob } from './draw.js';
import { U } from '../core/view.js';
import { live } from '../game/state.js';

export function burst(x, y, n, kinds, power = 1) {
  for (let i = 0; i < n; i++) live.fx.push({ x, y, vx: R(-1, 1) * R(120, 360) * power, vy: -R(200, 520) * power, g: 900, life: 0, max: R(.9, 1.5), kind: pick(kinds), rot: R(0, TAU), vr: R(-7, 7), size: R(6, 12) * (U / 50), p: mkBlob(6, .4) });
}
export function drawParticle(c, p) {
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
export function floatText(x, y, text, color, size = 26, dur = 1.1) { live.texts.push({ x, y, text, color, size, t0: live.T, dur }); }
export function canvasText(c, text, x, y, size, color, align = 'center') {
  c.font = `${size}px "Bagel Fat One", "Arial Rounded MT Bold", system-ui, sans-serif`; c.textAlign = align; c.textBaseline = 'middle';
  c.lineWidth = Math.max(3, size * .16); c.strokeStyle = INK; c.lineJoin = 'round'; c.strokeText(text, x, y); c.fillStyle = color; c.fillText(text, x, y);
}
export function bubble(c, x, y, text, size, k) {
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
