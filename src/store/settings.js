// Player settings in one versioned localStorage entry. Older separate keys are taken over once.
const KEY = 'wdk-settings', VERSION = 1;
const DEFAULTS = { v: VERSION, sound: true, music: true, sfxVolume: 1, musicVolume: 1 };

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (s && s.v === VERSION) return { ...DEFAULTS, ...s };
  } catch (_) {}
  // Before v1 only on/off were stored, each under its own key.
  const s = { ...DEFAULTS };
  try { s.sound = localStorage.getItem('wdk-sound') !== '0'; s.music = localStorage.getItem('wdk-music') !== '0'; } catch (_) {}
  return s;
}

export const settings = load();

export function saveSettings(patch) {
  Object.assign(settings, patch);
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
    localStorage.removeItem('wdk-sound'); localStorage.removeItem('wdk-music');
  } catch (_) {}
}
