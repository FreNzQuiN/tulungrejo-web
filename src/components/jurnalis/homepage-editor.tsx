"use client";

import { toast } from "sonner";
import { Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCmsEditor } from "@/hooks/use-cms-editor";
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
