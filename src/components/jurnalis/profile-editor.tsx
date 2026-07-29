"use client";

import { useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import {
  Save,
  X,
  Plus,
  ImageUp,
  Trash2,
  Trash as TrashIcon,
} from "lucide-react";
import Image from "next/image";
import type { VillageProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCmsEditor } from "@/hooks/use-cms-editor";
import { resizeImage } from "@/lib/client-utils";
import { MAX_IMAGE_SIZE } from "@/lib/constants";

interface ProfileForm {
  visi: string;
  misi: string;
  strukturOrganisasi: { role: string; name: string }[];
  strukturOrganisasiImage: string | null;
  tugasFungsi: { jabatan: string; tugas: string }[];
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
  return {
    visi: data.visi || "",
    misi: (data.misi || []).join("\n"),
    strukturOrganisasi: data.strukturOrganisasi || [],
    strukturOrganisasiImage: data.strukturOrganisasiImage ?? null,
    tugasFungsi: data.tugasFungsi || [],
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

export function ProfileEditor({
  onDirtyChange,
}: { onDirtyChange?: (dirty: boolean) => void } = {}) {
  const editor = useCmsEditor(
    "/api/profile",
    {
      visi: "",
      misi: "",
      strukturOrganisasi: [],
      strukturOrganisasiImage: null,
      tugasFungsi: [],
      administratif: EMPTY_ADMIN,
    },
    "Gagal memuat profil desa",
    (raw) => villageProfileToForm(raw as VillageProfile),
    onDirtyChange,
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

    const strukturArray = editor.data.strukturOrganisasi.filter(
      (s) => s.role.trim() || s.name.trim(),
    );

    const tugasFungsiArray = editor.data.tugasFungsi.filter(
      (t) => t.jabatan.trim() || t.tugas.trim(),
    );

    await editor.save(
      {
        visi: editor.data.visi,
        misi: misiArray,
        strukturOrganisasi: strukturArray,
        strukturOrganisasiImage: editor.data.strukturOrganisasiImage,
        tugasFungsi: tugasFungsiArray,
        administratif: editor.data.administratif,
      },
      "Profil desa berhasil diperbarui",
      "Gagal memperbarui profil desa",
    );
  }

  function addStruktur() {
    editor.setData((p) => ({
      ...p,
      strukturOrganisasi: [...p.strukturOrganisasi, { role: "", name: "" }],
    }));
  }

  function removeStruktur(idx: number) {
    editor.setData((p) => ({
      ...p,
      strukturOrganisasi: p.strukturOrganisasi.filter((_, i) => i !== idx),
    }));
  }

  function updateStruktur(idx: number, field: "role" | "name", value: string) {
    editor.setData((p) => {
      const updated = p.strukturOrganisasi.map((item, i) =>
        i === idx ? { ...item, [field]: value } : item,
      );
      return { ...p, strukturOrganisasi: updated };
    });
  }

  function addTugas() {
    editor.setData((p) => ({
      ...p,
      tugasFungsi: [...p.tugasFungsi, { jabatan: "", tugas: "" }],
    }));
  }

  function removeTugas(idx: number) {
    editor.setData((p) => ({
      ...p,
      tugasFungsi: p.tugasFungsi.filter((_, i) => i !== idx),
    }));
  }

  function updateTugas(idx: number, field: "jabatan" | "tugas", value: string) {
    editor.setData((p) => {
      const updated = p.tugasFungsi.map((item, i) =>
        i === idx ? { ...item, [field]: value } : item,
      );
      return { ...p, tugasFungsi: updated };
    });
  }

  const [orgImageUploading, setOrgImageUploading] = useState(false);

  async function handleOrganisasiImagePick(e: ChangeEvent<HTMLInputElement>) {
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

    setOrgImageUploading(true);
    try {
      const dataUri = await resizeImage(file);
      editor.setData((p) => ({ ...p, strukturOrganisasiImage: dataUri }));
    } catch (e) {
      console.error(e);
      toast.error("Gagal memproses gambar");
    } finally {
      setOrgImageUploading(false);
    }
  }

  function handleRemoveOrganisasiImage() {
    editor.setData((p) => ({ ...p, strukturOrganisasiImage: null }));
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
        <label>Struktur Organisasi (Gambar)</label>
        <div className="flex gap-3 items-start">
          <label
            className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              orgImageUploading
                ? "opacity-50 pointer-events-none border-muted bg-muted text-muted-foreground"
                : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <ImageUp size={16} />
            {orgImageUploading ? "Memproses..." : "Pilih Gambar"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleOrganisasiImagePick}
              disabled={orgImageUploading}
            />
          </label>
          {editor.data.strukturOrganisasiImage && (
            <button
              type="button"
              onClick={handleRemoveOrganisasiImage}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              <TrashIcon size={14} />
              Hapus
            </button>
          )}
        </div>
        {editor.data.strukturOrganisasiImage ? (
          <div className="mt-3 relative w-full max-w-[600px] rounded-lg overflow-hidden border">
            <Image
              src={editor.data.strukturOrganisasiImage}
              alt="Struktur Organisasi"
              width={600}
              height={400}
              className="w-full h-auto object-contain"
              unoptimized
            />
          </div>
        ) : (
          <p className="text-[12px] text-muted-foreground mt-1.5">
            Format: JPG, PNG, WebP. Maks 5MB. Akan diresize otomatis ke 1920px.
          </p>
        )}
      </div>

      <div className="form-group">
        <label className="flex items-center gap-3">
          Struktur Organisasi (Nama dan Peran)
          <button
            type="button"
            onClick={addStruktur}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Plus size={14} />
            Tambah
          </button>
        </label>
        <div className="space-y-2 mt-2">
          {editor.data.strukturOrganisasi.length === 0 && (
            <p className="text-[12px] text-muted-foreground">
              Belum ada entri struktur organisasi. Klik &ldquo;Tambah&rdquo;
              untuk menambahkan.
            </p>
          )}
          {editor.data.strukturOrganisasi.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                className="form-input flex-1"
                value={item.role}
                onChange={(e) => updateStruktur(idx, "role", e.target.value)}
                placeholder="Peran (Kepala Desa...)"
              />
              <input
                className="form-input flex-[2]"
                value={item.name}
                onChange={(e) => updateStruktur(idx, "name", e.target.value)}
                placeholder="Nama"
              />
              <button
                type="button"
                onClick={() => removeStruktur(idx)}
                className="p-2 text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="flex items-center gap-3">
          Tugas dan Fungsi
          <button
            type="button"
            onClick={addTugas}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Plus size={14} />
            Tambah
          </button>
        </label>
        <div className="space-y-2 mt-2">
          {editor.data.tugasFungsi.length === 0 && (
            <p className="text-[12px] text-muted-foreground">
              Belum ada entri tugas dan fungsi. Klik &ldquo;Tambah&rdquo; untuk
              menambahkan.
            </p>
          )}
          {editor.data.tugasFungsi.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <input
                className="form-input flex-1"
                value={item.jabatan}
                onChange={(e) => updateTugas(idx, "jabatan", e.target.value)}
                placeholder="Jabatan (Kepala Desa...)"
              />
              <textarea
                className="form-textarea flex-[2]"
                value={item.tugas}
                onChange={(e) => updateTugas(idx, "tugas", e.target.value)}
                rows={2}
                placeholder="Deskripsi tugas"
              />
              <button
                type="button"
                onClick={() => removeTugas(idx)}
                className="p-2 text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
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
