"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Loader2, AlertCircle, ImageOff } from "lucide-react";

interface BlockImage {
  subBlok: string;
  image: string;
  mimeType: string;
}

interface BlokViewerProps {
  blok: string;
}

type ViewState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; images: BlockImage[]; dusun: string | null }
  | { status: "error"; message: string }
  | { status: "empty" };

export function BlokViewer({ blok }: BlokViewerProps) {
  const [state, setState] = useState<ViewState>({ status: "idle" });

  useEffect(() => {
    if (!blok) return;

    let cancelled = false;
    setState({ status: "loading" });

    fetch(`/api/pbb/blok/${blok}`)
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          if (res.status === 404) {
            setState({ status: "empty" });
          } else {
            setState({
              status: "error",
              message: data.error || `Gagal memuat gambar (${res.status}).`,
            });
          }
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setState({
            status: "success",
            images: data.images,
            dusun: data.dusun,
          });
        }
      })
      .catch(() => {
        if (!cancelled)
          setState({ status: "error", message: "Gagal terhubung ke server." });
      });

    return () => {
      cancelled = true;
    };
  }, [blok]);

  if (!blok || state.status === "idle") {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-gray-400">
        <ImageOff size={40} />
        <p className="mt-2 text-sm">Pilih blok untuk melihat peta</p>
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-12">
        <Loader2 size={32} className="animate-spin text-blue-500" />
        <p className="mt-2 text-sm text-gray-500">Memuat gambar...</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8 text-red-600">
        <AlertCircle size={32} />
        <p className="mt-2 text-sm">{state.message}</p>
      </div>
    );
  }

  if (state.status === "empty") {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-8 text-gray-400">
        <ImageOff size={32} />
        <p className="mt-2 text-sm">Belum ada gambar untuk blok ini</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {state.images.map((img) => (
          <div
            key={img.subBlok}
            className="overflow-hidden rounded-lg border border-gray-200"
          >
            <div className="relative aspect-4/3 bg-gray-100">
              <Image
                src={img.image}
                alt={`Blok ${blok}${img.subBlok}`}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="border-t border-gray-200 bg-gray-50 px-3 py-1.5 text-center text-xs font-medium text-gray-600">
              Blok {blok}
              {img.subBlok}
            </div>
          </div>
        ))}
      </div>
      {state.images.length === 0 && (
        <p className="text-center text-sm text-gray-400">
          Tidak ada gambar untuk blok ini
        </p>
      )}
    </div>
  );
}
