import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function BarcodeScanner({ onScan, onError }) {
  const [active, setActive] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const scannerRef = useRef(null);
  const divId = "qr-reader";

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode(divId);
      scannerRef.current = html5QrCode;
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        (decodedText) => {
          onScan(decodedText.trim());
        },
        () => {} // ignore verbose scan errors
      );
      setActive(true);
    } catch (err) {
      onError?.("Camera not available: " + err.message);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (_) {}
      scannerRef.current = null;
    }
    setActive(false);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const handleManual = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode("");
    }
  };

  return (
    <div className="scanner-panel">
      <h2 className="panel-title">Scan Package</h2>

      <div id={divId} className={active ? "qr-box active" : "qr-box"} />

      <div className="scanner-controls">
        {!active ? (
          <button className="btn btn-primary" onClick={startScanner}>
            Start Camera
          </button>
        ) : (
          <button className="btn btn-secondary" onClick={stopScanner}>
            Stop Camera
          </button>
        )}
      </div>

      <div className="manual-entry">
        <span className="divider-label">or enter barcode manually</span>
        <form onSubmit={handleManual} className="manual-form">
          <input
            className="input"
            type="text"
            placeholder="e.g. PKG-001"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">
            Add
          </button>
        </form>
      </div>
    </div>
  );
}
