// Where the game runs (own web app, claude.ai artifact, someone else's frame) and URL flags.
export const APP_URL = 'https://fmnznr.github.io/search-cow/';
export const STANDALONE_HOST = !window.claude;
// Inside someone else's frame (itch.io and the like): no service worker, install prompt or legal pages of our own.
export const EMBEDDED = window.top !== window;
export const IS_IOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export const IS_INSTALLED = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;

const query = (() => { try { return new URLSearchParams(location.search); } catch (_) { return new URLSearchParams(); } })();
// ?test exposes window.__WDK__ for the test scripts.
export const TEST = query.has('test');
// ?clock=manual stops the frame loop; time then only moves through advance(), so runs are reproducible.
export const MANUAL_CLOCK = TEST && query.get('clock') === 'manual';
