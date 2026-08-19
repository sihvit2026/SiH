-- =============================================================================
-- Migration: 0001_init.sql
-- Description: Full schema for the SIH evaluation platform
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "uuid-ossp";  -- uuid_generate_v4() fallback

-- ---------------------------------------------------------------------------
-- 1. events
--    One row per SIH event / hackathon edition.
-- ---------------------------------------------------------------------------
create table events (
  id          uuid primary key default gen_random_uuid(),
  name        text        not null,
  date        date,
  venue       text,
  status      text        not null default 'upcoming'
                check (status in ('upcoming', 'ongoing', 'completed')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. criteria
--    Scoring rubric items, tagged by round (1 or 2).
-- ---------------------------------------------------------------------------
create table criteria (
  id          uuid    primary key default gen_random_uuid(),
  event_id    uuid    not null references events (id) on delete cascade,
  name        text    not null,
  max_score   numeric not null check (max_score > 0),
  weight      numeric not null default 1 check (weight > 0),
  round       int     not null check (round in (1, 2)),
  created_at  timestamptz not null default now()
);

create index idx_criteria_event_round on criteria (event_id, round);

-- ---------------------------------------------------------------------------
-- 3. teams
--    Participating teams, with a full lifecycle status.
-- ---------------------------------------------------------------------------
create table teams (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references events (id) on delete cascade,
  team_name   text not null,
  team_code   text not null,
  status      text not null default 'registered'
                check (status in (
                  'registered',
                  'round1_pending',
                  'shortlisted',
                  'not_shortlisted',
                  'selected',
                  'standby',
                  'not_selected'
                )),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (event_id, team_code)
);

create index idx_teams_event_status on teams (event_id, status);

-- ---------------------------------------------------------------------------
-- 4. students
--    Members of a team.
-- ---------------------------------------------------------------------------
create table students (
  id           uuid primary key default gen_random_uuid(),
  team_id      uuid not null references teams (id) on delete cascade,
  name         text not null,
  roll_number  text,
  email        text,
  created_at   timestamptz not null default now()
);

create index idx_students_team on students (team_id);

-- ---------------------------------------------------------------------------
-- 5. evaluators
--    Linked to a Supabase Auth user (id = auth.uid()).
--    Role 'evaluator' participates in Round 1; 'jury' in Round 2.
-- ---------------------------------------------------------------------------
create table evaluators (
  id                 uuid primary key,   -- must equal auth.uid()
  name               text not null,
  role               text not null
                       check (role in ('evaluator', 'jury')),
  round2_attendance  text not null default 'absent'
                       check (round2_attendance in ('present', 'absent')),
  created_at         timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 6. round1_assignments
--    Which evaluator is assigned to which team for Round 1.
-- ---------------------------------------------------------------------------
create table round1_assignments (
  id            uuid primary key default gen_random_uuid(),
  evaluator_id  uuid not null references evaluators (id) on delete cascade,
  team_id       uuid not null references teams (id)      on delete cascade,
  event_id      uuid not null references events (id)     on delete cascade,
  assigned_at   timestamptz not null default now(),
  unique (team_id, evaluator_id)
);

create index idx_r1assign_evaluator on round1_assignments (evaluator_id);
create index idx_r1assign_team      on round1_assignments (team_id);

-- ---------------------------------------------------------------------------
-- 7. round1_scores
--    Per-criterion scores submitted by an evaluator for a team in Round 1.
-- ---------------------------------------------------------------------------
create table round1_scores (
  id            uuid primary key default gen_random_uuid(),
  evaluator_id  uuid    not null references evaluators (id) on delete cascade,
  team_id       uuid    not null references teams (id)      on delete cascade,
  criteria_id   uuid    not null references criteria (id)   on delete cascade,
  score         numeric not null check (score >= 0),
  submitted_at  timestamptz not null default now(),
  unique (team_id, evaluator_id, criteria_id)
);

create index idx_r1scores_evaluator on round1_scores (evaluator_id);
create index idx_r1scores_team      on round1_scores (team_id);

-- ---------------------------------------------------------------------------
-- 8. round1_comments
--    Free-text comments from an evaluator about a team in Round 1.
-- ---------------------------------------------------------------------------
create table round1_comments (
  id            uuid primary key default gen_random_uuid(),
  evaluator_id  uuid not null references evaluators (id) on delete cascade,
  team_id       uuid not null references teams (id)      on delete cascade,
  comment       text not null,
  created_at    timestamptz not null default now()
);

create index idx_r1comments_team on round1_comments (team_id);

-- ---------------------------------------------------------------------------
-- 9. round2_scores
--    Per-criterion scores submitted by a jury member for a team in Round 2.
--    Column name is jury_id to make the role intent explicit.
-- ---------------------------------------------------------------------------
create table round2_scores (
  id           uuid primary key default gen_random_uuid(),
  jury_id      uuid    not null references evaluators (id) on delete cascade,
  team_id      uuid    not null references teams (id)      on delete cascade,
  criteria_id  uuid    not null references criteria (id)   on delete cascade,
  score        numeric not null check (score >= 0),
  submitted_at timestamptz not null default now(),
  unique (team_id, jury_id, criteria_id)
);

create index idx_r2scores_jury on round2_scores (jury_id);
create index idx_r2scores_team on round2_scores (team_id);

-- ---------------------------------------------------------------------------
-- 10. round2_comments
--     Free-text comments from a jury member about a team in Round 2.
-- ---------------------------------------------------------------------------
create table round2_comments (
  id          uuid primary key default gen_random_uuid(),
  jury_id     uuid not null references evaluators (id) on delete cascade,
  team_id     uuid not null references teams (id)      on delete cascade,
  comment     text not null,
  created_at  timestamptz not null default now()
);

create index idx_r2comments_team on round2_comments (team_id);

-- ---------------------------------------------------------------------------
-- 11. audit_log
--     Immutable event log. Written by triggers; never mutated.
-- ---------------------------------------------------------------------------
create table audit_log (
  id            uuid primary key default gen_random_uuid(),
  table_name    text        not null,
  operation     text        not null check (operation in ('INSERT', 'UPDATE', 'DELETE')),
  row_id        uuid,
  old_value     jsonb,
  new_value     jsonb,
  performed_by  uuid,       -- auth.uid() at the time of the DML
  created_at    timestamptz not null default now()
);

-- Partial index for fast per-table querying
create index idx_audit_table_created on audit_log (table_name, created_at desc);

-- ---------------------------------------------------------------------------
-- 12. Views
-- ---------------------------------------------------------------------------

-- Average Round 1 score per team (across all evaluators and criteria)
create or replace view team_round1_average as
  select
    t.id          as team_id,
    t.team_name,
    t.event_id,
    round(avg(s.score), 2) as avg_score,
    count(distinct s.evaluator_id) as evaluator_count,
    count(s.id)   as score_count
  from teams t
  left join round1_scores s on s.team_id = t.id
  group by t.id, t.team_name, t.event_id;

-- Average Round 2 score per team (across all jury members and criteria)
create or replace view team_round2_average as
  select
    t.id          as team_id,
    t.team_name,
    t.event_id,
    round(avg(s.score), 2) as avg_score,
    count(distinct s.jury_id) as jury_count,
    count(s.id)   as score_count
  from teams t
  left join round2_scores s on s.team_id = t.id
  group by t.id, t.team_name, t.event_id;

-- ---------------------------------------------------------------------------
-- 13. updated_at auto-update trigger (shared helper)
-- ---------------------------------------------------------------------------
create or replace function fn_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_events_updated_at
  before update on events
  for each row execute function fn_set_updated_at();

create trigger trg_teams_updated_at
  before update on teams
  for each row execute function fn_set_updated_at();
