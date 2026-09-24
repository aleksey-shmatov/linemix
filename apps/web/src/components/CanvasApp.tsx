'use client';
import { useState } from 'react';
import { CanvasProvider } from './canvas/CanvasContext';
import { AuthorId, createStore, empty, GameId, isAuthorId, newAuthorId } from '@linemix/model';
import { PublishButton } from './PublishButton';
import { Canvas } from './canvas/Canvas';
import { Toolbar } from '@/components/Toolbar';
import { GuessForm } from './GuessForm';

export function CanvasApp({ gameId }: { gameId: GameId }) {
  const [store] = useState(() => createStore(empty));
  // TODO - author id should come from the server or authentication context rather than localStorage
  const [me] = useState<AuthorId | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('authorId');
    if (stored && isAuthorId(stored)) return stored;
    const id = newAuthorId();
    localStorage.setItem('authorId', id);
    return id;
  });

  if (!me) return null;

  // TODO - move this into state/memo
  return (
    <CanvasProvider value={{ store, me, gameId }}>
      <div className="relative grid h-dvh place-items-center p-4">
        <Canvas store={store} me={me} />
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <Toolbar store={store} me={me} />
        </div>
        <div className="absolute left-6 top-6">
          <PublishButton store={store} gameId={gameId} />
        </div>
        <div className="absolute right-6 top-6 w-72">
          <GuessForm store={store} me={me} />
        </div>
      </div>
    </CanvasProvider>
  );
}
