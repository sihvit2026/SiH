-- =============================================================================
-- Migration: 0002_rls.sql
-- Description: Enable Row-Level Security on all tables and define policies.
--
-- Access model summary
-- ─────────────────────────────────────────────────────────────────────────────
-- Role 'evaluator'
--   • Can see only their own evaluator row.
--   • Can see only events and criteria (global reference data).
--   • Can see only teams that appear in their round1_assignments.
--   • Can see only students belonging to those assigned teams.
--   • Can see only their own round1_assignments.
--   • Can SELECT / INSERT / UPDATE only their own round1_scores rows,
--     and only when a matching round1_assignments row exists.
--   • Can SELECT / INSERT / UPDATE only their own round1_comments rows,
--     and only when a matching round1_assignments row exists.
--   • Cannot read or write any Round 2 data.
--
-- Role 'jury'
--   • Can see only their own evaluator row.
--   • Can see events and criteria (global reference data).
--   • Can see shortlisted teams only.
--   • Can see students of shortlisted teams only.
--   • Cannot see round1_assignments (no policy → denied).
--   • Cannot see any Round 1 scores or comments.
--   • Can SELECT only their own round2_scores / round2_comments.
--   • Can INSERT / UPDATE round2_scores / round2_comments only when:
--       evaluators.round2_attendance = 'present'   AND
--       teams.status = 'shortlisted'
--
-- Admin / server-side
--   • Uses service-role key (createAdminClient) which bypasses RLS entirely.
--   • No 'admin' role is defined in the schema; service-role is sufficient.
--
-- audit_log
--   • Written exclusively by fn_audit_scores() SECURITY DEFINER trigger.
--   • No authenticated-user policy is granted (direct inserts are blocked).
--   • Read access via admin client (service-role) in Route Handlers only.
-- =============================================================================


-- =============================================================================
-- SECTION 0 — Enable RLS on every table
-- =============================================================================

alter table events             enable row level security;
alter table criteria           enable row level security;
alter table teams              enable row level security;
alter table students           enable row level security;
alter table evaluators         enable row level security;
alter table round1_assignments enable row level security;
alter table round1_scores      enable row level security;
alter table round1_comments    enable row level security;
alter table round2_scores      enable row level security;
alter table round2_comments    enable row level security;
alter table audit_log          enable row level security;


-- =============================================================================
-- SECTION 1 — SECURITY DEFINER helper functions
--
-- Why SECURITY DEFINER here?
-- Once evaluators has a restrictive SELECT policy (own-row-only), any
-- subquery on evaluators from a policy on another table triggers evaluators
-- RLS and creates a cross-table RLS chain that is:
--   (a) fragile — tightening evaluators policy would silently break downstream
--   (b) repeated — fn_auth_role() is needed in 8+ policy expressions
-- Similarly, round1_assignments has its own RLS; checking it from teams /
-- students / round1_scores policies creates a two-hop chain per row.
-- SECURITY DEFINER functions bypass RLS on the tables they query internally,
-- eliminating the chain. Each function returns only a boolean or a safe scalar
-- — no sensitive row data is leaked.
-- =============================================================================

-- fn_auth_role()
-- Returns the 'role' column from evaluators for the current auth.uid().
-- Returns NULL if the user has no evaluator record.
-- SECURITY DEFINER: queries evaluators bypassing its RLS policy.
create or replace function fn_auth_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role
  from   evaluators
  where  id = auth.uid();
$$;

-- fn_auth_is_jury_present()
-- Returns true iff the current user is a jury member with round2_attendance = 'present'.
-- SECURITY DEFINER: queries evaluators bypassing its RLS policy.
create or replace function fn_auth_is_jury_present()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from   evaluators
    where  id                = auth.uid()
      and  role              = 'jury'
      and  round2_attendance = 'present'
  );
$$;

-- fn_auth_assigned_to_team(p_team_id)
-- Returns true iff the current user has a round1_assignments row for p_team_id.
-- SECURITY DEFINER: queries round1_assignments bypassing its RLS policy.
-- Used in teams / students / round1_scores / round1_comments policies to
-- avoid a two-hop chain: teams → round1_assignments RLS → evaluators RLS.
create or replace function fn_auth_assigned_to_team(p_team_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from   round1_assignments
    where  evaluator_id = auth.uid()
      and  team_id      = p_team_id
  );
