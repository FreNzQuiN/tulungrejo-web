"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ContactInfo } from "@/lib/types";
import { CONTACT_INFO as FALLBACK_CONTACT } from "@/lib/desa-data";
import { MapPin, Mail, Phone, Clock } from "lucide-react";

const FOOTER_LINKS = [
  { label: "Beranda Utama", href: "/" },
  { label: "Profil Wilayah & Visi Misi", href: "/profil-desa" },
  { label: "Kabar & Publikasi Artikel", href: "/artikel" },
  { label: "Akses Sistem Internal", href: "/login" },
];

export function Footer() {
  const tahun = new Date().getFullYear();
  const [contact, setContact] = useState<ContactInfo | null>(null);

  useEffect(() => {
    const cached = sessionStorage.getItem("footer-contact");
    const cachedTime = sessionStorage.getItem("footer-contact-time");

    if (
      cached &&
      cachedTime &&
      Date.now() - Number(cachedTime) < 5 * 60 * 1000
    ) {
      try {
        setContact(JSON.parse(cached));
        return;
      } catch {
        /* fall through to fetch */
      }
    }

    const abortController = new AbortController();

    fetch("/api/contact", { signal: abortController.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ContactInfo | null) => {
        if (data) {
          setContact(data);
          sessionStorage.setItem("footer-contact", JSON.stringify(data));
          sessionStorage.setItem("footer-contact-time", String(Date.now()));
        }
      })
      .catch(() => {});

    return () => abortController.abort();
  }, []);

  const c = contact ?? FALLBACK_CONTACT;

  return (
    <footer className="footer-container">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand-col">
            <div className="footer-logo">
              <div className="footer-logo-badge">
                <Image
                  src="/logo.png"
                  alt="Logo Tulungrejo"
                  className="logo-img"
                  width={32}
                  height={32}
                  unoptimized
                />
              </div>
              <h3>PEMERINTAH DESA TULUNGREJO</h3>
            </div>
            <p className="footer-desc">
              Website Pusat informasi kegiatan dan Administrasi Pemerintahan
              Desa Tulungrejo, Kecamatan Wates, Kabupaten Blitar. Berkomitmen
              mewujudkan pembangunan desa yang berkelanjutan dan akuntabel.
            </p>
            <a
              href={`https://www.google.com/maps?q=${encodeURIComponent(c.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-coordinates"
            >
              <MapPin size={14} />
              <span>Balai Desa Tulungrejo, Wates, Kab. Blitar</span>
            </a>
          </div>

          <div className="footer-links-col">
            <h4>Navigasi Portal</h4>
            <ul>
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-contact-col">
            <h4>Hubungi Kami</h4>
            <ul className="contact-list">
              <li>
                <MapPin size={16} className="contact-icon" />
                <span>{c.address}</span>
              </li>
              <li>
                <Phone size={16} className="contact-icon" />
                <a href={`tel:${c.phone}`} className="text-inherit">
                  {c.phone}
                </a>
              </li>
              <li>
                <Mail size={16} className="contact-icon" />
                <a href={`mailto:${c.email}`} className="text-inherit">
                  {c.email}
                </a>
              </li>
              <li>
                <Clock size={16} className="contact-icon" />
                <span>
                  {c.jamKerja}
                  <br />
                  <span className="text-xs opacity-70">{c.jamLibur}</span>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>
            &copy; {tahun} Pemerintah Desa Tulungrejo | Dibuat dengan sepenuh
            hati oleh Tim MMD Filkom 19.
          </p>
        </div>
      </div>
    </footer>
  );
}
