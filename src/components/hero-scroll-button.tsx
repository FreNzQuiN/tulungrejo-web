"use client";

import { ArrowRight } from "lucide-react";

export function HeroScrollButton() {
  return (
    <button
      onClick={() =>
        document
          .getElementById("about-section")
          ?.scrollIntoView({ behavior: "smooth" })
      }
      className="btn btn-primary"
    >
      Jelajahi Profil Desa <ArrowRight size={16} />
    </button>
  );
}
