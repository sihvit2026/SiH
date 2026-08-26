-- =============================================================================
-- Migration: 0010_additional_perf_indexes.sql
-- Description: Additional performance indexes for dashboard queries
-- =============================================================================

-- Fast pagination/sorting for teams by created_at (admin dashboard)
create index if not exists idx_teams_created_at
  on teams (created_at desc);

-- Fast sorting for audit_log by created_at without table_name filter (admin dashboard)
create index if not exists idx_audit_created_at_desc
  on audit_log (created_at desc);

-- Fast lookup for profiles by id (already PK, but ensure RLS uses it efficiently)
-- No additional index needed - id is primary key

-- Fast lookup for evaluators by id (already PK)
-- No additional index needed

-- Composite index for round1_assignments with team join (admin/assignments page)
create index if not exists idx_r1assign_team_assigned
  on round1_assignments (team_id, assigned_at desc);

-- Composite index for round2_assignments with team join (admin/assignments page)
create index if not exists idx_r2assign_team_assigned
  on round2_assignments (team_id, assigned_at desc);

-- Index for round1_scores by team_id + evaluator_id (evaluation form)
create index if not exists idx_r1scores_team_evaluator
  on round1_scores (team_id, evaluator_id);

-- Index for round2_scores by team_id + jury_id (evaluation form)
create index if not exists idx_r2scores_team_jury
  on round2_scores (team_id, jury_id);

-- Index for problem_statements by event_id (admin/problem-statements)
create index if not exists idx_ps_event_id
  on problem_statements (event_id);