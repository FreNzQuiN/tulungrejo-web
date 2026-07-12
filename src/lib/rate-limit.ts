interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  windowMs: number;
  maxAttempts: number;
}

export const RATE_LIMIT_PRESETS = {
  login: { windowMs: 15 * 60 * 1000, maxAttempts: 5 },
  api: { windowMs: 60 * 1000, maxAttempts: 100 },
  export: { windowMs: 60 * 60 * 1000, maxAttempts: 10 },
} as const;

const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig = RATE_LIMIT_PRESETS.login,
): RateLimitResult {
  cleanup();

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetAt: now + config.windowMs,
    };
  }

  if (entry.count < config.maxAttempts) {
    entry.count++;
    return {
      allowed: true,
      remaining: config.maxAttempts - entry.count,
      resetAt: entry.resetAt,
    };
  }

  return { allowed: false, remaining: 0, resetAt: entry.resetAt };
}

export function resetRateLimit(key: string): void {
  store.delete(key);
}
