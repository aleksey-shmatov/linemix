import type { StrokeId, AuthorId, EventId } from "./ids.ts";
import { assertNever } from "./util/assertNever.ts";

export type Point = { readonly x: number; readonly y: number; readonly p?: number };

export type Stroke = {
  readonly id: StrokeId;
  readonly points: readonly Point[];   // immutable — geometry is identity
  readonly authorId: AuthorId;
  readonly schemaVersion: 1;
  color: string;                      // mutable — anyone, any time
  width: number;
};

export type StrokePatch = { color?: string; width?: number };

type Verdict = {
  readonly sees: string;               // unprompted reading, captured first
  readonly match: number;              // 0–1
  readonly reasoning: string;
  readonly model: string;
  readonly latencyMs: number;
};

export type DocEvent =
  | { id: EventId; kind: 'stroke_added';   stroke: Stroke;  authorId: AuthorId; at: number }
  | { id: EventId; kind: 'stroke_updated'; strokeId: StrokeId; patch: StrokePatch; authorId: AuthorId; at: number }
  | { id: EventId; kind: 'stroke_removed'; strokeId: StrokeId; authorId: AuthorId; at: number }
  | { id: EventId; kind: 'guess_made';     guess: string; authorId: AuthorId; verdict: Verdict; at: number };
