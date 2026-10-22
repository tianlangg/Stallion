create extension if not exists pgcrypto;
create type public.access_category as enum ('unrestricted','columbia_id','restricted','unknown');
create type public.restroom_type as enum ('all_gender','mens','womens','unknown');
create type public.verification_status as enum ('official_unverified','field_verified','community_unverified');
create type public.observation_source as enum ('inspector','community');
create type public.review_status as enum ('pending','published','rejected');
create type public.feedback_status as enum ('pending','approved','rejected');
create type public.queue_level as enum ('none','short','long','unknown');
create type public.report_type as enum ('wrong_floor','incorrect_access','duplicate','outage','other');
create type public.admin_role as enum ('owner','inspector');

create function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
create table public.buildings (
 id uuid primary key default gen_random_uuid(), name text not null unique check(length(trim(name)) > 0), aliases text[] not null default '{}', campus text not null default 'morningside',
 entrance_lat double precision check (entrance_lat between -90 and 90), entrance_lng double precision check (entrance_lng between -180 and 180), entrance_notes text,
 access_category public.access_category not null default 'unknown', access_schedule_text text, access_schedule_source_url text, access_schedule_valid_until date,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 constraint entrance_pair check ((entrance_lat is null) = (entrance_lng is null))
);
create table public.bathrooms (
 id uuid primary key default gen_random_uuid(), building_id uuid not null references public.buildings(id), slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 floor_label text not null check(length(trim(floor_label)) > 0), location_hint text, restroom_type public.restroom_type not null default 'unknown', single_occupancy boolean, wheelchair_accessible boolean,
 stall_count integer check(stall_count > 0), access_category_override public.access_category, source_url text, source_page_url text, source_accessed_at date,
 verification_status public.verification_status not null default 'community_unverified', verified_at timestamptz,
 is_active boolean not null default true, is_published boolean not null default false, temporarily_unavailable_reason text, unavailable_updated_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 constraint verified_date check ((verification_status = 'field_verified') = (verified_at is not null)),
 constraint verified_accessibility check(wheelchair_accessible is distinct from true or verification_status = 'field_verified'),
 constraint verified_stalls check(stall_count is null or verification_status = 'field_verified')
);
create table public.admin_users (
 user_id uuid primary key references auth.users(id) on delete cascade, role public.admin_role not null, created_at timestamptz not null default now()
);
create table public.observations (
 id uuid primary key default gen_random_uuid(), bathroom_id uuid not null references public.bathrooms(id), source_kind public.observation_source not null,
 inspector_user_id uuid references auth.users(id), cleanliness smallint check(cleanliness between 1 and 5), privacy smallint check(privacy between 1 and 5), upkeep smallint check(upkeep between 1 and 5),
 toilet_paper boolean, soap boolean, queue_level public.queue_level, out_of_order boolean, note varchar(280), status public.review_status not null default 'pending', observed_at timestamptz not null default now(), created_at timestamptz not null default now(),
 constraint inspector_identity check ((source_kind = 'inspector') = (inspector_user_id is not null))
);
create table public.feedback_reports (
 id uuid primary key default gen_random_uuid(), bathroom_id uuid not null references public.bathrooms(id), report_type public.report_type not null, message varchar(280) not null check(length(trim(message)) > 0),
 status public.feedback_status not null default 'pending', created_at timestamptz not null default now(), reviewed_at timestamptz
);
create index bathrooms_building_active_idx on public.bathrooms(building_id,is_active);
create index observations_bathroom_status_date_idx on public.observations(bathroom_id,status,observed_at desc);
create index observations_pending_idx on public.observations(status) where status = 'pending';
create index feedback_pending_idx on public.feedback_reports(status) where status = 'pending';
create index buildings_name_idx on public.buildings(name);
create trigger buildings_updated before update on public.buildings for each row execute function public.set_updated_at();
create trigger bathrooms_updated before update on public.bathrooms for each row execute function public.set_updated_at();

create function public.is_inspector() returns boolean language sql stable security definer set search_path = public as $$
 select exists(select 1 from public.admin_users where user_id = auth.uid());
$$;
create function public.is_owner() returns boolean language sql stable security definer set search_path = public as $$
 select exists(select 1 from public.admin_users where user_id = auth.uid() and role = 'owner');
$$;
revoke all on function public.is_inspector() from public;
revoke all on function public.is_owner() from public;
grant execute on function public.is_inspector() to authenticated;
grant execute on function public.is_owner() to authenticated;

alter table public.buildings enable row level security;
alter table public.bathrooms enable row level security;
alter table public.observations enable row level security;
alter table public.feedback_reports enable row level security;
alter table public.admin_users enable row level security;
create policy buildings_read on public.buildings for select to anon, authenticated using (exists(select 1 from public.bathrooms b where b.building_id = id and b.is_active and b.is_published) or public.is_inspector());
create policy bathrooms_read on public.bathrooms for select to anon, authenticated using ((is_active and is_published) or public.is_inspector());
create policy observations_read on public.observations for select to anon, authenticated using ((status = 'published' and exists(select 1 from public.bathrooms b where b.id = bathroom_id and b.is_active and b.is_published)) or public.is_inspector());
create policy admin_read on public.admin_users for select to authenticated using (user_id = auth.uid() or public.is_owner());
create policy feedback_owner_read on public.feedback_reports for select to authenticated using (public.is_owner());
create policy buildings_owner_insert on public.buildings for insert to authenticated with check(public.is_owner());
create policy buildings_owner_update on public.buildings for update to authenticated using(public.is_owner()) with check(public.is_owner());
create policy bathrooms_owner_insert on public.bathrooms for insert to authenticated with check(public.is_owner());
create policy bathrooms_owner_update on public.bathrooms for update to authenticated using(public.is_owner()) with check(public.is_owner());
create policy inspector_observation_insert on public.observations for insert to authenticated with check(public.is_inspector() and source_kind = 'inspector' and inspector_user_id = auth.uid() and status = 'published');
create policy owner_observation_update on public.observations for update to authenticated using(public.is_owner()) with check(public.is_owner());
create policy owner_feedback_update on public.feedback_reports for update to authenticated using(public.is_owner()) with check(public.is_owner());
-- No anonymous write policies. The protected server handler uses the service role solely for pending submissions.
revoke all on public.observations from anon;
grant select (id,bathroom_id,source_kind,cleanliness,privacy,upkeep,toilet_paper,soap,queue_level,out_of_order,note,status,observed_at,created_at) on public.observations to anon;
revoke all on public.admin_users from anon;
revoke all on public.feedback_reports from anon;
