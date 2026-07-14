"use client";

import { useEffect } from "react";
import { toast } from "sonner";

interface ArticlesErrorProps {
  message?: string;
}

export function ArticlesError({
  message = "Gagal memuat berita desa",
}: ArticlesErrorProps) {
  useEffect(() => {
    toast.error(`${message}. Coba refresh halaman.`);
  }, [message]);
  return null;
}
