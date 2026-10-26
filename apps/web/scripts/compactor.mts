import { createClient } from '@supabase/supabase-js';
import * as Y from 'yjs';
import { fromBase64, toBase64 } from '../src/lib/base64.ts';
import type { Database } from '../src/lib/supabase/database.types';

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321';
const SECRET = process.env.SUPABASE_SECRET_KEY;
if (!SECRET) {
  throw new Error('SUPABASE_SECRET_KEY is required. Get it from: supabase status -o env');
}

const admin = createClient<Database>(URL_, SECRET, { auth: { persistSession: false } });

async function compactDocSnapshots(gameId: string) {
  const cutoff = new Date(Date.now() - 60000).toISOString();
  const updateRows = await admin
    .from('doc_updates')
    .select('seq, update')
    .eq('game_id', gameId)
    .lte('at', cutoff);
  if (updateRows.error) {
    throw updateRows.error;
  }
  if (!updateRows.data.length) {
    console.log('No updates found for game ID:', gameId);
    return;
  }
  const existingSnapshot = await admin
    .from('doc_snapshots')
    .select('update')
    .eq('game_id', gameId)
    .maybeSingle();
  if (existingSnapshot.error) {
    throw existingSnapshot.error;
  }

  const updates = existingSnapshot.data
    ? [existingSnapshot.data, ...updateRows.data]
    : (updateRows.data ?? []);

  const seqs = updateRows.data.map((row) => row.seq);
  const mergeUpdates = Y.mergeUpdates(updates.map((row) => fromBase64(row.update)));
  const seq = updateRows.data.length ? Math.max(...updateRows.data.map((row) => row.seq)) : 0;
  // Due to Idempotence of Yjs there is no need to create snapshot and delete inside a transaction.
  const { error } = await admin.from('doc_snapshots').upsert({
    game_id: gameId,
    update: mergeUpdates ? toBase64(mergeUpdates) : '',
    at: new Date().toISOString(),
    merged_seq: seq,
  });
  if (error) {
    console.error('Error upserting doc snapshot:', error);
    throw error;
  }
  const deleteResult = await admin
    .from('doc_updates')
    .delete()
    .eq('game_id', gameId)
    .in('seq', seqs);
  if (deleteResult.error) {
    console.error('Error deleting doc updates:', deleteResult.error);
    throw deleteResult.error;
  }
  const inBytes = updateRows.data.reduce((n, r) => n + r.update.length, 0);
  const outBytes = toBase64(mergeUpdates).length;
  console.log(
    `[compact] ${gameId}: ${updateRows.data.length} rows, ${inBytes} b in → ` +
      `${outBytes} b snapshot (${((1 - outBytes / inBytes) * 100).toFixed(1)}% smaller), ` +
      `merged_seq=${seq}`,
  );
}

async function compactAllGames() {
  const { data, error } = await admin.from('games').select('id');
  if (error) throw error;
  for (const game of data) {
    await compactDocSnapshots(game.id);
  }
}

const arg = process.argv[2];
const gameId = arg;
if (!gameId) {
  await compactAllGames();
} else {
  await compactDocSnapshots(gameId);
}
