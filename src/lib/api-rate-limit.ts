import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp, RATE_LIMIT_PRESETS } from "./rate-limit";
import type { RateLimitResult } from "./rate-limit";

const cache = new Map<string, { result: RateLimitResult; expiresAt: number }>();
const CACHE_TTL_MS = 5_000;
const MAX_CACHE_SIZE = 10_000;

function getCached(key: string): RateLimitResult | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() >= entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.result;
}

function setCached(key: string, result: RateLimitResult): void {
  if (cache.size >= MAX_CACHE_SIZE) {
    // Random eviction instead of bulk clear — preserves most cache entries
    const keys = Array.from(cache.keys());
    const randomKey = keys[Math.floor(Math.random() * keys.length)]!;
    cache.delete(randomKey);
  }
  cache.set(key, { result, expiresAt: Date.now() + CACHE_TTL_MS });
}

export async function checkApiRateLimit(
  req: Request,
  namespace = "api",
): Promise<boolean> {
  const ip = getClientIp(req);

  const cacheKey = `${namespace}:${ip}`;

  // For unknown IPs, use a stricter shared limit
  if (ip === "unknown") {
    const rl = await checkRateLimit(
      `${namespace}:unknown`,
      { windowMs: 60_000, maxAttempts: 10 },
      true,
    );
    return rl.allowed;
  }

  const cached = getCached(cacheKey);
  if (cached) return cached.allowed;

  const rl = await checkRateLimit(cacheKey, RATE_LIMIT_PRESETS.api, true);
  setCached(cacheKey, rl);
  return rl.allowed;
}

export function rateLimitResponse() {
  return NextResponse.json(
    { error: "Terlalu banyak permintaan. Coba lagi nanti." },
    { status: 429, headers: { "Cache-Control": "no-store" } },
  );
}
