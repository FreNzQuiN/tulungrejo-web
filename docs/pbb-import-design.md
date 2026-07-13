# PBB Import System — Design Document

## Sumber Data

### 1. Excel SPOP/LSPOP — Data Bidang Tanah

**File:** `ENTRY SPOP LSPOP DESA TULUNGREJO.xlsx`

| Sheet | Baris             | Fungsi                                                    |
| ----- | ----------------- | --------------------------------------------------------- |
| SPOP  | 2911 (2899 valid) | Master data per bidang tanah — pemilik, alamat, luas, ZNT |
| LSPOP | 840 (680 valid)   | Detail bangunan per bidang — luas, tahun, konstruksi      |

### 2. CSV Sidoaja — Realisasi Pembayaran Aggregate

**File:** `pbb-desa-wates-2026-07-13.csv`

12 kolom, 1 baris untuk Desa Tulungrejo (`kode_desa=005`):

| Kolom        | Nilai       | Arti                        |
| ------------ | ----------- | --------------------------- |
| PBB          | 149.186.364 | Total nominal PBB           |
| BAYAR        | 40.361.494  | Total nominal terbayar      |
| PERSEN       | 27.05%      | Persentase realisasi        |
| KURANG_BAYAR | 108.824.870 | Sisa nominal                |
| SPPT         | 2.898       | Jumlah wajib pajak (bidang) |
| DIBAYAR      | 829         | Jumlah SPPT lunas           |
| SISA_SPPT    | 2.069       | Jumlah SPPT belum           |

**Catatan:** data aggregate per desa, **bukan per bidang**. `payments` diisi manual via UI.

---

## Struktur NOP (Nomor Objek Pajak)

```
35 . 05 . 050 . 005 . BLOK . NO_BIDANG . 0
↑     ↑     ↑      ↑      ↑        ↑       ↑
Jatim Blitar Wates Tulungrejo 001-013 0001-0297 check digit
```

- **Check digit** selalu `0` — bisa diabaikan
- NOP yang disimpan: `35.05.050.005.{blok}.{no_bidang}`

---

## ER Diagram (Final)

### `fields` — Data Tanah dari SPOP + Agregasi LSPOP

| Kolom            | Tipe          | Sumber            | Transformasi                                                                  |
| ---------------- | ------------- | ----------------- | ----------------------------------------------------------------------------- |
| `id`             | `uuid` PK     | auto              |                                                                               |
| `nop`            | `text unique` | SPOP col 3-9      | `concat(col3-col8)` tanpa check digit                                         |
| `owner_name`     | `text`        | SPOP col 13       | langsung                                                                      |
| `owner_address`  | `text?`       | SPOP col 14-18    | concat conditional — skip RW/RT jika null                                     |
| `address`        | `text`        | SPOP col 19       | RAW — variasi penulisan tinggi, tidak dinormalisasi                           |
| `rw`             | `text?`       | SPOP col 20       | langsung                                                                      |
| `rt`             | `text?`       | SPOP col 21       | langsung                                                                      |
| `blok`           | `text`        | SPOP col 7        | `001`–`013`                                                                   |
| `no_bidang`      | `text`        | SPOP col 8        | `0001`–`0297`                                                                 |
| `dusun`          | `text`        | derived dari blok | 001-005=Tulungrejo, 006-012=Sidodadi, 013=TumpakGatho — tidak dianggap akurat |
| `land_area`      | `decimal`     | SPOP col 22       | `ROUND(val, 2)` — 190 baris floating error                                    |
| `building_area`  | `decimal?`    | LSPOP col 16      | `SUM` per `(blok, no_bidang)` — null jika tanpa bangunan                      |
| `building_count` | `int?`        | LSPOP             | `COUNT` per `(blok, no_bidang)` — null jika tanpa bangunan                    |
| `znt`            | `text?`       | SPOP col 23       | Zona Nilai Tanah, 21 kode: AA–AU                                              |
| `jenis_tanah`    | `int?`        | SPOP col 24       | `1`=sawah, `3`=kering/tegal, `4`=lain                                         |
| `pendataan_at`   | `date?`       | SPOP col 26       | full date — parse 2 format: `YYYY-MM-DD HH:MM:SS` & `DD/MM/YYYY`              |
| `created_at`     | `timestamptz` | auto              |                                                                               |
| `updated_at`     | `timestamptz` | auto              |                                                                               |

