import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { AuthorId } from '@linemix/model';

export async function currentAuthor(): Promise<AuthorId | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? (user.id as AuthorId) : null;
}

export async function requireAuthor(): Promise<AuthorId> {
  const me = await currentAuthor();
  if (!me) throw new Error('unauthenticated');
  return me;
}
