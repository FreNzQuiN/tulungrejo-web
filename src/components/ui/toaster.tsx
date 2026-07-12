"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "bg-background border text-foreground shadow-lg",
          success: "border-green-500/50",
          error: "border-red-500/50",
          warning: "border-yellow-500/50",
          info: "border-blue-500/50",
        },
      }}
    />
  );
}
