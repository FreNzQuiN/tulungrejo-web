import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth/session";
import {
  checkRateLimit,
  getClientIp,
  resetRateLimit,
  RATE_LIMIT_PRESETS,
} from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan kata sandi wajib diisi." },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase();

    const ip = getClientIp({ headers: request.headers });
    if (ip) {
      const ipLimit = await checkRateLimit(`login:ip:${ip}`, undefined, true);
      if (!ipLimit.allowed) {
        return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
      }
    }

    const emailLimit = await checkRateLimit(
      `login:email:${normalizedEmail}`,
      RATE_LIMIT_PRESETS.loginEmail,
      true,
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

    if (ip) {
      await resetRateLimit(`login:ip:${ip}`);
    }
    await resetRateLimit(`login:email:${normalizedEmail}`);

    await setSessionCookie({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return NextResponse.json({ success: true, role: user.role });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan. Coba lagi." },
      { status: 500 },
    );
  }
}
