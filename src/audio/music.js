// Music: a small sequenced loop per world, quiet under the effects.
import { saveSettings, settings } from '../store/settings.js';
import { SND } from './sfx.js';

export const MUSIC = (() => {
  let on = true, armed = false, playing = false, gain = null, filt = null, noise = null, nextT = 0, step = 0, iv = 0, mode = 'weide', fast = false, calm = false;
  on = settings.music;
  const VOL = .16;
  // 8 bars of 8ths, offsets in semitones above the melody root; null = rest
  const MEL = [7, null, 9, 7, 4, null, 2, 4, 7, null, null, 4, 2, null, 0, 2, 4, null, 7, 9, 12, null, 9, 7, 9, null, 7, 4, 7, null, null, null,
    7, null, 9, 7, 4, null, 2, 4, 7, null, 12, 11, 7, null, 4, 2, 4, 5, 7, 9, 7, null, 4, 2, 2, null, 4, 2, 0, null, null, null];
  const ROOTS = [0, 7, 9, 5, 0, 7, 5, 0];
  const STYLE = {
    weide: { key: 0, bpm: 112 }, strand: { key: 2, bpm: 116 }, stadt: { key: -2, bpm: 120 },
    winter: { key: -3, bpm: 104, bell: true }, meer: { key: 5, bpm: 96, lp: 1100 }, all: { key: 4, bpm: 92, space: true }
  };
  const mf = m => 440 * Math.pow(2, (m - 69) / 12);
  function ensure() {
    const a = SND.ctx(); if (!a) return null;
    if (!gain) {
      gain = a.createGain(); gain.gain.value = VOL;
      filt = a.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 14000;
      gain.connect(filt); filt.connect(SND.musicBus());
      const len = Math.floor(a.sampleRate * .1); noise = a.createBuffer(1, len, a.sampleRate);
      const d = noise.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    return a;
  }
  function tone(a, t, f, dur, vol, type) {
    const o = a.createOscillator(), g = a.createGain(); o.type = type || 'triangle'; o.frequency.value = f;
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(gain); o.start(t); o.stop(t + dur + .03);
  }
  function marimba(a, t, f, vol) { tone(a, t, f, .38, vol, 'sine'); tone(a, t, f * 4, .07, vol * .3, 'sine'); }
  function bellish(a, t, f, vol) { tone(a, t, f, .7, vol * .8, 'sine'); tone(a, t, f * 2.76, .3, vol * .25, 'sine'); }
  function shaker(a, t, vol) {
    const src = a.createBufferSource(); src.buffer = noise; const hp = a.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7000;
    const g = a.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + .045);
    src.connect(hp); hp.connect(g); g.connect(gain); src.start(t); src.stop(t + .06);
  }
  function playStep(a, s, t) {
    const st = STYLE[mode] || STYLE.weide, bar = Math.floor(s / 8) % 8, pos = s % 8, k = st.key, r = ROOTS[bar], third = r === 9 ? 3 : 4;
    if (pos === 0) tone(a, t, mf(48 + k + r), .3, .42);
    if (pos === 4) tone(a, t, mf(48 + k + r + (r + 7 >= 12 ? -5 : 7)), .3, .34);
    if (pos === 2 || pos === 6) for (const iv of [0, third, 7]) tone(a, t, mf(60 + k + r + iv), .1, .05, st.space ? 'sine' : 'triangle');
    if (pos % 2 === 1 && !st.space) shaker(a, t, pos === 3 || pos === 7 ? .045 : .022);
    if (s < 64) { const m = MEL[s]; if (m != null) (st.bell ? bellish : marimba)(a, t, mf(72 + k + m), .2); }
    else if (pos === 0 || pos === 3 || pos === 5) marimba(a, t, mf(60 + k + r + [0, third, 7, 12][(s >> 1) % 4]), .08);
    if (s === 0 || s === 64) SND.bell(1 + k / 24, Math.max(0, t - a.currentTime), .045, true);
  }
  function tick() {
    const a = ensure(); if (!a || !playing) return;
    const st = STYLE[mode] || STYLE.weide, dt = 60 / (st.bpm * (fast ? 1.14 : 1) * (calm ? .88 : 1)) / 2;
    if (nextT < a.currentTime) nextT = a.currentTime + .06;
    while (nextT < a.currentTime + .22) { playStep(a, step, nextT); nextT += dt; step = (step + 1) % 128; }
  }
  return {
    get on() { return on; },
    toggle() { on = !on; saveSettings({ music: on }); return on; },
    play() {
      if (!armed || !on || !SND.on || playing || document.hidden) return;
      const a = ensure(); if (!a) return;
      playing = true; step = 0; nextT = 0;
      gain.gain.cancelScheduledValues(a.currentTime); gain.gain.setValueAtTime(.0001, a.currentTime); gain.gain.exponentialRampToValueAtTime(VOL, a.currentTime + .6);
      clearInterval(iv); iv = setInterval(tick, 40); tick();
    },
    stop() { playing = false; clearInterval(iv); if (gain && SND.ctx()) { const t = SND.ctx().currentTime; gain.gain.cancelScheduledValues(t); gain.gain.setTargetAtTime(.0001, t, .08); } },
    setWorld(w) {
      if (w === mode) return; mode = w; step = 0;
      if (filt && SND.ctx()) filt.frequency.setTargetAtTime((STYLE[w] && STYLE[w].lp) || 14000, SND.ctx().currentTime, .2);
    },
    setFast(f) { fast = f; },
    // Chill mode plays the same music a bit slower.
    setCalm(c) { calm = c; },
    arm() { armed = true; },
    duck(sec) {
      if (!gain || !playing) return; const a = SND.ctx(); if (!a) return; const t = a.currentTime;
      gain.gain.cancelScheduledValues(t); gain.gain.setTargetAtTime(VOL * .2, t, .04); gain.gain.setTargetAtTime(VOL, t + sec, .35);
    }
  };
})();
