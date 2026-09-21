'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useCreateGame, useGames } from '@/hooks/useGames';

export function GamesList() {
  const { data: games, isPending, error } = useGames();
  const create = useCreateGame();
  const [name, setName] = useState('');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    create.mutate(trimmed, { onSuccess: () => setName('') });
  }

  return (
    <main className="mx-auto max-w-md space-y-6 p-8">
      <h1 className="text-2xl font-semibold">Games</h1>

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New game name"
          maxLength={60}
          className="flex-1 rounded border px-3 py-2"
        />
        <button
          type="submit"
          disabled={create.isPending || !name.trim()}
          className="rounded bg-neutral-900 px-4 py-2 text-white disabled:opacity-50"
        >
          Create
        </button>
      </form>

      {create.error && (
        <p className="text-sm text-red-600">Couldn&apos;t create game. Try again.</p>
      )}

      {isPending && <p className="text-neutral-500">Loading…</p>}
      {error && <p className="text-red-600">Couldn&apos;t load games.</p>}

      {games && games.length === 0 && <p className="text-neutral-500">No games yet.</p>}

      <ul className="space-y-2">
        {games?.map((g) => {
          const pending = g.id.startsWith('game_pending_');
          return (
            <li key={g.id}>
              {pending ? (
                <span className="block rounded border px-3 py-2 text-neutral-400">{g.name}</span>
              ) : (
                <Link
                  href={`/game/${g.id}`}
                  className="block rounded border px-3 py-2 hover:bg-neutral-50"
                >
                  {g.name}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
