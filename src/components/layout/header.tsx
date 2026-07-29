"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers";
import { NAV_ITEMS, DASHBOARD_NAV } from "@/lib/constants";
import { ROLE_DISPLAY, type UserRole } from "@/lib/types";
import { LogOut, User, Menu, X } from "lucide-react";

function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Header() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const role = user?.role as UserRole | undefined;
  const dashConfig = role ? DASHBOARD_NAV[role] : null;

  const focusableSelector =
    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), textarea, input, select';

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!mobileOpen) return;
      if (e.key === "Escape") {
        setMobileOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable =
        panelRef.current.querySelectorAll<HTMLElement>(focusableSelector);
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [mobileOpen],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="navbar-container">
      <div className="container navbar-inner">
        <Link href="/" className="navbar-brand">
          <div className="logo-badge">
            <Image
              src="/logo.png"
              alt=""
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

        <nav className="navbar-desktop" aria-label="Navigasi utama">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive(item.href, pathname) ? "nav-link-active" : ""}`}
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
                {role && (
                  <span className="text-[10px] opacity-70 block">
                    {ROLE_DISPLAY[role]}
                  </span>
                )}
              </div>
              <button
                onClick={() => signOut()}
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
          ref={toggleRef}
          className="navbar-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu-panel"
          aria-label={mobileOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div
          ref={panelRef}
          id="mobile-menu-panel"
          className="navbar-mobile-panel"
          aria-hidden={!mobileOpen}
        >
          <nav className="mobile-links" aria-label="Navigasi mobile">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`nav-link ${isActive(item.href, pathname) ? "nav-link-active" : ""}`}
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
                  onClick={() => signOut()}
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
                <User size={14} /> Masuk Portal
              </Link>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
