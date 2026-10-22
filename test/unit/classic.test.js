import { test } from 'node:test';
import assert from 'node:assert/strict';
import { withSeed } from '../../src/core/rng.js';
import { classic } from '../../src/modes/classic.js';

const run = (o = {}) => ({ lv: 1, score: 0, cows: 0, time: 45, streak: 0, bestStreak: 0, fastest: null, radar: 3, misses: 0, usedRadar: false, ...o });
const plan = (lv, seed = 1) => withSeed(seed, () => classic.plan(lv));

test('plan: fixed tutorial levels', () => {
  assert.deepEqual([1, 2, 3, 4, 5, 6].map(lv => plan(lv).world), ['weide', 'strand', 'stadt', 'winter', 'meer', 'all']);
  assert.deepEqual([...plan(1).mods], []);
  assert.deepEqual([...plan(4).mods], ['twins']);
  assert.deepEqual([...plan(7).mods], ['night']);
  assert.deepEqual([...plan(8).mods], ['move']);
  assert.deepEqual([...plan(9).mods], ['tiny']);
});

test('plan: modifier count and golden cow by level', () => {
  for (let seed = 1; seed <= 200; seed++) {
    assert.equal(plan(1, seed).golden, false);
    assert.equal(plan(2, seed).golden, false);
    assert.equal(plan(12, seed).mods.size, 1);
    const n = plan(15, seed).mods.size;
    assert.ok(n === 1 || n === 2);
  }
  const golden = Array.from({ length: 1000 }, (_, i) => plan(5, i).golden).filter(Boolean).length;
  assert.ok(golden > 80 && golden < 160, `about 12 % golden, got ${golden / 10} %`);
});

test('plan: same seed, same plan', () => {
  const a = plan(20, 99), b = plan(20, 99);
  assert.deepEqual({ ...a, mods: [...a.mods] }, { ...b, mods: [...b.mods] });
});

test('found: points, time bonus and streak', () => {
  const r = run();
  // Same numbers as the desktop run in test/snapshots/runs.json: level 1, found after 2 s.
  assert.deepEqual(classic.found(r, { secs: 2, golden: false }), { points: 210, bonus: 14, mult: 1, extraRadar: false });
  assert.equal(r.score, 210); assert.equal(r.time, 59); assert.equal(r.streak, 1); assert.equal(r.cows, 1); assert.equal(r.fastest, 2);
  const second = classic.found(r, { secs: 9, golden: false });
  assert.equal(second.mult, 1.5);
  assert.equal(second.points, 180, 'no speed bonus after 8 s');
  assert.equal(r.fastest, 2);
});

test('found: golden triples, radar halves, multiplier caps at 5', () => {
  assert.equal(classic.found(run(), { secs: 8, golden: true }).points, 360);
  assert.equal(classic.found(run({ usedRadar: true }), { secs: 8, golden: false }).points, 60);
  assert.equal(classic.found(run({ streak: 20 }), { secs: 8, golden: false }).mult, 5);
});

test('found: time is capped, every fifth cow brings a radar', () => {
  const r = run({ time: 95, cows: 4 });
  const res = classic.found(r, { secs: 3, golden: false });
  assert.equal(r.time, 99);
  assert.equal(res.extraRadar, true); assert.equal(r.radar, 4);
});

test('miss: time penalty, streak reset, never below zero', () => {
  const r = run({ time: 2, streak: 4 });
  assert.deepEqual(classic.miss(r), { penalty: 3 });
  assert.equal(r.time, 0); assert.equal(r.streak, 0); assert.equal(r.misses, 1);
  assert.equal(classic.isOver(r), true);
  assert.equal(classic.isOver(run()), false);
});
