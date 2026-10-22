import { INK, RR, blobPath, fs, shade } from '../../render/draw.js';

/* ================================================================
   Entity types
   ================================================================ */
export const NAMES = ['Jürgen', 'Heike', 'Kevin', 'Uschi', 'Bernd', 'Gisela', 'Tobi', 'Ayşe', 'Lars', 'Mia', 'Detlef', 'Chantal', 'Hans-Peter', 'Svenja', 'Mehmet', 'Greta', 'Olaf', 'Jana', 'Ralf', 'Lina', 'Dieter', 'Yvonne', 'Paul', 'Elif'];
export const SKIN = ['#f9d3b4', '#e8b48f', '#c68c5d', '#8d5524', '#f1c27d', '#ffdbac', '#a86b45'];
export const HAIR = ['#2b1d14', '#5a3825', '#d6a25c', '#e6cc8a', '#a33b20', '#1a1a1a', '#c9c9c9', '#7b5cd6', '#e86a92'];
export const SHIRT = ['#ff6b6b', '#ffd93d', '#6bcbef', '#4d96ff', '#9b5de5', '#f15bb5', '#00bb7a', '#ff9f1c', '#2ec4b6', '#ef476f', '#8ac926'];
export const PANTS = ['#3d5a80', '#293241', '#6d597a', '#b56576', '#2a9d8f', '#264653', '#7f5539', '#5e548e'];
export const BALLOON = ['#ff4d6d', '#ffd23f', '#3ec1ff', '#9b5de5', '#06d6a0'];

export const TYPES = {};
export function def(name, o) { TYPES[name] = Object.assign({ k: 1, box: [-.5, -1, .5, 0], snd: 'tock', msg: ['Das ist keine Kuh.'] }, o); }

/* ---------- quadruped rig ---------- */
function leg(c, x, y, len, w, ang, col, hoof, lw) {
  c.save(); c.translate(x, y); c.rotate(ang);
  RR(c, -w / 2, -w * .2, w, len + w * .2, w * .42); fs(c, col, lw);
  if (hoof) { RR(c, -w / 2, len - w * .5, w, w * .5, w * .25); fs(c, hoof, lw); }
  c.restore();
}
function stdBody(c, e, t, L, BH, by) {
  RR(c, -L / 2, by, L, BH, BH * .48); c.fillStyle = e.col; c.fill();
  if (e.spots) {
    c.save(); c.clip(); c.fillStyle = e.spotC;
    for (const sp of e.spots) { blobPath(c, sp.p, sp.x * L, by + BH / 2 + sp.y * BH, sp.r * L, sp.r * L * sp.a); c.fill(); }
    c.restore();
  }
  RR(c, -L / 2, by, L, BH, BH * .48); c.lineWidth = e.lw; c.strokeStyle = INK; c.stroke();
}
export function quad(c, e, t, P) {
  const s = e.s, lw = e.lw, L = s * P.bl, BH = s * P.bh, LG = s * P.lg, LW = s * P.lw;
  const by = -LG - BH, hipY = -LG - BH * .32, len = LG + BH * .32;
  let sw = 0;
  if (e.moving) sw = Math.sin(e.wp) * .45; else if (e.float) sw = Math.sin(t * 2.2 + e.ph) * .35;
  const legC = P.legC || e.legC || e.col, far = shade(legC.length === 7 ? legC : '#ffffff', -.16), hoof = P.hoof;
  leg(c, L * .3, hipY, len, LW, -sw, far, hoof, lw);
  leg(c, -L * .26, hipY, len, LW, sw, far, hoof, lw);
  if (P.tail) P.tail(c, e, t, L, by, BH);
  if (P.under) P.under(c, e, t, L, BH, LG);
  leg(c, L * .38, hipY, len, LW, sw, legC, hoof, lw);
  leg(c, -L * .36, hipY, len, LW, -sw, legC, hoof, lw);
  const br = 1 + Math.sin(t * 2.3 + e.ph) * .018;
  c.save(); c.translate(0, by + BH); c.scale(1, br); c.translate(0, -(by + BH));
  (P.body || stdBody)(c, e, t, L, BH, by);
  if (P.over) P.over(c, e, t, L, BH, by);
  c.restore();
  P.head(c, e, t, L / 2, by, BH);
  if (P.post) P.post(c, e, t, L, by, BH);
}
