// The cow album: one sticker per world and kind of find. Plain data, so it can be unit tested.
import { ORDER } from './catalog.js';

export const KINDS = [['normal', 'Kuh'], ['gold', 'Gold'], ['night', 'Nacht'], ['move', 'Gewusel'], ['twins', 'Doppel'], ['tiny', 'Mini']];
export const STICKERS = ORDER.flatMap(world => KINDS.map(([kind]) => `${world}:${kind}`));

// Stickers earned by finding the cow in this scene: the world's own one, plus gold and one per modifier.
export function stickersFor({ world, golden, mods }) {
  const keys = [`${world}:normal`];
  if (golden) keys.push(`${world}:gold`);
  for (const m of mods) keys.push(`${world}:${m}`);
  return keys;
}
