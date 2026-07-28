"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, ZoomIn } from "lucide-react";

export function OrgChartImage({ src, alt }: { src: string; alt: string }) {
  const [zoomed, setZoomed] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!zoomed) return;

    const scrollY = window.scrollY;
    const body = document.body;
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomed(false);
    };
    document.addEventListener("keydown", handler);

    return () => {
      body.style.position = "";
      body.style.top = "";
      body.style.width = "";
      window.scrollTo(0, scrollY);
      document.removeEventListener("keydown", handler);
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
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[9999] bg-black/80"
            onClick={() => setZoomed(false)}
          >
            <button
              type="button"
              onClick={() => setZoomed(false)}
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
