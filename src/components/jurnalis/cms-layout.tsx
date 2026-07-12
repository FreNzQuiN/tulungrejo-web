"use client";

import { FileText, BarChart3, Edit } from "lucide-react";

interface CMSLayoutProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

const TABS = [
  { id: "articles", label: "Kelola Artikel", icon: FileText },
  { id: "stats", label: "Kelola Statistik", icon: BarChart3 },
  { id: "profile", label: "Kelola Profil Desa", icon: Edit },
];

export function CMSLayout({
  activeTab,
  onTabChange,
  children,
}: CMSLayoutProps) {
  return (
    <div className="dashboard-layout">
      <aside className="cms-sidebar">
        <nav>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`cms-sidebar-btn ${activeTab === tab.id ? "cms-sidebar-btn-active" : ""}`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
      <main className="cms-content-card glass-panel">{children}</main>
    </div>
  );
}
