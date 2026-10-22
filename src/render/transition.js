// The Holstein-spot transition between screens.
import { R } from '../core/rng.js';
import { $, RM, clamp, easeOut } from '../core/util.js';
import { INK, MILK, blobPath, mkBlob } from './draw.js';
import { H, W } from '../core/view.js';
import { SND } from '../audio/sfx.js';
import { live } from '../game/state.js';

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
export function drawTrans(c) {
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
export function updateTrans() {
  if (!live.trans) return;
  const tt = live.T - live.trans.t0;
  if (live.trans.stage === 'in' && tt >= TR_IN) { live.trans.stage = 'hold'; live.trans.t0 = live.T; live.trans.onCovered && live.trans.onCovered(); }
  else if (live.trans.stage === 'hold' && tt >= live.trans.hold) { live.trans.stage = 'out'; live.trans.t0 = live.T; $('#banner').hidden = true; SND.whoosh(false); }
  else if (live.trans.stage === 'out' && tt >= TR_OUT) { const d = live.trans.onDone; live.trans = null; d && d(); }
}
export function runTransition(onCovered, onDone, hold = TR_HOLD) { live.trans = makeTrans(onCovered, onDone); live.trans.hold = hold; SND.whoosh(true); }
