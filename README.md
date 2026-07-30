# Portal Resmi Desa Tulungrejo

Website portal layanan publik dan transparansi administrasi Pemerintahan Desa Tulungrejo, Kecamatan Wates, Kabupaten Blitar.

Dikembangkan oleh **Tim MMD Filkom Kelompok 19, Universitas Brawijaya**.

---

## Ringkasan

Dua area:

- **Portal Publik** — profil desa, statistik kependudukan, artikel/pengumuman, peta.
- **Portal Internal** (role-based) — dashboard PBB, analitik kepala desa, CMS jurnalis.

> Detail arsitektur, keputusan teknis, dan dokumentasi internal ada di `docs/` dan `AGENTS.md`.

---

## Tech Stack

Next.js 16 · TypeScript · Prisma · TiDB Cloud (MySQL) · Tailwind v4 · shadcn/ui.

---

## Quick Start

```bash
git clone <repo-url> tulungrejo-next
cd tulungrejo-next
npm install
cp .env.example .env
```

Isi `DATABASE_URL` dan `JWT_SECRET`/`AUTH_SECRET` di `.env`.

```bash
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

Buka `http://localhost:3000`.

---

## Build & Deploy

```bash
npm run build
```

Konfigurasi Netlify di `netlify.toml`.

---

## Scripts

| Perintah             | Fungsi                      |
| -------------------- | --------------------------- |
| `npm run dev`        | Dev server                  |
| `npm run build`      | Build production            |
| `npm run seed`       | Seeder data awal            |
| `npm run lint`       | ESLint check                |
| `npx prisma db push` | Sinkronisasi skema database |

---

## Keamanan

- Semua kredensial dan secret dikelola via environment variables — lihat `.env.example` untuk daftar variabel yang dibutuhkan.
- Session token JWT, httpOnly, sameSite=Lax.
- Role-based access control untuk halaman internal.
- File `.env`, `.secret/`, dan direktori internal tidak masuk version control (lihat `.gitignore`).
- Untuk pelaporan kerentanan, hubungi pengelola langsung.
