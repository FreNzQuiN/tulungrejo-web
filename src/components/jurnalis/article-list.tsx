"use client";

import { Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ArticleFrontmatter } from "@/lib/types";

interface ArticleListProps {
  articles: ArticleFrontmatter[];
  onEdit: (article: ArticleFrontmatter) => void;
  onDelete: (slug: string) => void;
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

export function ArticleList({ articles, onEdit, onDelete }: ArticleListProps) {
  if (articles.length === 0) {
    return (
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
            <tr>
              <td
                colSpan={4}
                className="text-center p-10 text-muted-foreground"
              >
                Belum ada artikel. Klik &ldquo;Terbitkan Artikel&rdquo; untuk
                membuat yang baru.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
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
          {articles.map((article) => (
            <tr key={article.slug}>
              <td data-label="Judul" className="font-semibold">
                {article.title}
              </td>
              <td data-label="Tanggal">{formatDate(article.date)}</td>
              <td data-label="Kategori">
                <span className="inline-block px-[10px] py-[4px] text-[11px] font-bold uppercase tracking-wider rounded-full bg-green-100 text-green-700">
                  {article.category}
                </span>
              </td>
              <td data-label="Aksi">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(article)}
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(article.slug)}
                    title="Hapus"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
