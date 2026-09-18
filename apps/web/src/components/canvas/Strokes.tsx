import { toPath, type Store } from '@linemix/model';
import { useDoc } from '../../hooks/useDoc';
import { useUiStore } from '../../state/ui';

export function Strokes({ store }: { store: Store }) {
  const strokes = useDoc(store, (s) => s.strokes);
  const tool = useUiStore((s) => s.tool);
  const select = useUiStore((s) => s.select);
  const selectedId = useUiStore((s) => s.selectedId);
  return (
    <>
      {strokes.map((s) => {
        const d = toPath(s.points);
        const selectable = tool === 'select';
        const selected = s.id === selectedId;
        return (
          <g key={s.id}>
            {selected && (
              <path
                d={d}
                stroke="#2563eb"
                strokeWidth={s.width + 6}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.35}
                style={{ pointerEvents: 'none' }}
              />
            )}
            <path
              d={d}
              stroke="transparent"
              strokeWidth={Math.max(s.width, 8)}
              fill="none"
              strokeLinecap="round"
              style={{
                pointerEvents: selectable ? 'stroke' : 'none',
                cursor: selectable ? 'pointer' : 'default',
              }}
              onClick={(e) => {
                e.stopPropagation();
                select(s.id);
              }}
            />
            <path
              d={toPath(s.points)}
              stroke={s.color}
              strokeWidth={s.width}
              fill="none"
              pointerEvents={'none'}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        );
      })}
    </>
  );
}
