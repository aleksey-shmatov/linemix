import { CanvasApp } from '@/components/CanvasApp';
import { getGameWithDoc } from '@/server/games';
import { currentAuthor } from '@/server/identity';
import { isGameId, GameId } from '@linemix/model';
import { notFound } from 'next/navigation';

export const instant = false;

function CookiesRequired() {
  return (
    <main className="p-8 text-sm text-neutral-600">
      This game needs cookies enabled to know who&apos;s drawing.
    </main>
  );
}

export default async function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isGameId(id)) {
    notFound();
  }

  return <GameCanvas id={id} />;
}

async function GameCanvas({ id }: { id: GameId }) {
  const me = await currentAuthor();
  if (!me) return <CookiesRequired />;
  const found = await getGameWithDoc(id);
  if (!found) notFound();
  return <CanvasApp key={id} gameId={id} me={me} doc={found.doc} />;
}
