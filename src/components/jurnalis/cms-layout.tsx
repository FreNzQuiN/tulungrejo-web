"use client";

import { FileText, BarChart3, Edit, Phone, Home } from "lucide-react";

interface CMSLayoutProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

const TABS = [
  { id: "articles", label: "Kelola Artikel", icon: FileText },
  { id: "homepage", label: "Halaman Depan", icon: Home },
  { id: "stats", label: "Kelola Statistik", icon: BarChart3 },
  { id: "profile", label: "Kelola Profil Desa", icon: Edit },
  { id: "contact", label: "Kelola Kontak", icon: Phone },
];

export function CMSLayout({
  activeTab,
  onTabChange,
  children,
}: CMSLayoutProps) {
  return (
    <div className="dashboard-layout">
      <aside className="cms-sidebar">
        <nav aria-label="CMS Navigation" role="tablist">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`cms-sidebar-btn ${activeTab === tab.id ? "cms-sidebar-btn-active" : ""}`}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-current={activeTab === tab.id ? "page" : undefined}
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
