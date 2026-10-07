'use client';
import { useState } from 'react';
import { CanvasProvider } from './canvas/CanvasContext';
import { AuthorId, createYjsStore, GameId, type Stroke } from '@linemix/model';
import * as Y from 'yjs';
import { PublishButton } from './PublishButton';
import { Canvas } from './canvas/Canvas';
import { Toolbar } from '@/components/Toolbar';
import { GuessForm } from './GuessForm';

export function CanvasApp({
  gameId,
  me,
  doc,
}: {
  gameId: GameId;
  me: AuthorId;
  doc: { readonly strokes: readonly Stroke[] };
}) {
  const [{ ydoc, store }] = useState(() => {
    const ydoc = new Y.Doc();
    const store = createYjsStore(ydoc, me);
    ydoc.transact(() => {
      for (const s of doc.strokes) store.apply({ kind: 'stroke_added', authorId: me, stroke: s });
    });
    return { ydoc, store };
  });

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
