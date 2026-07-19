"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Loader2,
  AlertCircle,
  ImageOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface BlockImage {
  subBlok: string;
  image: string;
  mimeType: string;
}

interface BlokViewerProps {
  blok: string;
}

type DataState =
  | { status: "success"; images: BlockImage[]; dusun: string | null }
  | { status: "error"; message: string }
  | { status: "empty" };

export function BlokViewer({ blok }: BlokViewerProps) {
  const [data, setData] = useState<DataState | null>(null);
  const [currentBlok, setCurrentBlok] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState<number | null>(null);
  const isLoading = !!blok && currentBlok !== blok;
  const isIdle = !blok;

  useEffect(() => {
    if (!blok) return;
    const controller = new AbortController();

    Promise.resolve().then(() => {
      setCurrentIndex(0);
      setZoomLevel(null);
    });

    fetch(`/api/pbb/blok/${blok}`, { signal: controller.signal })
      .then(async (res) => {
        if (controller.signal.aborted) return;
        if (!res.ok) {
          const body = await res.json().catch((e) => {
            console.error("BlokViewer JSON parse error:", e);
            return {} as Record<string, unknown>;
          });
          if (res.status === 404) {
            setData({ status: "empty" });
          } else {
            setData({
              status: "error",
              message: body.error || `Gagal memuat gambar (${res.status}).`,
            });
          }
          return;
        }
        const body = await res.json();
        if (!controller.signal.aborted) {
          setData({
            status: "success",
            images: body.images,
            dusun: body.dusun,
          });
        }
      })
      .catch((err) => {
        console.error("BlokViewer fetch error:", err);
        if (!controller.signal.aborted)
          setData({ status: "error", message: "Gagal terhubung ke server." });
      })
      .finally(() => {
        if (!controller.signal.aborted) setCurrentBlok(blok);
      });

    return () => {
      controller.abort();
    };
  }, [blok]);

  useEffect(() => {
    if (zoomLevel === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setZoomLevel(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomLevel]);

  if (isIdle) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-gray-400">
        <ImageOff size={40} />
        <p className="mt-2 text-sm">Pilih blok untuk melihat peta</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-12">
        <Loader2 size={32} className="animate-spin text-blue-500" />
        <p className="mt-2 text-sm text-gray-500">Memuat gambar...</p>
      </div>
    );
  }

  if (data?.status === "error") {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8 text-red-600">
        <AlertCircle size={32} />
        <p className="mt-2 text-sm">{data.message}</p>
      </div>
    );
  }

  if (data?.status === "empty") {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-8 text-gray-400">
        <ImageOff size={32} />
        <p className="mt-2 text-sm">Belum ada gambar untuk blok ini</p>
      </div>
    );
  }

  const images = data?.images ?? [];
  const currentImage = images[currentIndex]!;

  const isZoomed = zoomLevel !== null;

  function toggleZoom() {
    setZoomLevel((v) => (v === null ? 150 : null));
  }

  function zoomIn() {
    setZoomLevel((v) => (v !== null ? Math.min(300, v + 25) : 150));
  }

  function zoomOut() {
    setZoomLevel((v) => (v !== null ? Math.max(100, v - 25) : 150));
  }

  function goToImage(index: number) {
    setCurrentIndex(index);
    setZoomLevel(null);
  }

  function handlePrev() {
    goToImage(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  }

  function handleNext() {
    goToImage(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  }

  if (images.length === 0) {
    return (
      <p className="text-center text-sm text-gray-400">
        Tidak ada gambar untuk blok ini
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-100">
      <div
        className={`relative ${
          isZoomed
            ? "max-h-[75vh] overflow-auto cursor-zoom-out"
            : "overflow-hidden cursor-zoom-in"
        }`}
      >
        <div
          onClick={toggleZoom}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") toggleZoom();
          }}
          role="button"
          tabIndex={0}
          className={isZoomed ? "inline-block min-w-full" : ""}
        >
          <Image
            src={currentImage.image}
            alt={`Blok ${blok}${currentImage.subBlok}`}
            width={0}
            height={0}
            sizes="100vw"
            className={isZoomed ? "max-w-none h-auto" : "w-full h-auto"}
            style={isZoomed ? { width: `${zoomLevel}%` } : undefined}
            unoptimized
          />
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-sm transition-colors hover:bg-white"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-sm transition-colors hover:bg-white"
            >
              <ChevronRight size={20} />
            </button>
            <div className="pointer-events-none absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/50 px-2.5 py-0.5 text-xs text-white">
              {currentIndex + 1}/{images.length}
            </div>
          </>
        )}
      </div>

      {isZoomed && (
        <div className="flex items-center justify-center gap-1 border-t border-gray-200 bg-gray-50 px-3 py-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              zoomOut();
            }}
            disabled={zoomLevel! <= 100}
            className="flex h-6 w-6 items-center justify-center rounded text-sm font-bold hover:bg-gray-200 disabled:opacity-30"
          >
            −
          </button>
          <span className="min-w-[38px] text-center text-xs font-semibold tabular-nums">
            {zoomLevel}%
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              zoomIn();
            }}
            disabled={zoomLevel! >= 300}
            className="flex h-6 w-6 items-center justify-center rounded text-sm font-bold hover:bg-gray-200 disabled:opacity-30"
          >
            +
          </button>
        </div>
      )}

      <div className="border-t border-gray-200 bg-gray-50 px-3 py-1.5 text-center text-xs font-medium text-gray-600">
        Blok {blok}
        {currentImage.subBlok}
      </div>
    </div>
  );
}
