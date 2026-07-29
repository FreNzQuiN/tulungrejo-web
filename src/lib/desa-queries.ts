import { cacheTag, cacheLife } from "next/cache";
import { prisma } from "./prisma";
import { safeJsonParse } from "./utils";
import {
  CONTACT_INFO,
  HOMEPAGE_CONTENT,
  STATS_SEED,
  VILLAGE_PROFILE_DATA,
} from "./desa-data";
import type {
  Administratif,
  ContactInfo,
  HomepageContent,
  VillageProfile,
} from "./types";

export interface VillageStatsData {
  jumlahKK: number;
  jumlahPenduduk: number;
  lakiLaki: number;
  perempuan: number;
}

async function fetchVillageStats(): Promise<VillageStatsData> {
  const data = await prisma.villageStats.findFirst({ orderBy: { id: "asc" } });
  if (!data) {
    console.warn(
      "[desa-queries] getVillageStats: DB kosong, fallback ke STATS_SEED",
    );
    return STATS_SEED;
  }
  return {
    jumlahKK: data.jumlahKK,
    jumlahPenduduk: data.jumlahPenduduk,
    lakiLaki: data.lakiLaki,
    perempuan: data.perempuan,
  };
}

export async function getVillageStats(): Promise<VillageStatsData> {
  if (process.env.NODE_ENV === "production") {
    return getVillageStatsCached();
  }
  return fetchVillageStats();
}

async function getVillageStatsCached(): Promise<VillageStatsData> {
  "use cache: remote";
  cacheTag("village-stats");
  cacheLife("hours");
  return fetchVillageStats();
}

async function fetchVillageProfile(): Promise<VillageProfile> {
  const dbProfile = await prisma.villageProfile.findFirst({
    orderBy: { id: "asc" },
  });
  if (!dbProfile) {
    console.warn(
      "[desa-queries] getVillageProfile: DB kosong, fallback ke VILLAGE_PROFILE_DATA",
    );
    return {
      visi: VILLAGE_PROFILE_DATA.visi,
      misi: VILLAGE_PROFILE_DATA.misi,
      strukturOrganisasi: VILLAGE_PROFILE_DATA.strukturOrganisasi,
      strukturOrganisasiImage:
        VILLAGE_PROFILE_DATA.strukturOrganisasiImage ?? undefined,
      tugasFungsi: VILLAGE_PROFILE_DATA.tugasFungsi,
      administratif: VILLAGE_PROFILE_DATA.administratif,
    };
  }
  return {
    visi: dbProfile.visi,
    misi: safeJsonParse<string[]>(dbProfile.misi, VILLAGE_PROFILE_DATA.misi),
    strukturOrganisasi: safeJsonParse<{ role: string; name: string }[]>(
      dbProfile.strukturOrganisasi,
      VILLAGE_PROFILE_DATA.strukturOrganisasi,
    ),
    strukturOrganisasiImage: dbProfile.strukturOrganisasiImage ?? undefined,
    tugasFungsi: safeJsonParse<{ jabatan: string; tugas: string }[]>(
      dbProfile.tugasFungsi,
      VILLAGE_PROFILE_DATA.tugasFungsi,
    ),
    administratif: safeJsonParse<Administratif>(
      dbProfile.administratif,
      VILLAGE_PROFILE_DATA.administratif,
    ),
  };
}

export async function getVillageProfile(): Promise<VillageProfile> {
  if (process.env.NODE_ENV === "production") {
    return getVillageProfileCached();
  }
  return fetchVillageProfile();
}

async function getVillageProfileCached(): Promise<VillageProfile> {
  "use cache: remote";
  cacheTag("village-profile");
  cacheLife("hours");
  return fetchVillageProfile();
}

async function fetchContactInfo(): Promise<ContactInfo> {
  const db = await prisma.contactInfo.findFirst({
    orderBy: { id: "asc" },
  });
  if (!db) {
    console.warn(
      "[desa-queries] getContactInfo: DB kosong, fallback ke CONTACT_INFO",
    );
    return CONTACT_INFO;
  }
  return {
    address: db.address,
    phone: db.phone,
    email: db.email,
    jamKerja: db.jamKerja,
    jamLibur: db.jamLibur,
    socialMedia: safeJsonParse<{ platform: string; url: string }[]>(
      db.socialMedia,
      CONTACT_INFO.socialMedia,
    ),
  };
}

export async function getContactInfo(): Promise<ContactInfo> {
  if (process.env.NODE_ENV === "production") {
    return getContactInfoCached();
  }
  return fetchContactInfo();
}

async function getContactInfoCached(): Promise<ContactInfo> {
  "use cache: remote";
  cacheTag("contact-info");
  cacheLife("hours");
  return fetchContactInfo();
}

async function fetchHomepageContent(): Promise<HomepageContent> {
  const db = await prisma.homepageContent.findFirst({
    orderBy: { id: "asc" },
  });
  if (!db) {
    console.warn(
      "[desa-queries] getHomepageContent: DB kosong, fallback ke HOMEPAGE_CONTENT",
    );
    return HOMEPAGE_CONTENT;
  }
  return {
    heroTitle: db.heroTitle,
    heroSubtitle: db.heroSubtitle,
    heroDescription: db.heroDescription,
    heroImage: db.heroImage,
    aboutTitle: db.aboutTitle,
    aboutParagraphs: safeJsonParse<string[]>(
      db.aboutParagraphs,
      HOMEPAGE_CONTENT.aboutParagraphs,
    ),
    googleMapsUrl: db.googleMapsUrl,
  };
}

export async function getHomepageContent(): Promise<HomepageContent> {
  if (process.env.NODE_ENV === "production") {
    return getHomepageContentCached();
  }
  return fetchHomepageContent();
}

async function getHomepageContentCached(): Promise<HomepageContent> {
  "use cache: remote";
  cacheTag("homepage-content");
  cacheLife("hours");
  return fetchHomepageContent();
}
