// apps/web/scripts/rt-check.mts
import { createClient } from '@supabase/supabase-js';

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!URL_ || !KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are required');
}

const topic = process.argv[2];
if (!topic) {
  console.error('Usage: rt-check.mts <game-id>');
  process.exit(1);
}

// Publishable key, never the secret key — the secret key bypasses RLS
// and would subscribe to anything, which would make this test meaningless.
const supabase = createClient(URL_, KEY, { auth: { persistSession: false } });

const { error: authError } = await supabase.auth.signInAnonymously();
if (authError) throw authError;

supabase.channel(topic, { config: { private: true } }).subscribe((status, err) => {
  console.log(status, err?.message ?? '');
  if (status === 'SUBSCRIBED' || status === 'CHANNEL_ERROR') process.exit(0);
});

setTimeout(() => {
  console.error('timeout — no terminal status in 10s');
  process.exit(2);
}, 10_000);
