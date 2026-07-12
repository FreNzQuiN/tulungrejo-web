"use client";

import { ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

interface AccessDeniedProps {
  message: string;
}

export function AccessDenied({ message }: AccessDeniedProps) {
  const router = useRouter();

  return (
    <div className="animate-fade-in">
      <div className="container min-h-[70vh] flex justify-center items-center py-10">
        <div className="glass-panel text-center max-w-[500px] p-10">
          <div
            className="inline-flex p-3 rounded-full mb-5"
            style={{
              color: "var(--color-danger)",
              backgroundColor: "var(--color-danger-bg)",
            }}
          >
            <ShieldAlert size={36} />
          </div>
          <h2 className="text-dark-brown text-[24px] mb-3">Akses Ditolak</h2>
          <p className="footer-desc text-muted-foreground mb-6">{message}</p>
          <button
            onClick={() => router.push("/login")}
            className="btn btn-primary"
          >
            Masuk Portal Kredensial
          </button>
        </div>
      </div>
    </div>
  );
}
