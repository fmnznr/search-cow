import { test } from 'node:test';
import assert from 'node:assert/strict';
import { withSeed } from '../../src/core/rng.js';
import { chill } from '../../src/modes/chill.js';

const run = () => ({ lv: 1, score: 0, cows: 0, time: 0, streak: 0, bestStreak: 0, fastest: null, radar: Infinity, misses: 0, usedRadar: false });

test('no clock, no points, never over', () => {
  const r = run();
  assert.equal(chill.timer, null);
  assert.deepEqual(chill.found(r, { secs: 4 }), { points: null, bonus: null, mult: 1, extraRadar: false });
  assert.equal(r.cows, 1); assert.equal(r.score, 0); assert.equal(r.fastest, 4);
  assert.deepEqual(chill.miss(r), { penalty: 0 });
  assert.equal(r.misses, 1); assert.equal(r.streak, 0);
  assert.equal(chill.isOver(r), false);
});

test('plan: gentle density, at most one modifier, every world and modifier appears', () => {
  const worlds = new Set(), mods = new Set();
  for (let seed = 1; seed <= 300; seed++) for (const lv of [1, 5, 9, 30]) {
    const p = withSeed(seed, () => chill.plan(lv));
    assert.ok(p.mods.size <= 1);
    assert.ok(p.density <= 1.05);
    if (lv < 4) assert.equal(p.mods.size, 0);
    worlds.add(p.world); for (const m of p.mods) mods.add(m);
  }
  assert.equal(worlds.size, 6); assert.deepEqual([...mods].sort(), ['move', 'night', 'tiny', 'twins']);
});
