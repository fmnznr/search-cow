import { clamp } from '../core/util.js';

/* ================================================================
   Leaderboard: shared via the artifact store when available,
   always mirrored on this device
   ================================================================ */
export const BOARD = (() => {
  let db = null, uid = null, shared = [], mine = null, writable = false, ready = false;
  const subs = [];
  const emit = () => subs.forEach(f => { try { f(); } catch (_) {} });
  const clean = d => ({
    nick: String((d && d.nick) || 'Anonym').replace(/\s+/g, ' ').trim().slice(0, 16) || 'Anonym',
    score: clamp(Math.round(+(d && d.score) || 0), 0, 1e7),
    cows: clamp(Math.round(+(d && d.cows) || 0), 0, 9999),
    at: +(d && d.at) || 0
  });
  function local() { try { const a = JSON.parse(localStorage.getItem('wdk-board') || '[]'); return Array.isArray(a) ? a.map(clean) : []; } catch (_) { return []; } }
  function saveLocal(a) { try { localStorage.setItem('wdk-board', JSON.stringify(a.slice(0, 10))); } catch (_) {} }
  async function init() {
    if (!window.claude || typeof window.claude.use !== 'function') return;
    let user = null;
    try { [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]); } catch (_) { db = null; }
    if (!db) return;
    uid = user ? await user.id() : null;
    const cw = user ? await user.can('data.write') : null;
    writable = !!uid && cw !== false;
    try {
      db.collection('scores').orderBy('score', 'desc').limit(50).onSnapshot(snap => {
        shared = snap.docs.map(d => Object.assign({ id: d.id }, clean(d.data()))).filter(x => x.score > 0);
        const m = shared.find(x => x.id === uid); if (m) mine = m;
        ready = true; emit();
      }, () => { ready = true; emit(); });
    } catch (_) { db = null; return; }
    if (uid) { try { const s = await db.doc('scores/' + uid).get(); if (s.exists) mine = Object.assign({ id: uid }, clean(s.data())); } catch (_) {} }
    ready = true; emit();
  }
  return {
    init, local,
    onChange(f) { subs.push(f); },
    get shared() { return shared; },
    get available() { return !!db; },
    get ready() { return ready; },
    get writable() { return !!db && writable; },
    get uid() { return uid; },
    get mine() { return mine; },
    addLocal(entry) { const a = local(); a.push(entry); a.sort((x, y) => y.score - x.score || x.at - y.at); saveLocal(a); return a.findIndex(x => x.at === entry.at && x.score === entry.score); },
    renameLocal(at, nick) { const a = local(); const e = a.find(x => x.at === at); if (e) { e.nick = nick; saveLocal(a); } },
    async submit(nick, score, cows) {
      if (!this.writable) return 'readonly';
      const ref = db.doc('scores/' + uid);
      try {
        if (mine && mine.score >= score) { if (mine.nick !== nick) { await ref.update({ nick }); mine = Object.assign({}, mine, { nick }); } return 'notbest'; }
        const body = { nick, score, cows, at: Date.now() };
        await ref.set(body); mine = Object.assign({ id: uid }, body); return 'ok';
      } catch (e) {
        if (e && e.code === 'invalid_argument') { writable = false; return 'readonly'; }
        return 'error';
      }
    }
  };
})();
