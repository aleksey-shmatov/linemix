import { z } from 'zod';
import { GameIdSchema } from './primitives.ts';
import type { Game } from '../index.ts';

const GameSchema = z.object({
  id: GameIdSchema,
  ownerId: z.string(),
  name: z.string(),
  createdAt: z.number().int().positive(),
  publishedAt: z.number().int().positive().nullable(),
  visibility: z.enum(['private', 'public', 'open']),
}) satisfies z.ZodType<Game>;

export { GameSchema };
