import 'server-only';
import type { Game } from '@linemix/model';

const g = globalThis as unknown as { __games?: Game[] };
export const games = (g.__games ??= []);