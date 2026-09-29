import 'server-only';
import { cookies } from 'next/headers';
import { isAuthorId, type AuthorId } from '@linemix/model';

export async function currentAuthor(): Promise<AuthorId | undefined> {
  const raw = (await cookies()).get('authorId')?.value;
  return raw && isAuthorId(raw) ? raw : undefined;
}
