-- Questions asked AFTER the email is banked.
-- Answers go in their own table so anon never needs UPDATE rights on the
-- waitlist (that would let any visitor overwrite anyone else's row).
-- Paste the whole file into the Supabase SQL editor and run it.

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

create or replace function public.waitlist_answers_normalise()
returns trigger language plpgsql as $$
begin
  new.email := lower(trim(new.email));
  new.phone := nullif(trim(coalesce(new.phone,'')), '');
  return new;
end; $$;

drop trigger if exists waitlist_answers_normalise on public.waitlist_answers;
create trigger waitlist_answers_normalise
  before insert on public.waitlist_answers
  for each row execute function public.waitlist_answers_normalise();

alter table public.waitlist_answers enable row level security;

drop policy if exists "anyone can answer" on public.waitlist_answers;
create policy "anyone can answer"
  on public.waitlist_answers for insert to anon, authenticated
  with check (true);

revoke all on public.waitlist_answers from anon, authenticated;
grant insert on public.waitlist_answers to anon, authenticated;
-- no select for anon: answers are readable from the dashboard only

-- ---------------------------------------------------------------------------
-- One row per person, latest answers attached. This is the table to look at.
-- ---------------------------------------------------------------------------
create or replace view public.waitlist_full as
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

revoke all on public.waitlist_full from anon, authenticated;

-- Look at your list:   select * from public.waitlist_full;
