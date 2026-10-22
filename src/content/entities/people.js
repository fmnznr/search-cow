// People, including those in cow costumes, divers and astronauts.
import { RI, pick, rnd } from '../../core/rng.js';
import { E, HORN, INK, MILK, PINK, RR, blobPath, circles, fs, mkBlob, mkSpots, stroke2 } from '../../render/draw.js';
import { BALLOON, HAIR, NAMES, PANTS, SHIRT, SKIN, def } from './rig.js';

function personInit(e, style) {
  e.style = style; e.skin = pick(SKIN); e.hairC = pick(HAIR); e.hair = pick(['short', 'long', 'bun', 'curly', 'bald', 'short', 'long']);
  e.shirt = pick(SHIRT); e.pants = pick(PANTS); e.shoe = pick(['#211b26', '#ffffff', '#e63946', '#3d5a80']); e.name = pick(NAMES);
  e.wave = rnd() < .14; e.flip = 1;
  e.balloon = (style === 'city' || style === 'farmer' || style === 'swim') && rnd() < .09 ? pick(BALLOON) : null;
  e.hat = null; e.shades = false; e.top = rnd() < .5;
  if (style === 'farmer') { e.hat = rnd() < .6 ? 'straw' : null; e.overall = rnd() < .5; }
  if (style === 'city') e.hat = rnd() < .22 ? pick(['cap', 'beanie']) : null;
  if (style === 'swim') { e.hat = rnd() < .4 ? 'sun' : null; e.shades = rnd() < .4; }
  if (style === 'winter') { e.hat = 'beanie'; e.scarf = pick(['#e63946', '#ffd23f', '#3d6fb5', '#2a9d8f']); e.shirt = pick(['#3d6fb5', '#e63946', '#2a9d8f', '#9b5de5', '#ff9f1c']); }
  e.hatC = pick(['#e63946', '#3d6fb5', '#ffd23f', '#2a9d8f', '#f15bb5']);
}
function face(c, s, lw, y, t, e) {
  const bl = ((t + e.ph * 3) % 4.6) < .12; c.fillStyle = INK;
  if (bl) { c.fillRect(-s * .065, y, s * .04, Math.max(1, s * .01)); c.fillRect(s * .025, y, s * .04, Math.max(1, s * .01)); }
  else { E(c, -s * .045, y, s * .016, s * .021); c.fill(); E(c, s * .045, y, s * .016, s * .021); c.fill(); }
  c.beginPath(); c.arc(0, y + s * .03, s * .04, .3, Math.PI - .3); c.lineWidth = Math.max(1, lw * .7); c.strokeStyle = INK; c.stroke();
}
function drawPerson(c, e, t) {
  const s = e.s, lw = e.lw, st = e.style, cos = e.costume;
  const mv = e.moving, sw = mv ? Math.sin(e.wp) * .38 : 0, bob = mv ? Math.abs(Math.cos(e.wp)) * s * .025 : Math.sin(t * 1.8 + e.ph) * s * .006;
  const legC = cos ? MILK : st === 'swim' ? e.skin : st === 'diver' ? '#2b3a55' : st === 'astro' ? '#eef1f6' : e.pants;
  const topC = cos ? MILK : st === 'swim' ? e.skin : st === 'diver' ? '#2b3a55' : st === 'astro' ? '#eef1f6' : e.shirt;
  if (e.balloon) {
    const bx = -s * .38 + Math.sin(t * 1.3 + e.ph) * s * .03, byy = -s * 1.45;
    c.beginPath(); c.moveTo(-s * .26, -s * .82); c.quadraticCurveTo(-s * .34, -s * 1.1, bx, byy + s * .16); c.lineWidth = Math.max(1, lw * .5); c.strokeStyle = INK; c.stroke();
    E(c, bx, byy, s * .13, s * .16); fs(c, e.balloon, lw); E(c, bx - s * .04, byy - s * .05, s * .03, s * .05); c.fillStyle = 'rgba(255,255,255,.6)'; c.fill();
  }
  if (st === 'astro') { RR(c, -s * .19, -s * .82, s * .38, s * .34, s * .06); fs(c, '#c9cfdb', lw); }
  if (st === 'diver') { RR(c, -s * .17, -s * .82, s * .1, s * .3, s * .05); fs(c, '#ffd23f', lw); }
  for (const d of [-1, 1]) {
    c.save(); c.translate(d * s * .065, -s * .44); c.rotate(d * sw * .7);
    RR(c, -s * .05, 0, s * .1, s * .43, s * .045); fs(c, legC, lw);
    if (st === 'diver') { c.beginPath(); c.moveTo(-s * .06, s * .38); c.lineTo(s * .06, s * .38); c.lineTo(s * .1, s * .53); c.lineTo(-s * .1, s * .53); c.closePath(); fs(c, '#ffcf3f', lw); }
    else { E(c, d * s * .015, s * .43, s * .07, s * .035); fs(c, st === 'astro' ? '#9aa3b5' : (st === 'swim' ? '#ff8fab' : e.shoe), lw); }
    c.restore();
  }
  c.translate(0, -bob);
  RR(c, -s * .15, -s * .8, s * .3, s * .4, s * .11); c.fillStyle = topC; c.fill();
  c.save(); c.clip();
  if (cos) { c.fillStyle = INK; for (const sp of e.spots) { blobPath(c, sp.p, sp.x * s * .3, -s * .6 + sp.y * s * .4, sp.r * s * .3, sp.r * s * .3 * sp.a); c.fill(); } }
  else if (st === 'swim') { c.fillStyle = e.pants; c.fillRect(-s * .2, -s * .52, s * .4, s * .14); if (e.top) { c.fillStyle = e.shirt; c.fillRect(-s * .2, -s * .74, s * .4, s * .09); } }
  else if (st === 'farmer' && e.overall) { c.fillStyle = '#3d6fb5'; c.fillRect(-s * .1, -s * .66, s * .2, s * .3); c.fillRect(-s * .2, -s * .5, s * .4, s * .12); }
  else if (st === 'diver') { c.fillStyle = '#ffcf3f'; c.fillRect(-s * .2, -s * .62, s * .4, s * .04); }
  else if (st === 'astro') { c.fillStyle = '#e63946'; c.fillRect(-s * .06, -s * .7, s * .12, s * .06); c.fillStyle = '#3d6fb5'; c.fillRect(s * .02, -s * .58, s * .1, s * .08); }
  c.restore();
  RR(c, -s * .15, -s * .8, s * .3, s * .4, s * .11); fs(c, null, lw);
  for (const d of [-1, 1]) {
    let a = -d * (.18 + Math.sin(t * 1.6 + e.ph) * .04) + (mv ? d * sw * .5 : 0);
    if (e.wave && d === 1) a = -2.5 + Math.sin(t * 9 + e.ph) * .35;
    if (e.balloon && d === -1) a = 2.35;
    c.save(); c.translate(d * s * .14, -s * .74); c.rotate(a);
    RR(c, -s * .04, -s * .02, s * .08, s * .33, s * .04); fs(c, st === 'swim' ? e.skin : topC, lw);
    E(c, 0, s * .34, s * .045, s * .045); fs(c, st === 'astro' || st === 'diver' ? '#9aa3b5' : (cos ? MILK : e.skin), lw);
    c.restore();
  }
  if (st === 'winter') { RR(c, -s * .14, -s * .83, s * .28, s * .07, s * .03); fs(c, e.scarf, lw); RR(c, s * .03, -s * .79, s * .065, s * .19, s * .03); fs(c, e.scarf, lw); }
  c.save(); c.translate(0, -s * .93);
  if (st === 'astro') {
    E(c, 0, 0, s * .2, s * .2); fs(c, '#eef1f6', lw);
    RR(c, -s * .14, -s * .09, s * .28, s * .17, s * .08); fs(c, '#f6c453', lw);
    E(c, -s * .06, -s * .04, s * .04, s * .025); c.fillStyle = 'rgba(255,255,255,.75)'; c.fill();
    c.restore(); return;
  }
  if (cos) {
    for (const d of [-1, 1]) {
      E(c, d * s * .2, -s * .05, s * .075, s * .035, d * .4); fs(c, MILK, lw); E(c, d * s * .2, -s * .05, s * .04, s * .016, d * .4); c.fillStyle = PINK; c.fill();
      c.beginPath(); c.moveTo(d * s * .07, -s * .15); c.quadraticCurveTo(d * s * .1, -s * .27, d * s * .15, -s * .27); c.quadraticCurveTo(d * s * .13, -s * .2, d * s * .13, -s * .13); c.closePath(); fs(c, HORN, lw * .8);
    }
    E(c, 0, 0, s * .19, s * .18); c.fillStyle = MILK; c.fill();
    c.save(); c.clip(); blobPath(c, e.hoodSpot, s * .1, -s * .08, s * .09, s * .08); c.fillStyle = INK; c.fill(); c.restore();
    E(c, 0, 0, s * .19, s * .18); fs(c, null, lw);
    E(c, 0, s * .025, s * .115, s * .115); fs(c, e.skin, lw);
    face(c, s, lw, s * .015, t, e);
    c.restore(); return;
  }
  if (e.hair === 'long' && st !== 'diver') { RR(c, -s * .16, -s * .08, s * .32, s * .3, s * .12); fs(c, e.hairC, lw); }
  E(c, 0, 0, s * .135, s * .14); fs(c, e.skin, lw);
  if (st === 'diver') {
    c.beginPath(); c.ellipse(0, -s * .02, s * .145, s * .13, 0, Math.PI, 0); c.closePath(); fs(c, '#2b3a55', lw);
    RR(c, -s * .12, -s * .06, s * .24, s * .1, s * .04); fs(c, '#ffcf3f', lw); RR(c, -s * .09, -s * .045, s * .18, s * .07, s * .03); fs(c, '#9fe3ff', null);
    c.beginPath(); c.moveTo(s * .12, s * .06); c.lineTo(s * .17, s * .06); c.lineTo(s * .17, -s * .2); stroke2(c, Math.max(1.2, s * .025), '#ffcf3f', lw * .6);
    c.restore(); return;
  }
  if (e.hair !== 'bald' && e.hat !== 'beanie') {
    c.beginPath(); c.ellipse(0, -s * .035, s * .145, s * .12, 0, Math.PI, 0); c.closePath(); fs(c, e.hairC, lw);
    if (e.hair === 'bun') { E(c, 0, -s * .19, s * .06, s * .05); fs(c, e.hairC, lw); }
    if (e.hair === 'curly') circles(c, [[-.12, -.07, .05], [.12, -.07, .05], [-.07, -.15, .055], [.07, -.15, .055], [0, -.16, .05]], s, e.hairC, lw);
  }
  face(c, s, lw, 0, t, e);
  if (e.shades) { RR(c, -s * .1, -s * .025, s * .085, s * .045, s * .02); fs(c, INK, null); RR(c, s * .015, -s * .025, s * .085, s * .045, s * .02); c.fill(); }
  switch (e.hat) {
    case 'straw': E(c, 0, -s * .08, s * .25, s * .05); fs(c, '#f1d27a', lw); c.beginPath(); c.ellipse(0, -s * .1, s * .13, s * .1, 0, Math.PI, 0); c.closePath(); fs(c, '#f1d27a', lw); c.fillStyle = '#e63946'; c.fillRect(-s * .12, -s * .12, s * .24, s * .025); break;
    case 'sun': E(c, 0, -s * .08, s * .27, s * .055); fs(c, e.hatC, lw); c.beginPath(); c.ellipse(0, -s * .1, s * .12, s * .09, 0, Math.PI, 0); c.closePath(); fs(c, e.hatC, lw); break;
    case 'cap': c.beginPath(); c.ellipse(0, -s * .06, s * .145, s * .12, 0, Math.PI, 0); c.closePath(); fs(c, e.hatC, lw); RR(c, 0, -s * .08, s * .22, s * .035, s * .015); fs(c, e.hatC, lw); break;
    case 'beanie': c.beginPath(); c.ellipse(0, -s * .04, s * .15, s * .15, 0, Math.PI, 0); c.closePath(); fs(c, e.hatC, lw); RR(c, -s * .155, -s * .07, s * .31, s * .05, s * .02); fs(c, MILK, lw); E(c, 0, -s * .21, s * .045, s * .045); fs(c, MILK, lw); break;
  }
  c.restore();
}
const nameMsg = e => pick([`${e.name} ist keine Kuh.`, `Das ist ${e.name}. ${e.name} sucht auch.`, `Falsch. Das ist ${e.name} aus der Buchhaltung.`, `${e.name} winkt zurück.`]);
def('person', {
  k: 1.25, box: [-.24, -1.08, .24, 0], walk: true, snd: 'hm', msg: nameMsg,
  init(e, sc) { personInit(e, sc.wd.pstyle); }, draw: drawPerson
});
def('costume', {
  k: 1.25, box: [-.26, -1.13, .26, 0], walk: true, snd: 'hm',
  msg: e => pick([`${e.name} im Kuhkostüm. Netter Versuch!`, `Das ist nur ${e.name} im Kostüm. Muh?`, `${e.name} geht als Kuh zum Fasching.`]),
  init(e, sc) { personInit(e, sc.wd.pstyle === 'winter' ? 'city' : sc.wd.pstyle); e.costume = true; e.hat = null; e.balloon = null; e.spots = mkSpots(RI(3, 4), .18, .3); e.hoodSpot = mkBlob(7, .4); },
  draw: drawPerson
});
def('diver', {
  k: 1.3, box: [-.24, -1.08, .24, .05], snd: 'blub', oy: .55, rotR: .5, float: true,
  msg: e => `${e.name} taucht. ${e.name} ist keine Kuh.`,
  init(e) { personInit(e, 'diver'); }, draw: drawPerson
});
def('astro', {
  k: 1.3, box: [-.24, -1.13, .24, .02], snd: 'hm', oy: .55, rotR: .7, float: true,
  msg: e => `${e.name} im Raumanzug. Leider keine Kuh.`,
  init(e) { personInit(e, 'astro'); }, draw: drawPerson
});
