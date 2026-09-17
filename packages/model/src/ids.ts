export type StrokeId = `stroke_${string}`
export type Hex = `#${string}`
export type UserId = string
export type AuthorId = string
export type EventId = `event_${string}`

export const newStrokeId = (): StrokeId => `stroke_${crypto.randomUUID()}`
export const newEventId = (): EventId => `event_${crypto.randomUUID()}`