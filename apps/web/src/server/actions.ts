'use server';
import { insertGame, saveDoc } from './games';
import { CreateGameSchema, GameId, newGameId, Stroke, StrokesSchema } from '@linemix/model';
import { can } from './permissions';
import { getGame } from './games';
import { z } from 'zod';
import { judge } from './judge';
import { GameIdSchema, StrokeSchema } from '@linemix/model';
import { savePublished } from './published';
import { revalidatePath, updateTag } from 'next/cache';
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
  if (!me || !can(me, game, 'publish')) return { ok: false as const, reason: 'forbidden' as const };

  savePublished({ ...parsed.data, publishedAt: Date.now() });
  updateTag('gallery');
  updateTag(parsed.data.id);
  return { ok: true as const };
}

export async function createGame(_prev: unknown, formData: FormData) {
  const parsed = CreateGameSchema.safeParse({ name: formData.get('name') });
  if (!parsed.success) {
    console.error(parsed.error.issues);
    return { ok: false as const, reason: 'invalid' as const };
  }

  const me = await currentAuthor();
  if (!me) return { ok: false as const, reason: 'forbidden' as const };

  try {
    const game = await insertGame({
      id: newGameId(),
      name: parsed.data.name,
      ownerId: me,
      visibility: 'open',
    });
    revalidatePath('/');
    return { ok: true as const, game };
  } catch (e) {
    console.error(e);
    return { ok: false as const, reason: 'failed' as const };
  }
}

export async function saveStrokes(gameId: GameId, strokes: readonly Stroke[]) {
  const id = GameIdSchema.safeParse(gameId);
  const parsed = StrokesSchema.safeParse(strokes);
  if (!id.success || !parsed.success) {
    console.error('saveStrokes input invalid', {
      id: id.success ? undefined : id.error.issues,
      strokes: parsed.success ? undefined : parsed.error.issues,
    });
    return { ok: false as const, reason: 'invalid' as const };
  }

  const me = await currentAuthor();
  const game = await getGame(id.data);
  if (!me || !game || !can(me, game, 'draw'))
    return { ok: false as const, reason: 'forbidden' as const };

  await saveDoc(id.data, { strokes: parsed.data });
  return { ok: true as const };
}
