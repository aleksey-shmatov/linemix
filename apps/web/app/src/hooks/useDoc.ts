import type { DocState } from "@linemix/model";
import type { Store } from "@linemix/model";
import { useSyncExternalStore } from "react";

export function useDoc<T>(store: Store, select: (s: DocState) => T): T {
  return useSyncExternalStore(store.subscribe, () => select(store.getState()), () => select(store.getState()));
}
