"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Trash2, Pencil, Plus, X, Save, ArrowLeft } from "lucide-react";
import type { ArticleFrontmatter } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/constants";
import { toKebab } from "@/lib/utils";

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

export function ArticleManager() {
  const [articles, setArticles] = useState<ArticleFrontmatter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<ArticleForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchArticles = useCallback(async () => {
    try {
      const res = await fetch("/api/articles");
      if (res.ok) {
        setArticles(await res.json());
      }
    } catch {
      toast.error("Gagal memuat daftar artikel");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // setState only after await — no cascading render
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchArticles();
  }, [fetchArticles]);

  function resetForm() {
    setForm(EMPTY_FORM);
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
        fetchArticles();
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
    setForm({
      title: article.title,
      slug: article.slug,
      category: article.category,
      summary: article.summary,
      content: "",
      image: article.image || "",
    });

    // Fetch content for editing
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
        fetchArticles();
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
        fetchArticles();
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
    return (
      <div className="cms-content-card">
        <p className="text-muted">Memuat...</p>
      </div>
    );
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

      {/* Create / Edit Form */}
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
            <label>Konten (Markdown)</label>
            <textarea
              className="form-textarea"
              value={form.content}
              onChange={(e) =>
                setForm((p) => ({ ...p, content: e.target.value }))
              }
              placeholder="Tulis konten artikel dalam format Markdown..."
              rows={12}
            />
          </div>

          <div className="form-group">
            <label>URL Gambar</label>
            <input
              className="form-input"
              value={form.image}
              onChange={(e) =>
                setForm((p) => ({ ...p, image: e.target.value }))
              }
              placeholder="https://example.com/image.jpg"
            />
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

      {/* Article List */}
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
