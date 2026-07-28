"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/providers";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { BlokSelector } from "@/components/pbb/blok-selector";
import { BlokViewer } from "@/components/pbb/blok-viewer";
import { ImportButton } from "@/components/pbb/import-button";
import { FieldCard } from "@/components/pbb/field-card";
import { usePbbFields } from "@/hooks/use-pbb-fields";
import { PAYMENT_STATUS } from "@/lib/types";
import { BLOK_TO_DUSUN } from "@/lib/constants";
import { getYearOptions } from "@/lib/pbb-tax-year";
import { AccessDenied } from "@/components/auth/access-denied";

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

  const [selectedBlok, setSelectedBlok] = useState("");

  const {
    fields,
    loading,
    total,
    page,
    totalPages,
    search,
    blokFilter,
    statusFilter,
    selectedYear,
    toggling,
    setSearch,
    setBlokFilter,
    setStatusFilter,
    setSelectedYear,
    setPage,
    togglePayment,
  } = usePbbFields(canAccess, authLoading);

  // Sync selectedBlok ↔ blokFilter bidirectionally
  const prevBlokFilter = useRef(blokFilter);
  const prevSelectedBlok = useRef(selectedBlok);

  useEffect(() => {
    if (prevBlokFilter.current !== blokFilter) {
      prevBlokFilter.current = blokFilter;
      prevSelectedBlok.current = blokFilter;
      setSelectedBlok(blokFilter);
    } else if (prevSelectedBlok.current !== selectedBlok) {
      prevSelectedBlok.current = selectedBlok;
      setBlokFilter(selectedBlok);
    }
  }, [blokFilter, selectedBlok]);

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

            {selectedYear && (
              <div className="glass-panel p-3 flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase text-muted-foreground">
                  Tahun Pajak
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="form-select px-3 py-1.5 text-xs w-auto min-w-[90px]"
                >
                  {getYearOptions(selectedYear).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
                    <option value={PAYMENT_STATUS.LUNAS}>Lunas</option>
                    <option value={PAYMENT_STATUS.BELUM_LUNAS}>
                      Belum Lunas
                    </option>
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
                    <FieldCard
                      key={f.id}
                      field={f}
                      isPamong={isPamong}
                      toggling={toggling}
                      onToggle={togglePayment}
                    />
                  ))
                )}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-1 py-3">
                <span className="text-xs text-muted-foreground">
                  {total} bidang
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 0}
                    className="btn btn-outline btn-sm px-2 py-1 text-xs"
                  >
                    <ChevronLeft size={14} />
                    Sebelumnya
                  </button>
                  <span className="text-xs text-muted-foreground">
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages - 1}
                    className="btn btn-outline btn-sm px-2 py-1 text-xs"
                  >
                    Selanjutnya
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
