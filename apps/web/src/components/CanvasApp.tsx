'use client';
import { useState } from 'react';
import { createStore, empty, newAuthorId } from '@linemix/model';
import { Canvas } from './canvas/Canvas';
import { Toolbar } from '@/components/Toolbar';

export function CanvasApp() {
  const [store] = useState(() => createStore(empty));
  const [me] = useState(() => newAuthorId());

  return (
    <div className="relative grid h-dvh place-items-center p-4">
      <Canvas store={store} me={me} />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <Toolbar store={store} me={me} />
      </div>
    </div>
  );
}
