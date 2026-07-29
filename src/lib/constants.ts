import { Landmark, Shield, FileText, type LucideIcon } from "lucide-react";
import { type UserRole } from "./types";

export const SITE_NAME = "Desa Tulungrejo";
export const SITE_DESCRIPTION =
  "Website resmi Desa Tulungrejo, Kecamatan Wates, Kabupaten Blitar";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const NAV_ITEMS = [
  { label: "Beranda", href: "/" },
  { label: "Artikel", href: "/artikel" },
  { label: "Profil Desa", href: "/profil-desa" },
] as const;

export const DASHBOARD_NAV: Record<
  UserRole,
  { label: string; href: string; icon: LucideIcon }
> = {
  kepala_desa: { label: "Dashboard Kades", href: "/kepala-desa", icon: Shield },
  pamong_pajak: { label: "Dashboard Pamong", href: "/pbb", icon: Landmark },
  jurnalis: { label: "CMS Jurnalis", href: "/jurnalis", icon: FileText },
};

export const CATEGORIES = [
  "Kegiatan Desa",
  "Pembangunan",
  "Pemberdayaan",
  "Kesehatan",
  "Pertanian",
  "Pengumuman",
] as const;

export const MAX_IMAGE_SIZE = 5_242_880;

const VALID_IMAGE_PREFIXES = [
  "data:image/webp;base64,",
  "data:image/jpeg;base64,",
  "data:image/png;base64,",
] as const;

export function validateArticleImage(image: string): string | null {
  const prefix = VALID_IMAGE_PREFIXES.find((p) => image.startsWith(p));
  const binarySize = prefix
    ? Math.round((image.length - prefix.length) * 0.75)
    : image.length;
  if (binarySize > MAX_IMAGE_SIZE) {
    return "Ukuran gambar terlalu besar (maks 5MB)";
  }
  if (!prefix) {
    return "Format gambar tidak didukung. Gunakan webp, jpeg, atau png.";
  }

  const base64Data = image.slice(prefix.length);
  const raw = Buffer.from(base64Data.slice(0, 20), "base64");

  const type = prefix.replace("data:image/", "").replace(";base64,", "");
  let valid: boolean;

  switch (type) {
    case "png":
      valid =
        raw.length >= 4 &&
        raw[0] === 0x89 &&
        raw[1] === 0x50 &&
        raw[2] === 0x4e &&
        raw[3] === 0x47;
      break;
    case "jpeg":
      valid = raw.length >= 2 && raw[0] === 0xff && raw[1] === 0xd8;
      break;
    case "webp":
      valid =
        raw.length >= 12 &&
        raw[0] === 0x52 &&
        raw[1] === 0x49 &&
        raw[2] === 0x46 &&
        raw[3] === 0x46 &&
        raw[8] === 0x57 &&
        raw[9] === 0x45 &&
        raw[10] === 0x42 &&
        raw[11] === 0x50;
      break;
    default:
      valid = false;
  }

  if (!valid) return "Gambar tidak valid";
  return null;
}

export const BLOK_TO_DUSUN: Record<string, string> = {
  "001": "Tulungrejo",
  "002": "Tulungrejo",
  "003": "Tulungrejo",
  "004": "Tulungrejo",
  "005": "Tulungrejo",
  "006": "Sidodadi",
  "007": "Sidodadi",
  "008": "Sidodadi",
  "009": "Sidodadi",
  "010": "Sidodadi",
  "011": "Sidodadi",
  "012": "Sidodadi",
  "013": "TumpakGatho",
} as const;

export const ARTICLE_IMAGE_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%23059669' width='800' height='600'/%3E%3C/svg%3E";
