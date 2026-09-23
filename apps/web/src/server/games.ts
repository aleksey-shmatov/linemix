'use server';
import { CreateGameSchema, type Game } from '@linemix/model';
import { newGameId } from '@linemix/model';
import { z } from 'zod';

const g = globalThis as unknown as { __games?: Game[] };
const games = (g.__games ??= []);

export async function getGames() {
  return games;
}

export async function createGame(params: z.infer<typeof CreateGameSchema>) {
  const parsed = CreateGameSchema.safeParse(params);
  if (!parsed.success) {
    return { ok: false as const, reason: 'invalid' };
  }
  const game = { id: newGameId(), name: parsed.data.name, createdAt: Date.now() };
  games.push(game);
  return { ok: true as const, game };
}
