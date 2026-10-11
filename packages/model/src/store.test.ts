// packages/model/src/store.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as Y from 'yjs';

import { createYjsStore } from './store.ts';
import type { AuthorId, Stroke, StrokeId } from './index.ts';
import { newStrokeId } from './index.ts';

const authorA = '11111111-1111-4111-8111-111111111111' as AuthorId;
const authorB = '22222222-2222-4222-8222-222222222222' as AuthorId;

let seq = 0;
function makeStroke(overrides: Partial<Stroke> = {}): Stroke {
  seq += 1;
  return {
    id: newStrokeId(),
    authorId: authorA,
    points: [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
    ],
    color: '#000000',
    width: 2,
    schemaVersion: 1,
    ...overrides,
  };
}

// --- tests ------------------------------------------------------------------

describe('createYjsStore', () => {
  it('merges concurrent edits to different keys of one stroke', () => {
    const stroke = makeStroke();

    const docA = new Y.Doc();
    const docB = new Y.Doc();
    const storeA = createYjsStore(docA, authorA);
    const storeB = createYjsStore(docB, authorB);

    // Both start from the same bytes, the way the app loads a game.
    storeA.apply({ kind: 'stroke_added', authorId: authorA, stroke });
    Y.applyUpdate(docB, Y.encodeStateAsUpdate(docA), 'remote');

    // Concurrent: each edits a different key, neither has seen the other.
    storeA.apply({
      kind: 'stroke_updated',
      authorId: authorA,
      strokeId: stroke.id,
      patch: { color: '#ff0000' },
    });
    storeB.apply({
      kind: 'stroke_updated',
      authorId: authorB,
      strokeId: stroke.id,
      patch: { width: 9 },
    });

    // Capture both before applying either, or the second encode would
    // already contain the first's change and prove nothing.
    const fromA = Y.encodeStateAsUpdate(docA);
    const fromB = Y.encodeStateAsUpdate(docB);
    Y.applyUpdate(docA, fromB, 'remote');
    Y.applyUpdate(docB, fromA, 'remote');

    for (const [name, store] of [
      ['A', storeA],
      ['B', storeB],
    ] as const) {
      const [merged] = store.getState().strokes;
      assert.equal(merged!.color, '#ff0000', `${name} lost the colour edit`);
      assert.equal(merged!.width, 9, `${name} lost the width edit`);
    }
  });

  it('drops an unparseable stroke without losing the document', () => {
    const doc = new Y.Doc();
    const store = createYjsStore(doc, authorA);

    store.apply({ kind: 'stroke_added', authorId: authorA, stroke: makeStroke() });

    // A peer on a different schema version pushes something we can't parse.
    doc.getArray<Y.Map<unknown>>('strokes').push([new Y.Map()]);

    assert.equal(
      store.getState().strokes.length,
      1,
      'one bad stroke must not take the document with it',
    );
  });

  it('returns a stable snapshot until the document changes', () => {
    const doc = new Y.Doc();
    const store = createYjsStore(doc, authorA);

    const first = store.getState();
    assert.equal(store.getState(), first, 'repeated reads must be reference-equal');

    store.apply({ kind: 'stroke_added', authorId: authorA, stroke: makeStroke() });
    assert.notEqual(store.getState(), first, 'an update must invalidate the snapshot');
  });
});
