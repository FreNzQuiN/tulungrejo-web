import { Suspense } from "react";
import { connection } from "next/server";
import { getAllPublishedArticles } from "@/lib/article-queries";
import { ArticlesError } from "@/components/articles/articles-error";
import { ArtikelClient } from "./artikel-client";

async function ArticlesContent() {
  await connection();

  let articles;
  try {
    articles = await getAllPublishedArticles();
  } catch (e) {
    console.error("Gagal memuat daftar artikel:", e);
    return <ArticlesError message="Gagal memuat daftar artikel" />;
  }
  return <ArtikelClient articles={articles} />;
}

export default function ArticlesPage() {
  return (
    <Suspense fallback={null}>
      <ArticlesContent />
    </Suspense>
  );
}
