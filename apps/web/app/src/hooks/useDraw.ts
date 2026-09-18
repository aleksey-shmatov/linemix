import { AuthorId, Point, Store } from "@linemix/model";
import { useRef } from "react";
import { toPath } from "@linemix/model";


export function useDraw(store: Store, authorId: AuthorId, toCanvas: (e: PointerEvent) => Point) {
  const liveRef = useRef<SVGPathElement>(null);
  const pts = useRef<Point[]>([]);
  const tool = useUiStore(s => s.tool);   // colour, width

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

  const onPointerUp = () => {
    if (pts.current.length === 0) return;
    store.append(strokeAdded(simplify(pts.current, 0.5), tool, authorId));
    pts.current = [];
    liveRef.current?.setAttribute('d', '');
  };

  return { liveRef, handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp } };
}