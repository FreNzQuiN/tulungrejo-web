"use client";

import { useState } from "react";
import type { ArticleFrontmatter } from "@/lib/types";
import { ArticleCard } from "@/components/article-card";

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
    <section id="articles-section" className="home-articles-section">
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
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center justify-center w-10 h-10 rounded-md border border-gray-300 bg-white text-[#062c30] font-bold cursor-pointer transition-all hover:bg-gray-100 hover:border-[#062c30] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              &laquo;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`flex items-center justify-center w-10 h-10 rounded-md border font-bold cursor-pointer transition-all ${currentPage === page ? "bg-[#062c30] text-white border-[#062c30]" : "border-gray-300 bg-white text-[#062c30] hover:bg-gray-100 hover:border-[#062c30]"}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center w-10 h-10 rounded-md border border-gray-300 bg-white text-[#062c30] font-bold cursor-pointer transition-all hover:bg-gray-100 hover:border-[#062c30] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              &raquo;
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
