// apps/web/src/state/ui.ts
import { createContext, ReactNode, useContext, useState } from 'react';
import { createStore, useStore } from 'zustand';
import { StrokeId } from '@linemix/model';

type CanvasState = {
  selectedId: StrokeId | null;
  setSelectedId: (id: StrokeId | null) => void;
};

export const createCanvasStore = () => {
  return createStore<CanvasState>((set) => ({
    selectedId: null,
    setSelectedId: (id: StrokeId | null) => set({ selectedId: id }),
  }));
};

type CanvasStore = ReturnType<typeof createCanvasStore>;
const Ctx = createContext<CanvasStore | null>(null);

export function CanvasStoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createCanvasStore);
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useCanvasStore<T>(selector: (s: CanvasState) => T): T {
  const store = useContext(Ctx);
  if (!store) throw new Error('useCanvasStore outside CanvasStoreProvider');
  return useStore(store, selector);
}
