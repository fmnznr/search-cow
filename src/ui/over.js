// Game over screen, ranks, leaderboard entry and leaderboard dialog.
import { $, fmt1, fmtInt } from '../core/util.js';
import { BOARD } from '../store/board.js';
import { MUSIC } from '../audio/music.js';
import { SND } from '../audio/sfx.js';
import { REPLAY, sceneId } from '../scene/generate.js';
import { G, live } from '../game/state.js';
import { currentMode } from '../modes/index.js';
import { loadRecord, saveRecord } from '../store/records.js';
import { showGameUi } from './hud.js';

const RANKS = [
  [0, 'Kuh-blind', 'Keine einzige Kuh. Die Weide lacht heute noch darüber.'],
  [1, 'Grünschnabel', 'Ein Anfang! Die Kühe haben dich bemerkt.'],
  [3, 'Melk-Azubi', 'Solide. Du erkennst eine Kuh, wenn sie vor dir steht.'],
  [6, 'Weide-Profi', 'Schafe und Schweine täuschen dich nicht mehr.'],
  [10, 'Kuhflüster-Ass', 'Du hörst das Muhen, bevor es passiert.'],
  [15, 'Herdenblick', 'Selbst im Weltall entgeht dir keine Kuh.'],
  [25, 'Legende der Alm', 'Man erzählt sich auf allen Almen von dir.']
];
export function showOver() {
  G.state = 'over'; showGameUi(false);
  let rank = RANKS[0]; for (const r of RANKS) if (G.cows >= r[0]) rank = r;
  $('#rankName').textContent = rank[1]; $('#rankText').textContent = rank[2];
  const mode = currentMode();
  $('#overEyebrow').textContent = mode.timer ? 'Zeit um · Dein Titel' : 'Feierabend · Dein Titel';
  $('#stScore').parentElement.hidden = !mode.records;
  $('#stCows').textContent = G.cows; $('#stScore').textContent = fmtInt(G.score); $('#stStreak').textContent = G.bestStreak;
  $('#stFast').textContent = G.fastest == null ? '–' : `${fmt1(G.fastest)} s`;
  const rec = mode.records ? loadRecord(mode.records) : null, isNew = !!rec && !REPLAY && G.score > rec.score;
  if (isNew) saveRecord(mode.records, { score: G.score, cows: G.cows });
  $('#stamp').hidden = !isNew;
  if (!rec) $('#overRecord').textContent = G.cows ? `${G.cows} ${G.cows === 1 ? 'Kuh' : 'Kühe'} in aller Ruhe gefunden.` : 'Manchmal ist Suchen schon genug.';
  else $('#overRecord').innerHTML = (mode.medal ? `<span class="row">Medaillen <b>${G.medals.gold}× Gold</b> <b>${G.medals.silver}× Silber</b> <b>${G.medals.bronze}× Bronze</b></span>` : '') + (isNew ? (rec.score > 0 ? `Alter Rekord <b>${fmtInt(rec.score)} Punkte</b>` : 'Dein erster Rekord. Den holst du dir nochmal.') : `Rekord <b>${fmtInt(rec.score)} Punkte</b> <b>${rec.cows} ${rec.cows === 1 ? 'Kuh' : 'Kühe'}</b>`);
  lastEntry = null; $('#entryMsg').textContent = ''; $('#entryBtn').disabled = false;
  $('#entryForm').hidden = G.score <= 0 || !!REPLAY || !mode.leaderboard;
  $('#overScene').textContent = `Szene ${sceneId(live.scene)}`;
  if (G.score > 0 && !REPLAY) {
    let nick = ''; try { nick = localStorage.getItem('wdk-nick') || ''; } catch (_) {}
    $('#nick').value = nick;
    lastEntry = { nick: nick || 'Du', score: G.score, cows: G.cows, at: Date.now() };
    const idx = BOARD.addLocal(lastEntry);
    if (BOARD.writable) {
      const place = 1 + BOARD.shared.filter(x => x.id !== BOARD.uid && x.score > G.score).length;
      $('#entryMsg').textContent = BOARD.mine && BOARD.mine.score >= G.score ? `Dein Bestwert in der Liste: ${fmtInt(BOARD.mine.score)} Punkte.` : `Das reicht für Platz ${place} in der Bestenliste.`;
    } else if (idx >= 0 && idx < 10) $('#entryMsg').textContent = `Platz ${idx + 1} auf diesem Gerät.`;
  }
  $('#over').hidden = false; setTimeout(() => $('#againBtn').focus({ preventScroll: true }), 50);
  if (isNew && G.score > 0) { SND.gold(); }
  setTimeout(() => { if (G.state === 'over') MUSIC.play(); }, 1400);
}
let lastEntry = null, boardTab = 'all';
export async function submitEntry(ev) {
  ev.preventDefault(); if (!lastEntry) return;
  const nick = ($('#nick').value || '').replace(/\s+/g, ' ').trim().slice(0, 16) || 'Anonym';
  try { localStorage.setItem('wdk-nick', nick); } catch (_) {}
  BOARD.renameLocal(lastEntry.at, nick); lastEntry.nick = nick;
  const msg = $('#entryMsg'), btn = $('#entryBtn'); btn.disabled = true;
  if (!BOARD.writable) { msg.textContent = BOARD.available ? 'Auf diesem Gerät gespeichert. Für die gemeinsame Liste fehlen deinem Zugang die Schreibrechte.' : 'Auf diesem Gerät gespeichert.'; SND.bell(1.3); return; }
  msg.textContent = 'Wird eingetragen …';
  const r = await BOARD.submit(nick, G.score, G.cows);
  if (r === 'ok') { const place = 1 + BOARD.shared.filter(x => x.id !== BOARD.uid && x.score > G.score).length; msg.textContent = `Eingetragen! Platz ${place} in der Bestenliste.`; SND.fanfare(3); }
  else if (r === 'notbest') { msg.textContent = `Dein Bestwert von ${fmtInt(BOARD.mine.score)} Punkten steht schon drin. Name aktualisiert.`; SND.bell(1.3); }
  else if (r === 'readonly') { msg.textContent = 'Auf diesem Gerät gespeichert. Für die gemeinsame Liste fehlen deinem Zugang die Schreibrechte.'; }
  else { msg.textContent = 'Das hat nicht geklappt. Prüf deine Verbindung und versuch es nochmal.'; btn.disabled = false; }
}
export function openBoard() { if (!BOARD.available) boardTab = 'local'; renderBoard(); $('#board').hidden = false; setTimeout(() => $('#boardClose').focus({ preventScroll: true }), 30); }
function renderBoard() {
  const shared = BOARD.available;
  if (!shared) boardTab = 'local';
  $('#tabAll').hidden = !shared;
  $('#tabAll').setAttribute('aria-selected', String(boardTab === 'all')); $('#tabLocal').setAttribute('aria-selected', String(boardTab === 'local'));
  const list = boardTab === 'all' ? BOARD.shared : BOARD.local(), ol = $('#rankList'); ol.textContent = '';
  if (!list.length) {
    const li = document.createElement('li'); li.className = 'empty';
    li.textContent = boardTab === 'all' && !BOARD.ready ? 'Bestenliste wird geladen …' : 'Noch keine Einträge. Spiel eine Runde und trag dich ein.';
    ol.appendChild(li);
  }
  list.forEach((e, i) => {
    const li = document.createElement('li');
    if (boardTab === 'all' ? e.id === BOARD.uid : (lastEntry && e.at === lastEntry.at)) li.className = 'me';
    const add = (cls, text) => { const sp = document.createElement('span'); sp.className = cls; sp.textContent = text; li.appendChild(sp); };
    add('pl', String(i + 1)); add('nm', e.nick); add('cw', `${e.cows} ${e.cows === 1 ? 'Kuh' : 'Kühe'}`); add('sc', fmtInt(e.score));
    ol.appendChild(li);
  });
  $('#boardNote').textContent = !shared ? 'Hier stehen deine zehn besten Runden auf diesem Gerät.'
    : boardTab === 'local' ? 'Deine zehn besten Runden auf diesem Gerät.'
    : BOARD.writable ? 'Pro Person zählt die beste Runde.' : 'Ansehen kann die Liste jeder. Eintragen kann sich, wer das Spiel mit Schreibrechten geteilt bekommen hat.';
}
export function showBoardTab(tab) { boardTab = tab; renderBoard(); }
BOARD.onChange(() => { if (!$('#board').hidden) renderBoard(); });
