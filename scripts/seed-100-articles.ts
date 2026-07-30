import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { config } from "dotenv";

config({ path: ".env" });

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");

  const parsed = new URL(url);
  let ssl: Record<string, unknown>;
  const caB64 = process.env.SSL_CA_BUNDLE_B64;
  if (caB64) {
    ssl = {
      ca: [Buffer.from(caB64, "base64").toString("utf-8")],
      rejectUnauthorized: true,
    };
  } else {
    const caPath = process.env.SSL_CA_PATH;
    ssl = caPath
      ? { ca: [readFileSync(caPath)], rejectUnauthorized: true }
      : { rejectUnauthorized: true };
  }

  const adapter = new PrismaMariaDb({
    host: parsed.hostname,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.slice(1),
    port: Number(parsed.port) || 4000,
    ssl,
    connectTimeout: 10_000,
    acquireTimeout: 15_000,
    socketTimeout: 5_000,
    connectionLimit: 5,
  });

  return new PrismaClient({ adapter });
}

const CATEGORIES = [
  "Kegiatan Desa",
  "Pembangunan",
  "Pemberdayaan",
  "Kesehatan",
  "Pertanian",
  "Pengumuman",
] as const;

const AUTHORS = [
  "Humas Desa Tulungrejo",
  "Tim Pemberdayaan Desa",
  "BPD Desa Tulungrejo",
  "Kader Kesehatan",
  "Kelompok Tani",
];

const TAGS_POOL = [
  "gotong-royong",
  "pembangunan",
  "kesehatan",
  "pertanian",
  "pendidikan",
  "bantuan",
  "infrastruktur",
  "lingkungan",
  "pemberdayaan",
  "olahraga",
  "seni-budaya",
  "sosialisasi",
  "pelatihan",
  "pemerintahan",
  "pemuda",
];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function pickN<T>(arr: readonly T[], min: number, max: number): T[] {
  const n = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function makeSlug(title: string, index: number): string {
  const base = slugify(title);
  return `${base}-${index}`;
}

const TITLE_TEMPLATES = [
  // Kegiatan Desa
  "Gotong Royong Bersihkan {}",
  "Kegiatan Posyandu {}",
  "Rapat Rutin BPD Bulan {}",
  "Musyawarah Desa {}",
  "Peringatan Hari {} di Desa Tulungrejo",
  "Kegiatan Kerja Bakti {}",
  "Monitoring Pembangunan {}",
  "Sosialisasi Program Pemerintah {}",
  "Penyuluhan {}",
  "Pelatihan {} bagi Warga",
  "Penyaluran Bantuan {}",
  "Kegiatan Karang Taruna {}",
  "Pengajian Rutin {}",
  "Senam Sehat {}",
  "Lomba {} Desa Tulungrejo",
  "Bazar {}",
  "Donor Darah {}",
  "Vaksinasi {}",
  "Pemeriksaan Kesehatan Gratis {}",
  "Panen Raya {}",
];

const FILLERS = [
  "Musim Hujan",
  "Musim Kemarau",
  "Tahun 2025",
  "Tahun 2026",
  "Bulan Januari",
  "Bulan Februari",
  "Bulan Maret",
  "Bulan April",
  "Bulan Mei",
  "Bulan Juni",
  "Bulan Juli",
  "Bulan Agustus",
  "Bulan September",
  "Bulan Oktober",
  "Bulan November",
  "Bulan Desember",
  "Minggu Lalu",
  "Akhir Pekan",
  "Kemarin",
  "Minggu Ini",
  "Sektor Pertanian",
  "Sektor Pendidikan",
  "Sektor Kesehatan",
  "RW 01",
  "RW 02",
  "RW 03",
  "RW 04",
  "Dusun Tulungrejo",
  "Dusun Sidodadi",
  "Dusun TumpakGatho",
  "Bersama Warga",
  "Bersama Pemuda",
  "Bersama PKK",
];

const CONTENT_TEMPLATE = `# {title}

**Desa Tulungrejo** — {summary}

## Latar Belakang

Kegiatan ini merupakan bagian dari program rutin yang diselenggarakan oleh pemerintah Desa Tulungrejo sebagai upaya untuk meningkatkan kesejahteraan dan partisipasi masyarakat dalam pembangunan desa.

## Pelaksanaan

Kegiatan dilaksanakan di {place} pada hari {day}, {date} dan dihadiri oleh {attendees}. Acara berjalan dengan lancar dan penuh antusiasme dari seluruh peserta yang hadir.

## Hasil dan Manfaat

Beberapa hasil yang dicapai dari kegiatan ini antara lain:

1. Terjalinnya kerjasama yang baik antar warga desa
2. Meningkatnya kesadaran masyarakat akan pentingnya {topic}
3. Terselesaikannya beberapa program kerja yang telah direncanakan
4. Meningkatnya partisipasi masyarakat dalam pembangunan desa

## Dokumentasi

Dokumentasi kegiatan dapat dilihat pada galeri foto Desa Tulungrejo. Untuk informasi lebih lanjut, silakan hubungi Kantor Desa Tulungrejo.

## Penutup

Demikian laporan kegiatan ini disampaikan. Terima kasih kepada seluruh pihak yang telah berpartisipasi dan mendukung terselenggaranya kegiatan ini. Semoga kegiatan serupa dapat terus dilaksanakan di masa mendatang demi kemajuan Desa Tulungrejo.

*Humas Desa Tulungrejo*`;

const PLACES = [
  "Balai Desa Tulungrejo",
  "Lapangan Desa",
  "Pendopo Balai Desa",
  "Posyandu Mawar",
  "Posyandu Melati",
  "Sekolah Dasar Negeri",
  "Madrasah Diniyah",
  "Rumah Kepala Desa",
  "Aula Kantor Desa",
];

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

const ATTENDEES = [
  "perangkat desa dan warga masyarakat",
  "seluruh lapisan masyarakat Desa Tulungrejo",
  "Kepala Desa beserta perangkat desa",
  "BPD, LPMD, dan tokoh masyarakat",
  "warga dari 3 dusun",
  "Kader PKK dan warga desa",
];

const TOPICS = [
  "gotong royong",
  "kebersihan lingkungan",
  "kesehatan masyarakat",
  "pembangunan infrastruktur",
  "pemberdayaan ekonomi",
  "pendidikan anak",
  "pertanian berkelanjutan",
  "pelestarian budaya",
];

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function randomDate(index: number): Date {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 365) + index;
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  return d;
}

