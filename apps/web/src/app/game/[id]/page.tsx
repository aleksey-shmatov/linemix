import { CanvasApp } from '@/components/CanvasApp';
import { isGameId } from '@linemix/model';
import { notFound } from 'next/navigation';

export const instant = false;

export default async function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isGameId(id)) {
    notFound();
  }
  return <CanvasApp key={id} gameId={id} />;
}
