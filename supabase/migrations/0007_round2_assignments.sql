-- =============================================================================
-- Migration: 0007_round2_assignments.sql
-- Purpose: Map shortlisted teams to Round 2 jury members.
-- =============================================================================

create table round2_assignments (
  id uuid primary key default gen_random_uuid(),

  event_id uuid not null
    references events(id)
    on delete cascade,

  team_id uuid not null
    references teams(id)
    on delete cascade,

  jury_id uuid not null
    references evaluators(id)
    on delete cascade,

  assigned_at timestamptz not null default now(),

  unique(event_id, team_id, jury_id)
);

create index idx_round2_assignments_event
  on round2_assignments(event_id);

create index idx_round2_assignments_team
  on round2_assignments(team_id);

create index idx_round2_assignments_jury
  on round2_assignments(jury_id);

alter table round2_assignments enable row level security;