import { test, before, after } from 'node:test';
import { createClient } from '@supabase/supabase-js';
import assert from 'node:assert/strict';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// three ordinary clients — the roles the policies see
const anon = createClient(URL, KEY);
const alice = createClient(URL, KEY);
const bob = createClient(URL, KEY);

// the privileged one: same function, different key
const admin = createClient(URL, process.env.SUPABASE_SECRET_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let aliceId: string, bobId: string, privateGame: string, openGame: string;

const TAG = '__test__';

async function sweep() {
  await admin.from('games').delete().like('name', `${TAG}%`);
}

before(async () => {
  await sweep(); // leftovers from a crashed run

  const a = await alice.auth.signInAnonymously();
  const b = await bob.auth.signInAnonymously();
  if (a.error) throw a.error; // e.g. anonymous_provider_disabled
  if (b.error) throw b.error;
  aliceId = a.data.user!.id;
  bobId = b.data.user!.id;

  const { data, error } = await alice
    .from('games')
    .insert([
      { name: `${TAG}secret`, owner_id: aliceId, visibility: 'private' },
      { name: `${TAG}shared`, owner_id: aliceId, visibility: 'open' },
    ])
    .select();
  if (error) throw error;
  if (!data) throw new Error('insert returned no rows');

  privateGame = data.find((g) => g.visibility === 'private')!.id;
  openGame = data.find((g) => g.visibility === 'open')!.id;
});

after(async () => {
  await sweep(); // by tag, not by id
  if (aliceId) await admin.auth.admin.deleteUser(aliceId);
  if (bobId) await admin.auth.admin.deleteUser(bobId);
});

test('bob cannot draw in a private game', async () => {
  const { data, error } = await bob
    .from('game_docs')
    .update({ doc: { strokes: [{ id: 'x' }] } })
    .eq('game_id', privateGame)
    .select();
  assert.equal(error, null);
  assert.deepEqual(data, []);
});

test('bob can draw in an open game', async () => {
  const { data, error } = await bob
    .from('game_docs')
    .update({ doc: { strokes: [{ id: 'x' }] } })
    .eq('game_id', openGame)
    .select();
  assert.equal(error, null);
  assert.notDeepEqual(data, []);
});

test('an anonymous client cannot read a private game', async () => {
  const { data, error } = await anon.from('games').select().eq('id', privateGame);
  assert.equal(error, null);
  assert.deepEqual(data, []);
});

test('a player in an open game can update the doc but cannot change owner_id', async () => {
  const { data, error } = await bob
    .from('games')
    .update({ owner_id: bobId, name: `${TAG}_renamed` })
    .eq('id', openGame)
    .select();
  assert.equal(error, null);
  assert.deepEqual(data, []);
});

test('service role can bypass RLS and update any game', async () => {
  const { data, error } = await admin
    .from('games')
    .update({ name: 'new name' })
    .eq('id', privateGame)
    .select();
  assert.equal(error, null);
  assert.deepEqual(data.length, 1);
});
