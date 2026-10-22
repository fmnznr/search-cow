import { pick } from '../../core/rng.js';
import { E, INK, MILK, circles, eye, fs, shade, stroke2 } from '../../render/draw.js';
import { def } from './rig.js';

/* ---------- small creatures ---------- */
def('chicken', {
  k: .55, box: [-.42, -.92, .46, 0], walk: true, snd: 'cluck',
  msg: ['Gack! Ein Huhn.', 'Ein Huhn. Legt Eier, keine Milch.'],
  init(e) { e.col = pick([MILK, '#c96a32', '#f3e2c2']); },
  draw(c, e, t) {
    const s = e.s, lw = e.lw, peck = ((t + e.ph) % 3.2) < .35;
    c.lineCap = 'round'; c.strokeStyle = '#e8972b'; c.lineWidth = Math.max(1, s * .045);
    for (const dx of [-.06, .06]) { const sw = e.moving ? Math.sin(e.wp + dx * 40) * s * .05 : 0; c.beginPath(); c.moveTo(dx * s, -s * .27); c.lineTo(dx * s + sw, 0); c.lineTo(dx * s + sw + s * .06, 0); c.stroke(); }
    for (let i = 0; i < 3; i++) { E(c, -s * .28, -s * .6 + i * s * .07, s * .1, s * .045, -.6 + i * .3); fs(c, i === 1 ? shade(e.col.length === 7 ? e.col : '#ffffff', -.15) : e.col, lw); }
    E(c, 0, -s * .44, s * .3, s * .22); fs(c, e.col, lw);
    E(c, -s * .04, -s * .45, s * .14, s * .085, .2); fs(c, shade(e.col === MILK ? '#fffdf8' : e.col, -.08), lw * .7);
    c.save(); if (peck) { c.translate(s * .22, -s * .5); c.rotate(1.1); c.translate(-s * .22, s * .5); }
    circles(c, [[.2, -.86, .04], [.25, -.88, .045], [.3, -.86, .04]], s, '#e63946', lw * .7);
    E(c, s * .24, -s * .72, s * .12, s * .12); fs(c, e.col, lw);
    c.beginPath(); c.moveTo(s * .34, -s * .76); c.lineTo(s * .44, -s * .72); c.lineTo(s * .34, -s * .68); c.closePath(); fs(c, '#ffc21a', lw * .7);
    E(c, s * .32, -s * .62, s * .025, s * .045); fs(c, '#e63946', lw * .6);
    eye(c, s * .26, -s * .75, s * .025, t, e);
    c.restore();
  }
});
def('penguin', {
  k: .72, box: [-.34, -.96, .34, 0], walk: true, snd: 'honk',
  msg: ['Ein Pinguin. Schwarz-weiß, aber falsch.', 'Pinguin! Farblich nah dran.'],
  draw(c, e, t) {
    const s = e.s, lw = e.lw; c.rotate(Math.sin(t * 3 + e.ph) * (e.moving ? .14 : .05));
    for (const d of [-1, 1]) { E(c, d * s * .1, -s * .02, s * .09, s * .035); fs(c, '#ff9f1c', lw); }
    E(c, 0, -s * .46, s * .27, s * .45); fs(c, '#2d2a36', lw);
    for (const d of [-1, 1]) { E(c, d * s * .26, -s * .48, s * .06, s * .2, d * .3); fs(c, '#2d2a36', lw); }
    E(c, 0, -s * .38, s * .18, s * .33); fs(c, MILK, null);
    for (const d of [-1, 1]) { E(c, d * s * .07, -s * .74, s * .045, s * .05); fs(c, '#fff', null); E(c, d * s * .065, -s * .73, s * .022, s * .028); c.fillStyle = INK; c.fill(); }
    c.beginPath(); c.moveTo(-s * .05, -s * .66); c.lineTo(s * .05, -s * .66); c.lineTo(0, -s * .58); c.closePath(); fs(c, '#ff9f1c', lw * .7);
  }
});
def('pigeon', {
  k: .42, box: [-.45, -.85, .5, 0], walk: true, snd: 'coo',
  msg: ['Eine Taube. Gurr.', 'Taube. Will deine Pommes.'],
  draw(c, e, t) {
    const s = e.s, lw = e.lw, peck = ((t + e.ph) % 2.4) < .3;
    c.strokeStyle = '#e5738f'; c.lineWidth = Math.max(1, s * .05); c.beginPath(); c.moveTo(-s * .04, -s * .22); c.lineTo(-s * .04, 0); c.moveTo(s * .06, -s * .22); c.lineTo(s * .06, 0); c.stroke();
    c.beginPath(); c.moveTo(-s * .25, -s * .45); c.lineTo(-s * .48, -s * .55); c.lineTo(-s * .45, -s * .38); c.closePath(); fs(c, '#6f788c', lw);
    E(c, 0, -s * .4, s * .3, s * .2); fs(c, '#a3abbd', lw);
    E(c, -s * .06, -s * .42, s * .18, s * .1, .2); fs(c, '#8c94a8', lw * .7);
    const hx = peck ? s * .34 : s * .24, hy = peck ? -s * .3 : -s * .66;
    E(c, s * .18, -s * .5, s * .09, s * .1); fs(c, '#5fbf9a', null);
    E(c, hx, hy, s * .11, s * .1); fs(c, '#8c94a8', lw);
    c.beginPath(); c.moveTo(hx + s * .1, hy - s * .02); c.lineTo(hx + s * .19, hy + s * .02); c.lineTo(hx + s * .1, hy + s * .03); c.closePath(); fs(c, '#d9a46b', lw * .6);
    E(c, hx + s * .03, hy - s * .02, s * .025, s * .025); fs(c, '#ff9f1c', null); E(c, hx + s * .03, hy - s * .02, s * .012, s * .012); c.fillStyle = INK; c.fill();
  }
});
def('crab', {
  k: .6, box: [-.55, -.62, .55, 0], snd: 'click', side: true,
  msg: ['Eine Krabbe. Zwick!', 'Krabbe. Läuft seitwärts davon.'],
  draw(c, e, t) {
    const s = e.s, lw = e.lw, col = '#ff5d4a';
    c.lineCap = 'round';
    for (const d of [-1, 1]) for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(d * s * .2, -s * .18 + i * s * .04); c.lineTo(d * s * (.38 + i * .03), -s * .05 + Math.sin(t * 8 + i + d) * s * .03); c.lineTo(d * s * (.42 + i * .03), 0); stroke2(c, Math.max(1, s * .035), col, lw * .6); }
    const snap = Math.sin(t * 5 + e.ph) * .25;
    for (const d of [-1, 1]) {
      c.beginPath(); c.moveTo(d * s * .22, -s * .25); c.lineTo(d * s * .36, -s * .42); stroke2(c, Math.max(1, s * .05), col, lw * .6);
      c.save(); c.translate(d * s * .4, -s * .5); c.rotate(d * snap);
      E(c, 0, 0, s * .1, s * .085); fs(c, col, lw);
      c.beginPath(); c.moveTo(0, -s * .09); c.lineTo(d * s * .02, -s * .01); c.lineWidth = lw; c.strokeStyle = INK; c.stroke();
      c.restore();
    }
    for (const d of [-1, 1]) { c.beginPath(); c.moveTo(d * s * .07, -s * .32); c.lineTo(d * s * .09, -s * .46); c.lineWidth = Math.max(1, lw); c.strokeStyle = INK; c.stroke(); E(c, d * s * .09, -s * .48, s * .045, s * .045); fs(c, '#fff', lw * .7); E(c, d * s * .09, -s * .48, s * .02, s * .02); c.fillStyle = INK; c.fill(); }
    E(c, 0, -s * .22, s * .3, s * .17); fs(c, col, lw);
    c.beginPath(); c.arc(0, -s * .2, s * .07, .3, Math.PI - .3); c.lineWidth = Math.max(1, lw * .7); c.strokeStyle = INK; c.stroke();
  }
});
