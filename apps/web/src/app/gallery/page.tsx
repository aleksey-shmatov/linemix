import Link from 'next/link';
import { cacheTag } from 'next/cache';
import { strokesToSvg } from '@linemix/model';
import { listPublished } from '@/server/published';
import { RelativeTime } from '@/components/RelativeTime';

async function Thumbnails() {
  'use cache';
  cacheTag('gallery');

  const games = await listPublished();

  if (games.length === 0) {
    return <p className="text-sm text-neutral-500">Nothing published yet.</p>;
  }

  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {games.map((g) => (
        <li key={g.id}>
          <Link href={`/g/${g.id}`} className="group block space-y-2">
            <div
              className="[&>svg]:block [&>svg]:h-auto [&>svg]:w-full [&>svg]:rounded-lg [&>svg]:border [&>svg]:bg-white group-hover:[&>svg]:border-neutral-400"
              dangerouslySetInnerHTML={{ __html: strokesToSvg(g.strokes) }}
            />
            <div className="flex items-baseline justify-between text-xs">
              <span className="truncate text-neutral-700">{g.title}</span>
              <RelativeTime at={g.publishedAt} />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function GalleryPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 p-8">
      <h1 className="text-lg font-semibold">Gallery</h1>
      <Thumbnails />
    </main>
  );
}
