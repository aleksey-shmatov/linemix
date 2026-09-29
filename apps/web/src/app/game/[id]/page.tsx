import { CanvasApp } from '@/components/CanvasApp';
import { currentAuthor } from '@/server/identity';
import { isGameId } from '@linemix/model';
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
  const me = await currentAuthor();
  if (!me) return <CookiesRequired />;

  if (!isGameId(id)) {
    notFound();
  }

  return <CanvasApp key={id} gameId={id} me={me} />;
}
