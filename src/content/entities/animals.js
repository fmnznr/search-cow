// Lookalikes on four legs: dalmatian, pig, sheep, horse, goat.
import { R, RI, pick, rnd } from '../../core/rng.js';
import { TAU } from '../../core/util.js';
import { E, INK, MILK, RR, circles, eye, fs, mkSpots, shade, stroke2 } from '../../render/draw.js';
import { TYPES, def, quad } from './rig.js';

function dogHead(c, e, t, hx, hy) {
  const s = e.s, lw = e.lw;
  c.save(); c.translate(hx - s * .06, hy + s * .02); c.rotate(-.12 + Math.sin(t * 2 + e.ph) * .06);
  RR(c, s * .1, -s * .12, s * .2, s * .1, s * .05); fs(c, e.col, lw);
  E(c, s * .08, -s * .14, s * .12, s * .11); fs(c, e.col, lw);
  E(c, s * .03, -s * .19, s * .025, s * .025); c.fillStyle = e.spotC; c.fill(); E(c, s * .15, -s * .085, s * .018, s * .018); c.fill();
  E(c, s * .3, -s * .11, s * .03, s * .026); c.fillStyle = INK; c.fill();
  c.save(); c.translate(s * .03, -s * .22); c.rotate(.35 + Math.sin(t * 3 + e.ph) * .12); E(c, -s * .01, s * .08, s * .045, s * .085); fs(c, e.earC, lw); c.restore();
  eye(c, s * .12, -s * .17, s * .024, t, e);
  if (e.acc === 'helmet') { E(c, s * .12, -s * .12, s * .25, s * .22); c.fillStyle = 'rgba(190,235,255,.3)'; c.fill(); c.lineWidth = lw; c.strokeStyle = INK; c.stroke(); c.beginPath(); c.arc(s * .12, -s * .12, s * .18, -2.7, -1.9); c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = Math.max(1.5, lw); c.stroke(); }
  c.restore();
}
function dogTail(c, e, t, L, by, BH) {
  const s = e.s; c.save(); c.translate(-L / 2 + s * .03, by + BH * .2); c.rotate(-.6 + Math.sin(t * 9 + e.ph) * .3);
  c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-s * .12, -s * .02, -s * .18, -s * .14); stroke2(c, e.lw * 1.1, e.col, e.lw * .8);
  c.restore();
}
function dogOver(c, e, t, L, BH, by) {
  if (e.acc !== 'sweater') return;
  c.save(); RR(c, -L / 2, by, L, BH, BH * .48); c.clip();
  c.fillStyle = e.sweater; c.fillRect(-L * .3, by - 2, L, BH + 4);
  c.fillStyle = MILK; for (const k of [.3, .62]) c.fillRect(-L * .3, by + BH * k, L, BH * .1);
  c.restore();
  RR(c, -L / 2, by, L, BH, BH * .48); c.lineWidth = e.lw; c.strokeStyle = INK; c.stroke();
}
const DALMA = { bl: .85, bh: .32, lg: .38, lw: .075, head: dogHead, tail: dogTail, over: dogOver };
const dogInit = (e, sc) => {
  e.col = MILK; e.spotC = INK; e.earC = INK; e.spots = mkSpots(RI(12, 18), .035, .06, .15);
  e.acc = sc.world === 'winter' ? 'sweater' : (e.float ? 'helmet' : null); e.sweater = pick(['#e63946', '#3d6fb5', '#2a9d8f']);
};
def('dalma', {
  k: 1.05, box: [-.5, -.9, .72, 0], walk: true, snd: 'woof', oy: .5, rotR: .4,
  msg: ['Ein Dalmatiner! Flecken ja, Kuh nein.', 'Wuff! Das ist ein Hund.', 'Knapp! Aber Hunde geben keine Milch.', 'Ein Dalmatiner. 101 Flecken, 0 Kühe.'],
  init: dogInit, draw(c, e, t) { quad(c, e, t, DALMA); }
});
def('laika', Object.assign({}, TYPES.dalma, { msg: ['Das ist Laika. Ist schon länger hier oben.', 'Ein Weltraumhund. Wuff im All.'] }));

