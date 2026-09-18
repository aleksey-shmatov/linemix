import { type DocEvent, type Point, type AuthorId, type Stroke, newStrokeId, newEventId } from "./index.ts";

export function strokeAdded(
  points: readonly Point[],
  tool: { color: string; width: number },
  authorId: AuthorId,
): Extract<DocEvent, { kind: 'stroke_added' }> {
  const stroke:Stroke = {
    id: newStrokeId(),
    points,
    authorId,
    schemaVersion: 1,
    color: tool.color,
    width: tool.width,
  };
  return { id: newEventId(), kind: 'stroke_added', stroke, authorId, at: Date.now() };
}