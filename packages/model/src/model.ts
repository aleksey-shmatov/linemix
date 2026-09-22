import type { StrokeId, AuthorId, EventId } from './ids.ts';
import { z } from 'zod';

export type Point = { readonly x: number; readonly y: number; readonly p?: number };

export type Stroke = {
  readonly id: StrokeId;
  readonly points: readonly Point[]; // immutable — geometry is identity
  readonly authorId: AuthorId;
  readonly schemaVersion: 1;
  color: string; // mutable — anyone, any time
  width: number;
};

export type StrokePatch = { color?: string; width?: number };

export type Verdict = {
  readonly match: number; // 0 - 1
};

export type DocEvent =
  | { id: EventId; kind: 'stroke_added'; stroke: Stroke; authorId: AuthorId; at: number }
  | {
      id: EventId;
      kind: 'stroke_updated';
      strokeId: StrokeId;
      patch: StrokePatch;
      authorId: AuthorId;
      at: number;
    }
  | { id: EventId; kind: 'stroke_removed'; strokeId: StrokeId; authorId: AuthorId; at: number }
  | {
      id: EventId;
      kind: 'guess_made';
      guess: string;
      authorId: AuthorId;
      verdict: Verdict;
      at: number;
    };

export type GameId = `game_${string}`;
export type Game = { readonly id: GameId; readonly name: string; readonly createdAt: number };
export const gameId = (): GameId => `game_${crypto.randomUUID()}`;
export const isGameId = (id: string): id is GameId => id.startsWith('game_');
export const CreateGameSchema = z.object({ name: z.string().trim().min(1).max(60) });
