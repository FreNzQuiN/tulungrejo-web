"use client";

import { type FieldView, PAYMENT_STATUS } from "@/lib/types";

interface FieldCardProps {
  field: FieldView;
  isPamong: boolean;
  toggling: Set<string>;
  onToggle: (fieldId: string) => void;
}

export function FieldCard({
  field,
  isPamong,
  toggling,
  onToggle,
}: FieldCardProps) {
  return (
    <div className="citizen-card">
      <div className="citizen-card-header">
        <div>
          <h4>{field.ownerName}</h4>
          <span className="citizen-sppt">NOP: {field.nop}</span>
        </div>
        <span
          className={`inline-block px-[10px] py-[4px] text-[11px] font-bold uppercase tracking-wider rounded-full ${
            field.status === PAYMENT_STATUS.LUNAS
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {field.status === PAYMENT_STATUS.LUNAS ? "Lunas" : "Belum Lunas"}
        </span>
      </div>

      <div className="citizen-detail-row text-muted-foreground text-xs">
        <span>Blok / Dusun:</span>
        <strong style={{ color: "var(--color-dark)" }}>
          Blok {field.blok} / {field.dusun}
        </strong>
      </div>

      <div className="citizen-detail-row text-muted-foreground text-xs">
        <span>Luas Tanah:</span>
        <strong style={{ color: "var(--color-dark)" }}>
          {field.landArea != null ? `${field.landArea} m²` : "-"}
        </strong>
      </div>

      {field.buildingArea != null && (
        <div className="citizen-detail-row text-muted-foreground text-xs">
          <span>Luas Bangunan:</span>
          <strong style={{ color: "var(--color-dark)" }}>
            {field.buildingArea} m²
          </strong>
        </div>
      )}

      {isPamong && (
        <div className="citizen-card-footer">
          <button
            onClick={() => onToggle(field.id)}
            disabled={toggling.has(field.id)}
            className="btn btn-primary btn-sm px-[10px] py-1 text-[11px]"
            style={{
              backgroundColor:
                field.status === PAYMENT_STATUS.LUNAS
                  ? "var(--color-danger)"
                  : "var(--color-success)",
            }}
            aria-busy={toggling.has(field.id)}
            aria-label={
              field.status === PAYMENT_STATUS.LUNAS
                ? "Tandai Belum Bayar"
                : "Verifikasi Bayar"
            }
          >
            {toggling.has(field.id)
              ? "..."
              : field.status === PAYMENT_STATUS.LUNAS
                ? "Tandai Belum Bayar"
                : "Verifikasi Bayar"}
          </button>
        </div>
      )}
    </div>
  );
}
