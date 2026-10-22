import { test } from 'node:test';
import assert from 'node:assert/strict';
import { withSeed } from '../../src/core/rng.js';
import { challenge } from '../../src/modes/challenge.js';
import { classic } from '../../src/modes/classic.js';

const run = (o = {}) => ({ lv: 1, score: 0, cows: 0, time: 40, streak: 0, bestStreak: 0, fastest: null, radar: 2, misses: 0, usedRadar: false, levelMisses: 0, missRow: 0, medals: { gold: 0, silver: 0, bronze: 0 }, ...o });

test('medals: gold fast and clean, silver with one slip, bronze otherwise', () => {
  assert.equal(challenge.medal({ secs: 2, misses: 0, radar: false }), 'gold');
  assert.equal(challenge.medal({ secs: 2, misses: 0, radar: true }), 'silver');
  assert.equal(challenge.medal({ secs: 4, misses: 1, radar: false }), 'silver');
  assert.equal(challenge.medal({ secs: 4, misses: 2, radar: false }), 'bronze');
  assert.equal(challenge.medal({ secs: 9, misses: 0, radar: false }), 'bronze');
});

test('misses in a row get dearer until a find', () => {
  const r = run({ time: 40 });
  assert.deepEqual([1, 2, 3, 4].map(() => challenge.miss(r).penalty), [3, 5, 8, 8]);
  assert.equal(r.time, 40 - 24);
  challenge.found(r, { secs: 3, golden: false });
  assert.equal(challenge.miss(r).penalty, 3);
});

test('found counts medals and caps time at 60', () => {
  const r = run({ time: 58 });
  const res = challenge.found(r, { secs: 1, golden: false });
  assert.equal(res.medal, 'gold'); assert.equal(r.medals.gold, 1); assert.equal(r.time, 60);
});

// A clean, fast player should pull far ahead of a sloppy one, and further than in classic.
function play(mode, { secs, misses }, levels = 15) {
  const r = run({ time: 999 });
  for (let lv = 1; lv <= levels; lv++) {
    r.lv = lv; r.levelMisses = 0; r.usedRadar = false;
    for (let i = 0; i < misses; i++) mode.miss(r);
    mode.found(r, { secs, golden: false });
  }
  return r.score;
}
test('skill pays more than in classic', () => {
  const strong = { secs: 2, misses: 0 }, sloppy = { secs: 5, misses: 1 };
  const ratioClassic = play(classic, strong) / play(classic, sloppy);
  const ratioChallenge = play(challenge, strong) / play(challenge, sloppy);
  assert.ok(ratioChallenge > ratioClassic * 2, `challenge ${ratioChallenge.toFixed(1)} vs classic ${ratioClassic.toFixed(1)}`);
});

test('every fifth level is a boss, in a fixed order, without modifiers or gold', () => {
  const plan = lv => withSeed(lv, () => challenge.plan(lv));
  assert.deepEqual([5, 10, 15, 20, 25].map(lv => plan(lv).boss), ['herd', 'flee', 'wanted', 'herd', 'flee']);
  for (const lv of [5, 10, 15]) { assert.equal(plan(lv).mods.size, 0); assert.equal(plan(lv).golden, false); }
  assert.equal(plan(4).boss, undefined);
  // Same world sequence as classic, so worlds still rotate.
  assert.equal(plan(5).world, withSeed(5, () => classic.plan(5)).world);
});
