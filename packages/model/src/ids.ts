export type StrokeId = `stroke_${string}`;
export type UserId = string;
export type AuthorId = string;
export type EventId = `event_${string}`;
export type GameId = string;

export const newGameId = (): GameId => crypto.randomUUID()          
export const newStrokeId = (): StrokeId => `stroke_${crypto.randomUUID()}`;
export const newEventId = (): EventId => `event_${crypto.randomUUID()}`;
