import { useUiStore } from '../state/ui';
import { ToolButton } from './ui/ToolButton';
import { Pencil, MousePointer2 } from 'lucide-react';
import type { AuthorId, Store } from '@linemix/model';
import { useBrushTarget } from '@/hooks/useBrushTarget';

const PALETTE = ['#111111', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'] as const;
const WIDTHS = [2, 4, 8, 16] as const;

export function Toolbar({ store, me }: { store: Store; me: AuthorId }) {
  const tool = useUiStore((s) => s.tool);
  const setTool = useUiStore((s) => s.setTool);
  const { color, width, editing, setColor, setWidth } = useBrushTarget(store, me);

  return (
    <div className="flex items-center gap-4 rounded-lg border bg-white/90 px-3 py-2 backdrop-blur">
      <div className="flex gap-1">
        <ToolButton active={tool === 'draw'} onClick={() => setTool('draw')} label="Draw (B)">
          <Pencil className="size-4" />
        </ToolButton>
        <ToolButton active={tool === 'select'} onClick={() => setTool('select')} label="Select (V)">
          <MousePointer2 className="size-4" />
        </ToolButton>
      </div>

      <div className="h-5 w-px bg-neutral-200" />

      <div className="flex gap-1">
        {PALETTE.map((c) => (
          <button
            key={c}
            aria-label={`Colour ${c}`}
            aria-pressed={color === c}
            onClick={() => setColor(c)}
            style={{ backgroundColor: c }}
            className={`size-6 rounded-full ring-offset-2 transition ${color === c ? 'ring-2 ring-neutral-900' : ''}`}
          />
        ))}
      </div>

      <div className="flex items-center gap-1">
        {WIDTHS.map((w) => (
          <button
            key={w}
            aria-label={`Width ${w}`}
            aria-pressed={width === w}
            onClick={() => setWidth(w)}
            className={`grid size-6 place-items-center rounded ${width === w ? 'bg-neutral-900/10' : ''}`}
          >
            <span
              className="rounded-full bg-neutral-900"
              style={{ width: w * 1.2, height: w * 1.2 }}
            />
          </button>
        ))}
      </div>

      {editing && <span className="text-xs text-neutral-500">Editing selection</span>}
    </div>
  );
}
