"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Plus, ArrowLeft } from "lucide-react";
import type { ArticleFrontmatter } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toKebab } from "@/lib/utils";
import { ArticleEditor } from "@/components/jurnalis/article-editor";
import { ArticleList } from "@/components/jurnalis/article-list";

export interface ArticleForm {
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
  category: "Kegiatan Desa",
  summary: "",
  content: "",
  image: "",
};

export function ArticleManagerSkeleton() {
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

export function ArticleManager({
  onDirtyStateChange,
}: { onDirtyStateChange?: (dirty: boolean) => void } = {}) {
  const [articles, setArticles] = useState<ArticleFrontmatter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<ArticleForm>(EMPTY_FORM);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [originalForm, setOriginalForm] = useState<ArticleForm>(EMPTY_FORM);

  function isEqual(a: ArticleForm, b: ArticleForm): boolean {
    return (
      a.title === b.title &&
      a.slug === b.slug &&
      a.category === b.category &&
      a.summary === b.summary &&
      a.content === b.content &&
      a.image === b.image
    );
  }

  const hasChanges = useMemo(
    () => !isEqual(form, originalForm),
    [form, originalForm],
  );

  useEffect(() => {
    onDirtyStateChange?.(hasChanges);
  }, [hasChanges, onDirtyStateChange]);

  const fetchArticles = useCallback(async (abortSignal?: AbortSignal) => {
    const res = await fetch("/api/articles", { signal: abortSignal });
    if (!res.ok) throw new Error("Gagal memuat daftar artikel");
    const body = await res.json();
    return (body.data ?? body) as ArticleFrontmatter[];
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
    const ac = new AbortController();
    setRefreshing(true);
    try {
      setArticles(await fetchArticles(ac.signal));
    } catch (err) {
      console.error("refreshArticles error:", err);
      toast.error("Gagal memuat daftar artikel");
    } finally {
      setRefreshing(false);
    }
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setOriginalForm(EMPTY_FORM);
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
    } catch (err) {
      console.error("handleCreate error:", err);
      toast.error("Gagal membuat artikel");
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(article: ArticleFrontmatter) {
    setEditingSlug(article.slug);
    setImagePreview(article.image || null);
    const initialForm: ArticleForm = {
      title: article.title,
      slug: article.slug,
      category: article.category,
      summary: article.summary,
      content: "",
      image: article.image || "",
    };
    setForm(initialForm);
    setOriginalForm(initialForm);

    try {
      const res = await fetch(`/api/articles/${article.slug}`);
      if (res.ok) {
        const full = await res.json();
        const readyForm = { ...initialForm, content: full.content || "" };
        setForm(readyForm);
        setOriginalForm(readyForm);
      } else {
        setEditingSlug(null);
        toast.error("Gagal memuat konten artikel");
      }
    } catch (err) {
      setEditingSlug(null);
      console.error("handleEdit error:", err);
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
    } catch (err) {
      console.error("handleUpdate error:", err);
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
    } catch (err) {
      console.error("handleDelete error:", err);
      toast.error("Gagal menghapus artikel");
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
          <Button
            size="sm"
            onClick={() => {
              setIsAdding(true);
              setForm(EMPTY_FORM);
              setOriginalForm(EMPTY_FORM);
              setImagePreview(null);
            }}
            disabled={refreshing}
          >
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
        <ArticleEditor
          form={form}
          imagePreview={imagePreview}
          saving={saving}
          editingSlug={editingSlug}
          hasChanges={hasChanges}
          setForm={setForm}
          setImagePreview={setImagePreview}
          onTitleChange={handleTitleChange}
          onSave={editingSlug ? handleUpdate : handleCreate}
          onCancel={resetForm}
        />
      )}

      {!isAdding && !editingSlug && (
        <div
          className={`relative ${refreshing ? "opacity-50 pointer-events-none" : ""}`}
        >
          <ArticleList
            articles={articles}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
}
