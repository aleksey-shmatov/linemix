import { AuthorId, GameId, Point, simplify, Store, strokeAdded } from '@linemix/model';
import { useRef } from 'react';
import { toPath } from '@linemix/model';
import { useUiStore } from '../state/ui';
import { saveStrokes } from '@/server/actions';

export function useDraw(gameId: GameId, store: Store, authorId: AuthorId, toCanvas: (e: PointerEvent) => Point) {
  const liveRef = useRef<SVGPathElement>(null);
  const pts = useRef<Point[]>([]);
  const brush = useUiStore((s) => s.brush);

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!e.isPrimary) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pts.current = [toCanvas(e.nativeEvent)];
    liveRef.current?.setAttribute('d', toPath(pts.current));
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (pts.current.length === 0) return;
    const samples = e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent];
    for (const s of samples) pts.current.push(toCanvas(s));
    liveRef.current?.setAttribute('d', toPath(pts.current));
  };

  const onPointerUp = async () => {
    if (pts.current.length === 0) return;
    store.append(strokeAdded(simplify(pts.current, 0.5), brush, authorId));
    pts.current = [];
    liveRef.current?.setAttribute('d', '');
    await saveStrokes(gameId, store.getState().strokes);
  };

  return {
    liveRef,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp },
  };
}
