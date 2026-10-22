// "Challenge": skill pays, guessing costs. Same levels as classic, but misses in a row get dearer,
// fast clean finds earn medals and multipliers grow higher. No DOM in here.
import { clamp } from '../core/util.js';
import { classic } from './classic.js';

export const MEDALS = { gold: 'Gold', silver: 'Silber', bronze: 'Bronze' };

export const challenge = {
  id: 'challenge', name: 'Challenge',
  timer: { start: 40, full: 60, max: 60, penalty: 3 },
  // Time lost for the first, second and every further miss in a row; a find resets the row.
  penalties: [3, 5, 8],
  radar: { start: 2, bonusEvery: 5 },
  records: 'wdk-record-challenge', leaderboard: false,
  plan: classic.plan,
  mult(run) { return 1 + .75 * Math.min(run.streak - 1, 12); },
  // Gold: under 2.5 s, no miss, no radar. Silver: under 5 s with at most one miss. Bronze: found.
  medal({ secs, misses, radar }) {
    if (secs < 2.5 && misses === 0 && !radar) return 'gold';
    if (secs < 5 && misses <= 1) return 'silver';
    return 'bronze';
  },
  found(run, { secs, golden }) {
    const medal = this.medal({ secs, misses: run.levelMisses, radar: run.usedRadar });
    run.streak++; run.bestStreak = Math.max(run.bestStreak, run.streak); run.cows++; run.missRow = 0;
    run.medals[medal]++;
    const mult = this.mult(run), speed = 1 + 2 * clamp((6 - secs) / 6, 0, 1), shine = { gold: 1.5, silver: 1.2, bronze: 1 }[medal];
    const points = Math.round((100 + 25 * run.lv) * speed * mult * shine * (golden ? 3 : 1) * (run.usedRadar ? .5 : 1) / 5) * 5;
    const bonus = Math.round(Math.max(5, 12 - run.lv * .5) + (golden ? 6 : 0));
    run.score += points; run.time = Math.min(run.time + bonus, this.timer.max);
    run.fastest = run.fastest == null ? secs : Math.min(run.fastest, secs);
    const extraRadar = run.cows % this.radar.bonusEvery === 0; if (extraRadar) run.radar++;
    return { points, bonus, mult, extraRadar, medal };
  },
  miss(run) {
    const penalty = this.penalties[Math.min(run.missRow, this.penalties.length - 1)];
    run.missRow++; run.levelMisses++;
    run.time = Math.max(0, run.time - penalty); run.streak = 0; run.misses++;
    return { penalty };
  },
  isOver(run) { return run.time <= 0; }
};
