"use client";

import Link from "next/link";
import Image from "next/image";
import { CONTACT_INFO } from "@/lib/desa-data";
import { MapPin, Mail, Phone, Clock } from "lucide-react";

const FOOTER_LINKS = [
  { label: "Beranda Utama", href: "/" },
  { label: "Profil Wilayah & Visi Misi", href: "/profil-desa" },
  { label: "Kabar & Publikasi Artikel", href: "/artikel" },
  { label: "Akses Sistem Internal", href: "/login" },
];

export function Footer() {
  const tahun = new Date().getFullYear();

  return (
    <footer className="footer-container">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Column */}
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
              href="https://maps.app.goo.gl/8pmYVyobaWnepjNF8"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-coordinates"
            >
              <MapPin size={14} />
              <span>Balai Desa Tulungrejo, Wates, Kab. Blitar</span>
            </a>
          </div>

          {/* Quick Links */}
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

          {/* Contact Info */}
          <div className="footer-contact-col">
            <h4>Hubungi Kami</h4>
            <ul className="contact-list">
              <li>
                <MapPin size={16} className="contact-icon" />
                <span>{CONTACT_INFO.address}</span>
              </li>
              <li>
                <Phone size={16} className="contact-icon" />
                <a href={`tel:${CONTACT_INFO.phone}`} className="text-inherit">
                  {CONTACT_INFO.phone}
                </a>
              </li>
              <li>
                <Mail size={16} className="contact-icon" />
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="text-inherit"
                >
                  {CONTACT_INFO.email}
                </a>
              </li>
              <li>
                <Clock size={16} className="contact-icon" />
                <span>
                  {CONTACT_INFO.jamKerja}
                  <br />
                  <span className="text-xs opacity-70">
                    {CONTACT_INFO.jamLibur}
                  </span>
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
