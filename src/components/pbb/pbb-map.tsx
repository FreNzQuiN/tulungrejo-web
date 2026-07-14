"use client";

import { useEffect, useRef } from "react";
import { formatCurrency } from "@/lib/utils";
import type { CitizenView } from "@/lib/types";

interface PBBMapProps {
  citizens: CitizenView[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  activeCoords: [number, number] | null;
  setActiveCoords: (coords: [number, number] | null) => void;
  onToggle: (id: number) => void;
}

export function PBBMap({
  citizens,
  selectedId,
  onSelect,
  activeCoords,
  setActiveCoords,
  onToggle,
}: PBBMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const LRef = useRef<typeof import("leaflet") | null>(null);
  const selectRef = useRef(onSelect);
  const toggleRef = useRef(onToggle);

  useEffect(() => {
    selectRef.current = onSelect;
  }, [onSelect]);
  useEffect(() => {
    toggleRef.current = onToggle;
  }, [onToggle]);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    let cancelled = false;

    async function init() {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !containerRef.current) return;

      LRef.current = L;

      const map = L.map(containerRef.current, {
        center: [-7.8207, 112.5262],
        zoom: 15,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
    }

    init();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !activeCoords) return;
    map.flyTo(activeCoords, 16, { duration: 1.2, easeLinearity: 0.25 });
  }, [activeCoords]);

  useEffect(() => {
    const map = mapRef.current;
    const L = LRef.current;
    if (!map || !L) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    citizens.forEach((c) => {
      if (!c.lat || !c.lng) return;

      const isPaid = c.status === "Sudah Bayar";
      const color = isPaid ? "var(--color-success)" : "var(--color-danger)";

      const icon = L.divIcon({
        html: `
          <div class="pbb-marker-wrapper">
            <div class="pbb-marker-pulse" style="background-color:${color}"></div>
            <div class="pbb-marker-dot" style="background-color:${color}"></div>
          </div>
        `,
        className: "custom-leaflet-pin",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([c.lat, c.lng], { icon });

      const nominalFormatted = formatCurrency(c.nominal);
      const popupHtml = `
        <div class="pbb-popup-body">
          <strong class="pbb-popup-name">${c.name}</strong><br/>
          <span class="pbb-popup-muted">SPPT: ${c.sppt}</span><br/>
          <span>Dusun: ${c.dusun}</span><br/>
          Status: <span style="color:${color};font-weight:bold">${c.status}</span><br/>
          <span>Nominal: ${nominalFormatted}</span><br/>
          <button id="popup-pbb-toggle-${c.id}" class="pbb-popup-btn">
            Ubah Status
          </button>
        </div>
      `;
      marker.bindPopup(popupHtml);

      marker.on("popupopen", () => {
        const btn = document.getElementById(`popup-pbb-toggle-${c.id}`);
        if (btn) btn.onclick = () => toggleRef.current(c.id);
      });

      marker.on("click", () => selectRef.current(c.id));
      marker.addTo(map);
      markersRef.current.push(marker);
    });

    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }, [citizens, selectedId]);

  return (
    <div ref={containerRef} className="leaflet-container w-full h-[500px]" />
  );
}
