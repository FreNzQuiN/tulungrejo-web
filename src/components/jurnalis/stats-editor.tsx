"use client";

import { toast } from "sonner";
import { Save, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCmsEditor } from "@/hooks/use-cms-editor";

interface StatsData {
  jumlahKK: number;
  jumlahPenduduk: number;
  lakiLaki: number;
  perempuan: number;
}

function safeNumber(v: string): number {
  if (v === "") return 0;
  return Number(v);
}

function StatsEditorSkeleton() {
  return (
    <div className="cms-content-card">
      <div className="cms-section-header">
        <Skeleton className="h-6 w-36" />
      </div>
      <Skeleton className="mb-6 h-12 w-full rounded" />
      <div className="cms-grid-inputs-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="form-group">
            <Skeleton className="mb-1 h-4 w-24" />
            <Skeleton className="h-10 w-full rounded" />
          </div>
        ))}
      </div>
      <div className="cms-action-btn-row">
        <Skeleton className="h-9 w-20 rounded" />
        <Skeleton className="h-9 w-28 rounded" />
      </div>
    </div>
  );
}

export function StatsEditor({
  onDirtyChange,
}: { onDirtyChange?: (dirty: boolean) => void } = {}) {
  const editor = useCmsEditor(
    "/api/stats",
    { jumlahKK: 0, jumlahPenduduk: 0, lakiLaki: 0, perempuan: 0 },
    "Gagal memuat statistik",
    undefined,
    onDirtyChange,
  );

  const populationMismatch =
    editor.data.lakiLaki + editor.data.perempuan !== editor.data.jumlahPenduduk;

  async function handleSave() {
    if (populationMismatch) {
      toast.warning(
        "Jumlah laki-laki + perempuan tidak sama dengan total penduduk",
        { duration: 5000 },
      );
    }

    await editor.save(
      editor.data,
      "Statistik berhasil diperbarui",
      "Gagal memperbarui statistik",
    );
  }

  if (editor.loading) {
    return <StatsEditorSkeleton />;
  }

  return (
    <div className="cms-content-card">
      <div className="cms-section-header">
        <h3>Kelola Statistik</h3>
      </div>

      <p className="admin-desc-box">
        Perbarui data statistik kependudukan Desa Tulungrejo.
      </p>

      {populationMismatch && (
        <div
          role="alert"
          className="flex items-center gap-2 px-4 py-3 mb-5 text-[13px] font-semibold"
          style={{
            backgroundColor: "var(--color-danger-bg)",
            color: "var(--color-danger)",
            borderRadius: "var(--radius-sm)",
          }}
        >
          <AlertTriangle size={16} aria-hidden="true" />
          Jumlah laki-laki + perempuan tidak sama dengan total penduduk
        </div>
      )}

      <div className="cms-grid-inputs-2">
        <div className="form-group">
          <label htmlFor="stats-jumlahKK">Jumlah KK</label>
          <input
            id="stats-jumlahKK"
            className="form-input"
            type="number"
            min={0}
            value={editor.data.jumlahKK}
            onChange={(e) =>
              editor.setData((p) => ({
                ...p,
                jumlahKK: safeNumber(e.target.value),
              }))
            }
            aria-label="Jumlah KK"
          />
        </div>
        <div className="form-group">
          <label htmlFor="stats-jumlahPenduduk">Jumlah Penduduk</label>
          <input
            id="stats-jumlahPenduduk"
            className="form-input"
            type="number"
            min={0}
            value={editor.data.jumlahPenduduk}
            onChange={(e) =>
              editor.setData((p) => ({
                ...p,
                jumlahPenduduk: safeNumber(e.target.value),
              }))
            }
            aria-label="Jumlah Penduduk"
          />
        </div>
        <div className="form-group">
          <label htmlFor="stats-lakiLaki">Laki-laki</label>
          <input
            id="stats-lakiLaki"
            className="form-input"
            type="number"
            min={0}
            value={editor.data.lakiLaki}
            onChange={(e) =>
              editor.setData((p) => ({
                ...p,
                lakiLaki: safeNumber(e.target.value),
              }))
            }
            aria-label="Laki-laki"
          />
        </div>
        <div className="form-group">
          <label htmlFor="stats-perempuan">Perempuan</label>
          <input
            id="stats-perempuan"
            className="form-input"
            type="number"
            min={0}
            value={editor.data.perempuan}
            onChange={(e) =>
              editor.setData((p) => ({
                ...p,
                perempuan: safeNumber(e.target.value),
              }))
            }
            aria-label="Perempuan"
          />
        </div>
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
