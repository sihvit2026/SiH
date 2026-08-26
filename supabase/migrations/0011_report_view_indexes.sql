-- =============================================================================
-- Migration: 0011_report_view_indexes.sql
-- Description: Indexes to optimize team_round1_average and team_round2_average views
-- =============================================================================

-- Covering index for round1_scores to optimize the team_round1_average view
-- The view does: LEFT JOIN round1_scores ON team_id, then GROUP BY team_id with AVG(score)
create index if not exists idx_r1scores_team_score
  on round1_scores (team_id, score);

-- Covering index for round2_scores to optimize the team_round2_average view
create index if not exists idx_r2scores_team_score
  on round2_scores (team_id, score);

-- Index for round1_scores by evaluator_id + team_id (for distinct count)
create index if not exists idx_r1scores_evaluator_team
  on round1_scores (evaluator_id, team_id);

-- Index for round2_scores by jury_id + team_id (for distinct count)
create index if not exists idx_r2scores_jury_team
  on round2_scores (jury_id, team_id);

-- Composite index for teams by event_id + created_at (reports filtering)
create index if not exists idx_teams_event_created
  on teams (event_id, created_at desc);