# Portal Resmi Desa Tulungrejo (Kec. Wates, Kab. Blitar)

Website Portal Layanan Publik dan Transparansi Administrasi Pemerintahan Desa Tulungrejo, Kecamatan Wates, Kabupaten Blitar.

Dikembangkan oleh **Tim MMD Filkom Kelompok 19, Universitas Brawijaya**.

---

## Fitur

### Portal Publik

- **Beranda**: Profil desa, peta, statistik kependudukan, berita terbaru.
- **Profil Desa**: Visi, misi, struktur organisasi, tugas fungsi, batas wilayah.
- **Artikel**: Publikasi berita dan pengumuman resmi.

### Portal Internal (Role-based)

- **Pamong PBB**: Peta spasial wajib pajak, filter/search, toggle status bayar.
- **Kepala Desa**: Dashboard analitik PBB (pie chart, dusun report).
- **Jurnalis**: CMS artikel + edit profil desa + edit statistik.

---

## Tech Stack

Inti: Next.js 16 + TypeScript + Prisma + TiDB Cloud + NextAuth v5 + Tailwind v4 + shadcn/ui.

Daftar dependency lengkap — lihat `package.json`.

---

## Persyaratan Sistem

- **Node.js** 18+ (recommended: 20 LTS atau 22 LTS)
- **npm** 9+
- **TiDB Cloud / MySQL** — lihat `DATABASE_URL` di `.env`

---

## Cara Jalankan (Local Development)

### 1. Clone & masuk direktori

```bash
git clone <repo-url> tulungrejo-next
cd tulungrejo-next
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment

```bash
cp .env.example .env
```

Isi `DATABASE_URL` dan `AUTH_SECRET` di `.env`. Lihat `.env.example` untuk required vars.

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Push skema ke database

```bash
npx prisma db push
```

### 6. Seeder data awal

```bash
npm run seed
```

### 7. Jalankan dev server

```bash
npm run dev
```

Buka **http://localhost:3000** di browser.

> **Testing:** Belum ada test suite. Validasi manual via `npm run dev`.

---

## Build Produksi

```bash
npm run build
```

Hasil build siap dideploy (konfigurasi Netlify di `netlify.toml`).

---

## Kredensial Demo

| Role     | Email                         | Password      | Halaman        |
| -------- | ----------------------------- | ------------- | -------------- |
| Pamong   | `pamong@tulungrejo.desa.id`   | `pamong123`   | `/pbb`         |
| Kades    | `kades@tulungrejo.desa.id`    | `kades123`    | `/kepala-desa` |
| Jurnalis | `jurnalis@tulungrejo.desa.id` | `jurnalis123` | `/jurnalis`    |

---

## Scripts Penting

| Perintah             | Fungsi                           |
| -------------------- | -------------------------------- |
| `npm run dev`        | Jalankan dev server              |
| `npm run dev:clean`  | Bersihkan `.next` + jalankan dev |
| `npm run build`      | Build produksi                   |
| `npm run start`      | Jalankan production server       |
| `npm run seed`       | Isi data awal ke database        |
| `npm run lint`       | Cek kode dengan ESLint           |
| `npx prisma db push` | Sinkronisasi skema ke database   |
