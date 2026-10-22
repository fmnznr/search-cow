// Winter figures and props.
import { pick } from '../../core/rng.js';
import { E, INK, MILK, RR, fs, stroke2 } from '../../render/draw.js';
import { def } from './rig.js';

def('pine', {
  k: 2.0, box: [-.32, -1.02, .32, 0], msg: ['Eine Tanne. Oh Tannenbaum.', 'Tanne. Riecht gut, muht nicht.'],
  init(e, sc) { e.snow = sc.world === 'winter'; e.c1 = pick(['#2f8f5b', '#3aa56a', '#277a4e']); },
  draw(c, e, t) {
    const s = e.s, lw = e.lw;
    RR(c, -s * .05, -s * .2, s * .1, s * .2, s * .02); fs(c, '#7a4a2a', lw);
    c.save(); c.translate(Math.sin(t * .7 + e.ph) * s * .006, 0);
    for (const [y0, h, w] of [[-.16, .42, .3], [-.42, .38, .24], [-.66, .36, .17]]) {
      c.beginPath(); c.moveTo(-w * s, y0 * s); c.lineTo(0, (y0 - h) * s); c.lineTo(w * s, y0 * s); c.closePath(); fs(c, e.c1, lw);
      if (e.snow) { c.beginPath(); c.moveTo(-w * s * .45, (y0 - h * .55) * s); c.lineTo(0, (y0 - h) * s); c.lineTo(w * s * .45, (y0 - h * .55) * s); c.quadraticCurveTo(w * s * .2, (y0 - h * .45) * s, 0, (y0 - h * .52) * s); c.quadraticCurveTo(-w * s * .2, (y0 - h * .45) * s, -w * s * .45, (y0 - h * .55) * s); c.closePath(); fs(c, MILK, lw * .7); }
    }
    c.restore();
  }
});
def('snowman', {
  k: 1.3, box: [-.34, -1.04, .34, 0], msg: ['Ein Schneemann.', 'Schneemann. Kalt, keine Kuh.', 'Der Schneemann hat auch keine Kuh gesehen.'],
  init(e) { e.scarf = pick(['#e63946', '#3d6fb5', '#2a9d8f']); },
  draw(c, e, t) {
    const s = e.s, lw = e.lw;
    for (const d of [-1, 1]) { c.beginPath(); c.moveTo(d * s * .12, -s * .55); c.lineTo(d * s * .32, -s * (.7 + (d > 0 ? Math.sin(t * 3 + e.ph) * .05 : 0))); c.lineWidth = Math.max(1, s * .025); c.strokeStyle = '#7a4a2a'; c.stroke(); }
    for (const [y, r] of [[-.2, .2], [-.52, .15], [-.76, .11]]) { E(c, 0, y * s, r * s, r * s); fs(c, MILK, lw); }
    RR(c, -s * .13, -s * .67, s * .26, s * .05, s * .02); fs(c, e.scarf, lw * .8);
    for (const y of [-.47, -.37, -.27]) { E(c, 0, y * s, s * .015, s * .015); c.fillStyle = INK; c.fill(); }
    for (const d of [-1, 1]) { E(c, d * s * .04, -s * .79, s * .015, s * .015); c.fill(); }
    c.beginPath(); c.moveTo(0, -s * .76); c.lineTo(s * .15, -s * .74); c.lineTo(0, -s * .72); c.closePath(); fs(c, '#ff8c42', lw * .6);
    RR(c, -s * .12, -s * .89, s * .24, s * .03, s * .01); fs(c, INK, null); RR(c, -s * .08, -s * 1.02, s * .16, s * .14, s * .02); fs(c, INK, null);
  }
});
def('igloo', {
  k: 1.6, box: [-.5, -.52, .5, 0], msg: ['Ein Iglu. Drinnen ist es gemütlich.', 'Iglu. Kühe wohnen in Ställen.'],
  draw(c, e) {
    const s = e.s, lw = e.lw;
    c.beginPath(); c.ellipse(0, 0, s * .5, s * .5, 0, Math.PI, 0); c.closePath(); c.fillStyle = '#f4f9ff'; c.fill();
    c.save(); c.clip(); c.strokeStyle = '#bcd6ea'; c.lineWidth = Math.max(1, lw * .7);
    for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(-s * .5, -s * .13 * i); c.lineTo(s * .5, -s * .13 * i); c.stroke(); for (let j = -3; j < 4; j++) { c.beginPath(); const x = (j + (i % 2) * .5) * s * .16; c.moveTo(x, -s * .13 * i); c.lineTo(x, -s * .13 * (i - 1)); c.stroke(); } }
    c.restore();
    c.beginPath(); c.ellipse(0, 0, s * .5, s * .5, 0, Math.PI, 0); c.closePath(); fs(c, null, lw);
    c.beginPath(); c.ellipse(s * .22, 0, s * .16, s * .2, 0, Math.PI, 0); c.closePath(); fs(c, '#f4f9ff', lw);
    c.beginPath(); c.ellipse(s * .22, 0, s * .09, s * .13, 0, Math.PI, 0); c.closePath(); fs(c, '#2b3a55', null);
  }
});
def('sled', {
  k: .9, box: [-.5, -.35, .55, 0], msg: ['Ein Schlitten.', 'Schlitten. Ohne Kuh drauf.'],
  draw(c, e) {
    const s = e.s, lw = e.lw;
    c.beginPath(); c.moveTo(-s * .45, -s * .02); c.lineTo(s * .4, -s * .02); c.quadraticCurveTo(s * .55, -s * .02, s * .5, -s * .18); stroke2(c, Math.max(1.5, s * .03), '#38475e', lw * .6);
    for (const x of [-.3, .25]) { RR(c, x * s - s * .02, -s * .2, s * .04, s * .18, s * .01); fs(c, '#7a4a2a', lw * .7); }
    RR(c, -s * .45, -s * .28, s * .85, s * .1, s * .03); fs(c, '#c0392b', lw);
  }
});
