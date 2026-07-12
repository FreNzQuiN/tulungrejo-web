export type UserRole = "kepala_desa" | "pamong_pajak" | "jurnalis";

// Internal role (Prisma enum) → FE display role mapping
export const ROLE_DISPLAY: Record<UserRole, string> = {
  kepala_desa: "kepala desa",
  pamong_pajak: "pamong",
  jurnalis: "jurnalis",
};

export const DISPLAY_TO_ROLE: Record<string, UserRole> = {
  pamong: "pamong_pajak",
  "kepala desa": "kepala_desa",
  jurnalis: "jurnalis",
};

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

export interface VillageStats {
  jumlahKK: number;
  jumlahPenduduk: number;
  lakiLaki: number;
  perempuan: number;
  updatedAt: string;
}

export interface LandPlot {
  id: number;
  nop: string;
  ownerName: string;
  ownerNik?: string;
  address: string;
  villageName: string;
  kecamatan: string;
  blok: string;
  latitude?: number;
  longitude?: number;
  landArea?: number;
  buildingArea?: number;
  njopLand?: number;
  njopBuilding?: number;
  pbbAmount?: number;
}

export interface Payment {
  id: number;
  landPlotId: number;
  year: number;
  month: number;
  status: "lunas" | "belum_lunas";
  paymentDate?: Date;
  markedBy?: number;
  notes?: string;
}

export interface PaymentWithPlot extends Payment {
  landPlot: LandPlot;
}

export interface PBBStats {
  totalPlots: number;
  totalPaid: number;
  totalUnpaid: number;
  percentage: number;
  totalTarget: number;
  totalRealization: number;
}

export interface BlokStats {
  blok: string;
  totalPlots: number;
  paid: number;
  unpaid: number;
  percentage: number;
}

// Article types matching FE contract
export interface ArticleFrontmatter {
  title: string;
  slug: string;
  date: string;
  author: string;
  category: string;
  summary: string; // FE uses "summary", TestLanding used "excerpt"
  image?: string; // FE uses "image", TestLanding used "coverImage"
  tags?: string[];
  published: boolean;
}

export interface Article extends ArticleFrontmatter {
  content: string;
}

// Village Profile matching FE contract
export interface OrgMember {
  role: string;
  name: string;
}

export interface TugasFungsi {
  jabatan: string;
  tugas: string;
}

export interface VillageProfile {
  visi: string;
  misi: string[];
  strukturOrganisasi: OrgMember[];
  tugasFungsi: TugasFungsi[];
  administratif: {
    koordinat: string;
    batasUtara: string;
    batasSelatan: string;
    batasTimur: string;
    batasBarat: string;
    luasWilayah: string;
    mataPencaharianUtama: string;
    saranaPendidikan: string;
    saranaKesehatan: string;
  };
}

// PBB Citizen view — FE expects flat shape
export interface CitizenView {
  id: number;
  name: string;
  dusun: string;
  lat: number;
  lng: number;
  nominal: number;
  sppt: string;
  status: "Sudah Bayar" | "Belum Bayar";
}

// Dashboard types
export interface PamongDashboard {
  assignedBlok: string;
  blokStats: BlokStats;
  recentPayments: PaymentWithPlot[];
  unpaidPlots: LandPlot[];
}

export interface JurnalisDashboard {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  recentArticles: Article[];
}

export interface MonthlyTrend {
  month: string;
  paid: number;
  unpaid: number;
  percentage: number;
}

export interface MapBlok {
  id: string;
  name: string;
  coordinates: [number, number][];
  status: "lunas" | "sebagian" | "belum";
  stats: BlokStats;
}

// FE categories
export type Category =
  | "Kegiatan Desa"
  | "Pembangunan"
  | "Pemberdayaan"
  | "Kesehatan"
  | "Pertanian"
  | "Pengumuman";
