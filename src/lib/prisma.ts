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
  const adapter = new PrismaMariaDb({
    host: parsed.hostname,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.slice(1),
    port: Number(parsed.port) || 4000,
    ssl: { rejectUnauthorized: false },
    connectTimeout: 30_000,
    acquireTimeout: 30_000,
    connectionLimit: 10,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "production" ? [] : ["error", "warn"],
  });
}

const prismaInternal = globalForPrisma.prisma ?? createPrismaClient();
globalForPrisma.prisma = prismaInternal;

// Dev: jaga koneksi TiDB tetap hangat biar gak cold start
// Cold start bikin render hang >10s → Next.js dev server trigger reload loop
if (process.env.NODE_ENV === "development") {
  // Eager connect: mulai koneksi pas module load, biar request pertama gak nunggu cold start
  prismaInternal.$connect().catch(() => {});
  // Keepalive ping tiap 60 detik cegah TiDB spin down
  setInterval(() => {
    prismaInternal.$queryRaw`SELECT 1`.catch(() => {});
  }, 60_000);
}

export const prisma = prismaInternal;
