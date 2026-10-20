-- Onboarding paths: business owners and AI agency builders.
-- Adds the path each student picks at the top of the onboarding page.
-- Additive only. Run once in the Supabase SQL editor.

alter table public.students
  add column if not exists path text check (path in ('agency', 'business'));

comment on column public.students.path is
  'Onboarding path picked at the top of the page: agency or business. Null until picked.';

-- Anyone who started before paths existed stays on the agency path,
-- so nobody sees the choice halfway through their setup.
update public.students
set path = 'agency'
where path is null
  and (current_step > 0 or gates <> '{}'::jsonb);

-- Students can set their own path, nothing else new.
grant update (path) on public.students to authenticated;
