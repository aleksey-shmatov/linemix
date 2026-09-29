'use server';
import { can } from './permissions';
import { getGame } from './games';
import { z } from 'zod';
import { judge } from './judge';
import { GameIdSchema, StrokeSchema } from '@linemix/model';
import { savePublished } from './published';
import { updateTag } from 'next/cache';
import { currentAuthor } from './identity';

const Body = z.object({ guess: z.string().trim().min(1).max(40) });
const THRESHOLD = 0.7;

export async function submitGuess({ guess }: z.infer<typeof Body>) {
  const body = Body.safeParse({ guess });
  if (!body.success) return { ok: false as const, reason: 'invalid' as const };
  try {
    const verdict = await judge(body.data?.guess);
    return { ok: true as const, accepted: verdict.match >= THRESHOLD };
  } catch {
    return { ok: false as const, reason: 'unavailable' as const };
  }
}

const PublishInput = z.object({
  id: GameIdSchema,
  title: z.string().trim().min(1).max(60),
  strokes: z.array(StrokeSchema).max(2000).readonly(),
});

export async function publishGame(input: z.infer<typeof PublishInput>) {
  const parsed = PublishInput.safeParse(input);
  if (!parsed.success) {
    console.error('publish input invalid', parsed.error.issues);
    return { ok: false as const, reason: 'invalid' as const };
  }
  const me = await currentAuthor();

  // 3. fetch the subject
  const game = await getGame(parsed.data.id);
  if (!game) return { ok: false as const, reason: 'not_found' as const };
  if (!can(me, game, 'publish')) return { ok: false as const, reason: 'forbidden' as const };

  savePublished({ ...parsed.data, publishedAt: Date.now() });
  updateTag('gallery');
  updateTag(parsed.data.id);
  return { ok: true as const };
}
