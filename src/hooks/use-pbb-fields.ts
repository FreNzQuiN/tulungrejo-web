"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { type FieldView, PAYMENT_STATUS } from "@/lib/types";
import { toast } from "sonner";

const PAGE_SIZE = 50;

export interface UsePbbFieldsReturn {
  fields: FieldView[];
  loading: boolean;
  total: number;
  page: number;
  totalPages: number;
  search: string;
  blokFilter: string;
  statusFilter: string;
  selectedYear: number | null;
  toggling: string | null;
  setSearch: (value: string) => void;
  setBlokFilter: (value: string) => void;
  setStatusFilter: (value: string) => void;
  setSelectedYear: (value: number | null) => void;
  setPage: (value: number) => void;
  togglePayment: (fieldId: string) => Promise<void>;
}

export function usePbbFields(
  canAccess: boolean,
  authLoading: boolean,
): UsePbbFieldsReturn {
  const [fields, setFields] = useState<FieldView[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPageState] = useState(0);
  const [search, setSearchState] = useState("");
  const [blokFilter, setBlokFilterState] = useState("");
  const [statusFilter, setStatusFilterState] = useState("");
  const [selectedYear, setSelectedYearState] = useState<number | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    setPageState(0);
  }, []);

  const setBlokFilter = useCallback((value: string) => {
    setBlokFilterState(value);
    setPageState(0);
  }, []);

  const setStatusFilter = useCallback((value: string) => {
    setStatusFilterState(value);
    setPageState(0);
  }, []);

  const setSelectedYear = useCallback((value: number | null) => {
    setSelectedYearState(value);
    setPageState(0);
  }, []);

  const setPage = useCallback((value: number) => {
    setPageState(value);
  }, []);

  const fetchFields = useCallback(async () => {
    if (!canAccess) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (blokFilter) params.set("blok", blokFilter);
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);
      if (selectedYear) params.set("tahun", String(selectedYear));
      params.set("take", String(PAGE_SIZE));
      params.set("skip", String(page * PAGE_SIZE));

      const res = await fetch(`/api/pbb/list?${params}`, {
        signal: controller.signal,
      });
      const body = await res.json();
      const items = Array.isArray(body) ? (body as FieldView[]) : body.data;
      setFields(Array.isArray(items) ? items : []);
      if (body.total != null) setTotal(body.total);
      if (body.tahun != null) {
        setSelectedYearState((prev) => prev ?? body.tahun);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      console.error("fetchFields error:", err);
      toast.error("Gagal memuat data. Periksa koneksi Anda.");
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [blokFilter, search, selectedYear, statusFilter, canAccess, page]);

  useEffect(() => {
    if (authLoading || !canAccess) return;
    const id = setTimeout(() => fetchFields(), 300);
    return () => clearTimeout(id);
  }, [authLoading, canAccess, blokFilter, statusFilter, search, fetchFields]);

  async function togglePayment(fieldId: string) {
    setToggling(fieldId);
    // Use server-compatible tax year calculation, not raw client Date
    const now = new Date();
    const mmdd = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const clientTaxYear =
      mmdd < "06-30" ? now.getFullYear() - 1 : now.getFullYear();
    const year = selectedYear ?? clientTaxYear;
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
                    (f.status === PAYMENT_STATUS.LUNAS
                      ? PAYMENT_STATUS.BELUM_LUNAS
                      : PAYMENT_STATUS.LUNAS),
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

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return {
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
  };
}
