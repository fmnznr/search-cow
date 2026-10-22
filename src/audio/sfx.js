// Sound effects, all synthesized with Web Audio; nothing is loaded.
import { RI } from '../core/rng.js';
import { clamp } from '../core/util.js';

export const SND = (() => {
  let ac = null, master = null, on = true;
  try { on = localStorage.getItem('wdk-sound') !== '0'; } catch (_) {}
  function ctx() {
    if (!on) return null;
    if (!ac) {
      const A = window.AudioContext || window.webkitAudioContext; if (!A) return null;
      try { ac = new A(); } catch (_) { return null; }
      master = ac.createGain(); master.gain.value = .55;
      const comp = ac.createDynamicsCompressor(); master.connect(comp); comp.connect(ac.destination);
    }
    if (ac.state === 'suspended') ac.resume().catch(() => {});
    return ac;
  }
  function dest(pan) {
    const g = ac.createGain();
    if (pan && ac.createStereoPanner) { const p = ac.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); g.connect(p); p.connect(master); }
    else g.connect(master);
    return g;
  }
  function ramp(param, pts, t) { pts.forEach(([dt, v], i) => { if (i === 0) param.setValueAtTime(v, t + dt); else param.exponentialRampToValueAtTime(v, t + dt); }); }
  function voice(o) {
    const a = ctx(); if (!a) return;
    const t = a.currentTime + (o.delay || 0) + .005;
    const osc = a.createOscillator(); osc.type = o.type || 'sawtooth'; ramp(osc.frequency, o.f, t);
    let node = osc;
    if (o.vib) { const l = a.createOscillator(), lg = a.createGain(); l.frequency.value = o.vib[0]; lg.gain.value = o.vib[1]; l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(t + o.dur + .05); }
    if (o.filt) { const b = a.createBiquadFilter(); b.type = o.filt.type; b.Q.value = o.filt.Q || 1; ramp(b.frequency, o.filt.f, t); node.connect(b); node = b; }
    const g = dest(o.pan), pk = o.peak || .4, at = o.a || .01, rel = o.rel || .08;
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(pk, t + at);
    g.gain.setValueAtTime(pk, t + Math.max(at, o.dur - rel)); g.gain.exponentialRampToValueAtTime(.0001, t + o.dur);
    node.connect(g); osc.start(t); osc.stop(t + o.dur + .05);
  }
  function bell(p = 1, delay = 0, vol = .3) {
    const a = ctx(); if (!a) return; const t = a.currentTime + delay + .005;
    const g = dest(0); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(vol * .25, t + .05); g.gain.exponentialRampToValueAtTime(.0001, t + .55);
    const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 950 * p; bp.Q.value = 1.1; bp.connect(g);
    for (const f of [540, 800]) { const o = a.createOscillator(); o.type = 'square'; o.frequency.value = f * p; o.connect(bp); o.start(t); o.stop(t + .6); }
  }
  const pluck = (f, delay = 0, vol = .22, type = 'triangle') => voice({ type, f: [[0, f], [.28, f * .995]], dur: .3, peak: vol, a: .004, rel: .26, delay });
  return {
    get on() { return on; },
    toggle() { on = !on; try { localStorage.setItem('wdk-sound', on ? '1' : '0'); } catch (_) {} if (on) ctx(); return on; },
    unlock() { ctx(); },
    ctx,
    master: () => master,
    moo(pan = 0, p = 1, len = 1) {
      const d = len, f = 118 * p;
      voice({ type: 'sawtooth', f: [[0, f * .82], [.16, f * 1.06], [d * .62, f], [d, f * .72]], dur: d, peak: .5, a: .09, rel: .32, vib: [5.2, f * .03], filt: { type: 'lowpass', Q: 6, f: [[0, 260], [.24, 980], [d * .7, 720], [d, 300]] }, pan });
      voice({ type: 'square', f: [[0, f * .41], [.16, f * .53], [d * .62, f * .5], [d, f * .36]], dur: d, peak: .1, a: .1, rel: .3, filt: { type: 'lowpass', Q: 1, f: [[0, 320], [d, 260]] }, pan });
    },
    bell,
    fanfare(streak = 1) { const b = 523 * (1 + Math.min(streak, 8) * .04); [1, 1.26, 1.5, 2].forEach((m, i) => pluck(b * m, .35 + i * .08, .2)); bell(1.4, .35 + .36, .18); },
    gold() { [1, 1.26, 1.5, 2, 2.52, 3].forEach((m, i) => pluck(880 * m, i * .06, .12, 'sine')); },
    tick(sec) { voice({ type: 'square', f: [[0, sec <= 3 ? 1700 : 1300], [.04, 1200]], dur: .05, peak: .1 }); },
    bonk() { voice({ type: 'square', f: [[0, 210], [.16, 80]], dur: .18, peak: .2, filt: { type: 'lowpass', Q: 2, f: [[0, 1200], [.18, 300]] } }); },
    whoosh(up = true) { voice({ type: 'sawtooth', f: up ? [[0, 120], [.5, 900]] : [[0, 900], [.5, 140]], dur: .5, peak: .07, a: .15, rel: .2, filt: { type: 'bandpass', Q: .8, f: up ? [[0, 400], [.5, 3000]] : [[0, 3000], [.5, 400]] } }); },
    ping() { voice({ type: 'sine', f: [[0, 1250], [.55, 1230]], dur: .6, peak: .22, a: .005, rel: .5 }); voice({ type: 'sine', f: [[0, 1660], [.5, 1640]], dur: .55, peak: .14, a: .005, rel: .45, delay: .14 }); },
    womp() {
      voice({ type: 'sawtooth', f: [[0, 311], [.36, 300]], dur: .38, peak: .25, filt: { type: 'lowpass', Q: 3, f: [[0, 1400], [.38, 700]] } });
      voice({ type: 'sawtooth', f: [[0, 294], [.36, 283]], dur: .38, peak: .25, delay: .42, filt: { type: 'lowpass', Q: 3, f: [[0, 1400], [.38, 700]] } });
      voice({ type: 'sawtooth', f: [[0, 277], [1, 205]], dur: 1.1, peak: .27, delay: .84, vib: [6, 7], rel: .4, filt: { type: 'lowpass', Q: 3, f: [[0, 1400], [1, 400]] } });
    },
    start() { bell(1); bell(1.5, .12); pluck(523, .25); pluck(659, .33); pluck(784, .41); pluck(1046, .5, .25); },
    animal(kind, pan) {
      const P = pan;
      switch (kind) {
        case 'baa': voice({ type: 'sawtooth', f: [[0, 430], [.45, 370]], dur: .5, peak: .28, a: .03, rel: .15, vib: [10, 45], filt: { type: 'bandpass', Q: 2, f: [[0, 1300], [.5, 900]] }, pan: P }); break;
        case 'goat': voice({ type: 'sawtooth', f: [[0, 560], [.35, 480]], dur: .4, peak: .26, a: .02, rel: .12, vib: [13, 70], filt: { type: 'bandpass', Q: 2, f: [[0, 1600], [.4, 1100]] }, pan: P }); break;
        case 'oink': for (const d of [0, .16]) voice({ type: 'square', f: [[0, 520], [.12, 290]], dur: .13, peak: .2, delay: d, filt: { type: 'bandpass', Q: 3, f: [[0, 1000], [.13, 700]] }, pan: P }); break;
        case 'woof': for (const d of [0, .2]) voice({ type: 'sawtooth', f: [[0, 320], [.1, 150]], dur: .12, peak: .32, delay: d, filt: { type: 'lowpass', Q: 4, f: [[0, 1100], [.12, 500]] }, pan: P }); break;
        case 'neigh': voice({ type: 'sawtooth', f: [[0, 950], [.65, 430]], dur: .7, peak: .22, a: .02, rel: .2, vib: [15, 70], filt: { type: 'bandpass', Q: 2, f: [[0, 1700], [.7, 900]] }, pan: P }); break;
        case 'cluck': for (const d of [0, .15, .27]) voice({ type: 'square', f: [[0, 720], [.05, 980], [.1, 640]], dur: .1, peak: .14, delay: d, filt: { type: 'bandpass', Q: 3, f: [[0, 1600], [.1, 1200]] }, pan: P }); break;
        case 'honk': voice({ type: 'sawtooth', f: [[0, 360], [.25, 310]], dur: .28, peak: .25, filt: { type: 'bandpass', Q: 5, f: [[0, 850], [.28, 700]] }, pan: P }); break;
        case 'hm': voice({ type: 'sine', f: [[0, 210], [.26, 320]], dur: .3, peak: .3, a: .03, filt: { type: 'lowpass', Q: 1, f: [[0, 800], [.3, 900]] }, pan: P }); break;
        case 'beep': [RI(700, 1000), RI(1100, 1500), RI(800, 1300)].forEach((f, i) => voice({ type: 'sine', f: [[0, f], [.07, f * 1.05]], dur: .08, peak: .18, delay: i * .09, pan: P })); break;
        case 'blub': for (const d of [0, .1]) voice({ type: 'sine', f: [[0, 220], [.08, 760]], dur: .09, peak: .25, delay: d, pan: P }); break;
        case 'grunt': voice({ type: 'sawtooth', f: [[0, 95], [.5, 70]], dur: .55, peak: .35, a: .06, rel: .2, vib: [7, 4], filt: { type: 'lowpass', Q: 4, f: [[0, 420], [.5, 300]] }, pan: P }); break;
        case 'ufo': voice({ type: 'sine', f: [[0, 300], [.7, 1300]], dur: .7, peak: .18, vib: [9, 60], pan: P }); break;
        case 'click': for (const d of [0, .07, .14]) voice({ type: 'square', f: [[0, 2400], [.02, 1800]], dur: .025, peak: .12, delay: d, pan: P }); break;
        case 'coo': voice({ type: 'sine', f: [[0, 420], [.12, 520], [.35, 400]], dur: .38, peak: .25, vib: [12, 25], pan: P }); break;
        case 'brum': voice({ type: 'sawtooth', f: [[0, 70], [.5, 60]], dur: .5, peak: .3, vib: [18, 10], filt: { type: 'lowpass', Q: 3, f: [[0, 500], [.5, 300]] }, pan: P }); break;
        case 'horn': for (const f of [440, 554]) voice({ type: 'square', f: [[0, f], [.3, f]], dur: .3, peak: .1, filt: { type: 'lowpass', Q: 1, f: [[0, 1800], [.3, 1800]] }, pan: P }); break;
        case 'moo': this.moo(P, 1.1, .7); break;
        default: voice({ type: 'triangle', f: [[0, 330], [.07, 150]], dur: .09, peak: .28, pan: P });
      }
    }
  };
})();
