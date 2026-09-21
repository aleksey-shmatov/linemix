import { CanvasApp } from '@/components/CanvasApp';

export default async function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CanvasApp key={id} />;
}
