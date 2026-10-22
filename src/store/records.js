// Personal record on this device.
export function loadRecord(key) { try { return JSON.parse(localStorage.getItem(key) || 'null') || { score: 0, cows: 0 }; } catch (_) { return { score: 0, cows: 0 }; } }
export function saveRecord(key, r) { try { localStorage.setItem(key, JSON.stringify(r)); } catch (_) {} }
