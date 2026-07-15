"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Trash2,
  Pencil,
  Plus,
  X,
  Save,
  ArrowLeft,
  ImageUp,
  Trash as TrashIcon,
} from "lucide-react";
import type { ArticleFrontmatter } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORIES, MAX_IMAGE_SIZE } from "@/lib/constants";
import { toKebab, resizeImage } from "@/lib/utils";
import { MarkdownEditor } from "@/components/jurnalis/markdown-editor";

interface ArticleForm {
  title: string;
  slug: string;
  category: string;
  summary: string;
  content: string;
  image: string;
}

const EMPTY_FORM: ArticleForm = {
  title: "",
  slug: "",
  category: CATEGORIES[0],
  summary: "",
  content: "",
  image: "",
};

function ArticleManagerSkeleton() {
  return (
    <div className="cms-content-card">
      <div className="cms-section-header">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-9 w-40 rounded" />
      </div>
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              {["Judul", "Tanggal", "Kategori", "Aksi"].map((_, i) => (
                <th key={i}>
                  <Skeleton className="h-4 w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 4 }).map((_, i) => (
              <tr key={i}>
                <td>
                  <Skeleton className="h-5 w-48" />
                </td>
                <td>
                  <Skeleton className="h-4 w-24" />
                </td>
                <td>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </td>
                <td>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ArticleManager() {
  const [articles, setArticles] = useState<ArticleFrontmatter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<ArticleForm>(EMPTY_FORM);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchArticles = useCallback(async (abortSignal?: AbortSignal) => {
    const res = await fetch("/api/articles", { signal: abortSignal });
    if (!res.ok) throw new Error("Gagal memuat daftar artikel");
    return (await res.json()) as ArticleFrontmatter[];
  }, []);

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        setArticles(await fetchArticles(ac.signal));
      } catch (err) {
        if (ac.signal.aborted) return;
        toast.error("Gagal memuat daftar artikel");
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [fetchArticles]);

  async function refreshArticles() {
    try {
      setArticles(await fetchArticles());
    } catch {
      toast.error("Gagal memuat daftar artikel");
    }
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setImagePreview(null);
    setIsAdding(false);
    setEditingSlug(null);
  }

  function handleTitleChange(title: string) {
    const slug = toKebab(title);
    setForm((prev) => ({
      ...prev,
      title,
      slug: editingSlug ? prev.slug : slug,
    }));
  }

  async function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
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
    } catch {
      toast.error("Gagal memproses gambar");
    } finally {
      setUploading(false);
    }
  }

  function handleRemoveImage() {
    setForm((p) => ({ ...p, image: "" }));
    setImagePreview(null);
  }

  async function handleCreate() {
    if (!form.title || !form.summary || !form.content) {
      toast.error("Judul, ringkasan, dan konten harus diisi");
      return;
    }

    setSaving(true);
    try {
      const slug = form.slug || toKebab(form.title) || `artikel-${Date.now()}`;
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, slug }),
      });

      if (res.ok) {
        toast.success("Artikel berhasil diterbitkan");
        resetForm();
        refreshArticles();
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal membuat artikel");
      }
    } catch {
      toast.error("Gagal membuat artikel");
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(article: ArticleFrontmatter) {
    setEditingSlug(article.slug);
    setImagePreview(article.image || null);
    setForm({
      title: article.title,
      slug: article.slug,
      category: article.category,
      summary: article.summary,
      content: "",
      image: article.image || "",
    });

    try {
      const res = await fetch(`/api/articles/${article.slug}`);
      if (res.ok) {
        const full = await res.json();
        setForm((prev) => ({ ...prev, content: full.content || "" }));
      } else {
        toast.error("Gagal memuat konten artikel");
      }
    } catch {
      toast.error("Gagal memuat konten artikel");
    }
  }

  async function handleUpdate() {
    if (!editingSlug) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/articles/${editingSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success("Artikel berhasil diperbarui");
        resetForm();
        refreshArticles();
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal memperbarui artikel");
      }
    } catch {
      toast.error("Gagal memperbarui artikel");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(slug: string) {
    if (!window.confirm("Yakin ingin menghapus artikel ini?")) return;

    try {
      const res = await fetch(`/api/articles/${slug}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Artikel berhasil dihapus");
        refreshArticles();
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal menghapus artikel");
      }
    } catch {
      toast.error("Gagal menghapus artikel");
    }
  }

  function formatDate(dateStr: string): string {
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "short",
        day: "numeric",
      } as Intl.DateTimeFormatOptions);
    } catch {
      return dateStr;
    }
  }

  if (loading) {
    return <ArticleManagerSkeleton />;
  }

  return (
    <div className="cms-content-card">
      <div className="cms-section-header">
        <h3>Kelola Artikel</h3>
        {!isAdding && !editingSlug && (
          <Button size="sm" onClick={() => setIsAdding(true)}>
            <Plus size={16} />
            Terbitkan Artikel
          </Button>
        )}
        {(isAdding || editingSlug) && (
          <Button variant="outline" size="sm" onClick={resetForm}>
            <ArrowLeft size={16} />
            Kembali
          </Button>
        )}
      </div>

      {(isAdding || editingSlug) && (
        <div className="article-form mb-6">
          <div className="form-group">
            <label>Judul Artikel</label>
            <input
              className="form-input"
              value={form.title}
              onChange={(e) =>
                editingSlug
                  ? setForm((p) => ({ ...p, title: e.target.value }))
                  : handleTitleChange(e.target.value)
              }
              placeholder="Masukkan judul artikel"
            />
          </div>

          <div className="form-group">
            <label>Kategori</label>
            <select
              className="form-select"
              value={form.category}
              onChange={(e) =>
                setForm((p) => ({ ...p, category: e.target.value }))
              }
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
              onChange={(e) =>
                setForm((p) => ({ ...p, summary: e.target.value }))
              }
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Preview cover"
                  className="w-full h-auto object-cover max-h-[240px]"
                />
              </div>
            )}
            {!imagePreview && (
              <p className="text-[12px] text-muted-foreground mt-1.5">
                Format: JPG, PNG, WebP. Maks 5MB. Akan diresize otomatis ke
                1920px.
              </p>
            )}
          </div>

          <div className="cms-action-btn-row">
            <Button variant="outline" size="sm" onClick={resetForm}>
              <X size={16} />
              Batal
            </Button>
            <Button
              size="sm"
              onClick={editingSlug ? handleUpdate : handleCreate}
              disabled={saving}
            >
              <Save size={16} />
              {saving ? "Menyimpan..." : editingSlug ? "Perbarui" : "Terbitkan"}
            </Button>
          </div>
        </div>
      )}

      {!isAdding && !editingSlug && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Judul</th>
                <th>Tanggal</th>
                <th>Kategori</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {articles.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center p-10 text-muted-foreground"
                  >
                    Belum ada artikel. Klik &ldquo;Terbitkan Artikel&rdquo;
                    untuk membuat yang baru.
                  </td>
                </tr>
              ) : (
                articles.map((article) => (
                  <tr key={article.slug}>
                    <td className="font-semibold">{article.title}</td>
                    <td>{formatDate(article.date)}</td>
                    <td>
                      <span className="inline-block px-[10px] py-[4px] text-[11px] font-bold uppercase tracking-wider rounded-full bg-green-100 text-green-700">
                        {article.category}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(article)}
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(article.slug)}
                          title="Hapus"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
