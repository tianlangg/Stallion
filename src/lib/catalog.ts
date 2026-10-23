import type { Bathroom, Building } from './types';

// Columbia Housing hall pages and floor plans reviewed 2026-10-22. Coordinates
// are approximate hall map positions, never field-checked entrance points.
const schapiro: Building = {
  id: '11111111-1111-4111-8111-111111111111', name: 'Schapiro Hall', aliases: ['Schapiro', '605 W 115th Street'], campus: 'morningside',
  entrance_lat: 40.807722, entrance_lng: -73.967213, entrance_notes: 'Columbia Housing lists the entrance at 605 W. 115th Street. The approach has not been field checked.',
  access_category: 'columbia_id', access_schedule_text: 'No public opening hours posted. Authorized Columbia Housing residents enter with a CUID.', access_schedule_source_url: 'https://www.housing.columbia.edu/content/residence-hall-access', access_schedule_valid_until: null
};
const broadway: Building = {
  id: '22222222-2222-4222-8222-222222222222', name: 'Broadway Hall', aliases: ['Broadway'], campus: 'morningside',
  entrance_lat: 40.806280, entrance_lng: -73.966607, entrance_notes: 'Columbia Housing lists the entrance at West 114th Street and Broadway. The approach has not been field checked.',
  access_category: 'columbia_id', access_schedule_text: 'No public opening hours posted. Authorized Columbia Housing residents enter with a CUID.', access_schedule_source_url: 'https://www.housing.columbia.edu/content/residence-hall-access', access_schedule_valid_until: null
};
const furnald: Building = {
  id: '33333333-3333-4333-8333-333333333333', name: 'Furnald Hall', aliases: ['Furnald'], campus: 'morningside',
  entrance_lat: 40.807423, entrance_lng: -73.966182, entrance_notes: 'Columbia Housing lists the entrance inside campus along South Lawns. The approach has not been field checked.',
  access_category: 'columbia_id', access_schedule_text: 'No public opening hours posted. Authorized Columbia Housing residents enter with a CUID.', access_schedule_source_url: 'https://www.housing.columbia.edu/content/residence-hall-access', access_schedule_valid_until: null
};
const common = { source_accessed_at: '2026-10-22', verification_status: 'official_unverified' as const, verified_at: null, is_active: true, is_published: true, temporarily_unavailable_reason: null, unavailable_updated_at: null, observations: [] };

const hallListings = [
  ['John Jay Hall', 'johnjay', 'Inside campus along South Lawns', 40.805981, -73.964838, 'Single-use bathrooms on each floor', 'unknown', true],
  ['Wallach Hall', 'wallach', 'Inside campus gates along South Lawns', 40.806030, -73.964081, 'Single-use bathrooms on each floor', 'unknown', true],
  ['McBain Hall', 'mcbain', '562 W. 113th Street', 40.805846, -73.967170, 'Multiple single-use bathrooms on each floor', 'unknown', true],
  ['River Hall', 'river', '628 W. 114th Street', 40.807171, -73.968521, 'Multiple single-use bathrooms on each floor', 'unknown', true],
  ['Harmony Hall', 'harmony', '544 W. 110th Street', 40.803620, -73.968033, 'Shared men’s and women’s facilities; exact floor and room unknown', 'unknown', null],
  ['Wien Hall', 'wien', 'Inside gate on W. 116th Street between Amsterdam and Morningside Drive', 40.806703, -73.961896, 'Shared gendered bathrooms on each floor; exact room unknown', 'unknown', null],
  ['538 W. 114th Street', 'content/538-w-114th-street', '538 W. 114th Street', null, null, 'Shared bathrooms on each floor; exact room unknown', 'unknown', null],
  ['619 W. 113th Street', 'content/619-w-113th-street', '619 W. 113th Street', 40.806781, -73.969071, 'Shared single-use bathrooms on each floor', 'unknown', true],
  ['611 W. 112th Street', '611', '611 W. 112th Street', 40.806051, -73.969178, 'Seven single-use bathrooms on each floor', 'unknown', true],
  ['600 W. 113th Street', '600west113', '600 W. 113th Street', 40.806156, -73.967973, 'Shared and single-use floor bathrooms vary by floor; exact room unknown', 'unknown', null]
] as const;

