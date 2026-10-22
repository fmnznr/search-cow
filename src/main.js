// Entry point. Imports every module in a fixed order, which is also the order their top-level code runs in, then boots the game.
import './core/rng.js';
import { $ } from './core/util.js';
import './render/draw.js';
import './core/view.js';
import { TEST } from './core/platform.js';
import './store/settings.js';
import './store/album.js';
import { BOARD } from './store/board.js';
import './audio/music.js';
import './audio/sfx.js';
import './content/entities/rig.js';
import './content/entities/cow.js';
import './content/entities/animals.js';
import './content/entities/small.js';
import './content/entities/people.js';
import './content/entities/farm.js';
import './content/entities/beach.js';
import './content/entities/city.js';
import './content/entities/winter.js';
import './content/entities/sea.js';
import './content/entities/space.js';
import './content/catalog.js';
import './content/album.js';
import './content/worlds.js';
import './scene/generate.js';
import { G } from './game/state.js';
import './modes/classic.js';
import './modes/challenge.js';
import './modes/chill.js';
import './modes/index.js';
import './render/world.js';
import './render/fx.js';
import './render/frame.js';
import { runTransition } from './render/transition.js';
import './render/sticker.js';
import './store/records.js';
import { showGameUi, updateHud } from './ui/hud.js';
import { loadLevel, toTitle } from './game/flow.js';
import './ui/over.js';
import './ui/album.js';
import './game/actions.js';
import './game/input.js';
import { syncSoundLabels } from './ui/controls.js';
import { setupInstall } from './ui/install.js';
import { frame, resize } from './game/loop.js';
import { testHooks } from './game/testhooks.js';

function start(data) {
  resize(); syncSoundLabels(); setupInstall(); BOARD.init();
  if (TEST) window.__WDK__ = testHooks();
  if (data && data.G && ['play', 'found', 'trans'].includes(data.state)) {
    Object.assign(G, data.G, { paused: false, state: 'trans' });
    $('#title').hidden = true;
    runTransition(() => { loadLevel(G.lv); showGameUi(true); updateHud(); }, () => { G.state = 'play'; });
  } else toTitle();
  requestAnimationFrame(frame);
}
try { window.claude?.hot?.snapshot?.(() => ({ G: Object.assign({}, G), state: G.state })); } catch (_) {}
if (window.claude?.hot?.ready) window.claude.hot.ready(start); else start(window.claude?.hot?.data ?? {});
