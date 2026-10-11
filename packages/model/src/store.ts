import { type StrokeId, type AuthorId, StrokeSchema } from './index.ts';
import type { Stroke, StrokePatch } from './model.ts';
import { type DocState } from './state.ts';
import * as Y from 'yjs';
import { assertNever } from './util/assertNever.ts';

export const empty: DocState = {
  strokes: [],
};

export type Command =
  | { kind: 'stroke_added'; authorId: AuthorId; stroke: Stroke }
  | { kind: 'stroke_updated'; authorId: AuthorId; strokeId: StrokeId; patch: StrokePatch }
  | { kind: 'stroke_removed'; authorId: AuthorId; strokeId: StrokeId }
  | { kind: 'turn_passed'; authorId: AuthorId; to: AuthorId };

export type Store = {
  readonly apply: (c: Command) => void;
  readonly getState: () => DocState;
  readonly subscribe: (listener: () => void) => () => void;

  readonly undo: () => void;
  readonly redo: () => void;
  readonly canUndo: () => boolean;
  readonly canRedo: () => boolean;
  readonly subscribeUndo: (listener: () => void) => () => void;
};

export function createYjsStore(doc: Y.Doc, me: AuthorId): Store {
  const strokes = doc.getArray<Y.Map<unknown>>('strokes');
  const turn = doc.getMap<unknown>('turn');
  let snapshot: DocState | null = null;

  const undoManager = new Y.UndoManager(strokes, { trackedOrigins: new Set([me]) });

  doc.on('update', () => {
    snapshot = null;
  });

  const findIndexById = (id: StrokeId) => strokes.toArray().findIndex((m) => m.get('id') === id);

  const toYMap = (s: Stroke) =>
    new Y.Map<unknown>(
      Object.entries({
        id: s.id,
        authorId: s.authorId,
        points: s.points.map((p) => ({ ...p })),
        schemaVersion: s.schemaVersion,
        color: s.color,
        width: s.width,
      }),
    );

  return {
    apply(c: Command) {
      doc.transact(() => {
        switch (c.kind) {
          case 'stroke_added':
            strokes.push([toYMap(c.stroke)]);
            break;

          case 'stroke_updated': {
            const i = findIndexById(c.strokeId);
            if (i < 0) break;
            const m = strokes.get(i);
            if (c.patch.color !== undefined) m.set('color', c.patch.color);
            if (c.patch.width !== undefined) m.set('width', c.patch.width);
            break;
          }

          case 'stroke_removed': {
            const i = findIndexById(c.strokeId);
            if (i >= 0) strokes.delete(i, 1);
            break;
          }

          case 'turn_passed':
            turn.set('to', c.to);
            break;

          default:
            assertNever(c);
        }
      }, c.authorId);
    },

    getState() {
      snapshot ??= {
        strokes: strokes.toArray().map((m) => StrokeSchema.parse(m.toJSON())),
      };
      return snapshot;
    },

    subscribe(fn) {
      const handler = () => {
        snapshot = null;
        fn();
      };
      doc.on('update', handler);
      return () => doc.off('update', handler);
    },

    undo: () => undoManager.undo(),
    redo: () => undoManager.redo(),
    canUndo: () => undoManager.undoStack.length > 0,
    canRedo: () => undoManager.redoStack.length > 0,

    subscribeUndo(fn) {
      undoManager.on('stack-item-added', fn);
      undoManager.on('stack-item-popped', fn);
      return () => {
        undoManager.off('stack-item-added', fn);
        undoManager.off('stack-item-popped', fn);
      };
    },
  };
}
