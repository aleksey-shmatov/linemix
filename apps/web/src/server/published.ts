import 'server-only';
import type { GameId, PublishedGame } from '@linemix/model';

declare global {
  var __published: Map<GameId, PublishedGame> | undefined;
}

const store = (globalThis.__published ??= new Map());

export function savePublished(game: PublishedGame): void {
  store.set(game.id, game);
}

export function getPublished(id: GameId): PublishedGame | undefined {
  return store.get(id);
}

export function listPublished(): PublishedGame[] {
  return [...store.values()].sort((a, b) => b.publishedAt - a.publishedAt);
}
