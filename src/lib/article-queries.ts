import { cacheTag, cacheLife } from "next/cache";
import { prisma } from "./prisma";
import type { Article, ArticleFrontmatter } from "./types";
import type { Prisma } from "@prisma/client";
import { safeJsonParse } from "./utils";

const articleListSelect = {
  title: true,
  slug: true,
  date: true,
  author: true,
  category: true,
  summary: true,
  image: true,
  tags: true,
  published: true,
} as const;

function toFrontmatter(a: {
  title: string;
  slug: string;
  date: Date;
  author: string;
  category: string;
  summary: string;
  image: string | null;
  tags: string | null;
  published: boolean;
}): ArticleFrontmatter {
  return {
    title: a.title,
    slug: a.slug,
    date: a.date instanceof Date ? a.date.toISOString() : String(a.date),
    author: a.author,
    category: a.category,
    summary: a.summary,
    image: a.image ?? undefined,
    tags: a.tags ? safeJsonParse<string[]>(a.tags, []) : undefined,
    published: a.published,
  };
}

export function toFullArticle(a: {
  id: number;
  title: string;
  slug: string;
  date: Date;
  author: string;
  category: string;
  summary: string;
  image: string | null;
  content: string;
  tags: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}): Article {
  return {
    ...toFrontmatter(a),
    content: a.content,
  };
}

async function queryAllPublishedArticles(take?: number, skip?: number) {
  const safeTake = Math.min(take ?? 100, 1000);
  const safeSkip = Math.min(skip ?? 0, 10000);
  return prisma.article.findMany({
    where: { published: true },
    orderBy: { date: "desc" },
    select: articleListSelect,
    take: safeTake,
    ...(skip !== undefined ? { skip: safeSkip } : {}),
  });
}

async function queryPublishedArticleBySlug(
  slug: string,
): Promise<Article | null> {
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article || !article.published) return null;
  return toFullArticle(article);
}

export async function getAllPublishedArticles(
  take?: number,
  skip?: number,
): Promise<ArticleFrontmatter[]> {
  if (process.env.NODE_ENV === "production") {
    return getAllPublishedArticlesCached(take, skip);
  }
  const articles = await queryAllPublishedArticles(take, skip);
  return articles.map(toFrontmatter);
}

async function getAllPublishedArticlesCached(
  take?: number,
  skip?: number,
): Promise<ArticleFrontmatter[]> {
  "use cache: remote";
  cacheTag("articles");
  cacheLife("hours");
  const articles = await queryAllPublishedArticles(take, skip);
  return articles.map(toFrontmatter);
}

export async function getPublishedArticleBySlug(
  slug: string,
): Promise<Article | null> {
  if (process.env.NODE_ENV === "production") {
    return getPublishedArticleBySlugCached(slug);
  }
  return queryPublishedArticleBySlug(slug);
}

async function getPublishedArticleBySlugCached(
  slug: string,
): Promise<Article | null> {
  "use cache: remote";
  cacheTag(`article-${slug}`);
  cacheLife("hours");
  return queryPublishedArticleBySlug(slug);
}

export async function getAllArticlesForJournalist(
  take?: number,
  skip?: number,
): Promise<ArticleFrontmatter[]> {
  const safeTake = Math.min(take ?? 100, 1000);
  const safeSkip = Math.min(skip ?? 0, 10000);
  const articles = await prisma.article.findMany({
    orderBy: { date: "desc" },
    select: articleListSelect,
    take: safeTake,
    ...(skip !== undefined ? { skip: safeSkip } : {}),
  });
  return articles.map(toFrontmatter);
}

async function queryAllPublishedArticlesWithMeta(
  take?: number,
  skip?: number,
): Promise<{ data: ArticleFrontmatter[]; total: number }> {
  const safeTake = Math.min(take ?? 100, 1000);
  const safeSkip = Math.min(skip ?? 0, 10000);
  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where: { published: true },
      orderBy: { date: "desc" },
      select: articleListSelect,
      take: safeTake,
      skip: safeSkip,
    }),
    prisma.article.count({ where: { published: true } }),
  ]);
  return { data: articles.map(toFrontmatter), total };
}

export async function getAllPublishedArticlesWithMeta(
  take?: number,
  skip?: number,
): Promise<{ data: ArticleFrontmatter[]; total: number }> {
  if (process.env.NODE_ENV === "production") {
    return getAllPublishedArticlesWithMetaCached(take, skip);
  }
  return queryAllPublishedArticlesWithMeta(take, skip);
}

async function getAllPublishedArticlesWithMetaCached(
  take?: number,
  skip?: number,
): Promise<{ data: ArticleFrontmatter[]; total: number }> {
  "use cache: remote";
  cacheTag("articles");
  cacheLife("hours");
  return queryAllPublishedArticlesWithMeta(take, skip);
}

export async function getAllArticlesForJournalistWithMeta(
  take?: number,
  skip?: number,
): Promise<{ data: ArticleFrontmatter[]; total: number }> {
  const safeTake = Math.min(take ?? 100, 1000);
  const safeSkip = Math.min(skip ?? 0, 10000);
  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      orderBy: { date: "desc" },
      select: articleListSelect,
      take: safeTake,
      skip: safeSkip,
    }),
    prisma.article.count(),
  ]);
  return { data: articles.map(toFrontmatter), total };
}

export async function checkSlugExists(
  slug: string,
  excludeSlug?: string,
): Promise<boolean> {
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article) return false;
  if (excludeSlug && article.slug === excludeSlug) return false;
  return true;
}

export interface CreateArticleInput {
  title: string;
  slug: string;
  date: string;
  author: string;
  category: string;
  summary: string;
  content: string;
  image?: string;
  tags?: string[];
  published: boolean;
}

export async function createArticle(
  data: CreateArticleInput,
  authorId: number,
): Promise<string> {
  await prisma.article.create({
    data: {
      title: data.title,
      slug: data.slug,
      date: new Date(data.date),
      author: data.author,
      authorId,
      category: data.category,
      summary: data.summary,
      content: data.content,
      image: data.image || null,
      tags:
        data.tags && data.tags.length > 0 ? JSON.stringify(data.tags) : null,
      published: data.published,
    },
  });
  return data.slug;
}

export async function updateArticle(
  slug: string,
  data: Partial<CreateArticleInput>,
): Promise<ArticleFrontmatter & { content: string }> {
  const updateData: Prisma.ArticleUpdateInput = {} as Prisma.ArticleUpdateInput;

  if (data.title !== undefined) updateData.title = data.title;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.date !== undefined) updateData.date = new Date(data.date);
  if (data.author !== undefined) updateData.author = data.author;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.summary !== undefined) updateData.summary = data.summary;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.image !== undefined) updateData.image = data.image || null;
  if (data.tags !== undefined) {
    updateData.tags = data.tags.length > 0 ? JSON.stringify(data.tags) : null;
  }
  if (data.published !== undefined) updateData.published = data.published;

  const updated = await prisma.article.update({
    where: { slug },
    data: updateData,
  });
  return toFullArticle(updated);
}

export async function deleteArticle(
  slug: string,
): Promise<{ success: true } | { success: false; notFound: boolean }> {
  try {
    await prisma.article.delete({ where: { slug } });
    return { success: true };
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in (err as Record<string, unknown>) &&
      (err as Record<string, unknown>).code === "P2025"
    ) {
      return { success: false, notFound: true };
    }
    console.error("deleteArticle error:", err);
    throw err;
  }
}
