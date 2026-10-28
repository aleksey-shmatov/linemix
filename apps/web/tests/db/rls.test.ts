import { test, before, after } from 'node:test';
import { createClient } from '@supabase/supabase-js';
import assert from 'node:assert/strict';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321';
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!publishableKey || !secretKey) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY and SUPABASE_SECRET_KEY are required. ' +
      'Get them from: supabase status -o env',
  );
}

// three ordinary clients — the roles the policies see
const anon = createClient(url, publishableKey);
const alice = createClient(url, publishableKey);
const bob = createClient(url, publishableKey);

// the privileged one: same function, different key
const admin = createClient(url, secretKey, {
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
    .from('doc_updates')
    .insert({ game_id: privateGame, update: 'AQ==' });
  assert.notEqual(error, null);
  assert.deepEqual(data, null);
});

test('bob can draw in an open game', async () => {
  const { data, error } = await bob
    .from('doc_updates')
    .insert({ game_id: openGame, update: 'AQ==' });
  assert.equal(error, null);
  assert.notDeepEqual(data, []);
});

test('alice can draw in her own private game', async () => {
  const { data, error } = await alice
    .from('doc_updates')
    .insert({ game_id: privateGame, update: 'AQ==' })
    .select();

  assert.equal(error, null);
  assert.equal(data?.length, 1);
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

test('authenticated clients cannot write snapshots', async () => {
  await admin.auth.signInAnonymously();

  const { data, error } = await admin.from('doc_snapshots').insert({
    game_id: privateGame,
    update: 'AAAA',
    merged_seq: 1,
  });

  assert.notEqual(error, null);
  assert.equal(error?.code, '42501');
  assert.equal(data, null);
});
