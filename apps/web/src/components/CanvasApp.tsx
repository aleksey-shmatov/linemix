'use client';
import { usePersistence } from '@/hooks/usePersistance';
import { useState } from 'react';
import { useRealtime } from '@/hooks/useRealtime';
import { CanvasProvider } from './canvas/CanvasContext';
import { AuthorId, createYjsStore, GameId, type Stroke } from '@linemix/model';
import * as Y from 'yjs';
import { PublishButton } from './PublishButton';
import { Canvas } from './canvas/Canvas';
import { Toolbar } from '@/components/Toolbar';
import { GuessForm } from './GuessForm';
import { fromBase64 } from '@/lib/base64';

export function CanvasApp({
  gameId,
  me,
  initialUpdate,
}: {
  gameId: GameId;
  me: AuthorId;
  initialUpdate: string | null;
}) {
  const [{ ydoc, store }] = useState(() => {
    const ydoc = new Y.Doc();
    const store = createYjsStore(ydoc, me);
    ydoc.transact(() => {
      if (initialUpdate) {
        Y.applyUpdate(ydoc, fromBase64(initialUpdate), 'remote');
      }
    });
    return { ydoc, store };
  });
  useRealtime(ydoc, gameId);
  usePersistence(ydoc, gameId);

  const [value] = useState(() => ({ store, ydoc, me, gameId }));
  // TODO - move this into state/memo
  return (
    <CanvasProvider value={value}>
      <div className="relative grid h-dvh place-items-center p-4">
        <Canvas gameId={gameId} store={store} me={me} />
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
