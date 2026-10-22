// "Klassisch": the original game as a set of rules. No DOM in here, so the rules run in Node unit tests.
// The game flow asks the active mode; a new mode is a new object of this shape.
import { pick, rnd } from '../core/rng.js';
import { clamp } from '../core/util.js';
import { ORDER } from '../content/catalog.js';

export const classic = {
  id: 'classic', name: 'Klassisch',
  timer: { start: 45, full: 60, max: 99, penalty: 3 },
  radar: { start: 3, bonusEvery: 5 },
  records: 'wdk-record', leaderboard: true,
  // Level plan: world, modifiers, golden cow. Runs on the seeded sequence, so it may only draw from rnd.
  plan(lv) {
    let world = ORDER[(lv - 1) % 6];
    if (lv > 12) world = pick(ORDER);
    const mods = new Set();
    if (lv === 4) mods.add('twins');
    if (lv === 7) mods.add('night');
    if (lv === 8) mods.add('move');
    if (lv === 9) mods.add('tiny');
    if (lv >= 10) {
      const pool = ['night', 'move', 'twins', 'tiny'];
      const n = lv < 14 ? 1 : (rnd() < .5 ? 1 : 2);
      while (mods.size < n) mods.add(pick(pool));
    }
    return { world, mods, golden: lv >= 3 && rnd() < .12 };
  },
  // Streak multiplier as shown in the HUD and used for points.
  mult(run) { return 1 + .5 * Math.min(run.streak - 1, 8); },
  // The cow was found after secs seconds: updates the run, returns what the player is told.
  found(run, { secs, golden }) {
    run.streak++; run.bestStreak = Math.max(run.bestStreak, run.streak); run.cows++;
    const mult = this.mult(run), speed = 1 + clamp((8 - secs) / 8, 0, 1);
    const points = Math.round((100 + 20 * run.lv) * speed * mult * (golden ? 3 : 1) * (run.usedRadar ? .5 : 1) / 5) * 5;
    const bonus = Math.round(Math.max(6, 14 - run.lv * .5) + (golden ? 8 : 0));
    run.score += points; run.time = Math.min(run.time + bonus, this.timer.max);
    run.fastest = run.fastest == null ? secs : Math.min(run.fastest, secs);
    const extraRadar = run.cows % this.radar.bonusEvery === 0; if (extraRadar) run.radar++;
    return { points, bonus, mult, extraRadar };
  },
  miss(run) {
    const penalty = this.timer.penalty;
    run.time = Math.max(0, run.time - penalty); run.streak = 0; run.misses++;
    return { penalty };
  },
  isOver(run) { return run.time <= 0; }
};
