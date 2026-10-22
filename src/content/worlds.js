import { R, rnd } from '../core/rng.js';
import { TAU, clamp } from '../core/util.js';
import { E, INK, MILK, RR, fs, shade } from '../render/draw.js';
import { H, U, W } from '../core/view.js';

/* ================================================================
   Worlds: backgrounds, ambient layers, entity pools
   ================================================================ */
function skyGrad(c, W, y0, y1, a, b) { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); }
function hills(c, W, base, amp, col, r) {
  c.beginPath(); c.moveTo(-4, base + 60); const f1 = r() * 3 + 1.5, f2 = r() * 5 + 3, p1 = r() * TAU, p2 = r() * TAU;
  for (let x = -4; x <= W + 8; x += 8) c.lineTo(x, base - amp * (.6 + .4 * Math.sin(x / W * f1 * Math.PI + p1)) - amp * .25 * Math.sin(x / W * f2 * Math.PI + p2));
  c.lineTo(W + 8, base + 60); c.closePath(); c.fillStyle = col; c.fill(); c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
}
function sun(c, x, y, r) {
  c.save(); c.fillStyle = 'rgba(255,224,102,.35)'; E(c, x, y, r * 1.6, r * 1.6); c.fill();
  E(c, x, y, r, r); fs(c, '#ffe066', 2.5);
  c.fillStyle = INK; E(c, x - r * .3, y - r * .1, r * .07, r * .1); c.fill(); E(c, x + r * .3, y - r * .1, r * .07, r * .1); c.fill();
  c.beginPath(); c.arc(x, y + r * .12, r * .25, .3, Math.PI - .3); c.lineWidth = 2.5; c.strokeStyle = INK; c.stroke();
  c.fillStyle = 'rgba(255,120,120,.35)'; E(c, x - r * .52, y + r * .18, r * .14, r * .08); c.fill(); E(c, x + r * .52, y + r * .18, r * .14, r * .08); c.fill();
  c.restore();
}
function groundGrad(c, W, H, hy, a, b) { const g = c.createLinearGradient(0, hy, 0, H); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, hy, W, H - hy); }
function speckle(c, W, H, y0, r, n, col, size) { c.fillStyle = col; for (let i = 0; i < n; i++) { const y = y0 + r() * (H - y0), x = r() * W, p = .5 + .7 * (y - y0) / (H - y0); E(c, x, y, size * p, size * p * .7); c.fill(); } }
function drawCloud(c, x, y, s, puffs) { c.beginPath(); for (const [px, py, pr] of puffs) { c.moveTo(x + px * s + pr * s, y + py * s); c.arc(x + px * s, y + py * s, pr * s, 0, TAU); } c.lineWidth = 2; c.strokeStyle = INK; c.stroke(); c.fillStyle = '#ffffff'; c.fill(); }
const CLOUD = [[0, 0, .32], [-.32, .08, .22], [.32, .08, .24], [.12, -.18, .24], [-.15, -.1, .2]];
function initClouds(sc, n, yMax) { sc.amb.clouds = Array.from({ length: n }, () => ({ x: rnd(), y: R(.04, yMax), s: R(.7, 1.2), v: R(.004, .01) })); }
function drawClouds(c, t, sc) { for (const cl of sc.amb.clouds) { const x = ((cl.x + t * cl.v) % 1.3) * (W + U * 4) - U * 2; drawCloud(c, x, cl.y * H, U * 1.3 * cl.s, CLOUD); } }

