# PBB Import System — Design Document

> Documents the **external data formats** (SPOP/LSPOP Excel, CSV PBB-P2) and **edge cases** discovered during data analysis.
> Implementation lives in `src/lib/pbb-import/`. Schema at `prisma/schema.prisma`.

---

## Sumber Data

### 1. Excel SPOP/LSPOP — Data Bidang Tanah

**File:** `ENTRY SPOP LSPOP DESA TULUNGREJO.xlsx`

| Sheet | Baris             | Fungsi                                                    |
| ----- | ----------------- | --------------------------------------------------------- |
| SPOP  | 2911 (2899 valid) | Master data per bidang tanah — pemilik, alamat, luas, ZNT |
| LSPOP | 840 (680 valid)   | Detail bangunan per bidang — luas, tahun, konstruksi      |

### 2. CSV Sidoaja — Realisasi Pembayaran Aggregate

**File:** `pbb-desa-wates-2026-07-13.csv`

12 kolom, 1 baris untuk Desa Tulungrejo (`kode_desa=005`). Kolom dipetakan ke tabel `realisasi`.

> Data aggregate per desa, **bukan per bidang**. Pelacakan bayar per bidang dilakukan manual via UI toggle (tabel `payments`).

---

## Struktur NOP (Nomor Objek Pajak)

```
35 . 05 . 050 . 005 . BLOK . NO_BIDANG . 0
↑     ↑     ↑      ↑      ↑        ↑       ↑
Jatim Blitar Wates Tulungrejo 001-013 0001-0297 check digit
```

- Check digit selalu `0`, diabaikan. NOP disimpan: `35.05.050.005.{blok}.{no_bidang}`.

---

## Column Mapping: SPOP → `fields`

See `prisma/schema.prisma` for the `fields` model. Key transformations during import:

| Fields column   | SPOP source       | Transform                                                                                             |
| --------------- | ----------------- | ----------------------------------------------------------------------------------------------------- |
| `nop`           | col 3-9           | concat col 3-8, skip check digit (col 9)                                                              |
| `ownerAddress`  | col 14-18         | conditional concat — skip RW/RT if null                                                               |
| `address`       | col 19            | RAW — not normalized (see Edge Cases)                                                                 |
| `blok`          | col 7             | `001`–`013`                                                                                           |
| `noBidang`      | col 8             | `0001`–`0297`                                                                                         |
| `dusun`         | derived from blok | `001-005=Tulungrejo`, `006-012=Sidodadi`, `013=TumpakGatho`. Not considered accurate (see Edge Cases) |
| `landArea`      | col 22            | `ROUND(val, 2)` — 190 rows had floating-point artifacts                                               |
| `buildingArea`  | LSPOP col 16      | `SUM` per `(blok, no_bidang)`. Null if no building data                                               |
| `buildingCount` | LSPOP             | `COUNT` per `(blok, no_bidang)`. Null if no building data                                             |
| `znt`           | col 23            | Zona Nilai Tanah, 21 codes: AA–AU                                                                     |
| `jenisTanah`    | col 24            | `1=sawah`, `3=kering/tegal`, `4=lain`                                                                 |
| `pendataanAt`   | col 26            | Handles 2 date formats: `YYYY-MM-DD HH:MM:SS` and `DD/MM/YYYY`                                        |
| `noUrut`        | col 10            | Stored but redundant with `(blok, noBidang)`. See Edge Case #5                                        |

**Unique constraint (composite):** `@@unique([blok, noBidang])` → upsert key.

For `payments`, `realisasi`, `block_images` schemas → see `prisma/schema.prisma`.

---

## Columns Ignored (Not Stored)

### SPOP — skipped

| Column                    | Reason                                     |
| ------------------------- | ------------------------------------------ |
| col 0 (NO FORMULIR tahun) | Covered by `pendataan_at`                  |
| col 1, 2                  | Internal form codes                        |
| col 9 (check digit)       | Always `0`                                 |
| col 11 (STATUS)           | Always `1`                                 |
| col 12 (PEKERJAAN)        | Always `5`                                 |
| col 25 (JMLH BNGN)        | Always `1` in SPOP; actual data from LSPOP |
| col 27-29                 | Always empty                               |