/* ---------- pig ---------- */
function pigHead(c, e, t, hx, hy) {
  const s = e.s, lw = e.lw;
  c.save(); c.translate(hx - s * .08, hy + s * .2 + (e.graze ? s * .08 : 0)); c.rotate(Math.sin(t * 1.6 + e.ph) * .06 + (e.graze ? .3 : 0));
  c.beginPath(); c.moveTo(0, -s * .15); c.lineTo(s * .1, -s * .32); c.lineTo(s * .15, -s * .14); c.closePath(); fs(c, shade(e.col, -.08), lw);
  E(c, s * .08, -s * .03, s * .19, s * .18); fs(c, e.col, lw);
  E(c, s * .26, 0, s * .055, s * .075); fs(c, shade(e.col, -.12), lw);
  E(c, s * .265, -s * .022, s * .012, s * .02); c.fillStyle = INK; c.fill(); E(c, s * .265, s * .025, s * .012, s * .02); c.fill();
  eye(c, s * .14, -s * .08, s * .024, t, e);
  E(c, s * .16, s * .05, s * .035, s * .02); c.fillStyle = 'rgba(240,90,120,.35)'; c.fill();
  c.beginPath(); c.moveTo(s * .06, -s * .15); c.lineTo(s * .2, -s * .3); c.lineTo(s * .2, -s * .12); c.closePath(); fs(c, e.col, lw);
  c.restore();
}
function pigTail(c, e, t, L, by, BH) {
  const s = e.s; c.save(); c.translate(-L / 2 - s * .02, by + BH * .3); c.rotate(Math.sin(t * 4 + e.ph) * .3);
  c.beginPath(); c.arc(-s * .04, 0, s * .04, -.3, TAU * .8); c.lineWidth = Math.max(1, e.lw * 1.1); c.strokeStyle = INK; c.stroke(); c.restore();
}
const PIG = { bl: .85, bh: .5, lg: .17, lw: .12, hoof: '#c86a82', head: pigHead, tail: pigTail };
def('pig', {
  k: .95, box: [-.5, -.84, .68, 0], walk: true, snd: 'oink',
  msg: ['Oink! Ein Schwein.', 'Schwein gehabt? Leider nein.', 'Rosa, rund, keine Kuh.'],
  init(e) { e.col = pick(['#ffb6c6', '#f8a5b8', '#ffc4cf', '#e9a48f']); e.graze = rnd() < .3; e.spots = rnd() < .2 ? mkSpots(3, .1, .16) : null; e.spotC = '#c97a6a'; },
  draw(c, e, t) { quad(c, e, t, PIG); }
});

/* ---------- sheep ---------- */
function woolBody(c, e, t, L, BH, by) {
  const cy = by + BH / 2, s = e.s;
  c.beginPath(); for (const p of e.puffs) { const x = Math.cos(p.a) * L * .42, y = cy + Math.sin(p.a) * BH * .42; c.moveTo(x + p.r * s, y); c.arc(x, y, p.r * s, 0, TAU); }
  c.lineWidth = e.lw; c.strokeStyle = INK; c.stroke(); c.fillStyle = e.col; c.fill();
  E(c, 0, cy, L * .45, BH * .45); c.fill();
  c.fillStyle = 'rgba(255,255,255,.35)'; E(c, -L * .12, cy - BH * .18, L * .18, BH * .12); c.fill();
}
function sheepHead(c, e, t, hx, hy) {
  const s = e.s, lw = e.lw;
  c.save(); c.translate(hx - s * .02, hy + s * .1 + (e.graze ? s * .16 : 0)); c.rotate((e.graze ? .5 : -.1) + Math.sin(t * 1.5 + e.ph) * .05);
  E(c, -s * .01, -s * .03, s * .08, s * .033, -.5 + Math.sin(t * 2 + e.ph) * .2); fs(c, e.face, lw);
  E(c, s * .1, 0, s * .12, s * .085, .4); fs(c, e.face, lw);
  circles(c, [[.03, -.1, .045], [.08, -.12, .045], [.0, -.06, .04]], s, e.col, lw);
  E(c, s * .12, -s * .03, s * .025, s * .025); fs(c, '#fff', null); E(c, s * .125, -s * .03, s * .013, s * .015); c.fillStyle = INK; c.fill();
  c.restore();
}
const SHEEP = { bl: .8, bh: .48, lg: .24, lw: .075, legC: '#3a3340', hoof: INK, body: woolBody, head: sheepHead };
def('sheep', {
  k: 1, box: [-.5, -.84, .62, 0], walk: true, snd: 'baa',
  msg: e => e.black ? 'Das schwarze Schaf der Familie. Keine Kuh.' : pick(['Mäh! Das ist ein Schaf.', 'Ein Schaf. Flauschig, aber falsch.', 'Schaf. Zählt nur beim Einschlafen.']),
  init(e) {
    const r = rnd(); e.black = r < .07; e.col = e.black ? '#4a4252' : r < .14 ? '#ddd5c8' : '#fbf8f2';
    e.face = e.black ? '#211b26' : pick(['#3a3340', '#3a3340', '#f2d9c4']); e.graze = rnd() < .3;
    e.puffs = []; for (let i = 0; i < 11; i++) e.puffs.push({ a: i / 11 * TAU + R(-.15, .15), r: R(.11, .145) });
  },
  draw(c, e, t) { quad(c, e, t, SHEEP); }
});

