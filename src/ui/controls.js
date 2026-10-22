// Sound and music toggles and the buttons of all screens.
import { $, COARSE } from '../core/util.js';
import { saveSettings, settings } from '../store/settings.js';
import { MUSIC } from '../audio/music.js';
import { SND } from '../audio/sfx.js';
import { REPLAY } from '../scene/generate.js';
import { G } from '../game/state.js';
import { els } from './hud.js';
import { startGame, timeUp, toTitle } from '../game/flow.js';
import { openBoard, showBoardTab, submitEntry } from './over.js';
import { openAlbum } from './album.js';
import { pauseGame, resumeGame, useRadar } from '../game/actions.js';

export const musicMayPlay = () => !G.paused && G.state !== 'reveal';
function toggleSound() { SND.toggle(); if (SND.on) { SND.bell(1); if (musicMayPlay()) MUSIC.play(); } else MUSIC.stop(); syncSoundLabels(); }
export function toggleMusic() { MUSIC.arm(); if (MUSIC.toggle()) { if (musicMayPlay()) MUSIC.play(); } else MUSIC.stop(); syncSoundLabels(); }
const armAudio = () => { SND.unlock(); MUSIC.arm(); if (G.state === 'title' || G.state === 'over') MUSIC.play(); window.removeEventListener('pointerdown', armAudio, true); window.removeEventListener('keydown', armAudio, true); };
window.addEventListener('pointerdown', armAudio, true); window.addEventListener('keydown', armAudio, true);
export function syncSoundLabels() {
  for (const id of ['#soundBtn', '#pauseSoundBtn']) { const b = $(id); b.textContent = `Ton: ${SND.on ? 'an' : 'aus'}`; b.setAttribute('aria-pressed', String(SND.on)); }
  for (const id of ['#musicBtn', '#pauseMusicBtn']) { const b = $(id); b.textContent = `Musik: ${MUSIC.on ? 'an' : 'aus'}`; b.setAttribute('aria-pressed', String(MUSIC.on)); }
  for (const r of document.querySelectorAll('input[data-vol]')) r.value = Math.round(settings[r.dataset.vol === 'music' ? 'musicVolume' : 'sfxVolume'] * 100);
}
// Volume sliders on the title and pause screens. Turning one up also switches its channel on.
for (const r of document.querySelectorAll('input[data-vol]')) {
  r.addEventListener('input', () => {
    const kind = r.dataset.vol, v = +r.value / 100;
    SND.setVolume(kind, v);
    if (v > 0 && !SND.on) toggleSound();
    if (kind === 'music' && v > 0 && !MUSIC.on) toggleMusic();
    syncSoundLabels();
  });
  r.addEventListener('change', () => { if (r.dataset.vol === 'sfx') SND.bell(1); });
}
$('#startBtn').addEventListener('click', startGame);
$('#againBtn').addEventListener('click', startGame);
$('#menuBtn').addEventListener('click', toTitle);
$('#soundBtn').addEventListener('click', toggleSound);
$('#pauseSoundBtn').addEventListener('click', toggleSound);
$('#musicBtn').addEventListener('click', toggleMusic);
$('#pauseMusicBtn').addEventListener('click', toggleMusic);
$('#boardBtn').addEventListener('click', openBoard);
$('#overBoardBtn').addEventListener('click', openBoard);
$('#boardClose').addEventListener('click', () => { $('#board').hidden = true; });
$('#albumBtn').addEventListener('click', openAlbum);
$('#overAlbumBtn').addEventListener('click', openAlbum);
$('#albumClose').addEventListener('click', () => { $('#album').hidden = true; });
$('#tabAll').addEventListener('click', () => showBoardTab('all'));
$('#tabLocal').addEventListener('click', () => showBoardTab('local'));
$('#entryForm').addEventListener('submit', submitEntry);
$('#pauseBtn').addEventListener('click', pauseGame);
$('#resumeBtn').addEventListener('click', resumeGame);
export function quitRun() { G.paused = false; $('#pause').hidden = true; G.time = 0; timeUp(); }
$('#quitBtn').addEventListener('click', quitRun);
// Mode choice on the title screen; remembered for the next visit.
export function showModeChoice() {
  for (const b of document.querySelectorAll('.mode')) b.setAttribute('aria-checked', String(b.dataset.mode === G.mode));
  for (const el of document.querySelectorAll('#title [data-for]')) el.hidden = el.dataset.for !== G.mode;
}
for (const b of document.querySelectorAll('.mode')) b.addEventListener('click', () => {
  if (REPLAY || G.state !== 'title') return;
  G.mode = b.dataset.mode; saveSettings({ mode: G.mode }); showModeChoice(); SND.bell(G.mode === 'chill' ? .8 : 1);
});
els.radarBtn.addEventListener('click', useRadar);
$('#howto').textContent = COARSE ? 'Tippen = Tipp abgeben · Halten & ziehen = Lupe · Glocke = Muh-Radar' : 'Maus bewegen = Lupe · Klick = Tipp · Leertaste = Muh-Radar · P = Pause · M = Musik';
