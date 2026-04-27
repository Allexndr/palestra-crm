create extension if not exists pgcrypto;

create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_blob_url text,
  primary_color text default '#3146A6',
  city text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete cascade,
  club_id uuid references public.clubs(id) on delete cascade,
  role text not null check (role in ('admin', 'coach', 'parent', 'student')),
  name text not null,
  email text,
  phone text,
  avatar_blob_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  name text not null,
  address text,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.coaches (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  phone text,
  specialization text,
  bio text,
  avatar_blob_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  location_id uuid references public.locations(id) on delete set null,
  coach_id uuid references public.coaches(id) on delete set null,
  name text not null,
  sport text,
  created_at timestamptz not null default now()
);

create table if not exists public.parents (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  phone text,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  parent_id uuid references public.parents(id) on delete set null,
  group_id uuid references public.groups(id) on delete set null,
  first_name text not null,
  last_name text,
  phone text,
  sport text,
  plan text,
  points integer not null default 0,
  level text default 'Новичок',
  strength integer default 0,
  speed integer default 0,
  technique integer default 0,
  endurance integer default 0,
  avatar_blob_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  name text not null,
  phone text,
  sport text,
  status text default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.schedule_sessions (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  group_id uuid references public.groups(id) on delete set null,
  location_id uuid references public.locations(id) on delete set null,
  group_name text,
  coach_name text,
  sport text,
  day text,
  days text[],
  time text,
  color text,
  created_at timestamptz not null default now()
);

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  session_id uuid references public.schedule_sessions(id) on delete set null,
  member_ids uuid[] not null default '{}',
  date timestamptz not null default now()
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  name text not null,
  visits integer,
  price numeric,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.financial_transactions (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  amount numeric not null,
  type text not null check (type in ('income', 'expense')),
  description text,
  date timestamptz not null default now()
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  title text not null,
  description text,
  icon text,
  color text,
  icon_color text,
  created_at timestamptz not null default now()
);

create table if not exists public.member_achievements (
  member_id uuid not null references public.members(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (member_id, achievement_id)
);

create table if not exists public.leagues (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  name text not null,
  status text default 'active',
  participant_ids uuid[] default '{}',
  group_ids uuid[] default '{}',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  author_profile_id uuid references public.profiles(id) on delete set null,
  text text,
  image_blob_url text,
  likes integer not null default 0,
  liked_by uuid[] default '{}',
  comments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  name text not null,
  price numeric,
  category text,
  description text,
  image_blob_url text,
  stock integer default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  member_id uuid references public.members(id) on delete set null,
  status text default 'pending',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  text text not null,
  type text default 'info',
  created_at timestamptz not null default now()
);

create table if not exists public.tariff_drafts (
  id uuid primary key default gen_random_uuid(),
  config jsonb not null,
  created_at timestamptz not null default now()
);

-- Compatibility state for the current React context shape. The normalized tables above are the
-- long-term model; this table lets the app migrate off browser storage without rewriting every
-- screen at once.
create table if not exists public.app_state (
  club_id uuid primary key references public.clubs(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.clubs enable row level security;
alter table public.profiles enable row level security;
alter table public.locations enable row level security;
alter table public.coaches enable row level security;
alter table public.groups enable row level security;
alter table public.parents enable row level security;
alter table public.members enable row level security;
alter table public.leads enable row level security;
alter table public.schedule_sessions enable row level security;
alter table public.attendance_records enable row level security;
alter table public.plans enable row level security;
alter table public.financial_transactions enable row level security;
alter table public.achievements enable row level security;
alter table public.member_achievements enable row level security;
alter table public.leagues enable row level security;
alter table public.posts enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.activities enable row level security;
alter table public.tariff_drafts enable row level security;
alter table public.app_state enable row level security;

create or replace function public.current_club_id()
returns uuid
language sql
stable
as $$
  select club_id from public.profiles where auth_user_id = auth.uid() limit 1
$$;

create or replace function public.current_role()
returns text
language sql
stable
as $$
  select role from public.profiles where auth_user_id = auth.uid() limit 1
$$;

create or replace function public.can_access_club(target_club_id uuid)
returns boolean
language sql
stable
as $$
  select target_club_id = public.current_club_id()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select public.current_role() = 'admin'
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'locations','coaches','groups','parents','members','leads','schedule_sessions',
    'attendance_records','plans','financial_transactions','achievements','leagues',
    'posts','products','orders','activities','app_state'
  ]
  loop
    execute format('drop policy if exists "%1$s_select" on public.%1$I', table_name);
    execute format('drop policy if exists "%1$s_insert" on public.%1$I', table_name);
    execute format('drop policy if exists "%1$s_update" on public.%1$I', table_name);
    execute format('drop policy if exists "%1$s_delete" on public.%1$I', table_name);

    execute format('create policy "%1$s_select" on public.%1$I for select using (public.can_access_club(club_id))', table_name);
    execute format('create policy "%1$s_insert" on public.%1$I for insert with check (public.can_access_club(club_id) and public.current_role() in (''admin'', ''coach''))', table_name);
    execute format('create policy "%1$s_update" on public.%1$I for update using (public.can_access_club(club_id) and public.current_role() in (''admin'', ''coach'')) with check (public.can_access_club(club_id))', table_name);
    execute format('create policy "%1$s_delete" on public.%1$I for delete using (public.can_access_club(club_id) and public.current_role() = ''admin'')', table_name);
  end loop;
end $$;

drop policy if exists "clubs_select" on public.clubs;
drop policy if exists "clubs_update" on public.clubs;
create policy "clubs_select" on public.clubs for select using (id = public.current_club_id());
create policy "clubs_update" on public.clubs for update using (id = public.current_club_id() and public.is_admin()) with check (id = public.current_club_id());

drop policy if exists "profiles_select" on public.profiles;
drop policy if exists "profiles_insert" on public.profiles;
drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_select" on public.profiles for select using (club_id = public.current_club_id() or auth_user_id = auth.uid());
create policy "profiles_insert" on public.profiles for insert with check (club_id = public.current_club_id() and public.is_admin());
create policy "profiles_update" on public.profiles for update using (club_id = public.current_club_id() and (public.is_admin() or auth_user_id = auth.uid())) with check (club_id = public.current_club_id());

drop policy if exists "tariff_drafts_insert" on public.tariff_drafts;
drop policy if exists "tariff_drafts_select" on public.tariff_drafts;
create policy "tariff_drafts_insert" on public.tariff_drafts for insert with check (true);
create policy "tariff_drafts_select" on public.tariff_drafts for select using (true);
