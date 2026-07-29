"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, ZoomIn } from "lucide-react";

export function OrgChartImage({ src, alt }: { src: string; alt: string }) {
  const [zoomed, setZoomed] = useState(false);
  const [scale, setScale] = useState(1);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!zoomed) return;

    document.body.style.overflow = "hidden";

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomed(false);
    };
    document.addEventListener("keydown", handler);

    const focusableSelector =
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), textarea, input, select';
    const dialog = dialogRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    requestAnimationFrame(() => {
      if (!dialog) return;
      const first = dialog.querySelector<HTMLElement>(focusableSelector);
      first?.focus();
    });

    const trapFocus = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !dialog) return;
      const focusable = dialog.querySelectorAll<HTMLElement>(focusableSelector);
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
    };
    document.addEventListener("keydown", trapFocus);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handler);
      document.removeEventListener("keydown", trapFocus);
      previouslyFocused?.focus();
    };
  }, [zoomed]);

  return (
    <>
      <div
        className="relative cursor-pointer group"
        onClick={() => {
          setZoomed(true);
          setScale(1);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setZoomed(true);
            setScale(1);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`${alt} — Klik untuk memperbesar`}
      >
        <Image
          src={src}
          alt={alt}
          width={800}
          height={500}
          className="w-full h-auto object-contain rounded-lg border"
          unoptimized
        />
        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1.5 rounded-full flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn size={14} />
          Klik untuk memperbesar
        </div>
      </div>

      {zoomed &&
        createPortal(
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Struktur Organisasi — Tampilan Diperbesar"
            className="fixed inset-0 z-[9999] bg-black/80"
            onClick={() => setZoomed(false)}
          >
            <button
              type="button"
              onClick={() => setZoomed(false)}
              aria-label="Tutup tampilan diperbesar"
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"
            >
              <X size={28} />
            </button>
            <div className="w-full h-full flex items-center justify-center p-6">
              <Image
                src={src}
                alt={alt}
                width={1200}
                height={800}
                className="max-w-full max-h-full w-auto h-auto object-contain cursor-default transition-transform duration-200"
                style={{ transform: `scale(${scale})` }}
                unoptimized
                onClick={(e) => e.stopPropagation()}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setScale((s) => (s === 1 ? 2 : 1));
                }}
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
