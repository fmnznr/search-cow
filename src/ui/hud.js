// HUD during play and the level banner.
import { $, clamp, fmt1, fmtInt } from '../core/util.js';
import { MODS } from '../content/catalog.js';
import { G, live } from '../game/state.js';
import { currentMode } from '../modes/index.js';

export function showGameUi(on) { els.hud.hidden = !on; els.controls.hidden = !on; }

export const els = { hud: $('#hud'), controls: $('#controls'), score: $('#score'), secs: $('#secs'), barFill: $('#barFill'), cows: $('#cows'), timer: $('#timer'), radarBtn: $('#radarBtn'), radarCount: $('#radarCount'), lvl: $('#lvlPill'), modPills: $('#modPills'), combo: $('#combo') };
const hudCache = {};
function setText(el, key, v) { if (hudCache[key] !== v) { hudCache[key] = v; el.textContent = v; } }
export function updateHud() {
  setText(els.score, 'score', fmtInt(G.score));
  setText(els.cows, 'cows', String(G.cows));
  setText(els.secs, 'secs', String(Math.max(0, Math.ceil(G.time))));
  const f = clamp(G.time / currentMode().timer.full, 0, 1).toFixed(3);
  if (hudCache.bar !== f) { hudCache.bar = f; els.barFill.style.transform = `scaleX(${f})`; }
  els.timer.classList.toggle('low', G.time < 10 && G.state === 'play');
  setText(els.radarCount, 'radar', String(G.radar));
  els.radarBtn.disabled = G.radar <= 0 || G.state !== 'play';
  if (G.streak >= 2) { els.combo.hidden = false; setText(els.combo, 'combo', `Serie ×${fmt1(currentMode().mult(G)).replace(',0', '')}`); } else els.combo.hidden = true;
}
export function updateLevelPills() {
  els.lvl.textContent = `Level ${live.scene.lv} · ${live.scene.wd.name}`;
  els.modPills.innerHTML = '';
  for (const m of live.scene.mods) { const s = document.createElement('span'); s.className = 'pill mod'; s.textContent = MODS[m][0]; els.modPills.appendChild(s); }
}
export function showBanner() {
  $('#bnLevel').textContent = `Level ${live.scene.lv}`;
  $('#bnName').textContent = live.scene.wd.name + (live.scene.mods.has('night') ? ' bei Nacht' : '');
  $('#bnTag').textContent = live.scene.lv === 1 ? 'Finde die Kuh. Klick drauf. So einfach ist das. Erstmal.' : live.scene.wd.tag;
  const m = $('#bnMods'); m.innerHTML = '';
  for (const k of live.scene.mods) { const d = document.createElement('div'); d.innerHTML = `<span class="pill mod"></span><span></span>`; d.children[0].textContent = MODS[k][0]; d.children[1].textContent = MODS[k][1]; m.appendChild(d); }
  const bn = $('#banner'); bn.hidden = false; const card = bn.firstElementChild; card.style.animation = 'none'; void card.offsetWidth; card.style.animation = '';
}
