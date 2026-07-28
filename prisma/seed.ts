import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import { HOMEPAGE_CONTENT } from "../src/lib/desa-data";

async function main() {
  console.log("Seeding database...");

  const PAMONG_PASSWORD = process.env.SEED_PAMONG_PASSWORD ?? "pamong123";
  const KADES_PASSWORD = process.env.SEED_KADES_PASSWORD ?? "kades123";
  const JURNALIS_PASSWORD = process.env.SEED_JURNALIS_PASSWORD ?? "jurnalis123";

  if (!process.env.SEED_PAMONG_PASSWORD) {
    console.warn(
      "[seed] Using default pamong password — set SEED_PAMONG_PASSWORD env var",
    );
  }
  if (!process.env.SEED_KADES_PASSWORD) {
    console.warn(
      "[seed] Using default kades password — set SEED_KADES_PASSWORD env var",
    );
  }
  if (!process.env.SEED_JURNALIS_PASSWORD) {
    console.warn(
      "[seed] Using default jurnalis password — set SEED_JURNALIS_PASSWORD env var",
    );
  }

  const passwordPamong = await bcrypt.hash(PAMONG_PASSWORD, 10);
  const passwordKades = await bcrypt.hash(KADES_PASSWORD, 10);
  const passwordJurnalis = await bcrypt.hash(JURNALIS_PASSWORD, 10);

  await prisma.user.upsert({
    where: { email: "pamong@tulungrejo.desa.id" },
    update: {},
    create: {
      email: "pamong@tulungrejo.desa.id",
      passwordHash: passwordPamong,
      name: "Bp. Pamong Mulyono",
      role: "pamong_pajak",
      assignedBlok: null,
    },
  });

  await prisma.user.upsert({
    where: { email: "kades@tulungrejo.desa.id" },
    update: {},
    create: {
      email: "kades@tulungrejo.desa.id",
      passwordHash: passwordKades,
      name: "Ir. H. Sulaiman Basri",
      role: "kepala_desa",
    },
  });

  await prisma.user.upsert({
    where: { email: "jurnalis@tulungrejo.desa.id" },
    update: {},
    create: {
      email: "jurnalis@tulungrejo.desa.id",
      passwordHash: passwordJurnalis,
      name: "Jurnalis Widya",
      role: "jurnalis",
    },
  });

  console.log("  ✓ Users seeded");

  await prisma.villageStats.upsert({
    where: { id: 1 },
    update: {},
    create: {
      jumlahKK: 1144,
      jumlahPenduduk: 3176,
      lakiLaki: 1564,
      perempuan: 1612,
    },
  });

  console.log("  ✓ VillageStats seeded");

  await prisma.villageProfile.upsert({
    where: { id: 1 },
    update: {},
    create: {
      visi: "Maju Bersama Rakyat Membangun Desa Tulungrejo Dengan Aman, Beriman, Damai, Dan Sejahtera Berlandasakan Pancasila Dan Undang-Undang Dasar 1945",
      misi: JSON.stringify([
        "Mewujudkan dan mengembangkan kegiatan keagamaan untuk menambah keimanan dan ketaqwaan kepada Tuhan Yang Maha Esa, melalui kegiatan kegiatan pengajian-pengajian, Majelis Taklim, serta kegiatan kegiatan positif seperti mengadakan pembinaan bersholawat bersama.",
        "Mewujudkan penyelenggaraan Pemerintahan yang berwibawa, adil dan bijaksana dengan mengedepankan Musyawarah mufakat dan transparansi, selalu terbuka menerima kritik dan saran Masyarakat.",
        "Membangun dan meningkatkan hasil pertanian dengan jalan penataan pengairan, perbaikan jalan sawah / jalan usaha tani, serta dengan melalui pelatihan pelatihan di bidang pertanian agar terciptanya masyarakat petani yang berpengetahuan dalam pola tanam yang benar.",
        "Menata Pemerintahan Desa Tulungrejo yang kompak dan bertanggung jawab dalam mengemban amanat masyarakat dengan cara melibatkan seluruh elemen masyarakat dalam musyawarah untuk mengambil keputusan.",
        "Meningkatkan pelayanan masyarakat secara terpadu dan serius dengan cara melayani masyarakat di waktu jam kerja maupun di luar jam kerja.",
        "Mencari dan menambah debet air untuk mencukupi kebutuhan pertanian dengan pembangunan Sumur Bor dan Pipanisasi yang di peruntukan untuk pertanian sehingga bisa meningkatkan hasil pertanian, yang selama ini hanya mengandalkan air hujan.",
        "Menumbuh Kembangkan Kelompok Tani dan Gabungan Kelompok Tani serta bekerja sama dengan HIPPA untuk memfasilitasi kebutuhan Petani.",
        "Menumbuh kembangkan usaha kecil dan menengah dengan cara mengadakan pelatihan pelatihan yang di sesuaikan dengan keahlian yang di butuhkan untuk melaksanakan berbagai aspek kegiatan usaha, mulai perencanaan produksi sampai pemasarannya.",
        "Luasnya pekarangan penduduk yang dapat di tanami buah-buah, kayu untuk bangunan (sengon, Jati dll) untuk Melestarikan Lingkungan Hidup.",
        "Membangun dan mendorong majunya bidang pendidikan baik formal maupun informal yang mudah diakses dan dinikmati seluruh warga masyarakat tanpa terkecuali yang mampu menghasilkan insan intelektual, inovatif dan enterpreneur (wirausahawan) dengan pembangunan sarana dan prasarana yang memadai.",
        "Membangun dan mendorong usaha-usaha untuk pengembangan dan optimalisasi sektor pertanian, perkebunan, peternakan, dan perikanan, baik tahap produksi maupun tahap pengolahan hasilnya.",
      ]),
      strukturOrganisasi: JSON.stringify([
        { role: "Kepala Desa", name: "Tarmuji Priono" },
        { role: "Sekretaris Desa", name: "Sunaryanto" },
        { role: "Kasi Pemerintahan", name: "Warsi" },
        { role: "Kasi Pelayanan", name: "Widodo" },
        { role: "Kasi Kesejahteraan", name: "Subandi" },
        { role: "Kaur Perencanaan", name: "Eko Arif Mustofa" },
        { role: "Kaur Keuangan", name: "Rushadi" },
        { role: "Kaur Tata Usaha dan Umum", name: "Dadang Sulistiono" },
        { role: "Kamituwo I", name: "Joko Susanto" },
        { role: "Kamituwo II", name: "Sutik" },
      ]),
      strukturOrganisasiImage: (() => {
        try {
          const orgImgPath = path.join(
            __dirname,
            "..",
            ".secret",
            "organigram.webp",
          );
          if (fs.existsSync(orgImgPath)) {
            const buffer = fs.readFileSync(orgImgPath);
            return `data:image/webp;base64,${buffer.toString("base64")}`;
          }
        } catch {
          /* silently fall back */
        }
        return null;
      })(),
      tugasFungsi: JSON.stringify([
        {
          jabatan: "Kepala Desa",
          tugas:
            "Kepala Desa bertugas menyelenggarakan Pemerintahan Desa, melaksanakan pembangunan, pembinaan kemasyarakatan, dan pemberdayaan masyarakat.",
        },
        {
          jabatan: "Sekretaris Desa",
          tugas:
            "Sekretaris Desa bertugas membantu Kepala Desa dalam bidang administrasi pemerintahan.",
        },
        {
          jabatan: "Kaur Perencanaan",
          tugas:
            "Kepala urusan perencanaan memiliki fungsi mengoordinasikan urusan perencanaan seperti menyusun rencana anggaran pendapatan dan belanja desa, menginventarisir data-data dalam rangka pembangunan, melakukan monitoring dan evaluasi program, serta penyusunan laporan.",
        },
        {
          jabatan: "Kaur Keuangan",
          tugas:
            "Kepala urusan keuangan memiliki fungsi seperti melaksanakan urusan keuangan seperti pengurusan administrasi keuangan, administrasi sumber-sumber pendapatan dan pengeluaran, verifikasi administrasi keuangan pemerintahan desa.",
        },
        {
          jabatan: "Kaur Tata Usaha dan Umum",
          tugas:
            "Kepala urusan tata usaha dan umum memiliki fungsi seperti melaksanakan urusan ketatausahaan seperti tata naskah, administrasi surat menyurat, arsip, dan ekspedisi, dan penataan administrasi perangkat desa, penyediaan prasarana perangkat desa dan kantor, penyiapan rapat, pengadministrasian aset, inventarisasi, perjalanan dinas, dan pelayanan umum.",
        },
        {
          jabatan: "Kasi Pemerintahan",
          tugas:
            "Kepala seksi pemerintahan mempunyai fungsi melaksanakan manajemen tata praja Pemerintahan, menyusun regulasi desa, pembinaan masalah pertanahan, pembinaan ketentraman dan ketertiban, pelaksanaan upaya perlindungan masyarakat, kependudukan, penataan dan pengelolaan wilayah, serta pendataan dan pengelolaan Profil Desa.",
        },
        {
          jabatan: "Kasi Pelayanan",
          tugas:
            "Kepala Seksi pelayanan memiliki fungsi melaksanakan penyuluhan dan motivasi terhadap pelaksanaan hak dan kewajiban masyarakat, meningkatkan upaya partisipasi masyarakat, pelestarian nilai sosial budaya masyarakat, keagamaan, dan ketenagakerjaan.",
        },
        {
          jabatan: "Kasi Kesejahteraan",
          tugas:
            "Kepala seksi kesejahteraan mempunyai fungsi melaksanakan pembangunan sarana prasarana perdesaan, pembangunan bidang pendidikan, kesehatan, dan tugas sosialisasi serta motivasi masyarakat di bidang budaya, ekonomi, politik, lingkungan hidup, pemberdayaan keluarga, pemuda, olahraga, dan karang taruna.",
        },
        {
          jabatan: "Kamituwo I",
          tugas:
            "Kamituwo berkedudukan sebagai unsur satuan tugas kewilayahan yang bertugas membantu Kepala Desa dalam pelaksanaan tugasnya di wilayahnya.",
        },
        {
          jabatan: "Kamituwo II",
          tugas:
            "Kamituwo berkedudukan sebagai unsur satuan tugas kewilayahan yang bertugas membantu Kepala Desa dalam pelaksanaan tugasnya di wilayahnya.",
        },
      ]),
      administratif: JSON.stringify({
        koordinat: "8°16′9.73668″S 112°19′47.05806″E",
        batasUtara:
          "Sebelah Utara: Desa Sumberarum, Kecamatan Wates, Kabupaten Blitar",
        batasSelatan:
          "Sebelah Selatan: Desa Ringinrejo, Kecamatan Wates; dan Perhutani",
        batasTimur: "Sebelah Timur: Desa Ringinrejo, Kecamatan Wates",
        batasBarat:
          "Sebelah Barat: Desa Purworejo, Kecamatan Wates; dan Desa Balerejo, Kecamatan Panggungrejo",
        luasWilayah:
          "2 Dusun (Tulungrejo & Sidodadi), Total Luas 902,75 Hektar",
        mataPencaharianUtama:
          "Pertanian, Jasa/Perdagangan, Sektor Industri, dan Sektor Lain",
        saranaPendidikan: "Tingkat Pendidikan Dasar 9 Tahun (SD & SMP)",
        saranaKesehatan: "Puskesmas dan Polindes",
      }),
    },
  });

  console.log("  ✓ VillageProfile seeded");

  await prisma.contactInfo.upsert({
    where: { id: 1 },
    update: {},
    create: {
      address: "Desa Tulungrejo, Kecamatan Wates, Kabupaten Blitar, Jawa Timur",
      phone: "085791371559",
      email: "pemdes.tulungrejo@gmail.com",
      jamKerja: "Senin-Jumat 08:00-16:00",
      jamLibur: "Sabtu-Minggu",
      socialMedia: JSON.stringify([
        { platform: "Facebook", url: "#" },
        { platform: "YouTube", url: "#" },
      ]),
    },
  });

  console.log("  ✓ ContactInfo seeded");

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

  const secretDir = path.join(__dirname, "..", ".secret");
  const blockImgRegex = /^Desa Tulungrejo Blok (\d{3})([a-z])\.webp$/;
  let blockImages: {
    blok: string;
    subBlok: string;
    image: string;
    mimeType: string;
  }[] = [];

  try {
    if (fs.existsSync(secretDir)) {
      const files = fs.readdirSync(secretDir);
      for (const file of files) {
        const match = file.match(blockImgRegex);
        if (match?.[1] && match?.[2]) {
          const blok = match[1];
          const subBlok = match[2];
          const filePath = path.join(secretDir, file);
          const buffer = fs.readFileSync(filePath);
          const base64 = buffer.toString("base64");
          blockImages.push({
            blok,
            subBlok,
            image: `data:image/webp;base64,${base64}`,
            mimeType: "image/webp",
          });
        }
      }
    }
  } catch {
    console.log("  ⚠ .secret/ not accessible, using placeholder images");
  }

  if (blockImages.length === 0) {
    const subBloks = ["a", "b", "c"] as const;
    for (let b = 1; b <= 13; b++) {
      const blok = String(b).padStart(3, "0");
      for (const sb of subBloks) {
        blockImages.push({
          blok,
          subBlok: sb,
          image: `data:image/svg+xml;base64,${Buffer.from(
            `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect fill="#2563eb" width="800" height="600"/><text x="400" y="300" text-anchor="middle" fill="white" font-size="24">Blok ${blok}${sb}</text></svg>`,
          ).toString("base64")}`,
          mimeType: "image/svg+xml",
        });
      }
    }
  }

  for (const bi of blockImages) {
    await prisma.blockImage.upsert({
      where: { blok_subBlok: { blok: bi.blok, subBlok: bi.subBlok } },
      update: { image: bi.image },
      create: bi,
    });
  }

  console.log(`  ✓ ${blockImages.length} BlockImages seeded`);

  const stats = await prisma.villageStats.findFirst({ orderBy: { id: "asc" } });
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
