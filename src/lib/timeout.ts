export class TimeoutError extends Error {
  constructor(ms: number) {
    super(`Operation timed out after ${ms}ms`);
    this.name = "TimeoutError";
  }
}

export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(ms)), ms);
  });

  const result = Promise.race([promise, timeoutPromise]).finally(() =>
    clearTimeout(timer!),
  );

  // Suppress rejection from orphaned query after timeout fired.
  // Promise.race doesn't cancel the losing promise; without this,
  // the underlying Prisma query's eventual rejection would be an
  // unhandled promise rejection, and its connection would leak.
  void promise.catch(() => {});

  return result;
}
