import type { Building } from './types';

export function directionsToBuilding(building: Building, start?: { lat: number; lng: number } | null) {
  const streetAddress = building.aliases.find(alias => /^\d{2,4}\s/.test(alias));
  const destination = streetAddress ? `${streetAddress}, New York, NY` : `${building.name}, Columbia University, New York, NY`;
  const origin = start ? `&origin=${encodeURIComponent(`${start.lat},${start.lng}`)}` : '';
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}${origin}&travelmode=walking`;
}
