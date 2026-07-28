"use client";

import { useState } from "react";
import type { ArticleFrontmatter } from "@/lib/types";
import { ArticleCard } from "@/components/articles/article-card";
import { Pagination } from "@/components/articles/pagination";

const PER_PAGE = 6;

export function HomeArticles({ articles }: { articles: ArticleFrontmatter[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(articles.length / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = articles.slice(
    (safePage - 1) * PER_PAGE,
    safePage * PER_PAGE,
  );

  function handlePageChange(page: number) {
    setCurrentPage(page);
    document
      .getElementById("articles-section")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section
      id="articles-section"
      className="home-articles-section"
      role="region"
      aria-label="Kabar dan berita desa"
    >
      <div className="container">
        <div className="section-header">
          <h2>Kabar & Berita Desa</h2>
          <p>
            Ikuti perkembangan terbaru mengenai program pembangunan dan kegiatan
            sosial kemasyarakatan di Tulungrejo
          </p>
        </div>

        <div className="articles-grid">
          {paginated.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </section>
  );
}
