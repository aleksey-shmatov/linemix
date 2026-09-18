'use client';
import { AuthorId, Point, Store } from '@linemix/model';
import { Strokes } from './Strokes';
import { useDraw } from '../../hooks/useDraw';
import { useRef } from 'react';
import { useUiStore } from '../../state/ui';

export function Canvas({ store, me }: { store: Store; me: AuthorId }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const toCanvas = (e: PointerEvent): Point => {
    const svg = svgRef.current!;
    const p = svg.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    const { x, y } = p.matrixTransform(svg.getScreenCTM()!.inverse());
    return { x: Math.round(x), y: Math.round(y) };
  };
  const tool = useUiStore((s) => s.tool);
  const brush = useUiStore((s) => s.brush);
  const select = useUiStore((s) => s.select);
  const { liveRef, handlers } = useDraw(store, me, (e) => toCanvas(e));
  return (
    <svg
      ref={svgRef}
      viewBox="0 0 1000 1000"
      className="w-full h-full aspect-square  rounded-lg border bg-white"
      {...(tool === 'draw' ? handlers : {})}
      onClick={() => {
        if (tool === 'select') select(null);
      }}
    >
      <Strokes store={store} />
      <path
        ref={liveRef}
        stroke={brush.color}
        strokeWidth={brush.width}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
