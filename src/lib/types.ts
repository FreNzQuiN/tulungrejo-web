export type UserRole = "kepala_desa" | "pamong_pajak" | "jurnalis";

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

export interface ArticleFrontmatter {
  title: string;
  slug: string;
  date: string;
  author: string;
  category: string;
  summary: string;
  image?: string;
  tags?: string[];
  published: boolean;
}

export interface Article extends ArticleFrontmatter {
  content: string;
}

export interface OrgMember {
  role: string;
  name: string;
}

export interface TugasFungsi {
  jabatan: string;
  tugas: string;
}

export interface Administratif {
  koordinat: string;
  batasUtara: string;
  batasSelatan: string;
  batasTimur: string;
  batasBarat: string;
  luasWilayah: string;
  mataPencaharianUtama: string;
  saranaPendidikan: string;
  saranaKesehatan: string;
}

export interface VillageProfile {
  visi: string;
  misi: string[];
  strukturOrganisasi: OrgMember[];
  tugasFungsi: TugasFungsi[];
  administratif: Administratif;
}

export interface FieldView {
  id: string;
  nop: string;
  ownerName: string;
  address: string;
  blok: string;
  noBidang: string;
  dusun: string;
  landArea?: number | null;
  buildingArea?: number | null;
  status: "lunas" | "belum_lunas";
}

export interface RealisasiView {
  id: string;
  totalPbb: number;
  totalBayar: number;
  persen: number;
  kurangBayar: number;
  totalSppt: number;
  dibayar: number;
  sisaSppt: number;
  tanggalAmbil: string;
  importedAt: string;
}

export type Category =
  | "Kegiatan Desa"
  | "Pembangunan"
  | "Pemberdayaan"
  | "Kesehatan"
  | "Pertanian"
  | "Pengumuman";
