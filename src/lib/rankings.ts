import type { Access, Bathroom, Filters, Observation, Sort } from './types';

export function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const radians = Math.PI / 180;
  const dLat = (b.lat - a.lat) * radians;
  const dLng = (b.lng - a.lng) * radians;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * radians) * Math.cos(b.lat * radians) * Math.sin(dLng / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function publicObservations(observations: Observation[]) { return observations.filter(o => o.status === 'published'); }
export function scoreFor(observations: Observation[]) {
  const complete = publicObservations(observations).filter(o => o.cleanliness !== null && o.privacy !== null && o.upkeep !== null);
  if (!complete.length) return { value: null, count: 0, provisional: false };
  const sum = complete.reduce((total, o) => total + .4 * o.cleanliness! + .35 * o.privacy! + .25 * o.upkeep!, 0);
  return { value: Math.round(((sum + 3 * 3.5) / (complete.length + 3)) * 10) / 10, count: complete.length, provisional: complete.length < 3 };
}
export function effectiveAccess(b: Bathroom): Access { return b.access_category_override ?? b.building.access_category; }
export function lastObserved(b: Bathroom) { return publicObservations(b.observations).reduce<string | null>((latest, o) => !latest || o.observed_at > latest ? o.observed_at : latest, null); }
export function distanceTo(b: Bathroom, start: { lat: number; lng: number } | null) { const { entrance_lat: lat, entrance_lng: lng } = b.building; return start && lat !== null && lng !== null ? distanceMeters(start, { lat, lng }) : null; }
export function visibleBathrooms(bathrooms: Bathroom[], filters: Filters, sort: Sort, start: { lat: number; lng: number } | null) {
  return bathrooms.filter(b => b.is_active && b.is_published && effectiveAccess(b) !== 'restricted')
    .filter(b => !filters.allGender || b.restroom_type === 'all_gender')
    .filter(b => !filters.accessible || (b.wheelchair_accessible === true && b.verification_status === 'field_verified'))
    .filter(b => !filters.private || b.single_occupancy === true)
    .filter(b => !filters.idAllowed || ['unrestricted', 'columbia_id'].includes(effectiveAccess(b)))
    .filter(b => !filters.verifiedOnly || b.verification_status === 'field_verified')
    .sort((a, b) => {
      if (sort === 'score') { const delta = (scoreFor(b.observations).value ?? -1) - (scoreFor(a.observations).value ?? -1); if (delta) return delta; }
      if (sort === 'recent') { const delta = (lastObserved(b) ?? '').localeCompare(lastObserved(a) ?? ''); if (delta) return delta; }
      if (sort === 'closest') { const da = distanceTo(a, start), db = distanceTo(b, start); if (da !== db) { if (da === null) return 1; if (db === null) return -1; return da - db; } const recency = (lastObserved(b) ?? '').localeCompare(lastObserved(a) ?? ''); if (recency) return recency; }
      return a.building.name.localeCompare(b.building.name) || a.floor_label.localeCompare(b.floor_label) || a.id.localeCompare(b.id);
    });
}
export const accessLabel = (access: Access) => ({ unrestricted: 'No ID requirement confirmed', columbia_id: 'Columbia ID may be required', restricted: 'Restricted access', unknown: 'Access unknown' })[access];
