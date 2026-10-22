// City figures and props.
import { pick, rnd } from '../../core/rng.js';
import { TAU } from '../../core/util.js';
import { E, INK, MILK, RR, circles, fs } from '../../render/draw.js';
import { def } from './rig.js';

def('lamp', {
  k: 1.9, box: [-.12, -1.02, .12, 0], msg: ['Eine Laterne.', 'Laterne. Leuchtet, muht nicht.'],
  draw(c, e) {
    const s = e.s, lw = e.lw;
    RR(c, -s * .07, -s * .06, s * .14, s * .06, s * .02); fs(c, '#38475e', lw);
    RR(c, -s * .022, -s * .9, s * .044, s * .85, s * .02); fs(c, '#38475e', lw);
    E(c, 0, -s * .86, s * .065, s * .06); fs(c, '#ffe9a3', lw);
    c.beginPath(); c.moveTo(-s * .09, -s * .88); c.lineTo(s * .09, -s * .88); c.lineTo(s * .05, -s * .99); c.lineTo(-s * .05, -s * .99); c.closePath(); fs(c, '#38475e', lw);
  }
});
def('car', {
  k: 1.8, box: [-.52, -.62, .52, 0], snd: 'horn',
  msg: e => e.taxi ? 'Ein Taxi. Bitte einmal zur Weide!' : pick(['Ein Auto. Parkt im Halteverbot.', 'Ein Auto. Hupt gleich.']),
  init(e) { e.taxi = rnd() < .3; e.col = e.taxi ? '#ffd23f' : pick(['#e63946', '#3d6fb5', '#2a9d8f', '#9b5de5', '#f4f1f8', '#ff9f1c']); },
  draw(c, e) {
    const s = e.s, lw = e.lw;
    c.beginPath(); c.moveTo(-s * .32, -s * .3); c.lineTo(-s * .2, -s * .52); c.lineTo(s * .16, -s * .52); c.lineTo(s * .3, -s * .3); c.closePath(); fs(c, e.col, lw);
    c.beginPath(); c.moveTo(-s * .26, -s * .32); c.lineTo(-s * .18, -s * .47); c.lineTo(-s * .04, -s * .47); c.lineTo(-s * .04, -s * .32); c.closePath(); fs(c, '#cfeeff', lw * .7);
    c.beginPath(); c.moveTo(s * .0, -s * .32); c.lineTo(s * .0, -s * .47); c.lineTo(s * .14, -s * .47); c.lineTo(s * .24, -s * .32); c.closePath(); fs(c, '#cfeeff', lw * .7);
    if (e.taxi) { RR(c, -s * .08, -s * .61, s * .16, s * .08, s * .02); fs(c, MILK, lw * .8); }
    RR(c, -s * .5, -s * .33, s, s * .22, s * .08); fs(c, e.col, lw);
    E(c, s * .46, -s * .25, s * .03, s * .025); fs(c, '#fff3a0', lw * .5); E(c, -s * .47, -s * .25, s * .02, s * .025); fs(c, '#e63946', lw * .5);
    for (const x of [-.3, .3]) { E(c, x * s, -s * .1, s * .1, s * .1); fs(c, '#2d2a36', lw); E(c, x * s, -s * .1, s * .045, s * .045); fs(c, '#c9cfdb', null); }
  }
});
def('bench', {
  k: 1.25, box: [-.5, -.44, .5, 0], msg: ['Eine Parkbank. Setzen? Nein, suchen!', 'Bank. Frisch gestrichen.'],
  draw(c, e) {
    const s = e.s, lw = e.lw;
    for (const x of [-.38, .38]) { RR(c, x * s - s * .025, -s * .42, s * .05, s * .42, s * .02); fs(c, '#38475e', lw); }
    for (const y of [-.42, -.33]) { RR(c, -s * .48, y * s, s * .96, s * .06, s * .02); fs(c, '#c07a45', lw); }
    for (const y of [-.24, -.18]) { RR(c, -s * .5, y * s, s, s * .05, s * .02); fs(c, '#b06c3a', lw); }
  }
});
def('planter', {
  k: 1.5, box: [-.35, -1.02, .35, 0], msg: ['Ein Blumenkübel.', 'Ein Stadtbaum im Kübel.'],
  init(e) { e.cr = [[0, -.82, .17], [-.14, -.72, .13], [.14, -.72, .13], [0, -.68, .15]]; e.c1 = pick(['#4caf50', '#3f9e45']); },
  draw(c, e) {
    const s = e.s, lw = e.lw;
    c.beginPath(); c.moveTo(-s * .02, -s * .3); c.lineTo(-s * .02, -s * .62); c.lineWidth = Math.max(1.5, s * .04); c.strokeStyle = '#8b5a3c'; c.stroke();
    circles(c, e.cr, s, e.c1, lw);
    RR(c, -s * .3, -s * .32, s * .6, s * .32, s * .04); fs(c, '#b8b1a7', lw);
    c.fillStyle = 'rgba(33,27,38,.12)'; c.fillRect(-s * .3, -s * .12, s * .6, s * .03);
  }
});
def('hydrant', {
  k: .6, box: [-.32, -1.02, .32, 0], msg: ['Ein Hydrant. Hunde lieben den.', 'Hydrant. Wasser marsch, Kuh nicht.'],
  draw(c, e) {
    const s = e.s, lw = e.lw;
    RR(c, -s * .3, -s * .62, s * .6, s * .12, s * .05); fs(c, '#c1121f', lw);
    RR(c, -s * .2, -s * .82, s * .4, s * .82, s * .08); fs(c, '#e63946', lw);
    c.beginPath(); c.arc(0, -s * .82, s * .2, Math.PI, 0); c.closePath(); fs(c, '#e63946', lw);
    E(c, 0, -s * 1, s * .05, s * .04); fs(c, '#c1121f', lw); RR(c, -s * .25, -s * .08, s * .5, s * .08, s * .02); fs(c, '#c1121f', lw);
  }
});
def('mailbox', {
  k: .85, box: [-.35, -1.02, .35, 0], msg: ['Ein Briefkasten. Nächste Leerung: 17 Uhr.', 'Briefkasten. Schick der Kuh eine Karte.'],
  draw(c, e) {
    const s = e.s, lw = e.lw;
    RR(c, -s * .05, -s * .45, s * .1, s * .45, s * .03); fs(c, '#38475e', lw);
    RR(c, -s * .32, -s * 1, s * .64, s * .6, s * .12); fs(c, '#ffcc00', lw);
    RR(c, -s * .2, -s * .9, s * .4, s * .04, s * .02); fs(c, INK, null);
    c.beginPath(); c.arc(-s * .02, -s * .66, s * .1, 0, TAU); c.lineWidth = Math.max(1, s * .03); c.strokeStyle = INK; c.stroke();
    c.beginPath(); c.moveTo(s * .08, -s * .66); c.lineTo(s * .18, -s * .72); c.lineTo(s * .18, -s * .6); c.closePath(); c.fillStyle = INK; c.fill();
  }
});
