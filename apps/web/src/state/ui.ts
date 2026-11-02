// apps/web/src/state/ui.ts
import { create } from 'zustand';

type Brush = { color: string; width: number };
type Tool = 'draw' | 'select';

type UiState = {
  brush: Brush;
  tool: Tool;
  setColor: (color: string) => void;
  setWidth: (width: number) => void;
  setTool: (tool: Tool) => void;
};

// It is ok to keep it global because it does not derive anything from server, have fixed initial values
export const useUiStore = create<UiState>((set) => ({
  brush: { color: '#111111', width: 2 },
  tool: 'draw',
  setColor: (color: string) => set((s) => ({ brush: { ...s.brush, color } })),
  setWidth: (width: number) => set((s) => ({ brush: { ...s.brush, width } })),
  setTool: (tool: Tool) => set({ tool }),
}));
