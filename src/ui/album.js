// The album dialog: 6 worlds × 6 kinds of stickers, drawn when opened.
import { $ } from '../core/util.js';
import { hasSticker, stickerCount } from '../store/album.js';
import { ORDER } from '../content/catalog.js';
import { KINDS, STICKERS } from '../content/album.js';
import { WORLDS } from '../content/worlds.js';
import { drawSticker } from '../render/sticker.js';

export function openAlbum() {
  const grid = $('#albumGrid'); grid.textContent = '';
  for (const world of ORDER) {
    const row = document.createElement('section'); row.className = 'album-row';
    const h = document.createElement('h3'); h.textContent = WORLDS[world].name; row.appendChild(h);
    const cells = document.createElement('div'); cells.className = 'album-cells';
    for (const [kind, label] of KINDS) {
      const got = hasSticker(`${world}:${kind}`), fig = document.createElement('figure');
      fig.className = got ? 'got' : '';
      const cv = document.createElement('canvas'); cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', got ? `${WORLDS[world].name}: ${label}` : `${label}: noch nicht gefunden`);
      const cap = document.createElement('figcaption'); cap.textContent = label;
      fig.append(cv, cap); cells.appendChild(fig);
    }
    row.appendChild(cells); grid.appendChild(row);
  }
  $('#albumCount').textContent = `${stickerCount()} von ${STICKERS.length} Stickern`;
  $('#album').hidden = false;
  // Draw after layout so the canvases know their size.
  for (const [i, cv] of [...grid.querySelectorAll('canvas')].entries()) drawSticker(cv, ORDER[Math.floor(i / KINDS.length)], KINDS[i % KINDS.length][0], cv.parentElement.className === 'got');
  setTimeout(() => $('#albumClose').focus({ preventScroll: true }), 30);
}
