"use client";

import { toast } from "sonner";
import { Save, X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCmsEditor } from "@/hooks/use-cms-editor";
import type { ContactInfo, SocialMediaLink } from "@/lib/types";

interface ContactForm {
  address: string;
  phone: string;
  email: string;
  jamKerja: string;
  jamLibur: string;
  socialMedia: SocialMediaLink[];
}

function contactToForm(data: ContactInfo): ContactForm {
  return {
    address: data.address || "",
    phone: data.phone || "",
    email: data.email || "",
    jamKerja: data.jamKerja || "",
    jamLibur: data.jamLibur || "",
    socialMedia: data.socialMedia || [],
  };
}

function ContactEditorSkeleton() {
  return (
    <div className="cms-content-card">
      <div className="cms-section-header">
        <Skeleton className="h-6 w-36" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="form-group">
          <Skeleton className="mb-1 h-4 w-28" />
          <Skeleton className="h-10 w-full rounded" />
        </div>
      ))}
      <div className="cms-action-btn-row">
        <Skeleton className="h-9 w-20 rounded" />
        <Skeleton className="h-9 w-28 rounded" />
      </div>
    </div>
  );
}

export function ContactEditor() {
  const editor = useCmsEditor(
    "/api/contact",
    {
      address: "",
      phone: "",
      email: "",
      jamKerja: "",
      jamLibur: "",
      socialMedia: [],
    },
    "Gagal memuat kontak",
    (raw) => contactToForm(raw as ContactInfo),
  );

  function addSocialMedia() {
    editor.setData((p) => ({
      ...p,
      socialMedia: [...p.socialMedia, { platform: "", url: "" }],
    }));
  }

  function removeSocialMedia(idx: number) {
    editor.setData((p) => ({
      ...p,
      socialMedia: p.socialMedia.filter((_, i) => i !== idx),
    }));
  }

  function updateSocialMedia(
    idx: number,
    field: "platform" | "url",
    value: string,
  ) {
    editor.setData((p) => {
      const updated = p.socialMedia.map((item, i) =>
        i === idx ? { ...item, [field]: value } : item,
      );
      return { ...p, socialMedia: updated };
    });
  }

  async function handleSave() {
    if (!editor.data.address) {
      toast.error("Alamat harus diisi");
      return;
    }
    if (!editor.data.phone) {
      toast.error("Nomor telepon harus diisi");
      return;
    }
    if (!editor.data.email) {
      toast.error("Email harus diisi");
      return;
    }

    const validSocial = editor.data.socialMedia.filter(
      (s) => s.platform.trim() && s.url.trim(),
    );

    await editor.save(
      {
        address: editor.data.address,
        phone: editor.data.phone,
        email: editor.data.email,
        jamKerja: editor.data.jamKerja,
        jamLibur: editor.data.jamLibur,
        socialMedia: validSocial,
      },
      "Kontak berhasil diperbarui",
      "Gagal memperbarui kontak",
    );
  }

  if (editor.loading) {
    return <ContactEditorSkeleton />;
  }

  return (
    <div className="cms-content-card">
      <div className="cms-section-header">
        <h3>Kelola Informasi Kontak</h3>
      </div>

      <p className="admin-desc-box">
        Perbarui alamat, nomor telepon, email, jam kerja, dan media sosial Desa
        Tulungrejo.
      </p>

      <div className="cms-grid-inputs-2">
        <div className="form-group">
          <label>Alamat</label>
          <textarea
            className="form-textarea"
            value={editor.data.address}
            onChange={(e) =>
              editor.setData((p) => ({ ...p, address: e.target.value }))
            }
            rows={2}
            placeholder="Alamat kantor desa"
          />
        </div>

        <div className="form-group">
          <label>Nomor Telepon</label>
          <input
            className="form-input"
            value={editor.data.phone}
            onChange={(e) =>
              editor.setData((p) => ({ ...p, phone: e.target.value }))
            }
            placeholder="085791371559"
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            className="form-input"
            type="email"
            value={editor.data.email}
            onChange={(e) =>
              editor.setData((p) => ({ ...p, email: e.target.value }))
            }
            placeholder="pemdes@tulungrejo.desa.id"
          />
        </div>

        <div className="form-group">
          <label>Jam Kerja</label>
          <input
            className="form-input"
            value={editor.data.jamKerja}
            onChange={(e) =>
              editor.setData((p) => ({ ...p, jamKerja: e.target.value }))
            }
            placeholder="Senin-Jumat 08:00-16:00"
          />
        </div>

        <div className="form-group">
          <label>Jam Libur</label>
          <input
            className="form-input"
            value={editor.data.jamLibur}
            onChange={(e) =>
              editor.setData((p) => ({ ...p, jamLibur: e.target.value }))
            }
            placeholder="Sabtu-Minggu"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="flex items-center gap-3">
          Media Sosial
          <button
            type="button"
            onClick={addSocialMedia}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Plus size={14} />
            Tambah
          </button>
        </label>
        <div className="space-y-2 mt-2">
          {editor.data.socialMedia.length === 0 && (
            <p className="text-[12px] text-muted-foreground">
              Belum ada media sosial. Klik “Tambah” untuk menambahkan.
            </p>
          )}
          {editor.data.socialMedia.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                className="form-input flex-1"
                value={item.platform}
                onChange={(e) =>
                  updateSocialMedia(idx, "platform", e.target.value)
                }
                placeholder="Platform (Facebook, YouTube...)"
              />
              <input
                className="form-input flex-[2]"
                value={item.url}
                onChange={(e) => updateSocialMedia(idx, "url", e.target.value)}
                placeholder="URL (https://...)"
              />
              <button
                type="button"
                onClick={() => removeSocialMedia(idx)}
                className="p-2 text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
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
