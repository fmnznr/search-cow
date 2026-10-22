// Beach figures and props.
import { R, RI, pick } from '../../core/rng.js';
import { TAU } from '../../core/util.js';
import { E, INK, MILK, RR, blobPath, circles, fs, mkSpots, stroke2 } from '../../render/draw.js';
import { def } from './rig.js';

def('umbrella', {
  k: 1.7, box: [-.55, -1.1, .62, 0], msg: ['Ein Sonnenschirm.', 'Schirm. Darunter ist nur Schatten.'],
  init(e) { e.c1 = pick(['#e63946', '#3d6fb5', '#2a9d8f', '#f15bb5', '#ff9f1c']); e.c2 = MILK; e.tilt = R(-.18, .18); },
  draw(c, e) {
    const s = e.s, lw = e.lw;
    c.beginPath(); c.moveTo(0, 0); c.lineTo(s * .05, -s * .86); stroke2(c, Math.max(1.5, lw * 1.1), MILK, lw * .8);
    c.save(); c.translate(s * .05, -s * .84); c.rotate(e.tilt);
    const w = s * .52, h = s * .24;
    const canopy = () => { c.beginPath(); c.moveTo(-w, 0); c.bezierCurveTo(-w, -h * 1.35, w, -h * 1.35, w, 0); const n = 6; for (let i = n; i > 0; i--) { const x0 = -w + 2 * w * i / n, x1 = -w + 2 * w * (i - 1) / n; c.quadraticCurveTo((x0 + x1) / 2, h * .3, x1, 0); } c.closePath(); };
    canopy(); c.fillStyle = e.c1; c.fill();
    c.save(); c.clip(); c.fillStyle = e.c2; for (let i = 0; i < 6; i += 2) { c.beginPath(); c.moveTo(0, -h * 1.2); c.lineTo(-w + 2 * w * i / 6, h * .4); c.lineTo(-w + 2 * w * (i + 1) / 6, h * .4); c.closePath(); c.fill(); } c.restore();
    canopy(); fs(c, null, lw);
    E(c, 0, -h * 1.02, s * .025, s * .025); fs(c, INK, null);
    c.restore();
  }
});
const towelDraw = (c, e) => {
  const s = e.s, lw = e.lw;
  const path = () => { c.beginPath(); c.moveTo(-s * .5, 0); c.lineTo(s * .4, 0); c.lineTo(s * .5, -s * .14); c.lineTo(-s * .4, -s * .14); c.closePath(); };
  path(); c.fillStyle = e.cow ? MILK : e.c1; c.fill();
  c.save(); c.clip();
  if (e.cow) { c.fillStyle = INK; for (const sp of e.spots) { blobPath(c, sp.p, sp.x * s, -s * .07 + sp.y * s * .14, sp.r * s, sp.r * s * .45); c.fill(); } }
  else { c.fillStyle = e.c2; for (let i = -3; i < 4; i += 2) c.fillRect(i * s * .12, -s * .2, s * .1, s * .3); }
  c.restore(); path(); fs(c, null, lw);
};
def('towel', {
  k: 1.25, box: [-.5, -.16, .5, .02], msg: ['Ein Handtuch. Reserviert seit 6 Uhr.', 'Handtuch. Liegt hier nur rum.'],
  init(e) { e.c1 = pick(['#3ec1ff', '#ffd23f', '#ff6b6b', '#06d6a0', '#9b5de5']); e.c2 = pick([MILK, '#ff9f1c', '#3d6fb5']); },
  draw: towelDraw
});
def('cowtowel', {
  k: 1.25, box: [-.5, -.16, .5, .02], msg: ['Ein Handtuch im Kuh-Look. Fies, oder?', 'Nur ein Handtuch mit Flecken.'],
  init(e) { e.cow = true; e.spots = mkSpots(RI(4, 6), .07, .12); }, draw: towelDraw
});
def('castle', {
  k: 1, box: [-.42, -.98, .42, 0], msg: ['Eine Sandburg.', 'Sandburg. Bauzeit: drei Stunden.'],
  draw(c, e, t) {
    const s = e.s, lw = e.lw, col = '#e8c27a';
    c.beginPath(); c.moveTo(0, -s * .76); c.lineTo(0, -s * .96); c.lineWidth = Math.max(1, lw * .8); c.strokeStyle = INK; c.stroke();
    c.beginPath(); c.moveTo(0, -s * .96); c.quadraticCurveTo(s * .08, -s * (.93 + Math.sin(t * 5 + e.ph) * .02), s * .15, -s * .9); c.lineTo(0, -s * .86); c.closePath(); fs(c, '#e63946', lw * .7);
    for (const [x, y, w] of [[-.38, -.6, .22, .6], [.16, -.6, .22, .6], [-.11, -.76, .22, .76]]) {
      c.beginPath(); c.moveTo(x * s, 0); c.lineTo(x * s, y * s); for (let i = 0; i < 3; i++) { const cx = x * s + w * s * (i / 3); c.lineTo(cx, (y - .06) * s); c.lineTo(cx + w * s / 6, (y - .06) * s); c.lineTo(cx + w * s / 6, y * s); c.lineTo(cx + w * s / 3, y * s); }
      c.lineTo((x + w) * s, 0); c.closePath(); fs(c, col, lw);
    }
    RR(c, -s * .4, -s * .32, s * .8, s * .32, s * .04); fs(c, col, lw);
    c.beginPath(); c.moveTo(-s * .07, 0); c.lineTo(-s * .07, -s * .12); c.arc(0, -s * .12, s * .07, Math.PI, 0); c.lineTo(s * .07, 0); c.closePath(); fs(c, '#a77b3e', lw * .7);
  }
});
def('ball', {
  k: .5, box: [-.5, -1, .5, 0], msg: ['Ein Wasserball.', 'Ball. Rund, bunt, keine Kuh.'],
  draw(c, e, t) {
    const s = e.s, lw = e.lw, r = s * .5, rot = Math.sin(t * .8 + e.ph) * .4;
    E(c, 0, -r, r, r); c.fillStyle = MILK; c.fill();
    c.save(); c.clip(); const cols = ['#e63946', '#ffd23f', '#3d6fb5'];
    for (let i = 0; i < 3; i++) { const a = rot + i * TAU / 3; c.beginPath(); c.moveTo(0, -r); c.arc(0, -r, r, a, a + TAU / 6); c.closePath(); c.fillStyle = cols[i]; c.fill(); }
    c.restore(); E(c, 0, -r, r, r); fs(c, null, lw); E(c, -r * .35, -r * 1.35, r * .18, r * .12, -.6); c.fillStyle = 'rgba(255,255,255,.7)'; c.fill();
  }
});
def('palm', {
  k: 2.3, box: [-.45, -1.02, .45, 0], msg: ['Eine Palme.', 'Palme. Keine Kuh, aber Kokosnüsse.'],
  init(e) { e.lean = R(-.6, .6); },
  draw(c, e, t) {
    const s = e.s, lw = e.lw, tx = e.lean * s * .25, ty = -s * .8;
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(0, -s * .45, tx, ty); stroke2(c, s * .08, '#b07a4a', lw);
    const sway = Math.sin(t * 1.1 + e.ph) * .08;
    for (const a of [-2.9, -2.35, -1.8, -1.3, -.75, -.2]) {
      c.save(); c.translate(tx, ty); c.rotate(a + sway);
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(s * .2, -s * .12, s * .42, s * .06); c.quadraticCurveTo(s * .2, -s * .01, 0, 0); fs(c, '#3fa34d', lw);
      c.restore();
    }
    circles(c, [[e.lean * .25 - .04, -.77, .04], [e.lean * .25 + .04, -.77, .04], [e.lean * .25, -.74, .04]], s, '#7a4a2a', lw * .8);
  }
});
