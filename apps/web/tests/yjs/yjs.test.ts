import * as Y from 'yjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('concurrent edits to different properties both survive', () => {
  const a = new Y.Doc();
  const b = new Y.Doc();

  // seed both with one stroke
  const stroke = new Y.Map();
  stroke.set('id', 's1');
  stroke.set('color', '#000');
  stroke.set('width', 2);
  a.getArray('strokes').push([stroke]);
  Y.applyUpdate(b, Y.encodeStateAsUpdate(a));

  (a.getArray('strokes').get(0) as Y.Map<unknown>).set('color', '#f00');
  (b.getArray('strokes').get(0) as Y.Map<unknown>).set('width', 8);

  const ua = Y.encodeStateAsUpdate(a);
  const ub = Y.encodeStateAsUpdate(b);
  Y.applyUpdate(a, ub);
  Y.applyUpdate(b, ua);

  const sa = a.getArray('strokes').get(0) as Y.Map<unknown>;
  const sb = b.getArray('strokes').get(0) as Y.Map<unknown>;

  assert.equal(sa.get('color'), '#f00'); // alice's change survived
  assert.equal(sa.get('width'), 8); // and so did bob's
  assert.deepEqual(sa.toJSON(), sb.toJSON()); // both docs converged
});

test('concurrent edits to the same property one write wins', () => {
  const a = new Y.Doc();
  const b = new Y.Doc();

  const stroke = new Y.Map();
  stroke.set('id', 's1');
  stroke.set('color', '#000');
  stroke.set('width', 2);
  a.getArray('strokes').push([stroke]);
  Y.applyUpdate(b, Y.encodeStateAsUpdate(a));

  (a.getArray('strokes').get(0) as Y.Map<unknown>).set('color', '#f00');
  (b.getArray('strokes').get(0) as Y.Map<unknown>).set('color', '#0f0');

  const ua = Y.encodeStateAsUpdate(a);
  const ub = Y.encodeStateAsUpdate(b);
  Y.applyUpdate(a, ub);
  Y.applyUpdate(b, ua);

  const sa = a.getArray('strokes').get(0) as Y.Map<unknown>;
  const sb = b.getArray('strokes').get(0) as Y.Map<unknown>;

  assert.equal(sa.get('color'), sb.get('color'));
  assert.deepEqual(sa.toJSON(), sb.toJSON());
});

test('concurrent adding strokes both survive', () => {
  const a = new Y.Doc();
  const b = new Y.Doc();

  const strokeA = new Y.Map();
  strokeA.set('id', 's1');
  strokeA.set('color', '#000');
  strokeA.set('width', 2);
  a.getArray('strokes').push([strokeA]);

  const strokeB = new Y.Map();
  strokeB.set('id', 's2');
  strokeB.set('color', '#111');
  strokeB.set('width', 3);
  b.getArray('strokes').push([strokeB]);

  const ua = Y.encodeStateAsUpdate(a);
  const ub = Y.encodeStateAsUpdate(b);
  Y.applyUpdate(a, ub);
  Y.applyUpdate(b, ua);

  const sa = a.getArray('strokes').toArray() as Y.Map<unknown>[];
  const sb = b.getArray('strokes').toArray() as Y.Map<unknown>[];

  assert.deepEqual(
    sa.map((s) => s.toJSON()),
    sb.map((s) => s.toJSON()),
  );
});
