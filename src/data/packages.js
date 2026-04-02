// Mock package database keyed by barcode
export const PACKAGE_DB = {
  "PKG-001": {
    id: "PKG-001",
    recipient: "Alice Johnson",
    address: "123 Main St",
    city: "New York",
    coords: { lat: 40.7128, lng: -74.006 },
    weight: "2.3 kg",
    notes: "",
  },
  "PKG-002": {
    id: "PKG-002",
    recipient: "Bob Smith",
    address: "456 Elm Ave",
    city: "New York",
    coords: { lat: 40.7282, lng: -73.9942 },
    weight: "0.8 kg",
    notes: "Leave at door",
  },
  "PKG-003": {
    id: "PKG-003",
    recipient: "Carol White",
    address: "789 Oak Blvd",
    city: "New York",
    coords: { lat: 40.7489, lng: -73.9680 },
    weight: "5.1 kg",
    notes: "Ring bell twice",
  },
  "PKG-004": {
    id: "PKG-004",
    recipient: "David Brown",
    address: "321 Pine Rd",
    city: "New York",
    coords: { lat: 40.7614, lng: -73.9776 },
    weight: "1.2 kg",
    notes: "",
  },
  "PKG-005": {
    id: "PKG-005",
    recipient: "Eve Davis",
    address: "654 Cedar Ln",
    city: "New York",
    coords: { lat: 40.7549, lng: -74.0018 },
    weight: "3.4 kg",
    notes: "Fragile",
  },
};

export const STATUS = {
  PENDING: "pending",
  DELIVERED: "delivered",
  NO_ONE_HOME: "no_one_home",
  RETURN: "return",
};

export const STATUS_LABEL = {
  [STATUS.PENDING]: "Pending",
  [STATUS.DELIVERED]: "Delivered",
  [STATUS.NO_ONE_HOME]: "No One Home",
  [STATUS.RETURN]: "Return",
};

export const STATUS_COLOR = {
  [STATUS.PENDING]: "#6366f1",
  [STATUS.DELIVERED]: "#22c55e",
  [STATUS.NO_ONE_HOME]: "#f97316",
  [STATUS.RETURN]: "#ef4444",
};
