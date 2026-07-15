import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth-custom";
import {
  checkRateLimit,
  getClientIp,
  resetRateLimit,
  RATE_LIMIT_PRESETS,
} from "@/lib/rate-limit";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email dan kata sandi wajib diisi." },
      { status: 400 },
    );
  }

  const ip = getClientIp({ headers: request.headers });
  if (!ip) {
    return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
  }

  const ipLimit = await checkRateLimit(`login:ip:${ip}`);
  if (!ipLimit.allowed) {
    return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
  }

  const normalizedEmail = email.toLowerCase();
  const emailLimit = await checkRateLimit(
    `login:email:${normalizedEmail}`,
    RATE_LIMIT_PRESETS.loginEmail,
  );
  if (!emailLimit.allowed) {
    return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Email atau kata sandi salah." },
      { status: 401 },
    );
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { error: "Email atau kata sandi salah." },
      { status: 401 },
    );
  }

  await resetRateLimit(`login:ip:${ip}`);
  await resetRateLimit(`login:email:${normalizedEmail}`);

  await setSessionCookie({
    id: String(user.id),
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return NextResponse.json({ success: true });
}
