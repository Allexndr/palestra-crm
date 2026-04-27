create table if not exists public.user_roles (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  club_id uuid not null references public.clubs(id) on delete cascade,
  role text not null check (role in ('admin', 'coach', 'parent', 'student')),
  created_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  club_id uuid not null references public.clubs(id) on delete cascade,
  preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.monthly_awards (
  club_id uuid primary key references public.clubs(id) on delete cascade,
  title text default '',
  description text default '',
  days_left integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  name text not null,
  type text default 'event',
  date text,
  description text,
  participant_ids uuid[] default '{}',
  image_blob_url text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.monthly_awards enable row level security;
alter table public.events enable row level security;

create or replace function public.current_profile_id()
returns uuid
language sql
stable
as $$
  select id from public.profiles where auth_user_id = auth.uid() limit 1
$$;

create or replace function public.is_parent_of_member(target_member_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.members m
    join public.parents p on p.id = m.parent_id
    where m.id = target_member_id
      and p.profile_id = public.current_profile_id()
  )
$$;

create or replace function public.can_read_member(target_member_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.members m
    where m.id = target_member_id
      and m.club_id = public.current_club_id()
      and (
        public.current_role() in ('admin', 'coach')
        or m.profile_id = public.current_profile_id()
        or public.is_parent_of_member(target_member_id)
      )
  )
$$;

drop policy if exists "members_select" on public.members;
create policy "members_select" on public.members for select using (
  club_id = public.current_club_id()
  and (
    public.current_role() in ('admin', 'coach')
    or profile_id = public.current_profile_id()
    or public.is_parent_of_member(id)
  )
);

drop policy if exists "parents_select" on public.parents;
create policy "parents_select" on public.parents for select using (
  club_id = public.current_club_id()
  and (
    public.current_role() in ('admin', 'coach')
    or profile_id = public.current_profile_id()
  )
);

drop policy if exists "schedule_sessions_select" on public.schedule_sessions;
create policy "schedule_sessions_select" on public.schedule_sessions for select using (
  club_id = public.current_club_id()
  and (
    public.current_role() in ('admin', 'coach')
    or exists (
      select 1
      from public.members m
      where m.group_id = schedule_sessions.group_id
        and public.can_read_member(m.id)
    )
  )
);

drop policy if exists "attendance_records_select" on public.attendance_records;
create policy "attendance_records_select" on public.attendance_records for select using (
  club_id = public.current_club_id()
  and (
    public.current_role() in ('admin', 'coach')
    or exists (
      select 1
      from unnest(attendance_records.member_ids) member_id
      where public.can_read_member(member_id)
    )
  )
);

drop policy if exists "user_roles_select" on public.user_roles;
drop policy if exists "user_roles_insert" on public.user_roles;
drop policy if exists "user_roles_update" on public.user_roles;
drop policy if exists "user_roles_delete" on public.user_roles;
create policy "user_roles_select" on public.user_roles for select using (
  club_id = public.current_club_id()
  and (public.is_admin() or profile_id = public.current_profile_id())
);
create policy "user_roles_insert" on public.user_roles for insert with check (club_id = public.current_club_id() and public.is_admin());
create policy "user_roles_update" on public.user_roles for update using (club_id = public.current_club_id() and public.is_admin()) with check (club_id = public.current_club_id());
create policy "user_roles_delete" on public.user_roles for delete using (club_id = public.current_club_id() and public.is_admin());

drop policy if exists "user_preferences_select" on public.user_preferences;
drop policy if exists "user_preferences_insert" on public.user_preferences;
drop policy if exists "user_preferences_update" on public.user_preferences;
create policy "user_preferences_select" on public.user_preferences for select using (
  club_id = public.current_club_id()
  and (public.is_admin() or profile_id = public.current_profile_id())
);
create policy "user_preferences_insert" on public.user_preferences for insert with check (club_id = public.current_club_id() and profile_id = public.current_profile_id());
create policy "user_preferences_update" on public.user_preferences for update using (club_id = public.current_club_id() and profile_id = public.current_profile_id()) with check (club_id = public.current_club_id());

drop policy if exists "monthly_awards_select" on public.monthly_awards;
drop policy if exists "monthly_awards_insert" on public.monthly_awards;
drop policy if exists "monthly_awards_update" on public.monthly_awards;
create policy "monthly_awards_select" on public.monthly_awards for select using (club_id = public.current_club_id());
create policy "monthly_awards_insert" on public.monthly_awards for insert with check (club_id = public.current_club_id() and public.is_admin());
create policy "monthly_awards_update" on public.monthly_awards for update using (club_id = public.current_club_id() and public.is_admin()) with check (club_id = public.current_club_id());

drop policy if exists "events_select" on public.events;
drop policy if exists "events_insert" on public.events;
drop policy if exists "events_update" on public.events;
drop policy if exists "events_delete" on public.events;
create policy "events_select" on public.events for select using (club_id = public.current_club_id());
create policy "events_insert" on public.events for insert with check (club_id = public.current_club_id() and public.current_role() in ('admin', 'coach'));
create policy "events_update" on public.events for update using (club_id = public.current_club_id() and public.current_role() in ('admin', 'coach')) with check (club_id = public.current_club_id());
create policy "events_delete" on public.events for delete using (club_id = public.current_club_id() and public.is_admin());
