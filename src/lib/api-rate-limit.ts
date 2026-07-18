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
  if (cache.size >= MAX_CACHE_SIZE) cache.clear();
  cache.set(key, { result, expiresAt: Date.now() + CACHE_TTL_MS });
}

export async function checkApiRateLimit(
  req: Request,
  namespace = "api",
): Promise<boolean> {
  const ip = getClientIp(req);
  if (!ip) return true;

  const cacheKey = `${namespace}:${ip}`;
  const cached = getCached(cacheKey);
  if (cached) return cached.allowed;

  const rl = await checkRateLimit(cacheKey, RATE_LIMIT_PRESETS.api);
  setCached(cacheKey, rl);
  return rl.allowed;
}

export function rateLimitResponse() {
  return NextResponse.json(
    { error: "Terlalu banyak permintaan. Coba lagi nanti." },
    { status: 429, headers: { "Cache-Control": "no-store" } },
  );
}