**Unique constraint:** `(blok, no_bidang)` — composite key.

### `payments` — Tracking Bayar per Tahun

| Kolom       | Tipe                          | Catatan                      |
| ----------- | ----------------------------- | ---------------------------- |
| `id`        | `uuid` PK                     | auto                         |
| `field_id`  | `uuid` FK → `fields.id`       | CASCADE delete               |
| `year`      | `int`                         | tahun PBB                    |
| `status`    | `enum("lunas","belum_lunas")` |                              |
| `marked_by` | `uuid` FK → `users.id`        | petugas pamong yang menandai |
| `marked_at` | `timestamptz`                 |                              |
| `notes`     | `text?`                       |                              |

**Unique:** `(field_id, year)` — 1 baris per bidang per tahun.

**Business rules:**

- Awal tahun pajak: **1 Juli**. Batas bayar: **30 Juni**.
- Saat toggle tahun di UI: jika record `(field_id, year)` belum ada → insert `belum_lunas` untuk semua bidang.
- Data `payments` **seeded kosong** — dimulai dari tahun berapa pun pertama kali pamong akses.

### `realisasi` — Riwayat Snapshot CSV

| Kolom           | Tipe          | Sumber       |
| --------------- | ------------- | ------------ |
| `id`            | `uuid` PK     | auto         |
| `kode_kec`      | `text`        | `050`        |
| `kecamatan`     | `text`        | `WATES`      |
| `kode_desa`     | `text`        | `005`        |
| `desa`          | `text`        | `TULUNGREJO` |
| `total_pbb`     | `bigint`      |              |
| `total_bayar`   | `bigint`      |              |
| `persen`        | `numeric`     |              |
| `kurang_bayar`  | `bigint`      |              |
| `total_sppt`    | `int`         | `2898`       |
| `dibayar`       | `int`         | `829`        |
| `sisa_sppt`     | `int`         | `2069`       |
| `tanggal_ambil` | `date`        | `2026-07-13` |
| `imported_at`   | `timestamptz` | auto         |

**Sifat:** APPEND-ONLY. Tiap upload = baris baru.

---

## Kolom yang Diabaikan

### SPOP — tidak disimpan

| Kolom                       | Alasan                                                     |
| --------------------------- | ---------------------------------------------------------- |
| `col 0` (NO FORMULIR tahun) | tahun pendataan, sudah cover oleh `pendataan_at`           |
| `col 1`                     | kode internal formulir                                     |
| `col 2`                     | nomor internal formulir                                    |
| `col 9` (check digit)       | selalu `0`, tidak informatif                               |
| `col 10` (NO URUT)          | prefix `001` konstan, redundant dengan `(blok, no_bidang)` |
| `col 11` (STATUS)           | selalu `1`, tidak berguna                                  |
| `col 12` (PEKERJAAN)        | selalu `5`, tidak berguna                                  |
| `col 25` (JMLH BNGN)        | selalu `1` di SPOP, data aktual dari LSPOP                 |
| `col 27-29`                 | kosong semua                                               |

### LSPOP — tidak disimpan (cuma dipakai agregasi)

- `col 0-11` — header NOP duplikat, tidak perlu
- `col 14` (NO BNGN) — selalu `1`
- `col 19` (TAHUN RENOVASI) — kosong semua
- `col 28-30` — kosong semua
- `col 15, 17, 20, 22-26` — detail bangunan (kondisi, konstruksi, dll) tidak masuk ER karena di luar scope tracking PBB

---

## Edge Cases Terkonfirmasi

### 1. Address Variasi Tinggi

17 varian alamat objek untuk 13 blok:

