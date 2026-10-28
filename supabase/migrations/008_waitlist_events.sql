-- Progressive capture. Every single answer tap is written the moment it happens,
-- so a person who drops out half way is still visible instead of being lost.
-- Append only. Visitors may add rows and nothing else: no update, no select,
-- which is the same shape as the waitlist and waitlist_answers tables.
-- Paste the whole file into the Supabase SQL editor and run it.

create table if not exists public.waitlist_events (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  name       text,
  question   text not null,
  answer     text not null,
  created_at timestamptz not null default now()
);

create index if not exists waitlist_events_email_idx on public.waitlist_events (email);
create index if not exists waitlist_events_created_idx on public.waitlist_events (created_at desc);

create or replace function public.waitlist_events_normalise()
returns trigger language plpgsql as $$
begin
  new.email := lower(trim(new.email));
  new.name  := nullif(trim(coalesce(new.name,'')), '');
  return new;
end; $$;

drop trigger if exists waitlist_events_normalise on public.waitlist_events;
create trigger waitlist_events_normalise
  before insert on public.waitlist_events
  for each row execute function public.waitlist_events_normalise();

alter table public.waitlist_events enable row level security;

drop policy if exists "anyone can log an answer" on public.waitlist_events;
create policy "anyone can log an answer"
  on public.waitlist_events for insert to anon, authenticated
  with check (true);

revoke all on public.waitlist_events from anon, authenticated, public;
grant insert on public.waitlist_events to anon, authenticated;
-- no select for anon: events are readable from the dashboard only

-- ---------------------------------------------------------------------------
-- One row per person, their latest answer to each question, and how far they
-- got. Dashboard only. This is the drop off report.
-- ---------------------------------------------------------------------------
create or replace view public.waitlist_progress as
with latest as (
  select distinct on (e.email, e.question)
    e.email,
    e.name,
    e.question,
    e.answer,
    e.created_at
  from public.waitlist_events e
  order by e.email, e.question, e.created_at desc
)
select
  min(name)                                                        as name,
  email,
  max(answer) filter (where question = 'ai_knowledge')             as ai_knowledge,
  max(answer) filter (where question = 'money_goal')               as money_goal,
  max(answer) filter (where question = 'would_use')                as would_use,
  max(answer) filter (where question = 'phone')                    as phone,
  count(*) filter (
    where question in ('ai_knowledge','money_goal','would_use','phone')
  )                                                                as steps_done,
  min(created_at)                                                  as first_answer_at,
  max(created_at)                                                  as last_answer_at
from latest
group by email
order by max(created_at) desc;

alter view public.waitlist_progress set (security_invoker = on);
revoke all on public.waitlist_progress from anon, authenticated, public;

-- Look at who is stalling:   select * from public.waitlist_progress;
