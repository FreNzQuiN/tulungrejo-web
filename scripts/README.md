# Scripts

Utility scripts untuk development dan testing.

## `seed-100-articles.ts`

Generate 100 artikel dummy dengan konten realistis (bahasa Indonesia, topik desa) langsung ke database. Dipakai untuk populate data demo atau load testing.

```bash
npx tsx scripts/seed-100-articles.ts
```

Requires: `DATABASE_URL` di `.env`.

## `test-import.ts`

Test pipeline import Excel PBB — mengimpor file SPOP/LSPOP dan PBB-P2 dari `.secret/` ke database, lalu mencetak ringkasan hasil.

```bash
npx tsx scripts/test-import.ts
```

Requires: File Excel di `.secret/`, `DATABASE_URL` di `.env`.

## `test-parser.py`

Parser test mandiri (tanpa DB) — membaca file Excel PBB, memvalidasi data, mendeteksi duplikat, mencetak statistik. Untuk debugging format file sebelum import.

```bash
pip install openpyxl
python scripts/test-parser.py
```

Requires: File Excel di `.secret/`, Python 3, `openpyxl`.
