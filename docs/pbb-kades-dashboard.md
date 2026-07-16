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
src/lib/auth-helpers.ts  →  requireRole() in each API route, returns 401/403
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

**Implementation:** `src/lib/auth-custom.ts` — custom JWT (HS256, `jose`), `session-token` cookie, 30 days.
**Hook:** `useAuth()` from `src/components/providers.tsx` returns `{ user, isLoading, isAuthenticated, refresh, signOut }`.

---

## 3. Data Flow

### PBB Page (`src/app/(dashboard)/pbb/page.tsx`)

**Component orchestration:**

```
BlokSelector ──selectedBlok──→ BlokViewer → GET /api/pbb/blok/{blok}
                                        ↓
Search/Filter ──→ GET /api/pbb/list?blok=&status=&search=
                     ↓
                citizen-card list (FieldView[])
                     ↓
                [Pamong] Toggle → POST /api/pbb/toggle {fieldId, year}
                                  → optimistic update on response.ok
```

**State machine:**

- 8 state variables: `fields[]`, `loading`, `error`, `search`, `blokFilter`, `statusFilter`, `selectedBlok`, `toggling`
- Re-fetch fires on every filter change (no debounce)
- Toggle uses optimistic update — flips locally on 200, no rollback on failure

**Role-based rendering:**

| Element               | Pamong | Kades |
| --------------------- | ------ | ----- |
| ImportButton          | ✅     | ❌    |
| Toggle buttons        | ✅     | ❌    |
| Field cards           | ✅     | ✅    |
| Block selector/viewer | ✅     | ✅    |

**Toggle button text:**

| Status          | Label                | Background             |
| --------------- | -------------------- | ---------------------- |
| `"lunas"`       | "Tandai Belum Bayar" | `var(--color-danger)`  |
| `"belum_lunas"` | "Verifikasi Bayar"   | `var(--color-success)` |

**Filter options:**

- Blok: `""` (Semua Blok) + `"001"`–`"013"` with dusun label
- Status: `""` (Semua Status) | `"lunas"` | `"belum_lunas"`
- Search: text filter on `ownerName`, `nop`, `noBidang` (server-side)

**States:** Loading (5-skeleton card list), Empty ("Tidak ada data bidang ditemukan."), Error (red alert).

### Kades Dashboard (`src/app/(dashboard)/kepala-desa/page.tsx`)

**Data flow:**

```
Mount → role guard → GET /api/pbb/realisasi (one-shot, no polling)
  → 404 → "Belum ada data realisasi PBB."
  → success → render hero card + 2×2 grid
```

**State machine:** 3 state variables: `data`, `loading`, `error`.

**Display logic:**

| Metric            | Calculation                              | Color                |
| ----------------- | ---------------------------------------- | -------------------- |
| Hero progress     | `data.persen%`                           | `--color-dark-brown` |
| Nominal terbayar  | `data.totalBayar`                        | `--color-success`    |
| Sisa piutang      | `data.kurangBayar`                       | `--color-danger`     |
| Piutang progress  | `(100 - data.persen)%`                   | `--color-danger`     |
| SPPT lunas %      | `(data.dibayar / data.totalSppt) * 100`  | `--color-success`    |
| SPPT tertunggak % | `(data.sisaSppt / data.totalSppt) * 100` | `--color-danger`     |

---

## 4. Shared Components

| Component      | File                                    | Behavior                                                                                                                             |
| -------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `BlokSelector` | `src/components/pbb/blok-selector.tsx`  | `<select>` from `BLOK_TO_DUSUN` + default "-- Pilih Blok --"                                                                         |
| `BlokViewer`   | `src/components/pbb/blok-viewer.tsx`    | 5 states: idle→loading→error→empty→success. Fetches `/api/pbb/blok/{blok}`. Renders `next/image` with `unoptimized` (base64 source). |
| `ImportButton` | `src/components/pbb/import-button.tsx`  | Hidden file input → POST `/api/pbb/import` → sonner toast result                                                                     |
| `AccessDenied` | `src/components/auth/access-denied.tsx` | ShieldAlert icon + message prop + "Login" redirect button                                                                            |

---

## 5. Critical Business Rules

### Payment Year

- Current year = `new Date().getFullYear()`
- No year selector in UI — always current year
- Default status if no payment record exists: `"belum_lunas"`

### Payment Creation

- Payments created **on-demand** per toggle — no batch initialization
- Toggle when no record exists → creates `"lunas"` (sets to paid directly)
- Toggle when record exists → flips `"lunas"` ↔ `"belum_lunas"`

### Realisasi Data

- **Append-only**: each import adds a row; dashboard shows latest (`importedAt DESC`)
- Aggregate per desa from CSV, **not** computed from individual `payments` records
- Per-field payment tracking is separate in `payments` table

### Block Images

- Stored as base64 in DB (`MediumText`). No upload UI — manual seed only.
- Rendered with `next/image` + `unoptimized` (Next.js cannot optimize data URIs)

### Date & Currency

- Indonesian locale (`id-ID`) for both
- `formatCurrency`: `Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" })`
- `formatDate`: `toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })`

---

## 6. Data Types (Quick Reference)

| Type            | File                        | Usage                      |
| --------------- | --------------------------- | -------------------------- |
| `FieldView`     | `src/lib/types.ts`          | PBB list response          |
| `RealisasiView` | `src/lib/types.ts`          | Kades dashboard response   |
| `BlockImage`    | Inline in `blok-viewer.tsx` | Block image response       |
| `BLOK_TO_DUSUN` | `src/lib/constants.ts`      | Maps blok 001-013 to dusun |

---

## 7. CSS Architecture (PBB-specific)

PBB classes defined in `src/app/index.css`. Key design tokens:

- `--color-success` (green) — paid indicators
- `--color-danger` (red) — unpaid indicators
- `--color-dark-brown` — Kades header accent
- `--color-muted` (gray) — secondary text

PBB layout uses `.pbb-layout` (two-column grid), `.glass-panel` (glassmorphism cards), `.citizen-card` (field list items). See `index.css` for all class definitions.
