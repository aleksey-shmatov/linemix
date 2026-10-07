import { useCanvas } from '@/components/canvas/CanvasContext';
import { useSyncExternalStore } from 'react';

export function useDoc() {
  const { store } = useCanvas();
  return useSyncExternalStore(store.subscribe, store.getState, store.getState);
}

export function useUndo() {
  const { store } = useCanvas();
  const canUndo = useSyncExternalStore(store.subscribeUndo, store.canUndo, store.canUndo);
  const canRedo = useSyncExternalStore(store.subscribeUndo, store.canRedo, store.canRedo);
  return { canUndo, canRedo, undo: store.undo, redo: store.redo };
}
