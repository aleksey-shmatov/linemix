import { applyEvent } from '../state.ts';
import type { DocEvent, Stroke } from '../model.ts';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('applyEvent', () => {
  it('should add a stroke', () => {
    const initialState = { strokes: [] };
    const event: DocEvent = {
      id: '1' as any,
      kind: 'stroke_added',
      stroke: {
        id: 'stroke_1' as any,
        points: [],
        authorId: 'a1' as any,
        schemaVersion: 1,
        color: 'black',
        width: 1,
      },
      authorId: 'a1' as any,
      at: Date.now(),
    };
    const newState = applyEvent(initialState, event);
    assert.strictEqual(newState.strokes.length, 1);
    assert.strictEqual(newState.strokes[0]?.id, 'stroke_1');
  });
  it('should remove a stroke', () => {
    const initialState = {
      strokes: [
        {
          id: 'stroke_1' as any,
          points: [],
          authorId: 'a1' as any,
          schemaVersion: 1 as const,
          color: 'black',
          width: 1,
        },
      ],
    };
    const event: DocEvent = {
      id: '2' as any,
      kind: 'stroke_removed',
      strokeId: 'stroke_1' as any,
      authorId: 'a1' as any,
      at: Date.now(),
    };
    const newState = applyEvent(initialState, event);
    assert.strictEqual(newState.strokes.length, 0);
  });
  it('should update a stroke', () => {
    const initialState = {
      strokes: [
        {
          id: 'stroke_1' as any,
          points: [],
          authorId: 'a1' as any,
          schemaVersion: 1 as const,
          color: 'black',
          width: 1,
        },
      ],
    };
    const event: DocEvent = {
      id: '3' as any,
      kind: 'stroke_updated',
      strokeId: 'stroke_1' as any,
      patch: { color: 'red' },
      authorId: 'a1' as any,
      at: Date.now(),
    };
    const newState = applyEvent(initialState, event);
    assert.strictEqual(newState.strokes[0]?.color, 'red');
  });
  it('should not update a non-existent stroke', () => {
    const initialState = {
      strokes: [
        {
          id: 'stroke_1' as any,
          points: [],
          authorId: 'a1' as any,
          schemaVersion: 1 as const,
          color: 'black',
          width: 1,
        },
      ],
    };
    const event: DocEvent = {
      id: '4' as any,
      kind: 'stroke_updated',
      strokeId: 'stroke_2' as any,
      patch: { color: 'blue' },
      authorId: 'a1' as any,
      at: Date.now(),
    };
    const newState = applyEvent(initialState, event);
    assert.strictEqual(newState.strokes[0]?.color, 'black');
  });
  it('should throw on invalid event kind', () => {
    const initialState = { strokes: [] };
    const event = {
      id: '5' as any,
      kind: 'invalid_kind' as any,
      authorId: 'a1' as any,
      at: Date.now(),
    };
    assert.throws(() => applyEvent(initialState, event as DocEvent));
  });
});