### LSPOP — used for aggregation only (not stored)

- col 0-11: NOP header (duplicate)
- col 14 (NO BNGN): Always `1`
- col 19 (TAHUN RENOVASI): All empty
- col 28-30: All empty
- col 15, 17, 20, 22-26: Building details outside PBB tracking scope

---

## Edge Cases (from data analysis)

### 1. Address Variation — 17 variants

| Variasi                                                                            | Count | Blok    |
| ---------------------------------------------------------------------------------- | ----- | ------- |
| `JL. DSN SIDODADI`                                                                 | 858   | 006-012 |
| `DSN. SIDODADI`                                                                    | 421   | 006-010 |
| `JL. TRISULA`                                                                      | 266   | 001-005 |
| (14 more variants...)                                                              |       |         |
| **Decision:** Store RAW, do not normalize. Address cleaning is a separate concern. |

### 2. Dusun Conflict — 97 rows

Blok 013 (TumpakGatho) has address `"JL. DSN SIDODADI"`. `dusun` is stored as metadata, not authoritative.

### 3. Floating Point on Land Area — 190 rows

Artifacts like `61.00000000000001`. **Fix:** `ROUND(val, 2)` during import.

### 4. Dual Date Format — 315 rows

- 2585 rows: `datetime` object `2016-09-12 00:00:00`
- 315 rows: **string** `26/09/2016`
- 2 rows: NULL
- **Fix:** parser handles both formats.

### 5. NO_URUT Duplication

Col 10 = concatenation `"001" + no_bidang`. Prefix `001` is constant. Same `no_urut` can appear in 13 different blok. **Not a join key.** Join key is `(blok, no_bidang)`. Field IS stored in DB for backward compatibility but not used for joins.

### 6. LSPOP Building Count Mismatch — 3 rows

Column `JMLH BNGN` = 2 but only 1 building row. Aggregation by `(blok, no_bidang)` handles this correctly.

### 7. Fields Without Buildings — 33 of 297 field numbers

No LSPOP data → `buildingArea` and `buildingCount` remain null.

### 8. Duplicate Owner Names — 1325 unique from 2899 rows

No NIK. On re-import, owner name is updated via upsert.

---

## Join Map

```
SPOP ──┬─ (blok, no_bidang) ── LSPOP (1:N)
       │
       └─ (blok, no_bidang) ── fields (1:1, upsert)
                                    │
                               payments (1:N, per year)
                                    │
                               realisasi (no FK, aggregate only)
```

---

## Import Flows

**SPOP import** (`detectFileType = "spop"`):

1. Parse SPOP sheet → `FieldRecord[]`
2. Parse LSPOP sheet → aggregate building area/count per `(blok, no_bidang)`
3. Merge: attach LSPOP aggregates to matching SPOP records
4. Batch UPSERT into `fields` table via raw SQL (batches of 500)
5. Upsert key: `@@unique([blok, noBidang])` — existing rows updated, new rows inserted

**CSV import** (`detectFileType = "pbbp2"`):

1. Filter row where `kode_desa = '005'`
2. INSERT into `realisasi` table (append-only — each upload = new row)

→ Implementation: `src/lib/pbb-import/index.ts`

---

## Payment Lifecycle (Actual Behavior)

- Current year = `new Date().getFullYear()`. No year selector in UI.
- No batch initialization. Payments table starts empty.
- When Pamong toggles a field:
  - If no `(fieldId, year)` record exists → create with `status = "lunas"`
  - If record exists → flip `"lunas"` ↔ `"belum_lunas"`
- `Realisasi` is annual aggregate from CSV (via import), **not** computed from individual payments.

→ Toggle API: `src/app/api/pbb/toggle/route.ts`

---

## Role Access

| Role           | Access                                        |
| -------------- | --------------------------------------------- |
| `pamong_pajak` | Upload SPOP/CSV, toggle payments, view fields |
| `kepala_desa`  | View dashboard + realisasi (read-only)        |
| `jurnalis`     | No PBB access                                 |

Auth enforcement: `requireRole()` in each route handler. See `src/lib/auth-helpers.ts`.