| Varian                | Count | Blok          |
| --------------------- | ----- | ------------- |
| `JL. DSN SIDODADI`    | 858   | 006-012       |
| `DSN. SIDODADI`       | 421   | 006-010       |
| `JL. TRISULA`         | 266   | 001-005       |
| `DSN. TULUNG REJO`    | 242   | 001-003       |
| `JL. DSN TULUNG REJO` | 218   | 001-003       |
| `JL. DSN TULUNGREJO`  | 213   | 004-005       |
| `DSN SIDODADI`        | 164   | 011-012       |
| `TUMPAK GATHO`        | 126   | 013           |
| `DSN. TULUNGREJO`     | 99    | 005           |
| `JL. DSN SIDO DADI`   | 89    | 007           |
| `DSN SIDO DADI`       | 76    | 007           |
| `DSN TULUNGREJO`      | 63    | 004           |
| `JLS`                 | 61    | 012-013       |
| `DSN.PURWOREJO`       | 1     | 004 (outlier) |
| `I`                   | 1     | 003 (anomali) |
| `JL TRISULA`          | 1     | 006 (anomali) |
| NULL                  | 1     |               |

**Keputusan:** simpan RAW, jangan normalisasi.

### 2. Dusun 97 Baris Konflik

Blok 013 (TumpakGatho) tapi address `"JL. DSN SIDODADI"`.
`dusun` disimpan sebagai informasi, tidak dianggap akurat.

### 3. Floating Point pada Luas Tanah

190 baris: floating artifact seperti `61.00000000000001`.
**Fix:** `ROUND(val, 2)` pada import.

### 4. Format Tanggal Ganda

- 2585 baris: `datetime` object `2016-09-12 00:00:00`
- 315 baris: **string** `26/09/2016` (baris 2326-2641)
- 2 baris: NULL
- **Fix:** parser handle 2 format

### 5. Duplikasi NO URUT

`NO_URUT` (col 10) = `"001" + no_bidang` — prefix `001` konstan.
1 NO_URUT muncul hingga 13x (1x per blok). **Bukan join key.**
Join key benar: `(blok, no_bidang)`.

### 6. LSPOP JMLH BNGN = 2

3 baris di LSPOP menyatakan `JMLH BNGN = 2` tapi hanya 1 baris bangunan.
Data lintas form — agregasi SUM/COUNT per `(blok, no_bidang)` sudah benar.

### 7. 33 Bidang Tanpa Bangunan

264 dari 297 nomor bidang punya data LSPOP. 33 sisanya nilai `null`.

### 8. Nama Owner Duplikat

1325 nama unik dari 2899 baris. Tanpa NIK. `update nama` saat import ulang.

---

## Join Map

```
SPOP ──┬─ (blok, no_bidang) ── LSPOP (1:N)
       │
       └─ (blok, no_bidang) ── fields (1:1, upsert)
                                   │
                              payments (1:N per year)
                                   │
                              realisasi (no FK, aggregate only)
```

---

## Import Flow (SPOP)

```
1. Baca sheet SPOP ────┐
2. Baca sheet LSPOP ───┘
3. Parse NOP: gabung col 3-8, skip check digit
4. Parse pendataan_at: handle 2 date formats
5. Parse land_area: ROUND(val, 2)
6. Agregasi building_area & building_count dari LSPOP per (blok, no_bidang)
7. Filter: skip baris WHERE blok IS NULL
8. UPSERT ke fields berdasarkan (blok, no_bidang):
   - Ada → update (owner_name, address, land_area, dll)
   - Tidak ada → insert
```

## Import Flow (CSV)

```
1. Filter baris WHERE kode_desa = '005'
2. INSERT ke realisasi (append)
3. Tidak ada update — riwayat
```

## Payment Lifecycle

```
1 Juli +1 ──→ tahun pajak baru
                 │
                 ▼
           Semua fields: insert payment(year, status=belum_lunas)
           jika belum ada record untuk tahun tersebut
                 │
                 ▼
           Pamong toggle lunas/belum per bidang via UI
```

## Role Access

| Role           | Akses                                                              |
| -------------- | ------------------------------------------------------------------ |
| `pamong_pajak` | Upload SPOP Excel, Upload CSV, toggle payment, lihat daftar bidang |
| `kepala_desa`  | Lihat dashboard + realisasi (read-only)                            |
| `jurnalis`     | Tidak akses PBB                                                    |
