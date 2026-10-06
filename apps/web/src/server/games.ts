import 'server-only';
import { createClient } from '@/lib/supabase/server';
import {
  type Game,
  type GameId,
  type AuthorId,
  type Visibility,
  GameSchema,
  StrokesSchema,
} from '@linemix/model';
import type { Database } from '@/lib/supabase/database.types';
import { z } from 'zod';

type GameRow = Database['public']['Tables']['games']['Row'];
type GameDocRow = Database['public']['Tables']['game_docs']['Row'];
type DocColumn = NonNullable<GameDocRow['doc']>;

export const PersistedDocSchema = z.object({ strokes: StrokesSchema });
export type PersistedDoc = z.infer<typeof PersistedDocSchema>;

/** PersistedDoc is structurally JSON; the cast exists only because our arrays
 *  are readonly and Json's are not. The real guard is the parse on read. */
function toJson(doc: PersistedDoc): DocColumn {
  return doc as unknown as DocColumn;
}

function toGame(row: GameRow): Game {
  return GameSchema.parse({
    id: row.id,
    name: row.name,
    ownerId: row.owner_id,
    visibility: row.visibility,
    createdAt: Date.parse(row.created_at),
    publishedAt: row.published_at ? Date.parse(row.published_at) : null,
  });
}

function toDoc(row: Pick<GameDocRow, 'doc'>): PersistedDoc {
  return PersistedDocSchema.parse(row.doc);
}

export async function getGame(id: GameId): Promise<Game | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data ? toGame(data) : null;
}

export async function getGameWithDoc(
  id: GameId,
): Promise<{ game: Game; doc: PersistedDoc } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('games')
    .select('*, game_docs(doc)')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  // PostgREST returns an object or a one-element array depending on how it
  // reads the relationship; normalise rather than guess.
  const embedded = Array.isArray(data.game_docs) ? data.game_docs[0] : data.game_docs;
  if (!embedded) throw new Error(`game ${id} has no doc row`);

  return { game: toGame(data), doc: toDoc(embedded) };
}

export async function listGames(): Promise<Game[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('games')
    .select('*')
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
      owner_id: input.ownerId,
      visibility: input.visibility,
    })
    .select()
    .single();

  if (error) throw error;
  return toGame(data);
}

export async function saveDoc(id: GameId, doc: PersistedDoc): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('game_docs')
    .update({ doc: toJson(doc), updated_at: new Date().toISOString() })
    .eq('game_id', id);

  if (error) throw error;
}