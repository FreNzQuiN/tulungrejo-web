"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ArticlesErrorProps {
  message?: string;
}

export function ArticlesError({
  message = "Gagal memuat artikel",
}: ArticlesErrorProps) {
  useEffect(() => {
    toast.error(message);
  }, [message]);

  return (
    <div className="glass-panel p-[50px] text-center mb-[60px]" role="alert">
      <div className="flex flex-col items-center gap-4">
        <AlertCircle size={32} className="text-red-500" />
        <p className="text-[16px] text-muted-foreground">{message}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-outline btn-sm"
        >
          <RefreshCw size={14} /> Muat Ulang
        </button>
      </div>
    </div>
  );
}
