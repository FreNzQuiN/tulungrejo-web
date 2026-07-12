"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Save, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StatsData {
  jumlahKK: number;
  jumlahPenduduk: number;
  lakiLaki: number;
  perempuan: number;
}

export function StatsEditor() {
  const [data, setData] = useState<StatsData>({
    jumlahKK: 0,
    jumlahPenduduk: 0,
    lakiLaki: 0,
    perempuan: 0,
  });
  const [original, setOriginal] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data: StatsData) => {
        setData(data);
        setOriginal(data);
      })
      .catch(() => toast.error("Gagal memuat statistik"))
      .finally(() => setLoading(false));
  }, []);

  function hasChanges(): boolean {
    if (!original) return false;
    return (
      data.jumlahKK !== original.jumlahKK ||
      data.jumlahPenduduk !== original.jumlahPenduduk ||
      data.lakiLaki !== original.lakiLaki ||
      data.perempuan !== original.perempuan
    );
  }

  const populationMismatch =
    data.lakiLaki + data.perempuan !== data.jumlahPenduduk;

  async function handleSave() {
    if (populationMismatch) {
      toast.warning(
        "Jumlah laki-laki + perempuan tidak sama dengan total penduduk",
        { duration: 5000 },
      );
    }

    setSaving(true);
    try {
      const res = await fetch("/api/stats", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const updated = await res.json();
        setData(updated);
        setOriginal(updated);
        toast.success("Statistik berhasil diperbarui");
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal memperbarui statistik");
      }
    } catch {
      toast.error("Gagal memperbarui statistik");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (original) setData(original);
  }

  if (loading) {
    return (
      <div className="cms-content-card">
        <p className="text-muted">Memuat...</p>
      </div>
    );
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
          className="flex items-center gap-2 px-4 py-3 mb-5 text-[13px] font-semibold"
          style={{
            backgroundColor: "var(--color-danger-bg)",
            color: "var(--color-danger)",
            borderRadius: "var(--radius-sm)",
          }}
        >
          <AlertTriangle size={16} />
          Jumlah laki-laki + perempuan tidak sama dengan total penduduk
        </div>
      )}

      <div className="cms-grid-inputs-2">
        <div className="form-group">
          <label>Jumlah KK</label>
          <input
            className="form-input"
            type="number"
            min={0}
            value={data.jumlahKK}
            onChange={(e) =>
              setData((p) => ({ ...p, jumlahKK: Number(e.target.value) }))
            }
          />
        </div>
        <div className="form-group">
          <label>Jumlah Penduduk</label>
          <input
            className="form-input"
            type="number"
            min={0}
            value={data.jumlahPenduduk}
            onChange={(e) =>
              setData((p) => ({ ...p, jumlahPenduduk: Number(e.target.value) }))
            }
          />
        </div>
        <div className="form-group">
          <label>Laki-laki</label>
          <input
            className="form-input"
            type="number"
            min={0}
            value={data.lakiLaki}
            onChange={(e) =>
              setData((p) => ({ ...p, lakiLaki: Number(e.target.value) }))
            }
          />
        </div>
        <div className="form-group">
          <label>Perempuan</label>
          <input
            className="form-input"
            type="number"
            min={0}
            value={data.perempuan}
            onChange={(e) =>
              setData((p) => ({ ...p, perempuan: Number(e.target.value) }))
            }
          />
        </div>
      </div>

      <div className="cms-action-btn-row">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          disabled={!hasChanges()}
        >
          <X size={16} />
          Batal
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving || !hasChanges()}
        >
          <Save size={16} />
          {saving ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </div>
  );
}
