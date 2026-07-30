import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import {
  CONTACT_INFO,
  HOMEPAGE_CONTENT,
  STATS_SEED,
  VILLAGE_PROFILE_DATA,
} from "../src/lib/desa-data";

// ── Helpers ──

function warnDefault(envKey: string, label: string) {
  if (!process.env[envKey]) {
    console.warn(`[seed] Using default ${label} — set ${envKey} env var`);
  }
}

function loadImageAsBase64(filePath: string): string | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    const ext = path.extname(filePath).slice(1) || "png";
    const buffer = fs.readFileSync(filePath);
    return `data:image/${ext};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

function svgPlaceholder(text: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect fill="#2563eb" width="800" height="600"/><text x="400" y="300" text-anchor="middle" fill="white" font-size="24">${text}</text></svg>`,
  ).toString("base64")}`;
}

// ── Seed data ──

const USER_CONFIGS = [
  {
    email: "pamong@tulungrejo.desa.id",
    envKey: "SEED_PAMONG_PASSWORD",
    defaultPwd: "pamong123",
    name: "Bp. Pamong Mulyono",
    role: "pamong_pajak" as const,
  },
  {
    email: "kades@tulungrejo.desa.id",
    envKey: "SEED_KADES_PASSWORD",
    defaultPwd: "kades123",
    name: "Ir. H. Sulaiman Basri",
    role: "kepala_desa" as const,
  },
  {
    email: "jurnalis@tulungrejo.desa.id",
    envKey: "SEED_JURNALIS_PASSWORD",
    defaultPwd: "jurnalis123",
    name: "Jurnalis Widya",
    role: "jurnalis" as const,
  },
];

const SUB_BLOKS = ["a", "b", "c"] as const;

// ── Main ──

async function main() {
  console.log("Seeding database...");

  // ── Users ──
  for (const c of USER_CONFIGS) {
    warnDefault(c.envKey, `${c.role} password`);
    const passwordHash = await bcrypt.hash(
      process.env[c.envKey] ?? c.defaultPwd,
      10,
    );
    await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        email: c.email,
        passwordHash,
        name: c.name,
        role: c.role,
      },
    });
  }
  console.log("  ✓ Users seeded");

  // ── VillageStats ──
  await prisma.villageStats.upsert({
    where: { id: 1 },
    update: {},
    create: STATS_SEED,
  });
  console.log("  ✓ VillageStats seeded");

  // ── VillageProfile ──
  const secretDir = path.join(__dirname, "..", ".secret");
  await prisma.villageProfile.upsert({
    where: { id: 1 },
    update: {},
    create: {
      visi: VILLAGE_PROFILE_DATA.visi,
      misi: JSON.stringify(VILLAGE_PROFILE_DATA.misi),
      strukturOrganisasi: JSON.stringify(
        VILLAGE_PROFILE_DATA.strukturOrganisasi,
      ),
      strukturOrganisasiImage: loadImageAsBase64(
        path.join(secretDir, "organigram.webp"),
      ),
      tugasFungsi: JSON.stringify(VILLAGE_PROFILE_DATA.tugasFungsi),
      administratif: JSON.stringify(VILLAGE_PROFILE_DATA.administratif),
    },
  });
  console.log("  ✓ VillageProfile seeded");

  // ── BlockImages ──
  const blockImgRegex = /^Desa Tulungrejo Blok (\d{3})([a-z])\.webp$/;
  let blockImages: Array<{
    blok: string;
    subBlok: string;
    image: string;
    mimeType: string;
  }> = [];

  try {
    if (fs.existsSync(secretDir)) {
      for (const file of fs.readdirSync(secretDir)) {
        const match = file.match(blockImgRegex);
        if (!match) continue;
        const blok = match[1];
        const subBlok = match[2];
        if (!blok || !subBlok) continue;
        const image = loadImageAsBase64(path.join(secretDir, file));
        if (image) {
          blockImages.push({ blok, subBlok, image, mimeType: "image/webp" });
        }
      }
    }
  } catch {
    console.log("  ⚠ .secret/ not accessible, using placeholder images");
  }

  if (blockImages.length === 0) {
    for (let b = 1; b <= 13; b++) {
      const blok = String(b).padStart(3, "0");
      for (const sb of SUB_BLOKS) {
        blockImages.push({
          blok,
          subBlok: sb,
          image: svgPlaceholder(`Blok ${blok}${sb}`),
          mimeType: "image/svg+xml",
        });
      }
    }
  }

  // Sequential — MariaDB adapter wraps each in a transaction, parallel exhausts pool
  for (const bi of blockImages) {
    await prisma.blockImage.upsert({
      where: { blok_subBlok: { blok: bi.blok, subBlok: bi.subBlok } },
      update: { image: bi.image },
      create: bi,
    });
  }
  console.log(`  ✓ ${blockImages.length} BlockImages seeded`);

  // ── ContactInfo ──
  await prisma.contactInfo.upsert({
    where: { id: 1 },
    update: {},
    create: {
      address: CONTACT_INFO.address,
      phone: CONTACT_INFO.phone,
      email: CONTACT_INFO.email,
      jamKerja: CONTACT_INFO.jamKerja,
      jamLibur: CONTACT_INFO.jamLibur,
      socialMedia: JSON.stringify(CONTACT_INFO.socialMedia),
    },
  });
  console.log("  ✓ ContactInfo seeded");

  // ── HomepageContent ──
  await prisma.homepageContent.upsert({
    where: { id: 1 },
    update: {},
    create: {
      heroTitle: HOMEPAGE_CONTENT.heroTitle,
      heroSubtitle: HOMEPAGE_CONTENT.heroSubtitle,
      heroDescription: HOMEPAGE_CONTENT.heroDescription,
      aboutTitle: HOMEPAGE_CONTENT.aboutTitle,
      aboutParagraphs: JSON.stringify(HOMEPAGE_CONTENT.aboutParagraphs),
      googleMapsUrl: HOMEPAGE_CONTENT.googleMapsUrl,
    },
  });
  console.log("  ✓ HomepageContent seeded");

  // ── Verification ──
  const stats = await prisma.villageStats.findFirst({
    orderBy: { id: "asc" },
  });
  console.log(
    "  → VillageStats:",
    stats?.jumlahKK,
    "KK,",
    stats?.jumlahPenduduk,
    "jiwa",
  );

  const profile = await prisma.villageProfile.findFirst({
    orderBy: { id: "asc" },
  });
  const misiCount = JSON.parse(profile?.misi ?? "[]").length;
  console.log("  → Misi:", misiCount, "items");
  const strukturCount = JSON.parse(profile?.strukturOrganisasi ?? "[]").length;
  console.log("  → Struktur:", strukturCount, "jabatan");

  console.log("Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
