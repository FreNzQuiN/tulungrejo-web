import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const parsed = new URL(url);

  let ssl;
  const caB64 = process.env.SSL_CA_BUNDLE_B64;
  if (caB64) {
    ssl = {
      ca: [Buffer.from(caB64, "base64").toString("utf-8")],
      rejectUnauthorized: true,
    };
  } else {
    const caPath = process.env.SSL_CA_PATH;
    ssl = caPath
      ? { ca: [readFileSync(caPath)], rejectUnauthorized: true }
      : { rejectUnauthorized: true };
  }

  const adapter = new PrismaMariaDb({
    host: parsed.hostname,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.slice(1),
    port: Number(parsed.port) || 4000,
    ssl,
    connectTimeout: 10_000,
    acquireTimeout: 15_000,
    socketTimeout: 5_000,
    connectionLimit: 5,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "production" ? [] : ["error", "warn"],
  });
}

const prismaInternal = globalForPrisma.prisma ?? createPrismaClient();
globalForPrisma.prisma = prismaInternal;

export const prisma = prismaInternal;
