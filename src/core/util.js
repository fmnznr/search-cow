/* ================================================================
   Utilities
   ================================================================ */
export const $ = s => document.querySelector(s);
export const TAU = Math.PI * 2;
export const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
export const easeOut = x => 1 - Math.pow(1 - x, 3);
export const easeBack = x => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
export const RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
export const COARSE = window.matchMedia && matchMedia('(pointer: coarse)').matches;
export const fmtInt = n => Math.round(n).toLocaleString('de-DE');
export const fmt1 = n => n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
