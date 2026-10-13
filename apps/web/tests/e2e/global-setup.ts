import { existsSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

export default async function globalSetup() {
  if (existsSync('.env.test')) process.loadEnvFile('.env.test');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321';
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) {
    throw new Error(
      'SUPABASE_SECRET_KEY is required for the e2e sweep. Get it from: supabase status -o env',
    );
  }

  const admin = createClient(url, secret);
  const { error } = await admin.from('games').delete().like('name', '__test__%');
  if (error) throw error;
}