/* ---------- horse ---------- */
function horseHead(c, e, t, hx, hy) {
  const s = e.s, lw = e.lw;
  c.save(); c.translate(hx - s * .14, hy + s * .08 + (e.graze ? s * .2 : 0)); c.rotate((e.graze ? 1.0 : 0) + Math.sin(t * 1.2 + e.ph) * .04);
  c.beginPath(); c.moveTo(-s * .04, s * .16); c.lineTo(s * .06, -s * .34); c.quadraticCurveTo(s * .16, -s * .41, s * .24, -s * .3); c.lineTo(s * .24, s * .18); c.closePath(); fs(c, e.col, lw);
  c.beginPath(); c.moveTo(-s * .01, s * .1); c.lineTo(s * .075, -s * .35); stroke2(c, s * .06, e.mane, lw * .8);
  c.beginPath(); c.moveTo(s * .12, -s * .37); c.lineTo(s * .1, -s * .5); c.lineTo(s * .18, -s * .4); c.closePath(); fs(c, e.col, lw);
  c.save(); c.translate(s * .17, -s * .34); c.rotate(-.95);
  RR(c, -s * .075, -s * .03, s * .15, s * .35, s * .07); fs(c, e.col, lw);
  if (e.blaze) { RR(c, s * .02, s * .02, s * .035, s * .26, s * .017); c.fillStyle = MILK; c.fill(); }
  E(c, -s * .035, s * .27, s * .016, s * .024); c.fillStyle = INK; c.fill();
  eye(c, s * .035, s * .06, s * .024, t, e);
  c.restore();
  c.restore();
}
function horseTail(c, e, t, L, by, BH) {
  const s = e.s; c.save(); c.translate(-L / 2 + s * .03, by + BH * .12); c.rotate(.1 + Math.sin(t * 1.8 + e.ph) * .15);
  c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-s * .2, s * .12, -s * .12, s * .5); stroke2(c, s * .07, e.mane, e.lw * .8);
  c.restore();
}
const HORSE = { bl: 1.05, bh: .4, lg: .55, lw: .1, hoof: INK, head: horseHead, tail: horseTail };
def('horse', {
  k: 1.4, box: [-.65, -1.42, .95, 0], walk: true, snd: 'neigh',
  msg: ['Ein Pferd. Wieher!', 'Pferd. Größer, schneller, keine Kuh.', 'Ein Pony. Möchte auch gefunden werden.'],
  init(e) { e.col = pick(['#a0522d', '#7b4a2e', '#d9b38c', '#4a3b35', '#efe7dc']); e.mane = e.col === '#efe7dc' || e.col === '#d9b38c' ? '#6b4f3a' : '#2b1d14'; e.graze = rnd() < .25; e.blaze = rnd() < .5; },
  draw(c, e, t) { quad(c, e, t, HORSE); }
});

/* ---------- goat ---------- */
function goatHead(c, e, t, hx, hy) {
  const s = e.s, lw = e.lw;
  c.save(); c.translate(hx - s * .05, hy + s * .04 + (e.graze ? s * .2 : 0)); c.rotate((e.graze ? .7 : -.15) + Math.sin(t * 1.7 + e.ph) * .05);
  c.beginPath(); c.moveTo(s * .04, -s * .1); c.quadraticCurveTo(-s * .04, -s * .3, -s * .13, -s * .2); stroke2(c, s * .035, '#c8b48a', lw * .8);
  E(c, -s * .02, -s * .05, s * .07, s * .028, .4); fs(c, e.col, lw);
  c.save(); c.translate(s * .06, -s * .1); c.rotate(-.6);
  c.beginPath(); c.moveTo(-s * .05, s * .14); c.lineTo(-s * .12, s * .24); c.lineTo(-s * .03, s * .22); c.closePath(); fs(c, shade(e.col, -.25), lw * .8);
  RR(c, -s * .06, -s * .04, s * .12, s * .26, s * .06); fs(c, e.col, lw);
  E(c, s * .02, s * .04, s * .025, s * .022); fs(c, '#f6e7a6', lw * .5); RR(c, 0, s * .033, s * .04, s * .013, s * .006); c.fillStyle = INK; c.fill();
  E(c, -s * .02, s * .2, s * .012, s * .016); c.fill();
  c.restore(); c.restore();
}
function goatTail(c, e, t, L, by) {
  const s = e.s; c.save(); c.translate(-L / 2 + s * .02, by + s * .04); c.rotate(-.4 + Math.sin(t * 6 + e.ph) * .2);
  c.beginPath(); c.moveTo(0, 0); c.lineTo(-s * .08, -s * .07); c.lineTo(-s * .02, s * .02); c.closePath(); fs(c, e.col, e.lw * .8); c.restore();
}
const GOAT = { bl: .72, bh: .36, lg: .33, lw: .075, hoof: INK, head: goatHead, tail: goatTail };
def('goat', {
  k: .95, box: [-.45, -.95, .62, 0], walk: true, snd: 'goat',
  msg: ['Meck! Eine Ziege.', 'Ziege. Auch Hörner, auch Milch, trotzdem falsch.'],
  init(e) { e.col = pick(['#f4efe6', '#d8b48a', '#8a6b52', '#efe2cf']); e.graze = rnd() < .3; },
  draw(c, e, t) { quad(c, e, t, GOAT); }
});
