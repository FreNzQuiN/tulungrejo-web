# PBB & Kades Dashboard — Technical Reference

> Cross-cutting documentation for the PBB (Pamong) and Kepala Desa dashboards.
> Covers **data flow, component orchestration, auth chain, and business rules**.
> For source of truth on API contracts, data types, and schemas, see the referenced files.

---

## 1. Role Access Matrix

| Feature                   | Pamong | Kades | Jurnalis | Source                                 |
| ------------------------- | ------ | ----- | -------- | -------------------------------------- |
| List fields + filter      | ✅     | ✅    | ❌       | `src/app/api/pbb/list/route.ts`        |
| Toggle payment status     | ✅     | ❌    | ❌       | `src/app/api/pbb/toggle/route.ts`      |
| Import Excel/CSV          | ✅     | ❌    | ❌       | `src/app/api/pbb/import/route.ts`      |
| View block images         | ✅     | ✅    | ❌       | `src/app/api/pbb/blok/[blok]/route.ts` |
| View realisasi dashboard  | ✅     | ✅    | ❌       | `src/app/api/pbb/realisasi/route.ts`   |
| View field plots (detail) | ✅     | ❌    | ❌       | `src/app/api/pbb/plots/route.ts`       |

**Auth enforcement chain:**

```
src/proxy.ts  →  guards dashboard pages, redirects to /login
src/lib/auth/guards.ts  →  requireRole() in each API route, returns 401/403
src/components/providers.tsx  →  useAuth() hook on FE, renders <AccessDenied />
```

---

## 2. Auth Flow

```
Page mount
  → Providers bootstraps: GET /api/auth/me  (src/app/api/auth/me/route.ts)
  → user = null → isLoading → show spinner
  → user resolved → check role
    → wrong role / none → <AccessDenied />  (src/components/auth/access-denied.tsx)
    → correct role → render dashboard, fetch data
```

**Implementation:** `src/lib/auth/session.ts` — custom JWT (HS256, `jose`), `session-token` cookie, 30 days.
**Hook:** `useAuth()` from `src/components/providers.tsx` returns `{ user, isLoading, isAuthenticated, refresh, signOut }`.

---

## 3. Data Flow

### PBB Page (`src/app/(dashboard)/pbb/page.tsx`)

**Component orchestration:**

```
BlokSelector ──selectedBlok──→ BlokViewer → GET /api/pbb/blok/{blok}
Search/Filter ──→ GET /api/pbb/list?blok=&status=&search=
                     ↓
                citizen-card list (FieldView[])
                     ↓
                [Pamong] Toggle → POST /api/pbb/toggle {fieldId, year}
                                  → updates list on 200
```

**Role-based rendering:**

| Element               | Pamong | Kades |
| --------------------- | ------ | ----- |
| ImportButton          | ✅     | ❌    |
| Toggle buttons        | ✅     | ❌    |
| Field cards           | ✅     | ✅    |
| Block selector/viewer | ✅     | ✅    |

**Search/filter:** text search on name/NOP, blok selector, status filter, year selector. All filters trigger re-fetch with 300ms debounce. Pagination included.

**States:** Loading (skeleton cards), Empty, Error (toast/alert).

### Kades Dashboard (`src/app/(dashboard)/kepala-desa/page.tsx`)

**Data flow:**

```
Mount → role guard → GET /api/pbb/realisasi?tahun={year} (one-shot, no polling)
  → 404 → empty state
  → success → render hero card + 2×2 grid
```

**Display:** Summary card (progress, total SPPT, paid count) + 4 stat cards (nominal terbayar, sisa piutang, SPPT lunas, SPPT tertunggak). Year selector for filtering.

---

## 4. Shared Components

| Component      | File                                    | Behavior                                                                                                                                                             |
| -------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BlokSelector` | `src/components/pbb/blok-selector.tsx`  | `<select>` from `BLOK_TO_DUSUN` + default "-- Pilih Blok --"                                                                                                         |
| `BlokViewer`   | `src/components/pbb/blok-viewer.tsx`    | Fetches `/api/pbb/blok/{blok}`. Handles idle/loading/error/empty states. Renders `next/image` with `unoptimized` (base64 source). Carousel nav for multi-image blok. |
| `ImportButton` | `src/components/pbb/import-button.tsx`  | Hidden file input → POST `/api/pbb/import` → sonner toast result                                                                                                     |
| `AccessDenied` | `src/components/auth/access-denied.tsx` | ShieldAlert icon + message prop + "Login" redirect button                                                                                                            |

---

## 5. Critical Business Rules

### Payment Year

- Tax year has a configurable transition date (default June 30). Before that date, the current tax year is the previous calendar year. See `src/lib/pbb-tax-year.ts`.
- UI includes a year selector; defaults to current tax year.
- Default status if no payment record exists: `"belum_lunas"`.

### Payment Toggle

- Payments created **on-demand** per toggle — no batch initialization.
- Toggle when no record exists → creates `"lunas"`.
- Toggle when record exists → flips `"lunas"` ↔ `"belum_lunas"`.
- Only current tax year can be toggled.
- Pamong with `assignedBlok` can only toggle fields in their assigned blok.

### Realisasi Data

- Each import adds a row; dashboard shows latest by `importedAt`.
- Aggregate per desa from CSV, **not** computed from individual `payments` records.
- Per-field payment tracking is separate in `payments` table.

### Block Images

- Stored as base64 in DB (`MediumText`). No upload UI — manual seed only.
- Rendered with `next/image` + `unoptimized` (Next.js cannot optimize data URIs).

---
