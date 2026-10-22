// Draws one album sticker: the cow of a world, dressed for how it was found, or a question mark.
import { withSeed } from '../core/rng.js';
import { RR, fs } from './draw.js';
import { TYPES } from '../content/entities/rig.js';
import { WORLDS } from '../content/worlds.js';

const BG = { weide: '#bfe3a0', strand: '#f6dfa6', stadt: '#cfd3dc', winter: '#eef4fb', meer: '#9fd3ea', all: '#3a2a78' };

function cowFor(world, kind, s) {
  const e = { type: 'cow', ph: 1.3, flip: 1, k: 1, wp: 1.1, p: 1, s, lw: Math.max(1, s * .055) };
  if (WORLDS[world].float) { e.float = true; e.oy = TYPES.cow.oy || 0; }
  // Seeded, so a sticker always shows the same spots.
  withSeed([...world + kind].reduce((h, ch) => h * 31 + ch.charCodeAt(0) | 0, 7), () => TYPES.cow.init(e, { wd: WORLDS[world], golden: kind === 'gold', mods: new Set() }));
  if (kind === 'move') e.moving = true;
  return e;
}
function drawCow(c, e, x, y) {
  const b = TYPES.cow.box, oy = (e.oy || 0) * e.s;
  c.save(); c.translate(x - (b[0] + b[2]) / 2 * e.s, y - (b[1] + b[3]) / 2 * e.s - oy); c.translate(0, oy);
  TYPES.cow.draw(c, e, .3);
  c.restore();
}

export function drawSticker(cv, world, kind, got) {
  const dpr = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth || 64, h = cv.clientHeight || 52;
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.lineJoin = 'round'; c.lineCap = 'round';
  RR(c, 1.5, 1.5, w - 3, h - 3, 10);
  if (!got) {
    fs(c, '#e7e2ec', 2.5);
    c.fillStyle = 'rgba(33,27,38,.35)'; c.font = `${Math.round(h * .5)}px "Bagel Fat One", system-ui, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', w / 2, h / 2 + 2);
    return;
  }
  fs(c, kind === 'night' ? '#1d2140' : BG[world], 2.5);
  c.save(); RR(c, 3, 3, w - 6, h - 6, 8); c.clip();
  const s = Math.min(w * .6 / 1.42, h * .7) * (kind === 'tiny' ? .55 : 1), cx = w / 2, cy = h / 2 + 1;
  if (kind === 'night') { const g = c.createRadialGradient(cx, cy, 2, cx, cy, h * .55); g.addColorStop(0, 'rgba(255,240,190,.75)'); g.addColorStop(1, 'rgba(255,240,190,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); }
  if (kind === 'twins') { c.globalAlpha = .45; const ghost = cowFor(world, 'normal', s * .9); ghost.flip = -1; c.save(); c.translate(cx - s * .38, cy - 2); c.scale(-1, 1); drawCow(c, ghost, 0, 0); c.restore(); c.globalAlpha = 1; }
  if (kind === 'move') { c.strokeStyle = 'rgba(33,27,38,.45)'; c.lineWidth = 2; for (const dy of [-.25, 0, .25]) { c.beginPath(); c.moveTo(cx - s * .95, cy + dy * s); c.lineTo(cx - s * .7, cy + dy * s); c.stroke(); } }
  drawCow(c, cowFor(world, kind, s), kind === 'twins' ? cx + s * .18 : cx, cy);
  c.restore();
}
