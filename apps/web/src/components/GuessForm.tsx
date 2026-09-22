import { postGuess } from '@/lib/api';
import { useActionState } from 'react';
import type { AuthorId, Store } from '@linemix/model';

type GuessState =
    { status: 'idle' } | { status: 'done'; result: boolean } | { status: 'error'; message: string };

export const GuessForm = ({ store, me }: { store: Store; me: AuthorId }) => {
    const [state, submit, pending] = useActionState(
        async (_prev: GuessState, fd: FormData): Promise<GuessState> => {
            const guess = String(fd.get('guess') ?? '').trim();
            try {
                console.warn('Submitting guess:', guess);
                const result = await postGuess('game_lol', guess);
                return { status: 'done', result: result.accepted };
            } catch (e) {
                return {
                    status: 'error',
                    message:
                        e instanceof Error && e.message === 'judge'
                            ? 'The judge is unavailable — try again'
                            : 'Something went wrong',
                };
            }
        },
        { status: 'idle' },
    );
    return (
        <div className="space-y-3 rounded-lg border bg-white/90 p-3 backdrop-blur">
            <form action={submit} className="flex gap-2">
                <input
                    name="guess"
                    placeholder="What is it?"
                    maxLength={40}
                    className="flex-1 rounded border px-2 py-1"
                />
                <button
                    type="submit"
                    disabled={pending}
                    className="rounded bg-neutral-900 px-3 py-1 text-white disabled:opacity-50"
                >
                    {pending ? 'Judging…' : 'Guess'}
                </button>
            </form>

            {state.status === 'error' && <p className="text-sm text-red-600">{state.message}</p>}

            {state.status === 'done' && (
                <div className={`rounded p-2 text-sm ${state.result ? 'bg-green-50' : 'bg-neutral-50'}`}>
                    <p className="font-medium">{state.result ? '✓ Claimed' : 'Not quite'}</p>
                </div>
            )}
        </div>
    );
};
