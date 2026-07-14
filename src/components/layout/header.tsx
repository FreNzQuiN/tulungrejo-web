"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { NAV_ITEMS, DASHBOARD_NAV } from "@/lib/constants";
import { ROLE_DISPLAY, type UserRole } from "@/lib/types";
import { LogOut, User, Menu, X } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = session?.user;
  const role = user?.role as UserRole | undefined;

  const dashConfig = role ? DASHBOARD_NAV[role] : null;

  return (
    <div className="navbar-container">
      <div className="container navbar-inner">
        <Link href="/" className="navbar-brand">
          <div className="logo-badge">
            <Image
              src="/logo.png"
              alt="Logo"
              className="logo-img"
              width={36}
              height={36}
              loading="eager"
              unoptimized
            />
          </div>
          <div>
            <span className="brand-title">DESA TULUNGREJO</span>
            <span className="brand-subtitle">Kec. Wates, Kab. Blitar</span>
          </div>
        </Link>

        <nav className="navbar-desktop">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${pathname === item.href ? "nav-link-active" : ""}`}
            >
              {item.label}
            </Link>
          ))}

          {user ? (
            <div className="user-nav-group">
              {dashConfig && (
                <Link
                  href={dashConfig.href}
                  className="btn btn-outline btn-sm font-semibold"
                >
                  <dashConfig.icon size={14} /> {dashConfig.label}
                </Link>
              )}
              <div className="user-profile-badge">
                <User size={14} />
                <span className="user-profile-name">{user.name}</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="btn-logout"
                title="Keluar"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn btn-primary btn-sm">
              <User size={14} /> Masuk Portal
            </Link>
          )}
        </nav>

        <button
          className="navbar-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="navbar-mobile-panel">
          <nav className="mobile-links">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`nav-link ${pathname === item.href ? "nav-link-active" : ""}`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mobile-divider" />
            {user ? (
              <div className="mobile-user-section">
                <div className="mobile-profile-info">
                  <User size={18} />
                  <span>
                    {user.name} ({role ? ROLE_DISPLAY[role].toUpperCase() : ""})
                  </span>
                </div>
                {dashConfig && (
                  <Link
                    href={dashConfig.href}
                    className="btn btn-outline btn-sm w-full mb-2"
                    onClick={() => setMobileOpen(false)}
                  >
                    <dashConfig.icon size={14} /> {dashConfig.label}
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="btn btn-primary w-full mt-2"
                >
                  <LogOut size={14} /> Keluar Sesi
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="btn btn-primary w-full"
                onClick={() => setMobileOpen(false)}
              >
                <User size={14} /> Masuk Portal Pamong
              </Link>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
