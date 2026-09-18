export function timer(label: string): Disposable {
  const start = performance.now();
  return {
    [Symbol.dispose]() {
      console.log(`${label}: ${(performance.now() - start).toFixed(1)}ms`);
    },
  };
}
