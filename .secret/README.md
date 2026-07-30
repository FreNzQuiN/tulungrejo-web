# `.secret/` — Data Sensitif / Internal

Direktori ini berisi file yang tidak layak masuk version control publik. Sebagian dirujuk oleh seeder dan script pengujian.

## Isi yang Diharapkan

| File                                    | Dipakai Oleh                                       | Keterangan                                  |
| --------------------------------------- | -------------------------------------------------- | ------------------------------------------- |
| `organigram.webp`                       | `prisma/seed.ts`                                   | Struktur organisasi desa — gambar           |
| `ENTRY SPOP LSPOP DESA TULUNGREJO.xlsx` | `scripts/test-import.ts`, `scripts/test-parser.py` | Data SPOP/LSPOP PBB dari Bapenda            |
| `PBB-P2 KELURAHAN-WATES.xlsx`           | `scripts/test-import.ts`, `scripts/test-parser.py` | Data PBB-P2 dari Bapenda                    |
| `Desa Tulungrejo Blok {xxx}{x}.webp`    | `prisma/seed.ts`                                   | Peta blok per sub-blok (13 blok, sub a/b/c) |

## Catatan

- File `.xlsx` dan `.pdf` tidak dilacak git — hanya disimpan lokal.
- Template `.webp` bisa dihasilkan dari PDF masing-masing blok.
- Jika file tidak tersedia, seeder akan fallback ke placeholder SVG.
