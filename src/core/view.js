// The game canvas, the offscreen background canvas and the current view size.
// W, H, U and DPR are live bindings: modules read them, only setView changes them.
import { $ } from './util.js';

export const cv = $('#cv'), c = cv.getContext('2d');
export const bgCv = document.createElement('canvas'), bgc = bgCv.getContext('2d');
export let W = 800, H = 600, DPR = 1, U = 50;

export function setView(w, h, dpr, u) { W = w; H = h; DPR = dpr; U = u; }
