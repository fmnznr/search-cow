// Install as app (only where the page is served on its own) and legal links.
import { $ } from '../core/util.js';
import { APP_URL, EMBEDDED, IS_INSTALLED, IS_IOS, STANDALONE_HOST } from '../core/platform.js';

export function setupInstall() {
  const btn = $('#installBtn'), link = $('#appLink'), hint = $('#installHint');
  $('#legal').hidden = !STANDALONE_HOST || EMBEDDED;
  if (IS_INSTALLED) return;
  if (STANDALONE_HOST && !EMBEDDED) {
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => {});
    window.addEventListener('beforeinstallprompt', ev => { ev.preventDefault(); installEvt = ev; btn.hidden = false; });
    window.addEventListener('appinstalled', () => { installEvt = null; btn.hidden = true; });
    btn.addEventListener('click', async () => { if (!installEvt) return; installEvt.prompt(); try { await installEvt.userChoice; } catch (_) {} installEvt = null; btn.hidden = true; });
    if (IS_IOS) { hint.hidden = false; hint.textContent = 'Als App sichern: unten auf das Teilen-Symbol tippen, dann „Zum Home-Bildschirm“.'; }
  } else if (APP_URL) { link.href = APP_URL; link.hidden = false; }
}

let installEvt = null;
