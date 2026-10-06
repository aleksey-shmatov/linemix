import { GamesList } from '@/components/games/GamesList';
import { Suspense } from 'react';

export default async function Home() {
  return (
    <Suspense fallback={<p className="text-sm text-neutral-500">Loading games…</p>}>
      <GamesList />
    </Suspense>
  );
}
