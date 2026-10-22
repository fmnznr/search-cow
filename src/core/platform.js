/* ================================================================
   Install as app (only where the page is served on its own)
   ================================================================ */
export const APP_URL = 'https://fmnznr.github.io/search-cow/';
export const STANDALONE_HOST = !window.claude;
// Inside someone else's frame (itch.io and the like): no service worker, install prompt or legal pages of our own.
export const EMBEDDED = window.top !== window;
export const IS_IOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export const IS_INSTALLED = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
