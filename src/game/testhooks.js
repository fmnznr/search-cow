import { DPR, H, W, c, cv } from '../core/view.js';
import { saveSettings } from '../store/settings.js';
import { HUD_TOP, entBox, genScene, levelScene, paintBg, sceneId } from '../scene/generate.js';
import { G, live, ptr } from './state.js';
import { MODES } from '../modes/index.js';
import { drawWorld } from '../render/world.js';
import { cowCenter } from '../render/frame.js';
import { els, showGameUi, updateLevelPills } from '../ui/hud.js';
import { startGame } from './flow.js';
import { useRadar } from './actions.js';
import { guess } from './input.js';
import { quitRun } from '../ui/controls.js';
import { resize, update } from './loop.js';

/* ---------- test hooks (only with ?test) ---------- */
// The contract for scripts/fairness.mjs and scripts/snapshots.mjs; keep it stable while refactoring.
export function testHooks() {
  return {
    levelScene, genScene, MODES, entBox, resize, HUD_TOP, get W() { return W; }, get H() { return H; },
    // Where HUD and radar button really sit for this scene, with the widest pill row the game can show.
    uiRects(sc) {
      live.scene = sc; showGameUi(true); updateLevelPills(); els.combo.hidden = false; els.combo.textContent = 'Serie ×4,5';
      const hud = Math.max(...[...els.hud.children].map(el => el.getBoundingClientRect().bottom)), r = els.controls.getBoundingClientRect();
      return { hudBottom: hud, controls: [r.left, r.top, r.right, r.bottom] };
    },
    // Background, figures and ambience of a scene at time t, without HUD, lens or effects.
    renderScene(sc, t) {
      live.scene = sc; paintBg(sc);
      c.setTransform(DPR, 0, 0, DPR, 0, 0); c.lineJoin = 'round'; c.lineCap = 'round';
      drawWorld(c, t, null);
      return cv.toDataURL('image/png');
    },
    startGame, useRadar, quit: quitRun,
    setMode(id) { saveSettings({ mode: id }); },
    advance(sec, dt = 1 / 60) { for (let i = Math.round(sec / dt); i > 0; i--) if (!G.paused) update(dt); },
    guess(x, y, type = 'mouse') { ptr.type = type; guess(x, y); },
    cowCenter: () => cowCenter(),
    state: () => ({ state: G.state, lv: G.lv, score: G.score, cows: G.cows, time: Math.round(G.time * 1000) / 1000, streak: G.streak, bestStreak: G.bestStreak, radar: G.radar, misses: G.misses, scene: live.scene && sceneId(live.scene), world: live.scene && live.scene.world })
  };
}
