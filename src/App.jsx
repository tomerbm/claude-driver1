import { useState, useCallback } from "react";
import BarcodeScanner from "./components/BarcodeScanner";
import RouteMap from "./components/RouteMap";
import RouteList from "./components/RouteList";
import Toast from "./components/Toast";
import { PACKAGE_DB, STATUS, STATUS_LABEL } from "./data/packages";
import "leaflet/dist/leaflet.css";
import "./App.css";

export default function App() {
  const [stops, setStops] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [toast, setToast] = useState(null);
  const [view, setView] = useState("map"); // "map" | "scanner" | "list"

  const showToast = (message, type = "info") => {
    setToast({ message, type, key: Date.now() });
  };

  const handleScan = useCallback((barcode) => {
    if (stops.find((s) => s.id === barcode)) {
      showToast(`Package ${barcode} is already in the route.`, "warning");
      return;
    }
    const pkg = PACKAGE_DB[barcode];
    if (!pkg) {
      showToast(`Unknown barcode: ${barcode}`, "error");
      return;
    }
    const newStop = { ...pkg, status: STATUS.PENDING, statusLabel: STATUS_LABEL[STATUS.PENDING] };
    setStops((prev) => {
      const updated = [...prev, newStop];
      setActiveIndex(updated.length - 1);
      return updated;
    });
    showToast(`Added: ${pkg.recipient} — ${pkg.address}`, "success");
    setView("map");
  }, [stops]);

  const handleStatusChange = useCallback((id, newStatus) => {
    setStops((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: newStatus, statusLabel: STATUS_LABEL[newStatus] }
          : s
      )
    );
    showToast(`Status updated to "${STATUS_LABEL[newStatus]}"`, "success");
  }, []);

  const handleReorder = useCallback((reordered) => {
    setStops(reordered);
  }, []);

  const handleSelectStop = useCallback((idx) => {
    setActiveIndex(idx);
    setView("map");
  }, []);

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header__logo">
          <TruckIcon />
          <span>Driver Route</span>
        </div>
        <nav className="header__nav">
          <button
            className={`nav-btn ${view === "scanner" ? "nav-btn--active" : ""}`}
            onClick={() => setView("scanner")}
          >
            <ScanIcon /> Scan
          </button>
          <button
            className={`nav-btn ${view === "map" ? "nav-btn--active" : ""}`}
            onClick={() => setView("map")}
          >
            <MapIcon /> Map
          </button>
          <button
            className={`nav-btn ${view === "list" ? "nav-btn--active" : ""}`}
            onClick={() => setView("list")}
          >
            <ListIcon /> Route ({stops.length})
          </button>
        </nav>
      </header>

      {/* Main content */}
      <main className="main">
        {view === "scanner" && (
          <div className="panel">
            <BarcodeScanner onScan={handleScan} onError={(msg) => showToast(msg, "error")} />
          </div>
        )}

        {view === "map" && (
          <div className="map-view">
            <RouteMap
              stops={stops}
              activeIndex={activeIndex}
              onSelectStop={handleSelectStop}
            />
            {stops.length === 0 && (
              <div className="map-overlay-hint">
                Scan barcodes to add delivery stops to your route
              </div>
            )}
          </div>
        )}

        {view === "list" && (
          <div className="panel">
            <RouteList
              stops={stops}
              activeIndex={activeIndex}
              onReorder={handleReorder}
              onSelect={handleSelectStop}
              onStatusChange={handleStatusChange}
            />
          </div>
        )}
      </main>

      {/* Toast */}
      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

function TruckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <path d="M16 8h4l3 5v3h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function ScanIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}
