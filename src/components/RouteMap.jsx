import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { STATUS_COLOR, STATUS } from "../data/packages";
import { useEffect } from "react";

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
  }, [stops]);
  return null;
}

export default function RouteMap({ stops, activeIndex, onSelectStop }) {
  const center = stops.length > 0
    ? [stops[0].coords.lat, stops[0].coords.lng]
    : [40.73, -73.99];

  const polylinePoints = stops.map((s) => [s.coords.lat, s.coords.lng]);

  return (
    <MapContainer center={center} zoom={13} className="map-container">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {stops.length > 1 && (
        <Polyline positions={polylinePoints} color="#6366f1" weight={3} dashArray="8 6" />
      )}
      {stops.map((stop, idx) => (
        <Marker
          key={stop.id}
          position={[stop.coords.lat, stop.coords.lng]}
          icon={makeIcon(STATUS_COLOR[stop.status] || STATUS_COLOR[STATUS.PENDING], idx + 1)}
          eventHandlers={{ click: () => onSelectStop(idx) }}
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