export const WORLDS = {
  weide: {
    name: 'Die Weide', tag: 'Zwischen Schafen, Schweinen und Heuballen.', ground: true, horizon: .3, pstyle: 'farmer', cowAcc: 'flower',
    empty: ['Da ist nur Gras.', 'Gras. Lecker für Kühe, aber keine Kuh.', 'Nichts. Nur Wiese.'],
    pool: [['sheep', 6], ['pig', 3], ['horse', 2], ['chicken', 3], ['goat', 2], ['tree', 1.6], ['bush', 2.5], ['hay', 1.6], ['fence', 1.4], ['dalma', .8], ['tractor', .35], ['person', .9], ['costume', .25]],
    twins: ['dalma', 'costume'],
    initAmb(sc) { initClouds(sc, 4, .14); },
    bg(c, W, H, r, sc) {
      const hy = sc.hy * H;
      skyGrad(c, W, 0, hy + 2, '#7fd0ff', '#dff4ff');
      sun(c, W * (.72 + r() * .2), hy * .42, clamp(Math.min(W, H) * .055, 20, 46));
      hills(c, W, hy, H * .075, '#a6dc84', r);
      const bx = W * (.1 + r() * .8), bs = U * .8, by = hy - H * .035;
      c.save(); c.translate(bx, by); c.lineWidth = 2; c.strokeStyle = INK; c.lineJoin = 'round';
      c.beginPath(); c.moveTo(-bs * .5, 0); c.lineTo(-bs * .5, -bs * .55); c.lineTo(-bs * .28, -bs * .85); c.lineTo(bs * .28, -bs * .85); c.lineTo(bs * .5, -bs * .55); c.lineTo(bs * .5, 0); c.closePath(); c.fillStyle = '#d64545'; c.fill(); c.stroke();
      c.fillStyle = '#b83232'; c.fillRect(-bs * .16, -bs * .36, bs * .32, bs * .36); c.strokeStyle = MILK; c.lineWidth = 2; c.strokeRect(-bs * .16, -bs * .36, bs * .32, bs * .36);
      c.beginPath(); c.moveTo(-bs * .16, -bs * .36); c.lineTo(bs * .16, 0); c.moveTo(bs * .16, -bs * .36); c.lineTo(-bs * .16, 0); c.stroke();
      c.restore();
      hills(c, W, hy, H * .035, '#86cf63', r);
      groundGrad(c, W, H, hy, '#8bd364', '#4bad3e');
      c.save(); c.beginPath(); c.rect(0, hy, W, H - hy); c.clip(); const vx = W / 2, vy = hy - H * .5; c.fillStyle = 'rgba(255,255,255,.07)';
      for (let i = 0; i < 16; i += 2) { const x0 = -W * .7 + i / 16 * W * 2.4, x1 = -W * .7 + (i + 1) / 16 * W * 2.4; c.beginPath(); c.moveTo(vx, vy); c.lineTo(x0, H); c.lineTo(x1, H); c.closePath(); c.fill(); }
      c.restore();
      const pbx = W * (.3 + r() * .4), ptx = W * (.25 + r() * .5), wb = Math.max(60, W * .13), pcx = W * (.1 + r() * .8), pcy = hy + (H - hy) * .5;
      c.beginPath(); c.moveTo(pbx - wb / 2, H + 4); c.quadraticCurveTo(pcx - wb * .3, pcy, ptx - 2, hy + 1); c.lineTo(ptx + 2, hy + 1); c.quadraticCurveTo(pcx + wb * .3, pcy, pbx + wb / 2, H + 4); c.closePath();
      c.fillStyle = '#e8c78f'; c.fill(); c.lineWidth = 2; c.strokeStyle = 'rgba(33,27,38,.45)'; c.stroke();
      c.lineCap = 'round';
      for (let i = 0, n = W * H / 1500; i < n; i++) { const y = hy + Math.pow(r(), .8) * (H - hy), x = r() * W, p = .4 + .8 * (y - hy) / (H - hy), h = 7 * p * (U / 50); c.strokeStyle = r() < .5 ? '#3d9a36' : '#5ab84a'; c.lineWidth = Math.max(1, 1.6 * p); c.beginPath(); c.moveTo(x - h * .5, y - h); c.lineTo(x, y); c.lineTo(x + h * .1, y - h * 1.2); c.moveTo(x, y); c.lineTo(x + h * .6, y - h * .9); c.stroke(); }
      const fc = ['#ffffff', '#ffd23f', '#ff8fab', '#b8a1ff'];
      for (let i = 0, n = W * H / 6000; i < n; i++) { const y = hy + r() * (H - hy), x = r() * W, p = .4 + .8 * (y - hy) / (H - hy), fr = 2.6 * p * (U / 50), col = fc[Math.floor(r() * fc.length)]; c.fillStyle = col; for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; E(c, x + Math.cos(a) * fr, y + Math.sin(a) * fr * .7, fr * .7, fr * .55); c.fill(); } c.fillStyle = '#ffb703'; E(c, x, y, fr * .5, fr * .4); c.fill(); }
    },
    back(c, t, sc) { drawClouds(c, t, sc); }
  },
  strand: {
    name: 'Am Strand', tag: 'Sonnenbrille auf. Irgendwo liegt eine Kuh im Sand.', ground: true, horizon: .36, pstyle: 'swim', cowAcc: 'shades',
    empty: ['Nur Sand.', 'Sand. Überall Sand.', 'Da liegt nur eine Muschel.'],
    pool: [['person', 9], ['umbrella', 3], ['towel', 2], ['castle', 1.4], ['crab', 2], ['ball', 1.2], ['palm', 1], ['dalma', .6], ['costume', .5], ['cowtowel', .5]],
    twins: ['dalma', 'costume', 'cowtowel'],
    initAmb(sc) { initClouds(sc, 3, .1); sc.amb.gulls = Array.from({ length: 3 }, () => ({ x: rnd(), y: R(.05, .2), v: R(.02, .04), ph: R(0, 9) })); },
    bg(c, W, H, r, sc) {
      const hy = sc.hy * H, st = hy - H * .14;
      skyGrad(c, W, 0, st + 2, '#6ccbff', '#e2f7ff');
      sun(c, W * (.1 + r() * .25), st * .5, clamp(Math.min(W, H) * .05, 18, 42));
      const g = c.createLinearGradient(0, st, 0, hy); g.addColorStop(0, '#1689c4'); g.addColorStop(1, '#46c6df'); c.fillStyle = g; c.fillRect(0, st, W, hy - st + 4);
      c.beginPath(); c.moveTo(0, st); c.lineTo(W, st); c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 2; c.lineCap = 'round';
      for (let i = 0, n = W / 25; i < n; i++) { const x = r() * W, y = st + 6 + r() * (hy - st - 12), w = 6 + r() * 12; c.beginPath(); c.moveTo(x - w, y); c.quadraticCurveTo(x, y - 4, x + w, y); c.stroke(); }
      const bx = W * (.2 + r() * .6), by = st + (hy - st) * .35, bs = U * .7;
      c.beginPath(); c.moveTo(bx - bs * .5, by); c.lineTo(bx + bs * .5, by); c.lineTo(bx + bs * .35, by + bs * .18); c.lineTo(bx - bs * .35, by + bs * .18); c.closePath(); fs(c, '#a0663a', 2);
      c.beginPath(); c.moveTo(bx, by); c.lineTo(bx, by - bs * .8); c.lineTo(bx + bs * .42, by - bs * .1); c.closePath(); fs(c, MILK, 2);
      groundGrad(c, W, H, hy, '#f8de9f', '#eec47a');
      c.fillStyle = 'rgba(180,130,60,.18)'; c.fillRect(0, hy, W, H * .03);
      c.beginPath(); c.moveTo(0, hy + 7); for (let x = 0; x < W + 22; x += 22) c.arc(x + 11, hy + 7, 11, Math.PI, 0); c.lineTo(W + 22, hy + 14); c.lineTo(0, hy + 14); c.closePath(); c.fillStyle = MILK; c.fill();
      c.beginPath(); for (let x = 0; x < W + 22; x += 22) { c.moveTo(x, hy + 7); c.arc(x + 11, hy + 7, 11, Math.PI, 0); } c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
      speckle(c, W, H, hy + 14, r, W * H / 900, 'rgba(190,140,70,.35)', 1.6);
      for (let i = 0, n = W * H / 30000; i < n; i++) { const x = r() * W, y = hy + 20 + r() * (H - hy - 20), p = .5 + .6 * (y - hy) / (H - hy), s = 7 * p * (U / 50); if (r() < .5) { c.beginPath(); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU - Math.PI / 2, rr = k % 2 ? s * .45 : s; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr * .7); } c.closePath(); fs(c, '#ff9f68', 1.2); } else { c.beginPath(); c.moveTo(x, y + s * .5); c.arc(x, y + s * .5, s, -2.4, -.7); c.closePath(); fs(c, '#ffc2d1', 1.2); } }
    },
    back(c, t, sc) {
      drawClouds(c, t, sc);
      c.lineWidth = 2; c.strokeStyle = INK; c.lineCap = 'round';
      for (const g of sc.amb.gulls) { const x = ((g.x + t * g.v) % 1.2) * (W + 80) - 40, y = g.y * H + Math.sin(t + g.ph) * 6, f = Math.sin(t * 6 + g.ph) * 4, s = U * .18; c.beginPath(); c.moveTo(x - s, y - f); c.quadraticCurveTo(x - s * .4, y - s * .6, x, y); c.quadraticCurveTo(x + s * .4, y - s * .6, x + s, y - f); c.stroke(); }
    }
  },
  stadt: {
    name: 'Großstadt', tag: 'Rushhour am Marktplatz. Eine Kuh mit Schiebermütze.', ground: true, horizon: .34, pstyle: 'city', cowAcc: 'cap',
    empty: ['Nur Pflaster.', 'Da ist nur Asphalt.', 'Nichts. Nur Stadt.'],
    pool: [['person', 13], ['lamp', 1.4], ['car', 1.4], ['bench', 1], ['pigeon', 3], ['planter', 1], ['hydrant', .6], ['mailbox', .6], ['dalma', .9], ['costume', .7]],
    twins: ['dalma', 'costume'],
    initAmb(sc) { initClouds(sc, 3, .12); },
    bg(c, W, H, r, sc) {
      const hy = sc.hy * H;
      skyGrad(c, W, 0, hy + 2, '#b3a4ff', '#ffdccc');
      const tx = W * (.15 + r() * .7), th = Math.min(hy - 20, H * .3);
      c.beginPath(); c.moveTo(tx - 6, hy); c.lineTo(tx - 3, hy - th); c.lineTo(tx + 3, hy - th); c.lineTo(tx + 6, hy); c.closePath(); fs(c, '#cfd6e3', 2);
      E(c, tx, hy - th * .72, th * .09, th * .09); fs(c, '#cfd6e3', 2); RR(c, tx - th * .1, hy - th * .66, th * .2, th * .03, 3); fs(c, '#cfd6e3', 2);
      c.beginPath(); c.moveTo(tx, hy - th); c.lineTo(tx, hy - th * 1.15); c.lineWidth = 3; c.strokeStyle = '#e63946'; c.stroke();
      const cols = ['#7d6fd8', '#5f8ee0', '#e27b93', '#f2a65a', '#5fbfae', '#9c88e2', '#e9c46a'];
      let x = -r() * 40;
      while (x < W) {
        const w = U * (1.1 + r() * 1.6), h = Math.min(hy - 12, H * (.06 + r() * .17)), col = cols[Math.floor(r() * cols.length)];
        c.fillStyle = col; c.fillRect(x, hy - h, w, h); c.lineWidth = 2; c.strokeStyle = INK; c.strokeRect(x, hy - h, w, h);
        const ww = 5, wh = 7; for (let yy = hy - h + 8; yy < hy - 10; yy += 14) for (let xx = x + 7; xx < x + w - 10; xx += 12) { c.fillStyle = r() < .35 ? '#fff0a8' : shade(col, -.22); c.fillRect(xx, yy, ww, wh); }
        if (r() < .3) { c.beginPath(); c.moveTo(x + w * .7, hy - h); c.lineTo(x + w * .7, hy - h - 14); c.lineWidth = 2; c.strokeStyle = INK; c.stroke(); }
        x += w - 2;
      }
      groundGrad(c, W, H, hy, '#e3d9cc', '#c7b9a6');
      c.save(); c.beginPath(); c.rect(0, hy, W, H - hy); c.clip(); c.strokeStyle = 'rgba(33,27,38,.09)'; c.lineWidth = 1.5;
      const vx = W / 2, vy = hy - H * .35; for (let i = -24; i <= 24; i++) { c.beginPath(); c.moveTo(vx, vy); c.lineTo(vx + i * W * .1, H); c.stroke(); }
      for (let k = 1; k < 14; k++) { const y = hy + (H - hy) * Math.pow(k / 14, 1.7); c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
      c.restore();
      c.fillStyle = '#a3978a'; c.fillRect(0, hy, W, 5); c.beginPath(); c.moveTo(0, hy + 5); c.lineTo(W, hy + 5); c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
    },
    back(c, t, sc) { drawClouds(c, t, sc); }
  },
  winter: {
    name: 'Alm im Schnee', tag: 'Weiße Kuh im weißen Schnee. Viel Glück.', ground: true, horizon: .32, pstyle: 'winter', cowAcc: 'beanie',
    empty: ['Nur Schnee.', 'Schnee. Sehr weiß, sehr kalt.', 'Da ist nichts außer Schnee.'],
    pool: [['pine', 4], ['snowman', 2], ['penguin', 3], ['person', 4], ['goat', 1.2], ['sheep', 1.6], ['igloo', .5], ['sled', .8], ['dalma', .8], ['costume', .5]],
    twins: ['dalma', 'costume', 'penguin'],
    initAmb(sc) { sc.amb.snow = Array.from({ length: 80 }, () => ({ x: rnd(), y: rnd(), r: R(1.2, 3.2), v: R(.03, .07), ph: R(0, 9) })); },
    bg(c, W, H, r, sc) {
      const hy = sc.hy * H;
      skyGrad(c, W, 0, hy + 2, '#a7d6ff', '#f0faff');
      for (const [col, hk] of [['#a9bfe2', .22], ['#8ea8d4', .15]]) {
        let x = -r() * W * .2;
        while (x < W + 40) {
          const hw = W * (.1 + r() * .12), h = H * hk * (.6 + r() * .5), px = x + hw;
          c.beginPath(); c.moveTo(x, hy); c.lineTo(px, hy - h); c.lineTo(px + hw, hy); c.closePath(); fs(c, col, 2);
          c.beginPath(); c.moveTo(px - hw * .35, hy - h * .65); c.lineTo(px, hy - h); c.lineTo(px + hw * .35, hy - h * .65); c.lineTo(px + hw * .15, hy - h * .72); c.lineTo(px, hy - h * .62); c.lineTo(px - hw * .15, hy - h * .72); c.closePath(); fs(c, MILK, 2);
          x += hw * (1.1 + r() * .6);
        }
      }
      groundGrad(c, W, H, hy, '#ffffff', '#dcebf8');
      c.beginPath(); c.moveTo(0, hy); c.lineTo(W, hy); c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
      const px = W * (.2 + r() * .6), py = hy + (H - hy) * (.35 + r() * .4), pw = Math.max(80, W * .16);
      E(c, px, py, pw, pw * .22); fs(c, '#bfe4f6', 2);
      c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 2; c.beginPath(); c.moveTo(px - pw * .5, py - pw * .05); c.lineTo(px - pw * .2, py - pw * .1); c.moveTo(px + pw * .1, py + pw * .06); c.lineTo(px + pw * .4, py); c.stroke();
      for (let i = 0, n = W * H / 22000; i < n; i++) { const x = r() * W, y = hy + 10 + r() * (H - hy), w = U * (1 + r() * 2); c.beginPath(); c.ellipse(x, y, w, w * .18, 0, Math.PI, TAU); c.fillStyle = '#e9f3fb'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = 'rgba(33,27,38,.12)'; c.stroke(); }
      speckle(c, W, H, hy, r, W * H / 3000, 'rgba(140,180,220,.35)', 1.3);
    },
    front(c, t, sc) {
      for (const f of sc.amb.snow) { const y = ((f.y + t * f.v) % 1) * H, x = f.x * W + Math.sin(t * .8 + f.ph) * 14; E(c, x, y, f.r, f.r); c.fillStyle = '#ffffff'; c.fill(); c.lineWidth = 1; c.strokeStyle = 'rgba(33,27,38,.25)'; c.stroke(); }
    }
  },
  meer: {
    name: 'Tiefsee', tag: 'Die Kuh trägt Taucherhelm. Und sie ist nicht allein.', ground: false, float: true, pstyle: 'diver', cowAcc: 'helmet',
    empty: ['Nur Wasser.', 'Blubb. Nichts da.', 'Da schwimmt nur Plankton.'],
    pool: [['fish', 10], ['jelly', 3], ['coral', 3.5], ['weed', 3], ['octo', 1], ['turtle', 1.2], ['diver', 1.2], ['chest', .4], ['manatee', 1.4], ['cowfish', 1.4]],
    twins: ['manatee', 'cowfish'],
    initAmb(sc) { sc.amb.bub = Array.from({ length: 40 }, () => ({ x: rnd(), y: rnd(), r: R(2, 6), v: R(.03, .08), ph: R(0, 9) })); },
    bg(c, W, H, r) {
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#43c6db'); g.addColorStop(.55, '#1c86c2'); g.addColorStop(1, '#0d4a85'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.fillStyle = 'rgba(255,255,255,.07)'; for (let i = 0; i < 6; i++) { const x = r() * W, w = 30 + r() * 80; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + w, 0); c.lineTo(x + w * 2.5 + 80, H); c.lineTo(x + w + 40, H); c.closePath(); c.fill(); }
      c.fillStyle = 'rgba(10,40,90,.45)'; for (let i = 0; i < 5; i++) { const x = r() * W, w = U * (2 + r() * 3); c.beginPath(); c.ellipse(x, H * .9, w, w * .5, 0, Math.PI, TAU); c.fill(); }
      const fy = H * .86; c.beginPath(); c.moveTo(0, H); c.lineTo(0, fy); for (let x = 0; x <= W + 10; x += 10) c.lineTo(x, fy + Math.sin(x / 70) * 6 + Math.sin(x / 23) * 2); c.lineTo(W + 10, H); c.closePath(); fs(c, '#d9bf7f', 2);
      speckle(c, W, H, fy + 6, r, W * H / 2500, 'rgba(140,100,40,.35)', 1.6);
    },
    back(c, t) { c.fillStyle = `rgba(255,255,255,${.03 + Math.sin(t * .7) * .02})`; c.beginPath(); c.moveTo(W * .3, 0); c.lineTo(W * .45, 0); c.lineTo(W * .8, H); c.lineTo(W * .55, H); c.closePath(); c.fill(); },
    front(c, t, sc) {
      c.lineWidth = 1.5;
      for (const b of sc.amb.bub) { const y = (1 - ((b.y + t * b.v) % 1)) * H, x = b.x * W + Math.sin(t * 1.5 + b.ph) * 8; E(c, x, y, b.r, b.r); c.strokeStyle = 'rgba(255,255,255,.7)'; c.stroke(); E(c, x - b.r * .35, y - b.r * .35, b.r * .25, b.r * .25); c.fillStyle = 'rgba(255,255,255,.8)'; c.fill(); }
    }
  },
  all: {
    name: 'Weltall', tag: 'Die Kuh, die über den Mond sprang.', ground: false, float: true, pstyle: 'astro', cowAcc: 'helmet',
    empty: ['Nur die Milchstraße.', 'Leeres Weltall.', 'Unendliche Weiten. Keine Kuh.'],
    pool: [['alien', 6], ['ufo', 2], ['asteroid', 4], ['planet', 1.3], ['rocket', 1], ['astro', 2], ['satellite', 1], ['laika', 1], ['spotplanet', .3]],
    twins: ['laika', 'spotplanet'],
    initAmb(sc) { sc.amb.tw = Array.from({ length: 30 }, () => ({ x: rnd(), y: rnd(), ph: R(0, 9), s: R(3, 7) })); sc.amb.shoot = { t: R(2, 6) }; },
    bg(c, W, H, r) {
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1a1145'); g.addColorStop(.6, '#2a1760'); g.addColorStop(1, '#120c2c'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      for (const [x, y, rr, col] of [[r() * W, r() * H, Math.max(W, H) * .4, 'rgba(255,120,200,.16)'], [r() * W, r() * H, Math.max(W, H) * .35, 'rgba(80,220,255,.12)']]) { const rg = c.createRadialGradient(x, y, 0, x, y, rr); rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = rg; c.fillRect(0, 0, W, H); }
      const a = -.5, cx = W / 2, cy = H / 2;
      for (let i = 0; i < 1600; i++) { const t = (r() - .5) * Math.hypot(W, H), off = (r() + r() + r() - 1.5) * H * .12; const x = cx + Math.cos(a) * t - Math.sin(a) * off, y = cy + Math.sin(a) * t + Math.cos(a) * off; c.fillStyle = `rgba(255,${230 + r() * 25 | 0},${230 + r() * 25 | 0},${.15 + r() * .4})`; c.fillRect(x, y, 1.4, 1.4); }
      for (let i = 0; i < 260; i++) { c.fillStyle = `rgba(255,255,255,${.3 + r() * .7})`; const s = r() * 1.8 + .4; E(c, r() * W, r() * H, s, s); c.fill(); }
      const pr = Math.min(W, H) * .24, px = W * .92, py = H * .95;
      E(c, px, py, pr, pr); c.fillStyle = '#ff9f68'; c.fill(); c.save(); c.clip(); c.fillStyle = '#f27b5c'; for (let k = -3; k < 4; k++) c.fillRect(px - pr, py + k * pr * .28, pr * 2, pr * .1); c.restore(); E(c, px, py, pr, pr); fs(c, null, 2.5);
      c.beginPath(); c.ellipse(px, py, pr * 1.6, pr * .32, -.25, Math.PI * 1.05, Math.PI * 1.95); c.lineWidth = 7; c.strokeStyle = '#ffd29d'; c.stroke();
      const mx = W * .08, my = H * .25, mr = Math.min(W, H) * .06; E(c, mx, my, mr, mr); fs(c, '#e9e6f2', 2.5); for (const [dx, dy, rr] of [[-.3, -.2, .2], [.3, .2, .15], [.1, -.4, .1]]) { E(c, mx + dx * mr, my + dy * mr, rr * mr, rr * mr); fs(c, '#cfcade', 1.5); }
    },
    back(c, t, sc) {
      for (const s of sc.amb.tw) { const a = .5 + .5 * Math.sin(t * 2 + s.ph); const x = s.x * W, y = s.y * H, z = s.s * a; c.fillStyle = `rgba(255,250,220,${a})`; c.beginPath(); c.moveTo(x, y - z); c.lineTo(x + z * .25, y - z * .25); c.lineTo(x + z, y); c.lineTo(x + z * .25, y + z * .25); c.lineTo(x, y + z); c.lineTo(x - z * .25, y + z * .25); c.lineTo(x - z, y); c.lineTo(x - z * .25, y - z * .25); c.closePath(); c.fill(); }
      const k = (t % 7) / 1.1; if (k < 1) { const x0 = W * ((Math.floor(t / 7) * .37) % 1), y0 = H * .1; const x = x0 + k * W * .3, y = y0 + k * H * .2; const lg = c.createLinearGradient(x - 80, y - 53, x, y); lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(1, 'rgba(255,255,255,.9)'); c.strokeStyle = lg; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x - 80, y - 53); c.lineTo(x, y); c.stroke(); }
    }
  }
};
export const ORDER = ['weide', 'strand', 'stadt', 'winter', 'meer', 'all'];
export const MODS = {
  night: ['Nacht', 'Stockdunkel. Deine Lupe wird zur Taschenlampe.'],
  move: ['Gewusel', 'Alle laufen herum. Die Kuh auch.'],
  twins: ['Doppelgänger', 'Viele Flecken, nur eine echte Kuh.'],
  tiny: ['Mini-Kuh', 'Die Kuh ist geschrumpft.']
};
