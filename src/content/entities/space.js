// Space creatures and props.
import { R, pick, rnd } from '../../core/rng.js';
import { TAU } from '../../core/util.js';
import { E, INK, MILK, RR, blobPath, fs, mkBlob, mkSpots, stroke2 } from '../../render/draw.js';
import { def } from './rig.js';

def('alien', {
  k: .9, box: [-.36, -.62, .36, .44], snd: 'beep', rotR: .2,
  msg: ['Ein Alien. Sucht auch die Kuh.', 'Außerirdisch, aber keine Kuh.', 'Das Alien sagt: Bliep. Das heißt nein.'],
  init(e) { e.col = pick(['#7ee081', '#ff8fd0', '#b197fc', '#66e0ff', '#ffd166']); e.three = rnd() < .25; },
  draw(c, e, t) {
    const s = e.s, lw = e.lw;
    for (const d of [-1, 1]) { c.beginPath(); c.moveTo(d * s * .08, -s * .3); c.lineTo(d * s * .16, -s * .52); c.lineWidth = Math.max(1, lw); c.strokeStyle = INK; c.stroke(); E(c, d * s * .16, -s * .54, s * .045, s * .045); fs(c, '#ff8fab', lw * .7); }
    for (const d of [-1, 1]) { RR(c, d * s * .12 - s * .04, s * .25, s * .08, s * .16, s * .04); fs(c, e.col, lw); }
    E(c, 0, 0, s * .28, s * .36); fs(c, e.col, lw);
    const lx = Math.sin(t * .9 + e.ph) * s * .03;
    if (e.three) { for (const d of [-1, 0, 1]) { E(c, d * s * .1, -s * .1 + (d === 0 ? -s * .05 : 0), s * .055, s * .055); fs(c, '#fff', lw * .7); E(c, d * s * .1 + lx * .5, -s * .1 + (d === 0 ? -s * .05 : 0), s * .025, s * .025); c.fillStyle = INK; c.fill(); } }
    else { E(c, 0, -s * .1, s * .13, s * .13); fs(c, '#fff', lw); E(c, lx, -s * .1, s * .06, s * .06); c.fillStyle = INK; c.fill(); }
    c.beginPath(); c.arc(0, s * .1, s * .08, .3, Math.PI - .3); c.lineWidth = Math.max(1, lw * .8); c.strokeStyle = INK; c.stroke();
  }
});
def('ufo', {
  k: 1.4, box: [-.57, -.34, .57, .17], snd: 'ufo', rotR: .15,
  msg: ['Ein UFO. Die haben die Kuh noch nicht.', 'UFO! Wollte die Kuh entführen. Hat sie nicht gefunden.'],
  draw(c, e, t) {
    const s = e.s, lw = e.lw;
    E(c, 0, -s * .08, s * .07, s * .07); fs(c, '#7ee081', lw * .7);
    c.beginPath(); c.ellipse(0, -s * .05, s * .22, s * .22, 0, Math.PI, 0); c.closePath(); c.fillStyle = 'rgba(170,230,255,.6)'; c.fill(); c.lineWidth = lw; c.strokeStyle = INK; c.stroke();
    E(c, 0, 0, s * .55, s * .15); fs(c, '#b9c3d6', lw);
    E(c, 0, s * .03, s * .38, s * .07); fs(c, '#8e99b0', lw * .7);
    for (let i = 0; i < 5; i++) { const on = Math.floor(t * 4 + i) % 2 === 0; E(c, (-.36 + i * .18) * s, -s * .03, s * .03, s * .03); fs(c, on ? '#ffd23f' : '#ff6b6b', lw * .5); }
  }
});
def('asteroid', {
  k: 1, box: [-.48, -.48, .48, .48], msg: ['Ein Asteroid.', 'Nur ein Stein im All.'],
  init(e) { e.p = R(.75, 1.1); e.blob = mkBlob(9, .3); e.spin = R(-.3, .3); e.cr = Array.from({ length: 3 }, () => [R(-.2, .2), R(-.2, .2), R(.05, .1)]); },
  draw(c, e, t) {
    const s = e.s, lw = e.lw; c.rotate(t * e.spin);
    blobPath(c, e.blob, 0, 0, s * .42, s * .38); fs(c, '#8f8aa3', lw);
    for (const [x, y, r] of e.cr) { E(c, x * s, y * s, r * s, r * s * .8); fs(c, '#6f6a85', lw * .6); }
  }
});
const planetDraw = (c, e) => {
  const s = e.s, lw = e.lw;
  c.beginPath(); c.ellipse(0, 0, s * .58, s * .16, -.3, Math.PI, TAU); stroke2(c, Math.max(2, s * .05), e.ring, lw * .7);
  E(c, 0, 0, s * .36, s * .36); c.fillStyle = e.spotty ? MILK : e.c1; c.fill();
  c.save(); c.clip();
  if (e.spotty) { c.fillStyle = INK; for (const sp of e.spots) { blobPath(c, sp.p, sp.x * s * .7, sp.y * s * .7, sp.r * s * .7, sp.r * s * .7 * sp.a); c.fill(); } }
  else { c.fillStyle = e.c2; for (const y of [-.2, .02, .2]) c.fillRect(-s * .4, y * s, s * .8, s * .07); }
  c.restore(); E(c, 0, 0, s * .36, s * .36); fs(c, null, lw);
  c.beginPath(); c.ellipse(0, 0, s * .58, s * .16, -.3, 0, Math.PI); stroke2(c, Math.max(2, s * .05), e.ring, lw * .7);
};
def('planet', {
  k: 1.3, box: [-.6, -.42, .6, .42], rotR: .3, msg: ['Ein Planet.', 'Planet. Leider unbewohnt von Kühen.'],
  init(e) { const [a, b] = pick([['#ff9f68', '#f27b5c'], ['#74c0fc', '#4dabf7'], ['#b197fc', '#9775fa'], ['#ffd166', '#f4a261']]); e.c1 = a; e.c2 = b; e.ring = pick(['#ffd29d', '#e9ecef', '#ffadd2']); },
  draw: planetDraw
});
def('spotplanet', {
  k: 1.3, box: [-.6, -.42, .6, .42], rotR: .3, msg: ['Ein Planet im Kuhmuster. Gemein, oder?', 'Muh-Planet. Aber keine Kuh.'],
  init(e) { e.spotty = true; e.spots = mkSpots(5, .12, .2); e.ring = '#ffadd2'; }, draw: planetDraw
});
def('rocket', {
  k: 1.6, box: [-.3, -.62, .3, .6], rotR: .8, snd: 'ufo', msg: ['Eine Rakete. 3, 2, 1 … falsch.', 'Rakete. Fliegt zum Mond, nicht zur Kuh.'],
  draw(c, e, t) {
    const s = e.s, lw = e.lw, fl = 1 + Math.sin(t * 25 + e.ph) * .2;
    c.beginPath(); c.moveTo(-s * .1, s * .3); c.quadraticCurveTo(0, s * (.3 + .32 * fl), s * .1, s * .3); c.closePath(); fs(c, '#ff9f1c', lw * .7);
    c.beginPath(); c.moveTo(-s * .05, s * .3); c.quadraticCurveTo(0, s * (.3 + .18 * fl), s * .05, s * .3); c.closePath(); fs(c, '#ffd23f', null);
    for (const d of [-1, 1]) { c.beginPath(); c.moveTo(d * s * .14, s * .05); c.lineTo(d * s * .27, s * .3); c.lineTo(d * s * .12, s * .3); c.closePath(); fs(c, '#e63946', lw); }
    const body = () => { c.beginPath(); c.moveTo(0, -s * .6); c.quadraticCurveTo(s * .2, -s * .35, s * .16, s * .32); c.lineTo(-s * .16, s * .32); c.quadraticCurveTo(-s * .2, -s * .35, 0, -s * .6); c.closePath(); };
    body(); c.fillStyle = '#f3f3f7'; c.fill(); c.save(); c.clip(); c.fillStyle = '#e63946'; c.fillRect(-s * .3, -s * .7, s * .6, s * .24); c.restore(); body(); fs(c, null, lw);
    E(c, 0, -s * .1, s * .08, s * .08); fs(c, '#74c0fc', lw); E(c, -s * .025, -s * .125, s * .025, s * .02); c.fillStyle = 'rgba(255,255,255,.8)'; c.fill();
  }
});
def('satellite', {
  k: 1.2, box: [-.62, -.3, .62, .3], rotR: .6, msg: ['Ein Satellit. Meldet: keine Kuh hier.', 'Satellit. Hat auch kein Kuh-Signal.'],
  draw(c, e) {
    const s = e.s, lw = e.lw;
    c.beginPath(); c.moveTo(-s * .5, 0); c.lineTo(s * .5, 0); c.lineWidth = Math.max(1, lw); c.strokeStyle = INK; c.stroke();
    for (const d of [-1, 1]) { RR(c, d > 0 ? s * .2 : -s * .6, -s * .13, s * .4, s * .26, s * .02); fs(c, '#3b6fd8', lw); c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = Math.max(1, lw * .5); for (let i = 1; i < 4; i++) { const x = (d > 0 ? .2 : -.6) + i * .1; c.beginPath(); c.moveTo(x * s, -s * .13); c.lineTo(x * s, s * .13); c.stroke(); } }
    RR(c, -s * .14, -s * .16, s * .28, s * .32, s * .04); fs(c, '#e5b54a', lw);
    c.beginPath(); c.moveTo(0, -s * .16); c.lineTo(0, -s * .28); c.lineWidth = Math.max(1, lw); c.strokeStyle = INK; c.stroke(); E(c, 0, -s * .3, s * .06, s * .03); fs(c, '#e9ecef', lw * .7);
  }
});
