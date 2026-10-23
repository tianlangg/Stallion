-- Columbia Housing residence access policy reviewed 2026-10-22. No public daily opening hours are posted.
update public.buildings
set access_category = case when name = '538 W. 114th Street' then 'restricted' else 'columbia_id' end,
    access_schedule_text = case when name = '538 W. 114th Street' then 'Brownstone: resident-only access. No public opening hours posted.' else 'No public opening hours posted. Authorized Columbia Housing residents enter with a CUID.' end,
    access_schedule_source_url = 'https://www.housing.columbia.edu/content/residence-hall-access',
    access_schedule_valid_until = null
where id in ('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', '33333333-3333-4333-8333-333333333333')
   or id like '44444444-4444-4444-8444-%';
update public.buildings set entrance_lat = null, entrance_lng = null,
  entrance_notes = 'Columbia Housing lists the entrance at 538 W. 114th Street. The approach has not been field checked.'
where name = '538 W. 114th Street';

update public.buildings set aliases = array['Broadway'], entrance_notes = 'Columbia Housing lists the entrance at West 114th Street and Broadway. The approach has not been field checked.' where name = 'Broadway Hall';
