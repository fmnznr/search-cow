// Plants and props of the farm.
import { R, pick, rnd } from '../../core/rng.js';
import { TAU } from '../../core/util.js';
import { E, GOLD, INK, RR, circles, fs, shade } from '../../render/draw.js';
import { def } from './rig.js';

def('tree', {
  k: 2.1, box: [-.36, -1.02, .36, 0], msg: ['Ein Baum.', 'Baum. Sehr standhaft, sehr keine Kuh.', 'Hinter dem Baum? Nein. Das ist der Baum.'],
  init(e) {
    e.c1 = pick(['#3fa34d', '#4fb04a', '#2f9447', '#5bbd57']);
    e.cr = [[0, -.78, .22], [-.17, -.66, .17], [.17, -.66, .17], [-.09, -.52, .16], [.1, -.53, .15], [.02, -.64, .2]].map(([x, y, r]) => [x + R(-.02, .02), y + R(-.02, .02), r * R(.9, 1.1)]);
    e.apples = rnd() < .35 ? Array.from({ length: 5 }, () => [R(-.22, .22), R(-.82, -.52)]) : null;
  },
  draw(c, e, t) {
    const s = e.s, lw = e.lw;
    c.beginPath(); c.moveTo(-s * .07, 0); c.lineTo(-s * .045, -s * .52); c.lineTo(s * .045, -s * .52); c.lineTo(s * .07, 0); c.closePath(); fs(c, '#8b5a3c', lw);
    c.save(); c.translate(Math.sin(t * .9 + e.ph) * s * .01, 0);
    circles(c, e.cr, s, e.c1, lw);
    c.fillStyle = 'rgba(255,255,255,.16)'; for (const [x, y, r] of e.cr.slice(0, 3)) { E(c, (x - r * .25) * s, (y - r * .3) * s, r * .5 * s, r * .38 * s); c.fill(); }
    if (e.apples) for (const [x, y] of e.apples) { E(c, x * s, y * s, s * .028, s * .028); fs(c, '#e63946', lw * .6); }
    c.restore();
  }
});
def('bush', {
  k: 1.05, box: [-.5, -.6, .5, 0], msg: ['Nur ein Busch.', 'Busch. Dahinter ist sie auch nicht.', 'Ein Busch. Raschel.'],
  init(e, sc) {
    e.c1 = pick(['#4caf50', '#3f9e45', '#5cbf5a']);
    e.cr = [[-.25, -.2, .22], [.25, -.2, .22], [0, -.33, .26], [-.1, -.15, .2], [.12, -.14, .2]].map(([x, y, r]) => [x + R(-.03, .03), y, r * R(.9, 1.1)]);
    e.dots = rnd() < .6 ? Array.from({ length: 6 }, () => [R(-.35, .35), R(-.5, -.1)]) : null; e.dotC = pick(['#e63946', '#ffffff', '#ff8fab', '#9b5de5']);
  },
  draw(c, e) {
    const s = e.s, lw = e.lw; circles(c, e.cr, s, e.c1, lw);
    c.fillStyle = 'rgba(255,255,255,.14)'; E(c, -s * .08, -s * .42, s * .14, s * .07); c.fill();
    if (e.dots) for (const [x, y] of e.dots) { E(c, x * s, y * s, s * .03, s * .03); fs(c, e.dotC, lw * .5); }
  }
});
def('hay', {
  k: .95, box: [-.5, -.7, .55, 0], msg: ['Heu! Die Kuh wäre begeistert.', 'Ein Heuballen. Kuhfutter, keine Kuh.'],
  draw(c, e) {
    const s = e.s, lw = e.lw;
    RR(c, -s * .48, -s * .66, s * .72, s * .66, s * .14); fs(c, '#e9c46a', lw);
    c.strokeStyle = 'rgba(160,110,30,.5)'; c.lineWidth = Math.max(1, lw * .6);
    for (let i = 1; i < 5; i++) { c.beginPath(); c.moveTo(-s * .44, -s * .66 * i / 5); c.lineTo(s * .1, -s * .66 * i / 5); c.stroke(); }
    E(c, s * .22, -s * .33, s * .3, s * .33); fs(c, '#f2d27f', lw);
    c.beginPath(); for (let a = 0; a < TAU * 2.5; a += .3) { const r = s * .025 * a; c.lineTo(s * .22 + Math.cos(a) * r * .9, -s * .33 + Math.sin(a) * r); }
    c.lineWidth = Math.max(1, lw * .7); c.strokeStyle = '#b58e2e'; c.stroke();
  }
});
def('fence', {
  k: 1.5, box: [-.5, -.48, .5, 0], msg: ['Ein Zaun. Hält Kühe auf, aber keine Klicks.', 'Zaun. Dahinter? Nein.'],
  draw(c, e) {
    const s = e.s, lw = e.lw, col = '#c79358';
    for (const y of [-.36, -.2]) { RR(c, -s * .5, y * s, s, s * .06, s * .02); fs(c, col, lw); }
    for (const x of [-.44, 0, .44]) { c.beginPath(); c.moveTo(x * s - s * .04, 0); c.lineTo(x * s - s * .04, -s * .42); c.lineTo(x * s, -s * .47); c.lineTo(x * s + s * .04, -s * .42); c.lineTo(x * s + s * .04, 0); c.closePath(); fs(c, shade(col, -.08), lw); }
  }
});
def('tractor', {
  k: 1.6, box: [-.5, -.85, .56, 0], snd: 'brum', msg: ['Ein Traktor. Brumm brumm.', 'Traktor. Hat eine Kuh als Hupe, aber ist keine.'],
  init(e) { e.col = pick(['#e63946', '#2a9d8f', '#3d6fb5']); },
  draw(c, e, t) {
    const s = e.s, lw = e.lw;
    for (let i = 0; i < 3; i++) { const k = ((t * .7 + e.ph + i / 3) % 1); E(c, s * (.32 - k * .1), -s * (.72 + k * .3), s * (.04 + k * .05), s * (.04 + k * .05)); c.fillStyle = `rgba(200,200,210,${.7 * (1 - k)})`; c.fill(); }
    RR(c, s * .29, -s * .72, s * .04, s * .3, s * .02); fs(c, INK, null);
    RR(c, -s * .42, -s * .82, s * .36, s * .44, s * .04); fs(c, e.col, lw);
    RR(c, -s * .36, -s * .76, s * .24, s * .2, s * .03); fs(c, '#cfeeff', lw * .7);
    RR(c, -s * .46, -s * .86, s * .44, s * .06, s * .03); fs(c, INK, null);
    RR(c, -s * .1, -s * .44, s * .58, s * .26, s * .07); fs(c, e.col, lw);
    for (const [x, y, r] of [[-.22, -.24, .24], [.34, -.13, .13]]) { E(c, x * s, y * s, r * s, r * s); fs(c, '#2d2a36', lw); E(c, x * s, y * s, r * s * .5, r * s * .5); fs(c, GOLD, lw * .7); }
  }
});