const additionalCandidates: Bathroom[] = hallListings.map(([name, path, address, lat, lng, description, restroom_type, single_occupancy], index) => {
  const building: Building = {
    id: `44444444-4444-4444-8444-${String(index + 1).padStart(12, '0')}`, name, aliases: [name.replace(/ Hall$/, ''), address], campus: 'morningside',
    entrance_lat: lat, entrance_lng: lng, entrance_notes: `Columbia Housing lists the entrance at ${address}. The approach has not been field checked.`,
    access_category: name === '538 W. 114th Street' ? 'restricted' : 'columbia_id',
    access_schedule_text: name === '538 W. 114th Street' ? 'Brownstone: resident-only access. No public opening hours posted.' : 'No public opening hours posted. Authorized Columbia Housing residents enter with a CUID.',
    access_schedule_source_url: 'https://www.housing.columbia.edu/content/residence-hall-access', access_schedule_valid_until: null
  };
  return {
    ...common, id: `eeeeeeee-eeee-4eee-8eee-${String(index + 1).padStart(12, '0')}`, building_id: building.id, building,
    slug: `${path.split('/').pop()}-hall-bathroom`, floor_label: 'Residential floors',
    location_hint: `Columbia Housing describes ${description.toLowerCase()}. A specific restroom and indoor route have not been field checked.`,
    restroom_type, single_occupancy, wheelchair_accessible: null, stall_count: null, access_category_override: null,
    source_url: null, source_page_url: `https://www.housing.columbia.edu/${path}`
  };
});

export const officialCandidates: Bathroom[] = [
  { ...common, id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', building_id: schapiro.id, building: schapiro, slug: 'schapiro-2-ada', floor_label: '2nd Floor', location_hint: 'The floor plan labels an ADA bath near rooms 201–203. Indoor route has not been field checked.', restroom_type: 'all_gender', single_occupancy: true, wheelchair_accessible: null, stall_count: null, access_category_override: null, source_url: 'https://www.housing.columbia.edu/sites/default/files/content/img/Buildings/Floor%20Plans/Schapiro%20Hall/SHP_FL_02.jpg', source_page_url: 'https://www.housing.columbia.edu/schapiro' },
  { ...common, id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', building_id: broadway.id, building: broadway, slug: 'broadway-3-west-bathrooms', floor_label: 'Floor 3', location_hint: 'The floor plan shows a bathroom cluster near the west-side elevators and lounge. Individual room type and route have not been field checked.', restroom_type: 'unknown', single_occupancy: null, wheelchair_accessible: null, stall_count: null, access_category_override: null, source_url: 'https://www.housing.columbia.edu/sites/default/files/content/img/Buildings/Floor%20Plans/Broadway/3.pdf', source_page_url: 'https://www.housing.columbia.edu/broadway' },
  { ...common, id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', building_id: furnald.id, building: furnald, slug: 'furnald-3-mens', floor_label: 'Floor 3', location_hint: 'The floor plan labels Bath M near room 309. Indoor route has not been field checked.', restroom_type: 'mens', single_occupancy: null, wheelchair_accessible: null, stall_count: null, access_category_override: null, source_url: 'https://www.housing.columbia.edu/sites/default/files/content/img/Buildings/Floor%20Plans/Furnald%20Hall/FUR_FL_03.jpg', source_page_url: 'https://www.housing.columbia.edu/furnald' },
  { ...common, id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', building_id: furnald.id, building: furnald, slug: 'furnald-3-womens', floor_label: 'Floor 3', location_hint: 'The floor plan labels Bath F near the third-floor lounge. Indoor route has not been field checked.', restroom_type: 'womens', single_occupancy: null, wheelchair_accessible: null, stall_count: null, access_category_override: null, source_url: 'https://www.housing.columbia.edu/sites/default/files/content/img/Buildings/Floor%20Plans/Furnald%20Hall/FUR_FL_03.jpg', source_page_url: 'https://www.housing.columbia.edu/furnald' },
  ...additionalCandidates
];
