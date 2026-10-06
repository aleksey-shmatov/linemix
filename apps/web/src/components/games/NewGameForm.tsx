'use client';
import { useActionState } from 'react';
import { createGame } from '@/server/actions';

export function NewGameForm() {
    const [state, action, pending] = useActionState(createGame, null);

    return (
        <form action={action} className="flex gap-2">
            <input
                name="name"
                placeholder="New game name"
                maxLength={100}
                required
                className="flex-1 rounded border px-3 py-2"
            />
            <button disabled={pending} className="rounded border px-3 py-2">Create</button>
            {state?.ok === false && <p className="text-sm text-red-600">{state.reason}</p>}
        </form>
    );
}