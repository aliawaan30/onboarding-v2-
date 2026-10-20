-- FIRST RUN VERSION. Creates only new things.
-- Nothing here drops, deletes, alters or changes permissions on your existing
-- waitlist table. The only mention of it is a read inside the view at the end.

-- 1. the new table the answers go into
create table if not exists public.waitlist_answers (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  ai_knowledge text,
  money_goal   text,
  would_use    text,
  phone        text,
  completed    boolean not null default false,
  source       text default '',
  created_at   timestamptz not null default now()
);

create index if not exists waitlist_answers_email_idx on public.waitlist_answers (email);

-- 2. tidy the email and phone as they come in (new table only)
create or replace function public.waitlist_answers_normalise()
returns trigger language plpgsql as $$
begin
  new.email := lower(trim(new.email));
  new.phone := nullif(trim(coalesce(new.phone,'')), '');
  return new;
end; $$;

create trigger waitlist_answers_normalise
  before insert on public.waitlist_answers
  for each row execute function public.waitlist_answers_normalise();

-- 3. lock the new table down: visitors can add answers, nobody can read them
alter table public.waitlist_answers enable row level security;

create policy "anyone can answer"
  on public.waitlist_answers for insert to anon, authenticated
  with check (true);

grant insert on public.waitlist_answers to anon, authenticated;

-- 4. the view you actually read. This only SELECTS from waitlist, never changes it.
create view public.waitlist_full as
select
  w.name,
  w.email,
  w.source        as came_from,
  a.ai_knowledge,
  a.money_goal,
  a.would_use,
  a.phone,
  a.completed     as finished_questions,
  w.created_at    as joined_at
from public.waitlist w
left join lateral (
  select * from public.waitlist_answers x
  where x.email = w.email
  order by x.completed desc, x.created_at desc
  limit 1
) a on true
order by w.created_at desc;

-- Your list, one row per person:
--   select * from public.waitlist_full;
