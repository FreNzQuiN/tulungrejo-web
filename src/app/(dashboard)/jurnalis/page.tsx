"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { CMSLayout } from "@/components/jurnalis/cms-layout";
import { ArticleManager } from "@/components/jurnalis/article-manager";
import { StatsEditor } from "@/components/jurnalis/stats-editor";
import { ProfileEditor } from "@/components/jurnalis/profile-editor";
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
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
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
