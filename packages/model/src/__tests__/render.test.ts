import { describe, it } from 'node:test';
import { strokesToSvg } from '../render.ts';
import assert from 'node:assert/strict';

describe('strokesToSvg', () => {
  it('should render an empty SVG for no strokes', () => {
    const svg = strokesToSvg([]);
    assert.ok(svg.startsWith('<svg'));
    assert.ok(svg.endsWith('</svg>'));
    assert.ok(!svg.includes('<path'));
  });
});

describe('strokesToSvg two points', () => {
  it('should render an SVG with a stroke consisting of two points', () => {
    const svg = strokesToSvg([
      {
        id: 'stroke_1' as any,
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 10 },
        ],
        authorId: 'a1' as any,
        schemaVersion: 1,
        color: 'black',
        width: 1,
      },
    ]);
    assert.ok(svg.includes('<path'));
    assert.ok(svg.includes('M0,0L10,10'));
  });
});
