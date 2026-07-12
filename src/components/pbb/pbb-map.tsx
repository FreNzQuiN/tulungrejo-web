"use client";

import { useEffect, useRef } from "react";
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

  // Init map once
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

  // FlyTo when activeCoords changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !activeCoords) return;
    map.flyTo(activeCoords, 16, { duration: 1.2, easeLinearity: 0.25 });
  }, [activeCoords]);

  // Update markers when data or selection changes
  useEffect(() => {
    const map = mapRef.current;
    const L = LRef.current;
    if (!map || !L) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    citizens.forEach((c) => {
      if (!c.lat || !c.lng) return;

      const isPaid = c.status === "Sudah Bayar";
      const color = isPaid ? "#2E7D32" : "#C62828";

      // Custom divIcon with pulse animation matching FE design
      const icon = L.divIcon({
        html: `
          <div style="position:relative;display:flex;align-items:center;justify-content:center">
            <div style="
              position:absolute;
              background-color:${color};
              width:24px;height:24px;
              border-radius:50%;
              opacity:0.35;
              animation:pulse 1.5s infinite ease-in-out;
            "></div>
            <div style="
              background-color:${color};
              width:14px;height:14px;
              border-radius:50%;
              border:2px solid white;
              box-shadow:0 0 8px rgba(0,0,0,0.3);
              z-index:10;
            "></div>
          </div>
        `,
        className: "custom-leaflet-pin",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([c.lat, c.lng], { icon });

      const popupHtml = `
        <div style="min-width:200px;font-family:system-ui,sans-serif;font-size:14px">
          <strong style="font-size:16px">${c.name}</strong><br/>
          <span style="color:#666">SPPT: ${c.sppt}</span><br/>
          <span>Dusun: ${c.dusun}</span><br/>
          Status: <span style="color:${isPaid ? "#2E7D32" : "#C62828"};font-weight:bold">${c.status}</span><br/>
          <span>Nominal: Rp ${Number(c.nominal).toLocaleString("id-ID")}</span><br/>
          <button id="popup-pbb-toggle-${c.id}"
            style="margin-top:8px;padding:6px 14px;background:#062C30;color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;width:100%">
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

    // Fit bounds if markers exist
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }, [citizens, selectedId]);

  return (
    <div ref={containerRef} className="leaflet-container w-full h-[500px]" />
  );
}
