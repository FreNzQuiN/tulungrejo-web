import { BLOK_TO_DUSUN } from "@/lib/constants";

export function parseDate(value: unknown): Date | null {
  if (value == null) return null;
  if (typeof value === "number") {
    const d = new Date(Math.round((value - 25569) * 86400 * 1000));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const str = String(value).trim();
  if (!str) return null;

  const dmy = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmy) {
    const d = new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/);
  if (iso) {
    const d = new Date(
      Number(iso[1]),
      Number(iso[2]) - 1,
      Number(iso[3]),
      Number(iso[4]),
      Number(iso[5]),
      Number(iso[6]),
    );
    return Number.isNaN(d.getTime()) ? null : d;
  }

  return null;
}

export function buildNop(
  parts: (string | number | null | undefined)[],
): string {
  return parts
    .filter((p) => p != null && String(p).trim() !== "")
    .map((p) => String(p).trim())
    .join(".");
}

export function buildNoUrut(blok: string, noBidang: string): string {
  return `${blok}${noBidang}`;
}

export function roundLandArea(val: unknown): number | null {
  if (val == null) return null;
  const n = typeof val === "number" ? val : Number(val);
  if (Number.isNaN(n)) return null;
  return Math.round(n * 100) / 100;
}

export function deriveDusun(blok: string): string {
  return BLOK_TO_DUSUN[blok] ?? "Tulungrejo";
}

export function sanitizeBlok(val: unknown): string | null {
  if (val == null) return null;
  const s = String(val).trim().padStart(3, "0");
  if (!/^\d{3}$/.test(s)) return null;
  if (s === "000") return null;
  if (!BLOK_TO_DUSUN[s]) return null;
  return s;
}

export function sanitizeNoBidang(val: unknown): string | null {
  if (val == null) return null;
  const s = String(val).trim().padStart(4, "0");
  if (!/^\d{4}$/.test(s)) return null;
  return s;
}

export function cellValue(row: unknown[], idx: number): unknown {
  if (idx >= row.length) return null;
  const v = row[idx];
  if (v == null) return null;
  return v;
}
