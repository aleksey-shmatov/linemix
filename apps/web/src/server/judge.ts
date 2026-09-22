import 'server-only';
import type { Verdict } from '@linemix/model';

export async function judge(guess: string): Promise<Verdict & { latencyMs: number }> {
  const latencyMs = 1500 + Math.random() * 2000;
  await new Promise((r) => setTimeout(r, latencyMs)); // realistic wait — you need it to see pending states
  if (guess.toLowerCase() === 'fail') throw new Error('judge failed'); // test the error path on demand
  return {
    match: guess.length % 2 ? 0.8 : 0.3,
    latencyMs,
  };
}
