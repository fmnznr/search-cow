import { R, RI, rnd } from '../core/rng.js';
import { TAU } from '../core/util.js';

export const INK = '#211b26', MILK = '#fffdf8', PINK = '#ffb0c2', HORN = '#f4e7c8', GOLD = '#ffc21a';
const shadeCache = new Map();
export function shade(hex, amt) {
  const key = hex + amt; let v = shadeCache.get(key); if (v) return v;
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = n >> 8 & 255, b = n & 255;
  const tg = amt < 0 ? 0 : 255, a = Math.abs(amt);
  r = Math.round(r + (tg - r) * a); g = Math.round(g + (tg - g) * a); b = Math.round(b + (tg - b) * a);
  v = 'rgb(' + r + ',' + g + ',' + b + ')'; shadeCache.set(key, v); return v;
}

/* path helpers */
export function E(c, x, y, rx, ry, rot) { c.beginPath(); c.ellipse(x, y, Math.max(.1, Math.abs(rx)), Math.max(.1, Math.abs(ry)), rot || 0, 0, TAU); }
export function RR(c, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2)); c.beginPath(); c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
export function fs(c, fill, lw) { if (fill) { c.fillStyle = fill; c.fill(); } if (lw) { c.lineWidth = lw; c.strokeStyle = INK; c.stroke(); } }
export function mkBlob(n, irr) { const p = []; for (let i = 0; i < n; i++) { const a = (i + R(-.25, .25)) / n * TAU, r = 1 - irr / 2 + rnd() * irr; p.push([Math.cos(a) * r, Math.sin(a) * r]); } return p; }
export function blobPath(c, p, x, y, rx, ry) {
  c.beginPath(); const n = p.length;
  for (let i = 0; i <= n; i++) {
    const a = p[i % n], b = p[(i + 1) % n], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    if (i === 0) c.moveTo(x + mx * rx, y + my * ry); else c.quadraticCurveTo(x + a[0] * rx, y + a[1] * ry, x + mx * rx, y + my * ry);
  }
  c.closePath();
}
export function mkSpots(n, r0, r1, irr = .45) { const a = []; for (let i = 0; i < n; i++) a.push({ x: R(-.45, .45), y: R(-.5, .5), r: R(r0, r1), a: R(.7, 1.2), p: mkBlob(RI(6, 9), irr) }); return a; }
export function circles(c, list, s, col, lw) {
  c.beginPath(); for (const [x, y, r] of list) { c.moveTo(x * s + r * s, y * s); c.arc(x * s, y * s, r * s, 0, TAU); }
  if (lw) { c.lineWidth = lw; c.strokeStyle = INK; c.stroke(); } c.fillStyle = col; c.fill();
}
export function stroke2(c, w, col, lw) { c.lineWidth = w + lw * 2; c.strokeStyle = INK; c.stroke(); c.lineWidth = w; c.strokeStyle = col; c.stroke(); }
export function eye(c, x, y, r, t, e) {
  if (((t + e.ph * 3) % 4.3) < .12) { c.beginPath(); c.moveTo(x - r, y); c.lineTo(x + r, y); c.lineWidth = Math.max(1, r * .6); c.strokeStyle = INK; c.stroke(); return; }
  E(c, x, y, r, r * 1.15); c.fillStyle = INK; c.fill(); E(c, x + r * .35, y - r * .4, r * .38, r * .38); c.fillStyle = '#fff'; c.fill();
}
export const TUFT = mkBlob(6, .35);
