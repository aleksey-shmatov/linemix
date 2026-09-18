import type { DocEvent } from "./model.ts";
import { applyEvent, type DocState } from "./state.ts";

export const empty: DocState = {
  strokes: [],
};

export type Store = {
  readonly append: (event: DocEvent) => void;
  readonly getState: () => DocState;
  readonly subscribe: (listener: () => void) => () => void;
}

export function createStore(initial: DocState) {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    append(event: DocEvent) {
      state = applyEvent(state, event);
      listeners.forEach(l => l())
    },
    getState: () => state,
    subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; },
  };
}