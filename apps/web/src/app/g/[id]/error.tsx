'use client';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error); // your logging service later
  }, [error]);

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-8 text-center">
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="text-sm text-neutral-500">We couldn&apos;t load this drawing.</p>
      <button onClick={reset} className="rounded bg-neutral-900 px-3 py-1 text-sm text-white">
        Try again
      </button>
    </main>
  );
}
