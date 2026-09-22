import type { GameId, Verdict } from '@linemix/model';

export type GuessResult = Verdict & { accepted: boolean; latencyMs: number };

export async function postGuess(gameId: GameId, guess: string): Promise<GuessResult> {
  const res = await fetch(`/api/games/${gameId}/guess`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ guess }),
  });
  if (!res.ok) throw new Error(res.status === 502 ? 'judge' : 'request');
  return res.json();
}
