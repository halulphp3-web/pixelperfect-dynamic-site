type Point = { lat: number; lng: number };

export function MapEmbed({
  points,
  height = 360,
  zoomDelta = 0.02,
}: {
  points: Point[];
  height?: number;
  zoomDelta?: number;
}) {
  const valid = points.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
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
  const lats = valid.map((p) => p.lat);
  const lngs = valid.map((p) => p.lng);
  const minLat = Math.min(...lats) - zoomDelta;
  const maxLat = Math.max(...lats) + zoomDelta;
  const minLng = Math.min(...lngs) - zoomDelta;
  const maxLng = Math.max(...lngs) + zoomDelta;
  const marker = valid[0];
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}&layer=mapnik&marker=${marker.lat}%2C${marker.lng}`;
  return (
    <iframe
      title="Map"
      src={src}
      loading="lazy"
      className="w-full rounded-2xl border border-border bg-muted"
      style={{ height }}
    />
  );
}
