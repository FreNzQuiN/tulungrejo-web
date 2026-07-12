import { Suspense } from "react";
import { connection } from "next/server";
import { getAllPublishedArticles } from "@/lib/article-queries";
import { ArtikelClient } from "./artikel-client";

async function ArticlesContent() {
  await connection();

  const articles = await getAllPublishedArticles().catch(() => []);
  return <ArtikelClient articles={articles} />;
}

export default function ArticlesPage() {
  return (
    <Suspense fallback={null}>
      <ArticlesContent />
    </Suspense>
  );
}
