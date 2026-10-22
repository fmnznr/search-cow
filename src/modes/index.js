// All modes by id and the one the current run uses.
import { G } from '../game/state.js';
import { classic } from './classic.js';
import { challenge } from './challenge.js';
import { chill } from './chill.js';

export const MODES = { classic, challenge, chill };
export const currentMode = () => MODES[G.mode] || classic;
