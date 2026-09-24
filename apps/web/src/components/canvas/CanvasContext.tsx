'use client';
import { createContext, useContext } from 'react';
import type { AuthorId, GameId, Store } from '@linemix/model';

type CanvasContextValue = { store: Store; me: AuthorId; gameId: GameId };

const CanvasContext = createContext<CanvasContextValue | null>(null);

export const CanvasProvider = CanvasContext.Provider;

export function useCanvas(): CanvasContextValue {
  const ctx = useContext(CanvasContext);
  if (!ctx) throw new Error('useCanvas must be used inside CanvasProvider');
  return ctx;
}
