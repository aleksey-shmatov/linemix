import { z } from 'zod';
import type { StrokeId, AuthorId, GameId } from '../ids.ts';
import type { Stroke } from '../model.ts';

export const PointSchema = z.object({
  x: z.number(),
  y: z.number(),
  p: z.number().min(0).max(1).optional(),
});

export const ColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/);
export const WidthSchema = z.number().min(0.5).max(50);

export const isGameId = (s: string): s is GameId => s.startsWith('game_');
export const GameIdSchema = z.string().refine(isGameId, {
  message: 'must start with game_',
});

export const isAuthorId = (s: string): s is AuthorId => s.startsWith('author_');
export const AuthorIdSchema = z.string().refine(isAuthorId, {
  message: 'must start with author_',
});

const isStrokeId = (s: string): s is StrokeId => s.startsWith('stroke_');

export const StrokeIdSchema = z.string().refine(isStrokeId, {
  message: 'must start with stroke_',
});

export const StrokeSchema = z.object({
  id: StrokeIdSchema,
  points: z.array(PointSchema).min(2).readonly(),
  authorId: AuthorIdSchema,
  color: ColorSchema,
  width: WidthSchema,
  schemaVersion: z.literal(1),
}) satisfies z.ZodType<Stroke>;
