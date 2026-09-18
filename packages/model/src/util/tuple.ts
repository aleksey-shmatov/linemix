export function points<const T extends readonly (readonly [number, number])[]>(p: T): T {
  return p;
}

const square = points([
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
]);
