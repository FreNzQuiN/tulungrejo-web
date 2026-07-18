import { getAllPublishedArticles } from "@/lib/article-queries";
import { ArticlesError } from "@/components/articles/articles-error";
import { ArtikelClient } from "./artikel-client";

export default async function ArticlesPage() {
  let articles;
  try {
    articles = await getAllPublishedArticles();
  } catch (e) {
    console.error("Gagal memuat daftar artikel:", e);
    return <ArticlesError message="Gagal memuat daftar artikel" />;
  }
  return <ArtikelClient articles={articles} />;
}
