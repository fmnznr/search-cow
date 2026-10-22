// Draws the world: background, figures with their shadows, ambient layers.
import { E } from './draw.js';
import { H, W, bgCv } from '../core/view.js';
import { TYPES } from '../content/entities/rig.js';
import { curFlip, entBox, entPos, overlap } from '../scene/generate.js';
import { live } from '../game/state.js';

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
export function drawWorld(c, t, view) {
  c.drawImage(bgCv, 0, 0, W, H);
  if (live.scene.wd.back) live.scene.wd.back(c, t, live.scene);
  for (const e of live.scene.ents) { if (view && !overlap(entBox(e, t), view)) continue; drawEnt(c, e, t); }
  if (live.scene.wd.front) live.scene.wd.front(c, t, live.scene);
}