function injectVariables(
  template: string,
  vars: Record<string, string>,
): string {
  let result = template;
  for (const [key, val] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), val);
  }
  return result;
}

async function main() {
  const prisma = createPrismaClient();

  try {
    const existing = await prisma.article.count();
    console.log(`Existing articles: ${existing}`);

    const toCreate = 100;
    const batch: Array<{
      title: string;
      slug: string;
      date: Date;
      author: string;
      category: string;
      summary: string;
      content: string;
      image: string | null;
      tags: string | null;
      published: boolean;
    }> = [];

    for (let i = 0; i < toCreate; i++) {
      const filler1 = pick(FILLERS);
      const filler2 = pick(FILLERS);
      const title = injectVariables(pick(TITLE_TEMPLATES), {
        "": filler1,
      }).replace("{}", filler1);

      const category = pick(CATEGORIES);
      const author = pick(AUTHORS);
      const summary = `Kegiatan ${category.toLowerCase()} di ${filler2} berjalan dengan lancar dan penuh antusiasme.`;
      const slug = makeSlug(title, i + 1);
      const date = randomDate(i);
      const place = pick(PLACES);
      const day = pick(DAYS);
      const attendees = pick(ATTENDEES);
      const topic = pick(TOPICS);
      const tags = pickN(TAGS_POOL, 1, 4);

      const content = injectVariables(CONTENT_TEMPLATE, {
        title,
        summary,
        place,
        day,
        date: date.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        attendees,
        topic,
      });

      batch.push({
        title,
        slug: `${slug}-perf`,
        date,
        author,
        category,
        summary,
        content,
        image: null,
        tags: JSON.stringify(tags),
        published: true,
      });
    }

    // Insert in chunks to avoid overwhelming connection
    const CHUNK = 25;
    for (let i = 0; i < batch.length; i += CHUNK) {
      const chunk = batch.slice(i, i + CHUNK);
      await prisma.article.createMany({ data: chunk });
      console.log(`Inserted ${Math.min(i + CHUNK, batch.length)}/${toCreate}`);
    }

    const total = await prisma.article.count();
    console.log(`\nDone! Total articles now: ${total}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
