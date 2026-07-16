import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp, RATE_LIMIT_PRESETS } from "./rate-limit";

export async function checkApiRateLimit(
  req: Request,
  namespace = "api",
): Promise<boolean> {
  const ip = getClientIp(req);
  if (!ip) return true; // synthetic/build context — allow
  const rl = await checkRateLimit(`${namespace}:${ip}`, RATE_LIMIT_PRESETS.api);
  return rl.allowed;
}

export function rateLimitResponse() {
  return NextResponse.json(
    { error: "Terlalu banyak permintaan. Coba lagi nanti." },
    { status: 429, headers: { "Cache-Control": "no-store" } },
  );
}
