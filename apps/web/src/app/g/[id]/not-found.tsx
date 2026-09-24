import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl space-y-4 p-8 text-center">
      <h1 className="text-lg font-semibold">Drawing not found</h1>
      <p className="text-sm text-neutral-500">
        It may not have been published yet, or the link is wrong.
      </p>
      <Link href="/gallery" className="text-sm underline">
        Browse the gallery
      </Link>
    </main>
  );
}
