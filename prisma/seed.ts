import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";

async function main() {
  console.log("Seeding database...");

  const passwordPamong = await bcrypt.hash("pamong123", 10);
  const passwordKades = await bcrypt.hash("kades123", 10);
  const passwordJurnalis = await bcrypt.hash("jurnalis123", 10);

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

  const fieldsData = [
    {
      blok: "001",
      noBidang: "0001",
      ownerName: "Budi Santoso",
      dusun: "Tulungrejo",
      landArea: 1200,
    },
    {
      blok: "001",
      noBidang: "0005",
      ownerName: "Siti Rahma",
      dusun: "Tulungrejo",
      landArea: 850,
    },
    {
      blok: "003",
      noBidang: "0010",
      ownerName: "Joko Widodo",
      dusun: "Tulungrejo",
      landArea: 2100,
    },
    {
      blok: "005",
      noBidang: "0020",
      ownerName: "Dewa Made",
      dusun: "Tulungrejo",
      landArea: 600,
    },
    {
      blok: "006",
      noBidang: "0003",
      ownerName: "Ahmad Fauzi",
      dusun: "Sidodadi",
      landArea: 1500,
    },
    {
      blok: "008",
      noBidang: "0015",
      ownerName: "Lestari Ningsih",
      dusun: "Sidodadi",
      landArea: 950,
    },
    {
      blok: "010",
      noBidang: "0025",
      ownerName: "Hendra Wijaya",
      dusun: "Sidodadi",
      landArea: 1800,
    },
    {
      blok: "012",
      noBidang: "0190",
      ownerName: "Rina Astuti",
      dusun: "Sidodadi",
      landArea: 720,
    },
    {
      blok: "013",
      noBidang: "0007",
      ownerName: "Slamet Riyadi",
      dusun: "TumpakGatho",
      landArea: 2500,
    },
    {
      blok: "013",
      noBidang: "0050",
      ownerName: "Kartika Sari",
      dusun: "TumpakGatho",
      landArea: 1100,
    },
  ] as const;

  for (const f of fieldsData) {
    const nop = `35.05.050.005.${f.blok}.${f.noBidang}`;
    const noUrut = `${f.blok}${f.noBidang}`;
    await prisma.fields.upsert({
      where: { nop },
      update: {},
      create: {
        nop,
        noUrut,
        ownerName: f.ownerName,
        address: `Dusun ${f.dusun}, Desa Tulungrejo`,
        blok: f.blok,
        noBidang: f.noBidang,
        dusun: f.dusun,
        landArea: f.landArea,
      },
    });
  }

  console.log("  ✓ Fields seeded (10 dummy)");
  console.log("  ✓ Payments seeded (0 — empty)");

  await prisma.villageStats.upsert({
    where: { id: 1 },
    update: {},
    create: {
      jumlahKK: 1420,
      jumlahPenduduk: 4850,
      lakiLaki: 2410,
      perempuan: 2440,
    },
  });

  console.log("  ✓ VillageStats seeded");

  await prisma.villageProfile.upsert({
    where: { id: 1 },
    update: {},
    create: {
      visi: "Terwujudnya Desa Tulungrejo yang Mandiri, Sejahtera, Berbudaya, dan Berkeadilan Berlandaskan Gotong Royong.",
      misi: JSON.stringify([
        "Meningkatkan kualitas pelayanan publik berbasis teknologi informasi.",
        "Mengembangkan sektor pertanian, peternakan, dan pariwisata yang berkelanjutan.",
        "Meningkatkan kualitas SDM melalui pendidikan dan sarana kesehatan yang memadai.",
        "Mewujudkan tata kelola pemerintahan desa yang bersih, transparan, dan akuntabel.",
      ]),
      strukturOrganisasi: JSON.stringify([
        { role: "Kepala Desa", name: "Ir. H. Sulaiman Basri" },
        { role: "Sekretaris Desa", name: "Dewi Anggraini, S.E." },
        { role: "Kasi Pemerintahan", name: "Bambang Triyono" },
        { role: "Kasi Kesejahteraan", name: "Fajar Nugroho, S.Pd." },
        { role: "Kasi Pelayanan", name: "Siti Kurniati" },
        { role: "Kaur Keuangan", name: "Rahmat Hidayat" },
        { role: "Kaur Umum & Perencanaan", name: "Novi Fitriani" },
        { role: "Kepala Dusun Junggo", name: "Jatmiko Wibowo" },
        { role: "Kepala Dusun Wonorejo", name: "Subagyo" },
      ]),
      tugasFungsi: JSON.stringify([
        {
          jabatan: "Kepala Desa",
          tugas:
            "Menyelenggarakan Pemerintahan Desa, melaksanakan Pembangunan Desa, pembinaan kemasyarakatan Desa, dan pemberdayaan masyarakat Desa.",
        },
        {
          jabatan: "Sekretaris Desa",
          tugas:
            "Memimpin, mengoordinasikan, dan mengendalikan urusan ketatausahaan, umum, perencanaan, dan keuangan serta memberikan pelayanan administratif bagi perangkat desa dan masyarakat.",
        },
        {
          jabatan: "Seksi Pemerintahan (Kasi Pemerintahan)",
          tugas:
            "Menyusun rencana, melaksanakan, mengevaluasi dan melaporkan pelaksanaan program administrasi kependudukan, ketentraman dan ketertiban umum, serta pertanahan desa.",
        },
        {
          jabatan: "Seksi Kesejahteraan (Kasi Kesejahteraan)",
          tugas:
            "Melaksanakan pembangunan infrastruktur perdesaan, pembinaan kepemudaan, olahraga, keagamaan, serta pengelolaan bantuan sosial masyarakat.",
        },
        {
          jabatan: "Seksi Pelayanan (Kasi Pelayanan)",
          tugas:
            "Membantu penyediaan sarana dan prasarana pelayanan administrasi, pelayanan sosial dasar, serta pemberdayaan ekonomi masyarakat.",
        },
      ]),
      administratif: JSON.stringify({
        koordinat: "-7.8207° LS, 112.5262° BT",
        batasUtara: "Berbatasan dengan Desa Sumberarum dan Desa Ringinrejo.",
        batasSelatan: "Berbatasan dengan Desa Purworejo.",
        batasTimur: "Berbatasan dengan wilayah Kabupaten Malang.",
        batasBarat: "Berbatasan dengan Kawasan Hutan atau area perkebunan.",
        luasWilayah: "2 Dusun (Junggo & Wonorejo), Total Luas 342,5 Hektar",
        mataPencaharianUtama: "Petani, Peternak, dan Pengelola Wisata Alam",
        saranaPendidikan: "2 Taman Kanak-Kanak (TK) dan 3 Sekolah Dasar (SD)",
        saranaKesehatan: "1 Pos Kesehatan Desa (Postu) Tulungrejo",
      }),
    },
  });

  console.log("  ✓ VillageProfile seeded");

  await prisma.realisasi.create({
    data: {
      kodeKec: "050",
      kecamatan: "WATES",
      kodeDesa: "005",
      desa: "TULUNGREJO",
      totalPbb: BigInt(149186364),
      totalBayar: BigInt(40361494),
      persen: 27.05,
      kurangBayar: BigInt(108824870),
      totalSppt: 2898,
      dibayar: 829,
      sisaSppt: 2069,
      tanggalAmbil: new Date("2026-07-13"),
    },
  });

  console.log("  ✓ Realisasi seeded");

  // BlockImage — read from .secret/ or use placeholder
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

  // Fallback: generate placeholder if none found
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

  function placeholderImg(color: string): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect fill="${color}" width="800" height="600"/></svg>`;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  }

  const SEED_COLORS = [
    "#059669",
    "#d97706",
    "#2563eb",
    "#475569",
    "#e11d48",
    "#7c3aed",
    "#0891b2",
    "#65a30d",
    "#db2777",
    "#ea580c",
    "#4f46e5",
    "#0d9488",
  ];

  // Inline seed (was MDX)
  const articlesData = [
    {
      title: "Musyawarah Perencanaan Pembangunan Desa Tulungrejo Tahun 2027",
      slug: "musrenbang-desa-tulungrejo",
      date: new Date("2026-07-01"),
      author: "Budi Santoso",
      category: "Kegiatan Desa",
      summary:
        "Desa Tulungrejo menggelar musyawarah perencanaan pembangunan untuk menentukan arah pembangunan desa di tahun mendatang.",
      image:
        "https://images.unsplash.com/photo-1577495508326-19a1b3cf65b7?auto=format&fit=crop&q=80&w=800",
      tags: JSON.stringify(["musrenbang", "perencanaan", "pembangunan desa"]),
      content: `## Pelaksanaan Musrenbang Desa

Pada tanggal *30 Juni 2026*, Desa Tulungrejo telah melaksanakan **Musyawarah Perencanaan Pembangunan (Musrenbang)** tingkat desa. Acara ini dihadiri oleh seluruh perangkat desa, tokoh masyarakat, dan perwakilan warga dari setiap dusun.

Musrenbang merupakan forum musyawarah tahunan untuk membahas **Rencana Kerja Pemerintah Desa (RKPD)** tahun berikutnya. Dalam musyawarah kali ini, terdapat beberapa prioritas pembangunan yang dibahas:

- Peningkatan infrastruktur jalan desa
- Pengembangan potensi wisata alam
- Penguatan program ekonomi kerakyatan
- Perbaikan sarana dan prasarana pendidikan

### Hasil Keputusan Musrenbang

Setelah melalui diskusi yang panjang, forum sepakat untuk mengalokasikan anggaran pada beberapa program prioritas:

1. **Rehabilitasi jalan dusun selatan** — prioritas utama
2. Pengembangan *eco-tourism* di kawasan hutan pinus
3. Pelatihan UMKM bagi ibu-ibu PKK
4. Pembangunan balai desa baru

> "Musrenbang tahun ini lebih strategis karena kita harus menyesuaikan dengan alokasi dana desa yang sudah ditetapkan oleh pemerintah pusat."
> — **Budi Santoso**, Kepala Desa Tulungrejo

### Informasi Anggaran

| No | Program | Alokasi (Rp) | Prioritas |
|----|---------|-------------|-----------|
| 1 | Rehabilitasi jalan | 450.000.000 | Tinggi |
| 2 | Eco-tourism | 200.000.000 | Sedang |
| 3 | Pelatihan UMKM | 75.000.000 | Sedang |
| 4 | Balai desa | 300.000.000 | Tinggi |

Seluruh warga Desa Tulungrejo diharapkan dapat berpartisipasi aktif dalam pelaksanaan program-program pembangunan yang telah direncanakan.`,
      published: true,
    },
    {
      title:
        "Potensi Wisata Alam Desa Tulungrejo: Pesona Hutan Pinus dan Air Terjun",
      slug: "potensi-wisata-alam-tulungrejo",
      date: new Date("2026-07-02"),
      author: "Siti Aminah",
      category: "Pembangunan",
      summary:
        "Desa Tulungrejo menyimpan potensi wisata alam yang luar biasa, mulai dari hutan pinus hingga air terjun tersembunyi.",
      image:
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800",
      tags: JSON.stringify([
        "wisata alam",
        "hutan pinus",
        "air terjun",
        "eco-tourism",
      ]),
      content: `## Keindahan Tersembunyi di Tulungrejo

Desa Tulungrejo terletak di wilayah **Kecamatan Wates, Kabupaten Blitar** dan dikelilingi oleh perbukitan serta hutan yang masih asri. Potensi wisata alam di desa ini sangat *luar biasa* dan belum banyak dikunjungi oleh wisatawan luar.

### Destinasi Unggulan

- **Hutan Pinus Selatan** — kawasan hutan pinus dengan udara sejuk dan jalur trekking
- **Air Terjun Sidorejo** — air terjun setinggi 15 meter di tengah hutan
- **Bukit Pandang** — spot sunrise dengan pemandangan Gunung Kelud
- **Kebun Teh Wates** — hamparan kebun teh yang masih aktif

### Fasilitas yang Tersedia

1. Area parkir kendaraan
2. Gazebo dan tempat istirahat
3. Jalur setapak (*trekking path*)
4. Toilet dan mushola

> "Kami ingin mengembangkan wisata alam yang *berkelanjutan* dan tidak merusak lingkungan."
> — **Siti Aminah**, Ketua Pokdarwis Desa Tulungrejo

### Potensi Pengembangan

| Destinasi | Rencana Pengembangan | Estimasi Biaya |
|-----------|---------------------|----------------|
| Hutan Pinus | Camping ground | Rp 150.000.000 |
| Air Terjun | Jembatan viewing | Rp 200.000.000 |
| Bukit Pandang | Wahana fotografi | Rp 75.000.000 |`,
      published: true,
    },
    {
      title: "Rehabilitasi Jalan Dusun Selatan Tahap Pertama Dimulai",
      slug: "rehabilitasi-jalan-dusun-selatan",
      date: new Date("2026-07-03"),
      author: "Admin Desa",
      category: "Pembangunan",
      summary:
        "Proyek rehabilitasi jalan di Dusun Selatan Desa Tulungrejo resmi dimulai dengan alokasi dana desa.",
      image:
        "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800",
      tags: JSON.stringify(["infrastruktur", "jalan desa", "pembangunan"]),
      content: `## Pekerjaan Rehabilitasi Jalan Dimulai

Pemerintah Desa Tulungrejo resmi memulai **pekerjaan rehabilitasi jalan** di Dusun Selatan pada tanggal *1 Juli 2026*. Proyek ini merupakan salah satu program prioritas yang disepakati dalam Musrenbang tahun ini.

Jalan yang akan direhabilitasi memiliki panjang sekitar **2,3 kilometer** dan menghubungkan Dusun Selatan dengan pusat desa.

### Spesifikasi Pekerjaan

- Pembersihan badan jalan
- Pemasangan **lapisan pondasi batu** setebal 20 cm
- Pengecoran *beton ready mix* setebal 15 cm
- Pemasangan drainase di sisi jalan

### Jadwal Pelaksanaan

1. **Tahap 1** — Pembersihan dan persiapan (7 hari)
2. **Tahap 2** — Pemasangan pondasi (14 hari)
3. **Tahap 3** — Pengecoran beton (14 hari)
4. **Tahap 4** — Finishing dan drainase (10 hari)

> "Jalan ini merupakan akses vital bagi warga Dusun Selatan. Dengan rehabilitasi ini, mobilitas warga akan jauh lebih baik."

### Detail Anggaran

| Komponen | Biaya (Rp) |
|----------|------------|
| Material | 250.000.000 |
| Tenaga kerja | 120.000.000 |
| Peralatan | 50.000.000 |
| Pengawasan | 30.000.000 |
| **Total** | **450.000.000** |`,
      published: true,
    },
    {
      title:
        "Program RTGM Desa Tulungrejo: Penguatan Ketahanan Pangan Keluarga",
      slug: "program-rtgm-di-desa-tulungrejo",
      date: new Date("2026-07-04"),
      author: "Jurnalis Desa",
      category: "Pemberdayaan",
      summary:
        "Program Revolusi Twibun Ganjar-Mahfud hadir di Desa Tulungrejo untuk penguatan ketahanan pangan keluarga.",
      image:
        "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=800",
      tags: JSON.stringify(["RTGM", "ketahanan pangan", "program sosial"]),
      content: `## Program RTGM Resmi Diluncurkan

Desa Tulungrejo menjadi salah satu desa penerima manfaat dari **Program Revolusi Twibun Ganjar-Mahfud (RTGM)** untuk penguatan ketahanan pangan keluarga.

Sebanyak **50 keluarga** terpilih sebagai penerima manfaat program ini.

### Manfaat yang Diterima

- **Paket bibit tanaman** — sayuran, buah, dan rempah
- **Pupuk organik** — cukup untuk 3 bulan
- **Alat berkebun** — cangkul, sekop, dan pot
- **Pelatihan** — teknik berkebun organik

### Target Program

1. Meningkatkan *ketahanan pangan* keluarga
2. Mengurangi pengeluaran untuk pembelian sayuran
3. Membudayakan **kebun rumahan** di setiap keluarga

### Hasil Sementara

| Indikator | Target | Realisasi |
|-----------|--------|-----------|
| Keluarga aktif berkebun | 50 | 42 |
| Jenis tanaman ditanam | 10 | 8 |
| Produksi sayuran (kg) | 100 | 65 |`,
      published: true,
    },
    {
      title: "Pelatihan Digital Marketing untuk UMKM Desa Tulungrejo",
      slug: "pelatihan-umkm-warga-des",
      date: new Date("2026-07-05"),
      author: "Tim Redaksi",
      category: "Pertanian",
      summary:
        "Pemerintah Desa Tulungrejo mengadakan pelatihan digital marketing untuk meningkatkan kemampuan UMKM dalam pemasaran produk.",
      image:
        "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=800",
      tags: JSON.stringify([
        "UMKM",
        "digital marketing",
        "pelatihan",
        "ekonomi desa",
      ]),
      content: `## Meningkatkan Daya Saing UMKM Melalui Digitalisasi

Pemerintah Desa Tulungrejo menyelenggarakan **pelatihan digital marketing** bagi pelaku UMKM pada tanggal *5 Juli 2026*. Kegiatan ini diikuti oleh **30 peserta** dari berbagai sektor usaha.

### Materi Pelatihan

- Pengenalan **marketplace** lokal (Tokopedia, Shopee, Bukalapak)
- Strategi *content creation* di Instagram dan TikTok
- Teknik **fotografi produk** menggunakan smartphone
- Pengelolaan *toko online* dan manajemen pesanan

### Narasumber

1. **Mas Andi** — Praktisi digital marketing dari Blitar
2. **Ibu Rina** — Pelaku UMKM sukses yang sudah go digital
3. **Pak Joko** — Fotografer produk profesional

> "Kami ingin UMKM Desa Tulungrejo bisa bersaing di pasar digital. Tidak perlu modal besar, yang penting kreatif dan konsisten."

### Hasil Pelatihan

| Fasilitas | Keterangan |
|-----------|------------|
| Sertifikat | Resmi dari Pemdes Tulungrejo |
| Modul digital | Panduan lengkap digital marketing |
| Grup WhatsApp | Komunitas UMKM digital |
| Pendampingan | 3 bulan konsultasi gratis |`,
      published: true,
    },
    {
      title: "Pemilihan Ketua BPD Desa Tulungrejo Periode 2026-2032",
      slug: "pemilihan-ketua-bpd",
      date: new Date("2026-07-06"),
      author: "Budi Santoso",
      category: "Kegiatan Desa",
      summary:
        "Pemilihan Ketua Badan Permusyawaratan Desa (BPD) Desa Tulungrejo akan dilaksanakan pada bulan Juli 2026.",
      image:
        "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=800",
      tags: JSON.stringify(["BPD", "pemilihan", "demokrasi desa"]),
      content: `## Pemilihan Ketua BPD Akan Digelar

Pemerintah Desa Tulungrejo akan menyelenggarakan **pemilihan Ketua Badan Permusyawaratan Desa (BPD)** pada tanggal *15 Juli 2026*.

### Jadwal Pelaksanaan

- **1 Juli 2026** — Pendaftaran calon dibuka
- **5 Juli 2026** — Verifikasi berkas calon
- **10 Juli 2026** — Kampanye calon
- **15 Juli 2026** — Hari pemilihan

### Syarat Calon

1. Warga Negara Indonesia
2. Berusia minimal **25 tahun**
3. Berpendidikan minimal SMA/SMK
4. Bertempat tinggal di Desa Tulungrejo

### Calon yang Mendaftar

| No | Nama | Usia | Pendidikan |
|----|------|------|------------|
| 1 | H. Ahmad Fauzi | 52 | S1 |
| 2 | Surya Dharma | 45 | S2 |
| 3 | Rina Wati | 40 | S1 |`,
      published: true,
    },
    {
      title: "Artikel Contoh Desa Tulungrejo",
      slug: "artikel-contoh-desa-tulungrejo",
      date: new Date("2026-07-07"),
      author: "Tim Redaksi",
      category: "Pembangunan",
      summary:
        "Artikel contoh untuk testing rendering artikel di website desa.",
      image:
        "https://images.unsplash.com/photo-1504711434969-e33886168d6c?auto=format&fit=crop&q=80&w=800",
      tags: JSON.stringify(["pembangunan", "desa", "tulungrejo"]),
      content: `# Artikel Contoh

Ini adalah artikel contoh untuk Desa Tulungrejo.

## Isi Artikel

Konten artikel akan ditampilkan di sini. Para jurnalis dapat menulis artikel melalui dashboard jurnalis.`,
      published: true,
    },
    {
      title: "Program Pertanian Organik Desa Tulungrejo Menuju Desa Hijau",
      slug: "pertanian-organik-desa-tulungrejo",
      date: new Date("2026-07-07"),
      author: "Siti Aminah",
      category: "Pembangunan",
      summary:
        "Desa Tulungrejo mengembangkan program pertanian organik untuk menciptakan produk pangan yang sehat dan ramah lingkungan.",
      image:
        "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&q=80&w=800",
      tags: JSON.stringify([
        "pertanian organik",
        "sustainable agriculture",
        "pangan sehat",
      ]),
      content: `## Pertanian Organik: Solusi Pangan Sehat

Desa Tulungrejo mulai mengembangkan **program pertanian organik** sejak awal tahun 2026.

### Keunggulan Pertanian Organik

- **Produk lebih sehat** — tidak mengandung residu pestisida
- **Tanah lebih subur** — struktur tanah terjaga dengan baik
- **Lingkungan terjaga** — tidak mencemari sumber air
- **Nilai jual tinggi** — harga jual produk organik lebih mahal

### Komoditas yang Ditanam

1. **Sayuran** — bayam, kangkung, sawi, dan cabai
2. **Buah-buahan** — tomat, terong, dan mentimun
3. **Rempah** — jahe, kunyit, dan lengkuas

### Capaian Program

| Komoditas | Luas Lahan (m²) | Produksi (kg/bulan) |
|-----------|-----------------|--------------------|
| Sayuran | 2.000 | 150 |
| Buah-buahan | 1.500 | 100 |
| Rempah | 500 | 50 |`,
      published: true,
    },
    {
      title: "Pembangunan Balai Desa Tulungrejo Tahap Kedua Berlangsung",
      slug: "pembangunan-balai-desa",
      date: new Date("2026-07-08"),
      author: "Admin Desa",
      category: "Pembangunan",
      summary:
        "Pembangunan balai desa baru Tahap Kedua sedang berlangsung dengan target selesai pada akhir tahun 2026.",
      image:
        "https://images.unsplash.com/photo-1577415124269-fc1140afcb8b?auto=format&fit=crop&q=80&w=800",
      tags: JSON.stringify(["balai desa", "gedung", "infrastruktur"]),
      content: `## Progres Pembangunan Balai Desa

Pembangunan **Balai Desa Tulungrejo** yang baru memasuki *Tahap Kedua* pada bulan Juli 2026.

### Spesifikasi Bangunan

- **Struktur** — Beton bertulang dengan konstruksi *knock down*
- **Lantai** — Granit ukuran 60x60 cm
- **Dinding** — Bata ringan dengan plesteran dan cat
- **Atap** — Baja ringan dengan penutup *galvalum*

### Fasilitas yang Tersedia

1. Ruang kerja Kepala Desa dan perangkat
2. Ruang rapat **kapasitas 50 orang**
3. Ruang pelayanan warga
4. Ruang arsip dan dokumentasi

### Detail Anggaran dan Jadwal

| Komponen | Anggaran (Rp) | Progres |
|----------|-------------|---------|
| Fondasi & Struktur | 150.000.000 | 100% |
| Dinding & Atap | 100.000.000 | 75% |
| Instalasi Listrik | 30.000.000 | 50% |
| Finishing | 70.000.000 | 0% |
| **Total** | **350.000.000** | — |`,
      published: true,
    },
    {
      title: "Bakti Sosial Ramadan 1447 H Desa Tulungrejo",
      slug: "bakti-sosial-ramadhan",
      date: new Date("2026-07-09"),
      author: "Jurnalis Desa",
      category: "Pemberdayaan",
      summary:
        "Desa Tulungrejo menggelar bakti sosial Ramadan bagi warga kurang mampu dan anak yatim piatu.",
      image:
        "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800",
      tags: JSON.stringify([
        "bakti sosial",
        "Ramadan",
        "donasi",
        "kegiatan sosial",
      ]),
      content: `## Berbagi di Bulan yang Penuh Berkah

Dalam rangka **Ramadan 1447 H**, Desa Tulungrejo menggelar kegiatan *bakti sosial* yang diadakan pada tanggal *5-7 Juli 2026*.

### Kegiatan yang Dilaksanakan

- **Pembagian sembako** — untuk 100 keluarga kurang mampu
- **Santunan anak yatim** — untuk 50 anak yatim piatu
- **Buka puasa bersama** — di aula balai desa
- **Tarawih keliling** — di mushola-mushola desa

### Donasi yang Terkumpul

Total donasi yang terkumpul mencapai **Rp 45.000.000**.

| Sumber Donasi | Jumlah (Rp) |
|---------------|-------------|
| Dana desa | 15.000.000 |
| Donasi warga | 20.000.000 |
| Donasi luar desa | 10.000.000 |
| **Total** | **45.000.000** |`,
      published: true,
    },
    {
      title: "Koperasi Simpan Pinjam Desa Tulungrejo Resmi Beroperasi",
      slug: "koperasi-simpan-pinjam",
      date: new Date("2026-07-09"),
      author: "Tim Redaksi",
      category: "Pertanian",
      summary:
        "Koperasi Simpan Pinjam 'Mekar Jaya' Desa Tulungrejo resmi beroperasi untuk melayani kebutuhan keuangan warga.",
      image:
        "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800",
      tags: JSON.stringify(["koperasi", "simpan pinjam", "keuangan desa"]),
      content: `## Koperasi untuk Kesejahteraan Warga

**Koperasi Simpan Pinjam "Mekar Jaya"** Desa Tulungrejo resmi beroperasi pada tanggal *1 Juli 2026*.

### Layanan Koperasi

- **Simpanan pokok** — Rp 200.000 per anggota
- **Simpanan wajib** — Rp 50.000 per bulan
- **Pinjaman modal usaha** — maksimal Rp 10.000.000
- **Pinjaman darurat** — maksimal Rp 2.000.000

### Keunggulan Koperasi

1. **Bunga rendah** — hanya 1% per bulan
2. **Proses cepat** — pinjaman cair dalam 3 hari
3. **Syarat mudah** — cukup KTP dan KK
4. **Tanpa jaminan** — untuk pinjaman di bawah Rp 5.000.000

### Struktur Pengurus

| Jabatan | Nama |
|---------|------|
| Ketua | H. Supriyadi |
| Wakil Ketua | Bambang Suharto |
| Sekretaris | Dewi Kartika |
| Bendahara | Agus Setiawan |`,
      published: true,
    },
    {
      title: "Realisasi Dana Desa Tahun 2026 Desa Tulungrejo",
      slug: "dana-desa-tahun-2026",
      date: new Date("2026-07-10"),
      author: "Budi Santoso",
      category: "Kegiatan Desa",
      summary:
        "Pemerintah Desa Tulungrejo merilis laporan realisasi penggunaan Dana Desa tahun anggaran 2026.",
      image:
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800",
      tags: JSON.stringify([
        "dana desa",
        "anggaran",
        "keuangan desa",
        "transparansi",
      ]),
      content: `## Laporan Realisasi Dana Desa 2026

Pemerintah Desa Tulungrejo secara **transparan** merilis laporan realisasi penggunaan *Dana Desa (DD)* tahun anggaran 2026.

Total alokasi Dana Desa tahun 2026 untuk Desa Tulungrejo adalah sebesar **Rp 1.250.000.000**.

### Alokasi Dana per Bidang

| Bidang | Alokasi (Rp) | Persentase |
|--------|-------------|-----------|
| Infrastruktur | 550.000.000 | 44% |
| Pemberdayaan ekonomi | 250.000.000 | 20% |
| Pendidikan | 150.000.000 | 12% |
| Kesehatan | 125.000.000 | 10% |
| Pemerintahan | 100.000.000 | 8% |
| Sosial | 75.000.000 | 6% |
| **Total** | **1.250.000.000** | **100%** |

### Realisasi Semester Pertama

Hingga akhir *Juni 2026*, realisasi penggunaan Dana Desa sudah mencapai **48%** dari total alokasi.

> "Kami berkomitmen untuk menggunakan Dana Desa secara **transparan** dan *akuntabel*. Setiap rupiah yang dikelola harus memberikan manfaat bagi warga."`,
      published: true,
    },
    {
      title: "Sumber Mata Air Tulungrejo: Potensi Air Bersih untuk Warga",
      slug: "sumber-mata-air-tulungrejo",
      date: new Date("2026-07-10"),
      author: "Siti Aminah",
      category: "Pembangunan",
      summary:
        "Desa Tulungrejo memiliki sumber mata air alami yang belum dimanfaatkan secara optimal untuk kebutuhan warga.",
      image:
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800",
      tags: JSON.stringify(["mata air", "air bersih", "sumber daya alam"]),
      content: `## Sumber Mata Air Alami di Tulungrejo

Desa Tulungrejo menyimpan **potensi sumber daya alam** yang sangat berupa *sumber mata air alami*.

### Potensi Pengembangan

- **Pengolahan air minum kemasan** — produk lokal desa
- **Irigasi pertanian** — mengairi sawah dan kebun
- **Air bersih untuk warga** — distribusi melalui jaringan pipa
- **Wisata edukasi** — belajar tentang siklus air

### Rencana Pengembangan

1. **Pembangunan *water treatment plant*** — untuk mengolah air menjadi layak minum
2. **Pemasangan jaringan pipa** — mendistribusikan air ke seluruh dusun
3. **Pembangunan *waterfall*** — untuk keperluan pariwisata
4. **Pendirian UMKM air minum** — menciptakan lapangan kerja

| Komponen | Estimasi Biaya (Rp) |
|----------|---------------------|
| Water treatment | 500.000.000 |
| Jaringan pipa | 300.000.000 |
| Waterfall | 150.000.000 |
| UMKM air minum | 100.000.000 |`,
      published: true,
    },
  ];

  for (const [i, article] of articlesData.entries()) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {},
      create: {
        title: article.title,
        slug: article.slug,
        date: article.date,
        author: article.author,
        category: article.category,
        summary: article.summary,
        image: placeholderImg(SEED_COLORS[i % SEED_COLORS.length]!),
        content: article.content,
        tags: article.tags,
        published: article.published,
      },
    });
  }
  console.log(`  ✓ ${articlesData.length} Articles seeded`);

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
