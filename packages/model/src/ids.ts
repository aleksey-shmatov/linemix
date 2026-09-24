export type StrokeId = `stroke_${string}`;
export type UserId = string;
export type AuthorId = `author_${string}`;
export type EventId = `event_${string}`;
export type GameId = `game_${string}`;

export const newGameId = (): GameId => `game_${crypto.randomUUID()}`;
export const newStrokeId = (): StrokeId => `stroke_${crypto.randomUUID()}`;
export const newEventId = (): EventId => `event_${crypto.randomUUID()}`;
export const newAuthorId = (): AuthorId => `author_${crypto.randomUUID()}`;
