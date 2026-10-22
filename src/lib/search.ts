import type { Bathroom } from './types';

export function searchBathrooms(bathrooms: Bathroom[], query: string, selectedBuildingId = '', hasStartCoordinates = false) {
  const term = query.trim().toLocaleLowerCase();
  if (term) return bathrooms.filter(b => `${b.building.name} ${b.building.aliases.join(' ')}`.toLocaleLowerCase().includes(term));
  if (selectedBuildingId && !hasStartCoordinates) return bathrooms.filter(b => b.building_id === selectedBuildingId);
  return bathrooms;
}
