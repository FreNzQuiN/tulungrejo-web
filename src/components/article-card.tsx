import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import type { ArticleFrontmatter } from "@/lib/types";
import { ARTICLE_IMAGE_FALLBACK } from "@/lib/constants";

export function ArticleCard({ article }: { article: ArticleFrontmatter }) {
  return (
    <article className="article-card">
      <div className="article-img-wrapper" data-alt={article.title}>
        <img
          src={article.image || ARTICLE_IMAGE_FALLBACK}
          alt={article.title}
          className="article-img"
        />
        <span className="article-category">{article.category}</span>
      </div>
      <div className="article-body">
        <div className="article-date">
          <Calendar size={12} />
          {new Date(article.date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
        <h3 className="article-title">{article.title}</h3>
        <p className="article-summary">{article.summary}</p>
        <Link
          href={`/artikel/${article.slug}`}
          className="article-link bg-none border-none cursor-pointer text-left p-0"
        >
          Baca Selengkapnya <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}
