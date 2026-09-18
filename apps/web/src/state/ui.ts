// apps/web/src/state/ui.ts
import { create } from 'zustand';
import { StrokeId } from '@linemix/model';

type Brush = { color: string; width: number };
type Tool = 'draw' | 'select';

type UiState = {
  brush: Brush;
  tool: Tool;
  selectedId: StrokeId | null;
  setColor: (color: string) => void;
  setWidth: (width: number) => void;
  select: (id: StrokeId | null) => void;
  setTool: (tool: Tool) => void;
};

export const useUiStore = create<UiState>((set) => ({
  brush: { color: '#111111', width: 2 },
  tool: 'draw',
  selectedId: null,
  setColor: (color: string) => set((s) => ({ brush: { ...s.brush, color } })),
  setWidth: (width: number) => set((s) => ({ brush: { ...s.brush, width } })),
  select: (selectedId: StrokeId | null) => set({ selectedId }),
  setTool: (tool: Tool) => set({ tool }),
}));
