// World order and level modifiers. Plain data, so the rules in modes/ can use it without a canvas.
export const ORDER = ['weide', 'strand', 'stadt', 'winter', 'meer', 'all'];
export const MODS = {
  night: ['Nacht', 'Stockdunkel. Deine Lupe wird zur Taschenlampe.'],
  move: ['Gewusel', 'Alle laufen herum. Die Kuh auch.'],
  twins: ['Doppelgänger', 'Viele Flecken, nur eine echte Kuh.'],
  tiny: ['Mini-Kuh', 'Die Kuh ist geschrumpft.']
};
// Boss levels of the challenge mode, in the order they come (every fifth level).
export const BOSSES = {
  herd: { name: 'Die Kuhbande', tag: 'Drei Kühe haben sich versteckt. Finde alle drei.' },
  flee: { name: 'Die Ausreißerin', tag: 'Jeder Fehlklick verscheucht sie an eine andere Stelle.' },
  wanted: { name: 'Steckbrief', tag: 'Lauter Doppelgängerinnen. Gesucht ist nur eine.' }
};
export const BOSS_ORDER = ['herd', 'flee', 'wanted'];
// What the wanted cow wears in each world.
export const WANTED = { weide: 'mit Blume', strand: 'mit Sonnenbrille', stadt: 'mit Schiebermütze', winter: 'mit Mütze', meer: 'mit Taucherhelm', all: 'mit Raumhelm' };
