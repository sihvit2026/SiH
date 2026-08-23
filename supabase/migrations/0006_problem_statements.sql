-- =============================================================================
-- Migration: 0006_problem_statements.sql
-- Description: Add problem_statements table and map it to teams. Also add is_leader to students.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. problem_statements
--    Stores the SIH problem statements for the event.
-- ---------------------------------------------------------------------------
create table problem_statements (
  id             uuid primary key default gen_random_uuid(),
  event_id       uuid not null references events(id) on delete cascade,
  statement_code text not null,
  title          text not null,
  category       text,
  theme          text,
  organization   text,
  description    text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique(event_id, statement_code)
);

-- Index for efficient querying by event
create index idx_ps_event on problem_statements (event_id);

-- Attach the updated_at trigger
create trigger trg_ps_updated_at
  before update on problem_statements
  for each row execute function fn_set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. Alter Teams
--    Add problem_statement_id to link teams to problem statements.
-- ---------------------------------------------------------------------------
alter table teams 
  add column problem_statement_id uuid references problem_statements(id) on delete set null;

create index idx_teams_ps on teams (problem_statement_id);

-- ---------------------------------------------------------------------------
-- 3. Alter Students
--    Add is_leader flag to distinguish team leaders.
-- ---------------------------------------------------------------------------
alter table students 
  add column is_leader boolean not null default false;
