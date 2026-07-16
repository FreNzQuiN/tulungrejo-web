"use client";

import { BLOK_TO_DUSUN } from "@/lib/constants";

const BLOK_OPTIONS = Object.entries(BLOK_TO_DUSUN).map(([blok, dusun]) => ({
  value: blok,
  label: `Blok ${blok} (${dusun})`,
}));

interface BlokSelectorProps {
  value: string;
  onChange: (blok: string) => void;
}

export function BlokSelector({ value, onChange }: BlokSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
    >
      <option value="">— Pilih Blok —</option>
      {BLOK_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
