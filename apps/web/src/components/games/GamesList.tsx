import Link from 'next/link';
import { listGames } from '@/server/games';
import { NewGameForm } from '@/components/games/NewGameForm';

export async function GamesList() {
  const games = await listGames();
  return (
    <main className="mx-auto max-w-md space-y-6 p-8">
      <h1 className="text-2xl font-semibold">Games</h1>
      <NewGameForm />
      <ul className="space-y-2">
        {games.map((g) => (
          <li key={g.id}>
            <Link href={`/game/${g.id}`}>{g.name}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}