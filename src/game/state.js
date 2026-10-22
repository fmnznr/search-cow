// Shared game state: live (changes every frame), G (the current run), pointer and light.
// What changes while the game runs, shared by all modules: one object, so each module sees the same values.
export const live = { scene: null, fx: [], texts: [], marks: [], iris: null, radar: null, trans: null, shake: 0, nightK: 1, timers: [], T: 0 };

export const G = { state: 'boot', lv: 1, score: 0, cows: 0, time: 45, streak: 0, bestStreak: 0, fastest: null, radar: 3, misses: 0, levelT: 0, usedRadar: false, paused: false, lastTick: 99, nudged: false };
export const START_TIME = 45, MAX_TIME = 60;
export function after(sec, fn) { live.timers.push({ at: live.T + sec, fn }); }

export const ptr = { x: -999, y: -999, inside: false, type: 'mouse', down: null, inspect: false, lp: 0 };
export const light = { x: 0, y: 0 };
