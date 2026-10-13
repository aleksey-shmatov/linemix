import 'server-only';
import * as Y from 'yjs';
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
import { fromBase64 } from '@/lib/base64';

type GameRow = Database['public']['Tables']['games']['Row'];

export const PersistedDocSchema = z.object({ strokes: StrokesSchema });
export type PersistedDoc = z.infer<typeof PersistedDocSchema>;

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

export async function getGame(id: GameId): Promise<Game | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('games').select('*').eq('id', id).maybeSingle();

  if (error) throw error;
  return data ? toGame(data) : null;
}

type DocUpdateRow = { update: string };

export async function getGameWithDoc(
  id: GameId,
): Promise<{ game: Game; update: Uint8Array | null } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('games')
    .select('*, doc_updates(update)')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  const rows = (data.doc_updates ?? []) as DocUpdateRow[];
  const update = rows.length ? Y.mergeUpdates(rows.map((r) => fromBase64(r.update))) : null;

  return { game: toGame(data), update };
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
