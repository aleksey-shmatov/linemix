import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getPublished } from '@/server/published';
import { GameId, isGameId, strokesToSvg } from '@linemix/model';
import { cacheTag } from 'next/cache';
import Link from 'next/link';
import { RelativeTime } from '@/components/RelativeTime';

async function PublishedDrawing({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isGameId(id)) notFound();
  return <CachedDrawing id={id} />;
}

async function CachedDrawing({ id }: { id: GameId }) {
  'use cache';
  cacheTag(id);
  const game = await getPublished(id);
  if (!game) notFound();
  const svg = strokesToSvg(game.strokes, { size: 1000, background: '#ffffff' });
  return (
    <figure className="m-0 space-y-2">
      <div
        className="[&>svg]:block [&>svg]:h-auto [&>svg]:w-full [&>svg]:rounded-lg [&>svg]:border [&>svg]:bg-white"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <figcaption className="flex items-baseline justify-between text-sm text-neutral-600">
        <span>{game.title}</span>
        <RelativeTime at={game.publishedAt} />
      </figcaption>
    </figure>
  );
}

function DrawingSkeleton() {
  return <div className="aspect-square w-full animate-pulse rounded-lg border bg-neutral-100" />;
}

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main className="mx-auto max-w-2xl space-y-6 p-8">
      <header className="flex items-baseline justify-between">
        <h1 className="text-lg font-semibold">Linemix</h1>
        <Link href="/gallery" className="text-sm text-neutral-500 hover:underline">
          ← Gallery
        </Link>
      </header>
      <Suspense fallback={<DrawingSkeleton />}>
        <PublishedDrawing params={params} />
      </Suspense>
    </main>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isGameId(id)) notFound();
  const game = await getPublished(id);
  if (!game) notFound();
  return { title: game.title, description: 'Drawn collaboratively. Nobody knew what it was.' };
}
