export default function Loading() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 p-8">
      <div className="h-6 w-32 animate-pulse rounded bg-neutral-100" />
      <div className="aspect-square w-full max-w-xl animate-pulse rounded-lg border bg-neutral-100" />
    </main>
  );
}
