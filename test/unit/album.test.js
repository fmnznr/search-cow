import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KINDS, STICKERS, stickersFor } from '../../src/content/album.js';

test('36 stickers: every world times every kind, no duplicates', () => {
  assert.equal(KINDS.length, 6);
  assert.equal(STICKERS.length, 36);
  assert.equal(new Set(STICKERS).size, 36);
});

test('a find earns the world sticker plus gold and one per modifier', () => {
  assert.deepEqual(stickersFor({ world: 'weide', golden: false, mods: new Set() }), ['weide:normal']);
  assert.deepEqual(stickersFor({ world: 'meer', golden: true, mods: new Set(['night', 'tiny']) }), ['meer:normal', 'meer:gold', 'meer:night', 'meer:tiny']);
  for (const key of stickersFor({ world: 'all', golden: true, mods: new Set(['move', 'twins']) })) assert.ok(STICKERS.includes(key), key);
});

test('collecting stores new stickers once', async () => {
  const m = new Map();
  globalThis.localStorage = { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, v), removeItem: k => m.delete(k) };
  const store = await import('../../src/store/album.js?fresh');
  assert.deepEqual(store.collectStickers(['weide:normal', 'weide:gold']), ['weide:normal', 'weide:gold']);
  assert.deepEqual(store.collectStickers(['weide:normal']), []);
  assert.equal(store.stickerCount(), 2);
  assert.ok(store.hasSticker('weide:gold'));
  assert.deepEqual(Object.keys(JSON.parse(m.get('wdk-album')).got), ['weide:normal', 'weide:gold']);
});
