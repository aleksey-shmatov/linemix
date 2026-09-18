// apps/web/src/state/ui.ts
import { create } from 'zustand';
import {StrokeId} from '@linemix/model' 

type Tool = { color: string; width: number };

type UiState = {
  tool: Tool;
  selectedId: StrokeId | null;
  setColor: (color: string) => void;
  setWidth: (width: number) => void;
  select: (id: StrokeId | null) => void;
};

export const useUiStore = create<UiState>((set) => ({
  tool: { color: '#111111', width: 2 },
  selectedId: null,
  setColor: (color: string) => set((s) => ({ tool: { ...s.tool, color } })),
  setWidth: (width: number) => set((s) => ({ tool: { ...s.tool, width } })),
  select: (selectedId: StrokeId | null) => set({ selectedId }),
}));