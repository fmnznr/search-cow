// Underwater creatures and props.
import { R, RI, pick, rnd } from '../../core/rng.js';
import { TAU } from '../../core/util.js';
import { E, GOLD, INK, MILK, RR, eye, fs, stroke2 } from '../../render/draw.js';
import { def } from './rig.js';

def('fish', {
  k: .7, box: [-.62, -.42, .45, .3], snd: 'blub', swim: true, rotR: .1,
  msg: ['Blubb. Ein Fisch.', 'Ein Fisch. Kein Rind.', 'Fisch. Schwimmt einfach weiter.'],
  init(e) { const [a, b] = pick([['#ff8a3d', MILK], ['#4dabf7', '#ffd43b'], ['#f783ac', '#845ef7'], ['#69db7c', '#2b8a3e'], ['#ffd43b', '#4dabf7'], ['#b197fc', '#ffe066']]); e.c1 = a; e.c2 = b; e.stripes = rnd() < .6; },
  draw(c, e, t) {
    const s = e.s, lw = e.lw, wag = Math.sin(t * 6 + e.ph) * .25;
    c.save(); c.translate(-s * .36, 0); c.rotate(wag); c.beginPath(); c.moveTo(s * .04, 0); c.lineTo(-s * .2, -s * .2); c.quadraticCurveTo(-s * .12, 0, -s * .2, s * .2); c.closePath(); fs(c, e.c2, lw); c.restore();
    c.beginPath(); c.moveTo(-s * .15, -s * .2); c.quadraticCurveTo(0, -s * .42, s * .12, -s * .22); c.closePath(); fs(c, e.c2, lw);
    E(c, 0, 0, s * .4, s * .25); c.fillStyle = e.c1; c.fill();
    if (e.stripes) { c.save(); c.clip(); c.fillStyle = e.c2; for (const x of [-.14, .1]) c.fillRect(x * s - s * .04, -s * .3, s * .08, s * .6); c.restore(); }
    E(c, 0, 0, s * .4, s * .25); fs(c, null, lw);
    E(c, s * .22, -s * .05, s * .065, s * .065); fs(c, '#fff', lw * .7); E(c, s * .24, -s * .05, s * .03, s * .03); c.fillStyle = INK; c.fill();
  }
});
def('cowfish', {
  k: .75, box: [-.5, -.4, .45, .28], snd: 'blub', swim: true, rotR: .1,
  msg: ['Ein Kuhfisch! Den gibt es wirklich.', 'Kuhfisch. Der Name passt, der Rest nicht.'],
  init(e) { e.dots = Array.from({ length: 7 }, () => [R(-.25, .2), R(-.15, .15)]); },
  draw(c, e, t) {
    const s = e.s, lw = e.lw;
    c.save(); c.translate(-s * .3, 0); c.rotate(Math.sin(t * 7 + e.ph) * .3); E(c, -s * .08, 0, s * .09, s * .12); fs(c, '#ffb703', lw); c.restore();
    for (const y of [-.2, -.12]) { c.beginPath(); c.moveTo(s * .2, y * s); c.lineTo(s * .38, (y - .14) * s); c.lineTo(s * .27, (y + .02) * s); c.closePath(); fs(c, '#ffd23f', lw * .8); }
    RR(c, -s * .32, -s * .22, s * .62, s * .44, s * .13); c.fillStyle = '#ffd23f'; c.fill();
    c.save(); c.clip(); c.fillStyle = '#3d6fb5'; for (const [x, y] of e.dots) { E(c, x * s, y * s, s * .03, s * .03); c.fill(); } c.restore();
    RR(c, -s * .32, -s * .22, s * .62, s * .44, s * .13); fs(c, null, lw);
    E(c, s * .14, -s * .06, s * .07, s * .07); fs(c, '#fff', lw * .7); E(c, s * .16, -s * .06, s * .033, s * .033); c.fillStyle = INK; c.fill();
    E(c, s * .31, s * .06, s * .04, s * .035); fs(c, '#ff8fab', lw * .7);
  }
});
def('manatee', {
  k: 1.7, box: [-.65, -.32, .62, .3], snd: 'grunt', rotR: .15,
  msg: ['Eine Seekuh! Sooo nah dran.', 'Seekühe sind mit Elefanten verwandt, nicht mit Kühen.', 'Seekuh. Halbe Punktzahl gibt es trotzdem nicht.'],
  draw(c, e, t) {
    const s = e.s, lw = e.lw, col = '#9aa8b5';
    c.save(); c.translate(-s * .42, 0); c.rotate(Math.sin(t * 2 + e.ph) * .2); E(c, -s * .1, 0, s * .13, s * .17); fs(c, col, lw); c.restore();
    E(c, 0, 0, s * .45, s * .24); fs(c, col, lw);
    E(c, s * .38, -s * .02, s * .16, s * .15); fs(c, col, lw);
    E(c, s * .5, s * .05, s * .08, s * .07); fs(c, '#b8c4ce', lw);
    c.fillStyle = INK; for (const [x, y] of [[.5, .03], [.54, .07], [.47, .08]]) { E(c, x * s, y * s, s * .008, s * .008); c.fill(); }
    eye(c, s * .42, -s * .07, s * .018, t, e);
    c.save(); c.translate(s * .14, s * .2); c.rotate(.6 + Math.sin(t * 2.5 + e.ph) * .2); E(c, s * .06, 0, s * .1, s * .045); fs(c, col, lw); c.restore();
    c.strokeStyle = 'rgba(33,27,38,.3)'; c.lineWidth = Math.max(1, lw * .6); for (const x of [-.15, 0]) { c.beginPath(); c.arc(x * s, 0, s * .2, -.4, .4); c.stroke(); }
  }
});
def('jelly', {
  k: .9, box: [-.38, -.38, .38, .68], snd: 'blub', rotR: .15,
  msg: ['Eine Qualle. Nicht anfassen!', 'Qualle. Glibberig, aber keine Kuh.'],
  init(e) { e.c1 = pick(['#ff8fd0', '#b197fc', '#74c0fc', '#ffa8a8']); },
  draw(c, e, t) {
    const s = e.s, lw = e.lw, p = 1 + Math.sin(t * 2.5 + e.ph) * .06;
    c.lineCap = 'round';
    for (let i = 0; i < 5; i++) { const x = (-.2 + i * .1) * s; c.beginPath(); c.moveTo(x, 0); for (let k = 1; k <= 6; k++) c.lineTo(x + Math.sin(t * 3 + e.ph + k + i) * s * .04, k * s * .1); stroke2(c, Math.max(1, lw * .9), e.c1, lw * .5); }
    c.beginPath(); c.ellipse(0, 0, s * .32 * p, s * .34 / p, 0, Math.PI, 0); c.quadraticCurveTo(s * .16, s * .08, 0, s * .03); c.quadraticCurveTo(-s * .16, s * .08, -s * .32 * p, 0); c.closePath(); fs(c, e.c1, lw);
    E(c, -s * .1, -s * .18, s * .07, s * .04, -.4); c.fillStyle = 'rgba(255,255,255,.6)'; c.fill();
    for (const d of [-1, 1]) { E(c, d * s * .08, -s * .07, s * .02, s * .025); c.fillStyle = INK; c.fill(); }
  }
});
def('coral', {
  k: 1.2, box: [-.5, -1, .5, 0], floor: true, msg: ['Eine Koralle.', 'Koralle. Steht hier seit 300 Jahren.'],
  init(e) {
    e.col = pick(['#ff7b9c', '#ff9f68', '#c77dff', '#ffd166']); e.seg = [];
    const grow = (x, y, a, len, w, d) => { const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len; e.seg.push([x, y, x2, y2, w]); if (d > 0) { const n = RI(2, 3); for (let i = 0; i < n; i++) grow(x2, y2, a + R(-.7, .7), len * R(.6, .8), w * .75, d - 1); } };
    grow(0, 0, -Math.PI / 2, .34, .1, 3);
  },
  draw(c, e) {
    const s = e.s, lw = e.lw; c.lineCap = 'round';
    c.strokeStyle = INK; for (const [x, y, x2, y2, w] of e.seg) { c.beginPath(); c.moveTo(x * s, y * s); c.lineTo(x2 * s, y2 * s); c.lineWidth = w * s + lw * 2; c.stroke(); }
    c.strokeStyle = e.col; for (const [x, y, x2, y2, w] of e.seg) { c.beginPath(); c.moveTo(x * s, y * s); c.lineTo(x2 * s, y2 * s); c.lineWidth = w * s; c.stroke(); }
  }
});
def('weed', {
  k: 1.6, box: [-.28, -1, .28, 0], floor: true, msg: ['Seetang.', 'Seegras. Schmeckt Kühen nicht.'],
  init(e) { e.col = pick(['#38b26b', '#2f9e5b', '#5fc77f']); },
  draw(c, e, t) {
    const s = e.s, lw = e.lw; c.lineCap = 'round';
    for (let i = 0; i < 3; i++) { const x0 = (-.12 + i * .12) * s, h = (.7 + i % 2 * .25) * s; c.beginPath(); c.moveTo(x0, 0); for (let k = 1; k <= 8; k++) c.lineTo(x0 + Math.sin(t * 1.5 + e.ph + k * .7 + i) * s * .06 * k / 8, -h * k / 8); stroke2(c, Math.max(1.5, s * .06), e.col, lw * .7); }
  }
});
def('octo', {
  k: .95, box: [-.45, -.45, .45, .55], snd: 'blub', rotR: .2,
  msg: ['Ein Krake. Acht Arme, null Kuh.', 'Krake. Winkt mit allen Armen.'],
  init(e) { e.col = pick(['#c55bd6', '#ff8c42', '#ff6b8b']); },
  draw(c, e, t) {
    const s = e.s, lw = e.lw; c.lineCap = 'round';
    for (let i = 0; i < 6; i++) { const x = (-.22 + i * .088) * s; c.beginPath(); c.moveTo(x, 0); c.quadraticCurveTo(x + Math.sin(t * 2 + i + e.ph) * s * .15, s * .3, x + (i < 3 ? -1 : 1) * s * .1, s * .45 + Math.cos(t * 2 + i) * s * .04); stroke2(c, Math.max(1.5, s * .08), e.col, lw); }
    E(c, 0, -s * .14, s * .28, s * .3); fs(c, e.col, lw);
    c.fillStyle = 'rgba(255,255,255,.25)'; for (const [x, y] of [[-.12, -.3], [.1, -.32], [0, -.22]]) { E(c, x * s, y * s, s * .03, s * .03); c.fill(); }
    for (const d of [-1, 1]) { E(c, d * s * .1, -s * .1, s * .06, s * .065); fs(c, '#fff', lw * .7); E(c, d * s * .1, -s * .09, s * .03, s * .035); c.fillStyle = INK; c.fill(); }
  }
});
def('turtle', {
  k: 1, box: [-.55, -.36, .62, .35], snd: 'blub', swim: true, rotR: .2,
  msg: ['Eine Schildkröte. Gemächlich, aber nein.', 'Schildkröte. Ist 80 Jahre alt und auch keine Kuh.'],
  draw(c, e, t) {
    const s = e.s, lw = e.lw, pd = Math.sin(t * 3 + e.ph) * .4;
    for (const [x, y, a] of [[.18, .16, .5 + pd], [-.22, .16, -.5 - pd], [.18, -.16, -.5 - pd]]) { c.save(); c.translate(x * s, y * s); c.rotate(a); E(c, x > 0 ? s * .1 : -s * .1, 0, s * .13, s * .05); fs(c, '#9fd18b', lw); c.restore(); }
    E(c, s * .42, 0, s * .12, s * .09); fs(c, '#9fd18b', lw); eye(c, s * .46, -s * .02, s * .02, t, e);
    E(c, 0, 0, s * .36, s * .26); fs(c, '#4a9a5c', lw);
    c.strokeStyle = '#2f7a46'; c.lineWidth = Math.max(1, lw * .7);
    for (const [x, y] of [[0, 0], [-.18, -.08], [.18, -.08], [-.16, .1], [.16, .1]]) { c.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; c.lineTo(x * s + Math.cos(a) * s * .08, y * s + Math.sin(a) * s * .07); } c.closePath(); c.stroke(); }
  }
});
def('chest', {
  k: .9, box: [-.45, -.64, .45, 0], floor: true, msg: ['Ein Schatz! Leider keine Kuh drin.', 'Schatztruhe. Inhalt: Gold. Nicht Kuh.'],
  draw(c, e, t) {
    const s = e.s, lw = e.lw;
    c.beginPath(); c.moveTo(-s * .42, -s * .38); c.quadraticCurveTo(0, -s * .72, s * .42, -s * .38); c.closePath(); fs(c, '#b5743f', lw);
    for (let i = 0; i < 3; i++) { E(c, (-.15 + i * .15) * s, -s * .4, s * .07, s * .04); fs(c, GOLD, lw * .6); }
    RR(c, -s * .42, -s * .38, s * .84, s * .38, s * .04); fs(c, '#a0663a', lw);
    for (const x of [-.26, .22]) { RR(c, x * s, -s * .38, s * .06, s * .38, s * .01); fs(c, GOLD, lw * .6); }
    RR(c, -s * .05, -s * .3, s * .1, s * .1, s * .02); fs(c, GOLD, lw * .7);
    if (((t + e.ph) % 2.5) < .25) { c.fillStyle = '#fff'; E(c, s * .1, -s * .5, s * .03, s * .03); c.fill(); }
  }
});
