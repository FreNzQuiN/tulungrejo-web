"use client";

import { ArrowRight } from "lucide-react";

export function HeroScrollButton() {
  return (
    <button
      type="button"
      onClick={() => {
        const section = document.getElementById("about-section");
        if (section) {
          section.scrollIntoView({ behavior: "smooth" });
          section.focus({ preventScroll: true });
        }
      }}
      className="btn btn-primary"
      aria-label="Gulir ke bagian profil desa"
    >
      Jelajahi Profil Desa <ArrowRight size={16} />
    </button>
  );
}
