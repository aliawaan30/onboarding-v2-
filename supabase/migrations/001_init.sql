-- Start Your AI Agency: onboarding portal schema
-- Invite only. There is no self signup. Blake creates a row per student with
-- invite_student(), then the student signs in with a magic link to that email.
--
-- Apply this by pasting the whole file into the Supabase SQL editor and running it.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------

create table if not exists public.students (
  id           uuid primary key default gen_random_uuid(),
  email        text not null unique,
  first_name   text not null,
  agent_name   text,                                  -- null until step 3 is done
  setup_code   text not null,                         -- WORD-WORD-NN, e.g. GREEN-LIGHT-47
  current_step int  not null default 0,               -- steps completed, 0 to 8
  gates        jsonb not null default '{}'::jsonb,    -- per step gate state
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on column public.students.gates is
  'Per step gate state, keyed by step number as text, e.g. {"1": true, "2": true}. Also holds ui flags such as confetti_shown.';

-- Emails are always stored lowercase so they match auth.jwt() ->> ''email''.
create or replace function public.students_normalise_email()
returns trigger
language plpgsql
as $$
begin
  new.email := lower(trim(new.email));
  return new;
end;
$$;

drop trigger if exists students_normalise_email on public.students;
create trigger students_normalise_email
  before insert on public.students
  for each row execute function public.students_normalise_email();

-- ---------------------------------------------------------------------------
-- Immutability guard: a student can never change their own email or setup code
-- ---------------------------------------------------------------------------

create or replace function public.students_guard_immutable()
returns trigger
language plpgsql
as $$
begin
  new.id         := old.id;
  new.email      := old.email;
  new.first_name := old.first_name;
  new.setup_code := old.setup_code;
  new.created_at := old.created_at;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists students_guard_immutable on public.students;
create trigger students_guard_immutable
  before update on public.students
  for each row execute function public.students_guard_immutable();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.students enable row level security;

drop policy if exists "students select own row" on public.students;
create policy "students select own row"
  on public.students
  for select
  to authenticated
  using (email = lower(auth.jwt() ->> 'email'));

drop policy if exists "students update own row" on public.students;
create policy "students update own row"
  on public.students
  for update
  to authenticated
  using (email = lower(auth.jwt() ->> 'email'))
  with check (email = lower(auth.jwt() ->> 'email'));

-- No insert policy and no delete policy: only Blake creates rows, from the SQL
-- editor, via invite_student().

-- Column level grants, belt and braces on top of the trigger above.
revoke all on public.students from anon, authenticated;
grant select on public.students to authenticated;
grant update (agent_name, current_step, gates) on public.students to authenticated;

-- ---------------------------------------------------------------------------
-- invite_student(): run this from the SQL editor to invite someone
--   select * from invite_student('sam@example.com', 'Sam');
-- ---------------------------------------------------------------------------

create or replace function public.invite_student(p_email text, p_first_name text)
returns public.students
language plpgsql
security definer
set search_path = public
as $$
declare
  v_words text[] := array[
    'GREEN','LIGHT','SOLID','READY','FIRST','CLIENT','SHARP','NORTH','STEADY','BRIGHT',
    'CLEAR','STRONG','QUICK','HONEST','CALM','BOLD','FRESH','PRIME','TRUE','ANCHOR',
    'SIGNAL','SUMMIT','ENGINE','LADDER','COMPASS','HARBOUR','RUNWAY','BEACON','MOMENTUM','GROUND'
  ];
  v_n     int := array_length(v_words, 1);
  v_code  text;
  v_row   public.students;
begin
  if p_email is null or trim(p_email) = '' then
    raise exception 'email is required';
  end if;
  if p_first_name is null or trim(p_first_name) = '' then
    raise exception 'first_name is required';
  end if;

  loop
    v_code :=
      v_words[1 + floor(random() * v_n)::int] || '-' ||
      v_words[1 + floor(random() * v_n)::int] || '-' ||
      lpad((10 + floor(random() * 90))::int::text, 2, '0');
    exit when not exists (select 1 from public.students s where s.setup_code = v_code);
  end loop;

  insert into public.students (email, first_name, setup_code)
  values (lower(trim(p_email)), trim(p_first_name), v_code)
  returning * into v_row;

  return v_row;
end;
$$;

-- Only the SQL editor / service role may invite. Never the browser.
revoke all on function public.invite_student(text, text) from public, anon, authenticated;