$$;


-- =============================================================================
-- SECTION 2 — REFERENCE TABLES: events, criteria
-- Both evaluators and jury need to read events and criteria (global rubric).
-- No authenticated user may mutate these; service-role only.
-- =============================================================================

create policy "Authenticated users can read events"
  on events for select
  to authenticated
  using (true);

create policy "Authenticated users can read criteria"
  on criteria for select
  to authenticated
  using (true);


-- =============================================================================
-- SECTION 3 — teams
-- Evaluators: see only teams assigned to them via round1_assignments.
-- Jury:       see only shortlisted teams.
-- No authenticated user may mutate teams; service-role only.
-- =============================================================================

create policy "Evaluators see only assigned teams"
  on teams for select
  to authenticated
  using (
    fn_auth_role() = 'evaluator'
    and fn_auth_assigned_to_team(id)
  );

create policy "Jury see only shortlisted teams"
  on teams for select
  to authenticated
  using (
    fn_auth_role() = 'jury'
    and status = 'shortlisted'
  );


-- =============================================================================
-- SECTION 4 — students
-- Evaluators: see students of their assigned teams only.
-- Jury:       see students of shortlisted teams only.
-- No authenticated user may mutate students; service-role only.
-- =============================================================================

create policy "Evaluators see students of assigned teams"
  on students for select
  to authenticated
  using (
    fn_auth_role() = 'evaluator'
    and fn_auth_assigned_to_team(team_id)
  );

create policy "Jury see students of shortlisted teams"
  on students for select
  to authenticated
  using (
    fn_auth_role() = 'jury'
    and exists (
      select 1 from teams t
      where  t.id     = students.team_id
        and  t.status = 'shortlisted'
    )
  );


-- =============================================================================
-- SECTION 5 — evaluators
-- Each user sees ONLY their own row (id = auth.uid()).
-- Mutations are service-role only — admin sets roles and attendance.
-- =============================================================================

create policy "Users see only their own evaluator row"
  on evaluators for select
  to authenticated
  using (id = auth.uid());


-- =============================================================================
-- SECTION 6 — round1_assignments
-- Evaluators see only assignments where evaluator_id = auth.uid().
-- Role check ensures jury members cannot read assignment rows.
-- Mutations are service-role only.
-- =============================================================================

create policy "Evaluators see only own assignments"
  on round1_assignments for select
  to authenticated
  using (
    evaluator_id = auth.uid()
    and fn_auth_role() = 'evaluator'
  );


-- =============================================================================
-- SECTION 7 — round1_scores
-- Guard: evaluator_id = auth.uid()  AND  role = 'evaluator'  AND  assignment exists.
-- The assignment check uses fn_auth_assigned_to_team() (SECURITY DEFINER)
-- rather than a nested subquery to avoid the round1_scores →
-- round1_assignments RLS → fn_auth_role() three-hop chain.
-- =============================================================================

create policy "Evaluators can read own Round 1 scores"
  on round1_scores for select
  to authenticated
  using (
    evaluator_id = auth.uid()
    and fn_auth_role() = 'evaluator'
    and fn_auth_assigned_to_team(team_id)
  );

create policy "Evaluators can insert own Round 1 scores"
  on round1_scores for insert
  to authenticated
  with check (
    evaluator_id = auth.uid()
    and fn_auth_role() = 'evaluator'
    and fn_auth_assigned_to_team(team_id)
  );

create policy "Evaluators can update own Round 1 scores"
  on round1_scores for update
  to authenticated
  using (
    evaluator_id = auth.uid()
    and fn_auth_role() = 'evaluator'
    and fn_auth_assigned_to_team(team_id)
  )
  with check (
    evaluator_id = auth.uid()
    and fn_auth_role() = 'evaluator'
    and fn_auth_assigned_to_team(team_id)
  );


-- =============================================================================
-- SECTION 8 — round1_comments
-- Same guard as round1_scores: evaluator_id + role + assignment.
-- =============================================================================

create policy "Evaluators can read own Round 1 comments"
  on round1_comments for select
  to authenticated
  using (
    evaluator_id = auth.uid()
    and fn_auth_role() = 'evaluator'
    and fn_auth_assigned_to_team(team_id)
  );

