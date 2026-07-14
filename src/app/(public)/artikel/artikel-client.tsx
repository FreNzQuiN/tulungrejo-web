"use client";

import { useState, useMemo } from "react";
import type { ArticleFrontmatter } from "@/lib/types";
import { ArticleCard } from "@/components/articles/article-card";
import { ArticleSearch } from "@/components/articles/article-search";
import { Pagination } from "@/components/articles/pagination";

const PER_PAGE = 9;

export function ArtikelClient({
  articles,
}: {
  articles: ArticleFrontmatter[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const categories = useMemo(() => {
    const set = new Set(articles.map((a) => a.category).filter(Boolean));
    return [...set].sort();
  }, [articles]);

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const matchesSearch =
        !searchTerm ||
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.summary.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || a.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [articles, searchTerm, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PER_PAGE,
    safePage * PER_PAGE,
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="container">
          <h1>Kabar & Artikel Desa</h1>
          <p>
            Kumpulan publikasi, berita kegiatan pemerintah, berita pembangunan,
            serta pengumuman resmi bagi warga Tulungrejo
          </p>
        </div>
      </div>

      <div className="container pb-[60px]">
        <ArticleSearch
          searchTerm={searchTerm}
          setSearchTerm={(v) => {
            setSearchTerm(v);
            setCurrentPage(1);
          }}
          categoryFilter={categoryFilter}
          setCategoryFilter={(v) => {
            setCategoryFilter(v);
            setCurrentPage(1);
          }}
          categories={categories}
        />

        {filtered.length === 0 ? (
          <div className="glass-panel p-[50px] text-center mb-[60px]">
            <p className="text-[16px] text-muted-foreground">
              Belum ada artikel.
            </p>
          </div>
        ) : (
          <>
            <div className="articles-grid mb-6">
              {paginated.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
