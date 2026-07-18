# AGENTS.md — Desa Tulungrejo (Next.js Monolith)

## Purpose

Documents stable architectural decisions and conventions unique to this project.
For agent behavior rules, see workspace `~/.config/opencode/AGENTS.md`.

## Project

Desa Tulungrejo — village website with PBB (property tax) monitoring, article publishing, and village profile management.

**Users:** Warga (public), Pamong (tax officials), Kepala Desa (village head), Jurnalis (journalists).

---

## Architecture Decisions

### FE UI = Absolute Contract

The existing Vite SPA (tulungrejo-frontend) defines what must exist. All data shapes, routes, and behaviors are sourced from the FE. Backend adapts to serve these shapes.

### Route Groups

Three groups, each with different auth requirements:

- `(public)/` — no auth
- `(auth)/` — login page only
- `(dashboard)/` — role-gated. Protected by `src/proxy.ts` which redirects unauthorized users to `/login`.

Page files live under their group directory. Routes mirror the Vite SPA paths.

### Role Display Mapping

Prisma `Role` enum uses different values from what FE displays. See `src/lib/types.ts` (`ROLE_DISPLAY`, `DISPLAY_TO_ROLE`). Do not change the Prisma enum — FE strings are display-only.

### Database

- TiDB Cloud (MySQL) via PrismaMariaDb adapter. See `src/lib/prisma.ts` for connection setup.
- `relationMode = "prisma"` — no foreign keys at DB level. Relations enforced application-side via Prisma.
- Schema: `prisma/schema.prisma`. Seed: `prisma/seed.ts`.

### Article System

- Tags stored as JSON string (not junction table). Simpler for a small set; no relational queries needed across tags. Parsed at query boundary.
- CRUD API: `src/app/api/articles/`. Query helpers: `src/lib/article-queries.ts`.
- CMS UI: `src/components/jurnalis/`.

### CSS Architecture

Three layers in `src/app/` to prevent shadcn/ui design tokens from clashing with FE custom glassmorphism styles:

- `globals.css` — Tailwind v4 + shadcn/ui tokens
- `index.css` — FE custom design tokens (glass-panel, citizen-card, CSS variables). Takes precedence for public pages.
- `app.css` — app-level overrides

### Auth

Custom JWT (HS256 via `jose`). Not NextAuth. `src/lib/auth-custom.ts` handles signing/verification/session. Cookie: `session-token`, httpOnly, sameSite=lax, 30 days. Secret from `JWT_SECRET` or `AUTH_SECRET`.

### Categories

Defined in `src/lib/constants.ts` (`CATEGORIES`).

---

## Conventions

- **No code comments.** Self-documenting code.
- `@/*` → `./src/*`
- Passwords: bcryptjs.
- Security headers, CSP, cookies: see `next.config.ts`.
- ⚠ Next.js deprecated the "middleware" naming convention. This project uses `src/proxy.ts` as Next.js 16 new standard. Do not flag it as broken or issue (already working).

---

## Deployment

Netlify via `@netlify/plugin-nextjs`. Config: `netlify.toml`. Build: `npm run build`.
