import { R, RI, rnd } from '../../core/rng.js';
import { TAU } from '../../core/util.js';
import { E, GOLD, HORN, INK, MILK, PINK, RR, TUFT, blobPath, eye, fs, mkBlob, mkSpots, stroke2 } from '../../render/draw.js';
import { def, quad } from './rig.js';

/* ---------- cow ---------- */
function headAcc(c, e, s, lw, ox = 0, oy = 0) {
  c.save(); c.translate(ox, oy);
  switch (e.acc) {
    case 'shades':
      c.beginPath(); c.moveTo(s * .06, -s * .11); c.lineTo(-s * .01, -s * .125); c.lineWidth = lw; c.strokeStyle = INK; c.stroke();
      RR(c, s * .05, -s * .14, s * .15, s * .065, s * .03); fs(c, INK, null);
      c.beginPath(); c.moveTo(s * .08, -s * .125); c.lineTo(s * .12, -s * .125); c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = Math.max(1, lw * .7); c.stroke();
      break;
    case 'cap':
      c.beginPath(); c.moveTo(-s * .02, -s * .15); c.quadraticCurveTo(s * .08, -s * .31, s * .24, -s * .2); c.lineTo(s * .32, -s * .175); c.lineTo(s * .2, -s * .145); c.closePath(); fs(c, '#7a5a43', lw);
      break;
    case 'beanie':
      c.beginPath(); c.arc(s * .13, -s * .17, s * .13, Math.PI, 0); c.closePath(); fs(c, '#e63946', lw);
      RR(c, -s * .01, -s * .2, s * .29, s * .06, s * .03); fs(c, MILK, lw);
      E(c, s * .13, -s * .31, s * .045, s * .045); fs(c, MILK, lw);
      break;
    case 'helmet':
      E(c, s * .15, -s * .07, s * .27, s * .25); c.fillStyle = 'rgba(190,235,255,.3)'; c.fill(); c.lineWidth = lw; c.strokeStyle = INK; c.stroke();
      c.beginPath(); c.arc(s * .15, -s * .07, s * .2, -2.7, -1.9); c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = Math.max(1.5, lw * 1.2); c.stroke();
      break;
    case 'flower':
      for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; E(c, s * .03 + Math.cos(a) * s * .035, -s * .2 + Math.sin(a) * s * .035, s * .026, s * .026); fs(c, MILK, Math.max(.8, lw * .5)); }
      E(c, s * .03, -s * .2, s * .022, s * .022); fs(c, GOLD, Math.max(.8, lw * .5));
      break;
  }
  c.restore();
}
function cowHead(c, e, t, hx, hy) {
  const s = e.s, lw = e.lw, g = e.graze;
  c.save();
  c.translate(hx - s * .07, hy + s * .07 + (g ? s * .24 : 0));
  c.rotate(g ? .5 + Math.sin(t * 3 + e.ph) * .06 : -.06 + Math.sin(t * 1.3 + e.ph) * .06);
  c.save(); c.translate(s * .05, -s * .12); c.rotate(-.35 + Math.sin(t * 2.7 + e.ph * 2) * .18);
  E(c, -s * .07, 0, s * .085, s * .042); fs(c, e.col, lw); E(c, -s * .075, 0, s * .05, s * .02); c.fillStyle = PINK; c.fill();
  c.restore();
  if (e.acc !== 'beanie') {
    c.beginPath(); c.moveTo(s * .08, -s * .17); c.quadraticCurveTo(s * .05, -s * .27, s * .12, -s * .3); c.quadraticCurveTo(s * .11, -s * .23, s * .15, -s * .18); c.closePath(); fs(c, HORN, lw * .85);
  }
  RR(c, 0, -s * .2, s * .28, s * .27, s * .11); c.fillStyle = e.col; c.fill();
  if (e.headSpot) { c.save(); c.clip(); blobPath(c, e.headSpot.p, s * e.headSpot.x * .28, -s * .2 + s * e.headSpot.y * .27, s * .09, s * .08); c.fillStyle = e.spotC; c.fill(); c.restore(); }
  RR(c, 0, -s * .2, s * .28, s * .27, s * .11); fs(c, null, lw);
  RR(c, s * .14, -s * .06, s * .2, s * .15, s * .07); fs(c, e.gold ? '#ffb37a' : PINK, lw);
  E(c, s * .285, 0, s * .014, s * .022); c.fillStyle = INK; c.fill();
  E(c, s * .215, 0, s * .012, s * .02); c.fill();
  eye(c, s * .11, -s * .1, s * .03, t, e);
  headAcc(c, e, s, lw);
  c.restore();
}
function cowTail(c, e, t, L, by, BH) {
  const s = e.s; c.save(); c.translate(-L / 2 + s * .03, by + BH * .18); c.rotate(.15 + Math.sin(t * 2.4 + e.ph) * .22);
  c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-s * .13, s * .1, -s * .1, s * .34);
  stroke2(c, e.lw * 1.1, e.col, e.lw * .8);
  blobPath(c, TUFT, -s * .1, s * .38, s * .045, s * .07); c.fillStyle = e.spotC; c.fill();
  c.restore();
}
function udder(c, e, t, L, BH, LG) {
  const s = e.s, x = -L * .18, y = -LG;
  for (const dx of [-.045, 0, .045]) { RR(c, x + dx * s - s * .013, y + s * .04, s * .026, s * .05, s * .013); fs(c, PINK, e.lw * .6); }
  E(c, x, y + s * .02, s * .1, s * .06); fs(c, PINK, e.lw);
}
function cowBell(c, e, t, L, by, BH) {
  const s = e.s, x = L / 2 - s * .02, y = by + BH * .52;
  c.beginPath(); c.moveTo(x - s * .06, by + s * .04); c.quadraticCurveTo(x - s * .05, y - s * .02, x, y);
  c.lineWidth = Math.max(1.5, s * .03); c.strokeStyle = '#c0392b'; c.stroke();
  c.save(); c.translate(x, y); c.rotate(Math.sin(t * 3 + e.ph) * .25);
  c.beginPath(); c.moveTo(-s * .035, 0); c.lineTo(s * .035, 0); c.lineTo(s * .052, s * .085); c.lineTo(-s * .052, s * .085); c.closePath(); fs(c, GOLD, e.lw * .8);
  E(c, 0, s * .09, s * .015, s * .015); c.fillStyle = INK; c.fill();
  c.restore();
}
const COW = { bl: 1, bh: .44, lg: .3, lw: .11, hoof: INK, head: cowHead, tail: cowTail, under: udder, post: cowBell };
def('cow', {
  k: 1.25, box: [-.6, -.97, .82, .02], walk: true, snd: 'moo', oy: .5, rotR: .3,
  init(e, sc) {
    e.col = MILK; e.spotC = INK; e.spots = mkSpots(RI(3, 5), .14, .24);
    e.headSpot = rnd() < .6 ? { p: mkBlob(7, .4), x: R(.2, .7), y: R(.1, .5) } : null;
    e.graze = !e.float && rnd() < .35; e.acc = sc.wd.cowAcc;
    if (sc.golden) { e.col = '#ffd34d'; e.spotC = '#c98a0b'; e.gold = true; }
  },
  draw(c, e, t) { quad(c, e, t, COW); }
});
