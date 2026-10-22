import type { Bathroom, Building } from './types';

// Columbia Housing floor-plan candidates reviewed 2026-10-21. No field inspections
// or entrance coordinates have been supplied. Every record remains unverified.
const schapiro: Building = {
  id: '11111111-1111-4111-8111-111111111111', name: 'Schapiro Hall', aliases: ['Schapiro', '605 W 115th Street'], campus: 'morningside',
  entrance_lat: null, entrance_lng: null, entrance_notes: 'Columbia Housing lists the entrance at 605 W. 115th Street; the approach has not been field checked.',
  access_category: 'unknown', access_schedule_text: null, access_schedule_source_url: null, access_schedule_valid_until: null
};
const broadway: Building = {
  id: '22222222-2222-4222-8222-222222222222', name: 'Broadway Hall', aliases: ['Broadway', '2900 Broadway'], campus: 'morningside',
  entrance_lat: null, entrance_lng: null, entrance_notes: 'Columbia Housing lists the entrance at West 114th Street and Broadway; the approach has not been field checked.',
  access_category: 'unknown', access_schedule_text: null, access_schedule_source_url: null, access_schedule_valid_until: null
};
const furnald: Building = {
  id: '33333333-3333-4333-8333-333333333333', name: 'Furnald Hall', aliases: ['Furnald'], campus: 'morningside',
  entrance_lat: null, entrance_lng: null, entrance_notes: 'Columbia Housing lists the entrance inside campus along South Lawns; the approach has not been field checked.',
  access_category: 'unknown', access_schedule_text: null, access_schedule_source_url: null, access_schedule_valid_until: null
};
const common = { source_accessed_at: '2026-10-21', verification_status: 'official_unverified' as const, verified_at: null, is_active: true, is_published: true, temporarily_unavailable_reason: null, unavailable_updated_at: null, observations: [] };

export const officialCandidates: Bathroom[] = [
  { ...common, id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', building_id: schapiro.id, building: schapiro, slug: 'schapiro-2-ada', floor_label: '2nd Floor', location_hint: 'The floor plan labels an ADA bath near rooms 201–203. Indoor route has not been field checked.', restroom_type: 'all_gender', single_occupancy: true, wheelchair_accessible: null, stall_count: null, access_category_override: null, source_url: 'https://www.housing.columbia.edu/sites/default/files/content/img/Buildings/Floor%20Plans/Schapiro%20Hall/SHP_FL_02.jpg', source_page_url: 'https://www.housing.columbia.edu/schapiro' },
  { ...common, id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', building_id: broadway.id, building: broadway, slug: 'broadway-3-west-bathrooms', floor_label: 'Floor 3', location_hint: 'The floor plan shows a bathroom cluster near the west-side elevators and lounge. Individual room type and route have not been field checked.', restroom_type: 'unknown', single_occupancy: null, wheelchair_accessible: null, stall_count: null, access_category_override: null, source_url: 'https://www.housing.columbia.edu/sites/default/files/content/img/Buildings/Floor%20Plans/Broadway/3.pdf', source_page_url: 'https://www.housing.columbia.edu/broadway' },
  { ...common, id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', building_id: furnald.id, building: furnald, slug: 'furnald-3-mens', floor_label: 'Floor 3', location_hint: 'The floor plan labels Bath M near room 309. Indoor route has not been field checked.', restroom_type: 'mens', single_occupancy: null, wheelchair_accessible: null, stall_count: null, access_category_override: null, source_url: 'https://www.housing.columbia.edu/sites/default/files/content/img/Buildings/Floor%20Plans/Furnald%20Hall/FUR_FL_03.jpg', source_page_url: 'https://www.housing.columbia.edu/furnald' },
  { ...common, id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', building_id: furnald.id, building: furnald, slug: 'furnald-3-womens', floor_label: 'Floor 3', location_hint: 'The floor plan labels Bath F near the third-floor lounge. Indoor route has not been field checked.', restroom_type: 'womens', single_occupancy: null, wheelchair_accessible: null, stall_count: null, access_category_override: null, source_url: 'https://www.housing.columbia.edu/sites/default/files/content/img/Buildings/Floor%20Plans/Furnald%20Hall/FUR_FL_03.jpg', source_page_url: 'https://www.housing.columbia.edu/furnald' }
];
