// Personal record on this device.
export function loadRecord() { try { return JSON.parse(localStorage.getItem('wdk-record') || 'null') || { score: 0, cows: 0 }; } catch (_) { return { score: 0, cows: 0 }; } }
export function saveRecord(r) { try { localStorage.setItem('wdk-record', JSON.stringify(r)); } catch (_) {} }
