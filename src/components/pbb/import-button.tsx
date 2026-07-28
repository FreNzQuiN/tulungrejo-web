"use client";

import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ImportButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File terlalu besar. Maksimal 10 MB.");
      e.target.value = "";
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/pbb/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Gagal mengimpor file.");
        return;
      }

      const parts: string[] = [];
      if (data.fields?.inserted > 0)
        parts.push(`${data.fields.inserted} bidang baru`);
      if (data.fields?.updated > 0)
        parts.push(`${data.fields.updated} bidang diperbarui`);
      if (data.realisasi?.inserted > 0) parts.push("realisasi diperbarui");

      if (parts.length > 0) {
        toast.success(`Import berhasil: ${parts.join(", ")}.`);
      } else {
        toast.success("Import selesai.");
      }

      if (data.errors?.length > 0) {
        toast.warning(`${data.errors.length} error ditemukan.`);
      }
    } catch (err) {
      console.error("Import error:", err);
      toast.error("Gagal mengimpor file. Coba lagi.");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFile}
        className="hidden"
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="btn btn-primary btn-sm flex items-center gap-1.5"
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Upload size={14} />
        )}
        {loading ? "Mengimpor..." : "Import Excel"}
      </button>
    </>
  );
}
