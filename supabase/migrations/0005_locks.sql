-- =============================================================================
-- Migration: 0005_locks.sql
-- Description: Scorecard locking table and restrictive policies for final submissions
-- =============================================================================

create table if not exists evaluation_locks (
  id            uuid        primary key default gen_random_uuid(),
  evaluator_id  uuid        not null references evaluators(id) on delete cascade,
  team_id       uuid        not null references teams(id) on delete cascade,
  round         int         not null check (round in (1, 2)),
  status        text        not null default 'locked' check (status in ('locked', 'reopened')),
  reopen_reason text,
  locked_at     timestamptz not null default now(),
  unique (evaluator_id, team_id, round)
);

alter table evaluation_locks enable row level security;

-- Users can read evaluation locks relevant to them
create policy "Users can read evaluation locks"
  on evaluation_locks for select
  to authenticated
  using (evaluator_id = auth.uid() or fn_auth_user_role() in ('admin', 'data_operator'));

-- Evaluators can insert locks when finalizing their submission
create policy "Evaluators can insert locks"
  on evaluation_locks for insert
  to authenticated
  with check (evaluator_id = auth.uid() and status = 'locked');

-- Admins can update/manage locks (e.g., to reopen an evaluation)
create policy "Admins can manage locks"
  on evaluation_locks for all
  to authenticated
  using (fn_auth_user_role() in ('admin', 'data_operator'));

-- Restrictive policies to prevent modification of locked scores
create policy "Restrict locked Round 1 scores update"
  on round1_scores as restrictive for update
  to authenticated
  using (
    not exists (
      select 1 from evaluation_locks l
      where l.evaluator_id = round1_scores.evaluator_id
        and l.team_id = round1_scores.team_id
        and l.round = 1
        and l.status = 'locked'
    )
    or fn_auth_user_role() in ('admin', 'data_operator')
  );

create policy "Restrict locked Round 2 scores update"
  on round2_scores as restrictive for update
  to authenticated
  using (
    not exists (
      select 1 from evaluation_locks l
      where l.evaluator_id = round2_scores.jury_id
        and l.team_id = round2_scores.team_id
        and l.round = 2
        and l.status = 'locked'
    )
    or fn_auth_user_role() in ('admin', 'data_operator')
  );
