"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/components/providers";
import { Skeleton } from "@/components/ui/skeleton";
import { AccessDenied } from "@/components/auth/access-denied";
import { CMSLayout } from "@/components/jurnalis/cms-layout";
import { ArticleManagerSkeleton } from "@/components/jurnalis/article-manager";

const ArticleManager = dynamic(
  () =>
    import("@/components/jurnalis/article-manager").then(
      (m) => m.ArticleManager,
    ),
  { loading: () => <ArticleManagerSkeleton /> },
);

const StatsEditor = dynamic(
  () => import("@/components/jurnalis/stats-editor").then((m) => m.StatsEditor),
  { loading: () => <Skeleton className="h-64 w-full rounded-lg" /> },
);

const ProfileEditor = dynamic(
  () =>
    import("@/components/jurnalis/profile-editor").then((m) => m.ProfileEditor),
  { loading: () => <Skeleton className="h-64 w-full rounded-lg" /> },
);

const ContactEditor = dynamic(
  () =>
    import("@/components/jurnalis/contact-editor").then((m) => m.ContactEditor),
  { loading: () => <Skeleton className="h-64 w-full rounded-lg" /> },
);

const HomepageEditor = dynamic(
  () =>
    import("@/components/jurnalis/homepage-editor").then(
      (m) => m.HomepageEditor,
    ),
  { loading: () => <Skeleton className="h-64 w-full rounded-lg" /> },
);

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
  const { user: sessionUser, isLoading: statusLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("articles");
  const [dirtyTabs, setDirtyTabs] = useState<Record<string, boolean>>({});
  const handleDirtyChange = useCallback(
    (tab: string) => (dirty: boolean) => {
      setDirtyTabs((prev) => ({ ...prev, [tab]: dirty }));
    },
    [],
  );

  function handleTabChange(tab: string) {
    if (tab === activeTab) return;
    if (dirtyTabs[activeTab]) {
      const confirmed = window.confirm(
        "Anda memiliki perubahan yang belum disimpan. Yakin ingin meninggalkan halaman ini?",
      );
      if (!confirmed) return;
    }
    setActiveTab(tab);
  }

  const renderContent = () => {
    switch (activeTab) {
      case "articles":
        return (
          <ArticleManager onDirtyStateChange={handleDirtyChange("articles")} />
        );
      case "homepage":
        return <HomepageEditor onDirtyChange={handleDirtyChange("homepage")} />;
      case "stats":
        return <StatsEditor onDirtyChange={handleDirtyChange("stats")} />;
      case "profile":
        return <ProfileEditor onDirtyChange={handleDirtyChange("profile")} />;
      case "contact":
        return <ContactEditor onDirtyChange={handleDirtyChange("contact")} />;
      default:
        return (
          <ArticleManager onDirtyStateChange={handleDirtyChange("articles")} />
        );
    }
  };

  if (statusLoading) {
    return <JurnalisSkeleton />;
  }

  if (sessionUser?.role !== "jurnalis") {
    return <AccessDenied message="Halaman ini hanya untuk Jurnalis." />;
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
        <CMSLayout activeTab={activeTab} onTabChange={handleTabChange}>
          {renderContent()}
        </CMSLayout>
      </div>
    </div>
  );
}
