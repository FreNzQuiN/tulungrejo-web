"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";

function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => isEqual(v, b[i]));
  }
  if (typeof a === "object" && typeof b === "object") {
    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    const aKeys = Object.keys(aObj);
    const bKeys = Object.keys(bObj);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((k) => isEqual(aObj[k], bObj[k]));
  }
  return false;
}

export interface CmsEditorState<T> {
  data: T;
  original: T | null;
  loading: boolean;
  saving: boolean;
  hasChanges: boolean;
  setData: React.Dispatch<React.SetStateAction<T>>;
  save: (
    body: unknown,
    successMsg: string,
    errorMsg: string,
  ) => Promise<boolean>;
  cancel: () => void;
}

export function useCmsEditor<T>(
  apiUrl: string,
  initialData: T,
  loadErrorMsg: string,
  transformResponse?: (raw: unknown) => T,
): CmsEditorState<T> {
  const [data, setData] = useState<T>(initialData);
  const [original, setOriginal] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(apiUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((raw: unknown) => {
        if (cancelled) return;
        const d = transformResponse ? transformResponse(raw) : (raw as T);
        setData(d);
        setOriginal(d);
      })
      .catch((err) => {
        console.error("useCmsEditor load error:", err);
        if (!cancelled) toast.error(loadErrorMsg);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [apiUrl, loadErrorMsg, transformResponse]);

  const hasChanges = useMemo(() => {
    if (!original) return false;
    return !isEqual(data, original);
  }, [data, original]);

  const save = useCallback(
    async (
      body: unknown,
      successMsg: string,
      errorMsg: string,
    ): Promise<boolean> => {
      setSaving(true);
      try {
        const res = await fetch(apiUrl, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const raw = await res.json();
          const updated = transformResponse
            ? transformResponse(raw)
            : (raw as T);
          setData(updated);
          setOriginal(updated);
          toast.success(successMsg);
          return true;
        } else {
          const err = await res.json();
          toast.error(err.error || errorMsg);
          return false;
        }
      } catch (err) {
        console.error("useCmsEditor save error:", err);
        toast.error(errorMsg);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [apiUrl, transformResponse],
  );

  const cancel = useCallback(() => {
    if (original) setData(original);
  }, [original]);

  return { data, original, loading, saving, hasChanges, setData, save, cancel };
}
