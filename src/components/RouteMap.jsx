import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { STATUS_COLOR, STATUS } from "../data/packages";

// Fix default marker icon paths broken by Vite bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function makeIcon(color, index) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 26 16 26S32 26 32 16C32 7.163 24.837 0 16 0z"
        fill="${color}" stroke="white" stroke-width="2"/>
      <text x="16" y="21" text-anchor="middle" fill="white"
        font-family="Arial,sans-serif" font-size="13" font-weight="bold">${index}</text>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -44],
  });
}

function FitBounds({ stops }) {
  const map = useMap();
  useEffect(() => {
    if (stops.length === 0) return;
    const bounds = L.latLngBounds(stops.map((s) => [s.coords.lat, s.coords.lng]));
    map.fitBounds(bounds, { padding: [60, 60] });
  }, [stops.map(s => s.id).join(",")]);
  return null;
}

// Fetch actual road geometry from OSRM (free, no API key needed)
async function fetchRoadGeometry(stops) {
  if (stops.length < 2) return null;
  const coords = stops.map((s) => `${s.coords.lng},${s.coords.lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code !== "Ok" || !data.routes?.[0]) return null;
    // OSRM returns [lng, lat]; Leaflet needs [lat, lng]
    return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  } catch {
    return null;
  }
}

export default function RouteMap({ stops, activeIndex, onSelectStop }) {
  const [roadPath, setRoadPath] = useState([]);

  // Re-fetch road geometry whenever stop order or set changes
  useEffect(() => {
    if (stops.length < 2) {
      setRoadPath([]);
      return;
    }
    const stopKey = stops.map((s) => s.id).join(",");
    let cancelled = false;

    const timer = setTimeout(async () => {
      const path = await fetchRoadGeometry(stops);
      if (!cancelled) {
        // Fall back to straight lines if OSRM fails
        setRoadPath(path ?? stops.map((s) => [s.coords.lat, s.coords.lng]));
      }
    }, 400); // debounce — don't spam OSRM while scanning rapidly

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [stops.map((s) => s.id).join(",")]);

  const center =
    stops.length > 0
      ? [stops[0].coords.lat, stops[0].coords.lng]
      : [40.73, -73.99];

  return (
    <MapContainer center={center} zoom={13} className="map-container">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Real road route */}
      {roadPath.length > 1 && (
        <Polyline positions={roadPath} color="#6366f1" weight={4} opacity={0.75} />
      )}

      {/* Numbered markers — index reflects current order (updates on reorder) */}
      {stops.map((stop, idx) => (
        <Marker
          key={stop.id}
          position={[stop.coords.lat, stop.coords.lng]}
          icon={makeIcon(
            STATUS_COLOR[stop.status] || STATUS_COLOR[STATUS.PENDING],
            idx + 1
          )}
          eventHandlers={{ click: () => onSelectStop(idx) }}
          zIndexOffset={idx === activeIndex ? 1000 : 0}
        >
          <Popup>
            <div className="popup">
              <strong>#{idx + 1} — {stop.recipient}</strong>
              <div>{stop.address}</div>
              <div className="popup-status" style={{ color: STATUS_COLOR[stop.status] }}>
                {stop.statusLabel}
              </div>
              {stop.notes && <div className="popup-notes">{stop.notes}</div>}
            </div>
          </Popup>
        </Marker>
      ))}

      {stops.length > 0 && <FitBounds stops={stops} />}
    </MapContainer>
  );
}
