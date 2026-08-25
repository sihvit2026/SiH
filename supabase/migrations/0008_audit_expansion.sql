-- =============================================================================
-- Migration: 0008_audit_expansion.sql
-- Purpose:
--   Expand audit coverage across administrative and evaluation tables.
--
-- Audited:
--   teams
--   students
--   problem_statements
--   evaluators
--   criteria
--   round1_assignments
--   round2_assignments
--   round1_scores
--   round2_scores
--   round1_comments
--   round2_comments
--   evaluation_locks
--
-- Supports:
--   INSERT
--   UPDATE
--   DELETE
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. Generic immutable audit trigger function
-- ---------------------------------------------------------------------------

create or replace function fn_audit_dml()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_row_id uuid;
begin

  /*
   * Attempt to identify the authenticated Supabase user.
   *
   * When the mutation is performed through the service-role client,
   * request.jwt.claims may be unavailable. In that case performed_by
   * remains NULL rather than inventing an identity.
   */
  begin
    v_uid := (
      current_setting(
        'request.jwt.claims',
        true
      )::jsonb ->> 'sub'
    )::uuid;
  exception
    when others then
      v_uid := null;
  end;

  /*
   * INSERT / UPDATE use NEW.
   * DELETE uses OLD.
   */
  if TG_OP = 'DELETE' then
    v_row_id := OLD.id;
  else
    v_row_id := NEW.id;
  end if;

  insert into audit_log (
    table_name,
    operation,
    row_id,
    old_value,
    new_value,
    performed_by,
    created_at
  )
  values (
    TG_TABLE_NAME,
    TG_OP,
    v_row_id,
    case
      when TG_OP in ('UPDATE', 'DELETE')
        then to_jsonb(OLD)
      else null
    end,
    case
      when TG_OP in ('INSERT', 'UPDATE')
        then to_jsonb(NEW)
      else null
    end,
    v_uid,
    now()
  );

  /*
   * RETURN OLD for DELETE, NEW otherwise.
   */
  if TG_OP = 'DELETE' then
    return OLD;
  end if;

  return NEW;
end;
$$;


-- ---------------------------------------------------------------------------
-- 2. Remove the old score-only audit triggers.
-- ---------------------------------------------------------------------------

drop trigger if exists trg_round1_scores_audit
on round1_scores;

drop trigger if exists trg_round2_scores_audit
on round2_scores;


-- ---------------------------------------------------------------------------
-- 3. Create audit triggers for important administrative/evaluation tables.
-- ---------------------------------------------------------------------------


-- Teams
drop trigger if exists trg_teams_audit on teams;

create trigger trg_teams_audit
after insert or update or delete
on teams
for each row
execute function fn_audit_dml();


-- Students
drop trigger if exists trg_students_audit on students;

create trigger trg_students_audit
after insert or update or delete
on students
for each row
execute function fn_audit_dml();


-- Problem Statements
drop trigger if exists trg_problem_statements_audit
on problem_statements;

create trigger trg_problem_statements_audit
after insert or update or delete
on problem_statements
for each row
execute function fn_audit_dml();


-- Evaluators / Jury
drop trigger if exists trg_evaluators_audit
on evaluators;

create trigger trg_evaluators_audit
after insert or update or delete
on evaluators
for each row
execute function fn_audit_dml();


-- Criteria
drop trigger if exists trg_criteria_audit
on criteria;

create trigger trg_criteria_audit
after insert or update or delete
on criteria
for each row
execute function fn_audit_dml();


-- Round 1 assignment
drop trigger if exists trg_round1_assignments_audit
on round1_assignments;

create trigger trg_round1_assignments_audit
after insert or update or delete
on round1_assignments
for each row
execute function fn_audit_dml();


-- Round 2 assignment
drop trigger if exists trg_round2_assignments_audit
on round2_assignments;

create trigger trg_round2_assignments_audit
after insert or update or delete
on round2_assignments
for each row
execute function fn_audit_dml();


-- Round 1 scores
create trigger trg_round1_scores_audit_v2
after insert or update or delete
on round1_scores
for each row
execute function fn_audit_dml();


-- Round 2 scores
create trigger trg_round2_scores_audit_v2
after insert or update or delete
on round2_scores
for each row
execute function fn_audit_dml();


-- Round 1 comments
drop trigger if exists trg_round1_comments_audit
on round1_comments;

create trigger trg_round1_comments_audit
after insert or update or delete
on round1_comments
for each row
execute function fn_audit_dml();


-- Round 2 comments
drop trigger if exists trg_round2_comments_audit
on round2_comments;

create trigger trg_round2_comments_audit
after insert or update or delete
on round2_comments
for each row
execute function fn_audit_dml();


-- Evaluation locks
drop trigger if exists trg_evaluation_locks_audit
on evaluation_locks;

create trigger trg_evaluation_locks_audit
after insert or update or delete
on evaluation_locks
for each row
execute function fn_audit_dml();


-- ---------------------------------------------------------------------------
-- 4. Protect audit_log from UPDATE/DELETE.
-- ---------------------------------------------------------------------------

create or replace function fn_prevent_audit_mutation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  raise exception 'audit_log is immutable';
end;
$$;


drop trigger if exists trg_audit_log_immutable_update
on audit_log;

create trigger trg_audit_log_immutable_update
before update or delete
on audit_log
for each row
execute function fn_prevent_audit_mutation();


-- ---------------------------------------------------------------------------
-- 5. Supporting index for user/action investigations.
-- ---------------------------------------------------------------------------

create index if not exists idx_audit_performed_by_created
on audit_log (performed_by, created_at desc);

create index if not exists idx_audit_operation_created
on audit_log (operation, created_at desc);