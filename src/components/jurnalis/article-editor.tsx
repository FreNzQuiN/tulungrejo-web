"use client";

import { useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { X, Save, ImageUp, Trash as TrashIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CATEGORIES, MAX_IMAGE_SIZE } from "@/lib/constants";
import { resizeImage } from "@/lib/client-utils";
import { MarkdownEditor } from "@/components/jurnalis/markdown-editor";
import { toKebab } from "@/lib/utils";
import type { ArticleForm } from "./article-manager";

interface ArticleEditorProps {
  form: ArticleForm;
  imagePreview: string | null;
  saving: boolean;
  editingSlug: string | null;
  hasChanges: boolean;
  setForm: React.Dispatch<React.SetStateAction<ArticleForm>>;
  setImagePreview: React.Dispatch<React.SetStateAction<string | null>>;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function ArticleEditor({
  form,
  imagePreview,
  saving,
  editingSlug,
  hasChanges,
  setForm,
  setImagePreview,
  onTitleChange,
  onSave,
  onCancel,
}: ArticleEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  async function handleImagePick(e: ChangeEvent<HTMLInputElement>) {
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

    setUploading(true);
    try {
      const dataUri = await resizeImage(file);
      setForm((p) => ({ ...p, image: dataUri }));
      setImagePreview(dataUri);
    } catch (e) {
      console.error(e);
      toast.error("Gagal memproses gambar");
    } finally {
      setUploading(false);
    }
  }

  function handleRemoveImage() {
    setForm((p) => ({ ...p, image: "" }));
    setImagePreview(null);
  }

  return (
    <div className="article-form mb-6">
      <div className="form-group">
        <label>Judul Artikel</label>
        <input
          className="form-input"
          value={form.title}
          maxLength={255}
          onChange={(e) => {
            const title = e.target.value;
            if (editingSlug) {
              setForm((p) => ({ ...p, title }));
            } else {
              setForm((p) => ({
                ...p,
                title,
                slug: slugManuallyEdited ? p.slug : toKebab(title),
              }));
            }
          }}
          placeholder="Masukkan judul artikel"
        />
      </div>

      <div className="form-group">
        <label>
          Slug
          {!slugManuallyEdited && form.title && !editingSlug && (
            <span className="text-[11px] text-muted-foreground ml-2">
              (otomatis)
            </span>
          )}
        </label>
        <input
          className="form-input font-mono text-sm"
          value={form.slug}
          onChange={(e) => {
            const val = e.target.value;
            setForm((p) => ({ ...p, slug: val }));
            if (val) {
              setSlugManuallyEdited(true);
            } else {
              setSlugManuallyEdited(false);
            }
          }}
          placeholder={editingSlug ? form.slug : "slug-artikel"}
        />
      </div>

      <div className="form-group">
        <label>Kategori</label>
        <select
          className="form-select"
          value={form.category}
          onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Ringkasan</label>
        <textarea
          className="form-textarea"
          value={form.summary}
          onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))}
          placeholder="Ringkasan artikel (max 500 karakter)"
          rows={3}
          maxLength={500}
        />
      </div>

      <div className="form-group">
        <label>Konten</label>
        <MarkdownEditor
          value={form.content}
          onChange={(v) => setForm((p) => ({ ...p, content: v }))}
        />
      </div>

      <div className="form-group">
        <label>Gambar Cover</label>
        <div className="flex gap-3 items-start">
          <label
            className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              uploading
                ? "opacity-50 pointer-events-none border-muted bg-muted text-muted-foreground"
                : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <ImageUp size={16} />
            {uploading ? "Memproses..." : "Pilih Gambar"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleImagePick}
              disabled={uploading}
            />
          </label>
          {imagePreview && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              <TrashIcon size={14} />
              Hapus
            </button>
          )}
        </div>
        {imagePreview && (
          <div className="mt-3 relative w-full max-w-[400px] rounded-lg overflow-hidden border">
            <Image
              src={imagePreview}
              alt="Preview cover"
              width={400}
              height={240}
              className="w-full h-auto object-cover max-h-[240px]"
              unoptimized
            />
          </div>
        )}
        {!imagePreview && (
          <p className="text-[12px] text-muted-foreground mt-1.5">
            Format: JPG, PNG, WebP. Maks 5MB. Akan diresize otomatis ke 1920px.
          </p>
        )}
      </div>

      <div className="cms-action-btn-row">
        <Button variant="outline" size="sm" onClick={onCancel}>
          <X size={16} />
          Batal
        </Button>
        <Button size="sm" onClick={onSave} disabled={saving || !hasChanges}>
          <Save size={16} />
          {saving ? "Menyimpan..." : editingSlug ? "Perbarui" : "Terbitkan"}
        </Button>
      </div>
    </div>
  );
}
