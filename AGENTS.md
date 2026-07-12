# AGENTS.md — Desa Tulungrejo (Next.js Monolith)

## Purpose

Documents stable architectural decisions and conventions unique to this project. For agent behavior rules, see workspace `~/.config/opencode/AGENTS.md`.

## Project

Desa Tulungrejo — village website with PBB (property tax) monitoring, article publishing, and village profile management.

**Stack:** Next.js 16 (App Router) + TypeScript + Prisma + TiDB Cloud + NextAuth v5 + Tailwind v4 + shadcn/ui. Lihat `package.json` untuk dependency lengkap.

**Users:** Warga (public), Pamong (tax officials), Kepala Desa (village head), Jurnalis (journalists)

---

## Architecture Decisions

### FE UI = Absolute Contract

The existing Vite SPA (tulungrejo-frontend) defines what must exist. All data shapes, routes, and behaviors are sourced from the FE. Backend adapts to serve these shapes.

### Route Mapping (FE → Next.js)

| FE Path          | App Router                         |
| ---------------- | ---------------------------------- |
| `/`              | `(public)/page.tsx`                |
| `/profil-desa`   | `(public)/profil-desa/page.tsx`    |
| `/artikel`       | `(public)/artikel/page.tsx`        |
| `/artikel/:slug` | `(public)/artikel/[slug]/page.tsx` |
| `/login`         | `(auth)/login/page.tsx`            |
| `/pbb`           | `(dashboard)/pbb/page.tsx`         |
| `/kepala-desa`   | `(dashboard)/kepala-desa/page.tsx` |
| `/jurnalis`      | `(dashboard)/jurnalis/page.tsx`    |

### Role Name Mapping

| FE display      | Prisma enum    |
| --------------- | -------------- |
| `"pamong"`      | `pamong_pajak` |
| `"kepala desa"` | `kepala_desa`  |
| `"jurnalis"`    | `jurnalis`     |

Mapping in `src/lib/types.ts` (`ROLE_DISPLAY`, `DISPLAY_TO_ROLE`). Never change Prisma enum.

### Route Groups

- `(public)` — no auth required
- `(auth)` — login page
- `(dashboard)` — role-gated (`/pbb`, `/kepala-desa`, `/jurnalis`)

### Database

- TiDB Cloud (MySQL) via PrismaMariaDb adapter
- `relationMode = "prisma"` — no FK at DB level
- 6 models: `User`, `LandPlot`, `Payment`, `VillageStats`, `VillageProfile`, `Article`. Schema detail — lihat `prisma/schema.prisma`.
- Data awal — lihat `prisma/seed.ts`.

### Article System

- CRUD via `src/app/api/articles/`. Query helpers di `src/lib/article-queries.ts`.
- Konten markdown, render via `react-markdown` + `remark-gfm`.
- Tags disimpan sebagai JSON string, diparse di query boundary.
- CMS jurnalis di `src/components/jurnalis/article-manager.tsx`.

### CSS Architecture

Tiga layer CSS di `src/app/`:

- `globals.css` — Tailwind v4 + shadcn/ui design tokens
- `index.css` — FE design tokens (glass-panel, buttons, vars)
- `app.css` — app-level overrides

FE styles take precedence for public pages.

### Categories

`"Kegiatan Desa" | "Pembangunan" | "Pemberdayaan" | "Kesehatan" | "Pertanian" | "Pengumuman"`

### Data Models

Detail skema database — lihat `prisma/schema.prisma`. Tipe dan mapping di `src/lib/types.ts`.

---

## Conventions

- **No code comments.** Self-documenting code.
- **`@/*`** → `./src/*`
- **shadcn/ui** new-york style.
- **Passwords** bcryptjs.
- **Security headers, cookies, CSP** — lihat `next.config.ts`.

---

## Deployment

Netlify (`@netlify/plugin-nextjs`). Config di `netlify.toml`. Build: `npm run build`.
