import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon paths broken by bundlers
L.Icon.Default.mergeOptions({
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href,
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).href,
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).href,
});

// ─── Placeholder ──────────────────────────────────────────────────────────────

function MapPlaceholder({ message = "Map unavailable" }) {
  return (
    <div
      style={{
        height: 320,
        borderRadius: 16,
        background: "#e2e8f0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        color: "#64748b",
        fontSize: 15,
      }}
    >
      <span style={{ fontSize: 36 }}>🗺️</span>
      <span>{message}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ListingMap({ listing }) {
  // geometry.coordinates is [lng, lat] — flip to [lat, lng] for Leaflet
  const center = useMemo(() => {
    try {
      const coords = listing?.geometry?.coordinates;
      if (
        !Array.isArray(coords) ||
        coords.length < 2 ||
        typeof coords[0] !== "number" ||
        typeof coords[1] !== "number"
      ) {
        return null;
      }
      return [coords[1], coords[0]]; // [lat, lng]
    } catch {
      return null;
    }
  }, [listing]);

  if (!center) {
    return <MapPlaceholder message="Location not available" />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        style={{
          height: 320,
          borderRadius: 16,
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center}>
          <Popup>
            <div style={{ minWidth: 140 }}>
              <strong style={{ display: "block", marginBottom: 4 }}>
                {listing?.title || "Listing"}
              </strong>
              <span style={{ fontSize: 13, color: "#64748b" }}>
                {listing?.location || ""}
              </span>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Note below map */}
      <p
        style={{
          margin: 0,
          fontSize: 13,
          color: "#94a3b8",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span>📍</span>
        <span>Exact location provided after booking</span>
      </p>
    </div>
  );
}
