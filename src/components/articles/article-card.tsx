import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowRight } from "lucide-react";
import type { ArticleFrontmatter } from "@/lib/types";
import { ARTICLE_IMAGE_FALLBACK } from "@/lib/constants";

export function ArticleCard({ article }: { article: ArticleFrontmatter }) {
  const formattedDate = (() => {
    try {
      return new Date(article.date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return article.date;
    }
  })();

  return (
    <article className="article-card">
      <div className="article-img-wrapper">
        <Image
          src={article.image || ARTICLE_IMAGE_FALLBACK}
          alt={article.title}
          className="article-img"
          fill
          unoptimized

          sizes="(max-width: 768px) 100vw, (max-width: 992px) 50vw, 33vw"
        />
        <span className="article-category">{article.category}</span>
      </div>
      <div className="article-body">
        <div className="article-date">
          <Calendar size={12} />
          {formattedDate}
        </div>
        <h3 className="article-title" id={`article-title-${article.slug}`}>
          {article.title}
        </h3>
        <p className="article-summary">{article.summary}</p>
        <Link
          href={`/artikel/${article.slug}`}
          className="article-link bg-none border-none cursor-pointer text-left p-0"
          aria-labelledby={`article-title-${article.slug}`}
        >
          Baca Selengkapnya <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}
