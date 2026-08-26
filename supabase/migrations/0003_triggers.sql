-- =============================================================================
-- Migration: 0003_triggers.sql
-- Description: Audit trigger that writes a row to audit_log on every
--              INSERT or UPDATE on round1_scores and round2_scores.
--
-- Captured data:
--   table_name   → name of the table that was mutated
--   operation    → 'INSERT' or 'UPDATE'
--   row_id       → primary key (id) of the affected row
--   old_value    → jsonb snapshot of OLD row (null on INSERT)
--   new_value    → jsonb snapshot of NEW row
--   performed_by → auth.uid() resolved at DML time via current_setting
--   created_at   → transaction timestamp (now())
--
-- Note on auth.uid() in triggers:
--   Supabase sets the JWT claims in the GUC (Grand Unified Configuration)
--   `request.jwt.claims`. We read the sub claim from there.
--   If the trigger fires from a service-role context (e.g., admin client),
--   the claim may be absent; performed_by will be NULL in that case.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Shared trigger function — used by both round1_scores and round2_scores
-- ---------------------------------------------------------------------------
create or replace function fn_audit_scores()
returns trigger
language plpgsql
security definer   -- runs with definer's privileges so it can always INSERT
set search_path = public
as $$
declare
  v_uid uuid;
begin
  -- Attempt to resolve the calling user from the Supabase JWT claim.
  -- Falls back gracefully to NULL if the claim is not set (e.g., service-role).
  begin
    v_uid := (
      current_setting('request.jwt.claims', true)::jsonb ->> 'sub'
    )::uuid;
  exception
    when others then
      v_uid := null;
  end;

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
    new.id,
    case when TG_OP = 'UPDATE' then to_jsonb(old) else null end,
    to_jsonb(new),
    v_uid,
    now()
  );

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Trigger on round1_scores
-- ---------------------------------------------------------------------------
create trigger trg_round1_scores_audit
  after insert or update
  on round1_scores
  for each row
  execute function fn_audit_scores();

-- ---------------------------------------------------------------------------
-- Trigger on round2_scores
-- ---------------------------------------------------------------------------
create trigger trg_round2_scores_audit
  after insert or update
  on round2_scores
  for each row
  execute function fn_audit_scores();
