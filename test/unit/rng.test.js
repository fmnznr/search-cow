import { test } from 'node:test';
import assert from 'node:assert/strict';
import { R, mulberry, pick, rnd, withSeed } from '../../src/core/rng.js';

test('mulberry gives the same sequence for the same seed', () => {
  const a = mulberry(42), b = mulberry(42), c = mulberry(43);
  const xs = [a(), a(), a()];
  assert.deepEqual(xs, [b(), b(), b()]);
  assert.notDeepEqual(xs, [c(), c(), c()]);
  for (const x of xs) assert.ok(x >= 0 && x < 1);
});

test('withSeed makes rnd-based helpers reproducible and restores rnd afterwards', () => {
  const draw = () => [R(0, 10), pick(['a', 'b', 'c', 'd']), rnd()];
  assert.deepEqual(withSeed(7, draw), withSeed(7, draw));
  assert.equal(rnd, Math.random);
  assert.throws(() => withSeed(1, () => { throw new Error('x'); }));
  assert.equal(rnd, Math.random, 'restored even when fn throws');
});
