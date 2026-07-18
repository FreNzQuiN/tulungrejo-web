import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPublishedArticleBySlug } from "@/lib/article-queries";
import { ArrowLeft, Calendar } from "lucide-react";
import { ARTICLE_IMAGE_FALLBACK, SITE_URL } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { SocialShare } from "@/components/shared/social-share";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) return {};

  const url = `${SITE_URL}/artikel/${slug}`;
  const image = article.image
    ? { url: article.image, width: 1200, height: 630, alt: article.title }
    : undefined;

  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.summary,
      url,
      siteName: "Desa Tulungrejo",
      locale: "id_ID",
      type: "article",
      publishedTime: article.date,
      authors: [article.author],
      images: image ? [image] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary,
      images: image ? [image] : undefined,
    },
  };
}

async function ArticleContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const article = await getPublishedArticleBySlug(slug);
  if (!article) notFound();

  return (
    <div className="container px-6 py-10 flex-1">
      <nav className="text-[13px] text-muted-foreground mb-6 flex items-center gap-2">
        <Link href="/artikel" className="text-dark-brown font-semibold">
          Artikel
        </Link>
        <span>/</span>
        <span>{article.category}</span>
        <span>/</span>
        <span style={{ color: "var(--color-dark)" }}>{article.title}</span>
      </nav>

      <div className="mb-6">
        <Link
          href="/artikel"
          className="btn btn-outline btn-sm inline-flex items-center gap-2 cursor-pointer no-underline"
        >
          <ArrowLeft size={14} /> Kembali
        </Link>
      </div>

      <article className="glass-panel overflow-hidden mb-[60px]">
        <div className="relative w-full h-[480px]">
          <Image
            src={article.image || ARTICLE_IMAGE_FALLBACK}
            alt={article.title}
            fill
            unoptimized
            loading="eager"
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="detail-article-body p-10">
          <div className="flex gap-4 text-[13px] text-muted-foreground mb-4 items-center">
            <span className="inline-block px-[10px] py-[4px] text-[11px] font-bold uppercase tracking-wider rounded-full bg-green-100 text-green-700">
              {article.category}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar size={12} className="align-middle" />
              {new Date(article.date).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <h1
            className="text-[36px] text-dark-brown leading-tight mb-6 font-bold"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {article.title}
          </h1>
          <div className="prose max-w-none text-[16px] leading-[1.8]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {article.content}
            </ReactMarkdown>
          </div>

          <SocialShare title={article.title} slug={article.slug} />
        </div>
      </article>
    </div>
  );
}

function ArticleSkeleton() {
  return (
    <div className="container px-6 py-10 flex-1">
      <Skeleton className="mb-6 h-4 w-48" />
      <Skeleton className="mb-8 h-8 w-32" />
      <div className="glass-panel overflow-hidden mb-[60px]">
        <Skeleton className="h-[480px] w-full rounded-none" />
        <div className="p-10">
          <Skeleton className="mb-4 h-6 w-28" />
          <Skeleton className="mb-6 h-10 w-3/4" />
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="mb-2 h-4 w-5/6" />
          <Skeleton className="mt-8 h-4 w-1/3" />
        </div>
      </div>
    </div>
  );
}

export default function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <div className="animate-fade-in min-h-[80vh] flex flex-col">
      <Suspense fallback={<ArticleSkeleton />}>
        <ArticleContent params={params} />
      </Suspense>
    </div>
  );
}
