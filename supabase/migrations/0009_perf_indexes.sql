-- =============================================================================
-- Migration: 0009_perf_indexes.sql
-- Description: Targeted performance indexes for dashboard sorting and range pagination
-- =============================================================================

-- Fast global audit log sorting for dashboard & audit page
create index if not exists idx_audit_created_at
  on audit_log (created_at desc);

-- Fast paginated sorting for evaluators and teams
create index if not exists idx_evaluators_created_at
  on evaluators (created_at desc);

create index if not exists idx_teams_created_at
  on teams (created_at desc);

-- Fast assignment sorting for mapping page
create index if not exists idx_r1assign_assigned_at
  on round1_assignments (assigned_at desc);

create index if not exists idx_r2assign_assigned_at
  on round2_assignments (assigned_at desc);
