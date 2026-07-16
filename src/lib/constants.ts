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

export const VILLAGE_COLORS = {
  hero: "emerald-800",
  heroTo: "emerald-950",
  accent: "amber-500",
} as const;

export const PBB_MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

export const DUSUN_LIST = ["Tulungrejo", "Sidodadi", "TumpakGatho"] as const;

/** Max length of base64 image string (~5MB encoded, ~3.75MB raw) */
export const MAX_IMAGE_SIZE = 5_242_880;

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
