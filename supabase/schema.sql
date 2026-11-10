-- =====================================================================
-- house-showcase schema
-- Run once in Supabase SQL Editor. Running twice will error (that is fine).
-- =====================================================================

-- ---------- helper: keep updated_at fresh ----------
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- houses ----------
create table public.houses (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title_id     text not null,
  title_en     text not null default '',
  tagline_id   text not null default '',
  tagline_en   text not null default '',
  why_id       text not null default '',
  why_en       text not null default '',
  notes_id     text not null default '',
  notes_en     text not null default '',
  floors       smallint check (floors > 0),
  bedrooms     smallint check (bedrooms >= 0),
  bathrooms    smallint check (bathrooms >= 0),
  area_m2      numeric(8, 2) check (area_m2 > 0),
  designer     text,
  is_published boolean not null default false,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger houses_set_updated_at
  before update on public.houses
  for each row execute function public.set_updated_at();

-- ---------- rooms ----------
create table public.rooms (
  id             uuid primary key default gen_random_uuid(),
  house_id       uuid not null references public.houses (id) on delete cascade,
  position       smallint not null default 0,
  floor          smallint,
  name_id        text not null,
  name_en        text not null default '',
  description_id text not null default '',
  description_en text not null default '',
  rationale_id   text not null default '',
  rationale_en   text not null default '',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index rooms_house_position_idx on public.rooms (house_id, position);

create trigger rooms_set_updated_at
  before update on public.rooms
  for each row execute function public.set_updated_at();

-- ---------- media ----------
create table public.media (
  id           uuid primary key default gen_random_uuid(),
  house_id     uuid not null references public.houses (id) on delete cascade,
  room_id      uuid references public.rooms (id) on delete set null,
  kind         text not null check (kind in ('hero', 'floorplan', 'room', 'gallery')),
  storage_path text not null,
  width        integer,
  height       integer,
  alt_id       text not null default '',
  alt_en       text not null default '',
  caption_id   text not null default '',
  caption_en   text not null default '',
  position     smallint not null default 0,
  created_at   timestamptz not null default now()
);

create index media_house_kind_idx on public.media (house_id, kind, position);
create index media_room_idx on public.media (room_id);

-- one hero image per house
create unique index media_one_hero_per_house
  on public.media (house_id) where kind = 'hero';

-- ---------- access rules (RLS) ----------
alter table public.houses enable row level security;
alter table public.rooms  enable row level security;
alter table public.media  enable row level security;

-- visitors: read published houses only
create policy "houses_public_read" on public.houses
  for select to anon, authenticated
  using (is_published);

create policy "rooms_public_read" on public.rooms
  for select to anon, authenticated
  using (exists (
    select 1 from public.houses h
    where h.id = rooms.house_id and h.is_published
  ));

create policy "media_public_read" on public.media
  for select to anon, authenticated
  using (exists (
    select 1 from public.houses h
    where h.id = media.house_id and h.is_published
  ));

-- admin (logged-in user): full access. Sign-ups are disabled, so only the admin exists.
create policy "houses_admin_all" on public.houses
  for all to authenticated using (true) with check (true);

create policy "rooms_admin_all" on public.rooms
  for all to authenticated using (true) with check (true);

create policy "media_admin_all" on public.media
  for all to authenticated using (true) with check (true);

-- table permissions (RLS above still decides which rows)
grant usage on schema public to anon, authenticated;
grant select on public.houses, public.rooms, public.media to anon;
grant select, insert, update, delete
  on public.houses, public.rooms, public.media to authenticated;

-- ---------- image storage ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'house-media',
  'house-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do nothing;

create policy "house_media_admin_all" on storage.objects
  for all to authenticated
  using (bucket_id = 'house-media')
  with check (bucket_id = 'house-media');