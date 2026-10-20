// apps/web/scripts/bench/teardown.ts
import { createClient } from '@supabase/supabase-js';

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321';
const SECRET = process.env.SUPABASE_SECRET_KEY;
if (!SECRET) throw new Error('SUPABASE_SECRET_KEY is required.');

const admin = createClient(URL_, SECRET, { auth: { persistSession: false } });

// games first — doc_updates goes with them via the cascade
const { error } = await admin.from('games').delete().like('name', '__bench__%');
if (error) throw error;

const { data } = await admin.auth.admin.listUsers();
for (const user of data.users) {
  if (user.email?.startsWith('bench+')) {
    await admin.auth.admin.deleteUser(user.id);
  }
}
console.log('bench data removed');
