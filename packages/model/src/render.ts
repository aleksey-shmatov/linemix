import type { Point, Stroke } from './model.ts';

export function toPath(points: readonly Point[]): string {
  let d = '';
  for (const p of points) {
    d += `${d ? 'L' : 'M'}${r(p.x)},${r(p.y)}`;
  }
  if (points.length === 1) d += d.slice(1).replace(/^/, 'L'); // dot: repeat the point
  return d;
}

const r = (n: number) => Math.round(n * 100) / 100;

export function simplify(points: readonly Point[], epsilon: number): Point[] {
  if (points.length <= 2) return [...points];

  const first = points[0]!;
  const last = points[points.length - 1]!;

  let maxDist = 0;
  let index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(points[i]!, first, last);
    if (d > maxDist) {
      maxDist = d;
      index = i;
    }
  }

  if (maxDist <= epsilon) return [first, last];

  const left = simplify(points.slice(0, index + 1), epsilon);
  const right = simplify(points.slice(index), epsilon);
  return [...left.slice(0, -1), ...right]; // drop the duplicated split point
}

function perpendicularDistance(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  if (len === 0) return Math.hypot(p.x - a.x, p.y - a.y); // a and b coincide
  return Math.abs(dy * p.x - dx * p.y + b.x * a.y - b.y * a.x) / len;
}

export function strokesToSvg(
  strokes: readonly Stroke[],
  opts?: { size?: number; background?: string },
): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${opts?.size ?? 100}" height="${opts?.size ?? 1000}" viewBox="0 0 ${opts?.size ?? 100} ${opts?.size ?? 1000}">
    ${opts?.background ? `<rect width="100%" height="100%" fill="${opts.background}" />` : ''}
    ${strokes
      .map(
        (stroke) =>
          `<path d="${toPath(stroke.points)}" stroke="${stroke.color}" stroke-width="${stroke.width}" fill="none" />`,
      )
      .join('')}
  </svg>`;
}
