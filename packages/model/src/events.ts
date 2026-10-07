import {
  type DocEvent,
  type Point,
  type AuthorId,
  type Stroke,
  type StrokeId,
  newStrokeId,
  newEventId,
  type StrokePatch,
  type Command,
} from './index.ts';

export function strokeAdded(
  points: readonly Point[],
  tool: { color: string; width: number },
  authorId: AuthorId,
): Extract<Command, { kind: 'stroke_added' }> {
  const stroke: Stroke = {
    id: newStrokeId(),
    points,
    authorId,
    schemaVersion: 1,
    color: tool.color,
    width: tool.width,
  };
  return { kind: 'stroke_added', stroke, authorId };
}

export function strokeUpdated(strokeId: StrokeId, patch: StrokePatch, authorId: AuthorId): Command {
  return { kind: 'stroke_updated', authorId, strokeId, patch };
}
