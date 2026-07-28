"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center" role="alert">
        <h1 className="text-6xl font-bold text-muted-foreground">500</h1>
        <p className="text-muted-foreground mt-4">Terjadi kesalahan</p>
        <p className="text-muted-foreground/60 text-sm mt-2">
          Silakan coba lagi nanti
        </p>
        <Button variant="default" className="mt-6" onClick={() => reset()}>
          Coba Lagi
        </Button>
      </div>
    </div>
  );
}
