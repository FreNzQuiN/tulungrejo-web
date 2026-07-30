import { prisma } from "./prisma";

export interface RateLimitConfig {
  windowMs: number;
  maxAttempts: number;
}

export const RATE_LIMIT_PRESETS = {
  login: { windowMs: 15 * 60 * 1000, maxAttempts: 5 },
  loginEmail: { windowMs: 15 * 60 * 1000, maxAttempts: 10 },
  api: { windowMs: 60 * 1000, maxAttempts: 60 },
  export: { windowMs: 60 * 60 * 1000, maxAttempts: 10 },
} as const;

/** Retry attempts for rate limit DB operations */
const MAX_RETRIES = 2;
/** Delay between retry attempts (ms) */
const RETRY_DELAY_MS = 100;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Extracts client IP from request headers.
 *
 * Trust order: x-nf-client-connection-ip (Netlify edge) > x-real-ip > x-forwarded-for.
 * x-forwarded-for is client-spoofable and kept only as non-Netlify fallback.
 * Per-email rate limiter (login route) is the primary defense; IP-based is secondary.
 */
export function getClientIp(req: { headers: Headers }): string {
  const nfIp = req.headers.get("x-nf-client-connection-ip");
  if (nfIp) return nfIp;

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;

  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  if (process.env.NODE_ENV === "development") {
    return "127.0.0.1";
  }

  return "unknown";
}

let cleanupCounter = 0;
const CLEANUP_INTERVAL = 100;

function maybeCleanup(): void {
  cleanupCounter++;
  if (cleanupCounter < CLEANUP_INTERVAL) return;
  cleanupCounter = 0;

  prisma.rateLimit
    .deleteMany({
      where: { expiresAt: { lt: new Date() } },
    })
    .catch((e) => {
      console.error("[rate-limit] cleanup failed:", e);
    });
}

function fallbackOpen(config: RateLimitConfig): RateLimitResult {
  return {
    allowed: true,
    remaining: config.maxAttempts,
    resetAt: Date.now() + config.windowMs,
  };
}

function fallbackClosed(config: RateLimitConfig): RateLimitResult {
  return {
    allowed: false,
    remaining: 0,
    resetAt: Date.now() + config.windowMs,
  };
}

/**
 * Core rate limit check as a single Prisma transaction.
 * Attempts to increment counter, creates a new window if expired or nonexistent,
 * or rejects the request when the limit is reached.
 */
async function checkRateLimitTransaction(
  key: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  return prisma.$transaction(async (tx) => {
    const now = new Date();

    // Read inside transaction — conditional UPDATE serializes concurrent increments
    const locked = await tx.rateLimit.findUnique({
      where: { id: key },
    });
    if (locked) {
      if (locked.count >= config.maxAttempts && locked.expiresAt >= now) {
        return {
          allowed: false,
          remaining: 0,
          resetAt: locked.expiresAt.getTime(),
        };
      }
      if (locked.expiresAt < now) {
        await tx.rateLimit.update({
          where: { id: key },
          data: { count: 1, expiresAt: new Date(Date.now() + config.windowMs) },
        });
        return {
          allowed: true,
          remaining: config.maxAttempts - 1,
          resetAt: Date.now() + config.windowMs,
        };
      }
      const updated = await tx.rateLimit.update({
        where: { id: key, count: { lt: config.maxAttempts } },
        data: { count: { increment: 1 } },
      });
      return {
        allowed: true,
        remaining: config.maxAttempts - updated.count,
        resetAt: updated.expiresAt.getTime(),
      };
    }

    // No existing record — create fresh window
    const expiresAt = new Date(Date.now() + config.windowMs);
    await tx.rateLimit.create({
      data: { id: key, count: 1, expiresAt },
    });
    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetAt: expiresAt.getTime(),
    };
  });
}

/**
 * Retry wrapper around the rate limit transaction.
 * On transient DB errors, retries up to MAX_RETRIES with RETRY_DELAY_MS spacing.
 */
async function checkRateLimitWithRetry(
  key: string,
  config: RateLimitConfig,
  failClosed: boolean,
): Promise<RateLimitResult> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = await checkRateLimitTransaction(key, config);
      maybeCleanup();
      return result;
    } catch (err) {
      if (attempt === MAX_RETRIES - 1) {
        console.error("[rate-limit] DB error:", err);
        maybeCleanup();
        return failClosed ? fallbackClosed(config) : fallbackOpen(config);
      }
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    }
  }

  return failClosed ? fallbackClosed(config) : fallbackOpen(config);
}

export async function checkRateLimit(
  key: string,
  config: RateLimitConfig = RATE_LIMIT_PRESETS.login,
  failClosed = false,
): Promise<RateLimitResult> {
  return checkRateLimitWithRetry(key, config, failClosed);
}

export async function resetRateLimit(key: string): Promise<void> {
  try {
    await prisma.rateLimit.delete({ where: { id: key } });
  } catch (e) {
    console.error("[rate-limit] reset failed for", key, e);
  }
}
