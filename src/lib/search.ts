import type { Bathroom } from './types';

export function searchBathrooms(bathrooms: Bathroom[], query: string, selectedBuildingId = '') {
  const term = query.trim().toLocaleLowerCase();
  if (term) return bathrooms.filter(b => `${b.building.name} ${b.building.aliases.join(' ')}`.toLocaleLowerCase().includes(term));
  if (selectedBuildingId) return bathrooms.filter(b => b.building_id === selectedBuildingId);
  return bathrooms;
}
