"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import { Search, MapPin } from "lucide-react";
import type { CitizenView } from "@/lib/types";
import { DUSUN_LIST } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { AccessDenied } from "@/components/auth/access-denied";

const PBBMap = dynamic(
  () => import("@/components/pbb/pbb-map").then((m) => m.PBBMap),
  { ssr: false },
);

function PBBSkeleton() {
  return (
    <div className="pbb-layout">
      <div>
        <div className="glass-panel p-[15px] flex justify-end items-center mb-[15px]">
          <div className="flex gap-[15px]">
            <Skeleton className="h-3 w-24 rounded-full" />
            <Skeleton className="h-3 w-24 rounded-full" />
          </div>
        </div>
        <div
          className="glass-panel flex items-center justify-center"
          style={{ height: 400 }}
        >
          <div className="text-center">
            <Skeleton className="mx-auto mb-3 h-48 w-64 rounded-lg" />
            <Skeleton className="mx-auto h-4 w-40" />
          </div>
        </div>
      </div>
      <div className="map-control-panel">
        <div className="glass-panel p-5 flex flex-col gap-[15px]">
          <Skeleton className="h-10 w-full rounded" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Skeleton className="mb-1 h-3 w-12" />
              <Skeleton className="h-8 w-full rounded" />
            </div>
            <div>
              <Skeleton className="mb-1 h-3 w-16" />
              <Skeleton className="h-8 w-full rounded" />
            </div>
          </div>
        </div>
        <div className="citizen-scroll-list">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="citizen-card">
              <div className="citizen-card-header">
                <div className="flex-1">
                  <Skeleton className="mb-1 h-5 w-40" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <div className="citizen-detail-row">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-28" />
              </div>
              <div className="citizen-detail-row">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="citizen-card-footer">
                <Skeleton className="h-7 w-20 rounded" />
                <Skeleton className="h-7 w-28 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PBBPage() {
  const { data: session } = useSession();

  const [citizens, setCitizens] = useState<CitizenView[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [blokFilter, setBlokFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("Semua");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeCoords, setActiveCoords] = useState<[number, number] | null>(
    null,
  );
  const [toggling, setToggling] = useState<number | null>(null);

  useEffect(() => {
    if (session?.user?.role !== "pamong_pajak") return;
    fetch("/api/pbb/list")
      .then((r) => r.json())
      .then((data) => {
        setCitizens(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session]);

  async function togglePayment(citizen: CitizenView) {
    setToggling(citizen.id);
    const now = new Date();
    try {
      const res = await fetch("/api/pbb/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landPlotId: citizen.id,
          year: now.getFullYear(),
          month: now.getMonth() + 1,
        }),
      });
      if (res.ok) {
        setCitizens((prev) =>
          prev.map((c) =>
            c.id === citizen.id
              ? {
                  ...c,
                  status:
                    c.status === "Sudah Bayar" ? "Belum Bayar" : "Sudah Bayar",
                }
              : c,
          ),
        );
      }
    } finally {
      setToggling(null);
    }
  }

  const filtered = citizens.filter((c) => {
    if (blokFilter && c.dusun !== blokFilter) return false;
    if (statusFilter !== "Semua" && c.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) || c.sppt.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (!session || session.user?.role !== "pamong_pajak") {
    return (
      <AccessDenied message="Halaman ini hanya dapat diakses oleh petugas Pamong Desa." />
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header mb-8">
        <div className="container">
          <h1>Sistem Pemantauan PBB (Pajak Bumi & Bangunan)</h1>
          <p>
            Otoritas Petugas Pamong Desa: Visualisasi peta spasial, verifikasi
            pembayaran pajak, dan penandaan status wajib pajak warga
          </p>
        </div>
      </div>

      <div className="container">
        <div className="pbb-layout">
          <div>
            <div className="glass-panel p-[15px] flex justify-end items-center text-[13px] mb-[15px]">
              <div className="flex gap-[15px]">
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: "var(--color-success)" }}
                  ></span>
                  Sudah Bayar
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: "var(--color-danger)" }}
                  ></span>
                  Belum Bayar
                </span>
              </div>
            </div>
            {typeof window !== "undefined" && (
              <PBBMap
                citizens={citizens}
                selectedId={selectedId}
                onSelect={setSelectedId}
                activeCoords={activeCoords}
                setActiveCoords={setActiveCoords}
                onToggle={(id) => {
                  const r = citizens.find((r) => r.id === id);
                  if (r) togglePayment(r);
                }}
              />
            )}
          </div>

          <div className="map-control-panel">
            <div className="glass-panel p-5 flex flex-col gap-[15px]">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  placeholder="Cari Nama Wajib Pajak / Nomor SPPT..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-input pl-[38px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-muted-foreground block mb-1">
                    Dusun
                  </label>
                  <select
                    value={blokFilter ?? ""}
                    onChange={(e) => setBlokFilter(e.target.value || null)}
                    className="form-select px-3 py-2 text-xs"
                  >
                    <option value="">Semua Dusun</option>
                    {DUSUN_LIST.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-muted-foreground block mb-1">
                    Status Pajak
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="form-select px-3 py-2 text-xs"
                  >
                    <option value="Semua">Semua Status</option>
                    <option value="Sudah Bayar">Sudah Bayar</option>
                    <option value="Belum Bayar">Belum Bayar</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <PBBSkeleton />
            ) : (
              <div className="citizen-scroll-list">
                {filtered.length === 0 ? (
                  <div className="glass-panel p-8 text-center">
                    <p className="text-muted-foreground">
                      Tidak ada data warga ditemukan.
                    </p>
                  </div>
                ) : (
                  filtered.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedId(c.id)}
                      className={`citizen-card ${selectedId === c.id ? "citizen-card-active" : ""} cursor-pointer`}
                    >
                      <div className="citizen-card-header">
                        <div>
                          <h4>{c.name}</h4>
                          <span className="citizen-sppt">SPPT: {c.sppt}</span>
                        </div>
                        <span
                          className={`inline-block px-[10px] py-[4px] text-[11px] font-bold uppercase tracking-wider rounded-full ${c.status === "Sudah Bayar" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                          {c.status}
                        </span>
                      </div>

                      <div className="citizen-detail-row text-muted-foreground text-xs">
                        <span>Wilayah Dusun:</span>
                        <strong style={{ color: "var(--color-dark)" }}>
                          Dusun {c.dusun}
                        </strong>
                      </div>

                      <div className="citizen-detail-row text-muted-foreground text-xs">
                        <span>Kewajiban PBB:</span>
                        <strong className="text-dark-brown">
                          {formatCurrency(c.nominal)}
                        </strong>
                      </div>

                      <div className="citizen-card-footer">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveCoords([c.lat, c.lng]);
                          }}
                          className="btn btn-outline btn-sm px-2 py-1 text-[11px]"
                        >
                          <MapPin size={10} /> Fokus Peta
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePayment(c);
                          }}
                          disabled={toggling === c.id}
                          className="btn btn-primary btn-sm px-[10px] py-1 text-[11px]"
                          style={{
                            backgroundColor:
                              c.status === "Sudah Bayar"
                                ? "var(--color-danger)"
                                : "var(--color-success)",
                          }}
                        >
                          {toggling === c.id
                            ? "..."
                            : c.status === "Sudah Bayar"
                              ? "Tandai Belum Bayar"
                              : "Verifikasi Bayar"}
                        </button>
                      </div>
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
