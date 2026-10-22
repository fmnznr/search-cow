// Scene generation draws from rnd so a seed reproduces a level; effects and gameplay outside genScene use Math.random.
export let rnd = Math.random;
export const R = (a, b) => a + rnd() * (b - a);
export const RI = (a, b) => Math.floor(a + rnd() * (b - a + 1));
export const pick = a => a[Math.floor(rnd() * a.length)];

export function wpick(list) { let s = 0; for (const [, w] of list) s += w; let r = rnd() * s; for (const [k, w] of list) { r -= w; if (r <= 0) return k; } return list[0][0]; }
// Runs fn with rnd drawing from a seeded sequence, then restores the previous source.
export function withSeed(seed, fn) { const prev = rnd; rnd = mulberry(seed); try { return fn(); } finally { rnd = prev; } }
export function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
