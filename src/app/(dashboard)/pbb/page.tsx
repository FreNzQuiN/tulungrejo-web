"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/providers";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { BlokSelector } from "@/components/pbb/blok-selector";
import { BlokViewer } from "@/components/pbb/blok-viewer";
import { ImportButton } from "@/components/pbb/import-button";
import type { FieldView } from "@/lib/types";
import { AccessDenied } from "@/components/auth/access-denied";
import { BLOK_TO_DUSUN } from "@/lib/constants";
import { toast } from "sonner";

const BLOK_FILTER_OPTIONS = [
  { value: "", label: "Semua Blok" },
  ...Object.entries(BLOK_TO_DUSUN).map(([blok, dusun]) => ({
    value: blok,
    label: `${blok} (${dusun})`,
  })),
];

function ListSkeleton() {
  return (
    <div className="citizen-scroll-list">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="citizen-card">
          <div className="citizen-card-header">
            <div className="flex-1">
              <Skeleton className="mb-1 h-5 w-44" />
              <Skeleton className="h-3 w-36" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="citizen-detail-row">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="citizen-detail-row">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div
            className="citizen-card-footer"
            style={{ justifyContent: "flex-end" }}
          >
            <Skeleton className="h-7 w-28 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PBBPage() {
  const { user: sessionUser, isLoading: authLoading } = useAuth();
  const role = sessionUser?.role;
  const isPamong = role === "pamong_pajak";
  const isKades = role === "kepala_desa";
  const canAccess = isPamong || isKades;

  const [fields, setFields] = useState<FieldView[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [blokFilter, setBlokFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedBlok, setSelectedBlok] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchFields = useCallback(async () => {
    if (!canAccess) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (blokFilter) params.set("blok", blokFilter);
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/pbb/list?${params}`);
      const body = await res.json();
      const items = Array.isArray(body) ? (body as FieldView[]) : body.data;
      setFields(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("fetchFields error:", err);
      toast.error("Gagal memuat data. Periksa koneksi Anda.");
    } finally {
      setLoading(false);
    }
  }, [blokFilter, statusFilter, search, canAccess]);

  useEffect(() => {
    if (authLoading || !canAccess) return;
    const id = setTimeout(() => fetchFields(), 300);
    return () => clearTimeout(id);
  }, [authLoading, canAccess, blokFilter, statusFilter, search, fetchFields]);

  async function togglePayment(fieldId: string) {
    setToggling(fieldId);
    const year = new Date().getFullYear();
    try {
      const res = await fetch("/api/pbb/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fieldId, year }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setFields((prev) =>
          prev.map((f) =>
            f.id === fieldId
              ? {
                  ...f,
                  status:
                    data.status ??
                    (f.status === "lunas" ? "belum_lunas" : "lunas"),
                }
              : f,
          ),
        );
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Gagal mengubah status pembayaran.");
      }
    } catch (err) {
      console.error("togglePayment error:", err);
      toast.error("Gagal mengubah status pembayaran.");
    } finally {
      setToggling(null);
    }
  }

  if (authLoading) {
    return <ListSkeleton />;
  }

  if (!sessionUser || !canAccess) {
    return (
      <AccessDenied message="Halaman ini hanya dapat diakses oleh petugas Pamong dan Kepala Desa." />
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header mb-8">
        <div className="container">
          <h1>Sistem Pemantauan PBB (Pajak Bumi & Bangunan)</h1>
          <p>
            {isPamong
              ? "Kelola data bidang, verifikasi pembayaran pajak, dan pantau peta blok."
              : "Pantau realisasi pembayaran Pajak Bumi & Bangunan desa."}
          </p>
        </div>
      </div>

      <div className="container">
        <div className="pbb-layout">
          <div className="flex flex-col gap-4">
            <div className="glass-panel p-4">
              <label className="mb-1.5 block text-[11px] font-bold uppercase text-muted-foreground">
                Pilih Blok
              </label>
              <BlokSelector value={selectedBlok} onChange={setSelectedBlok} />
            </div>
            <BlokViewer blok={selectedBlok} />
          </div>

          <div className="map-control-panel">
            <div className="glass-panel p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-[13px]">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-700" />
                  Lunas
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-700" />
                  Belum
                </span>
              </div>
              {isPamong && <ImportButton />}
            </div>

            <div className="glass-panel p-4 flex flex-col gap-3">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  placeholder="Cari Nama / NOP..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-input pl-[38px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase text-muted-foreground">
                    Blok
                  </label>
                  <select
                    value={blokFilter}
                    onChange={(e) => setBlokFilter(e.target.value)}
                    className="form-select px-3 py-2 text-xs"
                  >
                    {BLOK_FILTER_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase text-muted-foreground">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="form-select px-3 py-2 text-xs"
                  >
                    <option value="">Semua Status</option>
                    <option value="lunas">Lunas</option>
                    <option value="belum_lunas">Belum Lunas</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <ListSkeleton />
            ) : (
              <div className="citizen-scroll-list">
                {fields.length === 0 ? (
                  <div className="glass-panel p-8 text-center">
                    <p className="text-muted-foreground">
                      Tidak ada data bidang ditemukan.
                    </p>
                  </div>
                ) : (
                  fields.map((f) => (
                    <div key={f.id} className="citizen-card">
                      <div className="citizen-card-header">
                        <div>
                          <h4>{f.ownerName}</h4>
                          <span className="citizen-sppt">NOP: {f.nop}</span>
                        </div>
                        <span
                          className={`inline-block px-[10px] py-[4px] text-[11px] font-bold uppercase tracking-wider rounded-full ${
                            f.status === "lunas"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {f.status === "lunas" ? "Lunas" : "Belum Lunas"}
                        </span>
                      </div>

                      <div className="citizen-detail-row text-muted-foreground text-xs">
                        <span>Blok / Dusun:</span>
                        <strong style={{ color: "var(--color-dark)" }}>
                          Blok {f.blok} / {f.dusun}
                        </strong>
                      </div>

                      <div className="citizen-detail-row text-muted-foreground text-xs">
                        <span>Luas Tanah:</span>
                        <strong style={{ color: "var(--color-dark)" }}>
                          {f.landArea ? `${f.landArea} m²` : "-"}
                        </strong>
                      </div>

                      {f.buildingArea != null && (
                        <div className="citizen-detail-row text-muted-foreground text-xs">
                          <span>Luas Bangunan:</span>
                          <strong style={{ color: "var(--color-dark)" }}>
                            {f.buildingArea} m²
                          </strong>
                        </div>
                      )}

                      {isPamong && (
                        <div className="citizen-card-footer">
                          <button
                            onClick={() => togglePayment(f.id)}
                            disabled={toggling === f.id}
                            className="btn btn-primary btn-sm px-[10px] py-1 text-[11px]"
                            style={{
                              backgroundColor:
                                f.status === "lunas"
                                  ? "var(--color-danger)"
                                  : "var(--color-success)",
                            }}
                          >
                            {toggling === f.id
                              ? "..."
                              : f.status === "lunas"
                                ? "Tandai Belum Bayar"
                                : "Verifikasi Bayar"}
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
