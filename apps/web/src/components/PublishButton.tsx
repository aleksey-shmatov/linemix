'use client';
import { useActionState } from 'react';
import { Upload } from 'lucide-react';
import { publishGame } from '@/server/actions';
import type { Store, GameId } from '@linemix/model';

type PublishState = { status: 'idle' } | { status: 'done' } | { status: 'error'; message: string };

export function PublishButton({ store, gameId }: { store: Store; gameId: GameId }) {
  const [state, submit, pending] = useActionState(
    async (_prev: PublishState, fd: FormData): Promise<PublishState> => {
      const strokes = store.getState().strokes;
      if (strokes.length === 0) return { status: 'error', message: 'Nothing to publish yet' };

      const res = await publishGame({
        id: gameId,
        title: String(fd.get('title') ?? '').trim(),
        strokes,
      });
      return res.ok ? { status: 'done' } : { status: 'error', message: res.reason };
    },
    { status: 'idle' },
  );

  return (
    <form action={submit} className="flex items-center gap-2">
      <input
        name="title"
        placeholder="Title"
        maxLength={60}
        className="w-40 rounded border px-2 py-1 text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="flex items-center gap-1 rounded bg-neutral-900 px-3 py-1 text-sm text-white disabled:opacity-50"
      >
        <Upload className="size-3.5" />
        {pending ? 'Publishing…' : 'Publish'}
      </button>
      {state.status === 'error' && <span className="text-xs text-red-600">{state.message}</span>}
      {state.status === 'done' && <span className="text-xs text-green-700">Published</span>}
    </form>
  );
}
