// Mock package database keyed by barcode — addresses in Holon, Israel
export const PACKAGE_DB = {
  "PKG-001": {
    id: "PKG-001",
    recipient: "דוד לוי",
    address: "רחוב סוקולוב 15",
    city: "חולון",
    coords: { lat: 32.0147, lng: 34.7729 },
    weight: "2.3 ק\"ג",
    notes: "",
  },
  "PKG-002": {
    id: "PKG-002",
    recipient: "רחל כהן",
    address: "רחוב ז'בוטינסקי 8",
    city: "חולון",
    coords: { lat: 32.0086, lng: 34.7733 },
    weight: "0.8 ק\"ג",
    notes: "להשאיר ליד הדלת",
  },
  "PKG-003": {
    id: "PKG-003",
    recipient: "משה גולדברג",
    address: "שדרות בן גוריון 42",
    city: "חולון",
    coords: { lat: 32.0133, lng: 34.7826 },
    weight: "5.1 ק\"ג",
    notes: "לצלצל פעמיים",
  },
  "PKG-004": {
    id: "PKG-004",
    recipient: "שרה אברהם",
    address: "רחוב ויצמן 23",
    city: "חולון",
    coords: { lat: 32.0192, lng: 34.7768 },
    weight: "1.2 ק\"ג",
    notes: "",
  },
  "PKG-005": {
    id: "PKG-005",
    recipient: "יוסף מזרחי",
    address: "שדרות גולדה מאיר 5",
    city: "חולון",
    coords: { lat: 32.0050, lng: 34.7787 },
    weight: "3.4 ק\"ג",
    notes: "שביר",
  },
};

export const STATUS = {
  PENDING: "pending",
  DELIVERED: "delivered",
  NO_ONE_HOME: "no_one_home",
  RETURN: "return",
};

export const STATUS_LABEL = {
  en: {
    [STATUS.PENDING]: "Pending",
    [STATUS.DELIVERED]: "Delivered",
    [STATUS.NO_ONE_HOME]: "No One Home",
    [STATUS.RETURN]: "Return",
  },
  he: {
    [STATUS.PENDING]: "ממתין",
    [STATUS.DELIVERED]: "נמסר",
    [STATUS.NO_ONE_HOME]: "אין מענה",
    [STATUS.RETURN]: "החזרה",
  },
};

export const STATUS_COLOR = {
  [STATUS.PENDING]: "#6366f1",
  [STATUS.DELIVERED]: "#22c55e",
  [STATUS.NO_ONE_HOME]: "#f97316",
  [STATUS.RETURN]: "#ef4444",
};
