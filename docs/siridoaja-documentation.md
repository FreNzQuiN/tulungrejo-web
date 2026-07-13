# Dokumentasi Sistem: SIRIDOAJA — Bapenda Kabupaten Blitar

> **Sistem Informasi Data Online Pajak Daerah**  
> Badan Pendapatan Daerah (Bapenda) Kabupaten Blitar  
> URL: `http://siridoaja.blitarkab.go.id`  
> Terakhir diverifikasi: **Juli 2026**

---

## Daftar Isi

1. [Ringkasan Umum](#1-ringkasan-umum)
2. [Arsitektur Sistem](#2-arsitektur-sistem)
3. [Peta URL & Struktur Website](#3-peta-url--struktur-website)
4. [Modul Dashboard (Rekapitulasi Pajak)](#4-modul-dashboard-rekapitulasi-pajak)
5. [Modul Cek Status PBB-P2](#5-modul-cek-status-pbb-p2)
6. [API Publik: GENIE-BAPENDA](#6-api-publik-genie-bapenda)
7. [Portal Pembayaran (e-Pada)](#7-portal-pembayaran-e-pada)
8. [Data Open-Data Kabupaten Blitar](#8-data-open-data-kabupaten-blitar)
9. [Keterbatasan & Catatan Teknis](#9-keterbatasan--catatan-teknis)
10. [Rekomendasi untuk Kebutuhan Pengguna](#10-rekomendasi-untuk-kebutuhan-pengguna)
11. [Hasil Eksplorasi via Playwright](#11-hasil-eksplorasi-via-playwright-mcp-browser-automation)
12. [Ringkasan: Akses Data PBB untuk Kebutuhan Pengguna](#12-ringkasan-akses-data-pbb-untuk-kebutuhan-pengguna)

---

## 1. Ringkasan Umum

**SIRIDOAJA** (Sistem Informasi Data Online Pajak Daerah) adalah sistem informasi pajak daerah milik **Bapenda Kabupaten Blitar** yang memfasilitasi:

- Monitoring realisasi penerimaan pajak daerah (realtime)
- Cek status pembayaran PBB-P2 (Pajak Bumi dan Bangunan Pedesaan/Perkotaan)
- Integrasi data Host-to-Host (H2H) untuk berbagai jenis pajak
- Portal pembayaran pajak online
- Layanan informasi data kecamatan/desa

**Organisasi yang mengelola:**  
Badan Pendapatan Daerah (Bapenda) Kabupaten Blitar  
Jl. WR. Supratman 89, Kota Blitar  
Telp: 0342-801xxx  
Email: bapenda@blitarkab.go.id

---

## 2. Arsitektur Sistem

### Stack Teknologi

| Komponen           | Teknologi                                           |
| ------------------ | --------------------------------------------------- |
| Web Server         | Apache/2.4.37 (Win32) + OpenSSL/1.1.1               |
| Bahasa Server-side | PHP/7.2.12                                          |
| Backend Aplikasi   | Delphi/C++ Builder (IntraWeb) — file `.dll`         |
| Database           | Firebird/InterBase (file `.GDB`)                    |
| Database Server    | Oracle Client (OraClient11g_home1) — untuk Firebird |
| IP Database        | 192.168.1.9 (internal network)                      |

### Database Files (dari Setting.ini)

| File Database       | Lokasi (Server)                       | Keterangan         |
| ------------------- | ------------------------------------- | ------------------ |
| `DISPENDAKAB.GDB`   | `192.168.1.9:D:\DATA MASTER DIPENDA\` | Database utama     |
| `SIMPBB.GDB`        | `192.168.1.9:D:\DATA MASTER DIPENDA\` | Data PBB           |
| `SIMVERA_BPIDP.GDB` | `192.168.1.9:D:\BPHTB\`               | Data BPHTB         |
| `SPPT_SMTR.GDB`     | `192.168.1.9:D:\DATA MASTER DIPENDA\` | Data SPPT semester |
| `DATABASE2DESA`     | `192.168.1.9:D:\DATA MASTER DIPENDA\` | Data desa          |

### Arsitektur部署

```
┌─────────────────────────────────────────────────┐
│                  INTERNET                        │
│                                                  │
│  siridoaja.blitarkab.go.id (Apache + PHP)        │
│     │                                            │
│     ├── /Dash_02/Dash4Det/*.dll  (IntraWeb App)  │
│     ├── /dash_02f/              (Dashboard v2)   │
│     ├── /dash_02g/              (Dashboard v3)   │
│     ├── /Info2PBB/              (Cek Status PBB) │
│     ├── /Api/                   (API Gateway)    │
│     └── /ptsl/app/              (SIRIDOAJA App)  │
│                                                  │
├─────────────────────────────────────────────────┤
│              INTERNAL NETWORK (192.168.1.9)       │
│                                                  │
│  Firebird DB (DISPENDAKAB.GDB, SIMPBB.GDB, ...) │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 3. Peta URL & Struktur Website

### Level 1: Landing Pages

| URL                                         | Fungsi                           | Status             |
| ------------------------------------------- | -------------------------------- | ------------------ |
| `http://siridoaja.blitarkab.go.id`          | Landing utama (SPA, JS-rendered) | Aktif (Loading...) |
| `http://siridoaja.blitarkab.go.id/link/`    | Option link port                 | Aktif              |
| `http://siridoaja.blitarkab.go.id/Bapenda/` | Portal Bapenda (JS-rendered)     | Aktif              |

### Level 2: Dashboard

| URL                                                        | Fungsi                                  | Data Realtime |
| ---------------------------------------------------------- | --------------------------------------- | ------------- |
| `http://siridoaja.blitarkab.go.id/dash_02/Home.html`       | Dashboard v1 (PBB, Reklame, BPHTB, dll) | Tidak (Rp. 0) |
| `http://siridoaja.blitarkab.go.id/dash_02f/`               | Dashboard v2 — **Data Live 2026**       | **Ya**        |
| `http://siridoaja.blitarkab.go.id/dash_02g/`               | Dashboard v3 — **Data Live 2026**       | **Ya**        |
| `http://siridoaja.blitarkab.go.id/dashboard/01x/Home.html` | Landing Page Corporate                  | Template      |
| `http://siridoaja.blitarkab.go.id/dashboard/02x/Home.html` | Landing Page Corporate v2               | Template      |

### Level 3: Aplikasi & Modul

| URL                                                        | Fungsi                                  |
| ---------------------------------------------------------- | --------------------------------------- |
| `http://siridoaja.blitarkab.go.id/Info2PBB/index_Defa.php` | **Cek Status PBB-P2** (berdasarkan NOP) |
| `http://siridoaja.blitarkab.go.id/Api/`                    | **API Gateway (GENIE-BAPENDA)**         |
| `http://siridoaja.blitarkab.go.id/ptsl/app/`               | Aplikasi SIRIDOAJA desktop              |

### Level 4: Backend / Delphi Apps

| URL                                                                                  | Fungsi                         |
| ------------------------------------------------------------------------------------ | ------------------------------ |
| `http://siridoaja.blitarkab.go.id/Dash_02/Dash4Det/Dash4Det_07.dll`                  | Dashboard Detail v7 (IntraWeb) |
| `http://siridoaja.blitarkab.go.id/Dash_02/Dash4Det/Dash4Det.dll`                     | Dashboard Detail utama         |
| `http://siridoaja.blitarkab.go.id/Dash_02/Dash4Det/Dash4Det_01x.dll` s.d. `_06x.dll` | Dashboard Detail versi lain    |

### Level 5: Pendukung

| URL                                                             | Fungsi             |
| --------------------------------------------------------------- | ------------------ |
| `http://siridoaja.blitarkab.go.id/Info2PBB/blog/blog.html`      | Blog informasi     |
| `http://siridoaja.blitarkab.go.id/Info2PBB/images/`             | File gambar        |
| `http://siridoaja.blitarkab.go.id/Dash_02/Dash4Det/Setting.ini` | Konfigurasi sistem |

---

## 4. Modul Dashboard (Rekapitulasi Pajak)

### Data Live — `dash_02f` dan `dash_02g`

Dashboard ini menampilkan **realisasi penerimaan pajak daerah tahun 2026** secara realtime dari database internal.

**Terakhir diperiksa: Juli 2026**

#### Rekapitulasi Penerimaan Pajak Daerah Tahun 2026

| No  | Jenis Pajak   | Target 2026 (Rp)       | Realisasi (Rp)     | Persentase | Keterangan                   |
| --- | ------------- | ---------------------- | ------------------ | ---------- | ---------------------------- |
| 1   | PBJT-HOTEL    | 244.800.000            | 93.441.447         | 38,17%     | Pajak Hotel                  |
| 2   | PBJT-RESTORAN | 6.632.400.000          | 1.959.777.971      | 29,55%     | Pajak Restoran               |
| 3   | PBJT-HIBURAN  | 2.130.000.000          | 1.224.894.675      | 57,51%     | Pajak Hiburan                |
| 4   | REKLAME       | 827.000.000            | 275.477.086        | 33,31%     | Pajak Reklame                |
| 5   | PBJT-TL       | 52.000.000.000         | 28.902.965.528     | 55,58%     | Pajak Penerangan Jalan       |
| 6   | PBJT-PARKIR   | 225.000.000            | 38.762.358         | 17,23%     | Pajak Parkir                 |
| 7   | AIR TANAH     | 650.000.000            | 1.604.518.400      | 246,85%    | **Over-achiever**            |
| 8   | PBB-P2        | 46.317.798.087         | 18.960.999.582     | 40,94%     | PBB Pedesaan/Perkotaan       |
| 9   | MBLB          | 3.000.000.000          | 3.584.032.503      | 119,47%    | **Over-achiever**            |
| 10  | BPHTB         | 25.436.795.776,48      | 12.354.466.553     | 48,57%     | Bea Perolehan Hak atas Tanah |
|     | **TOTAL**     | **137.463.793.863,48** | **68.999.336.103** | **50,19%** |                              |

> **Catatan:** Nilai di `dash_02g` sedikit berbeda dari `dash_02f` (terjadi pembaruan berkala). PBB-P2 di `dash_02g`: Rp 18.734.850.634 (40,45%), Total: Rp 68.056.380.654,40 (49,51%).

#### Jenis Pajak yang Dilayani

| Kode          | Jenis Pajak                                    | Singkatan |
| ------------- | ---------------------------------------------- | --------- |
| PBB-P2        | Pajak Bumi dan Bangunan Pedesaan/Perkotaan     | PBB       |
| BPHTB         | Bea Perolehan Hak atas Tanah dan/atau Bangunan | BPHTB     |
| PBJT-HOTEL    | Pajak Hotel                                    | Hotel     |
| PBJT-RESTORAN | Pajak Restoran                                 | Restoran  |
| PBJT-HIBURAN  | Pajak Hiburan                                  | Hiburan   |
| REKLAME       | Pajak Reklame                                  | Reklame   |
| PBJT-TL       | Pajak Penerangan Jalan                         | TL/PJU    |
| PBJT-PARKIR   | Pajak Parkir                                   | Parkir    |
| AIR TANAH     | Pajak Pengambilan Air Tanah                    | Air Tanah |
| MBLB          | Pajak Mineral Bukan Logam & Batuan             | MBLB      |

---

## 5. Modul Cek Status PBB-P2

**URL:** `http://siridoaja.blitarkab.go.id/Info2PBB/index_Defa.php`

### Fungsi

Layanan publik untuk mengecek status pembayaran PBB-P2 berdasarkan **NOP** (Nomor Objek Pajak).

### Formulir Input

- **NOP** — Nomor Objek Pajak (format: xxx.xxxx.xxxx.xxxx.xx.xxx)
- **TAHUN** — Tahun pajak

### Data yang Ditampilkan

| Field         | Keterangan                           | Contoh                    |
| ------------- | ------------------------------------ | ------------------------- |
| NOP           | Nomor Objek Pajak                    | xxx.xxxx.xxxx.xxxx.xx.xxx |
| TAHUN         | Tahun pajak                          | 2023                      |
| NAMA          | Nama wajib pajak                     | JULI HARIANTO             |
| ALAMAT        | Alamat objek pajak                   | JATITENGAH                |
| LUAS BUMI     | Luas tanah (M²)                      | 1.000 M²                  |
| LUAS BANGUNAN | Luas bangunan (M²)                   | 200 M²                    |
| NJOP BUMI     | Nilai Jual Objek Pajak Tanah (Rp)    | 10.000.000                |
| NJOP BANGUNAN | Nilai Jual Objek Pajak Bangunan (Rp) | 25.000.000                |
| NJOP          | Total NJOP (Rp)                      | 35.000.000                |
| PBB           | Pajak yang terhutang (Rp)            | 25.000                    |
| STATUS        | Status pembayaran                    | SUDAH LUNAS / BELUM LUNAS |

### Fitur QRIS

Tersedia tombol **"Buat QRIS"** untuk pembayaran PBB melalui QRIS (Quick Response Indonesian Standard).

---

## 6. API Publik: GENIE-BAPENDA

**URL:** `http://siridoaja.blitarkab.go.id/Api/`

### Endpoint

```
http://siridoaja.blitarkab.go.id/Api/h2h_bapenda.php
```

> **Status:** Endpoint mengembalikan HTTP 404. API kemungkinan hanya dapat diakses dari jaringan internal atau memerlukan autentikasi khusus.

### Parameter yang Didokumentasikan

| Jenis            | Parameter                            | Format                                                      | Contoh         |
| ---------------- | ------------------------------------ | ----------------------------------------------------------- | -------------- |
| Cek NIK          | `jenis=nik&id=...`                   | `h2h_bapenda.php?jenis=nik&id=3505xxxxxxxxxxxx`             | NIK KTP        |
| Cek SPPT/PBB     | `jenis=pbb&nop=...&tahun=...`        | `h2h_bapenda.php?jenis=pbb&nop=3505xxxxxxxxxxxx&tahun=2023` | NOP + Tahun    |
| Cek SSPD Reklame | `jenis=reklame&noreg=...`            | `h2h_bapenda.php?jenis=reklame&noreg=xxx`                   | No. Registrasi |
| Cek BPHTB        | `jenis=bphtb&tgl=dd-mm-yyyy&nop=...` | `h2h_bapenda.php?jenis=bphtb&tgl=01-01-2023&nop=3505xxx`    | Tanggal + NOP  |
| Cek KSWP         | `jenis=kspw&nik=...`                 | `h2h_bapenda.php?jenis=kspw&nik=3505xxxxxxxxxxxx`           | NIK KTP        |

### Contoh Penggunaan (Curl)

```bash
# Cek status PBB berdasarkan NOP
curl "http://siridoaja.blitarkab.go.id/Api/h2h_bapenda.php?jenis=pbb&nop=3505XXXXXXXXXXXX&tahun=2023"

# Cek NIK (KSWP)
curl "http://siridoaja.blitarkab.go.id/Api/h2h_bapenda.php?jenis=nik&id=3505XXXXXXXXXXXX"

# Cek BPHTB
curl "http://siridoaja.blitarkab.go.id/Api/h2h_bapenda.php?jenis=bphtb&tgl=01-01-2023&nop=3505XXXXXXXXXXXX"
```

> **Penting:** Saat pengujian, semua endpoint mengembalikan **404 Not Found**. API ini kemungkinan:
>
> 1. Hanya aktif dari jaringan internal (IP dinamis)
> 2. Memerlukan autentikasi tertentu
> 3. Menggunakan port lain (port 94 atau port 96 — lihat halaman `/link/`)

---

## 7. Portal Pembayaran (e-Pada)

**URL:** `https://e-pada.blitarkab.go.id/portal_payment/index.php`

### Jenis Pajak yang Tersedia untuk Pembayaran Online

| No  | Jenis Pajak                        | URL                                     | Status   |
| --- | ---------------------------------- | --------------------------------------- | -------- |
| 1   | Pajak PBB                          | `/portal_payment/pbb`                   | Tersedia |
| 2   | Pajak BPHTB                        | `/portal_payment/bphtb`                 | Tersedia |
| 3   | Pajak Hotel                        | `/portal_payment/pdl?jp=1`              | Tersedia |
| 4   | Pajak Restoran                     | `/portal_payment/pdl?jp=2`              | Tersedia |
| 5   | Pajak Hiburan                      | `/portal_payment/pdl?jp=4`              | Tersedia |
| 6   | Pajak Mineral Bukan Logam & Batuan | `/portal_payment/pdl?jp=6`              | Tersedia |
| 7   | Pajak Parkir                       | `/portal_payment/pdl?jp=11`             | Tersedia |
| 8   | Pajak Air Tanah                    | `/portal_payment/pdl?jp=7`              | Tersedia |
| 9   | Pajak Reklame                      | `/portal_payment/pdl/index_reklame.php` | Tersedia |
| 10  | Pajak Penerangan Jalan             | `/portal_payment/pdl?jp=14`             | Tersedia |

---

## 8. Data Open-Data Kabupaten Blitar

Data PBB juga tersedia melalui **Portal Data Kabupaten Blitar** (`data.blitarkab.go.id`):

### Realisasi Pungutan PBB per Kecamatan (2019–2025)

| Tahun | Realisasi (Rp) | Perubahan |
| ----- | -------------- | --------- |
| 2019  | 28.058.228.367 | —         |
| 2020  | 26.512.769.776 | -5,5%     |
| 2021  | 31.179.797.434 | +17,6%    |
| 2022  | 35.721.597.576 | +14,6%    |
| 2023  | 41.256.751.026 | +15,5%    |
| 2024  | 44.525.243.054 | +7,9%     |
| 2025  | 40.988.800.869 | -7,9%     |

### Jumlah Objek PBB per Kecamatan

| Tahun | Jumlah Objek Pajak | Perubahan |
| ----- | ------------------ | --------- |
| 2019  | 766.894            | —         |
| 2020  | 769.910            | +0,4%     |
| 2021  | 780.247            | +1,3%     |
| 2022  | 790.657            | +1,3%     |
| 2023  | 798.772            | +1,0%     |
| 2024  | 804.732            | +0,7%     |
| 2025  | 811.283            | +0,8%     |

### Target Pungutan PBB

| Tahun | Target (Rp)    |
| ----- | -------------- |
| 2019  | 28.050.000.000 |
| 2020  | 23.000.000.000 |
| 2021  | 27.350.000.000 |
| 2022  | 36.300.000.000 |
| 2023  | 45.000.000.000 |
| 2024  | 46.317.798.087 |
| 2025  | 46.317.798.087 |

---

## 9. Keterbatasan & Catatan Teknis

### API Publik (GENIE-BAPENDA)

| Status             | Keterangan                                                        |
| ------------------ | ----------------------------------------------------------------- |
| `h2h_bapenda.php`  | **HTTP 404** — Tidak dapat diakses dari publik                    |
| Alasan kemungkinan | Akses hanya dari internal / port berbeda / autentikasi diperlukan |
| Port alternatif    | Tersedia di port 94 dan port 96 (lihat `/link/`)                  |

### Dashboard

| Keterangan               | Detail                                          |
| ------------------------ | ----------------------------------------------- |
| Data realtime            | Hanya tersedia di `dash_02f` dan `dash_02g`     |
| Dashboard v1 (`dash_02`) | Semua nilai Rp. 0 (tidak terhubung ke database) |
| Render mode              | JavaScript-heavy (SPA) — sulit di-scrape        |

### Basis Data

| Keterangan  | Detail                                               |
| ----------- | ---------------------------------------------------- |
| Database    | Firebird (file `.GDB`) — bukan SQL server standalone |
| Akses       | Hanya dari IP internal `192.168.1.9`                 |
| Format data | Tidak ada REST API terbuka untuk query database      |
| Update data | Realtime dari internal, ditampilkan via IntraWeb DLL |

### Keamanan

- Setting.ini terbuka di URL publik — mengandung path database internal
- Tidak ada autentikasi yang terlihat pada dashboard publik
- API endpoint tidak terproteksi secara eksplisit (meski 404)

---

## 10. Rekomendasi untuk Kebutuhan Pengguna

### Untuk Mencari Data PBB Daerah Kecamatan Wates

| Sumber                                      | Keterangan                                  | Kemungkinan                                                                   |
| ------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------- |
| Dashboard (`dash_02f`/`dash_02g`)           | Realisasi per jenis pajak (total kabupaten) | Data hanya di tingkat kabupaten, belum per-kecamatan                          |
| API GENIE-BAPENDA                           | Query berdasarkan NOP                       | **Tidak bisa** — endpoint 404                                                 |
| Portal Data Blitar (`data.blitarkab.go.id`) | Data agregat per kecamatan (2019-2025)      | **Tersedia** — namun hanya data historis, bukan per-kecamatan detail per desa |
| Info2PBB (`/Info2PBB/`)                     | Cek status PBB per NOP                      | **Tersedia** — input NOP untuk cek status per wajib pajak                     |

**Kesimpulan:** Untuk data PBB kecamatan Wates, satu-satunya sumber terbuka adalah melalui:

1. **Portal Data Blitar** (`data.blitarkab.go.id`) — data agregat per kecamatan
2. **Info2PBB** — cek status per NOP individual (perlu daftar NOP kecamatan Wates)

### Untuk Mendata Laporan Desa (Bayar/Belum)

| Sumber            | Keterangan                                            |
| ----------------- | ----------------------------------------------------- |
| Info2PBB          | Hanya per-NOP, bukan per-desa atau per-kecamatan bulk |
| API GENIE-BAPENDA | Tidak tersedia dari publik                            |
| Dashboard         | Hanya total kabupaten                                 |

**Kesimpulan:** Sistem ini **tidak menyediakan export atau bulk query** untuk laporan per-desa yang membayar dan belum membayar. Data tersebut kemungkinan hanya tersedia di:

1. **Aplikasi internal SIRIDOAJA** (`/ptsl/app/`) — memerlukan login admin
2. **Database Firebird internal** (`192.168.1.9`) — hanya dari jaringan internal Bapenda

### Langkah Alternatif yang Disarankan

1. **Hubungi Bapenda langsung** — Bidang Data, Telp: 0342-801xxx
2. **Akses Portal Data** (`data.blitarkab.go.id`) untuk data terbuka
3. **Gunakan Info2PBB** untuk verifikasi status per NOP tertentu
4. **Minta akses internal** ke sistem SIRIDOAJA untuk data per-desa/per-kecamatan

---

## Lampiran: Konfigurasi Setting.ini (Lengkap)

```ini
[Database]
Location=192.168.1.9:D:\DATA MASTER DIPENDA\DISPENDAKAB.GDB
PBB=192.168.1.9:D:\DATA MASTER DIPENDA\SIMPBB.GDB
Wallpaper=D:\xampp\htdocs\Bapenda\WALLPAPER_SOURCE
Cetak=D:\xampp\htdocs\Bapenda\CETAK_Source
Cetak_H2H=D:\xampp\htdocs\Bapenda\H2H\Cetak_Source
Cetak_Out=D:\xampp\htdocs\Bapenda\CETAK
Web_View=/Bapenda
Web2Api=http://siridoaja.blitarkab.go.id/Bapenda
Unlimited Cache=ON
Header=ON
Timer=2000
Ajax=30000
Terminate=ON
HomeName=OraClient11g_home1
DirectAccess=ON
BPHTB=192.168.1.9:D:\BPHTB\SIMVERA_BPIDP.GDB
SMTR=192.168.1.9:D:\DATA MASTER DIPENDA\SPPT_SMTR.GDB
KTP=192.168.1.9:D:\DATA MASTER DIPENDA\DISPENDAKAB.GDB
BerkasWebDigital=D:\DATA_WEB\BERKAS_DIGITAL
Limitation=699
Desa=192.168.1.9:D:\DATA MASTER DIPENDA\DATABASE2DESA
Prev2Dig=D:\xampp\HTDOCS\Prev2Digital
CoServer=http://siridoaja.blitarkab.go.id
CoServer1=http://siridoaja.blitarkab.go.id
CoServer2=http://siridoaja.blitarkab.go.id
Jenis_Berkas=web
BerkasWebDigital_Co=http://siridoaja.blitarkab.go.id/Api
Copy_File=http://siridoaja.blitarkab.go.id/Api
Api_View=http://siridoaja.blitarkab.go.id/Api
BerkasWebDigital_Mst=Z:\BERKAS_DIGITAL
Port_Server=80
```

---

## Sumber Data

| No  | Sumber                    | URL                                                                                                      |
| --- | ------------------------- | -------------------------------------------------------------------------------------------------------- |
| 1   | Dashboard Live (dash_02f) | `http://siridoaja.blitarkab.go.id/dash_02f/`                                                             |
| 2   | Dashboard Live (dash_02g) | `http://siridoaja.blitarkab.go.id/dash_02g/`                                                             |
| 3   | Cek Status PBB            | `http://siridoaja.blitarkab.go.id/Info2PBB/index_Defa.php`                                               |
| 4   | API Gateway               | `http://siridoaja.blitarkab.go.id/Api/`                                                                  |
| 5   | Setting Konfigurasi       | `http://siridoaja.blitarkab.go.id/Dash_02/Dash4Det/Setting.ini`                                          |
| 6   | Directory Listing         | `http://siridoaja.blitarkab.go.id/Dash_02/Dash4Det/`                                                     |
| 7   | Portal Data Blitar        | `https://data.blitarkab.go.id/data/realisasi-pungutan-pbb-pedesaan-dan-perkotaan-per-kecamatan-g04wrlzv` |
| 8   | Portal Data Blitar        | `https://data.blitarkab.go.id/data/jumlah-objek-pajak-bumi-dan-bangunan-pbb-per-kecamatan-ln9vjp05`      |
| 9   | Portal Data Blitar        | `https://data.blitarkab.go.id/data/target-pungutan-pbb-pedesaan-dan-perkotaan-dzjxmo0w`                  |
| 10  | Portal Pembayaran         | `https://e-pada.blitarkab.go.id/portal_payment/index.php`                                                |
| 11  | Bapenda Resmi             | `https://bapenda.blitarkab.go.id/`                                                                       |

---

## 11. Hasil Eksplorasi via Playwright (MCP Browser Automation)

> Eksplorasi dilakukan pada **7 Juli 2026** menggunakan Playwright MCP untuk mengakses dan berinteraksi langsung dengan aplikasi SIRIDOAJA.

### 11.1 Aplikasi Desktop Web: Port 94

**URL Utama:** `http://siridoaja.blitarkab.go.id:94/Bapenda/app/Siridoaja_2025_VX_20.dll`

Aplikasi ini merupakan aplikasi **IntraWeb/Delphi** yang berjalan di port 94. Strukturnya:

```
/ptsl/app/  →  frameset
                 └── e2ptsl_34.dll  (login screen — butuh kredensial)

/dash_02f/Dash4Det.php  →  redirect ke port 94
                           └── /Bapenda/App/
                               └── frameset
                                   └── Siridoaja_2025_VX_20.dll (main app — PUBLIC)
```

### 11.2 Status Aplikasi Port 94

| Keterangan          | Nilai                                           |
| ------------------- | ----------------------------------------------- |
| Judul               | SISTEM INFORMASI DATA ONLINE PAJAK DAERAH       |
| Sub-judul           | BADAN PENDAPATAN DAERAH - KABUPATEN BLITAR      |
| Resolusi            | 1038 x 699                                      |
| IP Pengunjung       | 182.4.132.15                                    |
| Total Pengunjung    | 150.910                                         |
| Pengunjung Hari Ini | 11                                              |
| Last Update         | 2026.06.12.05.16.18                             |
| Copyright           | @ 2024                                          |
| Developer           | IT Team Bapenda Kabupaten Blitar                |
| Teknologi           | ExtJS 7.5.1 + uni-1.90.0.1567 (TMS Soft UniGUI) |

### 11.3 Menu yang Tersedia (Tanpa Login)

| No  | Menu                     | Akses          | Keterangan                                  |
| --- | ------------------------ | -------------- | ------------------------------------------- |
| 1   | **Home**                 | Public         | Dashboard utama dengan grafik               |
| 2   | **Status NOP PBB-P2**    | Public         | Cek status pembayaran PBB per NOP           |
| 3   | **PBB-P2**               | Public         | Rekap data per kecamatan & per desa         |
| 4   | **Pembayaran PBB-P2**    | Public         | Info pembayaran PBB                         |
| 5   | **Target dan Realisasi** | Public         | Tabel target vs realisasi semua jenis pajak |
| 6   | **Login User**           | Login Required | Area admin                                  |

### 11.3.1 Sub-Menu PBB-P2 (7 Tab)

| No  | Tab                                     | Fungsi                                     | Data yang Ditampilkan                                                 |
| --- | --------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------- |
| 1   | **PBB-P2 Kecamatan**                    | Rekap per kecamatan                        | Kode, Nama Kec, PBB, Bayar, %, Kurang Bayar, SPPT, Dibayar, Sisa SPPT |
| 2   | **PBB-P2 Kelurahan/Desa**               | Rekap per desa (filterable per kecamatan)  | Kode, Nama Kec, Kode Desa, Nama Desa, PBB, Bayar, %, dll              |
| 3   | **Realisasi Harian**                    | Realisasi per hari                         | —                                                                     |
| 4   | **Realisasi Kec.(Bulan)**               | Realisasi per kecamatan per bulan          | —                                                                     |
| 5   | **Realisasi Kel/Desa.(Bulan)**          | Realisasi per desa per bulan               | —                                                                     |
| 6   | **Realisasi per Buku Kec.(Bulan)**      | Realisasi per buku (petugas) per kecamatan | —                                                                     |
| 7   | **Realisasi per Buku Kel/Desa.(Bulan)** | Realisasi per buku per desa                | —                                                                     |

**Filter yang tersedia di tab PBB-P2:**

- Tahun Pajak (combobox)
- Tahun Pembayaran (SEMUA TAHUN / tahun tertentu)
- SEMUA / PER BUKU (radio)
- BAKU+DENDA / BAKU (radio)
- Buku 01 s.d. Buku 05 (checkbox — filter petugas pemungut)
- Urut sesuai Prosen (checkbox)
- **Tombol Excell** — export ke Excel

### 11.4 Dashboard Home (Port 94)

Dashboard menampilkan 5 panel grafik:

| No  | Panel                                              | Keterangan                            |
| --- | -------------------------------------------------- | ------------------------------------- |
| 1   | Jumlah Penerimaan PBB-P2 (Rupiah)                  | Grafik trend penerimaan PBB per bulan |
| 2   | Jumlah Penerimaan PBB-P2 (Lembar SPPT)             | Grafik jumlah SPPT yang diterbitkan   |
| 3   | Penerimaan Pajak Daerah                            | Pie chart via Calteem.com (iframe)    |
| 4   | Jumlah Penerimaan Pajak Daerah Non PBB-P2 (Rupiah) | Grafik pajak non-PBB dalam rupiah     |
| 5   | Jumlah Penerimaan Pajak Daerah Non PBB-P2 (Jumlah) | Grafik pajak non-PBB dalam jumlah     |

### 11.5 Form Cek Status Pembayaran PBB-P2

**Format NOP:** `35.05.[4 digit].[4 digit].[4 digit].[3 digit].[1 digit]`

Contoh: `35.05.0501.0001.0001.001.0`

| Field       | Keterangan                                          |
| ----------- | --------------------------------------------------- |
| NOP         | 4 input field terpisah (35.05.XXXX.XXXX.XXXX.XXX.X) |
| Tahun       | Combobox tahun (default: 2026)                      |
| Semua Tahun | Checkbox — jika dicentang, tampilkan semua tahun    |

**Tombol Aksi:**

- **Cari Data** — eksekusi pencarian
- **Refresh/Clear** — reset form
- **Cetak** — cetak SPPT

**Grid Hasil:**

| Kolom   | Keterangan                 |
| ------- | -------------------------- |
| TAHUN   | Tahun pajak                |
| TEMPO   | Batas waktu pembayaran     |
| PBB     | Pajak terhutang            |
| DENDA   | Denda keterlambatan        |
| TOTAL   | Total yang harus dibayar   |
| TANGGAL | Tanggal pembayaran         |
| STATUS  | Status (LUNAS/BELUM LUNAS) |

**Informasi Tambahan:**

- **Nama WP** — nama wajib pajak (ditampilkan setelah pencarian)
- **History Status** — riwayat status pembayaran
- **Informasi SPPT** — detail SPPT
- **Informasi Subyek Pajak** — data subjek pajak

### 11.6 Form Target dan Realisasi

**Filter:**

- **Bulan** — Combobox (JANUARI s.d. DESEMBER)
- **Tahun** — Combobox tahun
- **InMonth** — Checkbox (filter per bulan saja)
- **Target per Tri Wulan** — Checkbox (target per kuartal)

**Grid Target + Realisasi (Data Juli 2026):**

| Nama Pajak                                          | Target (Rp)        | Realisasi | %     |
| --------------------------------------------------- | ------------------ | --------- | ----- |
| PBJT HOTEL                                          | 244.800.000        | 0         | 0,00% |
| PBJT RESTORAN                                       | 6.632.400.000      | 0         | 0,00% |
| PBJT HIBURAN                                        | 2.130.000.000      | 0         | 0,00% |
| PAJAK REKLAME                                       | 827.000.000        | 0         | 0,00% |
| PBJT TENAGA LISTRIK                                 | 52.000.000.000     | 0         | 0,00% |
| PBJT PARKIR                                         | 225.000.000        | 0         | 0,00% |
| PAJAK AIR TANAH                                     | 650.000.000        | 0         | 0,00% |
| **PAJAK BUMI DAN BANGUNAN**                         | **46.317.798.087** | 0         | 0,00% |
| PAJAK MINERAL BUKAN LOGAM DAN BATUAN                | 3.000.000.000      | 0         | 0,00% |
| PAJAK BEA PEROLEHAN HAK ATAS TANAH DAN BANGUNAN     | 25.436.795.776     | 0         | 0,00% |
| **OPSEN PAJAK KENDARAAN BERMOTOR (PKB)**            | **93.160.749.600** | 0         | 0,00% |
| **OPSEN BEA BALIK NAMA KENDARAAN BERMOTOR (BBNKB)** | **26.333.562.600** | 0         | 0,00% |

> **Catatan:** Realisasi bulan Juli 2026 masih 0 karena data belum diupdate (last update: 12 Juni 2026).

**Fitur Tambahan:**

- **Excell** — tombol export data ke Excel
- **Color coding** berdasarkan persentase pencapaian:
  - 0–30% (merah)
  - 30–50% (kuning)
  - 50–80% (hijau muda)
  - 80%+ (hijau)
  - 100% (biru)
- **Triwulan indicator** — TW I, TW II, TW III, TW IV

### 11.7 Temuan Penting dari Playwright

| No  | Temuan                                                              | Dampak                                                    |
| --- | ------------------------------------------------------------------- | --------------------------------------------------------- |
| 1   | Aplikasi port 94 **publik tanpa login**                             | Siapapun bisa akses Status NOP, Target+Realisasi          |
| 2   | Aplikasi `/ptsl/app/` **butuh login**                               | Hanya admin yang bisa akses e-SPOP/PTSL                   |
| 3   | Realisasi bulan Juli 2026 = 0                                       | Data belum di-update sejak 12 Juni 2026                   |
| 4   | **PKB dan BBNKB** ada di port 94 tapi tidak di dashboard `dash_02f` | Ada 2 jenis pajak tambahan (opsen kendaraan)              |
| 5   | ExtJS framework (7.5.1) via uniGUI                                  | Aplikasi SPA, sulit di-scrape tanpa browser               |
| 6   | HandleEvent endpoint → session-based                                | Semua interaksi via POST ke HandleEvent dengan session ID |
| 7   | **Export Excel tersedia** di menu Target+Realisasi                  | Bisa download data secara bulk                            |
| 8   | Calteem.com digunakan untuk pie chart                               | Grafik pie penerimaan pajak dari layanan pihak ketiga     |

### 11.8 Endpoint API Internal (via Playwright Network Analysis)

Semua request dari aplikasi ExtJS menggunakan:

```
POST http://siridoaja.blitarkab.go.id:94/Bapenda/app/Siridoaja_2025_VX_20.dll/HandleEvent
```

**GET requests untuk load data grid:**

| Endpoint                                                                                                  | Obj ID | Fungsi                         |
| --------------------------------------------------------------------------------------------------------- | ------ | ------------------------------ |
| `GET /HandleEvent?IsEvent=1&Obj=O20A&Evt=data&_S_ID=<session>&_dc=<ts>&node=root`                         | O20A   | Sidebar menu tree              |
| `GET /HandleEvent?IsEvent=1&Obj=OC7&Evt=data&_S_ID=<session>&_dc=<ts>&options=1&page=1&start=0&limit=25`  | OC7    | Dropdown kecamatan (tree node) |
| `GET /HandleEvent?IsEvent=1&Obj=O351&Evt=data&_S_ID=<session>&_dc=<ts>&options=1&page=1&start=0&limit=25` | O351   | **PBB-P2 per Kecamatan**       |
| `GET /HandleEvent?IsEvent=1&Obj=O3AC&Evt=data&_S_ID=<session>&_dc=<ts>&options=1&page=1&start=0&limit=25` | O3AC   | **PBB-P2 per Kelurahan/Desa**  |
| `GET /HandleEvent?IsEvent=1&Obj=O561&Evt=data&_S_ID=<session>&_dc=<ts>&options=1&page=1&start=0&limit=25` | O561   | Target dan Realisasi           |

**POST requests** digunakan untuk form actions (Cari Data, Tampilkan, Export, dll).

> **Parameter:** `Obj` = ID komponen ExtJS, `Evt` = jenis event (`data`), `_S_ID` = session ID (otomatis saat load), `page/start/limit` = pagination.

**Response format:** JSON ExtJS Store

```json
{
  "metaData": {"fields": ["0","_0","1","_1","2","_2",...]},
  "results": 23,
  "rows": [
    {"id":4, "0":"050", "1":"WATES", "2":"963.692.229", "3":"508.559.532", "4":"52,77", ...}
  ]
}
```

**Mapping kolom PBB-P2 Kecamatan:**

- `0` = KODE, `1` = NAMA KECAMATAN, `2` = PBB (Target), `3` = BAYAR (Realisasi)
- `4` = %, `5` = KURANG BAYAR, `6` = SPPT, `7` = DIBAYAR, `8` = SISA SPPT

**Mapping kolom PBB-P2 Kelurahan/Desa:**

- `0` = KODE_KEC, `1` = NAMA_KEC, `2` = KODE_DESA, `3` = NAMA_DESA
- `4` = PBB, `5` = BAYAR, `6` = %, `7` = KURANG BAYAR
- `8` = SPPT, `9` = DIBAYAR, `10` = SISA SPPT

---

## 12. Ringkasan: Akses Data PBB untuk Kebutuhan Pengguna

### Skenario 1: Cek Status PBB Satu NOP

| Langkah   | URL/Metode                                                    |
| --------- | ------------------------------------------------------------- |
| Buka form | `http://siridoaja.blitarkab.go.id:94/...` → Status NOP PBB-P2 |
| Input NOP | Format: `35.05.XXXX.XXXX.XXXX.XXX.X`                          |
| Klik Cari | Data muncul di grid (TAHUN, TEMPO, PBB, DENDA, TOTAL, STATUS) |

### Skenario 2: Laporan Realisasi Pajak (Target vs Realisasi)

| Langkah             | URL/Metode                                       |
| ------------------- | ------------------------------------------------ |
| Buka form           | Port 94 → Target dan Realisasi                   |
| Pilih Bulan & Tahun | Combobox filter                                  |
| Klik Cari Data      | Tabel 12 jenis pajak dengan target, realisasi, % |
| Export              | Klik tombol **Excell**                           |

### Skenario 3: Mendata Laporan Desa (Bayar/Belum) — Per Kecamatan

**✅ TERSEDIA di situs publik** melalui menu PBB-P2 di Port 94.

| Langkah                 | URL/Metode                                        |
| ----------------------- | ------------------------------------------------- |
| Buka PBB-P2             | Port 94 → Sidebar menu "PBB-P2"                   |
| Pilih tab               | "PBB-P2 Kelurahan/Desa"                           |
| Centang checkbox "KEC." | Aktifkan filter kecamatan                         |
| Pilih kecamatan         | Combobox → pilih kecamatan tujuan                 |
| Klik TAMPILKAN          | Grid menampilkan semua desa di kecamatan tersebut |

**Grid Kelurahan/Desa:**

| Kolom        | Keterangan                     |
| ------------ | ------------------------------ |
| KODE_KEC     | Kode kecamatan (3 digit)       |
| NAMA_KEC     | Nama kecamatan                 |
| KODE_DESA    | Kode desa (3 digit)            |
| NAMA_DESA    | Nama desa/kelurahan            |
| PBB          | Target pajak desa              |
| BAYAR        | Realisasi pembayaran           |
| %            | Persentase pencapaian          |
| KURANG BAYAR | Selisih target - realisasi     |
| SPPT         | Total SPPT diterbitkan         |
| DIBAYAR      | Jumlah SPPT yang sudah dibayar |
| SISA SPPT    | SPPT yang belum dibayar        |

**Export:** Klik tombol **Excell** untuk download data seluruh desa di kecamatan.

### Skenario 4: Data PBB Kecamatan Wates (Tahun 2026)

| Sumber                          | Ketersediaan                                |
| ------------------------------- | ------------------------------------------- |
| Port 94 → PBB-P2 Kecamatan      | ✅ Data semua kecamatan se-Kabupaten Blitar |
| Port 94 → PBB-P2 Kelurahan/Desa | ✅ Data per desa di kecamatan Wates         |
| Portal Data Blitar              | ✅ Data agregat per kecamatan (2019–2025)   |
| Info2PBB                        | ✅ Cek per NOP individual                   |

### Data Kecamatan Wates (Kode 050)

| Field             | Nilai          |
| ----------------- | -------------- |
| PBB (Target)      | Rp 963.692.229 |
| Bayar (Realisasi) | Rp 508.559.532 |
| Persentase        | 52,77%         |
| Kurang Bayar      | Rp 455.132.697 |
| Total SPPT        | 21.024         |
| SPPT Dibayar      | 11.410         |
| Sisa SPPT         | 9.614          |

### Data per Desa — Kecamatan Wates

| Kode | Nama Desa  | PBB (Rp)        | Bayar (Rp)      | %           | Kurang (Rp)     | SPPT       | Dibayar    | Sisa      |
| ---- | ---------- | --------------- | --------------- | ----------- | --------------- | ---------- | ---------- | --------- |
| 001  | RINGINREJO | 141.118.811     | 57.774.263      | 40,94%      | 83.344.548      | 2.714      | 1.124      | 1.590     |
| 002  | SUKOREJO   | 95.334.698      | 14.956.682      | 15,69%      | 80.378.016      | 2.312      | 330        | 1.982     |
| 003  | TUGUREJO   | 149.835.887     | 142.476.751     | 95,09%      | 7.359.136       | 3.607      | 3.414      | 193       |
| 004  | WATES      | 175.104.245     | 75.547.662      | 43,14%      | 99.556.583      | 3.332      | 1.558      | 1.774     |
| 005  | TULUNGREJO | 149.186.364     | 40.230.704      | 26,97%      | 108.955.660     | 2.898      | 828        | 2.070     |
| 006  | PURWOREJO  | 81.555.144      | 30.909.029      | 37,90%      | 50.646.115      | 2.511      | 1.021      | 1.490     |
| 007  | SUMBERARUM | 53.852.809      | 53.852.809      | **100,00%** | 0               | 983        | 983        | **0**     |
| 008  | MOJOREJO   | 117.704.271     | 92.811.632      | 78,85%      | 24.892.639      | 2.667      | 2.152      | 515       |
|      | **TOTAL**  | **963.692.229** | **508.559.532** | **52,77%**  | **455.132.697** | **21.024** | **11.410** | **9.614** |

**Ranking Realisasi per Desa:**

| Peringkat | Desa       | %       | Status           |
| --------- | ---------- | ------- | ---------------- |
| 1         | SUMBERARUM | 100,00% | LUNAS SEMUA      |
| 2         | TUGUREJO   | 95,09%  | Hampir lunas     |
| 3         | MOJOREJO   | 78,85%  | Progress bagus   |
| 4         | WATES      | 43,14%  | Perlu percepatan |
| 5         | RINGINREJO | 40,94%  | Perlu percepatan |
| 6         | PURWOREJO  | 37,90%  | Perlu percepatan |
| 7         | TULUNGREJO | 26,97%  | Rendah           |
| 8         | SUKOREJO   | 15,69%  | Sangat rendah    |

---

_Dokumen ini disusun berdasarkan verifikasi langsung terhadap website siridoaja.blitarkab.go.id dan sumber data terkait. Eksplorasi Playwright dilakukan pada 7 Juli 2026. Data dashboard adalah data live. Aplikasi port 94 dapat diakses publik tanpa login untuk fitur Status NOP, Target+Realisasi, dan Dashboard._
