// Collected album stickers on this device.
const KEY = 'wdk-album', VERSION = 1;

function load() {
  try { const a = JSON.parse(localStorage.getItem(KEY) || 'null'); if (a && a.v === VERSION && a.got) return a; } catch (_) {}
  return { v: VERSION, got: {} };
}
const album = load();

export const hasSticker = key => !!album.got[key];
export const stickerCount = () => Object.keys(album.got).length;
// Adds the keys and returns the ones that are new.
export function collectStickers(keys) {
  const fresh = keys.filter(k => !album.got[k]);
  if (!fresh.length) return fresh;
  for (const k of fresh) album.got[k] = Date.now();
  try { localStorage.setItem(KEY, JSON.stringify(album)); } catch (_) {}
  return fresh;
}
