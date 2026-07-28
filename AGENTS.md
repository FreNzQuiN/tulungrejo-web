# AGENTS.md — Desa Tulungrejo (Next.js Monolith)

## Purpose

Documents stable architectural decisions and conventions unique to this project.

## Project

Desa Tulungrejo — village website with PBB (property tax) monitoring, article publishing, and village profile management.

**Users:** Warga (public), Pamong (tax officials), Kepala Desa (village head), Jurnalis (journalists).

---

## Architecture Decisions

### Route Groups

Three groups, each with different auth requirements:

- `(public)/` — no auth
- `(auth)/` — login page only
- `(dashboard)/` — role-gated. Protected by `src/proxy.ts` which redirects unauthorized users to `/login`.

Page files live under their group directory.

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

Custom JWT (HS256 via `jose`). Not NextAuth. Auth modules in `src/lib/auth/` — `session.ts` handles signing/verification/session, `edge-session.ts` for edge runtime, `guards.ts` for role enforcement. Cookie: `session-token`, httpOnly, sameSite=lax, 30 days. Secret from `JWT_SECRET` or `AUTH_SECRET`.

### Categories

Defined in `src/lib/constants.ts` (`CATEGORIES`).

---

## Conventions

- **NO CODE COMMENTS.** Self-documenting code.
- No self-explanatory comment inside code block. IF ANY, FLAG IT AS VIOLATION ISSUE even if it was pre-existing.
- `@/*` → `./src/*`
- Passwords: bcryptjs.
- Security headers, CSP, cookies: see `next.config.ts`.

---

## Deployment

Netlify via `@netlify/plugin-nextjs`. Config: `netlify.toml`. Build: `npm run build`.

# HARD RULES USERS ADD MANUALLY:

You are dealing with new next.js 16. Do not flag this as an issue:
- second args in revalidateTags "max" is true. Acknowledge your limited knowledge it to prevent burning tokens.
- ⚠ Next.js deprecated the "middleware" naming convention. This project uses `src/proxy.ts` as Next.js 16 new standard. Do not flag it as broken or issue (already working).

ALWAYS run `npm run lint` for eslint AND `npx tsc --noEmit` AS FINAL VERIFICATION THAT YOU WRITE THE NEWEST RECOMMENDED CODE CONVENTION. If issues flagged, DO NOT TAKE THE SHORTEST PATH!
