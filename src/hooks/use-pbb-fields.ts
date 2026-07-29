"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { type FieldView, PAYMENT_STATUS } from "@/lib/types";
import { toast } from "sonner";
import { getCurrentTaxYear } from "@/lib/pbb-tax-year";

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
  selectedYear: number;
  toggling: Set<string>;
  setSearch: (value: string) => void;
  setBlokFilter: (value: string) => void;
  setStatusFilter: (value: string) => void;
  setSelectedYear: (value: number) => void;
  setPage: (value: number) => void;
  togglePayment: (fieldId: string) => Promise<void>;
  refreshFields: () => void;
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
  const [selectedYear, setSelectedYearState] =
    useState<number>(getCurrentTaxYear());
  const [toggling, setToggling] = useState<Set<string>>(new Set());
  const togglingRef = useRef<Set<string>>(new Set());
  const [refreshKey, setRefreshKey] = useState(0);
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

  const setSelectedYear = useCallback((value: number) => {
    setSelectedYearState(value);
    setPageState(0);
  }, []);

  const setPage = useCallback((value: number) => {
    setPageState(value);
  }, []);

  const refreshFields = useCallback(() => {
    setRefreshKey((k) => k + 1);
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
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || "Gagal memuat data");
      }
      const body = await res.json();
      const items = Array.isArray(body) ? (body as FieldView[]) : body.data;
      setFields(Array.isArray(items) ? items : []);
      if (body.total != null) setTotal(body.total);
      if (body.tahun != null) {
        setSelectedYearState(body.tahun);
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

  const fetchRef = useRef(fetchFields);
  useEffect(() => {
    fetchRef.current = fetchFields;
  }, [fetchFields]);

  useEffect(() => {
    if (authLoading || !canAccess) return;
    fetchRef.current();
  }, [
    authLoading,
    canAccess,
    blokFilter,
    statusFilter,
    selectedYear,
    page,
    refreshKey,
  ]);

  useEffect(() => {
    if (authLoading || !canAccess) return;
    const id = setTimeout(() => fetchRef.current(), 300);
    return () => clearTimeout(id);
  }, [search, authLoading, canAccess]);

  async function togglePayment(fieldId: string) {
    if (togglingRef.current.has(fieldId)) return;
    // Validate year before setting any loading state
    if (selectedYear !== getCurrentTaxYear()) {
      toast.error("Hanya tahun berjalan yang dapat diubah.");
      return;
    }
    togglingRef.current.add(fieldId);
    setToggling((prev) => new Set(prev).add(fieldId));
    try {
      const res = await fetch("/api/pbb/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF": "1" },
        body: JSON.stringify({ fieldId, year: selectedYear }),
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
      togglingRef.current.delete(fieldId);
      setToggling((prev) => {
        const next = new Set(prev);
        next.delete(fieldId);
        return next;
      });
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
    refreshFields,
  };
}
