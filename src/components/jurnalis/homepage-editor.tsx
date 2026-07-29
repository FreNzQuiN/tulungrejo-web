"use client";

import { useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { Save, X, ImageUp, TrashIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCmsEditor } from "@/hooks/use-cms-editor";
import { resizeImage } from "@/lib/client-utils";
import { MAX_IMAGE_SIZE } from "@/lib/constants";
import type { HomepageContent } from "@/lib/types";

function HomepageEditorSkeleton() {
  return (
    <div className="cms-content-card">
      <div className="cms-section-header">
        <Skeleton className="h-6 w-40" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="form-group">
          <Skeleton className="mb-1 h-4 w-32" />
          <Skeleton className="h-10 w-full rounded" />
        </div>
      ))}
      <div className="form-group">
        <Skeleton className="mb-1 h-4 w-24" />
        <Skeleton className="h-24 w-full rounded" />
      </div>
      <div className="cms-action-btn-row">
        <Skeleton className="h-9 w-20 rounded" />
        <Skeleton className="h-9 w-28 rounded" />
      </div>
    </div>
  );
}

export function HomepageEditor({
  onDirtyChange,
}: { onDirtyChange?: (dirty: boolean) => void } = {}) {
  const editor = useCmsEditor<HomepageContent>(
    "/api/homepage",
    {
      heroTitle: "",
      heroSubtitle: "",
      heroDescription: "",
      heroImage: null,
      aboutTitle: "",
      aboutParagraphs: [],
      googleMapsUrl: "",
    },
    "Gagal memuat konten halaman depan",
    undefined,
    onDirtyChange,
  );

  const paragraphsText = editor.data.aboutParagraphs.join("\n");

  function setParagraphs(text: string) {
    const arr = text
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    editor.setData((p) => ({ ...p, aboutParagraphs: arr }));
  }

  async function handleSave() {
    if (!editor.data.heroTitle) {
      toast.error("Judul hero harus diisi");
      return;
    }

    if (
      editor.data.googleMapsUrl &&
      !editor.data.googleMapsUrl.startsWith("https://www.google.com/maps/embed")
    ) {
      toast.error(
        "URL Google Maps tidak valid. Gunakan embed URL dari Google Maps",
      );
      return;
    }

    await editor.save(
      editor.data,
      "Konten halaman depan berhasil diperbarui",
      "Gagal memperbarui konten halaman depan",
    );
  }

  const [heroImageUploading, setHeroImageUploading] = useState(false);

  async function handleHeroImagePick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Ukuran gambar maksimal 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Hanya file gambar yang diperbolehkan");
      return;
    }

    setHeroImageUploading(true);
    try {
      const dataUri = await resizeImage(file);
      editor.setData((p) => ({ ...p, heroImage: dataUri }));
    } catch (e) {
      console.error(e);
      toast.error("Gagal memproses gambar");
    } finally {
      setHeroImageUploading(false);
    }
  }

  function handleRemoveHeroImage() {
    editor.setData((p) => ({ ...p, heroImage: null }));
  }

  if (editor.loading) {
    return <HomepageEditorSkeleton />;
  }

  return (
    <div className="cms-content-card">
      <div className="cms-section-header">
        <h3>Kelola Halaman Depan</h3>
      </div>

      <p className="admin-desc-box">
        Ubah teks hero, bagian tentang desa, dan embed Google Maps yang tampil
        di halaman utama website.
      </p>

      <div className="form-group">
        <label>Subjudul Hero</label>
        <input
          className="form-input"
          value={editor.data.heroSubtitle}
          onChange={(e) =>
            editor.setData((p) => ({ ...p, heroSubtitle: e.target.value }))
          }
          placeholder="Portal Resmi Pemerintah Desa"
        />
      </div>

      <div className="form-group">
        <label>Judul Hero</label>
        <input
          className="form-input"
          value={editor.data.heroTitle}
          onChange={(e) =>
            editor.setData((p) => ({ ...p, heroTitle: e.target.value }))
          }
          placeholder="Selamat Datang di Desa Tulungrejo"
        />
      </div>

      <div className="form-group">
        <label>Deskripsi Hero</label>
        <textarea
          className="form-textarea"
          value={editor.data.heroDescription}
          onChange={(e) =>
            editor.setData((p) => ({ ...p, heroDescription: e.target.value }))
          }
          rows={3}
          placeholder="Pusat informasi dan kegiatan kemasyarakatan..."
        />
      </div>

      <div className="form-group">
        <label>Gambar Hero</label>
        <div className="flex gap-3 items-start">
          <label
            className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              heroImageUploading
                ? "opacity-50 pointer-events-none border-muted bg-muted text-muted-foreground"
                : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <ImageUp size={16} />
            {heroImageUploading ? "Memproses..." : "Pilih Gambar"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleHeroImagePick}
              disabled={heroImageUploading}
            />
          </label>
          {editor.data.heroImage && (
            <button
              type="button"
              onClick={handleRemoveHeroImage}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              <TrashIcon size={14} />
              Hapus
            </button>
          )}
        </div>
        {editor.data.heroImage ? (
          <div className="mt-3 relative w-full max-w-[600px] rounded-lg overflow-hidden border">
            <Image
              src={editor.data.heroImage}
              alt="Gambar Hero"
              width={600}
              height={400}
              className="w-full h-auto object-contain"
              unoptimized
            />
          </div>
        ) : (
          <p className="text-[12px] text-muted-foreground mt-1.5">
            Format: JPG, PNG, WebP. Maks 5MB. Akan diresize otomatis ke 1920px.
            Kosongkan untuk menggunakan gambar default.
          </p>
        )}
      </div>

      <div className="form-group">
        <label>Judul Bagian About</label>
        <input
          className="form-input"
          value={editor.data.aboutTitle}
          onChange={(e) =>
            editor.setData((p) => ({ ...p, aboutTitle: e.target.value }))
          }
          placeholder="Mengenal Desa Tulungrejo"
        />
      </div>

      <div className="form-group">
        <label>Paragraf About (satu baris per paragraf)</label>
        <textarea
          className="form-textarea"
          value={paragraphsText}
          onChange={(e) => setParagraphs(e.target.value)}
          rows={6}
          placeholder="Teks paragraf tentang desa, satu paragraf per baris"
        />
      </div>

      <div className="form-group">
        <label>Google Maps Embed URL</label>
        <input
          className="form-input"
          value={editor.data.googleMapsUrl}
          onChange={(e) =>
            editor.setData((p) => ({ ...p, googleMapsUrl: e.target.value }))
          }
          placeholder="https://www.google.com/maps/embed?pb=..."
        />
        <p className="text-[12px] text-muted-foreground mt-1.5">
          URL embed dari Google Maps. Klik “Bagikan” → “Sematkan peta” di Google
          Maps untuk mendapatkannya.
        </p>
      </div>

      <div className="cms-action-btn-row">
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.cancel()}
          disabled={!editor.hasChanges}
        >
          <X size={16} />
          Batal
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={editor.saving || !editor.hasChanges}
        >
          <Save size={16} />
          {editor.saving ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </div>
  );
}
