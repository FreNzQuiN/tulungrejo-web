import { Suspense } from "react";
import { connection } from "next/server";
import { getAllPublishedArticles } from "@/lib/article-queries";
import { ArticlesError } from "@/components/articles/articles-error";
import { ArtikelClient } from "./artikel-client";

async function ArticlesContent() {
  await connection();

  try {
    const articles = await getAllPublishedArticles();
    return <ArtikelClient articles={articles} />;
  } catch (e) {
    console.error("Gagal memuat daftar artikel:", e);
    return <ArticlesError message="Gagal memuat daftar artikel" />;
  }
}

export default function ArticlesPage() {
  return (
    <Suspense fallback={null}>
      <ArticlesContent />
    </Suspense>
  );
}
