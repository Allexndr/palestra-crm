-- Backups for app_state: one snapshot per club per hour, kept for 30 days.
-- Triggered from API on every saveAppState call (deduplicated by hour bucket).

create table if not exists app_state_backups (
  id          bigserial primary key,
  club_id     uuid        not null references clubs(id) on delete cascade,
  state       jsonb       not null,
  created_at  timestamptz not null default now(),
  -- one backup per club per hour bucket
  hour_bucket timestamptz generated always as (date_trunc('hour', created_at)) stored
);

-- Unique: only one backup per club per hour
create unique index if not exists app_state_backups_club_hour_uniq
  on app_state_backups (club_id, hour_bucket);

-- Fast lookup by club
create index if not exists app_state_backups_club_id_idx
  on app_state_backups (club_id, created_at desc);

-- Auto-delete backups older than 30 days (Supabase pg_cron or manual purge)
-- Call periodically: delete from app_state_backups where created_at < now() - interval '30 days';
