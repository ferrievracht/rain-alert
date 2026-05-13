export type GridBounds = {
  west: number;
  south: number;
  east: number;
  north: number;
};

export const defaultDutchRadarBounds: GridBounds = {
  west: 3.0,
  south: 50.6,
  east: 7.5,
  north: 53.8
};

export function parseBounds(value?: string): GridBounds {
  if (!value) return defaultDutchRadarBounds;
  const parts = value.split(",").map((item) => Number(item.trim()));
  if (parts.length !== 4 || parts.some((item) => !Number.isFinite(item))) {
    return defaultDutchRadarBounds;
  }
  const [west, south, east, north] = parts;
  return { west, south, east, north };
}

export function isValidLatLon(latitude: number, longitude: number) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export function isInsideBounds(latitude: number, longitude: number, bounds: GridBounds) {
  return (
    latitude >= bounds.south &&
    latitude <= bounds.north &&
    longitude >= bounds.west &&
    longitude <= bounds.east
  );
}

export function latLonToGridIndex(
  latitude: number,
  longitude: number,
  width: number,
  height: number,
  bounds: GridBounds
) {
  const x = Math.round(((longitude - bounds.west) / (bounds.east - bounds.west)) * (width - 1));
  const y = Math.round(((bounds.north - latitude) / (bounds.north - bounds.south)) * (height - 1));
  return {
    x: Math.min(width - 1, Math.max(0, x)),
    y: Math.min(height - 1, Math.max(0, y))
  };
}
