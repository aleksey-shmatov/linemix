export function replay<S>(
  initial: S,
  events: readonly Event[],
  reducer: (state: NoInfer<S>, event: Event) => S,
): S {
  return events.reduce(reducer, initial);
}