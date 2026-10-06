import 'server-only';
import { createClient } from '@/lib/supabase/client';
import {
  type Game,
  type DocState,
  type GameId,
  type AuthorId,
  GameSchema,
  type Visibility,
  CreateGameSchema,
  newGameId,
} from '@linemix/model';
import type { Database } from '@/lib/supabase/database.types';
import { currentAuthor } from './identity';
import z from 'zod';
import { StrokesSchema } from '@linemix/model';

type GameRow = Database['public']['Tables']['games']['Row'];
type DocColumn = NonNullable<GameRow['doc']>;    // strips the `| undefined`

type PersistedDoc = z.infer<typeof DocSchema>;

const DocSchema = z.object({
  strokes: StrokesSchema,
});

function toDoc(row: Omit<GameRow, 'doc'> & { doc: DocColumn }): PersistedDoc {
  return DocSchema.parse(row.doc);
}

function toGame(row: Omit<GameRow, 'doc'>): Game {
  return GameSchema.parse({
    id: row.id,
    name: row.name,
    ownerId: row.owner_id,
    visibility: row.visibility,
    createdAt: Date.parse(row.created_at),
    publishedAt: row.published_at ? Date.parse(row.published_at) : null,
  });
}

export async function getGame(id: GameId): Promise<Game | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('games').select('id, name, owner_id, visibility, created_at, published_at').eq('id', id).maybeSingle();

  if (error) throw error;
  return data ? toGame(data) : null;
}

export async function getGameWithDoc(
  id: GameId,
): Promise<{ game: Game; doc: PersistedDoc } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('games')
    .select('*')              // includes doc
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return { game: toGame(data), doc: toDoc(data) };
}

export async function listGames(): Promise<Game[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('games')
    .select('id, name, owner_id, visibility, created_at, published_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data.map(toGame);
}

export async function insertGame(input: {
  id: GameId;
  name: string;
  ownerId: AuthorId;
  visibility: Visibility;
}): Promise<Game> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('games')
    .insert({
      id: input.id,
      name: input.name,
      owner_id: input.ownerId, // ← column name, not domain name
      visibility: input.visibility,
    })
    .select()
    .single();

  if (error) throw error;
  return toGame(data);
}

export async function saveDoc(id: GameId, doc: DocState): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('games')
    .update({ doc: doc as unknown as DocColumn })
    .eq('id', id);

  if (error) throw error;
}

export async function createGame(params: z.infer<typeof CreateGameSchema>) {
  const parsed = CreateGameSchema.safeParse(params);
  if (!parsed.success) {
    return { ok: false as const, reason: 'invalid' };
  }
  const me = await currentAuthor();
  if (!me) {
    return { ok: false as const, reason: 'forbidden' as const };
  }
  const game = {
    id: newGameId(),
    name: parsed.data.name,
    createdAt: Date.now(),
    ownerId: me,
    visibility: 'public' as const,
  };
  await insertGame({
    id: game.id,
    name: game.name,
    ownerId: game.ownerId,
    visibility: game.visibility,
  });
  return { ok: true as const, game };
}
