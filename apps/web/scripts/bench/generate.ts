import * as Y from 'yjs';
import { createYjsStore } from '@linemix/model';
import { toBase64 } from '../../src/lib/base64.ts';
import { createClient } from '@supabase/supabase-js';
import type { AuthorId, StrokeId } from '@linemix/model';
import { newStrokeId } from '@linemix/model';
import { PALETTE, WIDTHS } from '../../src/pallete.ts';

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321';
const SECRET = process.env.SUPABASE_SECRET_KEY;
if (!SECRET) {
  throw new Error('SUPABASE_SECRET_KEY is required. Get it from: supabase status -o env');
}

const admin = createClient(URL_, SECRET, { auth: { persistSession: false } });

const PREFIX = '__bench__';
const TIERS = [10, 100, 500, 1000, 2000];
const FILLER_GAMES = 500;
const FILLER_STROKES = 200;

const authors = await makeAuthors(3);

for (const strokes of TIERS) {
  const rows = generateRows(strokes, authors); // from the previous message
  const id = await createGame(`${PREFIX} ${strokes}`, authors[0]);
  await insertRows(id, rows);
  console.log(`${PREFIX} ${strokes}: ${rows.length} rows, ${rows.join('').length} b64 chars`);
}

for (let i = 0; i < FILLER_GAMES; i++) {
  const rows = generateRows(FILLER_STROKES, authors);
  const id = await createGame(`${PREFIX} filler ${i}`, authors[i % authors.length]);
  await insertRows(id, rows);
  if (i % 50 === 0) console.log(`filler ${i}/${FILLER_GAMES}`);
}

async function makeAuthors(n: number): Promise<AuthorId[]> {
  const ids: AuthorId[] = [];
  for (let i = 0; i < n; i++) {
    const { data, error } = await admin.auth.admin.createUser({
      email: `bench+${i}@example.test`,
      password: crypto.randomUUID(),
      email_confirm: true,
    });
    if (error) throw error;
    ids.push(data.user.id as AuthorId);
  }
  return ids;
}

async function createGame(name: string, ownerId: AuthorId): Promise<string> {
  const { data, error } = await admin
    .from('games')
    .insert({ name, owner_id: ownerId, visibility: 'open' })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

async function insertRows(gameId: string, rows: string[]) {
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500).map((update) => ({ game_id: gameId, update }));
    const { error } = await admin.from('doc_updates').insert(chunk);
    if (error) throw error;
  }
}

function makeStroke(authorId: AuthorId) {
  const n = 5 + Math.floor(Math.random() * 35); // 5–40 points, like a simplified stroke
  return {
    id: newStrokeId(),
    authorId,
    points: Array.from({ length: n }, () => ({
      x: Math.round(Math.random() * 800),
      y: Math.round(Math.random() * 600),
    })),
    color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
    width: WIDTHS[Math.floor(Math.random() * WIDTHS.length)],
    schemaVersion: 1 as const,
  };
}

function generateRows(strokeCount: number, authors: AuthorId[]): string[] {
  const doc = new Y.Doc();
  const store = createYjsStore(doc, authors[0]);

  const pending: Uint8Array[] = [];
  const rows: string[] = [];
  doc.on('update', (u) => pending.push(u));

  const ids: StrokeId[] = [];

  for (let i = 0; i < strokeCount; i++) {
    const author = authors[i % authors.length];

    if (ids.length > 0 && Math.random() < 0.2) {
      // one edit in five is a recolour — a different update shape
      const strokeId = ids[Math.floor(Math.random() * ids.length)];
      store.apply({
        kind: 'stroke_updated',
        authorId: author,
        strokeId,
        patch: { color: PALETTE[0] },
      });
    } else {
      const stroke = makeStroke(author);
      ids.push(stroke.id);
      store.apply({ kind: 'stroke_added', authorId: author, stroke });
    }

    // mirror the 500ms debounce: a few edits merge into one row
    if (pending.length >= 3 + Math.floor(Math.random() * 3)) {
      rows.push(toBase64(Y.mergeUpdates(pending.splice(0))));
    }
  }
  if (pending.length) rows.push(toBase64(Y.mergeUpdates(pending.splice(0))));

  return rows;
}
