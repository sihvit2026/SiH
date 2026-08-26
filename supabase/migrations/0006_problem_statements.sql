-- =============================================================================
-- Migration: 0006_problem_statements.sql
-- Description:
--   1. Create problem_statements table.
--   2. Link teams to problem statements.
--   3. Add leader flag to students.
--   4. Prevent multiple leaders in the same team.
--   5. Add indexes for common lookups.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Problem Statements
-- ---------------------------------------------------------------------------
create table problem_statements (
  id uuid primary key default gen_random_uuid(),

  event_id uuid not null
    references events(id)
    on delete cascade,

  statement_code text not null,
  title text not null,
  category text,
  theme text,
  organization text,
  description text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint problem_statements_event_code_unique
    unique (event_id, statement_code)
);

-- Fast lookup by event
create index idx_problem_statements_event_id
  on problem_statements (event_id);

-- Fast lookup by PS code
create index idx_problem_statements_statement_code
  on problem_statements (statement_code);

-- Updated-at trigger
create trigger trg_problem_statements_updated_at
  before update on problem_statements
  for each row
  execute function fn_set_updated_at();


-- ---------------------------------------------------------------------------
-- 2. Enable RLS
-- ---------------------------------------------------------------------------
alter table problem_statements enable row level security;


-- ---------------------------------------------------------------------------
-- 3. Teams -> Problem Statement
-- ---------------------------------------------------------------------------
alter table teams
  add column problem_statement_id uuid
  references problem_statements(id)
  on delete set null;

create index idx_teams_problem_statement_id
  on teams (problem_statement_id);


-- ---------------------------------------------------------------------------
-- 4. Students -> Leader flag
-- ---------------------------------------------------------------------------
alter table students
  add column is_leader boolean not null default false;


-- ---------------------------------------------------------------------------
-- 5. Prevent more than one leader per team
-- ---------------------------------------------------------------------------
create unique index idx_students_one_leader_per_team
  on students (team_id)
  where is_leader = true;