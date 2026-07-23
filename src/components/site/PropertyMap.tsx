import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { createRoot, type Root } from "react-dom/client";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { formatPrice } from "@/lib/currency";

export type MapProperty = {
  id: string;
  slug: string;
  title: string;
  lat: number | null;
  lng: number | null;
  price_per_night: number | string;
  cover_image_url?: string | null;
  location?: string | null;
};

export function PropertyMap({
  properties,
  currency = "AED",
  height = "100%",
  activeId = null,
}: {
  properties: MapProperty[];
  currency?: string;
  height?: number | string;
  activeId?: string | null;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const popupRootsRef = useRef<Root[]>([]);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const setHoverRef = useRef<Record<string, (on: boolean) => void>>({});

  const valid = properties.filter(
    (p) => Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lng)),
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([25.2048, 55.2708], 11);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    return () => {
      popupRootsRef.current.forEach((r) => {
        try { r.unmount(); } catch {}
      });
      popupRootsRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });
    popupRootsRef.current.forEach((r) => {
      try { r.unmount(); } catch {}
    });
    popupRootsRef.current = [];

    if (valid.length === 0) return;

    const bounds = L.latLngBounds([]);

    valid.forEach((p) => {
      const lat = Number(p.lat);
      const lng = Number(p.lng);
      const safeTitle = p.title.replace(/</g, "&lt;");
      const icon = L.divIcon({
        className: "",
        html: `<div class="pm-pill" style="background:#fff;border-radius:9999px;padding:6px 14px;font-size:13px;font-weight:600;color:#111;box-shadow:0 4px 14px rgba(0,0,0,0.18);border:1px solid rgba(0,0,0,0.06);white-space:nowrap;transition:background .15s ease,color .15s ease;cursor:pointer;"><span class="pm-pill-label">View</span><span class="pm-pill-name" style="display:none;max-width:180px;overflow:hidden;text-overflow:ellipsis;">${safeTitle}</span></div>`,
        iconSize: [64, 30],
        iconAnchor: [32, 15],
      });
      const marker = L.marker([lat, lng], { icon }).addTo(map);
      const setHover = (on: boolean) => {
        const el = marker.getElement();
        if (!el) return;
        const pill = el.querySelector<HTMLElement>(".pm-pill");
        const label = el.querySelector<HTMLElement>(".pm-pill-label");
        const name = el.querySelector<HTMLElement>(".pm-pill-name");
        if (pill) {
          pill.style.background = on ? "#111" : "#fff";
          pill.style.color = on ? "#fff" : "#111";
          pill.style.zIndex = on ? "1000" : "auto";
        }
        if (label) label.style.display = on ? "none" : "inline";
        if (name) name.style.display = on ? "inline-block" : "none";
      };
      marker.on("mouseover", () => { setHover(true); marker.openPopup(); });
      marker.on("mouseout", () => { setHover(false); });

      const popupEl = document.createElement("div");
      const root = createRoot(popupEl);
      popupRootsRef.current.push(root);
      root.render(
        <Link
          to="/properties/$slug"
          params={{ slug: p.slug }}
          style={{ display: "block", width: 220, textDecoration: "none", color: "inherit" }}
        >
          {p.cover_image_url ? (
            <img
              src={p.cover_image_url}
              alt={p.title}
              style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8 }}
            />
          ) : null}
          <div style={{ marginTop: 8, fontWeight: 600, fontSize: 14, lineHeight: 1.3 }}>
            {p.title}
          </div>
          {p.location ? (
            <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{p.location}</div>
          ) : null}
          <div style={{ marginTop: 6, fontSize: 13, fontWeight: 600 }}>
            {formatPrice(Number(p.price_per_night), currency)}{" "}
            <span style={{ fontWeight: 400, color: "#666" }}>/ night</span>
          </div>
        </Link>,
      );
      marker.bindPopup(popupEl, { minWidth: 220, closeButton: true });
      bounds.extend([lat, lng]);
    });

    if (valid.length === 1) {
      map.setView(bounds.getCenter(), 13);
    } else {
      map.fitBounds(bounds.pad(0.2));
    }
  }, [JSON.stringify(valid.map((p) => [p.id, p.lat, p.lng])), currency]);

  if (valid.length === 0) {
    return (
      <div
        className="grid place-items-center rounded-2xl border border-border bg-muted/40 text-sm text-muted-foreground"
        style={{ height }}
      >
        Map location not set
      </div>
    );
  }

  return <div ref={containerRef} style={{ height, width: "100%" }} className="rounded-2xl overflow-hidden" />;
}

export default PropertyMap;
