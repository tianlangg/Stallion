import { describe, expect, it } from 'vitest';
import { officialCandidates } from './catalog';
import { distanceMeters, scoreFor, visibleBathrooms } from './rankings';
import { searchBathrooms } from './search';
import type { Filters, Observation } from './types';

const obs = (id: string, status: Observation['status'], values: [number | null, number | null, number | null]): Observation => ({ id, bathroom_id: 'x', source_kind: 'inspector', cleanliness: values[0], privacy: values[1], upkeep: values[2], toilet_paper: null, soap: null, queue_level: null, out_of_order: null, note: null, status, observed_at: '2026-10-01T00:00:00Z' });
const none: Filters = { allGender: false, accessible: false, private: false, idAllowed: false, verifiedOnly: false };

describe('score', () => {
  it('omits the prior until a complete published observation exists', () => { expect(scoreFor([]).value).toBeNull(); expect(scoreFor([obs('1', 'pending', [5, 5, 5]), obs('2', 'published', [null, 5, 5])])).toEqual({ value: null, count: 0, provisional: false }); });
  it('weights and smooths complete published ratings', () => { expect(scoreFor([obs('1', 'published', [5, 4, 3])])).toEqual({ value: 3.7, count: 1, provisional: true }); });
  it('excludes pending and incomplete ratings', () => { expect(scoreFor([obs('1', 'published', [5, 5, 5]), obs('2', 'pending', [1, 1, 1]), obs('3', 'published', [null, 1, 1])]).count).toBe(1); });
});
describe('distance, filters, and hall search', () => {
  it('computes distance without inventing entrance coordinates', () => { expect(distanceMeters({ lat: 40, lng: -73 }, { lat: 40, lng: -73 })).toBe(0); expect(officialCandidates.every(b => b.building.entrance_lat === null)).toBe(true); });
  it('keeps two Furnald bathrooms distinct', () => { expect(visibleBathrooms(officialCandidates, none, 'closest', null).filter(b => b.building.name === 'Furnald Hall')).toHaveLength(2); });
  it('combines filters without treating an official ADA label as field verification', () => { expect(visibleBathrooms(officialCandidates, { ...none, allGender: true }, 'closest', null)).toHaveLength(1); expect(visibleBathrooms(officialCandidates, { ...none, accessible: true }, 'closest', null)).toHaveLength(0); expect(visibleBathrooms(officialCandidates, { ...none, verifiedOnly: true }, 'closest', null)).toHaveLength(0); });
  it('sorts without a starting point deterministically', () => { const ids = visibleBathrooms(officialCandidates, none, 'closest', null).map(b => b.id); expect(ids).toEqual(visibleBathrooms([...officialCandidates].reverse(), none, 'closest', null).map(b => b.id)); });
  it('excludes restricted default results', () => { const restricted = { ...officialCandidates[0], access_category_override: 'restricted' as const }; expect(visibleBathrooms([restricted], none, 'closest', null)).toHaveLength(0); });
  it.each([['Schapiro', 1], ['Broadway', 1], ['Furnald', 2], ['605 W 115th', 1]])('finds %s', (query, count) => { expect(searchBathrooms(officialCandidates, query)).toHaveLength(count); });
  it('filters to a selected hall when its entrance coordinates are unknown', () => { expect(searchBathrooms(officialCandidates, '', officialCandidates[2].building_id, false)).toHaveLength(2); });
});
