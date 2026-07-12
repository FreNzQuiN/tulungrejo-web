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

// FE contract categories
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

export const DUSUN_LIST = ["Junggo", "Wonorejo"] as const;

export const ARTICLE_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&q=80&w=800";
