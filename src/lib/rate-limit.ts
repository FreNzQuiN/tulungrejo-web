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

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function getClientIp(req: { headers: Headers }): string {
  const nfIp = req.headers.get("x-nf-client-connection-ip");
  if (nfIp) return nfIp;

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;

  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "";
  }

  if (process.env.NODE_ENV === "development") {
    return "127.0.0.1";
  }

  return "";
}

export async function checkRateLimit(
  key: string,
  config: RateLimitConfig = RATE_LIMIT_PRESETS.login,
): Promise<RateLimitResult> {
  try {
    return await prisma.$transaction(async (tx) => {
      const now = new Date();

      // Atomic increment: only succeeds if count < maxAttempts AND not expired
      const updated = await tx.rateLimit.updateMany({
        where: {
          id: key,
          count: { lt: config.maxAttempts },
          expiresAt: { gte: now },
        },
        data: { count: { increment: 1 } },
      });

      if (updated.count > 0) {
        const record = await tx.rateLimit.findUnique({ where: { id: key } });
        return {
          allowed: true,
          remaining: config.maxAttempts - (record?.count ?? 1),
          resetAt: record?.expiresAt.getTime() ?? Date.now() + config.windowMs,
        };
      }

      // Record either doesn't exist, expired, or at limit
      const existing = await tx.rateLimit.findUnique({ where: { id: key } });

      if (!existing || existing.expiresAt < now) {
        const expiresAt = new Date(Date.now() + config.windowMs);
        await tx.rateLimit.upsert({
          where: { id: key },
          create: { id: key, count: 1, expiresAt },
          update: { count: 1, expiresAt },
        });
        return {
          allowed: true,
          remaining: config.maxAttempts - 1,
          resetAt: expiresAt.getTime(),
        };
      }

      return {
        allowed: false,
        remaining: 0,
        resetAt: existing.expiresAt.getTime(),
      };
    });
  } catch {
    return {
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + config.windowMs,
    };
  }
}

export async function resetRateLimit(key: string): Promise<void> {
  try {
    await prisma.rateLimit.delete({ where: { id: key } });
  } catch {
    // Key might not exist
  }
}
