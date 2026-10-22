// All modes by id and the one the current run uses.
import { G } from '../game/state.js';
import { classic } from './classic.js';

export const MODES = { classic };
export const currentMode = () => MODES[G.mode] || classic;
