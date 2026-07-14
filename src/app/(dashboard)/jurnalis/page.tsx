"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import { CMSLayout } from "@/components/jurnalis/cms-layout";
import { ArticleManager } from "@/components/jurnalis/article-manager";
import { StatsEditor } from "@/components/jurnalis/stats-editor";
import { ProfileEditor } from "@/components/jurnalis/profile-editor";

function JurnalisSkeleton() {
  return (
    <div>
      <div className="page-header mb-8">
        <div className="container">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-2 h-4 w-96" />
        </div>
      </div>
      <div className="container">
        <div className="dashboard-layout">
          <aside className="cms-sidebar">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-[52px] w-full rounded-[var(--radius-sm)]"
              />
            ))}
          </aside>
          <main className="cms-content-card">
            <div className="cms-section-header">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-9 w-40 rounded" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 border border-[rgba(79,112,156,0.15)] rounded-[var(--radius-sm)]"
                >
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="flex-1">
                    <Skeleton className="mb-1 h-5 w-3/4" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function JurnalisPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("articles");

  const renderContent = () => {
    switch (activeTab) {
      case "articles":
        return <ArticleManager />;
      case "stats":
        return <StatsEditor />;
      case "profile":
        return <ProfileEditor />;
      default:
        return <ArticleManager />;
    }
  };

  if (status === "loading") {
    return <JurnalisSkeleton />;
  }

  return (
    <div>
      <div className="page-header mb-8">
        <div className="container">
          <h1>Sistem Manajemen Konten (CMS)</h1>
          <p>
            Otoritas Jurnalis: Kelola artikel warta desa, edit variabel
            statistik kependudukan, dan sesuaikan data profil pemerintahan desa
          </p>
        </div>
      </div>
      <div className="container">
        <CMSLayout activeTab={activeTab} onTabChange={setActiveTab}>
          {renderContent()}
        </CMSLayout>
      </div>
    </div>
  );
}
