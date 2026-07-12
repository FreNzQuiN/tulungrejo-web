"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Save, X } from "lucide-react";
import type { VillageProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface ProfileForm {
  visi: string;
  misi: string;
  strukturOrganisasi: string;
  tugasFungsi: string;
  administratif: {
    koordinat: string;
    batasUtara: string;
    batasSelatan: string;
    batasTimur: string;
    batasBarat: string;
    luasWilayah: string;
    mataPencaharianUtama: string;
    saranaPendidikan: string;
    saranaKesehatan: string;
  };
}

const EMPTY_ADMIN = {
  koordinat: "",
  batasUtara: "",
  batasSelatan: "",
  batasTimur: "",
  batasBarat: "",
  luasWilayah: "",
  mataPencaharianUtama: "",
  saranaPendidikan: "",
  saranaKesehatan: "",
};

export function ProfileEditor() {
  const [form, setForm] = useState<ProfileForm>({
    visi: "",
    misi: "",
    strukturOrganisasi: "",
    tugasFungsi: "",
    administratif: EMPTY_ADMIN,
  });
  const [original, setOriginal] = useState<ProfileForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data: VillageProfile) => {
        const strukturStr = (data.strukturOrganisasi || [])
          .map((m: { role: string; name: string }) => `${m.role}: ${m.name}`)
          .join("\n");
        const tugasFungsiStr = (data.tugasFungsi || [])
          .map(
            (t: { jabatan: string; tugas: string }) =>
              `${t.jabatan}: ${t.tugas}`,
          )
          .join("\n");

        setForm({
          visi: data.visi || "",
          misi: (data.misi || []).join("\n"),
          strukturOrganisasi: strukturStr,
          tugasFungsi: tugasFungsiStr,
          administratif: {
            koordinat: data.administratif?.koordinat || "",
            batasUtara: data.administratif?.batasUtara || "",
            batasSelatan: data.administratif?.batasSelatan || "",
            batasTimur: data.administratif?.batasTimur || "",
            batasBarat: data.administratif?.batasBarat || "",
            luasWilayah: data.administratif?.luasWilayah || "",
            mataPencaharianUtama:
              data.administratif?.mataPencaharianUtama || "",
            saranaPendidikan: data.administratif?.saranaPendidikan || "",
            saranaKesehatan: data.administratif?.saranaKesehatan || "",
          },
        });
        setOriginal({
          visi: data.visi || "",
          misi: (data.misi || []).join("\n"),
          strukturOrganisasi: strukturStr,
          tugasFungsi: tugasFungsiStr,
          administratif: {
            koordinat: data.administratif?.koordinat || "",
            batasUtara: data.administratif?.batasUtara || "",
            batasSelatan: data.administratif?.batasSelatan || "",
            batasTimur: data.administratif?.batasTimur || "",
            batasBarat: data.administratif?.batasBarat || "",
            luasWilayah: data.administratif?.luasWilayah || "",
            mataPencaharianUtama:
              data.administratif?.mataPencaharianUtama || "",
            saranaPendidikan: data.administratif?.saranaPendidikan || "",
            saranaKesehatan: data.administratif?.saranaKesehatan || "",
          },
        });
      })
      .catch(() => toast.error("Gagal memuat profil desa"))
      .finally(() => setLoading(false));
  }, []);

  function hasChanges(): boolean {
    if (!original) return false;
    return (
      form.visi !== original.visi ||
      form.misi !== original.misi ||
      form.strukturOrganisasi !== original.strukturOrganisasi ||
      form.tugasFungsi !== original.tugasFungsi ||
      JSON.stringify(form.administratif) !==
        JSON.stringify(original.administratif)
    );
  }

  async function handleSave() {
    if (!form.visi) {
      toast.error("Visi harus diisi");
      return;
    }

    setSaving(true);
    try {
      const misiArray = form.misi
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const strukturArray = form.strukturOrganisasi
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((line) => {
          const colonIdx = line.indexOf(":");
          return colonIdx > 0
            ? {
                role: line.slice(0, colonIdx).trim(),
                name: line.slice(colonIdx + 1).trim(),
              }
            : { role: line, name: "" };
        });

      const tugasFungsiArray = form.tugasFungsi
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((line) => {
          const colonIdx = line.indexOf(":");
          return colonIdx > 0
            ? {
                jabatan: line.slice(0, colonIdx).trim(),
                tugas: line.slice(colonIdx + 1).trim(),
              }
            : { jabatan: line, tugas: "" };
        });

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visi: form.visi,
          misi: misiArray,
          strukturOrganisasi: strukturArray,
          tugasFungsi: tugasFungsiArray,
          administratif: form.administratif,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        const updatedStrukturStr = (updated.strukturOrganisasi || [])
          .map((m: { role: string; name: string }) => `${m.role}: ${m.name}`)
          .join("\n");
        const updatedTugasFungsiStr = (updated.tugasFungsi || [])
          .map(
            (t: { jabatan: string; tugas: string }) =>
              `${t.jabatan}: ${t.tugas}`,
          )
          .join("\n");

        setForm({
          visi: updated.visi || "",
          misi: (updated.misi || []).join("\n"),
          strukturOrganisasi: updatedStrukturStr,
          tugasFungsi: updatedTugasFungsiStr,
          administratif: {
            koordinat: updated.administratif?.koordinat || "",
            batasUtara: updated.administratif?.batasUtara || "",
            batasSelatan: updated.administratif?.batasSelatan || "",
            batasTimur: updated.administratif?.batasTimur || "",
            batasBarat: updated.administratif?.batasBarat || "",
            luasWilayah: updated.administratif?.luasWilayah || "",
            mataPencaharianUtama:
              updated.administratif?.mataPencaharianUtama || "",
            saranaPendidikan: updated.administratif?.saranaPendidikan || "",
            saranaKesehatan: updated.administratif?.saranaKesehatan || "",
          },
        });
        setOriginal({
          visi: updated.visi || "",
          misi: (updated.misi || []).join("\n"),
          strukturOrganisasi: updatedStrukturStr,
          tugasFungsi: updatedTugasFungsiStr,
          administratif: {
            koordinat: updated.administratif?.koordinat || "",
            batasUtara: updated.administratif?.batasUtara || "",
            batasSelatan: updated.administratif?.batasSelatan || "",
            batasTimur: updated.administratif?.batasTimur || "",
            batasBarat: updated.administratif?.batasBarat || "",
            luasWilayah: updated.administratif?.luasWilayah || "",
            mataPencaharianUtama:
              updated.administratif?.mataPencaharianUtama || "",
            saranaPendidikan: updated.administratif?.saranaPendidikan || "",
            saranaKesehatan: updated.administratif?.saranaKesehatan || "",
          },
        });
        toast.success("Profil desa berhasil diperbarui");
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal memperbarui profil desa");
      }
    } catch {
      toast.error("Gagal memperbarui profil desa");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (original) setForm(original);
  }

  const ADMIN_FIELDS: {
    key: keyof ProfileForm["administratif"];
    label: string;
  }[] = [
    { key: "koordinat", label: "Koordinat" },
    { key: "batasUtara", label: "Batas Utara" },
    { key: "batasSelatan", label: "Batas Selatan" },
    { key: "batasTimur", label: "Batas Timur" },
    { key: "batasBarat", label: "Batas Barat" },
    { key: "luasWilayah", label: "Luas Wilayah" },
    { key: "mataPencaharianUtama", label: "Mata Pencaharian Utama" },
    { key: "saranaPendidikan", label: "Sarana Pendidikan" },
    { key: "saranaKesehatan", label: "Sarana Kesehatan" },
  ];

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
        <h3>Kelola Profil Desa</h3>
      </div>

      {/* Visi */}
      <div className="form-group">
        <label>Visi</label>
        <textarea
          className="form-textarea"
          value={form.visi}
          onChange={(e) => setForm((p) => ({ ...p, visi: e.target.value }))}
          rows={3}
          placeholder="Masukkan visi desa"
        />
      </div>

      {/* Misi */}
      <div className="form-group">
        <label>Misi (satu baris per misi)</label>
        <textarea
          className="form-textarea"
          value={form.misi}
          onChange={(e) => setForm((p) => ({ ...p, misi: e.target.value }))}
          rows={5}
          placeholder="Masukkan misi desa, satu per baris"
        />
      </div>

      {/* Struktur Organisasi - editable */}
      <div className="form-group">
        <label>Struktur Organisasi (satu baris per jabatan: nama)</label>
        <textarea
          className="form-textarea"
          value={form.strukturOrganisasi}
          onChange={(e) =>
            setForm((p) => ({ ...p, strukturOrganisasi: e.target.value }))
          }
          rows={4}
          placeholder="Kepala Desa: Ir. H. Sulaiman Basri"
        />
      </div>

      {/* Tugas Fungsi - editable */}
      <div className="form-group">
        <label>
          Tugas dan Fungsi (satu baris per jabatan: deskripsi tugas)
        </label>
        <textarea
          className="form-textarea"
          value={form.tugasFungsi}
          onChange={(e) =>
            setForm((p) => ({ ...p, tugasFungsi: e.target.value }))
          }
          rows={4}
          placeholder="Kepala Desa: Menyelenggarakan Pemerintahan Desa..."
        />
      </div>

      {/* Administratif */}
      <label className="block font-semibold text-sm mb-3 text-dark-brown">
        Data Administratif
      </label>
      <div className="cms-grid-inputs-2">
        {ADMIN_FIELDS.map((field) => (
          <div className="form-group" key={field.key}>
            <label>{field.label}</label>
            <input
              className="form-input"
              value={form.administratif[field.key]}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  administratif: {
                    ...p.administratif,
                    [field.key]: e.target.value,
                  },
                }))
              }
            />
          </div>
        ))}
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
