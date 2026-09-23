'use server';
import { z } from 'zod';
import { judge } from './judge';

const Body = z.object({ guess: z.string().trim().min(1).max(40) });
const THRESHOLD = 0.7;

export async function submitGuess({ guess }: z.infer<typeof Body>) {
  const body = Body.safeParse({ guess });
  if (!body.success) return { ok: false as const, reason: 'invalid' as const };
  try {
    const verdict = await judge(body.data?.guess);
    return { ok: true as const, accepted: verdict.match >= THRESHOLD };
  } catch {
    return { ok: false as const, reason: 'unavailable' as const };
  }
}
