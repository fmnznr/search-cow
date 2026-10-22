import { test } from 'node:test';
import assert from 'node:assert/strict';

// settings.js reads localStorage when it loads, so every case imports a fresh copy.
const fakeStorage = init => {
  const m = new Map(Object.entries(init));
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), dump: () => Object.fromEntries(m) };
};
let n = 0;
const load = async init => { globalThis.localStorage = fakeStorage(init); return import(`../../src/store/settings.js?case=${n++}`); };

test('defaults without anything stored', async () => {
  const { settings } = await load({});
  assert.deepEqual(settings, { v: 1, sound: true, music: true, sfxVolume: 1, musicVolume: 1 });
});

test('takes over the old on/off keys and drops them on the first save', async () => {
  const { settings, saveSettings } = await load({ 'wdk-sound': '1', 'wdk-music': '0' });
  assert.equal(settings.sound, true); assert.equal(settings.music, false);
  saveSettings({ musicVolume: .4 });
  const stored = globalThis.localStorage.dump();
  assert.deepEqual(JSON.parse(stored['wdk-settings']), { v: 1, sound: true, music: false, sfxVolume: 1, musicVolume: .4 });
  assert.equal(stored['wdk-music'], undefined);
});

test('ignores broken or foreign data', async () => {
  const { settings } = await load({ 'wdk-settings': '{nope' });
  assert.equal(settings.sfxVolume, 1);
  const other = await load({ 'wdk-settings': JSON.stringify({ v: 99, sfxVolume: 0 }) });
  assert.equal(other.settings.sfxVolume, 1);
});
