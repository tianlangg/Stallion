-- Official Columbia Housing floor-plan candidates reviewed 2026-10-21.
-- These are published as unverified candidates, never as field-checked locations.
insert into public.buildings (id, name, aliases, entrance_notes, access_category) values
('11111111-1111-4111-8111-111111111111', 'Schapiro Hall', array['Schapiro', '605 W 115th Street'], 'Columbia Housing lists the entrance at 605 W. 115th Street; the approach has not been field checked.', 'unknown'),
('22222222-2222-4222-8222-222222222222', 'Broadway Hall', array['Broadway', '2900 Broadway'], 'Columbia Housing lists the entrance at West 114th Street and Broadway; the approach has not been field checked.', 'unknown'),
('33333333-3333-4333-8333-333333333333', 'Furnald Hall', array['Furnald'], 'Columbia Housing lists the entrance inside campus along South Lawns; the approach has not been field checked.', 'unknown')
on conflict (id) do nothing;

insert into public.bathrooms (id, building_id, slug, floor_label, location_hint, restroom_type, single_occupancy, source_url, source_accessed_at, verification_status, is_published) values
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'schapiro-2-ada', '2nd Floor', 'The floor plan labels an ADA bath near rooms 201–203. Indoor route has not been field checked.', 'all_gender', true, 'https://www.housing.columbia.edu/sites/default/files/content/img/Buildings/Floor%20Plans/Schapiro%20Hall/SHP_FL_02.jpg', '2026-10-21', 'official_unverified', true),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '22222222-2222-4222-8222-222222222222', 'broadway-3-west-bathrooms', 'Floor 3', 'The floor plan shows a bathroom cluster near the west-side elevators and lounge. Individual room type and route have not been field checked.', 'unknown', null, 'https://www.housing.columbia.edu/sites/default/files/content/img/Buildings/Floor%20Plans/Broadway/3.pdf', '2026-10-21', 'official_unverified', true),
('cccccccc-cccc-4ccc-8ccc-cccccccccccc', '33333333-3333-4333-8333-333333333333', 'furnald-3-mens', 'Floor 3', 'The floor plan labels Bath M near room 309. Indoor route has not been field checked.', 'mens', null, 'https://www.housing.columbia.edu/sites/default/files/content/img/Buildings/Floor%20Plans/Furnald%20Hall/FUR_FL_03.jpg', '2026-10-21', 'official_unverified', true),
('dddddddd-dddd-4ddd-8ddd-dddddddddddd', '33333333-3333-4333-8333-333333333333', 'furnald-3-womens', 'Floor 3', 'The floor plan labels Bath F near the third-floor lounge. Indoor route has not been field checked.', 'womens', null, 'https://www.housing.columbia.edu/sites/default/files/content/img/Buildings/Floor%20Plans/Furnald%20Hall/FUR_FL_03.jpg', '2026-10-21', 'official_unverified', true)
on conflict (id) do nothing;

update public.bathrooms set source_page_url = 'https://www.housing.columbia.edu/schapiro' where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' and source_page_url is null;
update public.bathrooms set source_page_url = 'https://www.housing.columbia.edu/broadway' where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' and source_page_url is null;
update public.bathrooms set source_page_url = 'https://www.housing.columbia.edu/furnald' where id in ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd') and source_page_url is null;
