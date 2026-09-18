import type { Stroke, DocEvent } from "./model.ts";
import {assertNever} from './util/assertNever.ts'

export type DocState = {
  readonly strokes: readonly Stroke[];
};

export function applyEvent(state: DocState, event: DocEvent): DocState {
  // TODO: Add events dedup here?
  switch (event.kind) {
    case 'stroke_added':   return {...state, strokes: [...state.strokes, event.stroke]};
    case 'stroke_updated': return {...state, strokes: state.strokes.map(s => s.id === event.strokeId ? {...s, ...event.patch} : s)};
    case 'stroke_removed': return {...state, strokes: state.strokes.filter(s => s.id !== event.strokeId)};
    case 'guess_made':     return state
    default:               return assertNever(event);
  }
}