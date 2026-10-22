// "Chill": no clock, no points, as long as you like. Same shape as classic.js; no DOM in here.
import { pick, rnd } from '../core/rng.js';
import { ORDER } from '../content/catalog.js';

export const chill = {
  id: 'chill', name: 'Chill',
  timer: null,
  radar: { start: Infinity, bonusEvery: 0 },
  records: null, leaderboard: false,
  hud: { score: false, timer: false },
  // All worlds and modifiers show up, but at most one modifier and never more crowded than early classic levels.
  plan(lv) {
    let world = ORDER[(lv - 1) % 6];
    if (lv > 6) world = pick(ORDER);
    const mods = new Set();
    if (lv >= 4 && rnd() < .4) mods.add(pick(['night', 'move', 'twins', 'tiny']));
    return { world, mods, golden: lv >= 2 && rnd() < .2, density: Math.min(1.05, .62 + lv * .05) };
  },
  mult() { return 1; },
  found(run, { secs }) {
    run.streak++; run.bestStreak = Math.max(run.bestStreak, run.streak); run.cows++;
    run.fastest = run.fastest == null ? secs : Math.min(run.fastest, secs);
    return { points: null, bonus: null, mult: 1, extraRadar: false };
  },
  miss(run) { run.misses++; run.streak = 0; return { penalty: 0 }; },
  isOver() { return false; }
};
