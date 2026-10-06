import { z } from 'zod';
import type { StrokeId, GameId } from '../ids.ts';
import type { Stroke } from '../model.ts';

export const PointSchema = z.object({
  x: z.number(),
  y: z.number(),
  p: z.number().min(0).max(1).optional(),
});

export const ColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/);
export const WidthSchema = z.number().min(0.5).max(50);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isGameId(v: unknown): v is GameId {
  return typeof v === 'string' && UUID.test(v);
}

export const GameIdSchema = z.string().refine(isGameId, {
  message: 'must be a valid UUID',
});

const isStrokeId = (s: string): s is StrokeId => s.startsWith('stroke_');

export const StrokeIdSchema = z.string().refine(isStrokeId, {
  message: 'must start with stroke_',
});

export const StrokeSchema = z.object({
  id: StrokeIdSchema,
  points: z.array(PointSchema).min(2).readonly(),
  authorId: z.string(),
  color: ColorSchema,
  width: WidthSchema,
  schemaVersion: z.literal(1),
}) satisfies z.ZodType<Stroke>;

export const StrokesSchema = z.array(StrokeSchema).min(0).max(2000).readonly();
