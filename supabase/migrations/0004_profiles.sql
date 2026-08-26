-- =============================================================================
-- Migration: 0004_profiles.sql
-- Description: User profiles table and role resolution for non-evaluator roles
--              (admin, data_operator, viewer)
-- =============================================================================

create table if not exists profiles (
  id          uuid        primary key references auth.users (id) on delete cascade,
  email       text,
  name        text        not null,
  role        text        not null check (role in ('admin', 'data_operator', 'evaluator', 'jury', 'viewer')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table profiles enable row level security;

-- Users can read their own profile
create policy "Users can read own profile"
  on profiles for select
  to authenticated
  using (id = auth.uid());

-- Helper function to resolve the current user's role across profiles and evaluators tables
create or replace function fn_auth_user_role()
returns text language sql security definer set search_path = public as $$
  select coalesce(
    (select role from profiles where id = auth.uid()),
    (select role from evaluators where id = auth.uid()),
    'viewer'
  );
$$;