create policy "Evaluators can insert own Round 1 comments"
  on round1_comments for insert
  to authenticated
  with check (
    evaluator_id = auth.uid()
    and fn_auth_role() = 'evaluator'
    and fn_auth_assigned_to_team(team_id)
  );

create policy "Evaluators can update own Round 1 comments"
  on round1_comments for update
  to authenticated
  using (
    evaluator_id = auth.uid()
    and fn_auth_role() = 'evaluator'
    and fn_auth_assigned_to_team(team_id)
  )
  with check (
    evaluator_id = auth.uid()
    and fn_auth_role() = 'evaluator'
    and fn_auth_assigned_to_team(team_id)
  );


-- =============================================================================
-- SECTION 9 — round2_scores
-- SELECT:        jury_id = auth.uid() AND role = 'jury'
-- INSERT/UPDATE: all SELECT conditions PLUS fn_auth_is_jury_present()
--                AND target team must be shortlisted.
--
-- The shortlisted-team check uses a direct subquery on teams rather than
-- fn_auth_assigned_to_team (which applies only to Round 1 assignments).
-- The subquery bypasses teams RLS? No — it does trigger teams RLS. Because
-- the jury's teams policy is "role = 'jury' AND status = 'shortlisted'",
-- and the subquery also filters status = 'shortlisted', they are consistent.
-- No recursion: round2_scores → teams (RLS: fn_auth_role() SECURITY DEFINER).
-- =============================================================================

create policy "Jury can read own Round 2 scores"
  on round2_scores for select
  to authenticated
  using (
    jury_id = auth.uid()
    and fn_auth_is_jury_present()
  );

create policy "Jury can insert Round 2 scores when eligible"
  on round2_scores for insert
  to authenticated
  with check (
    jury_id = auth.uid()
    and fn_auth_is_jury_present()
    and exists (
      select 1 from teams t
      where  t.id     = round2_scores.team_id
        and  t.status = 'shortlisted'
    )
  );

create policy "Jury can update Round 2 scores when eligible"
  on round2_scores for update
  to authenticated
  using (
    jury_id = auth.uid()
    and fn_auth_is_jury_present()
    and exists (
      select 1 from teams t
      where  t.id     = round2_scores.team_id
        and  t.status = 'shortlisted'
    )
  )
  with check (
    jury_id = auth.uid()
    and fn_auth_is_jury_present()
    and exists (
      select 1 from teams t
      where  t.id     = round2_scores.team_id
        and  t.status = 'shortlisted'
    )
  );


-- =============================================================================
-- SECTION 10 — round2_comments
-- Same guard as round2_scores.
-- =============================================================================

create policy "Jury can read own Round 2 comments"
  on round2_comments for select
  to authenticated
  using (
    jury_id = auth.uid()
    and fn_auth_is_jury_present()
  );

create policy "Jury can insert Round 2 comments when eligible"
  on round2_comments for insert
  to authenticated
  with check (
    jury_id = auth.uid()
    and fn_auth_is_jury_present()
    and exists (
      select 1 from teams t
      where  t.id     = round2_comments.team_id
        and  t.status = 'shortlisted'
    )
  );

create policy "Jury can update Round 2 comments when eligible"
  on round2_comments for update
  to authenticated
  using (
    jury_id = auth.uid()
    and fn_auth_is_jury_present()
    and exists (
      select 1 from teams t
      where  t.id     = round2_comments.team_id
        and  t.status = 'shortlisted'
    )
  )
  with check (
    jury_id = auth.uid()
    and fn_auth_is_jury_present()
    and exists (
      select 1 from teams t
      where  t.id     = round2_comments.team_id
        and  t.status = 'shortlisted'
    )
  );


-- =============================================================================
-- SECTION 11 — audit_log
-- No authenticated-user policies at all.
-- fn_audit_scores() is SECURITY DEFINER and inserts as its owner (bypasses RLS).
-- All reads go through the admin client (service-role) in Route Handlers.
-- Granting direct INSERT to authenticated users would allow fake audit entries
-- — intentionally not done.
-- =============================================================================

-- (No policies for the authenticated role — intentional.)
-- Service-role bypasses RLS automatically.
-- The SECURITY DEFINER trigger fn_audit_scores() also bypasses RLS.
