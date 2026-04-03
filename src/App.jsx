import { useState, useCallback } from "react";
import BarcodeScanner from "./components/BarcodeScanner";
import RouteMap from "./components/RouteMap";
import RouteList from "./components/RouteList";
import Toast from "./components/Toast";
import { PACKAGE_DB, STATUS, STATUS_LABEL } from "./data/packages";
import { nearestNeighbor, totalDistance } from "./utils/routeOptimizer";
import { STRINGS } from "./i18n";
import { playSuccess, playError } from "./utils/sounds";
import "leaflet/dist/leaflet.css";
import "./App.css";

export default function App() {
  const [stops, setStops] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [toast, setToast] = useState(null);
  const [view, setView] = useState("map");
  const [lang, setLang] = useState("he"); // default Hebrew since addresses are Israeli

  const t = STRINGS[lang];
  const statusLabel = STATUS_LABEL[lang];

  const showToast = (message, type = "info") => {
    setToast({ message, type, key: Date.now() });
  };

  const handleScan = useCallback((barcode) => {
    if (stops.find((s) => s.id === barcode)) {
      playError();
      showToast(t.alreadyInRoute(barcode), "warning");
      return;
    }
    const pkg = PACKAGE_DB[barcode];
    if (!pkg) {
      playError();
      showToast(t.unknownBarcode(barcode), "error");
      return;
    }
    playSuccess();
    const newStop = { ...pkg, status: STATUS.PENDING, statusLabel: statusLabel[STATUS.PENDING] };
    setStops((prev) => {
      const updated = [...prev, newStop];
      const startCoord = updated[0].coords;
      const optimized = nearestNeighbor(updated, startCoord);
      const km = totalDistance(optimized).toFixed(1);
      setActiveIndex(optimized.findIndex((s) => s.id === newStop.id));
      showToast(t.added(pkg.recipient, km), "success");
      return optimized;
    });
    setView("map");
  }, [stops, t, statusLabel]);

  const handleStatusChange = useCallback((id, newStatus) => {
    setStops((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: newStatus, statusLabel: statusLabel[newStatus] }
          : s
      )
    );
    showToast(t.statusUpdated(statusLabel[newStatus]), "success");
  }, [t, statusLabel]);

  const handleReorder = useCallback((reordered) => {
    setStops(reordered);
  }, []);

  const handleSelectStop = useCallback((idx) => {
    setActiveIndex(idx);
    setView("map");
  }, []);

  const handleOptimize = useCallback(() => {
    if (stops.length < 2) return;
    const startCoord = stops[0].coords;
    const optimized = nearestNeighbor(stops, startCoord);
    const km = totalDistance(optimized).toFixed(1);
    setStops(optimized);
    showToast(t.optimized(km), "success");
  }, [stops, t]);

  // Sync statusLabel text when language changes
  const handleLangToggle = useCallback(() => {
    const next = lang === "en" ? "he" : "en";
    const nextLabel = STATUS_LABEL[next];
    setStops((prev) => prev.map((s) => ({ ...s, statusLabel: nextLabel[s.status] })));
    setLang(next);
  }, [lang]);

  const isRtl = lang === "he";

  return (
    <div className="app" dir={isRtl ? "rtl" : "ltr"}>
      <header className="header">
        <div className="header__logo">
          <TruckIcon />
          <span>{t.appTitle}</span>
        </div>
        <nav className="header__nav">
          <button
            className={`nav-btn ${view === "scanner" ? "nav-btn--active" : ""}`}
            onClick={() => setView("scanner")}
          >
            <ScanIcon /> {t.navScan}
          </button>
          <button
            className={`nav-btn ${view === "map" ? "nav-btn--active" : ""}`}
            onClick={() => setView("map")}
          >
            <MapIcon /> {t.navMap}
          </button>
          <button
            className={`nav-btn ${view === "list" ? "nav-btn--active" : ""}`}
            onClick={() => setView("list")}
          >
            <ListIcon /> {t.navRoute} ({stops.length})
          </button>
          <button className="nav-btn lang-toggle" onClick={handleLangToggle}>
            {lang === "en" ? "עב" : "EN"}
          </button>
        </nav>
      </header>

      <main className="main">
        {view === "scanner" && (
          <div className="panel">
            <BarcodeScanner
              t={t}
              onScan={handleScan}
              onError={(msg) => showToast(t.cameraError(msg), "error")}
            />
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
              <div className="map-overlay-hint">{t.mapHint}</div>
            )}
          </div>
        )}

        {view === "list" && (
          <div className="panel">
            <RouteList
              t={t}
              stops={stops}
              activeIndex={activeIndex}
              onReorder={handleReorder}
              onSelect={handleSelectStop}
              onStatusChange={handleStatusChange}
              onOptimize={handleOptimize}
            />
          </div>
        )}
      </main>

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
