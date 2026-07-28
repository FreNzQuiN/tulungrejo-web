"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Key, Mail, AlertCircle } from "lucide-react";

const ROLE_REDIRECTS: Record<string, string> = {
  kepala_desa: "/kepala-desa",
  pamong_pajak: "/pbb",
  jurnalis: "/jurnalis",
};

interface DemoAccount {
  label: string;
  email: string;
  password: string;
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([]);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    fetch("/api/auth/demo-accounts")
      .then((res) => res.json())
      .then((data) => setDemoAccounts(data))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Email dan kata sandi wajib diisi.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      setLoading(false);
      const data = await res.json().catch(() => ({}));
      if (data.error?.includes("RATE_LIMITED")) {
        setError("Terlalu banyak percobaan gagal. Coba lagi dalam 15 menit.");
      } else {
        setError("Email atau kata sandi salah. Silakan coba kembali.");
      }
      return;
    }

    if (callbackUrl) {
      try {
        const url = new URL(callbackUrl, window.location.origin);
        if (url.origin === window.location.origin) {
          window.location.href = url.pathname + url.search;
        } else {
          window.location.href = "/";
        }
      } catch {
        window.location.href = "/";
      }
      return;
    }

    const data = await res.json();
    const role = data?.role as string | undefined;
    window.location.href = ROLE_REDIRECTS[role ?? ""] ?? "/";
  }

  return (
    <div className="login-section">
      <div className="login-card glass-panel">
        <div className="login-header">
          <h2 className="text-dark-brown">Portal Layanan Internal</h2>
          <p>Silakan masuk menggunakan kredensial akun Anda</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group relative mb-5">
            <label className="block mb-2 text-sm font-semibold">
              Alamat Email
            </label>
            <input
              type="email"
              placeholder="contoh@tulungrejo.desa.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input form-input--login w-full pl-4 pr-10 py-3"
              required
              autoComplete="email"
            />
            <Mail
              size={16}
              aria-hidden="true"
              className="absolute right-4 bottom-[14px] text-muted-foreground"
            />
            <Mail
              size={16}
              className="absolute right-4 bottom-[14px] text-muted-foreground"
            />
          </div>

          <div className="form-group relative mb-6">
            <label className="block mb-2 text-sm font-semibold">
              Kata Sandi
            </label>
            <input
              type="password"
              placeholder="Masukkan kata sandi..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input form-input--login w-full pl-4 pr-10 py-3"
              required
              autoComplete="current-password"
            />
            <Key
              size={16}
              aria-hidden="true"
              className="absolute right-4 bottom-[14px] text-muted-foreground"
            />
            <Key
              size={16}
              className="absolute right-4 bottom-[14px] text-muted-foreground"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="w-full flex items-center gap-2 rounded px-[14px] py-[10px] mb-5 bg-red-100 text-red-700 text-sm font-semibold"
            >
              <AlertCircle size={14} aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {process.env.NODE_ENV !== "production" && (
            <div className="admin-desc-box">
              <strong className="block mb-2 text-dark-brown">
                Akun Demo / Prototype:
              </strong>
              <div className="flex flex-col gap-2">
                {demoAccounts.map((acc) => (
                  <div
                    key={acc.label}
                    onClick={() => {
                      setEmail(acc.email);
                      setPassword(acc.password);
                      setError("");
                    }}
                    title="Klik untuk mengisi otomatis"
                    className="demo-credential-item demo-credential-card cursor-pointer px-3 py-2 text-xs flex justify-between items-center"
                  >
                    <div>
                      <span className="font-bold text-dark-brown">
                        {acc.label}:
                      </span>{" "}
                      {acc.email}
                    </div>
                    <code className="demo-password-badge px-1.5 py-0.5 rounded font-semibold">
                      {acc.password}
                    </code>
                  </div>
                ))}
              </div>
              <small className="block mt-[10px] text-muted-foreground italic text-[11px]">
                * Tips: Klik salah satu akun di atas untuk mengisi formulir
                secara otomatis.
              </small>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-3 text-[15px] font-bold"
          >
            {loading ? "Memproses..." : "Masuk Sistem"}
          </button>
        </form>
      </div>
    </div>
  );
}
