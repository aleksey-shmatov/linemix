import type { AuthorId, Store } from '@linemix/model';
import { strokeUpdated } from '@linemix/model';
import { useUiStore } from '@/state/ui';
import { useDoc } from '@/hooks/useDoc';

export function useBrushTarget(store: Store, me: AuthorId) {
  const tool = useUiStore((s) => s.tool);
  const selectedId = useUiStore((s) => s.selectedId);
  const brush = useUiStore((s) => s.brush);
  const setBrushColor = useUiStore((s) => s.setColor);
  const setBrushWidth = useUiStore((s) => s.setWidth);

  const selected = useDoc(store, (s) =>
    selectedId ? s.strokes.find((x) => x.id === selectedId) : undefined,
  );
  const target = tool === 'select' && selected ? selected : null;

  return {
    color: target ? target.color : brush.color,
    width: target ? target.width : brush.width,
    editing: target !== null,
    setColor(color: string) {
      if (target) store.append(strokeUpdated(target.id, { color }, me));
      else setBrushColor(color);
    },
    setWidth(width: number) {
      if (target) store.append(strokeUpdated(target.id, { width }, me));
      else setBrushWidth(width);
    },
  };
}
