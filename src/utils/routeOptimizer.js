/**
 * Haversine formula — great-circle distance between two lat/lng points in km.
 */
function haversine(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinLng * sinLng;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Nearest-neighbor heuristic for TSP.
 * Starts from startCoord and repeatedly visits the closest unvisited stop.
 *
 * @param {Array}  stops      — array of stop objects with a `coords: {lat, lng}` field
 * @param {Object} startCoord — {lat, lng} starting position
 * @returns {Array} reordered copy of stops
 */
export function nearestNeighbor(stops, startCoord) {
  if (stops.length <= 1) return [...stops];

  const unvisited = [...stops];
  const route = [];
  let current = startCoord;

  while (unvisited.length > 0) {
    let bestIdx = 0;
    let bestDist = haversine(current, unvisited[0].coords);

    for (let i = 1; i < unvisited.length; i++) {
      const d = haversine(current, unvisited[i].coords);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }

    const next = unvisited.splice(bestIdx, 1)[0];
    route.push(next);
    current = next.coords;
  }

  return route;
}

/**
 * Total route distance in km (for display / comparison).
 */
export function totalDistance(stops) {
  let km = 0;
  for (let i = 1; i < stops.length; i++) {
    km += haversine(stops[i - 1].coords, stops[i].coords);
  }
  return km;
}
