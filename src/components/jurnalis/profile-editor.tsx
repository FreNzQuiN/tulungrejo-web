"use client";

import { toast } from "sonner";
import { Save, X } from "lucide-react";
import type { VillageProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCmsEditor } from "@/hooks/use-cms-editor";

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

function villageProfileToForm(data: VillageProfile): ProfileForm {
  const strukturStr = (data.strukturOrganisasi || [])
    .map((m: { role: string; name: string }) => `${m.role}: ${m.name}`)
    .join("\n");
  const tugasFungsiStr = (data.tugasFungsi || [])
    .map((t: { jabatan: string; tugas: string }) => `${t.jabatan}: ${t.tugas}`)
    .join("\n");

  return {
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
      mataPencaharianUtama: data.administratif?.mataPencaharianUtama || "",
      saranaPendidikan: data.administratif?.saranaPendidikan || "",
      saranaKesehatan: data.administratif?.saranaKesehatan || "",
    },
  };
}

function ProfileEditorSkeleton() {
  return (
    <div className="cms-content-card">
      <div className="cms-section-header">
        <Skeleton className="h-6 w-36" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="form-group">
          <Skeleton className="mb-1 h-4 w-32" />
          <Skeleton className="h-20 w-full rounded" />
        </div>
      ))}
      <Skeleton className="mb-3 mt-6 h-4 w-40" />
      <div className="cms-grid-inputs-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="form-group">
            <Skeleton className="mb-1 h-4 w-28" />
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

export function ProfileEditor() {
  const editor = useCmsEditor(
    "/api/profile",
    {
      visi: "",
      misi: "",
      strukturOrganisasi: "",
      tugasFungsi: "",
      administratif: EMPTY_ADMIN,
    },
    "Gagal memuat profil desa",
    (raw) => villageProfileToForm(raw as VillageProfile),
  );

  async function handleSave() {
    if (!editor.data.visi) {
      toast.error("Visi harus diisi");
      return;
    }

    const misiArray = editor.data.misi
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const strukturArray = editor.data.strukturOrganisasi
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

    const tugasFungsiArray = editor.data.tugasFungsi
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

    await editor.save(
      {
        visi: editor.data.visi,
        misi: misiArray,
        strukturOrganisasi: strukturArray,
        tugasFungsi: tugasFungsiArray,
        administratif: editor.data.administratif,
      },
      "Profil desa berhasil diperbarui",
      "Gagal memperbarui profil desa",
    );
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

  if (editor.loading) {
    return <ProfileEditorSkeleton />;
  }

  return (
    <div className="cms-content-card">
      <div className="cms-section-header">
        <h3>Kelola Profil Desa</h3>
      </div>

      <div className="form-group">
        <label>Visi</label>
        <textarea
          className="form-textarea"
          value={editor.data.visi}
          onChange={(e) =>
            editor.setData((p) => ({ ...p, visi: e.target.value }))
          }
          rows={3}
          placeholder="Masukkan visi desa"
        />
      </div>

      <div className="form-group">
        <label>Misi (satu baris per misi)</label>
        <textarea
          className="form-textarea"
          value={editor.data.misi}
          onChange={(e) =>
            editor.setData((p) => ({ ...p, misi: e.target.value }))
          }
          rows={5}
          placeholder="Masukkan misi desa, satu per baris"
        />
      </div>

      <div className="form-group">
        <label>Struktur Organisasi (satu baris per jabatan: nama)</label>
        <textarea
          className="form-textarea"
          value={editor.data.strukturOrganisasi}
          onChange={(e) =>
            editor.setData((p) => ({
              ...p,
              strukturOrganisasi: e.target.value,
            }))
          }
          rows={4}
          placeholder="Kepala Desa: Ir. H. Sulaiman Basri"
        />
      </div>

      <div className="form-group">
        <label>
          Tugas dan Fungsi (satu baris per jabatan: deskripsi tugas)
        </label>
        <textarea
          className="form-textarea"
          value={editor.data.tugasFungsi}
          onChange={(e) =>
            editor.setData((p) => ({ ...p, tugasFungsi: e.target.value }))
          }
          rows={4}
          placeholder="Kepala Desa: Menyelenggarakan Pemerintahan Desa..."
        />
      </div>

      <label className="block font-semibold text-sm mb-3 text-dark-brown">
        Data Administratif
      </label>
      <div className="cms-grid-inputs-2">
        {ADMIN_FIELDS.map((field) => (
          <div className="form-group" key={field.key}>
            <label>{field.label}</label>
            <input
              className="form-input"
              value={editor.data.administratif[field.key]}
              onChange={(e) =>
                editor.setData((p) => ({
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
