export type UserRole = "kepala_desa" | "pamong_pajak" | "jurnalis";

export const ALLOWED_ROLES = [
  "kepala_desa",
  "pamong_pajak",
  "jurnalis",
] as const;

export const PAYMENT_STATUS = {
  LUNAS: "lunas",
  BELUM_LUNAS: "belum_lunas",
} as const;

export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const ROLE_DISPLAY: Record<UserRole, string> = {
  kepala_desa: "kepala desa",
  pamong_pajak: "pamong",
  jurnalis: "jurnalis",
};

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
  strukturOrganisasiImage?: string;
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
  status: PaymentStatus;
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
  tahun: number;
}

export interface PaymentRecord {
  id: string;
  fieldId: string;
  year: number;
  status: PaymentStatus;
  markedAt: string | null;
  notes: string | null;
  markerName: string | null;
}

export interface SocialMediaLink {
  platform: string;
  url: string;
}

export interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  jamKerja: string;
  jamLibur: string;
  socialMedia: SocialMediaLink[];
}

export interface HomepageContent {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  aboutTitle: string;
  aboutParagraphs: string[];
  googleMapsUrl: string;
}
