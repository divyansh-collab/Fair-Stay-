import React, { useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ─── Leaflet Icon Configuration ───────────────────────────────────────────────
// Fix default Leaflet icon paths broken by bundlers using high-availability CDN assets
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom FairStay Coral Pin (Zero image dependencies, 100% reliable)
const customStayPin = L.divIcon({
  className: "fairstay-map-pin",
  html: `
    <div style="background-color: #ff5a5f; color: #ffffff; border: 3px solid #ffffff; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(0,0,0,0.3); font-size: 1.25rem; cursor: pointer; transition: transform 0.2s ease;">
      🏡
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  popupAnchor: [0, -22],
});

// ─── Auto-Resizer Component ───────────────────────────────────────────────────
// Solves the infamous Leaflet "grey tiles" bug when container bounds calculate asynchronously
function MapResizer({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2) {
      map.setView(center, map.getZoom());
    }
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 500);
    const t3 = setTimeout(() => map.invalidateSize(), 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [center, map]);
  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ListingMap({ listing }) {
  // GeoJSON stores coordinates as [longitude, latitude] -> convert to [latitude, longitude] for Leaflet
  const center = useMemo(() => {
    try {
      const coords = listing?.geometry?.coordinates;
      if (
        !Array.isArray(coords) ||
        coords.length < 2 ||
        typeof coords[0] !== "number" ||
        typeof coords[1] !== "number"
      ) {
        return [25.3176, 82.9739]; // Default to Varanasi ghats if coordinates missing
      }
      return [coords[1], coords[0]]; // [lat, lng]
    } catch {
      return [25.3176, 82.9739];
    }
  }, [listing]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          height: 340,
          width: "100%",
          borderRadius: 16,
          overflow: "hidden",
          position: "relative",
          border: "1px solid var(--border-light, #e2e8f0)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%", zIndex: 0 }}
        >
          <MapResizer center={center} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={center} icon={customStayPin}>
            <Popup>
              <div style={{ minWidth: 160, padding: 4 }}>
                <strong style={{ display: "block", fontSize: "0.95rem", color: "#0f172a", marginBottom: 4 }}>
                  {listing?.title || "Verified Stay"}
                </strong>
                <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block", marginBottom: 6 }}>
                  📍 {listing?.location || "India"}
                </span>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#ff5a5f" }}>
                  ₹{listing?.price?.toLocaleString("en-IN")}/night • FairSafe Verified
                </span>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Note below map */}
      <p
        style={{
          margin: 0,
          fontSize: 13,
          color: "var(--text-muted, #94a3b8)",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span>📍</span>
        <span>Exact neighborhood provided after booking for guest & host privacy</span>
      </p>
    </div>
  );
}
